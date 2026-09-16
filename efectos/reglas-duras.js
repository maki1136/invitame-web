/* ===== LAS REGLAS DURAS DEL MOTOR ===========================================

   POR QUE EXISTE ESTE ARCHIVO  (16/9/2026)

   Maki, cansado, despues de que las mismas cosas salieran mal por tercera vez:

     «te dije que dejes... la frase sigue asi grande, eliminala directo y
      anotate no quiero mas asi grande fuera de diseno. vos ves la skill antes
      de trabajar? ya lo habiamos agregado o no?»
     «hay palabras claras sobre claro»
     «letras blancas no se lee / ingresa tu nombre no se lee»

   Si: ya estaba agregado. Estaba escrito en la skill de muestras, con sus
   palabras, y aun asi se repitio. La conclusion la eligio el:

     «las reglas duras adentro del motor» — que el motor NO PUEDA pintarlo mal,
     en vez de confiar en que alguien se acuerde de leer la regla.

   Eso es este archivo. No son colecciones ni gustos: son reglas que Maki ya
   dicto y que valen para TODAS las invitaciones.

   ---------------------------------------------------------------------------
   REGLA 1 — LA FRASE NO SE PINTA SUELTA. NUNCA.

     «Donde esta la frase, jamas podemos dejarla asi como la haces siempre, es
      muy poco estetica. Mira como la hicimos en Perlas, esa es la idea.»
     «El sobre que se abre la carta lo quiero en lugar de la frase. A partir de
      ahora la frase va con el sobre.»

   Una frase grande, centrada, sola sobre una banda de color es lo que Maki
   llama «fuera de diseno». El texto vive dentro de la pieza de la carta.

   ⚠️ Y HAY UNA TRAMPA MEDIDA: vaciar el campo `frase` NO alcanza. Medido en
      martina-mis15 el 16/9/2026 — con el campo en blanco, `.fraseSec` seguia
      en el DOM y traia el texto de la boda de EJEMPLO («Hay un instante en la
      vida...»). Es el mismo problema de la tarea #187.

   ⚠️ PERO EN PERLAS NO SE TOCA: ahi esa seccion no es una banda con una cita,
      es EL COLLAR. Es el ejemplo bueno, no el malo.

   REGLA 2 — LA CARTA VA ARRIBA, EN EL LUGAR QUE DEJO LA FRASE

   ⚠️ ANCLA MEDIDA EN EL DOM REAL. Los sectores que arma `secOrden` NO TIENEN
      id: son `.sec` pelados. Por eso la carta se cuelga despues de la ENTRADA
      — portada, pase con QR y raspadita — que es donde estaba la frase.

   REGLA 3 — EL VIDEO Y LA PLAYLIST NUNCA SE VEN CRUDOS

     NO SE TAPA UN PAPEL CON OTRO PAPEL. Se esconde el medio con `visibility`
     y se deja pasar una tapa dibujada encima.

   REGLA 4 — NINGUN TEXTO ILEGIBLE  (16/9/2026)

   Maki, con la captura al lado: «hay palabras claras sobre claro», «letras
   blancas no se lee», «ingresa tu nombre no se lee».

   Medido en el pase con QR de martina-mis15:
     · «Nombre», «Personas», «Mesa», «Estado del pase» iban en oro #d8b877
       sobre el rosa del pase #b06a7e → contraste 2.12. WCAG AA pide 4.5.
     · «Familia Peraza» en blanco puro → 4.03. Tambien por debajo.

   O sea: no era un descuido de una muestra. Era el oro de la paleta cayendo
   sobre un papel de color medio. Va a volver a pasar con CUALQUIER paleta que
   Jazmin combine, y nadie lo va a medir a ojo.

   → Por eso se mide y se corrige solo: se conserva el TONO del color elegido y
     se le mueve la luminosidad hasta que pase. El diseno no cambia de color;
     cambia de claridad lo justo para leerse.

   ⚠️⚠️ Y NO SE TOCA NADA QUE ESTE SOBRE UNA FOTO. Es la trampa numero uno de
      medir contraste: la cuenta regresiva de la portada es blanca sobre una
      foto oscura, se lee perfecto, y cualquier medicion ingenua la reporta
      como fallada porque no sabe de que color es la foto abajo.
      Medido hoy: de 57 "errores" del primer barrido, los primeros siete eran
      exactamente eso.
      → Si en la cadena de padres hay un `background-image`, se deja en paz.

   ---------------------------------------------------------------------------
   ★★★★★ NO DECIDIR ANTES DE QUE LLEGUEN LOS DATOS ★★★★★  (16/9/2026)

   Este modulo se rompio solo la primera vez que se subio:

     El motor dibuja la invitacion PRIMERO y recien despues llega el documento
     de Firestore y aparece `window.INVEV`. En esa ventana, preguntar
     «¿que coleccion es?» devuelve VACIO. O sea: en Perlas contestaba «no es
     Perlas», le escondia la frase — y con ella EL COLLAR — y como dejaba
     puesta su marca, las pasadas siguientes ni lo volvian a mirar.

   Es la misma leccion que dejo `musica.js`, anotada en `efectos/index.js`.

   → No se hace NADA hasta que los datos esten, y si se equivoco, se desanda.

   ⚠️ Y AL VERIFICAR: `todo.php` queda cacheado. La primera comprobacion dio
      falso rojo. Hay que recargar de verdad, no con otro `?cb=`.

   ---------------------------------------------------------------------------
   COMO ESTA HECHO

   · Reversible: se saca la linea de `efectos/index.js` y la invitacion vuelve
     exactamente a como estaba.
   · Cede ante las colecciones: las reglas 1, 2 y 3 se apartan si la coleccion
     ya resolvio el bloque. La 4 corre siempre: la legibilidad no se negocia.
   · Revisa cada tanto, porque EL PANEL REPINTA.
   ============================================================================ */
(function () {

  var CADA  = 700;
  var HASTA = 60000;

  /* ── ayudas ───────────────────────────────────────────────────────────── */

  function datos() { return window.INVEV || null; }

  /* ⚠️ Mientras esto sea false NO SE DECIDE NADA. */
  function hayDatos() {
    var D = datos();
    return !!(D && typeof D === 'object' && Object.keys(D).length > 3);
  }

  function laColeccion() {
    var D = datos() || {};
    return String((D.fx && D.fx.coleccion) || D.coleccion || '').toLowerCase();
  }

  function loResuelveLaColeccion() { return laColeccion() === 'perlas'; }

  function elMarco() { return document.querySelector('.frame'); }


  /* ── REGLA 1: fuera la frase suelta ───────────────────────────────────── */

  function sacarLaFrase() {
    var secs = document.querySelectorAll('.fraseSec, section.frase');
    var cede = loResuelveLaColeccion();

    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      var yaLaSacamos = s.getAttribute('data-regla-frase') === 'fuera';

      if (cede) {
        if (yaLaSacamos) {          /* la escondimos por error: se desanda */
          s.removeAttribute('data-regla-frase');
          s.style.display = '';
        }
        continue;
      }
      if (yaLaSacamos) continue;

      s.setAttribute('data-regla-frase', 'fuera');
      s.style.display = 'none';
    }
  }


  /* ── REGLA 2: la carta, arriba ────────────────────────────────────────── */

  function finDeLaEntrada() {
    var marco = elMarco();
    if (!marco) return null;
    var ultimo = null, hijos = marco.children;
    for (var i = 0; i < hijos.length; i++) {
      var c = ' ' + String(hijos[i].className || '') + ' ';
      if (c.indexOf(' portada ') >= 0 || c.indexOf(' pase ') >= 0 ||
          c.indexOf(' scratch-sec ') >= 0) ultimo = hijos[i];
    }
    return ultimo;
  }

  function subirLaCarta() {
    if (loResuelveLaColeccion()) return;
    var carta = document.getElementById('carta-sec');
    var tope  = finDeLaEntrada();
    if (!carta || !tope) return;
    if (carta.parentNode !== tope.parentNode) return;
    if (tope.nextElementSibling === carta) return;
    tope.parentNode.insertBefore(carta, tope.nextSibling);
  }


  /* ── REGLA 3: el video y la playlist, tapados ─────────────────────────── */

  var CSS_ID = 'reglas-duras-css';

  function ponerCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      '[data-crudo="tapado"]{position:relative}',
      '[data-crudo="tapado"] > iframe,',
      '[data-crudo="tapado"] > video{visibility:hidden}',
      '.rd-tapa{position:absolute;inset:0;z-index:2;display:flex;',
      '  flex-direction:column;align-items:center;justify-content:center;gap:10px;',
      '  border-radius:inherit;cursor:pointer;background:var(--lino,#f4f1ea)}',
      '.rd-tapa .rd-aro{width:62px;height:62px;border-radius:50%;',
      '  border:1px solid currentColor;display:flex;align-items:center;',
      '  justify-content:center;opacity:.75}',
      '.rd-tapa .rd-aro::after{content:"";border-style:solid;',
      '  border-width:9px 0 9px 15px;margin-left:4px;',
      '  border-color:transparent transparent transparent currentColor}',
      '.rd-tapa .rd-txt{font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.65}',
      '.rd-tapa.rd-ida{opacity:0;pointer-events:none;transition:opacity .45s ease}',
      /* REGLA 4 · los textos de relleno se pintan con el color del campo, que
         ya esta corregido, en vez del gris del navegador que nadie mira. */
      '.frame input::placeholder,.frame textarea::placeholder{',
      '  color:currentColor !important;opacity:.72 !important}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function taparUno(caja, rotulo) {
    if (!caja) return;
    if (caja.querySelector('.rd-tapa')) return;
    if (caja.querySelector('.col-vtapa')) return;        /* la puso la coleccion */
    if (!caja.querySelector('iframe') && !caja.querySelector('video')) return;

    ponerCss();
    caja.setAttribute('data-crudo', 'tapado');

    var tapa = document.createElement('div');
    tapa.className = 'rd-tapa';
    var aro = document.createElement('div'); aro.className = 'rd-aro';
    var txt = document.createElement('div'); txt.className = 'rd-txt';
    txt.textContent = rotulo;
    tapa.appendChild(aro); tapa.appendChild(txt);

    tapa.addEventListener('click', function () {
      caja.removeAttribute('data-crudo');
      tapa.classList.add('rd-ida');
      setTimeout(function () { if (tapa.parentNode) tapa.parentNode.removeChild(tapa); }, 500);
    });

    caja.appendChild(tapa);
  }

  function taparCrudos() {
    if (loResuelveLaColeccion()) return;
    taparUno(document.getElementById('video-embed'), 'Nuestro video');
    taparUno(document.getElementById('spotify-embed'), 'La playlist');
  }


  /* ── REGLA 4: ningun texto ilegible ───────────────────────────────────── */

  function aRGB(s) {
    var m = String(s).match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
  }

  function luminancia(c) {
    var r = [c[0], c[1], c[2]].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
  }

  function contraste(a, b) {
    var L1 = luminancia(a), L2 = luminancia(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  /* El fondo de verdad: el primer ancestro con color OPACO.
     Devuelve null si en el camino hay una FOTO — ahi no se mide ni se toca. */
  function fondoSolido(el) {
    var n = el;
    while (n && n !== document.documentElement) {
      var cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      var c = aRGB(cs.backgroundColor);
      if (c && c[3] >= 0.85) return c;
      n = n.parentElement;
    }
    return null;
  }

  function aHSL(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var h = 0, s = 0, l = (mx + mn) / 2, d = mx - mn;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }

  function deHSL(h, s, l) {
    function f(n) {
      var k = (n + h / 30) % 12;
      var a = s * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))));
    }
    return [f(0), f(8), f(4), 1];
  }

  /* Conserva el tono; mueve SOLO la claridad, hacia el lado contrario al
     fondo, hasta alcanzar el minimo. Si ni el extremo alcanza, deja el
     extremo: siempre mejor que lo que habia. */
  function corregir(frente, fondo, minimo) {
    var hsl = aHSL(frente);
    var haciaOscuro = luminancia(fondo) > 0.45;
    var mejor = null;
    for (var paso = 1; paso <= 40; paso++) {
      var l = haciaOscuro ? hsl[2] - paso * 0.025 : hsl[2] + paso * 0.025;
      if (l < 0 || l > 1) break;
      var c = deHSL(hsl[0], hsl[1], l);
      mejor = c;
      if (contraste(c, fondo) >= minimo) return c;
    }
    return mejor;
  }

  function legibles() {
    var marco = elMarco();
    if (!marco) return;
    ponerCss();

    var nodos = marco.querySelectorAll('*');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el.getAttribute('data-regla-luz')) continue;

      var esCampo = /^(INPUT|TEXTAREA)$/.test(el.tagName);
      if (!esCampo) {
        if (el.children.length) continue;                    /* solo hojas de texto */
        if ((el.textContent || '').trim().length < 2) continue;
      }

      var cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (parseFloat(cs.opacity) < 0.15) continue;

      var r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) continue;

      var fondo = fondoSolido(el);
      if (!fondo) continue;                                  /* ⚠️ hay foto: no se toca */

      var frente = aRGB(cs.color);
      if (!frente || frente[3] < 0.85) continue;

      var px = parseFloat(cs.fontSize) || 14;
      var grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      var minimo = grande ? 3 : 4.5;

      if (contraste(frente, fondo) >= minimo) {
        el.setAttribute('data-regla-luz', 'ok');
        continue;
      }

      var nuevo = corregir(frente, fondo, minimo);
      if (!nuevo) continue;
      el.style.color = 'rgb(' + nuevo[0] + ',' + nuevo[1] + ',' + nuevo[2] + ')';
      el.setAttribute('data-regla-luz', 'corregido');
    }
  }


  /* ── el ciclo ─────────────────────────────────────────────────────────── */

  function pasada() {
    if (!elMarco()) return;
    if (!hayDatos()) return;      /* ⚠️ sin datos no se decide nada */
    sacarLaFrase();
    subirLaCarta();
    taparCrudos();
    legibles();
  }

  function arrancar() {
    pasada();
    var t0 = Date.now();
    var t = setInterval(function () {
      pasada();
      if (Date.now() - t0 > HASTA) clearInterval(t);
    }, CADA);
    window.addEventListener('message', function () { setTimeout(pasada, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
