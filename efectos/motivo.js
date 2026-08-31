/* ===== EL MOTIVO QUE RECORRE LA INVITACIÓN ====================================

   QUÉ RESUELVE
   Las invitaciones se veían genéricas al lado de las buenas. Maki mandó tres
   referencias y la diferencia no era la tipografía ni el color: era que las
   buenas tienen UN MOTIVO QUE ATRAVIESA TODA LA INVITACIÓN.

   ⚠️ VIENE APAGADO. Sin `INVEV.fx.motivo.juego` no hace absolutamente nada.

   Cómo se enciende:
     INVEV.fx.motivo = {
       juego:   'perlas',    // por ahora el único
       densidad: 1,          // 0.6 discreto · 1 normal · 1.4 cargado
       donde:   'discreto'   // 'todo' | 'discreto' | 'guirnalda'
                             // | 'separadores' | 'corazones'
     }
   Para probar sin tocar la base: `?motivo=perlas&densidad=1`

   ★★★ POR QUÉ EXISTE EL MODO "DISCRETO", Y POR QUÉ ES EL RECOMENDADO ★★★
      Maki miró la primera versión con el motivo completo y dijo dos cosas que
      son la misma lección:

      1. «las perlas de la portada se nota que están dibujadas, no son reales
         como las que te pasé». Y tenía razón, aunque CADA perla ES su foto:
         ★ REPETIR UNA MISMA FOTO MUCHAS VECES Y GRANDE SE LEE COMO DIBUJO.
           El ojo no ve una perla, ve el PATRÓN: todas idénticas, mismo brillo,
           misma orientación, mismo tamaño. Un collar de verdad tiene perlas
           que difieren. La repetición delata la síntesis aunque la unidad sea
           fotográfica.
           → Sirve en chico y sutil (el hilo entre secciones, la línea del
             programa, los corazones). NO sirve como pieza protagonista.

      2. «hay perlas desparramadas que pisan los textos». Las sueltas se
         posicionaban por porcentaje sin saber dónde caía el texto.

      Por eso `discreto` = separadores + corazones. Sin guirnalda de portada y
      sin perlas sueltas. Es lo que la Colección Perlas sugiere hoy.
      `todo` sigue existiendo, pero hay que mirarlo antes de usarlo.

   ⚠️ LA PERLA ES UNA FOTO DE VERDAD. La v1 la dibujaba con gradientes y Maki
   lo dijo sin vueltas. Sale de `efectos/perla.js`: foto recortada con alfa,
   128×128, WebP, 3.3 KB, como data URI. Sin pedido de red extra.

   ⚠️ LA FOTO SE LEE DE `window.INVPERLA`, NO DE `INVEV`.
   `window.INVEV` es el OBJETO DE DATOS DEL EVENTO y el motor lo REEMPLAZA
   entero cuando llega la invitación desde Firestore: lo que se le cuelgue
   desaparece sin error. De `INVEV` sólo se lee `fx`.

   ⚠️ POR QUÉ UNA PERLA SUELTA Y NO LA GUIRNALDA ENTERA COMO IMAGEN
   El interior de la perla tiene EXACTAMENTE el color del papel (247 contra
   247): no hay señal tonal para recortar la hilera completa. Una perla suelta
   es un disco y la máscara circular es exacta.

   ⚠️ LA SOMBRA VA POR CSS, NO EN EL ARCHIVO. `filter: drop-shadow()` sobre el
   contenedor —una pasada para todo el grupo— así se adapta a cada fondo.

   ⚠️ NO TINTAR CON `background-blend-mode`: el color de fondo llena la caja y
   las partes transparentes se vuelven un cuadrado opaco.

   ⚠️ SI NO ESTÁ `efectos/perla.js` NO SE ROMPE: cae en las perlas de gradiente
   de la v1, que siguen acá abajo como respaldo.

   ⚠️ DÓNDE VA CADA COSA — esto costó una vuelta:
     · La guirnalda cuelga DENTRO de `.portada`, nunca del `.frame`, y todas
       las alturas van de 0 para abajo: un collar cuelga, no flota.
     · El hilo horizontal reemplaza `.adorno` (los aros ⚭ entre secciones).
     · Los corazones van al FINAL de la sección de regalos, enganchados a
       `.reg-btns`: es el único elemento confiable para encontrarla, porque los
       títulos los escribe el cliente y cambian.
     · ⚠️ NO TOCAR `.sep`: NO es un separador de secciones, son los dos puntos
       ENTRE LOS NÚMEROS de la cuenta regresiva.

   ⚠️ LOS CORAZONES VAN EN EL FLUJO, NO FLOTANDO. Todo lo demás es
   `position:absolute`; ellos son el remate y tienen que empujar y dejar aire.

   ⚠️ NO TAPA NI ROBA CLICS: todo `pointer-events:none` y debajo del texto.

   ⚠️ ES UNA PIEL. El SVG de los aros no se borra: se esconde.
   ============================================================================ */
(function () {
  'use strict';

  var ID_CSS = 'inv-motivo-css';
  var MARCA  = 'data-motivo';

  /* ⚠️ INVPERLA, no INVEV.PERLA: ver la nota de arriba. */
  function foto() {
    try { return window.INVPERLA || ''; } catch (e) { return ''; }
  }

  function conf() {
    var m = {};
    try { m = ((window.INVEV || {}).fx || {}).motivo || {}; } catch (e) {}
    try {
      var u = new URLSearchParams(location.search);
      if (u.get('motivo')) {
        m = { juego: u.get('motivo'),
              densidad: parseFloat(u.get('densidad') || '1'),
              donde: u.get('motivoDonde') || 'discreto' };
      }
    } catch (e) {}
    return m;
  }

  function activo(m) { return m && m.juego === 'perlas'; }

  var CSS =
    '.mtv{position:absolute;pointer-events:none;z-index:2}' +

    /* ---- respaldo en gradientes (sólo si no hay foto) ---- */
    '.mtv .p{position:absolute;border-radius:50%;' +
      'background:' +
        'radial-gradient(42% 38% at 33% 27%, rgba(255,255,255,.95), rgba(255,255,255,0) 62%),' +
        'radial-gradient(38% 34% at 70% 78%, color-mix(in srgb,var(--lino2,#faf7f1) 88%,#fff), rgba(255,255,255,0) 68%),' +
        'radial-gradient(120% 120% at 30% 24%, color-mix(in srgb,var(--lino2,#faf7f1) 96%,#fff),' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 82%,var(--muted,#8a7f78)) 78%,' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 62%,var(--muted,#8a7f78)));' +
      'box-shadow:0 1px 1px rgba(60,50,40,.16), 0 3px 5px rgba(60,50,40,.13),' +
        ' inset -1px -1px 2px rgba(90,78,66,.16), inset 1px 1px 1px rgba(255,255,255,.5)}' +
    '.mtv .broche{position:absolute;border-radius:50%;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.22), 0 4px 8px rgba(60,50,40,.18),' +
        ' inset 0 0 0 1.5px color-mix(in srgb,var(--oro,#b9a56a) 85%,#fff),' +
        ' inset -1px -1px 3px rgba(90,78,66,.20), inset 1px 1px 2px rgba(255,255,255,.6);' +
      'background:' +
        'radial-gradient(40% 36% at 32% 26%, rgba(255,255,255,.98), rgba(255,255,255,0) 60%),' +
        'radial-gradient(120% 120% at 30% 24%, #fff,' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 80%,var(--oro,#b9a56a)) 82%,' +
          ' color-mix(in srgb,var(--lino2,#faf7f1) 55%,var(--muted,#8a7f78)))}' +

    /* ---- camino bueno: la foto ---- */
    '.mtv[data-foto] .p,.mtv[data-foto] .broche{' +
      'background:var(--inv-perla) center/100% 100% no-repeat;box-shadow:none}' +
    '.mtv[data-foto] .broche{' +
      'box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--oro,#b9a56a) 82%,#fff)}' +
    '.mtv[data-foto]{filter:drop-shadow(0 1px 1px rgba(60,50,40,.18))' +
      ' drop-shadow(0 3px 4px rgba(60,50,40,.13))}' +

    '.mtv-guirnalda{top:0;left:0;right:0;height:200px;overflow:hidden}' +

    '.mtv-hilo{position:absolute;inset:0}' +
    'html[data-motivo="perlas"] .adorno > svg{display:none}' +
    'html[data-motivo="perlas"] .adorno{position:relative}' +

    '.mtv-suelta{opacity:.85}' +

    /* ⚠️ los corazones van EN EL FLUJO: pisan el absolute de `.mtv`. */
    '.mtv-corazones{position:relative;margin:36px auto 4px;display:block}' +

    '@media (max-width:420px){.mtv-guirnalda{height:130px}}';

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (s) { s.textContent = CSS; return; }
    s = document.createElement('style');
    s.id = ID_CSS;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function vestir(caja) {
    var f = foto();
    if (!f) return caja;
    caja.setAttribute('data-foto', '');
    caja.style.setProperty('--inv-perla', 'url("' + f + '")');
    return caja;
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

  /* ---- LA CURVA: una catenaria se imita con una Bézier cuadrática con el
     control POR DEBAJO. Se calcula a mano, sin SVG. */
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
    var n = Math.max(6, Math.round((largoDe(c) / (dBase * 0.94)) * densidad));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      if (hueco && Math.abs(t - hueco.t) < hueco.r) continue;
      var q = bez(t, c.p0, c.p1, c.p2);
      poner1(caja, q.x, q.y, dBase * (0.86 + 0.18 * Math.sin(Math.PI * t)));
    }
  }

  /* ⚠️ TODAS las alturas van de 0 para ABAJO. */
  function guirnalda(ancho, densidad) {
    var caja = vestir(document.createElement('div'));
    caja.className = 'mtv mtv-guirnalda';
    var chico = ancho < 380;
    var hondo = chico ? 0.20 : 0.27;
    var d = chico ? 7 : 9;
    var xBroche = ancho * 0.58, yBroche = 16;

    enhebrar(caja, { p0: { x: 2, y: 3 }, p1: { x: ancho * 0.30, y: ancho * hondo },
                     p2: { x: xBroche, y: yBroche } }, d, densidad);
    enhebrar(caja, { p0: { x: xBroche, y: yBroche }, p1: { x: ancho * 0.80, y: ancho * hondo * 0.55 },
                     p2: { x: ancho - 2, y: 3 } }, d * 0.85, densidad);

    poner1(caja, xBroche, yBroche + 2, d * 1.7, 'broche');
    return caja;
  }

  /* el hilo que reemplaza los aros: leve comba y broche al medio */
  function hilo(w, h, densidad) {
    var caja = vestir(document.createElement('div'));
    caja.className = 'mtv mtv-hilo';
    var d = 6, y = h / 2;
    enhebrar(caja, { p0: { x: 4, y: y - 3 }, p1: { x: w / 2, y: y + 5 }, p2: { x: w - 4, y: y - 3 } },
             d, densidad, { t: 0.5, r: 0.075 });
    poner1(caja, w / 2, y + 1, 10, 'broche');
    return caja;
  }

  /* ---- LOS DOS CORAZONES DEL CIERRE ---------------------------------------
     Curva paramétrica clásica:
        x = 16·sen³t   ·   y = 13·cos t − 5·cos2t − 2·cos3t − cos4t
     Va de −16 a 16 en x: la escala sale de dividir el ancho por 32.

     ⚠️ LAS PERLAS SE REPARTEN POR LARGO DE ARCO, NO POR `t`. Con `t` parejo se
        amontonan en la punta y se abren en los lóbulos, y se nota. */
  function ptoCorazon(t, esc, cx, cy) {
    var s = Math.sin(t), c = Math.cos(t);
    return {
      x: cx + (16 * s * s * s) * esc,
      y: cy - (13 * c - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * esc
    };
  }

  function unCorazon(caja, cx, cy, ancho, d, densidad) {
    var esc = ancho / 32;
    var PASOS = 720;
    var paso = (d * 0.94) / Math.max(0.5, densidad);
    var acum = 0, ant = ptoCorazon(0, esc, cx, cy), i, q;
    poner1(caja, ant.x, ant.y, d);
    for (i = 1; i <= PASOS; i++) {
      q = ptoCorazon((i / PASOS) * Math.PI * 2, esc, cx, cy);
      acum += Math.hypot(q.x - ant.x, q.y - ant.y);
      if (acum >= paso) { poner1(caja, q.x, q.y, d); acum = 0; }
      ant = q;
    }
  }

  function corazones(anchoSec, densidad) {
    var caja = vestir(document.createElement('div'));
    caja.className = 'mtv mtv-corazones';

    var chico = anchoSec < 380;
    var w = chico ? 74 : 88;
    var d = chico ? 6 : 7;
    var solape = w * 0.34;
    var alto = w * 0.92;

    var total = w * 2 - solape;
    caja.style.width  = Math.round(total) + 'px';
    caja.style.height = Math.round(alto) + 'px';

    var cy = alto * 0.47;
    unCorazon(caja, w / 2,         cy, w, d, densidad);
    unCorazon(caja, total - w / 2, cy, w, d, densidad);
    return caja;
  }

  /* ⚠️ LAS SUELTAS PISAN EL TEXTO. Se posicionan por porcentaje sin saber
     dónde cae el texto, y Maki las vio encima de las palabras. Sólo salen en
     `donde:'todo'`, que NO es lo que sugiere la colección. */
  function sueltas(densidad) {
    var caja = vestir(document.createElement('div'));
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
    var donde = m.donde || 'discreto';
    var ancho = Math.round(portada.getBoundingClientRect().width);
    if (!ancho) return;

    document.documentElement.setAttribute(MARCA, 'perlas');

    /* ⚠️ la guirnalda NO entra en `discreto`: repetida y grande se lee dibujada */
    if (donde === 'todo' || donde === 'guirnalda') {
      relativo(portada);
      portada.appendChild(guirnalda(ancho, densidad));
    }

    if (donde === 'todo' || donde === 'discreto' || donde === 'separadores') {
      [].forEach.call(document.querySelectorAll('.adorno'), function (a) {
        if (a.querySelector('.mtv-hilo')) return;
        var r = a.getBoundingClientRect();
        if (!r.width) return;
        a.appendChild(hilo(Math.round(r.width), Math.round(r.height) || 40, densidad));
      });
    }

    if (donde === 'todo' || donde === 'discreto' || donde === 'corazones') {
      var btns = document.querySelector('.reg-btns');
      var secReg = btns && btns.closest ? btns.closest('.sec') : null;
      if (secReg && !secReg.querySelector('.mtv-corazones')) {
        secReg.appendChild(corazones(ancho, densidad));
      }
    }

    /* ⚠️ sólo en `todo`: pisan los textos. Ver la nota de `sueltas()`. */
    if (donde === 'todo') {
      [].forEach.call(document.querySelectorAll('.sec:not(.verde)'), function (s, i) {
        if (i % 2) return;
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
    var nueva = JSON.stringify([m.juego, m.densidad, m.donde, w, !!foto(),
                                document.querySelectorAll('.adorno').length,
                                !!document.querySelector('.reg-btns')]);
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

    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
