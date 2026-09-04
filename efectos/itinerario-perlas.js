/* ===== EL ITINERARIO DE PERLAS ================================================

   QUÉ PIDIÓ MAKI  (2/9/2026)

     «Hay que agregar el itinerario móvil, que no lo agregaste. ¿Se podrá hacer
      con perlas? ¿Qué opinás?»

   Y antes, en la lista de ideas: **«el itinerario va apareciendo»**.

   QUÉ HABÍA YA — importante, porque casi lo hago dos veces

     · `/efectos/itinerario.js` YA hace que los momentos entren de a uno con el
       scroll y que la línea se dibuje de arriba hacia abajo.
     · La colección Perlas YA había reemplazado la línea del itinerario
       (`.tl::before`) por una HEBRA DE PERLAS.

   Lo que faltaba: **la línea de progreso no existía en Perlas.** `.tl-prog` es
   la barra de 2 px pintada con `var(--verde)`; al lado de un collar quedaba
   como una rayita de color mal puesta, así que la colección la había apagado
   con `display:none`. Resultado: en Perlas el itinerario no marcaba avance.

   Este módulo la vuelve a encender convertida en **la misma hebra, iluminada**.

   ★★★ Y DESPUÉS HUBO QUE AFINARLA  (4/9/2026)

     Maki: «se corrió, las perlas del itinerario se superponen».

     MEDIDO, y eran dos cosas a la vez:

       la hebra          perlas de 11 px, centrada en x = 7
       la perla de cada
       momento (.it::before)  17 px, centrada en x = 6

     O sea: **casi el mismo tamaño** —se veían amontonadas, no como un collar
     con su cuenta— y encima **con los ejes corridos un píxel**, que es lo que
     ella vio como "se corrió".

     → Ahora la hebra va con perlas de **7 px** y centrada en el **mismo eje**
       que la perla del momento. Queda hilo fino con una cuenta más grande en
       cada hora, que es como se lee un collar de verdad.
     → Los dos números están arriba, en `HILO` y `EJE_X`. Si algún día cambia
       el tamaño de la perla del momento, hay que mover `EJE_X` con ella:
       el eje se calcula como  (left de .it::before) + (su ancho / 2).

   ★★★ Y TODAVÍA FALTABA LA MITAD  (4/9/2026, más tarde)

     Maki, otra vez: «las perlas del itinerario volvieron a estar mal».

     Los ejes estaban perfectos —medido, 0 px de desfase—, así que el problema
     era otro: **el ORDEN EN QUE SE DIBUJAN**. Ver la nota grande abajo, en la
     regla del `z-index`.

     → La lección, que ya está escrita más abajo pero conviene tenerla acá:
       que dos cosas estén en el mismo eje no quiere decir que se vean bien.
       Hay que mirar cuál se dibuja encima de cuál.

   ⚠️⚠️ POR QUÉ NO SE USA `scaleY`, QUE ERA LO OBVIO

   El módulo genérico dibuja el avance con `transform:scaleY(p)`. Sobre una
   línea de color está perfecto. Sobre una hebra de perlas NO: `scaleY` estira
   la imagen de fondo y las perlas quedan aplastadas como lentejas al 30% de
   avance, y redondas otra vez al 100%.

   Acá el avance se recorta con `clip-path: inset(...)`, que **corta** en vez de
   deformar: las perlas conservan su forma en todo el recorrido y la última
   queda cortada al medio, como una cuenta que todavía no terminó de entrar.
   → Por eso el módulo también apaga el `transform` del otro: `transform:none`.

   ⚠️⚠️ LAS DOS TRAMPAS DE ESPECIFICIDAD

   La primera versión se subió y no pasaba nada, aunque el CSS estaba bien.
   Preguntando en la consola qué regla ganaba aparecieron las dos culpables:

       html[data-coleccion="perlas"][data-col-perla] .tl .tl-prog
           { display:none !important }
       html[data-coleccion="perlas"][data-col-perla] .tl::before
           { opacity:1 !important }

   Dos atributos en el `html` más dos clases. Contra eso no alcanza repetir la
   clase. → Cada regla se escribe DOS VECES: suelta y con el MISMO prefijo que
   usa la colección más nuestra clase, que así queda por encima.

   → Y la lección de fondo: **cuando el CSS "no hace nada", no hay que releerlo.
     Hay que preguntarle al navegador qué regla ganó.**

   DE DÓNDE SACA LA FOTO DE LA PERLA
   Del propio `.tl::before` que ya puso la colección. Si no encuentra ninguna,
   usa `window.INVPERLA`. Y si tampoco, no hace nada.

   ⚠️ EL AVANCE SE CALCULA CON LA MISMA FÓRMULA QUE `itinerario.js`
      Está copiada a propósito, no importada. Si allá cambia, acá también.

   CUÁNDO ACTÚA
   Sólo si la colección es **perlas**.

   ⚠️ Y SIGUE VALIENDO LA TRAMPA DE SIEMPRE: el itinerario se esconde si el
      evento lo tiene cargado como IMAGEN. Para probarlo: `?itinerario=lista`.
      Los momentos se cargan desde el bloque «El itinerario» del panel.
   ============================================================================ */
(function () {
  'use strict';

  /* el mismo prefijo que usa la colección para sus reglas !important */
  var PRE = 'html[data-coleccion="perlas"][data-col-perla] ';

  /* ★ el hilo. Ver la nota «y después hubo que afinarla». */
  var HILO  = 7;     /* diámetro de las perlas del hilo, en px */
  var EJE_X = 2.5;   /* left del hilo, para que su centro caiga en x = 6,
                        que es donde está el centro de la perla del momento */

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
    var m = document.documentElement.getAttribute('data-coleccion');
    return String(m || '').toLowerCase() === 'perlas';
  }

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
    return sel + '{' + cuerpo + '}\n' + PRE + sel + '{' + cuerpo + '}';
  }

  function ponerEstilos(url) {
    var viejo = document.getElementById(ID);
    if (viejo && viejo.dataset.url === url) return;
    if (viejo) viejo.remove();

    /* la hebra fina, común a la apagada y a la encendida */
    var fino =
      'width:' + HILO + 'px!important;' +
      'left:' + EJE_X + 'px!important;' +
      'margin-left:0!important;' +
      'background-size:' + HILO + 'px ' + HILO + 'px!important;';

    var hebra =
      'display:block!important;' +
      'transform:none!important;' +                 /* nada de scaleY: deforma */
      'position:absolute!important;top:6px!important;bottom:6px!important;' +
      'border-radius:0!important;' +
      'background:transparent url("' + url + '") repeat-y center top!important;' +
      fino +
      'filter:drop-shadow(0 1px 1px rgba(0,0,0,.12))!important;' +
      'clip-path:inset(0 0 calc((1 - var(--tl-p,0)) * 100%) 0)!important;' +
      'transition:none!important';

    var s = document.createElement('style');
    s.id = ID;
    s.dataset.url = url;
    s.textContent = [
      /* la hebra apagada, atrás: fina y en el mismo eje */
      dosVeces('.tl.tl-perlas::before', 'opacity:.20!important;' + fino),

      /* la hebra ENCENDIDA */
      dosVeces('.tl.tl-perlas .tl-prog', hebra),

      /* ⚠️ LA PERLA DE CADA MOMENTO VA ARRIBA DEL HILO  (4/9/2026)
         `.tl-prog` es el ÚLTIMO hijo de `.tl`, y los dos —los momentos y la
         hebra— están posicionados con `z-index:auto`. Con z-index automático
         gana el ORDEN DEL DOM, así que la hebra encendida se dibujaba ENCIMA
         de las perlas grandes: se veían las cuentas chicas pasando por dentro
         de cada perla y quedaba un montoncito en vez de una perla ensartada.
         Maki: «las perlas del itinerario se superponen».
         No alcanza con moverlo en el DOM (el motor lo vuelve a crear): hay que
         decir el orden a mano. */
      dosVeces('.tl.tl-perlas > .it', 'z-index:2!important'),
      dosVeces('.tl.tl-perlas .tl-prog', 'z-index:1!important'),

      /* en el estilo «centro» el hilo va sobre la línea del medio */
      dosVeces('.tl.tl-perlas.tl-centro .tl-prog',
               'left:50%!important;margin-left:-' + (HILO / 2) + 'px!important'),
      dosVeces('.tl.tl-perlas.tl-centro::before',
               'left:50%!important;margin-left:-' + (HILO / 2) + 'px!important'),

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
      if (!url) return;
      ponerEstilos(url);
      tl.classList.add('tl-perlas');
      asegurarProg(tl);
      hubo = true;
    });
    return hubo;
  }

  /* ⚠️ COPIA DELIBERADA de la fórmula de /efectos/itinerario.js. */
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
