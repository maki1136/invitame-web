/* ===== NINGÚN VIDEO DE LA INVITACIÓN ES UN REPRODUCTOR =================

   POR QUÉ EXISTE ESTE ARCHIVO — y es la parte importante, no el código.

   El 20/9/2026 Maki: «se sigue viendo el reproductor al principio con el sobre».
   El culpable era el video del FONDO, que nacía sin blindar. Lo arreglé en
   `fondo-invitacion.js` y en `i/index.html`… y NO LLEGÓ A NINGUNA INVITACIÓN.

   ⚠️⚠️⚠️ EL MOTOR ESTÁ CONGELADO POR VERSIÓN, Y ESO CAMBIA DÓNDE SE ARREGLAN
   LAS COSAS. `i/index.php` no sirve `i/index.html`: sirve
   `i/v/<version>/index.html`, una copia congelada, y cada invitación queda
   clavada a la suya. Hoy hay CINCO versiones vivas (2026-08-11, -11b, -11c,
   2026-09-07, 2026-09-14) más `i/index.html` y `prueba/index.html`: SIETE
   copias del mismo HTML. Está bien que sea así —una invitación entregada no se
   puede romper sola— pero tiene una consecuencia dura:

     · Un arreglo en el HTML del motor llega SÓLO a las invitaciones nuevas,
       y recién cuando se publique una versión.
     · Un arreglo en /efectos/ llega A TODAS, ya mismo, incluidas las
       congeladas: los módulos NO se congelan, los sirve `efectos/todo.php`,
       que escanea la carpeta en cada pedido.

   ⚠️ LA REGLA QUE SALE DE ACÁ: lo que NUNCA puede estar mal no vive en el HTML
      congelado. Vive en un módulo. El HTML se queda con el diseño; la seguridad
      se pone acá, donde alcanza a las siete copias de una sola vez.

   QUÉ HACE: a todo <video> que aparezca, esté donde esté y lo haya creado
   quien lo haya creado, le pone las cinco protecciones. En Safari y en iOS cada
   una destapa algo distinto:

     controls fuera          → el PLAY gigante en el medio
     controlslist            → el menú de descarga y el de velocidad
     disablepictureinpicture → el botón de PiP
     disableremoteplayback   → el de AirPlay
     pointer-events:none     → que no se pueda tocar ni arrastrar

   Y `playsinline`, que en iPhone es la diferencia entre un fondo que se mueve
   y un video que se abre a pantalla completa solo.

   ⚠️ SI ALGÚN DÍA UN VIDEO TIENE QUE SER TOCABLE (no debería: en la invitación
      un video es papel que se mueve), se le pone `data-video-tocable` y este
      módulo no lo toca.

   ⚠️ Y ESTO NO REEMPLAZA ARREGLARLO EN EL ORIGEN. Un módulo llega un instante
      después del primer pintado. Por eso el HTML nuevo y `fondo-invitacion.js`
      TAMBIÉN nacen blindados: esto es la red para las versiones congeladas y
      para el video que alguien agregue mañana sin acordarse. Las dos cosas.

   Lo comprueba solo la regla 4 de `chequeo/muestra.js`, que desde el 20/9
   audita TODOS los <video> de la página y exige las cinco.
   ====================================================================== */

(function () {
  'use strict';

  var LISTA = 'nodownload nofullscreen noremoteplayback noplaybackrate';

  function blindar(v) {
    if (!v || v.getAttribute('data-video-tocable') !== null) return;
    if (v.getAttribute('data-blindado') === '1') return;

    try {
      if (v.hasAttribute('controls')) v.removeAttribute('controls');
      v.controls = false;

      if (v.getAttribute('controlslist') !== LISTA) v.setAttribute('controlslist', LISTA);
      if (!v.hasAttribute('disablepictureinpicture')) v.setAttribute('disablepictureinpicture', '');
      try { v.disablePictureInPicture = true; } catch (e) {}
      if (!v.hasAttribute('disableremoteplayback')) v.setAttribute('disableremoteplayback', '');
      if (!v.hasAttribute('playsinline')) { v.setAttribute('playsinline', ''); try { v.playsInline = true; } catch (e) {} }

      /* el puntero: sólo si nadie se lo dio ya, para no pisar una decisión
         deliberada de una colección */
      if (getComputedStyle(v).pointerEvents !== 'none') v.style.pointerEvents = 'none';

      v.tabIndex = -1;
      if (!v.hasAttribute('aria-hidden')) v.setAttribute('aria-hidden', 'true');

      v.setAttribute('data-blindado', '1');
    } catch (e) {}
  }

  function repasar(raiz) {
    var d = raiz || document;
    try { [].forEach.call(d.querySelectorAll('video'), blindar); } catch (e) {}
  }

  /* 1 · ya mismo, lo que haya */
  repasar();

  /* 2 · y todo lo que aparezca después. Los videos de la invitación los crean
        módulos (el fondo, la portada, el sobre) en momentos distintos, así que
        no alcanza con mirar una vez. */
  try {
    var obs = new MutationObserver(function (cambios) {
      for (var i = 0; i < cambios.length; i++) {
        var c = cambios[i];
        if (c.type === 'attributes' && c.target && c.target.tagName === 'VIDEO') {
          c.target.removeAttribute('data-blindado');   /* alguien lo tocó: se revisa de nuevo */
          blindar(c.target);
          continue;
        }
        for (var j = 0; j < c.addedNodes.length; j++) {
          var n = c.addedNodes[j];
          if (!n || n.nodeType !== 1) continue;
          if (n.tagName === 'VIDEO') blindar(n);
          else if (n.querySelectorAll) repasar(n);
        }
      }
    });
    obs.observe(document.documentElement, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['controls', 'controlslist']
    });
  } catch (e) {}

  /* 3 · y una red de tela más gruesa por si el observer llega tarde a algo:
        los primeros 15 segundos, cada medio segundo. Después se apaga sola. */
  var n = 0;
  var t = setInterval(function () { repasar(); if (++n > 30) clearInterval(t); }, 500);

  document.addEventListener('DOMContentLoaded', function () { repasar(); });
  window.addEventListener('load', function () { repasar(); });
})();
