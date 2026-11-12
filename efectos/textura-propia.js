/* ===== TEXTURA DE FONDO PROPIA (12/11/2026) =================================
   Jazmín (xv-juliana): «en este sector [Cortes y textura de fondo] estaría bueno
   que podamos colocar alguna imagen nosotros, porque las texturas de fondo a
   veces quedan nada que ver con la invi».
   Panel → EFECTOS → «Subir mi propia textura» guarda fx.diseno.texturaUrl y pone
   textura = 'propia'. El motor sólo conoce sus cinco texturas, así que acá se
   escriben --sec-tex / --sec-tex-v con la imagen subida (se tiñe igual que las
   de fábrica, con el color de cada sección).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invTexturaPropia) return; window.__invTexturaPropia = 1;
  function aplicar() {
    var e = window.INVEV; if (!e || !e.fx || !e.fx.diseno) return;
    var d = e.fx.diseno, u = String(d.texturaUrl || '');
    if (d.textura !== 'propia' || !/^https:\/\/[^\s"'()<>]+$/.test(u)) return;
    var r = document.documentElement.style, v = "url('" + u + "')";
    if (r.getPropertyValue('--sec-tex') !== v) {
      r.setProperty('--sec-tex', v); r.setProperty('--sec-tex-v', v);
      if (!r.getPropertyValue('--sec-col')) r.setProperty('--sec-col', '#f3efe8');
      if (!r.getPropertyValue('--sec-col-v')) r.setProperty('--sec-col-v', e.color || '#2e433c');
    }
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 700); });
})();
