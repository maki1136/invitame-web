/* ============================================================
   GALERÍA DE INVITADOS · el enchufe con la invitación
   La galería es un producto aparte (vive en /galeria/). Este
   módulo solo agrega una sección con el botón para entrar,
   pasándole el nombre y el token del invitado para que sus
   fotos salgan firmadas.

   Se enciende desde el panel: fx.galeria = { encendido, gid }.
   Si está apagado o falta el gid, no hace NADA.
   Para desenchufar todo: borrar la línea en /efectos/index.js.
   ============================================================ */
(function () {
  function arrancar() {
    var ev = window.INVEV;
    if (!ev || !ev.fx || !ev.fx.galeria) return;
    var cfg = ev.fx.galeria;
    if (!cfg.encendido && cfg.encendido !== 'on' && cfg.encendido !== true) return;
    if (!cfg.gid || !/^[A-Za-z0-9_-]{16,64}$/.test(String(cfg.gid))) return;
    if (document.getElementById('gal-seccion')) return;

    /* El nombre y el token del invitado: los mismos que ya usa la
       invitación. El token viene en ?g= de la URL de la invitación. */
    var params = new URLSearchParams(location.search);
    var token = params.get('g') || '';
    var nombre = '';
    try {
      if (window.INVITADO && window.INVITADO.nombre) nombre = window.INVITADO.nombre;
    } catch (e) {}

    var url = '/galeria/?g=' + encodeURIComponent(cfg.gid);
    if (nombre) url += '&n=' + encodeURIComponent(nombre);
    if (token) url += '&t=' + encodeURIComponent(token);

    var sec = document.createElement('section');
    sec.id = 'gal-seccion';
    sec.style.cssText = 'text-align:center;padding:44px 22px;';
    sec.innerHTML =
      '<h2 style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:600;' +
        'font-size:1.9rem;margin:0 0 8px;">📸 Galería de la fiesta</h2>' +
      '<p style="margin:0 auto 18px;max-width:34ch;opacity:.75;font-size:.98rem;">' +
        'Subí tus fotos y mirá las de todos, en el momento.</p>' +
      '<a href="' + url + '" style="display:inline-block;padding:15px 34px;border-radius:99px;' +
        'background:var(--verde,#b06a7e);color:#fff;text-decoration:none;font-weight:700;' +
        'font-size:1.05rem;">Entrar a la galería</a>';

    /* Va al final de la invitación, antes del cierre. */
    var cierre = document.querySelector('.cierre, #cierre, footer');
    if (cierre && cierre.parentNode) cierre.parentNode.insertBefore(sec, cierre);
    else document.body.appendChild(sec);
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
