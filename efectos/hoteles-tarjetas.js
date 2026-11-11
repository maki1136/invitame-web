/* ===== HOSPEDAJE · CADA HOTEL CON SU TARJETA EDITABLE (11/11/2026) ===========
   Jazmín (xv-julieta): «en donde dice el nombre del hotel poder agregar más
   descripción y tener un sector aparte para colocar el link y cambiar el texto
   del botón. Que se pueda activar o desactivar dependiendo de si hay o no link,
   porque hay mucha gente que no coloca links, sólo info, y queda el botón ahí
   pero no es necesario».

   DATO: fx.hoteles.lista = [{ nombre, desc, link, boton, sinBoton }]
     · desc: varios renglones (se respetan los Enter).
     · el botón sale SÓLO si hay link y no está apagado; su texto es `boton`
       (vacío = «Reservar»).
   PANEL: debajo de «Datos de hoteles recomendados» (pestaña LUGAR_VEST) aparece
     «Hoteles, uno por tarjeta». La primera vez trae lo que ya estaba cargado en
     ese campo. Al editar, ese campo viejo se escribe solo (un renglón por hotel)
     para que el motor siga mostrando la sección.
   INVITACIÓN: si hay lista, dibuja las tarjetas (pisa al motor y a
     hoteles-bloques.js). Sin lista no cambia nada.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invHotelesTarjetas) return; window.__invHotelesTarjetas = 1;
  var EN_INV = /\/i\//.test(location.pathname);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lista(ev) {
    var h = ev && ev.fx && ev.fx.hoteles;
    var l = h && Object.prototype.toString.call(h.lista) === '[object Array]' ? h.lista : null;
    return l && l.length ? l : null;
  }
  function urlOk(u) {
    u = String(u || '').trim(); if (!u) return '';
    if (/^www\./i.test(u)) u = 'https://' + u;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) u = 'mailto:' + u;
    if (/^\+?[\d\s().-]{7,}$/.test(u)) u = 'tel:' + u.replace(/[^\d+]/g, '');
    return /^(https?:|mailto:|tel:)/i.test(u) ? u : '';
  }

  /* ---------------- en la invitación ---------------- */
  if (EN_INV) {
    var st = document.createElement('style');
    st.textContent = '#hosp-lista[data-tarjetas] .hotel .d{white-space:pre-line}';
    (document.head || document.documentElement).appendChild(st);
    var hecho = '';
    var pintar = function () {
      var ev = window.INVEV, l = lista(ev); if (!l) return;
      var cont = document.getElementById('hosp-lista'); if (!cont) return;
      var html = l.map(function (h) {
        var n = String(h.nombre || '').trim(), d = String(h.desc || '').trim();
        if (!n && !d) return '';
        var u = urlOk(h.link), b = '';
        if (u && !h.sinBoton) b = '<a class="btn" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(String(h.boton || '').trim() || 'Reservar') + '</a>';
        return '<div class="hotel">' + (n ? '<h4>' + esc(n) + '</h4>' : '') + (d ? '<div class="d">' + esc(d) + '</div>' : '') + b + '</div>';
      }).join('');
      if (cont.getAttribute('data-tarjetas') === '1' && cont.innerHTML === hecho) return;
      cont.innerHTML = html; hecho = cont.innerHTML;
      cont.setAttribute('data-tarjetas', '1'); cont.setAttribute('data-bloques', '1');
      var acc = document.getElementById('hosp-acc'); if (acc) acc.style.display = '';
      if (cont.parentNode && cont.parentNode.style) cont.parentNode.style.display = '';
    };
    window.INVHOTELES = { pintar: pintar };
    var n = 0, t = setInterval(function () { pintar(); if (++n > 50) clearInterval(t); }, 300);
    addEventListener('message', function () { setTimeout(pintar, 150); setTimeout(pintar, 700); });
    return;
  }

  /* ---------------- en el panel ---------------- */
  if (!/admin/.test(location.pathname)) return;
  var ID = 'hoteles-tarjetas-ed';
  function D_() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }

  function importar(txt) {
    txt = String(txt || '').replace(/\r/g, '').trim(); if (!txt) return [];
    if (txt.indexOf('|') >= 0) {
      return txt.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean).map(function (f) {
        var p = f.split(/\s*\|\s*/);
        return { nombre: p[0] || '', desc: p[1] || '', link: (p[2] || '').trim(), boton: '', sinBoton: false };
      });
    }
    return txt.split(/\n\s*\n+/).map(function (b) {
      var ls = b.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!ls.length) return null;
      var link = '', resto = [];
      ls.slice(1).forEach(function (l) { var m = l.match(/(https?:\/\/\S+|www\.\S+)/i); if (m && !link && !/maps/i.test(m[1])) link = m[1]; else resto.push(l); });
      return { nombre: ls[0], desc: resto.join('\n'), link: link, boton: '', sinBoton: false };
    }).filter(Boolean);
  }
  function guardar(d, l) {
    d.fx = d.fx || {};
    d.fx.hoteles = { lista: l };
    /* el campo viejo, para que el motor siga mostrando la sección */
    d['c_datos-de-hoteles-recomendados'] = l.filter(function (h) { return (h.nombre || '').trim(); })
      .map(function (h) { return String(h.nombre).replace(/[|\n]/g, ' ').trim() + ' | '; }).join('\n');
    var ta = document.getElementById('f-datos-de-hoteles-recomendados');
    if (ta) ta.value = d['c_datos-de-hoteles-recomendados'];
    refrescar();
  }

  var CSS_IN = 'width:100%;box-sizing:border-box;padding:7px 9px;border:1px solid #d8cfc4;border-radius:8px;font-size:13px;margin:2px 0 6px';
  function construir(caja) {
    var d = D_(); if (!d) return;
    var l = lista(d) || importar(d['c_datos-de-hoteles-recomendados']);
    caja.innerHTML = '';
    var h = document.createElement('div');
    h.innerHTML = '<div style="font-weight:700;margin:4px 0 2px">Hoteles, uno por tarjeta</div>' +
      '<div class="hint" style="margin-bottom:8px">Nombre, descripción (podés usar Enter), link y texto del botón. El botón aparece sólo si hay link. Esto reemplaza el campo de arriba.</div>';
    caja.appendChild(h);
    l.forEach(function (ho, i) {
      var c = document.createElement('div');
      c.style.cssText = 'border:1px solid #e2d8cc;border-radius:10px;padding:10px;margin-bottom:10px;background:rgba(0,0,0,.015)';
      function campo(rot, k, tipo, ph) {
        var lab = document.createElement('label'); lab.textContent = rot; lab.style.cssText = 'font-size:12px;font-weight:600';
        var inp = document.createElement(tipo === 'a' ? 'textarea' : 'input');
        if (tipo === 'a') inp.rows = 3; else inp.type = 'text';
        inp.style.cssText = CSS_IN; inp.placeholder = ph || ''; inp.value = ho[k] || '';
        inp.oninput = function () { ho[k] = inp.value; guardar(d, l); };
        c.appendChild(lab); c.appendChild(inp);
      }
      campo('Hotel ' + (i + 1) + ' · nombre', 'nombre', 't', 'Royalton Riviera Cancún');
      campo('Descripción (dirección, código, cómo reservar…)', 'desc', 'a', 'Dirección: …\nReservaciones: …');
      campo('Link (página, WhatsApp, mapa, correo o teléfono) — opcional', 'link', 't', 'https://…');
      campo('Texto del botón', 'boton', 't', 'Reservar');
      var fila = document.createElement('div'); fila.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap';
      var chk = document.createElement('label'); chk.style.cssText = 'display:flex;gap:6px;align-items:center;font-size:12px';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.style.width = 'auto'; cb.checked = !ho.sinBoton;
      cb.onchange = function () { ho.sinBoton = !cb.checked; guardar(d, l); };
      chk.appendChild(cb); chk.appendChild(document.createTextNode('Mostrar el botón (sólo si hay link)'));
      var del = document.createElement('button'); del.type = 'button'; del.textContent = 'Quitar este hotel';
      del.style.cssText = 'padding:5px 10px;border-radius:8px;border:1px solid #c9b8a8;background:#fff;cursor:pointer;font-size:12px';
      del.onclick = function () { l.splice(i, 1); guardar(d, l); construir(caja); };
      fila.appendChild(chk); fila.appendChild(del); c.appendChild(fila);
      caja.appendChild(c);
    });
    var add = document.createElement('button'); add.type = 'button'; add.textContent = '+ Agregar hotel';
    add.style.cssText = 'padding:7px 12px;border-radius:8px;border:1px solid #c9b8a8;background:#fff;cursor:pointer;font-size:13px';
    add.onclick = function () { l.push({ nombre: '', desc: '', link: '', boton: '', sinBoton: false }); guardar(d, l); construir(caja); };
    caja.appendChild(add);
    caja.__slug = d.slug;
  }

  function revisar() {
    var ta = document.getElementById('f-datos-de-hoteles-recomendados');
    if (!ta) return;
    var d = D_(); if (!d) return;
    var ya = document.getElementById(ID);
    if (ya && ya.__slug === d.slug && ya.previousElementSibling === ta) return;
    if (ya) ya.remove();
    var caja = document.createElement('div'); caja.id = ID; caja.style.cssText = 'margin:10px 0 16px';
    construir(caja);
    ta.parentNode.insertBefore(caja, ta.nextSibling);
    /* el campo viejo queda, en gris: lo escribe el editor */
    ta.style.opacity = '.55'; ta.readOnly = !!lista(d);
  }
  setInterval(revisar, 800);
})();
