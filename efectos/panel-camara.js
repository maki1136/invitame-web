/* ===== LA CAMARITA — su bloque en el panel (4/11/2026) =======================
   Pestaña EFECTOS, junto a la Misión secreta. Prende fx.camara.on y deja
   cambiar la foto que se revela, la cámara y el texto. Lo que hace en la
   invitación: efectos/camara-instantanea.js. Se vende aparte (paquetes.js).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'camara-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  function avisar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function C(d) { d.fx = d.fx || {}; if (!d.fx.camara || typeof d.fx.camara !== 'object') d.fx.camara = {}; return d.fx.camara; }

  function construir(d) {
    var c = (d.fx && d.fx.camara) || {};
    var caja = el('div', 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)'); caja.id = ID;
    caja.appendChild(el('div', 'font-size:14px;font-weight:700;color:#6D1233;margin-bottom:2px', '📸 La camarita (imprime el pase)'));
    caja.appendChild(el('div', 'font-size:12px;opacity:.65;margin-bottom:10px;line-height:1.35',
      'Al abrir el sobre aparece una cámara instantánea: el invitado toca «Tomar la foto», sale la foto, se revela y abajo, escrito a mano, dice su nombre, sus lugares y su mesa. Con el link general dice los nombres y la fecha. Se vende aparte, como especial.'));
    var on = el('label', 'display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:8px');
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = c.on === true || c.on === 'true';
    on.appendChild(cb); on.appendChild(document.createTextNode('Prender la camarita en esta invitación'));
    caja.appendChild(on);
    var det = el('div', 'display:' + (cb.checked ? 'block' : 'none') + ';font-size:12.5px');
    cb.onchange = function () { C(d).on = cb.checked; det.style.display = cb.checked ? 'block' : 'none'; avisar(); };
    caja.appendChild(det);
    function campo(lab, key, ph, ayuda) {
      det.appendChild(el('div', 'font-weight:600;margin:8px 0 3px', lab));
      var i = document.createElement('input'); i.type = 'text'; i.placeholder = ph; i.value = c[key] || ''; i.style.cssText = 'width:100%';
      i.oninput = function () { C(d)[key] = i.value.trim(); avisar(); };
      det.appendChild(i);
      if (ayuda) det.appendChild(el('div', 'font-size:11.5px;opacity:.6;margin-top:2px', ayuda));
    }
    campo('Texto de arriba', 'titulo', 'Tienes un recuerdo por revelar');
    campo('Foto que se revela (link)', 'foto', 'Vacío = la primera foto de la galería');
    campo('Imagen de la cámara (link)', 'camara', 'Vacío = la cámara azul de Invítame', 'Una cámara fotografiada de frente sobre fondo BLANCO (se funde con el fondo).');
    det.appendChild(el('div', 'font-size:11.5px;opacity:.6;margin-top:8px', 'En la vista previa del panel no aparece: se prueba abriendo el link.'));
    return caja;
  }
  function revisar() {
    var d = borrador(); if (!d) return;
    if (document.getElementById(ID)) return;
    var a = window.invCasa ? window.invCasa(ID) : null;
    if (!a) return;
    a.appendChild(construir(d));
  }
  if (/\/i\//.test(location.pathname)) return;
  var n = 0, t = setInterval(function () {
    if (borrador()) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    else if (++n > 200) clearInterval(t);
  }, 300);
})();
