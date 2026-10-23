/* ===== EL SOBRE ENTERO EN EL CELULAR (23/10/2026) =============================
   citlalli-y-hedwin-jesus: «el sobre se debe mirar completo, no abarca toda la
   pantalla, así como me lo hicieron a mí yo no lo pedí así. El sobre se tiene
   que mirar completo y un fondo».
   Desde el 22/10 el sobre llena el celular de borde a borde (cover) y se recortan
   los costados. Con fx.sobre.completo = true (casilla del lacre, PRINCIPAL) se ve
   entero (contain) y alrededor queda el fondo de la invitación (fx.fondo), o la
   foto de portada si no hay fondo cargado.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invSobreCompleto) return; window.__invSobreCompleto = 1;
  var ID = 'inv-sobre-completo';
  function fondo(ev) {
    var f = (ev.fx && ev.fx.fondo) || {};
    var u = (f.tipo === 'imagen' ? (f.url || f.poster) : (f.poster || '')) || ev.cover || '';
    return /^https?:\/\//i.test(u) ? u : '';
  }
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var on = !!(ev.fx && ev.fx.sobre && ev.fx.sobre.completo);
    document.documentElement.classList.toggle('inv-sobre-completo', on);
    var st = document.getElementById(ID);
    if (!on) { if (st) st.textContent = ''; return; }
    if (!st) { st = document.createElement('style'); st.id = ID; document.head.appendChild(st); }
    var u = fondo(ev);
    var css = '@media (max-width:679px){' +
      'html.inv-sobre-completo #env #env-vid, html.inv-sobre-completo #env.carta-video #env-vid{object-fit:contain!important;background:transparent!important}' +
      'html.inv-sobre-completo #env .env-poster{background-size:contain!important}' +
      (u ? 'html.inv-sobre-completo #env{background:url("' + u.replace(/"/g, '') + '") center/cover no-repeat!important}' : '') +
      '}';
    if (st.textContent !== css) st.textContent = css;
  }
  aplicar();
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 250);
  addEventListener('message', function () { setTimeout(aplicar, 120); });
})();
