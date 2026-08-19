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
   el 19/8 apareció `encuadre-monitor.js` que no había puesto yo.
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/itinerario.js',        /* la línea del itinerario se dibuja con el scroll */
    '/efectos/calendario.js',        /* el calendario del mes con la fecha marcada */
    '/efectos/raspadita.js',         /* la raspadita: por partes, polvillo, destello */
    '/efectos/encuadre-monitor.js',  /* en compu: todo en una columna, como en el celular */
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
