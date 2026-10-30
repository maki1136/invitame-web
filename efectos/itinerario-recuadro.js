/* ===== EL RECUADRO Y LA LETRA DEL TÍTULO DEL ITINERARIO, DESDE EL PANEL (30/10/2026)
   Jazmín: «Las tipografías del título y el cuadro blanco del itinerario no se
   pueden cambiar».

   LUGAR_VEST, debajo de «Itinerario color de texto:»:
     · «Itinerario tipografía del título:»        → c_itinerario-tipografia-titulo
     · «Itinerario color del recuadro:»            → c_itinerario-color-recuadro
     · «Itinerario transparencia del recuadro:»    → c_itinerario-transparencia-recuadro (0–100, 0 = sin recuadro)
   La letra del textito de arriba («El gran día») es la de PRINCIPAL →
   «Tipografía de los subtítulos».

   Son claves NUEVAS: una invitación que no las tiene no cambia nada.
   ⚠️ No se tocan ::before/::after de .tl: ahí vive la línea del itinerario.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invItinRecuadro) return; window.__invItinRecuadro = 1;
  var ID = 'inv-itin-recuadro', ultima = null;
  function v(e, k) { var x = e && e[k]; return (x === undefined || x === null || x === '') ? null : String(x); }
  function rgba(c, a) {
    var m = String(c || '').match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return 'rgba(255,255,255,' + a + ')';
    var h = m[1]; if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    return 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',' + a + ')';
  }
  function aplicar() {
    var e = window.INVEV; if (!e) return;
    var f = v(e, 'c_itinerario-tipografia-titulo'), col = v(e, 'c_itinerario-color-recuadro'), al = v(e, 'c_itinerario-transparencia-recuadro');
    if (f && !/^[\w\s'",\-]+$/.test(f)) f = null;
    var firma = [f, col, al].join('|');
    var st = document.getElementById(ID);
    if (firma === ultima && (!st || st === st.parentNode.lastElementChild)) return;
    ultima = firma;
    var css = [], S = 'html body [data-sec="itinerario"][data-sec="itinerario"]';
    if (f) css.push(S + ' h2, ' + S + ' .h2{font-family:' + f + '!important}');
    if (col || al !== null) {
      var a = al !== null ? Math.max(0, Math.min(100, parseInt(al, 10) || 0)) / 100 : 1;
      var fondo = rgba(col || '#ffffff', a);
      css.push(S + ' .tl.tl{background:' + fondo + '!important;background-image:none!important;' +
        (a < 0.12 ? 'box-shadow:none!important;border-color:transparent!important;outline-color:transparent!important;' : '') + '}');
      [].forEach.call(document.querySelectorAll('[data-sec="itinerario"] .tl'), function (n) {
        n.style.setProperty('background', fondo, 'important');
        if (a < 0.12) { n.style.setProperty('box-shadow', 'none', 'important'); n.style.setProperty('border-color', 'transparent', 'important'); n.style.setProperty('outline-color', 'transparent', 'important'); }
      });
    }
    if (!css.length) { if (st) st.remove(); return; }
    if (!st) { st = document.createElement('style'); st.id = ID; }
    st.textContent = css.join('\n');
    (document.head || document.documentElement).appendChild(st);
  }
  function arrancar() {
    if (typeof D === 'object' && D && !window.INVEV) return;   /* panel: corre en la miniatura */
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 700);
    window.addEventListener('message', function () { ultima = null; setTimeout(aplicar, 120); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
