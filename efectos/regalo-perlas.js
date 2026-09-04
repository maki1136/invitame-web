/* ===== EL REGALO DE PERLAS  ==================================================

   QUÉ PIDIÓ MAKI  (4/9/2026)

     «En la mesa de regalos, donde piden la plata… se puede hacer, como hiciste
      con los corazones de perlas, algo así pero para la mesa de regalos.»

   Y después, cuando propuse la bandeja de plata que estaba sin usar:

     «Yo no decía de poner esa bandeja, esa bandeja no me gusta, ya está. Yo lo
      que decía es poner algo con perlas, tipo un regalo con perlas, DIBUJADO,
      así como hiciste con los corazones de perlas.»

   O sea: no una foto de un objeto. **Un dibujo hecho con perlas.**

   ============================================================================
   LA TÉCNICA, MEDIDA EN LA INVITACIÓN ANTES DE ESCRIBIR NADA

   Los corazones no son una imagen: son un contenedor con perlitas sueltas
   puestas una al lado de la otra sobre un recorrido. Medido en vivo:

       .mtv.mtv-corazones     146 × 81 px, position:relative, centrado
       84 hijos `.p`          7 × 7 px, border-radius 50%,
                              la foto de la perla como fondo, background-size 100%

   Este módulo hace exactamente lo mismo. Lo único que cambia es EL RECORRIDO:
   en vez de dos corazones, una caja de regalo con su cinta y su moño.

   ⚠️ POR QUÉ ESTO SÍ SE PUEDE DIBUJAR CON LA PERLA REPETIDA, y la guirnalda no.
      La regla anotada en `efectos/index.js` dice: «una foto chica repetida
      muchas veces se lee como dibujo». Para una pieza PROTAGONISTA eso es un
      defecto —Maki lo vio enseguida en la guirnalda de la portada—, pero acá
      es justamente lo que se busca: un dibujito hecho de perlas, chico, como
      los corazones. La perla repetida sirve en CHICO.

   ============================================================================
   EL RECORRIDO

   Todo en una caja de 146 × 116, que es el tamaño en el que la perla de 7 px
   se lee como cuenta y no como punto.

       la caja       rectángulo cerrado, de (18,56) a (128,106)
       la cinta      línea vertical por el medio, de (73,56) a (73,106)
       el moño       dos lazos elípticos apoyados sobre la tapa, inclinados
                     hacia afuera, que se juntan en el nudo (73,54)

   Cada tramo se recorre por separado y se le van poniendo perlas cada `PASO`
   píxeles. Se recorre POR SEPARADO a propósito: si se concatenaran todos los
   tramos en una sola tira, entre la caja y el moño quedaría un salto con
   perlas espaciadas raro.

   ⚠️ El nudo lleva dos perlas encimadas a mano: es el único lugar donde el
      espaciado parejo deja un hueco, porque ahí se cruzan tres recorridos.

   ============================================================================
   DÓNDE VA, Y UN HALLAZGO

   Va en la sección «Mesa de regalos», centrado, arriba de los botones.

   ⚠️ HALLAZGO: **los corazones ya estaban ahí.** `.mtv-corazones` es el último
      hijo de esa misma sección, no del cierre de la invitación como decía la
      nota vieja. Con el regalo puesto quedaban dos motivos de perlas en la
      misma sección, y eso se lee como que sobra uno.
      → En ESA sección los corazones se apagan. **No se borran**: el nodo queda,
        así que si algún día se los quiere llevar al cierre de verdad, están.
      → Si Maki prefiere los dos, se saca la línea que los esconde.

   ⚠️ SÓLO ACTÚA EN LA COLECCIÓN PERLAS. En otra colección no hay perla que
      repetir y no tendría sentido.
   ============================================================================ */
(function () {

  var ANCHO = 146;   /* el mismo que los corazones */
  var ALTO  = 116;
  var PERLA = 7;     /* medido en los corazones */
  var PASO  = 7.6;   /* cada cuánto se pone una perla, a lo largo del recorrido */

  function esPerlas() {
    try {
      var D = window.INVEV || {};
      var c = (D.fx && D.fx.coleccion) || D.coleccion || '';
      if (String(c).toLowerCase() === 'perlas') return true;
    } catch (e) {}
    var m = document.documentElement.getAttribute('data-coleccion');
    return String(m || '').toLowerCase() === 'perlas';
  }

  /* La foto de la perla: se lee de una perla que ya esté puesta, así siempre
     es la misma que usa el resto de la colección. Si no hay ninguna todavía,
     se usa el material directo. */
  function fotoPerla() {
    var p = document.querySelector('.mtv .p');
    if (p) {
      var bg = getComputedStyle(p).backgroundImage || '';
      var m = bg.match(/url\((['"]?)(.*?)\1\)/);
      if (m && m[2]) return m[2];
    }
    if (typeof window.INVPERLA === 'string' && window.INVPERLA) return window.INVPERLA;
    return '';
  }

  /* ---- los recorridos ---- */

  function rect(x1, y1, x2, y2) {
    return [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
  }

  /* una elipse inclinada, para cada lazo del moño */
  function elipse(cx, cy, rx, ry, giro, n) {
    var pts = [], i, a, co = Math.cos(giro), si = Math.sin(giro);
    for (i = 0; i <= n; i++) {
      a = (i / n) * Math.PI * 2;
      var x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      pts.push([cx + x * co - y * si, cy + x * si + y * co]);
    }
    return pts;
  }

  /* recorre una polilínea y devuelve puntos cada `paso` píxeles */
  function sembrar(pts, paso) {
    var out = [], resto = 0, i;
    for (i = 0; i < pts.length - 1; i++) {
      var ax = pts[i][0], ay = pts[i][1];
      var bx = pts[i + 1][0], by = pts[i + 1][1];
      var dx = bx - ax, dy = by - ay;
      var largo = Math.sqrt(dx * dx + dy * dy);
      if (largo < 0.001) continue;
      var d = resto;
      while (d <= largo) {
        out.push([ax + (dx * d) / largo, ay + (dy * d) / largo]);
        d += paso;
      }
      resto = d - largo;
    }
    return out;
  }

  function puntos() {
    var todos = [];

    /* la caja */
    todos = todos.concat(sembrar(rect(18, 56, 128, 106), PASO));

    /* la cinta por el medio */
    todos = todos.concat(sembrar([[73, 56], [73, 106]], PASO));

    /* los dos lazos del moño, inclinados hacia afuera */
    todos = todos.concat(sembrar(elipse(50, 38, 23, 15, -0.38, 40), PASO));
    todos = todos.concat(sembrar(elipse(96, 38, 23, 15, 0.38, 40), PASO));

    /* el nudo: ahí se cruzan tres recorridos y queda un hueco */
    todos.push([73, 53]);
    todos.push([73, 47]);

    return todos;
  }

  function dibujar(sec, url) {
    if (sec.querySelector('.mtv-regalo')) return true;

    var caja = document.createElement('div');
    caja.className = 'mtv mtv-regalo';
    caja.setAttribute('aria-hidden', 'true');
    caja.style.cssText =
      'position:relative;width:' + ANCHO + 'px;height:' + ALTO + 'px;' +
      'margin:30px auto 10px;pointer-events:none';

    puntos().forEach(function (p) {
      var b = document.createElement('span');
      b.className = 'p';
      b.style.cssText =
        'position:absolute;width:' + PERLA + 'px;height:' + PERLA + 'px;' +
        'left:' + (p[0] - PERLA / 2).toFixed(2) + 'px;' +
        'top:'  + (p[1] - PERLA / 2).toFixed(2) + 'px;' +
        'border-radius:50%;background-size:100% 100%;background-repeat:no-repeat;' +
        'background-image:url("' + url.replace(/"/g, '%22') + '")';
      caja.appendChild(b);
    });

    /* arriba de todo de la sección, después del título si lo hay */
    var h = sec.querySelector('h2, h3');
    var kick = sec.querySelector('.kick');
    var ancla = kick || h;
    if (ancla && ancla.parentNode === sec) sec.insertBefore(caja, ancla.nextSibling);
    else sec.insertBefore(caja, sec.firstChild);

    /* ⚠️ los corazones ya estaban en esta misma sección: se apagan acá, no se
       borran. Ver la nota del encabezado. */
    [].forEach.call(sec.querySelectorAll('.mtv-corazones'), function (c) {
      c.style.display = 'none';
    });

    return true;
  }

  function laSeccion() {
    var secs = document.querySelectorAll('section');
    for (var i = 0; i < secs.length; i++) {
      var h = secs[i].querySelector('h2, h3');
      if (h && /mesa de regalos|regalos/i.test(h.textContent || '')) return secs[i];
    }
    return null;
  }

  function revisar() {
    if (!esPerlas()) return true;          /* no es asunto nuestro */
    var sec = laSeccion();
    if (!sec) return false;
    var url = fotoPerla();
    if (!url) return false;
    return dibujar(sec, url);
  }

  function arrancar() {
    if (revisar()) return;
    var n = 0;
    var t = setInterval(function () {
      if (revisar() || ++n > 80) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
