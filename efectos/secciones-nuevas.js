/* ===== LO COMÚN DE LAS SECCIONES NUEVAS: MENÚ, AVISOS Y PATROCINADORES ========

   19/10/2026 — para las muestras de eventos nuevos (graduación, gala,
   cumpleaños de adultos, corporativo). Tres secciones que el motor no tiene:
     · fx.menu            → /efectos/menu.js            (+ panel-menu.js)
     · fx.avisos          → /efectos/avisos.js          (+ panel-avisos.js)
     · fx.patrocinadores  → /efectos/patrocinadores.js  (+ panel-patrocinadores.js)

   Este archivo NO dibuja nada: publica `window.INVSN`, las herramientas que
   usan las tres (en la invitación y en el panel). Va ANTES que ellas.

   ★ CÓMO SE VISTEN
     Usan lo mismo que las secciones del motor: <section class="sec"> con
     `.kick` y `h2`. Así cada colección las viste sola (letras, papel, tinta).
     Las tarjetas toman `--lino2` y la tinta de la sección: CERO colores
     clavados (el chequeo de muestra mide contraste y familia de color).

   ★ DÓNDE VAN
     · Si `secOrden` (el «Orden de las secciones» del panel) las nombra, van
       ahí. El motor reordena UNA vez al cargar y estas secciones nacen
       después, así que se ubican solas mirando `secOrden`.
     · Si no las nombra: menú y avisos DESPUÉS del itinerario, patrocinadores
       después de los contactos (antes del cierre).
     · El panel las suma a su lista de «Orden de las secciones» (SECALL).

   ★ APAGADA = FUERA DEL DOM. Si se apaga o queda sin contenido, la sección se
     BORRA (no se esconde): ningún chequeo puede contar una sección muerta.
   ============================================================================ */
(function () {
  'use strict';
  if (window.INVSN) return;

  function ev() { return window.INVEV || null; }
  function on(v) { return v === true || /^(true|si|sí|1)$/i.test(String(v)); }
  function txt(v, max) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max || 300); }

  /* ---------------- la sección en la invitación ---------------- */
  function frame() { return document.querySelector('.frame'); }
  function secDe(k) {
    var f = frame(); if (!f) return null;
    return f.querySelector(':scope > [data-sec="' + k + '"]');
  }

  /* deja `sec` donde corresponde; porDefecto() → {despues:nodo} | {antes:nodo} */
  function colocar(sec, key, porDefecto) {
    var f = frame(); if (!f || !sec) return;
    var e = ev() || {};
    var orden = Object.prototype.toString.call(e.secOrden) === '[object Array]' ? e.secOrden : [];
    var i = orden.indexOf(key), lugar = null;
    if (i >= 0) {
      for (var a = i + 1; a < orden.length && !lugar; a++) {
        var s = secDe(orden[a]); if (s && s !== sec) lugar = { antes: s };
      }
      for (var b = i - 1; b >= 0 && !lugar; b--) {
        var s2 = secDe(orden[b]); if (s2 && s2 !== sec) lugar = { despues: s2 };
      }
    }
    if (!lugar) lugar = porDefecto() || {};
    if (lugar.antes && lugar.antes.parentNode) {
      if (sec.nextElementSibling !== lugar.antes || sec.parentNode !== lugar.antes.parentNode)
        lugar.antes.parentNode.insertBefore(sec, lugar.antes);
    } else if (lugar.despues && lugar.despues.parentNode) {
      if (sec.previousElementSibling !== lugar.despues || sec.parentNode !== lugar.despues.parentNode)
        lugar.despues.parentNode.insertBefore(sec, lugar.despues.nextSibling);
    } else if (sec.parentNode !== f) {
      var pie = f.querySelector(':scope > .footer');
      f.insertBefore(sec, pie || null);
    }
  }

  /* arma (o reusa) la sección con su kick y su título */
  function seccion(key, kick, titulo) {
    var id = 'sn-' + key;
    var sec = document.getElementById(id);
    if (!sec) {
      sec = document.createElement('section');
      sec.id = id;
      sec.className = 'sec sn-sec';
      sec.setAttribute('data-sec', key);
      sec.innerHTML = '<div class="kick"></div><h2></h2><div class="sn-cuerpo"></div>';
    }
    var k = sec.querySelector('.kick'), h = sec.querySelector('h2');
    if (k.textContent !== kick) k.textContent = kick;
    k.style.display = kick ? '' : 'none';
    if (h.textContent !== titulo) h.textContent = titulo;
    return sec;
  }
  function quitar(key) {
    var s = document.getElementById('sn-' + key);
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }
  /* sólo reescribe el cuerpo si cambió: no hace parpadear las imágenes */
  function cuerpo(sec, html) {
    var c = sec.querySelector('.sn-cuerpo');
    if (c.getAttribute('data-h') !== html) { c.innerHTML = html; c.setAttribute('data-h', html); }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function url(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^(javascript|data|vbscript):/i.test(u)) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
    return u;
  }

  function css() {
    if (document.getElementById('sn-css')) return;
    var st = document.createElement('style');
    st.id = 'sn-css';
    st.textContent = [
      /* la tarjeta: el papel de la invitación y la tinta de la sección */
      '.sn-sec .sn-card{background-color:var(--lino2,transparent);color:inherit;',
      '  border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:16px;',
      '  box-shadow:0 10px 26px color-mix(in srgb,currentColor 9%,transparent)}',
      '.sn-sec .sn-frase{max-width:380px;margin:6px auto 18px;line-height:1.55}',
      /* menú */
      '.sn-sec .sn-menu{max-width:380px;margin:10px auto 0;padding:26px 22px}',
      '.sn-sec .sn-t{padding:0 0 4px}',
      '.sn-sec .sn-t + .sn-t{margin-top:16px;padding-top:16px;border-top:1px solid color-mix(in srgb,currentColor 14%,transparent)}',
      '.sn-sec .sn-tn{font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;line-height:1.4}',
      '.sn-sec .sn-td{margin-top:5px;font-size:15px;line-height:1.5;opacity:.82;font-style:italic}',
      /* avisos */
      '.sn-sec .sn-avisos{display:grid;gap:10px;max-width:380px;margin:10px auto 0;text-align:left}',
      '.sn-sec .sn-a{display:flex;gap:14px;align-items:center;padding:13px 16px}',
      '.sn-sec .sn-a svg{flex:0 0 30px;width:30px;height:30px;color:var(--sage,currentColor)}',
      '.sn-sec .sn-a span{font-size:15px;line-height:1.45}',
      /* patrocinadores */
      '.sn-sec .sn-logos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:400px;margin:10px auto 0}',
      '@media (min-width:380px){.sn-sec .sn-logos{grid-template-columns:repeat(3,minmax(0,1fr))}}',
      '.sn-sec .sn-l{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;',
      '  min-height:96px;padding:12px 10px;text-decoration:none;color:inherit}',
      '.sn-sec .sn-l img{max-width:100%;max-height:52px;object-fit:contain;display:block}',
      '.sn-sec .sn-l b{font-size:11.5px;font-weight:600;letter-spacing:.06em;line-height:1.3;opacity:.85}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------------- que se LEA, en cualquier colección ----------------
     Medido el 19/10 en una colección oscura (lupita-mis15): la tarjeta toma
     `--lino2` (oscuro) y el texto heredaba la tinta de la sección (oscura).
     No se clava ningún color: se elige, entre las variables de la paleta, la
     que mejor contrasta con el fondo REAL de la tarjeta. */
  function rgb(c) {
    var m = String(c || '').match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] };
  }
  function lum(c) {
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function fondoDe(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var c = rgb(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    return null;
  }
  var VARS = ['--verde', '--cream', '--lino', '--lino2', '--sage', '--verde2', '--sage-cl'];
  function colorDeVar(v, en) {
    var t = document.createElement('span');
    t.style.cssText = 'position:absolute;visibility:hidden;color:var(' + v + ')';
    en.appendChild(t);
    var c = getComputedStyle(t).color; en.removeChild(t);
    return rgb(c);
  }
  /* ★ 3/11/2026 (Jazmín): «en la sección de menú no se puede modificar el
     fondo, tipografías, tamaños, colores ni nada». fx.<clave>.estilo lo
     escribe el bloque «Diseño de la sección» del panel (estilo(), abajo).
     Va INLINE con !important: le gana a cualquier colección, y sólo pisa lo
     que Jazmín eligió (lo vacío queda como lo viste la colección). */
  var PRE = /^(great vibes|rouge script|dancing script|parisienne|tangerine|sacramento|cormorant garamond|playfair display|forum|marcellus|eb garamond|lora|cinzel|prata|montserrat|poppins|jost|serif|sans-serif|cursive)$/i;
  var fuentesPedidas = {};
  function pedirFuente(v) {
    var fam = String(v || '').split(',')[0].replace(/["']/g, '').trim();
    if (!fam || PRE.test(fam) || fuentesPedidas[fam.toLowerCase()]) return;
    fuentesPedidas[fam.toLowerCase()] = 1;
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + '&display=swap';
    (document.head || document.documentElement).appendChild(l);
  }
  function poner(el, prop, val) {
    if (!el) return;
    if (val) { if (el.style.getPropertyValue(prop) !== val || el.style.getPropertyPriority(prop) !== 'important') el.style.setProperty(prop, val, 'important'); }
    else if (el.style.getPropertyPriority(prop) === 'important') el.style.removeProperty(prop);
  }
  function hexRgba(h, a) {
    var m = String(h || '').match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    return m ? 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')' : '';
  }
  function colorOk(c) { return /^#[0-9a-f]{6}$/i.test(String(c || '')) ? c : ''; }
  function aplicarEstilo(sec) {
    var e = ev() || {}, key = sec.getAttribute('data-sec');
    var es = (e.fx && e.fx[key] && e.fx[key].estilo) || {};
    var img = /^https:\/\//.test(String(es.imagen || '')) ? es.imagen : '';
    var bg = colorOk(es.fondo);
    poner(sec, 'background-color', bg);
    poner(sec, 'background-image', img ? 'url("' + img.replace(/"/g, '') + '")' : (bg ? 'none' : ''));
    poner(sec, 'background-size', img ? 'cover' : '');
    poner(sec, 'background-position', img ? 'center' : '');
    /* con fondo propio, los dibujos de la colección (::before/::after) no lo tapan */
    var idc = 'sn-est-' + key, st = document.getElementById(idc);
    var regla = (bg || img) ? '#' + sec.id + '::before,#' + sec.id + '::after{background:none!important;background-image:none!important;opacity:0!important}' : '';
    if (regla && !st) { st = document.createElement('style'); st.id = idc; (document.head || document.documentElement).appendChild(st); }
    if (st && st.textContent !== regla) st.textContent = regla;
    if (es.fuente) pedirFuente(es.fuente);
    var h = sec.querySelector('h2'), k = sec.querySelector('.kick');
    poner(h, 'font-family', es.fuente || '');
    poner(h, 'font-size', es.tamTitulo ? es.tamTitulo + 'px' : '');
    poner(h, 'color', colorOk(es.colorTitulo));
    poner(k, 'color', colorOk(es.colorSub));
    var tx = colorOk(es.colorTexto), tam = es.tamTexto ? es.tamTexto + 'px' : '';
    [].forEach.call(sec.querySelectorAll('.sn-frase, .sn-tn, .sn-td, .sn-a span, .sn-l b'), function (el) {
      poner(el, 'color', tx);
      /* el nombre del tiempo va un poco más chico que la descripción, como viene */
      poner(el, 'font-size', tam ? (el.className === 'sn-tn' ? Math.round(es.tamTexto * 0.87) + 'px' : tam) : '');
    });
    var tar = colorOk(es.tarjeta);
    var al = (typeof es.tarjetaOpaca === 'number') ? es.tarjetaOpaca : 1;
    [].forEach.call(sec.querySelectorAll('.sn-card'), function (c) {
      poner(c, 'background-color', tar ? hexRgba(tar, al) : '');
      if (tx) poner(c, 'color', tx);
    });
    return !!tx;
  }

  function legible(sec) {
    if (aplicarEstilo(sec)) return;   /* Jazmín eligió el color del texto: manda ella */
    [].forEach.call(sec.querySelectorAll('.sn-card'), function (card) {
      var bg = fondoDe(card); if (!bg) return;
      card.style.color = '';
      var ahora = rgb(getComputedStyle(card).color);
      if (ahora && contraste(ahora, bg) >= 4.5) return;
      var mejor = null, cm = 0;
      VARS.forEach(function (v) {
        var c = colorDeVar(v, card); if (!c) return;
        var k = contraste(c, bg); if (k > cm) { cm = k; mejor = v; }
      });
      if (mejor && cm > (ahora ? contraste(ahora, bg) : 0)) card.style.color = 'var(' + mejor + ')';
    });
    /* la frase, con la tinta del título de la sección */
    var h = sec.querySelector('h2'), fr = sec.querySelector('.sn-frase');
    if (h && fr && fr.style.getPropertyPriority('color') !== 'important') {
      var ch = rgb(getComputedStyle(h).color);
      if (ch && ch.a > 0.5 && fr.style.color !== getComputedStyle(h).color) fr.style.color = getComputedStyle(h).color;
    }
  }

  /* corre `fn` ahora, al llegar datos nuevos del panel, y un rato más
     (el motor pinta el evento después de que cargan los módulos) */
  function repetir(fn) {
    function arrancar() {
      if (!document.body) { setTimeout(arrancar, 60); return; }
      try { fn(); } catch (e) {}
      addEventListener('message', function () { setTimeout(function () { try { fn(); } catch (e) {} }, 140); });
      var n = 0, t = setInterval(function () {
        try { fn(); } catch (e) {}
        if (++n > 40) { clearInterval(t); setInterval(function () { try { fn(); } catch (e) {} }, 2000); }
      }, 450);
    }
    arrancar();
  }

  /* ======================= EN EL PANEL ======================= */
  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function datos(d, key) {
    if (!d.fx) d.fx = {};
    if (!d.fx[key] || typeof d.fx[key] !== 'object') d.fx[key] = {};
    return d.fx[key];
  }
  function rotulo(k, def) {
    var R = window.INV_ROTULOS_FX || {};
    return R[k] || def;
  }

  /* la «casa» del bloque: pestaña y lugar (ver CASA_DE_MODULO en admin/3-evento.js).
     Las tablas son `const` de un script clásico: se leen por nombre, no por window. */
  function anotarCasa(id, tab, casa, lugar, ve) {
    try {
      if (typeof CASA_DE_MODULO === 'object' && !CASA_DE_MODULO[id]) CASA_DE_MODULO[id] = [tab, casa];
      if (lugar && typeof LUGAR_DE_CASA === 'object' && !LUGAR_DE_CASA[casa]) LUGAR_DE_CASA[casa] = lugar;
      if (ve && typeof VE_DE_CAJA === 'object' && !VE_DE_CAJA[id]) VE_DE_CAJA[id] = ve;
    } catch (e) {}
  }
  function casa(id) {
    return window.invCasa ? window.invCasa(id) : document.querySelector('.mejoras');
  }

  /* la sección, en la lista de «Orden de las secciones» del panel */
  function anotarOrden(key, label, despuesDe) {
    try {
      if (typeof SECALL === 'object' && SECALL.indexOf(key) < 0) SECALL.push(key);
      if (typeof SECLABELS === 'object' && !SECLABELS[key]) SECLABELS[key] = label;
    } catch (e) {}
    /* al abrir la lista, si la invitación ya tiene un orden guardado y esta
       sección no está, se mete en su lugar lógico (si no, el panel la tiraba
       al final y la sección saltaba de lugar apenas Jazmín abría la lista) */
    var V = window.verOrden;
    if (typeof V !== 'function' || V.__sn) return;
    var envuelta = function () {
      var d = borrador();
      if (d && Object.prototype.toString.call(d.secOrden) === '[object Array]') {
        (window.__snOrden || []).forEach(function (x) {
          if (d.secOrden.indexOf(x[0]) >= 0) return;
          var j = -1;
          for (var q = 0; q < x[1].length && j < 0; q++) j = d.secOrden.indexOf(x[1][q]);
          if (j < 0) d.secOrden.push(x[0]); else d.secOrden.splice(j + 1, 0, x[0]);
        });
      }
      return V.apply(this, arguments);
    };
    envuelta.__sn = true;
    window.verOrden = envuelta;
  }
  function registrarOrden(key, label, despuesDe) {
    window.__snOrden = window.__snOrden || [];
    if (!window.__snOrden.some(function (x) { return x[0] === key; })) window.__snOrden.push([key, despuesDe || []]);
    anotarOrden(key, label, despuesDe);
  }

  /* ---- piezas de formulario del panel (mismo estilo que panel-rsvp.js) ---- */
  function titulo(caja, t, ayuda) {
    var a = document.createElement('div');
    a.textContent = t; a.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(a);
    if (ayuda) {
      var b = document.createElement('div');
      b.textContent = ayuda; b.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
      caja.appendChild(b);
    }
  }
  function etiqueta(t) {
    var l = document.createElement('label');
    l.textContent = t; l.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:8px 0 3px';
    return l;
  }
  /* casilla de prender/apagar */
  function interruptor(caja, t, leer, escribir) {
    var f = document.createElement('label');
    f.style.cssText = 'display:flex;gap:8px;align-items:center;font-size:12px;font-weight:600;margin:4px 0 6px;cursor:pointer';
    var c = document.createElement('input'); c.type = 'checkbox';
    var s = document.createElement('span'); s.textContent = t;
    f.appendChild(c); f.appendChild(s); caja.appendChild(f);
    c.onchange = function () { escribir(c.checked); refrescar(); };
    return function sync() { var v = !!leer(); if (c.checked !== v) c.checked = v; };
  }
  /* campo de texto de una línea (o área) */
  function texto(caja, t, ph, leer, escribir, area, max) {
    caja.appendChild(etiqueta(t));
    var i = document.createElement(area ? 'textarea' : 'input');
    if (!area) i.type = 'text'; else i.rows = 2;
    i.placeholder = ph || ''; i.maxLength = max || 200;
    i.style.cssText = 'width:100%;box-sizing:border-box';
    i.oninput = function () { escribir(i.value); refrescar(); };
    caja.appendChild(i);
    return function sync() { var v = String(leer() || ''); if (document.activeElement !== i && i.value !== v) i.value = v; };
  }

  /* lista editable: filas con campos, «+ agregar», subir/bajar y quitar.
     campos = [{k, ph, tipo:'texto'|'select'|'img', ops:[[v,t]], ancho}] */
  function lista(caja, t, max, campos, leer, escribir, nuevo) {
    caja.appendChild(etiqueta(t));
    var cont = document.createElement('div'); caja.appendChild(cont);
    var add = document.createElement('button');
    add.type = 'button'; add.className = 'addbtn';
    add.style.cssText = 'margin-top:6px';
    caja.appendChild(add);
    var firma = null;
    function filas() { var a = leer(); return Object.prototype.toString.call(a) === '[object Array]' ? a : []; }
    function guardar(a) { escribir(a); refrescar(); }
    function pintar() {
      var a = filas();
      firma = JSON.stringify(a);
      cont.innerHTML = '';
      a.forEach(function (fila, i) {
        var r = document.createElement('div');
        r.style.cssText = 'display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap;margin:0 0 7px;padding:7px;border:1px solid rgba(0,0,0,.09);border-radius:9px';
        campos.forEach(function (c) {
          var w;
          if (c.tipo === 'select') {
            w = document.createElement('select');
            c.ops.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; w.appendChild(op); });
            w.value = String(fila[c.k] || c.ops[0][0]);
            w.onchange = function () { var b = filas(); if (b[i]) { b[i][c.k] = w.value; guardar(b); firma = JSON.stringify(b); } };
          } else if (c.tipo === 'img') {
            w = document.createElement('div');
            w.style.cssText = 'display:flex;gap:6px;align-items:center';
            var im = document.createElement('img');
            im.style.cssText = 'height:34px;max-width:70px;object-fit:contain;border-radius:4px;background:rgba(0,0,0,.04)';
            if (fila[c.k]) im.src = fila[c.k]; else im.style.display = 'none';
            var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
            var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'addbtn';
            bt.style.cssText = 'padding:5px 10px;font-size:11.5px';
            bt.textContent = fila[c.k] ? 'Cambiar logo' : 'Subir logo';
            bt.onclick = function () { fi.click(); };
            fi.onchange = function () {
              var f = fi.files && fi.files[0]; if (!f || !window.INV || !window.INV.uploadImage) return;
              bt.textContent = 'Subiendo…'; bt.disabled = true;
              window.INV.uploadImage(f).then(function (u) {
                var b = filas(); if (b[i]) { b[i][c.k] = u; guardar(b); }
                pintar();
              }, function () { bt.textContent = 'No se pudo subir'; bt.disabled = false; });
            };
            w.appendChild(im); w.appendChild(bt); w.appendChild(fi);
          } else {
            w = document.createElement('input'); w.type = 'text';
            w.placeholder = c.ph || ''; w.maxLength = c.max || 160;
            w.value = String(fila[c.k] || '');
            w.oninput = function () { var b = filas(); if (b[i]) { b[i][c.k] = w.value; guardar(b); firma = JSON.stringify(b); } };
          }
          w.style.flex = c.ancho || '1 1 140px';
          w.style.minWidth = '0';
          r.appendChild(w);
        });
        var ctl = document.createElement('div');
        ctl.style.cssText = 'display:flex;gap:4px;flex:0 0 auto';
        [['↑', -1], ['↓', 1]].forEach(function (m) {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = m[0];
          b.title = m[1] < 0 ? 'Subir' : 'Bajar';
          b.style.cssText = 'border:1px solid rgba(0,0,0,.15);background:none;border-radius:6px;cursor:pointer;padding:2px 7px';
          b.onclick = function () {
            var x = filas(), j = i + m[1]; if (j < 0 || j >= x.length) return;
            var tmp = x[i]; x[i] = x[j]; x[j] = tmp; guardar(x); pintar();
          };
          ctl.appendChild(b);
        });
        var q = document.createElement('button'); q.type = 'button'; q.textContent = 'Quitar';
        q.style.cssText = 'border:0;background:none;color:#a3324a;cursor:pointer;font-size:11.5px';
        q.onclick = function () { var x = filas(); x.splice(i, 1); guardar(x); pintar(); };
        ctl.appendChild(q);
        r.appendChild(ctl);
        cont.appendChild(r);
      });
      add.textContent = '+ Agregar (' + a.length + ' de ' + max + ')';
      add.disabled = a.length >= max;
      add.style.opacity = a.length >= max ? '.45' : '';
    }
    add.onclick = function () {
      var a = filas(); if (a.length >= max) return;
      a.push(nuevo()); guardar(a); pintar();
    };
    pintar();
    /* si cambió la invitación abierta (otra en el panel), se repinta */
    return function sync() {
      if (cont.contains(document.activeElement)) return;
      if (JSON.stringify(filas()) !== firma) pintar();
    };
  }

  /* ★ 3/11/2026 — «Diseño de la sección»: fondo, letra, tamaños y colores.
     Escribe fx.<key>.estilo; lo pinta aplicarEstilo() (arriba). Va plegado
     para no tapar los datos. Cada control tiene «Como viene» (vacío = lo que
     pone la colección). */
  /* ★ 4/11: opts (opcional) = { obj: fn → el objeto donde se guarda,
     campos: [['color',rótulo,clave] | ['rango',rótulo,clave,min,max,unidad] |
     ['fuente',rótulo,clave] | ['imagen',rótulo,clave] | ['casilla',rótulo,clave]],
     titulo: texto del desplegable }. Sin opts, lo de siempre (menú, avisos…). */
  function estilo(caja, key, opts) {
    opts = opts || {};
    var det = document.createElement('details');
    det.style.cssText = 'margin:12px 0 4px;border:1px solid rgba(0,0,0,.10);border-radius:10px;padding:8px 10px';
    var sm = document.createElement('summary');
    sm.textContent = opts.titulo || 'Diseño de la sección (fondo, letra, tamaños y colores)';
    sm.style.cssText = 'cursor:pointer;font-size:12.5px;font-weight:700';
    det.appendChild(sm); caja.appendChild(det);
    function es() { var d = borrador(); if (!d) return {}; if (opts.obj) return opts.obj(d); var x = datos(d, key); if (!x.estilo || typeof x.estilo !== 'object') x.estilo = {}; return x.estilo; }
    var syncs = [];
    function fila(t) {
      var f = document.createElement('div');
      f.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:7px 0';
      var l = document.createElement('span'); l.textContent = t; l.style.cssText = 'font-size:12px;font-weight:600;flex:1 1 150px';
      f.appendChild(l); det.appendChild(f); return f;
    }
    function boton(t) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.style.cssText = 'border:1px solid rgba(0,0,0,.15);background:none;border-radius:6px;cursor:pointer;padding:3px 8px;font-size:11.5px';
      return b;
    }
    function color(t, k) {
      var f = fila(t);
      var i = document.createElement('input'); i.type = 'color'; i.style.cssText = 'width:46px;height:28px;padding:0;border:1px solid #ddd;border-radius:6px';
      var est = document.createElement('span'); est.style.cssText = 'font-size:11px;opacity:.6';
      var b = boton('Como viene');
      i.oninput = function () { es()[k] = i.value; est.textContent = ''; refrescar(); };
      b.onclick = function () { es()[k] = ''; est.textContent = 'como viene'; refrescar(); };
      f.appendChild(i); f.appendChild(est); f.appendChild(b);
      syncs.push(function () { var v = es()[k]; if (/^#[0-9a-f]{6}$/i.test(v || '')) { if (document.activeElement !== i) i.value = v; est.textContent = ''; } else est.textContent = 'como viene'; });
    }
    function rango(t, k, min, max, unidad) {
      var f = fila(t);
      var i = document.createElement('input'); i.type = 'range'; i.min = min; i.max = max; i.step = 1; i.style.cssText = 'flex:1 1 120px';
      var n = document.createElement('span'); n.style.cssText = 'font-size:11.5px;font-weight:700;min-width:62px';
      var b = boton('Como viene');
      i.oninput = function () { es()[k] = unidad === '%' ? parseInt(i.value, 10) / 100 : parseInt(i.value, 10); n.textContent = i.value + unidad; refrescar(); };
      b.onclick = function () { es()[k] = ''; n.textContent = 'como viene'; refrescar(); };
      f.appendChild(i); f.appendChild(n); f.appendChild(b);
      syncs.push(function () {
        var v = es()[k];
        if (typeof v === 'number') { var x = unidad === '%' ? Math.round(v * 100) : v; if (document.activeElement !== i) i.value = x; n.textContent = x + unidad; }
        else n.textContent = 'como viene';
      });
    }
    function fuente(t, k) {
      var f = fila(t);
      var s = document.createElement('select'); s.style.cssText = 'flex:1 1 160px;max-width:230px';
      var lista = [];
      try { if (typeof FONTS === 'object' && FONTS.length) lista = FONTS; } catch (e) {}
      s.innerHTML = '<option value="">Como viene</option>' + lista.map(function (o) {
        return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>';
      }).join('');
      s.onchange = function () { es()[k] = s.value || ''; refrescar(); };
      f.appendChild(s);
      syncs.push(function () { var v = es()[k] || ''; if (document.activeElement !== s && s.value !== v) s.value = v; });
    }
    function imagen(t, k) {
      var f = fila(t);
      var im = document.createElement('img'); im.style.cssText = 'height:34px;max-width:60px;object-fit:cover;border-radius:4px;display:none';
      var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
      var b = boton('Subir imagen'), q = boton('Quitar');
      b.onclick = function () { fi.click(); };
      q.onclick = function () { es()[k] = ''; refrescar(); sync(); };
      fi.onchange = function () {
        var x = fi.files && fi.files[0]; if (!x || !window.INV || !window.INV.uploadImage) return;
        b.textContent = 'Subiendo…'; b.disabled = true;
        window.INV.uploadImage(x).then(function (u) { es()[k] = u; b.disabled = false; refrescar(); sync(); },
          function () { b.textContent = 'No se pudo subir'; b.disabled = false; });
      };
      function sync() { var v = es()[k]; im.style.display = v ? '' : 'none'; if (v && im.src !== v) im.src = v; b.textContent = v ? 'Cambiar imagen' : 'Subir imagen'; q.style.display = v ? '' : 'none'; }
      f.appendChild(im); f.appendChild(b); f.appendChild(q); f.appendChild(fi);
      syncs.push(sync);
    }
    function casilla(t, k) {
      var f = fila(t);
      var i = document.createElement('input'); i.type = 'checkbox';
      i.onchange = function () { es()[k] = !!i.checked; refrescar(); };
      f.insertBefore(i, f.firstChild);
      syncs.push(function () { i.checked = es()[k] === true; });
    }
    if (opts.campos) {
      var TIPOS = { color: color, rango: rango, fuente: fuente, imagen: imagen, casilla: casilla };
      opts.campos.forEach(function (c) { var fn = TIPOS[c[0]]; if (fn) fn.apply(null, c.slice(1)); });
      return function sync() { syncs.forEach(function (s) { try { s(); } catch (e) {} }); };
    }
    color('Color de fondo', 'fondo');
    imagen('Imagen de fondo', 'imagen');
    fuente('Tipografía del título', 'fuente');
    rango('Tamaño del título', 'tamTitulo', 16, 64, 'px');
    color('Color del título', 'colorTitulo');
    color('Color del subtítulo (arriba del título)', 'colorSub');
    color('Color del texto', 'colorTexto');
    rango('Tamaño del texto', 'tamTexto', 11, 24, 'px');
    color('Color de la tarjeta', 'tarjeta');
    rango('Transparencia de la tarjeta', 'tarjetaOpaca', 0, 100, '%');
    return function sync() { syncs.forEach(function (s) { try { s(); } catch (e) {} }); };
  }

  /* monta el bloque en su casa y lo mantiene sincronizado */
  function bloque(id, construir) {
    var syncs = null;
    function revisar() {
      var d = borrador(); if (!d) return;
      var ya = document.getElementById(id);
      if (ya) { (syncs || []).forEach(function (s) { try { s(); } catch (e) {} }); return; }
      var m = casa(id); if (!m) return;
      var caja = document.createElement('div');
      caja.id = id;
      caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';
      syncs = construir(caja) || [];
      m.appendChild(caja);
      syncs.forEach(function (s) { try { s(); } catch (e) {} });
    }
    var n = 0;
    var t = setInterval(function () {
      if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 700); revisar(); }
      if (++n > 60) clearInterval(t);
    }, 500);
  }

  window.INVSN = {
    ev: ev, on: on, txt: txt, esc: esc, url: url, css: css, legible: legible,
    seccion: seccion, quitar: quitar, cuerpo: cuerpo, colocar: colocar, secDe: secDe, repetir: repetir,
    /* panel */
    borrador: borrador, refrescar: refrescar, datos: datos, rotulo: rotulo,
    anotarCasa: anotarCasa, registrarOrden: registrarOrden, bloque: bloque,
    titulo: titulo, interruptor: interruptor, texto: texto, lista: lista, estilo: estilo
  };
})();
