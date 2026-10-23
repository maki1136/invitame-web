/* ===== MODO DIAGNÓSTICO DE TOQUES — SÓLO CON &diag=1 (22/10/2026) =============
   Para mirar desde un iPhone real por qué un botón no responde.
   Recuadro fijo abajo (pointer-events:none, encima de todo) con:
     · los últimos 6 toques: coordenadas, el elemento bajo el dedo en touchstart
       (etiqueta#id.clase), si después llegaron touchend y click a ESE elemento
       (sí/no) y si alguien hizo preventDefault en el click;
     · una línea de estado: #env (clase, display, visibility, pointer-events),
       los <video> de la página (position / z-index / visibility) y si html
       tiene la clase aparato-liviano.
   Los oyentes van en `window`, fase de captura: corren ANTES que cualquier
   stopPropagation de los módulos (el sobre escucha en document, captura).
   Sin &diag=1 este archivo no hace nada.
   ============================================================================ */
(function () {
  'use strict';
  if (!/[?&]diag=1(&|$)/.test(location.search)) return;
  if (window.__invDiag) return; window.__invDiag = 1;

  var toques = [], caja = null;
  function nom(el) {
    if (!el || !el.tagName) return String(el);
    var c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c ? '.' + c : '');
  }
  function mismo(a, b) { return !!(a && b && (a === b || a.contains(b) || b.contains(a))); }
  function si(v) { return v ? 'sí' : 'no'; }

  function estado() {
    var env = document.getElementById('env'), s = '';
    if (env) {
      var cs = getComputedStyle(env);
      s += 'env[' + (env.className || '-').replace(/\s+/g, ' ').slice(-40) + '] d:' + cs.display + ' v:' + cs.visibility + ' pe:' + cs.pointerEvents;
    } else s += 'env: no existe';
    var vs = [].slice.call(document.querySelectorAll('video'));
    s += ' | videos ' + vs.length + ': ' + vs.map(function (v) {
      var c = getComputedStyle(v);
      return (v.id || (v.parentNode && v.parentNode.id) || 'v') + '(' + c.position + ',z' + c.zIndex + ',' + c.visibility + (c.display === 'none' ? ',none' : '') + ')';
    }).join(' ');
    s += ' | liviano:' + si(document.documentElement.classList.contains('aparato-liviano'));
    return s;
  }
  function pintar() {
    if (!document.body) return;
    if (!caja) {
      caja = document.createElement('div');
      caja.id = 'inv-diag';
      caja.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;pointer-events:none;' +
        'background:rgba(0,0,0,.8);color:#fff;font:11px/1.35 ui-monospace,Menlo,monospace;padding:6px 8px calc(6px + env(safe-area-inset-bottom));' +
        'white-space:pre-wrap;word-break:break-all;max-height:45vh;overflow:hidden';
      document.body.appendChild(caja);
    }
    caja.textContent = toques.map(function (t, i) {
      return (toques.length - i) + ') ' + t.x + ',' + t.y + ' ' + t.el +
        ' | end:' + t.end + ' click:' + t.click + (t.click === 'sí' ? ' prevent:' + t.prev : '') +
        (t.clickEn && t.click !== 'sí' ? ' (click fue a ' + t.clickEn + ')' : '');
    }).join('\n') + '\n— ' + estado();
  }

  var actual = null;
  window.addEventListener('touchstart', function (e) {
    var p = e.touches && e.touches[0]; if (!p) return;
    var el = document.elementFromPoint(p.clientX, p.clientY);
    actual = { x: Math.round(p.clientX), y: Math.round(p.clientY), nodo: el, el: nom(el), end: 'no', click: 'no', prev: '-', clickEn: '' };
    toques.unshift(actual); if (toques.length > 6) toques.length = 6;
    pintar();
  }, { capture: true, passive: true });
  window.addEventListener('touchend', function (e) {
    if (!actual) return;
    if (mismo(actual.nodo, e.target)) actual.end = 'sí';
    pintar();
  }, { capture: true, passive: true });
  window.addEventListener('click', function (e) {
    var t = actual;
    if (!t) {   /* click sin touchstart (mouse) */
      t = { x: Math.round(e.clientX), y: Math.round(e.clientY), nodo: e.target, el: nom(e.target), end: '-', click: 'no', prev: '-', clickEn: '' };
      toques.unshift(t); if (toques.length > 6) toques.length = 6;
    }
    if (mismo(t.nodo, e.target)) t.click = 'sí'; else t.clickEn = nom(e.target);
    /* el preventDefault de los demás se ve recién cuando todos corrieron */
    setTimeout(function () { t.prev = si(e.defaultPrevented); pintar(); }, 0);
    actual = null;
    pintar();
  }, true);

  function arrancar() { pintar(); setInterval(pintar, 1000); }
  if (document.body) arrancar(); else document.addEventListener('DOMContentLoaded', arrancar);
})();
