/* ===== RETOQUES DE LA COLECCIÓN PERLAS =======================================

   QUÉ ES ESTE ARCHIVO
   Correcciones de diseño sobre la colección Perlas que no pertenecen a ninguna
   función en particular: son ajustes de tamaño y de fondo que salieron de mirar
   la invitación terminada. Van acá y no adentro de `colecciones/perlas.js`
   porque ese archivo pesa 42 KB, lo tocan varias manos y una corrección de dos
   líneas no justifica reescribirlo entero.

   ⚠️ TODO CON EL PREFIJO DE LA COLECCIÓN. La colección escribe sus reglas como
      `html[data-coleccion="perlas"][data-col-perla] …`, o sea dos atributos en
      el `html`. Para ganarle no alcanza con repetir la clase: hay que usar el
      MISMO prefijo y sumar algo.

   ============================================================================
   1 · LA BANDA DE LA FRASE PERDÍA EL PAPEL          (3/9/2026)

   Jazmín marcó con un círculo verde el collar de perlas de la frase: quedaba
   sobre una **franja blanca**, y el collar se veía "colgado".

   MEDIDO EN VIVO, y la causa no era el collar:

     · Las demás secciones claras tienen
         background-color: rgba(…, .2)   +   background-image: url(/i/tex-lino.jpg)
     · `.fraseSec` tenía el MISMO color… y `background-image: none`.

   Porque la colección escribe `background: var(--lino)`, y **`background` es
   un atajo: al escribirlo, borra `background-image`.**

   → Se le devuelve la textura. Si sólo se quiere el color: `background-color`.

   ============================================================================
   1b · Y DESPUÉS QUEDÓ UNA LÍNEA MARCADA            (4/9/2026)

   Con el papel devuelto, Maki: «hay una línea que separa las perlas de la
   frase, y es como muy marcada, queda muy mal».

   MEDIDO, y no era un borde ni una sombra — no había ninguno:

       la foto del collar es de   680 × 341   (proporción 1,99)
       se muestra en              507 × 132   (proporción 3,84)
       y va con `object-fit: cover`

   O sea que para llenar esa caja el navegador **recorta casi la mitad del alto
   de la foto**. El borde de abajo es un CORTE A CUCHILLO por el medio de la
   imagen, y como la pieza va en `multiply`, el papel de la foto tiñe apenas su
   rectángulo: ese filo se lee como una línea.

   → Se difumina con `mask-image`. Es el tratamiento «DIFUMINAR» que ya estaba
     anotado en `efectos/index.js` para las piezas que viven adentro de una
     sección clara — a ésta le habían aplicado el de recortar.
   → Va `-webkit-mask-image` además de `mask-image`: Safari todavía lo pide.

   ⚠️ NO se arregla bajando la opacidad: con `multiply`, menos opacidad no hace
      la pieza más sutil, la hace GRIS.

   ★ Y LA VENTANA DEL DIFUMINADO SE AJUSTÓ MIRANDO  (4/9/2026)
     Primera versión: sólido del 26% al 58%. Maki: «está bastante difuso en la
     parte del medio del collar». Tenía razón — con el recorte centrado, la
     panza del collar cae justo en la zona que se estaba borrando.
     Ahora va del **16% al 80%**: las perlas quedan enteras y sólo se disuelve
     el filo. Si alguna vez se quiere más o menos velo, son esos dos números.

   ============================================================================
   1c · EL SOBRECITO DE LA FRASE NO SE VEÍA          (4/9/2026)

   Maki: «abajo de la frase hay otro sobrecito blanco que pasa desapercibido.
   Estaría bueno que le des un colorcito un poquito más fuerte, como el del
   sobre de abajo, el de Nuestra carta, para que se note que está».

   MEDIDO: la pieza estaba en `mix-blend-mode: multiply`, 96 px, opacidad .95,
   con una máscara radial al 58%.

   Por qué desaparecía: **multiply sólo puede OSCURECER.** Es un sobre marfil
   sobre papel marfil: no tiene con qué oscurecer, así que casi no pinta. Es el
   límite que ya estaba anotado —«multiply no puede ACLARAR»— sólo que acá se
   notaba al revés: la pieza no tenía presencia.

   → Pasa a **mezcla normal**: es un objeto que se apoya, no una mancha que
     tiñe. Igual que el sobre de Nuestra carta, que nunca fue multiply.
   → 96 → 118 px, sombra suave para que se despegue del papel, y el borde
     disuelto con la máscara radial para que NO quede la placa rectangular del
     papel sobre el que se fotografió.

   ⚠️ Al sacarle el multiply, la pieza ya no toma el tono de la sección: se ve
      con su propio marfil. Eso es lo que Maki pidió («un colorcito más
      fuerte»), pero si algún día una paleta oscura la deja fuera de tono, la
      salida es recolorearla con `filter`, no volver a multiply.

   ============================================================================
   2 · LAS FOTOS DE «NUESTRAS PERSONAS» ERAN CHIQUITAS   (3/9/2026)

   Jazmín: «se ven chiquititas las fotos, y para ellos son súper importantes».
   Medido: **74 × 74**. Pasan a `clamp(88px, 25vw, 104px)`. Con tres por fila
   entran igual en un teléfono de 360 px de ancho.

   ============================================================================
   3 · LA TIPOGRAFÍA, UN POCO MÁS GRANDE                (3/9/2026)

   No se sube todo a ciegas: se midió primero dónde estaba realmente chica.

       título de sección   31 px      → 33
       bajada (kick)       24 px      → queda igual
       párrafos            22 px      → quedan igual
       itinerario · hora   17 px      → 19
       itinerario · detalle 13 px     → 15   ⟵ el más chico de toda la pieza

   ⚠️ Los tamaños del motor están en PÍXELES, no en `rem`: agrandar la raíz no
      lo hereda nadie. Hay que nombrar cada rol.

   ============================================================================
   4 · LA FRASE, CON MÁS FUERZA                          (3/9/2026)

   Estaba en 22 px con la tinta a media asta. Pasa a `clamp(24px, 6vw, 27px)`.

   ⚠️ La frase la escribe la clienta y puede ser larga: por eso `clamp()`.
   ============================================================================ */
(function () {

  var PRE = 'html[data-coleccion="perlas"][data-col-perla] ';
  var ID  = 'perlas-ajustes-css';

  /* el mismo papel que usan las demás secciones claras */
  var PAPEL = '/i/tex-lino.jpg';

  /* cómo se disuelve el collar. Los dos números del medio son la ventana
     donde la foto se ve entera. Ver la nota 1b. */
  var VELO = 'linear-gradient(to bottom,' +
             'transparent 0%,#000 16%,#000 80%,transparent 100%)';

  /* y cómo se disuelve el borde del sobrecito, para que no quede la placa */
  var VELO_SOBRE = 'radial-gradient(66% 66%,#000 46%,transparent 100%)';

  function esPerlas() {
    try {
      var D = window.INVEV || {};
      var c = (D.fx && D.fx.coleccion) || D.coleccion || '';
      if (String(c).toLowerCase() === 'perlas') return true;
    } catch (e) {}
    var m = document.documentElement.getAttribute('data-coleccion');
    return String(m || '').toLowerCase() === 'perlas';
  }

  /* cada regla se escribe dos veces: suelta y con el prefijo de la colección */
  function dos(sel, cuerpo) {
    return sel + '{' + cuerpo + '}\n' + PRE + sel + '{' + cuerpo + '}';
  }

  function poner() {
    if (document.getElementById(ID)) return;

    var s = document.createElement('style');
    s.id = ID;
    s.textContent = [

      /* 1 · la banda de la frase recupera el papel ---------------------- */
      dos('.fraseSec',
          'background-image:url("' + PAPEL + '")!important;' +
          'background-size:cover!important;' +
          'background-position:center!important;' +
          'background-repeat:no-repeat!important'),

      /* 1b · el collar se disuelve en vez de cortarse a cuchillo --------- */
      dos('.fraseSec .col-collar',
          'background:none!important;' +
          'mix-blend-mode:multiply!important;' +
          '-webkit-mask-image:' + VELO + '!important;' +
          'mask-image:' + VELO + '!important'),

      /* 1c · el sobrecito, como objeto y no como mancha ------------------ */
      dos('.fraseSec .col-sobre',
          'background:none!important;' +
          'mix-blend-mode:normal!important;' +
          'opacity:.96!important;' +
          'width:118px!important;height:auto!important;' +
          '-webkit-mask-image:' + VELO_SOBRE + '!important;' +
          'mask-image:' + VELO_SOBRE + '!important;' +
          'filter:drop-shadow(0 6px 12px rgba(60,48,40,.14)) saturate(1.06)!important'),

      /* 2 · las personas, más grandes ----------------------------------- */
      dos('.av',
          'width:clamp(88px,25vw,104px)!important;' +
          'height:clamp(88px,25vw,104px)!important'),

      /* 3 · la tipografía, donde de verdad estaba chica ------------------ */
      dos('.tl .it .h', 'font-size:19px!important'),
      dos('.tl .it .d', 'font-size:15px!important;line-height:1.55!important'),
      dos('.sec h2',    'font-size:clamp(29px,7.4vw,33px)!important'),

      /* 4 · la frase, con más fuerza ------------------------------------- */
      dos('.fraseSec .frase',
          'font-size:clamp(24px,6vw,27px)!important;' +
          'line-height:1.68!important;' +
          'color:var(--tinta,#3b3244)!important')

    ].join('\n');

    (document.head || document.documentElement).appendChild(s);
  }

  function revisar() {
    if (!esPerlas()) return false;
    poner();
    return true;
  }

  function arrancar() {
    if (revisar()) return;
    /* la colección puede tardar en marcar el html */
    var n = 0;
    var t = setInterval(function () {
      if (revisar() || ++n > 60) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
