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

   O sea que había SEIS sobres en video cargados, un catálogo, un selector en
   el panel… y nada de eso llegaba a la pantalla.

   POR QUÉ SE ARREGLA DESDE ACÁ
   `i/index.html` pesa 185 KB y se sube a mano. El motor deja `abrir()` como
   función global, así que un módulo puede armar la apertura con el video del
   catálogo y después llamar a la MISMA `abrir()` de siempre. No se toca el
   motor y no se duplica nada.

   ★ EL FUNDIDO A BLANCO SE HACE ACÁ, NO EN EL ARCHIVO  (2/9/2026)
     Primero se horneó el fundido dentro del mp4 con ffmpeg. Mal: obligaba a
     recomprimir todo el video, y sobre un fondo gris parejo la compresión se
     nota enseguida. Maki, textual: «la calidad quedó muy mal del sobre».

     Ahora el archivo del sobre es el ORIGINAL, sin recomprimir (sólo se le
     saca el audio, que es un remux y no toca un solo píxel). El fundido lo
     hace un velo por CSS encima del video.

     Y sale mejor por tres razones, no sólo por el peso:
       · el blanco del velo es EXACTAMENTE el color que declara el catálogo, o
         sea el mismo con el que arranca la invitación: el empalme es perfecto
         por definición, no por medición;
       · se puede ajustar el tiempo sin volver a generar ni recomprimir nada;
       · sirve para cualquier sobre, incluso los que no terminan en blanco.

   CÓMO FUNCIONA
   1. Espera a que estén los datos (`INVEV.fx.sobre`) y el catálogo.
   2. Si el sobre elegido es del tipo «carta» y tiene video, apaga el sobre de
      triángulos y arma el de video.
   3. Al tocar: reproduce. Al final del video, el velo blanco sube y encima de
      ese blanco se llama a `abrir()`.

   ⚠️ NADA DE DESTELLOS AL CARGAR. El motor dibuja el sobre de triángulos
      apenas arranca, así que se veía un fogonazo del sobre viejo (verde) antes
      de que este módulo pusiera el bueno. Maki: «no quiero ver más la primera
      imagen esa». Por eso lo primero que hace el archivo, ANTES de saber nada,
      es tapar el sobre de triángulos con papel liso. Si resulta que esta
      invitación sí usa el de triángulos, se saca esa tapa enseguida y aparece
      normal.

   ⚠️ EL TOQUE VA EN CAPTURA SOBRE EL DOCUMENTO. Dos intentos fallaron antes:
        · escuchar el click en `#env` → el motor ya tenía SU listener ahí
          (puesto por `initEnvTri()`) y, como se registró primero, entraba de
          una a la invitación sin dejar correr el video;
        · una tapa transparente encima → quedaba bien arriba en el apilado,
          pero el toque igual no llegaba de forma confiable.
      Lo que sí funciona: `document.addEventListener('click', …, true)`. La
      fase de captura corre SIEMPRE antes que cualquier listener del elemento,
      no importa quién se registró primero.
      Y el botón INGRESA del motor se esconde en este modo, porque llama a
      `abrir()` directo y también se saltearía el video.

   ⚠️ SI EL VIDEO NO CORRE, EL INVITADO ENTRA IGUAL. Hay un reloj de seguridad:
      pase lo que pase, unos segundos después de tocar se llama a `abrir()`.
      Un sobre roto no puede dejar a nadie afuera de su propia invitación.
      Esto además cubre un caso real: en una pestaña que no está adelante, el
      navegador pausa el video solo (sin error y sin que nadie lo pida). En el
      celular del invitado, que siempre está adelante, corre normal.

   ⚠️ NO TOCA NADA SI EL SOBRE NO ES DEL CATÁLOGO. Las invitaciones que usan el
      sobre de triángulos siguen exactamente igual.
   ============================================================================ */
(function () {

  var FUNDIDO = 1.1;   /* segundos que dura el velo blanco al final */
  var listo = false;

  function ev()  { return (window.INVEV || {}); }
  function sobre() { return ((ev().fx || {}).sobre) || {}; }
  function catalogo() {
    var c = window.SOBRES_INVITAME;
    return (c && typeof c === 'object') ? c : null;
  }

  /* ¿este sobre es uno del catálogo, con video? */
  function elegido() {
    var s = sobre();
    if (String(s.tipo || '') !== 'carta') return null;
    var cat = catalogo();
    if (!cat) return null;
    var m = cat[s.modelo];
    if (!m || !m.video) return null;
    return m;
  }

  /* ---- 1. TAPA ANTI-DESTELLO, antes de saber nada ---- */
  var tapa = document.createElement('style');
  tapa.id = 'col-sobre-tapa';
  tapa.textContent = [
    '#env .triflap,#env #tri-seal,#env #env-bloom,#env #env-vseal,',
    '#env .scene,#env #btn-ingresar,#env .hint,#env .vhint,',
    '#env #e-back,#env #e-pocket,#env #e-flap{visibility:hidden!important}',
    '#env{background:#efeae2!important}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(tapa);

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
      '#env.carta-video .triflap,',
      '#env.carta-video #tri-seal,',
      '#env.carta-video #env-vseal,',
      '#env.carta-video #env-bloom,',
      '#env.carta-video .scene,',
      '#env.carta-video #btn-ingresar,',
      '#env.carta-video .hint,',
      '#env.carta-video #e-back,',
      '#env.carta-video #e-pocket,',
      '#env.carta-video #e-flap{display:none!important}',

      '#env.carta-video{background:' + color + '!important;cursor:pointer;',
      '  transition:opacity .6s ease,visibility .6s ease}',

      '#env.carta-video #env-vid{display:block!important;visibility:visible!important;',
      '  position:fixed;inset:0;width:100%;height:100%;',
      '  object-fit:cover;background:' + color + '}',

      /* el velo que hace el fundido, del color exacto de la invitación */
      '#col-sobre-velo{position:fixed;inset:0;z-index:8;pointer-events:none;',
      '  background:' + color + ';opacity:0;',
      '  transition:opacity ' + FUNDIDO + 's ease-in}',
      '#env.carta-video.fundiendo #col-sobre-velo{opacity:1}',

      '#env.carta-video .vhint{display:block!important;visibility:visible!important;',
      '  position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:10;',
      '  font-family:Montserrat,sans-serif;font-size:10px;font-weight:500;',
      '  letter-spacing:.22em;text-transform:uppercase;',
      '  color:rgba(60,52,44,.62);text-align:center;pointer-events:none;',
      '  transition:opacity .4s ease}',
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

    vid.setAttribute('poster', m.poster || '');
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.muted = true;
    vid.loop = false;
    vid.controls = false;
    vid.preload = 'auto';
    if (vid.getAttribute('src') !== m.video) vid.setAttribute('src', m.video);
    try { vid.load(); } catch (e) {}

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
      fundiendo = true;
      env.classList.add('fundiendo');
      setTimeout(entrar, FUNDIDO * 1000);
    }

    /* el velo arranca justo antes de que termine el video */
    vid.addEventListener('timeupdate', function () {
      if (!vid.duration || !isFinite(vid.duration)) return;
      if (vid.currentTime >= vid.duration - FUNDIDO) fundir();
    });
    vid.addEventListener('ended', fundir);

    function tocar() {
      if (env.classList.contains('abriendo')) return;
      env.classList.add('abriendo');
      var dur = (vid.duration && isFinite(vid.duration)) ? vid.duration : 5;
      /* ⚠️ el reloj de seguridad: si el video no corre, se entra igual */
      setTimeout(fundir, (dur + 1.5) * 1000);
      var p = null;
      try { p = vid.play(); } catch (err) {}
      if (p && p.catch) p.catch(function () { fundir(); });
    }

    /* ⚠️ CAPTURA en el documento: corre antes que el listener del motor */
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

  function revisar() {
    if (listo) return true;
    var s = sobre();
    var cat = catalogo();
    /* todavía no llegaron los datos: seguimos esperando con la tapa puesta */
    if (!cat || !s || !Object.keys(s).length) return false;

    var m = elegido();
    if (!m) { sacarTapa(); listo = true; return true; }   /* sobre de triángulos: normal */
    if (armar(m)) { listo = true; return true; }
    return false;
  }

  /* rápido al principio, para que la tapa dure lo menos posible */
  var n = 0;
  var t = setInterval(function () {
    if (revisar() || ++n > 120) { clearInterval(t); sacarTapa(); }
  }, 60);
  revisar();
})();
