/* ===== ÍCONOS EN «DÓNDE Y CUÁNDO» (29/10/2026) ===============================
   Jazmín: «¿habrá posibilidad de colocar íconos en el sector de Dónde y cuándo?
   En iglesia y recepción».

   Cada lugar (Ceremonia 1, 2 y 3) puede llevar un ícono de línea fina en un
   círculo, arriba del título, del color de la invitación. Si la colección traía
   su propio medallón en ese lugar, el ícono elegido lo reemplaza.

   EL DATO — fx.eventosIconos = { 1: 'iglesia', 2: 'copas', 3: '' }
   Panel: LUGAR_VEST, arriba de «Ceremonia 1». Corre también en la miniatura.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invIconosEventos) return; window.__invIconosEventos = 1;

  /* trazos de 24×24, línea fina */
  var IC = {
    iglesia:   ['Iglesia', '<path d="M12 2v4M10 4h4"/><path d="M7 21V11l5-4 5 4v10"/><path d="M3 21h18"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/><path d="M7 13l-3 2v6M17 13l3 2v6"/>'],
    anillos:   ['Anillos', '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M13 5l2-2 2 2-2 2z"/>'],
    copas:     ['Brindis', '<path d="M6 3h5l-.6 5a3 3 0 0 1-3.8 0z"/><path d="M8.5 11v7M6 21h5"/><path d="M13 3h5l-.6 5a3 3 0 0 1-3.8 0z" transform="rotate(14 15.5 7)"/><path d="M16.2 11.2l-1.7 6.8M13 20.4l4.9 1.2"/>'],
    cubiertos: ['Cena', '<path d="M7 3v7a2 2 0 0 0 4 0V3M9 3v18"/><path d="M17 3c-2 2-2 6 0 8v10"/>'],
    pastel:    ['Pastel', '<path d="M4 21h16"/><rect x="5" y="14" width="14" height="7" rx="1"/><rect x="7" y="9" width="10" height="5" rx="1"/><path d="M12 9V6"/><path d="M12 3.5c.8.8.8 1.7 0 2.5-.8-.8-.8-1.7 0-2.5z"/>'],
    musica:    ['Música', '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'],
    civil:     ['Civil', '<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 12h6M9 15h3"/><path d="M14 19l5-5 1.5 1.5-5 5H14z"/>'],
    salon:     ['Salón', '<path d="M3 10l9-6 9 6"/><path d="M5 10v11h14V10"/><path d="M3 21h18"/><path d="M9 21v-6h6v6"/>'],
    corazon:   ['Corazón', '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'],
    cruz:      ['Cruz', '<path d="M12 3v18M7 8h10"/>'],
    baile:     ['Baile', '<circle cx="12" cy="9" r="5"/><path d="M12 4v10M7.4 7h9.2M7.4 11h9.2"/><path d="M12 14v3M9 21l3-4 3 4"/>'],
    camara:    ['Fotos', '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>']
  };
  window.INV_ICONOS_EVENTOS = IC;

  function svg(k) { var i = IC[k]; return i ? '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + i[1] + '</svg>' : ''; }

  var ID_CSS = 'inv-iconos-eventos';
  var CSS =
    'html body [data-sec="eventos"] .evento[data-ev-ico] .bd::before{display:none!important}' +
    'html body [data-sec="eventos"] .ev-ico{display:flex;align-items:center;justify-content:center;width:58px;height:58px;box-sizing:border-box;padding:13px;' +
    'margin:-42px auto 8px;position:relative;z-index:5;border-radius:50%;color:var(--verde,#6D1233);background:var(--lino2,#fbf8f2);' +
    'box-shadow:0 0 0 3px var(--lino2,#fbf8f2),0 0 0 4px color-mix(in srgb,var(--oro,#b08a4e) 70%,transparent),0 6px 14px rgba(40,20,18,.16)}' +
    'html body [data-sec="eventos"] .evento:not(:has(.ph[style*="url"])) .ev-ico{margin-top:4px}';

  function ev() { return window.INVEV || null; }
  var ultima = '';
  function aplicar() {
    var e = ev(); if (!e) return;
    var c = (e.fx && e.fx.eventosIconos) || {};
    var cards = document.querySelectorAll('[data-sec="eventos"] .evento');
    var firma = JSON.stringify(c) + '|' + cards.length;
    var hay = false;
    [].forEach.call(cards, function (card, i) {
      var k = String(c[i + 1] || ''), bd = card.querySelector('.bd'), ya = card.querySelector('.ev-ico');
      if (!IC[k] || !bd) { if (ya) ya.remove(); card.removeAttribute('data-ev-ico'); return; }
      hay = true;
      if (!ya) { ya = document.createElement('div'); ya.className = 'ev-ico'; bd.insertBefore(ya, bd.firstChild); }
      if (ya.getAttribute('data-k') !== k) { ya.setAttribute('data-k', k); ya.innerHTML = svg(k); }
      card.setAttribute('data-ev-ico', k);
    });
    var st = document.getElementById(ID_CSS);
    if (hay && !st) { st = document.createElement('style'); st.id = ID_CSS; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
    if (!hay && st) st.remove();
    ultima = firma;
  }

  /* ================= PANEL ================= */
  var ID = 'iconos-eventos-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function datos(d) { d.fx = d.fx || {}; d.fx.eventosIconos = d.fx.eventosIconos || {}; return d.fx.eventosIconos; }
  function firmaD(d) { return String(d.slug || '') + '|' + JSON.stringify((d.fx || {}).eventosIconos || {}); }

  function construir(d) {
    var caja = document.createElement('div'); caja.id = ID;
    var t = document.createElement('div'); t.textContent = 'Íconos de los lugares (Dónde y cuándo)';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    var a = document.createElement('div'); a.textContent = 'Un dibujito arriba del nombre de cada lugar: iglesia, brindis, cena… Toma el color de la invitación.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(t); caja.appendChild(a);
    [1, 2, 3].forEach(function (n) {
      var nom = String(d['ev' + n + 't'] || ['Ceremonia', 'Recepción', 'Tercer lugar'][n - 1]);
      var l = document.createElement('div'); l.textContent = 'Lugar ' + n + ' — ' + nom;
      l.style.cssText = 'font-size:12px;font-weight:600;margin:8px 0 5px';
      caja.appendChild(l);
      var fila = document.createElement('div'); fila.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
      var actual = String(datos(d)[n] || '');
      [''].concat(Object.keys(IC)).forEach(function (k) {
        var b = document.createElement('button'); b.type = 'button'; b.title = k ? IC[k][0] : 'Sin ícono';
        b.style.cssText = 'width:40px;height:40px;padding:8px;border-radius:10px;cursor:pointer;background:#fff;color:#6D1233;' +
          'border:' + (k === actual ? '2px solid #c0567a' : '1px solid rgba(0,0,0,.15)') + ';font-size:10px;line-height:1';
        b.innerHTML = k ? svg(k) : 'sin';
        b.onclick = function () { var dd = borrador() || d; datos(dd)[n] = k; refrescar(); var v = document.getElementById(ID); if (v) v.remove(); };
        fila.appendChild(b);
      });
      caja.appendChild(fila);
    });
    caja.__d = firmaD(d);
    return caja;
  }
  function revisarPanel() {
    var d = borrador(); if (!d) return;
    var ya = document.getElementById(ID);
    if (ya && ya.__d === firmaD(d)) return;
    if (ya) ya.remove();
    var casa = window.invCasa ? window.invCasa(ID) : null;
    if (!casa) return;
    casa.appendChild(construir(d));
  }

  function esPanel() { return !!(borrador() && !window.INVEV); }
  function arrancar() {
    if (esPanel()) { setInterval(revisarPanel, 700); revisarPanel(); return; }
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 600);
    window.addEventListener('message', function () { setTimeout(aplicar, 120); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
