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

     ⚠️ LA LÍNEA DE PROGRESO NO EXISTÍA EN PERLAS.
        `.tl-prog` es la barra de 2 px pintada con `var(--verde)` que marca
        hasta dónde llegaste. Al lado de un collar de perlas quedaba como una
        rayita de color mal puesta, así que **la colección la había apagado con
        `display:none`**. Solución razonable en su momento, pero el resultado
        era que en Perlas el itinerario no marcaba ningún avance: la hebra
        estaba siempre igual, entera y quieta.

   QUÉ HACE ESTE MÓDULO

   Vuelve a encender esa línea, pero convertida en **la misma hebra de perlas**,
   iluminada: las perlas ya recorridas se ven nítidas y con su brillo, y las que
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

   ⚠️⚠️⚠️ LA PELEA DE ESPECIFICIDAD, QUE COSTÓ DOS VUELTAS ENTERAS

   Este módulo se subió, se miró la pantalla y NO PASABA NADA. Dos veces. El CSS
   estaba bien escrito las dos veces. Lo que faltaba era ir a buscar, en la
   consola, **qué regla estaba ganando**. Recorriendo `document.styleSheets`
   aparecieron las dos culpables, las dos de la colección:

       html[data-coleccion="perlas"][data-col-perla] .tl .tl-prog
           { display:none !important }
       html[data-coleccion="perlas"][data-col-perla] .tl::before
           { opacity:1 !important }

   O sea: **dos atributos en el `html` más dos clases**. Contra eso no alcanza
   repetir la clase (`.tl-perlas.tl-perlas`), que es el truco que sirve para
   empatar contra otro módulo pero no contra un prefijo con atributos.

   → La solución es escribir cada regla DOS VECES: una suelta (por si la
     colección se aplicó sin esos atributos, o si mañana cambian) y otra con el
     MISMO prefijo que usa la colección más nuestra clase, que así queda
     estrictamente por encima.
   → Y el `display` se fuerza además **inline con prioridad** desde JS
     (`setProperty('display','block','important')`), que le gana a cualquier
     hoja de estilos sin depender de contar puntos.

   → La lección de fondo, que ya está anotada en `efectos/index.js` y se volvió
     a pagar acá: **cuando el CSS "no hace nada", no hay que releerlo. Hay que
     preguntarle al navegador qué regla ganó.**

   DE DÓNDE SACA LA FOTO DE LA PERLA
   Del propio `.tl::before` que ya puso la colección, leyendo su
   `background-image`. Así no depende de qué archivo use la colección hoy: si
   mañana Perlas cambia la perla, la hebra encendida cambia sola.
   Si no encuentra ninguna, usa `window.INVPERLA`. Y si tampoco, no hace nada:
   queda el itinerario de siempre, sin romperse.

   ⚠️ El `background-size` es `11px 11px` EXACTO, igual que el de la hebra de
      atrás. Con `11px auto` las dos hileras quedan con perlas de distinto alto
      y no coinciden: se ve doble.

   ⚠️ EL AVANCE SE CALCULA CON LA MISMA FÓRMULA QUE `itinerario.js`
      Está copiada a propósito, no importada: son dos módulos sueltos y no
      quiero que uno dependa del otro para arrancar. Si allá se cambia la
      fórmula, hay que cambiarla acá también, o la hebra encendida y los
      momentos que aparecen dejan de ir al mismo ritmo.

   CUÁNDO ACTÚA
   Sólo si la colección es **perlas**. En cualquier otra invitación no toca
   nada. No hace falta un interruptor nuevo en el panel: es parte del disfraz de
   la colección, igual que la hebra que ya estaba.

   ⚠️ Y SIGUE VALIENDO LA TRAMPA DE SIEMPRE:
      **el itinerario se esconde (`display:none`) si el evento lo tiene cargado
      como IMAGEN.** Con una foto puesta no se ve nada de esto, y no es un bug
      del módulo. Para probarlo sin tocar los datos: `?itinerario=lista`.
      Los momentos se cargan desde el bloque «El itinerario» del panel.

   ACCESIBILIDAD
   Con «reducir movimiento» la hebra se muestra entera y quieta.
   ============================================================================ */
(function () {
  'use strict';

  /* el mismo prefijo que usa la colección para sus reglas !important */
  var PRE = 'html[data-coleccion="perlas"][data-col-perla] ';

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

  /* cada regla, dos veces: suelta y con el prefijo de la colección */
  function dosVeces(sel, cuerpo) {
    return sel.replace(/(^|,\s*)/g, '$1') + '{' + cuerpo + '}\n' +
           PRE + sel + '{' + cuerpo + '}';
  }

  function ponerEstilos(url) {
    var viejo = document.getElementById(ID);
    if (viejo && viejo.dataset.url === url) return;
    if (viejo) viejo.remove();

    var hebra =
      'display:block!important;' +
      'transform:none!important;' +                 /* nada de scaleY: deforma */
      'position:absolute!important;top:6px!important;bottom:6px!important;' +
      'width:11px!important;border-radius:0!important;' +
      'background:transparent url("' + url + '") repeat-y center top!important;' +
      'background-size:11px 11px!important;' +
      'filter:drop-shadow(0 1px 1px rgba(0,0,0,.12))!important;' +
      'clip-path:inset(0 0 calc((1 - var(--tl-p,0)) * 100%) 0)!important;' +
      'transition:none!important';

    var s = document.createElement('style');
    s.id = ID;
    s.dataset.url = url;
    s.textContent = [
      /* la hebra apagada, atrás */
      dosVeces('.tl.tl-perlas::before', 'opacity:.20!important'),

      /* la hebra ENCENDIDA */
      dosVeces('.tl.tl-perlas .tl-prog', hebra),

      /* al costado (estilo «izquierda»): concéntrica con la de atrás */
      dosVeces('.tl.tl-perlas:not(.tl-centro) .tl-prog',
               'left:1.5px!important;margin-left:0!important'),

      /* y en el estilo «centro», sobre la línea del medio */
      dosVeces('.tl.tl-perlas.tl-centro .tl-prog',
               'left:50%!important;margin-left:-5.5px!important'),

      /* si pidió menos movimiento: el collar entero, quieto */
      '@media(prefers-reduced-motion:reduce){',
      dosVeces('.tl.tl-perlas .tl-prog', 'clip-path:none!important'),
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function listas() {
    return [].slice.call(document.querySelectorAll('.tl'));
  }

  /* La línea de progreso la crea `itinerario.js`. Si no está, se pone una.
     ⚠️ El display se fuerza inline CON PRIORIDAD: es lo único que le gana con
        seguridad al `display:none !important` de la colección. */
  function asegurarProg(tl) {
    var p = tl.querySelector('.tl-prog');
    if (!p) {
      p = document.createElement('i');
      p.className = 'tl-prog';
      tl.appendChild(p);
    }
    if (p.style.getPropertyPriority('display') !== 'important') {
      p.style.setProperty('display', 'block', 'important');
    }
    return p;
  }

  function marcar() {
    if (!esPerlas()) return false;
    var hubo = false;
    listas().forEach(function (tl) {
      var url = fotoPerla(tl);
      if (!url) return;              /* sin perla no se inventa nada */
      ponerEstilos(url);
      tl.classList.add('tl-perlas');
      asegurarProg(tl);
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
