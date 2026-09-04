/* ===== LOS CAMPOS QUE EL MOTOR LEE Y EL PANEL NO TENÍA =========================

   LA REGLA DE MAKI, QUE YA VA POR LA CUARTA VEZ
   «Todo tiene que poder cambiarse desde el panel, pensando en que Jaz pueda
   cambiar todo.» Un campo que sólo se corrige entrando a la base es, para quien
   arma la invitación, un campo ROTO.

   QUÉ ARREGLA, Y CÓMO SE NOTÓ
   Revisando la muestra `camila-y-tomas` de arriba a abajo aparecieron dos
   agujeros, y los dos se veían en pantalla:

   1. LA MESA DE REGALOS NO TENÍA NINGÚN CAMPO PARA LAS TIENDAS.
      El motor dibuja un botón por cada tienda que tenga link
      (`reg_liverpool`, `reg_amazon`, `reg_sears`, `reg_palacio`,
      `reg_mercadolibre`, y una libre con `reg_otro_n` + `reg_otro_u`), pero el
      panel no mostraba ninguno. Resultado real: la muestra mexicana salió
      publicada con Amazon y un **Mercado Libre argentino**
      (mercadolibre.com.ar) en una boda en Playa del Carmen, y Jazmín no tenía
      cómo corregirlo.
      → En México las de siempre son **Liverpool** y **El Palacio de Hierro**.
        Por eso van primeras en el bloque.

   2. LA BAJADA DE «NUESTRAS PERSONAS» TAMPOCO.
      El motor la lee de `padresKick` y, si está vacía, escribe "Nosotros".
      Maki: «nuestras personas y abajo dice nosotros, no tiene nada que ver».
      El título y el color sí tenían campo; la bajada no.

   POR QUÉ LOS DOS EN UN SOLO ARCHIVO
   Maki, 4/9/2026: «no me gusta eso… quiero que sea lo más simple posible».
   Son dos campos huérfanos: dos archivos nuevos para eso es peor que uno bien
   explicado. Cuando haya que subir `admin.html` a mano, lo correcto es meter
   estos campos en su lista y BORRAR este módulo.

   ⚠️ POR QUÉ NO SE ARREGLA EN admin.html DIRECTAMENTE
   Pesa 159 KB. La herramienta con la que subo archivos escribe el archivo
   entero y tiene un techo medido de ~45 KB por llamada: tocarlo es arriesgarse
   a subirlo cortado y dejar a Jazmín sin panel.

   ⚠️ `D` NO CUELGA DE window: es un `const` del script principal. Se lee con el
      truco de `borrador()`, igual que en panel-carta.js.
   ⚠️ El panel REDIBUJA su HTML en cada cambio: hay que revisar seguido si el
      bloque sigue puesto, y no guardarse referencias a `D.fx`.
   ============================================================================ */
(function () {
  'use strict';

  if (!/admin\.html$/.test(location.pathname)) return;   /* sólo en el panel */

  /* las tiendas, en el orden en que se usan en México */
  var TIENDAS = [
    ['reg_liverpool',    'Liverpool',           'https://mesaderegalos.liverpool.com.mx/…'],
    ['reg_palacio',      'El Palacio de Hierro','https://www.elpalaciodehierro.com/…'],
    ['reg_amazon',       'Amazon México',       'https://www.amazon.com.mx/wedding/…'],
    ['reg_sears',        'Sears',               'https://www.sears.com.mx/…'],
    ['reg_mercadolibre', 'Mercado Libre',       'https://www.mercadolibre.com.mx/…']
  ];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function guardar(clave, valor) {
    if (typeof setB === 'function') { setB(clave, valor); return; }
    var d = borrador(); if (d) d[clave] = valor;
    refrescar();
  }
  function chico(el, css) { el.style.cssText = css; return el; }

  function rotulo(txt) {
    var l = document.createElement('label');
    l.textContent = txt;
    return chico(l, 'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
  }

  function campo(clave, titulo, marca) {
    var d = borrador() || {};
    var f = chico(document.createElement('div'), 'margin:0 0 9px');
    f.appendChild(rotulo(titulo));
    var i = document.createElement('input');
    i.type = 'text';
    i.placeholder = marca || '';
    i.value = d[clave] || '';
    i.style.cssText = 'width:100%';
    i.oninput = function () { guardar(clave, i.value); };
    f.appendChild(i);
    f.__sync = function () {
      var dd = borrador(); if (!dd) return;
      if (document.activeElement === i) return;
      if (i.value !== (dd[clave] || '')) i.value = dd[clave] || '';
    };
    return f;
  }

  /* ---------- bloque 1 · la mesa de regalos ---------- */

  var ID_REG = 'regalos-tiendas';

  function construirRegalos() {
    var caja = document.createElement('div');
    caja.id = ID_REG;
    caja.style.cssText = 'margin:16px 0;padding:12px 0 0;border-top:1px solid rgba(0,0,0,.10)';

    var t = chico(document.createElement('div'), 'font-size:13px;font-weight:600;margin-bottom:2px');
    t.textContent = 'Las tiendas de la mesa de regalos';
    caja.appendChild(t);

    var a = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35');
    a.textContent = 'Pegá el link de cada mesa. La que dejes vacía no aparece: ' +
                    'sólo se dibuja un botón por cada link cargado.';
    caja.appendChild(a);

    var hijos = [];
    TIENDAS.forEach(function (t2) {
      var f = campo(t2[0], t2[1], t2[2]);
      hijos.push(f); caja.appendChild(f);
    });

    /* una tienda libre, para lo que no esté en la lista */
    var sep = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin:10px 0 6px');
    sep.textContent = 'Otra tienda (por si usan una que no está arriba)';
    caja.appendChild(sep);
    var fn = campo('reg_otro_n', 'Cómo se llama', 'Ej: Coppel');
    var fu = campo('reg_otro_u', 'Su link', 'https://…');
    hijos.push(fn, fu); caja.appendChild(fn); caja.appendChild(fu);

    caja.__sync = function () { hijos.forEach(function (h) { if (h.__sync) h.__sync(); }); };
    return caja;
  }

  /* ---------- bloque 2 · la bajada de «Nuestras personas» ---------- */

  var ID_PER = 'personas-bajada';

  function construirPersonas() {
    var caja = document.createElement('div');
    caja.id = ID_PER;
    caja.style.cssText = 'margin:16px 0;padding:12px 0 0;border-top:1px solid rgba(0,0,0,.10)';

    var t = chico(document.createElement('div'), 'font-size:13px;font-weight:600;margin-bottom:2px');
    t.textContent = 'La bajada de «Personas importantes»';
    caja.appendChild(t);

    var a = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35');
    a.textContent = 'La línea en cursiva que va debajo del título. Si la dejás vacía ' +
                    'dice "Nosotros", que no quiere decir nada.';
    caja.appendChild(a);

    var f = campo('padresKick', 'Qué dice', 'Los que nos trajeron hasta aquí');
    caja.appendChild(f);
    caja.__sync = function () { if (f.__sync) f.__sync(); };
    return caja;
  }

  /* ---------- dónde se montan ----------
     Se cuelgan del campo que ya existe y habla de lo mismo, así cada bloque
     aparece en SU pestaña sin depender de en cuál esté parada Jazmín. */

  function grupoConEtiqueta(re) {
    var todos = document.querySelectorAll('#panel .grp');
    for (var i = 0; i < todos.length; i++) {
      var l = todos[i].querySelector('label');
      if (l && re.test(l.textContent)) return todos[i];
    }
    return null;
  }

  function poner(id, construir, reAncla) {
    var ya = document.getElementById(id);
    if (ya && document.body.contains(ya)) { if (ya.__sync) ya.__sync(); return; }
    var ancla = grupoConEtiqueta(reAncla);
    if (!ancla || !ancla.parentNode) return;
    ancla.parentNode.insertBefore(construir(), ancla.nextSibling);
  }

  function revisar() {
    if (!borrador()) return;
    /* debajo del título de la sección Regalos */
    poner(ID_REG, construirRegalos, /TITULO SECCIÓN "REGALOS"/i);
    /* debajo del título de Personas importantes */
    poner(ID_PER, construirPersonas, /Titulo - Personas importantes/i);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
