/* ===== LA TRIVIA SE VE SÓLO SI ESTÁ PRENDIDA EN EL PANEL (30/9/2026) ==========

   Medido en isabella (XV que armó Jazmín desde el panel): en AVANZADO la casilla
   «Habilitar trivia» estaba APAGADA, pero la invitación publicada mostraba la
   trivia «¿Cuánto conoces a la pareja?» con las preguntas de ejemplo de una
   boda. El motor, cuando la casilla nunca se tocó (valor sin definir), no hace
   nada y la sección queda a la vista.
   Regla del panel: lo que se ve es lo que dice el panel. Casilla apagada o sin
   tocar = trivia escondida. Las muestras que la usan (camila-y-tomas,
   renata-y-patricio, julia-y-santiago) la tienen prendida: no cambian.
   Vive en /efectos/ para que valga en todas las versiones del motor.
   ============================================================================ */
(function () {
  'use strict';
  function prendida() {
    var v = (window.INVEV || {})['c_habilitar-trivia'];
    return v === true || /^(true|si|sí|1)$/i.test(String(v));
  }
  function aplicar() {
    if (!window.INVEV) return;
    var t = document.querySelector('[data-sec="trivia"]'); if (!t) return;
    if (!prendida()) { if (t.style.display !== 'none') t.style.display = 'none'; t.setAttribute('data-trivia-apagada', '1'); }
    else if (t.getAttribute('data-trivia-apagada')) { t.removeAttribute('data-trivia-apagada'); t.style.display = ''; }
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 80); });
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 30) clearInterval(t); }, 500);
  }
  arrancar();
})();
