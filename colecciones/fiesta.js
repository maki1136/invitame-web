/* ============================================================================
   COLECCIÓN «FIESTA»  ·  id `fiesta`  ·  19/10/2026
   La familia OSCURA de los eventos nuevos (cumpleaños, corporativo, graduación,
   XV de varón). Misma arquitectura que `degrade.js` —TONOS + ESTILOS por tono—
   pero pensada para que el FONDO (fx.fondo: la foto o el video que se elige
   desde el panel) sea el protagonista: las secciones NO van macizas, sólo
   llevan un claro/oscuro radial chico detrás del texto.
   ⭐ TONOS: fx.coleccion = 'fiesta-<tono>'  (y ?coleccion=fiesta-<tono> para probar)
        noche · plata · ejecutivo · gala · brindis · birrete · bokeh · urbano
      'fiesta' a secas = noche.
   ⚠️ VIENE APAGADA: sin fx.coleccion fiesta* no hace nada (viaja en todo.php).
   ⚠️ CONVIVE CON DEGRADÉ: su propio ID, su propia hoja (#col-fiesta), su propio
      data-col="fiesta". Todo lo que escribe afuera de su hoja va en poner() y se
      deshace en sacar(), y sacar() sólo deshace si la puesta era ÉSTA.
   ============================================================================ */
(function () {

  var ID     = 'fiesta';
  var ID_CSS = 'col-fiesta';
  var P      = 'html[data-col="fiesta"][data-coleccion="fiesta"] ';
  var CL     = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';

  /* ---------------------------------------------------------------- LOS TONOS
     papel · papel2 (pozos y marco) · panel (tarjetas) · filete (SÓLO líneas,
     NUNCA texto) · tinta (títulos, nombres, datos) · tinta2 (bajadas y cuerpo)
     · base (el fondo de Cloudinary ev-<base>-base.jpg; lo elige el panel, no la colección)

     CONTRASTES MEDIDOS (WCAG, contra el PAPEL del tono — el radial de atrás del
     texto lo deja en ese papel al 70 %; cuerpo ≥ 7, chicos ≥ 4,5):
                  TINTA   TINTA2   ACENTO (kick, hora, rótulos)   ACENTO_CL
       noche      14,43   10,30    oro       7,62                 10,64
       plata      16,15   10,96    plata    10,21                 15,06
       ejecutivo  15,37   10,00    cian      9,89                 13,99
       gala       15,82   10,85    oro       8,34                 11,65
       brindis    15,31   10,64    champ.   10,68                 14,46
       birrete    16,20   11,14    oro       8,39                 11,73
       bokeh      15,66   10,70    oro       8,22                 11,48
       urbano     14,67    9,82    mostaza   8,83                 11,37
     Botón (letra PAPEL2 sobre el metal): oro 8,3 · mostaza 9,6 · cian 10,4.
     Nada de esto es el violeta de Perlas (rgb 70,59,82): está prohibido acá. */
  var TONOS = {
    noche:     { papel:'#0E1530', papel2:'#080D20', panel:'#18224A', filete:'#4A5680', tinta:'#EDE6D3', tinta2:'#C9C4B4', base:'noche-oro' },
    plata:     { papel:'#121214', papel2:'#0A0A0B', panel:'#1E1E22', filete:'#5A5C62', tinta:'#EEEEF0', tinta2:'#C4C6CC', base:'plata40' },
    ejecutivo: { papel:'#0A1A33', papel2:'#06101F', panel:'#10284A', filete:'#3E5A7E', tinta:'#EAF2FA', tinta2:'#B8C6D6', base:'ejecutivo' },
    gala:      { papel:'#0B0B0C', papel2:'#050506', panel:'#17171A', filete:'#5A523E', tinta:'#EFE6CF', tinta2:'#C8C0AA', base:'gala-deco' },
    brindis:   { papel:'#0D1426', papel2:'#070B17', panel:'#172140', filete:'#4E5878', tinta:'#F1EADB', tinta2:'#C9C5BA', base:'brindis' },
    birrete:   { papel:'#0A0A0A', papel2:'#040404', panel:'#161616', filete:'#57503C', tinta:'#F0E8D2', tinta2:'#C9C2AE', base:'birrete' },
    bokeh:     { papel:'#100D08', papel2:'#090704', panel:'#1C1710', filete:'#5E5340', tinta:'#F2E6CC', tinta2:'#CDBFA4', base:'bokeh' },
    urbano:    { papel:'#1A1B1D', papel2:'#111214', panel:'#26282B', filete:'#5E6064', tinta:'#EDEDE8', tinta2:'#C3C4BF', base:'urbano' }
  };

  /* ⭐ CADA TONO CON SU PROPIO DISEÑO (no sólo el color). Por tono:
       disp/scr/txt → la tipografía (títulos · cursiva · cuerpo). Sin cursiva,
                      `scr` es la display.
       adorno       → la viñeta de arriba de cada título (SVG dibujado a 18 px)
       forma        → la forma de tarjetas, itinerario y retratos
       port         → el armado del nombre en la portada
       metal        → el acento (oro · plata · champagne · mostaza)
       h2 / kick    → LA ESCALA de las secciones: [familia, px, espaciado, versal, peso]
                      el sobretítulo (kick) SIEMPRE más chico que el título. Las
                      cursivas de trazo finísimo (Mrs Saint Delafield, Monsieur La
                      Doulaise) a menos de 24 px no se leen: en esos tonos el
                      sobretítulo va en versal del cuerpo y la cursiva queda para
                      la portada (30 px).
       btn          → la letra de los botones y de los .wsp: [familia, espaciado, versal]
       recto        → formas rectas (sin arcos ni festones): ejecutivo y urbano */
  var ESTILOS = {
    /* 1 · Cumpleaños · Noche de oro — azul medianoche, filetes art déco finos */
    noche:     { disp:'Poiret One',   scr:'Mrs Saint Delafield', txt:'Lato',    metal:'oro',
                 adorno:'estrella', forma:'filetes', port:'deco',
                 h2:['disp',23,'.1em',1,400], kick:['txt',11,'.36em',1,700], btn:['disp','.16em',1] },
    /* 2 · Cumpleaños · Plata 40 — negro mate, plata cromada, banderines */
    plata:     { disp:'Bebas Neue',   scr:'Bebas Neue',          txt:'Manrope', metal:'plata',
                 adorno:'banderin', forma:'banderin', port:'bloque',
                 h2:['disp',36,'.05em',1,400], kick:['txt',12,'.34em',1,600], btn:['disp','.14em',1] },
    /* 3 · Corporativo · Ejecutivo azul — azul marino tech, plata y cian, todo recto */
    ejecutivo: { disp:'Space Grotesk', scr:'Space Grotesk',      txt:'Inter',   metal:'plata', acento:'#5FD3E6', recto:1,
                 adorno:'tech', forma:'tech', port:'tech',
                 h2:['disp',26,'-.01em',0,500], kick:['txt',12,'.24em',1,500], btn:['txt','.08em',0] },
    /* 4 · Corporativo · Gala art déco — negro y oro, marco art déco */
    gala:      { disp:'Cinzel',       scr:'Monsieur La Doulaise', txt:'Raleway', metal:'oro',
                 adorno:'zigurat', forma:'deco', port:'deco',
                 h2:['disp',21,'.07em',1,500], kick:['txt',11,'.34em',1,500], btn:['disp','.14em',1] },
    /* 5 · Corporativo · Brindis de Año Nuevo — azul noche, burbujas doradas */
    brindis:   { disp:'Marcellus',    scr:'Italianno',           txt:'Outfit',  metal:'champagne',
                 adorno:'burbujas', forma:'burbuja', port:'script',
                 h2:['disp',27,'.03em',0,400], kick:['scr',26,'0',0,400], btn:['disp','.12em',1] },
    /* 6 · Graduación · Birrete de gala — negro con rayos dorados, versal espaciada */
    birrete:   { disp:'Montserrat',   scr:'Allura',              txt:'Montserrat', metal:'oro',
                 adorno:'birrete', forma:'diploma', port:'versal',
                 h2:['disp',20,'.16em',1,500], kick:['txt',11,'.34em',1,600], btn:['disp','.2em',1] },
    /* 7 · XV · Bokeh dorado (XV de varón) — negro con guirnalda de foquitos */
    bokeh:     { disp:'Playfair Display', scr:'Pinyon Script',   txt:'Lato',    metal:'oro',
                 adorno:'foquitos', forma:'halo', port:'italica',
                 h2:['disp',28,'.01em',0,500], kick:['scr',26,'0',0,400], btn:['disp','.08em',0] },
    /* 8 · Cumpleaños · Urbano 18 — concreto, haces de luz, mostaza; todo recto */
    urbano:    { disp:'Anton',        scr:'Anton',               txt:'Barlow',  metal:'mostaza', recto:1,
                 adorno:'rayo', forma:'cartel', port:'poster',
                 h2:['disp',34,'.03em',1,400], kick:['txt',12,'.3em',1,600], btn:['disp','.12em',1] }
  };
  var METALES = {
    oro:       ['#C9A44E', '#E0C57A'],
    plata:     ['#B9C0CA', '#E3E7EC'],
    champagne: ['#D8C3A0', '#F0E3CC'],
    mostaza:   ['#E0B43A', '#F0CF6E']
  };
  /* ⚠️ Google Fonts devuelve 400 (y no carga NINGUNA de la tanda) si se pide un
     eje que la familia no tiene: Poiret One, Bebas Neue, Anton y Marcellus son
     de un solo peso; Space Grotesk, Cinzel, Manrope, Inter y Outfit no tienen
     itálica. Probado familia por familia el 19/10 (todas 200). */
  var EJES = {
    'Space Grotesk':    ':wght@400;500;600',
    'Cinzel':           ':wght@400;500;600',
    'Montserrat':       ':ital,wght@0,400;0,500;0,600;1,400',
    'Playfair Display': ':ital,wght@0,400;0,500;0,600;1,400',
    'Lato':             ':ital,wght@0,400;0,700;1,400',
    'Manrope':          ':wght@400;500;600',
    'Inter':            ':wght@400;500;600',
    'Raleway':          ':ital,wght@0,400;0,500;1,400',
    'Outfit':           ':wght@400;500;600',
    'Barlow':           ':ital,wght@0,400;0,500;0,600;1,400'
  };

  /* ------------------------------------------------- lo que pinta cada tono
     (se recalcula en aplicarTono(), antes de armar la hoja) */
  var E, T;
  var PAPEL, PAPEL2, PANEL, FILETE, TINTA, TINTA2, ORO, ORO_CL, ACENTO;
  var RP, RP2, RPN, RO, RA;                 /* los mismos, en 'r,g,b' para los rgba() */
  var PIEZA, PIEZA_CH, PIEZA_PASE, TAPA_RASP, TAPA_VIDEO, TAPA_PLAY;

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }
  function rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }).join(','); }

  function pedido() {
    var c = '';
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      c = (u !== null) ? u : String(((ev().fx) || {}).coleccion || '');
    } catch (e) {}
    return String(c || '').toLowerCase();
  }
  function tono() {
    var c = pedido();
    var k = c.indexOf(ID + '-') === 0 ? c.slice(ID.length + 1) : 'noche';
    return TONOS[k] ? k : 'noche';
  }
  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) { u = u.toLowerCase(); return u === ID || u.indexOf(ID + '-') === 0; }
    } catch (e) {}
    try { var c = String(((ev().fx) || {}).coleccion || '').toLowerCase(); return c === ID || c.indexOf(ID + '-') === 0; }
    catch (e) { return false; }
  }

  function aplicarTono() {
    var k = tono();
    T = TONOS[k]; E = ESTILOS[k];
    PAPEL = T.papel; PAPEL2 = T.papel2; PANEL = T.panel; FILETE = T.filete;
    TINTA = T.tinta; TINTA2 = T.tinta2;
    var M = METALES[E.metal] || METALES.oro;
    ORO = M[0]; ORO_CL = M[1]; ACENTO = E.acento || ORO;
    RP = rgb(PAPEL); RP2 = rgb(PAPEL2); RPN = rgb(PANEL); RO = rgb(ORO); RA = rgb(ACENTO);
    var pz = CL + 'c_crop,g_center,w_0.62,h_0.62/r_max/w_SZ,q_auto,f_png/invitame/eventos/ev-' + k + '-pieza';
    PIEZA = pz.replace('SZ', '300'); PIEZA_CH = pz.replace('SZ', '120'); PIEZA_PASE = pz.replace('SZ', '160');
    /* tapa opaca de la raspadita: la pieza APLANADA sobre el papel (§85.1: con
       huecos el número de abajo se ve a través) */
    TAPA_RASP  = CL + 'c_crop,g_center,w_0.62,h_0.62/r_max/b_rgb:' + PAPEL2.slice(1) + ',c_pad,w_360,h_360,q_auto,f_jpg/invitame/eventos/ev-' + k + '-pieza';
    /* ⚠️ §48: las tapas MUESTRAN lo que hacen — proyector y tocadiscos de la
       temática, NO recortes del fondo */
    TAPA_VIDEO = CL + 'c_fill,w_900,h_506,g_auto,q_auto,f_auto/invitame/eventos/ev-' + k + '-tapa-video';
    TAPA_PLAY  = CL + 'c_fill,w_800,h_730,g_auto,q_auto,f_auto/invitame/eventos/ev-' + k + '-tapa-play';
  }

  /* la pila CSS de cada familia del tono */
  function fam(clave) {
    if (clave === 'scr') return E.scr === E.disp ? '"' + E.disp + '",sans-serif' : '"' + E.scr + '",cursive';
    if (clave === 'txt') return '"' + E.txt + '",sans-serif';
    return '"' + E.disp + '",serif';
  }

  /* ⚠️ LA TABLA QUE LA COLECCIÓN RECLAMA COMO PROPIA (contrato de paleta.js:
     NOMBRES DE VARIABLE CSS). También alimenta la regla «familia-de-color» del
     chequeo, por eso van la tinta y el acento. */
  function paletaPropia() { return {
    '--verde':     E.recto && E.acento ? ACENTO : ORO,
    '--verde2':    ORO_CL,
    '--muted':     TINTA2,
    '--cream':     PAPEL,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col':   PAPEL,
    '--sec-col-v': TINTA,
    '--sage':      ACENTO,
    '--sage-cl':   ORO_CL,
    '--oro':       ORO,
    /* ⚠️ una OSCURA se queda con TODA superficie: si no, asoma el molde claro */
    '--tl-papel':  PANEL,
    '--tl-tinta':  TINTA,
    '--cf-sobre':  PANEL,
    '--cf-col':    PAPEL,
    '--sobre-c':   PANEL,
    '--flap-base': PAPEL,
    '--seal-c':    ORO,
    '--fiesta-acento': ACENTO
  }; }
  var PALETA_PROPIA = null;

  /* ------------------------------------------------------------- LOS ADORNOS
     La viñeta de arriba de cada título. `.adorno` mide 40 px y la figura se ve
     a ~18: todas están dibujadas para leerse ENTERAS a ese tamaño (nada de
     detalles de 1 px, salvo los cortes en el papel). */
  function svg(cuerpo) {
    return "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' + cuerpo + '</svg>');
  }
  function adornoSVG(c) {
    var a = E.adorno;
    /* noche: estrella art déco de cuatro puntas, la vertical más larga, y cuatro chispas */
    if (a === 'estrella') return svg(
      '<path fill="' + c + '" d="M24 2 L26.6 20.4 L42 24 L26.6 27.6 L24 46 L21.4 27.6 L6 24 L21.4 20.4 Z"/>' +
      '<circle cx="24" cy="24" r="2.4" fill="' + PAPEL + '"/>' +
      '<g fill="' + c + '"><path d="M11 9 L12.2 12.8 L16 14 L12.2 15.2 L11 19 L9.8 15.2 L6 14 L9.8 12.8 Z"/>' +
      '<path d="M37 29 L38.2 32.8 L42 34 L38.2 35.2 L37 39 L35.8 35.2 L32 34 L35.8 32.8 Z"/>' +
      '<circle cx="39" cy="11" r="1.7"/><circle cx="9" cy="37" r="1.7"/></g>');
    /* plata: la tira de banderines, el del medio más largo */
    if (a === 'banderin') return svg(
      '<path d="M3 9 Q24 18 45 9" fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round"/>' +
      '<g fill="' + c + '"><path d="M6.5 10.6 L16.5 13.6 L10 29 Z"/><path d="M18.5 14.2 L29.5 14.2 L24 35 Z"/><path d="M31.5 13.6 L41.5 10.6 L38 29 Z"/></g>' +
      '<circle cx="24" cy="20" r="2" fill="' + PAPEL + '"/>');
    /* ejecutivo: línea tech con un nodo cuadrado y el punto cian */
    if (a === 'tech') return svg(
      '<g fill="' + c + '"><rect x="1" y="23" width="14" height="2"/><rect x="33" y="23" width="14" height="2"/>' +
      '<rect x="1" y="20" width="2" height="8"/><rect x="45" y="20" width="2" height="8"/></g>' +
      '<rect x="17.5" y="16.5" width="13" height="13" fill="none" stroke="' + c + '" stroke-width="2.2" transform="rotate(45 24 23)"/>' +
      '<circle cx="24" cy="23" r="3.2" fill="' + ACENTO + '"/>');
    /* gala: el zigurat art déco escalonado, con su raja al medio y tres rayos */
    if (a === 'zigurat') return svg(
      '<path fill="' + c + '" d="M3 42 H45 V38 H39 V32 H33 V24 H28 V12 H20 V24 H15 V32 H9 V38 H3 Z"/>' +
      '<rect x="23" y="15" width="2" height="23" fill="' + PAPEL + '"/>' +
      '<g stroke="' + c + '" stroke-width="2" stroke-linecap="round"><path d="M24 3 V8"/><path d="M14 7 L17 11"/><path d="M34 7 L31 11"/></g>');
    /* brindis: burbujas de champaña subiendo, anillos con su brillo */
    if (a === 'burbujas') return svg(
      '<g fill="none" stroke="' + c + '" stroke-width="2.2"><circle cx="19" cy="32" r="10"/><circle cx="34" cy="17" r="6.4"/></g>' +
      '<g fill="' + c + '"><circle cx="13" cy="11" r="3.8"/><circle cx="38" cy="36" r="3"/><circle cx="26" cy="5" r="2"/>' +
      '<path d="M13 28 A7 7 0 0 1 18 23.6 L18.4 25.6 A5 5 0 0 0 15 28.6 Z"/><path d="M30.5 15 A4 4 0 0 1 33 12.6 L33.4 14.2 A2.6 2.6 0 0 0 32 15.6 Z"/></g>');
    /* birrete: el birrete de graduación con su borla */
    if (a === 'birrete') return svg(
      '<g fill="' + c + '"><path d="M24 8 L46 17.5 L24 27 L2 17.5 Z"/>' +
      '<path d="M12 22.4 V31 C12 36 36 36 36 31 V22.4 L24 27.6 Z"/>' +
      '<rect x="38.6" y="31" width="3.4" height="9" rx="1.2"/></g>' +
      '<path d="M24 17.5 L40.3 21 V32" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
      '<circle cx="24" cy="17.5" r="2" fill="' + PAPEL + '"/>');
    /* bokeh: guirnalda de tres foquitos, el del medio encendido con halo */
    if (a === 'foquitos') {
      var f = '', B = [[10, 13.4], [24, 16.6], [38, 13.4]];
      for (var i = 0; i < B.length; i++) {
        var x = B[i][0], y = B[i][1];
        f += '<rect x="' + (x - 2.2) + '" y="' + y + '" width="4.4" height="4.2" rx="1"/>' +
             '<path d="M' + x + ' ' + (y + 4) + ' C' + (x + 7) + ' ' + (y + 6) + ' ' + (x + 6) + ' ' + (y + 15) + ' ' + x + ' ' + (y + 18) +
             ' C' + (x - 6) + ' ' + (y + 15) + ' ' + (x - 7) + ' ' + (y + 6) + ' ' + x + ' ' + (y + 4) + ' Z"/>';
      }
      return svg(
        '<circle cx="24" cy="29" r="13" fill="' + c + '" opacity=".22"/>' +
        '<path d="M2 8 Q24 24 46 8" fill="none" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round"/>' +
        '<g fill="' + c + '">' + f + '</g>');
    }
    /* urbano: el rayo, recto y de cartel */
    if (a === 'rayo') return svg(
      '<path fill="' + c + '" d="M29 2 L9 27 H21.5 L17 46 L39 18 H26.5 Z"/>' +
      '<path fill="' + PAPEL + '" d="M26.6 8.6 L15.4 23.6 H19.4 Z"/>');
    return svg('<circle cx="24" cy="24" r="8" fill="' + c + '"/>');
  }

  /* la textura del marco cuando NO hay fondo elegido (con fondo queda detrás) */
  function textura() {
    var a = E.adorno;
    if (a === 'estrella') return 'radial-gradient(1.4px 1.4px at 18% 22%, rgba(' + RO + ',.7), rgba(' + RO + ',0) 70%), radial-gradient(1px 1px at 72% 12%, rgba(' + RO + ',.6), rgba(' + RO + ',0) 70%), radial-gradient(1.2px 1.2px at 46% 64%, rgba(' + RO + ',.55), rgba(' + RO + ',0) 70%), radial-gradient(1px 1px at 88% 78%, rgba(' + RO + ',.6), rgba(' + RO + ',0) 70%)';
    if (a === 'tech') return 'repeating-linear-gradient(0deg, rgba(' + RA + ',.05) 0 1px, rgba(0,0,0,0) 1px 34px), repeating-linear-gradient(90deg, rgba(' + RA + ',.05) 0 1px, rgba(0,0,0,0) 1px 34px)';
    if (a === 'zigurat') return 'repeating-linear-gradient(90deg, rgba(' + RO + ',.05) 0 1px, rgba(0,0,0,0) 1px 26px)';
    if (a === 'burbujas') return 'radial-gradient(circle 4px at 20% 30%, rgba(' + RO + ',0) 60%, rgba(' + RO + ',.35) 70%, rgba(' + RO + ',0) 80%), radial-gradient(circle 2.5px at 70% 18%, rgba(' + RO + ',.45), rgba(' + RO + ',0) 80%), radial-gradient(circle 6px at 82% 66%, rgba(' + RO + ',0) 60%, rgba(' + RO + ',.28) 72%, rgba(' + RO + ',0) 84%)';
    if (a === 'birrete') return 'repeating-conic-gradient(from 0deg at 50% 0, rgba(' + RO + ',.06) 0 3deg, rgba(0,0,0,0) 3deg 12deg)';
    if (a === 'foquitos') return 'radial-gradient(circle 46px at 18% 26%, rgba(' + RO + ',.14), rgba(' + RO + ',0)), radial-gradient(circle 30px at 78% 14%, rgba(' + RO + ',.12), rgba(' + RO + ',0)), radial-gradient(circle 58px at 66% 72%, rgba(' + RO + ',.10), rgba(' + RO + ',0))';
    if (a === 'rayo') return 'linear-gradient(112deg, rgba(255,255,255,0) 28%, rgba(255,255,255,.05) 36%, rgba(255,255,255,0) 44%), linear-gradient(112deg, rgba(255,255,255,0) 58%, rgba(' + RA + ',.05) 63%, rgba(255,255,255,0) 68%)';
    return 'linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.04) 50%, rgba(255,255,255,0) 70%)';
  }
  var TAMANO_TEXTURA = { estrella:'180px 180px', burbujas:'150px 150px', foquitos:'260px 260px' };

  /* ------------------------------------------------------------------- CSS */

  function armarCSS() {
    aplicarTono();
    var A = [];
    var R = E.recto ? '4px' : '14px';           /* el redondeo de las tapas */
    var LO = 'rgba(' + RO + ',';                /* el metal, para los rgba() */

    /* ---- 1 · el papel: NO macizo. El fondo (fx.fondo) va ADELANTE ------- */
    A.push(
      P + '.frame{ background-color:' + PAPEL2 + '!important; background-image:' + textura() + ', linear-gradient(180deg,' + PAPEL + ' 0%,' + PAPEL2 + ' 100%)!important; ' +
        (TAMANO_TEXTURA[E.adorno] ? 'background-size:' + TAMANO_TEXTURA[E.adorno] + ',' + TAMANO_TEXTURA[E.adorno] + ',' + TAMANO_TEXTURA[E.adorno] + ',' + TAMANO_TEXTURA[E.adorno] + ',100% 100%!important; ' : '') + '}',
      P + 'body, ' + P.trim() + '{ background-color:' + PAPEL2 + '!important; }',
      P + 'section.sec{ background-color:rgba(' + RP + ',.20)!important; }',
      P + 'section.sec:not(#pv-sec){ color:' + TINTA2 + '!important; }',
      P + 'section.sec.verde{ background-color:rgba(' + RPN + ',.30)!important; }',
      /* el oscuro radial CHICO detrás del bloque de texto: los textos sueltos
         no quedan sobre la foto, y la foto se sigue viendo en los bordes */
      P + '.frame > section.sec:not(#contacto-sec){ background-image:radial-gradient(ellipse 66% 46% at 50% 46%, rgba(' + RP + ',.72) 0%, rgba(' + RP + ',.42) 50%, rgba(' + RP + ',0) 82%)!important; }'
    );

    /* ---- 2 · el velo: UNA sola capa sobre el fondo, liviana -------------
       ⚠️ NO un ::before por sección: hace crashear WebKit al cargar. */
    A.push(
      P + '#inv-fondo::after{ content:""!important; position:fixed!important; inset:0!important; pointer-events:none!important; z-index:1!important; background:linear-gradient(to right, rgba(' + RP2 + ',0) 0%, rgba(' + RP2 + ',.40) 8%, rgba(' + RP2 + ',.40) 92%, rgba(' + RP2 + ',0) 100%)!important; }'
    );

    /* ---- 3 · LA ESCALA TIPOGRÁFICA, REESCRITA POR TONO -----------------
       ⚠️ El molde la trae calibrada para una CURSIVA: acá se reescribe entera.
          Sobretítulo MÁS CHICO que el título; cada título en UN renglón.
       ⚠️ px pelados (el marco mide 500 fijos) y especificidad, no --fs-*:
          paleta.js reescribe esas variables cada 1,5 s. */
    var H = E.h2, K = E.kick;
    A.push(
      P + '.sec .kick{ font-family:' + fam(K[0]) + '!important; font-size:' + K[1] + 'px!important; line-height:1.3!important; letter-spacing:' + K[2] + '!important; ' +
        'text-transform:' + (K[3] ? 'uppercase' : 'none') + '!important; font-weight:' + K[4] + '!important; font-style:normal!important; color:' + ACENTO + '!important; }',
      P + '.sec h2{ font-family:' + fam(H[0]) + '!important; font-size:' + H[1] + 'px!important; line-height:1.15!important; letter-spacing:' + H[2] + '!important; ' +
        'text-transform:' + (H[3] ? 'uppercase' : 'none') + '!important; font-weight:' + H[4] + '!important; color:' + TINTA + '!important; }',
      P + '.sec .frase{ font-family:' + fam('txt') + '!important; font-size:17px!important; line-height:1.62!important; color:' + TINTA2 + '!important; }',
      /* ⚠️ el ticket con voz (#pv-sec) tiene su papel CLARO y sus colores del panel:
         la crema de acá lo dejaba crema sobre crema (1,42 medido el 19/10) */
      P + '.sec:not(#pv-sec) p:not(.frase){ font-family:' + fam('txt') + '!important; font-size:15px!important; line-height:1.64!important; color:' + TINTA2 + '!important; }',
      P + '.t{ font-family:' + fam('disp') + '!important; font-size:' + Math.round(H[1] * .82) + 'px!important; color:' + TINTA + '!important; }'
    );
    /* urbano: el sobretítulo va en una cinta mostaza, como cartel pegado */
    if (E.port === 'poster') A.push(
      P + '.sec .kick{ display:inline-block!important; background-color:' + ACENTO + '!important; color:' + PAPEL2 + '!important; -webkit-text-fill-color:' + PAPEL2 + '!important; padding:3px 10px 2px!important; transform:rotate(-2deg)!important; }'
    );
    /* ejecutivo: el sobretítulo con su guion de terminal */
    if (E.port === 'tech') A.push(
      P + '.sec .kick::before{ content:"// "!important; color:' + ORO + '!important; }'
    );

    /* ---- 4 · LA PORTADA: al pie, el nombre armado según el tono ---------
       ⚠️ Se gana por ID: #pv-names y #pv-kick vienen clavados con !important
          en i/estilos-servidor.css. */
    A.push(
      P + '.portada{ justify-content:flex-end!important; }',
      P + '#pv-kick{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '#pv-names{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; padding-bottom:.06em!important; white-space:normal!important; }',
      P + '.portada :is(.num,.lab,.sep,.fecha){ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '.portada .num{ font-family:' + fam('disp') + '!important; }',
      P + '.portada .lab{ font-family:' + fam('txt') + '!important; }',
      P + '.portada > .c::before{ content:""!important; position:absolute!important; left:-45%!important; right:-45%!important; bottom:-16vh!important; height:80vh!important; pointer-events:none!important; z-index:-1!important; background:radial-gradient(ellipse 52% 68% at 50% 86%, rgba(' + RP2 + ',.74) 0%, rgba(' + RP2 + ',.40) 46%, rgba(' + RP2 + ',0) 78%)!important; }'
    );
    var KS = 'text-transform:none!important; letter-spacing:0!important; text-indent:0!important; font-weight:400!important;';
    var KV = function (f, ls, px) { return 'font-family:' + f + '!important; text-transform:uppercase!important; letter-spacing:' + ls + '!important; text-indent:' + ls + '!important; font-size:' + px + 'px!important; font-weight:500!important;'; };
    if (E.port === 'deco') A.push(      /* noche y gala: versal espaciada + cursiva arriba */
      P + '#pv-names{ font-family:' + fam('disp') + '!important; font-weight:400!important; text-transform:uppercase!important; letter-spacing:.14em!important; text-indent:.14em!important; font-size:clamp(28px,7.6vw,38px)!important; line-height:1.3!important; }',
      P + '#pv-kick{ font-family:' + fam('scr') + '!important; ' + KS + ' font-size:30px!important; color:' + ORO_CL + '!important; -webkit-text-fill-color:' + ORO_CL + '!important; }'
    );
    if (E.port === 'bloque') A.push(    /* plata: bloque Bebas enorme, sin cursiva */
      P + '#pv-names{ font-family:' + fam('disp') + '!important; font-weight:400!important; text-transform:uppercase!important; letter-spacing:.03em!important; text-indent:.03em!important; font-size:clamp(64px,17vw,92px)!important; line-height:.98!important; }',
      P + '#pv-kick{ ' + KV(fam('txt'), '.42em', 12) + ' color:' + ORO_CL + '!important; -webkit-text-fill-color:' + ORO_CL + '!important; }'
    );
    if (E.port === 'tech') A.push(      /* ejecutivo: grotesca firme, sobretítulo cian con filete */
      P + '#pv-names{ font-family:' + fam('disp') + '!important; font-weight:500!important; text-transform:none!important; letter-spacing:-.02em!important; text-indent:0!important; font-size:clamp(40px,10.4vw,56px)!important; line-height:1.06!important; }',
      P + '#pv-kick{ ' + KV(fam('txt'), '.28em', 12) + ' color:' + ACENTO + '!important; -webkit-text-fill-color:' + ACENTO + '!important; display:inline-block!important; border-top:1px solid ' + ACENTO + '!important; padding-top:8px!important; }'
    );
    if (E.port === 'script') A.push(    /* brindis: el nombre en cursiva grande, versal arriba */
      P + '#pv-names{ font-family:' + fam('scr') + '!important; font-weight:400!important; text-transform:none!important; letter-spacing:0!important; text-indent:0!important; font-size:clamp(64px,17vw,94px)!important; line-height:1.12!important; padding-bottom:.12em!important; }',
      P + '#pv-kick{ ' + KV(fam('disp'), '.38em', 13) + ' color:' + ORO_CL + '!important; -webkit-text-fill-color:' + ORO_CL + '!important; }'
    );
    if (E.port === 'versal') A.push(    /* birrete: Montserrat en versalitas muy espaciadas */
      P + '#pv-names{ font-family:' + fam('disp') + '!important; font-weight:500!important; text-transform:uppercase!important; letter-spacing:.24em!important; text-indent:.24em!important; font-size:clamp(26px,7vw,36px)!important; line-height:1.35!important; }',
      P + '#pv-kick{ font-family:' + fam('scr') + '!important; ' + KS + ' font-size:30px!important; color:' + ORO_CL + '!important; -webkit-text-fill-color:' + ORO_CL + '!important; }'
    );
    if (E.port === 'italica') A.push(   /* bokeh: Playfair itálica, cursiva arriba */
      P + '#pv-names{ font-family:' + fam('disp') + '!important; font-style:italic!important; font-weight:500!important; text-transform:none!important; letter-spacing:.01em!important; text-indent:0!important; font-size:clamp(44px,12vw,64px)!important; line-height:1.15!important; }',
      P + '#pv-kick{ font-family:' + fam('scr') + '!important; ' + KS + ' font-size:30px!important; color:' + ORO_CL + '!important; -webkit-text-fill-color:' + ORO_CL + '!important; }'
    );
    if (E.port === 'poster') A.push(    /* urbano: Anton de cartel, cinta mostaza arriba */
      P + '#pv-names{ font-family:' + fam('disp') + '!important; font-weight:400!important; text-transform:uppercase!important; letter-spacing:.02em!important; text-indent:.02em!important; font-size:clamp(60px,16vw,88px)!important; line-height:.98!important; }',
      P + '#pv-kick{ ' + KV(fam('txt'), '.3em', 12) + ' display:inline-block!important; background-color:' + ACENTO + '!important; color:' + PAPEL2 + '!important; -webkit-text-fill-color:' + PAPEL2 + '!important; padding:4px 12px 3px!important; transform:rotate(-2deg)!important; }'
    );

    /* ---- 5 · LAS TARJETAS DE LUGAR (la forma va en cssForma) ------------ */
    A.push(
      P + ':is(.evento,.hotel,.pasecard){ background-color:rgba(' + RPN + ',.90)!important; border:1px solid ' + LO + '.28)!important; box-shadow:0 10px 26px rgba(0,0,0,.34)!important; }',
      P + ':is(.evento,.hotel){ width:auto!important; border-radius:12px!important; overflow:hidden!important; }',
      P + '.evento .ph{ height:220px!important; }',
      P + '.hotel{ padding:24px 18px 18px!important; text-align:center!important; }',
      P + '.hotel .btn{ margin:10px auto 0!important; }',
      P + ':is(.evento,.hotel,.pasecard) :is(p,.sub,.addr,.k){ color:' + TINTA2 + '!important; }',
      P + ':is(.evento,.hotel) :is(h3,h4), ' + P + '.pasecard .v{ color:' + TINTA + '!important; font-family:' + fam('disp') + '!important; }'
    );

    /* ---- 6 · PERSONAS: TODAS EN UNA FILA -------------------------------- */
    A.push(
      P + '.padres{ grid-template-columns:repeat(3,1fr)!important; gap:10px 8px!important; background-color:transparent!important; }',
      P + '.padres[data-col-n="1"]{ grid-template-columns:minmax(0,220px)!important; justify-content:center!important; }',
      P + '.padres[data-col-n="2"]{ grid-template-columns:repeat(2,1fr)!important; }',
      /* 19/10 (Maki: «los directivos no entran porque son 4»): con 4 van de a dos, 2×2 */
      P + '.padres[data-col-n="4"]{ grid-template-columns:repeat(2,1fr)!important; gap:14px 10px!important; }',
      /* el círculo no puede pasar del ancho de su columna (en 375 px tres de 104 se salían por los costados) */
      P + '.padres .av{ width:min(104px,24vw)!important; height:min(104px,24vw)!important; border:2px solid ' + ORO + '!important; }',
      P + '.padres .av img, ' + P + '.padres .av{ object-position:50% 30%!important; background-position:50% 30%!important; }',
      P + '.padres .nm{ font-size:18px!important; color:' + TINTA + '!important; font-family:' + fam('disp') + '!important; }'
    );

    /* ---- 7 · EL ITINERARIO ---------------------------------------------
       ⚠️ La regla de Bella: si el motor ya calcula una posición no se la
          reemplaza por un número, se la corrige por la diferencia. La marca del
          motor mide 11 px y ésta 26 → se corre 7,5 px. Sirve para los dos
          estilos (izquierda y zigzag `.tl-centro`). */
    A.push(
      P + '.tl{ background-color:rgba(' + RPN + ',.88)!important; border:1px solid ' + LO + '.24)!important; border-radius:16px!important; padding:30px 18px 26px 14px!important; }',
      /* 19/10 (Maki: «el itinerario apretado»): sin padding la primera marca pegaba en el borde de arriba */
      P + '.tl:not(.tl-centro){ padding-left:54px!important; }',
      P + '.tl:not(.tl-centro)::before, ' + P + '.tl:not(.tl-centro) > .tl-prog{ left:33px!important; }',
      P + '.tl::before, ' + P + '.tl > .tl-prog{ top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important; }',
      E.recto
        ? P + '.tl::before{ background-image:none!important; background-color:' + FILETE + '!important; width:1px!important; }'
        : P + '.tl::before{ background-image:radial-gradient(circle, ' + FILETE + ' 1.1px, rgba(0,0,0,0) 1.2px)!important; background-size:2px 9px!important; background-repeat:repeat-y!important; background-color:transparent!important; width:2px!important; }',
      P + '.tl > .tl-prog{ background-color:' + ACENTO + '!important; width:2px!important; opacity:.85!important; }',
      /* la marca: la pieza fotografiada del tono sobre un disco de papel */
      P + '.tl > .it::before{ width:26px!important; height:26px!important; margin-left:-7.5px!important; margin-top:-7.5px!important; border-radius:' + (E.recto ? '5px' : '50%') + '!important; background-color:' + PANEL + '!important; background-image:url("' + PIEZA_CH + '")!important; background-size:cover!important; background-repeat:no-repeat!important; background-position:center!important; box-shadow:0 0 0 1px ' + LO + '.55), 0 0 0 6px rgba(' + RPN + ',1), 0 2px 8px rgba(0,0,0,.35)!important; border:0!important; }',
      P + '.tl.tl-centro > .it::before{ margin-top:-13px!important; }',
      P + '.tl > .it{ z-index:1!important; }', P + '.tl > .tl-prog{ z-index:0!important; }',
      P + '.tl.tl-centro > .it:nth-child(odd)::before{ margin-left:0!important; margin-right:-7.5px!important; }',
      /* ⚠️ el motor maneja la marca con DOS reglas (reposo y revelado): va atada a .on */
      P + '.tl.tl-anim > .it:not(.on)::before{ opacity:0!important; }',
      P + '.tl.tl-anim > .it.on::before{ opacity:1!important; }',
      P + '.tl .hora{ color:' + ACENTO + '!important; font-family:' + fam('disp') + '!important; }',
      P + '.tl .det{ color:' + TINTA2 + '!important; }'
    );

    /* ---- 8 · EL ADORNO DE LOS TÍTULOS ----------------------------------
       ⚠️ `fx.diseno.adorno` vacío = el motor NO pone `.adorno`: la colección
          cuelga el suyo (`.fiesta-adorno`, ver ponerAdornos). Si Jazmín elige
          un motivo en el panel, el del motor manda y el propio se saca.
       ⚠️ El adorno del motor trae los ANILLOS DE BODA (dos círculos en el
          segundo grupo): en un cumpleaños o un corporativo no van. Se esconde
          sólo ese grupo; los filetes de los costados quedan. */
    A.push(
      P + '.fiesta-adorno{ display:block!important; width:46px!important; height:30px!important; margin:0 auto 8px!important; pointer-events:none!important; }',
      P + '.sec h2 .adorno, ' + P + '.adorno, ' + P + '.fiesta-adorno{ background-image:url("' + adornoSVG(ORO) + '")!important; background-repeat:no-repeat!important; background-position:center!important; background-size:contain!important; }',
      P + '.adorno svg g:nth-of-type(2), ' + P + '.adorno svg circle{ display:none!important; }'
    );

    /* ---- 8b · el medallón del pase: la pieza del tono ------------------- */
    A.push(
      P + '.pasecard{ position:relative!important; overflow:visible!important; padding-top:34px!important; }',
      P + '.pasecard::before{ content:""!important; display:block!important; position:absolute!important; left:50%!important; top:-18px!important; width:36px!important; height:36px!important; margin-left:-18px!important; border-radius:' + (E.recto ? '7px' : '50%') + '!important; background:' + PANEL + ' url("' + PIEZA_PASE + '") center/cover no-repeat!important; box-shadow:0 0 0 2px ' + PANEL + ', 0 0 0 3px ' + LO + '.6), 0 4px 10px rgba(0,0,0,.4)!important; z-index:2!important; }'
    );

    /* ---- 9 · LA RASPADITA: sin recuadro, la tapa es la pieza ------------
       ⚠️ Dos ramas (`.rasp-3 > .r3-f` y `.rasp-zona > canvas`): la variable se
          declara en TODA la rama. Y el motor apaga las dormidas con un filter. */
    A.push(
      ':is(#dc-nada, ' + P.trim() + ' .scratch-sec, ' + P.trim() + ' .rasp-3, ' + P.trim() + ' .rasp-zona, ' + P.trim() + ' #scratchcard){ --r3-tapa:url("' + TAPA_RASP + '")!important; }',
      /* el velo de fecha.js es para círculos con FOTO: sobre el liso ensucia el número (§85.3) */
      P + '.ivf-circ .c::after{ display:none!important; }',
      P + ':is(#scratchcard, .scratchcard){ background-color:transparent!important; background-image:none!important; border:0!important; box-shadow:none!important; }',
      P + '.rasp-zona.dormida canvas{ filter:none!important; }'
    );

    /* ---- 10 · LAS TAPAS DE VIDEO Y PLAYLIST: recortes del fondo del tono --
       ⚠️ `.rd-tapa` es la MISMA clase para los dos: se separan por sección. */
    var VEL = 'radial-gradient(circle at 50% 50%, rgba(' + RP2 + ',.44) 0, rgba(' + RP2 + ',.18) 24%, rgba(' + RP2 + ',0) 44%)';
    A.push(
      P + '#video-sec .rd-tapa{ background:' + VEL + ', url("' + TAPA_VIDEO + '") center/cover no-repeat!important; border-radius:' + R + '!important; box-shadow:0 10px 26px rgba(0,0,0,.40)!important; }',
      P + '#spotify-sec .rd-tapa{ background:' + VEL + ', url("' + TAPA_PLAY + '") center/cover no-repeat!important; border-radius:' + R + '!important; box-shadow:0 10px 26px rgba(0,0,0,.40)!important; }',
      P + '.rd-tapa .rd-aro{ border-color:' + ORO_CL + '!important; background:rgba(' + RP2 + ',.5)!important; box-shadow:0 0 0 1px ' + LO + '.4), 0 6px 18px rgba(0,0,0,.45)!important; opacity:1!important; }',
      P + '.rd-tapa .rd-aro::after{ border-left-color:' + TINTA + '!important; }',
      P + '.rd-tapa .rd-txt{ display:block!important; font-family:' + fam('txt') + '!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; background-color:rgba(' + RP2 + ',.86)!important; padding:4px 14px!important; border-radius:999px!important; display:inline-block!important; }'
    );

    /* ---- 11 · EL PASE: nunca básico blanco -----------------------------
       ⚠️ Los rótulos son `.k` y `.v`. El cuadrado del QR queda BLANCO a
          propósito (el lector necesita el contraste). */
    A.push(
      P + '.pase{ background-color:' + PAPEL2 + '!important; }',
      P + '.pase > .t{ display:inline-block!important; background-color:rgba(' + RP2 + ',.66)!important; padding:6px 18px!important; border-radius:999px!important; text-shadow:none!important; }',
      /* §62: RECTÁNGULO de 16 px con filete interior, sin arco, en TODOS los tonos */
      P + '.pasecard{ border-radius:16px!important; border:0!important; clip-path:none!important; -webkit-mask:none!important; mask:none!important; box-shadow:inset 0 0 0 6px rgba(' + RPN + ',.9), inset 0 0 0 7px ' + LO + '.55), 0 10px 26px rgba(0,0,0,.36)!important; }',
      P + '.pasecard .k{ color:' + TINTA2 + '!important; letter-spacing:.14em!important; text-transform:uppercase!important; font-size:10px!important; font-family:' + fam('txt') + '!important; }',
      P + '.pasecard .v{ color:' + TINTA + '!important; font-size:15px!important; }',
      P + '.pasecard .t{ font-family:' + fam('disp') + '!important; font-size:19px!important; color:' + ORO_CL + '!important; }',
      P + '.pasecard .estado{ background-color:' + LO + '.18)!important; color:' + ORO_CL + '!important; border:1px solid ' + LO + '.45)!important; }'
    );

    /* ---- 12 · LOS CONTROLES --------------------------------------------
       🔴 LA COLECCIÓN NO CLAVA LA TINTA DEL BOTÓN (Cantera, Bella). El material
          lo elige Jazmín en el panel (`fx.boton.estilo`, efectos/botones.js) y
          cada material declara color y fondo con !important. Acá sólo se
          PROPONE, sin !important, y el relleno sigue a currentColor.
          La LETRA sí es de la colección, también en los .wsp de WhatsApp. */
    var BF = E.btn;
    var JOYA = ':is(.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn, #filtro-abrir, #gal-entrar, .sec a[href*=liverpool], .sec a[href*=amazon])';
    var RADIO = E.forma === 'cartel' ? '0' : E.recto ? '4px' : (E.forma === 'deco' || E.forma === 'filetes' || E.forma === 'diploma') ? '2px' : '999px';
    A.push(
      /* §85.5 · BOTONES «JOYA»: todos con la MISMA forma (radio, aro, letra).
         La forma sí va con !important; la TINTA no (es del material). */
      P + JOYA + '{ border-radius:' + RADIO + '!important; font-family:' + fam(BF[0]) + '!important; letter-spacing:' + BF[1] + '!important; text-transform:' + (BF[2] ? 'uppercase' : 'none') + '!important; }',
      P + JOYA + ':not(.gh):not(.ghost){ box-shadow:inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 3px ' + LO + '.22), 0 5px 14px rgba(0,0,0,.36); }',
      P + ':is(.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn){ background-color:' + (E.acento && E.recto ? ACENTO : ORO) + '; color:' + PAPEL2 + '; border-color:transparent; }',
      P + ':is(.btn, #btn-ingresar, .tv-btn, .inv-prev-btn):not(.gh):not(.ghost), ' + P + '.wsp{ -webkit-text-fill-color:currentColor; }',
      P + '.btn.gh, ' + P + '.btn.ghost, ' + P + 'a.btn.ghost{ background-color:transparent!important; background-image:none!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; border:1px solid ' + LO + '.55)!important; box-shadow:none!important; }',
      /* la flecha del acordeón no tiene color propio: hereda el del botón */
      P + '.btn .chev, ' + P + '.chev{ color:inherit!important; opacity:.85!important; }',
      /* #filtro-abrir y #gal-entrar NO son del conjunto de botones.js: nacen
         crema con letra gris. Se visten acá (elección de diseño, como Bella). */
      P + '#filtro-abrir, ' + P + '#gal-entrar{ background:' + (E.acento && E.recto ? ACENTO : ORO) + '!important; color:' + PAPEL2 + '!important; -webkit-text-fill-color:' + PAPEL2 + '!important; border:0!important; box-shadow:inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 3px ' + LO + '.22), 0 5px 14px rgba(0,0,0,.36)!important; }',
      /* las flechas del carrusel nacen ROJAS rgb(157,0,17) */
      /* «Ver más» de los textos largos: nace al 65 % y daba 4,89 */
      P + '.iv-plie-btn{ opacity:.92!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      /* el título del ticket con voz no trae color: heredaba la crema de la
         colección sobre el papel claro del boleto (1,43). Se le PROPONE la tinta
         del propio ticket, sin !important: lo que elija Jazmín en el panel gana. */
      P + '#pv-sec .pv-titulo{ color:var(--pv-tinta,#3C3342); -webkit-text-fill-color:currentColor; }',
      P + '.carousel .ar{ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + 'form.rsvpform :is(input,select,textarea){ background-color:rgba(255,255,255,.06)!important; border-color:' + LO + '.40)!important; color:' + TINTA + '!important; }',
      P + 'form.rsvpform label{ color:' + TINTA2 + '!important; }',
      /* la mesa de regalos NO son .btn: el molde los pinta con letra blanca (2,36 sobre oro) */
      P + '.reg-btns a{ color:' + PAPEL2 + '!important; -webkit-text-fill-color:' + PAPEL2 + '!important; }',
      P + ':is(.banco, .rb-cbu) .copy{ color:' + ORO_CL + '!important; -webkit-text-fill-color:' + ORO_CL + '!important; }',
      P + '.tv-in{ background-color:rgba(' + RP2 + ',.55)!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; border:1px solid ' + LO + '.40)!important; }',
      P + '.tv-in::placeholder{ color:rgba(' + rgb(TINTA) + ',.55)!important; -webkit-text-fill-color:rgba(' + rgb(TINTA) + ',.55)!important; }'
    );

    /* ---- 12 bis · el cielo del ambiente, de noche ----------------------
       `fx.ambiente.tipo = 'nubes'` pinta un cielo DIURNO y BLANCO: en una
       colección oscura con tinta clara va de noche, con chispas del metal. */
    var CH = function (x, y, s, a) { return 'radial-gradient(' + s + 'px ' + s + 'px at ' + x + '% ' + y + '%, rgba(' + RO + ',' + a + '), rgba(' + RO + ',0) 60%)'; };
    A.push(
      P + '.ambiente .sky{ background-image:' + [CH(21, 13, 1.8, .95), CH(67, 8, 1.2, .85), CH(85, 30, 2.2, .8), CH(37, 38, 1.3, .8), CH(11, 56, 2, .85), CH(73, 65, 1.2, .78), CH(46, 81, 1.9, .88), CH(89, 90, 1.1, .75)].join(',') +
        ', linear-gradient(180deg, rgba(' + RP2 + ',.94) 0%, rgba(' + RP + ',.88) 100%)!important; ' +
        'background-size:168px 168px,168px 168px,168px 168px,168px 168px,168px 168px,168px 168px,168px 168px,168px 168px,100% 100%!important; ' +
        'background-repeat:repeat,repeat,repeat,repeat,repeat,repeat,repeat,repeat,no-repeat!important; background-color:' + PAPEL2 + '!important; }'
    );

    /* ---- 13 · la carta y el contacto: nada blanco suelto ---------------- */
    A.push(
      P + '.cf-letter{ background-color:' + PAPEL + '!important; background-image:none!important; color:' + TINTA2 + '!important; border:1px solid ' + LO + '.22)!important; }',
      P + '.cf-letter :is(h2,h3,h4,.t){ color:' + TINTA + '!important; }',
      /* si en el panel se eligió un papel de carta CLARO (`cartaPapel`, lo escribe
         carta-texto.js inline), la crema no se lee: la hoja pasa a tinta oscura.
         La marca la pone medirCarta() y la saca sacar(). */
      P + '.cf-letter[data-fiesta-carta="clara"], ' + P + '.cf-letter[data-fiesta-carta="clara"] *{ color:#2B2620!important; -webkit-text-fill-color:#2B2620!important; }',
      P + '#contacto-sec{ background-color:rgba(' + RP2 + ',.78)!important; }',
      P + '#contacto-sec :is(h2,.kick){ text-shadow:0 1px 3px rgba(0,0,0,.8)!important; }',
      P + '.footer a, ' + P + 'a[href*="privacidad"], ' + P + '#aviso-privacidad, ' + P + '.aviso-priv{ color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important; }',
      P + '.footer :is(h1,h2,h3,p,span,div){ color:' + TINTA2 + '!important; text-shadow:0 1px 3px rgba(0,0,0,.8)!important; }'
    );

    A.push(cssForma());
    return A.join('\n');
  }

  /* ------------------------------------------------- LA FORMA DE CADA TONO
     Va AL FINAL de la hoja: le gana a la base de arriba. */
  function cssForma() {
    var A = [], f = E.forma, LO = 'rgba(' + RO + ',';
    /* noche: filetes art déco finos arriba y abajo, y un marco interior de un pelo */
    if (f === 'filetes') A.push(
      P + ':is(.evento,.hotel){ border-radius:2px!important; border:0!important; box-shadow:inset 0 2px 0 ' + ORO + ', inset 0 -2px 0 ' + ORO + ', inset 0 0 0 7px ' + PANEL + ', inset 0 0 0 8px ' + LO + '.42), 0 12px 28px rgba(0,0,0,.4)!important; }',
      P + '.evento .ph{ border-radius:0!important; margin:9px 9px 0!important; width:auto!important; }',
      P + '.tl{ border-radius:2px!important; border:0!important; box-shadow:inset 0 2px 0 ' + ORO + ', inset 0 -2px 0 ' + ORO + ', inset 0 0 0 6px ' + PANEL + ', inset 0 0 0 7px ' + LO + '.35)!important; }',
      P + '.padres .av{ border:0!important; box-shadow:0 0 0 2px ' + PAPEL + ', 0 0 0 3px ' + ORO + ', 0 0 0 7px ' + PAPEL + ', 0 0 0 8px ' + LO + '.45)!important; }'
    );
    /* plata: la tarjeta termina en una tira de BANDERINES (máscara en zigzag) */
    if (f === 'banderin') {
      var MK = 'linear-gradient(#000 0 0) top/100% calc(100% - 13px) no-repeat, conic-gradient(from -45deg at 50% 100%, #000 90deg, #0000 0) bottom/26px 13px repeat-x';
      A.push(
        P + ':is(.evento,.hotel){ border-radius:6px 6px 0 0!important; border:0!important; border-top:3px solid ' + ORO + '!important; -webkit-mask:' + MK + '!important; mask:' + MK + '!important; padding-bottom:26px!important; box-shadow:none!important; }',
        P + '.evento .ph{ border-radius:0!important; }',
        P + '.tl{ border-radius:6px!important; border:1px solid ' + LO + '.35)!important; border-top:3px solid ' + ORO + '!important; }',
        P + '.padres .av{ border:3px solid ' + ORO + '!important; box-shadow:0 0 0 2px ' + PAPEL + ', 0 0 0 3px ' + LO + '.5)!important; }'
      );
    }
    /* ejecutivo: recto, barra cian a la izquierda y esquineros de pantalla */
    if (f === 'tech') {
      var C = ACENTO, EQ = 'linear-gradient(' + C + ',' + C + ') top left/16px 1px no-repeat, linear-gradient(' + C + ',' + C + ') top left/1px 16px no-repeat, linear-gradient(' + C + ',' + C + ') bottom right/16px 1px no-repeat, linear-gradient(' + C + ',' + C + ') bottom right/1px 16px no-repeat';
      A.push(
        P + ':is(.evento,.hotel){ border-radius:4px!important; border:1px solid ' + LO + '.30)!important; background:' + EQ + ', rgba(' + RPN + ',.92)!important; box-shadow:inset 3px 0 0 ' + C + ', 0 10px 26px rgba(0,0,0,.34)!important; }',
        P + '.evento .ph{ border-radius:0!important; margin-left:3px!important; }',
        P + '.tl{ border-radius:4px!important; border:1px solid ' + LO + '.26)!important; box-shadow:inset 3px 0 0 ' + C + '!important; }',
        P + '.padres .av{ border-radius:8px!important; border:1px solid ' + LO + '.7)!important; box-shadow:3px 3px 0 0 rgba(' + RA + ',.55)!important; }'
      );
    }
    /* gala: marco art déco — esquinas ochavadas y doble marco interior */
    if (f === 'deco') {
      var OC = 'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)';
      var OCA = 'polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)';
      A.push(
        P + ':is(.evento,.hotel,.tl){ border-radius:0!important; border:0!important; clip-path:' + OC + '!important; box-shadow:inset 0 0 0 4px ' + PANEL + ', inset 0 0 0 5px ' + ORO + ', inset 0 0 0 9px ' + PANEL + ', inset 0 0 0 10px ' + LO + '.45)!important; }',
        P + '.evento .ph{ border-radius:0!important; margin:12px 12px 0!important; width:auto!important; }',
        P + '.padres .av{ border:0!important; border-radius:0!important; clip-path:' + OCA + '!important; }'
      );
    }
    /* brindis: redondas como copa, con burbujitas en la esquina */
    if (f === 'burbuja') {
      var BU = 'radial-gradient(circle 3px at calc(100% - 22px) 18px, ' + LO + '.65) 98%, rgba(0,0,0,0)), radial-gradient(circle 2px at calc(100% - 34px) 30px, ' + LO + '.5) 98%, rgba(0,0,0,0)), radial-gradient(circle 1.5px at calc(100% - 18px) 38px, ' + LO + '.45) 98%, rgba(0,0,0,0))';
      A.push(
        P + ':is(.evento,.hotel){ border-radius:28px!important; border:1px solid ' + LO + '.38)!important; background:' + BU + ', rgba(' + RPN + ',.90)!important; box-shadow:0 0 0 5px rgba(' + RP + ',.55), 0 0 0 6px ' + LO + '.22), 0 14px 30px rgba(0,0,0,.4)!important; }',
        P + '.evento .ph{ border-radius:27px 27px 0 0!important; }',
        P + '.tl{ border-radius:28px!important; border:1px solid ' + LO + '.32)!important; }',
        P + '.padres .av{ border:1px solid ' + ORO + '!important; box-shadow:0 0 0 4px ' + LO + '.16), 0 0 0 5px ' + LO + '.45)!important; }'
      );
    }
    /* birrete: diploma — recto, banda de oro arriba, sello punteado en los retratos */
    if (f === 'diploma') A.push(
      P + ':is(.evento,.hotel){ border-radius:0!important; border:1px solid ' + LO + '.45)!important; border-top:5px solid ' + ORO + '!important; box-shadow:0 6px 0 -3px ' + PAPEL2 + ', 0 6px 0 -2px ' + LO + '.5), 0 14px 28px rgba(0,0,0,.4)!important; }',
      P + '.evento .ph{ border-radius:0!important; }',
      P + '.tl{ border-radius:0!important; border:1px solid ' + LO + '.35)!important; border-top:5px solid ' + ORO + '!important; }',
      P + '.padres .av{ border:2px solid ' + ORO + '!important; outline:1px dashed ' + LO + '.7)!important; outline-offset:4px!important; }'
    );
    /* bokeh: redondeadas con halo de luz, como un foco desenfocado */
    if (f === 'halo') A.push(
      P + ':is(.evento,.hotel){ border-radius:22px!important; border:1px solid ' + LO + '.42)!important; box-shadow:0 0 28px ' + LO + '.20), 0 0 0 1px ' + LO + '.10), 0 14px 30px rgba(0,0,0,.4)!important; }',
      P + '.evento .ph{ border-radius:21px 21px 0 0!important; }',
      P + '.tl{ border-radius:22px!important; box-shadow:0 0 24px ' + LO + '.16)!important; }',
      P + '.padres .av{ border:2px solid ' + ORO + '!important; box-shadow:0 0 18px ' + LO + '.45), 0 0 0 5px rgba(' + RP + ',.6)!important; }'
    );
    /* urbano: cartel pegado — recto, sombra dura mostaza */
    if (f === 'cartel') A.push(
      P + ':is(.evento,.hotel){ border-radius:0!important; border:1px solid rgba(255,255,255,.10)!important; box-shadow:7px 7px 0 0 ' + ACENTO + '!important; margin-right:10px!important; }',
      P + '.evento .ph{ border-radius:0!important; }',
      P + '.tl{ border-radius:0!important; border:0!important; border-left:4px solid ' + ACENTO + '!important; }',
      P + '.padres .av{ border-radius:0!important; border:0!important; box-shadow:5px 5px 0 0 ' + ACENTO + '!important; }'
    );
    return A.join('\n');
  }

  /* ---------------------------------------------------------------- fuentes */

  function fuentes() {
    /* ⚠️ Se pide SÓLO el nombre de la familia (con sus ejes reales): una pila
       CSS entera o un eje que no existe dan 400 y no carga nada. */
    var lista = [], vistos = {};
    [E.disp, E.txt, E.scr].forEach(function (n) {
      if (vistos[n]) return; vistos[n] = 1;
      lista.push('family=' + n.replace(/ /g, '+') + (EJES[n] || ''));
    });
    var marca = ID + '-' + tono();
    if (document.querySelector('link[data-col-fuentes="' + marca + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + lista.join('&') + '&display=swap';
    l.setAttribute('data-col-fuentes', marca);
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------ poner/sacar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    return s;
  }

  /* ⚠️ `reglas-duras.js` escribe `color` INLINE con !important: hay que
     BORRARLO en cada repaso. Se barre por su firma (`data-regla-orig`). */
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

  /* LA VÍA EMPIEZA Y TERMINA EN EL CENTRO DE LA PRIMERA Y LA ÚLTIMA MARCA
     (Maki, 3/10: «tiene que terminar en el circulito»). Se MIDE en cada repaso. */
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

  /* 🔴 EL PASE CON EL QR VA ABAJO DE LA RASPADITA (y del ticket con voz, si
     está). Lo baja LA COLECCIÓN; `devolverPase()` sólo corre si estaba puesta. */
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

  /* EL ADORNO PROPIO. Con `fx.diseno.adorno` vacío el motor no pone ningún
     `.adorno` (buildAdornos sale antes): la colección cuelga el suyo arriba de
     cada sobretítulo. Si hay uno del motor en la misma sección, el propio sobra.
     Sólo toca nodos con su propia clase, y sacar() los quita todos. */
  function ponerAdornos() {
    try {
      [].forEach.call(document.querySelectorAll('.frame section.sec'), function (sec) {
        var mio = sec.querySelector('.fiesta-adorno');
        var motor = sec.querySelector('.adorno');
        var kick = sec.querySelector('.kick');
        if (motor || !kick) { if (mio) mio.remove(); return; }
        if (mio && mio.nextElementSibling === kick) return;
        if (mio) mio.remove();
        var d = document.createElement('div');
        d.className = 'fiesta-adorno';
        d.setAttribute('aria-hidden', 'true');
        kick.parentNode.insertBefore(d, kick);
      });
    } catch (e) {}
  }
  function sacarAdornos() {
    try { [].forEach.call(document.querySelectorAll('.fiesta-adorno'), function (d) { d.remove(); }); } catch (e) {}
  }

  function medirCarta() {
    try {
      var h = document.querySelector('.cf-letter'); if (!h) return;
      var m = String(getComputedStyle(h).backgroundColor).match(/[\d.]+/g);
      var clara = false;
      if (m && m.length >= 3 && (m.length < 4 || +m[3] > .5)) {
        var l = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
        clara = l > 0.55;
      }
      if (clara) { if (h.getAttribute('data-fiesta-carta') !== 'clara') h.setAttribute('data-fiesta-carta', 'clara'); }
      else if (h.hasAttribute('data-fiesta-carta')) h.removeAttribute('data-fiesta-carta');
    } catch (e) {}
  }
  function soltarCarta() {
    try { var h = document.querySelector('.cf-letter[data-fiesta-carta]'); if (h) h.removeAttribute('data-fiesta-carta'); } catch (e) {}
  }

  var ULTIMA = '';
  function poner() {
    var css = armarCSS();
    fuentes();
    var s = hoja();
    if (ULTIMA !== css || s.textContent !== css) { s.textContent = css; ULTIMA = css; }
    var raiz = document.documentElement;
    raiz.setAttribute('data-col', ID);
    raiz.setAttribute('data-coleccion', ID);
    raiz.setAttribute('data-fiesta-tono', tono());
    PALETA_PROPIA = paletaPropia();
    window.INVCOLPALETA = PALETA_PROPIA;
    raiz.setAttribute('data-marca-propia', ID);
    /* el chequeo decide «oscura» mirando .frame; con el fondo adelante puede medir
       transparente. La marca queda puesta, como en Bella. */
    raiz.setAttribute('data-col-oscura', '1');
    ponerAdornos();
    medirCarta();
    marcarPadres();
    moverPase();
    recortarVia();
    limpiarInlines();
    /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle. Alcanza el repaso. */
  }

  function sacar() {
    var s = document.getElementById(ID_CSS); if (s) s.remove();
    ULTIMA = '';
    var raiz = document.documentElement;
    /* ⚠️ Sólo se deshace si ESTA colección estaba puesta (lección del 29/9 en
       degradé: desmarcarPadres suelto le rompía las personas a Perlas). */
    if (raiz.getAttribute('data-col') === ID) {
      desmarcarPadres();
      devolverPase();
      soltarVia();
      raiz.removeAttribute('data-col');
      raiz.removeAttribute('data-coleccion');
      raiz.removeAttribute('data-fiesta-tono');
      if (raiz.getAttribute('data-col-oscura') === '1') raiz.removeAttribute('data-col-oscura');
      sacarAdornos();
      soltarCarta();
      if (raiz.getAttribute('data-marca-propia') === ID) raiz.removeAttribute('data-marca-propia');
      if (window.INVCOLPALETA === PALETA_PROPIA) {
        try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; }
      }
    }
  }

  function sincronizar() { if (activa()) poner(); else sacar(); }

  /* ⚠️ EL REPASO DE 1,2 s ES OBLIGATORIO: `INVEV` puede llegar DESPUÉS de load. */
  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.INVFIESTA = {
    poner: poner, sacar: sacar,
    css: function () { return armarCSS(); },
    adorno: function () { aplicarTono(); return adornoSVG(ORO); },
    paleta: function () { aplicarTono(); return paletaPropia(); },
    tonos: Object.keys(TONOS)
  };
})();
