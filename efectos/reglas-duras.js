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
   ★ 13. MARCAR COMO RESUELTO LO QUE TODAVIA NO SE PUDO RESOLVER. ★ (17/9/2026)

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

   → **Se recuerda contra QUE fondo se corrigio (`data-regla-fondo`) y cual era
     el color ORIGINAL (`data-regla-orig`).** En cada pasada se recalcula el
     fondo; si cambio, se recorrige **partiendo del original**, no del corregido
     (si no, cada correccion se apila y el texto se va derivando).

   ⚠️ Y ME VOLVIO A PASAR EN EL MISMO DIA: al escribir la rama del error 14 puse
      `el.setAttribute('data-regla-luz','foto')` tambien en los caminos de
      SALIDA — «no pude leer el color», «todavia no hay referencia en el
      bloque» — y el cierre quedo sin arreglar, marcado como listo. El error no
      es el cache: es **usar la misma marca para "ya esta" y para "no pude"**.
      → Solo se marca lo que se RESOLVIO. Lo que no se pudo, se reintenta.

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

  14. CONFUNDIR «NO PUEDO MEDIR» CON «NO PUEDO HACER NADA».
      Sobre una FOTO el fondo cambia pixel a pixel: no hay un color contra el
      cual medir, y por eso `.portada` y `.footer` quedaban excluidos. Pero
      excluirlos dejo el cierre con «Martina · 28.11.2026» en rosa y el credito
      «invitacion creada con Invitame» casi invisibles — mientras «¡Gracias!» y
      «¿Quieres la tuya?», en el MISMO bloque, se leian perfecto en blanco.
      → No hace falta medir para saber que hacer: **se copia lo que ya funciona
        en ese bloque.** Se mira que extremo usan los hermanos que si se leen y
        se lleva ahi a los que quedaron en tono medio, con sombra. Los que ya
        son extremos no se tocan: la portada queda igual.
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
      '[data-crudo]{position:relative}',
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
    /* ⚠️⚠️ SI EL INVITADO YA LA ABRIO, NO SE VUELVE A TAPAR NUNCA MAS.
       (17/9/2026) Sin esta linea la playlist y el video eran IMPOSIBLES de ver:
       el invitado tocaba la tapa, el reproductor aparecia medio segundo y la
       tapa volvia. La culpa no era del click: era que `pasada()` corre con cada
       cambio de clase o de atributo del marco — y quitar la tapa ES un cambio.
       Asi que el propio click se disparaba a si mismo el modulo que lo deshacia.
       → El estado «abierto» tiene que quedar ESCRITO en el DOM, porque es el
         unico lugar que sobrevive a la siguiente pasada. */
    if (caja.getAttribute('data-crudo') === 'abierto') return;
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
      caja.setAttribute('data-crudo', 'abierto');   /* queda abierta PARA SIEMPRE */
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

  /* ⚠️⚠️ ERROR 19 — «ESTÁ SOBRE UNA FOTO» NO ES LO MISMO QUE «HAY UNA FOTO». (17/9/2026)
     Esta función daba por foto CUALQUIER cosa dentro de `.portada` o `.footer`,
     por el nombre del bloque. En Marfil la portada es sólo tipográfica y el pie
     no tiene foto de cierre: son PAPEL. Y arriba, la rama de foto marca
     `data-regla-luz="foto"` y se va cuando la tinta es un extremo — así que
     «Invitación creada con InvitaME» quedó en BLANCO PURO sobre el papel marfil
     (contraste 1,32) y los dos puntos de la cuenta regresiva en 1,15, los dos
     marcados como resueltos. Es el blanco sobre blanco que vio Maki.
     → Un bloque es foto sólo si HAY una imagen puesta: fondo con imagen, o un
       img/video/canvas que cubra el bloque de verdad. Si no, es papel y se mide. */
  function hayFotoEn(bloque) {
    if (!bloque) return false;
    var cs = getComputedStyle(bloque);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
    var caja = bloque.getBoundingClientRect();
    var area = caja.width * caja.height;
    if (area <= 0) return false;
    var media = bloque.querySelectorAll('img, video, canvas');
    for (var i = 0; i < media.length; i++) {
      var rm = media[i].getBoundingClientRect();
      if (rm.width * rm.height > area * 0.3) return true;
    }
    /* ⚠️⚠️ Y LA FOTO PUEDE SER EL FONDO DE UN HIJO, NO DEL BLOQUE. (17/9/2026)
       Esto fue una regresión mía el mismo día: al escribir el error 19 miré el
       `background-image` del bloque nada más. La portada NO lleva la foto: la
       lleva `.pbg`, un div adentro. Resultado: la portada de Valentina se midió
       contra el papel y los textos CLAROS del diseño —que se leían perfecto
       sobre la foto— se dieron vuelta a oscuros y quedaron ilegibles.
       → Se mira también en los hijos. Un degradado no cuenta: tiene que haber
         una imagen de verdad (`url(...)`) cubriendo el bloque. */
    var hijos = bloque.querySelectorAll('*');
    for (var j = 0; j < hijos.length; j++) {
      var ch = getComputedStyle(hijos[j]);
      if (!ch.backgroundImage || ch.backgroundImage === 'none') continue;
      if (ch.backgroundImage.indexOf('url(') < 0) continue;
      var rh = hijos[j].getBoundingClientRect();
      if (rh.width * rh.height > area * 0.3) return true;
    }
    return false;
  }

  function elBloqueFoto(el) {
    var b = el.closest ? el.closest('.portada, .footer') : null;
    return hayFotoEn(b) ? b : null;
  }

  /* ★ ERROR 14: no se mide la foto — se copia el extremo que ya usan los
     hermanos que si se leen. Devuelve null mientras no haya referencia, y
     entonces NO se marca nada (★ error 13): se reintenta en la proxima pasada. */
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
  /* ⚠️⚠️ ERROR 16 — EL PAPEL NO ES EL BODY. (17/9/2026)
     `fondo-invitacion.js` pinta el papel de la invitación con un `<img>` dentro
     de `#inv-fondo`, NO con `background-image`. Así que al subir por los
     ancestros buscando algo opaco no se encontraba nada… hasta el `body`, que
     es OSCURO (#2a231e). Con eso el módulo concluía que el texto iba sobre
     fondo oscuro y lo ACLARABA. Resultado medido en Marfil: los kickers («La
     fecha», «Con mucha alegría», «La banda sonora»…) pintados inline en
     #d5cdc2 sobre papel marfil —contraste 1,20— y «Nuestra carta» en BLANCO
     PURO, 1,31. Otra vez: la regla que existe para que todo se lea era la que
     lo dejaba ilegible, y encima pisaba con `!important` el color correcto que
     la colección ya le había puesto.
     → La búsqueda se CORTA en el marco. Lo que hay detrás del texto es el
       papel: la foto de fondo si se puede medir, y si no el `--lino` de la
       colección. */
  function elPapel() {
    var im = document.querySelector('#inv-fondo img');
    var u = im && (im.currentSrc || im.src);
    if (u) {
      pedirPapel(u);
      var p = PAPEL[u];
      if (p && p !== 'no') return p;
    }
    var v = '';
    try { v = getComputedStyle(document.documentElement).getPropertyValue('--lino'); } catch (e) {}
    return aRGB(v) || null;
  }

  function fondosDe(el) {
    var n = el, tope = elMarco();
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
      if (n === tope) break;            /* ← se corta en el marco: arriba está el body oscuro */
      n = n.parentElement;
    }
    var pap = elPapel();
    if (pap) { var r3 = [pap]; r3.rango = 0; return r3; }
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

  /* ⚠️ ERROR 20 — se apaga la opacidad sólo cuando estamos CORRIGIENDO, y sólo
     si no se está animando: si el elemento aparece con una transición de
     `opacity`, congelarla en 1 le rompe la aparición. */
  /* ¿este elemento esta apareciendo? (animacion o transicion sobre opacity) */
  function seAnima(el) {
    var cs = getComputedStyle(el);
    if (cs.animationName && cs.animationName !== 'none') return true;
    return /opacity|all/.test(cs.transitionProperty || '') &&
           (parseFloat(cs.transitionDuration) || 0) > 0;
  }

  function apagarOpacidad(el) {
    var cs = getComputedStyle(el);
    var o = parseFloat(cs.opacity);
    if (!isFinite(o) || o >= 1) return;
    if (cs.animationName && cs.animationName !== 'none') return;
    if (/opacity|all/.test(cs.transitionProperty || '') &&
        (parseFloat(cs.transitionDuration) || 0) > 0) return;
    el.style.setProperty('opacity', '1', 'important');
  }

  /* ⚠️⚠️ ERROR 24 — EL COLOR ELEGIDO LLEGABA APAGADO. (17/9/2026)
     Cuando la opacidad NO se puede apagar (el elemento aparece con una
     transición), el color que elegimos se mezcla con el fondo antes de llegar
     al ojo: pedíamos 4,5 y en pantalla quedaba 1,9. Medido en «Sí, asistiré»
     y «No podré» de Confirmar Asistencia.
     → Se DESPEJA el color: se busca el que, visto a través de esa opacidad,
       dé exactamente el color que queríamos. Si ese color no existe (se sale
       de 0..255), se sube la opacidad lo mínimo necesario — no hasta 1: hasta
       que se lea. */
  function despejar(objetivo, fondo, a) {
    if (!objetivo || !fondo || !(a > 0)) return null;
    var out = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      var v = (objetivo[i] - (1 - a) * fondo[i]) / a;
      if (v < -1.5 || v > 256.5) return null;
      out[i] = Math.max(0, Math.min(255, Math.round(v)));
    }
    return out;
  }

  /* ⚠️⚠️ ERROR 27 — EL EXTREMO SE ELEGÍA CONTRA EL PAPEL, NO CONTRA EL BOTÓN. (22/9/2026)
     Maki, mirando Cantera: «checá los botones que el color del texto está mal».
     Medido: la flecha de «Ver mapa» salía rgb(21,15,9) —negro puro— sobre el
     plato OSCURO del botón, y «Agendar» salía rgb(255,255,255) —blanco puro—,
     que no pertenece a ninguna paleta y hace fallar la regla 2 del chequeo
     («ningún color de texto fuera de la familia»).
     Las dos salían de la misma rama, por dos motivos encadenados:
       1) `peor` es el peor fondo de TODA la cadena, hasta el papel de la
          invitación. Detrás de la letra de un botón NO está el papel: está el
          botón. Elegir el extremo contra el papel crema da NEGRO — y el botón
          es negro.
       2) el extremo era BLANCO o NEGRO PUROS, sin teñir.
     → Se elige contra `fondos[0]`, que es la capa inmediata (la del propio
       botón), y se tiñe con la familia de la colección (`window.INVCOLPALETA`).
     ⚠️ NO SE EMPEORA NUNCA: si el teñido no llega al piso contra ese fondo,
        se vuelve al puro de siempre. Primero se lee, después se es de la
        familia. */
  function extremoDeFamilia(fondo) {
    var puro = contraste(BLANCO, fondo) >= contraste(NEGRO, fondo) ? BLANCO : NEGRO;
    var claro = null, oscuro = null, hi = -1, lo = 2;
    try {
      var pal = window.INVCOLPALETA || {};
      for (var k in pal) {
        var col = aRGB(pal[k]);
        if (!col) continue;
        var L = luminancia(col);
        if (L > hi) { hi = L; claro = col; }
        if (L < lo) { lo = L; oscuro = col; }
      }
    } catch (e) {}
    if (!claro || !oscuro) return puro;
    var mejor = contraste(claro, fondo) >= contraste(oscuro, fondo) ? claro : oscuro;
    return contraste(mejor, fondo) >= 4.5 ? mejor : puro;
  }

  function pintar(el, c, conSombra, fondo, neutralizar) {
    if (neutralizar) apagarOpacidad(el);
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
              foto: 0, fotoArreglados: 0, fotoEnCamino: 0,
              sinFondo: 0, papelEnCamino: 0, conSombra: 0, rehechos: 0 };

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

      /* ⚠️⚠️ ERROR 20 — LA REGLA NO MIRABA LA OPACIDAD. (17/9/2026)
         Medía `color` y nada más. Un rótulo con `opacity:.45` sobre el papel
         marfil daba 7,15 en la cuenta y 1,98 en el ojo: se marcaba «ok» y
         quedaba esfumado. Maki: «quedó demasiado esfumado», «hay palabras
         claras sobre claro».
         → La opacidad se dobla dentro del alfa de la tinta ANTES de medir, y
           cuando hay que corregir se apaga (ver `apagarOpacidad`), para que el
           color elegido llegue de verdad a la pantalla.
         ⚠️ Si ahora mismo es invisible (en mitad de una aparición) no se toca
            NI se marca: se reintenta en la próxima pasada (★ error 13). */
      var opa = parseFloat(cs.opacity);
      if (!isFinite(opa)) opa = 1;
      /* ⚠⚠ ERROR 26 — LA OTRA MITAD DEL ERROR 25. (20/9/2026)
         El error 25 arregló que no se CONGELARA una opacidad de paso. Pero
         seguíamos MIDIENDO con ella: `conOpa` dobla la opacidad de ESE
         instante dentro del alfa de la tinta, y a mitad del reveal eso da una
         plata al 50% sobre negro — o sea un gris medio, que no llega al piso.
         Resultado: el corrector «arreglaba» un texto que estaba perfecto, y lo
         dejaba escrito en gris medio con !important para siempre.
         Medido en lupita-mis15, con el MISMO color de fábrica (230,228,238) y
         el MISMO fondo (11,10,15) en los cinco casos:
           «Raspa para revelar»    → ok,        plata   (14,6:1)
           «Dónde y cuándo»         → ok,        plata   (14,6:1)
           «Una carta para ti»     → corregido, rgb(117,115,126)
           «Cómo va a ser la noche» → corregido, rgb(115,112,125)
           «Dónde quedarte»        → corregido, rgb(116,115,123)
         Mismas entradas, salidas distintas: la única diferencia era EN QUÉ
         MOMENTO del fundido lo mirábamos. Los tres corregidos son justo las
         secciones que aparecen al hacer scroll.
         → Si el elemento se está animando, su opacidad REAL es a la que va a
           llegar: 1. Es la misma regla del error 25, aplicada también al
           MEDIR, no sólo al corregir. */
      if (seAnima(el)) opa = 1;
      if (opa < 0.08) continue;
      var conOpa = function (col) {
        if (opa >= 1 || !col) return col;
        return [col[0], col[1], col[2], (col[3] === undefined ? 1 : col[3]) * opa];
      };

      c.mirados++;

      /* ★ ERROR 14: sobre foto no se mide, se copia lo que ya funciona.
         ★ ERROR 13: sólo se marca lo RESUELTO; lo demas se reintenta. */
      var bloqueFoto = elBloqueFoto(el);
      if (bloqueFoto) {
        c.foto++;
        if (el.getAttribute('data-regla-luz') === 'foto') continue;
        var t = tintaDe(cs);
        if (!t) { c.fotoEnCamino++; continue; }
        var L = luminancia(t);
        if (L > CLARO || L < OSCURO) { el.setAttribute('data-regla-luz', 'foto'); continue; }
        var ext2 = extremoDelBloque(bloqueFoto);
        if (!ext2) { c.fotoEnCamino++; continue; }
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
        /* ★ error 22: ¿ese color venía del `style` propio del elemento, o del CSS? */
        el.setAttribute('data-regla-inline',
          (el.style && (el.style.color || el.style.webkitTextFillColor)) ? '1' : '0');
      }

      var px = parseFloat(cs.fontSize) || 14;
      var grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);

      var peor = null, peorV = Infinity, peorMin = 0;
      for (var k = 0; k < fondos.length; k++) {
        var b = fondos[k];
        var f = mezcla(conOpa(crudo), b);
        var min = grande ? MIN_GRANDE : MIN_NORMAL;
        if (mismoTono(f, b)) min += 1.5;
        var v = contraste(f, b);
        if (v - min < peorV - peorMin) { peorV = v; peor = b; peorMin = min; }
      }

      c.resueltos++;

      /* ★ ERRORES 10 y 12: rango amplio o boton con volumen → extremo + sombra */
      if ((fondos.rango || 0) > RANGO_AMPLIO || esBotonConVolumen(el)) {
        var ext = extremoDeFamilia(fondos[0] || peor);
        pintar(el, ext, true, fondos[0], true); c.corregidos++; c.conSombra++;
        continue;
      }

      if (peorV >= peorMin) {
        /* ⚠️⚠️ ERROR 15 — NO SE BORRA EL COLOR: SE REPONE EL ORIGINAL. (17/9/2026)
           Acá había `el.style.removeProperty('color')`, pensado para deshacer
           una corrección NUESTRA. Pero borraba también el color que el elemento
           traía DE FÁBRICA en su propio `style`. Los botones que arma un módulo
           nacen así: «Entrar a la galería» y «Abrir la cámara» llevan
           `color:#fff` inline. Al borrárselo quedaban con el color por defecto
           del navegador — el `<a>` en AZUL DE LINK sobre el botón oscuro y el
           `<button>` en NEGRO sobre el violeta. Medido: contraste 1,01 y 2,01.
           O sea: la regla que existe para que todo se lea era la que lo rompía,
           y encima se marcaba «ok» y no se volvía a mirar.
           → Si nunca lo tocamos (sin marca), NO se toca nada: ya se leía bien.
             Si lo habíamos pintado, se repone `crudo`, que es el color original
             guardado en `data-regla-orig`. */
        if (marca) pintar(el, crudo, false, fondos[0]);
        el.setAttribute('data-regla-luz', 'ok');
        el.setAttribute('data-regla-fondo', aTexto(fondos[0]));
        c.ok++;
        continue;
      }

      var frente = mezcla(conOpa(crudo), peor);
      var res = corregir(frente, peor, peorMin, mismoTono(frente, peor));
      /* ★ error 24: primero se intenta apagar la opacidad; lo que quede, se despeja. */

      /* ★ ERROR 26, RED DE SEGURIDAD — UNA CORRECCIÓN QUE DEJA EL TEXTO PEOR
         NO ES UNA CORRECCIÓN. Está escrito en la skill de entrega desde el
         18/9 y el módulo no lo comprobaba: elegía un color y lo escribía sin
         verificar que de verdad le ganara al de fábrica contra ESE fondo. Si
         no le gana, se deja el original y se marca `ok`. Es barato y corta de
         raíz toda esta familia de errores, venga de donde venga la medición
         mentirosa. */
      if (contraste(res.c, peor) <= contraste(frente, peor)) {
        if (marca) pintar(el, crudo, false, fondos[0]);
        el.setAttribute('data-regla-luz', 'ok');
        el.setAttribute('data-regla-fondo', aTexto(fondos[0]));
        c.ok++;
        continue;
      }

      apagarOpacidad(el);
      /* ⚠⚠ ERROR 25 — CONGELABAMOS UNA OPACIDAD DE PASO. (20/9/2026)
         El error 20 dice, bien, que no hay que forzar `opacity:1` cuando el
         elemento APARECE con una transicion: se le rompe la aparicion. Pero
         despues leiamos igual la opacidad de ESE instante — 0,5 a mitad del
         reveal — y si `despejar` no daba, la CLAVABAMOS con !important. El
         texto se quedaba para siempre en la mitad de su aparicion.
         Medido en lupita-mis15 (coleccion oscura): «La fecha» 0,52,
         «Raspa para revelar» 0,5, «Antes que nada» 0,52, «Una carta para ti»
         0,5, «Donde quedarte» 0,5. Sobre negro eso no es un texto mas suave:
         es un texto que no esta. Y solo le pasaba a las secciones que se
         revelaban al hacer scroll, que son justo las que uno no mira al
         cargar.
         Si el elemento se esta animando, su opacidad REAL es a la que va a
         llegar: 1. Se calcula contra 1 y no se le toca la opacidad. */
      var aReal = parseFloat(getComputedStyle(el).opacity);
      if (seAnima(el)) aReal = 1;
      if (!isFinite(aReal) || aReal > 1) aReal = 1;
      var color = res.c;
      if (aReal < 1) {
        var d = despejar(res.c, peor, aReal);
        if (!d) {
          var a = aReal;
          while (a < 1 && !d) { a = Math.min(1, a + 0.04); d = despejar(res.c, peor, a); }
          el.style.setProperty('opacity', String(Math.round(a * 100) / 100), 'important');
        }
        if (d) color = d;
      }
      pintar(el, color, !res.alcanzo, fondos[0], false);
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

  /* ⚠️⚠️ ERROR 22 — EL «ORIGINAL» SE GUARDÓ DURANTE EL ARRANQUE. (17/9/2026)
     `data-regla-orig` se toma la primera vez que miramos el elemento. Pero al
     arrancar hay una carrera: la paleta elegida pinta las variables y la
     colección las vuelve a pintar con las suyas. Si miramos en el medio,
     guardamos como «color de fábrica» un color que ya no existe — y despues lo
     REPONEMOS con `!important` para siempre.
     Se vio así: «Ceremonia» y «Fiesta» de Marfil quedaron con
     `color:rgb(70,59,82)` en línea (el violeta de la paleta lavanda) aunque
     `--verde` ya valía #4a4642, el gris de Marfil. La regla que existe para que
     todo se lea estaba congelando el color equivocado.
     → A los 2,6 s y a los 7 s se OLVIDA lo pintado y se vuelve a mirar todo
       desde cero. Sólo se olvida lo que pintamos nosotros: si el elemento traía
       color en su propio `style` de fábrica (`data-regla-inline="1"`), no se
       toca — esa es la lección del error 15. */
  function olvidarLoPintado() {
    var marco = elMarco();
    if (!marco) return;
    var nodos = marco.querySelectorAll('[data-regla-luz]');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el.getAttribute('data-regla-inline') === '1') continue;
      el.style.removeProperty('color');
      el.style.removeProperty('-webkit-text-fill-color');
      el.style.removeProperty('text-shadow');
      el.style.removeProperty('opacity');
      el.removeAttribute('data-regla-luz');
      el.removeAttribute('data-regla-fondo');
      el.removeAttribute('data-regla-orig');
    }
  }

  function arrancar() {
    pasada();
    observar();
    setTimeout(function () { olvidarLoPintado(); pasada(); }, 2600);
    setTimeout(function () { olvidarLoPintado(); pasada(); }, 7000);
    var n = 0;
    var t = setInterval(function () {
      pasada();
      if (++n > 40) { clearInterval(t); observar(); }
    }, CADA);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
