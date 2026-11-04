/* ===== LA CAMARITA — sus bloques en el panel (4/11/2026) =====================
   1) EFECTOS → «📸 La camarita»: prenderla, ELEGIR LA CÁMARA (11 modelos, con
      su foto), el fondo, el texto, la foto de los novios y la de ejemplo.
   2) INVITADOS → «Fotos para la camarita»: una foto por invitado (Maki, 4/11:
      «prefiero que suban al panel una foto personalizada»). Se guarda en
      fx.camara.fotos[token] y se revela en SU pase. Sin foto, la de los novios.
   Lo que hace en la invitación: efectos/camara-instantanea.js (que también
   define window.INVCAMARAS, la lista de cámaras). Se vende aparte (paquetes.js).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'camara-selector', ID_F = 'camarafotos-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  function avisar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function C(d) { d.fx = d.fx || {}; if (!d.fx.camara || typeof d.fx.camara !== 'object') d.fx.camara = {}; return d.fx.camara; }
  function prendida(d) { var c = (d.fx && d.fx.camara) || {}; return c.on === true || c.on === 'true'; }
  function subir(file, cb, estado) {
    if (!window.INV || !INV.uploadImage) { alert('Todavía no se conectó la base. Probá en 2 segundos.'); return; }
    estado.textContent = 'Subiendo…';
    INV.uploadImage(file).then(function (u) { estado.textContent = '¡Listo! Acordate de «Guardar y publicar».'; cb(u); })
      .catch(function (e) { estado.textContent = 'No se pudo subir: ' + (e.message || e); });
  }
  function botonSubir(texto, cb) {
    var w = el('span', 'display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap');
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    var b = el('button', 'border:0;border-radius:16px;padding:6px 12px;font-weight:700;cursor:pointer;background:#efe7de;color:#49111A;font-size:12px', texto); b.type = 'button';
    var est = el('span', 'font-size:11px;opacity:.7');
    b.onclick = function () { inp.click(); };
    inp.onchange = function () { if (inp.files && inp.files[0]) subir(inp.files[0], cb, est); inp.value = ''; };
    w.appendChild(b); w.appendChild(inp); w.appendChild(est);
    return w;
  }

  /* ---------------- 1) EFECTOS ---------------- */
  function construir(d) {
    var c = (d.fx && d.fx.camara) || {};
    var caja = el('div', 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)'); caja.id = ID;
    caja.appendChild(el('div', 'font-size:14px;font-weight:700;color:#6D1233;margin-bottom:2px', '📸 La camarita (imprime el pase)'));
    caja.appendChild(el('div', 'font-size:12px;opacity:.65;margin-bottom:10px;line-height:1.35',
      'Al abrir el sobre aparece una cámara instantánea: el invitado toca «Tomar la foto», sale la foto, se revela y abajo, escrito a mano, dice su nombre, sus lugares y su mesa. Si el invitado tiene foto propia (pestaña INVITADOS), se revela la suya. Se vende aparte, como especial.'));
    var on = el('label', 'display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:8px');
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = prendida(d);
    on.appendChild(cb); on.appendChild(document.createTextNode('Prender la camarita en esta invitación'));
    caja.appendChild(on);
    var det = el('div', 'display:' + (cb.checked ? 'block' : 'none') + ';font-size:12.5px');
    cb.onchange = function () { C(d).on = cb.checked; det.style.display = cb.checked ? 'block' : 'none'; avisar(); };
    caja.appendChild(det);

    /* la cámara: grilla con las fotos */
    det.appendChild(el('div', 'font-weight:600;margin:6px 0 6px', 'La cámara'));
    var grid = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px');
    var lista = window.INVCAMARAS || [];
    var actual = c.modelo || 'azul';
    lista.forEach(function (m) {
      var it = el('button', 'border:2px solid ' + (m.id === actual ? '#6D1233' : 'transparent') + ';border-radius:12px;padding:6px 4px;background:#faf7f3;cursor:pointer;font-size:10.5px;line-height:1.2;color:#49111A');
      it.type = 'button';
      var im = el('img', 'width:100%;height:62px;object-fit:contain;display:block;margin-bottom:4px'); im.src = m.mini; im.alt = '';
      it.appendChild(im); it.appendChild(document.createTextNode(m.nombre));
      it.onclick = function () {
        C(d).modelo = m.id; C(d).camara = '';
        [].forEach.call(grid.children, function (x) { x.style.borderColor = 'transparent'; });
        it.style.borderColor = '#6D1233'; avisar();
      };
      grid.appendChild(it);
    });
    det.appendChild(grid);

    /* el fondo */
    det.appendChild(el('div', 'font-weight:600;margin:12px 0 3px', 'Fondo de la cámara'));
    var sel = document.createElement('select'); sel.style.cssText = 'width:100%';
    [['invitacion', 'El fondo de la invitación (su video o su foto), con luces'], ['liso', 'Liso, color papel']].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; sel.appendChild(op); });
    sel.value = c.fondo === 'liso' ? 'liso' : 'invitacion';
    sel.onchange = function () { C(d).fondo = sel.value; avisar(); };
    det.appendChild(sel);

    function campo(lab, key, ph, ayuda, conSubir) {
      det.appendChild(el('div', 'font-weight:600;margin:10px 0 3px', lab));
      var i = document.createElement('input'); i.type = 'text'; i.placeholder = ph; i.value = c[key] || ''; i.style.cssText = 'width:100%';
      i.oninput = function () { C(d)[key] = i.value.trim(); avisar(); };
      det.appendChild(i);
      if (conSubir) det.appendChild(botonSubir('Subir foto', function (u) { i.value = u; C(d)[key] = u; avisar(); }));
      if (ayuda) det.appendChild(el('div', 'font-size:11.5px;opacity:.6;margin-top:2px', ayuda));
    }
    campo('Texto de arriba', 'titulo', 'Tienes un recuerdo por revelar');
    campo('Foto de los novios que se revela (si el invitado no tiene la suya)', 'foto', 'Vacío = la primera foto de la galería', '', true);
    campo('Foto de ejemplo para la MUESTRA', 'fotoMuestra', 'Sólo en muestras: la del invitado de ejemplo', 'En una muestra no hay invitado: esta foto hace de «foto del invitado».', true);
    det.appendChild(el('div', 'font-size:11.5px;opacity:.6;margin-top:10px', 'Las fotos de cada invitado se cargan en la pestaña INVITADOS. En la vista previa del panel la cámara no aparece: se prueba abriendo el link.'));
    return caja;
  }

  /* ---------------- 2) INVITADOS ---------------- */
  function construirFotos(d) {
    var caja = el('div', 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)'); caja.id = ID_F;
    caja.appendChild(el('div', 'font-size:14px;font-weight:700;color:#6D1233;margin-bottom:2px', '📸 Fotos para la camarita'));
    caja.appendChild(el('div', 'font-size:12px;opacity:.65;margin-bottom:10px;line-height:1.35',
      'La foto que le sale a cada invitado al abrir su invitación. Sin foto, le sale la de los novios. Mejor una foto donde se vean las caras.'));
    var lista = el('div', 'display:flex;flex-direction:column;gap:6px');
    var fotos = (C(d).fotos = C(d).fotos || {});
    (d.invitados || []).forEach(function (g) {
      var fila = el('div', 'display:flex;gap:10px;align-items:center;font-size:12.5px;padding:4px 0;border-bottom:1px dashed rgba(0,0,0,.08)');
      var mini = el('div', 'width:40px;height:40px;border-radius:8px;flex:none;background:#efe7de center/cover no-repeat');
      var pinta = function () { var u = g.t && fotos[g.t]; mini.style.backgroundImage = u ? 'url("' + u.replace('/image/upload/', '/image/upload/c_fill,g_faces,w_80,h_80/') + '")' : 'none'; };
      pinta();
      fila.appendChild(mini);
      fila.appendChild(el('b', 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', g.n || '(sin nombre)'));
      if (!g.t) { fila.appendChild(el('span', 'font-size:11px;opacity:.6', 'Guardá y publicá para poder subirle foto')); }
      else {
        fila.appendChild(botonSubir(fotos[g.t] ? 'Cambiar' : 'Subir foto', function (u) { fotos[g.t] = u; pinta(); avisar(); }));
        var x = el('button', 'border:0;background:none;cursor:pointer;font-size:11px;color:#8a2b2b;text-decoration:underline', 'sacar'); x.type = 'button';
        x.onclick = function () { delete fotos[g.t]; pinta(); avisar(); };
        fila.appendChild(x);
      }
      lista.appendChild(fila);
    });
    if (!(d.invitados || []).length) lista.appendChild(el('div', 'font-size:12px;opacity:.6', 'Todavía no hay invitados cargados.'));
    caja.appendChild(lista);
    return caja;
  }

  var ultimaLista = '';
  function revisar() {
    var d = borrador(); if (!d) return;
    if (!document.getElementById(ID)) { var a = window.invCasa ? window.invCasa(ID) : null; if (a) a.appendChild(construir(d)); }
    var firma = prendida(d) ? (d.invitados || []).map(function (g) { return g.t + g.n; }).join('|') : '';
    var f = document.getElementById(ID_F);
    if (!prendida(d)) { if (f) f.remove(); ultimaLista = ''; return; }
    if (f && firma === ultimaLista) return;
    var b = window.invCasa ? window.invCasa(ID_F) : null;
    if (!b) return;
    if (f) f.remove();
    b.appendChild(construirFotos(d)); ultimaLista = firma;
  }
  if (/\/i\//.test(location.pathname)) return;
  var n = 0, t = setInterval(function () {
    if (borrador()) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    else if (++n > 200) clearInterval(t);
  }, 300);
})();
