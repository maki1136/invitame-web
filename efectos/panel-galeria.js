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

   ⚠️⚠️ Y ACÁ ESTUVO MI ERROR, QUE MAKI CORRIGIÓ. El Worker tiene DOS puertas
      para dar de alta una fiesta, y la primera versión de este botón usó la
      equivocada:
        · `X-Clave: CLAVE_ALTA`  → NO gasta crédito. Es la de la casa: la que
          va cuando la fiesta es de un cliente nuestro.
        · `Bearer <token>`       → gasta 1 crédito. Es la del canal B2B: un
          fotógrafo consumiendo las fiestas que nos compró.
      Maki: «pero no entiendo que gasten créditos los B2C». Tenía razón: el
      crédito es la unidad de VENTA del canal mayorista; en una venta directa
      no hay nada que descontar.

   ⭐ Por eso este botón llama a `/galeria-alta.php`, que guarda la clave
      afuera del repo y entra por la puerta de la casa. NO gasta créditos y no
      hace falta que ninguna cuenta tenga saldo.

   ⚠️ Igual se niega si esta invitación YA tiene galería. Crear dos veces no
      se ve roto: deja huérfana la primera y duplica los gigas del mes.
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
       Ver la nota grande de arriba: va por /galeria-alta.php, que NO gasta
       créditos. Los créditos son del canal mayorista, no de nuestros clientes. */
    var cajaAlta = document.createElement('div');
    cajaAlta.style.cssText = 'margin:2px 0 12px';
    var btnAlta = document.createElement('button');
    btnAlta.type = 'button';
    btnAlta.className = 'addbtn gh';
    btnAlta.innerHTML = ico('destello') + ' Crear la galería de esta fiesta';
    var notaAlta = document.createElement('div');
    notaAlta.className = 'hint';
    notaAlta.style.marginTop = '5px';
    notaAlta.textContent = 'Se crea a nombre de Invítame. No gasta créditos: los créditos son de los fotógrafos que compran fiestas por volumen.';
    cajaAlta.appendChild(btnAlta); cajaAlta.appendChild(notaAlta);
    caja.appendChild(cajaAlta);

    function acomodarAlta() {
      var dd = borrador() || d;
      var ya = FORMA_GID.test(String(cfg(dd).gid || '').trim());
      cajaAlta.style.display = ya ? 'none' : '';
    }
    acomodarAlta();

    btnAlta.onclick = function () {
      var dd = borrador(); if (!dd) return;
      /* el freno: crear dos veces deja huérfana la primera */
      if (FORMA_GID.test(String(cfg(dd).gid || '').trim())) {
        alert('Esta invitación ya tiene su galería.'); acomodarAlta(); return;
      }
      var u = (window.INV && window.INV.user) ? window.INV.user : null;
      if (!u) { alert('No hay sesión abierta en el panel.'); return; }
      var quienes = [dd.n1, dd.n2].filter(Boolean).join(' & ') || String(dd.slug || 'la fiesta');
      if (!confirm('Creo la galería de "' + quienes + '"?')) return;
      var antes = btnAlta.innerHTML;
      btnAlta.disabled = true; btnAlta.textContent = 'Creando…';
      u.getIdToken(true).then(function (tok) {
        return fetch('/galeria-alta.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          /* modo "auto": las fotos se ven al toque, que es la gracia. Se cambia
             después en /galeria/moderar.html si prefieren revisarlas antes. */
          body: JSON.stringify({ idToken: tok, nombre: quienes,
                                 fecha: String(dd.fecha || '').slice(0, 10),
                                 modo: 'auto', audios: true })
        }).then(function (r) { return r.json()['catch'](function () { return {}; }); });
      }).then(function (j) {
        btnAlta.disabled = false; btnAlta.innerHTML = antes;
        if (!j || !j.ok || !j.gid) {
          var porQue = {
            'sesion': 'Se venció tu sesión. Recargá el panel y probá de nuevo.',
            'no-sos-del-equipo': 'Tu cuenta no está habilitada para crear galerías.',
            'sin-clave': 'Falta terminar una configuración del servidor. Avisale a Maki.'
          };
          alert((porQue[j && j.error] || 'No se pudo crear la galería.') +
                ((j && j.detalle) ? '\n\n(' + j.detalle + ')' : ''));
          return;
        }
        var d2 = borrador(); if (!d2) return;
        cfg(d2).gid = j.gid;
        cfg(d2).encendido = true;
        pintarLinks(d2, links); acomodarAlta(); refrescar();
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
