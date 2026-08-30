/* ===== EL MOTIVO QUE RECORRE LA INVITACIÓN ====================================

   QUÉ RESUELVE
   Las invitaciones se veían genéricas al lado de las buenas. Maki mandó tres
   referencias y la diferencia no era la tipografía ni el color —eso ya lo
   tenemos con las 20 paletas—: era que las buenas tienen UN MOTIVO QUE
   ATRAVIESA TODA LA INVITACIÓN. En la referencia es un hilo de perlas que baja
   del encabezado, arma el recorrido del programa, cierra con un broche y
   termina en dos corazones. No es un adorno por sección: es una sola cosa que
   recorre todo y le da unidad.

   ⚠️ VIENE APAGADO. Sin `INVEV.fx.motivo.juego` no hace absolutamente nada.

   Cómo se enciende:
     INVEV.fx.motivo = {
       juego:   'perlas',   // por ahora el único
       densidad: 1,         // 0.6 discreto · 1 normal · 1.4 cargado
       donde:   'todo'      // 'todo' | 'guirnalda' | 'separadores'
     }

   ⚠️ LAS PERLAS SE DIBUJAN, NO SON UNA FOTO.  ← y es a propósito
   Una perla es una esfera: brillo especular chico y desplazado, rebote suave
   abajo del lado opuesto, canto apenas más oscuro, y sombra propia proyectada.
   Eso se hace con gradientes y sale mejor que una imagen: se recolorea con la
   paleta, no se pixela en ninguna pantalla, pesa cero y no hay que subir nada.
   Es el mismo criterio que se usó para el material de los botones.

   ⚠️ EL COLOR LO PONE LA PALETA, no está escrito a mano.
   El cuerpo sale de `--lino2`, la luz de blanco y el metal del broche de
   `--oro`. Por eso el mismo motivo sirve para las 20 paletas.

   ⚠️ NO TAPA NI ROBA CLICS.
   Todo va con `pointer-events:none` y por debajo del texto. La guirnalda vive
   arriba de todo el marco, donde está la foto de portada; las perlas sueltas
   viven contra los bordes.

   ⚠️ ES UNA PIEL, COMO EL INTERRUPTOR.
   El separador original no se borra: se esconde y se le pone el de perlas
   encima. Si este archivo se saca de la lista, vuelve todo como estaba.

   ⚠️ SI LA PERSONA PIDIÓ MENOS MOVIMIENTO, no hay parallax. Y en pantallas
   angostas la guirnalda se achica: en un teléfono una guirnalda grande tapa
   la foto en vez de enmarcarla.
   ============================================================================ */
(function () {
  'use strict';

  var ID_CSS = 'inv-motivo-css';
  var MARCA  = 'data-motivo';

  function conf() {
    var m = {};
    try { m = ((window.INVEV || {}).fx || {}).motivo || {}; } catch (e) {}
    try {
      var u = new URLSearchParams(location.search);
      if (u.get('motivo')) {
        m = { juego: u.get('motivo'),
              densidad: parseFloat(u.get('densidad') || '1'),
              donde: u.get('motivoDonde') || 'todo' };
      }
    } catch (e) {}
    return m;
  }

  function activo(m) { return m && m.juego === 'perlas'; }

  function menosMovimiento() {
    try { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  /* ---------------------------------------------------------------- la perla
     Cuatro capas, y las cuatro hacen falta para que parezca una esfera:
       1. el brillo especular, chico y DESPLAZADO del centro
       2. el rebote de luz de abajo, del lado contrario y más difuso
       3. el cuerpo, con el canto un poco más oscuro
       4. la sombra propia, que es lo que la despega del papel
     Si se saca cualquiera, parece un círculo pintado. */
  var CSS =
    '.mtv{position:absolute;pointer-events:none;z-index:1}' +
    '.mtv .p{position:absolute;border-radius:50%;' +
      'background:' +
        'radial-gradient(42% 38% at 33% 27%, rgba(255,255,255,.95), rgba(255,255,255,0) 62%),' +
        'radial-gradient(38% 34% at 70% 78%, color-mix(in srgb,var(--lino2,#faf7f1) 88%,#fff) , rgba(255,255,255,0) 68%),' +
        'radial-gradient(120% 120% at 30% 24%, color-mix(in srgb,var(--lino2,#faf7f1) 96%,#fff),' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 82%,var(--muted,#8a7f78)) 78%,' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 62%,var(--muted,#8a7f78)));' +
      'box-shadow:0 1px 1px rgba(60,50,40,.16), 0 3px 5px rgba(60,50,40,.13),' +
        ' inset -1px -1px 2px rgba(90,78,66,.16), inset 1px 1px 1px rgba(255,255,255,.5)}' +
    /* el broche: una perla más grande con aro de metal */
    '.mtv .broche{position:absolute;border-radius:50%;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.22), 0 4px 8px rgba(60,50,40,.18),' +
        ' inset 0 0 0 1.5px color-mix(in srgb,var(--oro,#b9a56a) 85%,#fff),' +
        ' inset -1px -1px 3px rgba(90,78,66,.20), inset 1px 1px 2px rgba(255,255,255,.6);' +
      'background:' +
        'radial-gradient(40% 36% at 32% 26%, rgba(255,255,255,.98), rgba(255,255,255,0) 60%),' +
        'radial-gradient(120% 120% at 30% 24%, #fff,' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 80%,var(--oro,#b9a56a)) 82%,' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 55%,var(--muted,#8a7f78)))}' +

    /* la guirnalda cuelga del borde de arriba del marco */
    '.mtv-guirnalda{top:0;left:0;right:0;height:180px;overflow:visible}' +

    /* el separador de perlas, centrado donde estaba el de siempre */
    '.mtv-sep{position:relative;height:26px;margin:0 auto;pointer-events:none}' +
    'html[data-motivo] .sep > *:not(.mtv-sep){display:none}' +

    /* las sueltas, contra los bordes y bien tenues */
    '.mtv-suelta{position:absolute;opacity:.85}' +

    '@media (max-width:420px){.mtv-guirnalda{height:120px}}';

  function hoja() {
    if (document.getElementById(ID_CSS)) return;
    var s = document.createElement('style');
    s.id = ID_CSS;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* una perla suelta, del tamaño que se pida */
  function perla(d, clase) {
    var e = document.createElement('span');
    e.className = clase || 'p';
    e.style.width = d + 'px';
    e.style.height = d + 'px';
    return e;
  }

  /* ---- LA CURVA ---------------------------------------------------------
     Un hilo de perlas cuelga por su peso: la curva es una catenaria, y una
     Bézier cuadrática con el control POR DEBAJO del medio la imita bien.
     Se calcula a mano (no hace falta SVG ni getPointAtLength). */
  function puntoBezier(t, p0, p1, p2) {
    var u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
    };
  }

  function guirnalda(ancho, densidad) {
    var caja = document.createElement('div');
    caja.className = 'mtv mtv-guirnalda';

    /* dos caídas: una larga a la izquierda y una corta a la derecha, para que
       no quede simétrico como un dibujo hecho a máquina */
    var caidas = [
      { p0: { x: -6,  y: -8 }, p1: { x: ancho * 0.30, y: ancho * 0.30 }, p2: { x: ancho * 0.58, y: 6 }, d: 8.5 },
      { p0: { x: ancho * 0.58, y: 6 }, p1: { x: ancho * 0.80, y: ancho * 0.17 }, p2: { x: ancho + 6, y: -10 }, d: 7 }
    ];

    caidas.forEach(function (c) {
      /* el largo aproximado de la curva decide cuántas perlas entran, así no
         quedan apretadas en una caída y separadas en la otra */
      var largo = 0, ant = c.p0, i, pt;
      for (i = 1; i <= 24; i++) {
        pt = puntoBezier(i / 24, c.p0, c.p1, c.p2);
        largo += Math.hypot(pt.x - ant.x, pt.y - ant.y);
        ant = pt;
      }
      var paso = c.d * 0.92;                       /* casi pegadas, como un collar */
      var n = Math.max(6, Math.round((largo / paso) * densidad));

      for (i = 0; i <= n; i++) {
        var t = i / n;
        var q = puntoBezier(t, c.p0, c.p1, c.p2);
        /* las del medio de la caída se ven un pelín más grandes: da profundidad */
        var d = c.d * (0.86 + 0.18 * Math.sin(Math.PI * t));
        var e = perla(d);
        e.style.left = (q.x - d / 2) + 'px';
        e.style.top  = (q.y - d / 2) + 'px';
        caja.appendChild(e);
      }
    });

    /* el broche, donde se juntan las dos caídas */
    var b = perla(14, 'broche');
    b.style.left = (ancho * 0.58 - 7) + 'px';
    b.style.top  = '-1px';
    caja.appendChild(b);

    return caja;
  }

  /* ---- EL SEPARADOR -----------------------------------------------------
     Un hilo corto y horizontal con un broche al medio, en lugar de los aros. */
  function separador(densidad) {
    var caja = document.createElement('div');
    caja.className = 'mtv mtv-sep';
    var ancho = 132, d = 6;
    var n = Math.round((ancho / (d * 0.95)) * densidad);
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      /* una comba muy leve: un hilo apoyado nunca queda recto */
      var y = 13 + Math.sin(Math.PI * t) * 2.2;
      var dd = d * (0.88 + 0.16 * Math.sin(Math.PI * t));
      /* se abre un hueco al medio para el broche */
      if (Math.abs(t - 0.5) < 0.055) continue;
      var e = perla(dd);
      e.style.left = (ancho * t - dd / 2) + 'px';
      e.style.top  = (y - dd / 2) + 'px';
      caja.appendChild(e);
    }
    var b = perla(11, 'broche');
    b.style.left = (ancho / 2 - 5.5) + 'px';
    b.style.top  = '9.5px';
    caja.appendChild(b);
    caja.style.width = ancho + 'px';
    return caja;
  }

  /* ---- LAS SUELTAS ------------------------------------------------------
     Pocas, contra los bordes, nunca sobre el texto. */
  function sueltas(sec, densidad) {
    var caja = document.createElement('div');
    caja.className = 'mtv';
    caja.style.cssText += 'inset:0;overflow:hidden';
    var cuantas = Math.max(2, Math.round(4 * densidad));
    for (var i = 0; i < cuantas; i++) {
      var d = 5 + (i % 3) * 2.5;
      var e = perla(d, 'p mtv-suelta');
      var izq = (i % 2 === 0);
      e.style.left = izq ? (3 + (i * 7) % 22) + 'px' : '';
      e.style.right = izq ? '' : (3 + (i * 11) % 26) + 'px';
      e.style.top = (12 + (i * 137) % 76) + '%';
      caja.appendChild(e);
    }
    return caja;
  }

  /* ---------------------------------------------------------------- montaje */
  var puesto = false;

  function sacar() {
    [].forEach.call(document.querySelectorAll('.mtv'), function (e) { e.remove(); });
    document.documentElement.removeAttribute(MARCA);
    puesto = false;
  }

  function poner(m) {
    var marco = document.querySelector('.frame');
    if (!marco) return;
    hoja();
    sacar();

    var densidad = Math.max(0.5, Math.min(1.6, (typeof m.densidad === 'number') ? m.densidad : 1));
    var donde = m.donde || 'todo';
    var ancho = Math.round(marco.getBoundingClientRect().width);
    if (!ancho) return;

    document.documentElement.setAttribute(MARCA, 'perlas');

    if (donde === 'todo' || donde === 'guirnalda') {
      if (getComputedStyle(marco).position === 'static') marco.style.position = 'relative';
      marco.appendChild(guirnalda(ancho, densidad));
    }

    if (donde === 'todo' || donde === 'separadores') {
      [].forEach.call(document.querySelectorAll('.sep'), function (s) {
        if (s.querySelector('.mtv-sep')) return;
        s.appendChild(separador(densidad));
      });
    }

    if (donde === 'todo') {
      /* sólo en las secciones claras: sobre las de color no se leen */
      [].forEach.call(document.querySelectorAll('.sec:not(.verde)'), function (s, i) {
        if (i % 2) return;                                  /* una sí, una no */
        if (s.querySelector('.mtv-suelta')) return;
        if (getComputedStyle(s).position === 'static') s.style.position = 'relative';
        s.appendChild(sueltas(s, densidad));
      });
    }

    puesto = true;
  }

  var firma = null;

  function sincronizar() {
    var m = conf();
    var nueva = JSON.stringify([m.juego, m.densidad, m.donde,
      Math.round((document.querySelector('.frame') || { getBoundingClientRect: function () { return { width: 0 }; } })
        .getBoundingClientRect().width)]);
    if (!activo(m)) { if (puesto) sacar(); firma = nueva; return; }
    if (nueva === firma && puesto) return;
    firma = nueva;
    poner(m);
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    sincronizar();
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    var espera = null;
    addEventListener('resize', function () {
      clearTimeout(espera); espera = setTimeout(sincronizar, 260);
    }, { passive: true });

    /* el motor y los otros módulos siguen escribiendo secciones un rato */
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
