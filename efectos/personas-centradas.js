/* ===== PERSONAS: SIEMPRE CENTRADAS, Y SI SON MUCHAS, UNA DEBAJO DE LA OTRA =====
   (22/10/2026) Jazmín, Citlalli: con DOS parejas de padres quedaban corridas a
   la izquierda — la grilla tiene 3 columnas fijas y la tercera quedaba vacía.
   «Que las personas siempre aparezcan centradas y si son muchas colocarlas una
   debajo de la otra.»

   · 1 a 3 → en una fila, centradas (la regla de Maki: las tres juntas).
   · 4 o más → una debajo de la otra, centradas.
   Corre en la miniatura.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPersonasCentro) return; window.__invPersonasCentro = 1;
  if (!/\/i\//.test(location.pathname)) return;

  /* NO se cambia la grilla de cada colección (se probó pasar a flex y rompía:
     nombres de a una palabra por renglón, tres que se partían en 2+1). Se toma
     el ancho de columna que ya puso la colección y sólo se ajusta CUÁNTAS
     columnas hay: tantas como personas (hasta las que ya tenía), centradas. */
  function aplicar() {
    [].forEach.call(document.querySelectorAll('.padres'), function (p) {
      var kids = [].filter.call(p.children, function (c) { return c.classList.contains('p') && getComputedStyle(c).display !== 'none'; });
      var n = kids.length; if (!n) return;
      if (!p.hasAttribute('data-cols-orig')) {
        var cs = getComputedStyle(p);
        if (cs.display !== 'grid') return;
        var cols = cs.gridTemplateColumns.split(' ').filter(function (x) { return /px$/.test(x); });
        if (!cols.length) return;
        p.setAttribute('data-cols-orig', cols.length + '|' + cols[0]);
      }
      var o = p.getAttribute('data-cols-orig').split('|'), max = +o[0], w = o[1];
      var firma = n + '|' + max;
      if (p.getAttribute('data-centro') === firma) return;
      p.setAttribute('data-centro', firma);
      p.style.setProperty('justify-content', 'center', 'important');
      if (n >= 4) {
        /* muchas: una debajo de la otra */
        p.style.setProperty('grid-template-columns', 'minmax(0, 280px)', 'important');
        kids.forEach(function (k) { k.style.setProperty('text-align', 'center', 'important'); });
      } else if (n < max) {
        p.style.setProperty('grid-template-columns', 'repeat(' + n + ', ' + w + ')', 'important');
      } else {
        p.style.removeProperty('grid-template-columns');
      }
    });
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
  window.addEventListener('message', function () {
    [].forEach.call(document.querySelectorAll('.padres[data-centro]'), function (p) { p.removeAttribute('data-centro'); });
    setTimeout(aplicar, 120); setTimeout(aplicar, 700);
  });
})();
