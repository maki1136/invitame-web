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

  function elegir(ev) {
    var c = cierre(ev);
    var gal = (ev && ev.galeria) || [];

    if (c.origen === 'link' && c.url) return c.url;

    if (c.origen === 'galeria' && gal.length) {
      var i = parseInt(c.n, 10);
      if (!(i >= 0 && i < gal.length)) i = gal.length - 1;
      if (gal[i]) return gal[i];
    }

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
     ['link',    'Otra imagen (pegar link)']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      sel.appendChild(op);
    });
    sel.value = datos(d).origen || 'portada';
    function verLink() { cajaLink.style.display = (sel.value === 'link') ? '' : 'none'; }
    sel.onchange = function () { datos(d).origen = this.value; verLink(); refrescar(); };
    verLink();

    caja.appendChild(grupo('Qué foto usar', sel));
    caja.appendChild(cajaLink);
    return caja;
  }

  function anclaje() {
    return document.querySelector('.mejoras');
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
