/* ===== EL REGALO DE PERLAS  ==================================================

   QUÉ PIDIÓ MAKI  (4/9/2026)

     «En la mesa de regalos… se puede hacer, como hiciste con los corazones de
      perlas, algo así pero para la mesa de regalos.»
     «Yo no decía de poner esa bandeja, esa bandeja no me gusta. Lo que decía
      es poner algo con perlas, tipo un regalo con perlas, DIBUJADO, así como
      hiciste con los corazones de perlas.»

   O sea: no una foto de un objeto. **Un dibujo hecho con perlas.**

   ============================================================================
   LA TÉCNICA, MEDIDA EN LA INVITACIÓN ANTES DE ESCRIBIR NADA

   Los corazones no son una imagen: son un contenedor con perlitas sueltas
   puestas una al lado de la otra sobre un recorrido. Medido en vivo:

       .mtv.mtv-corazones     146 × 81 px, position:relative, centrado
       84 hijos `.p`          7 × 7 px, border-radius 50%,
                              la foto de la perla como fondo, background-size 100%

   Acá es lo mismo. Lo único que cambia es EL RECORRIDO: en vez de dos
   corazones, una caja de regalo con su cinta y su moño.

   ⚠️ POR QUÉ ESTO SÍ SE DIBUJA CON LA PERLA REPETIDA, y la guirnalda no.
      «Una foto chica repetida muchas veces se lee como dibujo» es un DEFECTO
      para una pieza protagonista —Maki lo vio en la guirnalda de la portada—
      pero acá es exactamente lo que se busca. La perla repetida sirve en CHICO.

   ============================================================================
   EL RECORRIDO

   Todo en una caja de 146 × 116.

       la caja       rectángulo cerrado, de (18,56) a (128,106)
       la cinta      línea vertical por el medio, de (73,56) a (73,106)
       el moño       dos lazos elípticos sobre la tapa, inclinados hacia afuera

   Cada tramo se recorre POR SEPARADO: si se concatenaran en una sola tira,
   entre la caja y el moño quedaría un salto con perlas mal espaciadas.

   ⚠️ El nudo lleva dos perlas encimadas a mano: es el único lugar donde el
      espaciado parejo deja un hueco, porque ahí se cruzan tres recorridos.

   ============================================================================
   ⚠️⚠️ POR QUÉ ESTE MÓDULO ES TAN INSISTENTE  (4/9/2026)

   Costó hacerlo aparecer, y las dos vueltas que costó valen anotarlas:

   1) `revisar()` empezaba con `if (!esPerlas()) return true;`
      Ese `true` quiere decir «listo, no hay nada que hacer». Pero en el primer
      tic `INVEV` está vacío y el `<html>` todavía no tiene la marca de la
      colección: `esPerlas()` daba falso **porque todavía no se sabía**. El
      ciclo se cortaba antes de que llegaran los datos.
      → Es el mismo error del atajo del sobre en `sobre-catalogo.js`:
        **un "no" temprano no es un "no".**

   2) Aun arreglado eso, evaluado a mano en la consola dibujaba perfecto y
      cargado como `<script>` desde la lista no aparecía. Y el archivo servido
      era el correcto — medido con `performance.getEntriesByType('resource')`,
      mismo `encodedBodySize`. O sea: no era el código ni la caché. Era CUÁNDO
      corre, y quién le borra el nodo después.
      ⚠️ `colecciones/perlas.js` **se vuelve a pasar sola cada 400 ms** y puede
         llevarse puesto lo que otro módulo agregó a una sección.

   → Por eso ahora:
       · el ciclo NO se apaga a los 20 segundos;
       · un `MutationObserver` vuelve a poner el regalo si alguien lo borra;
       · y queda `window.__INVREGALO` con lo que fue pasando, para poder
         PREGUNTARLE al navegador en vez de adivinar la próxima vez.

   ============================================================================
   DÓNDE VA, Y UN HALLAZGO

   Va en la sección «Mesa de regalos», centrado, arriba de los botones.

   ⚠️ HALLAZGO: **los corazones ya estaban ahí.** `.mtv-corazones` es el último
      hijo de esa misma sección, no del cierre de la invitación como decía la
      nota vieja. Dos motivos de perlas en la misma sección se leen como que
      sobra uno.
      → En ESA sección los corazones se apagan. **No se borran**: el nodo queda.
      → Si Maki prefiere los dos, se saca la línea que los esconde.
   ============================================================================ */
(function () {

  var ANCHO = 146;
  var ALTO  = 116;
  var PERLA = 7;
  var PASO  = 7.6;

  /* rastro, para poder diagnosticar sin adivinar */
  var log = { corrio: true, dibujado: 0, borrado: 0, ultimo: '' };
  try { window.__INVREGALO = log; } catch (e) {}

  function esPerlas() {
    try {
      var D = window.INVEV || {};
      var c = (D.fx && D.fx.coleccion) || D.coleccion || '';
      if (String(c).toLowerCase() === 'perlas') return true;
    } catch (e) {}
    var m = document.documentElement.getAttribute('data-coleccion');
    return String(m || '').toLowerCase() === 'perlas';
  }

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

  function rect(x1, y1, x2, y2) {
    return [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
  }

  function elipse(cx, cy, rx, ry, giro, n) {
    var pts = [], i, co = Math.cos(giro), si = Math.sin(giro);
    for (i = 0; i <= n; i++) {
      var a = (i / n) * Math.PI * 2;
      var x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      pts.push([cx + x * co - y * si, cy + x * si + y * co]);
    }
    return pts;
  }

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
    var t = [];
    t = t.concat(sembrar(rect(18, 56, 128, 106), PASO));
    t = t.concat(sembrar([[73, 56], [73, 106]], PASO));
    t = t.concat(sembrar(elipse(50, 38, 23, 15, -0.38, 40), PASO));
    t = t.concat(sembrar(elipse(96, 38, 23, 15, 0.38, 40), PASO));
    t.push([73, 53]);
    t.push([73, 47]);
    return t;
  }

  function laSeccion() {
    var secs = document.querySelectorAll('section');
    for (var i = 0; i < secs.length; i++) {
      var h = secs[i].querySelector('h2, h3');
      if (h && /mesa de regalos|regalos/i.test(h.textContent || '')) return secs[i];
    }
    return null;
  }

  function dibujar(sec, url) {
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

    var kick = sec.querySelector('.kick');
    var h = sec.querySelector('h2, h3');
    var ancla = (kick && kick.parentNode === sec) ? kick
              : ((h && h.parentNode === sec) ? h : null);
    if (ancla) sec.insertBefore(caja, ancla.nextSibling);
    else sec.insertBefore(caja, sec.firstChild);

    [].forEach.call(sec.querySelectorAll('.mtv-corazones'), function (c) {
      c.style.display = 'none';
    });

    log.dibujado++;
    log.ultimo = 'dibujado';
    return true;
  }

  /* Pone el regalo si falta. Devuelve true sólo si está puesto. */
  function asegurar() {
    if (!esPerlas()) { log.ultimo = 'no es perlas todavia'; return false; }

    var sec = laSeccion();
    if (!sec) { log.ultimo = 'sin seccion'; return false; }

    var ya = sec.querySelector('.mtv-regalo');
    if (ya && ya.isConnected) return true;
    if (log.dibujado > 0) log.borrado++;   /* estaba y no está: alguien lo borró */

    var url = fotoPerla();
    if (!url) { log.ultimo = 'sin perla'; return false; }

    return dibujar(sec, url);
  }

  function arrancar() {
    asegurar();

    /* ⚠️ NO se apaga: la colección repinta cada 400 ms y puede borrarlo. */
    setInterval(asegurar, 700);

    if (window.MutationObserver) {
      new MutationObserver(function () { asegurar(); })
        .observe(document.body, { childList: true, subtree: true });
    }
    addEventListener('message', function () { setTimeout(asegurar, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
