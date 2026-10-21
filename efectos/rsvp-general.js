/* ===== CONFIRMAR CON UN SOLO LINK PARA TODOS (Pack Estándar) · 20/10/2026 =====

   Pedido de Jazmín: «en el Estándar se envía el mismo link a todos, sin pase».
   Sin link propio (`&g=`), el motor entra en modo vidriera: esconde el
   formulario de confirmación y pone «Esta es una muestra…». O sea: nadie podía
   confirmar.

   CON `fx.rsvp.general = true` (panel → CONFIRMACIÓN → «Un solo link para
   todos») y SIN link de invitado, este módulo:
     · vuelve a mostrar el formulario del motor (el mismo, con el estilo de la
       colección y el interruptor sí/no si lo tiene) y la frase de la sección;
     · pide el nombre y apellido (sin nombre no se manda);
     · al tocar «Sí, asistiré» o «No podré», manda nombre, respuesta, personas
       y mensaje a /rsvp-general.php, que lo guarda como un invitado más y,
       si está prendido el aviso por mail, le manda al cliente UN correo con
       la lista completa actualizada.
   La misma persona puede cambiar su respuesta: no se duplica (el servidor la
   reconoce por el nombre).

   ⚠️ Con link de invitado (`&g=…`) no hace NADA: manda el camino de siempre.
   ⚠️ En la miniatura del panel se ve igual, pero NO manda nada.
   ⚠️ En las muestras de venta no se prende (lo frena también el servidor).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRsvpGeneral) return; window.__invRsvpGeneral = 1;
  if (!/\/i\//.test(location.pathname)) return;

  var T0 = Date.now();
  var enPanel = (function () { try { return window.parent !== window; } catch (e) { return true; } })();

  function ev() { return window.INVEV || null; }
  function activo() {
    var e = ev(); if (!e || !e.fx) return false;
    if ((window.INVDATA || {}).token) return false;
    if (e.fx.muestra && e.fx.muestra.venta) return false;
    return !!(e.fx.rsvp && e.fx.rsvp.general === true);
  }
  function $(id) { return document.getElementById(id); }

  var nombrePuesto = false, selectPuesto = false;
  function poner() {
    if (!activo()) return;
    [].forEach.call(document.querySelectorAll('.rsvpform'), function (f) { if (f.style.display === 'none') f.style.display = ''; });
    var p = document.querySelector('[data-sec="confirmacion"] p');
    var frase = String((ev() || {})['c_frase-para-seccion-confirmacion'] || '').trim() || 'Por favor, confírmanos tu asistencia.';
    if (p && /Esta es una muestra/.test(p.textContent)) p.textContent = frase;
    var rn = $('rname');
    if (rn && !nombrePuesto) { nombrePuesto = true; rn.value = ''; rn.placeholder = 'Tu nombre y apellido'; rn.setAttribute('autocomplete', 'name'); }
    var sel = document.querySelector('.rsvpform select');
    if (sel && !selectPuesto) {
      selectPuesto = true;
      sel.innerHTML = '';
      for (var i = 1; i <= 10; i++) { var o = document.createElement('option'); o.value = String(i); o.textContent = String(i); sel.appendChild(o); }
      sel.value = '1';
    }
  }

  function aviso(txt, color) { var m = $('rmsg'); if (m) { m.textContent = txt; if (color) m.style.color = color; } }

  function soltarInterruptor() {
    [].forEach.call(document.querySelectorAll('.rsvp-sw, .rsvp-sw [data-r]'), function (e) { e.removeAttribute('data-r'); });
    var sw = document.querySelector('.rsvp-sw'); var c = sw && sw.closest('[data-r]'); if (c) c.removeAttribute('data-r');
  }

  var yendo = false;
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.rsvpform .acc-r button');
    if (!b || !activo()) return;
    var rn = $('rname');
    var nombre = (rn && rn.value || '').replace(/\s+/g, ' ').trim();
    if (nombre.length < 2) {
      e.preventDefault(); e.stopImmediatePropagation();
      soltarInterruptor();
      aviso('Escribe tu nombre y apellido para confirmar.', '#e6c6cd');
      if (rn) rn.focus();
      return;
    }
    var si = !b.classList.contains('no');
    if (enPanel) return;                         /* la miniatura muestra, no guarda */
    if (yendo) return;
    yendo = true;
    var sel = document.querySelector('.rsvpform select');
    var ta = document.querySelector('.rsvpform textarea');
    fetch('/rsvp-general.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: (window.INVDATA || {}).slug || new URLSearchParams(location.search).get('e') || '',
        nombre: nombre.slice(0, 80), estado: si ? 'si' : 'no',
        personas: parseInt(sel && sel.value, 10) || 1,
        mensaje: String(ta && ta.value || '').slice(0, 500),
        trampa: '', segundos: Math.round((Date.now() - T0) / 1000)
      })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) aviso('No se pudo enviar tu respuesta. Prueba de nuevo en un momento.', '#e6c6cd');
    }).catch(function () {
      aviso('No se pudo enviar tu respuesta. Revisa tu conexión y prueba de nuevo.', '#e6c6cd');
    }).then(function () { yendo = false; });
  }, true);

  var n = 0, t = setInterval(function () { poner(); if (++n > 50) clearInterval(t); }, 400);
  window.addEventListener('message', function () { setTimeout(poner, 80); setTimeout(poner, 600); });
})();
