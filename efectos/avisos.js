/* ===== AVISOS IMPORTANTES =======================================================

   19/10/2026 — «sin niños», «no hay valet», «la fiesta termina a las 2»,
   «trae tu bebida», «pide tu Uber». Hoy iban metidos en una imagen.

   DE DÓNDE SALE
     fx.avisos = { encendido, titulo, items: [{ icono, texto }] }  (hasta 6)
     icono: sin-ninos · sin-valet · hora-cierre · trae-tu-bebida · uber · otro
   Panel: efectos/panel-avisos.js (pestaña LUGAR_VEST). Formulario: «Más cosas».

   Los íconos son SVG de línea propios, en `currentColor` teñido con `--sage`:
   toman el color de la colección. Nada de emojis (regla de Maki).
   Apagado o vacío → la sección no existe en el DOM. Va después del menú (o del
   itinerario si no hay menú), salvo que «Orden de las secciones» diga otra cosa.
   ============================================================================ */
(function () {
  'use strict';
  var KEY = 'avisos';
  var A = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICONOS = {
    'sin-ninos': '<circle cx="12" cy="12" r="9.5"/><path d="M5.3 18.7 18.7 5.3"/><circle cx="12" cy="8.3" r="1.8"/><path d="M9.6 17v-3a2.4 2.4 0 0 1 4.8 0v3"/>',
    'sin-valet': '<path d="M5 16v-3l1.6-4.2A2 2 0 0 1 8.5 7.5h7a2 2 0 0 1 1.9 1.3L19 13v3"/><path d="M4 16h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M3.5 3.5l17 17"/>',
    'hora-cierre': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    'trae-tu-bebida': '<path d="M10 2.5h4v3.2l1.4 2.2c.4.6.6 1.3.6 2V20a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20V9.9c0-.7.2-1.4.6-2L10 5.7z"/><path d="M8 13h8"/>',
    'uber': '<path d="M5 17v-4.5L6.8 8a2 2 0 0 1 1.8-1.2h6.8A2 2 0 0 1 17.2 8L19 12.5V17"/><path d="M5 12.5h14"/><path d="M5 17v2M19 17v2"/><circle cx="8" cy="14.8" r=".9"/><circle cx="16" cy="14.8" r=".9"/>',
    'otro': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.8v.01"/>'
  };
  window.INVAVISOS_ICONOS = ICONOS;     /* el panel y el formulario muestran los mismos */

  function svg(k) { return '<svg viewBox="0 0 24 24" ' + A + ' aria-hidden="true">' + (ICONOS[k] || ICONOS.otro) + '</svg>'; }

  function pintar() {
    var S = window.INVSN; if (!S || !document.querySelector('.frame')) return;
    var e = S.ev(); if (!e) return;
    var c = (e.fx && e.fx.avisos) || {};
    var items = (Object.prototype.toString.call(c.items) === '[object Array]' ? c.items : [])
      .map(function (a) { return { i: ICONOS[a && a.icono] ? a.icono : 'otro', t: S.txt(a && a.texto, 160) }; })
      .filter(function (a) { return a.t; }).slice(0, 6);
    if (!S.on(c.encendido) || !items.length) { S.quitar(KEY); return; }
    S.css();
    var sec = S.seccion(KEY, S.txt(c.kick, 60) || 'Toma nota', S.txt(c.titulo, 70) || 'Avisos importantes');
    S.cuerpo(sec, '<div class="sn-avisos">' + items.map(function (a) {
      return '<div class="sn-card sn-a">' + svg(a.i) + '<span>' + S.esc(a.t) + '</span></div>';
    }).join('') + '</div>');
    S.colocar(sec, KEY, function () {
      var m = S.secDe('menu') || S.secDe('itinerario');
      return m ? { despues: m } : null;
    });
    S.legible(sec);
  }
  function esperar() { if (window.INVSN) window.INVSN.repetir(pintar); else setTimeout(esperar, 80); }
  esperar();
})();
