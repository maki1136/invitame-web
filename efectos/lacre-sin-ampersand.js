/* ===== EL LACRE DE UNA SOLA INICIAL =========================================

   POR QUÉ EXISTE ESTE ARCHIVO — y es la parte importante, no el código.

   23/9/2026, armando la muestra de Sirena (`marisol-mis15`, unos XV): el sello
   del sobre decia **«M&»**. Un ampersand colgado, sin nada del otro lado, en lo
   PRIMERO que ve cualquiera que abre la invitacion.

   No era un dato mal cargado. El motor (i/index.html) lo arma asi:

       const _i = (ev.n1.trim()[0]||'') + '&' + ((ev.n2||'').trim()[0]||'');

   El `&` va SIEMPRE. En una boda («Camila» + «Tomas») da «C&T» y esta bien. En
   unos XV `n2` esta vacio y queda «M&».

   Y hay una trampa mas: el motor SI mira `fx.sobre.ini` en su pasada de FX
   (linea 1565), pero la linea de arriba corre DESPUES y se lo pisa. O sea que
   cargar la inicial a mano desde el panel NO alcanza — probado y medido.

   ⚠️ POR QUE UN MODULO Y NO UN ARREGLO EN EL HTML
   El motor esta CONGELADO POR VERSION: las invitaciones se sirven desde
   i/v/<version>/index.html y hay varias versiones vivas. Un arreglo en el HTML
   no llega a NINGUNA invitacion ya entregada; un modulo llega a todas. Es la
   misma razon por la que existe `videos-blindados.js`.

   ⚠️⚠️ LO QUE ESTE ARCHIVO YA ROMPIO UNA VEZ, Y POR QUE AHORA ES MAS CHICO
   La primera version tambien hacia ganar `fx.sobre.ini` cuando habia DOS
   nombres. Sonaba bien —«Jazmin manda»— y cambio una muestra APROBADA:
   `camila-y-tomas` tiene `ini:"C T"` guardado en la base y el motor se lo
   pisaba con «C&T»; mi modulo le devolvio «C T». O sea que una invitacion ya
   entregada podia cambiar de aspecto sola, que es justo lo que no se hace.
   → Con dos nombres NO SE METE. Ni para mejorar. El unico caso que arregla es
     el que estaba roto: un solo nombre.

   QUE HACE
   · Dos nombres cargados → NO se mete, nunca. El motor ya lo arma bien.
   · `fx.sobre.emblema` en 'corazon' o 'anillos' → NO se mete. Son los emblemas
     del panel (❤ y ⚭), y el motor los pone el.
   · Un solo nombre + `fx.sobre.ini` cargado desde el panel → gana el panel.
   · Un solo nombre y sin `ini` → la inicial sola, sin el ampersand colgado.

   QUE NO HACE
   No toca el motor, no toca `reglas-duras.js`, no dibuja nada y no cambia
   ninguna invitacion que tenga los dos nombres cargados.

   ⚠️ Se vuelve a pasar solo cada 1,2 s y NO usa MutationObserver: `INVEV` puede
      llegar despues de `load`, y la invitacion muta en bucle.
   ============================================================================ */
(function () {

  /* Los cuatro sellos que dibuja el motor: el del sobre de solapas, el del
     sobre de triangulos, el que se encima sobre el sello del VIDEO, y el de la
     carta. Los cuatro salen del mismo texto. */
  var IDS = ['seal-ini', 'triseal-ini', 'vseal-ini', 'cf-ini'];

  function quiere() {
    try {
      var ev = window.INVEV || {};

      var a = String(ev.n1 || '').trim();
      var b = String(ev.n2 || '').trim();

      if (!a) return null;   /* todavia no llego el evento */
      if (b)  return null;   /* DOS nombres: no me meto. Ver la nota de arriba. */

      var so = (ev.fx || {}).sobre || {};

      /* el panel puso un emblema: lo escribe el motor, no yo */
      if (so.emblema === 'corazon' || so.emblema === 'anillos') return null;

      /* el panel escribio la sigla: manda eso */
      var puesta = String(so.ini || '').trim();
      if (puesta) return puesta.toUpperCase();

      return a[0].toUpperCase();
    } catch (e) { return null; }
  }

  function pasar() {
    var q = quiere();
    if (!q) return;
    for (var i = 0; i < IDS.length; i++) {
      var e = document.getElementById(IDS[i]);
      if (e && String(e.textContent || '').trim() !== q) e.textContent = q;
    }
  }

  pasar();
  setInterval(pasar, 1200);
  try {
    document.addEventListener('DOMContentLoaded', pasar);
    window.addEventListener('load', pasar);
  } catch (e) {}

  window.INVLACRE1 = { pasar: pasar, quiere: quiere };
})();
