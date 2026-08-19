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
              Termina cuando la tarjeta llena la pantalla: ahí toma el relevo la
              invitación real, que es la que tiene la foto y los datos.
     poster : el primer cuadro, para que el sobre cerrado se vea al instante
              mientras el video todavía carga. TAMBIÉN se usa como fondo
              desenfocado en la compu (ver parte 2).
     img    : sin video, el sobre se dibuja por CSS con esta imagen de papel
              (el modo viejo; queda como respaldo).
     lacre  : imagen del sello para el modo sin video.
     color  : color sugerido para la carta, si la diseñadora no elige uno.
     texto  : sólo en las piezas que SE ESCRIBEN SOLAS (ver más abajo).

   El evento guarda SOLO el id (fx.sobre.modelo), nunca la URL. Así se puede
   cambiar el video de un sobre después sin tocar ninguna invitación entregada.

   ⚠️ Los sobres `lazo` y `toscana` TERMINAN EN BLANCO, no en la tarjeta. La
   invitación entra desde ese blanco, así que el empalme es un fundido y no se
   ve ningún corte. Por eso su `color` es casi blanco: es el color con el que
   arranca la pantalla justo cuando el video se apaga.
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
                      36 px de aire de cada lado. Con 300 caían a 11 y se veían
                      chicos; con 373 (sin tope) rozaban el borde.
         · la tinta está muestreada del propio grabado del paisaje
         · desde 3.45  el video dura 6,9 s: 3,3 de acercamiento y 3,6 de imagen
                      quieta. La escritura pasa entera en la parte quieta, así
                      no hay nada que seguir y el texto no se puede correr.

       `lineas` son LÍNEAS DE BASE, no bordes de caja: es lo único que se
       mantiene en su lugar si algún día cambia la tipografía.
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
   Los videos de sobre son verticales (9:16), pensados para el celular. En el
   celular se ven perfectos. Pero en una compu la ventana es apaisada, y el
   video se estiraba a toda la pantalla con "cover": entraba solamente el centro
   del sobre, ampliadísimo, y quedaban afuera las cuatro esquinas, el lacre
   entero y las flores secas.

   LA SOLUCIÓN — un solo encuadre que sirve para los dos
   En la compu el sobre se muestra en el centro, del mismo tamaño con el que se
   ve en un celular, y el resto de la pantalla se llena con EL MISMO PAPEL del
   sobre, muy desenfocado, más un viñeteado suave.

   POR QUÉ NO HAY SALTO AL ABRIR
   Le damos al sobre el alto de la portada (84vh) y la proporción del video
   (9:16), así el ancho sale solo. En un monitor de altura normal eso da 474px:
   el MISMO ancho que `.portada`.

   LOS CONTROLES DE SAFARI
   El `<video>` NO tiene el atributo `controls`. Pero Safari en Mac, cuando la
   preferencia de reproducción automática está en "Detener contenido
   multimedia", bloquea el autoplay y mete SUS PROPIOS controles encima. Se
   apagan con los pseudo-elementos ::-webkit-media-controls.

   EN EL CELULAR NO CAMBIA NADA: vive dentro de un @media de 680px para arriba.
   Y toca sólo el modo `carta-video`.
   ============================================================================ */
(function () {

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

    '  #env.carta-video #env-vid{',
    '    inset:auto;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;',
    '    height:min(84vh,843px);aspect-ratio:9/16;width:auto;max-width:92vw;',
    '    object-fit:cover;border-radius:30px;',
    '    box-shadow:0 32px 74px rgba(40,28,12,.34)}',

    '  #env.carta-video .vhint{position:absolute;left:50%;transform:translateX(-50%);',
    '    top:calc(50% + min(42vh,421px) + 18px)}',
    '}'
  ].join('\n');

  function ponerEstilos() {
    if (document.getElementById('sobre-encuadre')) return;
    var s = document.createElement('style');
    s.id = 'sobre-encuadre';
    s.textContent = css;
    /* al final del head: así gana sobre las reglas que ya trae la página,
       sin necesidad de !important */
    (document.head || document.documentElement).appendChild(s);
  }

  /* El motor decide el poster recién cuando arma el sobre, así que esto se
     vuelve a llamar cada vez que cambia la clase de #env o el poster. */
  function pintarFondo() {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return;

    var esCartaVideo = env.classList.contains('carta-video');
    var poster = vid.getAttribute('poster') || '';
    var fondo = document.getElementById('sobre-fondo');

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

  function arrancar() {
    ponerEstilos();
    pintarFondo();

    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (window.MutationObserver && env) {
      new MutationObserver(pintarFondo).observe(env, { attributes: true, attributeFilter: ['class'] });
      if (vid) new MutationObserver(pintarFondo).observe(vid, { attributes: true, attributeFilter: ['poster'] });
    }
    var n = 0, t = setInterval(function () { pintarFondo(); if (++n > 40) clearInterval(t); }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();


/* ===== 3. EL ENGANCHE =========================================================
   La lista de módulos del front vive en /efectos/index.js. Se carga desde acá y
   nada más. Así, agregar o sacar una mejora es editar ese archivo de 5 líneas,
   y este nunca se vuelve a tocar.
   ============================================================================ */
(function () {
  var src = '/efectos/index.js';
  if (document.querySelector('script[src="' + src + '"]')) return;
  var s = document.createElement('script');
  s.src = src;
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();
