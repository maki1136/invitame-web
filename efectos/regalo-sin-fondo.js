/* ===== EL REGALO SIN EL CUADRADO BLANCO (21/10/2026) ==========================

   Pedido de Jazmín (Noche estrellada): «¿esto qué es, cómo va a aparecer el
   regalo con el fondo ese blanco?». La imagen de arriba de «Mesa de regalos»
   (`img_c_imagen-decorativa-sobre-o-regalo`, `#reg-adorno`) a veces es un JPG
   con fondo blanco liso, y sobre un fondo de diseño se ve como un recorte.

   QUÉ HACE: si los bordes de la imagen son blancos (o casi), le quita ese
   blanco desde los bordes hacia adentro (sólo lo que toca el borde: el blanco
   del moño queda) y suaviza el corte. Lo hace en el navegador, sobre una copia;
   no cambia el archivo ni el dato. Si la imagen ya tiene transparencia, o los
   bordes no son blancos, no toca nada.
   ⚠️ `mix-blend-mode` no sirve acá: los `.reveal` crean su propio contexto y el
      blanco no se mezcla con el fondo de la sección.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRegaloSinFondo) return; window.__invRegaloSinFondo = 1;
  if (!/\/i\//.test(location.pathname)) return;

  var hecho = {};

  function limpiar(img) {
    var src = img.currentSrc || img.src;
    if (!src || /^data:/.test(src) || hecho[src] === 'enCurso') return;
    if (img.getAttribute('data-sin-fondo') === src) return;
    hecho[src] = 'enCurso';
    var im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () {
      try {
        var W = im.naturalWidth, H = im.naturalHeight;
        var esc = Math.min(1, 700 / Math.max(W, H)); W = Math.round(W * esc); H = Math.round(H * esc);
        var c = document.createElement('canvas'); c.width = W; c.height = H;
        var x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H);
        var d = x.getImageData(0, 0, W, H), p = d.data;
        /* ¿bordes blancos y opacos? */
        var claros = 0, total = 0;
        function px(i) { return [p[i], p[i + 1], p[i + 2], p[i + 3]]; }
        for (var k = 0; k < W; k += 3) { [k, (H - 1) * W + k].forEach(function (q) { var v = px(q * 4); total++; if (v[3] > 250 && v[0] > 232 && v[1] > 232 && v[2] > 232) claros++; }); }
        for (var k2 = 0; k2 < H; k2 += 3) { [k2 * W, k2 * W + W - 1].forEach(function (q) { var v = px(q * 4); total++; if (v[3] > 250 && v[0] > 232 && v[1] > 232 && v[2] > 232) claros++; }); }
        if (claros / total < 0.85) { hecho[src] = 'no'; img.setAttribute('data-sin-fondo', src); return; }
        /* relleno desde los bordes: se vuelve transparente lo blanco conectado al borde */
        var vis = new Uint8Array(W * H), pila = [];
        function blanco(q) { var i = q * 4; return p[i] > 225 && p[i + 1] > 225 && p[i + 2] > 225; }
        for (var a = 0; a < W; a++) { pila.push(a, (H - 1) * W + a); }
        for (var b = 0; b < H; b++) { pila.push(b * W, b * W + W - 1); }
        while (pila.length) {
          var q = pila.pop();
          if (q < 0 || q >= W * H || vis[q] || !blanco(q)) continue;
          vis[q] = 1;
          var xx = q % W;
          pila.push(q - W, q + W);
          if (xx > 0) pila.push(q - 1);
          if (xx < W - 1) pila.push(q + 1);
        }
        for (var r = 0; r < W * H; r++) {
          if (vis[r]) { p[r * 4 + 3] = 0; continue; }
          /* borde suave: un píxel pegado a lo borrado queda a media transparencia */
          var xr = r % W;
          if ((xr > 0 && vis[r - 1]) || (xr < W - 1 && vis[r + 1]) || (r >= W && vis[r - W]) || (r < W * (H - 1) && vis[r + W])) p[r * 4 + 3] = Math.min(p[r * 4 + 3], 150);
        }
        x.putImageData(d, 0, 0);
        var url = c.toDataURL('image/png');
        img.setAttribute('data-sin-fondo', url);
        img.src = url;
        hecho[src] = 'si';
      } catch (e) { hecho[src] = 'no'; img.setAttribute('data-sin-fondo', src); }
    };
    im.onerror = function () { hecho[src] = 'no'; };
    im.src = src;
  }

  function aplicar() {
    var img = document.getElementById('reg-adorno');
    if (!img || img.style.display === 'none' || !img.src) return;
    limpiar(img);
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 500);
  window.addEventListener('message', function () { setTimeout(aplicar, 300); setTimeout(aplicar, 1200); });
})();
