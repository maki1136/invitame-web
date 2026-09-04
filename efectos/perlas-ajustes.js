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
      MISMO prefijo y sumar algo. Está aprendido a los golpes en
      `efectos/itinerario-perlas.js`.

   ============================================================================
   1 · LA BANDA DE LA FRASE PERDÍA EL PAPEL          (3/9/2026)

   Jazmín marcó con un círculo verde el collar de perlas de la frase: quedaba
   sobre una **franja blanca**, con una línea marcada, y el collar se veía
   "colgado", separado del resto de la invitación. Maki: «no se puede sacar ese
   fondo blanco y dejar solamente las perlas, y que quede el fondo de las plumas
   que está de fondo en toda la invitación».

   MEDIDO EN VIVO, y la causa no era el collar:

     · Las demás secciones claras tienen
         background-color: rgba(…, .2)   +   background-image: url(/i/tex-lino.jpg)
       o sea el papel con un velo de color encima.
     · `.fraseSec` tenía el MISMO color… y `background-image: none`.

   ¿Por qué? La colección escribe:

       html[data-coleccion="perlas"] .fraseSec { background: var(--lino) }

   **`background` es un atajo: al escribirlo, borra `background-image`.** Ese
   `none` es lo que dejaba la franja plana. El collar estaba bien: va con
   `mix-blend-mode: multiply`, así que sobre el papel se integra solo.

   → Se le devuelve la textura. No se toca el collar ni el color.
   → Regla general, que ya mordió otras veces en este sistema: **el atajo
     `background:` pisa las cinco propiedades.** Si sólo se quiere el color,
     se escribe `background-color`.

   ============================================================================
   2 · LAS FOTOS DE «NUESTRAS PERSONAS» ERAN CHIQUITAS   (3/9/2026)

   Jazmín: «en el sector de personas se ven chiquititas las fotos, y para ellos
   son súper importantes». Medido: los círculos median **74 × 74**.

   Pasan a `clamp(88px, 25vw, 104px)`. Con tres por fila entran igual en un
   teléfono de 360 px de ancho.

   ============================================================================
   3 · LA TIPOGRAFÍA, UN POCO MÁS GRANDE                (3/9/2026)

   Jazmín: «agrandaría un poquito más la tipografía de toda la invitación».

   No se sube todo a ciegas: se midió primero dónde estaba realmente chica.

       título de sección   31 px      → 33
       bajada (kick)       24 px      → queda igual, está bien
       párrafos            22 px      → quedan igual, están bien
       itinerario · hora   17 px      → 19
       itinerario · detalle 13 px     → 15   ⟵ el más chico de toda la pieza

   ⚠️ Los tamaños del motor están en PÍXELES, no en `rem`. Por eso no sirve
      agrandar la raíz del documento: no lo hereda nadie. Hay que nombrar cada
      rol. Si Maki quiere otro escalón, se tocan estos números y nada más.

   ============================================================================
   4 · LA FRASE, CON MÁS FUERZA                          (3/9/2026)

   Maki: «la frase, ya que estás, dale un poquito más de fuerza». Estaba en
   22 px con la tinta a media asta. Pasa a `clamp(24px, 6vw, 27px)`, con más
   interlínea y la tinta más firme.

   ⚠️ La frase la escribe la clienta y puede ser larga. Por eso el tamaño va con
      `clamp()` y no fijo: en una frase de seis renglones no se desborda.
   ============================================================================ */
(function () {

  var PRE = 'html[data-coleccion="perlas"][data-col-perla] ';
  var ID  = 'perlas-ajustes-css';

  /* el mismo papel que usan las demás secciones claras */
  var PAPEL = '/i/tex-lino.jpg';

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

      /* el collar ya viene en multiply: sobre el papel se integra solo.
         Se le saca cualquier fondo propio por las dudas. */
      dos('.fraseSec .col-collar',
          'background:none!important;mix-blend-mode:multiply!important'),

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
