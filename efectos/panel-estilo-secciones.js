/* ===== PANEL · «Diseño de la sección» en carta, raspadita, hospedaje, personas,
   itinerario, Instagram y cierre (4/11/2026) ===================================
   Escribe fx.estiloSec.<seccion>; lo pinta /efectos/estilo-secciones.js.
   Usa el mismo desplegable que el menú (INVSN.estilo, de secciones-nuevas.js),
   con los controles propios de cada sección. Cada control tiene «Como viene».
   Cada bloque va en la pestaña de su sección (INVSN.anotarCasa).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPanelEstiloSec) return; window.__invPanelEstiloSec = 1;
  if (/^\/i\//.test(location.pathname)) return;

  var BASE_FONDO = [['color', 'Color de fondo de la sección', 'fondo'], ['imagen', 'Imagen de fondo de la sección', 'imagen'],
    /* ★ 19/11 (Jazmín, ana-patricia-y-aldo: «en el fondo de familia y hospedaje se ven las imágenes predeterminadas de la muestra, no sé cómo sacarlas») */
    ['casilla', 'Sin el dibujo del diseño en el fondo (flores, texturas de la colección): queda liso', 'sinDiseno']];
  var BASE_TIT = [['fuente', 'Tipografía del título', 'fuente'], ['rango', 'Tamaño del título', 'tamTitulo', 16, 64, 'px'],
    ['color', 'Color del título', 'colorTitulo'], ['color', 'Color del subtítulo (arriba del título)', 'colorSub'],
    /* ★ 26/11 (Dalia Ivonne): el subtítulo más grande */
    ['rango', 'Tamaño del subtítulo (arriba del título)', 'tamSub', 10, 36, 'px']];

  /* ★ 13/11 (Jazmín): sin título / sin sobretítulo de fábrica, en todas las secciones */
  var SIN_TIT = [['casilla', 'Sin título (no mostrar el título de esta sección)', 'sinTitulo'],
    ['casilla', 'Sin sobretítulo (no mostrar el texto chico de arriba del título)', 'sinSub']];
  var GEN = function (extra) { return SIN_TIT.concat(BASE_FONDO, BASE_TIT,
    [['color', 'Color del texto', 'colorTexto'], ['rango', 'Tamaño del texto', 'tamTexto', 11, 24, 'px']], extra || []); };
  var BLOQUES = [
    { key: 'eventos', tab: 'LUGAR_VEST', casa: 'eventos', titulo: 'Dónde y cuándo · diseño (fondo, letra, colores, sin título, renglones)',
      campos: [['casilla', 'Respetar los renglones (Enter) de la descripción y poner la dirección en un renglón aparte', 'renglones'],
        /* ★ 20/11 (cesar-helene 05-01 y 09-01): en los boletos la línea punteada cruzaba «CEREMONIA» y las direcciones */
        ['casilla', 'Boletos (Pase de abordar): la línea punteada va entre la foto y el texto, sin cruzar letras (también en los hoteles)', 'corteJusto'],
        /* ★ 23/11 (Jazmín, Promo 2026): «Ver mapa» → «Cómo llegar», «Agendar» → «Agendar la fecha», uno abajo del otro, fecha más grande. Lo hace /efectos/eventos-acceso.js */
        ['texto', 'Texto del botón del mapa (vacío = «Ver mapa»; ej. Cómo llegar)', 'txtMapa'],
        ['texto', 'Texto del botón de agendar (vacío = «Agendar»; ej. Agendar la fecha)', 'txtAgendar'],
        ['casilla', 'Botones uno debajo del otro (no uno al lado del otro)', 'apilados'],
        /* ★ 26/11 (Jazmín, CUHE: «necesito sacar el botón de agendar, no lo quiere el cliente») */
        ['casilla', 'Sin el botón de agendar', 'sinAgendar'],
        ['rango', 'Tamaño de la fecha y la hora (van en su renglón, en negrita)', 'tamFecha', 12, 34, 'px'],
        ['color', 'Color de la fecha y la hora', 'colorFecha']].concat(GEN()) },
    { key: 'dresscode', tab: 'LUGAR_VEST', casa: 'vestimenta', titulo: 'Vestimenta · diseño (fondo, letra, colores, sin título)', campos: GEN() },
    { key: 'galeria', tab: 'GALERIA_INSTA_VID', casa: 'estilo-galeria', lugar: { arriba: true }, titulo: 'Galería · diseño (fondo, letra, colores, sin título)', campos: GEN() },
    { key: 'video', tab: 'GALERIA_INSTA_VID', casa: 'estilo-video', lugar: { abajo: true }, titulo: 'Nuestro video · diseño (fondo, letra, colores, sin título)', campos: GEN() },
    { key: 'spotify', tab: 'MUSIC_PASES', casa: 'estilo-spotify', lugar: { abajo: true }, titulo: 'Playlist · diseño (fondo, letra, colores, sin título)', campos: GEN() },
    { key: 'regalos', tab: 'REGALOS', casa: 'regalo', titulo: 'Mesa de regalos · diseño (fondo, letra, colores, sin título)', campos: GEN() },
    { key: 'confirmacion', tab: 'CONFIRMACIÓN', casa: 'confirmacion', titulo: 'Confirmar asistencia · diseño (fondo, letra, colores, sin título, sin formulario)',
      /* ★ 23/11 (Jazmín, Promo 2026): «en vez de confirmar asistencia, porque no lo vamos a tener: TU ACCESO A LA FIESTA…». El título se cambia en «CONFIRMAR ASISTENCIA (MENÚ Y TITULOS)» */
      campos: [['casilla', 'Sin confirmación: esconder el formulario (y el aviso del link personal)', 'sinRsvp'],
        ['texto', 'Texto que va en su lugar (ej. La pulsera de acceso se entregará en la entrada del evento…)', 'textoPropio'],
        ['fuente', 'Tipografía de ese texto', 'fuenteTexto']].concat(GEN()) },
    { key: 'clima', tab: 'LUGAR_VEST', casa: 'estilo-clima', lugar: { abajo: true }, titulo: 'Clima · diseño (fondo, letra, colores, sin título, lugar y botón)',
      /* ★ 20/11 (cesar-helene 11): el clima del lugar de la fiesta, con su nombre y un botón al pronóstico (Yr). Lo pinta /efectos/clima-extra.js */
      campos: [['texto', 'Lugar que se muestra (ej. Ebberup, Dinamarca)', 'lugar'],
        ['texto', 'Coordenadas del clima (ej. 55.1023, 10.0371 · vacío = las del mapa de la ceremonia)', 'coords'],
        ['texto', 'Link del botón (ej. el pronóstico de Yr) · sin link no hay botón', 'link'],
        ['texto', 'Texto del botón (vacío = «Ver pronóstico»)', 'boton'],
        ['texto', 'Texto descriptivo antes del botón (ej. Te recomendamos revisar el pronóstico unos días antes…)', 'texto']].concat(GEN()) },
    { key: 'filtro', tab: 'EFECTOS', casa: 'estilo-filtro', lugar: { abajo: true }, titulo: 'El filtro · diseño (letra, colores, tamaño, sin título)', campos: GEN() },
    { key: 'live', tab: 'EFECTOS', casa: 'estilo-live', lugar: { abajo: true }, titulo: 'Las fotos de la fiesta (Live) · diseño (letra, colores, tamaño, sin título)', campos: GEN() },
    { key: 'contacto', tab: 'CONFIRMACIÓN', casa: 'estilo-contacto', lugar: { abajo: true }, titulo: '¿Alguna duda? · diseño (fondo, letra, colores, sin título)', campos: GEN() },
    { key: 'carta', tab: 'EFECTOS', casa: 'estilo-carta', lugar: { abajo: true }, titulo: 'Carta · diseño (fondo, hoja, letra y colores)',
      campos: SIN_TIT.concat(BASE_FONDO.concat(BASE_TIT, [['color', 'Color de la hoja', 'hoja'], ['color', 'Color del encabezado de la hoja', 'colorTituloHoja'],
        ['color', 'Color del texto de la hoja', 'colorTexto'], ['rango', 'Tamaño del texto de la hoja', 'tamTexto', 11, 24, 'px'],
        ['casilla', 'Sobre de adelante sin transparencia (la hoja no se ve a través)', 'bolsilloOpaco'],
        /* 9/11 (Maki): «una carta para ti con todo un texto y después el sobre: las dos cosas juntas no» */
        ['casilla', 'Sin la frase arriba del sobre (sólo la carta)', 'sinFrase'],
        /* ★ 25/11 (Jazmín, Diego y Sofía: «quiere la frase arriba de la carta pero no me deja subirla»). Lo hace /efectos/carta-con-frase.js */
        ['casilla', 'La frase va ARRIBA de la carta (antes de «Con cariño · Una carta para ti»)', 'fraseArriba']])) },
    { key: 'scratch', tab: 'EFECTOS', casa: 'estilo-scratch', lugar: { abajo: true }, titulo: 'Raspadita · diseño (textos de arriba, fondo y colores)',
      campos: SIN_TIT.concat(BASE_FONDO.concat(BASE_TIT, [['color', 'Color de la ayuda («Empieza por el día»)', 'colorTexto'], ['color', 'Color de los números que se revelan', 'colorNumeros'],
        /* ★ 26/11 (Jazmín, Ana Patricia & Aldo: «no quiere la raspadita, pero quiere que se vea así la fecha»). Lo hace /efectos/fecha-sin-raspar.js */
        ['casilla', 'La fecha se ve sin raspar (sin «Raspa para revelar»)', 'sinRaspar']])) },
    { key: 'hospedaje', tab: 'LUGAR_VEST', casa: 'estilo-hospedaje', lugar: { antesDe: '#f-titulo-hoteles' }, titulo: 'Hospedaje · diseño (fondo, letra y colores)',
      campos: SIN_TIT.concat(BASE_FONDO.concat(BASE_TIT, [['color', 'Color del texto', 'colorTexto'], ['rango', 'Tamaño del texto', 'tamTexto', 11, 24, 'px'],
        ['color', 'Color del nombre del hotel', 'colorNombre'], ['color', 'Color de la descripción del hotel', 'colorDesc'],
        ['color', 'Color de la tarjeta del hotel', 'tarjeta'], ['rango', 'Transparencia de la tarjeta', 'tarjetaOpaca', 0, 100, '%']])) },
    { key: 'itinerario', tab: 'LUGAR_VEST', casa: 'itinerario', titulo: 'Itinerario · colores por separado (horario, momento y descripción)',
      campos: SIN_TIT.concat(BASE_TIT).concat([['color', 'Color del horario (17:00)', 'colorHora'], ['color', 'Color del nombre del momento (Ceremonia)', 'colorNombre'],
        ['color', 'Color de la descripción', 'colorDesc'],
        /* ★ 26/11 (Dalia Ivonne): el color de los iconitos */
        ['color', 'Color de los iconos', 'colorIcono'],
        /* ★ 26/11 (Paulette & German): la imagen del itinerario recta y sin marco */
        ['casilla', 'Imagen del itinerario derecha (sin inclinación)', 'imgRecta'],
        ['casilla', 'Imagen del itinerario sin marco ni sombra', 'imgSinBorde'],
        /* 12/11 (Jazmín): «cambiar tamaño y letra del itinerario, no el título, sí los detalles y horario» */
        ['fuente', 'Tipografía del horario y momento (11:00 am · Misa)', 'fuenteHora'], ['rango', 'Tamaño del horario y momento', 'tamHora', 10, 36, 'px'],
        ['fuente', 'Tipografía de la descripción', 'fuenteDesc'], ['rango', 'Tamaño de la descripción', 'tamDesc', 10, 30, 'px'],
        /* 5/11 (Chris y Adreily): «no quiere un borde cuadrado y otro curvo» */
        ['rango', 'Esquinas redondeadas del recuadro', 'radio', 0, 48, 'px'],
        /* 9/11 (Maki, renata platinum): «no podés poner esos tres circulitos básicos» */
        ['imagen', 'Medallón (foto redonda con el objeto al medio): reemplaza los puntitos del itinerario y el adorno de los títulos, y va arriba del pase', 'medallon']]) },
    { key: 'padres', tab: 'PERSONAS', casa: 'estilo-padres', lugar: { arriba: true }, titulo: 'Personas · diseño (tamaño de las fotos, letra y colores)',
      campos: SIN_TIT.concat([['rango', 'Tamaño de las fotos (250 = como la plataforma vieja)', 'fotoTam', 60, 250, 'px']].concat(BASE_FONDO, BASE_TIT,
        [['color', 'Color de los nombres', 'colorNombre'], ['color', 'Color de la relación (Padres de…)', 'colorRel'], ['color', 'Color de la frase', 'colorTexto']])) },
    { key: 'hashtag', tab: 'GALERIA_INSTA_VID', casa: 'estilo-hashtag', lugar: { arriba: true }, titulo: 'Instagram · títulos, diseño (logo, letra y colores)',
      /* 6/11 (Jazmín, Alejandra): «hay que cambiarle el título al sector de insta, dice "Nuestro hashtag"» */
      campos: SIN_TIT.concat([['texto', 'Título de la sección (dice «Nuestro Hashtag»)', 'titulo'], ['texto', 'Sobretítulo (arriba del título)', 'sobretitulo']].concat(BASE_FONDO, BASE_TIT, [['color', 'Color de la frase', 'colorTexto'], ['color', 'Color del hashtag', 'colorHashtag'],
        ['color', 'Color del logo de Instagram', 'colorLogo'], ['casilla', 'Sin el logo de Instagram', 'sinLogo'],
        /* ★ 18/11 (Jazmín, festival-instituto-toluca): el hashtag también para Facebook (lo pinta efectos/hashtag-ajuste.js) */
        ['casilla', 'Sumar Facebook (logo, hashtag y botón «Ver en Facebook» debajo del de Instagram)', 'facebook'],
        ['texto', 'Hashtag de Facebook (vacío = el mismo de Instagram)', 'fbHashtag'],
        ['texto', 'Página de Facebook (link o nombre; vacío = abre la búsqueda del hashtag)', 'fbLink'],
        ['texto', 'Texto del botón de Facebook (vacío = «Ver en Facebook»)', 'fbBoton']])) },
    /* 9/11 (Jazmín, Alejandra): el texto de abajo del título y el fondo de la trivia.
       El sobretítulo y los colores del título ya tienen campo en TRIVIA: no se repiten. */
    { key: 'trivia', tab: 'TRIVIA', casa: 'estilo-trivia', lugar: { abajo: true }, titulo: 'Trivia · título, texto de abajo y fondo',
      campos: SIN_TIT.concat([['texto', 'Título (dice «Trivia»)', 'titulo'], ['texto', 'Texto debajo del título («¿Cuánto conoces…?»)', 'bajada']].concat(BASE_FONDO,
        [['fuente', 'Tipografía del título', 'fuente'], ['rango', 'Tamaño del título', 'tamTitulo', 16, 64, 'px'], ['color', 'Color del texto de abajo', 'colorTexto']])) },
    /* 9/11 (Maki, isabela platinum): «mejorá el diseño del "Con cariño, te esperamos" y la parte del QR».
       Lo pinta /efectos/pase-qr-fino.js; sin la casilla no cambia nada. */
    { key: 'pase', tab: 'MUSIC_PASES', casa: 'estilo-pase', lugar: { abajo: true }, titulo: 'Pase del invitado · diseño (título, fondo, letras, colores, qué datos se ven: nombre, personas, mesa — y pase al final)',
      campos: [['casilla', 'Diseño fino de la tarjeta (papel con filete, QR enmarcado, letra de la invitación)', 'tarjetaFina'],
        ['color', 'Color del filete y los detalles', 'colorFilete'], ['color', 'Color del papel de la tarjeta', 'tarjeta'],
        /* ★ 16/11 (Jazmín, zorely-y-fernando): título, fondo, letras, colores,
           tamaños, rótulos y sacar los datos que no quieran. Lo pinta
           /efectos/estilo-secciones.js (aplicarPase). */
        ['casilla', 'Sin título (no mostrar «Con cariño, te esperamos»)', 'sinTitulo'],
        ['texto', 'Título (vacío = «Con cariño, te esperamos»)', 'titulo'],
        ['fuente', 'Tipografía del título', 'fuente'], ['rango', 'Tamaño del título', 'tamTitulo', 14, 48, 'px'],
        ['color', 'Color del título', 'colorTitulo']].concat(BASE_FONDO, [
        /* ★ 20/11 (Jazmín, xv-ximena: «en el sector de pases se sigue viendo el iconito del diseño original» · «la imagen se ve cortada siendo horizontal») */
        ['casilla', 'Imagen de fondo ENTERA, sin recortar (para imágenes horizontales o con texto)', 'fondoEntero'],
        ['imagen', 'Sello o ícono de arriba de la tarjeta (vacío = el del diseño)', 'sello'],
        ['casilla', 'Sin sello ni ícono arriba de la tarjeta', 'sinSello'],
        /* ★ 20/11 (cesar-helene): sin QR y el nombre del invitado como protagonista */
        ['casilla', 'Sin el código QR (los datos se reacomodan al centro)', 'sinQR'],
        ['fuente', 'Tipografía del nombre del invitado (vacío = la de los datos)', 'fuenteNombre'],
        ['rango', 'Tamaño del nombre del invitado', 'tamNombre', 12, 56, 'px'],
        ['fuente', 'Tipografía de los datos (rótulos y valores)', 'fuenteDatos'],
        ['color', 'Color de los rótulos (NOMBRE, PERSONAS, MESA)', 'colorRotulos'], ['rango', 'Tamaño de los rótulos', 'tamRotulos', 8, 22, 'px'],
        ['color', 'Color de los datos (el nombre, la cantidad, la mesa)', 'colorDatos'], ['rango', 'Tamaño de los datos', 'tamDatos', 10, 32, 'px'],
        ['texto', 'Rótulo «Nombre» (vacío = como viene)', 'rotNombre'], ['texto', 'Rótulo «Personas» (vacío = como viene)', 'rotPersonas'],
        ['texto', 'Rótulo «Mesa» (vacío = como viene)', 'rotMesa'], ['texto', 'Rótulo «Estado del pase» (vacío = como viene)', 'rotEstado'],
        /* ★ 25/11 (Jazmín, xv-regina): la frase de abajo del pase (el mensaje para cada invitado) */
        ['fuente', 'Tipografía de la frase de abajo del pase (el mensaje para el invitado)', 'fuenteMensaje'],
        ['rango', 'Tamaño de la frase de abajo del pase', 'tamMensaje', 10, 32, 'px'],
        ['color', 'Color de la frase de abajo del pase', 'colorMensaje'],
        ['casilla', 'Sacar el nombre', 'sinNombre'], ['casilla', 'Sacar la cantidad de personas', 'sinPersonas'],
        ['casilla', 'Sacar la mesa', 'sinMesa'],
        /* ★ 24/11 (Jazmín, any-luismi): «que el sector de pases aparezca al final de la invitación». Lo hace /efectos/pase-al-final.js */
        ['casilla', 'Pase al final de la invitación (antes del pie)', 'alFinal'], ['casilla', 'Sacar el estado del pase («Habilitado»)', 'sinEstado']]) },
    /* 10/11 (Línea Roja · White Swan): portada en video oscuro, la letra va limpia
       sobre el terciopelo. Lo pinta /efectos/portada-limpia.js; sin la casilla no cambia nada. */
    /* ★ 24/11 (Jazmín: «esta muestra en dos idiomas, español e inglés»). Lo pinta /efectos/bilingue.js */
    { key: 'bilingue', tab: 'PRINCIPAL', casa: 'estilo-bilingue', lugar: { abajo: true }, titulo: 'Invitación en dos idiomas (cada texto con su traducción)',
      /* ⚠️ el armador de bloques NO lee `obj`: usa `objFx` (sin esto guardaba en fx.estiloSec.bilingue y la invitación no lo veía) */
      objFx: 'bilingue',
      campos: [['casilla', 'Prender: cada texto lleva su traducción debajo', 'on'],
        ['area', 'Traducciones, una por renglón: texto como se ve => traducción', 'trad',
          { traer: true, filas: 12, ayuda: 'Te esperamos => We look forward to seeing you\nConfirmar asistencia => RSVP' }]] },
    { key: 'portada', tab: 'PRINCIPAL', casa: 'estilo-portada', lugar: { abajo: true }, titulo: 'Portada · letra limpia sobre la foto o el video',
      campos: [['casilla', 'Sin el velo claro detrás de los nombres (para portadas oscuras: terciopelo, noche)', 'sinVelo'],
        ['fuente', 'Letra de los nombres', 'fuenteNombres'], ['rango', 'Tamaño de los nombres', 'tamNombres', 24, 72, 'px'],
        ['color', 'Color de los nombres y la fecha', 'colorNombres'],
        /* 10/11 (Pasarela): letra clara sobre un panel plateado de gris medio */
        ['casilla', 'Sombra suave detrás de la letra (para fondos de gris medio)', 'sombra'],
        /* 12/11 (Encaje y nácar): la portada es una foto CLARA de la tarjeta */
        ['casilla', 'Sin el oscurecido sobre la foto (para portadas claras, con letra oscura)', 'sinOscurecer'],
        /* 19/11 (Encaje y nácar): letra oscura con la sombra oscura de Marfil = borrosa */
        ['casilla', 'Sin sombra oscura en la letra (letra oscura sobre portada clara: queda nítida)', 'sinSombra'],
        /* 19/11 (Encaje y nácar): «sigue sin verse cuántos días, minutos y segundos faltan» */
        ['casilla', 'Cuenta regresiva bien visible (números más grandes, con recuadro claro)', 'cuentaVisible'],
        ['color', 'Color de la cuenta regresiva (vacío = el de los nombres)', 'colorCuenta'],
        /* ★ 20/11 (cesar-helene 01-03): «la cuenta regresiva debe ser menor que los nombres» */
        ['rango', 'Tamaño de la cuenta regresiva (100 = como viene · menos = más chica)', 'tamCuenta', 40, 130, '%'],
        /* ★ 23/11 (CUHE): «sacar directamente nombre y subtítulo para que quede solo la cuenta regresiva» (la foto ya trae el texto) */
        ['casilla', 'Sin el sobretítulo en la portada (el texto chico de arriba)', 'sinKick'],
        ['casilla', 'Sin los nombres en la portada (queda la foto y la cuenta regresiva)', 'sinNombres'],
        /* ★ 25/11 (Jazmín, Diego y Sofía): «no quiere cuenta regresiva». Lo aplica /efectos/portada-limpia.js */
        ['casilla', 'Sin la cuenta regresiva en la portada', 'sinCuenta'],
        ['casilla', 'Nombres como están escritos (sin pasarlos a mayúsculas)', 'nombresComoEstan'],
        /* ★ 20/11 (Diana XV): «quiere que en la portada aparezca también: Sábado 23 de enero de 2027 · 17:00hs» */
        ['casilla', 'Mostrar la fecha en la portada (día, fecha y hora)', 'fechaVer'],
        ['texto', 'Texto de la fecha en la portada (vacío = «Sábado 23 de enero de 2027 · 17:00 hs», sale de la fecha del evento)', 'fechaTexto'],
        /* ★ 21/11 (Jazmín): «que deje modificar: tipografía, tamaño, (arriba/centrado/abajo), color» */
        ['opciones', 'Dónde va la fecha', 'fechaPos', [['', 'Debajo de los nombres (como viene)'], ['arriba', 'Arriba de todo (antes del sobretítulo)'], ['abajo', 'Debajo de la cuenta regresiva']]],
        ['fuente', 'Letra de la fecha', 'fechaFuente'],
        ['rango', 'Tamaño de la fecha', 'fechaTam', 10, 40, 'px'],
        ['color', 'Color de la fecha (vacío = el de los nombres)', 'fechaColor']] },
    /* 10/11 (Línea Roja · White Swan): la letra de Marfil en carmesí. Lo pinta /efectos/marfil-tinta.js. */
    { key: 'marfil', tab: 'PRINCIPAL', casa: 'estilo-marfil', lugar: { abajo: true }, titulo: 'Colección Marfil · color de la tinta',
      campos: [['color', 'Color de toda la letra (vacío = el gris de Marfil)', 'tinta']] },
    /* 11/11 (Maki): «poner un texto en los papeles blancos» de los sobres en video
       (Línea Roja). Lo pinta /efectos/sobre-papel.js, sólo si el sobre elegido trae
       el papel medido (`papel` en sobres/catalogo.js). Sin la casilla no cambia nada. */
    /* ★ 26/11 (Jazmín, Dalia Ivonne: «¿se podrá en general hacer que los sobretítulos se hagan más grandes?»).
       Vale para todas las secciones; el tamaño de cada sección, si se pone, gana. Lo aplica /efectos/estilo-secciones.js */
    { key: 'todas', tab: 'PRINCIPAL', casa: 'diseno', titulo: 'Todas las secciones · subtítulos (el texto chico arriba de cada título)',
      campos: [['rango', 'Tamaño de los subtítulos en toda la invitación', 'tamSub', 10, 36, 'px'], ['color', 'Color de los subtítulos en toda la invitación', 'colorSub']] },
    { key: 'sobreTexto', tab: 'PRINCIPAL', casa: 'diseno', titulo: 'Sobre · texto impreso en la tarjeta del video (White Swan, Monogramme, Pasarela)',
      campos: [['casilla', 'Mostrar el texto en la tarjeta en blanco del sobre', 'on'],
        ['texto', 'Línea de arriba (vacío = la frase del sobre, ej. «Estás invitado a»)', 'l1'],
        ['texto', 'Nombres (vacío = los nombres de la invitación)', 'l2'],
        ['texto', 'Fecha (vacío = la fecha del evento, 16 · 10 · 2027)', 'l3'],
        ['fuente', 'Letra de los nombres (vacío = la del sobre)', 'fuente'], ['color', 'Color de la tinta (vacío = el del sobre)', 'color'],
        ['rango', 'Tamaño del texto', 'tam', 60, 140, '%']] },
    /* 12/11 (Jazmín): «el efecto de sobre, pero cuando lo abran aparezca esta imagen».
       Lo pinta /efectos/invitacion-imagen.js. Guarda en fx.invImagen (no en estiloSec). */
    { key: 'invImagen', objFx: 'invImagen', tab: 'PRINCIPAL', casa: 'diseno', titulo: 'Invitación en imagen (el sobre se abre y aparece la imagen del cliente)',
      campos: [['casilla', 'Usar la imagen del cliente como invitación (reemplaza toda la invitación)', 'on'],
        ['imagen', 'La imagen de la invitación (vertical, la que mandó el cliente)', 'url'],
        ['texto', 'WhatsApp para confirmar (vacío = el de Contacto)', 'wa'],
        ['texto', 'Mensaje que llega al confirmar (vacío = «¡Hola! Confirmo mi asistencia…»)', 'mensaje'],
        ['texto', 'Texto del botón de confirmar (vacío = «Confirmar asistencia»)', 'textoConfirmar'],
        ['texto', 'Ubicación: dirección o link de Google Maps (vacío = sin botón)', 'mapa'],
        ['casilla', 'Sin el botón de confirmar', 'sinConfirmar'],
        ['casilla', 'Sin el botón de descargar', 'sinDescarga']] },
    /* 19/11 (Jazmín, Any y Luismi): «en vez del sobre, que aparezca esa imagen como inicio».
       Lo pinta /efectos/entrada-imagen.js. Guarda en fx.entradaImagen. */
    { key: 'entradaImagen', objFx: 'entradaImagen', tab: 'PRINCIPAL', casa: 'diseno', titulo: 'Entrada con imagen (en vez del sobre, la imagen del cliente: se toca y se abre la invitación)',
      campos: [['casilla', 'Usar la imagen del cliente como entrada (reemplaza al sobre)', 'on'],
        ['imagen', 'La imagen de entrada (vertical, la que mandó el cliente)', 'url'],
        ['casilla', 'Que llene toda la pantalla (si no, se ve entera con el fondo desenfocado)', 'llenar'],
        ['casilla', 'Sumar abajo la pastilla «Toca para abrir» (si la imagen no lo dice)', 'aviso']] },
    { key: 'footer', tab: 'PRINCIPAL', casa: 'cierre', titulo: 'Cierre · letra y colores de la frase y del texto final',
      campos: [['fuente', 'Letra de la frase grande (¡Gracias!)', 'fuenteFrase'], ['color', 'Color de la frase grande', 'colorFrase'],
        ['fuente', 'Letra del texto final (el largo)', 'fuenteTexto'], ['color', 'Color del texto final', 'colorTextoFinal'],
        /* ★ 24/11 (Jazmín, Valentina: el sombreado del texto final lo hace ilegible) */
        ['casilla', 'Sin sombra en la frase y el texto final (letra limpia)', 'sinSombraTexto'],
        ['casilla', 'Texto final sin mayúsculas (para letras cursivas)', 'textoSinMayus'],
        /* 16/11 (Jazmín): «en la foto final no se puede quitar el filtro» */
        ['casilla', 'Foto final sin filtro (sin el oscurecido encima de la foto)', 'sinFiltro'],
        /* 18/11 (Jazmín, festival-instituto-toluca): «la foto final completa y sin el texto predeterminado» */
        ['casilla', 'Foto final ENTERA, sin recortar (para afiches o fotos con su propio texto)', 'fotoEntera'],
        ['casilla', 'Sin el texto del cierre (frase, texto final y nombres/fecha)', 'sinTexto']] }
  ];

  /* ★ 14/11 (Jazmín: «Ver hoteles» ilegible y «eso no me deja modificarlo el
     panel»). Toda sección que tenga botones lleva el color de sus botones y de
     su letra. Lo aplica /efectos/estilo-secciones.js. */
  var CON_BOTONES = { eventos: 1, hospedaje: 1, dresscode: 1, galeria: 1, video: 1, spotify: 1, regalos: 1, confirmacion: 1,
    clima: 1, contacto: 1, filtro: 1, live: 1, trivia: 1, hashtag: 1, carta: 1 };
  BLOQUES.forEach(function (b) {
    if (!CON_BOTONES[b.key] || !b.campos) return;
    b.campos = b.campos.concat([['color', 'Color de los botones de esta sección', 'botonFondo'], ['color', 'Color de la letra de los botones', 'botonLetra']]);
  });

  /* 9/11 (Jazmín, Melany): «No pueden modificar la imagen de PLAYLIST».
     La tapa de la playlist y la de «Nuestro video» las pone la colección;
     /efectos/tapas-foto.js ya sabía pintar una propia (fx.tapas.playlist /
     fx.tapas.video) pero no había control en el panel. Ahora sí. */
  var TAPAS = [
    { id: 'tapa-playlist', tab: 'MUSIC_PASES', casa: 'tapa-playlist', ve: '#spotify-sec', titulo: 'Playlist · imagen de la tapa',
      campos: [['imagen', 'Imagen de la tapa de la playlist (reemplaza la de la colección; se recorta sola al centro)', 'playlist']] },
    { id: 'tapa-video', tab: 'GALERIA_INSTA_VID', casa: 'tapa-video', ve: '#video-sec', titulo: 'Nuestro video · imagen de la tapa',
      campos: [['imagen', 'Imagen de la tapa del video (reemplaza la de la colección; se recorta sola al centro)', 'video']] }
  ];

  function arrancar() {
    var S = window.INVSN;
    if (!S || !S.estilo || !S.bloque) { setTimeout(arrancar, 300); return; }
    /* 10/11 (Jazmín, jakzirhy-y-alexis): «la portada en blanco y negro y no
       encuentran dónde modificarlo». La colección Perlas pinta la foto de
       portada en blanco y negro; ahora se puede dejar a color. */
    S.anotarCasa('portada-color', 'PRINCIPAL', 'portada', { antesDe: '#f-frase-larga' }, '.portada');
    S.bloque('portada-color', function (caja) {
      return [S.estilo(caja, 'portadaFoto', {
        titulo: 'Portada · foto y sobretítulo',
        campos: [['casilla', 'Foto de portada A COLOR (la colección Perlas la pone en blanco y negro)', 'color'],
          ['casilla', 'Foto de portada QUIETA, sin zoom (que no se agrande: lo que encuadrás es lo que se ve)', 'sinZoom'],
          ['casilla', 'Foto de portada ENTERA, sin recortar (para fotos horizontales; el resto se rellena con la misma foto desenfocada)', 'entera'],
          ['rango', 'Velo oscuro sobre la foto (0 = la foto con su color normal)', 'velo', 0, 100, '%'],
          /* ★ 18/11 (Jazmín, indira-y-rogelio: «baja demasiado o sube demasiado… para que
             podamos seleccionar el lugar exacto de acuerdo al fondo»). Lo aplica /efectos/ajuste-altura.js */
          ['rango', 'Subir o bajar los nombres, al lugar exacto (− sube · + baja · 0 = donde los deja Arriba/Centrado/Abajo)', 'alturaNombres', -350, 700, 'px'],
          /* ★ 19/11 (Maki, jardin-de-papel: «la cuenta regresiva tiene que estar más abajo»). Lo aplica /efectos/ajuste-altura.js */
          ['rango', 'Subir o bajar SOLO la cuenta regresiva (− sube · + baja · 0 = pegada a los nombres)', 'alturaCuenta', -350, 500, 'px'],
          ['rango', 'Tamaño del sobretítulo (ej. «XV Años»)', 'tamKick', 9, 40, 'px'],
          ['color', 'Color del sobretítulo', 'colorKick']],
        obj: function (d) {
          if (!d.fx) d.fx = {};
          if (!d.fx.portadaFoto || typeof d.fx.portadaFoto !== 'object') d.fx.portadaFoto = {};
          return d.fx.portadaFoto;
        }
      })];
    });
    /* ★ 18/11 (Jazmín, indira-y-rogelio): la frase larga también al lugar exacto */
    S.anotarCasa('frase-altura', 'PRINCIPAL', 'frase', null, '.fraseSec');
    S.bloque('frase-altura', function (caja) {
      return [S.estilo(caja, 'frase', {
        titulo: 'Frase larga · subir o bajar el texto al lugar exacto',
        campos: [['rango', 'Subir o bajar la frase (− sube · + baja · 0 = donde la deja Arriba/Centro/Abajo)', 'altura', -300, 300, 'px']],
        obj: function (d) { if (!d.fx) d.fx = {}; if (!d.fx.frase || typeof d.fx.frase !== 'object') d.fx.frase = {}; return d.fx.frase; }
      })];
    });
    /* ★ 12/11 (Jazmín, xv-maria-ines): «sacar los íconos predeterminados del dress code» */
    S.anotarCasa('dresscode-dibujos', 'LUGAR_VEST', 'dresscode', { antesDe: '#f-dresscode-texto' }, '[data-sec=dresscode]');
    S.bloque('dresscode-dibujos', function (caja) {
      /* ★ 12/11 (Jazmín): «diferentes opciones para colocar en el sector de código de
         vestimenta… que no haya tantas, que sea como los sobres y los regalitos» y
         Maki: «mejor que puedas vos cargar las que quieran además del catálogo».
         fx.dresscodeOpc = { dibujo: ''|'sin'|<id del catálogo>|'propia', url } */
      var OPC = window.INVDRESS_CATALOGO || [];
      var h = document.createElement('div');
      h.innerHTML = '<div style="font-weight:700;margin-bottom:4px">Vestimenta · dibujo</div>' +
        '<div class="hint" style="margin-bottom:8px">Elegí el dibujo que va arriba del texto, sacalo, o subí una imagen propia.</div>';
      caja.appendChild(h);
      var g = document.createElement('div'); g.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px';
      caja.appendChild(g);
      var btns = [];
      function opc() { var d = S.borrador(); if (!d) return null; if (!d.fx) d.fx = {}; if (!d.fx.dresscodeOpc || typeof d.fx.dresscodeOpc !== 'object') d.fx.dresscodeOpc = {}; return d.fx.dresscodeOpc; }
      function actual(o) { return o.dibujo || (o.sin === true ? 'sin' : ''); }
      function boton(id, rot, img) {
        var b = document.createElement('button'); b.type = 'button';
        b.style.cssText = 'border:1px solid #d9cbbf;border-radius:10px;background:#fff;padding:6px;cursor:pointer;font-size:11px;line-height:1.2;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:86px;justify-content:center';
        b.innerHTML = (img ? '<img src="' + img + '" style="height:54px;max-width:100%;object-fit:contain">' : '') + '<span>' + rot + '</span>';
        b.onclick = function () { var o = opc(); if (!o) return; o.dibujo = id; o.sin = (id === 'sin'); S.refrescar(); sync(); };
        b.__id = id; btns.push(b); g.appendChild(b);
      }
      boton('', 'El de siempre (traje y vestido)');
      boton('sin', 'Sin dibujo (sólo texto)');
      OPC.forEach(function (o) { boton(o.id, o.nombre, o.url); });
      var up = document.createElement('div'); up.style.cssText = 'margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap';
      var bu = document.createElement('button'); bu.type = 'button'; bu.className = 'addbtn gh'; bu.style.cssText = 'padding:6px 12px;font-size:12px'; bu.textContent = 'Subir mi propia imagen';
      var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
      var pv = document.createElement('img'); pv.style.cssText = 'height:44px;border-radius:6px;display:none';
      bu.onclick = function () { fi.click(); };
      fi.onchange = async function () {
        var f = fi.files && fi.files[0]; if (!f) return;
        if (!window.INV || !INV.uploadImage) { alert('Todavía no cargó la base. Esperá 2 seg.'); return; }
        bu.textContent = 'Subiendo…';
        try { var u = await INV.uploadImage(f); var o = opc(); o.url = u; o.dibujo = 'propia'; o.sin = false; S.refrescar(); }
        catch (e) { alert('No se pudo subir: ' + (e.message || e)); }
        bu.textContent = 'Subir mi propia imagen'; sync();
      };
      up.appendChild(bu); up.appendChild(fi); up.appendChild(pv); caja.appendChild(up);
      function sync() {
        var o = opc() || {}, a = actual(o);
        btns.forEach(function (b) { var on = b.__id === a; b.style.borderColor = on ? '#b06a7e' : '#d9cbbf'; b.style.boxShadow = on ? '0 0 0 2px rgba(176,106,126,.35)' : 'none'; });
        if (o.url) { pv.src = o.url; pv.style.display = ''; pv.style.outline = a === 'propia' ? '2px solid #b06a7e' : 'none'; pv.title = 'Tocá para usarla'; pv.onclick = function () { o.dibujo = 'propia'; o.sin = false; S.refrescar(); sync(); }; }
        else pv.style.display = 'none';
      }
      return [sync];
    });
    TAPAS.forEach(function (t) {
      S.anotarCasa(t.id, t.tab, t.casa, { abajo: true }, t.ve);
      S.bloque(t.id, function (caja) {
        return [S.estilo(caja, 'tapas', {
          titulo: t.titulo,
          campos: t.campos,
          obj: function (d) {
            if (!d.fx) d.fx = {};
            if (!d.fx.tapas || typeof d.fx.tapas !== 'object') d.fx.tapas = {};
            return d.fx.tapas;
          }
        })];
      });
    });
    BLOQUES.forEach(function (b) {
      var id = 'estilo-sec-' + b.key;
      S.anotarCasa(id, b.tab, b.casa, b.lugar, '[data-sec="' + b.key + '"]');
      S.bloque(id, function (caja) {
        return [S.estilo(caja, b.objFx || 'estiloSec', {
          titulo: b.titulo,
          campos: b.campos,
          obj: function (d) {
            if (!d.fx) d.fx = {};
            if (b.objFx) {
              if (!d.fx[b.objFx] || typeof d.fx[b.objFx] !== 'object') d.fx[b.objFx] = {};
              return d.fx[b.objFx];
            }
            if (!d.fx.estiloSec || typeof d.fx.estiloSec !== 'object') d.fx.estiloSec = {};
            if (!d.fx.estiloSec[b.key] || typeof d.fx.estiloSec[b.key] !== 'object') d.fx.estiloSec[b.key] = {};
            return d.fx.estiloSec[b.key];
          }
        })];
      });
    });
  }
  arrancar();
})();
