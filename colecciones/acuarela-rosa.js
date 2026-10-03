/* ===== COLECCIÓN «ACUARELA ROSA» ==============================================

   Nace el 29/9/2026 del repaso §49 de la muestra `martina-mis15`, que hasta hoy
   no tenía colección (se armaba sólo con el panel).

   ⭐ EL PEDIDO DE MAKI, textual:
      «El fondo de mesa de regalos es el que tiene que estar en las partes rosas
       o blancas, así era el diseño original, que más se tiene que ver.»

   → Toda la invitación va sobre EL MISMO fondo: las rosas en acuarela con las
     mariposas doradas de «Mesa de regalos». La imagen original es apaisada
     (2280×733) y estirada con `cover` en una sección alta se volvía una mancha;
     se armó una versión ALTA (1080×1920) con las MISMAS flores y mariposas
     recortadas de esa imagen: `invitame/martina/mt-fondo-flores-29-9`.
   → Las bandas rosas (`.sec.verde`, el pase, la confirmación) dejan de ser
     rosas: van sobre las flores, y su letra, que era BLANCA, pasa a la tinta
     de la colección.

   ⚠️ NO escribe `data-coleccion`, sólo `data-col`. Es a propósito: los
      defaults claros del motor (`html:not([data-coleccion]) …`: raspadita, pase,
      QR, itinerario, Personas) siguen funcionando, y esta hoja sólo los viste.
      El cuadriculado que traían esos defaults se sacó del motor el mismo día
      (`efectos/vestido-basico.js`, PR #42).

   Lo que resuelve, además (repaso §49):
      · el pase con el QR va ABAJO de la raspadita (`moverPase`, igual que Perlas)
      · las tapas de video y playlist llevan foto (proyector y tocadiscos rosas)
      · la raspadita va SIN recuadro y se raspa una rosa de la misma acuarela
      · el formulario de confirmación, que venía pintado para fondo OSCURO
   =============================================================================== */
(function () {
  'use strict';

  var ID     = 'acuarela-rosa';
  var ID_CSS = 'col-acuarela-rosa';
  var P      = 'html[data-col="' + ID + '"] ';

  var TINTA  = '#7A3F52';   /* rosa hondo: títulos y nombres */
  var TINTA2 = '#6A4E56';   /* el cuerpo */
  var ACENTO = '#B06A7E';   /* el rosa de Martina: filetes y detalles */
  var PAPEL  = '#FBF6F5';
  var ORO    = '#B8923E';

  var CL = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var FONDO      = CL + 'q_auto,f_auto,w_1080/invitame/martina/mt-fondo-flores-29-9';
  var RASP       = CL + 'q_auto,f_auto,w_480/invitame/martina/mt-rasp-rosa-29-9';
  var TAPA_VIDEO = CL + 'q_auto,f_auto,w_1100/invitame/martina/mt-tv-proy-29-9';
  var TAPA_PLAY  = CL + 'c_fill,w_800,h_730,q_auto,f_auto/invitame/martina/mt-sp-disco-29-9';

  /* el velo sobre las flores: CLARO y bajo, para que las flores se vean
     («que más se tiene que ver»). Medido: con .30 el cuerpo #6A4E56 da > 6. */
  var VELO = 'linear-gradient(rgba(251,246,245,.30), rgba(251,246,245,.30))';

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === ID;
    } catch (e) {}
    try { return String(((ev().fx) || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }

  function armarCSS() {
    var SECS = P + '.frame > section.sec, ' + P + '.frame > section.pase, ' + P + '.frame > .sec';
    return [
      /* ---- EL FONDO DE REGALOS EN TODAS LAS SECCIONES ----
         ⚠️ Con `!important`: el aplicador del panel escribe `background-image`
            INLINE en regalos, confirmación, galería…, y un inline sólo pierde
            contra una hoja con `!important`. */
      SECS + '{',
      '  background-color:' + PAPEL + '!important;',
      '  background-image:' + VELO + ', url("' + FONDO + '")!important;',
      '  background-size:cover, cover!important;',
      '  background-position:center, center top!important;',
      '  background-repeat:no-repeat, no-repeat!important;',
      '}',
      /* los pseudo-velos del molde sobre las bandas «verdes» (el rosa) */
      P + '.sec.verde::before, ' + P + '.sec.verde::after, ' + P + '.pase::before, ' + P + '.pase::after{ background:none!important; opacity:0!important; }',

      /* ---- LA LETRA: lo que era blanco sobre rosa pasa a la tinta ---- */
      P + '.sec h2, ' + P + '.sec h3, ' + P + '.pase .t, ' + P + '.sec .kick, ' + P + '#gal-kick, ' + P + '#gal-h2{',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:none!important;',
      '}',
      P + '.sec .kick, ' + P + '.pase > .t, ' + P + '#gal-kick{',
      '  font-family:"Dancing Script", cursive!important; font-weight:600!important;',
      '  font-size:24px!important; letter-spacing:0!important;',
      '}',
      P + '.sec p, ' + P + '.sec li, ' + P + '.sec .sub, ' + P + '.sec .txt, ' + P + '.sec .nm, ' + P + '.sec .rl, ' + P + '.sec .d, ' + P + '#hashtag-sec *, ' + P + '[data-sec="hashtag"] *:not(.btn):not(a){',
      '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; text-shadow:none!important;',
      '}',
      P + '[data-sec="hashtag"] .tag, ' + P + '[data-sec="hashtag"] h3, ' + P + '.padres .nm{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '.adorno{ color:' + ORO + '!important; }',

      /* ---- EL FORMULARIO: venía para fondo OSCURO (blanco al 8 %) ---- */
      P + '.rsvpform label, ' + P + '.rsvpform .lbl, ' + P + '.rsvp label{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '.rsvpform input, ' + P + '.rsvpform select, ' + P + '.rsvpform textarea{',
      '  background:rgba(255,255,255,.88)!important; color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
      '  border:1px solid rgba(176,106,126,.55)!important;',
      '}',
      P + '.rsvpform input::placeholder, ' + P + '.rsvpform textarea::placeholder{ color:rgba(106,78,86,.55)!important; -webkit-text-fill-color:rgba(106,78,86,.55)!important; }',
      P + '.rsvp .si span, ' + P + '.rsvp .no span, ' + P + '.rsvp-sw span, ' + P + '.rsvpform small{ color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; }',

      /* ---- LAS TARJETAS: papel claro con el filete rosa ---- */
      P + ':is(.evento, .hotel){ background-color:rgba(255,255,255,.90)!important; border:1px solid rgba(176,106,126,.35)!important; }',

      /* ---- EL PASE: papel claro, filete rosa y una rosa de medallón ---- */
      P + '.pasecard{ position:relative!important; overflow:visible!important; padding-top:34px!important; box-shadow:inset 0 0 0 7px #fff, inset 0 0 0 8px rgba(176,106,126,.55), 0 12px 28px rgba(122,63,82,.18)!important; }',
      P + '.pasecard::before{ content:""!important; position:absolute!important; top:-18px!important; left:50%!important; width:36px!important; height:36px!important; margin-left:-18px!important; border-radius:50%!important; background:url("' + RASP + '") center/cover no-repeat!important; box-shadow:0 0 0 2px #fff, 0 0 0 3px rgba(176,106,126,.6), 0 4px 10px rgba(122,63,82,.2)!important; z-index:3!important; pointer-events:none!important; }',

      /* ---- LA RASPADITA: sin recuadro, y se raspa una rosa de la acuarela ----
         ⚠️ `--r3-tapa` va SIN prefijo y en toda la rama: el canvas se pinta una
            sola vez, antes de que la colección alcance a poner `data-col`. */
      ':is(.scratch-sec, .rasp-3, .rasp-zona, #scratchcard){ --r3-tapa:url("' + RASP + '"); }',
      P + '.scratchcard, ' + P + '#scratchcard{ background:none!important; border:0!important; box-shadow:none!important; }',
      P + '.scratchcard::after, ' + P + '#scratchcard::after{ display:none!important; }',
      P + '.rasp-zona{ box-shadow:0 0 0 3px #fff, 0 0 0 4px rgba(176,106,126,.55), 0 6px 14px rgba(122,63,82,.18)!important; }',
      P + '.rasp-zona.dormida canvas{ filter:none!important; }',

      /* ---- LAS TAPAS CON FOTO (§48) ---- */
      P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(122,63,82,.30) 0, rgba(122,63,82,.10) 26%, rgba(122,63,82,0) 46%), url("' + TAPA_VIDEO + '") center 45%/cover no-repeat!important; border-radius:18px!important; border:0!important; box-shadow:0 12px 28px rgba(122,63,82,.22), 0 0 0 1px rgba(176,106,126,.5)!important; }',
      P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(122,63,82,.30) 0, rgba(122,63,82,.10) 26%, rgba(122,63,82,0) 46%), url("' + TAPA_PLAY + '") center 50%/cover no-repeat!important; border-radius:18px!important; border:0!important; box-shadow:0 12px 28px rgba(122,63,82,.22), 0 0 0 1px rgba(176,106,126,.5)!important; }',
      P + ':is(#video-sec, #spotify-sec) .rd-tapa .rd-txt{ color:#fff!important; -webkit-text-fill-color:#fff!important; text-shadow:0 1px 4px rgba(60,20,32,.9), 0 0 12px rgba(60,20,32,.6)!important; }',

      /* ---- el itinerario: la caja clara sobre las flores, con su filete ---- */
      P + '.tl{ background-color:rgba(255,255,255,.82)!important; background-image:none!important; border:1px solid rgba(176,106,126,.35)!important; }',
      /* el «ambiente» de nubes del itinerario (fx.ambiente) pinta un cielo propio
         encima del fondo: con las flores en todas las secciones se veía como un
         parche blanco. En esta colección no va. */
      P + '[data-sec="itinerario"] .ambiente, ' + P + '[data-sec="itinerario"] .amb-front{ display:none!important; }',
      /* la rosa del medallón del pase no pisa «Con cariño, te esperamos» */
      P + '.pase > .t{ margin-bottom:26px!important; }',
      ''
    ].join('\n');
  }

  function fuentes() {
    if (document.querySelector('link[data-col-fuentes="' + ID + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap';
    l.setAttribute('data-col-fuentes', ID);
    document.head.appendChild(l);
  }

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    var t = armarCSS();
    if (s.textContent !== t) s.textContent = t;
  }

  /* 🔴 EL PASE CON EL QR VA ABAJO DE LA RASPADITA (decisión 12). Misma función
     que Perlas y Sirena; `devolverPase()` corre SÓLO si esta colección lo movió. */
  var estabaPuesta = false;
  function moverPase() {
    try {
      var pase = document.querySelector('.pase');
      var rasp = document.querySelector('.sec.scratch-sec');
      if (!pase || !rasp) return;
      if (rasp.parentElement !== pase.parentElement) return;
      var ant = pase.previousElementSibling;                   /* el ticket con voz va en el medio (3/10) */
      if (ant && ant.id === 'pv-sec') ant = ant.previousElementSibling;
      if (ant === rasp) return;
      var tras = rasp.nextSibling && rasp.nextSibling.id === 'pv-sec' ? rasp.nextSibling : rasp;
      rasp.parentNode.insertBefore(pase, tras.nextSibling);
    } catch (e) {}
  }
  function devolverPase() {
    try {
      var pase = document.querySelector('.pase');
      var port = document.querySelector('.portada');
      if (!pase || !port) return;
      if (port.parentElement !== pase.parentElement) return;
      if (pase.previousElementSibling === port) return;
      port.parentNode.insertBefore(pase, port.nextSibling);
    } catch (e) {}
  }

  function poner() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') !== ID) raiz.setAttribute('data-col', ID);
    fuentes();
    hoja();
    moverPase();
    estabaPuesta = true;
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') === ID) raiz.removeAttribute('data-col');
    var s = document.getElementById(ID_CSS);
    if (s && s.parentNode) s.parentNode.removeChild(s);
    if (estabaPuesta) devolverPase();
    estabaPuesta = false;
  }

  /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle. Repaso de 1,2 s
     (INVEV puede llegar después de `load`). */
  function sincronizar() { if (activa()) poner(); else sacar(); }

  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.INVACUARELAROSA = { poner: poner, sacar: sacar, css: armarCSS };
})();
