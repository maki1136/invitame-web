/* ===== ITINERARIO DINÁMICO =====================================================

   QUÉ HACE
   La línea del itinerario se va DIBUJANDO de arriba hacia abajo siguiendo el
   scroll, y cada momento (hora + título + descripción) ENTRA cuando le toca,
   uno atrás del otro. La marca de cada momento hace un "pop" al llegar.

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

   ══════════════════════════════════════════════════════════════════════════
   ★★★ LOS DOS ERRORES DEL ZIGZAG  (18/9/2026)
   ══════════════════════════════════════════════════════════════════════════

   Maki, mirando la muestra de la playa:

     «La línea que estás poniendo con los puntos es desagradable directamente.
      Está mal hecho, está horrible. El fondo está lindo, el cuadrado está
      bien, los textos están bien, pero la línea con los puntitos da lástima.
      No tiene nada que ver con lo que venimos haciendo. Ponerlo más en el
      medio, hacerlo más lindo, poner unas palabras de un lado y otras de
      otro, como hiciste en otros que lo resolviste muy bien.»

   ERROR 1 — LOS MOMENTOS SE AMONTONABAN.
     El zigzag apretaba las filas con `margin-top:-30px` fijo en los pares.
     Treinta píxeles alcanzan cuando TODOS los momentos miden lo mismo, o sea
     cuando todos tienen descripción. En la playa «22:00 · Baile» no tiene, y
     mide un renglón menos: su marca y la del momento siguiente terminaban casi
     pegadas, una encima de la otra. Se veía un error, no un diseño.
     → Fuera el margen negativo fijo. Cada momento ocupa su propio renglón y
       alterna de lado. Nunca se pisan, tenga descripción o no.

   ERROR 2 — LA MARCA ERA UN PUNTITO LLENO DEL COLOR DEL SECTOR.
     Un disco sólido de 8 px en el verde del sector. En Perlas la marca de cada
     momento es una PERLA —un objeto de la temática— y por eso ahí quedó bien.
     Acá era un bullet de lista.
     → Ahora la marca es un anillo fino: relleno del papel, borde de 1,5 px en
       la tinta de la temática y un halo muy tenue alrededor. Se lee como una
       pieza de papelería, no como una viñeta.

   ⚠️ LOS COLORES SALEN DE `fx.tematica`, NO DE LA PALETA DEL SECTOR.
      Es la misma regla que el vestido básico: cada boda pone su tinta. Si el
      evento no declaró temática, se usa `currentColor`, que es lo que hacía
      antes — así ninguna invitación vieja cambia de aspecto sola.

   ⚠️ Y LA LÍNEA TAMBIÉN. Era de 2 px en `var(--verde)`, el verde del motor,
      aunque la boda fuera azul o arena. Ahora toma la misma tinta.
   ══════════════════════════════════════════════════════════════════════════ */
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

  /* ---- la tinta de ESTA boda ------------------------------------------- */
  function tema() {
    try { return (((window.INVEV || {}).fx) || {}).tematica || {}; }
    catch (e) { return {}; }
  }

  /* Pinta las tres variables que usan la marca y la línea.
     Se vuelve a llamar por unos segundos porque la temática llega de Firestore
     DESPUÉS que este archivo. */
  function ponerTinta() {
    var t = tema();
    var raiz = document.documentElement;
    var tinta = t.tinta || '';
    if (tinta) {
      raiz.style.setProperty('--tl-tinta', tinta);
      raiz.style.setProperty('--tl-halo', 'color-mix(in srgb, ' + tinta + ' 14%, transparent)');
    } else {
      raiz.style.setProperty('--tl-tinta', 'currentColor');
      raiz.style.setProperty('--tl-halo', 'transparent');
    }
    raiz.style.setProperty('--tl-papel', t.papelColor || '#fbf9f5');
  }

  var CSS = [
    /* ---------- común a los dos estilos ---------- */
    '.tl.tl-anim::before{opacity:.18;background:var(--tl-tinta)}',
    '.tl.tl-anim .tl-prog{position:absolute;top:6px;bottom:6px;width:1.5px;',
    '  background:var(--tl-tinta);transform-origin:top center;transform:scaleY(0);',
    '  transition:transform .18s linear;border-radius:2px;opacity:.55}',
    '.tl.tl-anim > .it{opacity:0;transition:opacity .8s ease,transform .8s cubic-bezier(.22,.72,.28,1)}',
    '.tl.tl-anim > .it.on{opacity:1}',

    /* ---------- LA MARCA: un anillo, no un puntito lleno ---------- */
    '.tl.tl-anim > .it::before{',
    '  width:11px!important;height:11px!important;',
    '  box-sizing:border-box!important;border-radius:50%!important;',
    '  background:var(--tl-papel)!important;',
    '  border:1.5px solid var(--tl-tinta)!important;',
    '  box-shadow:0 0 0 4px var(--tl-halo)!important;',
    '  transform:scale(.2);opacity:0;',
    '  transition:transform .55s cubic-bezier(.3,1.5,.5,1) .12s,opacity .35s ease .12s}',
    '.tl.tl-anim > .it.on::before{transform:scale(1);opacity:1}',

    /* ---------- estilo 1: la línea a la izquierda ---------- */
    '.tl.tl-anim:not(.tl-centro) .tl-prog{left:6px}',
    '.tl.tl-anim:not(.tl-centro) > .it{transform:translateY(26px)}',
    '.tl.tl-anim:not(.tl-centro) > .it.on{transform:none}',

    /* ---------- estilo 2: la línea al medio, en zigzag ----------
       ⚠️ SIN margen negativo. Cada momento ocupa su renglón y alterna de lado:
          con o sin descripción, las marcas nunca se pisan. */
    '.tl.tl-centro{padding-left:0;text-align:left}',
    '.tl.tl-centro::before{left:50%;margin-left:-1px}',
    '.tl.tl-centro .tl-prog{left:50%;margin-left:-.75px}',
    '.tl.tl-centro > .it{width:calc(50% - 26px);margin-bottom:20px;',
    '  min-height:46px;display:flex;flex-direction:column;justify-content:center}',
    '.tl.tl-centro > .it:last-child{margin-bottom:0}',

    '.tl.tl-centro > .it:nth-child(odd){margin-right:auto;text-align:right;',
    '  align-items:flex-end;transform:translate(-14px,26px)}',
    '.tl.tl-centro > .it:nth-child(odd).on{transform:translate(0,0)}',
    '.tl.tl-centro > .it:nth-child(odd)::before{left:auto;right:-31px;top:50%;margin-top:-5.5px}',

    '.tl.tl-centro > .it:nth-child(even){margin-left:auto;text-align:left;',
    '  align-items:flex-start;transform:translate(14px,26px)}',
    '.tl.tl-centro > .it:nth-child(even).on{transform:translate(0,0)}',
    '.tl.tl-centro > .it:nth-child(even)::before{left:-31px;top:50%;margin-top:-5.5px}',

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
    ponerTinta();
    forzarLista();
    [].forEach.call(document.querySelectorAll('.tl'), armar);
    dibujar();
  }

  function arrancar() {
    ponerTinta();
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

    /* ⚠️ la temática llega DESPUÉS: se repasa unos segundos */
    var k = 0, tk = setInterval(function () { ponerTinta(); if (++k > 24) clearInterval(tk); }, 250);

    if (ES_PREVIEW) {
      setInterval(buscar, 700);
    } else {
      var n = 0, t = setInterval(function () { buscar(); if (++n > 40) clearInterval(t); }, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
