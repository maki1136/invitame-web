/* ===== __invFormPaquete : EL PAQUETE Y EL LINK DEL FORMULARIO (15/10/2026) =====
   Maki y Jazmín: «cuando cerrás una venta, en el CRM marcás el paquete que
   compró, y en esa misma venta aparece un botón "Copiar link del formulario".
   El cliente ve sólo lo que compró y la invitación llega con el paquete
   marcado y lo que pagó ya prendido».

   QUÉ HACE
   En la ficha de un contacto, debajo de «La venta», agrega:
     · el paquete (Estándar / Premium / Platinum) y los extras vendidos aparte
     · el botón «Guardar y copiar link del formulario»
   Al tocarlo:
     1. guarda `paquete`, `extras` y `formToken` en crm_contactos/<id>
     2. escribe `inv_formularios/<formToken>` = { paquete, extras, clave, … }
     3. copia `https://invitameok.net/crear.html?f=<formToken>` al portapapeles

   ⚠️ EL CÓDIGO ES UNO POR VENTA y no cambia: si Jazmín corrige el paquete
      después de mandar el link, el mismo link pasa a mostrar el paquete nuevo.
   ⚠️ QUÉ TRAE CADA PAQUETE NO ESTÁ ACÁ: se lee de https://invitameok.net/paquetes.js
      (window.INVPAQUETES), el único lugar donde se decide.
   ⚠️ El formulario y /solicitud-crear.php leen `inv_formularios`. La regla de
      Firestore deja leerlo por código y escribirlo sólo al equipo.
   ⚠️ Código fuente en el repo: herramientas/crm/formulario-paquete.js. En el
      servidor va pegado inline antes de </body> en crm-equipo/index.html.
   ============================================================================ */
(function () {
  if (window.__invFormPaquete) return; window.__invFormPaquete = 1;

  var ID = 'ficha-paquete';
  var BASE_LINK = 'https://invitameok.net/crear.html?f=';
  var NOMBRES = { estandar: 'Estándar', premium: 'Premium', platinum: 'Platinum' };

  /* la tabla de paquetes, desde la plataforma */
  function cargarTabla(cb) {
    if (window.INVPAQUETES) return cb(window.INVPAQUETES);
    var s = document.createElement('script');
    s.src = 'https://invitameok.net/paquetes.js?t=' + Date.now();
    s.onload = function () { cb(window.INVPAQUETES || null); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  function token() {
    var abc = 'abcdefghijkmnpqrstuvwxyz23456789', b = new Uint8Array(20), out = '';
    crypto.getRandomValues(b);
    for (var i = 0; i < b.length; i++) out += abc[b[i] % abc.length];
    return out;
  }

  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }

  function armar(panel, id) {
    var caja = el('div', 'margin:14px 0 6px;padding:12px 13px;border:1px solid var(--linea);border-radius:12px;background:#fdf8f4');
    caja.id = ID;
    caja.dataset.id = id;
    caja.appendChild(el('div', 'font-weight:700;color:var(--uva);margin-bottom:6px', 'Paquete y link del formulario'));

    var lab = el('label', 'display:block;font-size:12px;margin:2px 0 3px', 'Paquete que compró');
    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%;padding:8px;border:1px solid var(--linea);border-radius:8px';
    [['', '— elegir —'], ['estandar', 'Estándar'], ['premium', 'Premium'], ['platinum', 'Platinum']].forEach(function (o) {
      var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op);
    });
    caja.appendChild(lab); caja.appendChild(sel);

    var exLab = el('div', 'font-size:12px;margin:10px 0 4px', 'Extras vendidos aparte (lo que no trae el paquete)');
    var exBox = el('div', 'display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12.5px');
    caja.appendChild(exLab); caja.appendChild(exBox);

    var btn = el('button', 'margin-top:12px;width:100%;padding:10px;border:0;border-radius:10px;background:var(--uva);color:#fff;font-weight:700;cursor:pointer', 'Guardar y copiar link del formulario');
    btn.type = 'button';
    var info = el('div', 'font-size:12px;margin-top:8px;line-height:1.45;word-break:break-all');
    caja.appendChild(btn); caja.appendChild(info);

    var estado = { extras: [], formToken: '', datos: {} };

    function pintarExtras(T) {
      exBox.textContent = '';
      if (!T || !sel.value) { exLab.style.display = 'none'; return; }
      exLab.style.display = '';
      var trae = T.PAQUETES[sel.value].incluye;
      Object.keys(T.FUNCIONES).forEach(function (k) {
        if (trae.indexOf(k) > -1) return;
        var l = el('label', 'display:flex;gap:5px;align-items:center;cursor:pointer');
        var c = document.createElement('input'); c.type = 'checkbox'; c.value = k;
        c.checked = estado.extras.indexOf(k) > -1;
        c.onchange = function () {
          var i = estado.extras.indexOf(k);
          if (c.checked && i < 0) estado.extras.push(k);
          if (!c.checked && i > -1) estado.extras.splice(i, 1);
        };
        l.appendChild(c); l.appendChild(document.createTextNode(T.FUNCIONES[k].nombre));
        exBox.appendChild(l);
      });
    }

    function pintarInfo(extra) {
      var t = estado.formToken;
      info.innerHTML = '';
      if (t) {
        info.appendChild(el('div', '', 'Link: ' + BASE_LINK + t));
        if (estado.datos.slugCreado) info.appendChild(el('div', 'color:var(--ok);margin-top:3px', 'Ya completó el formulario → invitación «' + estado.datos.slugCreado + '».'));
      }
      if (extra) info.appendChild(el('div', 'margin-top:4px;font-weight:700', extra));
    }

    cargarTabla(function (T) {
      if (!T) { info.textContent = 'No se pudo leer la tabla de paquetes. Recargá la página.'; btn.disabled = true; return; }
      db.collection('crm_contactos').doc(id).get().then(function (d) {
        var x = d.exists ? d.data() : {};
        estado.datos = x;
        sel.value = NOMBRES[x.paquete] ? x.paquete : '';
        estado.extras = Array.isArray(x.extras) ? x.extras.slice() : [];
        estado.formToken = x.formToken || '';
        pintarExtras(T);
        if (estado.formToken) {
          db.collection('inv_formularios').doc(estado.formToken).get().then(function (f) {
            if (f.exists && f.data().slugCreado) estado.datos.slugCreado = f.data().slugCreado;
            pintarInfo();
          }).catch(function () { pintarInfo(); });
        }
      });
      sel.onchange = function () {
        /* los extras que ahora ya trae el paquete se sacan */
        if (sel.value) { var trae = T.PAQUETES[sel.value].incluye;
          estado.extras = estado.extras.filter(function (k) { return trae.indexOf(k) < 0; }); }
        pintarExtras(T);
      };
      btn.onclick = function () {
        if (!sel.value) { pintarInfo('Elegí primero el paquete.'); return; }
        btn.disabled = true; pintarInfo('Guardando…');
        var tk = estado.formToken || token();
        var x = estado.datos || {};
        var tipo = String(x.tipoEvento || '').toLowerCase();
        var form = {
          paquete: sel.value, extras: estado.extras.slice(),
          clave: String(x.clave || ''), tipoEvento: (tipo === 'boda' || tipo === 'xv') ? tipo : '',
          contactoId: id, nombre: String(x.nom || x.apodo || ''),
          actualizado: new Date(), por: (window.auth && auth.currentUser ? auth.currentUser.email : '')
        };
        db.collection('inv_formularios').doc(tk).set(form, { merge: true }).then(function () {
          return db.collection('crm_contactos').doc(id).set({ paquete: sel.value, extras: estado.extras.slice(), formToken: tk }, { merge: true });
        }).then(function () {
          estado.formToken = tk;
          var link = BASE_LINK + tk;
          var copiado = function (ok) { pintarInfo(ok ? '✓ Guardado y copiado. Pegalo en el WhatsApp del cliente.' : '✓ Guardado. Copiá el link de arriba.'); btn.disabled = false; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(function () { copiado(true); }, function () { copiado(false); });
          else copiado(false);
        }).catch(function (e) {
          btn.disabled = false;
          pintarInfo('No se pudo guardar: ' + (e && e.message || e));
        });
      };
    });

    /* va justo antes del mensaje y los botones de la ficha */
    var ancla = document.getElementById('fmsg');
    if (ancla && ancla.parentNode === panel) panel.insertBefore(caja, ancla);
    else panel.appendChild(caja);
  }

  function revisar() {
    var g = document.getElementById('fguardar');
    var id = window.__invFichaActualId;
    if (!g || !id || !window.db) return;
    var panel = g.parentNode && g.parentNode.parentNode;
    if (!panel) return;
    var ya = document.getElementById(ID);
    if (ya && ya.dataset.id === id && panel.contains(ya)) return;
    if (ya) ya.remove();
    armar(panel, id);
  }
  setInterval(revisar, 600);
})();
