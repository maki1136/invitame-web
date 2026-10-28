/* ===== SAVE THE DATE SIN INVITACIÓN, EN EL PANEL (27/10/2026) ==================
   Maki, 27/10: «la gente me pide el Save the Date ANTES de la invitación… que
   se cree automático al crear la invitación… 10 diseños sobrios… foto de pareja
   o fondo… que los textos los podamos acomodar a nuestro gusto y escribir lo
   que queramos».
   Lo dibuja /efectos/std-generico.js (se carga sólo acá, no en la invitación).
   Sale SOLO de los datos del evento: no hace falta que la invitación esté armada.

   Lo que se guarda: D.fx.stdg = {
     diseno,                      // id de INVSTDG.DISENOS ('' = automático)
     foto, modoFoto, velo,        // foto opcional: arco | rectangulo | cuadrado | circulo | ovalo | fondo
     foco: {x, y, zoom},          // qué parte de la foto se ve (0..1) y cuánto se acerca
     colores: {tinta, suave, acento, papel}, fuentes: {tit, nom, txt},   // vacío = los del diseño
     lay: '' | clasico | moderno | fecha | editorial, marco: true/false,  // disposición y marco fino
     textos: {titulo, sub, nombres, fecha, detalle, pie},   // vacío = el que sale solo
     ajustes: {<pieza>: {dx, dy, esc, oculto, fam, color}}, // arrastrar / tamaño / letra / color
     extras: [{txt, y, tam}]                                // textos propios
   }
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'stdg-selector';
  var RENG = [['titulo', 'Título'], ['sub', 'Frase de arriba (según el evento)'], ['nombres', 'Nombres'],
              ['fecha', 'Fecha grande'], ['detalle', 'Día y lugar'], ['pie', 'Renglón final']];

  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function cfg() {
    var d = borrador(); if (!d.fx) d.fx = {};
    var s = d.fx.stdg; if (!s || typeof s !== 'object') s = d.fx.stdg = {};
    if (!s.textos) s.textos = {}; if (!s.ajustes) s.ajustes = {}; if (!Array.isArray(s.extras)) s.extras = [];
    return s;
  }
  function motor() {
    if (window.INVSTDG) return Promise.resolve(window.INVSTDG);
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = '/efectos/std-generico.js?v=20261027f';
      s.onload = function () { ok(window.INVSTDG); }; s.onerror = no; document.head.appendChild(s);
    });
  }
  function el(tag, css, txt) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  var BTN = 'border:0;border-radius:20px;padding:7px 13px;font-weight:700;cursor:pointer;background:#efe7de;color:#49111A;font-size:12.5px';

  function construir() {
    var caja = el('div', 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)');
    caja.id = ID;
    caja.appendChild(el('div', 'font-size:13px;font-weight:600;margin-bottom:2px', 'Save the date sin invitación (10 diseños)'));
    caja.appendChild(el('div', 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35',
      'Sale solo con los datos del formulario: no hace falta que la invitación esté armada. Elegí el diseño, subí una foto si querés, arrastrá los textos sobre la imagen para acomodarlos y descargalo.'));

    var fila = el('div', 'display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap');
    var izq = el('div', 'width:216px;flex:none'), der = el('div', 'flex:1;min-width:220px');
    fila.appendChild(izq); fila.appendChild(der); caja.appendChild(fila);

    /* ---- la vista previa (se arrastra) ---- */
    var lienzo = document.createElement('canvas');
    lienzo.style.cssText = 'width:216px;height:384px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.15);cursor:grab;touch-action:none;display:block;background:#f3eff4';
    izq.appendChild(lienzo);
    var selInfo = el('div', 'font-size:11.5px;margin:8px 0 4px;min-height:16px;opacity:.8', 'Tocá un texto para elegirlo y arrastralo.');
    izq.appendChild(selInfo);
    var ctrlSel = el('div', 'display:none;gap:6px;flex-wrap:wrap');
    var bMenos = el('button', BTN, 'A−'), bMas = el('button', BTN, 'A+'), bSub = el('button', BTN, '↑'), bBaj = el('button', BTN, '↓'), bCen = el('button', BTN, 'Centrar'), bOcu = el('button', BTN, 'Ocultar'), bVol = el('button', BTN, 'A su lugar');
    [bMenos, bMas, bSub, bBaj, bCen, bOcu, bVol].forEach(function (b) { b.type = 'button'; ctrlSel.appendChild(b); });
    /* letra y color de la pieza elegida */
    var selFamP = document.createElement('select'); selFamP.style.cssText = 'width:100%;margin-top:4px';
    var colP = document.createElement('input'); colP.type = 'color'; colP.style.cssText = 'width:44px;height:30px;border:0;padding:0;background:none;cursor:pointer';
    var bColP = el('button', BTN, 'Color del diseño'); bColP.type = 'button';
    var filaP = el('div', 'display:flex;gap:6px;align-items:center;margin-top:4px;width:100%');
    filaP.appendChild(colP); filaP.appendChild(bColP);
    ctrlSel.appendChild(selFamP); ctrlSel.appendChild(filaP);
    izq.appendChild(ctrlSel);

    /* ---- diseño ---- */
    var gDis = el('div', 'margin:0 0 10px');
    gDis.appendChild(el('label', 'display:block;font-size:12px;font-weight:600;margin:0 0 3px', 'Diseño'));
    var selDis = document.createElement('select'); selDis.style.cssText = 'width:100%';
    gDis.appendChild(selDis);
    /* ★ 27/10: cómo van acomodados los textos, y un marco fino alrededor */
    var filaLay = el('div', 'display:flex;gap:8px;align-items:center;margin-top:6px;font-size:12px;flex-wrap:wrap');
    var selLay = document.createElement('select'); selLay.style.cssText = 'flex:1;min-width:160px';
    var lbMarco = el('label', 'display:flex;gap:4px;align-items:center;cursor:pointer'); var chMarco = document.createElement('input'); chMarco.type = 'checkbox';
    lbMarco.appendChild(chMarco); lbMarco.appendChild(el('span', '', 'Marco fino'));
    filaLay.appendChild(el('span', '', 'Disposición')); filaLay.appendChild(selLay); filaLay.appendChild(lbMarco);
    gDis.appendChild(filaLay); der.appendChild(gDis);

    /* ---- foto ---- */
    var gFoto = el('div', 'margin:0 0 10px');
    gFoto.appendChild(el('label', 'display:block;font-size:12px;font-weight:600;margin:0 0 3px', 'Foto de la pareja (opcional)'));
    var fFila = el('div', 'display:flex;gap:6px;flex-wrap:wrap;align-items:center');
    var lbFoto = el('label', BTN, 'Subir foto'); var inFoto = document.createElement('input'); inFoto.type = 'file'; inFoto.accept = 'image/*'; inFoto.style.display = 'none'; lbFoto.appendChild(inFoto);
    var bQuitar = el('button', BTN, 'Sin foto'); bQuitar.type = 'button';
    var selModo = document.createElement('select');
    [['arco', 'Forma: arco'], ['rectangulo', 'Forma: rectángulo'], ['cuadrado', 'Forma: cuadrado'], ['circulo', 'Forma: círculo'], ['ovalo', 'Forma: óvalo'], ['fondo', 'Foto de fondo (toda la imagen)']].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; selModo.appendChild(op); });
    fFila.appendChild(lbFoto); fFila.appendChild(bQuitar); fFila.appendChild(selModo); gFoto.appendChild(fFila);
    /* encuadre: para que nunca se corten las caras */
    var gFoco = el('div', 'margin-top:6px;font-size:12px;line-height:1.3');
    function slider(txt, min, max, step) { var w = el('div', 'margin-top:4px'); w.appendChild(el('span', '', txt)); var r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.style.cssText = 'width:100%'; w.appendChild(r); gFoco.appendChild(w); return r; }
    var focoY = slider('Encuadre: mover la foto arriba / abajo', 0, 1, 0.01);
    var focoX = slider('Encuadre: mover la foto a los costados', 0, 1, 0.01);
    var focoZ = slider('Acercar la foto', 1, 2.5, 0.02);
    gFoto.appendChild(gFoco);
    var gVelo = el('div', 'margin-top:6px;font-size:12px'); gVelo.appendChild(el('span', '', 'Oscurecer la foto (para que se lea el texto)'));
    var velo = document.createElement('input'); velo.type = 'range'; velo.min = 0; velo.max = 0.7; velo.step = 0.02; velo.style.cssText = 'width:100%';
    gVelo.appendChild(velo); gFoto.appendChild(gVelo); der.appendChild(gFoto);

    /* ---- colores y letras de todo el save the date ---- */
    var gCol = el('div', 'margin:0 0 10px');
    gCol.appendChild(el('label', 'display:block;font-size:12px;font-weight:600;margin:0 0 3px', 'Colores'));
    var colFila = el('div', 'display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;font-size:11px');
    var COLS = [['tinta', 'Letra principal'], ['suave', 'Letra chica'], ['acento', 'Adornos y marco'], ['papel', 'Color del fondo']], colIn = {};
    COLS.forEach(function (c) {
      var w = el('label', 'display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer'); var i = document.createElement('input'); i.type = 'color';
      i.style.cssText = 'width:40px;height:30px;border:0;padding:0;background:none;cursor:pointer';
      i.oninput = function () { var s = cfg(); if (!s.colores) s.colores = {}; s.colores[c[0]] = i.value; pintar(); refrescar(); };
      w.appendChild(i); w.appendChild(el('span', '', c[1])); colIn[c[0]] = i; colFila.appendChild(w);
    });
    var bColDis = el('button', BTN, 'Colores del diseño'); bColDis.type = 'button';
    bColDis.onclick = function () { cfg().colores = {}; sincronizar(); pintar(); refrescar(); };
    colFila.appendChild(bColDis); gCol.appendChild(colFila); der.appendChild(gCol);

    var gFu = el('div', 'margin:0 0 10px');
    gFu.appendChild(el('label', 'display:block;font-size:12px;font-weight:600;margin:0 0 3px', 'Tipografías'));
    var FU = [['tit', 'Título'], ['nom', 'Nombres'], ['txt', 'Textos chicos']], fuSel = {};
    FU.forEach(function (f) {
      var w = el('div', 'display:flex;gap:6px;align-items:center;margin:0 0 4px;font-size:12px'); w.appendChild(el('span', 'width:92px;flex:none', f[1]));
      var s = document.createElement('select'); s.style.cssText = 'flex:1';
      s.onchange = function () { var c = cfg(); if (!c.fuentes) c.fuentes = {}; if (s.value) c.fuentes[f[0]] = s.value; else delete c.fuentes[f[0]]; pintar(); refrescar(); };
      fuSel[f[0]] = s; w.appendChild(s); gFu.appendChild(w);
    });
    der.appendChild(gFu);

    /* ---- textos ---- */
    var inputs = {};
    RENG.forEach(function (r) {
      var g = el('div', 'margin:0 0 7px');
      g.appendChild(el('label', 'display:block;font-size:12px;font-weight:600;margin:0 0 3px', 'Save the date · ' + r[1]));
      var i = document.createElement('input'); i.type = 'text'; i.style.cssText = 'width:100%';
      i.oninput = function () { var s = cfg(); if (i.value.trim()) s.textos[r[0]] = i.value; else delete s.textos[r[0]]; pintar(); refrescar(); };
      inputs[r[0]] = i; g.appendChild(i); der.appendChild(g);
    });
    der.appendChild(el('div', 'font-size:11px;opacity:.6;line-height:1.35;margin-bottom:10px', 'Vacío = el texto que sale solo (en gris). Para sacar un renglón escribí un guion: -'));

    /* ---- textos propios ---- */
    var gEx = el('div', 'margin:0 0 10px'); gEx.appendChild(el('label', 'display:block;font-size:12px;font-weight:600;margin:0 0 3px', 'Textos propios'));
    var listaEx = el('div', ''); gEx.appendChild(listaEx);
    var bAgregar = el('button', BTN, '+ Agregar un texto'); bAgregar.type = 'button'; gEx.appendChild(bAgregar); der.appendChild(gEx);

    /* ---- descargar ---- */
    var bBajar = el('button', BTN + ';background:#6D1233;color:#fff', 'Descargar el save the date'); bBajar.type = 'button';
    var nota = el('div', 'font-size:11px;opacity:.7;margin-top:6px;line-height:1.35', '');
    der.appendChild(bBajar); der.appendChild(nota);

    var M = null, sel = null, auto = {};

    function disenoActual() { var s = cfg(); return s.diseno || (M ? M.elegirSolo(borrador()) : 'marfil-oro'); }
    function opciones() {
      var s = cfg(), tx = {};
      RENG.forEach(function (r) { tx[r[0]] = (s.textos[r[0]] != null && String(s.textos[r[0]]).trim() !== '') ? s.textos[r[0]] : auto[r[0]]; });
      return { diseno: disenoActual(), lay: s.lay || '', marco: s.marco == null ? null : !!s.marco, foto: s.foto || '', modoFoto: s.modoFoto || 'arco', velo: s.velo, foco: s.foco || {},
               colores: s.colores || {}, fuentes: s.fuentes || {}, textos: tx, ajustes: s.ajustes, extras: s.extras };
    }
    var pintando = null, otra = false;
    function pintar() {
      if (!M) return;
      if (pintando) { otra = true; return; }
      pintando = M.armar(lienzo, opciones()).then(function () {
        lienzo.style.width = '216px'; lienzo.style.height = '384px';
        if (sel) marcar();
        pintando = null; if (otra) { otra = false; pintar(); }
      }, function () { pintando = null; });
    }
    function marcar() {
      var c = (lienzo.__cajas || []).filter(function (x) { return x.id === sel; })[0];
      if (!c) return;
      var ctx = lienzo.getContext('2d'); ctx.save(); ctx.setLineDash([12, 8]); ctx.strokeStyle = 'rgba(109,18,51,.9)'; ctx.lineWidth = 4;
      ctx.strokeRect(c.x - 10, c.y - 10, c.w + 20, c.h + 20); ctx.restore();
    }
    function sincronizar() {
      var s = cfg();
      selDis.value = s.diseno || '';
      if (!selLay.options.length && M) M.DISPOSICIONES.forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; selLay.appendChild(op); });
      selLay.value = s.lay || '';
      var dd0 = M ? (M.DISENOS.filter(function (x) { return x.id === disenoActual(); })[0] || {}) : {};
      chMarco.checked = s.marco == null ? dd0.lay === 'marco' : !!s.marco;
      selModo.value = s.modoFoto || 'arco';
      velo.value = s.velo == null ? 0.38 : s.velo;
      gVelo.style.display = (s.foto && (s.modoFoto || 'arco') === 'fondo') ? '' : 'none';
      selModo.style.display = bQuitar.style.display = gFoco.style.display = s.foto ? '' : 'none';
      var fo = s.foco || {}; focoY.value = fo.y == null ? 0.3 : fo.y; focoX.value = fo.x == null ? 0.5 : fo.x; focoZ.value = fo.zoom || 1;
      var dd = M ? (M.DISENOS.filter(function (x) { return x.id === disenoActual(); })[0] || {}) : {}, co = s.colores || {};
      COLS.forEach(function (c) { colIn[c[0]].value = co[c[0]] || dd[c[0]] || '#ffffff'; });
      FU.forEach(function (f) {
        var sel0 = fuSel[f[0]]; if (!sel0.options.length && M) {
          sel0.appendChild(el('option', '', 'La del diseño')).value = '';
          M.FAMILIAS.forEach(function (n) { var o = el('option', 'font-family:"' + n + '"', n); o.value = n; sel0.appendChild(o); });
        }
        sel0.value = (s.fuentes || {})[f[0]] || '';
        if (sel0.options[0]) sel0.options[0].textContent = 'La del diseño (' + (dd[f[0]] || '') + ')';
      });
      RENG.forEach(function (r) { inputs[r[0]].value = s.textos[r[0]] || ''; inputs[r[0]].placeholder = auto[r[0]] || ''; });
      dibujarExtras();
    }
    function dibujarExtras() {
      var s = cfg(); listaEx.innerHTML = '';
      s.extras.forEach(function (e, i) {
        var f = el('div', 'display:flex;gap:6px;margin:0 0 6px');
        var inp = document.createElement('input'); inp.type = 'text'; inp.value = e.txt || ''; inp.placeholder = 'Ej.: Guarda la fecha · Te esperamos'; inp.style.cssText = 'flex:1';
        inp.oninput = function () { cfg().extras[i].txt = inp.value; pintar(); refrescar(); };
        var x = el('button', BTN, '✕'); x.type = 'button';
        x.onclick = function () { cfg().extras.splice(i, 1); dibujarExtras(); pintar(); refrescar(); };
        f.appendChild(inp); f.appendChild(x); listaEx.appendChild(f);
      });
    }
    bAgregar.onclick = function () { cfg().extras.push({ txt: '', y: 1700 - cfg().extras.length * 80, tam: 40 }); dibujarExtras(); pintar(); };

    selDis.onchange = function () { cfg().diseno = selDis.value; sincronizar(); pintar(); refrescar(); };
    selLay.onchange = function () { cfg().lay = selLay.value; cfg().ajustes = {}; pintar(); refrescar(); };
    chMarco.onchange = function () { cfg().marco = chMarco.checked; pintar(); refrescar(); };
    function foco(k, v) { var s = cfg(); if (!s.foco) s.foco = {}; s.foco[k] = +v; pintar(); refrescar(); }
    focoY.oninput = function () { foco('y', focoY.value); };
    focoX.oninput = function () { foco('x', focoX.value); };
    focoZ.oninput = function () { foco('zoom', focoZ.value); };
    selModo.onchange = function () { cfg().modoFoto = selModo.value; sincronizar(); pintar(); refrescar(); };
    velo.oninput = function () { cfg().velo = +velo.value; pintar(); refrescar(); };
    bQuitar.onclick = function () { cfg().foto = ''; cfg().ajustes = {}; sincronizar(); pintar(); refrescar(); };
    inFoto.onchange = async function () {
      var f = inFoto.files && inFoto.files[0]; if (!f) return;
      if (!window.INV || !INV.uploadImage) { alert('Todavía no cargó la base. Esperá 2 seg.'); return; }
      lbFoto.firstChild.textContent = 'Subiendo…';
      try { cfg().foto = await INV.uploadImage(f); cfg().ajustes = {}; sincronizar(); pintar(); refrescar(); }
      catch (e) { alert('No pude subir la foto. Probá de nuevo.'); }
      lbFoto.firstChild.textContent = 'Subir foto';
    };

    /* ---- arrastrar ---- */
    function aLienzo(ev) { var r = lienzo.getBoundingClientRect(); return { x: (ev.clientX - r.left) * (1080 / r.width), y: (ev.clientY - r.top) * (1920 / r.height) }; }
    var arr = null;
    lienzo.addEventListener('pointerdown', function (ev) {
      var p = aLienzo(ev);
      var c = (lienzo.__cajas || []).filter(function (b) { return p.x >= b.x - 20 && p.x <= b.x + b.w + 20 && p.y >= b.y - 20 && p.y <= b.y + b.h + 20; }).pop();
      sel = c ? c.id : null;
      ctrlSel.style.display = sel ? 'flex' : 'none';
      if (sel) ponerPieza();
      selInfo.textContent = sel ? 'Elegido: ' + nombrePieza(sel) + ' · arrastralo' : 'Tocá un texto para elegirlo y arrastralo.';
      if (sel) { var a = cfg().ajustes[sel] || (cfg().ajustes[sel] = {}); arr = { x: p.x, y: p.y, dx: +a.dx || 0, dy: +a.dy || 0 }; lienzo.setPointerCapture(ev.pointerId); lienzo.style.cursor = 'grabbing'; }
      pintar();
    });
    lienzo.addEventListener('pointermove', function (ev) {
      if (!arr || !sel) return;
      var p = aLienzo(ev), a = cfg().ajustes[sel];
      a.dx = Math.round(arr.dx + p.x - arr.x); a.dy = Math.round(arr.dy + p.y - arr.y);
      pintar();
    });
    function soltar() { if (arr) { arr = null; lienzo.style.cursor = 'grab'; refrescar(); } }
    lienzo.addEventListener('pointerup', soltar); lienzo.addEventListener('pointercancel', soltar);
    function nombrePieza(id) { var r = RENG.filter(function (x) { return x[0] === id; })[0]; return r ? r[1] : (/^extra/.test(id) ? 'texto propio' : 'adorno'); }
    function aj() { return cfg().ajustes[sel] || (cfg().ajustes[sel] = {}); }
    function ponerPieza() {
      if (!selFamP.options.length && M) {
        selFamP.appendChild(el('option', '', 'Letra: la de siempre')).value = '';
        M.FAMILIAS.forEach(function (n) { var o = el('option', 'font-family:"' + n + '"', 'Letra: ' + n); o.value = n; selFamP.appendChild(o); });
      }
      var a = cfg().ajustes[sel] || {}, esAdorno = !(RENG.some(function (r) { return r[0] === sel; }) || /^extra/.test(sel));
      selFamP.style.display = esAdorno ? 'none' : '';
      selFamP.value = a.fam || '';
      colP.value = a.color || colIn.tinta.value || '#333333';
    }
    selFamP.onchange = function () { if (!sel) return; if (selFamP.value) aj().fam = selFamP.value; else delete aj().fam; pintar(); refrescar(); };
    colP.oninput = function () { if (!sel) return; aj().color = colP.value; pintar(); refrescar(); };
    bColP.onclick = function () { if (!sel) return; delete aj().color; ponerPieza(); pintar(); refrescar(); };
    bSub.onclick = function () { if (!sel) return; aj().dy = (+aj().dy || 0) - 20; pintar(); refrescar(); };
    bBaj.onclick = function () { if (!sel) return; aj().dy = (+aj().dy || 0) + 20; pintar(); refrescar(); };
    bMas.onclick = function () { if (!sel) return; aj().esc = Math.min(2.5, (+aj().esc || 1) + 0.08); pintar(); refrescar(); };
    bMenos.onclick = function () { if (!sel) return; aj().esc = Math.max(0.4, (+aj().esc || 1) - 0.08); pintar(); refrescar(); };
    bCen.onclick = function () { if (!sel) return; aj().dx = 0; pintar(); refrescar(); };
    bOcu.onclick = function () { if (!sel) return; aj().oculto = true; sel = null; ctrlSel.style.display = 'none'; pintar(); refrescar(); };
    bVol.onclick = function () { if (!sel) return; delete cfg().ajustes[sel]; pintar(); refrescar(); };

    /* ---- descargar ---- */
    bBajar.onclick = function () {
      if (!M) return;
      var c = document.createElement('canvas');
      M.armar(c, opciones()).then(function () {
        c.toBlob(function (b) {
          var a = document.createElement('a'); a.href = URL.createObjectURL(b);
          a.download = 'save-the-date-' + ((borrador().slug || 'invitacion').trim()) + '.jpg';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          nota.textContent = 'Listo: se descargó la imagen (1080×1920).';
        }, 'image/jpeg', 0.93);
      }, function () { nota.textContent = 'No se pudo armar la imagen. Probá de nuevo.'; });
    };

    motor().then(function (m) {
      M = m;
      var o = el('option', '', 'Automático (según la muestra elegida)'); o.value = ''; selDis.appendChild(o);
      m.DISENOS.forEach(function (d) { var op = el('option', '', d.nombre); op.value = d.id; selDis.appendChild(op); });
      auto = m.textosDe(borrador());
      sincronizar(); pintar();
    }, function () { nota.textContent = 'No se pudo cargar el dibujante. Recargá la página.'; });

    /* si cambian nombres/fecha arriba en el panel, el automático se actualiza */
    caja.__sync = function () {
      if (!M) return;
      var nuevo = M.textosDe(borrador()), cambio = JSON.stringify(nuevo) !== JSON.stringify(auto);
      if (cambio && !(document.activeElement && caja.contains(document.activeElement))) { auto = nuevo; sincronizar(); pintar(); }
    };
    return caja;
  }

  function revisar() {
    if (!borrador() || !window.invCasa) return;
    var ya = document.getElementById(ID);
    if (ya) { if (ya.__sync) ya.__sync(); return; }
    var m = window.invCasa(ID); if (!m) return;
    m.appendChild(construir());
  }
  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 900); revisar(); }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
