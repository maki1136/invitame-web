/* ===== EL ITINERARIO, EN EL PANEL =============================================

   POR QUÉ EXISTE — y es el motivo de fondo, no un detalle

   `/efectos/itinerario-momentos.js` sabe escribir los momentos de verdad desde
   `fx.itinerario.momentos`. Está hecho desde hace rato. Pero **no había ningún
   lugar donde cargarlos**: la única forma era escribir el array en la base a
   mano, desde la consola.

   O sea, otra vez lo mismo que pasó con el interruptor de la confirmación y con
   la raspadita: una función que sólo se prende programando es, para quien usa
   el panel, UNA FUNCIÓN QUE NO EXISTE.

   Y tuvo una consecuencia cara: como no se podían cargar los momentos, las
   invitaciones terminaban subiendo el itinerario como una **IMAGEN**. Una foto
   no se anima, no se lee en pantalla chica, no se puede traducir y hay que
   rehacerla entera si se corre un horario media hora.

   QUÉ TIENE ESTE BLOQUE

     · CÓMO SE MUESTRA: escrito (con los efectos) o una imagen. Antes no había
       dónde elegirlo y la imagen ganaba sola. Lo aplica itinerario-modo.js.
     · Los MOMENTOS: hora, qué pasa y un detalle opcional. Se agregan, se
       borran y se mueven.
     · El ESTILO de la línea: al costado o al medio en zigzag.
     · Un botón que ARMA LOS MOMENTOS LEYENDO EL TEXTO que ya está escrito en la
       sección («17:00 · Llegada…»), para no volver a tipear lo mismo.
     · Un botón que TRAE LO QUE CARGARON LOS NOVIOS en su propio panel.

   ⚠️ LA COMBINACIÓN QUE ROMPE, Y POR ESO ESTÁ AVISADA ACÁ ARRIBA
      Si el evento tiene una IMAGEN de itinerario cargada, el motor esconde la
      lista (`display:none`) y no se ve NADA de esto: ni los momentos, ni la
      animación, ni las perlas. No es un error del panel.
      → Desde que existe «Cómo se muestra», eso se arregla eligiendo «Escrito».
      → El aviso amarillo sólo aparece en modo «Automático», que es el único
        donde la imagen sigue ganando sola.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Y NO hay que guardarse `D.fx`: el panel lo REEMPLAZA cuando llega el
      evento desde Firestore, y la referencia vieja queda huérfana (parece que
      guarda y no guarda). Por eso `datos()` se vuelve a llamar adentro de cada
      handler. Misma nota en panel-fondo.js, panel-pieza.js y panel-rsvp.js.
   ============================================================================ */
(function () {

  var ID = 'itinerario-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* ⚠️ se llama de nuevo en cada handler: nunca guardarse el resultado */
  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.itinerario) d.fx.itinerario = {};
    var c = d.fx.itinerario;
    if (!Array.isArray(c.momentos)) c.momentos = [];
    return c;
  }

  /* ¿hay una imagen de itinerario cargada? Entonces la lista no se ve. */
  function hayImagen(d) {
    try {
      for (var k in d) {
        if (/^img_.*itinerario/i.test(k) && d[k]) return true;
      }
    } catch (e) {}
    return false;
  }

  /* El texto que ya está escrito en la sección, para no tipear dos veces. */
  function textoDeLaSeccion(d) {
    try {
      for (var k in d) {
        if (/itinerario-descripcion/i.test(k) && typeof d[k] === 'string' && d[k].trim()) {
          return d[k];
        }
      }
    } catch (e) {}
    return '';
  }

  /* «17:00 · Llegada, limonada y sombra»  ->  { h:'17:00', t:'Llegada…' }
     Acepta ·, -, – y : como separador, y líneas sin hora. */
  function parsear(txt) {
    return String(txt || '').split('\n').map(function (l) {
      var linea = l.trim();
      if (!linea) return null;
      var m = linea.match(/^(\d{1,2}[:.]\d{2})\s*(?:[·\-–—:]\s*)?(.*)$/);
      if (m) return { h: m[1].replace('.', ':'), t: m[2].trim(), d: '' };
      return { h: '', t: linea, d: '' };
    }).filter(Boolean);
  }

  function chico(el, css) { el.style.cssText = css; return el; }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = chico(document.createElement('div'),
      'font-size:13px;font-weight:600;margin-bottom:2px');
    t.textContent = 'El itinerario';
    caja.appendChild(t);

    var a = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35');
    a.textContent = 'Los momentos del día. Se dibujan solos y van apareciendo con el scroll.';
    caja.appendChild(a);

    /* ---- el aviso de la imagen: la combinación que rompe ---- */
    var aviso = chico(document.createElement('div'),
      'display:none;font-size:11.5px;line-height:1.4;margin:0 0 10px;padding:8px 10px;' +
      'border-radius:8px;background:#fff4e0;color:#7a5200;border:1px solid #f0d7a8');
    aviso.textContent = 'Ojo: este itinerario tiene una IMAGEN cargada. Mientras esté puesta, ' +
      'la lista no se ve en la invitación. Borrá la imagen del sector para que se vean los momentos.';
    caja.appendChild(aviso);

    /* ---- COMO SE MUESTRA: imagen o texto ---------------------------------
       Antes no habia donde elegir: si quedaba una imagen cargada (aunque fuera
       de una prueba vieja) el motor la mostraba y la lista no se dibujaba
       nunca, asi que los efectos de la coleccion no aparecian. Ahora se dice
       explicitamente. Lo aplica /efectos/itinerario-modo.js. ------------- */
    var filaModo = chico(document.createElement('div'), 'margin:0 0 12px');
    var labModo = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    labModo.textContent = 'Como se muestra';
    filaModo.appendChild(labModo);

    var selModo = chico(document.createElement('select'), 'width:100%');
    [['',       'Automatico (si hay imagen cargada, gana la imagen)'],
     ['texto',  'Escrito — con los momentos y los efectos'],
     ['imagen', 'Una imagen que subo yo']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      selModo.appendChild(op);
    });
    selModo.value = String(datos(d).modo || '');
    filaModo.appendChild(selModo);

    var ayudaModo = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin:4px 0 0;line-height:1.35');
    filaModo.appendChild(ayudaModo);
    caja.appendChild(filaModo);

    /* ---- la imagen del itinerario ---- */
    var CLAVE_IMG = 'img_c_itinerario-imagen';
    var cajaImg = chico(document.createElement('div'), 'display:none;margin:0 0 12px');

    var subir = chico(document.createElement('button'), 'cursor:pointer;padding:6px 10px');
    subir.type = 'button'; subir.textContent = '⬆ Subir imagen del itinerario';
    var file = document.createElement('input');
    file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    subir.onclick = function () { file.click(); };

    var prev = chico(document.createElement('div'), 'margin-top:6px');

    var quitar = chico(document.createElement('button'), 'cursor:pointer;padding:6px 10px;margin-left:6px');
    quitar.type = 'button'; quitar.textContent = 'Quitar imagen';
    quitar.onclick = function () {
      var dd = borrador(); if (!dd) return;
      /* se borran TODAS las variantes viejas: si queda una, el motor la usa */
      for (var k in dd) { if (/^img_.*itinerario/i.test(k)) dd[k] = ''; }
      pintarImg(); refrescar();
    };

    file.onchange = function () {
      var f = file.files && file.files[0]; if (!f) return;
      if (!window.INV || !window.INV.uploadImage) {
        alert('Todavia no cargo la base. Espera 2 segundos.'); return;
      }
      var antes = subir.textContent;
      subir.textContent = 'Subiendo…';
      window.INV.uploadImage(f).then(function (url) {
        var dd = borrador(); if (dd) dd[CLAVE_IMG] = url;
        subir.textContent = antes;
        file.value = '';
        pintarImg(); refrescar();
      })['catch'](function () {
        subir.textContent = antes;
        alert('No pude subir la imagen. Proba de nuevo.');
      });
    };

    cajaImg.appendChild(subir);
    cajaImg.appendChild(quitar);
    cajaImg.appendChild(file);
    cajaImg.appendChild(prev);
    caja.appendChild(cajaImg);

    function urlImg(dd) {
      if (!dd) return '';
      if (dd[CLAVE_IMG]) return dd[CLAVE_IMG];
      for (var k in dd) { if (/^img_.*itinerario/i.test(k) && dd[k]) return dd[k]; }
      return '';
    }
    function pintarImg() {
      var dd = borrador(); var u = urlImg(dd);
      prev.innerHTML = u
        ? '<img src="' + String(u).replace(/"/g, '&quot;') +
          '" style="max-height:80px;border-radius:8px;display:block">'
        : '<span style="font-size:11.5px;opacity:.6">Todavia no hay imagen cargada.</span>';
      quitar.style.display = u ? '' : 'none';
    }
    pintarImg();

    function acomodarModo() {
      var dd = borrador() || d;
      var m = String(datos(dd).modo || '');
      cajaImg.style.display = (m === 'imagen') ? '' : 'none';
      var u = urlImg(dd);
      if (m === 'texto') {
        ayudaModo.textContent = 'Se ven los momentos escritos, con los efectos de la coleccion. ' +
          (u ? 'La imagen cargada queda guardada pero NO se muestra.' : '');
      } else if (m === 'imagen') {
        ayudaModo.textContent = u
          ? 'Se ve la imagen. Los momentos escritos quedan guardados pero no se muestran.'
          : 'Falta subir la imagen: mientras no la subas, la seccion no se muestra.';
      } else {
        ayudaModo.textContent = u
          ? 'Hay una imagen cargada, asi que HOY se ve la imagen. Si queres los momentos con perlas, elegi "Escrito".'
          : 'Sin imagen cargada se ven los momentos escritos.';
      }
    }
    selModo.onchange = function () {
      datos(borrador() || d).modo = selModo.value;
      acomodarModo(); refrescar();
    };
    acomodarModo();

    /* ---- el estilo de la línea ---- */
    var fila = chico(document.createElement('div'), 'margin:0 0 12px');
    var lab = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lab.textContent = 'La línea';
    fila.appendChild(lab);

    var sel = chico(document.createElement('select'), 'width:100%');
    [['izquierda', 'Al costado (por defecto)'],
     ['centro',    'Al medio, en zigzag']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      sel.appendChild(op);
    });
    sel.value = (datos(d).estilo === 'centro') ? 'centro' : 'izquierda';
    sel.onchange = function () { datos(d).estilo = sel.value; refrescar(); };
    fila.appendChild(sel);
    caja.appendChild(fila);

    /* ---- los momentos ---- */
    var lista = document.createElement('div');
    caja.appendChild(lista);

    function dibujar() {
      var c = datos(d);
      lista.innerHTML = '';

      c.momentos.forEach(function (m, i) {
        var f = chico(document.createElement('div'),
          'display:grid;grid-template-columns:64px 1fr auto;gap:5px;margin:0 0 5px;align-items:start');

        var hora = document.createElement('input');
        hora.type = 'text'; hora.placeholder = '17:00'; hora.value = m.h || '';
        hora.style.cssText = 'width:100%';
        hora.oninput = function () { datos(d).momentos[i].h = hora.value; refrescar(); };

        var col = chico(document.createElement('div'), 'display:grid;gap:4px');
        var tit = document.createElement('input');
        tit.type = 'text'; tit.placeholder = 'Ceremonia'; tit.value = m.t || '';
        tit.style.cssText = 'width:100%';
        tit.oninput = function () { datos(d).momentos[i].t = tit.value; refrescar(); };
        var det = document.createElement('input');
        det.type = 'text'; det.placeholder = 'Detalle (opcional)'; det.value = m.d || '';
        det.style.cssText = 'width:100%;font-size:12px';
        det.oninput = function () { datos(d).momentos[i].d = det.value; refrescar(); };
        col.appendChild(tit); col.appendChild(det);

        var bor = chico(document.createElement('button'),
          'cursor:pointer;line-height:1;padding:6px 8px');
        bor.type = 'button'; bor.textContent = '✕'; bor.title = 'Borrar este momento';
        bor.onclick = function () {
          datos(d).momentos.splice(i, 1);
          dibujar(); refrescar();
        };

        f.appendChild(hora); f.appendChild(col); f.appendChild(bor);
        lista.appendChild(f);
      });

      if (!c.momentos.length) {
        var v = chico(document.createElement('div'),
          'font-size:11.5px;opacity:.6;margin:0 0 8px');
        v.textContent = 'Todavía no hay momentos cargados. Mientras tanto la invitación ' +
                        'muestra los del ejemplo.';
        lista.appendChild(v);
      }
    }
    dibujar();

    /* ---- los dos botones ---- */
    var botones = chico(document.createElement('div'), 'display:flex;gap:6px;margin:8px 0 0');

    var mas = chico(document.createElement('button'), 'cursor:pointer;padding:6px 10px');
    mas.type = 'button'; mas.textContent = '+ Agregar momento';
    mas.onclick = function () {
      datos(d).momentos.push({ h: '', t: '', d: '' });
      dibujar(); refrescar();
    };
    botones.appendChild(mas);

    var traer = chico(document.createElement('button'), 'cursor:pointer;padding:6px 10px');
    traer.type = 'button'; traer.textContent = 'Traer los del texto';
    traer.title = 'Arma los momentos leyendo lo que ya está escrito en la sección';
    traer.onclick = function () {
      var ms = parsear(textoDeLaSeccion(borrador() || d));
      if (!ms.length) { traer.textContent = 'No encontré texto'; setTimeout(function () {
        traer.textContent = 'Traer los del texto'; }, 1800); return; }
      datos(d).momentos = ms;
      dibujar(); refrescar();
    };
    botones.appendChild(traer);

    /* ---- lo que cargaron los novios en SU panel ---------------------------
       Las reglas de Firestore NO dejan que los novios escriban en `inv_eventos`
       (y está bien: cualquiera con el link del panel podría romper la
       invitación). Lo que ellos eligen queda en `inv_paneles/<slug>__<clave>`,
       y de acá se trae con un botón. Es el mismo camino que ya usan las mesas.
       ⚠️ Traer NO publica: después hay que tocar "Guardar y publicar". */
    var novios = chico(document.createElement('button'), 'cursor:pointer;padding:6px 10px');
    novios.type = 'button'; novios.textContent = 'Traer lo de los novios';
    novios.title = 'Trae los momentos y la elección (escrito o imagen) que cargaron en su panel';
    novios.onclick = function () {
      var dd = borrador(); if (!dd) return;
      var slug  = String(dd.slug || '').trim();
      var clave = String(dd['c_clave-del-panel-de-los-novios'] || '').trim();
      if (!slug || !clave) { avisar('Este evento no tiene panel de novios'); return; }
      if (!window.INV || !window.INV.db) { avisar('Todavía no cargó la base'); return; }
      var antes = novios.textContent; novios.textContent = 'Buscando…';
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')
        .then(function (m) {
          return m.getDoc(m.doc(window.INV.db, 'inv_paneles', slug + '__' + clave));
        })
        .then(function (snap) {
          novios.textContent = antes;
          var p = snap && snap.exists() ? snap.data() : null;
          var it = p && p.itinerario;
          if (!it) { avisar('No cargaron nada todavía'); return; }
          var d2 = borrador(); if (!d2) return;
          var c = datos(d2);
          if (it.modo === 'texto' || it.modo === 'imagen') c.modo = it.modo;
          if (Object.prototype.toString.call(it.momentos) === '[object Array]' &&
              it.momentos.length) c.momentos = it.momentos;
          if (it.imagen) d2['img_c_itinerario-imagen'] = it.imagen;
          if (selModo.value !== String(c.modo || '')) selModo.value = String(c.modo || '');
          acomodarModo(); pintarImg(); dibujar(); refrescar();
          avisar('Listo — tocá "Guardar y publicar"');
        })['catch'](function () {
          novios.textContent = antes;
          avisar('No pude leer su panel');
        });
    };
    function avisar(txt) {
      var v = novios.textContent;
      novios.textContent = txt;
      setTimeout(function () { novios.textContent = 'Traer lo de los novios'; }, 2400);
    }
    botones.appendChild(novios);

    caja.appendChild(botones);

    /* se re-sincroniza en vivo: el evento llega DESPUÉS de que se arma esto */
    caja.__sync = function () {
      var dd = borrador(); if (!dd) return;
      var _m = String(datos(dd).modo || '');
      /* el aviso viejo solo tiene sentido en automatico: en 'texto' ya no aplica */
      aviso.style.display = (hayImagen(dd) && _m === '') ? 'block' : 'none';
      if (selModo.value !== _m) { selModo.value = _m; }
      acomodarModo(); pintarImg();
      var c = datos(dd);
      if (document.activeElement && caja.contains(document.activeElement)) return;
      var quiero = (c.estilo === 'centro') ? 'centro' : 'izquierda';
      if (sel.value !== quiero) sel.value = quiero;
      var puestos = lista.querySelectorAll('input[placeholder="17:00"]').length;
      if (puestos !== c.momentos.length) dibujar();
    };

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;

    var ya = document.getElementById(ID);
    if (ya) { if (ya.__sync) ya.__sync(); return; }

    var m = document.querySelector('.mejoras');
    if (!m) return;

    /* debajo del bloque de la fecha, que es de lo que viene hablando */
    var ancla = document.getElementById('fecha-selector') ||
                document.getElementById('muestra-selector') ||
                document.getElementById('rsvp-selector');
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
