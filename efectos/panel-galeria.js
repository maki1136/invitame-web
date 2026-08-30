/* ===== LA GALERÍA DE FOTOS, EN EL PANEL =======================================

   Suma un bloque «✨ Galería de fotos de los invitados» al final de la pestaña
   ✨ Efectos: prender/apagar, el código del evento, y —cuando el código es
   válido— el link para los invitados, el QR imprimible y el acceso al panel
   para aprobar fotos.

   POR QUÉ ESTÁ ACÁ Y NO DENTRO DE admin.html
   admin.html pesa 160 KB y sólo se puede subir a mano. Todo lo que se pueda
   resolver desde /efectos/ se resuelve desde acá. Mismo criterio que
   panel-pieza.js y panel-paleta.js.

   CÓMO GUARDA
   Escribe directo en `D.fx.galeria` y llama a postPreview(). `D` es el
   borrador que el panel publica.

   ⚠️ `D` NO cuelga de window: es un `const` del script principal, así que
   `window.D` da undefined, pero el identificador suelto SÍ se ve desde un
   script clásico como éste. Ver la misma nota en panel-pieza.js.

   LO QUE LEE LA INVITACIÓN
   /efectos/galeria.js lee fx.galeria = { encendido, gid, titulo, bajada, boton }.
   Si está apagado o el gid no tiene forma válida, no monta nada.

   EL ALTA DEL EVENTO NO SE HACE ACÁ. Crear una galería necesita la clave del
   Worker, y esa clave no puede vivir en el navegador (el repo es público).
   Por eso Jazmín pega el código que le pasa Maki. El alta desde el panel es
   parte del módulo suelto para fotógrafos.
   ============================================================================ */
(function () {

  var ID = 'galeria-ajustes';
  var BASE = 'https://invitame.littlemomentsok.com';
  var WORKER = 'https://galeria.littlemomentsok.workers.dev';
  var FORMA_GID = /^[A-Za-z0-9_-]{16,64}$/;

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function cfg(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.galeria) d.fx.galeria = {};
    return d.fx.galeria;
  }

  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }

  /* ---- piezas sueltas, con la pinta del panel --------------------------- */

  function grupo(etiqueta, control) {
    var g = document.createElement('div');
    g.className = 'grp';
    if (etiqueta) {
      var l = document.createElement('label');
      l.textContent = etiqueta;
      g.appendChild(l);
    }
    g.appendChild(control);
    return g;
  }

  function tilde(d, clave, etiqueta) {
    var l = document.createElement('label');
    l.className = 'chk';
    var i = document.createElement('input');
    i.type = 'checkbox';
    i.checked = !!cfg(d)[clave];
    i.onchange = function () { cfg(d)[clave] = this.checked; refrescar(); };
    l.appendChild(i);
    l.appendChild(document.createTextNode(' ' + etiqueta));
    return l;
  }

  function texto(d, clave, ph, alCambiar) {
    var i = document.createElement('input');
    i.type = 'text';
    i.placeholder = ph || '';
    i.value = String(cfg(d)[clave] || '');
    i.oninput = function () {
      cfg(d)[clave] = this.value.trim();
      refrescar();
      if (alCambiar) alCambiar();
    };
    return i;
  }

  /* ---- el link, el QR y el panel de moderar -----------------------------

     Sólo aparecen cuando el código tiene forma válida. Así nadie manda un
     link roto por WhatsApp sin enterarse. */

  function pintarLinks(d, caja) {
    caja.textContent = '';
    var g = String(cfg(d).gid || '').trim();
    if (!g) return;

    if (!FORMA_GID.test(g)) {
      var mal = document.createElement('div');
      mal.className = 'hint';
      mal.style.color = '#a3242f';
      mal.textContent = 'Ese código no tiene la forma correcta. Pegalo entero, sin espacios.';
      caja.appendChild(mal);
      return;
    }

    var inv = BASE + '/galeria/?g=' + encodeURIComponent(g);
    var mod = BASE + '/galeria/moderar.html?g=' + encodeURIComponent(g);
    var qr  = WORKER + '/qr?g=' + encodeURIComponent(g);

    var tarjeta = document.createElement('div');
    tarjeta.style.cssText = 'background:#fff;border:1px solid #eadcd5;border-radius:12px;' +
      'padding:12px;margin-bottom:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap';

    var img = document.createElement('img');
    img.src = qr;
    img.alt = 'QR de la galería';
    img.style.cssText = 'width:96px;height:96px;border-radius:8px;background:#f7f2ee';
    tarjeta.appendChild(img);

    var col = document.createElement('div');
    col.style.cssText = 'flex:1;min-width:190px;display:flex;flex-direction:column;gap:5px;align-items:flex-start';

    var ay = document.createElement('div');
    ay.className = 'hint';
    ay.style.margin = '0 0 3px';
    ay.textContent = 'Este QR se imprime y va en las mesas del salón.';
    col.appendChild(ay);

    col.appendChild(botonCopiar('Copiar el link para los invitados', inv));
    col.appendChild(enlace('Abrir el panel para aprobar fotos', mod));
    col.appendChild(enlace('Descargar el QR', qr));

    tarjeta.appendChild(col);
    caja.appendChild(tarjeta);
  }

  function enlace(txt, href) {
    var a = document.createElement('a');
    a.className = 'lnk';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = txt;
    return a;
  }

  function botonCopiar(txt, valor) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lnk';
    b.textContent = txt;
    b.onclick = function () {
      var listo = function () {
        b.textContent = '✓ Copiado';
        setTimeout(function () { b.textContent = txt; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(valor).then(listo, function () {
          window.prompt('Copiá el link:', valor);
        });
      } else {
        window.prompt('Copiá el link:', valor);
      }
    };
    return b;
  }

  /* ---- el bloque entero ------------------------------------------------- */

  function construir(d) {
    var caja = document.createElement('div');
    caja.className = 'mejoras';
    caja.id = ID;

    var h = document.createElement('div');
    h.className = 'h';
    h.textContent = '✨ Galería de fotos de los invitados';
    caja.appendChild(h);

    var ayuda = document.createElement('div');
    ayuda.className = 'hint';
    ayuda.style.marginBottom = '10px';
    ayuda.innerHTML = 'Los invitados sacan fotos desde la invitación y las ven todos al toque. ' +
      'Vos elegís cuáles se muestran. <b>El código del evento te lo pasa Maki</b> cuando crea ' +
      'la galería de esa fiesta.';
    caja.appendChild(ayuda);

    caja.appendChild(grupo('', tilde(d, 'encendido', 'Mostrar la galería en la invitación')));

    var links = document.createElement('div');

    caja.appendChild(grupo('Código del evento',
      texto(d, 'gid', 'Pegá acá el código que te pasó Maki', function () { pintarLinks(d, links); })));
    caja.appendChild(links);
    pintarLinks(d, links);

    caja.appendChild(grupo('Título de la sección', texto(d, 'titulo', 'Las fotos de la fiesta')));
    caja.appendChild(grupo('Frase de abajo', texto(d, 'bajada', 'Sacá tus fotos y mirá las de todos, en el momento.')));
    caja.appendChild(grupo('Texto del botón', texto(d, 'boton', 'Entrar a la galería')));

    var pie = document.createElement('div');
    pie.className = 'hint';
    pie.textContent = 'La vista previa del panel no muestra la galería. Se ve tocando 👁 en la invitación real.';
    caja.appendChild(pie);

    return caja;
  }

  /* ---- engancharse al panel --------------------------------------------- */

  /* ¿Estamos parados en la pestaña ✨ Efectos?

     No alcanza con buscar un `.mejoras`: otras pestañas también tienen bloques
     con esa clase (PRINCIPAL trae «✨ Empezá por acá») y el nuestro se colaba
     ahí. La señal buena son los títulos que escribe efectosHtml(), que empiezan
     todos con «✨ Efectos». Verificado en el panel real. */
  function enEfectos() {
    var hs = document.querySelectorAll('.mejoras .h');
    for (var i = 0; i < hs.length; i++) {
      if (/^\s*✨\s*Efectos/.test(hs[i].textContent || '')) return true;
    }
    return false;
  }

  function anclaje() {
    /* Al final de todo el bloque de Efectos: es una sección propia, no un
       agregado a otra. */
    var todas = document.querySelectorAll('.mejoras');
    return todas.length ? todas[todas.length - 1] : null;
  }

  function revisar() {
    var d = borrador();
    var ya = document.getElementById(ID);
    if (!d || !enEfectos()) { if (ya) ya.remove(); return; }
    if (ya) return;                            /* ya está puesto */
    var a = anclaje();
    if (!a || !a.parentNode) return;
    a.parentNode.insertBefore(construir(d), a.nextSibling);
  }

  /* El panel se redibuja entero cada vez que se toca algo, y se lleva puesto
     lo que hayamos insertado. Por eso revisamos seguido en vez de una sola vez.
     Es barato: si el bloque ya está, la función sale en la tercera línea. */
  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    if (++n > 60) clearInterval(t);            /* no es un panel: no hacemos nada */
  }, 500);
})();
