/* ===== EL PASE AL FINAL · SECCIÓN SIN LA FRANJA DE COLOR (24/11/2026) ==========
   Jazmín, any-luismi:
     · «Ella misma quiere que el sector de pases aparezca al final de la invitación.»
     · Dónde y cuándo: «Ese fondo se cambia, no es verde, es igual que ese» (el
       del itinerario). Es la franja de color de la colección (`.sec.verde`).
   EL DATO
     fx.estiloSec.pase.alFinal  → el pase va al final, justo antes del pie.
     fx.estiloSec.<sección>.sinBanda → esa sección pierde la franja de color y
       queda como las demás (con el fondo de la invitación).
   PANEL: MUSIC_PASES → «Pase del invitado · diseño» y LUGAR_VEST → «Dónde y
   cuándo · diseño».
   ⚠️ Con las casillas apagadas NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPaseFinalBanda) return; window.__invPaseFinalBanda = 1;
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

  /* ---- sección sin la franja de color ---- */
  function bandas() {
    var E = es();
    [].forEach.call(document.querySelectorAll('[data-sec]'), function (s) {
      var k = s.getAttribute('data-sec'), sin = si((E[k] || {}).sinBanda);
      if (sin && s.classList.contains('verde')) { s.classList.remove('verde'); s.setAttribute('data-sin-banda', '1'); }
      else if (!sin && s.getAttribute('data-sin-banda') === '1') { s.classList.add('verde'); s.removeAttribute('data-sin-banda'); }
    });
  }

  function aplicar() { try { pase(); } catch (e) {} try { bandas(); } catch (e) {} }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 400);
  setInterval(aplicar, 2000);
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 800); });
})();
