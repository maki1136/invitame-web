/* ===== MESA DE REGALOS CON SÓLO LA FRASE (23/10/2026) =========================
   Jazmín, en regina: «le puse el título, la frase, elegí un regalito de icono
   pero no aparece». El motor esconde la sección si no hay ningún link de tienda
   NI datos de transferencia. Pero en México es muy común «la lluvia de sobres»:
   sólo la frase, sin links. Si hay frase (o adorno) cargada, la sección se ve.
   · Si está marcada en «Secciones que no van», sigue escondida (eso lo hace
     secciones-ocultas.js con su propia hoja, que gana).
   · Vive en /efectos/ para que valga en todas las versiones del motor.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRegalosFrase) return; window.__invRegalosFrase = 1;
  function hayAlgo(ev) {
    var f = String(ev['c_frase-para-seccion-regalos-mesa'] || '').trim();
    var a = String(ev['img_c_imagen-decorativa-sobre-o-regalo'] || ev['c_imagen-decorativa-sobre-o-regalo'] || '').trim();
    var d = ev.fx && ev.fx.regalo && ev.fx.regalo.dibujo;
    return !!(f || a || d);
  }
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var rs = document.querySelector('[data-sec="regalos"]'); if (!rs) return;
    var oc = (ev.fx && Array.isArray(ev.fx.ocultas)) ? ev.fx.ocultas : [];
    if (oc.indexOf('regalos') > -1) return;
    if (rs.style.display === 'none' && hayAlgo(ev)) { rs.style.display = ''; rs.setAttribute('data-solo-frase', '1'); }
    else if (rs.getAttribute('data-solo-frase') && !hayAlgo(ev)) { rs.style.display = 'none'; rs.removeAttribute('data-solo-frase'); }
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 120); });
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 30) clearInterval(t); }, 500);
  }
  arrancar();
})();
