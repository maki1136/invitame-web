/* ===== LA BANDA DE LA TEMATICA ================================================

   QUE RESUELVE
   Una invitacion tiene, intercaladas, siete secciones "fuertes" (`.sec.verde`):
   ceremonia y fiesta, personas, regalos, confirmacion, el hashtag y demas. El
   motor las pinta con UN COLOR PLENO. Maki, mirando la de la playa (18/9/2026):

     «lo unico que yo le cambiaria es en donde estan los turquesas plenos. Le
      pondria algo con alguna estrellita de mar... una parecida a esa pero con
      el fondo medio celestito, un poquito mas claro.»

   VIENE APAGADO. Sin `INVEV.fx.tematica.banda` no hace absolutamente nada y
   toda invitacion que no la declare sigue con su color pleno de siempre.

   Como se enciende:
     INVEV.fx.tematica = {
       banda:      'https://.../invitame/fondos/playa-deco-suave',
       bandaTinta: '#1f3f49',   // el color de los titulos sobre la banda
       bandaColor: '#dcecf2',   // el tono de la banda
       bandaAlfa:  0.30,        // 0 = no se ve / 1 = tapa el video
       bandaFuerza: 0.18        // cuanto se notan los objetos de la capa
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
     1. El color de la banda es TRANSLUCIDO (`bandaAlfa`). El video de fondo se
        ve a traves, que era el punto.
     2. Los objetos no vienen en una foto opaca: vienen en una imagen sobre
        BLANCO PURO que se aplica en una capa aparte con `mix-blend-mode:
        multiply`. El blanco desaparece en la mezcla y quedan SOLO los objetos,
        flotando sobre el video. Sin recorte, sin canal alfa, sin depender de
        quitar fondos.
   ⚠️ LA CAPA VA EN UN HIJO, NO EN LA SECCION. `mix-blend-mode` mezcla con lo
   que hay DETRAS del elemento; puesto en la seccion se mezclaria consigo misma.
   Por eso se inyecta un `<span>` propio, absoluto, sin eventos y detras del
   texto.
   ⚠️ SI EL FONDO DE LA INVITACION YA TRAE OBJETOS (como el video de espuma y
   caracoles de Valeria), `bandaFuerza` va MUY BAJO o en 0: sumarle mas objetos
   encima es justo lo que Maki marco. La capa esta para las invitaciones cuyo
   fondo es liso.

   ⚠️⚠️ EL COLOR NO SE PELEA: SE ALIMENTA
   Primero intente ganar con `!important` y mas especificidad. No alcanza:
   `fondo-invitacion.js` declara `html[data-fondo] .sec.verde` con `!important`
   y su hoja va DESPUES, asi que a igual especificidad gana el. Medido en vivo
   tres veces: la hoja se escribia perfecta y el color seguia siendo el turquesa
   pleno.
   La salida no era subir la apuesta sino usar el sistema. Esa regla calcula
   `color-mix(--sec-col-v, transparente, --inv-oscuras)`: el color y la
   transparencia de la banda YA son dos variables. El modulo las setea en
   `variables()` y listo — el resultado es el que queremos y ademas queda
   integrado con el velo que maneja `velo-legible.js`, en vez de competir con el.

   POR QUE `repeat-y` Y NO `cover`
   La gracia de la imagen son LOS COSTADOS. Con `cover`, una seccion alta escala
   por el alto y RECORTA JUSTO LOS LADOS. Con `100% auto` + `repeat-y` el ancho
   entra completo y se repite hacia abajo; los bordes no tienen principio ni fin,
   asi que la union no se nota.

   LA BANDA ES CLARA, ASI QUE EL TEXTO TIENE QUE DARSE VUELTA
   `.sec.verde` nace pensada para fondo oscuro: h2 blanco, p crema, kick verde
   claro. Sobre una banda celeste clarita eso es blanco sobre blanco. Por eso
   este modulo reescribe esos colores con la tinta de la tematica. No se deja
   para que lo salve el corrector de contraste: un corrector es la red, no el
   diseno.

   SE REAPLICA POR UN RATO. La tematica llega de Firestore DESPUES de que carga
   este archivo, y el panel puede cambiarla en vivo.

   ES UNA PIEL, NO TOCA EL HTML. Se borra el <style>, se sacan los `<span>`
   marcados y las dos variables, y la invitacion vuelve a como estaba.
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

  function alfaDe(t) {
    var a = Number(t.bandaAlfa);
    return (a >= 0 && a <= 1) ? a : 0.34;
  }

  /* un color mas suave que la tinta, para los parrafos */
  function suave(tinta) {
    return 'color-mix(in srgb, ' + tinta + ' 76%, #ffffff)';
  }

  function css(t) {
    var url   = String(t.banda).replace(/"/g, '%22');
    var tinta = t.bandaTinta || t.tinta || '#2e433c';
    var fuerza = Number(t.bandaFuerza);
    if (!(fuerza >= 0 && fuerza <= 1)) fuerza = 0.18;

    return [
      /* el color lo pone variables(); aca solo lo que el motor no calcula */
      'html[data-fondo] .sec.verde,.sec.verde{',
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

  /* el color y la transparencia de la banda, por las variables del motor.
     Ver la nota «EL COLOR NO SE PELEA» de arriba. */
  function variables(t) {
    var raiz = document.documentElement.style;
    raiz.setProperty('--sec-col-v', t.bandaColor || '#dcecf2');
    /* `--inv-oscuras` es CUANTO SE TRANSPARENTA, o sea el complemento del alfa */
    raiz.setProperty('--inv-oscuras', String(1 - alfaDe(t)));
  }

  function pintar() {
    var t = tema();
    var f = firma(t);
    if (f === ultima) return;
    ultima = f;

    var hoja = document.getElementById(ID);
    if (!t.banda) {
      if (hoja) hoja.remove();
      document.documentElement.style.removeProperty('--sec-col-v');
      document.documentElement.style.removeProperty('--inv-oscuras');
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
    variables(t);
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
