/* ===== EL SELECTOR DE SOBRES DEL PANEL, LLENO ================================

   EL BUG, que estuvo escondido mucho tiempo
   En ✨ Efectos → «Sobre del catálogo» hay un `<select>` que tiene que listar
   los sobres de `/sobres/catalogo.js`. Estaba **vacío**: la única opción era
   «— Elegí un sobre —». O sea que, desde el panel, **no se podía elegir ningún
   sobre de entrada**. Nunca.

   POR QUÉ
   El admin hace, arriba de todo y una sola vez:

       const SOBRES = window.SOBRES_INVITAME || {};

   Esa línea corre cuando el navegador lee el script del HTML. Pero
   `catalogo.js` se carga aparte y llega DESPUÉS. Cuando llega, `SOBRES` ya
   quedó congelado en `{}` — es una copia, no una referencia — y ningún
   `renderPanel()` posterior la vuelve a mirar.

   ⚠️ LA TRAMPA GENERAL: `const X = window.Y || {}` al principio de un archivo
      congela el valor. Si `Y` lo publica otro script que llega después, X se
      queda vacío para siempre y **no hay error**: sólo una lista vacía. Esto
      ya pasó acá; si aparece otra lista vacía en el panel, mirar esto primero.

   POR QUÉ SE ARREGLA DESDE ACÁ Y NO EN EL HTML
   `admin.html` pesa 200 KB y se sube a mano. Un módulo de /efectos/ hace el
   mismo trabajo, se carga solo y no obliga a tocarlo.

   QUÉ HACE
   Busca el `<select>` cuyo `onchange` escribe `sobre.modelo` —esa es la firma,
   no depende de textos ni de posiciones— y le pone las opciones que faltan,
   leyendo `window.SOBRES_INVITAME` en el momento. Respeta el valor que ya
   estaba puesto.

   ⚠️ Se repasa cada 600 ms a propósito: el panel llama a `renderPanel()` en
      cada cambio y REEMPLAZA el HTML entero, así que el select vuelve a nacer
      vacío una y otra vez. No alcanza con llenarlo una vez.

   ⚠️ El selector de sobres NO toca `fx`. Sólo dibuja opciones. El que guarda es
      el `onchange` que ya tenía el panel.

   ───────────────────────────────────────────────────────────────────────────
   Y ADEMÁS: EL LACRE  (4/9/2026)

   El motor lee CUATRO campos del lacre —`sello`, `emblema`, `ini` y
   `selloColor`— y NINGUNO tenía control en el panel. Se pagó caro: la muestra
   oficial `camila-y-tomas` salió publicada con `sello:false`, o sea con el
   lacre del sobre VACÍO. Es lo primero que ve cualquiera que abre la
   invitación, y no había forma de arreglarlo sin entrar a la base.

   Va acá adentro, y no en un archivo nuevo, a propósito: el sobre es UNA cosa
   y tiene que tener UN bloque. Menos archivos sueltos, menos que recordar.

   ⚠️ EL LACRE DE LA FOTO Y LAS LETRAS SON DOS COSAS DISTINTAS
      Los sobres del catálogo traen el lacre FOTOGRAFIADO (una gota de cera de
      verdad, con su relieve). Lo que este bloque prende no es esa cera: es la
      capa `.seal`, que es transparente y sólo escribe las iniciales ENCIMA. Por
      eso apagarla deja la cera muda, no la saca.

   ⚠️ `sello` VIENE PRENDIDO POR DEFECTO en el motor (`sello:true`). Al apagarlo
      hay que escribir `false` de verdad, no borrar la clave.

   ⚠️ `emblema` manda sobre `ini`: si dice 'corazon' o 'anillos', el motor
      dibuja ❤ o ⚭ y las iniciales no se ven. Por eso el campo de las iniciales
      se esconde cuando no corresponde.
   ============================================================================ */
(function () {

  function catalogo() {
    var c = window.SOBRES_INVITAME;
    return (c && typeof c === 'object') ? c : null;
  }

  /* la firma: es el único select del panel que escribe sobre.modelo */
  function selector() {
    var todos = document.querySelectorAll('select[onchange]');
    for (var i = 0; i < todos.length; i++) {
      var h = todos[i].getAttribute('onchange') || '';
      if (h.indexOf('sobre.modelo') >= 0) return todos[i];
    }
    return null;
  }

  function llenar() {
    var sel = selector();
    if (!sel) return;
    var cat = catalogo();
    if (!cat) return;

    var claves = Object.keys(cat);
    if (!claves.length) return;

    /* ¿ya está lleno? no lo toco: si lo redibujo pierdo el foco y el desplegable
       se cierra solo mientras Jazmín lo está mirando */
    if (sel.options.length > claves.length) return;

    var elegido = sel.value;
    /* si el select nació vacío, el valor de verdad está en el borrador */
    if (!elegido) {
      try {
        elegido = ((D.fx || {}).sobre || {}).modelo || '';
      } catch (e) { elegido = ''; }
    }

    var html = '<option value="">— Elegí un sobre —</option>';
    claves.forEach(function (k) {
      var nombre = (cat[k] && cat[k].nombre) ? cat[k].nombre : k;
      html += '<option value="' + k + '"' + (k === elegido ? ' selected' : '') + '>' +
              String(nombre).replace(/</g, '&lt;') + '</option>';
    });
    sel.innerHTML = html;
    if (elegido) sel.value = elegido;
  }

  /* ===== EL LACRE ============================================================ */

  var ID_LACRE = 'lacre-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* ⚠️ se llama de nuevo en cada handler: el panel REEMPLAZA D.fx cuando llega
     el evento, y una referencia vieja queda huérfana (parece que guarda y no
     guarda). Misma nota que en panel-carta.js y panel-itinerario.js. */
  function datosSobre(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.sobre) d.fx.sobre = {};
    return d.fx.sobre;
  }

  function chico(el, css) { el.style.cssText = css; return el; }

  function construirLacre(d) {
    var caja = document.createElement('div');
    caja.id = ID_LACRE;
    caja.style.cssText = 'margin:14px 0 4px;padding:12px 0 0;border-top:1px solid rgba(0,0,0,.10)';

    var t = chico(document.createElement('div'),
      'font-size:13px;font-weight:600;margin-bottom:2px');
    t.textContent = 'El lacre del sobre';
    caja.appendChild(t);

    var a = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35');
    a.textContent = 'La cera ya viene en la foto del sobre. Acá se elige qué se escribe encima.';
    caja.appendChild(a);

    /* ---- mostrar o no ---- */
    var filaOn = chico(document.createElement('label'),
      'display:flex;align-items:center;gap:7px;font-size:12px;margin:0 0 10px;cursor:pointer');
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = (datosSobre(d).sello !== false);
    chk.onchange = function () {
      datosSobre(borrador() || d).sello = chk.checked ? true : false;
      acomodar(); refrescar();
    };
    filaOn.appendChild(chk);
    filaOn.appendChild(document.createTextNode('Escribir sobre el lacre'));
    caja.appendChild(filaOn);

    var cuerpo = document.createElement('div');
    caja.appendChild(cuerpo);

    /* ---- qué lleva ---- */
    var fEm = chico(document.createElement('div'), 'margin:0 0 10px');
    var lEm = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lEm.textContent = 'Qué lleva';
    fEm.appendChild(lEm);
    var selEm = chico(document.createElement('select'), 'width:100%');
    [['iniciales', 'Las iniciales'],
     ['corazon',   'Un corazón'],
     ['anillos',   'Dos anillos']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      selEm.appendChild(op);
    });
    selEm.value = datosSobre(d).emblema || 'iniciales';
    selEm.onchange = function () {
      datosSobre(borrador() || d).emblema = selEm.value;
      acomodar(); refrescar();
    };
    fEm.appendChild(selEm);
    cuerpo.appendChild(fEm);

    /* ---- las iniciales ---- */
    var fIni = chico(document.createElement('div'), 'margin:0 0 10px');
    var lIni = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lIni.textContent = 'Las iniciales';
    fIni.appendChild(lIni);
    var iIni = document.createElement('input');
    iIni.type = 'text'; iIni.placeholder = 'C&T';
    iIni.value = datosSobre(d).ini || '';
    iIni.style.cssText = 'width:100%';
    iIni.oninput = function () { datosSobre(borrador() || d).ini = iIni.value; refrescar(); };
    fIni.appendChild(iIni);
    var hIni = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-top:3px;line-height:1.35');
    hIni.textContent = 'Cortitas: dos o tres letras. Se escriben en cursiva sobre la cera.';
    fIni.appendChild(hIni);
    cuerpo.appendChild(fIni);

    /* ---- color de las letras ---- */
    var fCol = chico(document.createElement('div'), 'margin:0 0 4px');
    var lCol = chico(document.createElement('label'),
      'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
    lCol.textContent = 'Color de las letras';
    fCol.appendChild(lCol);
    var filaCol = chico(document.createElement('div'), 'display:flex;align-items:center;gap:6px');
    var iCol = document.createElement('input');
    iCol.type = 'color';
    iCol.value = datosSobre(d).selloColor || '#8d7f74';
    iCol.style.cssText = 'width:46px;height:32px;padding:0;border:0;background:none;cursor:pointer';
    iCol.oninput = function () { datosSobre(borrador() || d).selloColor = iCol.value; refrescar(); };
    var bCol = chico(document.createElement('button'),
      'cursor:pointer;padding:4px 8px;font-size:11.5px');
    bCol.type = 'button'; bCol.textContent = 'Sacar';
    bCol.title = 'Volver al color de la colección';
    bCol.onclick = function () { datosSobre(borrador() || d).selloColor = ''; refrescar(); };
    filaCol.appendChild(iCol); filaCol.appendChild(bCol);
    fCol.appendChild(filaCol);
    cuerpo.appendChild(fCol);

    function acomodar() {
      var c = datosSobre(borrador() || d);
      var prendido = (c.sello !== false);
      cuerpo.style.opacity = prendido ? '1' : '.42';
      cuerpo.style.pointerEvents = prendido ? '' : 'none';
      /* con corazón o anillos, las iniciales no se ven: no tiene sentido pedirlas */
      fIni.style.display = ((c.emblema || 'iniciales') === 'iniciales') ? '' : 'none';
    }
    acomodar();

    caja.__sync = function () {
      var dd = borrador(); if (!dd) return;
      if (document.activeElement && caja.contains(document.activeElement)) return;
      var c = datosSobre(dd);
      var quiero = (c.sello !== false);
      if (chk.checked !== quiero) chk.checked = quiero;
      var em = c.emblema || 'iniciales';
      if (selEm.value !== em) selEm.value = em;
      if (iIni.value !== (c.ini || '')) iIni.value = c.ini || '';
      if (c.selloColor && iCol.value !== c.selloColor) iCol.value = c.selloColor;
      acomodar();
    };

    return caja;
  }

  /* se monta pegado al selector de sobres: es el mismo tema y la misma pestaña.
     ⚠️ el panel redibuja su HTML en cada cambio, así que hay que revisar seguido
     si el bloque sigue puesto. */
  function revisarLacre() {
    var d = borrador(); if (!d) return;
    var ya = document.getElementById(ID_LACRE);
    if (ya && document.body.contains(ya)) { if (ya.__sync) ya.__sync(); return; }
    var sel = selector(); if (!sel) return;
    var anclaje = sel.closest ? (sel.closest('.grp') || sel.parentElement) : sel.parentElement;
    if (!anclaje || !anclaje.parentNode) return;
    anclaje.parentNode.insertBefore(construirLacre(d), anclaje.nextSibling);
  }

  function arrancar() {
    llenar();
    setInterval(llenar, 600);
    revisarLacre();
    setInterval(revisarLacre, 700);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
