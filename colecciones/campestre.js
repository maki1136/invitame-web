/* ===== COLECCIÓN «CAMPESTRE» ================================================

   La cuarta familia de Invítame. Nace de la referencia que mandó Maki el
   21/9/2026 —la boda rústica-campestre de la plataforma VIEJA
   (invitameok.com/rustica-campestre)— con el encargo de hacer «algo como esto
   pero con nuestra nueva plataforma, con movimiento, video, etc.».

   QUÉ LA HACE DISTINTA DE LAS OTRAS TRES (la regla de las muestras diferentes)

     · Perlas   → playa, violeta y perlas, botón LACRE,   Cormorant + Great Vibes
     · Marfil   → papel marfil, portada sin foto, NÁCAR,  Cormorant + Parisienne
     · Disco    → noche, plata sobre negro, bola espejos, Montserrat + Rouge
     · Campestre→ campo al atardecer, crema y oliva,      Forum + Sacramento + Lora
                  botón ARCILLA, marca de OLIVO PRENSADO fotografiado

   Cero cruce: ni una tipografía, ni un botón, ni un color, ni una foto
   compartida con las otras.

   ⭐ LA PALETA NO ES INVENTADA: ESTÁ MEDIDA SOBRE LAS FOTOS
   Se sacó por k-means de la propia tanda de Flow (el poster del fondo, la
   portada, la capilla y el flat lay de vestimenta). Los cremas daban #f2e2ca,
   #e9ddca, #e7e5e0 y #fcf3e4; los oscuros #26210d, #372d13 y #3d2f16. De ahí
   salen PAPEL y TINTA, no de mi cabeza.

   ⭐ Y ESTÁ MEDIDA CONTRA EL PISO DE CONTRASTE DE LA PLATAFORMA (5,0 / 4,0):
       TINTA  #2F3320 sobre el papel .... 10,81  ✅ texto normal
       TINTA2 #55523A .................... 6,58  ✅ texto normal
       TINTA3 #7A7458 .................... 3,91  ⚠️ SOLO filetes y bordes
       SALVIA #6B7558 .................... 4,05  ⚠️ SOLO texto grande
       TERRA  #96502F .................... 5,01  ✅ acento de texto
       TRIGO  #C29A5B .................... 2,17  ⚠️ SOLO adorno, NUNCA texto
     y sobre el panel oscuro #221E14:
       crema 13,82 · trigo claro #D8B472 8,46 · salvia clara #B9C3A6 9,04
   ⚠️ Si alguien cambia un color, vuelve a correr esta cuenta ANTES de subir.
      Es exactamente lo que se saltó Marfil en la fase 4 y costó la fase 6.

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'campestre'`.
   ⭐ Y ESTÁ EN EL PANEL: entrada 'campestre' en el array COLECCIONES de
      `efectos/panel-coleccion.js`. Regla del 21/9: si Jazmín no la puede
      elegir, la colección no existe.
   ============================================================================ */
(function () {
  'use strict';

  var ID    = 'campestre';
  var SELLO = 'html[data-col="campestre"][data-coleccion="campestre"] ';

  /* ---------------------------------------------------------------- tipografía
     Las tres ya las carga el motor (están en el <link> de Google Fonts de
     i/index.html), así que la colección NO pide fuentes nuevas: si pidiera,
     habría un salto de tipografía en el primer pintado.
     ⚠️ Forum y Lora son justamente las dos de la referencia de Maki. */
  var SERIF   = '"Forum", "Cormorant Garamond", Georgia, serif';
  var CURSIVA = '"Sacramento", "Tangerine", cursive';
  var CUERPO  = '"Lora", Georgia, serif';

  /* ------------------------------------------------------------------ colores */
  var PAPEL   = '#f3e9d9';   /* crema cálido: el papel */
  var PAPEL2  = '#efe4d1';   /* el mismo, un punto más tostado */
  var TINTA   = '#2f3320';   /* oliva muy oscuro: títulos y texto principal */
  var TINTA2  = '#55523a';   /* bajadas y datos */
  var TINTA3  = '#7a7458';   /* ⚠️ SOLO filetes, bordes y separadores */
  var SALVIA  = '#6b7558';   /* verde salvia oscuro: nombres de lugar */
  var SALVIACL= '#b9c3a6';   /* salvia clara: sobre el panel oscuro */
  var TRIGO   = '#c29a5b';   /* ⚠️ SOLO adorno: no pasa el contraste como texto */
  var TERRA   = '#96502f';   /* terracota oscura: el acento */
  var OSCURO  = '#221e14';   /* el panel de noche: itinerario, carta, contacto */

  /* ⚠️⚠️ LO QUE LA COLECCIÓN LE RECLAMA A `efectos/paleta.js`.
     Misma historia que Marfil: la paleta elegida reescribe estas variables en
     el <html> con `!important` cada 1,5 s, y contra eso no gana ninguna hoja.
     Publicando la tabla, `paleta.js` pinta ESTOS valores.
     Se reclaman también las SUPERFICIES, porque Campestre cambia el papel: sin
     ellas, abajo de una invitación crema asoman los grises del molde. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,
    '--verde2':    '#242817',
    '--muted':     TINTA2,
    '--cream':     '#f7f1e4',
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col-v': TINTA,
    '--sage':      SALVIA,
    '--sage-cl':   '#cdd3bd',
    '--oro':       TRIGO,
    /* superficies
       ⚠️⚠️ `--sec-col` ES EL PAPEL DE LAS SECCIONES NORMALES, NO EL PANEL OSCURO.
          Visto el 21/9/2026 mirando la muestra: la primera versión le pasaba
          OSCURO (#221e14) y el motor lo aplica al 38% sobre el fondo de video,
          así que TODAS las secciones comunes quedaban con un velo gris topo,
          alternando con las `.sec.verde` que sí salían claras. La invitación
          parecía a dos aguas. El panel oscuro del itinerario no sale de acá:
          lo pone la propia colección en `.tl` y en `--tl-papel`. */
    '--sec-col':   PAPEL,
    '--tl-papel':  OSCURO,
    '--tl-tinta':  '#f3e9d9',
    '--cf-sobre':  '#ddcdb2',
    '--cf-col':    TINTA,
    '--sobre-c':   '#ddcdb2',
    '--flap-base': '#d2c0a2',
    '--seal-c':    TERRA
  };
  /* ⚠️⚠️⚠️ LA TABLA **NO** SE PUBLICA ACÁ ARRIBA.
     Encontrado el 21/9/2026 mirando la muestra de PERLAS: este archivo se
     carga en TODAS las invitaciones (viene en el paquete de `todo.php`), así
     que un `window.INVCOLPALETA = PALETA_PROPIA` al ras del módulo le pisaba
     la paleta a las invitaciones de las otras colecciones. Medido en
     `camila-y-tomas`, que es perlas: `--verde` salía #2f3320 en vez del
     #44513f de Perlas, `--sec-col` salía el papel crema de Campestre y
     `--tl-papel` el panel #221e14 de Campestre. Y `paleta.js` los reescribe
     en el <html> con `!important` cada 1,5 s, así que no había cómo ganarle.
     Se publica en `poner()` y se BORRA en `sacar()`, como hace Marfil. */

  /* --------------------------------------------------------------- la pieza
     El medallón de papel hecho a mano con una ramita de OLIVO PRENSADA,
     fotografiado y recortado con alfa.

     ⚠️ VA EN **TRES** LUGARES, NO EN CUATRO: la marca de cada momento del
        itinerario, la perilla del interruptor de confirmar y la tapa de la
        raspadita. La skill pide un cuarto —la tapa de la playlist— y **acá no
        va**, porque Maki pidió el 22/9 que esas tapas no se vean. Se anota a
        propósito para que nadie la «arregle» volviéndola a poner.

     ⭐ ANTES ERA UN DISCO DE MADERA, y se cambió por pedido de Maki:
        «me gustaría cambiar los troncos de la raspada, parecen culos, hacé
        otra cosa más linda». Tres discos en fila, con el canto oscuro y el
        centro pálido, leían mal. El olivo prensado resuelve las dos cosas:
        es más lindo, y lo que se repite son tres RAMITAS, no tres discos.

     ⚠️ EL RECORTE NO SE HACE POR VARIANZA ni por luminancia. El desvío local
        mete la SOMBRA DE CONTACTO adentro del sujeto. Acá va por COLOR, que
        separa las tres cosas de una sola pasada: el papel es cálido
        (R−B > 8), la hoja es verde (G−R > 3), y la sombra es gris neutro,
        así que se cae sola. Después se ajusta un círculo al percentil 99,3 de
        los radios, se cierra, se rellenan huecos, y el borde se difumina
        1,2 px para que el canto deckle no salga con escalera.
     ⚠️ SE PRUEBA A LOS CUATRO TAMAÑOS REALES sobre el papel crema: 22 px (la
        marca del itinerario), 40, 84 (la tapa de la playlist) y 160. A 22 px
        el disco casi se funde con el papel —es crema sobre crema— y lo que
        sostiene la marca es EL VERDE de la hoja. Medido a 22 px sobre
        #f3e9d9: luminancia media 213 contra 234 del papel, mínimo 130.
        Si alguna vez se cambia la pieza, la cuenta se vuelve a hacer: una
        pieza que sólo funcione grande deja el itinerario sin marca. */
  var PIEZA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1790044213/invitame/piezas/olivo-prensado.webp';

  /* el fondo por defecto de la colección: el campo con viento, en video.
     Medido: 6,83 s de loop, 945 KB, movimiento medio 4,52 con mínimo 2,24
     (el fondo de playa que Maki aprobó mide 2,85 de media). */
  var FONDO_VIDEO  = 'https://res.cloudinary.com/oc8cgqt4/video/upload/v1789978328/invitame/fondos/campo-viento-atardecer.mp4';
  var FONDO_POSTER = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1789978338/invitame/fondos/campo-viento-atardecer-poster.jpg';

  /* ------------------------------------------------------------------ ayudas */
  function ev()   { try { return window.INVEV || {}; } catch (e) { return {}; } }
  function activa() {
    try { return String((ev().fx || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }
  function tieneFuentePropia() {
    try { var f = (ev()).nfont; return !!(f && String(f).trim()); } catch (e) { return false; }
  }

  /* ============================================================== EL FONDO ===
     La colección se lo pone sola a cualquier invitación que no traiga uno
     propio, igual que Marfil.
     ⚠️ ESTO NO ESCRIBE EN LA BASE: sólo completa `INVEV.fx.fondo` EN MEMORIA.
     ⚠️ `donde:'pantalla'` y no 'marco': acá el campo es la ESCENA, no el papel
        de la tarjeta, así que tiene que llenar también los costados.
     ⚠️ `tapeMax` bajo a propósito: Maki, 18/9, «el fondo de video está
        buenísimo, que se vea más». El velo de legibilidad no puede pasar de
        ahí; si un bloque no se lee, se corrige el TEXTO. */
  function ponerFondo() {
    var e = ev(); if (!e.fx) return;
    var f = e.fx.fondo;
    if (f && f.url) return;                    /* la invitación trae el suyo */
    e.fx.fondo = {
      tipo: 'video', url: FONDO_VIDEO, poster: FONDO_POSTER,
      fuerza: 1.04, velo: 0.10, paso: 0.62, oscuras: 0,
      donde: 'pantalla', tapeMax: 0.52
    };
  }

  /* ================================================================ LA HOJA === */
  function armarCSS() {
    var P = SELLO;
    /* el mismo sello, pero sólo cuando NO hay fondo de foto o video */
    var SIN_FONDO = SELLO.replace('html', 'html:not([data-fondo])');
    var propia = tieneFuentePropia();

    return [

    /* ---------------------------------------------------------------- papel
       ⚠️⚠️ EL `!important` DE ACÁ TAPABA EL VIDEO DE FONDO. (21/9/2026)
          `fondo-invitacion.js` abre la columna con
              html[data-fondo] .frame{ background:transparent !important }
          (especificidad 0,2,1). El SELLO de la colección es 0,3,1, así que
          con `!important` de los dos lados ganaba la colección y el papel
          crema quedaba OPACO sobre el video: el fondo cargaba, se reproducía
          —medido, `paused:false`— y no se veía NADA. Se veía sólo el velo
          de afuera, desenfocado, y por eso «se ve algo fuera de foco, muy
          grande, y no se explica».
          Marfil lo tiene bien desde siempre: su `.frame` va SIN `!important`
          (línea 531), así el motor le gana cuando hay foto o video.
          Acá se resuelve más explícito todavía: el papel se pinta SÓLO
          cuando la invitación no tiene fondo puesto. Con fondo, manda el
          motor. */
    SIN_FONDO + '.frame{ background-color:' + PAPEL + '!important; }',
    P + '.sec, ' + P + '.footer{ color:' + TINTA + '; }',

    /* ⭐ EL VELO DE LECTURA. Maki, 21/9/2026: «fíjate de que se vea el fondo».
       Con el `.frame` transparente el fondo se ve en TODA la invitación —que
       es lo que se pidió— y ahí aparece el otro lado del problema: el texto
       cae sobre las hojas de olivo, que son lo más oscuro del video.

       MEDIDO, y con la playa que Maki aprobó como vara. El método: dos
       capturas del MISMO cuadro del video, una con texto y otra sin, la resta
       da la máscara de los glifos, y se mide el contraste de la tinta contra
       el fondo QUE HAY DEBAJO DE CADA LETRA — no contra el promedio de la
       sección, que miente porque la sección es casi toda aire.

           playa (aprobada) ...... percentil 5 = 5,65  (mediana de secciones)
           campestre sin velo .... 3,59   ← no llega
           campestre con velo .... 6,25   ← pasa

       ⚠️ NO SE ARREGLA ACLARANDO EL VIDEO. Se probó: subirle las sombras de
          p5=94 a p5=132 lo deja clavado en los números de la playa (p5 137)
          pero lo LAVA — las hojas de olivo pierden el verde y queda el mismo
          error del lino que Maki ya rechazó. El video se deja como está y se
          aclara SÓLO la franja donde cae el texto.
       ⚠️ Es la misma idea de Marfil (una banda de papel difuminada), con dos
          diferencias: el papel es el crema de Campestre, y los bordes quedan
          abiertos —`inset:0 9%` y el degradado a cero en las puntas— así el
          trigo sigue entrando por los costados y el fondo se sigue leyendo.
       ⚠️ VA DETRÁS: `z-index:0` en el velo y `z-index:1` en los hijos. Al
          revés TAPA EL TEXTO: es el mismo bug que ya pagó `botones.js`.
       ⚠️ Y LLEVA `blur`: sin el desenfoque se ve el rectángulo.
       ⚠️⚠️ LAS SECCIONES CON FOTO PROPIA QUEDAN AFUERA. `#contacto-sec` (las
          velas) y el pase traen su propia foto en el `style` en línea: el
          crema encima las apaga y deja el título ilegible. Visto.
          El filtro busca `url(` y NO «background-image», porque las
          `.sec.verde` también escriben `background-image` en línea —en
          `none`, se lo pone el módulo de la temática— y buscando el nombre de
          la propiedad se quedaban las cuatro sin velo. Medido antes y
          después: con «background-image» la mediana daba 5,50 y cuatro
          secciones seguían en 3,1; con `url(` da 6,25 y la peor es 5,10. */
    P + '.sec:not([style*="url("]){ position:relative; }',
    P + '.sec:not([style*="url("])::before{',
    '  content:""; position:absolute; z-index:0; inset:0 9%;',
    '  pointer-events:none;',
    '  background:linear-gradient(90deg, rgba(243,233,217,0) 0%,',
    '    rgba(243,233,217,.52) 15%, rgba(243,233,217,.52) 85%,',
    '    rgba(243,233,217,0) 100%);',
    '  filter:blur(14px);',
    '}',
    P + '.sec:not([style*="url("]) > *{ position:relative; z-index:1; }',

    /* ⭐ Y EL REVÉS DEL MISMO PROBLEMA: LA SECCIÓN CON FOTO DE NOCHE.
       Visto el 21/9/2026 mirando la muestra entera después de destapar el
       fondo: «¿Alguna duda?» trae su propia foto —velas, de noche— y el
       sobretítulo «CORRE LA VOZ» era invisible.
       MEDIDO contra los píxeles de esa foto (mediana de luminancia 0,013):
           sobretítulo #55523A .... 2,12  ❌
           título (lo que dejó reglas-duras) .. 4,02
       Las secciones con foto propia se resuelven al revés que el resto: en
       vez de aclarar, se OSCURECE la franja del texto y la tinta va crema.
       Después del cambio: sobretítulo 15,70 · título 4,25 · bajada 7,30.
       ⚠️ VA EN `::after`, no en `::before`: el `::before` ya lo usa el velo
          claro de arriba y `.sec[style*="url("]` es un subconjunto de `.sec`.
          (No lo es del `:not`, pero conviene no depender de eso.)
       ⚠️ EL PASE QUEDA AFUERA, y tiene que quedar afuera: su foto es trigo
          CLARO y su tarjeta es de papel con tinta oscura. Se salva solo
          porque es `.pase` y no `.sec` — comprobado: el único elemento con
          este `::after` es `#contacto-sec`.
       ⚠️⚠️ Y ACÁ HAY UNA LECCIÓN QUE CASI ME COMO: **EL ORDEN IMPORTA MÁS QUE
          LA ESPECIFICIDAD.** Probando el bloque inyectado DESPUÉS de que la
          página cargara, el crema le llegaba al sobretítulo pero NO al título
          ni a la bajada: `reglas-duras.js` ya los había «rescatado» con un
          color EN LÍNEA y !important (#778151 y #A9A799), y contra un inline
          !important no gana ninguna hoja — tampoco `-webkit-text-fill-color`.
          Con el archivo YA DESPLEGADO no pasa: la hoja de la colección está
          puesta antes de que las reglas duras midan, las reglas duras ven un
          texto que se lee y no escriben nada. Medido en vivo: los tres en
          15,69.
          → De esto se sacan dos cosas. Una: probar un arreglo de color
            inyectándolo a mano MIENTE, y miente para el lado pesimista.
            Dos: cuando un color no llega, antes de pelearse con la
            especificidad conviene mirar QUIÉN llegó primero. */
    P + '.sec[style*="url("]{ position:relative; }',
    P + '.sec[style*="url("]::after{',
    '  content:""; position:absolute; inset:0; z-index:0; pointer-events:none;',
    '  background:linear-gradient(180deg, rgba(22,19,12,.18) 0%,',
    '    rgba(22,19,12,.54) 32%, rgba(22,19,12,.54) 68%,',
    '    rgba(22,19,12,.18) 100%);',
    '}',
    P + '.sec[style*="url("] > *{ position:relative; z-index:1; }',
    P + '.sec[style*="url("] :is(#cp-nada,.kick), ' +
    P + '.sec[style*="url("] h2, ' + P + '.sec[style*="url("] p{',
    '  color:#f7f1e4!important; -webkit-text-fill-color:#f7f1e4!important;',
    '}',

    /* ------------------------------------------------------------ tipografía
       Si la invitación eligió fuente propia desde el panel, la colección no
       le pisa los NOMBRES; el resto de la tipografía sí es de la colección. */
    P + 'h1,' + P + 'h2,' + P + 'h3,' + P + '.tit,' + P + '.h,' + P + '.kick{',
    '  font-family:' + SERIF + '!important;',
    '  letter-spacing:.06em!important; font-weight:400!important;',
    '}',
    P + 'p,' + P + '.p,' + P + '.txt,' + P + '.d,' + P + '.nm,' + P + '.rel{',
    '  font-family:' + CUERPO + '!important;',
    '}',
    (propia ? '' : P + '.portada .names, ' + P + '#pv-names{ font-family:' + CURSIVA + '!important; }'),
    P + '.cursiva, ' + P + '.nexo, ' + P + '.and{ font-family:' + CURSIVA + '!important; }',

    /* ------------------------------------------------- el pase con voz
       La colección le DEVUELVE al boleto su propia escala.

       ⚠️ MEDIDO EL 21/9, y no es culpa de la colección: la hoja
          `estilos-servidor` trae
              .sec p:not(.frase){ font-size:var(--fs-texto,16px)!important }
          y el boleto del pase vive adentro de una sección. Sus dos textos
          son <p>, así que el SOBRETÍTULO sale de 16 px —cuando el motor lo
          pide de 8— y el TÍTULO también, cuando el motor lo pide de 18-23.
          Resultado: la jerarquía INVERTIDA, «PASE DE INVITADO» más grande
          que «Un mensaje para ti». Le pasa a cualquier colección, no sólo
          a ésta; acá se arregla del lado de la colección para no tocar el
          motor. Si alguna vez `pase-voz.js` pone sus propios !important,
          este bloque se puede borrar entero.

       ⚠️ Y la regla de arriba (`P + 'p'`) le pisaba la familia al
          sobretítulo. Las fuentes del boleto salen de sus variables
          --pv-tit / --pv-dat / --pv-cur, que Jazmín elige desde el panel. */
    P + '#pv-sec .pv-over{ font-size:8px!important;',
    '  font-family:var(--pv-dat)!important; letter-spacing:.16em!important;',
    '  line-height:1.35!important; }',
    P + '#pv-sec .pv-titulo{ font-size:clamp(18px,5.2vw,23px)!important;',
    '  font-family:var(--pv-tit)!important; line-height:1.08!important;',
    '  letter-spacing:-.005em!important; }',
    P + '#pv-sec .pv-departe{ font-size:14px!important;',
    '  font-family:var(--pv-cur)!important; }',
    P + '#pv-sec .pv-nota dd{ font-family:var(--pv-cur)!important; }',
    P + '#pv-sec .pv-datos dd{ font-family:var(--pv-tit)!important; }',
    P + '#pv-sec .pv-talon span{ font-family:var(--pv-tit)!important; }',

    /* ⭐ EL BOLETO ESTABA MAL CORTADO. Maki, 21/9/2026: «el ticket está mal
       cortado, como siempre».

       SON DOS COSAS, LAS DOS MEDIDAS mirando la esquina de arriba a la
       derecha con el giro apagado y la columna escondida:

       1. EL DIENTE DEL TROQUEL SE COME LA ESQUINA. El motor le pone al
          boleto `mask: radial-gradient(circle 5px at 100% 50%)` con
          `mask-size:100% 15px` y `repeat-y`: un diente de 5 px de radio cada
          15 px sobre el borde derecho. El PRIMER diente tiene el centro en
          y=7,5, así que muerde de 2,5 a 12,5 y **deja arriba un pico de
          2,5 px**. Eso es el escaloncito. Y como el alto del boleto (220) no
          es múltiplo de 15, abajo pasa lo mismo con el último diente.
          Además los dientes NO SE VEN: dejan pasar el papel crema de la
          sección, que es casi el mismo color. O sea que el troquel de ese
          borde no aporta nada y sí rompe la silueta.
          → se le saca la máscara al boleto. El desgarro sigue contado por el
          borde mordido de la columna, que ahí sí se ve, y por la línea
          punteada del talón.
       2. EL FILETE INTERIOR PARECÍA UNA U. No estaba abierto: estaba TAPADO.
          Cierra a `right:14px` del borde, o sea en el 856, y la columna ocupa
          del 821 al 871. El filete terminaba DETRÁS de la columna. Ahora
          cierra en el 57, ocho píxeles antes de la columna.

       ⚠️ El 57 depende del ancho de `.pv-escena` (352) y del `width:58%` de
          la columna que fija el motor. Si alguno cambia, se vuelve a medir:
          columna escondida + `transform:none`, y se comparan los rectángulos.
       ⚠️ NO se toca el `min-height:220` del motor: medido, con ese valor la
          columna queda EXACTAMENTE centrada (12 px arriba y 12 abajo). */
    P + '#pv-sec .pv-tk{',
    '  -webkit-mask:none!important; mask:none!important; border-radius:2px!important;',
    '}',
    P + '#pv-sec .pv-cuerpo::before{ right:57px!important; }',

    /* los sobretítulos: versalitas muy espaciadas, como la referencia */
    /* ⚠️ NINGÚN ENCADENADO DE CLASES LE GANA A UN ID. Medido el 21/9: el
       sobretítulo de confirmación (`#cf-kick2`) nacía BLANCO —el motor lo pone
       por ID— y esta regla no le llegaba. `reglas-duras.js` lo rescataba
       pintándolo gris #6c6c6c en línea: se leía, pero fuera de la familia.
       El contragolpe es `:is(#cp-nada, .kick)`, que pesa como un ID sin
       seleccionar nada nuevo. Y va `-webkit-text-fill-color` además de
       `color`, porque el inline con !important de las reglas duras no se le
       gana de otra forma. */
    P + ':is(#cp-nada, .kick), ' + P + ':is(#cp-nada, .kicker){',
    '  text-transform:uppercase!important; letter-spacing:.34em!important;',
    '  font-size:11.5px!important;',
    '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
    '}',

    /* ⚠️⚠️ EL SOBRETÍTULO DE LA PORTADA NO VA SOBRE EL PAPEL: VA SOBRE LA FOTO.
       Visto el 21/9/2026 en la muestra de María Paz: «Nos casamos en el campo»
       era una mancha. La causa no es el tamaño ni la fuente — es que la regla
       de arriba le pone TINTA2 (#55523A), que está calculada contra el papel
       crema (6,58), y en la portada cae sobre una fotografía de tonos cálidos
       oscuros. Tinta oscura sobre imagen oscura.
       Y encima el motor le pone una sombra OSCURA, que despega un texto claro
       y entierra uno oscuro: empeoraba lo que venía a arreglar.
       → En la portada va el crema, igual que los nombres y la cuenta regresiva.
       ⚠️ Va `-webkit-text-fill-color` además de `color`: `reglas-duras.js`
          escribe `color` en línea con !important cuando cree que un texto no
          se lee, y el fill le gana sin pelearse con las reglas duras.
       ⚠️ Ojo al medirlo: el barrido de contraste NO ve esta foto, porque
          `fondo-invitacion.js` la pinta con un `<img>` adentro de `#inv-fondo`
          y no como `background-image`. Por eso la regla 7 marca los nombres
          (1,07) que se leen perfecto y NO marcaba este sobretítulo, que era el
          único roto de verdad. Acá se mira, no se le cree al número. */
    /* ⚠️ Y ESTA TIENE QUE PESAR MÁS QUE LA DE ARRIBA, o el sobretítulo de la
       portada vuelve a la tinta oscura. La de arriba ya vale un ID por el
       `:is(#cp-nada, .kick)`; ésta se anda con DOS, así gana siempre y no
       depende del orden en que queden las reglas. */
    P + ':is(#cp-nada, .portada) :is(#cp-nada, .kick), ' +
    P + ':is(#cp-nada, .portada) :is(#cp-nada, .kicker), ' +
    P + ':is(#cp-nada, .portada) #pv-kick{',
    '  color:#f7f1e4!important; -webkit-text-fill-color:#f7f1e4!important;',
    '}',

    /* -------------------------------------------------------------- filetes
       ⚠️ TINTA3 da 3,91 sobre el papel: NO se usa para texto en ningún lado.
          Acá va sólo como línea. */
    P + 'hr, ' + P + '.filete, ' + P + '.linea{',
    '  border-color:' + TINTA3 + '!important; opacity:.55!important;',
    '}',

    /* ------------------------------------------------------- nombres de lugar
       `--sage` es el color de los nombres de lugar debajo de «Ceremonia» y
       «Fiesta». Salvia oscura da 4,05: alcanza porque ahí el texto es grande.
       Si alguna vez se usa en texto chico, hay que oscurecerlo. */
    P + '.ev .lugar, ' + P + '.evento .lugar{ color:' + SALVIA + '!important; }',

    /* ======================================================== LOS BOTONES ====
       ⚠️ LA COLECCIÓN NO PINTA EL MATERIAL DEL BOTÓN. Eso lo hace
          `efectos/botones.js` con `fx.boton.estilo` (acá: ARCILLA). Si la
          colección le pusiera fondo, borde o sombra, le pisaría el material y
          quedaría plano — la lección que pagó Marfil en cinco fases.
          Sólo se le pone la TIPOGRAFÍA. */
    P + '.btn, ' + P + '#btn-ingresar, ' + P + '.wsp, ' + P + '.tv-btn{',
    '  font-family:' + SERIF + '!important;',
    '  letter-spacing:.16em!important; text-transform:uppercase!important;',
    '  font-size:12.5px!important;',
    '}',

    /* ==================================================== NUESTRAS PERSONAS ==
       ⭐ LAS TRES EN UNA FILA. SIEMPRE. Es la regla 1 de chequeo/muestra.js y
          falla sola. La causa es del motor: `.padres` es un grid de DOS
          columnas FIJAS de 168px. No es falta de lugar — el marco mide 500. */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important; background-color:transparent!important;',
    '}',
    P + '.padres .av{ width:104px!important; height:104px!important; }',
    P + '.padres .nm{ font-size:18px!important; font-family:' + SERIF + '!important; }',
    P + '.padres .rel{ font-size:11.5px!important; color:' + TINTA2 + '!important; }',

    /* ========================================================= EL ITINERARIO ==
       ⭐ LA VÍA VA AL MEDIO Y LOS MOMENTOS SE ALTERNAN.
       Maki, 21/9/2026, mirando la muestra: «el itinerario, este fondo no va
       definitivamente. Tiene que ir en el medio, y los textos de izquierda a
       derecha». O sea: la línea por el eje, un momento a la izquierda, el
       siguiente a la derecha, y el panel oscuro AFUERA.

       ⚠️ EL PANEL OSCURO SE FUE. La primera versión era un rectángulo
          #221e14 con polen animado adentro. Quedaba como una caja pegada
          encima del papel crema, y tapaba el fondo de video —que es
          protagonista, regla de Maki del 18/9. Ahora el itinerario respira
          sobre el papel de la sección.
       ⚠️ Y CON EL PANEL SE FUE EL POLEN. El `::after` tenía `mix-blend-mode:
          screen`, que sobre claro no se ve. El movimiento continuo lo sostiene
          ahora la VÍA: el hilo punteado con la luz bajando, que no para nunca.
       ⚠️ El motor numera los hijos de `.tl` así: seis `DIV.it` y al final
          `I.tl-prog`. Por eso `nth-child` sobre `.it` es seguro: el relleno de
          progreso no es un `.it` y no corre la cuenta. */
    P + '.tl{',
    '  position:relative!important;',
    '  background-color:transparent!important; background-image:none!important;',
    '  border-radius:0!important; padding:18px 0 6px!important;',
    '  color:' + TINTA + '!important; overflow:visible!important;',
    '}',
    P + '.tl::after{ content:none!important; }',
    P + '.tl .it, ' + P + '.tl .t, ' + P + '.tl .h{ position:relative; z-index:1; }',
    P + '.tl .t{ font-family:' + SERIF + '!important; color:' + TINTA + '!important; }',
    P + '.tl .h{ color:' + TINTA + '!important; }',
    P + '.tl .d{ color:' + TINTA2 + '!important; }',

    /* ⭐ EL EJE. `--tl-eje` es el semiancho que le queda a cada momento y
       `--tl-aire` lo que separa el texto de la vía. Se tocan juntos: la marca
       se ubica con los dos. */
    P + '.tl{ --tl-aire:22px; }',
    P + '.tl > .it{',
    '  width:calc(50% - var(--tl-aire))!important;',
    '  margin-bottom:20px!important; box-sizing:border-box!important;',
    '}',
    /* impares a la IZQUIERDA, alineados contra la vía */
    P + '.tl > .it:nth-child(odd){',
    '  margin-left:0!important; margin-right:auto!important; text-align:right!important;',
    '}',
    /* pares a la DERECHA */
    P + '.tl > .it:nth-child(even){',
    '  margin-left:auto!important; margin-right:0!important; text-align:left!important;',
    '}',
    /* ⚠️ LA MARCA SE CUELGA DEL LADO QUE MIRA A LA VÍA, no siempre a la
       izquierda: 11 px es el medio de la pieza de 22. */
    P + '.tl > .it:nth-child(odd)::before{',
    '  left:auto!important; right:calc(-1 * var(--tl-aire) - 11px)!important;',
    '}',
    P + '.tl > .it:nth-child(even)::before{',
    '  left:calc(-1 * var(--tl-aire) - 11px)!important; right:auto!important;',
    '}',

    /* ⭐ LA VÍA EMPIEZA Y TERMINA DONDE ESTÁ LA COSA, y ahora va por el eje.
       ⚠️ SON DOS ELEMENTOS: `.tl::before` (la vía) y `.tl-prog` (el relleno que
          avanza con la hora). Recortar sólo el primero deja el bug vivo para
          cualquier evento ya empezado.
       ⚠️ Los valores los MIDE el repaso (--tl-ini / --tl-fin): dependen del
          alto de la primera ficha, que depende del texto que cargue Jazmín. */
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important;',
    '  height:auto!important; left:calc(50% - 1px)!important; right:auto!important;',
    '  width:2px!important;',
    '}',
    /* y la vía deja de ser una raya muerta: hilo punteado con la luz bajando */
    P + '.tl::before{',
    /* ⚠️ MEDIDO MIRANDO: con TINTA3 y 4/13 la vía casi no se veía sobre el
       papel crema. Con TINTA2 y 5/12 se lee sin pesar. */
    '  background-image:repeating-linear-gradient(to bottom,',
    '     ' + TINTA2 + ' 0 5px, rgba(85,82,58,0) 5px 12px)!important;',
    '  background-size:100% 12px!important;',
    '  animation:campoHilo 1.1s linear infinite!important;',
    '}',
    '@keyframes campoHilo{ from{ background-position:0 0 } to{ background-position:0 13px } }',
    '@media (prefers-reduced-motion: reduce){ ' + P + '.tl::before{ animation:none!important } }',

    /* ⭐ LA MARCA DE CADA MOMENTO: EL MEDALLÓN DE OLIVO.
       ⚠️ NUNCA con el atajo `background:` + !important. El atajo expande TODAS
          las longhands, incluida `background-position`, y una declaración
          !important de autor le gana a una animación: la pieza queda clavada y
          se ve quieta sin un solo error en consola. Van las longhands. */
    P + '.tl > .it::before{',
    '  background-image:url("' + PIEZA + '")!important;',
    '  background-repeat:no-repeat!important;',
    '  background-size:contain!important;',
    '  border:0!important; box-shadow:none!important;',
    '  width:22px!important; height:22px!important; top:3px!important;',
    '  filter:drop-shadow(0 1px 2px rgba(34,30,20,.28));',
    '}',

    /* ⭐⭐ LAS TRES PIEZAS SALEN IGUALES. Maki lo marcó DOS VECES:
       21/9, «todo muy claro»; y después, mirando el arreglo,
       «las raspadas te quedaron de diferentes colores».

       QUÉ PASABA, medido sobre los píxeles de la muestra:
           pieza 1 (la que toca) ..... luminancia 193,4
           pieza 2 (dormida) ......... 178,8
           pieza 3 (dormida) ......... 178,5     → 14,9 puntos de diferencia
       El motor apaga las que todavía no tocan con
       `.rasp-zona.dormida canvas{ filter:brightness(.84) saturate(.72) }`.
       Eso NO es un apagado: es un CAMBIO DE COLOR. El `saturate` le baja el
       verde al olivo y el rojo al papel, y deja las dormidas grises al lado
       de la primera. Se leen como tres piezas distintas.
       Mi primer arreglo (`brightness(.95) saturate(.9) opacity(.88)`) sólo
       aflojó el efecto: bajó de 14,9 a 12,7. Seguía siendo el mismo error.

       → LA PIEZA NO SE TOCA. Las tres salen idénticas: 2,2 puntos de
         diferencia, que es el resplandor del aro y el fondo de atrás.

       ⚠️⚠️ PERO `dormida` NO ES DECORACIÓN: ES UN CANDADO. En
          `efectos/raspadita.js`, `rascar()` arranca con
              if (terminada || zona.classList.contains('dormida')) return;
          o sea que las piezas se raspan EN ORDEN —día, mes, año— y el motor
          va sacando la clase de la siguiente. Si se borra el aviso y no se
          pone otro, el invitado rasca una que no responde y no entiende por
          qué. Por eso la que toca ahora se marca con un ARO cálido que late,
          no cambiándole el color a las otras dos: la marca va sobre la
          ACTIVA, no sobre las bloqueadas. Y el aro se mueve solo, porque lo
          pinta `:not(.dormida)` y el motor libera la siguiente al terminar. */
    P + '.rasp-zona.dormida canvas{ filter:none!important; }',
    P + '.rasp-zona:not(.dormida){',
    '  animation:campoLatido 1.9s ease-in-out infinite;',
    '}',
    '@keyframes campoLatido{',
    '  0%,100%{ box-shadow:0 0 0 2px rgba(150,80,47,.42), 0 0 10px 2px rgba(194,154,91,.34) }',
    '  50%{ box-shadow:0 0 0 2px rgba(150,80,47,.68), 0 0 18px 5px rgba(194,154,91,.62) }',
    '}',
    '@media (prefers-reduced-motion: reduce){ ' + P + '.rasp-zona:not(.dormida){',
    '  animation:none!important;',
    '  box-shadow:0 0 0 2px rgba(150,80,47,.55), 0 0 12px 3px rgba(194,154,91,.45)!important; } }',

    /* =================================================== EL PASE DE DEMO ======
       ⭐ LA TARJETA ES DE PAPEL, SIEMPRE. Maki, 21/9/2026: «me gusta el estilo
          blanco que pusiste, pero no ese fondo de mesa de madera».

       El fondo de madera se cambió por trigo desenfocado —eso va en `fx`, lo
       elige Jazmín desde el panel— y ahí apareció el efecto de rebote: sobre
       un fondo CLARO el motor vuelve translúcida la tarjeta (`rgba(255,255,
       255,.07)` con tinta crema) y se pierde justamente lo que a Maki le
       gustaba. Sobre el fondo oscuro pasaba lo mismo al revés.
       → la tarjeta se clava en papel + tinta de la colección y deja de
         depender de cuán clara sea la foto de atrás.
       ⚠️ `backdrop-filter` apagado: con el papel opaco sólo agrega costo de
          pintado en el teléfono. */
    P + '.pase .pasecard{',
    '  background-color:' + PAPEL + '!important; background-image:none!important;',
    '  border:1px solid rgba(47,51,32,.18)!important;',
    '  box-shadow:0 12px 26px rgba(40,32,20,.26)!important;',
    '  color:' + TINTA + '!important;',
    '  backdrop-filter:none!important; -webkit-backdrop-filter:none!important;',
    '}',
    P + '.pase .pasecard *{ color:' + TINTA + '!important; }',

    /* ====================================================== LA RASPADITA ======
       ⚠️ SON DOS RAMAS DEL ÁRBOL, NO UNA:
            #scratchcard
             ├── .rasp-3 > .r3-f     ← las fichas de abajo (lo que se revela)
             └── .rasp-zona > canvas ← la TAPA que se raspa
          `--r3-tapa` la lee el LIENZO, así que hay que declararla en los
          contenedores de las DOS ramas: una variable de CSS sólo baja a los
          DESCENDIENTES.
       ⚠️ Y EL CONTENEDOR VA SIN RECUADRO. Maki lo pidió dos veces. El motor le
          pone `background: var(--lino2)`, así que hay que apagarlo POR PARTES:
          el atajo `background:` con !important pisa cosas que no queremos. */
    ':is(#cp-nada, .scratch-sec, .rasp-3, .rasp-zona){ --r3-tapa:url("' + PIEZA + '"); }',
    P + ':is(#cp-nada, .scratchcard){',
    '  background-color:transparent!important; background-image:none!important;',
    '  border:0!important; box-shadow:none!important;',
    '}',

    /* ============================================ EL VIDEO Y LA PLAYLIST ======
       ⚠️⚠️⚠️ ACÁ HABÍA UNA REGLA CONTRA UNA CLASE QUE NO EXISTE, Y ESTUVO
          MESES SIN HACER NADA. Decía `.tv-tapa, .sp-tapa`. La clase de verdad
          es **`.rd-tapa`**, la misma para el video y para la playlist. O sea
          que la pieza propia NUNCA estuvo en la tapa de la playlist, aunque
          yo lo venía contando como uno de los cuatro lugares. No dio ningún
          error: una regla contra una clase inexistente no falla, no hace nada.
          Se encontró imprimiendo el árbol real, que es lo que manda la skill
          de entrega y lo que yo no había hecho.

       ⭐ Y LA TAPA VA TRANSPARENTE. Maki, 22/9/2026: «los rectángulos no se
          puedan ver, y después se quedan ahí en el aire los textos».
          Medido: `.rd-tapa` salía `rgb(243,233,217)` OPACA, 374×214 en el
          video y 366×356 en la playlist — dos bloques de papel plantados en
          el medio de la sección, justo encima del fondo de video.
       ⚠️ Y SE PUEDE SACAR SIN DESTAPAR EL REPRODUCTOR: el iframe de abajo
          ya está en `visibility:hidden`. Lo dejó resuelto y escrito Disco
          («no se tapa un papel con otro papel»); acá se copia el patrón en
          vez de inventarlo de nuevo.
       ⚠️ Lo que queda encima es SÓLO el aro, dibujado en el lenguaje de la
          colección —filete de terracota y un halo de papel para despegarlo
          del trigo—, nunca el botón de un reproductor. */
    P + '.rd-tapa{',
    '  background-color:transparent!important; background-image:none!important;',
    '  border:0!important; box-shadow:none!important;',
    '  color:' + TINTA2 + '!important;',
    '}',
    P + '.rd-tapa .rd-aro{',
    '  border:1px solid rgba(150,80,47,.55)!important;',
    '  background:radial-gradient(circle at 50% 50%,',
    '     rgba(243,233,217,.82) 0 58%, rgba(243,233,217,0) 100%)!important;',
    '  box-shadow:0 0 0 5px rgba(243,233,217,.42),',
    '     0 0 0 6px rgba(150,80,47,.28)!important;',
    '  backdrop-filter:none!important; -webkit-backdrop-filter:none!important;',
    '}',
    P + '.rd-tapa .rd-txt{',
    '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
    '  text-shadow:0 1px 6px rgba(243,233,217,.9), 0 0 14px rgba(243,233,217,.7)!important;',
    '}',

    /* ================================================ EL FORMULARIO ==========
       ⭐ LOS CAMPOS SON UNA RAYA, NO UNA CAJA. Maki, 22/9/2026, sobre la
       sección de la carta: «los rectángulos no se puedan ver».
       El motor los dibuja para una colección OSCURA: fondo
       `rgba(255,255,255,.08)`, filete `rgba(255,255,255,.25)` y radio 10.
       Sobre el papel crema eso es un rectángulo fantasma.
       ⚠️ Y LA TINTA DEL CAMPO SALÍA BLANCA (la del motor) — tan ilegible que
          `reglas-duras.js` la rescataba a `rgb(96,96,96)` EN LÍNEA, un gris
          que no pertenece a ninguna paleta. Con la tinta puesta desde la hoja
          de la colección, las reglas duras miden un texto que ya se lee y no
          escriben nada (la lección del orden, más arriba). */
    P + '.rsvpform input, ' + P + '.rsvpform select, ' + P + '.rsvpform textarea{',
    '  background-color:transparent!important; background-image:none!important;',
    '  border:0!important; border-bottom:1px solid rgba(122,116,88,.55)!important;',
    '  border-radius:0!important; box-shadow:none!important;',
    '  padding-left:2px!important; padding-right:2px!important;',
    '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
    '}',
    P + '.rsvpform input:focus, ' + P + '.rsvpform select:focus, ' + P + '.rsvpform textarea:focus{',
    '  outline:none!important; border-bottom-color:' + TERRA + '!important;',
    '}',
    P + '.rsvpform label{',
    '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
    '}',

    /* ===================================================== EL SÍ / NO =========
       ⚠️ El área de toque se mide: mínimo 44 px. La pastilla del motor mide 77
          entera, o sea 38 por mitad — por eso «me costó mucho poner que sí».
          Los rótulos de al lado se hacen tocables y hacen lo mismo. */
    P + '.si, ' + P + '.no, ' + P + '.mitad{ min-height:44px!important; }',
    /* ⭐ LOS RÓTULOS SON EL ÁREA DE TOQUE DE VERDAD.
       Medido el 21/9/2026 en la muestra: la pastilla mide 77×30 y cada mitad
       38, o sea la mitad del mínimo de 44. El motor ya hizo tocables los dos
       rótulos («No podré» / «Sí, asistiré»), pero miden 13 px de alto: tocar
       ahí es igual de difícil. Con este relleno pasan a ~45 y el invitado
       puede cambiar de opinión sin pelearse con el dedo. */
    P + '.et{ display:inline-block!important; padding:16px 12px!important; }',
    /* la perilla del interruptor, con la pieza */
    P + '.rsvp-sw .knob, ' + P + '.interruptor .knob{',
    '  background-image:url("' + PIEZA + '")!important;',
    '  background-size:cover!important; background-color:transparent!important;',
    '}',

    /* ========================================================= LA CARTA =======
       ⚠️ `.cf-letter` trae el papel CLAVADO en el motor y no sale de ninguna
          variable. Acá se le pone el crema de la colección para que no sea la
          única hoja de otro color de toda la invitación. */
    P + '.cf-letter{ background-color:#f7f1e4!important; color:' + TINTA + '!important; }',
    P + '.cf-letter p{ font-family:' + CUERPO + '!important; }',

    /* ================================================= EL «VER MÁS» ===========
       ⭐ SE FUE. Maki, 22/9/2026, sobre Vestimenta: «sacá el ver más, y que el
       texto llegue hasta donde tenga que llegar sin ver más».
       El motor recorta con `-webkit-line-clamp:3` y `max-height:81.6px`.
       Medido: el texto real mide 184 px, o sea que se comía la mitad —
       «…así que mejor zapato bajo o de plataforma. El blanco se lo dejamos a
       la novia» no se leía nunca.
       ⚠️ El clamp NO se apaga sólo con `max-height`: mientras el elemento siga
          en `display:-webkit-box` el navegador lo sigue recortando. Van las
          cuatro: display, line-clamp, max-height y overflow. */
    P + '.iv-plie-btn{ display:none!important; }',
    P + '.iv-plie-txt{',
    '  display:block!important; -webkit-line-clamp:unset!important;',
    '  max-height:none!important; overflow:visible!important;',
    '}',

    /* ========================================================= EL PIE =========
       ⚠️ `.footer` NO es `.sec`: en Marfil se quedó con su foto oscura y con la
          tinta clara encima. Acá se le pone el papel y la tinta a propósito. */
    P + '.footer{ background-color:' + PAPEL2 + '!important; color:' + TINTA + '!important; }',
    P + '.footer a{ color:' + TERRA + '!important; }',

    /* ⭐ «¿QUIERES LA TUYA?» NO SE VEÍA, Y ES LA LÍNEA QUE VENDE.
       Maki, 22/9/2026: «el texto final, quiere una invitación, no se ve».
       Medido: `.col-mvta-t` salía en `rgb(47,51,32)` —la TINTA— sobre la foto
       oscura del cierre. Y la culpa era MÍA: la regla `.footer{color:TINTA}`
       de acá arriba se la pasaba por herencia, porque ese bloque es el único
       del pie que no trae color propio. Todo lo demás del pie —«¡Gracias!»,
       los nombres, el crédito— el motor ya lo pinta crema, porque el pie
       SIEMPRE lleva foto.
       → se le pone el mismo crema que usa el motor en `.n` (#f5edda), y así
         el bloque de Invítame queda igual de legible que el resto. */
    P + '.col-mvta-t{',
    '  color:#f5edda!important; -webkit-text-fill-color:#f5edda!important;',
    '}'

    ].filter(Boolean).join('\n');
  }

  /* ================================================================ EL MOTOR == */
  var HOJA = 'col-campestre-css';

  function poner() {
    var raiz = document.documentElement;
    raiz.setAttribute('data-col', ID);
    raiz.setAttribute('data-coleccion', ID);
    /* ⭐ la marca del itinerario es una FOTO, no el símbolo vectorial:
       `simbolo-tematica.js` se corre solo al ver esto, y la regla 5 del
       chequeo acepta este camino desde el 20/9. El `.adorno` de los títulos
       lo sigue vistiendo el símbolo (juego «campo»). */
    raiz.setAttribute('data-marca-propia', ID);

    /* la tabla de la colección le gana a la paleta elegida (ver arriba) */
    window.INVCOLPALETA = PALETA_PROPIA;

    var st = document.getElementById(HOJA);
    if (!st) { st = document.createElement('style'); st.id = HOJA; document.head.appendChild(st); }
    var css = armarCSS();
    if (st.textContent !== css) st.textContent = css;

    ponerFondo();
    prestarBtn();
    medirVia();
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') === ID) {
      raiz.removeAttribute('data-col');
      raiz.removeAttribute('data-coleccion');
      raiz.removeAttribute('data-marca-propia');
    }
    if (window.INVCOLPALETA === PALETA_PROPIA) {
      try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; }
    }
    var st = document.getElementById(HOJA); if (st) st.remove();
    [].forEach.call(document.querySelectorAll('[data-cp-btn]'), function (el) {
      el.classList.remove('btn'); el.removeAttribute('data-cp-btn');
    });
  }

  /* El «Ver más», el WhatsApp del pie y el sí/no quedan fuera de la lista que
     viste `botones.js`. NO se agrega a la lista del motor —cambiaría
     invitaciones ya entregadas—: se les PRESTA la clase desde acá. */
  function prestarBtn() {
    var sel = '.iv-plie-btn, .col-mvta-b';
    [].forEach.call(document.querySelectorAll(sel), function (el) {
      if (!el.classList.contains('btn')) { el.classList.add('btn'); el.setAttribute('data-cp-btn', '1'); }
    });
  }

  /* ⭐ LA MEDICIÓN DE LA VÍA. No se puede resolver sólo con CSS: dónde cae la
     primera marca es `padding-top + alto-de-la-primera-ficha / 2`, y ese alto
     depende del texto. Son dos getBoundingClientRect: no pesa. */
  function medirVia() {
    var tl = document.querySelector('.tl'); if (!tl) return;
    var fichas = tl.querySelectorAll('.it'); if (!fichas.length) return;
    var R = tl.getBoundingClientRect();
    var a = fichas[0].getBoundingClientRect();
    var b = fichas[fichas.length - 1].getBoundingClientRect();
    if (!R.height || !a.height) return;               /* todavía sin medir */
    tl.style.setProperty('--tl-ini', Math.round(a.top + a.height / 2 - R.top) + 'px');
    tl.style.setProperty('--tl-fin', Math.round(R.bottom - (b.top + b.height / 2)) + 'px');
  }

  function repaso() { if (activa()) poner(); else sacar(); }

  repaso();
  setInterval(repaso, 1200);
  document.addEventListener('DOMContentLoaded', repaso);
  window.addEventListener('load', repaso);
  window.addEventListener('resize', medirVia);

  try { window.INVCAMPESTRE = { poner: poner, sacar: sacar, activa: activa, pieza: PIEZA }; } catch (e) {}
})();
