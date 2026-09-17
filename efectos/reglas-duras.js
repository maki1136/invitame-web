/* ===== LAS REGLAS DURAS DEL MOTOR ===========================================

   POR QUE EXISTE ESTE ARCHIVO  (16/9/2026)

   Maki, despues de que las mismas cosas salieran mal tres veces:

     «la frase sigue asi grande, eliminala directo»
     «hay palabras claras sobre claro»
     «y el blanco sobre el rosita? no se lee una mierda»
     «se lee bien todo? color con color?»

   Estaba todo escrito en la skill, con sus palabras, y se repitio igual. La
   conclusion la eligio el: «las reglas duras adentro del motor» — que el motor
   NO PUEDA pintarlo mal.

   ---------------------------------------------------------------------------
   REGLA 1 — LA FRASE NO SE PINTA SUELTA. NUNCA.
   ⚠️ Vaciar el campo NO alcanza: la seccion seguia trayendo el texto de la boda
      de EJEMPLO. Se esconde la seccion.
   ⚠️ EN PERLAS NO SE TOCA: ahi la frase es EL COLLAR.

   REGLA 2 — LA CARTA VA ARRIBA, DONDE ESTABA LA FRASE
   ⚠️ Los sectores de `secOrden` NO tienen id. Se ancla despues de la ENTRADA.

   REGLA 3 — EL VIDEO Y LA PLAYLIST NUNCA SE VEN CRUDOS
     NO SE TAPA UN PAPEL CON OTRO PAPEL: se esconde con `visibility` y se deja
     pasar una tapa dibujada.

   ---------------------------------------------------------------------------
   REGLA 4 — NINGUN TEXTO ILEGIBLE

   ★ TRES ERRORES PROPIOS, EN ORDEN, QUE VALE LA PENA NO REPETIR ★

   1. MEDIR CONTRA UN COLOR TAPADO.
      Se buscaba el primer ancestro con `background-color` opaco. En el pase con
      QR daba un rosa medio y el corrector ACLARO los textos hasta casi blanco.
      Pero encima hay una IMAGEN: el papel rosa clarisimo. Maki: «no se lee una
      mierda». La correccion lo habia EMPEORADO.
      → **UN `background-color` DEBAJO DE UN `background-image` NO ES EL FONDO.**

   2. DESCARTAR TODO LO QUE TUVIERA IMAGEN.
      El guardia contra fotos descartaba cualquier `background-image` en la
      cadena — y el pase tiene su papel. Corregia 11 cosas y justo las marcadas
      ni las miraba.
      → El guardia va por BLOQUE: sólo `.portada` y `.footer`, que llevan foto
        de gente a pantalla completa.

   3. LEER LOS COLORES CON UNA EXPRESION REGULAR.
      Chrome devuelve `color(srgb 0.69 0.41 0.49 / 0.58)` cuando el color se
      definio en un espacio moderno. Sacar «los numeros» de ahi da 0.69, 0.41,
      0.49 leidos como 0-255: CASI NEGRO. Donde se mide mal, no se corrige — y
      quedaban textos sin evaluar sin que nadie se enterara.
      → **QUE PARSEE EL NAVEGADOR, NO NOSOTROS.** Se pinta el color en un canvas
        de 1x1 y se lee el pixel. Entiende `rgb`, `rgba`, `hsl`, `#hex`,
        `color(srgb …)`, `oklch(…)` y lo que venga, sin tocar nada.

   ★ EL PAPEL SE MIDE DE VERDAD
     Cloudinary sirve con CORS abierto: se pide la MISMA imagen en 1x1 —su color
     promedio— y se lee en canvas. `.../upload/w_1,h_1,c_fill,f_png/v…/x.jpg`.
     Comprobado: el papel del pase es rgb(246,236,234).
     ⚠️ Al armar la URL: si despues de `/upload/` viene `v123456/` la
        transformacion se INSERTA; si viene otra cosa, se REEMPLAZA.

   ★ LOS DEGRADADOS TAMBIEN SE MIDEN
     Antes se descartaban y por eso la cobertura era baja (31 elementos en una
     invitacion de 24 secciones). Ahora se sacan todos los colores del degradado
     y se mide contra EL PEOR — el que menos contrasta con el texto. Si se lee
     sobre el peor tramo, se lee en todo el degradado.

   ★ COLOR SOBRE COLOR  (pedido de Maki, 16/9/2026)
     WCAG mide CLARIDAD, no TONO: un rosa sobre otro rosa puede dar 4.5 y aun
     asi verse embarrado. Cuando texto y fondo comparten tono (menos de 28° de
     diferencia) y los dos tienen color de verdad, se exige mas contraste (+1.5)
     y ademas se le baja la saturacion al texto para despegarlo.

   ★ COMO CORRIGE
     Conserva el TONO y mueve la LUMINOSIDAD hasta alcanzar el minimo. Si ni el
     extremo alcanza, cae a negro o blanco puro, que siempre llegan.

   ★ SE PUEDE AUDITAR
     Deja `window.__REGLA4 = {vistos, corregidos, ok, sinFondo, sinPapel}` para
     poder medir la COBERTURA, no solo los que fallan. Un barrido que revisa
     poco y dice «todo bien» es peor que no revisar.

   ---------------------------------------------------------------------------
   ★★★★★ NO DECIDIR ANTES DE QUE LLEGUEN LOS DATOS ★★★★★

   El motor dibuja primero y `window.INVEV` llega despues. En esa ventana,
   preguntar «¿que coleccion es?» devuelve VACIO: en Perlas contestaba «no es
   Perlas», le escondia la frase — y con ella el collar — y como dejaba su marca
   puesta, no lo volvia a mirar. Misma leccion que `musica.js`.
   → No se hace nada hasta tener los datos, y se puede DESANDAR.

   ⚠️ Y AL VERIFICAR: `todo.php` queda cacheado. Recargar con otro `?cb=` NO lo
      bustea: eso bustea el HTML, no el paquete. Dio falso rojo TRES veces.
      Forzar con `fetch('/efectos/todo.php',{cache:'reload'})` antes de recargar.
   ============================================================================ */
(function () {

  var CADA  = 700;
  var HASTA = 60000;

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


  /* ── REGLA 1 ──────────────────────────────────────────────────────────── */

  function sacarLaFrase() {
    var secs = document.querySelectorAll('.fraseSec, section.frase');
    var cede = loResuelveLaColeccion();
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      var ya = s.getAttribute('data-regla-frase') === 'fuera';
      if (cede) { if (ya) { s.removeAttribute('data-regla-frase'); s.style.display = ''; } continue; }
      if (ya) continue;
      s.setAttribute('data-regla-frase', 'fuera');
      s.style.display = 'none';
    }
  }


  /* ── REGLA 2 ──────────────────────────────────────────────────────────── */

  function finDeLaEntrada() {
    var marco = elMarco();
    if (!marco) return null;
    var ultimo = null, h = marco.children;
    for (var i = 0; i < h.length; i++) {
      var c = ' ' + String(h[i].className || '') + ' ';
      if (c.indexOf(' portada ') >= 0 || c.indexOf(' pase ') >= 0 ||
          c.indexOf(' scratch-sec ') >= 0) ultimo = h[i];
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


  /* ── REGLA 3 ──────────────────────────────────────────────────────────── */

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


  /* ── REGLA 4 ──────────────────────────────────────────────────────────── */

  /* ★ EL NAVEGADOR PARSEA, NOSOTROS NO.
     Se pinta el color en un canvas de 1x1 y se lee el pixel. Asi entiende
     rgb, rgba, hsl, #hex, color(srgb …), oklch(…) y lo que venga. */
  var LIENZO = null;
  function elLienzo() {
    if (!LIENZO) {
      var c = document.createElement('canvas');
      c.width = 1; c.height = 1;
      LIENZO = c.getContext('2d', { willReadFrequently: true });
    }
    return LIENZO;
  }

  function aRGB(txt) {
    if (!txt) return null;
    var s = String(txt).trim();
    if (!s || s === 'none' || s === 'transparent') return null;
    var x = elLienzo();
    if (!x) return null;
    try {
      x.clearRect(0, 0, 1, 1);
      x.fillStyle = '#000000';
      x.fillStyle = s;                 /* si no lo entiende, queda en negro */
      if (x.fillStyle === '#000000' && !/^#0{3,8}$|black|rgba?\(\s*0\s*,\s*0\s*,\s*0/i.test(s)) return null;
      x.globalCompositeOperation = 'copy';
      x.fillRect(0, 0, 1, 1);
      x.globalCompositeOperation = 'source-over';
      var d = x.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    } catch (e) { return null; }
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

  function mezcla(f, b) {
    var a = f[3] === undefined ? 1 : f[3];
    return [f[0] * a + b[0] * (1 - a), f[1] * a + b[1] * (1 - a), f[2] * a + b[2] * (1 - a), 1];
  }

  /* --- el papel de Cloudinary, en 1x1 ------------------------------------ */

  var PAPEL = {};

  function urlDe1px(url) {
    var i = url.indexOf('/upload/');
    if (i < 0) return null;
    var cola = url.slice(i + 8);
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

  /* --- los colores de un degradado --------------------------------------- */

  var RE_COLOR = /#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|color\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)/gi;

  function coloresDe(txt) {
    var out = [], m;
    RE_COLOR.lastIndex = 0;
    while ((m = RE_COLOR.exec(txt))) {
      var c = aRGB(m[0]);
      if (c && c[3] > 0.05) out.push(c);
    }
    return out;
  }

  function laImagenDe(cs) {
    if (!cs.backgroundImage || cs.backgroundImage === 'none') return null;
    var m = String(cs.backgroundImage).match(/url\(["']?([^"')]+)/);
    if (!m) return null;
    if (m[1].indexOf('res.cloudinary.com') < 0) return null;
    return m[1];
  }

  function sobreFoto(el) {
    return !!(el.closest && el.closest('.portada, .footer'));
  }

  /* Devuelve UNA LISTA de fondos posibles. Con un degradado son varios y hay
     que aguantar el peor. `null` = no se puede medir, no se toca. */
  function fondosDe(el) {
    if (sobreFoto(el)) return null;
    var n = el;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);

      var img = laImagenDe(cs);
      if (img) {
        pedirPapel(img);
        var p = PAPEL[img];
        return (p && p !== 'no') ? [p] : null;
      }

      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        var g = coloresDe(cs.backgroundImage);      /* es un degradado */
        if (g.length) return g;
        return null;
      }

      var c = aRGB(cs.backgroundColor);
      if (c && c[3] >= 0.85) return [c];
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

  /* ★ COLOR SOBRE COLOR: mismo tono y los dos con color de verdad. */
  function mismoTono(a, b) {
    var A = aHSL(a), B = aHSL(b);
    if (A[1] < 0.12 || B[1] < 0.12) return false;     /* uno es casi gris */
    var d = Math.abs(A[0] - B[0]);
    if (d > 180) d = 360 - d;
    return d < 28;
  }

  function corregir(frente, fondo, minimo, despegar) {
    var hsl = aHSL(frente);
    var sat = despegar ? Math.max(0, hsl[1] * 0.45) : hsl[1];
    var haciaOscuro = luminancia(fondo) > 0.45;
    for (var paso = 1; paso <= 40; paso++) {
      var l = haciaOscuro ? hsl[2] - paso * 0.025 : hsl[2] + paso * 0.025;
      if (l < 0 || l > 1) break;
      var c = deHSL(hsl[0], sat, l);
      if (contraste(c, fondo) >= minimo) return c;
    }
    return haciaOscuro ? [20, 18, 18, 1] : [255, 255, 255, 1];
  }

  function legibles() {
    var marco = elMarco();
    if (!marco) return;
    ponerCss();

    var cuenta = { vistos: 0, corregidos: 0, ok: 0, sinFondo: 0, sinPapel: 0 };

    var nodos = marco.querySelectorAll('*');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];

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

      if (el.getAttribute('data-regla-luz')) { cuenta.vistos++; continue; }

      var fondos = fondosDe(el);
      if (!fondos) { cuenta.sinFondo++; continue; }

      var crudo = aRGB(cs.color);
      if (!crudo) { cuenta.sinFondo++; continue; }

      var px = parseFloat(cs.fontSize) || 14;
      var grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);

      /* el PEOR de los fondos posibles manda */
      var peor = null, peorV = Infinity, peorMin = 0;
      for (var k = 0; k < fondos.length; k++) {
        var b = fondos[k];
        var f = mezcla(crudo, b);
        var min = grande ? 3 : 4.5;
        if (mismoTono(f, b)) min += 1.5;             /* color sobre color */
        var v = contraste(f, b);
        if (v - min < peorV - peorMin) { peorV = v; peor = b; peorMin = min; }
      }

      cuenta.vistos++;

      if (peorV >= peorMin) { el.setAttribute('data-regla-luz', 'ok'); cuenta.ok++; continue; }

      var frente = mezcla(crudo, peor);
      var nuevo = corregir(frente, peor, peorMin, mismoTono(frente, peor));
      el.style.setProperty('color', 'rgb(' + nuevo[0] + ',' + nuevo[1] + ',' + nuevo[2] + ')', 'important');
      el.setAttribute('data-regla-luz', 'corregido');
      cuenta.corregidos++;
    }

    window.__REGLA4 = cuenta;       /* para poder auditar la COBERTURA */
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
