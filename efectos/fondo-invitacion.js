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
  var repintes = 0;
  var pasoElegido = false;
  var esPrevia = /[?&]preview=1/.test(location.search);
  /* cuando velo-legible.js cambia una sección, se repinta (también en la publicada,
     donde el repintado periódico se corta a los 12 s) */
  try {
    new MutationObserver(function (m) {
      if (raiz.getAttribute('data-fondo') && m.some(function (x) { return x.attributeName === 'data-velo-auto'; })) setTimeout(pintar, 0);
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-velo-auto'] });
  } catch (e) {}

  function sacar() {
    [ID, IDF].forEach(function (i) {
      var v = document.getElementById(i);
      if (v) v.remove();
    });
    raiz.removeAttribute('data-fondo');
    despintar();
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
    var m = url.match(/^(https?:\/\/(?:galeria\.littlemomentsok\.workers\.dev\/)?res\.cloudinary\.com\/[^\/]+)\/video\/upload\/(?:[^\/]*\/)?(v\d+\/.+?)\.[a-z0-9]+$/i);
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

  /* ⚠️⚠️ UN GIF CARGADO COMO VIDEO NO ES UN VIDEO. (29/9/2026)
     Medido en isabella: el panel guardó
         tipo:'video', url: …/image/upload/v…/j1g8expap7aacg1ag7xg.gif
     Un <video> no reproduce un GIF: se quedaba en readyState 0, el vigía
     se rendía y ponía el GIF como foto — 6,2 MB para el celular del invitado.
     Cloudinary sirve el MISMO archivo como mp4 con sólo cambiar la
     extensión (medido: 75 KB, video/mp4), y como .jpg da el primer cuadro.
     Así que un GIF de Cloudinary se usa como video, siempre; y un GIF de
     otro lado, como foto (nunca en un <video>). */
  function sinGif(f) {
    var u = f.url || '';
    if (!/\.gif(\?|$)/i.test(u)) return f;
    var g = {}; for (var k in f) g[k] = f[k];
    if (u.indexOf('res.cloudinary.com') >= 0) {
      g.tipo = 'video';
      g.url = u.replace(/\.gif(\?|$)/i, '.mp4$1');
      if (!g.poster || /\.gif(\?|$)/i.test(g.poster)) g.poster = u.replace(/\.gif(\?|$)/i, '.jpg$1');
    } else {
      g.tipo = 'imagen';
    }
    return g;
  }

  /* ⚠️⚠️ LAS COLECCIONES TAPABAN EL FONDO. (29/9/2026)
     Jazmín: «no se guardan los fondos». Sí se guardaban y sí se ponían:
     medido en isabella (Sapo), el video estaba detrás, pero Sapo pinta cada
     sección con `html[data-col][data-coleccion] section.sec{background-color:
     …!important}` y le gana a la regla de acá. Sólo Campestre y Marfil lo
     tenían resuelto a mano; las otras veinte, no.
     Arreglo de una vez para todas: cuando hay fondo, se MIDE el color que la
     colección le da a cada sección (sin el fondo puesto) y se le escribe en
     la propia sección, ya abierto según «cuánto lo dejan pasar». Un estilo
     escrito en el elemento con !important le gana a cualquier hoja, así que
     ninguna colección puede volver a taparlo, y sin fondo no se toca nada. */
  function rgba(c) {
    var m = String(c || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  /* ⚠️⚠️ SÓLO SE BORRA LO QUE ESCRIBIÓ ESTE MÓDULO. (30/9/2026)
     banda-tematica.js también escribe el color de las `.sec.verde` en el propio
     elemento. Los dos se pisaban según quién corría último, y la miniatura y la
     invitación publicada salían DISTINTAS (medido en regina-y-emiliano, ivanna,
     julieta, luciana: bandas claras en una, oscuras en la otra). Ahora se
     guarda el valor escrito y sólo se borra si sigue siendo ése; si otro módulo
     lo cambió, la sección es de él y acá no se toca más. */
  function despintar() {
    [].forEach.call(document.querySelectorAll('[data-fondo-pinta]'), function (el) {
      var mio = el.getAttribute('data-fondo-valor');
      if (el.getAttribute('data-fondo-pinta') === 'sec' && mio && el.style.getPropertyValue('background-color') !== mio) {
        el.removeAttribute('data-fondo-pinta'); el.removeAttribute('data-fondo-valor');
        el.setAttribute('data-fondo-ajena', '1');
        return;
      }
      el.removeAttribute('data-fondo-valor');
      el.style.removeProperty('background-color');
      if (el.getAttribute('data-fondo-tex')) { el.style.removeProperty('background-image'); el.removeAttribute('data-fondo-tex'); }
      if (el.getAttribute('data-fondo-pinta') === 'marco') el.style.removeProperty('background');
      el.removeAttribute('data-fondo-pinta');
    });
  }
  function pintar() {
    var tipo = raiz.getAttribute('data-fondo');
    if (!tipo) return;
    var paso = parseFloat(raiz.style.getPropertyValue('--inv-paso')) || 0;
    var osc  = parseFloat(raiz.style.getPropertyValue('--inv-oscuras')) || 0;
    var secs = [].slice.call(document.querySelectorAll('.frame .sec, .frame > section'));
    var marco = document.querySelector('.frame');
    /* medir sin el fondo: se saca un instante (no llega a pintarse) */
    despintar();
    raiz.removeAttribute('data-fondo');
    /* si el otro módulo soltó la sección (se apagó la banda), vuelve a ser de acá */
    secs.forEach(function (el) { if (el.getAttribute('data-fondo-ajena') && !el.style.getPropertyValue('background-color')) el.removeAttribute('data-fondo-ajena'); });
    var cols = secs.map(function (el) { return getComputedStyle(el).backgroundColor; });
    var texs = secs.map(function (el) { return getComputedStyle(el).backgroundImage || ''; });
    raiz.setAttribute('data-fondo', tipo);
    secs.forEach(function (el, i) {
      /* el color ya lo escribió otro módulo en el elemento (la banda temática): es suyo */
      if (el.getAttribute('data-fondo-ajena') || (el.style.getPropertyValue('background-color') && !el.getAttribute('data-fondo-pinta'))) return;
      var c = rgba(cols[i]);
      if (!c || c.a === 0) return;
      var abre = el.classList.contains('verde') ? osc : paso;
      /* ⚠️ velo-legible.js tapa de más, sección por sección, donde el texto no se
         lee: lo escribe como `--inv-paso` / `--inv-oscuras` EN la sección. Se
         respeta (sólo puede cerrar, nunca abrir). Sin esto, la miniatura —que
         repinta seguido— le borraba el velo y salía distinta de la publicada. */
      var propio = parseFloat(el.style.getPropertyValue(el.classList.contains('verde') ? '--inv-oscuras' : '--inv-paso'));
      if (!isNaN(propio)) abre = Math.min(abre, propio);
      /* ⚠️ Una sección OSCURA con letra clara (Sapo, los Óleos nocturnos) abierta
         al 85 % sobre un fondo claro queda letra blanca sobre papel claro: no
         se lee (medido en isabella, 30/9/2026). Si nadie movió la perilla, a
         las oscuras se las abre menos. Si la movieron, manda la perilla. */
      if (!pasoElegido && !el.classList.contains('verde') &&
          (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255 < 0.35) abre = Math.min(abre, 0.45);
      var a = Math.max(0, Math.min(1, c.a * (1 - abre)));
      var val = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + a.toFixed(3) + ')';
      el.style.setProperty('background-color', val, 'important');
      /* ⚠️ 1/10/2026 — EL PAPEL CON TEXTURA TAPABA EL FONDO. Probado armando una
         invitación NUEVA desde el panel (Bohemia + «Una imagen»): el color de
         las secciones se abría bien, pero el motor les pone además la textura
         del tema (`--sec-tex`: lino, kraft, mármol…) como imagen, y esa imagen
         es opaca: la foto elegida no se veía en ninguna sección. El panel dice
         «Qué reemplaza el papel»: si la perilla abre la sección (más de la
         mitad), la textura del papel se va con el color. Sólo la textura del
         motor (`/i/tex-…`): los degradés y dibujos de las colecciones quedan. */
      if (abre > 0.5 && /\/i\/tex-[a-z]+\.jpg/.test(texs[i]) && texs[i].indexOf('gradient') < 0 &&
          (!el.style.getPropertyValue('background-image') || el.getAttribute('data-fondo-tex'))) {   /* lo puesto en línea por otro módulo, no se toca */
        el.style.setProperty('background-image', 'none', 'important');
        el.setAttribute('data-fondo-tex', '1');
      }
      el.setAttribute('data-fondo-pinta', 'sec');
      el.setAttribute('data-fondo-valor', el.style.getPropertyValue('background-color'));
    });
    if (marco) {
      marco.style.setProperty('background', 'transparent', 'important');
      marco.setAttribute('data-fondo-pinta', 'marco');
    }
  }

  function poner(f) {
    hoja();
    sacar();
    f = sinGif(f);

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
      /* ⚠️⚠️ EL BLINDAJE, QUE ESTE VIDEO NO TENIA. Medido el 20/9/2026.
         Maki: «se sigue viendo el reproductor al principio con el sobre».
         El video del SOBRE (#env-vid) nace blindado desde el HTML del motor,
         pero el del FONDO se crea ACA, y nacia pelado: sin `controlslist`, sin
         `disablepictureinpicture` y sin `disableremoteplayback`. En Safari y en
         iOS eso muestra el boton de PiP, el de AirPlay y —si no llega a
         arrancar— el PLAY gigante en el medio. Y este video esta JUSTO DETRAS
         DEL SOBRE, que es lo primero que ve el invitado.
         ⚠ LA REGLA: un video de la invitacion NUNCA es un reproductor, es
           papel que se mueve. No se toca, no se descarga, no sale a otra
           pantalla. Cualquier <video> que cree un modulo nace asi. */
      v.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback noplaybackrate');
      v.setAttribute('disablepictureinpicture', '');
      try { v.disablePictureInPicture = true; } catch (e) {}
      v.setAttribute('disableremoteplayback', '');
      v.removeAttribute('controls');
      v.controls = false;
      v.tabIndex = -1;
      v.setAttribute('aria-hidden', 'true');
      v.style.pointerEvents = 'none';
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
    pasoElegido = (typeof f.paso === 'number');
    raiz.style.setProperty('--inv-paso', String(
      Math.max(0, Math.min(1, (typeof f.paso === 'number') ? f.paso : 0.85))));
    raiz.style.setProperty('--inv-oscuras', String(
      Math.max(0, Math.min(0.6, (typeof f.oscuras === 'number') ? f.oscuras : 0))));

    alinear(caja);
    pintar();
    repintes = 0;
  }

  function sincronizar() {
    var f = conf();
    var nueva = JSON.stringify([f.tipo, f.url, f.poster, f.fuerza, f.velo, f.paso, f.oscuras, f.donde]);
    if (nueva === firma) {
      /* la colección puede llegar después, o cambiarse en el panel:
         en la previa se repinta siempre; en la invitación, los primeros 12 s */
      if (raiz.getAttribute('data-fondo') && (esPrevia || repintes++ < 8)) pintar();
      return;
    }
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

  setInterval(sincronizar, esPrevia ? 500 : 1600);
})();
