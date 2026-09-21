/* ===== SOBRES DE INVÍTAME + PUNTO DE ENTRADA ==================================
   Este archivo tiene TRES partes:
     1) EL CATÁLOGO  — la lista de sobres disponibles
     2) LA PUESTA EN PANTALLA DEL SOBRE — cómo se ve y se encuadra
     3) EL ENGANCHE  — carga /efectos/index.js, donde está la lista de módulos

   Vive aparte a propósito: antes todo esto estaba copiado dentro de
   prueba/index.html y prueba/admin.html (200 KB cada uno) y había que acordarse
   de tocar los dos. Acá es un archivo chico, fácil de cambiar y de revisar.

   ⚠️ Se llama "catalogo.js" por historia: arrancó siendo sólo la lista de
   sobres. Hoy es además el ÚNICO enganche que tiene la invitación con archivos
   chicos. Renombrarlo obligaría a tocar los HTML grandes, que es justo lo que
   se quiere evitar.
   ============================================================================ */


/* ===== 1. EL CATÁLOGO =========================================================
   Para sumar un sobre nuevo:
     1. Subir el video (y su poster) a la carpeta /sobres/
     2. Agregar UNA línea acá abajo
   Nada más.

   Qué significa cada cosa:
     nombre : lo que ve la diseñadora en la lista del panel
     video  : la apertura del sobre, sin nombres ni fechas. Genérico y reusable.
     poster : el primer cuadro, para que el sobre cerrado se vea al instante
              mientras el video todavía carga. TAMBIÉN se usa como fondo
              desenfocado en la compu, y como LA FOTO en apertura 'solapas'.
     solapa : SOLO en apertura 'solapas'. Segunda imagen, con transparencia,
              que trae la solapa de arriba MÁS EL LACRE. Ver abajo.
     eje    : SOLO en apertura 'solapas'. Dónde cae la punta de la solapa, en
              % de la foto. Por defecto 50/50.
     img    : sin video, el sobre se dibuja por CSS con esta imagen de papel
              (el modo viejo; queda como respaldo).
     lacre  : imagen del sello para el modo sin video.
     color  : color sugerido para la carta, si la diseñadora no elige uno.
     apertura: 'video' (por defecto) o 'solapas'  → ver abajo
     empalme: 'blanco' (por defecto) o 'foto'     → ver abajo
     texto  : sólo en las piezas que SE ESCRIBEN SOLAS (ver más abajo).

   El evento guarda SOLO el id (fx.sobre.modelo), nunca la URL. Así se puede
   cambiar el video de un sobre después sin tocar ninguna invitación entregada.

   ★★★ EL CAMPO `apertura`  (3/9/2026)

     Maki, después de ver el sobre de anillos en video:
     «cambiemos el sobre, se abre descontrolado este. Creo que lo habías armado
     vos con una imagen».

     Un video generado con IA **hace lo que quiere**: en anillos el relieve del
     papel cambia solo en el camino, y el lacre no se parte, se esfuma. Eso no
     se arregla con código: viene así en el archivo.

       'video'    — reproduce el mp4. Sirve cuando la generación salió limpia
                    (lazo, toscana, perlas).
       'solapas'  — NO usa video. Toma la FOTO del sobre cerrado (el `poster`,
                    que ya está en el repo) y la abre por CSS: se parte en
                    cuatro triángulos desde el centro y las dos solapas de
                    adelante giran hacia afuera. El lacre queda partido al
                    medio, que es lo que hace un lacre de verdad.
                    El movimiento lo manejamos nosotros: mismo tiempo, mismo
                    ángulo, todas las veces.

     ⚠️ 'solapas' NO necesita ningún archivo nuevo. Usa el póster.
     ⚠️ Y asume que el lacre está en el CENTRO de la foto. Si un sobre nuevo lo
        tiene más arriba, se corre `EJE` en /efectos/sobre-catalogo.js, o se
        pone `eje` en la ficha del sobre (ver `maestro`).

   ★★★ EL CAMPO `empalme`  (3/9/2026)

     Maki: «¿te acordás que habíamos quedado en que el sobre se abría y aparecía
     abajo la foto de la invitación directo, y ahí recién aparecían los datos?».

       'blanco'  (por defecto) — para los videos que YA terminan en blanco
                  (lazo, toscana, perlas). Velo del color del papel. No se toca.
       'foto'    — el sobre se desvanece encima de la portada real, que ya está
                  dibujada debajo, y los textos de la portada entran medio
                  segundo después que la foto.

     ⚠️ En un video no es una preferencia: es una propiedad del archivo. Si
        termina en blanco y se pone 'foto', se ve un blanco de más; si termina
        abierto y se pone 'blanco', se ve el corte.
        En apertura 'solapas' va SIEMPRE 'foto': el sobre queda abierto.

   ★ CÓMO SE ELIGE EL `color`, BIEN: se MIDE, no se estima. Se saca el último
     cuadro del video y se lee el píxel del centro. En `perlas` el fundido se
     hizo a 0xF3F3F5 y el archivo terminó en #f2f2f4 (el paso a yuv420p corre
     un nivel). Va el valor MEDIDO, no el pedido.

   ★★ Y OJO CON QUÉ PARTE SE MIDE  (3/9/2026)
     En los sobres que no se funden a blanco solos, el último cuadro es el sobre
     YA ABIERTO, con sombra: medirlo da un gris sucio (#c9c2b5) que no sirve.
     Ahí hay que medir EL PAPEL, en una esquina del PRIMER cuadro, porque ese
     `color` es el que rellena las barras cuando la foto va contenida. Si se
     pone el promedio, quedan dos franjas oscuras arriba y abajo.

   ★★★ UN SOBRE PROPIO POR MUESTRA  (17/9/2026)
     Maki, sobre las tres muestras entregadas con el mismo sobre `maestro`:
     «poné otro sobre así va cambiando», «cambiá el sobre que es el mismo de
     todos», «acá hasta tenías un sobre de playa y ni eso agregaste».
     Cada muestra que se arma se lleva SU sobre. Si la temática no tiene uno,
     se genera en Flow con la misma tanda de imágenes de esa temática, para que
     el papel, la luz y el color sean los mismos que los del resto.
   ============================================================================ */
window.SOBRES_INVITAME = {

  lacre: {
    nombre: "Lacre dorado (video)",
    video:  "/sobres/sobre-lacre.mp4",
    poster: "/sobres/sobre-lacre-poster.jpg",
    color:  "#efe9e0"
  },

  flores: {
    nombre: "Lacre y flores secas (video)",
    video:  "/sobres/sobre-flores.mp4",
    poster: "/sobres/sobre-flores-poster.jpg",
    color:  "#efe9e0"
  },

  lazo: {
    nombre: "Lazo de seda verde salvia (video)",
    video:  "/sobres/sobre-lazo.mp4",
    poster: "/sobres/sobre-lazo-poster.jpg",
    color:  "#f4f6f0"
  },

  toscana: {
    nombre: "Toscana grabada, lacre dorado (video)",
    video:  "/sobres/sobre-toscana.mp4",
    poster: "/sobres/sobre-toscana-poster.jpg",
    color:  "#f7f2e8"
  },

  /* ---- EL SOBRE DE LA COLECCIÓN PERLAS ----------------------------------
     Sobre marfil de borde deckled con DOS HOJAS que se abren al medio
     (gatefold), atado con una hilera de perlas de agua dulce.

     ⚠️ NO es un sobre de solapa: el movimiento es "las dos hojas se abren
        desde la costura del centro". Por eso tampoco sirve para 'solapas',
        que asume solapas triangulares.
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     DISCO — el sobre de la muestra de XV de Lupita. Papel plata sobre raso
     negro con destellos de bola de espejos, y un lacre redondo con la bola.
     Generado en Flow el 19/9/2026 y MEDIDO cuadro por cuadro (ver `luz`).
     ---------------------------------------------------------------------- */
  disco: {
    nombre: "Disco · plata con lacre de bola de espejos (video)",
    video:  "/sobres/sobre-disco.mp4",
    poster: "/sobres/sobre-disco-poster.jpg",
    color:  "#FBFBFA",
    /* MEDIDO EL 19/9/2026 sobre los 24 cuadros (3 por segundo), brillo medio:
         0,0 a 3,0 s  quieto, cerrado            brillo 80
         3,3 a 3,7 s  la solapa se levanta       brillo baja a 68
         4,0 s        abierto, entra la luz      brillo 83
         4,3 a 7,7 s  zoom, se llena de blanco   brillo 102 -> 251
       El destello entra cuando ARRANCA el zoom: 4,0. */
    luz: 4.0,
    /* ⚠️ DOS SEGUNDOS DE BLANCO SOBRE NEGRO SE LEEN COMO PÁGINA ROTA.
       Medido el 21/9/2026 mirando la apertura cuadro por cuadro: el destello
       entraba bien, pero después la pantalla se quedaba en blanco pleno casi
       dos segundos. Sobre papel marfil no molesta —el blanco ES el papel—;
       sobre una invitación negra tapa la escena. Acá va corto: el fogonazo se
       ve y se va. */
    /* ⭐⭐ POR QUÉ 0,42 Y POR QUÉ LA PRIMERA VEZ LO SAQUÉ MAL. 21/9/2026.
       `luzFundido` NO es sólo cuánto dura el desvanecido: es también cuánto
       ESPERA el motor, quieto y a opacidad 1, antes de empezarlo. Medido en
       vivo, con el valor de fábrica (1 s):
         4,16 s  entra `fundiendo`  — opacidad 1
         5,04 s  recién ahí entra `gone` y arranca el desvanecido
       O sea: casi un segundo entero mirándole al video del sobre el tramo en
       que se llena de blanco (brillo 102 → 251). Eso es la pantalla en blanco
       que veía Maki. Con 0,42 el corte pasa a los 4,58, cuando el blanco
       recién empieza: se lee como fogonazo y no como página rota.
       ⚠⚠ EL ERROR DE LA PRIMERA VUELTA, para no repetirlo: lo saqué porque
          «dejaba la portada gris clara». NO era cierto: yo estaba mirando un
          cuadro DE LA MITAD DEL FUNDIDO. Medido de nuevo cuadro por cuadro,
          medio segundo después la portada está negra y los textos en plata,
          exactamente igual que con 1 s.
       ⚠ LA REGLA: un cuadro tomado durante una transición no dice cómo queda
         la pantalla. Antes de culpar a un cambio, esperar a que la animación
         TERMINE y recién ahí mirar. */
    luzFundido: 0.42
  },
  perlas: {
    nombre: "Perlas · moño de perlas, se abre al medio (video)",
    video:  "/sobres/sobre-perlas.mp4",
    poster: "/sobres/sobre-perlas-poster.jpg",
    color:  "#f2f2f4",
    /* ⭐ MEDIDO CUADRO POR CUADRO EL 18/9/2026, con el video servido de verdad.
       Este sobre NO tiene zoom: ABRE Y SE VUELVE A CERRAR. El ancho de la
       abertura oscura, en pixeles de un cuadro de 160 de ancho:
         1,4s = 0  ·  1,7s = 2  ·  2,0s = 8  ·  2,3s = 17  ·  2,6s = 23
         2,8s = 25 (MAXIMO)  ·  3,0s = 25  ·  3,2s = 21  ·  3,5s = 13  ·  3,9s = 8
       O sea: el mono se desata a 1,3-1,4, el sobre abre de 1,5 a 2,8 y de 3,2
       en adelante SE CIERRA SOLO (el video esta armado para loopear).
       Con el respaldo de 4,2 s el invitado veia el sobre abrirse, cerrarse, y
       despues quedarse congelado hasta que saltaba el vigia. Por eso la luz va
       a los 2,9: justo cuando termina de abrirse y antes de que empiece a
       cerrarse. La mitad de vuelta del video no se ve nunca. */
    luz:    2.9
  },

  /* ---- ★ EL SOBRE DE PLAYA  (17/9/2026) ---------------------------------
     El sobre propio de la muestra de Riviera Maya (Valeria & Emiliano). Salió
     de la MISMA tanda de Flow que el resto de la temática, así que el papel,
     la luz y el color son los mismos que los del resto de la invitación:
     papel de lino marfil apoyado sobre arena blanca mojada, lacre NACARADO EN
     FORMA DE CARACOLA y una ramita de pasto marino seco al costado.

     El video hace el recorrido entero en 8 s: la espuma roza la arena, el
     lacre se desprende, la solapa se abre y la cámara entra hasta que el papel
     marfil del interior llena el cuadro. Termina en papel liso, por eso va
     `empalme: 'blanco'` y NO 'foto'.

     ⚠️ `color` MEDIDO, no estimado. Último cuadro, promedio de la banda
        central del papel: #e7e6df. El píxel exacto del centro da #e8e7df y la
        esquina #d0cec9 — esa esquina es la sombra del doblez y NO sirve para
        rellenar las barras.

     ⚠️ Vive en Cloudinary, no en /sobres/: es un mp4 de 3,1 MB. El catálogo
        acepta una URL completa igual que una ruta del repo.
     ---------------------------------------------------------------------- */
  playa: {
    nombre:  "Playa · lino marfil sobre arena, lacre de caracola (video)",
    video:   "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_auto/invitame/sobre-playa.mp4",
    /* ⭐ EN QUE SEGUNDO ARRANCA EL ZOOM — el destello va ahi (18/9/2026)
       Maki: «tenes que esperar que se abra el sobre y CUANDO HACE EL ZOOM que
       se vaya desvaneciendo con esa luz. Que no llegue al final del video y
       despues venga la luz.»
       Medido cuadro por cuadro sobre este mp4 (8 s), sacando fotogramas de
       Cloudinary con `so_<segundo>`: quieto hasta 3,0 · las solapas se abren de
       3,2 a 4,0 · el zoom empieza en 4,0. Por eso 4,2: deja ver la apertura
       entera y entra apenas arranca el acercamiento.
       ⚠️ CADA SOBRE NUEVO NECESITA LA SUYA. Se mide igual, con `so_`. */
    luz:     4.2,
    poster:  "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobre-playa-poster.jpg",
    color:   "#e7e6df",
    empalme: "blanco"
  },

  /* ---- ★ EL SOBRE CAMPESTRE  (21/9/2026) --------------------------------
     El sobre propio de la Colección Campestre (boda de María Paz y Joaquín,
     Tapalpa). Salió de la MISMA tanda de Flow que el resto de la temática:
     papel de algodón hecho a mano color crema con borde deckled, atado con
     hilo de yute, lacre redondo de TERRACOTA con una espiga grabada, y una
     espiga de trigo seco con dos hojas de olivo metidas bajo el hilo, todo
     apoyado en una mesa de roble envejecido.

     El video hace el recorrido entero en 8 s: el trigo tiembla, el hilo se
     afloja, el lacre se levanta, las dos solapas se abren y la cámara entra
     hasta que el papel crema del interior llena el cuadro. Termina en papel
     liso, por eso va `empalme: 'blanco'`.

     ⭐ `luz` MEDIDA CUADRO POR CUADRO sobre el mp4 servido, no estimada.
        Brillo medio y movimiento, muestreados tres veces por segundo:
          0,0 a 3,0 s  quieto, cerrado          brillo 111 · movimiento 1,0-1,2
          3,3 a 3,7 s  se afloja y abre         brillo baja a 106 · movimiento 7,6-8,0
          4,0 s        ARRANCA EL ZOOM          brillo 124 (empieza a subir)
          4,3 a 7,7 s  el papel llena el cuadro brillo 145 -> 208
        El destello entra cuando arranca el zoom: 4,0.

     ⚠️ SIN `luzFundido`: se queda con el valor de fábrica (1 s) A PROPÓSITO.
        La regla es «cuanto más oscura la invitación, más corto el destello».
        Disco lo necesita en 0,42 porque sobre negro dos segundos de blanco se
        leen como página rota. Campestre es una invitación de papel CREMA: ahí
        el blanco ES el papel y el segundo entero se lee como un fogonazo de
        sol, no como un error.

     ⚠️ `color` MEDIDO sobre el último cuadro, no estimado. Banda central del
        papel: #e9d8c0 (el píxel exacto del centro da #ecdbc3). La esquina da
        #aa9787 — eso es la sombra de la madera y NO sirve para rellenar las
        barras, que es justo el error que se anotó en el sobre de playa.

     ⚠️ Vive en Cloudinary, no en /sobres/: son 461 KB de mp4. El catálogo
        acepta una URL completa igual que una ruta del repo, y se verificó que
        Chrome lo decodifica desde ahí (el `content-type` con `codecs=avc1` no
        molesta a un video de fondo o de sobre).
     ---------------------------------------------------------------------- */
  campestre: {
    nombre:  "Campestre · papel crema, lacre de terracota y trigo (video)",
    video:   "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_auto/invitame/sobre-campestre.mp4",
    poster:  "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobre-campestre-poster.jpg",
    luz:     4.0,
    color:   "#e9d8c0",
    empalme: "blanco"
  },

  /* ---- ★ LA PRESENTACIÓN BORDADA  (8/9/2026) ---------------------------
     No es un sobre: es una PRESENTACIÓN. Copia la muestra que mandó Maki
     (@hadar.cohennn): una máquina de bordar cosiendo con hilo champagne
     sobre lino crudo, tono sobre tono, y la cámara que se aleja en un solo
     plano hasta mostrar la pieza entera.

     Medido sobre la muestra: el paneo del macro dura ~2,9 s, después la
     cámara se queda quieta ~2 s bordando un corazón, y el alejamiento abre
     el cuadro 3,1 veces en 4,1 s frenando fuerte al final. Nuestro video
     hace el mismo recorrido en 8 s.

     ⚠️ SE RENDERIZA A 540×960 A PROPÓSITO. El lino tiene una trama finita
        que a 720p produce un MOARÉ vertical bien visible (se vio). Bajando
        a 540 la trama promedia y desaparece; encima el archivo pasa de 7,8
        MB a 2,1 MB, que para una invitación importa.

     El texto dice "Nuestra boda", así que sirve para cualquier pareja sin
     regenerar nada. Queda pendiente la versión "Mis XV" y una sin texto
     para dibujar los nombres reales por encima con HTML.
     ---------------------------------------------------------------------- */
  bordado: {
    nombre:  "Bordado · la máquina borda la pieza (video)",
    video:   "/sobres/presentacion-bordado.mp4",
    poster:  "/sobres/presentacion-bordado-poster.jpg",
    color:   "#ac8f6f",
    empalme: "foto"
  },

  /* ---- ★ BOHEMIA · papel de algodón con lacre terracota  (21/9/2026) -----
     El sobre de la colección Bohemia. Papel de algodón crema con borde deckle
     sobre una mesa de roble, lacre redondo terracota con un grabado botánico,
     espigas de trigo y eucalipto seco encima, y una pluma de pampa y dos rosas
     secas alrededor. Generado en Flow a partir de la imagen base de la
     temática.

     ⭐ LA LUZ, MEDIDA CUADRO POR CUADRO (4 cuadros por segundo, brillo medio
        y movimiento entre cuadros consecutivos):

          0,0 a 3,0 s   quieto              brillo 162   movimiento 1 a 4
          3,0 a 4,75 s  se abre la solapa   brillo 157   movimiento 3,7 a 7,8
          5,0 s         ARRANCA EL ZOOM     brillo 161   movimiento salta a 11,3
          5,0 a 7,75 s  zoom y luz          brillo 161 -> 227

        Por eso `luz: 5.0`: el destello entra justo cuando arranca el
        acercamiento, no cuando el video ya terminó.

     ⚠️ `luzFundido` va LARGO acá, al revés que en Disco. La regla es: cuanto
        más oscura la invitación, más corto el destello. Bohemia es de papel
        crema, así que el blanco ES el papel y un segundo no se lee como
        pantalla rota — se lee como que la luz entra. Disco necesita 0,42
        porque es negra.

     ⚠️ El color es el de la MESA, no el del sobre: `#env` se pinta con esto
        mientras carga el video, y el sobre tiene que recortarse contra algo. */
  bohemia: {
    nombre:  "Bohemia · papel de algodón con lacre terracota (video)",
    video:   "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_auto/invitame/sobres/sobre-bohemia.mp4",
    poster:  "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto/invitame/sobres/sobre-bohemia-poster.jpg",
    color:   "#B79876",
    luz:     5.0,
    luzFundido: 0.95
  },

  /* ---- ★ ONYX · lino negro con lacre de oro grabado  (18/9/2026) ---------
     Maki mandó la muestra de Invitely "luxury": «mirá la textura, el relieve,
     hasta se ve relieve cuando se abre; el que me diste era todo plano».

     Fui a verla en el navegador. El hallazgo: el sobre de Invitely NO es 3D ni
     CSS, es un <video> de 4,18 MB con poster, y le bajan la opacidad 0,65 s al
     terminar. El relieve que tanto gusta es FOTOGRÁFICO.

     Este sale del onyx de agosto, que sí era plano. El relieve se agregó en
     espacio de imagen con campo de altura + luz medida sobre el propio lacre
     de la foto (ver /claude/ONYX-relieve-y-fluidez.md):
       · trama de lino de ligamento tafetán, con irregularidad de fibra
       · emblema damasco GRABADO en el disco, con especular de oro
       · canto de papel en los dobleces, que es lo que se sigue viendo al abrir
     Está aplicado a las CUATRO capas y el video se volvió a renderizar con
     ellas, así que la textura está también durante la apertura.

     ⚠️ LA SOLAPA ABRÍA PARA ADENTRO y lo cazó Maki de una: «¿dónde viste que
        un sobre abre para adentro?». Medido, el área del lacre iba de 22.509 a
        2.285 px achicándose siempre: se alejaba del ojo, o sea la solapa se iba
        detrás del sobre, atravesándolo. Con la bisagra arriba, rotateX tiene
        que ir POSITIVO. Ahora el lacre crece 31 % antes de irse de cuadro.
        Y al abrir bien aparece el REVERSO, que antes no existía: se agregó como
        segunda cara con backface-visibility.

     ★★★ LA v2: TENÍA 2,5 s MUERTOS DE 5,33 Y NO LOS HABÍA VISTO  (18/9/2026)

        Maki: «¿entraste de verdad y lo revisaste frame por frame? ¿usaste la
        skill?». No la había usado. Al hacerlo, los 128 cuadros de a uno dieron
        tres defectos, todos de TIEMPO:

          cuadros   1–40   1,67 s con el lacre quieto (sólo un brillo pasando)
          cuadros  76–80   0,21 s de PANTALLA NEGRA VACÍA: la solapa ya se fue
                           y la tarjeta todavía no llegó. Medido: lacre 0 px,
                           tarjeta 0 px. Es la sensación de «se traba», pero
                           venía adentro del archivo, no del reproductor.
          cuadros 113–128  0,65 s de cola muerta: la tarjeta sube 9 px

        Se rearmó re-cronometrando los cuadros que ya estaban (las capas del
        render no sobrevivieron al contenedor). Los cortes se eligieron
        MIDIENDO la diferencia entre cuadros, no a ojo: el salto 76→81 da 0,91
        contra 2,3 de un paso normal, o sea que el empalme es invisible.

          v1: 128 cuadros, 5,33 s, 2,5 s muertos
          v2:  80 cuadros, 3,33 s, CERO cuadros congelados, cero saltos

        ⚠️ ES OTRO `public_id` A PROPÓSITO (`sobre-onyx-v2`). Cloudinary sirve
           con `max-age=2592000`: pisar el mismo id dejaría a los invitados con
           el archivo viejo en caché hasta 30 días. Un id nuevo es el único
           corte limpio.

     ⚠️ PESA 244 KB servidos, no 4 MB, y eso no es capricho: el invitado toca
        entre los 3 y los 6 s, y un sobre liviano arranca antes SIEMPRE. El de
        Invitely, en la misma red, tarda 24 s en estar listo. (El motor ya no
        exige el video entero para arrancar —mide si la descarga le gana a la
        aguja— pero eso no cambia la regla del peso.)

     ⚠️ VIVE EN CLOUDINARY, NO EN /sobres/  (18/9/2026)
        Igual que `playa`, y por la misma razón práctica: el catálogo acepta
        una URL completa lo mismo que una ruta del repo.

        La transformación NO es la de `playa`. `vc_auto` devuelve perfil HIGH,
        y los sobres se renderizan en **Constrained Baseline** a propósito, que
        es lo que decodifica cualquier teléfono viejo. Con
        `vc_h264:baseline:3.1` Cloudinary respeta el perfil y entrega 244 KB.

        Comparado cuadro por cuadro contra el original (128 cuadros):
        PSNR mínimo 41,6 dB, medio 43,5 dB — arriba de 40 dB no se distingue.
        Mismo 540×960, 24 fps, 128 cuadros, 5,333 s, moov al principio, y la
        zona plana de la tarjeta NO tomó bandas (escalón máximo entre filas
        10,5 contra 11,7 del original). El póster sale en webp de 26 KB.

        ⚠️ El .mp4 y el .jpg NO están en el repo: no hay forma de subir un
           binario por la API de GitHub. Si hay que regenerarlos, el video
           está embebido en base64 en el artefacto «Sobre Onyx» y las fuentes
           del relieve en ONYX-relieve-y-fluidez.md.

     empalme 'foto': el video termina con una tarjeta marfil lisa subiendo, y
     el motor la funde encima de la portada real que ya está dibujada debajo.
     Por eso la tarjeta del video no tiene ni nombres ni adornos: es el papel
     que se convierte en la invitación.

     ⚠️ `color` ES EL PAPEL, NO LA TARJETA  (18/9/2026)
        Estaba puesto #e6dccb, que es el marfil de la tarjeta que sube al final.
        Pero `color` no pinta la tarjeta: es el fondo que queda DETRÁS del video
        contenido (`object-fit:contain`, ver `estilo()` en el motor). Con el
        video 9:16 en un teléfono 9:19,5 eso son dos franjas, y quedaban DOS
        BANDAS MARFIL arriba y abajo del sobre negro. Se vio en la vista previa.
        Va el papel MEDIDO en el primer cuadro: las cuatro esquinas dan
        #0f0f0f / #161616 / #090909 / #090909 y el borde a media altura #171717.
        Queda #0f0f0f. Es el caso exacto que avisa la nota "Y OJO CON QUÉ PARTE
        SE MIDE" de más arriba, y caí igual.
     ---------------------------------------------------------------------- */
  onyx: {
    nombre:  "Onyx · lino negro, lacre de oro grabado (video)",
    video:   "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/sobre-onyx-v2.mp4",
    poster:  "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobre-onyx-v2-poster.jpg",
    color:   "#0f0f0f",
    empalme: "foto"
  },

  /* ---- EL SOBRE DE ANILLOS  (3/9/2026) ----------------------------------
     Sobre marfil de solapa clásica, papel con damasco EN RELIEVE (grabado
     seco, no impreso) y un lacre color hueso con DOS ANILLOS ENTRELAZADOS.

     ⚠️ SE ABRE POR SOLAPAS, NO POR VIDEO. El video de Flow existe y quedó
        declarado como respaldo, pero se abría descontrolado: el relieve
        cambiaba solo (arranca con volutas, termina con rosas) y el lacre se
        desvanecía en vez de partirse. Con la foto y CSS el movimiento sale
        igual siempre, y el lacre se parte al medio como corresponde.

     El archivo de video, por si alguna vez se vuelve: recortado a 7 s,
     acelerado 1,75× (queda en 4,0 s), subido a 1080 con lanczos y
     recodificado en Constrained Baseline.
     ---------------------------------------------------------------------- */
  anillos: {
    nombre:   "Anillos · marfil en relieve, lacre de dos anillos",
    video:    "/sobres/sobre-anillos.mp4",
    poster:   "/sobres/sobre-anillos-poster.jpg",
    color:    "#f4f2ec",
    apertura: "solapas",
    empalme:  "foto"
  },

  /* ---- ★ EL SOBRE MAESTRO  (4/9/2026) -----------------------------------
     El que copia la muestra que mandó Maki (@inviteness). Medida contra
     medida, la diferencia con los nuestros no era el movimiento: era LA FORMA.

       · el de ellos tiene UNA sola solapa triangular arriba y, debajo del
         lacre, PAPEL LISO;
       · los nuestros tenían la X de cuatro solapas cruzándose en el centro.
         Al levantar la de arriba quedaba un rombo oscuro con dos cuñas
         filosas: una figura geométrica, no un sobre abierto.

     Es el primero con `solapa`: una SEGUNDA imagen, recortada con
     transparencia, que trae el triángulo de arriba MÁS EL LACRE. Por eso acá
     el lacre viaja pegado a la solapa en vez de partirse al medio, que es lo
     que pasa cuando las cuatro hojas salen de la misma foto.

     ⚠️ PARA GENERAR UNO NUEVO EN FLOW: costó tres tiradas acertar. Si se le
        pide "sobre visto desde atrás" devuelve SIEMPRE la X de cuatro puntas.
        Lo que funciona es decirlo en positivo: «todo lo que está debajo de ese
        punto es una hoja de papel continua, sin ningún doblez». El prompt
        entero está en el proyecto, en SOBRE-MAESTRO-spec-json.md.

     `eje` es dónde cae la punta de la solapa, en % de la foto. MEDIDO sobre la
     imagen: (50,5 % · 52,3 %). El lacre la tapa entera.
     ---------------------------------------------------------------------- */
  maestro: {
    nombre:   "Maestro · marfil botánico, cuatro solapas, lacre liso (foto)",
    poster:   "/sobres/sobre-maestro.jpg",
    solapa:   "/sobres/sobre-maestro-solapa.webp",
    color:    "#e8e2d8",
    apertura: "solapas",
    empalme:  "foto",
    /* ⚠️ VOLVIÓ EL BLANCO (4/9/2026). Se probó una versión en papel tostado
       con luz rasante y Maki la bajó: «te quedó como el orto, antes había
       quedado bien el blanco, volvé a ese». Este es el sobre que estaba
       andando: marfil con relieve botánico y lacre liso.
       Los archivos del tostado quedaron en el repo pero NO se usan.

       `eje` = dónde se cruzan las cuatro solapas, medido sobre la foto:
       381/768 y 687/1376. Se abre SÓLO la de arriba. */
    eje:      { x: 49.6, y: 49.9 }
  },


  'carta-toscana': {
    nombre: "Tarjeta troquelada Toscana · se escribe sola (video)",
    video:  "/sobres/carta-toscana.mp4",
    poster: "/sobres/carta-toscana-poster.jpg",
    color:  "#efe7da",

    /* ---- LA PIEZA SE ESCRIBE SOLA ----------------------------------------
       Este video NO es un sobre que se abre: es una tarjeta troquelada filmada
       con un acercamiento lento, GENERADA EN BLANCO a propósito. El módulo
       /efectos/pieza-carta.js escribe encima los datos de la pareja que ya
       están cargados en la invitación. Así el mismo archivo sirve para todos.

       Todos estos números salen de MEDIR la imagen, no de estimarla:
         · eje 399    la corona de arriba y la hojita de abajo están las dos
                      centradas ahí
         · la cara útil va de y=330 (bajo la corona) a y=775 (sobre el paisaje)
         · a la altura de las mayúsculas la cara mide 390 px de ancho. Con 330
                      de tope, los dos renglones entran en cuerpo 12 y quedan
                      36 px de aire de cada lado.
         · la tinta está muestreada del propio grabado del paisaje
         · desde 3.45  el video dura 6,9 s: 3,3 de acercamiento y 3,6 de imagen
                      quieta. La escritura pasa entera en la parte quieta.

       `lineas` son LÍNEAS DE BASE, no bordes de caja.
       -------------------------------------------------------------------- */
    texto: {
      base:    [720, 1280],
      eje:     399,
      desde:   3.45,
      tinta:   "#705a42",
      oro:     "#9e825c",
      serif:   "'Cormorant Garamond',Georgia,serif",
      script:  "'Pinyon Script',cursive",
      fuentes: "family=Cormorant+Garamond:wght@400&family=Pinyon+Script",
      lineas:  { k1:355, k2:379, n1:473, n2:615, filete:655, fecha:682, hora:711, lug1:743, lug2:764 },
      tam:     { k:15, n:84, nexo:42, fecha:18, hora:14, lug1:15, lug2:13 },
      ancho:   { k:330, n:318, fecha:300, lug:306 }
    }
  },

  marfil: {
    nombre: "Marfil en relieve",
    img:    "/sobres/sobre-marfil.jpg",
    lacre:  "/sobres/lacre-marfil.png",
    color:  "#efe4cd"
  },

  floral: {
    nombre: "Floral en relieve (marfil)",
    img:    "/sobres/sobre-floral.jpg",
    color:  "#d9a7ae"
  }

};


/* ===== 2. LA PUESTA EN PANTALLA DEL SOBRE =====================================

   EL PROBLEMA
   Los videos de sobre son verticales (9:16), pensados para el celular. En una
   compu la ventana es apaisada, y el video se estiraba a toda la pantalla con
   "cover": entraba sólo el centro del sobre, ampliadísimo.

   LA SOLUCIÓN
   En la compu el sobre se muestra en el centro, del mismo tamaño con el que se
   ve en un celular, y el resto de la pantalla se llena con EL MISMO PAPEL del
   sobre, muy desenfocado, más un viñeteado suave.

   POR QUÉ NO HAY SALTO AL ABRIR
   Le damos al sobre el alto de la portada (84vh) y de ahí sale el ancho por la
   proporción del video (9:16). En un monitor de altura normal eso da 474px: el
   MISMO ancho que `.portada`.

   ⚠️⚠️ NO USAR `aspect-ratio` ACÁ. ESTO SE ROMPIÓ EN PRODUCCIÓN.
   `aspect-ratio` sobre un elemento reemplazado (`<video>`, `<img>`) no se
   aplica igual en Safari: el ancho se resolvía solo, el video volvía a ocupar
   la pantalla entera con `object-fit:cover` y en la Mac de Maki se veía un
   pedazo gigante del sobre. Ahora el ancho se calcula con `calc()`, que es
   aritmética y anda igual en todos lados.

   Los tamaños van con `!important` a propósito: el motor arma el sobre después
   de que carga este archivo y mete sus propios estilos.

   LOS CONTROLES DE SAFARI
   El `<video>` NO tiene `controls`. Pero Safari en Mac, cuando bloquea el
   autoplay, mete SUS PROPIOS controles encima. Se apagan con los
   pseudo-elementos ::-webkit-media-controls.

   EN EL CELULAR NO CAMBIA NADA: vive dentro de un @media de 680px para arriba.
   ============================================================================ */
(function () {

  var ALTO  = 'min(84vh, 843px)';
  var ANCHO = 'calc(' + ALTO + ' * 9 / 16)';

  var css = [
    '#env.carta-video #env-vid::-webkit-media-controls,',
    '#env.carta-video #env-vid::-webkit-media-controls-enclosure,',
    '#env.carta-video #env-vid::-webkit-media-controls-panel,',
    '#env.carta-video #env-vid::-webkit-media-controls-start-playback-button{',
    '  display:none!important;-webkit-appearance:none!important}',

    '#sobre-fondo,#sobre-vinieta{display:none}',

    '@media (min-width:680px){',
    '  #env.carta-video{background:#cfc4b4}',

    '  #sobre-fondo{display:block;position:absolute;inset:0;z-index:0;',
    '    background-size:cover;background-position:center;',
    '    filter:blur(64px) saturate(.7) brightness(.94);transform:scale(1.35)}',

    '  #sobre-vinieta{display:block;position:absolute;inset:0;z-index:1;',
    '    pointer-events:none;background:radial-gradient(120% 85% at 50% 50%,',
    '    rgba(0,0,0,0) 38%, rgba(0,0,0,.16) 78%, rgba(0,0,0,.30) 100%)}',

    /* ⚠️ ancho por calc(), NUNCA aspect-ratio */
    '  #env.carta-video #env-vid{',
    '    position:absolute!important;',
    '    inset:auto!important;',
    '    left:50%!important;top:50%!important;',
    '    transform:translate(-50%,-50%)!important;',
    '    z-index:2;',
    '    height:' + ALTO + '!important;',
    '    width:' + ANCHO + '!important;',
    '    max-width:92vw!important;',
    '    object-fit:cover;border-radius:30px;',
    '    box-shadow:0 32px 74px rgba(40,28,12,.34)}',

    '  #env.carta-video .triflap,',
    '  #env.carta-video #tri-seal,',
    '  #env.carta-video #e-back,',
    '  #env.carta-video #e-pocket,',
    '  #env.carta-video #e-flap{display:none!important}',

    '  #env.carta-video .vhint{position:absolute;left:50%;transform:translateX(-50%);',
    '    top:calc(50% + min(42vh,421px) + 18px)}',
    '}'
  ].join('\n');

  function ponerEstilos() {
    var v = document.getElementById('sobre-encuadre');
    if (v) v.remove();
    var s = document.createElement('style');
    s.id = 'sobre-encuadre';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  function pintarFondo() {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return;

    var esCartaVideo = env.classList.contains('carta-video');
    var poster = vid.getAttribute('poster') || '';
    var fondo = document.getElementById('sobre-fondo');

    /* en apertura por solapas el <video> no tiene poster: se toma del catálogo */
    if (!poster && env.dataset && env.dataset.apertura === 'solapas') {
      try {
        var s = (window.INVEV || {}).fx.sobre || {};
        var m = (window.SOBRES_INVITAME || {})[s.modelo] || {};
        poster = m.poster || '';
      } catch (e) {}
    }

    if (!esCartaVideo || !poster) { if (fondo) fondo.style.backgroundImage = ''; return; }

    if (!fondo) {
      fondo = document.createElement('div');
      fondo.id = 'sobre-fondo';
      var vin = document.createElement('div');
      vin.id = 'sobre-vinieta';
      env.insertBefore(fondo, env.firstChild);
      env.insertBefore(vin, fondo.nextSibling);
    }
    var url = 'url("' + poster.replace(/"/g, '%22') + '")';
    if (fondo.style.backgroundImage !== url) fondo.style.backgroundImage = url;
  }

  /* ⚠️ RED DE SEGURIDAD: si el video quedara a pantalla completa, se corrige. */
  function vigilarTamano() {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid || innerWidth < 680) return;
    if (!env.classList.contains('carta-video')) return;
    if (env.dataset && env.dataset.apertura === 'solapas') return;
    var b = vid.getBoundingClientRect();
    if (b.width <= innerWidth * 0.75) return;
    var alto = Math.min(innerHeight * 0.84, 843);
    vid.style.setProperty('position', 'absolute', 'important');
    vid.style.setProperty('inset', 'auto', 'important');
    vid.style.setProperty('left', '50%', 'important');
    vid.style.setProperty('top', '50%', 'important');
    vid.style.setProperty('transform', 'translate(-50%,-50%)', 'important');
    vid.style.setProperty('height', alto + 'px', 'important');
    vid.style.setProperty('width', Math.round(alto * 9 / 16) + 'px', 'important');
  }

  function arrancar() {
    ponerEstilos();
    pintarFondo();
    vigilarTamano();

    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (window.MutationObserver && env) {
      new MutationObserver(function () { pintarFondo(); vigilarTamano(); })
        .observe(env, { attributes: true, attributeFilter: ['class', 'data-apertura'] });
      if (vid) new MutationObserver(function () { pintarFondo(); vigilarTamano(); })
        .observe(vid, { attributes: true, attributeFilter: ['poster', 'style'] });
    }
    addEventListener('resize', vigilarTamano);
    var n = 0, t = setInterval(function () {
      pintarFondo(); vigilarTamano();
      if (++n > 40) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();


/* ===== 3. EL ENGANCHE =========================================================
   La lista de módulos del front vive en /efectos/index.js. Se carga desde acá y
   nada más.
   ============================================================================ */
(function () {
  var src = '/efectos/index.js';
  if (document.querySelector('script[src="' + src + '"]')) return;
  var s = document.createElement('script');
  s.src = src;
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();
