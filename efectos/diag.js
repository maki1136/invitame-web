/* ===== DIAGNÓSTICO EN UN APARATO REAL (3/10/2026) — se carga sólo con &diag=1.
   Ver /diag.php. Mide sin tocar nada de la invitación. */
(function () {
  'use strict';
  var T0 = Date.now(), id = Math.random().toString(36).slice(2, 8);
  var ev = [], errs = [], lag = [], peor = 0, cuadros = 0, trabas = 0;
  function t() { return Date.now() - T0; }
  function marca(n) { ev.push(n + '@' + t()); }
  var recargas = 0;
  try { recargas = +(sessionStorage.getItem('diagN') || 0); sessionStorage.setItem('diagN', recargas + 1); } catch (e) {}
  addEventListener('error', function (e) { errs.push((e.message || (e.target && (e.target.src || e.target.href)) || '?').slice(0, 160) + '@' + t()); }, true);
  addEventListener('unhandledrejection', function (e) { errs.push('promesa: ' + String(e.reason).slice(0, 160)); });
  document.addEventListener('DOMContentLoaded', function () { marca('dom'); });
  addEventListener('load', function () { marca('load'); });
  document.addEventListener('visibilitychange', function () { marca('vis-' + document.visibilityState); });
  addEventListener('pagehide', function () { marca('pagehide'); mandar('salida'); });
  /* la pantalla: cada cuadro, cuánto tardó */
  var ult = performance.now();
  function cuadro(n) {
    var d = n - ult; ult = n; cuadros++;
    if (d > peor) peor = d;
    if (d > 250) trabas++;
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
  /* el hilo principal: un reloj cada 200 ms */
  var esp = Date.now() + 200;
  setInterval(function () { var a = Date.now() - esp; if (a > 150) lag.push(a + '@' + t()); esp = Date.now() + 200; }, 200);
  /* lo que se ve */
  var vistos = {};
  setInterval(function () {
    var env = document.getElementById('env');
    if (env && /\bgone\b/.test(env.className) && !vistos.gone) { vistos.gone = 1; marca('sobre-abierto'); }
    if (env && /\blisto\b/.test(env.className) && !vistos.listo) { vistos.listo = 1; marca('sobre-listo'); }
  }, 250);
  document.addEventListener('click', function (e) { marca('toque:' + ((e.target && (e.target.id || e.target.className)) || '').toString().slice(0, 30)); }, true);
  function estado() {
    var vids = [].map.call(document.querySelectorAll('video'), function (v) {
      return (v.paused ? 'p' : 'PLAY') + ' rs' + v.readyState + ' ' + v.videoWidth + 'x' + v.videoHeight + ' ' + String(v.currentSrc || v.src).slice(-45);
    });
    var res = performance.getEntriesByType('resource');
    var lentos = res.filter(function (r) { return r.duration > 1500; }).map(function (r) {
      return Math.round(r.duration) + 'ms ' + Math.round((r.transferSize || 0) / 1024) + 'KB ' + r.name.slice(-70);
    }).slice(0, 25);
    var bytes = res.reduce(function (a, r) { return a + (r.transferSize || 0); }, 0);
    var nav = performance.getEntriesByType('navigation')[0] || {};
    return {
      id: id, t: t(), recargas: recargas, ua: navigator.userAgent.slice(0, 140), pantalla: innerWidth + 'x' + innerHeight + '@' + devicePixelRatio,
      tactil: matchMedia('(any-pointer: coarse)').matches, cache: !!window.INV_CACHE_MEDIOS,
      html_ms: Math.round(nav.responseEnd || 0), pedidos: res.length, MB: +(bytes / 1048576).toFixed(2),
      cuadros: cuadros, peorCuadro: Math.round(peor), trabas: trabas, lag: lag.slice(-30), ev: ev, errs: errs.slice(0, 20),
      videos: vids, iframes: document.querySelectorAll('iframe').length, lentos: lentos, scroll: Math.round(scrollY)
    };
  }
  function mandar(cuando) {
    var o = estado(); o.cuando = cuando;
    var s = JSON.stringify(o);
    try { if (navigator.sendBeacon && navigator.sendBeacon('/diag.php', s)) return; } catch (e) {}
    try { fetch('/diag.php', { method: 'POST', body: s, keepalive: true }); } catch (e) {}
  }
  [3, 8, 15, 25, 40, 60, 90, 120].forEach(function (s) { setTimeout(function () { mandar(s + 's'); }, s * 1000); });
  window.INVDIAG = { estado: estado, mandar: mandar };
})();
