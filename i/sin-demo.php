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

   Pasó de verdad, en invitaciones cobradas:
     · unos XV años mostraban la ceremonia en la "Basílica de Santa María"
       el 28 de noviembre, que es la boda de ejemplo
     · un cumpleaños mostraba "Fiesta — Basílica de Santa María"

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

   CÓMO SUMAR UNO NUEVO

   Una línea en la tabla: el selector del elemento, y la lista de campos del
   panel que lo llenan. Para averiguar el id de un elemento, abrir la
   invitación vacía (`/prueba/?e=zzz-no-existe-zzz`) y mirar qué elementos
   muestran texto que no es de nadie.
   ============================================================================ */

/* selector CSS  =>  campos del panel que lo llenan */
$DEMO_APAGAR = array(

  /* --- Dónde & Cuándo: el primer evento (ceremonia) --- */
  '#ev1-s' => array('ev1sub'),                 /* el lugar   */
  '#ev1-a' => array('ev1fecha', 'ev1dir'),     /* fecha y dirección */

  /* --- Dónde & Cuándo: el segundo evento (fiesta / recepción) --- */
  '#ev2-s' => array('ev2sub'),
  '#ev2-a' => array('ev2fecha', 'ev2dir'),

);
