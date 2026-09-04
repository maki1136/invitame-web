/* ===== SOBRES DE INVÍTAME + PUNTO DE ENTRADA ==================================
   Este archivo tiene TRES partes:
     1) EL CATÁLOGO  — la lista de sobres disponibles
     2) LA PUESTA EN PANTALLA DEL SOBRE — cómo se ve y se encuadra
     3) EL ENGANCHE  — carga /efectos/index.js, donde está la lista de módulos

   Vive aparte a propósito: antes todo esto estaba copiado dentro de
   prueba/index.html y prueba/admin.html (200 KB cada uno) y había que acordarse
   de tocar los dos. Acá es un archivo chico, fácil de cambiar y de revisar.

   ⚠️ Se llama "catalogo.js" por historia: arrancó siendo sólo la lista de
   sobres. Hoy es además el ÚNICO enganche que tiene la invitación con archivos
   chicos. Renombrarlo obligaría a tocar los HTML grandes, que es justo lo que
   se quiere evitar.
   ============================================================================ */


/* ===== 1. EL CATÁLOGO =========================================================
   Para sumar un sobre nuevo:
     1. Subir el video (y su poster) a la carpeta /sobres/
     2. Agregar UNA línea acá abajo
   Nada más.

   Qué significa cada cosa:
     nombre : lo que ve la diseñadora en la lista del panel
     video  : la apertura del sobre, sin nombres ni fechas. Genérico y reusable.
     poster : el primer cuadro, para que el sobre cerrado se vea al instante
              mientras el video todavía carga. TAMBIÉN se usa como fondo
              desenfocado en la compu, y como LA FOTO en apertura 'solapas'.
     solapa : SOLO en apertura 'solapas'. Segunda imagen, con transparencia,
              que trae la solapa de arriba MÁS EL LACRE. Ver abajo.
     eje    : SOLO en apertura 'solapas'. Dónde cae la punta de la solapa, en
              % de la foto. Por defecto 50/50.
     img    : sin video, el sobre se dibuja por CSS con esta imagen de papel
              (el modo viejo; queda como respaldo).
     lacre  : imagen del sello para el modo sin video.
     color  : color sugerido para la carta, si la diseñadora no elige uno.
     apertura: 'video' (por defecto) o 'solapas'  → ver abajo
     empalme: 'blanco' (por defecto) o 'foto'     → ver abajo
     texto  : sólo en las piezas que SE ESCRIBEN SOLAS (ver más abajo).

   El evento guarda SOLO el id (fx.sobre.modelo), nunca la URL. Así se puede
   cambiar el video de un sobre después sin tocar ninguna invitación entregada.

   ★★★ EL CAMPO `apertura`  (3/9/2026)

     Maki, después de ver el sobre de anillos en video:
     «cambiemos el sobre, se abre descontrolado este. Creo que lo habías armado
     vos con una imagen».

     Un video generado con IA **hace lo que quiere**: en anillos el relieve del
     papel cambia solo en el camino, y el lacre no se parte, se esfuma. Eso no
     se arregla con código: viene así en el archivo.

       'video'    — reproduce el mp4. Sirve cuando la generación salió limpia
                    (lazo, toscana, perlas).
       'solapas'  — NO usa video. Toma la FOTO del sobre cerrado (el `poster`,
                    que ya está en el repo) y la abre por CSS: se parte en
                    cuatro triángulos desde el centro y las dos solapas de
                    adelante giran hacia afuera. El lacre queda partido al
                    medio, que es lo que hace un lacre de verdad.
                    El movimiento lo manejamos nosotros: mismo tiempo, mismo
                    ángulo, todas las veces.

     ⚠️ 'solapas' NO necesita ningún archivo nuevo. Usa el póster.
     ⚠️ Y asume que el lacre está en el CENTRO de la foto. Si un sobre nuevo lo
        tiene más arriba, se corre `EJE` en /efectos/sobre-catalogo.js, o se
        pone `eje` en la ficha del sobre (ver `maestro`).

   ★★★ EL CAMPO `empalme`  (3/9/2026)

     Maki: «¿te acordás que habíamos quedado en que el sobre se abría y aparecía
     abajo la foto de la invitación directo, y ahí recién aparecían los datos?».

       'blanco'  (por defecto) — para los videos que YA terminan en blanco
                  (lazo, toscana, perlas). Velo del color del papel. No se toca.
       'foto'    — el sobre se desvanece encima de la portada real, que ya está
                  dibujada debajo, y los textos de la portada entran medio
                  segundo después que la foto.

     ⚠️ En un video no es una preferencia: es una propiedad del archivo. Si
        termina en blanco y se pone 'foto', se ve un blanco de más; si termina
        abierto y se pone 'blanco', se ve el corte.
        En apertura 'solapas' va SIEMPRE 'foto': el sobre queda abierto.

   ★ CÓMO SE ELIGE EL `color`, BIEN: se MIDE, no se estima. Se saca el último
     cuadro del video y se lee el píxel del centro. En `perlas` el fundido se
     hizo a 0xF3F3F5 y el archivo terminó en #f2f2f4 (el paso a yuv420p corre
     un nivel). Va el valor MEDIDO, no el pedido.

   ★★ Y OJO CON QUÉ PARTE SE MIDE  (3/9/2026)
     En los sobres que no se funden a blanco solos, el último cuadro es el sobre
     YA ABIERTO, con sombra: medirlo da un gris sucio (#c9c2b5) que no sirve.
     Ahí hay que medir EL PAPEL, en una esquina del PRIMER cuadro, porque ese
     `color` es el que rellena las barras cuando la foto va contenida. Si se
     pone el promedio, quedan dos franjas oscuras arriba y abajo.
   ============================================================================ */
window.SOBRES_INVITAME = {

  lacre: {
    nombre: "Lacre dorado (video)",
    video:  "/sobres/sobre-lacre.mp4",
    poster: "/sobres/sobre-lacre-poster.jpg",
    color:  "#efe9e0"
  },

  flores: {
    nombre: "Lacre y flores secas (video)",
    video:  "/sobres/sobre-flores.mp4",
    poster: "/sobres/sobre-flores-poster.jpg",
    color:  "#efe9e0"
  },

  lazo: {
    nombre: "Lazo de seda verde salvia (video)",
    video:  "/sobres/sobre-lazo.mp4",
    poster: "/sobres/sobre-lazo-poster.jpg",
    color:  "#f4f6f0"
  },

  toscana: {
    nombre: "Toscana grabada, lacre dorado (video)",
    video:  "/sobres/sobre-toscana.mp4",
    poster: "/sobres/sobre-toscana-poster.jpg",
    color:  "#f7f2e8"
  },

  /* ---- EL SOBRE DE LA COLECCIÓN PERLAS ----------------------------------
     Sobre marfil de borde deckled con DOS HOJAS que se abren al medio
     (gatefold), atado con una hilera de perlas de agua dulce.

     ⚠️ NO es un sobre de solapa: el movimiento es "las dos hojas se abren
        desde la costura del centro". Por eso tampoco sirve para 'solapas',
        que asume solapas triangulares.
     ---------------------------------------------------------------------- */
  perlas: {
    nombre: "Perlas · moño de perlas, se abre al medio (video)",
    video:  "/sobres/sobre-perlas.mp4",
    poster: "/sobres/sobre-perlas-poster.jpg",
    color:  "#f2f2f4"
  },

  /* ---- EL SOBRE DE ANILLOS  (3/9/2026) ----------------------------------
     Sobre marfil de solapa clásica, papel con damasco EN RELIEVE (grabado
     seco, no impreso) y un lacre color hueso con DOS ANILLOS ENTRELAZADOS.

     ⚠️ SE ABRE POR SOLAPAS, NO POR VIDEO. El video de Flow existe y quedó
        declarado como respaldo, pero se abría descontrolado: el relieve
        cambiaba solo (arranca con volutas, termina con rosas) y el lacre se
        desvanecía en vez de partirse. Con la foto y CSS el movimiento sale
        igual siempre, y el lacre se parte al medio como corresponde.

     El archivo de video, por si alguna vez se vuelve: recortado a 7 s,
     acelerado 1,75× (queda en 4,0 s), subido a 1080 con lanczos y
     recodificado en Constrained Baseline.
     ---------------------------------------------------------------------- */
  anillos: {
    nombre:   "Anillos · marfil en relieve, lacre de dos anillos",
    video:    "/sobres/sobre-anillos.mp4",
    poster:   "/sobres/sobre-anillos-poster.jpg",
    color:    "#f4f2ec",
    apertura: "solapas",
    empalme:  "foto"
  },

  /* ---- ★ EL SOBRE MAESTRO  (4/9/2026) -----------------------------------
     El que copia la muestra que mandó Maki (@inviteness). Medida contra
     medida, la diferencia con los nuestros no era el movimiento: era LA FORMA.

       · el de ellos tiene UNA sola solapa triangular arriba y, debajo del
         lacre, PAPEL LISO;
       · los nuestros tenían la X de cuatro solapas cruzándose en el centro.
         Al levantar la de arriba quedaba un rombo oscuro con dos cuñas
         filosas: una figura geométrica, no un sobre abierto.

     Es el primero con `solapa`: una SEGUNDA imagen, recortada con
     transparencia, que trae el triángulo de arriba MÁS EL LACRE. Por eso acá
     el lacre viaja pegado a la solapa en vez de partirse al medio, que es lo
     que pasa cuando las cuatro hojas salen de la misma foto.

     ⚠️ PARA GENERAR UNO NUEVO EN FLOW: costó tres tiradas acertar. Si se le
        pide "sobre visto desde atrás" devuelve SIEMPRE la X de cuatro puntas.
        Lo que funciona es decirlo en positivo: «todo lo que está debajo de ese
        punto es una hoja de papel continua, sin ningún doblez». El prompt
        entero está en el proyecto, en SOBRE-MAESTRO-spec-json.md.

     `eje` es dónde cae la punta de la solapa, en % de la foto. MEDIDO sobre la
     imagen: (50,5 % · 52,3 %). El lacre la tapa entera.
     ---------------------------------------------------------------------- */
  maestro: {
    nombre:   "Maestro · marfil botánico, cuatro solapas, lacre liso (foto)",
    poster:   "/sobres/sobre-maestro.jpg",
    solapa:   "/sobres/sobre-maestro-solapa.webp",
    color:    "#e8e2d8",
    apertura: "solapas",
    empalme:  "foto",
    /* dónde se cruzan las cuatro solapas (y dónde está el lacre), medido
       sobre la foto: 381/768 y 687/1376. Se abre SÓLO la de arriba; las
       otras tres se quedan y enmarcan la abertura. */
    eje:      { x: 49.6, y: 49.9 }
  },

  'carta-toscana': {
    nombre: "Tarjeta troquelada Toscana · se escribe sola (video)",
    video:  "/sobres/carta-toscana.mp4",
    poster: "/sobres/carta-toscana-poster.jpg",
    color:  "#efe7da",

    /* ---- LA PIEZA SE ESCRIBE SOLA ----------------------------------------
       Este video NO es un sobre que se abre: es una tarjeta troquelada filmada
       con un acercamiento lento, GENERADA EN BLANCO a propósito. El módulo
       /efectos/pieza-carta.js escribe encima los datos de la pareja que ya
       están cargados en la invitación. Así el mismo archivo sirve para todos.

       Todos estos números salen de MEDIR la imagen, no de estimarla:
         · eje 399    la corona de arriba y la hojita de abajo están las dos
                      centradas ahí
         · la cara útil va de y=330 (bajo la corona) a y=775 (sobre el paisaje)
         · a la altura de las mayúsculas la cara mide 390 px de ancho. Con 330
                      de tope, los dos renglones entran en cuerpo 12 y quedan
                      36 px de aire de cada lado.
         · la tinta está muestreada del propio grabado del paisaje
         · desde 3.45  el video dura 6,9 s: 3,3 de acercamiento y 3,6 de imagen
                      quieta. La escritura pasa entera en la parte quieta.

       `lineas` son LÍNEAS DE BASE, no bordes de caja.
       -------------------------------------------------------------------- */
    texto: {
      base:    [720, 1280],
      eje:     399,
      desde:   3.45,
      tinta:   "#705a42",
      oro:     "#9e825c",
      serif:   "'Cormorant Garamond',Georgia,serif",
      script:  "'Pinyon Script',cursive",
      fuentes: "family=Cormorant+Garamond:wght@400&family=Pinyon+Script",
      lineas:  { k1:355, k2:379, n1:473, n2:615, filete:655, fecha:682, hora:711, lug1:743, lug2:764 },
      tam:     { k:15, n:84, nexo:42, fecha:18, hora:14, lug1:15, lug2:13 },
      ancho:   { k:330, n:318, fecha:300, lug:306 }
    }
  },

  marfil: {
    nombre: "Marfil en relieve",
    img:    "/sobres/sobre-marfil.jpg",
    lacre:  "/sobres/lacre-marfil.png",
    color:  "#efe4cd"
  },

  floral: {
    nombre: "Floral en relieve (marfil)",
    img:    "/sobres/sobre-floral.jpg",
    color:  "#d9a7ae"
  }

};


/* ===== 2. LA PUESTA EN PANTALLA DEL SOBRE =====================================

   EL PROBLEMA
   Los videos de sobre son verticales (9:16), pensados para el celular. En una
   compu la ventana es apaisada, y el video se estiraba a toda la pantalla con
   "cover": entraba sólo el centro del sobre, ampliadísimo.

   LA SOLUCIÓN
   En la compu el sobre se muestra en el centro, del mismo tamaño con el que se
   ve en un celular, y el resto de la pantalla se llena con EL MISMO PAPEL del
   sobre, muy desenfocado, más un viñeteado suave.

   POR QUÉ NO HAY SALTO AL ABRIR
   Le damos al sobre el alto de la portada (84vh) y de ahí sale el ancho por la
   proporción del video (9:16). En un monitor de altura normal eso da 474px: el
   MISMO ancho que `.portada`.

   ⚠️⚠️ NO USAR `aspect-ratio` ACÁ. ESTO SE ROMPIÓ EN PRODUCCIÓN.
   `aspect-ratio` sobre un elemento reemplazado (`<video>`, `<img>`) no se
   aplica igual en Safari: el ancho se resolvía solo, el video volvía a ocupar
   la pantalla entera con `object-fit:cover` y en la Mac de Maki se veía un
   pedazo gigante del sobre. Ahora el ancho se calcula con `calc()`, que es
   aritmética y anda igual en todos lados.

   Los tamaños van con `!important` a propósito: el motor arma el sobre después
   de que carga este archivo y mete sus propios estilos.

   LOS CONTROLES DE SAFARI
   El `<video>` NO tiene `controls`. Pero Safari en Mac, cuando bloquea el
   autoplay, mete SUS PROPIOS controles encima. Se apagan con los
   pseudo-elementos ::-webkit-media-controls.

   EN EL CELULAR NO CAMBIA NADA: vive dentro de un @media de 680px para arriba.
   ============================================================================ */
(function () {

  var ALTO  = 'min(84vh, 843px)';
  var ANCHO = 'calc(' + ALTO + ' * 9 / 16)';

  var css = [
    '#env.carta-video #env-vid::-webkit-media-controls,',
    '#env.carta-video #env-vid::-webkit-media-controls-enclosure,',
    '#env.carta-video #env-vid::-webkit-media-controls-panel,',
    '#env.carta-video #env-vid::-webkit-media-controls-start-playback-button{',
    '  display:none!important;-webkit-appearance:none!important}',

    '#sobre-fondo,#sobre-vinieta{display:none}',

    '@media (min-width:680px){',
    '  #env.carta-video{background:#cfc4b4}',

    '  #sobre-fondo{display:block;position:absolute;inset:0;z-index:0;',
    '    background-size:cover;background-position:center;',
    '    filter:blur(64px) saturate(.7) brightness(.94);transform:scale(1.35)}',

    '  #sobre-vinieta{display:block;position:absolute;inset:0;z-index:1;',
    '    pointer-events:none;background:radial-gradient(120% 85% at 50% 50%,',
    '    rgba(0,0,0,0) 38%, rgba(0,0,0,.16) 78%, rgba(0,0,0,.30) 100%)}',

    /* ⚠️ ancho por calc(), NUNCA aspect-ratio */
    '  #env.carta-video #env-vid{',
    '    position:absolute!important;',
    '    inset:auto!important;',
    '    left:50%!important;top:50%!important;',
    '    transform:translate(-50%,-50%)!important;',
    '    z-index:2;',
    '    height:' + ALTO + '!important;',
    '    width:' + ANCHO + '!important;',
    '    max-width:92vw!important;',
    '    object-fit:cover;border-radius:30px;',
    '    box-shadow:0 32px 74px rgba(40,28,12,.34)}',

    '  #env.carta-video .triflap,',
    '  #env.carta-video #tri-seal,',
    '  #env.carta-video #e-back,',
    '  #env.carta-video #e-pocket,',
    '  #env.carta-video #e-flap{display:none!important}',

    '  #env.carta-video .vhint{position:absolute;left:50%;transform:translateX(-50%);',
    '    top:calc(50% + min(42vh,421px) + 18px)}',
    '}'
  ].join('\n');

  function ponerEstilos() {
    var v = document.getElementById('sobre-encuadre');
    if (v) v.remove();
    var s = document.createElement('style');
    s.id = 'sobre-encuadre';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  function pintarFondo() {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return;

    var esCartaVideo = env.classList.contains('carta-video');
    var poster = vid.getAttribute('poster') || '';
    var fondo = document.getElementById('sobre-fondo');

    /* en apertura por solapas el <video> no tiene poster: se toma del catálogo */
    if (!poster && env.dataset && env.dataset.apertura === 'solapas') {
      try {
        var s = (window.INVEV || {}).fx.sobre || {};
        var m = (window.SOBRES_INVITAME || {})[s.modelo] || {};
        poster = m.poster || '';
      } catch (e) {}
    }

    if (!esCartaVideo || !poster) { if (fondo) fondo.style.backgroundImage = ''; return; }

    if (!fondo) {
      fondo = document.createElement('div');
      fondo.id = 'sobre-fondo';
      var vin = document.createElement('div');
      vin.id = 'sobre-vinieta';
      env.insertBefore(fondo, env.firstChild);
      env.insertBefore(vin, fondo.nextSibling);
    }
    var url = 'url("' + poster.replace(/"/g, '%22') + '")';
    if (fondo.style.backgroundImage !== url) fondo.style.backgroundImage = url;
  }

  /* ⚠️ RED DE SEGURIDAD: si el video quedara a pantalla completa, se corrige. */
  function vigilarTamano() {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid || innerWidth < 680) return;
    if (!env.classList.contains('carta-video')) return;
    if (env.dataset && env.dataset.apertura === 'solapas') return;
    var b = vid.getBoundingClientRect();
    if (b.width <= innerWidth * 0.75) return;
    var alto = Math.min(innerHeight * 0.84, 843);
    vid.style.setProperty('position', 'absolute', 'important');
    vid.style.setProperty('inset', 'auto', 'important');
    vid.style.setProperty('left', '50%', 'important');
    vid.style.setProperty('top', '50%', 'important');
    vid.style.setProperty('transform', 'translate(-50%,-50%)', 'important');
    vid.style.setProperty('height', alto + 'px', 'important');
    vid.style.setProperty('width', Math.round(alto * 9 / 16) + 'px', 'important');
  }

  function arrancar() {
    ponerEstilos();
    pintarFondo();
    vigilarTamano();

    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (window.MutationObserver && env) {
      new MutationObserver(function () { pintarFondo(); vigilarTamano(); })
        .observe(env, { attributes: true, attributeFilter: ['class', 'data-apertura'] });
      if (vid) new MutationObserver(function () { pintarFondo(); vigilarTamano(); })
        .observe(vid, { attributes: true, attributeFilter: ['poster', 'style'] });
    }
    addEventListener('resize', vigilarTamano);
    var n = 0, t = setInterval(function () {
      pintarFondo(); vigilarTamano();
      if (++n > 40) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();


/* ===== 3. EL ENGANCHE =========================================================
   La lista de módulos del front vive en /efectos/index.js. Se carga desde acá y
   nada más.
   ============================================================================ */
(function () {
  var src = '/efectos/index.js';
  if (document.querySelector('script[src="' + src + '"]')) return;
  var s = document.createElement('script');
  s.src = src;
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();
