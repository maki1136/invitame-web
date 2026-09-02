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

   ⚠️ NO toca `fx`. Sólo dibuja opciones. El que guarda es el `onchange` que
      ya tenía el panel.
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

  function arrancar() {
    llenar();
    setInterval(llenar, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
