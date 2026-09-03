/* ===== EL ITINERARIO DE PERLAS ================================================

   QUÉ PIDIÓ MAKI  (2/9/2026)

     «Hay que agregar el itinerario móvil, que no lo agregaste. ¿Se podrá hacer
      con perlas? ¿Qué opinás?»

   Y antes, en la lista de ideas: **«el itinerario va apareciendo»**.

   QUÉ HABÍA YA — importante, porque casi lo hago dos veces

   Antes de escribir una línea, lo medido en la invitación en vivo:

     · `/efectos/itinerario.js` YA hace que los momentos entren de a uno con el
       scroll y que la línea se dibuje de arriba hacia abajo. La parte de «va
       apareciendo» estaba hecha.
     · La colección Perlas YA había reemplazado la línea del itinerario
       (`.tl::before`) por una HEBRA DE PERLAS: 11 px de ancho, la foto de la
       perla repetida hacia abajo.

   Entonces, ¿qué faltaba? Esto:

     ⚠️ LA LÍNEA DE PROGRESO SEGUÍA SIENDO LA RAYITA VERDE.
        `.tl-prog` es una barra de 2 px pintada con `var(--verde)`. O sea que
        arriba del collar de perlas avanzaba una rayita de color, corrida un
        pelo. Se leía como un error de maquetado, no como un adorno.

   QUÉ HACE ESTE MÓDULO

   La que avanza con el scroll pasa a ser **la misma hebra de perlas**, pero
   encendida: las perlas ya recorridas se ven nítidas y con su brillo, y las que
   faltan quedan apagadas atrás. El collar se va enhebrando mientras se baja.

   ⚠️⚠️ POR QUÉ NO SE USA `scaleY`, QUE ERA LO OBVIO

   El módulo genérico dibuja el avance con `transform:scaleY(p)`. Sobre una
   línea de color eso está perfecto. Sobre una hebra de perlas NO: `scaleY`
   estira el elemento y, con él, la imagen de fondo. Al 30% de avance las perlas
   quedarían aplastadas como lentejas, y al 100% otra vez redondas. Se ve
   malísimo y encima cambia solo.

   Acá el avance se recorta con `clip-path: inset(...)`, que **corta** en vez de
   deformar: las perlas conservan su tamaño y su forma en todo el recorrido, y
   la última queda cortada al medio, como una cuenta que todavía no terminó de
   entrar en el hilo.
   → Por eso el módulo también apaga el `transform` que le pone el otro:
     `transform:none`. Si alguien lo saca, vuelven las lentejas.

   ⚠️ EL AVANCE SE CALCULA CON LA MISMA FÓRMULA QUE `itinerario.js`
      Está copiada a propósito, no importada: son dos módulos sueltos y no
      quiero que uno dependa del otro para arrancar. Si allá se cambia la
      fórmula, hay que cambiarla acá también, o la hebra encendida y los
      momentos que aparecen dejan de ir al mismo ritmo.
      Es el único pedazo duplicado de todo esto; está marcado abajo.

   DE DÓNDE SACA LA FOTO DE LA PERLA
   Del propio `.tl::before` que ya puso la colección, leyendo su
   `background-image`. Así no depende de qué archivo use la colección hoy: si
   mañana Perlas cambia la perla, la hebra encendida cambia sola.
   Si no encuentra ninguna, usa `window.INVPERLA`. Y si tampoco, no hace nada:
   queda el itinerario de siempre, con su rayita, sin romperse.

   CUÁNDO ACTÚA
   Sólo si la colección es **perlas**. En cualquier otra invitación no toca
   nada. No hace falta un interruptor nuevo en el panel: es parte del disfraz de
   la colección, igual que la hebra que ya estaba.

   ⚠️ Y SIGUE VALIENDO LA TRAMPA DE SIEMPRE:
      **el itinerario se esconde (`display:none`) si el evento lo tiene cargado
      como IMAGEN.** Con una foto puesta no se ve nada de esto, y no es un bug
      del módulo. Para probarlo sin tocar los datos: `?itinerario=lista`.

   ACCESIBILIDAD
   Con «reducir movimiento» la hebra se muestra entera y quieta.
   ============================================================================ */
(function () {
  'use strict';

  var ES_PREVIEW = (function () {
    try { return /[?&]preview/.test(location.search) || window.parent !== window; }
    catch (e) { return true; }
  })();

  function esPerlas() {
    try {
      var D = window.INVEV || {};
      var c = (D.fx && D.fx.coleccion) || D.coleccion || '';
      if (String(c).toLowerCase() === 'perlas') return true;
    } catch (e) {}
    /* la colección deja su marca en el html; sirve de respaldo */
    var m = document.documentElement.getAttribute('data-coleccion');
    return String(m || '').toLowerCase() === 'perlas';
  }

  /* La foto de la perla: la que ya está usando la hebra de fondo. */
  function fotoPerla(tl) {
    try {
      var bg = getComputedStyle(tl, '::before').backgroundImage || '';
      var m = bg.match(/url\((['"]?)(.*?)\1\)/);
      if (m && m[2]) return m[2];
    } catch (e) {}
    if (typeof window.INVPERLA === 'string' && window.INVPERLA) return window.INVPERLA;
    return '';
  }

  var ID = 'tl-perlas-css';

  function ponerEstilos(url) {
    var viejo = document.getElementById(ID);
    if (viejo && viejo.dataset.url === url) return;
    if (viejo) viejo.remove();

    var s = document.createElement('style');
    s.id = ID;
    s.dataset.url = url;
    s.textContent = [
      /* la hebra apagada, atrás: un poco más tenue que la de serie, para que
         se note la diferencia con la encendida */
      '.tl.tl-perlas::before{opacity:.16}',

      /* ⚠️ la hebra ENCENDIDA. Nada de scaleY: recorta, no deforma. */
      '.tl.tl-perlas .tl-prog{',
      '  transform:none!important;',
      '  top:6px;bottom:6px;',
      '  width:11px;border-radius:0;',
      '  background:transparent url("' + url + '") repeat-y center top;',
      '  background-size:11px auto;',
      '  filter:drop-shadow(0 1px 1px rgba(0,0,0,.12));',
      '  clip-path:inset(0 0 calc((1 - var(--tl-p,0)) * 100%) 0);',
      '  transition:none}',

      /* la hebra al costado (estilo «izquierda»): concéntrica con la de atrás */
      '.tl.tl-perlas:not(.tl-centro) .tl-prog{left:1.5px;margin-left:0}',

      /* y en el estilo «centro», centrada sobre la línea del medio */
      '.tl.tl-perlas.tl-centro .tl-prog{left:50%;margin-left:-5.5px}',

      /* si pidió menos movimiento: el collar entero, quieto */
      '@media(prefers-reduced-motion:reduce){',
      '  .tl.tl-perlas .tl-prog{clip-path:none}',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function listas() {
    return [].slice.call(document.querySelectorAll('.tl'));
  }

  function marcar() {
    if (!esPerlas()) return false;
    var hubo = false;
    listas().forEach(function (tl) {
      var url = fotoPerla(tl);
      if (!url) return;              /* sin perla no se inventa nada */
      ponerEstilos(url);
      tl.classList.add('tl-perlas');
      hubo = true;
    });
    return hubo;
  }

  /* ⚠️ COPIA DELIBERADA de la fórmula de /efectos/itinerario.js.
     Si allá cambia, acá también. Ver la nota del encabezado. */
  function avance(tl) {
    var h = window.innerHeight || 800;
    var r = tl.getBoundingClientRect();
    var p = (h * 0.82 - r.top) / (r.height + h * 0.30);
    return p < 0 ? 0 : (p > 1 ? 1 : p);
  }

  function dibujar() {
    listas().forEach(function (tl) {
      if (!tl.classList.contains('tl-perlas')) return;
      var p = ES_PREVIEW ? 1 : avance(tl);
      tl.style.setProperty('--tl-p', p.toFixed(3));
    });
  }

  var pedido = false;
  function alScroll() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () { pedido = false; dibujar(); });
  }

  function revisar() {
    marcar();
    dibujar();
  }

  function arrancar() {
    revisar();
    addEventListener('scroll', alScroll, { passive: true });
    addEventListener('resize', alScroll);
    addEventListener('message', function () { setTimeout(revisar, 80); });

    /* el motor y el panel repintan el sector: hay que volver a marcarlo */
    if (window.MutationObserver) {
      new MutationObserver(function () { setTimeout(revisar, 60); })
        .observe(document.body, { childList: true, subtree: true });
    }

    if (ES_PREVIEW) {
      setInterval(revisar, 800);
    } else {
      var n = 0, t = setInterval(function () { revisar(); if (++n > 40) clearInterval(t); }, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
