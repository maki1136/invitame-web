/* ===== PARCHE TEMPORAL — LA VISTA PREVIA DEL PANEL ============================

   POR QUÉ EXISTE
   El 19/8 el `admin.html` de prueba terminó subido en la carpeta `sobres/` en
   vez de `prueba/`. El panel funciona igual, pero la vista previa arma su
   dirección de forma RELATIVA (`./?preview=1...`), así que desde
   `/sobres/admin.html` pedía `/sobres/?preview=1` — una carpeta sin página —
   y el celular de la derecha mostraba **403 Forbidden**.

   QUÉ HACE
   Si el panel está corriendo desde una carpeta que no es la suya, reescribe la
   dirección de la vista previa (y los links que abren la invitación) para que
   apunten a `/prueba/`. Nada más.

   CUÁNDO SE BORRA
   Apenas el `admin.html` vuelva a `prueba/`. Este archivo deja de hacer efecto
   solo: si el panel está en su lugar, no toca nada. Igual conviene borrarlo
   para no dejar parches dando vueltas.
   ============================================================================ */
(function () {
  'use strict';

  var ruta = location.pathname;

  /* los lugares donde el panel SÍ está en su casa */
  var enSuLugar = /^\/admin\.html$/.test(ruta) || /^\/prueba\/admin\.html$/.test(ruta);
  var esUnPanel = /admin\.html$/.test(ruta);

  if (enSuLugar || !esUnPanel) return;   /* todo bien: no hace falta el parche */

  var BASE = '/prueba/';                 /* a dónde debería apuntar la previa */

  function corregir() {
    /* la vista previa */
    var f = document.getElementById('pv-frame');
    if (f) {
      var s = f.getAttribute('src') || '';
      if (s.slice(0, 2) === './') {
        var nueva = BASE + s.slice(2);
        if (f.getAttribute('src') !== nueva) f.setAttribute('src', nueva);
      }
    }
    /* los botones que abren la invitación en una pestaña nueva */
    [].forEach.call(document.querySelectorAll('a[href^="./"]'), function (a) {
      a.setAttribute('href', BASE + a.getAttribute('href').slice(2));
    });
  }

  function arrancar() {
    corregir();
    /* el panel vuelve a escribir el src cada vez que actualiza la previa */
    if (window.MutationObserver) {
      new MutationObserver(corregir).observe(document.documentElement, {
        subtree: true, childList: true,
        attributes: true, attributeFilter: ['src', 'href']
      });
    }
    setInterval(corregir, 700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
