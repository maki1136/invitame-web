/* ===== EL PAQUETE QUE COMPRÓ, EN EL PANEL =====================================

   Maki, 8/9/2026: *«tener en cuenta también algo importante: saber qué paquete
   eligió, para que cargue directo lo que compró, y poder tener la opción de
   hacerlo personalizado y guardado por Jazmín en el panel»*.

   QUÉ HACE ESTE BLOQUE
     · Muestra y deja elegir el paquete: Estándar, Premium o Platinum QR.
     · Deja marcar los EXTRAS vendidos aparte («le vendí la raspadita suelta»).
     · Y avisa, en rojo, si la invitación tiene PRENDIDO algo que no compró.

   ⚠️⚠️ ESE AVISO ES EL MOTIVO REAL POR EL QUE ESTE BLOQUE EXISTE.
   Regla comercial de Maki: «el gratis nunca lleva un leader». La galería, el
   QR y el filtro son lo único irrepetible que tiene Invítame; si se prenden
   por descuido en un paquete que no los incluye, se regaló justo eso — y nadie
   se entera, porque una invitación se mira de a una y se ve preciosa igual.
   El aviso convierte una pérdida invisible en una línea roja en la pantalla.

   ⚠️ ACÁ NO SE APAGA NADA SOLO. A propósito: apagarle una sección a una
      invitación que el equipo ya mostró sería peor que el problema. Se avisa,
      y decide una persona.

   ⚠️ LA TABLA NO ESTÁ ACÁ. Vive en `/paquetes.js` (`window.INVPAQUETES`), que
      es el único lugar donde se dice qué incluye cada paquete. El día que
      cambien los precios o los planes, se toca ese archivo y esta pantalla se
      entera sola.

   DÓNDE SE GUARDA
   En `fx.paquete = { plan, extras: [] }`. Va en el documento del evento (que es
   público) y no en `inv_privado` a propósito: no es un dato sensible —es lo
   mismo que está publicado en la página de precios— y así, el día que la
   invitación quiera mostrar u ocultar algo según el plan, puede leerlo.
   ============================================================================ */
(function () {

  var ID = 'paquete-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function tabla() { return window.INVPAQUETES || null; }

  /* ⚠️ se vuelve a llamar en cada handler: el panel REEMPLAZA `D.fx` cuando
     llega el evento desde Firestore, y una referencia vieja queda huérfana
     (parece que guarda y no guarda). Misma nota en panel-fondo.js. */
  function cfg(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.paquete) d.fx.paquete = {};
    var c = d.fx.paquete;
    if (!c.plan) c.plan = (tabla() ? tabla().POR_DEFECTO : 'estandar');
    if (Object.prototype.toString.call(c.extras) !== '[object Array]') c.extras = [];
    return c;
  }

  /* ¿Está prendida esta función en ESTA invitación?
     Sólo se puede saber de las que tienen interruptor. Las demás aparecen si
     hay dato cargado, y eso no es «regalar»: es que el cliente lo llenó. */
  function estaPrendida(d, clave) {
    var t = tabla(); if (!t) return false;
    var f = t.FUNCIONES[clave];
    if (!f || !f.interruptor) return false;
    var partes = f.interruptor.split('.');   // ej: fx.filtro.encendido
    var v = d;
    for (var i = 0; i < partes.length; i++) {
      if (v == null || typeof v !== 'object') return false;
      v = v[partes[i]];
    }
    return !!v;
  }

  function chico(el, css) { el.style.cssText = css; return el; }

  function construir(d) {
    var t = tabla();
    var caja = document.createElement('div');
    caja.className = 'mejoras';
    caja.id = ID;

    var h = document.createElement('div');
    h.className = 'h efx';
    h.innerHTML = ico('regalo') + ' El paquete que compró';
    caja.appendChild(h);

    if (!t) {
      var err = document.createElement('div');
      err.className = 'hint';
      err.textContent = 'No cargó /paquetes.js, así que no puedo mostrar los paquetes. Recargá la página.';
      caja.appendChild(err);
      return caja;
    }

    var ayuda = document.createElement('div');
    ayuda.className = 'hint';
    ayuda.style.marginBottom = '10px';
    ayuda.textContent = 'Lo que compró decide qué le corresponde. Si le vendiste algo suelto, marcalo abajo.';
    caja.appendChild(ayuda);

    /* ---- el plan ---- */
    var fila = chico(document.createElement('div'), 'margin:0 0 12px');
    var lab = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lab.textContent = 'Paquete';
    fila.appendChild(lab);

    var sel = chico(document.createElement('select'), 'width:100%');
    Object.keys(t.PAQUETES).forEach(function (k) {
      var p = t.PAQUETES[k];
      var op = document.createElement('option');
      op.value = k;
      op.textContent = p.nombre + ' — $' + p.precio + ' ' + p.moneda;
      sel.appendChild(op);
    });
    sel.value = cfg(d).plan;
    fila.appendChild(sel);
    caja.appendChild(fila);

    var incluye = chico(document.createElement('div'), 'font-size:11.5px;line-height:1.5;margin:0 0 12px;opacity:.72');
    caja.appendChild(incluye);

    /* ---- los extras vendidos aparte ---- */
    var tituloExtras = chico(document.createElement('div'),
      'font-size:12px;font-weight:600;margin:0 0 4px');
    tituloExtras.textContent = 'Le vendiste aparte';
    caja.appendChild(tituloExtras);

    var listaExtras = chico(document.createElement('div'), 'margin:0 0 12px');
    caja.appendChild(listaExtras);

    /* ---- el aviso de lo regalado ---- */
    var aviso = chico(document.createElement('div'),
      'display:none;font-size:11.5px;line-height:1.45;margin:0 0 4px;padding:9px 11px;' +
      'border-radius:9px;background:#FDEDEE;color:#6D1233;border:1px solid #F8D3D6');
    caja.appendChild(aviso);

    function pintar() {
      var dd = borrador() || d;
      var c = cfg(dd);
      var p = t.PAQUETES[c.plan] || t.PAQUETES[t.POR_DEFECTO];

      /* qué incluye */
      incluye.innerHTML = '<b>Incluye:</b> ' + p.incluye.map(function (k) {
        return t.FUNCIONES[k] ? t.FUNCIONES[k].nombre : k;
      }).join(' · ');

      /* los extras posibles son los que NO trae el plan */
      var afuera = t.leFalta(c.plan, []);
      listaExtras.innerHTML = '';
      if (!afuera.length) {
        var todo = chico(document.createElement('div'), 'font-size:11.5px;opacity:.6');
        todo.textContent = 'Este paquete ya trae todo. No hay nada para vender aparte.';
        listaExtras.appendChild(todo);
      } else {
        afuera.forEach(function (k) {
          var f = t.FUNCIONES[k];
          var l = chico(document.createElement('label'),
            'display:flex;gap:7px;align-items:center;font-size:12.5px;margin:0 0 4px;cursor:pointer');
          var i = document.createElement('input');
          i.type = 'checkbox';
          i.checked = c.extras.indexOf(k) > -1;
          i.onchange = function () {
            var d2 = borrador(); if (!d2) return;
            var cc = cfg(d2);
            var pos = cc.extras.indexOf(k);
            if (this.checked && pos === -1) cc.extras.push(k);
            if (!this.checked && pos > -1) cc.extras.splice(pos, 1);
            pintar(); refrescar();
          };
          var txt = document.createElement('span');
          txt.textContent = f ? f.nombre : k;
          l.appendChild(i); l.appendChild(txt);
          listaExtras.appendChild(l);
        });
      }

      /* ⚠️ lo que está PRENDIDO y no compró */
      var regalado = t.leFalta(c.plan, c.extras).filter(function (k) {
        return estaPrendida(dd, k);
      });
      if (regalado.length) {
        aviso.style.display = 'block';
        aviso.innerHTML = '<b>Ojo: esta invitación tiene prendido algo que no compró.</b><br>' +
          regalado.map(function (k) {
            return t.FUNCIONES[k] ? t.FUNCIONES[k].nombre : k;
          }).join(' · ') +
          '<br><span style="opacity:.8">O se lo cobrás como extra y lo marcás acá arriba, ' +
          'o lo apagás en su bloque. No lo apago solo por las dudas de que ya se lo hayas mostrado.</span>';
      } else {
        aviso.style.display = 'none';
      }
    }

    sel.onchange = function () {
      var d2 = borrador(); if (!d2) return;
      cfg(d2).plan = sel.value;
      pintar(); refrescar();
    };

    pintar();

    /* se re-sincroniza en vivo: el evento llega DESPUÉS de armarse esto */
    caja.__sync = function () {
      var dd = borrador(); if (!dd) return;
      if (document.activeElement && caja.contains(document.activeElement)) return;
      var c = cfg(dd);
      if (sel.value !== c.plan) sel.value = c.plan;
      pintar();
    };

    return caja;
  }

  /* ---- engancharse al panel -------------------------------------------------
     ⚠️ La señal de que estamos en la pestaña EFECTOS está en el HTML, no en la
     prosa: los encabezados de efectosHtml() llevan la clase «efx». Atarse al
     texto del título ya nos rompió una vez, cuando los emojis del panel se
     cambiaron por dibujos. */
  function enEfectos() {
    return !!document.querySelector('.mejoras .h.efx');
  }

  function revisar() {
    var d = borrador();
    if (!d || !enEfectos()) return;

    var ya = document.getElementById(ID);
    if (ya) { if (ya.__sync) ya.__sync(); return; }

    /* ⚠️⚠️ VA ÚLTIMO, Y NO ES UNA PREFERENCIA: ES UN CHOQUE MEDIDO.

       La primera versión lo metía PRIMERO, porque el paquete es lo que decide
       qué corresponde en el resto. Resultado: como este bloque también lleva
       la clase «mejoras», pasó a ser el que devuelve
       `document.querySelector('.mejoras')` — y TODOS los demás módulos del
       panel, que se cuelgan justo de ahí, empezaron a dibujarse ADENTRO de
       este bloque. La colección, los colores, el fondo: todo apilado adentro
       del cartelito del paquete.

       No dio ningún error. Sólo se veía raro.

       Regla: un bloque nuevo con la clase «mejoras» NUNCA se inserta antes de
       los que ya existen. Si algún día tiene que verse arriba, se resuelve con
       CSS (`order`), no cambiando el orden del HTML. */
    var todas = document.querySelectorAll('.mejoras');
    if (!todas.length) return;
    var ultima = todas[todas.length - 1];
    if (!ultima.parentNode) return;
    ultima.parentNode.insertBefore(construir(d), ultima.nextSibling);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
