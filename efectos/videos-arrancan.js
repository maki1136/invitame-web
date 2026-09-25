/* ============================================================================
   ARRANCAR LOS VIDEOS DECORATIVOS AL PRIMER TOQUE DEL INVITADO
   Invítame · 19/9/2026

   EL PROBLEMA, MEDIDO EN lupita-mis15

   Los navegadores no dejan que un video arranque solo hasta que la persona
   toca algo. Los módulos piden `play()` apenas crean el video, el navegador
   lo rechaza, y ahí queda: pausado para siempre. Lo que el invitado ve es el
   POSTER —la foto fija de respaldo— ampliado, que parece un fondo borroso.

   Medido en vivo, con el fondo y la portada en video:

     fondo     autoplay:true   loop:true  muted:true  -> PAUSADO
     cover-vid autoplay:false  loop:true  muted:true  -> PAUSADO
     env-vid   autoplay:false  loop:false sin fuente  -> (el sobre, no va acá)

   Y forzando `play()` a mano arrancan al instante: los videos estaban sanos.

   ⚠️ POR QUE NO ALCANZABA CON REINTENTAR EN `loadeddata` Y `canplay`
   Eso se probó el 18/9 en fondo-invitacion.js y tiene un agujero: si el video
   carga RAPIDO —servido desde el propio Hostinger, sin competencia— los dos
   eventos pasan ANTES de que el invitado toque el sobre. Los reintentos son
   `once`, así que se gastan contra un navegador que todavía no permite nada, y
   cuando por fin llega el toque ya no queda ninguno. En renata-y-patricio no
   se veía porque ahí el video llegaba tarde y el reintento caía después.

   ⚠️ POR QUE ESTO NO ES UN PARCHE
   No tapa el problema de un módulo: resuelve una regla del NAVEGADOR que cruza
   a todos. El toque siempre existe, porque el invitado tiene que abrir el
   sobre para entrar. Cualquier video decorativo que se agregue mañana queda
   cubierto sin tocar nada.

   ⚠️ QUE VIDEOS AGARRA, Y POR QUE ESE FILTRO
   `loop` + `muted` + tiene fuente. Medido: el del fondo tiene autoplay en true
   pero el de la portada en FALSE, así que filtrar por autoplay dejaba afuera
   la portada. Y `loop:false` excluye el video del sobre, que lo maneja
   sobre-catalogo.js con su propio tiempo y NO hay que volver a arrancar
   cuando termina.

   ⭐ 25/9/2026 · LA PORTADA CORRE PERO NO SE VE (medido en sofia-y-emilio,
   elena-y-julian y lupita-mis15, en Chromium)
   Después de abrir el sobre, el video de la portada queda paused:false,
   readyState 4, entregando cuadros (requestVideoFrameCallback cuenta ~24/s)…
   y en pantalla no aparece: se ve el color del papel. No lo tapa nada
   (elementsFromPoint limpio), no es el códec (pasa con VP9 y con H.264), y
   `play()` o un `translateZ` no lo despiertan. Lo ÚNICO que lo despierta es
   recargar la fuente: `load()` + `play()`. La capa del video quedó armada
   mientras el sobre (z 100, fijo, pantalla completa) la tapaba, y el
   compositor no la vuelve a pintar.
   → Cuando el sobre ya se fue, a cada video decorativo de la PORTADA se le
     hace UNA recarga. Una sola vez por video (WeakSet), así no machaca. El
     video es un loop con el mismo poster que la foto: el reinicio no se nota.
   ============================================================================ */
(function () {
  'use strict';

  var yaPaso = false;

  function esDecorativo(v) {
    if (!v.loop) return false;              /* el sobre no: corre una vez */
    if (!v.muted) return false;             /* si suena, lo decide el invitado */
    if (!(v.currentSrc || v.getAttribute('src'))) return false;
    return true;
  }

  /* ⚠️ CUANDO SE INTENTO CADA UNO. Sin esto, dos llamadas seguidas a play()
     sobre el mismo video ABORTAN la primera y no arranca nunca. */
  var ultimoIntento = (typeof WeakMap === 'function') ? new WeakMap() : null;
  var ESPERA = 1200;   /* lo minimo entre dos intentos sobre el MISMO video */

  function arrancar() {
    var vs = document.getElementsByTagName('video');
    var quedan = 0;
    var ahora = Date.now();
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i];
      if (!esDecorativo(v)) continue;
      if (!v.paused) continue;
      quedan++;
      if (ultimoIntento) {
        var t = ultimoIntento.get(v);
        if (t && ahora - t < ESPERA) continue;   /* todavia esta intentando */
        ultimoIntento.set(v, ahora);
      }
      try {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }
    return quedan;
  }

  /* ⭐ 25/9 · la recarga única de la portada cuando el sobre ya se fue */
  var repintados = (typeof WeakSet === 'function') ? new WeakSet() : null;

  function sobreSeFue() {
    var env = document.getElementById('env');
    if (!env) return true;
    if (env.classList.contains('gone')) return true;
    var s = getComputedStyle(env);
    return s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0';
  }

  function repintarPortada() {
    if (!repintados || !sobreSeFue()) return false;
    var vs = document.querySelectorAll('.portada video');
    var hizo = false;
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i];
      if (!esDecorativo(v) || repintados.has(v)) continue;
      repintados.add(v);
      hizo = true;
      try {
        v.load();
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }
    return hizo;
  }

  /* ⭐ 25/9 (2) · la portada queda frenada en el primer cuadro.
     Medido en ivanna-mis15 y daniela-mis15: 10 s después de abrir el sobre, la
     portada seguía en paused:true, t=0. El load() de repintarPortada corta el
     play() anterior y el nuevo play() a veces no prende; como el reloj ya se
     había apagado, nadie lo volvía a intentar. Y al volver scrolleando arriba
     tampoco. Arreglo: mientras dure la PACIENCIA, y después en cada scroll
     (con freno de 1 s), si la portada está a la vista y parada, play() de nuevo
     —sin load(), que es lo que la corta. */
  function mantenerPortada() {
    if (!sobreSeFue()) return 0;
    var vs = document.querySelectorAll('.portada video');
    var paradas = 0;
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i];
      if (!esDecorativo(v) || !v.paused) continue;
      var r = v.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= (window.innerHeight || 800)) continue;
      paradas++;
      try { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
    return paradas;
  }
  var ultimoScroll = 0;
  window.addEventListener('scroll', function () {
    if (!yaPaso) return;
    var ahora = Date.now();
    if (ahora - ultimoScroll < 1000) return;
    ultimoScroll = ahora;
    setTimeout(mantenerPortada, 300);
  }, { passive: true });

  /* ⚠️⚠️ UN MutationObserver ACÁ ROMPE TODO. PROBADO Y MEDIDO EL 19/9/2026.
     Se colgó un MutationObserver del documento para arrancar cualquier video
     nuevo sin depender del reloj. Resultado: dejó de arrancar TAMBIÉN el fondo,
     que ya funcionaba. La causa es que esta invitación muta en bucle
     —reglas-duras.js corre con cada cambio de clase o atributo del marco—, así
     que el observador disparaba `play()` decenas de veces por segundo y cada
     llamada abortaba la anterior. NO volver por ahí.

     La forma que sí anda: un REPASO cada tanto, con memoria de a quién se le
     intentó y cuándo. Cubre los videos que nacen tarde —la portada se arma
     DESPUÉS de que el sobre se va— sin machacar a ninguno. */
  var REPASO = 700;    /* cada cuánto se mira la página */
  var PACIENCIA = 25000;  /* cuánto tiempo se sigue mirando después del toque */

  function alPrimerToque() {
    if (yaPaso) return;
    yaPaso = true;
    arrancar();
    var desde = Date.now();
    var portadaLista = false;
    var reloj = setInterval(function () {
      var quedan = arrancar();
      if (!portadaLista && sobreSeFue()) {
        /* medio segundo más, para que el fundido del sobre termine */
        portadaLista = true;
        setTimeout(repintarPortada, 500);
      }
      if (portadaLista) mantenerPortada();
      /* se sigue mirando toda la PACIENCIA: la recarga de la portada llega 0,5 s después */
      if (Date.now() - desde > PACIENCIA) clearInterval(reloj);
    }, REPASO);
  }

  var eventos = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'];
  for (var i = 0; i < eventos.length; i++) {
    document.addEventListener(eventos[i], alPrimerToque, { capture: true, passive: true });
  }

  /* Si el navegador ya venía permitiendo autoplay (escritorio con la pestaña
     activa), no hay que esperar a nadie. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(arrancar, 1200); });
  } else {
    setTimeout(arrancar, 1200);
  }
})();
