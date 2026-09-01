/* ============================================================
   GALERÍA DE INVITADOS · Worker de Cloudflare
   Este archivo NO tiene secretos: todas las claves viven en las
   variables del Worker en Cloudflare. Por eso puede estar en el repo.
   El que corre es el del Worker; este es la copia de referencia.

   Qué necesita configurado en Cloudflare (pestaña Settings):
     · Binding R2:  BUCKET   → el bucket "galeria-fotos"
     · Binding KV:  LIMITES  → un namespace KV cualquiera
     · Variable normal (NO secreto), opcional:
         TOPE_GB             → tope duro de subida acumulada, en GB.
                               Si falta, son 8 GB. Al llegar, el sistema
                               deja de aceptar fotos: la cuenta NUNCA se
                               dispara aunque falle todo lo demás.
     · Variables (secretos):
         SIGHTENGINE_USER    → api_user de Sightengine
         SIGHTENGINE_SECRET  → api_secret de Sightengine
         SA_JSON             → el archivo JSON del service account de
                               Firebase, pegado ENTERO tal cual se descarga
                               (o, si se prefiere, SA_EMAIL y SA_KEY sueltos)
         CLAVE_ALTA          → una clave inventada para que Maki pueda crear
                               eventos a mano. NO se le da a nadie: los
                               clientes crean con su cuenta (ver abajo).
     · Variable normal (NO secreto):
         ADMIN_UIDS          → los uid de Firebase que pueden cargar créditos,
                               separados por coma. No es un secreto: un uid no
                               sirve para nada sin la sesión de esa persona.

   Endpoints:
     POST /subir   → recibe foto+thumb, frena abuso, guarda en R2,
                     modera con Sightengine y escribe el doc en Firestore
     POST /crear   → alta de un evento. Dos maneras de pedirla:
                       · Maki:     header  X-Clave: CLAVE_ALTA   (no gasta crédito)
                       · Cliente:  header  Authorization: Bearer <ID token de Firebase>
                                   (gasta 1 crédito, descontado ACÁ ADENTRO)
     GET  /f/<key> → sirve un archivo del bucket (con caché)
     GET  /qr?g=   → el QR del evento (redirección a un generador)
     POST /cuenta  → alta o recarga de una cuenta de cliente.
                     Sólo para los uid de ADMIN_UIDS, con su sesión de Firebase.
     POST /firmar  → el libro de firmas: un mensaje escrito o un audio.
                     Mismo circuito que /subir: topes, moderación y estado.
     GET  /uso     → cuánto se lleva usado este mes contra el tope
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
      if (ruta === '/cuenta' && req.method === 'POST') return await ponerCuenta(req, env);
      if (ruta === '/firmar' && req.method === 'POST') return await firmar(req, env, ctx);
      if (ruta.startsWith('/f/') && req.method === 'GET') return await servir(req, env, ctx, ruta.slice(3), url);
      if (ruta === '/qr' && req.method === 'GET') return qr(url);
      if (ruta === '/uso' && req.method === 'GET') return await uso(env);
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
    'Access-Control-Allow-Headers': 'Content-Type,X-Clave,Authorization'
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

  // TOPE DURO DE LA CUENTA. Esto no depende de ninguna alerta ni de que
  // alguien mire un mail: si lo acumulado del mes llega al tope, no se
  // acepta una foto más. Es la red de seguridad de la tarjeta de Maki.
  const topeBytes = (parseFloat(env.TOPE_GB || '8') || 8) * 1024 * 1024 * 1024;
  const mes = new Date().toISOString().slice(0, 7);          // "2026-08"
  const kMes = 'bytes:' + mes;
  const usado = parseInt(await env.LIMITES.get(kMes) || '0', 10);
  if (usado >= topeBytes) {
    return respuesta({ error: 'La galería alcanzó su límite de este mes. Escribinos y lo ampliamos.' }, 507);
  }
  ctx.waitUntil(env.LIMITES.put(kMes, String(usado + foto.size + thumb.size),
    { expirationTtl: 60 * 60 * 24 * 70 }));

  // A R2.
  const fid = cid();
  const ext = tipo === 'image/jpeg' ? 'jpg' : 'webp';
  const key = 'g/' + gid + '/' + fid + '.' + ext;
  const tkey = 'g/' + gid + '/' + fid + '_t.' + ext;
  await env.BUCKET.put(key, foto.stream(), { httpMetadata: { contentType: tipo } });
  await env.BUCKET.put(tkey, thumb.stream(), { httpMetadata: { contentType: tipo } });

  // Moderación sobre la MINIATURA. Si el filtro no contesta a tiempo,
  // la foto queda PENDIENTE: la moderación caída nunca aprueba sola.
  let estado = 'pendiente', mod = null;
  const veredicto = await moderar(env, thumb).catch((e) => ({ falla: String(e && e.message || e).slice(0, 90) }));
  if (veredicto && veredicto.falla) {
    mod = { motor: 'sightengine', falla: veredicto.falla };   // queda visible en el panel
  } else if (veredicto) {
    mod = { motor: 'sightengine', score: veredicto.score };
    if (veredicto.malo) estado = 'rechazada';
    else estado = (ev.modo === 'auto') ? 'aprobada' : 'pendiente';
  }

  // El doc en Firestore (vía service account; las reglas no aplican acá).
  await escribirFoto(env, gid, fid, {
    autor: { nombre, origen, token: autor.token ? String(autor.token).slice(0, 24) : null },
    r2: { key, thumb: tkey, bytes: foto.size,
          w: parseInt(fd.get('w') || '0', 10) || 0, h: parseInt(fd.get('h') || '0', 10) || 0 },
    estado,
    mod,
    tsms: ahora
  });

  // Al que subió porquería no se le avisa que hay filtro: gracias y chau.
  return respuesta({ ok: true }, 200);
}

/* ---------------- /crear ---------------- */
/* ⚠️ LA REGLA QUE NO SE NEGOCIA
   El crédito se descuenta ACÁ, en el servidor. Nunca en el navegador.
   El saldo vive en gal_cuentas/{uid}, que el cliente puede LEER pero no
   ESCRIBIR (ver las reglas de Firestore). Si el saldo se pudiera tocar
   desde el navegador, cualquiera con la consola abierta se regala 500
   eventos: este repo es público y las reglas se leen desde el sitio. */
async function crear(req, env) {
  /* Dos maneras de pedir un alta, y ninguna manda el saldo:
     · Maki, con la clave del Worker. No gasta crédito.
     · Un cliente, con su sesión de Firebase. Ése sí gasta uno. */
  const conClave = !!env.CLAVE_ALTA && req.headers.get('X-Clave') === env.CLAVE_ALTA;
  let quien = null;
  if (!conClave) {
    quien = await verificarToken(req).catch(() => null);
    if (!quien) return respuesta({ error: 'Entrá con tu cuenta para crear una fiesta.' }, 401);
  }

  const b = await req.json().catch(() => ({}));
  const gid = cid() + cid().slice(0, 8);           // 24+ chars, no adivinable

  /* El crédito PRIMERO. Si no hay saldo no se crea nada. Al revés (crear
     y después cobrar) el que se quedó sin saldo igual se lleva la fiesta.
     Si el alta falla después de cobrar, se devuelve. */
  let cobro = null;
  if (quien) {
    cobro = await cobrarCredito(env, quien.uid);
    if (!cobro.ok) return respuesta({ error: cobro.error, saldo: cobro.saldo || 0 }, cobro.status);
  }

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
    creado: new Date().toISOString(),
    duenio: quien ? quien.uid : null
  };

  try {
    await escribirEvento(env, gid, ev);
  } catch (e) {
    /* Se cobró y no se pudo crear: se devuelve el crédito. */
    if (quien) await devolverCredito(env, quien.uid).catch(() => {});
    throw e;
  }

  /* La lista de fiestas del cliente cuelga de su cuenta. Es a propósito:
     así el panel la lee con una consulta simple y una regla simple, sin
     tener que dejar consultar gal_eventos entero. Si esto falla, la
     fiesta igual existe: se anota aparte y no se le cobra dos veces. */
  if (quien) await anotarEnLaCuenta(env, quien.uid, gid, ev).catch(() => {});

  return respuesta({
    ok: true, gid,
    url: 'https://invitame.littlemomentsok.com/galeria/?g=' + gid,
    saldo: cobro ? cobro.saldo : null
  }, 200);
}

/* ---------------- /cuenta: cargar créditos ---------------- */
/* Existe para que Maki no tenga que entrar a la consola de Firebase, donde el
   formulario obliga a elegir el tipo de cada campo a mano. Si 'creditos'
   quedara como texto, el descuento (increment -1) no resta: PISA el campo con
   -1 y deja la cuenta rota. Acá el tipo lo pone el servidor y no se puede
   equivocar.

   Lo puede llamar sólo quien esté en ADMIN_UIDS, con su sesión de Firebase.
   El navegador no lleva ninguna clave: lleva el token de esa sesión. */
async function ponerCuenta(req, env) {
  const quien = await verificarToken(req).catch(() => null);
  if (!quien) return respuesta({ error: 'Entrá con tu cuenta.' }, 401);

  const admins = String(env.ADMIN_UIDS || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!admins.length) return respuesta({ error: 'Falta configurar ADMIN_UIDS en el Worker.' }, 500);
  if (admins.indexOf(quien.uid) < 0) return respuesta({ error: 'Esta pantalla no es para vos.' }, 403);

  const b = await req.json().catch(() => ({}));
  const uid = String(b.uid || '').trim();
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) return respuesta({ error: 'Ese código de usuario no tiene forma de UID.' }, 400);

  const n = Number(b.creditos);
  if (!Number.isInteger(n) || n < 0 || n > 100000) {
    return respuesta({ error: 'Los créditos tienen que ser un número entero, de 0 en adelante.' }, 400);
  }

  /* Merge a propósito: NO se toca 'creados' ni nada que ya tenga la cuenta.
     Sólo se escribe lo que vino, y 'creditos' SIEMPRE como entero. */
  const campos = { creditos: n, estado: b.estado === 'baja' ? 'baja' : 'activa' };
  if (b.nombre !== undefined) campos.nombre = String(b.nombre || '').slice(0, 80);
  if (b.email !== undefined) campos.email = String(b.email || '').slice(0, 120);

  /* El vencimiento. Vacío a propósito = no vence nunca (la cuenta de Maki, por
     ejemplo). Si viene algo, tiene que ser una fecha de verdad: guardar
     '2027-13-45' dejaría la cuenta comparándose contra un disparate. */
  if (b.vence !== undefined) {
    const v = String(b.vence || '').trim();
    if (v && !fechaValida(v)) {
      return respuesta({ error: 'Esa fecha de vencimiento no existe. Va como año-mes-día.' }, 400);
    }
    campos.vence = v;
  }

  const t = await tokenGoogle(env);
  const mascara = Object.keys(campos).map((k) => 'updateMask.fieldPaths=' + k).join('&');
  const r = await fetch(FS + '/gal_cuentas/' + uid + '?' + mascara, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: aFirestore(campos) })
  });
  if (!r.ok) return respuesta({ error: 'No se pudo guardar la cuenta (' + r.status + ')' }, 502);

  const d = desdeFirestore((await r.json()).fields || {});
  return respuesta({ ok: true, uid, cuenta: d }, 200);
}

/* ---------------- /firmar: el libro de firmas ----------------
   Selpix cuenta tres cosas por separado (15 fotos, 20 mensajes, 5 audios),
   así que acá el mensaje y el audio NO son un pie de foto: son cosas sueltas
   que alguien deja aunque no suba ninguna foto. Y llevan su propio tope:
   quien escribió 20 mensajes puede seguir subiendo fotos.

   Van a gal_firmas, no a gal_fotos: la galería, la pantalla y la moderación
   ya consultan gal_fotos por estado. Mezclarlos haría que cada consulta que
   hoy anda empiece a traer cosas que no espera. */
/* Estos dos se arman con new RegExp a propósito, y no como /.../ literal:
   escritos como literal el archivo termina con caracteres de control y
   combinantes INVISIBLES adentro, que cualquier copiar-y-pegar o editor
   puede comerse sin que se note. Acá el archivo queda ASCII puro. */
const CONTROLES = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]', 'g');
const TILDES = new RegExp('[\\u0300-\\u036f]', 'g');

const MAX_TEXTO = 500;
/* 2 MB y no 600 KB. El 600 salía de suponer que un minuto en Opus entra de
   sobra — y era una suposición, no una medición. Medido el 31/8 con un audio
   de verdad: 6 s pesaron 165 KB (~225 kbps), o sea que el minuto que la
   pantalla le promete al invitado daba ~1,7 MB y se rechazaba DESPUÉS de que
   la persona hablara. El iPhone graba AAC y también puede pasarse de 600 KB.
   La galeria ahora graba a 48 kbps (~370 KB el minuto), pero eso es una
   sugerencia que algunos navegadores ignoran: este tope es la red de abajo,
   no el caso normal. */
const MAX_AUDIO = 2 * 1024 * 1024;
const MAX_SEGUNDOS = 62;           /* 60 + margen: el celular redondea */

async function firmar(req, env, ctx) {
  const tipoContenido = req.headers.get('Content-Type') || '';
  const esAudio = tipoContenido.includes('multipart/form-data');

  let gid = '', autor = {}, texto = '', audio = null, segundos = 0;
  if (esAudio) {
    const fd = await req.formData();
    gid = String(fd.get('gid') || '').trim();
    try { autor = JSON.parse(String(fd.get('autor') || '{}')); } catch (e) {}
    audio = fd.get('audio');
    segundos = Math.round(parseFloat(fd.get('segundos') || '0') || 0);
  } else {
    const b = await req.json().catch(() => ({}));
    gid = String(b.gid || '').trim();
    autor = b.autor || {};
    texto = String(b.texto || '');
  }
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(gid)) return respuesta({ error: 'evento inválido' }, 400);

  const nombre = String(autor.nombre || 'Invitado').slice(0, 40);
  const origen = autor.origen === 'invitacion' ? 'invitacion' : 'qr';

  /* qué mandó, y que tenga sentido */
  if (esAudio) {
    if (!audio || typeof audio === 'string') return respuesta({ error: 'faltó el audio' }, 400);
    if (audio.size > MAX_AUDIO) return respuesta({ error: 'El saludo quedó muy largo. Probá uno más corto 💛' }, 400);
    if (audio.size < 800) return respuesta({ error: 'El saludo salió vacío. Probá de nuevo.' }, 400);
    if (segundos > MAX_SEGUNDOS) return respuesta({ error: 'El saludo puede durar hasta un minuto 💛' }, 400);
  } else {
    /* nada de caracteres de control: rompen la pantalla del salón */
    texto = texto.replace(CONTROLES, '').trim();
    if (!texto) return respuesta({ error: 'Escribí algo primero 💛' }, 400);
    if (texto.length > MAX_TEXTO) return respuesta({ error: 'El mensaje puede tener hasta 500 letras.' }, 400);
  }

  /* el evento tiene que existir, estar activo y dentro de la ventana */
  const ev = await leerEvento(env, gid);
  if (!ev) return respuesta({ error: 'evento inválido' }, 400);
  if (ev.estado === 'cerrada') return respuesta({ error: 'el libro de firmas ya cerró' }, 403);
  const ahora = Date.now();
  const desde = ev.ventana && ev.ventana.desde ? Date.parse(ev.ventana.desde) : 0;
  const hasta = ev.ventana && ev.ventana.hasta ? Date.parse(ev.ventana.hasta) : Infinity;
  if (ahora < desde || ahora > hasta) return respuesta({ error: 'el libro de firmas está cerrado ahora' }, 403);

  /* Tope propio, separado del de las fotos: el que escribió mucho puede
     seguir sacando fotos, y al revés. */
  const quien = await hash(gid + '|' + nombre + '|' + (autor.token || ''));
  const clase = esAudio ? 'a' : 'm';
  const tope = esAudio
    ? ((ev.limites && ev.limites.audios) || 5)
    : ((ev.limites && ev.limites.mensajes) || 20);
  const kT = clase + ':' + quien;
  const n = parseInt(await env.LIMITES.get(kT) || '0', 10);
  if (n >= tope) {
    return respuesta({ error: esAudio
      ? 'Ya dejaste todos tus saludos de voz 💛'
      : 'Ya dejaste todos tus mensajes 💛' }, 429);
  }
  ctx.waitUntil(env.LIMITES.put(kT, String(n + 1), { expirationTtl: 60 * 60 * 24 * 3 }));

  /* El tope duro de la cuenta vale igual: un audio pesa como una foto. */
  const bytes = esAudio ? audio.size : new TextEncoder().encode(texto).length;
  const topeBytes = (parseFloat(env.TOPE_GB || '8') || 8) * 1024 * 1024 * 1024;
  const mes = new Date().toISOString().slice(0, 7);
  const kMes = 'bytes:' + mes;
  const usado = parseInt(await env.LIMITES.get(kMes) || '0', 10);
  if (usado >= topeBytes) {
    return respuesta({ error: 'La galería alcanzó su límite de este mes. Escribinos y lo ampliamos.' }, 507);
  }
  ctx.waitUntil(env.LIMITES.put(kMes, String(usado + bytes), { expirationTtl: 60 * 60 * 24 * 70 }));

  const fid = cid();
  const doc = {
    tipo: esAudio ? 'audio' : 'texto',
    autor: { nombre, origen, token: autor.token ? String(autor.token).slice(0, 24) : null },
    estado: 'pendiente',
    tsms: ahora
  };

  if (esAudio) {
    /* El iPhone graba audio/mp4 y Android webm. Se acepta lo que venga y se
       guarda con la extensión que corresponde: dar por hecho 'webm' deja los
       audios de iPhone sin poder reproducirse. */
    const ext = /mp4|m4a|aac/.test(audio.type || '') ? 'm4a' : 'webm';
    const key = 'g/' + gid + '/f/' + fid + '.' + ext;
    await env.BUCKET.put(key, audio.stream(), {
      httpMetadata: { contentType: audio.type || 'audio/webm' }
    });
    doc.r2 = { key, bytes: audio.size, segundos };
    /* Un audio no se puede filtrar solo: lo escucha una persona. Queda dicho
       en el doc para que el panel no muestre un "filtro OK" que es mentira. */
    doc.mod = { motor: 'ninguno', falla: 'los audios no pasan por filtro automático' };
    doc.estado = 'pendiente';
  } else {
    doc.texto = texto;
    const sucio = palabrota(texto);
    doc.mod = sucio
      ? { motor: 'lista', score: 1, palabra: sucio }
      : { motor: 'lista', score: 0 };
    /* Con el evento en automático, un texto limpio sale solo; uno marcado
       espera SIEMPRE. La lista negra no aprueba: sólo frena. */
    doc.estado = (ev.modo === 'auto' && !sucio) ? 'aprobada' : 'pendiente';
  }

  await escribirFirma(env, gid, fid, doc);
  return respuesta({ ok: true, estado: doc.estado }, 200);
}

/* Lista corta y honesta: el filtro de verdad es la persona que modera.
   Sirve para que lo obvio no llegue nunca a la pantalla del salón. */
const FEAS = ['puta','puto','conchud','forr','pelotud','boluda de mierda','mierda','carajo',
  'verga','pendej','cul0','concha de','hijo de puta','hdp','trol@','sorete'];
function palabrota(t) {
  const limpio = String(t).toLowerCase()
    .normalize('NFD').replace(TILDES, '')                /* saca tildes */
    .replace(/[0@$]/g, (c) => ({ '0': 'o', '@': 'a', '$': 's' }[c]))
    .replace(/(.)\1{2,}/g, '$1$1');                     /* "putaaaa" -> "putaa" */
  for (const p of FEAS) if (limpio.includes(p.replace(/[0@$]/g, (c) => ({ '0':'o','@':'a','$':'s' }[c])))) return p;
  return null;
}

async function escribirFirma(env, gid, fid, doc) {
  const t = await tokenGoogle(env);
  const r = await fetch(FS + '/gal_firmas/' + gid + '/items/' + fid, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: aFirestore(doc) })
  });
  if (!r.ok) throw new Error('firestore firma ' + r.status);
}

/* ---------------- el vencimiento de los créditos ----------------
   Decisión de Maki (1/9/2026): los créditos vencen al año, y el vencimiento
   es UNO POR CUENTA, no uno por crédito. Cuando ella carga créditos, pone (o
   corre) la fecha. Es como vende Selpix sus packs y es lo único que un
   fotógrafo entiende de un vistazo.

   Se guarda como texto 'YYYY-MM-DD' a propósito, no como timestamp: así se
   compara con < entre textos (que en ese formato ordena bien), se lee de un
   vistazo en la consola de Firebase, y no hay que pelear con tipos.

   Cuenta SIN 'vence' (o vacío) = no vence nunca. Las cuentas viejas siguen
   andando igual: agregar el campo no rompe a nadie. */

/* Hoy, corrido 12 horas para atrás. El Worker piensa en UTC y los clientes
   están en UTC-3 (Argentina) y UTC-6/-7 (México): sin el margen, a un
   mexicano se le vencerían los créditos a las 6 de la tarde del último día.
   Ante la duda, errar por generoso: nadie se enoja porque le duren de más. */
function hoyGeneroso() {
  return new Date(Date.now() - 12 * 3600 * 1000).toISOString().slice(0, 10);
}

/* 'YYYY-MM-DD' de verdad. La expresión regular sola deja pasar 2027-13-45:
   por eso además se arma la fecha y se comprueba que vuelva igual. */
function fechaValida(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function fechaLinda(v) {
  const p = String(v).split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(v);
}

/* ---------------- créditos ---------------- */
/* Descuenta 1 crédito con bloqueo optimista: leo el saldo y su updateTime,
   y descuento SÓLO si nadie tocó la cuenta en el medio. Si alguien la tocó,
   vuelvo a leer y lo intento otra vez.

   Por qué no alcanza con "increment -1" solo: increment nunca pierde una
   escritura, pero tampoco mira el saldo. Sin la precondición, dos altas al
   mismo tiempo con 1 crédito dejan la cuenta en -1 y crean dos fiestas.
   Por qué no alcanza con la precondición sola: no suma. Van las dos. */
async function cobrarCredito(env, uid) {
  const t = await tokenGoogle(env);
  for (let intento = 0; intento < 4; intento++) {
    const r = await fetch(FS + '/gal_cuentas/' + uid, { headers: { Authorization: 'Bearer ' + t } });
    if (r.status === 404) {
      return { ok: false, status: 403, error: 'Tu cuenta todavía no está habilitada. Escribinos.' };
    }
    if (!r.ok) return { ok: false, status: 502, error: 'No se pudo leer tu cuenta. Probá de nuevo.' };
    const j = await r.json();
    const d = desdeFirestore(j.fields || {});
    if (d.estado === 'baja') return { ok: false, status: 403, error: 'Tu cuenta está dada de baja.' };
    const saldo = parseInt(d.creditos, 10) || 0;

    /* El vencimiento va ANTES del saldo: 'tenés 38 créditos pero vencieron'
       es lo que la persona necesita escuchar, y si además está en cero el
       mensaje sigue sirviendo (igual tiene que renovar). */
    const vence = String(d.vence || '').trim();
    if (vence && vence < hoyGeneroso()) {
      return {
        ok: false, status: 402, vencido: true, saldo,
        error: 'Tus créditos vencieron el ' + fechaLinda(vence) + '. Escribinos para renovarlos.'
      };
    }

    if (saldo < 1) return { ok: false, status: 402, error: 'Te quedaste sin créditos.', saldo: 0 };

    const c = await fetch(FS + ':commit', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [{
          transform: {
            document: DOCS + '/gal_cuentas/' + uid,
            fieldTransforms: [
              { fieldPath: 'creditos', increment: { integerValue: '-1' } },
              { fieldPath: 'creados', increment: { integerValue: '1' } }
            ]
          },
          currentDocument: { updateTime: j.updateTime }
        }]
      })
    });
    if (c.ok) return { ok: true, saldo: saldo - 1 };
    /* 400/409 = alguien tocó la cuenta entre el leer y el descontar. */
    if (c.status !== 400 && c.status !== 409) {
      return { ok: false, status: 502, error: 'No se pudo descontar el crédito. Probá de nuevo.' };
    }
  }
  return { ok: false, status: 503, error: 'Está muy ocupado. Probá de nuevo en un momento.' };
}

/* Devolver no lleva precondición: sumar siempre es seguro, y esto corre
   cuando algo ya salió mal. Que no falle otra vez por una carrera. */
async function devolverCredito(env, uid) {
  const t = await tokenGoogle(env);
  await fetch(FS + ':commit', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        transform: {
          document: DOCS + '/gal_cuentas/' + uid,
          fieldTransforms: [
            { fieldPath: 'creditos', increment: { integerValue: '1' } },
            { fieldPath: 'creados', increment: { integerValue: '-1' } }
          ]
        }
      }]
    })
  });
}

async function anotarEnLaCuenta(env, uid, gid, ev) {
  const t = await tokenGoogle(env);
  await fetch(FS + '/gal_cuentas/' + uid + '/eventos/' + gid, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: aFirestore({ gid, nombre: ev.nombre, fecha: ev.fecha, creado: ev.creado })
    })
  });
}

/* ---------------- quién está pidiendo ---------------- */
/* Verifica un ID token de Firebase. Es lo que reemplaza a la clave
   compartida: una clave que hay que meter en el navegador del cliente
   deja de ser una clave. Acá el navegador manda el token de SU sesión,
   que sólo sirve para él y se vence solo cada hora.

   Se usan las claves públicas en formato JWK, no los certificados X.509:
   crypto.subtle las importa tal cual y nos ahorramos parsear un
   certificado a mano, que es justo donde se cometen los errores. */
let clavesCache = { k: null, vence: 0 };
const JWKS = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

async function clavesGoogle() {
  if (clavesCache.k && Date.now() < clavesCache.vence) return clavesCache.k;
  const r = await fetch(JWKS);
  if (!r.ok) throw new Error('no bajaron las claves de Google');
  const j = await r.json();
  const m = {};
  for (const k of (j.keys || [])) if (k.kid) m[k.kid] = k;
  if (!Object.keys(m).length) throw new Error('claves de Google vacías');
  /* Google dice cuánto duran; le hacemos caso en vez de inventar un número. */
  const cc = r.headers.get('cache-control') || '';
  const mm = /max-age=(\d+)/.exec(cc);
  clavesCache = { k: m, vence: Date.now() + (mm ? parseInt(mm[1], 10) : 3600) * 1000 };
  return m;
}

async function verificarToken(req) {
  const h = req.headers.get('Authorization') || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!tok) return null;
  const p = tok.split('.');
  if (p.length !== 3) return null;

  let cab, cuerpo;
  try { cab = JSON.parse(textoB64url(p[0])); cuerpo = JSON.parse(textoB64url(p[1])); }
  catch (e) { return null; }
  if (cab.alg !== 'RS256' || !cab.kid) return null;

  const jwk = (await clavesGoogle())[cab.kid];
  if (!jwk) return null;

  const clave = await crypto.subtle.importKey('jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);

  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', clave,
    bytesB64url(p[2]), new TextEncoder().encode(p[0] + '.' + p[1]));
  if (!ok) return null;

  /* La firma sola no alcanza: un token de OTRO proyecto de Firebase también
     está bien firmado por Google. Hay que mirar para quién es. */
  const ahora = Math.floor(Date.now() / 1000);
  if (!(cuerpo.exp > ahora)) return null;
  if (!(cuerpo.iat <= ahora + 300)) return null;
  if (cuerpo.aud !== PROYECTO) return null;
  if (cuerpo.iss !== 'https://securetoken.google.com/' + PROYECTO) return null;
  if (typeof cuerpo.sub !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(cuerpo.sub)) return null;
  return { uid: cuerpo.sub, email: String(cuerpo.email || '').slice(0, 120) };
}

function bytesB64url(s) {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(t + '='.repeat((4 - t.length % 4) % 4));
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
function textoB64url(s) { return new TextDecoder().decode(bytesB64url(s)); }

/* ---------------- /f/<key> ---------------- */
async function servir(req, env, ctx, key, url) {
  /* Dos formas válidas y ninguna más:
       fotos   g/<gid>/<fid>.webp|jpg      (y su miniatura _t)
       audios  g/<gid>/f/<fid>.webm|m4a    (el libro de firmas)
     Si esto no acepta el audio, el saludo se guarda y NO se puede escuchar:
     el /f/ nuevo del medio y las extensiones nuevas hay que sumarlos acá. */
  const esFoto = /^g\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+(_t)?\.(webp|jpg)$/.test(key);
  const esAudio = /^g\/[A-Za-z0-9_-]+\/f\/[A-Za-z0-9_-]+\.(webm|m4a)$/.test(key);
  if (!esFoto && !esAudio) return respuesta({ error: 'no' }, 400);

  // Caché del borde: la misma foto no baja dos veces de R2.
  const cache = caches.default;
  const claveCache = new Request(url.origin + '/f/' + key);
  let r = await cache.match(claveCache);
  if (!r) {
    const obj = await env.BUCKET.get(key);
    if (!obj) return respuesta({ error: 'no está' }, 404);
    r = new Response(obj.body, {
      headers: {
        'Content-Type': obj.httpMetadata && obj.httpMetadata.contentType
          || (esAudio ? (key.endsWith('.m4a') ? 'audio/mp4' : 'audio/webm') : 'image/webp'),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
    ctx.waitUntil(cache.put(claveCache, r.clone()));
  }
  if (url.searchParams.get('dl')) {
    r = new Response(r.body, r);
    const nombreArchivo = esAudio
      ? 'saludo.' + (key.endsWith('.m4a') ? 'm4a' : 'webm')
      : 'foto.' + (key.endsWith('.jpg') ? 'jpg' : 'webp');
    r.headers.set('Content-Disposition', 'attachment; filename="' + nombreArchivo + '"');
  }
  return r;
}

/* ---------------- /uso: cuánto se lleva usado este mes ---------------- */
async function uso(env) {
  const topeGB = parseFloat(env.TOPE_GB || '8') || 8;
  const mes = new Date().toISOString().slice(0, 7);
  const usado = parseInt(await env.LIMITES.get('bytes:' + mes) || '0', 10);
  const usadoGB = usado / (1024 * 1024 * 1024);
  return respuesta({
    mes,
    usadoGB: Math.round(usadoGB * 1000) / 1000,
    topeGB,
    porcentaje: Math.round((usadoGB / topeGB) * 100),
    quedanFotos: Math.max(0, Math.floor((topeGB * 1024 * 1024 * 1024 - usado) / (350 * 1024)))
  }, 200);
}

/* ---------------- /qr ---------------- */
function qr(url) {
  const g = url.searchParams.get('g') || '';
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(g)) return respuesta({ error: 'no' }, 400);
  const destino = 'https://invitame.littlemomentsok.com/galeria/?g=' + g;
  return Response.redirect(
    'https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=2&data=' + encodeURIComponent(destino), 302);
}

/* ---------------- moderación (Sightengine) ----------------
   Nunca tira: devuelve {malo, score} si pudo juzgar, o {falla:'...'}
   con el motivo si no. El motivo se guarda en el doc de la foto —
   así una moderación rota se ve en el panel en vez de esconderse.
   En cualquier caso de falla la foto queda PENDIENTE: el filtro
   caído jamás aprueba solo.

   OJO con el nombre de los modelos: 'nudity' lleva version ('nudity-2.1')
   pero 'gore' NO. Escribir 'gore-2.1' hace que Sightengine conteste
   "Unknown model" y NINGUNA foto se modere — sin ruido, sin error visible.
   Ya nos pasó una vez; está contado en worker/PARCHE-modelo-gore.md. */
async function moderar(env, blob) {
  if (!env.SIGHTENGINE_USER || !env.SIGHTENGINE_SECRET)
    return { falla: 'sin claves de Sightengine' };
  const fd = new FormData();
  fd.append('media', blob, 't.webp');
  fd.append('models', 'nudity-2.1,gore');   // 'gore' va sin version (verificado en su doc)
  fd.append('api_user', String(env.SIGHTENGINE_USER).trim());
  fd.append('api_secret', String(env.SIGHTENGINE_SECRET).trim());
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 9000);   // 9 s: 4 era muy corto
  let r;
  try {
    r = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST', body: fd, signal: ctl.signal
    });
  } catch (e) {
    return { falla: 'no contestó a tiempo (' + String(e && e.name || e) + ')' };
  } finally { clearTimeout(timer); }
  let j;
  try { j = await r.json(); } catch (e) { return { falla: 'respuesta ilegible ' + r.status }; }
  if (j.status !== 'success')
    return { falla: 'rechazó: ' + String((j.error && (j.error.message || j.error.type)) || j.status).slice(0, 90) };
  const n = j.nudity || {};
  const peor = Math.max(n.sexual_activity || 0, n.sexual_display || 0, n.erotica || 0,
                        (j.gore && j.gore.prob) || 0);
  return { malo: peor > 0.5, score: Math.round(peor * 100) / 100 };
}

/* ---------------- Firestore por REST (service account) ---------------- */
let tokenCache = { t: null, vence: 0 };
async function tokenGoogle(env) {
  if (tokenCache.t && Date.now() < tokenCache.vence - 60000) return tokenCache.t;
  let SA_EMAIL = env.SA_EMAIL, SA_KEY = env.SA_KEY;
  if (env.SA_JSON) {
    try { const sj = JSON.parse(env.SA_JSON); SA_EMAIL = sj.client_email; SA_KEY = sj.private_key; }
    catch (e) { throw new Error('SA_JSON no es un JSON válido'); }
  }
  if (!SA_EMAIL || !SA_KEY) throw new Error('falta el service account (SA_JSON)');
  const ahora = Math.floor(Date.now() / 1000);
  const cab = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = b64url(JSON.stringify({
    iss: SA_EMAIL, scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token', iat: ahora, exp: ahora + 3600
  }));
  const clave = await importarClave(SA_KEY);
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

/* Dos formas del mismo lugar: la API de transformaciones pide el nombre
   del documento SIN el https adelante, y las otras llamadas piden la URL. */
const DOCS = 'projects/' + PROYECTO + '/databases/(default)/documents';
const FS = 'https://firestore.googleapis.com/v1/' + DOCS;

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
