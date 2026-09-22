/* ===== COLECCIÓN «BOHEMIA» ===================================================

   Boho chic. Nace de una referencia que mandó Maki el 21/9/2026:
   `invitameok.com/bohemia-bohochic/64a78745` — una boda en San Miguel de
   Allende hecha con la plataforma VIEJA: 19 secciones, cero video, todo
   estático. El pedido fue textual: «hay que hacer algo como esto pero con
   nuestra plataforma nueva, con movimiento, video, etc.».

   ⭐ QUÉ LA HACE DISTINTA DE LAS OTRAS  (regla de Maki del 16/9: «si vas a
      hacer lo mismo, ¿cuál es la gracia de tener diferentes muestras?»):

        · NO LLEVA CURSIVA. Ni una letra. Perlas, Marfil y la de Martina son
          todas de script, Campestre trae Sacramento y Disco Neón va en cromado
          cursivo. Acá los nombres van en BODONI MODA, versalitas.
        · La tinta es MARRÓN CÁLIDO y el acento es CAMEL (#A87D5A, medido de la
          referencia).
        · El fondo es un VIDEO de plumas de pampa meciéndose.
        · El itinerario va CENTRADO, con las fichas alternando lado, y su
          vía es una REGLETA DE CUENTAS finita en camel con la misma HOJA de
          los títulos por marca. La rosa fotografiada se queda donde es un
          objeto de verdad: la tapa de la playlist y la tapa de la raspadita.
        · El botón va en RELIEVE SECO (letterpress).

   ⚠️⚠️ NO LLEVAR CURSIVA TIENE UN PRECIO QUE HAY QUE PAGAR A MANO: TODA LA
      ESCALA DEL MOTOR ESTÁ CALIBRADA PARA UN SCRIPT. Ver el bloque «LA ESCALA
      TIPOGRÁFICA» más abajo. Es el error más caro del 21/9.

   ⚠️⚠️ LOS COLORES ESTÁN MEDIDOS, NO ELEGIDOS DE OJO.
      El papel de la foto base mide (236,209,179). Contra ese papel:
          TINTA  #4A3B2E → 7,33      TINTA2 #5E4B3C → 5,63
          TINTA3 #C7B5A1 → 1,36  ← SÓLO filetes y bordes, NUNCA texto
          CAMEL  #A87D5A → 2,50  ← SÓLO decoración, NUNCA texto
      La primera TINTA2 que probé (#6B5646) daba 4,71 sobre la foto: por debajo
      del piso de 5,0 de la regla 7 del chequeo. Por eso es #5E4B3C.
      Y ojo con la trampa: medir sólo contra el papel CSS miente, porque abajo
      hay una FOTO más oscura. Se mide contra la foto.

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'bohemia'`.
   ⭐ Jazmín la elige desde el selector de `efectos/panel-coleccion.js`.

   ⚠️ LA MUESTRA VA CON LA FECHA EN `circulos`. No es estético: la raspadita
      en modo `partes` tapa las PIEZAS de la fecha, y una disposición que no
      las arma (como `filetes`) la hace caer a una sola zona rectangular.

   ⚠️⚠️ LA PORTADA SE MIDE CONTRA PERLAS, NO SE ELIGE DE OJO. 21/9, Maki:
      «no quiero la portada de disco, quiero los textos y las portadas más de
      Perlas; la cuenta regresiva tiene que estar abajo de todo». Medido en
      vivo: Perlas ocupa el 37% de la pantalla con nombres de 54px; Bohemia
      ocupaba el 54% con 60px y por eso se leía como una portada de Disco. El
      número que manda es el PORCENTAJE, no el font-size.
      ⚠️ Y VA ABAJO, NO AL MEDIO: el bloque arranca al 53% y cierra al 91%,
         como Campestre. Centrado le tapa la cara a la pareja de la foto.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'bohemia';
  var ID_CSS = 'col-bohemia';
  var P      = 'html[data-col="bohemia"][data-coleccion="bohemia"] ';

  /* ---------------------------------------------------------------- paleta */

  var TINTA  = '#4A3B2E';   /* la principal: títulos, nombres, datos */
  var TINTA2 = '#5E4B3C';   /* bajadas y textos secundarios */
  var TINTA3 = '#C7B5A1';   /* SÓLO filetes, bordes y separadores */
  var CAMEL  = '#A87D5A';   /* el acento de la referencia. Decoración. */
  var PAPEL  = '#EFE4D6';
  var PAPEL2 = '#F6EFE5';
  var CREMA  = '#F7F1E7';   /* el texto que va ARRIBA de la tinta */

  /* la pieza fotografiada: la MISMA url en el itinerario, la tapa de la
     playlist y la tapa de la raspadita.
     ⚠️ YA NO va en la perilla del sí/no (Maki, 21/9: «dejale la normal») ni en
        la tapa del video (ahí va el PLAY). */
  var ROSA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1789979950/invitame/piezas/bohemia-rosa.webp';

  /* la viñeta de los títulos: una hoja finita en camel entre dos filetes.
     Va en vector, no en foto: es una viñeta tipográfica, no un objeto. */
  var ADORNO = "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 44'>" +
    "<g fill='none' stroke='%23A87D5A' stroke-width='1.1' stroke-linecap='round'>" +
    "<line x1='10' y1='22' x2='46' y2='22'/>" +
    "<line x1='74' y1='22' x2='110' y2='22'/>" +
    "<path d='M60 11 C67 18 67 26 60 33 C53 26 53 18 60 11 Z'/>" +
    "<line x1='60' y1='14' x2='60' y2='30'/>" +
    "</g></svg>";

  /* ⭐⭐ LA VÍA DEL ITINERARIO Y SU MARCA.
     Maki, 21/9: «a la línea buscale otra vuelta porque queda mal, necesitamos
     algo más con diseño; buscá en otro lado inspiración para estas cosas».

     Lo primero que probé fue un CORDÓN DE YUTE TRENZADO —dos hebras cruzadas—
     con la rosa fotografiada de marca. VISTO EN VIVO no funciona: a 6 px de
     ancho las dos hebras se leen como una CADENA DE ESLABONES, y las rosas
     recortadas parecen calcomanías pegadas encima. Dos objetos distintos
     peleando en la misma columna.

     La vuelta no sale de dibujar otro objeto: sale de lo que la invitación YA
     tiene. Cada título lleva arriba la misma viñeta —una hoja finita en camel
     entre dos filetes—. Ése es el idioma de la pieza. Entonces:

        · la marca de cada hora es ESA MISMA HOJA, sobre un disco de papel que
          le tapa la vía por detrás;
        · la vía es una REGLETA DE CUENTAS: un punto camel cada 9 px, del
          grosor de un filete. Es el recurso de papelería de toda la vida
          (el punteado de una línea de puntos suspensivos), no un objeto.

     Resultado: una sola familia gráfica de arriba abajo, y la vía deja de
     competir con el texto.
     ⚠️ El mosaico es de 9 px → el viaje de la animación es 9 px EXACTOS, o el
        bucle pega un salto visible. */
  var VIA = "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 9'>" +
    "<circle cx='1.5' cy='2.2' r='1.15' fill='%23A87D5A'/>" +
    "</svg>";

  var MARCA = "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" +
    "<circle cx='12' cy='12' r='11.5' fill='%23F6EFE5'/>" +
    "<g fill='none' stroke-linecap='round'>" +
    "<path d='M12 2.8 C16.2 7.7 16.2 16.3 12 21.2 C7.8 16.3 7.8 7.7 12 2.8 Z' stroke='%23A87D5A' stroke-width='1.2'/>" +
    "<line x1='12' y1='5.6' x2='12' y2='18.4' stroke='%23C7B5A1' stroke-width='0.8'/>" +
    "</g></svg>";

  /* ⛔ ESTE PLAY QUEDÓ SIN USAR, Y SE DEJA A PROPÓSITO CON EL CARTEL PUESTO.
     Nació el 21/9 para sacar la rosa estirada de «nuestro video» («ponele algún
     dibujo que coincida con un play y con el estilo»). Pero pintado como
     `background-image` del contenedor quedaba ENCIMA del aro que el motor ya
     dibuja, y Maki lo vio esa misma noche: «está todo superpuesto».
     → No se vuelve a enchufar. Si algún día hace falta otro play, se le cambia
       el COLOR al `.rd-aro` del motor, no se dibuja uno nuevo.
     Se conserva la constante por si sirve de pieza suelta en otro lado. */
  var PLAY = "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>" +
    "<circle cx='48' cy='48' r='43' fill='none' stroke='%23C7B5A1' stroke-width='0.9'/>" +
    "<circle cx='48' cy='48' r='35' fill='none' stroke='%23A87D5A' stroke-width='1.6'/>" +
    "<path d='M41 33 L67 48 L41 63 Z' fill='%23A87D5A'/>" +
    "</svg>";

  /* ⚠️⚠️ LAS VARIABLES QUE BOHEMIA RECLAMA COMO PROPIAS.
     `efectos/paleta.js` reescribe estas variables en el <html> INLINE y con
     !important cada 1,5 s, así que ninguna hoja de estilo le gana. El contrato
     (el mismo que usa Marfil desde el 17/9) es publicar acá la tabla y que la
     paleta pinte ESTOS valores en lugar de los suyos.
     ⚠️ A propósito NO se reclaman `--sage`, `--sage-cl` ni `--oro`: ésos son los
        acentos y ahí manda el color que eligió la pareja. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,
    '--verde2':    '#3A2F25',
    '--muted':     TINTA2,
    '--cream':     CREMA,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col-v': TINTA
  };

  /* ------------------------------------------------------------- tipografía */

  var DISPLAY = '"Bodoni Moda", "Playfair Display", Didot, Georgia, serif';
  var SANS    = '"Karla", "Jost", system-ui, sans-serif';

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
    '  letter-spacing:.14em!important;',
    '  text-transform:uppercase!important;',
    '}',
    P + '.frame .kick, ' + P + '.frame .fecha, ' + P + '.frame .dato{',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.26em!important;',
    '  text-indent:.26em!important;',   /* compensa el espaciado, si no queda corrido */
    '  text-transform:uppercase!important;',
    '}',
    P + '.frame p, ' + P + '.frame li{ font-family:' + SANS + '!important; letter-spacing:.01em!important; }',

    /* ── ⭐⭐ LA ESCALA TIPOGRÁFICA. ES LA CORRECCIÓN MÁS GRANDE DEL DÍA ────
       Maki, 21/9: «los textos están gigantes, tiene que ser más delicado; creo
       que hasta la mitad tendría que ser el texto. Con el corazón lleno; una
       carta para ti, gigante; con cariño te esperamos».

       ⚠️⚠️ NO ES QUE ALGUIEN ELIGIÓ MAL UN TAMAÑO: ES QUE BOHEMIA NO LLEVA
          CURSIVA Y NO REESCRIBIÓ LA ESCALA DEL MOTOR.
          `i/estilos-servidor.css` clava, por clase y con !important:
              .kick              → var(--fs-cursiva, 34px)
              .sec h2            → var(--fs-titulo,  30px)
              .frase             → var(--fs-frase,   26px)
              .sec p:not(.frase) → var(--fs-texto,   16px)
          Esos números están pensados para una CURSIVA. Perlas pone el `.kick`
          en Great Vibes: 34 px de script son delicados. Bohemia lo pasó a
          KARLA VERSALITA con .26em de espaciado, y el mismo número pesa el
          doble al ojo.

       ⚠️ Y LA JERARQUÍA QUEDABA AL REVÉS: el sobretítulo (34) era MÁS GRANDE
          que el título (30). MEDIDO EN VIVO: «Raspa para revelar» ocupaba
          112 px de alto —tres renglones— y «Con cariño, te esperamos» 214 px,
          a 40 px de cuerpo.

       LA ESCALA NUEVA (entre paréntesis, el alto del bloque, medido):
              .kick    34 → 12   (89 → 20 px)
              .sec h2  30 → 21   (112 → 28 px, un solo renglón)
              .frase   26 → 18
              .t       40 → 18   (214 → 26 px)
              .sec p   16 → 16   ← NO se toca, el cuerpo se lee bien

       ⚠️ VAN EN PX PELADOS, NO EN `vw`: el marco mide 500 px fijos en
          escritorio, así que un `vw` se calcula contra la ventana entera y no
          contra la pieza. El motor usa px y Perlas también.
       ⚠️ Y GANAN POR ESPECIFICIDAD, NO tocando `--fs-*`: `efectos/paleta.js`
          reescribe las variables cada 1,5 s. `html[data-col][data-coleccion]
          .frame .kick` es (0,4,1) contra el (0,1,0) de `.kick`.
       ⚠️ `.frame .t` es SÓLO el título del pase: medido, es el único `.t` del
          marco. El itinerario usa otras clases. */
    P + '.frame .kick{ font-size:12px!important; line-height:1.5!important; margin-bottom:.9em!important; }',
    P + '.frame .sec h2, ' + P + '.frame h2{ font-size:21px!important; line-height:1.34!important; }',
    P + '.frame .frase{ font-size:18px!important; line-height:1.62!important; }',
    P + '.frame .t, ' + P + '.pase .t, ' + P + '.pasecard .t{ font-size:18px!important; line-height:1.45!important; }',

    /* ── ⭐⭐⭐ NADA DE CURSIVA. ES LA FIRMA DE LA COLECCIÓN. ──────────────
       MEDIDO EN VIVO EL 21/9: había DOCE lugares en cursiva y la colección no
       los tocaba. Son dos problemas distintos:

       1. `font-style:italic` que pone EL MOTOR en un montón de elementos:
          `.lab` y `label` (los rótulos del formulario), `.k`, `.sub`, `.d`,
          `.rl`, `.sc-mon`, `.scratch-hint` («Desliza el dedo para descubrir»),
          `.rsvp-pie` («Toca tu respuesta») y varios `p` sueltos.
          → Se apaga de raíz con un `*`: es la única forma de no ir
            persiguiendo clases de a una cada vez que el motor agrega otra.
       2. `.t` —el título del pase, «Con cariño, te esperamos»— viene en
          ROUGE SCRIPT, una fuente de puño. Ésa no se arregla con
          `font-style`: hay que cambiarle la familia.

       ⚠️ Y va DESPUÉS de los bloques de tipografía de arriba: con la misma
          especificidad gana la última. */
    P + '.frame *{ font-style:normal!important; }',
    P + '.frame .lab, ' + P + '.frame label, ' + P + '.frame .k, ' + P + '.frame .sub, ' +
      P + '.frame .d, ' + P + '.frame .rl, ' + P + '.frame .sc-mon, ' +
      P + '.frame .scratch-hint, ' + P + '.frame .rsvp-pie{',
    '  font-family:' + SANS + '!important;',
    '  font-style:normal!important;',
    '}',
    /* el título del pase: de puño a versalitas Bodoni */
    P + '.frame .t{',
    '  font-family:' + DISPLAY + '!important;',
    '  font-style:normal!important;',
    '  letter-spacing:.12em!important;',
    '  text-transform:uppercase!important;',
    '}',

    /* ⚠️ lining-nums o «1739» se lee «I739» en una didona */
    P + '.frame{ font-variant-numeric:lining-nums!important; }',

    /* ── LA PORTADA ────────────────────────────────────────────────────────
       ⚠️⚠️ LOS TAMAÑOS DE LA PORTADA SE GANAN POR ID.
       `i/estilos-servidor.css` tiene, con !important y selector de ID:
           #pv-names{ font-size:var(--fs-nombres,54px)!important }
           #pv-kick { font-size:var(--fs-kicker,15px) !important }
       Un ID (1,0,0) le gana a cualquier `html[data-x] .portada .names` (0,3,0).
       Por eso acá se escribe #pv-names / #pv-kick y no la clase. */
    /* ⚠️⚠️ EL BLOQUE VA ABAJO, NO AL MEDIO. 21/9, Maki, con una captura de
       Campestre al lado: «la portada te está quedando en el medio, te dejo un
       ejemplo de cómo va, sin tapar a nadie».
       Centrar el bloque en vertical deja el nombre JUSTO ENCIMA DE LAS CARAS.
       MEDIDO: Campestre usa `justify-content:flex-end` y su bloque va del 56%
       al 91% de la pantalla. Bohemia estaba del 26% al 64% —sobre las caras—
       y con flex-end queda del 53% al 91%: mismo pie, y la pareja libre.
       ⚠️ El `padding:0 26px 58px` que deja ese 9% de aire abajo YA VIENE DEL
          MOTOR, es idéntico en las dos. Lo único que hay que cambiar es el
          justify-content: no se agrega padding propio.
       ⚠️⚠️ Y SI EL BLOQUE IGUAL LES CAE ENCIMA, NO SE MUEVE EL TEXTO: SE MUEVE
          EL ENCUADRE DE LA FOTO. Los campos son `cx`/`cy`/`cz` del evento —el
          control «encuadre» del panel, o sea algo que Jazmín maneja sola—. En
          `julia-y-santiago` estaba en cy 44 y la pareja caía justo detrás del
          nombre; con cy 100 las caras quedan arriba del texto. El bloque no se
          tocó: sigue en flex-end. */
    P + '.portada{ justify-content:flex-end!important; }',

    /* el velo. Va en un ::before del BLOQUE, no en el fondo de la portada:
       un pseudo hermano no es ancestro, así que no le ensucia la cuenta del
       contraste a reglas-duras.js. Y es RADIAL: una banda recta se ve como una
       barra cruzando la foto. */
    P + '.portada > .c{ position:relative!important; padding:0 6vw!important; }',
    P + '.portada > .c::before{',
    '  content:""; position:absolute; left:50%; top:-24%;',
    '  transform:translateX(-50%); width:190%; height:165%;',
    '  background:radial-gradient(54% 44% at 50% 48%,',
    '     rgba(28,20,12,.50) 0%, rgba(28,20,12,.38) 40%, rgba(28,20,12,.18) 62%,',
    '     rgba(28,20,12,.05) 80%, rgba(28,20,12,0) 92%);',
    '  pointer-events:none; z-index:0;',
    '}',
    P + '.portada > .c > *{ position:relative!important; z-index:1!important; }',

    /* el sobretítulo: «NUESTRA BODA», bien chico y muy abierto */
    P + '.portada #pv-kick{',
    '  font-family:' + SANS + '!important;',
    '  font-size:clamp(10px,2.7vw,12.5px)!important;',
    '  font-weight:500!important;',
    '  letter-spacing:.52em!important; text-indent:.52em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  line-height:1.4!important;',
    '  margin:0 0 1.2em 0!important;',
    '  text-shadow:0 1px 3px rgba(24,16,10,.85)!important;',
    '}',

    /* ⭐ LOS NOMBRES. Versalitas Bodoni, abiertas, en dos renglones.
       ⚠️⚠️ EL TAMAÑO SALE DE UNA MEDICIÓN CONTRA PERLAS, NO DE OJO.
          Perlas: bloque al 37% de la pantalla, nombres de 54px.
          Bohemia estaba al 54% con 60px → «portada de disco», y Maki la bajó.
          Con clamp(26,8.2vw,44) y los aires cerrados el bloque cae en la misma
          franja que Perlas, y la cuenta regresiva se lee ABAJO de todo, que es
          lo que pidió.
       ⚠️ `text-indent` compensa el `letter-spacing`, o el bloque queda corrido
          a la izquierda: el espaciado se agrega DESPUÉS de la última letra y el
          centrado lo cuenta. */
    P + '.portada #pv-names{',
    '  font-family:' + DISPLAY + '!important;',
    '  font-weight:500!important;',
    '  font-style:normal!important;',
    '  font-size:clamp(26px,8.2vw,44px)!important;',
    '  line-height:1.20!important;',
    '  letter-spacing:.14em!important; text-indent:.14em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    /* ⚠️ longhands, no el atajo: ver la nota del itinerario */
    '  background-image:none!important;',
    '  background-color:transparent!important;',
    '  margin:0!important;',
    /* la sombra va como filter para que envuelva la letra, no como text-shadow
       de caja */
    '  filter:drop-shadow(0 1px 2px rgba(24,16,10,.92))',
    '         drop-shadow(0 0 20px rgba(24,16,10,.55))!important;',
    '}',
    /* ⚠️ cada nombre entero en su renglón: el motor los mete en spans sueltos y
       sin esto un nombre largo se parte al medio. */
    P + '.portada #pv-names span{ white-space:nowrap!important; }',

    /* el nexo que mete el motor («&») en su propio tamaño y en camel */
    P + '.portada #pv-names span.amp, ' + P + '.portada #pv-names .amp{',
    '  font-size:.52em!important;',
    '  letter-spacing:0!important;',
    '  color:' + CAMEL + '!important; -webkit-text-fill-color:' + CAMEL + '!important;',
    '  opacity:.95!important;',
    '}',

    /* ── ⚠️⚠️ EL FILETE CAMEL: DOS TRAMPAS, UNA DETRÁS DE LA OTRA ───────────

       PRIMERA (la que ya avisaba la skill por la bajada de Disco Neón):
       estaba como `#pv-names::after`, y el `filter:drop-shadow(...)` del nombre
       alcanza TAMBIÉN a sus pseudos. El filete se llevaba las dos sombras y
       salía sucio y engrosado.

       SEGUNDA (la que se pagó al arreglar la primera): lo mudé a
       `.fecha::before`, que es hermano del nombre y por lo tanto queda fuera
       del filter. Se veía bien… hasta que la muestra pasó a
       `fx.fecha.disposicion = 'circulos'` —obligatorio para que la raspadita
       funcione en modo `partes`— y el motor dejó `.fecha` en `display:none`.
       El filete desapareció sin un solo error. Es LITERALMENTE lo que avisa la
       skill: **`#pv-fecha` no sirve de percha, puede venir oculto según la
       disposición elegida.**

       → LA SOLUCIÓN BUENA: un ELEMENTO PROPIO, que crea `filete()` después de
         `#pv-names` y borra `sacar()`. */
    P + '.portada #pv-names::after{ content:none!important; }',
    P + '.portada .bh-filete{',
    '  display:block!important; width:96px; height:1px;',
    '  margin:1.05em auto .15em!important;',
    '  background-color:' + CAMEL + '!important;',
    '  opacity:.85;',
    '  position:relative; z-index:1;',
    '}',

    P + '.portada .fecha{',
    '  font-family:' + SANS + '!important;',
    '  font-size:clamp(10px,2.6vw,12.5px)!important;',
    '  letter-spacing:.40em!important; text-indent:.40em!important;',
    '  color:' + CREMA + '!important;',
    '  text-shadow:0 1px 3px rgba(24,16,10,.85)!important;',
    '  margin-top:1.2em!important;',
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
    P + '.padres .nm{ font-size:18px!important; font-family:' + DISPLAY + '!important; letter-spacing:.06em!important; }',
    P + '.padres .rel{ font-family:' + SANS + '!important; letter-spacing:.18em!important; text-transform:uppercase!important; font-size:10.5px!important; }',

    /* ── LA RASPADITA ──────────────────────────────────────────────────────
       ⚠️⚠️ SON DOS RAMAS SEPARADAS DEL ÁRBOL:
           #scratchcard
            ├── .rasp-3 > .r3-f     ← las fichas de ABAJO (lo que se revela)
            └── .rasp-zona > canvas ← la TAPA que se raspa   ← ESTA es la que se ve
       La variable `--r3-tapa` la lee `efectos/raspadita.js` desde el CANVAS, y
       una variable de CSS sólo baja a los DESCENDIENTES: hay que declararla en
       los contenedores de LAS DOS ramas o el lienzo nunca la ve.
       ⚠️⚠️ Y LA FORMA NO ALCANZA CON PONERLA. `fx.raspadita.forma:'redondo'`
          estaba bien guardado y bien leído, y la raspadita salía igual un
          rectángulo con la rosa estirada. La causa real es OTRA CLAVE:
          `fx.fecha.disposicion`. El modo `partes` tapa las PIEZAS de la fecha;
          con `filetes` no hay piezas que tapar, cae a `simple` y pinta UNA sola
          zona de 300x158. Con `circulos`: tres celdas de 70x70. */
    ':is(#bh-nada, .scratch-sec, .rasp-3, .rasp-zona, #scratchcard){',
    '  --r3-tapa:url("' + ROSA + '");',
    '}',
    /* ⚠️ EL RECUADRO. El motor le pone `background:var(--lino2)` al contenedor.
       Maki ya pidió sacarlo dos veces. Se apaga POR PARTES: el atajo
       `background:` con !important pisa cosas que no queremos pisar. */
    ':is(#bh-nada, .scratchcard){',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:0!important;',
    '  box-shadow:none!important;',
    '}',

    /* ⚠️ «Las raspaditas te quedaron de diferentes colores» (Maki, 21/9 de
       noche). NO son tres fotos distintas: es la MISMA rosa. El motor le pone
       la clase `dormida` a las celdas que todavía no tocan y las apaga con
       `filter:brightness(.84) saturate(.72)`, para señalar por dónde empezar.
       A ese nivel deja de leerse como una pista y se lee como tres colores
       distintos, que es peor que la ayuda que da.
       Se conserva la señal, pero apenas perceptible.
       ⚠️ Especificidad: `:is(#bh-nada, .rasp-zona)` vale (1,0,0), así le gana
          al (0,2,1) del motor sin tener que inventar otro contenedor. */
    ':is(#bh-nada, .rasp-zona).dormida canvas{',
    '  filter:brightness(.97) saturate(.95)!important;',
    '}',

    /* ══ EL ITINERARIO ═════════════════════════════════════════════════════
       Rediseñado el 21/9 a pedido de Maki: «la línea va centrada, y quiero más
       movimiento de las palabras: que entren de izquierda a derecha y la
       siguiente de derecha a izquierda, para que sea más fluido. Y a la línea
       buscale otra vuelta porque queda mal.»

       Tres cosas, y ninguna sale sólo de CSS:

       1. LA VÍA VA AL CENTRO. De fábrica está a `left:6px` y las marcas cuelgan
          a `-26px`, o sea todo el itinerario es una columna pegada al borde.
       2. LAS FICHAS ALTERNAN LADO. No se puede con `nth-child`: `.tl` tiene
          también al `<i class="tl-prog">` de hijo y correría la cuenta (es la
          misma trampa que avisa la skill para el video del itinerario). Por eso
          el lado lo escribe `lados()` en un atributo, contando SÓLO los `.it`.
       3. CADA UNA ENTRA DESDE SU LADO, una sola vez, con IntersectionObserver.
          ⚠️ Y con red de seguridad: si el observador no llega a disparar, a los
             6 s se muestran todas igual. Una ficha invisible es peor que una
             ficha sin animación.

       La geometría: la ficha mide `50% - 26px`, así que entre su borde y el eje
       hay 26 px. La marca mide 24 px y su CENTRO tiene que caer en el eje →
       su borde exterior va a 26 + 12 = 38 px. De ahí el `-38px`. */
    P + '.tl{',
    '  position:relative!important;',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid ' + TINTA3 + '!important;',
    '  border-radius:14px!important;',
    '  padding:22px 12px!important;',
    '}',
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  top:var(--bh-tl-ini,6px)!important;',
    '  bottom:var(--bh-tl-fin,6px)!important;',
    '  height:auto!important;',
    '  left:50%!important; right:auto!important;',
    '  margin-left:-1.5px!important;',
    '  width:3px!important;',
    '}',
    /* ⭐ LA REGLETA DE CUENTAS, con las cuentas bajando despacio. El viaje es
       9 px = el mosaico entero, o el bucle pega un salto.
       ⚠️ VAN LAS LONGHANDS, NUNCA el atajo `background:` con !important: el
          atajo expande TODAS sus longhands y clava `background-position`, y una
          declaración !important de autor le gana a una animación. Así se quedó
          quieta la bola de espejos de Disco sin un solo error en consola.
       ⚠️ 2,4 s, no 1,6: a 1,6 las cuentas se leen como una tira corriendo y
          distraen del texto. Tiene que ser un latido, no una cinta. */
    P + '.tl::before{',
    '  background-image:url("' + VIA + '")!important;',
    '  background-repeat:repeat-y!important;',
    '  background-size:3px 9px!important;',
    '  background-color:transparent!important;',
    '  opacity:.60!important;',
    '  animation:bhVia 2.4s linear infinite!important;',
    '}',
    '@keyframes bhVia{ from{ background-position:0 0; } to{ background-position:0 9px; } }',
    /* el tramo que ya pasó, más presente */
    P + '.tl > .tl-prog{',
    '  background-image:url("' + VIA + '")!important;',
    '  background-repeat:repeat-y!important;',
    '  background-size:3px 9px!important;',
    '  background-color:transparent!important;',
    '  opacity:1!important;',
    '}',

    /* las fichas, alternando lado */
    P + '.tl > .it{',
    '  width:calc(50% - 26px)!important;',
    '  box-sizing:border-box!important;',
    '  opacity:0;',
    '  transition:opacity .5s ease, transform .55s cubic-bezier(.22,.7,.3,1);',
    '}',
    P + '.tl > .it[data-bh-lado="izq"]{',
    '  margin-left:0!important; margin-right:auto!important;',
    '  text-align:right!important; padding-right:6px!important;',
    '  transform:translateX(-24px);',
    '}',
    P + '.tl > .it[data-bh-lado="der"]{',
    '  margin-left:calc(50% + 26px)!important;',
    '  text-align:left!important; padding-left:6px!important;',
    '  transform:translateX(24px);',
    '}',
    P + '.tl > .it.bh-visto{ opacity:1!important; transform:translateX(0)!important; }',
    /* ⭐ LA MARCA: LA HOJA DE LOS TÍTULOS, no la rosa recortada.
       El disco de papel va DENTRO del mismo SVG (no como background-color) para
       que tape la regleta por detrás sin sumar una capa más.
       ⚠️ LA GEOMETRÍA SE RECALCULA CUANDO CAMBIA EL TAMAÑO DE LA MARCA: la
          ficha mide `50% - 26px`, así que entre su borde y el eje hay 26 px; la
          marca mide 24 y su CENTRO tiene que caer en el eje → su borde exterior
          va a 26 + 12 = 38 px. Con la rosa de 22 era 37. Si alguien cambia el
          tamaño y se olvida de este número, la fila entera queda corrida. */
    P + '.tl > .it::before{',
    '  background-image:url("' + MARCA + '")!important;',
    '  background-size:contain!important;',
    '  background-repeat:no-repeat!important;',
    '  background-color:transparent!important;',
    '  border-radius:50%!important;',
    '  box-shadow:none!important;',
    '  border:0!important;',
    '  width:24px!important; height:24px!important;',
    '  content:""!important;',
    '}',
    P + '.tl > .it[data-bh-lado="izq"]::before{ left:auto!important; right:-38px!important; }',
    P + '.tl > .it[data-bh-lado="der"]::before{ left:-38px!important; right:auto!important; }',

    P + '.tl .it .h{ font-family:' + SANS + '!important; letter-spacing:.18em!important; color:' + CAMEL + '!important; }',
    P + '.tl .it .d{ font-family:' + SANS + '!important; color:' + TINTA2 + '!important; }',
    P + '.tl .it .t{ font-family:' + DISPLAY + '!important; letter-spacing:.10em!important; }',

    /* ── ⭐⭐ LAS TAPAS DE «NUESTRO VIDEO» Y DE LA PLAYLIST ─────────────────
       Maki, 21/9 de noche: «fijate que está todo superpuesto».

       ⚠️⚠️ ERA MÍO, Y ES LA TRAMPA QUE NO HAY QUE REPETIR: EL MOTOR YA DIBUJA
          EL PLAY. La tapa que crea el motor es:
              .rd-tapa > .rd-aro   (62 px: aro de 1 px + triángulo en ::after)
                       > .rd-txt   (el rótulo, DEBAJO del aro)
          y las dos piezas se pintan con `currentColor`.
          Yo, para sacar la foto estirada que Maki había rechazado, le pinté
          ADEMÁS un play de 86 px como `background-image` DEL CONTENEDOR,
          centrado. MEDIDO en vivo sobre la playlist: mi play iba de 135 a
          221 px, el aro del motor de 135 a 197 y el rótulo de 207 a 221.
          O sea DOS PLAYS, uno encima del otro, con el rótulo atravesado.

       ⭐ LA REGLA: antes de dibujar un adorno nuevo, mirar si el motor YA lo
          dibuja. Si ya está, la colección le da el COLOR, no otro dibujo.
       ⚠️ El aro viene con `opacity:.75` y el rótulo con `.65`: hay que subirlas
          o el camel se lava contra el papel. */
    P + '.rd-tapa, ' + P + '.sp-tapa{',
    '  background-color:' + PAPEL2 + '!important;',
    '  background-image:none!important;',
    '  color:' + CAMEL + '!important;',
    '  border:0!important;',
    '  box-shadow:none!important;',
    '}',
    P + '.rd-tapa .rd-aro, ' + P + '.sp-tapa .rd-aro{',
    '  opacity:1!important;',
    '  border-color:' + CAMEL + '!important;',
    '  background-color:rgba(247,241,231,.55)!important;',
    '}',
    P + '.rd-tapa .rd-txt, ' + P + '.sp-tapa .rd-txt{',
    '  font-family:' + SANS + '!important;',
    '  color:' + TINTA2 + '!important;',
    '  opacity:1!important;',
    '  letter-spacing:.18em!important;',
    '}',

    /* ── LA PERILLA DEL SÍ / NO ────────────────────────────────────────────
       ⚠️ Maki, 21/9: «en el botón de no podré / sí asistiré, dejale la normal».
       Tenía la rosa como perilla y no le gustó. Se le devuelve la forma de
       fábrica y sólo se le tocan los tonos, para que no quede un gris ajeno a
       la familia.
       ⚠️ El árbol real, medido: `.rsvp-caja > .rsvp-fila > .rsvp-sw >
          (.aro, .pozo, .per)`. `.si .knob` NO EXISTE, aunque lo diga cualquier
          apunte viejo. Y los `.mitad` miden 38 px (bajo el piso de 44): lo que
          salva el toque son los rótulos `.et`, de 73 y 83 px. */
    /* ⚠️⚠️ EL GRIS NO SE SACA CON `background-color`, Y ESO ERA EL PARPADEO.
       Maki, 21/9 de noche: «el botón de confirmación titila», «la de sí
       asistiré tiene ese problema en todo momento».
       MEDIDO EN VIVO:
         · el pozo salía `linear-gradient(215deg, rgb(207,207,203),
           rgb(185,185,180))` — un gris CLAVADO en el motor;
         · el aro sale de un degradado que usa `--lino2`, `--cream` y `--muted`,
           las TRES variables que `efectos/paleta.js` reescribe cada 1,5 s.
       Poner `background-color` NO alcanza: el degradado es `background-image` y
       se dibuja ENCIMA del color. Y como el pozo trae `transition:background
       .3s`, cada reescritura de la paleta lo funde de nuevo — ése es el
       parpadeo, y por eso pasa «en todo momento».
       → Se apaga la IMAGEN, se fija el color y se corta la transición: así el
         control deja de depender de variables que otro módulo reescribe.
       ⚠️ La perilla sin `data-r` queda en el MEDIO (left 27,25 px) a propósito:
          es «todavía no respondió». No se toca. */
    P + '.rsvp-sw .pozo{',
    '  background-image:none!important;',
    '  background-color:#DCCEBD!important;',
    '  transition:none!important;',
    '}',
    P + '.rsvp-sw[data-r="si"] .pozo{ background-image:none!important; background-color:' + CAMEL + '!important; }',
    P + '.rsvp-sw[data-r="no"] .pozo{ background-image:none!important; background-color:' + TINTA3 + '!important; }',
    P + '.rsvp-sw .aro{',
    '  background-image:none!important;',
    '  background-color:' + PAPEL2 + '!important;',
    '  border-color:' + TINTA3 + '!important;',
    '}',
    P + '.rsvp-caja .et{ font-family:' + SANS + '!important; letter-spacing:.16em!important; text-transform:uppercase!important; }',

    /* ── ⭐ EL PASE ────────────────────────────────────────────────────────
       Maki, 21/9: «en el ticket ponele algo más relacionado a la temática, está
       muy básico blanco».

       ⚠️⚠️ LOS RÓTULOS DEL PASE NO SON `.lab` Y `.val`. MEDIDO EN VIVO:
          .pasecard > .row > (.k , .v)
          `.k` es el rótulo («Nombre», «Mesa») y `.v` el dato. La primera
          pasada escribió `.lab`/`.val` —los nombres de algún apunte viejo— y
          no tocó NADA: el dato seguía saliendo en **#666 gris y en Forum**, un
          gris que no pertenece a ninguna paleta de la colección. Ése era buena
          parte del «muy básico».
          Se dejan igual las dos familias de selectores: `.k`/`.v` es lo que hay
          hoy y `.lab`/`.val` por si el motor vuelve atrás.

       ⚠️⚠️ Y LA CHAPITA DE ESTADO VENÍA VERDE: rgb(77,106,79), el sage de otra
          colección, clavado en el motor. Sobre el papel de Bohemia se veía como
          una etiqueta pegada de otra invitación. Va en TINTA con letra crema
          (7,33 de contraste).

       El marco: en vez de dos filetes sueltos arriba y abajo —que a 1 px no se
       veían— va un DOBLE FILETE INTERIOR hecho con `inset box-shadow`, que es
       el recurso clásico del boleto impreso y no agrega elementos al flujo.
       ⚠️ El cuadrado del QR se deja BLANCO a propósito: es la excepción que
          pide la skill, porque un lector necesita el contraste. */
    P + '.pasecard, ' + P + '.pase .pasecard{',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid ' + TINTA3 + '!important;',
    '  border-radius:10px!important;',
    '  box-shadow:inset 0 0 0 4px ' + PAPEL2 + ',',
    '              inset 0 0 0 5px rgba(168,125,90,.42),',
    '              0 2px 10px rgba(74,59,46,.10)!important;',
    '}',
    P + '.pasecard .k, ' + P + '.pase .lab, ' + P + '.pasecard .lab{',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.20em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + CAMEL + '!important;',
    '  font-size:9.5px!important;',
    '}',
    P + '.pasecard .v, ' + P + '.pase .val, ' + P + '.pasecard .val{',
    '  font-family:' + DISPLAY + '!important;',
    '  color:' + TINTA + '!important;',
    '  letter-spacing:.04em!important;',
    '}',
    P + '.pasecard .estado{',
    '  background-color:' + TINTA + '!important;',
    '  color:' + CREMA + '!important;',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.14em!important; text-transform:uppercase!important;',
    '}',

    /* ── LA CARTA ──────────────────────────────────────────────────────────
       ⚠️ LA HOJA DE LA CARTA TAMBIÉN ES SUPERFICIE: `.cf-letter` trae el papel
          clavado en el motor. Acá va el papel de Bohemia, no el blanco. */
    P + '.cf-letter{',
    '  background-color:' + PAPEL2 + '!important;',
    '  color:' + TINTA + '!important;',
    '  font-family:' + SANS + '!important;',
    '}',
    P + '.cf-letter h3, ' + P + '.cf-letter .cf-tit{',
    '  font-family:' + DISPLAY + '!important;',
    '  letter-spacing:.12em!important; text-transform:uppercase!important;',
    '  color:' + TINTA + '!important;',
    '}',

    /* ── EL PIE ────────────────────────────────────────────────────────────
       ⚠️⚠️ `.footer` NO ES `.sec`: se queda con el velo del molde, que es VERDE
       y arranca recién al 30%. Los textos chicos caen sobre las zonas CLARAS de
       la foto del cierre y se pierden.
       ⚠️ El velo va en un `::after`, NO en el `background` del pie: `fondosDe()`
          de `reglas-duras.js` abre los degradados de los ANCESTROS y se queda
          con la parada más clara; un pseudo no es ancestro. */
    P + '.footer{ position:relative!important; }',
    P + '.footer::after{',
    '  content:""; position:absolute; inset:0; z-index:0; pointer-events:none;',
    '  background:linear-gradient(to bottom,',
    '     rgba(38,28,20,.10) 0%, rgba(34,25,17,.58) 40%, rgba(28,20,13,.88) 100%);',
    '}',
    P + '.footer > *{ position:relative!important; z-index:1!important; }',

    /* ── ⭐ ¿ALGUNA DUDA? ──────────────────────────────────────────────────
       Maki, 21/9: «en alguna duda no se ve bien».
       La sección tiene foto OSCURA de fondo (el muro con pampas) y el motor le
       deja la tinta marrón: el título se comía con el fondo. Título, bajada y
       sobretítulo van en crema, con una sombra corta que los despega de la
       textura sin tapar la foto. */
    P + '#contacto-kick, ' + P + '.contacto .kick,',
    P + '#contacto-sec h2, ' + P + '#contacto-sec p, ' + P + '#contacto-sec .kick{',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  text-shadow:0 1px 4px rgba(24,16,10,.80)!important;',
    '}',

    /* ── EL ADORNO DE LOS TÍTULOS ──────────────────────────────────────────
       Los `.adorno` del motor son un SVG con dos filetes y DOS ANILLOS
       ENTRELAZADOS: el adorno genérico de boda, el mismo en todas las
       invitaciones. Maki ya lo marcó («siempre ponés lo mismo»).
       ⚠️ Acá NO va una foto: el adorno de arriba de cada título es una VIÑETA
          TIPOGRÁFICA y va en vector. La foto es para los OBJETOS reconocibles
          — en Bohemia, la rosa de la raspadita. Y la marca del itinerario es
          ESTA MISMA HOJA, a propósito: es lo que hace que la pieza se lea como
          una sola.
       ⚠️ Y `simbolo-tematica.js` no lo pisa, porque esta colección firma
          `data-marca-propia` y ese módulo se corre solo. */
    P + '.adorno > svg{ display:none!important; }',
    P + '.adorno{',
    '  background-image:url("' + ADORNO + '")!important;',
    '  background-size:contain!important;',
    '  background-position:center!important;',
    '  background-repeat:no-repeat!important;',
    '}',

    /* ── FILETES ───────────────────────────────────────────────────────────
       TINTA3 da 1,36 sobre la foto: es un filete, NUNCA un texto. */
    P + '.frame hr, ' + P + '.frame .linea{',
    '  background-color:' + TINTA3 + '!important; border-color:' + TINTA3 + '!important;',
    '}',

    /* ⚠️ NO se pinta fondo/borde/sombra de los botones: eso lo hace
       `efectos/botones.js` con el material elegido en `fx.boton.estilo`
       (acá: relieve-seco). Si la colección lo pinta, le pisa el material y
       queda plano. Marfil borró todas sus reglas de píldora por esto. */
    P + '.btn, ' + P + '#btn-ingresar, ' + P + '.wsp, ' + P + '.tv-btn, ' + P + '.inv-prev-btn{',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.20em!important; text-indent:.20em!important;',
    '  text-transform:uppercase!important;',
    '  font-size:12px!important;',
    '}',

    /* ⚠️ LA FLECHITA DE LOS DESPLEGABLES («Escuchar la playlist ▾», «Ver mapa
       ▾»). MEDIDA: salía en rgb(20,18,18), un casi-negro que no pertenece a
       ninguna paleta de la colección — el mismo bicho que el gris del pase y el
       verde de la chapita. Es decoración: va en camel y más chica que la
       palabra. */
    P + '.btn .chev, ' + P + '.chev{',
    '  color:' + CAMEL + '!important;',
    '  font-size:.85em!important;',
    '  opacity:.9!important;',
    '}',

    '@media (prefers-reduced-motion: reduce){',
    P + '.tl::before{ animation:none!important; }',
    P + '.tl > .it{ transition:none!important; opacity:1!important; transform:none!important; }',
    '}'

    ].join('\n');
  }

  /* --------------------------------------------------------------- pintar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    var txt = armarCSS();
    if (s.textContent !== txt) s.textContent = txt;
  }

  /* ⚠️ EL FILETE DE LA PORTADA ES UN ELEMENTO DE VERDAD, NO UN PSEUDO.
     No puede colgar de `#pv-names` (el `filter` del nombre le mete las sombras)
     ni de `.fecha` (el motor la esconde según la disposición elegida). */
  function filete() {
    try {
      var n = document.getElementById('pv-names');
      if (!n || !n.parentNode) return;
      var f = n.parentNode.querySelector('.bh-filete');
      if (!f) { f = document.createElement('div'); f.className = 'bh-filete'; }
      if (n.nextSibling !== f) n.parentNode.insertBefore(f, n.nextSibling);
    } catch (e) {}
  }

  /* ⭐ EL LADO DE CADA FICHA Y SU ENTRADA.
     ⚠️ NO se puede con `nth-child`: `.tl` tiene también al `<i class="tl-prog">`
        de hijo y correría la cuenta. Se cuentan SÓLO los `.it`.
     ⚠️ RED DE SEGURIDAD: si el IntersectionObserver no llega a disparar (la
        sección se revela con otro mecanismo, el navegador no lo soporta), a los
        6 s se muestran todas igual. Una ficha invisible es mucho peor que una
        ficha sin animación. */
  function lados() {
    try {
      var tl = document.querySelector('.tl');
      if (!tl) return;
      var its = tl.querySelectorAll(':scope > .it');
      if (!its.length) return;

      for (var i = 0; i < its.length; i++) {
        var lado = (i % 2) ? 'der' : 'izq';
        if (its[i].getAttribute('data-bh-lado') !== lado) its[i].setAttribute('data-bh-lado', lado);
      }

      if (!tl.__bhObs && window.IntersectionObserver) {
        tl.__bhObs = new IntersectionObserver(function (ent) {
          for (var j = 0; j < ent.length; j++) {
            if (ent[j].isIntersecting) {
              ent[j].target.classList.add('bh-visto');
              try { tl.__bhObs.unobserve(ent[j].target); } catch (e) {}
            }
          }
        }, { threshold: 0.3 });
      }
      if (tl.__bhObs) {
        for (var k = 0; k < its.length; k++) {
          if (!its[k].classList.contains('bh-visto')) tl.__bhObs.observe(its[k]);
        }
      }

      if (!tl.__bhRed) {
        tl.__bhRed = true;
        setTimeout(function () {
          try {
            var todas = tl.querySelectorAll(':scope > .it');
            for (var m = 0; m < todas.length; m++) todas[m].classList.add('bh-visto');
          } catch (e) {}
        }, 6000);
      }
    } catch (e) {}
  }

  /* ⚠️ LA VÍA DEL ITINERARIO NO SE RESUELVE SÓLO CON CSS.
     Dónde cae el centro de la primera ficha depende de cuánto mide su texto, y
     ese texto lo carga Jazmín. Se MIDE y se pasa por variable, y se vuelve a
     medir en cada repaso: así sigue bien cuando gira el teléfono o cambia un
     texto. Son dos getBoundingClientRect, no pesa. */
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
      if (ini > 0) tl.style.setProperty('--bh-tl-ini', ini + 'px');
      if (fin > 0) tl.style.setProperty('--bh-tl-fin', fin + 'px');
    } catch (e) {}
  }

  function poner() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') !== ID) raiz.setAttribute('data-col', ID);
    if (raiz.getAttribute('data-coleccion') !== ID) raiz.setAttribute('data-coleccion', ID);
    /* la colección trae su propia marca (la rosa fotografiada): que
       `simbolo-tematica.js` no dibuje su vector encima. */
    if (raiz.getAttribute('data-marca-propia') !== ID) raiz.setAttribute('data-marca-propia', ID);
    window.INVCOLPALETA = PALETA_PROPIA;
    hoja();
    filete();
    lados();
    medirVia();
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') === ID) raiz.removeAttribute('data-col');
    if (raiz.getAttribute('data-coleccion') === ID) raiz.removeAttribute('data-coleccion');
    if (raiz.getAttribute('data-marca-propia') === ID) raiz.removeAttribute('data-marca-propia');
    if (window.INVCOLPALETA === PALETA_PROPIA) { try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; } }
    var f = document.querySelector('.bh-filete');
    if (f && f.parentNode) f.parentNode.removeChild(f);
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
  window.INVBOHEMIA = { poner: poner, sacar: sacar, css: armarCSS, via: medirVia, filete: filete, lados: lados };
})();
