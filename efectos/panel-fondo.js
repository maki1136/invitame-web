/* ===== EL FONDO DE LA INVITACIÓN, EN EL PANEL =================================

   El bloque para elegir qué reemplaza el papel crudo de la invitación: nada,
   una imagen o un video. Lo pinta /efectos/fondo-invitacion.js.

   POR QUÉ EXISTE ESTE BLOQUE
   Un archivo que está en la computadora de alguien no se puede subir sin que
   esa persona lo elija: es una regla de seguridad del navegador. Acá está el
   selector de archivo, así el archivo se sube UNA vez y queda alojado con su
   propia dirección. Después cualquiera puede apuntar cualquier invitación a esa
   dirección sin volver a pedir nada.

   LAS PERILLAS NO SON DECORACIÓN

     · VELO — cuánto se apaga el fondo. Un fondo con dibujo detrás de un texto
       chico lo vuelve ilegible. Está medido sobre una invitación real.
     · SECCIONES CLARAS — cuánto dejan pasar el fondo. Es la perilla principal:
       en 0 el papel sigue siendo crudo y no cambió nada.
     · SECCIONES DE COLOR — aparte, y arranca en 0 a propósito. Las secciones
       de color son las que le dan el ritmo a la invitación; si se abren todas,
       se pierde el pulso y el texto claro sobre fondo pálido deja de leerse.

   ⚠️ DÓNDE SE VE: la columna, o toda la pantalla.
      El fondo va SIEMPRE adentro de la columna — ése es el papel, y es lo
      único que se ve en el teléfono. "Toda la pantalla" agrega, además, los
      costados en la compu (desenfocados, para completar el 16:9 de un monitor
      sin que se note que el archivo es vertical). En el celular las dos
      opciones se ven igual, porque costados no hay.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Ver la misma nota en panel-pieza.js.
   ============================================================================ */
(function () {

  var ID = 'fondo-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function fondo(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.fondo) d.fx.fondo = {};
    return d.fx.fondo;
  }

  function fila(etiqueta, campo, ayuda) {
    var g = document.createElement('div');
    g.style.cssText = 'margin:0 0 10px';
    var l = document.createElement('label');
    l.textContent = etiqueta;
    l.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    g.appendChild(l);
    g.appendChild(campo);
    if (ayuda) {
      var a = document.createElement('div');
      a.textContent = ayuda;
      a.style.cssText = 'font-size:11px;opacity:.6;margin:3px 0 0;line-height:1.35';
      g.appendChild(a);
    }
    return g;
  }

  function subidor(d, texto, acepta, cual, pie) {
    var caja = document.createElement('div');

    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = acepta;
    inp.style.cssText = 'display:block;font-size:12px;width:100%';

    var estado = document.createElement('div');
    estado.style.cssText = 'font-size:11px;opacity:.7;margin:4px 0 0;line-height:1.35';
    function mostrar() {
      var u = fondo(d)[cual];
      estado.textContent = u ? '✓ cargado' : 'todavía no hay archivo';
    }
    mostrar();

    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      estado.textContent = 'Subiendo… (' + Math.round(f.size / 1024) + ' KB)';
      var subir = (cual === 'url' && /video/.test(f.type)) ? INV.uploadVideo : INV.uploadImage;
      Promise.resolve(subir.call(INV, f)).then(function (url) {
        if (!url || typeof url !== 'string') { estado.textContent = 'No se pudo subir. Probá de nuevo.'; return; }
        fondo(d)[cual] = url;
        if (cual === 'url' && !fondo(d).tipo) fondo(d).tipo = /video/.test(f.type) ? 'video' : 'imagen';
        mostrar(); refrescar(); pintar(d);
      }).catch(function () {
        estado.textContent = 'No se pudo subir. Probá de nuevo.';
      });
    };

    caja.appendChild(inp);
    caja.appendChild(estado);
    return fila(texto, caja, pie);
  }

  function perilla(d, clave, etiqueta, min, max, porDefecto, ayuda) {
    var caja = document.createElement('div');
    caja.style.cssText = 'display:flex;align-items:center;gap:9px';

    var r = document.createElement('input');
    r.type = 'range';
    r.min = String(Math.round(min * 100));
    r.max = String(Math.round(max * 100));
    r.step = '2';
    var v = fondo(d)[clave];
    r.value = String(Math.round(((typeof v === 'number') ? v : porDefecto) * 100));
    r.style.cssText = 'flex:1';

    var num = document.createElement('span');
    num.style.cssText = 'font-size:11.5px;font-weight:700;min-width:34px;text-align:right';
    function ver() { num.textContent = r.value + '%'; }
    ver();

    r.oninput = function () {
      fondo(d)[clave] = parseInt(r.value, 10) / 100;
      ver(); refrescar();
    };

    caja.appendChild(r); caja.appendChild(num);
    return fila(etiqueta, caja, ayuda);
  }

  function elegir(d, clave, etiqueta, opciones, porDefecto, ayuda) {
    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%';
    opciones.forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      sel.appendChild(op);
    });
    sel.value = fondo(d)[clave] || porDefecto;
    sel.onchange = function () { fondo(d)[clave] = sel.value; refrescar(); pintar(d); };
    return fila(etiqueta, sel, ayuda);
  }

  function pintar(d) {
    var caja = document.getElementById(ID);
    if (!caja) return;
    var cuerpo = caja.querySelector('[data-cuerpo]');
    if (!cuerpo) return;
    cuerpo.innerHTML = '';

    var f = fondo(d);

    var sel = document.createElement('select');
    [['', 'Sin fondo (papel crudo, como está hoy)'], ['imagen', 'Una imagen'], ['video', 'Un video']]
      .forEach(function (o) {
        var op = document.createElement('option');
        op.value = o[0]; op.textContent = o[1];
        sel.appendChild(op);
      });
    sel.value = f.tipo || '';
    sel.style.cssText = 'width:100%';
    sel.onchange = function () { fondo(d).tipo = sel.value; refrescar(); pintar(d); };
    cuerpo.appendChild(fila('Qué reemplaza el papel', sel));

    if (!f.tipo) {
      var nota = document.createElement('div');
      nota.textContent = 'Con “Sin fondo” la invitación queda exactamente como está hoy.';
      nota.style.cssText = 'font-size:11.5px;opacity:.62;line-height:1.35';
      cuerpo.appendChild(nota);
      return;
    }

    cuerpo.appendChild(subidor(d,
      f.tipo === 'video' ? 'El video (.mp4)' : 'La imagen',
      f.tipo === 'video' ? 'video/mp4,video/*' : 'image/*',
      'url',
      f.tipo === 'video' ? 'Corto y en loop, vertical. Con 100 KB alcanza: va velado detrás del texto.'
                         : 'Vertical, como el teléfono. Mejor algo suave que algo con mucho dibujo.'));

    if (f.tipo === 'video') {
      cuerpo.appendChild(subidor(d, 'Foto de respaldo', 'image/*', 'poster',
        'Se usa en los celulares que no reproducen video, cuando la persona pidió menos movimiento, y siempre para los costados de la compu. Sin esto, ahí no se ve nada.'));
    }

    cuerpo.appendChild(elegir(d, 'donde', 'Dónde se ve',
      [['marco', 'Sólo adentro de la invitación'],
       ['pantalla', 'Adentro y también los costados (llena la pantalla)']],
      'marco',
      'En el celular las dos se ven igual. La segunda es para la compu: rellena los costados con la misma imagen desenfocada, así completa el monitor en vez de dejar franjas.'));

    cuerpo.appendChild(perilla(d, 'velo', 'Cuánto se apaga el fondo', 0, 0.85, 0.30,
      'Si el fondo tiene dibujo, subilo. Es lo que deja que el texto se lea encima.'));

    cuerpo.appendChild(perilla(d, 'paso', 'Cuánto lo dejan pasar las secciones claras', 0, 1, 0.85,
      'Es la perilla principal: en 0 el papel sigue crudo y no cambia nada. En 85% el fondo ES el papel.'));

    cuerpo.appendChild(perilla(d, 'oscuras', 'Y las secciones de color', 0, 0.6, 0,
      'Dejalas en 0 salvo que quieras perder el contraste entre secciones. Son las que le dan el ritmo a la invitación.'));
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'El fondo de la invitación';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Una imagen o un video en lugar del papel crudo. El archivo se sube una vez y queda guardado.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var cuerpo = document.createElement('div');
    cuerpo.setAttribute('data-cuerpo', '1');
    caja.appendChild(cuerpo);

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d || typeof INV === 'undefined' || !INV.uploadImage) return;
    if (document.getElementById(ID)) return;
    var m = document.querySelector('.mejoras');
    if (!m) return;

    /* debajo del selector de botones, que es la decisión anterior */
    var ancla = document.getElementById('boton-selector') || document.getElementById('paleta-selector');
    var caja = construir(d);
    if (ancla && ancla.parentNode === m) m.insertBefore(caja, ancla.nextSibling);
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
