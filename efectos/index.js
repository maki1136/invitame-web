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
   el 19/8 aparecieron `encuadre-monitor.js` y `pieza-carta.js` de un lado y
   `fecha.js` y `raspadita.js` del otro, ninguno puesto por el mismo.
   Nunca reescribirlo de memoria: bajarlo, agregar la línea y subirlo.

   ⚠️ EL ORDEN IMPORTA en un caso: `fecha.js` va ANTES de `raspadita.js`, porque
   la raspadita se monta encima de lo que la fecha haya dibujado.
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/itinerario.js',        /* la línea del itinerario se dibuja con el scroll */
    '/efectos/calendario.js',        /* el calendario del mes con la fecha marcada */
    '/efectos/fecha.js',             /* las nueve maneras de mostrar la fecha */
    '/efectos/raspadita.js',         /* la raspadita: se monta sobre la fecha */
    '/efectos/encuadre-monitor.js',  /* en compu: todo en una columna, como en el celular */
    '/efectos/pieza-carta.js',       /* escribe los nombres sobre la tarjeta del sobre */
    '/efectos/panel-pieza.js',       /* y sus ajustes dentro del bloque ✨ Efectos */
    '/efectos/panel-preview.js'      /* TEMPORAL: la previa del panel, mientras el
                                        admin de prueba esté fuera de su carpeta */
  ];

  MODULOS.forEach(function (src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  });
})();
