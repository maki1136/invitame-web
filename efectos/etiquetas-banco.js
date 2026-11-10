/* ===== ETIQUETAS DE LOS DATOS PARA TRANSFERENCIA, EDITABLES (10/11) ==========
   Jazmín (Melany, XV): «Queremos cambiar la palabra CLABE en el sector de
   transferencias… que se puedan cambiar esas palabras».
   El motor escribe «CLABE» / «CBU / Cuenta», «Titular» y «Banco». Si el evento
   trae regEtqCuenta / regEtqTitular / regEtqBanco (panel → REGALOS, debajo de
   Titular y Banco), se ven esas palabras. Vacío = lo de siempre.
   Va como efecto porque el motor está congelado por versión (i/v/).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invEtqBanco) return; window.__invEtqBanco = 1;
  var orig = null;
  function aplicar() {
    var e = window.INVEV; if (!e) return;
    var ls = document.querySelectorAll('#reg-banco-wrap .banco > .l');
    if (ls.length < 3) return;
    if (!orig) orig = [ls[0].textContent, ls[1].textContent, ls[2].textContent];
    var k = ['regEtqCuenta', 'regEtqTitular', 'regEtqBanco'];
    for (var i = 0; i < 3; i++) {
      var v = String(e[k[i]] || '').trim();
      if (v) { if (ls[i].textContent !== v) ls[i].textContent = v; ls[i].setAttribute('data-etq', '1'); }
      else if (ls[i].getAttribute('data-etq')) { ls[i].removeAttribute('data-etq'); ls[i].textContent = i === 0 ? (e.regClabe ? 'CLABE' : 'CBU / Cuenta') : orig[i]; }
    }
  }
  function arrancar() {
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
    addEventListener('message', function () { setTimeout(aplicar, 120); setTimeout(aplicar, 600); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
