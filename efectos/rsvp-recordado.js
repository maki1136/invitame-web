/* ===== «CONFIRMASTE QUE ASISTIRÁS» AL VOLVER A ENTRAR (27/10/2026) =============
   Jazmín / Maki, 27/10: «cuando un invitado confirma asistencia y luego vuelve a
   ingresar en la invitación, aparece como si no hubiese confirmado. Debería
   aparecer como en las invitaciones viejas: "Confirmaste que asistirás el
   27/08/2026 · Personas confirmadas: 5 · Modificar confirmación"». Para todas.

   DE DÓNDE SALE LA RESPUESTA
   · Link personal (&g=…): la ficha del invitado (window.INVGUEST: rsvp,
     rsvpPersonas, rsvpAt), que el motor ya lee al abrir. Es la de verdad.
   · Link general (Pack Estándar, sin &g=): no hay ficha propia; se recuerda en
     ESE celular (localStorage) apenas el servidor acepta la respuesta.
   · Y en los dos casos, al confirmar se muestra el cartel en el momento.

   «Modificar confirmación» vuelve a mostrar el formulario de siempre.
   ⚠️ En la miniatura del panel y en las muestras (vidriera) no hace nada.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRsvpRecordado) return; window.__invRsvpRecordado = 1;
  if (!/\/i\//.test(location.pathname)) return;
  var enPanel = (function () { try { return window.parent !== window; } catch (e) { return true; } })();
  if (enPanel) return;

  var QS = new URLSearchParams(location.search);
  function slug() { return (window.INVDATA && INVDATA.slug) || QS.get('e') || ''; }
  function token() { return (window.INVDATA && INVDATA.token) || QS.get('g') || ''; }
  function clave() { return 'invrsvp:' + slug() + ':' + (token() || 'general'); }
  function leerLocal() { try { return JSON.parse(localStorage.getItem(clave()) || 'null'); } catch (e) { return null; } }
  function guardarLocal(o) { try { localStorage.setItem(clave(), JSON.stringify(o)); } catch (e) {} }

  function fechaDe(t) {
    var d = null;
    try {
      if (!t) d = null;
      else if (typeof t.toDate === 'function') d = t.toDate();
      else if (t.seconds) d = new Date(t.seconds * 1000);
      else d = new Date(t);
    } catch (e) { d = null; }
    if (!d || isNaN(d)) return '';
    var z = function (n) { return ('0' + n).slice(-2); };
    return z(d.getDate()) + '/' + z(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  /* la respuesta que hay: la ficha manda; si no hay ficha, la de este celular */
  function respuesta() {
    var g = window.INVGUEST;
    if (g && (g.rsvp === 'confirmado' || g.rsvp === 'rechazado')) {
      return { si: g.rsvp === 'confirmado', personas: g.rsvpPersonas, fecha: fechaDe(g.rsvpAt) || (leerLocal() || {}).fecha || '' };
    }
    if (token() && g) return null;                 /* hay ficha y dice pendiente */
    var l = leerLocal();
    return l ? { si: !!l.si, personas: l.personas, fecha: l.fecha } : null;
  }

  var ID = 'rsvp-hecho';
  function seccion() { return document.querySelector('[data-sec="confirmacion"]'); }
  function css() {
    if (document.getElementById(ID + '-css')) return;
    var s = document.createElement('style'); s.id = ID + '-css';
    s.textContent =
      '#' + ID + '{max-width:360px;margin:18px auto 0;text-align:center}' +
      '#' + ID + ' .rh-t{font-size:20px;line-height:1.35;margin:0 0 8px}' +
      '#' + ID + ' .rh-t b{font-weight:600}' +
      '#' + ID + ' .rh-p{font-size:15px;opacity:.9;margin:0 0 16px}' +
      'section[data-sec="confirmacion"].rsvp-listo .rsvpform{display:none!important}';
    document.head.appendChild(s);
  }
  function mostrar(r) {
    var sec = seccion(); if (!sec || !r) return;
    css();
    var c = document.getElementById(ID);
    if (!c) {
      c = document.createElement('div'); c.id = ID;
      var form = sec.querySelector('.rsvpform');
      if (form) form.parentNode.insertBefore(c, form); else sec.appendChild(c);
    }
    var h = sec.querySelector('h2'), col = h ? getComputedStyle(h).color : '';
    var fam = h ? getComputedStyle(h).fontFamily : '';
    var texto = r.si
      ? 'Confirmaste que <b>asistirás</b>' + (r.fecha ? ' el ' + r.fecha : '')
      : 'Nos avisaste que <b>no podrás asistir</b>' + (r.fecha ? ' (' + r.fecha + ')' : '');
    var per = r.si && r.personas ? '<div class="rh-p">Personas confirmadas: ' + parseInt(r.personas, 10) + '</div>' : '<div class="rh-p"></div>';
    c.innerHTML = '<div class="rh-t">' + texto + '</div>' + per +
      '<div class="acc-r"><button type="button" class="rh-mod">Modificar confirmación</button></div>';
    c.style.color = col; var t = c.querySelector('.rh-t'); if (t && fam) t.style.fontFamily = fam;
    c.style.display = '';
    sec.classList.add('rsvp-listo');
    c.querySelector('.rh-mod').onclick = function () {
      sec.classList.remove('rsvp-listo'); c.style.display = 'none';
      var f = sec.querySelector('.rsvpform'); if (f) { f.classList.add('in'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    };
  }

  /* ---- al responder, se anota y se muestra ---- */
  function hoy() { return fechaDe(new Date()); }
  function personasElegidas(def) {
    var sel = document.querySelector('[data-sec="confirmacion"] .rsvpform select');
    var n = parseInt(sel && sel.value, 10);
    return n || def || null;
  }
  function engancharGuardado() {
    if (!window.INV || typeof INV.saveRSVP !== 'function' || INV.saveRSVP.__rec) return !!(window.INV && INV.saveRSVP && INV.saveRSVP.__rec);
    var orig = INV.saveRSVP;
    var nuevo = function (s, tk, estado, personas) {
      var p = orig.apply(this, arguments);
      Promise.resolve(p).then(function () {
        var r = { si: estado === 'confirmado', personas: estado === 'confirmado' ? (personas || personasElegidas()) : 0, fecha: hoy() };
        guardarLocal(r);
        if (window.INVGUEST) { INVGUEST.rsvp = estado; INVGUEST.rsvpPersonas = r.personas; INVGUEST.rsvpAt = new Date(); }
        setTimeout(function () { mostrar(r); }, 1600);   /* deja ver el «Qué alegría…» */
      }, function () {});
      return p;
    };
    nuevo.__rec = true;
    INV.saveRSVP = nuevo;
    return true;
  }
  /* link general: /rsvp-general.php */
  (function () {
    if (!window.fetch || window.fetch.__rec) return;
    var f0 = window.fetch;
    var f1 = function (url, op) {
      var p = f0.apply(this, arguments);
      try {
        if (String(url).indexOf('/rsvp-general.php') >= 0 && op && op.body) {
          var b = JSON.parse(op.body);
          p.then(function (res) { return res.clone().json(); }).then(function (j) {
            if (!j || !j.ok) return;
            var r = { si: b.estado === 'si', personas: b.estado === 'si' ? b.personas : 0, fecha: hoy() };
            guardarLocal(r); setTimeout(function () { mostrar(r); }, 1600);
          }).catch(function () {});
        }
      } catch (e) {}
      return p;
    };
    f1.__rec = true;
    window.fetch = f1;
  })();

  /* ---- al abrir: si ya respondió, el cartel ---- */
  var n = 0, listo = false;
  var t = setInterval(function () {
    engancharGuardado();
    var ev = window.INVEV;
    if (ev && !listo) {
      var vidriera = !token() && !(ev.fx && ev.fx.rsvp && ev.fx.rsvp.general === true);
      var esperarFicha = token() && window.INVGUEST === undefined && n < 30;
      if (vidriera) { listo = true; }
      else if (!esperarFicha) {
        listo = true;
        var r = respuesta(); if (r) mostrar(r);
      }
    }
    if (++n > 60) clearInterval(t);
  }, 300);
})();
