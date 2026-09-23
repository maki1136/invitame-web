/* ===== COLECCIÓN «CANTERA» ===================================================

   Boda religiosa tradicional mexicana, en Morelia.

   ⭐⭐ LA PALETA LA ELIGIÓ MAKI — 22/9/2026
      Mandó una lámina «Nature inspired color palette · soft · warm · timeless»
      con cinco colores y dijo: «no me gusta ese marrón que elegiste, cambialo
      por otro tono, te dejo la paleta y cómo deberías armar el estilo».

        Sage Green      #98A086   → el olivo: la viñeta, la marca de cada hora
        Dusty Rose      #A76D5E   → el acento segundo (la chapita del pase)
        Golden Tan      #C4A071   → los rellenos: botones, tapas, la cenefa
        Warm Beige      #DFCCB1   → el papel de las tarjetas
        Terracotta Brown#846044   → la familia de los marrones

      ⚠️ NINGUNO DE LOS CINCO SIRVE TAL CUAL PARA TEXTO CHICO, y eso se midió:
         · Golden Tan sobre el papel da **2,08** → un sobretítulo de 12 px en
           ese tono no se lee. Va `TAN_T` (#7A5B30), el mismo tono bajado:
           **5,23**.
         · Terracotta Brown sobre el papel da **4,75**, debajo del piso de 5.
           Va como MATERIAL (bordes, lacre, chapitas), no como tinta de cuerpo.
         · La tinta del cuerpo es `TINTA` (#4A3524), un terracota profundo de
           la misma familia: **9,7** sobre el papel.
      → La paleta manda el CLIMA. Los números mandan cuál de esos tonos puede
        llevar una letra encima.

   ⭐⭐⭐ LAS BANDAS NO PUEDEN SER COLOR PLENO — 22/9/2026
      Maki, después de aceptar el tono: «no me gusta el color pleno marrón,
      tenés que meterle algo de diseño y textura a esos sectores».
      Son SEIS bandas plenas más el pie: la superficie más grande de toda la
      invitación. Un color liso ahí se lee barato, por más que el tono esté
      bien elegido.

      Lo que hay ahora, en tres capas y en este orden:
        1. el color            → `--verde` (#6B4A32, terracota)
        2. la PIEDRA           → `.sec.verde::before`: una foto propia de
                                 cantera tallada de Morelia, hecha en Flow,
                                 al **15% en `soft-light`**, tile de 520 px.
        3. el remate           → `.sec.verde::after`: una cenefa de olivo en
                                 dorado, arriba y abajo de cada banda.
      Más un degradado vertical sutil en la banda misma, para que no sea una
      pared plana: apenas más oscura en los dos extremos.
      El PIE lleva las mismas capas (bloque 13).

      ⚠️⚠️ LA TEXTURA VA EN UNA CAPA PROPIA CON `opacity`, NUNCA CON
         `background-blend-mode` SOBRE EL ELEMENTO. Esto lo pagué DOS VECES el
         mismo día:
           · primero en `.sec.verde`: mezclada directo en su `background-image`
             no hay forma de bajarle la fuerza (no existe opacidad por capa) y
             queda como PAPEL TAPIZ, el dibujo grita y compite con el texto;
           · y después en `.footer`, donde había dejado justamente un
             `background-blend-mode: soft-light` y el pie salió con la piedra
             a PLENA FUERZA. Se veía en la captura, no en ninguna medición.
         → En un `::before` propio sí se puede: `opacity:.15` +
           `mix-blend-mode:soft-light` da relieve de piedra, no estampado.
      ⚠️ Y el tile chico (300 px) hacía evidente la repetición. 520 px, no.
      ⚠️ Como el `::before` se pone encima del fondo, los hijos del elemento
         necesitan `position:relative; z-index:1`, o el texto queda debajo.

      ⭐ EL CONTRASTE CON LA TEXTURA, MEDIDO (no estimado): se calculó la
         mezcla soft-light píxel por píxel sobre 4.595 muestras de la piedra y
         se tomó el PEOR caso, el punto más claro de la talla:
             crema  #F4EBDD → **6,23**   (promedio 6,64)
             crema2 #E6D6BC → **5,15**   (promedio 5,49)
         Los dos por encima del piso de 5. La textura no se come el texto.
         → Si alguna vez se sube la opacidad de .15, hay que rehacer esta
           cuenta: a .25 el sobretítulo ya no pasa.

      ⭐ CÓMO SE HIZO LA TEXTURA, para repetirlo en la próxima colección:
         · Flow, Nano Banana 2, 16:9, x2, 0 créditos. Prompt de piedra tallada
           con «no people, no faces, no text, no letters, no logos».
         · De las dos, se eligió la que NO tiene moldura ni cornisa: un motivo
           parejo de punta a punta. Una con marco se nota al repetir.
         · ⚠️⚠️ LA IMAGEN DE FLOW NO SE PUEDE BAJAR NI CON `fetch` (el host
           `flow-content.google` no da CORS) NI CON `canvas` desde el `<img>`
           de la página (queda TEÑIDO). LO QUE SÍ FUNCIONA: cargarla de nuevo
           en un `new Image()` con `crossOrigin='anonymous'` — ahí el canvas
           sale LIMPIO y se puede subir a Cloudinary sin descargar nada a mano.
         · Y se armó un MOSAICO ESPEJADO (la imagen + su espejo horizontal +
           el vertical + los dos) para que repita SIN COSTURA.

   ⭐⭐⭐ EL MARRÓN QUE NO LE GUSTABA A MAKI NO ERA NINGUNO DE LOS MÍOS
      Yo venía cambiando tonos de la colección y el marrón seguía ahí, porque
      el que se ve en pantalla no salía de mi hoja. Medido en la página, la
      regla que gana es del motor:

          .sec.verde { background: var(--sec-col-v, var(--verde)); }

      y `--verde` valía **#3b2f26**: un marrón FRÍO, casi negro, que viene de
      la PALETA DEL EVENTO en la base, no de la colección.

      ⚠️ Antes tenía anotado acá que «el motor lo escribe inline con
         !important y no se puede pisar». ERA FALSO, y me costó una vuelta
         entera: el elemento NO tiene atributo style.
      → LA FORMA CORRECTA: la colección DECLARA `--verde` (y `--sec-col-v`).
        No se pelea la regla: se le cambia el valor a la variable que lee.
      → Va BANDA (#6B4A32): crema encima da **6,73**, el sobretítulo **5,57**.

      REGLA GENERAL: ANTES de dar por imposible pisar un color del motor,
      buscar qué REGLA gana y qué VARIABLE lee esa regla.

   ⭐⭐⭐ Y LA OTRA DE LA MISMA FAMILIA: LAS CLASES QUE ESCRIBÍ DE MEMORIA
      El bloque de la raspadita apuntaba a `.rasp-3 .r3-f` y a `--r3-tapa`.
      **Ninguna de las dos existe en este motor.** Las tapas quedaron del gris
      de fábrica y yo lo daba por vestido porque el chequeo pasaba en verde.
      Lo que este motor usa, medido:
          .scratchcard        → la caja
          .scratchcard::after → ⚠️ EL RECUADRO de 1 px (¡Maki ya lo pidió
                                sacar dos veces! `border:0` no lo apaga)
          .ivf.ivf-circ       → la fila
          .ivf .c             → LA TAPA que se raspa (70×70)
          .ivf .n             → el número que aparece debajo
      → REGLA: antes de vestir un bloque, LISTAR SUS CLASES REALES. Una regla
        que no engancha no falla: queda gris y pasa el chequeo.

   ⭐⭐ EL CONCEPTO ES BOHEMIA
      Maki: «mirá la invitación de muestra de Bohemia: es excelente, deberías
      seguir ese concepto». Una FOTO DE NATURALEZA, CLARA, que se ve por
      detrás de todo; sin paneles macizos ni filetes de más.

   ⭐⭐ EL ITINERARIO VA EN UNA SOLA COLUMNA, COMO PERLAS
      Maki: «los círculos del itinerario te quedaron muy desordenados, copiá
      como te dije las otras muestras». La causa estaba medida: la muestra
      tenía `fx.itinerario.estilo = 'centro'`, que alterna las fichas a
      izquierda y derecha con la vía al medio; con alturas distintas las
      marcas quedan a alturas y lados distintos.
      Perlas —medida— no alterna: vía a `left:2.5px`, marcas a `left:-28.5px`,
      fichas de ancho completo. **Una línea, todas las marcas encima.**
      → NO se le toca la posición a la vía. Sólo el MATERIAL y el TAMAÑO de
        la marca: el motor la deja en 11 px y sobre un panel translúcido una
        hoja de olivo de 11 px no se ve. Va a 16 px con halo de papel.

   ⭐⭐ EL VELO DE PAPEL DETRÁS DEL TEXTO
      Maki: «Vestimenta quedó que no se lee nada, se pierde con el fondo».
      El fondo de Cantera es un jardín: CLARO pero CARGADO. Bohemia puede
      dejar las secciones casi transparentes porque su fondo es un lino liso.
      Acá hicieron falta las dos cosas:
        · `fx.fondo.paso` 0.85 → **0.34** (el alfa de la sección es 1−paso:
          de 15% a 66% de papel).
        · un HALO de papel detrás de cada texto que va sobre la foto —bloque
          16. Es sombra, no recuadro: Maki no quiere más cajas.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. No dibuja una invitación
      nueva y NO SACA NINGUNA SECCIÓN. Vestir no es quitar.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'cantera'` no hace nada.
      Para probar sin tocar la base: `?coleccion=cantera`

   ⚠️ NO TOCA NADA GLOBAL AL CARGARSE. Todo lo que escribe afuera va en
      `poner()` y tiene su línea espejo en `sacar()`.

   ⚠️ LA ESCALA TIPOGRÁFICA ESTÁ REESCRITA ENTERA: el motor calibra sus
      tamaños para una CURSIVA y acá el sobretítulo es una versalita.

   ⚠️⚠️ Y LA MEDICIÓN QUE CASI ME HACE ROMPER ALGO QUE ANDABA: con el fondo en
      video, a los 5 segundos la colección TODAVÍA NO SE APLICÓ. A los 15 ya
      está. Se mide a los 15 s, no a los 5.

   ============================================================================ */
(function () {
  'use strict';

  var ID    = 'cantera';
  var MARCA = 'data-cantera';
  var P = 'html[' + MARCA + '] ';

  /* ------------------------------------------------- la paleta de Maki + los
     tonos derivados que hicieron falta para que el texto chico se lea */
  var SAGE    = '#98A086';   /* Sage Green       — el olivo                  */
  var ROSA    = '#A76D5E';   /* Dusty Rose       — el acento segundo         */
  var TAN     = '#C4A071';   /* Golden Tan       — los rellenos              */
  var BEIGE   = '#DFCCB1';   /* Warm Beige       — el papel de las tarjetas  */
  var TERRA   = '#846044';   /* Terracotta Brown — el material de los marrones*/

  var PAPEL   = '#EFE3D0';   /* el beige, aclarado, para la hoja entera      */
  var PAPEL2  = BEIGE;       /* las tarjetas                                 */
  var TAN_T   = '#7A5B30';   /* Golden Tan bajado, para texto chico: 5,23    */
  var TINTA   = '#4A3524';   /* terracota profundo, tinta de cuerpo: 9,7     */
  var TINTA2  = '#63472F';   /* la secundaria: 5,45 sobre la tarjeta         */
  var BANDA   = '#6B4A32';   /* ⭐ LAS SEIS BANDAS PLENAS (var --verde)       */
  var PIE     = '#5A4030';   /* el pie                                       */
  var CREMA   = '#F4EBDD';   /* la tinta sobre banda oscura: 6,73 (6,23 con
                                la textura en su punto más claro)            */
  var CREMA2  = '#E6D6BC';   /* el sobretítulo: 5,57 (5,15 con la textura)   */
  var TINTA_BTN = '#150F09'; /* sobre Golden Tan: 7,8                        */
  var HALO    = 'rgba(239,227,208,';  /* PAPEL en rgba, para el velo         */

  var CDN     = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var MEDALLA = CDN + 'invitame/piezas/cantera-medalla-2.webp';
  /* la piedra: mosaico espejado, servido chico y optimizado */
  var PIEDRA  = CDN + 'f_auto,q_auto:eco,w_688/invitame/cantera/cantera-piedra-banda.webp';

  /* ⭐ EL ARCO, SUAVE. `999px/46%` se comía media altura de la foto y la
     estiraba: es el «las fotos están como muy largas» del 22/9. */
  var ARCO     = '150px 150px 10px 10px / 40px 40px 10px 10px';
  var ARCO_TOP = '150px 150px 0 0 / 40px 40px 0 0';

  function svgURL(svg) {
    return 'url("data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/"/g, "'") + '")';
  }

  /* La viñeta: una hoja de olivo entre dos filetes. VECTOR, no foto. */
  function vinieta(hoja, filete) {
    return svgURL(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 16">' +
      '<path d="M4 8h38" stroke="' + filete + '" stroke-width="1" fill="none" opacity=".75"/>' +
      '<path d="M78 8h38" stroke="' + filete + '" stroke-width="1" fill="none" opacity=".75"/>' +
      '<path d="M60 2c-5 2.6-8 5.6-8 8 0 1.6.9 3.1 2.4 4.2C56.6 12.2 60 8.6 60 2z" fill="' + hoja + '"/>' +
      '<path d="M60 2c5 2.6 8 5.6 8 8 0 1.6-.9 3.1-2.4 4.2C63.4 12.2 60 8.6 60 2z" fill="' + hoja + '" opacity=".72"/>' +
      '<path d="M60 4v10" stroke="' + hoja + '" stroke-width=".9"/>' +
      '</svg>');
  }

  /* La marca de cada hora: la misma hoja, sola. */
  function hojita(color) {
    return svgURL(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<path d="M12 3c-4 2.1-6.4 4.5-6.4 6.4 0 1.3.7 2.5 1.9 3.4C10.1 11.1 12 7.7 12 3z" fill="' + color + '"/>' +
      '<path d="M12 3c4 2.1 6.4 4.5 6.4 6.4 0 1.3-.7 2.5-1.9 3.4C13.9 11.1 12 7.7 12 3z" fill="' + color + '" opacity=".7"/>' +
      '<path d="M12 5v15" stroke="' + color + '" stroke-width="1.1"/>' +
      '</svg>');
  }

  /* ⭐ LA CENEFA que remata cada banda: un filete con una hoja cada 80 px. */
  function cenefa(color) {
    return svgURL(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 10">' +
      '<path d="M0 5h80" stroke="' + color + '" stroke-width=".7" opacity=".38"/>' +
      '<path d="M40 1.6c-2.4 1.3-3.8 2.7-3.8 3.8 0 .8.4 1.5 1.1 2C38.8 6.4 40 4.4 40 1.6z" fill="' + color + '" opacity=".55"/>' +
      '<path d="M40 1.6c2.4 1.3 3.8 2.7 3.8 3.8 0 .8-.4 1.5-1.1 2C41.2 6.4 40 4.4 40 1.6z" fill="' + color + '" opacity=".4"/>' +
      '</svg>');
  }

  /* --------------------------------------------------------- la paleta propia
     ⭐⭐ `--verde` Y `--sec-col-v` SON LAS QUE PINTAN LAS SEIS BANDAS PLENAS.
        Si la colección no las declara, manda la paleta del evento —que acá
        traía un marrón frío casi negro— y ninguna otra regla lo puede tapar.
     ⚠️ `--tinta` es la tinta de cuerpo y NADA MÁS. */
  var PALETA_PROPIA = {
    '--papel':      PAPEL,
    '--lino':       PAPEL,
    '--lino2':      PAPEL2,
    '--tinta':      TINTA,
    '--tinta2':     TINTA2,
    '--tinta3':     TINTA2,
    '--verde':      BANDA,
    '--sec-col-v':  BANDA,
    '--acento':     TAN,
    '--acento2':    ROSA,
    '--sec-col':    PAPEL,
    '--tl-papel':   PAPEL2,
    '--tl-tinta':   TINTA,
    '--cf-sobre':   PAPEL2,
    '--cf-col':     TINTA,
    '--sobre-c':    PAPEL,
    '--flap-base':  PAPEL2,
    '--seal-c':     TERRA
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
    var V  = vinieta(SAGE, TAN_T);      /* sobre papel  */
    var VC = vinieta(SAGE, CREMA2);     /* sobre banda oscura o foto */
    var H  = hojita(SAGE);
    var C  = cenefa('#C8A461');         /* el dorado claro, para la cenefa */

    /* la capa de piedra, igual para las bandas y para el pie */
    var CAPA_PIEDRA = [
      '  content:""!important;',
      '  position:absolute!important; inset:0!important;',
      '  z-index:0!important; pointer-events:none!important;',
      '  background-image:url("' + PIEDRA + '")!important;',
      '  background-size:520px auto!important;',
      '  background-repeat:repeat!important;',
      '  opacity:.15!important;',
      '  mix-blend-mode:soft-light!important;'
    ].join('\n');

    return [

    /* ─────────────────────────────────────────────── 1 · LAS LETRAS */
    '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Karla:wght@300;400;500&display=swap");',

    P + '.sec h2, ' + P + '.frase, ' + P + '.portada #pv-names{',
    '  font-family:"Cormorant Garamond",Georgia,serif!important;',
    '}',
    P + '.sec p, ' + P + '.sec .kick, ' + P + '.btn, ' + P + '.evento .sub, ' + P + '.evento .addr{',
    '  font-family:Karla,system-ui,sans-serif!important;',
    '}',

    /* ⚠️ EL SOBRETÍTULO NUNCA MÁS GRANDE QUE EL TÍTULO — y en TAN_T, no en
       Golden Tan puro, que a 12 px da 2,08. */
    P + '.sec .kick{',
    '  font-size:12px!important; line-height:1.5!important;',
    '  letter-spacing:.24em!important; text-transform:uppercase!important;',
    '  font-weight:500!important; color:' + TAN_T + '!important;',
    '  margin:0 0 10px 0!important; text-indent:.24em!important;',
    '}',
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
    P + '.evento .sub, ' + P + '.evento .addr{ color:' + TINTA2 + '!important; }',

    /* ─────────────────────────────────────────────── 2 · LA PORTADA */
    P + '.portada{ justify-content:flex-end!important; }',
    P + '#pv-kick{',
    '  font-size:12px!important; letter-spacing:.34em!important;',
    '  text-indent:.34em!important; text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  font-family:Karla,sans-serif!important; font-weight:400!important;',
    '  margin:0 0 6px 0!important;',
    '}',
    P + '#pv-names{',
    '  font-size:clamp(46px,13.5vw,74px)!important;',
    '  line-height:1.04!important; font-weight:400!important;',
    '  font-style:italic!important; letter-spacing:.005em!important;',
    '  text-transform:none!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  text-shadow:0 1px 2px rgba(0,0,0,.55), 0 0 26px rgba(0,0,0,.42)!important;',
    '  margin:0!important; padding-bottom:.06em!important;',
    '}',
    P + '.portada .num{ font-size:34px!important; color:' + CREMA + '!important; font-family:"Cormorant Garamond",serif!important; }',

    /* ─────────────────────────────────── 3 · EL ARCO, SUAVE */
    P + ':is(.evento, .hotel, .pasecard, .col-vtapa, .gal figure, .gal a, .padres .av){',
    '  border-radius:' + ARCO + '!important;',
    '  overflow:hidden!important;',
    '}',
    P + ':is(.evento, .hotel, .pasecard){',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid rgba(132,96,68,.20)!important;',
    '  box-shadow:0 6px 18px rgba(74,53,36,.09)!important;',
    '}',
    P + ':is(.evento, .hotel) img{',
    '  border-radius:' + ARCO_TOP + '!important;',
    '  display:block!important; width:100%!important;',
    '}',
    P + '.gal img{ border-radius:' + ARCO + '!important; display:block!important; }',
    P + '.padres .av{ border-radius:50%!important; }',

    /* ─────────────────────── 4 · PERSONAS: LAS TRES EN UNA FILA */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important; background-color:transparent!important;',
    '}',
    P + '.padres .av{ width:104px!important; height:104px!important; }',
    P + '.padres .nm{ font-size:18px!important; color:' + TINTA + '!important; font-family:"Cormorant Garamond",serif!important; }',

    /* ────────────── 4bis · LA FLECHA DE LOS ACORDEONES SIGUE A SU BOTÓN
       ⚠️⚠️ Medido el 22/9/2026 en `regina-y-emiliano`: `.chev` nacía en
          rgb(20,18,18) —casi negro— y el botón de «Ver mapa» va oscuro con
          tinta crema: la flecha daba 2,42 de contraste. Estaba puesta y no se
          veía. Con el botón `placa` (plato negro, letra de latón) empeora.
          → La flecha no tiene color propio: HEREDA el del botón. Así sirve
            para el botón oscuro, para el claro (.btn.lt) y para cualquier
            estilo que Jazmín elija desde el panel. */
    P + '.btn .chev, ' + P + '.chev{ color:inherit!important; opacity:.85!important; }',

    /* ────────────── 4quater · EL PASE CON EL QR NO ENTRA CON CANTO RECTO
       Maki, 22/9/2026: «donde está el QR no me gusta cómo quedó ese corte
       recto y el dibujo de atrás.»
       El arco lo tiene `.pasecard`; lo que cortaba era la SECCIÓN `.pase`,
       294 px con la foto en `cover` y `border-radius:0`.
       ⚠⚠ NO se puede enmascarar `.pase` directo: `mask-image` se lleva
          puestos también a los hijos y el boleto del QR quedaría desvanecido.
       → La foto se muda a `.pase::before`, que la toma con
         `background-image:inherit` —la URL vive en el `style` inline que
         escribe el motor, así que SIGUE saliendo del panel— y se desvanece
         arriba y abajo con `mask-image`. El padre conserva la URL (para que
         `inherit` la vea) pero no la pinta: `background-size:0 0`. */
    P + '.pase{ position:relative!important; background-size:0 0!important; }',
    P + '.pase > *{ position:relative; z-index:1; }',
    P + '.pase::before{ content:""!important; position:absolute!important; inset:0!important; z-index:0!important; background-image:inherit!important; background-size:cover!important; background-position:center!important; -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,#000 24%,#000 76%,rgba(0,0,0,0) 100%)!important; mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,#000 24%,#000 76%,rgba(0,0,0,0) 100%)!important; }',

    /* ────────────── 4quinquies · LOS BOTONES DE WHATSAPP TAMBIÉN SON BOTONES
       Medido el 22/9/2026: `.wsp` salía en Montserrat 13 px sin espaciado
       —la tipografía por defecto del motor— mientras TODOS los demás botones
       de Cantera van en Karla 12 px, versalitas, 1,68 px de espaciado.
       Se leían pegados de otra invitación. */
    P + '.wsp{ font-family:"Karla",sans-serif!important; text-transform:uppercase!important; letter-spacing:1.68px!important; font-size:12px!important; }',

    /* ────────────── 4sexies · LAS TAPAS DE LA RASPADITA, EN CANTERA
       Maki, 22/9/2026: «las raspadas plateadas no van con este estilo,
       ponele otra cosa como hiciste con las demás».
       ⚠️ RECTIFICO EL COMENTARIO DE ARRIBA: `--r3-tapa` SÍ existe en este
       motor — 16 apariciones en /efectos/todo.php, más `__tapaFoto`.
       Lo que NO existe es `.rasp-3 .r3-f`. Medido, no recordado.
       La variable la lee `efectos/raspadita.js` DESDE EL CANVAS, y una
       variable de CSS sólo baja a los DESCENDIENTES: por eso se declara
       en toda la rama, igual que en Bohemia.
       La pieza: medallón de lacre terracota con ramita de olivo, generado
       en Flow y recortado a la caja del lacre (512x512, 52.422 bytes). */
    ':is(.scratch-sec, .rasp-3, .rasp-zona, #scratchcard){',
    '  --r3-tapa:url("/sobres/cantera-rasp-tapa.webp");',
    '}',

    /* ────── 4septies · LAS TRES TAPAS, DEL MISMO COLOR
       Maki, 22/9/2026: «te quedaron de distinto color la raspada».
       CAUSA MEDIDA, no supuesta: los píxeles de los tres canvas son
       IDÉNTICOS (promedio 203-143-109 en los tres). Lo que cambia es
       una regla del motor, en rasp-css:
         .rasp-zona.dormida canvas{ filter:brightness(.84) saturate(.72) }
       El motor APAGA las casillas que todavía no se pueden raspar.
       Con el degradado metálico de fábrica eso se lee como «más oscuro»;
       con una FOTO de lacre se lee como TRES LACRES DE OTRO COLOR.
       Se apaga el filtro. El orden lo sigue marcando el `cursor:default`
       de la misma regla, que no se toca.
       ⚠️ VA CON EL PREFIJO: `.rasp-zona.dormida canvas` es (0,2,1) y
       también lleva !important; sin P empata y gana el orden de las
       hojas, que no controlamos. Con P queda (0,3,2) y gana siempre. */
    P + '.rasp-zona.dormida canvas{ filter:none!important; }',

    /* ────── 4octies · LA HOJA DE LA CARTA NO PUEDE SER LO ÚNICO BLANCO
       Medido: `.cf-letter` nacía con un degradado que arranca en
       rgb(255,254,251) — blanco — adentro de un papel rgb(239,227,208).
       Es el error 270 de Lupita otra vez, más suave. Se le pone el
       papel de Cantera. */
    /* ────── 4decies · LOS CÍRCULOS DE «LOS COLORES DE LA BODA»
       El motor los dibuja como .col-dc-c de 38px con un brillo BLANCO
       adentro (inset 0 0 0 1px rgba(255,255,255,.30)): está pensado para
       una sección OSCURA. Sobre el papel de Cantera los dos claros
       (#C9B79C y #EFE3D0) desaparecen y no se ve que son cinco.
       Se les cambia el aro a tinta. Medido en vivo: 5 círculos de 38px. */
    P + '.col-dc-c{ box-shadow:inset 0 0 0 1px rgba(74,53,36,.30), 0 1px 3px rgba(74,53,36,.13)!important; }',

    P + '.cf-letter{ background:linear-gradient(180deg,#F3EADA 0%,#EADFCB 100%)!important; }',

    /* ────── 4nonies · EL POZO DE SECCIONES DEL MISMO TONO — YA ESTABA
       El 22/9/2026 escribí acá el arreglo del aire entre dos secciones
       del mismo tono SIN LEER EL ARCHIVO ENTERO: ya existía, en el
       bloque 15, con 14px. Dos juegos de reglas idénticas, ganando la
       de más abajo. Se borró el duplicado y queda esta nota.
       ⚠️ LA REGLA: antes de agregar un bloque, BUSCAR la propiedad en
       el archivo. Medido en vivo: las juntas entre secciones del mismo
       tono dan 14px arriba y 14px abajo, que es lo correcto. */

    /* ────────────── 4ter · LA TAPA DEL VIDEO Y DE LA PLAYLIST NO ES UN PAPEL
       Maki, 22/9/2026: «en ver video está el rectángulo que no me gusta,
       anotalo en la skill porque parece que no está. Y la playlist lo mismo.»
       ⚠️⚠️ LA CLASE ES `.rd-tapa`, LA MISMA para el video y para la playlist.
          `.tv-tapa` y `.sp-tapa` NO EXISTEN: una regla contra una clase que no
          existe no da error, no hace nada, y se entrega como arreglada. Ya
          pasó en Campestre y se descubrió imprimiendo el árbol real.
       ⭐ SE PUEDE SACAR SIN DESTAPAR EL REPRODUCTOR: medido acá, el iframe de
          abajo está en `visibility:hidden` y sin `src`. Lo dejó resuelto Disco:
          «no se tapa un papel con otro papel».
       ⚠️ Se apaga POR PARTES: el atajo `background:` con !important pisa cosas
          que no queremos pisar. Queda sólo el medallón sobre el fondo de video. */
    P + ':is(.rd-tapa, .col-vtapa){',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:0!important; box-shadow:none!important;',
    '}',

    /* ───────────── 5 · EL ITINERARIO — UNA SOLA COLUMNA, COMO PERLAS
       ⚠️⚠️ NO SE LE MUEVE LA VÍA DE LUGAR. Ponerla en `left:50%` hacía que las
          fichas alternaran y las marcas quedaran desparramadas.
       ⚠️ Lo único que sí se toca es el TAMAÑO de la marca: 11 px del motor no
          se ve sobre un panel translúcido. 16 px con halo de papel. */
    P + '.tl{',
    '  background-color:rgba(239,227,208,.62)!important;',
    '  background-image:none!important;',
    '  border-radius:14px!important;',
    '}',
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  background-image:radial-gradient(circle, ' + TAN_T + ' 0 1px, rgba(0,0,0,0) 1.2px)!important;',
    '  background-size:2px 8px!important;',
    '  background-repeat:repeat-y!important;',
    '  background-color:transparent!important;',
    '  opacity:.75!important;',
    '  top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important;',
    '  animation:cantCuentas 2.4s linear infinite!important;',
    '}',
    '@keyframes cantCuentas{ from{background-position:0 0} to{background-position:0 16px} }',
    '@media (prefers-reduced-motion: reduce){ ' + P + '.tl::before{ animation:none!important } }',
    /* ⚠️ La bajada de cada hora viene en un gris del motor que sobre el papel
       da 4,47 — debajo del piso. En TINTA2 da 5,45. */
    P + '.tl .it .h{ color:' + TINTA + '!important; }',
    P + '.tl .it .d{ color:' + TINTA2 + '!important; }',
    P + '.tl > .it::before{',
    '  content:""!important;',
    '  width:16px!important; height:16px!important; left:-29px!important;',
    '  border-radius:50%!important;',
    '  background-image:' + H + '!important;',
    '  background-size:contain!important; background-repeat:no-repeat!important;',
    '  background-color:transparent!important;',
    '  border:0!important;',
    '  box-shadow:0 0 0 5px ' + HALO + '.85)!important;',
    '}',

    /* ─────────────────────────────────── 6 · LA RASPADITA
       ⚠️⚠️ LAS CLASES SON LAS QUE SE MIDIERON EN LA PÁGINA, no las que yo
          recordaba. `.rasp-3 .r3-f` y `--r3-tapa` NO EXISTEN en este motor.
       ⚠️ EL RECUADRO VIVE EN `.scratchcard::after`. `border:0` no lo apaga. */
    P + '.scratchcard{',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:0!important;',
    '  box-shadow:none!important;',
    '}',
    P + '.scratchcard::after{ display:none!important; }',
    /* las tres tapas: el medallón de olivo, la pieza propia de Cantera */
    P + '.ivf .c{',
    '  background-color:' + TAN + '!important;',
    '  background-image:url("' + MEDALLA + '")!important;',
    '  background-size:cover!important;',
    '  background-position:center!important;',
    '  border-radius:50%!important;',
    '  box-shadow:0 3px 9px rgba(74,53,36,.22)!important;',
    '}',
    P + '.ivf .n{ color:' + TINTA + '!important; text-shadow:0 1px 0 rgba(255,255,255,.28)!important; }',

    /* ─────────────────────────────────── 7 · EL PASE
       Los rótulos son .k y .v (NO .lab/.val: esos no existen). */
    P + '.pasecard{ background-color:' + PAPEL2 + '!important; }',
    P + '.pasecard .t{ font-family:"Cormorant Garamond",serif!important; font-size:20px!important; color:' + TINTA + '!important; letter-spacing:.02em!important; }',
    P + '.pasecard .k{ font-family:Karla,sans-serif!important; font-size:10.5px!important; letter-spacing:.18em!important; text-transform:uppercase!important; color:' + TAN_T + '!important; }',
    P + '.pasecard .v{ font-family:"Cormorant Garamond",serif!important; font-size:16px!important; color:' + TINTA + '!important; }',
    /* la chapita, en rosa vieja: es el único lugar donde ese tono manda */
    P + '.pasecard .estado{ background-color:rgba(167,109,94,.18)!important; color:' + TINTA + '!important; border:1px solid rgba(167,109,94,.45)!important; }',
    /* ⚠️ el cuadrado del QR se deja BLANCO a propósito: un lector lo necesita. */

    /* ─────────────────────────────────── 8 · LOS BOTONES */
    P + '.btn{',
    '  font-family:Karla,sans-serif!important; font-size:12px!important;',
    '  letter-spacing:.14em!important; text-transform:uppercase!important;',
    '  background-color:' + TAN + '!important;',
    '  background-image:linear-gradient(176deg, rgba(255,255,255,.22), rgba(0,0,0,.10))!important;',
    '  border:1px solid rgba(74,53,36,.18)!important;',
    '  border-radius:999px!important;',
    '  box-shadow:0 5px 12px rgba(74,53,36,.16), inset 0 1px 0 rgba(255,255,255,.28)!important;',
    '}',
    /* la tinta del botón sólido: sobre Golden Tan da 7,8 */
    /* ⚠️⚠️ LA COLECCIÓN NO CLAVA LA TINTA DEL BOTÓN. (22/9/2026)
       Esta línea tenía `TINTA_BTN` con `!important` —calibrada para el botón
       claro de antes, «sobre Golden Tan da 7,8»—. El día que el botón pasó a
       `placa` (plato negro con letra de latón) quedó tinta oscura sobre negro:
       Maki lo vio enseguida («checá los botones que el color del texto está
       mal») y medía 2,42 de contraste.
       ⚠️ EL ESTILO DE BOTÓN LO ELIGE JAZMÍN DESDE EL PANEL, así que la colección
          no puede suponer de qué color es el botón. Los once estilos de
          `botones.js` declaran su propio `color` con `!important`.
       → La colección propone su tinta SIN `!important` (gana si no hay estilo
         de botón) y el relleno sigue al color que gane la cascada
         (`currentColor`), no a un valor clavado. */
    P + '.btn:not(.gh){ color:' + TINTA_BTN + '; -webkit-text-fill-color:currentColor; }',
    P + '.btn.gh{',
    '  color:' + TINTA + '!important;',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:1px solid rgba(132,96,68,.48)!important;',
    '}',

    /* ───────────────── 9 · LA HOJA DE LA CARTA NO ES BLANCA */
    P + '.cf-letter{ background-color:' + PAPEL + '!important; color:' + TINTA + '!important; }',
    P + '.cf-letter h3{ font-family:"Cormorant Garamond",serif!important; color:' + TINTA + '!important; }',

    /* ⭐⭐ 10 · LAS SEIS BANDAS: PIEDRA, PROFUNDIDAD Y CENEFA
       «No me gusta el color pleno marrón, tenés que meterle algo de diseño y
       textura a esos sectores» (Maki, 22/9).
       El COLOR lo define `--verde`. Acá van las tres capas de encima. */
    P + '.sec.verde{',
    '  position:relative!important;',
    /* que no sea una pared plana: apenas más oscura arriba y abajo */
    '  background-image:linear-gradient(180deg, rgba(0,0,0,.16) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,.16) 100%)!important;',
    '}',
    /* la piedra tallada. ⚠️ VA EN ::before CON `opacity` (ver el encabezado) */
    P + '.sec.verde::before{',
    CAPA_PIEDRA,
    '}',
    /* la cenefa de olivo que remata arriba y abajo */
    P + '.sec.verde::after{',
    '  content:""!important;',
    '  position:absolute!important; left:0!important; right:0!important;',
    '  top:0!important; height:100%!important;',
    '  z-index:0!important; pointer-events:none!important;',
    '  background-image:' + C + ',' + C + '!important;',
    '  background-size:80px 10px, 80px 10px!important;',
    '  background-repeat:repeat-x, repeat-x!important;',
    '  background-position:center top, center bottom!important;',
    '}',
    /* ⚠️ sin esto el texto queda DEBAJO de la piedra */
    P + '.sec.verde > *{ position:relative!important; z-index:1!important; }',

    /* ────────── 11 · LA TINTA DE LAS SEIS BANDAS */
    /* ⭐⭐ DOS JUEGOS DE TINTA, SEGÚN HAYA BANDA TEMÁTICA O NO.  (22/9/2026)
       Maki: las seis bandas marrones pesaban demasiado y pidió aclararlas.
       `efectos/banda-tematica.js` ya sabe pintarlas en CLARO —papel, objetos
       de la temática a los costados y el video de fondo asomando—, pero estas
       reglas clavaban la tinta CREMA con `!important` y, por especificidad
       (0,3,1 contra 0,2,1), le ganaban: al encender la banda los títulos
       quedaban crema sobre claro, invisibles. Medido en `regina-y-emiliano`.
       → La banda ahora firma `data-banda` en el <html>, así que acá hay dos
         juegos y no se pelean: SIN banda manda el crema de siempre; CON banda
         manda la tinta. Ninguna invitación cantera sin banda cambia. */
    'html[' + MARCA + ']:not([data-banda]) ' + '.sec.verde h2{',
    '  color:' + CREMA + '!important;',
    '  background-image:' + VC + '!important;',
    '  text-shadow:0 1px 3px rgba(0,0,0,.35)!important;',
    '}',
    'html[' + MARCA + ']:not([data-banda]) ' + '.sec.verde .kick{ color:' + CREMA2 + '!important; }',
    'html[' + MARCA + ']:not([data-banda]) ' + '.sec.verde p:not(.frase){ color:rgba(244,235,221,.92)!important; }',
    'html[' + MARCA + ']:not([data-banda]) ' + '.sec.verde .frase{ color:' + CREMA + '!important; }',
    'html[' + MARCA + ']:not([data-banda]) ' + '.sec.verde .padres .nm{ color:' + CREMA + '!important; }',
    'html[' + MARCA + ']:not([data-banda]) ' + '.sec.verde .btn.gh{ color:' + CREMA + '!important; border-color:rgba(230,214,188,.55)!important; }',

    /* el juego CLARO: la misma tinta que el resto de la invitación, sin la
       sombra negra (sobre papel claro ensucia) y con el filete en latón. */
    'html[' + MARCA + '][data-banda] ' + '.sec.verde h2{',
    '  color:' + TINTA + '!important;',
    '  background-image:none!important;',
    '  -webkit-text-fill-color:' + TINTA + '!important;',
    '  text-shadow:none!important;',
    '}',
    'html[' + MARCA + '][data-banda] ' + '.sec.verde .kick{ color:' + TINTA2 + '!important; }',
    'html[' + MARCA + '][data-banda] ' + '.sec.verde p:not(.frase){ color:' + TINTA2 + '!important; }',
    'html[' + MARCA + '][data-banda] ' + '.sec.verde .frase{ color:' + TINTA + '!important; }',
    'html[' + MARCA + '][data-banda] ' + '.sec.verde .padres .nm{ color:' + TINTA + '!important; }',
    'html[' + MARCA + '][data-banda] ' + '.sec.verde .btn.gh{ color:' + TINTA + '!important; border-color:#A8823E!important; }',
    /* la cenefa dorada se pierde sobre claro: se oscurece a latón. */
    'html[' + MARCA + '][data-banda] ' + '.sec.verde::after{ opacity:.55!important; }',
    /* ⚠⚠ Los TRES `.btn.gh` de una banda oscura están los tres ADENTRO de una
       tarjeta de PAPEL: ahí la tinta vuelve a ser la oscura. Pintarlos de
       crema dejaba «Agendar» crema sobre crema. */
    P + '.sec.verde :is(.evento, .hotel, .pasecard) :is(h3, p, .sub, .addr, .t, .v){',
    '  color:' + TINTA + '!important;',
    '}',
    P + '.sec.verde :is(.evento, .hotel, .pasecard) .btn.gh{',
    '  color:' + TINTA + '!important;',
    '  border-color:rgba(132,96,68,.48)!important;',
    '}',

    /* ───────────── 12 · CONTACTO, QUE VIENE CON FOTO
       El velo va en `::after` y NO en el `background` de la sección, que es
       lo que ensuciaría la cuenta del contraste.
       ⚠️ #contacto-sec NO es `.verde` (medido): no choca con la cenefa. */
    P + '#contacto-sec{ position:relative!important; }',
    P + '#contacto-sec::after{',
    '  content:""!important; position:absolute!important; inset:0!important;',
    '  z-index:0!important; pointer-events:none!important;',
    '  background:linear-gradient(180deg, rgba(40,26,16,.34) 0%, rgba(40,26,16,.66) 100%)!important;',
    '}',
    P + '#contacto-sec > *{ position:relative!important; z-index:1!important; }',
    P + '#contacto-sec h2{',
    '  color:' + CREMA + '!important;',
    '  background-image:' + VC + '!important;',
    '  text-shadow:0 1px 3px rgba(0,0,0,.6)!important;',
    '}',
    P + '#contacto-sec .kick{ color:' + CREMA2 + '!important; }',
    P + '#contacto-sec p{ color:rgba(244,235,221,.90)!important; }',

    /* ⭐ 13 · EL PIE, con la misma piedra y por el mismo camino
       ⚠️⚠️ ACÁ ES DONDE ME EQUIVOQUÉ: lo había dejado con
          `background-blend-mode: soft-light` directo sobre `.footer`, y la
          piedra salió A PLENA FUERZA — un papel tapiz de piedra tallada con
          «¡Gracias!» encima. Se vio en la captura, no en ninguna medición.
          La capa va aparte, con `opacity`, igual que en las bandas. */
    P + '.footer{',
    '  position:relative!important;',
    '  background-color:' + PIE + '!important;',
    /* ⚠️⚠️ EL PIE NO TAPA LA FOTO DEL CIERRE.  (22/9/2026)
       Maki: «la foto final que dice gracias es larga y marrón, muy fea».
       No era una foto fea: NO HABÍA FOTO. El motor pinta el pie con
       `background: <velo>, var(--final) center/cover` —la foto del fin de
       página— y acá había un `background-image:none!important` puesto para
       vestir el pie con la piedra. Resultado: un bloque marrón plano de
       452 px con «¡Gracias!» encima. Se veía en la captura, en ninguna
       medición.
       → El pie deja pasar `--final`, con velo de la familia para que la tinta
         crema se lea. El color de respaldo queda DEBAJO: en una invitación sin
         foto de cierre `var(--final)` sale vacía, la declaración se descarta
         sola y vuelve el marrón. La piedra sigue en el `::before` con
         opacidad, que es donde tiene que estar. */
    '  background-image:linear-gradient(rgba(42,32,24,.34) 0%,rgba(42,32,24,.74) 100%),var(--final)!important;',
    '  background-size:cover!important; background-position:center!important;',
    '  background-blend-mode:normal!important;',
    '  color:' + CREMA + '!important;',
    '}',
    P + '.footer::before{',
    CAPA_PIEDRA,
    '}',
    P + '.footer > *{ position:relative!important; z-index:1!important; }',

    /* ───────────── 14 · LOS CAMPOS Y LOS CONTROLES */
    P + ':is(input, select, textarea, .tv-in){',
    '  background-color:' + PAPEL + '!important;',
    '  color:' + TINTA + '!important;',
    '  border:1px solid rgba(132,96,68,.42)!important;',
    '}',
    P + ':is(input, textarea)::placeholder{ color:rgba(99,71,47,.72)!important; }',
    P + '.tv-btn{ background-color:' + TAN + '!important; color:' + TINTA_BTN + '!important; }',
    P + '.ar{ color:' + CREMA + '!important; }',

    /* ───────────── 15 · EL AIRE ENTRE DOS SECCIONES DEL MISMO TONO */
    P + '.sec:not(.verde) + .sec:not(.verde){ padding-top:14px!important; }',
    P + '.sec:not(.verde):has(+ .sec:not(.verde)){ padding-bottom:14px!important; }',
    P + '.sec.verde + .sec.verde{ padding-top:14px!important; }',
    P + '.sec.verde:has(+ .sec.verde){ padding-bottom:14px!important; }',

    /* ⭐ 16 · EL VELO DE PAPEL DETRÁS DEL TEXTO QUE VA SOBRE LA FOTO
       ⚠️ Es una SOMBRA del color del papel, no un recuadro: Maki ya dijo
          «muchísimo diseño» y no quiere otra caja.
       ⚠️ NO entra adentro de las tarjetas: ahí el papel ya es macizo. */
    P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){',
    '  text-shadow:0 0 7px ' + HALO + '.92), 0 0 16px ' + HALO + '.75)!important;',
    '}',

    /* ────── 5 · LO QUE MAKI PIDIÓ MIRANDO PERLAS — 23/9/2026
       Va AL FINAL del arreglo a propósito: los bloques de contacto y del
       arco (3) tienen la misma especificidad y están más arriba; a igual
       especificidad gana el que viene después.

       5a · MEDIO CÍRCULO ARRIBA en todas las bandas (.sec.verde): Dónde y
       cuándo, Dónde quedarse, Personas, Trivia, Hashtag y «Te esperamos».
       Medido en Perlas: border-radius 50% 50% 0 0 / 90px 90px 0 0 y 104px
       de aire arriba. Las esquinas quedan transparentes y se ve el fondo.
       La piedra (::before) sigue el arco; la cenefa de olivo (::after)
       pierde la tira de ARRIBA —una línea recta cortada por la curva—
       y conserva la de abajo. */
    P + '.sec.verde{ border-radius:50% 50% 0 0 / 90px 90px 0 0!important; padding-top:96px!important; }',
    P + '.sec.verde::before{ border-radius:inherit!important; }',
    P + '.sec.verde::after{ border-radius:inherit!important; background-size:0 0, 80px 10px!important; }',

    /* 5b · DÓNDE Y CUÁNDO: las tres tarjetas como en Perlas, angostas y
       estiradas, con el mismo arco. Perlas: 318 px sobre un marco de 580
       (55%), arco 50%/34px, 38 px entre una y otra. Cantera tenía 524 px,
       arco 150px/40px y 16 px entre tarjetas. */
    P + '.evento{ width:66%!important; max-width:340px!important; margin:0 auto 34px!important; border-radius:50% 50% 12px 12px / 36px 36px 12px 12px!important; }',
    P + '.evento .ph{ height:200px!important; }',

    /* 5c · EL ITINERARIO SE IBA AL COSTADO. Medido: la marca de cada hora
       caía 6 px AFUERA del panel (.it::before en left:-29px con sólo 22 px
       de relleno). Ahora el relleno izquierdo es 56 px y la vía punteada se
       corre a 34 px: marca y vía quedan centradas, adentro del panel. */
    P + '.tl{ padding:26px 24px 26px 56px!important; }',
    P + '.tl::before, ' + P + '.tl > .tl-prog{ left:34px!important; }',

    /* 5d · ¿ALGUNA DUDA?, CON LA ONDA DE PERLAS: papel claro en vez de foto
       con velo oscuro, la pieza dibujada al medio (el corazón de olivo en
       relieve, el mismo que aparece al abrir el sobre) y los WhatsApp como
       enlaces con filete, no como píldoras. El corazón va en multiply para
       que su papel se funda con el de la sección. */
    P + '#contacto-sec{ background-image:none!important; background-color:rgba(239,227,208,.92)!important; }',
    P + '#contacto-sec::after{ display:none!important; }',
    P + '#contacto-sec h2{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
    P + '#contacto-sec .kick, ' + P + '#contacto-sec p{ color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; }',
    P + '#contacto-sec p::before{ content:""; display:block; width:210px; height:210px; margin:4px auto 12px; background:url("https://res.cloudinary.com/oc8cgqt4/image/upload/f_auto,q_auto,w_440/invitame/cantera/cantera-corazon-relieve") center/contain no-repeat; mix-blend-mode:multiply; }',
    P + '#contacto-sec .wsp{ background:none!important; box-shadow:none!important; border-radius:0!important; padding:8px 2px 5px!important; border-bottom:1px solid rgba(132,96,68,.5)!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }'

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
     donde está la ÚLTIMA. Ese punto depende del texto que cargue Jazmín: se
     MIDE y se pasa por variable. Y son DOS elementos: la vía (.tl::before) y
     el relleno que avanza con la hora (.tl-prog). */
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
     ⚠️⚠️ NO se mide contra `n.parentElement`: ese padre es hijo de un flex y
        su ancho SALE del texto. La referencia estable es `.portada` menos su
        padding.
     ⚠️ Va con `setProperty(..., 'important')`: estilos-servidor.css clava
        #pv-names con !important. */
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

  function poner() {
    var raiz = document.documentElement;
    if (!raiz.hasAttribute(MARCA)) raiz.setAttribute(MARCA, '');
    /* ⚠️⚠️ El atributo tiene que llevar el NOMBRE de la colección: el chequeo
       lo lee con `|| ''` y después `if (propia)`. Vacío es falso y la regla
       `simbolo-tematica` falla con la marca perfectamente puesta. */
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
    /* ⚠️ Se repasa durante 24 s: con el fondo en video el documento tarda. */
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
