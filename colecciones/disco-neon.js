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
  var NEON_DEF = '#EAF6FF';

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

    /* ⭐ LA PALABRA EN NEÓN.
       Versalitas muy espaciadas y un TUBO de luz hecho con cuatro sombras: una
       blanca finita pegada a la letra (el vidrio), y tres cada vez más abiertas
       y más tenues (el halo en el aire).
       ⚠ El orden importa: de la más cerrada a la más abierta. Al revés se come
         el filo de la letra y queda un borrón.
       ⚠ `text-indent` compensa el `letter-spacing`: sin eso el bloque queda
         corrido a la izquierda, porque el espaciado se agrega DESPUÉS de la
         última letra y el centrado lo cuenta. */
    P + '.portada .kicker{',
    '  font-family:Montserrat,"Forum",sans-serif!important;',
    '  font-weight:600!important;',
    '  font-size:clamp(13px,3.4vw,17px)!important;',
    '  letter-spacing:.42em!important; text-indent:.42em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + NEON + '!important; -webkit-text-fill-color:' + NEON + '!important;',
    '  text-shadow:0 0 3px rgba(255,255,255,.95),' +
                 ' 0 0 9px ' + NEON + ',' +
                 ' 0 0 24px rgba(150,205,255,.55),' +
                 ' 0 0 52px rgba(90,165,255,.32)!important;',
    '  margin-bottom:2px!important;',
    '  animation:neonLatido 5.2s ease-in-out infinite!important;',
    '}',

    /* la segunda palabra, en cursiva de neón. Sale de un campo del panel: si
       está vacía el pseudo no dibuja nada y la portada queda con una sola. */
    P + '.portada .kicker::after{',
    '  content:var(--neon-script,"");',
    '  display:block;',
    '  font-family:"Rouge Script",cursive;',
    '  font-size:2.9em; line-height:1.05;',
    '  letter-spacing:0; text-indent:0;',
    '  text-transform:none;',
    '  margin-top:2px;',
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
    P + '.portada .names, ' + P + '.portada .names span{',
    '  background-image:linear-gradient(177deg,',
    '    #ffffff 0%, #f2f4f8 14%, #9aa0b0 26%, #dfe3ec 38%,',
    '    #ffffff 49%, #5b6070 53%, #8e94a4 62%,',
    '    #e9ecf3 78%, #ffffff 90%, #a9aebc 100%)!important;',
    '  -webkit-background-clip:text!important; background-clip:text!important;',
    '  -webkit-text-fill-color:transparent!important;',
    '  color:transparent!important;',
    '  filter:drop-shadow(0 1px 0 rgba(0,0,0,.6))' +
           ' drop-shadow(0 0 22px rgba(190,210,255,.30))!important;',
    '}',
    P + '.portada .names{',
    '  font-size:clamp(56px,15vw,96px)!important;',
    '  line-height:1.02!important;',
    '  margin-top:6px!important;',
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
    /* la palabra en cursiva viaja por variable: el CSS la consume con content:var() */
    var sc  = String(cfg().script || '').trim();
    var val = sc ? JSON.stringify(sc) : '""';
    if (raiz.style.getPropertyValue('--neon-script') !== val) raiz.style.setProperty('--neon-script', val);
    hoja();
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-portada') === MARCA) raiz.removeAttribute('data-portada');
    raiz.style.removeProperty('--neon-script');
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
