/* ===== LA TRIVIA EN EL PANEL DE LOS NOVIOS (16/11/2026) ========================
   Jazmín: «Los resultados de la trivia no se ven en el panel» y «en ese sector
   ellos pueden modificar las preguntas o respuestas» (la plataforma vieja lo
   tenía: PreguntaME! → Trivia / Resultados, con la tabla de posiciones).
   Los novios, desde mi-panel.html y con su clave:
     · cambian sus preguntas y respuestas (se ven al toque en la invitación);
     · ven la tabla de posiciones (correctas, incorrectas, puntos, cuándo);
     · sacan a alguien de la tabla, reinician la trivia o bajan el Excel.
   Todo pasa por /trivia-novios.php, que comprueba la clave. Vive aparte de
   mi-panel.js, como las fotos de la fiesta y el save the date.
   ============================================================================ */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(cfg, cuerpo) {
    var b = { slug: cfg.slug, clave: cfg.clave };
    for (var k in cuerpo) b[k] = cuerpo[k];
    return fetch('/trivia-novios.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'http' + r.status }; }); })
      .catch(function () { return { ok: false, error: 'red' }; });
  }
  function aviso(t) { var x = document.getElementById('toast'); if (!x) return; x.textContent = t; x.classList.add('ver'); clearTimeout(x._t); x._t = setTimeout(function () { x.classList.remove('ver'); }, 1800); }
  function fecha(s) { if (!s) return ''; var d = new Date(s); if (isNaN(d)) return ''; return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }); }

  var ESTILO = '.tn-tabs{display:flex;gap:6px;margin:0 0 14px}' +
    '.tn-tabs button{border:1px solid #e7ddd3;background:#fff;border-radius:999px;padding:8px 16px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}' +
    '.tn-tabs button.on{background:#6D1233;color:#fff;border-color:#6D1233}' +
    '.tn-q{border:1px solid #eee5dc;border-radius:12px;padding:12px;margin-bottom:12px;background:#fffdfb}' +
    '.tn-q .tn-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;font-weight:800;color:#6D1233}' +
    '.tn-q input[type=text]{width:100%;box-sizing:border-box;border:1px solid #e3d9cf;border-radius:9px;padding:9px 11px;font:inherit;font-size:14px;background:#fff}' +
    '.tn-op{display:flex;align-items:center;gap:8px;margin-top:7px}.tn-op input[type=radio]{width:18px;height:18px;accent-color:#2F7D4F;flex:0 0 auto}' +
    '.tn-x{border:0;background:none;color:#8A1F2B;cursor:pointer;font:inherit;font-size:12.5px;font-weight:700;padding:4px}' +
    '.tn-mas{border:0;background:none;color:#6D1233;cursor:pointer;font:inherit;font-size:13px;font-weight:700;padding:6px 0}' +
    '.tn-tabla{width:100%;border-collapse:collapse;font-size:13.5px}.tn-tabla th{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:#8a7d72;text-align:left;padding:8px 6px;border-bottom:1px solid #eee5dc}' +
    '@media (max-width:600px){.tn-tabla th:nth-child(4),.tn-tabla td:nth-child(4),.tn-tabla th:nth-child(6),.tn-tabla td:nth-child(6){display:none}}' +
    '.tn-tabla td{padding:9px 6px;border-bottom:1px solid #f5efe8}.tn-tabla td.n{text-align:center}.tn-tabla .ok{color:#1F6B42;font-weight:800}.tn-tabla .mal{color:#8A1F2B;font-weight:800}' +
    '.tn-barra{display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;align-items:center;margin-bottom:12px}' +
    '.tn-gris{color:#8a7d72;font-size:13px;line-height:1.45}';

  function pintar(cont, cfg) {
    if (!document.getElementById('tn-css')) { var st = document.createElement('style'); st.id = 'tn-css'; st.textContent = ESTILO; document.head.appendChild(st); }
    var pest = cfg.pestana || 'resultados', datos = null, preg = [];
    cont.innerHTML = '<div class="card">Cargando la trivia…</div>';

    function cargar() {
      api(cfg, { accion: 'ver' }).then(function (r) {
        if (!r || !r.ok) { cont.innerHTML = '<div class="card"><div class="vacio">No se pudo abrir la trivia (' + esc(r && r.error || '') + '). Probá «Actualizar».</div></div>'; return; }
        datos = r;
        preg = (r.preguntas || []).map(function (p) { return { q: p.q || '', o: (p.o && p.o.length ? p.o.slice() : ['', '']), c: p.c | 0 }; });
        dibujar();
      });
    }

    function dibujar() {
      var h = '<div class="tn-tabs"><button data-p="resultados" class="' + (pest === 'resultados' ? 'on' : '') + '">Tabla de posiciones</button>' +
        '<button data-p="preguntas" class="' + (pest === 'preguntas' ? 'on' : '') + '">Preguntas</button></div>';
      if (datos && datos.muestra) h += '<div class="card tn-gris" style="margin-bottom:12px">Esta es una <b>muestra de venta</b>: la trivia se puede jugar todas las veces que quieras, pero los puntajes no se guardan, así que la tabla queda vacía. En la invitación de un cliente, cada invitado que juega aparece aquí.</div>';
      if (datos && !datos.habilitada) h += '<div class="card tn-gris" style="margin-bottom:12px">La trivia está <b>apagada</b> en tu invitación: tus invitados todavía no la ven. Si la quieres, pídele a tu diseñadora que la prenda.</div>';
      h += pest === 'preguntas' ? htmlPreguntas() : htmlResultados();
      cont.innerHTML = h;
      [].forEach.call(cont.querySelectorAll('.tn-tabs button'), function (b) { b.onclick = function () { pest = b.getAttribute('data-p'); dibujar(); }; });
      if (pest === 'preguntas') conectarPreguntas(); else conectarResultados();
    }

    /* ---------- resultados ---------- */
    function filas() {
      var n = preg.length;
      return (datos.jugadores || []).map(function (j, i) {
        var bien = Math.max(0, Math.min(n || 99, Math.round((j.puntaje | 0) / 10)));
        return { pos: i + 1, clave: j.clave, nombre: j.nombre, bien: bien, mal: n ? Math.max(0, n - bien) : 0, pts: j.puntaje | 0, at: j.at };
      });
    }
    function htmlResultados() {
      var f = filas();
      return '<div class="card"><div class="tn-barra"><h3 style="margin:0">Tabla de posiciones</h3>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="tnExcel" style="width:auto;padding:9px 14px">Descargar Excel</button>' +
        '<button class="btn" id="tnReiniciar" style="width:auto;padding:9px 14px;background:#8A1F2B">Reiniciar trivia</button></div></div>' +
        (f.length ? '<div style="overflow-x:auto"><table class="tn-tabla"><thead><tr><th>#</th><th>Nombre</th><th class="n">Correctas</th><th class="n">Incorrectas</th><th class="n">Puntos</th><th>Respondió</th><th></th></tr></thead><tbody>' +
          f.map(function (x) {
            return '<tr><td>' + x.pos + '</td><td style="font-weight:700">' + esc(x.nombre) + '</td><td class="n ok">' + x.bien + '</td><td class="n mal">' + x.mal + '</td>' +
              '<td class="n">' + x.pts + '</td><td style="white-space:nowrap;color:#6b6058">' + esc(fecha(x.at)) + '</td>' +
              '<td><button class="tn-x" data-borrar="' + esc(x.clave) + '" data-nombre="' + esc(x.nombre) + '">Quitar</button></td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<div class="vacio">Todavía no jugó nadie. Cuando tus invitados respondan la trivia en la invitación, aparecen aquí con sus puntos.</div>') +
        '<p class="tn-gris" style="margin:12px 0 0">Cada respuesta correcta suma 10 puntos. Cada invitado juega una sola vez. «Reiniciar» deja la tabla en cero para que todos puedan volver a jugar.</p></div>';
    }
    function conectarResultados() {
      var bx = cont.querySelector('#tnExcel');
      if (bx) bx.onclick = function () {
        var rows = [['Puesto', 'Nombre', 'Correctas', 'Incorrectas', 'Puntos', 'Respondió']].concat(filas().map(function (x) { return [x.pos, x.nombre, x.bien, x.mal, x.pts, fecha(x.at)]; }));
        var csv = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'trivia-' + cfg.slug + '.csv'; a.click();
      };
      var br = cont.querySelector('#tnReiniciar');
      if (br) br.onclick = function () {
        if (!(datos.jugadores || []).length) { aviso('La tabla ya está vacía'); return; }
        if (!window.confirm('¿Reiniciar la trivia? Se borra la tabla de posiciones entera y todos pueden volver a jugar. No se puede deshacer.')) return;
        br.disabled = true; br.textContent = 'Reiniciando…';
        api(cfg, { accion: 'reiniciar' }).then(function (r) { if (r && r.ok) { datos.jugadores = r.jugadores || []; aviso('Trivia reiniciada'); } else aviso('No se pudo reiniciar'); dibujar(); });
      };
      [].forEach.call(cont.querySelectorAll('[data-borrar]'), function (b) {
        b.onclick = function () {
          if (!window.confirm('¿Quitar a «' + b.getAttribute('data-nombre') + '» de la tabla? Va a poder volver a jugar.')) return;
          b.disabled = true;
          api(cfg, { accion: 'borrar', jugador: b.getAttribute('data-borrar') }).then(function (r) { if (r && r.ok) { datos.jugadores = r.jugadores || []; aviso('Quitado de la tabla'); } else aviso('No se pudo quitar'); dibujar(); });
        };
      });
    }

    /* ---------- preguntas ---------- */
    function htmlPreguntas() {
      return '<div class="card"><h3>Preguntas de tu trivia</h3>' +
        '<p class="tn-gris" style="margin:0 0 12px">Escribe cada pregunta y sus opciones (de 2 a 4). Marca el círculo de la respuesta correcta. Al guardar, tu invitación se actualiza sola.</p>' +
        preg.map(function (p, i) {
          return '<div class="tn-q"><div class="tn-h"><span>Pregunta ' + (i + 1) + '</span><button class="tn-x" data-qx="' + i + '">Quitar pregunta</button></div>' +
            '<input type="text" data-q="' + i + '" maxlength="200" placeholder="Escribe la pregunta" value="' + esc(p.q) + '">' +
            p.o.map(function (o, j) {
              return '<div class="tn-op"><input type="radio" name="tnc' + i + '" data-c="' + i + '-' + j + '" title="Respuesta correcta"' + (p.c === j ? ' checked' : '') + '>' +
                '<input type="text" data-o="' + i + '-' + j + '" maxlength="100" placeholder="Opción ' + (j + 1) + '" value="' + esc(o) + '">' +
                (p.o.length > 2 ? '<button class="tn-x" data-ox="' + i + '-' + j + '" title="Quitar opción">✕</button>' : '') + '</div>';
            }).join('') +
            (p.o.length < 4 ? '<button class="tn-mas" data-om="' + i + '">+ agregar opción</button>' : '') + '</div>';
        }).join('') +
        (preg.length < 15 ? '<button class="tn-mas" id="tnMasQ">+ Agregar pregunta</button>' : '') +
        '<div style="margin-top:12px"><button class="btn" id="tnGuardar">Guardar preguntas</button></div></div>';
    }
    function conectarPreguntas() {
      [].forEach.call(cont.querySelectorAll('[data-q]'), function (x) { x.oninput = function () { preg[+x.getAttribute('data-q')].q = x.value; }; });
      [].forEach.call(cont.querySelectorAll('[data-o]'), function (x) { x.oninput = function () { var a = x.getAttribute('data-o').split('-'); preg[+a[0]].o[+a[1]] = x.value; }; });
      [].forEach.call(cont.querySelectorAll('[data-c]'), function (x) { x.onchange = function () { var a = x.getAttribute('data-c').split('-'); preg[+a[0]].c = +a[1]; }; });
      [].forEach.call(cont.querySelectorAll('[data-qx]'), function (x) { x.onclick = function () { preg.splice(+x.getAttribute('data-qx'), 1); dibujar(); }; });
      [].forEach.call(cont.querySelectorAll('[data-ox]'), function (x) { x.onclick = function () { var a = x.getAttribute('data-ox').split('-'), p = preg[+a[0]]; p.o.splice(+a[1], 1); if (p.c >= p.o.length) p.c = 0; dibujar(); }; });
      [].forEach.call(cont.querySelectorAll('[data-om]'), function (x) { x.onclick = function () { preg[+x.getAttribute('data-om')].o.push(''); dibujar(); }; });
      var mq = cont.querySelector('#tnMasQ'); if (mq) mq.onclick = function () { preg.push({ q: '', o: ['', ''], c: 0 }); dibujar(); };
      var g = cont.querySelector('#tnGuardar');
      if (g) g.onclick = function () {
        var buenas = preg.filter(function (p) { return p.q.trim() && p.o.filter(function (o) { return String(o).trim(); }).length >= 2; });
        if (!buenas.length) { aviso('Falta al menos una pregunta con 2 opciones'); return; }
        if (buenas.length < preg.length && !window.confirm('Hay preguntas sin completar (sin texto o con menos de 2 opciones). Se guardan sólo las completas. ¿Seguimos?')) return;
        /* la correcta sigue apuntando a la misma opción aunque se descarten las vacías */
        var envio = buenas.map(function (p) {
          var o = [], c = 0;
          p.o.forEach(function (x, j) { if (String(x).trim()) { if (j === p.c) c = o.length; o.push(String(x).trim()); } });
          return { q: p.q.trim(), o: o, c: c };
        });
        g.disabled = true; g.textContent = 'Guardando…';
        api(cfg, { accion: 'guardar', preguntas: envio }).then(function (r) {
          g.disabled = false; g.textContent = 'Guardar preguntas';
          if (r && r.ok) { preg = envio.map(function (p) { return { q: p.q, o: p.o.slice(), c: p.c }; }); aviso('Preguntas guardadas'); dibujar(); }
          else aviso('No se pudo guardar (' + (r && r.error || '') + ')');
        });
      };
    }

    cargar();
  }

  window.INVTRIVIA_NOVIOS = { pintar: pintar };
})();
