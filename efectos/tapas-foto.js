/* ===== LA FOTO DE LAS TAPAS DEL VIDEO Y DE LA PLAYLIST (22/10/2026) ==========
   Maki: «le faltaban imágenes a nuestro video y a la playlist… deben ser las
   viejas». Las tapas (`.rd-tapa` de reglas-duras o `.col-vtapa` de cada
   colección) toman su foto de la COLECCIÓN; las que no la traen (Bohemia,
   Campestre, Óleo base y Piedra, la plantilla sin colección) quedaban como un
   papel con el botón de play solo.

   Ahora cada invitación puede traer su propia foto, guardada en el panel:
       INVEV.fx.tapas.video     → la tapa de «Nuestro video»
       INVEV.fx.tapas.playlist  → la tapa de «Playlist del evento»
   Si viene, GANA sobre la de la colección (estilo en línea con !important).
   Si no viene, no toca nada: queda lo que ponga la colección.

   ⚠️ Las tapas se crean TARDE (reglas-duras las pone cuando aparece el iframe)
      y se vuelven a crear: por eso mira con un observador, no una sola vez.
   ========================================================================== */
(function () {
  'use strict';
  function cfg() { var e = window.INVEV || {}; return (e.fx && e.fx.tapas) || {}; }
  function liviana(u) {
    if (!/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(u) || /\/upload\/[^/]*(c_fill|w_)/.test(u)) return u;
    return u.replace('/image/upload/', '/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/');
  }
  function poner(id, url) {
    var s = document.getElementById(id); if (!s || !url) return;
    var ts = s.querySelectorAll('.rd-tapa, .col-vtapa');
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i]; if (t.getAttribute('data-tapa-foto') === url) continue;
      t.setAttribute('data-tapa-foto', url);
      t.style.setProperty('background', 'radial-gradient(circle at 50% 50%, rgba(30,22,16,.40) 0, rgba(30,22,16,.16) 26%, rgba(30,22,16,0) 46%), url("' + liviana(url) + '") center/cover no-repeat', 'important');
      t.style.setProperty('border', '0', 'important');
      t.style.setProperty('border-radius', '14px', 'important');
      t.style.setProperty('box-shadow', '0 10px 26px rgba(30,22,16,.26)', 'important');
      var txt = t.querySelector('.rd-txt, .txt');
      if (txt) {
        txt.style.setProperty('color', '#fff', 'important');
        txt.style.setProperty('-webkit-text-fill-color', '#fff', 'important');
        txt.style.setProperty('opacity', '1', 'important');
        txt.style.setProperty('text-shadow', '0 1px 4px rgba(20,14,8,.9)', 'important');
        txt.style.setProperty('background', 'rgba(30,20,12,.6)', 'important');
        txt.style.setProperty('padding', '5px 12px 5px calc(12px + .26em)', 'important');
        txt.style.setProperty('border-radius', '99px', 'important');
      }
      var aro = t.querySelector('.rd-aro, .aro');
      if (aro) aro.style.setProperty('background', 'rgba(250,244,234,.85)', 'important');
    }
  }
  var cola = null;
  function pasada() {
    cola = null;
    var c = cfg(); if (!c.video && !c.playlist) return;
    poner('video-sec', c.video); poner('spotify-sec', c.playlist);
  }
  function pedir() { if (!cola) cola = setTimeout(pasada, 120); }
  function arrancar() {
    pasada();
    try { new MutationObserver(pedir).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    var n = 0, t = setInterval(function () { pasada(); if (++n > 20) clearInterval(t); }, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
  window.addEventListener('invev:listo', pedir);
})();
