#!/usr/bin/env node
/* ===== CHEQUEO DE CAMPOS DE INVÍTAME ========================================

   PARA QUÉ SIRVE
   Contesta, sin abrir nada a mano, las dos preguntas que siempre se escapan:
     1. ¿Hay algún campo en el panel que Jazmín pueda llenar y que la
        invitación no lea?  (ella carga algo y "no funciona")
     2. ¿La invitación lee algún dato que el panel no tenga cómo cargar?
        (falta un campo)
   Y además avisa de las trampas conocidas: dos rótulos que caen en la misma
   casilla, rótulos tan largos que la clave se corta, y archivos de /efectos/
   que nadie carga.

   CÓMO SE USA        node chequeo/campos.js        (desde la raíz del repo)
   Sale con código 1 si encuentra algo. Sirve para correrlo antes de entregar.

   TAMBIÉN MIRA LOS OTROS DOS CAMINOS (7/9/2026)
     3. Lo que llena el CLIENTE en /crear.html tiene que llegar al panel. Si un
        campo del formulario no lo levanta `cargarSolicitudIdx`, el cliente lo
        escribe y se evapora: Jazmín recibe la invitación a medio armar.
     4. Lo que tocan los NOVIOS en /mi-panel.html tiene que servir para algo:
        o lo usa su propio panel, o viaja a la invitación.

   ⚠️ LAS EXCEPCIONES QUE HAY QUE CONOCER — sin esto da falsos positivos:
     · Hay claves que se arman concatenando: 'c_ceremonia-'+(i+1)+'-fecha'.
       Por eso las claves con un número adentro se comparan con el molde.
     · Tres módulos de /efectos/ NO se cargan desde efectos/index.js:
       crear-muestra.js (lo carga firebase-inv.js), panel-audio-invitado.js
       (lo carga mi-panel.html) y terciopelo.js (lo pide botones.js cuando
       hace falta). No están muertos.
     · Parte de los datos los lee el servidor: i/index.php (las etiquetas para
       compartir), aviso-rsvp.php (el mail) y scan.html (el control de acceso).
     · El código del admin ya NO está en admin.html: vive en /admin/1..4.js.
       Acá se leen los cuatro y se pegan, así el chequeo no depende de dónde
       esté cada función.
     · Los siete `reg_*` de la mesa de regalos NO se copian uno por uno: van en
       un bucle `['reg_liverpool',…].forEach(k => D[k] = s[k])`. Buscar
       `s.reg_amazon` como texto no los encuentra.
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = process.argv[2] || '.';
const leer = p => { try { return fs.readFileSync(path.join(RAIZ, p), 'utf8'); } catch (e) { return ''; } };

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/* ---- 1. los campos del panel ------------------------------------------- */
/* ⚠️ 7/9/2026: el cerebro del admin dejó de estar adentro de admin.html y pasó
   a /admin/1..4. `admin` de acá abajo es LOS CUATRO pegados: así este chequeo
   sigue viendo lo mismo que antes, sin importar en qué archivo esté cada cosa. */
const PARTES = ['admin/0-claves.js','admin/1-campos.js','admin/2-panel.js','admin/3-evento.js','admin/4-solicitudes.js'];
const admin = PARTES.map(leer).join('\n') + '\n' + leer('admin.html');
const lineas = admin.split('\n');
const lnBind = lineas.findIndex(l => /const BIND\s*=/.test(l));
/* ⚠️ 7/9/2026: BIND se mudó a /admin/0-claves.js y pasó a ocupar muchas líneas,
   así que ya no alcanza con leer UNA línea: se lee el bloque entero hasta su `};`. */
let finBind = lnBind; while (!/^\s*\};/.test(lineas[finBind])) finBind++;
const BIND = {};
for (const m of lineas.slice(lnBind, finBind + 1).join('\n').matchAll(/"((?:[^"\\]|\\.)*)"\s*:\s*"([^"]*)"/g)) BIND[m[1].replace(/\\"/g, '"')] = m[2];
const lnF = lineas.findIndex(l => /const FIELDS\s*=/.test(l));
let fin = lnF; while (!/^\s*\};/.test(lineas[fin])) fin++;
const bloqueF = lineas.slice(lnF, fin + 1).join('\n');
const TABS = {};
for (const m of bloqueF.matchAll(/["']?([A-ZÓÍ_]+)["']?\s*:\s*\[([^\]]*)\]/g))
  TABS[m[1]] = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1].replace(/\\"/g, '"'));
const campos = [];
for (const t in TABS) for (const l of TABS[t]) campos.push({ tab: t, rotulo: l, clave: BIND[l] || ('c_' + slug(l)) });

/* ---- 2. todo el código que consume datos ------------------------------- */
const dirs = ['efectos', 'colecciones', 'sobres', 'muestras'];
let lector = ['i/index.html', 'i/index.php', 'aviso-rsvp.php', 'scan.html',
              'mi-panel.js', 'firebase-inv.js', 'crear.js'].map(leer).join('\n');
for (const d of dirs) { try { for (const f of fs.readdirSync(path.join(RAIZ, d))) if (f.endsWith('.js')) lector += '\n' + leer(d + '/' + f); } catch (e) {} }

const seLee = k => {
  if (lector.includes(k) || lector.includes('img_' + k)) return true;
  /* claves armadas por concatenación: c_ceremonia-1-fecha -> c_ceremonia-'+ */
  const num = k.match(/^(.*?)-?(\d+)-?(.*)$/);
  if (num) { const molde = num[1] + "-'+"; if (lector.includes(molde)) return true; }
  const ev = k.match(/^ev(\d)(.+)$/);
  if (ev && lector.includes("'ev'+") && lector.includes("+'" + ev[2] + "'")) return true;
  return false;
};

/* ---- 3. los avisos ------------------------------------------------------ */
const avisos = [];
/* campos que a propósito NO se leen: son notas internas para el equipo */
const SOLO_INTERNO = ['c_pedido-especial-del-cliente'];
const sinLector = campos.filter(c => !seLee(c.clave) && !SOLO_INTERNO.includes(c.clave));
if (sinLector.length) avisos.push(['CAMPOS QUE SE PUEDEN LLENAR Y NADIE LEE',
  sinLector.map(c => `${c.tab.padEnd(18)} ${c.rotulo.slice(0, 48).padEnd(50)} -> ${c.clave}`)]);

const sinCampo = Object.keys(BIND).filter(l => !campos.some(c => c.rotulo === l))
  .filter(l => { const k = BIND[l]; return lector.includes('ev.' + k) && !admin.includes(`setB('${k}'`) && !admin.includes(`setB(\\'${k}\\'`); });
if (sinCampo.length) avisos.push(['LA INVITACIÓN LO LEE Y EL PANEL NO TIENE CÓMO CARGARLO',
  sinCampo.map(l => `${l.slice(0, 50).padEnd(52)} -> ${BIND[l]}`)]);

const choque = {};
for (const c of campos) { if (BIND[c.rotulo]) continue; (choque[c.clave] = choque[c.clave] || new Set()).add(c.rotulo); }
const ch = Object.entries(choque).filter(([, v]) => v.size > 1);
if (ch.length) avisos.push(['DOS RÓTULOS DISTINTOS QUE GUARDAN EN LA MISMA CASILLA',
  ch.map(([k, v]) => `${k} <- ${[...v].join(' || ')}`)]);

const cortados = campos.filter(c => !BIND[c.rotulo] && slug(c.rotulo).length >= 40);
if (cortados.length) avisos.push(['RÓTULOS TAN LARGOS QUE LA CLAVE SE CORTA (si otro empieza igual, se pisan)',
  cortados.map(c => `${c.rotulo.slice(0, 52).padEnd(54)} -> ${c.clave}`)]);

/* ---- 4. archivos de /efectos/ que nadie carga --------------------------- */
/* Los que NO van en la lista de efectos/index.js porque los carga otro, y está
   bien que así sea. Si se suma uno acá, se explica POR QUÉ va aparte. */
const APARTE = {
  'crear-muestra.js': 'firebase-inv.js',
  'panel-audio-invitado.js': 'mi-panel.html',
  'terciopelo.js': 'botones.js (a pedido)',
  /* Va en la cabeza del documento, sin defer, puesto por i/index.php: tiene que
     correr ANTES de que exista la primera imagen. Cargado con los demás llega
     tarde y las fotos se bajan dos veces. */
  'imagenes-livianas.js': 'i/index.php (en la cabeza, antes que todo)',
  'todo.php': 'no es un modulo: es el paquete de todos'
};
const idx = leer('efectos/index.js');
let sueltos = [];
try {
  sueltos = fs.readdirSync(path.join(RAIZ, 'efectos')).filter(f => f.endsWith('.js') && f !== 'index.js')
    .filter(f => !idx.includes("'" + f.replace('.js', '') + "'") && !idx.includes('/' + f) && !APARTE[f]);
} catch (e) {}
if (sueltos.length) avisos.push(['ARCHIVOS DE /efectos/ QUE NADIE CARGA', sueltos]);

/* ---- 5. lo que llena el cliente, ¿llega al panel? ---------------------- */
const crear = leer('crear.js');
const iData = crear.indexOf('const data={');
if (iData > 0) {
  const bloque = crear.slice(iData, crear.indexOf('origen:', iData) + 40);
  const delCliente = new Set();
  for (const m of bloque.matchAll(/(?:^|[{,\s])([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g)) delCliente.add(m[1]);
  ['n1', 'fecha', 'invitados', 'pasevozOnda', 'tpl'].forEach(k => delCliente.add(k));
  /* estos son del pedido, no de la invitación: no tienen que viajar */
  const INTERNOS = ['estado', 'creado', 'origen', 'tplNombre', 'id',
                    'contactoNombre', 'contactoWsp', 'contactoEmail'];
  /* ⚠️ 8/9/2026: el mapeo dejó de estar adentro del admin y pasó a
     /solicitud-a-evento.js, que es EL MISMO que usa el formulario del cliente
     para que la invitación se cree sola. Si no se lo sumara acá, este chequeo
     avisaría que treinta campos «no llegan al panel» siendo mentira — y un
     aviso que miente se termina ignorando, que es peor que no tenerlo. */
  const carga = admin + leer('efectos/panel-solicitud-muestra.js') +
                leer('solicitud-a-evento.js');
  /* ⚠️ Claves armadas en un BUCLE. Los tres eventos se mapean con
     'ev' + i + 't', no escritos uno por uno. Sin esta regla, el chequeo
     avisaría de doce campos que SÍ llegan — y un aviso que miente se termina
     ignorando. Es la misma idea que ya usa el bloque 2 para las claves por
     concatenación. */
  const porBucle = k => {
    const m = k.match(/^([a-zA-Z]+)\d+([a-zA-Z]*)$/);
    /* ⚠️ Se exige ver la LECTURA de la solicitud —  s['ev' + i + 'maps']  —
       y no sólo el molde. Probado rompiéndolo a propósito: si el mapeo escribe
       la clave pero deja de leer el dato del cliente, esto salta igual. */
    return !!m && carga.includes("s['" + m[1] + "' + i + '" + m[2] + "']");
  };
  const perdidos = [...delCliente].filter(k =>
    !INTERNOS.includes(k) &&
    !carga.includes('s.' + k) && !carga.includes("s['" + k + "']") &&
    !carga.includes("'" + k + "'") &&    /* el bucle de los reg_* */
    !porBucle(k));
  if (perdidos.length) avisos.push(['LO LLENA EL CLIENTE Y NO LLEGA AL PANEL', perdidos]);
}

/* ---- 6. lo que tocan los novios, ¿sirve para algo? --------------------- */
const novios = leer('mi-panel.js');
const suyos = [...novios.matchAll(/guardarPanel\(\{\s*([a-zA-Z0-9_]+)/g)].map(m => m[1]);
if (suyos.length) {
  const usan = novios + admin + leer('scan.html') + leer('efectos/panel-itinerario.js');
  const inutiles = [...new Set(suyos)].filter(k => {
    /* se cuenta cuántas veces aparece: una sola es el propio guardarPanel */
    const veces = (usan.match(new RegExp('\\b' + k + '\\b', 'g')) || []).length;
    return veces <= 1;
  });
  if (inutiles.length) avisos.push(['LO GUARDAN LOS NOVIOS Y NO LO USA NADIE', inutiles]);
}

/* ---- 7. la boda de ejemplo, ¿queda a la vista? -------------------------
   `i/index.html` trae textos y fotos de una boda inventada para poder abrirlo
   suelto y para la vista previa del admin. Si el campo del panel queda VACÍO,
   el motor no los pisa y la invitada termina leyendo la boda de otra pareja.

   El motor tiene un bloque al final —"NADA DE LA BODA DE EJEMPLO"— que borra
   eso cuando no hay dato. Esta regla vigila que el bloque siga ahí, que la zona
   de prueba tenga el mismo, y que NADIE agregue contenido de ejemplo nuevo sin
   cubrirlo.

   ⚠️ Si esta regla salta porque agregaste una foto o un texto de ejemplo: no se
   silencia agregándolo a la lista de abajo sin más. Primero se decide QUIÉN lo
   tapa cuando no hay dato, y recién ahí se anota acá con esa explicación. */
const MARCA_BARRIDO = 'NADA DE LA BODA DE EJEMPLO';
const motor  = leer('i/index.html');
const motorP = leer('prueba/index.html');

/* Cada foto de ejemplo del HTML, y quién la tapa cuando la pareja no cargó la
   suya. Si aparece una que no está acá, el chequeo corta la entrega. */
const FOTOS_EJEMPLO = {
  'photo-1519741497674': 'portada (--cover) → degradé de la paleta si no hay foto propia',
  'photo-1583939003579': 'cierre (--final) → degradé de la paleta si no hay foto propia',
  'photo-1519225421980': 'banda de la frase (#bandbg) → degradé si no hay foto propia',
  'photo-1519167758481': 'tarjeta Ceremonia (.ph[data-imgbg]) → degradé si no hay foto propia',
  'photo-1464366400600': 'tarjeta Fiesta (.ph[data-imgbg]) → degradé si no hay foto propia',
  'photo-1566174053879': 'inspiración dress code → el bloque esconde el botón y la grilla',
  'photo-1595777457583': 'inspiración dress code → idem',
  'photo-1490481651871': 'inspiración dress code → idem',
  'photo-1544005313':    'avatar de Personas → la sección se esconde si no cargan gente',
  'photo-1560250097':    'avatar de Personas → idem',
  'photo-1573496359142': 'avatar de Personas → idem',
  'photo-1519085360753': 'avatar de Personas → idem',
  'photo-1522673607200': 'galería → la sección se esconde si no hay fotos',
  'photo-1511285560929': 'galería → idem',
  'photo-1465495976277': 'galería → idem'
};

/* Textos escritos a mano en el HTML que NO son de nadie: títulos y rótulos de
   sección. Estos sí pueden quedarse cuando el campo está vacío. */
const TEXTOS_GENERICOS = new Set([
  'cf-kick','cf-h2','cf-kick2','dq-kick','dq-h2','it-h2','it-nota','hosp-h2',
  'dress-h2','padres-kick','padres-h2','gal-kick','gal-h2','video-kick','video-h2',
  'video-frase','video-link','reg-kick','reg-h2','hashtag-big','hashtag-link',
  'ev1-t','ev2-t','ev3-t','ev1-cal','ev2-cal','ev3-cal',
  'clima-ico','clima-temp','clima-desc','clima-nota','rb-l1','rb-cbu','rb-tit','rb-banco',
  /* la trivia: son rótulos de la mecánica del juego, no de la boda de nadie.
     Los 14 campos de la pestaña TRIVIA los pisan si Jazmín escribe algo. */
  'tv-kick','tv-h2','tv-bajada','tv-btn-login','tv-btn-start','tv-nosos',
  'tv-btn-salir','tv-lbl-puntaje','tv-lbl-tabla'
]);

if (!motor.includes(MARCA_BARRIDO))
  avisos.push(['EL MOTOR PERDIÓ EL BARRIDO DE LA BODA DE EJEMPLO', ['i/index.html']]);
if (!motorP.includes(MARCA_BARRIDO))
  avisos.push(['EL MOTOR PERDIÓ EL BARRIDO DE LA BODA DE EJEMPLO', ['prueba/index.html']]);

if (motor.includes(MARCA_BARRIDO) && motorP.includes(MARCA_BARRIDO)) {
  const trozo = t => t.slice(t.indexOf(MARCA_BARRIDO), t.indexOf('    // ---- Contacto:'));
  if (trozo(motor) !== trozo(motorP))
    avisos.push(['EL BARRIDO ES DISTINTO EN LA ZONA DE PRUEBA (tienen que ser iguales)',
      ['i/index.html vs prueba/index.html']]);

  /* fotos de ejemplo nuevas, sin nadie que las tape */
  const nuevas = [...new Set([...motor.matchAll(/photo-[0-9a-f]+/g)].map(m => m[0]))]
    .filter(p => !FOTOS_EJEMPLO[p]);
  if (nuevas.length) avisos.push(['FOTOS DE EJEMPLO NUEVAS EN EL HTML, SIN DECIDIR QUIÉN LAS TAPA',
    nuevas.map(p => `${p}  ->  decidir quién la borra cuando no hay dato, y anotarlo en chequeo/campos.js`)]);

  /* textos de ejemplo: todo id con texto escrito a mano adentro de una sección
     tiene que ser genérico, o estar nombrado en el barrido */
  const barrido = trozo(motor);
  const sinCubrir = [];
  for (const sec of motor.matchAll(/<section data-sec="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)) {
    for (const n of sec[2].matchAll(/<(h1|h2|h3|p|div|span|a|button)([^>]*\bid="([^"]+)"[^>]*)>([^<]{1,200})<\/\1>/g)) {
      const id = n[3], txt = n[4].trim();
      if (!txt) continue;
      if (TEXTOS_GENERICOS.has(id)) continue;
      if (barrido.includes("'" + id + "'")) continue;
      /* ⚠️ el barrido arma algunos ids por pedazos ('ev'+n+'-s'), así que no
         aparecen escritos enteros. Mismo tropiezo que con las claves del panel:
         antes de cantar un faltante hay que probar el molde. */
      if (/^ev[123]-s$/.test(id) && barrido.includes("'ev'+n+'-s'")) continue;
      if (/^ev[123]-a$/.test(id) && barrido.includes("'ev'+n+'-a'")) continue;
      if (id === 'cf-texto' && barrido.includes("carta-sec")) continue;
      sinCubrir.push(`${sec[1].padEnd(14)} #${id.padEnd(14)} ${txt.slice(0, 46)}`);
    }
  }
  if (sinCubrir.length) avisos.push(['TEXTO DE EJEMPLO QUE NADIE BORRA CUANDO EL CAMPO ESTÁ VACÍO', sinCubrir]);
}

/* ---- 8. el informe ------------------------------------------------------ */
console.log(`campos del panel: ${campos.length}   ·   con clave fija: ${campos.filter(c => BIND[c.rotulo]).length}   ·   derivada del rótulo: ${campos.filter(c => !BIND[c.rotulo]).length}`);
console.log('');
if (!avisos.length) { console.log('SIN AVISOS — todo campo tiene lector y todo lector tiene campo.'); process.exit(0); }
for (const [t, filas] of avisos) { console.log(`=== ${t} (${filas.length}) ===`); filas.forEach(f => console.log('   ' + f)); console.log(''); }
process.exit(1);
