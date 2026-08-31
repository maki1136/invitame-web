/* ===== COLECCIÓN "PERLAS" =====================================================

   QUÉ ES UNA COLECCIÓN
   Una decisión sola que trae TODO junto —tipografía, aire, bandas de color,
   paleta, motivo, adornos— copiada de una referencia concreta que mandó Maki.
   Jazmín elige "Perlas" y no arma nada más.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. NO DIBUJA UNA INVITACIÓN NUEVA.
      Palabras de Maki: «la idea es no romper nada, que puedas seguir con las
      plantillas como venimos, pero disfrazarlas».
      No se toca `index.html`, no se toca ninguna sección, no se pierde ninguna
      función. Es una hoja de estilos y unos pocos nodos agregados, todo
      reversible. Si se saca este archivo de la lista, vuelve todo como estaba.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'perlas'` no hace nada.
      Para probar sin tocar la base: `?coleccion=perlas`

   LA REFERENCIA
   Las tres capturas que mandó Maki (Pavel & Lada · Nazar & Anita ·
   Elizabeth & William). Ficha completa en la skill `invitame-plantillas`.

   ⚠️ EL 70% DE LA DIFERENCIA NO SON LAS PERLAS: ES LA TIPOGRAFÍA Y EL AIRE.
      Las perlas son el remate, no el punto de partida.

   ★★★ CÓMO SE CAMBIAN LOS TAMAÑOS: SE SETEAN LAS VARIABLES DEL MOTOR ★★★
      El motor NO usa tamaños sueltos: tiene una escala completa en variables y
      las aplica con `!important`:
          .sec h2 { font-size: var(--fs-titulo, 30px) !important }
          .kick   { font-size: var(--fs-cursiva, 34px) !important }
      Una regla propia de `font-size`, por más específica que sea, PIERDE.

      La escala completa:
        --fs-nombres  --fs-kicker   --fs-titulo    --fs-cursiva
        --fs-contador --fs-texto    --fs-datos     --fs-direccion
        --fs-lugar    --fs-frase    --fs-boton
      Y además: --pad, --sec-col / --sec-col-v, --sec-tex / --sec-tex-v,
      --lino, --lino2, --cream, --muted, --oro, --verde, --sage.

      → TAMAÑO: se setea la variable. FAMILIA, espaciado y mayúsculas: reglas
        normales, que eso el motor no lo pisa.

   ★★★ LOS NOMBRES DE LA PORTADA LOS MANDA JAZMÍN, NO LA COLECCIÓN ★★★
      Decisión de Maki: «sí, que Jaz pueda cambiar».
      El motor le escribe a `h1.names` familia, tamaño y color EN LÍNEA, desde
      `nfont`, `nsize` y `ncolor`. Un estilo en línea le gana a cualquier hoja.
      · Con `nfont` elegida → la colección NO toca los nombres (ni mayúsculas:
        poner en mayúsculas una manuscrita queda horrible; va todo junto o nada).
      · Con `nfont` vacía → serif fina, mayúsculas y enormes, como la referencia.
      El bloque del panel le ofrece a Jazmín pasárselos con un clic.

   ★★★ NUNCA GUARDAR UNA COPIA DEL HTML PARA "DESHACER" ★★★  ← bug real, feo
      La primera versión guardaba `h1.innerHTML` para restaurarlo. Resultado: la
      invitación mostraba **"María & Diego"**, los nombres de la BODA DE EJEMPLO.
      El motor dibuja primero el ejemplo y recién después pone los datos del
      cliente; la copia se tomaba con el ejemplo adentro.
      → Deshacer se hace SIEMPRE mirando el DOM de AHORA.

   ★★ EL MOTOR ANCLA EL `.adorno` A LA CURSIVA ★★
      Al bajar el `.kick` debajo del `h2`, los aros ⚭ se fueron con él y
      quedaron METIDOS ENTRE el título y la cursiva, que en la referencia van
      pegados. Y el motor lo reinserta en cada pasada, así que `acomodar()`
      corre en el bucle de 400 ms y lo devuelve arriba de todo.

   ★ LA COLECCIÓN SUGIERE EL MOTIVO, NO LO IMPONE (fase 4)
      El hilo de perlas lo dibuja `/efectos/motivo.js`, que lee
      `INVEV.fx.motivo`. La colección lo prende escribiendo esa sugerencia EN
      MEMORIA, y sólo si no hay nada elegido.
      ⚠️ No se guarda en la base: `INVEV` es la copia que se dibuja, no el
         borrador. El admin guarda `D`.

   ★ LA LÍNEA DE TIEMPO ES UN HILO DE PERLAS (fase 4)
        · `.tl::before` es la guía, que el motor deja al 22 % de opacidad. Se
          sube a 1 y se le pone la perla repetida, de 11 px. La línea original
          mide 2 px a 6 px de la izquierda (centro x=7): la hilera va de 1.5 a
          12.5, mismo centro.
        · `.it::before` (el puntito de cada momento) pasa a ser una perla mayor.
        · `.tl-prog`, la línea que se dibuja con el scroll, se ESCONDE: el motor
          la anima con `scaleY` y escalar en vertical un fondo repetido deja las
          perlas ovaladas.
      ⚠️ Hilera RECTA y horarios de un solo lado, a propósito: en la referencia
         hace una S con los horarios alternados, pero ahí cada momento son dos
         palabras y los nuestros tienen título Y descripción.

   ★★★ LAS CINCO PIEZAS FOTOGRAFIADAS (fase 5) ★★★
      Generadas en Flow por Maki y recortadas acá. Viven en
      `window.INVPIEZAS`, cada una en su archivo `/colecciones/pieza-*.js`.

      DOS TRATAMIENTOS, SEGÚN SI FLOTAN O SE APOYAN:
        · broche y dije → pedidos sobre GRIS y recortados con alfa, porque
          tienen que flotar sobre cualquier fondo. La sombra se la pone el CSS.
        · bandeja, sobre y moño → pedidos sobre PAPEL MARFIL y NO recortados:
          se colocan enteros, con el alfa apagándose en los bordes para que se
          fundan con la sección.
        Recortar lo que flota, difuminar lo que se apoya.

      DÓNDE VA CADA UNA, y por qué se engancha ahí:
        · broche  → al final del hilo del programa (`.tl`). Es lo que hace la
          referencia: el collar baja y cierra con un broche.
        · dije    → colgando de la cuenta regresiva, con la cadena dibujada por
          CSS. ⚠️ La cadena NO está en la foto a propósito: es metal neutro y la
          misma clave que salva las perlas la borra; y una línea la dibuja mejor
          el CSS que una foto de 2 px.
        · bandeja → sección del lugar, enganchada a `.evento`.
        · sobre   → sección de la frase, enganchada a `.frase`.
        · moño    → sección de las personas, enganchada a `.padres`.
      Se enganchan a ESAS CLASES y no a los títulos: los títulos los escribe el
      cliente y cambian; las clases no.

      ★★ SI LA SECCIÓN QUE LE TOCA ES OSCURA, LA PIEZA SE VA A LA CLARA MÁS
         CERCANA ★★  ← esto se descubrió mirando, no midiendo
         Sobre una banda de color el rectángulo marfil se nota igual, por más
         difuminado que esté. La primera versión simplemente NO la colocaba, y
         el resultado fue que en `camila-y-tomas` la bandeja y el moño caían las
         dos en secciones verdes y no aparecían nunca. Dos de cinco piezas
         invisibles, sin ningún aviso.
         Ahora se busca la siguiente sección clara, y si no hay, la anterior.
         Contexto aproximado es mejor que pieza invisible: la bandeja termina
         cerca del lugar aunque no adentro.

      ⚠️ SI UNA PIEZA NO ESTÁ, NO SE COLOCA Y NO SE ROMPE NADA. Cada
         `/colecciones/pieza-*.js` es opcional.

   ★ CÓMO SE PASAN LAS PIEZAS AL REPO  ← esto costó una vuelta
      Base64 en bloques de 4.000 caracteres y VERIFICANDO CON SUMA DE CONTROL.
      Llegó un archivo con caracteres cambiados en el medio que decodificaba a
      los bytes exactos y con cabecera RIFF válida: **el tamaño y la cabecera NO
      alcanzan** para dar por buena una transferencia. Sólo la suma lo delata.

   ⚠️ LOS TÍTULOS EN ESPAÑOL DE MÉXICO SON MÁS LARGOS QUE EN INGLÉS.
      Los tamaños van con `clamp()`. NUNCA acortar el texto del cliente.

   ⚠️ LA INCLINACIÓN DE LAS FOTOS NO VA EN FOTOS CON `.reveal`: el motor las
      anima con `transform` y un `rotate` propio le pisaría la animación.

   ⚠️ LAS FUENTES YA ESTÁN CARGADAS por el motor. NO agregar un pedido nuevo.
   ============================================================================ */
(function () {
  'use strict';

  var NOMBRE  = 'perlas';
  var MARCA   = 'data-coleccion';
  var MARCA_T = 'data-col-tipo';        /* la colección manda sobre los nombres */
  var MARCA_P = 'data-col-perla';       /* hay foto de perla disponible */
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

  function laPerla() {
    try { return window.INVPERLA || ''; } catch (e) { return ''; }
  }
  function laPieza(k) {
    try { return (window.INVPIEZAS || {})[k] || ''; } catch (e) { return ''; }
  }

  /* `h[c]` = colección · `h[t]` = además tipografía nuestra · `h[p]` = hay perla */
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

    /* ── LA LÍNEA DE TIEMPO, HECHA DE PERLAS (fase 4) ──────────────────── */
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

    /* ── LAS CINCO PIEZAS FOTOGRAFIADAS (fase 5) ──────────────────────────
       ⚠️ Ninguna roba clics ni tapa texto. */
    'h[c] .col-pza{pointer-events:none;display:block}',

    /* el broche, cerrando el hilo del programa. 22 px de ancho: su centro cae
       en x=7, que es donde pasa la hilera de perlas. */
    'h[c] .tl .col-broche{' +
      'position:absolute;width:22px;height:auto;left:-4px;bottom:-11px;' +
      'filter:drop-shadow(0 1px 2px rgba(60,50,40,.24))}',

    /* el dije, colgando de la cuenta regresiva.
       ⚠️ LA CADENA ES CSS, no foto: ver la nota grande de arriba. */
    'h[c] .col-dije-caja{' +
      'display:flex;flex-direction:column;align-items:center;' +
      'margin:14px auto 0;pointer-events:none}',
    'h[c] .col-dije-caja::before{' +
      'content:"";width:1px;height:24px;background:currentColor;opacity:.45}',
    'h[c] .col-dije{width:24px;height:auto;margin-top:-2px;' +
      'filter:drop-shadow(0 2px 3px rgba(0,0,0,.30))}',

    /* las de papel: apoyadas, anchas y con aire */
    'h[c] .col-papel{width:min(86%,330px);height:auto;margin:34px auto 0}',
    /* red de seguridad: si alguna igual termina en una banda de color, no se ve.
       El JS ya se ocupa de llevarla a una sección clara. */
    'h[c] .sec.verde .col-papel{display:none}',

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

  /* ---- el motivo: la colección lo SUGIERE, no lo impone ------------------- */
  function sugerirMotivo() {
    try {
      var ev = window.INVEV;
      if (!ev) return;
      if (!ev.fx) ev.fx = {};
      var m = ev.fx.motivo;
      if (m && m.juego) return;                    /* ya eligió: no se toca */
      ev.fx.motivo = { juego: 'perlas', densidad: 1, donde: 'todo' };
    } catch (e) {}
  }

  /* ---- LAS CINCO PIEZAS -------------------------------------------------- */
  function unaImagen(clave, clase) {
    var src = laPieza(clave);
    if (!src) return null;                        /* si falta, no pasa nada */
    var i = document.createElement('img');
    i.className = 'col-pza ' + clase;
    i.alt = '';
    i.loading = 'lazy';
    i.src = src;
    return i;
  }

  /* engancha a una CLASE, nunca a un título: los títulos los escribe el cliente */
  function seccionDe(sel) {
    var e = document.querySelector(sel);
    return (e && e.closest) ? e.closest('.sec') : null;
  }

  /* ⚠️ La sección que le toca puede ser oscura, y ahí el rectángulo marfil se
     nota. Se busca la siguiente clara, y si no hay, la anterior.
     Se recorre la LISTA de `.sec` y no los hermanos: las secciones no siempre
     son hermanas directas. Ver la nota grande de arriba. */
  function claraCercaDe(s) {
    if (!s) return null;
    if (!s.classList.contains('verde')) return s;
    var todas = [].slice.call(document.querySelectorAll('.sec'));
    var i = todas.indexOf(s), j;
    if (i < 0) return null;
    for (j = i + 1; j < todas.length; j++) if (!todas[j].classList.contains('verde')) return todas[j];
    for (j = i - 1; j >= 0; j--) if (!todas[j].classList.contains('verde')) return todas[j];
    return null;
  }

  function ponerPapel(clave, sel, clase) {
    var s = claraCercaDe(seccionDe(sel));
    if (!s) return;
    if (document.querySelector('.' + clase)) return;   /* una sola por invitación */
    var i = unaImagen(clave, 'col-papel ' + clase);
    if (i) s.appendChild(i);
  }

  function colocarPiezas() {
    /* el broche, al final del hilo del programa */
    var tl = document.querySelector('.tl');
    if (tl && !tl.querySelector('.col-broche')) {
      var b = unaImagen('broche', 'col-broche');
      if (b) tl.appendChild(b);
    }

    /* el dije, colgando de la cuenta regresiva, con la cadena por CSS */
    var count = document.querySelector('.portada .count');
    if (count && count.parentNode && !count.parentNode.querySelector('.col-dije-caja')) {
      var d = unaImagen('dije', 'col-dije');
      if (d) {
        var caja = document.createElement('div');
        caja.className = 'col-pza col-dije-caja';
        caja.appendChild(d);
        count.parentNode.insertBefore(caja, count.nextSibling);
      }
    }

    ponerPapel('bandeja', '.evento', 'col-bandeja');
    ponerPapel('sobre',   '.frase',  'col-sobre');
    ponerPapel('mono',    '.padres', 'col-mono');
  }

  function sacarPiezas() {
    [].forEach.call(document.querySelectorAll('.col-pza'), function (e) { e.remove(); });
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
