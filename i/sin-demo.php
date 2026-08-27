<?php
/* ===== LA BODA DE EJEMPLO QUE TRAE EL MOTOR ==================================

   QUÉ PROBLEMA RESUELVE ESTE ARCHIVO

   El `index.html` del motor no viene vacío: trae una boda entera inventada
   escrita a mano en el HTML —lugares, direcciones, horarios, itinerario,
   hoteles con precios, nombres de padres—. Sirve para que la maqueta se vea
   linda mientras se diseña.

   El problema es que esos textos NO desaparecen cuando la clienta deja un
   campo vacío: el motor sólo los PISA cuando hay dato. Si no hay dato, se
   quedan. Y entonces un invitado ve los datos de OTRA pareja.

   Pasó de verdad:
     · unos XV años mostraban la ceremonia en la "Basílica de Santa María"
       el 28 de noviembre, que es la boda de ejemplo
     · un cumpleaños mostraba "Fiesta — Basílica de Santa María"
     · unos XV y un cumpleaños mostraban, en código de vestimenta,
       "Te pedimos reservar el blanco para la novia"

   CÓMO SE ARREGLA

   Se apagan por CSS, acá en el servidor, ANTES de mandar el HTML. Es la misma
   regla que ya vale para el sobre, la portada y los textos mexicanos: si algo
   se ve mal el primer segundo, se arregla en el servidor, nunca en un módulo
   de /efectos/, porque los módulos llegan después del primer pintado.

   ⚠️ SE APAGA, NO SE BORRA EL TEXTO. Tocar el HTML con str_replace es
   peligroso: "Basílica de Santa María" también aparece adentro del itinerario
   y en la descripción, y un reemplazo a ciegas rompe frases sueltas. Apagar el
   elemento por su id es exacto y no puede romper la estructura.

   ⚠️ NUNCA APAGA CONTENIDO DE LA CLIENTA. Cada elemento se apaga sólo si
   TODOS los campos que lo alimentan están vacíos. Si cargó aunque sea uno, el
   elemento queda como está.

   ⚠️ SI FIRESTORE NO CONTESTA, NO SE APAGA NADA. Si no pudimos leer el evento
   no sabemos qué cargó la clienta, y apagar a ciegas le borraría la
   invitación. Ante la duda, se muestra de más, no de menos.

   ⚠️ NO HACE FALTA PONER TODO. Muchos sectores YA se apagan solos cuando no
   hay dato: los hoteles, el itinerario, "Nuestros Padres" y los nombres de la
   portada. Se comprobó abriendo una invitación casi vacía y mirando qué se
   veía de verdad. Acá van SÓLO los que el motor no apaga.

   CÓMO SUMAR UNO NUEVO

   Una línea en la tabla: el selector del elemento, y la lista de campos del
   panel que lo llenan.

   Para encontrarlos, comparar dos renders: la invitación vacía
   (`/prueba/?e=zzz-no-existe-zzz`) contra una invitación bien cargada, y
   quedarse con los textos que aparecen SÓLO en la vacía y ADEMÁS se ven de
   verdad (elemento hoja, sin `display:none`, con ancho > 0). Que un texto esté
   en el HTML no quiere decir que se vea.
   ============================================================================ */

/* selector CSS  =>  campos del panel que lo llenan */
$DEMO_APAGAR = array(

  /* --- Dónde & Cuándo: el primer evento (ceremonia) --- */
  '#ev1-s' => array('ev1sub'),                 /* el lugar   */
  '#ev1-a' => array('ev1fecha', 'ev1dir'),     /* fecha y dirección */

  /* --- Dónde & Cuándo: el segundo evento (fiesta / recepción) --- */
  '#ev2-s' => array('ev2sub'),
  '#ev2-a' => array('ev2fecha', 'ev2dir'),

  /* --- Código de vestimenta ---
     Sin este, un cumpleaños o unos XV muestran el texto de la boda de ejemplo:
     "La fiesta se viste de color y alegría. Te pedimos reservar el blanco para
     la novia." El título ("Dress Code") sí se deja: es una etiqueta genérica y
     sirve igual para cualquier evento. */
  '#dress-texto' => array('c_dresscode-texto'),

  /* --- La frase larga ---
     Si la clienta no carga ninguna, se ve la de la boda de ejemplo: "Hay un
     instante en la vida en que se decide caminar juntos para siempre." En unos
     XV o un bautismo no tiene ningún sentido. */
  '.fraseSec' => array('frase'),

  /* --- El mes de la raspadita ---
     Sin fecha cargada mostraba "Noviembre 2026", que es la de la boda de
     ejemplo. */
  '#sc-mon' => array('fecha'),

);
