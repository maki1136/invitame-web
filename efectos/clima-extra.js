/* ===== CLIMA: EL LUGAR DE LA FIESTA, SU NOMBRE Y UN BOTÓN AL PRONÓSTICO (20/11/2026)
   César y Helene (guía de los novios, 11-01 a 11-03): el clima tiene que ser el de
   Gl. Avernæs (Ebberup), no el de la iglesia; «mostrar datos históricos claramente
   identificados hasta que exista pronóstico» y «añadir botón al pronóstico local de Yr».

   EL DATO — fx.estiloSec.clima = { lugar, coords, link, boton }
     · coords: «lat, lon». Con coordenadas, el motor vuelve a buscar el clima ahí
       (con su misma función _clima: histórico del año anterior o pronóstico si faltan
       ≤ 15 días, y su misma leyenda que lo aclara).
     · lugar: el nombre que se muestra debajo de la temperatura.
     · link + boton: un botón debajo de la tarjeta. Sin link no hay botón.
   PANEL: LUGAR_VEST → «Clima · diseño» (panel-estilo-secciones.js).
   ⚠️ Con todo vacío NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invClimaExtra) return; window.__invClimaExtra = 1;
  if (!/^\/i\//.test(location.pathname)) return;

  function cfg() { try { return (((window.INVEV || {}).fx || {}).estiloSec || {}).clima || {}; } catch (e) { return {}; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function urlOk(u) { u = String(u || '').trim(); if (/^www\./i.test(u)) u = 'https://' + u; return /^https?:\/\//i.test(u) ? u : ''; }
  function coordsOk(c) { var m = String(c || '').match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/); return m ? m[1] + ',' + m[2] : ''; }

  var pedidas = '';
  function aplicar() {
    var ev = window.INVEV, sec = document.getElementById('clima-sec');
    if (!ev || !sec) return;
    var c = cfg();

    /* 1 · el clima de otras coordenadas: se le pide al motor UNA vez por cambio */
    var cc = coordsOk(c.coords);
    if (cc && cc !== pedidas && typeof window._clima === 'function') {
      pedidas = cc;
      var copia = {}; for (var k in ev) copia[k] = ev[k];
      copia.ev1maps = cc; copia.ev2maps = '';
      try { window._clima(copia); } catch (e) {}
      /* el motor pide el suyo (el de la iglesia) al arrancar: si llega después, se vuelve a pedir el nuestro */
      setTimeout(function () { try { window._clima(copia); } catch (e) {} }, 4000);
    }

    /* 2 · el nombre del lugar, debajo de la descripción */
    var card = sec.querySelector('.clima-card');
    var lugar = String(c.lugar || '').trim(), el = document.getElementById('clima-lugar');
    if (lugar && card) {
      if (!el) {
        el = document.createElement('div'); el.id = 'clima-lugar';
        el.style.cssText = 'font-size:15px;margin-top:4px;letter-spacing:.02em';
        var desc = document.getElementById('clima-desc');
        if (desc && desc.parentNode === card) card.insertBefore(el, desc.nextSibling); else card.appendChild(el);
      }
      if (el.textContent !== lugar) el.textContent = lugar;
    } else if (el) el.remove();

    /* 3 · el botón al pronóstico */
    var u = urlOk(c.link), b = document.getElementById('clima-btn');
    if (u) {
      var txt = String(c.boton || '').trim() || 'Ver pronóstico';
      if (!b) {
        b = document.createElement('a'); b.id = 'clima-btn'; b.className = 'btn';
        b.target = '_blank'; b.rel = 'noopener';
        b.style.cssText = 'display:inline-block;margin-top:16px';
        var cont = card && card.parentNode === sec ? card : sec;
        cont.appendChild(b);
      }
      if (b.getAttribute('href') !== u) b.setAttribute('href', u);
      var html = esc(txt) + ' ↗';
      if (b.innerHTML !== html) b.innerHTML = html;
    } else if (b) b.remove();
  }

  var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 500);
  addEventListener('message', function () { pedidas = ''; setTimeout(aplicar, 200); });
})();
