/* ===== LAS REGLAS DURAS DEL MOTOR ===========================================

   POR QUE EXISTE ESTE ARCHIVO  (16-17/9/2026)

   Maki, despues de que las mismas cosas salieran mal varias veces:

     «la frase sigue asi grande, eliminala directo»
     «hay palabras claras sobre claro»
     «y el blanco sobre el rosita? no se lee una mierda»
     «la revisaste? se lee bien todo? color con color?»
     «no podes verlo en tu navegador? o no queres hacerlo?»
     «mira todo siempre y arregla todo siempre sin frenar ni preguntar»

   ---------------------------------------------------------------------------
   REGLA 1 — LA FRASE NO SE PINTA SUELTA. NUNCA.
   ⚠️ Vaciar el campo NO alcanza: la seccion traia el texto de la boda de EJEMPLO.
   ⚠️ EN PERLAS NO SE TOCA: ahi la frase es EL COLLAR.

   REGLA 2 — LA CARTA VA ARRIBA, DONDE ESTABA LA FRASE
   ⚠️ Los sectores de `secOrden` NO tienen id. Se ancla despues de la ENTRADA.

   REGLA 3 — EL VIDEO Y LA PLAYLIST NUNCA SE VEN CRUDOS
     NO SE TAPA UN PAPEL CON OTRO PAPEL: `visibility` + tapa dibujada.

   ---------------------------------------------------------------------------
   REGLA 4 — NINGUN TEXTO ILEGIBLE

   ★ SIETE ERRORES PROPIOS. NO REPETIRLOS. ★

   1. MEDIR CONTRA UN COLOR TAPADO.
      **Un `background-color` debajo de un `background-image` opaco NO es el fondo.**
      Midiendo el color de abajo, el corrector ACLARO los textos hasta casi blanco
      sobre un papel clarisimo. Lo EMPEORO.

   2. DESCARTAR TODO LO QUE TUVIERA IMAGEN.
      El guardia anti-foto descartaba cualquier `background-image` — y el pase
      tiene su papel. Corregia 11 cosas y las marcadas ni las miraba.
      → El guardia va por BLOQUE: sólo `.portada` y `.footer`.

   3. LEER LOS COLORES CON UNA EXPRESION REGULAR.
      Chrome devuelve `color(srgb 0.69 0.41 0.49 / 0.58)`; sacar «los numeros» da
      casi negro. Donde se mide mal, NO SE CORRIGE, en silencio.
      → **QUE PARSEE EL NAVEGADOR:** canvas de 1x1 y leer el pixel.

   4. MEDIR POCO Y CANTAR VICTORIA.
      El primer barrido «completo» reviso 31 de 94 y no fallaba ninguno.
      → Publicar la COBERTURA en `window.__REGLA4`, no solo los errores.

   5. APAGARSE AL MINUTO.
      Revisaba 60 s y paraba: lo que aparecia despues quedaba sin corregir para
      siempre (los numeros del pase, en blanco puro, contraste 1.16).
      → `IntersectionObserver` + `MutationObserver`. Sin fecha de vencimiento.
      → **Un proceso que caduca deja agujeros que ninguna medicion posterior ve.**

   6. ★ CREER QUE UNA TEXTURA TAPA EL COLOR DE ABAJO. ★  (17/9/2026)
      «Donde quedarse» quedo ilegible: kicker dorado, titulo gris y parrafo
      verdoso sobre el papel ROSA OSCURO. El modulo decia «corregido».
      La causa: esa seccion tiene `background-color: rgb(176,106,126)` **y encima**
      `background-image: /i/tex-*.png`, que es una textura **CON ALFA**. Se estaba
      midiendo la textura SOLA — clarita — y el corrector llevo el texto a gris
      medio, que sobre el rosa real no se ve.
      → **Una imagen con alfa NO reemplaza al color: se COMPONE encima.**
        Ahora se lee tambien el canal alfa del papel y, si es translucido, se
        mezcla con el color que tiene debajo.

   7. ★ CORREGIR EN UNA SOLA DIRECCION. ★  (17/9/2026)
      Cinco botones quedaron en 4.03 con el piso en 5.0 — «Liverpool», «Amazon»,
      «Palacio de Hierro», «Abrir la camara», «Entrar a la galeria» — todos
      marcados «corregido». Eran blancos sobre el rosa `#b06a7e`: el corrector
      miraba la luminancia del fondo, decidia «hay que aclarar», y **del blanco no
      se puede pasar**. Se quedaba corto y se daba por hecho.
      → Ahora prueba **las dos direcciones** y se queda con la que alcanza. Sobre
        ese rosa, oscurecer sí llega.

   ★ DE DONDE SALE EL FONDO, EN ORDEN
     · `.portada` y `.footer` → NO SE TOCAN (foto de gente, texto con sombra).
     · imagen medible → 1x1 y leer el pixel CON SU ALFA; si es translucida, se
       compone sobre lo que haya debajo.
         - Cloudinary: `.../upload/w_1,h_1,c_fill,f_png/v…/x.jpg`
           ⚠️ si tras `/upload/` viene `v123456/` la transformacion se INSERTA;
              si viene otra cosa, se REEMPLAZA.
         - texturas propias y `data:` → se dibuja escalada a 1x1.
     · degradado → todos sus colores, y se mide contra EL PEOR.
     · color opaco → ese.
     · nada → no se toca.

   ★ COLOR SOBRE COLOR
     WCAG mide CLARIDAD, no TONO. Mismo tono (menos de 28°) y los dos con color
     de verdad → se exige +1.5 y se le baja la saturacion al texto.

   ★ EL PISO NO ES WCAG, ES «SE LEE»
     «Con cariño, te esperamos» daba 3.09 y PASABA (WCAG pide 3 para texto
     grande). Maki lo miro y dijo que no se lee.
     → **5.0 normal · 4.0 grande.** Un escalon arriba de la norma.

   ---------------------------------------------------------------------------
   ★★★★★ MIRAR, NO SOLO MEDIR ★★★★★
   Las capturas encontraron cosas que el barrido daba por buenas (la seccion de
   hospedaje entera, el boton «Agendar» dorado sobre dorado) y el codigo encontro
   cosas que el ojo no ve (un 4.03 que parece bien). **Ni el ojo solo ni el numero
   solo alcanzan: hay que cruzarlos.**
   ⚠️ `scrollIntoView` NO sirve acá: scrollea el documento, no el contenedor.
      `window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)`.
   ⚠️ Y esperar: una captura durante el fundido del sobre muestra todo velado.

   ★★★★★ NO DECIDIR ANTES DE QUE LLEGUEN LOS DATOS ★★★★★
   `window.INVEV` llega despues del dibujo. En esa ventana «¿que coleccion es?»
   devuelve VACIO: en Perlas contestaba «no es Perlas» y le sacaba el collar.
   → No se decide sin datos, y se puede DESANDAR.

   ⚠️ AL VERIFICAR: `todo.php` queda cacheado. Otro `?cb=` NO lo bustea.
      `fetch('/efectos/todo.php',{cache:'reload'})` antes de recargar.
   ============================================================================ */
(function () {

  var CADA = 700;

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

  var MIN_NORMAL = 5.0;
  var MIN_GRANDE = 4.0;

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
      x.fillStyle = s;
      if (x.fillStyle === '#000000' &&
          !/^#0{3,8}$|black|rgba?\(\s*0\s*,\s*0\s*,\s*0/i.test(s)) return null;
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

  /* --- el papel, CON SU ALFA ---------------------------------------------- */

  var PAPEL = {};

  function esCloudinary(u) { return u.indexOf('res.cloudinary.com') >= 0; }

  function sePuedeMedir(u) {
    if (u.indexOf('data:') === 0) return true;
    if (esCloudinary(u)) return true;
    if (u.indexOf('//') < 0) return true;
    return u.indexOf(location.origin) === 0;
  }

  function urlDe1px(url) {
    if (!esCloudinary(url)) return url;
    var i = url.indexOf('/upload/');
    if (i < 0) return url;
    var cola = url.slice(i + 8);
    if (!/^v\d+\//.test(cola)) cola = cola.replace(/^[^/]*\//, '');
    return url.slice(0, i + 8) + 'w_1,h_1,c_fill,f_png/' + cola;
  }

  function pedirPapel(url) {
    if (PAPEL[url] !== undefined) return;
    if (!sePuedeMedir(url)) { PAPEL[url] = false; return; }
    PAPEL[url] = 'no';
    var im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () {
      try {
        var c = document.createElement('canvas'); c.width = 1; c.height = 1;
        var x = c.getContext('2d');
        x.clearRect(0, 0, 1, 1);
        x.drawImage(im, 0, 0, 1, 1);
        var d = x.getImageData(0, 0, 1, 1).data;
        /* ⚠️ EL ALFA IMPORTA: una textura translucida NO reemplaza al color de
           abajo. Se guarda tal cual y se compone despues. */
        PAPEL[url] = [d[0], d[1], d[2], d[3] / 255];
        pasada();
      } catch (e) { PAPEL[url] = false; }
    };
    im.onerror = function () { PAPEL[url] = false; };
    im.src = urlDe1px(url);
  }

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
    return m ? m[1] : null;
  }

  function sobreFoto(el) {
    return !!(el.closest && el.closest('.portada, .footer'));
  }

  /* Lo que hay DEBAJO de `desde` (sin contar su propia imagen). */
  function colorDebajo(desde) {
    var n = desde;
    while (n && n !== document.documentElement) {
      var c = aRGB(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.85) return c;
      n = n.parentElement;
    }
    return [255, 255, 255, 1];
  }

  function fondosDe(el) {
    if (sobreFoto(el)) return null;
    var n = el;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);

      var img = laImagenDe(cs);
      if (img) {
        pedirPapel(img);
        var p = PAPEL[img];
        if (!p || p === 'no') return null;
        /* ★ si la textura es translucida, se COMPONE sobre lo de abajo */
        if (p[3] < 0.95) return [mezcla(p, colorDebajo(n))];
        return [p];
      }

      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        var g = coloresDe(cs.backgroundImage);
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

  function mismoTono(a, b) {
    var A = aHSL(a), B = aHSL(b);
    if (A[1] < 0.12 || B[1] < 0.12) return false;
    var d = Math.abs(A[0] - B[0]);
    if (d > 180) d = 360 - d;
    return d < 28;
  }

  /* ★ Prueba LAS DOS DIRECCIONES. Del blanco no se puede seguir aclarando: si
     sólo se mira la luminancia del fondo, sobre un rosa medio el corrector se
     queda en blanco y en 4.03 para siempre. */
  function corregir(frente, fondo, minimo, despegar) {
    var hsl = aHSL(frente);
    var sat = despegar ? Math.max(0, hsl[1] * 0.45) : hsl[1];

    function buscar(haciaOscuro) {
      var mejorC = null, mejorV = -1;
      for (var paso = 1; paso <= 40; paso++) {
        var l = haciaOscuro ? hsl[2] - paso * 0.025 : hsl[2] + paso * 0.025;
        if (l < 0 || l > 1) break;
        var c = deHSL(hsl[0], sat, l);
        var v = contraste(c, fondo);
        if (v > mejorV) { mejorV = v; mejorC = c; }
        if (v >= minimo) return { c: c, v: v };
      }
      return { c: mejorC, v: mejorV };
    }

    var a = buscar(true), b = buscar(false);
    if (a.v >= minimo && b.v >= minimo) {
      /* las dos llegan: la que menos se aleja del color original */
      return Math.abs(aHSL(a.c)[2] - hsl[2]) <= Math.abs(aHSL(b.c)[2] - hsl[2]) ? a.c : b.c;
    }
    if (a.v >= minimo) return a.c;
    if (b.v >= minimo) return b.c;
    /* ninguna llega por tono: negro o blanco, el que mas contraste da */
    var neg = [20, 18, 18, 1], bla = [255, 255, 255, 1];
    return contraste(neg, fondo) >= contraste(bla, fondo) ? neg : bla;
  }

  function legibles() {
    var marco = elMarco();
    if (!marco) return;
    ponerCss();

    var c = { mirados: 0, resueltos: 0, corregidos: 0, ok: 0,
              foto: 0, sinFondo: 0, papelEnCamino: 0 };

    var nodos = marco.querySelectorAll('*');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];

      var esCampo = /^(INPUT|TEXTAREA)$/.test(el.tagName);
      if (!esCampo) {
        if (el.children.length) continue;
        if ((el.textContent || '').trim().length < 1) continue;
      }

      var cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;

      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;

      c.mirados++;

      var marca = el.getAttribute('data-regla-luz');
      if (marca) { c.resueltos++; if (marca === 'ok') c.ok++; else c.corregidos++; continue; }

      if (sobreFoto(el)) { c.foto++; continue; }

      var fondos = fondosDe(el);
      if (!fondos) { c.papelEnCamino++; continue; }

      var crudo = aRGB(cs.color);
      if (!crudo) { c.sinFondo++; continue; }

      var px = parseFloat(cs.fontSize) || 14;
      var grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);

      var peor = null, peorV = Infinity, peorMin = 0;
      for (var k = 0; k < fondos.length; k++) {
        var b = fondos[k];
        var f = mezcla(crudo, b);
        var min = grande ? MIN_GRANDE : MIN_NORMAL;
        if (mismoTono(f, b)) min += 1.5;
        var v = contraste(f, b);
        if (v - min < peorV - peorMin) { peorV = v; peor = b; peorMin = min; }
      }

      c.resueltos++;

      if (peorV >= peorMin) { el.setAttribute('data-regla-luz', 'ok'); c.ok++; continue; }

      var frente = mezcla(crudo, peor);
      var nuevo = corregir(frente, peor, peorMin, mismoTono(frente, peor));
      el.style.setProperty('color', 'rgb(' + nuevo[0] + ',' + nuevo[1] + ',' + nuevo[2] + ')', 'important');
      el.style.setProperty('-webkit-text-fill-color', 'rgb(' + nuevo[0] + ',' + nuevo[1] + ',' + nuevo[2] + ')', 'important');
      el.setAttribute('data-regla-luz', 'corregido');
      c.corregidos++;
    }

    window.__REGLA4 = c;
  }


  /* ── el ciclo: SIN FECHA DE VENCIMIENTO ───────────────────────────────── */

  var pendiente = null;
  function pasada() {
    if (pendiente) return;
    pendiente = setTimeout(function () {
      pendiente = null;
      if (!elMarco()) return;
      if (!hayDatos()) return;
      sacarLaFrase();
      subirLaCarta();
      taparCrudos();
      legibles();
    }, 60);
  }

  function observar() {
    var marco = elMarco();
    if (!marco) return;

    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { pasada(); break; }
      }, { rootMargin: '600px' });
      [].forEach.call(marco.children, function (n) { io.observe(n); });
    }

    if (window.MutationObserver) {
      new MutationObserver(function () { pasada(); })
        .observe(marco, { childList: true, subtree: true, attributes: true,
                          attributeFilter: ['style', 'class'] });
    }

    window.addEventListener('scroll', pasada, { passive: true });
    window.addEventListener('resize', pasada);
    window.addEventListener('message', pasada);
  }

  function arrancar() {
    pasada();
    observar();
    var n = 0;
    var t = setInterval(function () {
      pasada();
      if (++n > 40) { clearInterval(t); observar(); }
    }, CADA);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
