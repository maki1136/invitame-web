/* ===== COLECCIÓN «DISCO» ====================================================

   La primera colección OSCURA. Nace de la muestra de XV de Lupita: bolas de
   espejos, plata sobre negro. Maki, 19/9/2026, mirando la primera versión:

     «quedó como el orto»
     «pero mirá bien los colores de los textos, le pifiaste feo ahí»

   Y tenía razón. Medidos los textos que se veían en pantalla, había CATORCE
   colores distintos y tres familias peleando:

     8 veces  rgb(63,88,120)    azul acero      · subtítulos de los lugares
     6 veces  rgb(231,221,200)  crema cálido    · «MIS XV AÑOS», la cuenta regresiva
     3 veces  rgb(126,112,157)  lila            · nombres de los lugares
     3 veces  rgb(102,102,102)  gris suelto     · los nombres de Personas
     1 vez    rgb(47,42,38)     marrón          · «MAY 2027»

   Azul, lila, crema y marrón adentro de una invitación que tiene que ser plata
   y grafito. El error de fondo fue meter una temática NEGRA en el molde claro
   que funciona para playa y perlas: gris sucio en todas las secciones.

   ⚠️ POR QUÉ ESTO ES UNA COLECCIÓN Y NO UNA PALETA
   De las 20 paletas del catálogo no hay ninguna de plata y grafito, y además
   `efectos/paleta.js` reescribe sus variables cada 1,5 s con `!important` en el
   `<html>`: ninguna hoja de estilo le gana. El camino que ya dejó resuelto
   Marfil es publicar `window.INVCOLPALETA` con las variables que son SUYAS, y
   la paleta las pinta con ESE valor. Es la única forma de no pelearse con ella.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR, NO DIBUJA UNA INVITACIÓN NUEVA
   Todo es reversible y NO SACA NINGUNA SECCIÓN. Se apaga y la invitación vuelve
   intacta.

   ★ SE PRENDE con `INVEV.fx.coleccion = 'disco'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'disco';

  /* ---- LA FAMILIA. UNA SOLA. -----------------------------------------------
     Medida contra el papel: la plata sobre grafito da 11,8:1, y el grafito
     sobre plata (el texto adentro de los botones) 11,8:1 también. Las bajadas
     en plata media dan 6,1:1. Los tres pasan WCAG AA holgados. */
  var PAPEL   = '#15141A';   /* grafito casi negro, apenas frío */
  var PAPEL2  = '#1E1C25';   /* el papel, un tono más claro */
  var PLATA   = '#E6E4EE';   /* el principal: títulos, botones, bocina */
  var PLATA2  = '#A8A5B6';   /* bajadas y datos */
  var PLATA3  = '#6E6B7C';   /* filetes y bordes */
  var BRILLO  = '#F7F6FA';   /* el destello de las facetas */

  /* ⚠️ LOS ACENTOS TAMBIÉN SON DE LA COLECCIÓN.
     Marfil ya pagó esta: si se le dejan `--sage`, `--sage-cl` y `--oro` a la
     paleta elegida, el nombre del lugar sale violeta adentro de una invitación
     que es plata. Acá pasó igual con `azul-noche-plata`. Disco se los queda. */
  var PALETA_PROPIA = {
    '--verde':     PLATA,    /* el principal: títulos, botones, bocina */
    '--verde2':    PLATA2,   /* su versión apagada, para los degradés */
    '--muted':     PLATA2,   /* bajadas y datos */
    '--cream':     PAPEL,    /* el texto que va ARRIBA del principal */
    '--lino':      PAPEL,    /* el papel */
    '--lino2':     PAPEL2,   /* el papel, un tono más claro */
    '--sec-col-v': PAPEL2,   /* el color de sector */
    '--sage':      PLATA2,   /* acento 1 */
    '--sage-cl':   PLATA3,   /* acento 2 */
    '--oro':       BRILLO,   /* acento 3 — plata brillante, nunca dorado */

    /* ⚠️⚠️ LAS OCHO QUE FALTABAN. MEDIDAS EN VIVO EL 19/9/2026.
       Con las diez de arriba solamente, la invitación seguía siendo un gris
       sucio, y yo lo estaba peleando con `!important` a los martillazos sin
       entender por qué. La razón, leída del `<html>` de lupita-mis15:

         --sec-col: #e7e9ec !important    ← LAS BANDAS DE TODAS LAS SECCIONES
         --tl-papel: #fbf9f5              ← el papel del itinerario
         --cf-sobre: #E9E7EF              ← EL SOBRE DE LA CARTA (el marfil
                                            con damasco que Maki marcó)
         --sobre-c / --flap-base: #FBFBFA ← el sobre y su solapa

       Ninguna estaba en la tabla, así que se las quedaba la temática de la
       muestra: superficies CLARAS abajo de una invitación NEGRA. No era la
       colección peleándose con la paleta — era la colección sin reclamar
       las variables que de verdad pintan el papel.

       REGLA: una colección oscura tiene que quedarse con TODA superficie,
       no sólo con los colores de letra. */
    '--sec-col':   PAPEL,    /* las bandas de sección */
    '--tl-papel':  PAPEL2,   /* el papel del itinerario */
    '--tl-tinta':  PLATA,    /* la tinta del itinerario */
    '--cf-sobre':  PAPEL2,   /* el sobre de la carta */
    '--cf-col':    PLATA,    /* la letra adentro de la carta */
    '--sobre-c':   PAPEL2,   /* el sobre */
    '--flap-base': PAPEL2,   /* su solapa */
    '--seal-c':    PLATA2    /* el lacre */
  };

  /* ⚠️ `#dc-nada` no existe: está para subirle el peso a la regla sin tener que
     perseguir clases. Es el truco que ya usa Marfil. */
  /* el ancla de peso: los DOS atributos que pone la coleccion en el marco */
  var P = 'html[data-col="' + ID + '"][data-coleccion="' + ID + '"] ';

  /* ⭐ LA BOLA DE ESPEJOS NO SE COPIA ACÁ.
     Se le pide a `efectos/simbolo-tematica.js`, que es el dueño del dibujo y
     el que ya lo usa en el itinerario. Si algún día se redibuja, cambian los
     dos lugares juntos. Por eso el CSS es una FUNCIÓN y no una constante:
     necesita leer ese módulo en tiempo de ejecución. Si todavía no cargó,
     devuelve '' y la regla se saltea; en el próximo repaso (1,2 s) entra. */
  function bola(tinta, papel) {
    try {
      if (window.INVSIMBOLO && window.INVSIMBOLO.uri) {
        return window.INVSIMBOLO.uri('disco', tinta, papel);
      }
    } catch (e) {}
    return '';
  }

  function armarCSS() {
    /* ⚠ `bola()` ES EL DIBUJO VECTORIAL, Y YA NO SE USA EN NINGUN LADO.
     Queda como referencia de lo que NO hay que hacer: a 22 px un dibujo de
     bola de espejos se lee como un circulito rayado. La pieza de verdad es
     la FOTO de `invitame/piezas/bola-espejos` (ver mas abajo).
     ⚠ Lo viejo, por las dudas: El dibujo vectorial se sacó de
       la perilla y de la tapa: a ese tamaño no se lee como una bola de espejos,
       se lee como un circulito rayado. Cuando esté la pieza FOTOGRAFIADA en
       `invitame/piezas/bola-espejos` — recortada con alfa, girando despacio y
       con un destello que barre — se enchufa acá y en el itinerario de una. */

  var CSS = [
    ':is(#dc-nada, .evento), :is(#dc-nada, .hotel), :is(#dc-nada, .pasecard),',
    ':is(#dc-nada, .scratchcard), :is(#dc-nada, .col-vtapa){',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid rgba(230,228,238,.22)!important;',
    '  box-shadow:0 1px 0 rgba(230,228,238,.10) inset, 0 10px 28px rgba(0,0,0,.45)!important;',
    '}',
    /* el texto adentro de esas tarjetas */
    ':is(#dc-nada, .evento) *, :is(#dc-nada, .hotel) *, :is(#dc-nada, .pasecard) *{',
    '  color:' + PLATA + ';',
    '}',
    ':is(#dc-nada, .evento) .sub, :is(#dc-nada, .evento) .addr,',
    ':is(#dc-nada, .hotel) .sub{ color:' + PLATA2 + '!important; }',
    /* ⚠️ EL BOTÓN QUE NO SE LEÍA. Medido: texto rgb(247,233,230) sobre un botón
       claro. Ahora el botón es grafito con filete de plata y la letra plata. */
    /* ⚠⚠ LA TRAMPA DE LA ESPECIFICIDAD, MEDIDA EL 20/9/2026.
       El estilo de boton del motor es:
         [data-boton="lacre"] :is(.btn, #btn-ingresar, .wsp, .tv-btn, ...)
       Ese :is() TIENE UN #id ADENTRO. Un :is() pesa lo que su argumento MAS
       pesado, asi que la regla entera vale (1,1,0) — para TODA la lista, no
       solo para el boton con id. Mi regla valia (1,0,0) y perdia: los botones
       seguian con la letra crema rgb(247,233,230) del estilo lacre, ilegible
       sobre plata. Era el «VER MAPA no se lee».
       Se gana anclando en los dos atributos del marco: (1,2,1).
       Tambien se pisa -webkit-text-fill-color, que es lo que pinta de verdad
       la letra cuando el motor lo usa. */
    P + ':is(#dc-nada, .btn),',
    P + ':is(#dc-nada, .acc-btn),',
    P + ':is(#dc-nada, .wsp),',
    P + ':is(#dc-nada, .tv-btn),',
    P + ':is(#dc-nada, .inv-prev-btn),',
    P + ':is(#dc-nada, #btn-ingresar){',
    '  background-image:none!important;',
    '  background-color:' + PAPEL2 + '!important;',
    '  color:' + PLATA + '!important;',
    '  -webkit-text-fill-color:' + PLATA + '!important;',
    '  border:1px solid rgba(230,228,238,.35)!important;',
    '  text-shadow:none!important;',
    '}',
    /* la raspadita y el pase, por dentro */
    ':is(#dc-nada, .scratchcard) *, :is(#dc-nada, .pasecard) *{ color:' + PLATA + '; }',
    /* la tarjeta del clima, que nace blanca con letra oscura */
    ':is(#dc-nada, .clima-card){ background:' + PAPEL2 + '!important; color:' + PLATA + '!important; }',
    ':is(#dc-nada, .clima-card) *{ color:' + PLATA + '!important; }',

    /* ⚠⚠⚠ EL CUADRADO VIOLETA. MAKI, 20/9/2026: «fijate que tenes un cuadrado
       violeta. No va a eso, negro.»
       La tapa que esconde el reproductor estaba en PAPEL2 (#1E1C25). Contra un
       fondo casi negro eso no se lee como una tapa: se lee como un cuadrado
       violaceo plantado en el medio de la seccion. Va en PAPEL, con un filete
       de plata muy tenue y la bola de espejos dibujada detras del play, para
       que sea una PIEZA y no un rectangulo. */
    /* ⚠⚠⚠ LA TAPA NO ES UN RECTÁNGULO. Maki, 20/9/2026: «sacá el rectángulo
       ese» — la segunda vez que lo marca (antes fue «tenés un cuadrado violeta»).
       La regla del motor ya decía «no se tapa un papel con otro papel» y la tapa
       la estaba rompiendo: un bloque opaco plantado en el medio de la sección.
       Va TRANSPARENTE. El iframe de abajo está en `visibility:hidden`, así que
       lo que se ve es el fondo de la invitación, y encima sólo el aro. */
    P + ':is(#dc-nada, .rd-tapa){',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:0!important;',
    '  box-shadow:none!important;',
    '  color:' + PLATA + '!important;',
    '}',
    P + ':is(#dc-nada, .rd-tapa) .rd-aro{',
    '  border-color:rgba(230,228,238,.55)!important;',
    '  background:rgba(21,20,26,.55)!important;',
    '  backdrop-filter:blur(2px)!important;',
    '}',

    /* ⚠⚠ EL CIELO DEL AMBIENTE. MEDIDO EL 20/9/2026.
       `fx.ambiente` tipo `nubes` dibuja SIEMPRE la misma foto, /i/cielo: un
       cielo DIURNO, blanco. Los colores de la tematica (colorTop/colorBot) no
       los usa para nada. Prendido en una invitacion negra pintaba una banda
       blanca gigante en el itinerario, la que se veia en la captura de Maki.
       La skill de armado pide el ambiente PRENDIDO con los colores de ESA
       tematica, asi que la coleccion le da el suyo: noche con destellos de
       plata, dibujado, sin pedir una foto nueva. */
    P + ':is(#dc-nada, .ambiente) .sky{',
    '  background-image:',
    '    radial-gradient(1.6px 1.6px at 18% 12%, rgba(230,228,238,.85), transparent 60%),',
    '    radial-gradient(1.2px 1.2px at 62% 26%, rgba(230,228,238,.70), transparent 60%),',
    '    radial-gradient(2px 2px at 81% 9%, rgba(247,246,250,.90), transparent 60%),',
    '    radial-gradient(1.3px 1.3px at 34% 47%, rgba(230,228,238,.60), transparent 60%),',
    '    radial-gradient(1.7px 1.7px at 73% 61%, rgba(230,228,238,.75), transparent 60%),',
    '    radial-gradient(1.1px 1.1px at 12% 74%, rgba(230,228,238,.55), transparent 60%),',
    '    radial-gradient(2.2px 2.2px at 49% 86%, rgba(247,246,250,.80), transparent 60%),',
    '    radial-gradient(1.4px 1.4px at 90% 92%, rgba(230,228,238,.65), transparent 60%),',
    '    radial-gradient(120% 70% at 50% 0%, rgba(168,165,182,.16), transparent 62%),',
    '    linear-gradient(180deg, ' + PAPEL + ' 0%, ' + PAPEL2 + ' 55%, #2A2733 100%)!important;',
    '  background-size:auto!important; background-repeat:no-repeat!important;',
    '  opacity:1!important; filter:none!important;',
    '}',
    /* ⚠⚠ LAS FOTOS DE LUGAR, EN TONO. MEDIDO EL 20/9/2026 MIRANDO.
       El hotel venia en naranja y azul de atardecer, y la iglesia en dorado:
       peleaban de frente con el negro y plata. Cloudinary no aplica
       transformaciones en esta cuenta (cambia el tamano pero ignora el efecto)
       y Adobe solo acepta dominios de su lista, asi que el tratamiento va
       donde corresponde: en la coleccion, en CSS, y se va solo al apagarla.
       NO toca la galeria: esas fotos ya son de la tematica. */
    P + ':is(#dc-nada, .ph),',
    P + ':is(#dc-nada, .sec) > img,',
    P + ':is(#dc-nada, .sec) .hotel img{',
    '  filter:grayscale(.88) contrast(1.06) brightness(.92);',
    '}',
    /* ⚠ Y LAS QUE VAN COMO FONDO DE UN CONTENEDOR (el cierre, contacto).
       Ahi NO se puede usar `filter`: grisaria tambien el texto de adentro.
       `background-blend-mode:luminosity` mezcla SOLO la imagen con el color de
       fondo y la deja monocroma; los hijos no se tocan. */
    P + ':is(#dc-nada, .footer),',
    P + ':is(#dc-nada, section.sec)[style*="background-image"]{',
    '  background-color:' + PAPEL2 + '!important;',
    '  background-blend-mode:luminosity!important;',
    '  filter:grayscale(.88) contrast(1.06) brightness(.92);',
    '}',
    /* ⚠⚠ EL VELO DETRAS DEL TEXTO. MAKI, 20/9/2026:
         «muchos textos no se llegan a leer... una solucion quizas como hiciste
          con la ultima muestra, poniendo algo abajo de los textos»
       El texto es PLATA y cae justo sobre la cara brillante de una bola de
       espejos: plata sobre plata. Las secciones son semitransparentes a
       proposito (fondo-invitacion.js) para que se vea el fondo, asi que no se
       arregla tapando la foto — Maki ya marco que no se tapa el fondo.
       Va un halo oscuro en la letra + un velo redondo que se desvanece,
       centrado en el bloque del titulo.
       ⚠ EL VELO VA COMO `background-image` DEL PROPIO BLOQUE, no como un
         `::before` con z-index:-1. Lo probe con pseudo-elemento y en las
         secciones cuyo fondo lo pinta la seccion misma, el z-index negativo lo
         manda DETRAS de ese fondo y no se ve. Como fondo del bloque siempre
         queda arriba del fondo de la seccion y debajo de su propia letra. */
    P + ':is(#dc-nada, .sec) > .kick,',
    P + ':is(#dc-nada, .sec) > h2,',
    P + ':is(#dc-nada, .sec) > p,',
    P + ':is(#dc-nada, .sec) > .sub,',
    P + ':is(#dc-nada, .portada) .kicker,',
    P + ':is(#dc-nada, .padres) .nm,',
    P + ':is(#dc-nada, .padres) .rl,',
    P + ':is(#dc-nada, .scratch-hint){',
    '  text-shadow:0 1px 2px rgba(10,9,13,.95), 0 0 10px rgba(10,9,13,.88), 0 0 24px rgba(10,9,13,.75)!important;',
    '}',

    /* ⚠⚠⚠ LOS NUEVE SOBRETITULOS DORADOS. MEDIDOS EL 20/9/2026.
       «La fecha», «Antes que nada», «El gran dia», «Etiqueta», «Recuerdos»,
       «La banda sonora», «Con cariño», «Corre la voz» y «Estamos para
       ayudarte» salian en rgb(143,109,59): dorado adentro de una invitacion
       que es plata y grafito. La coleccion se queda con el color del `.kick`.
       Con el color de fabrica ya en plata media, `reglas-duras` mide, ve que
       pasa sobrado contra el negro y lo deja en `ok` sin tocarlo. */
    /* ⚠⚠ Y EL «Copiar» DE LA MESA DE REGALOS, QUE LO ENCONTRÓ EL CHEQUEO.
       `span.copy` medía rgb(179,136,74): otro dorado. Es chiquito y vive adentro
       del bloque de datos bancarios, o sea que a ojo no salta — lo cantó la regla
       `familia-de-color` de `chequeo/muestra.js` en su primera corrida.
       Para esto se escribió el chequeo. */
    P + ':is(#dc-nada, .copy){',
    '  color:' + PLATA + '!important;',
    '  -webkit-text-fill-color:' + PLATA + '!important;',
    '}',

    P + ':is(#dc-nada, .kick), ' + P + ':is(#dc-nada, .kicker){',
    '  color:' + PLATA2 + '!important;',
    '  -webkit-text-fill-color:' + PLATA2 + '!important;',
    '}',

    /* el sobretitulo lleva un velo MAS chico y mas suave: con el mismo que el
       titulo se leia como una franja rectangular cruzando la seccion. */
    P + ':is(#dc-nada, .sec) > .kick{',
    '  background-image:radial-gradient(60% 150% at 50% 50%, rgba(8,7,11,.66) 0%, rgba(8,7,11,.38) 48%, rgba(8,7,11,0) 84%)!important;',
    '  background-repeat:no-repeat!important; background-position:center!important;',
    '  background-size:86% 220%!important;',
    '}',
    P + ':is(#dc-nada, .sec) > h2{',
    '  background-image:radial-gradient(64% 130% at 50% 50%, rgba(8,7,11,.88) 0%, rgba(8,7,11,.60) 46%, rgba(8,7,11,0) 84%)!important;',
    '  background-repeat:no-repeat!important; background-position:center!important;',
    '  background-size:104% 210%!important;',
    '}',
    /* el papel del marco */
    /* ⚠️ EL BANDEJON DEL PASE. La regla del motor es `.pase{background:var(--verde)}`,
       y en Disco `--verde` ES LA PLATA: la banda entera salia clara. */
    ':is(#dc-nada, section.pase){ background:' + PAPEL + '!important; color:' + PLATA + '!important; }',
    /* ⚠⚠ EL COLOR DE LETRA DE LA TARJETA, NO SOLO EL DE SUS HIJOS.
       Medido el 20/9/2026 con la coleccion prendida: .pasecard heredaba
       rgb(21,20,26) y .scratchcard, .tl y .rd-tapa rgb(58,69,61) — oscuro
       sobre oscuro. La regla `.tarjeta *` NO alcanza al elemento mismo. */
    ':is(#dc-nada, .pasecard), :is(#dc-nada, .scratchcard), :is(#dc-nada, .tl),',
    ':is(#dc-nada, .rd-tapa), :is(#dc-nada, .padres), :is(#dc-nada, .col-vtapa){',
    '  color:' + PLATA + '!important;',
    '}',
    /* ⚠ El itinerario SI lleva panel (es una tarjeta con texto adentro).
       Personas NO: ahi el panel hacia el mismo bulto violaceo que la tapa, y
       las fotos redondas ya se recortan solas. Los nombres se apoyan en el
       velo de texto de arriba. */
    ':is(#dc-nada, .tl){ background-color:rgba(30,28,37,.72)!important; }',
    P + ':is(#dc-nada, .padres){ background-color:transparent!important; }',

    /* ⚠⚠⚠ PERSONAS: LAS TRES EN UNA FILA, PEGADAS, Y MAS GRANDES.
       Maki, 20/9/2026: «la skill dice claramente que las personas, cuando son
       tres, tienen que estar una pegada a la otra, y siempre cometes el mismo
       error».
       LA CAUSA, MEDIDA: `.padres` es un grid con `grid-template-columns:168px
       168px` — DOS columnas FIJAS. Con tres personas caia 2 + 1. No era una
       cuestion de lugar: el marco mide 500 px, asi que con `repeat(3,1fr)` y
       8 px de hueco cada tarjeta queda en ~145 px, practicamente los mismos
       151 que tenia. La fila no obligaba a achicar NADA.
       Y ademas van mas grandes: la foto de 74 a 104 px, el nombre de 17 a 18
       y el rol de 12 a 12,5.
       ⚠ Esto lo exige `chequeo/muestra.js`: si las tarjetas de Personas no
         comparten la misma linea, el chequeo FALLA. */
    P + ':is(#dc-nada, .padres){',
    '  display:grid!important;',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important;',
    '  justify-items:center!important;',
    '  align-items:start!important;',
    '}',
    P + ':is(#dc-nada, .padres) .p{ width:100%!important; min-width:0!important; }',
    P + ':is(#dc-nada, .padres) .av{',
    '  width:104px!important; height:104px!important;',
    '  border:1px solid rgba(230,228,238,.30)!important;',
    '  box-shadow:0 0 0 4px rgba(230,228,238,.07), 0 10px 26px rgba(0,0,0,.50)!important;',
    '  filter:grayscale(.55) contrast(1.05)!important;',
    '}',
    P + ':is(#dc-nada, .padres) .nm{',
    '  font-size:18px!important; line-height:1.35!important; color:' + PLATA + '!important;',
    '  -webkit-text-fill-color:' + PLATA + '!important;',
    '}',
    P + ':is(#dc-nada, .padres) .rl{',
    '  font-size:12.5px!important; line-height:1.35!important; color:' + PLATA2 + '!important;',
    '  -webkit-text-fill-color:' + PLATA2 + '!important;',
    '}',

    /* ⚠⚠⚠ LA HOJA DE LA CARTA. MIRADO —NO MEDIDO— EL 20/9/2026.
       El sobre de la carta ya era grafito (la coleccion se queda con
       `--cf-sobre`), pero la HOJA que sale de adentro seguia siendo blanca:
       era la unica cosa clara de toda la invitacion. El motor la trae clavada,
       sin variable:
           .cf-letter{ background:linear-gradient(#fffefb,#faf5ea) }
       asi que ninguna paleta ni ninguna coleccion la habia tocado nunca.

       ⚠ Y OJO CON EL NUMERO: mi barrido de contraste daba ese parrafo en 3,29
       porque resolvia el fondo subiendo hasta el body (negro) sin ver el papel
       blanco del bloque. Contra el papel de verdad SE LEIA. El numero apuntaba
       al bloque correcto por la razon equivocada; lo que estaba mal era la
       tematica, no el contraste. Es la regla de la skill de entrega: la
       medicion encuentra candidatos, la pantalla decide.

       ⚠ POR QUE LA LETRA SE VEIA VIOLETA. `.cf-letter p{color:var(--cf-col)}`
       y la coleccion pone `--cf-col` en plata: plata sobre papel blanco no se
       lee. `reglas-duras.js` lo midio bien y corrigio oscureciendo la plata
       —que tiene tono violeta-azul y poca saturacion— hasta rgb(108,96,153).
       No era un color heredado de otra invitacion: era el guardia trabajando
       sobre un papel equivocado. Con el papel oscuro detecta que el fondo
       cambio (`data-regla-fondo`), vuelve a medir y repone la plata solo.
       Por eso NO hay que tocar `reglas-duras` para esto. */
    P + ':is(#dc-nada, .cf-letter){',
    '  background:linear-gradient(' + PAPEL2 + ',' + PAPEL + ')!important;',
    '  border-color:rgba(230,228,238,.18)!important;',
    '}',
    P + ':is(#dc-nada, .cf-letter)::before{ border-color:rgba(230,228,238,.14)!important; }',
    P + ':is(#dc-nada, .cf-letter) h4{',
    '  color:' + PLATA + '!important; -webkit-text-fill-color:' + PLATA + '!important;',
    '}',
    P + ':is(#dc-nada, .cf-letter) p{',
    '  color:' + PLATA2 + '!important; -webkit-text-fill-color:' + PLATA2 + '!important;',
    '}',

    /* ⭐ LA BOLA DE ESPEJOS EN EL INTERRUPTOR DE CONFIRMAR.
       Maki: «estaria bueno poner una bola de boliche tanto en el itinerario
       cuando va bajando como en el boton de asistir o no asistir».
       La perilla (`.per`) era un degrade generico. Ahora es la MISMA bola que
       marca cada momento del itinerario — pedida al modulo del simbolo, no
       copiada, asi no se pueden desincronizar. */
    /* ⚠⚠ LA PERILLA VUELVE A SER LISA, A PROPÓSITO. Maki, 20/9/2026: «lo mismo
       para el botón que le pusiste esa bola de boliche horrible».
       Una bola de espejos DIBUJADA a 22 px no se lee como una bola: se lee como
       un circulito rayado. Es la regla que ya estaba escrita y que volví a
       romper: «las cosas dibujadas con CSS no reemplazan a una foto — el CSS
       sirve para SUPERFICIES y para LÍNEAS, no para objetos».
       Hasta que esté la pieza FOTOGRAFIADA (`invitame/piezas/bola-espejos`), la
       perilla va lisa en plata pulida, que es prolijo y no finge ser un objeto. */
    /* ⭐⭐⭐ LA BOLA DE ESPEJOS FOTOGRAFIADA. 20/9/2026.
       Maki: «la dibujaste asi a mano... es muy malo eso, esta dibujado pesimo.
       Necesitamos algo mas profesional. Es mas, hasta la bola esa estaria
       bueno que este dando vueltas, que genere un brillo.»

       LA PIEZA: generada en Google Flow (Imagen · 1:1 · Nano Banana 2 · x4,
       0 creditos), recortada como CIRCULO con alfa y subida a Cloudinary en
       `invitame/piezas/bola-espejos` — 480x480, WebP, 46 KB.
       ⚠ El recorte va por TEXTURA, no por color: la bola tiene facetas y el
         fondo y el DESTELLO DE LA LENTE son lisos. Recortando por color, el
         destello entraba como parte del sujeto e inflaba el radio: quedaba un
         anillo gris alrededor de la bola. Medido y corregido.

       VA EN LOS TRES LUGARES QUE PIDIO MAKI, con la MISMA pieza:
         · la marca de cada momento del itinerario
         · la tapa de la playlist (el aro)
         · la perilla de «asistire / no podre»

       EL MOVIMIENTO (lo eligio Maki: «gira lento + destello que barre»):
         · una luz que cruza la esfera de derecha a izquierda en 12 s — eso es
           lo que se lee como que la bola gira, sin deformar la foto;
         · un destello fino que la barre en diagonal cada 6 s.
       Las dos son capas de degrade en `screen` ARRIBA de la foto, movidas con
       `background-position`. Revisado cuadro por cuadro: el halo del giro
       arranco al 55% y empanaba las facetas; quedo en 42% y bien chico.

       ⚠⚠ POR QUE ESTO NO ANDABA: `efectos/simbolo-tematica.js` pintaba la
       marca con el ATAJO `background: <url> ... !important`, y un atajo
       escribe TODAS sus longhands — incluida `background-position: center
       !important`. Una declaracion !important de autor le gana a una
       animacion, asi que los @keyframes se registraban y no movian nada.
       Arreglado EN EL ORIGEN: ese modulo ya no usa el atajo, y ademas se corre
       solo cuando el <html> tiene `data-marca-propia`, que lo pone `poner()`
       aca abajo. */
    /* ⚠️⚠️ LA PRIMERA VERSIÓN DE ESTO NO SE VEÍA, Y ESO ES LO MISMO QUE NO
       ESTAR. Maki, 20/9/2026, mirándolo con la ventana adelante: «no dan
       vueltas las bolas de boliche en el itinerario». Y tenía razón.
       Estaba bien armado y mal pensado: eran DOS capas, un halo que se corría
       3 px en 6 segundos y un destello de 840 ms que pasaba dos veces por
       minuto. Sobre una bola de 22 px eso no se lee como que gira: no se lee
       como nada.
       ⚠ LA LECCIÓN: a 22 px un movimiento sutil no es sutil, es inexistente.
         El tamaño manda sobre el buen gusto. Lo que a 200 px sería elegante,
         a 22 px hay que hacerlo tres veces más grande y tres veces más
         seguido, o no hacerlo.
       AHORA: UNA sola banda de luz ancha que cruza la esfera entera, sin
       parar, una pasada cada 2,6 s. Eso es lo que el ojo lee como rotación. */
    /* ⭐⭐ LA PISTA: el cuadrado del itinerario         ★ 21/9/2026 ★

       Maki: «me gustaría que le pongas un poco más de diseño al cuadrado que
       hiciste… puede ser más negro, con algún efecto. Pensá que es todo,
       todo de temática boliche».

       Era un rectángulo gris translúcido (rgba(30,28,37,.72)), sin borde, sin
       esquinas, sin sombra: un bloque de relleno. Ahora es UNA PARED DE
       BOLICHE con la bola tirándole luz encima:
         · base casi negra, más oscura que el papel, con caída de luz desde
           arriba (de donde cuelga la bola);
         · los DESTELLOS que la bola tira sobre la pared, desparramados y de
           tamaños distintos — no simétricos, que es lo que los delata como
           dibujados;
         · esquinas redondeadas, filete de plata finito y sombra propia, así
           la pista se despega del fondo en vez de ser una mancha;
         · y un HAZ de luz que la cruza cada 9 s (el ::after, que estaba
           libre: el ::before es la línea vertical del itinerario).
       ⚠ El haz va en `screen` y al 8%: tiene que ADIVINARSE, no iluminar. */
    P + ':is(#dc-nada, .tl){',
    /* ⚠️⚠️ EL COLOR DE FONDO VA APARTE, Y NO ES UN DETALLE. Medido el 21/9.
       La primera versión de esta pista usaba el atajo `background:` con puros
       degradados. Un atajo reescribe TODAS sus longhands, así que dejaba
       `background-color` en `transparent` — y `reglas-duras.js`, que mide el
       contraste leyendo `backgroundColor`, se quedó sin color y resolvió
       BLANCO: `data-regla-fondo="240,239,242"`. Conclusión suya: «texto plata
       sobre blanco, ilegible» → lo dio vuelta a NEGRO. Negro sobre negro, el
       itinerario entero desaparecido, y el motor convencido de estar
       arreglándolo.
       ⚠ LA REGLA: todo panel que se oscurece declara su `background-color`
         OPACO. Los degradados van en `background-image`. Si el color no está,
         el que mide el contraste inventa uno — y te da vuelta el texto. */
    /* ⚠️⚠️⚠️ EL FONDO DE ESTE PANEL NO LLEVA NINGUNA CAPA CLARA. NINGUNA.
       Tercer intento, y acá está la regla de verdad (21/9/2026).
       `reglas-duras.js` → `fondosDe()` abre cada degradado, compone sus
       paradas y se queda con la MÁS CLARA para decidir el color del texto.
       Con destellos blancos al 55% leyó el panel como BLANCO (240,239,242) y
       dio vuelta el itinerario a texto negro sobre negro. Los bajé a plata al
       26% y siguió leyendo claro (179,178,190): atenuar NO alcanza.
       ⚠ LA REGLA, sin medias tintas: en un panel oscuro el `background` va
         SÓLO con colores oscuros. Todo lo que brille se pinta en el `::after`,
         que no es ancestro del texto y por eso no entra en la cuenta del
         contraste. El brillo se ve igual; la cuenta no se ensucia. */
    '  background-color:#07070c!important;',
    '  background-image:',
    '    radial-gradient(150% 62% at 50% -10%, rgba(24,23,34,.9), transparent 62%),',
    '    linear-gradient(180deg, #0a0912 0%, #07070c 58%, #050509 100%)!important;',
    '  border-radius:20px!important;',
    '  border:1px solid rgba(230,228,238,.13)!important;',
    '  box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 22px 46px rgba(0,0,0,.55)!important;',
    '  padding:26px 14px 22px!important;',
    '  overflow:hidden!important;',
    '  position:relative!important;',
    '}',
    /* ⭐⭐ EL FONDO DE LA PISTA SE MUEVE SIEMPRE, NO CADA TANTO. 21/9/2026.
       Maki, mirando la primera versión de este recuadro: «si yo veo que algo
       pasa, pasa varios segundos, o sea, como si lo paso de largo, es como
       que no pasó nada, quedó derecho, quedó como una imagen fija, no como
       algo atrás».
       Tenía razón y el número lo dice: un haz cada 9 s son 8,2 s de NADA.
       Y lo que hace una bola de espejos de verdad no es un destello cada
       tanto: son puntitos de luz que nunca se quedan quietos.
       Ahora el ::after lleva TRES capas que viajan juntas en un solo bucle
       continuo, sin pausa:
         · lunares chicos bajando en diagonal hacia la derecha,
         · lunares grandes yendo al revés (dos velocidades = profundidad),
         · y el haz, que cruza dentro del mismo ciclo.
       ⚠ EL BUCLE NO SE NOTA PORQUE CADA CAPA VIAJA UN MÚLTIPLO EXACTO DE SU
         MOSAICO: 184px = 4×46 y 2×92; 92px = 2×46 y 1×92. Si el viaje no es
         múltiplo del `background-size`, al reiniciar pega un salto visible y
         se ve peor que si no se moviera.
       ⚠ Y SIGUE TODO ADENTRO DEL ::after. El `background` del panel no lleva
         ninguna capa clara (ver la regla de arriba): si el brillo se mete en
         el fondo del panel, `reglas-duras.js` lo lee como panel claro y da
         vuelta el itinerario a texto negro sobre negro. */
    '@keyframes discoPista{',
    '  from { background-position: 0 0, 0 0, -85% 0; }',
    '  to   { background-position: 296px -148px, -256px 128px, 185% 0; }',
    '}',
    /* la luz que baja por el hilo del itinerario, siempre */
    '@keyframes discoHilo{',
    '  from { background-position:0 0; }',
    '  to   { background-position:0 14px; }',
    '}',
    P + ':is(#dc-nada, .tl)::after{',
    '  content:""; position:absolute; inset:0; pointer-events:none;',
    '  background-color:transparent;',
    /* ⚠⚠ LA CALIBRACIÓN, MIRADA Y CORREGIDA EL MISMO Día. Primera versión:
       lunares de 20 px en una grilla de 46 px. Se movía — y quedaba un
       EMPAPELADO DE LUNARES peleando con el texto, no luz de bola de espejos.
       ⚠ LA REGLA: la luz de una bola de espejos es POCA, CHICA Y SEPARADA.
         Grilla grande (74 y 128 px), punto chico (6 y 16 px de radio) y alfa
         baja (.34 y .14). Si los puntos se tocan entre sí, ya es un estampado.
       ⚠ Y el haz baja a .09 y a una banda SIMÉTRICA: la versión anterior
         terminaba en .03 y dejaba un borde vertical duro a la vista. */
    '  background-image:',
    '    radial-gradient(circle at 50% 50%, rgba(255,255,255,.34) 0, rgba(255,255,255,0) 11%),',
    '    radial-gradient(circle at 50% 50%, rgba(214,212,228,.14) 0, rgba(255,255,255,0) 18%),',
    '    linear-gradient(100deg, transparent 0%, rgba(255,255,255,.09) 50%, transparent 100%);',
    '  background-size:74px 74px, 128px 128px, 80% 100%;',
    '  background-repeat:repeat, repeat, no-repeat;',
    '  mix-blend-mode:screen;',
    '  animation:discoPista 7s linear infinite;',
    '}',
    /* ⭐ LA LÍNEA EMPIEZA EN LA PRIMERA BOLA Y TERMINA EN LA ÚLTIMA.
       Maki: «la línea esa que pasa entre las bolas de boliche... antes que
       llegue la primera bola, eso lo podés eliminar porque queda muy mal. Y
       después, cuando termina la última bola, lo podés eliminar la línea
       para abajo, porque queda desubicada».
       Son DOS elementos, no uno: la vía (`.tl::before`) y el relleno que
       avanza con la hora. Los dos iban de borde a borde.
       Las dos puntas se recortan con las variables de acá abajo, medidas por
       la función del final del archivo (no se puede con CSS solo: dependen
       del alto real de la primera y la última ficha, que lo decide el texto).
       Y la vía deja de ser una raya muerta: es un hilo punteado de plata con
       la luz bajando. */
    P + ':is(#dc-nada, .tl)::before,',
    P + ':is(#dc-nada, .tl) > .tl-prog{',
    '  top:var(--tl-ini, 6px)!important;',
    '  bottom:var(--tl-fin, 6px)!important;',
    '  height:auto!important;',
    '}',
    P + ':is(#dc-nada, .tl)::before{',
    '  background-color:transparent!important;',
    '  background-image:repeating-linear-gradient(180deg, rgba(230,228,238,.60) 0 7px, rgba(230,228,238,.12) 7px 14px)!important;',
    '  box-shadow:0 0 8px rgba(230,228,238,.20)!important;',
    '  animation:discoHilo 1.1s linear infinite;',
    '}',
    '@media (prefers-reduced-motion: reduce){',
    P + ':is(#dc-nada, .tl)::after{ animation:none; }',
    P + ':is(#dc-nada, .tl)::before{ animation:none; }',
    '}',

    /* ⭐⭐ LA RASPADITA: redonda, y se raspa una bola de espejos
       Maki: «no sé si se puede poner en la raspadita también las bolas de
       boliche. Si se puede y queda bien y se puede raspar, genial. Si no,
       hacé las circulares. Como todo es circular, estaría bueno que eso sea
       así». Se pudo hacer LAS DOS COSAS.
       · `--r3-tapa` es la variable que lee `efectos/raspadita.js` desde hoy:
         pinta ESA foto sobre el lienzo, y el invitado la raspa.
       · Y las celdas pasan a círculo. El SVG de fondo sigue con esquinas
         redondeadas adentro, pero el `overflow:hidden` lo recorta: no hace
         falta tocarlo. */
    /* ⚠️⚠️ LA VARIABLE VA EN LA RAMA DEL LIENZO, NO EN LA DE LAS FICHAS.
       Medido el 21/9/2026. Maki: «veo que no se puede poner la bola de
       boliche para raspar, ¿siempre es liso?».
       Estaba programado y no se aplicaba. La raspadita son DOS ramas
       separadas del árbol, no una:
         · `.rasp-3 > .r3-f`   = las fichas de abajo (lo que se revela)
         · `#scratchcard > .rasp-zona > canvas` = la tapa que se raspa
       Yo había puesto `--r3-tapa` en `.rasp-3`, y las variables de CSS sólo
       bajan a los DESCENDIENTES: el lienzo nunca la vio. Por eso seguía
       pintando el degradado liso de fábrica.
       ⚠ LA REGLA: antes de pasarle un dato por variable a un módulo, mirar
         de quién CUELGA el elemento que la va a leer. Que el selector
         'parezca' el del bloque no alcanza.
       Va en la sección entera, así la ven las dos ramas. */
    P + ':is(#dc-nada, .scratch-sec, .rasp-3, .rasp-zona){',
    '  --r3-tapa:url("https://res.cloudinary.com/oc8cgqt4/image/upload/v1789953744/invitame/piezas/bola-espejos.webp");',
    '}',
    P + ':is(#dc-nada, .rasp-3) .r3-f{',
    '  border-radius:50%!important; overflow:hidden!important;',
    '  box-shadow:0 0 0 1px rgba(230,228,238,.22), 0 10px 22px rgba(0,0,0,.5)!important;',
    '}',
    P + ':is(#dc-nada, .rasp-3) .r3-f canvas{',
    '  border-radius:50%!important;',
    '}',
    '@keyframes discoBola{',
    '  from { background-position: 165% 50%, 50% 50%; }',
    '  to   { background-position:-165% 50%, 50% 50%; }',
    '}',
    P + ':is(#dc-nada, .tl) > .it::before,',
    P + ':is(#dc-nada, .rd-tapa) .rd-aro,',
    P + ':is(#dc-nada, .rsvp-sw) .per{',
    '  background-image:',
    '    linear-gradient(97deg, rgba(255,255,255,0) 26%, rgba(255,255,255,.62) 50%, rgba(255,255,255,0) 74%),',
    '    url("https://res.cloudinary.com/oc8cgqt4/image/upload/v1789953744/invitame/piezas/bola-espejos.webp")!important;',
    '  background-size:200% 100%, 100% 100%!important;',
    '  background-repeat:no-repeat!important;',
    '  background-blend-mode:screen, normal!important;',
    '  background-color:transparent!important;',
    '  border-radius:50%!important;',
    '  border:0!important;',
    '  animation:discoBola 2.6s linear infinite;',
    '}',
    P + ':is(#dc-nada, .tl) > .it::before{',
    '  width:22px!important; height:22px!important;',
    '  box-shadow:0 0 10px rgba(230,228,238,.30)!important;',
    '  -webkit-mask:none!important; mask:none!important;',
    '}',
    P + ':is(#dc-nada, .tl).tl-centro > .it:nth-child(odd)::before{ margin-top:-11px!important; right:-36.5px!important; }',
    P + ':is(#dc-nada, .tl).tl-centro > .it:nth-child(even)::before{ margin-top:-11px!important; left:-36.5px!important; }',
    P + ':is(#dc-nada, .rd-tapa) .rd-aro{',
    '  box-shadow:0 0 0 1px rgba(230,228,238,.30), 0 0 22px rgba(230,228,238,.22)!important;',
    '  backdrop-filter:none!important;',
    '}',
    P + ':is(#dc-nada, .rsvp-sw) .per{',
    '  box-shadow:0 0 0 1px rgba(230,228,238,.32), 0 3px 10px rgba(0,0,0,.6)!important;',
    '}',
    '@media (prefers-reduced-motion: reduce){',
    P + ':is(#dc-nada, .tl) > .it::before,',
    P + ':is(#dc-nada, .rd-tapa) .rd-aro,',
    P + ':is(#dc-nada, .rsvp-sw) .per{ animation:none!important; }',
    '}',
    P + ':is(#dc-nada, .rsvp-sw) .pozo{',
    '  background:' + PAPEL + '!important;',
    '  box-shadow:inset 0 0 0 1px rgba(230,228,238,.18)!important;',
    '}',

    'html[data-col="' + ID + '"] body{ background-color:' + PAPEL + '!important; }'
  ].join('\n');

    return CSS;
  }

  /* ---- prender y apagar ---------------------------------------------------- */
  function activa() {
    try {
      var ev = window.INVEV || {};
      return !!(ev.fx && String(ev.fx.coleccion || '').toLowerCase() === ID);
    } catch (e) { return false; }
  }

  function hoja() {
    var s = document.getElementById('col-' + ID);
    if (!s) {
      s = document.createElement('style');
      s.id = 'col-' + ID;
      document.head.appendChild(s);
    }
    var txt = armarCSS();
    if (s.textContent !== txt) s.textContent = txt;
  }

  function sacarHoja() {
    var s = document.getElementById('col-' + ID);
    if (s) s.parentNode.removeChild(s);
  }

  /* ⚠️⚠️ QUE LAS REGLAS DURAS VUELVAN A MEDIR. MEDIDO EL 19/9/2026.
     `reglas-duras.js` mira el color que hay DEBAJO de cada texto y le escribe
     el color de letra en el ATRIBUTO `style`, con `!important`:

       color: rgb(20,18,18) !important;
       -webkit-text-fill-color: rgb(20,18,18) !important;
       text-shadow: rgba(255,255,255,.55) 0 1px 2px !important;

     Un estilo en línea con `!important` le gana a CUALQUIER hoja, incluso a
     una hoja con `!important`. Y como las reglas duras miden ANTES de que la
     colección oscurezca las superficies, dejan escrito «esto va casi negro
     con halo blanco» sobre tarjetas que un segundo después son grafito: 115
     textos negros sobre negro. Eso, y no otra cosa, era el «color con color».

     No se toca el motor: las reglas duras firman lo que pintan con
     `data-regla-luz`, así que alcanza con BORRARLES LA FIRMA una sola vez,
     cuando la colección se prende. En el siguiente repaso vuelven a medir —
     ahora contra el grafito — y pintan plata ellas solas.

     ⚠️ UNA SOLA VEZ, cuando PASA de apagada a prendida. Si se hiciera en cada
     repaso, se estaría borrando y repintando doce veces cada diez segundos.
     `data-regla-inline` = 1 marca lo que ya venía escrito a mano: no se toca. */
  function despintarUnaVez() {
    var marco = document.querySelector('.frame');
    if (!marco) return;
    var nodos = marco.querySelectorAll('[data-regla-luz]');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el.getAttribute('data-regla-inline') === '1') continue;
      el.style.removeProperty('color');
      el.style.removeProperty('-webkit-text-fill-color');
      el.style.removeProperty('text-shadow');
      /* ⚠⚠ Y LA OPACIDAD. MEDIDO EL 20/9/2026.
         Cuando el texto tiene una transicion sobre `opacity` (todos los
         titulos la tienen, por el reveal), reglas-duras no puede forzarla a 1:
         entonces DESPEJA el color y deja una opacidad parcial. En «Donde y
         cuando» y «Como va a ser la noche» dejo `opacity: 0.49 !important`
         y `0.5`. Sobre negro eso no es un texto mas suave: es un texto que no
         esta. Borrarsela tambien deja que vuelva a medir contra el grafito, y
         ahi ya no necesita compensar nada.
         (El error 26 de `reglas-duras` ya evita que eso vuelva a pasar; esto
          queda como red para lo que hubiera quedado escrito antes.) */
      el.style.removeProperty('opacity');
      el.removeAttribute('data-regla-luz');
    }
  }

  var estabaPuesta = false;

  /* ⚠️⚠️ NO ESCRIBIR SI YA ESTÁ ESCRITO. MEDIDO EL 19/9/2026.
     La primera versión hacía `setAttribute('data-col', ID)` en cada repaso, aunque
     el atributo ya valiera lo mismo. Poner un atributo ES una mutación aunque no
     cambie nada, y `reglas-duras.js` corre `pasada()` con CADA cambio de atributo
     del marco: el repaso se disparaba a sí mismo el módulo más caro de la
     invitación, doce veces cada diez segundos. Queda igual, porque está bien —
     pero ojo con la lección de al lado: la caída a 2 fps que le eché la culpa a
     esto NO era esto. Era la ventana de Chrome MINIMIZADA. Ver la skill del
     banco de pruebas: una ventana minimizada no dibuja ni un cuadro, `rAF` no
     corre nunca y la medición da 0 sin que nada esté roto. Medidos 60,3 fps con
     la colección prendida, los dos videos andando y las nubes encima. */
  /* ⭐ LA MEDIDA DE LAS DOS PUNTAS DE LA LÍNEA DEL ITINERARIO. 21/9/2026.
     El motor dibuja la vía y su relleno de avance de borde a borde del panel
     (`top:6px; bottom:6px`), así que sobra línea antes de la primera bola y
     después de la última.
     ⚠ NO SE ARREGLA SÓLO CON CSS: la primera bola está en
       `padding-top + alto-de-la-primera-ficha / 2`, y ese alto depende del
       texto que cargue Jazmín. Por eso se MIDE y se pasa por variable.
     ⚠ Se vuelve a medir en cada repaso (cada 1,2 s), así sigue bien cuando
       gira el teléfono o cambia un texto. Son dos `getBoundingClientRect`:
       no pesa. */
  function lineaItinerario() {
    try {
      var tl = document.querySelector('.tl.tl-centro');
      if (!tl) return;
      var fichas = tl.querySelectorAll(':scope > .it');
      if (fichas.length < 2) return;
      var R = tl.getBoundingClientRect();
      var a = fichas[0].getBoundingClientRect();
      var b = fichas[fichas.length - 1].getBoundingClientRect();
      if (!R.height || !a.height || !b.height) return;
      var ini = Math.round(a.top + a.height / 2 - R.top);
      var fin = Math.round(R.bottom - (b.top + b.height / 2));
      if (!(ini > 0 && fin > 0)) return;
      if (tl.style.getPropertyValue('--tl-ini') !== ini + 'px') tl.style.setProperty('--tl-ini', ini + 'px');
      if (tl.style.getPropertyValue('--tl-fin') !== fin + 'px') tl.style.setProperty('--tl-fin', fin + 'px');
    } catch (e) {}
  }

  function poner() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') !== ID) raiz.setAttribute('data-col', ID);
    /* ⚠⚠ EL GANCHO QUE EL MOTOR YA TENIA Y YO NO ESTABA USANDO.
       17 reglas del motor estan escritas como `html:not([data-coleccion]) ...`
       y son justo los defaults CLAROS: la raspadita, el pase, el QR, el
       itinerario, la tapa del video y Personas. Poniendo el atributo se apagan
       solas, como esta previsto, en vez de taparlas a martillazos. */
    if (raiz.getAttribute('data-coleccion') !== ID) raiz.setAttribute('data-coleccion', ID);
    /* ⭐ avisa que la marca del itinerario es NUESTRA (la bola fotografiada),
       asi `efectos/simbolo-tematica.js` no le pinta encima su dibujo. */
    if (raiz.getAttribute('data-marca-propia') !== ID) raiz.setAttribute('data-marca-propia', ID);
    if (window.INVCOLPALETA !== PALETA_PROPIA) window.INVCOLPALETA = PALETA_PROPIA;
    hoja();
    lineaItinerario();
    if (!estabaPuesta) {
      estabaPuesta = true;
      /* un respiro para que la paleta ya haya repintado las variables */
      setTimeout(despintarUnaVez, 1800);
      setTimeout(despintarUnaVez, 4000);
    }
  }

  function sacar() {
    if (document.documentElement.getAttribute('data-col') === ID) {
      document.documentElement.removeAttribute('data-col');
      document.documentElement.removeAttribute('data-coleccion');
      document.documentElement.removeAttribute('data-marca-propia');
    }
    if (window.INVCOLPALETA === PALETA_PROPIA) { window.INVCOLPALETA = null; }
    estabaPuesta = false;
    sacarHoja();
  }

  /* ⚠️ NADA DE MutationObserver ACÁ. Ya se pagó el 19/9/2026 con los videos:
     la invitación muta en bucle (reglas-duras.js corre con cada cambio de clase
     del marco), así que un observador dispara decenas de veces por segundo.
     Un repaso cada tanto alcanza y no machaca nada. */
  function sincronizar() {
    if (activa()) { poner(); } else { sacar(); }
  }

  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }

  /* para poder prenderla y apagarla a mano desde la consola, al revisar */
  window.INVDISCO = { poner: poner, sacar: sacar, paleta: PALETA_PROPIA, css: armarCSS };
})();
