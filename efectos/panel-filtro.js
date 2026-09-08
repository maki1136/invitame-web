/* ===== EL FILTRO DE LA BODA, EN EL PANEL ======================================

   Suma un bloque «Efectos — el filtro de la boda» al final de la pestaña
   EFECTOS: prenderlo, subir el marco, elegir el color del marco de fábrica,
   los tres textos, y si la foto se manda a la galería de la fiesta.

   QUÉ ES: la cámara con el marco de la boda, adentro de la invitación. El
   producto que en el mercado se vende como «filtro de Instagram» y que en
   Instagram ya no existe desde el 14/1/2025. Ver /efectos/filtro.js.

   POR QUÉ ESTÁ ACÁ Y NO EN admin.html
   Mismo criterio que panel-galeria.js y panel-pieza.js: todo lo que se pueda
   resolver desde /efectos/ se resuelve desde acá.

   CÓMO GUARDA
   Escribe directo en `D.fx.filtro` y llama a postPreview().
   ⚠️ `D` NO cuelga de window: es un `const` del script principal, así que
   `window.D` da undefined, pero el identificador suelto SÍ se ve desde un
   script clásico como éste.

   ⚠️ EL BLOQUE SE CUELGA POR LA CLASE `efx`, no por el texto del título.
   ============================================================================ */
(function () {

  var ID = 'filtro-ajustes';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function cfg(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.filtro) d.fx.filtro = {};
    return d.fx.filtro;
  }

  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }

  function grupo(etiqueta, control, ayuda) {
    var g = document.createElement('div');
    g.className = 'grp';
    if (etiqueta) {
      var l = document.createElement('label');
      l.textContent = etiqueta;
      g.appendChild(l);
    }
    g.appendChild(control);
    if (ayuda) {
      var a = document.createElement('div');
      a.className = 'hint';
      a.textContent = ayuda;
      g.appendChild(a);
    }
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

  function texto(d, clave, ph) {
    var i = document.createElement('input');
    i.type = 'text';
    i.placeholder = ph || '';
    i.value = String(cfg(d)[clave] || '');
    i.oninput = function () { cfg(d)[clave] = this.value; refrescar(); };
    return i;
  }

  /* El campo de la frase. El placeholder sale de la MISMA tabla que usa la
     invitación (INVFILTRO.frases), no de una copia escrita acá. */
  function fraseCampo(d) {
    var i = document.createElement('input');
    i.type = 'text';
    i.maxLength = 60;
    var tipo = String(d.tipoEvento || d.tipo || 'boda').toLowerCase();
    var F = (window.INVFILTRO && window.INVFILTRO.frases) || {};
    i.placeholder = F[tipo] || F.otro || 'En la fiesta de';
    i.value = String(cfg(d).frase || '');
    i.oninput = function () { cfg(d).frase = this.value; refrescar(); };
    return i;
  }

  function color(d, clave, porDefecto) {
    var i = document.createElement('input');
    i.type = 'color';
    i.value = String(cfg(d)[clave] || porDefecto);
    i.oninput = function () { cfg(d)[clave] = this.value; refrescar(); };
    return i;
  }

  /* El marco: un PNG con fondo transparente, de 1080 × 1920. */
  function subidor(d) {
    var caja = document.createElement('div');

    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/png,image/webp';
    inp.style.cssText = 'display:block;font-size:12px;width:100%';

    var estado = document.createElement('div');
    estado.className = 'hint';

    var mira = document.createElement('div');
    mira.style.cssText = 'margin-top:8px';

    function mostrar() {
      var u = cfg(d).marco;
      estado.innerHTML = u
        ? (ico('tilde') + ' marco cargado')
        : 'sin marco propio: sale el de fábrica, con los nombres y la fecha';
      mira.textContent = '';
      if (u) {
        var i = document.createElement('img');
        i.src = u;
        i.alt = 'El marco';
        i.style.cssText = 'width:74px;height:132px;object-fit:contain;border-radius:8px;' +
          'background:repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0/14px 14px';
        mira.appendChild(i);

        var quitar = document.createElement('button');
        quitar.type = 'button';
        quitar.className = 'lnk';
        quitar.style.marginLeft = '10px';
        quitar.textContent = 'Quitar el marco';
        /* ⚠️ Se guarda vacío, NO se borra la clave: el guardado es con merge. */
        quitar.onclick = function () { cfg(d).marco = ''; mostrar(); refrescar(); };
        mira.appendChild(quitar);
      }
    }
    mostrar();

    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      if (typeof INV === 'undefined' || !INV.uploadImage) {
        estado.textContent = 'Todavía no cargó la base. Esperá dos segundos.';
        return;
      }
      estado.textContent = 'Subiendo… (' + Math.round(f.size / 1024) + ' KB)';
      Promise.resolve(INV.uploadImage(f)).then(function (url) {
        if (!url || typeof url !== 'string') {
          estado.textContent = 'No se pudo subir. Probá de nuevo.';
          return;
        }
        cfg(d).marco = url;
        mostrar(); refrescar();
      }).catch(function () {
        estado.textContent = 'No se pudo subir. Probá de nuevo.';
      });
    };

    caja.appendChild(inp);
    caja.appendChild(estado);
    caja.appendChild(mira);
    return caja;
  }

  /* ---- el selector de diseños, con miniaturas de verdad ------------------

     Las miniaturas NO son imágenes guardadas: se dibujan con la misma función
     que usa la invitación (INVFILTRO.dibujar), con los datos de ESTA boda.
     Así lo que ve Jazmín es exactamente lo que va a ver el invitado, y el día
     que cambie la paleta las seis se repintan solas. */

  function miniatura(d, id, ancho) {
    var img = document.createElement('canvas');
    var alto = Math.round(ancho * window.INVFILTRO.ALTO / window.INVFILTRO.ANCHO);
    img.width = ancho; img.height = alto;
    var x = img.getContext('2d');
    /* un fondo gris de fotito, para que se lea el marco claro */
    var g = x.createLinearGradient(0, 0, 0, alto);
    g.addColorStop(0, '#9aa2a8'); g.addColorStop(1, '#5d5550');
    x.fillStyle = g; x.fillRect(0, 0, ancho, alto);
    try {
      x.drawImage(window.INVFILTRO.dibujar(window.INVFILTRO.tema({ diseno: id }, d)),
                  0, 0, ancho, alto);
    } catch (e) {}
    return img;
  }

  function selectorDisenos(d) {
    var caja = document.createElement('div');
    caja.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px';
    if (!window.INVFILTRO) {
      caja.className = 'hint';
      caja.textContent = 'Los diseños todavía no cargaron. Recargá la página.';
      return caja;
    }
    window.INVFILTRO.disenos.forEach(function (dis) {
      var id = dis[0];
      var ficha = document.createElement('div');
      var elegido = (String(cfg(d).diseno || 'filete') === id);
      ficha.style.cssText = 'border:2px solid ' + (elegido ? 'var(--rosa)' : 'var(--line)') +
        ';border-radius:12px;overflow:hidden;cursor:pointer;background:#fff;' +
        (elegido ? 'box-shadow:0 6px 14px -8px rgba(240,80,92,.9);' : '');
      ficha.title = dis[2];
      var mini = miniatura(d, id, 150);
      mini.style.cssText = 'width:100%;height:auto;display:block';
      ficha.appendChild(mini);
      var nom = document.createElement('div');
      nom.textContent = dis[1];
      nom.style.cssText = 'padding:6px 4px;font-size:11.5px;text-align:center;font-weight:600;' +
        'color:' + (elegido ? 'var(--uva)' : 'var(--ink)');
      ficha.appendChild(nom);
      ficha.onclick = function () {
        cfg(d).diseno = id;
        refrescar();
        var padre = caja.parentNode;
        var nueva = selectorDisenos(d);
        if (padre) padre.replaceChild(nueva, caja);
      };
      caja.appendChild(ficha);
    });
    return caja;
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.className = 'mejoras';
    caja.id = ID;

    var h = document.createElement('div');
    h.className = 'h efx';
    h.innerHTML = ico('camara') + ' Efectos — el filtro de la boda';
    caja.appendChild(h);

    var ayuda = document.createElement('div');
    ayuda.className = 'hint';
    ayuda.style.marginBottom = '12px';
    ayuda.innerHTML = 'El invitado toca un botón, se le abre la cámara con el marco de la fiesta ' +
      'encima, se saca la foto y la comparte. <b>Sin bajarse ninguna aplicación.</b> ' +
      'Es lo que se pide como «filtro de Instagram»: en Instagram dejó de existir ' +
      'en enero de 2025, y acá adentro nadie lo puede apagar.';
    caja.appendChild(ayuda);

    caja.appendChild(grupo('', tilde(d, 'encendido', 'Mostrar el filtro en la invitación')));

    caja.appendChild(grupo('El diseño del marco', selectorDisenos(d),
      'Se dibujan solos con la paleta, la tipografía y la colección de ESTA invitación. ' +
      'Si cambiás la paleta, los seis cambian con ella.'));

    /* ⚠️ El placeholder NO es un texto de relleno: es exactamente lo que va a
       salir si el campo queda vacío, calculado según el tipo de evento. */
    caja.appendChild(grupo('La frase de arriba', fraseCampo(d),
      'Va arriba de los nombres. Si la dejás vacía sale la de fábrica según el tipo ' +
      'de evento. Los novios también pueden cambiarla desde su panel: vale la última ' +
      'que se guarda.'));

    caja.appendChild(grupo('El marco de la foto', subidor(d),
      'Un PNG con fondo transparente, de 1080 × 1920 (una historia). Si no subís ninguno, ' +
      'se dibuja solo con los nombres y la fecha de esta invitación.'));

    caja.appendChild(grupo('Color del marco de fábrica', color(d, 'colorMarco', '#F2E9D8'),
      'Sólo se usa cuando no hay marco propio. Va sobre la foto: conviene claro.'));

    /* ⚠️ Estos placeholders TIENEN que decir exactamente lo mismo que los
       valores por defecto de /efectos/filtro.js: es lo que va a salir si el
       campo queda vacío. Y en español de México, que es el mercado. */
    caja.appendChild(grupo('Título de la sección', texto(d, 'titulo', 'El filtro de la boda')));
    caja.appendChild(grupo('Frase de abajo',
      texto(d, 'bajada', 'Tómate una foto con el marco de nuestra fiesta y compártela.')));
    caja.appendChild(grupo('Texto del botón', texto(d, 'boton', 'Abrir la cámara')));

    caja.appendChild(grupo('', tilde(d, 'aGaleria', 'Que la foto se pueda mandar a la galería de la fiesta'),
      'Aparece un botón más al terminar la foto. Sólo funciona si la galería está prendida ' +
      'y tiene código de evento; en una muestra no aparece.'));

    var pie = document.createElement('div');
    pie.className = 'hint';
    pie.textContent = 'La vista previa del panel no abre la cámara. Se prueba abriendo la ' +
      'invitación real en el teléfono.';
    caja.appendChild(pie);

    return caja;
  }

  function enEfectos() {
    return !!document.querySelector('.mejoras .h.efx');
  }

  function anclaje() {
    var todas = document.querySelectorAll('.mejoras');
    return todas.length ? todas[todas.length - 1] : null;
  }

  function revisar() {
    var d = borrador();
    var ya = document.getElementById(ID);
    if (!d || !enEfectos()) { if (ya) ya.remove(); return; }
    if (ya) return;
    var a = anclaje();
    if (!a || !a.parentNode) return;
    a.parentNode.insertBefore(construir(d), a.nextSibling);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
