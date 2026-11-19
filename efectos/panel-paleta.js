/* ===== EL SELECTOR DE PALETA, EN EL PANEL =====================================

   Pone arriba de todo del bloque ✨ EFECTOS una grilla con las paletas.
   Se elige una y la invitación entera se repinta: los nombres, los fondos de
   sección, el lacre, los filetes. Es UNA decisión en lugar de nueve campos de
   color sueltos.

   CÓMO CONVIVE CON LOS COLORES A MANO
   Elegir una paleta DEJA CARGADOS los dos campos que sí se editan a mano:

       color                → el principal (nombres, fondos oscuros)
       fx.sobre.selloColor  → el lacre

   Los otros diez colores de la paleta no tienen campo en el panel, así que los
   pinta /efectos/paleta.js y listo.

   Hace falta que los deje cargados: si sólo se guardara el id, en una
   invitación que YA tenía color cargado ese color le ganaría a la paleta
   (ver la nota de precedencia en paleta.js) y se vería como si el selector
   estuviera roto. Cargando el campo queda todo coherente: la paleta lo llena,
   y si después tocás el color a mano, gana el tuyo.

   POR QUÉ ESTÁ ACÁ Y NO DENTRO DE admin.html
   admin.html pesa 150 KB y sólo se puede subir a mano, arrastrándolo. Todo lo
   que se pueda resolver desde /efectos/ se resuelve desde acá.

   POR QUÉ LAS MUESTRAS SE DIBUJAN POR CÓDIGO Y NO SON UNA FOTO
   Porque así NO PUEDEN quedar desfasadas. Si mañana se corrige un color en
   /efectos/paleta.js, la muestra del panel cambia sola. Con una imagen habría
   que acordarse de volver a exportarla, y el día que alguien se olvide, la
   diseñadora va a elegir mirando un color que la invitación ya no usa.

   ⚠️ LA LISTA NO SE ESCRIBE ACÁ. Se lee de window.INVPALETAS, que la publica
   /efectos/paleta.js. Una sola fuente: si se copia, una copia queda vieja.

   ⚠️ `D` (el borrador del panel) NO cuelga de window: es un `const` del script
   principal, así que `window.D` da undefined. El identificador suelto SÍ se ve
   desde un script clásico como éste. Ver la misma nota en panel-pieza.js.
   ============================================================================ */
(function () {

  var ID = 'paleta-selector';

  /* Alto fijo del renglón del nombre: entran dos líneas. Sin esto, las tarjetas
     de nombre corto quedaban más bajas que las de nombre largo y la grilla se
     veía despareja. */
  var ALTO_NOMBRE = 27;

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }

  function buscar(id) {
    var L = window.INVPALETAS || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
    return null;
  }

  function elegida(d) {
    return (d.fx && d.fx.paleta && d.fx.paleta.id) || '';
  }

  function elegir(d, id) {
    if (!d.fx) d.fx = {};
    if (!d.fx.paleta) d.fx.paleta = {};
    d.fx.paleta.id = id || '';

    /* Dejar cargados los dos campos que se editan a mano. Ver la explicación
       de arriba: sin esto, una invitación con color ya cargado ignoraba la
       paleta y parecía que el selector no andaba. */
    var pal = id === 'propia' ? propia(d) : (id ? buscar(id) : null);
    /* la propia también queda en la lista, así los demás bloques del panel (botones, vestimenta…) la encuentran por id */
    if (id === 'propia' && pal && window.INVPALETAS) { var ya = buscar('propia'); if (ya) { for (var k in pal) ya[k] = pal[k]; } else window.INVPALETAS.push(pal); }
    if (pal) {
      d.color = pal.verde;
      if (!d.fx.sobre) d.fx.sobre = {};
      d.fx.sobre.selloColor = pal.seal;
    }

    refrescar();
  }

  /* ★ 19/11/2026 · LA PALETA PROPIA (Jazmín: «poder colocar los colores de los
     clientes»). Cuatro colores —principal, acento, metal y papel— en
     d.fx.paleta.propia; el resto lo arma efectos/paleta.js (INVPALETA_ARMAR),
     que además oscurece lo justo el principal y el acento si no se leen. */
  var ROLES = [['verde', 'Principal', 'nombres, títulos y bandas'], ['sage', 'Acento', 'subtítulos y detalles'], ['oro', 'Metal', 'filetes, lacre y brillos'], ['lino', 'Papel', 'el fondo de la invitación']];
  function propia(d) {
    var o = (d.fx && d.fx.paleta && d.fx.paleta.propia) || {};
    return window.INVPALETA_ARMAR ? window.INVPALETA_ARMAR(o) : null;
  }
  function iniciarPropia(d) {
    d.fx = d.fx || {}; d.fx.paleta = d.fx.paleta || {};
    if (d.fx.paleta.propia && d.fx.paleta.propia.verde) return;
    var base = buscar(elegida(d)) || buscar('salvia-marfil') || {};
    d.fx.paleta.propia = { verde: base.verde || '#3d3329', sage: base.sage || '#8a6a4f', oro: base.oro || '#c2a35f', lino: base.lino || '#f5f1ea' };
  }
  function tarjetaPropia(d, marcada) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    b.title = 'Armar la paleta con los colores del cliente';
    b.style.cssText = estiloTarjeta(marcada, '1px dashed rgba(0,0,0,.3)');
    var tiras = document.createElement('div');
    tiras.style.cssText = 'display:flex;height:34px';
    var p = (d.fx && d.fx.paleta && d.fx.paleta.propia && d.fx.paleta.propia.verde) ? propia(d) : null;
    if (p) [p.verde, p.sage, p.sageCl, p.oro, p.cream].forEach(function (c) { var x = document.createElement('div'); x.style.cssText = 'flex:1;background:' + c; tiras.appendChild(x); });
    else { tiras.style.background = 'conic-gradient(from 90deg,#c4566a,#c2a35f,#61705c,#3f5878,#756786,#c4566a)'; tiras.style.opacity = '.75'; }
    b.appendChild(tiras);
    b.appendChild(renglonNombre('Paleta propia (colores del cliente)', marcada));
    b.onclick = function () { if (!marcada) { iniciarPropia(d); elegir(d, 'propia'); } else elegir(d, ''); pintarGrilla(d); };
    return b;
  }
  function editorPropia(d, caja) {
    var ed = caja.querySelector('[data-propia]'); if (!ed) return;
    if (elegida(d) !== 'propia') { ed.style.display = 'none'; ed.innerHTML = ''; return; }
    ed.style.display = 'block';
    if (ed.__slug !== String(d.slug || '') || !ed.children.length) {
      ed.__slug = String(d.slug || '');
      var o = d.fx.paleta.propia || {};
      ed.innerHTML = '<div style="font-size:12.5px;font-weight:700;margin-bottom:6px">Los colores del cliente</div>' + ROLES.map(function (r) {
        var v = String(o[r[0]] || '#cccccc');
        return '<div style="display:flex;align-items:center;gap:8px;margin:0 0 7px"><input type="color" data-rol="' + r[0] + '" value="' + v + '" style="width:40px;height:30px;padding:0;border:1px solid rgba(0,0,0,.2);border-radius:6px;background:none;cursor:pointer">' +
          '<input type="text" data-rolhex="' + r[0] + '" value="' + v + '" maxlength="7" style="width:86px;font-family:monospace">' +
          '<div style="font-size:12px;line-height:1.25"><b>' + r[1] + '</b><br><span style="opacity:.6">' + r[2] + '</span></div></div>';
      }).join('') + '<div data-propia-nota style="font-size:11px;line-height:1.4;opacity:.75;margin-top:4px"></div>';
      function poner(rol, v) {
        v = String(v || '').trim(); if (!/^#[0-9a-f]{6}$/i.test(v)) return false;
        var dd = borrador() || d; dd.fx.paleta.propia = dd.fx.paleta.propia || {}; dd.fx.paleta.propia[rol] = v.toLowerCase();
        elegir(dd, 'propia'); nota(dd); var g = caja.querySelector('[data-grilla]'); if (g) { var tj = tarjetaPropia(dd, true); var vieja = g.children[1]; if (vieja) g.replaceChild(tj, vieja); }
        return true;
      }
      [].forEach.call(ed.querySelectorAll('[data-rol]'), function (i) {
        i.oninput = function () { var h = ed.querySelector('[data-rolhex="' + i.dataset.rol + '"]'); if (h) h.value = i.value; poner(i.dataset.rol, i.value); };
      });
      [].forEach.call(ed.querySelectorAll('[data-rolhex]'), function (i) {
        i.oninput = function () { var v = i.value.trim(); if (v && v[0] !== '#') v = '#' + v; if (poner(i.dataset.rolhex, v)) { var c = ed.querySelector('[data-rol="' + i.dataset.rolhex + '"]'); if (c) c.value = v; i.style.borderColor = ''; } else i.style.borderColor = '#c0392b'; };
      });
    }
    nota(d);
    function nota(dd) {
      var n = ed.querySelector('[data-propia-nota]'), p = propia(dd); if (!n || !p) return;
      var aj = [];
      if (p.ajustes.indexOf('principal') >= 0) aj.push('el principal quedó en ' + p.verde);
      if (p.ajustes.indexOf('acento') >= 0) aj.push('el acento quedó en ' + p.sage);
      n.textContent = (aj.length ? 'Para que se lea sobre el papel, ' + aj.join(' y ') + ' (mismo tono, más profundo). ' : 'Los cuatro se leen bien sobre el papel. ') +
        'El metal se usa como ' + (p.metal === 'plata' ? 'plata' : 'oro') + '. El resto de los tonos (fondos de sección, texto chico) salen solos de estos cuatro.';
    }
  }

  function estiloTarjeta(marcada, borde) {
    return [
      'display:block', 'width:100%', 'cursor:pointer',
      'background:#fff', 'text-align:left', 'overflow:hidden',
      'border-radius:9px', 'font:inherit',
      'border:' + (marcada ? '2px solid #1c1a17' : borde),
      /* el marcado crece 1px de borde: se compensa para que no salte la grilla */
      'padding:' + (marcada ? '0' : '1px'),
      'box-shadow:' + (marcada ? '0 0 0 3px rgba(0,0,0,.09)' : 'none')
    ].join(';');
  }

  function renglonNombre(texto, marcada) {
    var pie = document.createElement('div');
    pie.textContent = texto;
    pie.style.cssText = [
      'padding:5px 6px 6px', 'font-size:10.5px', 'line-height:1.25',
      'color:#2b2b2b', 'background:#fff',
      'min-height:' + ALTO_NOMBRE + 'px',
      'font-weight:' + (marcada ? '700' : '500')
    ].join(';');
    return pie;
  }

  /* ---- una tarjeta ------------------------------------------------------

     Cinco franjas: el principal (con el que se escriben los nombres), el
     acento, el acento claro, el metálico y la crema de los fondos. Son las
     cinco que de verdad se ven en la invitación; poner las diez hacía una
     tarjeta ilegible de tan finita. ------------------------------------- */
  function tarjeta(d, pal, marcada) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    b.title = pal.nombre;
    b.style.cssText = estiloTarjeta(marcada, '1px solid rgba(0,0,0,.16)');

    var tiras = document.createElement('div');
    tiras.style.cssText = 'display:flex;height:34px';
    [pal.verde, pal.sage, pal.sageCl, pal.oro, pal.cream].forEach(function (c) {
      var t = document.createElement('div');
      t.style.cssText = 'flex:1;background:' + c;
      tiras.appendChild(t);
    });
    b.appendChild(tiras);
    b.appendChild(renglonNombre(pal.nombre, marcada));

    b.onclick = function () {
      elegir(d, marcada ? '' : pal.id);   /* volver a tocarla la apaga */
      pintarGrilla(d);
    };
    return b;
  }

  function tarjetaSinPaleta(d, marcada) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    b.title = 'Elegir cada color a mano';
    b.style.cssText = estiloTarjeta(marcada, '1px dashed rgba(0,0,0,.3)');

    var cuerpo = document.createElement('div');
    cuerpo.textContent = '—';
    cuerpo.style.cssText = 'height:34px;display:flex;align-items:center;justify-content:center;color:#999;font-size:16px;background:repeating-linear-gradient(45deg,#fafafa,#fafafa 5px,#f0f0f0 5px,#f0f0f0 10px)';
    b.appendChild(cuerpo);
    b.appendChild(renglonNombre('Colores a mano', marcada));

    b.onclick = function () { elegir(d, ''); pintarGrilla(d); };
    return b;
  }

  /* ---- la grilla -------------------------------------------------------- */

  function pintarGrilla(d) {
    var caja = document.getElementById(ID);
    if (!caja) return;
    var grilla = caja.querySelector('[data-grilla]');
    if (!grilla) return;

    var sel = elegida(d);
    grilla.innerHTML = '';
    grilla.appendChild(tarjetaSinPaleta(d, !sel));
    grilla.appendChild(tarjetaPropia(d, sel === 'propia'));
    (window.INVPALETAS || []).forEach(function (p) {
      if (p.id === 'propia') return;
      grilla.appendChild(tarjeta(d, p, p.id === sel));
    });
    editorPropia(d, caja);

    var pie = caja.querySelector('[data-elegida]');
    if (pie) {
      var p = sel === 'propia' ? propia(d) : buscar(sel);
      pie.textContent = p
        ? 'Elegida: ' + p.nombre + ' · si después cambiás un color a mano, gana el tuyo'
        : 'Sin paleta: cada color se elige a mano, uno por uno.';
    }
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var titulo = document.createElement('div');
    titulo.textContent = 'La paleta de la invitación';
    titulo.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(titulo);

    var ayuda = document.createElement('div');
    ayuda.textContent = 'Elegí una y se pinta toda la invitación: los nombres, los fondos, el lacre. Después podés retocar cualquier color a mano y va a ganar el tuyo.';
    ayuda.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(ayuda);

    /* ⚠️ el aviso de la colección que manda sobre la paleta (ver avisar()) */
    var aviso = document.createElement('div');
    aviso.setAttribute('data-aviso-col', '1');
    aviso.style.cssText = 'display:none;background:#fff3cd;border:1px solid #ffe08a;border-radius:10px;padding:8px 10px;margin:0 0 10px;font-size:12px;color:#7a5c00;line-height:1.4';
    caja.appendChild(aviso);

    /* Sin tope de alto a propósito: se elige MIRANDO, y una grilla que corta la
       última fila por la mitad obliga a descubrir que hay más abajo. Son cuatro
       renglones, entran. */
    var grilla = document.createElement('div');
    grilla.setAttribute('data-grilla', '1');
    grilla.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:7px;padding:2px';
    caja.appendChild(grilla);

    var edp = document.createElement('div');
    edp.setAttribute('data-propia', '1');
    edp.style.cssText = 'display:none;margin-top:10px;padding:10px 12px;border:1px solid rgba(0,0,0,.1);border-radius:10px;background:#fcfaf8';
    caja.appendChild(edp);

    var pie = document.createElement('div');
    pie.setAttribute('data-elegida', '1');
    pie.style.cssText = 'font-size:11px;opacity:.7;margin-top:9px;line-height:1.35';
    caja.appendChild(pie);

    return caja;
  }

  /* ⚠️⚠️ LA COLECCIÓN TAPA LA PALETA, Y NO SE AVISABA. (29/9/2026)
     Jazmín: «se muestra la misma miniatura para diferentes paletas».
     Medido en el panel, colección por colección, eligiendo tres paletas y
     comparando los colores de la miniatura: sólo «Sin colección», Perlas y
     Bohemia cambian con la paleta. Las demás (Sapo, Cenicienta, los Óleos,
     los Degradé…) traen sus propios colores y la paleta no hace nada.
     No se fuerza: esas colecciones son un dibujo con colores pensados.
     Se AVISA y se apaga la grilla, así nadie elige una paleta que no se ve.
     ⚠️ Si una colección aprende a tomar la paleta, se suma a esta lista. */
  var TOMAN_PALETA = { '': 1, 'perlas': 1, 'bohemia': 1 };
  function avisar(d) {
    var caja = document.getElementById(ID); if (!caja) return;
    var av = caja.querySelector('[data-aviso-col]'), gr = caja.querySelector('[data-grilla]');
    var col = String((d.fx && d.fx.coleccion) || '');
    /* la casilla va en TODA colección (Jazmín: «esto no lo encuentro»: estaba
       en Bohemia, que no la mostraba). En Perlas y Bohemia la grilla anda igual. */
    var propia = !!col;
    /* ★ 28/10/2026 (Maki: «debería tener una paleta de colores como todo y
       listo»). Antes la grilla se apagaba con un aviso. Ahora hay una casilla:
       «Pintar también la colección con la paleta» (fx.paleta.coleccion) y la
       pinta /efectos/paleta-coleccion.js, en cualquier colección. */
    var manda = !!(d.fx && d.fx.paleta && d.fx.paleta.coleccion === true);
    var tapa = !TOMAN_PALETA[col] && !manda;
    var chk = caja.querySelector('[data-pal-col]');
    if (!chk) {
      chk = document.createElement('label'); chk.setAttribute('data-pal-col', '1');
      chk.style.cssText = 'display:flex;align-items:flex-start;gap:8px;font-size:12.5px;font-weight:600;margin:0 0 10px;line-height:1.35;cursor:pointer';
      var ib = document.createElement('input'); ib.type = 'checkbox'; ib.style.marginTop = '2px';
      ib.onchange = function () {
        var dd = borrador() || d; dd.fx = dd.fx || {}; dd.fx.paleta = dd.fx.paleta || {};
        dd.fx.paleta.coleccion = ib.checked; refrescar(); avisar(dd);
      };
      chk.appendChild(ib);
      var tx = document.createElement('span');
      tx.textContent = 'Pintar también la colección con la paleta (la tinta, el papel y el metal del diseño pasan a los colores de la paleta)';
      chk.appendChild(tx);
      av.parentNode.insertBefore(chk, av.nextSibling);
    }
    chk.style.display = propia ? 'flex' : 'none';
    chk.querySelector('input').checked = manda;
    if (av) {
      av.style.display = propia ? 'block' : 'none';
      if (propia) {
        var s = document.querySelector('#coleccion-selector select'), nom = col;
        if (s) { var o = [].find.call(s.options, function (x) { return x.value === col; }); if (o) nom = o.textContent; }
        av.textContent = manda
          ? 'La colección «' + nom + '» se pinta con la paleta elegida. Las fotos y texturas del diseño no cambian: si el papel de fondo no combina, cambialo en «El fondo de la invitación».'
          : (TOMAN_PALETA[col]
             ? 'La colección «' + nom + '» toma algunos colores de la paleta. Para que la paleta pinte TODO el diseño (tinta, papel y metal), marcá la casilla de abajo.'
             : 'La colección «' + nom + '» trae sus propios colores. Para que la paleta la pinte, marcá la casilla de abajo.');
      }
    }
    if (gr) { gr.style.opacity = tapa ? '.4' : ''; gr.style.pointerEvents = tapa ? 'none' : ''; }
  }

  /* ---- engancharse al panel --------------------------------------------- */

  function revisar() {
    var d = borrador();
    if (!d || !window.INVPALETAS) return;
    var ya = document.getElementById(ID);
    if (ya) {
      /* ⚠️ 28/10: el panel arranca con un borrador de fábrica y después carga el
         evento (mismo objeto D): la grilla quedaba marcando la paleta de fábrica. */
      var f = String(d.slug || '') + '|' + String((d.fx && d.fx.paleta && d.fx.paleta.id) || '');
      if (ya.__f !== f) { ya.__f = f; pintarGrilla(d); }
      avisar(d); return;
    }

    /* la casa de este bloque la decide el panel (invCasa en admin/3-evento.js):
       antes se colgaba del primer «.mejoras» y salía en cinco pestañas */
    var m = window.invCasa ? window.invCasa(ID) : document.querySelector('.mejoras');
    if (!m) return;                               /* la pestaña no está abierta */

    /* Va PRIMERO: es la decisión más grande del bloque, y todo lo que viene
       abajo (los colores sueltos) queda supeditado a ella. */
    m.insertBefore(construir(d), m.firstChild);
    pintarGrilla(d);
    avisar(d);
  }

  /* El panel se redibuja entero cada vez que se toca algo y se lleva puesto lo
     que hayamos insertado; por eso se revisa seguido. Es barato: si ya está,
     la función sale en la tercera línea. Mismo patrón que panel-pieza.js. */
  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t);
      setInterval(revisar, 700);
      revisar();
    }
    if (++n > 60) clearInterval(t);               /* no es un panel: no hacemos nada */
  }, 500);
})();
