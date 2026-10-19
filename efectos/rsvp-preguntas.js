/* ===== LA CONFIRMACIÓN CON PREGUNTAS EXTRA ======================================

   19/10/2026 — corporativo (empresa, cargo), kids (¿cuántos niños?, ¿alguna
   alergia?), baby shower (¿crees que es niño?, como juego).

   DE DÓNDE SALE
     fx.rsvp.preguntas = [{ texto, tipo: 'texto' | 'sino' }]   (hasta 3)
   Panel: efectos/panel-rsvp-preguntas.js (pestaña CONFIRMACIÓN).
   Formulario del cliente: «Confirmación de asistencia».

   QUÉ HACE
   · Suma las preguntas al formulario de confirmación, arriba de los botones.
     «sino» va con dos opciones (Sí / No) en botones de radio, NO en un
     <select>: rsvp-extras.js rearma TODOS los select del formulario con la
     cantidad de lugares, y el motor lee el PRIMER select como «¿Cuántos?».
   · Envuelve INV.saveRSVP: deja que se guarde lo de siempre y DESPUÉS, aparte
     y con su propio catch, guarda las respuestas en `rsvpExtras` (texto JSON,
     ≤ 600: [["pregunta","respuesta"], …]). Si la regla de Firestore todavía no
     admite `rsvpExtras`, falla SÓLO eso: la confirmación ya quedó guardada.
   · Las ven los anfitriones en mi-panel.js (tabla, Mensajes y el CSV).

   ⚠️ ESTO TOCA LA CONFIRMACIÓN, QUE ES POR DONDE ENTRA LA PLATA. Nada de acá
      puede frenar el guardado del sí o el no: todo va en try/catch y la
      respuesta del guardado original se devuelve tal cual, sin esperar.
   ⚠️ Puede quedar envuelto dos veces (rsvp-extras.js envuelve después y no
      conoce esta marca): el candado `enCurso` evita guardar doble.
   ============================================================================ */
(function () {
  'use strict';

  function cfg() {
    var ev = window.INVEV || {};
    var p = ev.fx && ev.fx.rsvp && ev.fx.rsvp.preguntas;
    return (Object.prototype.toString.call(p) === '[object Array]' ? p : [])
      .map(function (q) {
        return { t: String((q && q.texto) || '').replace(/\s+/g, ' ').trim().slice(0, 80),
                 k: (q && q.tipo === 'sino') ? 'sino' : 'texto' };
      })
      .filter(function (q) { return q.t; }).slice(0, 3);
  }

  function firma(qs) { return JSON.stringify(qs); }

  function pintar() {
    var qs = cfg(), f = firma(qs);
    [].forEach.call(document.querySelectorAll('.rsvpform'), function (form, n) {
      var caja = form.querySelector('.rsvp-preg');
      if (!qs.length) { if (caja) caja.remove(); return; }
      if (caja && caja.getAttribute('data-f') === f) return;
      if (caja) caja.remove();
      caja = document.createElement('div');
      caja.className = 'rsvp-preg';
      caja.setAttribute('data-f', f);
      qs.forEach(function (q, i) {
        var lab = document.createElement('label');
        lab.textContent = q.t;
        caja.appendChild(lab);
        if (q.k === 'sino') {
          var fila = document.createElement('div');
          fila.className = 'rsvp-preg-sino';
          fila.style.cssText = 'display:flex;gap:18px;justify-content:flex-start;margin:2px 0 10px';
          ['Sí', 'No'].forEach(function (v) {
            var l = document.createElement('label');
            l.style.cssText = 'display:inline-flex;gap:6px;align-items:center;cursor:pointer;margin:0';
            var r = document.createElement('input');
            r.type = 'radio'; r.name = 'rpreg-' + n + '-' + i; r.value = v;
            r.style.cssText = 'width:auto;margin:0;accent-color:currentColor';
            l.appendChild(r); l.appendChild(document.createTextNode(v));
            fila.appendChild(l);
          });
          fila.setAttribute('data-q', String(i));
          caja.appendChild(fila);
        } else {
          var inp = document.createElement('input');
          inp.type = 'text'; inp.maxLength = 150;
          inp.setAttribute('data-q', String(i));
          caja.appendChild(inp);
        }
      });
      var botones = form.querySelector('.acc-r');
      if (botones) form.insertBefore(caja, botones); else form.appendChild(caja);
    });
  }

  /* las respuestas del formulario que el invitado está viendo */
  function respuestas() {
    var qs = cfg(); if (!qs.length) return '';
    var forms = [].filter.call(document.querySelectorAll('.rsvpform'), function (f) { return f.offsetParent !== null; });
    var form = forms[0] || document.querySelector('.rsvpform');
    if (!form) return '';
    var caja = form.querySelector('.rsvp-preg'); if (!caja) return '';
    var pares = [];
    qs.forEach(function (q, i) {
      var v = '';
      var nodo = caja.querySelector('[data-q="' + i + '"]');
      if (!nodo) return;
      if (q.k === 'sino') { var r = nodo.querySelector('input:checked'); v = r ? r.value : ''; }
      else v = String(nodo.value || '').replace(/\s+/g, ' ').trim();
      if (v) pares.push([q.t, v.slice(0, 150)]);
    });
    if (!pares.length) return '';
    var s = JSON.stringify(pares), corte = 150;
    while (s.length > 600 && corte > 20) {
      corte -= 30;
      s = JSON.stringify(pares.map(function (p) { return [p[0].slice(0, 60), p[1].slice(0, corte)]; }));
    }
    return s.slice(0, 600);
  }

  var enCurso = false;
  function guardarAparte(slug, token, texto) {
    var I = window.INV;
    if (!texto || !slug || !token || !I) return;
    try {
      if (typeof I.saveRSVPExtras === 'function') {
        I.saveRSVPExtras(slug, token, texto)['catch'](function (e) { console.warn('rsvpExtras:', e && e.message); });
        return;
      }
      /* firebase-inv.js viejo en caché: se escribe directo con la misma base */
      if (!I.db || typeof I.gid !== 'function') return;
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(function (m) {
        return m.updateDoc(m.doc(I.db, 'inv_invitados', I.gid(slug, token)), { rsvpExtras: texto });
      })['catch'](function (e) { console.warn('rsvpExtras:', e && e.message); });
    } catch (e) {}
  }

  function envolver() {
    var I = window.INV;
    if (!I || typeof I.saveRSVP !== 'function' || I.saveRSVP.__conPreguntas) return;
    var original = I.saveRSVP;
    var envuelto = function (slug, token) {
      if (enCurso) return original.apply(this, arguments);
      enCurso = true;
      var texto = '';
      try { texto = respuestas(); } catch (e) {}
      var p;
      try { p = original.apply(this, arguments); }
      finally { enCurso = false; }
      if (texto) {
        Promise.resolve(p).then(function () { guardarAparte(slug, token, texto); }, function () {});
      }
      return p;
    };
    envuelto.__conPreguntas = true;
    /* la marca de rsvp-extras.js pasa de largo: si no, se volvería a envolver cada medio segundo */
    if (original.__conRestriccion) envuelto.__conRestriccion = true;
    I.saveRSVP = envuelto;
  }

  function poner() {
    try { pintar(); } catch (e) {}
    try { envolver(); } catch (e) {}
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    poner();
    addEventListener('message', function () { setTimeout(poner, 140); });
    var n = 0, t = setInterval(function () {
      poner();
      if (++n > 40) { clearInterval(t); setInterval(poner, 2500); }
    }, 500);
  }
  arrancar();
})();
