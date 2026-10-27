/* ===== EL «¡GRACIAS!» ABAJO DEL TEXTO FINAL (23/10/2026) =====================
   citlalli-y-hedwin-jesus: «en vez de que diga gracias al inicio, quiero que el
   gracias esté abajo de esta frase. Y ya de ahí los nombres de los novios».
   fx.cierre.fraseAbajo = true → orden: texto final, frase final, nombres.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invCierreOrden) return; window.__invCierreOrden = 1;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var ab = !!(ev.fx && ev.fx.cierre && ev.fx.cierre.fraseAbajo);
    var ff = document.getElementById('fin-frase'), ft = document.getElementById('fin-texto');
    if (!ff || !ft || ff.parentNode !== ft.parentNode) return;
    var estaAbajo = !!(ft.compareDocumentPosition(ff) & 4);
    if (ab && !estaAbajo) { ft.parentNode.insertBefore(ff, ft.nextSibling); ff.style.marginTop = '14px'; }
    if (!ab && estaAbajo) { ft.parentNode.insertBefore(ff, ft); ff.style.marginTop = ''; }
    ubicacion(ev, ff.parentNode);
  }

  /* ★ 26/10/2026 (citlalli): «queda un súper espacio arriba; moviendo la frase
     para arriba y centrándolo ya se llena, y unas argollas arriba». Para todas:
     fx.cierre.pos  'abajo' (como venía) | 'centro' | 'arriba'
     fx.cierre.img  una imagen arriba del texto (ej. argollas), fx.cierre.imgTam en px */
  var POS = { arriba: 'flex-start', centro: 'center', abajo: 'flex-end' };
  function ubicacion(ev, foot) {
    if (!foot || !foot.classList || !foot.classList.contains('footer')) foot = document.querySelector('.footer');
    if (!foot) return;
    var c = (ev.fx && ev.fx.cierre) || {};
    var st = document.getElementById('inv-cierre-pos');
    if (!st) { st = document.createElement('style'); st.id = 'inv-cierre-pos'; document.head.appendChild(st); }
    var css = '';
    if (POS[c.pos] && c.pos !== 'abajo') {
      css += 'html body .frame .footer.footer{justify-content:' + POS[c.pos] + '!important;' +
             (c.pos === 'arriba' ? 'padding-top:56px!important' : '') + '}';
    }
    /* ★ 27/10: fx.cierre.textoTam (%) agranda la frase del cierre (#fin-texto) */
    if (st.textContent !== css) st.textContent = css;
    var tt = parseInt(c.textoTam, 10) || 100;
    var fte = document.getElementById('fin-texto');
    if (fte) {
      if (!fte.dataset.fzBase) {
        fte.style.removeProperty('font-size');
        var bz = parseFloat(getComputedStyle(fte).fontSize);
        if (bz) fte.dataset.fzBase = bz;
      }
      var base = parseFloat(fte.dataset.fzBase);
      if (base) {
        if (tt !== 100) { fte.style.setProperty('font-size', (base * tt / 100).toFixed(1) + 'px', 'important'); fte.style.setProperty('line-height', '1.55', 'important'); }
        else { fte.style.removeProperty('font-size'); fte.style.removeProperty('line-height'); }
      }
    }
    var url = String(c.img || '').trim();
    var im = document.getElementById('fin-img');
    if (!/^https?:\/\//i.test(url)) { if (im) im.remove(); return; }
    if (!im) {
      im = document.createElement('img'); im.id = 'fin-img'; im.alt = '';
      var primero = foot.querySelector('#fin-texto, #fin-frase');
      foot.insertBefore(im, primero || foot.firstChild);
    }
    if (im.getAttribute('src') !== url) im.setAttribute('src', url);
    var tam = parseInt(c.imgTam, 10) || 150;
    im.style.cssText = 'display:block;width:' + tam + 'px;max-width:80%;height:auto;margin:0 auto 18px;position:relative;z-index:2';
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 150); });
    setInterval(aplicar, 1200);
  }
  arrancar();
})();
