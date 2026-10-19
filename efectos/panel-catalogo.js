/* ===== LOS DISEÑOS DEL CATÁLOGO, EN EL PANEL (16/10/2026) =====================

   Pedido de Jazmín (doc «Ajustes y mejoras», punto 1): «el catálogo de diseños
   de la plataforma tiene que ser el mismo del formulario». Y Maki: «ella quiere
   que todas las del catálogo aparezcan porque la gente elige desde ahí y si no
   están no pueden elegirla».

   QUÉ HACE
   Arriba de todo en la pestaña PRINCIPAL, el bloque «Diseño del catálogo» con
   LAS MISMAS tarjetas que ve el cliente en el formulario (window.MUESTRAS_INVITAME,
   de /muestras/catalogo.js — una sola lista para los dos lados). Jazmín toca una,
   confirma, y la invitación se viste con el diseño de esa muestra: el mismo
   camino que usa una solicitud que llega del formulario (window.INVVESTIR.vestir,
   de /vestir.js). Después aprieta «Guardar y publicar», como siempre.

   ⚠️ LO QUE ES DE ESTA INVITACIÓN NO SE PISA
      `vestir()` nació para invitaciones NUEVAS y copia `fx` entero. Acá la
      invitación puede estar avanzada, así que antes de vestir se guarda lo que
      es contenido de ESTA fiesta y se repone después: la galería de Invítame Live
      (su código), el paquete, la música, el pase con voz, los horarios del
      itinerario, el texto de la carta, la frase del filtro, la foto del cierre,
      la fecha límite y los colores de vestimenta (esos dos ya los cuida vestir).
   ⚠️ Botón «Deshacer» hasta que se guarde: vuelve al borrador de antes.
   ⚠️ La tarjeta marcada es `D.tpl` (el mismo campo que guarda el formulario).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPanelCatalogo) return; window.__invPanelCatalogo = 1;

  var ID = 'catalogo-selector';

  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function copia(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; } }
  function lleno(v) { return v != null && v !== '' && !(typeof v === 'object' && !Object.keys(v).length); }

  function lista() {
    var M = window.MUESTRAS_INVITAME || {};
    return Object.keys(M).filter(function (k) { return !M[k].oculto && M[k].muestra; })
      .map(function (k) { var m = M[k]; return { id: k, nombre: m.nombre, bajada: m.bajada || '', slug: m.muestra, foto: m.foto || '', tipos: m.tipos || [] }; });
  }

  /* lo que es de ESTA fiesta: se guarda antes de vestir y se repone después */
  function guardarPropio(d) {
    var fx = d.fx || {}, p = {};
    ['galeria', 'paquete', 'musica', 'muestra', 'calendario', 'compartir'].forEach(function (k) { if (lleno(fx[k])) p[k] = copia(fx[k]); });
    if (fx.itinerario && (fx.itinerario.momentos || []).length) p.momentos = copia(fx.itinerario.momentos);
    if (fx.carta) p.carta = { titulo: fx.carta.titulo || '', texto: fx.carta.texto || '', kicker: fx.carta.kicker || '' };
    if (fx.pasevoz) p.pasevoz = copia(fx.pasevoz);
    if (fx.filtro) { p.filtro = {}; Object.keys(fx.filtro).forEach(function (k) { if (/^frase/.test(k)) p.filtro[k] = fx.filtro[k]; }); }
    if (fx.cierre && fx.cierre.url) p.cierre = copia(fx.cierre);
    return p;
  }
  function reponerPropio(d, p) {
    d.fx = d.fx || {};
    var fx = d.fx;
    ['paquete', 'musica', 'muestra', 'calendario', 'compartir', 'cierre'].forEach(function (k) { if (p[k]) fx[k] = p[k]; });
    if (!p.muestra && fx.muestra) delete fx.muestra;
    if (p.galeria) {
      /* el estilo de la galería puede venir de la muestra; el código y lo encendido son de esta fiesta */
      fx.galeria = fx.galeria || {};
      Object.keys(p.galeria).forEach(function (k) { fx.galeria[k] = p.galeria[k]; });
    }
    if (p.momentos) { fx.itinerario = fx.itinerario || {}; fx.itinerario.momentos = p.momentos; }
    if (p.carta) { fx.carta = fx.carta || {}; ['titulo', 'texto', 'kicker'].forEach(function (k) { if (p.carta[k]) fx.carta[k] = p.carta[k]; }); }
    if (p.pasevoz) {
      fx.pasevoz = fx.pasevoz || {};
      ['audio', 'onda', 'encendido', 'departe', 'titulo', 'nota'].forEach(function (k) { if (k in p.pasevoz) fx.pasevoz[k] = p.pasevoz[k]; });
    }
    if (p.filtro && Object.keys(p.filtro).length) { fx.filtro = fx.filtro || {}; Object.keys(p.filtro).forEach(function (k) { fx.filtro[k] = p.filtro[k]; }); }
  }

  function construir() {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:16px';
    var css = document.createElement('style');
    css.textContent =
      '#' + ID + ' .cat-t{font-weight:700;font-size:15px;margin-bottom:2px}' +
      '#' + ID + ' .cat-a{font-size:12.5px;opacity:.75;margin-bottom:10px;line-height:1.4}' +
      '#' + ID + ' .cat-f{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}' +
      '#' + ID + ' .cat-f button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 12px;font-size:12.5px;cursor:pointer}' +
      '#' + ID + ' .cat-f button.on{background:#6d1233;color:#fff;border-color:#6d1233}' +
      '#' + ID + ' .cat-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:9px;max-height:430px;overflow:auto;padding:2px}' +
      '#' + ID + ' .cat-c{border:2px solid transparent;border-radius:12px;background:#faf6f3;cursor:pointer;padding:0;text-align:left;overflow:hidden;font:inherit}' +
      '#' + ID + ' .cat-c img{display:block;width:100%;aspect-ratio:9/14;object-fit:cover;background:#ddd}' +
      '#' + ID + ' .cat-c span{display:block;font-size:11.5px;font-weight:600;padding:5px 6px 6px;line-height:1.25}' +
      '#' + ID + ' .cat-c.on{border-color:#6d1233}' +
      '#' + ID + ' .cat-m{font-size:12.5px;margin-top:10px;line-height:1.45}' +
      '#' + ID + ' .cat-m button{margin:6px 6px 0 0;border:0;border-radius:9px;padding:8px 13px;font-weight:700;cursor:pointer}' +
      '#' + ID + ' .cat-si{background:#6d1233;color:#fff}#' + ID + ' .cat-no{background:#eee}';
    caja.appendChild(css);

    var t = document.createElement('div'); t.className = 'cat-t'; t.textContent = 'Diseño del catálogo'; caja.appendChild(t);
    var a = document.createElement('div'); a.className = 'cat-a';
    a.textContent = 'Los mismos diseños que elige el cliente en el formulario. Tocá uno y la invitación se viste igual a esa muestra; los datos de esta invitación no se tocan.';
    caja.appendChild(a);

    var filtros = document.createElement('div'); filtros.className = 'cat-f'; caja.appendChild(filtros);
    var grid = document.createElement('div'); grid.className = 'cat-g'; caja.appendChild(grid);
    var msg = document.createElement('div'); msg.className = 'cat-m'; caja.appendChild(msg);

    var filtro = 'todos', antes = null;
    /* 19/10/2026: un filtro por cada tipo que tenga muestras (muestras/catalogo.js) */
    [['todos', 'Todos']].concat((window.MUESTRAS_TIPOS || [['boda', 'Boda'], ['xv', 'XV']]).filter(function (t) {
      return !window.muestrasDeTipo || window.muestrasDeTipo(t[0]).length;
    })).forEach(function (f) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = f[1]; b.dataset.f = f[0];
      b.onclick = function () { filtro = f[0]; pintar(); };
      filtros.appendChild(b);
    });

    function pintar() {
      var d = borrador() || {};
      [].forEach.call(filtros.children, function (b) { b.classList.toggle('on', b.dataset.f === filtro); });
      grid.textContent = '';
      lista().forEach(function (m) {
        if (filtro !== 'todos' && m.tipos.length && m.tipos.indexOf(filtro) < 0) return;
        var c = document.createElement('button'); c.type = 'button'; c.className = 'cat-c' + (d.tpl === m.id ? ' on' : '');
        c.title = m.bajada;
        var im = document.createElement('img'); im.loading = 'lazy'; im.alt = ''; if (m.foto) im.src = m.foto;
        var s = document.createElement('span'); s.textContent = m.nombre;
        c.appendChild(im); c.appendChild(s);
        c.onclick = function () { preguntar(m); };
        grid.appendChild(c);
      });
    }

    function preguntar(m) {
      msg.innerHTML = '';
      var p = document.createElement('div');
      p.innerHTML = '¿Vestir esta invitación con <b></b>? Cambia colores, letras, sobre, fondo y efectos.';
      p.querySelector('b').textContent = m.nombre;
      msg.appendChild(p);
      var si = document.createElement('button'); si.type = 'button'; si.className = 'cat-si'; si.textContent = 'Sí, usar este diseño';
      var no = document.createElement('button'); no.type = 'button'; no.className = 'cat-no'; no.textContent = 'Cancelar';
      si.onclick = function () { aplicar(m); };
      no.onclick = function () { msg.innerHTML = ''; };
      msg.appendChild(si); msg.appendChild(no);
    }

    function aplicar(m) {
      var d = borrador();
      if (!d || !window.INVVESTIR) { msg.textContent = 'El panel todavía no terminó de cargar. Probá de nuevo en unos segundos.'; return; }
      msg.textContent = 'Trayendo el diseño de «' + m.nombre + '»…';
      window.INVVESTIR.bajarMuestra(m.slug).then(function (muestra) {
        var d2 = borrador(); if (!d2) throw new Error('sin borrador');
        antes = copia(d2);
        var propio = guardarPropio(d2);
        window.INVVESTIR.vestir(d2, muestra, null);
        reponerPropio(d2, propio);
        d2.tpl = m.id;
        caja.dataset.tocado = '1';
        refrescar(); pintar();
        msg.innerHTML = '';
        var ok = document.createElement('div');
        ok.innerHTML = '✓ Listo: quedó con el diseño <b></b>. Revisalo en la vista previa y tocá <b>Guardar y publicar</b>.';
        ok.querySelector('b').textContent = m.nombre;
        msg.appendChild(ok);
        var des = document.createElement('button'); des.type = 'button'; des.className = 'cat-no'; des.textContent = 'Deshacer';
        des.onclick = function () {
          var d3 = borrador(); if (!d3 || !antes) return;
          Object.keys(d3).forEach(function (k) { if (!(k in antes)) delete d3[k]; });
          Object.keys(antes).forEach(function (k) { d3[k] = antes[k]; });
          antes = null; refrescar(); pintar();
          msg.textContent = 'Volvió como estaba.';
        };
        msg.appendChild(des);
      }).catch(function () {
        msg.textContent = 'No pude traer el diseño de «' + m.nombre + '». Revisá la conexión y probá de nuevo.';
      });
    }

    caja.pintar = pintar;
    pintar();
    return caja;
  }

  function revisar() {
    if (!borrador() || !window.MUESTRAS_INVITAME) return;
    var m = window.invCasa ? window.invCasa(ID) : null;
    if (!m) return;
    var ya = document.getElementById(ID);
    if (ya) { var d = borrador(); if (ya.pintar && ya.dataset.tpl !== String(d.tpl || '')) { ya.dataset.tpl = String(d.tpl || ''); ya.pintar(); } return; }
    var caja = construir();
    m.insertBefore(caja, m.firstChild);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
