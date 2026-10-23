/* ===== «ABRIR EN GOOGLE MAPS» DEBAJO DE CADA MAPA (23/10/2026) ===============
   citlalli-y-hedwin-jesus: «cuando le doy en abrir mapa, no me abre nada». El
   «Ver mapa» despliega un mapa chiquito adentro de la invitación, pero no había
   forma de abrirlo en la app de mapas para ir manejando.
   Debajo de cada mapa se agrega «Abrir en Google Maps»: usa el link que cargaron
   (maps.app.goo.gl…) y, si cargaron coordenadas o sólo la dirección, arma la
   búsqueda de Google Maps con eso.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invMapaAbrir) return; window.__invMapaAbrir = 1;
  function destino(ev, n) {
    var link = String(ev['ev' + n + 'maps'] || '').trim();
    if (/^https?:\/\//i.test(link)) return link;
    var q = link || String(ev['ev' + n + 'dir'] || '').trim();
    if (!q) return '';
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q.replace(/\s+/g, ' '));
  }
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    if (!document.getElementById('inv-mapa-abrir-css')) {
      var st = document.createElement('style'); st.id = 'inv-mapa-abrir-css';
      st.textContent = '.map-abrir{display:block;margin:8px auto 2px;text-align:center;font-size:12px;letter-spacing:.12em;text-transform:uppercase;text-decoration:underline;text-underline-offset:3px;color:inherit;opacity:.85}';
      document.head.appendChild(st);
    }
    [1, 2, 3].forEach(function (n) {
      var f = document.getElementById('ev' + n + '-map'); if (!f) return;
      var u = destino(ev, n);
      var a = f.parentNode.querySelector('.map-abrir[data-n="' + n + '"]');
      if (!u) { if (a) a.remove(); return; }
      if (!a) {
        a = document.createElement('a'); a.className = 'map-abrir'; a.setAttribute('data-n', n);
        a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Abrir en Google Maps';
        f.parentNode.insertBefore(a, f.nextSibling);
      }
      if (a.href !== u) a.href = u;
    });
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 150); });
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 20) clearInterval(t); }, 700);
  }
  arrancar();
})();
