/* ===== LA BANDA DE LA TEMATICA ================================================

   QUE RESUELVE
   Una invitacion tiene, intercaladas, siete secciones "fuertes" (`.sec.verde`):
   ceremonia y fiesta, personas, regalos, confirmacion, el hashtag y demas. El
   motor las pinta con UN COLOR PLENO. Maki, mirando la de la playa (18/9/2026):

     «lo unico que yo le cambiaria es en donde estan los turquesas plenos. Le
      pondria algo con alguna estrellita de mar, tipo como la ultima donde dice
      alguna duda, que tenes la estrella de mar, los caracoles. Una parecida a
      esa pero con el fondo medio celestito, un poquito mas claro. Que tenga
      cosas de playa en los costaditos, asi no queda tan pleno ese color.»

   O sea: la banda deja de ser un rectangulo de color y pasa a ser UNA FOTO DE
   LA TEMATICA con los objetos en los bordes y el centro limpio para el texto.

   VIENE APAGADO. Sin `INVEV.fx.tematica.banda` no hace absolutamente nada y
   toda invitacion que no la declare sigue con su color pleno de siempre.

   Como se enciende:
     INVEV.fx.tematica = {
       banda:      'https://.../invitame/fondos/playa-banda-celeste-2',
       bandaTinta: '#1f3f49',   // el color de los titulos sobre esa foto
       bandaVelo:  0.10         // 0 = la foto limpia / 1 = tapada de blanco
     }

   POR QUE `repeat-y` Y NO `cover`  - esto costo pensarlo
   La gracia de la foto son LOS COSTADOS. Con `cover`, una seccion alta (la de
   ceremonia y fiesta, con sus dos tarjetas) escala la imagen por el alto y
   RECORTA JUSTO LOS LADOS: se pierden los caracoles y queda... un color pleno,
   que es lo que veniamos a sacar. Con `100% auto` + `repeat-y` el ancho
   siempre entra completo y la foto se repite hacia abajo. Los bordes de
   caracoles no tienen principio ni fin, asi que la union no se nota.

   LA FOTO ES CLARA, ASI QUE EL TEXTO TIENE QUE DARSE VUELTA
   `.sec.verde` nace pensada para fondo oscuro: h2 blanco, p crema, kick verde
   claro. Sobre una banda celeste clarita eso es blanco sobre blanco. Por eso
   este modulo, cuando enciende la banda, ADEMAS reescribe esos colores con la
   tinta de la tematica. No se deja para que lo salve el corrector de
   contraste: un corrector es la red, no el diseno.

   `background-blend-mode` PASA A `normal`
   El motor mezcla la textura con el color de seccion en `multiply`, que sirve
   para tenir un papel pero aca oscureceria la foto entera. Con la banda
   encendida el color de seccion pasa a blanco y la mezcla a normal.

   SE REAPLICA POR UN RATO. La tematica llega de Firestore DESPUES de que carga
   este archivo, y el panel puede cambiarla en vivo. Mismo patron que
   `vestido-basico.js`: se repasa unos segundos y `firma()` evita repintar al
   pedo.

   ES UNA PIEL, NO TOCA EL HTML. Todo entra por una hoja de estilo propia con
   `!important` acotado a `.sec.verde`. Se borra el <style> y la invitacion
   vuelve exactamente a como estaba.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'inv-banda-tematica';
  var ultima = '';

  function tema() {
    try { return ((window.INVEV || {}).fx || {}).tematica || {}; } catch (e) { return {}; }
  }

  function firma(t) {
    return [t.banda || '', t.bandaTinta || '',
            t.bandaVelo === undefined ? '' : t.bandaVelo].join('|');
  }

  /* un color mas suave que la tinta, para los parrafos */
  function suave(tinta) {
    return 'color-mix(in srgb, ' + tinta + ' 76%, #ffffff)';
  }

  function css(t) {
    var url   = String(t.banda).replace(/"/g, '%22');
    var tinta = t.bandaTinta || t.tinta || '#2e433c';
    var velo  = (t.bandaVelo === undefined || t.bandaVelo === null) ? 0.10 : Number(t.bandaVelo);
    if (!(velo >= 0 && velo <= 1)) velo = 0.10;
    var blanco = 'rgba(255,255,255,' + velo + ')';

    return [
      '.sec.verde{',
      '  background-color:#ffffff !important;',
      '  background-image:linear-gradient(' + blanco + ',' + blanco + '),url("' + url + '") !important;',
      /* ver la nota: el ancho entero siempre, y se repite hacia abajo */
      '  background-size:100% 100%, 100% auto !important;',
      '  background-repeat:no-repeat, repeat-y !important;',
      '  background-position:center top, center top !important;',
      '  background-blend-mode:normal !important;',
      '  color:' + tinta + ' !important;',
      '}',
      /* los colores que nacieron para fondo oscuro */
      '.sec.verde h2{color:' + tinta + ' !important}',
      '.sec.verde .kick{color:' + suave(tinta) + ' !important}',
      '.sec.verde p{color:' + suave(tinta) + ' !important}',
      '.sec.verde .adorno{color:' + suave(tinta) + ' !important}',
      /* las tarjetas de hoteles nacieron translucidas sobre oscuro */
      '.sec.verde .hotel{background:rgba(255,255,255,.55) !important;',
      '  border-color:rgba(0,0,0,.12) !important}',
      '.sec.verde .hotel h4{color:' + tinta + ' !important}',
      '.sec.verde .hotel .d{color:' + suave(tinta) + ' !important}',
      '.sec.verde .dc-mono,.sec.verde .dc-mono .dc-amp{color:' + tinta + ' !important}'
    ].join('\n');
  }

  function pintar() {
    var t = tema();
    var f = firma(t);
    if (f === ultima) return;
    ultima = f;

    var hoja = document.getElementById(ID);
    if (!t.banda) { if (hoja) hoja.remove(); return; }

    if (!hoja) {
      hoja = document.createElement('style');
      hoja.id = ID;
      document.head.appendChild(hoja);
    }
    hoja.textContent = css(t);
  }

  function arrancar() {
    pintar();
    var n = 0;
    var t = setInterval(function () {
      try { pintar(); } catch (e) { clearInterval(t); }
      if (++n > 24) clearInterval(t);          /* 6 segundos, como el vestido */
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar, { once: true });
  } else { arrancar(); }
})();
