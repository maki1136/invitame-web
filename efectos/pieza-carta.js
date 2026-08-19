/* ===== LA PIEZA ESCRITA =======================================================

   QUÉ HACE
   Algunos sobres del catálogo no son un sobre que se abre: son una TARJETA
   troquelada, filmada con un acercamiento lento, que llega y se queda quieta.
   La tarjeta está GENERADA EN BLANCO a propósito. Este módulo escribe encima,
   en el momento justo, los datos de la pareja que ya están cargados en la
   invitación: los nombres, la fecha, la hora y el lugar.

   POR QUÉ EN BLANCO Y NO IMPRESA
   Si los nombres vinieran quemados en el video, ese video serviría para una
   sola pareja. En blanco, el mismo archivo sirve para las 50 muestras y para
   todos los clientes. Es la misma idea que ya se usa con las iniciales sobre
   el lacre.

   POR QUÉ EN SVG Y NO EN DIVS
   El video es 720x1280 y se muestra con `object-fit:cover`, que recorta y
   escala distinto en cada pantalla. Un <svg> con viewBox="0 0 720 1280" y
   preserveAspectRatio="xMidYMid slice" hace EXACTAMENTE el mismo recorte que
   `cover`, así que las coordenadas medidas sobre la imagen valen tal cual, sin
   una sola cuenta de por medio. Y <text> se posiciona por LÍNEA DE BASE, que
   es lo único estable cuando cambia la tipografía.

   DE DÓNDE SALEN LAS MEDIDAS
   De medir la imagen, no de estimarla. Para la tarjeta toscana: el eje está en
   x=399 (la corona de arriba y la hojita de abajo están las dos centradas ahí),
   la cara útil va de y=330 a y=775, y a la altura de las mayúsculas la cara
   mide 390 px de ancho — por eso el texto no puede pasar de 300.

   QUÉ NO HACE
   No toca el motor. El video ya trae al final unos segundos de imagen quieta;
   la escritura pasa ahí. Cuando el video termina, el motor hace lo de siempre
   y entra la invitación.
   ============================================================================ */
(function () {

  var NS = 'http://www.w3.org/2000/svg';

  /* ---- 1. de dónde saco cada dato ------------------------------------- */

  function fechaYHora(ev) {
    var s = String(ev.fecha || '');
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return { fecha: '', hora: '' };
    return {
      fecha: m[3] + ' · ' + m[2] + ' · ' + m[1],
      hora:  (m[4] != null) ? ('A LAS ' + m[4] + ':' + m[5] + ' HORAS') : ''
    };
  }

  /* De "Strada della Val d'Orcia 14, Pienza, Siena, Italia" queremos
     "PIENZA · SIENA": la calle no aporta y no entra en el ancho de la tarjeta. */
  function zona(dir) {
    var p = String(dir || '').split(',').map(function (s) { return s.trim(); })
              .filter(function (s) { return s.length; });
    if (p.length <= 1) return (p[0] || '').toUpperCase();
    return p.slice(1, 3).join(' · ').toUpperCase();
  }

  function datos(ev) {
    var fh = fechaYHora(ev);
    var pz = (ev.fx && ev.fx.pieza) || {};
    var usarFiesta = (pz.lugar !== 'ceremonia');
    var sub = (usarFiesta ? ev.ev2sub : ev.ev1sub) || ev.ev1sub || ev.ev2sub || ev.cer || '';
    var dir = (usarFiesta ? ev.ev2dir : ev.ev1dir) || ev.ev1dir || ev.ev2dir || '';
    return {
      k1:    (pz.linea1 != null ? pz.linea1 : 'JUNTO A SUS FAMILIAS').toUpperCase(),
      k2:    (pz.linea2 != null ? pz.linea2 : 'TIENEN EL AGRADO DE INVITARTE').toUpperCase(),
      n1:    ev.n1 || '',
      n2:    ev.n2 || '',
      nexo:  (pz.nexo != null ? pz.nexo : 'y'),
      fecha: (pz.fecha === false) ? '' : fh.fecha,
      hora:  (pz.fecha === false || pz.hora === false) ? '' : fh.hora,
      lug1:  (pz.lugar === false) ? '' : String(sub).toUpperCase(),
      lug2:  (pz.lugar === false) ? '' : zona(dir)
    };
  }

  /* ---- 2. dibujar ------------------------------------------------------ */

  function svgTexto(txt, x, y, fam, size, tracking, fill) {
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', fam);
    t.setAttribute('font-size', size);
    t.setAttribute('fill', fill);
    t.setAttribute('opacity', 0);
    if (tracking) {
      t.setAttribute('letter-spacing', tracking);
      /* letter-spacing suma un hueco DESPUÉS de la última letra: sin este
         corrimiento el renglón queda media letra a la izquierda. */
      t.setAttribute('dx', tracking / 2);
    }
    t.textContent = txt;
    return t;
  }

  /* Achica la tipografía hasta que el renglón entre en el ancho disponible.
     Se mide de verdad con getComputedTextLength(): un número escrito a mano se
     desactualiza en silencio el día que se cambia la tipografía. */
  function entrar(t, maxw, size, minimo) {
    var s = size;
    while (s > (minimo || 8)) {
      var w = 0;
      try { w = t.getComputedTextLength(); } catch (e) { break; }
      if (w <= maxw) break;
      t.setAttribute('font-size', --s);
    }
  }

  function construir(svg, D, G) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var SERIF  = G.serif  || "'Cormorant Garamond',Georgia,serif";
    var SCRIPT = G.script || "'Pinyon Script',cursive";
    var eje = G.eje, L = G.lineas, T = G.tam, A = G.ancho;
    var el = {};

    function add(clave, txt, y, fam, size, tr, maxw, minimo) {
      if (!txt) return null;
      var t = svgTexto(txt, eje, y, fam, size, tr, G.tinta);
      svg.appendChild(t);
      entrar(t, maxw, size, minimo);
      (el[clave] = el[clave] || []).push(t);
      return t;
    }

    add('k', D.k1, L.k1, SERIF, T.k, 4.0, A.k);
    add('k', D.k2, L.k2, SERIF, T.k, 4.0, A.k);
    var t1 = add('n1', D.n1, L.n1, SCRIPT, T.n, 0, A.n, 44);
    var t2 = add('n2', D.n2, L.n2, SCRIPT, T.n, 0, A.n, 44);

    /* El nexo va centrado ENTRE LA TINTA de los dos nombres, no entre sus
       líneas de base: una manuscrita deja mucho aire arriba y si te guiás por
       la caja, el nexo queda pegado al segundo nombre. */
    if (D.nexo && t1 && t2) {
      var b1 = t1.getBBox(), b2 = t2.getBBox();
      var tn = svgTexto(D.nexo, eje, 0, SCRIPT, T.nexo, 0, G.tinta);
      svg.appendChild(tn);
      var bn = tn.getBBox();
      tn.setAttribute('y', (b1.y + b1.height + b2.y) / 2 - bn.height / 2 - bn.y);
      el.y = [tn];
    }

    if (D.fecha) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('opacity', 0);
      g.setAttribute('stroke', G.oro);
      g.setAttribute('fill', 'none');
      g.innerHTML =
        '<line x1="' + (eje - 62) + '" y1="' + L.filete + '" x2="' + (eje - 17) + '" y2="' + L.filete + '"/>' +
        '<line x1="' + (eje + 17) + '" y1="' + L.filete + '" x2="' + (eje + 62) + '" y2="' + L.filete + '"/>' +
        '<circle cx="' + eje + '" cy="' + L.filete + '" r="6"/>';
      svg.appendChild(g);
      el.f = [g];
    }
    add('f',   D.fecha, L.fecha, SERIF, T.fecha, 6.0, A.fecha);
    add('f',   D.hora,  L.hora,  SERIF, T.hora,  3.0, A.fecha);
    add('lug', D.lug1,  L.lug1,  SERIF, T.lug1,  3.2, A.lug);
    add('lug', D.lug2,  L.lug2,  SERIF, T.lug2,  2.8, A.lug);
    return el;
  }

  /* ---- 3. el tiempo ---------------------------------------------------- */

  /* Cada bloque entra un poco después del anterior y sube unos píxeles
     mientras aparece. Los tiempos son relativos al arranque de la escritura. */
  var GUION = [
    ['k',   0.45, 1.15, 9],
    ['n1',  0.95, 1.75, 14],
    ['y',   1.40, 2.00, 7],
    ['n2',  1.70, 2.50, 14],
    ['f',   2.30, 3.00, 7],
    ['lug', 2.65, 3.35, 7]
  ];

  function suave(t) { return 1 - Math.pow(1 - t, 3); }

  function pintar(el, t) {
    for (var i = 0; i < GUION.length; i++) {
      var g = GUION[i], nodos = el[g[0]];
      if (!nodos) continue;
      var p = (t <= g[1]) ? 0 : (t >= g[2] ? 1 : suave((t - g[1]) / (g[2] - g[1])));
      for (var j = 0; j < nodos.length; j++) {
        nodos[j].setAttribute('opacity', p);
        nodos[j].setAttribute('transform', p >= 1 ? '' : 'translate(0,' + (g[3] * (1 - p)).toFixed(2) + ')');
      }
    }
  }

  /* ---- 4. engancharse al sobre ----------------------------------------- */

  function cargarTipografias(fams) {
    if (!fams || document.getElementById('pieza-fuentes')) return;
    var l = document.createElement('link');
    l.id = 'pieza-fuentes'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + fams + '&display=swap';
    document.head.appendChild(l);
  }

  function arrancar() {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    var ev  = window.INVEV;
    if (!env || !vid || !ev) return false;

    var modelo = (ev.fx && ev.fx.sobre && ev.fx.sobre.modelo) || ev.sobreTipo;
    var G = (window.SOBRES_INVITAME || {})[modelo] && window.SOBRES_INVITAME[modelo].texto;
    if (!G) return true;                       /* este sobre no se escribe */
    if (document.getElementById('pieza-svg')) return true;

    cargarTipografias(G.fuentes);

    var svg = document.createElementNS(NS, 'svg');
    svg.id = 'pieza-svg';
    svg.setAttribute('viewBox', '0 0 ' + G.base[0] + ' ' + G.base[1]);
    /* "slice" es exactamente lo que hace object-fit:cover */
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.cssText = 'position:absolute;pointer-events:none;z-index:3';
    env.appendChild(svg);

    /* El <svg> tiene que quedar EXACTAMENTE encima del video. En la compu el
       video está centrado y con su propio tamaño (ver catalogo.js), así que
       copiamos su rectángulo en vez de estirarnos a toda la pantalla. */
    function calzar() {
      var r = vid.getBoundingClientRect(), e = env.getBoundingClientRect();
      if (!r.width) return;
      svg.style.left   = (r.left - e.left) + 'px';
      svg.style.top    = (r.top  - e.top)  + 'px';
      svg.style.width  = r.width  + 'px';
      svg.style.height = r.height + 'px';
    }

    var el = construir(svg, datos(ev), G);
    calzar();
    window.addEventListener('resize', calzar);

    var desde = G.desde || 0;
    var vivo  = true;

    function tic() {
      if (!vivo) return;
      pintar(el, vid.ended ? 999 : (vid.currentTime || 0) - desde);
      requestAnimationFrame(tic);
    }
    requestAnimationFrame(tic);

    /* RESPALDO. Si a los 5 segundos el video ni siquiera arrancó — Safari en
       Mac bloquea la reproducción automática cuando la preferencia está en
       "Detener contenido multimedia" — lo llevamos al final y dejamos el texto
       puesto, para que el cuadro que se ve coincida con el lugar donde está
       escrito.

       ⚠️ Acá había un error: el respaldo pintaba una vez y el bucle de arriba
       lo borraba en el cuadro siguiente, porque volvía a calcular todo desde
       currentTime=0. Por eso ahora corta el bucle con `vivo`.

       Y si el video ni siquiera cargó (readyState 0), NO escribimos: el texto
       está medido para el cuadro final, y sobre el cuadro de apertura — que es
       un plano abierto — caería en cualquier lado. Mejor sin texto que torcido.
       ------------------------------------------------------------------- */
    setTimeout(function () {
      if (vid.currentTime > 0) return;
      vivo = false;
      if (vid.readyState >= 2) {
        try { vid.currentTime = Math.max(0, (vid.duration || 0) - 0.05); } catch (e) {}
        pintar(el, 999);
      }
    }, 5000);

    return true;
  }

  var intentos = 0;
  var t = setInterval(function () {
    if (arrancar() || ++intentos > 60) clearInterval(t);
  }, 250);
})();
