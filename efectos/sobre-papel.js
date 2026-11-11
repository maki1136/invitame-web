/* ===== SOBRE · TEXTO IMPRESO EN EL PAPEL DEL VIDEO (11/11/2026) ================
   Maki, 11/11: «la idea es que se pueda poner un texto en los papeles blancos,
   si no queda así suelto… dejarlo armado en la plataforma para que las chicas
   puedan agregarlo».

   Los sobres en video de la Línea Roja (White Swan, Monogramme, Pasarela)
   muestran una tarjeta en blanco. El video NO se toca —sigue siendo genérico y
   sirve para cualquier invitación—: encima va una capa con el texto que SIGUE a
   la tarjeta cuadro por cuadro, con perspectiva (matrix3d), y se mezcla con el
   papel (multiply) para que se vea impreso.

   EL SEGUIMIENTO — en la ficha del sobre (sobres/catalogo.js), `papel`:
     k       : [[t, x1,y1, x2,y2, x3,y3, x4,y4], …]  esquinas del recuadro de texto
               (arriba-izq, arriba-der, abajo-der, abajo-izq), en fracción del
               cuadro del video (0–1). Se midió con flujo óptico, cuadro por cuadro.
     o       : [[t, opacidad], …]   cuándo aparece y cuándo se va
     aspecto : ancho/alto del recuadro
     linea1, fuente, fuenteChica, color : lo que va si la invitación no elige nada

   EL DATO — fx.estiloSec.sobreTexto (panel → PRINCIPAL → «Sobre · texto en la
   tarjeta del video»):
     on            : true → se muestra
     l1, l2, l3    : arriba (chico), nombres (grande), fecha. Vacíos = automáticos:
                     l1 la frase del sobre, l2 los nombres, l3 la fecha del evento
     fuente, color, tam (porcentaje 60–140)
   ⚠️ Sin `on` NO HACE NADA, y sin `papel` en la ficha tampoco: ninguna
      invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invSobrePapel) return; window.__invSobrePapel = 1;

  var ID = 'env-papel', W0 = 1000;
  function ev() { return window.INVEV || {}; }
  function cfg() { try { return ((ev().fx || {}).estiloSec || {}).sobreTexto || {}; } catch (e) { return {}; } }
  function si(v) { return v === true || v === 'true' || v === 1; }
  function modelo() {
    try {
      var m = location.search.match(/[?&]sobre=([^&]+)/); if (m) return decodeURIComponent(m[1]);
      m = location.search.match(/[?&]s=([^&]+)/); if (m && /\/sobres\//.test(location.pathname)) return decodeURIComponent(m[1]);
    } catch (e) {}
    return ((ev().fx || {}).sobre || {}).modelo || '';
  }
  function ficha() { var c = window.SOBRES_INVITAME || {}; return c[modelo()] || null; }
  function limpio(v, n) { return String(v == null ? '' : v).replace(/[<>]/g, '').slice(0, n || 80); }
  function hex(v) { v = String(v || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(v) ? v : ''; }
  function fuenteOk(v) { return String(v || '').trim().replace(/["<>;{}]/g, ''); }

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function fechaAuto() {
    var f = String(ev().fecha || ''), m = f.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return '';
    return parseInt(m[3], 10) + ' · ' + m[2] + ' · ' + m[1];
  }
  function nombresAuto() {
    var e = ev(), a = limpio(e.n1, 40).trim(), b = limpio(e.n2, 40).trim();
    return a && b ? a + ' & ' + b : (a || b || 'Nuestra Boda');
  }

  var cargadas = {};
  function cargarFuente(f) {
    if (!f) return Promise.resolve();
    if (cargadas[f]) return cargadas[f];
    cargadas[f] = new Promise(function (ok) {
      try {
        var l = document.createElement('link'); l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':ital,wght@0,400;0,500;0,600;0,700;1,400&display=block';
        l.onload = ok; l.onerror = ok;
        document.head.appendChild(l);
      } catch (e) { ok(); }
    });
    return cargadas[f];
  }

  /* cuadrado unidad → cuadrilátero (Heckbert) */
  function homografia(q) {
    var x0 = q[0], y0 = q[1], x1 = q[2], y1 = q[3], x2 = q[4], y2 = q[5], x3 = q[6], y3 = q[7];
    var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    var a, b, c, d, e, f, g, h;
    if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) { a = x1 - x0; b = x2 - x1; c = x0; d = y1 - y0; e = y2 - y1; f = y0; g = 0; h = 0; }
    else {
      var det = dx1 * dy2 - dx2 * dy1; if (Math.abs(det) < 1e-12) return null;
      g = (dx3 * dy2 - dx2 * dy3) / det; h = (dx1 * dy3 - dx3 * dy1) / det;
      a = x1 - x0 + g * x1; b = x3 - x0 + h * x3; c = x0; d = y1 - y0 + g * y1; e = y3 - y0 + h * y3; f = y0;
    }
    return [a, b, c, d, e, f, g, h];
  }
  function interp(k, t, n) {
    if (!k || !k.length) return null;
    if (t <= k[0][0]) return t < k[0][0] - 0.05 ? null : k[0].slice(1);
    var u = k[k.length - 1]; if (t >= u[0]) return t > u[0] + 0.05 ? null : u.slice(1);
    for (var i = 1; i < k.length; i++) if (k[i][0] >= t) {
      var A = k[i - 1], B = k[i], r = (t - A[0]) / ((B[0] - A[0]) || 1), o = [];
      for (var j = 1; j <= n; j++) o.push(A[j] + (B[j] - A[j]) * r);
      return o;
    }
    return null;
  }

  /* ★ 11/11 (Maki: «aparece en una tipografía y pasa a otra»): el texto NO se
     muestra hasta que sus letras están bajadas. Si en 5 s no llegan, se muestra igual. */
  var fuentesListas = {};
  function esperarFuentes(clave, fG, fC) {
    if (fuentesListas[clave]) return fuentesListas[clave] === 2;
    fuentesListas[clave] = 1;
    var hecho = function () { if (fuentesListas[clave] !== 2) { fuentesListas[clave] = 2; firma = ''; } };
    var probar = ['400 100px "' + fG + '"', '600 50px "' + fC + '"', '400 50px "' + fC + '"'];
    /* primero la hoja de Google (si no, fonts.load contesta «listo» sin nada), después las letras */
    Promise.all([cargarFuente(fG), cargarFuente(fC)]).then(function () {
      return Promise.all(probar.map(function (f) { try { return document.fonts.load(f, 'NuestraBoda 0123'); } catch (e) { return null; } }));
    }).then(function () {
      var n = 0, mirar = function () {
        var ok = true; try { ok = probar.every(function (f) { return document.fonts.check(f, 'NuestraBoda'); }); } catch (e) {}
        if (ok || ++n > 40) hecho(); else setTimeout(mirar, 100);
      };
      mirar();
    }, hecho);
    setTimeout(hecho, 6000);
    return false;
  }

  /* los nombres en UNA línea: se achican hasta entrar en el ancho de la tarjeta */
  function ajustar() {
    if (!caja) return;
    var n = caja.querySelector('.pp-nombres'); if (!n) return;
    var max = W0 * 0.86, fs = parseFloat(n.style.fontSize) || 150, i = 0;
    while (n.scrollWidth > max && fs > 40 && i++ < 40) { fs *= 0.94; n.style.fontSize = Math.round(fs) + 'px'; }
  }

  var caja = null, firma = '', H0 = 600, listo = false;
  function armar(env, F, c) {
    var asp = Number((F.papel || {}).aspecto) || 1.5; H0 = Math.round(W0 / asp);
    var col = hex(c.color) || hex(F.papel.color) || '#3a2a22';
    var fG = fuenteOk(c.fuente) || F.papel.fuente || 'Cormorant Garamond';
    var fC = F.papel.fuenteChica || 'Cormorant Garamond';
    var tam = Math.max(60, Math.min(160, Number(c.tam) || Number(F.papel.tam) || 100)) / 100;
    var l1 = limpio(c.l1).trim() || F.papel.linea1 || ev().kick || '';
    var l2 = limpio(c.l2).trim() || nombresAuto();
    var l3 = limpio(c.l3).trim() || fechaAuto();
    var nueva = [modelo(), col, fG, fC, tam, l1, l2, l3, H0].join('|');
    listo = esperarFuentes(fG + '|' + fC, fG, fC);
    if (caja && firma === nueva && caja.parentNode === env) return;
    firma = nueva;
    if (!caja) { caja = document.createElement('div'); caja.id = ID; caja.setAttribute('aria-hidden', 'true'); }
    if (caja.parentNode !== env) env.appendChild(caja);
        caja.style.cssText = 'position:fixed;left:0;top:0;width:' + W0 + 'px;height:' + H0 + 'px;transform-origin:0 0;' +
      'z-index:4;pointer-events:none;opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'gap:' + Math.round(H0 * 0.045) + 'px;padding:0 6%;box-sizing:border-box;text-align:center;color:' + col + ';' +
      'mix-blend-mode:multiply;will-change:transform,opacity;backface-visibility:hidden;';
    /* el motor esconde todo lo de #env que no conoce (visibility:hidden !important): la tarjeta se pide visible */
    if (!document.getElementById(ID + '-css')) {
      var st = document.createElement('style'); st.id = ID + '-css';
      st.textContent = 'html body #env:not(.gone) #' + ID + ', html body #env:not(.gone) #' + ID + ' *{visibility:visible!important}';
      document.head.appendChild(st);
    }
    var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
    var trazo = 'paint-order:stroke fill;-webkit-text-stroke:' + (fG.match(/script|vibes|pinyon|allura|parisienne|tangerine|alex|italianno|great/i) ? 3 : 1.4) + 'px currentColor;';
    caja.innerHTML =
      (l1 ? '<div style="font-family:\'' + fC + '\',Georgia,serif;font-size:' + Math.round(54 * tam) + 'px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;line-height:1.1;white-space:nowrap">' + esc(l1) + '</div>' : '') +
      '<div class="pp-nombres" style="font-family:\'' + fG + '\',\'Cormorant Garamond\',Georgia,serif;font-size:' + Math.round(200 * tam) + 'px;line-height:1.1;font-weight:400;white-space:nowrap;' + trazo + '">' + esc(l2) + '</div>' +
      (l3 ? '<div style="width:' + Math.round(W0 * 0.18) + 'px;height:3px;background:currentColor;opacity:.7"></div>' +
        '<div style="font-family:\'' + fC + '\',Georgia,serif;font-size:' + Math.round(60 * tam) + 'px;letter-spacing:.18em;font-weight:600;white-space:nowrap">' + esc(l3) + '</div>' : '');
    ajustar();
  }

  function rectVideo(vid, F) {
    var r = vid.getBoundingClientRect(); if (!r.width) r = { left: 0, top: 0, width: innerWidth, height: innerHeight };
    var vw = vid.videoWidth || F.papel.w || 1080, vh = vid.videoHeight || F.papel.h || 1920;
    var fit = getComputedStyle(vid).objectFit;
    var s = fit === 'contain' ? Math.min(r.width / vw, r.height / vh) : Math.max(r.width / vw, r.height / vh);
    return { x: r.left + (r.width - vw * s) / 2, y: r.top + (r.height - vh * s) / 2, w: vw * s, h: vh * s };
  }

  function cuadro() {
    var env = document.getElementById('env'), F = ficha(), c = cfg();
    var vale = env && F && F.papel && si(c.on) && !env.classList.contains('gone');
    if (!vale) { if (caja && caja.parentNode) caja.parentNode.removeChild(caja); return; }
    armar(env, F, c);
    var vid = document.getElementById('env-vid');
    var t = vid && !vid.paused ? vid.currentTime : (vid ? vid.currentTime || 0 : 0);
    var q = interp(F.papel.k, t, 8), op = interp(F.papel.o, Math.max(t, F.papel.o[0][0]), 1);
    if (!q || !vid) { caja.style.opacity = '0'; return; }
    var R = rectVideo(vid, F), p = [];
    for (var i = 0; i < 8; i += 2) { p.push(R.x + q[i] * R.w, R.y + q[i + 1] * R.h); }
    var m = homografia(p); if (!m) return;
    var a = m[0] / W0, d = m[3] / W0, g = m[6] / W0, b = m[1] / H0, e = m[4] / H0, h = m[7] / H0;
    caja.style.transform = 'matrix3d(' + [a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, m[2], m[5], 0, 1].join(',') + ')';
    if (!listo) { caja.style.opacity = '0'; return; }
    ajustar();
    caja.style.opacity = String(op ? Math.max(0, Math.min(1, op[0])) : 0);
  }

  function bucle() {
    try { cuadro(); } catch (e) {}
    var env = document.getElementById('env');
    if (env && env.classList.contains('gone')) { if (caja && caja.parentNode) caja.parentNode.removeChild(caja); return; }
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);
  addEventListener('message', function () { firma = ''; });
})();
