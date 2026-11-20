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
    /* 9/11 (Jazmín, Alejandra): «en la trivia el textito abajo del título no se puede modificar, y el fondo tampoco» */
    trivia:     { sel: '[data-sec="trivia"]', texto: '#tv-bajada', bajada: '#tv-bajada' },
    footer:     { sel: '.footer', texto: '' },
    /* ★ 13/11 (Jazmín): «aunque elijamos un estilo, tenemos que poder realizar
       todos los ajustes»: el mismo diseño (fondo, letra, colores, sin título /
       sin sobretítulo) en TODAS las secciones que no lo tenían. */
    eventos:      { sel: '[data-sec="eventos"]', texto: ':scope > p, .evento .sub, .evento .addr, .evento h3, .evento .when, .evento p' },
    dresscode:    { sel: '[data-sec="dresscode"]', texto: ':scope > p, #dc-texto' },
    galeria:      { sel: '[data-sec="galeria"]', texto: ':scope > p' },
    video:        { sel: '[data-sec="video"]', texto: ':scope > p' },
    spotify:      { sel: '[data-sec="spotify"]', texto: ':scope > p' },
    regalos:      { sel: '[data-sec="regalos"]', texto: ':scope > p, #reg-texto' },
    confirmacion: { sel: '[data-sec="confirmacion"]', texto: ':scope > p' },
    clima:        { sel: '[data-sec="clima"]', texto: ':scope > p' },
    contacto:     { sel: '[data-sec="contacto"]', texto: ':scope > p' },
    /* ★ 13/11 (Jazmín): el filtro y las fotos de la fiesta (Live) también */
    filtro:       { sel: '#filtro-sec', texto: 'p' },
    live:         { sel: '#gal-seccion', texto: 'p, .si-nota, li span, .si-paso span, .si-paso b' },
    /* ★ 16/11 (Jazmín, zorely-y-fernando): «que podamos modificar ese sector»
       — el pase con QR: título, fondo, letras, colores, tamaños, los rótulos
       (NOMBRE, PERSONAS, MESA) y sacar los datos que no quieran. */
    pase:         { sel: '.pase', texto: '' }
  };

  /* los campos viejos que ahora sí mandan (clave del panel → campo nuevo) */
  var VIEJOS = {
    padres:     { fondo: 'c_fondo-color-personas', colorTexto: 'c_color-para-la-seccion-personas', colorTitulo: 'padresColor' },
    /* «Color logo y texto sección Instagram»: es TODO el texto de la sección y el logo */
    hashtag:    { fondo: 'c_fondo-seccion-instagram', colorTexto: 'c_color-logo-y-texto-seccion-instagram',
                  colorTitulo: 'c_color-logo-y-texto-seccion-instagram', colorSub: 'c_color-logo-y-texto-seccion-instagram',
                  colorHashtag: 'c_color-logo-y-texto-seccion-instagram', colorLogo: 'c_color-logo-y-texto-seccion-instagram' },
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
    /* los campos viejos mandan sólo en las invitaciones nuevas: las entregadas no cambian */
    var nueva = window.INVNUEVA ? window.INVNUEVA(e) : false;
    var v = nueva ? (VIEJOS[key] || {}) : {};
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

  /* ★ 16/11 (Jazmín: «en filtro y galería de invitados no se pueden modificar
     los botones»). Ahí los botones son <button> y <a> sin clase: buscar sólo
     .btn los dejaba afuera. Botón = lo que tiene pinta de botón (clase de
     botón, <button>, o un link con fondo o borde propio), en cualquier sección. */
  function pareceBoton(b) {
    if (!b.textContent.trim()) return false;
    if (b.dataset.estbackgroundcolor || b.dataset.estcolor || b.dataset.estbordercolor) return true;
    if (/(^|\s)(btn|wsp|tv-btn|acc-btn)(\s|$)/.test(b.className || '') || b.tagName === 'BUTTON' || b.getAttribute('role') === 'button') return true;
    var c = getComputedStyle(b), m = /rgba?\(([^)]+)\)/.exec(c.backgroundColor || ''), al = 1;
    if (m) { var pz = m[1].split(/[ ,\/]+/); al = pz.length > 3 ? parseFloat(pz[3]) : 1; } else al = 0;
    return al > 0.05 || (c.backgroundImage && c.backgroundImage !== 'none') || parseFloat(c.borderTopWidth) > 0;
  }
  function botonesDe(sec) {
    return todos(sec, '.btn, .wsp, .tv-btn, .acc-btn, button, a[href], [role="button"]').filter(function (b) {
      if (b.closest('.ar, .gal-visor, [data-no-boton]')) return false;
      return pareceBoton(b);
    });
  }

  function aplicar(key) {
    var e = ev(); if (!e) return;
    var cfg = SEC[key], sec = document.querySelector(cfg.sel); if (!sec) return;
    var es = estiloDe(e, key);
    var bg = colorOk(es.fondo), img = /^https?:\/\//.test(String(es.imagen || '')) ? es.imagen : '';
    /* ★ 12/11 (Jazmín, xv-maria-ines: «Personas hace destellos entre rosa claro
       y rosa, como un prender y apagar»). El color VIEJO del panel («Fondo color
       Personas») lo leían dos módulos: éste lo ponía liso y sector-elegido.js lo
       ponía con la «Imagen de fondo sección personas» encima; se pisaban uno al
       otro cada medio segundo. Si el fondo sale sólo del campo viejo y hay
       imagen vieja, el fondo es de sector-elegido.js y acá no se toca. */
    var pr = (e.fx && e.fx.estiloSec && e.fx.estiloSec[key]) || {};
    var IMG_VIEJA = { padres: 'c_imagen-de-fondo-seccion-personas' };
    var eleg = (e.fx && e.fx.sectorElegido) || {}, iv = IMG_VIEJA[key];
    if (!pr.fondo && !pr.imagen && iv && (eleg[iv] || eleg['img_' + iv]) && /^https?:/.test(String(e['img_' + IMG_VIEJA[key]] || e[IMG_VIEJA[key]] || ''))) { bg = ''; img = ''; }
    if (key !== 'footer') {
      poner(sec, 'background-color', bg);
      poner(sec, 'background-image', img ? 'url("' + img.replace(/"/g, '') + '")' : (bg ? 'none' : ''));
      poner(sec, 'background-size', img ? 'cover' : '');
      poner(sec, 'background-position', img ? 'center' : '');
      var idc = 'est-sec-' + key, st = document.getElementById(idc);
      var marca = 'est-' + key; sec.setAttribute('data-est', marca);
      var regla = (bg || img || es.sinDiseno) ? '[data-est="' + marca + '"]::before,[data-est="' + marca + '"]::after{background:none!important;background-image:none!important;opacity:0!important}' : '';
      /* ★ 19/11: «Sin el dibujo del diseño» — también las piezas decorativas que la colección cuelga adentro (las flores de la banda) y la textura del propio fondo */
      /* las colecciones pintan su dibujo con selectores largos y !important: acá se repite el atributo para ganarles */
      var F = 'html body [data-est="' + marca + '"][data-est="' + marca + '"][data-est="' + marca + '"]';
      if (es.sinDiseno) regla += F + '::before,' + F + '::after{background:none!important;background-image:none!important;opacity:0!important}' + '[data-est="' + marca + '"] .inv-banda-deco,[data-est="' + marca + '"] > .deco,[data-est="' + marca + '"] > .flor{display:none!important}' + (img ? '' : F + '{background-image:none!important}');
      if (regla && !st) { st = document.createElement('style'); st.id = idc; document.head.appendChild(st); }
      if (st && st.textContent !== regla) st.textContent = regla;
    }
    if (es.fuente) pedirFuente(es.fuente);
    var h = sec.querySelector('h2'), k = sec.querySelector('.kick');
    /* ★ 6/11: el título y el sobretítulo escritos en el panel (vacío = como viene) */
    var tTit = String(es.titulo || '').trim(), tSub = String(es.sobretitulo || '').trim();
    if (h) { if (h.dataset.estTxt === undefined && tTit) h.dataset.estTxt = h.textContent; var qt = tTit || (h.dataset.estTxt !== undefined ? h.dataset.estTxt : null); if (qt !== null && h.textContent !== qt) h.textContent = qt; if (!tTit) delete h.dataset.estTxt; }
    /* ★ 9/11: la bajada (el texto chico debajo del título), si la sección la tiene */
    var bj = SEC[key] && SEC[key].bajada ? sec.querySelector(SEC[key].bajada) : null, tBaj = String(es.bajada || '').trim();
    if (bj) { if (bj.dataset.estTxt === undefined && tBaj) bj.dataset.estTxt = bj.textContent; var qb = tBaj || (bj.dataset.estTxt !== undefined ? bj.dataset.estTxt : null); if (qb !== null && bj.textContent !== qb) bj.textContent = qb; if (!tBaj) delete bj.dataset.estTxt; }
    if (k) { if (k.dataset.estTxt === undefined && tSub) k.dataset.estTxt = k.textContent; var qs = tSub || (k.dataset.estTxt !== undefined ? k.dataset.estTxt : null); if (qs !== null && k.textContent !== qs) k.textContent = qs; if (!tSub) delete k.dataset.estTxt; }
    /* ★ 13/11: «poder no colocar títulos o subtítulos predeterminados» */
    poner(h, 'display', es.sinTitulo ? 'none' : '');
    poner(k, 'display', es.sinSub ? 'none' : '');
    poner(h, 'font-family', es.fuente ? '"' + es.fuente + '", serif' : '');
    poner(h, 'font-size', es.tamTitulo ? es.tamTitulo + 'px' : '');
    poner(h, 'color', colorOk(es.colorTitulo));
    poner(k, 'color', colorOk(es.colorSub));
    var tx = colorOk(es.colorTexto), tam = es.tamTexto ? es.tamTexto + 'px' : '';
    todos(sec, cfg.texto).forEach(function (el) { poner(el, 'color', tx); poner(el, 'font-size', tam); });
    /* ★ 14/11 (Jazmín: «Ver hoteles» con letra blanca sobre crema, «eso no me
       deja modificarlo el panel»). TODOS los botones de CADA sección: color del
       botón y de su letra. Los botones de contorno (.gh) toman el color en el
       borde. Si no se elige nada, /efectos/botones-legibles.js cuida que se lean. */
    var bF = colorOk(es.botonFondo), bL = colorOk(es.botonLetra);
    botonesDe(sec).forEach(function (b) {
      var gh = b.classList.contains('gh');
      poner(b, 'background-color', gh ? '' : bF);
      poner(b, 'background-image', (bF && !gh) ? 'none' : '');
      poner(b, 'border-color', bF);
      poner(b, 'color', bL);
    });

    if (key === 'carta') {
      /* ★ 9/11: «Sin la frase arriba del sobre» — la frase que algunas colecciones
         (Marfil) mudan adentro de la sección de la carta se esconde. */
      todos(sec, '.mf-frase, :scope > p.frase').forEach(function (p) { poner(p, 'display', es.sinFrase ? 'none' : ''); });
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
      /* ★ «Color del sobre» (panel-carta, fx.carta.sobreColor): algunas colecciones
         clavan el tinte del sobre con !important y el color elegido no se veía.
         En las invitaciones nuevas, el elegido manda. */
      var sc = colorOk(((e.fx || {}).carta || {}).sobreColor);
      if (!(window.INVNUEVA ? window.INVNUEVA(e) : false)) sc = '';
      todos(sec, '.cf-back-tint, .cf-front-tint').forEach(function (tn) {
        poner(tn, 'background-color', sc);
        poner(tn, 'opacity', sc ? '1' : '');
      });
    }
    /* ★ 13/11 (Jazmín: «que en confirmación se pueda colocar un salto»): los
       Enter del texto de confirmación se respetan. */
    if (key === 'confirmacion') {
      todos(sec, ':scope > p').forEach(function (p) { if (/\n/.test(p.textContent)) poner(p, 'white-space', 'pre-line'); });
    }
    if (key === 'eventos') {
      /* ★ 13/11 (Jazmín, Ornela & Juan Rodolfo): «que en este sector se puedan
         colocar saltos para abajo: fecha y hora / dirección». Con la casilla, se
         respetan los Enter de la descripción y la dirección va en su renglón
         (el motor lo junta todo con « · »). */
      [1, 2, 3].forEach(function (n) {
        var a = document.getElementById('ev' + n + '-a'); if (!a) return;
        /* ★ 14/11 (Jazmín: «no me hace todos los saltos»): los renglones vacíos
           también cuentan (también al principio y al final), y la dirección
           respeta sus propios Enter. Sólo se limpian espacios sueltos. */
        var crudo = function (s) { return String(s || '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/[ \t]+$/, ''); };
        var f = crudo(e['ev' + n + 'fecha']), d = crudo(e['ev' + n + 'dir']).replace(/^\s+|\s+$/g, '');
        if (es.renglones || /\n/.test(f) || /\n/.test(d)) {
          if (!f.trim() && !d) return;
          if (a.dataset.estOrig === undefined) a.dataset.estOrig = a.textContent;
          /* entre la descripción y la dirección: si la descripción termina con
             Enter, queda un renglón vacío (con 1 o 2 Enter, uno; con 3, dos…);
             sin Enter, la dirección va en el renglón de abajo */
          var cola = (f.match(/\n+$/) || [''])[0].length;
          var sep = '\n' + (cola ? new Array(Math.max(1, cola - 1) + 1).join('\n') : '');
          var nuevo = !f.trim() ? a.dataset.estOrig.replace(/ · (?=[^·]*$)/, '\n') : (d ? f.replace(/\n+$/, '') + sep + d : f);
          if (a.textContent !== nuevo) a.textContent = nuevo;
          poner(a, 'white-space', 'pre-line');
        } else if (a.dataset.estOrig !== undefined) {
          a.textContent = a.dataset.estOrig; delete a.dataset.estOrig; poner(a, 'white-space', '');
        }
      });
    }
    if (key === 'pase') aplicarPase(sec, es);
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
      /* 12/11: tipografía y tamaño del horario/momento y de la descripción */
      if (es.fuenteHora) pedirFuente(es.fuenteHora);
      if (es.fuenteDesc) pedirFuente(es.fuenteDesc);
      var tH = parseInt(es.tamHora, 10) || 0, tD = parseInt(es.tamDesc, 10) || 0;
      todos(sec, '.it .h, .it .it-hora, .it .it-sep, .it .it-nom').forEach(function (el) {
        poner(el, 'font-family', es.fuenteHora ? '"' + es.fuenteHora + '", serif' : '');
        poner(el, 'font-size', tH ? tH + 'px' : '');
      });
      todos(sec, '.it .d').forEach(function (el) {
        poner(el, 'font-family', es.fuenteDesc ? '"' + es.fuenteDesc + '", serif' : '');
        poner(el, 'font-size', tD ? tD + 'px' : '');
      });
      /* las esquinas del recuadro del itinerario (el panel .tl y su fondo) */
      var rad = (es.radio === 0 || es.radio) && es.radio !== '' ? parseInt(es.radio, 10) + 'px' : '';
      todos(sec, '.tl, .tl-panel, .it-panel').forEach(function (el) { poner(el, 'border-radius', rad); poner(el, 'overflow', rad ? 'hidden' : ''); });
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
      /* ★ 16/11 (Jazmín: «en la foto final no se puede quitar el filtro que
         aparece»). El oscurecido es un degradado que el motor y las colecciones
         ponen ENCIMA de la foto, en el mismo fondo del pie. Con la casilla se
         dejan sólo las capas de foto (url) y se sacan los degradados. */
      if (es.sinFiltro) {
        if (sec.dataset.estbackgroundimage) { sec.style.removeProperty('background-image'); delete sec.dataset.estbackgroundimage; }
        var capas = [], prof = 0, ini = 0, bi = getComputedStyle(sec).backgroundImage || '';
        for (var ci = 0; ci < bi.length; ci++) {
          var ch = bi.charAt(ci);
          if (ch === '(') prof++; else if (ch === ')') prof--;
          else if (ch === ',' && !prof) { capas.push(bi.slice(ini, ci).trim()); ini = ci + 1; }
        }
        capas.push(bi.slice(ini).trim());
        /* el degradado se cambia por uno transparente, SIN sacar la capa: los
           tamaños y posiciones del fondo van capa por capa, y sacarla corría
           el encuadre de la foto */
        var hayFoto = capas.some(function (c) { return /^url\(/i.test(c); });
        var limpias = capas.map(function (c) { return /^url\(/i.test(c) ? c : 'linear-gradient(transparent, transparent)'; });
        if (hayFoto && limpias.join(', ') !== capas.join(', ')) poner(sec, 'background-image', limpias.join(', '));
        sec.setAttribute('data-sin-filtro', '');
      } else {
        if (sec.dataset.estbackgroundimage) poner(sec, 'background-image', '');
        sec.removeAttribute('data-sin-filtro');
      }
      var stf = document.getElementById('est-footer-sin-filtro');
      if (!stf) { stf = document.createElement('style'); stf.id = 'est-footer-sin-filtro'; document.head.appendChild(stf);
        stf.textContent = '.footer[data-sin-filtro] .velo,.footer[data-sin-filtro] .fin-velo,.footer[data-sin-filtro] [class*="tint"]{display:none!important}' +
          '.footer[data-sin-filtro], .footer[data-sin-filtro] img{filter:none!important}'; }
      var ff = document.getElementById('fin-frase'), fte = document.getElementById('fin-texto'), fno = document.getElementById('fin-nombres');
      /* ★ 18/11 (Jazmín, festival-instituto-toluca: «¿se puede ver la foto final
         completa? y sin todo el texto predeterminado»). Dos casillas:
         · sinTexto   → se ocultan la frase, el texto final y los nombres/fecha
           (el aviso de «Invitación creada con Invítame» queda);
         · fotoEntera → el pie toma la proporción de la foto y la muestra ENTERA,
           sin recortar (para afiches o fotos con texto propio). */
      [ff, fte, fno].forEach(function (x) { poner(x, 'display', es.sinTexto ? 'none' : ''); });
      if (es.fotoEntera) {
        var mu = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(sec).backgroundImage || '');
        var fu = mu && mu[1];
        if (fu && sec.dataset.estFotoUrl !== fu) {
          sec.dataset.estFotoUrl = fu;
          var imf = new Image();
          imf.onload = function () { if (imf.naturalWidth) { sec.dataset.estFotoProp = imf.naturalWidth + ' / ' + imf.naturalHeight; aplicarTodo(); } };
          imf.src = fu;
        }
        if (sec.dataset.estFotoProp) {
          poner(sec, 'aspect-ratio', sec.dataset.estFotoProp);
          poner(sec, 'min-height', '0');
          poner(sec, 'height', 'auto');
          poner(sec, 'background-size', 'contain');
          poner(sec, 'background-position', 'center');
          poner(sec, 'background-repeat', 'no-repeat');
        }
      } else if (sec.dataset.estFotoProp || sec.dataset.estFotoUrl) {
        ['aspect-ratio', 'min-height', 'height', 'background-size', 'background-position', 'background-repeat'].forEach(function (k) { poner(sec, k, ''); });
        delete sec.dataset.estFotoProp; delete sec.dataset.estFotoUrl;
      }
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

  /* un texto escrito en el panel (vacío = el de fábrica, que se guarda para volver) */
  function ponerTexto(el, t) {
    if (!el) return; t = String(t || '').trim();
    if (el.dataset.estTxt === undefined && t) el.dataset.estTxt = el.textContent;
    var q = t || (el.dataset.estTxt !== undefined ? el.dataset.estTxt : null);
    if (q !== null && el.textContent !== q) el.textContent = q;
    if (!t) delete el.dataset.estTxt;
  }
  /* ★ 20/11: el sello de arriba de la tarjeta (lo pone cada colección con
     .pasecard::before) y el fondo entero. Van en una hoja propia, con el
     selector repetido para ganarle a las colecciones. Sin los campos, la hoja
     queda vacía: ninguna invitación cambia. */
  function paseExtra(es) {
    var css = '', S = 'html body .pase .pasecard.pasecard.pasecard::before', ok = function (u) { return /^https?:\/\//.test(String(u || '')) ? String(u).replace(/"/g, '%22') : ''; };
    /* la imagen de fondo puede venir de este bloque o del campo de siempre «Imagen fondo QR» (img_c_imagen-fondo-qr) */
    var e0 = ev() || {}, sello = ok(es.sello), img = ok(es.imagen) || ok(e0['img_c_imagen-fondo-qr']);
    if (es.sinSello === true || es.sinSello === 'true') css += S + '{display:none!important}';
    else if (sello) css += S + '{content:""!important;background:url("' + sello + '") center/contain no-repeat transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:none!important}';
    if ((es.fondoEntero === true || es.fondoEntero === 'true') && img)
      css += 'html body .pase.pase.pase{background-image:url("' + img + '"),linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,.55)),url("' + img + '")!important;background-size:contain,cover,cover!important;background-position:center,center,center!important;background-repeat:no-repeat,no-repeat,no-repeat!important}';
    var st = document.getElementById('est-pase-extra');
    if (!css) { if (st) st.textContent = ''; return; }
    if (!st) { st = document.createElement('style'); st.id = 'est-pase-extra'; (document.head || document.documentElement).appendChild(st); }
    if (st.textContent !== css) st.textContent = css;
  }
  function aplicarPase(sec, es) {
    try { paseExtra(es); } catch (e) {}
    /* el título («Con cariño, te esperamos») */
    var t = sec.querySelector(':scope > .t');
    ponerTexto(t, es.titulo);
    poner(t, 'display', es.sinTitulo ? 'none' : '');
    poner(t, 'font-family', es.fuente ? '"' + es.fuente + '", serif' : '');
    poner(t, 'font-size', es.tamTitulo ? es.tamTitulo + 'px' : '');
    poner(t, 'color', colorOk(es.colorTitulo));
    /* la tarjeta: el papel (con el «diseño fino» lo pinta pase-qr-fino.js) */
    var card = sec.querySelector('.pasecard'); if (!card) return;
    var fina = es.tarjetaFina === true || es.tarjetaFina === 'true' || es.tarjetaFina === 1;
    var pap = fina ? '' : colorOk(es.tarjeta);
    poner(card, 'background-color', pap);
    poner(card, 'background-image', pap ? 'none' : '');
    /* los datos: cada uno con su rótulo, su valor y su casilla para sacarlo */
    var DATOS = [['Nombre', '#pv-gname'], ['Personas', '#pv-per'], ['Mesa', '#pv-mesa'], ['Estado', '#pv-estado']];
    if (es.fuenteDatos) pedirFuente(es.fuenteDatos);
    var cR = colorOk(es.colorRotulos), cD = colorOk(es.colorDatos);
    var tR = parseInt(es.tamRotulos, 10) || 0, tD = parseInt(es.tamDatos, 10) || 0;
    DATOS.forEach(function (d) {
      var v = card.querySelector(d[1]); if (!v) return;
      var k = v.previousElementSibling && v.previousElementSibling.classList.contains('k') ? v.previousElementSibling : null;
      ponerTexto(k, es['rot' + d[0]]);
      [k, v].forEach(function (el) { poner(el, 'font-family', es.fuenteDatos ? '"' + es.fuenteDatos + '", serif' : ''); });
      poner(k, 'color', cR); poner(k, 'font-size', tR ? tR + 'px' : '');
      if (d[0] !== 'Estado') { poner(v, 'color', cD); poner(v, 'font-size', tD ? tD + 'px' : ''); }
      /* sacar el dato entero: Nombre es su renglón; Personas y Mesa, su columna;
         el estado, su rótulo y su cartelito */
      var sin = !!es['sin' + d[0]];
      if (d[0] === 'Estado') { poner(k, 'display', sin ? 'none' : ''); poner(v, 'display', sin ? 'none' : ''); }
      else { var caja = d[0] === 'Nombre' ? v.closest('.row') : v.parentElement; if (caja && caja !== card) poner(caja, 'display', sin ? 'none' : ''); }
    });
  }

  function aplicarTodo() { Object.keys(SEC).forEach(function (k) { try { aplicar(k); } catch (e) {} }); }

  window.INVESTILO_SEC = { SEC: SEC, aplicar: aplicarTodo };

  if (!/^\/i\//.test(location.pathname)) return;   /* en el admin sólo se publican las tablas */

  /* ★ 5/11/2026 — maferypepe: «cuando despliegan la cantidad de personas, se ve
     en blanco». La lista que abre el <select> la dibuja el sistema con fondo
     blanco, y las opciones heredaban la letra clara de la sección oscura. */
  (function () {
    var s = document.createElement('style');
    s.id = 'opciones-legibles';
    s.textContent = 'select option,select optgroup{color:#1d1d1d!important;-webkit-text-fill-color:#1d1d1d!important;background:#fff!important}';
    (document.head || document.documentElement).appendChild(s);
  })();
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
