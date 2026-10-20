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
   · `tipos` filtra qué ve el cliente según lo que festeja. Ver «UNA FILA POR
     TIPO DE EVENTO» (19/10/2026) al final: ya acepta todos los tipos.
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
    },
    /* ---- 19/10/2026 · eventos nuevos (las que ya tienen portada con foto) ---- */
    'fiesta-ejecutivo': {
      nombre:  "Ejecutivo azul",
      bajada:  "Azul ejecutivo con líneas de luz.",
      muestra: 'conferencia-nexora',
      foto:    '/formulario/disenos/conferencia-nexora.webp',
      color:   '#122b53',
      color2:  '#0c1e3b',
      paleta:  ["#195c83", "#142346", "#0d0d4e", "#0f111f"],
      tipos:   ["corporativo"]
    },
    'fiesta-gala': {
      nombre:  "Gala art déco",
      bajada:  "Negro y oro art déco para una noche de gala.",
      muestra: 'gala-aurum',
      foto:    '/formulario/disenos/gala-aurum.webp',
      color:   '#30271a',
      color2:  '#221c12',
      paleta:  ["#63553f", "#372815", "#19160e", "#100f0a"],
      tipos:   ["corporativo"]
    },
    'fiesta-brindis': {
      nombre:  "Brindis de Año Nuevo",
      bajada:  "Champán, burbujas y luces para cerrar el año.",
      muestra: 'cena-fin-de-ano-veltra',
      foto:    '/formulario/disenos/cena-fin-de-ano-veltra.webp',
      color:   '#32312e',
      color2:  '#242321',
      paleta:  ["#4c5154", "#3d3e3e", "#26211a", "#161310"],
      tipos:   ["corporativo"]
    },
    'celebra-toga': {
      nombre:  "Toga y balanza",
      bajada:  "Marfil, oro y la balanza de la toga.",
      muestra: 'graduacion-derecho-valentina',
      foto:    '/formulario/disenos/graduacion-derecho-valentina.webp',
      color:   '#594f42',
      color2:  '#40382f',
      paleta:  ["#8d887d", "#645a4d", "#4e3e2a", "#2a2118"],
      tipos:   ["graduacion"]
    },
    'fiesta-birrete': {
      nombre:  "Birrete de gala",
      bajada:  "Negro y oro, birrete de gala.",
      muestra: 'graduacion-gala-2027',
      foto:    '/formulario/disenos/graduacion-gala-2027.webp',
      color:   '#3a2f1f',
      color2:  '#292116',
      paleta:  ["#7f6b4e", "#43301a", "#1a160e", "#0c0d09"],
      tipos:   ["graduacion"]
    },
    'celebra-kinder': {
      nombre:  "Pequeños graduados",
      bajada:  "Azul cielo y crayones para los más pequeños.",
      muestra: 'graduacion-kinder-2027',
      foto:    '/formulario/disenos/graduacion-kinder-2027.webp',
      color:   '#797e69',
      color2:  '#575a4b',
      paleta:  ["#a6a98c", "#919577", "#697469", "#414334"],
      tipos:   ["graduacion"]
    },
    'celebra-generacion': {
      nombre:  "Generación",
      bajada:  "Cielo azul y birretes al aire.",
      muestra: 'generacion-2023-2027',
      foto:    '/formulario/disenos/generacion-2023-2027.webp',
      color:   '#62707e',
      color2:  '#46505a',
      paleta:  ["#929ba0", "#60768b", "#596c7e", "#3c424c"],
      tipos:   ["graduacion"]
    },
    'celebra-pixel': {
      nombre:  "Pixel aventura",
      bajada:  "Islas y globos pixel sobre cielo de atardecer.",
      muestra: 'mateo-cumple5',
      foto:    '/formulario/disenos/mateo-cumple5.webp',
      color:   '#7b6961',
      color2:  '#584b45',
      paleta:  ["#a38e88", "#8f7c7a", "#75655d", "#45372a"],
      tipos:   ["cumple"]
    },
    'celebra-unicornio': {
      nombre:  "Cielo mágico",
      bajada:  "Nubes, unicornio y destellos pastel.",
      muestra: 'sofia-cumple6',
      foto:    '/formulario/disenos/sofia-cumple6.webp',
      color:   '#897f7d',
      color2:  '#625b5a',
      paleta:  ["#a09692", "#918685", "#847a78", "#695f5d"],
      tipos:   ["cumple"]
    },
    'fiesta-bokeh': {
      nombre:  "Bokeh dorado",
      bajada:  "Luces doradas que respiran sobre fondo negro.",
      muestra: 'misxv-bruno',
      foto:    '/formulario/disenos/misxv-bruno.webp',
      color:   '#282219',
      color2:  '#1c1812',
      paleta:  ["#4b3f33", "#1a1710", "#16120b", "#110e09"],
      tipos:   ["xv"]
    },
    'celebra-osita': {
      nombre:  "Osita coronada",
      bajada:  "Osita con coronita, globos y tonos crema.",
      muestra: 'babyshower-isabella',
      foto:    '/formulario/disenos/babyshower-isabella.webp',
      color:   '#8d7766',
      color2:  '#635347',
      paleta:  ["#c0b0a6", "#a58f7f", "#886c54", "#48321d"],
      tipos:   ["babyshower"]
    },
    'fiesta-noche': {
      nombre:  "Noche de oro",
      bajada:  "Negro mate, oro y estrellas que titilan.",
      muestra: 'mis50-ricardo',
      foto:    '/formulario/disenos/mis50-ricardo.webp',
      color:   '#282522',
      color2:  '#1c1a18',
      paleta:  ["#4c4033", "#262420", "#1c1d1c", "#0e1218"],
      tipos:   ["cumple"]
    },
    'fiesta-urbano': {
      nombre:  "Urbano 18",
      bajada:  "Ciudad de noche y haces de luz.",
      muestra: 'mis18-leo',
      foto:    '/formulario/disenos/mis18-leo.webp',
      color:   '#32302d',
      color2:  '#232220',
      paleta:  ["#67615c", "#2c2c2b", "#1d1d1b", "#141411"],
      tipos:   ["cumple"]
    },
    'celebra-grises': {
      nombre:  "Treinta en grises",
      bajada:  "Gris piedra, minimal y plata.",
      muestra: 'mis30-martin',
      foto:    '/formulario/disenos/mis30-martin.webp',
      color:   '#7d7469',
      color2:  '#585149',
      paleta:  ["#b8b6b2", "#92897f", "#6a5d4d", "#433526"],
      tipos:   ["cumple"]
    },
    'celebra-mono': {
      nombre:  "Moño de raso",
      bajada:  "Lino blanco y moño de raso rosa.",
      muestra: 'bautizo-y-comunion-lucia-y-clara',
      foto:    '/formulario/disenos/bautizo-y-comunion-lucia-y-clara.webp',
      color:   '#898377',
      color2:  '#605b53',
      paleta:  ["#d3ccca", "#b0a69f", "#776d56", "#2c2b1b"],
      tipos:   ["bautismo", "comunion"]
    },
    'celebra-olivo': {
      nombre:  "Olivo y cruz",
      bajada:  "Rama de olivo, bronce y papel de algodón.",
      muestra: 'comunion-tomas',
      foto:    '/formulario/disenos/comunion-tomas.webp',
      color:   '#8e867a',
      color2:  '#635e56',
      paleta:  ["#c4c0b7", "#a6a197", "#877b6f", "#483c2e"],
      tipos:   ["comunion"]
    },
    'celebra-estrellas': {
      nombre:  "Estrellas de algodón",
      bajada:  "Estrellas que se mecen sobre crema suave.",
      muestra: 'bautizo-y-primer-ano-olivia',
      foto:    '/formulario/disenos/bautizo-y-primer-ano-olivia.webp',
      color:   '#8e8276',
      color2:  '#635b52',
      paleta:  ["#c7bfb3", "#a49d93", "#857769", "#463728"],
      tipos:   ["bautismo"]
    },
    'celebra-marmol': {
      nombre:  "Mármol fabulous",
      bajada:  "Mármol rosa con vetas doradas.",
      muestra: 'mis40-carolina',
      foto:    '/formulario/disenos/mis40-carolina.webp',
      color:   '#928377',
      color2:  '#665c53',
      paleta:  ["#c2b8b3", "#a1978a", "#8b7666", "#5b4836"],
      tipos:   ["cumple"]
    },
    'celebra-editorial': {
      nombre:  "18 editorial",
      bajada:  "Mostaza y tinta negra, estilo revista.",
      muestra: 'mis18-nicolas',
      foto:    '/formulario/disenos/mis18-nicolas.webp',
      color:   '#84745e',
      color2:  '#5c5142',
      paleta:  ["#b7ad9b", "#9a8a71", "#826949", "#3e2f22"],
      tipos:   ["cumple"]
    },
    'fiesta-plata': {
      nombre:  "Plata 40",
      bajada:  "Negro y plata con globos que flotan.",
      muestra: 'mis40-alejandro',
      foto:    '/formulario/disenos/mis40-alejandro.webp',
      color:   '#413d37',
      color2:  '#2d2b26',
      paleta:  ["#847d75", "#463f36", "#272621", "#121310"],
      tipos:   ["cumple"]
    },
    'celebra-rosegold': {
      nombre:  "Rose gold",
      bajada:  "Rose gold con glitter cayendo.",
      muestra: 'mis30-paulina',
      foto:    '/formulario/disenos/mis30-paulina.webp',
      color:   '#9e9088',
      color2:  '#6e655f',
      paleta:  ["#c7bab4", "#a29c95", "#958e88", "#775c4f"],
      tipos:   ["cumple"]
    },
    'celebra-futbol': {
      nombre:  "Fútbol",
      bajada:  "Cancha de acuarela y el cumpleañero en dibujo animado.",
      muestra: 'santi-cumple7',
      foto:    '/formulario/disenos/santi-cumple7.webp',
      color:   '#a49175',
      color2:  '#736552',
      paleta:  ["#c3bea5", "#b49f7c", "#a48c70", "#75583f"],
      tipos:   ["cumple"]
    },
    'celebra-palmeras': {
      nombre:  "Camino de palmeras",
      bajada:  "Portada en video: el auto avanza entre palmeras rumbo al mar.",
      muestra: 'ainhoa-y-marco',
      foto:    '/formulario/disenos/ainhoa-y-marco.webp',
      color:   '#cec1a1',
      color2:  '#a4946c',
      paleta:  ["#efd2ac", "#cec1a1", "#a4946c", "#5d5b34"],
      tipos:   ["boda"]
    },
    'celebra-cabina': {
      nombre:  "Cabina de fotos",
      bajada:  "Encaje marfil, perlas y fotos impresas como de cabina antigua.",
      muestra: 'olivia-y-gael',
      foto:    '/formulario/disenos/olivia-y-gael.webp',
      color:   '#9d917e',
      color2:  '#5f5043',
      paleta:  ["#c5b191", "#9d917e", "#5f5043", "#1d1a1c"],
      tipos:   ["boda"]
    },
    'fiesta-abordar': {
      nombre:  "Pase de abordar",
      bajada:  "Azul marino con rutas de avión y boletos para cada momento.",
      muestra: 'elisa-y-hugo',
      foto:    '/formulario/disenos/elisa-y-hugo.webp',
      color:   '#566f7a',
      color2:  '#43565f',
      paleta:  ["#6e8c91", "#566f7a", "#43565f", "#20262e"],
      tipos:   ["boda"]
    },
    'fiesta-jardin': {
      nombre:  "Jardín pintado",
      bajada:  "Rosas al óleo sobre verde profundo y lacre dorado.",
      muestra: 'alma-y-nicolas',
      foto:    '/formulario/disenos/alma-y-nicolas.webp',
      color:   '#595644',
      color2:  '#363328',
      paleta:  ["#787a66", "#595644", "#363328", "#1c1e15"],
      tipos:   ["boda"]
    },
    'celebra-collage': {
      nombre:  "Collage rosa",
      bajada:  "Moños, encaje y tarjetas pegadas con cinta, en rosa.",
      muestra: 'lia-mis15',
      foto:    '/formulario/disenos/lia-mis15.webp',
      color:   '#90756d',
      color2:  '#83584a',
      paleta:  ["#9e8b7d", "#90756d", "#83584a", "#5c392a"],
      tipos:   ["xv"]
    },
    'celebra-scrapbook': {
      nombre:  "Scrapbook vintage",
      bajada:  "Papel antiguo, rosas secas y boletos de recuerdo.",
      muestra: 'amelia-mis15',
      foto:    '/formulario/disenos/amelia-mis15.webp',
      color:   '#a18981',
      color2:  '#4a5568',
      paleta:  ["#beb3a8", "#a18981", "#4a5568", "#302628"],
      tipos:   ["xv"]
    },
  };

  /* ★★ 19/10/2026 — UNA FILA POR TIPO DE EVENTO  ★★
     `tipos` acepta los `tipoEvento` REALES de la invitación (los mismos de
     /efectos/tipos-evento.js): boda · xv · cumple · bautismo · comunion ·
     babyshower · graduacion · corporativo. Las muestras de niños («kids») son
     `cumple`. Una muestra puede ir en varias filas (Perlas: boda y xv).
     El formulario (/crear-diseno.js) arma una fila por cada tipo de esta lista
     que tenga al menos una muestra visible, en este orden; con «¿Qué
     festejas?» elegido, muestra sólo esa fila (si está vacía, todas).

     FORMATO DE UNA ENTRADA NUEVA (las 21 de eventos nuevos, cuando tengan
     su captura en /formulario/disenos/<slug>.webp):
       'celebra-pixel': {
         nombre:  "Kids · Pixel aventura",
         bajada:  "Nubes y globos pixel sobre cielo claro.",
         muestra: 'mateo-cumple5',
         foto:    '/formulario/disenos/mateo-cumple5.webp',
         color:   '#…',  color2: '#…',  paleta: ["#…","#…","#…","#…"],
         tipos:   ["cumple"]
       },
  */
  window.MUESTRAS_TIPOS = [
    ['boda', 'Boda'], ['xv', 'XV años'], ['cumple', 'Cumpleaños'],
    ['bautismo', 'Bautizo'], ['comunion', 'Primera comunión'],
    ['babyshower', 'Baby shower'], ['graduacion', 'Graduación'],
    ['corporativo', 'Corporativo']
  ];
  /* las muestras visibles de un tipo (ids) */
  window.muestrasDeTipo = function (t) {
    var m = window.MUESTRAS_INVITAME || {};
    return Object.keys(m).filter(function (id) {
      return !m[id].oculto && (m[id].tipos || []).indexOf(t) >= 0;
    });
  };

  /* atajo comodo para los tres que la usan */
  window.muestraDe = function (id) {
    var m = window.MUESTRAS_INVITAME || {};
    return m[String(id || '').toLowerCase()] || null;
  };
})();
