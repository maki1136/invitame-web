/* ===== BOLETOS: LA LÍNEA TROQUELADA NO CRUZA LOS TEXTOS (20/11/2026) =========
   César y Helene (guía de los novios, 05-01 y 09-01): «la línea punteada no debe
   atravesar CEREMONIA ni ningún texto» · «evitar que las líneas punteadas
   atraviesen texto, dirección o enlaces».

   EL PROBLEMA: en la colección de diseño «Pase de abordar» (colecciones/fiesta.js,
   forma 'boleto') las tarjetas de Dónde y cuándo y de los hoteles llevan las
   muescas y la línea troquelada a una altura FIJA, el 62 % de la tarjeta. Con la
   foto de la ceremonia, el 62 % cae justo sobre el título; en los hoteles, sobre
   la dirección.

   QUÉ HACE — si fx.estiloSec.eventos.corteJusto está prendido:
     · en Dónde y cuándo, la línea y las muescas van JUSTO donde termina la foto;
     · en los hoteles, entre el texto y el botón (sin botón: no hay línea ni muescas).
   Lo mide en cada tarjeta, así que sirve con cualquier foto y cualquier largo.

   PANEL: LUGAR_VEST → «Dónde y cuándo · diseño» → casilla «Boletos: la línea…».
   ⚠️ Sin la casilla NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invBoletoCorte) return; window.__invBoletoCorte = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;

  var ATR = 'data-boleto-justo';
  function si(v) { return v === true || v === 'true' || v === 1; }
  function on() { try { return si((((window.INVEV || {}).fx || {}).estiloSec || {}).eventos && window.INVEV.fx.estiloSec.eventos.corteJusto); } catch (e) { return false; } }

  var H = 'html[' + ATR + '][' + ATR + '][' + ATR + '] body ';
  var CSS =
    H + ':is(.evento,.hotel)[data-corte]{' +
    '-webkit-mask:radial-gradient(circle 12px at 0 var(--corte), #0000 98%, #000) left/51% 100% no-repeat, radial-gradient(circle 12px at 100% var(--corte), #0000 98%, #000) right/51% 100% no-repeat!important;' +
    'mask:radial-gradient(circle 12px at 0 var(--corte), #0000 98%, #000) left/51% 100% no-repeat, radial-gradient(circle 12px at 100% var(--corte), #0000 98%, #000) right/51% 100% no-repeat!important;' +
    'background-position:0 calc(var(--corte) - 1px)!important}' +
    H + ':is(.evento,.hotel)[data-corte="no"]{-webkit-mask:none!important;mask:none!important;background-image:none!important}';

  function hayLinea(el) {
    var s = getComputedStyle(el);
    return /linear-gradient/.test(s.backgroundImage) && /repeat-x/.test(s.backgroundRepeat);
  }
  function medir(el) {
    var alto = el.offsetHeight; if (!alto) return null;
    if (el.classList.contains('evento')) {
      var ph = el.querySelector(':scope > .ph');
      if (ph && ph.offsetHeight > 20 && getComputedStyle(ph).display !== 'none') return ph.offsetTop + ph.offsetHeight;
      return 'no';
    }
    /* hotel: entre lo último escrito y el botón */
    var btn = el.querySelector(':scope > .btn, :scope > a.btn, :scope .btnrow');
    if (!btn || !btn.offsetHeight) return 'no';
    var prev = btn.previousElementSibling;
    var fin = prev ? prev.offsetTop + prev.offsetHeight : 0;
    return Math.round((fin + btn.offsetTop) / 2);
  }

  function aplicar() {
    var raiz = document.documentElement;
    if (!on()) {
      if (raiz.hasAttribute(ATR)) {
        raiz.removeAttribute(ATR);
        [].forEach.call(document.querySelectorAll('[data-corte]'), function (e) { e.removeAttribute('data-corte'); e.style.removeProperty('--corte'); });
      }
      return;
    }
    if (!document.getElementById('inv-boleto-corte')) {
      var st = document.createElement('style'); st.id = 'inv-boleto-corte'; st.textContent = CSS;
      (document.head || raiz).appendChild(st);
    }
    raiz.setAttribute(ATR, '1');
    [].forEach.call(document.querySelectorAll('.evento, .hotel'), function (el) {
      if (!el.hasAttribute('data-corte') && !hayLinea(el)) return;   /* sólo los boletos */
      var y = medir(el); if (y == null) return;
      if (y === 'no') { if (el.getAttribute('data-corte') !== 'no') el.setAttribute('data-corte', 'no'); return; }
      var v = y + 'px';
      if (el.style.getPropertyValue('--corte') !== v) el.style.setProperty('--corte', v);
      if (el.getAttribute('data-corte') !== '1') el.setAttribute('data-corte', '1');
    });
  }

  var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 400);
  setInterval(aplicar, 2000);
  addEventListener('resize', function () { setTimeout(aplicar, 100); });
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 800); });
  document.addEventListener('click', function () { setTimeout(aplicar, 350); }, true);   /* «Ver hoteles» abre el desplegable */
})();
