/* ===== COLECCIÓN «CENICIENTA» ================================================

   Cuento de hadas de hielo. Nace de una referencia que mandó Maki el
   21/9/2026: `invitameok.com/princesa-cenicienta/7546c4d6` — unos XV en Oaxaca
   hechos con la plataforma VIEJA: castillo, vestido azul hielo y una zapatilla
   DIBUJADA. El pedido fue textual: «hay que hacer algo como esto pero con
   nuestra nueva plataforma, con movimiento, video, etc.».

   ⭐ QUÉ LA HACE DISTINTA DE LAS OTRAS SEIS  (regla de Maki del 16/9:
      «si vas a hacer lo mismo, ¿cuál es la gracia de tener diferentes
      muestras?»):

        · Es la primera AZUL HIELO Y PLATA. Perlas es violeta, Marfil blanco y
          gris, Campestre oliva, Bohemia marrón y camel, Disco plata sobre
          negro.
        · Los títulos van en FORUM — una romana de capitales, muy abierta. No
          la usa ninguna otra. El nombre sí va en cursiva (ALEX BRUSH), que es
          lo que hace la referencia; la diferencia con Perlas y Marfil está en
          la romana de al lado y en el color, no en la cursiva.
        · El fondo es un VIDEO de nieve cayendo sobre un palacio de hielo.
        · La marca del itinerario es una ZAPATILLA DE CRISTAL FOTOGRAFIADA.
          ⚠️ En la referencia vieja la zapatilla es un DIBUJO. Acá no: es la
             foto recortada. Maki, 20/9: «la dibujaste a mano… es muy malo eso,
             necesitamos algo más profesional».
        · El botón va en CRISTAL. Perlas lacre, Marfil nácar, Campestre arcilla,
          Bohemia relieve seco, XV Martina esmalte.

   ⚠️⚠️ LOS COLORES ESTÁN MEDIDOS, NO ELEGIDOS DE OJO.
      El fondo es un video CLARO pero de azul medio: el papel de la foto mide
      (130,156,186) de promedio y (34,78,129) en el 5% más oscuro. Con
      `fx.fondo.paso = 0.45` el papel de las secciones queda en (192,206,222)
      típico y (148,171,197) en el peor caso. Contra ESE peor caso:
          TINTA  #14202E → 6,97      TINTA2 #22344A → 5,36
          TINTA3 #7E9DBB → 1,20  ← SÓLO filetes y bordes, NUNCA texto
      La primera TINTA2 que probé (#2C3E52) daba 4,64 en el peor caso: por
      debajo del piso de 5,0 de la regla 7 del chequeo. Por eso es #22344A.
      ⚠️ Y la trampa de siempre: medir contra el papel CSS miente, porque abajo
         hay un VIDEO. Se mide contra el video, y con el `paso` puesto.

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'cenicienta'`.
   ⭐ Jazmín la elige desde el selector de `efectos/panel-coleccion.js`.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'cenicienta';
  var ID_CSS = 'col-cenicienta';
  var P      = 'html[data-col="cenicienta"][data-coleccion="cenicienta"] ';

  /* ---------------------------------------------------------------- paleta */

  var TINTA  = '#14202E';   /* la principal: títulos, nombres, datos */
  var TINTA2 = '#22344A';   /* bajadas y textos secundarios */
  var TINTA3 = '#7E9DBB';   /* SÓLO filetes, bordes y separadores */
  var PLATA  = '#8FB3D9';   /* el acento. Decoración. */
  var PAPEL  = '#F2F7FC';
  var PAPEL2 = '#FAFCFE';
  var CREMA  = '#F7FBFF';   /* el texto que va ARRIBA de la tinta */

  /* ⚠️ LOS DOS TONOS DEL ACENTO. `--sage` va sobre papel CLARO y `--sage-cl`
     sobre fondo OSCURO: un solo color no se lee contra los dos. Medidos contra
     el papel de la colección, no a ojo:
         ACENTO   #3A5C80 sobre #F2F7FC → 6,45 ✓ (piso 5,0)
         ACENTOCL #A9C3DE sobre #14202E → 9,05 ✓ (piso 5,0) */
  var ACENTO   = '#3A5C80';
  var ACENTOCL = '#A9C3DE';

  /* el claro de la nieve: mismo brillo que la crema del molde (L 0,75) pero
     frío, para los textos que van sobre el video y sobre la foto del cierre.
     El molde traía #E7DDC8 y #F5EDDA, que son cremas CÁLIDAS. */
  var NIEVE = '#DCE8F4';

  /* la pieza fotografiada: la MISMA url en los cuatro lugares
     (itinerario, tapa de la playlist, perilla del sí/no, tapa de la raspadita) */
  var ZAPA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1790008396/invitame/cenicienta/hpauay94v5mxookjs8bk.webp';

  /* la viñeta de los títulos: un cristal de hielo de seis puntas entre dos
     filetes. Va en VECTOR, no en foto: el adorno de arriba de cada título es
     una viñeta tipográfica; la foto es para los objetos reconocibles — acá, la
     zapatilla del itinerario. Los 17 `.adorno` del motor traen un SVG con DOS
     ANILLOS ENTRELAZADOS: el adorno genérico de boda, que en unos XV de
     Cenicienta no pinta nada. Maki ya lo marcó («siempre ponés lo mismo»).
     ⚠️ Y `simbolo-tematica.js` no lo pisa, porque esta colección firma
        `data-marca-propia` y ese módulo se corre solo: el adorno lo tiene que
        poner la colección. */
  var ADORNO = "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 44'>" +
    "<g fill='none' stroke='%233A5C80' stroke-width='1.1' stroke-linecap='round'>" +
    "<line x1='10' y1='22' x2='46' y2='22'/>" +
    "<line x1='74' y1='22' x2='110' y2='22'/>" +
    "<g transform='translate(60,22)'>" +
    "<line x1='0' y1='-11' x2='0' y2='11'/>" +
    "<line x1='-9.5' y1='-5.5' x2='9.5' y2='5.5'/>" +
    "<line x1='-9.5' y1='5.5' x2='9.5' y2='-5.5'/>" +
    "<path d='M0 -7.5 l-2.8 -2.8 M0 -7.5 l2.8 -2.8'/>" +
    "<path d='M0 7.5 l-2.8 2.8 M0 7.5 l2.8 2.8'/>" +
    "<path d='M-6.5 -3.8 l-3.8 0.5 M-6.5 -3.8 l-0.5 -3.8'/>" +
    "<path d='M6.5 3.8 l3.8 -0.5 M6.5 3.8 l0.5 3.8'/>" +
    "<path d='M-6.5 3.8 l-3.8 -0.5 M-6.5 3.8 l-0.5 3.8'/>" +
    "<path d='M6.5 -3.8 l3.8 0.5 M6.5 -3.8 l0.5 -3.8'/>" +
    "</g></g></svg>";

  /* ⚠️⚠️ LAS VARIABLES QUE CENICIENTA RECLAMA COMO PROPIAS.
     `efectos/paleta.js` las reescribe en el <html> INLINE y con !important cada
     1,5 s, así que ninguna hoja le gana. El contrato (el mismo de Marfil desde
     el 17/9) es publicar acá la tabla y que la paleta pinte ESTOS valores.
     ⚠️⚠️ SÍ se reclaman `--sage`, `--sage-cl` y `--oro`, igual que Campestre.
        La primera versión los dejaba libres «para que mandara el color que
        eligió la quinceañera» y el chequeo cantó 15 textos colados: la paleta
        del panel (menta-nácar) pintaba los sobretítulos en VERDE #4e7468 y las
        etiquetas de Personas en verde seco, adentro de una colección de hielo.
        No es una cuestión de gusto: la regla `familia-de-color` mide distancia
        a los colores DECLARADOS, y esta paleta sólo declaraba casi-negros y
        casi-blancos. Cualquier acento de tono medio quedaba afuera por
        construcción. El acento es parte de la colección, como en Campestre. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,
    '--verde2':    '#0D1722',
    '--muted':     TINTA2,
    '--cream':     CREMA,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col-v': TINTA,
    '--sage':      ACENTO,
    '--sage-cl':   ACENTOCL,
    '--oro':       PLATA
  };

  /* ------------------------------------------------------------- tipografía */

  var DISPLAY = '"Forum", "Cormorant Garamond", Didot, Georgia, serif';
  var SCRIPT  = '"Alex Brush", "Pinyon Script", cursive';
  var SANS    = '"Josefin Sans", "Jost", system-ui, sans-serif';
  var FUENTES = 'https://fonts.googleapis.com/css2?family=Forum&family=Alex+Brush&family=Josefin+Sans:wght@300;400;600&display=swap';

  function ev()  { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === ID;
    } catch (e) {}
    try { return String(((ev().fx) || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }

  /* --------------------------------------------------------------- la hoja */

  function armarCSS() {
    return [

    /* ── tipografía general ────────────────────────────────────────────── */
    P + '.frame h2, ' + P + '.frame .tit, ' + P + '.frame .sec h2{',
    '  font-family:' + DISPLAY + '!important;',
    '  font-weight:400!important;',
    '  letter-spacing:.18em!important;',
    '  text-transform:uppercase!important;',
    '}',
    P + '.frame .kick, ' + P + '.frame .fecha, ' + P + '.frame .dato{',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.28em!important;',
    '  text-indent:.28em!important;',   /* compensa el espaciado o queda corrido */
    '  text-transform:uppercase!important;',
    '}',
    P + '.frame p, ' + P + '.frame li{ font-family:' + SANS + '!important; letter-spacing:.012em!important; }',

    /* ⚠️ lining-nums o «2027» se lee «2O27» en una romana */
    P + '.frame{ font-variant-numeric:lining-nums!important; }',

    /* ── LA PORTADA ────────────────────────────────────────────────────────
       ⚠️⚠️ LOS TAMAÑOS SE GANAN POR ID. `i/estilos-servidor.css` tiene, con
       !important y selector de ID:
           #pv-names{ font-size:var(--fs-nombres,54px)!important }
           #pv-kick { font-size:var(--fs-kicker,15px) !important }
       Un ID (1,0,0) le gana a cualquier `html[data-x] .portada .names` (0,3,0).
       ⚠️ Y LO PRIMERO QUE SE MIDE NO ES LA FUENTE, ES CUÁNTO OCUPA EL BLOQUE:
          la referencia está arriba del 55% de la pantalla. Por eso los cuerpos
          son grandes de verdad y el bloque va centrado.
          MEDIDO en vivo el 21/9 con `INVCENICIENTA.alto()`: con los cuerpos
          de fábrica daba 25%, con el nombre solo agrandado 52%, y con el
          nombre + la cuenta regresiva + el aire de estos valores da **55%**.
          Y la cola de la cursiva, medida con las métricas reales de la
          fuente: tinta a 165 px contra un techo de 231 (line-height 186 +
          padding-bottom 45). Entra con 66 px de sobra. */
    P + '.portada{ justify-content:center!important; }',

    /* el velo: radial, en un ::before del BLOQUE. Pseudo hermano, no ancestro,
       así no le ensucia la cuenta del contraste a reglas-duras.js. Una banda
       recta se vería como una barra gris cruzando la foto. */
    P + '.portada > .c{ position:relative!important; padding:0 6vw!important; }',
    P + '.portada > .c::before{',
    '  content:""; position:absolute; left:50%; top:-20%;',
    '  transform:translateX(-50%); width:190%; height:160%;',
    '  background:radial-gradient(56% 46% at 50% 52%,',
    '     rgba(8,16,28,.52) 0%, rgba(8,16,28,.40) 40%, rgba(8,16,28,.20) 62%,',
    '     rgba(8,16,28,.06) 80%, rgba(8,16,28,0) 92%);',
    '  pointer-events:none; z-index:0;',
    '}',
    P + '.portada > .c > *{ position:relative!important; z-index:1!important; }',

    /* el sobretítulo: «MIS XV», chiquito y muy abierto */
    P + '.portada #pv-kick{',
    '  font-family:' + SANS + '!important;',
    '  font-size:clamp(12px,3.6vw,16px)!important;',
    '  font-weight:400!important;',
    '  letter-spacing:.58em!important; text-indent:.58em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  line-height:1.4!important;',
    '  margin:0 0 .5em 0!important;',
    '  text-shadow:0 1px 3px rgba(6,12,22,.85)!important;',
    '}',

    /* ⭐ EL NOMBRE. Alex Brush, grande de verdad.
       ⚠️⚠️ LA COLA DE LA CURSIVA SE SALE DE LA CAJA DE LÍNEA. Medido en Lupita:
          cuerpo 152 px con line-height .92 daba una caja de 140 px y la tinta
          llegaba a 169 — 30 px metiéndose en el renglón de abajo.
          ⭐ Se arregla con `padding-bottom`, NO con `line-height`: el
             line-height también abre aire ARRIBA y despega el nombre del
             sobretítulo. */
    P + '.portada #pv-names{',
    '  font-family:' + SCRIPT + '!important;',
    '  font-weight:400!important;',
    '  font-style:normal!important;',
    '  font-size:clamp(92px,29vw,186px)!important;',
    '  line-height:1!important;',
    '  padding-bottom:.24em!important;',
    '  letter-spacing:.01em!important;',
    '  text-transform:none!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    /* ⚠️ longhands, nunca el atajo `background:` con !important */
    '  background-image:none!important;',
    '  background-color:transparent!important;',
    '  margin:0!important;',
    /* la sombra va como filter para que envuelva la letra ya dibujada */
    '  filter:drop-shadow(0 2px 3px rgba(6,12,22,.92))',
    '         drop-shadow(0 0 26px rgba(6,12,22,.55))!important;',
    '}',
    /* el nexo que mete el motor («&») en su propio tamaño y en plata */
    P + '.portada #pv-names span.amp, ' + P + '.portada #pv-names .amp{',
    '  font-size:.46em!important;',
    '  color:' + PLATA + '!important; -webkit-text-fill-color:' + PLATA + '!important;',
    '  opacity:.95!important;',
    '}',

    /* el filete de plata debajo del nombre */
    P + '.portada #pv-names::after{',
    '  content:""; display:block; width:104px; height:1px;',
    '  margin:.30em auto .1em;',
    '  background-color:' + PLATA + ';',
    '  opacity:.9;',
    '}',

    P + '.portada .fecha{',
    '  font-family:' + SANS + '!important;',
    '  font-size:clamp(11px,2.9vw,13.5px)!important;',
    '  letter-spacing:.42em!important; text-indent:.42em!important;',
    '  color:' + CREMA + '!important;',
    '  text-shadow:0 1px 3px rgba(6,12,22,.85)!important;',
    '  margin-top:1.5em!important;',
    '}',
    /* la cuenta regresiva, también grande: suma al % que ocupa el bloque */
    P + '.portada .cd, ' + P + '.portada .ivf{ margin-top:1.5em!important; }',
    P + '.portada .cd .n, ' + P + '.portada .ivf .c .n{',
    '  font-family:' + DISPLAY + '!important;',
    '  font-size:clamp(34px,9vw,52px)!important;',
    '  color:' + CREMA + '!important;',
    '}',

    /* ── PERSONAS: LAS TRES EN UNA FILA. SIEMPRE. ──────────────────────────
       ⚠️⚠️ ES LA REGLA 1 DE chequeo/muestra.js Y FALLA SOLA.
       LA CAUSA: `.padres` es un grid con `grid-template-columns:168px 168px`,
       DOS columnas FIJAS. Con tres personas cae 2 + 1. No es falta de lugar:
       el marco mide 500 px. Maki lo marcó tres veces. */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important;',
    '  background-color:transparent!important;',   /* ⚠ sin panel atrás: se lee como un bulto */
    '  background-image:none!important;',
    '  border:0!important; box-shadow:none!important;',
    '}',
    P + '.padres .av{ width:104px!important; height:104px!important; }',
    P + '.padres .nm{ font-size:18px!important; font-family:' + DISPLAY + '!important; letter-spacing:.08em!important; }',
    P + '.padres .rel{ font-family:' + SANS + '!important; letter-spacing:.20em!important; text-transform:uppercase!important; font-size:10.5px!important; }',

    /* ── LA RASPADITA ──────────────────────────────────────────────────────
       ⚠️⚠️ SON DOS RAMAS SEPARADAS DEL ÁRBOL:
           #scratchcard
            ├── .rasp-3 > .r3-f     ← las fichas de ABAJO (lo que se revela)
            └── .rasp-zona > canvas ← la TAPA que se raspa   ← ESTA es la que se ve
       `--r3-tapa` la lee `efectos/raspadita.js` desde el CANVAS, y una variable
       de CSS sólo baja a los DESCENDIENTES: hay que declararla en los
       contenedores de LAS DOS ramas o el lienzo nunca la ve.
       ⚠️ Y la FORMA sale de `fx.raspadita.forma`, que ya está en el panel.
          Redondear `.r3-f` por CSS no sirve: es la otra rama. */
    ':is(#cen-nada, .scratch-sec, .rasp-3, .rasp-zona, #scratchcard){',
    '  --r3-tapa:url("' + ZAPA + '");',
    '}',
    /* ⚠️ EL RECUADRO. El motor le pone `background:var(--lino2)` al contenedor.
       Maki ya pidió sacarlo dos veces. Se apaga POR PARTES: el atajo
       `background:` con !important pisa cosas que no queremos pisar. */
    ':is(#cen-nada, .scratchcard){',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:0!important;',
    '  box-shadow:none!important;',
    '}',

    /* ── EL ITINERARIO ─────────────────────────────────────────────────────
       Nada de circulitos: la marca es la zapatilla fotografiada. La colección
       firma `data-marca-propia` y `simbolo-tematica.js` se corre solo.
       ⚠️ VAN LAS LONGHANDS, NUNCA el atajo `background:` con !important: el
          atajo expande TODAS sus longhands y clava `background-position`, y una
          declaración !important de autor le gana a una animación. Así se quedó
          quieta la bola de espejos el 20/9 sin un solo error en consola. */
    P + '.tl > .it::before{',
    '  background-image:url("' + ZAPA + '")!important;',
    '  background-size:contain!important;',
    '  background-repeat:no-repeat!important;',
    '  border-radius:50%!important;',
    '  box-shadow:none!important;',
    '  border:0!important;',
    '  width:24px!important; height:24px!important;',
    '  content:""!important;',
    '}',
    /* ⚠️ LA VÍA EMPIEZA Y TERMINA DONDE ESTÁ LA COSA. Son DOS elementos:
       `.tl::before` es la vía y `.tl-prog` es el relleno que avanza con la hora.
       Recortar sólo el primero deja el bug vivo para un evento ya empezado.
       Los valores los mide `medirVia()` y llegan por variable. */
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  top:var(--cen-tl-ini,6px)!important;',
    '  bottom:var(--cen-tl-fin,6px)!important;',
    '  height:auto!important;',
    '}',
    P + '.tl::before{',
    '  background-image:repeating-linear-gradient(to bottom,',
    '     ' + TINTA3 + ' 0 5px, rgba(0,0,0,0) 5px 12px)!important;',
    '  background-color:transparent!important;',
    '  width:1px!important;',
    '}',

    /* ── LA TAPA DEL VIDEO Y DE LA PLAYLIST ────────────────────────────────
       ⚠️ LA TAPA NO ES UN RECTÁNGULO: va transparente, con el iframe en
          visibility:hidden (eso lo hace el motor). */
    P + '.rd-tapa, ' + P + '.sp-tapa{',
    '  background-color:transparent!important;',
    '  background-image:url("' + ZAPA + '")!important;',
    '  background-size:78px 78px!important;',
    '  background-position:center!important;',
    '  background-repeat:no-repeat!important;',
    '}',

    /* ── LA PERILLA DEL SÍ / NO ────────────────────────────────────────────
       ⚠️ El área de toque se mide: mínimo 44 px. La pastilla mide 77, o sea 38
          por mitad — por eso Maki dijo «me costó mucho poner que sí». Acá sólo
          se viste la perilla con la pieza; el área la arregla el motor. */
    P + '.si .knob, ' + P + '.no .knob, ' + P + '.mitad .knob{',
    '  background-image:url("' + ZAPA + '")!important;',
    '  background-size:cover!important;',
    '  background-color:transparent!important;',
    '}',

    /* ── LA CARTA ──────────────────────────────────────────────────────────
       ⚠️ LA HOJA DE LA CARTA TAMBIÉN ES SUPERFICIE: `.cf-letter` trae el papel
          clavado en el motor. Acá va el papel de Cenicienta. */
    P + '.cf-letter{',
    '  background-color:' + PAPEL2 + '!important;',
    '  color:' + TINTA + '!important;',
    '  font-family:' + SANS + '!important;',
    '}',
    P + '.cf-letter h3, ' + P + '.cf-letter .cf-tit{',
    '  font-family:' + DISPLAY + '!important;',
    '  letter-spacing:.16em!important; text-transform:uppercase!important;',
    '  color:' + TINTA + '!important;',
    '}',

    /* ── EL ADORNO DE LOS TÍTULOS ──────────────────────────────────────────
       Se apaga el SVG de los dos anillos y se pone el cristal de hielo. */
    P + '.adorno > svg{ display:none!important; }',
    P + '.adorno{',
    '  background-image:url("' + ADORNO + '")!important;',
    '  background-size:contain!important;',
    '  background-position:center!important;',
    '  background-repeat:no-repeat!important;',
    '}',

    /* ── FILETES Y ADORNOS ─────────────────────────────────────────────────
       TINTA3 da 1,20 sobre el fondo: es un filete, NUNCA un texto. */
    P + '.frame hr, ' + P + '.frame .linea, ' + P + '.frame .adorno::before, ' + P + '.frame .adorno::after{',
    '  background-color:' + TINTA3 + '!important; border-color:' + TINTA3 + '!important;',
    '}',

    /* ⚠️ NO se pinta fondo/borde/sombra de los botones: eso lo hace
       `efectos/botones.js` con el material de `fx.boton.estilo` (acá: cristal).
       Si la colección lo pinta, le pisa el material y queda plano. Marfil borró
       todas sus reglas de píldora por esto. Sólo va la tipografía. */
    P + '.btn, ' + P + '#btn-ingresar, ' + P + '.wsp, ' + P + '.tv-btn, ' + P + '.inv-prev-btn{',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.22em!important; text-indent:.22em!important;',
    '  text-transform:uppercase!important;',
    '  font-size:12px!important;',
    '}',

    /* ── LOS TRES COLORES CLAVADOS A MANO ──────────────────────────────────
       `i/estilos-servidor.css` fija tres marrones con `!important` en :root
       para rescatar el contraste del molde viejo:
           --sage: #7d5f34 · .ivcal-kick: #7d5f34 · .banco .copy: #7d5f34
       La paleta gana en las variables, pero esas dos reglas de clase no las
       toca nadie. Acá se las pisa con la misma fuerza y más especificidad.
       #22344A sobre el papel da 12,1: muy por encima del piso. */
    P + '.ivcal-kick, ' + P + '.banco .copy{',
    '  color:' + TINTA2 + '!important;',
    '  -webkit-text-fill-color:' + TINTA2 + '!important;',
    '}',

    /* ── EL PASE, MEDIDO SOBRE SU PROPIA FOTO ──────────────────────────────
       El damasco de hielo que va de fondo del pase NO es papel: medido pixel
       por pixel sobre la imagen de verdad (768x1376, muestreo cada 3 px):

           blanco sobre el damasco  → 1,34 en el peor caso   ILEGIBLE
           #14202E sobre el damasco → 3,64 en el peor caso   TAMPOCO llega

       O sea que ahí no se lee NI claro NI oscuro: la foto tiene rango de sobra
       (p5 0,18 · p95 0,71) y ningún color gana contra las dos puntas. Es el
       error 10 de `reglas-duras`, tal cual. Por eso van dos cosas, no una:

         1. un VELO de papel al 38 % sobre la foto. Con él la foto se sigue
            viendo y el peor caso de #14202E sube a 6,82 (piso 5,0). Medido
            componiendo el velo pixel por pixel, no a ojo.
         2. la tarjeta deja de ser un vidrio (blanco al 7 %, que no tapa nada)
            y pasa a ser PAPEL OPACO. Así el texto cae sobre papel y no sobre
            la foto, y además `chequeo/muestra.js` encuentra un fondo opaco de
            verdad para medir en vez de adivinar. */
    P + '.pase{ position:relative!important; }',
    P + '.pase::after{',
    '  content:""; position:absolute; inset:0; pointer-events:none;',
    '  background:' + PAPEL + '; opacity:.38; z-index:0;',
    '}',
    P + '.pase > *{ position:relative; z-index:1; }',

    /* el sobretítulo en cursiva va sobre el velo, en tinta: 6,82 medido */
    P + '.pase .t{',
    '  color:' + TINTA + '!important;',
    '}',

    P + '.pasecard{',
    '  background:' + PAPEL2 + '!important;',
    '  border:1px solid ' + TINTA3 + '!important;',
    '  box-shadow:0 10px 26px rgba(20,32,46,.14)!important;',
    '}',
    P + '.pasecard .k{ color:' + TINTA2 + '!important; }',
    P + '.pasecard .v{ color:' + TINTA + '!important; }',

    /* el sello del estado venía VERDE (#4d6a4f) del molde: acá es tinta */
    P + '.pasecard .estado{',
    '  background:' + TINTA + '!important; color:' + CREMA + '!important;',
    '  -webkit-text-fill-color:' + CREMA + '!important;',
    '  text-shadow:none!important;',
    '}',

    /* ── LOS CLAROS CÁLIDOS DEL MOLDE ──────────────────────────────────────
       La cuenta regresiva y el cierre venían en cremas cálidas heredadas del
       molde: #FBF7EF, #E7DDC8 y #F5EDDA. Pasan `familia-de-color` porque son
       casi grises, pero adentro del hielo se ven amarillos. Se cambian por el
       mismo brillo en frío. Van ACÁ, en la colección, y no como corrección
       después: `reglas-duras` guarda la tinta de fábrica en `data-regla-orig`
       la PRIMERA vez que mira el elemento y la reusa para siempre. Si el color
       frío no está puesto desde que carga la página, lo que se guarda es el
       crema y el corrector devuelve un marrón. */
    P + '.portada .count .num, ' + P + '.portada .count .sep{',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '}',
    P + '.portada .count .lab{',
    '  color:' + NIEVE + '!important; -webkit-text-fill-color:' + NIEVE + '!important;',
    '}',
    P + '.footer .n, ' + P + '.footer .sm, ' + P + '.col-mvta .col-mvta-t{',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '}',

    /* ── LA SECCIÓN «VERDE» QUE ACÁ NO ES OSCURA ──────────────────────────
       `.sec.verde` es la sección de color del molde y su texto viene pintado
       para fondo OSCURO: crema #D7CEBB y blanco cálido #F7F7F1. Con fondo de
       video la sección se vuelve semitransparente y termina siendo CLARA, así
       que `reglas-duras` oscurece esas dos cremas y devuelve OLIVA
       (117,101,69 · 124,124,71 · 108,108,62). Aparecieron seis de golpe al
       cambiar las fotos de Instagram y del juego.

       Se arregla en el ORIGEN, como en el pase: si la tinta de fábrica ya es
       de la familia, lo que derive el corrector también lo es. Y si en alguna
       invitación esta sección sí queda oscura, `reglas-duras` corrige en las
       DOS direcciones (su error 7) y las aclara sin cambiarles el tono. */
    P + '.sec.verde .reveal:not(.kick){',
    '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
    '}',
    P + '.sec.verde .kick{',
    '  color:' + ACENTO + '!important; -webkit-text-fill-color:' + ACENTO + '!important;',
    '}',

    '@media (prefers-reduced-motion: reduce){',
    P + '.tl::before{ animation:none!important; }',
    '}'

    ].join('\n');
  }

  /* --------------------------------------------------------------- pintar */

  function fuentes() {
    if (document.getElementById('col-cen-fuentes')) return;
    var l = document.createElement('link');
    l.id = 'col-cen-fuentes';
    l.rel = 'stylesheet';
    l.href = FUENTES;
    document.head.appendChild(l);
  }

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    var txt = armarCSS();
    if (s.textContent !== txt) s.textContent = txt;
  }

  /* ⚠️ LA VÍA DEL ITINERARIO NO SE RESUELVE SÓLO CON CSS: dónde cae el centro
     de la primera ficha depende de cuánto mide su texto, y ese texto lo carga
     Jazmín. Se MIDE y se pasa por variable, y se vuelve a medir en cada repaso:
     así sigue bien cuando gira el teléfono o cambia un texto. */
  function medirVia() {
    try {
      var tl = document.querySelector('.tl');
      if (!tl) return;
      var its = tl.querySelectorAll(':scope > .it');
      if (its.length < 2) return;
      var R = tl.getBoundingClientRect();
      var a = its[0].getBoundingClientRect();
      var b = its[its.length - 1].getBoundingClientRect();
      var ini = Math.round(a.top + a.height / 2 - R.top);
      var fin = Math.round(R.bottom - (b.top + b.height / 2));
      if (ini > 0) tl.style.setProperty('--cen-tl-ini', ini + 'px');
      if (fin > 0) tl.style.setProperty('--cen-tl-fin', fin + 'px');
    } catch (e) {}
  }

  /* cuánto de la pantalla ocupa el bloque de la portada. La referencia está
     arriba del 55%. No corrige sola: deja el número a mano para revisarlo.
     `window.INVCENICIENTA.alto()` lo devuelve. */
  function altoPortada() {
    try {
      var c = document.querySelector('.portada > .c');
      if (!c) return null;
      return Math.round(c.getBoundingClientRect().height / window.innerHeight * 100);
    } catch (e) { return null; }
  }

  function poner() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') !== ID) raiz.setAttribute('data-col', ID);
    if (raiz.getAttribute('data-coleccion') !== ID) raiz.setAttribute('data-coleccion', ID);
    /* la colección trae su propia marca (la zapatilla fotografiada): que
       `simbolo-tematica.js` no dibuje su vector encima. */
    if (raiz.getAttribute('data-marca-propia') !== ID) raiz.setAttribute('data-marca-propia', ID);
    window.INVCOLPALETA = PALETA_PROPIA;
    fuentes();
    hoja();
    medirVia();
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') === ID) raiz.removeAttribute('data-col');
    if (raiz.getAttribute('data-coleccion') === ID) raiz.removeAttribute('data-coleccion');
    if (raiz.getAttribute('data-marca-propia') === ID) raiz.removeAttribute('data-marca-propia');
    if (window.INVCOLPALETA === PALETA_PROPIA) { try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; } }
    var s = document.getElementById(ID_CSS);
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }

  /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle (reglas-duras.js
     corre con cada cambio de clase del marco) y un observador dispararía
     decenas de veces por segundo. Un repaso cada 1,2 s alcanza. */
  function sincronizar() { if (activa()) poner(); else sacar(); }

  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  /* para prenderla y apagarla a mano desde la consola, al revisar */
  window.INVCENICIENTA = { poner: poner, sacar: sacar, css: armarCSS, via: medirVia, alto: altoPortada };
})();
