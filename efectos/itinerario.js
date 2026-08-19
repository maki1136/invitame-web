/* ===== ITINERARIO DINÁMICO =====================================================

   QUÉ HACE
   El itinerario ya tenía su línea vertical y sus puntitos, pero aparecía todo de
   golpe. Ahora, a medida que el invitado baja:
     · la línea se va DIBUJANDO de arriba hacia abajo, siguiendo el scroll
     · cada momento (hora + título + descripción) ENTRA solo cuando le toca,
       uno atrás del otro
     · el puntito de cada momento hace un "pop" al llegar

   DOS ESTILOS
     · "izquierda" (el de siempre): la línea al costado, todo el texto a la derecha
     · "centro": la línea en el medio y los momentos alternando — uno a la
       izquierda, el siguiente a la derecha, en zigzag

   CÓMO SE ELIGE, hoy y mañana
     1. `document.body.dataset.tlEstilo = 'centro'`  ← por acá va a entrar el
        campo del panel cuando lo agreguemos a admin.html
     2. `?tl=centro` en la dirección  ← para probar sin tocar nada
     3. si no se dice nada: "izquierda"

   QUÉ NO TOCA
   Nada del diseño de origen: colores, tipografías y tamaños son los que ya
   estaban. La línea y los puntos también (.tl::before y .tl .it::before).

   ⚠️ SÓLO SE VE SI EL ITINERARIO ESTÁ CARGADO COMO LISTA.
   El motor esconde la lista (`.tl` queda en display:none) cuando la diseñadora
   cargó el itinerario como IMAGEN. (En `maria-y-diego` está cargado como imagen.)
   👁 Para verlo igual: `?itinerario=lista`. Muestra la lista sólo en esa visita,
   no cambia nada del evento ni de lo que ven los invitados.

   ACCESIBILIDAD
   Si la persona tiene activado "reducir movimiento" en su teléfono, se muestra
   todo quieto y completo.
   ============================================================================ */
(function () {
  'use strict';

  var PREVIEW = /[?&]itinerario=lista/.test(location.search);
  var ESTILO_URL = (location.search.match(/[?&]tl=(centro|izquierda)/) || [])[1];

  function estilo() {
    return ESTILO_URL || (document.body && document.body.dataset.tlEstilo) || 'izquierda';
  }

  var CSS = [
    /* ---------- común a los dos estilos ---------- */
    '.tl.tl-anim::before{opacity:.22}',
    '.tl.tl-anim .tl-prog{position:absolute;top:6px;bottom:6px;width:2px;',
    '  background:var(--verde);transform-origin:top center;transform:scaleY(0);',
    '  transition:transform .18s linear;border-radius:2px}',
    '.tl.tl-anim > .it{opacity:0;transition:opacity .8s ease,transform .8s cubic-bezier(.22,.72,.28,1)}',
    '.tl.tl-anim > .it.on{opacity:1}',
    '.tl.tl-anim > .it::before{transform:scale(.2);opacity:0;',
    '  transition:transform .55s cubic-bezier(.3,1.5,.5,1) .12s,opacity .35s ease .12s}',
    '.tl.tl-anim > .it.on::before{transform:scale(1);opacity:1}',

    /* ---------- estilo 1: la línea a la izquierda ---------- */
    '.tl.tl-anim:not(.tl-centro) .tl-prog{left:6px}',
    '.tl.tl-anim:not(.tl-centro) > .it{transform:translateY(26px)}',
    '.tl.tl-anim:not(.tl-centro) > .it.on{transform:none}',

    /* ---------- estilo 2: la línea al medio, en zigzag ---------- */
    '.tl.tl-centro{padding-left:0;text-align:left}',
    '.tl.tl-centro::before{left:50%;margin-left:-1px}',
    '.tl.tl-centro .tl-prog{left:50%;margin-left:-1px}',
    '.tl.tl-centro > .it{width:calc(50% - 20px);margin-bottom:22px}',

    /* los impares quedan a la izquierda de la línea, alineados a la derecha */
    '.tl.tl-centro > .it:nth-child(odd){margin-right:auto;text-align:right;',
    '  transform:translate(-14px,26px)}',
    '.tl.tl-centro > .it:nth-child(odd).on{transform:translate(0,0)}',
    '.tl.tl-centro > .it:nth-child(odd)::before{left:auto;right:-27px}',

    /* los pares quedan a la derecha, y suben para intercalarse */
    '.tl.tl-centro > .it:nth-child(even){margin-left:auto;text-align:left;',
    '  margin-top:-30px;transform:translate(14px,26px)}',
    '.tl.tl-centro > .it:nth-child(even).on{transform:translate(0,0)}',
    '.tl.tl-centro > .it:nth-child(even)::before{left:-27px}',

    /* ---------- si pidió menos movimiento ---------- */
    '@media(prefers-reduced-motion:reduce){',
    '  .tl.tl-anim > .it,.tl.tl-centro > .it:nth-child(odd),',
    '  .tl.tl-centro > .it:nth-child(even){opacity:1;transform:none}',
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

  var armados = [];

  function visible(el) {
    return el.offsetParent !== null && el.getBoundingClientRect().height > 0;
  }

  function aplicarEstilo(tl) {
    tl.classList.toggle('tl-centro', estilo() === 'centro');
  }

  function armar(tl) {
    aplicarEstilo(tl);
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

  /* la línea sigue al scroll */
  function dibujar() {
    var h = window.innerHeight || 800;
    armados.forEach(function (a) {
      var r = a.tl.getBoundingClientRect();
      var p = (h * 0.82 - r.top) / (r.height + h * 0.30);
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      a.prog.style.transform = 'scaleY(' + p.toFixed(3) + ')';

      /* red de seguridad por si el observador no corrió */
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

    if (window.MutationObserver) {
      new MutationObserver(buscar).observe(document.body, { childList: true, subtree: true });
      /* si el panel cambia el estilo en caliente, que se note */
      new MutationObserver(function () {
        [].forEach.call(document.querySelectorAll('.tl'), aplicarEstilo);
      }).observe(document.body, { attributes: true, attributeFilter: ['data-tl-estilo'] });
    }
    var n = 0, t = setInterval(function () { buscar(); if (++n > 40) clearInterval(t); }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
