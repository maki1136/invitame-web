/* ============================================================
   GALERÍA DE INVITADOS · lógica del cliente
   Producto propio: no toca nada de la invitación ni de inv_*.
   Datos: Firestore gal_eventos/{gid} y gal_fotos/{gid}/items.
   Archivos: suben al Worker (R2). Este archivo NO escribe
   en Firestore: el único que escribe fotos es el Worker.

   ⚠️ TRES REGLAS QUE SALIERON DE UN BUG REAL EN IPHONE (30/8/2026):
   1. En IndexedDB se guardan ArrayBuffer, NUNCA Blobs. iOS Safari
      tiene un bug viejo por el que un Blob guardado en IndexedDB
      vuelve vacío o roto, y la foto sube con 0 bytes.
   2. Un error 4xx del servidor es PERMANENTE: no se reintenta.
      Antes se reintentaba igual que un corte de señal y la foto
      quedaba "dando vueltas" para siempre sin decir nada.
   3. Todo lo que falla se MUESTRA. Nada se queda girando en
      silencio: o sube, o el invitado ve qué pasó y puede reintentar.
   ============================================================ */

const WORKER = 'https://galeria.littlemomentsok.workers.dev';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore, doc, getDoc, collection, query, where, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

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
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, ms || 2800);
}
function esc(s) {
  return String(s || '').replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
}
function esInApp() {
  const ua = navigator.userAgent || '';
  return /Instagram|FBAV|FBAN|FB_IAB/i.test(ua);
}

/* ---------- identidad del invitado ---------- */
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

  $('nom-titulo').textContent = ev.nombre || 'Bienvenido';
  $('gal-nombre').hidden = false;
  const entrar = () => {
    const nombre = $('nom-input').value.trim();
    if (!nombre) { $('nom-input').focus(); return; }
    const autor = { nombre: nombre.slice(0, 40), origen: 'qr', token: null };
    lsSet('gal_autor_' + GID, JSON.stringify(autor));
    $('gal-nombre').hidden = true;
    cb(autor);
  };
  $('nom-ok').onclick = entrar;
  $('nom-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') entrar(); });
}

/* ---------- compresión en el celular ---------- */
/* Devuelve ArrayBuffers, no Blobs: es lo único que IndexedDB
   guarda bien en todos los navegadores, iOS incluido. */
async function comprimir(file) {
  let bmp;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (e1) {
    try { bmp = await createImageBitmap(file); }
    catch (e2) { throw new Error('ilegible'); }
  }
  /* Escalera de calidad: apunto a 500 KB, bien lejos del tope del
     servidor (800 KB), para que ninguna foto rara lo pase. */
  let foto = await encajar(bmp, 1600, 0.78);
  if (foto.blob.size > 500 * 1024) foto = await encajar(bmp, 1600, 0.6);
  if (foto.blob.size > 500 * 1024) foto = await encajar(bmp, 1280, 0.55);
  if (foto.blob.size > 500 * 1024) foto = await encajar(bmp, 1024, 0.5);
  if (foto.blob.size > 500 * 1024) foto = await encajar(bmp, 800, 0.45);
  let thumb = await encajar(bmp, 320, 0.7);
  if (thumb.blob.size > 90 * 1024) thumb = await encajar(bmp, 320, 0.45);
  if (bmp.close) bmp.close();

  if (foto.blob.size < 1000) throw new Error('salió vacía');

  return {
    foto: await foto.blob.arrayBuffer(),
    thumb: await thumb.blob.arrayBuffer(),
    tipo: foto.blob.type || 'image/jpeg',
    tipoThumb: thumb.blob.type || 'image/jpeg',
    w: foto.w, h: foto.h
  };
}
function encajar(bmp, lado, calidad) {
  const f = Math.min(1, lado / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * f));
  const h = Math.max(1, Math.round(bmp.height * f));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  cx.drawImage(bmp, 0, 0, w, h);
  return new Promise((res, rej) => {
    cv.toBlob((b) => {
      /* Safari viejo devuelve PNG cuando no sabe exportar WebP: en ese
         caso pedimos JPEG, que sí entiende todo el mundo. */
      if (b && b.type === 'image/webp') return res({ blob: b, w, h });
      cv.toBlob((j) => j ? res({ blob: j, w, h }) : rej(new Error('canvas')), 'image/jpeg', calidad);
    }, 'image/webp', calidad);
  });
}

/* ---------- la cola de subida (IndexedDB con ArrayBuffers) ---------- */
const ESPERAS = [2000, 6000, 15000, 30000];
let idb = null;
function abrirIDB() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('gal-cola', 2);
    rq.onupgradeneeded = (e) => {
      const d = rq.result;
      /* La versión 1 guardaba Blobs (roto en iOS). Se descarta entera. */
      if (d.objectStoreNames.contains('cola')) d.deleteObjectStore('cola');
      d.createObjectStore('cola', { keyPath: 'id' });
    };
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
function idbTodos() {
  return new Promise((res) => {
    try {
      const rq = idb.transaction('cola').objectStore('cola').getAll();
      rq.onsuccess = () => res(rq.result || []);
      rq.onerror = () => res([]);
    } catch (e) { res([]); }
  });
}
function idbPoner(tr) {
  return new Promise((res) => {
    try {
      const rq = idb.transaction('cola', 'readwrite').objectStore('cola').put(tr);
      rq.onsuccess = res; rq.onerror = res;
    } catch (e) { res(); }
  });
}
function idbBorrar(id) {
  return new Promise((res) => {
    try {
      const rq = idb.transaction('cola', 'readwrite').objectStore('cola').delete(id);
      rq.onsuccess = res; rq.onerror = res;
    } catch (e) { res(); }
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
      const r = await subirUno(t, autor);

      if (r.ok) {
        await idbBorrar(t.id);
        marcarCelda(t.id, 'lista');
      } else if (r.permanente) {
        /* Error que no se arregla reintentando: se saca de la cola
           y se le dice al invitado qué pasó. Nunca queda girando. */
        await idbBorrar(t.id);
        marcarCelda(t.id, 'falló');
        avisar(r.motivo, true);
      } else {
        t.intentos = (t.intentos || 0) + 1;
        await idbPoner(t);
        if (t.intentos >= 5) {
          marcarCelda(t.id, 'espera');
          avisar('No hay señal para subir. Lo reintento solo cuando vuelva 📶', false);
          break;
        }
        await new Promise((x) => setTimeout(x, ESPERAS[Math.min(t.intentos - 1, 3)]));
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
  $('cola-aviso').hidden = true;
}
function avisar(texto, esError) {
  const a = $('cola-aviso');
  a.textContent = texto;
  a.classList.toggle('es-error', !!esError);
  a.hidden = false;
}

async function subirUno(t, autor) {
  try {
    const fd = new FormData();
    fd.append('gid', t.gid);
    fd.append('autor', JSON.stringify(autor));
    fd.append('w', t.w); fd.append('h', t.h);
    fd.append('foto', new Blob([t.foto], { type: t.tipo }), 'f');
    fd.append('thumb', new Blob([t.thumb], { type: t.tipoThumb }), 't');

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 60000);
    let r;
    try {
      r = await fetch(WORKER + '/subir', { method: 'POST', body: fd, signal: ctl.signal });
    } finally { clearTimeout(timer); }

    if (r.ok) return { ok: true };

    const j = await r.json().catch(() => ({}));

    /* 429 = "pará un poco": vale la pena reintentar más tarde. */
    if (r.status === 429) {
      avisar(j.error || 'Subiste muchas seguidas, esperá un ratito 😉', false);
      return { ok: false, permanente: false };
    }
    /* 4xx = la foto o el evento tienen un problema: reintentar no sirve. */
    if (r.status >= 400 && r.status < 500) {
      return { ok: false, permanente: true,
        motivo: j.error || ('El servidor no aceptó la foto (' + r.status + ')') };
    }
    /* 5xx o cualquier otra cosa: puede ser pasajero. */
    return { ok: false, permanente: false };
  } catch (e) {
    /* Sin red, o tardó más de un minuto: pasajero. */
    return { ok: false, permanente: false };
  }
}

/* ---------- entrada de archivos ---------- */
let EV = null, AUTOR = null;
async function entraron(files) {
  if (!files || !files.length) return;
  let lista = [...files];
  if (lista.length > 15) { toast('De a 15 como mucho 😉'); lista = lista.slice(0, 15); }

  for (const f of lista) {
    let listo;
    try {
      listo = await comprimir(f);
    } catch (e) {
      /* HEIC del iPhone que este navegador no puede abrir, o archivo raro. */
      avisar('Esa foto no se pudo leer en este teléfono. Probá con «Sacar una foto» 📷', true);
      continue;
    }
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    await idbPoner({
      id, gid: GID, foto: listo.foto, thumb: listo.thumb,
      tipo: listo.tipo, tipoThumb: listo.tipoThumb,
      w: listo.w, h: listo.h, intentos: 0, ts: Date.now()
    });
    pintarCeldaLocal(id, listo.thumb, listo.tipoThumb);
  }
  procesarCola(AUTOR);
}

/* ---------- celda provisoria mientras sube ---------- */
const celdasLocales = {};
function pintarCeldaLocal(id, buffer, tipo) {
  const g = $('grilla');
  const b = document.createElement('button');
  b.className = 'celda mia subiendo';
  b.type = 'button';
  const img = document.createElement('img');
  img.src = URL.createObjectURL(new Blob([buffer], { type: tipo }));
  img.alt = 'Tu foto, subiendo';
  b.appendChild(img);
  const capa = document.createElement('span');
  capa.className = 'estado-celda';
  b.appendChild(capa);
  g.prepend(b);
  celdasLocales[id] = b;
  $('gal-vacia').hidden = true;
}
function marcarCelda(id, comoQuedo) {
  const b = celdasLocales[id];
  if (!b) return;
  b.classList.remove('subiendo');
  if (comoQuedo === 'lista') {
    b.classList.add('ok');
    if (EV && EV.modo === 'previa') toast('¡Listo! Aparece apenas la aprueben 💛', 3600);
  } else if (comoQuedo === 'falló') {
    b.classList.add('error');
  } else {
    b.classList.add('espera');
  }
}

/* ---------- la grilla en vivo ---------- */
const yaEnGrilla = {};
function escucharFotos() {
  const q = query(collection(db, 'gal_fotos', GID, 'items'), where('estado', '==', 'aprobada'));
  onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(Object.assign({ id: d.id }, d.data())));
    docs.sort((a, b) => (b.tsms || 0) - (a.tsms || 0));
    const g = $('grilla');
    docs.forEach((f) => {
      if (yaEnGrilla[f.id]) return;
      yaEnGrilla[f.id] = true;
      const b = document.createElement('button');
      b.className = 'celda';
      b.type = 'button';
      b.dataset.fid = f.id;
      if (AUTOR && f.autor && f.autor.nombre === AUTOR.nombre) b.classList.add('mia');
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = WORKER + '/f/' + f.r2.thumb;
      img.alt = 'Foto de ' + esc((f.autor && f.autor.nombre) || 'un invitado');
      b.appendChild(img);
      b.onclick = () => abrirVisor(f);
      g.prepend(b);
    });
    const vivos = {};
    docs.forEach((f) => { vivos[f.id] = true; });
    Object.keys(yaEnGrilla).forEach((id) => {
      if (!vivos[id]) {
        delete yaEnGrilla[id];
        [...g.children].forEach((c) => { if (c.dataset.fid === id) c.remove(); });
      }
    });
    const hay = docs.length || Object.keys(celdasLocales).length;
    $('gal-vacia').hidden = !!hay;
    $('gal-cuenta').textContent = docs.length ? (docs.length + (docs.length === 1 ? ' foto' : ' fotos')) : '';
  }, (err) => {
    console.warn('galeria: snapshot', err && err.code);
  });
}

function abrirVisor(f) {
  $('visor-img').src = WORKER + '/f/' + f.r2.key;
  $('visor-autor').textContent = (f.autor && f.autor.nombre) ? ('Foto de ' + f.autor.nombre) : '';
  $('visor-descargar').href = WORKER + '/f/' + f.r2.key + '?dl=1';
  $('visor').hidden = false;
  document.body.style.overflow = 'hidden';
}
function cerrarVisor() {
  $('visor').hidden = true;
  $('visor-img').src = '';
  document.body.style.overflow = '';
}
$('visor-cerrar').onclick = cerrarVisor;
$('visor').onclick = (e) => { if (e.target === $('visor')) cerrarVisor(); };
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('visor').hidden) cerrarVisor(); });

/* ---------- ventana horaria ---------- */
function ventanaAbierta(ev) {
  const ahora = Date.now();
  const d = (ev.ventana && ev.ventana.desde) ? new Date(ev.ventana.desde).getTime() : 0;
  const h = (ev.ventana && ev.ventana.hasta) ? new Date(ev.ventana.hasta).getTime() : Infinity;
  return ahora >= d && ahora <= h;
}
function pintarVentana(ev) {
  const abierta = ventanaAbierta(ev) && ev.estado !== 'cerrada';
  $('botonera').hidden = !abierta;
  const c = $('gal-cerrada');
  if (!abierta) {
    c.textContent = ev.estado === 'cerrada'
      ? 'La subida de fotos ya cerró. ¡Gracias por ser parte!'
      : 'La subida abre el día del evento. Mientras tanto podés mirar la galería.';
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

  if (ev.marca) {
    if (ev.marca.color) document.documentElement.style.setProperty('--acento', ev.marca.color);
    if (ev.marca.logo) { $('ev-logo').src = ev.marca.logo; $('ev-logo').hidden = false; }
  }
  document.title = (ev.nombre || 'Galería') + ' · Fotos';
  $('ev-nombre').textContent = ev.nombre || 'Nuestra fiesta';

  if (esInApp()) $('gal-inapp').hidden = false;

  idb = await abrirIDB().catch(() => null);

  conseguirAutor(ev, (autor) => {
    AUTOR = autor;
    $('ev-saludo').textContent = 'Hola, ' + autor.nombre;
    $('gal-main').hidden = false;
    pintarVentana(ev);
    escucharFotos();

    $('in-camara').addEventListener('change', (e) => { entraron(e.target.files); e.target.value = ''; });
    $('in-elegir').addEventListener('change', (e) => { entraron(e.target.files); e.target.value = ''; });

    procesarCola(autor);
    window.addEventListener('online', () => procesarCola(autor));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') procesarCola(autor);
    });
    setInterval(() => procesarCola(autor), 20000);
  });
})();
