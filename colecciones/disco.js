/* ===== COLECCIÓN «DISCO» ====================================================

   La primera colección OSCURA. Nace de la muestra de XV de Lupita: bolas de
   espejos, plata sobre negro. Maki, 19/9/2026, mirando la primera versión:

     «quedó como el orto»
     «pero mirá bien los colores de los textos, le pifiaste feo ahí»

   Y tenía razón. Medidos los textos que se veían en pantalla, había CATORCE
   colores distintos y tres familias peleando:

     8 veces  rgb(63,88,120)    azul acero      · subtítulos de los lugares
     6 veces  rgb(231,221,200)  crema cálido    · «MIS XV AÑOS», la cuenta regresiva
     3 veces  rgb(126,112,157)  lila            · nombres de los lugares
     3 veces  rgb(102,102,102)  gris suelto     · los nombres de Personas
     1 vez    rgb(47,42,38)     marrón          · «MAY 2027»

   Azul, lila, crema y marrón adentro de una invitación que tiene que ser plata
   y grafito. El error de fondo fue meter una temática NEGRA en el molde claro
   que funciona para playa y perlas: gris sucio en todas las secciones.

   ⚠️ POR QUÉ ESTO ES UNA COLECCIÓN Y NO UNA PALETA
   De las 20 paletas del catálogo no hay ninguna de plata y grafito, y además
   `efectos/paleta.js` reescribe sus variables cada 1,5 s con `!important` en el
   `<html>`: ninguna hoja de estilo le gana. El camino que ya dejó resuelto
   Marfil es publicar `window.INVCOLPALETA` con las variables que son SUYAS, y
   la paleta las pinta con ESE valor. Es la única forma de no pelearse con ella.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR, NO DIBUJA UNA INVITACIÓN NUEVA
   Todo es reversible y NO SACA NINGUNA SECCIÓN. Se apaga y la invitación vuelve
   intacta.

   ★ SE PRENDE con `INVEV.fx.coleccion = 'disco'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'disco';

  /* ---- LA FAMILIA. UNA SOLA. -----------------------------------------------
     Medida contra el papel: la plata sobre grafito da 11,8:1, y el grafito
     sobre plata (el texto adentro de los botones) 11,8:1 también. Las bajadas
     en plata media dan 6,1:1. Los tres pasan WCAG AA holgados. */
  var PAPEL   = '#15141A';   /* grafito casi negro, apenas frío */
  var PAPEL2  = '#1E1C25';   /* el papel, un tono más claro */
  var PLATA   = '#E6E4EE';   /* el principal: títulos, botones, bocina */
  var PLATA2  = '#A8A5B6';   /* bajadas y datos */
  var PLATA3  = '#6E6B7C';   /* filetes y bordes */
  var BRILLO  = '#F7F6FA';   /* el destello de las facetas */

  /* ⚠️ LOS ACENTOS TAMBIÉN SON DE LA COLECCIÓN.
     Marfil ya pagó esta: si se le dejan `--sage`, `--sage-cl` y `--oro` a la
     paleta elegida, el nombre del lugar sale violeta adentro de una invitación
     que es plata. Acá pasó igual con `azul-noche-plata`. Disco se los queda. */
  var PALETA_PROPIA = {
    '--verde':     PLATA,    /* el principal: títulos, botones, bocina */
    '--verde2':    PLATA2,   /* su versión apagada, para los degradés */
    '--muted':     PLATA2,   /* bajadas y datos */
    '--cream':     PAPEL,    /* el texto que va ARRIBA del principal */
    '--lino':      PAPEL,    /* el papel */
    '--lino2':     PAPEL2,   /* el papel, un tono más claro */
    '--sec-col-v': PAPEL2,   /* el color de sector */
    '--sage':      PLATA2,   /* acento 1 */
    '--sage-cl':   PLATA3,   /* acento 2 */
    '--oro':       BRILLO    /* acento 3 — plata brillante, nunca dorado */
  };

  /* ---- la hoja de estilo ---------------------------------------------------
     ⚠️ Sólo las superficies que están CLAVADAS en blanco y que la paleta no
     alcanza. Medidas en vivo el 19/9/2026 sobre lupita-mis15:
       .evento    rgb(250,251,252)   las tarjetas de ceremonia y fiesta
       .hotel     rgba(255,255,255,.55)
       .pasecard  rgb(246,243,237)   el pase con el QR
       .scratchcard rgb(246,243,237) la raspadita
       .rd-tapa   rgb(246,243,237)   la tapa del video y de la playlist
     El resto (.sec.verde, .e-tint, .cf-*-tint, body.tex-lino) sale de la
     paleta y ya queda bien con la tabla de arriba.

     ⚠️ `#dc-nada` no existe: está para subirle el peso a la regla sin tener que
     perseguir clases. Es el truco que ya usa Marfil. */
  var CSS = [
    ':is(#dc-nada, .evento), :is(#dc-nada, .hotel), :is(#dc-nada, .pasecard),',
    ':is(#dc-nada, .scratchcard), :is(#dc-nada, .rd-tapa), :is(#dc-nada, .col-vtapa){',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid rgba(230,228,238,.22)!important;',
    '  box-shadow:0 1px 0 rgba(230,228,238,.10) inset, 0 10px 28px rgba(0,0,0,.45)!important;',
    '}',
    /* el texto adentro de esas tarjetas */
    ':is(#dc-nada, .evento) *, :is(#dc-nada, .hotel) *, :is(#dc-nada, .pasecard) *{',
    '  color:' + PLATA + ';',
    '}',
    ':is(#dc-nada, .evento) .sub, :is(#dc-nada, .evento) .addr,',
    ':is(#dc-nada, .hotel) .sub{ color:' + PLATA2 + '!important; }',
    /* ⚠️ EL BOTÓN QUE NO SE LEÍA. Medido: texto rgb(247,233,230) sobre un botón
       claro. Ahora el botón es grafito con filete de plata y la letra plata. */
    ':is(#dc-nada, .btn), :is(#dc-nada, .acc-btn), :is(#dc-nada, .wsp){',
    '  background-image:none!important;',
    '  background-color:' + PAPEL2 + '!important;',
    '  color:' + PLATA + '!important;',
    '  border:1px solid rgba(230,228,238,.35)!important;',
    '  text-shadow:none!important;',
    '}',
    /* la raspadita y el pase, por dentro */
    ':is(#dc-nada, .scratchcard) *, :is(#dc-nada, .pasecard) *{ color:' + PLATA + '; }',
    /* el papel del marco */
    'html[data-col="' + ID + '"] body{ background-color:' + PAPEL + '!important; }'
  ].join('\n');

  /* ---- prender y apagar ---------------------------------------------------- */
  function activa() {
    try {
      var ev = window.INVEV || {};
      return !!(ev.fx && String(ev.fx.coleccion || '').toLowerCase() === ID);
    } catch (e) { return false; }
  }

  function hoja() {
    var s = document.getElementById('col-' + ID);
    if (!s) {
      s = document.createElement('style');
      s.id = 'col-' + ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  function sacarHoja() {
    var s = document.getElementById('col-' + ID);
    if (s) s.parentNode.removeChild(s);
  }

  function poner() {
    document.documentElement.setAttribute('data-col', ID);
    window.INVCOLPALETA = PALETA_PROPIA;
    hoja();
  }

  function sacar() {
    if (document.documentElement.getAttribute('data-col') === ID) {
      document.documentElement.removeAttribute('data-col');
    }
    if (window.INVCOLPALETA === PALETA_PROPIA) { window.INVCOLPALETA = null; }
    sacarHoja();
  }

  /* ⚠️ NADA DE MutationObserver ACÁ. Ya se pagó el 19/9/2026 con los videos:
     la invitación muta en bucle (reglas-duras.js corre con cada cambio de clase
     del marco), así que un observador dispara decenas de veces por segundo.
     Un repaso cada tanto alcanza y no machaca nada. */
  function sincronizar() {
    if (activa()) { poner(); } else { sacar(); }
  }

  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }

  /* para poder prenderla y apagarla a mano desde la consola, al revisar */
  window.INVDISCO = { poner: poner, sacar: sacar, paleta: PALETA_PROPIA };
})();
