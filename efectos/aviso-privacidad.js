/* ===== AVISO DE PRIVACIDAD EN LA CONFIRMACIÓN (6/10/2026) =====================
   Maki: «privacidad de los datos de invitados: sí».
   Una línea chiquita al pie del formulario de confirmación: quién ve lo que el
   invitado escribe, y el link al aviso completo (/privacidad.html).
   No tiene control en el panel A PROPÓSITO: es un texto legal fijo de la
   plataforma, igual en todas las invitaciones; no es diseño.
   ============================================================================ */
(function () {
  if (window.__ivPriv) return; window.__ivPriv = 1;
  function poner() {
    document.querySelectorAll('.rsvpform').forEach(function (f) {
      if (f.querySelector('.iv-priv')) return;
      var p = document.createElement('p');
      p.className = 'iv-priv';
      p.style.cssText = 'margin:14px auto 0;max-width:320px;text-align:center;font-size:11.5px;line-height:1.45;opacity:.85;color:inherit';
      p.appendChild(document.createTextNode('Tu respuesta sólo la ven los anfitriones de este evento. '));
      var a = document.createElement('a');
      a.href = '/privacidad.html'; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Aviso de privacidad';
      a.style.cssText = 'color:inherit;text-decoration:underline';
      p.appendChild(a);
      f.appendChild(p);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poner); else poner();
  setTimeout(poner, 1500); setTimeout(poner, 5000);
})();
