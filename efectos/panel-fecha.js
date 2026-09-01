/* ===== LA FECHA Y LA RASPADITA, EN EL PANEL ==================================

   Dos módulos que estaban hechos y andando pero que sólo se podían prender
   escribiendo `fx.fecha` y `fx.raspadita` en la base a mano:
     · /efectos/fecha.js      → las nueve maneras de mostrar la fecha
     · /efectos/raspadita.js  → taparla para que el invitado la descubra

   POR QUÉ EXISTE
   Maki: «recordate que todos tienen que estar en el panel para que Jazmín lo
   pueda modificar y pueda verlo y funcionando todo».
   Es la tercera vez que aparece la misma regla. Una función que sólo se prende
   desde la consola es, para quien usa el panel, una función que no existe.

   ★★★ LA TRAMPA QUE HAY QUE AVISAR EN PANTALLA ★★★
   `fecha.js`, cuando hay una disposición elegida, ESCONDE la tapa del motor
   (`#scratch-cv`) esperando que `raspadita.js` ponga la suya. Si la raspadita
   está apagada, no la pone nadie: la fecha aparece YA REVELADA, debajo de un
   título que sigue diciendo "raspa para revelar".
   Maki lo reportó así: «la raspada viene ya raspada».
   → No se prohíbe la combinación (mostrar la fecha en círculos SIN raspadita
     es un diseño válido, si el título dice otra cosa). Se AVISA.

   ★★★ Y LA OTRA TRAMPA: EL MODO ★★★
   Con la raspadita prendida pero en modo "simple", `raspadita.js` tapa la
   tarjeta ENTERA con un rectángulo plateado: se raspa el rectángulo y recién
   ahí aparecen los círculos. Maki: «iban solamente los círculos y cada círculo
   se raspaba». Por eso el modo por defecto acá es "cada pedazo por su cuenta".

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
   ⚠️ NO GUARDARSE `D.fx` AL CONSTRUIR: el bloque se arma antes de que llegue el
      evento y después el panel REEMPLAZA `D.fx`. Por eso `datos()` se vuelve a
      llamar adentro de cada `onchange`.
   ============================================================================ */
(function () {

  var ID = 'fecha-selector';

  var DISPOSICIONES = [
    ['',            'Como viene (sin cambiar nada)'],
    ['circulos',    'Tres círculos — día, mes y año'],
    ['fotos',       'Con fotos detrás de los números'],
    ['barras',      'Tres barras horizontales'],
    ['apilada',     'Apilada, una debajo de la otra'],
    ['filetes',     'Con filetes finos arriba y abajo'],
    ['semana',      'Con el día de la semana'],
    ['monograma',   'Tipo monograma'],
    ['grande',      'El número bien grande'],
    ['manuscrita',  'Manuscrita']
  ];

  var COLORES = [
    ['',          'Plata (por defecto)'],
    ['oro',       'Oro'],
    ['champagne', 'Champagne'],
    ['lino',      'Lino'],
    ['kraft',     'Kraft'],
    ['salvia',    'Salvia'],
    ['uva',       'Uva'],
    ['verde',     'Verde'],
    ['tinta',     'Tinta']
  ];

  var FORMAS = [
    ['cuadrado', 'Cuadrada'],
    ['redondo',  'Redonda'],
    ['corazon',  'Corazón']
  ];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function fecha(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.fecha) d.fx.fecha = {};
    return d.fx.fecha;
  }
  function rasp(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.raspadita) d.fx.raspadita = {};
    return d.fx.raspadita;
  }
  function siNo(v) {
    return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || ''));
  }

  function armarSelect(opciones, valor) {
    var s = document.createElement('select');
    s.style.cssText = 'width:100%';
    opciones.forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      s.appendChild(op);
    });
    s.value = valor || '';
    if (s.selectedIndex < 0) s.selectedIndex = 0;
    return s;
  }

  function fila(caja, etiqueta, control) {
    var f = document.createElement('div');
    f.style.cssText = 'margin:0 0 8px';
    var l = document.createElement('label');
    l.textContent = etiqueta;
    l.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    f.appendChild(l);
    f.appendChild(control);
    caja.appendChild(f);
    return f;
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'La fecha y la raspadita';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Cómo se muestra la fecha del casamiento y si se tapa para que el invitado la descubra raspando.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    /* ---- 1 · la disposición ---- */
    var selDisp = armarSelect(DISPOSICIONES, fecha(d).disposicion);
    fila(caja, 'Cómo se muestra la fecha', selDisp);

    /* ---- 2 · la raspadita ---- */
    var lin = document.createElement('label');
    lin.style.cssText = 'display:flex;align-items:flex-start;gap:8px;font-size:12.5px;margin:2px 0 10px;cursor:pointer';
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.style.cssText = 'margin-top:2px';
    chk.checked = siNo(rasp(d).encendido);
    var sp = document.createElement('span');
    sp.textContent = 'Taparla con una raspadita';
    lin.appendChild(chk);
    lin.appendChild(sp);
    caja.appendChild(lin);

    /* ---- 3 · los ajustes de la raspadita ---- */
    var sub = document.createElement('div');

    var selModo = armarSelect(
      [['partes', 'Cada pedazo por su cuenta (día, mes y año)'],
       ['simple', 'Todo junto, de una sola pasada']],
      (String(rasp(d).modo || '').toLowerCase() === 'simple') ? 'simple' : 'partes');
    fila(sub, 'Cómo se raspa', selModo);

    var dosCol = document.createElement('div');
    dosCol.style.cssText = 'display:flex;gap:8px';
    var selForma = armarSelect(FORMAS, String(rasp(d).forma || 'cuadrado').toLowerCase());
    var selColor = armarSelect(COLORES, String(rasp(d).color || ''));
    var c1 = fila(dosCol, 'Forma de la tapa', selForma);
    var c2 = fila(dosCol, 'Color de la tapa', selColor);
    c1.style.flex = '1 1 50%';
    c2.style.flex = '1 1 50%';
    sub.appendChild(dosCol);

    caja.appendChild(sub);

    /* ---- el aviso ---- */
    var aviso = document.createElement('div');
    aviso.style.cssText = 'font-size:11px;line-height:1.4;margin-top:2px';
    caja.appendChild(aviso);

    function pintar() {
      sub.style.display = chk.checked ? 'block' : 'none';

      var hayDisp = !!selDisp.value;
      if (hayDisp && !chk.checked) {
        /* ⚠️ el caso que reportó Maki: «la raspada viene ya raspada» */
        aviso.textContent =
          '⚠️ Con una disposición elegida y la raspadita apagada, la fecha se ve ' +
          'directamente, sin tapar. Si el título de la sección dice "raspa para ' +
          'revelar", cambiálo o prendé la raspadita.';
        aviso.style.color = '#b06a2a';
      } else if (chk.checked && selModo.value === 'simple' && hayDisp) {
        aviso.textContent =
          'Se tapa toda la tarjeta con una sola lámina: se raspa el rectángulo y ' +
          'recién ahí aparecen los pedazos de la fecha.';
        aviso.style.color = '';
        aviso.style.opacity = '.6';
      } else if (chk.checked) {
        aviso.textContent =
          'Se tapa cada pedazo por separado y se van habilitando en orden: primero ' +
          'el día, después el mes, después el año.';
        aviso.style.color = '';
        aviso.style.opacity = '.6';
      } else {
        aviso.textContent = 'Apagada: la fecha se ve como siempre.';
        aviso.style.color = '';
        aviso.style.opacity = '.6';
      }
    }

    selDisp.onchange = function () {
      fecha(d).disposicion = selDisp.value;
      pintar();
      refrescar();
    };
    chk.onchange = function () {
      rasp(d).encendido = chk.checked;
      /* si se prende y nunca se eligió modo, el sano es "por partes" */
      if (chk.checked && !rasp(d).modo) { rasp(d).modo = selModo.value || 'partes'; }
      pintar();
      refrescar();
    };
    selModo.onchange  = function () { rasp(d).modo  = selModo.value;  pintar(); refrescar(); };
    selForma.onchange = function () { rasp(d).forma = selForma.value; refrescar(); };
    selColor.onchange = function () { rasp(d).color = selColor.value; refrescar(); };

    pintar();
    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;
    if (document.getElementById(ID)) return;
    var m = document.querySelector('.mejoras');
    if (!m) return;

    var ancla = document.getElementById('muestra-selector') ||
                document.getElementById('rsvp-selector') ||
                document.getElementById('fondo-selector') ||
                document.getElementById('paleta-selector');
    var caja = construir(d);
    if (ancla && ancla.parentNode === m) m.insertBefore(caja, ancla.nextSibling);
    else m.insertBefore(caja, m.firstChild);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
