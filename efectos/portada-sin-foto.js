/* ===== PORTADA SIN FOTO (28/10/2026) ==========================================
   Jazmín: «a todas las invitaciones que tienen fotos, agregales portada del
   mismo diseño, para los clientes que no quieren colocar ninguna foto. Todas
   las invitaciones tienen que tener la opción de diseño sin fotos.»

   Cada diseño (muestra) ya tiene 3 fondos propios de su temática, hechos en Flow
   para los Save the Date (/efectos/std-temas.js): A = detalle abajo, B = detalle
   arriba, C = marco. Son verticales, como la portada del celular, y traen su
   color de letra medido contra el fondo. Este módulo ofrece el B y el C como portada (el A cae
   debajo de la cuenta regresiva).

   EL DATO — fx.portadaSinFoto:
     fondo:  URL de la imagen ('' = apagado, la portada usa la foto de siempre)
     tinta:  color de la letra de la portada (sale del diseño; se puede cambiar)
     oscuro: true si el fondo es oscuro
     cual:   'a' | 'b' | 'c' (cuál de los tres se eligió, para el panel)
     fin:    true (por defecto) = el cierre ¡Gracias! también sin foto
     finFondo / finTinta / finOscuro: el OTRO fondo del diseño, para el cierre
   Panel: PRINCIPAL → «Portada sin foto». Corre también en la miniatura.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPortadaSF) return; window.__invPortadaSF = 1;

  var ID_CSS = 'inv-portada-sin-foto';
  function cfg(ev) { return ((ev && ev.fx) || {}).portadaSinFoto || {}; }
  function luz(hex) {
    var h = String(hex || '').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var r = parseInt(h.substr(0, 2), 16) / 255, g = parseInt(h.substr(2, 2), 16) / 255, b = parseInt(h.substr(4, 2), 16) / 255;
    if (isNaN(r)) return 1; return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  var ultima = null;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var c = cfg(ev), f = String(c.fondo || '').trim();
    var firma = f + '|' + (c.tinta || '') + '|' + !!c.oscuro + '|' + (c.fin === false ? 0 : 1) + '|' + (c.finFondo || '') + '|' + (c.finTinta || '');
    if (firma === ultima && (!f || document.getElementById(ID_CSS))) return;
    ultima = firma;
    var st = document.getElementById(ID_CSS);
    var h = document.documentElement;
    if (!/^https:\/\//.test(f)) { if (st) st.remove(); h.removeAttribute('data-portada-sin-foto'); return; }
    h.setAttribute('data-portada-sin-foto', '1');
    var T = c.tinta || (c.oscuro ? '#f6f1e8' : '#2b2622');
    var osc = luz(T) < 0.5;
    var SH = osc ? '0 1px 2px rgba(255,255,255,.55),0 0 18px rgba(255,255,255,.45)' : '0 1px 3px rgba(0,0,0,.45),0 2px 16px rgba(0,0,0,.35)';
    var S = 'html[data-portada-sin-foto] body .portada.portada:not(#psf-a)';
    var css = [
      S + ' .pbg{display:block!important;background-image:url("' + f.replace(/"/g, '') + '")!important;background-size:cover!important;background-position:center!important;inset:0!important;animation:none!important;transform:none!important;filter:none!important;opacity:1!important}',
      S + ' video, ' + S + ' .cover-vid{display:none!important}',
      S + ' .pveil{background:' + (c.oscuro ? 'linear-gradient(rgba(0,0,0,.04) 30%,rgba(0,0,0,.28))' : 'radial-gradient(70% 40% at 50% 52%, rgba(255,255,255,.35), rgba(255,255,255,0) 100%)') + '!important}',
      S + ':not(#psf-c):not(#psf-d) :is(.kicker, .names, .names *, .fecha, .num, .lab, .sep, .scrollcue, .count, .count *, #pv-kick, #pv-names, #pv-names *, #pv-fecha, #d, #h, #m, #s){color:' + T + '!important;-webkit-text-fill-color:' + T + '!important;text-shadow:' + SH + '!important}',
      S + ' .scrollcue svg{filter:none!important}',
      /* los velos propios de cada colección (pensados para la foto) se apagan */
      S + '::before, ' + S + '::after, ' + S + ' :is(.pbg, .c, .pveil)::before, ' + S + ' :is(.pbg, .c, .pveil)::after{background:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
    ];
    /* ★ Jazmín: «y la foto final también». El cierre (¡Gracias!) usa el OTRO
       fondo del diseño (si la portada es el B, el cierre es el C, y al revés). */
    var ff = String(c.finFondo || '').trim();
    if (c.fin !== false && /^https:\/\//.test(ff)) {
      var T2 = c.finTinta || T, osc2 = luz(T2) < 0.5;
      var SH2 = osc2 ? '0 1px 2px rgba(255,255,255,.55),0 0 18px rgba(255,255,255,.45)' : '0 1px 3px rgba(0,0,0,.45),0 2px 16px rgba(0,0,0,.35)';
      var F = 'html[data-portada-sin-foto] body .footer.footer:not(#psf-b)';
      css.push(F + '{background:' + (c.finOscuro ? 'linear-gradient(rgba(0,0,0,0) 40%,rgba(0,0,0,.30)),' : '') + 'url("' + ff.replace(/"/g, '') + '") center/cover no-repeat!important}');
      css.push(F + '::before, ' + F + '::after{background:none!important;box-shadow:none!important}');
      css.push(F + ' :is(.n, .s, .sm, #fin-frase, #fin-texto, #fin-nombres, #pie-pub){color:' + T2 + '!important;-webkit-text-fill-color:' + T2 + '!important;text-shadow:' + SH2 + '!important}');
    }
    if (!st) { st = document.createElement('style'); st.id = ID_CSS; document.head.appendChild(st); }
    st.textContent = css.join('\n');
  }

  /* ================= LADO PANEL ================= */
  var ID = 'portadasf-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function datos(d) { d.fx = d.fx || {}; d.fx.portadaSinFoto = d.fx.portadaSinFoto || {}; return d.fx.portadaSinFoto; }
  function temas(cb) {
    if (window.INVSTDG_TEMAS) return cb(window.INVSTDG_TEMAS);
    var s = document.createElement('script'); s.src = '/efectos/std-temas.js?v=20261028c';
    s.onload = function () { cb(window.INVSTDG_TEMAS || []); }; s.onerror = function () { cb([]); };
    document.head.appendChild(s);
  }
  /* la muestra del diseño elegido (PRINCIPAL → «Diseño del catálogo») */
  function muestraDe(d) {
    var M = window.MUESTRAS_INVITAME || {}, tpl = String(d.tpl || '');
    var col = String(((d.fx || {}).coleccion) || '');
    /* primero la tabla exacta de las 62 muestras (std-temas.js): plantilla y colección */
    var MD = window.INVSTDG_MUESTRA_DE || {};
    if (MD.tpl && MD.tpl[tpl]) return MD.tpl[tpl];
    if (MD.col && MD.col[col]) return MD.col[col];
    var lista = Object.keys(M).map(function (k) { return M[k]; });
    var m = M[tpl] || M[tpl.toLowerCase()] ||
      lista.filter(function (x) { return x && String(x.nombre || '').toLowerCase() === tpl.toLowerCase(); })[0] ||
      M[col] || M[col.toLowerCase()];
    return (m && m.muestra) || '';
  }
  function construir(d) {
    var caja = document.createElement('div'); caja.id = ID;
    var t = document.createElement('div'); t.textContent = 'Portada sin foto';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    var a = document.createElement('div');
    a.textContent = 'Para el cliente que no quiere poner ninguna foto: la portada usa un fondo del mismo diseño, con la letra en el color que combina.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(t); caja.appendChild(a);
    var fila = document.createElement('div'); fila.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start';
    caja.appendChild(fila);
    var colorW = document.createElement('label');
    colorW.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:12px;margin-top:8px';
    var col = document.createElement('input'); col.type = 'color';
    colorW.appendChild(col); colorW.appendChild(document.createTextNode('Color de la letra de la portada'));
    caja.appendChild(colorW);
    col.oninput = function () { datos(borrador() || d).tinta = col.value; refrescar(); };
    var finW = document.createElement('label');
    finW.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:12px;margin-top:6px';
    var chFin = document.createElement('input'); chFin.type = 'checkbox';
    finW.appendChild(chFin); finW.appendChild(document.createTextNode('La foto final (¡Gracias!) también sin foto, con el otro fondo del diseño'));
    caja.appendChild(finW);
    chFin.onchange = function () { datos(borrador() || d).fin = chFin.checked; refrescar(); };

    function pintar() {
      var c = datos(borrador() || d);
      colorW.style.display = c.fondo ? 'flex' : 'none';
      finW.style.display = c.fondo ? 'flex' : 'none'; chFin.checked = c.fin !== false;
      if (c.tinta) col.value = c.tinta;
      [].forEach.call(fila.children, function (b) { b.style.outline = (b.__v || '') === (c.fondo ? c.cual : '') ? '3px solid #c0567a' : '1px solid rgba(0,0,0,.15)'; });
    }
    function boton(v, txt, img, dd) {
      var b = document.createElement('button'); b.type = 'button'; b.__v = v;
      b.style.cssText = 'width:74px;padding:0;border:0;border-radius:10px;overflow:hidden;background:#fff;cursor:pointer;font-size:11px;line-height:1.2';
      if (img) { var i = document.createElement('img'); i.src = img.replace('w_1080,h_1920', 'w_150,h_266'); i.style.cssText = 'display:block;width:74px;height:131px;object-fit:cover'; b.appendChild(i); }
      else { var x = document.createElement('div'); x.style.cssText = 'width:74px;height:131px;display:flex;align-items:center;justify-content:center;background:#f3ece6;padding:6px;box-sizing:border-box'; x.textContent = 'Con la foto (como siempre)'; b.appendChild(x); }
      var l = document.createElement('div'); l.textContent = txt; l.style.cssText = 'padding:4px 2px'; b.appendChild(l);
      b.onclick = function () {
        var c = datos(borrador() || d);
        if (!dd) { c.fondo = ''; c.cual = ''; }
        else if (sel && sel.value) c.muestra = sel.value;
        else {
          c.fondo = dd.fondo; c.cual = v; c.tinta = dd.tinta; c.oscuro = !!dd.oscuro;
          var otro = (fila.__mios || []).filter(function (x) { return x !== dd; })[0] || dd;
          c.finFondo = otro.fondo; c.finTinta = otro.tinta; c.finOscuro = !!otro.oscuro;
          if (c.fin == null) c.fin = true;
        }
        pintar(); refrescar();
      };
      fila.appendChild(b);
    }
    /* ★ 28/10 (Jazmín: «no me permite colocar una imagen sin foto»): si no se
       reconoce el diseño, o se quieren los fondos de otro, se elige de la lista */
    var gSel = document.createElement('div'); gSel.className = 'grp'; gSel.style.marginTop = '8px';
    var lSel = document.createElement('label'); lSel.textContent = 'Fondos de qué diseño'; gSel.appendChild(lSel);
    var sel = document.createElement('select'); gSel.appendChild(sel);
    caja.insertBefore(gSel, fila);
    temas(function (T) {
      var dd0 = borrador() || d, c0 = datos(dd0);
      var auto = muestraDe(dd0) || String(dd0.slug || '');
      var fams = [], nom = {};
      T.forEach(function (x) { if (/^m-/.test(x.familia || '') && fams.indexOf(x.familia) < 0) { fams.push(x.familia); nom[x.familia] = String(x.nombre || '').split(' · ')[0]; } });
      fams.forEach(function (fm) { var o = document.createElement('option'); o.value = fm.slice(2); o.textContent = nom[fm]; sel.appendChild(o); });
      var ini = c0.muestra || (fams.indexOf('m-' + auto) > -1 ? auto : (fams[0] || '').slice(2));
      sel.value = ini;
      function dibujar(slug) {
        fila.innerHTML = '';
        var mios = T.filter(function (x) { return x.familia === 'm-' + slug && !/-a$/.test(x.id); });
        boton('', 'Con foto', '', null);
        fila.__mios = mios;
        var NOM = { a: 'Detalle abajo', b: 'Detalle arriba', c: 'Marco' };
        mios.forEach(function (x) { var v = x.id.slice(-1); boton(v, NOM[v] || v, x.fondo, x); });
        pintar();
      }
      sel.onchange = function () { datos(borrador() || d).muestra = sel.value; dibujar(sel.value); };
      dibujar(ini);
    });
    return caja;
  }
  function revisarPanel() {
    var d = borrador(); if (!d) return;
    if (document.getElementById(ID)) return;
    var a = window.invCasa ? window.invCasa(ID) : null;
    if (!a) return;
    a.appendChild(construir(d));
  }

  /* ================= ARRANQUE ================= */
  function esPanel() { return !!(borrador() || document.querySelector('.mejoras')); }
  function arrancar() {
    if (esPanel()) { setInterval(revisarPanel, 700); revisarPanel(); return; }
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 300);
    window.addEventListener('message', function () { ultima = null; setTimeout(aplicar, 60); });
  }
  var i = 0;
  var esperar = setInterval(function () {
    if (window.INVEV || esPanel() || ++i > 40) { clearInterval(esperar); arrancar(); }
  }, 250);
})();
