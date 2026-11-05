/* ===== EL SELECTOR DE SOBRES DEL PANEL, LLENO ================================

   EL BUG, que estuvo escondido mucho tiempo
   En ✨ Efectos → «Sobre del catálogo» hay un `<select>` que tiene que listar
   los sobres de `/sobres/catalogo.js`. Estaba **vacío**: la única opción era
   «— Elegí un sobre —». O sea que, desde el panel, **no se podía elegir ningún
   sobre de entrada**. Nunca.

   POR QUÉ
   El admin hace, arriba de todo y una sola vez:

       const SOBRES = window.SOBRES_INVITAME || {};

   Esa línea corre cuando el navegador lee el script del HTML. Pero
   `catalogo.js` se carga aparte y llega DESPUÉS. Cuando llega, `SOBRES` ya
   quedó congelado en `{}` — es una copia, no una referencia — y ningún
   `renderPanel()` posterior la vuelve a mirar.

   ⚠️ LA TRAMPA GENERAL: `const X = window.Y || {}` al principio de un archivo
      congela el valor. Si `Y` lo publica otro script que llega después, X se
      queda vacío para siempre y **no hay error**: sólo una lista vacía. Esto
      ya pasó acá; si aparece otra lista vacía en el panel, mirar esto primero.

   POR QUÉ SE ARREGLA DESDE ACÁ Y NO EN EL HTML
   `admin.html` pesa 200 KB y se sube a mano. Un módulo de /efectos/ hace el
   mismo trabajo, se carga solo y no obliga a tocarlo.

   QUÉ HACE
   Busca el `<select>` cuyo `onchange` escribe `sobre.modelo` —esa es la firma,
   no depende de textos ni de posiciones— y le pone las opciones que faltan,
   leyendo `window.SOBRES_INVITAME` en el momento. Respeta el valor que ya
   estaba puesto.

   ⚠️ Se repasa cada 600 ms a propósito: el panel llama a `renderPanel()` en
      cada cambio y REEMPLAZA el HTML entero, así que el select vuelve a nacer
      vacío una y otra vez. No alcanza con llenarlo una vez.

   ⚠️ El selector de sobres NO toca `fx`. Sólo dibuja opciones. El que guarda es
      el `onchange` que ya tenía el panel.

   ───────────────────────────────────────────────────────────────────────────
   Y ADEMÁS: EL LACRE  (4/9/2026)

   El motor lee CUATRO campos del lacre —`sello`, `emblema`, `ini` y
   `selloColor`— y NINGUNO tenía control en el panel. Se pagó caro: la muestra
   oficial `camila-y-tomas` salió publicada con `sello:false`, o sea con el
   lacre del sobre VACÍO. Es lo primero que ve cualquiera que abre la
   invitación, y no había forma de arreglarlo sin entrar a la base.

   Va acá adentro, y no en un archivo nuevo, a propósito: el sobre es UNA cosa
   y tiene que tener UN bloque. Menos archivos sueltos, menos que recordar.

   ⚠️ EL LACRE DE LA FOTO Y LAS LETRAS SON DOS COSAS DISTINTAS
      Los sobres del catálogo traen el lacre FOTOGRAFIADO (una gota de cera de
      verdad, con su relieve). Lo que este bloque prende no es esa cera: es la
      capa `.seal`, que es transparente y sólo escribe las iniciales ENCIMA. Por
      eso apagarla deja la cera muda, no la saca.

   ⚠️ `sello` VIENE PRENDIDO POR DEFECTO en el motor (`sello:true`). Al apagarlo
      hay que escribir `false` de verdad, no borrar la clave.

   ⚠️ `emblema` manda sobre `ini`: si dice 'corazon' o 'anillos', el motor
      dibuja ❤ o ⚭ y las iniciales no se ven. Por eso el campo de las iniciales
      se esconde cuando no corresponde.
   ============================================================================ */
(function () {

  function catalogo() {
    var c = window.SOBRES_INVITAME;
    return (c && typeof c === 'object') ? c : null;
  }

  /* la firma: es el único select del panel que escribe sobre.modelo */
  function selector() {
    var todos = document.querySelectorAll('select[onchange]');
    for (var i = 0; i < todos.length; i++) {
      var h = todos[i].getAttribute('onchange') || '';
      if (h.indexOf('sobre.modelo') >= 0) return todos[i];
    }
    return null;
  }

  function llenar() {
    var sel = selector();
    if (!sel) return;
    var cat = catalogo();
    if (!cat) return;

    /* ★ 22/10: los sobres con `oculto:true` (versiones viejas que siguen andando
       en invitaciones entregadas) NO se ofrecen — salvo el que ya tiene elegido
       esta invitación. Con las cuatro versiones del olivo con casi el mismo
       nombre, Jazmín no encontraba la buena. */
    var actual = '';
    try { actual = ((D.fx || {}).sobre || {}).modelo || ''; } catch (e) {}
    var claves = Object.keys(cat).filter(function (k) { return !(cat[k] && cat[k].oculto) || k === actual || k === sel.value; });
    if (!claves.length) return;

    /* ¿ya está lleno? no lo toco: si lo redibujo pierdo el foco y el desplegable
       se cierra solo mientras Jazmín lo está mirando */
    if (sel.getAttribute('data-n') === String(claves.length) && sel.options.length > claves.length) return;

    var elegido = sel.value;
    /* si el select nació vacío, el valor de verdad está en el borrador */
    if (!elegido) {
      try {
        elegido = ((D.fx || {}).sobre || {}).modelo || '';
      } catch (e) { elegido = ''; }
    }

    var html = '<option value="">— Elegí un sobre —</option>';
    claves.forEach(function (k) {
      var nombre = (cat[k] && cat[k].nombre) ? cat[k].nombre : k;
      html += '<option value="' + k + '"' + (k === elegido ? ' selected' : '') + '>' +
              String(nombre).replace(/</g, '&lt;') + '</option>';
    });
    sel.innerHTML = html;
    sel.setAttribute('data-n', String(claves.length));
    if (elegido) sel.value = elegido;
  }

  /* ===== EL LACRE ============================================================ */

  var ID_LACRE = 'lacre-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* ⚠️ se llama de nuevo en cada handler: el panel REEMPLAZA D.fx cuando llega
     el evento, y una referencia vieja queda huérfana (parece que guarda y no
     guarda). Misma nota que en panel-carta.js y panel-itinerario.js. */
  function datosSobre(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.sobre) d.fx.sobre = {};
    return d.fx.sobre;
  }

  function chico(el, css) { el.style.cssText = css; return el; }

  function construirLacre(d) {
    var caja = document.createElement('div');
    caja.id = ID_LACRE;
    caja.style.cssText = 'margin:14px 0 4px;padding:12px 0 0;border-top:1px solid rgba(0,0,0,.10)';

    var t = chico(document.createElement('div'),
      'font-size:13px;font-weight:600;margin-bottom:2px');
    t.textContent = 'El lacre del sobre';
    caja.appendChild(t);

    var a = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35');
    a.textContent = 'La cera ya viene en la foto del sobre. Acá se elige qué se escribe encima.';
    caja.appendChild(a);

    /* ---- mostrar o no ---- */
    var filaOn = chico(document.createElement('label'),
      'display:flex;align-items:center;gap:7px;font-size:12px;margin:0 0 10px;cursor:pointer');
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = (datosSobre(d).sello !== false);
    chk.onchange = function () {
      datosSobre(borrador() || d).sello = chk.checked ? true : false;
      acomodar(); refrescar();
    };
    filaOn.appendChild(chk);
    filaOn.appendChild(document.createTextNode('Escribir sobre el lacre'));
    caja.appendChild(filaOn);

    /* 23/10/2026 (citlalli): «el sobre se debe mirar completo, no abarca toda la
       pantalla… con un fondo». Lo pinta efectos/sobre-completo.js */
    var filaCo = chico(document.createElement('label'),
      'display:flex;gap:7px;align-items:center;font-size:12.5px;margin:0 0 10px;cursor:pointer');
    var chkCo = document.createElement('input'); chkCo.type = 'checkbox';
    chkCo.checked = !!datosSobre(d).completo;
    chkCo.onchange = function () { datosSobre(borrador() || d).completo = chkCo.checked; refrescar(); };
    filaCo.appendChild(chkCo);
    filaCo.appendChild(document.createTextNode('En el celular, el sobre entero (sin recortar), con el fondo de la invitación alrededor'));
    caja.appendChild(filaCo);

    var cuerpo = document.createElement('div');
    caja.appendChild(cuerpo);

    /* ---- qué lleva ---- */
    var fEm = chico(document.createElement('div'), 'margin:0 0 10px');
    var lEm = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lEm.textContent = 'Qué lleva';
    fEm.appendChild(lEm);
    var selEm = chico(document.createElement('select'), 'width:100%');
    [['iniciales', 'Las iniciales'],
     ['corazon',   'Un corazón'],
     ['anillos',   'Dos anillos']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      selEm.appendChild(op);
    });
    selEm.value = datosSobre(d).emblema || 'iniciales';
    selEm.onchange = function () {
      datosSobre(borrador() || d).emblema = selEm.value;
      acomodar(); refrescar();
    };
    fEm.appendChild(selEm);
    cuerpo.appendChild(fEm);

    /* ---- las iniciales ---- */
    var fIni = chico(document.createElement('div'), 'margin:0 0 10px');
    var lIni = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lIni.textContent = 'Las iniciales';
    fIni.appendChild(lIni);
    var iIni = document.createElement('input');
    iIni.type = 'text'; iIni.placeholder = 'C&T';
    iIni.value = datosSobre(d).ini || '';
    iIni.style.cssText = 'width:100%';
    iIni.oninput = function () { datosSobre(borrador() || d).ini = iIni.value; refrescar(); };
    fIni.appendChild(iIni);
    var hIni = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-top:3px;line-height:1.35');
    hIni.textContent = 'Cortitas: dos o tres letras. Se escriben en cursiva sobre la cera.';
    fIni.appendChild(hIni);
    cuerpo.appendChild(fIni);

    /* ---- color de las letras ---- */
    var fCol = chico(document.createElement('div'), 'margin:0 0 4px');
    var lCol = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lCol.textContent = 'Color de las letras';
    fCol.appendChild(lCol);
    var filaCol = chico(document.createElement('div'), 'display:flex;align-items:center;gap:6px');
    var iCol = document.createElement('input');
    iCol.type = 'color';
    iCol.value = datosSobre(d).selloColor || '#8d7f74';
    iCol.style.cssText = 'width:46px;height:32px;padding:0;border:0;background:none;cursor:pointer';
    iCol.oninput = function () { datosSobre(borrador() || d).selloColor = iCol.value; refrescar(); };
    var bCol = chico(document.createElement('button'),
      'cursor:pointer;padding:4px 8px;font-size:11.5px');
    bCol.type = 'button'; bCol.textContent = 'Sacar';
    bCol.title = 'Volver al color de la colección';
    bCol.onclick = function () { datosSobre(borrador() || d).selloColor = ''; refrescar(); };
    filaCol.appendChild(iCol); filaCol.appendChild(bCol);
    fCol.appendChild(filaCol);
    cuerpo.appendChild(fCol);

    function acomodar() {
      var c = datosSobre(borrador() || d);
      var prendido = (c.sello !== false);
      cuerpo.style.opacity = prendido ? '1' : '.42';
      cuerpo.style.pointerEvents = prendido ? '' : 'none';
      /* con corazón o anillos, las iniciales no se ven: no tiene sentido pedirlas */
      fIni.style.display = ((c.emblema || 'iniciales') === 'iniciales') ? '' : 'none';
    }
    acomodar();

    caja.__sync = function () {
      var dd = borrador(); if (!dd) return;
      if (document.activeElement && caja.contains(document.activeElement)) return;
      var c = datosSobre(dd);
      var quiero = (c.sello !== false);
      if (chk.checked !== quiero) chk.checked = quiero;
      var em = c.emblema || 'iniciales';
      if (selEm.value !== em) selEm.value = em;
      if (iIni.value !== (c.ini || '')) iIni.value = c.ini || '';
      if (c.selloColor && iCol.value !== c.selloColor) iCol.value = c.selloColor;
      acomodar();
    };

    return caja;
  }

  /* se monta pegado al selector de sobres: es el mismo tema y la misma pestaña.
     ⚠️ el panel redibuja su HTML en cada cambio, así que hay que revisar seguido
     si el bloque sigue puesto. */
  function revisarLacre() {
    var d = borrador(); if (!d) return;
    var ya = document.getElementById(ID_LACRE);
    if (ya && document.body.contains(ya)) { if (ya.__sync) ya.__sync(); return; }
    var sel = selector(); if (!sel) return;
    var anclaje = sel.closest ? (sel.closest('.grp') || sel.parentElement) : sel.parentElement;
    if (!anclaje || !anclaje.parentNode) return;
    var g = document.getElementById(ID_GRILLA);
    if (g && g.parentNode === anclaje.parentNode) anclaje = g;
    anclaje.parentNode.insertBefore(construirLacre(d), anclaje.nextSibling);
  }

  /* ===== EL CATÁLOGO CON FOTOS (5/11/2026) ===================================
     Jazmín: «en el sector para elegir el sobre… en vez de que aparezcan así
     [una lista de texto], se podrá hacer un catálogo para que se puedan
     visualizar? Algo así como en las muestras de las invis».

     Debajo del select va una grilla con la foto (poster) de cada sobre, un
     buscador y el nombre. Tocar una tarjeta es lo mismo que elegir en el
     select: se le pone el valor y se dispara SU onchange (el del panel, que
     guarda en D.fx.sobre.modelo, refresca la miniatura y redibuja). Así hay
     UN solo camino de guardado. El select queda igual, como respaldo.

     ⚠️ El panel redibuja todo en cada cambio: la grilla es UN nodo que se
        vuelve a enganchar (no se rearma), así no pierde la búsqueda ni el
        scroll, ni vuelve a pedir las 190 fotos.
     ⚠️ Las fotos van con loading=lazy y, si son imágenes de Cloudinary, se
        piden achicadas (w_260). Los posters de video ya vienen con su medida.
     ======================================================================== */

  var ID_GRILLA = 'sobres-grilla';
  var grilla = null, grillaN = -1;

  function miniatura(u) {
    u = String(u || '');
    if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(u) && !/\/upload\/[a-z]{1,3}_[^/]*\//.test(u)) {
      return u.replace('/image/upload/', '/image/upload/w_260,c_limit,q_auto,f_auto/');
    }
    return u;
  }

  function partes(nombre) {
    var n = String(nombre || '');
    var tipo = /\(video\)\s*$/i.test(n) ? 'video' : (/\(foto\)\s*$/i.test(n) ? 'foto' : '');
    n = n.replace(/\s*\((video|foto)\)\s*$/i, '');
    var i = n.indexOf(' · ');
    return { titulo: i > 0 ? n.slice(0, i) : n, det: i > 0 ? n.slice(i + 3) : '', tipo: tipo };
  }

  function sinAcentos(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function cssGrilla() {
    if (document.getElementById(ID_GRILLA + '-css')) return;
    var s = document.createElement('style');
    s.id = ID_GRILLA + '-css';
    s.textContent =
      '#' + ID_GRILLA + '{margin:10px 0 6px}' +
      '#' + ID_GRILLA + ' .sg-bus{width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid rgba(0,0,0,.18);border-radius:8px;font-size:12.5px;margin:0 0 8px}' +
      '#' + ID_GRILLA + ' .sg-caja{max-height:460px;overflow:auto;padding:2px;border-radius:10px;background:rgba(0,0,0,.035)}' +
      '#' + ID_GRILLA + ' .sg-lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px;padding:6px}' +
      '#' + ID_GRILLA + ' .sg-t{all:unset;box-sizing:border-box;display:flex;flex-direction:column;cursor:pointer;background:#fff;border-radius:9px;overflow:hidden;' +
        'box-shadow:0 1px 3px rgba(0,0,0,.12);border:2px solid transparent;transition:transform .12s,border-color .12s}' +
      '#' + ID_GRILLA + ' .sg-t:hover{transform:translateY(-2px)}' +
      '#' + ID_GRILLA + ' .sg-t.si{border-color:#2f6fed;box-shadow:0 0 0 2px rgba(47,111,237,.25)}' +
      '#' + ID_GRILLA + ' .sg-f{position:relative;aspect-ratio:9/16;background:#e9e4dc}' +
      '#' + ID_GRILLA + ' .sg-f img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}' +
      '#' + ID_GRILLA + ' .sg-tag{position:absolute;left:5px;top:5px;font:600 9.5px/1 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;' +
        'background:rgba(0,0,0,.55);color:#fff;padding:3px 5px;border-radius:4px}' +
      '#' + ID_GRILLA + ' .sg-ok{position:absolute;right:5px;top:5px;width:20px;height:20px;border-radius:50%;background:#2f6fed;color:#fff;font:700 12px/20px system-ui;text-align:center;display:none}' +
      '#' + ID_GRILLA + ' .sg-t.si .sg-ok{display:block}' +
      '#' + ID_GRILLA + ' .sg-n{padding:6px 7px 7px;font:600 11.5px/1.25 system-ui,sans-serif;color:#222}' +
      '#' + ID_GRILLA + ' .sg-d{display:block;font-weight:400;font-size:10.5px;opacity:.65;margin-top:2px;' +
        'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
      '#' + ID_GRILLA + ' .sg-vacio{padding:18px;text-align:center;font-size:12px;opacity:.6;grid-column:1/-1}';
    document.head.appendChild(s);
  }

  function armarGrilla(cat, claves) {
    cssGrilla();
    var caja = document.createElement('div');
    caja.id = ID_GRILLA;
    var bus = document.createElement('input');
    bus.type = 'search'; bus.className = 'sg-bus';
    bus.placeholder = 'Buscar sobre (mariposas, olivo, lacre, video…)';
    var marco = document.createElement('div'); marco.className = 'sg-caja';
    marco.addEventListener('scroll', function () { caja.__top = marco.scrollTop; });
    var lista = document.createElement('div'); lista.className = 'sg-lista';
    marco.appendChild(lista);
    caja.appendChild(bus); caja.appendChild(marco);

    claves.forEach(function (k) {
      var s = cat[k] || {}, p = partes(s.nombre || k);
      var t = document.createElement('button');
      t.type = 'button'; t.className = 'sg-t'; t.setAttribute('data-k', k);
      t.setAttribute('data-q', sinAcentos(k + ' ' + (s.nombre || '')));
      t.title = s.nombre || k;
      var f = document.createElement('div'); f.className = 'sg-f';
      var img = document.createElement('img');
      img.loading = 'lazy'; img.decoding = 'async'; img.alt = '';
      img.src = miniatura(s.poster || s.img || '');
      img.onerror = function () { img.style.display = 'none'; };
      f.appendChild(img);
      if (p.tipo) { var tg = document.createElement('span'); tg.className = 'sg-tag'; tg.textContent = p.tipo; f.appendChild(tg); }
      var ok = document.createElement('span'); ok.className = 'sg-ok'; ok.textContent = '✓'; f.appendChild(ok);
      var n = document.createElement('div'); n.className = 'sg-n'; n.textContent = p.titulo;
      if (p.det) { var dd = document.createElement('span'); dd.className = 'sg-d'; dd.textContent = p.det; n.appendChild(dd); }
      t.appendChild(f); t.appendChild(n);
      t.onclick = function () {
        var sel = selector(); if (!sel) return;
        if (!sel.querySelector('option[value="' + k + '"]')) llenar();
        sel.value = k;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        marcar();
      };
      lista.appendChild(t);
    });
    var vacio = document.createElement('div'); vacio.className = 'sg-vacio';
    vacio.textContent = 'Ningún sobre coincide con la búsqueda.'; vacio.style.display = 'none';
    lista.appendChild(vacio);

    bus.oninput = function () {
      var q = sinAcentos(bus.value).trim().split(/\s+/).filter(Boolean), vistos = 0;
      lista.querySelectorAll('.sg-t').forEach(function (t) {
        var dq = t.getAttribute('data-q');
        var si = q.every(function (w) { return dq.indexOf(w) >= 0; });
        t.style.display = si ? '' : 'none'; if (si) vistos++;
      });
      vacio.style.display = vistos ? 'none' : '';
    };
    caja.__marco = marco;
    return caja;
  }

  function marcar() {
    if (!grilla) return;
    var actual = '';
    try { actual = ((D.fx || {}).sobre || {}).modelo || ''; } catch (e) {}
    grilla.querySelectorAll('.sg-t').forEach(function (t) {
      t.classList.toggle('si', t.getAttribute('data-k') === actual);
    });
  }

  function revisarGrilla() {
    var sel = selector();
    if (!sel) return;
    var cat = catalogo(); if (!cat) return;
    var actual = '';
    try { actual = ((D.fx || {}).sobre || {}).modelo || ''; } catch (e) {}
    var claves = Object.keys(cat).filter(function (k) { return !(cat[k] && cat[k].oculto) || k === actual; });
    if (!grilla || grillaN !== claves.length) {
      var viejo = grilla;
      grilla = armarGrilla(cat, claves); grillaN = claves.length;
      if (viejo && viejo.parentNode) viejo.parentNode.removeChild(viejo);
    }
    var anclaje = sel.closest ? (sel.closest('.grp') || sel.parentElement) : sel.parentElement;
    if (!anclaje || !anclaje.parentNode) return;
    if (grilla.parentNode !== anclaje.parentNode || grilla.previousSibling !== anclaje) {
      anclaje.parentNode.insertBefore(grilla, anclaje.nextSibling);
      if (grilla.__marco && grilla.__top) grilla.__marco.scrollTop = grilla.__top;
      var lac = document.getElementById(ID_LACRE);
      if (lac && lac.parentNode === grilla.parentNode && lac.previousSibling !== grilla) {
        grilla.parentNode.insertBefore(lac, grilla.nextSibling);
      }
    }
    marcar();
  }

  function arrancar() {
    llenar();
    setInterval(llenar, 600);
    revisarGrilla();
    setInterval(revisarGrilla, 500);
    /* el panel redibuja al elegir: se vuelve a enganchar en el mismo cuadro, sin parpadeo */
    var pend = false;
    try {
      new MutationObserver(function () {
        if (pend) return; pend = true;
        requestAnimationFrame(function () { pend = false; revisarGrilla(); });
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    revisarLacre();
    setInterval(revisarLacre, 700);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
