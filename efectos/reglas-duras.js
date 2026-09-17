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

   ★ ONCE ERRORES PROPIOS. NO REPETIRLOS. ★
   Los seis primeros son de medicion; los cinco ultimos, de MODELO: creer que se
   sabe como pinta el navegador sin haberlo mirado.

   1. MEDIR CONTRA UN COLOR TAPADO.
      Un `background-color` debajo de un `background-image` opaco NO es el fondo.
      El corrector aclaro los textos hasta casi blanco sobre papel clarisimo.

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

   6. ★ CREER QUE UNA TEXTURA TAPA EL COLOR DE ABAJO. ★
      Una imagen con alfa NO reemplaza al color: se COMPONE encima.

   7. ★ CORREGIR EN UNA SOLA DIRECCION. ★
      Cinco botones quedaron en 4.03 con el piso en 5.0 — «Liverpool», «Amazon»,
      «Palacio de Hierro», «Abrir la camara», «Entrar a la galeria». Eran blancos
      sobre el rosa `#b06a7e`: el corrector miraba la luminancia del fondo,
      decidia «hay que aclarar», y **del blanco no se puede pasar**.
      → Prueba **las dos direcciones** y se queda con la que alcanza.

   8. ★★★ NO ENTENDER COMO SE APILAN LAS CAPAS. ★★★
      **De aca salio «el blanco sobre el rosita no se lee una mierda».** Los
      botones de Invitame son terciopelo: `background-image` con TRES capas de
      degradado apiladas, algunas con alfa.
      · Intento 1 — «el fondo es el PEOR color». Trece textos ilegibles.
      · Intento 2 — «si hay color opaco debajo, el degradado es volumen». Medi
        contra el crema, pero el degradado SI se ve.
      · Intento 3 — «el promedio de TODOS los colores juntos». Promedie capas
        distintas, mezclando alfas que en realidad se APILAN.
      → **Las capas se apilan**: se separa el `background-image` en capas (comas
        de primer nivel), se promedian los stops de CADA capa, y se componen de
        la ULTIMA a la PRIMERA — en CSS la primera declarada se pinta arriba.

   9. ★ MEDIR `color` CUANDO LO QUE SE VE ES `-webkit-text-fill-color`. ★
      `.btn.gh` tenia `color: rgb(176,106,126)` y fill bordo: el ojo ve el FILL.
      → Se mide el fill cuando existe; se escriben los dos.

  10. ★★★ BUSCAR UN TONO DONDE NO EXISTE NINGUNO. ★★★
      El boton «AGENDAR» (`.btn.gh`) quedo dorado sobre dorado hasta el cuarto
      intento. Medido: su fondo es un degradado de **rango 0.334** de luminancia
      (stops en 0.398, 0.128 y 0.064). Contra un rango asi **NO EXISTE ningun
      color de texto** que de 5:1 en toda la pastilla: blanco da 2.2 contra el
      brillo, negro da 3.9 contra la sombra. El corrector buscaba un tono
      intermedio que no podia existir y se quedaba con «el menos malo».
      Al lado, «VER MAPA» — el MISMO boton — se lee perfecto: blanco **con
      `text-shadow: rgba(0,0,0,.42) 0 1px 2px`**. La sombra es lo que lo salva.
      → **Si el rango del fondo supera 0.25, o si ningun color llega al minimo:
        extremo (blanco o negro) + SOMBRA del color contrario.**
      → Moraleja: **antes de buscar mejor, preguntarse si lo que se busca puede
        existir.** Y si algo parecido ya funciona en la misma pantalla, copiarlo
        en vez de inventar.

  11. ★★★ IGNORAR `background-blend-mode`. ★★★  (17/9/2026)
      **Este dejo «Donde quedarse» ilegible hasta el final.** La seccion tiene
      `background-color: rgb(176,106,126)` — rosa — y encima la textura
      `/i/tex-*.png`, que medida da `rgb(252,252,252)` con **alfa 1**: blanca y
      opaca. Con eso, el fondo calculado daba BLANCO, y el corrector dejaba los
      titulos en dorado oscuro y gris… que sobre el rosa real no se leen.
      Lo que faltaba mirar: **`background-blend-mode: multiply`**. La textura no
      tapa el rosa, lo MULTIPLICA: 252 × 176 / 255 = 174. El fondo real es rosa.
      → Se lee `backgroundBlendMode` (un modo por capa, separados por coma) y se
        compone segun corresponda: `multiply` = producto, `screen` = inverso del
        producto de los inversos, el resto = normal.
      → Moraleja: **una capa opaca no siempre tapa.** Antes de dar por cerrado
        «de que color es el fondo», mirar TODAS las propiedades que participan
        del pintado, no sólo color e imagen.

   ★ DE DONDE SALE EL FONDO, EN ORDEN
     · `.portada` y `.footer` → NO SE TOCAN (foto de gente, texto con sombra).
     · capas del `background-image`, **de la ultima a la primera** (error 8),
       cada una compuesta segun su `background-blend-mode` (error 11):
         - imagen medible → 1x1 y leer el pixel CON SU ALFA.
             Cloudinary: `.../upload/w_1,h_1,c_fill,f_png/v…/x.jpg`
             ⚠️ si tras `/upload/` viene `v123456/` la transformacion se INSERTA;
                si viene otra cosa, se REEMPLAZA.
         - degradado → el promedio de sus stops; se anota ademas el RANGO de
           luminancia para el error 10.
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
   Las capturas encontraron lo que el barrido daba por bueno (la seccion de
   hospedaje entera, «AGENDAR» dorado sobre dorado) y el codigo encontro lo que
   el ojo no ve (un 4.03 que parece bien). **Ni el ojo solo ni el numero solo
   alcanzan.** Todos los intentos fallidos de los errores 8, 10 y 11 pasaban la
   medicion; todos se cayeron de una mirada.

   ⚠️ COMO SE MIRA ESTA INVITACION, QUE TIENE SUS TRAMPAS:
     · Arranca con el SOBRE puesto. Se abre con el boton «Ingresa» y despues el
       sello (`.scene`). Hasta entonces no hay nada que mirar.
     · **`window.scrollTo` NO FUNCIONA acá**: algo lo devuelve a 67 al instante.
       Se baja con la RUEDA, que es lo que hace el invitado. Un barrido de scroll
       programatico da la sensacion de haber recorrido todo sin moverse un pixel.
     · Las secciones entran con `.reveal`: hay que ESPERAR despues de bajar, o la
       captura sale velada y parece un problema de contraste que no existe.

   ★★★★★ EL AUDITOR VA APARTE DEL CORRECTOR ★★★★★
   La marca `data-regla-luz="corregido"` NO prueba nada: los trece textos del
   error 8 estaban marcados. **Se audita el estado final con codigo que no
   comparte la decision del corrector**, y recien ahi se cuenta.

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
  var RANGO_AMPLIO = 0.25;   /* ★ error 10 */

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
    if (!s || s === 'none' || s === 'transparent' || s === 'currentcolor') return null;
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

  /* ★ ERROR 9: el ojo ve el fill, no `color`. */
  function tintaDe(cs) {
    var f = aRGB(cs.webkitTextFillColor);
    if (f) return f;
    return aRGB(cs.color);
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

  /* ★★★ ERROR 11: componer segun el modo de mezcla de ESA capa. */
  function componer(capa, base, modo) {
    var a = capa[3] === undefined ? 1 : capa[3];
    var out = [0, 0, 0, 1];
    for (var i = 0; i < 3; i++) {
      var f = capa[i], b = base[i], m;
      if (modo === 'multiply')    m = f * b / 255;
      else if (modo === 'screen') m = 255 - (255 - f) * (255 - b) / 255;
      else if (modo === 'darken') m = Math.min(f, b);
      else if (modo === 'lighten') m = Math.max(f, b);
      else m = f;
      out[i] = m * a + b * (1 - a);
    }
    return out;
  }

  function mezcla(f, b) { return componer(f, b, 'normal'); }

  function promedio(lista) {
    var r = 0, g = 0, b = 0, a = 0, n = lista.length;
    for (var i = 0; i < n; i++) {
      r += lista[i][0]; g += lista[i][1]; b += lista[i][2];
      a += (lista[i][3] === undefined ? 1 : lista[i][3]);
    }
    return [r / n, g / n, b / n, a / n];
  }

  /* ★★★ ERROR 8: separar en CAPAS. Las comas de adentro de `rgba(...)` o de
     `linear-gradient(...)` NO separan capas: sólo las de primer nivel. */
  function capasDe(bi) {
    var out = [], nivel = 0, act = '';
    for (var i = 0; i < bi.length; i++) {
      var ch = bi.charAt(i);
      if (ch === '(') nivel++;
      else if (ch === ')') nivel--;
      if (ch === ',' && nivel === 0) { out.push(act); act = ''; continue; }
      act += ch;
    }
    if (act.replace(/\s/g, '')) out.push(act);
    return out;
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

  function sobreFoto(el) {
    return !!(el.closest && el.closest('.portada, .footer'));
  }

  function colorDebajo(desde) {
    var n = desde;
    while (n && n !== document.documentElement) {
      var c = aRGB(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.85) return c;
      n = n.parentElement;
    }
    return [255, 255, 255, 1];
  }

  /* Devuelve [color] y, en `.rango`, la diferencia de luminancia de los stops. */
  function fondosDe(el) {
    if (sobreFoto(el)) return null;
    var n = el;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);
      var propio = aRGB(cs.backgroundColor);
      var opaco  = propio && propio[3] >= 0.85 ? propio : null;
      var bi     = cs.backgroundImage;

      if (bi && bi !== 'none') {
        var capas = capasDe(bi);
        var modos = String(cs.backgroundBlendMode || 'normal').split(',');
        var base  = opaco || colorDebajo(n.parentElement || n);
        var algo  = false, minL = 1, maxL = 0;
        /* ★ de la ULTIMA a la PRIMERA: en CSS la primera se pinta arriba */
        for (var q = capas.length - 1; q >= 0; q--) {
          var capa = capas[q];
          var modo = (modos[q % modos.length] || 'normal').trim();
          var mu = capa.match(/url\(["']?([^"')]+)/);
          if (mu) {
            pedirPapel(mu[1]);
            var p = PAPEL[mu[1]];
            if (!p || p === 'no') return null;   /* falta un dato: no se decide */
            base = componer(p, base, modo); algo = true;
            var lp = luminancia(base);
            if (lp < minL) minL = lp;
            if (lp > maxL) maxL = lp;
            continue;
          }
          var cols = coloresDe(capa);
          if (!cols.length) continue;
          for (var w = 0; w < cols.length; w++) {
            var lw = luminancia(componer(cols[w], base, modo));
            if (lw < minL) minL = lw;
            if (lw > maxL) maxL = lw;
          }
          base = componer(promedio(cols), base, modo);
          algo = true;
        }
        if (!algo) return opaco ? [opaco] : null;
        var r1 = [base];
        r1.rango = maxL - minL;
        return r1;
      }

      if (opaco) { var r2 = [opaco]; r2.rango = 0; return r2; }
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

  var NEGRO  = [20, 18, 18, 1];
  var BLANCO = [255, 255, 255, 1];

  /* ★ ERROR 7: las DOS direcciones. Devuelve si ALCANZO el minimo (error 10). */
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
      var cerca = Math.abs(aHSL(a.c)[2] - hsl[2]) <= Math.abs(aHSL(b.c)[2] - hsl[2]) ? a.c : b.c;
      return { c: cerca, alcanzo: true };
    }
    if (a.v >= minimo) return { c: a.c, alcanzo: true };
    if (b.v >= minimo) return { c: b.c, alcanzo: true };
    /* ningun tono llega: extremo + sombra */
    var ext = contraste(BLANCO, fondo) >= contraste(NEGRO, fondo) ? BLANCO : NEGRO;
    return { c: ext, alcanzo: false };
  }

  function pintar(el, c, conSombra) {
    var txt = 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')';
    el.style.setProperty('color', txt, 'important');
    el.style.setProperty('-webkit-text-fill-color', txt, 'important');
    if (conSombra) {
      /* la misma receta del boton que SI se lee */
      var clara = luminancia(c) > 0.5;
      el.style.setProperty('text-shadow',
        clara ? 'rgba(0,0,0,.45) 0 1px 2px' : 'rgba(255,255,255,.55) 0 1px 2px',
        'important');
    }
    el.setAttribute('data-regla-luz', 'corregido');
  }

  function legibles() {
    var marco = elMarco();
    if (!marco) return;
    ponerCss();

    var c = { mirados: 0, resueltos: 0, corregidos: 0, ok: 0,
              foto: 0, sinFondo: 0, papelEnCamino: 0, conSombra: 0 };

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

      var crudo = tintaDe(cs);
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

      /* ★★★ ERROR 10: fondo de rango amplio → no existe tono. Extremo + sombra. */
      if ((fondos.rango || 0) > RANGO_AMPLIO) {
        var ext = contraste(BLANCO, peor) >= contraste(NEGRO, peor) ? BLANCO : NEGRO;
        pintar(el, ext, true); c.corregidos++; c.conSombra++;
        continue;
      }

      if (peorV >= peorMin) { el.setAttribute('data-regla-luz', 'ok'); c.ok++; continue; }

      var frente = mezcla(crudo, peor);
      var res = corregir(frente, peor, peorMin, mismoTono(frente, peor));
      pintar(el, res.c, !res.alcanzo);
      c.corregidos++;
      if (!res.alcanzo) c.conSombra++;
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
