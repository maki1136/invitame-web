/* ===== EL CLIMA, DIBUJADO ======================================================

   ⭐ CÓMO APARECIÓ ESTO
   El 8/9/2026 se le sumó al banco de pruebas un chequeo nuevo: «no hay ni un
   emoji a la vista». Se corrió contra la muestra oficial y encontró uno a los
   dos segundos:  ⛅  en la sección del clima.

   La tarea «barrido de emojis en toda la invitación» figuraba terminada desde
   hacía días. Y estaba casi bien: se habían sacado todos menos éste, porque
   éste no está escrito en el HTML de una sección — lo escribe una función
   (`_wmo`) cuando llega el pronóstico, y sólo aparece si la invitación tiene
   las coordenadas cargadas. Mirando la pantalla no se veía; mirando el código
   tampoco saltaba.
   ★ Por eso los chequeos se escriben una vez y quedan corriendo para siempre:
     encuentran lo que uno ya dio por hecho.

   ⚠️ POR QUÉ UN MÓDULO Y NO ARREGLAR `i/index.html`
   Ahí es donde vive el emoji, pero ese archivo pesa 185 KB —más que el techo de
   subida medido— y además está CONGELADO POR VERSIÓN: arreglarlo ahí no llega a
   ninguna de las invitaciones ya entregadas. Los módulos de `/efectos/` no
   están congelados: los carga la misma lista para todas.

   ⚠️ NO SE MIRA EL EMOJI, SE MIRA EL TEXTO. El dibujo se elige por lo que dice
   `#clima-desc` («Lluvia», «Nublado»…), que es un dato estable. Si mañana se
   cambia el emoji de origen, esto sigue funcionando igual.

   ⚠️ LOS DIBUJOS HEREDAN EL COLOR de la invitación (`currentColor`), así que se
   visten con la paleta de cada boda, como el resto de los íconos de la marca.
   ============================================================================ */
(function () {

  var A = '<svg viewBox="0 0 64 64" width="58" height="58" fill="none" ' +
          'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" ' +
          'stroke-linejoin="round" aria-hidden="true" style="display:block;margin:0 auto">';
  var Z = '</svg>';

  var SOL   = '<circle cx="32" cy="30" r="10"/>' +
              '<path d="M32 12v-5M32 53v-5M14 30H9M55 30h-5M19 17l-3.5-3.5M48.5 46.5L45 43M45 17l3.5-3.5M15.5 46.5L19 43"/>';
  var NUBE  = '<path d="M20 46h24a9 9 0 0 0 .6-18A13 13 0 0 0 19 30a8 8 0 0 0 1 16z"/>';
  var SOLNUBE = '<circle cx="24" cy="22" r="7"/>' +
              '<path d="M24 9V5M24 39v-3M11 22H7M41 22h-4M15 13l-2.5-2.5M35.5 31.5L33 29M33 13l2.5-2.5"/>' +
              '<path d="M28 50h18a7.5 7.5 0 0 0 .5-15A11 11 0 0 0 27 36a6.6 6.6 0 0 0 1 14z"/>';
  var GOTAS = '<path d="M24 51l-2 5M32 51l-2 5M40 51l-2 5"/>';
  var LLUVIA= '<path d="M22 50l-3 8M31 50l-3 8M40 50l-3 8"/>';
  var NIEVE = '<path d="M22 53v6M19 56h6M38 53v6M35 56h6"/>';
  var RAYO  = '<path d="M33 48l-8 8h7l-2 7 9-9h-7z"/>';
  var NIEBLA= '<path d="M12 34h40M16 42h32M20 50h24"/>';

  /* El texto que escribe el motor  ->  el dibujo. */
  var DIBUJOS = [
    [/despejado$/i,            SOL],
    [/mayormente\s+despejado/i, SOLNUBE],
    [/nublado/i,               NUBE],
    [/neblina|niebla/i,        NIEBLA],
    [/llovizna/i,              NUBE + GOTAS],
    [/chubascos/i,             SOLNUBE + GOTAS],
    [/lluvia/i,                NUBE + LLUVIA],
    [/nevada|nieve/i,          NUBE + NIEVE],
    [/tormenta/i,              NUBE + RAYO],
    [/variable/i,              SOLNUBE]
  ];

  function dibujoPara(texto) {
    var t = String(texto || '').trim();
    for (var i = 0; i < DIBUJOS.length; i++) {
      if (DIBUJOS[i][0].test(t)) return A + DIBUJOS[i][1] + Z;
    }
    return A + SOLNUBE + Z;      /* si no se reconoce, el más neutro */
  }

  function tieneEmoji(s) {
    try { return /[☀-➿️]|\uD83C[\uDF00-\uDFFF]|\uD83C[\uDDE6-\uDDFF]|\uD83D[\uDC00-\uDFFF]/.test(String(s || '')); }
    catch (e) { return false; }
  }

  function poner() {
    var ico = document.getElementById('clima-ico');
    if (!ico) return;
    /* Ya está dibujado: no se toca (y así no se pelea con el observador). */
    if (ico.querySelector('svg')) return;
    if (!tieneEmoji(ico.textContent)) return;
    var desc = document.getElementById('clima-desc');
    ico.innerHTML = dibujoPara(desc ? desc.textContent : '');
    ico.style.color = ico.style.color || 'var(--verde,#4a4436)';
  }

  function arrancar() {
    poner();
    /* El pronóstico llega por internet: el ícono se escribe DESPUÉS. */
    try {
      var obs = new MutationObserver(function () { poner(); });
      var sec = document.getElementById('clima-sec');
      if (sec) obs.observe(sec, { childList: true, subtree: true, characterData: true });
      setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 30000);
    } catch (e) {
      /* navegador viejo: se reintenta un rato a mano */
      var n = 0, t = setInterval(function () { poner(); if (++n > 30) clearInterval(t); }, 500);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
