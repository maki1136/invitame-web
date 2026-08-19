/* ===== ITINERARIO DINÁMICO =====================================================

   QUÉ HACE
   La línea del itinerario se va DIBUJANDO de arriba hacia abajo siguiendo el
   scroll, y cada momento (hora + título + descripción) ENTRA cuando le toca,
   uno atrás del otro. El puntito de cada momento hace un "pop" al llegar.

   DOS ESTILOS
     izquierda · la línea al costado, todo el texto a la derecha (el de siempre)
     centro    · la línea en el medio y los momentos alternando en zigzag

   CÓMO SE ELIGE (panel → body → dirección web)
     estilo / tl    izquierda · centro
   O sea: `INVEV.fx.itinerario.estilo`, o `body.dataset.tlEstilo`, o `?tl=centro`.

   ⚠️ SÓLO SE VE SI EL ITINERARIO ESTÁ CARGADO COMO LISTA.
   El motor esconde la lista (`display:none`) cuando se cargó como IMAGEN.
   👁 Para verlo igual: `?itinerario=lista` (sólo para esa visita).

   ⭐ SE REARMA SOLO SI EL PANEL REPINTA
   En la vista previa el panel vuelve a dibujar la lista con cada cambio, y eso
   se lleva puesta la línea de progreso. Antes quedaba a medias: con la
   animación puesta pero sin línea. Ahora se detecta y se rearma.

   ACCESIBILIDAD
   Con "reducir movimiento" activado se muestra todo quieto y completo.
   ============================================================================ */
(function () {
  'use strict';

  var PREVIEW_LISTA = /[?&]itinerario=lista/.test(location.search);
  var URLP = new URLSearchParams(location.search);

  var ES_PREVIEW = (function () {
    try { return /[?&]preview/.test(location.search) || window.parent !== window; }
    catch (e) { return true; }
  })();

  function delPanel(k) {
    try {
      var c = window.INVEV && window.INVEV.fx && window.INVEV.fx.itinerario;
      if (!c) return null;
      var v = c[k];
      return (v === undefined || v === null || v === '') ? null : v;
    } catch (e) { return null; }
  }

  function estilo() {
    var p = delPanel('estilo');
    if (p) return String(p).toLowerCase() === 'centro' ? 'centro' : 'izquierda';
    var d = document.body && document.body.dataset ? document.body.dataset.tlEstilo : null;
    if (d) return String(d).toLowerCase() === 'centro' ? 'centro' : 'izquierda';
    var u = URLP.get('tl');
    if (u) return String(u).toLowerCase() === 'centro' ? 'centro' : 'izquierda';
    return 'izquierda';
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

    '.tl.tl-centro > .it:nth-child(odd){margin-right:auto;text-align:right;',
    '  transform:translate(-14px,26px)}',
    '.tl.tl-centro > .it:nth-child(odd).on{transform:translate(0,0)}',
    '.tl.tl-centro > .it:nth-child(odd)::before{left:auto;right:-27px}',

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

  function forzarLista() {
    if (!PREVIEW_LISTA) return;
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

  function momentos(tl) {
    return [].filter.call(tl.children, function (c) {
      return c.classList && c.classList.contains('it');
    });
  }

  /* ¿está entero, o el panel repintó y quedó a medias? */
  function estaEntero(tl) {
    if (!tl.__tlListo) return false;
    if (!tl.querySelector('.tl-prog')) return false;
    var its = momentos(tl);
    if (!its.length) return false;
    if (!its[its.length - 1].style.transitionDelay) return false;
    return true;
  }

  function olvidar(tl) {
    for (var i = armados.length - 1; i >= 0; i--) {
      if (armados[i].tl === tl) armados.splice(i, 1);
    }
  }

  function aplicarEstilo(tl) {
    tl.classList.toggle('tl-centro', estilo() === 'centro');
  }

  function armar(tl) {
    aplicarEstilo(tl);
    if (!visible(tl)) return;
    if (estaEntero(tl)) return;

    var items = momentos(tl);
    if (!items.length) return;

    olvidar(tl);
    tl.__tlListo = true;
    tl.classList.add('tl-anim');

    var prog = tl.querySelector('.tl-prog');
    if (!prog) {
      prog = document.createElement('i');
      prog.className = 'tl-prog';
      tl.appendChild(prog);
    }

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

  function dibujar() {
    var h = window.innerHeight || 800;
    armados.forEach(function (a) {
      if (!a.prog.isConnected) return;
      var r = a.tl.getBoundingClientRect();
      var p = (h * 0.82 - r.top) / (r.height + h * 0.30);
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      a.prog.style.transform = 'scaleY(' + p.toFixed(3) + ')';

      if (p > 0.02) {
        a.items.forEach(function (it) {
          if (!it.classList.contains('on') && it.getBoundingClientRect().top < h * 0.88) {
            it.classList.add('on');
          }
        });
      }
      if (ES_PREVIEW) a.items.forEach(function (it) { it.classList.add('on'); });
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
    dibujar();
  }

  function arrancar() {
    ponerEstilos();
    buscar();
    addEventListener('scroll', alScroll, { passive: true });
    addEventListener('resize', alScroll);
    addEventListener('message', function () { setTimeout(buscar, 60); });

    if (window.MutationObserver) {
      new MutationObserver(buscar).observe(document.body, { childList: true, subtree: true });
      new MutationObserver(function () {
        [].forEach.call(document.querySelectorAll('.tl'), aplicarEstilo);
      }).observe(document.body, { attributes: true, attributeFilter: ['data-tl-estilo'] });
    }

    if (ES_PREVIEW) {
      setInterval(buscar, 700);
    } else {
      var n = 0, t = setInterval(function () { buscar(); if (++n > 40) clearInterval(t); }, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
