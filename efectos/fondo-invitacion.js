/* ===== EL FONDO DE LA INVITACIÓN =============================================

   Reemplaza el papel crudo de la invitación por una imagen o un video —plumas,
   seda, agua— y deja que se vea a través de las secciones claras.

   Cómo se enciende:
     INVEV.fx.fondo = {
       tipo:  'video' | 'imagen',
       url:    'https://…',       // el archivo
       poster: 'https://…',       // foto fija, para cuando el video no corre
       fuerza: 1,                 // cuánto se marca el dibujo (1 = tal cual)
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

   ⚠️ CON UNA FOTO PÁLIDA, EL VELO LA BORRA.          ← esto costó otra vuelta
      Las plumas, la seda y el mármol claro son casi blancos de por sí. Si
      encima se les pone velo, el resultado no es "suave": es blanco liso, y
      parece que la invitación se rompió. Con fondos claros hay que BAJAR el
      velo y subir la FUERZA (contraste), no al revés. El velo es para fondos
      con dibujo fuerte o color, que sí tapan el texto.
      Y ojo con la MEDIDA del archivo: una foto de 256 px estirada a la
      pantalla de una Mac no tiene dibujo que mostrar, tenga el velo que tenga.

   ⚠️ LAS SECCIONES CLARAS SE ABREN, LAS DE COLOR NO.
      El crudo es lo que hay que reemplazar. Las secciones de color son las que
      le dan el ritmo a la invitación — si se abren todas, se pierde el pulso y
      encima el texto claro sobre fondo pálido deja de leerse. Por eso son dos
      perillas separadas y la de las oscuras arranca en 0.

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
          fuerza: parseFloat(u.get('fuerza') || '1'),
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
    /* la fuerza se aplica igual al video y a la foto, así no se nota el cambio
       cuando uno reemplaza al otro */
    '#' + ID + ' > video, #' + ID + ' > img{filter:contrast(var(--inv-fuerza,1))' +
      ' saturate(calc(1 + (var(--inv-fuerza,1) - 1) * .7))}' +
    /* afuera: desenfocado y un poco agrandado, para que el desenfoque no deje
       borde transparente contra los cantos de la pantalla */
    '#' + IDF + ' > img{filter:blur(22px) saturate(.88) contrast(var(--inv-fuerza,1));' +
      'transform:scale(1.12)}' +
    '#' + ID + ' > .velo, #' + IDF + ' > .velo{position:absolute;inset:0}' +
    'html[data-fondo] .frame{position:relative;z-index:1;background:transparent !important}' +
    /* las claras se abren para que se vea el fondo */
    'html[data-fondo] .sec{background-color:color-mix(in srgb, var(--sec-col,transparent)' +
      ' calc(100% - var(--inv-paso,0) * 100%), transparent) !important}' +
    /* las de color, aparte: por defecto quedan como están */
    'html[data-fondo] .sec.verde{background-color:color-mix(in srgb, var(--sec-col-v,var(--verde))' +
      ' calc(100% - var(--inv-oscuras,0) * 100%), transparent) !important}';

  function hoja() {
    var s = document.getElementById('inv-fondo-css');
    if (s) { s.textContent = CSS; return; }
    s = document.createElement('style');
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
    raiz.style.removeProperty('--inv-fuerza');
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
    if (a <= 0) return;                       /* velo 0 = ni se crea la capa */
    var velo = document.createElement('div');
    velo.className = 'velo';
    velo.style.background = 'color-mix(in srgb, var(--lino,#f4efe6) ' +
      Math.round(Math.min(1, a) * 100) + '%, transparent)';
    caja.appendChild(velo);
  }

  function foto(caja, src) {
    var im = document.createElement('img');
    im.src = src; im.alt = '';
    caja.insertBefore(im, caja.firstChild);
  }

  /* ⚠️ LA FOTO DE RESPALDO DEL VIDEO ESTABA ROTA, Y NO SE NOTABA. (14/9/2026)
     Cuando el fondo es un video, el `<video>` necesita una foto fija para
     mostrar mientras carga —y para cuando NO puede reproducir: iPhone en modo
     de ahorro de batería, datos apagados, conexión lenta—. Medido en
     camila-y-tomas: la dirección guardada era
         /image/upload/so_1.5/v178…/archivo.jpg
     y Cloudinary respondía 404. `so_1.5` quiere decir «el cuadro del segundo
     1,5 DEL VIDEO», y eso sólo existe bajo `/video/upload/`, nunca bajo
     `/image/upload/`. O sea: el invitado que no podía ver el video no veía
     NADA de fondo, y nadie se enteraba porque el 404 es silencioso.
     Se arregla en dos pasos, sin tocar los datos de nadie:
       1. si la foto guardada tiene esa forma imposible, se la corrige;
       2. si directamente no hay foto y el video es de Cloudinary, se saca una
          del propio video.
     Verificado contra Cloudinary: la de `/video/upload/` responde 200. */
  function cuadroDelVideo(url) {
    if (typeof url !== 'string' || url.indexOf('res.cloudinary.com') < 0) return '';
    var m = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^\/]+)\/video\/upload\/(?:[^\/]*\/)?(v\d+\/.+?)\.[a-z0-9]+$/i);
    if (!m) return '';
    return m[1] + '/video/upload/so_1.5,f_auto,q_auto:good,w_1200,c_limit/' + m[2] + '.jpg';
  }
  function posterSano(f) {
    var p = f.poster || '';
    /* forma imposible: un cuadro de video pedido por la puerta de las fotos */
    if (/\/image\/upload\/[^\/]*so_[\d.]+/.test(p)) {
      p = p.replace('/image/upload/', '/video/upload/');
    }
    if (!p && f.tipo === 'video') p = cuadroDelVideo(f.url);
    return p;
  }

  function poner(f) {
    hoja();
    sacar();

    var a = (typeof f.velo === 'number') ? f.velo : 0.3;
    f.poster = posterSano(f);
    var fija = f.poster || f.url;

    raiz.style.setProperty('--inv-fuerza', String(
      Math.max(0.5, Math.min(2.2, (typeof f.fuerza === 'number' && f.fuerza) ? f.fuerza : 1))));

    /* ---- la de AFUERA, sólo si se pidió que ocupe toda la pantalla ---- */
    if (f.donde === 'pantalla') {
      var fu = document.createElement('div');
      fu.id = IDF;
      foto(fu, fija);                /* siempre fija: desenfocada, moverse no aporta */
      /* un poco más velada que la de adentro: lo de afuera acompaña, no compite */
      velar(fu, a > 0 ? Math.min(1, a + 0.12) : 0.06);
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

      /* ⚠️⚠️ EL PLAZO SE CUENTA POR PROGRESO, NO POR RELOJ DE PARED.
         BUG MEDIDO EL 18/9/2026 EN renata-y-patricio.

         Maki: «en la Mac no tiene movimiento pero en el iPhone si». No era el
         video ni el aparato: era una CARRERA por la conexion. Medido con
         performance.getEntriesByType('resource') en una carga limpia:

           sobre-perlas.mp4 (1,1 MB) ... empieza a 1016 ms, termina a 1219 ms
           re-fondo.mp4     (785 KB) ... EMPIEZA A BAJARSE RECIEN A 4187 ms

         O sea: el navegador pone el video del fondo en la cola detras del video
         del sobre y del resto de la pagina, y a los 3500 ms -cuando saltaba el
         plazo viejo- ese video todavia NO HABIA EMPEZADO. videoWidth valia 0
         porque no habia llegado un solo byte, no porque estuviera roto.
         Comprobado aparte: el archivo se decodifica en 78 ms y reproduce
         perfecto. Y en el iPhone de Maki andaba porque ya lo tenia en cache.

         Este vigia mira el PROGRESO, igual que el del sobre: se rinde solo si el
         video pasa PLAZO milisegundos sin avanzar NADA -ni bytes en el buffer,
         ni readyState, ni medida-. Mientras la descarga progrese, se lo espera. */
      var rendido = false;
      function rendirse() {
        if (rendido) return;
        rendido = true;
        clearInterval(vigia);
        if (!v.parentNode) return;
        v.removeAttribute('src'); v.load();   /* que suelte la descarga */
        v.remove();
        foto(caja, fija);
      }
      function anduvo() { rendido = true; clearInterval(vigia); }

      /* cualquier señal de vida sirve, no sólo loadeddata */
      function sena() {
        try { return v.videoWidth + v.readyState + (v.buffered.length ? v.buffered.end(0) : 0); }
        catch (e) { return v.readyState; }
      }
      var ultima = sena(), quieto = 0;
      var vigia = setInterval(function () {
        if (rendido) { clearInterval(vigia); return; }
        if (v.videoWidth) { anduvo(); return; }   /* ya midió: está vivo */
        var ahora = sena();
        if (ahora !== ultima) { ultima = ahora; quieto = 0; }
        else { quieto += 500; }
        if (quieto >= PLAZO) rendirse();
      }, 500);

      v.addEventListener('loadeddata', anduvo, { once: true });
      v.addEventListener('error', rendirse, { once: true });

      /* ⚠️ Un play() rechazado NO es un video roto: casi siempre es «todavía no».
         Se reintenta cuando llegan los datos; el que decide si se rinde es el
         vigía de arriba, que es el único que mira si de verdad avanza. */
      function arrancar() {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
      arrancar();
      v.addEventListener('loadeddata', arrancar, { once: true });
      v.addEventListener('canplay', arrancar, { once: true });
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
    var nueva = JSON.stringify([f.tipo, f.url, f.poster, f.fuerza, f.velo, f.paso, f.oscuras, f.donde]);
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
