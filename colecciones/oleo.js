/* ===== COLECCIÓN «ÓLEO» =====================================================

   La primera de la línea ARTE (23/9/2026). Maki mandó el tablero de Pinterest
   «arte-invitaciones»: pinturas al óleo con espátula, impasto grueso, flores
   abstractas en relieve, hoja de oro. Le puso el nombre: «Óleo».

   La primera muestra es ÓLEO ROSÉ (ximena-y-andres, San Miguel de Allende):
   rosa empolvado, nude, marfil, champaña y hoja de oro.

   ⭐ EL CONCEPTO: una GALERÍA. La invitación es la pared clara; cada tarjeta es
      un lienzo colgado (esquinas casi rectas, sombra de cuadro sobre la pared)
      y la pintura de fondo se ve detrás de todo, en video, adelante como la
      boho (fx.fondo donde:'marco', paso alto).
   ⭐ LAS LETRAS: Bodoni Moda (la voz de catálogo de museo) + Jost (la ficha
      técnica). Ninguna cursiva de fábrica: el nombre va en Bodoni itálica.
      ⚠️ LA ESCALA TIPOGRÁFICA ESTÁ REESCRITA ENTERA (el motor calibra para una
         cursiva y acá el sobretítulo es una versalita de Jost).
   ⭐ LA MARCA: una pincelada de espátula (vector) arriba de cada título, un
      toque de pintura en cada hora del itinerario, y el MEDALLÓN pintado
      (foto de Flow) en la raspadita y en ¿Alguna duda?.
   ⭐ LAS BANDAS: palo de rosa profundo, con la PINTURA misma a baja opacidad
      en una capa propia ('::before' + opacity + soft-light — NUNCA
      background-blend-mode, ver Cantera) y el borde de arriba ORGÁNICO,
      asimétrico, como el canto de una pincelada.

   CONTRASTES (WCAG, calculados sobre los hex de abajo):
      TINTA  #4A2E2C sobre PAPEL #F7EFEA → 10,8
      TINTA2 #6B4744 sobre PAPEL         →  7,1
      ORO_T  #7A5634 sobre PAPEL         →  5,8   (sobretítulo 12 px)
      CREMA  #FBF4EF sobre BANDA #82504C →  6,1
      CREMA2 #F5E6DF sobre BANDA         →  5,4

   ⚠️ VIENE APAGADA. Sin 'INVEV.fx.coleccion === 'oleo'' no hace nada.
      Para probar sin tocar la base: '?coleccion=oleo'
   ⚠️ NO TOCA NADA GLOBAL AL CARGARSE. Todo lo que escribe afuera va en
      'poner()' y tiene su línea espejo en 'sacar()'.
   ⚠️ Con el fondo en video la colección entra tarde: se mide a los 15 s.
   ============================================================================ */
(function () {
  'use strict';

  var ID    = 'oleo';
  var MARCA = 'data-oleo';
  var P = 'html[' + MARCA + '] ';

  /* ----------------------------------------------------------- la paleta */
  var ROSA    = '#C98E8A';   /* rosa empolvado — el acento               */
  var NUDE    = '#E3C2B8';   /* nude — rellenos suaves                   */
  var CHAMP   = '#D9C3A0';   /* champaña — botones                       */
  var ORO     = '#B08A4E';   /* hoja de oro — filetes, material          */
  var PAPEL   = '#F7EFEA';   /* la pared: marfil rosado                  */
  var PAPEL2  = '#FBF6F2';   /* el lienzo de las tarjetas                */
  var TINTA   = '#4A2E2C';   /* palo de rosa profundo, cuerpo: 10,8      */
  var TINTA2  = '#6B4744';   /* secundaria: 7,1                          */
  var ORO_T   = '#7A5634';   /* oro bajado, para texto chico: 5,8        */
  var BANDA   = '#82504C';   /* las bandas plenas (var --verde)          */
  var CREMA   = '#FBF4EF';   /* tinta sobre banda: 6,1                   */
  var CREMA2  = '#F5E6DF';   /* sobretítulo sobre banda: 5,4             */
  var TINTA_BTN = '#2E1C1B'; /* sobre champaña                           */
  var HALO    = 'rgba(247,239,234,';

  var CDN      = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var PINTURA  = CDN + 'f_auto,q_auto:eco,w_720/invitame/oleo/oleo-rose-base.webp';
  var MEDALLON = CDN + 'f_auto,q_auto,w_256/invitame/piezas/oleo-medallon-rose-2.webp';

  var LIENZO   = '6px';        /* las esquinas de un bastidor */
  /* el canto de arriba de las bandas: una pincelada, no un arco */
  var CANTO    = '46% 54% 0 0 / 58px 34px 0 0';

  function svgURL(svg) {
    return 'url("data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/"/g, "'") + '")';
  }

  /* La pincelada de espátula: un trazo grueso que se afina, con un brillo. */
  function pincelada(c1, c2) {
    return svgURL(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 22">' +
      '<path d="M14 13c10-7 30-10 52-9 16 .7 30 3 40 6-9 3-24 5-40 5.6C44 16.4 26 16 14 13z" fill="' + c1 + '" opacity=".9"/>' +
      '<path d="M30 10.5c12-3 28-4 44-3.2" stroke="' + c2 + '" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".75"/>' +
      '<path d="M86 12.6c6 .3 11 .9 15 1.6" stroke="' + c2 + '" stroke-width="1.1" stroke-linecap="round" fill="none" opacity=".55"/>' +
      '</svg>');
  }

  /* ⭐ 23/9, Maki: «¿qué es ese coso rosa abajo de 'estamos para ayudarte'? No me
     gusta, cambialo». Era la pincelada rosa de arriba de cada título. Va un FILETE
     de hoja de oro, fino y afinado en las puntas, con un punto al medio. */
  function filete(color) {
    return svgURL(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 10">' +
      '<path d="M8 5.2C30 4.4 48 4.3 56 5c-8 .6-26 .7-48 .2z" fill="' + color + '" opacity=".85"/>' +
      '<path d="M112 5.2C90 4.4 72 4.3 64 5c8 .6 26 .7 48 .2z" fill="' + color + '" opacity=".85"/>' +
      '<circle cx="60" cy="5" r="1.7" fill="' + color + '"/>' +
      '</svg>');
  }
  /* y la marca de cada hora deja de ser una gota rosa: un aro de oro */
  function aro(color) {
    return svgURL(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<circle cx="12" cy="12" r="7" fill="#FBF6F2" stroke="' + color + '" stroke-width="1.6"/>' +
      '<circle cx="12" cy="12" r="2.4" fill="' + color + '"/>' +
      '</svg>');
  }

  /* El toque de pintura de cada hora: una gota de óleo con brillo. */
  function toque(color, brillo) {
    return svgURL(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<path d="M12 3.5c4.6.4 8.2 3.4 8.2 8.1 0 4.9-3.7 8.9-8.6 8.9-4.6 0-8-3.3-8-7.8C3.6 7.8 7 3.1 12 3.5z" fill="' + color + '"/>' +
      '<path d="M8.4 9.2c1.2-2 3-3 5.2-3.1" stroke="' + brillo + '" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".8"/>' +
      '</svg>');
  }

  var PALETA_PROPIA = {
    '--papel':      PAPEL,
    '--lino':       PAPEL,
    '--lino2':      PAPEL2,
    '--tinta':      TINTA,
    '--tinta2':     TINTA2,
    '--tinta3':     TINTA2,
    '--verde':      BANDA,
    '--sec-col-v':  BANDA,
    '--acento':     ORO,
    '--acento2':    ROSA,
    '--sec-col':    PAPEL,
    '--tl-papel':   PAPEL2,
    '--tl-tinta':   TINTA,
    '--cf-sobre':   PAPEL2,
    '--cf-col':     TINTA,
    '--sobre-c':    PAPEL,
    '--flap-base':  NUDE,
    '--seal-c':     ROSA
  };

  function ev()  { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      if (/[?&]coleccion=oleo\b/.test(location.search)) return true;
      return String((ev().fx || {}).coleccion || '').toLowerCase() === ID;
    } catch (e) { return false; }
  }

  /* ============================================================== la hoja CSS */
  function armarCSS() {
    var PZ  = filete(ORO);                 /* sobre papel */
    var PZC = filete('#EAD9B8');           /* sobre banda */
    var TQ  = aro(ORO);

    /* la pintura, en capa propia con opacidad (bandas y pie) */
    var CAPA_PINTURA = [
      '  content:""!important;',
      '  position:absolute!important; inset:0!important;',
      '  z-index:0!important; pointer-events:none!important;',
      '  background-image:url("' + PINTURA + '")!important;',
      '  background-size:cover!important; background-position:center!important;',
      '  background-repeat:no-repeat!important;',
      '  opacity:.16!important;',
      '  mix-blend-mode:soft-light!important;',
      '  border-radius:inherit!important;'
    ].join('\n');

    return [

    /* ─────────────────────────────────────────────── 1 · LAS LETRAS */
    '@import url("https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500&family=Jost:wght@300;400;500&display=swap");',

    P + '.sec h2, ' + P + '.frase, ' + P + '.portada #pv-names, ' + P + '.padres .nm, ' + P + '.evento h3, ' + P + '.hotel h3{',
    '  font-family:"Bodoni Moda",Didot,Georgia,serif!important;',
    '}',
    P + '.sec p, ' + P + '.sec .kick, ' + P + '.btn, ' + P + '.evento .sub, ' + P + '.evento .addr, ' + P + '.wsp{',
    '  font-family:Jost,system-ui,sans-serif!important;',
    '}',

    P + '.sec .kick{',
    '  font-size:11.5px!important; line-height:1.5!important;',
    '  letter-spacing:.3em!important; text-indent:.3em!important; text-transform:uppercase!important;',
    '  font-weight:500!important; color:' + ORO_T + '!important;',
    '  margin:0 0 10px 0!important;',
    '}',
    P + '.sec h2{',
    '  font-size:23px!important; line-height:1.22!important;',
    '  font-weight:400!important; letter-spacing:.01em!important;',
    '  color:' + TINTA + '!important;',
    '  padding-top:20px!important; margin:0 0 12px 0!important;',
    '  background-image:' + PZ + '!important;',
    '  background-repeat:no-repeat!important;',
    '  background-position:center top!important;',
    '  background-size:84px auto!important;',
    '}',
    P + '.frase{ font-size:19px!important; line-height:1.6!important; font-style:italic!important; font-weight:400!important; color:' + TINTA + '!important; }',
    P + '.sec p:not(.frase){ font-size:15.5px!important; line-height:1.7!important; font-weight:300!important; color:' + TINTA2 + '!important; }',
    P + '.evento .sub, ' + P + '.evento .addr{ color:' + TINTA2 + '!important; font-weight:400!important; }',

    /* ─────────────────────────────────────────────── 2 · LA PORTADA
       El bloque va al PIE (Campestre: flex-end, del 56 % al 91 %). */
    P + '.portada{ justify-content:flex-end!important; }',
    P + '#pv-kick{',
    '  font-size:11.5px!important; letter-spacing:.38em!important;',
    '  text-indent:.38em!important; text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  font-family:Jost,sans-serif!important; font-weight:400!important;',
    '  margin:0 0 8px 0!important;',
    '  text-shadow:0 1px 3px rgba(40,20,18,.55)!important;',
    '}',
    P + '#pv-names{',
    '  font-size:clamp(44px,12.5vw,70px)!important;',
    '  line-height:1.06!important; font-weight:400!important;',
    '  font-style:italic!important; letter-spacing:0!important;',
    '  text-transform:none!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  text-shadow:0 1px 2px rgba(40,20,18,.55), 0 0 26px rgba(40,20,18,.40)!important;',
    '  margin:0!important; padding-bottom:.06em!important;',
    '}',
    P + '.portada .num{ font-size:32px!important; color:' + CREMA + '!important; font-family:"Bodoni Moda",serif!important; }',

    /* ─────────────────────────────────── 3 · LOS LIENZOS
       Esquinas de bastidor y sombra de cuadro colgado. Sin arco: el arco es
       de Cantera y además se comía los nombres de los hoteles. */
    P + ':is(.evento, .hotel, .pasecard){',
    '  border-radius:' + LIENZO + '!important;',
    '  overflow:hidden!important;',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid rgba(176,138,78,.28)!important;',
    '  box-shadow:0 12px 26px rgba(74,46,44,.13), 0 2px 5px rgba(74,46,44,.08)!important;',
    '}',
    P + ':is(.evento, .hotel) img{',
    '  border-radius:' + LIENZO + ' ' + LIENZO + ' 0 0!important;',
    '  display:block!important; width:100%!important;',
    '}',
    P + '.evento{ margin:0 0 28px!important; }',
    P + '.evento .ph{ height:230px!important; }',
    P + '.hotel{ text-align:center!important; }',
    P + '.hotel .btn{ margin:10px auto 0!important; }',
    /* la galería: lienzos con paspartú marfil */
    P + ':is(.gal figure, .gal a){ border-radius:3px!important; overflow:hidden!important; }',
    P + '.gal img{',
    '  display:block!important; border-radius:3px!important;',
    '  border:6px solid ' + PAPEL2 + '!important;',
    '  box-shadow:0 10px 22px rgba(74,46,44,.16)!important;',
    '}',

    /* ─────────────────────── 4 · PERSONAS: LAS TRES EN UNA FILA */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important; background-color:transparent!important;',
    '}',
    P + '.padres .av{',
    '  width:104px!important; height:104px!important; border-radius:50%!important; overflow:hidden!important;',
    '  box-shadow:0 0 0 3px ' + PAPEL2 + ', 0 0 0 4px rgba(201,142,138,.65), 0 8px 18px rgba(74,46,44,.18)!important;',
    '}',
    P + '.padres .nm{ font-size:18px!important; color:' + TINTA + '!important; }',

    /* la flecha de los acordeones hereda el color de su botón */
    P + '.btn .chev, ' + P + '.chev{ color:inherit!important; opacity:.85!important; }',

    /* ─────────────── 5 · EL PASE CON EL QR, SIN CANTO RECTO
       La foto se muda a ::before (background-image:inherit, sigue saliendo
       del panel) y se desvanece arriba y abajo. */
    P + '.pase{ position:relative!important; background-size:0 0!important; }',
    P + '.pase > *{ position:relative; z-index:1; }',
    P + '.pase::before{ content:""!important; position:absolute!important; inset:0!important; z-index:0!important; background-image:inherit!important; background-size:cover!important; background-position:center!important; -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,#000 24%,#000 76%,rgba(0,0,0,0) 100%)!important; mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,#000 24%,#000 76%,rgba(0,0,0,0) 100%)!important; }',
    P + '.pasecard .t{ font-family:"Bodoni Moda",serif!important; font-size:20px!important; color:' + TINTA + '!important; }',
    P + '.pasecard .k{ font-family:Jost,sans-serif!important; font-size:10.5px!important; letter-spacing:.2em!important; text-transform:uppercase!important; color:' + ORO_T + '!important; }',
    P + '.pasecard .v{ font-family:"Bodoni Moda",serif!important; font-size:16px!important; color:' + TINTA + '!important; }',
    P + '.pasecard .estado{ background-color:rgba(201,142,138,.20)!important; color:' + TINTA + '!important; border:1px solid rgba(201,142,138,.55)!important; }',

    /* los WhatsApp también son botones */
    P + '.wsp{ text-transform:uppercase!important; letter-spacing:1.6px!important; font-size:12px!important; }',

    /* ─────────────── 6 · LA RASPADITA: EL MEDALLÓN PINTADO
       --r3-tapa la lee raspadita.js DESDE EL CANVAS: se declara en toda la
       rama. Va por Cloudinary: raspadita.js carga la foto con crossOrigin='anonymous' y el canvas no se tiñe. */
    ':is(.scratch-sec, .rasp-3, .rasp-zona, #scratchcard){',
    '  --r3-tapa:url("' + MEDALLON + '");',
    '}',
    P + '.rasp-zona.dormida canvas{ filter:none!important; }',
    P + '.scratchcard{ background-color:transparent!important; background-image:none!important; border:0!important; box-shadow:none!important; }',
    P + '.scratchcard::after{ display:none!important; }',
    P + '.ivf .c{',
    '  background-color:' + NUDE + '!important;',
    '  background-image:url("' + MEDALLON + '")!important;',
    '  background-size:cover!important; background-position:center!important;',
    '  border-radius:50%!important;',
    '  box-shadow:0 4px 10px rgba(74,46,44,.22)!important;',
    '}',
    P + '.ivf .n{ color:' + TINTA + '!important; }',

    /* los círculos de «los colores de la boda»: aro de tinta, no blanco */
    P + '.col-dc-c{ box-shadow:inset 0 0 0 1px rgba(74,46,44,.28), 0 1px 3px rgba(74,46,44,.14)!important; }',

    /* la tapa del video y de la playlist (.rd-tapa) no es otro papel */
    P + ':is(.rd-tapa, .col-vtapa){ background-color:transparent!important; background-image:none!important; border:0!important; box-shadow:none!important; }',

    /* ─────────────── 7 · EL ITINERARIO, UNA COLUMNA (como Perlas)
       Marca y vía ADENTRO del panel: relleno izquierdo 56 px, vía a 34 px. */
    P + '.tl{',
    '  background-color:rgba(251,246,242,.78)!important;',
    '  background-image:none!important;',
    '  border-radius:' + LIENZO + '!important;',
    '  box-shadow:0 12px 26px rgba(74,46,44,.10)!important;',
    '  padding:26px 24px 26px 56px!important;',
    '}',
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  left:34px!important; width:2px!important;',
    '  background-image:linear-gradient(180deg, ' + ROSA + ', ' + ORO + ')!important;',
    '  background-color:transparent!important;',
    '  opacity:.55!important; border-radius:2px!important;',
    '  top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important;',
    '}',
    P + '.tl .it .h{ color:' + TINTA + '!important; font-family:"Bodoni Moda",serif!important; }',
    P + '.tl .it .d{ color:' + TINTA2 + '!important; }',
    P + '.tl > .it::before{',
    '  content:""!important;',
    '  width:18px!important; height:18px!important; left:-30px!important;',
    '  border-radius:50%!important;',
    '  background-image:' + TQ + '!important;',
    '  background-size:contain!important; background-repeat:no-repeat!important;',
    '  background-color:transparent!important; border:0!important;',
    '  box-shadow:0 0 0 4px ' + HALO + '.9)!important;',
    '}',

    /* ─────────────── 8 · LOS BOTONES: champaña con brillo de barniz
       La tinta NO se clava (el estilo de botón lo elige Jazmín). */
    P + '.btn{',
    '  font-size:12px!important; letter-spacing:.16em!important; text-transform:uppercase!important;',
    '  background-color:' + CHAMP + '!important;',
    '  background-image:linear-gradient(172deg, rgba(255,255,255,.30), rgba(255,255,255,0) 45%, rgba(120,70,60,.10))!important;',
    '  border:1px solid rgba(134,96,58,.30)!important;',
    '  border-radius:3px!important;',
    '  box-shadow:0 6px 14px rgba(74,46,44,.16), inset 0 1px 0 rgba(255,255,255,.4)!important;',
    '}',
    P + '.btn:not(.gh){ color:' + TINTA_BTN + '; -webkit-text-fill-color:currentColor; }',
    P + '.btn.gh{',
    '  color:' + TINTA + '!important;',
    '  background-color:transparent!important; background-image:none!important;',
    '  border:1px solid rgba(134,96,58,.5)!important; box-shadow:none!important;',
    '}',

    /* ─────────────── 9 · LA CARTA NO ES BLANCA */
    P + '.cf-letter{ background:linear-gradient(180deg,#FBF4EF 0%,#F2E4DC 100%)!important; color:' + TINTA + '!important; }',
    P + '.cf-letter h3{ font-family:"Bodoni Moda",serif!important; color:' + TINTA + '!important; }',

    /* ─────────────── 10 · LAS BANDAS: PALO DE ROSA, PINTURA Y CANTO DE PINCELADA */
    P + '.sec.verde{',
    '  position:relative!important;',
    '  border-radius:' + CANTO + '!important;',
    '  padding-top:92px!important;',
    '  background-image:linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.14) 100%)!important;',
    '}',
    P + '.sec.verde::before{',
    CAPA_PINTURA,
    '}',
    /* un filete de hoja de oro que sigue el canto */
    P + '.sec.verde::after{',
    '  content:""!important; position:absolute!important; inset:0!important;',
    '  z-index:0!important; pointer-events:none!important;',
    '  border-radius:inherit!important;',
    '  box-shadow:inset 0 2px 0 rgba(217,195,160,.55)!important;',
    '}',
    P + '.sec.verde > *{ position:relative!important; z-index:1!important; }',
    P + '.sec.verde + .sec.verde{ border-radius:0!important; padding-top:14px!important; }',

    /* la tinta de las bandas: dos juegos, con banda temática o sin */
    'html[' + MARCA + ']:not([data-banda]) .sec.verde h2{',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  background-image:' + PZC + '!important;',
    '  text-shadow:0 1px 3px rgba(40,20,18,.35)!important;',
    '}',
    'html[' + MARCA + ']:not([data-banda]) .sec.verde .kick{ color:' + CREMA2 + '!important; }',
    'html[' + MARCA + ']:not([data-banda]) .sec.verde p:not(.frase){ color:rgba(251,244,239,.93)!important; }',
    'html[' + MARCA + ']:not([data-banda]) .sec.verde .frase{ color:' + CREMA + '!important; }',
    'html[' + MARCA + ']:not([data-banda]) .sec.verde .padres .nm{ color:' + CREMA + '!important; }',
    'html[' + MARCA + ']:not([data-banda]) .sec.verde .btn.gh{ color:' + CREMA + '!important; border-color:rgba(240,220,211,.6)!important; }',
    'html[' + MARCA + '][data-banda] .sec.verde h2{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:none!important; }',
    'html[' + MARCA + '][data-banda] .sec.verde :is(.kick, p:not(.frase)){ color:' + TINTA2 + '!important; }',
    'html[' + MARCA + '][data-banda] .sec.verde :is(.frase, .padres .nm){ color:' + TINTA + '!important; }',
    'html[' + MARCA + '][data-banda] .sec.verde .btn.gh{ color:' + TINTA + '!important; border-color:' + ORO + '!important; }',
    /* adentro de un lienzo la tinta vuelve a ser la oscura */
    P + '.sec.verde :is(.evento, .hotel, .pasecard) :is(h3, p, .sub, .addr, .t, .v){ color:' + TINTA + '!important; }',
    P + '.sec.verde :is(.evento, .hotel, .pasecard) .btn.gh{ color:' + TINTA + '!important; border-color:rgba(134,96,58,.5)!important; }',

    /* ─────────────── 11 · ¿ALGUNA DUDA?: papel, el medallón y enlaces con filete */
    P + '#contacto-sec{ position:relative!important; background-image:none!important; background-color:rgba(247,239,234,.93)!important; }',
    P + '#contacto-sec::after{ display:none!important; }',
    P + '#contacto-sec h2{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:none!important; }',
    P + '#contacto-sec .kick, ' + P + '#contacto-sec p{ color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; }',
    P + '#contacto-sec p::before{ content:""; display:block; width:128px; height:128px; margin:10px auto 22px; background:url("' + MEDALLON + '") center/100% no-repeat; border-radius:50%; box-shadow:0 8px 18px rgba(74,46,44,.20), 0 2px 4px rgba(74,46,44,.14); }',
    P + '#contacto-sec .wsp{ background:none!important; box-shadow:none!important; border-radius:0!important; padding:8px 2px 5px!important; border-bottom:1px solid rgba(134,96,58,.5)!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',

    /* ─────────────── 12 · EL PIE: deja pasar la foto del cierre (--final) */
    P + '.footer{',
    '  position:relative!important;',
    '  background-color:' + BANDA + '!important;',
    '  background-image:linear-gradient(rgba(60,34,32,.30) 0%,rgba(60,34,32,.70) 100%),var(--final)!important;',
    '  background-size:cover!important; background-position:center!important;',
    '  background-blend-mode:normal!important;',
    '  color:' + CREMA + '!important;',
    '}',
    P + '.footer > *{ position:relative!important; z-index:1!important; }',

    /* ─────────────── 13 · LOS CAMPOS */
    P + ':is(input, select, textarea, .tv-in){ background-color:' + PAPEL2 + '!important; color:' + TINTA + '!important; border:1px solid rgba(134,96,58,.40)!important; }',
    P + ':is(input, textarea)::placeholder{ color:rgba(107,71,68,.72)!important; }',
    P + '.tv-btn{ background-color:' + CHAMP + '!important; color:' + TINTA_BTN + '!important; }',
    P + '.ar{ color:' + CREMA + '!important; }',

    /* ─────────────── 14 · EL AIRE ENTRE DOS SECCIONES DEL MISMO TONO */
    P + '.sec:not(.verde) + .sec:not(.verde){ padding-top:14px!important; }',
    P + '.sec:not(.verde):has(+ .sec:not(.verde)){ padding-bottom:14px!important; }',
    P + '.sec.verde:has(+ .sec.verde){ padding-bottom:14px!important; }',

    /* ─────────────── 15 · EL FONDO VA ADELANTE (como la boho): un claro suave
       detrás de cada bloque de texto, que se desvanece hacia los bordes, y
       un halo de papel (sombra, no recuadro) en el texto suelto. */
    /* ⭐ 23/9, Maki: «que el fondo se vea más, está muy tapado; en la fecha y el raspa
       para revelar dejá el original». El claro baja de .70 a .40 y se achica, y la
       raspadita y el pase van SIN nada encima: se ve la pintura entera. */
    P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 70% 50% at 50% 42%, rgba(247,239,234,.40) 0%, rgba(247,239,234,.20) 46%, rgba(247,239,234,0) 78%)!important; }',
    P + '.frame > section.scratch-sec, ' + P + '.frame > .pase{ background-color:transparent!important; }',
    P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){',
    '  text-shadow:0 0 7px ' + HALO + '.92), 0 0 16px ' + HALO + '.75)!important;',
    '}',

    /* ─────────────── 16 · LO QUE SALIÓ EN LA PRIMERA RECORRIDA (23/9)
       · el título del pase («Con cariño, te esperamos») venía en Rouge
         Script, la cursiva del motor: es '.pase > .t', no '.pasecard .t'.
       · Personas: con 18 px los nombres completos caían en TRES renglones. */
    P + '.pase > .t{ font-family:"Bodoni Moda",serif!important; font-style:italic!important; font-weight:400!important; font-size:26px!important; line-height:1.2!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
    P + '.padres .nm{ font-size:16px!important; line-height:1.25!important; }',
    /* · «Abrir la cámara», «Entrar a la galería» e «Iniciar sesión» (trivia) salían en
         Montserrat 17 px y en minúscula: los únicos botones de otra invitación. */
    P + ':is(#filtro-abrir, #gal-entrar, .tv-btn){ font-family:Jost,system-ui,sans-serif!important; font-size:12px!important; font-weight:500!important; letter-spacing:.16em!important; text-transform:uppercase!important; }',
    /* · LA PORTADA OCUPABA POCO: «Ximena & Andrés» en un renglón quedaba en 37 px y el
         bloque iba del 77 % al 93 % (en 390 px). Los dos <span> del nombre van en
         DOS renglones y el cuerpo sube: medido, del 66 % al 93 %, sin tapar caras. */
    /* ⭐⭐ 23/9, segunda vuelta de Maki: «la portada no quería una foto de ellos: hacé
       un cuadro al óleo, el fondo que estamos usando pero más lindo, que complete toda
       la portada; y los nombres MUCHO más chicos, está muy grande, muy grotesco».
       → La portada es la pintura (cover = oleo-xa-portada-1, Flow, rosas en impasto
         arriba y marfil calmo abajo). Sobre papel claro la tinta pasa a ser la OSCURA
         (palo de rosa), con un halo de papel en vez de la sombra negra, y el velo del
         motor (.pveil) deja de oscurecer: aclara sólo el pie, donde va el texto.
       → Nombres en UN renglón, 34-38 px (antes 60). */
    P + '#pv-names{ font-size:clamp(30px,8.6vw,38px)!important; line-height:1.1!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 0 10px rgba(247,239,234,.9), 0 0 22px rgba(247,239,234,.7)!important; }',
    P + '#pv-names > span{ display:inline!important; }',
    P + '#pv-kick{ color:' + ORO_T + '!important; -webkit-text-fill-color:' + ORO_T + '!important; text-shadow:0 0 8px rgba(247,239,234,.95)!important; }',
    P + '.portada :is(.num, .lab, .sep, .scrollcue){ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 0 8px rgba(247,239,234,.95)!important; }',
    P + '.portada .num{ font-size:26px!important; }',
    P + '.portada .pveil{ background:linear-gradient(to top, rgba(247,239,234,.82) 0%, rgba(247,239,234,.45) 24%, rgba(247,239,234,0) 48%)!important; opacity:1!important; }',

    /* ⭐⭐ 23/9: «al fondo le falta movimiento, no se llega a ver». El video tiene la
       pintura casi quieta. Se le suma un paseo LENTO Y CONTINUO de cámara (escala +
       desplazamiento, 22 s ida y vuelta, nunca se detiene) — con 'scale'/'translate'
       sueltos, que se suman al transform del motor sin pisarlo — y una LUZ que recorre
       el relieve cada 9 s. La portada (#pbg) hace el mismo paseo. */
    /* la raspadita va sobre la pintura SIN nada encima (Maki): el texto lleva un halo
       de papel más fuerte y cada tapa un aro marfil, o el lacre rosa se pierde entre
       las rosas rosas. */
    P + '.frame > section.scratch-sec :is(.kick, h2, .scratch-hint, .sc-mon){ text-shadow:0 0 6px rgba(251,246,242,1), 0 0 14px rgba(251,246,242,.95), 0 0 28px rgba(251,246,242,.85)!important; }',
    P + '.rasp-zona{ box-shadow:0 0 0 3px ' + PAPEL2 + ', 0 7px 16px rgba(74,46,44,.32)!important; }',
    '@keyframes oleoDeriva{ 0%{ scale:1.06; translate:-1.5% 1.2%; } 50%{ scale:1.16; translate:1.8% -1.8%; } 100%{ scale:1.06; translate:-1.5% 1.2%; } }',
    '@keyframes oleoLuz{ 0%{ translate:-70% 0; } 100%{ translate:70% 0; } }',
    P + '#inv-fondo{ overflow:hidden!important; }',
    /* ⚠️ el fondo era un VIDEO con el centro vacío (pintura sólo en los bordes): por eso
       Maki veía «en los costados nada más». Pasa a ser la pintura entera (imagen) y el
       movimiento lo pone este paseo. Vale para imagen o video: '#inv-fondo > *'. */
    P + '#inv-fondo > *, ' + P + '.portada #pbg{ animation:oleoDeriva 22s ease-in-out infinite!important; transform-origin:50% 50%!important; will-change:scale, translate; }',
    P + '#inv-fondo::after{ content:""!important; position:absolute!important; inset:-10% -40%!important; pointer-events:none!important; z-index:1!important; background:linear-gradient(105deg, rgba(255,246,236,0) 38%, rgba(255,246,236,.30) 50%, rgba(255,246,236,0) 62%)!important; animation:oleoLuz 9s ease-in-out infinite alternate!important; }',
    '@media (prefers-reduced-motion: reduce){ ' + P + '#inv-fondo > *, ' + P + '.portada #pbg, ' + P + '#inv-fondo::after{ animation:none!important; } }'

    ].join('\n');
  }

  /* ================================================================== montaje */
  function hoja() {
    var s = document.getElementById('col-' + ID);
    if (!s) { s = document.createElement('style'); s.id = 'col-' + ID; document.head.appendChild(s); }
    var txt = armarCSS();
    if (s.textContent !== txt) s.textContent = txt;
  }

  /* la vía del itinerario va de la primera marca a la última (se MIDE) */
  function medirVia() {
    try {
      var tl = document.querySelector('.tl'); if (!tl) return;
      var fichas = tl.querySelectorAll(':scope > .it');
      if (fichas.length < 1) return;
      var R = tl.getBoundingClientRect();
      var a = fichas[0].getBoundingClientRect();
      var b = fichas[fichas.length - 1].getBoundingClientRect();
      if (!R.height) return;
      tl.style.setProperty('--tl-ini', Math.round(a.top + a.height / 2 - R.top) + 'px');
      tl.style.setProperty('--tl-fin', Math.round(R.bottom - (b.top + b.height / 2)) + 'px');
    } catch (e) {}
  }

  /* los nombres de la portada no tocan los bordes (referencia: .portada) */
  var TOPE_NOMBRES = 0.86;
  function anchoUtil(n) {
    var por = document.querySelector('.portada');
    if (por && por.clientWidth) {
      var cs = getComputedStyle(por);
      var w = por.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      if (w > 60) return w;
    }
    var p = n.parentElement;
    return p ? p.clientWidth : 0;
  }
  function ajustarNombres() {
    try {
      var n = document.getElementById('pv-names'); if (!n) return;
      n.style.removeProperty('font-size');
      var ancho = anchoUtil(n); if (!ancho) return;
      var base = parseFloat(getComputedStyle(n).fontSize) || 0; if (!base) return;
      var r = document.createRange();
      function mide() { r.selectNodeContents(n); return r.getBoundingClientRect().width; }
      var w = mide(); if (!w) return;
      var i = 0, px = base;
      while (w > ancho * TOPE_NOMBRES && px > 26 && i++ < 24) {
        px = Math.max(26, px - Math.max(1, Math.round(px * 0.05)));
        n.style.setProperty('font-size', px + 'px', 'important');
        w = mide();
      }
    } catch (e) {}
  }

  var puesta = false;

  /* el pase con el QR va ABAJO de la raspadita, como en Perlas */
  function moverPase() {
    var pase = document.querySelector('.pase');
    var rasp = document.querySelector('.sec.scratch-sec');
    if (!pase || !rasp) return;
    if (rasp.parentElement !== pase.parentElement) return;
    if (pase.previousElementSibling === rasp) return;
    rasp.parentNode.insertBefore(pase, rasp.nextSibling);
  }
  function devolverPase() {
    var pase = document.querySelector('.pase');
    var port = document.querySelector('.portada');
    if (!pase || !port) return;
    if (port.parentElement !== pase.parentElement) return;
    if (pase.previousElementSibling === port) return;
    port.parentNode.insertBefore(pase, port.nextSibling);
  }

  function poner() {
    var raiz = document.documentElement;
    if (!raiz.hasAttribute(MARCA)) raiz.setAttribute(MARCA, '');
    /* ⚠️ lleva el NOMBRE: vacío es falso para el chequeo simbolo-tematica */
    if (raiz.getAttribute('data-marca-propia') !== ID) raiz.setAttribute('data-marca-propia', ID);
    window.INVCOLPALETA = PALETA_PROPIA;
    var k;
    for (k in PALETA_PROPIA) {
      if (Object.prototype.hasOwnProperty.call(PALETA_PROPIA, k)) {
        if (raiz.style.getPropertyValue(k) !== PALETA_PROPIA[k]) raiz.style.setProperty(k, PALETA_PROPIA[k]);
      }
    }
    hoja();
    medirVia();
    ajustarNombres();
    moverPase();
    puesta = true;
  }

  function sacar() {
    if (!puesta) return;
    var raiz = document.documentElement;
    raiz.removeAttribute(MARCA);
    raiz.removeAttribute('data-marca-propia');
    devolverPase();
    var nm = document.getElementById('pv-names');
    if (nm) nm.style.removeProperty('font-size');
    if (window.INVCOLPALETA === PALETA_PROPIA) {
      try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; }
    }
    var k;
    for (k in PALETA_PROPIA) {
      if (Object.prototype.hasOwnProperty.call(PALETA_PROPIA, k)) raiz.style.removeProperty(k);
    }
    var s = document.getElementById('col-' + ID);
    if (s && s.parentNode) s.parentNode.removeChild(s);
    puesta = false;
  }

  function sincronizar() {
    if (activa()) poner();
    else sacar();
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    sincronizar();
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 60) clearInterval(t);
    }, 400);
    setInterval(function () { if (puesta) { medirVia(); ajustarNombres(); } }, 1200);
    addEventListener('resize', function () { if (puesta) ajustarNombres(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
