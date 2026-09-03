/* ===== LA CARTA, ABAJO DEL COLLAR  (sólo Colección Perlas) ==================

   QUÉ PASABA  (2/9/2026)

   Maki, mirando la muestra en la Mac:

     «El sobre que quedó verde, no entiendo por qué está ahí con esa frase
      "confirma con alegría" sin ningún botón. Debería estar arriba ese sobre,
      ahí abajo del collar con la frase. O sea solo cambiarlo de lugar, ¿no?»

   Tenía razón en la ubicación y en que algo estaba mal, pero la causa no era
   la que parecía. Lo medido en la invitación en vivo:

     · La sección es **`#carta-sec`** — la CARTA, con el sobre y la tarjeta
       adentro. No es la confirmación de asistencia.
     · La confirmación **existe y funciona**: es otra sección más abajo
       (`section.sec.verde`, "Confirmar Asistencia", con sus campos y botones).
     · Por eso no había botón: no faltaba nada, era la sección equivocada
       llevando el título de otra.
     · El título venía del dato **`cfTitulo`**, cargado con "Confirma tu lugar",
       que es el texto del RSVP. **Eso se arregla en los datos, no acá.**
     · El verde del sobre venía de **`fx.carta.sobreColor` = `#a8bda4`**. Ya
       existe el recoloreo; sólo estaba puesto el color de la colección Oliva.
       **También es un dato, no código.**

   ⚠️ MORALEJA, que ya se repitió varias veces en este sistema:
      ANTES DE ESCRIBIR CÓDIGO, MIRAR SI ES UN DATO MAL CARGADO. Tres de las
      cuatro cosas que se veían rotas acá eran campos, no bugs.

   LO ÚNICO QUE SÍ ES CÓDIGO: EL ORDEN

   La carta quedaba después del pase con el QR. Va mejor pegada al collar de
   perlas y a la frase de los novios: primero la frase, después la carta que la
   desarrolla. Es el mismo objeto contando lo mismo, no tiene sentido separarlos.

   Esto es un movimiento de nodo **reversible**: no se toca el motor, no se
   copia ni se reescribe nada. Si se saca el módulo de `efectos/index.js`,
   la invitación vuelve exactamente a como estaba.

   ⚠️ ES SÓLO PARA PERLAS. Otras colecciones tienen otro recorrido y la frase
      no siempre es un collar. Si algún día se quiere para todas, se saca el
      candado de `esPerlas()` — pero eso ya es un cambio de diseño general y
      hay que mirarlo colección por colección.

   ⚠️ EL PANEL REPINTA. En la vista previa del admin, cada tecla que toca
      Jazmín vuelve a armar los sectores y la carta volvería a su lugar. Por eso
      el módulo no se conforma con acomodar una vez: revisa cada tanto y, si la
      carta volvió atrás, la mueve de nuevo. Es la misma lección que dejó el
      itinerario cuando el panel se llevaba puesta la línea de progreso.
   ============================================================================ */
(function () {

  var CADA = 700;        /* cada cuánto revisa que siga en su lugar */
  var HASTA = 60000;     /* después de un minuto ya está todo armado */

  function laColeccion() {
    var D = window.INVEV || {};
    return String((D.fx && D.fx.coleccion) || D.coleccion || '').toLowerCase();
  }

  function esPerlas() {
    return laColeccion() === 'perlas';
  }

  function laCarta() {
    return document.getElementById('carta-sec');
  }

  /* La sección de la frase: en Perlas es la banda con el collar y la cita de
     los novios. Se busca por clase y, si cambiara, por el sector que contiene
     la frase — nunca por el texto, que lo escribe la clienta. */
  function laFrase() {
    return document.querySelector('.fraseSec') ||
           document.querySelector('section.frase') ||
           null;
  }

  function acomodar() {
    if (!esPerlas()) return true;      /* no es asunto nuestro: listo */

    var carta = laCarta();
    var frase = laFrase();
    if (!carta || !frase) return false;   /* todavía no están las dos */

    /* ¿ya está donde tiene que estar? entonces no tocar nada: mover un nodo
       reinicia las animaciones de entrada y se vería un parpadeo. */
    if (frase.nextElementSibling === carta) return true;

    /* las dos tienen que colgar del mismo padre, si no `after` no aplica */
    if (frase.parentNode !== carta.parentNode) return true;

    frase.after(carta);
    return true;
  }

  function arrancar() {
    if (!laCarta() && !document.querySelector('.frame')) return;

    acomodar();

    var t0 = Date.now();
    var t = setInterval(function () {
      acomodar();
      if (Date.now() - t0 > HASTA) clearInterval(t);
    }, CADA);

    /* En la vista previa del panel el repintado no para nunca: ahí conviene
       seguir mirando siempre, que es lo que hacen los demás módulos. */
    window.addEventListener('message', function () {
      setTimeout(acomodar, 120);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
