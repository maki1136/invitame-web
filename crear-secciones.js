/* ===== MENÚ, AVISOS, PATROCINADORES Y PREGUNTAS EXTRA, EN EL FORMULARIO ========

   19/10/2026 — los campos del cliente para las secciones nuevas (las mismas
   que Jazmín arma en el panel con panel-menu.js, panel-avisos.js,
   panel-patrocinadores.js y panel-rsvp-preguntas.js).

   QUÉ PUBLICA: window.CREAR_SECCIONES
     · leer()      → { menu, avisos, patrocinadores, rsvpPreguntas } — cada uno
                     SÓLO si tiene algo (si no, undefined: crear.js lo saca)
     · borrador()  → lo que hay escrito, para el borrador automático de crear.js
     · poner(b)    → lo vuelve a pintar al recuperar el borrador

   CÓMO VIAJA
     crear.js → la solicitud (`menu`, `avisos`, `patrocinadores`, `rsvpPreguntas`)
     → /solicitud-a-evento.js las pasa a fx.menu / fx.avisos / fx.patrocinadores
       / fx.rsvp.preguntas → /vestir.js las repone después del vestido de la
       muestra (el `fx` de la muestra se copia entero y las pisaría).

   ⚠️ ES UN SCRIPT CLÁSICO y se carga ANTES de crear.js (que es módulo).
   ⚠️ Los textos los lee el cliente: español de México, de «tú».
   ============================================================================ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  var ICONOS = [['sin-ninos', 'Sin niños'], ['sin-valet', 'Sin valet parking'], ['hora-cierre', 'Hora de cierre'],
                ['trae-tu-bebida', 'Trae tu bebida'], ['uber', 'Pide tu Uber o taxi'], ['otro', 'Otro aviso']];

  var ESTADO = { tiempos: [], avisos: [], logos: [], preguntas: [] };

  function avisarCambio(el) {
    /* crear.js guarda el borrador y repinta la vista previa con cada «input» dentro de una .card */
    try { (el || $('cs-menu') || document.body).dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
  }

  function fila(cont) {
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:8px;padding:8px;border:1px solid #eadbd2;border-radius:10px';
    cont.appendChild(r);
    return r;
  }
  function quitar(r, arr, i, pintar) {
    var q = document.createElement('button');
    q.type = 'button'; q.textContent = 'Quitar';
    q.style.cssText = 'border:0;background:none;color:var(--uva);font-weight:700;cursor:pointer;font-size:12.5px';
    q.onclick = function () { arr.splice(i, 1); pintar(); avisarCambio(); };
    r.appendChild(q);
  }
  function input(r, val, ph, max, flex, onv) {
    var i = document.createElement('input');
    i.type = 'text'; i.value = val || ''; i.placeholder = ph; i.maxLength = max;
    i.style.cssText = 'flex:' + flex + ';min-width:0;margin:0';
    i.oninput = function () { onv(i.value); };
    r.appendChild(i);
    return i;
  }
  function boton(cont, txt, puede, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'addg'; b.textContent = txt;
    b.disabled = !puede; if (!puede) b.style.opacity = '.45';
    b.onclick = fn;
    cont.appendChild(b);
  }

  /* ---- menú ---- */
  function pintarMenu() {
    var c = $('cs-menu'); if (!c) return;
    c.innerHTML = '';
    ESTADO.tiempos.forEach(function (t, i) {
      var r = fila(c);
      input(r, t.nombre, 'Ej: Entrada', 80, '1 1 110px', function (v) { t.nombre = v; });
      input(r, t.desc, 'Ej: Crema de elote con chile poblano', 240, '2 1 180px', function (v) { t.desc = v; });
      quitar(r, ESTADO.tiempos, i, pintarMenu);
    });
    boton(c, '+ Agregar tiempo (' + ESTADO.tiempos.length + ' de 6)', ESTADO.tiempos.length < 6, function () {
      ESTADO.tiempos.push({ nombre: '', desc: '' }); pintarMenu(); avisarCambio();
    });
  }

  /* ---- avisos ---- */
  function pintarAvisos() {
    var c = $('cs-avisos'); if (!c) return;
    c.innerHTML = '';
    ESTADO.avisos.forEach(function (a, i) {
      var r = fila(c);
      var s = document.createElement('select');
      s.style.cssText = 'flex:0 1 170px;min-width:0;margin:0';
      ICONOS.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
      s.value = a.icono || 'otro';
      s.onchange = function () { a.icono = s.value; avisarCambio(s); };
      r.appendChild(s);
      input(r, a.texto, 'Ej: Evento solo para adultos.', 160, '2 1 180px', function (v) { a.texto = v; });
      quitar(r, ESTADO.avisos, i, pintarAvisos);
    });
    boton(c, '+ Agregar aviso (' + ESTADO.avisos.length + ' de 6)', ESTADO.avisos.length < 6, function () {
      ESTADO.avisos.push({ icono: 'otro', texto: '' }); pintarAvisos(); avisarCambio();
    });
  }

  /* ---- patrocinadores ---- */
  function pintarLogos() {
    var c = $('cs-patrocinadores'); if (!c) return;
    c.innerHTML = '';
    ESTADO.logos.forEach(function (l, i) {
      var r = fila(c);
      var im = document.createElement('img');
      im.alt = '';
      im.style.cssText = 'height:38px;max-width:76px;object-fit:contain;border-radius:6px;background:#f6efe9';
      if (l.img) im.src = l.img; else im.style.display = 'none';
      r.appendChild(im);
      var up = document.createElement('div');
      up.className = 'up small'; up.style.cssText = 'flex:0 0 auto;padding:7px 10px';
      up.textContent = l.img ? 'Cambiar logo' : 'Subir logo';
      var f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*'; f.style.display = 'none';
      up.onclick = function () { f.click(); };
      f.onchange = function () {
        var a = f.files && f.files[0]; if (!a) return;
        if (a.size > 4 * 1024 * 1024) { up.textContent = 'Muy pesado (máx. 4 MB)'; return; }
        up.textContent = 'Subiendo…';
        var vez = 0;
        (function intentar() {
          if (!window.INV || typeof window.INV.uploadImage !== 'function') {
            if (++vez < 50) return setTimeout(intentar, 200);
            up.textContent = 'No se pudo subir'; return;
          }
          window.INV.uploadImage(a).then(function (u) { l.img = u; pintarLogos(); avisarCambio(); },
                                         function () { up.textContent = 'No se pudo subir. Intenta de nuevo.'; });
        })();
      };
      r.appendChild(up); r.appendChild(f);
      input(r, l.nombre, 'Nombre', 60, '1 1 110px', function (v) { l.nombre = v; });
      input(r, l.link, 'Link (opcional)', 300, '1 1 140px', function (v) { l.link = v; });
      quitar(r, ESTADO.logos, i, pintarLogos);
    });
    boton(c, '+ Agregar patrocinador (' + ESTADO.logos.length + ' de 12)', ESTADO.logos.length < 12, function () {
      ESTADO.logos.push({ img: '', nombre: '', link: '' }); pintarLogos(); avisarCambio();
    });
  }

  /* ---- preguntas extra ---- */
  function pintarPreguntas() {
    var c = $('cs-preguntas'); if (!c) return;
    c.innerHTML = '';
    ESTADO.preguntas.forEach(function (p, i) {
      var r = fila(c);
      input(r, p.texto, 'Ej: ¿En qué empresa trabajas?', 80, '2 1 180px', function (v) { p.texto = v; });
      var s = document.createElement('select');
      s.style.cssText = 'flex:0 1 160px;min-width:0;margin:0';
      [['texto', 'Respuesta escrita'], ['sino', 'Sí / No']].forEach(function (o) {
        var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op);
      });
      s.value = p.tipo === 'sino' ? 'sino' : 'texto';
      s.onchange = function () { p.tipo = s.value; avisarCambio(s); };
      r.appendChild(s);
      quitar(r, ESTADO.preguntas, i, pintarPreguntas);
    });
    boton(c, '+ Agregar pregunta (' + ESTADO.preguntas.length + ' de 3)', ESTADO.preguntas.length < 3, function () {
      ESTADO.preguntas.push({ texto: '', tipo: 'texto' }); pintarPreguntas(); avisarCambio();
    });
  }

  function pintarTodo() { pintarMenu(); pintarAvisos(); pintarLogos(); pintarPreguntas(); }

  function limpio(v, n) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n); }
  function val(id, n) { var e = $(id); return e ? limpio(e.value, n) : ''; }

  function leer() {
    var out = {};
    var tiempos = ESTADO.tiempos.map(function (t) { return { nombre: limpio(t.nombre, 80), desc: limpio(t.desc, 240) }; })
      .filter(function (t) { return t.nombre || t.desc; }).slice(0, 6);
    if (tiempos.length) out.menu = { titulo: val('menuTitulo', 70), frase: val('menuFrase', 240), tiempos: tiempos };
    var avisos = ESTADO.avisos.map(function (a) { return { icono: a.icono || 'otro', texto: limpio(a.texto, 160) }; })
      .filter(function (a) { return a.texto; }).slice(0, 6);
    if (avisos.length) out.avisos = { items: avisos };
    var logos = ESTADO.logos.map(function (l) {
      return { img: /^https:\/\/res\.cloudinary\.com\//.test(String(l.img || '')) ? l.img : '', nombre: limpio(l.nombre, 60), link: limpio(l.link, 300) };
    }).filter(function (l) { return l.img || l.nombre; }).slice(0, 12);
    if (logos.length) out.patrocinadores = { titulo: val('patTitulo', 70), logos: logos };
    var preg = ESTADO.preguntas.map(function (p) { return { texto: limpio(p.texto, 80), tipo: p.tipo === 'sino' ? 'sino' : 'texto' }; })
      .filter(function (p) { return p.texto; }).slice(0, 3);
    if (preg.length) out.rsvpPreguntas = preg;
    return out;
  }

  function borrador() {
    return { t: ESTADO.tiempos, a: ESTADO.avisos, l: ESTADO.logos, p: ESTADO.preguntas };
  }
  function poner(b) {
    if (!b || typeof b !== 'object') return;
    var lista = function (x) { return Object.prototype.toString.call(x) === '[object Array]' ? x : []; };
    ESTADO.tiempos = lista(b.t).slice(0, 6);
    ESTADO.avisos = lista(b.a).slice(0, 6);
    ESTADO.logos = lista(b.l).slice(0, 12);
    ESTADO.preguntas = lista(b.p).slice(0, 3);
    pintarTodo();
  }

  window.CREAR_SECCIONES = { leer: leer, borrador: borrador, poner: poner };

  function arrancar() {
    if (!$('cs-menu')) { if (document.readyState === 'loading') return setTimeout(arrancar, 60); return; }
    pintarTodo();
  }
  arrancar();
})();
