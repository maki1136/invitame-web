/* ===== EL REGALO DE «MESA DE REGALOS», EN EL PANEL ★ 3/10/2026 ===================
   Pestaña REGALOS. Tres caminos, uno solo a la vez:
     1. un DIBUJO de trazo a mano (10), con su color → `fx.regalo.{dibujo,color}`
     2. una FOTO de la biblioteca (los 51 regalos de las muestras) → el campo de
        siempre `img_c_imagen-decorativa-sobre-o-regalo`
     3. el que trae Jazmín de afuera → se sube en ese mismo campo, «Imagen decorativa
        (sobre o regalo)», más abajo en esta pestaña (no se repite el control acá).
   Elegir un dibujo apaga la foto en la invitación (sin borrarla); elegir una foto
   saca el dibujo. El catálogo es /efectos/regalos-catalogo.js.

   ⚠️ `D` no cuelga de window y se reemplaza al cargar el evento: `datos()` se llama
      adentro de cada handler, nunca se guarda la referencia (ver panel-dresscode.js).
   ============================================================================ */
(function () {
  var ID = 'regalo-selector';
  var CAMPO = 'img_c_imagen-decorativa-sobre-o-regalo';

  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function datos() {
    var d = borrador(); if (!d) return null;
    if (!d.fx) d.fx = {};
    if (!d.fx.regalo) d.fx.regalo = {};
    return d.fx.regalo;
  }
  function cat() { return window.INVREGALOS || { dibujos: [], fotos: [] }; }
  function el(tag, css, txt) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (txt) e.textContent = txt; return e; }

  function construir() {
    var caja = el('div', 'margin:0 0 6px');
    caja.id = ID;
    var h = el('div'); h.className = 'h'; h.textContent = 'El regalo arriba del título';
    caja.appendChild(h);
    caja.appendChild(el('div', 'font-size:12.5px;color:#7a6a70;margin:4px 0 12px',
      'Elegí un dibujo (le cambiás el color) o una de las fotos. Si la clienta trae el suyo, subilo en «Imagen decorativa (sobre o regalo)», más abajo.'));

    /* ---- dibujos ---- */
    caja.appendChild(el('label', 'display:block;font-weight:700;margin:4px 0 6px', 'Dibujados'));
    var gd = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px');
    caja.appendChild(gd);
    var fila = el('div', 'display:flex;align-items:center;gap:10px;margin:10px 0 16px');
    var lab = el('label', 'font-weight:700;margin:0', 'Color del dibujo');
    var col = el('input'); col.type = 'color'; col.style.cssText = 'width:46px;height:32px;padding:0;border:0;background:none;cursor:pointer';
    var auto = el('button', 'cursor:pointer;padding:4px 10px;font-size:12px', 'Color del título');
    auto.type = 'button';
    fila.appendChild(lab); fila.appendChild(col); fila.appendChild(auto);
    caja.appendChild(fila);

    /* ---- fotos ---- */
    caja.appendChild(el('label', 'display:block;font-weight:700;margin:4px 0 6px', 'Fotografiados'));
    var gf = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px;max-height:300px;overflow:auto;padding:2px');
    caja.appendChild(gf);
    var nada = el('button', 'cursor:pointer;padding:6px 12px;font-size:12px;margin-top:12px', 'Sin regalo');
    nada.type = 'button';
    caja.appendChild(nada);

    function tile(grid, item, esDibujo) {
      var b = el('button', 'position:relative;aspect-ratio:1;border:1px solid #e3d6da;border-radius:12px;background:#faf7f5;cursor:pointer;padding:6px;display:flex;align-items:center;justify-content:center');
      b.type = 'button'; b.title = item.nombre;
      if (esDibujo) {
        var m = el('span', 'display:block;width:100%;height:100%;-webkit-mask:url("' + item.url + '") center/contain no-repeat;mask:url("' + item.url + '") center/contain no-repeat;background:#4a3a40');
        m.className = 'rg-tinta';
        b.appendChild(m);
      } else {
        var im = el('img', 'max-width:100%;max-height:100%;display:block');
        im.src = item.url.replace('/upload/', '/upload/w_140,c_limit/'); im.alt = item.nombre; im.loading = 'lazy';
        b.appendChild(im);
      }
      b.onclick = function () {
        var r = datos(), d = borrador(); if (!r || !d) return;
        if (esDibujo) { r.dibujo = item.id; }
        else { r.dibujo = ''; d[CAMPO] = item.url; }
        pintar(); refrescar();
      };
      b.dataset.id = item.id; b.dataset.tipo = esDibujo ? 'd' : 'f';
      grid.appendChild(b);
    }
    cat().dibujos.forEach(function (x) { tile(gd, x, true); });
    cat().fotos.forEach(function (x) { tile(gf, x, false); });

    col.oninput = function () { var r = datos(); if (!r) return; r.color = col.value; pintar(); refrescar(); };
    auto.onclick = function () { var r = datos(); if (!r) return; r.color = ''; pintar(); refrescar(); };
    nada.onclick = function () {
      var r = datos(), d = borrador(); if (!r || !d) return;
      r.dibujo = ''; d[CAMPO] = '';   /* vacío, no delete: el guardado es con merge */
      pintar(); refrescar();
    };

    function pintar() {
      var r = datos() || {}, d = borrador() || {};
      var foto = String(d[CAMPO] || '');
      var tinta = r.color || '#4a3a40';
      col.value = /^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color : '#4a3a40';
      [].forEach.call(caja.querySelectorAll('button[data-id]'), function (b) {
        var on = b.dataset.tipo === 'd' ? (r.dibujo === b.dataset.id)
                                        : (!r.dibujo && foto && foto.indexOf(b.dataset.id + '-regalo') >= 0);
        b.style.outline = on ? '2px solid #6d1233' : 'none';
        b.style.outlineOffset = '2px';
        var t = b.querySelector('.rg-tinta'); if (t) t.style.background = tinta;
      });
    }
    caja.pintar = pintar;
    pintar();
    return caja;
  }

  function revisar() {
    if (!borrador()) return;
    var m = window.invCasa ? window.invCasa(ID) : null;
    if (!m) return;
    var caja = document.getElementById(ID);
    if (caja && caja.parentNode === m) { if (caja.pintar) caja.pintar(); return; }
    if (caja) caja.remove();
    m.insertBefore(construir(), m.firstChild);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador()) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
