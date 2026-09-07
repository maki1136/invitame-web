/* ===== EL LOGO DEL ADMIN ======================================================

   QUÉ ES
   La imagen del logo que va arriba a la izquierda del panel (342x387 px, 9 KB).

   POR QUÉ ESTÁ ACÁ Y NO ADENTRO DE admin.html
   Antes vivía como base64 adentro del HTML. Al partir admin.html (7/9/2026) hubo
   que sacarla: son 12.364 caracteres al azar y no hay forma de copiarlos con
   garantía de que lleguen idénticos —un solo carácter cambiado deja la imagen
   rota y no se nota hasta que alguien la mira—.
   Acá va sola, en su propio archivo: si algún día llega mal, se cambia ESTE
   archivo y no se toca nada más.

   ⚠️ CÓMO SE VERIFICA QUE LLEGÓ BIEN
   El md5 del PNG decodificado tiene que dar  333729cbd8291f3c4c82840a550bcc47
   y el del texto de abajo                    dc03273707f6f2e0d06c23423d56933e
   (9.271 bytes de imagen · 12.364 caracteres de texto).
   Es el mismo método que usan /efectos/perla.js y /colecciones/pieza-*.js.

   ★ SI ALGÚN DÍA SE PUEDE SUBIR EL .PNG DE VERDAD al repo, es mejor: se borra
     este archivo, se sube `invitame-logo-admin.png` a la raíz y en admin.html
     se le pone `src="/invitame-logo-admin.png"` al `<img class="blogo">`.
     Una imagen de verdad se cachea; ésta viaja en cada carga del panel.
   ============================================================================ */
(function () {
  'use strict';

  if (!/admin\.html$/.test(location.pathname)) return;   /* sólo en el panel */

  var B64 = ''
  + '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'
  + 'c5ls2Rkr43QI7EyjxqnRFuJMo7rEiUYdu//I1+vmzrcaFSca9epBfxMzmp5ntVpONOrdgctRhxCIE43qGhrVAhrVAhq1hHIzGfuV'
  + '+kYtdVBR6yUg5479bTB9tJb6TLWBRrWAj7+k7X8/ocZXXpIkffmrP9Z8sJH6TO3+rn+6QSXp7b/8ruZLMKlv1OI1sJlqvQRjpVHL'
  + 'rTaRFlYaNcxLF3Fk7eM//mz+ZY+F+oN9r3X5eqySsz/9Tc3bqHUoqLURKkWtXZt0d+ByoNXQikN4ahkpGGQb3d/1T9fWocN9NR9R'
  + 'WW/UNEr9t78NNKoFNKoFNKoFNKoFNKoFNKoFNKoFNKoFNKoFNKoFNKp5h2hUw7xCvodGNWulxMffpM+8Qv62xCVqU2atdkSj1maf'
  + 'V8j3zn0wrY16cca/B0v9u9KKEwuJS6O+VcsvETeRN2oSF7yJ9Ns/iQ0qRdeo15LaoFI0H/+Vxf5cUoXaqEnOzplC+/inpUGlcBr1'
  + 'YpoaVLL/8U/lYrXWGjVt2TmTlY9/mhtUMt+on6W9QSWDH38a8wUjmUqDzlZzo9Kg89XSqPto0NKqqqk0ZmWBM5UGXViQRn1Cg/qz'
  + 'SNJbPl73M6+QX2I7mKSom5iYWGjZ5FQev9dietX0Eg17xyvkV4QeUQLMWop+IblMtlfSf9gLBylzR9Jer5A/7efFFZM1l8melrTV'
  + 'UGCAH2e8Qn5bqSdKJusCfQIgFHOPjmYlay6T9SSdCDkmoJLpAXfT5wFymWyPSFTEz1e5TLZdmkrWXCa7RNLBSEMCyvuH5O+8FRAH'
  + '3AYIZxwkWeGMRblMdkPUQQB+UFnhDJIVziBZ4QySFc4gWeEMkhXOIFnhDJIVzoh8irBatXSsUcubr0uSRm/cdG4J8bipb2pQ2+7J'
  + 'sc9j9x7GZv16ydFk9Qp5X68zvTptUtU3NZRdEHH9kX2SpNHhWzq7+f0ww5rHqW5AfVOD70SVJpO61qU+k65x2VJfK3c2t60M1PY2'
  + 'OJWs1SyH+vbxDy1EkhzFyukCp5L17rkrgd9Ty5qYiBenkvXL9/4Q6PXjz57XvJAq4sO5A6ziQdP2v5+YtRT9THE4GIB5ziVr0ak3'
  + 'dkUdAkLmVDcA6UaywhnOdgM6T32klo41JZ8bOtxn7MBq7aE9avt16RmUrvYc1fCxM4G219q1SWt/v0f1i/2f/7177oou7T2s8afP'
  + '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';

  function poner() {
    var i = document.querySelector('.blogo');
    if (!i) return false;
    i.src = 'data:image/png;base64,' + B64;
    return true;
  }

  if (!poner()) document.addEventListener('DOMContentLoaded', poner);
})();
