/* ===== EL FORMATO «LIBRO», EN EL PANEL (pestaña LIBRO) · 19/11/2026 ==========
   Maki: «que Jazmín pueda armar un libro nuevo para cualquier pareja 100 %
   desde el panel, sin tocar código». Molde: especial/ximena-y-diego-libro.

   QUÉ HACE
   · Un interruptor «Esta invitación es un Libro» (fx.libro.on). Prendido, el
     link /i/?e=<slug> sirve /libro/ (i/libro.php) en vez del motor de /i/, y la
     miniatura del panel pasa a /libro/?preview=1 (misma regla: miniatura =
     publicada; recibe el borrador por postMessage, como /i/).
   · Todo lo del libro vive en D.fx.libro. Lo que la invitación YA tiene (los
     nombres, la fecha, los lugares, la vestimenta, Liverpool, la CLABE, los
     WhatsApp y la música) se edita acá pero en SUS MISMAS claves (n1, n2,
     fecha, ev1*, ev2*, reg_liverpool, regClabe…): un dato, un solo lugar.
   · Cada foto, al subirla, saca sola su mapa de profundidad (Depth Anything V2,
     en el navegador de Jazmín) y lo sube a Cloudinary. Si no se puede, la
     página va sin 3D y no se rompe nada.

   ⚠️ OPT-IN: una invitación sin fx.libro.on no cambia en nada. Prenderlo en una
      ENTREGADA pide confirmación (cambia la invitación entera de los novios).
   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
   ============================================================================ */
(function () {
  'use strict';
  if (/^\/(i|libro)\//.test(location.pathname)) return;   /* sólo en el panel: el invitado no lo usa */
  if (window.__invPanelLibro) return; window.__invPanelLibro = 1;
  var ID = 'libro-editor';
  var TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5';
  var MODELO = 'onnx-community/depth-anything-v2-small';

  function DD() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function LB() { var d = DD(); if (!d) return {}; d.fx = d.fx || {}; d.fx.libro = d.fx.libro || {}; return d.fx.libro; }
  function prev() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function get(o, ruta) { var p = ruta.split('.'); for (var i = 0; i < p.length; i++) { if (o == null) return ''; o = o[p[i]]; } return o == null ? '' : o; }
  function put(o, ruta, v) { var p = ruta.split('.'); for (var i = 0; i < p.length - 1; i++) { var k = p[i]; if (o[k] == null || typeof o[k] !== 'object') o[k] = /^\d+$/.test(p[i + 1]) ? [] : {}; o = o[k]; } o[p[p.length - 1]] = v; }
  function compartido(k, v) { if (typeof setB === 'function') setB(k, v); else { var d = DD(); if (d) { d[k] = v; prev(); } } }
  function romano(n) { n = Math.floor(+n || 0); var v = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], s = ''; v.forEach(function (x) { while (n >= x[0]) { s += x[1]; n -= x[0]; } }); return s; }
  var ORD = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho'];

  /* ── la profundidad 3D, sola ───────────────────────────────────────────── */
  var _pipe = null;
  function pipe() {
    if (_pipe) return _pipe;
    _pipe = import(TRANSFORMERS).then(function (T) {
      T.env.allowLocalModels = false;
      var gpu = !!navigator.gpu;
      return T.pipeline('depth-estimation', MODELO, gpu ? { device: 'webgpu', dtype: 'fp16' } : { dtype: 'q8' })
        .catch(function () { return T.pipeline('depth-estimation', MODELO, { dtype: 'q8' }); });
    });
    _pipe.catch(function () { _pipe = null; });
    return _pipe;
  }
  function chica(u, w) { return String(u).replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)/, '$1f_jpg,q_auto,w_' + w + ',c_limit/'); }
  function profundidad(url) {
    var t = new Promise(function (_, mal) { setTimeout(function () { mal(new Error('tardó demasiado')); }, 180000); });
    return Promise.race([t, pipe().then(function (p) { return p(chica(url, 720)); }).then(function (out) {
      var d = out.depth, w = d.width, h = d.height, ch = d.channels || 1;
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'), im = x.createImageData(w, h);
      for (var i = 0; i < w * h; i++) { var v = d.data[i * ch]; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
      x.putImageData(im, 0, 0);
      var W2 = 360, H2 = Math.round(h * 360 / w), c2 = document.createElement('canvas'); c2.width = W2; c2.height = H2;
      c2.getContext('2d').drawImage(c, 0, 0, W2, H2);
      return new Promise(function (ok) { c2.toBlob(ok, 'image/png'); });
    }).then(function (b) {
      if (!b) throw new Error('sin imagen');
      return window.INV.uploadImage(new File([b], 'profundidad.png', { type: 'image/png' }));
    })]);
  }

  /* ── piezas de formulario ─────────────────────────────────────────────── */
  var S = { lab: 'display:block;font-size:12px;font-weight:600;margin:10px 0 3px', ay: 'font-size:11px;opacity:.6;line-height:1.35;margin-top:3px', h: 'font-size:14px;font-weight:800;margin:18px 0 2px;color:#6D1233' };
  function campo(rot, attr, val, tipo, ph, ayuda) {
    var v = esc(val);
    var inp = tipo === 'area' ? '<textarea ' + attr + ' rows="4" style="width:100%" placeholder="' + esc(ph || '') + '">' + v + '</textarea>'
      : '<input ' + attr + ' type="' + (tipo || 'text') + '" value="' + v + '" style="width:100%" placeholder="' + esc(ph || '') + '">';
    return '<label style="' + S.lab + '">' + rot + '</label>' + inp + (ayuda ? '<div style="' + S.ay + '">' + ayuda + '</div>' : '');
  }
  function l(rot, ruta, tipo, ph, ayuda) { return campo(rot, 'data-l="' + ruta + '"', get(LB(), ruta), tipo, ph, ayuda); }
  function k(rot, clave, tipo, ph, ayuda) { var d = DD() || {}; return campo(rot, 'data-k="' + clave + '"', d[clave] == null ? '' : d[clave], tipo, ph, ayuda); }
  function foto(rot, ruta, ayuda) {
    var u = get(LB(), ruta + '.foto'), p = get(LB(), ruta + '.prof');
    return '<label style="' + S.lab + '">' + rot + '</label>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<div style="width:62px;height:88px;border-radius:8px;flex:none;background:#eee center/cover' + (u ? ' url(&quot;' + esc(chica(u, 160)) + '&quot;)' : '') + '"></div>' +
      '<div style="flex:1"><input type="file" accept="image/*" data-archivo="' + ruta + '" hidden><button type="button" class="btn-c" data-subir="' + ruta + '">' + (u ? 'Cambiar la foto' : 'Subir la foto') + '</button>' +
      (u ? ' <button type="button" class="btn-c" data-quitar="' + ruta + '">Quitar</button>' : '') +
      '<div data-estado="' + ruta + '" style="' + S.ay + '">' + (u ? (p ? 'Con profundidad 3D.' : 'Sin 3D (va plana). <a href="#" data-3d="' + ruta + '">Calcular el 3D</a>') : (ayuda || 'Vertical, como de celular.')) + '</div></div></div>';
  }
  function seccion(ir, titulo, html) { return '<div data-ir="' + ir + '" style="border-top:1px solid rgba(0,0,0,.08);margin-top:14px;padding-top:4px"><div style="' + S.h + '">' + titulo + '</div>' + html + '</div>'; }

  function html() {
    var d = DD() || {}, L = LB(), on = !!L.on;
    var anio = /^\d{4}/.test(String(d.fecha || '')) ? romano(String(d.fecha).slice(0, 4)) : '—';
    var h = '<div style="font-size:15px;font-weight:800;margin-bottom:2px">El formato Libro</div>' +
      '<div style="' + S.ay + ';margin-bottom:10px">La invitación se lee pasando páginas: la tapa de lino, la portada, el prólogo, los capítulos de su historia, el anillo, la fecha, los lugares, los regalos y el final con «Confirmar asistencia».</div>' +
      '<label style="display:flex;gap:8px;align-items:center;font-weight:700;font-size:13px"><input type="checkbox" id="libro-on"' + (on ? ' checked' : '') + '> Esta invitación es un Libro</label>' +
      '<div style="' + S.ay + '">Prendido, el link de la invitación muestra el libro en vez de la invitación de siempre (y la miniatura también). Apagado, vuelve a la de siempre: no se borra nada.</div>';
    if (!on) return h;
    var caps = Array.isArray(L.caps) ? L.caps : [];
    h += seccion('apertura', '1 · La tapa (apertura)',
      '<div class="two" style="display:flex;gap:8px"><div style="flex:1">' + k('Nombre 1', 'n1', 'text', 'Ximena') + '</div><div style="flex:1">' + k('Nombre 2', 'n2', 'text', 'Diego') + '</div></div>' +
      '<div style="' + S.ay + '">Son los nombres de la invitación (los mismos de PRINCIPAL). El año en la tapa sale solo de la fecha: <b>' + anio + '</b>.</div>' +
      fondo('El fondo (mármol con flores)', 'marmol') + fondo('La tela de la tapa (lino blanco)', 'tela'));
    h += seccion('portada', '2 · La portada',
      foto('Foto de los novios', 'portada', 'La foto principal, vertical. Es también la que se ve al compartir el link.') +
      l('Título', 'titulo', 'text', 'Nuestra historia') +
      k('Fecha y hora del evento', 'fecha', 'datetime-local', '', 'La misma de PRINCIPAL. De acá salen la portada, la tapa, la cuenta regresiva y «Guardar la fecha».'));
    h += seccion('prologo', '3 · El prólogo',
      l('Texto', 'prologo.texto', 'area', 'Antes del «sí» hubo un café equivocado, una tormenta…', 'Aparece palabra por palabra. Cada renglón es un párrafo. Vacío, no hay prólogo.') +
      l('Firma', 'prologo.firma', 'text', (d.n1 && d.n2) ? d.n1 + ' y ' + d.n2 : 'Ximena y Diego'));
    var hc = '<div style="' + S.ay + '">De 3 a 8. El número («Capítulo uno»…) sale solo, en el orden de la lista. El texto, corto (unas 40 palabras): si es largo se achica la letra para que entre.</div>';
    caps.forEach(function (c, i) {
      hc += '<div data-ir="cap' + (i + 1) + '" style="background:#faf6f2;border:1px solid rgba(0,0,0,.07);border-radius:12px;padding:6px 12px 12px;margin-top:10px">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-top:6px"><b style="flex:1;font-size:13px">Capítulo ' + (ORD[i] || i + 1) + '</b>' +
        '<button type="button" class="btn-c" data-mover="' + i + ',-1"' + (i ? '' : ' disabled') + ' title="Subir">↑</button>' +
        '<button type="button" class="btn-c" data-mover="' + i + ',1"' + (i < caps.length - 1 ? '' : ' disabled') + ' title="Bajar">↓</button>' +
        '<button type="button" class="btn-c" data-borrar="' + i + '"' + (caps.length > 3 ? '' : ' disabled') + ' title="Sacar">×</button></div>' +
        l('Ciudad (opcional)', 'caps.' + i + '.ciudad', 'text', 'Ciudad de México') +
        l('Título', 'caps.' + i + '.titulo', 'text', 'El café equivocado') +
        l('Texto', 'caps.' + i + '.texto', 'area', 'Cómo pasó, con un detalle concreto…') +
        foto('Foto', 'caps.' + i) +
        '<label style="display:flex;gap:6px;align-items:center;font-size:12px;margin-top:8px"><input type="checkbox" data-lc="caps.' + i + '.arriba"' + (c && c.arriba ? ' checked' : '') + '> El texto va arriba (si abajo tapa algo importante de la foto)</label></div>';
    });
    if (caps.length < 8) hc += '<button type="button" class="btn-c" id="libro-cap-mas" style="margin-top:10px">+ Agregar un capítulo</button>';
    h += seccion('cap1', '4 · Los capítulos (' + caps.length + ')', hc);
    h += seccion('anillo', '5 · La página del anillo',
      foto('Foto del anillo o de la pedida', 'anillo') + l('Frase', 'anillo.frase', 'text', 'Dijo «sí» antes de que terminara la pregunta.', 'Sin foto, la página no aparece.'));
    h += seccion('fecha', '6 · La fecha',
      '<div style="' + S.ay + '">El lacre con las iniciales (<b>' + esc(((d.n1 || ' ')[0] + (d.n2 || ' ')[0]).toUpperCase()) + '</b>), el día, la hora y la cuenta regresiva salen solos de los nombres y de la fecha.</div>' +
      l('Encima', 'fechaKick', 'text', 'Y ahora') + l('Frase', 'fechaTit', 'text', 'el capítulo que queremos escribir contigo'));
    h += seccion('lugares', '7 · Los lugares y la vestimenta',
      k('Ceremonia · nombre del lugar', 'ev1sub', 'text', 'Templo de la Concepción') + k('Ceremonia · dirección', 'ev1dir', 'text', 'Canal s/n, Centro') +
      k('Ceremonia · link de Google Maps', 'ev1maps', 'text', 'https://maps.app.goo.gl/…', 'Vacío, se busca por el nombre y la dirección.') +
      k('Ceremonia · hora', 'c_ceremonia-1-fecha', 'datetime-local') +
      k('Recepción · nombre del lugar', 'ev2sub', 'text', 'Rosewood San Miguel') + k('Recepción · dirección', 'ev2dir', 'text', 'Nemesio Diez 11') +
      k('Recepción · link de Google Maps', 'ev2maps', 'text', 'https://maps.app.goo.gl/…') + k('Recepción · hora', 'c_ceremonia-2-fecha', 'datetime-local') +
      k('Vestimenta', 'c_dresscode-texto', 'text', 'Formal · tonos neutros'));
    h += seccion('lugares', '8 · Los regalos',
      k('Liverpool (link de la mesa o número de evento)', 'reg_liverpool', 'text', 'https://mesaderegalos.liverpool.com.mx/… o 51234567') +
      '<label style="display:flex;gap:6px;align-items:center;font-size:12px;margin-top:10px"><input type="checkbox" data-lc="lluvia"' + (L.lluvia ? ' checked' : '') + '> Lluvia de sobres</label>' +
      l('Texto de la lluvia de sobres', 'lluviaTxt', 'text', 'Habrá un buzón el día de la boda') +
      k('CLABE', 'regClabe', 'text', '012 180 0012 3456 7890', 'El invitado la copia con un toque.') +
      '<div style="display:flex;gap:8px"><div style="flex:1">' + k('Banco', 'regBanco', 'text', 'BBVA') + '</div><div style="flex:1">' + k('Titular', 'regTitular', 'text', 'Ximena R.') + '</div></div>' +
      '<div style="' + S.ay + '">Lo que dejes vacío no aparece. Sin ninguno, no está el botón «Mesa de regalos».</div>');
    var a = String(L.rsvpA || '1');
    h += seccion('final', '9 · El final y la confirmación',
      foto('Foto final', 'final') + l('Encima', 'final.kick', 'text', 'Fin… o mejor dicho') + l('Título', 'final.titulo', 'text', 'el principio') +
      l('Frase', 'final.frase', 'text', 'Nos falta una sola cosa para empezar este capítulo: tú.') +
      '<div style="display:flex;gap:8px"><div style="flex:1">' + k('WhatsApp 1 · nombre', 'c_texto-corto-boton-wsp', 'text', 'Ximena') + '</div><div style="flex:1">' + k('WhatsApp 1 · número', 'c_numero-de-whatsapp', 'tel', '+52 999 123 4567') + '</div></div>' +
      '<div style="display:flex;gap:8px"><div style="flex:1">' + k('WhatsApp 2 · nombre', 'c_texto-corto-boton-wsp-2', 'text', 'Diego') + '</div><div style="flex:1">' + k('WhatsApp 2 · número', 'c_numero-de-whatsapp-2', 'tel', '+52 999 765 4321') + '</div></div>' +
      '<label style="' + S.lab + '">«Confirmar asistencia» le llega a</label><select data-l="rsvpA" style="width:100%"><option value="1"' + (a === '1' ? ' selected' : '') + '>WhatsApp 1' + (d['c_texto-corto-boton-wsp'] ? ' (' + esc(d['c_texto-corto-boton-wsp']) + ')' : '') + '</option><option value="2"' + (a === '2' ? ' selected' : '') + '>WhatsApp 2' + (d['c_texto-corto-boton-wsp-2'] ? ' (' + esc(d['c_texto-corto-boton-wsp-2']) + ')' : '') + '</option></select>' +
      l('Confirmar antes del (opcional)', 'limite', 'date') + l('Máximo de personas en «¿Cuántos asistirán?»', 'maxPersonas', 'number', '6'));
    h += seccion('portada', '10 · La música',
      k('Música (mp3)', 'musicaUrl', 'text', 'https://res.cloudinary.com/…/cancion.mp3', 'Sólo un archivo de audio (.mp3). De YouTube no: no suena en el iPhone.') +
      '<input type="file" accept="audio/*,.mp3,.m4a" id="libro-mp3-in" hidden><button type="button" class="btn-c" id="libro-mp3" style="margin-top:6px">Subir el mp3</button> <span id="libro-mp3-e" style="' + S.ay + '"></span>');
    return h;
  }
  function fondo(rot, clave) {
    var u = LB()[clave];
    return '<label style="' + S.lab + '">' + rot + '</label><div style="' + S.ay + ';margin-top:0">' + (u ? 'Uno propio. <a href="#" data-fabrica="' + clave + '">Volver al de fábrica</a>' : 'El de fábrica.') + '</div>' +
      '<input type="file" accept="image/*" data-archivo-fondo="' + clave + '" hidden><button type="button" class="btn-c" data-fondo="' + clave + '" style="margin-top:4px">Subir otro</button>';
  }

  /* ── armar y escuchar ─────────────────────────────────────────────────── */
  var caja = null, slugCaja = null;
  function pintar() { if (!caja) return; var y = caja.closest('.panel') ? caja.closest('.panel').scrollTop : 0; caja.innerHTML = html(); var pn = caja.closest('.panel'); if (pn) pn.scrollTop = y; }
  function ir(id) { var fr = document.getElementById('pv-frame'); if (fr && fr.contentWindow && /\/libro\//.test(fr.src)) { try { fr.contentWindow.postMessage({ type: 'libro-ir', id: id }, '*'); } catch (e) {} } }
  function estado(ruta, txt) { var e = caja && caja.querySelector('[data-estado="' + ruta + '"]'); if (e) e.innerHTML = txt; }
  function calcular3d(ruta) {
    var u = get(LB(), ruta + '.foto'); if (!u) return;
    estado(ruta, 'Calculando la profundidad 3D… (la primera vez tarda un poco más)');
    profundidad(u).then(function (p) {
      if (get(LB(), ruta + '.foto') !== u) return;       /* cambiaron la foto mientras tanto */
      put(LB(), ruta + '.prof', p); prev(); estado(ruta, 'Con profundidad 3D.');
    }).catch(function () {
      put(LB(), ruta + '.prof', ''); prev();
      estado(ruta, 'No se pudo calcular el 3D: la página va plana, sin problema. <a href="#" data-3d="' + ruta + '">Probar de nuevo</a>');
    });
  }
  function archivo(t, f) {
    var L = LB();
    if (t.dataset.archivo) {
      var ruta = t.dataset.archivo;
      estado(ruta, 'Subiendo la foto…');
      window.INV.uploadImage(f).then(function (u) { put(LB(), ruta + '.foto', u); put(LB(), ruta + '.prof', ''); prev(); pintar(); ir(ruta.replace(/^caps\.(\d+)$/, function (_, n) { return 'cap' + (+n + 1); })); calcular3d(ruta); })
        .catch(function () { estado(ruta, 'No se pudo subir. Probá de nuevo.'); });
    } else if (t.dataset.archivoFondo) {
      var cl = t.dataset.archivoFondo;
      window.INV.uploadImage(f).then(function (u) { LB()[cl] = u; prev(); pintar(); ir('apertura'); }).catch(function () { alert('No se pudo subir. Probá de nuevo.'); });
    } else if (t.id === 'libro-mp3-in') {
      var es = caja.querySelector('#libro-mp3-e');
      if (!/^audio\//.test(f.type || '') && !/\.(mp3|m4a|aac|ogg|wav)$/i.test(f.name || '')) { if (es) es.textContent = 'Eso no es un audio.'; return; }
      if (es) es.textContent = 'Subiendo…';
      window.INV.uploadVideo(f).then(function (u) { compartido('musicaUrl', u); pintar(); var e2 = caja.querySelector('#libro-mp3-e'); if (e2) e2.textContent = 'Música subida.'; })
        .catch(function () { if (es) es.textContent = 'No se pudo subir. Probá de nuevo.'; });
    }
  }
  function montar(c) {
    c.addEventListener('input', function (e) {
      var t = e.target;
      if (t.dataset.l) { var v = t.value; if (t.dataset.l === 'maxPersonas') v = v ? Math.max(1, Math.min(20, parseInt(v, 10) || 0)) : ''; put(LB(), t.dataset.l, v); prev(); }
      else if (t.dataset.k) {
        if (t.dataset.k === 'musicaUrl' && /youtu\.?be/i.test(t.value)) { t.style.borderColor = '#c0392b'; return; }
        t.style.borderColor = ''; compartido(t.dataset.k, t.value);
      }
    });
    c.addEventListener('change', function (e) {
      var t = e.target;
      if (t.type === 'file') { var f = t.files && t.files[0]; if (f) archivo(t, f); t.value = ''; return; }
      if (t.id === 'libro-on') {
        var d = DD(); if (!d) return;
        if (t.checked && String(d.estado || '') === 'entregada' &&
          !confirm('Esta invitación ya está ENTREGADA.\n\nSi la pasás a Libro, el link que tienen los novios y sus invitados va a mostrar el libro en vez de la invitación de siempre.\n\n¿Seguro?')) { t.checked = false; return; }
        var L = LB(); L.on = t.checked;
        if (t.checked && !(Array.isArray(L.caps) && L.caps.length)) L.caps = [{}, {}, {}];
        prev(); pintar(); vista();
      } else if (t.dataset.lc) { put(LB(), t.dataset.lc, !!t.checked); prev(); }
      else if (t.tagName === 'SELECT' && t.dataset.l) { put(LB(), t.dataset.l, t.value); prev(); }
    });
    c.addEventListener('focusin', function (e) { var s = e.target.closest('[data-ir]'); if (s) ir(s.getAttribute('data-ir')); });
    c.addEventListener('click', function (e) {
      var b = e.target.closest('button,a'); if (!b || !c.contains(b)) return;
      var L = LB();
      if (b.dataset.subir) { e.preventDefault(); var fi = c.querySelector('[data-archivo="' + b.dataset.subir + '"]'); if (fi) fi.click(); } else if (b.dataset.quitar) { e.preventDefault(); put(L, b.dataset.quitar + '.foto', ''); put(L, b.dataset.quitar + '.prof', ''); prev(); pintar(); }
      else if (b.dataset['3d']) { e.preventDefault(); calcular3d(b.dataset['3d']); }
      else if (b.dataset.fondo) {
        e.preventDefault(); var ff = c.querySelector('[data-archivo-fondo="' + b.dataset.fondo + '"]'); if (ff) ff.click();
      } else if (b.dataset.fabrica) { e.preventDefault(); L[b.dataset.fabrica] = ''; prev(); pintar(); }
      else if (b.id === 'libro-cap-mas') { L.caps = Array.isArray(L.caps) ? L.caps : []; if (L.caps.length < 8) L.caps.push({}); prev(); pintar(); }
      else if (b.dataset.borrar != null && b.dataset.borrar !== undefined && b.hasAttribute('data-borrar')) {
        var i = +b.dataset.borrar; if (L.caps.length <= 3) return;
        if (!confirm('¿Sacar el capítulo ' + (ORD[i] || i + 1) + '?')) return; L.caps.splice(i, 1); prev(); pintar();
      } else if (b.dataset.mover) {
        var m = b.dataset.mover.split(',').map(Number), j = m[0] + m[1];
        if (j < 0 || j >= L.caps.length) return; var x = L.caps[m[0]]; L.caps[m[0]] = L.caps[j]; L.caps[j] = x; prev(); pintar(); ir('cap' + (j + 1));
      } else if (b.id === 'libro-mp3') { var fm = c.querySelector('#libro-mp3-in'); if (fm) fm.click(); }
    });
  }

  /* la miniatura: /libro/ si es un libro, /i/ si no */
  function vista() {
    var fr = document.getElementById('pv-frame'), d = DD(); if (!fr || !d) return;
    var on = !!(d.fx && d.fx.libro && d.fx.libro.on), es = /\/libro\//.test(fr.src);
    if (on && !es) fr.src = '/libro/?preview=1';
    else if (!on && es) { var v = d.ver || (typeof VERSION !== 'undefined' ? VERSION : ''); fr.src = 'i/?preview=1' + (v ? '&ver=' + encodeURIComponent(v) : ''); }
  }

  function revisar() {
    var d = DD(); if (!d) return;
    vista();
    var slug = String(d.slug || '');
    if (caja && document.body.contains(caja)) { if (slug !== slugCaja) { slugCaja = slug; pintar(); } return; }
    var casa = window.invCasa ? window.invCasa(ID) : null; if (!casa) { caja = null; return; }
    caja = document.createElement('div'); caja.id = ID; slugCaja = slug;
    caja.innerHTML = html(); montar(caja); casa.appendChild(caja);
  }
  var n = 0, t = setInterval(function () { if (DD()) { clearInterval(t); setInterval(revisar, 700); revisar(); } if (++n > 120) clearInterval(t); }, 500);
})();
