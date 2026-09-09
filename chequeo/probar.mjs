/* ===== BANCO DE PRUEBAS DE INVÍTAME — CORRE EN LA MAC =========================

   POR QUÉ ESTO CORRE ACÁ Y NO EN EL SERVIDOR DE CLAUDE
   Porque probar una copia no sirve. El sandbox de Claude no alcanza
   invitame.littlemomentsok.com (la red se lo bloquea) y tampoco puede correr el
   motor de Safari. Entonces probaría un espejo local con un navegador parecido,
   y eso es exactamente lo que falló antes: "andaba" en un lado y en la realidad
   estaba roto.

   Acá corre contra la URL DE VERDAD, con el motor DE VERDAD de Safari (WebKit,
   el mismo que usa Safari) y con Chrome de verdad. En la Mac de Maki.

   QUÉ DEJA
   Un `resultado.txt` en lenguaje humano y una captura por escenario, en esta
   misma carpeta. Claude lee esa carpeta, así que alcanza con correrlo.

   CÓMO SE CORRE
   Doble clic en `probar.command`. Nada más.
   O desde la terminal:  node probar.mjs
   Para probar otra invitación:  node probar.mjs otro-slug
   ============================================================================ */

import { webkit, chromium, devices } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

const SLUG = process.argv[2] || 'camila-y-tomas';   /* la muestra oficial: regina-y-santiago ya no existe */

/* `INV_URL` e `INV_MOTORES` existen para poder probar EL PROBADOR contra un
   espejo local antes de entregarlo. En la Mac no hace falta tocarlas: sin
   ellas apunta a la invitación de verdad y corre los tres escenarios. */
const URL_BASE = process.env.INV_URL || ('https://invitame.littlemomentsok.com/i/?e=' + SLUG);
const MOTORES  = (process.env.INV_MOTORES || 'safari-escritorio,safari-iphone,safari-ipad,chrome-escritorio').split(',');
const AQUI = path.dirname(new URL(import.meta.url).pathname);

/* ===== PROBAR COMO UN INVITADO, NO COMO UNA COMPUTADORA DE LABORATORIO ======

   ⚠️ ESTA ES LA LECCIÓN MÁS CARA DE TODAS.

   Los tres bugs peores que tuvo la invitación —el sobre roto, la portada de
   otra pareja, la portada saliéndose a lo ancho— eran TODOS carreras: cosas
   que se ven mal en el primer segundo, hasta que llega un archivo que viene
   por la red. En una máquina rápida con la caché caliente, ese archivo llega
   en 5 milisegundos y NO SE VE NADA. El bug existe igual: sólo que no aparece
   donde lo estamos mirando.

   Y así fue como pasó de verdad: se probaba, daba verde, y Maki lo abría en su
   teléfono y estaba roto.

   Un invitado de verdad abre la invitación:
     · con la caché VACÍA (es la primera vez que entra)
     · con el 4G del celular, no con fibra
     · en un teléfono, no en un monitor

   Por eso acá se RETRASA cada pedido a propósito. No es "hacer la prueba más
   lenta": es la única forma de que las carreras existan y se puedan ver.

   ⚠️ SI ALGUIEN PONE `RED=rapida` PARA QUE TERMINE ANTES, VUELVE A NO ENCONTRAR
   NADA. Rápida sirve sólo para depurar otra cosa, nunca para dar el visto bueno.

   La caché arranca vacía sola: cada corrida abre un navegador nuevo.
   ============================================================================ */
const RED = (process.env.RED || 'lenta').toLowerCase();
const DEMORA = RED === 'rapida' ? 0 : (RED === 'muylenta' ? 450 : 220);
const DEMORA_PESADOS = DEMORA * 3;      /* videos y fotos grandes tardan más */
const LENTO = DEMORA > 0;

/* con red lenta hay que esperar más antes de mirar */
const k = LENTO ? 2.2 : 1;

const lineas = [];
let fallos = 0, pasan = 0;

function log(t){ lineas.push(t); console.log(t); }
function chequear(nombre, ok, detalle){
  if (ok) { pasan++; log('   BIEN   ' + nombre); }
  else    { fallos++; log('   MAL    ' + nombre + '\n             -> ' + detalle); }
}

/* ⚠️ El voseo argentino no va: el mercado es México. */
const VOSEO = ['Rascá','Compartí','Pasá','Tocá','Ingresá','Sumá','Subí','sugerí',
               'Jugá','Escuchá','querés','podés','tenés','Recargá','Esperá','Abrí','Mirá'];

async function escenario(nombre, tipo, opciones, esTablet){
  log('\n──────────────────────────────────────────');
  log('  ' + nombre);
  log('──────────────────────────────────────────');

  const motor = tipo === 'webkit' ? webkit : chromium;
  const br = await motor.launch();
  /* ⚠️ EL NAVEGADOR SE CIERRA SIEMPRE, PASE LO QUE PASE (9/9/2026).
     Antes el `br.close()` estaba sólo al final: si un escenario se caía a la
     mitad, ese navegador quedaba abierto y seguía comiendo memoria mientras
     corrían los otros tres. En la Mac de Maki sobra memoria y nunca se notó;
     en el runner de GitHub el cuarto escenario moría con «Target page, context
     or browser has been closed» y parecía que no había podido ni arrancar.
     No era eso: era el escenario anterior que nunca soltó el navegador.
     Por eso todo el cuerpo va adentro de un try/finally. */
  try {
  const ctx = await br.newContext(opciones);
  const page = await ctx.newPage();

  const erroresJS = [];
  /* ⚠️ EL CANAL DE FIRESTORE NO ES UN ERROR DE LA INVITACIÓN (9/9/2026).
     Desde que el banco hace el viaje a la galería y vuelve, cada navegación
     corta el canal `Listen` que Firestore deja abierto, y WebKit lo reporta
     como error de página. Salían dos «errores de JavaScript» en tres
     escenarios y ninguno era del producto: era el banco cerrando la puerta.
     Se filtran SÓLO esos: cualquier otro error sigue siendo rojo. */
  const ruidoAjeno = [];
  page.on('pageerror', e => {
    const m = String(e.message);
    if (/firestore\.googleapis\.com.*Listen\/channel/.test(m)) return;
    /* ⚠️ LO QUE ROMPE UN SERVICIO AJENO NO ES UN BUG DE LA INVITACIÓN (9/9/2026).
       Desde que el banco corre en GitHub, Spotify contesta con «access control
       checks» a su propio apresolve: bloquea las peticiones que salen de un
       datacenter. En la casa de un invitado eso no pasa. Daba rojo un escenario
       entero por algo que no es del producto y que nosotros no podemos arreglar.
       Regla: si el mensaje nombra un dominio que NO es nuestro y es una falla de
       red o de permisos, se anota aparte y no cuenta. Cualquier otro error
       —y cualquier error de littlemomentsok.com— sigue siendo rojo. */
    /* ⚠️ EL MENSAJE PUEDE NO TRAER `http://` (9/9/2026).
       Primer intento: buscaba `https?://` para sacar el dominio. Safari escribe
       el de Spotify como «/apresolve.spotify.com/?type=...», sin esquema, asi
       que el dominio salia vacio y el error seguia contando. Se busca cualquier
       cosa con forma de dominio, con o sin esquema. */
    const host = ((m.match(/https?:\/\/([^\/\s)]+)/) ||
                   m.match(/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})/i)) || [])[1] || '';
    const ajeno = host && !/littlemomentsok\.com$/.test(host);
    const deRed = /access control checks|Failed to load|Load failed|network error|ERR_/i.test(m);
    if (ajeno && deRed) { ruidoAjeno.push(host); return; }
    erroresJS.push(m.slice(0,140));
  });

  /* ⚠️ TODO LO QUE PIDE LA INVITACIÓN. Se anota para tres chequeos nuevos del
     8/9/2026: cuántos archivos pide, si los módulos vinieron en un solo
     paquete, y si alguna foto viaja sin optimizar. Maki: «con wifi y todo no
     carga, tarda muchísimo». */
  const pedidos = [];
  /* ⚠️ SE GUARDA TAMBIEN COMO SE PIDIO CADA COSA (9/9/2026).
     Con la lista de direcciones sola, cinco fotos pesadas aparecian en el
     informe y no habia forma de saber de donde salian: no estan en el repo, no
     estan en el documento del evento, no estan en el paquete de modulos. Sin
     saber quien las pide no se arregla en el origen, y parchear a ciegas es
     justo lo que no hay que hacer. Ahora se anota el tipo de pedido y en que
     marco ocurrio. */
  const comoSePidio = new Map();
  page.on('request', r => {
    pedidos.push(r.url());
    try { comoSePidio.set(r.url(), r.resourceType()); } catch (e) {}
  });

  /* la red del celular: cada pedido tarda, como en la vida real */
  if (LENTO) {
    await page.route('**/*', async r => {
      const u = r.request().url();
      const pesado = /\.(mp4|mov|webm|jpg|jpeg|png|webp)(\?|$)/i.test(u);
      await new Promise(x => setTimeout(x, pesado ? DEMORA_PESADOS : DEMORA));
      await r.continue();
    });
  }

  const cronometro = Date.now();
  await page.goto(URL_BASE, { waitUntil: 'domcontentloaded', timeout: 90000 });

  /* ⚠️ LA TIRA DEL PRIMER SEGUNDO.
     Los bugs que más molestaron no los encontró ningún chequeo: los encontró
     una captura. Por eso ahora se guardan tres momentos del arranque, que es
     donde viven las carreras. Mirarlas es parte del trabajo, no un extra. */
  const tira = async (n, etiqueta) => {
    const archivo = 'tira-' + nombre.toLowerCase().replace(/[^a-z0-9]+/g,'-') +
                    '-' + n + '-' + etiqueta + '.png';
    try { await page.screenshot({ path: path.join(AQUI, archivo) }); } catch (e) {}
  };

  /* ---- 1 · EL PRIMER PINTADO -------------------------------------------
     Acá es donde aparecía el sobre roto y la portada de otra pareja. Se mira
     enseguida, ANTES de que corra ningún script de la página. */
  await page.waitForTimeout(150);
  const inicio = await page.evaluate(() => {
    /* ⚠️ NO ALCANZA CON CONTAR: hay que decir QUÉ PIEZA quedó a la vista.
       El 8/9/2026 el chequeo dijo «4 piezas» cuatro veces y no se pudo
       arreglar nada, porque adentro de #env conviven cuatro sobres
       superpuestos y «4» puede ser cualquiera de ellos. Un chequeo que dice
       que algo está mal pero no dice qué, obliga a adivinar. */
    /* ⚠️⚠️ «SE VE» NO ES «display distinto de none». Esta comprobación estuvo
       CIEGA hasta el 8/9/2026 y por poco me hace descartar un arreglo bueno:
       el sobre viejo se apagaba con `visibility:hidden` —o sea el invitado NO
       lo veía— y este chequeo lo seguía contando como visible, cuatro veces,
       en los cuatro navegadores.
       Es el MISMO error que ya se había pagado con los emojis (`offsetParent`).
       Un elemento no se ve si: display:none, visibility:hidden, opacity:0, o
       cualquiera de esas cosas en un ancestro. Eso es exactamente lo que
       responde `checkVisibility`, y para el navegador que no la tenga se hace
       a mano. Probado en las cuatro variantes antes de confiar en él. */
    const seVe = (e) => {
      if (e.checkVisibility) {
        return e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
               e.getBoundingClientRect().width > 60;
      }
      for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.01) return false;
      }
      return e.getBoundingClientRect().width > 60;
    };
    const piezas = [...document.querySelectorAll('#env .triflap,#env #scene,#env .ct-wrap')]
      .filter(seVe)
      .map(e => {
        const r = e.getBoundingClientRect(), s = getComputedStyle(e);
        return (e.id ? '#' + e.id : '.' + String(e.className).trim().split(/\s+/).join('.')) +
               ' ' + Math.round(r.width) + 'x' + Math.round(r.height) +
               ' [display:' + s.display + ' visibility:' + s.visibility + ' opacity:' + s.opacity + ']';
      });
    /* Y por las dudas: qué estado tienen las piezas AUNQUE no se vean. Si el
       arreglo del sobre dejara de aplicar, esto lo muestra sin adivinar. */
    const piezasEstado = [...document.querySelectorAll('#env .triflap,#env #scene,#env .ct-wrap')]
      .slice(0, 6)
      .map(e => { const s = getComputedStyle(e);
        return (e.id ? '#' + e.id : '.' + String(e.className).trim().split(/\s+/)[0]) +
               ':' + s.display + '/' + s.visibility; });
    const sobresViejos = piezas.length;
    const v = document.getElementById('env-vid');
    const b = v && v.getBoundingClientRect();
    const cover = getComputedStyle(document.documentElement).getPropertyValue('--cover');
    /* ⚠️ La columna de la invitación tiene que estar encuadrada YA, en el
       primer pintado. Antes ese `max-width` lo ponía un script diferido, así
       que el primer segundo la portada salía a lo ancho y asomaba el fondo por
       los costados; después "se acomodaba". Con la caché caliente no se veía. */
    const fr = document.querySelector('.frame');
    const fb = fr && fr.getBoundingClientRect();

    return {
      sobresViejos, piezas, piezasEstado,
      marcaSobreListo: !!(document.getElementById('env') && document.getElementById('env').classList.contains('inv-sobre-listo')),
      video: b ? { w: Math.round(b.width), h: Math.round(b.height) } : null,
      anchoVentana: innerWidth,
      coverEsDeStock: /unsplash|images\.unsplash/.test(cover),
      anchoMarco: fb ? Math.round(fb.width) : null
    };
  });

  chequear('no asoma otro sobre al abrir', inicio.sobresViejos === 0,
    inicio.sobresViejos + ' piezas a la vista: ' + inicio.piezas.join(' · ') +
    '  |  estado de las piezas a los 150 ms: ' + inicio.piezasEstado.join(' · ') +
    '  |  marca inv-sobre-listo: ' + (inicio.marcaSobreListo ? 'puesta' : 'todavia no'));

  /* ⚠️ EL NÚMERO DE PEDIDOS SE MIDE AL CARGAR, NO AL FINAL DEL RECORRIDO.
     El 8/9/2026 este chequeo daba 173 y parecía que habíamos empeorado. No:
     `pedidos` junta TODO lo que pide el robot en 90 segundos — abrir el sobre,
     raspar, dos recorridos completos y la tormenta de resize. El número con el
     que se lo comparaba (129) era de la CARGA INICIAL. Dos varas distintas.
     Ahora se mide lo mismo que se promete, y el total del recorrido queda
     al lado, como dato, sin dar rojo. */
  try { await page.waitForLoadState('load', { timeout: 30000 }); } catch (e) {}
  const pedidosAlCargar = pedidos.length;

  /* ⚠️ EL iPAD  (8/9/2026). Maki, tres veces: «no ocupa toda la pantalla, hasta
     parece lento de cargar». En una tablet la invitación va A TODO EL ANCHO y
     SIN la capa borrosa de fondo (esa capa fija con desenfoque es la que traba
     el scroll en Safari de iPad). El arreglo vivía en el módulo pero lo tapaba
     una copia vieja del CSS que inyecta i/index.php. */
  if (esTablet) {
    const tab = await page.evaluate(() => {
      const f = document.querySelector('.frame');
      const fb = f && f.getBoundingClientRect();
      const capa = document.getElementById('inv-lienzo');
      return {
        porciento: fb ? Math.round(fb.width / innerWidth * 100) : 0,
        hayCapa: !!(capa && getComputedStyle(capa).display !== 'none')
      };
    });
    chequear('en tablet la invitación ocupa la pantalla', tab.porciento >= 95,
      'ocupa el ' + tab.porciento + '% del ancho (antes: 57%)');
    chequear('en tablet no se arma la capa borrosa que traba el scroll', !tab.hayCapa,
      'la capa fija con desenfoque está a la vista');
  }

  chequear('la portada no es la de otra invitación', !inicio.coverEsDeStock,
    'la variable --cover todavía apunta a una foto de banco de imágenes');

  /* ⚠️ EN TABLET ESTE CHEQUEO NO APLICA, Y SE CONTRADECÍA CON EL DE ARRIBA:
     en una tablet la invitación DEBE ocupar todo el ancho (834 de 834), así
     que medir «el marco es angosto» daba MAL justo por hacer lo correcto.
     Dos chequeos que se pelean entre sí son peores que ninguno. */
  if (!esTablet && inicio.anchoVentana >= 680 && inicio.anchoMarco !== null) {
    chequear('la columna ya está encuadrada en el primer pintado',
      inicio.anchoMarco < inicio.anchoVentana * 0.75,
      'el marco mide ' + inicio.anchoMarco + ' px de ' + inicio.anchoVentana +
      ' — la portada sale a lo ancho hasta que corre el script');
  }

  /* ⚠️ El sobre puede pintarse por el <video> o por `#env::before` (la foto que
     se ve mientras el video baja). Antes se medía sólo el video y a los 150 ms
     todavía era 0x0: daba MAL sin que hubiera nada roto. Ahora se mide lo que
     de verdad está ocupando lugar, y si no hay nada medible se dice, no se
     inventa un fallo. */
  if (inicio.anchoVentana >= 680) {
    const caja = await page.evaluate(() => {
      const env = document.getElementById('env');
      if (!env) return null;
      const v = document.getElementById('env-vid');
      const b = v && v.getBoundingClientRect();
      if (b && b.width > 10) return { w: Math.round(b.width), h: Math.round(b.height), de: 'video' };
      const cs = getComputedStyle(env, '::before');
      const w = parseFloat(cs.width), h = parseFloat(cs.height);
      if (w > 10 && h > 10) return { w: Math.round(w), h: Math.round(h), de: 'foto del sobre' };
      return null;
    });
    if (!caja) {
      log('   ----   el sobre no se pudo medir todavía (no es un fallo)');
    } else {
      const prop = caja.w / caja.h;
      chequear('el sobre está encuadrado, no a pantalla completa',
        caja.w < inicio.anchoVentana * 0.75 && Math.abs(prop - 9/16) < 0.03,
        caja.w + 'x' + caja.h + ' (' + caja.de + ', proporción ' +
        prop.toFixed(3) + ', debería ser 0.563)');
    }
  }

  /* ⚠️ El voseo también hay que mirarlo ACÁ, en el primer pintado, no sólo al
     final. El chequeo del final daba verde porque para entonces el módulo de
     español ya había corregido — pero el invitado ya había leído "INGRESÁ" y
     "TOCÁ EL SELLO PARA ABRIR", que es el primer texto de toda la invitación.
     Lo encontró una captura de la tira, no un chequeo. */
  const voseoAlInicio = await page.evaluate((lista) => {
    const t = document.body ? document.body.innerText : '';
    return lista.filter(w => t.indexOf(w) > -1);
  }, VOSEO);
  chequear('sin voseo desde el primer pintado', voseoAlInicio.length === 0,
    'el primer segundo se lee: ' + voseoAlInicio.join(', '));

  await tira(1, 'apenas-abre');

  /* ---- 2 · ABRIR EL SOBRE ---------------------------------------------- */
  await page.waitForTimeout(3500 * k);
  await tira(2, 'sobre-cerrado');

  await page.evaluate(() => {
    const b = document.querySelector('#env button, #env .btn, #env a');
    if (b) b.click();
  });
  /* ⚠️ justo acá, apenas se toca el sello, es donde Maki vio la portada salirse
     a lo ancho. Se retrata antes de que el motor tenga tiempo de acomodarla. */
  await page.waitForTimeout(500);
  await tira(3, 'recien-tocado-el-sello');

  await page.waitForTimeout(4000 * k);

  /* ---- 2b · LA COLUMNA DE LA INVITACIÓN --------------------------------
     ⚠️ Este chequeo se agregó DESPUÉS de que una captura mostrara algo que
     ningún chequeo veía: en Safari la columna se iba achicando sola y el
     contador de días se salía por los costados. Se veía "416" cortado a la
     izquierda y los segundos cortados a la derecha.
     La causa era una medición que se realimentaba: se medía la portada que ya
     estaba limitada por la medición anterior.
     Por eso ahora se miran dos cosas: que la columna tenga un ancho decente y
     que NADA se salga de ella. */
  if (await page.evaluate(() => innerWidth >= 680)) {
    const col = await page.evaluate(() => {
      const f = document.querySelector('.frame');
      const p = document.querySelector('.portada');
      if (!f || !p) return null;
      const fr = f.getBoundingClientRect();
      let desborde = 0, culpable = '';
      /* ⚠️ SÓLO SE MIRA TEXTO. Alrededor de la portada flotan hojitas y
         pétalos decorativos que SALEN A PROPÓSITO de la columna: contarlos
         daba un rojo falso de 21 px en todos los navegadores. Lo que importa
         es que no se corte nada que se lea — que fue el bug de verdad: el
         contador de días quedaba cortado por los dos costados. */
      p.querySelectorAll('*').forEach(e => {
        if (e.children.length) return;                 /* sólo las hojas del árbol */
        const txt = (e.textContent || '').trim();
        if (!txt) return;                              /* sin texto no interesa */
        const cs = getComputedStyle(e);
        if (cs.visibility === 'hidden' || cs.display === 'none') return;
        if (parseFloat(cs.opacity) < 0.1) return;
        const b = e.getBoundingClientRect();
        if (b.width < 2 || b.height < 2) return;
        const d = Math.round(Math.max(fr.left - b.left, b.right - fr.right));
        if (d > desborde) { desborde = d; culpable = txt.slice(0, 24); }
      });
      return { ancho: Math.round(fr.width), desborde, culpable };
    });
    if (col) {
      chequear('la columna tiene un ancho normal', col.ancho >= 320,
        'quedó en ' + col.ancho + ' px, que ya es una tira');
      chequear('no se sale nada de la columna', col.desborde <= 2,
        'se sale ' + col.desborde + ' px — "' + col.culpable + '"');
    }
  }

  /* ---- 3 · LA RASPADITA -------------------------------------------------
     El bug de Safari: las tapas caían al lado de los números porque se medía
     antes de que cargaran las tipografías. */
  const rasp = await page.evaluate(() => {
    const card = document.getElementById('scratchcard');
    if (!card) return { hay:false };
    const piezas = [...card.querySelectorAll('[data-rasp]')]
      .filter(e => e.getAttribute('data-rasp') !== '0');
    const zonas = [...card.querySelectorAll('.rasp-zona')];
    const desvios = piezas.map((p,i) => {
      const z = zonas[i]; if (!z) return 9999;
      const a = p.getBoundingClientRect(), b = z.getBoundingClientRect();
      return Math.round(Math.max(Math.abs(a.left-b.left), Math.abs(a.top-b.top)));
    });
    return { hay:true, piezas: piezas.length, zonas: zonas.length, desvios };
  });

  if (rasp.hay && rasp.piezas > 0) {
    chequear('la raspadita pone una tapa por número',
      rasp.zonas === rasp.piezas, rasp.piezas + ' números pero ' + rasp.zonas + ' tapas');
    const peor = Math.max(0, ...(rasp.desvios.length ? rasp.desvios : [0]));
    chequear('las tapas caen justo encima de los números',
      peor <= 3, 'la peor está corrida ' + peor + ' px');
  }

  /* ---- 4 · RASPAR Y QUE NO SE VUELVA A TAPAR ---------------------------
     El otro bug: cualquier resize la reponía. En el celular el scroll dispara
     resize todo el tiempo. */
  if (rasp.hay && rasp.zonas > 0) {
    const raspado = await page.evaluate(async () => {
      function ev(t,x,y){ return new MouseEvent(t,{clientX:x,clientY:y,bubbles:true}); }
      const zonas = [...document.querySelectorAll('.rasp-zona')];
      for (const z of zonas) {
        z.classList.remove('dormida');
        const cv = z.querySelector('canvas'); if (!cv) continue;
        const r = cv.getBoundingClientRect();
        cv.dispatchEvent(ev('mousedown', r.left+4, r.top+4));
        for (let i=0;i<=22;i++) for (let j=0;j<=8;j++)
          cv.dispatchEvent(ev('mousemove', r.left+(r.width*i/22), r.top+(r.height*j/8)));
        window.dispatchEvent(ev('mouseup', r.left, r.top));
        await new Promise(x=>setTimeout(x,650));
      }
      return document.querySelectorAll('.rasp-zona.lista').length;
    });
    chequear('se puede raspar y se revela la fecha',
      raspado === rasp.zonas, 'se revelaron ' + raspado + ' de ' + rasp.zonas);

    /* la tormenta de resize, como cuando se scrollea en el celular */
    await page.evaluate(async () => {
      for (let i=0;i<8;i++){ window.dispatchEvent(new Event('resize')); await new Promise(r=>setTimeout(r,220)); }
    });
    await page.waitForTimeout(1500);
    const siguen = await page.evaluate(() => ({
      zonas: document.querySelectorAll('.rasp-zona').length,
      listas: document.querySelectorAll('.rasp-zona.lista').length
    }));
    chequear('una vez raspada, queda raspada',
      siguen.listas === siguen.zonas && siguen.zonas > 0,
      'volvieron a taparse ' + (siguen.zonas - siguen.listas));
  }

  /* ---- 5 · ESPAÑOL DE MÉXICO ------------------------------------------- */
  const voseo = await page.evaluate((lista) => {
    const t = document.body.innerText;
    return lista.filter(w => t.indexOf(w) > -1);
  }, VOSEO);
  chequear('está en español de México, sin voseo', voseo.length === 0,
    'quedó: ' + voseo.join(', '));

  /* ---- 6 · NADA DE LA BODA DE EJEMPLO ----------------------------------
     El motor trae una boda inventada escrita a mano en el HTML (lugares,
     horarios, hoteles, padres, código de vestimenta). Sólo la PISA cuando hay
     dato: si la clienta dejó el campo vacío, se queda la de ejemplo y el
     invitado ve los datos de otra pareja. Pasó de verdad — unos XV mostraban
     la ceremonia en la Basílica de Santa María el 28 de noviembre.
     Lo apaga el servidor con la tabla de `i/sin-demo.php`.

     ⚠️ Sólo cuenta lo que SE VE. Estos textos están en el HTML de todas las
     invitaciones aunque estén apagados: mirar `innerText` a secas da falso
     positivo. Por eso se recorren los elementos HOJA y se descartan los que
     tienen display:none, visibility:hidden o ancho 0.                      */
  const DEMO = [
    'Basílica de Santa María',
    'Masía Mas Badó',
    'Juan Vázquez de Mella 525',
    'Hotel Los Robles', 'Posada del Valle', 'Cabañas El Sauce',
    'Irene Estrada', 'Rafael Lizama', 'Carmen Ruiz', 'Jorge Medina',
    'reservar el blanco para la novia',
    'Almuerzo y brindis de los novios',
    'A bailar hasta el amanecer'
  ];
  const demoVisible = await page.evaluate((lista) => {
    const encontrados = new Set();
    document.querySelectorAll('body *').forEach(el => {
      if (el.children.length) return;                 // sólo hojas
      const t = (el.textContent || '').trim();
      if (!t) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (!el.getBoundingClientRect().width) return;
      lista.forEach(m => { if (t.includes(m)) encontrados.add(m); });
    });
    return [...encontrados];
  }, DEMO);
  chequear('no se ve nada de la boda de ejemplo', demoVisible.length === 0,
    'quedó a la vista: ' + demoVisible.join(' · '));

  /* ---- 7 · QUE NO SE PISEN LOS BOTONES FLOTANTES -----------------------
     El botón del menú (#navbtn) y el de WhatsApp (.wafloat) estaban anclados a
     la misma esquina con el mismo margen: quedaban uno ENCIMA del otro, 46x46
     px de superposición. Se veía una medialuna verde asomando por detrás, y el
     de WhatsApp era intocable porque el menú tiene más z-index.

     ⚠️ POR QUÉ NINGÚN CHEQUEO LO ENCONTRÓ: los dos botones existían, los dos
     estaban "visibles", y cada uno POR SEPARADO estaba perfecto. El error era
     la relación entre los dos. Apareció mirando la captura, no los números.
     Por eso ahora se comparan de a pares.                                   */
  const encimados = await page.evaluate(() => {
    const cajas = [];
    document.querySelectorAll('body *').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') return;
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.width > 120 || r.height < 24 || r.height > 120) return;
      cajas.push({ n: el.id || el.className || el.tagName, r });
    });
    const choques = [];
    for (let i = 0; i < cajas.length; i++)
      for (let j = i + 1; j < cajas.length; j++) {
        const a = cajas[i].r, b = cajas[j].r;
        const sx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const sy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (sx > 4 && sy > 4)
          choques.push(cajas[i].n + ' pisa a ' + cajas[j].n +
                       ' (' + Math.round(sx) + 'x' + Math.round(sy) + ' px)');
      }
    return choques;
  });
  chequear('los botones flotantes no se pisan', encimados.length === 0,
    encimados.join(' · '));

  /* ---- 8 · QUE TODO SE LEA --------------------------------------------
     Mide el contraste de cada texto contra lo que tiene DETRÁS. Regla de
     accesibilidad: 4.5 en texto normal, 3 en texto grande (24px, o 19px en
     negrita). Debajo de eso hay gente que directamente no lo lee.

     No es teórico: al escribirlo, la invitación tenía ONCE textos por debajo
     del mínimo, incluido "INGRESA" con 1.1. La causa de casi todos era la
     misma: el motor usaba verdes apagados (--sage, --muted) como color de
     texto. Se cambiaron por oro viejo y gris cálido y quedaron en cero.

     ⚠️⚠️ ESTE CHEQUEO SALIÓ MAL VARIAS VECES. Conviene leer por qué, porque el
     error de fondo se repite en cualquier chequeo visual.

     Las primeras versiones preguntaban "¿qué tengo encima en el ÁRBOL?", o sea
     subiendo por los padres. Eso NO SIRVE, y por una razón simple: el árbol no
     dice quién está ADELANTE. La portada tiene un fondo crema opaco y la foto
     es una capa aparte, encima del crema pero debajo del texto. Subiendo por
     los padres siempre aparecía primero el crema, que el invitado nunca ve.
     Resultado: acusaba que "Regina & Santiago" no se leía, cuando se lee
     perfecto.

     La pregunta correcta es "¿qué hay dibujado debajo de este punto de la
     PANTALLA?", y la contesta `elementsFromPoint`, que devuelve la pila real
     de adelante hacia atrás.

     Y todavía faltaban tres cosas, cada una descubierta por un falso positivo:
       · LAS FOTOS EN PSEUDO-ELEMENTOS. La foto del sobre vive en
         `#env::before`, y el velo de las fotos en `.capa::after`. El navegador
         las dibuja pero NO aparecen en la pila. Hay que preguntar aparte por
         `::before` y `::after`.
       · LAS TRANSPARENCIAS. El botón "Ingresa" tiene fondo semitransparente
         sobre el sobre. Leer ese color como si fuera sólido da un número
         falso: hay que MEZCLARLO con lo que tiene detrás, como hace el
         navegador.
       · LO QUE SE ESTÁ DESVANECIENDO. El sobre no se apaga: baja a opacidad
         0.15 mientras el invitado scrollea. Su texto ya no se ve, pero seguía
         midiéndose. Hay que multiplicar las opacidades de todos los padres.

     ⚠️ POR ESO HAY QUE SCROLLEAR. `elementsFromPoint` sólo ve lo que está en
     pantalla: sin recorrer la página quedaban 100 textos sin mirar.

     ⚠️ LO QUE CAE SOBRE UNA FOTO NO SE MIDE, A PROPÓSITO. Ahí el contraste
     cambia píxel a píxel y cualquier número sería inventado. Eso se revisa
     mirando la captura `entera-…png`, y se resuelve con el velo que pone
     `i/estilos-servidor.css`.                                              */
  /* ⚠️⚠️ SE MIDE CONTRA LOS PÍXELES, NO CONTRA EL CSS (9/9/2026).
     Cuarto error de este mismo chequeo, y el peor: reportaba 55 textos
     ilegibles que se leen perfecto. La causa: cuando la invitación tiene foto
     de fondo, esa foto vive en una capa fija con `pointer-events:none`, y
     `elementsFromPoint` NO DEVUELVE las capas que no reciben el mouse. El
     chequeo no veía la foto, se caía hasta el velo de papel y calculaba el
     contraste contra un color que nadie ve. Encima, `.sec.verde` con fondo se
     vuelve semitransparente a propósito (fondo-invitacion.js), así que el color
     que declara el CSS tampoco es el que se dibuja.

     Conclusión: NINGUNA cadena de reglas CSS puede decir qué hay detrás de un
     texto. Lo único que lo sabe es la pantalla. Así que ahora:
       1. se marcan los textos candidatos,
       2. se los esconde a todos (visibility:hidden, que no mueve nada de lugar),
       3. se saca UNA foto de la pantalla: eso es el fondo de verdad,
       4. se los muestra otra vez,
       5. y el contraste se calcula contra los píxeles de esa foto.

     Sobre una foto el fondo no es un color sino muchos: se toman el percentil
     10 y el 90 de luminancia y se usa EL PEOR de los dos. Un texto blanco sobre
     un cielo con una nube clara tiene que dar mal, aunque el promedio dé bien.

     Ventaja de fondo: se terminó el «sobre foto no se mide». Ahora sí se mide,
     que es justamente donde un texto se pierde de verdad. */
  const ilegibles = await (async () => {
    const escala = (opciones && opciones.deviceScaleFactor) || 1;
    const juntados = new Map();

    const unaPantalla = async () => {
      /* 1 · los candidatos, marcados */
      const cand = await page.evaluate(() => {
        const col = c => {
          const m = (c || '').match(/rgba?\(([^)]+)\)/); if (!m) return null;
          const p = m[1].split(',').map(parseFloat);
          return { r: p[0], g: p[1], b: p[2], a: p.length < 4 ? 1 : p[3] };
        };
        const opacidadReal = el => {
          let o = 1, p = el;
          while (p && p !== document.documentElement) {
            o *= parseFloat(getComputedStyle(p).opacity || '1');
            if (o < 0.01) return 0;
            p = p.parentElement;
          }
          return o;
        };
        const out = [];
        let i = 0;
        document.querySelectorAll('body *').forEach(el => {
          if (el.children.length) return;
          const t = (el.textContent || '').trim();
          if (t.length < 3) return;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          if (r.bottom <= 0 || r.top >= innerHeight) return;      /* fuera de pantalla */
          if (opacidadReal(el) < 0.5) return;
          const cf = col(cs.color); if (!cf || cf.a < 0.15) return;
          el.setAttribute('data-cq', String(i));
          out.push({
            i: i++,
            t: t.slice(0, 22),
            color: [cf.r, cf.g, cf.b, cf.a],
            px: parseFloat(cs.fontSize) || 16,
            negrita: (parseInt(cs.fontWeight) || 400) >= 700,
            caja: [Math.max(0, r.left), Math.max(0, r.top),
                   Math.min(innerWidth, r.right), Math.min(innerHeight, r.bottom)],
            quien: el.tagName.toLowerCase() +
              (el.className && typeof el.className === 'string'
                ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')
          });
        });
        return out;
      });
      if (!cand.length) return;

      /* 2 · escondidos (visibility no cambia el layout: el fondo queda igual) */
      await page.evaluate(() => document.querySelectorAll('[data-cq]')
        .forEach(e => { e.style.setProperty('visibility', 'hidden', 'important'); }));
      /* 3 · la foto del fondo de verdad */
      const buf = await page.screenshot();
      /* 4 · se los devuelve a su lugar */
      await page.evaluate(() => document.querySelectorAll('[data-cq]')
        .forEach(e => { e.style.removeProperty('visibility'); e.removeAttribute('data-cq'); }));

      /* 5 · el contraste, contra los píxeles */
      const img = PNG.sync.read(buf);
      const lumCanal = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const lumRGB = (r, g, b) => 0.2126 * lumCanal(r) + 0.7152 * lumCanal(g) + 0.0722 * lumCanal(b);
      const pixel = (x, y) => {
        const k = (img.width * y + x) << 2;
        return [img.data[k], img.data[k + 1], img.data[k + 2]];
      };

      for (const c of cand) {
        const x0 = Math.round(c.caja[0] * escala), y0 = Math.round(c.caja[1] * escala);
        const x1 = Math.min(img.width  - 1, Math.round(c.caja[2] * escala));
        const y1 = Math.min(img.height - 1, Math.round(c.caja[3] * escala));
        if (x1 <= x0 || y1 <= y0) continue;
        const ls = [];
        const pasoX = Math.max(1, Math.floor((x1 - x0) / 24));
        const pasoY = Math.max(1, Math.floor((y1 - y0) / 12));
        for (let y = y0; y <= y1; y += pasoY) {
          for (let x = x0; x <= x1; x += pasoX) {
            if (x < 0 || y < 0 || x >= img.width || y >= img.height) continue;
            const p = pixel(x, y);
            ls.push(lumRGB(p[0], p[1], p[2]));
          }
        }
        if (ls.length < 4) continue;
        ls.sort((a, b) => a - b);
        const p10 = ls[Math.floor(ls.length * 0.10)];
        const p90 = ls[Math.floor(ls.length * 0.90)];
        /* el texto, mezclado con el fondo si es semitransparente */
        const mezclar = (fondoL) => {
          if (c.color[3] >= 0.999) return lumRGB(c.color[0], c.color[1], c.color[2]);
          /* aproximación: se mezcla en luminancia, alcanza para decidir */
          return lumRGB(c.color[0], c.color[1], c.color[2]) * c.color[3] + fondoL * (1 - c.color[3]);
        };
        const razon = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        const peor = Math.min(razon(mezclar(p10), p10), razon(mezclar(p90), p90));
        const grande = c.px >= 24 || (c.px >= 18.66 && c.negrita);
        const min = grande ? 3 : 4.5;
        if (peor < min) {
          const hex = '#' + c.color.slice(0, 3).map(v =>
            Math.round(v).toString(16).padStart(2, '0')).join('');
          const clave = c.t + '|' + c.quien;
          const anterior = juntados.get(clave);
          if (!anterior || peor < anterior.peor) {
            juntados.set(clave, { peor, texto:
              '"' + c.t + '" ' + peor.toFixed(1) + '/' + min +
              ' [' + hex + ' sobre luminancia ' + p10.toFixed(2) + '-' + p90.toFixed(2) +
              ' · ' + c.quien + ']' });
          }
        }
      }
    };

    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= alto; y += 500) {
      await page.evaluate(v => window.scrollTo(0, v), y);
      await page.waitForTimeout(200 * k);
      await unaPantalla();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300 * k);
    return [...juntados.values()].sort((a, b) => a.peor - b.peor).map(x => x.texto);
  })();
  chequear('todos los textos se leen', ilegibles.length === 0,
    ilegibles.slice(0, 4).join(' · ') + (ilegibles.length > 4 ? ' y ' + (ilegibles.length - 4) + ' más' : ''));

  /* ---- 9 · LO QUE PESA Y LO QUE TARDA  (8/9/2026) -----------------------
     Maki: «con wifi y todo no carga, tarda muchísimo». Era cierto y no era el
     código: eran 129 pedidos y 3 MB de fotos. Estos tres chequeos son para que
     no vuelva a pasar sin que nadie se entere. */

  /* ═══ EL BOLETO DEL PASE (8/9/2026) ══════════════════════════════════════
     Maki, desde el iPhone: «el ticket mira cómo se ve; la idea era que esté
     entero y cuando tocás que se baje». En su captura el boleto sale ya roto:
     la columna del mensaje asoma por fuera del borde derecho y el título queda
     cortado.
     ⚠️ EN CHROME NO PASA. Medido al ancho de su iPhone (390): la columna queda
     67 px ADENTRO del boleto y ni el título ni «PASE DE INVITADO» se cortan.
     O sea que es cosa del motor de Safari, y por eso el chequeo vive acá: este
     banco corre WebKit de verdad, que es lo que tiene el iPhone.
     Lo que se mide es lo que se ve: que la columna no se salga del boleto, y
     que los dos textos entren enteros. ═══════════════════════════════════════ */
  const boleto = await page.evaluate(() => {
    const q = (s) => document.querySelector('#pv-sec ' + s);
    const tk = q('.pv-tk'), msg = q('.pv-msg'), tit = q('.pv-titulo'), over = q('.pv-over');
    if (!tk || !msg) return null;
    const a = tk.getBoundingClientRect(), b = msg.getBoundingClientRect();
    /* ⚠️⚠️ ACÁ ESTUVO MAL Y LE DI UN «BIEN» A ALGO ROTO (8/9/2026).
       Yo medía dos cosas: que la columna estuviera adentro del boleto, y que el
       texto no se cortara por su propia caja (`scrollWidth > clientWidth`).
       Las dos daban bien Y EL BOLETO SE VEÍA ROTO IGUAL, porque el defecto no es
       que el texto se corte: es que la columna del mensaje se dibuja ENCIMA y lo
       TAPA. El texto entra entero… abajo de otra cosa.
       Es la tercera vez en el día que un chequeo mío mide «¿está en el DOM?» en
       vez de «¿lo ve una persona?». Lo que hay que medir es la SUPERPOSICIÓN de
       los rectángulos. */
    const pisado = (e) => {
      if (!e) return false;
      const r = e.getBoundingClientRect();
      return r.right > b.left + 1 && r.left < b.right - 1 &&
             r.bottom > b.top + 1 && r.top < b.bottom - 1;
    };
    const dep = q('.pv-departe');
    const tapados = [['el titulo', tit], ['«PASE DE INVITADO»', over], ['«De parte de»', dep]]
      .filter(([, e]) => pisado(e)).map(([n]) => n);
    /* ⚠️⚠️ LO QUE HAY QUE MEDIR ES QUE PAREZCA UN TICKET (8/9/2026).
       Maki: «el ticket tiene que ser un ticket completo; te lo entregan entero,
       vos lo cortás y ahí sale el pedazo. ¿Por qué aparece directamente en el
       medio?». Medir «no se sale del boleto» NO alcanza: la columna estaba
       adentro del boleto y aun así se veía suelta, flotando en el medio y
       colgando por abajo. Lo que se mide ahora es lo que se ve:
         · que arranque AL RAS del borde derecho (como el talón troquelado);
         · que NO cuelgue ni por arriba ni por abajo;
         · que no tape ningún texto. */
    return {
      alRasDerecha: Math.round(a.right - b.right),
      cuelgaAbajo: Math.round(b.bottom - a.bottom),
      cuelgaArriba: Math.round(a.top - b.top),
      pegada: msg.classList.contains('pv-pegada'),
      tapados,
      caja: Math.round(a.width) + 'x' + Math.round(a.height)
    };
  });
  if (boleto) {
    const bienPegada = Math.abs(boleto.alRasDerecha) <= 8;
    const noCuelga    = boleto.cuelgaAbajo <= 2 && boleto.cuelgaArriba <= 2;
    chequear('el boleto del pase se ve entero',
      bienPegada && noCuelga && boleto.tapados.length === 0,
      (boleto.tapados.length ? 'la columna TAPA ' + boleto.tapados.join(' y ') + ' · ' : '') +
      (bienPegada ? '' : 'la columna NO arranca pegada al borde derecho: le faltan ' +
        boleto.alRasDerecha + ' px · ') +
      (noCuelga ? '' : 'cuelga ' + Math.max(boleto.cuelgaAbajo, boleto.cuelgaArriba) + ' px fuera del boleto · ') +
      'boleto ' + boleto.caja);

    /* ⚠️ Y LA OTRA MITAD: que al TOCARLO se despegue. Maki lo dijo con todas las
       letras: «vos lo cortás y ahí sale el pedazo». Si arranca lindo pero no se
       rompe, la mitad de la función no existe.
       ⚠️ Esto NO se puede probar en un navegador de fondo: la rotura usa dos
          requestAnimationFrame y en una pestaña oculta no corren nunca. Acá sí,
          porque el banco abre el navegador de verdad. */
    /* ⚠️ CUANDO ESTO DA ROJO TIENE QUE DECIR POR QUÉ (9/9/2026).
       En la corrida del 9/9 dio «sigue pegada» en iPhone y en iPad, y verde en
       los dos escritorios. Con ese dato solo no se puede arreglar nada: no se
       sabe si falta el oyente del click, si la rotura arrancó y se quedó a
       mitad, o si el módulo ni llegó a montarse. Así que el chequeo ahora
       cuenta el estado ANTES y DESPUÉS, insiste una segunda vez, y nombra las
       piezas: si hay `<audio>` en el sector (el oyente del click se registra
       adentro de `audio()`, así que sin audio no hay oyente) y si la marca
       `__roto` quedó puesta (rotura arrancada pero sin terminar). */
    const rotura = await page.evaluate(async () => {
      const sec = document.querySelector('#pv-sec');
      const m = document.querySelector('#pv-sec .pv-msg');
      if (!m) return null;
      const esperar = (ms) => new Promise(r => setTimeout(r, ms));
      const foto = () => ({
        pegada: m.classList.contains('pv-pegada'),
        late:   m.classList.contains('pv-late'),
        roto:   !!m.__roto
      });

      const antes = foto();
      m.click();  await esperar(1600);
      let tras1 = foto();
      /* ⚠️ SI LA ROTURA YA ARRANCÓ, SE ESPERA — NO SE VUELVE A TOCAR.
         `romper()` pone `__roto` y recién saca `pv-pegada` dos cuadros después.
         Un segundo click entra al oyente, ve `__roto` puesta y se va sin hacer
         nada: yo mismo estaba tapando el final de la animación con un toque de
         más. En iPad eso produjo el rojo «la rotura ARRANCO pero pv-pegada
         nunca se saco». Si arrancó, se le da tiempo (hasta 4 s más). */
      if (tras1.pegada && tras1.roto) {
        for (let i = 0; i < 20 && foto().pegada; i++) await esperar(200);
        tras1 = foto();
      }
      let tras2 = tras1;
      if (tras1.pegada && !tras1.roto) { m.click(); await esperar(1600); tras2 = foto(); }

      const tk = document.querySelector('#pv-sec .pv-tk').getBoundingClientRect();
      const r  = m.getBoundingClientRect();
      return {
        sigueP: tras2.pegada,
        antes, tras1, tras2,
        hizoFaltaSegundo: tras1.pegada && !tras2.pegada,
        hayAudio: !!(sec && sec.querySelector('audio')),
        quedoAbajo: Math.round(r.top - tk.bottom),
        ancho: Math.round(r.width), alto: Math.round(r.height)
      };
    });
    if (rotura) {
      const porque =
        !rotura.hayAudio ? 'NO hay <audio> en el sector: el oyente del click vive adentro de audio(), asi que el boleto no escucha nada'
        : rotura.tras2.roto ? 'la rotura ARRANCO (__roto puesta) pero pv-pegada nunca se saco: se corto en los dos requestAnimationFrame'
        : 'el click no llego al oyente (__roto sigue sin ponerse)';
      chequear('al tocar el boleto, el pedazo se corta y baja',
        !rotura.sigueP && rotura.ancho > rotura.alto,
        rotura.sigueP
          ? 'sigue pegada -> ' + porque
          : (rotura.hizoFaltaSegundo ? 'ROMPIO PERO AL SEGUNDO TOQUE (el primero no hizo nada) · ' : '') +
            'quedo ' + rotura.ancho + 'x' + rotura.alto +
            (rotura.ancho > rotura.alto ? '' : ' (tiene que quedar acostada)') +
            ' · a ' + rotura.quedoAbajo + ' px del boleto');
    }
  } else {
    log('   ----   el boleto del pase no esta en esta invitacion (no es un fallo)');
  }


  const modulosSueltos = pedidos.filter(u => /\/efectos\/[a-z0-9-]+\.js/i.test(u)).length;
  const paquete = await page.evaluate(() => window.INVEFECTOS_JUNTOS || 0);
  chequear('los módulos vienen en un solo pedido, no de a sesenta',
    paquete >= 40 && modulosSueltos <= 2,
    'llegaron ' + paquete + ' pegados y ' + modulosSueltos + ' sueltos (antes eran 56 sueltos)');

  /* Una foto de Cloudinary «cruda» es la que va directo a /upload/vNNN/ sin
     pedirle que la convierta y la achique. Ésas son las de 995 KB. */
  const fotosCrudas = pedidos.filter(u =>
    /res\.cloudinary\.com\/[^/]+\/image\/upload\/v\d+\//.test(u));
  /* ⚠️⚠️ SABER QUE FOTO ES NO ALCANZA: HAY QUE SABER QUIEN LA PIDE (9/9/2026).
     Se buscaron por todos lados y no estan: ni en el repo, ni en el documento
     del evento, ni en el paquete de modulos. Sin saber que elemento la usa no
     se puede arreglar en el origen, y parchear a ciegas esta prohibido.
     Se le pregunta al documento: quien tiene esa direccion puesta, y adentro de
     que seccion vive. */
  const quienLasPide = fotosCrudas.length ? await page.evaluate((urls) => {
    const salida = [];
    for (const u of urls) {
      const cola = u.split('/').pop();
      let donde = 'no la encontre en el documento';
      const todos = document.querySelectorAll('*');
      for (const el of todos) {
        const src = el.getAttribute && (el.getAttribute('src') || el.getAttribute('data-src') || '');
        const bg = getComputedStyle(el).backgroundImage || '';
        if ((src && src.includes(cola)) || bg.includes(cola)) {
          const sec = el.closest('section,[id]');
          donde = el.tagName.toLowerCase() +
            (el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.') : '') +
            (src && src.includes(cola) ? ' (src)' : ' (fondo)') +
            ' dentro de ' + (sec ? (sec.id || sec.tagName.toLowerCase()) : 'nada');
          break;
        }
      }
      salida.push(cola.slice(0,10) + ' -> ' + donde);
    }
    return salida;
  }, fotosCrudas) : [];
  chequear('ninguna foto viaja sin optimizar', fotosCrudas.length === 0,
    fotosCrudas.length + ' cruda(s): ' +
    [...new Set(fotosCrudas.map(u => {
      /* la cuenta de Cloudinary, la carpeta, el archivo y como se pidio:
         los cuatro datos que hacen falta para encontrar quien la escribe. */
      const m = u.match(/res\.cloudinary\.com\/([^/]+)\/image\/upload\/v\d+\/(.*)$/);
      const cuenta = m ? m[1] : '?';
      const resto = m ? m[2] : u;
      return resto + ' (cuenta ' + cuenta + ', por ' +
             (comoSePidio.get(u) || 'no se') + ')';
    }))].join(' | '));
  quienLasPide.forEach(l => log('             quien: ' + l));

  /* ⚠️ UN NUMERO SOLO NO SIRVE PARA BAJARLO (9/9/2026).
     Este chequeo paso de «BIEN» a «143 pedidos» sin que nadie tocara el sitio.
     Con el numero pelado no se sabe si son fotos, tipografias, o el mismo
     archivo pedido veinte veces. Se agrupa por tipo y por dominio. */
  const porTipo = {};
  pedidos.slice(0, pedidosAlCargar).forEach(u => {
    let h = 'raro';
    try { h = new URL(u).hostname.replace(/^www\./,''); } catch (e) {}
    const ext = (u.split('?')[0].match(/\.([a-z0-9]{2,5})$/i) || [,'(sin)'])[1].toLowerCase();
    const k = h + ' ' + ext;
    porTipo[k] = (porTipo[k] || 0) + 1;
  });
  const top = Object.entries(porTipo).sort((a,b) => b[1]-a[1]).slice(0,8)
    .map(([k,n]) => k + '×' + n).join(', ');
  chequear('la invitación no pide un archivo por cada cosa', pedidosAlCargar <= 90,
    pedidosAlCargar + ' pedidos al cargar (eran 129 antes del 8/9) · de que son: ' +
    top + ' · ' +
    pedidos.length + ' en todo el recorrido del robot, que no es comparable');

  /* ---- 10 · NI UN EMOJI A LA VISTA -------------------------------------
     Regla de Maki: «nada de emojis; tiene que ser acorde a lo que vendemos».
     Los del sistema los dibuja cada teléfono a su manera y no son de la marca. */
  const emojis = await page.evaluate(() => {
    const rx = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const malos = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const t = (n.nodeValue || '').trim();
      if (!t || !rx.test(t)) continue;
      const p = n.parentElement;
      /* ⚠️⚠️ CÓMO SE PREGUNTA «¿ESTO SE VE?», Y LAS DOS FORMAS MALAS.
         · `display:none` del PADRE  → no alcanza: la sección entera puede estar
           apagada más arriba, y el chequeo avisa por algo que nadie ve.
         · `offsetParent === null`   → **peor**: da null en todo lo que está en
           `position:fixed`, o sea el botón flotante de WhatsApp. Probado el
           8/9/2026 plantando un emoji fijo a propósito: el chequeo NO lo vio.
         `getClientRects()` es el único que dice la verdad para los dos casos:
         tiene rectángulos si el navegador lo está dibujando, y no los tiene si
         está apagado, esté donde esté. */
      if (!p || p.getClientRects().length === 0) continue;
      malos.push(t.slice(0, 28));
      if (malos.length > 5) break;
    }
    return malos;
  });
  chequear('no hay ni un emoji a la vista', emojis.length === 0, emojis.join(' · '));

  /* ---- 8b · LA SOLAPA DE LA MÚSICA (9/9/2026) ---------------------------
     Maki: «me quedó el link de Spotify a la vista… me gustaría que tenga una
     solapa desplegable para ocultar la pista de música que no coincide con el
     estilo de la invitación… que venga por defecto con la solapa para que se
     vea».

     ⚠️ ESTE CHEQUEO MIDE LA ALTURA REAL DEL PANEL, no la clase. Que el
     `<div>` tenga la clase `open` no quiere decir que se vea abierto: la
     apertura la hace una transición de `max-height`, y una transición puede
     no correr. Se mide el rectángulo, que es lo que ve una persona.       */
  const musica = await page.evaluate(async () => {
    const sol = document.getElementById('inv-musica-solapa');
    if (!sol) return { hay: false };
    const btn = sol.querySelector('.acc-btn');
    const pan = sol.querySelector('.acc-panel');
    const emb = document.getElementById('spotify-embed');
    const alto = () => Math.round(pan.getBoundingClientRect().height);
    const panelAbierto = () => pan.classList.contains('open');
    const esperar = (ms) => new Promise(r => setTimeout(r, ms));

    /* ⚠️ NO SE MIDE CON UN TIMEOUT FIJO. La apertura es una transición de
       `max-height` de 450 ms, pero en el iPhone y el iPad del banco medir a
       los 800 ms daba números imposibles —«cerrada mide 186, abierta medía
       186» y «reabierta 3px»—: la transición todavía estaba a mitad de
       camino. Se espera a que la altura DEJE DE CAMBIAR (tres lecturas
       iguales separadas 120 ms), con techo de 4 s. Eso mide lo que termina
       viendo una persona, no un fotograma del medio. */
    const estable = async () => {
      /* ⚠️ PISO DE 600 ms ANTES DE ACEPTAR QUE ESTÁ QUIETA. Sin esto el bucle
         leía tres veces el valor VIEJO —la transición tarda un cuadro en
         arrancar— y lo daba por final. Eso produjo el absurdo del 9/9:
         «cerrada mide 386px (abierta medía 386)». La transición dura 450 ms;
         600 le da margen y recién ahí se empieza a mirar si dejó de cambiar. */
      let previo = -1, iguales = 0;
      for (let i = 0; i < 40; i++) {
        await esperar(120);
        const h = alto();
        iguales = (h === previo) ? iguales + 1 : 0;
        previo = h;
        if (i >= 5 && iguales >= 2) break;
      }
      return previo;
    };

    const abiertaAlEntrar = await estable();
    btn.click();
    /* ⚠️ La CLASE se lee aparte de la ALTURA. Si la clase se saca y la altura
       no baja, el problema es del CSS o del motor del navegador; si la clase
       ni se saca, el click no llegó. Sin esto el rojo dice «186 y 186» y no
       se puede arreglar nada. */
    const claseAlCerrar = panelAbierto();
    const alCerrar = await estable();
    btn.click();
    const claseAlAbrir = panelAbierto();
    const alVolverAAbrir = await estable();

    return {
      hay: true,
      adentro: !!(emb && sol.contains(emb)),
      rotulo: (btn.textContent || '').trim(),
      abiertaAlEntrar, alCerrar, alVolverAAbrir,
      claseAlCerrar, claseAlAbrir,
      maxHCerrada: claseAlCerrar ? '(seguia open)' : getComputedStyle(pan).maxHeight
    };
  });

  if (musica.hay) {
    chequear('el reproductor de Spotify está adentro de la solapa', musica.adentro,
      'rótulo: ' + musica.rotulo);
    chequear('la solapa de la música viene ABIERTA', musica.abiertaAlEntrar > 100,
      'alto al entrar ' + musica.abiertaAlEntrar + 'px');
    chequear('al tocarla se cierra de verdad', musica.alCerrar <= 4,
      'cerrada mide ' + musica.alCerrar + 'px (abierta medía ' + musica.abiertaAlEntrar +
      ') · la clase open ' + (musica.claseAlCerrar ? 'SIGUIO PUESTA: el click no la sacó'
                                                   : 'se sacó bien, asi que es el CSS/el motor') +
      ' · max-height calculado: ' + musica.maxHCerrada);
    chequear('y se vuelve a abrir', musica.alVolverAAbrir > 100,
      'reabierta ' + musica.alVolverAAbrir + 'px');
  }

  /* ---- 9 · SIN ERRORES ------------------------------------------------- */
  chequear('sin errores de JavaScript', erroresJS.length === 0,
    erroresJS.slice(0,2).join(' | '));
  if (ruidoAjeno.length) {
    log('   (no cuentan: ' + ruidoAjeno.length + ' fallas de servicios ajenos — ' +
        [...new Set(ruidoAjeno)].join(', ') + ')');
  }

  const archivo = 'captura-' + nombre.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '.png';
  await page.screenshot({ path: path.join(AQUI, archivo) });

  /* ---- LA INVITACIÓN ENTERA, DE ARRIBA A ABAJO -------------------------
     La captura de arriba muestra UNA pantalla. La invitación mide once.
     Para revisar el diseño hace falta verla completa: si un título queda
     pegado a una foto, si un sector tiene el doble de aire que el de al
     lado, si un texto cae sobre una parte clara de la foto y no se lee.
     Nada de eso se ve en una sola pantalla ni lo detecta un chequeo.

     Se scrollea primero de a poco: las secciones aparecen con animación
     al entrar en pantalla, y sin ese paseo salen a medio dibujar.        */
  try {
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    const paso = 400;
    for (let y = 0; y < alto; y += paso) {
      await page.evaluate(v => window.scrollTo(0, v), y);
      await page.waitForTimeout(120 * k);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600 * k);
    /* ⚠️ UNA CAPTURA DEMASIADO ALTA MATA AL NAVEGADOR (9/9/2026).
       La invitación mide once pantallas. En el iPad, que dibuja al doble de
       resolución, eso da más de 32.767 píxeles de alto y WebKit se planta:
       «Cannot take screenshot larger than 32767». No sólo falla la captura —
       en el runner de GitHub se llevó puesto el navegador entero.
       Se mide antes, y si no entra se sacan tres pedazos en vez de una tira. */
    const escala = (opciones && opciones.deviceScaleFactor) || 1;
    const base = nombre.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    if (alto * escala < 30000) {
      await page.screenshot({ path: path.join(AQUI, 'entera-' + base + '.png'), fullPage: true });
    } else {
      const trozo = Math.floor(28000 / escala);
      for (let i = 0, y = 0; y < alto; y += trozo, i++) {
        await page.screenshot({
          path: path.join(AQUI, 'entera-' + base + '-' + (i + 1) + '.png'),
          clip: { x: 0, y, width: (opciones.viewport ? opciones.viewport.width : 1440),
                  height: Math.min(trozo, alto - y) }
        });
      }
      log('   (la invitación no entra en una sola captura: salió en pedazos)');
    }
  } catch (e) {
    log('   (no se pudo sacar la captura entera: ' + String(e.message).slice(0, 60) + ')');
  }

  /* ---- 10 · LA VUELTA DESDE LA GALERÍA (9/9/2026) -----------------------
     Maki: «cuando entrás a la cámara de las fotos de la fiesta, tener un botón
     para volver a la invitación, porque cuando das para atrás se abre desde el
     sobre y debería volver al mismo lugar de donde salió».

     ⚠️⚠️ VA ÚLTIMO, DESPUÉS DE LA CAPTURA, Y NO EN EL MEDIO.
     La primera versión lo puse antes de los chequeos de la boda de ejemplo y
     los emojis. Como este chequeo NAVEGA a otra página y vuelve, todo lo que
     venía después corría sobre una invitación recién cargada, sin el sobre
     abierto y sin los módulos montados: el banco reportó la boda de ejemplo
     entera y tres emojis que en pantalla no estaban. Nueve rojos inventados
     por el orden. Un chequeo que cambia de página tiene que ser el último.

     ⚠️ Y SE TOCA EL BOTÓN, NO SE NAVEGA A MANO. La invitación anota la altura
     cuando el dedo baja sobre el enlace (`pointerdown`). Si el banco va
     derecho a la dirección de la galería, esa marca nunca se escribe y
     después el chequeo se queja de que no volvió al mismo lugar — culpando al
     producto por algo que no hizo el banco. Se hace lo que hace una persona.
     ------------------------------------------------------------------- */
  const gal = await page.$('#gal-entrar');
  if (gal) {
    try {
      const antes = await page.evaluate(async () => {
        const a = document.getElementById('gal-entrar');
        a.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 1200));
        return { href: a.getAttribute('href'),
                 slug: new URLSearchParams(location.search).get('e') || '' };
      });

      /* ⚠️ EL CLIC NECESITA MÁS PACIENCIA EN RED LENTA (9/9/2026).
         Con los 30 s que trae Playwright de fábrica, en GitHub daba
         «elementHandle.click: Timeout 30000ms exceeded» y el viaje entero
         quedaba rojo. No es que el botón no funcione: es que con la red
         frenada la sección todavía está entrando con animación y Playwright
         espera —bien— a que el elemento se quede quieto. Se le da el doble. */
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {}),
        gal.click({ timeout: 60000 })     /* el dedo de verdad: dispara pointerdown */
      ]);

      /* ⚠️ LA ALTURA DE SALIDA SE LA PREGUNTO AL PRODUCTO, NO LA MIDO YO.
         Primero la medía con `pageYOffset` justo antes del click y comparaba
         contra dónde caía al volver. Daba rojo en tres navegadores con números
         sin sentido —«salió en 0 y volvió a 8073»— porque las dos lecturas no
         son del mismo instante: el sitio scrollea con animación, y entre mi
         medición y el `pointerdown` que dispara la invitación la página sigue
         moviéndose. Estaba comparando dos momentos distintos y culpando al
         producto por la diferencia.
         Ahora leo la marca que la invitación dejó en `sessionStorage`: ése es
         el número que el producto se comprometió a reponer, y contra ése hay
         que medirlo. */
      const salida = await page.evaluate((slug) => {
        let y = null;
        try { y = sessionStorage.getItem('inv_volver_' + slug); } catch (e) {}
        return { y: y === null ? null : parseInt(y, 10), href: null };
      }, antes.slug);
      salida.href = antes.href;
      chequear('al salir, la invitación anota dónde estaba',
        salida.y !== null, 'no dejó la marca inv_volver_' + antes.slug);
      if (!/\/galeria\//.test(page.url())) {
        await page.goto(new URL(salida.href, URL_BASE).href, { waitUntil: 'load' });
      }

      try { await page.waitForSelector('#volver-inv', { timeout: 12000 }); } catch (e) {}
      const enGaleria = await page.evaluate(() => {
        const a = document.getElementById('volver-inv');
        return { hay: !!a, ve: !!(a && a.getClientRects().length),
                 href: a ? a.getAttribute('href') : '' };
      });
      chequear('en la galería hay botón para volver a la invitación',
        enGaleria.hay && enGaleria.ve,
        enGaleria.hay ? 'está pero no se ve' : 'no existe');

      if (enGaleria.ve) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {}),
          page.click('#volver-inv')
        ]);
        await page.waitForTimeout(3500);
        const vuelta = await page.evaluate(() => {
          const env = document.getElementById('env');
          return {
            sobreALaVista: !!(env && env.getClientRects().length &&
                              getComputedStyle(env).opacity !== '0'),
            y: Math.round(window.pageYOffset)
          };
        });
        chequear('al volver NO se repite el sobre', !vuelta.sobreALaVista,
          'el sobre volvió a taparlo todo');
        if (salida.y !== null) {
          chequear('al volver cae en el mismo lugar',
            Math.abs(vuelta.y - salida.y) < 900,
            'la invitación anotó ' + salida.y + ' y volvió a ' + vuelta.y);
        }
      }
    } catch (e) {
      chequear('el viaje a la galería y la vuelta', false,
        String(e.message || e).slice(0, 90));
    }
  }

  log('   (captura: ' + archivo + ' · y la tira del arranque: tira-…-1, -2, -3)');
  log('   (tardó ' + ((Date.now() - cronometro) / 1000).toFixed(1) + ' s de punta a punta)');

  } finally {
    await br.close().catch(() => {});
  }
}

/* ===== LOS ESCENARIOS ======================================================
   Safari va primero a propósito: es donde aparecieron los bugs.
   ========================================================================== */
log('BANCO DE PRUEBAS DE INVÍTAME');
log('Invitación: ' + URL_BASE);
log('Fecha: ' + new Date().toLocaleString('es-MX'));
log('Red: ' + (LENTO ? 'lenta, como un celular con 4G (+' + DEMORA + ' ms por pedido)'
                     : '⚠️ RÁPIDA — así NO se encuentran las carreras'));
log('Caché: vacía, como un invitado que entra por primera vez');

const TODOS = {
  'safari-escritorio': ['Safari escritorio', 'webkit',   { viewport:{width:1440,height:900} }],
  'safari-iphone':     ['Safari iPhone',     'webkit',   { ...devices['iPhone 14 Pro'] }],
  'chrome-escritorio': ['Chrome escritorio', 'chromium', { viewport:{width:1440,height:900} }],
  /* ⚠️ EL iPAD ES SU PROPIO ESCENARIO, y no es «un Safari más chico». Lo que lo
     distingue no es el tamaño sino que se toca: `any-pointer: coarse`. Por eso
     va con `hasTouch`, que es lo que hace verdadera esa consulta. */
  'safari-ipad':       ['Safari iPad', 'webkit',
                        { viewport:{width:834,height:1194}, hasTouch:true,
                          deviceScaleFactor:2, isMobile:false }, true]
};

/* ⚠️ Cada escenario se envuelve por separado a propósito. Antes un solo try
   abrazaba a los tres: cuando Safari no arrancaba, se cortaba todo y Chrome
   ni se probaba. Un navegador que falla no puede tapar a los otros dos. */
/* ═══════════════════════════════════════════════════════════════════════════
   ⚠️⚠️ PRIMERO: ¿LA INVITACIÓN EXISTE?
   El 8/9/2026 el banco corrió contra `regina-y-santiago`, que ya no existe.
   El servidor no da 404: sirve la BODA DE EJEMPLO (María & Diego), que está en
   voseo, con emojis y con fotos de banco. El banco reportó 33 problemas —
   TODOS falsos — y se le hizo perder una corrida entera a Maki.
   Un banco que prueba algo que no existe es peor que no tener banco.
   Se corta acá, fuerte y claro, antes de abrir un solo navegador.
   Cómo se distingue: el servidor arma el og:title con los datos DEL EVENTO.
   Si vuelve el título de la boda de ejemplo, esa invitación no está.
   ═══════════════════════════════════════════════════════════════════════════ */
const TITULO_DEL_EJEMPLO = 'María &amp; Diego';
try {
  const r = await fetch(URL_BASE, { headers: { 'cache-control': 'no-cache' } });
  const html = await r.text();
  const m = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
  const titulo = m ? m[1] : '';
  if (!r.ok || (titulo.indexOf(TITULO_DEL_EJEMPLO) === 0 && SLUG !== 'maria-y-diego')) {
    log('');
    log('══════════════════════════════════════════');
    log('  ESA INVITACIÓN NO EXISTE');
    log('══════════════════════════════════════════');
    log('  Pedimos:  ' + URL_BASE);
    log('  Vino:     la boda de ejemplo (' + (titulo || 'sin título') + ')');
    log('');
    log('  No se probó nada. Si se probaba, todo iba a dar MAL por el');
    log('  ejemplo, no por la invitación.');
    log('');
    log('  Probá con una que exista, por ejemplo:');
    log('      ./probar.command camila-y-tomas');
    log('══════════════════════════════════════════');
    fs.writeFileSync(path.join(AQUI, 'resultado.txt'), lineas.join('\n') + '\n');
    process.exit(1);
  }
  log('  (la invitación existe: ' + titulo + ')');
} catch (err) {
  log('  ⚠️ no se pudo preguntar si la invitación existe (' +
      String(err.message).split('\n')[0] + '). Se sigue igual.');
}

for (const clave of MOTORES) {
  const e = TODOS[clave.trim()];
  if (!e) continue;
  try {
    await escenario(e[0], e[1], e[2], e[3]);
  } catch (err) {
    fallos++;
    const m = String(err.message).split('\n')[0];
    log('\n──────────────────────────────────────────');
    log('  ' + e[0]);
    log('──────────────────────────────────────────');
    log('   MAL    no se pudo ni abrir el navegador');
    log('             -> ' + m);
    if (/Executable doesn't exist/.test(m)) {
      log('             -> falta bajarlo: npx playwright install ' + e[1]);
    }
  }
}

log('\n══════════════════════════════════════════');
log(fallos === 0
  ? 'TODO BIEN — ' + pasan + ' chequeos pasaron'
  : 'HAY ' + fallos + ' PROBLEMAS (y ' + pasan + ' cosas bien)');
log('══════════════════════════════════════════');

fs.writeFileSync(path.join(AQUI, 'resultado.txt'), lineas.join('\n') + '\n');
process.exit(fallos ? 1 : 0);
