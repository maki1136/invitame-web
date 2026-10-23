/* ===== LA CARTA QUE LLEVA LA FRASE NO SE ESCONDE (23/10/2026) ================
   citlalli-y-hedwin-jesus (Marfil): «no está por ningún lado en mi invitación
   la frase que va debajo de la fecha». Marfil muda la frase adentro de la
   carta (#carta-sec .mf-frase), pero el motor esconde la carta entera cuando
   no tiene texto propio → la frase se iba con ella.
   Si la carta lleva la frase adentro, se muestra, salvo que esté apagada en el
   panel o marcada en «Secciones que no van».
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invCartaConFrase) return; window.__invCartaConFrase = 1;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var fx = ev.fx || {};
    var cs = document.getElementById('carta-sec'); if (!cs) return;
    var oc = Array.isArray(fx.ocultas) ? fx.ocultas : [];
    if ((fx.carta && fx.carta.on === false) || oc.indexOf('carta') > -1) return;
    if (!cs.querySelector('.mf-frase')) return;
    if (cs.style.display === 'none') { cs.style.display = ''; cs.setAttribute('data-por-la-frase', '1'); }
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 150); });
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 500);
  }
  arrancar();
})();
