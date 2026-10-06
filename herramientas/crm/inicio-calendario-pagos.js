/* ===== __invInicio : PANEL DE INICIO + CALENDARIO + PAGOS (6/10/2026) =====
   Maki: «el calendario como el del CRM de Little Moments: cuántas fiestas y
   cuántas invitaciones activas hay por día, todo el mes» · «en el CRM quiero
   todo lo que pago con fecha de vencimiento y estar seguro de que está todo
   pago siempre; todos los meses sé que tengo que dejar X plata en la tarjeta» ·
   «armame la primera página con lo más importante. Sólo lo más importante.»

   DE DÓNDE SALE CADA COSA
   · Fiestas e invitaciones: `inv_eventos` (la misma base de las invitaciones).
     Fecha de la fiesta = campo `fecha` (ISO). Una muestra tiene `fx.muestra`;
     una invitación de cliente no (el portero se lo saca).
     «Activa» = desde que se creó hasta 7 días después de la fiesta (es lo que
     dura abierta la subida de fotos de Invítame Live).
   · Pagos: un solo documento, `crm_meta/pagos` = { lista:[…] }. Se edita desde
     la pantalla Pagos, no por código.
   · Lecturas: el calendario pide sólo las fiestas desde 40 días antes del mes
     que se mira, con tope de 1500. No barre la base entera.
   ============================================================================ */
(function () {
  if (window.__invInicio) return; window.__invInicio = 1;

  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS_POST = 7;
  var EV = [];          /* fiestas cargadas */
  var EV_DESDE = null;  /* hasta dónde se cargó */
  var PAGOS = null;     /* crm_meta/pagos.lista */
  var verMuestras = false;
  var mesVisto = new Date(); mesVisto.setDate(1);

  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoD(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hoy0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function sumDias(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function deIso(s) {
    if (!s) return null;
    if (s.toDate) return s.toDate();
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function fechaCorta(d) { return d ? pad(d.getDate()) + '/' + pad(d.getMonth() + 1) : '—'; }
  function plata(n, mon) { return (mon || 'USD') + ' ' + (Math.round(n * 100) / 100).toLocaleString('es-AR'); }

  /* ---------------- estilos ---------------- */
  var css = el('style'); css.id = 'inv-inicio-css';
  css.textContent = [
    '.ini-bloques{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-bottom:18px}',
    '.ini-b{background:var(--panel);border:1px solid var(--linea);border-radius:var(--radio);padding:15px 16px;box-shadow:var(--sombra)}',
    '.ini-b h3{margin:0 0 8px;font-family:var(--titulo);font-size:21px;color:var(--uva);font-weight:600}',
    '.ini-b .big{font-family:var(--titulo);font-size:36px;font-weight:600;color:var(--frambuesa);line-height:1}',
    '.ini-b .det{font-size:13px;color:var(--suave);margin-top:4px}',
    '.ini-b ul{margin:6px 0 0;padding:0;list-style:none;font-size:13px}',
    '.ini-b li{padding:5px 0;border-top:1px solid var(--linea);display:flex;justify-content:space-between;gap:10px}',
    '.ini-b li:first-child{border-top:0}',
    '.sem{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px;vertical-align:middle}',
    '.sem.v{background:var(--ok)}.sem.a{background:var(--alerta)}.sem.r{background:var(--mal)}.sem.g{background:#bbb}',
    '.ini-b.rojo{border-left:4px solid var(--mal)}.ini-b.amar{border-left:4px solid var(--alerta)}.ini-b.verde{border-left:4px solid var(--ok)}',
    /* calendario */
    '.cal-cab{display:flex;align-items:center;gap:10px;margin:0 0 12px;flex-wrap:wrap}',
    '.cal-cab button{border:1px solid var(--linea);background:var(--panel);border-radius:8px;padding:6px 12px;cursor:pointer;color:var(--uva);font:inherit}',
    '.cal-cab .mes{font-family:var(--titulo);font-size:26px;color:var(--uva);min-width:200px;text-align:center;text-transform:capitalize}',
    '.cal-cab label{font-size:13px;color:var(--suave);margin-left:auto}',
    '.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}',
    '.cal .dn{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--suave);text-align:center;padding:4px 0}',
    '.cal .d{background:var(--panel);border:1px solid var(--linea);border-radius:10px;min-height:86px;padding:6px 7px;cursor:pointer;display:flex;flex-direction:column;gap:3px;overflow:hidden}',
    '.cal .d.fuera{opacity:.35}.cal .d.hoy{border:2px solid var(--ok)}',
    '.cal .d .n{font-size:12px;color:var(--suave);font-weight:700}',
    '.cal .d .f{align-self:flex-start;background:var(--frambuesa);color:#fff;border-radius:999px;font-size:12px;font-weight:800;padding:1px 8px}',
    '.cal .d .ac{font-size:11px;color:var(--suave)}',
    '.cal .d .nom{font-size:11px;color:var(--tinta);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.cal-det{margin-top:14px}',
    '@media(max-width:700px){.cal .d{min-height:62px;padding:4px}.cal .d .nom,.cal .d .ac{display:none}}',
    /* pagos */
    '.pg-tabla input,.pg-tabla select{font:inherit;font-size:13px;border:1px solid var(--linea);border-radius:6px;padding:4px 6px;background:#fff;max-width:150px}',
    '.pg-tabla td{white-space:nowrap;max-width:none}',
    '.pg-tabla .chk{cursor:pointer;border:0;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px;color:#fff}',
    '.pg-acc{display:flex;gap:10px;margin:12px 0;flex-wrap:wrap}',
    '.pg-acc button{border:0;background:var(--rosa-fuerte);color:#fff;border-radius:8px;padding:8px 14px;cursor:pointer;font:inherit;font-weight:700}',
    '.pg-acc button.sec{background:var(--panel);color:var(--uva);border:1px solid var(--linea)}',
    '.pg-estado{font-size:13px;color:var(--suave)}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------------- secciones y menú ---------------- */
  function asegurarSeccion(id, titulo, despuesDe) {
    if (document.getElementById(id)) return document.getElementById(id);
    var s = el('section'); s.id = id;
    s.appendChild(el('h2', null, titulo));
    var main = $('.main'); main.appendChild(s);
    var nav = $('nav.side'), a = el('a', null, titulo);
    a.href = '#' + id; a.dataset.s = id;
    var ref = nav.querySelector('a[data-s="' + despuesDe + '"]');
    nav.insertBefore(a, ref ? ref.nextSibling : nav.querySelector('.pie'));
    a.addEventListener('click', function (ev) { ev.preventDefault(); if (window.ir) window.ir(id); else irA(id); pintarSeccion(id); });
    return s;
  }
  function irA(s) {
    document.querySelectorAll('.main section').forEach(function (x) { x.classList.toggle('on', x.id === s); });
    document.querySelectorAll('.side a').forEach(function (a) { a.classList.toggle('act', a.dataset.s === s); });
  }
  var secCal = asegurarSeccion('calendario', 'Calendario', 'panel');
  var secPag = asegurarSeccion('pagos', 'Pagos', 'calendario');
  /* el menú de siempre: si alguien toca Panel, se repinta el inicio */
  var aPanel = $('nav.side a[data-s="panel"]');
  if (aPanel) { aPanel.textContent = 'Inicio'; aPanel.addEventListener('click', function () { setTimeout(pintarInicio, 0); }); }

  /* panel: el bloque de «lo importante» va ARRIBA de las tarjetas de contactos */
  var secPanel = $('#panel');
  var h2 = secPanel.querySelector('h2'); if (h2) h2.textContent = 'Lo importante';
  var ini = el('div', 'ini-bloques'); ini.id = 'ini';
  secPanel.insertBefore(ini, $('#panelsub') ? $('#panelsub').nextSibling : secPanel.firstChild);
  var sepContactos = el('h3', null, 'Contactos'); sepContactos.style.cssText = 'font-family:var(--titulo);color:var(--uva);font-size:21px;margin:8px 0 10px';
  secPanel.insertBefore(sepContactos, $('#panelcards'));

  /* ---------------- datos ---------------- */
  function cargarEventos(desde) {
    if (!window.db) return Promise.resolve();
    if (EV_DESDE && EV_DESDE <= desde) return Promise.resolve();
    return db.collection('inv_eventos').where('fecha', '>=', desde).orderBy('fecha').limit(1500).get()
      .then(function (s) {
        var nuevos = [];
        s.forEach(function (d) {
          var x = d.data() || {};
          var f = deIso(x.fecha); if (!f) return;
          var creada = deIso(x.creadoEl || x.guardadoPanel || x.updatedAt) || f;
          nuevos.push({
            id: d.id, fecha: f, creada: creada,
            nombre: [x.n1, x.n2].filter(Boolean).join(' y ') || d.id,
            muestra: !!(x.fx && x.fx.muestra),
            tipo: x.tipoEvento || x.tipo || ''
          });
        });
        EV = nuevos; EV_DESDE = desde;
      })
      .catch(function (e) { console.warn('calendario', e.code || e.message); EV_DESDE = null; });
  }
  function delMes() {
    var d0 = sumDias(new Date(mesVisto.getFullYear(), mesVisto.getMonth(), 1), -40);
    return cargarEventos(isoD(d0));
  }
  function filtrados() { return EV.filter(function (e) { return verMuestras || !e.muestra; }); }
  function fiestasDel(d) { var k = isoD(d); return filtrados().filter(function (e) { return isoD(e.fecha) === k; }); }
  function activasEl(d) {
    var t = d.getTime();
    return filtrados().filter(function (e) {
      return e.creada.getTime() <= t + 86399999 && t <= sumDias(e.fecha, DIAS_POST).getTime();
    }).length;
  }

  var PAGOS_INICIALES = [
    { nombre: 'Cloudinary (fotos y videos)', para: 'Guarda y entrega las fotos y videos de las invitaciones', monto: 29, moneda: 'USD', cada: 'mensual', vence: '2026-11-02', variable: true, nota: 'Plan Small PAYG. El extra se cobra USD 0,55 por crédito.' },
    { nombre: 'Cloudflare Workers', para: 'Caché de fotos, Invítame Live y filtro de fotos', monto: 5, moneda: 'USD', cada: 'mensual', vence: '', variable: false, nota: 'POR CONTRATAR: el plan gratis corta a los 100.000 pedidos por día.' },
    { nombre: 'Firebase Blaze (la base)', para: 'Invitaciones, confirmaciones, panel y CRM', monto: 5, moneda: 'USD', cada: 'mensual', vence: '', variable: true, nota: 'POR CONTRATAR. Monto estimado: depende del uso.' },
    { nombre: 'Hostinger (servidor)', para: 'Donde viven la plataforma, el panel y el CRM', monto: 0, moneda: 'USD', cada: 'anual', vence: '', variable: false, nota: 'Completar monto y vencimiento.' },
    { nombre: 'Dominio invitameok.com', para: 'La web oficial', monto: 0, moneda: 'USD', cada: 'anual', vence: '', variable: false, nota: 'Completar vencimiento (lo tiene Gonza hasta el traspaso).' }
  ];
  function cargarPagos() {
    if (!window.db) return Promise.resolve();
    return db.collection('crm_meta').doc('pagos').get().then(function (d) {
      PAGOS = (d.exists && Array.isArray((d.data() || {}).lista)) ? d.data().lista : null;
      if (!PAGOS) { PAGOS = JSON.parse(JSON.stringify(PAGOS_INICIALES)); return guardarPagos(true); }
    }).catch(function (e) { console.warn('pagos', e.code || e.message); });
  }
  function guardarPagos(silencio) {
    return db.collection('crm_meta').doc('pagos').set({ lista: PAGOS, guardado: new Date().toISOString(), por: (window.auth && auth.currentUser && auth.currentUser.email) || '' })
      .then(function () { if (!silencio) aviso('Guardado.'); })
      .catch(function (e) { aviso('No se pudo guardar: ' + (e.code || e.message)); });
  }
  function aviso(t) { var a = $('#pg-estado'); if (a) { a.textContent = t; setTimeout(function () { if (a.textContent === t) a.textContent = ''; }, 4000); } }

  /* estado de un pago: rojo = vencido, amarillo = vence en 7 días, verde = pagado, gris = sin fecha */
  function estadoPago(p) {
    var v = deIso(p.vence), h = hoy0();
    if (p.pagadoHasta && deIso(p.pagadoHasta) && deIso(p.pagadoHasta) >= h && (!v || deIso(p.pagadoHasta) >= v)) return 'v';
    if (!v) return 'g';
    var dias = Math.round((v - h) / 86400000);
    if (dias < 0) return 'r';
    if (dias <= 7) return 'a';
    return 'v';
  }
  function mensual(p) { var m = +p.monto || 0; return p.cada === 'anual' ? m / 12 : (p.cada === 'trimestral' ? m / 3 : m); }
  function totalMes() {
    var t = 0, variables = 0;
    (PAGOS || []).forEach(function (p) { if ((p.moneda || 'USD') !== 'USD') return; t += mensual(p); if (p.variable) variables += mensual(p); });
    return { base: t, conMargen: t + variables * 0.5 };
  }
  function siguiente(fechaIso, cada) {
    var d = deIso(fechaIso) || hoy0();
    if (cada === 'anual') d.setFullYear(d.getFullYear() + 1);
    else if (cada === 'trimestral') d.setMonth(d.getMonth() + 3);
    else d.setMonth(d.getMonth() + 1);
    return isoD(d);
  }

  /* ---------------- INICIO: sólo lo más importante ---------------- */
  function bloque(clase, titulo) { var b = el('div', 'ini-b ' + (clase || '')); b.appendChild(el('h3', null, titulo)); return b; }
  function pintarInicio() {
    var c = $('#ini'); if (!c) return; c.innerHTML = '';
    /* 1 · pagos */
    var lista = PAGOS || [];
    var rojos = lista.filter(function (p) { return estadoPago(p) === 'r'; });
    var amar = lista.filter(function (p) { return estadoPago(p) === 'a'; });
    var sinDatos = lista.filter(function (p) { return !p.vence || !(+p.monto); });
    var bp = bloque(rojos.length ? 'rojo' : amar.length ? 'amar' : 'verde', 'Pagos');
    var tm = totalMes();
    bp.appendChild(el('div', 'big', plata(Math.ceil(tm.conMargen), 'USD')));
    bp.appendChild(el('div', 'det', 'para dejar en la tarjeta este mes (fijo ' + plata(tm.base, 'USD') + ' + margen por lo que varía)'));
    var ul = el('ul');
    (rojos.concat(amar)).slice(0, 4).forEach(function (p) {
      var li = el('li'); var s = el('span'); s.appendChild(el('i', 'sem ' + estadoPago(p))); s.appendChild(document.createTextNode(p.nombre));
      li.appendChild(s); li.appendChild(el('span', null, (estadoPago(p) === 'r' ? 'VENCIDO ' : 'vence ') + fechaCorta(deIso(p.vence)))); ul.appendChild(li);
    });
    if (!rojos.length && !amar.length) { var li0 = el('li'); li0.appendChild(el('span', null, 'Nada vence en los próximos 7 días.')); ul.appendChild(li0); }
    if (sinDatos.length) { var li1 = el('li'); li1.appendChild(el('span', null, sinDatos.length + ' sin monto o fecha: completalos en Pagos')); ul.appendChild(li1); }
    bp.appendChild(ul); bp.style.cursor = 'pointer'; bp.onclick = function () { irA('pagos'); pintarSeccion('pagos'); };
    c.appendChild(bp);

    /* 2 · fiestas */
    var h = hoy0(), man = sumDias(h, 1);
    var fh = fiestasDel(h), fm = fiestasDel(man);
    var semana = 0; for (var i = 0; i < 7; i++) semana += fiestasDel(sumDias(h, i)).length;
    var bf = bloque(fh.length || fm.length ? 'amar' : '', 'Fiestas en vivo');
    bf.appendChild(el('div', 'big', String(fh.length)));
    bf.appendChild(el('div', 'det', 'hoy · ' + fm.length + ' mañana · ' + semana + ' en los próximos 7 días'));
    var ul2 = el('ul');
    fh.concat(fm).slice(0, 5).forEach(function (e) { var li = el('li'); li.appendChild(el('span', null, e.nombre)); li.appendChild(el('span', null, fechaCorta(e.fecha))); ul2.appendChild(li); });
    bf.appendChild(ul2); bf.style.cursor = 'pointer'; bf.onclick = function () { irA('calendario'); pintarSeccion('calendario'); };
    c.appendChild(bf);

    /* 3 · invitaciones activas */
    var ba = bloque('', 'Invitaciones activas');
    ba.appendChild(el('div', 'big', String(activasEl(h))));
    ba.appendChild(el('div', 'det', 'hoy (desde que se crean hasta ' + DIAS_POST + ' días después de la fiesta)' + (verMuestras ? ' · incluye muestras' : '')));
    c.appendChild(ba);

    /* 4 · servicios */
    var bs = bloque('', 'Servicios');
    var ul3 = el('ul'); bs.appendChild(ul3);
    function fila(nombre, estado, texto) { var li = el('li'); var s = el('span'); s.appendChild(el('i', 'sem ' + estado)); s.appendChild(document.createTextNode(nombre)); li.appendChild(s); li.appendChild(el('span', null, texto)); ul3.appendChild(li); return li; }
    var lc = fila('Caché de fotos', 'g', 'midiendo…');
    fetch('https://galeria.littlemomentsok.workers.dev/res.cloudinary.com/oc8cgqt4/image/upload/w_8,q_1,f_jpg/invitame/x4q8skckyryvodav1iwe.webp?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { lc.querySelector('i').className = 'sem ' + (r.ok ? 'v' : 'r'); lc.lastChild.textContent = r.ok ? 'atiende' : 'NO atiende (las fotos salen directo)'; })
      .catch(function () { lc.querySelector('i').className = 'sem r'; lc.lastChild.textContent = 'no contesta'; });
    var li2 = fila('Invitaciones', 'g', 'midiendo…');
    fetch('https://invitame.littlemomentsok.com/efectos/todo.php?t=' + Date.now(), { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
      .then(function () { li2.querySelector('i').className = 'sem v'; li2.lastChild.textContent = 'el servidor responde'; })
      .catch(function () { li2.querySelector('i').className = 'sem r'; li2.lastChild.textContent = 'el servidor NO responde'; });
    c.appendChild(bs);
  }

  /* ---------------- CALENDARIO ---------------- */
  function pintarCalendario() {
    var s = secCal; var cab = s.querySelector('.cal-cab');
    if (!cab) {
      s.appendChild(el('p', 'sub', 'Por día: «en vivo» son las fiestas que se hacen ese día; «activas», las invitaciones abiertas ese día. Tocá un día para ver cuáles.'));
      cab = el('div', 'cal-cab');
      var ant = el('button', null, '‹'), sig = el('button', null, '›'), hoyB = el('button', null, 'Hoy');
      var mes = el('span', 'mes'); mes.id = 'cal-mes';
      var lab = el('label'); var chk = el('input'); chk.type = 'checkbox'; chk.id = 'cal-muestras';
      lab.appendChild(chk); lab.appendChild(document.createTextNode(' incluir muestras'));
      ant.onclick = function () { mesVisto.setMonth(mesVisto.getMonth() - 1); pintarCalendario(); };
      sig.onclick = function () { mesVisto.setMonth(mesVisto.getMonth() + 1); pintarCalendario(); };
      hoyB.onclick = function () { mesVisto = new Date(); mesVisto.setDate(1); pintarCalendario(); };
      chk.onchange = function () { verMuestras = chk.checked; pintarCalendario(); pintarInicio(); };
      cab.appendChild(ant); cab.appendChild(mes); cab.appendChild(sig); cab.appendChild(hoyB); cab.appendChild(lab);
      s.appendChild(cab);
      var g = el('div', 'cal'); g.id = 'cal-grid'; s.appendChild(g);
      var det = el('div', 'cal-det'); det.id = 'cal-det'; s.appendChild(det);
    }
    $('#cal-mes').textContent = MESES[mesVisto.getMonth()] + ' ' + mesVisto.getFullYear();
    var g2 = $('#cal-grid'); g2.innerHTML = '';
    ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].forEach(function (n) { g2.appendChild(el('div', 'dn', n)); });
    delMes().then(function () {
      var p = new Date(mesVisto.getFullYear(), mesVisto.getMonth(), 1);
      var corr = (p.getDay() + 6) % 7; var d = sumDias(p, -corr);
      var hk = isoD(hoy0());
      for (var i = 0; i < 42; i++) {
        var dd = sumDias(d, i);
        if (i >= 35 && dd.getMonth() !== mesVisto.getMonth()) break;
        var c = el('div', 'd' + (dd.getMonth() !== mesVisto.getMonth() ? ' fuera' : '') + (isoD(dd) === hk ? ' hoy' : ''));
        c.appendChild(el('span', 'n', String(dd.getDate())));
        var fs = fiestasDel(dd);
        if (fs.length) c.appendChild(el('span', 'f', fs.length + ' en vivo'));
        fs.slice(0, 2).forEach(function (e) { c.appendChild(el('span', 'nom', e.nombre)); });
        var ac = activasEl(dd); if (ac) c.appendChild(el('span', 'ac', ac + ' activas'));
        (function (dia) { c.onclick = function () { detalleDia(dia); }; })(dd);
        g2.appendChild(c);
      }
    });
  }
  function detalleDia(d) {
    var det = $('#cal-det'); det.innerHTML = '';
    var fs = fiestasDel(d);
    det.appendChild(el('h3', null, pad(d.getDate()) + ' de ' + MESES[d.getMonth()] + ': ' + fs.length + ' en vivo (fiesta' + (fs.length === 1 ? '' : 's') + ' ese día) · ' + activasEl(d) + ' invitaciones activas'));
    if (!fs.length) return;
    var t = el('table'); var tb = el('tbody'); t.appendChild(tb);
    fs.forEach(function (e) {
      var tr = el('tr'); tr.appendChild(el('td', null, e.nombre));
      tr.appendChild(el('td', null, e.muestra ? 'muestra' : 'cliente'));
      var td = el('td'); var a = el('a', null, 'abrir'); a.href = 'https://invitame.littlemomentsok.com/i/?e=' + encodeURIComponent(e.id); a.target = '_blank'; td.appendChild(a); tr.appendChild(td);
      var td2 = el('td'); var a2 = el('a', null, 'panel'); a2.href = 'https://invitame.littlemomentsok.com/admin.html?e=' + encodeURIComponent(e.id); a2.target = '_blank'; td2.appendChild(a2); tr.appendChild(td2);
      tb.appendChild(tr);
    });
    det.appendChild(t);
  }

  /* ---------------- PAGOS ---------------- */
  function pintarPagos() {
    var s = secPag; var cont = s.querySelector('#pg-cont');
    if (!cont) {
      s.appendChild(el('p', 'sub', 'Todo lo que se paga para que Invítame funcione. Rojo = vencido · amarillo = vence en 7 días · verde = al día · gris = falta la fecha. «Pagado» corre el vencimiento al período siguiente.'));
      var tot = el('div', 'tarjetas'); tot.id = 'pg-tot'; s.appendChild(tot);
      var acc = el('div', 'pg-acc');
      var add = el('button', null, '+ Agregar un pago'); add.onclick = function () { PAGOS.push({ nombre: 'Nuevo', para: '', monto: 0, moneda: 'USD', cada: 'mensual', vence: '', variable: false, nota: '' }); guardarPagos(); pintarPagos(); };
      acc.appendChild(add); var est = el('span', 'pg-estado'); est.id = 'pg-estado'; acc.appendChild(est);
      s.appendChild(acc);
      cont = el('div', 'tabla-wrap'); cont.id = 'pg-cont'; s.appendChild(cont);
    }
    if (!PAGOS) { cont.textContent = 'Cargando…'; cargarPagos().then(pintarPagos); return; }
    var tm = totalMes(), tot2 = $('#pg-tot'); tot2.innerHTML = '';
    [['USD ' + Math.ceil(tm.conMargen), 'dejar en la tarjeta por mes'], ['USD ' + (Math.round(tm.base * 100) / 100), 'fijo por mes (los anuales, divididos en 12)'],
     [String(PAGOS.filter(function (p) { return estadoPago(p) === 'r'; }).length), 'vencidos'], [String(PAGOS.filter(function (p) { return estadoPago(p) === 'a'; }).length), 'vencen en 7 días']]
      .forEach(function (x) { var t = el('div', 't'); t.appendChild(el('b', null, x[0])); t.appendChild(el('span', null, x[1])); tot2.appendChild(t); });

    var t = el('table', 'pg-tabla'); var th = el('thead'); var trh = el('tr');
    ['', 'Servicio', 'Para qué', 'Monto', 'Moneda', 'Cada', 'Vence', 'Varía', 'Nota', ''].forEach(function (x) { trh.appendChild(el('th', null, x)); });
    th.appendChild(trh); t.appendChild(th); var tb = el('tbody'); t.appendChild(tb);
    PAGOS.forEach(function (p, i) {
      var tr = el('tr'); var e = estadoPago(p);
      var td0 = el('td'); var b = el('button', 'chk', e === 'v' ? 'Al día' : e === 'g' ? 'Sin fecha' : 'Pagado');
      b.style.background = e === 'r' ? 'var(--mal)' : e === 'a' ? 'var(--alerta)' : e === 'v' ? 'var(--ok)' : '#999';
      b.title = 'Marcar pagado: el vencimiento pasa al período siguiente';
      b.onclick = function () {
        if (!p.vence) { aviso('Primero poné la fecha de vencimiento.'); return; }
        if (!confirm('¿Marcar «' + p.nombre + '» como pagado? El vencimiento pasa del ' + fechaCorta(deIso(p.vence)) + ' al ' + fechaCorta(deIso(siguiente(p.vence, p.cada))) + '.')) return;
        p.historial = (p.historial || []).concat([{ pagado: isoD(new Date()), vencia: p.vence, monto: p.monto, moneda: p.moneda }]).slice(-24);
        p.pagadoHasta = p.vence; p.vence = siguiente(p.vence, p.cada);
        guardarPagos(); pintarPagos(); pintarInicio();
      };
      td0.appendChild(b); tr.appendChild(td0);
      function campo(k, tipo, ancho, opciones) {
        var td = el('td'); var inp;
        if (opciones) { inp = el('select'); opciones.forEach(function (o) { inp.appendChild(new Option(o, o)); }); inp.value = p[k] || opciones[0]; }
        else { inp = el('input'); inp.type = tipo; if (tipo === 'checkbox') inp.checked = !!p[k]; else inp.value = p[k] == null ? '' : p[k]; }
        if (ancho) inp.style.width = ancho;
        inp.onchange = function () { p[k] = tipo === 'checkbox' ? inp.checked : (tipo === 'number' ? (+inp.value || 0) : inp.value); guardarPagos(); pintarPagos(); pintarInicio(); };
        td.appendChild(inp); tr.appendChild(td);
      }
      campo('nombre', 'text', '170px'); campo('para', 'text', '200px'); campo('monto', 'number', '80px');
      campo('moneda', null, null, ['USD', 'ARS', 'MXN']); campo('cada', null, null, ['mensual', 'trimestral', 'anual']);
      campo('vence', 'date'); campo('variable', 'checkbox'); campo('nota', 'text', '240px');
      var tdx = el('td'); var bx = el('button', null, '×'); bx.title = 'Quitar'; bx.style.cssText = 'border:0;background:none;color:var(--mal);font-size:18px;cursor:pointer';
      bx.onclick = function () { if (confirm('¿Quitar «' + p.nombre + '» de la lista?')) { PAGOS.splice(i, 1); guardarPagos(); pintarPagos(); pintarInicio(); } };
      tdx.appendChild(bx); tr.appendChild(tdx);
      tb.appendChild(tr);
    });
    cont.innerHTML = ''; cont.appendChild(t);
    var nota = el('p', 'sub'); nota.textContent = 'Lo que se paga en ARS o MXN no entra en el total en dólares. «Varía» suma un 50 % de margen de ese gasto al monto de la tarjeta.';
    cont.appendChild(nota);
  }

  function pintarSeccion(id) { if (id === 'calendario') pintarCalendario(); if (id === 'pagos') pintarPagos(); }

  /* ---------------- arranque: después del login ---------------- */
  var n = 0, t = setInterval(function () {
    var listo = window.db && window.auth && auth.currentUser;
    if (!listo) { if (++n > 60) { clearInterval(t); t = setInterval(arguments.callee, 3000); n = -1e9; } return; }  /* sigue esperando el login, más lento */
    clearInterval(t);
    Promise.all([cargarPagos(), cargarEventos(isoD(sumDias(hoy0(), -40)))]).then(function () {
      pintarInicio();
      var s = (document.querySelector('.main section.on') || {}).id; pintarSeccion(s);
    });
  }, 1000);

  window.INVINICIO = { pintarInicio: pintarInicio, pintarCalendario: pintarCalendario, pintarPagos: pintarPagos,
    _test: { estadoPago: estadoPago, totalMes: totalMes, siguiente: siguiente, activasEl: activasEl, fiestasDel: fiestasDel,
      setEV: function (x) { EV = x; EV_DESDE = '0000'; }, setPagos: function (x) { PAGOS = x; } } };
})();
