/* ===== LOS MÓDULOS DEL FRONT ==================================================

   Esta es LA LISTA. Cada mejora del front vive en su propio archivo dentro de
   /efectos/ y se enciende sumándola acá.

     · Para agregar una: crear /efectos/loquesea.js y sumar la línea.
     · Para apagarla: borrar o comentar la línea. Nada más.

   Los archivos se cargan con `defer`, así que no frenan la carga de la
   invitación, y cada uno se ocupa de no hacer nada si no le toca.

   Este archivo lo carga /sobres/catalogo.js, que es lo único que la invitación
   tiene enganchado. Por eso sumar cosas nuevas nunca obliga a tocar los HTML
   grandes (index.html y admin.html, de 200 KB, que sólo se pueden subir a mano).

   ⚠️ Este archivo lo tocan varias manos. Antes de sobrescribirlo, LEERLO:
   aparecieron módulos puestos por otro lado. Nunca reescribirlo de memoria:
   bajarlo, agregar la línea y subirlo.

   ⚠️ EL ORDEN IMPORTA en cuatro casos:
   · `itinerario-momentos.js` va ANTES de `itinerario.js`: primero se escriben
     los momentos de verdad, después se los anima.
   · `fecha.js` va ANTES de `raspadita.js`: la raspadita se monta encima.
   · `textos-largos.js` va DESPUÉS de `musica.js`: pliega lo que ya está escrito.
   · `es-mx.js` va ÚLTIMO: traduce lo que escribieron todos los anteriores.
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/itinerario-momentos.js', /* carga los momentos reales del itinerario */
    '/efectos/itinerario.js',          /* y la línea se dibuja con el scroll */
    '/efectos/calendario.js',          /* el calendario del mes con la fecha marcada */
    '/efectos/fecha.js',               /* las nueve maneras de mostrar la fecha */
    '/efectos/raspadita.js',           /* la raspadita: se monta sobre la fecha */
    '/efectos/encuadre-monitor.js',    /* en compu: todo en una columna */
    '/efectos/pieza-carta.js',         /* escribe los nombres sobre la tarjeta del sobre */
    '/efectos/panel-pieza.js',         /* y sus ajustes dentro del bloque ✨ Efectos */
    '/efectos/panel-etiquetas.js',     /* nombres únicos en el panel */
    '/efectos/imagen-cierre.js',       /* el "¡Gracias!" del final iba sobre una foto de stock */
    '/efectos/musica.js',              /* la Platinum vende Música y el motor no la tenía */
    '/efectos/textos-largos.js',       /* hoteles y vestimenta: se pliegan con "Ver más" */
    '/efectos/es-mx.js'                /* español de México: el motor está en voseo */
  ];

  MODULOS.forEach(function (src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  });
})();
