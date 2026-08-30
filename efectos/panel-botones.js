/* ===== EL SELECTOR DE ESTILO DE BOTÓN, EN EL PANEL ============================

   Va debajo del selector de paletas, dentro del bloque ✨ EFECTOS.

   LAS MUESTRAS SON BOTONES DE VERDAD, NO DIBUJOS DE BOTONES.
   Cada tarjeta tiene adentro un `.inv-prev-btn`, y ese selector está en la
   lista de /efectos/botones.js. O sea: la muestra se pinta con EXACTAMENTE el
   mismo CSS que el botón de la invitación. Si mañana se corrige un estilo, la
   muestra se corrige sola.

   ⚠️ CADA MUESTRA LLEVA LOS COLORES DE LA PALETA ELEGIDA.  ← esto costó un bug
      El panel NO tiene las variables de color de la invitación. Sin ellas,
      lacre y esmalte salían con la letra clara sobre fondo claro: ilegibles.
      Ahora la tarjeta las lleva puestas, tomadas de la paleta que esté elegida
      en el selector de arriba. Además de arreglar la legibilidad, hace que la
      muestra sea de verdad lo que vas a ver — el mismo material se ve distinto
      según la paleta.

   ⚠️ LA LISTA NO SE ESCRIBE ACÁ. Se lee de window.INVBOTONES.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
   Ver la misma nota en panel-pieza.js.
   ============================================================================ */
(function () {

  var ID = 'boton-selector';

  /* Los mismos valores que trae la invitación de fábrica. Se usan cuando no hay
     paleta elegida, para que la muestra igual se vea como se va a ver. */
  var POR_DEFECTO = {
    verde:'#2e433c', verde2:'#26372f', sage:'#7f9079', sageCl:'#a9b8a0',
    oro:'#b9a56a', lino:'#f4efe6', lino2:'#faf7f1', cream:'#eef0e9', muted:'#7d857a'
  };

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function elegido(d) {
    return (d.fx && d.fx.boton && d.fx.boton.estilo) || '';
  }
  function paletaElegida(d) {
    return (d.fx && d.fx.paleta && d.fx.paleta.id) || '';
  }
  function elegir(d, id) {
    if (!d.fx) d.fx = {};
    if (!d.fx.boton) d.fx.boton = {};
    d.fx.boton.estilo = id || '';
    refrescar();
  }
  function buscar(id) {
    var L = window.INVBOTONES || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
    return null;
  }

  /* las variables de color que necesita cada material, en texto CSS */
  function colores(d) {
    var p = POR_DEFECTO, id = paletaElegida(d), L = window.INVPALETAS || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) { p = L[i]; break; }
    return '--verde:' + p.verde + ';--verde2:' + (p.verde2 || p.verde) +
           ';--sage:' + p.sage + ';--sage-cl:' + (p.sageCl || p.sage) +
           ';--oro:' + p.oro + ';--lino:' + (p.lino || '#f4efe6') +
           ';--lino2:' + (p.lino2 || '#faf7f1') + ';--cream:' + p.cream +
           ';--muted:' + (p.muted || '#7d857a') + ';';
  }

  function asegurarBase() {
    if (document.getElementById('inv-prev-base')) return;
    var s = document.createElement('style');
    s.id = 'inv-prev-base';
    s.textContent =
      '.inv-prev-btn{display:inline-block;padding:10px 18px;border-radius:999px;' +
      'font:600 11px/1.1 system-ui,sans-serif;letter-spacing:.06em;border:0;' +
      'background:#e9e9ee;color:#333;white-space:nowrap}';
    (document.head || document.documentElement).appendChild(s);
  }

  function marco(marcada, borde) {
    return [
      'display:block', 'width:100%', 'cursor:pointer', 'background:#fff',
      'text-align:center', 'border-radius:10px', 'font:inherit', 'overflow:hidden',
      'padding:' + (marcada ? '0' : '1px'),
      'border:' + (marcada ? '2px solid #1c1a17' : borde),
      'box-shadow:' + (marcada ? '0 0 0 3px rgba(0,0,0,.09)' : 'none')
    ].join(';');
  }

  function rotulo(texto, marcada) {
    var p = document.createElement('div');
    p.textContent = texto;
    p.style.cssText = 'padding:6px 6px 7px;font-size:10.5px;line-height:1.25;color:#2b2b2b;' +
                      'background:#fff;min-height:26px;font-weight:' + (marcada ? '700' : '500');
    return p;
  }

  function tarjeta(d, est, marcada) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    b.title = est.pie || est.nombre;
    b.style.cssText = marco(marcada, '1px solid rgba(0,0,0,.16)');

    /* el envoltorio lleva el atributo Y los colores de la paleta: adentro va un
       botón de verdad, pintado por la hoja de botones.js */
    var caja = document.createElement('div');
    caja.setAttribute('data-boton', est.id);
    caja.style.cssText = colores(d) +
      'padding:15px 8px 13px;background:var(--cream);' +
      'display:flex;align-items:center;justify-content:center;min-height:56px';
    var m = document.createElement('span');
    m.className = 'inv-prev-btn';
    m.textContent = 'Confirmar';
    caja.appendChild(m);
    b.appendChild(caja);
    b.appendChild(rotulo(est.nombre, marcada));

    b.onclick = function () { elegir(d, marcada ? '' : est.id); pintar(d); };
    return b;
  }

  function tarjetaSin(d, marcada) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    b.title = 'Los botones de siempre';
    b.style.cssText = marco(marcada, '1px dashed rgba(0,0,0,.3)');
    var caja = document.createElement('div');
    caja.style.cssText = 'padding:15px 8px 13px;min-height:56px;display:flex;align-items:center;' +
      'justify-content:center;background:repeating-linear-gradient(45deg,#fafafa,#fafafa 5px,#f0f0f0 5px,#f0f0f0 10px)';
    var m = document.createElement('span');
    m.className = 'inv-prev-btn';
    m.textContent = 'Confirmar';
    caja.appendChild(m);
    b.appendChild(caja);
    b.appendChild(rotulo('Como está hoy', marcada));
    b.onclick = function () { elegir(d, ''); pintar(d); };
    return b;
  }

  var ultimaPaleta = null;

  function pintar(d) {
    var caja = document.getElementById(ID);
    if (!caja) return;
    var g = caja.querySelector('[data-grilla]');
    if (!g) return;
    ultimaPaleta = paletaElegida(d);
    var sel = elegido(d);
    g.innerHTML = '';
    g.appendChild(tarjetaSin(d, !sel));
    (window.INVBOTONES || []).forEach(function (e) {
      g.appendChild(tarjeta(d, e, e.id === sel));
    });
    var pie = caja.querySelector('[data-pie]');
    if (pie) {
      var e = buscar(sel);
      if (!e) {
        pie.textContent = 'Sin estilo: los botones quedan como están hoy.';
      } else if (e.necesitaArchivo) {
        pie.textContent = 'Elegido: ' + e.nombre + ' · ⚠ necesita el archivo ' +
                          e.necesitaArchivo + ' subido al repo, si no se ve sin la tela.';
      } else {
        pie.textContent = 'Elegido: ' + e.nombre + ' · ' + (e.pie || '');
      }
    }
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'El material de los botones';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Cambia todos los botones de la invitación de una vez. Los colores los toma de la paleta de arriba, así que si cambiás la paleta, las muestras se repintan solas.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var g = document.createElement('div');
    g.setAttribute('data-grilla', '1');
    g.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px;padding:2px';
    caja.appendChild(g);

    var pie = document.createElement('div');
    pie.setAttribute('data-pie', '1');
    pie.style.cssText = 'font-size:11px;opacity:.7;margin-top:9px;line-height:1.35';
    caja.appendChild(pie);

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d || !window.INVBOTONES) return;

    if (document.getElementById(ID)) {
      /* ya está puesto: sólo hay que repintarlo si cambió la paleta */
      if (paletaElegida(d) !== ultimaPaleta) pintar(d);
      return;
    }

    var m = document.querySelector('.mejoras');
    if (!m) return;
    asegurarBase();

    /* justo debajo del selector de paletas, que es la decisión anterior */
    var pal = document.getElementById('paleta-selector');
    var caja = construir(d);
    if (pal && pal.parentNode === m) m.insertBefore(caja, pal.nextSibling);
    else m.insertBefore(caja, m.firstChild);
    pintar(d);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
