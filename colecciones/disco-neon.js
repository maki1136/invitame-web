/* ===== COLECCIÓN «DISCO NEÓN» ================================================

   Es DISCO, con OTRA PORTADA. Nace de una referencia que mandó Maki: una
   palabra en NEÓN en versalitas muy espaciadas, debajo otra palabra en NEÓN
   pero en cursiva, y el nombre en CROMADO LÍQUIDO. Todo ARRIBA, no abajo.

   Maki, 21/9/2026:
     «¿Se puede agregar a la plataforma ese estilo de tipografía y hacerlas así
      más arriba y con esos diseños las palabras? ¿Se puede armar así, cambiando
      de lugares los textos?»

   ⭐ POR QUÉ ES UNA COLECCIÓN APARTE Y NO UN RETOQUE DE DISCO
   Para poder venderla por separado: la clienta elige «Disco» (portada sobria,
   plata sobre negro) o «Disco Neón» (la misma fiesta, con la portada de
   cartel). El resto de la invitación es idéntico, y eso es A PROPÓSITO: no hay
   dos juegos de reglas para mantener.

   ⚠️⚠️ CÓMO CONVIVEN LAS DOS. `disco.js` acepta las DOS ids en su `activa()`,
   así que con `fx.coleccion = 'disco-neon'` se prende toda la hoja de Disco
   (papel, botones, itinerario, raspadita, sobre) y ESTE módulo agrega encima
   solamente la portada. Si mañana Disco cambia un color, Disco Neón lo hereda.

   ⭐ LO QUE ELIGE JAZMÍN DESDE EL PANEL
   (regla del 21/9: si no se puede armar desde el panel, la muestra no existe)

     fx.neon.alto    → 'sube' o 'centro': dónde se planta el bloque
     fx.neon.script  → la palabra en cursiva de neón (vacío = no aparece)
     fx.neon.color   → el color del tubo de neón (por defecto, hielo)

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'disco-neon'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID    = 'disco-neon';
  var MARCA = 'neon';                    /* lo que se escribe en html[data-portada] */
  var P     = 'html[data-portada="' + MARCA + '"] ';

  /* el neón por defecto: hielo. Frío, no celeste de kiosco. */
  var NEON_DEF = '#CFEBFF';

  function ev()  { try { return window.INVEV || {}; } catch (e) { return {}; } }
  function cfg() { var e = ev(); return (e.fx && e.fx.neon) || {}; }

  function activa() {
    try { return String((ev().fx || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }

  function armarCSS() {
    var c      = cfg();
    var NEON   = String(c.color || NEON_DEF);
    var ARRIBA = String(c.alto || 'sube').toLowerCase() !== 'centro';

    return [

    /* ⭐ EL BLOQUE SUBE.
       El motor planta la portada con `justify-content:flex-end`, o sea pegada
       abajo. Acá se da vuelta y se le da aire por arriba, que es lo que pidió
       Maki («hacerlas así más arriba»).
       ⚠ El valor va en % de la altura del MARCO, no en `vh`: el marco no es la
         pantalla — en escritorio mide 500 px de ancho adentro de la ventana. */
    P + '.portada{',
    '  justify-content:' + (ARRIBA ? 'flex-start' : 'center') + '!important;',
    '  padding-top:' + (ARRIBA ? '11%' : '0') + '!important;',
    '}',

    /* ⭐⭐ EL VELO DETRÁS DEL BLOQUE. Medido el 21/9/2026 mirando la primera
       versión: la portada de Lupita tiene la bola de espejos JUSTO donde ahora
       va el texto, y encima es la zona más clara de la foto. El neón se perdía
       y el cromado —que abajo tiene bandas oscuras a propósito— se leía como un
       gris sucio. No es un problema de color del texto: es que no había dónde
       apoyarlo.
       ⚠ El velo va en un `::before` del bloque, NO en el fondo de la portada:
         así no le tapa la foto a nadie más y, sobre todo, no entra en la cuenta
         de `reglas-duras.js`, que mira el fondo de los ANCESTROS. Un pseudo
         hermano no es ancestro.
       ⚠ Y es RADIAL, no una banda: una banda recta se ve como una barra gris
         cruzando la foto. El radial se apaga antes de llegar a los bordes. */
    P + '.portada > .c{ position:relative!important; padding:0 4.5vw!important; }',
    P + '.portada > .c::before{',
    '  content:""; position:absolute; left:50%; top:-30%;',
    '  transform:translateX(-50%);',
    '  width:200%; height:180%;',
    '  background:radial-gradient(56% 46% at 50% 48%,',
    '     rgba(4,4,8,.66) 0%, rgba(4,4,8,.52) 38%, rgba(4,4,8,.26) 60%, rgba(4,4,8,.08) 78%, rgba(4,4,8,0) 92%);',
    '  pointer-events:none; z-index:0;',
    '}',
    P + '.portada > .c > *{ position:relative!important; z-index:1!important; }',

    /* ⭐ LA PALABRA EN NEÓN.
       Versalitas muy espaciadas y un TUBO de luz hecho con cuatro sombras: una
       blanca finita pegada a la letra (el vidrio), y tres cada vez más abiertas
       y más tenues (el halo en el aire).
       ⚠ El orden importa: de la más cerrada a la más abierta. Al revés se come
         el filo de la letra y queda un borrón.
       ⚠ `text-indent` compensa el `letter-spacing`: sin eso el bloque queda
         corrido a la izquierda, porque el espaciado se agrega DESPUÉS de la
         última letra y el centrado lo cuenta. */
    P + '.portada #pv-kick, ' + P + '.portada .kicker{',
    '  font-size:0!important; line-height:1!important;',
    '  letter-spacing:0!important; text-indent:0!important;',
    '  margin:0!important;',
    '  animation:neonLatido 5.2s ease-in-out infinite!important;',
    '}',

    P + '.portada #pv-kick::before, ' + P + '.portada .kicker::before{',
    '  content:var(--neon-p1,"")!important; display:block!important;',
    '  font-family:Montserrat,sans-serif!important; font-weight:800!important;',
    '  font-size:clamp(46px,15vw,92px)!important; line-height:.92!important;',
    '  letter-spacing:.02em!important; text-indent:.02em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + NEON + '!important; -webkit-text-fill-color:' + NEON + '!important;',
    '  text-shadow:0 0 2px #ffffff,' +
                 ' 0 0 8px ' + NEON + ',' +
                 ' 0 0 20px ' + NEON + ',' +
                 ' 0 0 44px rgba(120,190,255,.75),' +
                 ' 0 0 90px rgba(70,150,255,.45)!important;',
    '  margin:0!important;',
    '}',

    /* la segunda palabra, en cursiva de neón. Sale de un campo del panel: si
       está vacía el pseudo no dibuja nada y la portada queda con una sola. */
    P + '.portada #pv-kick::after, ' + P + '.portada .kicker::after{',
    '  content:var(--neon-script,"");',
    '  display:block;',
    '  font-family:"Rouge Script",cursive;',
    '  font-size:clamp(56px,19vw,116px); line-height:.80;',
    '  letter-spacing:0; text-indent:0;',
    '  text-transform:none;',
    '  margin:-.30em 0 0 0;',
    /* ⚠ la sombra NO se hereda a escala: el desenfoque va en px, así que sobre
       una letra tres veces más grande el mismo halo se ve tres veces más
       flaco. Se vuelve a escribir, más abierto. */
    '  text-shadow:0 0 3px #ffffff,' +
                 ' 0 0 10px ' + NEON + ',' +
                 ' 0 0 26px ' + NEON + ',' +
                 ' 0 0 54px rgba(120,190,255,.70),' +
                 ' 0 0 96px rgba(70,150,255,.40);',
    '}',

    /* ⭐ EL NOMBRE EN CROMADO LÍQUIDO.
       Un degradado de plata con SALTOS DUROS (blanco, gris, blanco, gris
       oscuro) recortado contra la letra. Los saltos son lo que lo hace leer
       como metal y no como un degradado bonito: el cromo refleja el horizonte,
       y el horizonte es una LÍNEA, no una transición suave.
       ⚠️⚠️ VA `-webkit-text-fill-color:transparent`, NO SÓLO `color`.
         `reglas-duras.js` mide el contraste y escribe `color` INLINE con
         `!important` cuando cree que un texto no se lee. Si el cromo dependiera
         de `color:transparent`, esa corrección lo taparía con un gris plano y
         adiós cromado. `-webkit-text-fill-color` le gana a `color`, así que las
         reglas duras pueden hacer lo suyo sin romper nada. */
    P + '.portada #pv-names span, ' + P + '.portada .names span{',
    '  display:inline-block!important;',
    '  font:inherit!important; letter-spacing:inherit!important;',
    '  background-image:linear-gradient(174deg,',
    '    #ffffff 0%, #ffffff 14%, #dfe5ef 26%, #ffffff 36%,',
    '    #ffffff 48%, #8d95a6 54%, #c9d0dc 62%,',
    '    #ffffff 74%, #ffffff 90%, #d7dce6 100%)!important;',
    '  -webkit-background-clip:text!important; background-clip:text!important;',
    '  -webkit-text-fill-color:transparent!important;',
    '  color:transparent!important;',
    /* ⚠ el cromado tiene bandas OSCURAS a propósito (el horizonte reflejado).
       Sobre una foto clara esas bandas desaparecen y la letra se deshace. Las
       dos primeras sombras son el contorno que la sostiene; la tercera es el
       brillo del metal. */
    '}',
    P + '.portada #pv-names{',
    '  font-family:"Rouge Script",cursive!important;',
    '  font-weight:400!important;',
    '  font-size:clamp(84px,28vw,164px)!important;',
    '  line-height:.92!important;',
    '  letter-spacing:0!important;',
    '  text-transform:none!important;',
    '  background:none!important;',
    '  margin:.02em 0 0 0!important;',
    '  filter:drop-shadow(0 1px 1px rgba(0,0,0,.95))' +
           ' drop-shadow(0 0 4px rgba(0,0,0,.60))' +
           ' drop-shadow(0 0 30px rgba(150,205,255,.55))' +
           ' drop-shadow(0 14px 36px rgba(0,0,0,.80))!important;',
    '}',

    /* la bajada, debajo del nombre. Es un elemento DE VERDAD y no un pseudo:
       el `filter` del nombre alcanzaria tambien al pseudo y le meteria las
       sombras del cromado. */
    P + '.portada .neon-bajada{',
    '  display:block!important;',
    '  font-family:Montserrat,sans-serif!important; font-weight:500!important;',
    '  font-size:clamp(12px,3.2vw,16px)!important;',
    '  letter-spacing:.44em!important; text-indent:.44em!important;',
    '  text-transform:uppercase!important;',
    '  color:#E6ECF5!important; -webkit-text-fill-color:#E6ECF5!important;',
    '  text-shadow:0 1px 2px rgba(0,0,0,.92), 0 0 14px rgba(120,190,255,.45)!important;',
    '  margin:.85em 0 .35em 0!important;',
    '}',

    /* la fecha: versalitas espaciadas, el pie del cartel */
    P + '.portada .fecha{',
    '  font-family:Montserrat,"Forum",sans-serif!important;',
    '  font-size:clamp(10px,2.6vw,12px)!important;',
    '  letter-spacing:.34em!important; text-indent:.34em!important;',
    '  text-transform:uppercase!important;',
    '  margin-top:12px!important;',
    '}',

    /* ⚠ EL LATIDO ES DE TUBO, NO DE CARTEL ROTO. Un neón sano respira: baja
       apenas y vuelve. Nada de parpadeos — eso se lee como error, no como
       diseño, y encima marea. */
    '@keyframes neonLatido{',
    '  0%,100% { opacity:1 }',
    '  46%     { opacity:.86 }',
    '  52%     { opacity:1 }',
    '}',
    '@media (prefers-reduced-motion: reduce){',
    P + '.portada .kicker{ animation:none!important; }',
    '}'

    ].join('\n');
  }

  function hoja() {
    var s = document.getElementById('col-' + ID);
    if (!s) { s = document.createElement('style'); s.id = 'col-' + ID; document.head.appendChild(s); }
    var txt = armarCSS();
    if (s.textContent !== txt) s.textContent = txt;
  }

  function poner() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-portada') !== MARCA) raiz.setAttribute('data-portada', MARCA);
    var c = cfg();
    /* las DOS palabras de neon viajan por variable: el CSS las consume con
       content:var(). Asi el motor puede reescribir el texto del kicker todas
       las veces que quiera, que el que se ve es el pseudo. */
    var p1  = String(c.palabra || "LET'S").trim();
    var vp1 = p1 ? JSON.stringify(p1) : '""';
    if (raiz.style.getPropertyValue('--neon-p1') !== vp1) raiz.style.setProperty('--neon-p1', vp1);
    var sc  = String(c.script || '').trim();
    var val = sc ? JSON.stringify(sc) : '""';
    if (raiz.style.getPropertyValue('--neon-script') !== val) raiz.style.setProperty('--neon-script', val);
    hoja();
    bajada(String(c.bajada || '').trim());
  }

  /* La bajada («Mis XV anos») va DEBAJO del nombre. Se crea a mano porque el
     motor no tiene ese renglon: la fecha (#pv-fecha) puede venir en
     display:none segun la disposicion elegida, asi que no sirve de percha. */
  function bajada(txt) {
    try {
      var n = document.getElementById('pv-names'); if (!n || !n.parentElement) return;
      var b = n.parentElement.querySelector('.neon-bajada');
      if (!txt) { if (b && b.parentNode) b.parentNode.removeChild(b); return; }
      if (!b) {
        b = document.createElement('div');
        b.className = 'neon-bajada';
        n.insertAdjacentElement('afterend', b);
      }
      if (b.textContent !== txt) b.textContent = txt;
    } catch (e) {}
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-portada') === MARCA) raiz.removeAttribute('data-portada');
    raiz.style.removeProperty('--neon-script');
    raiz.style.removeProperty('--neon-p1');
    var vb = document.querySelector('.neon-bajada');
    if (vb && vb.parentNode) vb.parentNode.removeChild(vb);
    var s = document.getElementById('col-' + ID);
    if (s) s.parentNode.removeChild(s);
  }

  /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle (reglas-duras.js
     corre con cada cambio de clase del marco) y un observador dispararía
     decenas de veces por segundo. Un repaso cada tanto alcanza. */
  function sincronizar() { if (activa()) poner(); else sacar(); }

  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  /* para prenderla y apagarla a mano desde la consola, al revisar */
  window.INVDISCONEON = { poner: poner, sacar: sacar, css: armarCSS };
})();
