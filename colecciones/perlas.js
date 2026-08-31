/* ===== COLECCIÓN "PERLAS" =====================================================

   QUÉ ES UNA COLECCIÓN
   Una decisión sola que trae TODO junto —tipografía, aire, bandas de color,
   paleta, motivo, adornos— copiada de una referencia concreta que mandó Maki.
   Jazmín elige "Perlas" y no arma nada más.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. NO DIBUJA UNA INVITACIÓN NUEVA.
      Palabras de Maki: «la idea es no romper nada, que puedas seguir con las
      plantillas como venimos, pero disfrazarlas».
      No se toca `index.html`, no se toca ninguna sección, no se pierde ninguna
      función. Es una hoja de estilos y tres movimientos de nodos, todo
      reversible. Si se saca este archivo de la lista, vuelve todo como estaba.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'perlas'` no hace nada.
      Para probar sin tocar la base: `?coleccion=perlas`

   LA REFERENCIA
   Las tres capturas que mandó Maki (Pavel & Lada · Nazar & Anita ·
   Elizabeth & William). Ficha completa en la skill `invitame-plantillas`.

   ⚠️ EL 70% DE LA DIFERENCIA NO SON LAS PERLAS: ES LA TIPOGRAFÍA Y EL AIRE.
      Ya me equivoqué una vez de prioridad. Las perlas son la fase 4.

   ★★★ CÓMO SE CAMBIAN LOS TAMAÑOS: SE SETEAN LAS VARIABLES DEL MOTOR ★★★
      El motor NO usa tamaños sueltos: tiene una escala completa en variables y
      las aplica con `!important`:
          .sec h2 { font-size: var(--fs-titulo, 30px) !important }
          .kick   { font-size: var(--fs-cursiva, 34px) !important }
      Una regla propia de `font-size`, por más específica que sea, PIERDE. La
      primera versión de este archivo cambiaba familia y espaciado bien, pero
      los tamaños quedaban intactos y no se entendía por qué.

      La escala completa:
        --fs-nombres  --fs-kicker   --fs-titulo    --fs-cursiva
        --fs-contador --fs-texto    --fs-datos     --fs-direccion
        --fs-lugar    --fs-frase    --fs-boton
      Y además: --pad, --sec-col / --sec-col-v (color de sección),
      --sec-tex / --sec-tex-v (textura), --lino, --lino2, --cream, --muted,
      --oro, --verde, --sage.

      → TAMAÑO: se setea la variable. FAMILIA, espaciado y mayúsculas: reglas
        normales, que eso el motor no lo pisa.

   ★★★ LOS NOMBRES DE LA PORTADA LOS MANDA JAZMÍN, NO LA COLECCIÓN ★★★
      Decisión de Maki (31/8/2026): «sí, que Jaz pueda cambiar».
      El motor le escribe a `h1.names` la familia, el tamaño y el color EN
      LÍNEA, desde los campos `nfont`, `nsize` y `ncolor` que elige el cliente.
      Un estilo en línea le gana a cualquier hoja.

      Entonces la regla es:
      · Si la invitación TIENE `nfont` elegida → la colección NO toca los
        nombres. Ni la familia, ni el tamaño, ni las mayúsculas.
        (Poner en mayúsculas una letra manuscrita queda horrible, así que el
         tratamiento entero va junto o no va.)
      · Si `nfont` está VACÍA → la colección toma la posta y los pone en serif
        fina, mayúsculas y enormes, como la referencia.

      Para que una invitación use la tipografía de la colección, Jazmín vacía
      el campo de fuente desde el panel. El bloque "Colección de diseño" se lo
      ofrece con un clic, igual que hace con la paleta.

   ★★ EL MOTOR ANCLA EL `.adorno` A LA CURSIVA ★★  ← bug real, costó una vuelta
      Al bajar el `.kick` debajo del `h2`, el adorno (los aros ⚭) se fue con él
      y quedó METIDO ENTRE el título y la cursiva. En la referencia ese par va
      pegado, sin nada en el medio. Y no alcanza con moverlo una vez: el motor
      lo vuelve a insertar pegado al `.kick` en cada pasada. Por eso
      `acomodar()` corre en el bucle de 400 ms y lo devuelve arriba de todo.
      Arriba además es donde corresponde: separa una sección de la otra, y en
      la fase 4 el hilo de perlas se cuelga justo de ahí.

   LO QUE HAY HECHO
     FASE 2 · tipografía y aire
       · Títulos en serif fina, MAYÚSCULAS, muy espaciados.
       · La cursiva pegada DEBAJO del título (antes iba arriba). Ese par es la
         marca registrada de la referencia.
       · El adorno arriba de todo, separando secciones.
       · Copete y fecha en versalitas chiquitas muy espaciadas.
       · Cuenta regresiva: numerales finos, etiquetas en versalitas.
       · Relleno de sección de 48 px a 76 px, y textos limitados en ancho.
     FASE 3 · estructura
       · Arcos: las bandas oscuras arrancan con el borde superior redondeado.
       · La foto de portada en blanco y negro, para que no pelee con la paleta.
       · Las fotos sueltas quedan como objetos APOYADOS en el papel: marco
         blanco, sombra propia y una inclinación mínima.
       · Las tarjetas de evento se aplanan: menos radio y menos sombra, más
         editorial y menos "app".
       · Los subtítulos (`h3`) acompañan al título, más chicos y espaciados.

   FALTA (fases 4 a 6): el collar como línea de tiempo del programa, las perlas
   sembradas, el dress code en círculos, los corazones del final y las 5 fotos
   que va a mandar Maki.

   ⚠️ LOS TÍTULOS EN ESPAÑOL DE MÉXICO SON MÁS LARGOS QUE EN INGLÉS.
      `PROGRAM` mide la mitad que `CÓMO VA A SER EL DÍA`. Por eso los tamaños
      van con `clamp()` y los títulos tienen `max-width` en em. NUNCA acortar
      el texto del cliente para que entre.

   ⚠️ LA INCLINACIÓN DE LAS FOTOS VA EN UN CONTENEDOR, NO EN LA FOTO.
      El motor anima las fotos con `transform` al aparecer (`.reveal`). Si la
      colección le pone `rotate` a la misma foto, le pisa la animación y la
      foto aparece de golpe. Por eso la inclinación va en el `<img>` sólo
      cuando NO es `.reveal`, y si no, se deja derecha.

   ⚠️ TODO LO QUE MUEVE NODOS GUARDA EL ORIGINAL Y SE PUEDE DESHACER.
      Apagar la colección deja la invitación exactamente como estaba.

   ⚠️ LAS FUENTES YA ESTÁN CARGADAS por el motor: Cormorant Garamond, Forum,
      Great Vibes, Rouge Script, Montserrat, Lora. NO agregar un pedido nuevo:
      es una invitación, se abre en el celular con datos.
   ============================================================================ */
(function () {
  'use strict';

  var NOMBRE = 'perlas';
  var MARCA  = 'data-coleccion';
  var MARCA_T = 'data-col-tipo';        /* la colección manda sobre los nombres */
  var ID_CSS = 'inv-coleccion-perlas';

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === NOMBRE;
    } catch (e) {}
    try { return (((window.INVEV || {}).fx) || {}).coleccion === NOMBRE; }
    catch (e) { return false; }
  }

  /* ¿la invitación tiene fuente propia elegida para los nombres? */
  function tieneFuentePropia() {
    try {
      var f = (window.INVEV || {}).nfont;
      return !!(f && String(f).trim());
    } catch (e) { return false; }
  }

  /* `h[c]` = la marca de la colección · `h[t]` = además, tipografía nuestra */
  var CSS = [

    /* ── LOS TAMAÑOS: por las variables del motor ──────────────────────── */
    'h[c]{' +
      '--fs-titulo:clamp(20px,5.6vw,31px);' +
      '--fs-cursiva:clamp(18px,4.8vw,24px);' +
      '--fs-kicker:clamp(9px,2.6vw,11px);' +
      '--fs-contador:clamp(29px,8.6vw,44px)}',

    /* ── EL PAR QUE SE REPITE EN TODAS LAS SECCIONES ───────────────────── */
    'h[c] .sec h2.reveal{' +
      'font-family:"Cormorant Garamond",Forum,serif;font-weight:300;' +
      'text-transform:uppercase;letter-spacing:.2em;line-height:1.2;' +
      'max-width:13em;margin:0 auto 4px;padding-left:.2em}',

    'h[c] .sec .kick{' +
      'font-family:"Great Vibes",cursive;font-weight:400;' +
      'line-height:1.35;letter-spacing:0;text-transform:none;opacity:.72;' +
      'max-width:16em;margin:0 auto 34px}',

    /* el subtítulo acompaña al título: más chico y más espaciado */
    'h[c] .sec h3{' +
      'font-family:"Cormorant Garamond",serif;font-weight:400;' +
      'text-transform:uppercase;letter-spacing:.14em;padding-left:.14em}',

    /* el adorno arriba de todo, separando secciones */
    'h[c] .sec > .adorno{margin:0 auto 34px;opacity:.55}',

    /* ── AIRE ─────────────────────────────────────────────────────────── */
    'h[c] .sec{padding:76px 30px}',
    'h[c] .sec > p,h[c] .sec p.reveal{max-width:23em;margin-left:auto;margin-right:auto;line-height:1.75}',
    '@media (max-width:420px){h[c] .sec{padding:60px 24px}}',

    /* ── ARCOS (fase 3) ───────────────────────────────────────────────────
       En la referencia las bandas oscuras no arrancan con un borde recto:
       arrancan con un arco. Es un detalle chico que cambia mucho.
       El radio va en dos ejes para que sea un arco ancho y bajo, no un
       semicírculo. */
    'h[c] .sec.verde{' +
      'border-top-left-radius:50% 90px;border-top-right-radius:50% 90px;' +
      'padding-top:104px}',
    '@media (max-width:420px){h[c] .sec.verde{' +
      'border-top-left-radius:50% 58px;border-top-right-radius:50% 58px;' +
      'padding-top:82px}}',

    /* ── LA FOTO DE PORTADA, EN BLANCO Y NEGRO (fase 3) ───────────────────
       Es lo que hace que la portada no pelee con la paleta. En la referencia
       la foto de los novios está desaturada a propósito. */
    'h[c] .portada .pbg,h[c] .portada .cover-vid{' +
      'filter:grayscale(1) contrast(1.06) brightness(.98)}',

    /* ── LAS FOTOS, COMO OBJETOS APOYADOS EN EL PAPEL (fase 3) ────────────
       Marco blanco, sombra propia y una inclinación mínima. En la referencia
       las fotos no van a sangre: están apoyadas sobre el papel.
       ⚠️ La inclinación NO va en fotos con `.reveal`: les pisaría la animación
          de aparición del motor. Ver la nota de arriba. */
    'h[c] .sec > img{' +
      'background:#fff;padding:9px;border-radius:2px;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.14),0 10px 24px rgba(60,50,40,.13);' +
      'max-width:min(100%,340px);height:auto;display:block;margin:26px auto}',
    'h[c] .sec > img:not(.reveal):nth-of-type(odd){transform:rotate(-1.4deg)}',
    'h[c] .sec > img:not(.reveal):nth-of-type(even){transform:rotate(1.1deg)}',

    /* las tarjetas de evento, más planas: menos radio y menos sombra */
    'h[c] .sec .evento{' +
      'border-radius:3px;box-shadow:0 1px 2px rgba(60,50,40,.10),0 8px 22px rgba(60,50,40,.10)}',

    /* ── LA PORTADA ───────────────────────────────────────────────────────
       ⚠️ Los nombres sólo se tocan si la invitación NO tiene fuente propia:
          por eso van bajo `h[t]`. Ver la nota grande de arriba. */
    'h[c] .portada .kicker{' +
      'font-family:Montserrat,sans-serif;font-weight:400;text-transform:uppercase;' +
      'letter-spacing:.34em;opacity:.85;margin-bottom:20px;padding-left:.34em}',

    'h[t] .portada h1.names{' +
      'font-family:"Cormorant Garamond",serif!important;font-weight:300!important;' +
      'text-transform:uppercase;letter-spacing:.11em;' +
      'font-size:clamp(33px,11.5vw,66px)!important;line-height:1.06;padding-left:.11em}',

    /* el conector solo, en el medio, en cursiva: `CAMILA` / & / `TOMÁS` */
    'h[t] .portada h1.names .col-y{' +
      'display:block;font-family:"Great Vibes",cursive!important;font-weight:400!important;' +
      'text-transform:none;letter-spacing:0;font-size:.44em!important;' +
      'opacity:.8;margin:.04em 0;padding:0}',
    /* si los nombres los manda Jazmín, el conector queda como estaba */
    'h[c]:not([' + MARCA_T + ']) .portada h1.names .col-y{display:inline}',

    'h[c] .portada .fecha{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:clamp(10px,2.8vw,12px);letter-spacing:.26em;' +
      'opacity:.9;margin-top:22px;padding-left:.26em}',

    /* ── LA CUENTA REGRESIVA ──────────────────────────────────────────────
       ⚠️ `.sep` son los DOS PUNTOS entre los números, no un separador de
          secciones. Acá sólo se le cambia el color y el tamaño. */
    'h[c] .count .num{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;' +
      'line-height:1;letter-spacing:.02em}',
    'h[c] .count .lab{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:9px;letter-spacing:.2em;opacity:.72;margin-top:7px;padding-left:.2em}',
    'h[c] .count .sep{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;opacity:.32}'

  ].join('')
   .replace(/h\[c\]/g, 'html[' + MARCA + '="' + NOMBRE + '"]')
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

  /* ---- 1. la cursiva pegada DEBAJO del título, el adorno arriba de todo ----
     Mover nodos es más seguro que volver la sección un flex: un flex le
     cambiaría el ancho a todo lo que tiene adentro.
     ⚠️ Corre en cada pasada, no una sola vez: el motor vuelve a insertar el
        adorno pegado al `.kick` cada vez que redibuja. */
  function acomodar() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      var a = s.querySelector(':scope > .adorno');

      if (k && h && (k.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        s.insertBefore(k, h.nextSibling);          /* la cursiva, justo después del título */
      }
      if (a && s.firstElementChild !== a) {
        s.insertBefore(a, s.firstElementChild);    /* el adorno, arriba de todo */
      }
    });
  }

  function desacomodar() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      var a = s.querySelector(':scope > .adorno');
      if (k && h && (h.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        s.insertBefore(k, h);                      /* la cursiva vuelve arriba del título */
      }
      if (a && k) s.insertBefore(a, k);            /* y el adorno vuelve pegado a ella */
    });
  }

  /* ---- 2. el conector de los nombres, solo y en cursiva -------------------
     El motor escribe: <span>Camila</span><br><span>& Tomás</span>
     La referencia quiere:  CAMILA / & / TOMÁS
     Sólo se hace si la colección manda sobre la tipografía. */
  function partirNombres() {
    var h1 = document.querySelector('.portada h1.names');
    if (!h1 || h1.querySelector('.col-y')) return;

    var sp = h1.querySelectorAll('span');
    if (sp.length < 2) return;

    var seg = sp[1];
    var m = (seg.textContent || '').match(/^\s*(&|y|and|e)\s+(.+)$/i);
    if (!m) return;

    if (!h1.dataset.colOrig) h1.dataset.colOrig = h1.innerHTML;

    seg.textContent = m[2];
    var y = document.createElement('span');
    y.className = 'col-y';
    y.textContent = (m[1] === '&') ? '&' : m[1].toLowerCase();
    seg.parentNode.insertBefore(y, seg);

    /* el <br> que separaba los dos nombres ya no hace falta: `.col-y` es un
       bloque y arma su propio renglón. Con el <br> quedaba un hueco vacío. */
    var pr = y.previousSibling;
    if (pr && pr.nodeName === 'BR') pr.remove();
  }

  function juntarNombres() {
    var h1 = document.querySelector('.portada h1.names');
    if (h1 && h1.dataset.colOrig) {
      h1.innerHTML = h1.dataset.colOrig;
      delete h1.dataset.colOrig;
    }
  }

  /* ---------------------------------------------------------------- montaje */
  var puesta = false;

  function poner() {
    hoja();
    var raiz = document.documentElement;
    raiz.setAttribute(MARCA, NOMBRE);

    /* ¿la tipografía de los nombres la manda la colección o Jazmín? */
    if (tieneFuentePropia()) {
      if (raiz.hasAttribute(MARCA_T)) { raiz.removeAttribute(MARCA_T); juntarNombres(); }
    } else {
      raiz.setAttribute(MARCA_T, '');
      partirNombres();
    }

    acomodar();
    puesta = true;
  }

  function sacar() {
    if (!puesta) return;
    document.documentElement.removeAttribute(MARCA);
    document.documentElement.removeAttribute(MARCA_T);
    desacomodar();
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
    /* el motor y los otros módulos siguen escribiendo secciones un rato largo */
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
