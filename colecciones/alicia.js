/* ===== COLECCIÓN «ALICIA EN EL PAÍS DE LAS MARAVILLAS» =======================

   La cuarta de la línea de princesas del orden de Maki (25/9/2026): 1) La
   princesa y el sapo · 2) ALICIA · 3) Rapunzel. Muestra: `paloma-mis15`.

   ⭐ DEL CUENTO DE LEWIS CARROLL (1865), NO DE LA PELÍCULA.
        Criterio fijado por Maki el 22/9 con Cenicienta: el CUENTO, no Disney.
        Nada de vestido celeste con delantal blanco. Lo que se toma del libro:
        la merienda del Sombrerero (tazas desparejas, la tetera), el reloj de
        bolsillo del Conejo Blanco, los naipes de la Reina y las rosas blancas
        pintadas de rojo.

   ⭐ QUÉ LA HACE DISTINTA DE LAS DEMÁS
        · PORCELANA, ROJO DE ROSA PINTADA, VERDE DE SETO y ORO DE RELOJ. No la
          usa ninguna: Sirena nácar y coral · Bella oro viejo y borgoña sobre
          oscuro · Sapo verde agua oscuro · Cenicienta azul hielo · Perlas
          violeta · Marfil blanco y gris.
        · Títulos en IM FELL ENGLISH (la tipografía de los libros victorianos,
          la época del cuento). Sobretítulo en PETIT FORMAL SCRIPT. Cuerpo en
          CRIMSON PRO.
        · CLARA, como Sirena: papel porcelana y TINTA OSCURA (té negro).
        · La marca del itinerario y el adorno de los títulos es el CORAZÓN de
          naipe —la Reina de Corazones—: a 18 px se lee sin dudas.
        · La pieza FOTOGRAFIADA es el RELOJ DE BOLSILLO del Conejo Blanco
          (`invitame/piezas/alicia-reloj-28-9.webp`): va donde hay UNA sola y
          tiene aire (la tapa de la raspadita). En serie y en controles va el
          corazón vectorial.
        · El fondo es la merienda del jardín EN VIDEO (Kling por la API de
          Higgsfield, 28/9), con vapor del té y pétalos.

   ⚠️ ESTE ARCHIVO SALE DE `sirena.js` (colección CLARA hermana, regla C del
      índice de armado del 28/9). Todas las lecciones pagadas en Sirena que se
      leen abajo valen igual acá: las notas que nombran «la vieira» o «el nácar»
      hablan de la pieza de Sirena; en Alicia es el corazón y la porcelana.

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'alicia'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'alicia';
  var ID_CSS = 'col-alicia';
  var P      = 'html[data-col="alicia"][data-coleccion="alicia"] ';

  /* ---------------------------------------------------------------- paleta */

  var PAPEL  = '#F6F0E4';   /* porcelana: el papel de las secciones */
  var PAPEL2 = '#ECE2CE';   /* la porcelana más honda */
  var TINTA  = '#1F1512';   /* té negro: títulos, nombres, datos */
  var TINTA2 = '#3E2C25';   /* té con leche oscuro: bajadas y cuerpo */
  var TINTA3 = '#C4A874';   /* oro de reloj pálido: SÓLO filetes. NUNCA texto */
  var CORAL  = '#A51E2B';   /* el rojo de la rosa pintada. Adorno, NUNCA texto chico */
  var CORAL2 = '#76141F';   /* el rojo hondo: sellos */
  var ESPUMA = '#F2DCD6';   /* rosa té, para luces suaves */

  var CLARO_A = 0.80;       /* ALICIA 28/9: 0,58 era el de Sirena, cuyo fondo es arena
                               calma. La merienda está LLENA (rosas, teteras, tazas):
                               con 0,58 el cuerpo sobre las rosas no se leía (captura
                               de «Dónde quedarse»). No bajarlo. */

  /* ⚠️⚠️ LA TABLA QUE LA COLECCIÓN RECLAMA COMO PROPIA.
     Es el contrato de `efectos/paleta.js` (el mismo de Marfil desde el 17/9 y
     de Cenicienta): la colección publica en `window.INVCOLPALETA` las variables
     que son SUYAS, con NOMBRES DE VARIABLE CSS, y la paleta las pinta con ESE
     valor. Las que NO se reclaman siguen siendo de la pareja.
     ⚠️ Bella publicaba `{tinta:…, acento:…, papel:…}` — claves que no son
        variables CSS— y por eso no reclamaba NINGUNA. Ver la cabecera. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,     /* el color de llamada: #filtro-abrir, #gal-entrar, los discos */
    '--verde2':    '#120C0A',
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

  function corazonSVG(color) {
    /* El CORAZÓN de naipe de la Reina. Dibujado para el TAMAÑO REAL: el adorno
       se ve a ~18 px y la marca del itinerario a 26. Lóbulos llenos y punta
       aguda, como en una carta: así no se confunde con una hoja ni con una
       gota. Lleva un filete de papel adentro para que a 26 px tenga relieve. */
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      '<path fill="' + color + '" d="M24 43 C20.6 38.6 4.2 28.6 4.2 16.6 ' +
      'C4.2 9.8 9.4 5.2 15.2 5.2 C19.2 5.2 22.4 7.6 24 11 ' +
      'C25.6 7.6 28.8 5.2 32.8 5.2 C38.6 5.2 43.8 9.8 43.8 16.6 ' +
      'C43.8 28.6 27.4 38.6 24 43 Z"/>' +
      '<path fill="none" stroke="' + PAPEL + '" stroke-width="1.3" stroke-opacity=".55" ' +
      'd="M24 38.4 C20.8 34.8 8.6 26.8 8.6 17 C8.6 12.4 12 9.4 15.6 9.4"/>' +
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
      '  --porcelana:' + PAPEL + '; --porcelana2:' + PAPEL2 + ';',
      '  --tinta:'   + TINTA  + '; --tinta2:' + TINTA2 + '; --tinta3:' + TINTA3 + ';',
      '  --rosa-roja:' + CORAL + '; --rosa-roja2:' + CORAL2 + ';',
      '  --rosa-te:' + ESPUMA + ';',
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
      '  background-image:radial-gradient(130% 82% at 50% 48%,',
      '    rgba(246,240,228,' + CLARO_A + ') 0%,',
      '    rgba(246,240,228,' + (CLARO_A * 0.88).toFixed(3) + ') 58%,',
      '    rgba(246,240,228,0) 92%)!important;',
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
      '  animation:alicia-paseo 26s ease-in-out infinite alternate!important;',
      '  will-change:transform!important;',
      '  transform-origin:50% 42%!important;',
      '}',
      '@keyframes alicia-paseo{',
      '  0%   { transform:scale(1.00) translate3d(0,0,0); }',
      '  100% { transform:scale(1.09) translate3d(-1.6%,-2.2%,0); }',
      '}',
      /* la luz del agua que recorre: una banda ancha y lenta, SIEMPRE andando */
      /* ⚠️ ALICIA: la «luz del agua» era de Sirena. En un jardín no va: se apaga. */
      P + '#inv-fondo::after{ content:none!important; }',
      '@media (prefers-reduced-motion: reduce){',
      P + '#inv-fondo > img{ animation:none!important; }',
      P + '#inv-fondo::after{ animation:none!important; }',
      '}',
      /* ⚠️ La portada lleva el MISMO paseo, o el fondo se mueve y la tapa no. */
      /* ⚠️ En Alicia la portada es VIDEO (vapor y pétalos): no lleva paseo.
         Un zoom encima de un video es lo que Maki rechazó («no es la idea un
         zoom, la idea es un video real»). */
      P + '.portada #pbg > video, ' + P + '.portada video{ animation:none!important; }',

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
      '  font-family:"IM Fell English",serif!important;',
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
      '  font-family:"Petit Formal Script",cursive!important;',
      '  font-size:31px!important;',
      '  color:' + TINTA2 + '!important;',
      '  letter-spacing:.01em!important;',
      '}',
      /* ⚠️ ALICIA 28/9: el fondo es la merienda, LLENA de rosas y porcelana, y
         el sobretítulo, el título y el cuerpo quedan arriba de la sección, donde
         el claro radial ya afloja. Captura: «La fecha», «Con mucha alegría»,
         «Recuerdos» se perdían sobre las rosas. → Halo de porcelana en la
         tinta que va SOBRE EL FONDO (no en las tarjetas, que tienen papel). */
      P + '.frame .sec > .kick, ' + P + '.frame .sec > h2, ' + P + '.frame .sec > p, ' +
        P + '.frame .sec > .c > .kick, ' + P + '.frame .sec > .c > h2, ' + P + '.frame .sec > .c > p, ' +
        P + '.frame .sec .kick, ' + P + '.frame .sec h2, ' + P + '.frame .sec p{',
      '  text-shadow:0 0 6px rgba(246,240,228,.95), 0 0 16px rgba(246,240,228,.85), 0 0 30px rgba(246,240,228,.6)!important;',
      '}',
      /* ⚠️ Y LAS SECCIONES CON FOTO PROPIA (contacto: el detalle OSCURO) van al
         revés: tinta de porcelana con halo oscuro. Con la tinta del papel y el
         halo claro, «¿Alguna duda?» salía como un sello borroneado y
         «Cualquier cosa escríbenos» no se leía (captura 28/9). */
      P + '.frame .sec[style*="url("] :is(h2, .kick, p, .txt){',
      '  color:' + PAPEL + '!important; -webkit-text-fill-color:' + PAPEL + '!important;',
      '  text-shadow:0 1px 4px rgba(18,12,10,.9), 0 0 14px rgba(18,12,10,.6)!important;',
      '}',
      /* el rótulo chico del hotel nace en rgb(205,191,174) — 1,59 sobre el papel */
      P + '.hotel .d{ color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; }',
      /* «AGENDAR» (`.btn.gh`) quedaba con `-webkit-text-fill-color` TINTA sobre el
         esmalte rojo: la letra oscura se leía apenas (captura 28/9). El color
         decía blanco; el que pinta en WebKit/Chrome es el fill. */
      P + '.frame .btnrow .btn.gh, ' + P + '.frame .btn.gh{ color:' + PAPEL + '!important; -webkit-text-fill-color:' + PAPEL + '!important; }',
      /* «Copiar» de los datos de transferencia nace en oro rgb(125,95,52) — 4,59 */
      P + '.val .copy{ color:' + CORAL2 + '!important; -webkit-text-fill-color:' + CORAL2 + '!important; }',
      /* «Abrir la cámara» nace NEGRO sobre el botón TINTA — 1,17 */
      P + '#filtro-sec button, ' + P + '#filtro-sec .btn{ color:' + PAPEL + '!important; -webkit-text-fill-color:' + PAPEL + '!important; }',
      P + '.sec, ' + P + '.sec div, ' + P + '.sec span{ color:' + TINTA2 + '; }',
      P + '.sec p, ' + P + '.sec li, ' + P + '.sec .txt{',
      '  font-family:"Crimson Pro",Georgia,serif!important;',
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
      '  background-image:url("' + corazonSVG(CORAL) + '")!important;',
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
      '  border:1px solid rgba(196,168,116,.85)!important; box-shadow:none!important;',
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
      '  border:1px solid rgba(196,168,116,.55)!important;',
      '  box-shadow:0 8px 22px rgba(31,21,18,.10)!important;',
      '  width:auto!important;',
      '  border-radius:50% 50% 14px 14px / 44px 44px 14px 14px!important;',
      '}',
      P + '.hotel{ padding:38px 18px 18px!important; text-align:center!important; }',
      P + '.hotel .btn{ margin:10px auto 0!important; }',
      P + '.evento .ph{ height:230px!important; }',

      /* ---- 🔴 §32 · LAS TARJETAS DE LUGAR, VESTIDAS DE SIRENA -------------
         Maki, 24/9: las tarjetas de «Dónde y cuándo» y «Dónde quedarse» tenían
         la forma de la colección (la cúpula, el filete verde agua, el nácar)
         pero NINGUNA marca suya: eran la tarjeta del molde pintada de crema.
         Medido en vivo antes de escribir una línea (regla 0bis.4: contar a
         cuántos le pega y mirarlos a TODOS):
           · el grupo `:is(.evento,.hotel,.pasecard,.card,.caja,.ev-card)` son
             SIETE elementos: 1 `.pasecard`, 3 `.evento`, 3 `.hotel`.
             → acá se tocan SÓLO `.evento` y `.hotel`. El pase tiene el QR y su
               propio módulo; `.tl` está en ese grupo en la regla de arriba y su
               `::before` ES LA VÍA DEL ITINERARIO. Meter `.tl` en una regla de
               `::before` sería borrar la vía.
           · `::before` y `::after` de los siete dan `content:none`: están libres.
           · ningún hijo es `position:absolute` → poner `position:relative` en la
             tarjeta no le mueve nada a nadie (chequeado, 0 absolutos).
           · `.evento`: foto `.ph` de 1 a 231, `.bd` desde 231 con padding 18 y el
             H3 arrancando en y 249 → el medallón va centrado en y 226, o sea de
             212 a 240: NUEVE px de aire antes del título. `.bd` es text-align
             center, así que el choque posible era vertical y está medido.
           · `.hotel`: el H4 arranca en y 39 (padding 38 + filete) → la vieira va
             de 9 a 31: OCHO px de aire. Y `.hotel` tiene overflow visible, así
             que no hay nada que recorte.
         ⚠️ El `background-image:none!important` del grupo de arriba se pisa acá
            a propósito: misma especificidad, y esta regla va DESPUÉS. */
      P + '.evento, ' + P + '.hotel{ position:relative!important; }',
      /* la luz de nácar que baja de la cúpula — la MISMA del panel del
         itinerario, para que las tres piezas se lean de la misma familia */
      P + '.hotel{',
      '  background-image:radial-gradient(130% 82% at 50% 0%,',
      '    rgba(242,220,214,.55) 0%, rgba(242,220,214,0) 62%)!important;',
      '  background-size:100% 100%!important; background-repeat:no-repeat!important;',
      '}',
      /* en `.evento` la cúpula la tapa la foto, así que la luz arranca donde
         arranca el texto */
      P + '.evento .bd{',
      '  background-image:radial-gradient(120% 70% at 50% 0%,',
      '    rgba(242,220,214,.50) 0%, rgba(242,220,214,0) 58%)!important;',
      '  background-size:100% 100%!important; background-repeat:no-repeat!important;',
      '}',
      /* la vieira en la cúpula del hotel: chica, en el aire que ya existía */
      P + '.hotel::after{',
      '  content:""!important; position:absolute!important;',
      '  top:9px!important; left:50%!important; margin-left:-11px!important;',
      '  width:22px!important; height:22px!important;',
      '  background-image:url("' + corazonSVG(CORAL) + '")!important;',
      '  background-size:contain!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '  opacity:.92!important; pointer-events:none!important; z-index:1!important;',
      '}',
      /* y en `.evento`, un medallón sobre el filo de la foto: el sello que
         sujeta la tarjeta. Lleva disco de papel porque va sobre la foto y sin
         él el coral se pierde contra cualquier imagen. */
      P + '.evento::after{',
      '  content:""!important; position:absolute!important;',
      '  top:226px!important; left:50%!important;',
      '  margin:-14px 0 0 -14px!important; width:28px!important; height:28px!important;',
      '  border-radius:50%!important;',
      '  background-color:' + PAPEL + '!important;',
      '  background-image:url("' + corazonSVG(CORAL) + '")!important;',
      '  background-size:18px 18px!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '  box-shadow:0 2px 9px rgba(31,21,18,.22), 0 0 0 1px rgba(196,168,116,.55)!important;',
      '  pointer-events:none!important; z-index:2!important;',
      '}',
      /* ⚠️⚠️ EL NOMBRE DEL HOTEL ES UN `h4`, NO UN `h3`. VISTO, NO MEDIDO.
            24/9, y es EXACTAMENTE el error que este archivo ya tenía escrito
            dos veces —«un selector que no existe no da error, da no pasó
            nada»— y que igual volví a cometer:
            · `.evento` titula con `h3` (su `.bd` arranca con `<h3>`),
            · `.hotel` titula con `h4` (sus hijos son `H4` + `A.btn`).
            Nombré sólo `h3`, así que los TRES nombres de hotel se quedaron con
            la tinta del molde: **blanco puro 255,255,255 sobre nácar
            246,240,228 = contraste 1,16**, ilegibles, y en `Forum`, que es la
            tipografía de OTRA colección.
            ⚠️ La regla 7 del chequeo lo había cantado y yo lo había anotado
               como «mirarlo al 100 %». Lo miré: era de verdad, y era mío.

         ⚠️⚠️⚠️ Y AL ARREGLARLO APARECIÓ QUE LA REGLA DE LOS TÍTULOS NUNCA HABÍA
            GANADO. Las dos reglas competían y la de CUERPO le ganaba a la de
            TÍTULO, por una clase de diferencia:
              cuerpo  `:is(.evento,.hotel,.pasecard) :is(h3,p,…)`  → (0,4,1)
              título  `:is(.evento,.hotel) h3`                     → (0,3,2)
            `:is()` vale lo que su argumento MÁS específico, así que el `:is()`
            del descendiente sumaba una CLASE y el `h3` suelto sólo un elemento.
            Resultado: los títulos de las tarjetas y el `.v` del pase venían en
            TINTA2 aunque acá dijera TINTA. Se leía bien, así que ninguna regla
            lo iba a cantar nunca — pero el archivo decía una cosa y la pantalla
            hacía otra.
            ⭐ La cura NO es subir `!important` (ya lo tienen los dos): es que
               cada elemento esté en UNA sola lista. Los títulos salen de la
               lista de cuerpo. */
      P + ':is(.evento, .hotel, .pasecard) :is(p, .sub, .addr, .t, .k){',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + ':is(.evento, .hotel) :is(h3, h4), ' + P + '.pasecard .v{',
      '  color:' + TINTA + '!important; font-family:"IM Fell English",serif!important;',
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
      /* ⚠️ ALICIA 28/9: `none` dejaba «Con cariño, te esperamos» suelto sobre
         la tetera — ilegible en captura. El pase lleva el MISMO claro radial
         que las secciones. */
      P + '.frame .pase, ' + P + 'section.pase{',
      '  background-color:transparent!important;',
      '  background-image:radial-gradient(130% 82% at 50% 48%,',
      '    rgba(246,240,228,' + CLARO_A + ') 0%,',
      '    rgba(246,240,228,' + (CLARO_A * 0.88).toFixed(3) + ') 58%,',
      '    rgba(246,240,228,0) 92%)!important;',
      '  background-size:100% 100%!important; background-repeat:no-repeat!important;',
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
      '  font-family:"Petit Formal Script",cursive!important; font-size:30px!important;',
      '  color:' + TINTA2 + '!important;',
      '  text-shadow:0 0 6px rgba(246,240,228,.95), 0 0 16px rgba(246,240,228,.85), 0 0 30px rgba(246,240,228,.6)!important;',
      '}',
      P + '.pasecard .estado{',
      '  background-color:rgba(165,30,43,.14)!important;',
      '  color:' + CORAL2 + '!important; -webkit-text-fill-color:' + CORAL2 + '!important;',
      '  border:1px solid rgba(118,20,31,.55)!important;',
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
      '  --r3-tapa:url("https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/piezas/alicia-reloj-28-9.webp");',
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
      P + '.padres .nm{ font-size:18px!important; color:' + TINTA2 + '!important; font-family:"Crimson Pro",Georgia,serif!important; }',
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
      '  background:rgba(246,240,228,.80)!important;',
      '  box-shadow:0 0 0 1px rgba(118,20,31,.30), 0 6px 18px rgba(31,21,18,.14)!important;',
      '}',
      P + '.rd-tapa .rd-txt{',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '  letter-spacing:.18em!important;',
      '  text-shadow:0 1px 2px rgba(246,240,228,.95)!important;',
      '}',

      /* ---- campos de formulario ---- */
      P + 'input, ' + P + 'select, ' + P + 'textarea{',
      '  background:rgba(246,240,228,.86)!important; color:' + TINTA + '!important;',
      '  border:1px solid ' + TINTA3 + '!important;',
      '}',
      P + 'input::placeholder, ' + P + 'textarea::placeholder{ color:rgba(62,44,37,.55)!important; }',
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
      '  border:1px solid rgba(196,168,116,.55)!important;',
      '  background-color:' + PAPEL + '!important;',
      '  background-image:radial-gradient(130% 82% at 50% 0%,',
      '    rgba(242,220,214,.55) 0%, rgba(242,220,214,0) 62%)!important;',
      '  background-size:100% 100%!important; background-repeat:no-repeat!important;',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.7), 0 14px 34px rgba(31,21,18,.12)!important;',
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
      '  background:linear-gradient(180deg, rgba(165,30,43,0) 0%,',
      '    rgba(165,30,43,.42) 45%, rgba(165,30,43,0) 100%)!important;',
      '  filter:blur(1.5px)!important;',
      '  animation:alicia-hilo 4.6s linear infinite!important;',
      '}',
      '@keyframes alicia-hilo{0%{transform:translateY(-22%)}100%{transform:translateY(122%)}}',
      P + '.tl.tl-centro::after{ left:50%!important; margin-left:-1.5px!important; }',
      P + '.tl .tl-prog{ display:none!important; }',
      P + '.it::before{',
      '  width:26px!important; height:26px!important;',
      '  margin-left:-7.5px!important; margin-top:-7.5px!important;',
      '  border-radius:0!important;',
      '  background-image:url("' + corazonSVG(CORAL) + '")!important;',
      '  background-color:transparent!important;',
      '  background-size:contain!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '  border:0!important; box-shadow:none!important;',
      '  transform-origin:50% 50%!important;',
      '  filter:drop-shadow(0 1px 2px rgba(31,21,18,.28))!important;',
      '  z-index:2!important;',
      '}',
      /* ⚠️⚠️ LA OPACIDAD NO SE FUERZA: LA MANEJA EL REVELADO DEL MOTOR.
         Medido el 24/9 en `marisol-mis15`. El motor tiene DOS reglas sobre esta
         misma marca:
           `.tl.tl-anim > .it::before      { transform:scale(.2); opacity:0 }`
           `.tl.tl-anim > .it.on::before   { transform:scale(1);  opacity:1 }`
         y la clase `.on` se la pone el observador cuando la ficha entra en
         pantalla. Yo tenía `opacity:1!important` a secas: eso encendía la
         vieira MIENTRAS seguía en `scale(.2)`, o sea un PUNTITO CORAL de 5 px
         antes de cada revelado — justo el «circulito» que Maki rechazó por
         nombre. El tamaño sí se pisa (11 → 26); la opacidad NO.
         ⭐ La misma regla de siempre: si el motor ya maneja un estado, no se lo
            reemplaza. Se lo acompaña. */
      P + '.tl.tl-anim > .it:not(.on)::before{ opacity:0!important; }',
      P + '.tl.tl-anim > .it.on::before{ opacity:1!important; }',
      /* la vía: fina y apagándose en las dos puntas, nunca un corte seco */
      P + '.tl::before{',
      '  width:1.5px!important; opacity:1!important;',
      '  background:linear-gradient(180deg, rgba(196,168,116,0) 0%,',
      '    rgba(196,168,116,.9) 9%, rgba(196,168,116,.9) 91%, rgba(196,168,116,0) 100%)!important;',
      '}',
      P + '.it .h{ color:' + TINTA + '!important; font-family:"IM Fell English",serif!important; }',
      /* ⚠️ EL DETALLE ES `.d`, NO `.t`. Lo escriben así los DOS que arman el
         itinerario: el motor (`<div class="d">`) y `efectos/itinerario-momentos.js`.
         Yo había escrito `.it .t`, que no existe: un selector que no existe no
         da error, da «no pasó nada». Se dejan los dos por las dudas. */
      P + '.it .d, ' + P + '.it .t{ color:' + TINTA2 + '!important; font-family:"Crimson Pro",Georgia,serif!important; }',

      /* ---- 🔴 LOS TÍTULOS DE LA GALERÍA LOS PINTA SU PROPIO MÓDULO --------
         Medido acá y ya visto en Bella: `#gal-kick` y `#gal-h2` no siguen al
         `.kick`/`h2` de la colección — `efectos/galeria.js` les escribe su
         propio color. El barrido por placa cazó «Antes del baile» en
         rgb(79,68,45), que no es de ninguna paleta de ésta. Se los pinta. */
      P + '#gal-kick, ' + P + '.gal-kick{ color:' + TINTA2 + '!important; font-family:"Petit Formal Script",cursive!important; }',
      P + '#gal-h2, ' + P + '.gal-h2{ color:' + TINTA + '!important; font-family:"IM Fell English",serif!important; }',

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
      P + '.cf-letter h4{ font-family:"IM Fell English",serif!important; }',

      /* ---- 🔴 LA PORTADA --------------------------------------------------
         ⚠️ ALICIA ES LA EXCEPCIÓN A LA REGLA 7bis (bloque al pie), y a propósito:
            la portada es la MESA DEL TÉ, y lo que se mira está ABAJO (tetera,
            tazas, el reloj con su cadena y los pétalos, del 55 % al 92 %). Al pie
            el bloque tapaba justo eso. Arriba hay seto oscuro con rosas: medido
            por franjas del cuadro, luminancia 44–66 del 0 % al 50 %, y 120–166
            del 55 % para abajo. → El bloque va ARRIBA, en tinta CLARA, con un
            halo oscuro y un «oscuro» radial (el mismo truco que el claro de
            Sirena, al revés) para que se lea sobre las hojas.
         ⚠️ Van por ID: `i/estilos-servidor.css` tiene `#pv-names` y `#pv-kick`
            con `!important`, y un selector de clase no le gana.
         ⚠️ `line-height:1` + `padding-bottom`: la cola de una cursiva se sale de
            la caja de línea. */
      P + '.portada{ justify-content:flex-start!important; padding-top:max(7vh,44px)!important; }',
      P + '#pv-names{',
      '  font-size:78px!important; line-height:1!important;',
      '  padding-bottom:.24em!important;',
      '  font-family:"Petit Formal Script",cursive!important;',
      '  color:' + PAPEL + '!important; -webkit-text-fill-color:' + PAPEL + '!important;',
      '  text-shadow:0 2px 6px rgba(18,12,10,.85), 0 0 22px rgba(18,12,10,.55)!important;',
      '}',
      P + '#pv-names span{ padding:0 .10em .17em!important; }',
      P + '#pv-kick{',
      '  font-size:13px!important; letter-spacing:.26em!important;',
      '  color:' + ESPUMA + '!important; -webkit-text-fill-color:' + ESPUMA + '!important;',
      '  text-shadow:0 1px 3px rgba(18,12,10,.95), 0 0 10px rgba(18,12,10,.75)!important;',
      '}',
      P + '.portada h1, ' + P + '#nombre{ font-family:"Petit Formal Script",cursive!important; }',
      P + '.portada .num{ color:' + PAPEL + '!important; font-variant-numeric:lining-nums!important;',
      '  text-shadow:0 1px 4px rgba(18,12,10,.9)!important; }',
      P + '.portada .u{ color:' + ESPUMA + '!important; text-shadow:0 1px 3px rgba(18,12,10,.9)!important; }',
      /* ⚠️ LOS RÓTULOS DE LA CUENTA REGRESIVA NO SON `.u`: son `.count .b .lab`. */
      P + '.count .lab{',
      '  color:' + ESPUMA + '!important; -webkit-text-fill-color:' + ESPUMA + '!important;',
      '  text-shadow:0 1px 3px rgba(18,12,10,.95), 0 0 9px rgba(18,12,10,.75)!important;',
      '}',
      P + '.count .n, ' + P + '.count .num, ' + P + '.count b{ color:' + PAPEL + '!important;',
      '  -webkit-text-fill-color:' + PAPEL + '!important; text-shadow:0 1px 4px rgba(18,12,10,.9)!important; }',
      /* un OSCURO radial detrás del bloque — pseudo HERMANO, no ancestro.
         ⚠️ Tiene que apagarse ANTES del borde de su propia caja (0,88 × radio
            ≤ 50 % de la caja → radio ≤ 56 %), o se ve un rectángulo. */
      P + '.portada > .c::before{',
      '  content:""!important; position:absolute!important;',
      '  left:-50%!important; right:-50%!important;',
      '  top:-60%!important; height:220%!important;',
      '  pointer-events:none!important; z-index:-1!important;',
      '  background:radial-gradient(56% 56% at 50% 50%,',
      '    rgba(18,12,10,.50) 0%, rgba(18,12,10,.28) 46%, rgba(18,12,10,0) 88%)!important;',
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
      '?family=IM+Fell+English:ital@0;1' +
      '&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400' +
      '&family=Petit+Formal+Script' +
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

  window.INVALICIA = { poner: poner, sacar: sacar, css: armarCSS, corazon: corazonSVG, paleta: PALETA_PROPIA };
})();
