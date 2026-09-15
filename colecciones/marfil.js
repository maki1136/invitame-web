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
    'h[c] .' + CL_Y + ' {',
    '  display:flex; align-items:center; justify-content:center; gap:14px;',
    '  width:min(64%,260px); margin:.10em auto .04em;',
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

    n.insertBefore(sep, segundo);
    n.insertBefore(document.createElement('br'), segundo);
  }

  function juntarNombres() {
    var n = document.getElementById('pv-names');
    if (!n) return;
    var sep = n.querySelector('.' + CL_Y);
    if (sep) {
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

  /* ---------------------------------------------------------------- montaje */
  var puesta = false;

  function poner() {
    hoja();
    var raiz = document.documentElement;
    raiz.setAttribute(MARCA, NOMBRE);

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
