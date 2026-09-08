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
      if (d.fx.galeria && d.fx.galeria.gid) d.fx.galeria.gid = '';
      if (d.fx.carta) {
        d.fx.carta.titulo = '';
        d.fx.carta.texto  = '';
        d.fx.carta.kicker = '';
      }
      if (d.fx.itinerario) d.fx.itinerario.momentos = [];
      if (d.fx.pasevoz) {
        d.fx.pasevoz.audio = '';
        d.fx.pasevoz.onda  = '';
        d.fx.pasevoz.encendido = false;
        d.fx.pasevoz.departe = '';
        d.fx.pasevoz.nota    = '';
        d.fx.pasevoz.titulo  = '';
      }
      /* el paquete es del cliente, no de la muestra */
      if (d.fx.paquete) delete d.fx.paquete;
    }

    /* y recién ahora, la voz que grabó ESTE cliente en /crear.js */
    var s = solicitud || {};
    var audio = String(s.pasevozAudio || '').trim();
    if (audio) {
      if (!d.fx) d.fx = {};
      if (!d.fx.pasevoz) d.fx.pasevoz = {};
      d.fx.pasevoz.audio = audio;
      d.fx.pasevoz.onda  = String(s.pasevozOnda || '');
      d.fx.pasevoz.encendido = true;
      puestos.push('pase con voz del cliente');
    }
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
    bajarMuestra: bajarMuestra,
    desdeFirestore: desdeFirestore
  };
})();
