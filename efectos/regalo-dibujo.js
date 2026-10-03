/* ===== EL REGALO DIBUJADO DE «MESA DE REGALOS» ★ 3/10/2026 =======================
   Maki: «opciones de regalo… tipo dibujado como en la web nuestra… y poder cambiarle
   el color en la plataforma».

   `fx.regalo.dibujo` = id del catálogo (/efectos/regalos-catalogo.js, `dibujos`).
   `fx.regalo.color`  = color del trazo. Vacío → el color del título de la sección.

   El dibujo es una MÁSCARA (PNG con alfa): se pinta con `background-color` a través
   de `mask-image`, así un solo archivo sirve en cualquier color y en cualquier tema.
   Va en el lugar del adorno de siempre (`#reg-adorno`), que se esconde mientras haya
   dibujo. Sin dibujo elegido no cambia nada: se ve la foto o el adorno que haya.

   ⚠️ Es un <span>, no un <img>: las reglas «polaroid» de Perlas y Marfil
      (`.sec > img`) no lo agarran.
   ⚠️ Repasa cada 1,2 s: el motor vuelve a mostrar `#reg-adorno` cuando re-aplica el
      evento (la vista previa del panel lo hace a cada cambio).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'reg-dibujo';

  function cfg() {
    try { var f = (window.INVEV || {}).fx || {}; return f.regalo || {}; } catch (e) { return {}; }
  }
  function dibujo(id) {
    var c = window.INVREGALOS && window.INVREGALOS.dibujos || [];
    for (var i = 0; i < c.length; i++) if (c[i].id === id) return c[i];
    return null;
  }

  function repasar() {
    var sec = document.querySelector('[data-sec=regalos]');
    if (!sec) return;
    var ad = document.getElementById('reg-adorno');
    var r = cfg();
    var d = r.dibujo ? dibujo(String(r.dibujo)) : null;
    var span = document.getElementById(ID);

    if (!d) {
      if (span) span.remove();
      if (ad && ad.dataset.regDibujo) { ad.style.removeProperty('display'); delete ad.dataset.regDibujo; }
      return;
    }

    if (!span) {
      span = document.createElement('span');
      span.id = ID;
      span.setAttribute('aria-hidden', 'true');
      span.style.cssText = 'display:block;width:132px;height:132px;margin:0 auto 10px;' +
        '-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;' +
        '-webkit-mask-position:center;mask-position:center;' +
        '-webkit-mask-size:contain;mask-size:contain;pointer-events:none';
      if (ad && ad.parentNode) ad.parentNode.insertBefore(span, ad);
      else sec.insertBefore(span, sec.firstChild);
    }
    var url = 'url("' + d.url + '")';
    if (span.__url !== url) {
      span.style.setProperty('-webkit-mask-image', url);
      span.style.setProperty('mask-image', url);
      span.__url = url;
    }
    var col = String(r.color || '').trim();
    if (!col) {
      var h2 = sec.querySelector('h2');
      col = h2 ? getComputedStyle(h2).color : '#5a4a3a';
    }
    if (span.style.backgroundColor !== col) span.style.backgroundColor = col;

    if (ad) { ad.style.setProperty('display', 'none', 'important'); ad.dataset.regDibujo = '1'; }
  }

  function arrancar() { repasar(); setInterval(repasar, 1200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
  window.INVREGALODIBUJO = { repasar: repasar };
})();
