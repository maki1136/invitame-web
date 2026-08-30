/* ===== EL FONDO DE TODA LA INVITACIÓN =========================================

   Pone una imagen o un video DETRÁS DE TODO —plumas, seda, agua— y deja que
   asome a través de las secciones.

   Cómo se enciende:
     INVEV.fx.fondo = {
       tipo: 'video' | 'imagen',
       url:   'https://…',        // el archivo
       poster:'https://…',        // foto fija, para cuando el video no corre
       velo:  0.30,               // cuánto se apaga el fondo (0 a 1)
       paso:  0.12                // cuánto lo dejan pasar las secciones (0 a 1)
     }
   Cómo se apaga: INVEV.fx.fondo = {} — vuelve todo como está hoy.

   ⚠️ SI LAS SECCIONES QUEDAN OPACAS, EN EL CELULAR NO SE VE NADA.
      La invitación es una columna angosta. Un fondo detrás sólo asomaría a los
      costados, y en el teléfono no hay costados. Por eso existe `paso`: las
      secciones se vuelven un poco transparentes y el fondo se siente en todas
      las pantallas. Con paso:0 esto se ve sólo en la compu.

   ⚠️ EL VELO NO ES DECORACIÓN, ES LEGIBILIDAD.
      Un fondo con dibujo detrás de un texto chico lo vuelve ilegible. El velo
      apaga el fondo antes de que las secciones lo dejen pasar. Si se sube
      `paso`, hay que subir `velo`.

   ⚠️ EN EL CELULAR, VIDEO SÓLO SI CONVIENE.
      Si la persona pidió menos movimiento, si el navegador avisa que está
      ahorrando datos, o si el aparato tiene poca memoria, se usa la foto fija.
      Un fondo lindo que come batería en una fiesta es un fondo malo.

   ⚠️ VA DETRÁS DE TODO, PERO NO TAPA NADA.
      La capa es `position:fixed` con z-index 0 y `pointer-events:none`: no se
      puede tocar, no roba clics y no entra en el scroll.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'inv-fondo';

  function conf() {
    var f = {};
    try { f = ((window.INVEV || {}).fx || {}).fondo || {}; } catch (e) {}
    /* la zona de prueba puede forzarlo por la URL */
    try {
      var u = new URLSearchParams(location.search);
      if (u.get('fondo')) {
        f = {
          tipo: u.get('fondoTipo') || 'imagen',
          url:  u.get('fondo'),
          poster: u.get('fondoPoster') || '',
          velo: parseFloat(u.get('velo') || '0.3'),
          paso: parseFloat(u.get('paso') || '0.12')
        };
      }
    } catch (e) {}
    return f;
  }

  /* ¿conviene el video en este aparato? */
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
    '#' + ID + '{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}' +
    '#' + ID + ' > video, #' + ID + ' > img{width:100%;height:100%;object-fit:cover;display:block}' +
    '#' + ID + ' > .velo{position:absolute;inset:0}' +
    /* el marco y todo lo demás, por encima del fondo */
    'html[data-fondo] body{background:transparent !important}' +
    'html[data-fondo] .frame{position:relative;z-index:1}' +
    /* las secciones dejan pasar el fondo: se les baja la opacidad del color.
       Se toca SÓLO background-color, nunca la imagen ni la textura. */
    'html[data-fondo] .sec{background-color:color-mix(in srgb, var(--sec-col,transparent)' +
      ' calc(100% - var(--inv-paso,0) * 100%), transparent) !important}' +
    'html[data-fondo] .sec.verde{background-color:color-mix(in srgb, var(--sec-col-v,var(--verde))' +
      ' calc(100% - var(--inv-paso,0) * 100%), transparent) !important}';

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
    var v = document.getElementById(ID);
    if (v) v.remove();
    raiz.removeAttribute('data-fondo');
    raiz.style.removeProperty('--inv-paso');
  }

  function poner(f) {
    hoja();
    sacar();

    var caja = document.createElement('div');
    caja.id = ID;

    var usaVideo = f.tipo === 'video' && videoConviene();
    if (usaVideo) {
      var v = document.createElement('video');
      v.src = f.url;
      if (f.poster) v.poster = f.poster;
      v.autoplay = true; v.loop = true; v.muted = true;
      v.setAttribute('muted', '');            /* iOS lo pide como atributo */
      v.setAttribute('playsinline', '');
      v.playsInline = true;
      v.preload = 'auto';
      caja.appendChild(v);
      /* si el navegador no lo deja arrancar, se cae a la foto fija */
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        if (!f.poster) return;
        v.remove();
        var im = document.createElement('img');
        im.src = f.poster; im.alt = '';
        caja.insertBefore(im, caja.firstChild);
      });
    } else {
      var im2 = document.createElement('img');
      im2.src = f.poster || f.url;
      im2.alt = '';
      caja.appendChild(im2);
    }

    var velo = document.createElement('div');
    velo.className = 'velo';
    var a = (typeof f.velo === 'number') ? f.velo : 0.3;
    /* el velo toma el papel de la paleta: así el fondo se integra en vez de
       verse pegado encima */
    velo.style.background = 'color-mix(in srgb, var(--lino,#f4efe6) ' +
      Math.round(Math.max(0, Math.min(1, a)) * 100) + '%, transparent)';
    caja.appendChild(velo);

    document.body.insertBefore(caja, document.body.firstChild);
    raiz.setAttribute('data-fondo', f.tipo === 'video' ? 'video' : 'imagen');
    raiz.style.setProperty('--inv-paso', String(
      Math.max(0, Math.min(0.85, (typeof f.paso === 'number') ? f.paso : 0.12))));
  }

  function sincronizar() {
    var f = conf();
    var nueva = JSON.stringify([f.tipo, f.url, f.poster, f.velo, f.paso]);
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

  var esPrevia = /[?&]preview=1/.test(location.search);
  setInterval(sincronizar, esPrevia ? 500 : 1600);
})();
