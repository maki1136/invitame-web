/* ===== EL PASE CON QR SÓLO SI EL PAQUETE LO TRAE (26/10/2026) ==================
   Jazmín, Aurora (pack Estándar): «cuando activo para que confirmen y llegue al
   panel se visualiza el QR y el sector personalizado». El pase con nombre, mesa
   y QR es de los «Pases personalizados», que arrancan en Premium. En un
   Estándar no hay link por invitado, así que ese pase mostraba el ejemplo
   («Familia Rivera») y el QR no servía para nada.
   REGLA: si `fx.paquete.plan` es 'estandar' y no le vendieron aparte 'pases' ni
   'accesoQR', el pase con QR no se muestra. El «Pase simple» (sin QR, sólo la
   cantidad de personas) sigue funcionando en cualquier paquete.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPasePaquete) return; window.__invPasePaquete = 1;
  var ID = 'inv-pase-paquete';
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var pq = (ev.fx && ev.fx.paquete) || {};
    var extras = Array.isArray(pq.extras) ? pq.extras : [];
    var simple = ev.fx && ev.fx.pase && ev.fx.pase.modo === 'simple';
    var sinPases = pq.plan === 'estandar' && extras.indexOf('pases') < 0 && extras.indexOf('accesoQR') < 0;
    var st = document.getElementById(ID);
    if (sinPases && !simple) {
      if (!st) { st = document.createElement('style'); st.id = ID; document.head.appendChild(st); }
      st.textContent = 'section.pase{display:none!important}';
    } else if (st) st.textContent = '';
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
  window.addEventListener('message', function () { setTimeout(aplicar, 100); });
})();
