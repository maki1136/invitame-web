/* ===== COLECCIÓN «CAMPESTRE» ================================================

   La cuarta familia de Invítame. Nace de la referencia que mandó Maki el
   21/9/2026 —la boda rústica-campestre de la plataforma VIEJA
   (invitameok.com/rustica-campestre)— con el encargo de hacer «algo como esto
   pero con nuestra nueva plataforma, con movimiento, video, etc.».

   QUÉ LA HACE DISTINTA DE LAS OTRAS TRES (la regla de las muestras diferentes)

     · Perlas   → playa, violeta y perlas, botón LACRE,   Cormorant + Great Vibes
     · Marfil   → papel marfil, portada sin foto, NÁCAR,  Cormorant + Parisienne
     · Disco    → noche, plata sobre negro, bola espejos, Montserrat + Rouge
     · Campestre→ campo al atardecer, crema y oliva,      Forum + Sacramento + Lora
                  botón ARCILLA, marca de RODAJA DE MADERA fotografiada

   Cero cruce: ni una tipografía, ni un botón, ni un color, ni una foto
   compartida con las otras.

   ⭐ LA PALETA NO ES INVENTADA: ESTÁ MEDIDA SOBRE LAS FOTOS
   Se sacó por k-means de la propia tanda de Flow (el poster del fondo, la
   portada, la capilla y el flat lay de vestimenta). Los cremas daban #f2e2ca,
   #e9ddca, #e7e5e0 y #fcf3e4; los oscuros #26210d, #372d13 y #3d2f16. De ahí
   salen PAPEL y TINTA, no de mi cabeza.

   ⭐ Y ESTÁ MEDIDA CONTRA EL PISO DE CONTRASTE DE LA PLATAFORMA (5,0 / 4,0):
       TINTA  #2F3320 sobre el papel .... 10,81  ✅ texto normal
       TINTA2 #55523A .................... 6,58  ✅ texto normal
       TINTA3 #7A7458 .................... 3,91  ⚠️ SOLO filetes y bordes
       SALVIA #6B7558 .................... 4,05  ⚠️ SOLO texto grande
       TERRA  #96502F .................... 5,01  ✅ acento de texto
       TRIGO  #C29A5B .................... 2,17  ⚠️ SOLO adorno, NUNCA texto
     y sobre el panel oscuro #221E14:
       crema 13,82 · trigo claro #D8B472 8,46 · salvia clara #B9C3A6 9,04
   ⚠️ Si alguien cambia un color, vuelve a correr esta cuenta ANTES de subir.
      Es exactamente lo que se saltó Marfil en la fase 4 y costó la fase 6.

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'campestre'`.
   ⭐ Y ESTÁ EN EL PANEL: entrada 'campestre' en el array COLECCIONES de
      `efectos/panel-coleccion.js`. Regla del 21/9: si Jazmín no la puede
      elegir, la colección no existe.
   ============================================================================ */
(function () {
  'use strict';

  var ID    = 'campestre';
  var SELLO = 'html[data-col="campestre"][data-coleccion="campestre"] ';

  /* ---------------------------------------------------------------- tipografía
     Las tres ya las carga el motor (están en el <link> de Google Fonts de
     i/index.html), así que la colección NO pide fuentes nuevas: si pidiera,
     habría un salto de tipografía en el primer pintado.
     ⚠️ Forum y Lora son justamente las dos de la referencia de Maki. */
  var SERIF   = '"Forum", "Cormorant Garamond", Georgia, serif';
  var CURSIVA = '"Sacramento", "Tangerine", cursive';
  var CUERPO  = '"Lora", Georgia, serif';

  /* ------------------------------------------------------------------ colores */
  var PAPEL   = '#f3e9d9';   /* crema cálido: el papel */
  var PAPEL2  = '#efe4d1';   /* el mismo, un punto más tostado */
  var TINTA   = '#2f3320';   /* oliva muy oscuro: títulos y texto principal */
  var TINTA2  = '#55523a';   /* bajadas y datos */
  var TINTA3  = '#7a7458';   /* ⚠️ SOLO filetes, bordes y separadores */
  var SALVIA  = '#6b7558';   /* verde salvia oscuro: nombres de lugar */
  var SALVIACL= '#b9c3a6';   /* salvia clara: sobre el panel oscuro */
  var TRIGO   = '#c29a5b';   /* ⚠️ SOLO adorno: no pasa el contraste como texto */
  var TERRA   = '#96502f';   /* terracota oscura: el acento */
  var OSCURO  = '#221e14';   /* el panel de noche: itinerario, carta, contacto */

  /* ⚠️⚠️ LO QUE LA COLECCIÓN LE RECLAMA A `efectos/paleta.js`.
     Misma historia que Marfil: la paleta elegida reescribe estas variables en
     el <html> con `!important` cada 1,5 s, y contra eso no gana ninguna hoja.
     Publicando la tabla, `paleta.js` pinta ESTOS valores.
     Se reclaman también las SUPERFICIES, porque Campestre cambia el papel: sin
     ellas, abajo de una invitación crema asoman los grises del molde. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,
    '--verde2':    '#242817',
    '--muted':     TINTA2,
    '--cream':     '#f7f1e4',
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col-v': TINTA,
    '--sage':      SALVIA,
    '--sage-cl':   '#cdd3bd',
    '--oro':       TRIGO,
    /* superficies
       ⚠️⚠️ `--sec-col` ES EL PAPEL DE LAS SECCIONES NORMALES, NO EL PANEL OSCURO.
          Visto el 21/9/2026 mirando la muestra: la primera versión le pasaba
          OSCURO (#221e14) y el motor lo aplica al 38% sobre el fondo de video,
          así que TODAS las secciones comunes quedaban con un velo gris topo,
          alternando con las `.sec.verde` que sí salían claras. La invitación
          parecía a dos aguas. El panel oscuro del itinerario no sale de acá:
          lo pone la propia colección en `.tl` y en `--tl-papel`. */
    '--sec-col':   PAPEL,
    '--tl-papel':  OSCURO,
    '--tl-tinta':  '#f3e9d9',
    '--cf-sobre':  '#ddcdb2',
    '--cf-col':    TINTA,
    '--sobre-c':   '#ddcdb2',
    '--flap-base': '#d2c0a2',
    '--seal-c':    TERRA
  };
  try { window.INVCOLPALETA = PALETA_PROPIA; } catch (e) {}

  /* --------------------------------------------------------------- las piezas
     La rodaja de madera fotografiada y recortada por textura. Va en los CUATRO
     lugares que pide la skill: la marca del itinerario, la tapa de la playlist,
     la perilla del interruptor de confirmar y la tapa de la raspadita.

     ⚠️ NO SE DIBUJA A MANO, NI SIQUIERA A 22 px. Se probó sobre negro y sobre
        crema a 160, 120, 62, 40 y 26 px: a 26 todavía se le lee la corteza.
     ⚠️ Y EL RECORTE NO SE HACE POR VARIANZA. El método de desvío local daba
        radio 404 px porque metía la SOMBRA DE CONTACTO adentro del sujeto.
        Midiendo calidez (R−B > 12) el borde real está en 366. 38 px de
        diferencia = un anillo gris alrededor de la pieza. */
  var RODAJA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1789980148/invitame/piezas/rodaja-madera.webp';

  /* el fondo por defecto de la colección: el campo con viento, en video.
     Medido: 6,83 s de loop, 945 KB, movimiento medio 4,52 con mínimo 2,24
     (el fondo de playa que Maki aprobó mide 2,85 de media). */
  var FONDO_VIDEO  = 'https://res.cloudinary.com/oc8cgqt4/video/upload/v1789978328/invitame/fondos/campo-viento-atardecer.mp4';
  var FONDO_POSTER = 'https://res.cloudinary.com/oc8cgqt4/image/upload/v1789978338/invitame/fondos/campo-viento-atardecer-poster.jpg';

  /* ------------------------------------------------------------------ ayudas */
  function ev()   { try { return window.INVEV || {}; } catch (e) { return {}; } }
  function activa() {
    try { return String((ev().fx || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }
  function tieneFuentePropia() {
    try { var f = (ev()).nfont; return !!(f && String(f).trim()); } catch (e) { return false; }
  }

  /* ============================================================== EL FONDO ===
     La colección se lo pone sola a cualquier invitación que no traiga uno
     propio, igual que Marfil.
     ⚠️ ESTO NO ESCRIBE EN LA BASE: sólo completa `INVEV.fx.fondo` EN MEMORIA.
     ⚠️ `donde:'pantalla'` y no 'marco': acá el campo es la ESCENA, no el papel
        de la tarjeta, así que tiene que llenar también los costados.
     ⚠️ `tapeMax` bajo a propósito: Maki, 18/9, «el fondo de video está
        buenísimo, que se vea más». El velo de legibilidad no puede pasar de
        ahí; si un bloque no se lee, se corrige el TEXTO. */
  function ponerFondo() {
    var e = ev(); if (!e.fx) return;
    var f = e.fx.fondo;
    if (f && f.url) return;                    /* la invitación trae el suyo */
    e.fx.fondo = {
      tipo: 'video', url: FONDO_VIDEO, poster: FONDO_POSTER,
      fuerza: 1.04, velo: 0.10, paso: 0.62, oscuras: 0,
      donde: 'pantalla', tapeMax: 0.52
    };
  }

  /* ================================================================ LA HOJA === */
  function armarCSS() {
    var P = SELLO;
    var propia = tieneFuentePropia();

    return [

    /* ---------------------------------------------------------------- papel */
    P + '.frame{ background-color:' + PAPEL + '!important; }',
    P + '.sec, ' + P + '.footer{ color:' + TINTA + '; }',

    /* ------------------------------------------------------------ tipografía
       Si la invitación eligió fuente propia desde el panel, la colección no
       le pisa los NOMBRES; el resto de la tipografía sí es de la colección. */
    P + 'h1,' + P + 'h2,' + P + 'h3,' + P + '.tit,' + P + '.h,' + P + '.kick{',
    '  font-family:' + SERIF + '!important;',
    '  letter-spacing:.06em!important; font-weight:400!important;',
    '}',
    P + 'p,' + P + '.p,' + P + '.txt,' + P + '.d,' + P + '.nm,' + P + '.rel{',
    '  font-family:' + CUERPO + '!important;',
    '}',
    (propia ? '' : P + '.portada .names, ' + P + '#pv-names{ font-family:' + CURSIVA + '!important; }'),
    P + '.cursiva, ' + P + '.nexo, ' + P + '.and{ font-family:' + CURSIVA + '!important; }',

    /* los sobretítulos: versalitas muy espaciadas, como la referencia */
    P + '.kick, ' + P + '.kicker{',
    '  text-transform:uppercase!important; letter-spacing:.34em!important;',
    '  font-size:11.5px!important; color:' + TINTA2 + '!important;',
    '}',

    /* ⚠️⚠️ EL SOBRETÍTULO DE LA PORTADA NO VA SOBRE EL PAPEL: VA SOBRE LA FOTO.
       Visto el 21/9/2026 en la muestra de María Paz: «Nos casamos en el campo»
       era una mancha. La causa no es el tamaño ni la fuente — es que la regla
       de arriba le pone TINTA2 (#55523A), que está calculada contra el papel
       crema (6,58), y en la portada cae sobre una fotografía de tonos cálidos
       oscuros. Tinta oscura sobre imagen oscura.
       Y encima el motor le pone una sombra OSCURA, que despega un texto claro
       y entierra uno oscuro: empeoraba lo que venía a arreglar.
       → En la portada va el crema, igual que los nombres y la cuenta regresiva.
       ⚠️ Va `-webkit-text-fill-color` además de `color`: `reglas-duras.js`
          escribe `color` en línea con !important cuando cree que un texto no
          se lee, y el fill le gana sin pelearse con las reglas duras.
       ⚠️ Ojo al medirlo: el barrido de contraste NO ve esta foto, porque
          `fondo-invitacion.js` la pinta con un `<img>` adentro de `#inv-fondo`
          y no como `background-image`. Por eso la regla 7 marca los nombres
          (1,07) que se leen perfecto y NO marcaba este sobretítulo, que era el
          único roto de verdad. Acá se mira, no se le cree al número. */
    P + '.portada .kick, ' + P + '.portada .kicker, ' + P + '.portada #pv-kick{',
    '  color:#f7f1e4!important; -webkit-text-fill-color:#f7f1e4!important;',
    '}',

    /* -------------------------------------------------------------- filetes
       ⚠️ TINTA3 da 3,91 sobre el papel: NO se usa para texto en ningún lado.
          Acá va sólo como línea. */
    P + 'hr, ' + P + '.filete, ' + P + '.linea{',
    '  border-color:' + TINTA3 + '!important; opacity:.55!important;',
    '}',

    /* ------------------------------------------------------- nombres de lugar
       `--sage` es el color de los nombres de lugar debajo de «Ceremonia» y
       «Fiesta». Salvia oscura da 4,05: alcanza porque ahí el texto es grande.
       Si alguna vez se usa en texto chico, hay que oscurecerlo. */
    P + '.ev .lugar, ' + P + '.evento .lugar{ color:' + SALVIA + '!important; }',

    /* ======================================================== LOS BOTONES ====
       ⚠️ LA COLECCIÓN NO PINTA EL MATERIAL DEL BOTÓN. Eso lo hace
          `efectos/botones.js` con `fx.boton.estilo` (acá: ARCILLA). Si la
          colección le pusiera fondo, borde o sombra, le pisaría el material y
          quedaría plano — la lección que pagó Marfil en cinco fases.
          Sólo se le pone la TIPOGRAFÍA. */
    P + '.btn, ' + P + '#btn-ingresar, ' + P + '.wsp, ' + P + '.tv-btn{',
    '  font-family:' + SERIF + '!important;',
    '  letter-spacing:.16em!important; text-transform:uppercase!important;',
    '  font-size:12.5px!important;',
    '}',

    /* ==================================================== NUESTRAS PERSONAS ==
       ⭐ LAS TRES EN UNA FILA. SIEMPRE. Es la regla 1 de chequeo/muestra.js y
          falla sola. La causa es del motor: `.padres` es un grid de DOS
          columnas FIJAS de 168px. No es falta de lugar — el marco mide 500. */
    P + '.padres{',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:10px 8px!important; background-color:transparent!important;',
    '}',
    P + '.padres .av{ width:104px!important; height:104px!important; }',
    P + '.padres .nm{ font-size:18px!important; font-family:' + SERIF + '!important; }',
    P + '.padres .rel{ font-size:11.5px!important; color:' + TINTA2 + '!important; }',

    /* ========================================================= EL ITINERARIO ==
       Panel oscuro, como la mesa a la luz de las velas de la sección contacto.
       ⚠️ El `background-color` va DECLARADO Y OPACO. Si el panel se oscurece
          sólo con degradados, `reglas-duras.js` se queda sin color de fondo,
          resuelve BLANCO y da vuelta el texto a negro sobre negro. */
    P + '.tl{',
    '  position:relative!important;',
    '  background-color:' + OSCURO + '!important;',
    '  border-radius:14px!important; padding:18px 16px!important;',
    '  color:#f3e9d9!important; overflow:hidden!important;',
    '}',
    P + '.tl .it, ' + P + '.tl .t, ' + P + '.tl .h{ position:relative; z-index:1; }',
    P + '.tl .t{ font-family:' + SERIF + '!important; color:#f3e9d9!important; }',
    P + '.tl .h{ color:' + SALVIACL + '!important; }',
    P + '.tl .d{ color:#cfc6ad!important; }',

    /* ⭐⭐ EL MOVIMIENTO DEL PANEL ES CONTINUO O NO EXISTE.
       Maki, 21/9: «si pasa cada varios segundos es como que no pasó nada,
       quedó como una imagen fija». El láser de Disco cruzaba cada 9 s: eso son
       8,2 s de NADA.
       Acá abajo hay algo que no para nunca: motas de polen/polvo cálido
       subiendo en diagonal a dos velocidades, y un soplo de luz tibia que
       cruza DENTRO del mismo ciclo.
       ⚠️ EL VIAJE ES MÚLTIPLO EXACTO DEL MOSAICO o el loop pega un salto:
          264 = 4×66 · 132 = 2×66 · 228 = 2×114 · 114 = 1×114.
       ⚠️ Y TODO EL BRILLO VA EN EL ::after, NUNCA en el background del panel:
          `reglas-duras.js` abre los degradados de los ANCESTROS y se queda con
          la parada más clara para decidir el color del texto. Un pseudo no es
          ancestro. */
    '@keyframes campoPolen{',
    '  from{ background-position:0 0, 0 0, -85% 0; }',
    '  to  { background-position:264px -132px, -228px 114px, 185% 0; }',
    '}',
    P + '.tl::after{',
    '  content:""; position:absolute; inset:0; pointer-events:none; z-index:0;',
    '  background-image:',
    '    radial-gradient(circle at 50% 50%, rgba(255,231,180,.30) 0, rgba(255,231,180,0) 10%),',
    '    radial-gradient(circle at 50% 50%, rgba(214,206,170,.13) 0, rgba(214,206,170,0) 17%),',
    '    linear-gradient(100deg, transparent 0%, rgba(255,240,205,.085) 50%, transparent 100%);',
    '  background-size:66px 66px, 114px 114px, 80% 100%;',
    '  background-repeat:repeat, repeat, no-repeat;',
    '  mix-blend-mode:screen;',
    '  animation:campoPolen 7.4s linear infinite;',
    '}',
    '@media (prefers-reduced-motion: reduce){ ' + P + '.tl::after{ animation:none; } }',

    /* ⭐ LA VÍA EMPIEZA Y TERMINA DONDE ESTÁ LA COSA.
       El motor la dibuja de borde a borde (`top:6px;bottom:6px`), así que
       sobra línea antes de la primera marca y después de la última.
       ⚠️ SON DOS ELEMENTOS: `.tl::before` (la vía) y `.tl-prog` (el relleno que
          avanza con la hora). Recortar sólo el primero deja el bug vivo para
          cualquier evento ya empezado.
       ⚠️ Los valores los MIDE el repaso (--tl-ini / --tl-fin): dependen del
          alto de la primera ficha, que depende del texto que cargue Jazmín. */
    P + '.tl::before, ' + P + '.tl > .tl-prog{',
    '  top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important;',
    '  height:auto!important;',
    '}',
    /* y la vía deja de ser una raya muerta: hilo punteado con la luz bajando */
    P + '.tl::before{',
    '  background-image:repeating-linear-gradient(to bottom,',
    '     rgba(243,233,217,.52) 0 4px, rgba(243,233,217,0) 4px 13px)!important;',
    '  background-size:100% 13px!important;',
    '  animation:campoHilo 1.1s linear infinite!important;',
    '}',
    '@keyframes campoHilo{ from{ background-position:0 0 } to{ background-position:0 13px } }',
    '@media (prefers-reduced-motion: reduce){ ' + P + '.tl::before{ animation:none!important } }',

    /* ⭐ LA MARCA DE CADA MOMENTO: LA RODAJA FOTOGRAFIADA.
       ⚠️ NUNCA con el atajo `background:` + !important. El atajo expande TODAS
          las longhands, incluida `background-position`, y una declaración
          !important de autor le gana a una animación: la pieza queda clavada y
          se ve quieta sin un solo error en consola. Van las longhands. */
    P + '.tl > .it::before{',
    '  background-image:url("' + RODAJA + '")!important;',
    '  background-repeat:no-repeat!important;',
    '  background-size:contain!important;',
    '  border:0!important; box-shadow:none!important;',
    '  width:22px!important; height:22px!important;',
    '  filter:drop-shadow(0 1px 2px rgba(0,0,0,.45));',
    '}',

    /* ====================================================== LA RASPADITA ======
       ⚠️ SON DOS RAMAS DEL ÁRBOL, NO UNA:
            #scratchcard
             ├── .rasp-3 > .r3-f     ← las fichas de abajo (lo que se revela)
             └── .rasp-zona > canvas ← la TAPA que se raspa
          `--r3-tapa` la lee el LIENZO, así que hay que declararla en los
          contenedores de las DOS ramas: una variable de CSS sólo baja a los
          DESCENDIENTES.
       ⚠️ Y EL CONTENEDOR VA SIN RECUADRO. Maki lo pidió dos veces. El motor le
          pone `background: var(--lino2)`, así que hay que apagarlo POR PARTES:
          el atajo `background:` con !important pisa cosas que no queremos. */
    ':is(#cp-nada, .scratch-sec, .rasp-3, .rasp-zona){ --r3-tapa:url("' + RODAJA + '"); }',
    P + ':is(#cp-nada, .scratchcard){',
    '  background-color:transparent!important; background-image:none!important;',
    '  border:0!important; box-shadow:none!important;',
    '}',

    /* ============================================ EL VIDEO Y LA PLAYLIST ======
       La tapa NO es un rectángulo: va transparente, con el iframe escondido
       por `visibility`, y encima la pieza de la temática. */
    P + '.tv-tapa, ' + P + '.sp-tapa{',
    '  background-color:transparent!important;',
    '  background-image:url("' + RODAJA + '")!important;',
    '  background-repeat:no-repeat!important;',
    '  background-position:center!important;',
    '  background-size:84px 84px!important;',
    '}',

    /* ===================================================== EL SÍ / NO =========
       ⚠️ El área de toque se mide: mínimo 44 px. La pastilla del motor mide 77
          entera, o sea 38 por mitad — por eso «me costó mucho poner que sí».
          Los rótulos de al lado se hacen tocables y hacen lo mismo. */
    P + '.si, ' + P + '.no, ' + P + '.mitad{ min-height:44px!important; }',
    P + '.rsvp-rot{ cursor:pointer; padding:10px 6px; }',
    /* la perilla del interruptor, con la pieza */
    P + '.rsvp-sw .knob, ' + P + '.interruptor .knob{',
    '  background-image:url("' + RODAJA + '")!important;',
    '  background-size:cover!important; background-color:transparent!important;',
    '}',

    /* ========================================================= LA CARTA =======
       ⚠️ `.cf-letter` trae el papel CLAVADO en el motor y no sale de ninguna
          variable. Acá se le pone el crema de la colección para que no sea la
          única hoja de otro color de toda la invitación. */
    P + '.cf-letter{ background-color:#f7f1e4!important; color:' + TINTA + '!important; }',
    P + '.cf-letter p{ font-family:' + CUERPO + '!important; }',

    /* ================================================= EL «VER MÁS» ===========
       Hereda `color:inherit` de una regla del servidor y ni el material del
       botón se la gana. Se le presta la clase `.btn` desde el JS (marca
       `data-cp-btn` para devolverla al apagar) y acá sólo el color. */
    P + '.iv-plie-btn{ color:' + TINTA + '!important; font-family:' + SERIF + '!important; }',

    /* ========================================================= EL PIE =========
       ⚠️ `.footer` NO es `.sec`: en Marfil se quedó con su foto oscura y con la
          tinta clara encima. Acá se le pone el papel y la tinta a propósito. */
    P + '.footer{ background-color:' + PAPEL2 + '!important; color:' + TINTA + '!important; }',
    P + '.footer a{ color:' + TERRA + '!important; }'

    ].filter(Boolean).join('\n');
  }

  /* ================================================================ EL MOTOR == */
  var HOJA = 'col-campestre-css';

  function poner() {
    var raiz = document.documentElement;
    raiz.setAttribute('data-col', ID);
    raiz.setAttribute('data-coleccion', ID);
    /* ⭐ la marca del itinerario es una FOTO, no el símbolo vectorial:
       `simbolo-tematica.js` se corre solo al ver esto, y la regla 5 del
       chequeo acepta este camino desde el 20/9. El `.adorno` de los títulos
       lo sigue vistiendo el símbolo (juego «campo»). */
    raiz.setAttribute('data-marca-propia', ID);

    var st = document.getElementById(HOJA);
    if (!st) { st = document.createElement('style'); st.id = HOJA; document.head.appendChild(st); }
    var css = armarCSS();
    if (st.textContent !== css) st.textContent = css;

    ponerFondo();
    prestarBtn();
    medirVia();
  }

  function sacar() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') === ID) {
      raiz.removeAttribute('data-col');
      raiz.removeAttribute('data-coleccion');
      raiz.removeAttribute('data-marca-propia');
    }
    var st = document.getElementById(HOJA); if (st) st.remove();
    [].forEach.call(document.querySelectorAll('[data-cp-btn]'), function (el) {
      el.classList.remove('btn'); el.removeAttribute('data-cp-btn');
    });
  }

  /* El «Ver más», el WhatsApp del pie y el sí/no quedan fuera de la lista que
     viste `botones.js`. NO se agrega a la lista del motor —cambiaría
     invitaciones ya entregadas—: se les PRESTA la clase desde acá. */
  function prestarBtn() {
    var sel = '.iv-plie-btn, .col-mvta-b';
    [].forEach.call(document.querySelectorAll(sel), function (el) {
      if (!el.classList.contains('btn')) { el.classList.add('btn'); el.setAttribute('data-cp-btn', '1'); }
    });
  }

  /* ⭐ LA MEDICIÓN DE LA VÍA. No se puede resolver sólo con CSS: dónde cae la
     primera marca es `padding-top + alto-de-la-primera-ficha / 2`, y ese alto
     depende del texto. Son dos getBoundingClientRect: no pesa. */
  function medirVia() {
    var tl = document.querySelector('.tl'); if (!tl) return;
    var fichas = tl.querySelectorAll('.it'); if (!fichas.length) return;
    var R = tl.getBoundingClientRect();
    var a = fichas[0].getBoundingClientRect();
    var b = fichas[fichas.length - 1].getBoundingClientRect();
    if (!R.height || !a.height) return;               /* todavía sin medir */
    tl.style.setProperty('--tl-ini', Math.round(a.top + a.height / 2 - R.top) + 'px');
    tl.style.setProperty('--tl-fin', Math.round(R.bottom - (b.top + b.height / 2)) + 'px');
  }

  function repaso() { if (activa()) poner(); else sacar(); }

  repaso();
  setInterval(repaso, 1200);
  document.addEventListener('DOMContentLoaded', repaso);
  window.addEventListener('load', repaso);
  window.addEventListener('resize', medirVia);

  try { window.INVCAMPESTRE = { poner: poner, sacar: sacar, activa: activa, pieza: RODAJA }; } catch (e) {}
})();
