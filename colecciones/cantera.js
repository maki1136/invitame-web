/* ===== COLECCIÓN «CANTERA» ===================================================

   Boda religiosa tradicional mexicana, en Morelia. Nace de una referencia que
   mandó Maki el 21/9/2026 (una invitación de la competencia): la TEMÁTICA
   servía, el diseño no.

   ⭐⭐ EL CONCEPTO ES BOHEMIA, Y ESO SE DECIDIÓ EL 22/9/2026
      Maki, mirando la primera versión:

        «Al arrancar está todo desenfocado. Quise mostrar el fondo y no se ve el
         video. La carta del sobre parece una viña. El itinerario es horrible.
         Me gustaría más el estilo de la naturaleza. Las fotos están como muy
         largas. Muchísimo diseño.
         Mirá la invitación de muestra de Bohemia: es excelente, deberías seguir
         ese concepto.»

      Y lo que hace buena a Bohemia se puede escribir en una línea:
      **UNA FOTO DE NATURALEZA, CLARA, QUE SE VE POR DETRÁS DE TODO.** No hay
      paneles macizos ni filetes de más: las secciones son VELOS sobre esa foto.

      Lo que se midió contra Bohemia, una cosa por vez:

      | | Cantera (mal) | Bohemia | Cantera (ahora) |
      |---|---|---|---|
      | `fx.fondo.donde` | `pantalla` → los costados, un borrón | `marco` | `marco` |
      | `fx.fondo` | interior de iglesia, OSCURO | pampas, claro | jardín de hacienda, claro |
      | `.tl` | papel opaco + cuadriculado | rgba(claro,.58), liso | rgba(243,237,227,.58), liso |
      | el arco de las fotos | 999px/46% — estira la foto a lo alto | esquinas suaves | 150px/40px |

   ⚠️⚠️ LO QUE NO SE PUDO COPIAR DE BOHEMIA, Y POR QUÉ — 22/9/2026
      En Bohemia las seis bandas «de color» del motor son CLARAS
      (`rgba(239,228,214,.30)`, medido). Intenté lo mismo acá con
      `.sec.verde{ background-color: rgba(231,221,200,.34)!important }` y NO
      GANÓ: medido después de subirlo, la sección seguía en
      `srgb(0.231 0.184 0.149)`. **El motor escribe ese fondo INLINE y con
      `!important`, y contra un inline `!important` no hay hoja que valga.**
      Es el intento 3 del punto 0bis.10 de la skill de entrega, otra vez.
      → El fondo de las secciones es del motor. NO se le disputa. Lo que sí se
        puede es cambiarle la TINTA, y eso es lo que hace el bloque 10.

   ⭐ LOS MATERIALES
      · cantera rosada  → la piedra de Morelia, el papel de la invitación
      · latón envejecido→ los acentos y los filetes
      · cirio           → la luz cálida y la tinta de las bandas oscuras
      · olivo           → el motivo vegetal: la viñeta, la marca del itinerario
                          y el medallón de la raspadita

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. No dibuja una invitación
      nueva y NO SACA NINGUNA SECCIÓN. Vestir no es quitar.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'cantera'` no hace nada.
      Para probar sin tocar la base: `?coleccion=cantera`

   ⚠️ NO TOCA NADA GLOBAL AL CARGARSE. Este archivo viaja en el paquete de
      `efectos/todo.php` y se carga en TODAS las invitaciones. Todo lo que
      escribe afuera (INVCOLPALETA, atributos del <html>, la hoja de estilo) se
      escribe en `poner()` y tiene su línea espejo en `sacar()`.

   ⚠️ LA ESCALA TIPOGRÁFICA ESTÁ REESCRITA ENTERA. `i/estilos-servidor.css`
      clava los tamaños con `!important` y están calibrados para una CURSIVA
      (`--fs-cursiva: 34px`). Cantera usa una versalita en el sobretítulo, así
      que heredaría 34 px y al ojo pesa el doble. Por eso acá el sobretítulo va
      en 12 px y el título en 21.

   ⚠️⚠️ Y LA MEDICIÓN DEL 22/9 QUE CASI ME HACE ROMPER ALGO QUE ANDABA: con el
      fondo en video pesado, a los 5 segundos la colección TODAVÍA NO SE APLICÓ
      (`data-cantera` sin poner, sin hoja). A los 15 ya está. Antes de declarar
      que una colección «no anda», se mide a los 15 s, no a los 5.

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
  var OSCURO  = '#2A2018';   /* el pie                                      */
  /* La tinta del botón sólido es MÁS oscura que OSCURO a propósito: sobre el
     latón, OSCURO da 4,50 y no llega al piso de 5. Ésta da 5,41. Medido. */
  var TINTA_BTN = '#150F09';

  var MEDALLA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/invitame/piezas/cantera-medalla-2.webp';

  /* ⭐ EL ARCO, AHORA SUAVE.
     La primera versión era `999px 999px 7px 7px / 46% 46% 7px 7px`: ese 46%
     vertical hace que el medio punto se coma casi la mitad del alto de la
     foto, y la foto se lee ESTIRADA. Es el «las fotos están como muy largas»
     del 22/9. Con 40 px de radio vertical el arco se sigue leyendo como arco
     y la foto conserva su proporción. */
  var ARCO     = '150px 150px 10px 10px / 40px 40px 10px 10px';
  var ARCO_TOP = '150px 150px 0 0 / 40px 40px 0 0';

  /* La viñeta: una hoja de olivo entre dos filetes. VECTOR, no foto: se repite
     arriba de cada título, y una foto repetida en serie se lee como
     calcomanía (la lección de Bohemia). */
  function vinieta(color) {
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

  /* ⭐ LA MARCA DE CADA HORA DEL ITINERARIO: LA MISMA HOJA, SOLA.
     Antes era el MEDALLÓN fotografiado a 26 px con un aro de papel de 5 px:
     repetido seis veces se leía como una fila de MONEDAS pegadas encima del
     panel. Es exactamente lo que la skill de armado dice que pasa cuando una
     foto recortada se repite en serie. La foto se queda donde está sola y
     tiene aire (la tapa de la raspadita); acá va el vector. */
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
     ⚠️ Una colección igual TIENE que reclamar todas las superficies: sin
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
    var H  = hojita(LATON);

    return [

    /* ─────────────────────────────────────────────── 1 · LAS LETRAS */
    '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Karla:wght@300;400;500&display=swap");',

    P + '.sec h2, ' + P + '.frase, ' + P + '.portada #pv-names{',
    '  font-family:"Cormorant Garamond",Georgia,serif!important;',
    '}',
    P + '.sec p, ' + P + '.sec .kick, ' + P + '.btn, ' + P + '.evento .sub, ' + P + '.evento .addr{',
    '  font-family:Karla,system-ui,sans-serif!important;',
    '}',

    /* ⚠️ EL SOBRETÍTULO NUNCA MÁS GRANDE QUE EL TÍTULO. */
    P + '.sec .kick{',
    '  font-size:12px!important; line-height:1.5!important;',
    '  letter-spacing:.24em!important; text-transform:uppercase!important;',
    '  font-weight:500!important; color:' + LATON + '!important;',
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

    /* ─────────────────────────────────────────────── 2 · LA PORTADA
       Bloque al PIE (centrado le cae encima de las caras).
       ⚠️ Por ID, que es lo único que le gana a estilos-servidor.css.
       ⚠️ El tamaño de acá es el TECHO: `ajustarNombres()` lo baja cuando la
          pareja tiene nombres largos. */
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

    /* ─────────────────────────────────── 3 · EL ARCO, SUAVE
       ⚠️ `overflow:hidden` va sí o sí: sin eso la foto se sale del arco. */
    P + ':is(.evento, .hotel, .pasecard, .col-vtapa, .gal figure, .gal a, .padres .av){',
    '  border-radius:' + ARCO + '!important;',
    '  overflow:hidden!important;',
    '}',
    /* ⭐ MENOS DISEÑO: el borde baja de .34 a .18 y la sombra se afina.
       «Muchísimo diseño» — Maki, 22/9. */
    P + ':is(.evento, .hotel, .pasecard){',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid rgba(168,130,62,.18)!important;',
    '  box-shadow:0 6px 18px rgba(58,46,40,.09)!important;',
    '}',
    P + ':is(.evento, .hotel) img{',
    '  border-radius:' + ARCO_TOP + '!important;',
    '  display:block!important; width:100%!important;',
    '}',
    P + '.gal img{ border-radius:' + ARCO + '!important; display:block!important; }',
    /* la foto de Personas sigue siendo un círculo: es un retrato */
    P + '.padres .av{ border-radius:50%!important; }',

    /* ─────────────────────── 4 · PERSONAS: LAS TRES EN UNA FILA
       Es la regla 1 del chequeo automático. El motor pone dos columnas FIJAS
       de 168 px; no es falta de lugar (el marco mide 500). */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important; background-color:transparent!important;',
    '}',
    P + '.padres .av{ width:104px!important; height:104px!important; }',
    P + '.padres .nm{ font-size:18px!important; color:' + TINTA + '!important; font-family:"Cormorant Garamond",serif!important; }',

    /* ─────────────────────────────── 5 · EL ITINERARIO, AL ESTILO BOHEMIA
       ⭐ TRES COSAS, Y LAS TRES SALIERON DE MIRAR BOHEMIA AL LADO:
         1. El panel NO es una tabla de papel: es un VELO translúcido, para que
            el jardín del fondo se siga viendo por detrás.
         2. Se le saca el CUADRICULADO (el motor le pone un
            `repeating-linear-gradient` de papel de cuentas). Con la foto
            detrás, eso es ruido sobre ruido.
         3. La marca de cada hora es la HOJA DE OLIVO sola, chica, sobre un
            halo de papel. El medallón fotografiado a 26 px repetido seis
            veces se leía como una fila de monedas.
       ⚠️ El velo NO puede ser transparente del todo: sobre una foto el texto
          oscuro se pierde. .58 es el número de Bohemia, medido.
       ⚠️ Y acá el velo SÍ gana: `.tl` no es una sección, así que el motor no
          le escribe el fondo inline. */
    P + '.tl{',
    '  background-color:rgba(243,237,227,.58)!important;',
    '  background-image:none!important;',
    '  border-radius:14px!important;',
    '}',
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  width:2px!important; left:50%!important; margin-left:-1px!important;',
    '  background-image:radial-gradient(circle, ' + LATON + ' 0 1px, rgba(0,0,0,0) 1.2px)!important;',
    '  background-size:2px 8px!important;',
    '  background-repeat:repeat-y!important;',
    '  background-color:transparent!important;',
    '  opacity:.72!important;',
    '  top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important;',
    '  animation:cantCuentas 2.4s linear infinite!important;',
    '}',
    '@keyframes cantCuentas{ from{background-position:0 0} to{background-position:0 16px} }',
    '@media (prefers-reduced-motion: reduce){ ' + P + '.tl::before{ animation:none!important } }',
    /* ⚠️ La bajada de cada hora viene en un gris derivado del motor
       (rgb 107,97,87) que sobre el papel da 4,47 — debajo del piso de 5.
       Medido el 22/9 con el chequeo. En TINTA2 da 5,79. */
    P + '.tl .it .h{ color:' + TINTA + '!important; }',
    P + '.tl .it .d{ color:' + TINTA2 + '!important; }',
    P + '.tl > .it::before{',
    '  content:""!important;',
    '  width:20px!important; height:20px!important; border-radius:50%!important;',
    '  background-image:' + H + '!important;',
    '  background-size:contain!important; background-repeat:no-repeat!important;',
    '  background-color:transparent!important;',
    '  box-shadow:0 0 0 7px rgba(243,237,227,.92)!important;',
    '}',

    /* ─────────────────────────────────── 6 · LA RASPADITA
       Sin recuadro (Maki ya lo pidió dos veces) y con el medallón de tapa:
       acá la foto SÍ va, porque es UNA sola y tiene aire.
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

    /* ─────────────────────────────────── 7 · EL PASE
       Nunca «básico blanco». Los rótulos son .k y .v (NO .lab/.val: esos no
       existen y escribirlos no da error, da «no pasó nada»). */
    P + '.pasecard{ background-color:' + PAPEL2 + '!important; }',
    P + '.pasecard .t{ font-family:"Cormorant Garamond",serif!important; font-size:20px!important; color:' + TINTA + '!important; letter-spacing:.02em!important; }',
    P + '.pasecard .k{ font-family:Karla,sans-serif!important; font-size:10.5px!important; letter-spacing:.18em!important; text-transform:uppercase!important; color:' + LATON + '!important; }',
    P + '.pasecard .v{ font-family:"Cormorant Garamond",serif!important; font-size:16px!important; color:' + TINTA + '!important; }',
    P + '.pasecard .estado{ background-color:rgba(168,130,62,.16)!important; color:' + TINTA + '!important; border:1px solid rgba(168,130,62,.38)!important; }',
    /* ⚠️ el cuadrado del QR se deja BLANCO a propósito: un lector necesita el contraste. */

    /* ─────────────────────────────────── 8 · LOS BOTONES */
    P + '.btn{',
    '  font-family:Karla,sans-serif!important; font-size:12px!important;',
    '  letter-spacing:.14em!important; text-transform:uppercase!important;',
    '  background-color:' + LATON + '!important;',
    '  background-image:linear-gradient(176deg, rgba(255,255,255,.22), rgba(0,0,0,.10))!important;',
    '  border:1px solid rgba(58,46,40,.18)!important;',
    '  border-radius:999px!important;',
    '  box-shadow:0 5px 12px rgba(58,46,40,.16), inset 0 1px 0 rgba(255,255,255,.28)!important;',
    '}',
    /* ⭐ La tinta del botón sólido es la oscura para TODOS: sobre latón da
       5,41; la crema daba 2,96 y encima convivían las dos en la misma
       invitación («Ver mapa» crema y «Reservar» casi negra). */
    P + '.btn:not(.gh){ color:' + TINTA_BTN + '!important; -webkit-text-fill-color:' + TINTA_BTN + '!important; }',
    P + '.btn.gh{',
    '  color:' + TINTA + '!important;',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:1px solid rgba(168,130,62,.45)!important;',
    '}',

    /* ───────────────── 9 · LA HOJA DE LA CARTA NO ES BLANCA
       `.cf-letter` trae el papel clavado en el motor y no sale de ninguna
       variable: quedaría como la única cosa blanca de la invitación. */
    P + '.cf-letter{ background-color:' + PAPEL + '!important; color:' + TINTA + '!important; }',
    P + '.cf-letter h3{ font-family:"Cormorant Garamond",serif!important; color:' + TINTA + '!important; }',

    /* ────────── 10 · LAS SEIS BANDAS OSCURAS DEL MOTOR (.sec.verde)
       ⭐⭐ EL BUG QUE ENCONTRÓ LA CAPTURA, NO LA MEDICIÓN ⭐⭐
       El motor pinta esas secciones con la TINTA al 82 % — el mismo material
       con el que esta colección escribe. Resultado: en «Dónde y cuándo»,
       «Dónde quedarse», «Nuestras personas», «Nuestro Hashtag», «Trivia» y
       «Una carta para ti» el título quedaba TINTA OSCURA SOBRE FONDO OSCURO:
       1,01 de contraste, y en la captura directamente NO ESTABA.
       ⚠️⚠️ Y NO SE ARREGLA ACLARANDO LA BANDA: el 22/9 probé
          `background-color:rgba(231,221,200,.34)!important` y la sección
          siguió midiendo `srgb(0.231 0.184 0.149)`. El motor lo escribe
          INLINE con `!important` y no hay hoja que le gane. El fondo de las
          secciones es del motor: se le cambia la TINTA, no el fondo. */
    P + '.sec.verde h2{',
    '  color:' + CIRIO + '!important;',
    '  background-image:' + VC + '!important;',
    '  text-shadow:0 1px 3px rgba(0,0,0,.45)!important;',
    '}',
    P + '.sec.verde .kick{ color:' + LATON_C + '!important; }',
    P + '.sec.verde p:not(.frase){ color:rgba(246,231,204,.90)!important; }',
    P + '.sec.verde .frase{ color:' + CIRIO + '!important; }',
    P + '.sec.verde .padres .nm{ color:' + CIRIO + '!important; }',
    P + '.sec.verde .btn.gh{ color:' + CIRIO + '!important; border-color:rgba(200,164,97,.62)!important; }',
    /* ⚠⚠ Y MEDIDO ANTES DE SUBIR (punto 0bis.4 de la skill de entrega): los
       TRES `.btn.gh` que viven en una banda oscura están los tres ADENTRO de
       una tarjeta de PAPEL. Pintarlos de cirio dejaba «Agendar» crema sobre
       crema — arreglar un texto rompiendo otro. */
    P + '.sec.verde :is(.evento, .hotel, .pasecard) :is(h3, p, .sub, .addr, .t, .v){',
    '  color:' + TINTA + '!important;',
    '}',
    P + '.sec.verde :is(.evento, .hotel, .pasecard) .btn.gh{',
    '  color:' + TINTA + '!important;',
    '  border-color:rgba(168,130,62,.45)!important;',
    '}',

    /* ───────────── 11 · CONTACTO, QUE VIENE CON FOTO
       `#contacto-sec` trae una FOTO de fondo y el motor le deja la tinta del
       papel: el título se come con la piedra. Va en cirio, con un velo
       degradé propio — el recurso del punto 0bis.11 de la skill de entrega:
       una foto cambia de claro a oscuro según la franja, y sin velo la
       legibilidad depende de qué le tocó.
       ⚠️ El velo va en `::after` (el `::before` lo usa el molde para los
          adornos) y NO en el `background` de la sección, que es lo que
          ensuciaría la cuenta del contraste. */
    P + '#contacto-sec{ position:relative!important; }',
    P + '#contacto-sec::after{',
    '  content:""!important; position:absolute!important; inset:0!important;',
    '  z-index:0!important; pointer-events:none!important;',
    '  background:linear-gradient(180deg, rgba(20,14,9,.34) 0%, rgba(20,14,9,.66) 100%)!important;',
    '}',
    P + '#contacto-sec > *{ position:relative!important; z-index:1!important; }',
    P + '#contacto-sec h2{',
    '  color:' + CIRIO + '!important;',
    '  background-image:' + VC + '!important;',
    '  text-shadow:0 1px 3px rgba(0,0,0,.6)!important;',
    '}',
    P + '#contacto-sec .kick{ color:' + LATON_C + '!important; }',
    P + '#contacto-sec p{ color:rgba(246,231,204,.88)!important; }',

    /* ───────────── 12 · EL PIE */
    P + '.footer{ background-color:' + OSCURO + '!important; color:' + CIRIO + '!important; }',

    /* ───────────── 13 · LOS CAMPOS Y LOS CONTROLES
       El molde los pinta para OTRO fondo y quedan fuera de la paleta. Medido
       el 22/9 MIRANDO: el campo de la trivia venía BLANCO al 92 % con borde
       gris —un rectángulo blanco en el medio de una banda— y las flechas de
       la galería en gris 96. */
    P + ':is(input, select, textarea, .tv-in){',
    '  background-color:' + PAPEL + '!important;',
    '  color:' + TINTA + '!important;',
    '  border:1px solid rgba(168,130,62,.40)!important;',
    '}',
    P + ':is(input, textarea)::placeholder{ color:rgba(95,80,70,.72)!important; }',
    P + '.tv-btn{ background-color:' + LATON + '!important; color:' + TINTA_BTN + '!important; }',
    P + '.ar{ color:' + CIRIO + '!important; }',

    /* ───────────── 14 · EL AIRE ENTRE DOS SECCIONES DEL MISMO TONO
       Punto 0bis.9 de la skill de entrega: «mirá el hueco que queda entre las
       dos secciones». Se les saca el aire muerto.
       ⚠️ Y NADA MÁS: la primera versión les ponía además un filete de latón
          en la junta. Con seis o siete juntas, eso es parte del «muchísimo
          diseño». El aire alcanza. */
    P + '.sec:not(.verde) + .sec:not(.verde){ padding-top:14px!important; }',
    P + '.sec:not(.verde):has(+ .sec:not(.verde)){ padding-bottom:14px!important; }',
    P + '.sec.verde + .sec.verde{ padding-top:14px!important; }',
    P + '.sec.verde:has(+ .sec.verde){ padding-bottom:14px!important; }'

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

     ⚠️⚠️ LA TRAMPA QUE COSTÓ UNA VUELTA: NO se mide contra `n.parentElement`.
        El padre (`div.c`) es hijo de un flex y su ancho SALE del texto: se
        achica cuando el texto se achica. Medir contra él es perseguirse la
        cola — el bucle baja de 74 a 34 px y los nombres quedan de nene. La
        referencia estable es `.portada` menos su padding.

     ⚠️ Va con `setProperty(..., 'important')`: estilos-servidor.css clava
        #pv-names con !important y un inline sin prioridad NO le gana. */
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
    /* La colección trae su propia marca y por eso `simbolo-tematica.js` no
       dibuja su SVG genérico.
       ⚠️⚠️ EL BUG DEL 22/9: esto se ponía VACÍO, y el chequeo lee
       `data-marca-propia` con `|| ''` y después `if (propia)`. Cadena vacía
       es falsa: para el chequeo era como no tener marca propia, y la regla
       `simbolo-tematica` fallaba con la marca PERFECTAMENTE puesta.
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
    /* ⚠️ Se repasa durante 24 s, no 16: con el fondo en video el documento
       tarda, y el 22/9 medí a los 5 s, vi la colección sin aplicar y estuve a
       punto de "arreglar" algo que no estaba roto. */
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
