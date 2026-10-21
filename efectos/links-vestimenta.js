/* ===== LOS LINKS EN VESTIMENTA SE PUEDEN TOCAR (21/10/2026) ===================

   Pedido de Jazmín: «que en el sector de vestimenta esté la opción de colocar
   un link de Pinterest o alguna otra plataforma para que los invitados, al
   seleccionarlo, vayan a la página a ver las opciones».

   El link ya se puede escribir en el texto de Vestimenta (panel: LUGAR_VEST →
   «Dresscode Texto», o el formulario), pero salía como texto suelto. Este
   módulo convierte cada `https://…` / `www.…` de la sección en un botón que
   abre en otra pestaña: «Ver ideas en Pinterest» si es de Pinterest, si no
   «Ver ideas». No cambia ningún dato. Corre también en la miniatura.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invLinksVest) return; window.__invLinksVest = 1;
  if (!/\/i\//.test(location.pathname)) return;

  var RE = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/i;

  function rotulo(u) { return /pin\.it|pinterest\./i.test(u) ? 'Ver ideas en Pinterest' : 'Ver ideas'; }

  function aplicar() {
    var sec = document.querySelector('[data-sec="dresscode"]');
    if (!sec) return;
    var w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!RE.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (n.parentNode && n.parentNode.closest && n.parentNode.closest('a,button,script,style')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var lista = [], n;
    while ((n = w.nextNode())) lista.push(n);
    lista.forEach(function (t) {
      var partes = t.nodeValue.split(RE);
      var frag = document.createDocumentFragment();
      partes.forEach(function (p, i) {
        if (!p) return;
        if (i % 2 === 1) {
          var u = /^www\./i.test(p) ? 'https://' + p : p;
          u = u.replace(/[.,;:)]+$/, '');
          var a = document.createElement('a');
          a.href = u; a.target = '_blank'; a.rel = 'noopener';
          a.className = 'btn inv-link-vest';
          a.textContent = rotulo(u);
          a.style.cssText = 'display:inline-block;margin:10px auto 4px;font-style:normal';
          frag.appendChild(document.createElement('br'));
          frag.appendChild(a);
        } else frag.appendChild(document.createTextNode(p));
      });
      t.parentNode.replaceChild(frag, t);
    });
  }

  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
  window.addEventListener('message', function () { setTimeout(aplicar, 120); setTimeout(aplicar, 700); });
})();
