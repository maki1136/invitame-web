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

   ★★★ TODOS LOS SOBRES VIVEN ACÁ  (25/9/2026)
     Maki: «quiero que todos los sobres estén en el mismo lugar del catálogo
     como corresponde y que se puedan usar sin problemas de peso».
     Tenía razón y hay que dejarlo escrito, porque la tentación de registrar un
     sobre desde un módulo suelto vuelve cada vez que este archivo crece:
       · el PESO no es el que asusta. El archivo pesa 76 KB en crudo, pero el
         servidor lo manda con Brotli: **24,5 KB viajan de verdad** (medido con
         `content-encoding: br`). No hay problema de peso que justifique
         partirlo ni esconder fichas afuera.
       · el RIESGO de escribirlo entero se resuelve con RED, no mudando la
         ficha: se sube primero a una rama, se verifica que el blob que devuelve
         GitHub sea idéntico al local (mismo `git hash-object`) y recién ahí se
         mergea a main. Si la subida se corta, main ni se entera.
     ⭐ O sea: un sobre nuevo se agrega ACÁ, siempre, y se sube con rama.
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
     DISCO — el sobre de la muestra de XV de Lupita. REHECHO el 28/9/2026
     (Maki: «el sobre de disco quedó muy básico, muy mal»). El viejo era un
     sobre gris liso sobre raso. Ahora: sobre de terciopelo azul noche con el
     filo de la solapa en teselas de espejo, lacre fundido como una bola de
     espejos, bola de espejos real girando en la esquina y reflejos que se
     mueven. Imagen: Higgsfield Soul · video: Kling 3.0 pro 5 s, cámara quieta.
     MEDIDO cuadro por cuadro (cada 0,25 s, brillo medio / movimiento):
       0,0 a 2,0 s  quieto, sólo los reflejos     brillo 37   mov 3
       2,25 a 3,5 s se levanta la solapa          brillo 38→52 mov 5→12
       4,25 a 5,0 s sale la luz de adentro        brillo 72→107
     Dura 5,04 s. El fogonazo entra en 4,4 y termina en 4,9 (antes del final).
     ⚠️ Sobre una invitación OSCURA el blanco largo se lee como página rota
        (lección del 21/9): por eso el fundido es corto.
     ---------------------------------------------------------------------- */
  disco: {
    nombre:     "Disco · terciopelo azul noche con teselas de espejo y lacre de bola de espejos (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264:baseline:3.1,ac_none/invitame/disco/ds-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/disco/ds-sobre-v1.jpg",
    color:      "#1A2035",
    luz:        4.4,
    luzColor:   "#EEF1F8",
    luzFundido: 0.5
  },
  /* ----------------------------------------------------------------------
     DISCO NOCHE — la segunda opción del sobre disco (28/9/2026). Maki: «agregá
     otra opción más de noche: fondo negro, más bolas, más luces». Sobre negro
     satinado con el filo de teselas de espejo y lacre de bola de espejos,
     sobre terciopelo negro con cuatro bolas de espejos y puntos de luz.
     Higgsfield Soul + Kling 3.0 pro 5 s, cámara quieta. MEDIDO (0,25 s):
       0 a 1,5 s  quieto, sólo destellos         brillo 28
       1,8 a 2,8 s se levanta la solapa
       4,25 a 5,0 s sale la luz                  brillo 54 → 105
     Dura 5,04 s. Invitación oscura → fogonazo corto (4,45 → 4,95).
     ---------------------------------------------------------------------- */
  'disco-noche': {
    nombre:     "Disco noche · sobre negro, muchas bolas de espejos y luces (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264:baseline:3.1,ac_none/invitame/disco/dn-sobre-v2.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/disco/dn-sobre-v2.jpg",
    color:      "#1C1C1E",
    luz:        4.45,
    luzColor:   "#EEF1F8",
    luzFundido: 0.5
  },
  /* ---- ROSA DISCO (28/9/2026, XV, referencia xv-marian21): sobre rosa claro sobre fondo rosa con bolas de espejo y peonías en las esquinas; la solapa sube con el sello de espejo y sale luz rosada. Kling v3 pro 5 s, horneado vc_h264 SIN baseline. ---- */
  'rosa-disco': {
    nombre:     "Rosa disco · sobre rosa con sello de espejo, bolas y peonías (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto/invitame/rosadisco/rd-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/rosadisco/rd-sobre-v1.jpg",
    color:      "#F2DCE1",
    luz:        4.2,
    luzColor:   "#FFF4F6",
    luzFundido: 0.8
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

  /* ---- ★ EL SOBRE DE SIRENA  (25/9/2026) --------------------------------
     El sobre propio de la Colección La Sirenita (los XV de Marisol, Campeche).
     Hecho en Flow —donde la IMAGEN no gasta créditos, sólo el video de Veo— con
     el papel, la luz y la paleta de la colección: papel nácar hecho a mano con
     borde deckled sobre arena clara, vidrio de mar verde y caracolitos en las
     esquinas.

     ⚠️⚠️ NACE DE UN RECLAMO DE MAKI, TEXTUAL: «el sobre quedó mal, el lacre
        tiene que ser REDONDO y la imagen ADENTRO, porque quedó mal, ¿no lo
        ves?». El anterior era un borrón más alto que ancho, con la caracola
        desbordando el borde. Éste se MIDIÓ antes de subirlo, y ésa es la
        lección: al lacre no alcanza con mirarle el color, hay que medirle la
        FORMA. Se aísla la mancha coral más grande de la foto y se la compara
        contra un círculo:
          relación ancho/alto   1,000   (1,000 = círculo perfecto)
          llena el              98,1 %  de un círculo de radio 95 px
          centro del lacre      50,4 % · 50,0 % de la foto
        Por eso NO lleva `eje`: el 50/50 por defecto le queda exacto.
        La vieira va ADENTRO del disco, con cera a la vista todo alrededor, y
        DERECHA —charnela abajo, abanico hacia arriba— igual que la vieira de
        `colecciones/sirena.js`. De las dos tomas que dio Flow se eligió la que
        tenía esa orientación, no la que tenía la concha acostada.

     ⚠️ VA POR `solapas`, NO por video, y por eso no gastó un crédito: la foto
        se parte en cuatro triángulos desde el centro y el lacre se corta al
        medio. Las cuatro solapas del sobre confluyen justo en el lacre, que es
        la geometría que ese modo espera.
        El precedente es `anillos`: solapas con SÓLO póster. La imagen `solapa`
        aparte —y borrarle el lacre al póster— hace falta cuando el lacre viaja
        pegado a UNA sola solapa (cantera, cenicienta, bella); acá se parte, así
        que no hay dos lacres y no hay nada que borrar.

     ⚠️ En apertura `solapas` el empalme va SIEMPRE 'foto': el sobre queda
        abierto y se funde sobre la portada real.

     ⚠️ `color` MEDIDO, no estimado: promedio del papel en la franja central,
        salteando el disco del lacre → #E8E1D9 (34.579 px muestreados).
     ---------------------------------------------------------------------- */
  sirena: {
    nombre:   "Sirena · papel nácar sobre arena, lacre coral con vieira (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobre-sirena-25-9.jpg",
    color:    "#E8E1D9",
    apertura: "solapas",
    empalme:  "foto"
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

  /* ---- ★ CANTERA · papel beige tallado, lacre de olivo  (22/9/2026) ------
     El sobre propio de la Colección Cantera (boda de Regina y Emiliano, en
     Morelia). Papel de algodón beige cálido con relieve seco de la cenefa de
     CANTERA TALLADA de Morelia —la misma piedra que la colección usa de
     textura en las seis bandas— y un lacre redondo de terracota con una rama
     de olivo grabada, que es la marca de la colección (la viñeta de los
     títulos, la marca de cada hora del itinerario y la tapa de la raspadita
     son la misma hoja).

     ⚠️ ES `apertura: 'solapas'`, NO VIDEO, A PROPÓSITO. Regla de Maki desde
        el sobre de anillos: un video generado con IA hace lo que quiere. Acá
        el movimiento lo maneja el motor: mismo tiempo, mismo ángulo, siempre.
        Por eso tampoco lleva `luz` ni `luzFundido`: esos dos son del video.

     ⭐ EL PROMPT QUE FUNCIONÓ (4 de 4 usables, 0 créditos en Nano Banana 2).
        Las dos trampas, dichas EN POSITIVO como enseñó el maestro:
          · que el sobre llene el cuadro: «FILLS THE ENTIRE FRAME edge to edge
            and corner to corner. No table, no background, no surface: the
            envelope paper covers every single pixel of the image.»
            Sin eso devuelve el sobre apoyado en una mesa, y el recorte del
            motor —que da por sentado que la solapa arranca en la fila 0— se
            come la mesa y deja un agujero arriba (el error de Cenicienta).
          · que no haya X de cuatro puntas: «One single triangular flap folded
            down from the very top edge, its point ending at the exact centre;
            everything below that point is one continuous sheet of paper with
            no fold and no seam and no crossing edges.»
        Salió 768×1376 = 0,558, que es JUSTO la proporción del maestro y la
        del marco. No hizo falta recortar nada.

     ⭐ TODO LO DEMÁS SE MIDIÓ SOBRE LA PROPIA FOTO, no se estimó:
          lacre      centro (385, 691) = 50,1 % · 50,2 %, radio 112 px
          diagonales y=150 → x=36 · y=300 → x=118 · y=450 → x=200
                     pendiente 0,547 → se cruzan en y = 786
                     y salen del lienzo 46 px por afuera en y = 0
          eje        50,0 % · 57,1 %  (786 / 1376) — la punta de la solapa
          papel      promedio #C9B398 (las esquinas de arriba dan #E8DDCE y
                     las de abajo #A38A6C: ésas son la sombra, NO sirven para
                     rellenar las barras — el error anotado en `playa`)

     ⚠️⚠️ EL LACRE SE LE BORRA AL PÓSTER, y esto es lo que más costó.
        Si el lacre está en las dos imágenes, al levantarse la solapa aparece
        el de abajo, quieto, y se lee como un pliegue doble (lo pagó
        Cenicienta). El parche se eligió MIDIENDO: se tomó el brillo del
        ANILLO que rodea al lacre (entre 1,18 y 1,6 radios, L=177) y se probó
        el papel a 230, 260, 290, 320 y 350 px más abajo:
             +230 → L=171 (se aparta 5,9)     +290 → L=178 (1,0)
             +260 → L=176 (1,9)               +320 → L=177 (0,0)  ← éste
                                              +350 → L=176 (1,1)

        ⚠️ Y DESPUÉS HUBO QUE DECIDIR QUÉ SE VE AHÍ. Tapar el lacre con papel
           liso deja igual un disco: alrededor hay ornamento en relieve y el
           parche no lo tiene. Probé subirle el grano al parche para igualar
           el desvío del anillo (19,9 contra 9,7) y quedó PEOR: un bulto claro
           y rugoso.
           La salida no fue tapar mejor: fue cambiar qué cosa es. Se dejó el
           parche liso, un 4,5 % más oscuro, con una sombra radial suave en el
           borde de adentro. Ahora no se lee como «falta algo»: se lee como LA
           HUELLA que deja el lacre en el papel al despegarse. Que es lo que
           pasa de verdad.

     `solapa` = el triángulo de arriba MÁS el lacre, con transparencia, EN EL
     MISMO LIENZO de 768×1376 que el póster (recortarla a su caja la corre de
     lugar: otro error ya pagado en Cenicienta). Armada por geometría sobre la
     propia foto: triángulo (−46, 0) → (814, 0) → (384, 786) más el disco del
     lacre en (385, 691) con radio 126, y 1,6 px de desenfoque en el borde.
     ---------------------------------------------------------------------- */
  cantera: {
    nombre:   "Cantera · papel tallado, lacre de olivo en terracota (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/cantera/sobre-cantera-poster-v4.webp",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/cantera/sobre-cantera-solapa.webp",
    color:    "#C9B398",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.0, y: 57.1 }
  },

  /* ---------------------------------------------------------------------
     ★ CANTERA EN VIDEO · papel tallado con olivo, lacre de terracota  (22/9/2026)
     Maki: «para el sobre armá uno nuevo como el de toscana grabada pero con
     este estilo en su dibujo». El de arriba («cantera») es de FOTO con solapas;
     éste es de VIDEO, como toscana: el sobre quieto, la solapa se levanta y la
     cámara entra hasta llenar la pantalla de papel marfil.
     ★ v2, 22/9/2026: Maki vio la v1 de 8 s y dijo «abre mal». Tenía razón y la
     causa es de Flow: en 8 segundos estira el movimiento y la apertura se arrastra.
     Rehecho en 4 s, y la solapa se abre de un solo movimiento.
     ★★ LA REGLA: un sobre son 4 SEGUNDOS. Más largo, Flow rellena con tiempo muerto.
     Medido cuadro a cuadro a 6 fps sobre el video entregado (720x1280, 4 s):
       · 0,00 a 0,67 s  quieto (movimiento 0,7 a 1,0)
       · 0,83 a 1,33 s  se levanta la solapa (brillo baja 189 -> 178: su sombra)
       · 1,50 s         pico de movimiento 17,2: la solapa termina de abrirse
       · 2,20 s         segundo pico 17,0 y el brillo empieza a subir  ->  luz
       · 2,20 a 3,83 s  el brillo sube 192 -> 208 (marfil, no blanco)
     luzFundido 0.95 porque sobre papel crema el blanco ES el papel: el destello
     tiene que durar más para leerse como destello y no como un parpadeo.
     --------------------------------------------------------------------- */
  'cantera-video': {
    nombre:     "Cantera · papel tallado con olivo, lacre de terracota (video)",
    video:      "/sobres/sobre-cantera-v2.mp4",
    poster:     "/sobres/sobre-cantera-v2-poster.jpg",
    color:      "#E6E0D3",
    luz:        2.2,
    luzFundido: 0.95
  },

  /* ★ LOS DOS FINALES QUE SE PROBARON EL 22/9/2026 --------------------------
     Maki sobre la v2: «salió medio mal el final». El principio y la apertura
     estaban bien; lo que fallaba era cómo termina. Se hicieron dos finales
     distintos sobre el MISMO cuadro de inicio, los dos de 4 s:
       · cantera-video-b  la TARJETA sale del sobre y llena la pantalla de papel
                          marfil plano. Termina en un cuadro quieto y limpio, que
                          es el mejor empalme para el destello del motor.
                          Medido: quieto hasta 2,00 · salida 2,17 a 2,83 (mov 17,8
                          a 33,6) · brillo 176 -> 222 · último segundo plano en 219.
       · cantera-video-c  la cámara NO se mueve: el sobre queda abierto sobre la
                          piedra y la luz va creciendo. Más tranquilo y más lindo
                          como pieza, pero termina en el sobre abierto, así que el
                          destello tiene que hacer todo el trabajo del corte.
                          Medido: apertura 0,83 a 2,17 · de 2,33 en adelante casi
                          sin movimiento (<3) · brillo 189 -> 204.
     --------------------------------------------------------------------- */
  'cantera-video-b': {
    nombre:     "Cantera · la tarjeta sale del sobre (video)",
    video:      "/sobres/sobre-cantera-v6.mp4",
    poster:     "/sobres/sobre-cantera-v5-poster.jpg",
    color:      "#E6E0D3",
    /* ★ Maki, 22/9/2026: «cuando abre queda en blanco ¿puede salir la portada
       ahí, o qué podemos hacer para que no se vea tan blanco ese papel?»
       Medido: el blanco eran TRES blancos encimados — 1,2 s de papel quieto al
       final del video, más el velo `#col-sobre-velo`, más `#env-bloom`.
       ⚠ `luzColor` ya existía en el motor y Cantera nunca lo llenó: sin ese
         campo `luzColor()` cae a '#ffffff'. Ese blanco no lo eligió nadie, era
         el valor de fábrica.
       → El video se recortó a 3,58 s (v5) y el destello pasa a ser el color
         MEDIDO del último cuadro (#E8E3D7). Como el velo y el papel son el
         mismo color, no hay destello blanco: el papel se convierte en la
         portada. El fundido arranca a 2,95 y dura 0,6 — termina justo con el
         video, así que no queda ni un cuadro de papel muerto. */
    luz:        2.95,
    luzColor:   "#E8E3D7",
    luzFundido: 0.6
  },

  'cantera-video-c': {
    nombre:     "Cantera · la luz entra en el sobre abierto (video)",
    video:      "/sobres/sobre-cantera-v4.mp4",
    poster:     "/sobres/sobre-cantera-v4-poster.jpg",
    color:      "#E6E0D3",
    luz:        2.3,
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


  /* ---- ★ EL SOBRE DE CENICIENTA  (21/9/2026) ----------------------------
     El primero de hielo. Va con la colección `cenicienta`: papel de algodón
     azul hielo con relieve de cristales de escarcha, y lacre de cera plateada
     con una ZAPATILLA DE CRISTAL adentro — la misma pieza que la colección usa
     como marca en el itinerario, la raspadita y la tapa de la playlist.

     Es `apertura: 'solapas'` y NO video, a propósito. Regla de Maki después
     del sobre de anillos: un video generado con IA hace lo que quiere. Acá el
     movimiento lo maneja el motor: mismo tiempo, mismo ángulo, siempre.

     ⚠️ EL PROMPT QUE FUNCIONÓ, para el que tenga que rehacerlo: la trampa es
        pedir "sobre cerrado" y que devuelva la X de cuatro puntas. Hay que
        decirlo en POSITIVO, como en el maestro: «una sola solapa triangular
        doblada desde el borde de arriba, su punta termina en el centro exacto;
        todo lo que está debajo de ese punto es una hoja de papel continua, sin
        ningún doblez y sin costura». Salió a la primera, 4 de 4 usables.

     ⚠️⚠️ LA SOLAPA VA EN EL MISMO LIENZO QUE EL PÓSTER, NO RECORTADA.
        La primera versión se guardó recortada a su caja (660×510) y en pantalla
        la solapa salió corrida: el lacre quedaba colgando DEBAJO del sobre. El
        motor la apoya encima del póster 1:1, así que tiene que medir lo mismo
        y llevar todo lo demás en transparente. El maestro ya era así —768×1376
        con alfa— y se vio recién al comparar los dos archivos.

     ⚠️⚠️⚠️ Y EL SOBRE TIENE QUE LLEGAR AL BORDE DE ARRIBA DE LA FOTO.
        Maki: «el sobre se abre mal porque se ve el fondo y queda un doblez raro
        cuando se abre en las solapas». Era esto, y no el giro.

        `efectos/sobre-catalogo.js` arma cuatro hojas y le recorta a la de abajo
        el triángulo `(0,0) → (100%,0) → (50%, eje.y)`, o sea que da por sentado
        que **la solapa arranca en la fila 0 de la imagen**. Mi foto tenía 18,4 %
        de nieve arriba del sobre: el recorte se comía esa nieve además de la
        solapa y quedaba un agujero con la invitación asomando, justo arriba
        del sobre cerrado.

        La foto se recorta entonces desde el BORDE DE ARRIBA DEL SOBRE
        (y = 244 de 1376 en el original) hasta el pie: 642×1132, o sea 0,567 de
        proporción, que es la del marco — el motor estira la hoja con
        `background-size:100% 100%`, así que una foto de otra proporción sale
        deformada y el lacre redondo se vuelve un óvalo.
        El maestro cumple las dos cosas: su alfa arranca en y = 0 y su foto es
        768×1376 = 0,558.

        ⚠️ Y EL SOBRE TIENE QUE LLEGAR TAMBIÉN AL BORDE DE ABAJO. Recortado al
           sobre nudo quedaba 642×892 = 0,72, y el motor lo estira a 0,567: el
           lacre redondo se volvía un óvalo. Recortando hasta el pie de la foto
           la proporción daba bien pero abajo quedaba una franja de nieve que se
           leía como un hueco. La salida fue estirar SÓLO el papel liso de abajo
           del lacre (de la fila 642 para abajo, ×1,96): el relieve de escarcha
           es parejo, así que no se nota, y el lacre y la solapa quedan sin
           tocar en su escala real.

        ⚠️⚠️ Y EL LACRE SE LE BORRA AL PÓSTER. Maki: «queda un doblez raro
           cuando se abre». Eran DOS LACRES: el póster traía el suyo y la
           solapa el mismo, así que al levantarse la solapa aparecía el de
           abajo, quieto, y se veía como un pliegue doble.
           En el póster el disco del lacre se tapa con un parche de papel de
           más abajo (mismo x, +250 px, máscara circular con 14 px de
           desenfoque). Así el lacre existe UNA sola vez y viaja pegado a la
           solapa, que es lo que hace un lacre de verdad al partirse el sobre.
           ⚠️ El parche se elige midiendo: se toma el brillo del ANILLO que
              rodea al lacre (entre 1,15 y 1,55 radios) y se prueba el papel a
              230, 260, 290 y 320 px más abajo, quedándose con el que menos se
              aparta; después se le iguala el brillo exacto. Con el primer
              parche, elegido a ojo, quedaba un disco fantasma visible al
              abrirse la solapa.

     `solapa` = el triángulo de arriba MÁS EL LACRE, recortado con
     transparencia. Se armó por geometría sobre la propia foto (no a mano):
     triángulo (7,6 % · 18,2 %) → (92,4 % · 18,2 %) → (50 % · 45,2 %), más el
     disco del lacre centrado en (50 % · 49,6 %) con radio 9 % del ancho, y
     1,6 px de desenfoque en el borde para que no quede el filo del recorte.

     `eje` = la punta de la solapa, MEDIDA sobre el recorte NUEVO: 50,0 % ·
     33,4 %. (Sobre la foto entera daba 45,2 %; al recortar la nieve de arriba
     el mismo píxel pasa a estar más arriba en porcentaje. Si alguna vez se
     recorta de nuevo, hay que volver a medirlo: el eje es un porcentaje del
     ARCHIVO, no del sobre.)
     ---------------------------------------------------------------------- */
  cenicienta: {
    nombre:   "Cenicienta · papel de hielo, lacre de zapatilla de cristal (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/v1790021600/invitame/cenicienta/ac56zi1gu4cjuy0jkr8j.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/cenicienta/ovst4cedqvfysmrf3xu1.webp",
    color:    "#EAF2FA",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.0, y: 33.4 }
  },

  /* ---- ★ CENICIENTA · LA PELÍCULA DE LLEGADA  (22/9/2026) ---------------
     Maki: «dame una opción de video con el que tenés armado pero para que sea
     en reemplazo al sobre de la presentación, a ver cómo queda, ponele onda».

     ⚠️ NO REEMPLAZA a `cenicienta`: convive con él. El sobre de papel con las
        solapas queda intacto y se vuelve cambiando `fx.sobre.modelo` de
        `cenicienta-film` a `cenicienta`. Es una palabra desde el panel.

     ⚠️ Y NO CONTRADICE la regla del sobre de anillos («un video generado con
        IA hace lo que quiere»): esta película NO la generó una IA. Está armada
        cuadro por cuadro con ffmpeg sobre el MISMO collage que es el fondo de
        la invitación, así que el tiempo y el encuadre son exactos y repetibles
        — es el motor el que manda, igual que en `solapas`, sólo que el motor
        acá es el script. Si alguna vez se regenera con un modelo de video,
        vuelve a aplicar la regla de Maki y hay que volver a `solapas`.

     ⭐ v2 · 22/9, Maki: «hace un zoom hacia el reloj que llega a las 12 pero
        despues hace un zoom para atras; eso me gustaria cortarlo, y que cuando
        llegue al reloj en el primer zoom in ahi se vaya a blanco y entre en la
        invi». La camara ya NO retrocede: empuja, clava en las 12 y entrega.

        ⚠️ Y la campanada y el lavado pasaron a ser UNA SOLA RAMPA. Estaban
           separados —un halo gaussiano aditivo primero, un fundido a blanco
           despues— y entre que el halo decaia y el fundido arrancaba quedaba un
           POZO DE LUZ: medido cuadro por cuadro, 224 → 191 → 244 de luminancia
           entre 6,3 y 7,3 s. Se ve como un parpadeo justo en el empalme.
           Apagar el halo de golpe en la campanada fue peor: escalon de −52.
           La unica forma de garantizar que la luz no retroceda es que haya UN
           solo brillo, monotono por construccion. Arranca medio segundo antes
           de la campanada —eso ES el destello— y sigue hasta el papel, con el
           color yendo de calido (255,250,236) a papel (247,251,255).
           Comprobado: el peor retroceso de luminancia es de −0,65 puntos, que
           es ruido del codec.

     ⭐ v3 · 22/9, Maki: «el reloj deberia terminar a las 12 DE LA NOCHE, como
        el cuento». Las agujas ya clavaban en las 12 — el problema era que el
        cuadro estaba soleado, o sea DOCE DEL MEDIODIA. Lo que dice medianoche
        no es la aguja: es LA LUZ.
        De 4,3 s a la campanada el cuadro se enfria y se apaga hasta un azul de
        noche (16,26,44), al 26 % del brillo, y la campanada revienta DESDE la
        oscuridad. El arco pasa a ser claro → noche → campanada → papel.
        Y para que el reloj se siga leyendo en lo oscuro, la esfera recibe un
        halo de luna (radial, 86 de amplitud, centrado en el cuadro).
        Medido: el cuadro mas oscuro cae en t=6,17 con luminancia 71, justo
        cuando las agujas se juntan en las XII.
        ⚠️ El apagon va ANTES de la campanada a proposito; la regla de que la
           luz no retroceda vale solo DESPUES (ver la nota de la v2).
           Comprobado: retroceso posterior a la campanada = 0,00.

     ⭐ v4 · 22/9, Maki: «creo que no marca las 12 ese reloj». Y tenia razon,
        aunque los angulos estaban bien (la minutera termina en 1080° ≡ 0 y la
        horaria en 360° ≡ 0, las dos en XII).
        EL PROBLEMA ERA EL DIBUJO. Las dos agujas eran LINEAS del mismo grosor,
        y a las 12 se superponen exactas: se veia UNA sola aguja, corta. Eso no
        dice «las doce», dice «una aguja apuntando para arriba».
        Dos arreglos, los dos necesarios:
          · la minutera llega hasta los numeros (0,84 del radio; estaba en 0,70
            y ni tocaba el XII)
          · la horaria pasa a ser una PALA —ancha en el cuerpo, en punta al
            final— asi que aun superpuestas se leen DOS agujas: una gruesa y
            corta abajo, una fina y larga encima. Es como las dibuja un reloj
            de bolsillo de verdad.
        Y el supersampling del dibujo subio de ×4 a ×6, que a este tamaño se
        nota en el filo de la pala.
        📌 La leccion: cuando el dato esta bien y igual «no se lee», el que
           falla es la FORMA, no el numero. Dos lineas iguales superpuestas son
           una linea.

     ⭐ v5 · 22/9, Maki: «checa el video y fijate si marca las 12».
        Lo MEDI sobre el archivo que sirve Cloudinary, no sobre mi intencion:
        se busca el puntito claro del eje, y desde ahi, para cada angulo, hasta
        donde llega la mancha oscura PEGADA al eje (asi los numeros romanos, que
        tambien son oscuros, no ensucian la cuenta: no tocan el eje).
        Resultado en la v4: 0° en la campanada. O sea que SI marcaba las doce.

        EL PROBLEMA ERA OTRO: llegaba a las doce y enseguida se lo comia el
        blanco. No habia un solo instante en que se VIERA el reloj en las doce.
        Marcar no alcanza — hay que dejarlo ver.

        v5: las agujas llegan en LLEGA = 5,35 s y se quedan quietas hasta la
        campanada (6,20). La noche termina de caer en LLEGA en vez de en la
        campanada, y la camara casi se detiene en ese tramo.
        Medido sobre el render: **26 cuadros seguidos (1,08 s) con la aguja a
        0°±1, largo 0,95 del radio, y el cuadro todavia oscuro** (luminancia
        72-134). Antes ese numero era practicamente cero.

        📌 El criterio que quedo: un gesto no esta hecho cuando el dato es
           correcto, sino cuando hay TIEMPO SUFICIENTE para verlo. Se mide en
           cuadros, no en intencion.

     ⭐ v6 · 22/9, Maki: «la aguja en las 12 QUE TIENE QUE QUEDAR».
        El lavado a blanco se comia el reloj: la invitacion entraba desde un
        blanco vacio y el gesto se perdia justo al final.
        Ahora, mientras todo se disuelve en luz, LAS AGUJAS SE QUEDAN: se
        vuelven a dibujar ENCIMA del lavado, en la posicion y el tamaño que les
        toca en el cuadro (proyectando RCX/RCY/RR con el recorte de ese cuadro),
        junto con el aro de la esfera en tinta tenue para que no floten solas.
        Lo ultimo que ve el invitado antes de la invitacion es el reloj en XII.
        Medido sobre el render, en t = 7,00 · 7,33 · 7,67 y en el ULTIMO cuadro
        (7,96 s): aguja a 0°. Se queda hasta el final.

     Los tramos, medidos sobre el archivo (8,0 s · 720×1280 · 24 fps):
       · 0,0 – 1,9   sale de la oscuridad y del desenfoque (brillo 0,10 → 1,0,
                     blur 15 → 0,4). El mundo del cuento apareciendo.
       · 1,9 – 5,15  la cámara empuja hacia el reloj de bolsillo del collage
                     mientras las agujas dan dos vueltas.
       · 5,15        LA CAMPANADA: las agujas clavan en las 12 y florece la luz
                     cálida (gaussiana σ=0,42).
       · 6,45 – 8,0  se aleja y se lava en papel. El último cuadro mide
                     (244,248,252) — el `colorCarta` de Clara es #F7FBFF, así
                     que el empalme con la invitación no tiene costura.

     `luz` va en 7,1 y no en 5,0 como Bohemia: el destello del motor tiene que
     montarse sobre MI lavado a papel, no sobre la campanada, o se ven dos
     flashes seguidos.                                                       */
  'cenicienta-film': {
    nombre:  "Cenicienta · la película de llegada, el reloj da las 12 (video)",
    video:   "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_auto/invitame/sobres/sobre-cenicienta-v7-22-9.mp4",
    poster:  "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-cenicienta-v7b-poster-22-9.jpg",
    color:   "#EAF2FA",
    luz:     7.1,
    luzFundido: 0.95
  },


  /* ---- ★ EL SOBRE DE ÓLEO ROSÉ  (23/9/2026) -----------------------------
     Colección 'oleo', la primera de la línea ARTE. Sobre cuadrado de algodón
     marfil con la solapa PINTADA al óleo con espátula (flor abstracta en rosa
     empolvado y nude, con hoja de oro) y lacre rosa. Flow, Omni 1.1 Flash,
     9:16, 8 s, cuadro inicial = el poster.
     MEDIDO cuadro por cuadro (hoja de contacto cada 0,5 s):
       · 0 – 1,2   quieto            → se recorta con so_1.2 (Cloudinary)
       · 1,5 – 3,0 se suelta el lacre y se abre la solapa
       · 4,5 – 7,3 la tarjeta sale y la cámara empuja hasta llenar el cuadro
       · 7,3 – 7,9 papel marfil liso  → se corta con eo_7.9
     Recortado dura 6,71 s. El papel llena el cuadro a los 6,0 (esquina de
     211 → 227 de luz): ahí arranca el destello, en el color MEDIDO del
     último cuadro (#E3E2DB), y dura 0,6 → termina con el video. */
  /* ---- ★ ÓLEO ROSÉ · LA LUZ SALE DEL SOBRE  (23/9/2026) ------------------
     Maki sobre el anterior ('oleo-rose'): «salió una carta blanca, hizo
     cualquier cosa el sobre. Le diste mucho tiempo: ya habíamos quedado que en
     Flow va con MENOS segundos, se abre el sobre y listo. Y después que salga
     una LUZ desde adentro del sobre para ir tapando todo con blanco».
     → Flow, 4 s (no 8), el mismo cuadro inicial, y en el prompt «nothing comes
       out of the envelope: no card, no letter».
     MEDIDO cada 0,25 s: 0-0,75 se suelta el lacre · 1,0 solapa abierta ·
       1,5-3,0 la luz crece adentro (brillo 190 → 208) · 3,25-3,75 desborda
       (213 → 232). El video NO llega solo al blanco entero: el destello del
       motor entra en 3,0 —cuando la luz ya se ve— en marfil claro y termina en
       3,9, antes del último cuadro (4,01). */
  /* ⭐ 23/9/2026 · Óleo PIEDRA (mariana-y-joaquin). PRIMER sobre hecho con la API de
     Higgsfield (Kling 3.0 std, image-to-video, 5 s, ~US$0,42), desde una imagen de Flow
     (oleo-mj-sobre-cerrado).
     ⚠️ 23/9, Maki: «el sello se queda abajo y no se va». En la versión -a el lacre quedaba en el
     centro del sobre cuando la solapa subía. La -b se pidió con el lacre PEGADO a la punta de la
     solapa y un negative prompt contra el sello que queda: sube con la solapa y sale por arriba.
     Medido cada 0,25 s. Antes de la -b, medido cuadro por cuadro: la solapa sube entre 1,5 y 2,5 s,
     la luz de adentro crece desde 2,5 y a los 5 s el centro ya es blanco. */
  'oleo-piedra-luz': {
    nombre:     "Óleo Piedra · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/oleo-piedra/oleo-mj-sobre-luz-b.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/oleo-piedra/oleo-mj-sobre-luz-b.jpg",
    color:      "#B1AFAA",
    luz:        4.2,
    luzColor:   "#FAF8F4",
    luzFundido: 0.9
  },

  /* Óleo Nocturno (paulina-y-gerardo), 23/9/2026 · API de Higgsfield, kling v3 PRO.
     El lacre va pegado a la PUNTA de la solapa y se va con ella (1,5 a 2,4 s): la
     versión std lo dejaba abajo, en el centro del sobre, y se descartó (luz-a).
     La luz crece de 2,5 a 5 s. Invitación oscura: fundido corto. */
  'oleo-nocturno-luz': {
    nombre:     "Óleo Nocturno · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/oleo-nocturno/oleo-pg-sobre-luz-b.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/oleo-nocturno/oleo-pg-sobre-luz-b.jpg",
    color:      "#3D3E43",
    luz:        4.4,
    luzColor:   "#F6EEDD",
    luzFundido: 0.5
  },

  /* Óleo Champagne (fernanda-y-alejandro), 23/9/2026 · Higgsfield kling v3 PRO: el lacre
     va pegado a la punta de la solapa y sale con ella por arriba (1,5 a 2,5 s); la luz
     crece de 2,5 a 5 s y termina en blanco. */
  /* ⭐ ÓLEO JARDÍN (daniela-y-rodrigo). Kling v3 pro, 5 s. UN SOLO lacre, que se va
     pegado a la solapa y deja el cuerpo del sobre limpio (la primera toma duplicaba el
     lacre: uno subía con la solapa y otro quedaba abajo). La luz nace a los 3 s. */
  'oleo-jardin-luz': {
    nombre:     "Óleo Jardín · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/oleo-jardin/jd-sobre-luz.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/oleo-jardin/jd-sobre-luz.jpg",
    color:      "#B8C4A6",
    luz:        4.1,
    luzColor:   "#FAF8F0",
    luzFundido: 0.8
  },

  /* Eucalipto (lucia-y-sebastian) · Higgsfield/Kling pro 5 s · UN solo lacre verde pegado a la punta de la solapa. 23/9/2026. */
  'oleo-eucalipto-luz': {
    nombre:     "Botánica Eucalipto · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/eucalipto/eu-sobre-luz.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/eucalipto/eu-sobre-luz.jpg",
    color:      "#A9B8AC",
    luz:        4.1,
    luzColor:   "#FAF9F4",
    luzFundido: 0.8
  },

  /* Acuarela (elena-y-julian) · sobre blanco con UN lacre de oro que se va con la solapa (Flow, toma 2 de 2; la 1 dejaba un lacre fantasma en la punta). 24/9/2026. */
  'oleo-acuarela-luz': {
    nombre:     "Botánica Eucalipto en acuarela · se abre la solapa y sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/acuarela/ac-sobre-v2.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/acuarela/ac-sobre-v2.jpg",
    color:      "#DCE5DA",
    luz:        3.4,
    luzColor:   "#FDFCF8",
    luzFundido: 0.8
  },

  /* Mexicana (sofia-y-emilio) · sobre crema con UN lacre rojo con corazón; el lacre se va con la solapa (Flow, toma 1 de 2: la 2 duplicaba el lacre). 25/9/2026. */
  'oleo-mexicana-luz': {
    nombre:     "Tradición Mexicana · se abre la solapa y sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264/invitame/mexicana/mx-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/mexicana/mx-sobre-v1.jpg",
    color:      "#F5E6DA",
    luz:        3.2,
    luzColor:   "#FCF8F1",
    luzFundido: 0.8
  },

  /* Talavera (mariana-y-rodrigo) · sobre crema sobre cal, UN lacre azul cobalto y ramita de limonero; la solapa se abre y sale luz. Luz medida por brillo de cuadros (sube desde 5,5 s). 25/9/2026. */
  'oleo-talavera-luz': {
    nombre:     "Tradición Talavera · lacre cobalto, se abre y sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto/invitame/mexicana2/m2-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/mexicana2/m2-sobre-v1.jpg",
    color:      "#ECE9E2",
    luz:        5.6,
    luzColor:   "#FCFAF4",
    luzFundido: 0.8
  },

  /* Vaquera XV (ivanna-mis15) · sobre crema sobre madera blanca, UN lacre rosa palo y ramito de pampas con dos botones de rosa atado con hilo; se abre y sale luz. Luz medida por brillo de cuadros (sube desde 6,3 s). 25/9/2026. */
  'oleo-vaquera-luz': {
    nombre:     "XV Vaquera · lacre rosa palo, se abre y sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto/invitame/vaquera/vq-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/vaquera/vq-sobre-v1.jpg",
    color:      "#E4DDD5",
    luz:        6.3,
    luzColor:   "#FCF8F4",
    luzFundido: 0.8
  },

  /* Mariposa monarca XV (daniela-mis15) · sobre crema sobre lino, lacre naranja con mariposa, ramita de oyamel y cempasúchil; la monarca se va volando, se abre y sale luz. Luz medida por brillo de cuadros (sube desde 5,8 s). 25/9/2026. */
  'oleo-monarca-luz': {
    nombre:     "XV Mariposa monarca · lacre naranja, la mariposa se va y sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto/invitame/monarca/mo-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/monarca/mo-sobre-v1.jpg",
    color:      "#E7E1D8",
    luz:        5.8,
    luzColor:   "#FDFAF4",
    luzFundido: 0.8
  },

  /* Mascarada rosé XV (aitana-mis15) · sobre rosa sobre satén champaña, atado con cinta oro rosé que se desata sola, dije de antifaz dorado; se abre y sale luz. Sin lacre (§27). Luz medida por brillo de cuadros (sube desde 4,1 s). Higgsfield kling v3 pro 5 s. 25/9/2026. */
  'oleo-mascarada-luz': {
    nombre:     "XV Mascarada · cinta oro rosé que se desata, sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto/invitame/mascarada/mk-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/mascarada/mk-sobre-v1.jpg",
    color:      "#E3D2BE",
    luz:        4.1,
    luzColor:   "#FDF8F7",
    luzFundido: 0.6
  },

  /* Flor de cerezo XV (emilia-mis15) · sobre rosa sobre lino rosado con una ramita de cerezo bajo la solapa; la ramita se desliza, se abre la solapa y sale luz. Sin lacre ni cinta. El video no llega a blanco solo: lo termina el destello del motor (luz 3,6 + 1,0 < 5,04 s). Higgsfield kling v3 pro 5 s. 25/9/2026. */
  'oleo-cerezo-luz': {
    nombre:     "XV Flor de cerezo · ramita de cerezo, se abre y sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto/invitame/cerezo/cz-sobre-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/cerezo/cz-sobre-v1.jpg",
    color:      "#EDE3E1",
    luz:        3.6,
    luzColor:   "#FDF4F4",
    luzFundido: 1.0
  },

  /* Espatulado (isabel-y-gonzalo) · sin lacre a propósito: con lacre al medio Kling lo duplicaba (2 tomas). Cinta de seda que se desata. 23/9/2026. */
  'oleo-espatulado-luz': {
    nombre:     "Textura Espatulado · se desata la cinta y sale luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/espatulado/es-sobre-luz.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/espatulado/es-sobre-luz.jpg",
    color:      "#ECE7DF",
    luz:        4.2,
    luzColor:   "#FBFAF7",
    luzFundido: 0.8
  },

  /* Mármol (ana-paula-y-marcelo) · UN solo lacre dorado que sube con la solapa. 23/9/2026. */
  'oleo-marmol-luz': {
    nombre:     "Textura Mármol · la cinta con el lacre se desata y sale luz (video, Flow)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/marmol/ma-sobre-luz2.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/marmol/ma-sobre-luz2.jpg",
    color:      "#E8E6E1",
    luz:        3.2,
    luzColor:   "#FCFBF9",
    luzFundido: 0.8
  },

  'oleo-champagne-luz': {
    nombre:     "Óleo Champagne · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/oleo-champagne/ch-sobre-luz-pro.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/oleo-champagne/ch-sobre-luz-pro.jpg",
    color:      "#CFA173",
    luz:        4.2,
    luzColor:   "#FCF6EC",
    luzFundido: 0.8
  },

  /* 9/11/2026 · el mismo sobre de Rosé teñido en azul (las flores y el lacre),
     para «Óleo · Azul» (ximena-y-andres-azul, pedido de Jazmín). */
  'oleo-azul-luz': {
    nombre:     "Óleo Azul · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto:good,vc_h264:main:3.1/invitame/oleo-azul/oleo-azul2-sobre-luz.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto:best,f_jpg/invitame/oleo-azul/oleo-azul2-sobre-luz.jpg",
    color:      "#E6DDD2",
    luz:        3.0,
    luzColor:   "#FBF6EE",
    luzFundido: 0.9
  },

  'oleo-rose-luz': {
    nombre:     "Óleo Rosé · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/oleo/oleo-xa-sobre-luz-a.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/oleo/oleo-xa-sobre-luz-a.jpg",
    color:      "#E6DDD2",
    luz:        3.0,
    luzColor:   "#FBF6EE",
    luzFundido: 0.9
  },

  /* 9/11/2026 · el sobre de Rosé con las flores y el lacre en BORGOÑA claro
     (pedido de la clienta de ivonycarlos, vía Jazmín: «burgundy más claro en vez
     del rosa»). Mismo video, sólo cambia el color.
     ⚠️ Maki (9/11): «está en mala calidad y cuando sale la carta queda sólo
     blanco sin nada». (1) q_auto + baseline 3.1 lo entregaba a 1,35 Mbps: va
     q_auto:best + vc_h264 (High, ~2 Mbps). (2) Desde el segundo 6,0 del original
     la tarjeta lisa llena la pantalla: se corta en 6,2 y la luz entra a los 4,2
     (= 5,4 del original, la tarjeta recién salió del sobre).
     ⚠️ Jazmín (9/11, 2.ª vuelta): «cuando lo abro es como que se tilda» y «el papel
     ocupa demasiado protagonismo» (como valeria-y-emiliano-estandar, que no muestra
     tarjeta). Ahora: corta en 4,9 del original (la tarjeta apenas asoma), la luz
     entra a los 2,9 y tapa en 0,8 s; y main 3.1 a q_auto:good (~0,5 MB, 1,1 Mbps
     en vez de 1,4 MB a 2,2 Mbps: el teléfono lo decodifica sin trabarse).
     ⚠️ Maki (9/11): «¿no está pixelado?». SÍ: el recoloreo saturaba los bloques de
     8×8 del video Rosé comprimido. -2 recolorea con la máscara y el color medidos
     sobre la imagen suavizada (la luz/textura sale nítida del original).
     ⚠️ Jazmín (11/11, ivonycarlos): «el sobre está pixelado». Quedaban manchitas
     rosas en bloques adentro del sobre abierto (el recoloreo agarraba el residuo
     rosado de la compresión). -3: sólo se tiñen manchas grandes (≥900 px, con
     apertura morfológica) y se sirve con q_auto:best. */
  'oleo-borgona': {
    nombre:     "Óleo Borgoña · la solapa pintada en borgoña claro se abre y sale la tarjeta (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_1.2,eo_4.9,q_auto:best,vc_h264:main:3.1/invitame/oleo-borgona/oleo-borgona-sobre-3.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_1.2,q_auto:best,f_jpg/invitame/oleo-borgona/oleo-borgona-sobre-3.jpg",
    color:      "#E6DDD2",
    luz:        2.9,
    luzColor:   "#F4F1EA",
    luzFundido: 0.8
  },

  'oleo-rose': {
    nombre:     "Óleo Rosé · la solapa pintada se abre y sale la tarjeta (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_1.2,eo_7.9,q_auto,vc_h264:baseline:3.1/invitame/oleo/oleo-xa-sobre.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_1.2,q_auto,f_jpg/invitame/oleo/oleo-xa-sobre.jpg",
    color:      "#E6DDD2",
    luz:        6.0,
    luzColor:   "#E3E2DB",
    luzFundido: 0.6
  },

  /* ---- ★ EL SOBRE DE LA BELLA Y LA BESTIA  (23/9/2026) ------------------
     Va con la colección `bella`: papel de algodón OXBLOOD con relieve ciego de
     rosas, y lacre de cera borgoña con UNA ROSA adentro — la misma marca que
     la colección usa en los títulos y en el itinerario.

     Es `apertura: 'solapas'` y NO video, igual que el de Cenicienta: la regla
     de Maki después del sobre de anillos —un video generado con IA hace lo que
     quiere— sigue en pie. Acá el movimiento lo maneja el motor.

     ⚠️⚠️ LA TRAMPA DE SIEMPRE, Y VOLVIÓ A CAER: pedir «sobre cerrado» devuelve
        LA X DE CUATRO PUNTAS. La primera tirada dio 4 de 4 inservibles: dos
        solapas laterales en diagonal y una costura horizontal debajo del lacre.
        Lo que la arregló es EXACTAMENTE lo que ya estaba escrito para
        Cenicienta —decirlo en POSITIVO— pero más largo y cerrando los flancos:
          «UNA sola solapa triangular doblada desde el borde de arriba; sus dos
           lados bajan desde la esquina de arriba a la izquierda y la de arriba
           a la derecha y se juntan en un solo punto en el medio. Debajo de ese
           punto el frente es UNA hoja continua, lisa hasta el borde de abajo,
           sin doblez, sin costura, sin línea horizontal y sin otra solapa. Los
           bordes izquierdo y derecho son bordes rectos lisos.»
        Con eso salieron 4 de 4 usables.

     ⚠️ Y LA OTRA REGLA DE CENICIENTA TAMBIÉN SE COBRÓ: de las cuatro buenas,
        TRES estaban apoyadas sobre una mesa de madera, con aire alrededor. Sólo
        sirve la que llega de borde a borde, arriba y abajo: el motor recorta la
        hoja de abajo con el triángulo (0,0) → (100%,0) → (50%, eje.y) y da por
        sentado que la solapa arranca en la fila 0 del archivo. Con aire arriba,
        ese recorte se come el aire y deja un agujero.

     MEDIDO sobre la foto elegida (768×1376 = 0,558, la proporción del marco):
        · el lacre: centro (375, 518) px = 48,8 % · 37,6 %, radio 76 px = 9,9 %
        · los dos lados de la solapa se juntan en (≈400, 530). La punta se clava
          en x = 50 % porque el motor lo da por sentado; el desvío de 16 px
          queda tapado por el lacre, que mide 152 de ancho.
        → `eje` = 50,0 % · 38,5 %

     ⚠️⚠️ EL LACRE SE LE BORRA AL PÓSTER, o al abrirse aparecen DOS. El primer
        parche —disco duro con desenfoque, el del manual— dejó EL DISCO
        FANTASMA que ya había aparecido en Cenicienta: un aro en relieve
        perfectamente visible. Dos cosas lo arreglaron, y las dos hacían falta:
          · el parche tiene que pasar el ARO DEL RELIEVE y su SOMBRA: opaco
            hasta 1,30 radios y desvaneciéndose hasta 2,0. Con 1,0 el aro
            sobrevive con 0,59 de opacidad y se ve.
          · el origen del parche se elige midiendo BRILLO Y TEXTURA (media y
            desvío del anillo), no sólo brillo: ganó (−190, +120), papel liso a
            la izquierda, contra el (0, +230) que daba el método viejo.
        Medido después: disco 45,2 · aro 45,0 · sombra 44,4 · borde del parche
        44,9, contra papel lejano 45,7. El salto mayor es de 1,3 — ruido.

     ⚠️ El parche borra un pedacito del filete diagonal izquierdo cerca de la
        punta. Queda ADENTRO del triángulo que el motor recorta, así que no se
        ve nunca. Anotado por si alguna vez cambia el recorte.               */
  bella: {
    nombre:   "La Bella y la Bestia · papel oxblood con rosas, lacre de rosa (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/v1790153582/invitame/sobres/sobre-bella-poster-23-9.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/v1790153583/invitame/sobres/sobre-bella-solapa-23-9.webp",
    color:    "#2E1F14",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.0, y: 38.5 }
  },

  /* ---- ★ EL SOBRE DE LA PRINCESA Y EL SAPO  (28/9/2026) ----------------
     Va con la colección `sapo`. Papel de algodón verde bosque; la SOLAPA trae
     la textura del agua del pozo —el arranque del cuento— y el cuerpo es papel
     liso. Lacre de cera en oro viejo con una HOJA DE TILO, que es la misma
     marca que la colección usa en los títulos y en el itinerario.

     `apertura: 'solapas'` y NO video, como Cenicienta y Bella: la regla de Maki
     —un video generado con IA hace lo que quiere— sigue en pie. El movimiento
     lo maneja el motor.

     ⚠️ LA TRAMPA DE LAS CUATRO PUNTAS: se pidió con el texto EN POSITIVO que ya
        estaba escrito para Bella («UNA sola solapa triangular… debajo de ese
        punto el frente es UNA hoja continua…»). De 4 tiradas, 1 sirvió entera:
        de las otras tres, una puso el lacre arriba a la izquierda, otra dejó
        margen blanco a los costados y la cuarta trajo costuras laterales.

     ⚠️ Y LA REGLA DEL BORDE A BORDE SE COBRÓ DE NUEVO: la foto elegida traía
        8 px de blanco arriba y 9 a la derecha y abajo. Se recortó a la caja
        real del sobre (0,8)-(950,1687) y ADEMÁS 35 px más de arriba, para que
        el pliegue izquierdo arranque exactamente en la fila 0 — que es lo que
        el motor da por sentado al recortar con el triángulo
        (0,0) → (100%,0) → (50%, eje.y). Recién después se llevó a 768×1376.

     MEDIDO sobre la foto final (768×1376):
        · el pliegue izquierdo, ajustado por mínimos cuadrados con 56 puntos:
          y = 0,18 % en x = 0  y  y = 38,42 % en x = 50 %  → `eje` 50,0 · 38,4
        · el lacre: centro (386, 490) px = 50,26 % · 35,65 %, radio 67 px
        · la solapa se recorta con el triángulo + un disco de 78 px en el lacre,
          para que entre también su sombra

     ⚠️ EL LACRE BORRADO DEL PÓSTER: el primer parche salió de arriba a la
        izquierda (−230, −160) y quedó bien de brillo pero DUPLICÓ EL PLIEGUE
        —traía un pedazo de la diagonal izquierda y se veía una V partida—.
        El bueno se eligió pidiendo además que el origen no tenga NINGUNA línea
        (gradiente máximo sobre la imagen desenfocada), y ganó (618, 644), papel
        liso del cuerpo. Medido después: disco 85,5 · aro 85,0 · sombra 84,9 ·
        borde del parche 85,9, contra papel lejano 86,5. El salto mayor es de
        1,6 — ruido. Sin disco fantasma y sin aro.                          */
  /* 28/9/2026 · La princesa y el sapo EN VIDEO (Maki: «el sobre hacelo con video»). Flow (sobre verde, lacre de oro con nenúfar) + kling v3 std 5 s: la solapa sube con el lacre, sale luz dorada. */
  /* SOBRES «SALE ALGO Y SE HACE LUZ» (Maki, 28/9/2026): se abre la solapa con el sello, sale LUZ de adentro y va a blanco en toda la pantalla (sin tarjeta vacía). */
  'disco-sale': { nombre: "Disco · se abre y sale luz hasta blanco (video)", video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264:baseline:3.1,ac_none/invitame/disco/lupita-sobre-luz-std09.mp4", poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/disco/lupita-sobre-luz-std09.jpg", color: "#1A2035", luz: 4.5, luzColor: "#EEF1F8", luzFundido: 0.5 },
  'rosa-disco-sale': { nombre: "Rosa disco · se abre y sale luz rosada hasta blanco (video)", video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264:baseline:3.1,ac_none/invitame/rosadisco/montserrat-sobre-luz-pro09.mp4", poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/rosadisco/montserrat-sobre-luz-pro09.jpg", color: "#F2DCE1", luz: 4.3, luzColor: "#FFF4F6", luzFundido: 0.7 },
  'sapo-sale': { nombre: "La princesa y el sapo · se abre y sale luz dorada con luciérnagas hasta blanco (video)", video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264:baseline:3.1,ac_none/invitame/sapo/isabella-sobre-luz-std1.mp4", poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sapo/isabella-sobre-luz-std1.jpg", color: "#10201A", luz: 4.5, luzColor: "#FFF1D6", luzFundido: 0.5 },
  'degrade-esmeralda-sale': { nombre: "Degradé Esmeralda · sobre verde con lacre dorado: se abre y sale luz dorada (video)", video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264:baseline:3.1,ac_none/invitame/natalia/nt-sobre-pro09.mp4", poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/natalia/nt-sobre-pro09.jpg", color: "#0F2E24", luz: 4.3, luzColor: "#FFF6E4", luzFundido: 0.5 },
  'colorama-sale': { nombre: "Colorama · sobre rosa con lacre dorado: se abre y salen humos de colores hasta blanco (video)", video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264:baseline:3.1,ac_none/invitame/colorama/cr3-sobre-a.mp4", poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/colorama/cr3-sobre-a.jpg", color: "#F3DAD1", luz: 4.2, luzColor: "#FFFFFF", luzFundido: 0.7 },
  'sapo-video': { nombre:"La princesa y el sapo · sobre verde con lacre de nenúfar (video)", video:"https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto/invitame/sapo/sp-sobre-std.mp4", poster:"https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sapo/sp-sobre-std.jpg", color:"#10201A", luz:3.6, luzColor:"#FFF1D6", luzFundido:0.5 },
  sapo: {
    nombre:   "La princesa y el sapo · papel verde bosque, el agua del pozo en la solapa, lacre de oro con hoja de tilo (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-sapo-poster-28-9.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-sapo-solapa-28-9.webp",
    color:    "#3B5540",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.0, y: 38.4 }
  },


  /* ---- ALICIA · 28/9/2026 ------------------------------------------------
     Va con la colección `alicia` (el libro de Carroll, no la película).
     Papel porcelana con rositas rojas y corazones de naipe en oro, cuatro
     solapas que se cruzan en X y un lacre ROJO con un corazón en relieve.
     Lo hizo Higgsfield Soul (Flow tenía la sesión vencida).

     ⚠️ Va por `solapas` con SÓLO póster, igual que `sirena`: las cuatro
        solapas confluyen en el lacre y el lacre se parte al medio, así que no
        hace falta `solapa` aparte ni `eje`.
        Medido el lacre: centro 50,0 % · 50,4 % de la foto, redondo.
     ⚠️ `color` MEDIDO: promedio del papel en la franja central salteando el
        lacre → #CAC29D.
     ---------------------------------------------------------------------- */
  alicia: {
    nombre:   "Alicia · papel porcelana con rositas y corazones de naipe, lacre rojo con corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-alicia-28-9.jpg",
    color:    "#CAC29D",
    apertura: "solapas",
    empalme:  "foto"
  },

  /* ---- RAPUNZEL · 28/9/2026 ----------------------------------------------
     Va con la colección `rapunzel` (el cuento de los Grimm, no la película).
     Papel de algodón con campanitas azules (rapónchigos) y ramitas de oro,
     cuatro solapas que se cruzan en X y un lacre AZUL con una campanilla en
     relieve. Lo hizo Flow (Nano Banana 2, 0 créditos), de borde a borde.

     ⚠️ Va por `solapas` con SÓLO póster, igual que `alicia` y `sirena`: las
        cuatro solapas confluyen en el lacre, así que no hace falta `solapa`
        aparte ni `eje`. Medido el lacre: centro 50,6 % · 50,1 % de la foto.
     ⚠️ `color` MEDIDO: promedio del papel en la franja central (40–60 %)
        salteando el lacre → #DAD5C9.
     ---------------------------------------------------------------------- */
  rapunzel: {
    nombre:   "Rapunzel · papel de algodón con campanitas azules y ramitas de oro, lacre azul con campanilla (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-rapunzel-28-9.jpg",
    color:    "#DAD5C9",
    apertura: "solapas",
    empalme:  "foto"
  },

  /* ---- RAPUNZEL EN VIDEO · 29/9/2026 (v3) ---------------------------------
     La regla del sobre que manda (armado-2 §58, Maki 29/9): se abre y de adentro
     SALE LUZ que va a blanco en toda la pantalla; NADA de tarjeta vacía saliendo
     («hay una capa que está vacía, no tiene sentido»). La v2 de esta misma mañana
     sacaba una tarjeta en blanco: se reemplazó.
     Sobre de algodón con cinta celeste (sin lacre: con el lacre al medio Kling lo
     duplica o lo deja, armado §27), alféizar de piedra, campanillas y la trenza.
     La cinta se desata, se abren las solapas, salen rayos de luz con pétalos de
     campanilla y la luz tapa todo. Higgsfield Soul 9:16 + Kling 3.0 std, cfg 1.
     MEDIDO (brillo medio cada 0,25 s): 143 hasta 3,25 s → 169 (3,75) · 182 (4,0)
     · 201 · 224 · 240 (4,75). Llega a blanco solo. `color` = esquina del cuadro 0.
     ---------------------------------------------------------------------- */
  'rapunzel-video': {
    nombre:     "Rapunzel · sobre de algodón con cinta celeste; se abre y sale luz con pétalos de campanilla (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/rapunzel/rap-sobre-v3-29-9.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/rapunzel/rap-sobre-v3-29-9.jpg",
    color:      "#CCBC99",
    luz:        4.0,
    luzColor:   "#FFF6E6",
    luzFundido: 0.7
  },

  /* ---- ALICIA EN VIDEO · 29/9/2026 -------------------------------------------
     Para `paloma-mis15` (repaso §49). Sobre de porcelana con rositas en relieve y
     una cinta de raso roja en moño, sobre mantel de encaje, con la taza de rosas,
     el reloj de bolsillo, naipes de corazones y pétalos. Se abre la solapa, salen
     rayos de luz con pétalos rojos y todo va a blanco. Nada sólido sale del sobre.
     Higgsfield Soul 9:16 + Kling 3.0 pro, cfg 0,9 (de tres tomas: std 0,9 sacó una
     especie de naipe, std 1 no llegó a blanco).
     MEDIDO: 125 quieto → 150 (3,75) · 161 (4,0) · 182 (4,25) · 211 · 235 (4,75).
     ---------------------------------------------------------------------- */
  'alicia-luz': {
    nombre:     "Alicia · sobre de porcelana con cinta roja; se abre y sale luz con pétalos de rosa (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/alicia/pal-sobre-luz-29-9.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/alicia/pal-sobre-luz-29-9.jpg",
    color:      "#D3B58C",
    luz:        4.2,
    luzColor:   "#FFF6EE",
    luzFundido: 0.7
  },

  /* ---- BELLA EN VIDEO · 29/9/2026 --------------------------------------------
     Para `victoria-mis15` (repaso §49). Parte del póster del sobre `bella` (papel
     oxblood con rosas en relieve, lacre de rosa en la punta de la solapa). La
     solapa sube con el lacre, de adentro salen rayos de luz dorada con pétalos
     rojos y todo va a blanco. Nada sólido sale del sobre (armado-2 §58).
     Kling 3.0 pro, cfg 0,9 (de tres tomas: std 1 dejó el hueco del lacre en el
     cuerpo, std 0,9 torció la luz) + fundido a la luz con ffmpeg en el último
     0,8 s porque sobre papel oscuro Kling no llega a blanco.
     MEDIDO: 41 quieto → 56 (4,0) · 95 (4,25) · 170 (4,5) · 225 (4,75).
     ---------------------------------------------------------------------- */
  'bella-luz': {
    nombre:     "La Bella y la Bestia · sobre oxblood con lacre de rosa; se abre y sale luz dorada con pétalos (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/bella/vic-sobre-luz-29-9.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/bella/vic-sobre-luz-29-9.jpg",
    color:      "#2E1F14",
    luz:        4.35,
    luzColor:   "#FFF1D6",
    luzFundido: 0.5
  },
  'sirena-luz': { nombre: "Sirena · sobre nácar sobre arena con lacre coral de vieira; el lacre se parte, se abre y sale luz perlada con burbujas (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sirena/mar-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sirena/mar-sobre-luz-29-9.jpg",
    color: "#BCB4A6", luz: 4.3, luzColor: "#FFF6EC", luzFundido: 0.7 },
  'cenicienta-luz': { nombre: "Cenicienta · sobre celeste con zapatilla de cristal dibujada y lacre de plata; se abre y sale luz helada con mariposas (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/cenicienta/cla-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/cenicienta/cla-sobre-luz-29-9.jpg",
    color: "#607277", luz: 4.35, luzColor: "#F6F9FD", luzFundido: 0.6 },
  'mia-luz': { nombre: "Disco (Mía) · sobre negro mate con lacre de plata de bola de espejos; la solapa se lleva el lacre y sale luz plateada con destellos (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/mia/mia-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/mia/mia-sobre-luz-29-9.jpg",
    color: "#0B0B0B", luz: 4.4, luzColor: "#F7F6FA", luzFundido: 0.5 },
  'martina-luz': { nombre: "Martina · sobre rosa empolvado CERRADO con lacre de cerezas; se abre la solapa y sale luz dorada con pétalos (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/martina/mt-sobre-luz-v2-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/martina/mt-sobre-luz-v2-29-9.jpg",
    color: "#B3937C", luz: 4.4, luzColor: "#FFF4EE", luzFundido: 0.6 },
  'aitana-luz': { nombre: "Aitana (Mascarada) · sobre rosa CERRADO con lacre de oro con antifaz; se abre y sale luz dorada con destellos (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/mascarada/mk-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/mascarada/mk-sobre-luz-29-9.jpg",
    color: "#B19B73", luz: 4.4, luzColor: "#FFF6E8", luzFundido: 0.6 },
  'daniela-luz': { nombre: "Daniela (Monarca) · sobre crema CERRADO con lacre naranja de monarca; se abre y sale luz ámbar con mariposas (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/monarca/mo-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/monarca/mo-sobre-luz-29-9.jpg",
    color: "#A7997E", luz: 4.4, luzColor: "#FFF6E6", luzFundido: 0.6 },
  'emilia-luz': { nombre: "Emilia (Cerezo) · sobre rosa CERRADO con lacre de cerezo; se abre y sale luz rosada con pétalos (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/cerezo/cz-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/cerezo/cz-sobre-luz-29-9.jpg",
    color: "#AC9696", luz: 4.4, luzColor: "#FFF4F4", luzFundido: 0.6 },
  'ivanna-luz': { nombre: "Ivanna (Vaquera) · sobre blanco CERRADO con lacre de herradura; se abre y sale luz de atardecer con pétalos (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/vaquera/vq-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/vaquera/vq-sobre-luz-29-9.jpg",
    color: "#ABABA4", luz: 4.4, luzColor: "#FFF6EC", luzFundido: 0.6 },
  'camila-luz': { nombre: "Camila y Tomás (Perlas) · sobre marfil CERRADO con lacre ciruela y perla; se abre y sale luz perlada con perlas (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/perlas/ct-sobre-luz-29-9.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/perlas/ct-sobre-luz-29-9.jpg",
    color: "#A09884", luz: 4.35, luzColor: "#FBF8F1", luzFundido: 0.7 },
  'danna-luz': { nombre: "Danna (Glow party) · sobre violeta CERRADO con lacre rosa neón; se abre y sale luz de neón rosa y verde (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/xv29/xi/xi-sobre-luz3.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/xv29/xi/xi-sobre-luz3.jpg",
    color: "#212623", luz: 4.0, luzColor: "#FFF4FB", luzFundido: 0.5 },
  'luciana-luz': { nombre: "Luciana (Noche de estrellas) · sobre gris grafito CERRADO con lacre rosa; se abre y salen rayos rosa y turquesa (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/xv29/lu/lu-sobre-luz.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/xv29/lu/lu-sobre-luz.jpg",
    color: "#070707", luz: 4.0, luzColor: "#FFF4FB", luzFundido: 0.5 },
  'barbara-luz': { nombre: "Bárbara (Glam chic) · sobre negro CERRADO con UN solo lacre magenta; la solapa se abre llevándose el lacre y sale luz magenta (video, 30/9) (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/xv29/ba/ba-sobre-luz2.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/xv29/ba/ba-sobre-luz2.jpg",
    color: "#121114", luz: 3.3, luzColor: "#FFF0FA", luzFundido: 0.5 },
  'julieta-luz': { nombre: "Julieta (Boho) · sobre kraft CERRADO con lacre terracota e hilo; se abre y sale luz dorada con flores secas (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/xv29/ju/ju-sobre-luz.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/xv29/ju/ju-sobre-luz.jpg",
    color: "#DACCB9", luz: 4.0, luzColor: "#FFF6E6", luzFundido: 0.65 },
  'alexa-luz': { nombre: "Alexa (Globos rosa) · sobre rosa chicle CERRADO con lacre rosa; se abre y salen corazones y luz (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/xv29/fe/fe-sobre-luz.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/xv29/fe/fe-sobre-luz.jpg",
    color: "#CAA5AB", luz: 4.0, luzColor: "#FFF2F7", luzFundido: 0.65 },
  'bianca-luz': { nombre: "Bianca (Brillos) · sobre rosa palo CERRADO con lacre champán; se abre y sale luz con brillo rosa (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/xv29/bi/bi-sobre-luz.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/xv29/bi/bi-sobre-luz.jpg",
    color: "#D8B7B1", luz: 4.0, luzColor: "#FFF6F2", luzFundido: 0.65 },

  'encaje-boda-salvia-prueba': { nombre: "Prueba · Encaje boda salvia: sobre de encaje en X con dos solapas que se abren y muestran la tarjeta con corona de laurel y anillos, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-boda-salvia-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-boda-salvia-19-10.jpg",
    color: "#899981", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'encaje-boda-rosa-prueba': { nombre: "Prueba · Encaje boda rosa empolvado: sobre de encaje en X con dos solapas que se abren y muestran la tarjeta con corona de laurel y anillos, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-boda-rosa-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-boda-rosa-19-10.jpg",
    color: "#BE9A95", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'encaje-boda-negro-prueba': { nombre: "Prueba · Encaje boda negro: sobre de encaje en X con dos solapas que se abren y muestran la tarjeta con corona de laurel y anillos, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-boda-negro-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-boda-negro-19-10.jpg",
    color: "#3F3F3E", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'encaje-xv-salvia-prueba': { nombre: "Prueba · Encaje XV salvia: sobre de encaje en X con dos solapas que se abren y muestran la tarjeta con tiara y flores, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-xv-salvia-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-xv-salvia-19-10.jpg",
    color: "#899981", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'encaje-xv-rosa-prueba': { nombre: "Prueba · Encaje XV rosa empolvado: sobre de encaje en X con dos solapas que se abren y muestran la tarjeta con tiara y flores, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-xv-rosa-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-xv-rosa-19-10.jpg",
    color: "#BE9A95", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'encaje-xv-negro-prueba': { nombre: "Prueba · Encaje XV negro: sobre de encaje en X con dos solapas que se abren y muestran la tarjeta con tiara y flores, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-xv-negro-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-xv-negro-19-10.jpg",
    color: "#3F3F3E", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'encaje-boda': { nombre: "Encaje boda · sobre de encaje marfil en X con dos solapas de encaje; se abren y muestran la tarjeta con corona de laurel y anillos, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-boda-16-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-boda-16-10.jpg",
    color: "#BCAFA5", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'encaje-xv': { nombre: "Encaje XV · sobre de encaje marfil en X con dos solapas de encaje; se abren y muestran la tarjeta con tiara y flores, y se lava en luz blanca (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/encaje-xv-16-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/encaje-xv-16-10.jpg",
    color: "#BCAFA5", luz: 4.0, luzColor: "#FFFFFF", luzFundido: 0.8 },
  'xfold-rosa-prueba': { nombre: "Prueba · xfold rosa con lacre de cisnes, solapas en X que se abren y dejan la tarjeta con el escudo de cisnes en relieve (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/xfold-rosa-escudo-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/xfold-rosa-escudo-19-10.jpg",
    color: "#FCEAE0", luz: 5.9, luzColor: "#FFFFFF", luzFundido: 0.8, empalme: "blanco" },
  'puertas-cinta-marfil-prueba': { nombre: "Prueba · puertas festoneadas marfil con flores sepia, cinta de seda y lacre oval rosa; las puertas se abren y se descubre la invitación (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/puertas-cinta-marfil-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/puertas-cinta-marfil-19-10.jpg",
    color: "#EBE1D7", luz: 2.1, luzColor: "#FFFFFF", luzFundido: 0.9, empalme: "foto" },
  'cuatro-solapas-perlas-prueba': { nombre: "Prueba · sobre crema con perlas y bordado, cuatro solapas que se abren una tras otra y descubren la invitación (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/cuatro-solapas-perlas-19-10b.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/cuatro-solapas-perlas-19-10b.jpg",
    color: "#FCE6D9", luz: 1.8, luzColor: "#FFFFFF", luzFundido: 1.0, empalme: "foto" },
  'abanico-rosa-prueba': { nombre: "Prueba · abanico rosa festoneado con lacre dorado de cisnes; la solapa sube, el lacre baja y se descubre la foto de la invitación (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/abanico-rosa-19-10.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/abanico-rosa-19-10.jpg",
    color: "#E6C8BF", luz: 2.7, luzColor: "#FFFFFF", luzFundido: 0.8, empalme: "foto" },
  'puertas-rosas-prueba': { nombre: "Prueba · puertas de rosas en relieve con lacre de cisnes; se abren a los lados y la carta rosa baja despacio y sale de la pantalla, y debajo aparece la foto de la invitación (video)",
    video: "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,q_auto,vc_h264,ac_none/invitame/sobres-nuevos/puertas-rosas-19-10f.mp4",
    poster: "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,w_720,q_auto,f_jpg/invitame/sobres-nuevos/puertas-rosas-19-10f.jpg",
    color: "#FBF4EE", luz: 3.0, luzColor: "#FFFFFF", luzFundido: 2.4, empalme: "foto" },
  /* ---- 19/10/2026 · SOBRES DE LOS EVENTOS NUEVOS (21, uno por muestra) -------------
     Pantalla completa, apertura 'solapas' (foto del sobre + la solapa la abre el motor).
     Fotos: Google Flow (Nano Banana 2.1, 768x1376), una solapa sola desde el borde de arriba.
     MEDIDO sobre cada foto, no estimado: el lacre por Hough + borde real por perfil radial
     contra el color del papel; `eje` = centro del lacre (la punta de la solapa).
     El lacre se le BORRA al póster (parche de papel del mismo sobre, 4,5 % más oscuro y
     sombra suave): queda la huella, no un lacre doble. La solapa = triángulo
     (-6 %,0)→(106 %,0)→eje + disco del lacre, mismo lienzo, 1,6 px de desenfoque.
     Cuando haya saldo en Higgsfield, esta misma foto es el primer cuadro del video. */
  'ev-noche': { nombre: "Noche de oro · negro con estrellas y lacre dorado (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-noche-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-noche-solapa-b.webp",
    color: "#302E2D", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 33.2 } },
  'ev-unicornio': { nombre: "Cielo mágico · lila de nubes y lacre rosa de unicornio (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-unicornio-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-unicornio-solapa-b.webp",
    color: "#DCCFDF", apertura: "solapas", empalme: "foto", eje: { x: 50.2, y: 49.4 } },
  'ev-pixel': { nombre: "Pixel · pastel con nubes pixel y lacre lila (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-pixel-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-pixel-solapa-b.webp",
    color: "#E3CCD8", apertura: "solapas", empalme: "foto", eje: { x: 49.7, y: 28.6 } },
  'ev-osita': { nombre: "Osita coronada · crema con coronitas y lacre de osita (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-osita-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-osita-solapa-b.webp",
    color: "#ECE2D1", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 28.8 } },
  'ev-mono': { nombre: "Moño de raso · lino blanco y lacre rosa de moño (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-mono-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-mono-solapa-b.webp",
    color: "#F2F1F2", apertura: "solapas", empalme: "foto", eje: { x: 49.7, y: 32.3 } },
  'ev-olivo': { nombre: "Olivo · algodón con ramas de olivo y lacre bronce con cruz (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-olivo-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-olivo-solapa-b.webp",
    color: "#E7E4DF", apertura: "solapas", empalme: "foto", eje: { x: 50.5, y: 35.1 } },
  'ev-estrellas': { nombre: "Estrellas de algodón · marfil y lacre dorado de luna (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-estrellas-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-estrellas-solapa-b.webp",
    color: "#ECE6DB", apertura: "solapas", empalme: "foto", eje: { x: 50.2, y: 49.5 } },
  'ev-marmol': { nombre: "Mármol rosa · vetas doradas y lacre rose gold (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-marmol-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-marmol-solapa-b.webp",
    color: "#F8E6E3", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 50.1 } },
  'ev-editorial': { nombre: "Editorial · mostaza con marco negro y lacre negro (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-editorial-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-editorial-solapa-b.webp",
    color: "#CF9D3E", apertura: "solapas", empalme: "foto", eje: { x: 50.2, y: 49.5 } },
  'ev-plata': { nombre: "Plata · grafito cepillado y lacre plateado (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-plata-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-plata-solapa-b.webp",
    color: "#565A60", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 33.0 } },
  'ev-rosegold': { nombre: "Rose gold · glitter y lacre rose gold (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-rosegold-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-rosegold-solapa-b.webp",
    color: "#EAC8BE", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 30.3 } },
  'ev-ejecutivo': { nombre: "Ejecutivo · azul marino con líneas de luz y lacre plata (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-ejecutivo-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-ejecutivo-solapa-b.webp",
    color: "#2C394E", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 33.7 } },
  'ev-gala': { nombre: "Gala déco · negro con abanicos dorados y lacre de sol (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-gala-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-gala-solapa-b.webp",
    color: "#3A3838", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 50.0 } },
  'ev-brindis': { nombre: "Brindis · champán perlado y lacre de copas (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-brindis-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-brindis-solapa-b.webp",
    color: "#DBCDBB", apertura: "solapas", empalme: "foto", eje: { x: 50.3, y: 35.8 } },
  'ev-toga': { nombre: "Toga · pergamino con línea roja y lacre de balanza (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-toga-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-toga-solapa-b.webp",
    color: "#F0E5DA", apertura: "solapas", empalme: "foto", eje: { x: 50.0, y: 35.5 } },
  'ev-birrete': { nombre: "Birrete · negro con filete dorado y lacre de birrete (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-birrete-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-birrete-solapa-b.webp",
    color: "#31302D", apertura: "solapas", empalme: "foto", eje: { x: 50.0, y: 37.3 } },
  'ev-kinder': { nombre: "Kínder · celeste con dibujos de crayón y lacre amarillo (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-kinder-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-kinder-solapa-b.webp",
    color: "#79C1E1", apertura: "solapas", empalme: "foto", eje: { x: 50.0, y: 34.6 } },
  'ev-generacion': { nombre: "Generación · azul lino con borde dorado y lacre de birretes (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-generacion-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-generacion-solapa-b.webp",
    color: "#24354E", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 42.8 } },
  'ev-bokeh': { nombre: "Bokeh dorado · negro con luces y lacre de corona (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-bokeh-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-bokeh-solapa-b.webp",
    color: "#121214", apertura: "solapas", empalme: "foto", eje: { x: 49.9, y: 49.3 } },
  'ev-urbano': { nombre: "Urbano · grafito con salpicaduras y lacre mostaza (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-urbano-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-urbano-solapa-b.webp",
    color: "#3A3A39", apertura: "solapas", empalme: "foto", eje: { x: 49.7, y: 49.6 } },
  'ev-grises': { nombre: "Treinta en grises · gris piedra y lacre plata (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-grises-poster-b.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres-eventos/sobre-grises-solapa-b.webp",
    color: "#8F8B82", apertura: "solapas", empalme: "foto", eje: { x: 49.2, y: 50.0 } },
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

  /* ---- ★ LOS CINCO SOBRES DE LA FICHA DE TIEMPOS  (29/9/2026) --------------
     Maki mandó como referencia 9 aperturas de sobre de otra cuenta y pidió
     «diseños similares y aperturas similares: ocupan toda la pantalla, se abren
     bien, tienen elegancia y estilo… acordate los segundos, es clave». Se
     miraron cuadro por cuadro (nota `INVITEATELIER-ficha-de-tiempos-29-9`) y se
     eligieron cinco DISEÑOS PROPIOS, uno por tipo de apertura:

       ramitas-lila     · papel perlado lila, dos ramas grabadas en X, lacre corazón
       damasco-salvia   · marfil con damasco en relieve, lacre salvia con corazón
       perla-salvia     · verde salvia, solapa REDONDA con una perla
       encaje-celeste   · celeste, borde de encaje en la solapa y perla
       rosado-flor-seca · algodón rosa de borde rústico, lacre con flor seca

     Todos salieron de Flow (Nano Banana 2, 0 créditos) y NO tienen video: van por
     `solapas`, con tres archivos de 768×1376 armados de LA MISMA FOTO:
       poster = la foto del sobre cerrado (opaca)
       solapa = la solapa (más lacre / perla / encaje) con transparencia
       cuerpo = el resto del sobre, con el hueco de la solapa ya adentro
                (borde blando de ~22 px) y el lacre BORRADO del papel
     O sea que el relieve de la solapa es el de la foto, no una capa pegada.
     La línea del doblez se MIDIÓ sobre la foto (gradiente máximo columna por
     columna + ajuste robusto; error < 1 px) y el círculo de la perla, con un
     ajuste de círculo sobre 57 puntos.

     ⭐ LA FICHA (medida en los reels, contada desde el toque):
          0,0 – 2,6 s   la solapa se abre lenta, arranque suave
          2,7 s         arranca el destello (rampa de 0,45 s)
          3,7 s         se corta al blanco (`luzFundido` 1,0) y nace la invitación
          ≈ 4,8 s       el blanco terminó de irse
        `ficha.destello` = 2,7 · `ficha.solapa` = 2,6 · `luzFundido` = 1,0.
        ⚠️ La CURVA de la solapa no se pudo medir (celular en la mano): es
           `cubic-bezier(.5,0,.75,.5)`, decisión propia, no dato.
     ⚠️ `empalme:'blanco'` A PROPÓSITO: la referencia termina en luz. Es la regla
        de Maki del 28/9 (algo sale del sobre y se vuelve la luz que tapa todo).
     ---------------------------------------------------------------------- */
  "ramitas-lila": {
    nombre:   "Ramitas · papel perlado lila, ramas grabadas en X, lacre de corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/ramitas-lila-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/ramitas-lila-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/ramitas-lila-cuerpo.webp",
    color:    "#c9c0c5",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.4, y: 56.5 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  /* ★ 29/9/2026 · Maki: «que la mitad del sobre de abajo, cuando se está separando
     de la solapa de arriba, baje así desaparece y aparece la portada».
     Mismo sobre que ramitas-lila, SIN ficha (sin ficha el cuerpo CAE) y con
     empalme "foto": nada de fundido a blanco, abajo ya está la portada. */
  "ramitas-lila-cae": {
    nombre:   "Ramitas · lila, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/ramitas-lila-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/ramitas-lila-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/ramitas-lila-cuerpo.webp",
    color:    "#c9c0c5",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.4, y: 56.5 }
  },

  /* Tanda Degradé (30/9): cinco sobres grandes -cae. */
  "onix-cae": {
    nombre:   "Ónix · negro con filetes de oro y lacre dorado, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-onix-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-onix-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-onix-cuerpo.webp",
    color:    "#232224",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.5, y: 40.8 }
  },

  "terracota-cae": {
    nombre:   "Terracota · papel terracota con hilo de yute y lacre, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-terracota-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-terracota-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-terracota-cuerpo.webp",
    color:    "#be5e42",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.8, y: 34.8 }
  },

  "oliva-cae": {
    nombre:   "Oliva · lino oliva con rama dorada y lacre, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-oliva-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-oliva-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-oliva-cuerpo.webp",
    color:    "#5c5928",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 56.9, y: 50.6 }
  },

  "lavanda-cae": {
    nombre:   "Lavanda · encaje plata y lacre con corona, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-lavanda-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-lavanda-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-lavanda-cuerpo.webp",
    color:    "#8e8294",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 51.6, y: 56.1 }
  },

  "rosa-cae": {
    nombre:   "Rosa · moño de satén y lacre dorado, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-rosa-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-rosa-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-rosa-cuerpo.webp",
    color:    "#c47470",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.8, y: 48.9 }
  },

  "damasco-salvia": {
    nombre:   "Damasco · marfil con damasco en relieve, lacre salvia con corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/damasco-salvia-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/damasco-salvia-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/damasco-salvia-cuerpo.webp",
    color:    "#e5e1da",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.1, y: 56.2 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  /* ★ 29/9/2026 · mismo sobre que damasco-salvia, SIN ficha y con empalme "foto":
     la solapa sube, la mitad de abajo CAE y aparece la portada (pedido de Maki). */
  "damasco-salvia-cae": {
    nombre:   "Damasco · marfil con lacre salvia, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/damasco-salvia-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/damasco-salvia-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/damasco-salvia-cuerpo.webp",
    color:    "#e5e1da",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.1, y: 56.2 }
  },

  "perla-salvia": {
    nombre:   "Perla · verde salvia, solapa redonda con una perla (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/perla-salvia-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/perla-salvia-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/perla-salvia-cuerpo.webp",
    color:    "#909d86",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.0, y: 60.2 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  /* ★ 29/9/2026 · mismo sobre que perla-salvia, SIN ficha y con empalme "foto":
     la solapa sube, la mitad de abajo CAE y aparece la portada (pedido de Maki). */
  "perla-salvia-cae": {
    nombre:   "Perla · verde salvia, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/perla-salvia-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/perla-salvia-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/perla-salvia-cuerpo.webp",
    color:    "#909d86",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.0, y: 60.2 }
  },

  "encaje-celeste": {
    nombre:   "Encaje · celeste con borde de encaje en la solapa y perla (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-celeste-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-celeste-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-celeste-cuerpo.webp",
    color:    "#90a6b3",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 51.8, y: 54.3 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  /* ★ 29/9/2026 · mismo sobre que encaje-celeste, SIN ficha y con empalme "foto":
     la solapa sube, la mitad de abajo CAE y aparece la portada (pedido de Maki). */
  "encaje-celeste-cae": {
    nombre:   "Encaje · celeste, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-celeste-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-celeste-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-celeste-cuerpo.webp",
    color:    "#90a6b3",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 51.8, y: 54.3 }
  },

  /* ★ 19/10/2026 · copia del sobre de @thedigitalinvite_ (TikTok 7695555994134301984) que pidió Maki:
     verde salvia con peonías en relieve, solapa en V con banda lisa y lacre rojo GRANDE con una rosa
     (sin siglas: es genérico). Flow, Nano Banana 2.1, con el cuadro del reel de referencia.
     Recorte: doblez medido por textura (banda lisa vs relieve) + RANSAC; lacre por color.
       L y = 381,36 + 0,8640·x · R y = 1048,64 − 0,8861·x · punta (381,3 ; 710,8) · lacre (386,641) r≈182
     La referencia: la solapa sube con el lacre y aparece la invitación → la versión -cae es la fiel. */
  /* ★ 20/10/2026 · LA VERSIÓN EN VIDEO, la que pidió Maki («es 100 % video»).
     Flow · Veo 3.1 Quality, 8 s, primer cuadro = el sobre cerrado idéntico al reel (Nano Banana 2.1),
     lacre genérico con rosa, SIN texto (Maki 20/10: «no va texto ahí»).
     Calidad: bajado de Flow en 1080p reescalado (1080×1920), entregado w_1080 q_auto:good (≈1,6 MB el clip).
     Original medido: quieto 0–1,0 · la solapa gira hacia arriba y sale por arriba 1,0–2,6 con sombra ·
     adentro verde con relieve 2,6–5,5 · luz a blanco 5,5–8,0.
     Recorte: so_0.6 (menos espera tras el toque) · eo_4.7 (luz relativa 2,6 + 1,45 ≤ 4,1 s de clip).
     El motor tapa con luz desde `luz`, como el reel (≈1,9 s después de que se va la solapa). */
  "salvia-lacre-rojo-video": {
    nombre:     "Salvia en relieve · lacre rojo, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_4.7/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/salvia-lacre-rojo-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:best,f_jpg/invitame/sobres/salvia-lacre-rojo-1080.jpg",
    color:      "#949883",
    luz:        2.6,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "encaje-blanco-perla-video": {
    nombre:     "Encaje blanco · perla, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.8,eo_5.6/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/encaje-blanco-perla-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.8/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:best,f_jpg/invitame/sobres/encaje-blanco-perla-1080.jpg",
    color:      "#e2e2e3",
    luz:        3.3,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "azul-marino-damasco-video": {
    nombre:     "Azul marino damasco · lacre con corazón, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.3,eo_5.2/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/azul-marino-damasco-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.3/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:best,f_jpg/invitame/sobres/azul-marino-damasco-1080.jpg",
    color:      "#344c65",
    luz:        3.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "rosa-perla-redonda-video": {
    nombre:     "Rosa perla · solapa redonda, se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.5,eo_4.8/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/rosa-perla-redonda-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.5/c_crop,x_10,y_0,w_1060,h_1920/w_1080,q_auto:best,f_jpg/invitame/sobres/rosa-perla-redonda-1080.jpg",
    color:      "#d1b5a9",
    luz:        2.8,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "v-clasico-peonia-video": {
    nombre:     "V clásico rosa · lacre dorado con peonía, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_4.7,w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/v-clasico-peonia-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,w_1080,q_auto:best,f_jpg/invitame/sobres/v-clasico-peonia-1080.jpg",
    color:      "#f4d2cf",
    luz:        2.5,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "crema-hueso-lacre-video": {
    nombre:     "Crema hueso liso · lacre champán, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_4.7,c_crop,g_south,w_0.865,h_0.865/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/cand-crema/v-crema-cand-c-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,c_crop,g_south,w_0.865,h_0.865/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/cand-crema/v-crema-cand-c-1080.jpg",
    color:      "#f6ece2",
    luz:        2.6,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },
  "crema-hueso-liso-video": {
    nombre:     "Crema hueso liso · lacre champán liso, sin dibujo, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_4.7,c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/cand-crema/v-crema-liso-cand-e-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/cand-crema/v-crema-liso-cand-e-1080.jpg",
    color:      "#f4e9dd",
    luz:        2.5,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },
  /* ★ 20/10/2026 · 16 sobres a pantalla completa, uno por muestra (Flow · Veo 3.1 Fast 720p -> 1080p reescalado), lacre temático.
     so_0.6 saca la espera inicial; eo_ corta antes de que el video vuelva a la imagen de partida; luz = 0,5 s después de que la solapa con el lacre sale del cuadro.
     Revisados cuadro por cuadro. Subido a `prueba`; Maki publica con su botón. */
  "tem-julia-y-santiago-video": {
    nombre:     "Julia y Santiago · papel crema con pampa y flores secas, lacre terracota con hoja · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.1/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-julia-y-santiago.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-julia-y-santiago.jpg",
    color:      "#d0b08e",
    luz:        2.8,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-julieta-mis15-video": {
    nombre:     "Julieta · papel kraft con margaritas y flores secas, lacre durazno · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.0/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-julieta-mis15.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-julieta-mis15.jpg",
    color:      "#c29e72",
    luz:        2.7,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-luciana-neon-video": {
    nombre:     "Luciana · negro con corazón de neón rosa, lacre fucsia con corazón · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.8/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-luciana-neon.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-luciana-neon.jpg",
    color:      "#121212",
    luz:        3.5,
    luzColor:   "#FFFBF0",
    luzFundido: 0.5
  },

  "tem-luciana-y-sebastian-video": {
    nombre:     "Luciana y Sebastián · polvo de colores holi, lacre blanco con corazón · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.2/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-luciana-y-sebastian.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-luciana-y-sebastian.jpg",
    color:      "#e2dacd",
    luz:        2.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-lupita-mis15-video": {
    nombre:     "Lupita · lentejuelas plateadas con cinta negra y lacre de bola disco · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.2/w_1080,q_50,vc_h264,ac_none/invitame/sobres/gen22v/tem-lupita-mis15-f2.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-lupita-mis15-f2.jpg",
    color:      "#545355",
    luz:        3.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.5
  },

  "d27-negro-oro-video": {
    nombre:     "Negro mate con lacre dorado · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.7/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d27-negro-oro-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/d27-negro-oro-1080.jpg",
    color:      "#232323",
    luz:        4.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.5
  },

  "d33b-mariposas-video": {
    nombre:     "Mariposas y perlas con lacre de mariposa · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.7/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d33b-mariposas-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/d33b-mariposas-1080.jpg",
    color:      "#BDA290",
    luz:        4.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d36-blanco-video": {
    nombre:     "Blanco con hilo y lacre negro · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.7/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d36-blanco-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/d36-blanco-1080.jpg",
    color:      "#D3D1CB",
    luz:        3.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d39-concha-video": {
    nombre:     "Acuarela celeste con conchas y lacre de perla · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.1/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d39-concha-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d39-concha-1080.jpg",
    color:      "#76C3CD",
    luz:        3.8,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  /* 21/10/2026 · d23, d26, d32, d35, d38 y París: mismos takes que Maki aprobó en 720p, bajados en 1080p reescalado de Flow
     (verificado cuadro a cuadro contra el 720p). Sin recorte; luz = inicio de la luz − so. */
  "d23-blanco-video": {
    nombre:     "Blanco texturado con lacre blanco de guirnalda · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.5/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d23-blanco-uno-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d23-blanco-uno-1080.jpg",
    color:      "#E0E1E1",
    luz:        4.2,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d26-gris-plata-video": {
    nombre:     "Gris perla con lacre plateado · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.9/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d26-gris-plata-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d26-gris-plata-1080.jpg",
    color:      "#BDBBB6",
    luz:        4.6,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d32-crema-encaje-video": {
    nombre:     "Crema con puntilla de encaje y perla · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.2/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d32-crema-encaje-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d32-crema-encaje-1080.jpg",
    color:      "#E2D7CE",
    luz:        3.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d35-burdeos-encaje-video": {
    nombre:     "Burdeos y encaje blanco con lacre de laurel · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.2/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d35-rojo-blanco-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d35-rojo-blanco-1080.jpg",
    color:      "#6D3B3F",
    luz:        3.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.6
  },

  "d38-hojas-naranja-video": {
    nombre:     "Blanco con hojas tropicales en relieve y lacre naranja · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.8/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d38-hojas-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d38-hojas-1080.jpg",
    color:      "#E2E2E2",
    luz:        4.5,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "paris-bordado-video": {
    nombre:     "París bordado con solapa en V y lacre crema · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.8/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/paris-bordado-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/paris-bordado-1080.jpg",
    color:      "#E9E5DD",
    luz:        4.5,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "mariposas-verdes-lacre-champan-video": {
    nombre:     "Mariposas verde salvia con borde rosa, cintas y lacre champán · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.4/c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/mariposa-verde-t1-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/mariposa-verde-t1-1080.jpg",
    color:      "#D7C3B4",
    luz:        4.0,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  /* 9/11/2026 · Jazmín (Alejandra, Mis XV): el mismo sobre con el lacre PLATEADO.
     Es el video de arriba con el sello recoloreado cuadro por cuadro (seguido
     con su forma y su escala mientras la solapa se levanta). */
  "mariposas-verdes-lacre-plata-video": {
    nombre:     "Mariposas verde salvia con borde rosa, cintas y lacre plateado · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.4/c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/mariposa-verde-plata-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/mariposa-verde-plata-1080.jpg",
    color:      "#D7C3B4",
    luz:        4.0,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  /* 9/11/2026 · Jazmín (Alejandra, Mis XV): «tal cual está pero con el sobre
     blanco, el color de fondo también blanco». Es el video de arriba con el
     papel durazno pasado a blanco cuadro por cuadro (mariposas, cintas verdes,
     flores rosas, perlas y lacre plateado quedan igual). */
  "mariposas-verdes-plata-blanco-video": {
    nombre:     "Mariposas verde salvia con borde rosa, cintas y lacre plateado · sobre BLANCO · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.4/c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/mariposa-verde-plata-blanco-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/mariposa-verde-plata-blanco-1080.jpg",
    color:      "#F7F6F3",
    luz:        4.0,
    luzColor:   "#FBFAF8",
    luzFundido: 0.8
  },

  /* 9/11/2026 · pedido de Maki (video de Pinterest): en vez del sobre, un LIBRO
     lila de cuento con el 15 dorado que se abre solo y suelta humo lila con
     brillos dorados y mariposas hasta llenar la pantalla de luz. Veo 3.1 Fast,
     toma A. Va con la colección «XV · Cuento de hadas lila» (celebra-hadas). */
  "hadas-libro-15-video": {
    nombre:     "Cuento de hadas · libro lila con el 15 que se abre y suelta humo lila y dorado (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,eo_7.0/w_720,h_1280,c_fill,q_auto:good,vc_h264,ac_none/invitame/cuento/libro-abre-a.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0/w_720,h_1280,c_fill,q_auto:best,f_jpg/invitame/cuento/libro-abre-a.jpg",
    /* antes de tocar, el libro VIVO (bucle mudo que empieza en el primer cuadro) */
    espera:     "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,h_1280,c_fill,q_auto:good,vc_h264,ac_none/invitame/cuento/libro-espera-2.mp4",
    color:      "#B9A3D6",
    luz:        6.1,
    luzColor:   "#F6EEFC",
    luzFundido: 0.7
  },

  /* 9/11/2026 · pedido de Maki: apertura KIDS a pantalla completa (nada de sobre
     chiquito en el medio). Caja de regalo de lunares con moño fucsia entre globos:
     antes de tocar se mueve impaciente (espera en bucle), al tocar salta la tapa
     y explota confeti, serpentinas y globitos hasta llenar la pantalla de luz.
     Veo 3.1 Fast. Va con «Kids · Serpentinas de colores» (celebra-serpentina). */
  "kids-caja-confeti-video": {
    nombre:     "Kids · caja de regalo de lunares que explota en confeti, serpentinas y globos (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,eo_7.6/w_720,h_1280,c_fill,q_auto:good,vc_h264,ac_none/invitame/serpentina/kc-apertura-a-9-11.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0/w_720,h_1280,c_fill,q_auto:best,f_jpg/invitame/serpentina/kc-apertura-a-9-11.jpg",
    espera:     "https://res.cloudinary.com/oc8cgqt4/video/upload/w_720,h_1280,c_fill,q_auto:good,vc_h264,ac_none/invitame/eventos/ev-serpentina2-caja-espera.mp4",
    color:      "#F7D9E8",
    luz:        6.3,
    luzColor:   "#FFF4FA",
    luzFundido: 0.7
  },

  "puertas-cinta-olivo-video": {
    oculto:     true,
    nombre:     "Papel marfil con cinta de organza, moño y ramita de olivo · las puertas se abren y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.7/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/manos-puertas-cinta-olivo-b-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/manos-puertas-cinta-olivo-b-1080.jpg",
    color:      "#F5ECE3",
    luz:        4.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "puertas-cinta-olivo-cae-video": {
    oculto:     true,
    nombre:     "Papel marfil con cinta de organza, moño y ramita de olivo · el moño se suelta y cae, las puertas se abren y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_7.7/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/manos-puertas-cinta-olivo-c-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/manos-puertas-cinta-olivo-c-1080.jpg",
    color:      "#F5ECE3",
    luz:        5.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "puertas-cinta-olivo-desata-video": {
    oculto:     true,
    nombre:     "Papel marfil con cinta de organza, moño y ramita de olivo · el moño se desata, la cinta cae y las puertas se abren con luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_8.4/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/manos-puertas-cinta-olivo-d-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/manos-puertas-cinta-olivo-d-1080.jpg",
    color:      "#F5ECE3",
    luz:        6.1,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },
  "puertas-cinta-olivo-nudo-video": {
    nombre:     "Olivo · En tus manos · papel marfil con cinta de organza, moño y ramita de olivo; el nudo se desata y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_6.6/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/manos-puertas-cinta-olivo-f-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/c_crop,g_north,w_0.98,h_0.98/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/manos-puertas-cinta-olivo-f-1080.jpg",
    color:      "#F5ECE3",
    luz:        4.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },
  /* 10/11/2026 · Jazmín (Bany & Jorge): «quería el listón de la invitación azul».
     El mismo sobre «Olivo · En tus manos» con la cinta de organza AZUL: primer
     cuadro recoloreado en Flow (nano-pro) y animado con Veo (i2v). */
  "puertas-cinta-azul-nudo-video": {
    nombre:     "Cinta azul · En tus manos · papel marfil con cinta de organza azul, moño y ramita de olivo; el nudo se desata y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_7.2/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/jbmpug2d8cfni97yis04.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/jbmpug2d8cfni97yis04.jpg",
    color:      "#F0E8DA",
    luz:        4.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },
  "tem-maria-paz-y-joaquin-video": {
    nombre:     "María Paz y Joaquín · papel kraft con espigas de trigo, lacre dorado con espiga · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.2/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-maria-paz-y-joaquin.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-maria-paz-y-joaquin.jpg",
    color:      "#a38969",
    luz:        2.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-maria-paz-y-santiago-video": {
    nombre:     "María Paz y Santiago · verde salvia con hojas en relieve, lacre champán con laurel · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_4.7/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-maria-paz-y-santiago.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-maria-paz-y-santiago.jpg",
    color:      "#ccb492",
    luz:        2.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-martina-mis15-video": {
    nombre:     "Martina · rosa con ramas florales en relieve, lacre rosa · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.7/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-martina-mis15.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-martina-mis15.jpg",
    color:      "#d7b1b2",
    luz:        3.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-mia-mis15-video": {
    nombre:     "Mía · negro con brillos, lacre de bola de espejos plateada · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.5,c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-mia-mis15.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,c_crop,g_south,w_0.9,h_0.9/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-mia-mis15.jpg",
    color:      "#030304",
    luz:        3.2,
    luzColor:   "#FFFBF0",
    luzFundido: 0.5
  },

  "tem-montserrat-petalos-video": {
    nombre:     "Montserrat · rosa con pétalos y bolitas de espejo, lacre rosa translúcido · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.3/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-r2c6.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-r2c6.jpg",
    color:      "#be989f",
    luz:        3,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-montserrat-mosaico-video": {
    nombre:     "Montserrat · mosaico rosa de espejos, lacre plateado con rosa · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.5/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-montserrat-3-d1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-montserrat-3-d1.jpg",
    color:      "#903a46",
    luz:        3.2,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-sofia-bordado-naranja-video": {
    nombre:     "Sofía y Emilio · bordado mexicano naranja y turquesa, lacre rosa · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.5/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-r2c2.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-r2c2.jpg",
    color:      "#454e4a",
    luz:        3.2,
    luzColor:   "#FFFBF0",
    luzFundido: 0.5
  },

  "tem-sofia-bordado-crema-video": {
    nombre:     "Sofía y Emilio · bordado crema con flores fucsias, lacre fucsia · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.2/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-r2c4.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-r2c4.jpg",
    color:      "#6e3459",
    luz:        2.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-regina-y-emiliano-video": {
    nombre:     "Regina y Emiliano · crema con lirios en relieve, lacre dorado con cruz · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.1/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-regina-y-emiliano.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-regina-y-emiliano.jpg",
    color:      "#d2c1b0",
    luz:        2.8,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "tem-santi-cumple7-video": {
    nombre:     "Santi · cancha de fútbol, pelota en el lacre · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_4.8/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-santi-cumple7.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-santi-cumple7.jpg",
    color:      "#45882c",
    luz:        2.5,
    luzColor:   "#FFFBF0",
    luzFundido: 0.5
  },

  "tem-mariana-y-rodrigo-video": {
    nombre:     "Mariana y Rodrigo · crema con banda de azulejo azul, lacre azul cobalto · solapa con lacre sube y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6,eo_5.6/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/tem-mariana-y-rodrigo-e1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/tem-mariana-y-rodrigo-e1.jpg",
    color:      "#7984a1",
    luz:        3.3,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  /* ★ 20/10/2026 · 10 sobres en video elegidos por Maki (D28 · D29 · D31 · D34). Flow · Veo 3.1 Fast 720p -> 1080p reescalado,
     entregado w_1080 q_auto:good. so_ saca la espera inicial, eo_ corta antes del blanco, luz = 0,5 s después de que la solapa sale del cuadro.
     D34: c_crop g_south 0,85 tapa los triángulos blancos de las esquinas de arriba. Subido a `prueba`; Maki publica con su botón. */
  "d31-rosa-a-video": {
    nombre:     "Rosa floral en relieve · solapa en V, se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.7,eo_4.8/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d31-rosa-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.7/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d31-rosa-a-1080.jpg",
    color:      "#CDA497",
    luz:        2.6,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d31-salvia-a-video": {
    nombre:     "Salvia floral en relieve · solapa en V, se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_4.7/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d31-salvia-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d31-salvia-a-1080.jpg",
    color:      "#737F64",
    luz:        3.1,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d31-marino-a-video": {
    nombre:     "Azul marino floral en relieve · solapa en V, se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.4,eo_4.8/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d31-marino-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.4/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d31-marino-a-1080.jpg",
    color:      "#102034",
    luz:        2.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d31-negro-a-video": {
    nombre:     "Negro floral en relieve · solapa en V, se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_4.7/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d31-negro-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d31-negro-a-1080.jpg",
    color:      "#131313",
    luz:        3.1,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d28-rosa-a-video": {
    nombre:     "Rosa con puntilla y perla · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.4,eo_4.8/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d28-rosa-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.4/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d28-rosa-a-1080.jpg",
    color:      "#E5C9BE",
    luz:        2.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d28-salvia-a-video": {
    nombre:     "Salvia con puntilla y perla · la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.7,eo_5.3/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d28-salvia-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.7/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d28-salvia-a-1080.jpg",
    color:      "#ABB499",
    luz:        3.1,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d29-borravino-a-video": {
    nombre:     "Borravino aterciopelado · lacre con flor, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_5/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d29-borravino-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d29-borravino-a-1080.jpg",
    color:      "#220D11",
    luz:        3.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d29-marino-b-video": {
    nombre:     "Azul marino aterciopelado · lacre con flor, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_5/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d29-marino-b-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/d29-marino-b-1080.jpg",
    color:      "#071422",
    luz:        3.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d34-celeste-b-video": {
    nombre:     "Celeste perlado · lacre con flor, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_4.8/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d34-celeste-b-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/d34-celeste-b-1080.jpg",
    color:      "#949DAE",
    luz:        3.2,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "d34-salvia-a-video": {
    nombre:     "Salvia perlada · lacre con flor, la solapa se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_5/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/d34-salvia-a-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/c_crop,g_south,w_0.85,h_0.85/w_1080,h_1920,c_fill,q_auto:best,f_jpg/invitame/sobres/gen22v/d34-salvia-a-1080.jpg",
    color:      "#ADA28C",
    luz:        3.4,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "c-celeste-video": {
    nombre:     "Encaje celeste · solapa en V, se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_6.4/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/c-celeste-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/c-celeste-1080.jpg",
    color:      "#9FBCD2",
    luz:        2.8,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "c-negro-video": {
    nombre:     "Encaje negro · solapa en V, se levanta y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1,eo_4.4/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/c-negro-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0.1/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/c-negro-1080.jpg",
    color:      "#393936",
    luz:        2.9,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },
  /* 27/10 Jazmín (Citlalli): el paquete de papel con moño de organza; al abrir,
     el moño se desliza y cae al piso, se queda ahí y entra la luz. */
  "paquete-liston-cae-video": {
    nombre:     "Paquete de papel con moño · el listón cae al piso y entra la luz (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/so_2.6,eo_7.6/w_1080,q_auto:good,vc_h264,ac_none/invitame/sobres/gen22v/uhv1pqg8tjxdquhklhbm.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_2.6/w_1080,q_auto:best,f_jpg/invitame/sobres/gen22v/uhv1pqg8tjxdquhklhbm.jpg",
    color:      "#847a6e",
    luz:        3.3,
    luzColor:   "#FFFBF0",
    luzFundido: 0.8
  },

  "salvia-lacre-rojo": {
    nombre:   "Salvia en relieve · peonías grabadas y lacre rojo con rosa (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/salvia-lacre-rojo-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/salvia-lacre-rojo-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/salvia-lacre-rojo-cuerpo.webp",
    color:    "#878f72",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 49.6, y: 51.7 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "salvia-lacre-rojo-cae": {
    nombre:   "Salvia en relieve · lacre rojo, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/salvia-lacre-rojo-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/salvia-lacre-rojo-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/salvia-lacre-rojo-cuerpo.webp",
    color:    "#878f72",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 49.6, y: 51.7 }
  },

  "rosado-flor-seca": {
    nombre:   "Rústico rosa · algodón de borde suelto, lacre con flor seca (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosado-flor-seca-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosado-flor-seca-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosado-flor-seca-cuerpo.webp",
    color:    "#ddc6bb",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 48.6, y: 55.7 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  /* ★ 29/9/2026 · mismo sobre que rosado-flor-seca, SIN ficha y con empalme "foto":
     la solapa sube, la mitad de abajo CAE y aparece la portada (pedido de Maki). */
  "rosado-flor-seca-cae": {
    nombre:   "Rústico rosa · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosado-flor-seca-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosado-flor-seca-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosado-flor-seca-cuerpo.webp",
    color:    "#ddc6bb",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 48.6, y: 55.7 }
  },

  /* ---- ★ DIEZ SOBRES MÁS, MISMO MÉTODO Y MISMA FICHA  (29/9/2026) -----------
     Maki: «seguí armando sobres como estos, dale unos 10 más». Mismos tres
     archivos de 768×1376 por sobre (poster · solapa · cuerpo), armados de LA
     MISMA FOTO de Flow (Nano Banana 2, 0 créditos), mismo motor y misma `ficha`
     (solapa 2,6 s · destello 2,7 s · luzFundido 1,0). Cada uno tiene también su
     variante `-cae` (sin ficha, empalme "foto": la solapa sube y el sobre CAE).
     Sin siglas en ningún lacre. Doblez medido sobre la foto (rectas y ajuste de
     círculo); en terracota el borde rústico se siguió columna por columna, y en
     encaje-blanco-perla la solapa lleva una franja de papel liso bajo el encaje.
     ---------------------------------------------------------------------- */
  "azul-marino-damasco": {
    nombre:   "Azul marino · papel con damasco en relieve, lacre azul con corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/azul-marino-damasco-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/azul-marino-damasco-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/azul-marino-damasco-cuerpo.webp",
    color:    "#3a516a",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.2, y: 56.1 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "azul-marino-damasco-cae": {
    nombre:   "Azul marino · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/azul-marino-damasco-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/azul-marino-damasco-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/azul-marino-damasco-cuerpo.webp",
    color:    "#3a516a",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.2, y: 56.1 }
  },

  "lavanda-peonias": {
    nombre:   "Lavanda · peonías grabadas en relieve, lacre lila con ramita seca (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/lavanda-peonias-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/lavanda-peonias-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/lavanda-peonias-cuerpo.webp",
    color:    "#c8b6cd",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 49.8, y: 56.4 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "lavanda-peonias-cae": {
    nombre:   "Lavanda · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/lavanda-peonias-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/lavanda-peonias-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/lavanda-peonias-cuerpo.webp",
    color:    "#c8b6cd",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 49.8, y: 56.4 }
  },

  "vino-oro": {
    nombre:   "Vino · burdeos con damasco en relieve, lacre dorado con corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-cuerpo.webp",
    color:    "#4b1920",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.1, y: 56.2 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "vino-oro-cae": {
    nombre:   "Vino · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-cuerpo.webp",
    color:    "#4b1920",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.1, y: 56.2 }
  },

  /* ★ 3/11/2026 — Jazmín: «cambiar ese corazón por la R». El mismo Vino con el
     lacre LISO (se le sacó el corazón a la foto) y la letra la graba
     /efectos/lacre-letra.js en el lugar de la cera (lacreLetra, medido sobre
     la foto: centro 379,661 · diámetro 235 de 768×1376). La letra sale del
     panel: «El lacre del sobre» → Las iniciales. */
  "vino-oro-letra": {
    nombre:   "Vino · burdeos con damasco en relieve, lacre dorado con LETRA (la que pongas en las iniciales) (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-liso-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-liso-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-cuerpo.webp",
    color:    "#4b1920",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.1, y: 56.2 },
    lacreLetra: { x: 49.4, y: 48.0, d: 30.6 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "vino-oro-letra-cae": {
    nombre:   "Vino · lacre con LETRA, la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-liso-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-liso-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/vino-oro-cuerpo.webp",
    color:    "#4b1920",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.1, y: 56.2 },
    lacreLetra: { x: 49.4, y: 48.0, d: 30.6 }
  },

  "terracota-flor-seca": {
    nombre:   "Terracota · algodón de borde rústico con damasco, lacre con flores secas (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/terracota-flor-seca-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/terracota-flor-seca-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/terracota-flor-seca-cuerpo.webp",
    color:    "#ad5b3b",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.2, y: 56.1 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "terracota-flor-seca-cae": {
    nombre:   "Terracota · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/terracota-flor-seca-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/terracota-flor-seca-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/terracota-flor-seca-cuerpo.webp",
    color:    "#ad5b3b",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.2, y: 56.1 }
  },

  "negro-oro": {
    nombre:   "Negro · papel mate con damasco en relieve, lacre dorado con corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/negro-oro-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/negro-oro-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/negro-oro-cuerpo.webp",
    color:    "#1a1a1d",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.1, y: 56.2 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "negro-oro-cae": {
    nombre:   "Negro · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/negro-oro-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/negro-oro-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/negro-oro-cuerpo.webp",
    color:    "#1a1a1d",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.1, y: 56.2 }
  },

  "oliva-oro": {
    nombre:   "Oliva · verde oliva con damasco en relieve, lacre dorado con corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/oliva-oro-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/oliva-oro-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/oliva-oro-cuerpo.webp",
    color:    "#424629",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.1, y: 56.1 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "oliva-oro-cae": {
    nombre:   "Oliva · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/oliva-oro-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/oliva-oro-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/oliva-oro-cuerpo.webp",
    color:    "#424629",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.1, y: 56.1 }
  },

  "rosa-perla-redonda": {
    nombre:   "Rosa perla · lino rosa empolvado, solapa REDONDA con una perla (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosa-perla-redonda-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosa-perla-redonda-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosa-perla-redonda-cuerpo.webp",
    color:    "#d7bdb1",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 48.8, y: 60.3 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "rosa-perla-redonda-cae": {
    nombre:   "Rosa perla · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosa-perla-redonda-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosa-perla-redonda-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/rosa-perla-redonda-cuerpo.webp",
    color:    "#d7bdb1",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 48.8, y: 60.3 }
  },

  "gris-perla-x": {
    nombre:   "Gris perla · papel nacarado, cuatro solapas en X con enredadera grabada, lacre plata (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/gris-perla-x-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/gris-perla-x-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/gris-perla-x-cuerpo.webp",
    color:    "#9c958e",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.3, y: 56.4 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "gris-perla-x-cae": {
    nombre:   "Gris perla · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/gris-perla-x-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/gris-perla-x-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/gris-perla-x-cuerpo.webp",
    color:    "#9c958e",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.3, y: 56.4 }
  },

  "encaje-blanco-perla": {
    nombre:   "Encaje blanco · solapa con borde de encaje y perla (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-blanco-perla-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-blanco-perla-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-blanco-perla-cuerpo.webp",
    color:    "#e1e0e2",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 51.0, y: 54.0 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "encaje-blanco-perla-cae": {
    nombre:   "Encaje blanco · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-blanco-perla-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-blanco-perla-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/encaje-blanco-perla-cuerpo.webp",
    color:    "#e1e0e2",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 51.0, y: 54.0 }
  },

  "marfil-lacre-crema": {
    nombre:   "Marfil · damasco en relieve, lacre crema con corazón (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/marfil-lacre-crema-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/marfil-lacre-crema-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/marfil-lacre-crema-cuerpo.webp",
    color:    "#e3ded7",
    apertura: "solapas",
    empalme:  "blanco",
    eje:      { x: 50.2, y: 56.2 },
    luzFundido: 1.0,
    ficha:    { solapa: 2.6, destello: 2.7, ease: "cubic-bezier(.5,0,.75,.5)" }
  },

  "marfil-lacre-crema-cae": {
    nombre:   "Marfil · la solapa sube y el sobre cae (foto)",
    poster:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/marfil-lacre-crema-poster.jpg",
    solapa:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/marfil-lacre-crema-solapa.webp",
    cuerpo:   "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/marfil-lacre-crema-cuerpo.webp",
    color:    "#e3ded7",
    apertura: "solapas",
    empalme:  "foto",
    eje:      { x: 50.2, y: 56.2 }
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
  },

  /* ---- MARFIL 3D (5/10/2026): sobre RENDERIZADO EN 3D (Blender/Cycles), no capas CSS. La solapa con el lacre viene hacia el espectador, el relieve toma luz rasante real, y a los 4 s el cuerpo del sobre baja suave dejando a la vista una tarjeta crema (sin nombres). Termina en la tarjeta: empalme foto. 720x1280, 30 fps, 5,7 s, H.264 High 4.0, 620 KB. Se sirve SIN transformacion para que Cloudinary no lo recomprima (md5 igual al master). ---- */
  marfil3d: {
    nombre:  "Marfil 3D · la solapa viene hacia vos y el sobre baja (video)",
    video:   "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/sobres/sobre-marfil-3d-v1.mp4",
    poster:  "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-marfil-3d-v1-poster.jpg",
    color:   "#f4f0e8",
    empalme: "foto"
  },

  // Marfil 3D · Perlas: igual que marfil3d, pero la tarjeta que queda detrás
  // es la foto de la invitación de Perlas (camila-y-tomas), sin textos.
  marfil3dPerlas: {
    nombre:  "Marfil 3D · Perlas (la foto de la invitación detrás)",
    video:   "https://res.cloudinary.com/oc8cgqt4/video/upload/invitame/sobres/sobre-marfil-3d-v4.mp4",
    poster:  "https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobres/sobre-marfil-3d-v4-poster.jpg",
    color:   "#f4f0e8",
    empalme: "foto"
  },

  /* ---- ★ LÍNEA ROJA · WHITE SWAN (10/11/2026) ---------------------------------
     Copia de la apertura «Opaline» de @on_the_list._ (Maki: «las quiero iguales»).
     No es un sobre que se abre: es una PELÍCULA. Primer plano del sobre de plumas
     blancas sobre terciopelo rojo → la cámara se aleja y descubre que está sobre un
     pedestal de mármol, en una alfombra roja, frente a una puerta en arco con
     cortina de terciopelo → la cámara avanza por la alfombra, pasa por encima del
     sobre y frena frente a la puerta. Ese último cuadro ES la portada: la portada
     de la invitación es `invitame/linea-roja/white-swan/portada-loop` (Veo Quality,
     la puerta quieta con la luz respirando) y arranca en el mismo cuadro, por eso
     va `empalme: 'foto'` y el corte no se ve (comparado cuadro contra cuadro).
     Flow · Veo 3.1 Fast x2 por tramo, 1080p reescalado de Flow, armado con ffmpeg
     (tramo 1: 0,6–5,8 s ×1,5 · tramo 2: 0,05–2,6 s ×1,25) = 5,5 s.
     Sin texto ni iniciales en el sobre (regla de siempre).
     -------------------------------------------------------------------------- */
  "linea-roja-white-swan": {
    nombre:     "Línea Roja · White Swan · sobre de plumas → salón con alfombra roja → la puerta de terciopelo (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto:good,vc_h264:main:3.1,ac_none/invitame/linea-roja/white-swan/apertura-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto:best,f_jpg/invitame/linea-roja/white-swan/apertura-1080.jpg",
    color:      "#60000A",
    empalme:    "foto",
    luz:        4.9,
    luzFundido: 0.6,
    /* texto impreso en la tarjeta en blanco: esquinas medidas cuadro por cuadro (efectos/sobre-papel.js) */
    papel:      {"k":[[0.0,0.2315,0.3672,0.7963,0.3672,0.7963,0.5599,0.2315,0.5599],[0.067,0.2394,0.3774,0.7878,0.3777,0.7878,0.5647,0.2395,0.5646],[0.133,0.2451,0.3852,0.7818,0.3854,0.7817,0.5683,0.2455,0.5683],[0.2,0.251,0.3933,0.7755,0.3935,0.7755,0.5722,0.2515,0.5722],[0.267,0.2601,0.4057,0.766,0.4059,0.7659,0.5783,0.2606,0.5784],[0.333,0.2663,0.4144,0.7594,0.4146,0.7594,0.5827,0.267,0.5828],[0.4,0.2724,0.4231,0.753,0.4232,0.7529,0.587,0.2733,0.5873],[0.467,0.2816,0.4359,0.7432,0.436,0.7432,0.5936,0.2826,0.5938],[0.533,0.2874,0.4445,0.7369,0.4446,0.7369,0.5979,0.2884,0.5981],[0.6,0.2958,0.4571,0.7274,0.4571,0.7274,0.6043,0.2969,0.6046],[0.667,0.3013,0.4652,0.7213,0.4652,0.7215,0.6084,0.3024,0.6088],[0.733,0.3065,0.4729,0.7156,0.4731,0.7156,0.6126,0.3077,0.6128],[0.8,0.314,0.4844,0.707,0.4846,0.7071,0.6185,0.3152,0.6188],[0.867,0.3187,0.4918,0.7017,0.4919,0.7018,0.6222,0.3199,0.6226],[0.933,0.3255,0.5023,0.6939,0.5024,0.6939,0.628,0.3267,0.6283],[1.0,0.3298,0.5093,0.6889,0.5093,0.6891,0.6317,0.3308,0.632],[1.067,0.3358,0.5192,0.6819,0.5192,0.682,0.637,0.3368,0.6375],[1.133,0.3397,0.5255,0.6778,0.5254,0.6779,0.6406,0.3406,0.6411],[1.2,0.3434,0.5317,0.6735,0.5316,0.6738,0.644,0.3441,0.6446],[1.267,0.3487,0.5405,0.6678,0.5404,0.6681,0.6492,0.3492,0.6499],[1.333,0.352,0.5461,0.6641,0.546,0.6645,0.6524,0.3523,0.6532],[1.4,0.3553,0.5515,0.6606,0.5514,0.6613,0.6558,0.3553,0.6565],[1.467,0.3596,0.5594,0.6559,0.5594,0.6567,0.6606,0.3595,0.6614],[1.533,0.3624,0.5645,0.6529,0.5645,0.6538,0.664,0.3621,0.6646],[1.6,0.3663,0.5717,0.6486,0.5717,0.6497,0.6686,0.3659,0.6693],[1.667,0.3687,0.5762,0.646,0.5763,0.6472,0.6717,0.3681,0.6721],[1.733,0.3711,0.5806,0.6434,0.5807,0.645,0.6747,0.3704,0.6749],[1.8,0.3744,0.5868,0.64,0.587,0.6417,0.6789,0.3734,0.679],[1.867,0.3763,0.5907,0.638,0.5909,0.6398,0.6817,0.3752,0.6817],[1.933,0.3791,0.5963,0.6349,0.5965,0.6369,0.6855,0.3778,0.6855],[2.0,0.3808,0.5997,0.6331,0.6001,0.6353,0.6881,0.3794,0.6878],[2.067,0.3832,0.6046,0.6306,0.6049,0.6329,0.6915,0.3817,0.6911],[2.133,0.3847,0.6076,0.6291,0.608,0.6314,0.6938,0.3831,0.6932],[2.2,0.386,0.6104,0.6276,0.6108,0.6301,0.6959,0.3843,0.6952],[2.267,0.388,0.6143,0.6257,0.6148,0.6283,0.6987,0.3861,0.6979],[2.333,0.3891,0.6167,0.6245,0.6172,0.6272,0.7005,0.3871,0.6996],[2.4,0.3901,0.619,0.6235,0.6194,0.6263,0.7021,0.3881,0.7012],[2.467,0.3916,0.622,0.622,0.6225,0.6249,0.7044,0.3894,0.7034],[2.533,0.3926,0.6239,0.621,0.6243,0.6241,0.7058,0.3903,0.7047],[2.6,0.3938,0.6264,0.6198,0.6267,0.6231,0.7076,0.3914,0.7066],[2.667,0.3945,0.6278,0.619,0.6281,0.6223,0.7087,0.392,0.7076],[2.733,0.3953,0.6291,0.6182,0.6294,0.6218,0.7096,0.3927,0.7085],[2.8,0.3962,0.6307,0.6173,0.631,0.621,0.711,0.3934,0.7098],[2.867,0.397,0.6316,0.6166,0.6319,0.6205,0.7117,0.394,0.7104],[2.933,0.3977,0.6327,0.6159,0.6331,0.62,0.7126,0.3945,0.7114],[3.0,0.3983,0.6332,0.6153,0.6336,0.6195,0.7131,0.3949,0.7118],[3.067,0.3991,0.634,0.6144,0.6343,0.6191,0.7136,0.3955,0.7124],[3.133,0.3999,0.6342,0.6138,0.6346,0.6187,0.7138,0.396,0.7126],[3.2,0.4003,0.6344,0.6133,0.6349,0.6185,0.7141,0.3963,0.7128],[3.267,0.4006,0.6349,0.6129,0.6354,0.6182,0.7145,0.3965,0.7133],[3.333,0.401,0.635,0.6124,0.6355,0.6181,0.7146,0.3968,0.7134],[3.4,0.4013,0.6352,0.612,0.6355,0.6179,0.7147,0.3969,0.7135],[3.467,0.4007,0.6371,0.6129,0.6377,0.6188,0.7175,0.3961,0.7163],[3.533,0.3998,0.6386,0.6136,0.6392,0.6198,0.7201,0.3948,0.7188],[3.6,0.3986,0.6405,0.6146,0.6411,0.6211,0.7233,0.3932,0.7219],[3.667,0.3973,0.6425,0.6158,0.6433,0.6228,0.7271,0.3915,0.7254],[3.733,0.3956,0.6451,0.6171,0.6459,0.6246,0.7316,0.3893,0.7297],[3.8,0.394,0.648,0.6186,0.6489,0.6266,0.7368,0.3869,0.7347],[3.867,0.3919,0.6513,0.6204,0.6526,0.629,0.7432,0.3842,0.7406],[3.933,0.3898,0.6552,0.6225,0.6569,0.6317,0.7503,0.3811,0.7472],[4.0,0.3874,0.6593,0.625,0.6615,0.635,0.7583,0.3777,0.7546],[4.067,0.3848,0.6641,0.6279,0.6668,0.6387,0.7674,0.374,0.7631],[4.133,0.3808,0.6702,0.6313,0.6729,0.643,0.7777,0.3694,0.773],[4.2,0.3769,0.6766,0.6354,0.6799,0.6478,0.7893,0.3644,0.7839],[4.267,0.3723,0.6839,0.6401,0.6877,0.6537,0.8023,0.3586,0.7959],[4.333,0.3668,0.6928,0.6456,0.6969,0.6601,0.8171,0.352,0.8102],[4.4,0.3606,0.7026,0.6521,0.7073,0.6677,0.8335,0.3449,0.826],[4.467,0.3539,0.7133,0.6592,0.7183,0.6759,0.8518,0.3365,0.8438],[4.533,0.346,0.7256,0.6673,0.7312,0.6858,0.8728,0.3274,0.8643],[4.6,0.3369,0.7398,0.6764,0.7457,0.6968,0.8965,0.3166,0.8876],[4.667,0.3262,0.756,0.6868,0.7625,0.7094,0.9241,0.3039,0.9143],[4.733,0.3142,0.7742,0.6987,0.7815,0.7238,0.9567,0.2886,0.945],[4.8,0.2996,0.7959,0.7134,0.8041,0.7424,0.9952,0.2719,0.983],[4.867,0.2823,0.8223,0.73,0.8309,0.7646,1.0427,0.2516,1.0302],[4.933,0.2615,0.8532,0.7494,0.8623,0.7914,1.1,0.2227,1.0858],[5.0,0.235,0.8918,0.7737,0.9,0.8297,1.1785,0.181,1.1652],[5.067,0.2041,0.9388,0.8062,0.9465,0.8881,1.2818,0.1192,1.2777],[5.133,0.1644,0.9975,0.843,1.0046,0.9164,1.3688,0.0665,1.3749],[5.2,0.1401,1.0277,0.9981,1.0601,1.0788,1.5084,0.0599,1.3762],[5.267,0.1401,1.0277,0.9981,1.0601,1.0788,1.5084,0.0599,1.3762],[5.333,0.1401,1.0277,0.9981,1.0601,1.0788,1.5084,0.0599,1.3762],[5.4,0.1401,1.0277,0.9981,1.0601,1.0788,1.5084,0.0599,1.3762],[5.467,0.1401,1.0277,0.9981,1.0601,1.0788,1.5084,0.0599,1.3762]],"o":[[0,1],[4.45,1],[4.8,0]],"aspecto":1.591,"linea1":"Estás invitado a","fuente":"Pinyon Script","color":"#6e1420","w":1080,"h":1920}
  },

  /* ---- ★ LÍNEA ROJA · MONOGRAMME (10/11/2026) ---------------------------------
     Copia de la apertura «Vows / Monogramme» de @on_the_list._. Caja octogonal de
     laca carmesí con filigrana dorada y el emblema de dos anillos (SIN iniciales:
     el sobre se reusa) sobre terciopelo rojo → la tapa se abre y aparece una
     tarjeta marfil en blanco → la cámara entra en la tarjeta y se funde a un
     salón: arco de terciopelo bordó con marco dorado, columnas, rosas rojas y velas
     sobre mármol oscuro. El último cuadro ES la portada: la portada es
     `invitame/linea-roja/monogramme/portada-loop-v1`, que son los últimos segundos
     del mismo video en ida y vuelta (por eso el empalme es exacto).
     Flow · Veo 3.1 Fast x2 por tramo, 1080p reescalado. Tramo 1: 0,6–4,6 s ×1,3 ·
     tramo 2: 0,3–5,0 s ×1,3 = 6,7 s. La primera tanda de la tapa se descartó:
     el emblema de los anillos se despegaba de la tapa y salía volando.
     -------------------------------------------------------------------------- */
  "linea-roja-monogramme": {
    nombre:     "Línea Roja · Monogramme · caja de laca carmesí que se abre → salón dorado con rosas y velas (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto:good,vc_h264:main:3.1,ac_none/invitame/linea-roja/monogramme/apertura-1080-v1.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto:best,f_jpg/invitame/linea-roja/monogramme/apertura-1080-v1.jpg",
    color:      "#2D0003",
    empalme:    "foto",
    luz:        6.1,
    luzFundido: 0.5,
    /* texto impreso en la tarjeta en blanco: esquinas medidas cuadro por cuadro (efectos/sobre-papel.js) */
    papel:      {"k":[[2.1,0.1744,0.4083,0.7456,0.342,0.8394,0.5524,0.3136,0.6257],[2.167,0.1746,0.4091,0.7453,0.342,0.8396,0.5531,0.3142,0.6262],[2.233,0.1749,0.4098,0.7451,0.3426,0.8397,0.5538,0.3144,0.6268],[2.3,0.1751,0.4105,0.7449,0.343,0.8397,0.5545,0.3149,0.6273],[2.367,0.1756,0.4114,0.7446,0.3436,0.8398,0.5554,0.3151,0.6281],[2.433,0.1757,0.4122,0.7444,0.3441,0.8396,0.5563,0.3153,0.6289],[2.5,0.176,0.4132,0.7442,0.3447,0.8395,0.5572,0.3156,0.6298],[2.567,0.1764,0.4143,0.744,0.3456,0.8396,0.5583,0.3159,0.6308],[2.633,0.1769,0.4153,0.7437,0.3464,0.8395,0.5594,0.3163,0.6317],[2.7,0.1774,0.4165,0.7433,0.3473,0.8392,0.5606,0.3166,0.6329],[2.767,0.1781,0.4177,0.7429,0.3483,0.8391,0.562,0.3169,0.6341],[2.833,0.1788,0.4188,0.7425,0.3492,0.8387,0.5633,0.3171,0.6353],[2.9,0.1792,0.4196,0.7415,0.3497,0.8377,0.5643,0.317,0.6367],[2.967,0.18,0.4205,0.7406,0.3504,0.8366,0.5645,0.3177,0.6369],[3.033,0.1805,0.4209,0.74,0.3509,0.8361,0.5646,0.3178,0.637],[3.1,0.1719,0.486,0.7449,0.4107,0.8466,0.6334,0.3143,0.7107],[3.167,0.1702,0.4858,0.7461,0.4102,0.8483,0.634,0.3133,0.7116],[3.233,0.1681,0.4856,0.7473,0.4096,0.8503,0.6346,0.3121,0.7127],[3.3,0.1658,0.4854,0.7489,0.4089,0.8526,0.6353,0.3107,0.714],[3.367,0.1635,0.4851,0.7506,0.408,0.8551,0.636,0.3094,0.7153],[3.433,0.1607,0.4847,0.7527,0.4071,0.8581,0.6369,0.3077,0.7169],[3.5,0.1574,0.4844,0.7546,0.4062,0.8611,0.638,0.3056,0.7188],[3.567,0.1536,0.4841,0.7566,0.4053,0.8642,0.6392,0.3032,0.7207],[3.633,0.1502,0.4837,0.7589,0.4041,0.8674,0.6405,0.3009,0.7227],[3.7,0.1463,0.4834,0.7614,0.403,0.871,0.6417,0.2984,0.7248],[3.767,0.1404,0.4827,0.7656,0.4011,0.8773,0.6438,0.2949,0.7283],[3.833,0.1362,0.4822,0.769,0.3996,0.882,0.645,0.2927,0.7307],[3.9,0.1318,0.4816,0.7724,0.398,0.887,0.6465,0.2898,0.7333],[3.967,0.1269,0.4809,0.776,0.3964,0.8923,0.6481,0.2869,0.7361],[4.033,0.1217,0.4803,0.7796,0.3947,0.8978,0.6497,0.2839,0.7391],[4.1,0.1163,0.4797,0.7836,0.3928,0.9036,0.6516,0.2806,0.7423],[4.167,0.1103,0.4789,0.7879,0.3909,0.9097,0.6535,0.2769,0.7456],[4.233,0.1041,0.4781,0.7923,0.3889,0.9164,0.6555,0.2731,0.7493],[4.3,0.0973,0.4772,0.7972,0.3866,0.9237,0.6575,0.2691,0.7531],[4.367,0.0906,0.4764,0.8025,0.3841,0.9312,0.6597,0.2652,0.7571],[4.433,0.083,0.4752,0.8081,0.3814,0.9395,0.662,0.2606,0.7614],[4.5,0.0752,0.4742,0.8141,0.3787,0.9484,0.6646,0.256,0.7659],[4.567,0.0623,0.4727,0.8235,0.3743,0.9623,0.6687,0.2481,0.7735],[4.633,0.0533,0.4714,0.8303,0.3711,0.9724,0.6716,0.2428,0.7786],[4.7,0.0434,0.4699,0.8373,0.3677,0.9827,0.6746,0.2369,0.7842],[4.767,0.0332,0.4684,0.8453,0.364,0.9944,0.678,0.2308,0.79],[4.833,0.0225,0.4668,0.8533,0.3601,1.0064,0.6813,0.2245,0.7961],[4.9,0.0112,0.4647,0.8619,0.3557,1.0192,0.6845,0.2173,0.8024],[4.967,-0.0012,0.4627,0.8712,0.3511,1.0328,0.6883,0.2099,0.8094],[5.033,-0.0144,0.4605,0.881,0.3464,1.0476,0.6923,0.2019,0.8169],[5.1,-0.0285,0.4582,0.8915,0.3411,1.0633,0.6965,0.1933,0.8248],[5.167,-0.0429,0.4554,0.9026,0.3355,1.08,0.7008,0.1844,0.833],[5.233,-0.0591,0.4527,0.9146,0.3295,1.0978,0.7057,0.1748,0.842],[5.3,-0.0768,0.4495,0.9276,0.323,1.1171,0.7108,0.1643,0.8518],[5.367,-0.0951,0.4461,0.9415,0.3158,1.1386,0.7162,0.153,0.8621],[5.433,-0.1239,0.4404,0.964,0.3041,1.1732,0.725,0.1345,0.8784],[5.5,-0.1458,0.4363,0.9806,0.2956,1.1981,0.7314,0.1214,0.8905],[5.567,-0.1691,0.4318,0.9981,0.2865,1.2256,0.7381,0.1067,0.9033],[5.633,-0.1932,0.4267,1.0165,0.2771,1.2541,0.7452,0.0906,0.9169],[5.7,-0.2199,0.4212,1.0358,0.267,1.2855,0.7526,0.0731,0.9315],[5.767,-0.2459,0.415,1.0589,0.2556,1.3121,0.7625,0.0773,0.9404],[5.833,-0.2596,0.4118,1.0708,0.2492,1.3324,0.7669,0.0663,0.9488],[5.9,-0.2608,0.4115,1.0719,0.2486,1.3343,0.7675,0.0655,0.9496]],"o":[[2.15,0],[2.55,1],[5.25,1],[5.5,0]],"aspecto":1.369,"linea1":"Nos casamos","fuente":"Great Vibes","color":"#7a5a22","w":1080,"h":1920}
  },

  /* ---- ★ LÍNEA ROJA · PASARELA (10/11/2026) -----------------------------------
     Copia de la apertura «The Show» de @on_the_list._ (la marca se renombró a
     «Pasarela»). Sobre de papel aluminio arrugado bajo un cenital, sobre piso negro
     espejado → la solapa se abre y sube una tarjeta blanca → la tarjeta se vuelve
     un panel de acero cepillado y se funde a una pasarela de moda: panel plateado
     entre cortinados de seda blanca, cenitales y flashes. El último cuadro ES la
     portada: `invitame/linea-roja/pasarela/portada-loop` son los segundos 5–8 del
     mismo video en ida y vuelta.
     Flow · Veo 3.1 Fast x2 por tramo, 1080p reescalado. Tramo 1 (abre): 0,3–4,0 s
     ×1,25 · tramo 2 (trans): 0–2 ×1,5, 2–3,5 ×1,3, 3,5–5 ×1 = 6,9 s. De la otra
     toma del tramo 2 se descartó: tenía un barrido gris de un cuadro.
     -------------------------------------------------------------------------- */
  "linea-roja-pasarela": {
    nombre:     "Línea Roja · Pasarela · sobre de aluminio que se abre → pasarela plateada con cortinas blancas (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto:good,vc_h264:main:3.1,ac_none/invitame/linea-roja/pasarela/apertura-1080.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto:best,f_jpg/invitame/linea-roja/pasarela/apertura-1080.jpg",
    color:      "#000000",
    empalme:    "foto",
    luz:        6.4,
    luzFundido: 0.5,
    /* texto impreso en la tarjeta en blanco: esquinas medidas cuadro por cuadro (efectos/sobre-papel.js) */
    papel:      {"k":[[2.75,0.3084,0.4179,0.6814,0.4179,0.6814,0.5961,0.3084,0.5961],[2.833,0.3042,0.4062,0.678,0.4062,0.678,0.5849,0.3042,0.5849],[2.917,0.3108,0.2829,0.6818,0.2829,0.6818,0.4602,0.3108,0.4602],[3.0,0.3148,0.2239,0.6843,0.2239,0.6843,0.4006,0.3148,0.4006],[3.083,0.3148,0.2239,0.6843,0.2239,0.6843,0.4006,0.3148,0.4006],[3.167,0.3148,0.2235,0.6843,0.2235,0.6843,0.4003,0.3148,0.4003],[3.25,0.3142,0.2231,0.6845,0.2231,0.6845,0.4002,0.3142,0.4002],[3.333,0.3139,0.2224,0.6852,0.2224,0.6852,0.3999,0.3139,0.3999],[3.417,0.3133,0.2218,0.6854,0.2218,0.6854,0.3997,0.3133,0.3997],[3.5,0.3125,0.2169,0.6863,0.2169,0.6863,0.3956,0.3125,0.3956],[3.583,0.31,0.2052,0.6891,0.2052,0.6891,0.3864,0.31,0.3864],[3.667,0.3044,0.1963,0.6941,0.1963,0.6941,0.3826,0.3044,0.3826],[3.75,0.2968,0.1863,0.7014,0.1863,0.7014,0.3797,0.2968,0.3797],[3.833,0.2869,0.1718,0.7112,0.1718,0.7112,0.3746,0.2869,0.3746],[3.917,0.2744,0.1609,0.7247,0.1609,0.7247,0.3762,0.2744,0.3762],[4.0,0.2597,0.1607,0.7437,0.1607,0.7437,0.3921,0.2597,0.3921],[4.042,0.2528,0.1636,0.7537,0.1636,0.7537,0.4031,0.2528,0.4031]],"o":[[2.95,0],[3.1,1],[3.75,1],[4.0,0]],"aspecto":1.176,"linea1":"Estás invitado a","fuente":"Playfair Display","color":"#161616","w":1080,"h":1920}
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

    /* ★ 3/10/2026 — SIN `filter:blur()` EN VIVO. Ver «EL IPAD SE TRABA» abajo. */
    '  #sobre-fondo{display:block;position:absolute;inset:0;z-index:0;',
    '    background-color:#cfc4b4;background-size:cover;background-position:center}',
    '  #env.gone #sobre-fondo,#env.gone #sobre-vinieta{display:none!important}',

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
    var borroso = fondoBorroso(poster);
    if (!borroso) return;                       /* todavía armándose (canvas) */
    var url = 'url("' + borroso.replace(/"/g, '%22') + '")';
    if (fondo.style.backgroundImage !== url) fondo.style.backgroundImage = url;
  }

  /* ★★★ 3/10/2026 — «EN EL IPAD SE TRABA TODO, NO CARGA» (y en el iPhone anda).
     Medido en un Safari de iPad Pro (1024 × 1366, ×2): el iPad pasa el
     `min-width:680px`, así que se llevaba el fondo de escritorio del sobre: una
     capa de pantalla completa con `filter:blur(64px)` y `scale(1.35)` EN VIVO
     —unos 14 millones de píxeles del aparato desenfocados en cada cuadro—
     detrás de un video que se está reproduciendo. Y al abrir el sobre la capa NO
     se iba: `#env` queda `visibility:hidden` pero sigue en la página.
     Es el mismo error que ya se había pagado el 4/9 con `#inv-lienzo` (ver
     `efectos/encuadre-monitor.js`): una Mac lo absorbe, Safari de iPad no.

     El arreglo, para TODOS (Mac incluida, que también va más liviana):
       · el desenfoque se hace UNA vez, no en cada cuadro: si el póster es de
         Cloudinary, lo hace Cloudinary (`w_120,e_blur:400` → ~1,5 KB); si es un
         archivo nuestro (`/sobres/...`), un canvas de 48 px lo achica una vez.
         Una imagen chiquita estirada a pantalla completa YA se ve desenfocada;
       · sin `filter` y sin `transform` en la capa;
       · al abrir el sobre (`#env.gone`) la capa sale de la página. */
  var cacheBorroso = {};
  function fondoBorroso(poster) {
    if (cacheBorroso[poster] !== undefined) return cacheBorroso[poster];
    var m = poster.match(/^(.*?res\.cloudinary\.com\/[^\/]+\/(image|video)\/upload\/)(.*)$/);
    if (m) {
      var cola = m[3], partes = cola.split('/'), so = '';
      /* el primer tramo es de instrucciones si tiene `x_` y no es versión ni carpeta */
      if (/^[a-z]{1,3}_/.test(partes[0]) && !/^v\d+$/.test(partes[0])) {
        var t = partes.shift().match(/(?:^|,)(so_[^,]+)/);
        if (t) so = t[1] + ',';
      }
      if (m[2] === 'video' && !so) so = 'so_0,';
      cacheBorroso[poster] = m[1] + so + 'w_120,e_blur:400,q_auto:low,f_jpg/' + partes.join('/');
      return cacheBorroso[poster];
    }
    /* un archivo nuestro: se achica UNA vez en un canvas (mismo origen, no se tiñe) */
    var mismo = poster.charAt(0) === '/' || poster.indexOf(location.origin + '/') === 0;
    if (!mismo) { cacheBorroso[poster] = ''; return ''; }
    cacheBorroso[poster] = null;                /* en camino */
    var im = new Image();
    im.onload = function () {
      try {
        var w = 48, h = Math.max(1, Math.round(48 * im.naturalHeight / Math.max(1, im.naturalWidth)));
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(im, 0, 0, w, h);
        cacheBorroso[poster] = c.toDataURL('image/jpeg', 0.7);
      } catch (e) { cacheBorroso[poster] = ''; }
      pintarFondo();
    };
    im.onerror = function () { cacheBorroso[poster] = ''; };
    im.src = poster;
    return null;
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
