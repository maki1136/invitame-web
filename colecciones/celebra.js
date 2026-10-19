/* ============================================================================
   COLECCIÓN «CELEBRA»  ·  id `celebra`  ·  19/10/2026
   La familia CLARA de los eventos nuevos (kids, baby shower, bautizo, comunión,
   cumpleaños, graduación). Su hermana oscura es `colecciones/fiesta.js`.
   Arquitectura de `degrade.js` (TONOS + ESTILOS por tono, poner()/sacar(),
   paletaPropia para efectos/paleta.js) en versión CLARA, que parte de
   `sirena.js`: papel claro, tinta oscura, secciones destapadas con un CLARO
   RADIAL detrás del texto y el botón que la colección NO clava.

   ⭐ TONOS: fx.coleccion = 'celebra-<tono>'  (o ?coleccion=celebra-<tono>)
      pixel · unicornio · osita · mono · olivo · estrellas · marmol ·
      editorial · rosegold · toga · kinder · generacion · grises
      'celebra' a secas = pixel.
   ⚠️ VIENE APAGADA: sin fx.coleccion celebra* no hace nada (viaja en todo.php).
      No deja nada global al cargarse: sin la colección puesta no hay hoja, ni
      atributo, ni INVCOLPALETA, ni fuentes pedidas.

   ⭐ CADA TONO DISTINTO EN TODO (no sólo el color):
       disp/scr/txt → letra de títulos · cursiva · cuerpo
       nm/pk        → el armado del nombre y del sobretítulo en la portada
       h2/kk        → la escala de los títulos de sección (reescrita por tono)
       adorno       → la viñeta SVG de arriba de cada título
       forma        → tarjetas, itinerario, retratos y pase
       metal        → oro · oro rosa · bronce · plata · negro · azul
       pieza        → el medallón FOTOGRAFIADO (raspadita, itinerario, pase):
                      invitame/eventos/ev-<tono>-pieza (puede no existir todavía)
       tapas        → ev-<tono>-tapa-video (proyector) y ev-<tono>-tapa-play
                      (tocadiscos); `base` queda anotada (fondo ev-<base>-base.jpg)

   ⚠️⚠️ CONTRASTE — MEDIDO, NO ELEGIDO DE OJO (WCAG, 19/10).
      Se mide contra el PAPEL y, como atrás hay FOTO o VIDEO (fx.fondo, el
      protagonista), contra el PEOR CASO: un pixel gris (96,96,96) —una sombra
      de la foto metida debajo del texto— lavado por el claro radial:
         pico = papel al 74 % · medio = papel al 53 % · tarjeta = papel al 84 %
      Pisos: cuerpo (TINTA2) ≥ 7 · títulos (TINTA) ≥ 7 · textos chicos ≥ 4,5.
                   TINTA papel/pico/tarjeta   TINTA2 papel/pico/tarjeta   METAL_T papel
      pixel        14,47 / 10,08 / 11,61      11,88 / 8,28 / 9,54         6,25
      unicornio    13,56 /  9,38 / 10,88      11,36 / 7,85 / 9,11         6,00
      osita        12,30 /  8,57 /  9,85      10,28 / 7,16 / 8,24         5,69
      mono         13,95 /  9,71 / 11,18      11,31 / 7,87 / 9,06         6,19
      olivo        12,67 /  8,79 / 10,18      10,46 / 7,26 / 8,41         6,86
      estrellas    11,79 /  8,22 /  9,45      10,81 / 7,53 / 8,66         5,82
      marmol       14,54 / 10,11 / 11,71      11,59 / 8,06 / 9,34         5,74
      editorial    17,36 / 12,04 / 13,93      13,91 / 9,65 /11,17        17,36
      rosegold     13,82 /  9,60 / 11,14      10,95 / 7,61 / 8,83         5,90
      toga         14,84 / 10,29 / 11,93      11,63 / 8,06 / 9,35         6,23
      kinder       12,78 /  8,84 / 10,22      10,91 / 7,55 / 8,73         6,72
      generacion   15,67 / 10,81 / 12,59      11,82 / 8,16 / 9,50         6,24
      grises       15,74 / 10,93 / 12,65      11,99 / 8,33 / 9,64         6,94
      → En el borde del claro (papel al 53 %) TINTA2 queda entre 5,1 y 6,9: por
        eso todo texto de sección lleva además un HALO de papel (text-shadow).
      → METAL_T (el metal oscurecido) escribe SÓLO sobretítulos en CURSIVA
        GRANDE (≥ 21 px, piso de texto grande 3): sobre el pico da 3,9-4,8.
        Los sobretítulos chicos en versal van en TINTA2, nunca en metal.
      → El METAL claro (ORO), el ACENTO y TINTA3 NO ESCRIBEN: son adorno,
        filete, aro y borde. Igual que el coral en Sirena.
      → Nada de violeta de Perlas (rgb 70,59,82) en ningún tono.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'celebra';
  var ID_CSS = 'col-celebra';
  var P      = 'html[data-col="celebra"][data-coleccion="celebra"] ';
  var CL     = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var CLARO_A = 0.74;   /* MEDIDO (ver la cabecera). No bajarlo. */

  /* ---- LOS METALES: [metal (adorno, aro, filete) · metal claro] ---------- */
  var METALES = {
    oro:    ['#C9A44E', '#E6CF8E'],
    rosa:   ['#D49A98', '#EFC9C5'],
    bronce: ['#B08A4E', '#D9BE8C'],
    plata:  ['#A7AEB6', '#D5DADF'],
    negro:  ['#111111', '#3A3A3A'],
    azul:   ['#5DA9D6', '#A9D3EE']
  };

  /* ---- LOS TONOS ----------------------------------------------------------
     pa papel · pa2 papel hondo · ti tinta (títulos) · ti2 tinta (cuerpo) ·
     ti3 filete (NUNCA texto) · ac acento (NUNCA texto) · mt metal ·
     mtT metal oscurecido (sólo cursiva grande) · base de las tapas
     nm  nombre de portada  [familia, tamaño, estilo, peso, transform, espaciado, interlínea]
     pk  sobretítulo portada [familia, tamaño, transform, espaciado, estilo]
     h2  título de sección   [tamaño, espaciado, transform, estilo, peso]
     kk  sobretítulo sección [familia, tamaño, transform, espaciado, color: 'm' metal | 't' tinta2]
     h3  letra de nombres chicos (tarjetas, personas, horas) */
  var TONOS = {
    /* 1 · KIDS · videojuego retro ORIGINAL: atardecer pastel, islas flotantes,
       globos pixel. Pixelify Sans SÓLO para nombres y títulos cortos, chica. */
    pixel: { nombre: 'Kids · Pixel aventura', pa:'#FFF4E8', pa2:'#FFE3D3', ti:'#1B2140', ti2:'#283050', ti3:'#F2A7B8', ac:'#FF8FA3', mt:'oro', mtT:'#8A4B12', base:'pixel',
      disp:'Pixelify Sans', scr:'', txt:'Fredoka', h3:'Fredoka', adorno:'pixel', forma:'pixel', boton:'0', cielo:1, radio:'0',
      nm:['Pixelify Sans','clamp(40px,11vw,58px)','normal',700,'uppercase','.04em',1.05],
      pk:['Fredoka','13px','uppercase','.3em','normal'],
      h2:['24px','.04em','uppercase','normal',600],
      kk:['Fredoka','13px','uppercase','.22em','t'] },
    /* 2 · KIDS · cielo mágico: pastel rosa/lila/menta, nubes y arcoíris */
    unicornio: { nombre: 'Kids · Cielo mágico', pa:'#FFF5FA', pa2:'#F4E9FB', ti:'#3E1F35', ti2:'#4C2B43', ti3:'#C9B6E4', ac:'#A8E6CF', mt:'rosa', mtT:'#8E4A5C', base:'unicornio',
      disp:'Sniglet', scr:'Sacramento', txt:'Quicksand', h3:'Sniglet', adorno:'nube', forma:'nube', boton:'999px', cielo:1, radio:'40px',
      nm:['Sniglet','clamp(44px,12vw,64px)','normal',800,'none','.01em',1.08],
      pk:['Sacramento','38px','none','0','normal'],
      h2:['28px','.01em','none','normal',800],
      kk:['Sacramento','30px','none','0','m'] },
    /* 3 · BABY SHOWER · acuarela nude y rosa viejo, estrellitas, coronita */
    osita: { nombre: 'Baby shower · Osita coronada', pa:'#FBF3EE', pa2:'#F3E3DA', ti:'#3D2A26', ti2:'#4A3631', ti3:'#D8B4A6', ac:'#C99A8E', mt:'oro', mtT:'#7E5A1C', base:'osita',
      disp:'Gloock', scr:'Pinyon Script', txt:'Nunito', h3:'Gloock', adorno:'corona', forma:'camafeo', boton:'14px', radio:'18px',
      nm:['Gloock','clamp(44px,12vw,62px)','normal',400,'none','.01em',1.1],
      pk:['Pinyon Script','32px','none','0','normal'],
      h2:['28px','.02em','none','normal',400],
      kk:['Pinyon Script','29px','none','0','m'] },
    /* 4 · BAUTIZO · toile rosa y moño de raso */
    mono: { nombre: 'Bautizo · Moño de raso', pa:'#FDF4F3', pa2:'#F6E2E0', ti:'#3A1E24', ti2:'#502A31', ti3:'#E3B5BA', ac:'#D48C98', mt:'rosa', mtT:'#8C4752', base:'mono',
      disp:'Cormorant', scr:'Pinyon Script', txt:'Cormorant Garamond', h3:'Cormorant', adorno:'lazo', forma:'feston', boton:'999px', radio:'24px',
      nm:['Pinyon Script','clamp(56px,15vw,80px)','normal',400,'none','0',1.15],
      pk:['Cormorant','13px','uppercase','.4em','normal'],
      h2:['28px','.04em','none','normal',500],
      kk:['Pinyon Script','29px','none','0','m'] },
    /* 5 · COMUNIÓN · salvia, madera y papel algodón; olivo con crucecita */
    olivo: { nombre: 'Comunión · Olivo y cruz', pa:'#F7F5EC', pa2:'#ECE9DA', ti:'#24301F', ti2:'#323D2B', ti3:'#B5C2A3', ac:'#8FA37A', mt:'bronce', mtT:'#6E4F22', base:'olivo',
      disp:'Italiana', scr:'Pinyon Script', txt:'EB Garamond', h3:'Italiana', adorno:'olivo', forma:'arco', boton:'2px', radio:'14px',
      nm:['Italiana','clamp(34px,9.6vw,52px)','normal',400,'uppercase','.12em',1.2],
      pk:['Pinyon Script','32px','none','0','normal'],
      h2:['28px','.08em','none','normal',400],
      kk:['Pinyon Script','29px','none','0','m'] },
    /* 6 · BAUTIZO · nude y crema, nubes de algodón, estrellas de fieltro doradas */
    estrellas: { nombre: 'Bautizo · Estrellas de algodón', pa:'#FAF4EA', pa2:'#F1E6D4', ti:'#3A3024', ti2:'#403628', ti3:'#DCC9A8', ac:'#D9B26A', mt:'oro', mtT:'#7A5A12', base:'estrellas',
      disp:'Fraunces', scr:'Allura', txt:'Mulish', h3:'Fraunces', adorno:'fieltro', forma:'colgante', boton:'22px', cielo:1, radio:'26px',
      nm:['Fraunces','clamp(46px,12.5vw,66px)','italic',400,'none','0',1.1],
      pk:['Allura','34px','none','0','normal'],
      h2:['27px','.01em','none','normal',400],
      kk:['Allura','30px','none','0','m'] },
    /* 7 · CUMPLEAÑOS · mármol rosa con vetas de oro, glam */
    marmol: { nombre: 'Cumpleaños · Mármol fabulous', pa:'#FBF1F0', pa2:'#F2DEDC', ti:'#2E1C20', ti2:'#442B30', ti3:'#E2BFC0', ac:'#C9A44E', mt:'oro', mtT:'#7A5A12', base:'marmol-rosa',
      disp:'Bodoni Moda', scr:'Great Vibes', txt:'Jost', h3:'Bodoni Moda', adorno:'gema', forma:'marco', boton:'2px', radio:'3px',
      nm:['Bodoni Moda','clamp(48px,13vw,72px)','italic',500,'none','0',1.06],
      pk:['Jost','12px','uppercase','.38em','normal'],
      h2:['26px','.02em','none','normal',400],
      kk:['Great Vibes','30px','none','0','m'] },
    /* 8 · CUMPLEAÑOS · 18 editorial: mostaza + negro + crema, estilo revista.
       Tarjetas rectas, filetes gruesos negros, números grandes. Sin metal. */
    editorial: { nombre: 'Cumpleaños · 18 editorial', pa:'#FBF5E6', pa2:'#F3E3B5', ti:'#111111', ti2:'#262626', ti3:'#111111', ac:'#E0B43A', mt:'negro', mtT:'#111111', base:'editorial',
      disp:'Abril Fatface', scr:'', txt:'Work Sans', h3:'Abril Fatface', adorno:'barra', forma:'revista', boton:'0', radio:'0',
      nm:['Abril Fatface','clamp(50px,14vw,84px)','normal',400,'uppercase','.01em',.98],
      pk:['Work Sans','12px','uppercase','.34em','normal'],
      h2:['30px','.01em','none','normal',400],
      kk:['Work Sans','11.5px','uppercase','.3em','t'] },
    /* 9 · CUMPLEAÑOS · rose gold: blush, globos rose gold, glitter */
    rosegold: { nombre: 'Cumpleaños · Rose gold', pa:'#FDF2F0', pa2:'#F7DFDA', ti:'#3B1D22', ti2:'#4E2D33', ti3:'#E8B9B2', ac:'#D99A8E', mt:'rosa', mtT:'#8E4A50', base:'rosegold',
      disp:'Playfair Display', scr:'Great Vibes', txt:'DM Sans', h3:'Playfair Display', adorno:'globo', forma:'pastilla', boton:'999px', radio:'34px',
      nm:['Playfair Display','clamp(40px,11vw,58px)','italic',400,'none','.01em',1.12],
      pk:['Great Vibes','40px','none','0','normal'],
      h2:['26px','.01em','none','italic',400],
      kk:['Great Vibes','30px','none','0','m'] },
    /* 10 · GRADUACIÓN · toga y balanza: mármol blanco, sobrio, institucional */
    toga: { nombre: 'Graduación · Toga y balanza', pa:'#F8F7F4', pa2:'#ECEAE4', ti:'#1C2230', ti2:'#2E3442', ti3:'#C9C3B3', ac:'#B8933F', mt:'oro', mtT:'#76571A', base:'toga',
      disp:'Libre Baskerville', scr:'Great Vibes', txt:'Libre Baskerville', h3:'Libre Baskerville', adorno:'balanza', forma:'diploma', boton:'0', radio:'0',
      nm:['Libre Baskerville','clamp(26px,7.4vw,38px)','normal',400,'uppercase','.14em',1.35],
      pk:['Great Vibes','34px','none','0','normal'],
      h2:['21px','.08em','uppercase','normal',400],
      kk:['Great Vibes','30px','none','0','m'] },
    /* 11 · GRADUACIÓN · pequeños graduados: acuarela celeste y amarillo manteca,
       osito con birrete, avioncitos de papel. Formas redondeadas. Sin metal. */
    kinder: { nombre: 'Graduación · Pequeños graduados', pa:'#F7FBFF', pa2:'#FFF6D6', ti:'#12324A', ti2:'#1D3D55', ti3:'#A9D3EE', ac:'#F6D365', mt:'azul', mtT:'#1F5E86', base:'kinder',
      disp:'Baloo 2', scr:'Patrick Hand', txt:'Baloo 2', h3:'Baloo 2', adorno:'avion', forma:'burbuja', boton:'999px', cielo:1, radio:'28px',
      nm:['Baloo 2','clamp(46px,12.5vw,66px)','normal',800,'none','0',1.02],
      pk:['Patrick Hand','24px','none','.02em','normal'],
      h2:['28px','0','none','normal',800],
      kk:['Patrick Hand','21px','none','.02em','m'] },
    /* 12 · GRADUACIÓN · generación: cielo azul con birretes volando,
       deportivo-académico, formas rectas */
    generacion: { nombre: 'Graduación · Generación', pa:'#F3F8FC', pa2:'#DCEAF5', ti:'#0F1E33', ti2:'#23344A', ti3:'#9FB9D3', ac:'#C9A44E', mt:'oro', mtT:'#76571A', base:'generacion',
      disp:'Oswald', scr:'', txt:'Source Sans 3', h3:'Oswald', adorno:'birrete', forma:'recta', boton:'4px', cielo:1, radio:'2px',
      nm:['Oswald','clamp(48px,13.5vw,76px)','normal',600,'uppercase','.01em',1.02],
      pk:['Source Sans 3','13px','uppercase','.32em','normal'],
      h2:['26px','.06em','uppercase','normal',500],
      kk:['Source Sans 3','12px','uppercase','.26em','t'] },
    /* 13 · CUMPLEAÑOS · treinta en grises: acuarela gris y grafito sobre
       blanco, masculino editorial */
    grises: { nombre: 'Cumpleaños · Treinta en grises', pa:'#F7F7F6', pa2:'#E8E8E6', ti:'#1C1D1F', ti2:'#303235', ti3:'#B9BCC0', ac:'#8A8F96', mt:'plata', mtT:'#4E5660', base:'grises',
      disp:'DM Serif Display', scr:'', txt:'Karla', h3:'DM Serif Display', adorno:'pincel', forma:'aguada', boton:'3px', radio:'4px',
      nm:['DM Serif Display','clamp(46px,12.5vw,66px)','normal',400,'none','0',1.08],
      pk:['Karla','12px','uppercase','.36em','normal'],
      h2:['27px','.01em','none','normal',400],
      kk:['Karla','12px','uppercase','.28em','t'] }
  };

  /* ⚠️ Se pide SÓLO el nombre de la familia y SÓLO los estilos que existen:
     si se pide un peso o una itálica que la familia no trae, Google Fonts
     devuelve 400 y NO CARGA NINGUNA de las del pedido. */
  var EJES = {
    'Pixelify Sans': ':wght@400;600;700', 'Fredoka': ':wght@400;500;600', 'Sniglet': ':wght@400;800',
    'Sacramento': '', 'Quicksand': ':wght@400;500;600', 'Gloock': '', 'Pinyon Script': '',
    'Nunito': ':ital,wght@0,400;0,600;1,400', 'Cormorant': ':ital,wght@0,400;0,500;0,600;1,400',
    'Cormorant Garamond': ':ital,wght@0,400;0,500;1,400', 'Italiana': '',
    'EB Garamond': ':ital,wght@0,400;0,500;1,400', 'Fraunces': ':ital,wght@0,400;0,500;1,400',
    'Allura': '', 'Mulish': ':ital,wght@0,400;0,600;1,400',
    'Bodoni Moda': ':ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500',
    'Great Vibes': '', 'Jost': ':ital,wght@0,400;0,500;1,400', 'Abril Fatface': '',
    'Work Sans': ':ital,wght@0,400;0,500;0,600;1,400', 'Playfair Display': ':ital,wght@0,400;0,600;1,400;1,500',
    'DM Sans': ':ital,wght@0,400;0,500;1,400', 'Libre Baskerville': ':ital,wght@0,400;0,700;1,400',
    'Baloo 2': ':wght@400;600;800', 'Patrick Hand': '', 'Oswald': ':wght@400;500;600',
    'Source Sans 3': ':ital,wght@0,400;0,600;1,400', 'DM Serif Display': ':ital@0;1',
    'Karla': ':ital,wght@0,400;0,600;1,400'
  };
  var PILA = { 'Pixelify Sans':'monospace', 'Fredoka':'system-ui,sans-serif', 'Sniglet':'system-ui,sans-serif',
    'Quicksand':'system-ui,sans-serif', 'Nunito':'system-ui,sans-serif', 'Mulish':'system-ui,sans-serif',
    'Jost':'system-ui,sans-serif', 'Work Sans':'system-ui,sans-serif', 'DM Sans':'system-ui,sans-serif',
    'Baloo 2':'system-ui,sans-serif', 'Oswald':'"Arial Narrow",sans-serif', 'Source Sans 3':'system-ui,sans-serif',
    'Karla':'system-ui,sans-serif', 'Sacramento':'cursive', 'Pinyon Script':'cursive', 'Allura':'cursive',
    'Great Vibes':'cursive', 'Patrick Hand':'cursive' };
  function ff(n) { return '"' + n + '",' + (PILA[n] || 'Georgia,serif'); }

  /* ------------------------------------------------------------- utilidades */

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }
  function pedido() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return String(u).toLowerCase();
    } catch (e) {}
    try { return String(((ev().fx) || {}).coleccion || '').toLowerCase(); } catch (e) { return ''; }
  }
  function activa() { var c = pedido(); return c === ID || c.indexOf(ID + '-') === 0; }
  function tono() {
    var c = pedido();
    var k = c.indexOf(ID + '-') === 0 ? c.slice(ID.length + 1) : 'pixel';
    return TONOS[k] ? k : 'pixel';
  }
  function rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }).join(','); }

  /* la paleta viva del tono (se recalcula en cada armado) */
  var E, PAPEL, PAPEL2, TINTA, TINTA2, TINTA3, ACENTO, ORO, ORO_CL, ORO_T, RP, RP2, RT, RT3, RM;
  var PIEZA, PIEZA_CH, PIEZA_MD, PIEZA_TAPA, TAPA_VIDEO, TAPA_PLAY;
  function aplicarTono() {
    var k = tono(); E = TONOS[k];
    PAPEL = E.pa; PAPEL2 = E.pa2; TINTA = E.ti; TINTA2 = E.ti2; TINTA3 = E.ti3; ACENTO = E.ac;
    ORO = METALES[E.mt][0]; ORO_CL = METALES[E.mt][1]; ORO_T = E.mtT;
    RP = rgb(PAPEL); RP2 = rgb(PAPEL2); RT = rgb(TINTA); RT3 = rgb(TINTA3); RM = rgb(ORO);
    var pz = CL + 'c_crop,g_center,w_0.62,h_0.62/r_max/w_SZ,q_auto,f_png/invitame/eventos/ev-' + k + '-pieza';
    PIEZA = pz.replace('SZ', '300'); PIEZA_CH = pz.replace('SZ', '120'); PIEZA_MD = pz.replace('SZ', '160');
    /* §48 · las tapas MUESTRAN LO QUE HACEN: proyector y tocadiscos de la
       temática (no un recorte de la base). Las genera otro agente con estos nombres. */
    TAPA_VIDEO = CL + 'c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/eventos/ev-' + k + '-tapa-video';
    TAPA_PLAY  = CL + 'c_fill,w_800,h_730,g_auto,q_auto,f_auto/invitame/eventos/ev-' + k + '-tapa-play';
    /* §85.1 · la tapa de la raspadita es OPACA: la pieza aplanada sobre el papel */
    PIEZA_TAPA = CL + 'c_crop,g_center,w_0.62,h_0.62/b_rgb:' + PAPEL2.replace('#', '') + ',c_pad,w_360,h_360,q_auto,f_jpg/invitame/eventos/ev-' + k + '-pieza';
  }

  /* ⚠️ LA TABLA QUE LA COLECCIÓN RECLAMA COMO PROPIA. Contrato de
     `efectos/paleta.js`: NOMBRES DE VARIABLE CSS. `--verde` es el color de
     llamada (29 lugares del motor: #filtro-abrir, #gal-entrar, los discos):
     en una clara es la TINTA, como en Sirena. `--sage` escribe nombres de
     lugar: va el metal OSCURECIDO, que sí pasa 4,5. */
  function paletaPropia() { return {
    '--verde':     TINTA,
    '--verde2':    TINTA2,
    '--muted':     TINTA2,
    '--cream':     PAPEL,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col':   PAPEL,
    '--sec-col-v': TINTA,
    '--sage':      ORO_T,
    '--sage-cl':   ORO,
    '--oro':       ORO
  }; }
  var PALETA_PROPIA = null;

  /* ------------------------------------------------------------- adornos
     Dibujados para el TAMAÑO REAL: `.adorno` mide 40 px y la figura se ve a
     ~18 (lección de la vieira de Sirena y la hoja de tilo de Degradé). */
  function svg(cuerpo) { return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' + cuerpo + '</svg>'); }
  function estrella(cx, cy, R, r) {
    var p = [];
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; p.push((cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1)); }
    return 'M' + p.join(' L') + ' Z';
  }
  function adornoSVG(c) {
    var a = E.adorno, pa = PAPEL;
    /* PIXEL: estrellita de 8×8 «píxeles», bordes duros (nada de Nintendo) */
    if (a === 'pixel') {
      var G = ['...##...', '...##...', '########', '.######.', '..####..', '.##..##.', '##....##'], r = '';
      for (var y = 0; y < G.length; y++) for (var x = 0; x < 8; x++) if (G[y][x] === '#') r += '<rect x="' + (x * 6) + '" y="' + (y * 6 + 3) + '" width="6" height="6"/>';
      return svg('<g fill="' + c + '" shape-rendering="crispEdges">' + r + '</g><rect x="18" y="15" width="6" height="6" fill="' + ACENTO + '" shape-rendering="crispEdges"/>');
    }
    /* NUBE con arcoíris de peluche */
    if (a === 'nube') return svg(
      '<g fill="none" stroke-linecap="round" stroke-width="3.4"><path stroke="#E58FB0" d="M8 31 A16 16 0 0 1 40 31"/><path stroke="#B49AD8" d="M11.4 31 A12.6 12.6 0 0 1 36.6 31"/><path stroke="#7FC8A9" d="M14.8 31 A9.2 9.2 0 0 1 33.2 31"/></g>' +
      '<g fill="' + c + '"><circle cx="13" cy="34" r="6.5"/><circle cx="21" cy="29.5" r="8.5"/><circle cx="31" cy="31" r="7.5"/><circle cx="38" cy="35" r="5"/><rect x="8" y="34" width="33" height="7" rx="3.5"/></g>');
    /* CORONITA con corazón calado */
    if (a === 'corona') return svg(
      '<g fill="' + c + '"><path d="M10 36 L8 18 L17 25 L24 13 L31 25 L40 18 L38 36 Z"/><rect x="10" y="37.5" width="28" height="4.5" rx="2"/><circle cx="8" cy="16.5" r="2.4"/><circle cx="24" cy="11" r="2.6"/><circle cx="40" cy="16.5" r="2.4"/></g>' +
      '<path fill="' + pa + '" d="M24 33 C20 30 19.5 27 21.6 26 C22.8 25.4 23.7 26 24 27 C24.3 26 25.2 25.4 26.4 26 C28.5 27 28 30 24 33 Z"/>');
    /* LAZO de raso */
    if (a === 'lazo') return svg(
      '<g fill="' + c + '"><path d="M24 22 C15 10 4 12 5 21 C6 29 15 28 24 24 Z"/><path d="M24 22 C33 10 44 12 43 21 C42 29 33 28 24 24 Z"/><path d="M22.5 25 L15 43 L19.5 41 L21.5 45 L25.5 26 Z"/><path d="M25.5 25 L33 43 L28.5 41 L26.5 45 L22.5 26 Z"/></g>' +
      '<path d="M24 21 C18 14 10 14 10 20" stroke="' + pa + '" stroke-width="1.2" fill="none"/><path d="M24 21 C30 14 38 14 38 20" stroke="' + pa + '" stroke-width="1.2" fill="none"/><circle cx="24" cy="23" r="3.6" fill="' + c + '" stroke="' + pa + '" stroke-width="1"/>');
    /* OLIVO Y CRUZ: dos ramitas que abrazan una crucecita */
    if (a === 'olivo') {
      var H = [[10.5, 34, -40], [8.6, 26, -10], [10.5, 18.5, 20]], h = '';
      for (var i = 0; i < H.length; i++) {
        h += '<ellipse cx="' + H[i][0] + '" cy="' + H[i][1] + '" rx="2.3" ry="5" transform="rotate(' + H[i][2] + ' ' + H[i][0] + ' ' + H[i][1] + ')"/>';
        h += '<ellipse cx="' + (48 - H[i][0]) + '" cy="' + H[i][1] + '" rx="2.3" ry="5" transform="rotate(' + (-H[i][2]) + ' ' + (48 - H[i][0]) + ' ' + H[i][1] + ')"/>';
      }
      return svg('<g fill="none" stroke="' + c + '" stroke-width="1.5" stroke-linecap="round"><path d="M22 42 C12 38 8 28 11 15"/><path d="M26 42 C36 38 40 28 37 15"/></g>' +
        '<g fill="' + ACENTO + '">' + h + '</g><g fill="' + c + '"><rect x="22.6" y="9" width="2.8" height="25" rx="1"/><rect x="17" y="15" width="14" height="2.8" rx="1"/></g>');
    }
    /* ESTRELLA DE FIELTRO que cuelga, con la costura */
    if (a === 'fieltro') return svg(
      '<path d="M24 1 L24 10" stroke="' + c + '" stroke-width="1.2"/>' +
      '<path fill="' + c + '" stroke="' + c + '" stroke-width="3" stroke-linejoin="round" d="' + estrella(24, 28, 16, 7.6) + '"/>' +
      '<path fill="none" stroke="' + pa + '" stroke-width="1.1" stroke-dasharray="1.6 1.7" stroke-linejoin="round" d="' + estrella(24, 28, 11, 5.2) + '"/>');
    /* GEMA tallada (glam) con un destello */
    if (a === 'gema') return svg(
      '<path fill="' + c + '" d="M12 18 L18 10 L30 10 L36 18 L24 40 Z"/>' +
      '<g fill="none" stroke="' + pa + '" stroke-width="1.1" stroke-linejoin="round"><path d="M12 18 L36 18"/><path d="M18 10 L21 18 L24 10 L27 18 L30 10"/><path d="M21 18 L24 40 L27 18"/></g>' +
      '<path fill="' + c + '" d="M41 4 L42 8 L46 9 L42 10 L41 14 L40 10 L36 9 L40 8 Z"/>');
    /* BARRA editorial: dos filetes gruesos negros y un cuadrado mostaza */
    if (a === 'barra') return svg(
      '<g fill="' + c + '"><rect x="1" y="21" width="16" height="6"/><rect x="31" y="21" width="16" height="6"/></g>' +
      '<rect x="18.5" y="18.5" width="11" height="11" fill="' + ACENTO + '" stroke="' + c + '" stroke-width="2" transform="rotate(45 24 24)"/>');
    /* GLOBO rose gold con su hilo */
    if (a === 'globo') return svg(
      '<ellipse cx="24" cy="18.5" rx="12" ry="14.5" fill="' + c + '"/><path d="M21.6 32.6 L26.4 32.6 L24 36.4 Z" fill="' + c + '"/>' +
      '<path d="M24 36.4 C21 40 27 42.5 24 47" stroke="' + c + '" stroke-width="1.3" fill="none"/>' +
      '<ellipse cx="19" cy="12.5" rx="2.6" ry="4.6" fill="' + pa + '" opacity=".85" transform="rotate(-25 19 12.5)"/>' +
      '<path fill="' + c + '" d="M41 30 L41.8 33 L44.8 33.8 L41.8 34.6 L41 37.6 L40.2 34.6 L37.2 33.8 L40.2 33 Z"/>');
    /* BALANZA de la justicia */
    if (a === 'balanza') return svg(
      '<g fill="' + c + '"><circle cx="24" cy="8.6" r="2.4"/><rect x="23" y="10" width="2" height="28"/><rect x="16" y="38" width="16" height="3" rx="1.5"/><rect x="8" y="12" width="32" height="2" rx="1"/>' +
      '<path d="M4.5 26 Q10 32.5 15.5 26 Z"/><path d="M32.5 26 Q38 32.5 43.5 26 Z"/></g>' +
      '<g stroke="' + c + '" stroke-width="1" fill="none"><path d="M10 13 L5.5 26"/><path d="M10 13 L14.5 26"/><path d="M38 13 L33.5 26"/><path d="M38 13 L42.5 26"/></g>');
    /* AVIONCITO de papel con su estela */
    if (a === 'avion') return svg(
      '<path fill="' + c + '" d="M4 23 L44 8 L20 29 Z"/><path fill="' + c + '" opacity=".72" d="M20 29 L44 8 L30 40 Z"/>' +
      '<path d="M20 29 L44 8" stroke="' + pa + '" stroke-width="1.1"/>' +
      '<path d="M3 36 C8 40 13 40 17 36" stroke="' + c + '" stroke-width="1.6" stroke-dasharray="2 3" stroke-linecap="round" fill="none"/>');
    /* BIRRETE volando, con la borla */
    if (a === 'birrete') return svg(
      '<path fill="' + c + '" d="M24 10 L44 19 L24 28 L4 19 Z"/>' +
      '<path fill="' + c + '" opacity=".85" d="M13 23 L13 31 C13 35.5 35 35.5 35 31 L35 23 L24 28 Z"/>' +
      '<circle cx="24" cy="19" r="1.8" fill="' + pa + '"/>' +
      '<path d="M24 19 L40 22 L40 33" stroke="' + TINTA + '" stroke-width="1.2" fill="none"/><rect x="38.6" y="33" width="2.8" height="6" rx="1" fill="' + TINTA + '"/>');
    /* PINCELADA de acuarela gris con salpicado */
    if (a === 'pincel') return svg(
      '<path fill="' + c + '" opacity=".38" d="M7 30 C12 24 22 26 30 24 C36 23 42 23 44 26 C45 29 40 31 34 31 C26 32 16 34 10 34 C7 34 5 32 7 30 Z"/>' +
      '<path fill="' + c + '" d="M5 27 C9 19 18 21 24 20 C31 19 38 17 43 21 C45 23 42 26 38 26 C31 27 24 29 16 29 C11 29 7 31 5 27 Z"/>' +
      '<path d="M12 24 C20 23 28 22 38 21" stroke="' + pa + '" stroke-width=".9" opacity=".7" fill="none"/>' +
      '<g fill="' + c + '"><circle cx="41" cy="31" r="1.4"/><circle cx="45" cy="28" r=".9"/><circle cx="8" cy="21" r="1"/></g>');
    return svg('<path fill="' + c + '" d="' + estrella(24, 24, 18, 8) + '"/>');
  }

  /* ------------------------------------------------- la forma de cada tono */
  function cssForma() {
    var A = [], B = 'rgba(' + RT3 + ',.75)', M = 'rgba(' + RM + ',.65)';
    var f = E.forma;
    if (f === 'pixel') {
      /* bordes ESCALONADOS: esquinas de dos escalones de 6 px */
      var S = 'polygon(12px 0,calc(100% - 12px) 0,calc(100% - 12px) 6px,calc(100% - 6px) 6px,calc(100% - 6px) 12px,100% 12px,100% calc(100% - 12px),calc(100% - 6px) calc(100% - 12px),calc(100% - 6px) calc(100% - 6px),calc(100% - 12px) calc(100% - 6px),calc(100% - 12px) 100%,12px 100%,12px calc(100% - 6px),6px calc(100% - 6px),6px calc(100% - 12px),0 calc(100% - 12px),0 12px,6px 12px,6px 6px,12px 6px)';
      A.push(
        P + ':is(.evento,.hotel,.tl){ border-radius:0!important; border:0!important; clip-path:' + S + '!important; box-shadow:inset 0 0 0 3px ' + TINTA + ', inset 0 -6px 0 3px rgba(' + RT3 + ',.55)!important; }',
        P + '.evento .ph{ border-radius:0!important; image-rendering:auto!important; }',
        P + '.padres .av{ border-radius:0!important; border:0!important; clip-path:polygon(8px 0,calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 4px) calc(100% - 8px),calc(100% - 4px) calc(100% - 4px),calc(100% - 8px) calc(100% - 4px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 4px),4px calc(100% - 4px),4px calc(100% - 8px),0 calc(100% - 8px),0 8px,4px 8px,4px 4px,8px 4px)!important; }',
        P + '.pasecard{ border-radius:0!important; border:3px solid ' + TINTA + '!important; box-shadow:6px 6px 0 rgba(' + RT3 + ',.9)!important; }'
      );
    }
    if (f === 'nube') A.push(
      P + ':is(.evento,.hotel){ border-radius:46px 46px 40px 40px / 40px 40px 34px 34px!important; border:2px dashed rgba(' + RT3 + ',.95)!important; overflow:hidden!important; }',
      P + '.evento .ph{ border-radius:44px 44px 0 0 / 38px 38px 0 0!important; }',
      P + '.tl{ border-radius:40px!important; border:2px dashed rgba(' + RT3 + ',.9)!important; }',
      P + '.padres .av{ border-radius:58% 42% 52% 48% / 52% 58% 42% 48%!important; border:3px solid ' + ORO_CL + '!important; box-shadow:0 0 0 5px rgba(' + RP + ',.9), 0 0 0 7px rgba(168,230,207,.8)!important; }',
      P + '.pasecard{ border-radius:36px!important; }'
    );
    if (f === 'camafeo') A.push(
      P + ':is(.evento,.hotel){ border-radius:18px!important; box-shadow:inset 0 0 0 6px rgba(' + RP + ',.9), inset 0 0 0 7px rgba(' + rgb(ACENTO) + ',.7), 0 10px 24px rgba(' + RT + ',.10)!important; overflow:hidden!important; }',
      P + '.evento .ph{ border-radius:50%/42%!important; width:auto!important; margin:14px 22px 0!important; height:210px!important; }',
      P + '.tl{ border-radius:18px!important; box-shadow:inset 0 0 0 6px rgba(' + RP + ',.9), inset 0 0 0 7px rgba(' + rgb(ACENTO) + ',.55)!important; }',
      P + '.padres .av{ border-radius:50%!important; height:124px!important; border:1px solid ' + ORO + '!important; box-shadow:0 0 0 4px rgba(' + RP + ',.95), 0 0 0 5px ' + M + '!important; }',
      P + '.pasecard{ border-radius:18px!important; }'
    );
    if (f === 'feston') {
      var SC = 'radial-gradient(circle 9px at 50% 100%,#0000 96%,#000 100%) bottom/18px 100% repeat-x';
      A.push(
        P + ':is(.evento,.hotel){ border-radius:24px 24px 0 0!important; border:0!important; -webkit-mask:' + SC + '!important; mask:' + SC + '!important; padding-bottom:26px!important; box-shadow:inset 0 0 0 1px ' + B + '!important; }',
        P + '.evento .ph{ border-radius:23px 23px 0 0!important; }',
        P + '.tl{ border-radius:24px!important; border:1px solid ' + B + '!important; }',
        P + '.padres .av{ border:0!important; box-shadow:0 0 0 3px rgba(' + RP + ',.95), 0 0 0 5px ' + ORO + ', 0 0 0 9px rgba(' + RP + ',.9), 0 0 0 10px ' + M + '!important; }',
        P + '.pasecard{ border-radius:24px!important; }'
      );
    }
    if (f === 'arco') A.push(
      P + ':is(.evento,.hotel){ border-radius:50% 50% 14px 14px / 44px 44px 14px 14px!important; overflow:hidden!important; }',
      P + '.hotel{ padding-top:40px!important; }',
      P + '.tl{ border-radius:120px 120px 16px 16px / 70px 70px 16px 16px!important; padding-top:40px!important; }',
      P + '.padres .av{ border-radius:999px 999px 10px 10px!important; height:122px!important; border:1px solid ' + ORO + '!important; box-shadow:0 0 0 4px rgba(' + RP + ',.95), 0 0 0 5px ' + M + '!important; }',
      P + '.pasecard{ border-radius:14px!important; }'
    );
    if (f === 'colgante') A.push(
      P + ':is(.evento,.hotel){ border-radius:26px!important; outline:1.5px dashed ' + M + '!important; outline-offset:-8px!important; position:relative!important; overflow:visible!important; margin-top:22px!important; }',
      P + '.evento .ph{ border-radius:26px 26px 0 0!important; }',
      /* la estrellita de fieltro que cuelga de un hilo sobre cada tarjeta */
      P + ':is(.evento,.hotel)::after{ content:""!important; position:absolute!important; top:-22px!important; left:50%!important; margin-left:-12px!important; width:24px!important; height:30px!important; background:url("' + adornoSVG(ORO) + '") center/contain no-repeat!important; pointer-events:none!important; z-index:3!important; }',
      P + '.tl{ border-radius:26px!important; outline:1.5px dashed ' + M + '!important; outline-offset:-8px!important; }',
      P + '.padres .av{ border-radius:50%!important; border:2px dashed ' + ORO + '!important; box-shadow:0 0 0 4px rgba(' + RP + ',.95)!important; }',
      P + '.pasecard{ border-radius:26px!important; }'
    );
    if (f === 'marco') A.push(
      P + ':is(.evento,.hotel){ border-radius:3px!important; border:1px solid ' + ORO + '!important; outline:1px solid ' + M + '!important; outline-offset:4px!important; margin-left:6px!important; margin-right:6px!important; overflow:hidden!important; }',
      P + '.evento .ph{ border-radius:0!important; }',
      P + '.tl{ border-radius:3px!important; border:1px solid ' + ORO + '!important; outline:1px solid ' + M + '!important; outline-offset:4px!important; }',
      P + '.padres .av{ border-radius:18%!important; border:1px solid ' + ORO + '!important; box-shadow:0 0 0 4px rgba(' + RP + ',.95), 0 0 0 5px ' + ORO + '!important; }',
      P + '.pasecard{ border-radius:3px!important; }'
    );
    if (f === 'revista') A.push(
      P + ':is(.evento,.hotel,.tl,.pasecard){ border-radius:0!important; border:2px solid ' + TINTA + '!important; border-top-width:8px!important; box-shadow:7px 7px 0 ' + ACENTO + '!important; }',
      P + '.evento .ph{ border-radius:0!important; }',
      P + '.evento{ margin-right:10px!important; }',
      P + '.tl:not(.tl-centro){ border-left-width:8px!important; }',
      P + '.padres .av{ border-radius:0!important; border:2px solid ' + TINTA + '!important; box-shadow:5px 5px 0 ' + ACENTO + '!important; }',
      /* los NÚMEROS GRANDES: horas y cuenta regresiva en Abril Fatface */
      P + ':is(.tl .hora, .it .h){ font-family:' + ff('Abril Fatface') + '!important; font-size:26px!important; line-height:1.05!important; }',
      P + '.portada .num{ font-size:46px!important; line-height:1!important; }'
    );
    if (f === 'pastilla') A.push(
      P + ':is(.evento,.hotel){ border-radius:34px!important; border:2px solid ' + M + '!important; box-shadow:0 0 0 6px rgba(' + RP + ',.8), 0 0 0 7px rgba(' + RM + ',.35), 0 14px 30px rgba(' + RT + ',.10)!important; overflow:hidden!important; }',
      P + '.evento .ph{ border-radius:32px 32px 0 0!important; }',
      P + '.tl{ border-radius:34px!important; border:2px solid ' + M + '!important; }',
      P + '.padres .av{ border-radius:50%!important; border:0!important; box-shadow:0 0 0 3px ' + ORO_CL + ', 0 0 0 5px ' + ORO + ', 0 8px 18px rgba(' + RT + ',.16)!important; }',
      P + '.pasecard{ border-radius:30px!important; }'
    );
    if (f === 'diploma') {
      var CH = 'polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px)';
      A.push(
        P + ':is(.evento,.hotel,.tl){ border-radius:0!important; border:0!important; clip-path:' + CH + '!important; box-shadow:inset 0 0 0 5px rgba(' + RP2 + ',.95), inset 0 0 0 6px ' + M + ', inset 0 0 0 9px rgba(' + RP2 + ',.95), inset 0 0 0 10px rgba(' + RM + ',.35)!important; }',
        P + '.evento .ph{ border-radius:0!important; margin:10px 10px 0!important; width:auto!important; }',
        P + '.padres .av{ border-radius:999px 999px 6px 6px / 60px 60px 6px 6px!important; height:122px!important; border:1px solid ' + ORO + '!important; box-shadow:0 0 0 4px rgba(' + RP + ',.95), 0 0 0 5px ' + M + '!important; }',
        P + '.pasecard{ border-radius:0!important; box-shadow:inset 0 0 0 5px rgba(' + RP2 + ',.95), inset 0 0 0 6px ' + M + '!important; }'
      );
    }
    if (f === 'burbuja') A.push(
      P + ':is(.evento,.hotel){ border-radius:28px!important; border:3px solid ' + ORO_CL + '!important; box-shadow:0 0 0 5px rgba(246,211,101,.55), 0 12px 24px rgba(' + RT + ',.10)!important; overflow:hidden!important; }',
      P + '.evento .ph{ border-radius:25px 25px 0 0!important; }',
      P + '.tl{ border-radius:28px!important; border:3px solid ' + ORO_CL + '!important; }',
      P + '.padres .av{ border-radius:50%!important; border:4px solid ' + ACENTO + '!important; box-shadow:0 0 0 3px ' + ORO_CL + '!important; }',
      P + '.pasecard{ border-radius:28px!important; }'
    );
    if (f === 'recta') A.push(
      P + ':is(.evento,.hotel,.tl){ border-radius:2px!important; border:1px solid ' + B + '!important; box-shadow:inset 6px 0 0 ' + ORO + ', 0 10px 22px rgba(' + RT + ',.10)!important; }',
      P + '.evento .ph{ border-radius:0!important; clip-path:polygon(0 0,100% 0,100% 86%,0 100%)!important; }',
      P + '.padres .av{ border-radius:12px!important; border:3px solid ' + TINTA + '!important; box-shadow:4px 4px 0 ' + ORO + '!important; }',
      P + '.pasecard{ border-radius:2px!important; box-shadow:inset 6px 0 0 ' + ORO + '!important; }'
    );
    if (f === 'aguada') A.push(
      P + ':is(.evento,.hotel){ border-radius:4px!important; border:0!important; box-shadow:0 14px 30px rgba(' + RT + ',.12), 0 2px 5px rgba(' + RT + ',.08)!important; overflow:hidden!important; }',
      /* una aguada gris de acuarela en el canto de cada tarjeta */
      P + '.hotel{ background-image:radial-gradient(70% 55% at 12% 0%, rgba(138,143,150,.22), rgba(138,143,150,0) 70%), radial-gradient(60% 50% at 100% 100%, rgba(54,56,59,.10), rgba(54,56,59,0) 70%)!important; }',
      P + '.evento .ph{ border-radius:0!important; }',
      P + '.tl{ border-radius:4px!important; border:0!important; border-left:2px solid ' + TINTA + '!important; }',
      P + '.padres .av{ border-radius:50%!important; border:1px solid ' + TINTA + '!important; box-shadow:0 0 0 5px rgba(' + RP + ',.95), 0 0 0 6px ' + B + '!important; }',
      P + '.pasecard{ border-radius:4px!important; }'
    );
    return A.join('\n');
  }

  /* ------------------------------------------------- lo propio de la portada */
  function cssPortadaExtra() {
    var A = [];
    if (E.forma === 'pixel') A.push(
      /* sombra dura de píxel: sin desenfoque, como un sprite */
      P + '#pv-names{ text-shadow:3px 3px 0 ' + ACENTO + ', 0 0 14px rgba(' + RP + ',.9)!important; -webkit-font-smoothing:none!important; }'
    );
    if (E.forma === 'burbuja') A.push(
      /* el nombre como STICKER: contorno blanco grueso */
      P + '#pv-names{ text-shadow:3px 0 0 #fff,-3px 0 0 #fff,0 3px 0 #fff,0 -3px 0 #fff,2px 2px 0 #fff,-2px -2px 0 #fff,2px -2px 0 #fff,-2px 2px 0 #fff, 0 6px 0 ' + ACENTO + '!important; }'
    );
    if (E.forma === 'revista') A.push(
      P + '#pv-kick{ display:inline-block!important; background-color:' + ACENTO + '!important; padding:5px 12px!important; text-shadow:none!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }'
    );
    if (E.nm[0] === 'Bodoni Moda') A.push(
      /* Bodoni trae eje óptico: a 70 px los perfiles finos desaparecen sobre la foto */
      P + '#pv-names, ' + P + '#pv-names *{ font-optical-sizing:none!important; font-variation-settings:"opsz" 11!important; }'
    );
    return A.join('\n');
  }

  /* ------------------------------------------------------------------- CSS */

  function armarCSS() {
    aplicarTono();
    var A = [], HALO = 'rgba(' + RP + ',.85)';
    var KK = E.kk, KCOL = KK[4] === 'm' ? ORO_T : TINTA2;
    var H3 = ff(E.h3), TX = ff(E.txt), DI = ff(E.disp);

    /* ---- 0 · variables propias (las compartidas van en PALETA_PROPIA) ---- */
    A.push(P + '{ --cel-papel:' + PAPEL + '; --cel-papel2:' + PAPEL2 + '; --cel-tinta:' + TINTA + '; --cel-tinta2:' + TINTA2 + '; --cel-filete:' + TINTA3 + '; --cel-metal:' + ORO + '; --cel-acento:' + ACENTO + '; }');

    /* ---- 1 · 🔴 DESTAPAR EL FONDO + EL CLARO RADIAL ----------------------
       El fondo (fx.fondo, foto o video del panel) es PROTAGONISTA: las
       secciones NO son macizas. Va un claro RADIAL CHICO detrás del bloque de
       texto, que se apaga antes del borde (nunca una banda recta).
       ⚠️ El filtro es `:not([style*="url("])`: las secciones con foto propia
          la escriben EN LÍNEA y se las deja en paz. */
    A.push(
      P + '.sec:not([style*="url("]){ background-color:transparent!important; background-image:radial-gradient(ellipse 72% 58% at 50% 47%, rgba(' + RP + ',' + CLARO_A + ') 0%, rgba(' + RP + ',' + (CLARO_A * 0.72).toFixed(3) + ') 46%, rgba(' + RP + ',0) 84%)!important; background-size:100% 100%!important; background-repeat:no-repeat!important; }',
      P + '.sec.verde:not([style*="url("]){ background-color:rgba(' + RP2 + ',.38)!important; }',
      P + '.sec, ' + P + '.sec div, ' + P + '.sec span{ color:' + TINTA2 + '; }',
      /* el halo de papel: lo que sostiene la lectura en el borde del claro */
      P + '.sec :is(h2, .kick, .frase, p, li, .txt){ text-shadow:0 0 10px ' + HALO + ', 0 0 2px rgba(' + RP + ',.6)!important; }'
    );

    /* ---- 1b · el paseo de cámara SÓLO si el fondo es imagen (con video no) */
    A.push(
      P + '#inv-fondo > img{ animation:celebra-paseo 28s ease-in-out infinite alternate!important; will-change:transform!important; transform-origin:50% 42%!important; }',
      '@keyframes celebra-paseo{ 0%{ transform:scale(1) translate3d(0,0,0); } 100%{ transform:scale(1.07) translate3d(-1.4%,-1.8%,0); } }',
      '@media (prefers-reduced-motion: reduce){ ' + P + '#inv-fondo > img{ animation:none!important; } }'
    );

    /* ---- 2 · LA ESCALA TIPOGRÁFICA, REESCRITA POR TONO -------------------
       ⚠️ El molde la calibra para una CURSIVA. Acá el sobretítulo SIEMPRE es
          más chico que el título y cada título entra en UN renglón (px
          pelados: el marco mide 500 fijos). Se gana por especificidad, nunca
          tocando --fs-* (paleta.js las reescribe cada 1,5 s). */
    var h = E.h2;
    A.push(
      P + '.frame .sec h2, ' + P + '.frame .sec .h2, ' + P + '.frame .stitle, ' + P + '.frame .dq-h2, ' + P + '#gal-h2, ' + P + '.gal-h2{ font-family:' + DI + '!important; font-size:' + h[0] + '!important; letter-spacing:' + h[1] + '!important; text-transform:' + h[2] + '!important; font-style:' + h[3] + '!important; font-weight:' + h[4] + '!important; line-height:' + (E.forma === 'pixel' ? 1.7 : 1.2) + '!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '.frame .kick, ' + P + '.frame .sec .kick, ' + P + '#gal-kick, ' + P + '.gal-kick{ font-family:' + ff(KK[0]) + '!important; font-size:' + KK[1] + '!important; text-transform:' + KK[2] + '!important; letter-spacing:' + KK[3] + '!important; text-indent:' + (KK[2] === 'uppercase' ? KK[3] : '0') + '!important; font-style:normal!important; font-weight:' + (KK[2] === 'uppercase' ? 600 : 400) + '!important; line-height:' + (KK[2] === 'uppercase' ? 1.4 : 1.25) + '!important; color:' + KCOL + '!important; -webkit-text-fill-color:' + KCOL + '!important; }',
      P + '.sec p, ' + P + '.sec li, ' + P + '.sec .txt{ font-family:' + TX + '!important; color:' + TINTA2 + '!important; }',
      P + '.sec p:not(.frase){ font-size:15.5px!important; line-height:1.66!important; }',
      /* §85.6 · en un tono claro los textos sueltos van en TINTA, no en TINTA2
         (TINTA2 queda para adentro de tarjetas, que tienen su papel .84) */
      P + '.sec p:not(:is(.evento, .hotel, .pasecard, .cf-letter, .tl, .footer, .banco) *){ color:' + TINTA + '!important; font-weight:400!important; }',
      P + '.frase{ font-family:' + (E.scr ? TX : DI) + '!important; font-size:' + (E.forma === 'pixel' ? '17px' : '18px') + '!important; line-height:1.6!important; color:' + TINTA + '!important; }',
      P + '.num, ' + P + '.sec .num, ' + P + '.it .h{ font-variant-numeric:lining-nums!important; }',
      P + '.sec hr, ' + P + '.filete, ' + P + '.sep{ border-color:' + TINTA3 + '!important; background:' + TINTA3 + '!important; }'
    );

    /* ---- 3 · LA PORTADA: el bloque AL PIE, nunca sobre la cara ----------
       ⚠️ Por ID: #pv-names y #pv-kick vienen con !important en
          i/estilos-servidor.css y un ID le gana a cualquier cadena de clases. */
    var n = E.nm, k = E.pk;
    A.push(
      P + '.portada{ justify-content:flex-end!important; }',
      P + '#pv-kick{ font-family:' + ff(k[0]) + '!important; font-size:' + k[1] + '!important; text-transform:' + k[2] + '!important; letter-spacing:' + k[3] + '!important; text-indent:' + k[3] + '!important; font-style:' + k[4] + '!important; font-weight:' + (k[2] === 'uppercase' ? 600 : 400) + '!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 1px 3px rgba(' + RP + ',.95), 0 0 10px rgba(' + RP + ',.8)!important; }',
      P + '#pv-names, ' + P + '.portada h1, ' + P + '#nombre{ font-family:' + ff(n[0]) + '!important; font-size:' + n[1] + '!important; font-style:' + n[2] + '!important; font-weight:' + n[3] + '!important; text-transform:' + n[4] + '!important; letter-spacing:' + n[5] + '!important; text-indent:' + (n[4] === 'uppercase' ? n[5] : '0') + '!important; line-height:' + n[6] + '!important; padding-bottom:.12em!important; white-space:normal!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 0 18px rgba(' + RP + ',.85)!important; }',
      P + '#pv-names *{ font-family:inherit!important; font-style:inherit!important; font-weight:inherit!important; }',
      P + '#pv-names span{ padding:0 .08em .12em!important; }',
      P + '.portada .num{ font-family:' + DI + '!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; font-variant-numeric:lining-nums!important; }',
      P + '.portada :is(.lab,.sep,.fecha,.u), ' + P + '.count .lab{ color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; text-shadow:0 1px 3px rgba(' + RP + ',.95), 0 0 9px rgba(' + RP + ',.75)!important; }',
      P + '.count :is(.n,.num,b){ color:' + TINTA + '!important; }',
      /* el claro de la portada: RADIAL y que muera ANTES del borde de su caja
         (radio ≤ 56 %: si no, quedan dos costuras verticales — Sirena) */
      P + '.portada > .c{ position:relative!important; }',
      /* el velo del motor es OSCURO (negro .66 abajo): sobre una colección clara con el claro radial
         daba un gris barroso en toda la foto. Velo claro sólo abajo, como Óleo (19/10/2026) */
      P + '.portada .pveil{ background:linear-gradient(to bottom, rgba(' + RP + ',0) 48%, rgba(' + RP + ',.42) 100%)!important; }',
      P + '.portada > .c::before{ content:""!important; position:absolute!important; left:-50%!important; right:-50%!important; bottom:-45%!important; height:190%!important; pointer-events:none!important; z-index:-1!important; background:radial-gradient(56% 56% at 50% 52%, rgba(' + RP + ',.80) 0%, rgba(' + RP + ',.44) 46%, rgba(' + RP + ',0) 88%)!important; }'
    );

    /* ---- 4 · LAS TARJETAS: papel TRANSLÚCIDO, nunca macizo -------------- */
    A.push(
      P + ':is(.evento, .hotel, .pasecard, .tl){ background-color:rgba(' + RP + ',.84)!important; background-image:none!important; border:1px solid rgba(' + RT3 + ',.7)!important; box-shadow:0 10px 24px rgba(' + RT + ',.10)!important; width:auto!important; border-radius:' + E.radio + '!important; }',
      P + '.hotel{ padding:30px 18px 18px!important; text-align:center!important; }',
      P + '.hotel .btn{ margin:10px auto 0!important; }',
      P + '.evento .ph{ height:230px!important; }',
      /* UNA lista por elemento: los títulos NO entran en la de cuerpo (Sirena) */
      P + ':is(.evento, .hotel, .pasecard) :is(p, .sub, .addr, .k){ color:' + TINTA2 + '!important; text-shadow:none!important; }',
      P + ':is(.evento, .hotel) :is(h3, h4), ' + P + '.pasecard .v{ color:' + TINTA + '!important; font-family:' + H3 + '!important; }',
      P + '.ev .lugar, ' + P + '.evento .lugar{ color:' + ORO_T + '!important; }'
    );

    /* ---- 5 · PERSONAS: las tres en una fila ----------------------------- */
    A.push(
      P + '.padres{ grid-template-columns:repeat(3,1fr)!important; gap:10px 8px!important; background-color:transparent!important; }',
      P + '.padres[data-col-n="1"]{ grid-template-columns:minmax(0,220px)!important; justify-content:center!important; }',
      P + '.padres[data-col-n="2"]{ grid-template-columns:repeat(2,1fr)!important; }',
      P + '.padres[data-col-n="4"]{ grid-template-columns:repeat(4,1fr)!important; gap:8px 6px!important; }',
      P + '.padres .av{ width:104px!important; height:104px!important; border-radius:50%!important; }',
      P + '.padres .nm{ font-family:' + H3 + '!important; font-size:' + (E.forma === 'pixel' ? '17px' : '18px') + '!important; color:' + TINTA + '!important; }',
      P + '.padres .rel{ color:' + TINTA2 + '!important; }',
      '@media (max-width:360px){ ' + P + '.padres{ gap:8px 5px!important; } ' + P + '.padres .av{ width:88px!important; height:88px!important; } }'
    );

    /* ---- 6 · EL ITINERARIO -----------------------------------------------
       La marca es la PIEZA fotografiada. Si el motor ya calcula una posición
       no se la reemplaza: se la corrige por la diferencia (26 − 11) / 2 = 7,5.
       ⚠️ La opacidad la maneja el revelado del motor (.on): se acompaña. */
    A.push(
      P + '.tl{ overflow:visible!important; position:relative!important; }',
      P + '.tl:not(.tl-centro){ padding:30px 18px 26px 48px!important; }',
      P + '.tl.tl-centro{ padding:30px 14px 26px!important; }',   /* 19/10: el zigzag tampoco pega arriba (mis30-martin) */
      P + '.tl:not(.tl-centro)::before, ' + P + '.tl:not(.tl-centro) > .tl-prog{ left:25px!important; }',
      P + '.tl::before, ' + P + '.tl > .tl-prog{ top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important; }',
      P + '.tl::before{ background-image:radial-gradient(circle, ' + TINTA3 + ' 1.2px, rgba(0,0,0,0) 1.3px)!important; background-size:3px 9px!important; background-repeat:repeat-y!important; background-color:transparent!important; width:3px!important; opacity:1!important; }',
      P + '.tl > .tl-prog{ background-color:' + ORO + '!important; width:2px!important; opacity:.9!important; }',
      P + '.tl > .it::before{ width:26px!important; height:26px!important; margin-left:-7.5px!important; margin-top:-7.5px!important; border-radius:50%!important; background-color:' + PAPEL + '!important; background-image:url("' + PIEZA_CH + '")!important; background-size:cover!important; background-repeat:no-repeat!important; background-position:center!important; box-shadow:0 0 0 1px ' + ORO + ', 0 2px 6px rgba(' + RT + ',.22)!important; border:0!important; z-index:2!important; }',
      P + '.tl.tl-centro > .it::before{ margin-top:-13px!important; }',
      P + '.tl.tl-centro > .it:nth-child(odd)::before{ margin-left:0!important; margin-right:-7.5px!important; }',
      /* §87 · las marcas van ARRIBA de la línea */
      P + '.tl > .it{ z-index:1!important; }',
      P + '.tl > .tl-prog{ z-index:0!important; }',
      P + '.tl.tl-anim > .it:not(.on)::before{ opacity:0!important; }',
      P + '.tl.tl-anim > .it.on::before{ opacity:1!important; }',
      P + ':is(.tl .hora, .it .h){ color:' + TINTA + '!important; font-family:' + H3 + '!important; }',
      P + ':is(.tl .det, .it .d, .it .t){ color:' + TINTA2 + '!important; font-family:' + TX + '!important; }'
    );

    /* ---- 7 · EL ADORNO DE LOS TÍTULOS ------------------------------------
       ⚠️ El adorno del motor trae los ANILLOS DE BODA (dos círculos): se
          esconden; los filetes de los costados quedan. */
    A.push(
      P + '.sec h2 .adorno, ' + P + '.adorno{ background-image:url("' + adornoSVG(ORO === '#111111' ? TINTA : ORO) + '")!important; background-repeat:no-repeat!important; background-position:center!important; background-size:contain!important; }',
      P + '.adorno svg g:nth-of-type(2), ' + P + '.adorno svg circle{ display:none!important; }',
      P + '.adorno svg :is(line, path){ stroke:' + TINTA3 + '!important; }',
      /* `fx.diseno.adorno` VACÍO = el motor no pone ningún `.adorno` (buildAdornos
         se va con return). La colección dibuja el suyo igual, en el mismo lugar
         (antes del .kick) y con la misma caja de 112×40 del motor. */
      P + 'section.sec:not(:has(> .adorno)):not(.portada):not(.pase):not(.footer) > .kick::before{ content:""!important; display:block!important; width:112px!important; height:40px!important; margin:2px auto 6px!important; background:url("' + adornoSVG(ORO === '#111111' ? TINTA : ORO) + '") center/contain no-repeat!important; }'
    );

    /* ---- 8 · EL PASE: medallón de la pieza, nunca básico blanco ----------
       ⚠️ Los rótulos son `.k` y `.v`. El cuadrado del QR queda BLANCO. */
    A.push(
      P + '.frame .pase, ' + P + 'section.pase{ background-color:transparent!important; position:relative!important; }',
      P + '.pase > *{ position:relative!important; z-index:1!important; }',
      P + '.pase > .t{ font-family:' + DI + '!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 0 10px ' + HALO + '!important; }',
      P + '.pasecard{ position:relative!important; overflow:visible!important; padding-top:34px!important; }',
      P + '.pasecard::before{ content:""!important; display:block!important; position:absolute!important; left:50%!important; top:-18px!important; width:36px!important; height:36px!important; margin-left:-18px!important; border-radius:50%!important; background:url("' + PIEZA_MD + '") center/cover no-repeat, ' + PAPEL + '!important; box-shadow:0 0 0 2px ' + PAPEL + ', 0 0 0 3px ' + ORO + ', 0 4px 10px rgba(' + RT + ',.2)!important; z-index:3!important; pointer-events:none!important; }',
      P + '.pasecard .k{ color:' + TINTA2 + '!important; letter-spacing:.14em!important; text-transform:uppercase!important; font-size:10.5px!important; font-family:' + TX + '!important; }',
      P + '.pasecard .v{ font-size:15px!important; }',
      P + '.pasecard .t{ font-family:' + DI + '!important; color:' + TINTA + '!important; }',
      P + '.pasecard .estado{ background-color:rgba(' + RM + ',.16)!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; border:1px solid rgba(' + RM + ',.55)!important; }'
    );

    /* ---- 9 · LA RASPADITA: sin recuadro, la tapa es la pieza -------------
       ⚠️ SIN PREFIJO: el canvas se pinta al cargar, antes de data-col (la
          hoja sólo existe con la colección puesta, así que no se escapa). */
    A.push(
      ':is(.scratch-sec, .rasp-3, .rasp-zona, #scratchcard){ --r3-tapa:url("' + PIEZA_TAPA + '"); }',
      P + ':is(.scratch-sec, .rasp-3, .rasp-zona, #scratchcard){ --r3-tapa:url("' + PIEZA_TAPA + '")!important; }',
      /* §81.1 · la sección de la raspadita con su claro radial (si no, la acuarela blanca suelta) */
      P + '.scratch-sec{ background-color:transparent!important; background-image:radial-gradient(ellipse 72% 58% at 50% 47%, rgba(' + RP + ',' + CLARO_A + ') 0%, rgba(' + RP + ',' + (CLARO_A * 0.72).toFixed(3) + ') 46%, rgba(' + RP + ',0) 84%)!important; }',
      /* §85.3 · círculo LISO: el velo oscuro de fecha.js deja el número sucio */
      P + '.ivf-circ .c::after{ display:none!important; }',
      P + '.rasp-zona.dormida canvas{ filter:none!important; }',
      P + ':is(.scratchcard, #scratchcard){ background-color:transparent!important; background-image:none!important; border:0!important; box-shadow:none!important; }',
      P + ':is(.scratchcard, #scratchcard)::after{ display:none!important; }',
      P + '.rasp-zona{ box-shadow:0 0 0 3px rgba(' + RP + ',.95), 0 0 0 4px ' + ORO + '!important; }',
      P + '.ivf .c{ background-color:' + PAPEL2 + '!important; background-image:none!important; border-radius:50%!important; box-shadow:0 4px 10px rgba(' + RT + ',.18)!important; }',
      P + '.ivf .n{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; font-family:' + DI + '!important; }'
    );

    /* ---- 10 · LAS TAPAS DE VIDEO Y PLAYLIST: `.rd-tapa` -----------------
       ⚠️ Es la MISMA clase en las dos: se separan POR SECCIÓN. */
    var CENTRO = 'radial-gradient(circle at 50% 50%, rgba(' + RT + ',.36) 0, rgba(' + RT + ',.14) 26%, rgba(' + RT + ',0) 46%)';
    A.push(
      P + '#video-sec .rd-tapa{ background:' + CENTRO + ', url("' + TAPA_VIDEO + '") center/cover no-repeat!important; border-radius:' + (E.radio === '0' ? '0' : '16px') + '!important; border:0!important; box-shadow:0 12px 28px rgba(' + RT + ',.20), 0 0 0 1px ' + ORO + '!important; }',
      P + '#spotify-sec .rd-tapa{ background:' + CENTRO + ', url("' + TAPA_PLAY + '") center/cover no-repeat!important; border-radius:' + (E.radio === '0' ? '0' : '16px') + '!important; border:0!important; box-shadow:0 12px 28px rgba(' + RT + ',.20), 0 0 0 1px ' + ORO + '!important; }',
      P + '.rd-tapa .rd-aro{ border-color:' + ORO_CL + '!important; background:rgba(' + RT + ',.45)!important; box-shadow:0 0 0 1px rgba(' + RP + ',.5), 0 6px 18px rgba(' + RT + ',.3)!important; opacity:1!important; }',
      P + '.rd-tapa .rd-aro::after{ border-left-color:' + PAPEL + '!important; }',
      /* §81.2 · el rótulo en CÁPSULA rgba(tinta×.6,.86): blanco sobre foto clara no se lee */
      P + '.rd-tapa .rd-txt{ display:inline-block!important; padding:5px 14px!important; border-radius:999px!important; background-color:rgba(' + RT.split(',').map(function (v) { return Math.round(v * 0.6); }).join(',') + ',.86)!important; color:#FFFFFF!important; -webkit-text-fill-color:#FFFFFF!important; font-family:' + TX + '!important; letter-spacing:.16em!important; text-shadow:none!important; }'
    );

    /* ---- 11 · 🔴 LOS BOTONES: LA COLECCIÓN NO CLAVA EL COLOR ------------
       El material lo elige Jazmín (`fx.boton.estilo`, efectos/botones.js) y
       cada estilo trae su color con !important. La colección PROPONE sin
       !important, y el relleno de los íconos va en currentColor. */
    A.push(
      P + '.btn:not(.gh):not(.ghost){ color:' + PAPEL + '; -webkit-text-fill-color:currentColor; letter-spacing:.12em; }',
      /* §85.5 · TODOS los botones con la forma del tono (radio y letra), no sólo .btn */
      P + ':is(.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn, #filtro-abrir, #gal-entrar, .sec a[href*=liverpool], .sec a[href*=amazon]){ font-family:' + TX + '!important; border-radius:' + E.boton + '!important; }',
      P + ':is(.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn, #filtro-abrir, #gal-entrar) svg{ fill:currentColor; }',
      P + ':is(.btn.gh, .btn.ghost, a.btn.ghost){ background-color:transparent!important; background-image:none!important; border:1px solid rgba(' + RT + ',.5)!important; box-shadow:none!important; color:' + TINTA + '; -webkit-text-fill-color:currentColor; }',
      P + '.btn .chev, ' + P + '.chev{ color:inherit!important; opacity:.85!important; }',
      /* los WhatsApp, vestidos con la letra de la colección */
      P + '.wsp{ text-transform:uppercase!important; letter-spacing:.14em!important; font-size:12.5px!important; font-weight:600!important; }',
      /* #filtro-abrir nace con background var(--verde) (= TINTA) y sin color */
      P + '#filtro-abrir{ color:' + PAPEL + '; -webkit-text-fill-color:currentColor; }'
    );

    /* ---- 12 · LOS CAMPOS ------------------------------------------------ */
    A.push(
      P + ':is(input, select, textarea, .tv-in){ background-color:rgba(' + RP + ',.9)!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; border:1px solid rgba(' + RT3 + ',.95)!important; }',
      P + ':is(input, textarea, .tv-in)::placeholder{ color:rgba(' + rgb(TINTA2) + ',.62)!important; -webkit-text-fill-color:rgba(' + rgb(TINTA2) + ',.62)!important; }',
      /* §81.4 / §49.5 · rótulos en la TINTA, en color y en text-fill */
      P + ':is(label, .rsvp label, .rsvp .lbl, .form-lbl, .rsvpform label, .padres .rl){ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      /* §50 · los pasos sobre fondo oscuro de «cómo confirmar» */
      P + '.si-como.si-osc .si-card span{ color:rgba(' + RP + ',.86)!important; -webkit-text-fill-color:rgba(' + RP + ',.86)!important; }',
      /* §81.7 · las flechas del carrusel nacen ROJAS rgb(157,0,17) */
      P + '.carousel .ar{ color:#FFFFFF!important; -webkit-text-fill-color:#FFFFFF!important; text-shadow:0 1px 4px rgba(' + RT + ',.8)!important; }',
      /* §81.6 · el costado de la pantalla ancha, del tono y no del beige del motor */
      'html[data-col="celebra"][data-coleccion="celebra"] body{ background-color:' + PAPEL2 + '!important; }',
      /* §81.5 · el tinte del sobre de la carta: fx.carta.sobreColor no lo cambia */
      P + ':is(.cf-back-tint, .cf-front-tint){ opacity:1!important; background-color:' + PAPEL2 + '!important; }',
      P + '.col-dc-c{ box-shadow:inset 0 0 0 1px rgba(' + RT + ',.28), 0 1px 3px rgba(' + RT + ',.14)!important; }'
    );

    /* ---- 13 · LA CARTA, ¿ALGUNA DUDA? Y EL PIE --------------------------
       ⚠️ Hay que nombrar cada elemento de la carta: `.cf-letter *` no le gana
          a `.sec p` (las dos valen 0,3,1). */
    A.push(
      P + '.cf-letter{ background:linear-gradient(180deg, rgba(' + RP + ',.96) 0%, rgba(' + RP2 + ',.94) 100%)!important; border:1px solid rgba(' + RT3 + ',.7)!important; }',
      P + '.cf-letter, ' + P + '.cf-letter :is(p, h3, h4, li, span, em, strong), ' + P + '.cf-letter *{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:none!important; }',
      P + '.cf-letter :is(h3, h4){ font-family:' + DI + '!important; }',
      P + '#contacto-sec{ background-color:rgba(' + RP + ',.42)!important; }',
      P + '#contacto-sec :is(h2, .kick, p, .txt){ text-shadow:0 0 12px ' + HALO + ', 0 1px 2px rgba(' + RP + ',.9)!important; }',
      /* el pie va SOBRE LA FOTO del cierre (--final): letra blanca plena con
         sombra (§81.3), y un velo de tinta translúcido abajo, nunca papel opaco */
      P + '.footer{ position:relative!important; background-image:linear-gradient(rgba(' + RT + ',.18) 0%, rgba(' + RT + ',.52) 100%), var(--final, none)!important; background-size:cover!important; background-position:center!important; }',
      P + '.footer :is(#fin-texto, #fin-nombres, .col-mvta-t, .col-mvta-b, h1, h2, h3, p){ color:#FFFFFF!important; -webkit-text-fill-color:#FFFFFF!important; text-shadow:0 1px 3px rgba(' + RT + ',.9), 0 0 14px rgba(' + RT + ',.6)!important; }',
      P + '.footer a{ color:#FFFFFF!important; }'
    );

    A.push(cssForma());
    A.push(cssPortadaExtra());

    /* ---- 14 · §62 · EL PASE: RECTÁNGULO de 16 px, filete interior y la pieza
       de medallón arriba al centro. Sin arco. Va DESPUÉS de cssForma(): gana. */
    A.push(P + '.pasecard{ border-radius:16px!important; border:0!important; clip-path:none!important; background-color:rgba(' + RP + ',.9)!important; box-shadow:inset 0 0 0 7px rgba(' + RP + ',.95), inset 0 0 0 8px rgba(' + RM + ',.6), 0 10px 24px rgba(' + RT + ',.12)!important; }');

    /* ---- 15 · el cielo del ambiente 'nubes' es un cielo DIURNO BLANCO: en
       los tonos que no son de cielo claro se repinta con el papel del tono */
    if (!E.cielo) A.push(P + '.ambiente .sky{ background-image:radial-gradient(1.6px 1.6px at 22% 18%, rgba(' + RM + ',.7), rgba(' + RM + ',0) 60%), radial-gradient(1.4px 1.4px at 71% 42%, rgba(' + RM + ',.6), rgba(' + RM + ',0) 60%), radial-gradient(1.8px 1.8px at 40% 78%, rgba(' + RM + ',.6), rgba(' + RM + ',0) 60%), linear-gradient(180deg, rgba(' + RP + ',.92) 0%, rgba(' + RP2 + ',.88) 100%)!important; background-size:150px 150px,150px 150px,150px 150px,100% 100%!important; background-repeat:repeat,repeat,repeat,no-repeat!important; background-color:' + PAPEL + '!important; }');

    /* ---- 16 · Bodoni Moda: sin tamaño óptico automático (los perfiles finos
       desaparecen sobre la foto) */
    /* ---- 17 · letras anchas (pixel): la cuenta regresiva y el título del pase
       no pueden salirse del teléfono (medido el 19/10 en mateo-cumple5) */
    if (tono() === 'pixel') A.push(P + '.portada .num{ font-size:clamp(26px,8vw,38px)!important; } ' + P + '.pase > .t{ font-size:clamp(26px,7.4vw,34px)!important; line-height:1.12!important; }');
    if (E.disp === 'Bodoni Moda') A.push(P + ':is(h2, h3, h4, .t, .v, .num, .it .h, #pv-names, #pv-names *){ font-optical-sizing:none!important; font-variation-settings:"opsz" 11!important; }');
    return A.join('\n');
  }

  /* ---------------------------------------------------------------- fuentes */

  function fuentes() {
    var k = tono(), T = TONOS[k], marca = ID + '-' + k;
    if (document.querySelector('link[data-col-fuentes="' + marca + '"]')) return;
    var fam = [], vistos = {};
    [T.disp, T.scr, T.txt, T.h3, T.nm[0], T.pk[0], T.kk[0]].forEach(function (n) {
      if (!n || vistos[n]) return; vistos[n] = 1;
      fam.push('family=' + n.replace(/ /g, '+') + (EJES[n] || ''));
    });
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + fam.join('&') + '&display=swap';
    l.setAttribute('data-col-fuentes', marca);
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------ poner/sacar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    return s;
  }

  /* ⚠️ `reglas-duras.js` escribe `color` INLINE con !important: contra un
     inline no hay hoja que gane, hay que BORRARLO en cada repaso. Se barre por
     `data-regla-orig`, la firma del propio corrector, sólo dentro de .frame. */
  function limpiarInlines() {
    try {
      [].forEach.call(document.querySelectorAll('.frame [data-regla-orig]'), function (e) {
        if (e.style) { e.style.removeProperty('color'); e.style.removeProperty('-webkit-text-fill-color'); }
        e.removeAttribute('data-regla-orig');
      });
      [].forEach.call(document.querySelectorAll('.rd-tapa .rd-txt, .cf-letter, .cf-letter *'), function (e) {
        if (e.style && e.style.color) { e.style.removeProperty('color'); e.style.removeProperty('-webkit-text-fill-color'); }
      });
    } catch (e) {}
  }

  function marcarPadres() {
    try {
      var p = document.querySelector('.padres'); if (!p) return;
      var n = String(p.children.length);
      if (p.getAttribute('data-col-n') !== n) p.setAttribute('data-col-n', n);
    } catch (e) {}
  }
  function desmarcarPadres() {
    try { var p = document.querySelector('.padres'); if (p) p.removeAttribute('data-col-n'); } catch (e) {}
  }

  /* LA VÍA EMPIEZA Y TERMINA EN EL CENTRO DE LA MARCA (Degradé, 3/10) */
  function marcaY(el) {
    var r = el.getBoundingClientRect();
    try {
      var c = getComputedStyle(el, '::before');
      var t = parseFloat(c.top), m = parseFloat(c.marginTop) || 0, h = parseFloat(c.height);
      if (c.content !== 'none' && isFinite(t) && isFinite(h) && h > 0) return r.top + t + m + h / 2;
    } catch (e) {}
    return r.top + r.height / 2;
  }
  function recortarVia() {
    try {
      var tl = document.querySelector('.tl'); if (!tl) return;
      var f = tl.querySelectorAll('.it'); if (!f.length) return;
      var R = tl.getBoundingClientRect();
      tl.style.setProperty('--tl-ini', Math.round(marcaY(f[0]) - R.top) + 'px');
      tl.style.setProperty('--tl-fin', Math.round(R.bottom - marcaY(f[f.length - 1])) + 'px');
    } catch (e) {}
  }
  function soltarVia() {
    try {
      var tl = document.querySelector('.tl'); if (!tl) return;
      tl.style.removeProperty('--tl-ini'); tl.style.removeProperty('--tl-fin');
    } catch (e) {}
  }

  /* 🔴 EL PASE CON EL QR VA ABAJO DE LA RASPADITA (Fracaso J de Cantera).
     ⚠️ devolverPase() va ADENTRO del if de sacar(). */
  function moverPase() {
    try {
      var pase = document.querySelector('.pase');
      var rasp = document.querySelector('.sec.scratch-sec');
      if (!pase || !rasp) return;
      if (rasp.parentElement !== pase.parentElement) return;
      var ant = pase.previousElementSibling;
      if (ant && ant.id === 'pv-sec') ant = ant.previousElementSibling;
      if (ant === rasp) return;
      var tras = rasp.nextSibling && rasp.nextSibling.id === 'pv-sec' ? rasp.nextSibling : rasp;
      rasp.parentNode.insertBefore(pase, tras.nextSibling);
    } catch (e) {}
  }
  function devolverPase() {
    try {
      var pase = document.querySelector('.pase');
      var port = document.querySelector('.portada');
      if (!pase || !port) return;
      if (port.parentElement !== pase.parentElement) return;
      if (pase.previousElementSibling === port) return;
      port.parentNode.insertBefore(pase, port.nextSibling);
    } catch (e) {}
  }

  function poner() {
    fuentes();
    var css = armarCSS(), s = hoja();
    /* sólo se reescribe si cambió (cambiar el tono desde el panel): reescribir
       la misma hoja cada 1,2 s obliga al navegador a recalcular todo */
    if (s.textContent !== css) s.textContent = css;
    document.documentElement.setAttribute('data-col', ID);
    document.documentElement.setAttribute('data-coleccion', ID);
    PALETA_PROPIA = paletaPropia();
    window.INVCOLPALETA = PALETA_PROPIA;
    document.documentElement.setAttribute('data-marca-propia', ID);
    marcarPadres();
    moverPase();
    recortarVia();
    limpiarInlines();
    /* ⚠️ NADA DE MutationObserver: el repaso de 1,2 s alcanza. */
  }

  function sacar() {
    var s = document.getElementById(ID_CSS); if (s) s.remove();
    /* ⚠️ todo lo demás SÓLO si esta colección estaba puesta: si no, le pelea
       el pase y `data-col-n` a las otras (Perlas, 29/9). */
    if (document.documentElement.getAttribute('data-col') === ID) {
      desmarcarPadres();
      devolverPase();
      soltarVia();
      document.documentElement.removeAttribute('data-col');
      document.documentElement.removeAttribute('data-coleccion');
      if (document.documentElement.getAttribute('data-marca-propia') === ID) document.documentElement.removeAttribute('data-marca-propia');
      if (PALETA_PROPIA && window.INVCOLPALETA === PALETA_PROPIA) {
        try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; }
      }
    }
  }

  function sincronizar() { if (activa()) poner(); else sacar(); }

  /* ⚠️ EL REPASO DE 1,2 s ES OBLIGATORIO: INVEV puede llegar después de load. */
  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
