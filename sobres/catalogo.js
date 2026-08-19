/* ===== SOBRES DE INVÍTAME =====================================================
   Este archivo tiene DOS partes:
     1) EL CATÁLOGO  — la lista de sobres disponibles
     2) LA PUESTA EN PANTALLA — cómo se ve y se encuadra el sobre

   Vive aparte a propósito: antes todo esto estaba copiado dentro de
   prueba/index.html y prueba/admin.html (200 KB cada uno) y había que acordarse
   de tocar los dos. Acá es un archivo chico, fácil de cambiar y de revisar.
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

   El evento guarda SOLO el id (fx.sobre.modelo), nunca la URL. Así se puede
   cambiar el video de un sobre después sin tocar ninguna invitación entregada.
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


/* ===== 2. LA PUESTA EN PANTALLA ==============================================

   EL PROBLEMA
   Los videos de sobre son verticales (9:16), pensados para el celular. En el
   celular se ven perfectos. Pero en una compu la ventana es apaisada, y el
   video se estiraba a toda la pantalla con "cover": entraba solamente el centro
   del sobre, ampliadísimo, y quedaban afuera las cuatro esquinas, el lacre
   entero y las flores secas.

   LA SOLUCIÓN — un solo encuadre que sirve para los dos
   En la compu el sobre se muestra en el centro, del mismo tamaño con el que se
   ve en un celular, y el resto de la pantalla se llena con EL MISMO PAPEL del
   sobre, muy desenfocado, más un viñeteado suave. Así la pantalla queda llena
   (nada de bandas de color plano) y el sobre queda justo en el medio, idéntico
   a como se ve en el teléfono.

   POR QUÉ NO HAY SALTO AL ABRIR
   Le damos al sobre el alto de la portada (84vh) y la proporción del video
   (9:16), así el ancho sale solo. En un monitor de altura normal eso da 474px:
   el MISMO ancho que `.portada`. Entonces cuando el video termina y aparece la
   invitación, la caja no se mueve. En ventanas bajas el sobre sale un poco más
   angosto y la invitación crece al entrar, lo que acompaña la sensación de que
   la carta sale del sobre.

   LOS CONTROLES DE SAFARI
   El `<video>` NO tiene el atributo `controls`. Pero Safari en Mac, cuando la
   preferencia de reproducción automática está en "Detener contenido
   multimedia", bloquea el autoplay y mete SUS PROPIOS controles encima: play,
   el tiempo, volumen, pantalla completa. Se veían arriba del sobre y arruinaban
   la entrada. Se apagan con los pseudo-elementos ::-webkit-media-controls.

   EN EL CELULAR NO CAMBIA NADA: el encuadre y el fondo viven dentro de un
   @media de 680px para arriba, y el fondo ni se dibuja. Y todo esto toca sólo
   el modo `carta-video`; los otros modos de sobre quedan como estaban.
   ============================================================================ */
(function () {

  var css = [
    /* --- fuera los controles que Safari agrega por su cuenta --- */
    '#env.carta-video #env-vid::-webkit-media-controls,',
    '#env.carta-video #env-vid::-webkit-media-controls-enclosure,',
    '#env.carta-video #env-vid::-webkit-media-controls-panel,',
    '#env.carta-video #env-vid::-webkit-media-controls-start-playback-button{',
    '  display:none!important;-webkit-appearance:none!important}',

    /* --- el fondo y el viñeteado sólo existen en pantalla ancha --- */
    '#sobre-fondo,#sobre-vinieta{display:none}',

    '@media (min-width:680px){',
    '  #env.carta-video{background:#cfc4b4}',

    /* el mismo papel del sobre, ampliado y desenfocado, llenando la pantalla */
    '  #sobre-fondo{display:block;position:absolute;inset:0;z-index:0;',
    '    background-size:cover;background-position:center;',
    '    filter:blur(64px) saturate(.7) brightness(.94);transform:scale(1.35)}',

    /* un viñeteado apenas perceptible para que el centro respire */
    '  #sobre-vinieta{display:block;position:absolute;inset:0;z-index:1;',
    '    pointer-events:none;background:radial-gradient(120% 85% at 50% 50%,',
    '    rgba(0,0,0,0) 38%, rgba(0,0,0,.16) 78%, rgba(0,0,0,.30) 100%)}',

    /* el sobre, centrado, del tamaño de un celular */
    '  #env.carta-video #env-vid{',
    '    inset:auto;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;',
    '    height:min(84vh,843px);aspect-ratio:9/16;width:auto;max-width:92vw;',
    '    object-fit:cover;border-radius:30px;',
    '    box-shadow:0 32px 74px rgba(40,28,12,.34)}',

    /* el "tocá el sello para abrir", justo debajo del sobre */
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
     vuelve a llamar cada vez que cambia la clase de #env o el poster del video. */
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
    /* red de seguridad por si el motor arma el sobre más tarde */
    var n = 0, t = setInterval(function () { pintarFondo(); if (++n > 40) clearInterval(t); }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
