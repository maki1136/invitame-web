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
         ACENTO   #2A4B72 sobre #F2F7FC → 8,30 ✓ (piso 5,0)
         ACENTOCL #A9C3DE sobre #14202E → 9,05 ✓ (piso 5,0)

     ⚠️ EL ACENTO SE OSCURECIÓ AL CAMBIAR EL FONDO. Con el video de escarcha
        detrás y `paso 0.78`, el papel de las secciones deja pasar mucho más
        fondo: medido sobre los 183 cuadros del video ya velado, el 5 % más
        oscuro del fondo queda en L 0,539. Ahí el #3A5C80 daba **3,90** y el
        sobretítulo va en 26 px, o sea piso 4,0 — pasaba raspando y en los
        peores píxeles no pasaba. #2A4B72 da **5,02**: entra incluso con el
        piso de texto chico. Sobre el papel mejora también (6,45 → 8,30). */
  var ACENTO   = '#2A4B72';
  var ACENTOCL = '#A9C3DE';

  /* el claro de la nieve: mismo brillo que la crema del molde (L 0,75) pero
     frío, para los textos que van sobre el video y sobre la foto del cierre.
     El molde traía #E7DDC8 y #F5EDDA, que son cremas CÁLIDAS.
     ⚠️ Queda a mano pero HOY NO SE USA EN NINGÚN TEXTO: los rótulos de la
        cuenta, que eran su único cliente, pasaron a CREMA por contraste
        medido (ver abajo). Si vuelve a usarse, medir primero. */
  var NIEVE = '#DCE8F4';   /* eslint-disable-line no-unused-vars */

  /* la pieza fotografiada: la MISMA url en los cuatro lugares
     (itinerario, tapa de la playlist, perilla del sí/no, tapa de la raspadita) */
  var ZAPA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1790008396/invitame/cenicienta/hpauay94v5mxookjs8bk.webp';

  /* ⚠️⚠️ LA TAPA DE LA RASPADITA VA APARTE, Y OPACA.
     Maki: «está buena la raspada pero se ve atrás el número; respetá los
     zapatos pero ponele relleno».
     La causa: `raspadita.js` pinta la tapa en un CANVAS y hace `clearRect` y
     después `drawImage` — no rellena nada debajo. La zapatilla es un WebP con
     transparencia, así que por todo lo que no es zapato se veía la fecha.
     No se toca el motor por esto: el contrato del módulo es que la colección
     escribe `--r3-tapa` y él obedece. Se le da una imagen que YA es opaca:
     la misma zapatilla sobre un disco de plata helada, 560x560, sin alfa.

     ⚠️⚠️ Y EL DISCO TIENE QUE SER DEL COLOR DEL PAPEL, NO DE PLATA.
        Maki, 21/9: «te quedaron de distinto color la raspada». Tenía razón: el
        disco era plata azulada (#A9C3DE aprox) adentro de una sección de papel
        casi blanco, así que las tres celdas se leían como tres botones pegados
        encima de la hoja. Ahora el disco es el PAPEL de la colección (#F2F7FC)
        con un aro finito de plata al 2 px: la tapa desaparece dentro de la
        sección y lo único que se ve es la zapatilla. */
  var ZAPA_TAPA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1790042763/invitame/cenicienta/r4xrrssvctkpm1dvwzdw.jpg';

  /* y la MARCA DEL ITINERARIO también va sobre un disco, pero CLARO: a 22 px
     el disco de plata de la raspadita se leía como una canica azul. Este es la
     misma zapatilla sobre papel helado, con el aro de plata puesto por CSS. */
  var ZAPA_MARCA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1790018745/invitame/cenicienta/i4ibdbc6f96mzztf6clq.jpg';

  /* ⚠️ Y LA ZAPATILLA VA GRANDE ADENTRO DEL DISCO (86% del lado). La primera
     versión la puso al 62% y en pantalla se veía chiquita: `raspadita.js`
     escala la imagen como `cover` dentro de una zona ANCHA (298x156 medidos) y
     después la recorta al círculo, así que de los 560 px sólo se ve la franja
     del medio. Lo que manda no es el tamaño del archivo: es cuánto ocupa la
     pieza DENTRO de él. */

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
    "<g fill='none' stroke='%232A4B72' stroke-width='1.1' stroke-linecap='round'>" +
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
    '--sec-col':   PAPEL,
    '--sec-col-v': TINTA,
    '--sage':      ACENTO,
    '--sage-cl':   ACENTOCL,
    '--oro':       PLATA
  };

  /* ⚠️ `--sec-col` TAMBIÉN SE RECLAMA, Y NO ES DETALLE.
     Es el papel de las secciones CLARAS: `fondo-invitacion.js` las pinta con
     `color-mix(--sec-col, transparent, --inv-paso)`. Venía del molde en
     **#e5ebe8**, que es un gris VERDOSO (229,235,232). Pasa `familia-de-color`
     porque es casi gris, pero adentro de una colección de hielo el papel de
     TODAS las secciones claras tenía tinte verde — y con él se pintan también
     los agujeros del troquel del Pase con voz, que por contrato usan
     `var(--sec-col)` para leerse como un recorte. Ahora es el papel de la
     colección. */

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

    /* ── LA ESCALA DE TEXTO ES LA DE PERLAS ────────────────────────────────
       Maki: «todos los textos están muy grandes, grotescos; acomodá eso a la
       normalidad de Perlas».
       Medido en vivo sobre Perlas (`camila-y-tomas`, ventana 1440x645):

           sobretítulo `.kick`   24 px · CURSIVA, sin versalitas ni espaciado
           título      `h2`      33 px · romana con .2em
           bajada      `.sub`    13 px
           botones     `.btn`     9 px
           cuenta      `.num`    44 px  ·  rótulos `.lab` 9 px

       Cenicienta tenía la jerarquía DADA VUELTA: el sobretítulo en 34 px de
       sans en versalitas con .28em, o sea MÁS GRANDE que el título. Cada
       sección gritaba dos veces. Ahora el sobretítulo es la misma cursiva del
       nombre de la portada —igual que Perlas, que usa Great Vibes— y el
       título es la romana espaciada. */
    P + '.sec .kick, ' + P + '.frame .kick{',
    '  font-family:' + SCRIPT + '!important;',
    '  font-size:clamp(20px,5.4vw,26px)!important;',
    '  font-weight:400!important;',
    '  letter-spacing:0!important; text-indent:0!important;',
    '  text-transform:none!important;',
    '  line-height:1.2!important;',
    '  margin-bottom:.15em!important;',
    '}',
    P + '.sec h2{',
    '  font-size:clamp(24px,6.4vw,33px)!important;',
    '  letter-spacing:.2em!important; text-indent:.2em!important;',
    '}',
    P + '.count .lab{ font-size:9px!important; letter-spacing:.2em!important; }',

    /* ── LA PORTADA ────────────────────────────────────────────────────────
       ⚠️⚠️ LOS TAMAÑOS SE GANAN POR ID. `i/estilos-servidor.css` tiene, con
       !important y selector de ID:
           #pv-names{ font-size:var(--fs-nombres,54px)!important }
           #pv-kick { font-size:var(--fs-kicker,15px) !important }
       Un ID (1,0,0) le gana a cualquier `html[data-x] .portada .names` (0,3,0).
       ⚠️⚠️ EL CRITERIO DE LA PORTADA ES EL DE PERLAS, NO EL DE DISCO.
          La primera versión llevaba el bloque al 55% de la pantalla con el
          nombre en 186 px. Maki: «dejaste como regla los textos de la portada
          como la de Disco, pero ese era sólo para Disco; quiero que respetes
          como estaba Perlas».
          Así que el número no se eligió: se MIDIÓ sobre Perlas en vivo
          (`camila-y-tomas`, misma ventana de 1440x645):

              bloque de la portada  37% de la pantalla
              nombre                54 px   ·  sobretítulo 11 px
              fecha                 12 px   ·  cuenta regresiva 44 px
              letra del sobretítulo .34em de espaciado

          Acá el nombre es una CURSIVA y no una romana en versalitas, así que
          al mismo cuerpo se ve mucho más chico: con los valores de abajo el
          bloque da **39%**, medido con `INVCENICIENTA.alto()` — dos puntos de
          Perlas, no veinte. La cuenta regresiva queda como viene del motor
          (`.count .num`), que es exactamente lo que hace Perlas.
          Y la cola de la cursiva sigue entrando: el `padding-bottom` es
          proporcional al cuerpo (.24em), así que al achicar el nombre achica
          con él. */
    /* ⚠️⚠️ EL BLOQUE VA ABAJO, NO AL MEDIO. Maki, mirando la portada:
       «fijate en la portada, está lavando la cara justamente».
       Tenía razón y eran dos cosas a la vez: el bloque centrado dejaba el
       nombre ENCIMA de la cara, y el velo era un óvalo oscuro puesto en el
       CENTRO — o sea, justo sobre la cara. Perlas no hace nada de eso: el
       bloque vive en el tercio de abajo y la foto queda limpia.
       Acá se copia ese criterio: bloque abajo y el velo pasa a ser un
       degradado que sube DESDE EL PIE, como un afiche. La cara no se toca. */
    P + '.portada{ justify-content:flex-end!important; }',

    /* el velo: radial, en un ::before del BLOQUE. Pseudo hermano, no ancestro,
       así no le ensucia la cuenta del contraste a reglas-duras.js. Una banda
       recta se vería como una barra gris cruzando la foto. */
    P + '.portada > .c{ position:relative!important; padding:0 6vw 7vh!important; }',
    P + '.portada > .c::before{',
    '  content:""; position:absolute; left:50%; top:auto; bottom:-16vh;',
    '  transform:translateX(-50%); width:200%; height:82vh;',
    '  background:linear-gradient(to bottom,',
    '     rgba(8,16,28,0) 0%, rgba(8,16,28,.14) 34%,',
    '     rgba(8,16,28,.52) 66%, rgba(8,16,28,.74) 100%);',
    '  pointer-events:none; z-index:0;',
    '}',
    P + '.portada > .c > *{ position:relative!important; z-index:1!important; }',

    /* el sobretítulo: «MIS XV», chiquito y muy abierto */
    P + '.portada #pv-kick{',
    '  font-family:' + SANS + '!important;',
    '  font-size:clamp(10px,2.9vw,12px)!important;',
    '  font-weight:400!important;',
    '  letter-spacing:.34em!important; text-indent:.34em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  line-height:1.4!important;',
    '  margin:0 0 .55em 0!important;',
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
    /* ⚠⚠ 84 px TAPABAN LA CARA. Maki, 21/9: «la portada está tapada por los
       textos, no los acomodaste bien». Medido con la vara de la skill de
       entrega (§7bis), que toma Campestre de referencia: su bloque va del
       **56 % al 91 %** de la portada. El mío iba del **46 % al 91 %** — diez
       puntos más arriba, o sea adentro de la cara.
       Probados 56 / 52 / 48 / 44 px midiendo el bloque en cada uno:
           56 px → 54 %   52 px → 55 %   **48 px → 56 %**   44 px → 57 %
       48 px es el que da EXACTO el número de Campestre. Y el `39 %` que había
       anotado la ronda anterior estaba mal medido: en esta ventana daba 45 %. */
    '  font-size:clamp(34px,8.3vw,48px)!important;',
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
    '  font-size:clamp(10px,2.6vw,11.5px)!important;',
    '  letter-spacing:.26em!important; text-indent:.26em!important;',
    '  color:' + CREMA + '!important;',
    '  text-shadow:0 1px 3px rgba(6,12,22,.85)!important;',
    '  margin-top:1.1em!important;',
    '}',
    /* la cuenta regresiva, también grande: suma al % que ocupa el bloque */
    P + '.portada .cd, ' + P + '.portada .ivf{ margin-top:.55em!important; }',
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
    '  --r3-tapa:url("' + ZAPA_TAPA + '");',
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
    /* ⚠️⚠️ EL MARCADOR SE CENTRA EN EL HILO, Y SU GEOMETRÍA VA CON SU TAMAÑO.
       El motor pone los marcadores con `right:-31px` / `left:-31px` y
       `margin-top:-5.5px`, números calculados para SU marcador de 11 px: la
       separación del texto a la línea del medio es de 26 px, así que el centro
       cae en `tamaño/2 + 26`. Acá la pieza mide 22, entonces van -37 y -11.
       La primera versión sólo cambiaba el `width`/`height` y dejaba los
       números del motor: las zapatillas quedaban colgadas a un costado del
       hilo y encima del texto. Es la misma cuenta que hizo Disco para su bola.

       Y la pieza va sobre disco CLARO con aro de plata: la foto de un zapato
       de cristal transparente, a 22 px y sin fondo, es una mancha gris. */
    P + '.tl > .it::before{',
    '  background-image:url("' + ZAPA_MARCA + '")!important;',
    '  background-size:cover!important;',
    '  background-position:center!important;',
    '  background-repeat:no-repeat!important;',
    '  border-radius:50%!important;',
    '  border:0!important;',
    '  box-shadow:0 0 0 1px rgba(143,179,217,.9), 0 1px 5px rgba(20,32,46,.14)!important;',
    '  width:22px!important; height:22px!important;',
    '  content:""!important;',
    '}',
    P + '.tl.tl-centro > .it:nth-child(odd)::before{',
    '  right:-37px!important; left:auto!important; margin-top:-11px!important;',
    '}',
    P + '.tl.tl-centro > .it:nth-child(even)::before{',
    '  left:-37px!important; right:auto!important; margin-top:-11px!important;',
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
    /* ── EL ITINERARIO NO LLEVA LÍNEA ──────────────────────────────────────
       Maki, 21/9, después de dos intentos: «la línea del itinerario es
       horrible. Horrible. Y ya te dije, quiero que vayan apareciendo las
       palabras de izquierda a derecha y de derecha a izquierda. Que entre el
       18 horas misa de acción de gracias y que entre el 19:30 recepción, y que
       se vayan poniendo los puntitos. Y sacale la línea esa; si querés ponerle
       unos, como hiciste con la otra, que había quedado bien.»

       «La otra que había quedado bien» es PERLAS: ahí la línea del itinerario
       no es una línea, es una HEBRA DE PERLAS (`efectos/itinerario-perlas.js`,
       2/9). Acá se copia ese criterio con el material de esta colección: un
       rosario de cuentas de hielo, con aire entre una y otra, para que se lea
       como un collar y no como una regla.

       ⚠️ LA LECCIÓN DE PERLAS, QUE ACÁ TAMBIÉN APLICA: la cuenta del hilo
          tiene que ser MUCHO más chica que la marca de cada momento, o las dos
          se ven amontonadas. En Perlas fueron 7 px de hilo contra 17 de marca.
          Acá la marca es la zapatilla de 22 px → la cuenta va en 6, cada 22.
          Probado en vivo: con 17 de paso las cuentas se tocaban y volvía a
          leerse como una raya punteada. Con 22 se lee el aire entre una y otra.
       ⚠️ Y VAN EN EL MISMO EJE. La marca impar tiene `right:-37px` sobre un
          item de `calc(50% - 26px)`: su borde derecho cae en 50 % + 11 y mide
          22, así que su centro está EXACTO en el 50 %. El hilo va centrado ahí
          con `margin-left:-3.5px`.

       ⚠️ `.tl-prog` (la barra de avance) se apaga del todo: sin línea no hay
          nada que rellenar, y encima venía en gris verdoso del molde. */
    P + '.tl::before{',
    '  width:7px!important; left:50%!important; margin-left:-3.5px!important;',
    '  opacity:.9!important;',
    '  animation:none!important;',
    '  background-color:transparent!important;',
    '  background-image:radial-gradient(circle 3px at 2.5px 2.2px,',
    '     rgba(255,255,255,1) 0 16%, rgba(206,226,244,.99) 52%,',
    '     rgba(126,157,187,.95) 90%, rgba(126,157,187,0) 100%)!important;',
    '  background-size:7px 22px!important;',
    '  background-repeat:repeat-y!important;',
    '  background-position:50% 0!important;',
    '  filter:drop-shadow(0 1px 1.5px rgba(20,32,46,.22))!important;',
    '  -webkit-mask-image:linear-gradient(to bottom, transparent 0, #000 7%,',
    '     #000 93%, transparent 100%)!important;',
    '  mask-image:linear-gradient(to bottom, transparent 0, #000 7%,',
    '     #000 93%, transparent 100%)!important;',
    '}',
    P + '.tl .tl-prog, ' + P + '.tl > .tl-prog{ display:none!important; }',

    /* ── Y LAS PALABRAS ENTRAN DE COSTADO, UNA POR UNA ─────────────────────
       El motor YA las hace entrar de a una (un IntersectionObserver por
       momento en `efectos/itinerario.js`) y YA alterna el lado… pero con
       `translate(∓14px, 26px)`: 14 px de corrimiento no se ven. Lo que se
       notaba era el salto vertical, no el lado.

       Acá el corrimiento pasa a ser HORIZONTAL y grande: el momento de la
       izquierda entra desde la izquierda y el de la derecha desde la derecha,
       que es lo que pidió Maki. Y el puntito aterriza DESPUÉS del texto
       (0,34 s de espera), así se ve «llegó la hora y después se marcó».

       ⚠️ `overflow-x:clip` en `.tl`: 52 px hacia afuera de un item que ya mide
          `calc(50% - 26px)` se salen del marco y aparecería una barra
          horizontal. `clip` recorta sin crear contenedor de scroll, así que no
          rompe el `position:sticky` de nada. */
    P + '.tl{ overflow-x:clip!important; }',
    P + '.tl.tl-anim > .it{',
    '  transition:opacity .7s ease, transform .9s cubic-bezier(.22,.72,.28,1)!important;',
    '}',
    P + '.tl.tl-centro > .it:nth-child(odd){ transform:translate(-52px,0)!important; }',
    P + '.tl.tl-centro > .it:nth-child(even){ transform:translate(52px,0)!important; }',
    P + '.tl.tl-centro > .it:nth-child(odd).on, ' + P + '.tl.tl-centro > .it:nth-child(even).on{',
    '  transform:translate(0,0)!important;',
    '}',
    P + '.tl.tl-anim > .it::before{',
    '  transition:transform .5s cubic-bezier(.3,1.55,.5,1) .34s,',
    '             opacity .3s ease .34s!important;',
    '}',

    /* ── EL HUECO BLANCO ENTRE DOS SECCIONES ──────────────────────────────
       ⭐ 22/9 · Maki: «mira el hueco que queda blanco entre las dos secciones».
       NO era un hueco de geometria: medidas las 21 secciones, todas pegadas,
       cero pixeles de separacion. Era un hueco de COLOR: `#video-sec` y
       `#spotify-sec` salen las dos con el tono claro, una abajo de la otra.
       Entre el final del contenido del video y el adorno de la playlist quedan
       48 px de padding + 48 px de padding + 40 px de adorno = ~140 px de papel
       identico sin una sola costura. El ojo no lee dos secciones: lee un pozo.
       Lo mismo pasa al final, donde hay CINCO claras seguidas
       (share · filtro · galeria · pase · contacto).
       El molde alterna claro/color, pero las secciones condicionales —las que
       aparecen solo si el evento las carga— le rompen la cuenta.
       Se arregla con `rayar()`: recorre las secciones VISIBLES y, cuando una
       repite el tono de la anterior, le cuelga `data-cen-tono` con el contrario.
       No toca clases (`reglas-duras.js` cachea la tinta por elemento y le
       cambiariamos el original); solo pinta el fondo. */
    P + 'section.sec[data-cen-tono="B"]{',
    '  background-color:rgba(219,233,247,.28)!important;',
    '  background-image:none!important;',
    '}',
    P + 'section.sec[data-cen-tono="A"]{',
    '  background-color:rgba(242,247,252,.22)!important;',
    '}',

    /* ── LA TAPA DEL VIDEO Y DE LA PLAYLIST ────────────────────────────────
       ⚠️ LA TAPA NO ES UN RECTÁNGULO: va transparente, con el iframe en
          visibility:hidden (eso lo hace el motor). */
    /* ⚠️ EL ZAPATO NO VA EN EL CENTRO: ahí está el círculo del play.
       Maki: «el play con el zapato de la playlist quedaron juntos medio raro».
       Los dos median lo mismo y se pisaban. La tapa es ancha (392 px medidos),
       así que la pieza se corre a la izquierda y el play se queda solo en el
       medio: quedan como un emblema y su botón, no como dos íconos peleando. */
    P + '.rd-tapa, ' + P + '.sp-tapa{',
    '  background-color:transparent!important;',
    '  background-image:url("' + ZAPA + '")!important;',
    '  background-size:60px 60px!important;',
    '  background-position:12px 40%!important;',
    '  background-repeat:no-repeat!important;',
    '}',

    /* ⭐ 22/9 · MEDIDO, no a ojo. Maki, por tercera vez: «el zapato sigue
       chocando con el play y el texto de la playlist».
       Las dos tejas, medidas en un telefono de 390 px:
         playlist  326x156  ·  aro en x 132-194 (y 35-97)  ·  rotulo en y 107
         video     334x192  ·  aro en x 136-198 (y 53-115) ·  rotulo en y 125
       Con 66px al 30% el zapato caia en x 78-144: se metia 12 px DENTRO del aro,
       y abajo llegaba a y 106 con el rotulo arrancando en 107 — pegados.
       Ahora: 60 px anclado a 12 px del borde izquierdo (pixeles, no porcentaje:
       el porcentaje se corre solo cuando la teja se angosta).
         x 12-72   -> al aro le quedan 60 px de aire en la playlist, 64 en el video
         y (playlist) 38-98  -> 9 px libres antes del rotulo
         y (video)    53-113 -> 12 px libres antes del rotulo
       El ancla en pixeles aguanta hasta tejas de 200 px de ancho. */

    /* ⚠⚠ `.rd-tapa` ES LA TAPA DEL VIDEO **Y** LA DE LA PLAYLIST.
       No existe `.sp-tapa`: las dos piezas usan la MISMA clase. El 21/9 le puse
       a `.rd-tapa` una zapatilla de 132 px centrada porque el panel del video
       medía 418x747 y con 66 px quedaba una mancha chiquita en medio de una
       hoja vacía — y con eso rompí la playlist, que mide 392x156: la zapatilla
       se salió de la teja y el play y el rótulo le quedaron encima. Maki lo vio
       de una: «mirá la playlist».

       ⭐ El panel vacío NO era un problema de tamaño de la pieza: era que el
          video estaba en 9:16. Con la película en **16:9** el panel pasa a
          418x239 — la misma proporción que la teja de la playlist— y las dos
          se resuelven con la MISMA regla de 66 px que Maki ya había aprobado.
          Medido: 747 px de alto → 239.

       ⚠️ LA LECCIÓN, que ya estaba escrita en la skill de entrega y no la
          apliqué: **cuando se le agrega una regla a un selector, hay que mirar
          QUÉ MÁS entra en ese selector.** */

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
    '  letter-spacing:.18em!important; text-indent:.18em!important;',
    '  text-transform:uppercase!important;',
    '  font-size:10px!important;',
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

    /* ⚠️ Y EL COLOR DE FONDO DE LA SECCIÓN SE DECLARA POR LO QUE SE VE.
       `.pase` venía con `background-color: #14202E` (tinta) debajo de la foto.
       Invisible en pantalla —la foto la tapa entera— pero es lo que encuentran
       los que miden subiendo por los padres: `chequeo/muestra.js` leía tinta
       sobre tinta y daba 1,00 en el sobretítulo, que en pantalla se lee
       perfecto. El fondo REAL debajo de ese texto, medido por `reglas-duras`
       sobre los píxeles con el velo puesto, es (162,182,190). Se declara ése:
       no cambia nada de lo que se ve y deja de mentirle al que mide.
       #14202E sobre #A2B6BE da 7,82 y #22344A da 6,01. */
    P + '.frame .pase{ background-color:#A2B6BE!important; }',

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
    /* ⚠️ LOS RÓTULOS DE LA CUENTA VAN EN CREMA, NO EN NIEVE.
       Medido sobre la foto de la portada ya compuesta con los dos velos: a
       9 px el piso del chequeo es 5,0 y #DCE8F4 daba 4,07 — justo abajo. La
       crema sube el claro y la sombra propia le tapa los píxeles más claros
       de la nieve. El resto del bloque (nombre 10,9 · sobretítulo 10,8 ·
       números 4,6 con piso 4,0) ya entraba. */
    P + '.portada .count .lab{',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  text-shadow:0 1px 3px rgba(6,12,22,.9), 0 0 10px rgba(6,12,22,.6)!important;',
    '}',
    P + '.footer .n, ' + P + '.footer .sm, ' + P + '.col-mvta .col-mvta-t{',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '}',

    /* ── EL PASE CON VOZ ──────────────────────────────────────────────────
       El boleto lo arma `efectos/pase-voz.js` y sus colores salen de
       `fx.pasevoz` (papel #DCE8F4 · tinta #14202E · acento #2A4B72: 7,19 sobre
       el papel, medido). Lo único que la colección corrige son los rótulos
       CHICOS, y es un defecto de plataforma, no de esta colección:

       `pase-voz.js` pinta `.pv-datos dt` y `.pv-nota dt` con
           color-mix(in srgb, var(--pv-tinta) 58%, transparent)
       o sea la tinta al 58 % sobre el papel. Compuesto pixel a pixel sobre
       #DCE8F4 eso da **3,84**, con el cuerpo en 7,5 px — piso 5,0. Son
       «FECHA» y «HORA», las dos palabras que el invitado va a buscar.
       El chequeo no los canta porque su regla de contraste saltea las piezas
       muy chicas, así que esto sale de medirlo a mano.

       ⚠️ El arreglo de fondo va en `efectos/pase-voz.js` —le pasa a TODAS las
          invitaciones con pase— pero ese archivo lo está tocando otra charla.
          Mientras tanto se corrige acá, que es la capa de la colección, igual
          que se hizo con los tres marrones de `estilos-servidor.css`.
          #22344A sobre #DCE8F4 da **10,19**. */
    P + '#pv-sec .pv-datos dt, ' + P + '#pv-sec .pv-nota dt{',
    '  color:' + TINTA2 + '!important;',
    '  -webkit-text-fill-color:' + TINTA2 + '!important;',
    '}',

    /* ── EL FORMULARIO DE CONFIRMAR, QUE VENÍA PINTADO PARA FONDO OSCURO ──
       Maki, 21/9: «no se ven los recuadros». Medido en vivo, `form.rsvpform`
       sale de fábrica así:

           input / select / textarea   fondo  rgba(255,255,255,.08)
                                      borde  rgba(255,255,255,.25)
                                      tinta  #FFFFFF
           label                       #A9C3DE  (ése es `--sage-cl`, el acento
                                      para fondo OSCURO)

       O sea: blanco al 25 % sobre un papel casi blanco. El borde no existe y el
       rótulo apenas se adivina. Es la MISMA familia de error que `.sec.verde`
       —texto pintado para una sección oscura que acá termina siendo clara— y
       se arregla igual: en el ORIGEN, no dejando que lo derive el corrector.

       ⚠️ El chequeo no lo canta: su regla de contraste mira TEXTO, y acá lo
          que no se veía era el BORDE de una caja. **Un borde invisible no es un
          problema de contraste de texto: hay que mirarlo.** */
    P + '.rsvpform label{',
    '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
    '}',
    P + '.rsvpform input, ' + P + '.rsvpform select, ' + P + '.rsvpform textarea{',
    '  background-color:rgba(250,252,254,.90)!important;',
    '  border-color:' + TINTA3 + '!important;',
    '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
    '}',
    P + '.rsvpform ::placeholder{',
    '  color:' + TINTA3 + '!important; -webkit-text-fill-color:' + TINTA3 + '!important;',
    '  opacity:1!important;',
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
    P + '.tl.tl-centro > .it:nth-child(odd), ' + P + '.tl.tl-centro > .it:nth-child(even){',
    '  transform:none!important;',
    '}',
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

  /* recorre las secciones visibles y le da vuelta el tono a la que repite el
     de la anterior. Corre dentro de `poner()`, o sea cada 1,2 s junto con el
     resto: alcanza y no necesita observador. */
  function rayar() {
    try {
      var secs = [].slice.call(document.querySelectorAll('section.sec'))
        .filter(function (s) { return s.offsetHeight > 40 && s.offsetParent !== null; });
      var previo = null;
      for (var k = 0; k < secs.length; k++) {
        var s = secs[k];
        var tono = s.classList.contains('verde') ? 'B' : 'A';
        if (previo === null) { if (s.getAttribute('data-cen-tono')) s.removeAttribute('data-cen-tono'); previo = tono; continue; }
        if (tono === previo) {
          var vuelta = (tono === 'A') ? 'B' : 'A';
          if (s.getAttribute('data-cen-tono') !== vuelta) s.setAttribute('data-cen-tono', vuelta);
          previo = vuelta;
        } else {
          if (s.getAttribute('data-cen-tono')) s.removeAttribute('data-cen-tono');
          previo = tono;
        }
      }
    } catch (e) {}
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
    rayar();
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') === ID) raiz.removeAttribute('data-col');
    if (raiz.getAttribute('data-coleccion') === ID) raiz.removeAttribute('data-coleccion');
    if (raiz.getAttribute('data-marca-propia') === ID) raiz.removeAttribute('data-marca-propia');
    if (window.INVCOLPALETA === PALETA_PROPIA) { try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; } }
    var s = document.getElementById(ID_CSS);
    if (s && s.parentNode) s.parentNode.removeChild(s);
    [].forEach.call(document.querySelectorAll('[data-cen-tono]'), function (x) { x.removeAttribute('data-cen-tono'); });
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
  window.INVCENICIENTA = { poner: poner, sacar: sacar, css: armarCSS, via: medirVia, alto: altoPortada, rayar: rayar };
})();
