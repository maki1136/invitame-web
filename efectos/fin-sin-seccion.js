/* ===== «DESHABILITAR SECCIÓN FRASE FINAL» QUITA EL CIERRE (27/11/2026) =========
   Jazmín, CUHE: «No puedo deshabilitar la foto final por más que lo tilde, no se va».
   La casilla «Deshabilitar sección frase final» está en PRINCIPAL junto a la
   frase final, el texto final y la foto del fin de página, pero el motor la
   usaba para esconder OTRA sección («Compartí la invitación»). El cierre (la
   foto con la frase final) seguía ahí.
   Ahora, tildada, también saca el cierre: sin foto, sin frase y sin texto final.
   Queda sólo la línea chica de la marca (si no está deshabilitada aparte).
   ⚠️ Sólo invitaciones guardadas desde hoy (INVCAMBIO): las entregadas no cambian
   hasta que alguien las vuelva a guardar.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invFinSinSeccion) return; window.__invFinSinSeccion = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;
  var DESDE = '2026-11-27T16:00:00Z';
  function si(v) { return v === true || v === 'true' || v === 1 || v === '1'; }

  var css = document.createElement('style');
  css.textContent =
    'html.fin-sin-seccion .footer{background:none!important;background-image:none!important;min-height:0!important;height:auto!important;padding:14px 0 18px!important}' +
    'html.fin-sin-seccion .footer::before,html.fin-sin-seccion .footer::after{display:none!important;content:none!important}' +
    'html.fin-sin-seccion .footer > :not(#pie-pub){display:none!important}';
  (document.head || document.documentElement).appendChild(css);

  function aplicar() {
    try {
      var ev = window.INVEV; if (!ev) return;
      var nuevo = typeof window.INVCAMBIO === 'function' ? window.INVCAMBIO(ev, DESDE) : false;
      document.documentElement.classList.toggle('fin-sin-seccion', !!(nuevo && si(ev['c_deshabilitar-seccion-frase-final'])));
    } catch (e) {}
  }
  aplicar();
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 400);
  setInterval(aplicar, 2000);
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 800); });
})();
