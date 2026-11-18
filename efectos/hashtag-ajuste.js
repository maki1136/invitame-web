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
  /* ★ 18/11/2026 (Jazmín, festival-instituto-toluca: «quieren agregar el hashtag
     para Facebook también»). Con la casilla «Sumar Facebook» (panel → Instagram ·
     títulos, diseño), debajo del de Instagram va el logo de Facebook, el hashtag
     y el botón «Ver en Facebook», con la MISMA letra, tamaño y colores que el de
     Instagram (se copian del de arriba). El botón abre la página que pongan; si
     no ponen ninguna, la búsqueda del hashtag en Facebook. */
  var FB_SVG = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="4.5"/><path d="M15.2 7.6h-1.6c-1.3 0-2.2.9-2.2 2.3v1.7H9.8v2.3h1.6V20h2.4v-6.1h1.7l.3-2.3h-2v-1.4c0-.5.3-.8.8-.8h1.3z" fill="currentColor" stroke="none"/></svg>';
  function facebook() {
    var ev = window.INVEV; if (!ev) return;
    var es = ((ev.fx || {}).estiloSec || {}).hashtag || {};
    var sec = document.getElementById('hashtag-sec'); if (!sec) return;
    var caja = document.getElementById('inv-fb-hashtag');
    var on = es.facebook === true || es.facebook === 'true' || es.facebook === 1;
    if (!on) { if (caja) caja.remove(); return; }
    var big = document.getElementById('hashtag-big'), lk = document.getElementById('hashtag-link');
    if (!big || !lk) return;
    if (!caja) {
      caja = document.createElement('div'); caja.id = 'inv-fb-hashtag';
      caja.style.cssText = 'margin-top:26px;text-align:center';
      caja.innerHTML = '<div class="inv-fb-logo" style="width:42px;height:42px;margin:0 auto;display:block"></div>' +
        '<div class="inv-fb-big"></div><a class="inv-fb-btn" target="_blank" rel="noopener"></a>';
      lk.parentNode.insertBefore(caja, lk.nextSibling);
    }
    var logo = caja.querySelector('.inv-fb-logo'), fbBig = caja.querySelector('.inv-fb-big'), btn = caja.querySelector('.inv-fb-btn');
    if (!logo.firstChild) logo.innerHTML = FB_SVG;
    var ig = sec.querySelector('.est-ig-logo');
    logo.style.color = ig ? getComputedStyle(ig).color : getComputedStyle(big).color;
    logo.style.display = (es.sinLogo === true || es.sinLogo === 'true') ? 'none' : 'block';
    /* el hashtag: mismo estilo que el de Instagram */
    var tag = String(es.fbHashtag || '').trim() || big.textContent.trim();
    if (tag && tag.charAt(0) !== '#' && tag.charAt(0) !== '@') tag = '#' + tag;
    fbBig.setAttribute('style', big.getAttribute('style') || '');
    var cb = getComputedStyle(big);
    ['font-family', 'font-size', 'color', 'letter-spacing', 'font-weight', 'font-style', 'text-transform'].forEach(function (k) {
      fbBig.style.setProperty(k, cb.getPropertyValue(k), 'important');
    });
    fbBig.style.margin = '12px auto';
    if (fbBig.textContent !== tag) fbBig.textContent = tag;
    /* el botón: mismas clases que el de Instagram */
    btn.className = lk.className.replace(/\binv-fb-btn\b/, '') + ' inv-fb-btn';
    var texto = String(es.fbBoton || '').trim() || 'Ver en Facebook';
    if (btn.textContent !== texto) btn.textContent = texto;
    var cl = getComputedStyle(lk);
    ['background-color', 'background-image', 'color', 'border', 'border-radius', 'font-family', 'font-size', 'letter-spacing', 'padding', 'box-shadow', 'text-transform'].forEach(function (k) {
      btn.style.setProperty(k, cl.getPropertyValue(k));
    });
    btn.style.display = 'inline-block';
    var pag = String(es.fbLink || '').trim(), url;
    var m = /facebook\.com\/([^?#\s]+)/i.exec(pag);
    if (m) url = 'https://www.facebook.com/' + m[1].replace(/\/$/, '');
    else if (/^@?[A-Za-z0-9.\-_]{3,}$/.test(pag)) url = 'https://www.facebook.com/' + pag.replace(/^@/, '');
    else url = 'https://www.facebook.com/hashtag/' + encodeURIComponent(tag.replace(/^[#@]/, ''));
    if (btn.getAttribute('href') !== url) btn.setAttribute('href', url);
  }
  window.INVFB_HASHTAG = facebook;
  var k3 = 0, t3 = setInterval(function () { facebook(); if (++k3 > 40) { clearInterval(t3); setInterval(facebook, 2500); } }, 500);
  addEventListener('message', function () { setTimeout(facebook, 300); });

  var k2 = 0, t2 = setInterval(function () { enlace(); if (++k2 > 40) clearInterval(t2); }, 500);
  addEventListener('message', function () { setTimeout(enlace, 250); });
  var k = 0, t = setInterval(function () { ajustar(); if (++k > 40) clearInterval(t); }, 500);
  addEventListener('resize', function () { setTimeout(ajustar, 120); });
  addEventListener('message', function () { setTimeout(ajustar, 200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
})();
