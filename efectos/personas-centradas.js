/* ===== PERSONAS: SIEMPRE CENTRADAS, Y SI SON MUCHAS, UNA DEBAJO DE LA OTRA =====
   (22/10/2026) Jazmín, Citlalli: con DOS parejas de padres quedaban corridas a
   la izquierda — la grilla tiene 3 columnas fijas y la tercera quedaba vacía.
   «Que las personas siempre aparezcan centradas y si son muchas colocarlas una
   debajo de la otra.»

   · 1 a 3 → en una fila, centradas (la regla de Maki: las tres juntas).
   · 4 o más → una debajo de la otra, centradas.
   Pasa a flex (gana a la grilla de cualquier colección). Corre en la miniatura.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPersonasCentro) return; window.__invPersonasCentro = 1;
  if (!/\/i\//.test(location.pathname)) return;

  var css =
    'html body .padres{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;grid-template-columns:none!important}' +
    'html body .padres>.p{flex:0 0 calc((100% - 20px)/3)!important;max-width:calc((100% - 20px)/3)!important;min-width:0!important}' +
    'html body .padres[data-muchas]>.p{flex:0 0 100%!important;max-width:100%!important}';

  function aplicar() {
    if (!document.getElementById('inv-personas-centro')) {
      var st = document.createElement('style'); st.id = 'inv-personas-centro'; st.textContent = css;
      (document.head || document.documentElement).appendChild(st);
    }
    [].forEach.call(document.querySelectorAll('.padres'), function (p) {
      var n = [].filter.call(p.children, function (c) { return c.classList.contains('p') && getComputedStyle(c).display !== 'none'; }).length;
      if (n >= 4) p.setAttribute('data-muchas', ''); else p.removeAttribute('data-muchas');
    });
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
  window.addEventListener('message', function () { setTimeout(aplicar, 120); setTimeout(aplicar, 700); });
})();
