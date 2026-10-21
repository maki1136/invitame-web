/* ===== LA FOTO QUE SE CARGA EN EL PANEL GANA (21/10/2026) =====================

   Pedido de Jazmín (Citlalli & Hedwin): «en los sectores de lugares coloqué dos
   fotos. En la plataforma están, pero en la invitación no».

   POR QUÉ: el motor (congelado) busca cada imagen probando primero la clave
   vieja `img_f-<campo>-` y recién después la del panel, `img_c_<campo>`. Las
   muestras viejas (Marfil y otras) traen las fotos de ejemplo en `img_f-…`, así
   que la foto que sube Jazmín (que el panel guarda en `img_c_…`) nunca ganaba:
   ni en la miniatura ni en la publicada.

   QUÉ HACE: vuelve a poner cada `[data-imgbg]` con el orden al revés —primero
   lo que guarda el panel (`img_c_`), después la clave vieja— y sólo si hay una
   del panel distinta de la que puso el motor. Corre también en la miniatura.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invImgPanel) return; window.__invImgPanel = 1;
  if (!/\/i\//.test(location.pathname)) return;

  function base(b) { return String(b).replace(/^img_[cf][_-]/, '').replace(/-+$/, ''); }
  function opt(u) { try { return typeof cldOpt === 'function' ? cldOpt(u, 'w_900,c_limit') : u; } catch (e) { return u; } }

  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    [].forEach.call(document.querySelectorAll('[data-imgbg]'), function (n) {
      var b = base(n.dataset.imgbg);
      var delPanel = ev['img_c_' + b] || ev['img_c_' + b + '-'];
      if (!delPanel) return;                       /* sin foto del panel: queda la del motor */
      var css = "url('" + opt(delPanel) + "')";
      if (n.getAttribute('data-img-panel') === delPanel && n.style.backgroundImage) return;
      n.style.backgroundImage = css;
      n.setAttribute('data-img-panel', delPanel);
    });
  }

  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 300);
  window.addEventListener('message', function () {
    [].forEach.call(document.querySelectorAll('[data-img-panel]'), function (x) { x.removeAttribute('data-img-panel'); });
    setTimeout(aplicar, 80); setTimeout(aplicar, 600);
  });
})();
