/* ===== EL CLIMA CON LAS COORDENADAS DE LA CIUDAD  (15/10/2026) ===============

   El formulario del cliente ya no pide coordenadas: `solicitud-crear.php` las
   busca solas a partir de la dirección. Si encuentra el punto EXACTO, van al
   mapa (`ev1maps`) y el motor ya muestra el clima con eso. Si sólo encuentra
   la ciudad, no se ponen en el mapa (un pin en el centro sería peor que la
   búsqueda por la dirección escrita) y quedan en `climaCoords`.

   El motor congelado de cada versión (i/v/<versión>/) busca el clima SÓLO en
   `ev1maps` / `ev2maps`. Este módulo, si la sección quedó escondida y hay
   `climaCoords`, vuelve a llamar a `_clima()` del motor con esas coordenadas.
   No reescribe nada del motor: usa su propia función y su propio dibujo.
   ============================================================================ */
(function () {
  'use strict';
  var hecho = false;
  function probar() {
    if (hecho) return;
    var ev = window.INVEV;
    var sec = document.getElementById('clima-sec');
    if (!ev || !sec || typeof window._clima !== 'function') return;
    var cc = String(ev.climaCoords || '');
    if (!/-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+/.test(cc)) { hecho = true; return; }
    var conMapa = [ev.ev1maps, ev.ev2maps].some(function (x) {
      return /-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+/.test(String(x || '')) || /@-?\d+\.\d+,-?\d+\.\d+/.test(String(x || ''));
    });
    if (conMapa) { hecho = true; return; }   /* el motor ya lo resolvió solo */
    hecho = true;
    var copia = {};
    for (var k in ev) copia[k] = ev[k];
    copia.ev1maps = cc;
    try { window._clima(copia); } catch (e) {}
  }
  var n = 0, t = setInterval(function () { probar(); if (hecho || ++n > 40) clearInterval(t); }, 500);
})();
