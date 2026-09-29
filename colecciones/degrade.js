/* ============================================================================
   COLECCIÓN «DEGRADÉ»  ·  id `degrade`  ·  29/9/2026
   Fondos de COLOR FIJOS, más básicos: nace del Sapo (Maki: «ese fondo verde con
   degradé quedó espectacular… armar estas más básicas de fondos más fijos»).
   Misma arquitectura oscura del Sapo, SIN el cuento: la pieza es un medallón de oro
   con un corazón, y las tapas son proyector y tocadiscos neutros.
   ⭐ TONOS: fx.coleccion = 'degrade-<tono>' (esmeralda · azul · borgona · ciruela ·
      petroleo · onix). 'degrade' a secas = esmeralda. El tono recolorea el papel,
      los paneles y los velos; el oro y la crema quedan iguales.
   ⚠️ VIENE APAGADA: sin fx.coleccion degrade* no hace nada (viaja en todo.php).
   ============================================================================ */
(function () {

  var ID     = 'degrade';
  var ID_CSS = 'col-degrade';
  var P      = 'html[data-col="degrade"][data-coleccion="degrade"] ';

  /* --------------------------------------------------------------- la paleta
     Medidos contra el papel #14251C:
       CREMA  #E8DFC8 → 11,9    ORO #C9A44E → 5,6    ORO_CL #E0C57A → 8,6      */
  var PAPEL  = '#14251C';   /* agua honda: el papel de las secciones */
  var PAPEL2 = '#0D1A13';   /* el verde casi negro, para los pozos */
  var TINTA  = '#E8DFC8';   /* crema: títulos, nombres, datos */
  var TINTA2 = '#C6C0A8';   /* crema apagada: bajadas y cuerpo */
  var TINTA3 = '#5C6B52';   /* musgo pálido: SÓLO filetes. NUNCA texto */
  var ORO    = '#C9A44E';   /* el acento */
  var ORO_CL = '#E0C57A';   /* el oro claro, para títulos grandes */
  var MUSGO  = '#1E3A2B';   /* el verde musgo de los paneles */

  var BOLA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/invitame/piezas/bola-oro.webp';
  /* EL SAPO TIENE QUE APARECER (Maki, 29/9: «parece que no tiene temática»). El sapito de oro
     con corona sobre un nenúfar, FOTOGRAFIADO (Higgsfield): marca del itinerario y tapa de la
     raspadita. La pelota de oro del cuento, de medallón en el pase. Recortes en píxeles sobre
     el original de 2048 (los relativos con desplazamiento no respetan el centro). */
  var CL = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var SAPITO    = CL + 'w_300,q_auto,f_auto/invitame/degrade/dg-medallon-c.png';
  var SAPITO_CH = CL + 'w_120,q_auto,f_auto/invitame/degrade/dg-medallon-c.png';
  var PELOTA    = CL + 'w_160,q_auto,f_auto/invitame/degrade/dg-medallon-c.png';
  var TAPA_VIDEO = CL + 'c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/degrade/dg-tapa-video';
  var TAPA_PLAY  = CL + 'c_fill,w_800,h_730,g_auto,q_auto,f_auto/invitame/degrade/dg-tapa-play';

  /* ⚠️ LA TABLA QUE LA COLECCIÓN RECLAMA COMO PROPIA. Es el contrato de
     `efectos/paleta.js`: van NOMBRES DE VARIABLE CSS, no claves inventadas.
     Bella publicaba {tinta, acento, papel} y por eso no reclamaba ninguna. */
  function paletaPropia() { return {
    '--verde':     ORO,
    '--verde2':    ORO_CL,
    '--muted':     TINTA2,
    '--cream':     PAPEL,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col':   PAPEL,
    '--sec-col-v': TINTA,
    '--sage':      ORO,
    '--sage-cl':   ORO_CL,
    '--oro':       ORO
  }; }
  var PALETA_PROPIA = null;

  /* ---- LOS TONOS: papel · papel2 · hondo (velos) · panel · filete */
  var TONOS = {
    esmeralda: ['20,37,28','13,26,19','8,18,13','#1E3A2B','#5C6B52'],
    azul:      ['17,28,48','11,19,34','7,12,22','#1B2B47','#56627A'],
    borgona:   ['46,16,24','32,10,16','20,6,10','#4A1C28','#7A5058'],
    ciruela:   ['38,20,44','26,13,31','16,8,19','#3A2244','#6E5A76'],
    petroleo:  ['12,38,42','8,26,29','5,16,18','#15393E','#4F6E70'],
    onix:      ['22,22,24','14,14,16','8,8,9','#26262A','#5E5E62']
  };
  /* ⭐⭐ 29/9 · CADA TONO CON SU PROPIO DISEÑO. Maki, al ver Natalia, Elena y Sofía:
     «ponele un poco más de onda a los diseños, están copiadas». El color solo no
     alcanzaba: las tres tenían la misma letra, el mismo medallón, la misma hoja y
     las mismas tarjetas con arco. Ahora cada tono trae:
       disp/scr/txt → la tipografía (títulos · cursiva · cuerpo)
       pieza        → la pieza FOTOGRAFIADA (raspadita, itinerario, pase)
       adorno       → la viñeta de arriba de cada título
       forma        → la forma de tarjetas, itinerario y retratos
       port         → el armado del nombre en la portada
     Un tono que no esté acá usa el de esmeralda. */
  var ESTILOS = {
    esmeralda: { disp:'Cormorant Garamond', scr:'Parisienne',    txt:'Lora',        pieza:'w_SZ,q_auto,f_auto/invitame/degrade/dg-medallon-c.png', adorno:'hoja',     forma:'arco',  port:'serif'  },
    ciruela:   { disp:'Bodoni Moda',        scr:'Pinyon Script', txt:'EB Garamond', pieza:'c_crop,w_0.56,h_0.56,g_center/w_SZ,q_auto,f_auto/invitame/degrade/dg-pieza-ciruela', adorno:'estrella', forma:'marco', port:'script' },
    borgona:   { disp:'Playfair Display',   scr:'Allura',        txt:'Cormorant',   pieza:'c_crop,w_0.64,h_0.64,g_center/w_SZ,q_auto,f_auto/invitame/degrade/dg-pieza-borgona', adorno:'flor',     forma:'filete', port:'versal' }
  };
  function estilo() { return ESTILOS[tono()] || ESTILOS.esmeralda; }
  function hex(rgb) { return '#' + rgb.split(',').map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function tono() {
    var c = '';
    try { c = String(new URLSearchParams(location.search).get('coleccion') || ((ev().fx) || {}).coleccion || '').toLowerCase(); } catch (e) {}
    var k = c.indexOf(ID + '-') === 0 ? c.slice(ID.length + 1) : 'esmeralda';
    return TONOS[k] ? k : 'esmeralda';
  }
  function aplicarTono() {
    var T = TONOS[tono()];
    PAPEL = hex(T[0]); PAPEL2 = hex(T[1]); MUSGO = T[3]; TINTA3 = T[4];
    var pz = estilo().pieza;
    SAPITO = CL + pz.replace('SZ', '300'); SAPITO_CH = CL + pz.replace('SZ', '120'); PELOTA = CL + pz.replace('SZ', '160');
  }
  function recolor(s) {
    var T = TONOS[tono()], B = TONOS.esmeralda;
    if (T === B) return s;
    return s.split('20,37,28').join(T[0]).split('13,26,19').join(T[1]).split('8,18,13').join(T[2]);
  }

  /* ------------------------------------------------------------- utilidades */

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === ID || u.indexOf(ID + '-') === 0;
    } catch (e) {}
    try { var c = String(((ev().fx) || {}).coleccion || '').toLowerCase(); return c === ID || c.indexOf(ID + '-') === 0; }
    catch (e) { return false; }
  }

  /* LA HOJA DE TILO: el adorno de los títulos y la marca del itinerario.
     ⚠️ Dibujada para el TAMAÑO REAL. `.adorno` mide 40 px medidos en vivo (la
        figura se ve a ~18) y la marca del itinerario a 26.
        Descartadas por la misma razón que la vieira de Sirena:
          · la rana de perfil     → a 18 px es una mancha con patas
          · la bola sola          → a 18 px es un punto, o sea el circulito
          · el pozo               → se lee como una taza
        La hoja de tilo es un CORAZÓN con pecíolo y nervadura: a 18 px se lee
        entera, y es el árbol bajo el que pasa el cuento. */
  function hojaSVG(color) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      /* el limbo: corazón asimétrico, punta abajo */
      '<path fill="' + color + '" d="M24 44 C13.5 35.5 5 28.4 5 19.6 ' +
      'C5 12.6 10.4 7.4 17 7.4 C20.4 7.4 22.9 8.9 24 10.9 ' +
      'C25.1 8.9 27.6 7.4 31 7.4 C37.6 7.4 43 12.6 43 19.6 ' +
      'C43 28.4 34.5 35.5 24 44 Z"/>' +
      /* el pecíolo: sin él se lee como un corazón de tarjeta */
      '<path fill="none" stroke="' + color + '" stroke-width="2.4" ' +
      'stroke-linecap="round" d="M24 44 L24 47.2"/>' +
      /* la nervadura, fina y en el papel, para que no se empaste */
      '<g fill="none" stroke="' + PAPEL + '" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="M24 41.4 L24 14.6"/>' +
      '<path d="M24 32 L14.4 23.4"/><path d="M24 32 L33.6 23.4"/>' +
      '<path d="M24 24.6 L16.2 17.8"/><path d="M24 24.6 L31.8 17.8"/>' +
      '</g>' +
      '</svg>');
  }

  /* LA VIÑETA DE CADA TONO — dibujada para 18 px, como la hoja de tilo. */
  function adornoSVG(color) {
    var a = estilo().adorno;
    if (a === 'estrella') return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="' + color + '" d="M24 3 L27.6 17.2 L40.3 9.7 L32.8 22.4 L45 24 L32.8 25.6 L40.3 38.3 L27.6 30.8 L24 45 L20.4 30.8 L7.7 38.3 L15.2 25.6 L3 24 L15.2 22.4 L7.7 9.7 L20.4 17.2 Z"/><circle cx="24" cy="24" r="3.4" fill="' + PAPEL + '"/></svg>');
    if (a === 'flor') {
      var p = '';
      for (var i = 0; i < 6; i++) p += '<ellipse cx="24" cy="13.5" rx="6.6" ry="10" transform="rotate(' + (i * 60) + ' 24 24)"/>';
      return "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="' + color + '">' + p + '</g><circle cx="24" cy="24" r="6" fill="' + PAPEL + '"/><circle cx="24" cy="24" r="3" fill="' + color + '"/></svg>');
    }
    return hojaSVG(color);
  }

  /* LO QUE CAMBIA DE FORMA SEGÚN EL TONO (va AL FINAL: le gana a lo de arriba) */
  function cssEstilo() {
    var E = estilo(), A = [];
    if (E.forma === 'marco') A.push(
      P + ':is(.evento,.hotel){ border-radius:3px!important; box-shadow:inset 0 0 0 7px ' + MUSGO + ', inset 0 0 0 8px rgba(201,164,78,.6), 0 12px 28px rgba(0,0,0,.4)!important; }',
      P + '.evento .ph{ border-radius:0!important; margin:8px 8px 0!important; width:auto!important; }',
      P + '.tl{ border-radius:3px!important; box-shadow:inset 0 0 0 6px ' + MUSGO + ', inset 0 0 0 7px rgba(201,164,78,.5)!important; }',
      P + '.padres .av{ border-radius:6px!important; border:0!important; box-shadow:0 0 0 3px ' + PAPEL + ', 0 0 0 4px ' + ORO + '!important; }',
      P + '.pasecard{ border-radius:3px!important; }'
    );
    if (E.forma === 'filete') A.push(
      P + ':is(.evento,.hotel){ border-radius:26px!important; border:1px solid rgba(201,164,78,.7)!important; outline:1px solid rgba(201,164,78,.32)!important; outline-offset:5px!important; margin-left:6px!important; margin-right:6px!important; }',
      P + '.evento .ph{ border-radius:25px 25px 0 0!important; }',
      P + '.tl{ border-radius:26px!important; outline:1px solid rgba(201,164,78,.28)!important; outline-offset:5px!important; }',
      P + '.padres .av{ border:1px solid ' + ORO + '!important; box-shadow:0 0 0 4px ' + PAPEL + ', 0 0 0 5px rgba(201,164,78,.45)!important; }',
      P + '.pasecard{ border-radius:22px!important; }'
    );
    if (E.port === 'script') A.push(
      P + '#pv-names{ font-family:"' + E.scr + '",cursive!important; font-weight:400!important; letter-spacing:0!important; font-size:clamp(56px,15vw,82px)!important; line-height:1.2!important; padding-bottom:.14em!important; }',
      P + '#pv-kick{ font-family:"' + E.disp + '",serif!important; letter-spacing:.42em!important; text-indent:.42em!important; }',
      P + '.sec h2{ text-transform:uppercase!important; letter-spacing:.16em!important; font-size:17px!important; }',
      P + '.sec .kick{ font-size:21px!important; }'
    );
    if (E.port === 'versal') A.push(
      P + '#pv-names{ font-family:"' + E.disp + '",serif!important; font-weight:400!important; text-transform:uppercase!important; letter-spacing:.14em!important; text-indent:.14em!important; font-size:clamp(30px,8.4vw,44px)!important; line-height:1.3!important; }',
      P + '#pv-kick{ font-family:"' + E.scr + '",cursive!important; text-transform:none!important; letter-spacing:0!important; text-indent:0!important; font-size:26px!important; }',
      P + '.sec h2{ font-style:italic!important; letter-spacing:.02em!important; font-size:23px!important; }',
      P + '.sec .kick{ font-size:22px!important; }'
    );
    return A.join('\n');
  }
  function conLetra(s) {
    var E = estilo();
    return s.split('"Cormorant Garamond"').join('"' + E.disp + '"').split('"Parisienne"').join('"' + E.scr + '"').split('"Lora"').join('"' + E.txt + '"');
  }

  /* ------------------------------------------------------------------- CSS */

  function armarCSS() {
    aplicarTono();
    var A = [];

    /* ---- 1 · el papel de la invitación --------------------------------- */
    A.push(
      P + '.frame{ background-color:' + PAPEL2 + '!important; }',
      P + 'section.sec{ background-color:' + PAPEL + '!important; color:' + TINTA2 + '!important; }',
      P + 'section.sec.verde{ background-color:' + MUSGO + '!important; }',
      /* el claro radial detrás del bloque de texto: el fondo va ADELANTE
         (paso .72) y sin esto los textos sueltos quedan sobre el agua */
      P + '.frame > section.sec:not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 74% 52% at 50% 44%, rgba(20,37,28,.72) 0%, rgba(20,37,28,.44) 48%, rgba(20,37,28,0) 80%)!important; }'
    );

    /* ---- 2 · EL VELO: UNA SOLA CAPA, SOBRE EL FONDO ---------------------
       ⚠️ NO un ::before por sección: eso hace crashear WebKit al cargar.
       ⚠️ Se abre sólo en los 8 % de cada punta, donde no hay letra. */
    A.push(
      P + '#inv-fondo::after{ content:""!important; position:fixed!important; inset:0!important; pointer-events:none!important; z-index:1!important; background:linear-gradient(to right, rgba(8,18,13,0) 0%, rgba(8,18,13,.58) 8%, rgba(8,18,13,.58) 92%, rgba(8,18,13,0) 100%)!important; }'
    );

    /* ---- 3 · LA ESCALA TIPOGRÁFICA, REESCRITA ENTERA --------------------
       ⚠️ El molde la clava por clase y con !important, calibrada para una
          CURSIVA (--fs-cursiva 34px). Esta colección usa Cormorant para los
          títulos, así que la escala se reescribe: el SOBRETÍTULO tiene que ser
          MÁS CHICO que el título, y cada título entra en UN renglón.
       ⚠️ Van en px pelados, no en vw: el marco mide 500 px fijos.
       ⚠️ Se gana por especificidad (0,4,1), no tocando --fs-*: `paleta.js`
          reescribe esas variables cada 1,5 s y ninguna hoja le gana. */
    A.push(
      P + '.sec .kick{ font-family:"Parisienne",cursive!important; font-size:19px!important; line-height:1.25!important; letter-spacing:.01em!important; color:' + ORO + '!important; }',
      P + '.sec h2{ font-family:"Cormorant Garamond",serif!important; font-size:22px!important; line-height:1.18!important; letter-spacing:.06em!important; color:' + TINTA + '!important; }',
      P + '.sec .frase{ font-family:"Lora",serif!important; font-size:17px!important; line-height:1.62!important; color:' + TINTA2 + '!important; }',
      P + '.sec p:not(.frase){ font-family:"Lora",serif!important; font-size:15px!important; line-height:1.64!important; color:' + TINTA2 + '!important; }',
      P + '.t{ font-family:"Cormorant Garamond",serif!important; font-size:19px!important; color:' + TINTA + '!important; }'
    );

    /* ---- 4 · LA PORTADA -------------------------------------------------
       AL PIE, no centrada: centrarla pone el nombre sobre la cara.
       ⚠️ Los tamaños se ganan por ID: #pv-names y #pv-kick están clavados con
          !important en i/estilos-servidor.css y un ID (1,0,0) le gana a
          cualquier encadenado de clases. */
    A.push(
      P + '.portada{ justify-content:flex-end!important; }',
      P + '#pv-kick{ font-family:"Lora",serif!important; font-size:12px!important; letter-spacing:.34em!important; text-indent:.34em!important; text-transform:uppercase!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '#pv-names{ font-family:"Cormorant Garamond",serif!important; font-weight:500!important; letter-spacing:.04em!important; font-size:clamp(48px,13vw,68px)!important; line-height:1.12!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; padding-bottom:.06em!important; }',
      P + '.portada :is(.num,.lab,.sep,.fecha){ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '.portada .num{ font-family:"Cormorant Garamond",serif!important; }',
      /* el velo de la portada: radial y suave, nunca una banda recta */
      P + '.portada > .c::before{ content:""!important; position:absolute!important; left:-45%!important; right:-45%!important; bottom:-16vh!important; height:82vh!important; pointer-events:none!important; z-index:-1!important; background:radial-gradient(ellipse 52% 70% at 50% 86%, rgba(8,18,13,.72) 0%, rgba(8,18,13,.40) 46%, rgba(8,18,13,0) 78%)!important; }'
    );

    /* ---- 5 · LAS TARJETAS DE LUGAR, CON ARCO ---------------------------
       ⚠️ `.hotel` comparte el grupo y vive adentro de un desplegable CERRADO:
          con padding chico el arco se come la primera línea del nombre.
          Por eso `padding-top:38px` en `.hotel`. */
    A.push(
      P + ':is(.evento,.hotel,.pasecard){ background-color:' + MUSGO + '!important; border:1px solid rgba(201,164,78,.28)!important; box-shadow:0 10px 26px rgba(0,0,0,.34)!important; }',
      P + ':is(.evento,.hotel){ width:auto!important; border-radius:50% 50% 14px 14px / 44px 44px 14px 14px!important; overflow:hidden!important; }',
      P + '.evento .ph{ height:230px!important; }',
      P + '.hotel{ padding:38px 18px 18px!important; text-align:center!important; }',
      P + '.hotel .btn{ margin:10px auto 0!important; }',
      /* UNA sola lista por elemento: los títulos NO entran en la de cuerpo */
      P + ':is(.evento,.hotel,.pasecard) :is(p,.sub,.addr,.k){ color:' + TINTA2 + '!important; }',
      P + ':is(.evento,.hotel) :is(h3,h4), ' + P + '.pasecard .v{ color:' + TINTA + '!important; font-family:"Cormorant Garamond",serif!important; }'
    );

    /* ---- 6 · PERSONAS: LAS TRES EN UNA FILA ----------------------------- */
    A.push(
      P + '.padres{ grid-template-columns:repeat(3,1fr)!important; gap:10px 8px!important; background-color:transparent!important; }',
      P + '.padres[data-col-n="1"]{ grid-template-columns:minmax(0,220px)!important; justify-content:center!important; }',
      P + '.padres[data-col-n="2"]{ grid-template-columns:repeat(2,1fr)!important; }',
      P + '.padres[data-col-n="4"]{ grid-template-columns:repeat(4,1fr)!important; gap:8px 6px!important; }',
      P + '.padres .av{ width:104px!important; height:104px!important; border:2px solid ' + ORO + '!important; }',
      P + '.padres .nm{ font-size:18px!important; color:' + TINTA + '!important; }'
    );

    /* ---- 7 · EL ITINERARIO ---------------------------------------------
       La vía empieza y termina DONDE ESTÁ LA COSA (ver recortarVia), y son
       DOS elementos: `.tl::before` (la vía) y `.tl > .tl-prog` (el avance). */
    A.push(
      /* ⚠️⚠️ 28/9/2026 · LA MISMA TRAMPA QUE BELLA, Y LA PISÉ IGUAL.
         La primera versión clavaba la vía y la marca en `left:34px`. Sirve
         para el itinerario a la izquierda y PARTE EN DOS el de zigzag
         (`.tl-centro`): ahí `.it::before` se posiciona contra SU PROPIA ficha,
         así que 34 px caían ENCIMA del texto — en la captura de 390 px se leía
         «jun🍃l lago», «21:1🍃Cena», «sor🍃sa». Y el `padding-left:56px` con
         !important le ganaba al `padding-left:0` que el motor le pone al
         zigzag, y corría todas las fichas.
         La regla de Bella, que ya estaba escrita: «si el motor ya calcula una
         posición, no se la reemplaza por un número — se la corrige por la
         diferencia». El motor dibuja la marca de 11 px; ésta mide 26, así que
         se corre (26 − 11) / 2 = 7,5 px y listo. Sirve para los dos estilos,
         que Jazmín elige desde el panel. */
      P + '.tl{ background-color:' + MUSGO + '!important; border:1px solid rgba(201,164,78,.24)!important; border-radius:16px!important; }',
      P + '.tl:not(.tl-centro){ padding-left:44px!important; }',
      P + '.tl:not(.tl-centro)::before, ' + P + '.tl:not(.tl-centro) > .tl-prog{ left:23px!important; }',
      P + '.tl::before, ' + P + '.tl > .tl-prog{ top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important; }',
      P + '.tl::before{ background-image:radial-gradient(circle, ' + TINTA3 + ' 1.1px, rgba(0,0,0,0) 1.2px)!important; background-size:2px 9px!important; background-repeat:repeat-y!important; background-color:transparent!important; width:2px!important; }',
      P + '.tl > .tl-prog{ background-color:' + ORO + '!important; width:2px!important; opacity:.85!important; }',
      /* la marca: la hoja de tilo sobre un disco de papel que tapa la vía */
      P + '.tl > .it::before{ width:26px!important; height:26px!important; margin-left:-7.5px!important; margin-top:-7.5px!important; border-radius:50%!important; background-color:' + MUSGO + '!important; background-image:url("' + SAPITO_CH + '")!important; background-size:cover!important; background-repeat:no-repeat!important; background-position:center!important; box-shadow:0 0 0 1px rgba(201,164,78,.55), 0 2px 6px rgba(0,0,0,.35)!important; border:0!important; }',
      /* ⚠️ el motor maneja la marca con DOS reglas: reposo y revelado. Si se
         pisa sólo la opacidad, la marca se enciende a scale(.2) y se ve un
         puntito — el «circulito» que Maki ya rechazó. Va atada a `.on`. */
      /* en el zigzag el motor la centra en alto con margin-top:-5,5 (la mitad
         de 11) y a la IZQUIERDA de las impares la ancla por `right`: por eso
         la corrección va por el lado que el motor usa. */
      P + '.tl.tl-centro > .it::before{ margin-top:-13px!important; }',
      P + '.tl.tl-centro > .it:nth-child(odd)::before{ margin-left:0!important; margin-right:-7.5px!important; }',
      P + '.tl.tl-anim > .it:not(.on)::before{ opacity:0!important; }',
      P + '.tl.tl-anim > .it.on::before{ opacity:1!important; }',
      P + '.tl .hora{ color:' + ORO + '!important; font-family:"Cormorant Garamond",serif!important; }',
      P + '.tl .det{ color:' + TINTA2 + '!important; }'
    );

    /* ---- 8 · EL ADORNO DE LOS TÍTULOS ----------------------------------- */
    A.push(
      P + '.sec h2 .adorno, ' + P + '.adorno{ background-image:url("' + adornoSVG(ORO) + '")!important; background-repeat:no-repeat!important; background-position:center!important; background-size:contain!important; }',
      /* ⚠️⚠️ 28/9 · EL ADORNO DEL MOTOR TRAE LOS ANILLOS DE BODA.
         Es un <svg> con dos filetes y, en el medio, DOS CÍRCULOS ENTRELAZADOS
         (`<circle cx=55>` y `<circle cx=66>`). Se dibujaba ENCIMA de la hoja
         de tilo en las 15 secciones — en un XV. Bella y Sirenita lo esconden
         entero (`.adorno svg{display:none}`); Sapo no lo había traído.
         Acá se esconde SÓLO el grupo de los anillos: los filetes de los
         costados quedan, y la hoja va en el hueco del medio (40 a 80). */
      P + '.adorno svg g:nth-of-type(2), ' + P + '.adorno svg circle{ display:none!important; }'
    );

    /* ---- 8b · LA PELOTA DE ORO: medallón del pase (el cuento arranca con ella) */
    A.push(
      P + '.pasecard{ position:relative!important; overflow:visible!important; padding-top:34px!important; }',
      P + '.pasecard::before{ content:""!important; display:block!important; position:absolute!important; left:50%!important; top:-18px!important; width:36px!important; height:36px!important; margin-left:-18px!important; border-radius:50%!important; background:url("' + PELOTA + '") center/cover no-repeat!important; box-shadow:0 0 0 2px ' + MUSGO + ', 0 0 0 3px rgba(201,164,78,.6), 0 4px 10px rgba(0,0,0,.4)!important; z-index:2!important; }'
    );

    /* ---- 9 · LA RASPADITA: SIN RECUADRO, Y LA TAPA ES LA BOLA -----------
       ⚠️ Son DOS ramas: `.rasp-3 > .r3-f` (lo que se revela) y
          `.rasp-zona > canvas` (la tapa). La variable la lee el CANVAS, así
          que se declara en TODA la rama: una variable sólo baja a los hijos.
       ⚠️ Y el motor APAGA las casillas dormidas con un filter: con una foto de
          tapa eso se lee como «tres bolas de otro color». */
    A.push(
      ':is(#dc-nada, ' + P.trim() + ' .scratch-sec, ' + P.trim() + ' .rasp-3, ' + P.trim() + ' .rasp-zona, ' + P.trim() + ' #scratchcard){ --r3-tapa:url("' + SAPITO + '"); }',
      P + ':is(#scratchcard, .scratchcard){ background-color:transparent!important; background-image:none!important; border:0!important; box-shadow:none!important; }',
      P + '.rasp-zona.dormida canvas{ filter:none!important; }'
    );

    /* ---- 10 · LAS TAPAS DE VIDEO Y PLAYLIST ----------------------------
       ⚠️ `.rd-tapa` es la MISMA clase para el video y para la playlist: se
          separan por sección, nunca suponiendo que hay dos clases. */
    A.push(
      P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(8,18,13,.42) 0, rgba(8,18,13,.18) 24%, rgba(8,18,13,0) 44%), url("' + TAPA_VIDEO + '") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(0,0,0,.40)!important; }',
      P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(8,18,13,.42) 0, rgba(8,18,13,.18) 24%, rgba(8,18,13,0) 44%), url("' + TAPA_PLAY + '") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(0,0,0,.40)!important; }',
      P + '.rd-tapa .rd-aro{ border-color:' + ORO_CL + '!important; background:rgba(8,18,13,.5)!important; box-shadow:0 0 0 1px rgba(224,197,122,.4), 0 6px 18px rgba(0,0,0,.45)!important; opacity:1!important; }',
      P + '.rd-tapa .rd-aro::after{ border-left-color:' + TINTA + '!important; }',
      P + '.rd-tapa .rd-txt{ display:block!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }'
    );

    /* ---- 11 · EL PASE: NUNCA BÁSICO BLANCO -----------------------------
       ⚠️ Los rótulos son `.k` y `.v`, NO `.lab`/`.val`. Un selector que no
          existe no da error: da «no pasó nada».
       ⚠️ El cuadrado del QR se deja BLANCO a propósito: el lector necesita
          ese contraste. Es la excepción de la regla del papel. */
    A.push(
      P + '.pasecard{ border-radius:14px!important; }',
      /* ⚠️ 28/9 · estaban en TINTA3 —«SÓLO filetes. NUNCA texto», escrito
         arriba de todo en este mismo archivo— y medían 2,17 de contraste:
         «Nombre», «Personas», «Mesa», «Estado del pase» casi no se veían. */
      P + '.pasecard .k{ color:' + TINTA2 + '!important; letter-spacing:.14em!important; text-transform:uppercase!important; font-size:10px!important; }',
      P + '.pasecard .v{ color:' + TINTA + '!important; font-size:15px!important; }',
      P + '.pasecard .t{ font-family:"Cormorant Garamond",serif!important; font-size:19px!important; color:' + ORO_CL + '!important; }',
      P + '.pasecard .estado{ background-color:rgba(201,164,78,.18)!important; color:' + ORO_CL + '!important; border:1px solid rgba(201,164,78,.45)!important; }'
    );

    /* ---- 12 · LOS CONTROLES -------------------------------------------
       ⚠️ `#filtro-abrir` y `#gal-entrar` NO entran en el conjunto del molde
          (`:is(.btn,#btn-ingresar,.wsp,.tv-btn,.inv-prev-btn)`), así que en una
          colección oscura nacen crema con letra gris. Se pintan a mano. */
    A.push(
      P + ':is(.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn, #filtro-abrir, #gal-entrar){ background-color:' + ORO + '!important; color:' + PAPEL2 + '!important; -webkit-text-fill-color:' + PAPEL2 + '!important; border:0!important; }',
      P + ':is(.btn, #filtro-abrir, #gal-entrar):hover{ background-color:' + ORO_CL + '!important; }',
      /* el formulario nace pintado para fondo OSCURO y acá justamente lo es:
         se le sube el borde para que se vea contra el musgo */
      P + 'form.rsvpform :is(input,select,textarea){ background-color:rgba(255,255,255,.06)!important; border-color:rgba(201,164,78,.40)!important; color:' + TINTA + '!important; }',
      P + 'form.rsvpform label{ color:' + TINTA2 + '!important; }',
      /* ⚠️ 28/9 · la mesa de regalos NO son `.btn`: son `.reg-btns a`, y el
         molde los pinta con letra BLANCA. Sobre el oro medían 2,36 —
         «Liverpool», «Amazon», «Palacio de Hierro» casi no se leían—. Y el
         «Copiar» de los datos de transferencia es `.banco .copy` (el motor lo
         clava en #7d5f34 !important), marrón sobre musgo: 3,03.
         ⚠️ La primera vez puse `.rb-cbu .copy` porque el chequeo informaba ese
            padre, y NO agarró: el que se ve cuelga de `.banco .val`. Antes de
            escribir un selector, `el.matches(selector)` sobre el elemento real. */
      P + '.reg-btns a{ color:' + PAPEL2 + '!important; -webkit-text-fill-color:' + PAPEL2 + '!important; }',
      P + ':is(.banco, .rb-cbu) .copy{ color:' + ORO_CL + '!important; -webkit-text-fill-color:' + ORO_CL + '!important; }',
      /* ⚠️ 28/9 · el nombre de la TRIVIA (`.tv-in`) nace blanco al 92 %: una
         barra blanca en medio de la noche. Bella lo tiene oscuro; Sapo no lo
         había traído. Va SÓLO a `.tv-in` — una regla de `input` suelta le
         pegaría también al formulario de confirmación, que ya está bien. */
      P + '.tv-in{ background-color:rgba(13,26,19,.55)!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; border:1px solid rgba(201,164,78,.40)!important; }',
      P + '.tv-in::placeholder{ color:rgba(232,223,200,.55)!important; -webkit-text-fill-color:rgba(232,223,200,.55)!important; }'
    );

    /* ---- 12 bis · EL CIELO DEL AMBIENTE: DE NOCHE, CON LUCIÉRNAGAS -------
       `fx.ambiente.tipo = 'nubes'` pinta SIEMPRE `/i/cielo.jpg`, un cielo
       DIURNO y BLANCO que tapa la sección entera; los colores de la temática
       no los usa. Ya estaba escrito en Cantera y en Bella, y acá se volvió a
       caer: el 28/9 el itinerario de Zoé salió BLANCO con el título crema
       encima, ilegible. Y la regla 6 del chequeo NO lo cantó (0 parches
       claros): mira `background-color`, y esto es una FOTO de fondo.
       Colección oscura con tinta clara → el cielo va de noche. Las chispas
       son luciérnagas, las mismas del fondo del pozo. */
    A.push(
      P + '.ambiente .sky{',
      '  background-image:',
      '    radial-gradient(1.8px 1.8px at 21% 13%, rgba(224,197,122,.95), rgba(224,197,122,0) 60%),',
      '    radial-gradient(1.2px 1.2px at 67% 8%,  rgba(240,220,160,.85), rgba(240,220,160,0) 60%),',
      '    radial-gradient(2.2px 2.2px at 85% 30%, rgba(224,197,122,.80), rgba(224,197,122,0) 62%),',
      '    radial-gradient(1.3px 1.3px at 37% 38%, rgba(240,220,160,.80), rgba(240,220,160,0) 60%),',
      '    radial-gradient(2.0px 2.0px at 11% 56%, rgba(224,197,122,.85), rgba(224,197,122,0) 62%),',
      '    radial-gradient(1.2px 1.2px at 73% 65%, rgba(240,220,160,.78), rgba(240,220,160,0) 60%),',
      '    radial-gradient(1.9px 1.9px at 46% 81%, rgba(224,197,122,.88), rgba(224,197,122,0) 62%),',
      '    radial-gradient(1.1px 1.1px at 89% 90%, rgba(240,220,160,.75), rgba(240,220,160,0) 60%),',
      '    linear-gradient(180deg, rgba(13,26,19,.94) 0%, rgba(20,37,28,.88) 100%)!important;',
      '  background-size:168px 168px,168px 168px,168px 168px,168px 168px,',
      '                  168px 168px,168px 168px,168px 168px,168px 168px,100% 100%!important;',
      '  background-repeat:repeat,repeat,repeat,repeat,repeat,repeat,repeat,repeat,no-repeat!important;',
      '  background-color:' + PAPEL2 + '!important;',
      '}'
    );

    /* ---- 13 · LA CARTA Y EL CONTACTO ------------------------------------
       ⚠️ `.cf-letter` trae el papel clavado en el motor: en una colección
          oscura es la única cosa blanca de la invitación. */
    A.push(
      P + '.cf-letter{ background-color:' + PAPEL + '!important; background-image:none!important; color:' + TINTA2 + '!important; border:1px solid rgba(201,164,78,.22)!important; }',
      P + '.cf-letter :is(h2,h3,.t){ color:' + TINTA + '!important; }',
      P + '#contacto-sec{ background-color:' + PAPEL2 + '!important; }',
      P + '#contacto-sec :is(h2,.kick){ text-shadow:0 1px 3px rgba(0,0,0,.8)!important; }',
      P + '.footer :is(h1,h2,h3,p,span,div){ color:' + TINTA2 + '!important; text-shadow:0 1px 3px rgba(0,0,0,.8)!important; }'
    );

    A.push(cssEstilo());
    return recolor(conLetra(A.join('\n')));
  }

  /* ---------------------------------------------------------------- fuentes */

  function fuentes() {
    /* ⚠️ Se pide SÓLO el nombre de la familia. Con una pila CSS entera
       ("'Lora',serif") Google Fonts devuelve 400 y la fuente no carga. */
    var E = estilo(), f = function (n) { return n.replace(/ /g, '+'); };
    var href = 'https://fonts.googleapis.com/css2' +
      '?family=' + f(E.disp) + ':ital,wght@0,400;0,500;0,600;1,400' +
      '&family=' + f(E.txt) + ':ital,wght@0,400;0,500;1,400' +
      '&family=' + f(E.scr) +
      '&display=swap';
    var marca = ID + '-' + tono();
    if (document.querySelector('link[data-col-fuentes="' + marca + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    l.setAttribute('data-col-fuentes', marca);
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------ poner/sacar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    return s;
  }

  /* ⚠️ `reglas-duras.js` escribe `color` INLINE y con `!important`. Contra un
     inline no hay hoja que gane: hay que BORRARLO, y volver a borrarlo en cada
     repaso. Se barre por `data-regla-orig` —la firma que deja el propio
     corrector— y no por una lista de selectores, que siempre deja uno afuera. */
  function limpiarInlines() {
    try {
      var tocados = document.querySelectorAll('.frame [data-regla-orig]');
      [].forEach.call(tocados, function (e) {
        if (e.style) {
          e.style.removeProperty('color');
          e.style.removeProperty('-webkit-text-fill-color');
        }
        e.removeAttribute('data-regla-orig');
      });
      [].forEach.call(
        document.querySelectorAll('.rd-tapa .rd-txt, .cf-letter, .cf-letter *'),
        function (e) {
          if (e.style && e.style.color) {
            e.style.removeProperty('color');
            e.style.removeProperty('-webkit-text-fill-color');
          }
        }
      );
    } catch (e) {}
  }

  function marcarPadres() {
    try {
      var p = document.querySelector('.padres');
      if (!p) return;
      var n = String(p.children.length);
      if (p.getAttribute('data-col-n') !== n) p.setAttribute('data-col-n', n);
    } catch (e) {}
  }
  function desmarcarPadres() {
    try {
      var p = document.querySelector('.padres');
      if (p) p.removeAttribute('data-col-n');
    } catch (e) {}
  }

  /* LA VÍA EMPIEZA Y TERMINA DONDE ESTÁ LA COSA.
     El motor la dibuja de borde a borde del panel, así que sobra línea arriba
     de la primera marca y abajo de la última. No se resuelve con CSS: el punto
     depende del alto de la ficha, que depende del texto que cargue Jazmín. Se
     MIDE y se pasa por variable, en cada repaso. */
  function recortarVia() {
    try {
      var tl = document.querySelector('.tl'); if (!tl) return;
      var f = tl.querySelectorAll('.it'); if (!f.length) return;
      var R = tl.getBoundingClientRect();
      var a = f[0].getBoundingClientRect();
      var b = f[f.length - 1].getBoundingClientRect();
      tl.style.setProperty('--tl-ini', Math.round(a.top + a.height / 2 - R.top) + 'px');
      tl.style.setProperty('--tl-fin', Math.round(R.bottom - (b.top + b.height / 2)) + 'px');
    } catch (e) {}
  }
  function soltarVia() {
    try {
      var tl = document.querySelector('.tl'); if (!tl) return;
      tl.style.removeProperty('--tl-ini');
      tl.style.removeProperty('--tl-fin');
    } catch (e) {}
  }

  /* 🔴 EL PASE CON EL QR VA ABAJO DE LA RASPADITA. El motor lo deja pegado a
     la portada; quien lo baja es LA COLECCIÓN. Cantera salió con el pase
     arriba por no copiar esto: fue el Fracaso J.
     ⚠️ `devolverPase()` va ADENTRO del `if` de `sacar()`: afuera corre en TODAS
        las invitaciones que no son de esta colección y les pelea el pase. */
  function moverPase() {
    try {
      var pase = document.querySelector('.pase');
      var rasp = document.querySelector('.sec.scratch-sec');
      if (!pase || !rasp) return;
      if (rasp.parentElement !== pase.parentElement) return;
      if (pase.previousElementSibling === rasp) return;
      rasp.parentNode.insertBefore(pase, rasp.nextSibling);
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
    fuentes();
    hoja().textContent = armarCSS();
    document.documentElement.setAttribute('data-col', ID);
    document.documentElement.setAttribute('data-coleccion', ID);
    PALETA_PROPIA = paletaPropia();
    window.INVCOLPALETA = PALETA_PROPIA;
    document.documentElement.setAttribute('data-marca-propia', ID);
    marcarPadres();
    moverPase();
    recortarVia();
    limpiarInlines();
    /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle y un observador
       dispararía decenas de veces por segundo. El repaso de 1,2 s alcanza. */
  }

  function sacar() {
    var s = document.getElementById(ID_CSS); if (s) s.remove();
    desmarcarPadres();
    if (document.documentElement.getAttribute('data-col') === ID) {
      devolverPase();
      soltarVia();
      document.documentElement.removeAttribute('data-col');
      document.documentElement.removeAttribute('data-coleccion');
      if (document.documentElement.getAttribute('data-marca-propia') === ID) {
        document.documentElement.removeAttribute('data-marca-propia');
      }
      if (window.INVCOLPALETA === PALETA_PROPIA) {
        try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; }
      }
    }
  }

  function sincronizar() { if (activa()) poner(); else sacar(); }

  /* ⚠️ EL REPASO DE 1,2 s ES OBLIGATORIO. `INVEV` puede llegar DESPUÉS de
     `load`: si llega tarde la colección no se prende nunca y no hay ningún
     error en consola — se ve como «quedó fea», no como «se rompió». */
  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.INVDEGRADE = { poner: poner, sacar: sacar, css: armarCSS, hoja: hojaSVG, paleta: paletaPropia };
})();
