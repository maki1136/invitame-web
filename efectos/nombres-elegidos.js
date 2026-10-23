/* ===== LOS NOMBRES COMO LOS ELIGIERON EN EL PANEL (23/10/2026) ===============
   Jazmín, en evelyn-camarillo-saavedra (Vaquera vino): «no funcionan los botones
   para modificar los colores del nombre y el tamaño de letra». Las colecciones
   pintan #pv-names (y sus <span>) con !important, así que el color, el tamaño
   y la letra del panel no se veían nunca.
   Cuando se tocan en el panel queda una marca (fx.ncolorElegido, fx.nsizeElegido,
   fx.nfontElegida) y esto los pone EN LÍNEA con !important sobre el título y
   cada <span>: en línea + !important le gana a cualquier hoja. Sin marca no
   toca nada: las muestras siguen con lo de su colección.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invNombresElegidos) return; window.__invNombresElegidos = 1;

  function poner(el, prop, val) {
    if (el.style.getPropertyValue(prop) !== val || el.style.getPropertyPriority(prop) !== 'important') el.style.setProperty(prop, val, 'important');
  }
  function sacar(el, prop) { if (el.style.getPropertyPriority(prop) === 'important') el.style.removeProperty(prop); }

  function revisar() {
    var ev = window.INVEV; if (!ev || typeof ev !== 'object') return;
    var fx = ev.fx || {};
    var nom = document.getElementById('pv-names'); if (!nom) return;
    var els = [nom].concat([].slice.call(nom.querySelectorAll('span')));
    els.forEach(function (e) {
      if (fx.ncolorElegido && ev.ncolor) {
        poner(e, 'color', ev.ncolor); poner(e, '-webkit-text-fill-color', ev.ncolor);
        poner(e, 'background-image', 'none');
      } else { sacar(e, 'color'); sacar(e, '-webkit-text-fill-color'); sacar(e, 'background-image'); }
      if (fx.nfontElegida && ev.nfont) poner(e, 'font-family', ev.nfont);
      else if (e !== nom) sacar(e, 'font-family');
      if (e !== nom) {
        if (fx.nsizeElegido && ev.nsize) poner(e, 'font-size', 'inherit'); else sacar(e, 'font-size');
      }
    });
    if (fx.nsizeElegido && ev.nsize) {
      var n = parseInt(ev.nsize, 10) || 52;
      poner(nom, 'font-size', 'min(' + n + 'px, ' + (ev.layout === 'juntos' ? 12 : 22) + 'vw)');
    } else sacar(nom, 'font-size');
  }

  revisar();
  window.addEventListener('message', function () { setTimeout(revisar, 80); }, false);
  var n = 0, t = setInterval(function () { revisar(); if (++n > 30) clearInterval(t); }, 500);
})();
