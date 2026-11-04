/* ===== DISEÑO DE CADA SECCIÓN: FONDO, LETRA, TAMAÑOS Y COLORES (4/11/2026) ====
   Jazmín, 4/11: «el fondo de la carta no se puede cambiar» · «raspadita: no se
   puede modificar el color de los textos de arriba» · «fondo de hospedaje no se
   puede cambiar, color de texto tampoco» · «personas: por más que cambie los
   colores de texto, no se modifican» · «itinerario: si cambio los del horario,
   se cambian en el título» · «sector final: las frases están invertidas» ·
   «Instagram: no se puede cambiar el color de texto, no aparece el logo».

   LA CAUSA, en casi todas: los campos viejos del panel se pintaban en línea SIN
   !important, y las colecciones visten esas mismas cosas con !important → la
   colección ganaba siempre. Y algunas secciones (carta, raspadita, hospedaje)
   directamente no tenían control.

   EL DATO — fx.estiloSec.<seccion> = { fondo, imagen, fuente, tamTitulo,
   colorTitulo, colorSub, colorTexto, tamTexto, … y los propios de cada una }.
   Lo escribe /efectos/panel-estilo-secciones.js («Diseño de la sección», en la
   pestaña de cada sección). Vacío = como viene (la colección).

   ★ Y los campos VIEJOS que ya existían (Color para la sección personas,
     Color logo y texto Instagram, Itinerario color de texto, Fondo color
     Personas…) también pasan a mandar con !important: no hace falta volver a
     cargarlos.

   Todo va con !important en línea: le gana a cualquier hoja de colección.
   ============================================================================ */
(function () {
  'use strict';
  if (window.INVESTILO_SEC) return;

  /* qué es cada cosa en cada sección (lo usa también el panel para los rótulos) */
  var SEC = {
    carta:      { sel: '#carta-sec, [data-sec="carta"]', texto: '#cf-texto, #cf-titulo' },
    scratch:    { sel: '.sec.scratch-sec', texto: '#sc-hint, .scratch-hint' },
    hospedaje:  { sel: '[data-sec="hospedaje"]', texto: '#hosp-texto, .iv-plie-txt p' },
    padres:     { sel: '[data-sec="padres"]', texto: '.padres-frase, :scope > p' },
    itinerario: { sel: '[data-sec="itinerario"]', texto: '.it .d' },
    hashtag:    { sel: '[data-sec="hashtag"]', texto: ':scope > p' },
    footer:     { sel: '.footer', texto: '' }
  };

  /* los campos viejos que ahora sí mandan (clave del panel → campo nuevo) */
  var VIEJOS = {
    padres:     { fondo: 'c_fondo-color-personas', colorTexto: 'c_color-para-la-seccion-personas', colorTitulo: 'padresColor' },
    hashtag:    { fondo: 'c_fondo-seccion-instagram', colorTexto: 'c_color-logo-y-texto-seccion-instagram' },
    itinerario: { colorTexto: 'c_itinerario-color-de-texto' }
  };

  function ev() { return window.INVEV || null; }
  function colorOk(c) { c = String(c || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(c) || /^rgba?\(/i.test(c) ? c : ''; }
  function poner(el, prop, v) {
    if (!el) return;
    /* el color va también como text-fill: algunas colecciones y el corrector de
       contraste pintan con -webkit-text-fill-color, que es el que se ve */
    if (prop === 'color') { ponerUno(el, '-webkit-text-fill-color', v, 'estfill'); }
    ponerUno(el, prop, v, 'est' + prop.replace(/-/g, ''));
  }
  function ponerUno(el, prop, v, marca) {
    if (v) { if (el.style.getPropertyValue(prop) !== v || el.style.getPropertyPriority(prop) !== 'important') el.style.setProperty(prop, v, 'important'); }
    else if (el.dataset[marca]) el.style.removeProperty(prop);
    if (v) el.dataset[marca] = '1'; else delete el.dataset[marca];
  }
  function todos(raiz, sel) { if (!raiz || !sel) return []; try { return [].slice.call(raiz.querySelectorAll(sel)); } catch (e) { return []; } }
  function hexRgba(c, a) {
    var m = /^#([0-9a-f]{6})$/i.exec(c || ''); if (!m || a >= 1) return c;
    var n = parseInt(m[1], 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  var pedidas = {};
  function pedirFuente(f) {
    f = String(f || '').trim(); if (!f || pedidas[f]) return; pedidas[f] = 1;
    try { if (typeof window.cargarFont === 'function') { window.cargarFont(f); return; } } catch (e) {}
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':ital,wght@0,400;0,600;1,400&display=swap';
    document.head.appendChild(l);
  }

  function estiloDe(e, key) {
    var es = {}, fx = e.fx || {}, propio = (fx.estiloSec && fx.estiloSec[key]) || {};
    var v = VIEJOS[key] || {};
    Object.keys(v).forEach(function (k) { var x = e[v[k]]; if (x != null && x !== '') es[k] = x; });
    Object.keys(propio).forEach(function (k) { if (propio[k] !== '' && propio[k] != null) es[k] = propio[k]; });   /* lo nuevo manda */
    return es;
  }

  /* el horario y el nombre del momento vienen juntos en el mismo renglón
     («17:00 · Llegada»): se parten en dos para poder pintarlos distinto */
  function partirHoras(sec) {
    todos(sec, '.it .h').forEach(function (h) {
      if (h.querySelector('.it-hora')) return;
      var t = h.textContent, i = t.indexOf('·');
      if (i < 0 || h.children.length) return;
      h.textContent = '';
      var a = document.createElement('span'); a.className = 'it-hora'; a.textContent = t.slice(0, i).trim();
      var s = document.createElement('span'); s.className = 'it-sep'; s.textContent = ' · ';
      var b = document.createElement('span'); b.className = 'it-nom'; b.textContent = t.slice(i + 1).trim();
      h.appendChild(a); h.appendChild(s); h.appendChild(b);
    });
  }

  var LOGO_IG = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>';

  function aplicar(key) {
    var e = ev(); if (!e) return;
    var cfg = SEC[key], sec = document.querySelector(cfg.sel); if (!sec) return;
    var es = estiloDe(e, key);
    var bg = colorOk(es.fondo), img = /^https?:\/\//.test(String(es.imagen || '')) ? es.imagen : '';
    if (key !== 'footer') {
      poner(sec, 'background-color', bg);
      poner(sec, 'background-image', img ? 'url("' + img.replace(/"/g, '') + '")' : (bg ? 'none' : ''));
      poner(sec, 'background-size', img ? 'cover' : '');
      poner(sec, 'background-position', img ? 'center' : '');
      var idc = 'est-sec-' + key, st = document.getElementById(idc);
      var marca = 'est-' + key; sec.setAttribute('data-est', marca);
      var regla = (bg || img) ? '[data-est="' + marca + '"]::before,[data-est="' + marca + '"]::after{background:none!important;background-image:none!important;opacity:0!important}' : '';
      if (regla && !st) { st = document.createElement('style'); st.id = idc; document.head.appendChild(st); }
      if (st && st.textContent !== regla) st.textContent = regla;
    }
    if (es.fuente) pedirFuente(es.fuente);
    var h = sec.querySelector('h2'), k = sec.querySelector('.kick');
    poner(h, 'font-family', es.fuente ? '"' + es.fuente + '", serif' : '');
    poner(h, 'font-size', es.tamTitulo ? es.tamTitulo + 'px' : '');
    poner(h, 'color', colorOk(es.colorTitulo));
    poner(k, 'color', colorOk(es.colorSub));
    var tx = colorOk(es.colorTexto), tam = es.tamTexto ? es.tamTexto + 'px' : '';
    todos(sec, cfg.texto).forEach(function (el) { poner(el, 'color', tx); poner(el, 'font-size', tam); });

    if (key === 'carta') {
      var hoja = sec.querySelector('.cf-letter');
      poner(hoja, 'background-color', colorOk(es.hoja));
      if (colorOk(es.hoja)) poner(hoja, 'background-image', 'none');
      var fr = sec.querySelector('.cf-front');
      poner(fr, 'background-image', es.bolsilloOpaco ? 'url("https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/carta/frente-bolsillo-opaco.png")' : '');
      var ft = sec.querySelector('.cf-front-tint');
      if (es.bolsilloOpaco && ft) {
        ft.style.setProperty('-webkit-mask-image', 'url("https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/carta/frente-bolsillo-opaco.png")', 'important');
        ft.style.setProperty('mask-image', 'url("https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/carta/frente-bolsillo-opaco.png")', 'important');
        ft.dataset.estmask = '1';
      } else if (ft && ft.dataset.estmask) { ft.style.removeProperty('-webkit-mask-image'); ft.style.removeProperty('mask-image'); delete ft.dataset.estmask; }
      poner(sec.querySelector('#cf-titulo'), 'color', colorOk(es.colorTituloHoja));
    }
    if (key === 'scratch') {
      todos(sec, '.sc-day, .sc-mon, .ivf .n, .r3-f').forEach(function (el) { poner(el, 'color', colorOk(es.colorNumeros)); });
    }
    if (key === 'hospedaje') {
      var tar = colorOk(es.tarjeta), al = (typeof es.tarjetaOpaca === 'number') ? es.tarjetaOpaca : 1;
      todos(sec, '.hotel').forEach(function (c) { poner(c, 'background-color', tar ? hexRgba(tar, al) : ''); if (tar) poner(c, 'background-image', 'none'); });
      todos(sec, '.hotel h4').forEach(function (el) { poner(el, 'color', colorOk(es.colorNombre)); });
      todos(sec, '.hotel .d').forEach(function (el) { poner(el, 'color', colorOk(es.colorDesc) || tx); });
    }
    if (key === 'padres') {
      todos(sec, '.padres .nm').forEach(function (el) { poner(el, 'color', colorOk(es.colorNombre) || tx); });
      todos(sec, '.padres .rl').forEach(function (el) { poner(el, 'color', colorOk(es.colorRel) || tx); });
      /* ★ el tamaño de las fotitos (la plataforma vieja las tenía de 250 px, de a una por renglón) */
      var ft2 = parseInt(es.fotoTam, 10) || 0, g = sec.querySelector('.padres');
      todos(sec, '.padres .av').forEach(function (a) { poner(a, 'width', ft2 ? ft2 + 'px' : ''); poner(a, 'height', ft2 ? ft2 + 'px' : ''); poner(a, 'max-width', ft2 ? '100%' : ''); });
      poner(g, 'display', ft2 ? 'flex' : '');
      poner(g, 'flex-wrap', ft2 ? 'wrap' : '');
      poner(g, 'justify-content', ft2 ? 'center' : '');
      poner(g, 'grid-template-columns', '');
      todos(sec, '.padres .p').forEach(function (c) { poner(c, 'width', ft2 ? (ft2 + 14) + 'px' : ''); poner(c, 'max-width', ft2 ? '100%' : ''); });
    }
    if (key === 'itinerario') {
      partirHoras(sec);
      var cHora = colorOk(es.colorHora), cNom = colorOk(es.colorNombre);
      todos(sec, '.it .h').forEach(function (el) { poner(el, 'color', (cHora && cNom) ? '' : (cHora || cNom || tx)); });
      todos(sec, '.it .it-hora').forEach(function (el) { poner(el, 'color', cHora); });
      todos(sec, '.it .it-sep').forEach(function (el) { poner(el, 'color', cHora); });
      todos(sec, '.it .it-nom').forEach(function (el) { poner(el, 'color', cNom); });
      todos(sec, '.it .d').forEach(function (el) { poner(el, 'color', colorOk(es.colorDesc) || tx); });
    }
    if (key === 'hashtag') {
      var big = sec.querySelector('#hashtag-big');
      poner(big, 'color', colorOk(es.colorHashtag) || tx);
      var lg = sec.querySelector('.est-ig-logo');
      if (es.sinLogo) { if (lg) lg.remove(); }
      else if (big) {
        if (!lg) { lg = document.createElement('div'); lg.className = 'est-ig-logo'; lg.innerHTML = LOGO_IG; big.parentNode.insertBefore(lg, big); }
        var c = colorOk(es.colorLogo) || tx || (big ? getComputedStyle(big).color : '');
        lg.style.cssText = 'width:42px;height:42px;margin:14px auto 0;display:block;color:' + (c || 'currentColor');
      }
    }
    if (key === 'footer') {
      var ff = document.getElementById('fin-frase'), fte = document.getElementById('fin-texto'), fno = document.getElementById('fin-nombres');
      if (es.fuenteFrase) pedirFuente(es.fuenteFrase);
      if (es.fuenteTexto) pedirFuente(es.fuenteTexto);
      poner(ff, 'font-family', es.fuenteFrase ? '"' + es.fuenteFrase + '", serif' : '');
      poner(ff, 'color', colorOk(es.colorFrase));
      [fte, fno].forEach(function (el) {
        poner(el, 'font-family', es.fuenteTexto ? '"' + es.fuenteTexto + '", serif' : '');
        poner(el, 'color', colorOk(es.colorTextoFinal));
        /* una letra cursiva no se lee en mayúsculas separadas */
        poner(el, 'text-transform', es.textoSinMayus ? 'none' : '');
        poner(el, 'letter-spacing', es.textoSinMayus ? 'normal' : '');
      });
    }
  }

  function aplicarTodo() { Object.keys(SEC).forEach(function (k) { try { aplicar(k); } catch (e) {} }); }

  window.INVESTILO_SEC = { SEC: SEC, aplicar: aplicarTodo };

  if (!/^\/i\//.test(location.pathname)) return;   /* en el admin sólo se publican las tablas */
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicarTodo();
    addEventListener('message', function () { setTimeout(aplicarTodo, 160); });
    var n = 0, t = setInterval(function () {
      aplicarTodo();
      if (++n > 40) { clearInterval(t); setInterval(aplicarTodo, 2000); }
    }, 450);
  }
  arrancar();
})();
