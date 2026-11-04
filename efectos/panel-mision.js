/* ===== MISIÓN SECRETA — su bloque en el panel (3/11/2026) =====================
   Pestaña EFECTOS. Prende la misión (fx.mision.on) y deja cambiar lo que el
   invitado tiene que adivinar. Todo tiene un valor solo: si no se toca nada,
   la caja fuerte se abre con el día y el mes de la fiesta y el criptex con el
   nombre de quien festeja. Lo que hace en la invitación: efectos/mision.js.
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'mision-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  function avisar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function M(d) { d.fx = d.fx || {}; if (!d.fx.mision || typeof d.fx.mision !== 'object') d.fx.mision = {}; return d.fx.mision; }

  function construir(d) {
    var m = (d.fx && d.fx.mision) || {};
    var caja = el('div', 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)'); caja.id = ID;
    caja.appendChild(el('div', 'font-size:14px;font-weight:700;color:#6D1233;margin-bottom:2px', '🕵️ Misión secreta'));
    caja.appendChild(el('div', 'font-size:12px;opacity:.65;margin-bottom:10px;line-height:1.35',
      'La invitación se juega: el invitado se identifica con la huella, elige jugar o verla directo, y abre Dónde y cuándo con una caja fuerte, la Mesa de regalos con un criptex y la galería armando una foto. Nunca queda trabado: a los 3 intentos aparece «Abrir igual». Si no completás nada, usa la fecha y el nombre.'));

    var on = el('label', 'display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:8px');
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = m.on === true || m.on === 'true';
    on.appendChild(cb); on.appendChild(document.createTextNode('Prender la misión en esta invitación'));
    caja.appendChild(on);

    var det = el('div', 'display:' + (cb.checked ? 'block' : 'none') + ';font-size:12.5px');
    cb.onchange = function () { M(d).on = cb.checked; det.style.display = cb.checked ? 'block' : 'none'; avisar(); };
    caja.appendChild(det);

    function campo(lab, key, ph, ayuda) {
      det.appendChild(el('div', 'font-weight:600;margin:8px 0 3px', lab));
      var i = document.createElement('input'); i.type = 'text'; i.placeholder = ph; i.value = m[key] || ''; i.style.cssText = 'width:100%';
      i.oninput = function () { M(d)[key] = i.value.trim(); avisar(); };
      det.appendChild(i);
      if (ayuda) det.appendChild(el('div', 'font-size:11.5px;opacity:.6;margin-top:2px', ayuda));
    }
    campo('Código de la caja fuerte (4 números)', 'codigo', 'Vacío = día y mes de la fiesta (DDMM)', 'Ej.: 2811 para el 28 de noviembre.');
    campo('Pista de la caja fuerte', 'pistaCaja', 'El día y el mes de la gran noche (DD MM).');
    campo('Palabra del criptex (3 a 8 letras)', 'palabra', 'Vacío = el nombre de quien festeja', 'Sin acentos ni espacios. Ej.: MARTINA, PARIS, AMOR.');
    campo('Pista del criptex', 'pistaCriptex', 'Vacío = «El nombre de la quinceañera / de la novia».');
    campo('Foto para armar (link)', 'foto', 'Vacío = la foto de portada');

    det.appendChild(el('div', 'font-weight:600;margin:10px 0 4px', 'Desafíos'));
    var fila = el('div', 'display:flex;gap:14px;flex-wrap:wrap');
    [['caja', 'Caja fuerte (Dónde y cuándo)'], ['criptex', 'Criptex (Regalos)'], ['foto', 'Foto partida (Galería)']].forEach(function (x) {
      var l = el('label', 'display:flex;gap:6px;align-items:center;cursor:pointer');
      var c = document.createElement('input'); c.type = 'checkbox';
      c.checked = !(Array.isArray(m.sin) && m.sin.indexOf(x[0]) >= 0);
      c.onchange = function () {
        var mm = M(d), s = (Array.isArray(mm.sin) ? mm.sin : []).filter(function (k) { return k !== x[0]; });
        if (!c.checked) s.push(x[0]);
        mm.sin = s; avisar();
      };
      l.appendChild(c); l.appendChild(document.createTextNode(x[1])); fila.appendChild(l);
    });
    det.appendChild(fila);
    det.appendChild(el('div', 'font-size:11.5px;opacity:.6;margin-top:8px', 'En la vista previa del panel no aparece (taparía todo): se prueba abriendo el link.'));
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
