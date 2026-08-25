/* ===== LOS MOMENTOS DEL ITINERARIO ============================================

   EL PROBLEMA QUE RESUELVE
   El itinerario del motor tiene el título, la descripción y una imagen, pero
   **los momentos (la hora, el nombre y el detalle) están ESCRITOS A MANO dentro
   del index.html**: son los del ejemplo — "12:00 Ceremonia", "14:00 Recepción"…
   No había forma de cargarlos desde el panel. Por eso las invitaciones reales
   terminaban subiendo el itinerario como una IMAGEN, que no se puede animar, no
   se lee bien en pantalla chica y hay que rehacer si cambia un horario.

   QUÉ HACE
   Si el evento trae momentos cargados, borra los del ejemplo y escribe los de
   verdad, respetando el mismo HTML que ya usa el motor (`.it` con `.h` y `.d`),
   así heredan el diseño y la animación tal cual.

   DE DÓNDE LOS SACA
     INVEV.fx.itinerario.momentos = [
       { h:'17:00', t:'Ceremonia religiosa', d:'En la Parroquia de San Miguel.' },
       { h:'19:30', t:'Recepción',           d:'Cóctel de bienvenida.' }
     ]
   También acepta `body.dataset.tlMomentos` con ese mismo array en JSON, para
   probar sin tocar la base.

   SI NO HAY MOMENTOS CARGADOS no toca nada: quedan los del ejemplo. Así ninguna
   invitación ya entregada cambia.
   ============================================================================ */
(function () {
  'use strict';

  var ES_PREVIEW = (function () {
    try { return /[?&]preview/.test(location.search) || window.parent !== window; }
    catch (e) { return true; }
  })();

  function leerMomentos() {
    /* 1 · lo que guardó el panel */
    try {
      var c = window.INVEV && window.INVEV.fx && window.INVEV.fx.itinerario;
      if (c && Array.isArray(c.momentos) && c.momentos.length) return c.momentos;
    } catch (e) {}
    /* 2 · para probar sin tocar la base */
    try {
      var d = document.body && document.body.dataset ? document.body.dataset.tlMomentos : null;
      if (d) {
        var arr = JSON.parse(d);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (e) {}
    return null;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  /* el mismo HTML que ya escribe el motor, para heredar diseño y animación */
  function pintar(tl, momentos) {
    var html = momentos.map(function (m) {
      var titulo = [m.h, m.t].filter(Boolean).join(' · ');
      return '<div class="it">' +
               '<div class="h">' + esc(titulo) + '</div>' +
               (m.d ? '<div class="d">' + esc(m.d) + '</div>' : '') +
             '</div>';
    }).join('');

    /* se conserva la línea de progreso si el otro módulo ya la puso */
    var prog = tl.querySelector('.tl-prog');
    tl.innerHTML = html;
    if (prog) tl.appendChild(prog);

    /* el módulo de la animación tiene que rearmar sobre los momentos nuevos */
    tl.__tlListo = false;
  }

  function firmaDe(ms) { try { return JSON.stringify(ms); } catch (e) { return ''; } }
  var firmaVieja = null;

  function armar() {
    var ms = leerMomentos();
    if (!ms) return;                      /* sin datos: no se toca nada */

    var tl = document.querySelector('.tl');
    if (!tl) return;

    var firma = firmaDe(ms);
    var actuales = tl.querySelectorAll(':scope > .it').length;
    if (firma === firmaVieja && actuales === ms.length) return;
    firmaVieja = firma;

    pintar(tl, ms);

    /* si el itinerario está oculto porque el evento tiene una imagen cargada,
       igual se deja escrito: si la diseñadora saca la imagen, ya está listo */
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }

  function arrancar() {
    armar();
    addEventListener('message', function () { setTimeout(armar, 60); });
    if (window.MutationObserver) {
      new MutationObserver(function () {
        /* el motor puede repintar el sector entero */
        setTimeout(armar, 40);
      }).observe(document.body, { childList: true, subtree: true });
    }
    if (ES_PREVIEW) {
      setInterval(armar, 800);
    } else {
      var n = 0, t = setInterval(function () { armar(); if (++n > 60) clearInterval(t); }, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
