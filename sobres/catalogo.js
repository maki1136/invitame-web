/* ===== SOBRES DE INVÍTAME =====================================================
   Este archivo tiene DOS partes:
     1) EL CATÁLOGO  — la lista de sobres disponibles
     2) LOS ESTILOS  — cómo se encuadra el sobre en pantalla ancha

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
              mientras el video todavía carga.
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


/* ===== 2. EL ENCUADRE EN PANTALLA ANCHA =======================================

   EL PROBLEMA
   Los videos de sobre son verticales (9:16), pensados para el celular. En el
   celular se ven perfectos. Pero en una compu la ventana es apaisada, y el
   video se estiraba a toda la pantalla con "cover": entraba solamente el centro
   del sobre, ampliadísimo, y quedaban afuera las cuatro esquinas, el lacre
   entero y las flores secas.

   LA SOLUCIÓN
   Que en pantalla ancha el sobre NO ocupe toda la ventana, sino que sea una
   tarjeta vertical centrada — exactamente como ya se muestra la invitación en
   la compu (`.portada` es 474px de ancho, 84vh de alto, esquinas de 30px y una
   sombra suave). Alrededor queda el mismo fondo kraft del sitio.

   POR QUÉ NO HAY SALTO AL ABRIR
   Le damos al sobre el alto de la portada (84vh) y la proporción del video
   (9:16). En un monitor de altura normal eso da 474px de ancho: el MISMO ancho
   que la portada. Entonces cuando el video termina y aparece la invitación, la
   caja no se mueve. En ventanas bajas el sobre sale un poco más angosto y la
   invitación crece un poco al entrar, que acompaña la sensación de que la carta
   sale del sobre.

   EN EL CELULAR NO CAMBIA NADA: todo esto vive dentro de un @media de 680px
   para arriba. Y sólo toca el modo `carta-video`; los otros modos de sobre
   quedan como estaban.
   ============================================================================ */
(function () {
  var css = [
    '@media (min-width:680px){',
    /* el kraft del sitio alrededor de la tarjeta, en vez del degradado oscuro */
    '  #env.carta-video{background:#d7ccbd}',
    '  #env.carta-video #env-vid{',
    '    inset:auto;left:50%;top:50%;transform:translate(-50%,-50%);',
    /* el alto de la portada + la proporcion del video = el ancho sale solo */
    '    height:min(84vh,843px);aspect-ratio:9/16;width:auto;max-width:92vw;',
    '    object-fit:cover;',
    /* mismas esquinas y misma sombra que .portada, para que calce */
    '    border-radius:30px;box-shadow:0 32px 74px rgba(40,28,12,.30)}',
    /* el "tocá el sello para abrir" va debajo de la tarjeta, no del todo abajo */
    '  #env.carta-video .vhint{',
    '    position:absolute;left:50%;transform:translateX(-50%);',
    '    top:calc(50% + min(42vh,421px) + 18px)}',
    '}'
  ].join('\n');

  function poner() {
    if (document.getElementById('sobre-encuadre')) return;
    var s = document.createElement('style');
    s.id = 'sobre-encuadre';
    s.textContent = css;
    /* al final del head: así gana sobre las reglas que ya trae la página */
    (document.head || document.documentElement).appendChild(s);
  }

  if (document.head) poner();
  else document.addEventListener('DOMContentLoaded', poner);
})();
