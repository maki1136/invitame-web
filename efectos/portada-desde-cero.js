/* ===== EL VIDEO DE PORTADA ARRANCA DESDE CERO AL ABRIR EL SOBRE (22/10/2026) ===
   Maki: «sigue saltando la primer imagen del video de portada… es en todas».

   POR QUÉ: el video de portada (`#coverv`, en bucle, ~8 s) se reproduce detrás
   del sobre cerrado. Cuando el invitado abre, el video está en cualquier punto
   — muchas veces justo dando la vuelta del bucle — y la primera imagen que se
   ve de la portada «salta». Medido en isabela-y-santiago (WebKit, iPhone 13): a
   los 4 s de tocar el sobre el video iba por 7,9 s y saltó a 0.
   El arreglo de i/index.html (portadaDesdeCero, 22/10) no llega a las
   invitaciones, que usan el motor congelado de su versión (2026-09-14): por eso
   va acá, para todas.

   QUÉ HACE: mientras el sobre está a la vista (o su luz blanca todavía tapa),
   el video de portada queda QUIETO en el cuadro 0. Cuando se va, lo pone a
   andar una sola vez desde el principio, y videos-arrancan.js ya no lo recarga
   (ese load() era otro salto, medio segundo después). Sin sobre, no toca nada.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPortadaCero) return; window.__invPortadaCero = 1;
  if (!/\/i\//.test(location.pathname)) return;

  var largado = false, t0 = Date.now();
  function sobreAVista(env) {
    if (!env || !env.isConnected) return false;
    if (env.classList.contains('gone')) return false;
    var cs = getComputedStyle(env);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5) return false;
    return true;
  }
  function paso() {
    if (largado) return;
    var v = document.getElementById('coverv');
    var env = document.getElementById('env');
    if (!v || !v.getAttribute('src') || v.style.display === 'none') {
      if (Date.now() - t0 > 20000) parar();
      return;
    }
    if (!env) { parar(); return; }                     /* sin sobre: no hay salto que evitar */
    var velo = document.getElementById('col-sobre-velo');   /* la luz blanca del sobre en video */
    var veloTapa = velo && velo.isConnected && Number(getComputedStyle(velo).opacity) > 0.6;
    if (sobreAVista(env) || veloTapa) {
      /* quieto en el primer cuadro mientras se ve el sobre */
      if (!v.paused) { try { v.pause(); } catch (e) {} }
      if (v.readyState >= 1 && v.currentTime > 0.05) { try { v.currentTime = 0; } catch (e) {} }
      return;
    }
    /* el sobre se fue: desde cero, una sola vez */
    largado = true;
    v.setAttribute('data-desde-cero', '');   /* videos-arrancan.js ya no lo recarga */
    try { if (v.currentTime > 0.05) v.currentTime = 0; } catch (e) {}
    try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    parar();
  }
  var iv = setInterval(paso, 80);
  function parar() { clearInterval(iv); }
  paso();
})();
