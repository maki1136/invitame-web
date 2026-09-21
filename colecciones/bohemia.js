/* ===== COLECCIÓN «BOHEMIA» ===================================================

   Boho chic. Nace de una referencia que mandó Maki el 21/9/2026:
   `invitameok.com/bohemia-bohochic/64a78745` — una boda en San Miguel de
   Allende hecha con la plataforma VIEJA: 19 secciones, cero video, todo
   estático. El pedido fue textual: «hay que hacer algo como esto pero con
   nuestra plataforma nueva, con movimiento, video, etc.».

   ⭐ QUÉ LA HACE DISTINTA DE LAS OTRAS CINCO  (regla de Maki del 16/9:
      «si vas a hacer lo mismo, ¿cuál es la gracia de tener diferentes
      muestras?»). Bohemia se planta en lo único que ninguna otra hace:

        · NO LLEVA CURSIVA. Ni una letra. Perlas, Marfil y la de Martina son
          todas de script, Campestre trae Sacramento y Disco Neón va en cromado
          cursivo. Acá los nombres van en BODONI MODA, versalitas, con el
          espaciado muy abierto. Es lo que hace la referencia y es lo que hace
          que se lea "editorial" y no "invitación de plantilla".
        · La tinta es MARRÓN CÁLIDO y el acento es CAMEL (#A87D5A, medido de la
          referencia). Perlas es violeta, Marfil blanco y gris, Campestre oliva,
          Disco plata sobre negro.
        · El fondo es un VIDEO de plumas de pampa meciéndose.
        · La marca del itinerario es una ROSA SECA FOTOGRAFIADA, no un vector.
        · El botón va en RELIEVE SECO (letterpress). Perlas lacre, Marfil nácar,
          Campestre arcilla, XV Martina esmalte.

   ⚠️⚠️ LOS COLORES ESTÁN MEDIDOS, NO ELEGIDOS DE OJO.
      El papel de la foto base mide (236,209,179). Contra ese papel:
          TINTA  #4A3B2E → 7,33      TINTA2 #5E4B3C → 5,63
          TINTA3 #C7B5A1 → 1,36  ← SÓLO filetes y bordes, NUNCA texto
          CAMEL  #A87D5A → 2,50  ← SÓLO decoración, NUNCA texto
      La primera TINTA2 que probé (#6B5646) daba 4,71 sobre la foto: por debajo
      del piso de 5,0 de la regla 7 del chequeo. Por eso es #5E4B3C.
      Y ojo con la trampa: medir sólo contra el papel CSS miente, porque abajo
      hay una FOTO más oscura. Se mide contra la foto.

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'bohemia'`.
   ⭐ Jazmín la elige desde el selector de `efectos/panel-coleccion.js`.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'bohemia';
  var ID_CSS = 'col-bohemia';
  var P      = 'html[data-col="bohemia"][data-coleccion="bohemia"] ';

  /* ---------------------------------------------------------------- paleta */

  var TINTA  = '#4A3B2E';   /* la principal: títulos, nombres, datos */
  var TINTA2 = '#5E4B3C';   /* bajadas y textos secundarios */
  var TINTA3 = '#C7B5A1';   /* SÓLO filetes, bordes y separadores */
  var CAMEL  = '#A87D5A';   /* el acento de la referencia. Decoración. */
  var PAPEL  = '#EFE4D6';
  var PAPEL2 = '#F6EFE5';
  var CREMA  = '#F7F1E7';   /* el texto que va ARRIBA de la tinta */

  /* la pieza fotografiada: la MISMA url en los cuatro lugares
     (itinerario, tapa de la playlist, perilla del sí/no, tapa de la raspadita) */
  var ROSA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1789979950/invitame/piezas/bohemia-rosa.webp';

  /* ⚠️⚠️ LAS VARIABLES QUE BOHEMIA RECLAMA COMO PROPIAS.
     `efectos/paleta.js` reescribe estas variables en el <html> INLINE y con
     !important cada 1,5 s, así que ninguna hoja de estilo le gana. El contrato
     (el mismo que usa Marfil desde el 17/9) es publicar acá la tabla y que la
     paleta pinte ESTOS valores en lugar de los suyos.
     ⚠️ A propósito NO se reclaman `--sage`, `--sage-cl` ni `--oro`: ésos son los
        acentos y ahí manda el color que eligió la pareja. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,
    '--verde2':    '#3A2F25',
    '--muted':     TINTA2,
    '--cream':     CREMA,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col-v': TINTA
  };

  /* ------------------------------------------------------------- tipografía */

  var DISPLAY = '"Bodoni Moda", "Playfair Display", Didot, Georgia, serif';
  var SANS    = '"Karla", "Jost", system-ui, sans-serif';

  function ev()  { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === ID;
    } catch (e) {}
    try { return String(((ev().fx) || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }

  /* --------------------------------------------------------------- la hoja */

  function armarCSS() {
    return [

    /* ── tipografía general ────────────────────────────────────────────── */
    P + '.frame h2, ' + P + '.frame .tit, ' + P + '.frame .sec h2{',
    '  font-family:' + DISPLAY + '!important;',
    '  font-weight:400!important;',
    '  letter-spacing:.14em!important;',
    '  text-transform:uppercase!important;',
    '}',
    P + '.frame .kick, ' + P + '.frame .fecha, ' + P + '.frame .dato{',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.26em!important;',
    '  text-indent:.26em!important;',   /* compensa el espaciado, si no queda corrido */
    '  text-transform:uppercase!important;',
    '}',
    P + '.frame p, ' + P + '.frame li{ font-family:' + SANS + '!important; letter-spacing:.01em!important; }',

    /* ⚠️ lining-nums o «1739» se lee «I739» en una didona */
    P + '.frame{ font-variant-numeric:lining-nums!important; }',

    /* ── LA PORTADA ────────────────────────────────────────────────────────
       ⚠️⚠️ LOS TAMAÑOS DE LA PORTADA SE GANAN POR ID.
       `i/estilos-servidor.css` tiene, con !important y selector de ID:
           #pv-names{ font-size:var(--fs-nombres,54px)!important }
           #pv-kick { font-size:var(--fs-kicker,15px) !important }
       Un ID (1,0,0) le gana a cualquier `html[data-x] .portada .names` (0,3,0).
       Por eso acá se escribe #pv-names / #pv-kick y no la clase. */
    P + '.portada{ justify-content:center!important; }',

    /* el velo. Va en un ::before del BLOQUE, no en el fondo de la portada:
       un pseudo hermano no es ancestro, así que no le ensucia la cuenta del
       contraste a reglas-duras.js. Y es RADIAL: una banda recta se ve como una
       barra cruzando la foto. */
    P + '.portada > .c{ position:relative!important; padding:0 6vw!important; }',
    P + '.portada > .c::before{',
    '  content:""; position:absolute; left:50%; top:-24%;',
    '  transform:translateX(-50%); width:190%; height:165%;',
    '  background:radial-gradient(54% 44% at 50% 48%,',
    '     rgba(28,20,12,.50) 0%, rgba(28,20,12,.38) 40%, rgba(28,20,12,.18) 62%,',
    '     rgba(28,20,12,.05) 80%, rgba(28,20,12,0) 92%);',
    '  pointer-events:none; z-index:0;',
    '}',
    P + '.portada > .c > *{ position:relative!important; z-index:1!important; }',

    /* el sobretítulo: «NUESTRA BODA», bien chico y muy abierto */
    P + '.portada #pv-kick{',
    '  font-family:' + SANS + '!important;',
    '  font-size:clamp(11px,3.1vw,14px)!important;',
    '  font-weight:500!important;',
    '  letter-spacing:.52em!important; text-indent:.52em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    '  line-height:1.4!important;',
    '  margin:0 0 1.9em 0!important;',
    '  text-shadow:0 1px 3px rgba(24,16,10,.85)!important;',
    '}',

    /* ⭐ LOS NOMBRES. Versalitas Bodoni, muy abiertas, en dos renglones.
       ⚠️ Sin cursiva: es la firma de la colección.
       ⚠️ `text-indent` compensa el `letter-spacing`, o el bloque queda corrido
          a la izquierda: el espaciado se agrega DESPUÉS de la última letra y el
          centrado lo cuenta. */
    P + '.portada #pv-names{',
    '  font-family:' + DISPLAY + '!important;',
    '  font-weight:500!important;',
    '  font-style:normal!important;',
    /* ⚠️⚠️ MEDIDO EN VIVO EL 21/9, NO ELEGIDO DE OJO. Con el tamaño anterior
       «MARÍA PAZ» se PARTÍA en dos renglones y la portada quedaba en cuatro
       líneas con el «&» solo en el medio. La cuenta: el bloque mide 519 px y
       «& Santiago» mide 454 px a 59,6 px de cuerpo — entra, pero sólo si se le
       prohíbe cortar. Por eso van juntas las dos cosas: el cuerpo Y el
       `white-space:nowrap` del span. Sin el nowrap, cualquier nombre largo
       vuelve a partirse. */
    '  font-size:clamp(32px,11vw,60px)!important;',
    '  line-height:1.22!important;',
    '  letter-spacing:.15em!important; text-indent:.15em!important;',
    '  text-transform:uppercase!important;',
    '  color:' + CREMA + '!important; -webkit-text-fill-color:' + CREMA + '!important;',
    /* ⚠️ longhands, no el atajo: ver la nota del itinerario */
    '  background-image:none!important;',
    '  background-color:transparent!important;',
    '  margin:0!important;',
    /* la sombra va como filter para que envuelva la letra, no como text-shadow
       de caja */
    '  filter:drop-shadow(0 1px 2px rgba(24,16,10,.92))',
    '         drop-shadow(0 0 22px rgba(24,16,10,.55))!important;',
    '}',
    /* ⚠️ cada nombre entero en su renglón: el motor los mete en spans sueltos y
       sin esto «MARÍA PAZ» se parte al medio. */
    P + '.portada #pv-names span{ white-space:nowrap!important; }',

    /* el nexo que mete el motor («&») en su propio tamaño y en camel */
    P + '.portada #pv-names span.amp, ' + P + '.portada #pv-names .amp{',
    '  font-size:.52em!important;',
    '  letter-spacing:0!important;',
    '  color:' + CAMEL + '!important; -webkit-text-fill-color:' + CAMEL + '!important;',
    '  opacity:.95!important;',
    '}',

    /* el filete camel debajo de los nombres */
    P + '.portada #pv-names::after{',
    '  content:""; display:block; width:120px; height:1px;',
    '  margin:1.05em auto .1em;',
    '  background-color:' + CAMEL + ';',
    '  opacity:.85;',
    '}',

    P + '.portada .fecha{',
    '  font-family:' + SANS + '!important;',
    '  font-size:clamp(11px,2.9vw,13.5px)!important;',
    '  letter-spacing:.40em!important; text-indent:.40em!important;',
    '  color:' + CREMA + '!important;',
    '  text-shadow:0 1px 3px rgba(24,16,10,.85)!important;',
    '  margin-top:1.9em!important;',
    '}',

    /* ── PERSONAS: LAS TRES EN UNA FILA. SIEMPRE. ──────────────────────────
       ⚠️⚠️ ES LA REGLA 1 DE chequeo/muestra.js Y FALLA SOLA.
       LA CAUSA: `.padres` es un grid con `grid-template-columns:168px 168px`,
       DOS columnas FIJAS. Con tres personas cae 2 + 1. No es falta de lugar:
       el marco mide 500 px. Maki lo marcó tres veces. */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important;',
    '  background-color:transparent!important;',   /* ⚠ sin panel atrás: se lee como un bulto */
    '  background-image:none!important;',
    '  border:0!important; box-shadow:none!important;',
    '}',
    P + '.padres .av{ width:104px!important; height:104px!important; }',
    P + '.padres .nm{ font-size:18px!important; font-family:' + DISPLAY + '!important; letter-spacing:.06em!important; }',
    P + '.padres .rel{ font-family:' + SANS + '!important; letter-spacing:.18em!important; text-transform:uppercase!important; font-size:10.5px!important; }',

    /* ── LA RASPADITA ──────────────────────────────────────────────────────
       ⚠️⚠️ SON DOS RAMAS SEPARADAS DEL ÁRBOL:
           #scratchcard
            ├── .rasp-3 > .r3-f     ← las fichas de ABAJO (lo que se revela)
            └── .rasp-zona > canvas ← la TAPA que se raspa   ← ESTA es la que se ve
       La variable `--r3-tapa` la lee `efectos/raspadita.js` desde el CANVAS, y
       una variable de CSS sólo baja a los DESCENDIENTES: hay que declararla en
       los contenedores de LAS DOS ramas o el lienzo nunca la ve y sigue
       pintando el degradado liso de fábrica.
       ⚠️ Y la FORMA sale de `fx.raspadita.forma`, que ya está en el panel.
          Redondear `.r3-f` por CSS no sirve: es la otra rama. */
    ':is(#bh-nada, .scratch-sec, .rasp-3, .rasp-zona, #scratchcard){',
    '  --r3-tapa:url("' + ROSA + '");',
    '}',
    /* ⚠️ EL RECUADRO. El motor le pone `background:var(--lino2)` al contenedor,
       y encima es fácil que se cuele en un grupo de "tarjetas". Maki ya pidió
       sacarlo dos veces. Se apaga POR PARTES: el atajo `background:` con
       !important pisa cosas que no queremos pisar. */
    ':is(#bh-nada, .scratchcard){',
    '  background-color:transparent!important;',
    '  background-image:none!important;',
    '  border:0!important;',
    '  box-shadow:none!important;',
    '}',

    /* ── EL ITINERARIO ─────────────────────────────────────────────────────
       Nada de circulitos: la marca es la rosa fotografiada. La colección firma
       `data-marca-propia` en el <html> y `simbolo-tematica.js` se corre solo.
       ⚠️ VAN LAS LONGHANDS, NUNCA el atajo `background:` con !important: el
          atajo expande TODAS sus longhands y clava `background-position`, y una
          declaración !important de autor le gana a una animación. Así se quedó
          quieta la bola de espejos el 20/9 sin un solo error en consola. */
    P + '.tl > .it::before{',
    '  background-image:url("' + ROSA + '")!important;',
    '  background-size:contain!important;',
    '  background-repeat:no-repeat!important;',
    '  border-radius:50%!important;',
    '  box-shadow:none!important;',
    '  border:0!important;',
    '  width:22px!important; height:22px!important;',
    '  content:""!important;',
    '}',
    /* ⚠️ LA VÍA EMPIEZA Y TERMINA DONDE ESTÁ LA COSA. Son DOS elementos, no uno:
       `.tl::before` es la vía y `.tl-prog` es el relleno que avanza con la hora.
       Recortar sólo el primero deja el bug vivo para un evento ya empezado.
       Los valores los mide `medirVia()` acá abajo y llegan por variable. */
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  top:var(--bh-tl-ini,6px)!important;',
    '  bottom:var(--bh-tl-fin,6px)!important;',
    '  height:auto!important;',
    '}',
    P + '.tl::before{',
    '  background-image:repeating-linear-gradient(to bottom,',
    '     ' + TINTA3 + ' 0 5px, rgba(0,0,0,0) 5px 12px)!important;',
    '  background-color:transparent!important;',
    '  width:1px!important;',
    '}',

    /* ── LA TAPA DEL VIDEO Y DE LA PLAYLIST ────────────────────────────────
       El preview crudo de YouTube y el reproductor de Spotify se tapan con la
       pieza de la temática.
       ⚠️ LA TAPA NO ES UN RECTÁNGULO: va transparente, con el iframe en
          visibility:hidden. */
    P + '.rd-tapa, ' + P + '.sp-tapa{',
    '  background-color:transparent!important;',
    '  background-image:url("' + ROSA + '")!important;',
    '  background-size:78px 78px!important;',
    '  background-position:center!important;',
    '  background-repeat:no-repeat!important;',
    '}',

    /* ── LA PERILLA DEL SÍ / NO ────────────────────────────────────────────
       ⚠️ El área de toque se mide: mínimo 44 px. La pastilla mide 77, o sea 38
          por mitad — por eso Maki dijo «me costó mucho poner que sí». Los
          rótulos de al lado también se tocan (eso lo arregla el motor); acá
          sólo se viste la perilla con la pieza. */
    P + '.si .knob, ' + P + '.no .knob, ' + P + '.mitad .knob{',
    '  background-image:url("' + ROSA + '")!important;',
    '  background-size:cover!important;',
    '  background-color:transparent!important;',
    '}',

    /* ── LA CARTA ──────────────────────────────────────────────────────────
       ⚠️ LA HOJA DE LA CARTA TAMBIÉN ES SUPERFICIE: `.cf-letter` trae el papel
          clavado en el motor. Acá va el papel de Bohemia, no el blanco del
          molde. */
    P + '.cf-letter{',
    '  background-color:' + PAPEL2 + '!important;',
    '  color:' + TINTA + '!important;',
    '  font-family:' + SANS + '!important;',
    '}',
    P + '.cf-letter h3, ' + P + '.cf-letter .cf-tit{',
    '  font-family:' + DISPLAY + '!important;',
    '  letter-spacing:.12em!important; text-transform:uppercase!important;',
    '  color:' + TINTA + '!important;',
    '}',

    /* ── FILETES Y ADORNOS ─────────────────────────────────────────────────
       TINTA3 da 1,36 sobre la foto: es un filete, NUNCA un texto. */
    P + '.frame hr, ' + P + '.frame .linea, ' + P + '.frame .adorno::before, ' + P + '.frame .adorno::after{',
    '  background-color:' + TINTA3 + '!important; border-color:' + TINTA3 + '!important;',
    '}',

    /* ⚠️ NO se pinta fondo/borde/sombra de los botones: eso lo hace
       `efectos/botones.js` con el material elegido en `fx.boton.estilo`
       (acá: relieve-seco). Si la colección lo pinta, le pisa el material y
       queda plano. Marfil borró todas sus reglas de píldora por esto. Sólo va
       la tipografía. */
    P + '.btn, ' + P + '#btn-ingresar, ' + P + '.wsp, ' + P + '.tv-btn, ' + P + '.inv-prev-btn{',
    '  font-family:' + SANS + '!important;',
    '  letter-spacing:.20em!important; text-indent:.20em!important;',
    '  text-transform:uppercase!important;',
    '  font-size:12px!important;',
    '}',

    '@media (prefers-reduced-motion: reduce){',
    P + '.tl::before{ animation:none!important; }',
    '}'

    ].join('\n');
  }

  /* --------------------------------------------------------------- pintar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    var txt = armarCSS();
    if (s.textContent !== txt) s.textContent = txt;
  }

  /* ⚠️ LA VÍA DEL ITINERARIO NO SE RESUELVE SÓLO CON CSS.
     Dónde cae el centro de la primera ficha depende de cuánto mide su texto, y
     ese texto lo carga Jazmín. Se MIDE y se pasa por variable, y se vuelve a
     medir en cada repaso: así sigue bien cuando gira el teléfono o cambia un
     texto. Son dos getBoundingClientRect, no pesa. */
  function medirVia() {
    try {
      var tl = document.querySelector('.tl');
      if (!tl) return;
      var its = tl.querySelectorAll(':scope > .it');
      if (its.length < 2) return;
      var R = tl.getBoundingClientRect();
      var a = its[0].getBoundingClientRect();
      var b = its[its.length - 1].getBoundingClientRect();
      var ini = Math.round(a.top + a.height / 2 - R.top);
      var fin = Math.round(R.bottom - (b.top + b.height / 2));
      if (ini > 0) tl.style.setProperty('--bh-tl-ini', ini + 'px');
      if (fin > 0) tl.style.setProperty('--bh-tl-fin', fin + 'px');
    } catch (e) {}
  }

  function poner() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') !== ID) raiz.setAttribute('data-col', ID);
    if (raiz.getAttribute('data-coleccion') !== ID) raiz.setAttribute('data-coleccion', ID);
    /* la colección trae su propia marca (la rosa fotografiada): que
       `simbolo-tematica.js` no dibuje su vector encima. */
    if (raiz.getAttribute('data-marca-propia') !== ID) raiz.setAttribute('data-marca-propia', ID);
    window.INVCOLPALETA = PALETA_PROPIA;
    hoja();
    medirVia();
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') === ID) raiz.removeAttribute('data-col');
    if (raiz.getAttribute('data-coleccion') === ID) raiz.removeAttribute('data-coleccion');
    if (raiz.getAttribute('data-marca-propia') === ID) raiz.removeAttribute('data-marca-propia');
    if (window.INVCOLPALETA === PALETA_PROPIA) { try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; } }
    var s = document.getElementById(ID_CSS);
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }

  /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle (reglas-duras.js
     corre con cada cambio de clase del marco) y un observador dispararía
     decenas de veces por segundo. Un repaso cada 1,2 s alcanza. */
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
  window.INVBOHEMIA = { poner: poner, sacar: sacar, css: armarCSS, via: medirVia };
})();
