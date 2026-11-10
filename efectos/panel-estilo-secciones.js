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

  var BASE_FONDO = [['color', 'Color de fondo de la sección', 'fondo'], ['imagen', 'Imagen de fondo de la sección', 'imagen']];
  var BASE_TIT = [['fuente', 'Tipografía del título', 'fuente'], ['rango', 'Tamaño del título', 'tamTitulo', 16, 64, 'px'],
    ['color', 'Color del título', 'colorTitulo'], ['color', 'Color del subtítulo (arriba del título)', 'colorSub']];

  var BLOQUES = [
    { key: 'carta', tab: 'EFECTOS', casa: 'estilo-carta', lugar: { abajo: true }, titulo: 'Carta · diseño (fondo, hoja, letra y colores)',
      campos: BASE_FONDO.concat(BASE_TIT, [['color', 'Color de la hoja', 'hoja'], ['color', 'Color del encabezado de la hoja', 'colorTituloHoja'],
        ['color', 'Color del texto de la hoja', 'colorTexto'], ['rango', 'Tamaño del texto de la hoja', 'tamTexto', 11, 24, 'px'],
        ['casilla', 'Sobre de adelante sin transparencia (la hoja no se ve a través)', 'bolsilloOpaco'],
        /* 9/11 (Maki): «una carta para ti con todo un texto y después el sobre: las dos cosas juntas no» */
        ['casilla', 'Sin la frase arriba del sobre (sólo la carta)', 'sinFrase']]) },
    { key: 'scratch', tab: 'EFECTOS', casa: 'estilo-scratch', lugar: { abajo: true }, titulo: 'Raspadita · diseño (textos de arriba, fondo y colores)',
      campos: BASE_FONDO.concat(BASE_TIT, [['color', 'Color de la ayuda («Empieza por el día»)', 'colorTexto'], ['color', 'Color de los números que se revelan', 'colorNumeros']]) },
    { key: 'hospedaje', tab: 'LUGAR_VEST', casa: 'estilo-hospedaje', lugar: { antesDe: '#f-titulo-hoteles' }, titulo: 'Hospedaje · diseño (fondo, letra y colores)',
      campos: BASE_FONDO.concat(BASE_TIT, [['color', 'Color del texto', 'colorTexto'], ['rango', 'Tamaño del texto', 'tamTexto', 11, 24, 'px'],
        ['color', 'Color del nombre del hotel', 'colorNombre'], ['color', 'Color de la descripción del hotel', 'colorDesc'],
        ['color', 'Color de la tarjeta del hotel', 'tarjeta'], ['rango', 'Transparencia de la tarjeta', 'tarjetaOpaca', 0, 100, '%']]) },
    { key: 'itinerario', tab: 'LUGAR_VEST', casa: 'itinerario', titulo: 'Itinerario · colores por separado (horario, momento y descripción)',
      campos: BASE_TIT.concat([['color', 'Color del horario (17:00)', 'colorHora'], ['color', 'Color del nombre del momento (Ceremonia)', 'colorNombre'],
        ['color', 'Color de la descripción', 'colorDesc'],
        /* 5/11 (Chris y Adreily): «no quiere un borde cuadrado y otro curvo» */
        ['rango', 'Esquinas redondeadas del recuadro', 'radio', 0, 48, 'px'],
        /* 9/11 (Maki, renata platinum): «no podés poner esos tres circulitos básicos» */
        ['imagen', 'Medallón (foto redonda con el objeto al medio): reemplaza los puntitos del itinerario y el adorno de los títulos, y va arriba del pase', 'medallon']]) },
    { key: 'padres', tab: 'PERSONAS', casa: 'estilo-padres', lugar: { arriba: true }, titulo: 'Personas · diseño (tamaño de las fotos, letra y colores)',
      campos: [['rango', 'Tamaño de las fotos (250 = como la plataforma vieja)', 'fotoTam', 60, 250, 'px']].concat(BASE_FONDO, BASE_TIT,
        [['color', 'Color de los nombres', 'colorNombre'], ['color', 'Color de la relación (Padres de…)', 'colorRel'], ['color', 'Color de la frase', 'colorTexto']]) },
    { key: 'hashtag', tab: 'GALERIA_INSTA_VID', casa: 'estilo-hashtag', lugar: { arriba: true }, titulo: 'Instagram · títulos, diseño (logo, letra y colores)',
      /* 6/11 (Jazmín, Alejandra): «hay que cambiarle el título al sector de insta, dice "Nuestro hashtag"» */
      campos: [['texto', 'Título de la sección (dice «Nuestro Hashtag»)', 'titulo'], ['texto', 'Sobretítulo (arriba del título)', 'sobretitulo']].concat(BASE_FONDO, BASE_TIT, [['color', 'Color de la frase', 'colorTexto'], ['color', 'Color del hashtag', 'colorHashtag'],
        ['color', 'Color del logo de Instagram', 'colorLogo'], ['casilla', 'Sin el logo de Instagram', 'sinLogo']]) },
    /* 9/11 (Jazmín, Alejandra): el texto de abajo del título y el fondo de la trivia.
       El sobretítulo y los colores del título ya tienen campo en TRIVIA: no se repiten. */
    { key: 'trivia', tab: 'TRIVIA', casa: 'estilo-trivia', lugar: { abajo: true }, titulo: 'Trivia · título, texto de abajo y fondo',
      campos: [['texto', 'Título (dice «Trivia»)', 'titulo'], ['texto', 'Texto debajo del título («¿Cuánto conoces…?»)', 'bajada']].concat(BASE_FONDO,
        [['fuente', 'Tipografía del título', 'fuente'], ['rango', 'Tamaño del título', 'tamTitulo', 16, 64, 'px'], ['color', 'Color del texto de abajo', 'colorTexto']]) },
    /* 9/11 (Maki, isabela platinum): «mejorá el diseño del "Con cariño, te esperamos" y la parte del QR».
       Lo pinta /efectos/pase-qr-fino.js; sin la casilla no cambia nada. */
    { key: 'pase', tab: 'MUSIC_PASES', casa: 'estilo-pase', lugar: { abajo: true }, titulo: 'Pase con QR · diseño de la tarjeta',
      campos: [['casilla', 'Diseño fino de la tarjeta (papel con filete, QR enmarcado, letra de la invitación)', 'tarjetaFina'],
        ['color', 'Color del filete y los detalles', 'colorFilete'], ['color', 'Color del papel de la tarjeta', 'tarjeta']] },
    /* 10/11 (Línea Roja · White Swan): portada en video oscuro, la letra va limpia
       sobre el terciopelo. Lo pinta /efectos/portada-limpia.js; sin la casilla no cambia nada. */
    { key: 'portada', tab: 'PRINCIPAL', casa: 'estilo-portada', lugar: { abajo: true }, titulo: 'Portada · letra limpia sobre la foto o el video',
      campos: [['casilla', 'Sin el velo claro detrás de los nombres (para portadas oscuras: terciopelo, noche)', 'sinVelo'],
        ['fuente', 'Letra de los nombres', 'fuenteNombres'], ['rango', 'Tamaño de los nombres', 'tamNombres', 24, 72, 'px'],
        ['color', 'Color de los nombres y la fecha', 'colorNombres'],
        /* 10/11 (Pasarela): letra clara sobre un panel plateado de gris medio */
        ['casilla', 'Sombra suave detrás de la letra (para fondos de gris medio)', 'sombra']] },
    /* 10/11 (Línea Roja · White Swan): la letra de Marfil en carmesí. Lo pinta /efectos/marfil-tinta.js. */
    { key: 'marfil', tab: 'PRINCIPAL', casa: 'estilo-marfil', lugar: { abajo: true }, titulo: 'Colección Marfil · color de la tinta',
      campos: [['color', 'Color de toda la letra (vacío = el gris de Marfil)', 'tinta']] },
    { key: 'footer', tab: 'PRINCIPAL', casa: 'cierre', titulo: 'Cierre · letra y colores de la frase y del texto final',
      campos: [['fuente', 'Letra de la frase grande (¡Gracias!)', 'fuenteFrase'], ['color', 'Color de la frase grande', 'colorFrase'],
        ['fuente', 'Letra del texto final (el largo)', 'fuenteTexto'], ['color', 'Color del texto final', 'colorTextoFinal'],
        ['casilla', 'Texto final sin mayúsculas (para letras cursivas)', 'textoSinMayus']] }
  ];

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
        titulo: 'Portada · color de la foto',
        campos: [['casilla', 'Foto de portada A COLOR (la colección Perlas la pone en blanco y negro)', 'color']],
        obj: function (d) {
          if (!d.fx) d.fx = {};
          if (!d.fx.portadaFoto || typeof d.fx.portadaFoto !== 'object') d.fx.portadaFoto = {};
          return d.fx.portadaFoto;
        }
      })];
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
        return [S.estilo(caja, 'estiloSec', {
          titulo: b.titulo,
          campos: b.campos,
          obj: function (d) {
            if (!d.fx) d.fx = {};
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
