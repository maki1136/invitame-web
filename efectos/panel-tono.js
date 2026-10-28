/* ===== EL TONO DE LA COLECCIÓN, EN EL PANEL (28/10/2026) ======================
   Jazmín: una novia quiere Marfil «con azul cielo, azul petróleo y dorado».
   Algunas colecciones traen sus colores propios y la paleta no las cambia; para
   esas, la colección ofrece TONOS: la misma pieza con otra tinta, papel y metal.
   Lo dibuja cada colección (hoy: colecciones/marfil.js, TONOS).

   EL DATO — fx.tono: '' (el de la colección) | 'azul' | …
   Panel: PRINCIPAL → bloque del diseño → «Tono de la colección». Sólo aparece
   cuando la colección elegida tiene tonos.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPanelTono) return; window.__invPanelTono = 1;

  var TONOS = {
    marfil: [['', 'Marfil (el de siempre)'], ['azul', 'Azul cielo, azul petróleo y dorado']]
  };
  window.INVTONOS = TONOS;

  var ID = 'tono-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function col(d) { return String(((d && d.fx) || {}).coleccion || ''); }

  function construir(d) {
    var caja = document.createElement('div'); caja.id = ID;
    var g = document.createElement('div'); g.className = 'grp';
    var l = document.createElement('label'); l.textContent = 'Tono de la colección'; g.appendChild(l);
    var s = document.createElement('select'); g.appendChild(s);
    var h = document.createElement('div'); h.className = 'hint';
    h.textContent = 'La misma colección en otros colores (la tinta, el papel y el metal).';
    g.appendChild(h); caja.appendChild(g);
    caja.__pintar = function () {
      var dd = borrador() || d, ops = TONOS[col(dd)] || [];
      caja.style.display = ops.length ? '' : 'none';
      s.innerHTML = '';
      ops.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
      s.value = String((dd.fx || {}).tono || '');
      caja.__col = col(dd);
    };
    s.onchange = function () { var dd = borrador() || d; dd.fx = dd.fx || {}; dd.fx.tono = s.value; refrescar(); };
    caja.__pintar();
    return caja;
  }
  function firmaD(d) { return String(d.slug || '') + '|' + String(((d.fx || {}).coleccion) || '') + '|' + String(d.tpl || ''); }
  function revisarPanel() {
    var d = borrador(); if (!d) return;
    var ya = document.getElementById(ID);
    if (ya && ya.__d === firmaD(d)) { if (ya.__col !== col(d)) ya.__pintar(); return; }
    if (ya) ya.remove();   /* D cambió (cargó el evento): se rearma con el de verdad */
    var a = window.invCasa ? window.invCasa(ID) : null;
    if (!a) return;
    var caja = construir(d); caja.__d = firmaD(d);
    a.appendChild(caja);
  }
  var n = 0, t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisarPanel, 700); revisarPanel(); }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
