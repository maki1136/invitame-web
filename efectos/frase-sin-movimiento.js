/* ===== LA FRASE SIN «LLUVIA» EN LAS INVITACIONES DE CLIENTES (10/11/2026) ===
   Jazmín: «Quiero que desactive de las invitaciones ese efecto que aparece en
   la frase» (círculos rojos/bokeh sobre la frase larga).
   Venía de la MUESTRA: al vestir una invitación se copiaba `fraseFx` y nadie
   lo había elegido. Ahora:
     · vestir.js ya no copia `fraseFx` (las nuevas nacen sin movimiento);
     · acá, en una invitación que NO es muestra, el movimiento sólo se ve si se
       eligió a propósito en el panel (`fraseFxElegido`, lo marca el selector
       «Movimiento sobre la frase»). Lo heredado se apaga.
   Las muestras quedan igual.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invFraseSinMov) return; window.__invFraseSinMov = 1;
  function ev() { return window.INVEV || null; }
  function aplicar() {
    var e = ev(); if (!e) return;
    if (e.fx && e.fx.muestra && e.fx.muestra.venta === true) return;
    if (e.fraseFxElegido) return;
    var fl = document.getElementById('frasefx');
    if (!fl) return;
    if (fl.className !== 'frasefx') fl.className = 'frasefx';
    if (fl.firstChild) fl.innerHTML = '';
  }
  function arrancar() {
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
    addEventListener('message', function () { setTimeout(aplicar, 120); setTimeout(aplicar, 600); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
