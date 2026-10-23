/* ===== DIBUJITOS EN EL ITINERARIO (23/10/2026) ================================
   Pedido de la clienta de citlalli-y-hedwin-jesus: «me gusta que tenga esas
   pequeñas imágenes, esa línea y las imágenes en orden». Cada momento lleva un
   dibujito de línea fina (iglesia, anillos, copas, banquete, baile, fiesta…).
   · Se prende en el panel: LUGAR_VEST → El itinerario → «Con dibujitos».
   · Cada momento puede elegir el suyo; en «Automático» sale por el nombre
     («Ceremonia religiosa» → iglesia, «Coctel» → copas, «Banquete» → campana…).
   · Son trazos (stroke = currentColor): toman el color del texto del itinerario.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invItIconos) return; window.__invItIconos = 1;

  var P = 'fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"';
  var ICONOS = {
    iglesia: '<path d="M12 2v4M10 4h4"/><path d="M7 21V11l5-4 5 4v10"/><path d="M4 21v-6l3-2M20 21v-6l-3-2"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/><path d="M3 21h18"/>',
    anillos: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M8 6l1-2h2l1 2-2 3z"/>',
    copas: '<path d="M6 3h5l-.5 5a2 2 0 0 1-4 0z"/><path d="M8.5 10v7M6.5 17h4"/><path d="M13 5h5l-.5 5a2 2 0 0 1-4 0z"/><path d="M15.5 12v7M13.5 19h4"/><path d="M11 2.5l1.5-1M12 4.5l1.6-.3"/>',
    banquete: '<path d="M3 17h18"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 8V6M10.5 6h3"/><path d="M4 20h16"/>',
    cubiertos: '<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3"/><path d="M7 11v10"/><path d="M17 21V3c-2 1-3 4-3 7h3"/>',
    baile: '<circle cx="9" cy="4.5" r="1.6"/><circle cx="15.5" cy="5.5" r="1.5"/><path d="M9 6.5v6l-2 8M9 12.5l2.5 7.5"/><path d="M9 8.5l4 1.5 2.5-2.5"/><path d="M15.5 7.5l.5 4-3 2 1.5 6M16 11.5l3 1"/>',
    fiesta: '<circle cx="12" cy="13" r="7"/><path d="M12 6v14M5 13h14M7 8.5c3 2 7 2 10 0M7 17.5c3-2 7-2 10 0"/><path d="M12 3v3M10.5 3h3"/>',
    pastel: '<path d="M5 21v-7h14v7"/><path d="M3 21h18"/><path d="M5 17c2 1.5 4 1.5 7 0s5-1.5 7 0"/><path d="M8 14v-3h8v3"/><path d="M12 11V8"/><path d="M12 5.5c.8.9.8 1.6 0 2.2-.8-.6-.8-1.3 0-2.2z"/>',
    musica: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    foto: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
    auto: '<path d="M3 16v-3l2-5h10l4 5h2v3z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    corazon: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
  };
  var NOMBRES = { iglesia: 'Iglesia', anillos: 'Anillos', copas: 'Copas / brindis', banquete: 'Banquete', cubiertos: 'Cena',
    baile: 'Baile', fiesta: 'Fiesta (bola disco)', pastel: 'Pastel', musica: 'Música', foto: 'Fotos', auto: 'Auto', corazon: 'Corazón' };
  var REGLAS = [
    [/relig|iglesia|misa|ceremonia/i, 'iglesia'], [/civil|anillo|votos|boda/i, 'anillos'],
    [/c[oó]ct?el|brind|bienvenida|copa/i, 'copas'], [/banquete|cena|comida|almuerzo/i, 'banquete'],
    [/baile|vals|pista/i, 'baile'], [/fiesta|fin|cierre|celebraci|disco|party/i, 'fiesta'],
    [/pastel|torta/i, 'pastel'], [/m[uú]sica|dj|show/i, 'musica'], [/foto/i, 'foto'], [/traslado|salida|auto/i, 'auto']
  ];
  window.INVITICONOS = { lista: ICONOS, nombres: NOMBRES };

  function elegir(m) {
    if (m && m.i && ICONOS[m.i]) return m.i;
    var t = String((m && (m.t || '')) || '');
    for (var i = 0; i < REGLAS.length; i++) if (REGLAS[i][0].test(t)) return REGLAS[i][1];
    return 'corazon';
  }
  function svg(k) { return '<svg viewBox="0 0 24 24" ' + P + ' aria-hidden="true">' + ICONOS[k] + '</svg>'; }

  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var c = (ev.fx && ev.fx.itinerario) || {};
    var tl = document.querySelector('.tl'); if (!tl) return;
    var its = tl.querySelectorAll(':scope > .it');
    var st = document.getElementById('inv-it-iconos-css');
    if (!c.iconos) {
      [].forEach.call(tl.querySelectorAll('.it-ico'), function (e) { e.remove(); });
      if (st) st.textContent = '';
      return;
    }
    if (!st) { st = document.createElement('style'); st.id = 'inv-it-iconos-css'; document.head.appendChild(st); }
    st.textContent = '.tl > .it .it-ico{display:block;flex:none;width:34px;height:34px;margin:0 0 4px;opacity:.9}' +
      '.tl > .it .it-ico svg{width:100%;height:100%;display:block}';
    var ms = Array.isArray(c.momentos) ? c.momentos : [];
    [].forEach.call(its, function (it, i) {
      var m = ms[i] || { t: (it.querySelector('.h') || {}).textContent || '' };
      var k = elegir(m);
      var e = it.querySelector('.it-ico');
      if (e && e.getAttribute('data-k') === k) return;
      if (!e) { e = document.createElement('span'); e.className = 'it-ico'; it.insertBefore(e, it.firstChild); }
      e.setAttribute('data-k', k); e.innerHTML = svg(k);
    });
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 200); });
    setInterval(aplicar, 1000);
  }
  arrancar();
})();
