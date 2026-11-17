/* ===== EL ADORNO PROPIO VA SOLO (16/11/2026) =====================================
   Jazmín, ailicec-mishell (Celebra · Scrapbook): subió su moño como adorno de
   los títulos (panel → Diseño → adorno propio) y arriba de cada título salía el
   moño ENCIMA del lacre de la colección: «sacar el lacre que tiene toda la invi
   y dejar el moño que yo puse».
   El motor pone el adorno propio como <img class="adorno">, y varias
   colecciones pintan su viñeta como FONDO de `.adorno` (con selectores largos
   y !important), así que la viñeta quedaba detrás de la imagen. Cuando el
   adorno es una imagen subida, la imagen va sola, en TODAS las colecciones.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invAdornoPropio) return; window.__invAdornoPropio = 1;
  var S = 'html body img.adorno.adorno.adorno.adorno';
  var CSS = S + '{background-image:none!important;background-color:transparent!important;' +
    '-webkit-mask-image:none!important;mask-image:none!important;box-shadow:none!important;border:0!important}';
  /* una invitación ENTREGADA queda como se entregó, salvo que la vuelvan a
     guardar desde el panel (ver INVCAMBIO en novedades.js) */
  function revisar() {
    var e = window.INVEV; if (!e) return;
    var va = window.INVCAMBIO ? window.INVCAMBIO(e, '2026-11-16T23:00:00Z') : true;
    var st = document.getElementById('inv-adorno-propio');
    if (va && !st) { st = document.createElement('style'); st.id = 'inv-adorno-propio'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
    else if (!va && st) st.remove();
  }
  revisar();
  var n = 0, t = setInterval(function () { revisar(); if (++n > 30) clearInterval(t); }, 500);
  addEventListener('message', function () { setTimeout(revisar, 200); });
})();
