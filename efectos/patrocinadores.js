/* ===== PATROCINADORES ==========================================================

   19/10/2026 — eventos corporativos: congresos, galas, cenas de fin de año.

   DE DÓNDE SALE
     fx.patrocinadores = { encendido, titulo, logos: [{ img, nombre, link }] }  (hasta 12)
   Panel: efectos/panel-patrocinadores.js (pestaña PRINCIPAL, junto al cierre),
   con subidor de logo. Formulario: «Más cosas → Patrocinadores».

   Grilla de logos en tarjetas (3 por fila, 2 en pantallas muy angostas). Un
   logo sin imagen muestra el nombre; con link, la tarjeta abre la página.
   Apagado o vacío → la sección no existe en el DOM. Va después de los
   contactos (antes del cierre), salvo que «Orden de las secciones» diga otra.
   ============================================================================ */
(function () {
  'use strict';
  var KEY = 'patrocinadores';
  function img(u) {
    u = String(u || '').trim();
    if (!/^https:\/\//i.test(u)) return '';
    /* Cloudinary: se pide liviano (los logos se ven a 52 px de alto) */
    return u.replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!(?:[a-z]_[^/]*,?)+\/)/, '$1w_320,c_limit,q_auto,f_auto/');
  }
  function pintar() {
    var S = window.INVSN; if (!S || !document.querySelector('.frame')) return;
    var e = S.ev(); if (!e) return;
    var c = (e.fx && e.fx.patrocinadores) || {};
    var logos = (Object.prototype.toString.call(c.logos) === '[object Array]' ? c.logos : [])
      .map(function (l) { return { i: img(l && l.img), n: S.txt(l && l.nombre, 60), u: S.url(l && l.link) }; })
      .filter(function (l) { return l.i || l.n; }).slice(0, 12);
    if (!S.on(c.encendido) || !logos.length) { S.quitar(KEY); return; }
    S.css();
    var sec = S.seccion(KEY, S.txt(c.kick, 60) || 'Gracias a', S.txt(c.titulo, 70) || 'Patrocinadores');
    S.cuerpo(sec, '<div class="sn-logos">' + logos.map(function (l) {
      var dentro = (l.i ? '<img src="' + S.esc(l.i) + '" alt="' + S.esc(l.n || 'Patrocinador') + '" loading="lazy">' : '') +
                   ((!l.i && l.n) ? '<b>' + S.esc(l.n) + '</b>' : '');
      return l.u
        ? '<a class="sn-card sn-l" href="' + S.esc(l.u) + '" target="_blank" rel="noopener">' + dentro + '</a>'
        : '<div class="sn-card sn-l">' + dentro + '</div>';
    }).join('') + '</div>');
    S.colocar(sec, KEY, function () {
      var c2 = document.getElementById('contacto-sec');
      if (c2 && c2.parentNode === document.querySelector('.frame')) return { despues: c2 };
      var pie = document.querySelector('.frame > .footer');
      return pie ? { antes: pie } : null;
    });
    S.legible(sec);
  }
  function esperar() { if (window.INVSN) window.INVSN.repetir(pintar); else setTimeout(esperar, 80); }
  esperar();
})();
