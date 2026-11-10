/* ===== PORTADA A COLOR AUNQUE LA COLECCIÓN LA PONGA EN BLANCO Y NEGRO (10/11) =
   Jazmín (jakzirhy-y-alexis, colección Perlas): «la portada en blanco y negro
   y no encuentran dónde modificarlo». Perlas aplica grayscale a la foto y al
   video de portada. Con `fx.portadaFoto.color === true` (casilla del panel,
   PRINCIPAL → «Portada · color de la foto») se ve a color.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPortadaColor) return; window.__invPortadaColor = 1;
  var st = document.createElement('style'); st.id = 'portada-color';
  st.textContent = 'html[data-portada-color] .portada .pbg,html[data-portada-color] .portada .cover-vid{filter:none!important}';
  (document.head || document.documentElement).appendChild(st);
  function aplicar() {
    var e = window.INVEV; if (!e) return;
    var on = !!(e.fx && e.fx.portadaFoto && e.fx.portadaFoto.color === true);
    var h = document.documentElement;
    if (on) h.setAttribute('data-portada-color', ''); else h.removeAttribute('data-portada-color');
  }
  function arrancar() {
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 30) clearInterval(t); }, 400);
    addEventListener('message', function () { setTimeout(aplicar, 120); setTimeout(aplicar, 600); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
