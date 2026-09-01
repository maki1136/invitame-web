/* ===== EL ACORDEÓN: DESPERTAR LO QUE SE CARGÓ EN UNA CAJA DE 0 PX ===========

   EL SÍNTOMA
   Maki: «en la ceremonia y en la fiesta, donde dice ver mapa, no te lleva a
   ningún lado, no hay dirección».
   Se toca "Ver mapa ▾", la tarjeta se abre… y adentro hay un rectángulo
   blanco vacío. Lo mismo en "Ver inspiración".

   LA CAUSA — Y POR QUÉ ENGAÑA
   La dirección estaba cargada y el iframe tenía su `src` bien puesto. O sea
   que mirando los datos y mirando el HTML no se ve nada raro. Lo que falla es
   el ACORDEÓN:

     .acc-panel      { max-height:0; overflow:hidden }
     .acc-panel.open { max-height:560px }

   El panel arranca con CERO PÍXELES DE ALTO. El navegador igual carga el
   iframe que está adentro, Google Maps se dibuja a sí mismo en 0×0 y listo:
   cuando después el panel se abre, adentro del iframe no hay nadie que se
   entere de que ahora hay lugar. Se queda dibujado en la nada.

   ⚠️ La trampa: `getComputedStyle` decía `max-height: 0px` incluso con la
      clase `.open` puesta, y una copia del mismo nodo pegada en otro lado
      medía 560px. Parecía un problema de CSS y no lo era.

   LA PRUEBA QUE LO CONFIRMÓ
   Alcanzaba con meter CUALQUIER otro iframe al lado —forzando un reflow— para
   que aparecieran los dos mapas de golpe. El mapa no estaba roto: estaba
   dibujado en 0×0.

   LA SOLUCIÓN
   Escuchar el click del acordeón y, cuando el panel queda ABIERTO, volverle a
   poner el `src` a cada iframe de adentro. Se carga de nuevo, ahora con el
   tamaño de verdad, y el mapa se dibuja.

   Se hace UNA sola vez por iframe (`data-acc-despierto`), así abrir y cerrar
   no lo recarga a cada rato.

   ⚠️ POR QUÉ VA ACÁ Y NO EN index.html
   `acc()` vive en el motor (i/index.php, 144 KB, se sube a mano). Este arreglo
   no lo toca: se cuelga del click desde afuera. Si mañana se arregla en el
   motor, se borra la línea de /efectos/index.js y no queda nada dando vueltas.

   ⚠️ NO CAMBIA NADA MÁS. Si no hay acordeones, no hace nada.
   ============================================================================ */
(function () {
  'use strict';

  /* Le vuelve a poner el src a los iframes de un panel recién abierto. */
  function despertar(panel) {
    if (!panel) return;
    [].forEach.call(panel.querySelectorAll('iframe'), function (f) {
      if (f.getAttribute('data-acc-despierto')) return;
      var src = f.getAttribute('src');
      if (!src) return;                     /* sin src no hay nada que despertar */
      f.setAttribute('data-acc-despierto', '1');
      f.setAttribute('loading', 'eager');   /* ya está a la vista: que cargue ya */
      f.removeAttribute('src');
      f.setAttribute('src', src);
    });
  }

  /* El panel del acordeón es el hermano siguiente del contenedor del botón.
     Es lo mismo que hace `acc()` en el motor; si eso cambia, cambia acá. */
  function panelDe(btn) {
    var caja = btn.parentElement;
    return caja ? caja.nextElementSibling : null;
  }

  function alTocar(ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var btn = t.closest('.acc-btn');
    if (!btn) return;
    /* después de que `acc()` haya puesto o sacado la clase */
    setTimeout(function () {
      var p = panelDe(btn);
      if (p && p.classList && p.classList.contains('open')) despertar(p);
    }, 60);
  }

  function arrancar() {
    document.addEventListener('click', alTocar, true);

    /* Red de seguridad: si algo abre un panel sin click (una dirección web con
       ancla, o el motor al redibujar), lo agarramos igual durante un rato. */
    var n = 0, t = setInterval(function () {
      [].forEach.call(document.querySelectorAll('.acc-panel.open'), despertar);
      if (++n > 40) clearInterval(t);
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
