/* ===== EL SOBRE DEL CATÁLOGO, POR FIN CONECTADO ==============================

   EL BUG, que dejaba muerta una función entera
   El motor (`i/index.html`) decide cómo se abre la invitación con esta línea:

       if (CONFIG.sobreTriangulos) { initEnvTri(); } else { initEnvVideo(); }

   Y `CONFIG.sobreTriangulos` está **fijo en true** dentro del propio motor. No
   sale de los datos, no sale del panel: está escrito ahí. Resultado: TODAS las
   invitaciones abrían con el sobre de triángulos, y el sobre que Jazmín elige
   en «✨ Efectos → Sobre del catálogo» no se usaba nunca.

   POR QUÉ SE ARREGLA DESDE ACÁ
   `i/index.html` pesa 185 KB y se sube a mano. El motor deja `abrir()` como
   función global, así que un módulo puede armar la apertura con el material del
   catálogo y después llamar a la MISMA `abrir()` de siempre.

   ★★★★★ DOS MANERAS DE ABRIR: `video` Y `solapas`  (3/9/2026)

     Maki, después de ver el sobre de anillos andando:
     «cambiemos el sobre, me confundí y te pasé uno que estaba mal, **se abre
     descontrolado** este. Creo que lo habías armado vos con una imagen».

     Y tenía razón. Un video generado con IA **hace lo que quiere**: en el de
     anillos el relieve del papel cambia solo en el camino (arranca con volutas
     y termina con rosas) y el lacre no se parte, se desvanece. Eso no se
     arregla con código: viene así en el archivo.

     La alternativa es no usar video: **una foto fija y el movimiento hecho por
     nosotros**. Ahí el tiempo, el ángulo y el final los manejamos al
     milisegundo, sale igual siempre, y no se puede descontrolar.

     Y no hace falta subir nada nuevo: **el póster que ya está en el repo es el
     primer cuadro del video**, o sea el sobre cerrado, en 1080.

     CÓMO SE ANIMA
       La foto se parte en CUATRO TRIÁNGULOS que salen del centro, que es donde
       está el lacre. Las dos solapas de adelante —la izquierda y la de abajo—
       giran hacia afuera sobre su borde exterior, con perspectiva. Las otras
       dos se quedan quietas: son el fondo del sobre.

       ⚠️ El lacre queda partido por el medio a propósito: al girar las solapas
          se abre en dos, que es lo que hace un lacre de verdad. Era el defecto
          más feo del video —el sello se esfumaba— y acá sale gratis.

       Después el sobre entero se desvanece encima de la portada real.

     ⚠️ EL EJE ES REGULABLE. `EJE` dice dónde se cruzan las solapas, en
        fracciones de la foto. Está en 0,50 / 0,50 porque en la foto de anillos
        el lacre está centrado. Si un sobre nuevo lo tiene más arriba, se cambia
        ese número y listo.

     ⚠️ LAS SOLAPAS SE RECORTAN SOBRE LA CAJA DE LA FOTO, no sobre la pantalla.
        Por eso el contenedor tiene el tamaño exacto de la imagen, calculado con
        `min()` y aritmética.

   ★★★★★★ Y EL BUG QUE COSTÓ MÁS CARO DE TODOS  (3/9/2026)

     La apertura por solapas se subió… y en pantalla aparecía **una tarjeta
     crema vacía**. Nada más. Todo lo que se midió daba bien:

       · las cuatro hojas existían y estaban en el DOM;
       · la foto cargaba (`new Image()` devolvía 1080 × 1920);
       · el contenedor medía 333 × 591, el tamaño correcto;
       · `visibility: visible`, `opacity: 1`, `display: block`, `inset: 0`;
       · hasta poniéndole `background: red` a mano no se veía el rojo.

     Un elemento con todo eso NO PUEDE no pintarse. Así que no era que no se
     pintara: **algo lo estaba tapando**.

     Era el `<video>` del motor. En modo solapas se le sacaba el `src` para que
     no cargara nada… pero se quedaba en `display: block`, y la regla de
     escritorio de `sobres/catalogo.js` le da `z-index: 2`, `border-radius: 30px`
     y una sombra de tarjeta. O sea que **la tarjeta crema que estábamos
     mirando ERA el video vacío**, con su forma de sobre, tapando las solapas
     —que tenían `z-index: auto`— por un punto de diferencia.

     → Lo que lo destrabó fue preguntar `elementFromPoint` en vez de seguir
       leyendo estilos: los estilos del elemento nunca te dicen quién está
       ARRIBA.
     → Y el arreglo va por CSS, no por JS: un `vid.style.display='none'` se
       puede perder si otro camino vuelve a tocar el elemento. La regla
       `[data-apertura="solapas"] #env-vid{display:none!important}` no.
     → Regla general para este sistema: **cuando algo "no se ve" y todas las
       medidas dan bien, la pregunta no es qué le pasa a ese elemento: es qué
       hay encima.**

   ★★★★★ EL SOBRE SE ABRE SOBRE LA PORTADA REAL  (3/9/2026)

     Maki: «¿te acordás que habíamos quedado en que el sobre se abría y aparecía
     abajo la foto de la invitación directo, y ahí recién aparecían los datos?».

     No hace falta componer nada: **la invitación ya está dibujada abajo**.
     `#env` es una tapa `position:fixed; z-index:100`; debajo está la portada
     real, con su foto, sus nombres y su cuenta regresiva.

     Entonces el empalme correcto no es «fundir a blanco y después mostrar»:
     es **apagar el sobre** y dejar ver lo que ya estaba.

     Y el detalle que ella pidió: **primero la foto sola, y los datos medio
     segundo después.**

     `empalme`: `'blanco'` (por defecto) o `'foto'`.

     ⚠️ Los textos se retienen con una CLASE en el `<html>`, no tocando los
        nodos: el motor los repinta y cualquier `style` inline se pierde.
     ⚠️ Y SIEMPRE se destraban, aunque algo falle: hay un plazo máximo.

   ★★★★★ EL ATAJO SE QUEDABA PEGADO CON EL SOBRE VIEJO  (3/9/2026)

     `atajo()` mira `localStorage` y arma el sobre de la última visita para que
     aparezca al instante. Pero además ponía `listo = true`, y `revisar()`
     entonces sólo GUARDABA el modelo nuevo sin cambiar lo que había en
     pantalla. Encima devolvía `true` y el ciclo se cortaba antes de que
     llegara el dato.

     ⚠️ Afectaba a TODAS: cada vez que Jazmín le cambia el sobre a una
        invitación entregada, los invitados que ya la habían abierto seguían
        viendo el viejo. Y no había ningún error en la consola.

     → El ciclo no se corta hasta que llega el dato real; se guarda qué sobre
       está puesto (`armadoModelo`) y si no coincide se corrige con
       `actualizar()`. ⚠️ NO se vuelve a llamar a `armar()`: engancharía una
       segunda tanda de listeners y `abrir()` se llamaría dos veces.

     → La regla general: **un atajo de caché tiene que saber corregirse.**

   ★★ LA NITIDEZ SE PIERDE EN EL ENCUADRE, NO EN EL ARCHIVO  (2/9/2026)
     `object-fit: cover` en un iPhone de 1179 × 2556 con un video de 1080 × 1920
     agranda 1,33× y recorta el 20% de los lados. Con `contain` entra entero y
     se agranda 1,09×.
     → Un objeto fotografiado va CONTENIDO, no recortado.

   ★★ LOS VIDEOS GENERADOS RESPIRAN: SE ABREN Y SE VUELVEN A CERRAR (2/9/2026)
     El sobre de Perlas llega a su punto más abierto cerca de los 2,6 s y en el
     segundo final se cierra. Por eso el velo arranca en `duration - ANTES`.
     → Otra razón para preferir `solapas` cuando se pueda.

   ★★★ EL `<video>` DEL MOTOR VIENE CON `autoplay` (2/9/2026)
     La invitación **se abría sola**. Se le saca el atributo y se lo deja en
     pausa.

   ★★★ Y SAFARI LE PONE SUS PROPIOS CONTROLES (2/9/2026)
     Hay que apagar los `::-webkit-media-controls*`, y para el video ESTÉ DONDE
     ESTÉ, porque aparecen antes de que se ponga la clase.

   ★★★★ EL PRIMER SEGUNDO TAMBIÉN ES LA INVITACIÓN  (2/9/2026)
     La tapa esconde TODOS los hijos de `#env`, y el sobre elegido se guarda en
     `localStorage` para que desde la segunda visita aparezca al instante.

   ⚠️ EL TOQUE VA EN CAPTURA SOBRE EL DOCUMENTO. El motor ya tenía SU listener
      en `#env` y entraba de una sin dejar correr nada.

   ⚠️ SI ALGO FALLA, EL INVITADO ENTRA IGUAL. Reloj de seguridad.

   ⚠️ NO TOCA NADA SI EL SOBRE NO ES DEL CATÁLOGO.
   ============================================================================ */
(function () {

  var FUNDIDO  = 1.0;   /* cuánto dura el desvanecido final */
  var ANTES    = 1.4;   /* en modo video: cuánto antes del final arranca */
  var SOLAPAS  = 1.15;  /* en modo solapas: cuánto tarda en abrirse */
  var DATOS    = 550;   /* cuánto esperan los textos de la portada, en ms */
  var TOPE     = 3500;  /* plazo máximo para destrabarlos, pase lo que pase */

  /* dónde se cruzan las solapas, en fracciones de la foto. Ver la nota. */
  var EJE = { x: 50, y: 50 };

  var listo = false;
  var armadoModelo = null;

  function ev()  { return (window.INVEV || {}); }
  function sobre() { return ((ev().fx || {}).sobre) || {}; }
  function catalogo() {
    var c = window.SOBRES_INVITAME;
    return (c && typeof c === 'object') ? c : null;
  }

  function slug() {
    try {
      var d = window.INVDATA || {};
      if (d.slug) return String(d.slug);
      var m = location.search.match(/[?&]e=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    } catch (e) { return ''; }
  }
  function recordar(modelo) {
    try { if (slug()) localStorage.setItem('inv_sobre_' + slug(), modelo || ''); } catch (e) {}
  }
  function recordado() {
    try { return slug() ? (localStorage.getItem('inv_sobre_' + slug()) || null) : null; }
    catch (e) { return null; }
  }

  function delCatalogo(modelo) {
    var cat = catalogo();
    if (!cat || !modelo) return null;
    var m = cat[modelo];
    if (!m) return null;
    if (m.apertura === 'solapas' && m.poster) return m;
    if (m.video) return m;
    return null;
  }
  function elegido() {
    var s = sobre();
    if (String(s.tipo || '') !== 'carta') return null;
    return delCatalogo(s.modelo);
  }

  /* ---- 1. TAPA ANTI-DESTELLO + CONTROLES DE SAFARI, antes de saber nada ---- */
  var tapa = document.createElement('style');
  tapa.id = 'col-sobre-tapa';
  tapa.textContent =
    '#env > *{visibility:hidden!important}\n' +
    '#env{background:#efeae2!important}';
  (document.head || document.documentElement).appendChild(tapa);

  var sinControles = document.createElement('style');
  sinControles.id = 'col-sobre-sin-controles';
  sinControles.textContent = [
    '#env-vid::-webkit-media-controls,',
    '#env-vid::-webkit-media-controls-enclosure,',
    '#env-vid::-webkit-media-controls-panel,',
    '#env-vid::-webkit-media-controls-panel-container,',
    '#env-vid::-webkit-media-controls-overlay-play-button,',
    '#env-vid::-webkit-media-controls-start-playback-button,',
    '#env-vid::-webkit-media-controls-play-button,',
    '#env-vid::-webkit-media-controls-timeline,',
    '#env-vid::-webkit-media-controls-current-time-display,',
    '#env-vid::-webkit-media-controls-time-remaining-display,',
    '#env-vid::-webkit-media-controls-mute-button,',
    '#env-vid::-webkit-media-controls-volume-slider,',
    '#env-vid::-webkit-media-controls-fullscreen-button,',
    '#env-vid::-webkit-media-controls-toggle-closed-captions-button{',
    '  display:none!important;-webkit-appearance:none!important;',
    '  opacity:0!important;pointer-events:none!important}',
    '#env-vid::-internal-media-controls-overlay-cast-button{display:none!important}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(sinControles);

  /* ---- LOS TEXTOS DE LA PORTADA, RETENIDOS ---- */
  (function cssDatos() {
    var s = document.createElement('style');
    s.id = 'col-sobre-datos';
    s.textContent = [
      'html.inv-datos-esperan .portada .c,',
      'html.inv-datos-esperan .portada .scrollcue{opacity:0!important}',
      '.portada .c,.portada .scrollcue{transition:opacity .75s ease}',
      'html.inv-datos-esperan .portada .pbg{transform:scale(1.045)}',
      '.portada .pbg{transition:transform 1.1s cubic-bezier(.22,.72,.28,1)}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  })();

  var destrabado = false;
  function retenerDatos() {
    if (destrabado) return;
    document.documentElement.classList.add('inv-datos-esperan');
    setTimeout(soltarDatos, TOPE);
  }
  function soltarDatos() {
    destrabado = true;
    document.documentElement.classList.remove('inv-datos-esperan');
  }

  (function frenarAutoplay() {
    var v = document.getElementById('env-vid');
    if (!v) { setTimeout(frenarAutoplay, 20); return; }
    try {
      v.removeAttribute('autoplay');
      v.removeAttribute('controls');
      v.autoplay = false;
      v.controls = false;
      v.pause();
      v.currentTime = 0;
    } catch (e) {}
  })();

  function sacarTapa() {
    if (tapa && tapa.parentNode) tapa.parentNode.removeChild(tapa);
    tapa = null;
  }

  function estilo(color) {
    var st = document.getElementById('col-sobrecat-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'col-sobrecat-css';
      document.head.appendChild(st);
    }

    var cajaAlto  = 'min(100vh, calc(100vw * 16 / 9))';
    var cajaAncho = 'min(100vw, calc(100vh * 9 / 16))';
    var dAlto     = 'min(84vh, 843px)';
    var dAncho    = 'calc(' + dAlto + ' * 9 / 16)';

    st.textContent = [
      '#env.carta-video > *{visibility:hidden}',
      '#env.carta-video #env-vid,',
      '#env.carta-video #col-sobre-foto,',
      '#env.carta-video #col-sobre-velo,',
      '#env.carta-video .vhint{visibility:visible!important}',

      '#env.carta-video{background:' + color + '!important;cursor:pointer;',
      '  transition:opacity .6s ease,visibility .6s ease}',

      /* ⚠️ CONTAIN, no cover */
      '#env.carta-video #env-vid{display:block!important;',
      '  position:fixed;inset:0;width:100%;height:100%;',
      '  object-fit:contain;background:' + color + ';',
      '  opacity:0;transition:opacity .45s ease;pointer-events:none}',
      '#env.carta-video.puesto #env-vid{opacity:1}',

      /* ⚠️⚠️ EN MODO SOLAPAS EL VIDEO SE APAGA POR CSS.
         Sin esto queda un <video> VACÍO con z-index 2, borde redondeado y
         sombra —o sea, con forma de sobre— tapando las solapas. Fue el bug
         que costó más caro: ver la nota del encabezado. */
      '#env.carta-video[data-apertura="solapas"] #env-vid{display:none!important}',

      /* ---------- APERTURA POR SOLAPAS ---------- */
      '#col-sobre-foto{position:fixed;left:50%;top:50%;',
      '  transform:translate(-50%,-50%);',
      '  height:' + cajaAlto + ';width:' + cajaAncho + ';',
      '  perspective:1400px;pointer-events:none;z-index:6;',
      '  opacity:0;transition:opacity .45s ease}',
      '#env.carta-video.puesto #col-sobre-foto{opacity:1}',

      '#col-sobre-foto .hoja{position:absolute;inset:0;',
      '  background-position:center;background-size:100% 100%;',
      '  background-repeat:no-repeat;',
      '  transition:transform ' + SOLAPAS + 's cubic-bezier(.36,.02,.2,1),',
      '             filter ' + SOLAPAS + 's ease}',

      /* las dos que se quedan: el fondo del sobre */
      '#col-sobre-foto .h-arriba{clip-path:polygon(0 0,100% 0,' +
        EJE.x + '% ' + EJE.y + '%)}',
      '#col-sobre-foto .h-derecha{clip-path:polygon(100% 0,100% 100%,' +
        EJE.x + '% ' + EJE.y + '%)}',

      /* las dos que se abren */
      '#col-sobre-foto .h-izq{clip-path:polygon(0 0,' +
        EJE.x + '% ' + EJE.y + '%,0 100%);',
      '  transform-origin:left center}',
      '#col-sobre-foto .h-abajo{clip-path:polygon(0 100%,' +
        EJE.x + '% ' + EJE.y + '%,100% 100%);',
      '  transform-origin:center bottom}',

      '#env.carta-video.abriendo #col-sobre-foto .h-izq{',
      '  transform:rotateY(-118deg);filter:brightness(.86)}',
      '#env.carta-video.abriendo #col-sobre-foto .h-abajo{',
      '  transform:rotateX(-112deg);filter:brightness(.82)}',

      '@media (min-width:680px){',
      '  #col-sobre-foto{height:' + dAlto + ';width:' + dAncho + ';',
      '    border-radius:30px;overflow:hidden;',
      '    box-shadow:0 32px 74px rgba(40,28,12,.34)}',
      '}',

      '#col-sobre-velo{position:fixed;inset:0;z-index:8;pointer-events:none;',
      '  background:' + color + ';opacity:0;',
      '  transition:opacity ' + FUNDIDO + 's ease-in}',
      '#env.carta-video.fundiendo #col-sobre-velo{opacity:1}',

      '#env.carta-video.revelando{opacity:0!important;',
      '  transition:opacity ' + FUNDIDO + 's ease-in!important}',
      '#env.carta-video.revelando #col-sobre-velo{opacity:0!important}',

      '#env.carta-video .vhint{display:block!important;',
      '  position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:10;',
      '  font-family:Montserrat,sans-serif;font-size:10px;font-weight:500;',
      '  letter-spacing:.22em;text-transform:uppercase;',
      '  color:rgba(60,52,44,.62);text-align:center;pointer-events:none;',
      '  opacity:0;transition:opacity .45s ease}',
      '#env.carta-video.puesto .vhint{opacity:1}',
      '#env.carta-video.abriendo .vhint{opacity:0}'
    ].join('\n');
  }

  function montarSolapas(env, url) {
    var caja = document.getElementById('col-sobre-foto');
    if (!caja) {
      caja = document.createElement('div');
      caja.id = 'col-sobre-foto';
      ['h-arriba', 'h-derecha', 'h-izq', 'h-abajo'].forEach(function (c) {
        var h = document.createElement('div');
        h.className = 'hoja ' + c;
        caja.appendChild(h);
      });
      env.appendChild(caja);
    }
    var css = 'url("' + String(url).replace(/"/g, '%22') + '")';
    [].forEach.call(caja.querySelectorAll('.hoja'), function (h) {
      if (h.style.backgroundImage !== css) h.style.backgroundImage = css;
    });
  }

  function actualizar(m, id) {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return false;
    if (env.classList.contains('abriendo')) return false;

    estilo(m.color || '#f4f2ee');
    env.dataset.empalme = (m.empalme === 'foto') ? 'foto' : 'blanco';
    env.dataset.apertura = (m.apertura === 'solapas') ? 'solapas' : 'video';

    if (env.dataset.apertura === 'solapas') {
      montarSolapas(env, m.poster || '');
    } else {
      vid.setAttribute('poster', m.poster || '');
      if (vid.getAttribute('src') !== m.video) {
        vid.setAttribute('src', m.video);
        try { vid.load(); vid.pause(); vid.currentTime = 0; } catch (e) {}
      }
    }
    armadoModelo = id;
    return true;
  }

  function armar(m, id) {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return false;

    var color = m.color || '#f4f2ee';
    estilo(color);

    env.className = 'carta-video';
    env.dataset.empalme = (m.empalme === 'foto') ? 'foto' : 'blanco';
    env.dataset.apertura = (m.apertura === 'solapas') ? 'solapas' : 'video';

    ['tri-seal', 'e-back', 'e-pocket', 'e-flap'].forEach(function (id2) {
      var n = document.getElementById(id2);
      if (n && n.parentNode) n.parentNode.removeChild(n);
    });
    [].forEach.call(env.querySelectorAll('.triflap'), function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });

    var porSolapas = env.dataset.apertura === 'solapas';

    vid.removeAttribute('autoplay');
    vid.removeAttribute('controls');
    vid.autoplay = false;
    vid.controls = false;

    if (porSolapas) {
      /* el video se apaga por CSS; acá sólo se lo deja sin cargar nada */
      try { vid.pause(); vid.removeAttribute('src'); vid.load(); } catch (e) {}
      montarSolapas(env, m.poster || '');
    } else {
      vid.style.display = '';
      vid.setAttribute('poster', m.poster || '');
      vid.setAttribute('playsinline', '');
      vid.setAttribute('webkit-playsinline', '');
      vid.setAttribute('disablepictureinpicture', '');
      vid.setAttribute('controlslist', 'nodownload noplaybackrate nofullscreen noremoteplayback');
      vid.muted = true;
      vid.loop = false;
      vid.preload = 'auto';
      if (vid.getAttribute('src') !== m.video) vid.setAttribute('src', m.video);
      try { vid.load(); vid.pause(); vid.currentTime = 0; } catch (e) {}
    }

    var velo = document.getElementById('col-sobre-velo');
    if (!velo) {
      velo = document.createElement('div');
      velo.id = 'col-sobre-velo';
      env.appendChild(velo);
    }

    var hint = env.querySelector('.vhint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'vhint';
      env.appendChild(hint);
    }
    hint.textContent = 'Toca para abrir';

    sacarTapa();
    setTimeout(function () { env.classList.add('puesto'); }, 30);

    function esFoto()    { return env.dataset.empalme  === 'foto'; }
    function esSolapas() { return env.dataset.apertura === 'solapas'; }

    var abierto = false;
    function entrar() {
      if (abierto) return;
      abierto = true;
      try { if (typeof abrir === 'function') abrir(); } catch (e) {}
      env.classList.add('gone');
      env.style.opacity = '0';
      env.style.visibility = 'hidden';
      setTimeout(soltarDatos, esFoto() ? DATOS : 0);
    }

    var fundiendo = false;
    function fundir() {
      if (fundiendo) return;
      if (!env.classList.contains('abriendo')) return;
      fundiendo = true;
      if (esFoto()) {
        retenerDatos();
        env.classList.add('revelando');
      } else {
        env.classList.add('fundiendo');
      }
      setTimeout(entrar, FUNDIDO * 1000);
    }

    vid.addEventListener('timeupdate', function () {
      if (esSolapas()) return;
      if (!vid.duration || !isFinite(vid.duration)) return;
      if (vid.currentTime >= vid.duration - ANTES) fundir();
    });
    vid.addEventListener('ended', function () { if (!esSolapas()) fundir(); });

    function tocar() {
      if (env.classList.contains('abriendo')) return;
      env.classList.add('abriendo');

      if (esSolapas()) {
        setTimeout(fundir, SOLAPAS * 1000);
        return;
      }

      var dur = (vid.duration && isFinite(vid.duration)) ? vid.duration : 5;
      setTimeout(fundir, (dur + 1.5) * 1000);
      var p = null;
      try { vid.currentTime = 0; p = vid.play(); } catch (err) {}
      if (p && p.catch) p.catch(function () { fundir(); });
    }

    function alTocar(e) {
      if (abierto) return;
      if (!env.contains(e.target) && e.target !== env) return;
      e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
      tocar();
    }
    document.addEventListener('click', alTocar, true);
    document.addEventListener('touchend', alTocar, true);

    vid.addEventListener('error', function () {
      if (!esSolapas() && env.classList.contains('abriendo')) fundir();
    });

    armadoModelo = id;
    return true;
  }

  /* ---- 2. ATAJO: pone algo al instante, pero NO cierra el tema ---- */
  (function atajo() {
    if (listo) return;
    var id = recordado();
    var m = delCatalogo(id);
    if (!m) { if (!catalogo()) setTimeout(atajo, 40); return; }
    if (armar(m, id)) listo = true;
  })();

  function revisar() {
    var s = sobre();
    var cat = catalogo();
    var hayDato = !!(cat && s && Object.keys(s).length);

    if (listo) {
      if (!hayDato) return false;
      var esCarta = String(s.tipo || '') === 'carta';
      recordar(esCarta ? s.modelo : '');
      var real = esCarta ? delCatalogo(s.modelo) : null;
      if (real && s.modelo !== armadoModelo) actualizar(real, s.modelo);
      return true;
    }

    if (!hayDato) return false;

    var m = elegido();
    recordar(m ? s.modelo : '');
    if (!m) { sacarTapa(); listo = true; return true; }
    if (armar(m, s.modelo)) { listo = true; return true; }
    return false;
  }

  var n = 0;
  var t = setInterval(function () {
    if (revisar() || ++n > 120) { clearInterval(t); sacarTapa(); }
  }, 60);
  revisar();
})();
