/* ===== EL PASE CON QR SÓLO SI EL PAQUETE LO TRAE (26/10/2026) ==================
   Jazmín, Aurora (pack Estándar): «cuando activo para que confirmen y llegue al
   panel se visualiza el QR y el sector personalizado». El pase con nombre, mesa
   y QR es de los «Pases personalizados», que arrancan en Premium. En un
   Estándar no hay link por invitado, así que ese pase mostraba el ejemplo
   («Familia Rivera») y el QR no servía para nada.
   REGLA: si `fx.paquete.plan` es 'estandar' y no le vendieron aparte 'pases' ni
   'accesoQR', el pase con QR no se muestra.
   26/10 noche, Jazmín (Aurora): «hay que eliminar el sector que dice cantidad
   de invitados, porque es un pack estándar». La cantidad de personas por link
   es del Pack PLUS, así que en un Estándar tampoco va el «Pase simple».
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPasePaquete) return; window.__invPasePaquete = 1;
  var ID = 'inv-pase-paquete';
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var pq = (ev.fx && ev.fx.paquete) || {};
    var extras = Array.isArray(pq.extras) ? pq.extras : [];
    var sinPases = pq.plan === 'estandar' && extras.indexOf('pases') < 0 && extras.indexOf('accesoQR') < 0;
    /* ★ 27/10 (Maki): «a la Premium hay que eliminarle el código QR». El QR del
       pase es para escanearlo en la puerta: es el Control de acceso QR, que
       viene SÓLO en Platinum (o vendido aparte). Premium lleva el pase con
       nombre, pero sin QR. Sin paquete anotado no se toca nada. */
    var conQR = pq.plan === 'platinum' || extras.indexOf('accesoQR') > -1;
    var sinQR = !!pq.plan && !conQR;
    var css = '';
    if (sinPases) css = 'section.pase{display:none!important}';
    else if (sinQR) css = 'section.pase #qr{display:none!important}';
    var st = document.getElementById(ID);
    if (css) {
      if (!st) { st = document.createElement('style'); st.id = ID; document.head.appendChild(st); }
      st.textContent = css;
    } else if (st) st.textContent = '';
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
  window.addEventListener('message', function () { setTimeout(aplicar, 100); });
})();
