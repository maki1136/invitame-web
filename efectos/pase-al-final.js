/* ===== EL PASE AL FINAL (24/11/2026) ==========
   Jazmín, any-luismi:
     · «Ella misma quiere que el sector de pases aparezca al final de la invitación.»
     (Lo del fondo verde de Dónde y cuándo NO era del diseño: era un color
      elegido en el panel — se saca con «Quitar color (como viene el diseño)».)
   EL DATO
     fx.estiloSec.pase.alFinal  → el pase va al final, justo antes del pie.
   PANEL: MUSIC_PASES → «Pase del invitado · diseño» → «Pase al final».
   ⚠️ Con las casillas apagadas NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPaseAlFinal) return; window.__invPaseAlFinal = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;

  function si(v) { return v === true || v === 'true' || v === 1 || v === '1'; }
  function es() { try { return ((window.INVEV || {}).fx || {}).estiloSec || {}; } catch (e) { return {}; } }

  /* ---- el pase al final ---- */
  var marca = null;
  function pase() {
    var p = document.querySelector('section.pase'); if (!p) return;
    var quiere = si((es().pase || {}).alFinal);
    if (quiere) {
      var pie = document.querySelector('.footer'); if (!pie || !pie.parentNode) return;
      if (!marca) { marca = document.createComment('lugar-del-pase'); p.parentNode.insertBefore(marca, p); }
      /* va antes del pie, después de la última sección visible */
      if (p.nextElementSibling !== pie) pie.parentNode.insertBefore(p, pie);
    } else if (marca && marca.parentNode) {
      marca.parentNode.insertBefore(p, marca); marca.remove(); marca = null;
    }
  }

  function aplicar() { try { pase(); } catch (e) {} }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 400);
  setInterval(aplicar, 2000);
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 800); });
})();
