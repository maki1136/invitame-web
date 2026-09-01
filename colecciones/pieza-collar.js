/* colecciones/pieza-collar.js — el collar de perlas que CRUZA la invitacion.
 * 680x341, WebP, 5.060 B. Generado en Google Flow, procesado a capa multiply.
 *
 * ★★★ ESTA PIEZA NO SE USA COMO LAS OTRAS: VA CON `mix-blend-mode: multiply` ★★★
 *    El archivo NO tiene alfa. El papel de la foto fue dividido por su propio
 *    color hasta quedar BLANCO PURO. En el navegador:
 *        .col-collar{ mix-blend-mode:multiply }
 *    El blanco multiplica por 1 y no pinta nada; solo quedan las perlas y sus
 *    sombras, sobre el color que tenga la seccion.
 *
 *    POR QUE ASI Y NO RECORTADO CON ALFA:
 *      1. Es marfil sobre marfil. El interior de una perla mide casi lo mismo
 *         que el papel: no hay de donde agarrarse para recortar.
 *      2. Recortar MATA LA SOMBRA, y la sombra es lo que hace que el collar se
 *         vea apoyado y no pegado. Maki: «se nota en el relieve, las sombras».
 *      3. Multiplicado sirve en las 20 paletas SIN regenerar el archivo: el
 *         collar toma el tono del papel de cada paleta, como pasaria de verdad.
 *
 *    LO QUE SE PIERDE, dicho de frente: multiply no puede ACLARAR. Los brillos
 *    especulares de las perlas (que en la foto llegan a 255, mas claros que el
 *    papel, que esta en 240) se recortan al color de la seccion. Se pierde algo
 *    de chispa. Entre eso y un recorte con halo marfil, gana el multiplicado.
 *
 *    ⚠️ NO PONERLE `opacity` BAJA: con multiply, bajar la opacidad no lo hace
 *       mas sutil, lo hace GRIS. Para que sea mas discreto, achicarlo.
 *
 * ★★★ POR QUE ESTA FOTO EXISTE, QUE ES LA LECCION CARA ★★★
 *    Yo venia armando la guirnalda repitiendo UNA sola perla recortada por
 *    codigo. Maki: «las perlas de la portada se nota que estan dibujadas».
 *    Y es cierto: repetir una misma foto muchas veces y GRANDE se lee como
 *    patron, no como perla — todas identicas, mismo brillo, misma orientacion.
 *    Un collar de verdad tiene perlas distintas.
 *    → La perla repetida SIRVE en chico y sutil: el hilo entre secciones, la
 *      linea del programa, los corazones. NO sirve como pieza protagonista.
 *      Para eso hace falta la foto de un collar de verdad, que es esta.
 *
 * ★ EL COLLAR ENTRA Y SALE POR LOS DOS BORDES a proposito: «pasan por la
 *   invitacion». Va a ancho completo, sin margenes laterales.
 *
 * suma de control CRC32 = 1426521797 · 5.060 bytes
 */
(function () {
  'use strict';
  window.INVPIEZAS = window.INVPIEZAS || {};
  window.INVPIEZAS.collar = 'data:image/webp;base64,' +
'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';
})();
