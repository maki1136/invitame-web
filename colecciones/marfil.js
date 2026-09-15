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
      ⚠️ EL COLOR DE LA PORTADA NO SE TOCA. Los nombres van claros sobre la
         foto de tapa; si se les pusiera el gris de la referencia quedarían
         ilegibles. La referencia manda sobre el ESTILO, no sobre el contraste.

   ⚠️ LA FOTO DE TAPA NO SE SACA. En la referencia la portada es una tarjeta
      marfil sin foto, pero esa foto es CONTENIDO que carga la clienta. Si
      Maki quiere la portada sin foto, es una decisión suya — NO se improvisa.
      (La lección de la bandeja de Perlas: la referencia manda sobre el
      estilo, el contenido que la clienta vende no se sacrifica.)

   ★★★ CÓMO GANARLE A UN MÓDULO DEL MOTOR ★★★  (heredado de Perlas)
      `!important` no alcanza: la colección se inserta ANTES que los módulos y
      con especificidad e importancia iguales desempata el ORDEN.
      → Acá `h[c]` ya sale con el atributo REPETIDO. No hace falta acordarse.
      → Y para ganarle a esta colección desde un `marfil-ajustes.js`: mismo
        prefijo `h[c]` y sumar algo.

   ★ FASE 1 (esto): el esqueleto reversible, las tres voces, el separador de
     filetes, la cuenta regresiva y los círculos del dress code en UNA fila.
   ★ FASE 2: hecha — `colecciones/marfil-texturas.js` (papel, tres perlas
     sueltas, fondo oscuro).
   ★ FASE 3: la tarjeta flotando sobre el fondo, las Polaroid, las perlas
     sueltas colocadas, y la invitación de muestra armada.
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
  var TINTA2  = '#8d8781';   /* bajadas y datos */
  var TINTA3  = '#b6b0a8';   /* rótulos, segundos, filetes */

  /* el marfil canónico, el mismo que declara marfil-texturas.js. Va también
     como color plano abajo del papel: si la textura tardara, no se ve un
     salto de blanco a marfil. */
  var PAPEL_HEX = '#e5e0d5';

  function laPieza(k) {
    try { return (window.INVPIEZAS || {})[k] || ''; } catch (e) { return ''; }
  }

  var CSS = [
    /* ---- LA ESCALA: se setean LAS VARIABLES DEL MOTOR -------------------
       El motor tiene exactamente tres roles y cada uno lee su variable con
       `!important`:
           .sec h2          { font-size: var(--fs-titulo, 30px) !important }
           .kick            { font-size: var(--fs-cursiva, 34px) !important }
           .sec p:not(.frase){ font-size: var(--fs-texto, 16px) !important }
       ⚠️ Escribir `font-size` acá NO SIRVE: el `!important` del motor gana
          aunque la colección tenga más especificidad. Medido el 15/9: la
          cursiva se quedaba en 34px con la regla de 12,5 px puesta.
       ⚠️ `--fs-texto` NO SE TOCA. Jazmín pidió agrandar el cuerpo y
          `perlas-ajustes.js` ya lo dejó donde ella lo quería. Achicarlo para
          parecerse a la referencia sería deshacer un pedido suyo.
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
          trata este rótulo como versalitas chiquitas
          (`text-transform:uppercase; font-size:9.5px; letter-spacing:.24em`).
          Si se le pone la cursiva SIN sacarle eso, queda «LOS COLORES DE LA
          BODA» en script y mayúsculas, partido en dos renglones — y los dos
          filetes se achican hasta desaparecer. Visto y corregido el 15/9.
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
    /* Va como nodo porque el CSS no sabe meterse ENTRE dos hermanos.        */
    /* ⚠️ Los márgenes van casi en cero: el separador ya es de línea completa
          (es `display:flex`), así que NO necesita un <br> que lo separe del
          segundo nombre. Cuando le puse uno, el bloque pasó de 150 a 211 px
          y quedó un hueco enorme entre el filete y EMILIANO. */
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

    /* ⚠️⚠️ EL HALO DE LA PORTADA — SIN ESTO LOS NOMBRES NO SE LEEN ⚠️⚠️
       Los nombres van sobre la FOTO de tapa. El motor les pone el color en
       línea (crema) y una sombra `0 2px 18px`, que es un desenfoque ancho y
       no hace borde. Con la cursiva gruesa del motor alcanzaba; con esta
       serif fina y muy espaciada, NO: en la muestra los nombres quedaron
       casi invisibles sobre la foto.
       → Mismo halo que ya usa la cuenta regresiva en `i/estilos-servidor.css`
         (el arreglo de contraste de la tarea #195), y peso 400 en vez de 300.
       → Sólo en la PORTADA. Los títulos de sección van sobre papel y ahí la
         fina de 300 se lee perfecto.
       ⚠️ Y ojo con el encadenado: vaciar `nfont` para que mande la colección
          también saca el tamaño y el color que venían con esa elección. Si se
          cambia una, hay que mirar la otra. */
    'h[t] #pv-names, h[t] #pv-names > span {',
    '  font-weight:400 !important;',
    '  text-shadow:0 0 9px rgba(26,18,13,.68), 0 1px 3px rgba(26,18,13,.5),',
    '              0 0 26px rgba(26,18,13,.35) !important;',
    '}',
    'h[t] .' + CL_Y + ' b {',
    '  text-shadow:0 0 9px rgba(26,18,13,.68), 0 1px 3px rgba(26,18,13,.5) !important;',
    '}',
    'h[t] .' + CL_Y + ' i { opacity:.66; box-shadow:0 0 6px rgba(26,18,13,.45) }',

    /* ---- LA CUENTA REGRESIVA ------------------------------------------- */
    /* ⚠️ LAS CIFRAS DE CORMORANT SON DE ESTILO ANTIGUO. Sin pedirle las de
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
    /* El motor los deja con flex-wrap:wrap y se parten en dos renglones.    */
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
       ★★★ ESTO ES LO QUE SEPARA A MARFIL DE TODO LO DEMÁS ★★★
       El motor alterna secciones claras con BANDAS OSCURAS (`.sec.verde`).
       La referencia no tiene ninguna banda: es UNA tarjeta marfil continua,
       y lo oscuro está AFUERA, atrás. Entonces acá las bandas se apagan y
       el oscuro pasa al fondo de la escena.

       ⚠️ Y NO ES SÓLO ESTÉTICA: en la fase 1 les puse la tinta gris oscura a
          TODAS las secciones, incluidas las 6 bandas. Medido el 15/9:
          «Dónde y cuándo» quedaba rgb(74,70,66) sobre rgb(70,59,82) —
          contraste 1,03, o sea invisible. Transparentar las bandas arregla
          las dos cosas de una.

       ⚠️ SE ESCRIBE `background-color`, NUNCA `background`. El atajo pone
          `background-image:none` y borra la textura. Ya pasó en Perlas y
          Jazmín lo marcó con un círculo verde en el WhatsApp.
    */
    'h[c] body {',
    '  background-color:#2a231e;',
    '  background-image:var(--mf-fondo,none);',
    /* ⚠️ NADA DE `background-attachment:fixed`: en iPad una capa fija a
          pantalla completa fue exactamente lo que trabó la invitación
          (tarea #100). El fondo ya viene desenfocado en los píxeles, así que
          se repite y listo — sobre una foto fuera de foco la costura no se
          ve, y del fondo sólo asoma una franja a cada lado de la tarjeta. */
    '  background-size:760px auto; background-repeat:repeat;',
    '}',

    /* la tarjeta
       ⚠️ NI UNA PALABRA SOBRE EL ANCHO NI LOS MÁRGENES. El motor ya le puso
          `max-width:474px; margin:auto`. Le escribí `margin-left:10px` para
          separarla del borde y la DESCENTRÉ: se fue pegada a la izquierda con
          todo el fondo a la derecha. Después le puse `max-width:calc(100vw -
          20px)` y le pisé el ancho del motor: quedó de 1420 px. Las dos veces,
          por tocar algo que ya estaba resuelto. */
    'h[c] .frame {',
    '  background-color:' + PAPEL_HEX + ';',
    '  background-image:var(--mf-papel,none);',
    '  background-size:512px 512px; background-repeat:repeat;',
    '  border-radius:18px; overflow:hidden;',
    '  box-shadow:0 26px 60px rgba(0,0,0,.42), 0 2px 10px rgba(0,0,0,.18);',
    '}',

    /* Las secciones se apagan para que la tarjeta se lea como UNA pieza.
       ⚠️ VAN CON `!important` porque `fondo-invitacion.js` escribe
          `html[data-fondo] .sec.verde { background-color: color-mix(...)
          !important }`. Sin el `!important` las seis bandas oscuras se
          quedaban puestas, y encima con la tinta clara de la fase 1 encima:
          «Dónde y cuándo» medía contraste 1,03 contra su propio fondo. */
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
       En la referencia el «Abrir mapa» es una píldora de filete fino, fondo
       transparente y texto gris. Acá son dos clases: `.btn.gh` («Agendar») y
       `.btn.acc-btn` («Ver mapa», «Ver hoteles»).

       ★★★ POR QUÉ ESTÁ ESE `#mf-nada` QUE NO EXISTE ★★★
       `botones.js` pinta con
           [data-boton="lacre"] :is(.btn, #btn-ingresar, .wsp, …) { … !important }
       y `:is()` toma la especificidad de su argumento MÁS FUERTE: ese
       `#btn-ingresar` de adentro le da peso de ID a toda la regla.
       Contra un ID no gana NINGUNA cantidad de clases ni de atributos — la
       especificidad se compara por tramos, y (0,99,99) pierde contra (1,0,0).
       Probado: con `h[c] .frame .btn.gh` (0,5,2) el botón seguía con el
       material de lacre puesto.
       → La única salida es meter un ID propio. `#mf-nada` no existe en ningún
         lado, así que no cambia a qué elementos agarra la regla: está sólo
         para subirle el peso. Es el mismo recurso que usa botones.js.
       ⚠️ El color va también en el `span` interno (la flechita `.chev`).
       ⚠️ Y el fondo del botón NO es un color: es un `background-image`
          (el material). Apagar `background-color` solo no alcanza. */
    'h[c] .frame :is(#mf-nada, .btn.gh, .btn.acc-btn) {',
    '  background-image:none !important; background-color:transparent !important;',
    '  border:1px solid ' + TINTA3 + ' !important; border-radius:999px !important;',
    '  color:' + TINTA2 + ' !important;',
    '  font-family:' + SANS + ' !important; font-size:11px !important;',
    '  letter-spacing:.14em !important; text-transform:uppercase !important;',
    '  font-weight:400 !important; padding:11px 24px !important;',
    '  box-shadow:none !important; text-shadow:none !important;',
    '}',
    'h[c] .frame :is(#mf-nada, .btn.gh, .btn.acc-btn) span {',
    '  color:' + TINTA2 + ' !important; text-shadow:none !important;',
    '}',

    /* ---- LAS FOTOS, TIPO POLAROID -------------------------------------
       Marco blanco grueso, sombra suave y un grado de giro. Van y vienen
       para un lado y para el otro, como en la referencia.
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
       Maki, 15/9, mirando la muestra: «donde están los globitos rojos esos
       que está la frase. Es una frase gigante con un fondo negro horrible
       atrás y el texto grandísimo que no tiene nada que ver».
       ⚠️ Transparentar la `.sec` NO alcanza: la banda oscura, el velo y el
          bokeh viven DENTRO de la sección, en tres nodos propios —
          `.bg` (un linear-gradient), `.capa` (rgba(28,34,26,.5)) y
          `.frasefx.fx-bokeh` (los «globitos», que son `span.fp` con
          radial-gradients). Medido el 15/9.
       → La regla general: antes de dar una sección por vestida, mirar sus
         HIJOS. Una sección transparente puede tener tres capas adentro. */
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
            .kick   → rgb(255,255,255)  blanco
            p       → rgb(215,206,187)  crema
            label   → rgb(197,186,210)  lavanda pálido
            input   → texto blanco, relleno rgba(255,255,255,.08),
                      borde rgba(255,255,255,.25)
          Sobre papel marfil no se veía NADA: ni el título, ni «Tu nombre»,
          ni los dos botones del sí/no.
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
    '  color:' + TINTA3 + ' !important;',
    '}',
    /* el interruptor del sí / no podré */
    'h[c] .et, h[c] .et.s, h[c] .et.n { color:' + TINTA2 + ' !important }',
    'h[c] .et.on, h[c] .et.sel, h[c] .et[aria-checked="true"] {',
    '  color:' + TINTA + ' !important;',
    '}',

    /* ---- LA PLAYLIST: el reproductor no manda ---------------------------
       Maki: «en la playlist no la podés ocultar». El acordeón ya existe pero
       nace ABIERTO, y el widget de Spotify —que es un iframe ajeno y no se
       puede vestir por dentro— se comía media sección.
       → Marfil lo deja PLEGADO: queda la píldora fantasma invitando, y el
         invitado lo abre si quiere. Se pliega UNA sola vez (ver `plegarMusica`). */
    'h[c] [data-sec="spotify"] .acc-panel.open .acc-inner {',
    '  border:1px solid ' + TINTA3 + '; border-radius:3px; padding:10px;',
    '  background:rgba(255,255,255,.35);',
    '}',

    /* ---- LA RASPADITA: NO SE TAPA UN PAPEL CON OTRO PAPEL ---------------
       `#scratchcard` trae su propia tarjeta blanca (rgb(251,250,252)) apoyada
       sobre el papel de la sección. Dos claros distintos, uno encima del otro,
       y el borde entre los dos canta: se lee como un parche, no como papel.
       Es la misma lección que Maki ya había marcado en Perlas.
       → Fondo transparente, sin sombra y sin esquinas: quedan sólo los tres
         círculos plateados sobre el papel. */
    'h[c] #scratchcard {',
    '  background-color:transparent !important; box-shadow:none !important;',
    '  border-radius:0 !important;',
    '}',

    /* ---- EL PASE CON EL QR ----------------------------------------------
       Otro bloque diseñado para banda oscura: el rótulo en crema (240,231,212)
       y la tarjeta en lavanda pálido (233,230,238) sobre un relleno blanco al
       7%. Sobre papel marfil no se leía ni el nombre del invitado.
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

    /* ---- LAS PERLAS SUELTAS, APOYADAS SOBRE EL PAPEL ------------------- */
    'h[c] .mf-perla {',
    '  position:absolute; pointer-events:none; z-index:1;',
    '  background-position:center; background-size:contain;',
    '  background-repeat:no-repeat;',
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
       → `<span>Camila</span><br><span class="col-mf-y"><i></i><b>&</b><i></i></span><br><span>Tomás</span>`
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
    b.textContent = m[1] === 'and' ? '&' : m[1];
    sep.appendChild(i1); sep.appendChild(b); sep.appendChild(i2);

    /* el separador es `display:flex`, o sea de línea completa: NO lleva <br>.
       Con uno, quedaba un renglón vacío entre el filete y el segundo nombre. */
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

  /* ---------------------------------------------------------- las perlas
     Perlas sueltas apoyadas sobre el papel de la tarjeta, como en la
     referencia: de tres tamaños, salteadas, nunca dos iguales juntas.

     ⚠️ NO SE RECORTAN NI FLOTAN SOBRE CUALQUIER FONDO: traen su propio papel
        marfil con el alfa apagado en el borde, así que SÓLO funcionan sobre
        una sección clara. Por eso van salteando y nunca sobre una foto.
     ⚠️ Van como `background-image` de un div vacío y no como <img> a propósito:
        la regla Polaroid de más arriba agarra `.sec > img` y les pondría un
        marco blanco a las perlas.
     ⚠️ `pointer-events:none` para que no se coman un toque del invitado.
     -------------------------------------------------------------------- */

  var CL_PERLA = 'mf-perla';
  /* ⚠️ NINGUNA A MENOS DEL 8% DEL BORDE. Con `left:6%` una perla quedaba
        colgada del canto de la tarjeta y se leía como una mota mal recortada
        — Maki: «veo una perla tirada por ahí, mal cortada». Medido: ahora
        ninguna queda a menos de 24 px del borde del papel. */
  var SIEMBRA = [
    { pieza: 'marfilPerlaA', lado: 'left:13%',  alto: 'top:9%',     tam: 38 },
    { pieza: 'marfilPerlaC', lado: 'right:15%', alto: 'top:26%',    tam: 24 },
    { pieza: 'marfilPerlaB', lado: 'right:11%', alto: 'bottom:16%', tam: 44 },
    { pieza: 'marfilPerlaC', lado: 'left:18%',  alto: 'bottom:11%', tam: 27 },
    { pieza: 'marfilPerlaB', lado: 'left:9%',   alto: 'top:38%',    tam: 31 },
    { pieza: 'marfilPerlaA', lado: 'right:8%',  alto: 'bottom:34%', tam: 29 }
  ];

  /* Secciones donde una perla SÍ se puede apoyar: claras, altas y sin foto.
     La perla trae su propio papel marfil con el alfa apagado en el borde, así
     que sobre una foto o sobre una sección baja canta. */
  var SIN_PERLA = ['galeria', 'trivia', 'filtro', 'video', 'portada'];

  function claras() {
    var out = [], todas = document.querySelectorAll('.frame .sec');
    for (var i = 0; i < todas.length; i++) {
      var s = todas[i];
      var n = s.getAttribute('data-sec') || '';
      if (SIN_PERLA.indexOf(n) >= 0) continue;
      if (s.querySelector(':scope > img, :scope > video, .fxlayer')) continue;
      if (s.getBoundingClientRect().height < 420) continue;   /* nada de secciones bajas */
      out.push(s);
    }
    return out;
  }

  function colocarPerlas() {
    var secs = claras(), puestas = 0;
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      if (s.querySelector('.' + CL_PERLA)) { puestas++; continue; }
      var d = SIEMBRA[puestas % SIEMBRA.length];
      var src = laPieza(d.pieza);
      if (!src) return;
      var n = document.createElement('div');
      n.className = CL_PERLA;
      n.setAttribute('aria-hidden', 'true');
      n.style.cssText = d.lado + ';' + d.alto + ';width:' + d.tam + 'px;height:' + d.tam + 'px;' +
                        'background-image:url("' + src + '")';
      s.appendChild(n);
      puestas++;
    }
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

    /* el papel y el fondo entran como variables, no clavados en la hoja:
       así la hoja se arma aunque las texturas todavía no hayan llegado. */
    var papel = laPieza('marfilPapel');
    var fondo = laPieza('marfilFondo');
    if (papel) raiz.style.setProperty('--mf-papel', 'url("' + papel + '")');
    if (fondo) raiz.style.setProperty('--mf-fondo', 'url("' + fondo + '")');

    colocarPerlas();
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
    raiz.style.removeProperty('--mf-papel');
    raiz.style.removeProperty('--mf-fondo');
    sacarPerlas();
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
