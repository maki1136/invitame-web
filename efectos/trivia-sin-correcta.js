/* ===== TRIVIA: UNA PREGUNTA SIN RESPUESTA CORRECTA YA NO LA TRABA (26/10/2026)
   Maki: «en la muestra de Olivia y Gael se carga una sola pregunta y queda ahí
   colgada». Cada pregunta guarda cuál es la correcta (`c`, el círculo que se
   marca en el panel). Si no está marcada, el motor (congelado) hace
   `btns[undefined].classList` → error → el candado `tvLock` queda puesto y la
   trivia no avanza nunca. Pasaba en 8 muestras.
   ARREGLO: antes de que el motor corrija, si la pregunta en pantalla no tiene
   una correcta válida, se toma como correcta la que eligió el invitado (suma y
   sigue). El panel, además, avisa en rojo qué preguntas no tienen la correcta
   marcada (admin/2-panel.js).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invTriviaSinC) return; window.__invTriviaSinC = 1;
  function envolver() {
    var orig = window.tvAns;
    if (typeof orig !== 'function' || orig.__inv) return false;
    var nuevo = function (i) {
      try {
        var ev = window.INVEV || {};
        var lista = Array.isArray(ev.trivia) ? ev.trivia.slice() : [];
        /* PREGUNTAS es un `let` del motor: se ve por nombre desde otro script clásico */
        try { if (typeof PREGUNTAS !== 'undefined' && Array.isArray(PREGUNTAS)) lista = lista.concat(PREGUNTAS); } catch (e) {}
        var q = (document.getElementById('tv-q') || {}).textContent || '';
        var n = document.querySelectorAll('#tv-opts .topt').length;
        lista.forEach(function (p) {
          if (p && p.q === q) {
            var c = parseInt(p.c, 10);
            if (!(c >= 0 && c < n)) p.c = i;
          }
        });
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    nuevo.__inv = 1;
    window.tvAns = nuevo;
    return true;
  }
  var k = 0, t = setInterval(function () { if (envolver() || ++k > 60) clearInterval(t); }, 300);
})();
