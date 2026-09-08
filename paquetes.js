/* ===== LOS PAQUETES: QUÉ PRENDE CADA UNO =====================================

   ESTE ES **EL ÚNICO** ARCHIVO QUE DECIDE QUÉ FUNCIONES TIENE UNA INVITACIÓN.

   Lo usan tres pantallas, y las tres tienen que decir lo mismo:
     · `/crear.html`   — qué solapas ve el cliente mientras arma su invitación
     · `/admin.html`   — qué compró, y qué extra le vendieron aparte
     · `/mi-panel.html`— qué puede tocar la pareja después

   ⚠️⚠️ POR QUÉ ESTO EXISTE, Y NO ES BUROCRACIA
   Desde que el cliente puede personalizar su invitación solo, alguien con el
   paquete más barato podría abrir la solapa de personalizar y prenderse la
   galería de invitados, el filtro o el control de acceso. Es decir: regalarse
   justo lo único que no se regala.
       Regla comercial de Maki: «el gratis nunca lleva un leader».
   Personalizar COLORES, LETRAS y TEXTOS es libre para todos: no cuesta nada y
   es lo que hace que la invitación se sienta suya.
   PRENDER FUNCIONES lo decide esta tabla. No hay otra forma de prenderlas.

   ⚠️ LOS PRECIOS SALEN DE LA PÁGINA PÚBLICA (`/index.html`), leídos el
      8/9/2026. Están acá para que las pantallas puedan mostrarlos, NO para
      decidir nada comercial. **Antes de usarlos para vender se reverifican**:
      los precios de este rubro cambian todo el tiempo.

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

    /* --- desde Platinum QR --- */
    accesoQR:        { nombre: 'Control de acceso QR',       clase: 'leader', interruptor: null,
      nota: 'El escáner de la puerta (/scan.html). Nunca en un paquete regalado.' },

    /* --- los extras nuevos: al 8/9/2026 van TODOS a Platinum ---
       Maki: «respetá los paquetes de ahora y sumale al Platinum todo lo extra
       que tenemos, para comenzar con algo». */
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

  var BASE = ['cuentaRegresiva', 'ubicacion', 'itinerario', 'hospedaje', 'dresscode',
              'galeriaPareja', 'regalos', 'hashtag', 'rsvp'];

  var DE_PREMIUM = BASE.concat(['pases', 'musica', 'trivia']);

  var TODO_LO_EXTRA = ['filtro', 'galeriaInvitados', 'paseVoz', 'raspadita',
                       'calendario', 'sobreAnimado', 'carta', 'personas', 'video'];

  /* ---------------------------------------------------------------------------
     LOS PAQUETES  (precios de /index.html, leídos el 8/9/2026 — reverificar)
     --------------------------------------------------------------------------- */
  var PAQUETES = {
    estandar: {
      nombre: 'Estándar',
      bajada: 'Lo esencial para informar y emocionar.',
      precio: 850, moneda: 'MXN',
      incluye: BASE.slice()
    },
    premium: {
      nombre: 'Premium',
      bajada: 'Todo lo anterior, con música y pases.',
      precio: 1600, moneda: 'MXN',
      incluye: DE_PREMIUM.slice()
    },
    platinum: {
      nombre: 'Platinum QR',
      bajada: 'Todo, más control de acceso en la puerta.',
      precio: 2000, moneda: 'MXN',
      incluye: DE_PREMIUM.concat(['accesoQR']).concat(TODO_LO_EXTRA)
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
