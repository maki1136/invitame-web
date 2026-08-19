/* ===== ITINERARIO DINÁMICO =====================================================

   QUÉ HACE
   El itinerario ya tenía su línea vertical y sus puntitos, pero aparecía todo de
   golpe. Ahora, a medida que el invitado baja:
     · la línea se va DIBUJANDO de arriba hacia abajo, siguiendo el scroll
     · cada momento (hora + título + descripción) ENTRA solo cuando le toca,
       subiendo apenas y apareciendo, uno atrás del otro
     · el puntito de cada momento hace un "pop" al llegar

   QUÉ NO TOCA
   Nada del diseño: ni colores, ni tipografías, ni posiciones. La línea y los
   puntos son los que ya estaban (.tl::before y .tl .it::before). Esto es
   solamente el movimiento.

   ⚠️ SÓLO SE VE SI EL ITINERARIO ESTÁ CARGADO COMO LISTA.
   El motor esconde la lista (`.tl` queda en display:none) cuando la diseñadora
   cargó el itinerario como IMAGEN. En ese caso este archivo no hace nada, y
   está bien que así sea. (En `maria-y-diego` está cargado como imagen.)

   👁 PARA VERLO IGUAL: agregar `?itinerario=lista` a la dirección. Eso muestra
   la lista y esconde la imagen SÓLO en esa visita — no cambia nada del evento
   ni de lo que ven los invitados. Es para previsualizar.

   ACCESIBILIDAD
   Si la persona tiene activado "reducir movimiento" en su teléfono, se muestra
   todo quieto y completo. Nadie se queda sin ver el itinerario.
   ============================================================================ */
(function () {
  'use strict';

  var PREVIEW = /[?&]itinerario=lista/.test(location.search);

  var CSS = [
    /* la línea original queda de guía tenue; encima se dibuja la de progreso */
    '.tl.tl-anim::before{opacity:.22}',
    '.tl.tl-anim .tl-prog{position:absolute;left:6px;top:6px;bottom:6px;width:2px;',
    '  background:var(--verde);transform-origin:top center;transform:scaleY(0);',
    '  transition:transform .18s linear;border-radius:2px}',

    /* cada momento entra subiendo apenas */
    '.tl.tl-anim > .it{opacity:0;transform:translateY(26px);',
    '  transition:opacity .8s ease,transform .8s cubic-bezier(.22,.72,.28,1)}',
    '.tl.tl-anim > .it.on{opacity:1;transform:none}',

    /* el puntito hace "pop" cuando llega su momento */
    '.tl.tl-anim > .it::before{transform:scale(.2);opacity:0;',
    '  transition:transform .55s cubic-bezier(.3,1.5,.5,1) .12s,opacity .35s ease .12s}',
    '.tl.tl-anim > .it.on::before{transform:scale(1);opacity:1}',

    /* si pidió menos movimiento: todo quieto y visible */
    '@media(prefers-reduced-motion:reduce){',
    '  .tl.tl-anim > .it{opacity:1;transform:none}',
    '  .tl.tl-anim > .it::before{opacity:1;transform:none}',
    '  .tl.tl-anim .tl-prog{transform:scaleY(1)}',
    '}'
  ].join('\n');

  function ponerEstilos() {
    if (document.getElementById('tl-anim-css')) return;
    var s = document.createElement('style');
    s.id = 'tl-anim-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Vista previa: mostrar la lista aunque el evento tenga el itinerario como
     imagen. No toca los datos: es sólo para esta visita. */
  function forzarLista() {
    if (!PREVIEW) return;
    [].forEach.call(document.querySelectorAll('.tl'), function (tl) {
      if (getComputedStyle(tl).display === 'none') tl.style.display = 'block';
      var sec = tl.closest ? tl.closest('section') : null;
      if (!sec) return;
      [].forEach.call(sec.querySelectorAll('img'), function (im) { im.style.display = 'none'; });
    });
  }

  var armados = [];   /* las listas ya preparadas, para no repetir */

  function visible(el) {
    /* el motor esconde la lista cuando el itinerario se cargó como imagen */
    return el.offsetParent !== null && el.getBoundingClientRect().height > 0;
  }

  function armar(tl) {
    if (tl.__tlListo || !visible(tl)) return;
    var items = [].filter.call(tl.children, function (c) {
      return c.classList && c.classList.contains('it');
    });
    if (!items.length) return;

    tl.__tlListo = true;
    tl.classList.add('tl-anim');

    var prog = tl.querySelector('.tl-prog');
    if (!prog) {
      prog = document.createElement('i');
      prog.className = 'tl-prog';
      tl.appendChild(prog);
    }

    /* el escalonado: cada momento entra un toque después del anterior */
    items.forEach(function (it, i) { it.style.transitionDelay = (i * 0.10) + 's'; });

    /* quién ya entró en pantalla */
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
        });
      }, { threshold: .2, rootMargin: '0px 0px -10% 0px' });
      items.forEach(function (it) { io.observe(it); });
    } else {
      items.forEach(function (it) { it.classList.add('on'); });
    }

    armados.push({ tl: tl, prog: prog, items: items });
    dibujar();
  }

  /* la línea sigue al scroll: 0 cuando la lista asoma por abajo,
     1 cuando terminó de pasar */
  function dibujar() {
    var h = window.innerHeight || 800;
    armados.forEach(function (a) {
      var r = a.tl.getBoundingClientRect();
      var p = (h * 0.82 - r.top) / (r.height + h * 0.30);
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      a.prog.style.transform = 'scaleY(' + p.toFixed(3) + ')';

      /* red de seguridad: si por lo que sea el observador no corrió
         (pasa en pestañas en segundo plano), igual se revelan al pasar */
      if (p > 0.02) {
        a.items.forEach(function (it) {
          if (!it.classList.contains('on') && it.getBoundingClientRect().top < h * 0.88) {
            it.classList.add('on');
          }
        });
      }
    });
  }

  var pedido = false;
  function alScroll() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () { pedido = false; dibujar(); });
  }

  function buscar() {
    forzarLista();
    [].forEach.call(document.querySelectorAll('.tl'), armar);
  }

  function arrancar() {
    ponerEstilos();
    buscar();
    addEventListener('scroll', alScroll, { passive: true });
    addEventListener('resize', alScroll);

    /* el motor pinta el evento después, y puede volver a pintarlo:
       por eso se sigue mirando un rato en vez de una sola vez */
    if (window.MutationObserver) {
      new MutationObserver(buscar).observe(document.body, { childList: true, subtree: true });
    }
    var n = 0, t = setInterval(function () { buscar(); if (++n > 40) clearInterval(t); }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
