/* ===== EL FONDO DE LA INVITACIÓN =============================================

   Reemplaza el papel crudo de la invitación por una imagen o un video —plumas,
   seda, agua— y deja que se vea a través de las secciones claras.

   Cómo se enciende:
     INVEV.fx.fondo = {
       tipo:  'video' | 'imagen',
       url:    'https://…',       // el archivo
       poster: 'https://…',       // foto fija, para cuando el video no corre
       velo:   0.30,              // cuánto se apaga el fondo (0 a 1)
       paso:   0.85,              // cuánto lo dejan pasar las secciones CLARAS
       oscuras:0,                 // y cuánto las de color (0 = quedan opacas)
       donde:  'marco'            // 'marco' (sólo la columna) | 'pantalla' (todo)
     }
   Cómo se apaga: INVEV.fx.fondo = {} — vuelve todo como está hoy.

   ⚠️ VA DENTRO DE LA COLUMNA, NO DETRÁS DE LA PANTALLA.  ← esto costó una vuelta
      La primera versión lo ponía detrás de todo. En la compu asomaba apenas a
      los costados del marco; en el CELULAR no se veía nada, porque ahí la
      columna ocupa toda la pantalla y costados no hay.
      Ahora la capa se alinea con la columna: es el papel de la invitación.

   ⚠️ EN 'pantalla' SON DOS CAPAS, NO UNA ESTIRADA.   ← esto costó otra vuelta
      El archivo es vertical (9:16, hecho para el teléfono). Estirarlo a la
      pantalla de una Mac (16:9) lo recorta al centro y lo agranda: queda
      lavado y pixelado, y peor todavía, ADENTRO de la columna se ve el mismo
      recorte feo. Por eso:
        · AFUERA  → la misma foto, desenfocada y agrandada. Lee como
                    profundidad, no como un archivo de baja calidad, y llena
                    el 16:9 sin dejar franjas.
        · ADENTRO → la foto nítida, alineada a la columna, como en 'marco'.
      Afuera se usa SIEMPRE la foto fija (nunca un segundo video): la parte
      desenfocada no gana nada con moverse y sí cuesta batería.

   ⚠️ UN VIDEO QUE NO ARRANCA NO AVISA.               ← esto costó otra vuelta
      Se probó con un archivo sano y con un mp4 público conocido: cuando el
      navegador no puede decodificar H.264, NO tira error ni rechaza play().
      Se queda en readyState 0 para siempre, y la invitación queda en blanco
      sin que nadie se entere. Por eso, además del error y del play() fallido,
      hay un PLAZO: si en 3,5 s no llegó ni la medida del video, se cambia por
      la foto fija. Es la única de las tres señales que funciona en ese caso.

   ⚠️ LAS SECCIONES CLARAS SE ABREN, LAS DE COLOR NO.
      El crudo es lo que hay que reemplazar. Las secciones de color son las que
      le dan el ritmo a la invitación — si se abren todas, se pierde el pulso y
      encima el texto claro sobre fondo pálido deja de leerse. Por eso son dos
      perillas separadas y la de las oscuras arranca en 0.

   ⚠️ EL VELO NO ES DECORACIÓN, ES LEGIBILIDAD.
      Medido sobre una invitación real: un fondo con dibujo detrás de un texto
      chico lo vuelve ilegible. El velo lo apaga antes de que se vea el texto.

   ⚠️ EN EL CELULAR, VIDEO SÓLO SI CONVIENE.
      Si la persona pidió menos movimiento, si el navegador avisa que está
      ahorrando datos, o si el aparato tiene poca memoria, se usa la foto fija.
      Un fondo lindo que come batería en una fiesta es un fondo malo.
   ============================================================================ */
(function () {
  'use strict';

  var ID    = 'inv-fondo';        /* la capa de adentro, nítida */
  var IDF   = 'inv-fondo-fuera';  /* la de afuera, desenfocada */
  var PLAZO = 3500;               /* lo que se le da al video antes de rendirse */

  function conf() {
    var f = {};
    try { f = ((window.INVEV || {}).fx || {}).fondo || {}; } catch (e) {}
    try {
      var u = new URLSearchParams(location.search);
      if (u.get('fondo')) {
        f = {
          tipo: u.get('fondoTipo') || 'imagen',
          url:  u.get('fondo'),
          poster: u.get('fondoPoster') || '',
          velo: parseFloat(u.get('velo') || '0.3'),
          paso: parseFloat(u.get('paso') || '0.85'),
          oscuras: parseFloat(u.get('oscuras') || '0'),
          donde: u.get('donde') || 'marco'
        };
      }
    } catch (e) {}
    return f;
  }

  function videoConviene() {
    try {
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      var c = navigator.connection || {};
      if (c.saveData) return false;
      if (/2g/.test(c.effectiveType || '')) return false;
      if (navigator.deviceMemory && navigator.deviceMemory < 3) return false;
    } catch (e) {}
    return true;
  }

  var CSS =
    '#' + ID + ',#' + IDF + '{position:fixed;top:0;bottom:0;z-index:0;overflow:hidden;pointer-events:none}' +
    '#' + IDF + '{left:0;right:0;z-index:0}' +
    '#' + ID + '{z-index:0}' +
    '#' + ID + ' > video, #' + ID + ' > img,' +
    '#' + IDF + ' > video, #' + IDF + ' > img{width:100%;height:100%;object-fit:cover;display:block}' +
    /* afuera: desenfocado y un poco agrandado, para que el desenfoque no deje
       borde transparente contra los cantos de la pantalla */
    '#' + IDF + ' > img{filter:blur(22px) saturate(.88);transform:scale(1.12)}' +
    '#' + ID + ' > .velo, #' + IDF + ' > .velo{position:absolute;inset:0}' +
    'html[data-fondo] .frame{position:relative;z-index:1;background:transparent !important}' +
    /* las claras se abren para que se vea el fondo */
    'html[data-fondo] .sec{background-color:color-mix(in srgb, var(--sec-col,transparent)' +
      ' calc(100% - var(--inv-paso,0) * 100%), transparent) !important}' +
    /* las de color, aparte: por defecto quedan como están */
    'html[data-fondo] .sec.verde{background-color:color-mix(in srgb, var(--sec-col-v,var(--verde))' +
      ' calc(100% - var(--inv-oscuras,0) * 100%), transparent) !important}';

  function hoja() {
    if (document.getElementById('inv-fondo-css')) return;
    var s = document.createElement('style');
    s.id = 'inv-fondo-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var raiz = document.documentElement;
  var firma = null;

  function sacar() {
    [ID, IDF].forEach(function (i) {
      var v = document.getElementById(i);
      if (v) v.remove();
    });
    raiz.removeAttribute('data-fondo');
    raiz.style.removeProperty('--inv-paso');
    raiz.style.removeProperty('--inv-oscuras');
  }

  /* la capa se alinea con la columna: ése es el papel de la invitación */
  function alinear(caja) {
    var marco = document.querySelector('.frame');
    if (!marco) { caja.style.left = '0'; caja.style.right = '0'; caja.style.width = 'auto'; return; }
    var r = marco.getBoundingClientRect();
    caja.style.left  = Math.round(r.left) + 'px';
    caja.style.width = Math.round(r.width) + 'px';
    caja.style.right = 'auto';
  }

  function velar(caja, a) {
    var velo = document.createElement('div');
    velo.className = 'velo';
    velo.style.background = 'color-mix(in srgb, var(--lino,#f4efe6) ' +
      Math.round(Math.max(0, Math.min(1, a)) * 100) + '%, transparent)';
    caja.appendChild(velo);
  }

  function foto(caja, src) {
    var im = document.createElement('img');
    im.src = src; im.alt = '';
    caja.insertBefore(im, caja.firstChild);
  }

  function poner(f) {
    hoja();
    sacar();

    var a = (typeof f.velo === 'number') ? f.velo : 0.3;
    var fija = f.poster || f.url;

    /* ---- la de AFUERA, sólo si se pidió que ocupe toda la pantalla ---- */
    if (f.donde === 'pantalla') {
      var fu = document.createElement('div');
      fu.id = IDF;
      foto(fu, fija);                /* siempre fija: desenfocada, moverse no aporta */
      /* un poco más velada que la de adentro: lo de afuera acompaña, no compite */
      velar(fu, Math.min(1, a + 0.12));
      document.body.insertBefore(fu, document.body.firstChild);
    }

    /* ---- la de ADENTRO, siempre: es el papel de la invitación ---- */
    var caja = document.createElement('div');
    caja.id = ID;

    var usaVideo = f.tipo === 'video' && videoConviene();
    if (usaVideo) {
      var v = document.createElement('video');
      v.src = f.url;
      if (f.poster) v.poster = f.poster;
      v.autoplay = true; v.loop = true; v.muted = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.playsInline = true;
      v.preload = 'auto';
      caja.appendChild(v);

      /* se rinde una sola vez, venga por donde venga la mala noticia */
      var rendido = false;
      function rendirse() {
        if (rendido) return;
        rendido = true;
        if (!v.parentNode) return;
        v.removeAttribute('src'); v.load();   /* que suelte la descarga */
        v.remove();
        foto(caja, fija);
      }
      function anduvo() { rendido = true; }   /* ya arrancó: cancela el plazo */

      v.addEventListener('loadeddata', anduvo, { once: true });
      v.addEventListener('error', rendirse, { once: true });
      setTimeout(function () { if (!v.videoWidth) rendirse(); }, PLAZO);

      var p = v.play();
      if (p && p.catch) p.catch(rendirse);
    } else {
      foto(caja, fija);
    }

    velar(caja, a);

    document.body.insertBefore(caja, document.body.firstChild);
    raiz.setAttribute('data-fondo', f.tipo === 'video' ? 'video' : 'imagen');
    raiz.style.setProperty('--inv-paso', String(
      Math.max(0, Math.min(1, (typeof f.paso === 'number') ? f.paso : 0.85))));
    raiz.style.setProperty('--inv-oscuras', String(
      Math.max(0, Math.min(0.6, (typeof f.oscuras === 'number') ? f.oscuras : 0))));

    alinear(caja);
  }

  function sincronizar() {
    var f = conf();
    var nueva = JSON.stringify([f.tipo, f.url, f.poster, f.velo, f.paso, f.oscuras, f.donde]);
    if (nueva === firma) return;
    firma = nueva;
    if (!f || !f.tipo || !(f.url || f.poster)) { sacar(); return; }
    poner(f);
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    sincronizar();
  }
  arrancar();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar, { once: true });
  }
  window.addEventListener('message', function () { setTimeout(sincronizar, 0); }, false);

  /* el marco puede cambiar de ancho cuando se abre el sobre o gira el teléfono */
  function reAlinear() {
    var c = document.getElementById(ID);
    if (c) alinear(c);
  }
  addEventListener('resize', reAlinear, { passive: true });
  setInterval(reAlinear, 1200);

  var esPrevia = /[?&]preview=1/.test(location.search);
  setInterval(sincronizar, esPrevia ? 500 : 1600);
})();
