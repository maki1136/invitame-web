/* ===== EL VESTIDO DE UNA MUESTRA =============================================

   ESTE ARCHIVO ES **EL ÚNICO** LUGAR QUE SABE QUÉ SE COPIA DE UNA MUESTRA.

   Le pone a una invitación el DISEÑO de otra: la colección, el sobre, la
   paleta, las tipografías, los colores de cada sección y el orden. Los datos
   —nombres, fechas, fotos, invitados— no se tocan nunca.

   POR QUÉ ESTÁ ACÁ Y NO ADENTRO DEL PANEL
   Hasta el 8/9/2026 esto vivía dentro de `/efectos/panel-solicitud-muestra.js`
   y sólo corría en el admin, cuando Jazmín traía una solicitud. Ahora lo
   necesitan DOS pantallas:
     · el panel, como siempre
     · y el formulario del cliente, para que vea su diseño al instante y para
       que la invitación nazca vestida
   Copiarlo hubiera sido garantizar que algún día las cinco limpiezas de abajo
   se arreglen en un lado y no en el otro. Y esas limpiezas son lo que evita
   publicarle a un cliente la boda de otra pareja.

   ⚠️⚠️ LAS CINCO LIMPIEZAS — cada una tapa una fuga que se vio de verdad
     1. `fx.muestra` — los interruptores de VENTA (los teléfonos de Invítame y
        el «¿quieres la tuya?»). En la invitación de un cliente NO van nunca.
     2. `fx.galeria.gid` — el código de la galería de ESA fiesta. Dos eventos
        con el mismo código comparten las fotos de los invitados.
     3. `fx.carta` — la hoja de la muestra cuenta la historia de OTRA pareja.
        Se copian los colores y la tipografía; las palabras se vacían.
     4. `fx.itinerario.momentos` — son los horarios de otra fiesta.
     5. `fx.pasevoz` — LA PEOR. Es la VOZ de los anfitriones de la muestra.
        Clonarla pondría a Camila y Tomás hablándole a los invitados de otra
        boda, y sonando. Se quedan el papel y la tinta; el audio se vacía.

   ⚠️ Y NO SE COPIA NINGUNA IMAGEN. NI LAS DE FONDO. En `camila-y-tomas` el
      fondo de la sección de la frase es una FOTO DE LA PAREJA. Regla sin
      excepciones: **una imagen es contenido**.

   ⚠️⚠️ LA VOZ DEL CLIENTE NO ES PARTE DEL VESTIDO  (14/9/2026)
   Estuvo escrita adentro de `vestir()`, y eso la ataba a una condición que no
   tiene nada que ver con ella: `crear-diseno.js` sólo llama a `vestir()` si ya
   terminó de bajar la muestra elegida. Medido con una solicitud de prueba:

       con muestra elegida →  fx.pasevoz encendido, con audio y onda   OK
       sin muestra elegida →  fx.pasevoz no existe                     SE PIERDE

   O sea: el cliente que llena todo el formulario y manda sin bajar hasta la
   tarjeta del diseño —o el que eligió diseño pero tiene mala señal y todavía
   no bajó— grababa su mensaje y el mensaje no llegaba a ninguna parte. En
   silencio: el audio queda guardado en `inv_solicitudes`, así que ni siquiera
   se pierde del todo, simplemente no aparece y nadie se entera.

   Ahora es su propio paso, `laVozDelCliente()`, que se puede llamar SIEMPRE.
   Es idempotente: llamarla dos veces escribe exactamente lo mismo.

   ⚠️ ES UN SCRIPT CLÁSICO (no módulo): publica `window.INVVESTIR`.
   ============================================================================ */
(function () {
  'use strict';

  /* el vestido: lo único que se copia de la muestra */
  var DISENO = [
    'fx', 'tema', 'color', 'ver', 'tpl',
    'nfont', 'fTit', 'fTit2', 'fraseFont', 'fraseSize', 'nsize', 'ncolor', 'layout',
    'kickColor', 'fraseColor', 'fraseFx',
    'evColor', 'evTextColor', 'evBtnColor', 'evBtnTextColor',
    'galTextColor', 'padresColor', 'regColor', 'cfColor',
    'secOrden'
  ];

  /* además, todo lo que es puro color. NINGUNA imagen: ver la nota de arriba. */
  function esDeDiseno(k) {
    if (k.indexOf('img_') === 0) return false;      /* una imagen es contenido */
    if (DISENO.indexOf(k) >= 0) return true;
    if (/^c_color-/.test(k)) return true;
    if (/^c_fondo-color-/.test(k)) return true;
    return false;
  }

  function copia(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; }
  }

  /**
   * El mensaje de voz que grabó ESTE cliente en /crear.js.
   *
   * Se llama sola desde `vestir()`, y aparte —siempre— desde
   * `crear-diseno.js`, porque el cliente puede haber grabado su mensaje sin
   * haber elegido ningún diseño. Ver la nota grande de arriba.
   *
   * @param d   el borrador de la invitación (SE MODIFICA)
   * @param s   la solicitud, tal como la guardó /crear.js
   * @return    true si había una voz que poner
   */
  function laVozDelCliente(d, s) {
    if (!d) return false;
    s = s || {};
    var audio = String(s.pasevozAudio || '').trim();
    if (!audio) return false;
    if (!d.fx) d.fx = {};
    if (!d.fx.pasevoz) d.fx.pasevoz = {};
    d.fx.pasevoz.audio = audio;
    d.fx.pasevoz.onda  = String(s.pasevozOnda || '');
    /* se prende SOLO si hay audio: dejarlo prendido en falso le mentiría al
       panel, y el motor no dibuja un pase mudo igual */
    d.fx.pasevoz.encendido = true;
    return true;
  }

  /**
   * LO QUE NUNCA VIAJA DE UNA INVITACION A OTRA, se copie por donde se copie.
   *
   * Nacio adentro de `vestir()` (el camino formulario -> invitacion), pero el
   * admin tiene OTROS dos caminos —«Duplicar» y «Clonar»— que copiaban el
   * documento entero. Por ahi se filtro la voz de Camila y Tomas a la muestra
   * de Valeria: el pase sonaba «Hola, somos Camila y Tom» en una boda que no
   * era la de ellos. Maki lo escucho y lo reporto tres veces.
   *
   * Son dos cosas, y las dos son IDENTIDAD de la otra fiesta, no diseño:
   *   · la VOZ de los anfitriones (suena sola, dice sus nombres)
   *   · el codigo de la galeria, que es de ESA fiesta: dos eventos con el
   *     mismo codigo comparten las fotos que suben los invitados.
   *
   * @param d  el borrador de la invitacion (SE MODIFICA)
   * @return   que se limpio, para poder contarlo
   */
  function limpiarLoQueEsDeOtros(d) {
    var hecho = [];
    if (!d || !d.fx) return hecho;
    if (d.fx.pasevoz && (d.fx.pasevoz.audio || d.fx.pasevoz.encendido)) {
      d.fx.pasevoz.audio = '';
      d.fx.pasevoz.onda  = '';
      d.fx.pasevoz.encendido = false;
      hecho.push('la voz del pase');
    }
    if (d.fx.galeria && d.fx.galeria.gid) {
      d.fx.galeria.gid = '';
      hecho.push('el codigo de la galeria');
    }
    return hecho;
  }

  /**
   * Le pone a `d` el vestido de `muestra`.
   * @param d          el borrador de la invitación (SE MODIFICA)
   * @param muestra    el evento de la muestra, tal como sale de Firestore
   * @param solicitud  lo que llenó el cliente. Sólo se usa para el pase con voz.
   * @return           la lista de claves que se pusieron
   */
  function vestir(d, muestra, solicitud) {
    var puestos = [];
    if (!d || !muestra) return puestos;

    Object.keys(muestra).forEach(function (k) {
      if (!esDeDiseno(k)) return;
      if (muestra[k] == null || muestra[k] === '') return;
      d[k] = copia(muestra[k]);
      puestos.push(k);
    });

    /* las cinco limpiezas. Ver la nota grande de arriba. */
    if (d.fx) {
      if (d.fx.muestra) delete d.fx.muestra;
      if (d.fx.carta) {
        d.fx.carta.titulo = '';
        d.fx.carta.texto  = '';
        d.fx.carta.kicker = '';
      }
      if (d.fx.itinerario) d.fx.itinerario.momentos = [];
      limpiarLoQueEsDeOtros(d);   /* la voz y el codigo de la galeria */
      if (d.fx.pasevoz) {
        d.fx.pasevoz.departe = '';
        d.fx.pasevoz.nota    = '';
        d.fx.pasevoz.titulo  = '';
      }
      /* el paquete es del cliente, no de la muestra */
      if (d.fx.paquete) delete d.fx.paquete;
    }

    /* y recién ahora, la voz que grabó ESTE cliente. Va DESPUÉS de la limpieza
       5 a propósito: primero se borra la de la muestra, después se pone la suya. */
    if (laVozDelCliente(d, solicitud)) puestos.push('pase con voz del cliente');

    return puestos;
  }

  /* Baja el evento de una muestra. Sirve en las dos pantallas: `inv_eventos` se
     lee sin sesión (es lo que hace cualquier invitación). */
  function bajarMuestra(slug) {
    var url = 'https://firestore.googleapis.com/v1/projects/invitame-9b51f/' +
              'databases/(default)/documents/inv_eventos/' + encodeURIComponent(slug);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('no pude bajar la muestra');
      return r.json();
    }).then(function (j) { return desdeFirestore(j.fields || {}); });
  }

  /* del formato de Firestore a un objeto normal */
  function desdeFirestore(f) {
    var out = {};
    Object.keys(f).forEach(function (k) { out[k] = valor(f[k]); });
    return out;
  }
  function valor(v) {
    if (!v || typeof v !== 'object') return v;
    if ('stringValue'  in v) return v.stringValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('integerValue' in v) return parseInt(v.integerValue, 10);
    if ('doubleValue'  in v) return v.doubleValue;
    if ('nullValue'    in v) return null;
    if ('timestampValue' in v) return v.timestampValue;
    if ('mapValue' in v)   return desdeFirestore((v.mapValue && v.mapValue.fields) || {});
    if ('arrayValue' in v) return ((v.arrayValue && v.arrayValue.values) || []).map(valor);
    return null;
  }

  window.INVVESTIR = {
    DISENO: DISENO,
    esDeDiseno: esDeDiseno,
    vestir: vestir,
    limpiarLoQueEsDeOtros: limpiarLoQueEsDeOtros,
    laVozDelCliente: laVozDelCliente,
    bajarMuestra: bajarMuestra,
    desdeFirestore: desdeFirestore
  };
})();
