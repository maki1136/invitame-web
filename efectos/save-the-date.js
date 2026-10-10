/* ===== EL SAVE THE DATE, ARMADO CON LA PORTADA DE LA INVITACIÓN (9/10/2026) =====

   QUÉ ES
   Un regalo para los novios: una imagen vertical de 1080 × 1920 (el tamaño de
   los estados de WhatsApp e Instagram) con la PORTADA de su invitación — la
   misma foto o video, las mismas letras y los mismos colores — y, en lugar de
   la cuenta regresiva, «Save the date», la fecha y la ciudad.
   Maki, 9/10: «que se arme sola pero que sea editable por nuestras diseñadoras
   y ellos carguen los datos que quieran que aparezca».

   CÓMO SE USA
   NO va en la lista de efectos/index.js: las invitaciones no lo cargan. Lo usan
   los dos paneles (efectos/panel-save-the-date.js en admin.html y la vista
   «Save the date» de mi-panel.js): abren la invitación PUBLICADA en un iframe
   de 360 × 640, del mismo dominio, le meten este archivo y le hablan así:

     const r = await INVSTD.preparar();      // {auto, disenio}: abre el sobre, espera que la portada
                                             // quede quieta y arma el save the date
     INVSTD.armar({titulo, frase, nombres, fecha, detalle, pie});   // los textos
     const blob = await INVSTD.capturar();   // la imagen, JPG 1080 × 1920

   Un texto vacío en `armar` = ese renglón no va. Lo que no se manda queda como
   lo armó solo (`auto`).

   POR QUÉ EN EL NAVEGADOR Y NO EN UN SERVIDOR
   Se probó el 9/10 en el motor del Safari del iPhone y en Chrome: la imagen
   sale igual a la captura de pantalla de la invitación (camila, regina,
   luciana, danna, lupita, julia, renata, montserrat), en 2 a 7 segundos, y
   no cuesta nada por invitación. Un servidor con navegador costaba por uso.

   ⚠️ LAS TRES TRAMPAS QUE SE PAGARON AL PROBARLO
   1. Un <video> que no se puede leer TRABA la captura para siempre (la
      librería espera que cargue). Por eso cada video se cambia antes por una
      imagen de su cuadro actual, y los videos quedan afuera del filtro.
   2. El video de la página no pide permiso de otro dominio (`crossorigin`),
      así que su cuadro no se puede leer: se abre una COPIA que sí lo pide
      (con `?std=1` para que no salga la respuesta guardada sin permiso) y en
      un lienzo NUEVO (uno que ya leyó algo prohibido queda bloqueado).
   3. Las letras de Google no se pueden leer desde otro dominio: sin pasarlas
      a mano, la imagen sale con una letra de reemplazo (Camila & Tomás en
      Times). Se bajan las hojas, se dejan sólo las letras que usa la portada y
      el juego latino, y cada archivo va metido adentro como dato.
   ============================================================================ */
(function () {
  if (window.INVSTD) return;

  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var CURSIVA = /script|vibes|cursive|rouge|dancing|allura|parisienne|pinyon|tangerine|alex brush|sacramento|italianno/i;
  var LIB = '/efectos/lib/modern-screenshot.js';
  var $ = function (s) { return document.querySelector(s); };
  var esperar = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var E = {};          /* los elementos que armamos */
  var AUTO = null;     /* los textos que salen solos */
  var ORIG = {};       /* el HTML original de los nombres y la frase */
  var listo = null;
  var CSS_LETRAS = '';

  /* ---------- 1. silencio: es una imagen, no suena nada ---------- */
  function silenciar() {
    try { HTMLAudioElement.prototype.play = function () { return Promise.resolve(); }; } catch (e) {}
    document.querySelectorAll('audio,video').forEach(function (m) { m.muted = true; if (m.tagName === 'AUDIO') { try { m.pause(); } catch (e) {} } });
    document.querySelectorAll('iframe').forEach(function (f) { f.remove(); });   /* YouTube, Spotify, mapas */
  }

  /* ---------- 2. el sobre: por el botón y, si no, a la fuerza ---------- */
  function sobreVisible() {
    var e = document.getElementById('env'); if (!e) return false;
    var c = getComputedStyle(e);
    return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0.05 && !e.classList.contains('gone') && e.getBoundingClientRect().height > 100;
  }
  async function abrirSobre() {
    var b = document.getElementById('btn-ingresar'); if (b) b.click();
    for (var i = 0; i < 10 && sobreVisible(); i++) await esperar(400);
    var e = document.getElementById('env');
    if (e) { e.classList.add('gone'); e.style.setProperty('display', 'none', 'important'); }
    document.body.classList.add('inv-open'); document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
  }

  /* ---------- 3. que la portada termine de vestirse (colección, colores, letras) ---------- */
  function firma() {
    var q = function (s) { var e = $(s); if (!e) return ''; var c = getComputedStyle(e); return [c.webkitTextFillColor, c.color, c.fontFamily, c.fontSize, c.textShadow, c.backgroundImage].join('|'); };
    return q('#pv-names') + '#' + q('#pv-kick') + '#' + q('.portada > .c') + '#' + [].map.call(document.documentElement.attributes, function (a) { return a.name + '=' + a.value; }).filter(function (x) { return x.indexOf('style') !== 0; }).sort().join(',');
  }
  async function quieta() {
    var ant = null, q = 0;
    for (var i = 0; i < 50; i++) {          /* hasta 25 s; quieta = 3 s sin cambios */
      var f = firma(); q = f === ant ? q + 1 : 0; ant = f;
      if (q >= 6 && document.querySelector('.portada')) break;
      await esperar(500);
    }
    try { await document.fonts.ready; } catch (e) {}
  }

  /* ---------- 4. los textos que salen solos ---------- */
  function ciudadDe(ev) {
    var partes = String(ev.ev1dir || ev.ev2dir || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return partes.slice(-2).map(function (s) { return s.replace(/^(C\.?P\.?\s*)?\d{4,5}\s+/i, ''); }).join(', ');
  }
  function autoDe() {
    var ev = window.INVEV || {}, d = ev.fecha ? new Date(ev.fecha) : null, ok = d && !isNaN(d);
    var kick = $('#pv-kick'), names = $('#pv-names'), ciudad = ciudadDe(ev);
    return {
      titulo: 'Save the date',
      frase: kick ? kick.textContent.trim() : '',
      nombres: ev.n1 ? (ev.n2 ? ev.n1 + ' & ' + ev.n2 : ev.n1) : (names ? names.textContent.replace(/\s+/g, ' ').trim() : ''),
      fecha: ok ? String(d.getDate()).padStart(2, '0') + ' · ' + String(d.getMonth() + 1).padStart(2, '0') + ' · ' + d.getFullYear() : '',
      detalle: (ok ? DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] : '') + (ok && ciudad ? '  ·  ' : '') + ciudad,
      pie: ''
    };
  }

  /* ---------- 5. el armado (una sola vez) ---------- */
  function construir() {
    var port = $('.portada'), kick = $('#pv-kick'), names = $('#pv-names');
    if (!port || !names) throw new Error('la invitación no tiene portada');
    var count = port.querySelector('.count');
    ORIG.nombres = names.innerHTML; ORIG.frase = kick ? kick.innerHTML : '';

    /* fuera lo que no va en una imagen: botones flotantes, cuenta regresiva, flecha */
    document.querySelectorAll('body *').forEach(function (e) {
      var c = getComputedStyle(e); if (c.position !== 'fixed') return;
      var r = e.getBoundingClientRect(); if (r.width * r.height < 160 * 160) e.style.setProperty('visibility', 'hidden', 'important');
    });
    [].filter.call(port.querySelectorAll('*'), function (e) { var r = e.getBoundingClientRect(); return r.top > 520 && r.width < 70 && !e.closest('.count') && !e.closest('#pv-names'); })
      .forEach(function (e) { e.style.setProperty('visibility', 'hidden', 'important'); });

    var num = count && count.querySelector('.num'), lab = count && count.querySelector('.lab');
    var kcs = getComputedStyle(kick || names);
    var ncs = getComputedStyle(num || names); if (CURSIVA.test(ncs.fontFamily)) ncs = kcs;
    var lcs = getComputedStyle(lab || kick || names); if (CURSIVA.test(lcs.fontFamily)) lcs = kcs;
    var T = ['color', '-webkit-text-fill-color', 'text-shadow', 'font-family', 'font-weight', 'font-style'];
    var copiar = function (cs, el) { T.forEach(function (p) { el.style.setProperty(p, cs.getPropertyValue(p), 'important'); }); };

    /* «Save the date», arriba, con la letra del sobretítulo */
    var std = document.createElement('div'); std.id = 'std-titulo'; copiar(kcs, std);
    if (CURSIVA.test(kcs.fontFamily)) { std.style.setProperty('font-family', ncs.fontFamily, 'important'); std.style.setProperty('font-style', 'normal', 'important'); }
    std.style.cssText += ';position:fixed;top:46px;left:0;right:0;text-align:center;font-size:15px;letter-spacing:7px;text-transform:uppercase;z-index:2147483000';
    var m = (getComputedStyle(std).color.match(/[\d.]+/g) || [0, 0, 0]).map(Number), L = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
    std.style.setProperty('text-shadow', L > 0.5 ? '0 1px 3px rgba(0,0,0,.75),0 0 18px rgba(0,0,0,.55)' : '0 0 3px rgba(255,255,255,.9),0 0 16px rgba(255,255,255,.75)', 'important');
    var stdTxt = document.createElement('span'); std.appendChild(stdTxt);
    var raya = document.createElement('i'); raya.style.cssText = 'display:block;width:44px;height:1px;margin:11px auto 0;background:currentColor;opacity:.75'; std.appendChild(raya);
    document.body.appendChild(std);

    /* en lugar de la cuenta: la fecha, el detalle y el pie */
    var bloque = document.createElement('div'); bloque.id = 'std-bloque'; bloque.style.cssText = 'text-align:center;margin-top:16px;position:relative;z-index:3';
    var f = document.createElement('div'); copiar(ncs, f); f.style.cssText += ';font-size:30px;line-height:1.1;letter-spacing:4px';
    var g = document.createElement('div'); copiar(lcs, g); g.style.cssText += ';font-size:10px;line-height:1.7;letter-spacing:2.6px;text-transform:uppercase;margin-top:10px;padding:0 24px';
    var p = document.createElement('div'); copiar(lcs, p); p.style.cssText += ';font-size:9.5px;line-height:1.6;letter-spacing:2px;text-transform:uppercase;margin-top:14px;padding:0 30px;opacity:.9';
    bloque.appendChild(f); bloque.appendChild(g); bloque.appendChild(p);
    if (count) { count.style.setProperty('display', 'none', 'important'); count.after(bloque); } else names.after(bloque);

    E = { port: port, kick: kick, names: names, std: std, stdTxt: stdTxt, raya: raya, bloque: bloque, f: f, g: g, p: p };
    armar(AUTO);

    /* si la portada ya tiene algo arriba (un neón, un logo), «Save the date» baja y va antes de la fecha */
    var sr = std.getBoundingClientRect();
    var choca = [].some.call(port.querySelectorAll('*'), function (e) {
      if (std.contains(e) || bloque.contains(e)) return false;
      var c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity < 0.1) return false;
      var r = e.getBoundingClientRect(); if (r.width < 20 || r.height < 8 || (r.width > 340 && r.height > 300)) return false;
      var conTexto = [].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); }) || /^(IMG|svg|CANVAS)$/i.test(e.tagName);
      return conTexto && r.top < sr.bottom + 14 && r.bottom > sr.top - 4;
    });
    if (choca) { std.style.position = 'static'; std.style.fontSize = '12px'; std.style.marginBottom = '12px'; raya.style.display = 'none'; bloque.insertBefore(std, bloque.firstChild); }

    /* lo de abajo de la portada no se ve: se apaga (memoria, sobre todo en el iPhone) */
    for (var n = port; n && n !== document.body; n = n.parentElement) {
      [].forEach.call(n.parentElement ? n.parentElement.children : [], function (h) {
        if (h === n || h === std || h.contains(port) || /^(SCRIPT|STYLE|LINK)$/.test(h.tagName)) return;
        if (getComputedStyle(h).position === 'fixed') return;
        h.style.setProperty('display', 'none', 'important');
      });
    }
    window.scrollTo(0, 0);
    return choca;
  }

  /* ---------- 6. los textos (se puede llamar las veces que haga falta) ---------- */
  /* los nombres cambiados se arman igual que los arma el motor: «A» arriba y «& B» abajo
     (o en la misma línea si la invitación los tiene juntos) */
  function nombresHtml(txt) {
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
    var par = txt.split(/\s*&\s*/);
    if (par.length !== 2 || !par[0] || !par[1]) return '<span>' + esc(txt) + '</span>';
    return '<span>' + esc(par[0]) + '</span>' + (E.names.classList.contains('juntos') ? ' ' : '<br>') + '<span>&amp; ' + esc(par[1]) + '</span>';
  }
  function poner(el, txt, visible) { if (!el) return; el.textContent = txt; el.style.display = visible ? '' : 'none'; }
  function armar(d) {
    if (!E.std) return;
    d = d || {};
    /* un guion solo = ese renglón no va (vacío, en los paneles, es «el que sale solo») */
    var v = function (k) { var x = d[k] == null ? (AUTO[k] || '') : String(d[k]).trim(); return x === '-' ? '' : x; };
    poner(E.stdTxt, v('titulo'), true); E.std.style.display = v('titulo') ? '' : 'none';
    poner(E.f, v('fecha'), !!v('fecha'));
    poner(E.g, v('detalle'), !!v('detalle'));
    poner(E.p, v('pie'), !!v('pie'));
    if (v('nombres') === AUTO.nombres) E.names.innerHTML = ORIG.nombres; else E.names.innerHTML = nombresHtml(v('nombres'));
    if (E.kick) {
      if (v('frase') === AUTO.frase) E.kick.innerHTML = ORIG.frase; else E.kick.textContent = v('frase');
      E.kick.style.display = v('frase') ? '' : 'none';
    }
  }

  async function preparar() {
    if (listo) return listo;
    listo = (async function () {
      silenciar();
      await abrirSobre();
      await esperar(1500);
      await quieta();
      silenciar();
      AUTO = autoDe();
      construir();
      await esperar(600);
      /* lo que dejó escrito la diseñadora en el panel (fx.std), aparte: es el punto de partida de los novios */
      var fx = (window.INVEV && window.INVEV.fx && window.INVEV.fx.std) || {}, dis = {};
      Object.keys(AUTO).forEach(function (k) { if (fx[k] != null && String(fx[k]).trim() !== '') dis[k] = String(fx[k]); });
      return { auto: Object.assign({}, AUTO), disenio: dis };
    })();
    return listo;
  }

  /* ---------- 7. la imagen ---------- */
  function cargarLib() {
    if (window.modernScreenshot) return Promise.resolve();
    return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = LIB + '?v=4.6.6'; s.onload = ok; s.onerror = function () { no(new Error('no cargó la librería')); }; document.head.appendChild(s); });
  }
  function aDato(blob) { return new Promise(function (r) { var f = new FileReader(); f.onload = function () { r(f.result); }; f.readAsDataURL(blob); }); }

  async function cuadro(v) {
    var c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    try { return c.toDataURL('image/jpeg', 0.92); } catch (e) { /* trampa 2 */ }
    var w = document.createElement('video'); w.crossOrigin = 'anonymous'; w.muted = true; w.playsInline = true; w.preload = 'auto';
    var s0 = v.currentSrc || v.src; w.src = s0 + (s0.indexOf('?') >= 0 ? '&' : '?') + 'std=1';
    await new Promise(function (ok, no) { w.onloadeddata = ok; w.onerror = function () { no(new Error('el video no carga')); }; setTimeout(function () { no(new Error('el video tarda')); }, 15000); });
    w.currentTime = Math.min(v.currentTime || 0, Math.max(0, (w.duration || 1) - 0.05));
    await new Promise(function (ok) { w.onseeked = ok; setTimeout(ok, 4000); });
    var c2 = document.createElement('canvas'); c2.width = w.videoWidth; c2.height = w.videoHeight;
    c2.getContext('2d').drawImage(w, 0, 0);
    return c2.toDataURL('image/jpeg', 0.92);
  }
  async function congelarVideos() {
    var vids = [].slice.call(document.querySelectorAll('video'));
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i], r = v.getBoundingClientRect();
      if (r.width < 50 || r.bottom < 0 || r.top > 640 || !v.videoWidth) continue;
      try {
        var url = await cuadro(v), im = new Image(); im.src = url; im.className = v.className; im.style.cssText = v.style.cssText;
        var cs = getComputedStyle(v);
        ['position', 'inset', 'top', 'left', 'right', 'bottom', 'width', 'height', 'object-fit', 'object-position', 'transform', 'filter', 'opacity', 'z-index'].forEach(function (p) { im.style.setProperty(p, cs.getPropertyValue(p)); });
        await im.decode(); v.replaceWith(im);
      } catch (e) { console.warn('[save the date] video:', e); }
    }
  }
  async function letras(nodos) {
    var hojas = [].map.call(document.querySelectorAll('link[rel=stylesheet][href*="fonts.googleapis"]'), function (l) { return l.href; });
    document.querySelectorAll('style').forEach(function (s) { (s.textContent.match(/https:\/\/fonts\.googleapis\.com\/css2?\?[^)'"\s]+/g) || []).forEach(function (u) { hojas.push(u); }); });
    var css = '';
    for (var i = 0; i < hojas.length; i++) { try { css += await (await fetch(hojas[i])).text(); } catch (e) {} }
    var usadas = {};
    nodos.forEach(function (raiz) { [raiz].concat([].slice.call(raiz.querySelectorAll('*'))).forEach(function (e) { getComputedStyle(e).fontFamily.split(',').forEach(function (f) { usadas[f.trim().replace(/['"]/g, '').toLowerCase()] = 1; }); }); });
    var out = [], bloques = css.split('@font-face').slice(1);
    for (var j = 0; j < bloques.length; j++) {
      var b = '@font-face' + bloques[j], fam = b.match(/font-family:\s*'([^']+)'/), u = b.match(/url\((https:[^)]+)\)/);
      if (!fam || !u || !usadas[fam[1].toLowerCase()]) continue;
      if (/unicode-range/.test(b) && !/U\+0000-00FF/i.test(b)) continue;
      try { out.push(b.replace(u[1], await aDato(await (await fetch(u[1])).blob()))); } catch (e) {}
    }
    return out.join('\n');
  }

  /* La librería pierde el apóstrofo de un texto puesto con `content` («LET'S» de
     Lupita salía «LETS»): se cambia por el tipográfico, que pasa bien. */
  function apostrofos() {
    var reglas = '';
    [].forEach.call(E.port.querySelectorAll('*'), function (e, i) {
      ['::before', '::after'].forEach(function (ps) {
        var c = getComputedStyle(e, ps).content;
        if (c && c !== 'none' && c.indexOf("'") >= 0 && /^".*"$/.test(c)) {
          e.setAttribute('data-std-ap', i);
          reglas += '[data-std-ap="' + i + '"]' + ps + '{content:' + c.replace(/'/g, '’') + '!important}';
        }
      });
    });
    if (reglas) { var s = document.createElement('style'); s.textContent = reglas; document.head.appendChild(s); }
  }

  async function capturar() {
    await preparar();
    await cargarLib();
    await congelarVideos();
    apostrofos();
    window.scrollTo(0, 0);
    var port = E.port;
    var fijos = [].filter.call(document.body.querySelectorAll('*'), function (e) {
      var c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden') return false;
      var r = e.getBoundingClientRect(); return r.width * r.height >= 160 * 160 || e === E.std;
    });
    var css = CSS_LETRAS || (CSS_LETRAS = await letras([port].concat(fijos)));   /* una vez: no cambian */
    var vale = function (n) {
      if (n.nodeType !== 1) return true;
      if (n.tagName === 'IFRAME' || n.tagName === 'VIDEO') return false;
      return n === port || port.contains(n) || n.contains(port) || fijos.some(function (f) { return f === n || f.contains(n) || n.contains(f); });
    };
    return await window.modernScreenshot.domToBlob(document.body, {
      width: 360, height: 640, scale: 3, type: 'image/jpeg', quality: 0.93, style: { margin: '0', padding: '0' },
      timeout: 15000, font: { cssText: css }, filter: vale
    });
  }

  /* congela los videos de adentro de `raiz` (para el recuerdo, sección por sección):
     el cuadro actual, o el póster si el video todavía no cargó */
  async function congelarEn(raiz) {
    var vids = [].slice.call(raiz.querySelectorAll('video'));
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i], url = null;
      try { if (v.videoWidth) url = await cuadro(v); } catch (e) {}
      if (!url && v.poster) url = v.poster;
      if (!url) continue;
      var im = new Image(); im.crossOrigin = 'anonymous'; im.src = url; im.className = v.className; im.style.cssText = v.style.cssText;
      var cs = getComputedStyle(v);
      ['position', 'inset', 'top', 'left', 'right', 'bottom', 'width', 'height', 'object-fit', 'object-position', 'transform', 'filter', 'opacity', 'z-index', 'border-radius', 'display'].forEach(function (p) { im.style.setProperty(p, cs.getPropertyValue(p)); });
      try { await im.decode(); } catch (e) {}
      v.replaceWith(im);
    }
  }

  window.INVSTD = { preparar: preparar, armar: function (d) { armar(d); }, capturar: capturar, auto: function () { return AUTO && Object.assign({}, AUTO); },
    /* lo usa efectos/recuerdo.js (la invitación entera): mismas trampas, un solo lugar */
    util: { silenciar: silenciar, abrirSobre: abrirSobre, quieta: quieta, cargarLib: cargarLib, letras: letras, congelarEn: congelarEn, esperar: esperar } };
})();
