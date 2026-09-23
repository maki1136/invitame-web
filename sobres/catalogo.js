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

  'oleo-rose-luz': {
    nombre:     "Óleo Rosé · se abre la solapa y sale luz de adentro (video)",
    video:      "https://res.cloudinary.com/oc8cgqt4/video/upload/q_auto,vc_h264:baseline:3.1/invitame/oleo/oleo-xa-sobre-luz-a.mp4",
    poster:     "https://res.cloudinary.com/oc8cgqt4/video/upload/so_0,q_auto,f_jpg/invitame/oleo/oleo-xa-sobre-luz-a.jpg",
    color:      "#E6DDD2",
    luz:        3.0,
    luzColor:   "#FBF6EE",
    luzFundido: 0.9
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
