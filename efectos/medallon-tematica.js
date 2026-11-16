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
    /* un logo/ícono con fondo transparente va ENTERO (sin recortar en círculo) */
    if (LOGO[u] === true) return u.replace('/image/upload/', '/image/upload/c_fit,w_' + w + ',h_' + w + ',q_auto,f_png/');
    return u.replace('/image/upload/', '/image/upload/r_max,c_fill,w_' + w + ',h_' + w + ',q_auto,f_png/');
  }

  /* ★ 16/11 (Jazmín, ALSEC: «lo subí como dice pero queda con fondo blanco y
     queda raro»). El medallón está pensado para una FOTO redonda y le ponía un
     disco blanco atrás. Un logo o ícono en PNG con fondo transparente quedaba
     metido en un círculo blanco. Se mira si la imagen tiene transparencia en
     las esquinas: si la tiene, va sola, sin disco blanco, sin recorte y sin aro. */
  var LOGO = {};
  function medirLogo(u) {
    if (LOGO[u] !== undefined) return;
    LOGO[u] = 'midiendo';
    var im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = function () {
      try {
        var N = 48, c = document.createElement('canvas'); c.width = N; c.height = N;
        var x = c.getContext('2d'); x.drawImage(im, 0, 0, N, N);
        var d = x.getImageData(0, 0, N, N).data, tr = 0;
        [[1, 1], [N - 2, 1], [1, N - 2], [N - 2, N - 2], [N >> 1, 1], [1, N >> 1]].forEach(function (q) { if (d[(q[1] * N + q[0]) * 4 + 3] < 40) tr++; });
        LOGO[u] = tr >= 3;
      } catch (e) { LOGO[u] = false; }
      ultimo = null; aplicar();
    };
    im.onerror = function () { LOGO[u] = false; };
    var s = u.indexOf('res.cloudinary.com') >= 0 && u.indexOf('/image/upload/') >= 0 ? u.replace('/image/upload/', '/image/upload/w_96,f_png/') : u;
    im.src = s;
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
    ].concat(LOGO[u] === true ? [
      /* logo con transparencia: sin disco blanco, sin aro, entero */
      H + ' body .tl > .it::before{background-color:transparent!important;background-size:contain!important;border-radius:0!important;box-shadow:none!important}',
      H + ' .adorno .md-orn b,' + H + ' [data-md-adorno] .md-orn b{background-color:transparent!important;background-size:contain!important;border-radius:0!important;box-shadow:none!important;width:40px!important;height:40px!important}',
      H + ' section.pase.pase-simple .ps-med{background-color:transparent!important;background-size:contain!important;border-radius:0!important;box-shadow:none!important}'
    ] : []).join('\n');
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

  /* ★ 16/11/2026 (Jazmín, ailicec-mishell, Celebra · Scrapbook: «sacar el lacre
     que tiene toda la invi y dejar el moño que yo puse»). Las colecciones con
     PIEZA fotografiada (Celebra, Fiesta, Degradé, Óleo) la pintan en sus propias
     hojas: marcas del itinerario, pase, tapa de la raspadita… y el medallón sólo
     tapaba algunas. Con medallón cargado, TODA pieza de la colección pasa a ser
     el medallón, en cualquier colección: se reescriben las direcciones de la
     pieza en las hojas que inyectan las colecciones. Sin medallón, todo vuelve.
     La tapa de la raspadita tiene que ser OPACA (si no se ven los números): ahí
     va el medallón aplanado sobre el papel. */
  var PIEZA_RE = /url\(\s*["']?([^"')]*?(?:-pieza(?:-circ)?(?:[0-9]*)?(?:\.(?:webp|png|jpg))?|dg-pieza-[a-z0-9]+|\/piezas\/[^"')]*medallon[^"')]*))["']?\s*\)/g;
  function papelHex() {
    var c = '';
    try { var s = document.querySelector('.sec.scratch-sec') || document.body; c = getComputedStyle(s).backgroundColor; } catch (e) {}
    var m = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?/.exec(c || '');
    if (!m || (m[4] !== undefined && parseFloat(m[4]) < 0.5)) return 'F7F1EA';
    return [m[1], m[2], m[3]].map(function (x) { return ('0' + (+x).toString(16)).slice(-2); }).join('').toUpperCase();
  }
  /* ⚠️ NO se reescriben las hojas de la colección: la colección vuelve a
     escribir la suya cada 1,2 s y quedaba una pelea (titila). Se arma una hoja
     PROPIA con las mismas reglas que usan la pieza, con el medallón y un
     selector más fuerte (html[data-medallon]), puesta al final. */
  function partir(sel) {
    var out = [], prof = 0, ini = 0;
    for (var i = 0; i < sel.length; i++) {
      var c = sel.charAt(i);
      if (c === '(') prof++; else if (c === ')') prof--;
      else if (c === ',' && !prof) { out.push(sel.slice(ini, i).trim()); ini = i + 1; }
    }
    out.push(sel.slice(ini).trim());
    return out;
  }
  function fuerte(sel) {
    if (/^html\b/.test(sel)) return sel.replace(/^html/, 'html[data-medallon]');
    if (/^:root\b/.test(sel)) return sel.replace(/^:root/, 'html[data-medallon]');
    return 'html[data-medallon] ' + sel;
  }
  var firmaPiezas = '';
  function piezas(u) {
    var dest = document.getElementById(ID + '-piezas');
    if (!u) { if (dest) dest.textContent = ''; firmaPiezas = ''; return; }
    var hojas = document.querySelectorAll('style'), firma = u + '|' + LOGO[u];
    for (var i = 0; i < hojas.length; i++) if (hojas[i].id !== ID && hojas[i].id !== ID + '-piezas') firma += '|' + (hojas[i].textContent || '').length;
    if (firma === firmaPiezas && dest) return;
    firmaPiezas = firma;
    var nueva = chico(u, 220), tapa = nueva;
    if (u.indexOf('res.cloudinary.com') >= 0 && u.indexOf('/image/upload/') >= 0)
      tapa = u.replace('/image/upload/', '/image/upload/b_rgb:' + papelHex() + ',c_pad,w_360,h_360,q_auto,f_jpg/');
    var reglas = [];
    function recorrer(lista) {
      for (var j = 0; j < lista.length; j++) {
        var r = lista[j];
        if (r.cssRules && !r.selectorText) { try { recorrer(r.cssRules); } catch (e) {} continue; }
        if (!r.style || !r.selectorText) continue;
        var decl = [];
        for (var k = 0; k < r.style.length; k++) {
          var prop = r.style[k], val = r.style.getPropertyValue(prop);
          PIEZA_RE.lastIndex = 0;
          if (!PIEZA_RE.test(val)) continue;
          PIEZA_RE.lastIndex = 0;
          decl.push(prop + ':' + val.replace(PIEZA_RE, 'url("' + (prop === '--r3-tapa' ? tapa : nueva) + '")') + ' !important');
        }
        if (decl.length) reglas.push(partir(r.selectorText).map(fuerte).join(',') + '{' + decl.join(';') + '}');
      }
    }
    for (var h = 0; h < hojas.length; h++) {
      var st = hojas[h];
      if (st.id === ID || st.id === ID + '-piezas' || !st.sheet) continue;
      PIEZA_RE.lastIndex = 0;
      if (!PIEZA_RE.test(st.textContent || '')) continue;
      try { recorrer(st.sheet.cssRules); } catch (e) {}
    }
    /* el logo transparente: la pieza va entera, sin recorte redondo */
    if (LOGO[u] === true) reglas.push('html[data-medallon] .tl > .it::before{background-size:contain!important;background-repeat:no-repeat!important;background-position:center!important;border-radius:0!important;box-shadow:none!important;background-color:transparent!important}');
    if (!dest) { dest = document.createElement('style'); dest.id = ID + '-piezas'; }
    document.head.appendChild(dest);   /* siempre la última */
    dest.textContent = reglas.join('\n');
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
        adornos(false); pase(false); piezas('');
        ultimo = '';
      }
      return;
    }
    medirLogo(u);
    if (!st) { st = document.createElement('style'); st.id = ID; (document.head || raiz).appendChild(st); }
    var firma = u + '|' + LOGO[u];
    if (ultimo !== firma) { st.textContent = css(u); ultimo = firma; }
    raiz.setAttribute('data-medallon', '1');
    if (!raiz.getAttribute('data-marca-propia')) raiz.setAttribute('data-marca-propia', 'medallon');
    adornos(true); pase(true); piezas(u);
  }

  var n = 0;
  var t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 300);
  addEventListener('message', function () { setTimeout(aplicar, 150); });
  setInterval(aplicar, 1500);
})();
