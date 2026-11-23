/* ===== EL PROBADOR: LA MUESTRA CON LOS DATOS DEL CLIENTE (23/11/2026) ==========

   Maki: «quiero hacer un generador para el cliente de su muestra… que ponga una
   imagen de ellos, sus nombres y su fecha… que vea completa la invi pero que
   aparezca su foto de portada, nombres y fecha. Hasta le puede mandar algo lindo
   a su novio… una raspada de corazón más grande con ese mensaje… y que tenga
   botón de reenviar la muestra: compártela con tu novio, o hija si es XV».

   Lo carga i/index.php SÓLO cuando el link trae `&pr=` y la invitación es una
   MUESTRA. Los datos ya vienen validados por el servidor en window.__probar.

   QUÉ HACE
     1. Cuando el motor recibe el evento, le cambia nombres, fecha (con la hora
        de la muestra), título y foto de portada. NO guarda nada: es sólo esta
        pantalla. La invitación de muestra sigue igual para todos los demás.
     2. Debajo de la portada, un corazón grande para raspar con el mensaje.
     3. Un botón fijo abajo: «Compártela con tu novio» (o «con tu hija»).
   ============================================================================ */
(function () {
  'use strict';
  var P = window.__probar;
  if (!P || window.__invProbador) return;
  window.__invProbador = 1;

  /* ---------- 1. los datos en el evento, en el momento en que llega ---------- */
  /* ★ 23/11 (Jazmín: «hay que quitarle el nombre de esos novios»): los nombres de
     la muestra aparecen también en el pase, el cierre, la carta, el hashtag…
     Se cambian en TODO el evento y en la página por los del cliente. */
  var CAMBIOS = [];
  function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function prepararCambios(ev) {
    var viejos = [[ev.n1, P.n1], [ev.n2, P.n2 || P.n1]];
    String(ev.titulo || '').split(/\s*(?:&|\by\b|·|,)\s*/).forEach(function (x, i) { viejos.push([x, i === 0 ? P.n1 : (P.n2 || P.n1)]); });
    viejos.forEach(function (v) {
      var a = String(v[0] || '').trim();
      if (a.length < 3 || a.toLowerCase() === String(v[1] || '').toLowerCase()) return;
      if (CAMBIOS.some(function (c) { return c.de === a; })) return;
      CAMBIOS.push({ de: a, a: String(v[1] || ''), re: new RegExp('(^|[^\\wÀ-ÿ])(' + escRe(a) + ')(?![\\wÀ-ÿ])', 'gi') });
    });
  }
  function reemplazar(s) {
    if (typeof s !== 'string' || !s || /^https?:\/\//.test(s)) return s;
    CAMBIOS.forEach(function (c) {
      s = s.replace(c.re, function (m, pre, nom) { return pre + (nom === nom.toUpperCase() ? c.a.toUpperCase() : c.a); });
      /* y dentro de los hashtags (#ReginaYMateo2027 → #AnaYLuis2027) */
      if (s.indexOf('#') >= 0) {
        var pegado = c.a.replace(/\s+/g, '');
        s = s.replace(/#[0-9A-Za-zÀ-ÿ_]+/g, function (tag) { return tag.replace(new RegExp(escRe(c.de.replace(/\s+/g, '')), 'gi'), pegado); });
      }
    });
    return s;
  }
  function recorrer(o, prof) {
    if (!o || typeof o !== 'object' || prof > 6) return;
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === 'string') o[k] = reemplazar(v);
      else if (v && typeof v === 'object') recorrer(v, prof + 1);
    });
  }
  function limpiarPagina() {
    if (!CAMBIOS.length || !document.body) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName)) continue;
      var v = reemplazar(n.nodeValue);
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }
  function vestir(ev) {
    try {
      if (!ev || typeof ev !== 'object' || (ev.slug && ev.slug !== P.slug)) return;
      if (!CAMBIOS.length) prepararCambios(ev);
      recorrer(ev, 0);
      ev.n1 = P.n1; ev.n2 = P.n2 || '';
      ev.titulo = P.n1 + (P.n2 ? ' & ' + P.n2 : '');
      if (P.fecha) {
        var h = String(ev.fecha || '').slice(10);
        ev.fecha = P.fecha + (h && h.charAt(0) === 'T' ? h : 'T18:00');
      }
      if (P.foto) { ev.cover = P.foto; ev.coverVideo = ''; }
    } catch (e) {}
  }
  var _ev;
  try {
    Object.defineProperty(window, 'INVEV', {
      configurable: true,
      get: function () { return _ev; },
      set: function (v) { vestir(v); _ev = v; }
    });
  } catch (e) {}

  /* ---------- textos según el festejo ---------- */
  var T = String(P.tipo || '');
  var A_QUIEN = T === 'boda' ? 'con tu novio' : T === 'xv' ? 'con tu hija' : 'con quien festeja';
  var TXT_COMP = T === 'boda'
    ? 'Mi amor 💍 mira la invitación que estoy armando para nuestra boda:'
    : T === 'xv' ? 'Mira la invitación que estoy armando para tus XV 👑:'
    : 'Mira la invitación que estoy armando para la fiesta 🎉:';

  function linkLimpio() {
    var u = new URL(location.href);
    ['cb', 'cache', 'preview', 'g', 'rev'].forEach(function (k) { u.searchParams.delete(k); });
    return u.toString();
  }

  /* ---------- 2. el corazón para raspar ---------- */
  var W = 280, H = 258;
  var CORAZON = 'M140 252 C 66 196, 0 142, 0 76 C 0 32, 33 0, 76 0 C 106 0, 128 17, 140 41 C 152 17, 174 0, 204 0 C 247 0, 280 32, 280 76 C 280 142, 214 196, 140 252 Z';

  function estiloDe(sel, prop, porDefecto) {
    var e = document.querySelector(sel);
    if (!e) return porDefecto;
    var v = getComputedStyle(e)[prop];
    return v || porDefecto;
  }

  function armarCorazon() {
    if (!P.msj || document.getElementById('pr-corazon')) return;
    var portada = document.querySelector('.portada');
    if (!portada || !portada.parentNode) return;

    var letraNombre = estiloDe('#pv-names', 'fontFamily', 'cursive');
    var letraTitulo = estiloDe('.sec h2', 'fontFamily', 'serif');
    var colorTitulo = estiloDe('.sec h2', 'color', '#6D1233');

    var sec = document.createElement('section');
    sec.id = 'pr-corazon';
    sec.setAttribute('data-sec', 'probador-corazon');
    sec.style.cssText = 'position:relative;z-index:2;padding:46px 16px 40px;text-align:center;background:transparent';
    sec.innerHTML =
      '<div style="font-family:' + letraTitulo + ';color:' + colorTitulo + ';font-size:26px;line-height:1.2;margin:0 0 6px">Tienes un mensaje</div>' +
      '<div style="font-family:' + letraTitulo + ';color:' + colorTitulo + ';opacity:.75;font-size:14px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 18px">Raspa el corazón</div>' +
      '<div id="pr-caja" style="position:relative;width:' + W + 'px;height:' + H + 'px;margin:0 auto;filter:drop-shadow(0 10px 18px rgba(0,0,0,.18))">' +
        '<div id="pr-fondo" style="position:absolute;inset:0;clip-path:path(\'' + CORAZON + '\');-webkit-clip-path:path(\'' + CORAZON + '\');' +
          'background:radial-gradient(circle at 50% 35%,#fffdf9,#fbefe9);display:flex;align-items:center;justify-content:center;padding:34px 46px 70px;box-sizing:border-box">' +
          '<div id="pr-msj" style="font-family:' + letraNombre + ';color:#5a2a33;font-size:22px;line-height:1.25;overflow-wrap:anywhere"></div>' +
        '</div>' +
        '<canvas id="pr-lienzo" width="' + (W * 2) + '" height="' + (H * 2) + '" style="position:absolute;inset:0;width:' + W + 'px;height:' + H + 'px;touch-action:none;cursor:pointer;transition:opacity .8s"></canvas>' +
      '</div>';
    portada.parentNode.insertBefore(sec, portada.nextSibling);

    var msj = document.getElementById('pr-msj');
    msj.textContent = P.msj;
    /* el mensaje largo se achica para entrar en el corazón */
    var tam = 22;
    while (tam > 13 && msj.scrollHeight > 150) { tam -= 1; msj.style.fontSize = tam + 'px'; }

    var cv = document.getElementById('pr-lienzo'), cx = cv.getContext('2d');
    cx.scale(2, 2);
    var forma = new Path2D(CORAZON);
    var g = cx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#f3c6c8'); g.addColorStop(.45, '#e39aa2'); g.addColorStop(.7, '#f6d3c9'); g.addColorStop(1, '#c9757f');
    cx.fillStyle = g; cx.fill(forma);
    cx.save(); cx.clip(forma);
    for (var i = 0; i < 90; i++) {                /* brillitos */
      cx.fillStyle = 'rgba(255,255,255,' + (Math.random() * .5 + .2) + ')';
      cx.beginPath(); cx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.6 + .4, 0, 7); cx.fill();
    }
    cx.restore();
    cx.fillStyle = '#fff'; cx.textAlign = 'center';
    cx.font = '600 17px Nunito, Helvetica, sans-serif';
    cx.fillText('Raspa aquí', W / 2, H / 2 - 6);
    cx.font = '26px serif'; cx.fillText('♥', W / 2, H / 2 + 26);

    var raspando = false, listo = false, n = 0;
    function punto(e) {
      var r = cv.getBoundingClientRect();
      var t = e.touches ? e.touches[0] : e;
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function raspar(e) {
      if (!raspando || listo) return;
      if (e.cancelable) e.preventDefault();
      var p = punto(e);
      cx.globalCompositeOperation = 'destination-out';
      cx.beginPath(); cx.arc(p[0], p[1], 24, 0, 7); cx.fill();
      if (++n % 8 === 0) medir();
    }
    function medir() {
      var d = cx.getImageData(0, 0, cv.width, cv.height).data, tot = 0, vac = 0;
      for (var i = 3; i < d.length; i += 64) { tot++; if (d[i] < 40) vac++; }
      /* el corazón ocupa ~70 % del cuadro: con la mitad raspada ya se lee */
      if (vac / tot > 0.62) { listo = true; cv.style.opacity = '0'; cv.style.pointerEvents = 'none'; }
    }
    cv.addEventListener('pointerdown', function (e) { raspando = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} raspar(e); });
    cv.addEventListener('pointermove', raspar);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (k) { cv.addEventListener(k, function () { raspando = false; }); });
    cv.addEventListener('touchmove', function (e) { if (raspando && e.cancelable) e.preventDefault(); }, { passive: false });
  }

  /* ---------- 3. «Compártela con tu novio» ---------- */
  function armarBoton() {
    if (document.getElementById('pr-compartir')) return;
    var b = document.createElement('button');
    b.id = 'pr-compartir'; b.type = 'button';
    b.textContent = '💌 Compártela ' + A_QUIEN;
    b.style.cssText = 'position:fixed;left:16px;bottom:18px;z-index:99990;max-width:calc(100% - 100px);' +
      'padding:13px 20px;border:0;border-radius:999px;background:#6D1233;color:#fff;font:700 15px Nunito,Helvetica,Arial,sans-serif;' +
      'box-shadow:0 8px 22px rgba(73,17,26,.35);cursor:pointer;opacity:0;transform:translateY(16px);transition:opacity .5s,transform .5s';
    b.addEventListener('click', function () {
      var url = linkLimpio();
      if (navigator.share) {
        navigator.share({ title: document.title, text: TXT_COMP, url: url }).catch(function () {});
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(TXT_COMP + ' ' + url), '_blank');
      }
    });
    document.body.appendChild(b);
    function mostrar() {
      var abierta = document.body.classList.contains('inv-open') ||
                    !document.getElementById('env') || getComputedStyle(document.getElementById('env')).display === 'none';
      if (abierta) { b.style.opacity = '1'; b.style.transform = 'none'; return true; }
      return false;
    }
    var k = setInterval(function () { if (mostrar()) clearInterval(k); }, 500);
  }

  function arrancar() {
    var n = 0;
    var t = setInterval(function () {
      if (window.INVEV) { armarCorazon(); armarBoton(); limpiarPagina(); }
      if (document.getElementById('pr-corazon') || ++n > 60) { if (document.getElementById('pr-compartir') || n > 60) clearInterval(t); }
    }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
  /* los módulos siguen escribiendo un rato (pase, cierre, trivia): se repasa */
  var rep = 0, tr = setInterval(function () { limpiarPagina(); if (++rep > 40) clearInterval(tr); }, 1500);
})();
