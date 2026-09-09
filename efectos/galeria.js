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
      var refrescar = function () {
        a.setAttribute('href', armarUrl(cfg.gid));
        anotarSalida();          /* se anota la altura ANTES de irse */
      };
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

  /* El slug de la invitación. Sale de la dirección, que es el dato más firme:
     `INVDATA.slug` se llena después de leer Firestore y puede estar en null. */
  function slugEvento() {
    try { return new URLSearchParams(location.search).get('e') || ''; } catch (e) { return ''; }
  }

  function armarUrl(gid) {
    var u = '/galeria/?g=' + encodeURIComponent(gid);
    var n = nombreInvitado();
    var t = tokenInvitado();
    var e = slugEvento();
    if (n) u += '&n=' + encodeURIComponent(n);
    if (t) u += '&t=' + encodeURIComponent(t);
    /* ⚠️ para que la galería sepa a dónde volver. Ver «LA VUELTA» abajo. */
    if (e) u += '&ev=' + encodeURIComponent(e);
    return u;
  }

  /* ===== LA VUELTA A LA INVITACIÓN (9/9/2026) ================================

     Maki: «cuando entrás a la cámara de las fotos de la fiesta, tener un botón
     para volver a la invitación, porque cuando das para atrás se abre desde el
     sobre y debería volver al mismo lugar de donde salió».

     Eran dos molestias en una:
       1. no había forma de volver salvo el botón Atrás del navegador;
       2. al volver, la invitación se cargaba de cero: el sobre otra vez, la
          ceremonia entera, y el invitado de nuevo arriba de todo — después de
          haber bajado ocho pantallas hasta la galería.

     CÓMO SE RESUELVE, y por qué así:

     · Al SALIR se deja una marca en `sessionStorage` con la altura del scroll.
     · Al VOLVER, si la marca está, se saltea el sobre y se repone la altura.
     · Y la marca SE BORRA al usarla.

     ⚠️ ESE BORRADO ES EL CORAZÓN DEL ASUNTO. Si la marca quedara puesta, el
     invitado no volvería a ver el sobre en toda la sesión: recargar la
     invitación le mostraría la portada pelada. El sobre es la ceremonia de
     entrada — se saltea UNA vez, la de la vuelta, y nada más.

     ⚠️ Sirve para las dos vueltas: el botón nuevo de la galería y el Atrás del
     navegador. Por eso la marca no es un parámetro en la dirección (el Atrás
     no lo llevaría) sino `sessionStorage`.

     ⚠️ La altura se repone VARIAS VECES. La invitación tiene animaciones de
     scroll que devuelven la página a su lugar: medido, se fija `scrollTop` y a
     los 300 ms volvió sola. Se insiste hasta los 1200 ms.
     ========================================================================== */

  function marca() { return 'inv_volver_' + slugEvento(); }

  function anotarSalida() {
    if (!slugEvento()) return;
    try {
      sessionStorage.setItem(marca(), String(Math.round(
        window.pageYOffset || document.documentElement.scrollTop || 0)));
    } catch (e) {}
  }

  function volviendo() {
    var alto = null;
    try { alto = sessionStorage.getItem(marca()); } catch (e) {}
    if (alto === null) return;
    try { sessionStorage.removeItem(marca()); } catch (e) {}   /* ⚠️ una sola vez */

    /* el sobre no se vuelve a mirar */
    var env = document.getElementById('env');
    if (env) {
      env.classList.add('gone');
      env.style.display = 'none';
      try { if (typeof window.startParticles === 'function') window.startParticles(); } catch (e) {}
    }

    /* ⚠️⚠️ NO ALCANZA CON PEDIR EL SCROLL UNAS VECES: HAY QUE INSISTIR HASTA
       LLEGAR. Medido el 9/9/2026 en los cuatro navegadores del banco:

         la invitación anotó 13304  y volvió a 8347
         la invitación anotó 13666  y volvió a 8447
         la invitación anotó 11953  y volvió a 8073

       Siempre MÁS ARRIBA, y siempre alrededor de 8300. No es que el scroll
       falle: es que en ese momento la página TODAVÍA NO MIDE TANTO. Las
       secciones las montan los módulos (galería, pase, filtro, trivia) y hasta
       que no están el documento mide unos 9000 px. Pedirle al navegador que
       baje a 13304 cuando el fondo está en 8300 lo deja en 8300, sin error.

       La primera versión insistía a los 60, 200, 500, 900 y 1200 ms. Se quedaba
       corta por segundos: cuando los módulos terminan de montar, ya nadie
       estaba pidiendo el scroll.

       Ahora se reintenta cada 200 ms HASTA LLEGAR, con techo de 12 s. Se corta
       sola apenas la posición cae a menos de 40 px del objetivo, así que en una
       página que ya está armada no cuesta nada. */
    var y = parseInt(alto, 10) || 0;
    var desde = Date.now();
    var poner = function () {
      try { window.scrollTo(0, y); } catch (e) {}
      var actual = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (Math.abs(actual - y) > 40 && Date.now() - desde < 12000) {
        setTimeout(poner, 200);
      }
    };
    poner();
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

  /* ⚠️ LA VUELTA SE RESUELVE YA, SIN ESPERAR A `INVEV`. Si esperara los datos
     del evento, el sobre alcanzaría a arrancar su animación y el invitado
     vería medio segundo de ceremonia antes de que se la saquen de encima —
     justo el parpadeo que estamos tratando de evitar. */
  volviendo();

  /* El motor puede publicar INVEV después de que este archivo cargue. */
  if (window.INVEV) arrancar();
  else {
    var intentos = 0;
    var timer = setInterval(function () {
      if (window.INVEV || ++intentos > 40) { clearInterval(timer); arrancar(); }
    }, 250);
  }
})();
