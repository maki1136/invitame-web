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

   ★★★ Y SE PRUEBA DESDE EL PANEL, COMO JAZMÍN ★★★
      El interruptor de la confirmación estaba hecho y verificado… pero la
      única forma de prenderlo era escribir `fx.rsvp.estilo` en la base a mano.
      Para quien usa el panel, la función NO estaba.

      Antes de decir que algo está listo:
      1. ¿se ve en la invitación?  (mirar, no medir solamente)
      2. ¿se puede prender y apagar DESDE EL PANEL, sin tocar la base?

      ⚠️ Para operar el panel desde la consola: "Guardar y publicar" llama a
         `publicar()`, que abre un `confirm()` nativo — y un cartel nativo
         CONGELA la página. Hay que pisar `window.confirm` antes y llamar a
         `publicar()` directo, no clickear. Detalle en la skill
         `invitame-flujo-ingenieria`.

      Dónde es cada cosa:
      · /admin.html  → el panel de edición. El único con `.mejoras`, que es
        donde se montan estos bloques. Escribe con `INV.saveEvento` (con merge).
      · /crear.html  → el formulario de alta. NO escribe `fx`.
      · /mi-panel.html → el panel de los novios (slug + clave).
      · /panel.html  → el tablero de métricas.

   ★★ LA MUESTRA OFICIAL ES `camila-y-tomas` ★★
      https://invitame.littlemomentsok.com/i/?e=camila-y-tomas
      Todo lo nuevo se prueba y se mira AHÍ antes de mostrárselo a Maki.
      Es la más cargada de todas: 90 campos con contenido de verdad.

      ⚠️ El evento llamado `muestra` NO es la muestra. Está marcado "NO USAR".

   ★ EL VOSEO YA NO SE PARCHEA: SE ESCRIBE BIEN DE ENTRADA (30/8/2026)
      Se borró `es-mx.js`, que traducía DESPUÉS de dibujar con un
      MutationObserver sobre todo el documento. Ya no hace falta:
        · el MOTOR lo traduce el servidor (`i/index.php` + `i/textos-es-mx.php`);
        · los MÓDULOS ya escriben en español de México;
        · los DATOS de 4 invitaciones se corrigieron.

      ⚠️ AL ESCRIBIR UN MÓDULO NUEVO: los textos van en español de México. Lo
         que escribe un módulo NO pasa por el traductor del servidor.

   ★ LAS COSAS DIBUJADAS CON CSS NO REEMPLAZAN A UNA FOTO (31/8/2026)
      Las perlas del motivo estaban hechas con gradientes. Se veían "de
      dibujito" y Maki lo dijo sin vueltas. Un objeto fotografiado —una perla,
      un lacre, un moño— tiene microrrelieve y nácar que el CSS no imita.
      Ahora la perla es una foto recortada con alfa, de 3.3 KB, incrustada como
      data URI en `perla.js`. El CSS sigue siendo la herramienta correcta para
      superficies (papel, terciopelo, el velo del fondo), no para objetos.

   ⚠️ EL ORDEN IMPORTA en trece casos:
   · `paleta.js` va PRIMERO: deja puestos los colores antes de que se pinte
     nada, así no se ve el salto desde los colores por defecto.
   · `panel-paleta.js` va DESPUÉS de `paleta.js`: el selector arma las tarjetas
     leyendo la lista de window.INVPALETAS, que la publica paleta.js.
   · `botones.js` va DESPUÉS de `paleta.js`: cada material se pinta con las
     variables de color de la paleta.
   · `panel-botones.js` va DESPUÉS de `botones.js`.
   · `rsvp-interruptor.js` va DESPUÉS de `botones.js`.
   · `panel-rsvp.js` va DESPUÉS de `rsvp-interruptor.js`: escribe fx.rsvp.estilo.
   · `fondo-invitacion.js` va DESPUÉS de `paleta.js`: el velo se tiñe con el
     papel de la paleta.
   · `panel-fondo.js` va DESPUÉS de `fondo-invitacion.js`.
   · `itinerario-momentos.js` va ANTES de `itinerario.js`.
   · `fecha.js` va ANTES de `raspadita.js`: la raspadita se monta encima.
   · `panel-galeria.js` va DESPUÉS de `galeria.js`.
   · `perla.js` va ANTES de `motivo.js`: le deja puesta la foto en INVEV.PERLA.
     No dibuja nada; es sólo el material. Si falta, motivo.js cae en las perlas
     de gradiente y no se rompe.
   · `motivo.js` va ÚLTIMO de los que dibujan: cuelga las perlas del marco y de
     los separadores, así que necesita que las secciones ya estén puestas. Y va
     después de `paleta.js` porque el broche se pinta con sus colores.
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/paleta.js',              /* la paleta: pinta las 12 variables de color de una */
    '/efectos/panel-paleta.js',        /* y el selector de las 20, en el panel */
    '/efectos/botones.js',             /* el material de los botones: lacre, cristal, nácar… */
    '/efectos/panel-botones.js',       /* y su selector, debajo del de paletas */
    '/efectos/rsvp-interruptor.js',    /* el sí/no de la confirmación, como interruptor */
    '/efectos/panel-rsvp.js',          /* y el selector para volver a los dos botones */
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
    '/efectos/panel-galeria.js',       /* y sus campos en el panel (prender, código, QR) */
    '/efectos/perla.js',               /* el material: una perla de verdad, recortada (3.3 KB) */
    '/efectos/motivo.js'               /* el motivo que recorre todo: por ahora, las perlas */
  ];

  MODULOS.forEach(function (src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  });
})();
