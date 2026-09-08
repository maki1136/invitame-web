/* ===== LA GALERÍA DE FOTOS, EN EL PANEL =======================================

   Suma un bloque «✨ Galería de fotos de los invitados» al final de la pestaña
   ✨ Efectos: prender/apagar, el código del evento, y —cuando el código es
   válido— el link para los invitados, el cartel para imprimir, la pantalla del
   salón y el acceso al panel para aprobar fotos.

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

   ⭐ EL ALTA SE HACE ACÁ.  (8/9/2026)
   Durante meses este bloque decía que crear una galería «necesita la clave del
   Worker» y que por eso el código lo tenía que pasar Maki a mano. Era falso:
   el Worker NO pide ninguna clave, pide el TOKEN DE LA SESIÓN de Firebase, y
   en el panel esa sesión ya está abierta. O sea que la razón por la que la
   función estaba trabada no existía.

   ⚠️ PERO CREAR UNA GALERÍA GASTA UN CRÉDITO, y los créditos son plata. Por
      eso el botón:
        · muestra el saldo ANTES de tocar nada,
        · pregunta antes de crear,
        · y se niega si esta invitación YA tiene galería. Crear dos veces no
          rompe nada visible: simplemente quema un crédito y deja huérfana la
          primera. Es el error más caro que se puede cometer desde acá.

   ⚠️ La galería se crea a nombre de LA CUENTA QUE ESTÉ ABIERTA en el panel, y
      es esa cuenta la que paga. Si el Worker contesta «no existe», esa cuenta
      todavía no tiene saldo: se carga desde /galeria/creditos.html, que es la
      pantalla de Maki.
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

  /* ---- el cartel, el link, la pantalla y el panel de moderar ------------

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
    var pan = BASE + '/galeria/pantalla.html?g=' + encodeURIComponent(g);
    var car = BASE + '/galeria/cartel.html?g=' + encodeURIComponent(g);

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
    ay.textContent = 'El cartel ya viene armado y listo para imprimir.';
    col.appendChild(ay);

    col.appendChild(botonCopiar('Copiar el link para los invitados', inv));
    col.appendChild(enlace('Abrir el panel para aprobar fotos', mod));
    col.appendChild(enlace('Abrir la pantalla del salón', pan));
    col.appendChild(enlace('Imprimir el cartel de las mesas', car));
    col.appendChild(enlace('Descargar el QR suelto', qr));

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
        b.innerHTML = ico('tilde') + ' Copiado';
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
    h.innerHTML = ico('destello') + ' Galería de fotos de los invitados';
    caja.appendChild(h);

    var ayuda = document.createElement('div');
    ayuda.className = 'hint';
    ayuda.style.marginBottom = '10px';
    ayuda.innerHTML = 'Los invitados sacan fotos desde la invitación y las ven todos al toque. ' +
      'Con el botón de acá abajo se crea la galería de esta fiesta y el código queda puesto solo.';
    caja.appendChild(ayuda);

    caja.appendChild(grupo('', tilde(d, 'encendido', 'Mostrar la galería en la invitación')));

    var links = document.createElement('div');

    /* ---- crear la galería de esta fiesta ---------------------------------
       Ver la nota grande de arriba: esto GASTA UN CRÉDITO. */
    var cajaAlta = document.createElement('div');
    cajaAlta.style.cssText = 'margin:2px 0 12px';
    var btnAlta = document.createElement('button');
    btnAlta.type = 'button';
    btnAlta.className = 'addbtn gh';
    btnAlta.innerHTML = ico('destello') + ' Crear la galería de esta fiesta';
    var saldo = document.createElement('div');
    saldo.className = 'hint';
    saldo.style.marginTop = '5px';
    cajaAlta.appendChild(btnAlta); cajaAlta.appendChild(saldo);
    caja.appendChild(cajaAlta);

    function sesion() {
      return (window.INV && window.INV.user) ? window.INV.user : null;
    }
    function acomodarAlta() {
      var dd = borrador() || d;
      var ya = FORMA_GID.test(String(cfg(dd).gid || '').trim());
      btnAlta.style.display = ya ? 'none' : '';
      saldo.style.display   = ya ? 'none' : '';
    }
    acomodarAlta();

    /* el saldo se mira UNA vez al abrir el bloque: es sólo lectura */
    (function () {
      var u = sesion(); if (!u) { saldo.textContent = 'Entrá al panel para poder crear la galería.'; return; }
      u.getIdToken(true).then(function (tok) {
        return fetch(WORKER + '/cuenta', { headers: { Authorization: 'Bearer ' + tok } })
          .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); });
      }).then(function (res) {
        if (!res.ok) {
          saldo.innerHTML = 'Esta cuenta todavía no tiene saldo de galerías. Se carga en ' +
            '<a href="/galeria/creditos.html" target="_blank">Cargar créditos</a>.';
          btnAlta.disabled = true;
          return;
        }
        var n = res.j.creditos;
        if (n == null) n = res.j.saldo;
        saldo.textContent = (n === 0)
          ? 'No te quedan créditos de galería.'
          : 'Crear la galería usa 1 crédito. Te quedan ' + n + '.';
        if (n === 0) btnAlta.disabled = true;
      })['catch'](function () { saldo.textContent = 'No pude leer el saldo de galerías.'; });
    })();

    btnAlta.onclick = function () {
      var dd = borrador(); if (!dd) return;
      /* ⚠️ el freno que evita quemar un crédito al pedo */
      if (FORMA_GID.test(String(cfg(dd).gid || '').trim())) {
        alert('Esta invitación ya tiene su galería. Si creás otra, gastás un crédito y la de antes queda huérfana.');
        acomodarAlta(); return;
      }
      var u = sesion(); if (!u) { alert('No hay sesión abierta.'); return; }
      var quienes = [dd.n1, dd.n2].filter(Boolean).join(' & ') || String(dd.slug || 'la fiesta');
      if (!confirm('Voy a crear la galería de "' + quienes + '".\n\nEsto usa 1 crédito y no se puede deshacer.\n\n¿La creo?')) return;
      var antes = btnAlta.innerHTML;
      btnAlta.disabled = true; btnAlta.textContent = 'Creando…';
      u.getIdToken(true).then(function (tok) {
        return fetch(WORKER + '/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok },
          /* modo "auto": las fotos aparecen al toque, que es la gracia. Se
             cambia después en /galeria/moderar.html si la pareja prefiere
             revisarlas antes. */
          body: JSON.stringify({ nombre: quienes, fecha: String(dd.fecha || '').slice(0, 10), modo: 'auto', audios: true })
        }).then(function (r) { return r.json()['catch'](function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); });
      }).then(function (res) {
        btnAlta.disabled = false; btnAlta.innerHTML = antes;
        if (!res.ok || !res.j.gid) {
          alert('No se pudo crear la galería.\n\n' + (res.j.error || 'Probá de nuevo en un rato.'));
          return;
        }
        var d2 = borrador(); if (!d2) return;
        cfg(d2).gid = res.j.gid;
        cfg(d2).encendido = true;
        pintarLinks(d2, links);
        acomodarAlta();
        refrescar();
        alert('Listo: la galería quedó creada y prendida.\n\nAcordate de tocar "Guardar y publicar" para que quede.');
      })['catch'](function (e) {
        btnAlta.disabled = false; btnAlta.innerHTML = antes;
        alert('No se pudo crear la galería: ' + (e.message || e));
      });
    };

    caja.appendChild(grupo('Código del evento',
      texto(d, 'gid', 'Se completa solo al crear la galería', function () { pintarLinks(d, links); acomodarAlta(); })));
    caja.appendChild(links);
    pintarLinks(d, links);

    /* ⚠️ Estos tres placeholders TIENEN que decir exactamente lo mismo que los
       valores por defecto de /efectos/galeria.js: son lo que va a salir si el
       campo queda vacío. Y van en español de México (el mercado), no en voseo.
       Estaba mal: decía «Sacá tus fotos y mirá las de todos» y la invitación
       escribía «Toma tus fotos y mira las de todos». El cartelito mentía sobre
       lo que iba a salir, e invitaba a escribir en voseo. */
    caja.appendChild(grupo('Título de la sección', texto(d, 'titulo', 'Las fotos de la fiesta')));
    caja.appendChild(grupo('Frase de abajo', texto(d, 'bajada', 'Toma tus fotos y mira las de todos, en el momento.')));
    caja.appendChild(grupo('Texto del botón', texto(d, 'boton', 'Entrar a la galería')));

    var pie = document.createElement('div');
    pie.className = 'hint';
    pie.textContent = 'La vista previa del panel no muestra la galería. Se ve abriendo la invitación real.';
    caja.appendChild(pie);

    return caja;
  }

  /* ---- engancharse al panel --------------------------------------------- */

  /* ¿Estamos parados en la pestaña EFECTOS?

     No alcanza con buscar un `.mejoras`: otras pestañas también tienen bloques
     con esa clase (PRINCIPAL trae «Empezá por acá») y el nuestro se colaba ahí.

     ⚠️ ANTES ESTO LEÍA EL TEXTO del encabezado («empieza con ✨ Efectos»), y el
        8/9/2026, cuando los emojis del panel se cambiaron por dibujos, ese texto
        dejó de existir: el bloque se habría colgado en la pestaña equivocada sin
        dar ningún error. La señal ahora está en el HTML, no en la prosa: los
        encabezados de efectosHtml() llevan la clase «efx». */
  function enEfectos() {
    return !!document.querySelector('.mejoras .h.efx');
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
