/* ===== EL SOBRE DEL CATÁLOGO, POR FIN CONECTADO ==============================

   EL BUG, que dejaba muerta una función entera
   El motor (`i/index.html`) decide cómo se abre la invitación con esta línea:

       if (CONFIG.sobreTriangulos) { initEnvTri(); } else { initEnvVideo(); }

   Y `CONFIG.sobreTriangulos` está **fijo en true** dentro del propio motor. No
   sale de los datos, no sale del panel: está escrito ahí. Resultado: TODAS las
   invitaciones abrían con el sobre de triángulos, y el sobre que Jazmín elige
   en «✨ Efectos → Sobre del catálogo» no se usaba nunca.

   Encima, `initEnvVideo()` —el otro camino— tampoco servía: usa un video fijo
   del propio CONFIG (`sobreVideo`, el marfil viejo con el sello encimado), no
   el del catálogo.

   POR QUÉ SE ARREGLA DESDE ACÁ
   `i/index.html` pesa 185 KB y se sube a mano. El motor deja `abrir()` como
   función global, así que un módulo puede armar la apertura con el video del
   catálogo y después llamar a la MISMA `abrir()` de siempre.

   ★ EL FUNDIDO A BLANCO SE HACE ACÁ, NO EN EL ARCHIVO  (2/9/2026)
     Primero se horneó el fundido dentro del mp4 con ffmpeg. Mal: obligaba a
     recomprimir todo el video, y sobre un fondo gris parejo la compresión se
     nota enseguida. Maki, textual: «la calidad quedó muy mal del sobre».
     El fundido lo hace un velo por CSS, del color EXACTO con el que arranca la
     invitación, así el empalme es perfecto por definición y no por medición.

   ★ LA RESOLUCIÓN DEL SOBRE: 1080×1920, NO 720  (2/9/2026)
     Flow entrega 720×1280. En un iPhone eso se estira a más de 1100 px de
     ancho y se ve blando. Maki: «en el iphone la calidad se ve horrible».
     El archivo del catálogo se agranda a 1080×1920 con lanczos y un unsharp
     suave ANTES de subirlo: el navegador después casi no tiene que escalar y
     se ve nítido. Pesa ~1,1 MB, más que los otros sobres, y está bien: es la
     primera pantalla y se carga una sola vez.
     ⚠️ Y el PÓSTER se saca del video YA agrandado y en máxima calidad. El
        póster es lo que se ve ANTES de tocar: si sale comprimido, el sobre
        parece feo aunque el video esté perfecto. Ese fue medio problema.

   ★★ LOS VIDEOS GENERADOS RESPIRAN: SE ABREN Y SE VUELVEN A CERRAR (2/9/2026)
     El sobre de Perlas llega a su punto más abierto cerca de los 2,6 s y en el
     segundo final se cierra de nuevo. Por eso el velo arranca en el momento
     más abierto (`duration - ANTES`), no al terminar.
     → Al sumar un sobre nuevo: sacarle cuadros con ffmpeg y BUSCAR el momento
       más abierto. El mejor cuadro casi nunca es el último.

   ★★★ EL `<video>` DEL MOTOR VIENE CON `autoplay` (2/9/2026)
     `#env-vid` trae `autoplay` escrito en el HTML. Con el sobre de triángulos
     no se notaba porque estaba escondido; acá la invitación **se abría sola**,
     sin que nadie tocara nada. Se le saca el atributo y se lo deja en pausa.
     Y el velo sólo puede arrancar si el invitado ya tocó.

   ★★★ Y SAFARI LE PONE SUS PROPIOS CONTROLES (2/9/2026)
     En la Mac apareció la barra de reproducción de Safari encima del sobre:
     play, línea de tiempo, volumen, pantalla completa. Pasa cuando Safari
     bloquea el autoplay y decide «esto lo maneja el usuario». No alcanza con
     `controls = false`: hay que apagar los pseudo-elementos
     `::-webkit-media-controls*`, y hay que hacerlo para el video ESTÉ DONDE
     ESTÉ, no sólo dentro de `#env.carta-video`, porque los controles aparecen
     antes de que se ponga esa clase.

   ★★★★ EL PRIMER SEGUNDO TAMBIÉN ES LA INVITACIÓN  (2/9/2026)
     Maki, sobre una captura de su teléfono: «no quiero ver más la primera
     imagen esa», «apenas abrís, 1 segundo o más».

     Eran DOS cosas encimadas:

       1. La tapa anti-destello escondía una LISTA de elementos del sobre viejo
          — y por esa lista se colaban el monograma y el botón INGRESA. Ahora
          esconde **todos los hijos de `#env`**, sin lista.

       2. La espera. El módulo no puede decidir hasta que llega `INVEV` desde
          Firestore, y eso tarda cerca de un segundo. Por eso ahora se GUARDA
          el sobre elegido en `localStorage` por invitación: en la segunda
          visita y en todas las siguientes el sobre aparece al instante.

     → Regla: mientras se espera un dato, no se muestra una versión provisoria
       de la pantalla. Se muestra NADA, y lo que aparece después aparece con un
       fundido, no de golpe.

   ⚠️ EL TOQUE VA EN CAPTURA SOBRE EL DOCUMENTO. Escuchar el click en `#env` no
      sirve: el motor ya tenía SU listener ahí (`initEnvTri()`) y, como se
      registró primero, entraba de una sin dejar correr el video. Una tapa
      transparente encima tampoco fue confiable. Lo que funciona es
      `document.addEventListener('click', …, true)`.

   ⚠️ SI EL VIDEO NO CORRE, EL INVITADO ENTRA IGUAL. Reloj de seguridad: unos
      segundos después de TOCAR se llama a `abrir()` pase lo que pase.

   ⚠️ NO TOCA NADA SI EL SOBRE NO ES DEL CATÁLOGO. Las invitaciones con el
      sobre de triángulos siguen exactamente igual.
   ============================================================================ */
(function () {

  var FUNDIDO = 1.0;   /* cuánto dura el velo blanco */
  var ANTES   = 1.4;   /* cuánto antes del final arranca: el sobre se cierra */
  var listo = false;

  function ev()  { return (window.INVEV || {}); }
  function sobre() { return ((ev().fx || {}).sobre) || {}; }
  function catalogo() {
    var c = window.SOBRES_INVITAME;
    return (c && typeof c === 'object') ? c : null;
  }

  /* ---- de qué invitación estamos hablando, sin esperar la base ---- */
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
    return (m && m.video) ? m : null;
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

  /* ⚠️ los controles nativos se apagan SIEMPRE, no sólo en carta-video:
     Safari los dibuja apenas carga, antes de que pongamos la clase */
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

  /* ⚠️ el autoplay del motor se corta YA, antes de que el video empiece */
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
    st.textContent = [
      '#env.carta-video > *{visibility:hidden}',
      '#env.carta-video #env-vid,',
      '#env.carta-video #col-sobre-velo,',
      '#env.carta-video .vhint{visibility:visible!important}',

      '#env.carta-video{background:' + color + '!important;cursor:pointer;',
      '  transition:opacity .6s ease,visibility .6s ease}',

      '#env.carta-video #env-vid{display:block!important;',
      '  position:fixed;inset:0;width:100%;height:100%;',
      '  object-fit:cover;background:' + color + ';',
      '  opacity:0;transition:opacity .45s ease;pointer-events:none}',
      '#env.carta-video.puesto #env-vid{opacity:1}',

      '#col-sobre-velo{position:fixed;inset:0;z-index:8;pointer-events:none;',
      '  background:' + color + ';opacity:0;',
      '  transition:opacity ' + FUNDIDO + 's ease-in}',
      '#env.carta-video.fundiendo #col-sobre-velo{opacity:1}',

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

  function armar(m) {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return false;

    var color = m.color || '#f4f2ee';
    estilo(color);

    env.className = 'carta-video';
    ['tri-seal', 'e-back', 'e-pocket', 'e-flap'].forEach(function (id) {
      var n = document.getElementById(id);
      if (n && n.parentNode) n.parentNode.removeChild(n);
    });
    [].forEach.call(env.querySelectorAll('.triflap'), function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });

    vid.removeAttribute('autoplay');
    vid.removeAttribute('controls');
    vid.autoplay = false;
    vid.controls = false;
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

    var abierto = false;
    function entrar() {
      if (abierto) return;
      abierto = true;
      try { if (typeof abrir === 'function') abrir(); } catch (e) {}
      env.classList.add('gone');
      env.style.opacity = '0';
      env.style.visibility = 'hidden';
    }

    var fundiendo = false;
    function fundir() {
      if (fundiendo) return;
      if (!env.classList.contains('abriendo')) return;
      fundiendo = true;
      env.classList.add('fundiendo');
      setTimeout(entrar, FUNDIDO * 1000);
    }

    vid.addEventListener('timeupdate', function () {
      if (!vid.duration || !isFinite(vid.duration)) return;
      if (vid.currentTime >= vid.duration - ANTES) fundir();
    });
    vid.addEventListener('ended', fundir);

    function tocar() {
      if (env.classList.contains('abriendo')) return;
      env.classList.add('abriendo');
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
      if (env.classList.contains('abriendo')) fundir();
    });

    return true;
  }

  /* ---- 2. ATAJO: si ya vino antes, se pone el sobre sin esperar la base ---- */
  (function atajo() {
    if (listo) return;
    var m = delCatalogo(recordado());
    if (!m) { if (!catalogo()) setTimeout(atajo, 40); return; }
    if (armar(m)) listo = true;
  })();

  function revisar() {
    if (listo) {
      var s0 = sobre();
      if (s0 && s0.modelo !== undefined) {
        recordar(String(s0.tipo || '') === 'carta' ? s0.modelo : '');
      }
      return true;
    }
    var s = sobre();
    var cat = catalogo();
    if (!cat || !s || !Object.keys(s).length) return false;

    var m = elegido();
    recordar(m ? s.modelo : '');
    if (!m) { sacarTapa(); listo = true; return true; }
    if (armar(m)) { listo = true; return true; }
    return false;
  }

  var n = 0;
  var t = setInterval(function () {
    if (revisar() || ++n > 120) { clearInterval(t); sacarTapa(); }
  }, 60);
  revisar();
})();
