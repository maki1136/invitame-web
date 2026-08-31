/* ===== COLECCIÓN "PERLAS" =====================================================

   QUÉ ES UNA COLECCIÓN
   Una decisión sola que trae TODO junto —tipografía, aire, bandas de color,
   paleta, motivo, adornos— copiada de una referencia que mandó Maki.
   Jazmín elige "Perlas" y no arma nada más.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. NO DIBUJA UNA INVITACIÓN NUEVA.
      «la idea es no romper nada, que puedas seguir con las plantillas como
      venimos, pero disfrazarlas». Todo es reversible.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'perlas'` no hace nada.
      Para probar sin tocar la base: `?coleccion=perlas`

   ★★★★ LA LECCIÓN MÁS CARA DE ESTE ARCHIVO ★★★★
      Maki revisó la primera versión completa y la mayoría de lo que estaba mal
      no eran bugs: era que yo colocaba las piezas POR REGLA Y NO POR CRITERIO.
      Textual: «está puesto así por poner».
      Un adorno en un lugar que no le corresponde no es neutro: ensucia.
      → Antes de colocar algo: mirar la sección, entender qué hay, y si no hay
        un lugar bueno, NO PONERLO. Que falte es mejor que que sobre.

   ★★★ ANTES DE AGREGAR UN NODO A UNA SECCIÓN, MIRAR SU `display` ★★★
      La sección de la frase (`.fraseSec`) es `display:flex; flex-direction:row`.
      Al agregarle la foto del sobre como hijo normal, la imagen se convirtió en
      UNA COLUMNA MÁS y le robó el ancho al texto: el párrafo pasó de 375 px a
      177 px y se salió a `left:-62`. Eso es el «texto que sobresale» que vio
      Maki, y lo causé yo.
      → Lo que se agregue a una sección desconocida va `position:absolute`, o
        primero se comprueba que la sección no sea flex ni grid.

   ★★★ UNA FOTO RECTANGULAR SOBRE PAPEL SE VE COMO UN PARCHE ★★★
      Aunque el archivo traiga los bordes difuminados, el tono del papel de la
      foto nunca es EXACTAMENTE el de la sección, y el ojo ve un cuadrado más
      claro. La primera versión del sobre en la frase se leía como una calcomanía.
      → Se disuelve con `mask-image: radial-gradient(...)` en el CSS. La máscara
        se aplica al RENDER, así que se puede afinar sin regenerar el archivo, y
        deja sólo el objeto con su sombra, sin caja.
      ⚠️ `mix-blend-mode: multiply` acá SÍ sirve, porque la máscara ya recortó
         lo que sobraba. Sobre un PNG con alfa sin máscara NO sirve: el color de
         fondo llena la caja y las partes transparentes se vuelven un cuadrado.

   ★★★ CÓMO SE CAMBIAN LOS TAMAÑOS: SE SETEAN LAS VARIABLES DEL MOTOR ★★★
      El motor aplica su escala con `!important`, así que una regla propia de
      `font-size` PIERDE siempre:
          .sec h2 { font-size: var(--fs-titulo, 30px) !important }
      Escala completa: --fs-nombres --fs-kicker --fs-titulo --fs-cursiva
      --fs-contador --fs-texto --fs-datos --fs-direccion --fs-lugar --fs-frase
      --fs-boton. Y --pad, --sec-col/-v, --sec-tex/-v, --lino, --lino2,
      --cream, --muted, --oro, --verde, --sage.

   ★★★ LOS NOMBRES DE LA PORTADA LOS MANDA JAZMÍN ★★★
      El motor les escribe familia, tamaño y color EN LÍNEA desde `nfont`,
      `nsize`, `ncolor`. Con `nfont` elegida la colección NO los toca (ni las
      mayúsculas: en una manuscrita quedan horribles, va todo junto o nada).

   ★★★ NUNCA GUARDAR UNA COPIA DEL HTML PARA "DESHACER" ★★★
      Guardar `h1.innerHTML` para restaurarlo hacía aparecer "María & Diego",
      los nombres de la BODA DE EJEMPLO: el motor dibuja el ejemplo primero.

   ★★ EL MOTOR ANCLA EL `.adorno` A LA CURSIVA ★★
      Al bajar el `.kick` los aros ⚭ se fueron con él. El motor los reinserta en
      cada pasada, así que `acomodar()` corre en el bucle de 400 ms.

   ★ EL MOTIVO: SE SUGIERE `discreto`, NO `todo`
      Maki: «las perlas de la portada se nota que están dibujadas» y «hay
      perlas desparramadas que pisan los textos».
      Repetir una misma foto muchas veces y GRANDE se lee como dibujo, aunque
      cada unidad sea fotográfica: el ojo ve el patrón, no la perla.
      → `discreto` = hilo entre secciones + corazones del final.

   ★ LA LÍNEA DE TIEMPO ES UN HILO DE PERLAS
      `.tl::before` (la guía, al 22 % de opacidad) sube a 1 y lleva la perla
      repetida de 11 px, centrada en x=7 como la línea original.
      `.tl-prog` se ESCONDE: el motor la anima con `scaleY` y escalar un fondo
      repetido deja las perlas ovaladas.

   ★★★ LAS PIEZAS FOTOGRAFIADAS: QUÉ QUEDÓ Y QUÉ SE SACÓ ★★★
      Las cinco están en `window.INVPIEZAS` y las cinco siguen disponibles.
      Se COLOCA sólo lo que tiene un lugar bueno:
        · broche → SÍ. Al final del hilo del programa (`.tl`).
        · sobre  → SÍ, chico, ABSOLUTO y con máscara, en la esquina de la frase.
        · dije   → NO. Maki: «no es de calidad, está puesto así por poner».
        · bandeja→ NO. Su sección es oscura y la alternativa que eligió el
          código estaba OCULTA (alto 0). Vuelve con un lugar pensado.
        · moño   → NO. Terminaba debajo de la galería: «no le encontré sentido».

      ⚠️ NO ALCANZA CON QUE LA SECCIÓN SEA CLARA: hay que mirar que exista, que
         se vea y que la pieza tenga que ver con lo que dice esa sección.

   ★ LA SECCIÓN DE LA FRASE SE LIMPIA
      Maki: «los cosos esos rojos que se ven de fondo con la imagen que quedó,
      sacalo». Son `.frasefx.fx-bokeh` y la foto de fondo. Con la colección la
      frase va sobre papel limpio y el texto más chico.

   ★ `.padres` ES UNA GRILLA DE 2 COLUMNAS
      Con 3 personas la tercera queda sola abajo. Maki: «si ponés 3 pueden ir
      las 3 juntas, si son 4, 2 y 2».
      → Se marca `data-col-n` con la cantidad y el CSS arma la grilla.

   ⚠️ LOS TÍTULOS EN ESPAÑOL DE MÉXICO SON MÁS LARGOS: los tamaños van con
      `clamp()`. NUNCA acortar el texto del cliente.

   ⚠️ LA INCLINACIÓN DE LAS FOTOS NO VA EN FOTOS CON `.reveal`.
   ============================================================================ */
(function () {
  'use strict';

  var NOMBRE  = 'perlas';
  var MARCA   = 'data-coleccion';
  var MARCA_T = 'data-col-tipo';
  var MARCA_P = 'data-col-perla';
  var ID_CSS  = 'inv-coleccion-perlas';

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

  function laPerla() { try { return window.INVPERLA || ''; } catch (e) { return ''; } }
  function laPieza(k) { try { return (window.INVPIEZAS || {})[k] || ''; } catch (e) { return ''; } }

  var MASCARA = 'radial-gradient(ellipse 58% 58% at 50% 50%,#000 40%,transparent 76%)';

  var CSS = [

    /* ── LOS TAMAÑOS: por las variables del motor ──────────────────────── */
    'h[c]{' +
      '--fs-titulo:clamp(20px,5.6vw,31px);' +
      '--fs-cursiva:clamp(18px,4.8vw,24px);' +
      '--fs-kicker:clamp(9px,2.6vw,11px);' +
      '--fs-contador:clamp(29px,8.6vw,44px);' +
      '--fs-frase:clamp(17px,4.4vw,22px)}',

    /* ── EL PAR QUE SE REPITE EN TODAS LAS SECCIONES ───────────────────── */
    'h[c] .sec h2.reveal{' +
      'font-family:"Cormorant Garamond",Forum,serif;font-weight:300;' +
      'text-transform:uppercase;letter-spacing:.2em;line-height:1.2;' +
      'max-width:13em;margin:0 auto 4px;padding-left:.2em}',

    'h[c] .sec .kick{' +
      'font-family:"Great Vibes",cursive;font-weight:400;' +
      'line-height:1.35;letter-spacing:0;text-transform:none;opacity:.72;' +
      'max-width:16em;margin:0 auto 34px}',

    'h[c] .sec h3{' +
      'font-family:"Cormorant Garamond",serif;font-weight:400;' +
      'text-transform:uppercase;letter-spacing:.14em;padding-left:.14em}',

    'h[c] .sec > .adorno{margin:0 auto 34px;opacity:.55}',

    /* ── AIRE ─────────────────────────────────────────────────────────── */
    'h[c] .sec{padding:76px 30px}',
    'h[c] .sec > p,h[c] .sec p.reveal{max-width:23em;margin-left:auto;margin-right:auto;line-height:1.75}',
    '@media (max-width:420px){h[c] .sec{padding:60px 24px}}',

    /* ── ARCOS ────────────────────────────────────────────────────────── */
    'h[c] .sec.verde{' +
      'border-top-left-radius:50% 90px;border-top-right-radius:50% 90px;' +
      'padding-top:104px}',
    '@media (max-width:420px){h[c] .sec.verde{' +
      'border-top-left-radius:50% 58px;border-top-right-radius:50% 58px;' +
      'padding-top:82px}}',

    /* ── LA FOTO DE PORTADA, EN BLANCO Y NEGRO ────────────────────────── */
    'h[c] .portada .pbg,h[c] .portada .cover-vid{' +
      'filter:grayscale(1) contrast(1.06) brightness(.98)}',

    /* ── LAS FOTOS DEL CLIENTE, COMO OBJETOS APOYADOS ─────────────────── */
    'h[c] .sec > img{' +
      'background:#fff;padding:9px;border-radius:2px;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.14),0 10px 24px rgba(60,50,40,.13);' +
      'max-width:min(100%,340px);height:auto;display:block;margin:26px auto}',
    'h[c] .sec > img:not(.reveal):nth-of-type(odd){transform:rotate(-1.4deg)}',
    'h[c] .sec > img:not(.reveal):nth-of-type(even){transform:rotate(1.1deg)}',

    'h[c] .sec .evento{' +
      'border-radius:3px;box-shadow:0 1px 2px rgba(60,50,40,.10),0 8px 22px rgba(60,50,40,.10)}',

    /* ── LA SECCIÓN DE LA FRASE, LIMPIA ───────────────────────────────── */
    'h[c] .fraseSec{position:relative;background:var(--lino,#f4f3ec)}',
    'h[c] .fraseSec .frasefx,h[c] .fraseSec .bg,h[c] .fraseSec .capa{display:none!important}',
    'h[c] .fraseSec .frase{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;line-height:1.9;' +
      'max-width:19em;margin-left:auto;margin-right:auto;color:var(--verde,#44513f)}',

    /* ── `.padres`: la grilla según cuántos sean ──────────────────────── */
    'h[c] .padres[data-col-n="3"]{grid-template-columns:repeat(3,1fr)!important;gap:12px!important}',
    'h[c] .padres[data-col-n="1"]{grid-template-columns:minmax(0,220px)!important;justify-content:center!important}',
    '@media (max-width:360px){h[c] .padres[data-col-n="3"]{gap:8px!important}}',

    /* ── LA LÍNEA DE TIEMPO, HECHA DE PERLAS ──────────────────────────── */
    'h[p] .tl::before{' +
      'width:11px!important;left:1.5px!important;opacity:1!important;' +
      'background:var(--col-perla) repeat-y center top/11px 11px!important;' +
      'filter:drop-shadow(0 1px 1px rgba(60,50,40,.16))}',
    'h[p] .tl .tl-prog{display:none!important}',
    'h[p] .tl .it::before{' +
      'width:17px!important;height:17px!important;left:-28.5px!important;' +
      'background:var(--col-perla) no-repeat center/contain!important;' +
      'box-shadow:none!important;border:0!important;' +
      'filter:drop-shadow(0 1px 2px rgba(60,50,40,.2))}',

    /* ── LAS PIEZAS FOTOGRAFIADAS ─────────────────────────────────────── */
    'h[c] .col-pza{pointer-events:none;display:block}',

    'h[c] .tl .col-broche{' +
      'position:absolute;width:22px;height:auto;left:-4px;bottom:-11px;' +
      'filter:drop-shadow(0 1px 2px rgba(60,50,40,.24))}',

    /* el sobre: chico, absoluto y DISUELTO con máscara. Ver la nota de arriba:
       sin la máscara se ve el cuadrado del papel de la foto. */
    'h[c] .fraseSec .col-sobre{' +
      'position:absolute;right:2px;bottom:0;width:118px;height:auto;z-index:1;' +
      'opacity:.95;mix-blend-mode:multiply;' +
      '-webkit-mask-image:' + MASCARA + ';mask-image:' + MASCARA + '}',
    '@media (max-width:360px){h[c] .fraseSec .col-sobre{width:96px}}',

    /* ── LA PORTADA ───────────────────────────────────────────────────── */
    'h[c] .portada .kicker{' +
      'font-family:Montserrat,sans-serif;font-weight:400;text-transform:uppercase;' +
      'letter-spacing:.34em;opacity:.85;margin-bottom:20px;padding-left:.34em}',

    'h[t] .portada h1.names{' +
      'font-family:"Cormorant Garamond",serif!important;font-weight:300!important;' +
      'text-transform:uppercase;letter-spacing:.11em;' +
      'font-size:clamp(33px,11.5vw,66px)!important;line-height:1.06;padding-left:.11em}',

    'h[t] .portada h1.names .col-y{' +
      'display:block;font-family:"Great Vibes",cursive!important;font-weight:400!important;' +
      'text-transform:none;letter-spacing:0;font-size:.44em!important;' +
      'opacity:.8;margin:.04em 0;padding:0}',

    'h[c] .portada .fecha{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:clamp(10px,2.8vw,12px);letter-spacing:.26em;' +
      'opacity:.9;margin-top:22px;padding-left:.26em}',

    /* ── LA CUENTA REGRESIVA ──────────────────────────────────────────────
       ⚠️ `.sep` son los DOS PUNTOS entre los números, no un separador. */
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
   .replace(/h\[t\]/g, 'html[' + MARCA + '="' + NOMBRE + '"][' + MARCA_T + ']')
   .replace(/h\[p\]/g, 'html[' + MARCA + '="' + NOMBRE + '"][' + MARCA_P + ']');

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) {
      s = document.createElement('style');
      s.id = ID_CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  /* ---- el motivo: se sugiere DISCRETO ------------------------------------ */
  function sugerirMotivo() {
    try {
      var ev = window.INVEV;
      if (!ev) return;
      if (!ev.fx) ev.fx = {};
      var m = ev.fx.motivo;
      if (m && m.juego) return;
      ev.fx.motivo = { juego: 'perlas', densidad: 1, donde: 'discreto' };
    } catch (e) {}
  }

  /* ---- LAS PIEZAS: sólo las que tienen un lugar bueno --------------------- */
  function unaImagen(clave, clase) {
    var src = laPieza(clave);
    if (!src) return null;
    var i = document.createElement('img');
    i.className = 'col-pza ' + clase;
    i.alt = '';
    i.src = src;
    return i;
  }

  function colocarPiezas() {
    var tl = document.querySelector('.tl');
    if (tl && !tl.querySelector('.col-broche')) {
      var b = unaImagen('broche', 'col-broche');
      if (b) tl.appendChild(b);
    }

    /* ⚠️ ABSOLUTO A PROPÓSITO: `.fraseSec` es flex en fila y un hijo normal le
       roba el ancho al texto. Ver la nota grande de arriba. */
    var fs = document.querySelector('.fraseSec');
    if (fs && !fs.querySelector('.col-sobre')) {
      var s = unaImagen('sobre', 'col-sobre');
      if (s) fs.appendChild(s);
    }

    /* dije, bandeja y moño NO se colocan: sin lugar bueno todavía. */
  }

  function sacarPiezas() {
    [].forEach.call(document.querySelectorAll('.col-pza'), function (e) { e.remove(); });
  }

  /* ---- `.padres`: marcar cuántos son para que el CSS arme la grilla ------- */
  function marcarPadres() {
    var p = document.querySelector('.padres');
    if (!p) return;
    var n = String(p.children.length);
    if (p.dataset.colN !== n) p.dataset.colN = n;
  }
  function desmarcarPadres() {
    var p = document.querySelector('.padres');
    if (p) delete p.dataset.colN;
  }

  /* ---- títulos blancos sobre fondo claro ---------------------------------
     "Confirma tu lugar" salía en blanco sobre papel blanco. Se mira el color
     REAL y sólo se corrige si está casi blanco en una sección que no es de
     color. Se guarda la marca para poder deshacerlo. */
  function claridad(c) {
    var m = (c || '').match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return 0.299 * (+m[0]) + 0.587 * (+m[1]) + 0.114 * (+m[2]);
  }
  function arreglarContraste() {
    [].forEach.call(document.querySelectorAll('.sec:not(.verde) h2.reveal'), function (h) {
      if (h.dataset.colContraste) return;
      var l = claridad(getComputedStyle(h).color);
      if (l !== null && l > 215) {
        h.dataset.colContraste = '1';
        h.style.color = 'var(--verde,#44513f)';
      }
    });
  }
  function soltarContraste() {
    [].forEach.call(document.querySelectorAll('[data-col-contraste]'), function (h) {
      h.style.color = '';
      delete h.dataset.colContraste;
    });
  }

  /* ---- la cursiva pegada DEBAJO del título, el adorno arriba de todo ------ */
  function acomodar() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      var a = s.querySelector(':scope > .adorno');
      if (k && h && (k.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        s.insertBefore(k, h.nextSibling);
      }
      if (a && s.firstElementChild !== a) {
        s.insertBefore(a, s.firstElementChild);
      }
    });
  }

  function desacomodar() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      var a = s.querySelector(':scope > .adorno');
      if (k && h && (h.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        s.insertBefore(k, h);
      }
      if (a && k) s.insertBefore(a, k);
    });
  }

  /* ---- el conector de los nombres, solo y en cursiva ---------------------- */
  function partirNombres() {
    var h1 = document.querySelector('.portada h1.names');
    if (!h1 || h1.querySelector('.col-y')) return;
    var sp = h1.querySelectorAll('span');
    if (sp.length < 2) return;
    var seg = sp[1];
    var m = (seg.textContent || '').match(/^\s*(&|y|and|e)\s+(.+)$/i);
    if (!m) return;
    seg.textContent = m[2];
    var y = document.createElement('span');
    y.className = 'col-y';
    y.textContent = (m[1] === '&') ? '&' : m[1].toLowerCase();
    seg.parentNode.insertBefore(y, seg);
    var pr = y.previousSibling;
    if (pr && pr.nodeName === 'BR') pr.remove();
  }

  function juntarNombres() {
    var h1 = document.querySelector('.portada h1.names');
    if (!h1) return;
    var y = h1.querySelector('.col-y');
    if (!y) return;
    var seg = y.nextElementSibling;
    if (seg) {
      seg.textContent = y.textContent + ' ' + seg.textContent;
      y.parentNode.insertBefore(document.createElement('br'), y);
    }
    y.remove();
  }

  /* ---------------------------------------------------------------- montaje */
  var puesta = false;

  function poner() {
    hoja();
    var raiz = document.documentElement;
    raiz.setAttribute(MARCA, NOMBRE);

    var p = laPerla();
    if (p) {
      raiz.style.setProperty('--col-perla', 'url("' + p + '")');
      raiz.setAttribute(MARCA_P, '');
    }

    sugerirMotivo();

    if (tieneFuentePropia()) {
      raiz.removeAttribute(MARCA_T);
      juntarNombres();
    } else {
      raiz.setAttribute(MARCA_T, '');
      partirNombres();
    }

    acomodar();
    marcarPadres();
    arreglarContraste();
    colocarPiezas();
    puesta = true;
  }

  function sacar() {
    if (!puesta) return;
    var raiz = document.documentElement;
    raiz.removeAttribute(MARCA);
    raiz.removeAttribute(MARCA_T);
    raiz.removeAttribute(MARCA_P);
    raiz.style.removeProperty('--col-perla');
    sacarPiezas();
    desmarcarPadres();
    soltarContraste();
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
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
