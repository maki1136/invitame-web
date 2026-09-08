/* ===== DE LO QUE LLENA EL CLIENTE A LA INVITACIÓN =============================

   ESTE ARCHIVO ES **EL ÚNICO** LUGAR DONDE SE TRADUCE UNA SOLICITUD.

   POR QUÉ EXISTE
   Este mapeo vivía adentro de `cargarSolicitudIdx()`, en el admin, y corría
   sólo cuando Jazmín apretaba «Cargar en el editor». Eso alcanzaba mientras la
   invitación la armaba una persona. Ya no:

     Maki, 8/9/2026, textual: «el objetivo de todo esto es que los novios
     completen el formulario y su panel y todo se guarde y la invitación se
     cree sola. El trabajo de Jazmín es verificar que la invitación esté ok y
     poder enviarla».

   Para que la invitación se cree sola al enviar el formulario, este mismo
   mapeo tiene que correr también del lado del cliente. Y ahí aparece la trampa
   clásica: copiarlo. Dos copias del mismo mapeo significan que dentro de tres
   meses alguien agrega un campo en una sola, y el dato del cliente se pierde
   EN SILENCIO — que es exactamente el bug que más veces se pagó en esta
   plataforma.

   ⭐ Entonces: una sola copia, acá, y los dos caminos la llaman.
      · `/crear.js`               → al enviar el formulario (la invitación se crea sola)
      · `/admin/4-solicitudes.js` → «Cargar en el editor» (el camino de siempre)

   ⚠️ ES UN SCRIPT CLÁSICO, NO UN MÓDULO. `crear.js` sí es `type="module"`, pero
      este archivo se carga con un `<script>` normal y publica `window.SOLICITUD_A_EVENTO`.
      Así lo puede usar también el admin, que son scripts clásicos.

   ⚠️ ACÁ NO SE TOCA LA PANTALLA. Ni `render()`, ni `alert()`, ni el panel. Sólo
      se llenan datos. Lo único que sale afuera es `opciones.tema`, porque poner
      un tema en el admin repinta media pantalla y eso es asunto del admin.

   ⚠️ ACÁ NO SE PONE EL DISEÑO (`fx`). El vestido lo copia
      `/efectos/panel-solicitud-muestra.js` desde la muestra que eligió el
      cliente, y tiene su propia lista de cinco cosas que hay que limpiar (los
      teléfonos de venta, la galería, la carta, el itinerario y LA VOZ de los
      anfitriones). Eso vive allá a propósito: es otra decisión y otra lista.

   ⚠️ SI SE AGREGA UN CAMPO AL FORMULARIO, SE AGREGA ACÁ. Y el chequeo
      automático lo controla: `chequeo/campos.js`, bloque 5, compara los campos
      de `crear.js` contra ESTE archivo y avisa «LO LLENA EL CLIENTE Y NO LLEGA
      AL PANEL».
   ============================================================================ */
(function () {
  'use strict';

  /* Copia exacta del `slug` de /admin/1-campos.js. Está duplicado a propósito y
     con esta nota: este archivo tiene que servir también en `crear.html`, donde
     el admin no existe. Si alguno de los dos cambia, cambian los dos, o dos
     clientes con el mismo nombre podrían pisarse la dirección. */
  function slug(s) {
    return String(s || '').toLowerCase().normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  /* El token es el QR del invitado: tiene que ser imposible de adivinar.
     Sin `l`, `o`, `0` ni `1`, que se confunden al dictarlos por teléfono. */
  function nuevoToken() {
    if (window.INV && typeof window.INV.rndToken === 'function') return window.INV.rndToken();
    var abc = 'abcdefghijkmnpqrstuvwxyz23456789';
    var b = new Uint8Array(10);
    crypto.getRandomValues(b);
    return Array.prototype.map.call(b, function (x) { return abc[x % abc.length]; }).join('');
  }

  /* Los campos que van tal cual a una clave del panel. Izquierda: como se llama
     en la solicitud. Derecha: la clave EXACTA del campo del panel.
     ⚠️ Las claves de la derecha están clavadas en /admin/0-claves.js. No se
        inventan ni se derivan del rótulo: si una cambia, el dato se pierde. */
  var DIRECTOS = {
    dress:       'c_dresscode-texto',
    regalos:     'c_frase-para-seccion-regalos-mesa',
    hoteles:     'c_datos-de-hoteles-recomendados',
    hotDesc:     'c_descripcion-hotel',
    itinerario:  'c_itinerario-descripcion',
    persFrase:   'c_frase-para-la-seccion-personas',
    galEstilo:   'c_estilo-de-la-galeria-de-fotos',
    igUser:      'c_usuario-de-instragram',
    cfFrase:     'c_frase-para-seccion-confirmacion',
    cfMail:      'c_email-para-confirmaciones',
    cfWsp1:      'c_numero-de-whatsapp',
    cfWsp1n:     'c_texto-corto-boton-wsp',
    cfWsp2:      'c_numero-de-whatsapp-2',
    cfWsp2n:     'c_texto-corto-boton-wsp-2',
    textoFinal:  'c_texto-final'
  };

  /* Los que se llaman igual en los dos lados. */
  var IGUALES = ['orden', 'videoUrl', 'fraseFinal', 'musica', 'musicaUrl',
                 'fraseFx', 'igHashtag', 'spotifyUrl', 'tipoEvento'];

  /* La mesa de regalos: son muchos y todos se llaman igual. */
  var REGALOS = ['reg_liverpool', 'reg_amazon', 'reg_sears', 'reg_mercadolibre',
                 'reg_palacio', 'reg_venmo', 'reg_paypal', 'reg_otro_n',
                 'reg_otro_u', 'regClabe', 'regTitular', 'regBanco'];

  /**
   * Vuelca una solicitud sobre un borrador de invitación.
   *
   * @param s   la solicitud, tal como la guardó /crear.js en inv_solicitudes
   * @param d   el borrador a llenar (SE MODIFICA). En el admin es `D`.
   * @param opc { tema: function(tpl) }  — opcional. Se llama con el nombre del
   *            tema elegido para que el que llama decida qué hacer con él.
   * @return    el mismo `d`, ya llenado.
   */
  function mapear(s, d, opc) {
    if (!s || !d) return d;
    opc = opc || {};

    if (s.tpl && typeof opc.tema === 'function') opc.tema(s.tpl);

    /* ---- portada y datos principales ---- */
    d.n1 = s.n1 || d.n1;
    d.n2 = s.n2 || '';
    if (s.fecha)      d.fecha = s.fecha;
    d.frase = s.frase || '';
    if (s.kick)       d.kick = s.kick;
    if (s.cover)      d.cover = s.cover;
    if (s.coverVideo) d.coverVideo = s.coverVideo;
    if (s.galeria && s.galeria.length) d.galeria = s.galeria;

    IGUALES.forEach(function (k) { if (s[k]) d[k] = s[k]; });
    REGALOS.forEach(function (k) { if (s[k]) d[k] = s[k]; });

    /* ---- los tres eventos ----
       ⚠️ Los nombres NO coinciden: en la solicitud es `ev1d` y en el panel
          `ev1dir`; `ev1f` es `ev1fecha`. Se escriben SIEMPRE (aunque estén
          vacíos) para que no quede colgado el dato de la boda de ejemplo. */
    for (var i = 1; i <= 3; i++) {
      d['ev' + i + 't']     = s['ev' + i + 't'] || '';
      d['ev' + i + 'dir']   = s['ev' + i + 'd'] || '';
      d['ev' + i + 'fecha'] = s['ev' + i + 'f'] || '';
      d['ev' + i + 'maps']  = s['ev' + i + 'maps'] || '';
    }

    /* ---- la dirección de la invitación ---- */
    d.slug = slug((s.n1 || 'pareja') + (s.n2 ? '-y-' + s.n2 : ''));

    /* ---- lo que va a una clave con otro nombre ----
       Antes varios de estos sólo aparecían en un alert() y había que
       retipearlos a mano, o se perdían. */
    for (var k in DIRECTOS) {
      if (s[k]) d[DIRECTOS[k]] = s[k];
    }

    /* ---- las personas importantes (hasta 12) ---- */
    if (Object.prototype.toString.call(s.personas) === '[object Array]' && s.personas.length) {
      d.personas = s.personas.slice(0, 12).map(function (p) {
        return { nombre: p.nombre || '', rel: p.rel || '', foto: p.foto || '' };
      });
    }

    /* ---- lo que NO tiene un lugar propio en la invitación ----
       Las preferencias de color y de letra y el link de la música no son campos
       de la invitación: son cosas que el cliente PIDIÓ. Van al pedido especial,
       que es lo primero que se lee al abrir la invitación en el panel. */
    var notas = [];
    if (s.observaciones) notas.push(s.observaciones);
    if (s.colorSug)      notas.push('Colores que pidió: ' + s.colorSug);
    if (s.tipoSug)       notas.push('Estilo de letra que pidió: ' + s.tipoSug);
    if (s.musica)        notas.push('Música que pidió: ' + s.musica);
    if (notas.length)    d['c_pedido-especial-del-cliente'] = notas.join('\n');

    /* ---- los invitados, cada uno con su token (su QR) ---- */
    d.invitados = (s.invitados || []).map(function (g) {
      return { n: g.n, p: g.p || '1', m: g.m || '-', t: nuevoToken() };
    });

    return d;
  }

  window.SOLICITUD_A_EVENTO = {
    slug: slug,
    nuevoToken: nuevoToken,
    mapear: mapear
  };
})();
