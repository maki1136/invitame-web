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

  function arrancar() {
    var vs = document.getElementsByTagName('video');
    for (var i = 0; i < vs.length; i++) {
      var v = vs[i];
      if (!v.paused) continue;
      if (!esDecorativo(v)) continue;
      try {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }
  }

  function alPrimerToque() {
    if (yaPaso) return;
    yaPaso = true;
    arrancar();
    /* y de nuevo más tarde: la portada se arma DESPUÉS de que el sobre se va,
       así que al momento del toque todavía puede no existir. */
    setTimeout(arrancar, 500);
    setTimeout(arrancar, 1800);
    setTimeout(arrancar, 4000);
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
