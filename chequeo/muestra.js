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
   LAS TRES TRAMPAS DE MEDICIÓN QUE YA SE PAGARON Y ESTÁN RESUELTAS ACÁ
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

   3. UN TEXTO SOBRE UNA FOTO NO SE PUEDE MEDIR. `fondoDe()` sólo sabe de
      COLORES: sube buscando un `background-color` opaco. Arriba de la portada
      no hay ninguno —lo que hay es `.pbg`, una capa absoluta con la FOTO, y
      `.pveil`, un degradado— así que la función termina devolviendo el papel
      de la invitación. Y el papel es crema, igual que la tipografía de la
      portada: la cuenta da 1,05 y la regla canta ILEGIBLE una portada que en
      pantalla se lee perfecta.
      Medido el 22/9/2026: fallaba igual en `camila-y-tomas`, que es LA muestra
      de referencia. O sea que no era un defecto de una muestra: era la regla.
      Y una regla que grita con todo bien enseña a ignorarla, que es peor que
      no tenerla.
      → `tapaFoto()` reconoce esos textos y los manda a una lista APARTE que
        dice MIRARLOS. No se dan por buenos ni por malos, y no hacen fallar la
        regla: el ojo decide. Lo que SÍ se mide sigue fallando como siempre.
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

  /* ★ TRAMPA 3: ¿hay una FOTO tapando el fondo de este texto?
     Dos formas, y las dos aparecen en la misma invitación:

       a) una CAPA POSICIONADA que cubre al texto por completo y es una imagen:
          un <img>, un <video> o un div con `background-image: url(...)`.
          Eso es `.pbg` en la portada.
       b) la FOTO DE FONDO DE UNA SECCIÓN, puesta como `background-image` del
          propio <section>. Eso es `#contacto-sec`.

     ⚠️ (b) SE LIMITA A UN `SECTION`, Y ES A PROPÓSITO. El papel de la
        invitación es una textura y vive en `body.tex-lino` y en `.frame` —los
        dos son DIV o BODY, así que quedan afuera—. Si contaran, TODA la
        invitación quedaría exenta y la regla de contraste se apagaría entera
        sin avisar. Y además medir contra `--lino` en ese caso es CORRECTO: la
        textura es del color del papel. Lo que no se puede medir es una foto. */
  function tapaFoto(el) {
    var marco = document.querySelector('.frame');
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var n = el;
    while (n && n !== document.documentElement) {
      var hijos = n.children || [];
      for (var i = 0; i < hijos.length; i++) {
        var h = hijos[i];
        if (h === el || h.contains(el)) continue;
        var cs = getComputedStyle(h);
        if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
        if (!visible(h)) continue;
        var esFoto = h.tagName === 'IMG' || h.tagName === 'VIDEO' ||
                     /url\(/.test(cs.backgroundImage || '');
        if (!esFoto) continue;
        var b = h.getBoundingClientRect();
        if (b.left <= r.left + 1 && b.right >= r.right - 1 &&
            b.top <= r.top + 1 && b.bottom >= r.bottom - 1) return true;
      }
      if (n.tagName === 'SECTION' &&
          /url\(/.test(getComputedStyle(n).backgroundImage || '')) return true;
      if (n === marco) break;
      n = n.parentElement;
    }
    return false;
  }

  /* ★ TRAMPA 4: UN BOTÓN CON DEGRADADO TAMPOCO SE PUEDE MEDIR.
     Medido el 22/9/2026 en `regina-y-emiliano` con el botón `placa`: los
     estilos de botón (`lacre`, `nácar`, `oro`, `placa`, `arcilla`, `esmalte`)
     pintan con el atajo `background: linear-gradient(...)`, y ese atajo deja
     `background-color` en `transparent`. `fondoDe()` sube buscando un color
     OPACO, se pasa de largo el botón y termina midiendo contra el papel de la
     invitación: letra crema sobre un plato negro daba 1,35 y la regla la
     cantaba ilegible. Le pasa a TODAS las colecciones, no a una: en campestre
     eran los tres «Reservar» de los hoteles y el botón de WhatsApp.
     → Un texto dentro de un control cuyo fondo es un degradado se manda a la
       lista de MIRARLOS, igual que lo que cae sobre una foto. NO se da por
       bueno ni por malo: lo decide el ojo. */
  function sobreDegrade(el) {
    var n = el;
    for (var i = 0; n && i < 4; i++, n = n.parentElement) {
      if (!/gradient\(/.test(getComputedStyle(n).backgroundImage || '')) continue;
      if (/^(BUTTON|A)$/.test(n.tagName)) return true;
      if (/(^| )btn( |$)/.test(String(n.className || ''))) return true;
    }
    return false;
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
    /* ⚠️⚠️ UN PÍXEL DE DIFERENCIA NO ES UNA FILA. Medido el 22/9/2026 en
       `regina-y-emiliano`: las tres tarjetas estaban perfectamente en línea
       —izquierdas 438 / 580 / 722, mismo ancho— y sus `top` daban 5557, 5556 y
       5556. Un redondeo distinto en UNA tarjeta hacía contar DOS filas, y la
       regla que más le importa a Maki fallaba con la muestra impecable. Una
       regla que grita con todo bien enseña a ignorarla, que es peor que no
       tenerla (es la misma lección de la trampa 3 del encabezado).
       → Se agrupa con TOLERANCIA: dos tarjetas están en la misma fila si sus
         `top` se llevan menos de la mitad del alto de la tarjeta. */
    var tops = tar.map(function (t) { return t.getBoundingClientRect().top; });
    var altoTar = Math.max.apply(null, tar.map(function (t) {
      return t.getBoundingClientRect().height || 0;
    }));
    var tol = Math.max(6, altoTar * 0.5);
    var filas = 0, ultimo = null;
    tops.slice().sort(function (a, b) { return a - b; }).forEach(function (v) {
      if (ultimo === null || v - ultimo > tol) { filas++; ultimo = v; }
    });
    return {
      pasa: filas === 1,
      nota: tar.length + ' personas en ' + filas + ' fila(s)' +
            (filas === 1 ? '' : ' — grid: ' + getComputedStyle(cont).gridTemplateColumns),
      detalle: tops.map(function (v) { return Math.round(v); })
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
         el circulito de fábrica.
       ⚠️⚠️ EL ATRIBUTO TIENE QUE LLEVAR EL NOMBRE DE LA COLECCIÓN, NO ESTAR
         VACÍO. Acá se lee con `|| ''` y después `if (propia)`: una cadena
         vacía es FALSA y cae a la rama del circulito. Cantera lo puso vacío el
         21/9 y la regla falló con el medallón perfectamente puesto. */
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
    /* ★ 3/10/2026 — Perlas cambia el símbolo dibujado por la PERLA FOTOGRAFIADA
       (data:image/webp) cuando la tiene: también es la marca de la temática. La
       regla daba FALLA según el segundo en que midiera. Lo que importa es que
       haya una imagen y no el circulito de fábrica (que no tiene ninguna). */
    var hay = /url\(/.test(img);
    return {
      pasa: hay,
      nota: firma + (/svg/.test(img) ? ' — dibujado' : hay ? ' — pieza fotografiada' : ' — declarado pero NO dibujado')
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
     arriba de la norma. Mismo criterio que `reglas-duras.js`.

     ⚠️ LO QUE ESTÁ SOBRE UNA FOTO NO ENTRA EN LA CUENTA (trampa 3 del
        encabezado): va a una lista aparte que dice MIRARLOS. */
  regla('contraste', 'Todos los textos se leen', function () {
    var malos = [], sobreFoto = [];
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
      if (v >= min) return;
      var linea = corto(el, 28) + ' → ' + v.toFixed(2) + ' (piso ' + min + ')';
      if (tapaFoto(el) || sobreDegrade(el)) sobreFoto.push(linea);
      else malos.push(linea);
    });
    var det = malos.slice(0, 12);
    if (sobreFoto.length) {
      det = det.concat(['— SIN FONDO MEDIBLE (foto o degradado): MIRARLOS —'], sobreFoto.slice(0, 12));
    }
    return {
      pasa: malos.length === 0,
      nota: malos.length + ' texto(s) por debajo del piso — MIRARLOS antes de creerles' +
            (sobreFoto.length ? ' · ' + sobreFoto.length + ' sobre foto (sin medir: MIRARLOS)' : ''),
      detalle: det
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

  /* 9 ······················································ EL ORDEN  ★ 3/10/2026 ★
     «el ticket tiene que estar después de la raspada y después viene el QR …
      para que la gente lo vea rápido». Se mira el DOM: raspadita, ticket con
     voz y pase con QR, pegados y en ese orden. */
  regla('orden-ticket', 'Raspadita → ticket con voz → QR', function () {
    var pv = document.getElementById('pv-sec');
    if (!pv) return { pasa: true, nota: 'esta invitación no tiene ticket con voz' };
    var pase = document.querySelector('.pase');
    var rasp = document.querySelector('.sec.scratch-sec');
    var sig = function (el) { var n = el && el.nextElementSibling; return n; };
    var nom = function (el) { return el ? (el.id || String(el.className).split(' ')[0] || el.tagName) : 'nada'; };
    if (rasp) {
      var ok1 = sig(rasp) === pv, ok2 = !pase || sig(pv) === pase;
      return {
        pasa: ok1 && ok2,
        nota: ok1 && ok2 ? 'raspadita → ticket → QR'
          : 'después de la raspadita viene «' + nom(sig(rasp)) + '» y después del ticket «' + nom(sig(pv)) + '»'
      };
    }
    if (pase) {
      var ok = sig(pv) === pase;
      return { pasa: ok, nota: ok ? 'sin raspadita: ticket → QR' : 'sin raspadita, y el ticket no va pegado arriba del QR' };
    }
    return { pasa: true, nota: 'sin raspadita ni QR' };
  });

  /* 10 ································· LA LÍNEA DEL ITINERARIO  ★ 3/10/2026 ★
     «la línea esa que cruza se va hasta el fondo y sigue pasando el último
      circulito … tiene que terminar en el circulito». La vía (`.tl::before`)
     tiene que terminar en el CENTRO de la marca de la última ficha (y empezar
     en el de la primera), ±2 px. El centro se mide igual que efectos/itinerario.js. */
  function marcaY(el) {
    var r = el.getBoundingClientRect();
    try {
      var c = getComputedStyle(el, '::before');
      var t = parseFloat(c.top), m = parseFloat(c.marginTop) || 0, h = parseFloat(c.height);
      if (c.content !== 'none' && isFinite(t) && isFinite(h) && h > 0) return r.top + t + m + h / 2;
    } catch (e) {}
    return r.top + r.height / 2;
  }
  regla('itinerario-termina', 'La línea del itinerario termina en la última marca', function () {
    var tls = [].slice.call(document.querySelectorAll('.tl')).filter(ubicable);
    if (!tls.length) return { pasa: true, nota: 'esta invitación no tiene itinerario' };
    var malos = [], medidos = 0;
    tls.forEach(function (tl) {
      var its = [].slice.call(tl.children).filter(function (e) { return e.classList.contains('it') && ubicable(e); });
      if (!its.length) return;
      var v = getComputedStyle(tl, '::before');
      if (v.content === 'none' || v.display === 'none') { malos.push('la vía no es .tl::before (no se pudo medir)'); return; }
      var R = tl.getBoundingClientRect();
      var top = parseFloat(v.top), bot = parseFloat(v.bottom);
      if (!isFinite(top) || !isFinite(bot)) { malos.push('la vía no tiene top/bottom medibles'); return; }
      medidos++;
      var ini = R.top + top, fin = R.bottom - bot;
      var m0 = marcaY(its[0]), m1 = marcaY(its[its.length - 1]);
      if (Math.abs(fin - m1) > 2) malos.push('termina ' + Math.round(fin - m1) + ' px ' + (fin > m1 ? 'DESPUÉS' : 'antes') + ' de la última marca');
      if (Math.abs(ini - m0) > 2) malos.push('empieza ' + Math.round(m0 - ini) + ' px ' + (ini < m0 ? 'ANTES' : 'después') + ' de la primera marca');
      /* ⚠ la hebra encendida (`.tl-prog`) también es línea: en Perlas iba de 6 px
         a 6 px del fondo y seguía 30 px abajo de la última perla con la vía bien. */
      var pg = tl.querySelector('.tl-prog');
      if (pg) {
        var cp = getComputedStyle(pg), rp = pg.getBoundingClientRect();
        if (cp.display !== 'none' && cp.visibility !== 'hidden' && rp.height > 4) {
          var finP = rp.top + rp.height;   /* sin escala: el bottom real del elemento */
          var bp = parseFloat(cp.bottom);
          if (isFinite(bp)) finP = R.bottom - bp;
          if (finP - m1 > 2) malos.push('la línea de avance (.tl-prog) sigue ' + Math.round(finP - m1) + ' px DESPUÉS de la última marca');
        }
      }
    });
    return { pasa: malos.length === 0, nota: malos.length ? malos.length + ' problema(s)' : medidos + ' itinerario(s): la vía va de marca a marca', detalle: malos };
  });

  /* 11 ······································· RASPADITA SIN RECUADRO  ★ 3/10/2026 ★
     «para raspar, para revelar, se ven los bordes. No está bueno eso.»
     El contenedor `#scratchcard` no lleva fondo, borde, sombra ni filete. */
  regla('raspadita-sin-recuadro', 'La raspadita no tiene recuadro', function () {
    var sc = document.getElementById('scratchcard');
    if (!sc) return { pasa: true, nota: 'esta invitación no tiene raspadita' };
    var c = getComputedStyle(sc), a = getComputedStyle(sc, '::after'), b = getComputedStyle(sc, '::before');
    var malos = [];
    ['Top', 'Right', 'Bottom', 'Left'].forEach(function (k) {
      if (parseFloat(c['border' + k + 'Width']) > 0 && c['border' + k + 'Style'] !== 'none') malos.push('borde ' + k);
    });
    if (c.boxShadow && c.boxShadow !== 'none') malos.push('sombra');
    if (c.backgroundImage && c.backgroundImage !== 'none') malos.push('imagen de fondo');
    var bg = aRGB(c.backgroundColor);
    if (bg && bg[3] > 0.02) malos.push('fondo ' + c.backgroundColor);
    if (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) malos.push('filete (outline)');
    [a, b].forEach(function (p, i) { if (p.content && p.content !== 'none' && p.display !== 'none') malos.push((i ? '::before' : '::after') + ' dibujado'); });
    return { pasa: malos.length === 0, nota: malos.length ? malos.join(', ') : 'sin recuadro', detalle: malos };
  });

  /* 12 ············································· MÚSICA EN MP3  ★ 3/10/2026 ★
     «en iPhone … poné todo en mp3 así funciona», «la idea es que suene cuando
      tocan el sobre». Con YouTube el iPhone no arranca con el toque del sobre;
     con un archivo de audio el motor usa #audio-bg y arranca en el toque. */
  regla('musica-mp3', 'La música es un archivo de audio (arranca con el sobre)', function () {
    var url = String((window.INVEV || {}).musicaUrl || '').trim();
    if (!url) return { pasa: true, nota: 'esta invitación no tiene música' };
    var esAudio = /\.(mp3|m4a|aac|ogg|wav)(\?|#|$)/i.test(url);
    if (!esAudio) return { pasa: false, nota: 'la música no es mp3 (' + url.slice(0, 40) + '): en iPhone no arranca al tocar el sobre' };
    var a = document.getElementById('audio-bg');
    var cargada = !!(a && a.getAttribute('src'));
    var nota = 'mp3' + (cargada ? ' cargado en #audio-bg' : ' — pero #audio-bg NO lo tiene');
    if (cargada && a.currentTime > 0) nota += ' · sonando (' + a.currentTime.toFixed(1) + ' s)';
    return { pasa: cargada, nota: nota };
  });

  /* 13 ······································· EL SOBRE ESTÁ GUARDADO  ★ 3/10/2026 ★
     renata-y-patricio abría vacía y cambiaba de sobre: el modelo no estaba
     guardado y la colección lo inyectaba en memoria (`fx.__mfSobre`), en
     carrera con el sobre clásico. El sobre tiene que estar elegido en el panel. */
  regla('sobre-guardado', 'El sobre está guardado en el panel (no lo pone la colección)', function () {
    var fx = ((window.INVEV || {}).fx) || {};
    var inyectado = Object.keys(fx).filter(function (k) { return /^__.*sobre/i.test(k) && fx[k]; });
    if (inyectado.length) return { pasa: false, nota: 'el sobre lo puso la colección en memoria (' + inyectado.join(', ') + '): elegir el modelo en EFECTOS y «Guardar y publicar»' };
    var m = fx.sobre && fx.sobre.modelo;
    return { pasa: true, nota: m ? 'modelo guardado: ' + m : 'sobre de fábrica' };
  });

  /* 14 ································· LA CARTA SIN RELLENO  ★ 3/10/2026 ★
     «hay algunas que decían algo genérico». La hoja no repite el título de la
     sección, no trae el texto de fábrica y no es de una sola línea. */
  regla('carta-propia', 'Nuestra carta tiene encabezado y texto propios', function () {
    var sec = document.getElementById('carta-sec');
    if (!sec || !ubicable(sec)) return { pasa: true, nota: 'esta invitación no tiene carta' };
    var h2 = document.getElementById('cf-h2c'), h4 = document.getElementById('cf-titulo'), p = document.getElementById('cf-texto');
    var t = function (e) { return e ? (e.textContent || '').trim().replace(/\s+/g, ' ') : ''; };
    var malos = [];
    if (h4 && visible(h4) && h2 && t(h4).toLowerCase() === t(h2).toLowerCase()) malos.push('la hoja repite el título «' + t(h2) + '»');
    var cuerpo = t(p);
    if (/^Queridos amigos y familia|Hoy queremos compartir con ustedes uno de los d[ií]as m[aá]s felices/i.test(cuerpo)) malos.push('texto de fábrica');
    if (cuerpo && cuerpo.length < 80) malos.push('texto de una línea (' + cuerpo.length + ' letras)');
    return { pasa: malos.length === 0, nota: malos.length ? malos.join(' · ') : 'propia (' + cuerpo.length + ' letras)', detalle: malos };
  });

  /* ★ 3/10/2026 — Maki: «esos regalos están perfectos… dale check verde».
     «Mesa de regalos» lleva SU regalo arriba del título: el dibujo elegido en el
     panel (fx.regalo.dibujo, pintado por máscara) o la foto de «Imagen decorativa».
     Falla si la sección está y no hay ninguno, si el dibujo elegido no se pintó
     (máscara vacía, color transparente, catálogo sin cargar) o si se ven los dos. */
  regla('regalo-visible', 'Mesa de regalos tiene su regalo (dibujo o foto) arriba del título', function () {
    var sec = document.querySelector('[data-sec=regalos]');
    if (!sec || !ubicable(sec)) return { pasa: true, nota: 'esta invitación no muestra Mesa de regalos' };
    var r = ((window.INVEV || {}).fx || {}).regalo || {};
    var dib = document.getElementById('reg-dibujo');
    var ad = document.getElementById('reg-adorno');
    var adVis = ad && visible(ad) && ad.tagName === 'IMG' && ad.naturalWidth > 0;
    var malos = [];
    if (r.dibujo) {
      if (!dib) malos.push('eligió el dibujo «' + r.dibujo + '» y no se pintó');
      else {
        var cs = getComputedStyle(dib);
        var mk = cs.webkitMaskImage || cs.maskImage || '';
        if (!/url\(/.test(mk)) malos.push('el dibujo no tiene máscara');
        if (/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) malos.push('el dibujo no tiene color');
        if (dib.getBoundingClientRect().width < 40) malos.push('el dibujo mide menos de 40 px');
        if (adVis) malos.push('se ven el dibujo y la foto a la vez');
      }
      return { pasa: malos.length === 0, nota: malos.length ? malos.join(' · ') : 'dibujo ' + r.dibujo + ' en ' + (dib ? getComputedStyle(dib).backgroundColor : '?'), detalle: malos };
    }
    if (!adVis) return { pasa: false, nota: 'la sección no tiene regalo (ni dibujo ni foto cargada)', detalle: ['sin regalo'] };
    return { pasa: true, nota: 'foto ' + ((ad.currentSrc || ad.src || '').split('/').pop().slice(0, 40)) };
  });

  /* ★ 3/10/2026 — «con textos largos los últimos renglones de la carta quedan
     detrás del bolsillo del sobre». Se mide con la hoja en su posición final
     (sin el desplazamiento de la animación de salida): el último renglón tiene
     que terminar por lo menos 4 px arriba del borde del bolsillo (`.cf-front`). */
  regla('carta-fuera-del-bolsillo', 'El último renglón de la carta queda afuera del bolsillo del sobre', function () {
    var sec = document.getElementById('carta-sec');
    if (!sec || !ubicable(sec)) return { pasa: true, nota: 'esta invitación no tiene carta' };
    var hoja = sec.querySelector('.cf-letter'), frente = sec.querySelector('.cf-front'), p = document.getElementById('cf-texto');
    if (!hoja || !p) return { pasa: false, nota: 'no encontré la hoja de la carta', detalle: ['sin .cf-letter'] };
    if (!frente || getComputedStyle(frente).display === 'none') return { pasa: true, nota: 'sin bolsillo' };
    var ty = 0;
    try { ty = new DOMMatrixReadOnly(getComputedStyle(hoja).transform).m42 || 0; } catch (e) {}
    var rg = document.createRange(); rg.selectNodeContents(p);
    var rs = rg.getClientRects(); if (!rs.length) return { pasa: false, nota: 'la carta no tiene texto visible', detalle: ['sin texto'] };
    var fin = rs[rs.length - 1].bottom - ty;
    var borde = frente.getBoundingClientRect().top;
    var sobra = Math.round(borde - fin);
    return { pasa: sobra >= 4, nota: sobra >= 4 ? 'el último renglón queda ' + sobra + ' px arriba del bolsillo' : 'el último renglón queda ' + (-sobra) + ' px DETRÁS del bolsillo', detalle: sobra >= 4 ? [] : ['tapado ' + (-sobra) + ' px'] };
  });

  /* ★ 3/10/2026 — valentina tenía los cuatro padres con nombre y SIN foto:
     cuatro círculos vacíos. Ninguna regla lo veía (la de «una fila» sólo mira
     la posición). Cada persona visible tiene que tener su foto. */
  regla('personas-con-foto', 'Cada persona de «Nuestras personas» tiene su foto', function () {
    var cont = document.querySelector('.padres');
    if (!cont || !ubicable(cont)) return { pasa: true, nota: 'esta invitación no muestra personas' };
    var malos = [];
    [].forEach.call(cont.children, function (c) {
      if (!visible(c)) return;
      var av = c.querySelector('.av');
      var nom = ((c.querySelector('.nm') || {}).textContent || '?').trim().slice(0, 24);
      var bg = av ? getComputedStyle(av).backgroundImage : 'none';
      var im = av && av.querySelector('img');
      var hay = /url\(/.test(bg) || (im && im.naturalWidth > 0);
      if (!hay) malos.push(nom + ': sin foto');
    });
    return { pasa: malos.length === 0, nota: malos.length ? malos.length + ' persona(s) sin foto' : 'todas con foto', detalle: malos };
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

  window.INVCHEQUEO = { correr: correr, reglas: REGLAS, aRGB: aRGB, contraste: contraste, tapaFoto: tapaFoto };

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
