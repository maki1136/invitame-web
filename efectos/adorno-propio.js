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
  var st = document.createElement('style');
  st.id = 'inv-adorno-propio';
  st.textContent = S + '{background-image:none!important;background-color:transparent!important;' +
    '-webkit-mask-image:none!important;mask-image:none!important;box-shadow:none!important;border:0!important}';
  (document.head || document.documentElement).appendChild(st);
})();
