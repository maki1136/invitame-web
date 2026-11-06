/* ===== NINGUNA INVITACIÓN MUESTRA DATOS DE EJEMPLO (6/11/2026) ==============

   POR QUÉ EXISTE
   El molde de la invitación (i/index.html, las copias de i/v/ y
   prueba/index.html) trae escrita una boda de EJEMPLO: «María & Diego»,
   el pase de «Hugo y Lucía · mesa 12», la raspadita del «28 · Noviembre
   2026», «Escribir a María»… El navegador los cambia por los de verdad
   cuando la base contesta, y con señal lenta el invitado ve los de otro.
   Pasó tres veces (27/10 portada, 6/11 el pase en citlalli-y-hedwin-jesus)
   y cada vez se arregló un caso. Maki: «¿cómo me aseguro que no vuelva a
   pasar? En ninguna invi».

   QUÉ HACE
   1. Lee los moldes del repo y anota el texto de ejemplo de cada elemento
      con id (y el valor de cada <input>).
   2. Trae la lista de TODAS las invitaciones de la base (sólo el id).
   3. Abre cada una TAL COMO LE LLEGA AL INVITADO (el HTML del servidor, sin
      que corra ningún script) — con y sin un &g= de invitado — y busca
      cualquier elemento que siga diciendo lo del ejemplo.
   4. Lo que sea un rótulo genérico («Confirmar Asistencia», «Ver video»…)
      está en GENERICOS: no es dato de otra fiesta.

   ⚠️ Si alguien agrega al molde un texto de ejemplo NUEVO, este chequeo lo
      marca solo en rojo (no hay que acordarse de anotarlo). Se arregla en
      i/index.php (escribirlo desde el servidor o dejarlo vacío), o, si es un
      rótulo genérico de verdad, se suma a GENERICOS.

   Escribe chequeo/sin-ejemplo.txt. Sale con código 1 si encontró algo.
   SLUGS=a,b,c para revisar sólo esas.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';

const SITIO = process.env.SITIO || 'https://invitameok.net';
const FS = 'https://firestore.googleapis.com/v1/projects/invitame-9b51f/databases/(default)/documents';
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const RAIZ = path.join(AQUI, '..');

/* rótulos que el molde trae y que NO son datos de una fiesta */
const GENERICOS = new Set([
  'Ingresa la clave que te compartieron los anfitriones para ver la invitación.', 'Ingresa',
  'Toca el sello para abrir', '--', 'Habilitado', 'Desliza el dedo para descubrir', 'Con cariño',
  'Una carta para ti', 'Queridos amigos y familia', 'Dónde & Cuándo', 'Los eventos', 'Ceremonia',
  'Agendar', 'Recepción', 'Fiesta', 'Itinerario', 'Hospedaje', 'Tenemos tarifas especiales para nuestros invitados.',
  '- Elegante -', 'Dress Code', 'Nosotros', 'Nuestros Padres', 'Recuerdos', 'Nuestra Galería', '#Hashtag',
  'Ver en Instagram', 'Para verlo juntos', 'Nuestro video', 'Un ratito de nuestra historia.', 'Ver video',
  '¡Juega con nosotros!', 'Trivia', '¿Cuánto conoces a la pareja? Agrega puntos y entra al ranking.',
  'Iniciar sesión', 'Comenzar trivia', '¿No eres tú?', 'Cerrar sesión', 'Tu puntaje', 'Tabla de posiciones',
  'Mesa de Regalos', 'CLABE / Cuenta', 'Te esperamos', 'Confirmar Asistencia', 'Ya confirmaron',
  'Compartir por WhatsApp', 'Contacto', '¡Gracias!', 'Nos Casamos', 'Nuestra Boda', '—',
  'Hoy queremos compartir con ustedes uno de los días más felices de nuestras vidas. Gracias por acompañarnos en este camino de amor.'
]);
/* ids que el molde usa como rótulo y que el motor no pisa con datos */
const IDS_GENERICOS = new Set(['lock-txt', 'btn-ingresar', 'hint', 'd', 'h', 'm', 's', 'pv-estado']);

const ent = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));

function textos(html) {
  const t = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const out = new Map();
  for (const m of t.matchAll(/<([a-z0-9]+)\b[^>]*\bid="([^"]+)"[^>]*>([^<]*)</gi)) {
    const tx = ent(m[3]).replace(/\s+/g, ' ').trim();
    if (tx && !out.has(m[2])) out.set(m[2], tx);
  }
  for (const m of t.matchAll(/<input\b[^>]*\bid="([^"]+)"[^>]*\bvalue="([^"]*)"/gi)) {
    const tx = ent(m[2]).trim();
    if (tx) out.set('input#' + m[1], tx);
  }
  return out;
}

/* 1) lo que traen los moldes */
const moldes = ['i/index.html', 'prueba/index.html']
  .concat(fs.readdirSync(path.join(RAIZ, 'i/v')).map(d => `i/v/${d}/index.html`))
  .filter(f => fs.existsSync(path.join(RAIZ, f)));
const ejemplo = new Map();   // id -> Set(textos de ejemplo)
for (const f of moldes) {
  for (const [id, tx] of textos(fs.readFileSync(path.join(RAIZ, f), 'utf8'))) {
    if (IDS_GENERICOS.has(id) || GENERICOS.has(tx)) continue;
    if (!ejemplo.has(id)) ejemplo.set(id, new Set());
    ejemplo.get(id).add(tx);
  }
}

/* 2) todas las invitaciones */
async function slugs() {
  if (process.env.SLUGS) return process.env.SLUGS.split(',').map(s => s.trim()).filter(Boolean);
  const out = []; let tok = '';
  do {
    const u = `${FS}/inv_eventos?pageSize=300&mask.fieldPaths=n1${tok ? '&pageToken=' + encodeURIComponent(tok) : ''}`;
    const r = await fetch(u); if (!r.ok) throw new Error('No pude leer la lista de invitaciones: HTTP ' + r.status);
    const j = await r.json();
    for (const d of j.documents || []) out.push(d.name.split('/').pop());
    tok = j.nextPageToken || '';
  } while (tok);
  return out;
}

/* 3) cada invitación, como le llega al invitado */
async function revisar(slug, conG) {
  const u = `${SITIO}/i/?e=${encodeURIComponent(slug)}${conG ? '&g=CHEQUEOSINEJEMPLO' : ''}&cb=${Date.now()}`;
  let html = '';
  for (let i = 0; i < 3 && !html; i++) {
    try { const r = await fetch(u, { headers: { 'User-Agent': 'invitame-chequeo-sin-ejemplo' } }); if (r.ok) html = await r.text(); }
    catch (e) { await new Promise(r => setTimeout(r, 1500)); }
  }
  if (!html) return [{ id: '(página)', tx: 'no cargó' }];
  if (/id="iv-bloqueo"|Invitación no disponible/i.test(html) && !/id="pv-gname"/.test(html)) return [];
  const mal = [];
  for (const [id, tx] of textos(html)) {
    const ej = ejemplo.get(id);
    if (ej && ej.has(tx)) mal.push({ id, tx });
  }
  return mal;
}

const lista = await slugs();
const filas = []; let malas = 0;
const POR_TANDA = 6;
for (let i = 0; i < lista.length; i += POR_TANDA) {
  await Promise.all(lista.slice(i, i + POR_TANDA).map(async slug => {
    const a = await revisar(slug, false), b = await revisar(slug, true);
    const vistos = new Set(), todo = [];
    for (const x of a.concat(b)) { const k = x.id + '|' + x.tx; if (!vistos.has(k)) { vistos.add(k); todo.push(x); } }
    if (todo.length) { malas++; filas.push(`✗ ${slug}: ` + todo.map(x => `${x.id} = «${x.tx}»`).join(' · ')); }
  }));
}
const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
const resumen = malas
  ? `MAL — ${malas} de ${lista.length} invitaciones muestran datos de la boda de ejemplo al cargar.`
  : `BIEN — ninguna de las ${lista.length} invitaciones muestra datos de ejemplo al cargar.`;
const txt = [`Chequeo «sin datos de ejemplo» · ${fecha}`, `Moldes revisados: ${moldes.join(', ')}`, resumen, ...filas.sort()].join('\n') + '\n';
fs.writeFileSync(path.join(AQUI, 'sin-ejemplo.txt'), txt);
console.log(txt);
process.exit(malas ? 1 : 0);
