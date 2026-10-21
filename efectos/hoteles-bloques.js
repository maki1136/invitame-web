/* ===== HOSPEDAJE: UN HOTEL POR BLOQUE, NO UNO POR RENGLÓN (20/10/2026) =========

   Pedido de Jazmín: en «Ver hoteles» cada renglón salía como un hotel aparte,
   con su propio «Reservar» («Hotel Playa Las Glorias» · RESERVAR, «Teléfono
   +52…» · RESERVAR, «Dirección: https://maps…» · RESERVAR). «Tiene que haber
   un solo desplegable con todos los datos, que no separe así la información.»

   POR QUÉ PASABA: el formulario pide los hoteles así (crear.html):
       Hotel Casa del Sol
       Calle 60 No. 123, Centro
       www.casadelsol.com
       999 123 4567
       (renglón vacío) → el siguiente hotel
   y el motor (congelado) espera UN renglón por hotel: «Nombre | detalle | link».

   QUÉ HACE: cuando los datos NO traen «|» (o sea, vienen del formulario o se
   escribieron renglón por renglón), vuelve a dibujar la lista:
     · un hotel por BLOQUE (separados por renglón vacío); si no hay renglones
       vacíos, un renglón nuevo que no es teléfono / dirección / link / código
       empieza un hotel nuevo;
     · el primer renglón es el nombre; los demás van abajo, con los links que
       se pueden tocar (teléfono → llamar, mapa → «Ver en el mapa»);
     · UN solo «Reservar» por hotel: la página web si hay, si no el mapa, si no
       una búsqueda con el nombre.
   Con el formato viejo («|») no toca nada: lo dibuja el motor como siempre.
   Corre también en la miniatura del panel.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invHotelesBloques) return; window.__invHotelesBloques = 1;
  if (!/\/i\//.test(location.pathname)) return;

  var DATO = /^(tel[eé]fono|tel\b|tel\.|cel|whats|wa\b|direcci[oó]n|dir\.|ubicaci[oó]n|c[oó]digo|cod\.|descuento|web|p[aá]gina|sitio|mail|correo|email|reserv|precio|tarifa|desde|https?:|www\.|\+?\s?\d)/i;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function bloques(txt) {
    var t = String(txt || '').replace(/\r/g, '');
    var out = [];
    if (/\n\s*\n/.test(t)) {
      t.split(/\n\s*\n+/).forEach(function (b) {
        var ls = b.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        if (ls.length) out.push(ls);
      });
      return out;
    }
    t.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (l) {
      if (!out.length || !DATO.test(l)) out.push([l]); else out[out.length - 1].push(l);
    });
    return out;
  }

  function urlDe(s) {
    var m = String(s).match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
    if (!m) return '';
    return /^www\./i.test(m[1]) ? 'https://' + m[1] : m[1];
  }
  function esMapa(u) { return /maps\.app\.goo\.gl|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.google/i.test(u); }

  function renglon(l) {
    var u = urlDe(l);
    if (u) {
      var rot = l.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/i, '').replace(/[:\s]+$/, '').trim();
      var txt = esMapa(u) ? 'Ver en el mapa' : u.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return '<div class="d">' + (rot ? esc(rot) + ': ' : '') + '<a href="' + esc(u) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">' + esc(txt) + '</a></div>';
    }
    var tel = l.match(/(\+?\d[\d\s().-]{6,}\d)/);
    if (tel && /tel|cel|whats|^\+?\s?\d/i.test(l)) {
      var num = tel[1].replace(/[^\d+]/g, '');
      return '<div class="d">' + esc(l.replace(tel[1], '')).replace(/[:\s]+$/, '') + (l.replace(tel[1], '').trim() ? ': ' : '') +
        '<a href="tel:' + esc(num) + '" style="color:inherit;text-decoration:underline">' + esc(tel[1].trim()) + '</a></div>';
    }
    return '<div class="d">' + esc(l) + '</div>';
  }

  function hotel(ls) {
    var nombre = ls[0], resto = ls.slice(1);
    var webs = resto.map(urlDe).filter(Boolean);
    var u = webs.filter(function (x) { return !esMapa(x); })[0] || webs[0] ||
            'https://www.google.com/search?q=' + encodeURIComponent(nombre);
    return '<div class="hotel"><h4>' + esc(nombre) + '</h4>' + resto.map(renglon).join('') +
      '<a class="btn" href="' + esc(u) + '" target="_blank" rel="noopener">Reservar</a></div>';
  }

  var ultima = '', pintando = false;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var txt = String(ev['c_datos-de-hoteles-recomendados'] || '').trim();
    if (!txt || txt.indexOf('|') >= 0) return;            /* formato del motor: lo dibuja él */
    var cont = document.getElementById('hosp-lista'); if (!cont) return;
    if (txt === ultima && cont.getAttribute('data-bloques') === '1') return;
    ultima = txt;
    pintando = true;
    cont.innerHTML = bloques(txt).map(hotel).join('');
    cont.setAttribute('data-bloques', '1');
    pintando = false;
  }

  var vigilada = null;
  function vigilar() {
    var cont = document.getElementById('hosp-lista');
    if (!cont || cont === vigilada) return;
    vigilada = cont;
    new MutationObserver(function () {
      if (pintando) return;
      cont.removeAttribute('data-bloques');
      setTimeout(aplicar, 0);
    }).observe(cont, { childList: true });
  }
  function paso() { vigilar(); aplicar(); }
  var n = 0, t = setInterval(function () { paso(); if (++n > 40) clearInterval(t); }, 300);
  window.addEventListener('message', function () { setTimeout(paso, 80); setTimeout(paso, 600); });
})();
