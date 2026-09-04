<?php
/* ===== LOS TEXTOS EN ESPAÑOL DE MÉXICO =======================================

   Esta lista la usa `i/index.php` para cambiar los textos del motor ANTES de
   mandar el HTML. Vive en un archivo aparte a propósito: agregar una palabra
   tiene que costar dos líneas, no reescribir el render entero.

   POR QUÉ EXISTE
   El motor está escrito en voseo argentino. Hay un módulo que lo traduce
   (`efectos/es-mx.js`) pero es diferido: el primer segundo una novia mexicana
   igual leía "INGRESÁ" y "TOCÁ EL SELLO PARA ABRIR", que es literalmente el
   primer texto de la invitación. Por eso se cambia acá, en el servidor.

   ⚠️ NO SON VOSEO Y NO SE TOCAN NUNCA: "Mamá", "Papá", "está", "esté", "aquí",
   "asistiré", "podré". Terminan igual pero son correctas en todo el idioma.
   Si alguna entrara acá, la invitación diría "Mama y Papa".

   ⚠️ TAMPOCO poner "vos" suelto: aparece adentro de otras palabras y de
   apellidos. Por eso va como frase, "para vos".

   ⚠️ LAS FRASES VAN PRIMERO. "Pasá la voz" no es "Pasa la voz", es "Corre la
   voz". Si se reemplazara la palabra suelta antes, se perdería la frase.

   ★★★ Y TAMBIÉN SE SACAN LOS EMOJIS  (4/9/2026)

   Maki: «donde veas un emoji sacalo». En una invitación de bodas un emoji
   rompe el tono: la tipografía es una serif fina, el papel es lino y al lado
   aparece un globito de chat de sistema operativo.

   Se sacan ACÁ y no en el motor por la misma razón que el voseo: `i/index.html`
   pesa 185 KB, lo comparten todas las invitaciones —incluidas las versiones
   congeladas de /i/v/— y este archivo cambia el texto antes de mandarlo, sin
   parpadeo y sin tocar el motor.

   ⚠️ DOS QUE NO SON DECORACIÓN Y NO SE SACAN NUNCA:
      · `❤` y `⚭` son los EMBLEMAS DEL LACRE. Son una opción del panel
        («Qué lleva: un corazón / dos anillos»). Sacarlos apaga una función.
      · Los íconos del CLIMA (☀️ 🌤️ ☁️ 🌫️ 🌦️ 🌧️ 🌨️) son el pronóstico. Ahí un
        símbolo es información, no adorno. Además viven en un array del motor:
        vaciarlos dejaría la sección muda.

   ⚠️ Y UNO QUE ESTE ARCHIVO NO PUEDE ALCANZAR: lo que escribe un MÓDULO en
      vivo (por ejemplo el aviso de la raspadita) no pasa por acá, porque acá
      se toca el HTML antes de mandarlo. Eso se corrige en el módulo.
   ============================================================================ */

/* Frases completas: se cambian antes que las palabras sueltas. */
$ES_MX_FRASES = array(
  /* --- los emojis, primero: si no, la frase ya cambió y no coincide --- */
  '✦ rascá aquí ✦'                       => 'rascá aquí',
  '¡Genial! Te esperamos con alegría 🌿'  => '¡Genial! Te esperamos con alegría',
  'Gracias por avisarnos 💛'              => 'Gracias por avisarnos',
  '💬 '                                   => '',
  '💚'                                    => '',

  /* --- el voseo --- */
  'Pasá el dedo para descubrir'   => 'Desliza el dedo para descubrir',
  'Pasá la voz'                   => 'Corre la voz',
  'si querés tener un detalle'    => 'si quieres tener un detalle',
  'Si querés tener un detalle'    => 'Si quieres tener un detalle',
  'dejamos nuestras mesas'        => 'aquí están nuestras mesas',
  'Una carta para vos'            => 'Una carta para ti',
  'una carta para vos'            => 'una carta para ti',
  'para vos'                      => 'para ti',
  '¿Cuánto conocés a la pareja?'  => '¿Cuánto conoces a la pareja?'
);

/* Palabras sueltas, en sus dos capitalizaciones. */
$ES_MX_PALABRAS = array(
  'Abrí'=>'Abre',            'abrí'=>'abre',
  'Compartí'=>'Comparte',    'compartí'=>'comparte',
  'Entrá'=>'Entra',          'entrá'=>'entra',
  'Escribí'=>'Escribe',      'escribí'=>'escribe',
  'Escuchá'=>'Escucha',      'escuchá'=>'escucha',
  'Esperá'=>'Espera',        'esperá'=>'espera',
  'Ingresá'=>'Ingresa',      'ingresá'=>'ingresa',
  'Jugá'=>'Juega',           'jugá'=>'juega',
  'Mirá'=>'Mira',            'mirá'=>'mira',
  'Pasá'=>'Pasa',            'pasá'=>'pasa',
  'Probá'=>'Prueba',         'probá'=>'prueba',
  'Rascá'=>'Raspa',          'rascá'=>'raspa',
  'Recargá'=>'Recarga',      'recargá'=>'recarga',
  'Subí'=>'Sube',            'subí'=>'sube',
  'Sumá'=>'Agrega',          'sumá'=>'agrega',
  'Sugerí'=>'Sugiere',       'sugerí'=>'sugiere',
  'Tocá'=>'Toca',            'tocá'=>'toca',
  'Confirmá'=>'Confirma',    'confirmá'=>'confirma',
  'conocés'=>'conoces',      'Conocés'=>'Conoces',
  'Ayudanos'=>'Ayúdanos',    'ayudanos'=>'ayúdanos',
  'Dejanos'=>'Déjanos',      'dejanos'=>'déjanos',
  'Confirmanos'=>'Confírmanos', 'confirmanos'=>'confírmanos',
  'Contanos'=>'Cuéntanos',   'contanos'=>'cuéntanos',
  'querés'=>'quieres',       'podés'=>'puedes',   'tenés'=>'tienes',
  'sabés'=>'sabes'
);
