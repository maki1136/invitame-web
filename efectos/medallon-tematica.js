/* ===== EL MEDALLÓN DE LA TEMÁTICA (9/11/2026) ==================================
   Maki, mirando renata-y-patricio-platinum:
     «lo más feo es el itinerario… borrar esas líneas… y si vas a poner algo,
      no podés poner esos tres circulitos básicos».
   Las colecciones nuevas (Celebra) ya usan una PIEZA FOTOGRAFIADA en un
   círculo como marca del itinerario y como adorno de los títulos. Las otras
   colecciones (Marfil, Perlas…) dibujaban un símbolo de línea fina de 18 px.

   QUÉ HACE — si la invitación tiene un medallón cargado:
     · las marcas del itinerario pasan a ser ese medallón (30 px, redondo);
     · el adorno de cada título («—∘○∘—») pasa a ser dos líneas finas con el
       medallón al medio;
     · el pase simple lo lleva arriba, montado sobre el borde de la tarjeta.

   CÓMO SE PRENDE — panel → LUGAR_VEST → «Itinerario · colores por separado» →
     «Medallón». Lo guarda en fx.estiloSec.itinerario.medallon (una foto
     redonda o cuadrada con el objeto al medio; se recorta en círculo).
   ⚠️ Sin medallón cargado este módulo NO HACE NADA: ninguna invitación cambia
      si nadie lo elige.
   ⚠️ Deja `data-marca-propia="medallon"` en el <html>: es la señal para que
      simbolo-tematica.js no pinte su marca encima (ver allá).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invMedallon) return; window.__invMedallon = 1;

  var ID = 'inv-medallon-css';

  function url() {
    try {
      var e = window.INVEV || {};
      var es = ((e.fx || {}).estiloSec || {}).itinerario || {};
      var u = String(es.medallon || '').trim();
      return /^https?:\/\//.test(u) ? u : '';
    } catch (e) { return ''; }
  }

  /* el mismo archivo, redondo y del tamaño justo (si es de Cloudinary) */
  function chico(u, w) {
    if (u.indexOf('res.cloudinary.com') < 0 || u.indexOf('/image/upload/') < 0) return u;
    return u.replace('/image/upload/', '/image/upload/r_max,c_fill,w_' + w + ',h_' + w + ',q_auto,f_png/');
  }

  function css(u) {
    var m = chico(u, 120), g = chico(u, 220);
    var H = 'html[data-medallon]';
    return [
      /* ---- el itinerario ---- */
      H + ' body .tl > .it::before{width:30px!important;height:30px!important;border-radius:50%!important;border:0!important;',
      '  background-color:#fff!important;background-image:url("' + m + '")!important;background-size:cover!important;',
      '  background-repeat:no-repeat!important;background-position:center!important;',
      '  box-shadow:0 0 0 1px rgba(255,255,255,.9),0 3px 10px rgba(0,0,0,.16)!important;z-index:2!important;',
      '  -webkit-mask:none!important;mask:none!important}',
      H + ' body .tl:not(.tl-centro) > .it::before{margin-left:-9.5px!important;margin-top:-9.5px!important}',
      H + ' body .tl.tl-centro > .it:nth-child(odd)::before{left:auto!important;right:-41px!important;top:50%!important;margin:-15px 0 0 0!important}',
      H + ' body .tl.tl-centro > .it:nth-child(even)::before{right:auto!important;left:-41px!important;top:50%!important;margin:-15px 0 0 0!important}',
      H + ' body .tl > .it{z-index:1}',

      /* ---- el adorno de los títulos ---- */
      H + ' .adorno > svg,' + H + ' .adorno > span[data-simbolo-inv]{display:none!important}',
      /* ★ 16/11 (Jazmín, evento corporativo: «si le coloco yo un iconito se
         superpone con el que está puesto de la plantilla»). Hay colecciones que
         pintan su adorno como FONDO del .adorno, o cuelgan uno propio
         (.fiesta-adorno y similares): el medallón ponía el suyo encima. Con
         medallón, el de la colección se apaga en TODAS sus formas. */
      H + ' .adorno,' + H + ' [data-md-adorno]{background-image:none!important;-webkit-mask-image:none!important;mask-image:none!important}',
      H + ' .adorno::before,' + H + ' .adorno::after,' + H + ' [data-md-adorno]::before,' + H + ' [data-md-adorno]::after{content:none!important;display:none!important}',
      H + ' [data-md-adorno] .md-orn{display:flex!important;align-items:center;justify-content:center;gap:12px;height:100%;min-height:34px}',
      H + ' [data-md-adorno] .md-orn i{display:block;width:38px;height:1px;background:currentColor;opacity:.45}',
      H + ' [data-md-adorno] .md-orn b{display:block;width:34px;height:34px;border-radius:50%;background:#fff url("' + m + '") center/cover no-repeat;box-shadow:0 0 0 1px rgba(255,255,255,.9),0 3px 10px rgba(0,0,0,.14)}',
      H + ' [data-md-adorno]{width:auto!important;height:auto!important;min-height:34px}',
      H + ' .adorno .md-orn{display:flex!important;align-items:center;justify-content:center;gap:12px;height:100%;min-height:34px}',
      H + ' .adorno .md-orn i{display:block;width:38px;height:1px;background:currentColor;opacity:.45}',
      H + ' .adorno .md-orn b{display:block;width:34px;height:34px;border-radius:50%;background:#fff url("' + m + '") center/cover no-repeat;',
      '  box-shadow:0 0 0 1px rgba(255,255,255,.9),0 3px 10px rgba(0,0,0,.14)}',

      /* ---- el pase simple: el medallón montado arriba de la tarjeta ---- */
      H + ' section.pase.pase-simple .pasecard{position:relative!important;overflow:visible!important;margin-top:40px!important;padding-top:52px!important}',
      H + ' section.pase.pase-simple .ps-med{display:block;position:absolute;left:50%;top:-36px;width:72px;height:72px;margin-left:-36px;',
      '  border-radius:50%;background:#fff url("' + g + '") center/cover no-repeat;',
      '  box-shadow:0 0 0 3px rgba(255,255,255,.95),0 6px 18px rgba(0,0,0,.18)}'
    ].join('\n');
  }

  function adornos(on) {
    if (!on) [].forEach.call(document.querySelectorAll('.md-orn'), function (n) { n.remove(); });
    /* los adornos propios de las colecciones (.fiesta-adorno y similares): sólo
       piezas chicas sueltas, nunca una sección o el documento */
    [].forEach.call(document.querySelectorAll('div[class*="-adorno"], span[class*="-adorno"], i[class*="-adorno"]'), function (x) {
      if (x.closest('.md-orn') || x.children.length > 1) return;
      if (!x.hasAttribute('data-md-adorno') && (x.offsetHeight > 90 || x.offsetWidth > 260)) return;
      /* en línea: la colección pinta su adorno con selectores largos y !important */
      if (on) { x.setAttribute('data-md-adorno', ''); x.style.setProperty('background-image', 'none', 'important'); x.style.setProperty('height', 'auto', 'important'); x.style.setProperty('width', 'auto', 'important'); }
      else if (x.hasAttribute('data-md-adorno')) { x.removeAttribute('data-md-adorno'); x.style.removeProperty('background-image'); x.style.removeProperty('height'); x.style.removeProperty('width'); }
    });
    [].forEach.call(document.querySelectorAll('.adorno, [data-md-adorno]'), function (a) {
      if (a.classList.contains('md-orn') || a.closest('.md-orn')) return;
      var o = a.querySelector(':scope > .md-orn');
      if (on && !o) {
        o = document.createElement('span');
        o.className = 'md-orn';
        o.setAttribute('aria-hidden', 'true');
        o.innerHTML = '<i></i><b></b><i></i>';
        a.appendChild(o);
      } else if (!on && o) { o.remove(); }
    });
  }

  function pase(on) {
    var card = document.querySelector('section.pase.pase-simple .pasecard');
    if (!card) return;
    var m = card.querySelector(':scope > .ps-med');
    if (on && !m) {
      m = document.createElement('span');
      m.className = 'ps-med';
      m.setAttribute('aria-hidden', 'true');
      card.insertBefore(m, card.firstChild);
    } else if (!on && m) { m.remove(); }
  }

  var ultimo = null;
  function aplicar() {
    var u = url();
    var raiz = document.documentElement;
    var st = document.getElementById(ID);
    if (!u) {
      if (ultimo !== '') {
        if (st) st.textContent = '';
        raiz.removeAttribute('data-medallon');
        if (raiz.getAttribute('data-marca-propia') === 'medallon') raiz.removeAttribute('data-marca-propia');
        adornos(false); pase(false);
        ultimo = '';
      }
      return;
    }
    if (!st) { st = document.createElement('style'); st.id = ID; (document.head || raiz).appendChild(st); }
    if (ultimo !== u) { st.textContent = css(u); ultimo = u; }
    raiz.setAttribute('data-medallon', '1');
    if (!raiz.getAttribute('data-marca-propia')) raiz.setAttribute('data-marca-propia', 'medallon');
    adornos(true); pase(true);
  }

  var n = 0;
  var t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 300);
  addEventListener('message', function () { setTimeout(aplicar, 150); });
  setInterval(aplicar, 1500);
})();
