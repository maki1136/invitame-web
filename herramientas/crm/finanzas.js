/* =====================================================================
   CRM Invítame — pantalla «Finanzas» (8/10/2026)
   ---------------------------------------------------------------------
   Reemplaza el dashboard viejo que vivía en creameia.com/invitamedashboard
   (borrado el 6/10; copia en copias-sitios/creameia-completo-2026-10-06.zip).
   Lee las MISMAS planillas que leía aquél, recién cuando se abre la pantalla:
     A · INVITAME DASHBOARD OFICIAL  (facturación, gastos, ganancia, ventas)
     S · SEGUIMIENTO 2026            (ingresos y ventas por canal)
     R · RENDIMIENTO WEB             (contactos, inversión, CPL, CPA, cierre)
     C · Cobranzas                   (quién debe)
   ⚠️ Trae sueldos: la pantalla SÓLO aparece para el rol admin/dueño.
   Se inyecta inline antes de </body> en invitamecrm/index.html.
   ===================================================================== */
(function () {
  if (window.INVFINANZAS) return; window.INVFINANZAS = 1;

  var URL = {
    A: 'https://docs.google.com/spreadsheets/d/1OJLT46k4pJrCzG8fG6Qekk5drsfxwkAnIciIzNwiuos/export?format=csv',
    S: 'https://docs.google.com/spreadsheets/d/1ri_gl6zHuFw8v0I9SxSWGkNW5edxlKeiXilsRyOoZv4/export?format=csv',
    R: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQa8C3ZitN_nkTh9UmqZZ4BXfXewJAdH4bUoMhLMnZmmXbAlVlUjQ4-Leg0RmxR2kwuCtD5oznQaPUC/pub?gid=536069291&single=true&output=csv',
    C: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlo7Jp7vGS5JH2V9JSzV-lQz9w1SqqJihAdgLrYTYx82zKBetHwXcrlBvW8f3LUtJ4Sb74T2BTNPtb/pub?gid=0&single=true&output=csv'
  };
  var VER = {
    A: 'https://docs.google.com/spreadsheets/d/1OJLT46k4pJrCzG8fG6Qekk5drsfxwkAnIciIzNwiuos/edit',
    S: 'https://docs.google.com/spreadsheets/d/1ri_gl6zHuFw8v0I9SxSWGkNW5edxlKeiXilsRyOoZv4/edit',
    R: 'https://docs.google.com/spreadsheets/d/1Npxu0sQKZFOb8GMDgKJ7WF9ni-GMT8jz31HLEPw5qeI/edit'
  };
  var MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase(); }

  /* ---------- CSV (comillas, comas y saltos de línea dentro de celdas) ---------- */
  function csv(t) {
    var filas = [], f = [], c = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; continue; }
      if (ch === '"') q = true;
      else if (ch === ',') { f.push(c); c = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; f.push(c); filas.push(f); f = []; c = ''; }
      else c += ch;
    }
    if (c !== '' || f.length) { f.push(c); filas.push(f); }
    return filas;
  }
  function tabla(t) {
    var f = csv(t), cab = (f.shift() || []).map(norm);
    return f.map(function (r) { var o = {}; cab.forEach(function (h, i) { if (h) o[h] = (r[i] || '').trim(); }); return o; });
  }
  function num(s) {
    s = String(s == null ? '' : s).replace(/[$\s%]/g, '').replace(/,/g, '');
    if (s === '' || /DIV|N\/A|#/.test(s)) return null;
    var n = parseFloat(s); return isNaN(n) ? null : n;
  }
  function clave(o) { return (o['ANO'] || o['AÑO'] || '') + '|' + norm(o['MES']); }
  function mesIdx(o) { return MESES.indexOf(norm(o['MES'])); }

  /* ---------- quién puede verla ---------- */
  function esDueno() {
    var u = window.auth && auth.currentUser; if (!u) return false;
    if (u.email === 'littlemomentsok@gmail.com') return true;
    var m = window.CFG && CFG.roles && CFG.roles.map, d = m && m[u.email];
    return !!(d && /admin|due|owner/i.test(String(d.rol || '')));
  }

  /* ---------- estilos ---------- */
  var css = el('style');
  css.textContent =
    '#finanzas .fz-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}' +
    '#finanzas select,#finanzas .fz-btn{font:inherit;padding:8px 12px;border-radius:10px;border:1px solid #e5d8df;background:#fff;cursor:pointer}' +
    '#finanzas .fz-btn{background:var(--rosa-fuerte,#6b1e45);color:#fff;border:0}' +
    '#finanzas .fz-sub{color:#8a7680;font-size:12px}' +
    '#finanzas h3{margin:22px 0 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8a7680}' +
    '#finanzas .fz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}' +
    '#finanzas .fz-k{background:#fff;border:1px solid #efe4e9;border-radius:14px;padding:14px}' +
    '#finanzas .fz-k b{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a7680;font-weight:600}' +
    '#finanzas .fz-k .v{font-size:24px;font-weight:800;margin:6px 0 2px;color:#2b1a22}' +
    '#finanzas .fz-k .d{font-size:11.5px;color:#8a7680;margin-top:6px;line-height:1.5}' +
    '#finanzas .up{color:#1f7a4d}#finanzas .dn{color:#b3261e}' +
    '#finanzas .sem{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:middle}' +
    '#finanzas .sem.v{background:#2e9e5b}#finanzas .sem.a{background:#e0a400}#finanzas .sem.r{background:#d13b2e}#finanzas .sem.g{background:#bbb}' +
    '#finanzas table{width:100%;border-collapse:collapse;font-size:13px;background:#fff;border-radius:12px;overflow:hidden}' +
    '#finanzas td,#finanzas th{padding:8px 10px;border-top:1px solid #f1e8ec;text-align:left;vertical-align:top}' +
    '#finanzas th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#8a7680;background:#fbf7f9}' +
    '#finanzas .fz-bars{display:flex;align-items:flex-end;gap:6px;height:150px;background:#fff;border:1px solid #efe4e9;border-radius:14px;padding:14px 14px 30px;overflow-x:auto}' +
    '#finanzas .fz-bar{flex:1 0 28px;position:relative;background:var(--rosa-fuerte,#6b1e45);border-radius:6px 6px 0 0;min-height:2px;opacity:.85}' +
    '#finanzas .fz-bar.sel{opacity:1;outline:2px solid #e0a400}' +
    '#finanzas .fz-bar span{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:10px;color:#8a7680;white-space:nowrap}' +
    '#finanzas .fz-bar i{position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-size:10px;color:#2b1a22;font-style:normal;white-space:nowrap}' +
    '#finanzas .fz-links a{margin-right:14px;font-size:12px}';
  document.head.appendChild(css);

  /* ---------- la sección y el botón del menú ---------- */
  function montar() {
    if ($('#finanzas')) return true;
    var nav = $('nav.side'), main = $('.main'); if (!nav || !main) return false;
    var sec = el('section'); sec.id = 'finanzas';
    sec.innerHTML = '<h2>Finanzas</h2><p class="fz-sub">Lee las planillas de facturación, seguimiento, rendimiento y cobranzas. Sólo lo ves vos.</p><div id="fz-cuerpo"><p class="fz-sub">Cargando…</p></div>';
    main.appendChild(sec);
    var a = el('a', null, 'Finanzas'); a.href = '#finanzas'; a.dataset.s = 'finanzas'; a.style.display = 'none';
    var ref = nav.querySelector('a[data-s="numeros"]');
    if (ref && ref.nextSibling) nav.insertBefore(a, ref.nextSibling); else nav.insertBefore(a, nav.querySelector('.pie'));
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (window.ir) window.ir('finanzas'); else {
        document.querySelectorAll('.main section').forEach(function (x) { x.classList.toggle('on', x.id === 'finanzas'); });
        document.querySelectorAll('.side a').forEach(function (y) { y.classList.toggle('act', y.dataset.s === 'finanzas'); });
      }
      abrir();
    });
    return true;
  }
  /* El menú se muestra cuando ya se sabe quién entró y su rol. */
  var tMenu = setInterval(function () {
    if (!montar()) return;
    var a = $('nav.side a[data-s="finanzas"]');
    var u = window.auth && auth.currentUser;
    if (!u) { a.style.display = 'none'; return; }
    a.style.display = esDueno() ? '' : 'none';
  }, 1500);

  /* ---------- datos ---------- */
  var D = null, cargando = null, mesSel = null;
  function traer(u) { return fetch(u + (u.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }); }
  function cargar(forzar) {
    if (D && !forzar) return Promise.resolve(D);
    if (cargando && !forzar) return cargando;
    cargando = Promise.all([traer(URL.A), traer(URL.S), traer(URL.R), traer(URL.C)]).then(function (t) {
      var A = tabla(t[0]).filter(function (o) { return mesIdx(o) >= 0 && num(o['FACTURACION_BRUTA_TOTAL_EQUIVALENTE_USD']) > 0; });
      A.sort(function (x, y) { return (+x['ANO'] - +y['ANO']) || (mesIdx(x) - mesIdx(y)); });
      var idx = function (arr) { var m = {}; arr.forEach(function (o) { m[clave(o)] = o; }); return m; };
      D = { A: A, S: idx(tabla(t[1])), R: idx(tabla(t[2])), C: tabla(t[3]), cuando: new Date() };
      cargando = null; return D;
    }).catch(function (e) { cargando = null; throw e; });
    return cargando;
  }

  /* ---------- pintar ---------- */
  function usd(n) { return n == null ? '—' : 'US$ ' + Math.round(n).toLocaleString('es-AR'); }
  function mxn(n) { return n == null ? '—' : 'MX$ ' + Math.round(n).toLocaleString('es-AR'); }
  function ent(n) { return n == null ? '—' : Math.round(n).toLocaleString('es-AR'); }
  function pct(n) { return n == null ? '—' : (Math.round(n * 10) / 10).toLocaleString('es-AR') + ' %'; }
  function delta(act, ant, txt, menosEsMejor) {
    if (act == null || ant == null || ant === 0) return '<span>—</span> ' + txt;
    var p = (act - ant) / Math.abs(ant) * 100, bueno = menosEsMejor ? p <= 0 : p >= 0;
    return '<span class="' + (bueno ? 'up' : 'dn') + '">' + (p >= 0 ? '▲ ' : '▼ ') + Math.abs(Math.round(p)) + ' %</span> ' + txt;
  }
  function tarjeta(cont, titulo, valor, sub, campo, A0, A1, A2, menosEsMejor) {
    var k = el('div', 'fz-k');
    var h = '<b>' + titulo + '</b><div class="v">' + valor + '</div>';
    if (sub) h += '<div class="fz-sub">' + sub + '</div>';
    if (campo) {
      var v = function (o) { return o ? (typeof campo === 'function' ? campo(o) : num(o[campo])) : null; };
      h += '<div class="d">' + delta(v(A0), v(A1), 'vs mes anterior', menosEsMejor) + '<br>' + delta(v(A0), v(A2), 'vs mismo mes del año pasado', menosEsMejor) + '</div>';
    }
    k.innerHTML = h; cont.appendChild(k);
  }
  function sem(valor, verde, amarillo, menosEsMejor) {
    if (valor == null) return 'g';
    if (menosEsMejor) return valor <= verde ? 'v' : (valor <= amarillo ? 'a' : 'r');
    return valor >= verde ? 'v' : (valor >= amarillo ? 'a' : 'r');
  }
  function ventasTot(o) { return ['CANTIDAD_VENTAS_BODA_MEXICO', 'CANTIDAD_VENTAS_KIDS', 'CANTIDAD_VENTAS_SELPIX', 'CANTIDAD_VENTAS_ARGENTINA'].reduce(function (s, k) { return s + (num(o[k]) || 0); }, 0); }

  function pintar() {
    var c = $('#fz-cuerpo'); if (!c || !D) return;
    var A = D.A; if (!A.length) { c.innerHTML = '<p>La planilla de facturación no tiene meses cargados.</p>'; return; }
    if (!mesSel || !A.some(function (o) { return clave(o) === mesSel; })) mesSel = clave(A[A.length - 1]);
    var i = A.findIndex(function (o) { return clave(o) === mesSel; });
    var a0 = A[i], a1 = A[i - 1] || null;
    var a2 = A.filter(function (o) { return +o['ANO'] === +a0['ANO'] - 1 && mesIdx(o) === mesIdx(a0); })[0] || null;
    c.innerHTML = '';

    /* barra de arriba */
    var top = el('div', 'fz-top'), sel = el('select');
    A.slice().reverse().forEach(function (o) { var op = el('option', null, o['MES'].charAt(0) + o['MES'].slice(1).toLowerCase() + ' ' + o['ANO']); op.value = clave(o); if (op.value === mesSel) op.selected = true; sel.appendChild(op); });
    sel.onchange = function () { mesSel = sel.value; pintar(); };
    var b = el('button', 'fz-btn', 'Actualizar datos'); b.onclick = function () { b.textContent = 'Actualizando…'; cargar(true).then(pintar).catch(function (e) { b.textContent = 'No se pudo: ' + e.message; }); };
    top.appendChild(sel); top.appendChild(b);
    top.appendChild(el('span', 'fz-sub', 'Datos leídos ' + D.cuando.toLocaleString('es-AR')));
    c.appendChild(top);

    /* A · finanzas */
    c.appendChild(el('h3', null, 'A · Finanzas del negocio'));
    var g = el('div', 'fz-grid'); c.appendChild(g);
    tarjeta(g, 'Facturación del mes', usd(num(a0['FACTURACION_BRUTA_TOTAL_EQUIVALENTE_USD'])), mxn(num(a0['FACTURACION_BRUTA_MXN'])) + (num(a0['VENTAS_ARGENTINA_USD_CONVERSION_DE_E1']) ? ' · ARG ' + usd(num(a0['VENTAS_ARGENTINA_USD_CONVERSION_DE_E1'])) : ''), 'FACTURACION_BRUTA_TOTAL_EQUIVALENTE_USD', a0, a1, a2);
    tarjeta(g, 'Ganancia neta', usd(num(a0['GANANCIA_NETA_FINAL_NEGOCIO_USD'])), mxn(num(a0['GANANCIA_NETA_FINAL_NEGOCIO_MXN'])), 'GANANCIA_NETA_FINAL_NEGOCIO_USD', a0, a1, a2);
    tarjeta(g, 'Gastos totales', usd(num(a0['GASTOS_TOTALES_NEGOCIO_USD'])), null, 'GASTOS_TOTALES_NEGOCIO_USD', a0, a1, a2, true);
    var fac = num(a0['FACTURACION_BRUTA_TOTAL_EQUIVALENTE_USD']), gan = num(a0['GANANCIA_NETA_FINAL_NEGOCIO_USD']);
    tarjeta(g, 'Margen', fac ? pct(gan / fac * 100) : '—', 'ganancia sobre facturación', function (o) { var f = num(o['FACTURACION_BRUTA_TOTAL_EQUIVALENTE_USD']); return f ? (num(o['GANANCIA_NETA_FINAL_NEGOCIO_USD']) || 0) / f * 100 : null; }, a0, a1, a2);
    tarjeta(g, 'Ventas totales', ent(ventasTot(a0)), 'Boda MX ' + ent(num(a0['CANTIDAD_VENTAS_BODA_MEXICO'])) + ' · Kids ' + ent(num(a0['CANTIDAD_VENTAS_KIDS'])) + ' · Selpix ' + ent(num(a0['CANTIDAD_VENTAS_SELPIX'])) + ' · ARG ' + ent(num(a0['CANTIDAD_VENTAS_ARGENTINA'])), ventasTot, a0, a1, a2);
    tarjeta(g, 'Ticket promedio boda', mxn(num(a0['PROMEDIO_FINAL_VENTA_BODA_MXN'])), null, 'PROMEDIO_FINAL_VENTA_BODA_MXN', a0, a1, a2);
    tarjeta(g, 'Facturación diaria promedio', mxn(num(a0['PROMEDIO_FACTURACION_DIARIA_MXN'])), null, 'PROMEDIO_FACTURACION_DIARIA_MXN', a0, a1, a2);
    tarjeta(g, 'Tipo de cambio', (num(a0['TIPO_CAMBIO_MXN_USD']) || '—') + ' MXN', (num(a0['TIPO_CAMBIO_ARS_USD']) || '—') + ' ARS por dólar');

    /* tendencia */
    c.appendChild(el('h3', null, 'Facturación de los últimos 12 meses (US$)'));
    var ult = A.slice(Math.max(0, i - 11), i + 1), max = Math.max.apply(null, ult.map(function (o) { return num(o['FACTURACION_BRUTA_TOTAL_EQUIVALENTE_USD']) || 0; })) || 1;
    var bars = el('div', 'fz-bars');
    ult.forEach(function (o) {
      var v = num(o['FACTURACION_BRUTA_TOTAL_EQUIVALENTE_USD']) || 0, d = el('div', 'fz-bar' + (clave(o) === mesSel ? ' sel' : ''));
      d.style.height = Math.max(2, v / max * 100) + '%'; d.title = o['MES'] + ' ' + o['ANO'] + ': ' + usd(v);
      d.innerHTML = '<i>' + (v >= 1000 ? Math.round(v / 100) / 10 + 'k' : Math.round(v)) + '</i><span>' + o['MES'].slice(0, 3).toLowerCase() + ' ' + String(o['ANO']).slice(2) + '</span>';
      d.onclick = function () { mesSel = clave(o); pintar(); };
      bars.appendChild(d);
    });
    c.appendChild(bars);

    /* gastos */
    c.appendChild(el('h3', null, 'En qué se fue la plata'));
    var g2 = el('div', 'fz-grid'); c.appendChild(g2);
    [['Sueldos del equipo', 'TOTAL_SUELDOS_EQUIPO_USD'], ['Plataforma (fábrica digital)', 'COSTO_FABRICA_DIGITAL_PLATAFORMA_USD'], ['Meta Ads', 'PUBLICIDAD_META_ADS_USD'], ['Google Ads México', 'PUBLICIDAD_GOOGLE_ADS_MEXICO_EN_USD'], ['Google Ads Argentina', 'PUBLICIDAD_GOOGLE_ADS_ARGENTINA_USD'], ['Amazon y varios', 'GASTOS_AMAZON_Y_VARIOS_USD']]
      .forEach(function (p) { tarjeta(g2, p[0], usd(num(a0[p[1]])), null, p[1], a0, a1, a2, true); });

    /* B · publicidad (rendimiento) — umbrales de la planilla de rendimiento */
    var r0 = D.R[mesSel];
    c.appendChild(el('h3', null, 'B · Publicidad y cierre'));
    if (!r0) c.appendChild(el('p', 'fz-sub', 'Este mes no está cargado en la planilla de rendimiento.'));
    else {
      var g3 = el('div', 'fz-grid'); c.appendChild(g3);
      var cierre = num(r0['% CIERRE']), cpl = num(r0['CPL USD']), cpa = num(r0['CPA USD']), roas = num(r0['ROAS']);
      var r1 = a1 && D.R[clave(a1)], r2 = a2 && D.R[clave(a2)];
      tarjeta(g3, 'Contactos', ent(num(r0['CONTACTOS'])), null, 'CONTACTOS', r0, r1, r2);
      tarjeta(g3, 'Ventas (publicidad)', ent(num(r0['VENTAS'])), null, 'VENTAS', r0, r1, r2);
      tarjeta(g3, '<span class="sem ' + sem(cierre, 18, 17) + '"></span>% de cierre', pct(cierre), 'verde ≥ 18 % · amarillo ≥ 17 %', '% CIERRE', r0, r1, r2);
      tarjeta(g3, 'Inversión', usd(num(r0['INVERSION USD'])), mxn(num(r0['INVERSION'])), 'INVERSION USD', r0, r1, r2, true);
      tarjeta(g3, '<span class="sem ' + sem(cpl, 10, 12, true) + '"></span>Costo por contacto (CPL)', usd(cpl), 'verde ≤ 10 · amarillo ≤ 12', 'CPL USD', r0, r1, r2, true);
      tarjeta(g3, '<span class="sem ' + sem(cpa, 55, 60, true) + '"></span>Costo por venta (CPA)', usd(cpa), 'verde ≤ 55 · amarillo ≤ 60', 'CPA USD', r0, r1, r2, true);
      if (roas) tarjeta(g3, '<span class="sem ' + sem(roas, 2, 1.8) + '"></span>ROAS', roas.toLocaleString('es-AR') + 'x', 'verde ≥ 2 · amarillo ≥ 1,8', 'ROAS', r0, r1, r2);
    }

    /* C · canales (seguimiento) */
    var s0 = D.S[mesSel];
    c.appendChild(el('h3', null, 'C · De dónde vienen'));
    if (!s0 || num(s0['TOTAL INGRESOS']) == null) c.appendChild(el('p', 'fz-sub', 'Este mes no está cargado en la planilla de seguimiento.'));
    else {
      var t = el('table');
      t.innerHTML = '<tr><th>Canal</th><th>Contactos</th><th>Ventas</th><th>Cierre</th></tr>' +
        [['Web México', 'INGRESOS WEB MEX', 'VENTAS WEB MEX', 'WEB MEX CIERRE'], ['Web Argentina', 'INGRESOS WEB ARG', 'VENTAS WEB ARG', 'ARG WEB CIERRE'], ['Meta (WhatsApp)', 'INGRESOS META', 'VENTAS META', 'META CIERRE'], ['Otros', null, 'VENTAS OTROS', null], ['Total', 'TOTAL INGRESOS', 'TOTAL VENTAS', 'TOTAL CIERRE']]
          .map(function (f) { return '<tr' + (f[0] === 'Total' ? ' style="font-weight:700"' : '') + '><td>' + f[0] + '</td><td>' + (f[1] ? ent(num(s0[f[1]])) : '—') + '</td><td>' + ent(num(s0[f[2]])) + '</td><td>' + (f[3] ? pct(num(s0[f[3]])) : '—') + '</td></tr>'; }).join('');
      c.appendChild(t);
    }

    /* D · cobranzas */
    c.appendChild(el('h3', null, 'D · Cobranzas pendientes'));
    var cerrado = /PAGAD|NUNCA|DESHABILIT|NO COMENZ|PASO EL EVENTO/;
    var debe = D.C.filter(function (o) { var e = norm(o['ESTADO']); return (o['CLAVE DE COMPRA'] || o['NOMBRE']) && !cerrado.test(e); });
    if (!debe.length) c.appendChild(el('p', 'fz-sub', 'No hay cobranzas pendientes en la planilla.'));
    else {
      var tc = el('table');
      tc.innerHTML = '<tr><th>Clave</th><th>Nombre</th><th>Contacto</th><th>Evento</th><th>Debe</th><th>Comentario</th><th>Estado</th></tr>' +
        debe.map(function (o) {
          var d = [o['DEUDA MXN'], o['DEUDA EN PESOS ARG'], o['DEUDA EN USD']].filter(Boolean).join(' · ');
          return '<tr><td>' + esc(o['CLAVE DE COMPRA']) + '</td><td>' + esc(o['NOMBRE']) + '</td><td>' + esc(o['NUM DE CONTACTO']) + '</td><td>' + esc(o['FECHA DEL EVENTO']) + '</td><td>' + esc(d) + '</td><td>' + esc(o['COMENTARIOS']) + '</td><td>' + esc(o['ESTADO'] || 'sin estado') + '</td></tr>';
        }).join('');
      c.appendChild(el('p', 'fz-sub', debe.length + ' sin cerrar (no figuran como pagadas, ni «nunca comenzó», ni deshabilitadas).'));
      c.appendChild(tc);
    }

    var ln = el('p', 'fz-links');
    ln.innerHTML = 'Planillas: <a target="_blank" href="' + VER.A + '">Facturación</a><a target="_blank" href="' + VER.S + '">Seguimiento</a><a target="_blank" href="' + VER.R + '">Rendimiento</a>';
    c.appendChild(ln);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  function abrir() {
    if (!esDueno()) { var c = $('#fz-cuerpo'); if (c) c.innerHTML = '<p>Esta pantalla es sólo para el dueño.</p>'; return; }
    cargar().then(pintar).catch(function (e) { var c = $('#fz-cuerpo'); if (c) c.innerHTML = '<p>No se pudieron leer las planillas (' + esc(e.message) + '). Probá «Actualizar» en un rato.</p>'; });
  }
  window.INVFINANZAS = { abrir: abrir, cargar: cargar, _csv: csv, _num: num };
})();
