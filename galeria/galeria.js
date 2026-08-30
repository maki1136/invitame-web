/* ============================================================
   GALERÍA DE INVITADOS · lógica del cliente
   Producto propio: no toca nada de la invitación ni de inv_*.
   Datos: Firestore gal_eventos/{gid} y gal_fotos/{gid}/items.
   Archivos: suben al Worker (R2). Este archivo NO escribe
   en Firestore: el único que escribe fotos es el Worker.
   ============================================================ */

/* La URL del Worker de Cloudflare. */
const WORKER = 'https://galeria.littlemomentsok.workers.dev';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore, doc, getDoc, collection, query, where, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* Config pública del proyecto (la apiKey web no es secreta). */
const app = initializeApp({
  apiKey: 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc',
  authDomain: 'invitame-9b51f.firebaseapp.com',
  projectId: 'invitame-9b51f'
}, 'galeria');
const db = getFirestore(app);

/* ---------- utilidades ---------- */
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const GID = (params.get('g') || '').trim();

function toast(msg, ms) {
  const t = $('gal-toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, ms || 2600);
}
function esc(s) {
  return String(s || '').replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
}
/* Navegador embebido de Instagram / Facebook: rompe el selector de archivos. */
function esInApp() {
  const ua = navigator.userAgent || '';
  return /Instagram|FBAV|FBAN|FB_IAB/i.test(ua);
}

/* ---------- identidad del invitado ---------- */
/* Dos puertas: desde la invitación viene ?n=<nombre>&t=<token>;
   desde el QR se pide el nombre una vez y queda en localStorage. */
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function conseguirAutor(ev, cb) {
  const nUrl = (params.get('n') || '').trim();
  const tUrl = (params.get('t') || '').trim();
  if (nUrl) {
    const autor = { nombre: nUrl.slice(0, 40), origen: 'invitacion', token: tUrl || null };
    lsSet('gal_autor_' + GID, JSON.stringify(autor));
    return cb(autor);
  }
  const guardado = lsGet('gal_autor_' + GID);
  if (guardado) { try { return cb(JSON.parse(guardado)); } catch (e) {} }

  $('nom-titulo').textContent = ev.nombre ? ('¡Bienvenido a ' + ev.nombre + '!') : '¡Bienvenido!';
  $('gal-nombre').hidden = false;
  $('nom-ok').onclick = () => {
    const nombre = $('nom-input').value.trim();
    if (!nombre) { $('nom-input').focus(); return; }
    const autor = { nombre: nombre.slice(0, 40), origen: 'qr', token: null };
    lsSet('gal_autor_' + GID, JSON.stringify(autor));
    $('gal-nombre').hidden = true;
    cb(autor);
  };
}

/* ---------- compresión en el celular (LA pieza) ---------- */
/* 1600px de lado largo en WebP (~0.8) con fallback a JPEG.
   La orientación EXIF la resuelve createImageBitmap. Devuelve
   {foto, thumb, w, h} o tira 'ilegible' si el archivo no se
   puede decodificar (caso HEIC en navegadores que no lo abren). */
async function comprimir(file) {
  let bmp;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (e1) {
    /* Reintento sin opción (Safari viejo no la conoce). */
    try { bmp = await createImageBitmap(file); }
    catch (e2) { throw new Error('ilegible'); }
  }
  /* Escalera de calidad: una foto con papel picado o brillos comprime
     mal; se baja calidad y tamaño hasta entrar holgado en el tope. */
  let foto = await encajar(bmp, 1600, 0.8);
  if (foto.blob.size > 700 * 1024) foto = await encajar(bmp, 1600, 0.6);
  if (foto.blob.size > 700 * 1024) foto = await encajar(bmp, 1280, 0.55);
  if (foto.blob.size > 700 * 1024) foto = await encajar(bmp, 1024, 0.5);
  let thumb = await encajar(bmp, 320, 0.72);
  if (thumb.blob.size > 120 * 1024) thumb = await encajar(bmp, 320, 0.5);
  const r = { foto: foto.blob, thumb: thumb.blob, w: foto.w, h: foto.h };
  bmp.close && bmp.close();
  return r;
}
function encajar(bmp, lado, calidad) {
  const esc = Math.min(1, lado / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * esc));
  const h = Math.max(1, Math.round(bmp.height * esc));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  cv.getContext('2d').drawImage(bmp, 0, 0, w, h);
  return new Promise((res, rej) => {
    /* WebP primero; si el navegador no exporta WebP (Safari viejo) cae a JPEG. */
    cv.toBlob((b) => {
      if (b && b.type === 'image/webp') return res({ blob: b, w, h });
      cv.toBlob((j) => j ? res({ blob: j, w, h }) : rej(new Error('canvas')), 'image/jpeg', calidad);
    }, 'image/webp', calidad);
  });
}

/* ---------- la cola de subida (IndexedDB) ---------- */
/* Cada foto es un trabajo. Si se corta la señal o se bloquea el
   celular, el trabajo queda guardado y se retoma solo. */
const ESPERAS = [2000, 8000, 30000];
let idb = null;
function abrirIDB() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('gal-cola', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('cola', { keyPath: 'id' });
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
function idbTodos() {
  return new Promise((res) => {
    const rq = idb.transaction('cola').objectStore('cola').getAll();
    rq.onsuccess = () => res(rq.result || []);
    rq.onerror = () => res([]);
  });
}
function idbPoner(tr) {
  return new Promise((res) => {
    const rq = idb.transaction('cola', 'readwrite').objectStore('cola').put(tr);
    rq.onsuccess = res; rq.onerror = res;
  });
}
function idbBorrar(id) {
  return new Promise((res) => {
    const rq = idb.transaction('cola', 'readwrite').objectStore('cola').delete(id);
    rq.onsuccess = res; rq.onerror = res;
  });
}

let subiendoAhora = false;
async function procesarCola(autor) {
  if (subiendoAhora || !idb) return;
  subiendoAhora = true;
  try {
    let trabajos = (await idbTodos()).filter((t) => t.gid === GID);
    while (trabajos.length) {
      const t = trabajos[0];
      pintarCola(trabajos.length);
      const ok = await subirUno(t, autor);
      if (ok) {
        await idbBorrar(t.id);
        marcarCeldaSubida(t.id);
      } else {
        t.intentos = (t.intentos || 0) + 1;
        await idbPoner(t);
        if (t.intentos >= 6) {
          /* No la tiramos: queda en la cola y avisamos. */
          $('cola-aviso').textContent =
            'Hay fotos que no pudieron subir. Se van a reintentar solas cuando vuelva la señal.';
          $('cola-aviso').hidden = false;
          break;
        }
        await new Promise((r) => setTimeout(r, ESPERAS[Math.min(t.intentos - 1, 2)]));
      }
      trabajos = (await idbTodos()).filter((x) => x.gid === GID);
    }
    pintarCola(trabajos.length);
  } finally { subiendoAhora = false; }
}
function pintarCola(n) {
  const caja = $('cola-estado');
  if (!n) { caja.hidden = true; return; }
  $('cola-texto').textContent = n === 1 ? 'Subiendo tu foto…' : ('Subiendo… quedan ' + n);
  caja.hidden = false;
  if (n) $('cola-aviso').hidden = true;
}
async function subirUno(t, autor) {
  try {
    const fd = new FormData();
    fd.append('gid', t.gid);
    fd.append('autor', JSON.stringify(autor));
    fd.append('w', t.w); fd.append('h', t.h);
    fd.append('foto', t.foto, 'f.webp');
    fd.append('thumb', t.thumb, 't.webp');
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 45000);
    const r = await fetch(WORKER + '/subir', { method: 'POST', body: fd, signal: ctl.signal });
    clearTimeout(timer);
    if (r.status === 429) {
      const j = await r.json().catch(() => ({}));
      toast(j.error || 'Ya subiste muchas seguidas, esperá un ratito.', 4000);
      return false;
    }
    if (!r.ok) return false;
    return true;
  } catch (e) { return false; }
}

/* ---------- entrada de archivos ---------- */
let EV = null, AUTOR = null;
async function entraron(files) {
  if (!files || !files.length) return;
  if (files.length > 15) { toast('De a tandas de 15 como mucho 😉'); files = [...files].slice(0, 15); }
  for (const f of files) {
    if (!/^image\//.test(f.type) && !/\.(heic|heif|jpg|jpeg|png|webp)$/i.test(f.name || '')) {
      toast('Ese archivo no es una foto.'); continue;
    }
    let listo;
    try {
      listo = await comprimir(f);
    } catch (e) {
      /* HEIC (u otro formato) que este navegador no puede leer:
         guiamos a la cámara, que siempre entrega JPEG. */
      toast('Esa foto no se pudo leer acá. Probá con «Sacar una foto» 📷', 4200);
      continue;
    }
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    await idbPoner({ id, gid: GID, foto: listo.foto, thumb: listo.thumb, w: listo.w, h: listo.h, intentos: 0, ts: Date.now() });
    pintarCeldaLocal(id, listo.thumb);
  }
  procesarCola(AUTOR);
}

/* Celda provisoria mientras sube (si el modo es previa, al subir
   desaparece de acá y aparece cuando la aprueban). */
const celdasLocales = {};
function pintarCeldaLocal(id, blob) {
  const g = $('grilla');
  const b = document.createElement('button');
  b.className = 'celda mia subiendo';
  const img = document.createElement('img');
  img.src = URL.createObjectURL(blob);
  img.alt = 'Tu foto, subiendo';
  b.appendChild(img);
  g.prepend(b);
  celdasLocales[id] = b;
  $('gal-vacia').hidden = true;
}
function marcarCeldaSubida(id) {
  const b = celdasLocales[id];
  if (!b) return;
  b.classList.remove('subiendo');
  if (EV && EV.modo === 'previa') {
    toast('¡Listo! Tu foto va a aparecer apenas la aprueben 💛', 3400);
  }
}

/* ---------- la grilla en vivo ---------- */
const yaEnGrilla = {};
function escucharFotos() {
  const q = query(collection(db, 'gal_fotos', GID, 'items'), where('estado', '==', 'aprobada'));
  onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(Object.assign({ id: d.id }, d.data())));
    /* Orden en el cliente: evita índices compuestos. */
    docs.sort((a, b) => (b.tsms || 0) - (a.tsms || 0));
    const g = $('grilla');
    docs.forEach((f) => {
      if (yaEnGrilla[f.id]) return;
      yaEnGrilla[f.id] = true;
      const b = document.createElement('button');
      b.className = 'celda';
      b.dataset.fid = f.id;
      if (AUTOR && f.autor && f.autor.nombre === AUTOR.nombre) b.classList.add('mia');
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = WORKER + '/f/' + f.r2.thumb;
      img.alt = 'Foto de ' + esc(f.autor && f.autor.nombre || 'un invitado');
      b.appendChild(img);
      b.onclick = () => abrirVisor(f);
      g.prepend(b);
    });
    /* Las borradas por pánico desaparecen: rehacemos si falta alguna. */
    const vivos = {};
    docs.forEach((f) => { vivos[f.id] = true; });
    Object.keys(yaEnGrilla).forEach((id) => {
      if (!vivos[id]) {
        delete yaEnGrilla[id];
        [...g.children].forEach((c) => { if (c.dataset.fid === id) c.remove(); });
      }
    });
    $('gal-vacia').hidden = !!(docs.length || Object.keys(celdasLocales).length);
  }, (err) => {
    /* Sin permiso o sin red: la página no se rompe, solo no refresca. */
    console.warn('galeria: snapshot', err && err.code);
  });
}

function abrirVisor(f) {
  $('visor-img').src = WORKER + '/f/' + f.r2.key;
  $('visor-autor').textContent = f.autor && f.autor.nombre ? ('Foto de ' + f.autor.nombre) : '';
  const dl = $('visor-descargar');
  dl.href = WORKER + '/f/' + f.r2.key + '?dl=1';
  $('visor').hidden = false;
}
$('visor-cerrar').onclick = () => { $('visor').hidden = true; $('visor-img').src = ''; };
$('visor').onclick = (e) => { if (e.target === $('visor')) $('visor-cerrar').onclick(); };

/* ---------- ventana horaria ---------- */
function ventanaAbierta(ev) {
  const ahora = Date.now();
  const d = ev.ventana && ev.ventana.desde ? new Date(ev.ventana.desde).getTime() : 0;
  const h = ev.ventana && ev.ventana.hasta ? new Date(ev.ventana.hasta).getTime() : Infinity;
  return ahora >= d && ahora <= h;
}
function pintarVentana(ev) {
  const abierta = ventanaAbierta(ev) && ev.estado !== 'cerrada';
  $('botonera').style.display = abierta ? '' : 'none';
  const c = $('gal-cerrada');
  if (!abierta) {
    c.textContent = ev.estado === 'cerrada'
      ? 'La subida de fotos ya cerró. ¡Gracias por ser parte!'
      : 'La subida de fotos abre el día del evento. Ya podés mirar la galería.';
    c.hidden = false;
  } else { c.hidden = true; }
}

/* ---------- arranque ---------- */
(async function arrancar() {
  if (!GID) { $('gal-neutra').hidden = false; return; }

  let ev;
  try {
    const s = await getDoc(doc(db, 'gal_eventos', GID));
    if (!s.exists()) { $('gal-neutra').hidden = false; return; }
    ev = s.data();
  } catch (e) { $('gal-neutra').hidden = false; return; }
  EV = ev;

  /* La marca del evento pinta la página. */
  if (ev.marca) {
    if (ev.marca.color) document.documentElement.style.setProperty('--gal-acento', ev.marca.color);
    if (ev.marca.logo) { $('ev-logo').src = ev.marca.logo; $('ev-logo').hidden = false; }
  }
  document.title = (ev.nombre || 'Galería') + ' · Fotos';
  $('ev-nombre').textContent = ev.nombre || 'Nuestra fiesta';

  if (esInApp()) $('gal-inapp').hidden = false;

  idb = await abrirIDB().catch(() => null);

  conseguirAutor(ev, (autor) => {
    AUTOR = autor;
    $('ev-saludo').textContent = 'Hola, ' + autor.nombre + ' — tus fotos llevan tu firma.';
    $('gal-main').hidden = false;
    pintarVentana(ev);
    escucharFotos();

    $('in-camara').addEventListener('change', (e) => { entraron(e.target.files); e.target.value = ''; });
    $('in-elegir').addEventListener('change', (e) => { entraron(e.target.files); e.target.value = ''; });

    /* La cola retoma sola: al volver a la pestaña o al volver la señal. */
    procesarCola(autor);
    window.addEventListener('online', () => procesarCola(autor));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') procesarCola(autor);
    });
    setInterval(() => procesarCola(autor), 20000);
  });
})();
