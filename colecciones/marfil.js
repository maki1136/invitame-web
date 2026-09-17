/* ===== COLECCIÓN "MARFIL" =====================================================

   Copiada de la referencia que mandó Maki: BOMA · Nazar & Anita (14/9/2026).

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. NO DIBUJA UNA INVITACIÓN
      NUEVA. Todo es reversible, y NO SACA NINGUNA SECCIÓN: la raspadita, el
      pase con voz, la galería, la trivia, el filtro, el pase con QR, el
      hospedaje, la mesa de regalos y todo lo demás siguen estando. Vestir no
      es quitar. Maki, 15/9: «agregarle todo lo extra que tiene nuestra
      invitación».

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'marfil'` no hace nada.
      Para probar sin tocar la base: `?coleccion=marfil`

   ★★★★★ LA REGLA DE LAS MUESTRAS DIFERENTES — Maki, 16/9/2026 ★★★★★
      «Si estamos haciendo muestras diferentes, anotate que tenés que hacer
       cosas diferentes. Si vas a hacer lo mismo, ¿cuál es la gracia de tener
       diferentes muestras?»

      Una colección NO es sólo una tipografía distinta. Tiene que traer lo
      suyo y NO repetir nada de las otras:
          · el sobre de entrada          → `SOBRE` (abajo)
          · el fondo                     → `FONDO_PERLAS`
          · el material de los botones   → `MATERIAL`
          · la paleta                    → FASE 8.1
          · las fotos de los novios      → tienen que ser OTRA pareja
      Al 16/9 las SEIS invitaciones de la base usaban el mismo sobre
      (`maestro`) y el violeta de Perlas. Eso es lo que esta fase corrige, y
      por eso el sobre, el fondo, el material y la paleta se declaran ACÁ como
      constantes: para que la próxima colección esté obligada a elegir otras.

   ★★★ FICHA DE LECTURA DE LA REFERENCIA ★★★
      Tarjetas marfil FLOTANDO sobre un fondo oscuro y desenfocado, con perlas
      sueltas apoyadas encima y fotos con marco tipo Polaroid, apenas giradas.
      No hay color de acento en ningún lado: el único color de la pieza son
      los círculos del dress code y las fotos.

      EL IDIOMA DE ESTA REFERENCIA — y es distinto al de Perlas:
      en Perlas cada objeto SOSTENÍA un texto. Acá no hay objetos que
      sostengan: **acá manda LA TIPOGRAFÍA, y el adorno es una línea fina.**
      Lo que se repite tres veces en la referencia (`and`, `day`, `Wedding`)
      es siempre lo mismo: una palabra en cursiva entre dos filetes finos.
      Ese es EL gesto de la colección. Si algo hay que copiar bien, es ese.

   ★★★ LAS TRES VOCES ★★★  (las tres ya están declaradas: no se suma ninguna)
      1. SERIF DISPLAY — Cormorant Garamond, delgada, VERSALES muy espaciadas.
         Los nombres y los títulos de sección.
      2. CURSIVA DE ENLACE — Parisienne. SÓLO para las palabras que unen
         (`&`, «Los colores de la boda»). Nunca para un párrafo.
      3. SANS CHICA GRIS — Jost, con espaciado, en gris medio. Bajadas,
         rótulos y datos.
      ⚠️ Las 17 familias están DECLARADAS pero el navegador sólo baja la que
         se usa. Medido el 15/9: `document.fonts.check` da false para
         Parisienne hasta que una regla la pide. No está rota: es así.

   ★★★ LOS NOMBRES DE LA PORTADA ★★★
      El motor los escribe `<span>Camila</span><br><span>& Tomás</span>` y les
      mete familia, tamaño y color EN LÍNEA desde `nfont`.
      → Si Jazmín eligió fuente, SE RESPETA (no se marca `data-col-tipo`).
      → El `&` se saca del segundo nombre y pasa a ser el separador de filetes.

   ★★★ LA PORTADA VA SIN FOTO — DECIDIDO POR MAKI EL 15/9/2026 ★★★
        «La que te pasé tiene nombres solos en la portada, no tiene fotos.»
        «No todas quieren la foto de portada, quiero tener diferentes diseños
         para que la gente pueda elegir.»

      Marfil ES el diseño sin foto de tapa: los nombres solos sobre el papel,
      el enlace `and` en cursiva entre dos filetes, y la fecha debajo.
      ⚠️ La foto NO se borra del documento: se tapa. Sigue siendo contenido de
         la clienta y vuelve sola al apagar la colección o al elegir otra.

   ★★★ CÓMO GANARLE A UN MÓDULO DEL MOTOR ★★★  (heredado de Perlas)
      `!important` no alcanza: la colección se inserta ANTES que los módulos y
      con especificidad e importancia iguales desempata el ORDEN.
      → Acá `h[c]` ya sale con el atributo REPETIDO. No hace falta acordarse.

   ★ FASE 1: el esqueleto reversible, las tres voces, el separador de filetes,
     la cuenta regresiva y los círculos del dress code en UNA fila.
   ★ FASE 2: `colecciones/marfil-texturas.js` (papel, perlas, fondo oscuro).
   ★ FASE 3: la tarjeta flotando sobre el fondo, las Polaroid y la muestra.
   ★ FASE 4 (15/9): EL FONDO PASA A SER UNA FOTO. Seis correcciones de Maki:
        4.1 fuera las perlas de CSS — vienen dentro de la foto de fondo
        4.2 la portada, sólo tipográfica (sin foto de tapa, con «and»)
        4.3 Personas: las tres en una fila
        4.4 hashtag y trivia: la tinta que quedó huérfana al apagar la banda
        4.5 el resto de los botones, que en la fase 3 quedaron sin vestir
        4.6 la frase se muda adentro del sobre de la carta
   ★ FASE 5 (16/9): el fondo de perlas VIENE CON LA COLECCIÓN, y las perlas
     no tocan el texto — el bloque de la portada se achica a la franja limpia.
   ★ FASE 6 (16/9): el barrido de contraste medido de verdad (tarea #202).
     Dieciséis bloques en rojo, todos arreglados. Cero en rojo sobre 149 hojas.
   ★ FASE 7 (16/9): la portada centrada, los nombres y el «and» más chicos,
     el velo de papel detrás del texto, y los botones en NÁCAR — con relieve
     de verdad, no la píldora dibujada.
   ★ FASE 8 (16/9): fuera el violeta de Perlas — se redefine la paleta entera
     del motor, no se persiguen clases —, el velo pasa a TODAS las secciones
     y el sobre viene con la colección.

   ⚠️⚠️ EL FONDO, EL BOTÓN Y EL SOBRE NO SE DIBUJAN ACÁ: SON DATOS ⚠️⚠️
      Los pintan los módulos que la plataforma YA tenía y que Jazmín maneja
      desde el panel — `fondo-invitacion.js`, `botones.js`, `sobre-catalogo.js`.
      La colección sólo los COMPLETA en memoria cuando la invitación no trae
      los suyos. Si la clienta eligió, la clienta gana.
   ============================================================================ */
(function () {
  'use strict';

  var NOMBRE  = 'marfil';
  var MARCA   = 'data-coleccion';
  var MARCA_T = 'data-col-tipo';        /* sólo si Jazmín NO eligió tipografía */
  var ID_CSS  = 'inv-coleccion-marfil';
  var CL_Y    = 'col-mf-y';             /* el separador de filetes */

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === NOMBRE;
    } catch (e) {}
    try { return (((window.INVEV || {}).fx) || {}).coleccion === NOMBRE; }
    catch (e) { return false; }
  }

  function tieneFuentePropia() {
    try {
      var f = (window.INVEV || {}).nfont;
      return !!(f && String(f).trim());
    } catch (e) { return false; }
  }

  /* ---------------------------------------------------------------- la hoja */

  var SERIF   = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
  var CURSIVA = '"Parisienne", "Great Vibes", cursive';
  var SANS    = '"Jost", "Montserrat", system-ui, sans-serif';

  var TINTA   = '#4a4642';   /* la principal: gris pardo, no negro */
  var TINTA2  = '#55514b';   /* bajadas y datos */
  var TINTA3  = '#b6b0a8';   /* SOLO filetes, bordes y separadores: nunca texto */

  /* el marfil canónico, el mismo que declara marfil-texturas.js. Va también
     como color plano abajo del papel: si la textura tardara, no se ve un
     salto de blanco a marfil. */
  var PAPEL_HEX = '#e5e0d5';

  /* ⚠️⚠️ LAS VARIABLES QUE MARFIL RECLAMA COMO PROPIAS.  (17/9/2026)
     El violeta de la invitación no salía de Perlas: salía de la PALETA elegida
     («lavanda perla»), que `efectos/paleta.js` reescribe cada 1,5 s en el
     `<html>` con `!important`. Contra eso no gana ninguna hoja de estilo, así
     que Marfil no podía tener su papel y su tinta.
     → Se publica esta tabla en `window.INVCOLPALETA` y la paleta pinta ESTOS
       valores en lugar de los suyos. Son el PAPEL y la TINTA: lo que hace que
       Marfil sea Marfil.
     ⚠️ A propósito NO se reclaman `--sage`, `--sage-cl` ni `--oro`: ésos son
        los acentos, y ahí sí manda el color que eligió la pareja. */
  var PALETA_PROPIA = {
    '--verde':     TINTA,        /* el color principal: títulos, botones, bocina */
    '--verde2':    '#3a3733',    /* su versión más oscura, para los degradés */
    '--muted':     TINTA2,       /* bajadas y datos */
    '--cream':     '#f5f1e9',    /* el texto que va ARRIBA del color principal */
    '--lino':      PAPEL_HEX,    /* el papel */
    '--lino2':     '#f1ede4',    /* el papel, un tono más claro */
    '--sec-col-v': TINTA         /* el color de sector, que el motor ata a --verde */
  };

  function laPieza(k) {
    try { return (window.INVPIEZAS || {})[k] || ''; } catch (e) { return ''; }
  }

  /* ---------------------------------------------------------------- el fondo
     ★★★ EL FONDO VIENE CON LA COLECCIÓN ★★★
     Maki, 16/9: «quiero que se pueda copiar la invi cuando la elija la gente».
     O sea: la clienta elige Marfil y le sale ASÍ, sin que nadie cargue nada.

     Es una foto del papel blanco con las perlas apoyadas, con las perlas SÓLO
     en el quinto exterior de cada lado. El centro va limpio porque ahí cae el
     texto (ver FASE 5).

     ⚠️ ESTO NO ESCRIBE EN LA BASE. Sólo completa `INVEV.fx.fondo` EN MEMORIA.
     ⚠️ `donde:'marco'` y no `'pantalla'`: la foto es el PAPEL de la tarjeta, y
        los costados quedan oscuros — así la tarjeta flota, como en BOMA.
     ⚠️ `paso` lo recorta el propio módulo a 0,85 aunque se le pase más.

     ★ ESTE FONDO LO APROBÓ MAKI EL 16/9/2026, y pasó el chequeo ANTES de
       mostrárselo: sobre la imagen de 670×1200 se contaron las perlas por
       tercios y dio 34 a la izquierda (x<20%), 38 a la derecha (x>80%) y
       CERO en el centro estricto (27-73%), que es donde cae el texto.
     ⚠️ SI SE CAMBIA ESTA FOTO: volver a correr esa cuenta antes de ponerla.
        La herramienta que las genera NO garantiza la composición — la
        medición sí la verifica. */

  var FONDO_PERLAS =
    'https://res.cloudinary.com/oc8cgqt4/image/upload/v1789572034/invitame/evdefxkuiqajaskqo2kf.jpg';

  function fondoPropio() {
    try {
      var f = ((window.INVEV || {}).fx || {}).fondo || {};
      return !!(f.tipo && (f.url || f.poster));
    } catch (e) { return false; }
  }

  function ponerFondoDeLaColeccion() {
    try {
      if (fondoPropio()) return;              /* la clienta eligió el suyo */
      var E = window.INVEV; if (!E) return;
      E.fx = E.fx || {};
      E.fx.fondo = { tipo: 'imagen', url: FONDO_PERLAS, fuerza: 1.0,
                     velo: 0, paso: 0.95, oscuras: 0, donde: 'marco' };
      E.fx.__mfFondo = true;                  /* marca: lo puso la colección */
    } catch (e) {}
  }

  function sacarFondoDeLaColeccion() {
    try {
      var E = window.INVEV;
      if (E && E.fx && E.fx.__mfFondo) { delete E.fx.fondo; delete E.fx.__mfFondo; }
    } catch (e) {}
  }

  /* ------------------------------------------------- el material del botón
     Mismo trato que el fondo: es un DATO, no CSS. Marfil pide NÁCAR y
     `efectos/botones.js` lo pinta. Perlas usa LACRE — ver la regla de las
     muestras diferentes arriba.
     ⚠️ TAMPOCO ESCRIBE EN LA BASE: sólo completa `INVEV.fx.boton` en memoria.
     -------------------------------------------------------------------- */

  var MATERIAL = 'nacar';

  function botonPropio() {
    try {
      var b = ((window.INVEV || {}).fx || {}).boton || {};
      return !!(b.estilo && String(b.estilo).trim());
    } catch (e) { return false; }
  }

  function ponerBotonDeLaColeccion() {
    try {
      if (botonPropio()) return;              /* la clienta eligió el suyo */
      var E = window.INVEV; if (!E) return;
      E.fx = E.fx || {};
      E.fx.boton = { estilo: MATERIAL };
      E.fx.__mfBoton = true;                  /* marca: lo puso la colección */
    } catch (e) {}
  }

  function sacarBotonDeLaColeccion() {
    try {
      var E = window.INVEV;
      if (E && E.fx && E.fx.__mfBoton) { delete E.fx.boton; delete E.fx.__mfBoton; }
    } catch (e) {}
  }

  /* ------------------------------------------------------------- el sobre
     ★★★ CADA COLECCIÓN TRAE EL SUYO ★★★
     Al 16/9 las SEIS invitaciones de la base usaban el mismo sobre
     (`maestro`) — Perlas y Marfil incluidas. Por eso el sobre pasa a ser un
     dato de la colección, igual que el fondo y el material: así no hay forma
     de que dos colecciones terminen con el mismo.

     Marfil lleva `perlas`: marfil de borde deckled que se abre al medio,
     atado con una hilera de perlas de agua dulce. Es el hermano del fondo.
     ⚠️ SE LLAMA `perlas` PERO NO ES EL DE LA COLECCIÓN PERLAS. Estaba libre.
     ⚠️ Y trae de regalo el arreglo de «al abrir se ve una foto de personas»:
        `maestro` tiene `empalme:'foto'`, o sea que se desvanece encima de la
        portada real y deja ver la foto un instante. `perlas` cierra en blanco.
     -------------------------------------------------------------------- */

  var SOBRE = 'perlas';

  function sobrePropio() {
    try {
      var v = ((window.INVEV || {}).fx || {}).sobre || {};
      return !!(v.modelo && String(v.modelo).trim());
    } catch (e) { return false; }
  }

  function ponerSobreDeLaColeccion() {
    try {
      if (sobrePropio()) return;              /* la clienta eligió el suyo */
      var E = window.INVEV; if (!E) return;
      E.fx = E.fx || {};
      E.fx.sobre = { modelo: SOBRE, tipo: 'carta', sello: true };
      E.fx.__mfSobre = true;
    } catch (e) {}
  }

  function sacarSobreDeLaColeccion() {
    try {
      var E = window.INVEV;
      if (E && E.fx && E.fx.__mfSobre) { delete E.fx.sobre; delete E.fx.__mfSobre; }
    } catch (e) {}
  }

  /* --------------------------------------------- la clase prestada del botón
     `botones.js` pinta sólo `.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn`.
     El «Ver más» del hospedaje (`.iv-plie-btn`) y el WhatsApp del pie
     (`.col-mvta-b`) NO están en esa lista: con el material puesto quedaban
     como texto pelado, sin forma.

     ⚠️ NO SE TOCA LA LISTA DEL MOTOR. Agregarlos allá le cambiaría el aspecto
        a las invitaciones YA ENTREGADAS que tengan un material elegido, y ese
        módulo promete justamente lo contrario. Acá se les presta la clase, y
        se la devuelve al apagar la colección.
     ⚠️ La marca `data-mf-btn` es la que permite devolverla sin llevarse por
        delante un `.btn` que el elemento ya tuviera de antes.

     ⚠️⚠️ EL SÍ / NO PODRÉ NO VA ACÁ. Se lo presté en la fase 7 y Maki lo marcó
        enseguida: «en el "no podré" o "sí asistiré" te quedó mal eso, dejá la
        pastilla como estaba, te quedó muy mal, definitivamente».
        El interruptor ya tiene su propia forma y el material se la arruina.
     -------------------------------------------------------------------- */

  var PRESTAR = '.frame .iv-plie-btn, .frame .col-mvta-b';

  function prestarClaseBtn() {
    try {
      var v = document.querySelectorAll(PRESTAR);
      for (var i = 0; i < v.length; i++) {
        if (!v[i].classList.contains('btn')) {
          v[i].classList.add('btn');
          v[i].setAttribute('data-mf-btn', '1');
        }
      }
    } catch (e) {}
  }

  function devolverClaseBtn() {
    try {
      var v = document.querySelectorAll('[data-mf-btn]');
      for (var i = 0; i < v.length; i++) {
        v[i].classList.remove('btn');
        v[i].removeAttribute('data-mf-btn');
      }
    } catch (e) {}
  }

  var CSS = [
    /* ---- LA ESCALA: se setean LAS VARIABLES DEL MOTOR -------------------
       El motor tiene exactamente tres roles y cada uno lee su variable con
       `!important`:
           .sec h2          { font-size: var(--fs-titulo, 30px) !important }
           .kick            { font-size: var(--fs-cursiva, 34px) !important }
           .sec p:not(.frase){ font-size: var(--fs-texto, 16px) !important }
       ⚠️ Escribir `font-size` acá NO SIRVE: el `!important` del motor gana
          aunque la colección tenga más especificidad.
       ⚠️ `--fs-texto` NO SE TOCA. Jazmín pidió agrandar el cuerpo y
          `perlas-ajustes.js` ya lo dejó donde ella lo quería.
    */
    'h[c] {',
    '  --fs-cursiva:21px;',
    '}',

    /* ---- 1. LA VOZ SERIF: títulos de sección ---------------------------- */
    'h[c] .sec h2, h[c] .sec h2.reveal {',
    '  font-family:' + SERIF + ';',
    '  font-weight:300; letter-spacing:.055em;',
    '  color:' + TINTA + ';',
    '}',

    /* ---- 2. LA VOZ SANS: los párrafos ----------------------------------
       ⚠️ `.kick` NO VA ACÁ, y es el error que ya se cometió una vez: por el
          nombre parece una bajada, pero el motor la llama CURSIVA y dice
          «La fecha», «Con mucha alegría», «El gran día». Es la línea a mano
          arriba del título — el mismo papel que `and` / `day` / `Wedding` en
          la referencia. Ponerle una sans la aplanaba.
          → Antes de asignarle una voz a una clase, LEER QUÉ DICE adentro.
    */
    'h[c] .sec p, h[c] .sec .sm {',
    '  font-family:' + SANS + ';',
    '  letter-spacing:.02em; line-height:1.78;',
    '  color:' + TINTA2 + ';',
    '}',

    /* ---- 3. LA VOZ CURSIVA: la línea a mano y las palabras que unen ----- */
    'h[c] .sec .kick {',
    '  font-family:' + CURSIVA + ';',
    '  font-weight:400; letter-spacing:0;',
    '  color:' + TINTA2 + ';',
    '}',
    /* ⚠️ `text-transform:none` y `letter-spacing:0` NO SON ADORNO: el motor
          trata este rótulo como versalitas chiquitas. Si se le pone la
          cursiva SIN sacarle eso, queda «LOS COLORES DE LA BODA» en script y
          mayúsculas, partido en dos renglones — y los dos filetes se achican
          hasta desaparecer. Visto y corregido el 15/9.
       ⚠️ `white-space:nowrap` es lo que garantiza UNA línea, que es lo que
          hace que los filetes queden a los costados y no arriba y abajo. */
    'h[c] .col-dc .col-dc-tit {',
    '  font-family:' + CURSIVA + ';',
    '  font-size:19px; font-weight:400; letter-spacing:0;',
    '  text-transform:none; white-space:nowrap;',
    '  color:' + TINTA + ';',
    '  display:flex; align-items:center; gap:14px;',
    '  max-width:340px; margin-left:auto; margin-right:auto;',
    '}',
    /* los dos filetes, que es EL gesto de la referencia */
    'h[c] .col-dc .col-dc-tit::before, h[c] .col-dc .col-dc-tit::after {',
    '  content:""; flex:1 1 auto; height:1px; background:' + TINTA3 + ';',
    '  opacity:.72;',
    '}',

    /* ---- EL SEPARADOR DE LOS NOMBRES ------------------------------------ */
    /* Va como nodo porque el CSS no sabe meterse ENTRE dos hermanos.
       ⚠️ Los márgenes van casi en cero: el separador ya es de línea completa
          (es `display:flex`), así que NO necesita un <br>. Cuando le puse uno,
          el bloque pasó de 150 a 211 px y quedó un hueco enorme. */
    'h[c] .' + CL_Y + ' {',
    '  display:flex; align-items:center; justify-content:center; gap:14px;',
    '  width:min(64%,260px); margin:.02em auto;',
    '}',
    'h[c] .' + CL_Y + ' i {',
    '  flex:1 1 auto; height:1px; background:currentColor;',
    '  opacity:.42; display:block;',
    '}',
    'h[c] .' + CL_Y + ' b {',
    '  font-family:' + CURSIVA + ';',
    '  font-weight:400; font-style:normal;',
    '  font-size:.46em; line-height:1; flex:0 0 auto;',
    '}',

    /* ---- LOS NOMBRES, sólo si Jazmín no eligió tipografía ---------------
       ⚠️ `:not(.col-mf-y)` NO ES ADORNO. El separador es hijo de #pv-names,
          así que sin eso esta regla —que lleva un ID y por lo tanto le gana a
          la de la clase— le pisaba el `display:flex` con `inline-block` y los
          dos filetes se apilaban contra la palabra. */
    'h[t] #pv-names, h[t] #pv-names > span:not(.' + CL_Y + ') {',
    '  font-family:' + SERIF + ' !important;',
    '  font-weight:300 !important; letter-spacing:.17em;',
    '  text-transform:uppercase;',
    '}',
    /* el espaciado empuja la palabra a la izquierda: se compensa */
    'h[t] #pv-names > span:not(.' + CL_Y + ') {',
    '  padding-left:.17em; display:inline-block;',
    '}',

    /* ⚠️⚠️ EL HALO DE LA PORTADA — SÓLO SIRVE CUANDO HAY FOTO ⚠️⚠️
       Existe para que los nombres se lean SOBRE LA FOTO de tapa. Con la
       cursiva gruesa del motor alcanzaba la sombra propia; con esta serif fina
       y muy espaciada, no.
       ⚠️ EN LA FASE 4 ESTE HALO SE APAGA: ya no hay foto abajo. Ver 4.2. */
    'h[t] #pv-names, h[t] #pv-names > span {',
    '  font-weight:400 !important;',
    '  text-shadow:0 0 9px rgba(26,18,13,.68), 0 1px 3px rgba(26,18,13,.5),',
    '              0 0 26px rgba(26,18,13,.35) !important;',
    '}',
    'h[t] .' + CL_Y + ' b {',
    '  text-shadow:0 0 9px rgba(26,18,13,.68), 0 1px 3px rgba(26,18,13,.5) !important;',
    '}',
    'h[t] .' + CL_Y + ' i { opacity:.66; box-shadow:0 0 6px rgba(26,18,13,.45) }',

    /* ---- LA CUENTA REGRESIVA -------------------------------------------
       ⚠️ LAS CIFRAS DE CORMORANT SON DE ESTILO ANTIGUO. Sin pedirle las de
          caja alta, «172» se dibuja con el 1 a la altura de una minúscula y
          se lee «I72»; «14» se lee «I4». En la referencia las cuatro cifras
          son parejas (166:08:00:52). Es un detalle chico que canta mucho. */
    'h[c] .count .num {',
    '  font-family:' + SERIF + '; font-weight:300; letter-spacing:.01em;',
    '  font-variant-numeric:lining-nums;',
    '  font-feature-settings:"lnum" 1,"onum" 0;',
    '}',
    'h[c] .count .sep { opacity:.5; font-weight:300 }',
    /* los rótulos: versalitas muy chicas y muy espaciadas */
    'h[c] .count .lab {',
    '  font-family:' + SANS + ';',
    '  font-size:8px; letter-spacing:.2em; text-transform:uppercase;',
    '  opacity:.72;',
    '}',
    /* los segundos, un tono más claro — está así en la referencia */
    'h[c] .count #s.num { opacity:.55 }',

    /* ---- EL DRESS CODE: LOS CÍRCULOS VAN EN UNA SOLA FILA --------------- */
    'h[c] .col-dc .col-dc-fila {',
    '  flex-wrap:nowrap; justify-content:center; gap:10px;',
    '}',
    'h[c] .col-dc .col-dc-fila > * { flex:0 1 auto; min-width:0 }',

    /* ---- LA FECHA DE LA PORTADA ---------------------------------------- */
    'h[c] #pv-fecha {',
    '  font-family:' + SANS + ';',
    '  letter-spacing:.22em; text-transform:uppercase; font-size:11px;',
    '}',
    'h[c] #pv-kick {',
    '  font-family:' + SANS + ';',
    '  letter-spacing:.14em; text-transform:uppercase; font-size:10.5px;',
    '}',

    /* =====================================================================
       FASE 3 — LA ESCENA: una tarjeta marfil FLOTANDO sobre el fondo oscuro
       =====================================================================
       El motor alterna secciones claras con BANDAS OSCURAS (`.sec.verde`).
       La referencia no tiene ninguna banda: es UNA tarjeta marfil continua,
       y lo oscuro está AFUERA, atrás.

       ⚠️ Y NO ES SÓLO ESTÉTICA: en la fase 1 les puse la tinta gris oscura a
          TODAS las secciones, incluidas las 6 bandas. Medido el 15/9:
          «Dónde y cuándo» quedaba rgb(74,70,66) sobre rgb(70,59,82) —
          contraste 1,03, o sea invisible.

       ⚠️ SE ESCRIBE `background-color`, NUNCA `background`. El atajo pone
          `background-image:none` y borra la textura. Ya pasó en Perlas y
          Jazmín lo marcó con un círculo verde en el WhatsApp.
    */
    'h[c] body {',
    '  background-color:#2a231e;',
    '  background-image:var(--mf-fondo,none);',
    /* ⚠️ NADA DE `background-attachment:fixed`: en iPad una capa fija a
          pantalla completa fue exactamente lo que trabó la invitación
          (tarea #100). */
    '  background-size:760px auto; background-repeat:repeat;',
    '}',

    /* la tarjeta
       ⚠️ NI UNA PALABRA SOBRE EL ANCHO NI LOS MÁRGENES. El motor ya le puso
          `max-width:474px; margin:auto`. Le escribí `margin-left:10px` y la
          DESCENTRÉ; después `max-width:calc(100vw - 20px)` y quedó de 1420 px.
          Las dos veces, por tocar algo que ya estaba resuelto.
       ⚠️ FASE 4: cuando `fx.fondo` está puesto con `donde:'marco'`, el módulo
          `fondo-invitacion.js` escribe `.frame{background:transparent}` y la
          FOTO pasa a ser el papel. Este color queda como red. */
    'h[c] .frame {',
    '  background-color:' + PAPEL_HEX + ';',
    '  background-image:var(--mf-papel,none);',
    '  background-size:512px 512px; background-repeat:repeat;',
    '  border-radius:18px; overflow:hidden;',
    '  box-shadow:0 26px 60px rgba(0,0,0,.42), 0 2px 10px rgba(0,0,0,.18);',
    '}',
    /* la capa de la foto de fondo es `position:fixed` y NO es hija del marco,
       así que el `overflow:hidden` de arriba no la recorta: sin esto, en el
       borde de arriba de la tarjeta asoma la esquina cuadrada de la foto. */
    'h[c][data-fondo] #inv-fondo { border-radius:18px }',

    /* Las secciones se apagan para que la tarjeta se lea como UNA pieza.
       ⚠️ VAN CON `!important` porque `fondo-invitacion.js` escribe
          `html[data-fondo] .sec.verde { background-color: color-mix(...)
          !important }`. */
    'h[c] .frame .sec, h[c] .frame .sec.verde, h[c] .frame .pase {',
    '  background-color:transparent !important;',
    '}',
    /* la banda de la frase traía su propia imagen de papel: sobra */
    'h[c] .frame .sec.band { background-image:none !important }',

    /* la tinta de las que ERAN bandas oscuras */
    'h[c] .frame .sec.verde h2, h[c] .frame .pase h2 { color:' + TINTA + ' }',
    'h[c] .frame .sec.verde .kick, h[c] .frame .sec.verde p,',
    'h[c] .frame .sec.verde .sm, h[c] .frame .pase p { color:' + TINTA2 + ' }',

    /* ---- EL BOTÓN PÍLDORA FANTASMA ------------------------------------
       ⚠️⚠️ ESTA REGLA YA NO EXISTE — LA BORRÓ LA FASE 7 ⚠️⚠️
       Pintaba una píldora de filete fino y fondo transparente. Maki, 16/9:
       «los botones quiero que le des como en Perlas pero claritos, NO
       dibujados». Ahora el fondo, el borde, la sombra y el color los pone el
       material NÁCAR de `efectos/botones.js`. Ver 7.4.

       ★★★ SE CONSERVA LA EXPLICACIÓN DEL `#mf-nada`, QUE SIGUE VALIENDO ★★★
       `botones.js` pinta con
           [data-boton="lacre"] :is(.btn, #btn-ingresar, .wsp, …) { … !important }
       y `:is()` toma la especificidad de su argumento MÁS FUERTE: ese
       `#btn-ingresar` de adentro le da peso de ID a toda la regla.
       Contra un ID no gana NINGUNA cantidad de clases ni de atributos — la
       especificidad se compara por tramos, y (0,99,99) pierde contra (1,0,0).
       → Si alguna vez hay que pisarle algo a un botón, hay que meter un ID
         propio: `#mf-nada` no existe en ningún lado, así que no cambia a qué
         elementos agarra la regla — está sólo para subirle el peso. */

    /* ---- LAS FOTOS, TIPO POLAROID -------------------------------------
       ⚠️ Sólo a la imagen que es HIJA DIRECTA de una sección. Si esto
          agarrara cualquier <img> le pondría marco a los iconos. */
    'h[c] .frame .sec > img {',
    '  background:#fdfcfa; padding:11px 11px 32px;',
    '  border-radius:2px;',
    '  box-shadow:0 10px 24px rgba(42,35,30,.20), 0 1px 3px rgba(42,35,30,.14);',
    '  transform:rotate(-1.4deg);',
    '}',
    'h[c] .frame .sec:nth-of-type(even) > img { transform:rotate(1.6deg) }',

    /* ---- LA FRASE: NI BANDA NEGRA NI GLOBITOS -------------------------
       Maki, 15/9: «donde están los globitos rojos esos que está la frase. Es
       una frase gigante con un fondo negro horrible atrás».
       ⚠️ Transparentar la `.sec` NO alcanza: la banda, el velo y el bokeh
          viven DENTRO, en tres nodos propios — `.bg`, `.capa` y `.frasefx`.
       → La regla general: antes de dar una sección por vestida, mirar sus
         HIJOS. Una sección transparente puede tener tres capas adentro.
       ⚠️ FASE 4: esto ya no alcanzaba y la frase se MUDA adentro del sobre de
          la carta. Ver 4.6. Estas reglas quedan para el rato en que todavía
          no se mudó y para cuando la colección se apaga. */
    'h[c] .fraseSec .bg {',
    '  background-image:none !important; background-color:transparent !important;',
    '}',
    'h[c] .fraseSec .capa {',
    '  background-color:transparent !important; backdrop-filter:none !important;',
    '}',
    'h[c] .fraseSec .frasefx { display:none !important }',
    'h[c] .fraseSec .frase, h[c] .fraseSec p {',
    '  color:' + TINTA + ' !important;',
    '  font-family:' + SERIF + ' !important; font-weight:300 !important;',
    '  font-size:20px !important; line-height:1.62 !important;',
    '  letter-spacing:.005em !important; text-shadow:none !important;',
    '}',

    /* ---- CONFIRMAR ASISTENCIA ------------------------------------------
       ⚠️ ESTA SECCIÓN ESTABA ENTERA DISEÑADA PARA BANDA OSCURA y al
          transparentarla quedó ILEGIBLE DE PUNTA A PUNTA. Medido el 15/9:
          `.kick` blanco, `p` crema, `label` lavanda pálido, `input` con texto
          blanco sobre relleno al 8%.
       → La lección: cuando se apaga un fondo oscuro hay que revisar TODA la
         tinta que ese fondo justificaba, no sólo el h2 y el párrafo. */
    'h[c] [data-sec="confirmacion"] .kick,',
    'h[c] [data-sec="confirmacion"] p,',
    'h[c] [data-sec="confirmacion"] small {',
    '  color:' + TINTA2 + ' !important;',
    '}',
    'h[c] [data-sec="confirmacion"] label {',
    '  color:' + TINTA2 + ' !important;',
    '  font-family:' + SANS + ' !important; font-size:10.5px !important;',
    '  letter-spacing:.16em !important; text-transform:uppercase !important;',
    '}',
    'h[c] [data-sec="confirmacion"] input,',
    'h[c] [data-sec="confirmacion"] select,',
    'h[c] [data-sec="confirmacion"] textarea {',
    '  color:' + TINTA + ' !important;',
    '  background-color:rgba(255,255,255,.42) !important;',
    '  border:1px solid ' + TINTA3 + ' !important; border-radius:2px !important;',
    '  font-family:' + SANS + ' !important;',
    '}',
    'h[c] [data-sec="confirmacion"] input::placeholder,',
    'h[c] [data-sec="confirmacion"] textarea::placeholder {',
    '  color:' + TINTA2 + ' !important;',
    '}',
    /* el interruptor del sí / no podré
       ⚠️ SÓLO LA TINTA. La forma de la pastilla NO se toca: ver la nota de
          `PRESTAR` arriba — Maki lo marcó el 16/9. */
    'h[c] .et, h[c] .et.s, h[c] .et.n { color:' + TINTA2 + ' !important }',
    'h[c] .et.on, h[c] .et.sel, h[c] .et[aria-checked="true"] {',
    '  color:' + TINTA + ' !important;',
    '}',

    /* ---- LA PLAYLIST: el reproductor no manda ---------------------------
       Maki: «en la playlist no la podés ocultar». El acordeón nace ABIERTO y
       el widget de Spotify —que es un iframe ajeno— se comía media sección.
       → Marfil lo deja PLEGADO. Se pliega UNA sola vez (ver `plegarMusica`). */
    'h[c] [data-sec="spotify"] .acc-panel.open .acc-inner {',
    '  border:1px solid ' + TINTA3 + '; border-radius:3px; padding:10px;',
    '  background:rgba(255,255,255,.35);',
    '}',

    /* ---- NUESTRAS PERSONAS ----------------------------------------------
       Los nombres venían en BLANCO puro y el parentesco en lavanda pálido.
       ⚠️ Mi barrido de contraste NO los encontró porque son `div` y yo
          consultaba una lista fija de etiquetas (h1,h2,p,span,a,li…).
          → El barrido tiene que recorrer TODOS los nodos hoja con texto. */
    'h[c] [data-sec="padres"] .nm { color:' + TINTA + ' !important }',
    'h[c] [data-sec="padres"] .rl { color:' + TINTA2 + ' !important }',

    /* ---- NUESTRA CARTA --------------------------------------------------
       El título salía blanco. Lo pinta una regla con ID (`#carta-sec`), así
       que `h[c] .sec h2` —que es todo clases— perdía. Hay que nombrar el id. */
    'h[c] #carta-sec h2, h[c] #carta-sec .cartatit {',
    '  color:' + TINTA + ' !important;',
    '}',

    /* ---- LA RASPADITA: NO SE TAPA UN PAPEL CON OTRO PAPEL ---------------
       `#scratchcard` trae su propia tarjeta blanca apoyada sobre el papel de
       la sección. Dos claros distintos, uno encima del otro, y el borde entre
       los dos canta: se lee como un parche, no como papel. */
    'h[c] #scratchcard {',
    '  background-color:transparent !important; box-shadow:none !important;',
    '  border-radius:0 !important;',
    '}',

    /* ---- EL PASE CON EL QR ----------------------------------------------
       Otro bloque diseñado para banda oscura.
       ⚠️ El cuadrado BLANCO del QR se deja como está: si se le baja el
          contraste, deja de escanear. */
    'h[c] .pase .t { color:' + TINTA2 + ' !important }',
    'h[c] .pase .pasecard {',
    '  background-color:rgba(255,255,255,.38) !important;',
    '  border:1px solid ' + TINTA3 + ' !important; border-radius:3px !important;',
    '  color:' + TINTA + ' !important;',
    '}',
    'h[c] .pase .pasecard * { color:' + TINTA + ' !important }',
    'h[c] .pase .pasecard .k, h[c] .pase .pasecard small, h[c] .pase .pasecard .lb {',
    '  color:' + TINTA2 + ' !important;',
    '  font-family:' + SANS + ' !important; font-size:9.5px !important;',
    '  letter-spacing:.16em !important; text-transform:uppercase !important;',
    '}',
    /* la etiqueta «Sin usar» venía como pastilla verde */
    'h[c] .pase .estado {',
    '  background:none !important; background-color:transparent !important;',
    '  border:1px solid ' + TINTA3 + ' !important; border-radius:999px !important;',
    '  color:' + TINTA2 + ' !important;',
    '  font-family:' + SANS + ' !important; font-size:9px !important;',
    '  letter-spacing:.16em !important; text-transform:uppercase !important;',
    '  padding:4px 12px !important; box-shadow:none !important; text-shadow:none !important;',
    '}',

    /* =====================================================================
       FASE 4 — LO QUE MARCÓ MAKI EL 15/9 MIRANDO LA MUESTRA ARMADA
       ===================================================================== */

    /* ---- 4.1 · LAS PERLAS DE CSS SE VAN --------------------------------
       > «El fondo lo dejás con colores base y no usás los fondos en foto con
       >  esas perlas, y las recortás para ponerlas arriba de tu fondo liso, y
       >  eso te caga el diseño.»
       Las perlas ahora están DENTRO de la foto de fondo, con su propia luz y
       su sombra de contacto.
       ⚠️ NO SE VUELVEN A PONER. Si aparece una perla flotando, el error está
          en el fondo (`paso` bajo o `fx.fondo` sin cargar), no acá. */
    'h[c] .mf-perla { display:none !important }',

    /* ---- 4.2 · LA PORTADA, SÓLO TIPOGRÁFICA ----------------------------
       ⚠️ La foto de portada NO se borra del documento — se tapa nada más.
          Sigue siendo contenido de la clienta y vuelve sola al apagar.
       ⚠️ Y al sacar la foto, TODA la tinta clara que esa foto justificaba
          queda huérfana: los nombres, la fecha, el rótulo y la cuenta
          regresiva pasan a tinta oscura EN EL MISMO BLOQUE. */
    'h[c] .portada #pbg, h[c] .portada .pveil, h[c] .portada #coverv,',
    'h[c] .portada > img, h[c] .portada > video {',
    '  display:none !important;',
    '}',
    'h[c] .portada { background-color:transparent !important }',
    /* la tinta de la portada, ahora sobre papel */
    'h[c] .portada .c, h[c] .portada .c * {',
    '  color:' + TINTA + ' !important; text-shadow:none !important;',
    '}',
    'h[c] #pv-fecha, h[c] #pv-kick, h[c] .portada .count .lab {',
    '  color:' + TINTA2 + ' !important;',
    '}',
    'h[c] .portada .count #s.num { color:' + TINTA2 + ' !important }',
    'h[c] .portada .scrollcue { color:' + TINTA2 + ' !important; opacity:.9 }',

    /* ⚠️⚠️ EL HALO SE APAGA — Y ESTA REGLA TIENE QUE LLEVAR EL ID ⚠️⚠️
       ⚠️ No alcanza con el `text-shadow:none` de la regla de `.portada .c *`:
          aquélla no tiene ningún id y el halo sí (`#pv-names`), así que el
          halo ganaba. La especificidad de un id no la alcanza ningún
          encadenado de clases. */
    'h[c] #pv-names, h[c] #pv-names > span, h[c] #pv-names > span > span {',
    '  color:' + TINTA + ' !important;',
    '  font-weight:300 !important;',
    '  text-shadow:none !important;',
    '}',
    'h[c] #pv-names .' + CL_Y + ' b {',
    '  color:' + TINTA2 + ' !important; text-shadow:none !important;',
    '}',
    'h[c] #pv-names .' + CL_Y + ' i {',
    '  opacity:1 !important; box-shadow:none !important;',
    '  background:' + TINTA3 + ' !important;',
    '}',

    /* ---- 4.3 · PERSONAS: LAS TRES EN UNA FILA ---------------------------
       ⚠️ El motor las deja en `wrap` y la tercera baja sola: escalera, no
          fila. Se fuerzan tres columnas iguales y el avatar se achica para
          que entren a 375 px (3 × 110 px de caja, avatar de 76). */
    'h[c] [data-sec="padres"] .padres {',
    '  display:grid !important; grid-template-columns:repeat(3,1fr) !important;',
    '  gap:14px !important; align-items:start !important; justify-items:center;',
    '}',
    'h[c] [data-sec="padres"] .padres > * { width:100% !important; margin:0 !important }',
    'h[c] [data-sec="padres"] .av {',
    '  width:76px !important; height:76px !important; margin:0 auto 8px !important;',
    '}',
    'h[c] [data-sec="padres"] .nm { font-size:13px !important; line-height:1.3 !important }',
    'h[c] [data-sec="padres"] .rl { font-size:10px !important; letter-spacing:.14em !important }',

    /* ---- 4.4 · HASHTAG Y TRIVIA: LA TINTA HUÉRFANA ----------------------
       Las dos secciones estaban pensadas para banda oscura. Al apagar la
       banda quedaron en crema sobre marfil: contraste 1,05.
       ⚠️ Se pintan TODAS las hojas, no el `h2` y el `p`. */
    'h[c] [data-sec="hashtag"] .kick, h[c] [data-sec="trivia"] .kick {',
    '  color:' + TINTA2 + ' !important; text-shadow:none !important;',
    '}',
    'h[c] [data-sec="hashtag"] h2, h[c] [data-sec="trivia"] h2 {',
    '  color:' + TINTA + ' !important; text-shadow:none !important;',
    '}',
    'h[c] [data-sec="hashtag"] p, h[c] [data-sec="trivia"] p,',
    'h[c] [data-sec="hashtag"] .sm, h[c] [data-sec="trivia"] .sm,',
    'h[c] #tv-bajada, h[c] [data-sec="trivia"] li, h[c] [data-sec="trivia"] .rk {',
    '  color:' + TINTA2 + ' !important; text-shadow:none !important;',
    '}',
    'h[c] #hashtag-big, h[c] [data-sec="hashtag"] .big {',
    '  color:' + TINTA + ' !important; text-shadow:none !important;',
    '}',

    /* ---- 4.5 · LOS BOTONES QUE FALTABAN --------------------------------
       ⚠️⚠️ ESTA REGLA TAMBIÉN LA BORRÓ LA FASE 7 ⚠️⚠️
       Vestía cualquier `.btn` de adentro del marco como píldora dibujada.
       Ahora lo hace el material NÁCAR. Ver 7.4.
       ⚠️ Y nombraba `.wsp-in`, UNA CLASE QUE NO EXISTE — el error está
          documentado en 6.4, que fue donde se descubrió. */

    /* ---- 4.6 · LA FRASE SE MUDA ADENTRO DEL SOBRE ----------------------
       > «El sobre que se abre la carta lo quiero en lugar de la frase. A
       >  partir de ahora la frase va con el sobre.»
       ⚠️ La banda vieja se esconde SÓLO si la mudanza salió bien (la marca
          `data-mf-frase`). Si el motor todavía no dibujó la carta, la frase
          se queda donde estaba y se ve — nunca desaparece. */
    'h[c] .fraseSec[data-mf-frase] { display:none !important }',
    'h[c] #carta-sec .mf-frase {',
    '  display:block !important;',
    '  font-family:' + SERIF + ' !important; font-weight:300 !important;',
    '  font-style:italic !important;',
    '  font-size:19px !important; line-height:1.66 !important;',
    '  letter-spacing:.005em !important; text-align:center !important;',
    '  color:' + TINTA + ' !important; text-shadow:none !important;',
    '  max-width:330px; margin:0 auto 20px !important;',
    '  padding:0 0 18px !important;',
    '  border-bottom:1px solid ' + TINTA3 + ' !important;',
    '  background:none !important; background-color:transparent !important;',
    '}',

    /* =====================================================================
       FASE 5 — QUE LAS PERLAS NO SE METAN CON EL TEXTO
       =====================================================================
       Medido en BOMA, sobre la tarjeta de la portada (310×1057 px):
         · el texto ocupa el 53% CENTRAL  →  23% a 77%
         · queda 23% libre de cada lado, y ahí viven las perlas
       Y en NUESTRA portada, antes de esto: #pv-names iba del 17% al 85%.

       ★★★ LA CAUSA NO ERA EL FONDO, ERA EL ANCHO DEL TEXTO ★★★
       Por más que se corran las perlas hacia los bordes, un bloque de nombres
       que llega al 85% se les va encima igual.
       ⚠️ El `max-width` va sobre `.portada .c`, que es el contenedor de la
          columna — NO sobre `.frame`. Tocar el ancho del marco descentra la
          tarjeta entera (ya pasó dos veces). */
    'h[c] .portada .c {',
    '  max-width:78% !important;',
    '  margin-left:auto !important; margin-right:auto !important;',
    '}',

    /* =====================================================================
       FASE 6 — EL BARRIDO DE CONTRASTE, MEDIDO DE VERDAD (tarea #202)
       =====================================================================
       ★ Dieron 14 en rojo. Doce eran de verdad y dos eran mentira del propio
         barrido — las flechas ‹ › de la galería van sobre una píldora
         rgba(0,0,0,.58) y el barrido, al descartar los fondos con alfa < .85,
         las media contra el papel. ⚠️ UN BARRIDO QUE SALTEA EL ALFA MIENTE:
         hay que COMPONER las capas, no ignorarlas.
       ★ Y con el sobre ABIERTO aparecieron cuatro más: ver 6.4.
       ===================================================================== */

    /* ---- 6.1 · EL CIERRE: el pie todavía tenía su foto oscura ----------
       `.footer` NO es una `.sec`, así que las reglas que transparentan las
       bandas nunca lo tocaron: se quedó con su `background-image` y con los
       cinco textos en crema (1,05 a 1,47 de contraste). */
    'h[c] .frame .footer {',
    '  background-image:none !important; background-color:transparent !important;',
    '}',
    /* ⚠️ `:not(.btn)` NO ES ADORNO — FASE 7. Al «Escríbenos por WhatsApp» del
          pie se le presta la clase `.btn` para que el material lo pinte; si
          esta regla siguiera agarrándolo, le pisaría el color del nácar. */
    'h[c] .frame .footer, h[c] .frame .footer *:not(.btn):not(.btn *) {',
    '  color:' + TINTA2 + ' !important; text-shadow:none !important;',
    '}',
    'h[c] .frame .footer .n, h[c] .frame .footer .col-mvta-t {',
    '  color:' + TINTA + ' !important;',
    '}',

    /* ---- 6.2 · HOSPEDAJE: otra sección de banda oscura ------------------
       Los nombres de los hoteles salían en blanco puro (1,42) y el «Ver más»
       en lavanda pálido (1,15). Van adentro de un acordeón, así que hay que
       pintar todo el `.acc-inner`, no sólo el `h4`. */
    'h[c] .frame [data-sec="hospedaje"] p,',
    'h[c] .frame [data-sec="hospedaje"] .acc-inner *:not(.btn):not(.btn *) {',
    '  color:' + TINTA2 + ' !important; text-shadow:none !important;',
    '}',
    'h[c] .frame [data-sec="hospedaje"] .hotel h4 { color:' + TINTA + ' !important }',
    /* ⚠️ el «Ver más» (`.iv-plie-btn`) ya NO se pinta acá: la FASE 7 le presta
          la clase `.btn` y lo pinta el material. */

    /* ---- 6.3 · LA RASPADITA Y LOS CÍRCULOS DE LA FECHA ------------------
       ★★★ ACÁ ESTABA EL FAMOSO «.c .n EN BLANCO PURO» ★★★
       Eran DOS cosas distintas con el mismo síntoma:
         · `.scratch-under .sc-day` — los números que quedan al raspar. Como
           4.x transparentó `#scratchcard`, pasaron a caer sobre el papel.
         · `.ivf .c .n` — los números de la fecha adentro de los círculos
           plateados (`ivf-circ`, de `efectos/fecha.js`). Blanco sobre
           rgb(207,198,186): contraste 1,69. Con la tinta oscura da 5,54.
       ⚠️ NO es el calendario (`efectos/calendario.js` usa `.ivcal-*`). Lo
          busqué ahí primero y perdí un rato: el `.c .n` es de la fecha. */
    'h[c] .frame .scratch-under, h[c] .frame .scratch-under * {',
    '  color:' + TINTA + ' !important; text-shadow:none !important;',
    '}',
    'h[c] .frame .ivf .c .n, h[c] .frame .ivf .c .m, h[c] .frame .ivf .c .a {',
    '  color:' + TINTA + ' !important; text-shadow:none !important;',
    '}',

    /* ---- 6.4 · LOS BOTONES QUE FALTABAN (otra vez) ---------------------
       ⚠️ ESTOS NO APARECIERON EN EL PRIMER BARRIDO, Y NO PORQUE ESTUVIERAN
          BIEN: el sobre estaba CERRADO y el motor sólo había pintado 109 de
          las 180 hojas de texto. Un barrido con el sobre cerrado da un verde
          falso. → HAY QUE ABRIR EL SOBRE Y SCROLLEAR TODA LA INVITACIÓN
          ANTES DE MEDIR.

       Con la invitación entera a la vista aparecieron cuatro más, todos en
       crema sobre el papel: contraste 1,20.
         · `.wsp` ×3 — ⚠️ la regla de 4.5 nombraba `.wsp-in`, UNA CLASE QUE NO
           EXISTE. La de adentro del marco se llama `.wsp` a secas; la que hay
           que dejar en paz es la flotante, que vive AFUERA de `.frame`.
         · `.tv-btn` ×2 — «Iniciar sesión» de la trivia.

       ★ LA LECCIÓN: antes de dar los botones por vestidos, listar TODOS los
         `button` y `a` de adentro del marco con su color computado. Los que
         no estén en la tinta cantan solos.
       ⚠️ FASE 7: pasaron al material NÁCAR.
       ⚠️ LAS FLECHAS ‹ › DE LA GALERÍA NO SE TOCAN: van en blanco sobre una
          píldora rgba(0,0,0,.58) y ahí el blanco es lo correcto. */

    /* ---- 6.5 · EL BARRIDO, COMO SE CORRE BIEN --------------------------
         1. abrir el sobre y recorrer la invitación entera antes de medir
            (si no, se miden 109 hojas de 180);
         2. componer los fondos con alfa contra el papel, no descartarlos;
         3. el papel NO se puede medir en la página — Cloudinary no manda
            CORS y tiñe el canvas. Se mide sobre el archivo local: la franja
            central de la foto aprobada da 229,224,222 de promedio y
            220,216,212 en el 5% más oscuro. Ese último es el que se usa. */

    /* =====================================================================
       FASE 7 — LO QUE MARCÓ MAKI EL 16/9 MIRANDO LA MUESTRA EN EL CELULAR
       ===================================================================== */

    /* ---- 7.1 · LA PORTADA VA CENTRADA ----------------------------------
       ★★★ LA CAUSA ERA `justify-content:flex-end` ★★★
       El motor pega el bloque ABAJO, porque su portada nació con una FOTO
       detrás y el texto iba al pie. Marfil le sacó la foto (4.2) y ese
       `flex-end` quedó huérfano: 359 px de aire arriba contra 58 abajo.
       Con `center` queda 232 y 232. Medido el 16/9.
       ⚠️ Va también el `padding-bottom:0`: esos 58 px eran el contrapeso de
          la foto y descentran igual. */
    'h[c] .portada {',
    '  justify-content:center !important;',
    '  padding-bottom:0 !important;',
    '}',

    /* ---- 7.2 · LOS NOMBRES Y EL «and», MÁS CHICOS ----------------------
       A 44 px «PATRICIO» iba del 20% al 80% del marco y se metía con las
       perlas, que llegan hasta el 22%. A 33 px va del 31,5% al 68,5%.
       ⚠️ Y el «and» baja de .46em a .36em (11,9 px). En BOMA el enlace es
          MUCHO más chico que los nombres — es un respiro, no un tercer
          nombre. Con .46em competía.
       ⚠️ Los filetes también se acortan: en BOMA no cruzan la tarjeta, sólo
          acompañan la palabra (~39% del ancho). Estaban en 260 px. */
    'h[c] #pv-names, h[c] #pv-names > span {',
    '  font-size:33px !important;',
    '  letter-spacing:.12em !important;',
    '}',
    'h[c] .' + CL_Y + ' { width:min(52%,172px) !important }',
    'h[c] .' + CL_Y + ' b { font-size:.36em !important }',
    /* la cuenta regresiva baja con los nombres: si no, «395» le gana a
       «RENATA», y en la referencia manda el nombre, no el número. */
    'h[c] .portada .count .num { font-size:27px !important }',
    'h[c] .portada .count .lab { font-size:7.5px !important }',

    /* ---- 7.3 · EL VELO DE PAPEL DETRÁS DEL TEXTO -----------------------
       ⚠️ VA CON `::before` Y `z-index:-1`, NUNCA como una capa encima. Poner
          una capa arriba del texto es el bug que ya se pagó en `botones.js`.
       ⚠️ Y lleva `blur`. Sin él se ve el óvalo: la primera versión, sin blur
          y con la parada en 78%, cantaba el borde. Probado el 16/9. */
    'h[c] .portada .c { position:relative }',
    'h[c] .portada .c::before {',
    '  content:""; position:absolute; z-index:-1; inset:-14% -26%;',
    '  background:radial-gradient(58% 46% at 50% 50%,',
    '    rgba(253,252,251,.88) 0%, rgba(253,252,251,.66) 38%,',
    '    rgba(253,252,251,.30) 62%, rgba(253,252,251,0) 85%);',
    '  filter:blur(6px); pointer-events:none;',
    '}',

    /* ---- 7.4 · LOS BOTONES: NÁCAR, NO PÍLDORA DIBUJADA -----------------
       > «los botones quiero que le des como en Perlas pero claritos, no
       >  dibujados»  ·  «los colores tenés que cambiarlos para que no sea
       >  como la de Perlas»
       Perlas usa el material LACRE (cera oscura). Marfil usa NÁCAR: tornasol
       frío, claro, con relieve de verdad — el hermano de las perlas del fondo.

       ★★★ EL MATERIAL LO PINTA `efectos/botones.js`, NO ESTA COLECCIÓN ★★★
       Por eso TODAS las reglas de píldora fantasma se borraron de las fases
       3, 4.5, 6.1, 6.2 y 6.4. Si alguien las vuelve a escribir, le pisan el
       material y el botón queda plano otra vez.
       Acá queda SÓLO la tipografía, que es lo único que el material no toca
       (lo dice su propia cabecera: «no toca tamaños, ni espaciados»). */
    'h[c] .frame :is(.btn, .acc-btn, .wsp, .tv-btn) {',
    '  font-family:' + SANS + ' !important; font-size:10.5px !important;',
    '  letter-spacing:.18em !important; text-transform:uppercase !important;',
    '  font-weight:400 !important; border-radius:999px !important;',
    '  padding:12px 26px !important;',
    '}',

    /* =====================================================================
       FASE 8 — FUERA EL VIOLETA, Y EL VELO EN TODAS LAS SECCIONES
       =====================================================================
       Maki, 16/9, mirando la muestra en el celular:
         > «los colores violetas te dije que no, y están en mesa de regalos,
         >  los botones»
         > «no hiciste nada de lo que yo te dije. De los textos, que se ven
         >  tapados por las perlas. Mirá aeropuerto, por ejemplo»
       ===================================================================== */

    /* ---- 8.1 · LA PALETA: MARFIL ES ACROMÁTICA ------------------------
       ★★★ PERSEGUIR CLASES UNA POR UNA ERA EL ERROR ★★★
       Medido el 16/9: quedaban 140 elementos con violeta adentro del marco.
       No eran 140 bugs: era UNA paleta. El motor pinta TODO con siete
       variables, y en esta invitación valían:
           --verde #463b52 · --muted #615c69 · --cream #e9e6ee
           --sage #756786 · --sage-cl #c5bad2 · --oro #a5a0a8 · --lino #f4f2f6
       Ese violeta es el de PERLAS. Redefiniendo las siete, los 140 se
       arreglan de una y no queda ninguno suelto para la próxima.

       ⚠️ Y ES COHERENTE CON LA REFERENCIA, no un capricho: la ficha de
          lectura de BOMA ya decía «no hay color de acento en ningún lado: el
          único color de la pieza son los círculos del dress code y las
          fotos». Marfil es acromática por diseño.
       ⚠️ LOS CÍRCULOS DEL DRESS CODE Y LAS FOTOS NO SE TOCAN: esos colores
          los elige la clienta y no salen de estas variables.
       ⚠️ El material NÁCAR no usa ninguna de las siete (tiene los suyos), así
          que redefinirlas no le cambia el botón. */
    'h[c] {',
    '  --verde:#4a4642;',
    '  --muted:#55514b;',
    '  --cream:#e8e3d9;',
    '  --sage:#9c948a;',
    '  --sage-cl:#d9d3c9;',
    '  --oro:#b0a79a;',
    '  --lino:#f4f1ea;',
    '}',

    /* ---- 8.2 · EL VELO, EN TODAS LAS SECCIONES -------------------------
       En la fase 7 el velo se puso SÓLO en la portada y Maki lo marcó: el
       resto de los textos siguen cayendo sobre las perlas. Ahora va en cada
       sección, en el pase y en el pie.

       Es una banda vertical aclarada, con los bordes en cero para que las
       perlas de los márgenes se sigan viendo enteras. `inset:0 14%` la deja
       justo donde cae el texto.
       ⚠️ VA DETRÁS: `z-index:0` en el velo y `z-index:1` en los hijos. Si se
          pone encima, tapa el texto — el mismo bug de `botones.js`.
       ⚠️ Y lleva `blur`, por lo mismo que en 7.3: sin él se ve el rectángulo. */
    'h[c] .frame .sec, h[c] .frame .pase, h[c] .frame .footer {',
    '  position:relative;',
    '}',
    'h[c] .frame .sec::before, h[c] .frame .pase::before,',
    'h[c] .frame .footer::before {',
    '  content:""; position:absolute; z-index:0; inset:0 14%;',
    '  pointer-events:none;',
    '  background:linear-gradient(90deg,',
    '    rgba(252,251,249,0) 0%, rgba(252,251,249,.86) 14%,',
    '    rgba(252,251,249,.93) 50%, rgba(252,251,249,.86) 86%,',
    '    rgba(252,251,249,0) 100%);',
    '  filter:blur(10px);',
    '}',
    'h[c] .frame .sec > *, h[c] .frame .pase > *, h[c] .frame .footer > * {',
    '  position:relative; z-index:1;',
    '}'
  ].join('\n')
    /* el atributo va REPETIDO: así le gana a los módulos sin depender del
       orden de carga, que es la trampa que ya se pagó en Perlas. */
    .replace(/h\[c\]/g, 'html[' + MARCA + '="' + NOMBRE + '"][' + MARCA + '="' + NOMBRE + '"]')
    .replace(/h\[t\]/g, 'html[' + MARCA + '="' + NOMBRE + '"][' + MARCA_T + ']');

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) {
      s = document.createElement('style');
      s.id = ID_CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  /* ---------------------------------------------------------------- nombres
     `<span>Camila</span><br><span>& Tomás</span>`
       → `<span>Camila</span><br><span class="col-mf-y"><i></i><b>and</b><i></i></span><br><span>Tomás</span>`
     Se rehace en cada pasada del bucle porque el motor repone los nodos.
     ⚠️ Deshacer SIEMPRE mirando el DOM de AHORA, nunca desde una copia del
        HTML: el motor dibuja primero la boda de ejemplo.
     -------------------------------------------------------------------- */

  function partirNombres() {
    var n = document.getElementById('pv-names');
    if (!n || n.querySelector('.' + CL_Y)) return;
    var spans = n.querySelectorAll(':scope > span');
    if (spans.length < 2) return;

    var segundo = spans[spans.length - 1];
    var t = (segundo.textContent || '').trim();
    var m = t.match(/^([&yY]|and)\s+(.+)$/);
    if (!m) return;                       /* no hay nexo: no se toca nada */

    segundo.setAttribute('data-col-mf-orig', t);
    segundo.textContent = m[2];

    var sep = document.createElement('span');
    sep.className = CL_Y;
    var i1 = document.createElement('i');
    var b  = document.createElement('b');
    var i2 = document.createElement('i');
    /* ⚠️ EL NEXO ES SIEMPRE «and» — Maki, 15/9: «ni respetaste el and».
          Antes esto normalizaba a `&`, que es justo al revés de la
          referencia. En BOMA el enlace es la palabra `and` en cursiva entre
          dos filetes, igual que `day` y `Wedding`: es EL gesto de la
          colección, no una traducción. */
    b.textContent = 'and';
    sep.appendChild(i1); sep.appendChild(b); sep.appendChild(i2);

    /* el separador es `display:flex`, o sea de línea completa: NO lleva <br>. */
    n.insertBefore(sep, segundo);
  }

  function juntarNombres() {
    var n = document.getElementById('pv-names');
    if (!n) return;
    var sep = n.querySelector('.' + CL_Y);
    if (sep) {
      /* por si quedó un <br> de una versión vieja del módulo */
      var br = sep.nextElementSibling;
      if (br && br.tagName === 'BR') br.remove();
      sep.remove();
    }
    var v = n.querySelector('[data-col-mf-orig]');
    if (v) {
      v.textContent = v.getAttribute('data-col-mf-orig');
      v.removeAttribute('data-col-mf-orig');
    }
  }

  /* --------------------------------------------- las perlas: YA NO SE PONEN
     Había seis perlas recortadas, sembradas por CSS. Cada una traía su propio
     papel marfil con el alfa apagado en el borde. Sobre un color plano eso se
     lee como sticker: se le ve el canto, no tiene sombra de contacto y la luz
     no coincide con la del papel.

     > «El fondo lo dejás con colores base y no usás los fondos en foto con
     >  esas perlas, y las recortás para ponerlas arriba de tu fondo liso.»
     > «Tu nombre, hay una perla que lo tapa, ¿no lo ves?»

     ⚠️ NO SE VUELVEN A SEMBRAR PERLAS POR CSS. Si el papel se ve pelado, lo
        que falta es el fondo: `fx.fondo.paso` cerca de 1, no un div más.
     -------------------------------------------------------------------- */

  var CL_PERLA = 'mf-perla';

  /* ------------------------------------------------- la frase y el sobre
     La frase deja de ser una banda propia: pasa a ser la primera línea de la
     carta, arriba del texto, separada por un filete. Y la carta sube al lugar
     donde estaba la banda, así el orden de lectura no cambia.

     ⚠️ SE MUEVE EL NODO, NO SE COPIA EL TEXTO. Si se clonara, la frase que
        escribe la clienta en el panel dejaría de actualizarse.
     -------------------------------------------------------------------- */

  function mudarFrase() {
    var carta = document.getElementById('carta-sec');
    var banda = document.querySelector('.fraseSec');
    if (!carta || !banda) return;
    if (carta.querySelector('.mf-frase')) return;      /* ya está mudada */

    var p = banda.querySelector('p.frase') || banda.querySelector('p');
    if (!p || !(p.textContent || '').trim()) return;   /* sin frase no hay nada que mudar */

    p.classList.add('mf-frase');
    p.classList.remove('reveal');                      /* si no, entra invisible */
    p.removeAttribute('style');                        /* el motor le clava tamaño en línea */

    var tit = carta.querySelector('h2, .cartatit');
    if (tit && tit.parentNode) tit.parentNode.insertBefore(p, tit.nextSibling);
    else carta.insertBefore(p, carta.firstChild);

    banda.setAttribute('data-mf-frase', 'mudada');

    /* y el sobre ocupa el lugar que dejó la banda */
    if (banda.parentNode === carta.parentNode && banda.previousElementSibling !== carta) {
      banda.parentNode.insertBefore(carta, banda);
    }
  }

  function devolverFrase() {
    var banda = document.querySelector('.fraseSec[data-mf-frase]');
    var p = document.querySelector('#carta-sec .mf-frase');
    if (!banda || !p) return;
    p.classList.remove('mf-frase');
    banda.appendChild(p);
    banda.removeAttribute('data-mf-frase');
  }

  /* ---------------------------------------------------------- la playlist
     El acordeón de la música nace ABIERTO y el widget de Spotify se come
     media sección. Marfil lo pliega UNA sola vez y lo marca, para no volver
     a cerrárselo en la cara al invitado que lo abrió a propósito.
     ⚠️ Esto NO se puede hacer por CSS: hay que sacar la clase `.open`. */

  function plegarMusica() {
    var s = document.querySelector('[data-sec="spotify"]');
    if (!s || s.getAttribute('data-mf-plegado')) return;
    var b = s.querySelector('.acc-btn.open'), p = s.querySelector('.acc-panel.open');
    if (!b && !p) return;
    if (b) { b.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
    if (p) p.classList.remove('open');
    s.setAttribute('data-mf-plegado', '1');
  }

  function desplegarMusica() {
    var s = document.querySelector('[data-sec="spotify"]');
    if (s) s.removeAttribute('data-mf-plegado');
  }

  function sacarPerlas() {
    var v = document.querySelectorAll('.' + CL_PERLA);
    for (var i = 0; i < v.length; i++) v[i].remove();
  }

  /* ---------------------------------------------------------------- montaje */
  var puesta = false;

  function poner() {
    hoja();
    var raiz = document.documentElement;
    raiz.setAttribute(MARCA, NOMBRE);
    window.INVCOLPALETA = PALETA_PROPIA;   /* el papel y la tinta le ganan a la paleta */

    /* el papel y el fondo entran como variables, no clavados en la hoja:
       así la hoja se arma aunque las texturas todavía no hayan llegado. */
    var papel = laPieza('marfilPapel');
    var fondo = laPieza('marfilFondo');
    if (papel) raiz.style.setProperty('--mf-papel', 'url("' + papel + '")');
    if (fondo) raiz.style.setProperty('--mf-fondo', 'url("' + fondo + '")');

    ponerFondoDeLaColeccion();   /* la clienta elige Marfil y le sale con su fondo */
    ponerBotonDeLaColeccion();   /* y con sus botones de nácar */
    ponerSobreDeLaColeccion();   /* y con su propio sobre, distinto al de Perlas */
    prestarClaseBtn();           /* los dos que el material no alcanza */
    sacarPerlas();        /* por si quedó alguna de una versión vieja cacheada */
    mudarFrase();
    plegarMusica();

    if (tieneFuentePropia()) {
      raiz.removeAttribute(MARCA_T);
      juntarNombres();
    } else {
      raiz.setAttribute(MARCA_T, '');
      partirNombres();
    }
    puesta = true;
  }

  function sacar() {
    if (!puesta) return;
    var raiz = document.documentElement;
    raiz.removeAttribute(MARCA);
    raiz.removeAttribute(MARCA_T);
    if (window.INVCOLPALETA === PALETA_PROPIA) { try { delete window.INVCOLPALETA; } catch (e) { window.INVCOLPALETA = null; } }
    raiz.style.removeProperty('--mf-papel');
    raiz.style.removeProperty('--mf-fondo');
    sacarPerlas();
    sacarFondoDeLaColeccion();   /* el fondo de Marfil se va con Marfil */
    sacarBotonDeLaColeccion();   /* y el material del botón también */
    sacarSobreDeLaColeccion();   /* y el sobre */
    devolverClaseBtn();          /* cada uno recupera sus clases de origen */
    devolverFrase();      /* la frase vuelve a su banda: nada queda mudado */
    desplegarMusica();
    juntarNombres();
    puesta = false;
  }

  function sincronizar() {
    if (activa()) poner();
    else sacar();
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    sincronizar();
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
