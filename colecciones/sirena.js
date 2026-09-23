/* ===== COLECCIÓN «LA SIRENITA» ================================================

   La tercera de la línea de princesas, después de Cenicienta y La Bella y la
   Bestia. Nace del pedido de Maki del 23/9/2026: «seguir la línea de princesas».

   ⭐ QUÉ LA HACE DISTINTA DE LAS DEMÁS
        · Es la única en NÁCAR, CORAL Y VERDE MAR. Se eligió esa familia porque
          es la ÚNICA que no choca con ninguna de las diez que ya existen:
          Cenicienta azul hielo y plata · Perlas violeta · Marfil blanco y gris
          · Campestre oliva · Bohemia marrón y camel · Disco plata sobre negro ·
          Bella oro viejo y borgoña · Cantera · Óleo Rosé · Óleo Piedra.
        · Los títulos van en ITALIANA — una romana finísima de capitales anchas,
          que no usa ninguna otra. El sobretítulo va en PARISIENNE (Cenicienta
          usa Alex Brush, Bella Pinyon Script, Perlas Great Vibes). El cuerpo en
          LORA.
        · Es CLARA, al revés que Bella: papel nácar y TINTA OSCURA.
        · La marca del itinerario es una VIEIRA — la valva de la concha, cinco
          nervios y una charnela.
        · El fondo es la arena del fondo del mar con la red de luz del agua,
          EN VIDEO (Kling 3.0 por la API de Higgsfield, 23/9): el mismo collage
          aprobado, animado a partir de esa misma imagen. Movimiento medido:
          6,92 (la playa aprobada da 2,85). Si alguna vez vuelve a ser una
          imagen fija, el PASEO DE CÁMARA por CSS se prende solo.

   ⚠️⚠️ LOS COLORES ESTÁN MEDIDOS CONTRA EL FONDO, NO ELEGIDOS DE OJO.
      Medido sobre `sirena-fondo-base-23-9.webp` (1080×1935):
          gris  p3=64  p50=184  p95=231  p97=238      color medio (170,175,159)
          la franja CENTRAL (30–70 % del ancho), que es donde cae el texto:
          p3=153  p50=190  p97=244
      O sea: es una colección CLARA y la tinta va OSCURA. El peor caso para una
      tinta oscura NO es el 3 % más claro (eso es fácil): es el 3 % más OSCURO
      del centro, un pedazo de alga o de coral que se mete abajo del texto.
      Medido: **(106,154,143)**.

      Con las secciones al 28 % (`fx.fondo.paso = 0.72`) el compuesto peor queda
      en (144,177,166), y ahí:
          TINTA  #0E2A30 → 6,51     TINTA2 #1E3E44 → 4,96
          CORAL2 #8C3A2B → 3,29     CORAL  #B8563E → 2,04
          TINTA3 #8FA9A4 → 1,08
      TINTA sola pasa; las demás no. Por eso acá el CLARO RADIAL detrás del
      texto NO ES OPCIONAL, igual que el velo en Bella pero al revés.

      Calculado el alfa del claro para que TINTA2 pase el piso de 5:
             0,35 → 6,43      0,45 → 6,90      0,55 → 7,39
         Se usa **0,58**, que deja el compuesto peor en (198,211,202):
             TINTA  #0E2A30 → 9,88    ← títulos, nombres, datos
             TINTA2 #1E3E44 → 7,53    ← bajadas y cuerpo
             CORAL2 #8C3A2B → 4,99    ← NI ASÍ. Ver abajo: el coral NO escribe
             CORAL  #B8563E → 3,10    ← SÓLO adorno, NUNCA texto
             TINTA3 #8FA9A4 → 1,18    ← SÓLO filetes y bordes, NUNCA texto

      ⚠️⚠️ POR QUÉ 0,58 Y NO 0,45, Y POR QUÉ ESO NO ARREGLA NADA SOLO.
         Se renderizó la sección de la carta a 0,45 / 0,58 / 0,70 una al lado de
         la otra y **las tres se ven casi iguales**: el claro es radial y el
         collage entra por los costados en los tres casos, así que la regla de
         Maki («me sacaste mucho del fondo, y el fondo estaba buenísimo») no se
         rompe en ninguno. Se toma el del medio.
         ⭐ Y lo que eso deja dicho es lo importante: **el alfa NO era la causa
            de que no se leyera**. Las tres fallas grandes del barrido por placa
            —«Mis XV» 1,73 · «Con el corazón lleno» 2,35 · «Antes del baile»
            2,91— eran CORAL2 USADO COMO TINTA. Ni a 0,70 llegan al piso 5.
            La cura no es lavar más el fondo: es no escribir en coral.
      Y con 0,58 el collage sigue entrando por los costados, que es de lo que se
      trata: el claro es RADIAL y llega a 0 en los bordes.

   ⚠️⚠️ `--verde` SE MAPEA. Es el color de llamada de la plataforma y se lee en
      29 lugares del motor; una colección que no lo mapea hereda el del
      documento del que se clonó. Lo pagó Bella el 23/9 con dos discos de cámara
      en crema y un botón crema sobre crema. Acá va en PALETA_PROPIA, que es el
      contrato de verdad: `efectos/paleta.js` reescribe las variables INLINE en
      el <html> y con `!important` cada 1,5 s, así que **ninguna hoja le gana** —
      la colección PUBLICA su tabla y la paleta pinta ESOS valores.

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'sirena'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'sirena';
  var ID_CSS = 'col-sirena';
  var P      = 'html[data-col="sirena"][data-coleccion="sirena"] ';

  /* ---------------------------------------------------------------- paleta */

  var PAPEL  = '#F4EDE4';   /* nácar: el papel de las secciones */
  var PAPEL2 = '#EADFD2';   /* el nácar más hondo */
  var TINTA  = '#0E2A30';   /* verde abisal casi negro: títulos, nombres, datos */
  var TINTA2 = '#1E3E44';   /* verde mar hondo: bajadas y cuerpo */
  var TINTA3 = '#8FA9A4';   /* verde agua pálido: SÓLO filetes. NUNCA texto */
  var CORAL  = '#B8563E';   /* el acento. Adorno, NUNCA texto chico */
  var CORAL2 = '#8C3A2B';   /* el coral hondo: títulos grandes y sellos */
  var ESPUMA = '#CFE0DA';   /* el verde espuma, para fondos suaves */

  var CLARO_A = 0.58;       /* MEDIDO. Ver la cabecera. No bajarlo. */

  /* ⚠️⚠️ LA TABLA QUE LA COLECCIÓN RECLAMA COMO PROPIA.
     Es el contrato de `efectos/paleta.js` (el mismo de Marfil desde el 17/9 y
     de Cenicienta): la colección publica en `window.INVCOLPALETA` las variables
     que son SUYAS, con NOMBRES DE VARIABLE CSS, y la paleta las pinta con ESE
     valor. Las que NO se reclaman siguen siendo de la pareja.
     ⚠️ Bella publicaba `{tinta:…, acento:…, papel:…}` — claves que no son
        variables CSS— y por eso no reclamaba NINGUNA. Ver la cabecera. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,     /* el color de llamada: #filtro-abrir, #gal-entrar, los discos */
    '--verde2':    '#071A1E',
    '--muted':     TINTA2,
    '--cream':     PAPEL,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col':   PAPEL,     /* el papel de las secciones claras */
    '--sec-col-v': TINTA,
    '--sage':      CORAL,     /* el acento es de la colección, no de la paleta */
    '--sage-cl':   CORAL2,
    '--oro':       CORAL
  };

  /* ------------------------------------------------------------- utilidades */

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === ID;
    } catch (e) {}
    try { return String(((ev().fx) || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }

  /* La VIEIRA del adorno de los títulos y de la marca del itinerario.
     ⚠️ Dibujada para el TAMAÑO REAL: `.adorno` mide 40 px medidos en vivo, o sea
        que la figura se ve a unos 18 px, y la marca del itinerario a 26.
        Probadas y DESCARTADAS renderizándolas a 110/64/40/26/18:
          · una sirena de perfil          → a 18 px es una mancha
          · un tridente                   → se lee como una letra Ψ
          · una caracola en espiral       → la espiral se empasta
          · una ola de líneas             → se lee como un subrayado
          · la valva con lóbulos hondos   → se lee como un TULIPÁN
          · la valva con tres nervios     → se lee como una FLOR
        La que sí se lee es la VIEIRA: el contorno de la valva con cinco nervios
        y la charnela abajo. A 18 px es inconfundible y es la concha del cuento.
        Misma lección que el reloj de Cenicienta y el capullo de Bella: se dibuja
        para el tamaño real, no para el viewBox. */
  function vieiraSVG(color) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      /* la valva: ancha, con la charnela abajo y el borde de arriba ONDULADO
         —no petalado—; cinco lóbulos suaves de 3,4 de hondo. Con lóbulos de 6,6
         se leía como un TULIPÁN (probado y descartado a 110/64/40/26/18 px). */
      '<path fill="' + color + '" d="M24 41.8 C11.4 39.2 2.8 30.2 2.2 19.4 ' +
      'q4.36 -3.4 8.72 0 q4.36 -3.4 8.72 0 q4.36 -3.4 8.72 0 ' +
      'q4.36 -3.4 8.72 0 q4.36 -3.4 8.72 0 C45.2 30.2 36.6 39.2 24 41.8 Z"/>' +
      /* la orejita de la charnela: sin ella la figura se lee como un abanico */
      '<path fill="' + color + '" d="M19.8 42.6 C21 43.9 22.4 44.6 24 44.6 ' +
      'C25.6 44.6 27 43.9 28.2 42.6 L24 41 Z"/>' +
      /* siete nervios, finos: con tres se leía como una flor */
      '<g fill="none" stroke="' + PAPEL + '" stroke-width="1.55" stroke-linecap="round">' +
      '<path d="M24 40.4 L24 21.2"/>' +
      '<path d="M21.4 40 L16.3 22"/><path d="M26.6 40 L31.7 22"/>' +
      '<path d="M18.5 38.6 L9.6 23.6"/><path d="M29.5 38.6 L38.4 23.6"/>' +
      '<path d="M15 36.2 L5.2 24.6"/><path d="M33 36.2 L42.8 24.6"/>' +
      '</g>' +
      '</svg>');
  }

  /* ------------------------------------------------------------------- CSS */

  function armarCSS() {
    return [

      /* ---- variables de la colección ----
         ⚠️ Las COMPARTIDAS con la plataforma (--verde, --sage, --cream, --muted,
            --lino, --sec-col) NO van acá: van en PALETA_PROPIA, arriba. Una hoja
            de estilo no le gana al inline con !important que escribe paleta.js
            cada 1,5 s. Acá sólo van las que son nombre propio de esta colección. */
      P + '{',
      '  --nacar:'   + PAPEL  + '; --nacar2:' + PAPEL2 + ';',
      '  --tinta:'   + TINTA  + '; --tinta2:' + TINTA2 + '; --tinta3:' + TINTA3 + ';',
      '  --coral:'   + CORAL  + '; --coral2:' + CORAL2 + ';',
      '  --espuma:'  + ESPUMA + ';',
      '}',

      /* ---- 🔴 DESTAPAR EL FONDO + EL CLARO RADIAL -------------------------
         El motor pinta `.sec` con `i/tex-acuarela.jpg`, un JPEG SIN alfa, así
         que TAPA el fondo entero. Es el mismo bug que se pagó en Campestre, en
         Cenicienta y en Bella. El filtro es `:not([style*="url("])`, NO
         "background-image": las secciones con foto propia la escriben EN LÍNEA
         y hay que dejarlas en paz.
         ⭐⭐ Y en el mismo `background-image` va EL CLARO RADIAL, que es lo que
            hace legible la colección (ver la cabecera: sin él, TINTA2 da 4,96
            contra el peor caso y CORAL2 da 3,29).
         ⚠️ Es RADIAL, nunca una banda recta: deja el collage a la vista en los
            bordes, que es de lo que se trata. Y va SIN `position:relative` ni
            `z-index` — esa familia de reglas es la que mató WebKit en Bella. */
      P + '.sec:not([style*="url("]){',
      '  background-color:transparent!important;',
      '  background-image:radial-gradient(118% 74% at 50% 48%,',
      '    rgba(244,237,228,' + CLARO_A + ') 0%,',
      '    rgba(244,237,228,' + (CLARO_A * 0.72).toFixed(3) + ') 46%,',
      '    rgba(244,237,228,0) 88%)!important;',
      '  background-size:100% 100%!important;',
      '  background-repeat:no-repeat!important;',
      '}',

      /* ---- 🔴🔴 EL PASEO DE CÁMARA: EL MOVIMIENTO ES CONTINUO O NO EXISTE ---
         Desde el 23/9 esta muestra tiene VIDEO de fondo, así que el paseo queda
         de reserva. La regla de Maki es la de siempre: «si algo pasa cada tanto,
         es como que no pasó nada, quedó como una imagen fija».
         → Cuando el fondo es una IMAGEN, el movimiento lo pone un PASEO DE
           CÁMARA por CSS: se acerca y se corre, ida y vuelta, 26 s, sin
           detenerse nunca. Es el recurso de la skill para cuando no hay video.
         ⚠️⚠️ EL SELECTOR ES `#inv-fondo > img`, NO `> *`. Lo escribí primero con
            `> *` pensando «así el día que entre el video, el paseo lo acompaña».
            Estaba mal: el 23/9 entró el video de verdad (Kling 3.0 por la API) y
            ese clip YA trae su propio movimiento — medido en **6,92** contra el
            2,85 de la playa aprobada. Sumarle encima el zoom del paseo es
            movimiento sobre movimiento, y el fondo pasa de «respira» a «marea».
            ⭐ El paseo existe PARA CUANDO NO HAY VIDEO. Con `> img` se prende
               solo con fondo de imagen y se aparta solo cuando hay mp4.
         ⚠️ `will-change:transform` y nada de `filter`: en WebKit un filtro sobre
            una capa de pantalla completa es caro y ya sabemos cómo termina.
         ⚠️ Y `@media (prefers-reduced-motion: reduce)` lo apaga. */
      P + '#inv-fondo > img{',
      '  animation:sirena-paseo 26s ease-in-out infinite alternate!important;',
      '  will-change:transform!important;',
      '  transform-origin:50% 42%!important;',
      '}',
      '@keyframes sirena-paseo{',
      '  0%   { transform:scale(1.00) translate3d(0,0,0); }',
      '  100% { transform:scale(1.09) translate3d(-1.6%,-2.2%,0); }',
      '}',
      /* la luz del agua que recorre: una banda ancha y lenta, SIEMPRE andando */
      P + '#inv-fondo::after{',
      '  content:""!important; position:fixed!important; inset:0!important;',
      '  pointer-events:none!important; z-index:2!important;',
      '  background:linear-gradient(104deg, rgba(255,255,255,0) 28%,',
      '    rgba(255,255,255,.16) 50%, rgba(255,255,255,0) 72%)!important;',
      '  background-size:240% 100%!important;',
      '  animation:sirena-luz 19s linear infinite!important;',
      '}',
      '@keyframes sirena-luz{0%{background-position:170% 0}100%{background-position:-170% 0}}',
      '@media (prefers-reduced-motion: reduce){',
      P + '#inv-fondo > img{ animation:none!important; }',
      P + '#inv-fondo::after{ animation:none!important; }',
      '}',
      /* ⚠️ La portada lleva el MISMO paseo, o el fondo se mueve y la tapa no. */
      P + '.portada #pbg, ' + P + '.portada #pbg > *{',
      '  animation:sirena-paseo 26s ease-in-out infinite alternate!important;',
      '  transform-origin:50% 38%!important;',
      '}',

      /* ---- tipografía ----
         Italiana para los títulos (romana finísima de capitales anchas, no la
         usa ninguna otra), Parisienne para el sobretítulo y Lora para el cuerpo.
         ⚠️ Se mantiene una CURSIVA en el `.kick`, así que la escala de
            `i/estilos-servidor.css` —calibrada para cursiva— sigue sirviendo y
            NO hay que reescribirla entera. Lo único que se corrige es que
            Italiana dibuja más chico de lo que dice su número: el `h2` sube de
            30 a 33 px para que no le gane el sobretítulo. Medido en vivo.
         ⚠️ Se gana por especificidad, nunca tocando `--fs-*`: paleta.js las
            reescribe cada 1,5 s. */
      P + '.frame .sec h2, ' + P + '.frame .sec .h2, ' + P + '.frame .stitle, ' + P + '.frame .dq-h2{',
      '  font-family:"Italiana",serif!important;',
      '  font-size:33px!important;',
      '  letter-spacing:.075em!important;',
      '  color:' + TINTA + '!important;',
      '}',
      /* ⚠️⚠️ EL SOBRETÍTULO NO VA EN CORAL. Primera versión: `.kick` en CORAL2.
         El barrido por placa lo cazó: «Con el corazón lleno» daba **2,35** y
         «Mis XV» en la portada **1,73**. Y es coherente con la cabecera: CORAL2
         mide 4,57 contra el compuesto peor, o sea que sirve para un título
         GRANDE (piso 4) y para nada más — el `.kick` de 31 px cae justo del
         otro lado, y el `#pv-kick` de 13 px pide piso 5.
         ⭐ En esta colección SÓLO TINTA Y TINTA2 SON TINTA. El coral es el aro,
            el adorno y el lacre; TINTA3 es el filete. Ninguno de los dos
            escribe. */
      P + '.frame .kick, ' + P + '.frame .sec .kick{',
      '  font-family:"Parisienne",cursive!important;',
      '  font-size:31px!important;',
      '  color:' + TINTA2 + '!important;',
      '  letter-spacing:.01em!important;',
      '}',
      P + '.sec, ' + P + '.sec div, ' + P + '.sec span{ color:' + TINTA2 + '; }',
      P + '.sec p, ' + P + '.sec li, ' + P + '.sec .txt{',
      '  font-family:"Lora",Georgia,serif!important;',
      '  color:' + TINTA2 + '!important;',
      '}',
      /* ⚠️ `font-variant-numeric:lining-nums` o «172» se lee «I72» en una romana */
      P + '.num, ' + P + '.sec .num, ' + P + '.it .h{ font-variant-numeric:lining-nums!important; }',

      /* ---- filetes y separadores: TINTA3, que NO se usa nunca para texto ---- */
      P + '.sec hr, ' + P + '.filete, ' + P + '.sep{',
      '  border-color:' + TINTA3 + '!important; background:' + TINTA3 + '!important;',
      '  opacity:.7!important;',
      '}',

      /* ---- el adorno del título: la vieira ---- */
      P + '.adorno{',
      '  background-image:url("' + vieiraSVG(CORAL) + '")!important;',
      '  background-size:contain!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '}',
      P + '.adorno svg, ' + P + '.adorno img{ display:none!important; }',

      /* ---- 🔴 EL BOTÓN: LA COLECCIÓN NO LO CLAVA -------------------------
         El MATERIAL lo elige Jazmín desde el panel (`fx.boton.estilo`, once
         estilos en `efectos/botones.js`) y cada estilo declara su `color` y su
         `background` con `!important`. Lección ya escrita en Cantera y vuelta a
         pagar en Bella. Para Sirena va `nacar`.
         → La colección sólo PROPONE, sin `!important`.
         ⚠️ Y `#filtro-abrir` / `#gal-entrar` NO se pintan a mano: nacen con un
            estilo inline `background: var(--verde,…)`, y `--verde` ya está
            reclamado arriba en PALETA_PROPIA. Ésa es la cura, no un parche. */
      P + '.btn:not(.gh):not(.ghost){ letter-spacing:.13em; -webkit-text-fill-color:currentColor; }',
      P + '.btn.gh, ' + P + '.btn.ghost, ' + P + 'a.btn.ghost{',
      '  background-color:transparent!important; background-image:none!important;',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '  border:1px solid rgba(143,169,164,.85)!important; box-shadow:none!important;',
      '}',
      P + '.btn .chev, ' + P + '.chev{ color:inherit!important; opacity:.85!important; }',

      /* ---- 🔴 LOS ARCOS: «MEDIO CÍRCULO ARRIBA», COMO PERLAS --------------
         Maki, 23/9: «Nuestras personas tiene fondo con medio círculo arriba la
         de Perlas, la nuestra también la quiero», y lo mismo para la trivia y
         «Te esperamos».
         ⚠️ Y las tarjetas de Dónde y cuándo van a ANCHO NORMAL: achicarlas al
            66 % «para que vayan juntas» ya se marcó como angostas.
         ⚠️ `.hotel` comparte el grupo y se lleva el arco: con padding chico el
            arco se come la primera línea del nombre del hotel. Va 38 px arriba. */
      P + '.sec.verde{',
      '  border-radius:50% 50% 0 0 / 90px 90px 0 0!important;',
      '  padding-top:96px!important;',
      '  background-color:' + PAPEL2 + '!important;',
      '}',
      P + '.sec.verde::before, ' + P + '.sec.verde::after{ border-radius:inherit!important; }',

      /* ---- tarjetas y cajas: el papel nácar de la colección ---- */
      P + ':is(.evento, .hotel, .pasecard, .card, .caja, .ev-card, .tl){',
      '  background-color:' + PAPEL + '!important;',
      '  background-image:none!important;',
      '  border:1px solid rgba(143,169,164,.55)!important;',
      '  box-shadow:0 8px 22px rgba(14,42,48,.10)!important;',
      '  width:auto!important;',
      '  border-radius:50% 50% 14px 14px / 44px 44px 14px 14px!important;',
      '}',
      P + '.hotel{ padding:38px 18px 18px!important; text-align:center!important; }',
      P + '.hotel .btn{ margin:10px auto 0!important; }',
      P + '.evento .ph{ height:230px!important; }',
      P + ':is(.evento, .hotel, .pasecard) :is(h3, p, .sub, .addr, .t, .v, .k){',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + ':is(.evento, .hotel) h3, ' + P + '.pasecard .v{',
      '  color:' + TINTA + '!important; font-family:"Italiana",serif!important;',
      '}',

      /* ---- 🔴 EL PASE: NUNCA «BÁSICO BLANCO» -----------------------------
         Tres cosas del molde que NO son de la colección y hay que apagar una
         por una: `.v` nace en rgb(102,102,102) —un gris de ninguna paleta—,
         `.estado` en rgb(77,106,79) —el sage de otra colección, clavado en el
         motor— y el papel del boleto es el del molde.
         ⚠️ Los rótulos son `.k` y `.v`, NO `.lab` y `.val`: un selector que no
            existe no da error, da «no pasó nada».
         ⚠️ El cuadrado del QR se deja BLANCO a propósito: sin contraste no
            escanea. */
      P + '.frame .pase, ' + P + 'section.pase{',
      '  background-color:transparent!important;',
      '  background-image:none!important;',
      '  position:relative!important;',
      '}',
      P + '.pase > *{ position:relative!important; z-index:1!important; }',
      /* ⚠️ Primera versión: `.k` en TINTA3. La regla `familia-de-color` la cazó
         —«Nombre», «Personas», «Mesa» y «Estado del pase» salían en
         rgb(80,104,100)— porque `reglas-duras.js` los oscureció al rescate:
         TINTA3 sobre nácar mide 1,08. Está escrito arriba y lo rompí igual:
         TINTA3 es FILETE, nunca texto. */
      P + '.pasecard .k{ color:' + TINTA2 + '!important; letter-spacing:.14em!important; }',
      P + '.pase > .t{',
      '  font-family:"Parisienne",cursive!important; font-size:30px!important;',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + '.pasecard .estado{',
      '  background-color:rgba(184,86,62,.14)!important;',
      '  color:' + CORAL2 + '!important; -webkit-text-fill-color:' + CORAL2 + '!important;',
      '  border:1px solid rgba(140,58,43,.55)!important;',
      '}',

      /* ---- 🔴 LA RASPADITA: SIN RECUADRO, Y CON LA PIEZA DE LA TEMÁTICA ----
         ⚠️⚠️ `--r3-tapa` la lee `efectos/raspadita.js` DESDE EL CANVAS, y una
            variable de CSS sólo baja a los DESCENDIENTES: va declarada en TODA
            la rama, no en `.rasp-3` sola.
         ⚠️⚠️ Y VA SIN PREFIJO: el canvas se pinta UNA sola vez al cargar, antes
            de que la colección alcance a poner `data-col`. Con el prefijo la
            variable no existe todavía en ese instante y se pinta el plateado.
         ⚠️ EL RECUADRO VIVE EN `.scratchcard::after`: `border:0` NO lo apaga.
         ⚠️ El motor APAGA las casillas dormidas con un `filter`; con una FOTO
            eso se lee como tres piezas de distinto color. Se apaga. */
      ':is(.scratch-sec, .rasp-3, .rasp-zona, #scratchcard){',
      '  --r3-tapa:url("https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/piezas/sirena-rasp-tapa-c-23-9.webp");',
      '}',
      P + '.rasp-zona.dormida canvas{ filter:none!important; }',
      P + '.scratchcard, ' + P + '#scratchcard{',
      '  background-color:transparent!important;',
      '  background-image:none!important;',
      '  border:0!important;',
      '  box-shadow:none!important;',
      '}',
      P + '.scratchcard::after, ' + P + '#scratchcard::after{ display:none!important; }',
      /* un aro de nácar en cada tapa, o la pieza se pierde sobre el fondo claro */
      P + '.rasp-zona{ box-shadow:0 0 0 3px ' + PAPEL + '!important; }',

      /* ---- 🔴 LAS PERSONAS, EN UNA SOLA FILA ------------------------------
         `.padres` nace `display:grid` con `grid-template-columns:168px 168px`
         —DOS columnas FIJAS—, así que tres personas caen 2 + 1. Es la regla 1
         del chequeo y falla sola. No es falta de lugar: el marco mide 500 px. */
      P + '.padres{',
      '  grid-template-columns:repeat(3,1fr)!important;',
      '  gap:10px 8px!important; background-color:transparent!important;',
      '}',
      P + '.padres[data-col-n="1"]{ grid-template-columns:minmax(0,220px)!important; justify-content:center!important; }',
      P + '.padres[data-col-n="2"]{ grid-template-columns:repeat(2,1fr)!important; }',
      P + '.padres[data-col-n="4"]{ grid-template-columns:repeat(4,1fr)!important; gap:8px 6px!important; }',
      P + '.padres .av{ width:104px!important; height:104px!important; border-radius:50%!important; border:1px solid ' + TINTA3 + '!important; }',
      P + '.padres .nm{ font-size:18px!important; color:' + TINTA2 + '!important; font-family:"Lora",Georgia,serif!important; }',
      '@media (max-width:360px){' + P + '.padres{ gap:8px 5px!important; }' + P + '.padres .av{ width:88px!important; height:88px!important; }}',

      /* ---- 🔴🔴 LA TAPA DE LA PLAYLIST NO ES UN PAPEL ---------------------
         Regla de Maki, marcada dos veces: «estás poniendo un rectángulo que ya
         te dije que no lo quiero ese rectángulo». Cambiarle el color no lo saca:
         sigue habiendo un rectángulo. Se vuelve TRANSPARENTE del todo y queda
         sólo la PIEZA: el aro de coral con el triángulo, flotando.
         ⚠️ La clase es `.rd-tapa`, LA MISMA para el video y para la playlist.
            `.sp-tapa` y `.tv-tapa` NO EXISTEN.
         ⚠️ Y `reglas-duras.js` le escribe a `.rd-txt` un `color` INLINE con
            `!important`: contra un inline no hay hoja que gane, hay que
            BORRARLO en cada repaso (`limpiarInlines`). */
      P + '.rd-tapa{',
      '  background:none!important; background-color:transparent!important;',
      '  background-image:none!important;',
      '  border:0!important; box-shadow:none!important;',
      '}',
      P + '.rd-tapa .rd-aro{',
      '  border-color:' + CORAL + '!important; color:' + CORAL2 + '!important;',
      '  background:rgba(244,237,228,.80)!important;',
      '  box-shadow:0 0 0 1px rgba(140,58,43,.30), 0 6px 18px rgba(14,42,48,.14)!important;',
      '}',
      P + '.rd-tapa .rd-txt{',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '  letter-spacing:.18em!important;',
      '  text-shadow:0 1px 2px rgba(244,237,228,.95)!important;',
      '}',

      /* ---- campos de formulario ---- */
      P + 'input, ' + P + 'select, ' + P + 'textarea{',
      '  background:rgba(244,237,228,.86)!important; color:' + TINTA + '!important;',
      '  border:1px solid ' + TINTA3 + '!important;',
      '}',
      P + 'input::placeholder, ' + P + 'textarea::placeholder{ color:rgba(30,62,68,.55)!important; }',
      /* ⚠️ Los rótulos del formulario nacen en el CORAL de la temática
         —«Déjanos un mensaje (opcional)» salía en coral— y en esta colección el
         coral NO escribe (ver la cabecera). Van en tinta, como todo rótulo. */
      P + 'label, ' + P + '.rsvp label, ' + P + '.rsvp .lbl, ' + P + '.form-lbl{',
      '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
      '}',

      /* ---- 🔴🔴 EL ITINERARIO ---------------------------------------------
         Maki: «no me gustan los circulitos», «ponele onda, algo más de diseño»,
         «acordate de los movimientos».
         ⚠️⚠️ LA MARCA NO SE RECENTRA A MANO. Lección pagada en Bella el 23/9:
            clavar un `left` fijo rompió la mitad del itinerario porque en
            `.tl-centro` las fichas van en ZIGZAG y `.it::before` se posiciona
            contra SU PROPIA ficha. El motor YA calcula bien las dos columnas
            (`right:-31` en las impares, `left:-31` en las pares). Lo único que
            cambia acá es el TAMAÑO (11 → 26 px), así que lo único que se corrige
            es el CENTRO: `margin-left/-top:-7.5px` = (26 − 11) / 2.
            ⭐ Si el motor ya calcula una posición, no se la reemplaza por un
               número: se la corrige por la diferencia. */
      /* ⚠️⚠️⚠️ NI `overflow:hidden` NI `padding`. LOS DOS ROMPEN EL ITINERARIO.
            Medido el 23/9 en `marisol-mis15`, y es el MISMO error de Bella con
            otra ropa: le pisé al motor una medida suya en vez de corregirla.
            · El motor le da a `.tl` `padding:26px 22px` (medido sin mi hoja).
              Yo le puse `padding:6px 0` y las fichas se fueron contra el borde
              izquierdo, ENCIMA de la vía: los horarios quedaron montados sobre
              la línea.
            · La marca vive en `.it::before` con `left:-26px`, o sea AFUERA de la
              caja. Con `overflow:hidden` se la come entera: las OCHO vieiras
              desaparecieron y quedó un itinerario pelado — justo lo único que
              Maki pidió por nombre («no me gustan los circulitos»).
            ⭐ La regla, otra vez: si el motor ya calcula una medida, no se la
               reemplaza — o se la corrige por la diferencia, o se la deja. */
      P + '.tl{',
      '  border-radius:22px!important;',
      '  border:1px solid rgba(143,169,164,.55)!important;',
      '  background-color:' + PAPEL + '!important;',
      '  background-image:radial-gradient(130% 82% at 50% 0%,',
      '    rgba(207,224,218,.55) 0%, rgba(207,224,218,0) 62%)!important;',
      '  background-size:100% 100%!important; background-repeat:no-repeat!important;',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.7), 0 14px 34px rgba(14,42,48,.12)!important;',
      '  overflow:visible!important; position:relative!important;',
      '}',
      /* ⭐ el movimiento: una luz de agua que BAJA por la vía, sin parar.
         ⚠️⚠️ LA VÍA NO ESTÁ SIEMPRE EN EL MISMO LADO. El motor tiene DOS
            itinerarios: la lista de una columna (vía en `left:6px`, medido) y
            `.tl-centro` (vía en el medio, fichas en zigzag). Yo puse la luz en
            `left:50%` para las dos y en `marisol-mis15` bajaba por el MEDIO DEL
            TEXTO, como una mancha rosa sobre los horarios.
            → Se la pone donde está la vía, y la variante del medio se corrige
              aparte. Una regla por variante, no un número para las dos. */
      P + '.tl::after{',
      '  content:""!important; position:absolute!important; left:6px!important; top:0!important;',
      '  width:3px!important; height:118px!important; margin-left:-0.5px!important;',
      '  border-radius:3px!important; pointer-events:none!important; z-index:1!important;',
      '  background:linear-gradient(180deg, rgba(184,86,62,0) 0%,',
      '    rgba(184,86,62,.42) 45%, rgba(184,86,62,0) 100%)!important;',
      '  filter:blur(1.5px)!important;',
      '  animation:sirena-hilo 4.6s linear infinite!important;',
      '}',
      '@keyframes sirena-hilo{0%{transform:translateY(-22%)}100%{transform:translateY(122%)}}',
      P + '.tl.tl-centro::after{ left:50%!important; margin-left:-1.5px!important; }',
      P + '.tl .tl-prog{ display:none!important; }',
      P + '.it::before{',
      '  width:26px!important; height:26px!important;',
      '  margin-left:-7.5px!important; margin-top:-7.5px!important;',
      '  border-radius:0!important;',
      '  background-image:url("' + vieiraSVG(CORAL) + '")!important;',
      '  background-color:transparent!important;',
      '  background-size:contain!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '  border:0!important; box-shadow:none!important; opacity:1!important;',
      '  filter:drop-shadow(0 1px 2px rgba(14,42,48,.28))!important;',
      '  z-index:2!important;',
      '}',
      /* la vía: fina y apagándose en las dos puntas, nunca un corte seco */
      P + '.tl::before{',
      '  width:1.5px!important; opacity:1!important;',
      '  background:linear-gradient(180deg, rgba(143,169,164,0) 0%,',
      '    rgba(143,169,164,.9) 9%, rgba(143,169,164,.9) 91%, rgba(143,169,164,0) 100%)!important;',
      '}',
      P + '.it .h{ color:' + TINTA + '!important; font-family:"Italiana",serif!important; }',
      /* ⚠️ EL DETALLE ES `.d`, NO `.t`. Lo escriben así los DOS que arman el
         itinerario: el motor (`<div class="d">`) y `efectos/itinerario-momentos.js`.
         Yo había escrito `.it .t`, que no existe: un selector que no existe no
         da error, da «no pasó nada». Se dejan los dos por las dudas. */
      P + '.it .d, ' + P + '.it .t{ color:' + TINTA2 + '!important; font-family:"Lora",Georgia,serif!important; }',

      /* ---- 🔴 LOS TÍTULOS DE LA GALERÍA LOS PINTA SU PROPIO MÓDULO --------
         Medido acá y ya visto en Bella: `#gal-kick` y `#gal-h2` no siguen al
         `.kick`/`h2` de la colección — `efectos/galeria.js` les escribe su
         propio color. El barrido por placa cazó «Antes del baile» en
         rgb(79,68,45), que no es de ninguna paleta de ésta. Se los pinta. */
      P + '#gal-kick, ' + P + '.gal-kick{ color:' + TINTA2 + '!important; font-family:"Parisienne",cursive!important; }',
      P + '#gal-h2, ' + P + '.gal-h2{ color:' + TINTA + '!important; font-family:"Italiana",serif!important; }',

      /* ---- 🔴 LA CARTA: PAPEL CLARO, TINTA DE LA COLECCIÓN ----------------
         Lección de Bella, 23/9: la hoja de la carta es papel CASI BLANCO y si
         la colección le baja una tinta que no se lee, `reglas-duras.js` sale al
         rescate y le escribe un color INLINE con `!important` sacado de ningún
         lado. Un inline del corrector no es un bug del motor: es el aviso de que
         la colección le dio mal la tinta. Acá se la damos.
         ⚠️ Y HAY QUE NOMBRAR CADA ELEMENTO: `.cf-letter *` NO le gana a
            `.sec p` — las dos valen (0,3,1) y `*` no suma nada. */
      P + '.cf-letter, ' + P + '.cf-letter p, ' + P + '.cf-letter h3, ' +
      P + '.cf-letter h4, ' + P + '.cf-letter li, ' + P + '.cf-letter span, ' +
      P + '.cf-letter em, ' + P + '.cf-letter strong, ' + P + '.cf-letter *{',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '  text-shadow:none!important;',
      '}',
      P + '.cf-letter h4{ font-family:"Italiana",serif!important; }',

      /* ---- 🔴 LA PORTADA --------------------------------------------------
         Regla 7bis: el bloque va AL PIE (`flex-end`), nunca centrado, y el
         tamaño se COPIA de una referencia aprobada, no se elige.
         ⚠️ Van por ID: `i/estilos-servidor.css` tiene `#pv-names` y `#pv-kick`
            con `!important`, y un selector de clase no le gana.
         ⚠️ `line-height:1` + `padding-bottom`, no un line-height grande: la cola
            de una cursiva se sale de la caja de línea.
         ⚠️ Y la caja del span tiene que cubrir TODA la tinta o la letra sale
            cortada con un filo recto (la L de Lupita, la p de Lupita). */
      P + '.portada{ justify-content:flex-end!important; }',
      P + '#pv-names{',
      '  font-size:84px!important; line-height:1!important;',
      '  padding-bottom:.24em!important;',
      '  font-family:"Parisienne",cursive!important;',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '}',
      P + '#pv-names span{ padding:0 .10em .17em!important; }',
      /* ⚠️ «MIS XV» son 13 px espaciados SOBRE LA FOTO, arriba del bloque, que es
         justo donde el claro radial de la portada (centrado en 50% 78%) ya casi
         no llega: medido por placa daba 2,61. No se sube el velo —la foto es de
         lo que se trata—: se le da la tinta MÁS OSCURA y un halo de nácar, que
         es lo que ya hace `.rd-txt` y lo que pide una línea chica sobre foto. */
      P + '#pv-kick{',
      '  font-size:13px!important; letter-spacing:.26em!important;',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '  text-shadow:0 1px 3px rgba(244,237,228,.95), 0 0 10px rgba(244,237,228,.75)!important;',
      '}',
      P + '.portada h1, ' + P + '#nombre{ font-family:"Parisienne",cursive!important; }',
      P + '.portada .num{ color:' + TINTA + '!important; font-variant-numeric:lining-nums!important; }',
      P + '.portada .u{ color:' + TINTA2 + '!important; }',
      /* ⚠️ LOS RÓTULOS DE LA CUENTA REGRESIVA NO SON `.u`: son `.count .b .lab`,
         y el motor se los deja en rgb(231,221,200) —una crema del molde OSCURO—.
         Sobre la foto clara de la portada medían 1,16. Se los pinta, y como
         están SOBRE FOTO llevan el halo de nácar, no más velo encima. */
      P + '.count .lab{',
      '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
      '  text-shadow:0 1px 3px rgba(244,237,228,.95), 0 0 9px rgba(244,237,228,.75)!important;',
      '}',
      P + '.count .n, ' + P + '.count .num, ' + P + '.count b{ color:' + TINTA + '!important; }',
      /* un claro RADIAL abajo de la portada, para que el bloque se lea sobre la
         foto — pseudo HERMANO, no ancestro, así no entra en `fondosDe()`
         ⚠️⚠️ EL CLARO TIENE QUE APAGARSE ANTES DEL BORDE DE SU PROPIA CAJA, O
            DEJA DE SER UN CLARO Y ES UN RECTÁNGULO. Primera versión: caja de
            `-8%` a `108%` y gradiente `120% 78%`. El radio horizontal era 1,2
            veces el ancho de la caja, así que al llegar al borde el gradiente
            todavía iba por alfa ≈ 0,55 y ahí lo cortaba la caja: en la portada
            se veían DOS COSTURAS VERTICALES sobre la foto, una de cada lado.
            Es el mismo reclamo de Maki de siempre, con otra ropa: «ese
            rectángulo que ya te dije que no lo quiero».
            ⭐ La cuenta: el gradiente llega a 0 al 88 % del radio, así que para
               que muera adentro hace falta 0,88 × radio ≤ 50 % de la caja, o
               sea radio ≤ 56 %. Se agranda la CAJA (el doble de ancha, mucho
               más alta) y se baja el RADIO a 56 %: el claro queda igual de
               grande en pantalla y no toca ningún borde. */
      P + '.portada > .c::before{',
      '  content:""!important; position:absolute!important;',
      '  left:-50%!important; right:-50%!important;',
      '  bottom:-45%!important; height:190%!important;',
      '  pointer-events:none!important; z-index:-1!important;',
      '  background:radial-gradient(56% 56% at 50% 52%,',
      '    rgba(244,237,228,.82) 0%, rgba(244,237,228,.46) 46%, rgba(244,237,228,0) 88%)!important;',
      '}',
      P + '.portada > .c{ position:relative!important; }',

      ''
    ].join('\n');
  }

  /* ---------------------------------------------------------------- fuentes */

  function fuentes() {
    /* ⚠️ Se pide SÓLO el nombre de la familia. Con una pila CSS entera
       ("'Parisienne',cursive") Google Fonts devuelve 400 y la fuente no carga.
       Eso está medido en la invitación de Clara. */
    var href = 'https://fonts.googleapis.com/css2' +
      '?family=Italiana' +
      '&family=Lora:ital,wght@0,400;0,500;0,600;1,400' +
      '&family=Parisienne' +
      '&display=swap';
    if (document.querySelector('link[data-col-fuentes="' + ID + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    l.setAttribute('data-col-fuentes', ID);
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------ poner/sacar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    return s;
  }

  /* ⚠️ `reglas-duras.js` escribe `color` INLINE con `!important` cuando cree que
     un texto no se lee, y usa un color derivado que no pertenece a ninguna
     paleta. Contra un inline no hay hoja que gane: hay que BORRARLO, y volver a
     borrarlo en cada repaso porque el corrector lo repone. Se le saca también
     `data-regla-orig`, que es donde guarda la tinta de fábrica para reusarla.
     Lección pagada dos veces el mismo día en Bella: el rótulo de la playlist y
     la carta. */
  function limpiarInlines() {
    try {
      /* ⭐⭐ SE BARRE POR `data-regla-orig`, NO POR UNA LISTA DE SELECTORES.
         Lo aprendí caro el 23/9 con el itinerario de `marisol-mis15`: yo venía
         nombrando de a uno los elementos que el corrector pisaba (el rótulo de
         la playlist, la carta, los títulos de la galería, el pie del RSVP) y
         siempre aparecía uno más. El itinerario fue el que lo dejó claro:
         apenas se pudo VER desde el primer pintado (antes estaba oculto porque
         el evento traía imagen), `reglas-duras.js` llegó ANTES que esta hoja,
         lo vio en la crema del molde (244,231,206 — quedó guardado en
         `data-regla-orig`) y lo «rescató» a un marrón 118,86,26. Las ocho horas
         y los ocho detalles salieron marrones, y el `h2` también.
         ⚠️ Y eso NO se gana por especificidad: el corrector escribe el `color`
            EN LÍNEA y CON `!important`. No hay hoja que le gane. Sólo se borra.
         ⭐ `data-regla-orig` es la firma que deja el propio corrector, así que
            barrer por ese atributo alcanza a TODO lo que tocó, incluso lo que
            todavía no me pasó. Y no hay parpadeo en bucle: una vez que manda la
            tinta de la colección el contraste da bien y el corrector no vuelve
            a rescatarlo.
         ⚠️ Se barre SÓLO adentro de `.frame` —la invitación— para no tocar el
            panel ni nada de afuera. */
      var tocados = document.querySelectorAll('.frame [data-regla-orig]');
      [].forEach.call(tocados, function (e) {
        if (e.style) {
          e.style.removeProperty('color');
          e.style.removeProperty('-webkit-text-fill-color');
        }
        e.removeAttribute('data-regla-orig');
      });
      /* y los dos que el corrector pisa SIN dejar firma */
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

  /* El motor no numera `.padres`; Perlas inventó `data-col-n` y acá se usa
     igual, así la fila sirve para 1, 2, 3 o 4 personas y no sólo para tres. */
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

  /* 🔴 EL PASE CON EL QR VA ABAJO DE LA RASPADITA. Lo pidió Maki y el motor lo
     deja pegado a la portada; quien lo baja es LA COLECCIÓN. Perlas lo hace con
     esta misma función; Cantera salió con el pase arriba por no copiarla, y ése
     fue el Fracaso J.
     ⚠️ Sólo se mueve si son HERMANOS, y se corta si ya está puesto: esta función
        la vuelve a llamar el repaso de cada 1,2 s.
     ⚠️⚠️ Y `devolverPase()` va ADENTRO del `if` de `sacar()`: afuera corre en
        TODAS las invitaciones que no son de esta colección y les pelea el pase
        a la suya. Medido en Bella con layout-shift: la raspadita saltaba 300 px
        por segundo en `ximena-y-andres`. */
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
    window.INVCOLPALETA = PALETA_PROPIA;
    document.documentElement.setAttribute('data-marca-propia', ID);
    marcarPadres();
    moverPase();
    limpiarInlines();
    /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle (reglas-duras.js
       corre con cada cambio de clase del marco) y un observador dispararía
       decenas de veces por segundo. `.padres` se arma después del primer
       pintado, pero eso ya lo cubre el repaso de cada 1,2 s. */
  }

  function sacar() {
    var s = document.getElementById(ID_CSS); if (s) s.remove();
    desmarcarPadres();
    if (document.documentElement.getAttribute('data-col') === ID) {
      devolverPase();
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

  /* ⚠️⚠️ EL REPASO DE 1,2 s ES OBLIGATORIO. `INVEV` puede llegar DESPUÉS de
     `load`: si llega tarde, la colección no se prende nunca y no hay ningún
     error en consola — se ve como «quedó fea», no como «se rompió». Medido en
     Bella el 23/9. Es la cura de Cenicienta y la de Cantera. */
  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.INVSIRENA = { poner: poner, sacar: sacar, css: armarCSS, vieira: vieiraSVG, paleta: PALETA_PROPIA };
})();
