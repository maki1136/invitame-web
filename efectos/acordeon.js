/* ===== EL ACORDEÓN: EL IFRAME NO EXISTE HASTA QUE SE ABRE ====================

   Este archivo resuelve DOS problemas que resultaron ser el mismo.

   ── PROBLEMA 1 (8/9/2026): el mapa se abría en blanco ──────────────────────
   Maki: «en la ceremonia y en la fiesta, donde dice ver mapa, no te lleva a
   ningún lado, no hay dirección». Se tocaba "Ver mapa", la tarjeta se abría…
   y adentro había un rectángulo blanco vacío.

   La dirección estaba bien y el iframe tenía su `src` bien puesto: mirando los
   datos y el HTML no se veía nada raro. Lo que fallaba era el acordeón:

     .acc-panel      { max-height:0; overflow:hidden }
     .acc-panel.open { max-height:560px }

   El panel arranca con CERO PÍXELES DE ALTO. El navegador igual carga el
   iframe de adentro, Google Maps se dibuja a sí mismo en 0x0, y cuando después
   el panel se abre, adentro del iframe nadie se entera de que ahora hay lugar.
   Queda dibujado en la nada.

   ── PROBLEMA 2 (9/9/2026): la mitad de la carga era eso mismo ──────────────
   El banco midió 148 archivos para dibujar la primera pantalla. Desglose real:

       maps.googleapis.com  ....  28        res.cloudinary.com ....  20
       google.com (mapas)   ....   8        fonts.gstatic.com  ....   9
       embed-cdn.spotifycdn ....  17

   O sea: un invitado con datos móviles se bajaba 53 archivos de un mapa que no
   abrió y un reproductor que no tocó — más que todas las fotos de la boda.

   ATENCION - `loading="lazy"` NO ALCANZA, Y ESTE ES EL PUNTO FINO.
   Los iframes ya lo tenían. No sirvió: un acordeón cerrado NO es lo mismo que
   «fuera de pantalla». El iframe sigue en su lugar, con sus 190 px de alto,
   sólo que recortado. Para el navegador está a la vista, y `lazy` sólo pospone
   lo que está LEJOS del viewport.

   ── LA SOLUCION, QUE ARREGLA LOS DOS ───────────────────────────────────────
   Un iframe sin atributo `src` no pide nada Y no se dibuja en 0x0. Entonces:
   se le guarda la dirección aparte (`data-acc-src`), se le saca el `src`, y se
   le devuelve recién cuando el panel está abierto y cerca de la pantalla. Nace
   con el tamaño de verdad, así que el mapa se ve bien la primera vez.

   Antes esto se hacía al revés —dejarlo cargar y RECARGARLO al abrir—, que
   arreglaba el dibujo pero pagaba la descarga dos veces.

   ATENCION - LA SOLAPA DE LA MUSICA VIENE ABIERTA A PROPOSITO (tarea #178, y
      el banco lo chequea). Con la regla del acordeón sola, Spotify seguiría
      bajando sus 17 archivos en el primer segundo aunque el reproductor esté
      seis pantallas más abajo. Por eso además se mira la DISTANCIA: la solapa
      se sigue viendo abierta —el diseño no cambia— y el reproductor aparece
      cuando el invitado se acerca.

   ATENCION - EL MOTOR ESCRIBE EL `src` DESPUES, y por eso hay un observador.
      La dirección del mapa no es la del HTML: el motor la calcula con la que
      cargó la clienta y recién ahí la escribe. Sin el observador, el motor
      volvería a poner el `src` un segundo más tarde y volvería a cargar.

   ATENCION - RED DE SEGURIDAD: UN MAPA QUE NO CARGA ES PEOR QUE UNO LENTO.
      No se despierta sólo con el clic: cada 400 ms se pregunta si el panel está
      abierto y cerca. Da igual cómo se haya abierto —el botón, el teclado, un
      ancla en la dirección, o que venga abierto de fábrica—. Y ante cualquier
      error, se despierta todo: se vuelve al comportamiento viejo, más lento
      pero seguro.

   ATENCION - POR QUE VA ACA Y NO EN index.html. `acc()` vive en el motor, que
      está clavado por versión. Esto se cuelga desde afuera y llega a TODAS las
      invitaciones, incluidas las ya entregadas.
   ============================================================================ */
(function () {
  'use strict';

  /* Los que conviene dormir. El resto de los iframes no se toca. */
  var SEL = '.acc-panel iframe,#spotify-embed iframe,#musica-embed iframe';

  function panelDe(f) { return f.closest ? f.closest('.acc-panel') : null; }

  /* pantalla y media para abajo, media para arriba */
  function cerca(f) {
    var caja = (f.closest && f.closest('section')) || f;
    var r = caja.getBoundingClientRect();
    return r.top < innerHeight * 1.5 && r.bottom > -innerHeight * 0.5;
  }

  function aLaVista(f) {
    var p = panelDe(f);
    if (p && !p.classList.contains('open')) return false;
    return cerca(f);
  }

  function todos() {
    try { return [].slice.call(document.querySelectorAll(SEL)); } catch (e) { return []; }
  }

  function dormir(f) {
    try {
      if (!f || f.getAttribute('data-acc-dormido')) return;
      if (aLaVista(f)) return;
      var s = f.getAttribute('src');
      if (!s || s === 'about:blank') return;
      f.setAttribute('data-acc-src', s);
      f.setAttribute('data-acc-dormido', '1');
      f.removeAttribute('src');
    } catch (e) {}
  }

  function despertar(f) {
    try {
      f.removeAttribute('data-acc-dormido');
      var s = f.getAttribute('data-acc-src');
      if (!s) return;
      f.removeAttribute('data-acc-src');
      f.setAttribute('loading', 'eager');   /* ya se ve: que cargue ya */
      f.setAttribute('src', s);
    } catch (e) {}
  }

  function arrancar() {
    try {
      todos().forEach(dormir);

      /* el motor escribe el src más tarde: se vuelve a dormir */
      if (window.MutationObserver) {
        new MutationObserver(function (cambios) {
          for (var i = 0; i < cambios.length; i++) {
            var t = cambios[i].target;
            if (t && t.tagName === 'IFRAME' && t.getAttribute('src')) dormir(t);
          }
        }).observe(document.documentElement,
                   { subtree: true, attributes: true, attributeFilter: ['src'] });

        /* y los iframes que aparecen después (Spotify se arma con innerHTML)

           ATENCION - ESTE OBSERVADOR TIENE QUE ESPERAR, Y CUESTA CARO NO HACERLO.
           La primera version barria el documento entero (querySelectorAll) en
           CADA nodo insertado. El motor inserta miles mientras dibuja, asi que
           el costo crecia al cuadrado. En Chrome pasaba; en WebKit no: en la
           corrida del banco murieron los TRES escenarios de Safari —escritorio,
           iPhone y iPad— y sobrevivio solo Chrome. O sea que le habria pasado
           igual a una invitada con iPhone. Ahora se junta todo lo que llego y
           se barre UNA vez cada 200 ms. */
        var pendiente = false;
        new MutationObserver(function () {
          if (pendiente) return;
          pendiente = true;
          setTimeout(function () { pendiente = false; todos().forEach(dormir); }, 200);
        }).observe(document.documentElement, { subtree: true, childList: true });
      }

      /* la red de seguridad, que es también el despertador normal */
      setInterval(function () {
        todos().forEach(function (f) {
          if (f.getAttribute('data-acc-dormido') && aLaVista(f)) despertar(f);
        });
      }, 400);

    } catch (e) {
      todos().forEach(despertar);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
