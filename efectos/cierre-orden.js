/* ===== EL «¡GRACIAS!» ABAJO DEL TEXTO FINAL (23/10/2026) =====================
   citlalli-y-hedwin-jesus: «en vez de que diga gracias al inicio, quiero que el
   gracias esté abajo de esta frase. Y ya de ahí los nombres de los novios».
   fx.cierre.fraseAbajo = true → orden: texto final, frase final, nombres.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invCierreOrden) return; window.__invCierreOrden = 1;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var ab = !!(ev.fx && ev.fx.cierre && ev.fx.cierre.fraseAbajo);
    var ff = document.getElementById('fin-frase'), ft = document.getElementById('fin-texto');
    if (!ff || !ft || ff.parentNode !== ft.parentNode) return;
    var estaAbajo = !!(ft.compareDocumentPosition(ff) & 4);
    if (ab && !estaAbajo) { ft.parentNode.insertBefore(ff, ft.nextSibling); ff.style.marginTop = '14px'; }
    if (!ab && estaAbajo) { ft.parentNode.insertBefore(ff, ft); ff.style.marginTop = ''; }
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 150); });
    setInterval(aplicar, 1200);
  }
  arrancar();
})();
