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

  /* ⚠️⚠️ EL ARCHIVO SE SUBE TAL CUAL, PERO AL INVITADO LE LLEGA LIVIANO. (1/10/2026)
     Maki: «¿pueden subir cualquier fondo con calidad o el sistema acomoda la
     calidad para que no sea todo súper pesado?». Medido: NO lo acomodaba.
     Cloudinary guarda lo que se sube, y el fondo se pedía con la dirección
     cruda: cantera 4 MB, cenicienta 2,5 MB; un video de celular de 25 s,
     79 MB, le habría llegado entero a cada invitado.
     Ahora, al subir, si el archivo es pesado se guarda la dirección CON la
     receta de Cloudinary (que se aplica sola, del lado de ellos):
       video: ancho 900, calidad automática, SIN audio, tope 1 Mbps y 20 s.
              Medido: 4 MB → 0,9 MB (cantera, a la vista idénticos),
                      79 MB → 2,5 MB (celular 25 s).
       foto:  ancho 1600, formato y calidad automáticos.
     Sólo cuando conviene: a un video que ya viene chico (menos de 1,2 MB)
     la receta lo puede AGRANDAR (medido: rapunzel 0,58 → 1,07 MB), así que
     ése se deja como está. La dirección guardada es la misma para la
     miniatura del panel y para la invitación de verdad: lo que ve Jazmín es
     lo que ve el invitado. */
  var RECETA_VIDEO = 'q_auto,vc_auto,w_900,c_limit,ac_none,br_1m,du_20';
  var RECETA_FOTO  = 'f_auto,q_auto,w_1600,c_limit';
  function liviana(url, bytes) {
    if (url.indexOf('res.cloudinary.com/') < 0) return url;
    var m = url.match(/^(.*\/(video|image)\/upload\/)(v\d+\/.*)$/);
    if (!m) return url;                         /* ya trae receta: no se toca */
    if (/\.gif$/i.test(url)) return url;        /* el GIF lo resuelve fondo-invitacion */
    if (m[2] === 'video') return bytes > 1.2 * 1048576 ? m[1] + RECETA_VIDEO + '/' + m[3] : url;
    return bytes > 600 * 1024 ? m[1] + RECETA_FOTO + '/' + m[3] : url;
  }
  /* La primera vez que alguien pide la versión liviana, Cloudinary la fabrica
     (medido: 3 a 9 s). Si ese primero fuera un invitado, el fondo tardaría y
     se vería la foto de respaldo. Se la pide acá, apenas se sube, así ya
     está hecha cuando entra el primero. */
  function calentar(url) {
    try { fetch(url, { mode: 'no-cors' }).catch(function () {}); } catch (e) {}
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
      estado.innerHTML = u ? (ico('tilde') + ' cargado') : 'todavía no hay archivo';
    }
    mostrar();

    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var esVideo = /video/.test(f.type);
      var mb = f.size / 1048576;
      if (mb > 95) {
        estado.textContent = 'Ese archivo pesa ' + Math.round(mb) + ' MB y el máximo es 95 MB. Recortalo (con 10 a 20 segundos alcanza) y subilo de nuevo.';
        inp.value = '';
        return;
      }
      estado.textContent = 'Subiendo… (' + (mb >= 1 ? mb.toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB') + ')' +
        (mb > 15 ? ' — es pesado, puede tardar un par de minutos. No cierres el panel.' : '');
      var subir = (cual === 'url' && esVideo) ? INV.uploadVideo : INV.uploadImage;
      Promise.resolve(subir.call(INV, f)).then(function (url) {
        if (!url || typeof url !== 'string') { estado.textContent = 'No se pudo subir. Probá de nuevo.'; return; }
        url = liviana(url, f.size);
        if (url.indexOf('/video/upload/') >= 0) calentar(url);
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
      f.tipo === 'video' ? 'Vertical y en loop. Subilo como lo tengas: el sistema lo achica solo para que cargue rápido (hasta 95 MB; se usan los primeros 20 segundos).'
                         : 'Vertical, como el teléfono. Mejor algo suave que algo con mucho dibujo. Subila en buena calidad: el sistema la achica sola.'));

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
    cuerpo.appendChild(avisoLectura());

    cuerpo.appendChild(perilla(d, 'paso', 'Cuánto lo dejan pasar las secciones claras', 0, 1, 0.85,
      'Es la perilla principal: en 0 el papel sigue crudo y no cambia nada. En 85% el fondo ES el papel.'));

    cuerpo.appendChild(perilla(d, 'oscuras', 'Y las secciones de color', 0, 0.6, 0,
      'Dejalas en 0 salvo que quieras perder el contraste entre secciones. Son las que le dan el ritmo a la invitación.'));

    cuerpo.appendChild(bloqueSuave(d));
  }

  /* ⭐ SUAVIZADO DETRÁS DE LOS TEXTOS (3/10/2026). Lo pinta fondo-invitacion.js
     con `fx.fondo.suave = {modo, color, fuerza, donde}`. Pedido de Maki: «que
     Jazmín lo tenga como opción cambiando de color e intensidad sobre las
     palabras que necesite». Es la otra salida cuando un texto no se lee: en
     vez de apagar TODO el fondo, se aclara sólo detrás de la letra. */
  function suave(d) {
    var f = fondo(d);
    if (!f.suave || typeof f.suave !== 'object') f.suave = {};
    return f.suave;
  }
  function bloqueSuave(d) {
    var caja = document.createElement('div');
    caja.setAttribute('data-suave', '1');
    caja.style.cssText = 'margin:6px 0 0;padding:10px 0 0;border-top:1px dashed rgba(0,0,0,.12)';
    var t = document.createElement('div');
    t.textContent = 'Suavizado detrás de los textos';
    t.style.cssText = 'font-size:12.5px;font-weight:700;margin:0 0 2px';
    caja.appendChild(t);
    var a = document.createElement('div');
    a.textContent = 'Para que las letras se lean sin apagar todo el fondo: aclara (u oscurece) sólo donde va el texto.';
    a.style.cssText = 'font-size:11px;opacity:.6;margin:0 0 8px;line-height:1.35';
    caja.appendChild(a);

    var sv = suave(d);
    var modo = document.createElement('select');
    modo.style.cssText = 'width:100%';
    [['', 'Apagado'],
     ['banda', 'Una banda suave en el centro, en toda la invitación'],
     ['halo', 'Un resplandor pegado a cada letra'],
     ['ambos', 'Las dos cosas']].forEach(function (o) {
      var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; modo.appendChild(op);
    });
    modo.value = sv.modo || '';
    modo.onchange = function () { suave(d).modo = modo.value; refrescar(); pintar(d); };
    caja.appendChild(fila('Cómo', modo,
      'La banda es como la de Renata y Patricio: los costados siguen mostrando la foto. El resplandor sirve sobre fotos muy cargadas.'));
    if (!sv.modo) return caja;

    var col = document.createElement('input');
    col.type = 'color';
    col.value = /^#[0-9a-f]{6}$/i.test(sv.color || '') ? sv.color : '#fcfbf8';
    col.style.cssText = 'width:64px;height:30px;padding:0;border:1px solid #ddd;border-radius:6px';
    col.oninput = function () { suave(d).color = col.value; refrescar(); };
    caja.appendChild(fila('Color', col, 'Claro detrás de letra oscura; oscuro detrás de letra clara.'));

    var r = document.createElement('input');
    r.type = 'range'; r.min = '0'; r.max = '100'; r.step = '2';
    r.value = String(Math.round(((typeof sv.fuerza === 'number') ? sv.fuerza : 0.6) * 100));
    r.style.cssText = 'flex:1';
    var num = document.createElement('span');
    num.style.cssText = 'font-size:11.5px;font-weight:700;min-width:34px;text-align:right';
    num.textContent = r.value + '%';
    r.oninput = function () { suave(d).fuerza = parseInt(r.value, 10) / 100; num.textContent = r.value + '%'; refrescar(); };
    var fl = document.createElement('div');
    fl.style.cssText = 'display:flex;align-items:center;gap:9px';
    fl.appendChild(r); fl.appendChild(num);
    caja.appendChild(fila('Intensidad', fl));

    if (sv.modo === 'halo' || sv.modo === 'ambos') {
      var dn = document.createElement('select');
      dn.style.cssText = 'width:100%';
      [['todos', 'Todos los textos'], ['titulos', 'Sólo los títulos y los nombres'], ['chicos', 'Sólo los textos chicos (párrafos y rótulos)']]
        .forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; dn.appendChild(op); });
      dn.value = sv.donde || 'todos';
      dn.onchange = function () { suave(d).donde = dn.value; refrescar(); };
      caja.appendChild(fila('Sobre qué textos va el resplandor', dn));
    }
    return caja;
  }

  /* ⚠️⚠️ EL AVISO DE «NO SE LEE», A LA VISTA DE JAZMÍN. (1/10/2026)
     El corrector de colores (reglas-duras.js) arregla casi todo solo, pero
     sobre una foto muy cargada —con claros y oscuros a la vez— no hay color
     de letra que alcance: ahí lo único que sirve es apagar más el fondo, y
     eso lo decide Jazmín. El corrector cuenta esos textos en
     `__REGLA4.flojos`; acá se lee de la miniatura (que ES la invitación de
     verdad, mismo motor, mismo fondo) y se le dice en palabras, justo debajo
     de la perilla que lo arregla. Se vuelve a mirar cada segundo y medio
     mientras el panel del fondo esté abierto. */
  function avisoLectura() {
    var a = document.createElement('div');
    a.setAttribute('data-aviso-lectura', '1');
    a.style.cssText = 'font-size:12px;line-height:1.4;margin:-4px 0 12px;padding:8px 10px;border-radius:8px;display:none';
    function mirar() {
      if (!a.isConnected) return;
      var r = null;
      try { r = document.getElementById('pv-frame').contentWindow.__REGLA4; } catch (e) {}
      var f = (borrador() && borrador().fx && borrador().fx.fondo) || {};
      if (!r || !f.tipo || !f.url) { a.style.display = 'none'; }
      else if (r.flojos > 0) {
        a.style.display = 'block';
        a.style.background = '#fff4e5'; a.style.color = '#7a3d00';
        a.innerHTML = '<b>Con este fondo hay ' + (r.flojos === 1 ? 'un texto que cuesta' : r.flojos + ' textos que cuestan') +
          ' leerse</b>' + (r.flojosTxt && r.flojosTxt.length ? ' (por ejemplo «' + r.flojosTxt[0].replace(/</g, '&lt;') + '»)' : '') +
          '. Subí «Cuánto se apaga el fondo» hasta que este aviso se vaya, o elegí un fondo más liso.';
      } else {
        a.style.display = 'block';
        a.style.background = '#e9f6ee'; a.style.color = '#1f5c3a';
        a.innerHTML = ico('tilde') + ' Con este fondo todos los textos se leen.';
      }
      setTimeout(mirar, 1500);
    }
    setTimeout(mirar, 800);
    return a;
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
    /* la casa de este bloque la decide el panel (invCasa en admin/3-evento.js):
       antes se colgaba del primer «.mejoras» y salía en cinco pestañas */
    var m = window.invCasa ? window.invCasa(ID) : document.querySelector('.mejoras');
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
