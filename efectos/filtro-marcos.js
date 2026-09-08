/* ============================================================================
   LOS MARCOS DEL FILTRO · seis diseños que se visten con la invitación
   ============================================================================

   LA IDEA, EN UNA LÍNEA
   El marco NO es una imagen: es una receta. Se dibuja en el momento leyendo la
   invitación, así que una boda en verde salvia y unos XV en rosa palo salen
   distintos sin que nadie diseñe nada dos veces.

   QUÉ LEE DE LA INVITACIÓN
   · el tipo de evento  → la frase de arriba («En la boda de», «En los XV de»…)
   · la paleta          → los colores del filete, del texto y de la cinta
   · la tipografía      → la misma letra de los nombres de la portada
   · la colección       → si está Perlas, el marco lleva su hilo de perlas
   · los nombres, la fecha y el hashtag

   ⚠️ LA LISTA DE DISEÑOS VIVE ACÁ Y EN NINGÚN OTRO LADO. El panel la lee de
      `window.INVFILTRO.disenos` y dibuja sus miniaturas con ESTA misma función.
      Si se copia la lista a otro archivo, tarde o temprano una copia queda
      vieja y la miniatura deja de coincidir con lo que ve el invitado. Es el
      mismo criterio que `window.INVPALETAS`.

   ⚠️ SE DIBUJA CON CANVAS, NO CON SVG. Un SVG dentro de un `<img>` no descarga
      tipografías web: los nombres saldrían en una letra cualquiera. Canvas sí
      usa las que la página ya cargó. (Y de paso evita el `#` de los colores,
      que en un `data:image/svg+xml` hay que escribir `%23`.)

   ⚠️ NADA DE LA BODA DE EJEMPLO. Si no hay nombres, no se escribe ni la frase
      ni la fecha: un marco con datos inventados es peor que un marco vacío.

   ⚠️ LOS TEXTOS QUE LEE EL INVITADO VAN EN ESPAÑOL DE MÉXICO, no en voseo.
   ============================================================================ */
(function () {

  var ANCHO = 1080, ALTO = 1920;

  /* La frase de arriba, según el tipo de evento. Son las MISMAS seis claves que
     ya usa el motor para adaptar los textos (ver i/index.html, «Adaptar textos
     según el tipo de evento»): boda, xv, bautismo, comunion, cumple, otro. */
  var FRASES = {
    boda:     'En la boda de',
    xv:       'En los XV de',
    bautismo: 'En el bautizo de',
    comunion: 'En la comunión de',
    cumple:   'En el cumple de',
    otro:     'En la fiesta de'
  };

  var DISENOS = [
    ['filete',   'Filete',   'Dos líneas finas y los nombres abajo. El más clásico.'],
    ['arco',     'Arco',     'Un arco alto, como los de la colección Perlas.'],
    ['tarjeta',  'Tarjeta',  'Una tarjetita traslúcida abajo, tipo place card.'],
    ['cinta',    'Cinta',    'Una banda del color de la paleta, abajo de todo.'],
    ['esquinas', 'Esquinas', 'Sólo las puntas y una línea chica. El más discreto.'],
    ['sello',    'Sello',    'Un lacre redondo con las iniciales y la fecha.']
  ];

  /* ------------------------------------------------------------------ tema */

  function varCss(nombre, siNo) {
    var v = '';
    try {
      v = getComputedStyle(document.documentElement).getPropertyValue(nombre) || '';
    } catch (e) {}
    return (v || '').trim() || siNo;
  }

  function mesEnLetras(d) {
    var M = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
             'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return d.getDate() + ' de ' + M[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function textoFecha(ev) {
    var t = String(ev.fechaTexto || '').trim();
    if (t) return t.slice(0, 40);
    var f = ev.fecha || ev.fechaISO || '';
    if (!f) return '';
    var d = new Date(f);
    return isNaN(d.getTime()) ? '' : mesEnLetras(d);
  }

  function fraseDe(ev, cfg) {
    var puesta = String((cfg && cfg.frase) || '').trim();
    if (puesta) return puesta.slice(0, 60);
    var t = String(ev.tipoEvento || ev.tipo || 'boda').toLowerCase();
    return FRASES[t] || FRASES.otro;
  }

  /* ⚠️ EN EL PANEL NO SE PUEDEN LEER LAS VARIABLES DE COLOR DE LA INVITACIÓN.
     En /admin.html, `--verde` es el bordó del panel y `--cream` no existe: si
     los colores salieran de ahí, las miniaturas mentirían sobre lo que va a ver
     el invitado. La fuente de verdad es `window.INVPALETAS`, que publica
     paleta.js y sí está disponible en los dos lados. Las variables de CSS
     quedan sólo de respaldo, para una invitación sin paleta elegida.
     (Es la misma trampa que ya estaba anotada en panel-dresscode.js.)
     ⚠️ Y `fx.paleta` es un OBJETO `{id:"..."}`, no un texto — aunque alguna
        invitación vieja lo tenga como texto. Se aceptan las dos formas. */
  function paletaDe(id) {
    if (!id || !window.INVPALETAS) return null;
    for (var i = 0; i < window.INVPALETAS.length; i++) {
      if (window.INVPALETAS[i].id === id) return window.INVPALETAS[i];
    }
    return null;
  }

  function idPaleta(ev, extra) {
    if (extra && extra.paletaId) return String(extra.paletaId);
    var p = ev && ev.fx && ev.fx.paleta;
    if (!p) return '';
    return String(typeof p === 'string' ? p : (p.id || ''));
  }

  /* Junta todo lo que hace falta para dibujar.
     ⚠️ El segundo argumento existe para el PANEL: ahí no hay `INVEV`, pero sí
        está `D`, el borrador, que tiene los mismos nombres de campo. Pasándolo
        acá, la miniatura se calcula con ESTE código —la frase automática, la
        fecha en letras, las iniciales— y no con una copia que se queda vieja. */
  function tema(extra, evDado) {
    var ev = evDado || window.INVEV || {};
    var cfg = (ev.fx && ev.fx.filtro) || {};
    var pal = paletaDe(idPaleta(ev, extra));
    var n1 = String(ev.n1 || '').trim();
    var n2 = String(ev.n2 || '').trim();

    var T = {
      diseno:   String(cfg.diseno || 'filete'),
      nombres:  (n1 && n2) ? (n1 + ' & ' + n2) : (n1 || n2 || ''),
      iniciales: ((n1.charAt(0) || '') + (n2.charAt(0) || '')).toUpperCase(),
      fecha:    textoFecha(ev),
      frase:    fraseDe(ev, cfg),
      hashtag:  String(ev.igHashtag || '').trim(),
      fuente:   (ev.nfont && String(ev.nfont)) || "'Great Vibes', cursive",
      coleccion: String((ev.fx && ev.fx.coleccion) || ''),
      /* colores: el claro va sobre la foto, el oscuro es para la cinta */
      tinta:    String(cfg.colorMarco || '') || (pal && pal.cream) || varCss('--cream', '#F2E9D8'),
      oscuro:   (pal && pal.verde) || varCss('--verde', '#3B2A32'),
      metal:    (pal && pal.oro)   || varCss('--oro',   '#C6A96B')
    };
    if (extra) for (var k in extra) if (extra[k] !== undefined) T[k] = extra[k];
    return T;
  }

  /* -------------------------------------------------------------- utilería */

  /* canvas no tiene letter-spacing: se mete un espacio fino a mano. */
  var FINO = String.fromCharCode(0x2009);
  function espaciar(s) { return String(s).split('').join(FINO); }

  function velo(x, desde, hasta) {
    var g = x.createLinearGradient(0, ALTO * desde, 0, ALTO);
    g.addColorStop(0, 'rgba(20,12,16,0)');
    g.addColorStop(1, 'rgba(20,12,16,' + hasta + ')');
    x.fillStyle = g;
    x.fillRect(0, ALTO * desde, ANCHO, ALTO * (1 - desde));
  }

  function entra(x, texto, fuente, tamMax, anchoMax) {
    var t = tamMax;
    x.font = t + 'px ' + fuente;
    while (t > 34 && x.measureText(texto).width > anchoMax) {
      t -= 4; x.font = t + 'px ' + fuente;
    }
    return t;
  }

  /* El bloque de tres (o cuatro) renglones. `y` es la base de los NOMBRES.
     Devuelve la y del último renglón, por si hay que colgar algo debajo. */
  function bloque(x, T, y, col, escala) {
    var e = escala || 1;
    if (!T.nombres) return y;          /* sin nombres no se inventa nada */

    x.textAlign = 'center';
    x.fillStyle = col;

    if (T.frase) {
      x.font = Math.round(38 * e) + "px 'Forum', 'Cormorant Garamond', Georgia, serif";
      x.globalAlpha = 0.88;
      x.fillText(espaciar(T.frase.toUpperCase()), ANCHO / 2, y - Math.round(118 * e));
      x.globalAlpha = 1;
    }

    entra(x, T.nombres, T.fuente, Math.round(120 * e), ANCHO - 220);
    x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 18; x.shadowOffsetY = 3;
    x.fillText(T.nombres, ANCHO / 2, y);
    x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;

    var ultima = y;
    if (T.fecha) {
      ultima = y + Math.round(112 * e);
      x.font = Math.round(42 * e) + "px 'Forum', 'Cormorant Garamond', Georgia, serif";
      x.globalAlpha = 0.92;
      x.fillText(espaciar(T.fecha.toUpperCase()), ANCHO / 2, ultima);
      x.globalAlpha = 1;
    }
    if (T.hashtag) {
      ultima = ultima + Math.round(66 * e);
      x.font = Math.round(34 * e) + "px 'Forum', 'Cormorant Garamond', Georgia, serif";
      x.globalAlpha = 0.7;
      x.fillText(T.hashtag, ANCHO / 2, ultima);
      x.globalAlpha = 1;
    }
    return ultima;
  }

  /* El hilo de perlas de la colección. Sólo cuando la colección está puesta y
     el diseño tiene aire: en la cinta y en el sello quedaría amontonado. */
  function perlas(x, T, y) {
    if (T.coleccion !== 'perlas') return;
    var n = 11, paso = 26, r = 7;
    var x0 = ANCHO / 2 - ((n - 1) * paso) / 2;
    for (var i = 0; i < n; i++) {
      var g = x.createRadialGradient(x0 + i * paso - 2, y - 2, 1, x0 + i * paso, y, r);
      g.addColorStop(0, 'rgba(255,255,255,.95)');
      g.addColorStop(1, T.tinta);
      x.fillStyle = g;
      x.globalAlpha = 0.85;
      x.beginPath(); x.arc(x0 + i * paso, y, r, 0, Math.PI * 2); x.fill();
      x.globalAlpha = 1;
    }
  }

  /* ------------------------------------------------------------ los diseños */

  function dFilete(x, T) {
    velo(x, 0.58, '.46');
    x.strokeStyle = T.tinta;
    x.globalAlpha = 0.9;  x.lineWidth = 4; x.strokeRect(46, 46, ANCHO - 92, ALTO - 92);
    x.globalAlpha = 0.55; x.lineWidth = 2; x.strokeRect(66, 66, ANCHO - 132, ALTO - 132);
    x.globalAlpha = 1;
    bloque(x, T, ALTO - 380, T.tinta);
    /* ⚠️ Las perlas van ARRIBA de la frase, no debajo de los nombres: probado
       en el panel, ahí se montaban justo encima de la fecha. */
    perlas(x, T, ALTO - 600);
  }

  function dArco(x, T) {
    velo(x, 0.55, '.5');
    /* Un arco abierto abajo: dos líneas rectas y un semicírculo arriba. */
    function arco(inset, ancho, alpha) {
      x.globalAlpha = alpha; x.lineWidth = ancho;
      x.beginPath();
      x.moveTo(150 + inset, 1230);
      x.lineTo(150 + inset, 640);
      x.arc(ANCHO / 2, 640, 390 - inset, Math.PI, 0);
      x.lineTo(930 - inset, 1230);
      x.stroke();
      x.globalAlpha = 1;
    }
    x.strokeStyle = T.metal; arco(0, 4, 0.85);
    x.strokeStyle = T.tinta; arco(22, 2, 0.5);
    bloque(x, T, ALTO - 400, T.tinta);
    perlas(x, T, 1300);
  }

  function dTarjeta(x, T) {
    velo(x, 0.6, '.4');
    var x0 = 96, y0 = 1330, an = ANCHO - 192, al = 470, r = 26;
    x.beginPath();
    x.moveTo(x0 + r, y0);
    x.arcTo(x0 + an, y0, x0 + an, y0 + al, r);
    x.arcTo(x0 + an, y0 + al, x0, y0 + al, r);
    x.arcTo(x0, y0 + al, x0, y0, r);
    x.arcTo(x0, y0, x0 + an, y0, r);
    x.closePath();
    x.fillStyle = 'rgba(18,12,16,.38)'; x.fill();
    x.strokeStyle = T.tinta; x.globalAlpha = 0.6; x.lineWidth = 2; x.stroke();
    x.globalAlpha = 1;
    bloque(x, T, y0 + 250, T.tinta, 0.86);
  }

  function dCinta(x, T) {
    var alto = 430;
    x.globalAlpha = 0.93;
    x.fillStyle = T.oscuro;
    x.fillRect(0, ALTO - alto, ANCHO, alto);
    x.globalAlpha = 1;
    /* un filo metálico arriba de la cinta, que le da el borde caro */
    x.strokeStyle = T.metal; x.globalAlpha = 0.75; x.lineWidth = 3;
    x.beginPath(); x.moveTo(0, ALTO - alto); x.lineTo(ANCHO, ALTO - alto); x.stroke();
    x.globalAlpha = 1;
    bloque(x, T, ALTO - 210, T.tinta, 0.82);
  }

  function dEsquinas(x, T) {
    velo(x, 0.7, '.42');
    var m = 62, l = 130;
    x.strokeStyle = T.tinta; x.lineWidth = 4; x.globalAlpha = 0.9;
    [[m, m, 1, 1], [ANCHO - m, m, -1, 1], [m, ALTO - m, 1, -1], [ANCHO - m, ALTO - m, -1, -1]]
      .forEach(function (e) {
        x.beginPath();
        x.moveTo(e[0] + e[2] * l, e[1]);
        x.lineTo(e[0], e[1]);
        x.lineTo(e[0], e[1] + e[3] * l);
        x.stroke();
      });
    x.globalAlpha = 1;
    bloque(x, T, ALTO - 320, T.tinta, 0.72);
  }

  function dSello(x, T) {
    velo(x, 0.6, '.44');
    var cx = ANCHO / 2, cy = 1470, r = 152;
    x.strokeStyle = T.metal; x.globalAlpha = 0.9; x.lineWidth = 4;
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = T.tinta; x.globalAlpha = 0.5; x.lineWidth = 2;
    x.beginPath(); x.arc(cx, cy, r - 16, 0, Math.PI * 2); x.stroke();
    x.globalAlpha = 1;

    if (T.iniciales) {
      x.textAlign = 'center';
      x.fillStyle = T.tinta;
      entra(x, T.iniciales, T.fuente, 150, r * 1.5);
      x.fillText(T.iniciales, cx, cy + 46);
    }
    /* Debajo del sello: la frase y la fecha, sin repetir los nombres. */
    x.textAlign = 'center'; x.fillStyle = T.tinta;
    if (T.frase && T.nombres) {
      x.font = "36px 'Forum', 'Cormorant Garamond', Georgia, serif";
      x.globalAlpha = 0.85;
      x.fillText(espaciar((T.frase + ' ' + T.nombres).toUpperCase()), cx, cy + r + 92);
      x.globalAlpha = 1;
    }
    if (T.fecha && T.nombres) {
      x.font = "38px 'Forum', 'Cormorant Garamond', Georgia, serif";
      x.globalAlpha = 0.9;
      x.fillText(espaciar(T.fecha.toUpperCase()), cx, cy + r + 168);
      x.globalAlpha = 1;
    }
  }

  var COMO = {
    filete: dFilete, arco: dArco, tarjeta: dTarjeta,
    cinta: dCinta, esquinas: dEsquinas, sello: dSello
  };

  /* ---------------------------------------------------------------- salida */

  /* Devuelve un canvas de 1080 × 1920 con el marco dibujado y el resto
     transparente, listo para ponerle la foto abajo. */
  function dibujar(T) {
    T = T || tema();
    var c = document.createElement('canvas');
    c.width = ANCHO; c.height = ALTO;
    var x = c.getContext('2d');
    (COMO[T.diseno] || dFilete)(x, T);
    return c;
  }

  window.INVFILTRO = {
    ANCHO: ANCHO, ALTO: ALTO,
    disenos: DISENOS,
    frases: FRASES,
    tema: tema,
    dibujar: dibujar
  };
})();
