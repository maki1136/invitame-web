/* ==========================================================================
   efectos/musica-al-toque.js — 29/9/2026
   ------------------------------------------------------------------------
   Maki: «la canción tarda en comenzar, tiene que ser automático eso»
         «tarda como 5 segundos en comenzar realmente que se escucha el
          instrumento y yo quiero que arranque cuando canta»

   Medido en elena-y-rodrigo: del toque al sobre hasta que YouTube empieza a
   sonar pasaban 2,4 s SÓLO DE CARGA (el motor creaba el reproductor recién
   con el toque), y después venía la intro instrumental del tema (~25 s hasta
   el primer verso en «Make You Feel My Love»).

   Dos arreglos, los dos automáticos, para TODAS las invitaciones:

   1) PRECARGA. Apenas se sabe la canción (con el sobre todavía cerrado) se
      arma el reproductor de YouTube, PAUSADO y fuera de la pantalla. Al tocar
      el sobre sólo se le dice «play»: no hay carga en el medio.

   2) ARRANCA CUANDO CANTA. Con el título del video (oEmbed de YouTube) se
      busca la letra SINCRONIZADA en LRCLIB (base abierta y gratuita de letras
      con tiempos). El primer verso dice en qué segundo empieza a cantar. Si
      el video dura más que la pista (intro de video), se corre por la
      diferencia. No se baja ni se toca el audio: sólo se lee la letra.
      Se guarda por video en localStorage para no volver a buscar.
      ⚠️ Si el link trae "?t=" / "&start=" (puesto a mano), MANDA EL LINK.
      ⚠️ Si no hay letra sincronizada o las duraciones no cierran (±20 s),
         arranca desde el principio, como antes.

   El motor (i/index.html, congelado por versión) no se toca: este módulo le
   saca "window.__musicaYT" para que no arme su propio reproductor, y se queda
   con la bocina. Si algo falla antes de sonar, la bocina rearma el
   reproductor con el toque (el mismo camino que usaba el motor, que en iOS es
   el que vale).
   ========================================================================== */
(function () {
  'use strict';
  if (window.__musicaAlToque) return;
  window.__musicaAlToque = true;

  var ID = null, SEG = 0, MANUAL = false;
  var frame = null, listo = false, dur = 0, desde = null;
  var pedido = false, sonando = false, pausada = false, calculando = false;
  window.__musicaCanta = null;               /* para el chequeo: segundo elegido */

  function $(id) { return document.getElementById(id); }
  function cmd(f, args) {
    if (!frame) return;
    try { frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: f, args: args || [] }), '*'); } catch (e) {}
  }
  function bocina(on) {
    var b = $('music'); if (!b) return;
    b.classList.toggle('paused', !on);
  }

  /* ---------- 1 · el reproductor, armado antes del toque ---------- */
  function armar(autoplay, seg) {
    if (frame) { frame.remove(); frame = null; }
    listo = false; sonando = false;
    frame = document.createElement('iframe');
    frame.title = 'Música de fondo';
    frame.setAttribute('allow', 'autoplay');
    frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;border:0;pointer-events:none';
    frame.addEventListener('load', function () {
      try { frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) {}
    });
    var s = Math.max(0, Math.round(seg || 0));
    frame.src = 'https://www.youtube-nocookie.com/embed/' + ID +
      '?enablejsapi=1&autoplay=' + (autoplay ? 1 : 0) + '&loop=1&playlist=' + ID +
      '&controls=0&playsinline=1' + (s ? '&start=' + s : '');
    document.body.appendChild(frame);
  }

  window.addEventListener('message', function (m) {
    if (!frame || m.source !== frame.contentWindow) return;
    var d; try { d = JSON.parse(m.data); } catch (e) { return; }
    if (!d) return;
    if (d.event === 'onReady') {
      listo = true;
      if (!MANUAL) calcular();
      if (pedido && !pausada) sonar();
    } else if (d.event === 'onStateChange') {
      if (d.info === 1) { sonando = true; bocina(true); }
    } else if (d.event === 'infoDelivery' && d.info) {
      /* la duración del video llega recién cuando suena: ahí se afina */
      if (d.info.duration && !dur) { dur = +d.info.duration; if (!MANUAL) afinar(); }
      if (d.info.playerState === 1) sonando = true;
      /* si el segundo del verso llegó tarde, se salta la intro igual */
      if (sonando && desde && d.info.currentTime != null && d.info.currentTime < desde - 1.5) {
        cmd('seekTo', [desde, true]);
      }
    } else if (d.event === 'onError') {
      window.__musicaYTerror = d.info;       /* 101/150: el sello no deja incrustar */
      if (typeof CONFIG !== 'undefined') CONFIG.musica = false;
      var b = $('music'); if (b) b.style.display = 'none';
      if (frame) { frame.remove(); frame = null; }
    }
  }, false);

  function sonar() {
    if (!frame) return;
    if (desde) cmd('seekTo', [desde, true]);
    cmd('unMute'); cmd('setVolume', [100]); cmd('playVideo');
  }

  /* ---------- 2 · el segundo en que empieza a cantar ---------- */
  function limpiarTitulo(t) {
    return String(t || '')
      .replace(/\(([^)]*?(official|oficial|video|v[ií]deo|audio|lyric|letra|visualizer|hd|4k|remaster)[^)]*?)\)/gi, ' ')
      .replace(/\[([^\]]*?)\]/g, ' ')
      .replace(/\b(official|oficial)\s+(music\s+)?(video|v[ií]deo|audio)\b/gi, ' ')
      .replace(/\s+(ft\.?|feat\.?)\s+.*$/i, ' ')
      .replace(/[|｜].*$/, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function primerVerso(lrc) {
    var ls = String(lrc || '').split('\n');
    for (var i = 0; i < ls.length; i++) {
      var m = ls[i].match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
      if (m && m[3].trim() && !/^[♪\s]*$/.test(m[3])) return (+m[1]) * 60 + (+m[2]);
    }
    return null;
  }
  /* Se elige la versión de la letra y el segundo del primer verso.
     Antes de sonar, YouTube no dice cuánto dura el video: se toma la versión
     del MEDIO (la mediana del primer verso entre las que hay). Cuando suena y
     llega la duración, "afinar()" elige la versión de duración más parecida y,
     si el video trae una intro más larga que la pista, corre por la diferencia. */
  var LISTA = null;
  function segundoDe(c, d) {
    var v = primerVerso(c.syncedLyrics); if (v == null) return null;
    var corre = d ? d - c.duration : 0;
    var s = v + (corre > 3 && corre <= 20 ? corre : 0) - 1.2;
    return s < 3 ? 0 : Math.round(s * 10) / 10;
  }
  function elegir() {
    var cs = (LISTA || []).filter(function (c) { return c && c.syncedLyrics && c.duration && primerVerso(c.syncedLyrics) != null; });
    if (!cs.length) return 0;
    if (dur) {
      var mejor = null, dif = 1e9;
      cs.forEach(function (c) { var x = Math.abs(dur - c.duration); if (x < dif) { dif = x; mejor = c; } });
      return dif <= 20 ? segundoDe(mejor, dur) : 0;
    }
    cs.sort(function (a, b) { return primerVerso(a.syncedLyrics) - primerVerso(b.syncedLyrics); });
    return segundoDe(cs[Math.floor(cs.length / 2)], 0);
  }
  function poner(s) {
    var antes = desde; desde = s; window.__musicaCanta = s;
    try { localStorage.setItem('invCanta_' + ID, String(s)); } catch (e) {}
    if (sonando && s && (antes == null || Math.abs(antes - s) > 2)) cmd('seekTo', [s, true]);
  }
  function afinar() { if (LISTA) poner(elegir()); }
  function calcular() {
    if (calculando || desde != null) return;
    try {
      var g = localStorage.getItem('invCanta_' + ID);
      if (g !== null) { desde = +g || 0; window.__musicaCanta = desde; }
    } catch (e) {}
    calculando = true;
    fetch('https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=' + ID)
      .then(function (r) { return r.json(); })
      .then(function (oe) {
        return fetch('https://lrclib.net/api/search?q=' + encodeURIComponent(limpiarTitulo(oe.title)))
          .then(function (r) { return r.json(); });
      })
      .then(function (lista) { LISTA = Array.isArray(lista) ? lista : []; poner(elegir()); })
      .catch(function () { if (desde == null) { desde = 0; window.__musicaCanta = 0; } })
      .then(function () { calculando = false; });
  }

  document.addEventListener('click', function (e) {
    if (!ID) return;
    var t = e.target;
    var enSobre = t && t.closest && t.closest('#env');
    var enBocina = t && t.closest && t.closest('#music');
    if (enSobre && !pedido) {
      pedido = true; pausada = false;
      if (listo) sonar();
      /* si a los 4 s no sonó (iOS a veces no deja), la bocina queda apagada
         para que el invitado la toque: ese toque sí vale. */
      setTimeout(function () { if (!sonando) bocina(false); }, 4000);
      return;
    }
    if (enBocina) {
      e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
      if (sonando && !pausada) { pausada = true; cmd('pauseVideo'); bocina(false); return; }
      pausada = false; pedido = true; bocina(true);
      if (sonando) { cmd('playVideo'); return; }
      /* nunca sonó: se rearma CON el toque (autoplay dentro del gesto) */
      armar(true, desde || SEG);
    }
  }, true);

  /* ---------- se engancha con lo que dejó el motor ---------- */
  function mirar() {
    var id = window.__musicaYT;
    if (id && id !== ID) {                       /* canción nueva (o la primera) */
      ID = id; SEG = window.__musicaYTseg || 0; MANUAL = SEG > 0;
      dur = 0; desde = MANUAL ? SEG : null; window.__musicaCanta = desde;
      pedido = false; sonando = false; pausada = false;
      armar(false, SEG);
    }
    if (id) window.__musicaYT = null;            /* el motor no arma el suyo */
  }
  setInterval(mirar, 400);
  mirar();
})();
/* — FIN de efectos/musica-al-toque.js — */
