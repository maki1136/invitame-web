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
        ['casilla', 'Sobre de adelante sin transparencia (la hoja no se ve a través)', 'bolsilloOpaco']]) },
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
        ['rango', 'Esquinas redondeadas del recuadro', 'radio', 0, 48, 'px']]) },
    { key: 'padres', tab: 'PERSONAS', casa: 'estilo-padres', lugar: { arriba: true }, titulo: 'Personas · diseño (tamaño de las fotos, letra y colores)',
      campos: [['rango', 'Tamaño de las fotos (250 = como la plataforma vieja)', 'fotoTam', 60, 250, 'px']].concat(BASE_FONDO, BASE_TIT,
        [['color', 'Color de los nombres', 'colorNombre'], ['color', 'Color de la relación (Padres de…)', 'colorRel'], ['color', 'Color de la frase', 'colorTexto']]) },
    { key: 'hashtag', tab: 'GALERIA_INSTA_VID', casa: 'estilo-hashtag', lugar: { arriba: true }, titulo: 'Instagram · títulos, diseño (logo, letra y colores)',
      /* 6/11 (Jazmín, Alejandra): «hay que cambiarle el título al sector de insta, dice "Nuestro hashtag"» */
      campos: [['texto', 'Título de la sección (dice «Nuestro Hashtag»)', 'titulo'], ['texto', 'Sobretítulo (arriba del título)', 'sobretitulo']].concat(BASE_FONDO, BASE_TIT, [['color', 'Color de la frase', 'colorTexto'], ['color', 'Color del hashtag', 'colorHashtag'],
        ['color', 'Color del logo de Instagram', 'colorLogo'], ['casilla', 'Sin el logo de Instagram', 'sinLogo']]) },
    { key: 'footer', tab: 'PRINCIPAL', casa: 'cierre', titulo: 'Cierre · letra y colores de la frase y del texto final',
      campos: [['fuente', 'Letra de la frase grande (¡Gracias!)', 'fuenteFrase'], ['color', 'Color de la frase grande', 'colorFrase'],
        ['fuente', 'Letra del texto final (el largo)', 'fuenteTexto'], ['color', 'Color del texto final', 'colorTextoFinal'],
        ['casilla', 'Texto final sin mayúsculas (para letras cursivas)', 'textoSinMayus']] }
  ];

  function arrancar() {
    var S = window.INVSN;
    if (!S || !S.estilo || !S.bloque) { setTimeout(arrancar, 300); return; }
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
