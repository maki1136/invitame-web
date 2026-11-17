/* ===== TOPE DE «¿CUÁNTOS ASISTIRÁN?» (17/11/2026) ==============================
   Jazmín (Melissa, Mis XV): «¿se puede hacer que sólo aparezca hasta 5 en el
   sector de confirmación?». La lista la arman tres módulos según el link
   (el motor 1-4, rsvp-general.js 1-10, rsvp-extras.js 1 al total del pase).
   Acá, después de todos: si fx.rsvp.maxPersonas está puesto, la lista va de 1
   al tope (con el link general la completa hasta el tope; con el pase de un
   invitado, nunca pasa de sus lugares). Vacío = como viene.
   Sólo el PRIMER select del formulario: es el de la cantidad (los otros son
   preguntas propias, rsvp-preguntas.js).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRsvpMax) return; window.__invRsvpMax = 1;
  function tope() {
    var e = window.INVEV; if (!e || !e.fx || !e.fx.rsvp) return 0;
    var n = parseInt(e.fx.rsvp.maxPersonas, 10);
    return n >= 1 && n <= 30 ? n : 0;
  }
  function revisar() {
    var max = tope(); if (!max) return;
    var conPase = /[?&]g=/.test(location.search);
    [].forEach.call(document.querySelectorAll('.rsvpform'), function (f) {
      var s = f.querySelector('select'); if (!s) return;
      var ops = [].slice.call(s.options), nums = ops.map(function (o) { return parseInt(o.value || o.textContent, 10); });
      if (nums.some(isNaN)) return;
      var hasta = Math.max.apply(null, nums);
      var meta = conPase ? Math.min(hasta, max) : max;
      if (hasta === meta && nums.length === meta) return;
      var antes = parseInt(s.value, 10);
      s.innerHTML = '';
      for (var i = 1; i <= meta; i++) { var o = document.createElement('option'); o.value = String(i); o.textContent = String(i); s.appendChild(o); }
      s.value = String(isNaN(antes) ? 1 : Math.min(antes, meta));
      /* que rsvp-extras no la vuelva a armar con el total del pase */
      if (s.dataset.armadoPara) s.dataset.armadoPara = String(parseInt(s.dataset.armadoPara, 10));
    });
  }
  window.INVRSVP_MAX = revisar;
  var n = 0, t = setInterval(function () { revisar(); if (++n > 40) { clearInterval(t); setInterval(revisar, 2000); } }, 500);
  addEventListener('message', function () { setTimeout(revisar, 200); });
})();
