/* ===== INVITACIÓN EN DOS IDIOMAS (24/11/2026) ===================================
   Jazmín: «te pido esta muestra en dos idiomas, que aparezcan las dos
   traducciones: español e inglés».

   EL DATO — fx.bilingue = { on, trad }
     · on:   prendido / apagado.
     · trad: una traducción por renglón, así:
               Te esperamos => We look forward to seeing you
             (izquierda: el texto tal cual se ve en la invitación;
              derecha: cómo va en el otro idioma).
   QUÉ HACE: debajo de cada texto que está en la lista pone su traducción, más
   chica y en cursiva, con la misma letra y color. En los botones y rótulos
   cortos va al lado: «Confirmar asistencia / RSVP».
   PANEL: PRINCIPAL → «Invitación en dos idiomas». El botón «Traer los textos de
   la invitación» copia en la lista todos los textos que se ven, para completar
   sólo la derecha.
   ⚠️ Apagado NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invBilingue) return;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;

  function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clave(s) { return norm(s).toLowerCase(); }
  function cfg() { try { return ((window.INVEV || {}).fx || {}).bilingue || {}; } catch (e) { return {}; } }
  function on() { var c = cfg(); return c.on === true || c.on === 'true'; }

  var mapa = {}, crudo = null;
  function leerMapa() {
    var t = String(cfg().trad || '');
    if (t === crudo) return mapa;
    crudo = t; mapa = {};
    t.split(/\r?\n/).forEach(function (l) {
      var i = l.indexOf('=>'); if (i < 0) return;
      var a = norm(l.slice(0, i)), b = norm(l.slice(i + 2));
      if (a && b) mapa[clave(a)] = b;
    });
    return mapa;
  }

  var INLINE_OK = /^(BR|SPAN|B|I|EM|STRONG|SMALL|SUP|SUB|U)$/;
  function esHoja(el) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|OPTION|SVG|CANVAS|VIDEO|IFRAME)$/.test(el.nodeName)) return false;
    if (el.closest('.bi-en, #pr-compartir, #pr-corazon, #env, script, style')) return false;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      if (c.classList.contains('bi-en')) continue;
      if (!INLINE_OK.test(c.nodeName)) return false;
    }
    return true;
  }
  function textoPropio(el) {
    var t = '';
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 1 && n.classList.contains('bi-en')) return;
      t += n.nodeType === 3 ? n.nodeValue : (n.nodeName === 'BR' ? ' ' : n.textContent);
    });
    return norm(t);
  }
  function hojas() {
    var out = [];
    var raiz = document.querySelector('.frame') || document.body;
    [].forEach.call(raiz.querySelectorAll('*'), function (el) {
      if (!el.childNodes.length || !esHoja(el)) return;
      var t = textoPropio(el);
      if (t.length < 2 || !/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(t)) return;
      out.push([el, t]);
    });
    return out;
  }

  /* lo usa el panel para «Traer los textos de la invitación» */
  window.__invBilingue = {
    textos: function () {
      var vistos = {}, lista = [];
      hojas().forEach(function (h) {
        var el = h[0], t = h[1];
        if (!el.offsetWidth && !el.offsetHeight) return;
        if (vistos[clave(t)]) return; vistos[clave(t)] = 1; lista.push(t);
      });
      return lista;
    }
  };

  function corto(el, t) {
    if (/^(A|BUTTON|LABEL)$/.test(el.nodeName) || el.closest('a, button, .btn')) return true;
    return t.length <= 22 && parseFloat(getComputedStyle(el).fontSize) < 14;
  }

  function aplicar() {
    var activo = on();
    if (!activo) {
      [].forEach.call(document.querySelectorAll('.bi-en'), function (s) { s.remove(); });
      return;
    }
    var m = leerMapa();
    hojas().forEach(function (h) {
      var el = h[0], t = h[1], en = m[clave(t)];
      var ya = el.querySelector(':scope > .bi-en');
      if (!en) { if (ya) ya.remove(); return; }
      if (ya && ya.getAttribute('data-t') === en) return;
      if (ya) ya.remove();
      var s = document.createElement('span');
      s.className = 'bi-en'; s.setAttribute('data-t', en);
      if (corto(el, t)) {
        s.textContent = ' / ' + en;
        s.style.cssText = 'opacity:.82';
      } else {
        s.textContent = en;
        s.style.cssText = 'display:block;font-size:.82em;font-style:italic;opacity:.85;margin-top:.35em;line-height:1.35';
      }
      el.appendChild(s);
    });
  }

  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 500);
  setInterval(aplicar, 2000);
  addEventListener('message', function () { setTimeout(aplicar, 200); setTimeout(aplicar, 900); });
})();
