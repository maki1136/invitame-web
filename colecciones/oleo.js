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

  /* ⭐⭐ LOS TONOS (23/9/2026). Óleo es UNA línea con varias paletas: Rosé (la de
     fábrica, ximena-y-andres) y las que se suman acá. Se eligen desde el panel como
     colecciones hermanas: fx.coleccion 'oleo' = Rosé, 'oleo-piedra' = Piedra, etc.
     ⚠️ NO se duplica el archivo: la hoja se arma con los colores de Rosé y se TIÑE
     cambiando cada color por su par (hex, '%23'+hex dentro de los SVG, y cada
     'rgba(r,g,b,'). Un color nuevo en la hoja de arriba TIENE que sumar su par acá,
     o queda rosado en Piedra.
     PIEDRA (mariana-y-joaquin, Valle de Guadalupe): greige, arena, gris cálido,
     marfil y pan de plata. Contrastes medidos: TINTA 10,6 · TINTA2 6,2 · ORO_T 5,7
     sobre papel; CREMA 6,6 y CREMA2 5,8 sobre la banda. */
  var TONOS = {
    piedra: {
      hex: {
        '#C98E8A':'#A99C8C', '#E3C2B8':'#D8CFC3', '#D9C3A0':'#D5D1CA', '#B08A4E':'#8F8A82',
        '#F7EFEA':'#F4F1EC', '#FBF6F2':'#FAF8F4', '#4A2E2C':'#3A3631', '#6B4744':'#5E5850',
        '#7A5634':'#645E55', '#82504C':'#5F584F', '#FBF4EF':'#FAF7F2', '#F5E6DF':'#EEE9E1',
        '#2E1C1B':'#26231F', '#F2E4DC':'#ECE7DF', '#EAD9B8':'#E2DFD9'
      },
      rgb: {
        '74,46,44':'58,54,49', '201,142,138':'169,156,140', '247,239,234':'244,241,236',
        '40,20,18':'30,28,25', '60,34,32':'44,41,37', '134,96,58':'110,104,96',
        '176,138,78':'143,138,130', '217,195,160':'213,209,202', '240,220,211':'232,228,220',
        '251,246,242':'250,248,244', '255,246,236':'250,250,248', '120,70,60':'80,76,70',
        '107,71,68':'94,88,80', '251,244,239':'250,247,242'
      },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/oleo-piedra/oleo-piedra-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/oleo-medallon-piedra-2.webp'
      }
    },
    /* ⭐ CHAMPAGNE (fernanda-y-alejandro, hacienda en San Miguel de Allende, hora dorada):
       la más luminosa de la línea. Rosé pasado a champagne, marfil cálido y oro pálido.
       Tinta café tostado (#3E3226) sobre el papel #F8F2E7 → 11,9; TINTA2 7,6; ORO_T 5,6.
       Las tapas del video y la playlist llevan su propio óleo (proyector y gramófono en
       el cielo de atardecer), como pidió Maki el 23/9 para Nocturno. */
    champagne: {
      hex: {
        '#C98E8A':'#B89A6A', '#E3C2B8':'#E6D5BC', '#D9C3A0':'#D8C7A4', '#B08A4E':'#A8864A',
        '#F7EFEA':'#F8F2E7', '#FBF6F2':'#FCF8F0', '#4A2E2C':'#3E3226', '#6B4744':'#5F4E3C',
        '#7A5634':'#7A5E34', '#82504C':'#6E5A40', '#FBF4EF':'#FCF6EC', '#F5E6DF':'#F2E8D6',
        '#2E1C1B':'#2A2118', '#F2E4DC':'#EFE4D0', '#EAD9B8':'#E8D9B5'
      },
      rgb: {
        '74,46,44':'62,50,38', '201,142,138':'184,154,106', '247,239,234':'248,242,231',
        '40,20,18':'34,26,18', '60,34,32':'50,40,30', '134,96,58':'134,104,62',
        '176,138,78':'168,134,74', '217,195,160':'216,199,164', '240,220,211':'239,228,208',
        '251,246,242':'252,248,240', '255,246,236':'255,249,238', '120,70,60':'110,86,58',
        '107,71,68':'95,78,60', '251,244,239':'252,246,236'
      },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/oleo-champagne/ch-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/oleo-medallon-champagne-2.webp'
      },
      css: [
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(40,30,18,.42) 0, rgba(40,30,18,.18) 24%, rgba(40,30,18,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/oleo-champagne/ch-tapa-video") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(60,44,20,.28)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(40,30,18,.42) 0, rgba(40,30,18,.18) 24%, rgba(40,30,18,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/oleo-champagne/ch-tapa-playlist") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(60,44,20,.28)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#E8D9B5!important; background:rgba(46,34,20,.5)!important; box-shadow:0 0 0 1px rgba(232,217,181,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#F3E6C8!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FCF6EC!important; -webkit-text-fill-color:#FCF6EC!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }'
      ].join('\n')
    },
    /* ⭐ JARDÍN (daniela-y-rodrigo, jardín en Cuernavaca, boda de mediodía en primavera):
       la verde de la línea. Rosé pasado a salvia, glicina lila y oro viejo. Tinta verde
       bosque (#2F3A2C) sobre el papel #F4F2EA; TINTA2 #4E5A47; ORO_T #5C5B30.
       ⭐ Es la PRIMERA Óleo con fondo EN VIDEO REAL (Maki, 23/9: «no es la idea un zoom,
       la idea es un video real»): la glicina se mece, la fuente corre, pasan mariposas y
       nubes, con la cámara quieta. Se pone en fx.fondo (tipo 'video'), no acá. */
    jardin: {
      hex: {
        '#C98E8A':'#8FA47E', '#E3C2B8':'#D6DFC9', '#D9C3A0':'#C9B98E', '#B08A4E':'#9C8A55',
        '#F7EFEA':'#F4F2EA', '#FBF6F2':'#FAF9F3', '#4A2E2C':'#2F3A2C', '#6B4744':'#4E5A47',
        '#7A5634':'#5C5B30', '#82504C':'#5E7152', '#FBF4EF':'#FAF8F0', '#F5E6DF':'#E7EDDD',
        '#2E1C1B':'#1F271D', '#F2E4DC':'#E9EEDF', '#EAD9B8':'#DCD3A8'
      },
      rgb: {
        '74,46,44':'47,58,44', '201,142,138':'143,164,126', '247,239,234':'244,242,234',
        '40,20,18':'24,32,22', '60,34,32':'36,46,34', '134,96,58':'108,112,70',
        '176,138,78':'156,138,85', '217,195,160':'201,185,142', '240,220,211':'226,234,214',
        '251,246,242':'250,249,243', '255,246,236':'252,252,242', '120,70,60':'70,90,62',
        '107,71,68':'78,90,71', '251,244,239':'250,248,240'
      },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/oleo-jardin/jd-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/oleo-medallon-jardin.webp'
      },
      css: [
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(28,38,26,.42) 0, rgba(28,38,26,.18) 24%, rgba(28,38,26,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/oleo-jardin/jd-tapa-video") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(40,56,36,.28)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(28,38,26,.42) 0, rgba(28,38,26,.18) 24%, rgba(28,38,26,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/oleo-jardin/jd-tapa-playlist") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(40,56,36,.28)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#E7EDDD!important; background:rgba(30,40,28,.5)!important; box-shadow:0 0 0 1px rgba(231,237,221,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#F4F7EE!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FAF8F0!important; -webkit-text-fill-color:#FAF8F0!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        /* el fondo YA SE MUEVE solo (video real): sin el paseo de zoom de la línea Óleo,
           que es justo lo que Maki no quería («no es la idea un zoom»). */
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        /* el cierre es una foto con cielo claro: halo oscuro para que la letra no dependa de dónde cae */
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ EUCALIPTO (tanda 2, 23/9/2026): la botánica: eucalipto real verde plateado sobre lino marfil, con rosas blancas. Tinta verde eucalipto (#26352E) sobre papel #F5F3EC.
       Viaja en la tela de Óleo (misma estructura, arcos y tipografías) pero NO es
       una pintura: las piezas son fotos hiperrealistas de Higgsfield. El fondo y la
       portada van en VIDEO REAL (cámara quieta), así que acá se apaga la deriva. */
    eucalipto: {
      hex: { '#C98E8A':'#7F9C8C', '#E3C2B8':'#D5E0D8', '#D9C3A0':'#C8C3A0', '#B08A4E':'#A08C5B', '#F7EFEA':'#F5F3EC', '#FBF6F2':'#FAF9F4', '#4A2E2C':'#26352E', '#6B4744':'#4A5A52', '#7A5634':'#56593A', '#82504C':'#4F6B5E', '#FBF4EF':'#F8F7F0', '#F5E6DF':'#E3EAE3', '#2E1C1B':'#1B2621', '#F2E4DC':'#EAEFEA', '#EAD9B8':'#D8D4B4' },
      rgb: { '74,46,44':'38,53,46', '201,142,138':'127,156,140', '247,239,234':'245,243,236', '40,20,18':'22,32,28', '60,34,32':'22,32,28', '134,96,58':'86,89,58', '176,138,78':'160,140,91', '217,195,160':'200,195,160', '240,220,211':'213,224,216', '251,246,242':'250,249,244', '255,246,236':'248,247,240', '120,70,60':'22,32,28', '107,71,68':'74,90,82', '251,244,239':'248,247,240' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/eucalipto/eu-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/eu-medallon.webp'
      },
      css: [
        /* 24/9, Maki: «los textos no se llegan a leer bien»: el eucalipto tiene mucho detalle → claro más firme y halo */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 80% 60% at 50% 45%, rgba(248,247,240,.84) 0%, rgba(248,247,240,.58) 50%, rgba(248,247,240,0) 84%)!important; }',
        P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){ text-shadow:0 0 6px rgba(248,247,240,1), 0 0 14px rgba(248,247,240,.95), 0 0 26px rgba(248,247,240,.8)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(22,32,28,.42) 0, rgba(22,32,28,.18) 24%, rgba(22,32,28,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/eucalipto/eu-tapa-video") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(22,32,28,.28)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(22,32,28,.42) 0, rgba(22,32,28,.18) 24%, rgba(22,32,28,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/eucalipto/eu-tapa-playlist") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(22,32,28,.28)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#F8F7F0!important; background:rgba(22,32,28,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#F8F7F0!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#F8F7F0!important; -webkit-text-fill-color:#F8F7F0!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ ACUARELA (tanda 2 · D, 24/9/2026): «eucalipto mezclado con acuarela» (referencia R|J de Maki).
       Papel de algodón blanco con aguadas de salvia, eucalipto real y rosas blancas en las esquinas, arco dorado.
       Tinta verde bosque (#2F3B32) sobre papel #FAF8F2. Fotos de Flow, fondo y portada EN VIDEO REAL (cámara quieta). */
    acuarela: {
      hex: { '#C98E8A':'#8FA68E', '#E3C2B8':'#DCE5DA', '#D9C3A0':'#D9C9A0', '#B08A4E':'#B8995A', '#F7EFEA':'#FAF8F2', '#FBF6F2':'#FDFCF8', '#4A2E2C':'#2F3B32', '#6B4744':'#56625A', '#7A5634':'#6F5E33', '#82504C':'#4E6651', '#FBF4EF':'#FBFAF5', '#F5E6DF':'#E4EBE2', '#2E1C1B':'#1F2A22', '#F2E4DC':'#EFF3EC', '#EAD9B8':'#E6DAB8' },
      rgb: { '74,46,44':'47,59,50', '201,142,138':'143,166,142', '247,239,234':'250,248,242', '40,20,18':'31,42,34', '60,34,32':'31,42,34', '134,96,58':'111,94,51', '176,138,78':'184,153,90', '217,195,160':'217,201,160', '240,220,211':'220,229,218', '251,246,242':'253,252,248', '255,246,236':'251,250,245', '120,70,60':'31,42,34', '107,71,68':'86,98,90', '251,244,239':'251,250,245' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/acuarela/ac-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/ac-medallon.webp'
      },
      css: [
        /* portada: centrada y con tinta oscura (regla del 24/9: nada claro sobre claro) */
        /* 25/9, Maki: «agregale los novios en la portada y que los textos no los tapen» → portada = foto de los novios (el cielo arriba); el texto sube al cielo */
        P + '.portada{ justify-content:flex-start!important; }',
        P + '.portada .pveil{ background:linear-gradient(to bottom, rgba(250,248,242,.35) 0%, rgba(250,248,242,0) 38%)!important; }',
        P + '.portada > .c{ margin-top:9vh!important; background:radial-gradient(closest-side, rgba(250,248,242,.62), rgba(250,248,242,.3) 65%, rgba(250,248,242,0))!important; padding:22px 26px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#2F3B32!important; -webkit-text-fill-color:#2F3B32!important; text-shadow:0 0 10px rgba(250,248,242,.95)!important; }',
        /* las ramas de las esquinas tienen detalle: claro firme detrás del texto */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 80% 60% at 50% 45%, rgba(250,248,242,.84) 0%, rgba(250,248,242,.58) 50%, rgba(250,248,242,0) 84%)!important; }',
        P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){ text-shadow:0 0 6px rgba(250,248,242,1), 0 0 14px rgba(250,248,242,.95), 0 0 26px rgba(250,248,242,.8)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(31,42,34,.42) 0, rgba(31,42,34,.18) 24%, rgba(31,42,34,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/acuarela/ac-tapa-video") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(31,42,34,.24)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(31,42,34,.42) 0, rgba(31,42,34,.18) 24%, rgba(31,42,34,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/acuarela/ac-tapa-playlist") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(31,42,34,.24)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FBFAF5!important; background:rgba(31,42,34,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FBFAF5!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FBFAF5!important; -webkit-text-fill-color:#FBFAF5!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        /* chequeo 24/9: la línea «nombres · fecha» del cierre daba 4.66 sobre la foto → crema clara */
        P + '.footer .s{ color:#FBFAF5!important; -webkit-text-fill-color:#FBFAF5!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ MEXICANA (25/9/2026): «las referencias no me gustan, hacelas a nuestro estilo» (mexicana-tradicional y Fernando & Cinthya).
       Lo dibujado pasa a objetos REALES: muro de cal, corazón de hojalata, pajaritos de barro de Oaxaca, guirnalda de
       cempasúchil y bugambilia, papel picado que se mueve. Tinta café profundo (#3A1E1C) sobre cal #F8F2E8, acento rosa mexicano. */
    mexicana: {
      hex: { '#C98E8A':'#C73866', '#E3C2B8':'#F6D3DC', '#D9C3A0':'#F2C572', '#B08A4E':'#D98A1E', '#F7EFEA':'#F8F2E8', '#FBF6F2':'#FCF8F1', '#4A2E2C':'#3A1E1C', '#6B4744':'#5E3A34', '#7A5634':'#8A5A12', '#82504C':'#A8244F', '#FBF4EF':'#FCF8F1', '#F5E6DF':'#F5E6DA', '#2E1C1B':'#2A1412', '#F2E4DC':'#F3E7DB', '#EAD9B8':'#F5D9A0' },
      rgb: { '74,46,44':'58,30,28', '201,142,138':'199,56,102', '247,239,234':'248,242,232', '40,20,18':'42,20,18', '60,34,32':'42,20,18', '134,96,58':'138,90,18', '176,138,78':'217,138,30', '217,195,160':'242,197,114', '240,220,211':'246,211,220', '251,246,242':'252,248,241', '255,246,236':'252,248,241', '120,70,60':'42,20,18', '107,71,68':'94,58,52', '251,244,239':'252,248,241' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/mexicana/mx2-muro-a.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/mx-medallon.webp'
      },
      css: [
        /* portada con los novios abajo: el texto va arriba, sobre el muro liso (regla §35) */
        P + '.portada{ justify-content:flex-start!important; }',
        P + '.portada .pveil{ background:linear-gradient(to bottom, rgba(251,246,238,.35) 0%, rgba(251,246,238,0) 38%)!important; }',
        P + '.portada > .c{ margin-top:9vh!important; background:radial-gradient(closest-side, rgba(251,246,238,.66), rgba(251,246,238,.32) 65%, rgba(251,246,238,0))!important; padding:22px 26px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#3A1E1C!important; -webkit-text-fill-color:#3A1E1C!important; text-shadow:0 0 10px rgba(251,246,238,.95)!important; }',
        /* la guirnalda y el papel picado tienen mucho color: claro firme detrás del texto */
        /* 25/9, Maki: «que los fondos se vean más adelante, lo tapa mucho lo de arriba y pierde fuerza»: el claro se achica y se aclara; la legibilidad la sostiene el halo del texto */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 66% 42% at 50% 45%, rgba(251,246,238,.5) 0%, rgba(251,246,238,.22) 55%, rgba(251,246,238,0) 80%)!important; }',
        P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){ text-shadow:0 0 6px rgba(251,246,238,1), 0 0 14px rgba(251,246,238,.95), 0 0 26px rgba(251,246,238,.8)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(42,20,18,.42) 0, rgba(42,20,18,.18) 24%, rgba(42,20,18,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/mexicana/mx-tapavideo-a") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(42,20,18,.24)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(42,20,18,.42) 0, rgba(42,20,18,.18) 24%, rgba(42,20,18,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/mexicana/mx-tapaplaylist-a") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(42,20,18,.24)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FCF8F1!important; background:rgba(42,20,18,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FCF8F1!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FCF8F1!important; -webkit-text-fill-color:#FCF8F1!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer .s{ color:#FCF8F1!important; -webkit-text-fill-color:#FCF8F1!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ TALAVERA (25/9/2026, segunda mexicana): «otra mexicana, que la portada no tenga foto de personas».
       Portada = nicho de cal enmarcado en azulejo de Talavera de Puebla, con limonero y bugambilia blanca (video, cámara quieta).
       Tinta azul cobalto profundo (#1F2E5A) sobre cal #F7F4EC, acento cobalto #2B4C9B, oro limón #C9A24A. */
    talavera: {
      hex: { '#C98E8A':'#2B4C9B', '#E3C2B8':'#DCE6F5', '#D9C3A0':'#EDD27A', '#B08A4E':'#C9A24A', '#F7EFEA':'#F7F4EC', '#FBF6F2':'#FCFAF4', '#4A2E2C':'#1F2E5A', '#6B4744':'#3E4E78', '#7A5634':'#7A6420', '#82504C':'#23407F', '#FBF4EF':'#FCFAF4', '#F5E6DF':'#E9EEF6', '#2E1C1B':'#15203F', '#F2E4DC':'#EEF1F6', '#EAD9B8':'#F1E3B0' },
      rgb: { '74,46,44':'31,46,90', '201,142,138':'43,76,155', '247,239,234':'247,244,236', '40,20,18':'21,32,63', '60,34,32':'21,32,63', '134,96,58':'122,100,32', '176,138,78':'201,162,74', '217,195,160':'237,210,122', '240,220,211':'220,230,245', '251,246,242':'252,250,244', '255,246,236':'252,250,244', '120,70,60':'21,32,63', '107,71,68':'62,78,120', '251,244,239':'252,250,244' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/mexicana2/m2-fondo-1.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/m2-medallon-talavera-b.webp'
      },
      css: [
        /* portada SIN personas: el texto va adentro del nicho de cal (la parte clara de arriba) */
        P + '.portada{ justify-content:flex-start!important; }',
        P + '.portada .pveil{ background:linear-gradient(to bottom, rgba(252,250,244,.18) 0%, rgba(252,250,244,0) 45%)!important; }',
        P + '.portada > .c{ margin-top:15vh!important; background:radial-gradient(closest-side, rgba(252,250,244,.55), rgba(252,250,244,.2) 70%, rgba(252,250,244,0))!important; padding:18px 24px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#1F2E5A!important; -webkit-text-fill-color:#1F2E5A!important; text-shadow:0 0 10px rgba(252,250,244,.95)!important; }',
        /* el fondo va ADELANTE: claro chico y liviano, la legibilidad la sostiene el halo del texto */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 64% 40% at 50% 45%, rgba(252,250,244,.5) 0%, rgba(252,250,244,.2) 55%, rgba(252,250,244,0) 80%)!important; }',
        P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){ text-shadow:0 0 6px rgba(252,250,244,1), 0 0 14px rgba(252,250,244,.95), 0 0 26px rgba(252,250,244,.8)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(21,32,63,.42) 0, rgba(21,32,63,.18) 24%, rgba(21,32,63,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/mexicana2/m2-tapavid-2") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(21,32,63,.24)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(21,32,63,.42) 0, rgba(21,32,63,.18) 24%, rgba(21,32,63,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/mexicana2/m2-tapaplay-3") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(21,32,63,.24)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FCFAF4!important; background:rgba(21,32,63,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FCFAF4!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FCFAF4!important; -webkit-text-fill-color:#FCFAF4!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer .s{ color:#FCFAF4!important; -webkit-text-fill-color:#FCFAF4!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ VAQUERA (25/9/2026, XV años): portada SIN personas — botas rosas bordadas, sombrero, peonías y pampas sobre heno, contra madera blanca (video).
       Tinta café cuero (#4A3226) sobre crema #F8F2EC, acento rosa viejo #B96F6C, camel #B98A5A. */
    vaquera: {
      hex: { '#C98E8A':'#B96F6C', '#E3C2B8':'#F1DCD6', '#D9C3A0':'#E3C9A6', '#B08A4E':'#B98A5A', '#F7EFEA':'#F8F2EC', '#FBF6F2':'#FCF8F4', '#4A2E2C':'#4A3226', '#6B4744':'#6E5040', '#82504C':'#8E4E4B', '#FBF4EF':'#FCF8F4', '#F5E6DF':'#F4E7E0', '#2E1C1B':'#2E1F17', '#F2E4DC':'#F4E9E2', '#EAD9B8':'#EBD8BC' },
      rgb: { '74,46,44':'74,50,38', '201,142,138':'185,111,108', '247,239,234':'248,242,236', '40,20,18':'46,31,23', '60,34,32':'46,31,23', '176,138,78':'185,138,90', '217,195,160':'227,201,166', '240,220,211':'241,220,214', '251,246,242':'252,248,244', '255,246,236':'252,248,244', '120,70,60':'46,31,23', '107,71,68':'110,80,64', '251,244,239':'252,248,244' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/vaquera/vq-fondo-1.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/vq-medallon-herradura.webp'
      },
      css: [
        /* portada SIN personas: el texto va arriba, sobre la madera clara; las botas quedan abajo */
        P + '.portada{ justify-content:flex-start!important; }',
        P + '.portada .pveil{ background:linear-gradient(to bottom, rgba(252,248,244,.25) 0%, rgba(252,248,244,0) 45%)!important; }',
        P + '.portada > .c{ margin-top:11vh!important; background:radial-gradient(closest-side, rgba(252,248,244,.6), rgba(252,248,244,.22) 70%, rgba(252,248,244,0))!important; padding:18px 24px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#4A3226!important; -webkit-text-fill-color:#4A3226!important; text-shadow:0 0 10px rgba(252,248,244,.95)!important; }',
        /* el fondo va ADELANTE: claro chico y liviano */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 64% 40% at 50% 45%, rgba(252,248,244,.5) 0%, rgba(252,248,244,.2) 55%, rgba(252,248,244,0) 80%)!important; }',
        P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){ text-shadow:0 0 6px rgba(252,248,244,1), 0 0 14px rgba(252,248,244,.95), 0 0 26px rgba(252,248,244,.8)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(46,31,23,.42) 0, rgba(46,31,23,.18) 24%, rgba(46,31,23,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/vaquera/vq-tapavid-2") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(46,31,23,.24)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(46,31,23,.42) 0, rgba(46,31,23,.18) 24%, rgba(46,31,23,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/vaquera/vq-tapaplay-3") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(46,31,23,.24)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FCF8F4!important; background:rgba(46,31,23,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FCF8F4!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FCF8F4!important; -webkit-text-fill-color:#FCF8F4!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer .s{ color:#FCF8F4!important; -webkit-text-fill-color:#FCF8F4!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ MONARCA (25/9/2026, XV años): portada SIN personas — bosque de oyameles de Michoacán con monarcas (video, cámara quieta).
       Tinta café tostado (#3B2A1E) sobre crema #FBF6EE, acento naranja monarca (#C1611F), oro #C79A3E. */
    monarca: {
      hex: { '#C98E8A':'#C1611F', '#E3C2B8':'#F3D9C2', '#D9C3A0':'#E6CFA3', '#B08A4E':'#C79A3E', '#F7EFEA':'#FBF6EE', '#FBF6F2':'#FDFAF4', '#4A2E2C':'#3B2A1E', '#6B4744':'#6A5140', '#82504C':'#9E4A17', '#FBF4EF':'#FDFAF4', '#F5E6DF':'#F6EADB', '#2E1C1B':'#26190F', '#F2E4DC':'#F5EBDD', '#EAD9B8':'#EDD9B2' },
      rgb: { '74,46,44':'59,42,30', '201,142,138':'193,97,31', '247,239,234':'251,246,238', '40,20,18':'38,25,15', '60,34,32':'38,25,15', '176,138,78':'199,154,62', '217,195,160':'230,207,163', '240,220,211':'243,217,194', '251,246,242':'253,250,244', '255,246,236':'253,250,244', '120,70,60':'38,25,15', '107,71,68':'106,81,64', '251,244,239':'253,250,244' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/monarca/mo-fondo-1.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/mo-medallon-monarca-2.webp'
      },
      css: [
        /* portada SIN personas: el texto va arriba, sobre la neblina dorada; las monarcas y las ramas quedan abajo */
        P + '.portada{ justify-content:flex-start!important; }',
        P + '.portada .pveil{ background:linear-gradient(to bottom, rgba(253,250,244,.35) 0%, rgba(253,250,244,0) 45%)!important; }',
        P + '.portada > .c{ margin-top:10vh!important; background:radial-gradient(closest-side, rgba(253,250,244,.66), rgba(253,250,244,.26) 70%, rgba(253,250,244,0))!important; padding:18px 24px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#3B2A1E!important; -webkit-text-fill-color:#3B2A1E!important; text-shadow:0 0 10px rgba(253,250,244,.95)!important; }',
        /* el fondo va ADELANTE: claro chico y liviano */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 64% 40% at 50% 45%, rgba(253,250,244,.5) 0%, rgba(253,250,244,.2) 55%, rgba(253,250,244,0) 80%)!important; }',
        P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){ text-shadow:0 0 6px rgba(253,250,244,1), 0 0 14px rgba(253,250,244,.95), 0 0 26px rgba(253,250,244,.8)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(38,25,15,.42) 0, rgba(38,25,15,.18) 24%, rgba(38,25,15,0) 44%), url(\"https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/monarca/mo-tapavid-2\") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(38,25,15,.24)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(38,25,15,.42) 0, rgba(38,25,15,.18) 24%, rgba(38,25,15,0) 44%), url(\"https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/monarca/mo-tapaplay-1\") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(38,25,15,.24)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FDFAF4!important; background:rgba(38,25,15,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FDFAF4!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FDFAF4!important; -webkit-text-fill-color:#FDFAF4!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer .s{ color:#FDFAF4!important; -webkit-text-fill-color:#FDFAF4!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ MASCARADA (25/9/2026, XV años, referencia xv-mariakarol): portada SIN personas — mesa de terciopelo rosa en un salón de baile con antifaz dorado, champaña y arañas de cristal (video, cámara quieta).
       Tinta malva profundo (#4E2A36) sobre rosa papel #FBF3F1, acento oro rosé (#B76E79), oro #C9A45C. */
    mascarada: {
      hex: { '#C98E8A':'#B76E79', '#E3C2B8':'#F3D6D6', '#D9C3A0':'#E8CFA8', '#B08A4E':'#C9A45C', '#F7EFEA':'#FBF3F1', '#FBF6F2':'#FDF8F7', '#4A2E2C':'#4E2A36', '#6B4744':'#7A4E5C', '#82504C':'#8E4A5A', '#FBF4EF':'#FDF8F7', '#F5E6DF':'#F6E4E4', '#2E1C1B':'#2E1820', '#F2E4DC':'#F5E6E6', '#EAD9B8':'#EED8B6' },
      rgb: { '74,46,44':'78,42,54', '201,142,138':'183,110,121', '247,239,234':'251,243,241', '40,20,18':'46,24,32', '60,34,32':'46,24,32', '176,138,78':'201,164,92', '217,195,160':'232,207,168', '240,220,211':'243,214,214', '251,246,242':'253,248,247', '255,246,236':'253,248,247', '120,70,60':'46,24,32', '107,71,68':'122,78,92', '251,244,239':'253,248,247' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/mascarada/mk-fondo.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/mk-medallon-antifaz.webp'
      },
      css: [
        /* portada SIN personas: el texto va arriba, sobre las arañas de cristal con un claro firme; el antifaz y la mesa quedan abajo */
        P + '.portada{ justify-content:flex-start!important; }',
        P + '.portada .pveil{ background:linear-gradient(to bottom, rgba(253,248,247,.35) 0%, rgba(253,248,247,0) 45%)!important; }',
        P + '.portada > .c{ margin-top:8vh!important; background:radial-gradient(closest-side, rgba(253,248,247,.8), rgba(253,248,247,.4) 70%, rgba(253,248,247,0))!important; padding:18px 24px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#4E2A36!important; -webkit-text-fill-color:#4E2A36!important; text-shadow:0 0 10px rgba(253,248,247,.95)!important; }',
        /* el fondo va ADELANTE: claro chico y liviano */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 64% 40% at 50% 45%, rgba(253,248,247,.5) 0%, rgba(253,248,247,.2) 55%, rgba(253,248,247,0) 80%)!important; }',
        P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){ text-shadow:0 0 6px rgba(253,248,247,1), 0 0 14px rgba(253,248,247,.95), 0 0 26px rgba(253,248,247,.8)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(46,24,32,.42) 0, rgba(46,24,32,.18) 24%, rgba(46,24,32,0) 44%), url(\"https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/mascarada/mk-tapavid\") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(46,24,32,.24)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(46,24,32,.42) 0, rgba(46,24,32,.18) 24%, rgba(46,24,32,0) 44%), url(\"https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/mascarada/mk-tapaplay\") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(46,24,32,.24)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FDF8F7!important; background:rgba(46,24,32,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FDF8F7!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FDF8F7!important; -webkit-text-fill-color:#FDF8F7!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer .s{ color:#FDF8F7!important; -webkit-text-fill-color:#FDF8F7!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ ESPATULADO (tanda 2, 23/9/2026): la textura: yeso blanco trabajado con espátula en relieve, con ramitas de hoja de oro. Tinta grafito cálido (#3A342E) sobre papel #F6F3EE.
       Viaja en la tela de Óleo (misma estructura, arcos y tipografías) pero NO es
       una pintura: las piezas son fotos hiperrealistas de Higgsfield. El fondo y la
       portada van en VIDEO REAL (cámara quieta), así que acá se apaga la deriva. */
    espatulado: {
      hex: { '#C98E8A':'#B9A58A', '#E3C2B8':'#E8E1D6', '#D9C3A0':'#D6C6A2', '#B08A4E':'#B09260', '#F7EFEA':'#F6F3EE', '#FBF6F2':'#FBFAF7', '#4A2E2C':'#3A342E', '#6B4744':'#5E554C', '#7A5634':'#6E5A38', '#82504C':'#6F6254', '#FBF4EF':'#FAF8F4', '#F5E6DF':'#ECE7DF', '#2E1C1B':'#27231F', '#F2E4DC':'#EFEBE4', '#EAD9B8':'#E2D5B8' },
      rgb: { '74,46,44':'58,52,46', '201,142,138':'185,165,138', '247,239,234':'246,243,238', '40,20,18':'40,34,28', '60,34,32':'40,34,28', '134,96,58':'110,90,56', '176,138,78':'176,146,96', '217,195,160':'214,198,162', '240,220,211':'232,225,214', '251,246,242':'251,250,247', '255,246,236':'250,248,244', '120,70,60':'40,34,28', '107,71,68':'94,85,76', '251,244,239':'250,248,244' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/espatulado/es-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/es-medallon.webp'
      },
      css: [
        /* 24/9, Maki: «el nos casamos blanco sobre blanco» y «que esté más centrado, es fondo blanco» */
        P + '.portada{ justify-content:center!important; }',
        P + '.portada > .c{ background:radial-gradient(closest-side, rgba(250,249,246,.80), rgba(250,249,246,.5) 62%, rgba(250,249,246,0))!important; padding:36px 22px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#3A342E!important; -webkit-text-fill-color:#3A342E!important; text-shadow:0 0 10px rgba(250,249,246,.95)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(40,34,28,.42) 0, rgba(40,34,28,.18) 24%, rgba(40,34,28,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/espatulado/es-tapa-video") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(40,34,28,.28)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(40,34,28,.42) 0, rgba(40,34,28,.18) 24%, rgba(40,34,28,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/espatulado/es-tapa-playlist") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(40,34,28,.28)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FAF8F4!important; background:rgba(40,34,28,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FAF8F4!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FAF8F4!important; -webkit-text-fill-color:#FAF8F4!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ MÁRMOL (tanda 2, 23/9/2026): la religiosa: mármol blanco con vetas de oro, capillas y lirios. Tinta carbón (#2E2B28) sobre papel #F7F6F3.
       Viaja en la tela de Óleo (misma estructura, arcos y tipografías) pero NO es
       una pintura: las piezas son fotos hiperrealistas de Higgsfield. El fondo y la
       portada van en VIDEO REAL (cámara quieta), así que acá se apaga la deriva. */
    marmol: {
      hex: { '#C98E8A':'#C2A56A', '#E3C2B8':'#E6E3DE', '#D9C3A0':'#D9C79A', '#B08A4E':'#B8964F', '#F7EFEA':'#F7F6F3', '#FBF6F2':'#FCFBF9', '#4A2E2C':'#2E2B28', '#6B4744':'#55504A', '#7A5634':'#6B5327', '#82504C':'#7A6236', '#FBF4EF':'#FAF9F6', '#F5E6DF':'#EDEBE6', '#2E1C1B':'#201E1C', '#F2E4DC':'#F0EEEA', '#EAD9B8':'#E3D4AE' },
      rgb: { '74,46,44':'46,43,40', '201,142,138':'194,165,106', '247,239,234':'247,246,243', '40,20,18':'34,30,24', '60,34,32':'34,30,24', '134,96,58':'107,83,39', '176,138,78':'184,150,79', '217,195,160':'217,199,154', '240,220,211':'230,227,222', '251,246,242':'252,251,249', '255,246,236':'250,249,246', '120,70,60':'34,30,24', '107,71,68':'85,80,74', '251,244,239':'250,249,246' },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/marmol/ma-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/ma-medallon2.webp'
      },
      css: [
        /* 24/9, Maki: «el nos casamos blanco sobre blanco» y «que esté más centrado, es fondo blanco» */
        P + '.portada{ justify-content:center!important; }',
        P + '.portada > .c{ background:radial-gradient(closest-side, rgba(250,249,246,.80), rgba(250,249,246,.5) 62%, rgba(250,249,246,0))!important; padding:36px 22px!important; }',
        P + '#pv-kick, ' + P + '.portada #pv-names, ' + P + '.portada #pv-names span, ' + P + '.portada :is(.num, .lab, .sep, .fecha){ color:#2E2B28!important; -webkit-text-fill-color:#2E2B28!important; text-shadow:0 0 10px rgba(250,249,246,.95)!important; }',
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(34,30,24,.42) 0, rgba(34,30,24,.18) 24%, rgba(34,30,24,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/marmol/ma-tapa-video") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(34,30,24,.28)!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(34,30,24,.42) 0, rgba(34,30,24,.18) 24%, rgba(34,30,24,0) 44%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/marmol/ma-tapa-playlist") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(34,30,24,.28)!important; }',
        P + '.rd-tapa .rd-aro{ border-color:#FAF9F6!important; background:rgba(34,30,24,.5)!important; box-shadow:0 0 0 1px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.4)!important; opacity:1!important; }',
        P + '.rd-tapa .rd-aro::after{ border-left-color:#FAF9F6!important; }',
        P + '.rd-tapa .rd-txt{ display:block!important; color:#FAF9F6!important; -webkit-text-fill-color:#FAF9F6!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '#inv-fondo > video{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.portada video.cover-vid{ animation:none!important; scale:1!important; translate:0 0!important; }',
        P + '.footer :is(h1,h2,h3,p,span,div){ text-shadow:0 1px 3px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55)!important; }'
      ].join('\n')
    },
    /* ⭐ NOCTURNO (paulina-y-gerardo, hacienda en Mérida, boda de noche): la PRIMERA
       OSCURA de la línea. Es Rosé dado vuelta: la pared pasa a azul noche, la tinta a
       marfil y el acento a pan de oro. Las sombras (74,46,44 / 40,20,18 / 120,70,60)
       van a NEGRO, nunca a la tinta clara, y el halo de papel detrás del texto pasa a
       ser azul noche. Contrastes medidos: TINTA 14,5 · TINTA2 10,8 · ORO_T 10,1 sobre
       la pared; CREMA 15,5 sobre la banda; botón 7,3.
       ⚠️ #FBF4EF es a la vez CREMA (texto de banda) y el arranque del degradé de la
       carta: el mapa lo manda a marfil y la carta quedaría clara con tinta clara. Por
       eso la carta se repinta en 'css', que se agrega DESPUÉS de teñir. */
    nocturno: {
      hex: {
        '#C98E8A':'#C9A96A', '#E3C2B8':'#2B3556', '#D9C3A0':'#C9A45C', '#B08A4E':'#D4B26E',
        '#F7EFEA':'#141B2E', '#FBF6F2':'#1C2440', '#4A2E2C':'#F3EBDD', '#6B4744':'#D6CCBB',
        '#7A5634':'#E0C48A', '#82504C':'#0E1424', '#FBF4EF':'#F3EBDD', '#F5E6DF':'#E0C48A',
        '#2E1C1B':'#141B2E', '#F2E4DC':'#1C2440', '#EAD9B8':'#D4B26E'
      },
      rgb: {
        '74,46,44':'0,0,0', '201,142,138':'201,169,106', '247,239,234':'20,27,46',
        '40,20,18':'0,0,0', '60,34,32':'8,12,22', '134,96,58':'212,178,110',
        '176,138,78':'212,178,110', '217,195,160':'212,178,110', '240,220,211':'243,235,221',
        '251,246,242':'28,36,64', '255,246,236':'255,240,205', '120,70,60':'0,0,0',
        '107,71,68':'214,204,187', '251,244,239':'243,235,221'
      },
      url: {
        'invitame/oleo/oleo-rose-base.webp':'invitame/oleo-nocturno/oleo-nocturno-base.webp',
        'invitame/piezas/oleo-medallon-rose-2.webp':'invitame/piezas/oleo-medallon-nocturno.webp'
      },
      css: [
        P + '.cf-letter{ background:linear-gradient(180deg,#1C2440 0%,#141B2E 100%)!important; color:#F3EBDD!important; box-shadow:0 10px 26px rgba(0,0,0,.45)!important; }',
        P + '.cf-letter :is(h3, p, div, span){ color:#F3EBDD!important; -webkit-text-fill-color:#F3EBDD!important; }',
        P + '.pasecard .estado{ background-color:rgba(212,178,110,.18)!important; color:#F3EBDD!important; border-color:rgba(212,178,110,.55)!important; }',
        /* 23/9: el body traía el lino claro del motor (#D7CCBD). reglas-duras compone los
           degradados de cada sección SOBRE el primer fondo opaco de abajo, que era ése:
           medía «fondo claro» y oscurecía los textos crema → ilegibles sobre la noche. */
        P + 'body{ background-color:#141B2E!important; }',
        /* el título de los colores y el «Ver más» nacen en el verde oscuro del motor (#3A453D) */
        P + ':is(.col-dc-tit, .iv-plie-btn){ color:#E0C48A!important; -webkit-text-fill-color:#E0C48A!important; }',
        P + '.col-dc-tit{ color:#F3EBDD!important; -webkit-text-fill-color:#F3EBDD!important; }',
        /* el pase: el motor le pone un radial blanco al 95% encima del color → salía crema (regla: el pase nunca blanco) */
        P + '.pasecard{ background-image:radial-gradient(130% 90% at 50% 0%, #26305A, #151C33)!important; border-color:rgba(212,178,110,.45)!important; box-shadow:0 12px 30px rgba(0,0,0,.5)!important; }',
        P + '.pasecard :is(div,span,p,b,strong,small,label):not(.estado){ color:#F3EBDD!important; -webkit-text-fill-color:#F3EBDD!important; }',
        P + '.pasecard::before{ border-color:rgba(212,178,110,.35)!important; }',
        /* el sobre de la carta: tinte multiply al 88% sobre la foto marfil → quedaba lila grisáceo */
        P + ':is(.cf-back-tint, .cf-front-tint){ opacity:1!important; }',
        /* la tapa del video y de la playlist: transparente, con el aro en tinta oscura → invisible de noche */
        P + '.rd-tapa{ background:radial-gradient(120% 90% at 50% 40%, #26305A, #141B2E)!important; border:1px solid rgba(212,178,110,.45)!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(0,0,0,.45)!important; }',
        P + '.rd-aro{ border-color:#D4B26E!important; opacity:1!important; }',
        /* 23/9 · Maki: «los rectángulos… un dibujo con la temática, así no queda tan vacío». Óleo propio en cada
           tapa (proyector para el video, gramófono para la playlist), mismo trazo que el fondo, y un claro oscuro
           detrás del play para que el aro se lea. */
        P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(10,14,28,.62) 0, rgba(10,14,28,.32) 22%, rgba(10,14,28,0) 42%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/oleo-nocturno/oleo-pg-tapa-video-a") center/cover no-repeat!important; }',
        P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(10,14,28,.62) 0, rgba(10,14,28,.32) 22%, rgba(10,14,28,0) 42%), url("https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/oleo-nocturno/oleo-pg-tapa-playlist-b") center/cover no-repeat!important; }',
        P + '.rd-aro{ background:rgba(12,16,32,.55)!important; box-shadow:0 0 0 1px rgba(212,178,110,.35), 0 6px 18px rgba(0,0,0,.5)!important; }',
        P + '.rd-txt{ text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }',
        P + '.rd-aro::after{ border-left-color:#D4B26E!important; }',
        P + '.rd-txt{ color:#E0C48A!important; -webkit-text-fill-color:#E0C48A!important; }',
        /* Vestimenta cae sobre la parte iluminada del óleo (la arcada): velo más firme SÓLO ahí */
        P + '.frame > section.sec:not(.verde):not(#contacto-sec):not(.scratch-sec):has(.col-dc){ background-image:radial-gradient(75% 55% at 50% 45%, rgba(20,27,46,.66) 0%, rgba(20,27,46,.4) 50%, rgba(20,27,46,0) 82%)!important; }'
      ].join('\n')
    }
  };
  function tono() {
    try {
      var q = /[?&]coleccion=oleo-([a-z]+)/.exec(location.search);
      if (q) return TONOS[q[1]] ? q[1] : '';
      var m = /^oleo-([a-z]+)$/.exec(String((ev().fx || {}).coleccion || '').toLowerCase());
      return (m && TONOS[m[1]]) ? m[1] : '';
    } catch (e) { return ''; }
  }
  function tenir(s) {
    var t = TONOS[tono()]; if (!t) return s;
    var k;
    for (k in t.url) s = s.split(k).join(t.url[k]);
    for (k in t.hex) { s = s.split(k).join(t.hex[k]); s = s.split('%23' + k.slice(1)).join('%23' + t.hex[k].slice(1)); }
    for (k in t.rgb) s = s.split('rgba(' + k + ',').join('rgba(' + t.rgb[k] + ',');
    if (t.css && /[{]/.test(s)) s += '\n' + t.css;
    return s;
  }
  var PALETA_VIVA = null;
  function paletaViva() {
    var o = {}, k;
    for (k in PALETA_PROPIA) if (Object.prototype.hasOwnProperty.call(PALETA_PROPIA, k)) o[k] = tenir(PALETA_PROPIA[k]);
    return o;
  }

  function activa() {
    try {
      if (/[?&]coleccion=oleo\b/.test(location.search)) return true;
      var c = String((ev().fx || {}).coleccion || '').toLowerCase();
      return c === ID || (c.indexOf(ID + '-') === 0 && !!tono());
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
    '  background-image:none!important;', /* 25/9, Maki: «la raspada no tiene la fecha atrás»: abajo iba el MISMO medallón que la tapa y el número se perdía encima. Abajo va papel liso. */
    '  background-size:cover!important; background-position:center!important;',
    '  border-radius:50%!important;',
    '  box-shadow:0 4px 10px rgba(74,46,44,.22)!important;',
    '}',
    P + '.ivf .n{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; font-size:26px!important; font-weight:500!important; }',

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
    /* ─────────────── 17 · 24/9, Maki: «el fondo de cuadriculado blanco es horrible». Lo pinta
       efectos/vestido-basico.js (trama cruzada 0deg+90deg en .pasecard/.tl/.scratchcard cuando
       <html> no tiene data-coleccion). El pase va con la PINTURA detrás, velada con el papel. */
    P + '.pase .pasecard{ background-color:' + PAPEL2 + '!important; background-image:linear-gradient(rgba(251,246,242,.86), rgba(251,246,242,.86)), url("' + PINTURA + '")!important; background-size:cover!important; background-position:center!important; background-repeat:no-repeat!important; }',
    P + '.tl, ' + P + '.scratchcard{ background-image:none!important; }',
    P + '.tl{ background-color:' + PAPEL2 + '!important; }',
    /* 24/9, Maki: «la línea del itinerario te cruza el circulito»: aro del mismo papel del panel */
    P + '.tl::before{ z-index:0!important; }',
    P + '.tl > .it::before{ z-index:3!important; background-color:' + PAPEL2 + '!important; box-shadow:0 0 0 7px ' + PAPEL2 + '!important; }',
    /* ─────────────── 18 · 24/9, Maki: «los recuadros de ceremonia, civil, cóctel están demasiado
       básicos, demasiado cuadrados». Arco arriba (el cuadro colgado), filete de oro adentro y el
       medallón pintado montado entre la foto y el título. */
    P + '.evento{ position:relative!important; border-radius:170px 170px 8px 8px / 120px 120px 8px 8px!important; }',
    P + '.evento::after{ content:""!important; position:absolute!important; inset:8px!important; border:1px solid rgba(176,138,78,.55)!important; border-radius:162px 162px 4px 4px / 114px 114px 4px 4px!important; pointer-events:none!important; z-index:4!important; }',
    P + '.evento .bd{ position:relative!important; }',
    P + '.evento .bd::before{ content:""!important; display:block!important; width:60px!important; height:60px!important; margin:-46px auto 6px!important; position:relative!important; z-index:5!important; border-radius:50%!important; background:' + PAPEL2 + ' url("' + MEDALLON + '") center/88% no-repeat!important; box-shadow:0 0 0 3px ' + PAPEL2 + ', 0 0 0 4px rgba(176,138,78,.6), 0 6px 14px rgba(40,20,18,.18)!important; }',
    P + '.hotel{ position:relative!important; }',
    P + '.hotel::after{ content:""!important; position:absolute!important; inset:6px!important; border:1px solid rgba(176,138,78,.45)!important; border-radius:4px!important; pointer-events:none!important; }',
    /* 24/9, Maki: «en el no podré… es como que titila». El rótulo nacía crema (238,230,214) sobre papel:
       reglas-duras lo repintaba inline y el repaso lo borraba cada 1,2 s → parpadeo. Se le da su tinta. */
    P + '.rsvp-caja .et{ color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; }',
    '@media (prefers-reduced-motion: reduce){ ' + P + '#inv-fondo > *, ' + P + '.portada #pbg, ' + P + '#inv-fondo::after{ animation:none!important; } }'

    ].join('\n');
  }

  /* ================================================================== montaje */
  function hoja() {
    var s = document.getElementById('col-' + ID);
    if (!s) { s = document.createElement('style'); s.id = 'col-' + ID; document.head.appendChild(s); }
    var txt = tenir(armarCSS());
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
    var tn = tono();
    if ((raiz.getAttribute('data-oleo-tono') || '') !== tn) { if (tn) raiz.setAttribute('data-oleo-tono', tn); else raiz.removeAttribute('data-oleo-tono'); }
    if (!PALETA_VIVA || PALETA_VIVA.__tono !== tn) { PALETA_VIVA = paletaViva(); PALETA_VIVA.__tono = tn; }
    var PV = {}, k;
    for (k in PALETA_VIVA) if (k !== '__tono') PV[k] = PALETA_VIVA[k];
    if (!window.INVCOLPALETA || window.INVCOLPALETA.__de !== ID + tn) { PV.__de = ID + tn; window.INVCOLPALETA = PV; }
    for (k in PALETA_PROPIA) {
      if (Object.prototype.hasOwnProperty.call(PALETA_PROPIA, k)) {
        if (raiz.style.getPropertyValue(k) !== PALETA_VIVA[k]) raiz.style.setProperty(k, PALETA_VIVA[k]);
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
    raiz.removeAttribute('data-oleo-tono');
    devolverPase();
    var nm = document.getElementById('pv-names');
    if (nm) nm.style.removeProperty('font-size');
    if (window.INVCOLPALETA && String(window.INVCOLPALETA.__de || '').indexOf(ID) === 0) {
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
