/* ===== ESPAÑOL DE MÉXICO ======================================================

   EL PROBLEMA
   El motor está escrito en voseo argentino: "Tocá el sello", "Rascá para
   revelar", "Ingresá", "Compartí la invitación", "si querés tener un detalle"…
   El mercado de Invítame es MÉXICO. Para una novia de Guadalajara o de San
   Miguel de Allende ese "vos" suena extranjero y delata que la invitación no
   es local. Es de las cosas que más rápido rompen la ilusión de producto
   propio.

   QUÉ HACE
   Cuando el evento está en español de México, cambia esos textos por su forma
   mexicana. Sólo toca los textos FIJOS del motor: nada de lo que escriben las
   diseñadoras ni los novios.

   DE DÓNDE SALE LA LISTA — esto importa
   No se armó a ojo mirando la pantalla: se sacó del `index.html` entero,
   buscando todas las palabras de voseo del motor de una sola vez. Son 18.
   Buscarlas mirando la pantalla no alcanza, porque muchas recién aparecen
   cuando el invitado abre el sobre, juega a ¡Pregúntame! o manda el
   formulario, y así siempre se escapa alguna.

   ⚠️ NO SON VOSEO, no tocarlas nunca: "Mamá", "Papá", "está", "esté", "aquí",
   "asistiré", "podré". Terminan igual pero son correctas en todo el idioma.
   Si alguna se colara en la lista, la invitación diría "Mama y Papa".

   CÓMO COMPARA
   Por PALABRA ENTERA, no por pedacito, así ningún apellido ni palabra larga
   sale cambiada de adentro. Y respeta la mayúscula inicial: "Ingresá" queda
   "Ingresa" y "ingresá" queda "ingresa".

   CUÁNDO SE ACTIVA
   · Si `INVEV.idioma` dice México (es lo normal), o
   · si `INVEV.fx.idioma.mx` está encendido, o
   · con `?mx=1` para probar.
   Si el evento estuviera en español rioplatense, no hace nada.

   ⚠️ AL AGREGAR PALABRAS: no sumar "vos" ni "che". Aparecen adentro de otras
   palabras y de apellidos, y el reemplazo rompería frases enteras.

   CÓMO VOLVER A CHEQUEAR SI EL MOTOR CAMBIA
   En la consola de la invitación:
     fetch('/prueba/index.html').then(r=>r.text()).then(s=>
       console.log([...new Set(s.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,}(á|é|í)(?![\wÁÉÍÓÚÜÑáéíóúüñ])/g))].sort()))
   y comparar contra PALABRAS.

   PENDIENTE: cuando haya que subir el `index.html` a mano, corregir los textos
   en el origen y borrar este módulo. Mientras tanto esto lo resuelve sin tocar
   los archivos grandes.
   ============================================================================ */
(function () {
  'use strict';

  /* Frases completas. Van primero, porque algunas se traducen distinto que la
     palabra suelta ("Pasá la voz" no es "Pasa la voz", es "Corre la voz"). */
  var FRASES = [
    ['Pasá el dedo para descubrir', 'Desliza el dedo para descubrir'],
    ['Pasá la voz',                 'Corre la voz'],
    ['Si querés tener un detalle',  'Si quieres tener un detalle'],
    ['dejamos nuestras mesas',      'aquí están nuestras mesas']
  ];

  /* Palabras sueltas, comparadas enteras. En minúscula: la mayúscula inicial
     se devuelve después si la traía.
     Las 18 que están de verdad en el motor van marcadas con ★. */
  var PALABRAS = {
    'abrí': 'abre',            /* ★ */
    'compartí': 'comparte',    /* ★ */
    'entrá': 'entra',          /* ★ */
    'escribí': 'escribe',      /* ★ */
    'escuchá': 'escucha',      /* ★ */
    'esperá': 'espera',        /* ★ */
    'ingresá': 'ingresa',      /* ★ el botón del sobre */
    'jugá': 'juega',           /* ★ ¡Pregúntame! */
    'mirá': 'mira',            /* ★ */
    'pasá': 'pasa',            /* ★ */
    'probá': 'prueba',         /* ★ */
    'rascá': 'raspa',          /* ★ la raspadita de la fecha */
    'recargá': 'recarga',      /* ★ */
    'subí': 'sube',            /* ★ subir fotos */
    'sumá': 'agrega',          /* ★ "Sumá tu canción" → "Agrega tu canción" */
    'sugerí': 'sugiere',       /* ★ sugerir una canción */
    'tocá': 'toca',            /* ★ */
    'rasca': 'raspa',

    /* previsión: si mañana el motor suma alguno, ya está resuelto */
    'confirmá': 'confirma', 'elegí': 'elige', 'agendá': 'agenda',
    'descargá': 'descarga', 'escribinos': 'escríbenos', 'contanos': 'cuéntanos',
    'contame': 'cuéntame', 'avisanos': 'avísanos', 'avisá': 'avisa',
    'acordate': 'recuerda', 'fijate': 'fíjate', 'anotá': 'anota',
    'seguí': 'sigue', 'buscá': 'busca', 'sacá': 'saca', 'poné': 'pon',
    'dejá': 'deja', 'volvé': 'vuelve', 'cerrá': 'cierra', 'enviá': 'envía',
    'mandá': 'manda', 'llená': 'llena', 'revisá': 'revisa', 'copiá': 'copia',
    'sumate': 'únete', 'vení': 'ven', 'andá': 've', 'hacé': 'haz',
    'tené': 'ten', 'empezá': 'empieza', 'guardá': 'guarda',
    'elegila': 'elígela', 'tocalo': 'tócalo', 'mirala': 'mírala',

    /* presente del voseo */
    'querés': 'quieres', 'podés': 'puedes', 'tenés': 'tienes', 'sabés': 'sabes'
  };

  var CLAVES = Object.keys(PALABRAS).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp('(^|[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(' +
    CLAVES.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') +
    ')(?![0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ])', 'gi');

  function conMayuscula(original, nuevo) {
    var c = original.charAt(0);
    if (c === c.toUpperCase() && c !== c.toLowerCase()) {
      return nuevo.charAt(0).toUpperCase() + nuevo.slice(1);
    }
    return nuevo.charAt(0).toLowerCase() + nuevo.slice(1);
  }

  function traducir(txt) {
    var s = txt, i;
    for (i = 0; i < FRASES.length; i++) {
      if (s.indexOf(FRASES[i][0]) > -1) s = s.split(FRASES[i][0]).join(FRASES[i][1]);
    }
    RE.lastIndex = 0;
    /* dos pasadas: si dos palabras van pegadas, la primera se come el espacio
       que la segunda necesitaba como límite y quedaría sin cambiar */
    s = s.replace(RE, reemplazo);
    RE.lastIndex = 0;
    return s.replace(RE, reemplazo);
  }

  function reemplazo(todo, antes, palabra) {
    var destino = PALABRAS[palabra.toLowerCase()];
    if (!destino) return todo;
    return antes + conMayuscula(palabra, destino);
  }

  function esMexico() {
    try {
      if (/[?&]mx=1/.test(location.search)) return true;
      var ev = window.INVEV || {};
      if (ev.fx && ev.fx.idioma && ev.fx.idioma.mx) return true;
      if (/m[eé]xico|mx/i.test(String(ev.idioma || ''))) return true;
      return false;               /* sin idioma declarado no se asume nada */
    } catch (e) { return false; }
  }

  /* sólo nodos de texto: así no se rompe ningún HTML ni se tocan atributos */
  function recorrer(raiz) {
    var it = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null), n;
    while ((n = it.nextNode())) {
      var p = n.parentNode;
      if (!p) continue;
      var tag = p.nodeName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') continue;
      var v = n.nodeValue;
      if (!v || v.length > 400) continue;
      var nuevo = traducir(v);
      if (nuevo !== v) n.nodeValue = nuevo;
    }
  }

  function pasar() {
    if (!esMexico()) return;
    recorrer(document.body);
    /* placeholders y botones con value: ahí no hay nodo de texto */
    [].forEach.call(document.querySelectorAll('[placeholder],input[type=submit],input[type=button]'), function (e) {
      ['placeholder', 'value'].forEach(function (attr) {
        var v = e.getAttribute(attr);
        if (!v) return;
        var nuevo = traducir(v);
        if (nuevo !== v) e.setAttribute(attr, nuevo);
      });
    });
  }

  function arrancar() {
    pasar();
    /* el motor y los módulos escriben texto en cualquier momento */
    if (window.MutationObserver) {
      var pendiente = false;
      new MutationObserver(function () {
        if (pendiente) return;
        pendiente = true;
        setTimeout(function () { pendiente = false; pasar(); }, 120);
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    var n = 0, t = setInterval(function () { pasar(); if (++n > 60) clearInterval(t); }, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
