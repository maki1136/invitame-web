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

   ★★★★★ EL ERROR QUE ESTABA ABAJO DE TODOS LOS DEMAS ★★★★★
   ★ 13. LA MARCA ERA DEFINITIVA. ★  (17/9/2026)

   Durante horas aparecio, se arreglo y VOLVIO A APARECER el mismo defecto en
   distintos botones: «AGENDAR», «Iniciar sesion», «Comenzar trivia»… Cada vez
   parecia un caso nuevo y cada vez el arreglo era correcto — y aun asi el
   siguiente seguia mal.

   La causa no era ninguna de las reglas de color. Era esta linea:

       if (marca) { ...; continue; }     // ← nunca se vuelve a mirar

   El motor dibuja por partes: cuando este modulo pasa, MUCHOS elementos todavia
   no tienen su CSS definitivo. Se los corregia contra el fondo que tenian en ese
   instante — a veces blanco, a veces sin el degradado del boton todavia — se los
   marcaba «corregido», y **la marca los sacaba del barrido para siempre**. El
   fondo cambiaba un segundo despues y el texto quedaba fijado contra un fondo
   que ya no existia. Ninguna medicion posterior lo veia: estaba «resuelto».

   → **Ahora se recuerda contra QUE fondo se corrigio (`data-regla-fondo`) y cual
     era el color ORIGINAL (`data-regla-orig`).** En cada pasada se vuelve a
     calcular el fondo; si cambio, se recorrige **partiendo del color original**,
     no del corregido (si no, cada correccion se apila sobre la anterior y el
     texto se va derivando).

   → Moraleja, la mas cara del dia: **una decision tomada con datos incompletos
     tiene que poder revisarse.** Un cache sin invalidacion no es una
     optimizacion: es un bug que se esconde de sus propias pruebas.

   ---------------------------------------------------------------------------
   ★ LOS OTROS TRECE ERRORES. NO REPETIRLOS. ★
   Los seis primeros son de MEDICION; del 7 al 12, de MODELO.

   1. MEDIR CONTRA UN COLOR TAPADO.
      Un `background-color` debajo de un `background-image` opaco NO es el fondo.

   2. DESCARTAR TODO LO QUE TUVIERA IMAGEN.
      El guardia anti-foto descartaba cualquier `background-image` — y el pase
      tiene su papel. → El guardia va por BLOQUE: sólo `.portada` y `.footer`.

   3. LEER LOS COLORES CON UNA EXPRESION REGULAR.
      Chrome devuelve `color(srgb 0.69 0.41 0.49 / 0.58)`; sacar «los numeros» da
      casi negro. → **QUE PARSEE EL NAVEGADOR:** canvas de 1x1 y leer el pixel.

   4. MEDIR POCO Y CANTAR VICTORIA.
      El primer barrido «completo» reviso 31 de 94 y no fallaba ninguno.
      → Publicar la COBERTURA en `window.__REGLA4`, no solo los errores.

   5. APAGARSE AL MINUTO.
      Revisaba 60 s y paraba. → Observadores, sin fecha de vencimiento.

   6. CREER QUE UNA TEXTURA TAPA EL COLOR DE ABAJO.
      Una imagen con alfa NO reemplaza al color: se COMPONE encima.

   7. CORREGIR EN UNA SOLA DIRECCION.
      Cinco botones quedaron en 4.03 con el piso en 5.0: el corrector decidia
      «hay que aclarar» y **del blanco no se puede pasar**.
      → Prueba las DOS direcciones y se queda con la que alcanza.

   8. NO ENTENDER COMO SE APILAN LAS CAPAS.
      Los botones son terciopelo: tres capas de degradado, algunas con alfa.
      · «el peor color» → trece textos ilegibles.
      · «si hay color opaco, el degradado es volumen» → medi contra el crema.
      · «el promedio de todos los colores juntos» → mezcle alfas que se apilan.
      → Capa por capa, de la ULTIMA a la PRIMERA (en CSS la primera va arriba).

   9. MEDIR `color` CUANDO LO QUE SE VE ES `-webkit-text-fill-color`.

  10. BUSCAR UN TONO DONDE NO EXISTE NINGUNO.
      El fondo de «AGENDAR» es un degradado de rango 0.334: contra eso ningun
      color da 5:1 en toda la pastilla. Al lado, «VER MAPA» se lee perfecto:
      blanco **con sombra**. → Rango > 0.25 o ningun color alcanza: extremo +
      sombra del color contrario.

  11. IGNORAR `background-blend-mode`.
      La textura de «Donde quedarse» mide `rgb(252,252,252)` alfa 1 — blanca y
      opaca — pero va en `multiply`: no tapa el rosa, lo tiñe. El fondo real es
      rosa, no blanco. → Se lee el modo de cada capa y se compone en serio.

  12. TRATAR UN BOTON COMO SI FUERA UNA PAGINA.
      Un boton es una pastilla chica con brillo arriba y sombra abajo: el tono
      medio no se lee. → Control con `background-image`: extremo + sombra.

  14. ★ CONFUNDIR «NO PUEDO MEDIR» CON «NO PUEDO HACER NADA». ★  (17/9/2026)
      Sobre una FOTO el fondo cambia pixel a pixel: no hay un color contra el
      cual medir, y por eso `.portada` y `.footer` quedaban excluidos. Pero
      excluirlos dejo el cierre de Martina con «MARTINA · 28.11.2026» en rosa y
      el credito «INVITACION CREADA CON INVITAME» casi invisibles — mientras
      «¡Gracias!» y «¿Quieres la tuya?», en el MISMO bloque, se leian perfecto
      en blanco con sombra.
      → No hace falta medir para saber que hacer: **se copia lo que ya funciona
        en ese bloque.** Se mira que extremo usan los hermanos que si se leen
        (blanco o negro) y se lleva ahi a los que quedaron en un tono medio,
        con sombra. Los que ya son extremos no se tocan: la portada queda igual.
      → Moraleja: cuando no se puede calcular la respuesta, **mirar la que ya
        esta bien al lado.**

   ★ DE DONDE SALE EL FONDO, EN ORDEN
     · `.portada` y `.footer` → no se mide (foto): se copia el extremo del
       bloque, y sólo para los textos en tono medio (error 14).
     · capas del `background-image`, de la ultima a la primera (error 8), cada
       una compuesta segun su `background-blend-mode` (error 11):
         - imagen medible → 1x1 y leer el pixel CON SU ALFA.
             Cloudinary: `.../upload/w_1,h_1,c_fill,f_png/v…/x.jpg`
             ⚠️ si tras `/upload/` viene `v123456/` la transformacion se INSERTA;
                si viene otra cosa, se REEMPLAZA.
         - degradado → el promedio de sus stops; se anota el RANGO (error 10).
     · color opaco → ese.
     · nada → no se toca.

   ★ COLOR SOBRE COLOR
     WCAG mide CLARIDAD, no TONO. Mismo tono (menos de 28°) y los dos con color
     de verdad → se exige +1.5 y se le baja la saturacion al texto.

   ★ EL PISO NO ES WCAG, ES «SE LEE»
     «Con cariño, te esperamos» daba 3.09 y PASABA (WCAG pide 3 para grande).
     → **5.0 normal · 4.0 grande.** Un escalon arriba de la norma.

   ---------------------------------------------------------------------------
   ★★★★★ MIRAR, NO SOLO MEDIR ★★★★★
   Las capturas encontraron lo que el barrido daba por bueno y el codigo
   encontro lo que el ojo no ve (un 4.03 que parece bien). **Ni el ojo solo ni
   el numero solo alcanzan.** Todos los intentos fallidos pasaban la medicion;
   todos se cayeron de una mirada.

   ⚠️ COMO SE MIRA ESTA INVITACION, QUE TIENE SUS TRAMPAS:
     · Arranca con el SOBRE puesto. Se abre con el boton «Ingresa» y despues el
       sello (`.scene`). Hasta entonces no hay nada que mirar.
     · **`window.scrollTo` NO FUNCIONA acá**: algo lo devuelve a 67 al instante.
       Se baja con la RUEDA, que es lo que hace el invitado.
     · Las secciones entran con `.reveal`: hay que ESPERAR despues de bajar.

   ★★★★★ EL AUDITOR VA APARTE DEL CORRECTOR ★★★★★
   La marca `data-regla-luz` NO prueba nada. Se audita el estado final con
   codigo que no comparte la decision del corrector.

   ★★★★★ NO DECIDIR ANTES DE QUE LLEGUEN LOS DATOS ★★★★★
   `window.INVEV` llega despues del dibujo. No se decide sin datos, y se puede
   DESANDAR. (El error 13 es la version general de esto.)

   ⚠️ AL VERIFICAR: `todo.php` queda cacheado. Otro `?cb=` NO lo bustea.
      `fetch('/efectos/todo.php',{cache:'reload'})` antes de recargar, **y
      reintentar hasta que aparezca el texto nuevo**: el bundle tarda en tomar
      un archivo recien subido, y si no se espera se verifica la version vieja.
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
  var CAMBIO_FONDO = 7;      /* ★ error 13 */
  var CLARO = 0.62, OSCURO = 0.10;   /* ★ error 14: que se considera «extremo» */

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

  /* ★ ERROR 11: componer segun el modo de mezcla de ESA capa. */
  function componer(capa, base, modo) {
    var a = capa[3] === undefined ? 1 : capa[3];
    var out = [0, 0, 0, 1];
    for (var i = 0; i < 3; i++) {
      var f = capa[i], b = base[i], m;
      if (modo === 'multiply')     m = f * b / 255;
      else if (modo === 'screen')  m = 255 - (255 - f) * (255 - b) / 255;
      else if (modo === 'darken')  m = Math.min(f, b);
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

  function aTexto(c) {
    return Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]);
  }

  function deTexto(s) {
    if (!s) return null;
    var p = String(s).split(',');
    if (p.length < 3) return null;
    return [+p[0], +p[1], +p[2], 1];
  }

  function lejos(a, b) {
    if (!a || !b) return true;
    return Math.abs(a[0] - b[0]) > CAMBIO_FONDO ||
           Math.abs(a[1] - b[1]) > CAMBIO_FONDO ||
           Math.abs(a[2] - b[2]) > CAMBIO_FONDO;
  }

  /* ★ ERROR 8: separar en CAPAS (comas de primer nivel). */
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

  /* ★ ERROR 12: un boton no es un parrafo. */
  function esBotonConVolumen(el) {
    var n = el, k = 0;
    while (n && k < 4) {
      var t = n.tagName;
      var cl = ' ' + String(n.className || '') + ' ';
      var ctrl = t === 'BUTTON' || t === 'A' ||
                 (n.getAttribute && n.getAttribute('role') === 'button') ||
                 /\sbtn|btn\s|-btn|\schev\s|tv-btn|\spill\s/.test(cl);
      if (ctrl) {
        var cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      }
      n = n.parentElement; k++;
    }
    return false;
  }

  function elBloqueFoto(el) {
    return el.closest ? el.closest('.portada, .footer') : null;
  }

  /* ★ ERROR 14: no se mide la foto — se copia el extremo que ya usan los
     hermanos que si se leen. */
  function extremoDelBloque(bloque) {
    var guardado = bloque.getAttribute('data-regla-extremo');
    if (guardado) return guardado === 'b' ? BLANCO : NEGRO;
    var claros = 0, oscuros = 0;
    var hs = bloque.querySelectorAll('*');
    for (var i = 0; i < hs.length; i++) {
      if (hs[i].children.length) continue;
      if (!(hs[i].textContent || '').trim()) continue;
      var t = tintaDe(getComputedStyle(hs[i]));
      if (!t) continue;
      var L = luminancia(t);
      if (L > CLARO) claros++;
      else if (L < OSCURO) oscuros++;
    }
    if (!claros && !oscuros) return null;          /* sin referencia: no inventar */
    var r = claros >= oscuros ? 'b' : 'n';
    bloque.setAttribute('data-regla-extremo', r);
    return r === 'b' ? BLANCO : NEGRO;
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

  /* ★ ERROR 7: las DOS direcciones. Dice si ALCANZO el minimo (error 10). */
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
    var ext = contraste(BLANCO, fondo) >= contraste(NEGRO, fondo) ? BLANCO : NEGRO;
    return { c: ext, alcanzo: false };
  }

  function pintar(el, c, conSombra, fondo) {
    var txt = 'rgb(' + aTexto(c) + ')';
    el.style.setProperty('color', txt, 'important');
    el.style.setProperty('-webkit-text-fill-color', txt, 'important');
    if (conSombra) {
      var clara = luminancia(c) > 0.5;
      el.style.setProperty('text-shadow',
        clara ? 'rgba(0,0,0,.45) 0 1px 2px' : 'rgba(255,255,255,.55) 0 1px 2px',
        'important');
    } else {
      el.style.removeProperty('text-shadow');
    }
    el.setAttribute('data-regla-luz', 'corregido');
    el.setAttribute('data-regla-fondo', aTexto(fondo));   /* ★ error 13 */
  }

  function legibles() {
    var marco = elMarco();
    if (!marco) return;
    ponerCss();

    var c = { mirados: 0, resueltos: 0, corregidos: 0, ok: 0,
              foto: 0, fotoArreglados: 0, sinFondo: 0, papelEnCamino: 0,
              conSombra: 0, rehechos: 0 };

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

      /* ★ ERROR 14: sobre foto no se mide, pero se copia lo que ya funciona */
      var bloqueFoto = elBloqueFoto(el);
      if (bloqueFoto) {
        c.foto++;
        if (el.getAttribute('data-regla-luz')) continue;
        var t = tintaDe(cs);
        if (!t) { el.setAttribute('data-regla-luz', 'foto'); continue; }
        var L = luminancia(t);
        if (L > CLARO || L < OSCURO) { el.setAttribute('data-regla-luz', 'foto'); continue; }
        var ext2 = extremoDelBloque(bloqueFoto);
        if (!ext2) { el.setAttribute('data-regla-luz', 'foto'); continue; }
        var txt2 = 'rgb(' + aTexto(ext2) + ')';
        el.style.setProperty('color', txt2, 'important');
        el.style.setProperty('-webkit-text-fill-color', txt2, 'important');
        el.style.setProperty('text-shadow',
          luminancia(ext2) > 0.5 ? 'rgba(0,0,0,.55) 0 1px 3px' : 'rgba(255,255,255,.6) 0 1px 3px',
          'important');
        el.setAttribute('data-regla-luz', 'foto');
        c.fotoArreglados++;
        continue;
      }

      var fondos = fondosDe(el);
      if (!fondos) { c.papelEnCamino++; continue; }

      /* ★★★ ERROR 13: la marca NO es definitiva. */
      var marca   = el.getAttribute('data-regla-luz');
      var antes   = deTexto(el.getAttribute('data-regla-fondo'));
      var cambio  = marca && lejos(antes, fondos[0]);
      if (marca && !cambio) {
        c.resueltos++; if (marca === 'ok') c.ok++; else c.corregidos++;
        continue;
      }
      if (cambio) c.rehechos++;

      var orig = deTexto(el.getAttribute('data-regla-orig'));
      var crudo;
      if (orig) crudo = orig;
      else {
        crudo = tintaDe(cs);
        if (!crudo) { c.sinFondo++; continue; }
        el.setAttribute('data-regla-orig', aTexto(crudo));
      }

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

      /* ★ ERRORES 10 y 12: rango amplio o boton con volumen → extremo + sombra */
      if ((fondos.rango || 0) > RANGO_AMPLIO || esBotonConVolumen(el)) {
        var ext = contraste(BLANCO, peor) >= contraste(NEGRO, peor) ? BLANCO : NEGRO;
        pintar(el, ext, true, fondos[0]); c.corregidos++; c.conSombra++;
        continue;
      }

      if (peorV >= peorMin) {
        el.style.removeProperty('color');
        el.style.removeProperty('-webkit-text-fill-color');
        el.style.removeProperty('text-shadow');
        el.setAttribute('data-regla-luz', 'ok');
        el.setAttribute('data-regla-fondo', aTexto(fondos[0]));
        c.ok++;
        continue;
      }

      var frente = mezcla(crudo, peor);
      var res = corregir(frente, peor, peorMin, mismoTono(frente, peor));
      pintar(el, res.c, !res.alcanzo, fondos[0]);
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
