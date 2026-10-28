/* ===== «ELIGE TU SAVE THE DATE» EN EL FORMULARIO (28/10/2026) ================
   Maki: «la gente tiene que elegir qué save the date le gusta… que en el
   formulario, si Jazmín se lo marcó, diga "elige tu save the date" y aparezcan
   todos los formatos que tenemos. Ellos eligen uno y ya viene precargado y
   elegido cuando llega la invitación».
   Y el orden: «primero los que vienen con la temática de la muestra que
   seleccionó y después los sin foto. Si no tiene temática, primero los sin
   foto y después con foto».

   CUÁNDO APARECE
   Sólo con link de venta (?f=<código>) cuyo paquete o extras traen
   `saveTheDate` (/paquetes.js). Lo avisa /crear.js con el evento `inv-paquete`.
   Sin eso, la tarjeta ni existe (crear.js borra los data-funcion que no van).

   QUÉ SE VE
   · Con un diseño de muestra elegido: primero «Los de tu diseño» (las
     variantes guardadas en esa muestra: fx.stdg.variantes), después «Más
     diseños sin foto».
   · Sin muestra (o personalizado): primero «Sin foto» (los 40 diseños) y
     después «Con foto».
   · Cada miniatura ya trae SUS nombres y SU fecha, y se redibuja si los cambia.
   · Si elige uno con foto, aparece «Sube tu foto» (si no la sube, Jazmín ve
     que falta).
   El cliente NO toca colores, letras ni lugares: eso queda para el panel.

   QUÉ SE MANDA
   window.CREAR_STD.leer() → {diseno, lay, marco, modoFoto, foto, foco, conFoto}
   /crear.js lo pone en la solicitud como `stdg`, /solicitud-a-evento.js lo
   pasa a `fx.stdg` (con elegidoPorCliente) y /vestir.js lo repone después de
   vestir con la muestra.
   ============================================================================ */
(function () {
  'use strict';
  if (window.CREAR_STD) return;

  var B = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var FOTO_BODA = B + 'w_1600,c_limit,f_jpg,q_auto:good/v1788580451/invitame/qobinxeosl8qe3fxu9s4.jpg';
  var FOTO_XV = B + 'w_1600,c_limit,f_jpg,q_auto:good/invitame/lupita/lp-ses-3.jpg';
  var LLAVE = 'inv_std_elegido';
  var M = null, elegido = null, fotoPropia = '', activo = false;
  try { var g = JSON.parse(localStorage.getItem(LLAVE) || 'null'); if (g) { elegido = g.elegido || null; fotoPropia = g.foto || ''; } } catch (e) {}
  function guardar() { try { localStorage.setItem(LLAVE, JSON.stringify({ elegido: elegido, foto: fotoPropia })); } catch (e) {} }

  function $(id) { return document.getElementById(id); }
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  function val(id) { var e = $(id); return e ? String(e.value || '').trim() : ''; }
  function tipo() { var t = val('tipo').toLowerCase(); return /xv|quince/.test(t) ? 'xv' : (/boda/.test(t) || !t ? 'boda' : t); }

  function motor() {
    if (window.INVSTDG) return Promise.resolve(window.INVSTDG);
    return new Promise(function (ok, no) {
      /* ★ 28/10: primero los fondos propios de cada muestra, después el motor */
      var t = document.createElement('script'); t.src = '/efectos/std-temas.js?v=20261028g';
      t.onload = t.onerror = function () {
        var s = document.createElement('script'); s.src = '/efectos/std-generico.js?v=20261028b';
        s.onload = function () { ok(window.INVSTDG); }; s.onerror = no; document.head.appendChild(s);
      };
      document.head.appendChild(t);
    });
  }

  /* los datos del formulario, con ejemplo mientras están vacíos */
  function evento() {
    var tp = tipo(), n1 = val('n1'), n2 = val('n2');
    if (!n1) { n1 = tp === 'xv' ? 'Tu nombre' : 'Nombre'; if (tp === 'boda') n2 = n2 || 'Nombre'; }
    var f = val('fecha'); if (!/^\d{4}-\d{2}-\d{2}/.test(f)) f = '2027-06-12';
    return { n1: n1, n2: n2, fecha: f, tipoEvento: val('tipo'), ev1dir: val('ev1d') || val('ev2d') };
  }
  function muestraSlug() {
    var id = (window.CREAR_DISENO && window.CREAR_DISENO.elegido && window.CREAR_DISENO.elegido()) ||
             (new URLSearchParams(location.search).get('tpl') || '');
    if (!id || id === 'personalizado' || !window.muestraDe) return '';
    var m = window.muestraDe(id); return (m && m.muestra) || '';
  }
  function leerEvento(slug) {
    if (window.INV && typeof window.INV.getEvento === 'function') return window.INV.getEvento(slug).catch(function () { return null; });
    return fetch('https://firestore.googleapis.com/v1/projects/invitame-9b51f/databases/(default)/documents/inv_eventos/' + encodeURIComponent(slug))
      .then(function (r) { return r.json(); }).then(function () { return null; }).catch(function () { return null; });
  }

  /* ---- la lista, en el orden que pidió Maki ---- */
  var variantesMuestra = {}, slugActual = null;
  function opciones() {
    var tp = tipo(), foto = tp === 'xv' ? FOTO_XV : FOTO_BODA, forma = tp === 'xv' ? 'ovalo' : 'arco';
    var todos = M.DISENOS.map(function (d) { return d.id; });
    var grupos = [];
    var vs = slugActual && variantesMuestra[slugActual];
    if (vs && vs.length) {
      var propios = vs.map(function (v, i) {
        var c = JSON.parse(JSON.stringify(v.cfg || {}));
        var conFoto = !!c.foto;
        if (conFoto) { c.foto = fotoPropia || c.foto; if (!fotoPropia) c.ejemplo = true; }
        return { key: 'm' + i + ':' + (c.diseno || ''), nombre: v.nombre || ('Opción ' + (i + 1)), cfg: c, conFoto: conFoto };
      });
      var usados = propios.map(function (o) { return o.cfg.diseno; });
      grupos.push({ titulo: 'Los de tu diseño', items: propios });
      grupos.push({ titulo: 'Más diseños sin foto', items: todos.filter(function (id) { return usados.indexOf(id) < 0; }).map(function (id) {
        return { key: 's:' + id, cfg: { diseno: id }, conFoto: false }; }) });
    } else {
      grupos.push({ titulo: 'Sin foto', items: todos.map(function (id) { return { key: 's:' + id, cfg: { diseno: id }, conFoto: false }; }) });
      grupos.push({ titulo: 'Con foto', items: todos.map(function (id) {
        return { key: 'f:' + id, cfg: { diseno: id, modoFoto: forma, foto: fotoPropia || foto, ejemplo: !fotoPropia }, conFoto: true }; }) });
    }
    return grupos;
  }

  /* ---- miniaturas: un solo lienzo grande, de a una, y se achican ---- */
  var lienzo = document.createElement('canvas'), cola = [], trabajando = false, ronda = 0;
  function miniatura(item, img, r) {
    cola.push({ item: item, img: img, r: r }); if (!trabajando) siguiente();
  }
  function siguiente() {
    var t = cola.shift(); if (!t) { trabajando = false; return; }
    trabajando = true;
    if (t.r !== ronda) { siguiente(); return; }
    var op = JSON.parse(JSON.stringify(t.item.cfg)); delete op.ejemplo;
    op.textos = M.textosDe(evento()); op.mini = true;
    M.armar(lienzo, op).then(function () {
      var c = document.createElement('canvas'); c.width = 270; c.height = 480;
      c.getContext('2d').drawImage(lienzo, 0, 0, 270, 480);
      if (t.r === ronda) t.img.src = c.toDataURL('image/jpeg', 0.82);
      setTimeout(siguiente, 30);
    }, function () { setTimeout(siguiente, 30); });
  }

  var MOSTRAR = 10;
  function dibujar() {
    var caja = $('std-galeria'); if (!caja || !M) return;
    ronda++; cola = [];
    caja.innerHTML = '';
    opciones().forEach(function (g) {
      caja.appendChild(el('div', 'font-weight:800;color:var(--uva);font-size:14px;margin:14px 0 8px', g.titulo));
      var grid = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px');
      caja.appendChild(grid);
      var ponerDesde = function (desde) {
        g.items.slice(desde, desde + MOSTRAR).forEach(function (it) {
          var b = el('button', 'position:relative;border:2px solid ' + (elegido && elegido.key === it.key ? 'var(--uva)' : 'transparent') + ';border-radius:12px;padding:0;background:#f3ede8;cursor:pointer;overflow:hidden;aspect-ratio:9/16;box-shadow:0 3px 10px rgba(73,17,26,.10)');
          b.type = 'button';
          var img = el('img', 'width:100%;height:100%;object-fit:cover;display:block'); img.alt = 'Save the date';
          b.appendChild(img);
          if (it.conFoto) b.appendChild(el('span', 'position:absolute;left:6px;bottom:6px;background:rgba(255,255,255,.9);color:var(--uva);font-size:10px;font-weight:800;border-radius:8px;padding:2px 6px', 'Con foto'));
          if (elegido && elegido.key === it.key) b.appendChild(el('span', 'position:absolute;right:6px;top:6px;background:var(--uva);color:#fff;font-size:11px;font-weight:800;border-radius:10px;padding:2px 7px', '✓ Elegido'));
          b.onclick = function () { elegir(it); };
          grid.appendChild(b);
          miniatura(it, img, ronda);
        });
        if (desde + MOSTRAR < g.items.length) {
          var mas = el('button', 'grid-column:1/-1;border:0;background:#f5e7e9;color:var(--uva);border-radius:20px;padding:9px;font-weight:800;cursor:pointer;font-family:inherit', 'Ver más diseños (' + (g.items.length - desde - MOSTRAR) + ')');
          mas.type = 'button';
          mas.onclick = function () { mas.remove(); ponerDesde(desde + MOSTRAR); };
          grid.appendChild(mas);
        }
      };
      ponerDesde(0);
    });
    dibujarFoto();
  }
  function elegir(it) {
    var c = JSON.parse(JSON.stringify(it.cfg)); delete c.ejemplo;
    if (it.conFoto) { c.conFoto = true; if (!fotoPropia) delete c.foto; else c.foto = fotoPropia; }
    elegido = { key: it.key, cfg: c, conFoto: it.conFoto };
    guardar(); dibujar();
  }

  /* ---- la foto, sólo si eligió uno con foto ---- */
  function dibujarFoto() {
    var caja = $('std-galeria'); if (!caja) return;
    var v = el('div', 'margin-top:14px'); caja.appendChild(v);
    if (!elegido) { v.appendChild(el('div', 'font-size:13px;color:var(--muted)', 'Todavía no elegiste ninguno.')); return; }
    if (!elegido.conFoto) { v.appendChild(el('div', 'font-size:13px;color:var(--ink)', '✓ Listo, ya elegiste tu Save the Date.')); return; }
    v.appendChild(el('div', 'font-size:13px;color:var(--ink);margin-bottom:6px', fotoPropia ? '✓ Ya subiste tu foto. Si quieres, cámbiala:' : 'Elegiste uno con foto: sube la foto que quieres que aparezca.'));
    var lab = el('label', ''); lab.className = 'up'; lab.textContent = fotoPropia ? 'Cambiar la foto' : 'Sube tu foto';
    lab.style.display = 'block';
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    lab.appendChild(inp); v.appendChild(lab);
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      if (!window.INV || !window.INV.uploadImage) { lab.textContent = 'Espera un segundo y vuelve a intentar'; return; }
      lab.textContent = 'Subiendo…';
      comprimir(f, 1600, 0.86).then(function (x) { return window.INV.uploadImage(x); }).then(function (url) {
        fotoPropia = url; if (elegido && elegido.conFoto) elegido.cfg.foto = url; guardar(); dibujar();
      }, function () { lab.textContent = 'No se pudo subir. Prueba otra vez.'; });
    };
  }
  function comprimir(f, maxW, q) {
    return new Promise(function (ok) {
      var im = new Image(), u = URL.createObjectURL(f);
      im.onload = function () {
        var r = Math.min(1, maxW / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(u); ok(b ? new File([b], 'std.jpg', { type: 'image/jpeg' }) : f); }, 'image/jpeg', q);
      };
      im.onerror = function () { ok(f); }; im.src = u;
    });
  }

  /* ---- se prende cuando el link lo trae ---- */
  function prender() {
    var I = window.__INVFORM, P = window.INVPAQUETES;
    if (activo || !I || !P || !P.tiene(I.plan, 'saveTheDate', I.extras || [])) return;
    var card = $('card-std'); if (!card) return;
    activo = true; card.style.display = '';
    motor().then(function (m) { M = m; revisar(true); });
  }
  window.addEventListener('inv-paquete', prender);
  setTimeout(prender, 0);

  /* si cambia la muestra elegida, los nombres o la fecha, se redibuja */
  var firma = '';
  function revisar(forzar) {
    if (!activo || !M) return;
    var s = muestraSlug();
    if (s && !(s in variantesMuestra)) {
      variantesMuestra[s] = null;
      leerEvento(s).then(function (ev) {
        variantesMuestra[s] = (ev && ev.fx && ev.fx.stdg && Array.isArray(ev.fx.stdg.variantes)) ? ev.fx.stdg.variantes : [];
        revisar(true);
      });
    }
    var e = evento(), f = [s, variantesMuestra[s] ? variantesMuestra[s].length : 0, e.n1, e.n2, e.fecha, e.tipoEvento, e.ev1dir].join('|');
    if (!forzar && f === firma) return;
    firma = f; slugActual = s; dibujar();
  }
  var t = null;
  document.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { revisar(false); }, 1200); }, true);
  document.addEventListener('change', function () { clearTimeout(t); t = setTimeout(function () { revisar(false); }, 600); }, true);
  setInterval(function () { revisar(false); }, 2500);

  window.CREAR_STD = {
    leer: function () {
      if (!activo || !elegido) return null;
      var c = JSON.parse(JSON.stringify(elegido.cfg));
      if (elegido.conFoto) { c.conFoto = true; if (fotoPropia) c.foto = fotoPropia; else delete c.foto; }
      return c;
    },
    olvidar: function () { try { localStorage.removeItem(LLAVE); } catch (e) {} }
  };
})();
