/* ===== EL SELECTOR DE ESTILO DE BOTÓN, EN EL PANEL ============================

   Va debajo del selector de paletas, dentro del bloque ✨ EFECTOS.

   LAS MUESTRAS SON BOTONES DE VERDAD, NO DIBUJOS DE BOTONES.
   Cada tarjeta tiene adentro un `.inv-prev-btn`, y ese selector está en la
   lista de /efectos/botones.js. O sea: la muestra se pinta con EXACTAMENTE el
   mismo CSS que el botón de la invitación. Si mañana se corrige un estilo, la
   muestra se corrige sola. No hay forma de que queden distintas.

   ⚠️ LA LISTA NO SE ESCRIBE ACÁ. Se lee de window.INVBOTONES.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
   Ver la misma nota en panel-pieza.js.
   ============================================================================ */
(function () {

  var ID = 'boton-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function elegido(d) {
    return (d.fx && d.fx.boton && d.fx.boton.estilo) || '';
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

  /* La geometría base de la muestra. El panel no tiene el CSS de la invitación,
     así que el botón de prueba necesita su forma; el MATERIAL se lo pone
     botones.js solo. */
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

  function tarjeta(d, est, marcada) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    b.title = est.pie || est.nombre;
    b.style.cssText = [
      'display:block', 'width:100%', 'cursor:pointer', 'background:#fff',
      'text-align:center', 'border-radius:10px', 'font:inherit', 'overflow:hidden',
      'padding:' + (marcada ? '0' : '1px'),
      'border:' + (marcada ? '2px solid #1c1a17' : '1px solid rgba(0,0,0,.16)'),
      'box-shadow:' + (marcada ? '0 0 0 3px rgba(0,0,0,.09)' : 'none')
    ].join(';');

    /* acá está la gracia: el envoltorio lleva el atributo y adentro va un botón
       de verdad, que se pinta con el CSS de la invitación */
    var caja = document.createElement('div');
    caja.setAttribute('data-boton', est.id);
    caja.style.cssText = 'padding:15px 8px 13px;background:var(--cream,#efeae2);' +
                         'display:flex;align-items:center;justify-content:center;min-height:56px';
    var m = document.createElement('span');
    m.className = 'inv-prev-btn';
    m.textContent = 'Confirmar';
    caja.appendChild(m);
    b.appendChild(caja);

    var pie = document.createElement('div');
    pie.textContent = est.nombre;
    pie.style.cssText = 'padding:6px 6px 7px;font-size:10.5px;line-height:1.25;color:#2b2b2b;' +
                        'background:#fff;min-height:26px;font-weight:' + (marcada ? '700' : '500');
    b.appendChild(pie);

    b.onclick = function () {
      elegir(d, marcada ? '' : est.id);
      pintar(d);
    };
    return b;
  }

  function tarjetaSin(d, marcada) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    b.title = 'Los botones de siempre';
    b.style.cssText = [
      'display:block', 'width:100%', 'cursor:pointer', 'background:#fff',
      'text-align:center', 'border-radius:10px', 'font:inherit', 'overflow:hidden',
      'padding:' + (marcada ? '0' : '1px'),
      'border:' + (marcada ? '2px solid #1c1a17' : '1px dashed rgba(0,0,0,.3)'),
      'box-shadow:' + (marcada ? '0 0 0 3px rgba(0,0,0,.09)' : 'none')
    ].join(';');
    var caja = document.createElement('div');
    caja.style.cssText = 'padding:15px 8px 13px;min-height:56px;display:flex;align-items:center;' +
      'justify-content:center;background:repeating-linear-gradient(45deg,#fafafa,#fafafa 5px,#f0f0f0 5px,#f0f0f0 10px)';
    var m = document.createElement('span');
    m.className = 'inv-prev-btn';
    m.textContent = 'Confirmar';
    caja.appendChild(m);
    b.appendChild(caja);
    var pie = document.createElement('div');
    pie.textContent = 'Como está hoy';
    pie.style.cssText = 'padding:6px 6px 7px;font-size:10.5px;line-height:1.25;color:#2b2b2b;' +
                        'background:#fff;min-height:26px;font-weight:' + (marcada ? '700' : '500');
    b.appendChild(pie);
    b.onclick = function () { elegir(d, ''); pintar(d); };
    return b;
  }

  function pintar(d) {
    var caja = document.getElementById(ID);
    if (!caja) return;
    var g = caja.querySelector('[data-grilla]');
    if (!g) return;
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
    a.textContent = 'Cambia todos los botones de la invitación de una vez. Los colores los toma de la paleta, así que el mismo material se ve distinto en cada invitación.';
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
    if (document.getElementById(ID)) return;
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
