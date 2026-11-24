/* ===== MESA DE REGALOS: BOTÓN DE WHATSAPP Y BOTÓN DE MAIL (24/11/2026) ========
   Jazmín, César & Helene: «pide que en el sector regalos haya dos botones; coloqué
   uno solo con el contacto, pero quiere meter un mail para comunicarse».
   Campos (panel REGALOS → «Botones de contacto»):
     reg_wa_n / reg_wa     → botón que abre WhatsApp con ese número
     reg_mail_n / reg_mail → botón que abre el correo (mailto:)
   Van junto a los botones de las tiendas (#reg-btns).
   ⚠️ Vacíos NO HACEN NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRegContacto) return; window.__invRegContacto = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function aplicar() {
    var ev = window.INVEV, rb = document.getElementById('reg-btns');
    if (!ev || !rb) return;
    var tel = String(ev.reg_wa || '').replace(/[^\d]/g, '');
    var mail = String(ev.reg_mail || '').trim();
    if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(mail)) mail = '';
    var html = '';
    if (tel.length >= 8) html += '<a class="reg-contacto" href="https://wa.me/' + tel + '" target="_blank" rel="noopener">' + esc(String(ev.reg_wa_n || '').trim() || 'Escribir por WhatsApp') + '</a>';
    if (mail) html += '<a class="reg-contacto" href="mailto:' + esc(mail) + '">' + esc(String(ev.reg_mail_n || '').trim() || 'Enviar un correo') + '</a>';
    var ya = rb.querySelectorAll('.reg-contacto'), firma = rb.getAttribute('data-reg-contacto') || '';
    if (firma === html && ya.length === (html ? html.split('<a ').length - 1 : 0)) return;
    [].forEach.call(ya, function (a) { a.remove(); });
    rb.setAttribute('data-reg-contacto', html);
    if (!html) return;
    rb.insertAdjacentHTML('beforeend', html);
    rb.style.display = 'flex';
    var rs = document.querySelector('[data-sec="regalos"]'); if (rs && rs.style.display === 'none') rs.style.display = '';
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 500);
  setInterval(aplicar, 2500);
  addEventListener('message', function () { setTimeout(aplicar, 200); setTimeout(aplicar, 900); });
})();
