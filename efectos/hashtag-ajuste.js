/* ===== EL HASHTAG ENTRA EN LA PANTALLA (27/10/2026) ============================
   Muestra renata-y-patricio: «#RenataYPatricio2027» es una sola palabra larga y
   con la letra grande del molde se salía por el borde y quedaba cortado.
   Si no entra en el ancho, se achica la letra hasta que entre (mínimo 18 px).
   Para todas las invitaciones: cualquier hashtag largo se ajusta solo.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invHashtagAjuste) return; window.__invHashtagAjuste = 1;
  function ajustar() {
    var e = document.getElementById('hashtag-big');
    if (!e || !e.offsetParent) return;
    e.style.maxWidth = '100%';
    e.style.whiteSpace = 'nowrap';
    if (!e.dataset.fzBase) {
      var b = parseFloat(getComputedStyle(e).fontSize);   /* ⚠️ el molde lo trae inline: no borrarlo */
      if (!b) return;
      e.dataset.fzBase = b;
    }
    var base = parseFloat(e.dataset.fzBase), fz = base;
    e.style.setProperty('font-size', fz + 'px', 'important');
    var caja = e.clientWidth;
    if (!caja) return;
    var n = 0;
    while (e.scrollWidth > caja + 1 && fz > 18 && n++ < 40) {
      fz -= 1;
      e.style.setProperty('font-size', fz + 'px', 'important');
    }
    if (e.scrollWidth > caja + 1) { e.style.whiteSpace = 'normal'; e.style.overflowWrap = 'anywhere'; }
  }
  /* ★ 16/11/2026 (Jazmín, ailicec-mishell: «el insta no lleva a la cuenta y la
     cuenta está bien puesta»). El botón iba a la página del HASHTAG
     (instagram.com/explore/tags/…), que Instagram muestra vacía o pide iniciar
     sesión. Ahora, para todas:
       · si hay «Usuario de Instagram» → abre ESA cuenta;
       · el usuario se acepta como venga: «@cuenta», «cuenta» o el link entero;
       · si no hay usuario pero en el campo del hashtag pegaron una cuenta
         (@algo o un link de instagram.com/algo) → abre esa cuenta. */
  function cuentaDe(v) {
    v = String(v || '').trim();
    if (!v) return '';
    var m = /instagram\.com\/([A-Za-z0-9._]+)/i.exec(v);
    if (m && !/^(explore|p|reel|stories|accounts)$/i.test(m[1])) return m[1];
    if (/^@[A-Za-z0-9._]+$/.test(v)) return v.slice(1);
    if (/^[A-Za-z0-9._]+$/.test(v)) return v;
    return '';
  }
  function enlace() {
    var ev = window.INVEV; if (!ev) return;
    var lk = document.getElementById('hashtag-link'); if (!lk) return;
    var us = cuentaDe(ev['c_usuario-de-instragram']);
    var h = String(ev.igHashtag || '').trim();
    if (!us && (/^@/.test(h) || /instagram\.com\//i.test(h))) us = cuentaDe(h);
    if (!us) return;
    var url = 'https://www.instagram.com/' + encodeURIComponent(us) + '/';
    if (lk.getAttribute('href') !== url) lk.setAttribute('href', url);
    lk.setAttribute('target', '_blank'); lk.setAttribute('rel', 'noopener');
    var big = document.getElementById('hashtag-big');
    if (big && /instagram\.com\//i.test(big.textContent)) big.textContent = '@' + us;
  }
  var k2 = 0, t2 = setInterval(function () { enlace(); if (++k2 > 40) clearInterval(t2); }, 500);
  addEventListener('message', function () { setTimeout(enlace, 250); });
  var k = 0, t = setInterval(function () { ajustar(); if (++k > 40) clearInterval(t); }, 500);
  addEventListener('resize', function () { setTimeout(ajustar, 120); });
  addEventListener('message', function () { setTimeout(ajustar, 200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
})();
