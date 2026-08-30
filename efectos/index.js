/* ===== LOS MÓDULOS DEL FRONT ==================================================

   Esta es LA LISTA. Cada mejora del front vive en su propio archivo dentro de
   /efectos/ y se enciende sumándola acá.

     · Para agregar una: crear /efectos/loquesea.js y sumar la línea.
     · Para apagarla: borrar o comentar la línea. Nada más.

   Los archivos se cargan con `defer`, así que no frenan la carga de la
   invitación, y cada uno se ocupa de no hacer nada si no le toca.

   Quién carga este archivo:
     · la invitación (/i/) y /prueba/admin.html, vía `sobres/catalogo.js`;
     · el admin de PRODUCCIÓN (/admin.html), vía `firebase-inv.js`.
   Por eso sumar cosas nuevas nunca obliga a tocar los HTML grandes
   (index.html y admin.html, de 144-200 KB, que sólo se suben a mano).

   ⚠️ Este archivo lo tocan varias manos. Antes de sobrescribirlo, LEERLO:
   aparecieron módulos puestos por otro lado. Nunca reescribirlo de memoria:
   bajarlo, agregar la línea y subirlo.

   ★★★ SE TRABAJA EN PRODUCCIÓN, NO EN LA ZONA DE PRUEBA ★★★
      Regla de Maki, dicha más de una vez y con razón:
      «la zona de prueba es al pedo porque después pasa esto siempre; probá
       directo en el original».

      El caso que lo demostró (30/8/2026): los bloques del panel —paletas,
      botones, el fondo— estaban hechos, probados y "andando"… en
      /prueba/admin.html. En el admin de VERDAD no aparecían, y nadie se dio
      cuenta durante semanas: /prueba/admin.html carga `sobres/catalogo.js` y
      /admin.html no lo cargaba. Trabajo hecho dos veces por probar en el lugar
      equivocado.

      Entonces:
      · el admin es  https://invitame.littlemomentsok.com/admin.html
      · la muestra es `camila-y-tomas`
      · /prueba/ NO se usa para dar nada por verificado. Si algo anda ahí y no
        se probó en producción, NO está listo.

   ★★ LA MUESTRA OFICIAL ES `camila-y-tomas` ★★
      https://invitame.littlemomentsok.com/i/?e=camila-y-tomas
      Todo lo nuevo se prueba y se mira AHÍ antes de mostrárselo a Maki.
      Es la más cargada de todas: 90 campos con contenido de verdad.

      ⚠️ El evento llamado `muestra` NO es la muestra. Está marcado "NO USAR".
         El nombre obvio es el equivocado — por eso está escrito acá, que es el
         archivo que se lee siempre. Detalle en /prueba/LEEME-muestra-oficial.md

   ★ EL VOSEO YA NO SE PARCHEA: SE ESCRIBE BIEN DE ENTRADA (30/8/2026)
      Había un módulo, `es-mx.js`, que traducía el voseo DESPUÉS de dibujar la
      pantalla, con un MutationObserver sobre todo el documento, en cada
      invitación, para siempre. Ya no hace falta y se sacó de esta lista:

        · el MOTOR lo traduce el servidor, antes de mandar el HTML
          (`i/index.php` + `i/textos-es-mx.php`). Verificado: el HTML crudo de
          una invitación real llega con cero voseo.
        · los MÓDULOS ya escriben sus textos en español de México. Eran seis
          textos, en calendario.js, galeria.js, raspadita.js y
          rsvp-interruptor.js. Corregidos en el origen.

      ⚠️ AL ESCRIBIR UN MÓDULO NUEVO: los textos van en español de México. Lo
         que escribe un módulo NO pasa por el traductor del servidor. Si un
         módulo dice "Tocá", el invitado mexicano lee "Tocá".

      Para revisar que no se coló voseo nuevo, en la consola de la invitación:
        [].concat(...await Promise.all(
          ['calendario','galeria','raspadita','rsvp-interruptor','fecha','musica']
          .map(async m => ((await (await fetch('/efectos/'+m+'.js')).text())
            .match(/'[^'\n]{3,120}'/g)||[])
            .filter(s=>/[a-zñáéíóú]{3,}(á|é|í)'/.test(s)))))

   ⚠️ EL ORDEN IMPORTA en diez casos:
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
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/paleta.js',              /* la paleta: pinta las 12 variables de color de una */
    '/efectos/panel-paleta.js',        /* y el selector de las 20, en el panel */
    '/efectos/botones.js',             /* el material de los botones: lacre, cristal, nácar… */
    '/efectos/panel-botones.js',       /* y su selector, debajo del de paletas */
    '/efectos/rsvp-interruptor.js',    /* el sí/no de la confirmación, como interruptor */
    '/efectos/fondo-invitacion.js',    /* imagen o video en lugar del papel de la invitación */
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
    '/efectos/panel-galeria.js'        /* y sus campos en el panel (prender, código, QR) */
  ];

  MODULOS.forEach(function (src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  });
})();
