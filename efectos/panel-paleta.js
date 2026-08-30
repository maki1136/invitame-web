/* ===== EL SELECTOR DE PALETA, EN EL PANEL =====================================

   Pone arriba de todo del bloque ✨ EFECTOS una grilla con las 20 paletas.
   Se elige una y la invitación entera se repinta: los nombres, los fondos de
   sección, el lacre, los filetes. Es UNA decisión en lugar de nueve campos de
   color sueltos.

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

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }

  function elegida(d) {
    return (d.fx && d.fx.paleta && d.fx.paleta.id) || '';
  }

  function elegir(d, id) {
    if (!d.fx) d.fx = {};
    if (!d.fx.paleta) d.fx.paleta = {};
    d.fx.paleta.id = id || '';
    refrescar();
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
    b.style.cssText = [
      'display:block', 'width:100%', 'cursor:pointer',
      'background:#fff', 'text-align:left', 'overflow:hidden',
      'border-radius:9px', 'font:inherit',
      'border:' + (marcada ? '2px solid #1c1a17' : '1px solid rgba(0,0,0,.16)'),
      /* el marcado crece 1px de borde: se compensa para que no salte la grilla */
      'padding:' + (marcada ? '0' : '1px'),
      'box-shadow:' + (marcada ? '0 0 0 3px rgba(0,0,0,.09)' : 'none')
    ].join(';');

    var tiras = document.createElement('div');
    tiras.style.cssText = 'display:flex;height:34px';
    [pal.verde, pal.sage, pal.sageCl, pal.oro, pal.cream].forEach(function (c) {
      var t = document.createElement('div');
      t.style.cssText = 'flex:1;background:' + c;
      tiras.appendChild(t);
    });
    b.appendChild(tiras);

    var pie = document.createElement('div');
    pie.textContent = pal.nombre;
    pie.style.cssText = [
      'padding:5px 6px 6px', 'font-size:10.5px', 'line-height:1.25',
      'color:#2b2b2b', 'background:#fff',
      'font-weight:' + (marcada ? '700' : '500')
    ].join(';');
    b.appendChild(pie);

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
    b.style.cssText = [
      'display:block', 'width:100%', 'cursor:pointer',
      'background:#fff', 'text-align:left', 'overflow:hidden',
      'border-radius:9px', 'font:inherit',
      'border:' + (marcada ? '2px solid #1c1a17' : '1px dashed rgba(0,0,0,.3)'),
      'padding:' + (marcada ? '0' : '1px'),
      'box-shadow:' + (marcada ? '0 0 0 3px rgba(0,0,0,.09)' : 'none')
    ].join(';');

    var cuerpo = document.createElement('div');
    cuerpo.textContent = '—';
    cuerpo.style.cssText = 'height:34px;display:flex;align-items:center;justify-content:center;color:#999;font-size:16px;background:repeating-linear-gradient(45deg,#fafafa,#fafafa 5px,#f0f0f0 5px,#f0f0f0 10px)';
    b.appendChild(cuerpo);

    var pie = document.createElement('div');
    pie.textContent = 'Colores a mano';
    pie.style.cssText = 'padding:5px 6px 6px;font-size:10.5px;line-height:1.25;color:#2b2b2b;background:#fff;font-weight:' + (marcada ? '700' : '500');
    b.appendChild(pie);

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
    (window.INVPALETAS || []).forEach(function (p) {
      grilla.appendChild(tarjeta(d, p, p.id === sel));
    });

    var pie = caja.querySelector('[data-elegida]');
    if (pie) {
      var p = (window.INVPALETAS || []).filter(function (x) { return x.id === sel; })[0];
      pie.textContent = p
        ? 'Elegida: ' + p.nombre + ' · manda sobre los colores sueltos de abajo'
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
    ayuda.textContent = 'Elegí una y se pinta toda la invitación: los nombres, los fondos, el lacre. Si preferís elegir color por color, tocá “Colores a mano”.';
    ayuda.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(ayuda);

    var grilla = document.createElement('div');
    grilla.setAttribute('data-grilla', '1');
    grilla.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:7px;max-height:280px;overflow-y:auto;padding:2px';
    caja.appendChild(grilla);

    var pie = document.createElement('div');
    pie.setAttribute('data-elegida', '1');
    pie.style.cssText = 'font-size:11px;opacity:.7;margin-top:9px;line-height:1.35';
    caja.appendChild(pie);

    return caja;
  }

  /* ---- engancharse al panel --------------------------------------------- */

  function revisar() {
    var d = borrador();
    if (!d || !window.INVPALETAS) return;
    if (document.getElementById(ID)) return;      /* ya está puesto */

    var m = document.querySelector('.mejoras');
    if (!m) return;                               /* la pestaña no está abierta */

    /* Va PRIMERO: es la decisión más grande del bloque, y todo lo que viene
       abajo (los colores sueltos) queda supeditado a ella. */
    m.insertBefore(construir(d), m.firstChild);
    pintarGrilla(d);
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
