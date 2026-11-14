/* ===== NINGÚN BOTÓN CON LA LETRA DEL MISMO COLOR QUE SU FONDO (14/11/2026) =====

   Jazmín, en una boda clara: «Las letras de este link (Ver hoteles) las pueden
   poner en color negro, ya que con letras blancas no se ve. Eso no me deja
   modificarlo el panel».

   La causa era general, no de ese botón: el motor trae `.btn.lt` (botón claro
   con letra crema) pensado para bandas oscuras; en una sección clara queda
   crema sobre crema. Lo mismo puede pasar con cualquier botón y cualquier
   paleta. Por eso son DOS cosas, para TODOS los botones:

   1. EL PANEL MANDA. Cada sección tiene «Color de los botones» y «Color de la
      letra de los botones» (lo aplica /efectos/estilo-secciones.js). Lo que
      Jazmín elige ahí no se toca acá (marca data-estcolor).
   2. LA RED DE SEGURIDAD. Si un botón queda con su letra sin contraste contra
      su propio fondo (menos de 3:1), la letra pasa sola a oscura o blanca, la
      que se lea mejor. Un botón que ya se lee no se toca.

   Sólo mide botones con fondo propio liso (sin imagen ni degradado): ahí la
   medición es exacta. Los botones transparentes dependen de lo que tengan
   detrás y no se adivinan.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invBotonesLegibles) return; window.__invBotonesLegibles = 1;

  var DONDE = '.btn, .wsp, .tv-btn, .acc-btn, #btn-ingresar';
  var OSCURO = '#1f1f1f', CLARO = '#ffffff';

  function rgba(s) {
    var m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?/i.exec(s || '');
    if (!m) return null;
    var a = m[4] == null ? 1 : (/%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    return [+m[1], +m[2], +m[3], a];
  }
  function lum(c) {
    var v = [c[0], c[1], c[2]].map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  function sacar(el) {
    el.style.removeProperty('color'); el.style.removeProperty('-webkit-text-fill-color'); el.style.removeProperty('transition');
    delete el.dataset.legible; delete el.dataset.legOrig;
  }
  function revisar() {
    var lista; try { lista = document.querySelectorAll(DONDE); } catch (e) { return; }
    for (var i = 0; i < lista.length; i++) {
      var el = lista[i];
      if (el.dataset.estcolor) { if (el.dataset.legible) delete el.dataset.legible; continue; }   /* el panel manda */
      if (!el.offsetParent && el.id !== 'btn-ingresar') continue;
      var cs = getComputedStyle(el);
      var bg = rgba(cs.backgroundColor);
      var liso = (!cs.backgroundImage || cs.backgroundImage === 'none') && bg && bg[3] >= 0.6;
      /* la letra ORIGINAL se guarda al ajustar: así se vuelve a medir sin sacar y
         poner (eso reiniciaba la transición del color y el botón titilaba) */
      var tf = cs.webkitTextFillColor;
      var tx = el.dataset.legible ? rgba(el.dataset.legOrig) : (rgba(tf && !/currentcolor/i.test(tf) ? tf : cs.color) || rgba(cs.color));
      if (!liso || !tx || contraste(tx, bg) >= 3) { if (el.dataset.legible) sacar(el); continue; }
      var nuevo = contraste([31, 31, 31], bg) >= contraste([255, 255, 255], bg) ? OSCURO : CLARO;
      if (!el.dataset.legible) el.dataset.legOrig = 'rgba(' + tx.join(',') + ')';
      if (el.style.getPropertyValue('color') !== (nuevo === OSCURO ? 'rgb(31, 31, 31)' : 'rgb(255, 255, 255)')) {
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('color', nuevo, 'important');
        el.style.setProperty('-webkit-text-fill-color', nuevo, 'important');
      }
      el.dataset.legible = '1';
    }
  }
  window.INVBOTONES_LEGIBLES = revisar;

  var n = 0;
  var t = setInterval(function () { revisar(); if (++n > 40) clearInterval(t); }, 600);
  setInterval(revisar, 2500);
  var pend = null;
  window.addEventListener('message', function () { clearTimeout(pend); pend = setTimeout(revisar, 250); }, false);
  document.addEventListener('click', function () { setTimeout(revisar, 350); }, true);
})();
