/* ============================================================
   GALERÍA DE INVITADOS · el enchufe con la invitación
   La galería es un producto aparte (vive en /galeria/). Este
   módulo solo agrega una sección con el botón para entrar,
   pasándole el nombre y el token del invitado para que sus
   fotos salgan firmadas.

   Se enciende desde el panel: fx.galeria = { encendido, gid }.
   Si está apagado o falta el gid, no hace NADA.
   Para desenchufar todo: borrar la línea en /efectos/index.js.

   OJO con el diseño: nada de emojis. El ícono es de línea,
   dibujado, y el botón tiene el mismo relieve que la galería
   (sombra en capas + filo de luz arriba). Tiene que verse
   agarrable, no un rectángulo pintado.

   ⚠️ LOS TEXTOS VAN EN ESPAÑOL DE MÉXICO, no en voseo.
   El mercado es México. El motor se traduce en el servidor
   (i/textos-es-mx.php), pero lo que escribe un módulo NO pasa
   por ahí: si acá dijera "Sacá tus fotos", el invitado lo lee
   así. Se escribe bien de entrada y no hace falta traducir
   nada después.
   ============================================================ */
(function () {
  function arrancar() {
    var ev = window.INVEV;
    if (!ev || !ev.fx || !ev.fx.galeria) return;
    var cfg = ev.fx.galeria;
    if (!cfg.encendido && cfg.encendido !== 'on' && cfg.encendido !== true) return;
    if (document.getElementById('gal-seccion')) return;

    /* ---- MODO VIDRIERA ---------------------------------------------------
       En una MUESTRA no hay galeria de verdad: crearla gasta saldo de la
       cuenta de galerias. Antes se resolvia pegando el gid de otra boda, y el
       4/9/2026 se midio lo que eso provoca: en camila-y-tomas el boton
       "Entrar a la galeria" abria la galeria de Hugo y Lucia. Un invitado
       terminaba viendo las fotos de gente que no conoce.
       Con `vidriera` la seccion SE VE —el cliente entiende que la funcion
       existe— pero el boton no lleva a ningun lado. Y sin gid no hay a donde
       llevar, asi que la fuga es imposible por construccion.                */
    var vidriera = (cfg.vidriera === true || cfg.vidriera === 'on');
    var gidOk = !!cfg.gid && /^[A-Za-z0-9_-]{16,64}$/.test(String(cfg.gid));
    if (!vidriera && !gidOk) return;

    var url = gidOk ? armarUrl(cfg.gid) : '';

    /* Los textos se pueden cambiar desde el panel. */
    var titulo = String(cfg.titulo || 'Las fotos de la fiesta');
    var bajada = String(cfg.bajada || 'Toma tus fotos y mira las de todos, en el momento.');
    var boton  = String(cfg.boton  || 'Entrar a la galería');

    /* El color lo pone la invitación; si no hay, el uva de la marca. */
    var acento = 'var(--verde, #6D1233)';

    var sec = document.createElement('section');
    sec.id = 'gal-seccion';
    /* La clase de la casa: hereda el aire de las demás secciones y la
       colección que esté puesta. El padding propio queda sólo de respaldo,
       para una invitación que no tenga `.sec`. */
    sec.className = 'sec';
    sec.style.cssText = document.querySelector('.sec')
      ? 'text-align:center;'
      : 'text-align:center;padding:52px 22px;';
    sec.innerHTML =
      '<div style="display:inline-flex;align-items:center;justify-content:center;' +
        'width:62px;height:62px;border-radius:50%;margin-bottom:16px;' +
        'background:' + acento + ';color:#fff;' +
        'box-shadow:0 2px 3px rgba(40,6,20,.22), 7px 9px 15px -3px rgba(40,6,20,.42),' +
        'inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 7px rgba(0,0,0,.22);">' +
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7a1 1 0 0 0 .83-.45l.94-1.4A1 1 0 0 1 9.8 3.7h4.4' +
            'a1 1 0 0 1 .83.45l.94 1.4A1 1 0 0 0 16.8 6h1.7A2.5 2.5 0 0 1 21 8.5v9' +
            'a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>' +
          '<circle cx="12" cy="13" r="3.6"/>' +
        '</svg>' +
      '</div>' +
      '<h2 style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:600;' +
        'font-size:2rem;line-height:1.15;margin:0 0 10px;">' + esc(titulo) + '</h2>' +
      '<p style="margin:0 auto 24px;max-width:34ch;opacity:.75;font-size:1rem;">' +
        esc(bajada) + '</p>' +
      /* En vidriera es un <span>: mismo boton a la vista, pero SIN href.
         No es un <a> sin destino —eso el lector de pantalla lo canta igual
         como enlace— ni un <a href="#"> que saltaria al principio. */
      '<' + (vidriera ? 'span' : 'a') + ' id="gal-entrar"' +
        (vidriera ? ' aria-disabled="true"' : ' href="' + url + '"') +
        ' style="display:inline-block;padding:17px 38px;' +
        'border-radius:99px;background:' + acento + ';color:#fff;text-decoration:none;' +
        'font-weight:700;font-size:1.06rem;letter-spacing:.01em;' +
        (vidriera ? 'cursor:default;' : '') +
        'box-shadow:0 1px 2px rgba(60,10,30,.16), 0 4px 7px rgba(60,10,30,.14),' +
        '0 12px 20px -5px rgba(60,10,30,.22), 0 26px 38px -14px rgba(60,10,30,.34),' +
        'inset 0 1.5px 0 rgba(255,255,255,.42), inset 0 -2px 5px rgba(0,0,0,.20);' +
        'transition:transform .14s cubic-bezier(.2,.8,.3,1), box-shadow .14s ease;">' +
        esc(boton) + '</' + (vidriera ? 'span' : 'a') + '>' +
      (vidriera
        ? '<p style="margin:16px auto 0;max-width:34ch;opacity:.6;font-size:.86rem;">' +
            esc(cfg.notaVidriera || 'En tu invitación, este botón abre la galería de tu fiesta.') +
          '</p>'
        : '');

    /* Se hunde al tocarlo, como las fichas de la galería. */
    var a = vidriera ? null : sec.querySelector('#gal-entrar');
    if (a) {
      var hundir = function () {
        a.style.transform = 'translateY(4px) scale(.985)';
        a.style.boxShadow = '0 1px 1px rgba(60,10,30,.14), 0 2px 4px rgba(60,10,30,.12),' +
          'inset 0 1.5px 0 rgba(255,255,255,.42), inset 0 -2px 5px rgba(0,0,0,.20)';
      };
      var soltar = function () { a.style.transform = ''; a.style.boxShadow = ''; };
      /* El motor puede llamar a `aplicarInvitado` DESPUÉS de que esta sección
         se montó: si el href se calcula una sola vez, la foto sale sin firmar
         justo cuando el invitado tarda en cargar. Se rearma al tocarlo. */
      var refrescar = function () { a.setAttribute('href', armarUrl(cfg.gid)); };
      a.addEventListener('pointerdown', refrescar);
      a.addEventListener('focus', refrescar);
      a.addEventListener('click', refrescar);
      a.addEventListener('pointerdown', hundir);
      a.addEventListener('pointerup', soltar);
      a.addEventListener('pointercancel', soltar);
      a.addEventListener('pointerleave', soltar);
    }

    colgar(sec);
  }

  /* ⚠️ DE DÓNDE SALE EL NOMBRE DEL INVITADO (31/8/2026)
     Antes esto leía `window.INVITADO`, que NO EXISTE en el motor: nunca lo
     publicó nadie. O sea que el invitado entraba desde su invitación, que ya
     sabe cómo se llama, y la galería igual le volvía a pedir el nombre — y las
     fotos salían sin firmar. No se notaba porque el banco fabricaba ese objeto.

     Lo que el motor SÍ hace (ver `aplicarInvitado` en i/index.html) es escribir
     el nombre en el DOM: `#pv-gname` (el pase) y `#rname` (la confirmación).
     De ahí se lee, que es donde está de verdad. */
  function nombreInvitado() {
    var e = document.getElementById('pv-gname');
    var n = e ? String(e.textContent || '').trim() : '';
    if (!n) {
      var r = document.getElementById('rname');
      n = r ? String(r.value || '').trim() : '';
    }
    return n.slice(0, 40);
  }

  /* El token del pase. `INVDATA` lo deja parseado el motor; si no está, se
     mira la URL, que es de donde salió. */
  function tokenInvitado() {
    try {
      if (window.INVDATA && window.INVDATA.token) return String(window.INVDATA.token);
    } catch (e) {}
    return new URLSearchParams(location.search).get('g') || '';
  }

  function armarUrl(gid) {
    var u = '/galeria/?g=' + encodeURIComponent(gid);
    var n = nombreInvitado();
    var t = tokenInvitado();
    if (n) u += '&n=' + encodeURIComponent(n);
    if (t) u += '&t=' + encodeURIComponent(t);
    return u;
  }

  /* ⚠️ DÓNDE SE CUELGA LA SECCIÓN (31/8/2026)
     Antes buscaba `.cierre, #cierre, footer` y, si no encontraba, la pegaba al
     final del <body>. En la invitación de verdad NO HAY ninguno de los tres:
     todas las secciones viven dentro de `.frame`, y colgarla del body la
     dejaba FUERA de la caja de la invitación. El banco no lo veía porque su
     página de mentira tenía un `<footer class="cierre">` que no existe.
     Se cuelga entre las secciones reales, con la misma clase `sec` que usan
     ellas, así hereda el aire y la colección que esté puesta. */
  function colgar(sec) {
    var marco = document.querySelector('.frame') || document.body;
    var antes = document.getElementById('contacto-sec')
             || document.getElementById('share-sec')
             || document.querySelector('.cierre, #cierre, footer');
    if (antes && antes.parentNode) { antes.parentNode.insertBefore(sec, antes); return; }
    marco.appendChild(sec);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* El motor puede publicar INVEV después de que este archivo cargue. */
  if (window.INVEV) arrancar();
  else {
    var intentos = 0;
    var timer = setInterval(function () {
      if (window.INVEV || ++intentos > 40) { clearInterval(timer); arrancar(); }
    }, 250);
  }
})();
