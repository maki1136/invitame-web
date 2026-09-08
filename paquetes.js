/* ===== LOS PAQUETES: QUÉ PRENDE CADA UNO =====================================

   ESTE ES **EL ÚNICO** ARCHIVO QUE DECIDE QUÉ FUNCIONES TIENE UNA INVITACIÓN.

   QUIÉN LO USA HOY, DE VERDAD (verificado el 8/9/2026):
     · `/admin.html` → sí. Es la única pantalla que lo carga, y la única que
       PRENDE funciones: el bloque de `efectos/panel-paquete.js`.
     · `/solicitud-crear.php` → sí, del lado del servidor. Lee de acá qué
       funciones son `leader` o `killer` y las apaga TODAS al crear una
       invitación desde el formulario, pase lo que pase.

   ⚠️⚠️ ANTES ACÁ DECÍA QUE LO USABAN TRES PANTALLAS —`crear.html` y
      `mi-panel.html` incluidas— Y NO ERA CIERTO: ninguna de las dos lo carga.
      No hacía falta que lo cargaran, porque ninguna de las dos tiene un solo
      interruptor de función: el formulario junta datos y el panel de la pareja
      toca invitados, mesas, itinerario y textos. Lo que sí faltaba era el
      candado del servidor, y ése ya está puesto.
      ★ Un comentario que describe lo que uno querría no protege nada. Si
        mañana alguna de esas pantallas suma un interruptor, ahí sí tiene que
        cargar este archivo y preguntarle a `tiene()` antes de dibujarlo.

   ⚠️⚠️ POR QUÉ ESTO EXISTE, Y NO ES BUROCRACIA
   Desde que el cliente puede personalizar su invitación solo, alguien con el
   paquete más barato podría abrir la solapa de personalizar y prenderse la
   galería de invitados, el filtro o el control de acceso. Es decir: regalarse
   justo lo único que no se regala.
       Regla comercial de Maki: «el gratis nunca lleva un leader».
   Personalizar COLORES, LETRAS y TEXTOS es libre para todos: no cuesta nada y
   es lo que hace que la invitación se sienta suya.
   PRENDER FUNCIONES lo decide esta tabla. No hay otra forma de prenderlas.

   ⚠️ LOS PRECIOS son los de la grilla decidida el 8/9/2026 (vuelta a los
      precios históricos 1.200 / 2.240 / 2.800). Están acá para que las
      pantallas puedan mostrarlos, NO para decidir nada comercial.
      **Antes de usarlos para vender se reverifican**: los precios de este
      rubro cambian todo el tiempo.

   ⚠️ SI SE CAMBIA UN PAQUETE, SE CAMBIA ACÁ Y EN `/index.html`. Son los dos
      lugares donde vive la promesa. Si se separan, le estamos prometiendo al
      cliente algo distinto de lo que le entrega el sistema.
   ============================================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     LAS FUNCIONES
     `clase` viene de la estrategia comercial y sirve para decidir dónde puede
     vivir cada una:
       leader → por esto te eligen y pagan. NUNCA en un paquete regalado.
       filler → suma, pero sola no decide. Va en los paquetes.
       killer → a un segmento le encanta y a otro le da lo mismo. Se puede
                vender aparte sin castigar el precio de todos.
     `interruptor` es dónde vive el sí/no en el documento del evento. Cuando
     dice null, la función NO tiene interruptor: aparece si hay dato cargado y
     no aparece si no lo hay («si no hay dato, no hay nada»).
     --------------------------------------------------------------------------- */
  var FUNCIONES = {
    /* --- la base: en los tres paquetes --- */
    cuentaRegresiva: { nombre: 'Cuenta regresiva',           clase: 'filler', interruptor: null },
    ubicacion:       { nombre: 'Ubicación y mapa',           clase: 'filler', interruptor: null },
    itinerario:      { nombre: 'Itinerario',                 clase: 'filler', interruptor: null },
    hospedaje:       { nombre: 'Hospedaje',                  clase: 'filler', interruptor: null },
    dresscode:       { nombre: 'Dress code',                 clase: 'filler', interruptor: null },
    galeriaPareja:   { nombre: 'Galería de fotos',           clase: 'filler', interruptor: null,
      nota: 'Las fotos de la pareja, en carrusel. ⚠️ NO es la galería de invitados: son dos cosas distintas con nombre parecido.' },
    regalos:         { nombre: 'Mesa de regalos',            clase: 'filler', interruptor: null },
    hashtag:         { nombre: '#Instagram',                 clase: 'filler', interruptor: null },
    rsvp:            { nombre: 'Confirmación de asistencia', clase: 'filler', interruptor: 'fx.rsvp.encendido' },

    /* --- desde Premium --- */
    pases:           { nombre: 'Pases personalizados',       clase: 'filler', interruptor: null,
      nota: 'Cada invitado con su link y su QR. Es lo que habilita el panel de mesas de los novios.' },
    musica:          { nombre: 'Música',                     clase: 'filler', interruptor: null },
    trivia:          { nombre: '¡Pregúntame!',               clase: 'killer', interruptor: null,
      nota: 'La trivia con ranking. En la página pública se llama «¡Pregúntame!» y se vende dentro de Premium.' },
    envioWhatsApp:   { nombre: 'Envío por WhatsApp a cada invitado', clase: 'filler', interruptor: null,
      nota: 'En Opciones del panel los novios escriben SU mensaje (hasta 300 caracteres, `PANEL.msjCompartir`) y en la lista de invitados el botón de WhatsApp abre el chat de esa persona con el mensaje y su link personal ya escritos. También hay Telegram y copiar link. ⚠️ DEPENDE DE `pases`: sin link por invitado no hay nada que mandar, así que no puede ir en un paquete que no tenga pases.' },

    /* --- desde Platinum --- */
    accesoQR:        { nombre: 'Control de acceso QR',       clase: 'leader', interruptor: null,
      nota: 'El escáner de la puerta (/scan.html). Nunca en un paquete regalado.' },

    /* --- los que ya no van todos al mismo lado (grilla del 8/9/2026) ---
       Los fillers que no cuestan nada bajaron al Estándar, para que el paquete
       de entrada le gane de lejos a los de 399-599 del mercado. Los tres
       LEADERS (filtro, galería de invitados, acceso QR) se quedan arriba:
       «el gratis nunca lleva un leader». El pase con voz sube a Premium, que
       es lo que hace que valga el salto desde el Estándar. */
    filtro:          { nombre: 'El filtro de la fiesta',     clase: 'leader', interruptor: 'fx.filtro.encendido',
      nota: 'La cámara con el marco de la boda. Es lo único que no tiene nadie más en el mercado: no se regala.' },
    galeriaInvitados:{ nombre: 'Galería de los invitados',   clase: 'leader', interruptor: 'fx.galeria.encendido',
      nota: '⚠️ ESTA NO SE PRENDE SOLA. Además del interruptor, el evento hay que darlo de alta en el Worker de la galería, y eso todavía no se puede hacer desde el panel. Marcarla como incluida NO la hace funcionar.' },
    paseVoz:         { nombre: 'Pase con voz',               clase: 'leader', interruptor: 'fx.pasevoz.encendido',
      nota: 'El mensaje grabado para cada invitado.' },
    raspadita:       { nombre: 'Raspadita',                  clase: 'killer', interruptor: 'fx.raspadita.encendido',
      nota: '⚠️ La vibración sólo funciona en Android. No prometerla.' },
    calendario:      { nombre: 'Calendario del mes',         clase: 'filler', interruptor: null },
    sobreAnimado:    { nombre: 'Sobre de entrada animado',   clase: 'filler', interruptor: null },
    carta:           { nombre: 'La carta',                   clase: 'filler', interruptor: null },
    personas:        { nombre: 'Personas importantes',       clase: 'filler', interruptor: null },
    video:           { nombre: 'Nuestro video',              clase: 'filler', interruptor: null }
  };

  /* La invitación completa. Todo esto no cuesta nada de servir (USD 0,44 por
     evento), así que va desde el paquete más barato: es lo que hace que el
     Estándar se vea tres veces mejor que un paquete de 599 en los primeros
     tres segundos. */
  var BASE = ['cuentaRegresiva', 'ubicacion', 'itinerario', 'hospedaje', 'dresscode',
              'galeriaPareja', 'regalos', 'hashtag', 'rsvp',
              'sobreAnimado', 'carta', 'personas', 'calendario', 'video'];

  /* Lo que hace que alguien suba: cada invitado con su pase, su música, la
     trivia, el envío por WhatsApp con el mensaje que ellos escriban, y —lo que
     no tiene nadie— su mensaje grabado. */
  var DE_PREMIUM = BASE.concat(['pases', 'musica', 'trivia', 'envioWhatsApp', 'paseVoz']);

  /* El día del evento resuelto. Los tres leaders viven acá. */
  var DE_PLATINUM = DE_PREMIUM.concat(['accesoQR', 'filtro', 'galeriaInvitados', 'raspadita']);

  /* ---------------------------------------------------------------------------
     LOS PAQUETES  (grilla del 8/9/2026 — reverificar antes de vender)
     --------------------------------------------------------------------------- */
  var PAQUETES = {
    estandar: {
      nombre: 'Estándar',
      bajada: 'La invitación completa, con sobre animado.',
      precio: 1200, moneda: 'MXN',
      incluye: BASE.slice()
    },
    premium: {
      nombre: 'Premium',
      bajada: 'Un mensaje con voz para cada invitado.',
      precio: 2240, moneda: 'MXN',
      incluye: DE_PREMIUM.slice()
    },
    platinum: {
      nombre: 'Platinum',
      bajada: 'Todo, más el día del evento resuelto.',
      precio: 2800, moneda: 'MXN',
      incluye: DE_PLATINUM.slice()
    }
  };

  /* El paquete que se supone cuando no hay ninguno anotado. Es el más chico a
     propósito: si el dato se perdiera, es preferible que falte una función y
     alguien la reclame, a regalar un leader sin que nadie se entere. */
  var POR_DEFECTO = 'estandar';

  /**
   * ¿Esta invitación tiene esta función?
   * @param paquete  'estandar' | 'premium' | 'platinum'
   * @param funcion  una clave de FUNCIONES
   * @param extras   lista de funciones vendidas aparte (las carga el equipo en
   *                 el panel: «le vendí la raspadita suelta»)
   */
  function tiene(paquete, funcion, extras) {
    var p = PAQUETES[paquete] || PAQUETES[POR_DEFECTO];
    if (p.incluye.indexOf(funcion) > -1) return true;
    if (Object.prototype.toString.call(extras) === '[object Array]' &&
        extras.indexOf(funcion) > -1) return true;
    return false;
  }

  /** Todo lo que tiene esta invitación, paquete + extras, sin repetidos. */
  function funcionesDe(paquete, extras) {
    var p = PAQUETES[paquete] || PAQUETES[POR_DEFECTO];
    var out = p.incluye.slice();
    (extras || []).forEach(function (k) {
      if (FUNCIONES[k] && out.indexOf(k) === -1) out.push(k);
    });
    return out;
  }

  /** Lo que NO tiene: sirve para ofrecérselo, y para no dibujar esa solapa. */
  function leFalta(paquete, extras) {
    var tiene_ = funcionesDe(paquete, extras);
    return Object.keys(FUNCIONES).filter(function (k) { return tiene_.indexOf(k) === -1; });
  }

  window.INVPAQUETES = {
    FUNCIONES: FUNCIONES,
    PAQUETES: PAQUETES,
    POR_DEFECTO: POR_DEFECTO,
    tiene: tiene,
    funcionesDe: funcionesDe,
    leFalta: leFalta
  };
})();
