/* ===== LA FLECHA DE LA PORTADA (28/10/2026) ===================================
   Jazmín, Gabriel y Dany: «La flecha es muy pequeña, no se ve. Un poco más
   grande o algo que se vea.»
   El motor pone en la portada un «⌄» de 22 px (.scrollcue). Este módulo lo
   cambia por un chevrón dibujado (SVG, toma el color que le da la colección)
   con tamaño y estilo elegibles desde el panel (PRINCIPAL → «La flecha de la
   portada»).

   EL DATO — fx.flecha:
     tam:    'chica' (la de antes) | 'media' (por defecto) | 'grande'
     estilo: 'simple' (por defecto) | 'circulo' (dentro de un círculo)
   Corre también en la miniatura (escucha los mensajes del panel).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invFlecha) return; window.__invFlecha = 1;

  var TAM = { chica: 22, media: 36, grande: 50 };
  var ID_CSS = 'inv-flecha-portada';
  var SVG = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>';

  function cfg(ev) { return ((ev && ev.fx) || {}).flecha || {}; }

  var ultima = null;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var c = cfg(ev);
    var tam = TAM[c.tam] ? c.tam : 'media';
    var estilo = c.estilo === 'circulo' ? 'circulo' : 'simple';
    var cue = document.querySelector('.portada .scrollcue');
    if (!cue) return;
    var firma = tam + '|' + estilo;
    if (firma === ultima && cue.getAttribute('data-flecha') === firma && document.getElementById(ID_CSS)) return;
    ultima = firma;
    if (tam === 'chica' && estilo === 'simple') {
      /* la de siempre */
      if (cue.getAttribute('data-flecha')) { cue.innerHTML = '&#8964;'; cue.removeAttribute('data-flecha'); }
      var v = document.getElementById(ID_CSS); if (v) v.remove();
      return;
    }
    cue.innerHTML = SVG; cue.setAttribute('data-flecha', firma);
    var px = TAM[tam], S = 'html body .portada .scrollcue[data-flecha]';
    var css = [S + '{width:' + px + 'px!important;height:' + px + 'px!important;font-size:0!important;line-height:0!important;bottom:' + (estilo === 'circulo' ? 14 : 10) + 'px!important;opacity:.95!important;' +
      'filter:drop-shadow(0 1px 3px rgba(0,0,0,.35))}'];
    if (estilo === 'circulo') {
      var pad = Math.round(px * 0.26);
      css.push(S + '{box-sizing:content-box!important;padding:' + pad + 'px!important;border:1.6px solid currentColor!important;border-radius:50%!important}');
      css.push(S + ' svg{transform:translateY(' + Math.round(px * 0.06) + 'px)}');
    }
    var st = document.getElementById(ID_CSS);
    if (!st) { st = document.createElement('style'); st.id = ID_CSS; document.head.appendChild(st); }
    st.textContent = css.join('\n');
  }

  /* ================= LADO PANEL ================= */
  var ID = 'flecha-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function datos(d) { d.fx = d.fx || {}; d.fx.flecha = d.fx.flecha || {}; return d.fx.flecha; }
  function select(etiqueta, opciones, valor, alCambiar) {
    var g = document.createElement('div'); g.className = 'grp';
    var l = document.createElement('label'); l.textContent = etiqueta; g.appendChild(l);
    var s = document.createElement('select');
    opciones.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
    s.value = valor; s.onchange = function () { alCambiar(s.value); refrescar(); };
    g.appendChild(s); return g;
  }
  function construir(d) {
    var caja = document.createElement('div'); caja.id = ID;
    var t = document.createElement('div'); t.textContent = 'La flecha de la portada';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:6px';
    caja.appendChild(t);
    var c = datos(d);
    var two = document.createElement('div'); two.className = 'two';
    two.appendChild(select('Tamaño', [['media', 'Mediana'], ['grande', 'Grande'], ['chica', 'Chica (la de antes)']],
      c.tam || 'media', function (v) { datos(borrador() || d).tam = v; }));
    two.appendChild(select('Estilo', [['simple', 'Sola'], ['circulo', 'Dentro de un círculo']],
      c.estilo || 'simple', function (v) { datos(borrador() || d).estilo = v; }));
    caja.appendChild(two);
    return caja;
  }
  function firmaD(d) { return String(d.slug || '') + '|' + String(((d.fx || {}).coleccion) || '') + '|' + String(d.tpl || ''); }
  function revisarPanel() {
    var d = borrador(); if (!d) return;
    /* ⚠️ 28/10: el panel arranca con un borrador de fábrica y DESPUÉS carga el
       evento (otro objeto D). Si la caja se armó con el primero, mostraba los
       datos de otra invitación («★ XV Rosa» en una boda Bohemia). Se rearma
       cuando cambia la invitación cargada (D es el mismo objeto: se compara el slug). */
    var ya = document.getElementById(ID);
    if (ya && ya.__d === firmaD(d)) return;
    if (ya) ya.remove();
    var a = window.invCasa ? window.invCasa(ID) : null;
    if (!a) return;
    var caja = construir(d); caja.__d = firmaD(d);
    a.appendChild(caja);
  }

  /* ================= ARRANQUE ================= */
  function esPanel() { return !!(borrador() || document.querySelector('.mejoras')); }
  function arrancar() {
    if (esPanel()) { setInterval(revisarPanel, 700); revisarPanel(); return; }
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 300);
    window.addEventListener('message', function () { ultima = null; setTimeout(aplicar, 60); });
  }
  var i = 0;
  var esperar = setInterval(function () {
    if (window.INVEV || esPanel() || ++i > 40) { clearInterval(esperar); arrancar(); }
  }, 250);
})();
