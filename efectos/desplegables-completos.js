/* ===== LOS DESPLEGABLES SE ABREN ENTEROS (24/11/2026) ==========================
   Jazmín, César & Helene: «el desplegado de hoteles no se ve completo, se corta,
   deben ser 4». El motor abre los desplegables (.acc-panel: hoteles, inspiración
   de la vestimenta) con un tope fijo de 560 px; con cuatro hoteles y un texto
   largo, lo de abajo quedaba cortado.
   Ahora, al abrirse, el tope pasa a ser la altura real del contenido (y se
   vuelve a medir si cambia, por ejemplo al cargar las fotos). Cerrado, igual
   que siempre.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invDesplegables) return; window.__invDesplegables = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;

  function medir() {
    [].forEach.call(document.querySelectorAll('.acc-panel'), function (p) {
      if (p.classList.contains('open')) {
        var h = p.scrollHeight + 24;
        if (h > 560 && p.style.maxHeight !== h + 'px') p.style.setProperty('max-height', h + 'px', 'important');
      } else if (p.style.maxHeight) {
        p.style.removeProperty('max-height');
      }
    });
  }
  document.addEventListener('click', function () { setTimeout(medir, 60); setTimeout(medir, 600); setTimeout(medir, 1500); }, true);
  setInterval(medir, 1500);
})();
