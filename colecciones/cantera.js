/* ===== COLECCIÓN «CANTERA» ===================================================

   Boda religiosa tradicional mexicana. Nace de una referencia que mandó Maki
   el 21/9/2026 (una invitación de la competencia, «religiosa-tradicional»):
   la TEMÁTICA servía, el diseño no. De ahí salió ésta, que no se parece en
   nada a aquélla.

   ⭐ EL IDIOMA DE LA PIEZA ES EL ARCO — Maki, 22/9/2026:
      «Armá las secciones como en Perlas, que metiste tipo circulares en las
       secciones, no tan cuadradas.»

      Y acá el arco no es un adorno prestado: es EL motivo del templo. Las
      cuatro fotos de los novios salieron solas enmarcadas en un arco de
      cantera. Entonces todo lo que enmarca algo —fotos, tarjetas, el pase—
      lleva el arco de medio punto arriba y esquinas rectas abajo, como una
      portada de piedra.

   ⭐ LOS MATERIALES
      · cantera rosada  → la piedra de Morelia, el papel de la invitación
      · latón envejecido→ los acentos, los filetes, el medallón
      · cirio           → la luz cálida, los realces
      · olivo           → el motivo vegetal (la viñeta y el medallón)

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. No dibuja una invitación
      nueva y NO SACA NINGUNA SECCIÓN. Vestir no es quitar.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'cantera'` no hace nada.
      Para probar sin tocar la base: `?coleccion=cantera`

   ⚠️ NO TOCA NADA GLOBAL AL CARGARSE. Este archivo viaja en el paquete de
      `efectos/todo.php` y se carga en TODAS las invitaciones. Todo lo que
      escribe afuera (INVCOLPALETA, atributos del <html>, la hoja de estilo)
      se escribe en `poner()` y tiene su línea espejo en `sacar()`.
      Campestre le pisó la paleta a todas las invitaciones diez horas por
      publicarla al ras del módulo. Acá no.

   ⚠️ LA ESCALA TIPOGRÁFICA ESTÁ REESCRITA ENTERA. `i/estilos-servidor.css`
      clava los tamaños con `!important` y están calibrados para una CURSIVA
      (`--fs-cursiva: 34px`). Cantera usa una versalita en el sobretítulo, así
      que hereda 34 px y al ojo pesa el doble: el sobretítulo le gana al
      título. Eso es exactamente la sensación de «los textos están gigantes»
      del 21/9. Por eso acá el sobretítulo va en 12 px y el título en 21.

   ============================================================================ */
(function () {
  'use strict';

  var ID    = 'cantera';
  var MARCA = 'data-cantera';
  /* El prefijo gana por especificidad SIN pelear con `!important` de clase:
     html[data-cantera] .sec h2  → (0,2,2) contra el (0,1,1) del motor.
     Y para la portada, que el motor clava por ID con !important, hace falta
     html[data-cantera] #pv-names → (1,1,1) contra (1,0,0). */
  var P = 'html[' + MARCA + '] ';

  /* --------------------------------------------------------------- materiales */
  var PAPEL   = '#F3EDE3';   /* el papel: cantera muy clara                */
  var PAPEL2  = '#E7DCCC';   /* el papel de las tarjetas, medio tono abajo */
  var CANTERA = '#C9A38C';   /* la piedra rosada                            */
  var LATON   = '#A8823E';   /* el acento                                   */
  var LATON_C = '#C8A461';   /* latón claro, para realces                   */
  var TINTA   = '#3A2E28';   /* el texto                                    */
  var TINTA2  = '#5F5046';   /* el texto secundario                         */
  var CIRIO   = '#F6E7CC';   /* la luz de la vela                           */
  var OSCURO  = '#2A2018';   /* las bandas oscuras                          */

  var MEDALLA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/invitame/piezas/cantera-medalla-2.webp';

  /* El arco de medio punto, en una sola línea reutilizable.
     Arriba redondo hasta la mitad del alto; abajo, esquinas de piedra. */
  var ARCO = '999px 999px 7px 7px / 46% 46% 7px 7px';

  /* La viñeta: una hoja de olivo entre dos filetes. VECTOR, no foto: se repite
     arriba de cada título y una foto repetida en serie se lee como calcomanía
     (la lección de Bohemia, 21/9). */
  function vinieta(color) {
    var c = encodeURIComponent(color);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 16">' +
      '<path d="M4 8h38" stroke="' + color + '" stroke-width="1" fill="none" opacity=".75"/>' +
      '<path d="M78 8h38" stroke="' + color + '" stroke-width="1" fill="none" opacity=".75"/>' +
      '<path d="M60 2c-5 2.6-8 5.6-8 8 0 1.6.9 3.1 2.4 4.2C56.6 12.2 60 8.6 60 2z" fill="' + color + '"/>' +
      '<path d="M60 2c5 2.6 8 5.6 8 8 0 1.6-.9 3.1-2.4 4.2C63.4 12.2 60 8.6 60 2z" fill="' + color + '" opacity=".72"/>' +
      '<path d="M60 4v10" stroke="' + color + '" stroke-width=".9"/>' +
      '</svg>';
    return 'url("data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/"/g, "'") + '")';
  }

  /* --------------------------------------------------------- la paleta propia
     ⚠️ Una colección clara igual TIENE que reclamar todas las superficies: sin
     éstas, abajo de la invitación asoma el molde de otra colección. */
  var PALETA_PROPIA = {
    '--papel':      PAPEL,
    '--lino':       PAPEL,
    '--lino2':      PAPEL2,
    '--tinta':      TINTA,
    '--tinta2':     TINTA2,
    '--tinta3':     TINTA2,
    '--acento':     LATON,
    '--acento2':    LATON_C,
    '--sec-col':    PAPEL,
    '--tl-papel':   PAPEL2,
    '--tl-tinta':   TINTA,
    '--cf-sobre':   PAPEL2,
    '--cf-col':     TINTA,
    '--sobre-c':    PAPEL,
    '--flap-base':  PAPEL2,
    '--seal-c':     LATON,
    '--r3-tapa':    'url("' + MEDALLA + '")'
  };

  function ev()  { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      if (/[?&]coleccion=cantera\b/.test(location.search)) return true;
      return String((ev().fx || {}).coleccion || '').toLowerCase() === ID;
    } catch (e) { return false; }
  }

  /* ============================================================== la hoja CSS */
  function armarCSS() {
    var V  = vinieta(LATON);
    var VC = vinieta(CIRIO);

    return [

    /* ─────────────────────────────────────────────── 1 · LAS LETRAS
       Cormorant Garamond para los títulos (letra de misal), Karla para el
       cuerpo. La escala se reescribe ENTERA, en px pelados: el marco mide
       500 px fijos en escritorio, así que un `vw` se calcularía contra la
       ventana y no contra la pieza. */
    '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Karla:wght@300;400;500&display=swap");',

    P + '.sec h2, ' + P + '.frase, ' + P + '.portada #pv-names{',
    '  font-family:"Cormorant Garamond",Georgia,serif!important;',
    '}',
    P + '.sec p, ' + P + '.sec .kick, ' + P + '.btn, ' + P + '.evento .sub, ' + P + '.evento .addr{',
    '  font-family:Karla,system-ui,sans-serif!important;',
    '}',

    /* ⚠️ EL SOBRETÍTULO NUNCA MÁS GRANDE QUE EL TÍTULO.
       El motor lo deja en 34 px porque esa medida está pensada para una
       cursiva. En versalita, 12 px con espaciado es lo que se lee delicado. */
    P + '.sec .kick{',
    '  font-size:12px!important; line-height:1.5!important;',
    '  letter-spacing:.24em!important; text-transform:uppercase!important;',
    '  font-weight:500!important; color:' + LATON + '!important;',
    '  margin:0 0 10px 0!important; text-indent:.24em!important;',
    '}',
    /* Y arriba de cada título, la viñeta de olivo. Va como fondo del h2 para
       no agregar un elemento al flujo. */
    P + '.sec h2{',
    '  font-size:21px!important; line-height:1.25!important;',
    '  font-weight:500!important; letter-spacing:.012em!important;',
    '  color:' + TINTA + '!important;',
    '  padding-top:26px!important; margin:0 0 12px 0!important;',
    '  background-image:' + V + '!important;',
    '  background-repeat:no-repeat!important;',
    '  background-position:center top!important;',
    '  background-size:104px auto!important;',
    '}',
    P + '.frase{ font-size:18px!important; line-height:1.62!important; font-style:italic!important; color:' + TINTA + '!important; }',
    P + '.sec p:not(.frase){ font-size:16px!important; line-height:1.66!important; color:' + TINTA2 + '!important; }',

    /* ─────────────────────────────────────────────── 2 · LA PORTADA
       Bloque al PIE (nunca centrado: centrado le cae encima de las caras) y
       los nombres en la cursiva del misal.
       ⚠️ Por ID, que es lo único que le gana a estilos-servidor.css.
       ⚠️ El tamaño de acá es el TECHO: `ajustarNombres()` lo baja cuando la
          pareja tiene nombres largos. Ver el comentario de esa función. */
    P + '.portada{ justify-content:flex-end!important; }',
    P + '#pv-kick{',
    '  font-size:12px!important; letter-spacing:.34em!important;',
    '  text-indent:.34em!important; text-transform:uppercase!important;',
    '  color:' + CIRIO + '!important; -webkit-text-fill-color:' + CIRIO + '!important;',
    '  font-family:Karla,sans-serif!important; font-weight:400!important;',
    '  margin:0 0 6px 0!important;',
    '}',
    P + '#pv-names{',
    '  font-size:clamp(46px,13.5vw,74px)!important;',
    '  line-height:1.04!important; font-weight:400!important;',
    '  font-style:italic!important; letter-spacing:.005em!important;',
    '  text-transform:none!important;',
    '  color:' + CIRIO + '!important; -webkit-text-fill-color:' + CIRIO + '!important;',
    '  text-shadow:0 1px 2px rgba(0,0,0,.55), 0 0 26px rgba(0,0,0,.42)!important;',
    '  margin:0!important; padding-bottom:.06em!important;',
    '}',
    P + '.portada .num{ font-size:34px!important; color:' + CIRIO + '!important; font-family:"Cormorant Garamond",serif!important; }',

    /* ─────────────────────────────────────────── 3 · EL ARCO (lo que pidió Maki)
       Todo lo que enmarca algo lleva medio punto arriba y piedra abajo.
       ⚠️ `overflow:hidden` va sí o sí: sin eso la foto se sale del arco por
          las esquinas y el recorte no se ve. */
    P + ':is(.evento, .hotel, .pasecard, .col-vtapa, .gal figure, .gal a, .padres .av){',
    '  border-radius:' + ARCO + '!important;',
    '  overflow:hidden!important;',
    '}',
    P + ':is(.evento, .hotel, .pasecard){',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid rgba(168,130,62,.34)!important;',
    '  box-shadow:0 10px 26px rgba(58,46,40,.13)!important;',
    '}',
    /* la foto de arriba de cada tarjeta también es un arco, no un rectángulo */
    P + ':is(.evento, .hotel) img{',
    '  border-radius:' + ARCO + '!important;',
    '  display:block!important; width:100%!important;',
    '}',
    /* ⚠️ Las fotos de la galería: MISMO arco, y sin recuadro extra. */
    P + '.gal img{',
    '  border-radius:' + ARCO + '!important;',
    '  display:block!important;',
    '}',

    /* ─────────────────────────────────────── 4 · PERSONAS: LAS TRES EN UNA FILA
       Es la regla 1 del chequeo automático. El motor pone dos columnas FIJAS
       de 168 px; no es falta de lugar (el marco mide 500). */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important; background-color:transparent!important;',
    '}',
    P + '.padres .av{ width:104px!important; height:104px!important; border-radius:50%!important; }',
    P + '.padres .nm{ font-size:18px!important; color:' + TINTA + '!important; font-family:"Cormorant Garamond",serif!important; }',

    /* ─────────────────────────────────────────────── 5 · EL ITINERARIO
       La vía NO es una raya muerta: es una regleta de cuentas de papelería,
       un punto cada 9 px, del grosor de un filete. Y la marca de cada hora es
       EL MEDALLÓN, sobre un disco de papel que tapa la vía por detrás. */
    P + '.tl{ background-color:' + PAPEL2 + '!important; border-radius:14px!important; }',
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  width:2px!important; left:50%!important; margin-left:-1px!important;',
    '  background-image:radial-gradient(circle, ' + LATON + ' 0 1px, rgba(0,0,0,0) 1.2px)!important;',
    '  background-size:2px 9px!important;',
    '  background-repeat:repeat-y!important;',
    '  background-color:transparent!important;',
    '  top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important;',
    '  animation:cantCuentas 2.4s linear infinite!important;',
    '}',
    '@keyframes cantCuentas{ from{background-position:0 0} to{background-position:0 18px} }',
    '@media (prefers-reduced-motion: reduce){ ' + P + '.tl::before{ animation:none!important } }',
    P + '.tl > .it::before{',
    '  content:""!important;',
    '  width:26px!important; height:26px!important; border-radius:50%!important;',
    '  background-image:url("' + MEDALLA + '")!important;',
    '  background-size:contain!important; background-repeat:no-repeat!important;',
    '  box-shadow:0 0 0 5px ' + PAPEL2 + ', 0 2px 6px rgba(58,46,40,.28)!important;',
    '}',

    /* ─────────────────────────────────────────────── 6 · LA RASPADITA
       Sin recuadro (Maki ya lo pidió dos veces) y con el medallón de tapa.
       ⚠️ La variable --r3-tapa se declara en LAS DOS RAMAS: el lienzo no
          cuelga de .rasp-3, y una variable sólo baja a los descendientes. */
    P + ':is(#dc-nada, .scratchcard, .scratch-sec, .rasp-3, .rasp-zona){',
    '  --r3-tapa:url("' + MEDALLA + '");',
    '}',
    P + ':is(#dc-nada, .scratchcard){',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:0!important;',
    '  box-shadow:none!important;',
    '}',
    P + '.rasp-3 .r3-f{ border-radius:999px!important; }',

    /* ─────────────────────────────────────────────── 7 · EL PASE
       Nunca «básico blanco». Papel de la colección, y los rótulos son .k y .v
       (NO .lab/.val: esos no existen y escribirlos no da error, da «no pasó
       nada»). */
    P + '.pasecard{ background-color:' + PAPEL2 + '!important; }',
    P + '.pasecard .t{ font-family:"Cormorant Garamond",serif!important; font-size:20px!important; color:' + TINTA + '!important; letter-spacing:.02em!important; }',
    P + '.pasecard .k{ font-family:Karla,sans-serif!important; font-size:10.5px!important; letter-spacing:.18em!important; text-transform:uppercase!important; color:' + LATON + '!important; }',
    P + '.pasecard .v{ font-family:"Cormorant Garamond",serif!important; font-size:16px!important; color:' + TINTA + '!important; }',
    P + '.pasecard .estado{ background-color:rgba(168,130,62,.16)!important; color:' + TINTA + '!important; border:1px solid rgba(168,130,62,.38)!important; }',
    /* ⚠️ el cuadrado del QR se deja BLANCO a propósito: un lector necesita el contraste. */

    /* ─────────────────────────────────────────────── 8 · LOS BOTONES
       Con volumen, en latón sobre papel. Nunca el azul de link del navegador. */
    P + '.btn{',
    '  font-family:Karla,sans-serif!important; font-size:12px!important;',
    '  letter-spacing:.14em!important; text-transform:uppercase!important;',
    '  color:' + PAPEL + '!important;',
    '  background-color:' + LATON + '!important;',
    '  background-image:linear-gradient(176deg, rgba(255,255,255,.22), rgba(0,0,0,.10))!important;',
    '  border:1px solid rgba(58,46,40,.22)!important;',
    '  border-radius:999px!important;',
    '  box-shadow:0 6px 14px rgba(58,46,40,.20), inset 0 1px 0 rgba(255,255,255,.28)!important;',
    '}',
    P + '.btn.gh{',
    '  color:' + TINTA + '!important;',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:1px solid rgba(168,130,62,.55)!important;',
    '}',

    /* ─────────────────────────────── 9 · LA HOJA DE LA CARTA NO ES BLANCA
       `.cf-letter` trae el papel clavado en el motor y no sale de ninguna
       variable: en una colección con papel propio queda como la única cosa
       blanca de la invitación. */
    P + '.cf-letter{ background-color:' + PAPEL + '!important; color:' + TINTA + '!important; }',
    P + '.cf-letter h3{ font-family:"Cormorant Garamond",serif!important; color:' + TINTA + '!important; }',

    /* ─────────────────────────────── 10 · LAS SECCIONES OSCURAS
       Contacto viene con foto oscura y el motor le deja la tinta del papel:
       el título se come con el fondo. Va en cirio, con una sombra corta que
       lo despegue de la textura. */
    P + '#contacto-sec h2{',
    '  color:' + CIRIO + '!important;',
    '  background-image:' + VC + '!important;',
    '  text-shadow:0 1px 3px rgba(0,0,0,.6)!important;',
    '}',
    P + '#contacto-sec .kick{ color:' + LATON_C + '!important; }',
    P + '#contacto-sec p{ color:rgba(246,231,204,.88)!important; }',

    /* ─────────────────────────────── 11 · EL PIE
       Que no quede la banda de fábrica: piedra oscura, tinta de cirio. */
    P + '.footer{ background-color:' + OSCURO + '!important; color:' + CIRIO + '!important; }'

    ].join('\n');
  }

  /* ================================================================== montaje */
  function hoja() {
    var s = document.getElementById('col-' + ID);
    if (!s) { s = document.createElement('style'); s.id = 'col-' + ID; document.head.appendChild(s); }
    var txt = armarCSS();
    if (s.textContent !== txt) s.textContent = txt;
  }

  /* ⚠️ La vía del itinerario empieza donde está la PRIMERA marca y termina
     donde está la ÚLTIMA. Ese punto depende del texto que cargue Jazmín, así
     que no se puede resolver sólo con CSS: se MIDE y se pasa por variable.
     Y son DOS elementos: la vía (.tl::before) y el relleno que avanza con la
     hora (.tl-prog). Recortar sólo el primero deja el bug vivo. */
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

  /* ⚠️ LOS NOMBRES DE LA PORTADA NO PUEDEN TOCAR LOS BORDES.
     Un `clamp()` fijo le queda bien a «Ana & Luis» y deja «Regina & Emiliano»
     de punta a punta de la tarjeta: no desborda la caja (scrollWidth miente,
     porque el bloque ya ocupa todo el ancho), pero la R y la última o quedan
     mordidas contra el filo y se lee como si estuviera cortado.
     Así que el tamaño se MIDE: se achica hasta que el texto ocupe como mucho
     el 86% del ancho de la tarjeta.
     ⚠️ Va con `setProperty(..., 'important')`: estilos-servidor.css clava
        #pv-names con !important y un inline sin prioridad NO le gana. */
  var TOPE_NOMBRES = 0.86;
  function ajustarNombres() {
    try {
      var n = document.getElementById('pv-names'); if (!n) return;
      var caja = n.parentElement; if (!caja) return;
      var ancho = caja.clientWidth; if (!ancho) return;
      n.style.removeProperty('font-size');
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

  function poner() {
    var raiz = document.documentElement;
    if (!raiz.hasAttribute(MARCA)) raiz.setAttribute(MARCA, '');
    /* La colección trae su propia marca (el medallón de olivo) y por eso
       `simbolo-tematica.js` no dibuja su SVG genérico.
       ⚠️⚠️ EL BUG DEL 22/9/2026: esto se ponía VACÍO, y el chequeo lee
       `data-marca-propia` con `|| ''` y después `if (propia)`. Cadena vacía
       es falsa: para el chequeo era como no tener marca propia, y la regla
       `simbolo-tematica` fallaba con el medallón PERFECTAMENTE puesto.
       El atributo tiene que llevar el NOMBRE de la colección. */
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
    puesta = true;
  }

  function sacar() {
    if (!puesta) return;
    var raiz = document.documentElement;
    raiz.removeAttribute(MARCA);
    raiz.removeAttribute('data-marca-propia');
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
    /* se repasa: la invitación arma secciones después, y la vía hay que
       volver a medirla si gira el teléfono o cambia un texto */
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
    setInterval(function () { if (puesta) { medirVia(); ajustarNombres(); } }, 1200);
    addEventListener('resize', function () { if (puesta) ajustarNombres(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
