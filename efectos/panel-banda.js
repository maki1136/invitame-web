/* ===== «LA BANDA DE LA TEMÁTICA», EN EL PANEL =================================
   La imagen suave que /efectos/banda-tematica.js pone detrás de las secciones
   de color pleno (fx.tematica.banda). Hasta el 26/11/2026 no tenía control:
   una muestra duplicada arrastraba la banda de la otra sin poder cambiarla
   (la XV rosa «Cuento de hadas» heredó la banda lila de luna-cuento-mis15).
   Pestaña PRINCIPAL, en la casa del diseño. Solo cambia lo que ya existía:
   sin banda, la invitación queda como siempre.
   ⚠️ Escribe SIEMPRE en el borrador vivo (INVSN.borrador()).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'banda-tematica-selector';
  function arrancar() {
    var S = window.INVSN; if (!S) { setTimeout(arrancar, 100); return; }
    S.anotarCasa(ID, 'PRINCIPAL', 'diseno');
    S.bloque(ID, function (caja) {
      var t = function () { var d = S.borrador(); return d ? S.datos(d, 'tematica') : {}; };
      S.titulo(caja, 'Banda de la temática (imagen suave detrás de las secciones de color)',
        'La imagen apenas se ve detrás de ceremonia, personas, regalos y confirmación. Si duplicaste otra muestra, cambiala por una del color de esta. Vacío = sin banda, color pleno.');
      var syncUrl = S.texto(caja, 'Link de la imagen de la banda', 'https://res.cloudinary.com/…',
        function () { return t().banda; }, function (v) { t().banda = String(v || '').trim(); }, false, 400);
      var f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*';
      f.style.cssText = 'margin:6px 0 2px;font-size:12px';
      var est = document.createElement('div'); est.style.cssText = 'font-size:11.5px;opacity:.7';
      f.onchange = async function () {
        var a = f.files && f.files[0]; if (!a) return;
        if (!window.INV || !INV.uploadImage) { est.textContent = 'Todavía no cargó la base. Esperá 2 seg.'; return; }
        est.textContent = 'Subiendo…';
        try { t().banda = await INV.uploadImage(a); est.textContent = 'Listo.'; }
        catch (e) { est.textContent = 'No se pudo subir.'; }
        f.value = ''; syncUrl();
        if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
      };
      caja.appendChild(f); caja.appendChild(est);
      return [syncUrl];
    });
  }
  arrancar();
})();
