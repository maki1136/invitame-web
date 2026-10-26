/* ===== LA FOTO DEL CIERRE (¡Gracias!) =========================================

   EL PROBLEMA — y es de todas las invitaciones, no de una
   El motor cierra con un "¡Gracias!" sobre una foto de fondo que sale de la
   variable CSS `--final`, escrita a mano en el `:root` del index.html con una
   foto de banco de imágenes: una pareja desconocida, novio de traje azul y
   damas de vestido celeste. No sale de ningún campo del panel, así que hoy
   TODAS las invitaciones entregadas terminan con la foto de otra gente.

   En una invitación de boda eso se nota muchísimo: el invitado viene de ver
   seis fotos de los novios y de golpe hay otros dos.

   QUÉ HACE
   Reemplaza `--final` por una foto de la pareja de verdad. Por defecto usa la
   PORTADA, que siempre está cargada, así que sin tocar nada ninguna invitación
   vuelve a terminar con desconocidos. Desde el panel se puede elegir otra.

   DE DÓNDE SACA LA FOTO — `fx.cierre.origen`
     'portada'  la foto de portada (por defecto)
     'galeria'  una foto de la galería, la que diga `fx.cierre.n`
     'link'     una imagen propia, `fx.cierre.url`
   Si lo elegido no existe, baja al escalón anterior y termina en la portada.
   Si no hubiera ni portada, no toca nada y queda la del motor: nunca deja el
   cierre en blanco.

   ⚠️ La variable se pisa en `documentElement` con prioridad, porque el `:root`
   del motor la define en la hoja de estilo y una regla suelta no le gana.

   PENDIENTE: cuando se pueda subir el index.html a mano, sacar la foto de
   stock del `:root` y dejar `--final` vacía. Este módulo puede quedar igual.
   ============================================================================ */
(function () {
  'use strict';

  /* ================= LADO INVITACIÓN ================= */

  function cierre(ev) {
    return (ev && ev.fx && ev.fx.cierre) || {};
  }

  /* La foto que el panel carga en «Foto para el fin de página». Son las tres
     formas en que esa clave pudo quedar escrita (ver /admin/0-claves.js). */
  function finDelPanel(ev) {
    var k = ['img_c_foto-para-el-fin-de-pagina',
             'img_f-foto-para-el-fin-de-p-gina',
             'img_c_foto-para-el-fin-de-p-gina'];
    for (var i = 0; i < k.length; i++) if (ev && ev[k[i]]) return ev[k[i]];
    return null;
  }

  function elegir(ev) {
    var c = cierre(ev);
    var gal = (ev && ev.galeria) || [];

    /* ★ 20/10/2026 (Jazmín, Denisse): «coloco una foto para el fin, la veo en
       la miniatura y en la invitación terminada no aparece». La muestra le
       había dejado `fx.cierre = {origen:'link', url:<foto de la muestra>}` y
       eso le ganaba a la foto que ella SUBIÓ en «Foto para el fin de página».
       Una foto subida para esta fiesta (carpeta raíz `invitame/<código>` de
       Cloudinary, no la subcarpeta de una muestra) es la elección más
       concreta que hay: gana siempre, salvo que elijan a mano la portada. */
    /* ★ 21/10/2026 (Jazmín): «la imagen del diseño» elegida a mano gana siempre */
    if (c.origen === 'diseno' && c.url) return c.url;

    var fin = finDelPanel(ev);
    var finDeMuestra = typeof fin === 'string' && /\/invitame\/[^\/?#]+\/[^?#]/.test(fin);
    if (fin && !finDeMuestra && c.origen !== 'portada') return null;   /* la pone el motor */

    if (c.origen === 'link' && c.url) return c.url;

    if (c.origen === 'galeria' && gal.length) {
      var i = parseInt(c.n, 10);
      if (!(i >= 0 && i < gal.length)) i = gal.length - 1;
      if (gal[i]) return gal[i];
    }

    /* ⚠️⚠️ EL BUG QUE HIZO QUE LA FOTO DEL FIN NUNCA SE VIERA.  (17/9/2026)
       Si el panel cargó una «Foto para el fin de página», el MOTOR ya la puso
       en `--final`. Este módulo la pisaba igual con la PORTADA y con
       `!important`, así que ese campo del panel no servía para nada: el cierre
       repetía siempre la portada. Cargar esa foto ES elegir. Devolver `null`
       deja la del motor, que es justo la correcta.
       Sólo se ignora si en el panel eligieron a mano «La foto de portada». */
    if (c.origen !== 'portada' && finDelPanel(ev)) return null;

    if (ev && ev.cover) return ev.cover;
    if (gal.length) return gal[gal.length - 1];
    return null;                      /* que quede la del motor */
  }

  var ultima = null;

  function aplicar() {
    var ev = window.INVEV;
    if (!ev) return;
    var url = elegir(ev);
    if (!url || url === ultima) return;
    ultima = url;
    document.documentElement.style.setProperty(
      '--final', "url('" + String(url).replace(/'/g, "\\'") + "')", 'important');
  }

  /* ================= LADO PANEL ================= */

  var ID = 'cierre-ajustes';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }

  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.cierre) d.fx.cierre = {};
    return d.fx.cierre;
  }

  function grupo(etiqueta, campo) {
    var g = document.createElement('div');
    g.className = 'grp';
    var l = document.createElement('label');
    l.textContent = etiqueta;
    g.appendChild(l);
    g.appendChild(campo);
    return g;
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,0,0,.10)';

    var titulo = document.createElement('div');
    titulo.textContent = 'La foto del cierre';
    titulo.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(titulo);

    var ayuda = document.createElement('div');
    ayuda.textContent = 'Es la foto de atrás del "¡Gracias!", al final de todo. Si no elegís nada, usa la portada.';
    ayuda.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(ayuda);

    var link = document.createElement('input');
    link.type = 'text';
    link.placeholder = 'Pegá acá el link de la imagen';
    link.value = datos(d).url || '';
    link.oninput = function () { datos(d).url = this.value; refrescar(); };

    var cajaLink = grupo('Link de la imagen', link);

    var sel = document.createElement('select');
    [['portada', 'La foto de portada'],
     ['galeria', 'La última foto de la galería'],
     ['diseno',  'La imagen del diseño (la del catálogo)'],
     ['link',    'Otra imagen (pegar link)']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      sel.appendChild(op);
    });
    sel.value = datos(d).origen || 'portada';
    function verLink() { cajaLink.style.display = (sel.value === 'link') ? '' : 'none'; }
    sel.onchange = function () {
      var v = this.value;
      datos(d).origen = v; verLink();
      if (v === 'diseno') { traerDelDiseno(d, sel); return; }
      refrescar();
    };
    verLink();

    caja.appendChild(grupo('Qué foto usar', sel));
    caja.appendChild(cajaLink);

    /* 23/10/2026 (citlalli): «en vez de que diga gracias al inicio, quiero que el
       gracias esté abajo de esta frase». La frase final (el «¡Gracias!» /
       «¡Te esperamos!») va DEBAJO del texto final. Lo pinta efectos/cierre-orden.js */
    var labAb = document.createElement('label');
    labAb.style.cssText = 'display:flex;gap:7px;align-items:center;font-size:12.5px;margin:10px 0 0;cursor:pointer';
    var chkAb = document.createElement('input'); chkAb.type = 'checkbox';
    chkAb.checked = !!datos(d).fraseAbajo;
    chkAb.onchange = function () { datos(borrador() || d).fraseAbajo = chkAb.checked; refrescar(); };
    labAb.appendChild(chkAb);
    labAb.appendChild(document.createTextNode('La frase final («¡Gracias!») abajo del texto final, no arriba'));
    caja.appendChild(labAb);

    /* ★ 26/10/2026 (citlalli): dónde va el texto y una imagen arriba. Lo pinta efectos/cierre-orden.js */
    var selP = document.createElement('select');
    [['abajo', 'Abajo (como viene)'], ['centro', 'Centrado'], ['arriba', 'Arriba']].forEach(function (o) {
      var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; selP.appendChild(op);
    });
    selP.value = datos(d).pos || 'abajo';
    selP.onchange = function () { datos(borrador() || d).pos = selP.value; refrescar(); };
    var gP = grupo('Ubicación del texto del cierre', selP); gP.style.marginTop = '10px';
    caja.appendChild(gP);

    var fila = document.createElement('div');
    fila.style.cssText = 'display:flex;align-items:center;gap:10px;margin:10px 0 4px';
    var ver = document.createElement('div');
    ver.style.cssText = 'width:52px;height:52px;border-radius:10px;background:#f4efea center/contain no-repeat;flex:none';
    var sub = document.createElement('label'); sub.style.cssText = 'cursor:pointer;color:#6D1233;font-weight:600;font-size:12.5px';
    sub.textContent = 'Subir imagen de arriba (ej. argollas)';
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none'; sub.appendChild(inp);
    var qt = document.createElement('button'); qt.type = 'button'; qt.textContent = 'Quitar'; qt.style.cssText = 'cursor:pointer;padding:4px 10px;font-size:12px';
    fila.appendChild(ver); fila.appendChild(sub); fila.appendChild(qt);
    caja.appendChild(fila);
    var tam = document.createElement('input'); tam.type = 'range'; tam.min = 60; tam.max = 320; tam.step = 10; tam.style.cssText = 'width:100%';
    var gT = grupo('Tamaño de la imagen de arriba', tam);
    caja.appendChild(gT);
    function pintarImg() {
      var c = datos(borrador() || d);
      ver.style.backgroundImage = c.img ? 'url("' + c.img + '")' : 'none';
      tam.value = parseInt(c.imgTam, 10) || 150;
      gT.style.display = c.img ? '' : 'none';
    }
    inp.onchange = async function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      if (!window.INV || !INV.uploadImage) { alert('Todavía no cargó la base. Esperá 2 seg.'); return; }
      sub.firstChild.textContent = 'Subiendo…';
      try { var u = await INV.uploadImage(f); datos(borrador() || d).img = u; pintarImg(); refrescar(); }
      catch (e) { alert('No pude subir la imagen. Probá de nuevo.'); }
      sub.firstChild.textContent = 'Subir imagen de arriba (ej. argollas)';
    };
    qt.onclick = function () { datos(borrador() || d).img = ''; pintarImg(); refrescar(); };
    tam.oninput = function () { datos(borrador() || d).imgTam = parseInt(tam.value, 10); refrescar(); };
    pintarImg();
    return caja;
  }

  /* ★ 21/10: la imagen del cierre de la muestra del catálogo elegida (D.tpl) */
  function traerDelDiseno(d, sel) {
    var M = window.MUESTRAS_INVITAME || {}, t = String(d.tpl || '');
    var m = M[t] || M[t.toLowerCase()] || Object.keys(M).map(function (k) { return M[k]; })
              .filter(function (x) { return x && String(x.nombre || '').toLowerCase() === t.toLowerCase(); })[0];
    if (!m || !m.muestra || !window.INVVESTIR || !INVVESTIR.bajarMuestra) {
      alert('Primero elegí el diseño en PRINCIPAL → «Diseño del catálogo».'); sel.value = 'portada'; datos(d).origen = 'portada'; refrescar(); return;
    }
    INVVESTIR.bajarMuestra(m.muestra).then(function (mu) {
      var u = (mu.fx && mu.fx.cierre && mu.fx.cierre.url) || mu['img_c_foto-para-el-fin-de-pagina'] ||
              mu['img_f-foto-para-el-fin-de-p-gina'] || mu.cover || '';
      if (!u) { alert('El diseño elegido no trae una imagen para el cierre.'); sel.value = 'portada'; datos(d).origen = 'portada'; refrescar(); return; }
      datos(d).url = u; refrescar();
    }).catch(function () { alert('No se pudo traer la imagen del diseño. Probá de nuevo.'); });
  }

  function anclaje() {
    /* su casa es PRINCIPAL, junto a la frase final (invCasa en admin/3-evento.js) */
    return window.invCasa ? window.invCasa(ID) : document.querySelector('.mejoras');
  }

  function revisarPanel() {
    var d = borrador();
    if (!d) return;
    if (document.getElementById(ID)) return;
    var a = anclaje();
    if (!a) return;                    /* la pestaña de Efectos no está abierta */
    a.appendChild(construir(d));
  }

  /* ================= ARRANQUE ================= */

  function esPanel() {
    return !!(borrador() || document.querySelector('.mejoras'));
  }

  function arrancar() {
    if (esPanel()) { setInterval(revisarPanel, 700); revisarPanel(); return; }
    aplicar();
    /* INVEV puede llegar después, y el panel manda datos nuevos por postMessage */
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 300);
    window.addEventListener('message', function () { setTimeout(aplicar, 60); });
  }

  var i = 0;
  var esperar = setInterval(function () {
    if (window.INVEV || esPanel() || ++i > 40) { clearInterval(esperar); arrancar(); }
  }, 250);
})();
