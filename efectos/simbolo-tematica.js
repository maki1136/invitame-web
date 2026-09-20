/* ===== EL SIMBOLO DE LA TEMATICA =============================================

   QUE RESUELVE
   Maki, 18/9/2026, sobre la muestra de la playa:

     «fijate en los anillitos que vos pones, donde dice te esperamos confirmar
      asistencia, por ejemplo, arriba. Viste que siempre vas poniendo anillitos
      arriba de esos textos. Podria ser algo diferente ahi, no? Alguna vez,
      porque siempre pones lo mismo.»

     «no me esta gustando mucho el tema de los circulitos que estas poniendo
      [en el itinerario]. No se si se puede hacer de otra manera.»

   Son la misma queja. El motor tiene DOS marcas graficas y las dos estan
   clavadas en un circulo:
     1. `.adorno` — los dos aros entrelazados que van arriba de CADA titulo, en
        CADA seccion, en CADA invitacion.
     2. la marca de cada momento del itinerario — un anillo chico.

   Aca se declaran juegos de simbolos y la invitacion elige el suyo. Los dos
   lugares usan el MISMO juego, asi la invitacion se siente de una pieza.

   VIENE APAGADO. Sin `INVEV.fx.tematica.simbolo` la invitacion queda con los
   aros de siempre y la marca redonda de siempre.

   Como se enciende:
     INVEV.fx.tematica.simbolo = 'mar'
     // 'mar' | 'perlas' | 'hojas' | 'luz' | 'rombo' | 'disco'

   LOS JUEGOS
     mar     estrella de mar de cinco puntas    (bodas en la playa)
     perlas  tres perlas en fila                (Coleccion Perlas)
     hojas   dos hojas de olivo enfrentadas     (campo, toscana)
     luz     una llama larga                    (velas, salones de noche)
     rombo   un rombo fino                      (neutro, papeleria clasica)
     disco   una bola de espejos colgada        (XV disco, fiestas de noche)

   COMO ESTA DIBUJADO, Y POR QUE ASI
   Cada juego es UN dibujo en un viewBox de 24x24, para poder meterlo tanto en
   el adorno ancho como en la marca chica del itinerario sin rehacerlo. El
   adorno completo se arma con dos lineas a los costados + el dibujo al medio,
   respetando el viewBox 120x44 que ya usa `.adorno`, asi entra donde estaba
   sin tocar una sola medida del motor.

   ⚠️⚠️ LA TRAMPA DEL RELLENO. `dataUri()` reemplaza `fill="none"` por el color
   del PAPEL, para que la marca del itinerario tape la linea vertical (ver mas
   abajo). Ese reemplazo es GLOBAL al dibujo. Por eso, en un juego con varias
   piezas, SOLO la pieza que tiene que quedar maciza lleva `fill="none"`; las
   demas van con `fill="transparent"`, que no matchea el reemplazo y queda solo
   el trazo. Si a las facetas de la bola se les pone `fill="none"` se rellenan
   y la bola se convierte en una mancha.

   `currentColor` EN EL ADORNO. El motor ya decide el color del adorno segun la
   seccion (`.sec.verde .adorno{color:...}`), y `banda-tematica.js` lo cambia
   otra vez cuando la banda es clara. Si el simbolo trajera su propio color se
   pelearia con los dos. Dibuja en `currentColor` y hereda siempre.

   ⭐ DEJA FIRMA EN EL `<html>`: `html[data-simbolo="<juego>"]`.
   Antes no habia forma de comprobar DESDE AFUERA que la marca del itinerario
   era la de la tematica y no el circulito de fabrica — y ese error se repitio
   tres veces. Con la firma, `chequeo/muestra.js` lo puede exigir, y la
   coleccion puede colgarle estilos propios sin adivinar.

   ES UNA PIEL. El SVG original del adorno NO se borra: se esconde, y el nuevo
   se agrega al lado. Sacando el <style> y los nodos marcados vuelve todo.
   ============================================================================ */
(function () {
  'use strict';

  var ID_CSS = 'inv-simbolo-css';
  var MARCA  = 'data-simbolo-inv';
  var ultimo = '';

  /* los dibujos, en un lienzo de 24x24 y en currentColor */
  var JUEGOS = {
    mar: '<path d="M12 2.6l2.3 6.1 6.5.3-5 4.2 1.7 6.3L12 15.9 6.5 19.5l1.7-6.3-5-4.2 6.5-.3z"' +
         ' fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
    perlas: '<circle cx="5" cy="12" r="2.1" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
            '<circle cx="12" cy="12" r="2.9" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
            '<circle cx="19" cy="12" r="2.1" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    hojas: '<path d="M12 12c-3.4 0-6.2-2-7.4-5 3.6-.7 6.6.8 7.4 5zm0 0c3.4 0 6.2-2 7.4-5-3.6-.7-6.6.8-7.4 5z"' +
           ' fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>' +
           '<path d="M12 12v8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    luz: '<path d="M12 3c2.6 3.1 4 5.4 4 7.6a4 4 0 11-8 0C8 8.4 9.4 6.1 12 3z"' +
         ' fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
    rombo: '<path d="M12 3.5L20.5 12 12 20.5 3.5 12z" fill="none" stroke="currentColor" stroke-width="1.3"/>',

    /* ⭐ LA BOLA DE ESPEJOS. El orden importa: primero la esfera maciza (la
       unica con `fill="none"`, que se vuelve el color del papel y tapa la
       linea del itinerario) y encima las facetas, que son solo trazo. */
    disco: '<path d="M12 2.1v3.1" fill="transparent" stroke="currentColor"' +
           ' stroke-width="1.1" stroke-linecap="round"/>' +
           '<circle cx="12" cy="13.4" r="8.1" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
           '<path d="M12 5.3v16.2M4.2 10.9h15.6M3.9 15.9h16.2" fill="transparent"' +
           ' stroke="currentColor" stroke-width=".75" stroke-linecap="round"/>' +
           '<path d="M8.3 6.2c-1.7 4.7-1.7 9.7 0 14.4M15.7 6.2c1.7 4.7 1.7 9.7 0 14.4"' +
           ' fill="transparent" stroke="currentColor" stroke-width=".75"/>'
  };

  function tema() {
    try { return ((window.INVEV || {}).fx || {}).tematica || {}; } catch (e) { return {}; }
  }

  function elegido() {
    var s;
    try { s = new URLSearchParams(location.search).get('simbolo'); } catch (e) {}
    s = s || tema().simbolo || '';
    return JUEGOS[s] ? s : '';
  }

  /* el adorno ancho: dos lineas y el simbolo al medio, en el viewBox de siempre */
  function svgAdorno(juego) {
    return '<svg viewBox="0 0 120 44" aria-hidden="true">' +
             '<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">' +
               '<line x1="14" y1="22" x2="44" y2="22"></line>' +
               '<line x1="76" y1="22" x2="106" y2="22"></line>' +
             '</g>' +
             '<g transform="translate(48 10)">' + JUEGOS[juego] + '</g>' +
           '</svg>';
  }

  /* EL SIMBOLO DEL ITINERARIO TIENE QUE TAPAR LA LINEA
     El circulo que habia antes se pintaba del color del papel, asi que cortaba
     la linea vertical y cada momento quedaba prendido de ella. Con una `mask`
     el dibujo queda calado y la linea se ve POR ADENTRO: sucio.
     Por eso este no va enmascarado: va como imagen, con el relleno del color
     del papel y el trazo del color de la tinta. Los dos colores se leen de las
     variables que ya calcula `itinerario.js` (`--tl-tinta`, `--tl-papel`) y se
     escriben literales adentro del archivo, porque un data-URI no puede leer
     variables CSS. Si todavia no estan, se vuelve a intentar en la pasada
     siguiente: por eso los colores entran en la firma.

     ⚠️ Y esas dos variables las manda la COLECCION cuando hay una activa (ver
     `efectos/itinerario.js`, error 3). Si no, el simbolo se hornea con el par
     claro y queda marfil sobre papel negro. */
  function colores() {
    var cs = getComputedStyle(document.documentElement);
    var tinta = (cs.getPropertyValue('--tl-tinta') || '').trim();
    var papel = (cs.getPropertyValue('--tl-papel') || '').trim();
    if (!tinta || tinta === 'currentColor') tinta = (tema().tinta || '#2e433c');
    if (!papel) papel = '#fbf9f5';
    return { tinta: tinta, papel: papel };
  }

  /* el mismo dibujo, chiquito y macizo, para la marca del itinerario */
  function dataUri(juego, c) {
    var dibujo = JUEGOS[juego]
      .replace(/fill="none"/g, 'fill="' + c.papel + '"')
      .replace(/currentColor/g, c.tinta);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
              dibujo + '</svg>';
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  }

  /* ⭐ publico, para que la coleccion o el chequeo puedan usar el mismo dibujo
     en otros lugares (el boton de confirmar, por ejemplo) sin copiarlo. */
  function uriDe(juego, tinta, papel) {
    if (!JUEGOS[juego]) return '';
    var c = colores();
    return dataUri(juego, { tinta: tinta || c.tinta, papel: papel || c.papel });
  }

  function css(juego) {
    var u = dataUri(juego, colores());
    return [
      /* el aro original se esconde, no se borra */
      '.adorno > svg[data-original]{display:none}',
      /* la marca del itinerario deja de ser un circulo */
      '.tl.tl-anim > .it::before,.tl > .it::before{',
      '  border-radius:0 !important;',
      '  border:0 !important;',
      '  box-shadow:none !important;',
      '  width:18px !important;height:18px !important;',
      '  background:' + u + ' center/contain no-repeat !important;',
      '  -webkit-mask:none !important; mask:none !important;',
      '}',
      '.tl.tl-centro > .it:nth-child(odd)::before{margin-top:-9px !important;right:-34.5px !important}',
      '.tl.tl-centro > .it:nth-child(even)::before{margin-top:-9px !important;left:-34.5px !important}'
    ].join('\n');
  }

  function pintar() {
    var juego = elegido();
    var c = colores();
    var f = juego + '|' + c.tinta + '|' + c.papel;
    if (f === ultimo) return;
    ultimo = f;

    var hoja = document.getElementById(ID_CSS);
    var nuevos = document.querySelectorAll('[' + MARCA + ']');

    if (!juego) {                                  /* apagado: se deshace todo */
      if (hoja) hoja.remove();
      for (var k = 0; k < nuevos.length; k++) nuevos[k].remove();
      var ori = document.querySelectorAll('.adorno > svg[data-original]');
      for (var m = 0; m < ori.length; m++) ori[m].removeAttribute('data-original');
      document.documentElement.removeAttribute('data-simbolo');
      return;
    }

    if (!hoja) {
      hoja = document.createElement('style');
      hoja.id = ID_CSS;
      document.head.appendChild(hoja);
    }
    hoja.textContent = css(juego);

    /* ⭐ la firma: quien mire desde afuera puede comprobar que la marca del
       itinerario es la de la tematica, no el circulito de fabrica. */
    if (document.documentElement.getAttribute('data-simbolo') !== juego) {
      document.documentElement.setAttribute('data-simbolo', juego);
    }

    var ads = document.querySelectorAll('.adorno');
    for (var i = 0; i < ads.length; i++) {
      var a = ads[i];
      if (a.getAttribute(MARCA) === juego) continue;
      /* saco lo mio de la pasada anterior y escondo lo del motor */
      var mios = a.querySelectorAll('[' + MARCA + ']');
      for (var j = 0; j < mios.length; j++) mios[j].remove();
      var sv = a.querySelector('svg');
      if (sv) sv.setAttribute('data-original', '1');

      var caja = document.createElement('span');
      caja.setAttribute(MARCA, juego);
      caja.style.cssText = 'display:block;width:100%;height:100%';
      caja.innerHTML = svgAdorno(juego);
      a.appendChild(caja);
      a.setAttribute(MARCA, juego);
    }
  }

  function arrancar() {
    pintar();
    var n = 0;
    var t = setInterval(function () {
      try { pintar(); } catch (e) { clearInterval(t); }
      if (++n > 40) clearInterval(t);              /* 10 s: el itinerario tarda */
    }, 250);
  }

  window.INVSIMBOLO = { juegos: JUEGOS, uri: uriDe, elegido: elegido };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar, { once: true });
  } else { arrancar(); }
})();
