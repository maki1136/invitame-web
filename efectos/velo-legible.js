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

  function medirFoto() {
    var im = document.querySelector('#inv-fondo > img, #inv-fondo > video');
    if (!im) return null;
    /* el video no se puede medir asi de simple: se asume el peor caso */
    if (im.tagName === 'VIDEO') return { p10: 0, p90: 1, seguro: false };
    if (!im.complete || !im.naturalWidth) return null;   /* todavia no cargo */
    try {
      var n = 48;                                  /* 48x48 alcanza y sobra */
      var c = document.createElement('canvas');
      c.width = n; c.height = n;
      var g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(im, 0, 0, n, n);
      var d = g.getImageData(0, 0, n, n).data;
      var ls = [];
      for (var i = 0; i < d.length; i += 4) ls.push(lumRGB(d[i], d[i + 1], d[i + 2]));
      ls.sort(function (a, b) { return a - b; });
      return {
        p10: ls[Math.floor(ls.length * 0.10)],
        p90: ls[Math.floor(ls.length * 0.90)],
        seguro: true
      };
    } catch (e) {
      /* canvas manchado: la foto no se puede leer. No se adivina. */
      return { p10: 0, p90: 1, seguro: false };
    }
  }

  /* ---- 2 · EL TEXTO QUE PEOR LA PASA EN CADA SECCION ---------------------- */
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
         legibilidad la resuelve ese fondo, no el velo de la seccion. */
      var fondoPropio = color(cs.backgroundColor);
      var m = String(cs.backgroundColor).match(/rgba?\(([^)]+)\)/);
      var alfa = m ? (m[1].split(',').map(parseFloat)[3]) : 0;
      if (fondoPropio && (alfa === undefined || alfa > 0.85)) continue;
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
      /* y si no, se sube de a poco hasta que se lea */
      var alfa = alfaAhora;
      while (alfa < 1 && !alcanza(alfa, lSec, fotoMedida, textos)) alfa = Math.min(1, alfa + 0.05);
      sec.style.setProperty(variable, String(Math.max(0, 1 - alfa)));
      sec.setAttribute(MARCA, (Math.round(alfa * 100)) + '%');
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
