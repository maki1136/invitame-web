/* ===== EL CHEQUEO DE UNA MUESTRA ============================================

   POR QUE EXISTE
   Maki, 20/9/2026:

     «me hiciste hacer una skill de chequeo, donde la skill dice claramente que
      las personas, cuando son tres, tienen que estar una pegada a la otra, y
      que siempre cometas el mismo error... no me estás dando una forma de
      solución de que no vuelva a pasar nunca más»

   Y tiene razón. Las dos skills —la de armado y la de entrega— DESCRIBEN las
   reglas, pero no había nada que las COMPROBARA. Una regla que vive sólo en un
   documento depende de que yo me acuerde de leerla antes de entregar, y ya
   quedó demostrado que eso no alcanza: Personas en dos filas salió tres veces.

   Acá las reglas dejan de ser un texto y pasan a ser pruebas que corren solas
   adentro de la invitación.

   CÓMO SE CORRE
     https://invitame.littlemomentsok.com/i/?e=<id>&chequeo=1
     o, con la invitación abierta, en la consola:  INVCHEQUEO.correr()

   Devuelve `{ pasa, fallas[], detalle[] }` y lo imprime en una tabla.
   `INVCHEQUEO.correr()` es async: espera a que las secciones terminen de
   aparecer antes de medir.

   ⚠️ NO CORRE PARA EL INVITADO. Sin `?chequeo=1` el módulo no hace nada: sólo
   deja `window.INVCHEQUEO` colgado para poder llamarlo a mano.

   ⚠️ ESTO NO REEMPLAZA MIRAR. La medición encuentra candidatos; la pantalla
   decide. Lo que sí hace es que los errores que YA nos costaron caros no se
   puedan volver a entregar sin que salte una FALLA.

   ══════════════════════════════════════════════════════════════════════════
   LAS DOS TRAMPAS DE MEDICIÓN QUE YA SE PAGARON Y ESTÁN RESUELTAS ACÁ
   ══════════════════════════════════════════════════════════════════════════

   1. `color(srgb 0.92 0.91 0.94)`. Chrome devuelve los colores así cada vez
      más seguido. Leerlos con una expresión regular de números da [0,0,0]:
      casi negro. Un barrido con ese bug reporta ilegible todo lo que está
      perfecto. (Es el error 3 de `reglas-duras.js`.)
      → `aRGB()` deja que parsee el navegador, con un canvas de 1x1.

   2. LA OPACIDAD DE PASO. Las secciones entran con `.reveal`. Si se mide en
      mitad del fundido, un texto plata al 50% sobre negro da un gris medio que
      no llega al piso. Medido así, «Una carta para ti», «Cómo va a ser la
      noche» y «Dónde quedarte» daban falla y estaban perfectos.
      (Es el error 26 de `reglas-duras.js`.)
      → Si el elemento se está animando, su opacidad real es a la que va a
        llegar: 1.
   ============================================================================ */
(function () {
  'use strict';

  /* ---- herramientas de medición ------------------------------------------ */

  var LIENZO = null;
  function ctx() {
    if (!LIENZO) {
      var c = document.createElement('canvas');
      c.width = 1; c.height = 1;
      LIENZO = c.getContext('2d', { willReadFrequently: true });
    }
    return LIENZO;
  }

  /* ★ TRAMPA 1: que parsee el navegador, no una expresión regular. */
  function aRGB(txt) {
    var s = String(txt || '').trim();
    if (!s || s === 'none' || s === 'transparent' || s === 'currentcolor') return null;
    var x = ctx();
    if (!x) return null;
    try {
      x.clearRect(0, 0, 1, 1);
      x.fillStyle = '#000000';
      x.fillStyle = s;
      if (x.fillStyle === '#000000' &&
          !/^#0{3,8}$|black|rgba?\(\s*0\s*,\s*0\s*,\s*0/i.test(s)) return null;
      x.globalCompositeOperation = 'copy';
      x.fillRect(0, 0, 1, 1);
      x.globalCompositeOperation = 'source-over';
      var d = x.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    } catch (e) { return null; }
  }

  function lum(c) {
    var r = [c[0], c[1], c[2]].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
  }

  function contraste(a, b) {
    var L1 = lum(a), L2 = lum(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  function mezcla(f, b) {
    var a = f[3] === undefined ? 1 : f[3];
    return [f[0] * a + b[0] * (1 - a), f[1] * a + b[1] * (1 - a), f[2] * a + b[2] * (1 - a), 1];
  }

  /* ★ TRAMPA 2: un elemento que aparece se mide con la opacidad a la que VA. */
  function seAnima(el) {
    var cs = getComputedStyle(el);
    if (cs.animationName && cs.animationName !== 'none') return true;
    return /opacity|all/.test(cs.transitionProperty || '') &&
           (parseFloat(cs.transitionDuration) || 0) > 0;
  }

  function opacidadReal(el) {
    if (seAnima(el)) return 1;
    var o = parseFloat(getComputedStyle(el).opacity);
    return (!isFinite(o) || o > 1) ? 1 : o;
  }

  /* ⚠️⚠️ NO ALCANZA CON QUE MIDA. El motor deja en el DOM nodos de la boda de
     ejemplo y bloques a medio armar que TIENEN tamaño y no se ven. Medidos en
     lupita-mis15: seis botones "crema" que resultaron ser copias invisibles.
     `checkVisibility` mira la cadena entera (display, visibility, opacity,
     content-visibility) y es lo único que no se deja engañar. */
  /* ⚠⚠ LA GEOMETRÍA NO DEPENDE DE LA OPACIDAD. Una tarjeta de Personas a
     opacidad 0 (todavía no se reveló) ocupa EXACTAMENTE su lugar en el grid: la
     fila se puede medir igual. Si se le exige opacidad, la regla no encuentra
     nada y no puede decir si están en una fila o en dos — que es justo lo que
     hay que comprobar.
     → `ubicable()` para las reglas de POSICIÓN, `visible()` para las de COLOR. */
  function ubicable(el) {
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    var r = el.getBoundingClientRect();
    return r.width > 3 && r.height > 3;
  }

  function visible(el) {
    if (el.checkVisibility) {
      try {
        /* ⚠ SIN `contentVisibilityAuto`: esa opción devuelve false para todo lo
           que está FUERA DE PANTALLA, y acá se mide la invitación entera, no el
           pedazo que se ve. Con ella puesta, Personas y el itinerario daban
           "0 elementos" y las reglas cantaban OK sin haber mirado nada. */
        if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
      } catch (e) {}
    }
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    var r = el.getBoundingClientRect();
    return r.width > 3 && r.height > 3;
  }

  /* el fondo real: se corta en el marco, como hace reglas-duras (su error 16) */
  function fondoDe(el) {
    var marco = document.querySelector('.frame');
    var n = el;
    while (n && n !== document.documentElement) {
      var c = aRGB(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.85) return c;
      if (n === marco) break;
      n = n.parentElement;
    }
    var v = '';
    try { v = getComputedStyle(document.documentElement).getPropertyValue('--lino'); } catch (e) {}
    return aRGB(v) || [255, 255, 255, 1];
  }

  function textos() {
    var marco = document.querySelector('.frame');
    if (!marco) return [];
    var out = [];
    var nodos = marco.querySelectorAll('*');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el.children.length) continue;
      if (!(el.textContent || '').trim()) continue;
      if (!visible(el)) continue;
      out.push(el);
    }
    return out;
  }

  function coleccion() {
    try {
      var ev = window.INVEV || {};
      return String((ev.fx && ev.fx.coleccion) || '').toLowerCase();
    } catch (e) { return ''; }
  }

  function esOscura() {
    var p = fondoDe(document.querySelector('.frame') || document.body);
    return lum(p) < 0.25;
  }

  function corto(el, n) {
    return (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, n || 34);
  }

  /* ---- LAS REGLAS --------------------------------------------------------- */

  var REGLAS = [];
  function regla(id, titulo, fn) { REGLAS.push({ id: id, titulo: titulo, fn: fn }); }

  /* 1 ·························································· PERSONAS
     Maki lo marcó tres veces. La causa siempre fue la misma y nunca fue el
     lugar: `.padres` es un grid con DOS columnas fijas (`168px 168px`), así
     que la tercera persona cae sola en un segundo renglón. */
  regla('personas-una-fila', 'Personas: todas en la misma línea', function () {
    var cont = document.querySelector('.padres');
    if (!cont) return { pasa: true, nota: 'esta invitación no tiene Personas' };
    var tar = [].slice.call(cont.children).filter(ubicable);
    /* ⚠⚠ NO SE MARCA OK LO QUE NO SE PUDO MIRAR. Es el error 13 de
       `reglas-duras`: un caché sin invalidación no es una optimización, es un
       bug que se esconde de sus propias pruebas. Si el bloque EXISTE y no se
       pudieron medir las tarjetas, eso es una FALLA, no un aprobado. */
    if (!tar.length && cont.children.length) {
      return { pasa: false, nota: 'hay ' + cont.children.length + ' persona(s) en el DOM y ninguna se pudo medir' };
    }
    if (tar.length < 2) return { pasa: true, nota: tar.length + ' persona(s)' };
    var tops = tar.map(function (t) { return Math.round(t.getBoundingClientRect().top); });
    var filas = tops.filter(function (v, i, a) { return a.indexOf(v) === i; }).length;
    return {
      pasa: filas === 1,
      nota: tar.length + ' personas en ' + filas + ' fila(s)' +
            (filas === 1 ? '' : ' — grid: ' + getComputedStyle(cont).gridTemplateColumns),
      detalle: tops
    };
  });

  /* 2 ························································ LA FAMILIA
     «mirá bien los colores de los textos, le pifiaste feo ahí.» En Disco
     aparecieron azul acero, lila, crema y marrón; y después nueve sobretítulos
     dorados. Una colección declara SU familia en `window.INVCOLPALETA`: si un
     texto usa un tono que no pertenece a ella, es un color colado. */
  regla('familia-de-color', 'Ningún color de texto fuera de la familia', function () {
    var col = coleccion();
    if (!col) return { pasa: true, nota: 'sin colección activa: no hay familia que exigir' };
    var pal = window.INVCOLPALETA || {};
    var fam = [];
    Object.keys(pal).forEach(function (k) {
      var c = aRGB(pal[k]);
      if (c) fam.push(c);
    });
    if (!fam.length) return { pasa: true, nota: 'la colección no declaró paleta' };

    var colados = [];
    textos().forEach(function (el) {
      var cs = getComputedStyle(el);
      var c = aRGB(cs.webkitTextFillColor) || aRGB(cs.color);
      if (!c) return;
      /* ¿está a menos de 40 de distancia de algún color de la familia? */
      var cerca = fam.some(function (f) {
        return Math.abs(f[0] - c[0]) + Math.abs(f[1] - c[1]) + Math.abs(f[2] - c[2]) < 110;
      });
      /* un gris puro siempre pasa: no aporta tono ajeno */
      var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]);
      if (mx - mn < 22) cerca = true;
      if (!cerca) colados.push(corto(el, 26) + ' → rgb(' + c.slice(0, 3).map(Math.round) + ')');
    });
    return {
      pasa: colados.length === 0,
      nota: colados.length + ' texto(s) con un color fuera de la familia',
      detalle: colados.slice(0, 12)
    };
  });

  /* 3 ······················································· RECORTADO
     Dos formas de cortar un texto, y las dos aparecieron:
       · overflow: la caja esconde lo que sobra.
       · line-height MENOR que la letra: las bajas («g», «y», «p») se salen del
         renglón y se meten en el texto de abajo. Fue el caso del sobretítulo
         en Rouge Script con `line-height:.9`. */
  regla('texto-recortado', 'Ningún texto recortado', function () {
    var malos = [];
    textos().forEach(function (el) {
      var cs = getComputedStyle(el);
      if (el.scrollHeight > el.clientHeight + 3 && /hidden|clip/.test(cs.overflowY)) {
        malos.push(corto(el) + ' (overflow)');
      }
      if (el.scrollWidth > el.clientWidth + 2 && /hidden|clip/.test(cs.overflowX)) {
        malos.push(corto(el) + ' (ancho)');
      }
      /* ⚠️ EL RENGLÓN CORTO SÓLO CORTA SI LA LETRA TIENE BAJAS.
         La cuenta regresiva («236», «22», «49») va con line-height igual al
         cuerpo y no se corta nada: los dígitos no bajan de la línea de base.
         El caso real era el sobretítulo en Rouge Script con `line-height:.9`
         y la «g» de «gran». Se exige las DOS cosas: que haya una baja y que
         el renglón sea claramente más corto que la letra. */
      var conBajas = /[gjpqyçQ]/.test(el.textContent || "");
      var px = parseFloat(cs.fontSize) || 0;
      var lh = parseFloat(cs.lineHeight);
      if (conBajas && px > 0 && isFinite(lh) && lh < px * 0.95) {
        malos.push(corto(el) + ' (renglón ' + Math.round(lh) + 'px < letra ' + Math.round(px) + 'px)');
      }
    });
    return { pasa: malos.length === 0, nota: malos.length + ' texto(s) recortado(s)', detalle: malos.slice(0, 12) };
  });

  /* 4 ····························································· CRUDOS
     «no quiero que se vea el reproductor de video como habíamos hablado.» */
  regla('sin-crudos', 'Ningún reproductor a la vista', function () {
    var malos = [];
    /* ⚠️⚠️ ANTES DECÍA `.frame video`, Y EL QUE SE VEÍA ESTABA AFUERA.
       Medido el 20/9/2026. Maki: «se sigue viendo el reproductor al principio
       con el sobre». Esta regla daba VERDE igual, por dos motivos a la vez:
         1) sólo miraba adentro de `.frame`, y el video del FONDO vive en
            `#inv-fondo`, que está afuera. Nunca lo examinó.
         2) la condición era un Y: un video sin `controlslist` pasaba si tenía
            `pointer-events:none`. Justamente el caso del fondo.
       Ahora se miran TODOS los <video> de la página, estén donde estén, y se
       exigen las CINCO protecciones. Los iframes siguen scopeados al marco. */
    [].forEach.call(document.querySelectorAll('.frame iframe, video'), function (m) {
      if (!visible(m)) return;
      var caja = m.parentElement;
      var tapada = caja && (caja.querySelector('.rd-tapa') || caja.querySelector('.col-vtapa'));
      var src = (m.getAttribute('src') || '') + (m.currentSrc || '');
      /* ⚠️ LOS MAPAS NACEN SIN `src`: `acordeon.js` se lo pone recién cuando el
         invitado abre el acordeón, para no bajarlos de entrada. Si se mira sólo
         `src`, un mapa todavía sin cargar parece un iframe crudo. */
      src += (m.getAttribute("data-src") || "");
      var esMapa = /google\.com\/maps|maps\.google/.test(src);
      if (esMapa) return;                       /* el mapa SÍ se muestra */
      if (m.tagName === 'VIDEO') {
        /* Las cinco. Falta UNA y está mal: en Safari y en iOS cada una destapa
           algo distinto (el PLAY, el PiP, el AirPlay, el menú de descarga). */
        var falta = [];
        if (m.hasAttribute('controls'))                  falta.push('controls');
        if (!m.hasAttribute('controlslist'))             falta.push('controlslist');
        if (!m.hasAttribute('disablepictureinpicture'))  falta.push('PiP');
        if (!m.hasAttribute('disableremoteplayback'))    falta.push('AirPlay');
        if (getComputedStyle(m).pointerEvents !== 'none') falta.push('pointer-events');
        if (falta.length) {
          var quien = m.id ? '#' + m.id : ((m.currentSrc || m.src || '?').split('/').pop().slice(0, 28));
          malos.push('video sin blindar (' + quien + '): falta ' + falta.join(', '));
        }
        return;
      }
      if (!tapada) malos.push('iframe sin tapa: ' + src.slice(0, 40));
    });
    return { pasa: malos.length === 0, nota: malos.length + ' reproductor(es) crudo(s)', detalle: malos };
  });

  /* 5 ··························································· SÍMBOLO
     «no me está gustando el tema de los circulitos.» Si la invitación tiene
     itinerario, cada momento tiene que estar marcado con el símbolo de SU
     temática. `simbolo-tematica.js` firma en `html[data-simbolo]`. */
  regla('simbolo-tematica', 'El itinerario lleva el símbolo de la temática', function () {
    var tl = document.querySelector('.tl');
    if (!tl) return { pasa: true, nota: 'esta invitación no tiene itinerario' };
    if (!ubicable(tl)) return { pasa: false, nota: 'hay itinerario en el DOM y no se pudo medir' };
    var it = tl.querySelector('.it');
    var img = it ? getComputedStyle(it, '::before').backgroundImage : '';

    /* ⭐ DOS CAMINOS VÁLIDOS, Y ESTA REGLA ACEPTA LOS DOS.
       Hasta el 20/9/2026 exigía un SVG sí o sí, porque la marca siempre había
       sido el símbolo vectorial de `simbolo-tematica.js`. Ese día Disco pasó a
       traer su PROPIA marca: la bola de espejos FOTOGRAFIADA. El módulo del
       símbolo se corre solo (ve `data-marca-propia` en el <html>) y entonces
       no hay `data-simbolo` — y la regla daba FALLA con la marca perfecta
       puesta. Una regla que grita con todo bien enseña a ignorarla, que es
       peor que no tenerla.
       ⚠ Lo que hay que comprobar no es CÓMO está hecha la marca: es que NO sea
         el circulito de fábrica. */
    var propia = document.documentElement.getAttribute('data-marca-propia') || '';
    if (propia) {
      var conFoto = /url\(/.test(img);
      return {
        pasa: conFoto,
        nota: 'marca propia de la colección «' + propia + '»' +
              (conFoto ? ' — foto puesta' : ' — DECLARADA pero sin foto')
      };
    }

    var firma = document.documentElement.getAttribute('data-simbolo') || '';
    if (!firma) return { pasa: false, nota: 'no hay símbolo: la marca es el circulito de fábrica' };
    return {
      pasa: /svg/.test(img),
      nota: firma + (/svg/.test(img) ? ' — dibujado' : ' — declarado pero NO dibujado')
    };
  });

  /* 6 ················································· SUPERFICIES CLARAS
     «quedó como el orto» era esto: el molde claro del motor asomando abajo de
     una temática negra. La hoja de la carta, las bandas, la tapa del video.
     En una colección oscura no puede quedar ninguna superficie clara suelta. */
  regla('sin-parches-claros', 'Ninguna superficie clara suelta', function () {
    if (!coleccion()) return { pasa: true, nota: 'sin colección activa' };
    if (!esOscura()) return { pasa: true, nota: 'la colección no es oscura' };
    var malos = [];
    [].forEach.call(document.querySelectorAll('.frame *'), function (el) {
      if (!visible(el)) return;
      var cs = getComputedStyle(el);
      var c = aRGB(cs.backgroundColor);
      if (!c || c[3] < 0.85) return;
      var r = el.getBoundingClientRect();
      /* ⚠️ UN BOTÓN CLARO NO ES UN PARCHE: ES DISEÑO. Y el fondo del QR tiene
         que ser claro o no se escanea. Lo que busca esta regla son PANELES del
         molde claro asomando, no piezas que alguien eligió. */
      if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
      if (el.closest && el.closest(".pasecard")) return;
      if (r.width * r.height < 12000) return;       /* piezas chicas: no cuentan */
      if (lum(c) > 0.5) {
        malos.push((el.className || el.tagName) + ' rgb(' + c.slice(0, 3).map(Math.round) + ')');
      }
    });
    return { pasa: malos.length === 0, nota: malos.length + ' superficie(s) clara(s)', detalle: malos.slice(0, 10) };
  });

  /* 7 ························································· CONTRASTE
     El piso no es WCAG, es «se lee»: 5,0 normal y 4,0 grande, un escalón
     arriba de la norma. Mismo criterio que `reglas-duras.js`. */
  regla('contraste', 'Todos los textos se leen', function () {
    var malos = [];
    textos().forEach(function (el) {
      var cs = getComputedStyle(el);
      var fg = aRGB(cs.webkitTextFillColor) || aRGB(cs.color);
      if (!fg) return;
      /* ⚠ LA FECHA DEBAJO DE LA RASPADITA ES PLATA SOBRE PLATA A PROPÓSITO:
         está TAPADA hasta que el invitado raspa. Medirla da 1,19 y es correcto. */
      if (el.closest && el.closest('.scratch-sec, .scratchcard')) return;
      var bg = fondoDe(el);
      var a = opacidadReal(el) * (fg[3] === undefined ? 1 : fg[3]);
      var v = contraste(mezcla([fg[0], fg[1], fg[2], a], bg), bg);
      var px = parseFloat(cs.fontSize) || 14;
      var grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      var min = grande ? 4.0 : 5.0;
      if (v < min) malos.push(corto(el, 28) + ' → ' + v.toFixed(2) + ' (piso ' + min + ')');
    });
    return {
      pasa: malos.length === 0,
      nota: malos.length + ' texto(s) por debajo del piso — MIRARLOS antes de creerles',
      detalle: malos.slice(0, 12)
    };
  });

  /* 8 ·························································· BOTONES
     «Ver hoteles: la flecha abre y no hay información.» Un control que no
     lleva a ningún lado es peor que no tenerlo. */
  regla('botones-vivos', 'Ningún control que no haga nada', function () {
    var malos = [];
    [].forEach.call(document.querySelectorAll('.frame button, .frame a'), function (b) {
      if (!visible(b)) return;
      var href = b.getAttribute && b.getAttribute('href');
      var hrefOk = href && href !== '#' && href !== 'javascript:void(0)';
      var onc = b.getAttribute && b.getAttribute('onclick');
      var cl = ' ' + String(b.className || '') + ' ';
      /* los que el motor maneja por delegación o por clase conocida */
      var conocido = /acc-btn|mitad|rsvp|tv-btn|nav|chev|rd-tapa/.test(cl);
      if (!hrefOk && !onc && !conocido && b.tagName === 'A') {
        malos.push(corto(b, 24) + ' (enlace sin destino)');
      }
    });
    return { pasa: malos.length === 0, nota: malos.length + ' control(es) muerto(s)', detalle: malos.slice(0, 10) };
  });

  /* ---- el corredor -------------------------------------------------------- */

  /* Las secciones entran con `.reveal` al hacer scroll. Si se mide sin haber
     bajado, la mitad de la invitación no existe todavía. Bajamos entera, y
     recién ahí medimos. */
  function recorrer() {
    return new Promise(function (listo) {
      var se = document.scrollingElement || document.documentElement;
      var alto = se.scrollHeight, paso = Math.max(300, (window.innerHeight || 700) * 0.7);
      var y = 0;
      var t = setInterval(function () {
        y += paso;
        se.scrollTop = y;
        if (y >= alto) {
          clearInterval(t);
          setTimeout(function () { se.scrollTop = 0; setTimeout(listo, 900); }, 700);
        }
      }, 140);
    });
  }

  function correr(opts) {
    opts = opts || {};
    /* ⚠️⚠️⚠️ LA SÉPTIMA FORMA EN QUE UNA MEDICIÓN MIENTE, Y LA PEOR.
       Una pestaña OCULTA no pinta. Las transiciones no avanzan y se quedan
       clavadas en el valor de partida: el 20/9/2026 diez botones medían crema
       —el color del molde claro— y apenas se tomó una captura, que obliga a
       pintar, los diez pasaron a grafito. Ni un `style` inline con !important
       los movía, porque lo que devolvía `getComputedStyle` era el valor de una
       transición congelada, no la cascada.
       Es la misma familia que la ventana minimizada del banco de pruebas.
       → Con la pestaña oculta NO se mide: lo que salga es mentira. */
    /* ⚠ EL ESCAPE, PARA CUANDO SE CORRE DESDE UNA HERRAMIENTA.
       Un asistente que maneja el navegador por control remoto trabaja con la
       pestaña en segundo plano: `visibilityState` dice "hidden" aunque cada
       captura obligue a pintar. Para ese caso: INVCHEQUEO.correr({forzar:true}).
       Lo que NO cambia: si se fuerza, los colores medidos pueden ser los de
       partida de una transición. Se avisa y se deja constancia en el informe. */
    if (document.hidden && opts.forzar) {
      try { console.warn("CHEQUEO: pestaña oculta y se forzó igual. Los colores pueden mentir."); } catch (e) {}
    } else if (document.hidden) {
      var aviso = { pasa: false, fallas: ["pestaña-oculta"], detalle: [{
        regla: "pestaña-oculta", titulo: "La pestaña tiene que estar A LA VISTA",
        pasa: false,
        nota: "una pestaña oculta no pinta: las transiciones quedan congeladas y " +
              "todos los colores que se midan van a ser los de partida. Traela al " +
              "frente y volvé a correr el chequeo."
      }] };
      try { console.warn("CHEQUEO: la pestaña está oculta. No se midió nada."); } catch (e) {}
      window.__CHEQUEO = aviso;
      return Promise.resolve(aviso);
    }

    var hacer = function () {
      var detalle = REGLAS.map(function (r) {
        var res;
        try { res = r.fn(); }
        catch (e) { res = { pasa: false, nota: 'la regla se rompió: ' + e.message }; }
        return { regla: r.id, titulo: r.titulo, pasa: !!res.pasa, nota: res.nota || '', detalle: res.detalle || null };
      });
      var fallas = detalle.filter(function (d) { return !d.pasa; });
      var out = { pasa: fallas.length === 0, fallas: fallas.map(function (f) { return f.regla; }), detalle: detalle };
      try {
        console.log('%cCHEQUEO DE MUESTRA — ' + (out.pasa ? 'PASA' : 'FALLA (' + fallas.length + ')'),
                    'font-weight:bold;font-size:13px;color:' + (out.pasa ? '#0a0' : '#c00'));
        console.table(detalle.map(function (d) {
          return { regla: d.titulo, estado: d.pasa ? 'ok' : 'FALLA', nota: d.nota };
        }));
        fallas.forEach(function (f) { if (f.detalle) console.log('  ' + f.regla + ':', f.detalle); });
      } catch (e) {}
      window.__CHEQUEO = out;
      return out;
    };
    if (opts.sinRecorrer) return Promise.resolve(hacer());
    return recorrer().then(hacer);
  }

  window.INVCHEQUEO = { correr: correr, reglas: REGLAS, aRGB: aRGB, contraste: contraste };

  /* sólo con ?chequeo=1. Para el invitado este archivo no hace nada. */
  try {
    if (/[?&]chequeo=1/.test(location.search)) {
      var arranque = function () { setTimeout(function () { correr(); }, 4000); };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', arranque, { once: true });
      } else { arranque(); }
    }
  } catch (e) {}
})();
