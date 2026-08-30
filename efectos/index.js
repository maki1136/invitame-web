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

   ⚠️ EL ORDEN IMPORTA en once casos:
   · `paleta.js` va PRIMERO: deja puestos los colores antes de que se pinte
     nada, así no se ve el salto desde los colores por defecto.
   · `panel-paleta.js` va DESPUÉS de `paleta.js`: el selector arma las tarjetas
     leyendo la lista de window.INVPALETAS, que la publica paleta.js.
   · `botones.js` va DESPUÉS de `paleta.js`: cada material se pinta con las
     variables de color de la paleta, no con colores escritos a mano.
   · `panel-botones.js` va DESPUÉS de `botones.js`: las muestras del panel son
     botones de verdad, pintados por la hoja que arma botones.js.
   · `rsvp-interruptor.js` va DESPUÉS de `botones.js`: si los dos están
     encendidos, el interruptor esconde los botones de la confirmación y el
     material deja de aplicar ahí.
   · `fondo-invitacion.js` va DESPUÉS de `paleta.js`: el velo del fondo se tiñe
     con el papel de la paleta, así el fondo se integra en vez de verse pegado.
   · `panel-fondo.js` va DESPUÉS de `fondo-invitacion.js`: escribe fx.fondo, que
     es lo que el otro después lee.
   · `itinerario-momentos.js` va ANTES de `itinerario.js`: primero se escriben
     los momentos de verdad, después se los anima.
   · `fecha.js` va ANTES de `raspadita.js`: la raspadita se monta encima.
   · `panel-galeria.js` va DESPUÉS de `galeria.js`: los dos leen fx.galeria y
     el del panel escribe lo que el otro después lee.
   · `es-mx.js` va ÚLTIMO: traduce lo que escribieron todos los anteriores.
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/paleta.js',              /* la paleta: pinta las 12 variables de color de una */
    '/efectos/panel-paleta.js',        /* y el selector de las 20, en el panel */
    '/efectos/botones.js',             /* el material de los botones: lacre, cristal, nácar… */
    '/efectos/panel-botones.js',       /* y su selector, debajo del de paletas */
    '/efectos/rsvp-interruptor.js',    /* el sí/no de la confirmación, como interruptor */
    '/efectos/fondo-invitacion.js',    /* imagen o video detrás de TODA la invitación */
    '/efectos/panel-fondo.js',         /* y su bloque en el panel, con el subidor */
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
    '/efectos/wa-flotante.js',         /* el flotante de WhatsApp iba a wa.me/ sin número */
    '/efectos/textos-largos.js',       /* hoteles y vestimenta: se pliegan con "Ver más" */
    '/efectos/galeria.js',             /* la galería de fotos de invitados (fx.galeria) */
    '/efectos/panel-galeria.js',       /* y sus campos en el panel (prender, código, QR) */
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
