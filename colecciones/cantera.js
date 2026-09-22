/* ===== COLECCIÓN «CANTERA» ===================================================

   Boda religiosa tradicional mexicana, en Morelia.

   ⭐⭐ LA PALETA LA ELIGIÓ MAKI — 22/9/2026
      Mandó una lámina «Nature inspired color palette · soft · warm · timeless»
      con cinco colores y dijo: «no me gusta ese marrón que elegiste, cambialo
      por otro tono, te dejo la paleta y cómo deberías armar el estilo».

        Sage Green      #98A086   → el olivo: la viñeta y la marca de cada hora
        Dusty Rose      #A76D5E   → el acento segundo (la chapita del pase)
        Golden Tan      #C4A071   → los rellenos: botones, filetes
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

   ⭐⭐⭐ EL MARRÓN QUE NO LE GUSTABA A MAKI NO ERA NINGUNO DE LOS MÍOS
      Y esto es LA lección del 22/9. Yo venía cambiando tonos de la colección
      y el marrón seguía ahí, porque el marrón que se ve en pantalla —las SEIS
      bandas plenas, lo más grande de toda la invitación— no salía de mi hoja.
      Medido en la página, la regla que gana es del motor:

          .sec.verde { background: var(--sec-col-v, var(--verde)); }

      y `--verde` valía **#3b2f26**: un marrón FRÍO, casi negro, que viene de
      la PALETA DEL EVENTO en la base, no de la colección.

      ⚠️ Antes tenía anotado acá que «el motor lo escribe inline con
         !important y no se puede pisar». ERA FALSO, y me costó una vuelta
         entera: el elemento NO tiene atributo style. Lo que pasaba es que yo
         estaba peleando con `background-color` cuando la propiedad que gana
         es `background`, y sobre todo que no estaba declarando la variable.
      → LA FORMA CORRECTA: la colección DECLARA `--verde` (y `--sec-col-v`).
        Es lo que hace Bohemia. No se pelea con la regla: se le cambia el
        valor a la variable que la regla lee.
      → Acá va BANDA (#6B4A32), Terracotta Brown bajado: crema encima da
        **6,73** y el sobretítulo crema2 **5,57**. Caliente y legible.

      REGLA GENERAL, para la próxima colección: ANTES de dar por imposible
      pisar un color del motor, buscar qué REGLA gana y qué VARIABLE lee esa
      regla. Casi siempre la respuesta es declarar la variable.

   ⭐⭐ EL CONCEPTO ES BOHEMIA
      Maki: «mirá la invitación de muestra de Bohemia: es excelente, deberías
      seguir ese concepto». Una FOTO DE NATURALEZA, CLARA, que se ve por
      detrás de todo; sin paneles macizos ni filetes de más.

   ⭐⭐ EL ITINERARIO VA EN UNA SOLA COLUMNA, COMO PERLAS — 22/9/2026
      Maki: «los círculos del itinerario te quedaron muy desordenados, copiá
      como te dije las otras muestras».
      Y tenía razón, y la causa estaba MEDIDA: la muestra tenía
      `fx.itinerario.estilo = 'centro'`, que alterna las fichas a izquierda y
      derecha con la vía al medio. Con fichas de alturas distintas las marcas
      quedan a alturas y a lados distintos: se leen como círculos tirados.
      Perlas —medida— no alterna: vía a `left:2.5px`, marcas a `left:-28.5px`,
      fichas de ancho completo. **Una línea, todas las marcas encima.**
      → Acá NO se le toca la posición a la vía. Sólo el MATERIAL y el TAMAÑO
        de la marca: el motor la deja en 11 px y sobre un panel translúcido
        una hoja verde de 11 px no se ve. Va a 16 px con un halo de papel.

   ⭐⭐ EL VELO DE PAPEL DETRÁS DEL TEXTO — 22/9/2026
      Maki: «Vestimenta quedó que no se lee nada, se pierde con el fondo».
      El fondo de Cantera es un jardín: CLARO pero CARGADO. Bohemia puede
      dejar las secciones casi transparentes porque su fondo es un lino liso.
      Acá hicieron falta las dos cosas:
        · `fx.fondo.paso` 0.85 → **0.34** (el alfa de la sección es 1−paso:
          de 15% a 66% de papel). El jardín se sigue viendo, el texto ya no
          pelea con la fuente del patio.
        · un HALO de papel detrás de cada texto que va sobre la foto — bloque
          15. Es sombra, no recuadro: Maki no quiere más cajas.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. No dibuja una invitación
      nueva y NO SACA NINGUNA SECCIÓN. Vestir no es quitar.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'cantera'` no hace nada.
      Para probar sin tocar la base: `?coleccion=cantera`

   ⚠️ NO TOCA NADA GLOBAL AL CARGARSE. Todo lo que escribe afuera
      (INVCOLPALETA, atributos del <html>, la hoja) va en `poner()` y tiene su
      línea espejo en `sacar()`.

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
  var CREMA   = '#F4EBDD';   /* la tinta sobre banda oscura: 6,73            */
  var CREMA2  = '#E6D6BC';   /* el sobretítulo sobre banda oscura: 5,57      */
  var TINTA_BTN = '#150F09'; /* sobre Golden Tan: 7,8                        */
  var HALO    = 'rgba(239,227,208,';  /* PAPEL en rgba, para el velo         */

  var MEDALLA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/invitame/piezas/cantera-medalla-2.webp';

  /* ⭐ EL ARCO, SUAVE. `999px/46%` se comía media altura de la foto y la
     estiraba: es el «las fotos están como muy largas» del 22/9. */
  var ARCO     = '150px 150px 10px 10px / 40px 40px 10px 10px';
  var ARCO_TOP = '150px 150px 0 0 / 40px 40px 0 0';

  /* La viñeta: una hoja de olivo entre dos filetes. VECTOR, no foto. */
  function vinieta(hoja, filete) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 16">' +
      '<path d="M4 8h38" stroke="' + filete + '" stroke-width="1" fill="none" opacity=".75"/>' +
      '<path d="M78 8h38" stroke="' + filete + '" stroke-width="1" fill="none" opacity=".75"/>' +
      '<path d="M60 2c-5 2.6-8 5.6-8 8 0 1.6.9 3.1 2.4 4.2C56.6 12.2 60 8.6 60 2z" fill="' + hoja + '"/>' +
      '<path d="M60 2c5 2.6 8 5.6 8 8 0 1.6-.9 3.1-2.4 4.2C63.4 12.2 60 8.6 60 2z" fill="' + hoja + '" opacity=".72"/>' +
      '<path d="M60 4v10" stroke="' + hoja + '" stroke-width=".9"/>' +
      '</svg>';
    return 'url("data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/"/g, "'") + '")';
  }

  /* La marca de cada hora: la misma hoja, sola. */
  function hojita(color) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<path d="M12 3c-4 2.1-6.4 4.5-6.4 6.4 0 1.3.7 2.5 1.9 3.4C10.1 11.1 12 7.7 12 3z" fill="' + color + '"/>' +
      '<path d="M12 3c4 2.1 6.4 4.5 6.4 6.4 0 1.3-.7 2.5-1.9 3.4C13.9 11.1 12 7.7 12 3z" fill="' + color + '" opacity=".7"/>' +
      '<path d="M12 5v15" stroke="' + color + '" stroke-width="1.1"/>' +
      '</svg>';
    return 'url("data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/"/g, "'") + '")';
  }

  /* --------------------------------------------------------- la paleta propia
     ⭐⭐ `--verde` Y `--sec-col-v` SON LAS QUE PINTAN LAS SEIS BANDAS PLENAS.
        Es la regla `.sec.verde{ background: var(--sec-col-v, var(--verde)) }`
        del motor. Si la colección no las declara, manda la paleta del evento
        —que acá traía un marrón frío casi negro— y ninguna otra regla de la
        colección lo puede tapar. Se DECLARA la variable; no se pelea la regla.
     ⚠️ `--tinta` es la tinta de cuerpo y NADA MÁS. (Antes tenía BANDA metido
        acá porque creí que la banda salía de `--tinta`: no era.) */
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
    '--seal-c':     TERRA,
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
    var V  = vinieta(SAGE, TAN_T);      /* sobre papel  */
    var VC = vinieta(SAGE, CREMA2);     /* sobre banda oscura o foto */
    var H  = hojita(SAGE);

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

    /* ───────────── 5 · EL ITINERARIO — UNA SOLA COLUMNA, COMO PERLAS
       ⚠️⚠️ NO SE LE MUEVE LA VÍA DE LUGAR. La versión anterior la ponía en
          `left:50%` y las fichas alternaban de lado: con alturas distintas,
          las marcas quedaban desparramadas. Maki: «los círculos te quedaron
          muy desordenados».
          Perlas, medida: vía a `left:2.5px`, marca a `left:-28.5px`, fichas
          de ancho completo. Se respeta esa geometría.
       ⚠️ LO ÚNICO QUE SÍ SE LE TOCA ES EL TAMAÑO DE LA MARCA: el motor la
          deja en 11×11 y una hoja de olivo verde de 11 px sobre un panel
          translúcido, medido, no se ve. Va a 16 px con un halo de papel que
          la despega del jardín. */
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

    /* ─────────────────────────────────── 6 · LA RASPADITA */
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
    P + '.btn:not(.gh){ color:' + TINTA_BTN + '!important; -webkit-text-fill-color:' + TINTA_BTN + '!important; }',
    P + '.btn.gh{',
    '  color:' + TINTA + '!important;',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:1px solid rgba(132,96,68,.48)!important;',
    '}',

    /* ───────────────── 9 · LA HOJA DE LA CARTA NO ES BLANCA */
    P + '.cf-letter{ background-color:' + PAPEL + '!important; color:' + TINTA + '!important; }',
    P + '.cf-letter h3{ font-family:"Cormorant Garamond",serif!important; color:' + TINTA + '!important; }',

    /* ────────── 10 · LA TINTA DE LAS SEIS BANDAS PLENAS
       El FONDO de la banda ya no se toca acá: lo define `--verde`, arriba,
       en la paleta propia. Este bloque es sólo lo que va ESCRITO encima. */
    P + '.sec.verde h2{',
    '  color:' + CREMA + '!important;',
    '  background-image:' + VC + '!important;',
    '  text-shadow:0 1px 3px rgba(0,0,0,.35)!important;',
    '}',
    P + '.sec.verde .kick{ color:' + CREMA2 + '!important; }',
    P + '.sec.verde p:not(.frase){ color:rgba(244,235,221,.92)!important; }',
    P + '.sec.verde .frase{ color:' + CREMA + '!important; }',
    P + '.sec.verde .padres .nm{ color:' + CREMA + '!important; }',
    P + '.sec.verde .btn.gh{ color:' + CREMA + '!important; border-color:rgba(230,214,188,.55)!important; }',
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

    /* ───────────── 11 · CONTACTO, QUE VIENE CON FOTO
       El velo va en `::after` y NO en el `background` de la sección, que es
       lo que ensuciaría la cuenta del contraste. */
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

    /* ───────────── 12 · EL PIE, en terracota (ya no el marrón frío) */
    P + '.footer{ background-color:#5A4030!important; color:' + CREMA + '!important; }',

    /* ───────────── 13 · LOS CAMPOS Y LOS CONTROLES */
    P + ':is(input, select, textarea, .tv-in){',
    '  background-color:' + PAPEL + '!important;',
    '  color:' + TINTA + '!important;',
    '  border:1px solid rgba(132,96,68,.42)!important;',
    '}',
    P + ':is(input, textarea)::placeholder{ color:rgba(99,71,47,.72)!important; }',
    P + '.tv-btn{ background-color:' + TAN + '!important; color:' + TINTA_BTN + '!important; }',
    P + '.ar{ color:' + CREMA + '!important; }',

    /* ───────────── 14 · EL AIRE ENTRE DOS SECCIONES DEL MISMO TONO
       Se les saca el aire muerto, y NADA MÁS: el filete en cada junta era
       parte del «muchísimo diseño». */
    P + '.sec:not(.verde) + .sec:not(.verde){ padding-top:14px!important; }',
    P + '.sec:not(.verde):has(+ .sec:not(.verde)){ padding-bottom:14px!important; }',
    P + '.sec.verde + .sec.verde{ padding-top:14px!important; }',
    P + '.sec.verde:has(+ .sec.verde){ padding-bottom:14px!important; }',

    /* ⭐ 15 · EL VELO DE PAPEL DETRÁS DEL TEXTO QUE VA SOBRE LA FOTO
       «Vestimenta quedó que no se lee nada, se pierde con el fondo» (Maki,
       22/9). Las secciones claras dejan pasar el jardín: donde atrás hay una
       fuente iluminada, una tinta marrón se pierde.
       ⚠️ Es una SOMBRA del color del papel, no un recuadro: Maki ya dijo
          «muchísimo diseño» y no quiere otra caja.
       ⚠️ NO entra adentro de las tarjetas: ahí el papel ya es macizo y el
          halo no haría nada más que ensuciar. */
    P + '.sec:not(.verde) :is(h2, p, .kick, .frase):not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl) *){',
    '  text-shadow:0 0 7px ' + HALO + '.92), 0 0 16px ' + HALO + '.75)!important;',
    '}'

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
