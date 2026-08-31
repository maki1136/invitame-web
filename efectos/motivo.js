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
   Para probar sin tocar la base: `?motivo=perlas&densidad=1`

   ⚠️ LAS PERLAS SE DIBUJAN, NO SON UNA FOTO.  ← y es a propósito
   Una perla es una esfera: brillo especular chico y desplazado, rebote suave
   abajo del lado opuesto, canto apenas más oscuro, y sombra propia proyectada.
   Se hace con gradientes y sale mejor que una imagen: se recolorea con la
   paleta, no se pixela en ninguna pantalla, pesa cero y no hay que subir nada.
   Mismo criterio que el material de los botones.

   ⚠️ EL COLOR LO PONE LA PALETA. Cuerpo de `--lino2`, luz blanca, el aro del
   broche de `--oro`. Por eso el mismo motivo sirve para las 20 paletas.

   ⚠️ DÓNDE VA CADA COSA — esto costó una vuelta, mirar antes de tocar:
     · La guirnalda cuelga DENTRO de `.portada`, nunca del `.frame`. Colgada
       del frame se salía 36 px por arriba y el broche quedaba cortado contra
       el borde de la pantalla. Y todas las alturas van de 0 para abajo: un
       collar cuelga, no flota.
     · El hilo horizontal reemplaza `.adorno` (los aros ⚭ que ya separan las
       secciones; hay 17, de 112×40).
     · ⚠️ NO TOCAR `.sep`: NO es un separador de secciones, son los dos puntos
       ENTRE LOS NÚMEROS de la cuenta regresiva. La v1 les colgó hilos encima y
       quedó un desastre sobre el contador.

   ⚠️ NO TAPA NI ROBA CLICS: todo `pointer-events:none` y por debajo del texto.

   ⚠️ ES UNA PIEL, COMO EL INTERRUPTOR. El SVG de los aros no se borra: se
   esconde. Si este archivo se saca de la lista, vuelve todo como estaba.

   ⚠️ EN PANTALLAS ANGOSTAS la guirnalda se achica: en un teléfono una
   guirnalda grande tapa la foto en vez de enmarcarla.
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

  /* ---------------------------------------------------------------- la perla
     Cuatro capas, y las cuatro hacen falta para que parezca una esfera:
       1. el brillo especular, chico y DESPLAZADO del centro
       2. el rebote de luz de abajo, del lado contrario y más difuso
       3. el cuerpo, con el canto un poco más oscuro
       4. la sombra propia, que es lo que la despega del papel
     Si se saca cualquiera, parece un círculo pintado. */
  var CSS =
    '.mtv{position:absolute;pointer-events:none;z-index:2}' +
    '.mtv .p{position:absolute;border-radius:50%;' +
      'background:' +
        'radial-gradient(42% 38% at 33% 27%, rgba(255,255,255,.95), rgba(255,255,255,0) 62%),' +
        'radial-gradient(38% 34% at 70% 78%, color-mix(in srgb,var(--lino2,#faf7f1) 88%,#fff), rgba(255,255,255,0) 68%),' +
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

    /* la guirnalda: pegada al borde de arriba de la PORTADA, cae hacia adentro */
    '.mtv-guirnalda{top:0;left:0;right:0;height:200px;overflow:hidden}' +

    /* el hilo horizontal, en lugar de los aros */
    '.mtv-hilo{position:absolute;inset:0}' +
    'html[data-motivo="perlas"] .adorno > svg{display:none}' +
    'html[data-motivo="perlas"] .adorno{position:relative}' +

    '.mtv-suelta{opacity:.8}' +

    '@media (max-width:420px){.mtv-guirnalda{height:130px}}';

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (s) { s.textContent = CSS; return; }
    s = document.createElement('style');
    s.id = ID_CSS;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function perla(d, clase) {
    var e = document.createElement('span');
    e.className = clase || 'p';
    e.style.width = d + 'px';
    e.style.height = d + 'px';
    return e;
  }

  function poner1(caja, x, y, d, clase) {
    var e = perla(d, clase);
    e.style.left = (x - d / 2) + 'px';
    e.style.top  = (y - d / 2) + 'px';
    caja.appendChild(e);
    return e;
  }

  /* ---- LA CURVA ---------------------------------------------------------
     Un hilo cuelga por su peso: es una catenaria, y una Bézier cuadrática con
     el control POR DEBAJO la imita bien. Se calcula a mano, sin SVG. */
  function bez(t, p0, p1, p2) {
    var u = 1 - t;
    return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
             y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
  }

  function largoDe(c) {
    var l = 0, ant = c.p0, i, pt;
    for (i = 1; i <= 24; i++) { pt = bez(i / 24, c.p0, c.p1, c.p2); l += Math.hypot(pt.x - ant.x, pt.y - ant.y); ant = pt; }
    return l;
  }

  function enhebrar(caja, c, dBase, densidad, hueco) {
    var n = Math.max(6, Math.round((largoDe(c) / (dBase * 0.92)) * densidad));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      if (hueco && Math.abs(t - hueco.t) < hueco.r) continue;
      var q = bez(t, c.p0, c.p1, c.p2);
      /* las del medio se ven un pelín más grandes: da profundidad */
      poner1(caja, q.x, q.y, dBase * (0.86 + 0.18 * Math.sin(Math.PI * t)));
    }
  }

  /* ⚠️ TODAS las alturas van de 0 para ABAJO. Con valores negativos el collar
     se sale por arriba de la portada y el broche queda cortado. */
  function guirnalda(ancho, densidad) {
    var caja = document.createElement('div');
    caja.className = 'mtv mtv-guirnalda';
    var chico = ancho < 380;
    var hondo = chico ? 0.20 : 0.27;          /* cuánto cae, en proporción al ancho */
    var d = chico ? 6.5 : 8.5;
    var xBroche = ancho * 0.58, yBroche = 16;

    /* caída larga a la izquierda, corta a la derecha: si son iguales parece
       hecho a máquina */
    enhebrar(caja, { p0: { x: 2, y: 3 }, p1: { x: ancho * 0.30, y: ancho * hondo },
                     p2: { x: xBroche, y: yBroche } }, d, densidad);
    enhebrar(caja, { p0: { x: xBroche, y: yBroche }, p1: { x: ancho * 0.80, y: ancho * hondo * 0.55 },
                     p2: { x: ancho - 2, y: 3 } }, d * 0.85, densidad);

    poner1(caja, xBroche, yBroche + 2, d * 1.7, 'broche');
    return caja;
  }

  /* el hilo que reemplaza los aros: leve comba y broche al medio */
  function hilo(w, h, densidad) {
    var caja = document.createElement('div');
    caja.className = 'mtv mtv-hilo';
    var d = 5.5, y = h / 2;
    enhebrar(caja, { p0: { x: 4, y: y - 3 }, p1: { x: w / 2, y: y + 5 }, p2: { x: w - 4, y: y - 3 } },
             d, densidad, { t: 0.5, r: 0.075 });
    poner1(caja, w / 2, y + 1, 10, 'broche');
    return caja;
  }

  /* pocas, contra los bordes de la sección, nunca sobre el texto */
  function sueltas(densidad) {
    var caja = document.createElement('div');
    caja.className = 'mtv';
    caja.style.cssText += 'inset:0;overflow:hidden';
    var cuantas = Math.max(2, Math.round(4 * densidad));
    for (var i = 0; i < cuantas; i++) {
      var d = 5 + (i % 3) * 2.5;
      var e = perla(d, 'p mtv-suelta');
      if (i % 2 === 0) e.style.left = (6 + (i * 7) % 20) + 'px';
      else e.style.right = (6 + (i * 11) % 24) + 'px';
      e.style.top = (12 + (i * 137) % 74) + '%';
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

  function relativo(e) {
    if (e && getComputedStyle(e).position === 'static') e.style.position = 'relative';
  }

  function poner(m) {
    var portada = document.querySelector('.portada');
    if (!portada) return;
    hoja();
    sacar();

    var densidad = Math.max(0.5, Math.min(1.6, (typeof m.densidad === 'number') ? m.densidad : 1));
    var donde = m.donde || 'todo';
    var ancho = Math.round(portada.getBoundingClientRect().width);
    if (!ancho) return;

    document.documentElement.setAttribute(MARCA, 'perlas');

    if (donde === 'todo' || donde === 'guirnalda') {
      relativo(portada);
      portada.appendChild(guirnalda(ancho, densidad));
    }

    if (donde === 'todo' || donde === 'separadores') {
      [].forEach.call(document.querySelectorAll('.adorno'), function (a) {
        if (a.querySelector('.mtv-hilo')) return;
        var r = a.getBoundingClientRect();
        if (!r.width) return;
        a.appendChild(hilo(Math.round(r.width), Math.round(r.height) || 40, densidad));
      });
    }

    if (donde === 'todo') {
      /* sólo en las claras: sobre las de color no se leen */
      [].forEach.call(document.querySelectorAll('.sec:not(.verde)'), function (s, i) {
        if (i % 2) return;                                  /* una sí, una no */
        if (s.querySelector('.mtv-suelta')) return;
        relativo(s);
        s.appendChild(sueltas(densidad));
      });
    }

    puesto = true;
  }

  var firma = null;

  function sincronizar() {
    var m = conf();
    var p = document.querySelector('.portada');
    var w = p ? Math.round(p.getBoundingClientRect().width) : 0;
    var nueva = JSON.stringify([m.juego, m.densidad, m.donde, w,
                                document.querySelectorAll('.adorno').length]);
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
