/* ===== EL HASHTAG ENTRA EN LA PANTALLA (27/10/2026) ============================
   Muestra renata-y-patricio: «#RenataYPatricio2027» es una sola palabra larga y
   con la letra grande del molde se salía por el borde y quedaba cortado.
   Si no entra en el ancho, se achica la letra hasta que entre (mínimo 18 px).
   Para todas las invitaciones: cualquier hashtag largo se ajusta solo.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invHashtagAjuste) return; window.__invHashtagAjuste = 1;
  function ajustar() {
    var e = document.getElementById('hashtag-big');
    if (!e || !e.offsetParent) return;
    e.style.maxWidth = '100%';
    e.style.whiteSpace = 'nowrap';
    if (!e.dataset.fzBase) {
      var b = parseFloat(getComputedStyle(e).fontSize);   /* ⚠️ el molde lo trae inline: no borrarlo */
      if (!b) return;
      e.dataset.fzBase = b;
    }
    var base = parseFloat(e.dataset.fzBase), fz = base;
    e.style.setProperty('font-size', fz + 'px', 'important');
    var caja = e.clientWidth;
    if (!caja) return;
    var n = 0;
    while (e.scrollWidth > caja + 1 && fz > 18 && n++ < 40) {
      fz -= 1;
      e.style.setProperty('font-size', fz + 'px', 'important');
    }
    if (e.scrollWidth > caja + 1) { e.style.whiteSpace = 'normal'; e.style.overflowWrap = 'anywhere'; }
  }
  var k = 0, t = setInterval(function () { ajustar(); if (++k > 40) clearInterval(t); }, 500);
  addEventListener('resize', function () { setTimeout(ajustar, 120); });
  addEventListener('message', function () { setTimeout(ajustar, 200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
})();
