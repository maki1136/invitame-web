/* ============================================================
   GALERÍA DE INVITADOS · Worker de Cloudflare
   Este archivo NO tiene secretos: todas las claves viven en las
   variables del Worker en Cloudflare. Por eso puede estar en el repo.
   El que corre es el del Worker; este es la copia de referencia.

   Qué necesita configurado en Cloudflare (pestaña Settings):
     · Binding R2:  BUCKET   → el bucket "galeria-fotos"
     · Binding KV:  LIMITES  → un namespace KV cualquiera
     · Variables (secretos):
         SIGHTENGINE_USER    → api_user de Sightengine
         SIGHTENGINE_SECRET  → api_secret de Sightengine
         SA_EMAIL            → client_email del service account de Firebase
         SA_KEY              → private_key del service account (el PEM entero)
         CLAVE_ALTA          → una clave inventada para poder crear eventos

   Endpoints:
     POST /subir   → recibe foto+thumb, frena abuso, guarda en R2,
                     modera con Sightengine y escribe el doc en Firestore
     POST /crear   → alta de un evento (header X-Clave: CLAVE_ALTA)
     GET  /f/<key> → sirve un archivo del bucket (con caché)
     GET  /qr?g=   → el QR del evento (redirección a un generador)
   ============================================================ */

const PROYECTO = 'invitame-9b51f';
const MAX_FOTO = 800 * 1024;      // 800 KB: el cliente comprime a ~300
const MAX_THUMB = 150 * 1024;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const ruta = url.pathname;

    // CORS: la página vive en otro dominio.
    if (req.method === 'OPTIONS') return respuesta(null, 204);

    try {
      if (ruta === '/subir' && req.method === 'POST') return await subir(req, env, ctx);
      if (ruta === '/crear' && req.method === 'POST') return await crear(req, env);
      if (ruta.startsWith('/f/') && req.method === 'GET') return await servir(req, env, ctx, ruta.slice(3), url);
      if (ruta === '/qr' && req.method === 'GET') return qr(url);
      return respuesta({ error: 'no existe' }, 404);
    } catch (e) {
      return respuesta({ error: 'error interno', detalle: String(e && e.message || e) }, 500);
    }
  }
};

function respuesta(cuerpo, status, extra) {
  const h = Object.assign({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Clave'
  }, extra || {});
  if (cuerpo !== null && !(cuerpo instanceof Response)) {
    h['Content-Type'] = 'application/json;charset=utf-8';
    return new Response(cuerpo === null ? null : JSON.stringify(cuerpo), { status, headers: h });
  }
  return new Response(null, { status, headers: h });
}

/* ---------------- /subir ---------------- */
async function subir(req, env, ctx) {
  const fd = await req.formData();
  const gid = String(fd.get('gid') || '').trim();
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(gid)) return respuesta({ error: 'evento inválido' }, 400);

  let autor = {};
  try { autor = JSON.parse(String(fd.get('autor') || '{}')); } catch (e) {}
  const nombre = String(autor.nombre || 'Invitado').slice(0, 40);
  const origen = autor.origen === 'invitacion' ? 'invitacion' : 'qr';

  const foto = fd.get('foto'), thumb = fd.get('thumb');
  if (!foto || !thumb || typeof foto === 'string' || typeof thumb === 'string')
    return respuesta({ error: 'faltan archivos' }, 400);
  if (foto.size > MAX_FOTO || thumb.size > MAX_THUMB || foto.size < 1000)
    return respuesta({ error: 'la foto no tiene el tamaño esperado' }, 400);
  const tipo = foto.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';

  // El evento tiene que existir, estar activo y dentro de la ventana.
  const ev = await leerEvento(env, gid);
  if (!ev) return respuesta({ error: 'evento inválido' }, 400);
  if (ev.estado === 'cerrada') return respuesta({ error: 'la subida ya cerró' }, 403);
  const ahora = Date.now();
  const desde = ev.ventana && ev.ventana.desde ? Date.parse(ev.ventana.desde) : 0;
  const hasta = ev.ventana && ev.ventana.hasta ? Date.parse(ev.ventana.hasta) : Infinity;
  if (ahora < desde || ahora > hasta) return respuesta({ error: 'la subida está cerrada ahora' }, 403);

  // Freno anti-abuso: ráfaga (10 / 5 min) y total por invitado.
  const rafaga = (ev.limites && ev.limites.rafaga) || 10;
  const total = (ev.limites && ev.limites.porInvitado) || 30;
  const quien = await hash(gid + '|' + nombre + '|' + (autor.token || ''));
  const kR = 'r:' + quien, kT = 't:' + quien;
  const nR = parseInt(await env.LIMITES.get(kR) || '0', 10);
  const nT = parseInt(await env.LIMITES.get(kT) || '0', 10);
  if (nR >= rafaga) return respuesta({ error: 'Ya subiste muchas seguidas, esperá un ratito 😉' }, 429);
  if (nT >= total) return respuesta({ error: 'Llegaste al máximo de fotos de este evento 💛' }, 429);
  ctx.waitUntil(env.LIMITES.put(kR, String(nR + 1), { expirationTtl: 300 }));
  ctx.waitUntil(env.LIMITES.put(kT, String(nT + 1), { expirationTtl: 60 * 60 * 24 * 3 }));

  // A R2.
  const fid = cid();
  const ext = tipo === 'image/jpeg' ? 'jpg' : 'webp';
  const key = 'g/' + gid + '/' + fid + '.' + ext;
  const tkey = 'g/' + gid + '/' + fid + '_t.' + ext;
  await env.BUCKET.put(key, foto.stream(), { httpMetadata: { contentType: tipo } });
  await env.BUCKET.put(tkey, thumb.stream(), { httpMetadata: { contentType: tipo } });

  // Moderación sobre la MINIATURA. Si el filtro no contesta en 4 s,
  // la foto queda PENDIENTE: la moderación caída nunca aprueba sola.
  let estado = 'pendiente', score = null;
  const veredicto = await moderar(env, thumb).catch(() => null);
  if (veredicto) {
    score = veredicto.score;
    if (veredicto.malo) estado = 'rechazada';
    else estado = (ev.modo === 'auto') ? 'aprobada' : 'pendiente';
  }

  // El doc en Firestore (vía service account; las reglas no aplican acá).
  await escribirFoto(env, gid, fid, {
    autor: { nombre, origen, token: autor.token ? String(autor.token).slice(0, 24) : null },
    r2: { key, thumb: tkey, bytes: foto.size,
          w: parseInt(fd.get('w') || '0', 10) || 0, h: parseInt(fd.get('h') || '0', 10) || 0 },
    estado,
    mod: score === null ? null : { motor: 'sightengine', score },
    tsms: ahora
  });

  // Al que subió porquería no se le avisa que hay filtro: gracias y chau.
  return respuesta({ ok: true }, 200);
}

/* ---------------- /crear ---------------- */
async function crear(req, env) {
  if (req.headers.get('X-Clave') !== env.CLAVE_ALTA) return respuesta({ error: 'no' }, 403);
  const b = await req.json().catch(() => ({}));
  const gid = cid() + cid().slice(0, 8);           // 24+ chars, no adivinable
  const ev = {
    nombre: String(b.nombre || 'Nuestra fiesta').slice(0, 80),
    fecha: String(b.fecha || '').slice(0, 10),
    ventana: {
      desde: b.desde || new Date().toISOString(),
      hasta: b.hasta || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    },
    modo: b.modo === 'auto' ? 'auto' : 'previa',
    marca: {
      logo: b.logo || null,
      color: /^#[0-9a-fA-F]{6}$/.test(b.color || '') ? b.color : '#b06a7e',
      texto: String(b.texto || 'Invítame').slice(0, 40)
    },
    limites: { porInvitado: 30, rafaga: 10 },
    invitacion: b.invitacion ? String(b.invitacion).slice(0, 60) : null,
    estado: 'activa',
    creado: new Date().toISOString()
  };
  await escribirEvento(env, gid, ev);
  return respuesta({ ok: true, gid, url: 'https://invitame.littlemomentsok.com/galeria/?g=' + gid }, 200);
}

/* ---------------- /f/<key> ---------------- */
async function servir(req, env, ctx, key, url) {
  if (!/^g\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+(_t)?\.(webp|jpg)$/.test(key))
    return respuesta({ error: 'no' }, 400);

  // Caché del borde: la misma foto no baja dos veces de R2.
  const cache = caches.default;
  const claveCache = new Request(url.origin + '/f/' + key);
  let r = await cache.match(claveCache);
  if (!r) {
    const obj = await env.BUCKET.get(key);
    if (!obj) return respuesta({ error: 'no está' }, 404);
    r = new Response(obj.body, {
      headers: {
        'Content-Type': obj.httpMetadata && obj.httpMetadata.contentType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
    ctx.waitUntil(cache.put(claveCache, r.clone()));
  }
  if (url.searchParams.get('dl')) {
    r = new Response(r.body, r);
    r.headers.set('Content-Disposition', 'attachment; filename="foto.' + (key.endsWith('.jpg') ? 'jpg' : 'webp') + '"');
  }
  return r;
}

/* ---------------- /qr ---------------- */
function qr(url) {
  const g = url.searchParams.get('g') || '';
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(g)) return respuesta({ error: 'no' }, 400);
  const destino = 'https://invitame.littlemomentsok.com/galeria/?g=' + g;
  return Response.redirect(
    'https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=2&data=' + encodeURIComponent(destino), 302);
}

/* ---------------- moderación (Sightengine) ---------------- */
async function moderar(env, blob) {
  if (!env.SIGHTENGINE_USER) return null;   // sin cuenta todavía: todo queda pendiente
  const fd = new FormData();
  fd.append('media', blob, 't.webp');
  fd.append('models', 'nudity-2.1,gore-2.1');
  fd.append('api_user', env.SIGHTENGINE_USER);
  fd.append('api_secret', env.SIGHTENGINE_SECRET);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 4000);
  const r = await fetch('https://api.sightengine.com/1.0/check.json', {
    method: 'POST', body: fd, signal: ctl.signal
  });
  clearTimeout(timer);
  const j = await r.json();
  if (j.status !== 'success') return null;
  const n = j.nudity || {};
  const peor = Math.max(n.sexual_activity || 0, n.sexual_display || 0, n.erotica || 0,
                        (j.gore && j.gore.prob) || 0);
  return { malo: peor > 0.5, score: Math.round(peor * 100) / 100 };
}

/* ---------------- Firestore por REST (service account) ---------------- */
let tokenCache = { t: null, vence: 0 };
async function tokenGoogle(env) {
  if (tokenCache.t && Date.now() < tokenCache.vence - 60000) return tokenCache.t;
  const ahora = Math.floor(Date.now() / 1000);
  const cab = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = b64url(JSON.stringify({
    iss: env.SA_EMAIL, scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token', iat: ahora, exp: ahora + 3600
  }));
  const clave = await importarClave(env.SA_KEY);
  const firma = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', clave,
    new TextEncoder().encode(cab + '.' + cuerpo));
  const jwt = cab + '.' + cuerpo + '.' + b64url(firma);
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('sin token de Google: ' + JSON.stringify(j).slice(0, 120));
  tokenCache = { t: j.access_token, vence: Date.now() + (j.expires_in || 3600) * 1000 };
  return tokenCache.t;
}
async function importarClave(pem) {
  const cuerpo = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(cuerpo), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}
function b64url(x) {
  const s = typeof x === 'string' ? btoa(unescape(encodeURIComponent(x)))
    : btoa(String.fromCharCode(...new Uint8Array(x)));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const FS = 'https://firestore.googleapis.com/v1/projects/' + PROYECTO + '/databases/(default)/documents';

async function leerEvento(env, gid) {
  const t = await tokenGoogle(env);
  const r = await fetch(FS + '/gal_eventos/' + gid, { headers: { Authorization: 'Bearer ' + t } });
  if (!r.ok) return null;
  return desdeFirestore((await r.json()).fields || {});
}
async function escribirEvento(env, gid, ev) {
  const t = await tokenGoogle(env);
  const r = await fetch(FS + '/gal_eventos/' + gid, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: aFirestore(ev) })
  });
  if (!r.ok) throw new Error('firestore evento ' + r.status);
}
async function escribirFoto(env, gid, fid, foto) {
  const t = await tokenGoogle(env);
  const r = await fetch(FS + '/gal_fotos/' + gid + '/items/' + fid, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: aFirestore(foto) })
  });
  if (!r.ok) throw new Error('firestore foto ' + r.status);
}

/* Objeto JS ⇄ formato de campos de la API REST de Firestore. */
function aFirestore(o) {
  const out = {};
  for (const k in o) out[k] = valorFS(o[k]);
  return out;
}
function valorFS(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'object') return { mapValue: { fields: aFirestore(v) } };
  return { stringValue: String(v) };
}
function desdeFirestore(fields) {
  const o = {};
  for (const k in fields) {
    const v = fields[k];
    if ('stringValue' in v) o[k] = v.stringValue;
    else if ('integerValue' in v) o[k] = parseInt(v.integerValue, 10);
    else if ('doubleValue' in v) o[k] = v.doubleValue;
    else if ('booleanValue' in v) o[k] = v.booleanValue;
    else if ('nullValue' in v) o[k] = null;
    else if ('mapValue' in v) o[k] = desdeFirestore(v.mapValue.fields || {});
  }
  return o;
}

/* ---------------- chiquitas ---------------- */
function cid() {
  const abc = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin l/o/0/1
  const a = crypto.getRandomValues(new Uint8Array(16));
  let s = '';
  for (const b of a) s += abc[b % abc.length];
  return s;
}
async function hash(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].slice(0, 10).map((b) => b.toString(16).padStart(2, '0')).join('');
}
