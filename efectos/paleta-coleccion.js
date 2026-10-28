/* ===== LA PALETA TAMBIÉN PINTA LA COLECCIÓN (28/10/2026) =====================
   Maki: «debería tener una paleta de colores como todo y listo».
   Jazmín (una novia): «Marfil con azul cielo, azul petróleo y dorado».

   Hasta hoy las colecciones (Marfil, Óleo, Degradé, Cantera, Sapo, Disco…)
   traían sus colores clavados y la paleta se apagaba con un aviso. Ahora, con
   «Pintar también la colección» (EFECTOS → La paleta de la invitación), la
   paleta elegida manda también sobre la colección, en CUALQUIER colección.

   CÓMO LO HACE, SIN TOCAR NINGUNA COLECCIÓN
   Cada colección publica sus colores en window.INVCOLPALETA ('--verde',
   '--lino', '--oro', …). Con eso sabemos cuál es su tinta, su papel y su
   metal. Entonces:
     1. /efectos/paleta.js deja de respetar INVCOLPALETA (pinta las variables).
     2. Este módulo toma la hoja de estilos de la colección, y cada color que
        aparece escrito ahí (#hex, rgb, rgba) lo lleva al color de la paleta
        que cumple su mismo papel, conservando la diferencia de luz y tono
        (un papel un poco más claro sigue siendo un poco más claro).
     3. La hoja original queda apagada (sheet.disabled) y se pone la copia
        recoloreada justo después: mismo orden, mismas reglas.
   Blanco y negro puros no se tocan (el QR, las sombras). Las fotos y texturas
   no se pueden recolorear: para eso está «El fondo de la invitación».

   EL DATO — fx.paleta.coleccion: true
   Corre en la invitación y en la miniatura del panel.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPaletaCol) return; window.__invPaletaCol = 1;

  var ROL = { '--verde': 'verde', '--sec-col-v': 'verde', '--verde2': 'verde2', '--sage': 'sage', '--sage-cl': 'sageCl',
    '--oro': 'oro', '--lino': 'lino', '--lino2': 'lino2', '--cream': 'cream', '--sec-col': 'cream', '--muted': 'muted',
    '--seal-c': 'seal', '--tinta': 'verde', '--tinta2': 'muted', '--papel': 'lino', '--acento': 'oro', '--acento2': 'sage' };

  function ev() { return window.INVEV || null; }
  function cfg() { var e = ev(); return (e && e.fx && e.fx.paleta) || {}; }
  function paleta() {
    var c = cfg(); if (c.coleccion !== true || !c.id) return null;
    var L = window.INVPALETAS || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === c.id) return L[i];
    return null;
  }
  window.INVPALETA_MANDA = function () { return !!paleta(); };   /* lo pregunta paleta.js */

  /* ---- color ---- */
  function hex2rgb(h) {
    h = h.replace('#', ''); if (h.length === 3 || h.length === 4) h = h.replace(/(.)/g, '$1$1');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function delin(c) { c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; return Math.max(0, Math.min(255, Math.round(c * 255))); }
  function lab(rgb) {   /* OKLab */
    var r = lin(rgb[0]), g = lin(rgb[1]), b = lin(rgb[2]);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  }
  function rgbDe(L) {
    var l = Math.pow(L[0] + 0.3963377774 * L[1] + 0.2158037573 * L[2], 3);
    var m = Math.pow(L[0] - 0.1055613458 * L[1] - 0.0638541728 * L[2], 3);
    var s = Math.pow(L[0] - 0.0894841775 * L[1] - 1.2914855480 * L[2], 3);
    return [delin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), delin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), delin(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)];
  }
  function dist(a, b) { return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2])); }

  /* las parejas (color de la colección → color de la paleta) */
  function armarPares(pal) {
    var col = window.INVCOLPALETA, pares = [];
    if (!col || typeof col !== 'object') return pares;
    for (var k in col) {
      if (!Object.prototype.hasOwnProperty.call(col, k)) continue;
      var r = ROL[k], v = String(col[k] || '').trim();
      if (!r || !pal[r] || !/^#[0-9a-f]{3,8}$/i.test(v)) continue;
      pares.push({ de: lab(hex2rgb(v)), a: lab(hex2rgb(pal[r])) });
    }
    return pares;
  }
  function mover(rgb, pares) {
    if (!pares.length) return null;
    var c = lab(rgb), best = null, bd = 9;
    for (var i = 0; i < pares.length; i++) { var d = dist(c, pares[i].de); if (d < bd) { bd = d; best = pares[i]; } }
    if (!best || bd > 0.28) return null;    /* un color que no se parece a nada de la colección, se deja */
    /* ⚠️ LA LUZ ES DE LA COLECCIÓN, EL COLOR ES DE LA PALETA. Si se copiaba
       también la luz, en una colección oscura (Sapo, Disco) el papel oscuro
       pasaba al papel CLARO de la paleta y la letra clara quedaba sobre claro.
       Conservando la luz de cada color, el contraste del diseño no se toca. */
    return rgbDe([c[0], best.a[1] + (c[1] - best.de[1]) * 0.35, best.a[2] + (c[2] - best.de[2]) * 0.35]);
  }
  /* las variables que la colección reclama, ya pasadas a la paleta (las pinta paleta.js) */
  window.INVPALETA_COLECCION = function () {
    var pal = paleta(), col = window.INVCOLPALETA;
    if (!pal || !col || typeof col !== 'object') return null;
    var pares = armarPares(pal), o = {};
    for (var k in col) {
      if (!Object.prototype.hasOwnProperty.call(col, k) || k.indexOf('--') !== 0) continue;
      var v = String(col[k] || '').trim();
      if (!/^#[0-9a-f]{3,8}$/i.test(v)) { o[k] = v; continue; }
      var rgb = hex2rgb(v), n = esPuro(rgb) ? null : mover(rgb, pares);
      o[k] = n ? aHex(n) : v;
    }
    return o;
  };
  function esPuro(rgb) { var s = rgb[0] + rgb[1] + rgb[2]; return s === 0 || s === 765; }
  function aHex(rgb) { return '#' + rgb.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }

  function recolorear(css, pares) {
    css = css.replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, function (m, h) {
      var rgb = hex2rgb(m); if (esPuro(rgb)) return m;
      var n = mover(rgb, pares); if (!n) return m;
      var a = (h.length === 8) ? h.substr(6, 2) : (h.length === 4 ? h.charAt(3) + h.charAt(3) : '');
      return aHex(n) + a;
    });
    return css.replace(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*[\d.]+\s*)?\)/gi, function (m, r, g, b, a) {
      var rgb = [+r, +g, +b]; if (esPuro(rgb)) return m;
      var n = mover(rgb, pares); if (!n) return m;
      return a ? 'rgba(' + n.join(',') + a + ')' : 'rgb(' + n.join(',') + ')';
    });
  }

  /* las hojas de las colecciones */
  function hojas() {
    return [].filter.call(document.querySelectorAll('style'), function (s) {
      if (s.getAttribute('data-paleta-copia')) return false;
      var id = s.id || '';
      return /^col-(?!sobre|mvta|sobrecat)/.test(id) || /^inv-coleccion/.test(id);
    });
  }

  var firmaPal = '';
  function apagarTodo() {
    [].forEach.call(document.querySelectorAll('style[data-paleta-copia]'), function (c) { c.remove(); });
    hojas().forEach(function (s) { if (s.sheet && s.sheet.disabled) s.sheet.disabled = false; s.__palTxt = null; });
    document.documentElement.removeAttribute('data-paleta-coleccion');
  }
  function aplicar() {
    var pal = paleta();
    if (!pal) { if (document.documentElement.hasAttribute('data-paleta-coleccion')) apagarTodo(); firmaPal = ''; return; }
    var pares = armarPares(pal);
    if (!pares.length) return;                           /* la colección todavía no publicó sus colores */
    var firma = pal.id + '|' + JSON.stringify(window.INVCOLPALETA);
    var cambio = firma !== firmaPal; firmaPal = firma;
    document.documentElement.setAttribute('data-paleta-coleccion', pal.id);
    hojas().forEach(function (s) {
      var id = s.id || ('x' + Math.random()), copia = document.querySelector('style[data-paleta-copia="' + id + '"]');
      if (cambio || s.__palTxt !== s.textContent || !copia) {
        if (!copia) { copia = document.createElement('style'); copia.setAttribute('data-paleta-copia', id); }
        copia.textContent = recolorear(s.textContent, pares);
        s.__palTxt = s.textContent;
      }
      if (copia.previousElementSibling !== s) s.parentNode.insertBefore(copia, s.nextSibling);
      if (s.sheet && !s.sheet.disabled) s.sheet.disabled = true;
    });
  }

  var esPrevia = /[?&]preview=1/.test(location.search);
  function arrancar() {
    if (typeof D === 'object' && D && !window.INVEV) return;   /* en el panel no corre (corre en la miniatura) */
    aplicar();
    setInterval(aplicar, esPrevia ? 500 : 900);
    window.addEventListener('message', function () { setTimeout(aplicar, 80); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
