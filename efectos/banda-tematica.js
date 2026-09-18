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

   ⭐⭐ SEGUNDA VUELTA (18/9/2026): LA BANDA NO PUEDE TAPAR EL VIDEO
   El primer intento puso una FOTO OPACA, y con muchos objetos. Maki:
     «me sacaste mucho del fondo, y el fondo estaba buenisimo, el del video.
      Donde dice raspa para revelar, como estaba antes me gustaba mas: se veia
      mucho mas el fondo de video.»
     «esta muy cargado de estrellitas y caracoles. Tenes que hacerlo mucho mas
      delicado: algun caracol dando vuelta por ahi. No 200, 1500. Se poblo de
      caracoles.»
   Dos correcciones, y las dos importan:
     1. El color de la banda pasa a ser TRANSLUCIDO (`bandaAlfa`, 0,34 por
        defecto). El video de fondo se ve a traves, que era el punto.
     2. Los objetos ya no vienen en una foto opaca: vienen en una imagen sobre
        BLANCO PURO que se aplica en una capa aparte con `mix-blend-mode:
        multiply`. El blanco desaparece en la mezcla y quedan SOLO los
        caracoles, flotando sobre el video. Sin recorte, sin canal alfa, sin
        depender de quitar fondos.
   ⚠️ LA CAPA VA EN UN HIJO, NO EN LA SECCION. `mix-blend-mode` mezcla con lo
   que hay DETRAS del elemento; puesto en la seccion se mezclaria consigo misma.
   Por eso se inyecta un `<span>` propio, absoluto, sin eventos y detras del
   texto.

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
    return [t.banda || '', t.bandaTinta || '', t.bandaColor || '',
            t.bandaVelo  === undefined ? '' : t.bandaVelo,
            t.bandaAlfa  === undefined ? '' : t.bandaAlfa,
            t.bandaFuerza === undefined ? '' : t.bandaFuerza].join('|');
  }

  /* '#1f3f49' -> 'rgba(31,63,73,α)' */
  function conAlfa(hex, a) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return 'rgba(255,255,255,' + a + ')';
    return 'rgba(' + parseInt(h.slice(0,2),16) + ',' + parseInt(h.slice(2,4),16) +
           ',' + parseInt(h.slice(4,6),16) + ',' + a + ')';
  }

  /* un color mas suave que la tinta, para los parrafos */
  function suave(tinta) {
    return 'color-mix(in srgb, ' + tinta + ' 76%, #ffffff)';
  }

  function css(t) {
    var url   = String(t.banda).replace(/"/g, '%22');
    var tinta = t.bandaTinta || t.tinta || '#2e433c';
    var tono  = t.bandaColor || '#dcecf2';          /* el celeste de la banda */
    var alfa  = Number(t.bandaAlfa);
    if (!(alfa >= 0 && alfa <= 1)) alfa = 0.34;     /* translucido: se ve el video */
    var fuerza = Number(t.bandaFuerza);
    if (!(fuerza >= 0 && fuerza <= 1)) fuerza = 0.5; /* cuanto se notan los caracoles */

    return [
      '.sec.verde{',
      '  background-color:' + conAlfa(tono, alfa) + ' !important;',
      '  background-image:none !important;',
      '  color:' + tinta + ' !important;',
      '  position:relative;',
      '}',
      /* la capa de objetos: blanco que desaparece en multiply. Ver la nota. */
      '.inv-banda-deco{',
      '  position:absolute;inset:0;pointer-events:none;z-index:0;',
      '  background-image:url("' + url + '");',
      '  background-size:100% auto;background-repeat:repeat-y;',
      '  background-position:center top;',
      '  mix-blend-mode:multiply;opacity:' + fuerza + ';',
      '}',
      /* el contenido queda por encima de la capa */
      '.sec.verde > *:not(.inv-banda-deco){position:relative;z-index:1}',
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
    if (!t.banda) {
      if (hoja) hoja.remove();
      var v = document.querySelectorAll('.inv-banda-deco');
      for (var k = 0; k < v.length; k++) v[k].remove();
      return;
    }

    if (!hoja) {
      hoja = document.createElement('style');
      hoja.id = ID;
      document.head.appendChild(hoja);
    }
    hoja.textContent = css(t);
    capas();
  }

  /* una capa de objetos por banda, ni mas ni menos */
  function capas() {
    var secs = document.querySelectorAll('.sec.verde');
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].querySelector(':scope > .inv-banda-deco')) continue;
      var c = document.createElement('span');
      c.className = 'inv-banda-deco';
      c.setAttribute('aria-hidden', 'true');
      secs[i].insertBefore(c, secs[i].firstChild);
    }
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
