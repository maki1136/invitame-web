/* ===== CONFIRMACIÓN SIN «¿CUÁNTOS ASISTIRÁN?» (9/11/2026) =====================
   Jazmín: «Formulario de confirmación: únicamente eliminar cuántos asistirán.
   ¿Se podrá colocar en la plataforma que en el pack Estándar puedan eliminar
   la cantidad?»

   Con fx.rsvp.sinCantidad === true (panel → CONFIRMACIÓN → casilla «Sin
   ¿Cuántos asistirán?») se esconden la pregunta y su lista. La lista sigue
   existiendo (escondida) porque de ahí lee la cantidad el motor al guardar:
     · link general (Estándar): cada confirmación cuenta 1 persona;
     · link de invitado: cuenta los lugares de su pase (el número del pase).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRsvpSinCant) return; window.__invRsvpSinCant = 1;

  function activo() {
    var e = window.INVEV || {};
    return !!(e.fx && e.fx.rsvp && e.fx.rsvp.sinCantidad === true);
  }
  function revisar() {
    var sels = document.querySelectorAll('[data-sec="confirmacion"] .rsvpform select');
    [].forEach.call(sels, function (sel) {
      var lab = sel.previousElementSibling;
      var esCant = lab && lab.tagName === 'LABEL' && /cu[aá]nt/i.test(lab.textContent || '');
      if (!esCant) return;
      if (!activo()) {
        if (sel.dataset.sinCant) { sel.style.display = ''; lab.style.display = ''; delete sel.dataset.sinCant; }
        return;
      }
      sel.style.display = 'none'; lab.style.display = 'none'; sel.dataset.sinCant = '1';
      var tok = (window.INVDATA || {}).token;
      var n = 1;
      if (tok) { var p = parseInt((document.getElementById('pv-per') || {}).textContent, 10); if (p > 0) n = p; }
      var v = String(n);
      if (![].some.call(sel.options, function (o) { return o.value === v || o.textContent === v; })) {
        var o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o);
      }
      if (sel.value !== v) sel.value = v;
    });
  }
  function arrancar() {
    revisar();
    addEventListener('message', function () { setTimeout(revisar, 200); });
    var k = 0, t = setInterval(function () { revisar(); if (++k > 40) clearInterval(t); }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
