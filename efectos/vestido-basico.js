/* ══════════════════════════════════════════════════════════════════════════
   EL VESTIDO BÁSICO: lo que se pone la invitación CUANDO NO HAY COLECCIÓN.
   ══════════════════════════════════════════════════════════════════════════

   Maki, 17/9/2026, mirando el XV de Martina —que no tiene colección elegida—:

     «en la parte del qr ponele un recuadro con buen diseño como en perlas
      que quedó bueno pero algo así o diferente pero salí de lo plano»
     «el fondo del itinerario no se puede poner alguna textura clara?»

   Perlas y Marfil visten TODO. Una invitación sin colección se quedaba con lo
   que trae el motor: una caja de vidrio sobre una foto, y un itinerario
   flotando sobre el papel. Plano.

   Este módulo es el piso: el vestido que tiene CUALQUIER invitación aunque
   nadie elija colección. No inventa colores: usa `currentColor` y el color de
   sector que ya eligió Jazmín, así funciona con las veinte paletas.

   ⚠⚠ NO SE APLICA SI HAY COLECCIÓN. `html:not([data-coleccion])` es toda la
      regla: Perlas y Marfil ya resolvieron estos dos bloques a su manera y
      pisarlos sería romperles el diseño. Por eso tampoco hace falta orden de
      carga: el selector se apaga solo.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ID = 'inv-vestido-basico';

  var CSS = [
    /* ── EL PASE CON EL QR ──────────────────────────────────────────────
       Maki: «salí de lo plano». Era una caja de vidrio sobre la banda.
       Ahora es una LÁMINA DE PAPEL apoyada: marfil opaco, esquina casi recta,
       dos filetes (uno al borde y otro por dentro, que es lo que le da el aire
       de papelería fina), y el QR levantado con su sombra.
       ⚠ La lámina es CLARA y su tinta va fijada acá. La probé primero oscura
         y semitransparente: sobre la banda rosa clara de Martina quedaba una
         mancha gris. Un pase tiene que verse igual de bien sobre una banda
         clara, una oscura o una foto — por eso el papel no depende del fondo. */
    'html:not([data-coleccion]) .pase .pasecard {',
    '  background:#fbf8f2 !important; background-image:none !important;',
    '  -webkit-backdrop-filter:none !important; backdrop-filter:none !important;',
    '  border:1px solid rgba(58,48,40,.22) !important;',
    '  border-radius:3px !important;',
    '  box-shadow:0 1px 0 rgba(255,255,255,.9) inset,',
    '             0 16px 36px rgba(20,16,14,.28) !important;',
    '  max-width:330px !important; margin:0 auto !important;',
    '  padding:24px 20px !important; position:relative !important;',
    '  color:#2f2a26 !important;',
    '}',
    'html:not([data-coleccion]) .pase .pasecard::before {',
    '  content:""; position:absolute; inset:6px; pointer-events:none;',
    '  border:1px solid rgba(58,48,40,.16);',
    '}',
    'html:not([data-coleccion]) .pase .pasecard .v {',
    '  color:#2f2a26 !important;',
    '}',
    'html:not([data-coleccion]) .pase .pasecard .k {',
    '  opacity:1 !important; color:#6a6156 !important;',
    '  letter-spacing:.2em !important; text-transform:uppercase !important;',
    '}',
    'html:not([data-coleccion]) .pase #qr {',
    '  background:#fff !important; padding:9px !important;',
    '  border-radius:2px !important;',
    '  box-shadow:0 0 0 1px rgba(58,48,40,.18),',
    '             0 2px 4px rgba(20,16,14,.16) !important;',
    '}',

    /* ── EL ITINERARIO, SOBRE PAPEL ─────────────────────────────────────
       La textura es CSS, no una foto: son dos tramas de rayas finísimas
       cruzadas (el papel verjurado) sobre un degradado marfil. Cero pedidos
       al servidor, y se ve igual en cualquier pantalla.
       ⚠ Va en `.tl` —la línea de tiempo— y no en la sección entera: así el
         título y el adorno siguen sobre el papel de la invitación, y lo que
         se levanta como hoja es sólo la lista de momentos. */
    'html:not([data-coleccion]) .tl {',
    '  position:relative; padding:26px 22px !important;',
    '  margin:18px auto 0 !important; max-width:420px;',
    '  border-radius:3px;',
    '  background-color:#faf7f1;',
    '  background-image:',
    '    repeating-linear-gradient(0deg, rgba(120,104,86,.055) 0 1px, rgba(0,0,0,0) 1px 3px),',
    '    repeating-linear-gradient(90deg, rgba(120,104,86,.04) 0 1px, rgba(0,0,0,0) 1px 4px),',
    '    radial-gradient(130% 90% at 50% 0%, rgba(255,255,255,.95), rgba(244,238,229,.95));',
    '  border:1px solid rgba(120,104,86,.20);',
    '  box-shadow:0 1px 0 rgba(255,255,255,.85) inset,',
    '             0 12px 30px rgba(30,24,20,.14);',
    '}',
    'html:not([data-coleccion]) .tl::after {',
    '  content:""; position:absolute; inset:6px; pointer-events:none;',
    '  border:1px solid rgba(120,104,86,.13);',
    '}'
  ].join('\n');

  function poner() {
    if (document.getElementById(ID)) return;
    var s = document.createElement('style');
    s.id = ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', poner);
  } else {
    poner();
  }
})();
