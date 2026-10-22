/* ===== LA TRIVIA SE LEE EN LAS INVITACIONES CLARAS (22/10/2026) ===============
   Maki: «donde está la trivia se va como a blanco y no se ven bien las letras.
   Pasa en todas las invitaciones, en las muestras también».

   POR QUÉ: el motor (congelado) dibuja las respuestas (`.topt`) pensando en una
   sección OSCURA: letra blanca, fondo blanco al 8 %, borde blanco al 20 %. En
   las colecciones claras (Noche estrellada, Bohemia, Marfil…) eso es blanco
   sobre blanco. Lo mismo pasa con textos que el motor agrega después
   (pregunta, puntaje, ranking) si salen en blanco.

   QUÉ HACE: mira el color del título de la sección. Si es oscuro (= la sección
   es clara), pone las respuestas en una tarjeta clara con la tinta del título,
   y cualquier texto casi blanco de la trivia pasa a esa tinta. Correcta e
   incorrecta conservan su verde y su rojo, con letra blanca. En las secciones
   oscuras no toca nada. Vigila la trivia porque el motor la redibuja en cada
   pregunta. Corre también en la miniatura.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invTriviaLegible) return; window.__invTriviaLegible = 1;
  if (!/\/i\//.test(location.pathname)) return;

  function rgb(s) { var m = String(s).match(/[\d.]+/g); return m ? m.slice(0, 4).map(Number) : null; }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  var CSS =
    '[data-sec="trivia"].tv-claro .topt{background:rgba(255,255,255,.80)!important;border:1px solid rgba(0,0,0,.12)!important;' +
      'color:var(--tv-tinta)!important;-webkit-text-fill-color:var(--tv-tinta)!important;box-shadow:0 1px 6px rgba(0,0,0,.06)}' +
    '[data-sec="trivia"].tv-claro .topt:hover{background:rgba(255,255,255,.92)!important}' +
    '[data-sec="trivia"].tv-claro .topt.ok{background:#4d6a4f!important;border-color:#7fbf86!important;color:#fff!important;-webkit-text-fill-color:#fff!important}' +
    '[data-sec="trivia"].tv-claro .topt.bad{background:#7d3d47!important;border-color:#c07684!important;color:#fff!important;-webkit-text-fill-color:#fff!important}';

  var pintando = false;
  function aplicar() {
    var s = document.querySelector('[data-sec="trivia"]'); if (!s) return;
    var h = s.querySelector('h2'); if (!h) return;
    var t = rgb(getComputedStyle(h).color); if (!t) return;
    if (lum(t) > 0.45) { s.classList.remove('tv-claro'); return; }   /* sección oscura: así está bien */
    if (!document.getElementById('inv-trivia-legible')) {
      var st = document.createElement('style'); st.id = 'inv-trivia-legible'; st.textContent = CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    pintando = true;
    var tinta = 'rgb(' + t.slice(0, 3).join(',') + ')';
    s.style.setProperty('--tv-tinta', tinta);
    s.classList.add('tv-claro');
    /* textos sueltos casi blancos (pregunta, puntaje, ranking…), fuera de botones con fondo propio */
    [].forEach.call(s.querySelectorAll('.trivia *'), function (e) {
      if (e.closest('.topt') || e.closest('.btn, button:not(.topt)')) return;
      if (!e.childNodes.length || ![].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); })) return;
      var c = rgb(getComputedStyle(e).color);
      if (c && (c[3] === undefined || c[3] > 0.3) && lum(c) > 0.75) {
        e.style.setProperty('color', tinta, 'important');
        e.style.setProperty('-webkit-text-fill-color', tinta, 'important');
      }
    });
    pintando = false;
  }

  var vigilada = null;
  function vigilar() {
    var s = document.querySelector('[data-sec="trivia"]');
    if (!s || s === vigilada || !window.MutationObserver) return;
    vigilada = s;
    new MutationObserver(function () { if (!pintando) setTimeout(aplicar, 30); })
      .observe(s, { childList: true, subtree: true });
  }
  function paso() { vigilar(); aplicar(); }
  var n = 0, iv = setInterval(function () { paso(); if (++n > 40) clearInterval(iv); }, 400);
  window.addEventListener('message', function () { setTimeout(paso, 120); setTimeout(paso, 700); });
})();
