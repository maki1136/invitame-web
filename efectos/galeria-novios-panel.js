/* ===== «FOTOS DE LA FIESTA» EN EL PANEL DE LOS NOVIOS (23/10/2026) ============
   Maki: «el cliente y Jazmín también… agregarle el acceso». Los novios moderan
   su galería de Invítame Live desde mi-panel.html, con la clave que ya tienen:
   ven todo lo que subieron sus invitados y pueden sacar una foto o un mensaje
   de la pantalla, volver a ponerlo, o aprobar lo que quedó esperando.
   Todo pasa por /galeria-novios.php, que comprueba la clave y busca la galería
   en SU invitación. Vive aparte de mi-panel.js, como el save the date.
   ============================================================================ */
(function () {
  'use strict';
  var WORKER = 'https://galeria.littlemomentsok.workers.dev';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function api(cfg, cuerpo) {
    var b = { slug: cfg.slug, clave: cfg.clave };
    for (var k in cuerpo) b[k] = cuerpo[k];
    return fetch('/galeria-novios.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'http' + r.status }; }); });
  }

  var ESTILO = '.gn-filtros{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}' +
    '.gn-filtros button{border:1px solid #e7ddd3;background:#fff;border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;cursor:pointer}' +
    '.gn-filtros button.on{background:#6D1233;color:#fff;border-color:#6D1233}' +
    '.gn-grilla{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}' +
    '.gn-it{background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}' +
    '.gn-it img{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#f4f0ec}' +
    '.gn-it .gn-tx{padding:10px;font-size:13px;line-height:1.4;min-height:60px}' +
    '.gn-it audio{width:100%;margin:8px 0 0}' +
    '.gn-it .gn-pie{padding:6px 10px 10px;font-size:12px;opacity:.75}' +
    '.gn-it .gn-bt{display:flex;gap:6px;padding:0 10px 10px}' +
    '.gn-it .gn-bt button{flex:1;border:0;border-radius:9px;padding:8px 6px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}' +
    '.gn-si{background:#E5F3EA;color:#1F6B42}.gn-no{background:#FBE4E6;color:#8A1F2B}' +
    '.gn-est{display:inline-block;font-size:11px;font-weight:700;border-radius:6px;padding:2px 6px;margin-left:4px}' +
    '.gn-est.aprobada{background:#E5F3EA;color:#1F6B42}.gn-est.pendiente{background:#FFF3D6;color:#7A5A00}.gn-est.rechazada{background:#eee;color:#666}';

  function pintar(cont, cfg) {
    if (!document.getElementById('gn-css')) { var st = document.createElement('style'); st.id = 'gn-css'; st.textContent = ESTILO; document.head.appendChild(st); }
    var filtro = 'todo', items = [];
    cont.innerHTML = '<div class="card">Cargando las fotos…</div>';

    function dibujar() {
      var cuenta = { todo: 0, pendiente: 0, aprobada: 0, rechazada: 0 };
      items.forEach(function (i) { cuenta.todo++; if (cuenta[i.estado] != null) cuenta[i.estado]++; });
      var lista = items.filter(function (i) { return filtro === 'todo' || i.estado === filtro; });
      cont.innerHTML =
        '<div class="card">' +
          '<h3 style="margin:0 0 6px">Fotos de la fiesta</h3>' +
          '<div class="hint" style="margin:0 0 12px">Lo que suben tus invitados sale solo en la galería y en la pantalla del salón. ' +
          'Acá podés sacar algo que no quieras que se vea, volver a ponerlo, o aprobar lo que quedó esperando.</div>' +
          '<div class="gn-filtros">' +
            [['todo', 'Todo'], ['pendiente', 'Esperando'], ['aprobada', 'En pantalla'], ['rechazada', 'Sacadas']].map(function (f) {
              return '<button data-gnf="' + f[0] + '" class="' + (filtro === f[0] ? 'on' : '') + '">' + f[1] + ' (' + cuenta[f[0]] + ')</button>';
            }).join('') +
            '<button data-gnr="1">↻ Actualizar</button>' +
          '</div>' +
          (lista.length ? '<div class="gn-grilla">' + lista.map(tarjeta).join('') + '</div>'
                        : '<div class="hint">Todavía no hay nada acá.</div>') +
        '</div>';
    }
    function tarjeta(i) {
      var cuerpo;
      if (i.tipo === 'foto') cuerpo = '<img loading="lazy" alt="" src="' + WORKER + '/f/' + esc(i.thumb || i.key) + '">';
      else if (i.tipo === 'audio') cuerpo = '<div class="gn-tx">🎙️ Saludo de voz<audio controls preload="none" src="' + WORKER + '/f/' + esc(i.key) + '"></audio></div>';
      else cuerpo = '<div class="gn-tx">“' + esc(i.texto) + '”</div>';
      var nom = { aprobada: 'en pantalla', pendiente: 'esperando', rechazada: 'sacada' }[i.estado] || i.estado;
      var bt = i.estado === 'aprobada'
        ? '<button class="gn-no" data-gne="rechazada">Sacar</button>'
        : '<button class="gn-si" data-gne="aprobada">' + (i.estado === 'pendiente' ? 'Aprobar' : 'Volver a poner') + '</button>' +
          (i.estado === 'pendiente' ? '<button class="gn-no" data-gne="rechazada">No va</button>' : '');
      return '<div class="gn-it" data-col="' + i.col + '" data-fid="' + esc(i.fid) + '">' + cuerpo +
        '<div class="gn-pie">' + esc(i.autor || 'Invitado') + '<span class="gn-est ' + esc(i.estado) + '">' + esc(nom) + '</span></div>' +
        '<div class="gn-bt">' + bt + '</div></div>';
    }
    function cargar() {
      api(cfg, { accion: 'listar' }).then(function (j) {
        if (!j || !j.ok) { cont.innerHTML = '<div class="card">No pudimos traer las fotos (' + esc(j && j.error) + '). Probá de nuevo en un rato.</div>'; return; }
        if (j.sinGaleria) { cont.innerHTML = '<div class="card"><h3 style="margin:0 0 6px">Fotos de la fiesta</h3><div class="hint">Tu invitación todavía no tiene la galería de fotos de los invitados. Si la contrataste, escribinos y la activamos.</div></div>'; return; }
        items = j.items || []; dibujar();
      }).catch(function () { cont.innerHTML = '<div class="card">Sin conexión. Probá de nuevo.</div>'; });
    }
    cont.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.gnf) { filtro = b.dataset.gnf; dibujar(); return; }
      if (b.dataset.gnr) { cargar(); return; }
      if (b.dataset.gne) {
        var it = b.closest('.gn-it'); if (!it) return;
        b.disabled = true;
        api(cfg, { accion: 'estado', col: it.dataset.col, fid: it.dataset.fid, estado: b.dataset.gne }).then(function (j) {
          if (!j || !j.ok) { b.disabled = false; alert('No se pudo guardar. Probá de nuevo.'); return; }
          items.forEach(function (x) { if (x.fid === it.dataset.fid && x.col === it.dataset.col) x.estado = j.estado; });
          dibujar();
        });
      }
    };
    cargar();
  }

  window.INVGAL_NOVIOS = { pintar: pintar };
})();
