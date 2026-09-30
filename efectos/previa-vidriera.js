/* ===== LA MINIATURA DEL PANEL SE VE COMO LA INVITACIÓN PUBLICADA (30/9/2026) ===

   La regla de oro: lo que Jazmín ve en la miniatura es lo que queda publicado.
   El comparador miniatura-vs-publicada (chequeo/comparar.js) encontró que la
   miniatura mostraba el PASE con QR («Familia Rivera», mesa 7) y el formulario
   de confirmación, y la invitación publicada no.

   Por qué: la invitación abierta SIN link de invitado entra en «vidriera» y el
   motor esconde lo personal (pase, formulario, nombre). Pero el camino de la
   vista previa del motor (`inv-preview`) nunca aplicaba la vidriera.

   Acá se aplica exactamente lo mismo que hace el motor en vidriera, cada vez
   que llega el evento a la miniatura. Si la muestra tiene prendido «Mostrar la
   confirmación y el pase…» (rsvp-muestra.js), ese módulo los vuelve a mostrar
   después, igual que en la publicada.
   Vive en /efectos/ para valer con todas las versiones del motor.
   ============================================================================ */
(function () {
  'use strict';
  if (!/[?&]preview=1/.test(location.search)) return;

  function vidriera() {
    if (!window.INVEV) return;
    document.querySelectorAll('.rsvpform').forEach(function (f) { f.style.display = 'none'; });
    var pase = document.querySelector('.pase'); if (pase) pase.style.display = 'none';
    ['pv-gname', 'pv-per', 'pv-mesa', 'pv-estado'].forEach(function (id) {
      var e = document.getElementById(id); if (e) e.textContent = '';
    });
    var rn = document.getElementById('rname'); if (rn) rn.value = '';
    var cf = document.querySelector('[data-sec="confirmacion"] p');
    if (cf) cf.textContent = 'Esta es una muestra. En la invitación real, cada invitado entra con su propio link y confirma desde acá.';
  }

  /* va ANTES que rsvp-muestra.js (que corre a los 80 ms del mensaje) */
  addEventListener('message', function (e) {
    var d = e && e.data;
    if (d && d.type === 'inv-preview') setTimeout(vidriera, 30);
  });
})();
