/* ═══════════════════════════════════════════════════════════════════════
   LOS ÍCONOS DEL PANEL · 8/9/2026
   ═══════════════════════════════════════════════════════════════════════

   POR QUÉ EXISTE ESTE ARCHIVO
   Maki: «cambiá todos los emojis que veas por otros de diseño real; tiene
   que ser acorde a lo que vendemos, no podemos meter emojis tradicionales».

   Un emoji no es un dibujo nuestro: lo dibuja el sistema operativo. El mismo
   regalito se ve distinto en Mac, en Windows y en Android, tiene color propio
   que nunca coincide con la marca, y en una pantalla que vende invitaciones
   de boda queda de chat, no de producto.

   Estos son de línea fina y heredan el color del texto que los rodea
   (`currentColor`): cuando el botón es rosa el ícono es rosa, cuando el
   título es bordó el ícono es bordó. Sin archivos, sin pedidos al servidor,
   sin librerías.

   ⚠️ REGLA: en el panel NO va ningún emoji a la vista.
      · Donde hay HTML  → ICO.loquesea
      · Donde NO entra un SVG (alert, confirm, prompt, <option>) → SIN ícono,
        el texto solo. Un emoji ahí es exactamente lo que ella no quiere.

   ⚠️ Este archivo va PRIMERO, antes que 1-campos.js, porque los demás lo usan.
   ═══════════════════════════════════════════════════════════════════════ */

const ICO = (function(){
  /* Todos comparten la misma caja y el mismo grosor de línea: eso es lo que
     hace que se vean de la misma familia y no de cinco lugares distintos. */
  var A = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var Z = '</svg>';

  var D = {
    /* --- barra de arriba --- */
    entrada:   '<path d="M3 13h4l2 3h6l2-3h4"/><path d="M5 5h14l2 8v6H3v-6z"/>',
    carpeta:   '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    copiar:    '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    ticket:    '<path d="M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2.5 2.5 0 0 0 0 6v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2.5 2.5 0 0 0 0-6z"/><path d="M14 6v3M14 13v5"/>',
    bajar:     '<path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 20h16"/>',
    subir:     '<path d="M12 21V9"/><path d="M8 13l4-4 4 4"/><path d="M4 4h16"/>',
    escoba:    '<path d="M15 3l6 6"/><path d="M17 7l-7 7"/><path d="M10 14l-4 7h12l-2-7z"/><path d="M9 17.5h8"/>',

    /* --- acciones de fila --- */
    ojo:       '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/>',
    lapiz:     '<path d="M4 20h4L20 8a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M15 6l3 3"/>',
    tacho:     '<path d="M4 7h16"/><path d="M10 4h4"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    equis:     '<path d="M6 6l12 12M18 6L6 18"/>',
    tilde:     '<path d="M4 12.5l5 5L20 6.5"/>',
    enlace:    '<path d="M10 14a4 4 0 0 0 6 .5l2.5-2.5a4 4 0 0 0-5.7-5.7L11.5 7.6"/><path d="M14 10a4 4 0 0 0-6-.5L5.5 12a4 4 0 0 0 5.7 5.7l1.3-1.3"/>',
    diagonal:  '<path d="M7 17L17 7"/><path d="M9 7h8v8"/>',
    flecha:    '<path d="M4 12h15"/><path d="M14 7l5 5-5 5"/>',

    /* --- estructura y orden --- */
    ordenar:   '<path d="M8 4v16"/><path d="M5 7l3-3 3 3"/><path d="M16 20V4"/><path d="M13 17l3 3 3-3"/>',
    agarre:    '<path d="M8 7h8M8 12h8M8 17h8"/>',
    sube:      '<path d="M7 14.5l5-5 5 5"/>',
    baja:      '<path d="M7 9.5l5 5 5-5"/>',
    actualizar:'<path d="M12 20V6"/><path d="M7 11l5-5 5 5"/>',

    /* --- contenido --- */
    mesa:      '<path d="M3 10h18"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M6 10v10M18 10v10"/><path d="M9 14h6"/>',
    nota:      '<circle cx="7" cy="18" r="2.6"/><circle cx="18" cy="16" r="2.4"/><path d="M9.6 18V7l10.8-2v11"/>',
    volumen:   '<path d="M4 9.5h3l4-3.5v12l-4-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    camara:    '<rect x="3" y="6.5" width="18" height="13" rx="3"/><circle cx="12" cy="13" r="3.6"/><path d="M8.5 6.5l1.2-2.2h4.6l1.2 2.2"/>',
    lista:     '<path d="M4 6h9M4 11h9M4 16h5"/><circle cx="16" cy="18" r="2.4"/><path d="M18.4 18V8l3 1"/>',
    regalo:    '<path d="M3.5 11h17v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M2.5 7.5h19V11h-19z"/><path d="M12 7.5V21"/><path d="M12 7.5S10.6 3 8.4 3a2.3 2.3 0 0 0 0 4.5z"/><path d="M12 7.5S13.4 3 15.6 3a2.3 2.3 0 0 1 0 4.5z"/>',
    banco:     '<path d="M3 10l9-5 9 5"/><path d="M4 10v9M9 10v9M15 10v9M20 10v9"/><path d="M2.5 21h19"/>',
    clima:     '<circle cx="9" cy="9.5" r="3.2"/><path d="M9 3.4v1.4M9 14.2v1.4M3.4 9.5h1.4M13.2 9.5h1.4M5.1 5.6l1 1M11.9 12.4l1 1M12.9 5.6l-1 1M6.1 12.4l-1 1"/><path d="M9.5 20h8.2a2.9 2.9 0 0 0 .2-5.8 4.1 4.1 0 0 0-7.9-.7A2.8 2.8 0 0 0 9.5 20z"/>',
    corona:    '<path d="M3 8l3.4 2.6L12 5l5.6 5.6L21 8l-1.7 10H4.7z"/><path d="M4.7 20.5h14.6"/>',
    sobre:     '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.6 7l8.4 6 8.4-6"/>',
    telefono:  '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 5.6h3"/><path d="M11 18.6h2"/>',
    percha:    '<path d="M12 8a2.2 2.2 0 1 1 2.2-2.2"/><path d="M12 8v2.2L3.6 16a1.4 1.4 0 0 0 .8 2.6h15.2a1.4 1.4 0 0 0 .8-2.6L12 10.2"/>',
    papel:     '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    planilla:  '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9.5h18M3 14.5h18M9.5 9.5v10M15 9.5v10"/>',
    imagen:    '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.7"/><path d="M3.6 17.5l4.9-4.4 4 3.4 3-2.6 4.9 4"/>',

    /* --- avisos y estados --- */
    destello:  '<path d="M12 2.6l1.9 5.6 5.6 1.9-5.6 1.9L12 17.6l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M18.6 15.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    alerta:    '<path d="M12 3.5L21.5 20H2.5z"/><path d="M12 9.5v4.2"/><path d="M12 17h.01"/>',
    candado:   '<rect x="4.5" y="10" width="15" height="10.5" rx="2.2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/><path d="M12 14v2.5"/>',
    llave:     '<circle cx="8" cy="15.5" r="3.6"/><path d="M10.6 13L20 3.6"/><path d="M17 6.6l2.2 2.2"/><path d="M14.6 9l2.2 2.2"/>',
    campana:   '<path d="M6 17V11a6 6 0 0 1 12 0v6"/><path d="M4.5 17h15"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/>',
    globo:     '<circle cx="12" cy="12" r="8.8"/><path d="M3.5 12h17"/><path d="M12 3.2c2.4 2.6 3.6 5.5 3.6 8.8s-1.2 6.2-3.6 8.8c-2.4-2.6-3.6-5.5-3.6-8.8S9.6 5.8 12 3.2z"/>'
  };

  var o = {};
  for (var k in D) o[k] = A + D[k] + Z;
  return o;
})();
