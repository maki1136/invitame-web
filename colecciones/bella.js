/* ===== COLECCIÓN «LA BELLA Y LA BESTIA» =======================================

   El cuento de Villeneuve (1740) y Beaumont (1756), no la película. Nace del
   pedido de Maki del 23/9/2026: seguir la línea de princesas después de
   Cenicienta, «respetando esta invitación que armamos juntos».

   ⭐ QUÉ LA HACE DISTINTA DE LAS DEMÁS
        · Es la primera OSCURA de la línea de princesas. Cenicienta es azul
          hielo y plata, Perlas violeta, Marfil blanco y gris, Campestre oliva,
          Bohemia marrón y camel, Disco plata sobre negro. Ésta es ORO VIEJO,
          BORGOÑA Y VERDE BOTELLA sobre madera, a la luz de tres velas.
        · Los títulos van en CINZEL — romana de capitales, lapidaria. No la usa
          ninguna otra. El nombre va en PINYON SCRIPT, no en Alex Brush.
        · El fondo es un VIDEO de la mesa con la rosa, y lo que se mueve son
          LAS TRES VELAS: cada una late con su propio ritmo y su luz respira
          sobre el bronce. Movimiento medido 3,62 (playa aprobado = 2,85).
        · La marca del itinerario es una ROSA HERÁLDICA de cinco pétalos.
        · El botón va en ORO BRUÑIDO. Cenicienta cristal, Perlas lacre, Marfil
          nácar, Campestre arcilla, Bohemia relieve seco.

   ⚠️⚠️ LOS COLORES ESTÁN MEDIDOS CONTRA EL VIDEO, NO ELEGIDOS DE OJO.
      El fondo tiene un rango enorme: p5 = 3 (terciopelo casi negro) y
      p95 = 204 (el manuscrito iluminado y las llamas). Color medio (90,72,57).
      El 3% MÁS CLARO —el peor caso para una tinta clara— mide (239,223,195).

      Con el papel de la sección al 15% (`fx.fondo.paso = 0.85`) el compuesto
      queda (84,65,52) típico y (210,194,169) en el peor caso.

      🔴 CONTRA ESE PEOR CASO NINGUNA TINTA SOLA SIRVE:
             crema #F4E7CE → 1,43     oro #E3C88A → 1,07
         Y una tinta oscura se borra sobre el terciopelo. Por eso acá el VELO DE
         LECTURA NO ES OPCIONAL: es lo que hace legible la colección.

      Calculado el alfa necesario del velo para que la crema pase el piso de 5:
             0,45 → 3,84      0,55 → 5,01      0,65 → 6,60
         Se usa 0,62, que deja el compuesto peor en (95,84,70):
             TINTA  #F6EAD2 → 6,23     TINTA2 #EADCBD → 5,44
             ORO    #E3C88A → 4,56  ← títulos y adorno, NO texto chico
             TINTA3 #A98A5F → 2,29  ← SÓLO filetes y bordes, NUNCA texto

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'bella'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'bella';
  var ID_CSS = 'col-bella';
  var P      = 'html[data-col="bella"][data-coleccion="bella"] ';

  /* ---------------------------------------------------------------- paleta */

  var TINTA  = '#F6EAD2';   /* la principal: títulos, nombres, datos */
  var TINTA2 = '#EADCBD';   /* bajadas y textos secundarios */
  var TINTA3 = '#A98A5F';   /* SÓLO filetes, bordes y separadores */
  var ORO    = '#E3C88A';   /* el acento. Títulos y decoración, no texto chico */
  var ORO2   = '#C9A75E';   /* el oro más hondo, para bordes y sellos */
  var PAPEL  = '#2E1F14';   /* el papel OSCURO de la sección */
  var PAPEL2 = '#241809';
  var TABACO = '#1A1008';   /* el fondo del velo de lectura */
  var VINO   = '#6E1F2A';   /* la borgoña de la rosa, para detalles */

  var VELO_A = 0.62;        /* MEDIDO. Ver la cabecera. No bajarlo. */

  /* ------------------------------------------------------------- utilidades */

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    var f = (ev().fx) || {};
    return String(f.coleccion || '') === ID;
  }

  /* La rosa heráldica del adorno de los títulos.
     ⚠️ Dibujada para el TAMAÑO REAL: `.adorno` mide 40 px medidos en vivo, así
        que la rosa se ve como un círculo de unos 18 px. Ahí no entra una rosa
        de jardín con pétalos sueltos: entra una rosa HERÁLDICA, cinco pétalos
        y un botón. Verificada renderizándola a 40, 60 y 100 px.
        Es la misma lección del reloj de Cenicienta: doce marcas no entran,
        entran cuatro. */
  /* El capullo de rosa del adorno de los títulos.
     ⚠️ Dibujado para el TAMAÑO REAL: `.adorno` mide 40 px, o sea que la figura
        se ve a unos 18 px. Probadas y DESCARTADAS, renderizándolas a 40/64/110:
          · rosa de líneas con pétalos radiales → se lee como un monigote
          · rosa llena de cinco círculos        → margarita de sticker
          · rosa heráldica de pétalos en punta  → se lee como una ESTRELLA
          · espiral (rosa enrollada)            → ambigua a 40 px
        La que sí se lee es el CAPULLO DE PERFIL con tallo y dos hojas: a 40 px
        es inconfundible, y además es la rosa del cuento, la que el padre corta.
        Misma lección que el reloj de Cenicienta: se dibuja para el tamaño real,
        no para el viewBox. */
  function rosaSVG(color) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      '<g fill="' + color + '">' +
      '<path d="M24 5.5 C30.6 8.4 34.2 13.4 34.2 19.2 C34.2 25.6 29.6 30 24 30 ' +
      'C18.4 30 13.8 25.6 13.8 19.2 C13.8 13.4 17.4 8.4 24 5.5 Z"/>' +
      '<path d="M24 35 C19.5 35 16.5 33 15 30.2 C19 29.2 22.2 31 24 35 Z"/>' +
      '<path d="M24 38.5 C28.5 38.5 31.5 36.5 33 33.7 C29 32.7 25.8 34.5 24 38.5 Z"/>' +
      '</g>' +
      '<g fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M24 30 L24 43"/></g>' +
      '<g fill="none" stroke="' + PAPEL + '" stroke-width="1.9" stroke-linecap="round">' +
      '<path d="M24 11.5 C20.8 14 19.6 17.4 20.4 21.2"/>' +
      '<path d="M24 11.5 C27.2 14 28.4 17.4 27.6 21.2"/></g>' +
      '</svg>');
  }

  /* ------------------------------------------------------------------- CSS */

  function armarCSS() {
    return [

      /* ---- variables de la colección ---- */
      P + '{',
      '  --tinta:'   + TINTA  + '; --tinta2:' + TINTA2 + '; --tinta3:' + TINTA3 + ';',
      '  --oro:'     + ORO    + '; --oro2:'   + ORO2   + ';',
      '  --papel:'   + PAPEL  + '; --papel2:' + PAPEL2 + ';',
      '  --vino:'    + VINO   + '; --tabaco:' + TABACO + ';',
      '  --sage:'    + ORO    + '; --sage-cl:' + ORO2  + ';',
      '  --cream:'   + TINTA  + '; --muted:'  + TINTA2 + ';',
      '}',

      /* ---- 🔴 DESTAPAR EL FONDO ----------------------------------------
         El motor pinta `.sec` con `i/tex-acuarela.jpg`, un JPEG SIN alfa, así
         que TAPA el video entero. Es el mismo bug que se pagó en Campestre y
         en Cenicienta. El filtro es `:not([style*="url("])`, NO
         "background-image": las secciones con foto propia la escriben EN LÍNEA
         y hay que dejarlas en paz. */
      P + '.sec:not([style*="url("]){',
      '  background-image:none!important;',
      '  background-color:transparent!important;',
      '  position:relative!important;',
      '}',
      /* ⚠️ MEDIDO EN VIVO: matar sólo `background-image` NO alcanza en una
         colección OSCURA. El motor además pinta varias secciones con un COLOR
         de fondo claro —medido rgb(244,231,206)— y ahí la tinta clara queda
         crema sobre crema y desaparece. En Cenicienta no se nota porque esa
         colección es clara. Hay que matar también `background-color`. */

      /* ---- 🔴 EL VELO DE LECTURA, OSCURO ---------------------------------
         En Cenicienta el velo ACLARA porque la colección es clara. Acá OSCURECE.
         Alfa 0,62 medido (ver cabecera): por debajo de 0,55 la crema no llega
         al piso de 5 sobre el manuscrito iluminado del fondo.
         Bordes abiertos (`inset:0 16%`) para que el collage entre por los
         costados, y `blur` o se ve el rectángulo. */
      P + '.sec:not([style*="url("])::before{',
      '  content:""!important; position:absolute!important; z-index:0!important;',
      '  inset:0 16%!important; pointer-events:none!important;',
      '  background:linear-gradient(90deg,',
      '    rgba(26,16,8,0) 0%, rgba(26,16,8,' + VELO_A + ') 13%,',
      '    rgba(26,16,8,' + VELO_A + ') 87%, rgba(26,16,8,0) 100%)!important;',
      '  filter:blur(16px)!important;',
      '}',
      /* ⚠️ z-index 0 en el velo y 1 en los hijos. Al revés tapa el texto. */
      P + '.sec:not([style*="url("]) > *{ position:relative!important; z-index:1!important; }',

      /* ---- tipografía ----
         Cinzel para los títulos (romana de capitales, no la usa ninguna otra
         colección) y Cormorant Garamond para el cuerpo. */
      P + '.sec h2, ' + P + '.sec .h2, ' + P + '.stitle, ' + P + '.dq-h2{',
      '  font-family:"Cinzel",serif!important;',
      '  letter-spacing:.055em!important;',
      '  color:' + TINTA + '!important;',
      '}',
      P + '.sec, ' + P + '.sec div, ' + P + '.sec span{ color:' + TINTA2 + '; }',
      P + '.sec p, ' + P + '.sec li, ' + P + '.sec .txt{',
      '  font-family:"Cormorant Garamond",serif!important;',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + '.kick, ' + P + '.sec .kick{',
      '  font-family:"Pinyon Script",cursive!important;',
      '  color:' + ORO + '!important;',
      '  letter-spacing:.01em!important;',
      '}',

      /* ---- filetes y separadores: TINTA3, que NO se usa nunca para texto ---- */
      P + '.sec hr, ' + P + '.filete, ' + P + '.sep{',
      '  border-color:' + TINTA3 + '!important; background:' + TINTA3 + '!important;',
      '  opacity:.55!important;',
      '}',

      /* ---- el adorno del título: la rosa heráldica ---- */
      P + '.adorno{',
      '  background-image:url("' + rosaSVG(ORO) + '")!important;',
      '  background-size:contain!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '}',
      P + '.adorno svg, ' + P + '.adorno img{ display:none!important; }',

      /* ---- botón ORO BRUÑIDO ---- */
      P + '.btn, ' + P + 'button.btn, ' + P + 'a.btn{',
      '  background:linear-gradient(180deg,' + ORO + ' 0%,' + ORO2 + ' 100%)!important;',
      '  color:#241809!important; -webkit-text-fill-color:#241809!important;',
      '  border:1px solid rgba(36,24,9,.35)!important;',
      '  box-shadow:0 1px 0 rgba(255,240,205,.45) inset, 0 6px 16px rgba(0,0,0,.35)!important;',
      '  letter-spacing:.12em!important;',
      '}',
      P + '.btn.ghost, ' + P + 'a.btn.ghost{',
      '  background:rgba(246,234,210,.06)!important;',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '  border:1px solid ' + TINTA3 + '!important; box-shadow:none!important;',
      '}',

      /* ---- tarjetas y cajas: papel oscuro, no blanco ----
         ⚠️ Regla del chequeo «sin-parches-claros»: en una colección OSCURA
            cualquier superficie clara suelta canta. Se pintan TODAS. */
      P + '.card, ' + P + '.caja, ' + P + '.ev-card, ' + P + '.hotel, ' + P + '.tl{',
      '  background:linear-gradient(180deg,rgba(46,31,20,.92),rgba(36,24,9,.94))!important;',
      '  border:1px solid rgba(169,138,95,.40)!important;',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + '.card h3, ' + P + '.ev-card h3{ color:' + TINTA + '!important; font-family:"Cinzel",serif!important; }',

      /* ---- campos de formulario ---- */
      P + 'input, ' + P + 'select, ' + P + 'textarea{',
      '  background:rgba(26,16,8,.55)!important; color:' + TINTA + '!important;',
      '  border:1px solid ' + TINTA3 + '!important;',
      '}',
      P + 'input::placeholder, ' + P + 'textarea::placeholder{ color:rgba(234,220,189,.55)!important; }',

      /* ---- la línea del itinerario ---- */
      P + '.tl::before, ' + P + '.it::before{ background:' + TINTA3 + '!important; opacity:.6!important; }',
      P + '.it .h{ color:' + ORO + '!important; font-family:"Cinzel",serif!important; }',
      P + '.it .t{ color:' + TINTA2 + '!important; }',

      /* ---- el nombre de la portada ---- */
      P + '.portada h1, ' + P + '#nombre{ font-family:"Pinyon Script",cursive!important; }',

      ''
    ].join('\n');
  }

  /* ---------------------------------------------------------------- fuentes */

  function fuentes() {
    /* ⚠️ Se pide SÓLO el nombre de la familia. Con una pila CSS entera
       ("'Alex Brush',cursive") Google Fonts devuelve 400 y la fuente no carga.
       Eso está medido en la invitación de Clara. */
    var href = 'https://fonts.googleapis.com/css2' +
      '?family=Cinzel:wght@400;600' +
      '&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400' +
      '&family=Pinyon+Script' +
      '&display=swap';
    if (document.querySelector('link[data-col-fuentes="' + ID + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    l.setAttribute('data-col-fuentes', ID);
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------ poner/sacar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    return s;
  }

  function poner() {
    fuentes();
    hoja().textContent = armarCSS();
    document.documentElement.setAttribute('data-col', ID);
    document.documentElement.setAttribute('data-coleccion', ID);
    window.INVCOLPALETA = {
      tinta: TINTA, tinta2: TINTA2, tinta3: TINTA3,
      acento: ORO, acentoHondo: ORO2, papel: PAPEL, oscura: true
    };
  }

  function sacar() {
    var s = document.getElementById(ID_CSS); if (s) s.remove();
    if (document.documentElement.getAttribute('data-col') === ID) {
      document.documentElement.removeAttribute('data-col');
      document.documentElement.removeAttribute('data-coleccion');
    }
  }

  function sincronizar() { if (activa()) poner(); else sacar(); }

  function arrancar() {
    sincronizar();
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }
  arrancar();

  window.INVBELLA = { poner: poner, sacar: sacar, css: armarCSS, rosa: rosaSVG };
})();
