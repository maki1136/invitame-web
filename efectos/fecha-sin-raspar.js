/* ===== LA FECHA SIN RASPAR (26/11/2026) ==========
   Jazmín, Ana Patricia & Aldo:
     · «No quiere la raspadita, pero quiere que se vea así la fecha en ese sector
        y eliminar "Raspa para revelar".»
   La sección de la fecha (la de la raspadita) queda a la vista, ya descubierta:
   sin la capa para raspar, sin el título «Raspa para revelar» y sin la ayuda
   («Empieza por el día»). Se sigue viendo «La fecha» y la fecha con su diseño.
   EL DATO
     fx.estiloSec.scratch.sinRaspar → la fecha se ve sin raspar.
   PANEL: EFECTOS → «Raspadita · diseño» → «La fecha se ve sin raspar».
   (La raspadita tiene que estar encendida: es la que arma la sección.)
   ⚠️ Con la casilla apagada NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invFechaSinRaspar) return; window.__invFechaSinRaspar = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;

  function si(v) { return v === true || v === 'true' || v === 1 || v === '1'; }
  function es() { try { return ((window.INVEV || {}).fx || {}).estiloSec || {}; } catch (e) { return {}; } }

  var css = document.createElement('style');
  css.textContent =
    'html.fecha-sin-raspar .scratch-sec .rasp-zona,html.fecha-sin-raspar .scratch-sec #scratch-cv{display:none!important}' +
    'html.fecha-sin-raspar .scratch-sec h2,html.fecha-sin-raspar .scratch-sec .scratch-hint{display:none!important}';
  (document.head || document.documentElement).appendChild(css);

  function aplicar() {
    try { document.documentElement.classList.toggle('fecha-sin-raspar', si((es().scratch || {}).sinRaspar)); } catch (e) {}
  }
  aplicar();
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 400);
  setInterval(aplicar, 2000);
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 800); });
})();
