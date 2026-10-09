/* ===== EL SAVE THE DATE EN EL PANEL DE LOS NOVIOS (9/10/2026) =====================
   La vista «Save the date» de mi-panel.html. mi-panel.js sólo la llama:

     INVSTD_NOVIOS.pintar(vista, {slug, std, guardar})
       std     = lo que los novios ya cambiaron (inv_paneles/<slug>__<clave>.std)
       guardar = function (std) → Promise   (guardarPanel de mi-panel.js)

   Los textos: lo que escriben ellos > lo que dejó la diseñadora (fx.std de la
   invitación) > lo que sale solo. Un campo vacío vuelve al de abajo, que se ve
   en gris. Un guion solo («-») saca ese renglón.

   La vista previa y la descarga son efectos/std-marco.js, el MISMO que usa la
   diseñadora en admin.html: lo que ve ella es lo que bajan ellos.
   Vive aparte de mi-panel.js para no seguir agrandando ese archivo.
   ============================================================================ */
(function () {
  if (window.INVSTD_NOVIOS) return;
  var CAMPOS = [
    ['titulo', 'Título de arriba'],
    ['frase', 'Frase chica'],
    ['nombres', 'Nombres'],
    ['fecha', 'Fecha'],
    ['detalle', 'Día y lugar'],
    ['pie', 'Un renglón más (opcional)']
  ];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };

  function cargarMarco() {
    if (window.INVSTD_MARCO) return Promise.resolve();
    return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/efectos/std-marco.js?v=1'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  }

  function pintar(vista, ctx) {
    var mios = Object.assign({}, ctx.std || {});
    vista.innerHTML =
      '<div class="card" style="max-width:760px">' +
        '<h3>Tu save the date</h3>' +
        '<p style="font-size:13px;color:var(--muted);margin:0 0 14px;line-height:1.5">Viene de regalo con tu invitación: una imagen con la portada de tu invitación para mandar por WhatsApp o subir a tus estados. Cambiá los textos que quieras y descargala.</p>' +
        '<div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">' +
          '<div id="std-vista" style="width:180px;flex:none"></div>' +
          '<div style="flex:1;min-width:220px">' +
            CAMPOS.map(function (c) {
              return '<label for="std-' + c[0] + '">' + c[1] + '</label><input type="text" id="std-' + c[0] + '" data-std="' + c[0] + '" value="' + esc(mios[c[0]] || '') + '">';
            }).join('') +
            '<p style="font-size:12px;color:var(--muted);margin:6px 0 12px;line-height:1.45">Si dejás un campo vacío, sale el texto en gris. Para que un renglón no salga, escribí un guion: -</p>' +
            '<button class="btn" id="std-bajar" disabled style="max-width:240px">Descargar imagen</button>' +
            '<p id="std-nota" style="font-size:12px;color:var(--muted);margin:8px 0 0;line-height:1.45"></p>' +
          '</div>' +
        '</div>' +
      '</div>';

    var $ = function (id) { return document.getElementById(id); };
    var m = null, base = {}, tg = null;
    var juntar = function () { var o = Object.assign({}, base); Object.keys(mios).forEach(function (k) { if (String(mios[k]).trim() !== '') o[k] = mios[k]; }); return o; };

    cargarMarco().then(function () {
      m = window.INVSTD_MARCO.crear($('std-vista'), ctx.slug);
      m.listo.then(function (r) {
        base = r.disenio || {};
        CAMPOS.forEach(function (c) { var i = $('std-' + c[0]); if (i) i.placeholder = base[c[0]] || r.auto[c[0]] || ''; });
        m.armar(juntar());
        $('std-bajar').disabled = false;
      }, function () { $('std-nota').textContent = 'No pudimos abrir tu invitación. Probá de nuevo en un rato.'; });
    }, function () { $('std-nota').textContent = 'No se pudo cargar. Revisá tu conexión.'; });

    vista.oninput = function (e) {
      var k = e.target && e.target.dataset && e.target.dataset.std; if (!k) return;
      var v = e.target.value.slice(0, 120);
      if (v.trim()) mios[k] = v; else delete mios[k];
      if (m) m.armar(juntar());
      clearTimeout(tg); tg = setTimeout(function () { ctx.guardar(Object.assign({}, mios)); }, 1200);
    };
    $('std-bajar').onclick = function () {
      if (!m) return;
      var b = $('std-bajar'), txt = 'Descargar imagen';
      b.disabled = true; b.textContent = 'Armando la imagen…'; $('std-nota').textContent = '';
      m.descargar('save-the-date-' + ctx.slug + '.jpg').then(function (r) {
        b.disabled = false;
        if (r === 'otra-vez') { b.textContent = 'Guardar la imagen'; $('std-nota').textContent = 'Ya está lista: tocá de nuevo para guardarla.'; }
        else { b.textContent = txt; }
      }, function () { b.disabled = false; b.textContent = txt; $('std-nota').textContent = 'No se pudo armar la imagen. Probá de nuevo.'; });
    };
  }

  window.INVSTD_NOVIOS = { pintar: pintar };
})();
