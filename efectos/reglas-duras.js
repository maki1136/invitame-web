/* ===== LAS REGLAS DURAS DEL MOTOR ===========================================

   POR QUE EXISTE ESTE ARCHIVO  (16/9/2026)

   Maki, cansado, despues de que las mismas cosas salieran mal por tercera vez:

     «te dije que dejes... la frase sigue asi grande, eliminala directo»
     «hay palabras claras sobre claro»
     «y el blanco sobre el rosita? no se lee una mierda»

   Estaba todo escrito en la skill de muestras, con sus palabras, y se repitio
   igual. La conclusion la eligio el:

     «las reglas duras adentro del motor» — que el motor NO PUEDA pintarlo mal.

   ---------------------------------------------------------------------------
   REGLA 1 — LA FRASE NO SE PINTA SUELTA. NUNCA.

     «El sobre que se abre la carta lo quiero en lugar de la frase.»

   ⚠️ Vaciar el campo `frase` NO alcanza: `.fraseSec` seguia en el DOM y traia
      el texto de la boda de EJEMPLO. Por eso se esconde la seccion.
   ⚠️ EN PERLAS NO SE TOCA: ahi la frase es EL COLLAR, el ejemplo bueno.

   REGLA 2 — LA CARTA VA ARRIBA, EN EL LUGAR QUE DEJO LA FRASE

   ⚠️ Los sectores de `secOrden` NO TIENEN id: son `.sec` pelados. La carta se
      cuelga despues de la ENTRADA — portada, pase con QR y raspadita.

   REGLA 3 — EL VIDEO Y LA PLAYLIST NUNCA SE VEN CRUDOS

     NO SE TAPA UN PAPEL CON OTRO PAPEL: se esconde el medio con `visibility`
     y se deja pasar una tapa dibujada encima.

   ---------------------------------------------------------------------------
   REGLA 4 — NINGUN TEXTO ILEGIBLE, Y SE MIDE EL PAPEL DE VERDAD

   ★★★★★ EL ERROR QUE COSTO DOS VUELTAS ★★★★★

   Primer intento: se buscaba el primer ancestro con un `background-color`
   opaco y se media contra ese color. En el pase con QR eso daba
   `rgb(176,106,126)` — un rosa medio — y el corrector, creyendo que el papel
   era oscuro, ACLARO los rotulos hasta casi blanco.

   Pero ese color NO SE VE. El mismo elemento tiene encima una IMAGEN de fondo:
   el papel rosa clarisimo del pase. Medido con la propia imagen:
   **rgb(246,236,234)**. O sea: se estaba corrigiendo contra un color tapado, y
   el resultado fue blanco sobre papel casi blanco. Maki: «no se lee una
   mierda». Tenia razon — la correccion lo habia EMPEORADO.

   → **UN `background-color` DEBAJO DE UN `background-image` NO ES EL FONDO.**
     Es lo que quedaria si la imagen no cargara. No se mide contra eso.

   ★ COMO SE MIDE EL PAPEL AHORA

   Cloudinary sirve las imagenes con CORS abierto, asi que se puede pedir la
   MISMA imagen reducida a 1x1 pixel — que es su color promedio — y leerla en
   un canvas sin que se contamine. Comprobado el 16/9/2026:

       .../upload/w_1,h_1,c_fill,f_png/v1785954032/invitame/xxx.jpg  →  246,236,234

   Se piden una sola vez por URL y quedan en memoria. Mientras no esten, la
   regla no corrige nada: no se decide sobre un fondo que todavia no se sabe.

   ⚠️ Si la imagen no es de Cloudinary y no se puede medir (un degradado, un
      data URI), ese bloque se deja en paz. Mejor no tocar que empeorar.

   ⚠️⚠️ Y LA PORTADA Y EL CIERRE NO SE TOCAN NUNCA. Son los dos bloques con
      foto de gente a pantalla completa: ahi el texto blanco va con sombra y se
      lee perfecto, y el color promedio de una foto no dice nada. De 57
      "errores" del primer barrido, los primeros siete eran exactamente eso.

   ★ COMO CORRIGE

   Conserva el TONO del color elegido y mueve SOLO la luminosidad hasta
   alcanzar el minimo (4.5, o 3 si el texto es grande).
   ⚠️ Tiene techo: un tono muy saturado sobre un papel de color medio puede no
      llegar. Si ni el extremo alcanza, se cae a negro o blanco puro, que
      siempre llega.

   ---------------------------------------------------------------------------
   ★★★★★ NO DECIDIR ANTES DE QUE LLEGUEN LOS DATOS ★★★★★

   El motor dibuja primero y `window.INVEV` llega despues. En esa ventana,
   preguntar «¿que coleccion es?» devuelve VACIO: en Perlas contestaba «no es
   Perlas», le escondia la frase — y con ella el collar — y como dejaba su
   marca puesta, no lo volvia a mirar. Misma leccion que `musica.js`.

   → No se hace NADA hasta que los datos esten, y si se equivoco, se desanda.

   ⚠️ Y AL VERIFICAR: `todo.php` queda cacheado. Recargar con otro `?cb=` NO lo
      bustea: eso bustea el HTML, no el paquete de modulos. Dio falso rojo TRES
      veces seguidas. Forzar con `fetch('/efectos/todo.php',{cache:'reload'})`
      antes de recargar.

   ---------------------------------------------------------------------------
   COMO ESTA HECHO

   · Reversible: se saca la linea de `efectos/index.js` y vuelve todo atras.
   · Cede ante las colecciones en las reglas 1, 2 y 3. La 4 corre siempre.
   · Revisa cada tanto, porque EL PANEL REPINTA.
   ============================================================================ */
(function () {

  var CADA  = 700;
  var HASTA = 60000;

  /* ── ayudas ───────────────────────────────────────────────────────────── */

  function datos() { return window.INVEV || null; }

  function hayDatos() {
    var D = datos();
    return !!(D && typeof D === 'object' && Object.keys(D).length > 3);
  }

  function laColeccion() {
    var D = datos() || {};
    return String((D.fx && D.fx.coleccion) || D.coleccion || '').toLowerCase();
  }

  function loResuelveLaColeccion() { return laColeccion() === 'perlas'; }

  function elMarco() { return document.querySelector('.frame'); }


  /* ── REGLA 1: fuera la frase suelta ───────────────────────────────────── */

  function sacarLaFrase() {
    var secs = document.querySelectorAll('.fraseSec, section.frase');
    var cede = loResuelveLaColeccion();

    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      var yaLaSacamos = s.getAttribute('data-regla-frase') === 'fuera';
      if (cede) {
        if (yaLaSacamos) { s.removeAttribute('data-regla-frase'); s.style.display = ''; }
        continue;
      }
      if (yaLaSacamos) continue;
      s.setAttribute('data-regla-frase', 'fuera');
      s.style.display = 'none';
    }
  }


  /* ── REGLA 2: la carta, arriba ────────────────────────────────────────── */

  function finDeLaEntrada() {
    var marco = elMarco();
    if (!marco) return null;
    var ultimo = null, hijos = marco.children;
    for (var i = 0; i < hijos.length; i++) {
      var c = ' ' + String(hijos[i].className || '') + ' ';
      if (c.indexOf(' portada ') >= 0 || c.indexOf(' pase ') >= 0 ||
          c.indexOf(' scratch-sec ') >= 0) ultimo = hijos[i];
    }
    return ultimo;
  }

  function subirLaCarta() {
    if (loResuelveLaColeccion()) return;
    var carta = document.getElementById('carta-sec');
    var tope  = finDeLaEntrada();
    if (!carta || !tope) return;
    if (carta.parentNode !== tope.parentNode) return;
    if (tope.nextElementSibling === carta) return;
    tope.parentNode.insertBefore(carta, tope.nextSibling);
  }


  /* ── REGLA 3: el video y la playlist, tapados ─────────────────────────── */

  var CSS_ID = 'reglas-duras-css';

  function ponerCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      '[data-crudo="tapado"]{position:relative}',
      '[data-crudo="tapado"] > iframe,',
      '[data-crudo="tapado"] > video{visibility:hidden}',
      '.rd-tapa{position:absolute;inset:0;z-index:2;display:flex;',
      '  flex-direction:column;align-items:center;justify-content:center;gap:10px;',
      '  border-radius:inherit;cursor:pointer;background:var(--lino,#f4f1ea)}',
      '.rd-tapa .rd-aro{width:62px;height:62px;border-radius:50%;',
      '  border:1px solid currentColor;display:flex;align-items:center;',
      '  justify-content:center;opacity:.75}',
      '.rd-tapa .rd-aro::after{content:"";border-style:solid;',
      '  border-width:9px 0 9px 15px;margin-left:4px;',
      '  border-color:transparent transparent transparent currentColor}',
      '.rd-tapa .rd-txt{font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.65}',
      '.rd-tapa.rd-ida{opacity:0;pointer-events:none;transition:opacity .45s ease}',
      '.frame input::placeholder,.frame textarea::placeholder{',
      '  color:currentColor !important;opacity:.72 !important}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function taparUno(caja, rotulo) {
    if (!caja) return;
    if (caja.querySelector('.rd-tapa')) return;
    if (caja.querySelector('.col-vtapa')) return;
    if (!caja.querySelector('iframe') && !caja.querySelector('video')) return;

    ponerCss();
    caja.setAttribute('data-crudo', 'tapado');

    var tapa = document.createElement('div');
    tapa.className = 'rd-tapa';
    var aro = document.createElement('div'); aro.className = 'rd-aro';
    var txt = document.createElement('div'); txt.className = 'rd-txt';
    txt.textContent = rotulo;
    tapa.appendChild(aro); tapa.appendChild(txt);

    tapa.addEventListener('click', function () {
      caja.removeAttribute('data-crudo');
      tapa.classList.add('rd-ida');
      setTimeout(function () { if (tapa.parentNode) tapa.parentNode.removeChild(tapa); }, 500);
    });

    caja.appendChild(tapa);
  }

  function taparCrudos() {
    if (loResuelveLaColeccion()) return;
    taparUno(document.getElementById('video-embed'), 'Nuestro video');
    taparUno(document.getElementById('spotify-embed'), 'La playlist');
  }


  /* ── REGLA 4: ningun texto ilegible ───────────────────────────────────── */

  function aRGB(s) {
    var m = String(s).match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
  }

  function luminancia(c) {
    var r = [c[0], c[1], c[2]].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
  }

  function contraste(a, b) {
    var L1 = luminancia(a), L2 = luminancia(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  /* --- el color promedio de un papel de Cloudinary, pedido en 1x1 --------- */

  var PAPEL = {};          /* url -> [r,g,b] | 'no' mientras se pide | false si no se pudo */

  function urlDe1px(url) {
    var i = url.indexOf('/upload/');
    if (i < 0) return null;
    var cola = url.slice(i + 8);
    /* si lo que sigue no es la version, es una transformacion: se reemplaza */
    if (!/^v\d+\//.test(cola)) cola = cola.replace(/^[^/]*\//, '');
    return url.slice(0, i + 8) + 'w_1,h_1,c_fill,f_png/' + cola;
  }

  function pedirPapel(url) {
    if (PAPEL[url] !== undefined) return;
    var chico = urlDe1px(url);
    if (!chico) { PAPEL[url] = false; return; }
    PAPEL[url] = 'no';
    var im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () {
      try {
        var c = document.createElement('canvas'); c.width = 1; c.height = 1;
        var x = c.getContext('2d'); x.drawImage(im, 0, 0);
        var d = x.getImageData(0, 0, 1, 1).data;
        PAPEL[url] = [d[0], d[1], d[2], 1];
      } catch (e) { PAPEL[url] = false; }
    };
    im.onerror = function () { PAPEL[url] = false; };
    im.src = chico;
  }

  function laImagenDe(cs) {
    if (!cs.backgroundImage || cs.backgroundImage === 'none') return null;
    var m = String(cs.backgroundImage).match(/url\(["']?([^"')]+)/);
    if (!m) return null;                       /* degradado: no se puede medir */
    if (m[1].indexOf('res.cloudinary.com') < 0) return null;
    return m[1];
  }

  /* Los dos bloques con foto de gente a pantalla completa: no se tocan. */
  function sobreFoto(el) {
    return !!(el.closest && el.closest('.portada, .footer'));
  }

  /* El fondo de VERDAD. Si el elemento que aporta color tiene ademas una
     imagen encima, el color no vale: vale el papel. */
  function fondoReal(el) {
    if (sobreFoto(el)) return null;
    var n = el;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);
      var img = laImagenDe(cs);
      if (img) {
        pedirPapel(img);
        var p = PAPEL[img];
        if (p && p !== 'no') return p;         /* el papel medido */
        return null;                           /* todavia no, o no se pudo */
      }
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      var c = aRGB(cs.backgroundColor);
      if (c && c[3] >= 0.85) return c;
      n = n.parentElement;
    }
    return null;
  }

  function aHSL(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var h = 0, s = 0, l = (mx + mn) / 2, d = mx - mn;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }

  function deHSL(h, s, l) {
    function f(n) {
      var k = (n + h / 30) % 12;
      var a = s * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))));
    }
    return [f(0), f(8), f(4), 1];
  }

  function corregir(frente, fondo, minimo) {
    var hsl = aHSL(frente);
    var haciaOscuro = luminancia(fondo) > 0.45;
    for (var paso = 1; paso <= 40; paso++) {
      var l = haciaOscuro ? hsl[2] - paso * 0.025 : hsl[2] + paso * 0.025;
      if (l < 0 || l > 1) break;
      var c = deHSL(hsl[0], hsl[1], l);
      if (contraste(c, fondo) >= minimo) return c;
    }
    /* ni el extremo del tono alcanza: negro o blanco, que siempre llegan */
    return haciaOscuro ? [20, 18, 18, 1] : [255, 255, 255, 1];
  }

  function legibles() {
    var marco = elMarco();
    if (!marco) return;
    ponerCss();

    var nodos = marco.querySelectorAll('*');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el.getAttribute('data-regla-luz')) continue;

      var esCampo = /^(INPUT|TEXTAREA)$/.test(el.tagName);
      if (!esCampo) {
        if (el.children.length) continue;
        if ((el.textContent || '').trim().length < 2) continue;
      }

      var cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (parseFloat(cs.opacity) < 0.15) continue;

      var r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) continue;

      var fondo = fondoReal(el);
      if (!fondo) continue;      /* foto de gente, papel sin medir, o nada opaco */

      var frente = aRGB(cs.color);
      if (!frente || frente[3] < 0.85) continue;

      var px = parseFloat(cs.fontSize) || 14;
      var grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      var minimo = grande ? 3 : 4.5;

      if (contraste(frente, fondo) >= minimo) {
        el.setAttribute('data-regla-luz', 'ok');
        continue;
      }

      var nuevo = corregir(frente, fondo, minimo);
      el.style.setProperty('color', 'rgb(' + nuevo[0] + ',' + nuevo[1] + ',' + nuevo[2] + ')', 'important');
      el.setAttribute('data-regla-luz', 'corregido');
    }
  }


  /* ── el ciclo ─────────────────────────────────────────────────────────── */

  function pasada() {
    if (!elMarco()) return;
    if (!hayDatos()) return;
    sacarLaFrase();
    subirLaCarta();
    taparCrudos();
    legibles();
  }

  function arrancar() {
    pasada();
    var t0 = Date.now();
    var t = setInterval(function () {
      pasada();
      if (Date.now() - t0 > HASTA) clearInterval(t);
    }, CADA);
    window.addEventListener('message', function () { setTimeout(pasada, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
