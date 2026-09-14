/* ===== EL VELO QUE SE ACOMODA SOLO, SECCION POR SECCION ======================

   EL PROBLEMA, MEDIDO POR EL BANCO (10/9/2026)

   Cuando la clienta pone una foto de fondo, las secciones se vuelven
   semitransparentes A PROPOSITO para que la foto se vea (fondo-invitacion.js):

     html[data-fondo] .sec       -> color-mix(--sec-col,   transparente, --inv-paso)
     html[data-fondo] .sec.verde -> color-mix(--sec-col-v, transparente, --inv-oscuras)

   `--inv-paso` viene en 0.85: o sea que de la seccion queda un 15% y el resto
   es foto. Y ahi el texto deja de caer sobre el papel y cae sobre la foto.

   El banco, midiendo los PIXELES de verdad, encontro las dos caras del mismo
   problema en la misma invitacion:

     · texto CLARO sobre foto CLARA  -> "Cabañas del Pinar" (#ffffff) 1.1
                                        "Reservar" (#f7e9e6)          1.0
     · texto OSCURO sobre foto OSCURA -> "Vestimenta" (#463b52)       1.0
                                        "Ver más" (#3a453d)           1.0

   El minimo para que una persona lo lea es 4.5 (3 si es texto grande). En 1.0
   el texto y el fondo son el MISMO color: no es que se lea mal, es que no esta.

   POR QUE NO SE ARREGLA CAMBIANDO LOS COLORES
   Porque no hay un color que sirva: la foto la elige la clienta. El mismo texto
   blanco que se lee perfecto sobre una foto de noche desaparece sobre una de
   playa. Cambiar los 55 colores a mano deja el problema igual para la foto
   siguiente.

   LO QUE SI LO ARREGLA: que cada seccion mida lo que tiene detras y se tape lo
   justo. Maki eligio esta opcion sabiendo el precio: la foto se ve un poco mas
   atenuada, PERO SOLO donde hace falta. Donde el texto ya se lee, no se toca
   nada — y una invitacion sin foto de fondo no pasa ni por aca.

   COMO SE MIDE LA FOTO SIN PODER SACAR UNA CAPTURA
   Desde adentro de la pagina no se puede fotografiar la pantalla. Pero la foto
   es un <img>, y un <img> se puede dibujar en un canvas y leerle los pixeles.
   Se toman el percentil 10 y el 90 de luminancia y se trabaja con EL PEOR de
   los dos: un texto blanco sobre un cielo con una nube clara tiene que dar mal
   aunque el promedio de la foto sea oscuro.

   ATENCION - LA FOTO ES `position:fixed`, Y ESO SIMPLIFICA TODO. No scrollea:
   la misma region de la imagen esta detras de todas las secciones. Por eso
   alcanza con medirla UNA vez y no una por seccion.

   ATENCION - SI EL CANVAS QUEDA "MANCHADO", NO SE ADIVINA. Si la foto viniera
   de un servidor que no permite leerla (sin CORS), `getImageData` tira error.
   En ese caso NO se inventa un numero: se asume el peor caso posible —que la
   foto pueda ser negra o blanca— y se sube el velo a un piso seguro. Se ve
   menos foto, pero nunca un texto invisible.

   ATENCION - SE BAJA LA TRANSPARENCIA, NUNCA SE SUBE. Si la clienta pidio que
   se vea mucha foto y el texto igual se lee, se respeta su eleccion tal cual.
   Este archivo solo puede TAPAR de mas, nunca destapar.
   ============================================================================ */
(function () {
  'use strict';

  var MARCA = 'data-velo-auto';

  /* --- luminancia relativa, la de la norma de accesibilidad --- */
  function canal(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function lumRGB(r, g, b) { return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b); }
  function razon(a, b) { return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }

  /* ⚠️ HAY QUE ENTENDER LAS DOS FORMAS, Y ESTO YA COSTO UNA CORRIDA ENTERA.
     `getComputedStyle(el).color` siempre devuelve `rgb(...)`, pero una VARIABLE
     de CSS devuelve el texto tal cual se escribio: `--sec-col` vale "#e9e6ee",
     no "rgb(233,230,238)". La primera version solo leia `rgb()`, asi que al
     preguntar por el color de la seccion recibia null, se salteaba la seccion,
     y el modulo entero no tocaba NADA — pasaba el banco sin cambiar un pixel.
     Se comprobo en la invitacion de verdad: 21 secciones, 0 con la marca. */
  function color(txt) {
    var t = String(txt || '').trim();
    var m = t.match(/rgba?\(([^)]+)\)/);
    if (m) {
      var p = m[1].split(',').map(parseFloat);
      if (p.length > 3 && p[3] < 0.05) return null;
      return { r: p[0], g: p[1], b: p[2], l: lumRGB(p[0], p[1], p[2]) };
    }
    var h = t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (h) {
      var x = h[1];
      if (x.length === 3) x = x[0] + x[0] + x[1] + x[1] + x[2] + x[2];
      var n = parseInt(x, 16);
      var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      return { r: r, g: g, b: b, l: lumRGB(r, g, b) };
    }
    return null;
  }

  /* ---- 1 · CUANTO DE CLARA Y CUANTO DE OSCURA TIENE LA FOTO --------------- */
  var fotoMedida = null;       /* {p10, p90} o {p10:0, p90:1} si no se pudo */
  var pedido = false;          /* ya se pidio el cuadro con permiso de lectura */
  var arranque = Date.now();

  /* mide un <img> o un <video> ya dibujable; null si no se pudo */
  function medirDe(fuente) {
    try {
      var n = 48;                                  /* 48x48 alcanza y sobra */
      var c = document.createElement('canvas');
      c.width = n; c.height = n;
      var g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(fuente, 0, 0, n, n);
      var d = g.getImageData(0, 0, n, n).data;
      var ls = [];
      for (var i = 0; i < d.length; i += 4) ls.push(lumRGB(d[i], d[i + 1], d[i + 2]));
      ls.sort(function (a, b) { return a - b; });
      return {
        p10: ls[Math.floor(ls.length * 0.10)],
        p90: ls[Math.floor(ls.length * 0.90)],
        seguro: true
      };
    } catch (e) { return null; }   /* canvas manchado: no se adivina */
  }

  /* la direccion de un cuadro del video, sacado por Cloudinary */
  function cuadroDe(url) {
    if (typeof url !== 'string' || url.indexOf('res.cloudinary.com') < 0) return '';
    var m = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^\/]+)\/video\/upload\/(?:[^\/]*\/)?(v\d+\/.+?)\.[a-z0-9]+$/i);
    if (!m) return '';
    return m[1] + '/video/upload/so_1.5,f_auto,q_auto:good,w_1200,c_limit/' + m[2] + '.jpg';
  }

  /* pide la imagen OTRA VEZ, pero con permiso para leerla.
     La que ya esta en la pagina viene sin permiso y mancha el canvas. */
  function pedirConPermiso(src) {
    if (pedido || !src) return;
    pedido = true;
    var im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () { var m = medirDe(im); if (m) fotoMedida = m; };
    im.src = src;
  }

  /* UN VIDEO CAMBIA DE BRILLO MIENTRAS CORRE, Y UN SOLO CUADRO MIENTE.
     (14/9/2026) Medido en camila-y-tomas: el cuadro del segundo 1,5 da
     luminancia 0.56 a 0.88 (claro) y el texto verde oscuro encima se lee a 6.8.
     Pero el banco, midiendo en otro momento, encontro el mismo texto sobre
     0.05 a 0.23 (oscuro), y ahi desaparece. Los dos tenian razon: el fondo se
     movia. Asi que se miran VARIOS cuadros y se toma el peor de todos: el mas
     oscuro que llegue a haber y el mas claro que llegue a haber.
     Cloudinary entrega cualquier cuadro con so_<segundo>, asi que son cinco
     fotitos de 600 px, pedidas una sola vez. */
  var SEGUNDOS = [0.5, 1.5, 3, 5, 8];
  var cuadrosPedidos = false;
  var medidas = [];

  function idDeVideo(url) {
    if (typeof url !== 'string' || url.indexOf('res.cloudinary.com') < 0) return null;
    var m = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^\/]+)\/video\/upload\/(?:[^\/]*\/)?(v\d+\/.+?)\.[a-z0-9]+$/i);
    return m ? { base: m[1], id: m[2] } : null;
  }

  function combinarMedidas() {
    if (!medidas.length) return;
    var p10 = 1, p90 = 0;
    for (var i = 0; i < medidas.length; i++) {
      if (medidas[i].p10 < p10) p10 = medidas[i].p10;
      if (medidas[i].p90 > p90) p90 = medidas[i].p90;
    }
    fotoMedida = { p10: p10, p90: p90, seguro: true, cuadros: medidas.length };
  }

  function pedirCuadros(v) {
    if (cuadrosPedidos) return;
    cuadrosPedidos = true;
    for (var i = 0; i < SEGUNDOS.length; i++) {
      (function (seg) {
        var im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = function () {
          var m = medirDe(im);
          if (m) { medidas.push(m); combinarMedidas(); }
        };
        im.src = v.base + '/video/upload/so_' + seg +
                 ',f_auto,q_auto:good,w_600,c_limit/' + v.id + '.jpg';
      })(SEGUNDOS[i]);
    }
  }

  function medirFoto() {
    var el = document.querySelector('#inv-fondo > img, #inv-fondo > video');
    if (!el) return null;

    /* ⚠️ EL VIDEO NO ES "IMPOSIBLE DE MEDIR". (14/9/2026)
       Antes esta funcion devolvia directamente el peor caso —«podria ser negro
       Y podria ser blanco»— para cualquier video. Con ese supuesto NINGUN velo
       alcanza nunca: el unico valor que satisface los dos extremos es tapar el
       100%. Resultado medido en camila-y-tomas: 15 de 21 secciones quedaron
       completamente opacas y el video de fondo, que la clienta eligio y paga,
       dejo de verse.
       Y no hacia falta: el video de esa invitacion es CLARO (luminancia 0.56 a
       0.88 medida de verdad), y el texto morado encima se lee a 6.3 de razon,
       muy por encima del 4.5 que pide la norma. O sea: se estaba tapando una
       foto perfectamente legible por no molestarse en mirarla.
       Ahora se mira, en este orden:
         1. el <video> mismo, si el navegador deja dibujarlo;
         2. su cuadro fijo, pedido de nuevo CON permiso de lectura
            (`crossOrigin`), porque el que ya esta en la pagina mancha el canvas;
         3. recien si en 5 segundos no se pudo, el peor caso de antes.
       Mientras no se sepa, no se toca nada: es mejor esperar medio segundo que
       taparle la pantalla a la clienta por las dudas. */
    /* el fondo puede llegar como <video>, o como la foto fija que se saco de
       ese video: en los dos casos lo que importa es EL VIDEO, no un cuadro */
    var vid = idDeVideo(el.currentSrc || el.src || '') ||
              idDeVideo(el.getAttribute('poster') || '');
    if (vid) {
      pedirCuadros(vid);
      return (Date.now() - arranque > 6000) ? { p10: 0, p90: 1, seguro: false } : null;
    }

    if (el.tagName === 'VIDEO') {
      if (el.readyState >= 2) {
        var v = medirDe(el);
        if (v) return v;
      }
      pedirConPermiso(el.getAttribute('poster') || cuadroDe(el.currentSrc || el.src));
      return (Date.now() - arranque > 6000) ? { p10: 0, p90: 1, seguro: false } : null;
    }

    if (!el.complete || !el.naturalWidth) return null;   /* todavia no cargo */
    var m = medirDe(el);
    if (m) return m;
    pedirConPermiso(el.currentSrc || el.src);
    return (Date.now() - arranque > 5000) ? { p10: 0, p90: 1, seguro: false } : null;
  }

  /* ---- 2 · EL TEXTO QUE PEOR LA PASA EN CADA SECCION ---------------------- */

  /* ¿entre este texto y la seccion hay alguien que pinta de verdad?
     Se acepta desde 0.6 de opacidad: una tarjeta a medio pintar ya cambia
     tanto el fondo que el velo de la seccion deja de ser el que manda. */
  function tapadoPorSuTarjeta(el, sec) {
    var p = el;
    while (p && p !== sec) {
      var cs = getComputedStyle(p);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      var m = String(cs.backgroundColor).match(/rgba?\(([^)]+)\)/);
      if (m) {
        var q = m[1].split(',').map(parseFloat);
        var a = q.length < 4 ? 1 : q[3];
        if (a >= 0.6) return true;
      }
      p = p.parentElement;
    }
    return false;
  }

  function textosDe(sec) {
    var out = [];
    var todos = sec.querySelectorAll('h1,h2,h3,h4,p,span,div,a,button,li');
    for (var i = 0; i < todos.length && out.length < 40; i++) {
      var el = todos[i];
      if (el.children.length) continue;                    /* solo hojas */
      var t = (el.textContent || '').trim();
      if (t.length < 3) continue;
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      var c = color(cs.color);
      if (!c) continue;
      var px = parseFloat(cs.fontSize) || 16;
      var grande = px >= 24 || (px >= 18.66 && (parseInt(cs.fontWeight) || 400) >= 700);
      /* ATENCION - un texto con su propio fondo opaco NO pisa la foto: su
         legibilidad la resuelve ese fondo, no el velo de la seccion.
         ⚠️ Y ESTO NO ALCANZA CON MIRAR AL TEXTO. (14/9/2026)
         Casi ningún texto tiene fondo propio: el fondo lo pone la TARJETA que
         lo contiene. En «Dónde y cuándo», el título CEREMONIA es morado
         oscuro y está parado sobre una tarjeta BLANCA, dentro de una sección
         morada. Mirándole sólo el fondo al texto, este archivo creía que el
         morado caía sobre morado y subía el velo al máximo para «arreglar»
         algo que se lee perfecto. Hay que subir por los padres: si antes de
         llegar a la sección aparece alguien que pinta de verdad, ese texto no
         es asunto del velo. */
      if (tapadoPorSuTarjeta(el, sec)) continue;
      out.push({ l: c.l, min: grande ? 3 : 4.5 });
    }
    return out;
  }

  /* ---- 3 · EL VELO MINIMO QUE HACE FALTA ---------------------------------- */
  /* alfa = cuanto queda de la seccion (1 = opaca, 0 = pura foto) */
  function alcanza(alfa, lSec, foto, textos) {
    for (var i = 0; i < textos.length; i++) {
      var t = textos[i];
      /* el peor de los dos extremos de la foto */
      var a = alfa * lSec + (1 - alfa) * foto.p10;
      var b = alfa * lSec + (1 - alfa) * foto.p90;
      if (Math.min(razon(t.l, a), razon(t.l, b)) < t.min) return false;
    }
    return true;
  }

  /* que tan bien esta el PEOR texto, medido como "cuanto de su minimo llega".
     1 = justo llega; menos de 1 = no llega; mas de 1 = sobra. */
  function nota(alfa, lSec, foto, textos) {
    var peor = Infinity;
    for (var i = 0; i < textos.length; i++) {
      var t = textos[i];
      var a = alfa * lSec + (1 - alfa) * foto.p10;
      var b = alfa * lSec + (1 - alfa) * foto.p90;
      var r = Math.min(razon(t.l, a), razon(t.l, b)) / t.min;
      if (r < peor) peor = r;
    }
    return peor === Infinity ? 99 : peor;
  }

  function acomodar() {
    var raiz = document.documentElement;
    if (!raiz.hasAttribute('data-fondo')) return;          /* sin foto, nada que hacer */
    if (!fotoMedida || !fotoMedida.seguro) {
      var m = medirFoto();
      if (m) fotoMedida = m; else return;                  /* todavia no cargo */
    }

    var secs = document.querySelectorAll('[data-fondo] .sec');
    for (var i = 0; i < secs.length; i++) {
      var sec = secs[i];
      var oscura = sec.classList.contains('verde');
      var variable = oscura ? '--inv-oscuras' : '--inv-paso';

      /* de cuanto parte: lo que eligio la clienta (o el valor global) */
      var cs = getComputedStyle(sec);
      var global = parseFloat(cs.getPropertyValue(variable)) || 0;
      var alfaAhora = 1 - global;                           /* cuanto queda de la seccion */

      var lSec = null;
      var base = color(cs.getPropertyValue(oscura ? '--sec-col-v' : '--sec-col')) ||
                 color(cs.getPropertyValue(oscura ? '--verde' : '--lino'));
      if (base) lSec = base.l;
      if (lSec === null) continue;

      var textos = textosDe(sec);
      if (!textos.length) continue;

      /* si ya se lee, no se toca: la clienta pidio ver la foto */
      if (alcanza(alfaAhora, lSec, fotoMedida, textos)) {
        sec.style.removeProperty(variable);
        sec.removeAttribute(MARCA);
        continue;
      }

      /* ⚠⚠ LA REGLA DE ORO: ESTE ARCHIVO NUNCA PUEDE DEJAR ALGO PEOR.
         (14/9/2026) La version anterior subía el velo hasta el tope y lo
         aplicaba SIEMPRE, aunque el resultado fuera igual de ilegible o peor.
         El caso feo: una seccion morada con texto morado. Tapar mas la foto
         acerca el fondo al morado de la seccion... que es el color del texto.
         O sea: el «arreglo» lo hacía desaparecer del todo.
         Ahora se prueban todos los pasos, se mide CUANTO le falta al peor
         texto en cada uno, y se aplica el mejor — y solo si de verdad mejora.
         Si ninguno mejora, se deja como estaba: ilegible es malo, invisible
         es peor, y la decision de la clienta al menos es suya. */
      var mejorAlfa = alfaAhora;
      var mejorNota = nota(alfaAhora, lSec, fotoMedida, textos);
      for (var a2 = alfaAhora; a2 <= 1.0001; a2 += 0.05) {
        var n2 = nota(Math.min(1, a2), lSec, fotoMedida, textos);
        if (n2 > mejorNota + 0.001) { mejorNota = n2; mejorAlfa = Math.min(1, a2); }
        /* se tapa LO JUSTO: apenas el peor texto llega a su minimo, se corta.
           Sin este freno, sobre papel claro el "mejor" puntaje siempre era
           tapar el 100%, y el video de fondo se perdia aunque ya se leyera. */
        if (mejorNota >= 1) break;
      }
      if (mejorAlfa <= alfaAhora + 0.001) {      /* no hay nada que ganar */
        sec.style.removeProperty(variable);
        sec.removeAttribute(MARCA);
        continue;
      }
      sec.style.setProperty(variable, String(Math.max(0, 1 - mejorAlfa)));
      sec.setAttribute(MARCA, (Math.round(mejorAlfa * 100)) + '%');
    }
  }

  /* ---- 4 · CUANDO SE HACE ------------------------------------------------ */
  /* Las secciones y los textos los escribe el motor despues, y la clienta puede
     cambiar la foto desde el panel. Se repasa cada tanto, igual que el resto de
     los modulos, y se corta cuando la invitacion se quedo quieta. */
  function arrancar() {
    var n = 0;
    var t = setInterval(function () {
      try { acomodar(); } catch (e) { clearInterval(t); }
      if (++n > 40) clearInterval(t);                       /* 20 segundos */
    }, 500);
    addEventListener('resize', function () { try { acomodar(); } catch (e) {} });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar, { once: true });
  } else { arrancar(); }
})();
