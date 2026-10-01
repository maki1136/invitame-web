/* ===== CHEQUEO DIARIO DE LOS SERVICIOS QUE SE PAGAN (1/10/2026) ==============

   POR QUÉ EXISTE
   Maki, 1/10/2026, antes de salir a vender: «que las cosas pagas estén pagas…
   que jamás caiga por un error de esos». El banco (probar.mjs) mira que la
   invitación se VEA bien. Esto mira que los servicios de atrás SIGAN
   ANDANDO y que no estén por llegar a su tope:

     1. Cloudinary (fotos y videos de las invitaciones): % del plan usado.
     2. La galería en vivo (Worker de Cloudflare): % del tope del mes.
     3. Firebase (los datos de las invitaciones): que conteste. Si se acabó la
        cuota del día contesta 429 y ninguna invitación carga sus datos.
     4. El servidor (Hostinger): que la invitación de prueba y el paquete de
        módulos lleguen enteros.
     5. ⭐ UNA FOTO DE PRUEBA DE VERDAD a la galería del chequeo, y que quede
        APROBADA. Es lo único que demuestra que el filtro (Sightengine) sigue
        contestando: si se cae o se acaba el plan, las fotos de los invitados
        quedan «pendientes» y no aparecen NI en la galería NI en la pantalla
        del salón — sin ningún error a la vista.

   Escribe chequeo/servicios.txt en lenguaje humano. Sale con código 1 si hay
   algo MAL, para que la corrida de GitHub se marque en rojo.

   ⚠️ La galería del chequeo es «PRUEBA ventana febrero»
      (gJTnVrquHdvDXAndh9Yt9kB9). No está en ninguna invitación. NO SE BORRA.
      Su ventana dura hasta el 21/2/2027: este chequeo avisa 30 días antes
      para que se cree otra desde el panel y se cambie el gid acá.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';

const SITIO = 'https://invitame.littlemomentsok.com';
const WORKER = 'https://galeria.littlemomentsok.workers.dev';
const FS = 'https://firestore.googleapis.com/v1/projects/invitame-9b51f/databases/(default)/documents';
const GID_CHEQUEO = 'gJTnVrquHdvDXAndh9Yt9kB9';
const AVISO = 0.80;   // al 80% avisa (AMARILLO); al 100% es MAL
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const FOTO_B64 = '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';

const filas = [];
let mal = 0, ojo = 0;
const linea = (nivel, txt) => { filas.push((nivel + '      ').slice(0, 7) + txt); if (nivel === 'MAL') mal++; if (nivel === 'OJO') ojo++; };
const pct = (x) => Math.round(x * 100) + '%';
async function traer(url, op) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
  try { return await fetch(url, Object.assign({ signal: ctl.signal }, op || {})); } finally { clearTimeout(t); }
}

/* 1 — Cloudinary */
try {
  const j = await (await traer(SITIO + '/uso.php?t=' + Date.now())).json();
  if (!j.ok) linea('MAL', 'Cloudinary: no pude leer el uso (' + j.error + ')');
  else {
    const c = j.credits || {};
    const usado = c.usage || 0, limite = c.limit || 0, p = limite ? usado / limite : 0;
    if (!limite) throw new Error('Cloudinary no informó el límite de créditos');
    const txt = 'Cloudinary (plan ' + j.plan + '): ' + usado.toFixed(1) + ' de ' + limite + ' créditos = ' + pct(p);
    if (p >= 1) linea('MAL', txt + ' → PASADO DEL PLAN. Cloudinary puede deshabilitar la cuenta y las invitaciones se quedan sin fotos ni videos. Subir de plan HOY.');
    else if (p >= AVISO) linea('OJO', txt + ' → cerca del tope, subir de plan antes de fin de mes.');
    else linea('BIEN', txt);
  }
} catch (e) { linea('MAL', 'Cloudinary: el servidor no contestó uso.php (' + e.message + ')'); }

/* 2 — Worker de la galería */
try {
  const rw = await traer(WORKER + '/uso');
  const j = await rw.json();
  if (!rw.ok || typeof j.porcentaje !== 'number') throw new Error('contestó ' + rw.status + ' ' + JSON.stringify(j).slice(0, 80));
  const p = j.porcentaje / 100;
  const txt = 'Galería en vivo: ' + j.usadoGB + ' GB de ' + j.topeGB + ' GB este mes = ' + pct(p);
  if (p >= 1) linea('MAL', txt + ' → LLENO: ninguna fiesta puede subir fotos. Subir TOPE_GB en Cloudflare.');
  else if (p >= AVISO) linea('OJO', txt + ' → subir TOPE_GB en Cloudflare antes de que se llene.');
  else linea('BIEN', txt);
} catch (e) { linea('MAL', 'Galería en vivo: el Worker no contestó (' + e.message + ')'); }

/* 3 — Firebase */
try {
  const r = await traer(FS + '/inv_eventos/prueba-desde-cero');
  if (r.status === 429) linea('MAL', 'Firebase: SE ACABÓ LA CUOTA DEL DÍA (429). Las invitaciones no cargan sus datos. Pasar a plan Blaze.');
  else if (!r.ok) linea('MAL', 'Firebase: contestó ' + r.status + ' al leer la invitación de prueba');
  else linea('BIEN', 'Firebase: contesta bien');
} catch (e) { linea('MAL', 'Firebase: no contestó (' + e.message + ')'); }

/* 4 — Servidor */
try {
  const r = await traer(SITIO + '/efectos/todo.php');
  const t = await r.text();
  if (!r.ok || t.indexOf('INVEFECTOS_JUNTOS') < 0) linea('MAL', 'Servidor: el paquete de módulos llegó roto (' + r.status + ', ' + t.length + ' bytes)');
  else {
    const r2 = await traer(SITIO + '/i/?e=prueba-desde-cero');
    const h2 = await r2.text();
    if (!r2.ok || h2.indexOf('firebase-inv.js') < 0) linea('MAL', 'Servidor: la invitación de prueba contestó ' + r2.status + ' y no trae el motor');
    else linea('BIEN', 'Servidor: la invitación y el paquete de módulos llegan enteros (' + Math.round(t.length / 1024) + ' KB)');
  }
} catch (e) { linea('MAL', 'Servidor: no contestó (' + e.message + ')'); }

/* 5 — La foto de prueba */
try {
  const ev = await (await traer(FS + '/gal_eventos/' + GID_CHEQUEO)).json();
  const hasta = (((ev.fields || {}).ventana || {}).mapValue || {}).fields;
  const fin = hasta && hasta.hasta ? Date.parse(hasta.hasta.stringValue) : 0;
  if (fin && fin - Date.now() < 30 * 864e5)
    linea('OJO', 'La galería del chequeo cierra el ' + new Date(fin).toISOString().slice(0, 10) + ': crear otra desde el panel y cambiar GID_CHEQUEO en chequeo/servicios.mjs');

  const buf = Buffer.from(FOTO_B64, 'base64');
  const fd = new FormData();
  const marca = 'chequeo-' + Date.now();
  fd.append('gid', GID_CHEQUEO);
  fd.append('autor', JSON.stringify({ nombre: 'Chequeo diario', origen: 'qr', token: marca.slice(-20) }));
  fd.append('foto', new Blob([buf], { type: 'image/jpeg' }), 'f.jpg');
  fd.append('thumb', new Blob([buf], { type: 'image/jpeg' }), 't.jpg');
  fd.append('w', '96'); fd.append('h', '96');
  const antes = Date.now();
  const r = await traer(WORKER + '/subir', { method: 'POST', body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) linea('MAL', 'Foto de prueba: la galería NO la aceptó (' + r.status + ' ' + (j.error || '') + ')');
  else {
    let aprobada = false;
    for (let i = 0; i < 6 && !aprobada; i++) {
      await new Promise((ok) => setTimeout(ok, 3000));
      const q = await traer(FS + '/gal_fotos/' + GID_CHEQUEO + ':runQuery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'items' }],
          where: { fieldFilter: { field: { fieldPath: 'estado' }, op: 'EQUAL', value: { stringValue: 'aprobada' } } } } })
      });
      const filasQ = await q.json().catch(() => []);
      for (const f of (Array.isArray(filasQ) ? filasQ : [])) {
        const d = f.document && f.document.fields; if (!d) continue;
        const ts = parseInt((d.tsms || {}).integerValue || '0', 10);
        if (ts >= antes - 60000) { aprobada = true; break; }
      }
    }
    if (aprobada) linea('BIEN', 'Foto de prueba: subió, pasó el filtro y quedó APROBADA (Sightengine y la galería andan)');
    else linea('MAL', 'Foto de prueba: subió pero NO quedó aprobada. Lo más probable: Sightengine no contesta o se acabó su plan → las fotos de las fiestas quedan pendientes y no se ven. Mirar moderar.html.');
  }
} catch (e) { linea('MAL', 'Foto de prueba: no se pudo hacer (' + e.message + ')'); }

const cab = mal ? '🔴 HAY ' + mal + ' COSA(S) MAL' : (ojo ? '🟡 TODO ANDA, pero hay ' + ojo + ' aviso(s)' : '🟢 TODO BIEN');
const texto = 'CHEQUEO DE SERVICIOS — ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC\n' + cab + '\n\n' + filas.join('\n') + '\n';
fs.writeFileSync(path.join(AQUI, 'servicios.txt'), texto);
console.log(texto);
process.exit(mal ? 1 : 0);
