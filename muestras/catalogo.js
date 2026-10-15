/* ===== LAS MUESTRAS CON NOMBRE ================================================

   QUE ES ESTO
   La lista de invitaciones de MUESTRA que el cliente puede elegir por su nombre
   ("Perlas") desde /catalogo.html. Al elegir una, el formulario guarda ese id, y
   cuando la disenadora trae la solicitud al editor, el diseno de esa muestra se
   COPIA entero: colores, tipografias, sobre, coleccion, efectos. El cliente pone
   sus datos y la invitacion llega ya vestida.

   /!\ REGLA QUE NO SE NEGOCIA
   `muestra` tiene que apuntar SIEMPRE a una invitacion NUESTRA de muestra que
   EXISTA. Nunca a la de un cliente real, nunca a la boda de ejemplo, y nunca a
   un slug que no este creado.

   /!\/!\ POR QUE ESTA LISTA TIENE DOS ENTRADAS Y NO SEIS  (15/9/2026)
   Hasta hoy tenia seis modelos. Los probe uno por uno, pidiendole cada muestra
   a Firestore, y el resultado fue:

       Perlas             -> camila-y-tomas    EXISTE
       Boho               -> julieta-y-bruno   NO EXISTE
       Blanco Clasico     -> pavel-y-lada      NO EXISTE
       Rustica Campestre  -> maria-y-diego     es la BODA DE EJEMPLO
       Uva Elegante       -> (vacio)           nunca tuvo muestra
       XV Rosa            -> (vacio)           nunca tuvo muestra

   O sea que el cliente elegia cualquiera de los seis y, salvo Perlas, no se
   clonaba ningun diseno: la invitacion nacia con el vestido de fabrica. Esa es
   la causa de fondo del "todas se parecen entre si". No era un problema de
   diseno: era que en la practica habia UNA sola coleccion, y el cat  logo
   prometia seis.

   Y lo de Rustica era peor que un hueco: apuntaba a la boda de ejemplo, que es
   justo la que venimos limpiando porque se le filtraban datos a las
   invitaciones reales. Contra la regla de aca arriba.

   Decision de Maki: quedarse con las dos que existen de verdad y armar las
   nuevas de a una, como se armo Perlas. Prefiere dos reales que seis promesas.

   COMO SE AGREGA UNA MUESTRA NUEVA
   1. Armar la invitacion completa en el admin, con un slug propio.
   2. ABRIRLA y comprobar que carga. Si el slug no existe, el cliente que la
      elija se lleva el vestido de fabrica y nadie se entera.
   3. Sumar aca una entrada con su id, su nombre y ese slug.
   4. Que el `color` de la tarjeta sea el color de verdad de esa invitacion, o
      el catalogo miente antes de que el cliente entre.
   No hay que tocar crear.html ni admin.html.

   QUIEN LO USA
     · /catalogo.html                      -> dibuja las tarjetas
     · /efectos/crear-muestra.js           -> el cartel "Modelo elegido"
     · /efectos/panel-solicitud-muestra.js -> el clonado, en el admin

   /!\ EL ID VIAJA EN `tpl`
   El formulario ya guardaba `tpl` (el modelo elegido) desde siempre. Se reusa
   ese campo en vez de inventar uno nuevo: asi crear.html --que pesa 50 KB y no
   entra en una subida-- no hay que tocarlo.
   ★★ 15/10/2026 — LA LISTA ES LA DE LA WEB DE VENTAS  ★★
   Jazmín: «en "Modelo elegido" solo aparecen dos muestras. Incorporar todas
   las muestras disponibles». Ahora son las 29 que muestra la web
   (invitameok.com/mx: boda y XV), con la misma bajada que leen ahí, y cada una
   con `foto`: la captura REAL de su portada (/formulario/disenos/<slug>.webp,
   sacada de la invitación publicada el 15/10). El formulario dibuja las
   tarjetas con esa foto.
   · `tipos` filtra qué ve el cliente según lo que festeja (boda / xv). Para
     bautizo, cumpleaños y otros se muestran todas.
   · `oculto: true` = queda para leer pedidos viejos que la eligieron, pero ya
     no se ofrece.
   · Si se agrega una muestra a la web, se agrega acá con su captura.
   ============================================================================ */
(function () {
  window.MUESTRAS_INVITAME = {
    'cantera': {
      nombre:  "Tradicional religiosa",
      bajada:  "Cantera rosa, latón y olivo, en arcos de iglesia.",
      muestra: 'regina-y-emiliano',
      foto:    '/formulario/disenos/regina-y-emiliano.webp',
      color:   '#544b3e',
      color2:  '#3c362c',
      paleta:  ["#433b2e", "#5f5547", "#817a6a", "#282217"],
      tipos:   ["boda"]
    },
    'bohemia': {
      nombre:  "Bohemia",
      bajada:  "Pampas que se mueven sobre papel crema.",
      muestra: 'julia-y-santiago',
      foto:    '/formulario/disenos/julia-y-santiago.webp',
      color:   '#625547',
      color2:  '#463d33',
      paleta:  ["#918b7f", "#2e251a", "#4d3e2e", "#766654"],
      tipos:   ["boda"]
    },
    'campestre': {
      nombre:  "Campestre",
      bajada:  "Campo al atardecer con guirnaldas de luces.",
      muestra: 'maria-paz-y-joaquin',
      foto:    '/formulario/disenos/maria-paz-y-joaquin.webp',
      color:   '#5b5040',
      color2:  '#41392e',
      paleta:  ["#665745", "#4d4131", "#312a1d", "#837b6a"],
      tipos:   ["boda"]
    },
    'perlas': {
      nombre:  "Perlas",
      bajada:  "Foto en blanco y negro y un hilo de perlas.",
      muestra: 'camila-y-tomas',
      foto:    '/formulario/disenos/camila-y-tomas.webp',
      color:   '#434543',
      color2:  '#303130',
      paleta:  ["#4e4f4d", "#090b09", "#2a2b2a", "#828683"],
      tipos:   ["boda", "xv"]
    },
    'marfil': {
      nombre:  "Marfil",
      bajada:  "Papel marfil con textura y perlas en los márgenes.",
      muestra: 'renata-y-patricio',
      foto:    '/formulario/disenos/renata-y-patricio.webp',
      color:   '#e5e1d5',
      color2:  '#a4a299',
      paleta:  ["#e6e1d5", "#e4e2d5", "#ece8df", "#dddbce"],
      tipos:   ["boda"]
    },
    'playa': {
      nombre:  "Playa",
      bajada:  "Mar, arena y atardecer en la costa.",
      muestra: 'valeria-y-emiliano',
      foto:    '/formulario/disenos/valeria-y-emiliano.webp',
      color:   '#6d695f',
      color2:  '#4e4b44',
      paleta:  ["#959489", "#5e5a51", "#413c32", "#7b7972"],
      tipos:   ["boda"]
    },
    'oleo-rose': {
      nombre:  "Óleo Rosé",
      bajada:  "Rosas pintadas al óleo con espátula, en un fondo con movimiento.",
      muestra: 'ximena-y-andres',
      foto:    '/formulario/disenos/ximena-y-andres.webp',
      color:   '#a38a7a',
      color2:  '#756357',
      paleta:  ["#9c7b67", "#ccc3bb", "#ab9e8e", "#7c5241"],
      tipos:   ["boda"]
    },
    'oleo-piedra': {
      nombre:  "Óleo Piedra",
      bajada:  "Óleo en greige y plata, para viñedo o hacienda.",
      muestra: 'mariana-y-joaquin',
      foto:    '/formulario/disenos/mariana-y-joaquin.webp',
      color:   '#918c81',
      color2:  '#68645c',
      paleta:  ["#8b8478", "#98978a", "#c2beb9", "#645e53"],
      tipos:   ["boda"]
    },
    'oleo-nocturno': {
      nombre:  "Óleo Nocturno",
      bajada:  "Cielo estrellado al óleo, para bodas de noche.",
      muestra: 'paulina-y-gerardo',
      foto:    '/formulario/disenos/paulina-y-gerardo.webp',
      color:   '#292e36',
      color2:  '#1d2126',
      paleta:  ["#292e36", "#21252d", "#1c1f28", "#39434a"],
      tipos:   ["boda"]
    },
    'rapunzel': {
      nombre:  "Rapunzel",
      bajada:  "La torre, la trenza dorada y un fondo que se mueve.",
      muestra: 'abril-mis15',
      foto:    '/formulario/disenos/abril-mis15.webp',
      color:   '#5d503b',
      color2:  '#42392a',
      paleta:  ["#d0b795", "#11110b", "#232115", "#776244"],
      tipos:   ["xv"]
    },
    'sapo': {
      nombre:  "La princesa y el sapo",
      bajada:  "La bola de oro en el pozo, verde y oro viejo.",
      muestra: 'zoe-mis15',
      foto:    '/formulario/disenos/zoe-mis15.webp',
      color:   '#4b442c',
      color2:  '#36301f',
      paleta:  ["#524a2d", "#3b3823", "#272519", "#6f6544"],
      tipos:   ["xv"]
    },
    'alicia': {
      nombre:  "Alicia en el país de las maravillas",
      bajada:  "La merienda en el jardín de las rosas.",
      muestra: 'paloma-mis15',
      foto:    '/formulario/disenos/paloma-mis15.webp',
      color:   '#4a4739',
      color2:  '#353329',
      paleta:  ["#15160d", "#b2a893", "#554e3d", "#1c1d12"],
      tipos:   ["xv"]
    },
    'sirenita': {
      nombre:  "La Sirenita",
      bajada:  "El fondo del mar con la luz del agua.",
      muestra: 'marisol-mis15',
      foto:    '/formulario/disenos/marisol-mis15.webp',
      color:   '#6c8478',
      color2:  '#4d5f56',
      paleta:  ["#7d9a88", "#577668", "#37534b", "#aeb1aa"],
      tipos:   ["xv"]
    },
    'bella': {
      nombre:  "La Bella y la Bestia",
      bajada:  "Oro viejo y borgoña a la luz de las velas.",
      muestra: 'victoria-mis15',
      foto:    '/formulario/disenos/victoria-mis15.webp',
      color:   '#28241d',
      color2:  '#1c1914',
      paleta:  ["#16140f", "#1e1e18", "#10120c", "#4d443b"],
      tipos:   ["xv"]
    },
    'cenicienta': {
      nombre:  "Cenicienta",
      bajada:  "Palacio de hielo y nieve, azul y plata.",
      muestra: 'clara-mis15',
      foto:    '/formulario/disenos/clara-mis15.webp',
      color:   '#3d3d3d',
      color2:  '#2b2b2b',
      paleta:  ["#151a1e", "#403f41", "#27282b", "#716b62"],
      tipos:   ["xv"]
    },
    'globos': {
      nombre:  "Globos rosa",
      bajada:  "Globos brillantes sobre un cielo rosa que se mueve.",
      muestra: 'alexa-mis15',
      foto:    '/formulario/disenos/alexa-mis15.webp',
      color:   '#936067',
      color2:  '#69454a',
      paleta:  ["#a97981", "#994356", "#cba8b2", "#522a27"],
      tipos:   ["xv"]
    },
    'glam': {
      nombre:  "Glam",
      bajada:  "Brillantina magenta sobre la ciudad de noche.",
      muestra: 'barbara-mis15',
      foto:    '/formulario/disenos/barbara-mis15.webp',
      color:   '#483125',
      color2:  '#33231a',
      paleta:  ["#19110e", "#453322", "#836c4e", "#381111"],
      tipos:   ["xv"]
    },
    'brillos': {
      nombre:  "Brillos al atardecer",
      bajada:  "Brillantina rosa sobre un atardecer.",
      muestra: 'bianca-mis15',
      foto:    '/formulario/disenos/bianca-mis15.webp',
      color:   '#927266',
      color2:  '#695249',
      paleta:  ["#8a5e51", "#a4897c", "#c3b4ad", "#613b2a"],
      tipos:   ["xv"]
    },
    'boho-xv': {
      nombre:  "Boho",
      bajada:  "Pampas, plumas y flores secas.",
      muestra: 'julieta-mis15',
      foto:    '/formulario/disenos/julieta-mis15.webp',
      color:   '#907f6a',
      color2:  '#675b4c',
      paleta:  ["#a7a091", "#40371d", "#c5b8a7", "#8d7156"],
      tipos:   ["xv"]
    },
    'lavanda': {
      nombre:  "Lavanda",
      bajada:  "Lavanda y plata, con corona y ventanas góticas.",
      muestra: 'maria-jose-mis15',
      foto:    '/formulario/disenos/maria-jose-mis15.webp',
      color:   '#4e4950',
      color2:  '#383439',
      paleta:  ["#473a3c", "#665256", "#27242f", "#597985"],
      tipos:   ["xv"]
    },
    'rosa-disco': {
      nombre:  "Rosa disco",
      bajada:  "Bolas de espejo y peonías rosas.",
      muestra: 'montserrat-mis15',
      foto:    '/formulario/disenos/montserrat-mis15.webp',
      color:   '#d3b4b6',
      color2:  '#978183',
      paleta:  ["#dfcac7", "#edd9d9", "#a56e77", "#ccafaf"],
      tipos:   ["xv"]
    },
    'mascarada': {
      nombre:  "Mascarada rosé",
      bajada:  "Baile de máscaras sobre terciopelo rosa.",
      muestra: 'aitana-mis15',
      foto:    '/formulario/disenos/aitana-mis15.webp',
      color:   '#b38a71',
      color2:  '#806351',
      paleta:  ["#52291a", "#e5c1a1", "#fcdac2", "#a67052"],
      tipos:   ["xv"]
    },
    'monarca': {
      nombre:  "Mariposa monarca",
      bajada:  "Monarcas volando sobre un bosque de oyameles.",
      muestra: 'daniela-mis15',
      foto:    '/formulario/disenos/daniela-mis15.webp',
      color:   '#ae957d',
      color2:  '#7d6b5a',
      paleta:  ["#f7e9dc", "#301d11", "#966c45", "#e4d0b6"],
      tipos:   ["xv"]
    },
    'cerezo': {
      nombre:  "Flor de cerezo",
      bajada:  "Ramas de cerezo y pétalos que caen.",
      muestra: 'emilia-mis15',
      foto:    '/formulario/disenos/emilia-mis15.webp',
      color:   '#453e40',
      color2:  '#312c2e',
      paleta:  ["#382927", "#58646f", "#241e22", "#514443"],
      tipos:   ["xv"]
    },
    'vaquera': {
      nombre:  "Vaquera",
      bajada:  "Botas rosas, sombrero y peonías.",
      muestra: 'ivanna-mis15',
      foto:    '/formulario/disenos/ivanna-mis15.webp',
      color:   '#b5a393',
      color2:  '#827569',
      paleta:  ["#e2d7d1", "#cac4b9", "#b1977d", "#72533c"],
      tipos:   ["xv"]
    },
    'glow': {
      nombre:  "Glow party",
      bajada:  "Luz negra con marcos de neón.",
      muestra: 'danna-mis15',
      foto:    '/formulario/disenos/danna-mis15.webp',
      color:   '#352242',
      color2:  '#26182f',
      paleta:  ["#07091a", "#2c183c", "#674f72", "#220b27"],
      tipos:   ["xv"]
    },
    'corazon-neon': {
      nombre:  "Corazón neón",
      bajada:  "Noche estrellada y un corazón de neón.",
      muestra: 'luciana-mis15',
      foto:    '/formulario/disenos/luciana-mis15.webp',
      color:   '#54383b',
      color2:  '#3c282a',
      paleta:  ["#1a1314", "#8c7173", "#361a1c", "#5e333c"],
      tipos:   ["xv"]
    },
    'disco': {
      nombre:  "Disco",
      bajada:  "Noche, bolas de espejos y plata.",
      muestra: 'mia-mis15',
      foto:    '/formulario/disenos/mia-mis15.webp',
      color:   '#141613',
      color2:  '#0e0f0d',
      paleta:  ["#0a0c09", "#070806", "#030303", "#343834"],
      tipos:   ["xv"]
    },
    'disco-neon': {
      nombre:  "Disco Neón",
      bajada:  "Letras de neón y nombre cromado.",
      muestra: 'lupita-mis15',
      foto:    '/formulario/disenos/lupita-mis15.webp',
      color:   '#313433',
      color2:  '#232524',
      paleta:  ["#373939", "#080908", "#616866", "#161918"],
      tipos:   ["xv"]
    },

    /* el id viejo de la XV Rosa: hay pedidos guardados con `tpl: 'xv'`. Queda
       para leerlos, pero ya no se ofrece (estaba a medio vestir). */
    'xv': {
      nombre:  'XV Rosa',
      bajada:  'Rosa empolvado, brillo y corona.',
      muestra: 'martina-mis15',
      color:   '#b06a7e',
      color2:  '#8a4f60',
      paleta:  ['#b06a7e', '#f7eef0', '#c9a0b0', '#8a4f60'],
      tipos:   ['xv'],
      oculto:  true
    }
  };

  /* atajo comodo para los tres que la usan */
  window.muestraDe = function (id) {
    var m = window.MUESTRAS_INVITAME || {};
    return m[String(id || '').toLowerCase()] || null;
  };
})();
