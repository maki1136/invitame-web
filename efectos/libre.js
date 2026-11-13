/* ===== SECCIONES LIBRES ==========================================================
   13/11/2026 — Jazmín: «Tendría que haber un sector libre para cuando piden
   algo así diferente». Dos secciones en blanco que se arman desde el panel:
     fx.libre  y  fx.libre2 = { encendido, kick, titulo, texto, imagen, boton, link }
   Panel: efectos/panel-libre.js (pestaña PRINCIPAL, junto al cierre).
   Se visten como cualquier sección (sn-sec + .kick + h2), así cada colección
   las pinta sola. Apagada o vacía → no existe en el DOM. Por defecto van antes
   de «Confirmar asistencia», salvo que «Orden de las secciones» diga otra cosa.
   ============================================================================ */
(function () {
  'use strict';
  var KEYS = ['libre', 'libre2'];
  function css() {
    if (document.getElementById('sn-libre-css')) return;
    var st = document.createElement('style'); st.id = 'sn-libre-css';
    st.textContent = '.sn-sec .sn-libre-t{max-width:380px;margin:6px auto 0;line-height:1.6;white-space:pre-line}' +
      '.sn-sec .sn-libre-img{display:block;max-width:100%;width:380px;margin:16px auto 0;border-radius:14px}' +
      '.sn-sec .sn-libre-b{margin-top:18px}';
    (document.head || document.documentElement).appendChild(st);
  }
  function uno(S, e, key) {
    var c = (e.fx && e.fx[key]) || {};
    var titulo = S.txt(c.titulo, 90), texto = String(c.texto == null ? '' : c.texto).trim().slice(0, 1500);
    var img = S.url(c.imagen), link = S.url(c.link), boton = S.txt(c.boton, 50);
    if (!S.on(c.encendido) || (!titulo && !texto && !img)) { S.quitar(key); return; }
    S.css(); css();
    var sec = S.seccion(key, S.txt(c.kick, 60), titulo);
    var h = '';
    if (texto) h += '<p class="sn-libre-t">' + S.esc(texto) + '</p>';
    if (img) h += '<img class="sn-libre-img" src="' + S.esc(img) + '" alt="" loading="lazy">';
    if (link) h += '<div class="sn-libre-b"><a class="btn" href="' + S.esc(link) + '" target="_blank" rel="noopener">' + S.esc(boton || 'Ver más') + '</a></div>';
    S.cuerpo(sec, h);
    S.colocar(sec, key, function () {
      var cf = S.secDe('confirmacion');
      if (key === 'libre2') { var l1 = S.secDe('libre'); if (l1) return { despues: l1 }; }
      return cf ? { antes: cf } : null;
    });
    S.legible(sec);
  }
  function pintar() {
    var S = window.INVSN; if (!S || !document.querySelector('.frame')) return;
    var e = S.ev(); if (!e) return;
    KEYS.forEach(function (k) { try { uno(S, e, k); } catch (x) {} });
  }
  function esperar() { if (window.INVSN) window.INVSN.repetir(pintar); else setTimeout(esperar, 80); }
  esperar();
})();
