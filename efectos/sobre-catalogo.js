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

   ★★★★★ EL ATAJO SE QUEDABA PEGADO CON EL SOBRE VIEJO  (3/9/2026)

     Se cambió el sobre de la muestra al nuevo (`anillos`), se verificó que
     estaba subido y publicado… y Maki lo abrió y vio el de antes:
     «dejaste el otro sobre, no lo subiste».

     Estaba subido. El problema era ESTE archivo:

       1. `atajo()` mira `localStorage` y arma el sobre de la ÚLTIMA visita,
          para que aparezca al instante sin esperar a Firestore. Bien.
       2. Pero además ponía `listo = true`.
       3. Y `revisar()` arrancaba con `if (listo) { …recordar…; return true; }`
          — o sea que cuando por fin llegaba el dato de verdad, lo único que
          hacía era GUARDAR el modelo nuevo. **Nunca cambiaba lo que ya estaba
          puesto en pantalla.**
       4. Encima, como devolvía `true`, el `setInterval` se cortaba en el
          primer tic, antes de que llegara el dato.

     Resultado: cualquiera que ya hubiera abierto esa invitación una vez seguía
     viendo el sobre anterior PARA SIEMPRE, aunque en la base estuviera el
     nuevo. Y no había ningún error en la consola.

     ⚠️ ESTO NO ERA UN PROBLEMA DE LA MUESTRA: afectaba a TODAS. Cada vez que
        Jazmín le cambia el sobre a una invitación ya entregada, los invitados
        que la abrieron antes seguían viendo el viejo.

     CÓMO SE ARREGLA
       · El ciclo NO se corta hasta que llegó el dato real (`revisar()` devuelve
         `false` mientras `INVEV.fx.sobre` esté vacío, aunque el atajo ya haya
         puesto algo en pantalla).
       · Se guarda QUÉ sobre está puesto (`armadoModelo`). Si el dato real no
         coincide, se corrige.
       · La corrección la hace `actualizar()`, que cambia **solamente** el
         video, el póster y el color. ⚠️ NO se vuelve a llamar a `armar()`:
         eso engancharía una segunda tanda de listeners sobre el mismo
         documento y `abrir()` terminaría llamándose dos veces.
       · Y si el invitado YA tocó (`.abriendo`), no se cambia nada: no se le
         mueve el sobre abajo del dedo mientras se está abriendo.

     → La regla general, que ya apareció con las paletas y con el itinerario:
       **un atajo de caché tiene que saber cómo corregirse.** Mostrar algo
       viejo al instante está bien; quedarse con lo viejo, no.

   ★★ LA NITIDEZ SE PIERDE EN EL ENCUADRE, NO EN EL ARCHIVO  (2/9/2026)
     Maki: «en el iphone la calidad se ve horrible». La causa no era la
     compresión: era `object-fit: cover`.

     Las cuentas, en un iPhone de 1179 × 2556 píxeles reales y un video de
     1080 × 1920:
       · con `cover` hay que tapar toda la pantalla, y como el teléfono es más
         alargado que el video, se agranda **1,33×** y se recorta casi un 20%
         de los costados;
       · con `contain` entra entero y se agranda **1,09×**.

     Se ve mucho mejor Y se ve el sobre completo, que para un objeto
     fotografiado es lo correcto: recortarlo nunca estuvo bien. Arriba y abajo
     quedan dos franjas del color del papel, y eso se lee como el sobre apoyado
     sobre una superficie.

     → Regla: un objeto fotografiado va CONTENIDO, no recortado. `cover` es
       para fondos, no para piezas.
     → Y el techo real es el archivo: Flow entrega 720 y todo lo que se hace
       después es agrandar. Acá se sube a 1080 con lanczos antes de publicarlo.

   ★ EL FUNDIDO A BLANCO SE HACE ACÁ, NO EN EL ARCHIVO  (2/9/2026)
     Primero se horneó el fundido dentro del mp4 con ffmpeg. Mal: obligaba a
     recomprimir todo el video, y sobre un fondo gris parejo la compresión se
     nota enseguida. El fundido lo hace un velo por CSS, del color EXACTO con
     el que arranca la invitación, así el empalme es perfecto por definición.

   ★ Y EL PÓSTER ES MEDIA CALIDAD DEL SOBRE
     El póster es lo que se ve ANTES de tocar. Si sale comprimido, el sobre
     parece feo aunque el video esté perfecto. Se saca del video ya agrandado
     y en máxima calidad.

   ★★ LOS VIDEOS GENERADOS RESPIRAN: SE ABREN Y SE VUELVEN A CERRAR (2/9/2026)
     El sobre de Perlas llega a su punto más abierto cerca de los 2,6 s y en el
     segundo final se cierra de nuevo. Por eso el velo arranca en el momento
     más abierto (`duration - ANTES`), no al terminar.
     → Al sumar un sobre nuevo: sacarle cuadros con ffmpeg y BUSCAR el momento
       más abierto. El mejor cuadro casi nunca es el último.

   ★★★ EL `<video>` DEL MOTOR VIENE CON `autoplay` (2/9/2026)
     `#env-vid` trae `autoplay` escrito en el HTML. Con el sobre de triángulos
     no se notaba porque estaba escondido; acá la invitación **se abría sola**.
     Se le saca el atributo y se lo deja en pausa. Y el velo sólo puede arrancar
     si el invitado ya tocó.

   ★★★ Y SAFARI LE PONE SUS PROPIOS CONTROLES (2/9/2026)
     En la Mac apareció la barra de reproducción encima del sobre. Pasa cuando
     Safari bloquea el autoplay. No alcanza con `controls = false`: hay que
     apagar los pseudo-elementos `::-webkit-media-controls*`, y para el video
     ESTÉ DONDE ESTÉ, porque aparecen antes de que se ponga la clase.

   ★★★★ EL PRIMER SEGUNDO TAMBIÉN ES LA INVITACIÓN  (2/9/2026)
     Maki: «no quiero ver más la primera imagen esa», «apenas abrís, 1 segundo
     o más». Eran dos cosas: la tapa escondía una LISTA y por ahí se colaban el
     monograma y el botón INGRESA (ahora esconde todos los hijos de `#env`), y
     la espera del dato (ahora el sobre elegido se guarda en `localStorage`, así
     que desde la segunda visita aparece al instante).
     → Regla: mientras se espera un dato no se muestra una versión provisoria.
       Se muestra NADA, y lo que aparece después aparece con un fundido.

   ⚠️ EL TOQUE VA EN CAPTURA SOBRE EL DOCUMENTO. Escuchar el click en `#env` no
      sirve: el motor ya tenía SU listener ahí y entraba de una sin dejar correr
      el video. Lo que funciona es `document.addEventListener('click', …, true)`.

   ⚠️ SI EL VIDEO NO CORRE, EL INVITADO ENTRA IGUAL. Reloj de seguridad: unos
      segundos después de TOCAR se llama a `abrir()` pase lo que pase.

   ⚠️ NO TOCA NADA SI EL SOBRE NO ES DEL CATÁLOGO.
   ============================================================================ */
(function () {

  var FUNDIDO = 1.0;   /* cuánto dura el velo blanco */
  var ANTES   = 1.4;   /* cuánto antes del final arranca: el sobre se cierra */
  var listo = false;

  /* ⚠️ QUÉ SOBRE ESTÁ PUESTO EN PANTALLA AHORA MISMO. Sin esto no hay forma de
     saber que el atajo puso uno viejo. Ver la nota del encabezado. */
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

      /* ⚠️ CONTAIN, no cover: el sobre entra entero y casi no se agranda.
         Con cover se estiraba 1,33× y se comía los costados. */
      '#env.carta-video #env-vid{display:block!important;',
      '  position:fixed;inset:0;width:100%;height:100%;',
      '  object-fit:contain;background:' + color + ';',
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

  /* ⚠️ LA CORRECCIÓN DEL ATAJO.
     Cambia SÓLO el video, el póster y el color. No vuelve a enganchar los
     listeners: si se llamara otra vez a `armar()` quedarían dos tandas sobre
     el mismo documento y `abrir()` se llamaría dos veces. */
  function actualizar(m, id) {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return false;

    /* si ya lo tocó, no se le cambia el sobre abajo del dedo */
    if (env.classList.contains('abriendo')) return false;

    estilo(m.color || '#f4f2ee');
    vid.setAttribute('poster', m.poster || '');
    if (vid.getAttribute('src') !== m.video) {
      vid.setAttribute('src', m.video);
      try { vid.load(); vid.pause(); vid.currentTime = 0; } catch (e) {}
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
    ['tri-seal', 'e-back', 'e-pocket', 'e-flap'].forEach(function (id2) {
      var n = document.getElementById(id2);
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

    armadoModelo = id;
    return true;
  }

  /* ---- 2. ATAJO: si ya vino antes, se pone el sobre sin esperar la base ----
     ⚠️ Pone algo en pantalla, pero NO da el tema por cerrado: la corrección la
     hace `revisar()` cuando llega el dato de verdad. */
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
      /* ⚠️ mientras no llegue el dato real seguimos mirando: si el atajo puso
         un sobre viejo, esta es la única oportunidad de corregirlo */
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
