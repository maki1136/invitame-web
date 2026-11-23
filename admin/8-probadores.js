/* ===== PROBADORES: LOS QUE PROBARON UNA MUESTRA CON SUS DATOS (23/11/2026) ======
   Maki: «que deje el mail así nos queda para retargeting».
   Cada cliente que usa /probar.html queda en `inv_privado/__probadores-AAAA-MM`
   (lista `lista`, la escribe /probar-guardar.php). Este botón del panel junta los
   últimos 12 meses, los muestra (los más nuevos arriba) y los baja en Excel.
   «Ver» abre la invitación tal como la vio el cliente.
   ============================================================================ */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function codigo(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function linkDe(p) {
    var m = /\/image\/upload\/(v\d+\/invitame\/probador\/[A-Za-z0-9_\-]+\.(?:jpg|jpeg|png|webp))$/.exec(p.foto || '');
    return '/i/?e=' + encodeURIComponent(p.muestra || '') + '&pr=' + codigo({ a: p.n1 || '', b: p.n2 || '', f: p.fecha || '', c: m ? m[1] : '', m: p.mensaje || '', t: p.tipo || '' });
  }
  function nombreMuestra(slug) {
    var M = window.MUESTRAS_INVITAME || {};
    for (var k in M) if (M[k].muestra === slug) return M[k].nombre;
    return slug;
  }
  var LISTA = [];
  function opcionesMuestras() {
    var M = window.MUESTRAS_INVITAME || {}, T = window.MUESTRAS_TIPOS || [], h = '';
    T.forEach(function (t) {
      var ids = window.muestrasDeTipo ? window.muestrasDeTipo(t[0]) : [];
      if (!ids.length) return;
      h += '<optgroup label="' + esc(t[1]) + '">' + ids.map(function (id) { return '<option value="' + esc(M[id].muestra) + '">' + esc(M[id].nombre) + '</option>'; }).join('') + '</optgroup>';
    });
    return h;
  }

  async function traer() {
    var _m = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    var hoy = new Date(), ids = [];
    for (var i = 0; i < 12; i++) {
      var d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - i, 1));
      ids.push('__probadores-' + d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'));
    }
    var docs = await Promise.all(ids.map(function (id) {
      return _m.getDoc(_m.doc(window.INV.db, 'inv_privado', id)).catch(function () { return null; });
    }));
    var out = [];
    docs.forEach(function (s) { if (s && s.exists()) ((s.data() || {}).lista || []).forEach(function (p) { out.push(p); }); });
    out.sort(function (a, b) { return String(b.creado || '').localeCompare(String(a.creado || '')); });
    return out;
  }

  function excel() {
    var cab = ['Fecha de alta', 'Mail', 'Acepta promos', 'Nombre 1', 'Nombre 2', 'Tipo', 'Muestra', 'Fecha del evento', 'Mensaje', 'País', 'Link'];
    var filas = LISTA.map(function (p) {
      return [String(p.creado || '').replace('T', ' ').slice(0, 16), p.mail, p.acepta ? 'sí' : 'no', p.n1, p.n2, p.tipo,
        nombreMuestra(p.muestra), p.fecha, p.mensaje, p.pais, location.origin + linkDe(p)];
    });
    var csv = [cab].concat(filas).map(function (f) {
      return f.map(function (v) { v = String(v == null ? '' : v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',');
    }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'probadores-invitame-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  window.verProbadores = async function () {
    var box = document.getElementById('prbbox');
    if (!box) {
      box = document.createElement('div'); box.id = 'prbbox';
      box.style.cssText = 'position:fixed;inset:0;background:rgba(73,17,26,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:26px 14px;overflow:auto';
      box.addEventListener('click', function (e) { if (e.target === box) box.remove(); });
      document.body.appendChild(box);
    }
    box.innerHTML = '<div style="background:#fff;max-width:980px;width:100%;border-radius:14px;padding:20px;font-family:Nunito,sans-serif"><div style="color:#9a8f88">Cargando…</div></div>';
    try { LISTA = await traer(); } catch (e) {
      box.firstChild.innerHTML = '<b>No se pudo leer la lista.</b> <span style="color:#9a8f88">(' + esc(e && e.message) + ')</span>'; return;
    }
    var promos = LISTA.filter(function (p) { return p.acepta; }).length;
    var h = '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">' +
      '<h3 style="margin:0;font-family:\'Cormorant Garamond\',serif;color:#6D1233;font-size:24px;flex:1">Probadores · ' + LISTA.length + ' <small style="font:600 13px Nunito;color:#9a8f88">(' + promos + ' aceptan promos)</small></h3>' +
      '<button type="button" id="prb-xls" style="border:0;background:#6D1233;color:#fff;border-radius:9px;padding:9px 14px;font:800 13px Nunito;cursor:pointer">Bajar Excel</button>' +
      '<button type="button" id="prb-x" style="border:1px solid #ddd;background:#fff;border-radius:9px;padding:9px 12px;font:700 13px Nunito;cursor:pointer">Cerrar</button></div>' +
      '<div style="font-size:12.5px;color:#9a8f88;margin-bottom:10px">Los que usaron el link <b>invitameok.net/probar.html</b> para ver una muestra con su foto, sus nombres y su fecha.</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#faf6f0;border-radius:10px;padding:10px;margin-bottom:12px">' +
      '<b style="font-size:13px">Link para un cliente:</b><select id="prb-m" style="flex:1 1 220px;padding:7px;border-radius:8px;border:1px solid #ddd"><option value="">Que elija el diseño</option>' + opcionesMuestras() + '</select>' +
      '<button type="button" id="prb-copiar" style="border:0;background:#F56770;color:#fff;border-radius:9px;padding:8px 12px;font:800 13px Nunito;cursor:pointer">Copiar link</button></div>';
    if (!LISTA.length) h += '<div style="padding:20px;color:#9a8f88">Todavía no hay nadie.</div>';
    else {
      h += '<div style="overflow:auto"><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr style="text-align:left;color:#6D1233">' +
        '<th style="padding:6px">Alta</th><th style="padding:6px">Mail</th><th style="padding:6px">Nombres</th><th style="padding:6px">Muestra</th><th style="padding:6px">Evento</th><th style="padding:6px">Promos</th><th></th></tr></thead><tbody>';
      LISTA.forEach(function (p) {
        h += '<tr style="border-top:1px solid #f0e6dd">' +
          '<td style="padding:6px;white-space:nowrap">' + esc(String(p.creado || '').slice(0, 10)) + '</td>' +
          '<td style="padding:6px">' + esc(p.mail) + '</td>' +
          '<td style="padding:6px">' + esc(p.n1) + (p.n2 ? ' &amp; ' + esc(p.n2) : '') + '</td>' +
          '<td style="padding:6px">' + esc(nombreMuestra(p.muestra)) + ' <small style="color:#9a8f88">' + esc(p.tipo) + '</small></td>' +
          '<td style="padding:6px;white-space:nowrap">' + esc(p.fecha) + '</td>' +
          '<td style="padding:6px">' + (p.acepta ? 'sí' : 'no') + '</td>' +
          '<td style="padding:6px"><a href="' + esc(linkDe(p)) + '" target="_blank" style="color:#F56770;font-weight:700">Ver</a></td></tr>';
      });
      h += '</tbody></table></div>';
    }
    box.firstChild.innerHTML = h;
    document.getElementById('prb-x').onclick = function () { box.remove(); };
    document.getElementById('prb-xls').onclick = excel;
    document.getElementById('prb-copiar').onclick = function () {
      var v = document.getElementById('prb-m').value, u = 'https://invitameok.net/probar.html' + (v ? '?m=' + v : '');
      var b = this;
      (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { b.textContent = '¡Copiado!'; },
        function () { window.prompt('Copiá el link:', u); });
      setTimeout(function () { b.textContent = 'Copiar link'; }, 2000);
    };
  };
})();
