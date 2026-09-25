/* ============================================================================
   COLECCIÓN «LA PRINCESA Y EL SAPO»  ·  id `sapo`  ·  25/9/2026
   La CUARTA de la línea de princesas: Cenicienta → Bella → Sirena → Sapo.
   Y la SEGUNDA OSCURA de la plataforma, después de Bella.

   ⚠️ ES EL CUENTO DE LOS GRIMM, NO LA PELÍCULA. Lo que arranca la historia es
      LA BOLA DE ORO que se le cae a la princesa en el pozo. De ahí sale todo:
      el agua verde honda, la piedra con musgo, el tilo (hojas de corazón) y la
      rana de bronce. Nada de Nueva Orleans, nada de jazz. Misma regla que sacó
      la nieve de Frozen de Cenicienta.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'sapo'` no hace absolutamente
      nada: el archivo viaja en el paquete de `efectos/todo.php` y se carga en
      TODAS las invitaciones. Todo lo que escribe afuera —`INVCOLPALETA`, los
      atributos del `<html>`, la hoja, el pase movido— va en `poner()` y tiene
      su línea espejo en `sacar()`.

   ⭐ EL VELO VA UNA SOLA VEZ, SOBRE EL FONDO. Lección de Bella, pagada con tres
      versiones y un «Target crashed» de WebKit: veinte pseudo-elementos
      absolutos (uno por sección) hacen crashear Safari AL CARGAR. El velo tapa
      EL FONDO, así que va en `#inv-fondo::after`, fijo, una vez.

   ⭐ LA PIEZA FOTOGRAFIADA es `invitame/piezas/bola-oro` (480×480 WebP con
      alfa, recortada por color y verificada sobre negro a 160/120/62/40/26 px).
      Va donde hay UNA sola y tiene aire: la tapa de la raspadita y la de la
      playlist. En el ITINERARIO, donde se repite en serie, va la VIÑETA
      VECTORIAL —la hoja de tilo—, porque una foto repetida se lee como
      calcomanías (lección de la rosa de Bohemia).
   ============================================================================ */
(function () {

  var ID     = 'sapo';
  var ID_CSS = 'col-sapo';
  var P      = 'html[data-col="sapo"][data-coleccion="sapo"] ';

  /* --------------------------------------------------------------- la paleta
     Medidos contra el papel #14251C:
       CREMA  #E8DFC8 → 11,9    ORO #C9A44E → 5,6    ORO_CL #E0C57A → 8,6      */
  var PAPEL  = '#14251C';   /* agua honda: el papel de las secciones */
  var PAPEL2 = '#0D1A13';   /* el verde casi negro, para los pozos */
  var TINTA  = '#E8DFC8';   /* crema: títulos, nombres, datos */
  var TINTA2 = '#C6C0A8';   /* crema apagada: bajadas y cuerpo */
  var TINTA3 = '#5C6B52';   /* musgo pálido: SÓLO filetes. NUNCA texto */
  var ORO    = '#C9A44E';   /* el acento */
  var ORO_CL = '#E0C57A';   /* el oro claro, para títulos grandes */
  var MUSGO  = '#1E3A2B';   /* el verde musgo de los paneles */

  var BOLA = 'https://res.cloudinary.com/oc8cgqt4/image/upload/invitame/piezas/bola-oro.webp';
  var TAPA_VIDEO = 'https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/sapo/sapo-tapa-video-25-9';
  var TAPA_PLAY  = 'https://res.cloudinary.com/oc8cgqt4/image/upload/c_fill,w_900,h_506,g_center,q_auto,f_auto/invitame/sapo/sapo-tapa-playlist-25-9';

  /* ⚠️ LA TABLA QUE LA COLECCIÓN RECLAMA COMO PROPIA. Es el contrato de
     `efectos/paleta.js`: van NOMBRES DE VARIABLE CSS, no claves inventadas.
     Bella publicaba {tinta, acento, papel} y por eso no reclamaba ninguna. */
  var PALETA_PROPIA = {
    '--verde':     ORO,
    '--verde2':    ORO_CL,
    '--muted':     TINTA2,
    '--cream':     PAPEL,
    '--lino':      PAPEL,
    '--lino2':     PAPEL2,
    '--sec-col':   PAPEL,
    '--sec-col-v': TINTA,
    '--sage':      ORO,
    '--sage-cl':   ORO_CL,
    '--oro':       ORO
  };

  /* ------------------------------------------------------------- utilidades */

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === ID;
    } catch (e) {}
    try { return String(((ev().fx) || {}).coleccion || '').toLowerCase() === ID; }
    catch (e) { return false; }
  }

  /* LA HOJA DE TILO: el adorno de los títulos y la marca del itinerario.
     ⚠️ Dibujada para el TAMAÑO REAL. `.adorno` mide 40 px medidos en vivo (la
        figura se ve a ~18) y la marca del itinerario a 26.
        Descartadas por la misma razón que la vieira de Sirena:
          · la rana de perfil     → a 18 px es una mancha con patas
          · la bola sola          → a 18 px es un punto, o sea el circulito
          · el pozo               → se lee como una taza
        La hoja de tilo es un CORAZÓN con pecíolo y nervadura: a 18 px se lee
        entera, y es el árbol bajo el que pasa el cuento. */
  function hojaSVG(color) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      /* el limbo: corazón asimétrico, punta abajo */
      '<path fill="' + color + '" d="M24 44 C13.5 35.5 5 28.4 5 19.6 ' +
      'C5 12.6 10.4 7.4 17 7.4 C20.4 7.4 22.9 8.9 24 10.9 ' +
      'C25.1 8.9 27.6 7.4 31 7.4 C37.6 7.4 43 12.6 43 19.6 ' +
      'C43 28.4 34.5 35.5 24 44 Z"/>' +
      /* el pecíolo: sin él se lee como un corazón de tarjeta */
      '<path fill="none" stroke="' + color + '" stroke-width="2.4" ' +
      'stroke-linecap="round" d="M24 44 L24 47.2"/>' +
      /* la nervadura, fina y en el papel, para que no se empaste */
      '<g fill="none" stroke="' + PAPEL + '" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="M24 41.4 L24 14.6"/>' +
      '<path d="M24 32 L14.4 23.4"/><path d="M24 32 L33.6 23.4"/>' +
      '<path d="M24 24.6 L16.2 17.8"/><path d="M24 24.6 L31.8 17.8"/>' +
      '</g>' +
      '</svg>');
  }

  /* ------------------------------------------------------------------- CSS */

  function armarCSS() {
    var A = [];

    /* ---- 1 · el papel de la invitación --------------------------------- */
    A.push(
      P + '.frame{ background-color:' + PAPEL2 + '!important; }',
      P + 'section.sec{ background-color:' + PAPEL + '!important; color:' + TINTA2 + '!important; }',
      P + 'section.sec.verde{ background-color:' + MUSGO + '!important; }',
      /* el claro radial detrás del bloque de texto: el fondo va ADELANTE
         (paso .72) y sin esto los textos sueltos quedan sobre el agua */
      P + '.frame > section.sec:not(#contacto-sec):not(.scratch-sec){ background-image:radial-gradient(ellipse 74% 52% at 50% 44%, rgba(20,37,28,.72) 0%, rgba(20,37,28,.44) 48%, rgba(20,37,28,0) 80%)!important; }'
    );

    /* ---- 2 · EL VELO: UNA SOLA CAPA, SOBRE EL FONDO ---------------------
       ⚠️ NO un ::before por sección: eso hace crashear WebKit al cargar.
       ⚠️ Se abre sólo en los 8 % de cada punta, donde no hay letra. */
    A.push(
      P + '#inv-fondo::after{ content:""!important; position:fixed!important; inset:0!important; pointer-events:none!important; z-index:1!important; background:linear-gradient(to right, rgba(8,18,13,0) 0%, rgba(8,18,13,.58) 8%, rgba(8,18,13,.58) 92%, rgba(8,18,13,0) 100%)!important; }'
    );

    /* ---- 3 · LA ESCALA TIPOGRÁFICA, REESCRITA ENTERA --------------------
       ⚠️ El molde la clava por clase y con !important, calibrada para una
          CURSIVA (--fs-cursiva 34px). Esta colección usa Cormorant para los
          títulos, así que la escala se reescribe: el SOBRETÍTULO tiene que ser
          MÁS CHICO que el título, y cada título entra en UN renglón.
       ⚠️ Van en px pelados, no en vw: el marco mide 500 px fijos.
       ⚠️ Se gana por especificidad (0,4,1), no tocando --fs-*: `paleta.js`
          reescribe esas variables cada 1,5 s y ninguna hoja le gana. */
    A.push(
      P + '.sec .kick{ font-family:"Parisienne",cursive!important; font-size:19px!important; line-height:1.25!important; letter-spacing:.01em!important; color:' + ORO + '!important; }',
      P + '.sec h2{ font-family:"Cormorant Garamond",serif!important; font-size:22px!important; line-height:1.18!important; letter-spacing:.06em!important; color:' + TINTA + '!important; }',
      P + '.sec .frase{ font-family:"Lora",serif!important; font-size:17px!important; line-height:1.62!important; color:' + TINTA2 + '!important; }',
      P + '.sec p:not(.frase){ font-family:"Lora",serif!important; font-size:15px!important; line-height:1.64!important; color:' + TINTA2 + '!important; }',
      P + '.t{ font-family:"Cormorant Garamond",serif!important; font-size:19px!important; color:' + TINTA + '!important; }'
    );

    /* ---- 4 · LA PORTADA -------------------------------------------------
       AL PIE, no centrada: centrarla pone el nombre sobre la cara.
       ⚠️ Los tamaños se ganan por ID: #pv-names y #pv-kick están clavados con
          !important en i/estilos-servidor.css y un ID (1,0,0) le gana a
          cualquier encadenado de clases. */
    A.push(
      P + '.portada{ justify-content:flex-end!important; }',
      P + '#pv-kick{ font-family:"Lora",serif!important; font-size:12px!important; letter-spacing:.34em!important; text-indent:.34em!important; text-transform:uppercase!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '#pv-names{ font-family:"Parisienne",cursive!important; font-size:clamp(44px,12vw,62px)!important; line-height:1.24!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; padding-bottom:.06em!important; }',
      P + '.portada :is(.num,.lab,.sep,.fecha){ color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; }',
      P + '.portada .num{ font-family:"Cormorant Garamond",serif!important; }',
      /* el velo de la portada: radial y suave, nunca una banda recta */
      P + '.portada > .c::before{ content:""!important; position:absolute!important; left:0!important; right:0!important; bottom:-16vh!important; height:82vh!important; pointer-events:none!important; z-index:-1!important; background:radial-gradient(ellipse 120% 70% at 50% 86%, rgba(8,18,13,.72) 0%, rgba(8,18,13,.40) 46%, rgba(8,18,13,0) 78%)!important; }'
    );

    /* ---- 5 · LAS TARJETAS DE LUGAR, CON ARCO ---------------------------
       ⚠️ `.hotel` comparte el grupo y vive adentro de un desplegable CERRADO:
          con padding chico el arco se come la primera línea del nombre.
          Por eso `padding-top:38px` en `.hotel`. */
    A.push(
      P + ':is(.evento,.hotel,.pasecard){ background-color:' + MUSGO + '!important; border:1px solid rgba(201,164,78,.28)!important; box-shadow:0 10px 26px rgba(0,0,0,.34)!important; }',
      P + ':is(.evento,.hotel){ width:auto!important; border-radius:50% 50% 14px 14px / 44px 44px 14px 14px!important; overflow:hidden!important; }',
      P + '.evento .ph{ height:230px!important; }',
      P + '.hotel{ padding:38px 18px 18px!important; text-align:center!important; }',
      P + '.hotel .btn{ margin:10px auto 0!important; }',
      /* UNA sola lista por elemento: los títulos NO entran en la de cuerpo */
      P + ':is(.evento,.hotel,.pasecard) :is(p,.sub,.addr,.k){ color:' + TINTA2 + '!important; }',
      P + ':is(.evento,.hotel) :is(h3,h4), ' + P + '.pasecard .v{ color:' + TINTA + '!important; font-family:"Cormorant Garamond",serif!important; }'
    );

    /* ---- 6 · PERSONAS: LAS TRES EN UNA FILA ----------------------------- */
    A.push(
      P + '.padres{ grid-template-columns:repeat(3,1fr)!important; gap:10px 8px!important; background-color:transparent!important; }',
      P + '.padres[data-col-n="1"]{ grid-template-columns:minmax(0,220px)!important; justify-content:center!important; }',
      P + '.padres[data-col-n="2"]{ grid-template-columns:repeat(2,1fr)!important; }',
      P + '.padres[data-col-n="4"]{ grid-template-columns:repeat(4,1fr)!important; gap:8px 6px!important; }',
      P + '.padres .av{ width:104px!important; height:104px!important; border:2px solid ' + ORO + '!important; }',
      P + '.padres .nm{ font-size:18px!important; color:' + TINTA + '!important; }'
    );

    /* ---- 7 · EL ITINERARIO ---------------------------------------------
       La vía empieza y termina DONDE ESTÁ LA COSA (ver recortarVia), y son
       DOS elementos: `.tl::before` (la vía) y `.tl > .tl-prog` (el avance). */
    A.push(
      P + '.tl{ background-color:' + MUSGO + '!important; border:1px solid rgba(201,164,78,.24)!important; border-radius:16px!important; padding-left:56px!important; }',
      P + '.tl::before, ' + P + '.tl > .tl-prog{ left:34px!important; top:var(--tl-ini,6px)!important; bottom:var(--tl-fin,6px)!important; height:auto!important; }',
      P + '.tl::before{ background-image:radial-gradient(circle, ' + TINTA3 + ' 1.1px, rgba(0,0,0,0) 1.2px)!important; background-size:2px 9px!important; background-repeat:repeat-y!important; background-color:transparent!important; width:2px!important; }',
      P + '.tl > .tl-prog{ background-color:' + ORO + '!important; width:2px!important; opacity:.85!important; }',
      /* la marca: la hoja de tilo sobre un disco de papel que tapa la vía */
      P + '.tl > .it::before{ width:26px!important; height:26px!important; left:34px!important; margin-left:-13px!important; border-radius:50%!important; background-color:' + MUSGO + '!important; background-image:url("' + hojaSVG(ORO) + '")!important; background-size:18px 18px!important; background-repeat:no-repeat!important; background-position:center!important; box-shadow:0 0 0 1px rgba(201,164,78,.35)!important; border:0!important; }',
      /* ⚠️ el motor maneja la marca con DOS reglas: reposo y revelado. Si se
         pisa sólo la opacidad, la marca se enciende a scale(.2) y se ve un
         puntito — el «circulito» que Maki ya rechazó. Va atada a `.on`. */
      P + '.tl.tl-anim > .it:not(.on)::before{ opacity:0!important; }',
      P + '.tl.tl-anim > .it.on::before{ opacity:1!important; }',
      P + '.tl .hora{ color:' + ORO + '!important; font-family:"Cormorant Garamond",serif!important; }',
      P + '.tl .det{ color:' + TINTA2 + '!important; }'
    );

    /* ---- 8 · EL ADORNO DE LOS TÍTULOS ----------------------------------- */
    A.push(
      P + '.sec h2 .adorno, ' + P + '.adorno{ background-image:url("' + hojaSVG(ORO) + '")!important; background-repeat:no-repeat!important; background-position:center!important; background-size:contain!important; }'
    );

    /* ---- 9 · LA RASPADITA: SIN RECUADRO, Y LA TAPA ES LA BOLA -----------
       ⚠️ Son DOS ramas: `.rasp-3 > .r3-f` (lo que se revela) y
          `.rasp-zona > canvas` (la tapa). La variable la lee el CANVAS, así
          que se declara en TODA la rama: una variable sólo baja a los hijos.
       ⚠️ Y el motor APAGA las casillas dormidas con un filter: con una foto de
          tapa eso se lee como «tres bolas de otro color». */
    A.push(
      ':is(#dc-nada, ' + P.trim() + ' .scratch-sec, ' + P.trim() + ' .rasp-3, ' + P.trim() + ' .rasp-zona, ' + P.trim() + ' #scratchcard){ --r3-tapa:url("' + BOLA + '"); }',
      P + ':is(#scratchcard, .scratchcard){ background-color:transparent!important; background-image:none!important; border:0!important; box-shadow:none!important; }',
      P + '.rasp-zona.dormida canvas{ filter:none!important; }'
    );

    /* ---- 10 · LAS TAPAS DE VIDEO Y PLAYLIST ----------------------------
       ⚠️ `.rd-tapa` es la MISMA clase para el video y para la playlist: se
          separan por sección, nunca suponiendo que hay dos clases. */
    A.push(
      P + '#video-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(8,18,13,.42) 0, rgba(8,18,13,.18) 24%, rgba(8,18,13,0) 44%), url("' + TAPA_VIDEO + '") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(0,0,0,.40)!important; }',
      P + '#spotify-sec .rd-tapa{ background:radial-gradient(circle at 50% 50%, rgba(8,18,13,.42) 0, rgba(8,18,13,.18) 24%, rgba(8,18,13,0) 44%), url("' + TAPA_PLAY + '") center/cover no-repeat!important; border-radius:14px!important; box-shadow:0 10px 26px rgba(0,0,0,.40)!important; }',
      P + '.rd-tapa .rd-aro{ border-color:' + ORO_CL + '!important; background:rgba(8,18,13,.5)!important; box-shadow:0 0 0 1px rgba(224,197,122,.4), 0 6px 18px rgba(0,0,0,.45)!important; opacity:1!important; }',
      P + '.rd-tapa .rd-aro::after{ border-left-color:' + TINTA + '!important; }',
      P + '.rd-tapa .rd-txt{ display:block!important; color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important; text-shadow:0 1px 3px rgba(0,0,0,.85)!important; }'
    );

    /* ---- 11 · EL PASE: NUNCA BÁSICO BLANCO -----------------------------
       ⚠️ Los rótulos son `.k` y `.v`, NO `.lab`/`.val`. Un selector que no
          existe no da error: da «no pasó nada».
       ⚠️ El cuadrado del QR se deja BLANCO a propósito: el lector necesita
          ese contraste. Es la excepción de la regla del papel. */
    A.push(
      P + '.pasecard{ border-radius:14px!important; }',
      P + '.pasecard .k{ color:' + TINTA3 + '!important; letter-spacing:.14em!important; text-transform:uppercase!important; font-size:10px!important; }',
      P + '.pasecard .v{ color:' + TINTA + '!important; font-size:15px!important; }',
      P + '.pasecard .t{ font-family:"Cormorant Garamond",serif!important; font-size:19px!important; color:' + ORO_CL + '!important; }',
      P + '.pasecard .estado{ background-color:rgba(201,164,78,.18)!important; color:' + ORO_CL + '!important; border:1px solid rgba(201,164,78,.45)!important; }'
    );

    /* ---- 12 · LOS CONTROLES -------------------------------------------
       ⚠️ `#filtro-abrir` y `#gal-entrar` NO entran en el conjunto del molde
          (`:is(.btn,#btn-ingresar,.wsp,.tv-btn,.inv-prev-btn)`), así que en una
          colección oscura nacen crema con letra gris. Se pintan a mano. */
    A.push(
      P + ':is(.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn, #filtro-abrir, #gal-entrar){ background-color:' + ORO + '!important; color:' + PAPEL2 + '!important; -webkit-text-fill-color:' + PAPEL2 + '!important; border:0!important; }',
      P + ':is(.btn, #filtro-abrir, #gal-entrar):hover{ background-color:' + ORO_CL + '!important; }',
      /* el formulario nace pintado para fondo OSCURO y acá justamente lo es:
         se le sube el borde para que se vea contra el musgo */
      P + 'form.rsvpform :is(input,select,textarea){ background-color:rgba(255,255,255,.06)!important; border-color:rgba(201,164,78,.40)!important; color:' + TINTA + '!important; }',
      P + 'form.rsvpform label{ color:' + TINTA2 + '!important; }'
    );

    /* ---- 13 · LA CARTA Y EL CONTACTO ------------------------------------
       ⚠️ `.cf-letter` trae el papel clavado en el motor: en una colección
          oscura es la única cosa blanca de la invitación. */
    A.push(
      P + '.cf-letter{ background-color:' + PAPEL + '!important; background-image:none!important; color:' + TINTA2 + '!important; border:1px solid rgba(201,164,78,.22)!important; }',
      P + '.cf-letter :is(h2,h3,.t){ color:' + TINTA + '!important; }',
      P + '#contacto-sec{ background-color:' + PAPEL2 + '!important; }',
      P + '#contacto-sec :is(h2,.kick){ text-shadow:0 1px 3px rgba(0,0,0,.8)!important; }',
      P + '.footer :is(h1,h2,h3,p,span,div){ color:' + TINTA2 + '!important; text-shadow:0 1px 3px rgba(0,0,0,.8)!important; }'
    );

    return A.join('\n');
  }

  /* ---------------------------------------------------------------- fuentes */

  function fuentes() {
    /* ⚠️ Se pide SÓLO el nombre de la familia. Con una pila CSS entera
       ("'Lora',serif") Google Fonts devuelve 400 y la fuente no carga. */
    var href = 'https://fonts.googleapis.com/css2' +
      '?family=Cormorant+Garamond:wght@400;500;600' +
      '&family=Lora:ital,wght@0,400;0,500;1,400' +
      '&family=Parisienne' +
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

  /* ⚠️ `reglas-duras.js` escribe `color` INLINE y con `!important`. Contra un
     inline no hay hoja que gane: hay que BORRARLO, y volver a borrarlo en cada
     repaso. Se barre por `data-regla-orig` —la firma que deja el propio
     corrector— y no por una lista de selectores, que siempre deja uno afuera. */
  function limpiarInlines() {
    try {
      var tocados = document.querySelectorAll('.frame [data-regla-orig]');
      [].forEach.call(tocados, function (e) {
        if (e.style) {
          e.style.removeProperty('color');
          e.style.removeProperty('-webkit-text-fill-color');
        }
        e.removeAttribute('data-regla-orig');
      });
      [].forEach.call(
        document.querySelectorAll('.rd-tapa .rd-txt, .cf-letter, .cf-letter *'),
        function (e) {
          if (e.style && e.style.color) {
            e.style.removeProperty('color');
            e.style.removeProperty('-webkit-text-fill-color');
          }
        }
      );
    } catch (e) {}
  }

  function marcarPadres() {
    try {
      var p = document.querySelector('.padres');
      if (!p) return;
      var n = String(p.children.length);
      if (p.getAttribute('data-col-n') !== n) p.setAttribute('data-col-n', n);
    } catch (e) {}
  }
  function desmarcarPadres() {
    try {
      var p = document.querySelector('.padres');
      if (p) p.removeAttribute('data-col-n');
    } catch (e) {}
  }

  /* LA VÍA EMPIEZA Y TERMINA DONDE ESTÁ LA COSA.
     El motor la dibuja de borde a borde del panel, así que sobra línea arriba
     de la primera marca y abajo de la última. No se resuelve con CSS: el punto
     depende del alto de la ficha, que depende del texto que cargue Jazmín. Se
     MIDE y se pasa por variable, en cada repaso. */
  function recortarVia() {
    try {
      var tl = document.querySelector('.tl'); if (!tl) return;
      var f = tl.querySelectorAll('.it'); if (!f.length) return;
      var R = tl.getBoundingClientRect();
      var a = f[0].getBoundingClientRect();
      var b = f[f.length - 1].getBoundingClientRect();
      tl.style.setProperty('--tl-ini', Math.round(a.top + a.height / 2 - R.top) + 'px');
      tl.style.setProperty('--tl-fin', Math.round(R.bottom - (b.top + b.height / 2)) + 'px');
    } catch (e) {}
  }
  function soltarVia() {
    try {
      var tl = document.querySelector('.tl'); if (!tl) return;
      tl.style.removeProperty('--tl-ini');
      tl.style.removeProperty('--tl-fin');
    } catch (e) {}
  }

  /* 🔴 EL PASE CON EL QR VA ABAJO DE LA RASPADITA. El motor lo deja pegado a
     la portada; quien lo baja es LA COLECCIÓN. Cantera salió con el pase
     arriba por no copiar esto: fue el Fracaso J.
     ⚠️ `devolverPase()` va ADENTRO del `if` de `sacar()`: afuera corre en TODAS
        las invitaciones que no son de esta colección y les pelea el pase. */
  function moverPase() {
    try {
      var pase = document.querySelector('.pase');
      var rasp = document.querySelector('.sec.scratch-sec');
      if (!pase || !rasp) return;
      if (rasp.parentElement !== pase.parentElement) return;
      if (pase.previousElementSibling === rasp) return;
      rasp.parentNode.insertBefore(pase, rasp.nextSibling);
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
    hoja().textContent = armarCSS();
    document.documentElement.setAttribute('data-col', ID);
    document.documentElement.setAttribute('data-coleccion', ID);
    window.INVCOLPALETA = PALETA_PROPIA;
    document.documentElement.setAttribute('data-marca-propia', ID);
    marcarPadres();
    moverPase();
    recortarVia();
    limpiarInlines();
    /* ⚠️ NADA DE MutationObserver: la invitación muta en bucle y un observador
       dispararía decenas de veces por segundo. El repaso de 1,2 s alcanza. */
  }

  function sacar() {
    var s = document.getElementById(ID_CSS); if (s) s.remove();
    desmarcarPadres();
    if (document.documentElement.getAttribute('data-col') === ID) {
      devolverPase();
      soltarVia();
      document.documentElement.removeAttribute('data-col');
      document.documentElement.removeAttribute('data-coleccion');
      if (document.documentElement.getAttribute('data-marca-propia') === ID) {
        document.documentElement.removeAttribute('data-marca-propia');
      }
      if (window.INVCOLPALETA === PALETA_PROPIA) {
        try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; }
      }
    }
  }

  function sincronizar() { if (activa()) poner(); else sacar(); }

  /* ⚠️ EL REPASO DE 1,2 s ES OBLIGATORIO. `INVEV` puede llegar DESPUÉS de
     `load`: si llega tarde la colección no se prende nunca y no hay ningún
     error en consola — se ve como «quedó fea», no como «se rompió». */
  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.INVSAPO = { poner: poner, sacar: sacar, css: armarCSS, hoja: hojaSVG, paleta: PALETA_PROPIA };
})();
