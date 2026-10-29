/* ===== ¿HAY UNA VERSIÓN NUEVA DEL PANEL? (28/10/2026) ==========================
   Jazmín, 21:29: «En ningún lado dice una al lado de la otra… todas las opciones
   probé y ninguna funciona». La opción estaba publicada desde las 20:57, pero su
   panel estaba abierto desde antes: seguía usando el código viejo.

   Cada 90 segundos se le pregunta al servidor la fecha del paquete de efectos
   y de este panel. Si cambió desde que se abrió, aparece una franja arriba:
   «Hay mejoras nuevas en el panel — Recargar». No recarga sola: si hay cambios
   sin guardar, avisa primero.
   ============================================================================ */
(function () {
  'use strict';
  var ARCHIVOS = ['/efectos/todo.min.js', '/admin.html'];
  var inicio = null, avisado = false;

  function firma() {
    return Promise.all(ARCHIVOS.map(function (u) {
      return fetch(u + '?v=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
        .then(function (r) { return (r.headers.get('last-modified') || '') + '|' + (r.headers.get('etag') || ''); })
        .catch(function () { return ''; });
    })).then(function (a) { return a.join('#'); });
  }

  function franja() {
    if (avisado || document.getElementById('inv-version-nueva')) return;
    avisado = true;
    var d = document.createElement('div');
    d.id = 'inv-version-nueva';
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#f56770;color:#fff;font:600 14px Manrope,system-ui,sans-serif;' +
      'padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.2)';
    var t = document.createElement('span');
    t.textContent = '✨ Hay mejoras nuevas en el panel. Guardá lo que estés haciendo y recargá para verlas.';
    var b = document.createElement('button');
    b.textContent = 'Recargar ahora';
    b.style.cssText = 'background:#fff;color:#c0405a;border:0;border-radius:999px;padding:7px 14px;font:700 13px Manrope,system-ui,sans-serif;cursor:pointer';
    b.onclick = function () {
      if (window.confirm('¿Ya guardaste? Si tenés cambios sin «Guardar y publicar», se pierden al recargar.')) location.reload();
    };
    var x = document.createElement('button');
    x.textContent = '×'; x.title = 'Después';
    x.style.cssText = 'background:transparent;color:#fff;border:0;font-size:20px;cursor:pointer;line-height:1';
    x.onclick = function () { d.remove(); setTimeout(function () { avisado = false; }, 10 * 60 * 1000); };
    d.appendChild(t); d.appendChild(b); d.appendChild(x);
    document.body.appendChild(d);
  }

  function revisar() {
    firma().then(function (f) {
      if (!f.replace(/[|#]/g, '')) return;          /* sin respuesta: no se dice nada */
      if (inicio === null) { inicio = f; return; }
      if (f !== inicio) franja();
    });
  }
  revisar();
  setInterval(revisar, 90 * 1000);
})();
