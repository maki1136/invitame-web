/* ===== EL SOBRE DEL CATÁLOGO, POR FIN CONECTADO ==============================

   EL BUG, que dejaba muerta una función entera
   El motor (`i/index.html`) decide cómo se abre la invitación con esta línea:

       if (CONFIG.sobreTriangulos) { initEnvTri(); } else { initEnvVideo(); }

   Y `CONFIG.sobreTriangulos` está **fijo en true** dentro del propio motor. No
   sale de los datos, no sale del panel: está escrito ahí. Resultado: TODAS las
   invitaciones abren con el sobre de triángulos, y el sobre que Jazmín elige
   en «✨ Efectos → Sobre del catálogo» no se usa nunca.

   Encima, `initEnvVideo()` —el otro camino— tampoco sirve: usa un video fijo
   del propio CONFIG (`sobreVideo`, el marfil viejo con el sello encimado), no
   el del catálogo.

   O sea que había SEIS sobres en video cargados, un catálogo, un selector en
   el panel… y nada de eso llegaba a la pantalla.

   POR QUÉ SE ARREGLA DESDE ACÁ
   `i/index.html` pesa 185 KB y se sube a mano. El motor deja `abrir()` como
   función global, así que un módulo puede armar la apertura con el video del
   catálogo y después llamar a la MISMA `abrir()` de siempre. No se toca el
   motor y no se duplica nada.

   CÓMO FUNCIONA
   1. Espera a que estén los datos (`INVEV.fx.sobre`) y el catálogo.
   2. Si el sobre elegido es del tipo «carta» y tiene video, apaga el sobre de
      triángulos y arma el de video.
   3. Al tocar: reproduce. Cuando el video termina, llama a `abrir()`.

   ⚠️ HAY QUE TAPAR EL TOQUE DEL MOTOR, NO SÓLO ESCUCHARLO.
      Primer intento: escuchar el click en `#env`. No sirvió — el motor ya
      tenía SU listener puesto ahí por `initEnvTri()`, y como se registró
      antes, entraba de una a la invitación sin dejar correr el video. Sacar
      los nodos del sobre viejo no saca los listeners.
      → Solución: una tapa transparente a pantalla completa, por encima del
        video, que se queda con el toque y lo corta con `stopPropagation()`.
        Y el botón INGRESA del motor se esconde en este modo, porque llama a
        `abrir()` directo y también se saltearía el video.

   ⚠️ EL VIDEO TERMINA EN BLANCO Y POR ESO NO SE VE EL CORTE. Los sobres
      `lazo`, `toscana` y `perlas` están hechos así: el último cuadro es un
      blanco parejo, y la invitación entra desde ahí. El `color` del catálogo
      es ese blanco MEDIDO, y se usa acá para pintar el fondo de `#env`, así
      no hay ni un parpadeo entre el fin del video y la portada.

   ⚠️ SI EL VIDEO NO CARGA, EL INVITADO ENTRA IGUAL. Hay un reloj de seguridad:
      pase lo que pase, unos segundos después de tocar se llama a `abrir()`.
      Un sobre roto no puede dejar a nadie afuera de su propia invitación.

   ⚠️ NO TOCA NADA SI EL SOBRE NO ES DEL CATÁLOGO. Las invitaciones que usan el
      sobre de triángulos siguen exactamente igual: el módulo se planta y no
      hace nada.

   ⚠️ LAS SOLAPAS DEL SOBRE VIEJO SE ESCONDEN ACÁ, NO EN catalogo.js. Ese
      archivo también las esconde, pero dentro de un `@media (min-width:680px)`:
      en el celular asomaban por debajo del video. Acá se esconden siempre.
   ============================================================================ */
(function () {

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

  function estilo(color) {
    var st = document.getElementById('col-sobrecat-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'col-sobrecat-css';
      document.head.appendChild(st);
    }
    st.textContent = [
      /* que no asome NADA del sobre viejo, tampoco en el celular */
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

      /* el fondo es el blanco con el que termina el video: sin parpadeo */
      '#env.carta-video{background:' + color + '!important;',
      '  transition:opacity .7s ease,visibility .7s ease}',

      '#env.carta-video #env-vid{display:block!important;',
      '  position:fixed;inset:0;width:100%;height:100%;',
      '  object-fit:cover;background:' + color + '}',

      /* la tapa que se queda con el toque */
      '#col-sobre-tap{position:fixed;inset:0;z-index:9;cursor:pointer;',
      '  background:transparent}',

      '#env.carta-video .vhint{display:block!important;position:fixed;',
      '  left:50%;bottom:34px;transform:translateX(-50%);z-index:10;',
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

    estilo(m.color || '#f4f2ee');

    /* fuera el sobre de triángulos y el modo video viejo */
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

    /* el cartelito de siempre */
    var hint = env.querySelector('.vhint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'vhint';
      env.appendChild(hint);
    }
    hint.textContent = 'Toca para abrir';

    var abierto = false;
    function entrar() {
      if (abierto) return;
      abierto = true;
      try { if (typeof abrir === 'function') abrir(); } catch (e) {}
      env.classList.add('gone');
      env.style.opacity = '0';
      env.style.visibility = 'hidden';
    }

    /* ⚠️ la tapa: se queda con el toque para que el motor no entre antes */
    var tapa = document.getElementById('col-sobre-tap');
    if (!tapa) {
      tapa = document.createElement('div');
      tapa.id = 'col-sobre-tap';
      env.appendChild(tapa);
    }

    function tocar(e) {
      if (e) { e.stopPropagation(); e.preventDefault(); }
      if (env.classList.contains('abriendo')) return;
      env.classList.add('abriendo');
      if (tapa && tapa.parentNode) tapa.style.pointerEvents = 'none';
      var dur = (vid.duration && isFinite(vid.duration)) ? vid.duration : 6;
      /* ⚠️ el reloj de seguridad: si el video no arranca, se entra igual */
      setTimeout(entrar, (dur + 1.2) * 1000);
      var p = null;
      try { p = vid.play(); } catch (err) {}
      if (p && p.catch) p.catch(function () { entrar(); });
    }

    tapa.addEventListener('click', tocar);
    tapa.addEventListener('touchstart', tocar, { passive: false });
    vid.addEventListener('ended', entrar);
    vid.addEventListener('error', function () {
      if (env.classList.contains('abriendo')) entrar();
    });

    return true;
  }

  function revisar() {
    if (listo) return;
    var m = elegido();
    if (!m) return;
    if (armar(m)) listo = true;
  }

  var n = 0;
  var t = setInterval(function () {
    revisar();
    if (listo || ++n > 60) clearInterval(t);
  }, 250);
  revisar();
})();
