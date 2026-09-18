/* ===== LA BANDA DE LA TEMATICA ================================================

   QUE RESUELVE
   Una invitacion tiene, intercaladas, seis o siete secciones "fuertes"
   (`.sec.verde`): ceremonia y fiesta, personas, regalos, confirmacion, el
   hashtag. El motor las pinta con UN COLOR PLENO, y ese color TAPA el fondo de
   la invitacion. Maki, mirando la de la playa (18/9/2026):

     «lo unico que yo le cambiaria es en donde estan los turquesas plenos… una
      parecida a esa pero con el fondo medio celestito, un poquito mas claro.»
     «me sacaste mucho del fondo, y el fondo estaba buenisimo, el del video.
      Donde dice raspa para revelar, como estaba antes me gustaba mas: se veia
      mucho mas el fondo de video.»
     «esta muy cargado de estrellitas y caracoles. Tenes que hacerlo mucho mas
      delicado: algun caracol dando vuelta por ahi. No 200, 1500.»

   O sea, tres cosas: el tono mas claro, que DEJE VER EL VIDEO, y los objetos
   apenas insinuados.

   VIENE APAGADO. Sin `INVEV.fx.tematica.banda` no hace absolutamente nada y
   toda invitacion que no la declare sigue con su color pleno de siempre.

   Como se enciende:
     INVEV.fx.tematica = {
       banda:      'https://.../invitame/fondos/playa-deco-suave',
       bandaTinta: '#1f3f49',   // el color de los titulos sobre la banda
       bandaColor: '#dcecf2',   // el tono de la banda
       bandaAlfa:  0.30,        // 0 = no se ve / 1 = tapa el video del todo
       bandaFuerza: 0.18        // cuanto se notan los objetos de la capa
     }

   ⚠️⚠️ POR QUE EL COLOR VA INLINE Y NO EN LA HOJA — dos intentos fallidos
   1. `.sec.verde{...!important}` en una hoja propia: NO alcanza.
      `fondo-invitacion.js` declara `html[data-fondo] .sec.verde` con
      `!important` y su hoja va DESPUES; a igual especificidad, gana el ultimo.
   2. Alimentar sus variables (`--sec-col-v`, `--inv-oscuras`) en `:root`: NO
      alcanza tampoco. `paleta.js` reescribe `--sec-col-v` desde `ev.color` y
      `fondo-invitacion.js` reescribe `--inv-oscuras` desde `fx.fondo.oscuras`,
      los dos DESPUES de este modulo. Medido en vivo: se seteaban y volvian.
   La unica forma que no depende del orden en que corre nadie es el estilo
   INLINE con prioridad, sobre cada seccion. Gana siempre, se reaplica en el
   mismo repaso de 6 segundos que el resto del modulo, y se borra limpio.
   No es fuerza bruta: es que ESTE modulo es el dueño del color de esas
   secciones cuando la banda esta encendida, y lo dice sin ambiguedad.

   ⚠️ LA CAPA DE OBJETOS VA EN UN HIJO, NO EN LA SECCION. `mix-blend-mode`
   mezcla con lo que hay DETRAS del elemento; puesta en la seccion se mezclaria
   consigo misma. Por eso se inyecta un `<span>` propio, absoluto, sin eventos
   y detras del texto. La imagen viene sobre BLANCO PURO: en `multiply` el
   blanco desaparece y quedan solo los objetos flotando sobre el video, sin
   recorte ni canal alfa.

   ⚠️ SI EL FONDO DE LA INVITACION YA TRAE OBJETOS (como el video de espuma y
   caracoles de Valeria), `bandaFuerza` va MUY BAJO o en 0: sumarle mas objetos
   encima es justo lo que Maki marco. La capa esta para los fondos lisos.

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

   ES UNA PIEL. Se borra el <style>, se sacan los `<span>` marcados y los
   estilos inline, y la invitacion vuelve exactamente a como estaba.
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
            t.bandaAlfa  === undefined ? '' : t.bandaAlfa,
            t.bandaFuerza === undefined ? '' : t.bandaFuerza].join('|');
  }

  /* '#1f3f49' -> 'rgba(31,63,73,α)' */
  function conAlfa(hex, a) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return 'rgba(220,236,242,' + a + ')';
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
    var fuerza = Number(t.bandaFuerza);
    if (!(fuerza >= 0 && fuerza <= 1)) fuerza = 0.18;

    return [
      /* el color de fondo lo pone pintarSecciones(), inline. Ver la nota. */
      '.sec.verde{position:relative}',
      /* la capa de objetos: el blanco desaparece en multiply */
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

  /* el color de cada banda, inline y con prioridad. Ver la nota de arriba. */
  function pintarSecciones(t) {
    var a = Number(t.bandaAlfa);
    if (!(a >= 0 && a <= 1)) a = 0.30;
    var color = conAlfa(t.bandaColor || '#dcecf2', a);
    var secs = document.querySelectorAll('.sec.verde');
    for (var i = 0; i < secs.length; i++) {
      secs[i].style.setProperty('background-color', color, 'important');
      secs[i].style.setProperty('background-image', 'none', 'important');
      /* una capa de objetos por banda, ni mas ni menos */
      if (!secs[i].querySelector(':scope > .inv-banda-deco')) {
        var c = document.createElement('span');
        c.className = 'inv-banda-deco';
        c.setAttribute('aria-hidden', 'true');
        secs[i].insertBefore(c, secs[i].firstChild);
      }
    }
  }

  function apagar(hoja) {
    if (hoja) hoja.remove();
    var v = document.querySelectorAll('.inv-banda-deco');
    for (var k = 0; k < v.length; k++) v[k].remove();
    var secs = document.querySelectorAll('.sec.verde');
    for (var i = 0; i < secs.length; i++) {
      secs[i].style.removeProperty('background-color');
      secs[i].style.removeProperty('background-image');
    }
  }

  function pintar() {
    var t = tema();
    var f = firma(t);
    var hoja = document.getElementById(ID);

    if (!t.banda) {
      if (f !== ultima) { ultima = f; apagar(hoja); }
      return;
    }

    if (f !== ultima) {
      ultima = f;
      if (!hoja) {
        hoja = document.createElement('style');
        hoja.id = ID;
        document.head.appendChild(hoja);
      }
      hoja.textContent = css(t);
    }
    /* ⚠️ ESTO VA EN CADA PASADA, no solo cuando cambia la firma: las secciones
       las escribe el motor despues, y otros modulos vuelven a pintarlas. */
    pintarSecciones(t);
  }

  function arrancar() {
    pintar();
    var n = 0;
    var t = setInterval(function () {
      try { pintar(); } catch (e) { clearInterval(t); }
      if (++n > 40) clearInterval(t);          /* 10 segundos */
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar, { once: true });
  } else { arrancar(); }
})();
