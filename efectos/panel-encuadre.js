/* ===== ENCUADRE DE LA PORTADA Y DE LA MINIATURA: ARRIBA · CENTRO · ABAJO =====
   Jazmín (11/11/2026): «Que en la portada se pueda mover la imagen. Que se pueda
   centrar, subir o bajar. Que se aplique para todas las miniaturas y las
   portadas» · «en la miniatura se pueda centrar, subir o bajar la foto».

   PORTADA: además de arrastrar la foto y del zoom, tres botones que ponen la
     foto arriba / al centro / abajo (cy = 0 / 50 / 100), y dos más para correrla
     de a poco (±10).
   MINIATURA AL COMPARTIR (1200 × 630): la foto se recorta en Cloudinary; los
     botones cambian por dónde se recorta (g_north / g_center / g_south) y la
     URL guardada queda ya recortada, así WhatsApp muestra lo que se eligió.
   Sólo vive en el panel.
   ============================================================================ */
(function () {
  'use strict';
  if (!/admin/.test(location.pathname) || window.__invEncuadre) return;
  window.__invEncuadre = 1;

  var BTN = 'padding:5px 10px;font-size:12px;border-radius:8px;border:1px solid #d4c3b6;background:#fff;cursor:pointer';
  function D_() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function fila(titulo, botones) {
    var f = document.createElement('div');
    f.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px;font-size:12px;font-weight:600';
    var s = document.createElement('span'); s.textContent = titulo; f.appendChild(s);
    botones.forEach(function (b) {
      var x = document.createElement('button'); x.type = 'button'; x.textContent = b[0]; x.style.cssText = BTN;
      x.onclick = function (e) { e.preventDefault(); b[1](); }; f.appendChild(x);
    });
    return f;
  }

  /* ---- portada ---- */
  function ponerCy(v) {
    var d = D_(); if (!d) return;
    v = Math.max(0, Math.min(100, Math.round(v)));
    if (typeof setB === 'function') { setB('cx', d.cx == null ? 50 : d.cx); setB('cy', v); }
    else { d.cy = v; if (typeof postPreview === 'function') postPreview(); }
  }
  function portada() {
    var z = document.querySelector('.zoomrow');
    if (!z || z.parentNode.querySelector('[data-encuadre="portada"]')) return;
    var f = fila('Encuadre de la portada:', [
      ['⬆ Arriba', function () { ponerCy(0); }],
      ['Centro', function () { ponerCy(50); }],
      ['⬇ Abajo', function () { ponerCy(100); }],
      ['Subir un poco', function () { var d = D_(); ponerCy((d && d.cy != null ? +d.cy : 50) - 10); }],
      ['Bajar un poco', function () { var d = D_(); ponerCy((d && d.cy != null ? +d.cy : 50) + 10); }]
    ]);
    f.setAttribute('data-encuadre', 'portada');
    z.parentNode.insertBefore(f, z.nextSibling);
  }

  /* ---- miniatura ---- */
  var CLAVES = ['img_c_imagen-miniatura-al-compartir', 'img_c_im-gen-miniatura-al-compartir', 'img_f-im-gen-miniatura-al-compartir', 'img_f-imagen-miniatura-al-compartir'];
  function encuadrar(url, g) {
    if (!/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) return '';
    url = url.replace(/\/image\/upload\/c_fill,(?:w_1200,h_630,g_[a-z_]+|g_[a-z_]+,w_1200,h_630)\//, '/image/upload/');
    return url.replace('/image/upload/', '/image/upload/c_fill,w_1200,h_630,g_' + g + '/');
  }
  function miniatura() {
    var d = D_(); if (!d) return;
    document.querySelectorAll('button').forEach(function (b) {
      var oc = b.getAttribute('onclick') || '';
      var m = oc.match(/usarImgDe\('([^']*miniatura-al-compartir[^']*)','([^']+)','portada'\)/);
      if (!m) return;
      var fil = b.parentNode;
      if (!fil || fil.parentNode.querySelector('[data-encuadre="mini"]')) return;
      var key = m[1], id = m[2];
      var poner = function (g) {
        var dd = D_(); var u = dd && (dd[key] || CLAVES.map(function (k) { return dd[k]; }).filter(Boolean)[0]);
        if (!u) { alert('Primero subí la foto de la miniatura (o tocá «Usar la portada»).'); return; }
        var n = encuadrar(u, g);
        if (!n) { alert('Esta foto no está en Cloudinary: subila con «Subir imagen» para poder encuadrarla.'); return; }
        dd[key] = n;
        var prev = document.getElementById('prev-' + id);
        if (prev && typeof fotoCargadaHtml === 'function') { try { prev.innerHTML = fotoCargadaHtml(n, key, id); } catch (e) {} }
        else if (prev) { var im = prev.querySelector('img'); if (im) im.src = n; }
        if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
        if (typeof marcarCambios === 'function') { try { marcarCambios(); } catch (e) {} }
      };
      var f = fila('Encuadre de la miniatura:', [
        ['⬆ Arriba', function () { poner('north'); }],
        ['Centro', function () { poner('center'); }],
        ['⬇ Abajo', function () { poner('south'); }],
        ['Automático (caras)', function () { poner('faces'); }]
      ]);
      f.setAttribute('data-encuadre', 'mini');
      fil.parentNode.insertBefore(f, fil.nextSibling);
    });
  }

  setInterval(function () { try { portada(); miniatura(); } catch (e) {} }, 900);
  window.INVENCUADRE = { encuadrar: encuadrar };
})();
