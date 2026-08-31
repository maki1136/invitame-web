/* ===== COLECCIÓN "PERLAS" =====================================================

   QUÉ ES UNA COLECCIÓN
   Una decisión sola que trae TODO junto —tipografía, aire, bandas de color,
   paleta, motivo, adornos— copiada de una referencia concreta que mandó Maki.
   Jazmín elige "Perlas" y no arma nada más.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. NO DIBUJA UNA INVITACIÓN NUEVA.
      Palabras de Maki: «la idea es no romper nada, que puedas seguir con las
      plantillas como venimos, pero disfrazarlas».
      No se toca `index.html`, no se toca ninguna sección, no se pierde ninguna
      función. Esto es una hoja de estilos y tres movimientos de nodos, y todo
      se puede deshacer. Si se saca este archivo de la lista, vuelve todo como
      estaba.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'perlas'` no hace nada.
      Para probar sin tocar la base: `?coleccion=perlas`

   LA REFERENCIA
   Las tres capturas que mandó Maki (Pavel & Lada · Nazar & Anita ·
   Elizabeth & William). Ficha completa de lectura en la skill
   `invitame-plantillas`.

   ⚠️ EL 70% DE LA DIFERENCIA NO SON LAS PERLAS: ES LA TIPOGRAFÍA Y EL AIRE.
      Ya me equivoqué una vez de prioridad. Las perlas son la fase 4; esto —la
      fase 2— es lo que más cambia la invitación y no necesita ni una foto.

   LO QUE HACE ESTA FASE (2 de 6)
     1. Los títulos pasan a serif fina en MAYÚSCULAS con mucho espaciado entre
        letras. Antes eran Forum en negrita, en minúsculas.
     2. La cursiva (`.kick`) baja DEBAJO del título. Ese par —TÍTULO grande +
        cursiva chiquita abajo— se repite en todas las secciones y es la marca
        registrada de la referencia. Antes iba arriba.
     3. Los nombres pasan de letra manuscrita a serif fina en mayúsculas,
        enormes, y el "&" queda solo en el medio, en cursiva.
     4. El copete y la fecha pasan a versalitas chiquitas muy espaciadas.
     5. La cuenta regresiva: numerales grandes y finos, etiquetas en versalitas.
     6. Aire: el relleno de cada sección pasa de 48 px a 76 px, y los textos se
        limitan en ancho para que respiren.

   FALTA (fases 3 a 6): bandas de color alternadas, arcos, la foto en blanco y
   negro, las fotos como objetos apoyados, el collar como línea de tiempo del
   programa, el dress code en círculos, y las 5 fotos que va a mandar Maki.

   ⚠️ LOS TÍTULOS EN ESPAÑOL DE MÉXICO SON MÁS LARGOS QUE EN INGLÉS.
      `PROGRAM` mide la mitad que `CÓMO VA A SER EL DÍA`. Por eso el tamaño va
      con `clamp()` y los títulos tienen `max-width` en em: si no entran, bajan
      de tamaño solos. NUNCA acortar el texto del cliente para que entre.

   ⚠️ TODO LO QUE MUEVE NODOS GUARDA EL ORIGINAL Y SE PUEDE DESHACER.
      `h1.names` guarda su HTML en `data-col-orig`. El `.kick` se vuelve a poner
      antes del `h2`. Apagar la colección deja la invitación exactamente como
      estaba.

   ⚠️ LAS FUENTES YA ESTÁN CARGADAS por el motor: Cormorant Garamond, Forum,
      Great Vibes, Rouge Script, Montserrat, Lora. NO agregar un pedido de
      fuentes nuevo: es una invitación, se abre en el celular con datos.
   ============================================================================ */
(function () {
  'use strict';

  var NOMBRE = 'perlas';
  var MARCA  = 'data-coleccion';
  var ID_CSS = 'inv-coleccion-perlas';

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === NOMBRE;
    } catch (e) {}
    try { return (((window.INVEV || {}).fx) || {}).coleccion === NOMBRE; }
    catch (e) { return false; }
  }

  /* `h[c]` se reemplaza abajo por el selector con la marca. Se escribe corto
     para que la hoja se lea. */
  var CSS = [

    /* ── EL PAR QUE SE REPITE EN TODAS LAS SECCIONES ─────────────────────
       Serif fina en mayúsculas, muy espaciada, y la cursiva chiquita DEBAJO.
       Es lo que más se nota de la referencia. */
    'h[c] .sec h2.reveal{' +
      'font-family:"Cormorant Garamond",Forum,serif;font-weight:300;' +
      'text-transform:uppercase;letter-spacing:.2em;line-height:1.2;' +
      'font-size:clamp(20px,5.6vw,31px);' +
      'max-width:13em;margin:0 auto 6px;padding-left:.2em}',   /* .2em compensa el tracking del final */

    'h[c] .sec .kick{' +
      'font-family:"Great Vibes",cursive;font-weight:400;' +
      'font-size:clamp(19px,5vw,25px);line-height:1.35;letter-spacing:0;' +
      'text-transform:none;opacity:.72;' +
      'max-width:16em;margin:0 auto 30px}',

    /* ── AIRE ────────────────────────────────────────────────────────────
       En la referencia el texto ocupa ~60% del ancho y sobra papel arriba y
       abajo. Sin esto, aunque la tipografía esté bien, se sigue viendo barato. */
    'h[c] .sec{padding:76px 30px}',
    'h[c] .sec > p,h[c] .sec p.reveal{max-width:23em;margin-left:auto;margin-right:auto;line-height:1.75}',
    '@media (max-width:420px){h[c] .sec{padding:60px 24px}}',

    /* ── LA PORTADA ──────────────────────────────────────────────────────
       El copete en versalitas muy separadas, los nombres enormes y finos. */
    'h[c] .portada .kicker{' +
      'font-family:Montserrat,sans-serif;font-weight:400;text-transform:uppercase;' +
      'font-size:clamp(9px,2.6vw,11px);letter-spacing:.34em;' +
      'opacity:.85;margin-bottom:20px;padding-left:.34em}',

    'h[c] .portada h1.names{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;' +
      'text-transform:uppercase;letter-spacing:.11em;' +
      'font-size:clamp(33px,11.5vw,66px);line-height:1.06;padding-left:.11em}',

    /* el conector solo, en el medio, en cursiva: `CAMILA` / & / `TOMÁS` */
    'h[c] .portada h1.names .col-y{' +
      'display:block;font-family:"Great Vibes",cursive;font-weight:400;' +
      'text-transform:none;letter-spacing:0;font-size:.44em;' +
      'opacity:.8;margin:.04em 0;padding:0}',

    'h[c] .portada .fecha{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:clamp(10px,2.8vw,12px);letter-spacing:.26em;' +
      'opacity:.9;margin-top:22px;padding-left:.26em}',

    /* ── LA CUENTA REGRESIVA ─────────────────────────────────────────────
       Numerales grandes y finos, etiquetas en versalitas chiquitas.
       ⚠️ `.sep` son los DOS PUNTOS entre los números, no un separador de
          secciones. Acá sólo se le cambia el color y el tamaño. */
    'h[c] .count .num{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;' +
      'font-size:clamp(29px,8.6vw,44px);line-height:1;letter-spacing:.02em}',
    'h[c] .count .lab{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:9px;letter-spacing:.2em;opacity:.72;margin-top:7px;padding-left:.2em}',
    'h[c] .count .sep{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;' +
      'font-size:clamp(19px,5.6vw,28px);opacity:.32}'

  ].join('').replace(/h\[c\]/g, 'html[' + MARCA + '="' + NOMBRE + '"]');

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) {
      s = document.createElement('style');
      s.id = ID_CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  /* ---- 1. la cursiva baja DEBAJO del título -------------------------------
     El motor la escribe arriba. En la referencia va abajo. Mover el nodo es
     más seguro que volver la sección un flex: un flex le cambiaría el ancho a
     todo lo que tiene adentro. */
  function bajarCursiva() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      if (!k || !h) return;
      if (k.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING) {
        h.parentNode.insertBefore(k, h.nextSibling);   /* kick queda después del h2 */
      }
    });
  }

  function subirCursiva() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      if (!k || !h) return;
      if (h.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING) {
        h.parentNode.insertBefore(k, h);               /* vuelve a quedar antes */
      }
    });
  }

  /* ---- 2. el conector de los nombres, solo y en cursiva -------------------
     El motor escribe: <span>Camila</span><br><span>& Tomás</span>
     La referencia quiere:  CAMILA / & / TOMÁS
     Se guarda el HTML original para poder deshacerlo entero. */
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
    document.documentElement.setAttribute(MARCA, NOMBRE);
    bajarCursiva();
    partirNombres();
    puesta = true;
  }

  function sacar() {
    if (!puesta) return;
    document.documentElement.removeAttribute(MARCA);
    subirCursiva();
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
    /* el motor y los otros módulos siguen escribiendo secciones un rato largo:
       hay que volver a pasar por las nuevas */
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
