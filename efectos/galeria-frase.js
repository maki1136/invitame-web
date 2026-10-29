/* ===== LA FRASE DE LA GALERÍA ================================================

   Pedido de Jazmín (15/10/2026): «que en el sector de Galería puedan
   especificar el título y una frase (frase opcional)».

   El título ya existía (`galTitulo`). La frase no: la sección iba del título
   directo a las fotos. Este módulo pone `galFrase` en un párrafo debajo del
   título (#gal-h2). Vacío = no aparece nada.

   ⚠️ ES UN MÓDULO Y NO VA EN EL MOTOR, a propósito: las invitaciones corren en
      versiones CONGELADAS del motor (i/v/<versión>/). Un cambio en
      i/index.html no llega a ninguna. Ver la skill invitame-flujo-ingenieria.

   Se carga desde: el formulario del cliente (crear.html → galFrase) y el
   panel («Frase de la galería (debajo del título):», pestaña de Galería).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'gal-frase';

  function texto() {
    try { return String(((window.INVEV || {}).galFrase) || '').trim(); } catch (e) { return ''; }
  }

  /* ★ 29/10 (Jazmín): «que no haya bajada de galería, que haya TÍTULO PRINCIPAL
     y TÍTULO SECUNDARIO, nada más». La bajada (#gal-kick, «Recuerdos» / «Mis
     Fotos») sale del panel y no se muestra en las invitaciones NUEVAS. Las ya
     entregadas la siguen mostrando como estaban (INVNUEVA). */
  function bajada() {
    var k = document.getElementById('gal-kick'); if (!k) return;
    var nueva = window.INVNUEVA ? window.INVNUEVA() : false;
    if (nueva) { if (k.style.display !== 'none') { k.style.setProperty('display', 'none', 'important'); k.setAttribute('data-sin-bajada', '1'); } }
    else if (k.getAttribute('data-sin-bajada')) { k.style.removeProperty('display'); k.removeAttribute('data-sin-bajada'); }
  }

  function poner() {
    bajada();
    var h = document.getElementById('gal-h2');
    if (!h) return;
    var t = texto();
    var p = document.getElementById(ID);
    if (!t) { if (p) p.remove(); return; }
    if (!p) {
      p = document.createElement('p');
      p.id = ID;
      p.style.cssText = 'margin:6px auto 16px;max-width:460px;line-height:1.55';
      h.parentNode.insertBefore(p, h.nextSibling);
    }
    if (p.textContent !== t) p.textContent = t;
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    poner();
    /* la miniatura del panel manda el evento por mensaje: se repinta */
    addEventListener('message', function () { setTimeout(poner, 120); });
    var n = 0, t = setInterval(function () { poner(); if (++n > 40) clearInterval(t); }, 500);
  }
  arrancar();
})();
