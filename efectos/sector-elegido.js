/* ===== LO QUE SE ELIGE EN EL PANEL PARA UNA SECCIÓN, MANDA (29/10/2026) ======
   Jazmín (clienta Diana, colección Óleo): «los fondos de Confirmación y Dónde y
   cuándo no se ven», «en Dress le puse un color y aparece otro».

   El motor pinta los fondos de cada sección con los campos del panel (color,
   imagen, color de letra), pero las colecciones pintan las mismas secciones
   con !important y les ganaban: se guardaba y no se veía.

   Ahora: cuando en el panel se ELIGE un color o se SUBE una imagen de fondo de
   una sección, el panel lo anota en fx.sectorElegido[clave] = true y este
   módulo lo aplica con prioridad sobre la colección.
   ⚠️ Sólo lo que se eligió a mano: los valores viejos que vinieron de copiar una
      muestra no se fuerzan (si no, cambiarían de golpe invitaciones ya armadas).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invSectorElegido) return; window.__invSectorElegido = 1;

  var SEC = {
    eventos:      { bg: 'c_color-de-fondo-donde-y-cuando', img: 'c_imagen-de-fondo-seccion-donde-y-cuando' },
    dresscode:    { bg: 'c_color-de-fondo-dresscode',      img: 'c_imagen-de-fondo-seccion-desscode', texto: 'c_vestimenta-color' },
    itinerario:   { bg: 'c_itinerario-color-de-fondo',     img: 'c_imagen-de-fondo-seccion-itinerario', texto: 'c_itinerario-color-de-texto' },
    hashtag:      { bg: 'c_fondo-seccion-instagram',       texto: 'c_color-logo-y-texto-seccion-instagram' },
    galeria:      { bg: 'c_color-de-fondo-galeria',        img: 'c_imagen-de-fondo-seccion-galeria' },
    padres:       { bg: 'c_fondo-color-personas',          img: 'c_imagen-de-fondo-seccion-personas', texto: 'c_color-para-la-seccion-personas' },
    regalos:      { bg: 'c_color-fondo-regalos',           img: 'c_imagen-de-fondo-seccion-regalos', texto: 'c_color-para-seccion-regalos-mesa' },
    confirmacion: { bg: 'c_color-fondo-confirmacion',      img: 'c_imagen-de-fondo-seccion-confirmacion' }
  };
  /* ★ y la posición de los nombres en la portada (Diana: «puse el nombre
     centrado y aparece abajo»: la colección clavaba la suya) */
  var POS = 'c_posicion-cuentra-regresiva-y-nombres';
  var POS_MAPA = { 'Arriba': 'flex-start', 'Centrado': 'center', 'Abajo': 'flex-end' };
  /* ★ 29/10 (Jazmín: «la transparencia en la barra está en 0 y sigue saliendo
     el recuadro, y tampoco está la opción de cambiarle el color»): los
     recuadros de Ceremonia/Recepción y de Personas, con color y transparencia
     elegidos en el panel, le ganan a la colección. */
  var RECU = {
    eventos: { alpha: 'c_transparencia-recuadros-de-texto',    color: 'c_color-de-los-recuadros-de-texto',    sel: '.evento' },
    padres:  { alpha: 'c_transparencia-recuadros-de-personas', color: 'c_color-de-los-recuadros-de-personas', sel: '.p' }
  };
  /* el panel pregunta qué claves anotar */
  window.INVSECTOR_CLAVES = (function () {
    var o = {};
    Object.keys(SEC).forEach(function (s) { ['bg', 'img', 'texto'].forEach(function (t) { var k = SEC[s][t]; if (k) { o[k] = 1; o['img_' + k] = 1; } }); });
    o[POS] = 1;
    Object.keys(RECU).forEach(function (s) { o[RECU[s].alpha] = 1; o[RECU[s].color] = 1; });
    return o;
  })();

  var ID_CSS = 'inv-sector-elegido';
  function ev() { return window.INVEV || null; }
  function v(e, k) { var x = e[k]; return (x === undefined || x === null || x === '') ? null : String(x); }
  function imgDe(e, k) { var a = v(e, 'img_' + k) || v(e, k); return a && /^https:\/\//.test(a) ? a : null; }
  function rgba(c, a) {
    var m = String(c || '').match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return 'rgba(255,255,255,' + a + ')';
    var h = m[1]; if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    return 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',' + a + ')';
  }

  var ultima = '';
  var enLinea = {};   /* sección → valor puesto en línea */
  function faltaEnLinea() {
    for (var s in enLinea) { var n = document.querySelector('[data-sec="' + s + '"]'); if (n && n.style.getPropertyPriority('background-image') !== 'important') return true; }
    return false;
  }
  function aplicar() {
    var e = ev(); if (!e) return;
    var el = (e.fx && e.fx.sectorElegido) || {};
    var css = [], firma = JSON.stringify(el), antes = enLinea; enLinea = {};
    Object.keys(SEC).forEach(function (s) {
      var c = SEC[s], S = 'html body [data-sec="' + s + '"][data-sec="' + s + '"]';
      var bg = el[c.bg] ? v(e, c.bg) : null;
      var im = c.img && (el[c.img] || el['img_' + c.img]) ? imgDe(e, c.img) : null;
      var tx = c.texto && el[c.texto] ? v(e, c.texto) : null;
      if (!bg && !im && !tx) return;
      firma += '|' + s + bg + im + tx;
      var regla = [];
      if (im) {
        var base = bg || '#ffffff', velo = rgba(base, 0.55);
        regla.push('background:linear-gradient(' + velo + ',' + velo + '),url("' + im.replace(/"/g, '') + '") center/cover no-repeat' + (bg ? ' ' + bg : '') + '!important');
      } else if (bg) {
        regla.push('background:' + bg + '!important');
      }
      if (regla.length) {
        css.push(S + '{' + regla.join(';') + '}');
        /* y EN LÍNEA con !important: le gana a cualquier hoja, por específica que sea */
        var nodo = document.querySelector('[data-sec="' + s + '"]');
        if (nodo) { var val = regla[0].replace(/^background:/, '').replace(/!important$/, ''); nodo.style.setProperty('background', val, 'important'); enLinea[s] = val; }
        /* los velos y pinturas de la colección (::before/::after) se apagan en esa sección */
        css.push(S + '::before,' + S + '::after{background:none!important;background-image:none!important;opacity:0!important}');
      }
      if (tx) css.push(S + ' :is(h2,h3,p,.kick,.d,.l,li,.t){color:' + tx + '!important;-webkit-text-fill-color:' + tx + '!important}');
    });
    /* los recuadros */
    Object.keys(RECU).forEach(function (s) {
      var r = RECU[s];
      var hayA = el[r.alpha] && v(e, r.alpha) !== null, hayC = el[r.color] && v(e, r.color);
      if (!hayA && !hayC) {
        [].forEach.call(document.querySelectorAll('[data-sec="' + s + '"] [data-recuadro-elegido]'), function (n) {
          ['background', 'box-shadow', 'border-color', 'backdrop-filter'].forEach(function (p) { n.style.removeProperty(p); });
          n.removeAttribute('data-recuadro-elegido');
        });
        return;
      }
      var a = hayA ? Math.max(0, Math.min(100, parseInt(v(e, r.alpha), 10) || 0)) / 100 : 1;
      var col = hayC ? v(e, r.color) : '#ffffff';
      firma += '|rec' + s + a + col;
      var R = 'html body [data-sec="' + s + '"][data-sec="' + s + '"] ' + r.sel + r.sel;
      css.push(R + '{background:' + rgba(col, a) + '!important;background-image:none!important;' +
        (a < 0.12 ? 'box-shadow:none!important;border-color:transparent!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;' : '') + '}');
      /* en línea con !important: hay colecciones que lo clavan con selectores muy específicos */
      [].forEach.call(document.querySelectorAll('[data-sec="' + s + '"] ' + r.sel), function (n) {
        n.style.setProperty('background', rgba(col, a), 'important');
        if (a < 0.12) { n.style.setProperty('box-shadow', 'none', 'important'); n.style.setProperty('border-color', 'transparent', 'important'); n.style.setProperty('backdrop-filter', 'none', 'important'); }
        else { n.style.removeProperty('box-shadow'); n.style.removeProperty('border-color'); }
        n.setAttribute('data-recuadro-elegido', '1');
      });
      css.push(R + '::before,' + R + '::after{background:none!important;background-image:none!important;' + (a < 0.12 ? 'border-color:transparent!important;box-shadow:none!important;' : '') + '}');
    });
    /* la posición de los nombres */
    var port = document.querySelector('.portada');
    if (el[POS] && POS_MAPA[v(e, POS) || ''] && port) {
      var jc = POS_MAPA[v(e, POS)];
      firma += '|pos' + jc;
      port.style.setProperty('justify-content', jc, 'important');
      css.push('html body .portada.portada > .c{margin-top:' + (jc === 'flex-start' ? '0' : 'auto') + '!important;margin-bottom:' + (jc === 'flex-end' ? '0' : 'auto') + '!important;top:auto!important;bottom:auto!important;transform:none!important}');
    }
    for (var sa in antes) if (!enLinea[sa]) { var na = document.querySelector('[data-sec="' + sa + '"]'); if (na) na.style.removeProperty('background'); }
    var ya = document.getElementById(ID_CSS);
    var faltaRecuadro = Object.keys(RECU).some(function (s) { return (el[RECU[s].alpha] || el[RECU[s].color]) && document.querySelector('[data-sec="' + s + '"] ' + RECU[s].sel + ':not([data-recuadro-elegido])'); });
    if (firma === ultima && ya && !faltaEnLinea() && !faltaRecuadro) {
      if (ya.parentNode && ya !== ya.parentNode.lastElementChild) ya.parentNode.appendChild(ya);   /* que siga último */
      return;
    }
    ultima = firma;
    var st = document.getElementById(ID_CSS);
    if (!css.length) { if (st) st.remove(); return; }
    if (!st) { st = document.createElement('style'); st.id = ID_CSS; }
    st.textContent = css.join('\n');
    (document.head || document.documentElement).appendChild(st);   /* siempre al final: le gana a las colecciones */
  }

  function arrancar() {
    if (typeof D === 'object' && D && !window.INVEV) return;   /* panel: corre en la miniatura */
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 700);
    window.addEventListener('message', function () { ultima = ''; setTimeout(aplicar, 100); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
