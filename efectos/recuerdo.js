/* ===== EL RECUERDO: LA INVITACIÓN ENTERA EN IMÁGENES (9/10/2026) ==================

   Regalo para los novios, al lado del save the date: la invitación de punta a
   punta —del sobre cerrado al «¡Gracias!»— para que les quede cuando a los 90
   días se baje. Maki aprobó dos formas (9/10): «en una sola hoja» y la larga.

     const r = await INVREC.armar(function (txt) { … });   // avisa por dónde va
     r.hoja    → Blob JPG: todas las secciones en 4 columnas, en una sola imagen
     r.partes  → [Blob JPG]: la larga, cortada en partes (ver abajo por qué)

   Corre ADENTRO de la invitación publicada, en un iframe de 390 × 844, igual
   que efectos/save-the-date.js, y usa sus mismas herramientas (INVSTD.util):
   los videos congelados, las letras metidas adentro, la librería propia.

   ⚠️ LA LARGA VA EN PARTES. Una invitación entera mide ~15.000 px de alto; al
      doble de resolución son 780 × 31.000 = 24 millones de píxeles, y el Safari
      del iPhone no arma un lienzo de más de ~16 millones (sale en blanco, sin
      error). Cada parte llega hasta 14.000 px de alto y se corta ENTRE
      secciones, nunca en el medio de una.
   ⚠️ CADA SECCIÓN SE SACA SOLA, con las demás escondidas y la página arriba de
      todo: así el fondo fijo (foto o video «adelante», textura del papel) queda
      detrás de esa sección como en el celular. Sacarle la foto a la sección
      suelta la dejaba sin fondo.
   ⚠️ MEMORIA: cada sección pasa a JPG apenas se saca y su lienzo se suelta. En
      el iPhone, tener todas las secciones como lienzo a la vez lo cierra.
   ⚠️ Lo que vive en otro dominio (Spotify, YouTube, mapas) no se puede
      fotografiar: queda una caja vacía del mismo tamaño, para no correr nada.
   ============================================================================ */
(function () {
  if (window.INVREC) return;
  var ESC = 2, ALTO_PARTE = 14000;
  /* la copia del <body> salía corrida 8 px a la derecha (el margen de fábrica del
     navegador) con una franja oscura a la izquierda: se le saca a la fuerza */
  var SIN_MARGEN = { margin: '0', padding: '0' };

  function aBlob(c, q) { return new Promise(function (ok) { c.toBlob(function (b) { ok(b); }, 'image/jpeg', q || 0.88); }); }
  function soltar(c) { try { c.width = 0; c.height = 0; } catch (e) {} }
  function aImagen(b) {
    return new Promise(function (ok, no) { var u = URL.createObjectURL(b), im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = u; });
  }
  function fondoDe(el) {
    for (var e = el; e; e = e.parentElement) { var c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; }
    return '#ffffff';
  }

  /* silencio y cajas vacías en lugar de lo que es de otro dominio */
  function preparar() {
    try { HTMLAudioElement.prototype.play = function () { return Promise.resolve(); }; } catch (e) {}
    document.querySelectorAll('audio,video').forEach(function (m) { m.muted = true; if (m.tagName === 'AUDIO') { try { m.pause(); } catch (e) {} } });
    document.querySelectorAll('iframe').forEach(function (f) {
      var r = f.getBoundingClientRect(), d = document.createElement('div');
      d.style.cssText = 'width:' + (r.width || f.offsetWidth) + 'px;height:' + (r.height || f.offsetHeight) + 'px;' + f.style.cssText;
      d.className = f.className; f.replaceWith(d);
    });
    var st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st);
  }
  /* lo mismo que hace recuerdo.py, que es lo que Maki aprobó */
  function ocultarFlotantes() {
    document.querySelectorAll('body *').forEach(function (e) {
      var c = getComputedStyle(e);
      if (c.position === 'sticky') { e.style.setProperty('position', 'static', 'important'); return; }   /* barras pegadas al borde: van en su lugar */
      if (c.position !== 'fixed') return;
      var r = e.getBoundingClientRect();
      if (r.width * r.height < 160 * 160) e.style.setProperty('visibility', 'hidden', 'important');      /* música, WhatsApp, pase con voz */
    });
    /* la raspadita, ya raspada: se ve lo que había abajo */
    document.querySelectorAll('.rasp-zona canvas, #scratchcard canvas').forEach(function (c) { c.style.setProperty('opacity', '0', 'important'); });
  }

  async function sacarPantalla(css) {
    var u = window.INVSTD.util;
    /* sólo el sobre: congelar los videos de toda la página tardaba más de 3 minutos */
    await u.congelarEn(document.getElementById('env') || document.body);
    var c = await window.modernScreenshot.domToCanvas(document.body, { width: innerWidth, height: innerHeight, scale: ESC, style: SIN_MARGEN, timeout: 15000, font: { cssText: css },
      /* sólo el sobre: copiar la página entera (todas las fotos) tardaba minutos */
      filter: function (n) { if (n.nodeType !== 1) return true; if (n.tagName === 'IFRAME' || n.tagName === 'VIDEO') return false; var env = document.getElementById('env'); return !env || n === env || env.contains(n) || n.contains(env); } });
    var b = await aBlob(c); soltar(c); return b;
  }

  async function sacarSeccion(el, todas, fijos, css) {
    var u = window.INVSTD.util;
    var antes = todas.map(function (s) { return s.style.getPropertyValue('display') + '|' + s.style.getPropertyPriority('display'); });
    todas.forEach(function (s) { if (s !== el) s.style.setProperty('display', 'none', 'important'); });
    window.scrollTo(0, 0);
    await u.esperar(350);
    /* Al volver a mostrarse, una sección arranca de cero sus animaciones de
       entrada (opacidad 0): en Cantera salían los títulos y las tarjetas en
       blanco. Se las lleva al final; las que no terminan nunca, se dejan. */
    try {
      (document.getAnimations ? document.getAnimations() : []).forEach(function (a) {
        try { var ef = a.effect && a.effect.getComputedTiming && a.effect.getComputedTiming(); if (ef && ef.iterations !== Infinity) a.finish(); } catch (e) {}
      });
    } catch (e) {}
    await u.esperar(120);
    var r = el.getBoundingClientRect(), top = Math.max(0, r.top + scrollY), alto = Math.ceil(r.height);
    /* el fondo fijo mide una pantalla: para una sección más alta se estira, como se ve al pasar con el dedo */
    var altos = fijos.map(function (f) { var v = f.style.getPropertyValue('height'), p = f.style.getPropertyPriority('height'); f.style.setProperty('height', Math.max(innerHeight, alto + top) + 'px', 'important'); return [v, p]; });
    var fondo = fondoDe(el);
    var c = null;
    try {
      c = await window.modernScreenshot.domToCanvas(document.body, {
        width: innerWidth, height: top + alto, scale: ESC, style: SIN_MARGEN, timeout: 15000, backgroundColor: fondo, font: { cssText: css },
        filter: function (n) {
          if (n.nodeType !== 1) return true;
          if (n.tagName === 'IFRAME' || n.tagName === 'VIDEO') return false;
          return n === el || el.contains(n) || n.contains(el) || fijos.some(function (f) { return f === n || f.contains(n) || n.contains(f); });
        }
      });
    } finally {
      todas.forEach(function (s, i) { var a = antes[i].split('|'); if (a[0]) s.style.setProperty('display', a[0], a[1]); else s.style.removeProperty('display'); });
      fijos.forEach(function (f, i) { if (altos[i][0]) f.style.setProperty('height', altos[i][0], altos[i][1]); else f.style.removeProperty('height'); });
    }
    /* se recorta lo de arriba de la sección (el margen del marco) */
    var out = document.createElement('canvas'); out.width = innerWidth * ESC; out.height = alto * ESC;
    var ox = out.getContext('2d'); ox.fillStyle = fondo; ox.fillRect(0, 0, out.width, out.height);   /* lo transparente salía NEGRO en el JPG */
    ox.drawImage(c, 0, top * ESC, c.width, alto * ESC, 0, 0, out.width, out.height);
    soltar(c);
    var b = await aBlob(out); soltar(out);
    return { blob: b, alto: alto * ESC };
  }

  /* la larga: secciones una abajo de la otra, en partes de hasta ALTO_PARTE */
  async function armarPartes(piezas) {
    var grupos = [], g = [], h = 0;
    piezas.forEach(function (p) { if (g.length && h + p.alto > ALTO_PARTE) { grupos.push(g); g = []; h = 0; } g.push(p); h += p.alto; });
    if (g.length) grupos.push(g);
    var W = innerWidth * ESC, out = [];
    for (var i = 0; i < grupos.length; i++) {
      var c = document.createElement('canvas'); c.width = W; c.height = grupos[i].reduce(function (s, p) { return s + p.alto; }, 0);
      var x = c.getContext('2d'), y = 0;
      for (var j = 0; j < grupos[i].length; j++) { var im = await aImagen(grupos[i][j].blob); x.drawImage(im, 0, y, W, grupos[i][j].alto); URL.revokeObjectURL(im.src); y += grupos[i][j].alto; }
      out.push(await aBlob(c, 0.86)); soltar(c);
    }
    return out;
  }

  /* la hoja: cuatro columnas, cortadas entre secciones, en una sola imagen */
  async function armarHoja(piezas) {
    var COL = 4, K = 0.6, M = 60, G = 48;
        /* columnas parejas: el corte que deja la columna más alta lo más baja posible */
    var n = piezas.length, pre = [0];
    piezas.forEach(function (p, i) { pre.push(pre[i] + p.alto); });
    var best = [], corte = [];
    for (var k = 0; k <= COL; k++) { best.push([]); corte.push([]); for (var j = 0; j <= n; j++) { best[k].push(Infinity); corte[k].push(0); } }
    best[0][0] = 0;
    for (k = 1; k <= COL; k++) for (j = 0; j <= n; j++) for (var m = 0; m <= j; m++) {
      var v = Math.max(best[k - 1][m], pre[j] - pre[m]); if (v < best[k][j]) { best[k][j] = v; corte[k][j] = m; }
    }
    var cols = [], fin = n;
    for (k = COL; k >= 1; k--) { var ini = corte[k][fin]; cols.unshift(piezas.slice(ini, fin)); fin = ini; }
    cols = cols.filter(function (c) { return c.length; });
    var w = Math.round(innerWidth * ESC * K);
    var altoCol = cols.map(function (c) { return c.reduce(function (s, p) { return s + Math.round(p.alto * K); }, 0); });
    var c = document.createElement('canvas'); c.width = 2 * M + cols.length * w + (cols.length - 1) * G; c.height = 2 * M + Math.max.apply(null, altoCol);
    var x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < cols.length; i++) {
      var y = M;
      for (var j = 0; j < cols[i].length; j++) { var p = cols[i][j], im = await aImagen(p.blob), ah = Math.round(p.alto * K); x.drawImage(im, M + i * (w + G), y, w, ah); URL.revokeObjectURL(im.src); y += ah; }
    }
    var b = await aBlob(c, 0.88); soltar(c); return b;
  }

  async function armar(avisar) {
    avisar = avisar || function () {};
    var u = window.INVSTD.util;
    await u.cargarLib();
    preparar();
    await u.esperar(3500);

    avisar('El sobre cerrado…');
    var css = await u.letras([document.body]);
    var piezas = [];
    try { var sb = await sacarPantalla(css); piezas.push({ blob: sb, alto: innerHeight * ESC }); } catch (e) { console.warn('[recuerdo] sobre:', e); }

    avisar('Abriendo la invitación…');
    await u.abrirSobre();
    await u.esperar(1500);
    await u.quieta();
    /* una pasada entera, para que todo aparezca y cargue */
    for (var y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await u.esperar(160); }
    await u.esperar(2500);
    ocultarFlotantes();
    css = await u.letras([document.body]);

    var frame = document.querySelector('.frame');
    var todas = frame ? [].filter.call(frame.children, function (e) { return e.offsetHeight > 40 && getComputedStyle(e).display !== 'none'; }) : [];
    var buscarFijos = function () {
      return [].filter.call(document.body.querySelectorAll('*'), function (e) {
        var c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden') return false;
        var r = e.getBoundingClientRect(); return r.width * r.height >= 160 * 160 && e.id !== 'env' && !e.closest('#env');
      });
    };
    /* el fondo «adelante» puede ser un VIDEO fijo: se congela antes, si no queda gris (regina, 10/10) */
    var fijos = buscarFijos();
    for (var f = 0; f < fijos.length; f++) {
      if (fijos[f].tagName === 'VIDEO') { var cont = document.createElement('div'); fijos[f].parentNode.insertBefore(cont, fijos[f]); cont.appendChild(fijos[f]); await u.congelarEn(cont); cont.replaceWith.apply(cont, [].slice.call(cont.childNodes)); }
      else await u.congelarEn(fijos[f]);
    }
    fijos = buscarFijos();
    for (var i = 0; i < todas.length; i++) {
      avisar('Sección ' + (i + 1) + ' de ' + todas.length + '…');
      todas[i].scrollIntoView({ block: 'start' }); await u.esperar(700);
      await u.congelarEn(todas[i]);
      var t0 = performance.now();
      try { piezas.push(await sacarSeccion(todas[i], todas, fijos, css)); } catch (e) { console.warn('[recuerdo] sección', i, e); }
      if (window.INVREC_DEBUG) console.log('[recuerdo] sección ' + i + ' ' + Math.round(performance.now() - t0) + ' ms');
    }
    window.scrollTo(0, 0);
    avisar('Armando las imágenes…');
    var partes = await armarPartes(piezas);
    var hoja = await armarHoja(piezas);
    return { hoja: hoja, partes: partes, secciones: piezas.length };
  }

  window.INVREC = { armar: armar };
})();
