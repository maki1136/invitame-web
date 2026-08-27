<?php
/* ===== LAS PALETAS DE COLOR ==================================================

   Veinte combinaciones ya resueltas para que la clienta elija una sola cosa y
   le cambie el color a TODA la invitación de una vez.

   POR QUÉ PALETAS CERRADAS Y NO VEINTE SELECTORES SUELTOS

   Porque con selectores sueltos el 90% de las invitaciones salen feas y las
   termina arreglando Maki de a una. Con paletas, cualquier combinación que
   elija la clienta ya está pensada y ya se lee. El modo libre existe igual
   —está en el panel como "Personalizada"— para quien quiera armar el suyo.

   ⚠️ SON CUATRO COLORES, Y CADA UNO TIENE UN TRABAJO DISTINTO

     principal      Los títulos grandes sobre fondo claro Y el fondo de las
                    secciones oscuras. Tiene que ser oscuro por partida doble.
     acentoClaro    Los títulos chiquitos en cursiva, el nombre del lugar de
                    cada evento, el mes del calendario. Va SOBRE MARFIL, así
                    que tiene que ser oscuro.
     acentoOscuro   Lo mismo pero dentro de las secciones oscuras. Va SOBRE EL
                    PRINCIPAL, así que tiene que ser claro.
     gris           El texto secundario: direcciones, CLABE, Titular, Banco.

   ⚠️ POR QUÉ EL ACENTO SON DOS Y NO UNO. Un solo color no puede leerse bien
   sobre marfil Y sobre chocolate a la vez: para uno tiene que ser oscuro y
   para el otro claro. Es la misma razón por la que el verde original fallaba.

   ⚠️ NINGUNA DE ESTAS VEINTE SE ELIGIÓ A OJO. Cada una pasó CINCO mediciones
   de contraste (mínimo 4.5 en todas):
       principal sobre marfil · blanco sobre principal · acentoClaro sobre
       marfil · acentoOscuro sobre principal · gris sobre marfil
   Las que no llegaban se oscurecieron o aclararon hasta pasar. El script que
   las genera y las verifica está documentado en la skill del sistema.

   ⚠️ SI SE AGREGA UNA PALETA NUEVA HAY QUE MEDIRLA IGUAL. Una paleta linda que
   no se lee es peor que ninguna: se ve bien en la miniatura del panel y falla
   en el celular de la abuela.

   ORDEN: la primera es la que se ofrece por defecto.
   ============================================================================ */

/* id => array(nombre, principal, acentoClaro, acentoOscuro, gris) */
$PALETAS = array(
  'oro-marfil'      => array('Oro y marfil',         '#4a3f35','#7d5f34','#d8b877','#6b6157'),
  'champagne'       => array('Champagne y perla',    '#4a4136','#7a684a','#e8dcbf','#6a635a'),
  'terracota'       => array('Terracota y arena',    '#6b3f2e','#8a4b32','#e2b394','#6e6058'),
  'durazno'         => array('Durazno y marfil',     '#6b4535','#9a5a3c','#f0c3a3','#6e6058'),
  'coral'           => array('Coral y crema',        '#6b3630','#98483f','#f2b3a6','#6f6059'),
  'rosa-polvo'      => array('Rosa polvo y nude',    '#5c3a3f','#8a5259','#efc4c9','#6d6060'),
  'vino'            => array('Vino y rosa viejo',    '#4a2632','#7d3a4c','#e6b8c2','#6b5c60'),
  'borgona'         => array('Borgoña y dorado',     '#3f1f28','#6e3442','#e0b9a0','#6a5b5d'),
  'mostaza'         => array('Mostaza y lino',       '#4f4023','#7a6224','#e8cf90','#68625a'),
  'olivo'           => array('Olivo y crema',        '#3f4a35','#5c6b3f','#c3d2a8','#61665c'),
  'selva'           => array('Selva y latón',        '#26332a','#3f5540','#c6d8c2','#5c625d'),
  'verde-esmeralda' => array('Esmeralda y oro',      '#1f3f34','#2f5d4c','#bfe0d0','#5c645f'),
  'turquesa'        => array('Turquesa y arena',     '#1f3f42','#2f6166','#b6dcdd','#5c6465'),
  'arena-mar'       => array('Arena y mar',          '#2f4048','#456475','#c9dde5','#5e6669'),
  'celeste'         => array('Celeste y blanco',     '#2b3f4f','#3f6480','#c3dced','#5e666d'),
  'azul-noche'      => array('Azul noche y plata',   '#26313f','#3d5570','#bfd0e2','#5d646c'),
  'lavanda'         => array('Lavanda y gris perla', '#3c3348','#5f4d78','#cfc2e4','#635e6b'),
  'violeta'         => array('Violeta y plata',      '#332a45','#544270','#ccc0e0','#615d69'),
  'gris-piedra'     => array('Piedra y humo',        '#3a3c3d','#5a5f61','#cdd3d5','#5f6365'),
  'blanco-negro'    => array('Blanco y negro',       '#1f1f1f','#4a4a4a','#d6d6d6','#5a5a5a'),
);


/* ===== LOS TAMAÑOS DE TEXTO ==================================================

   El motor NO tenía ni una sola variable de tamaño: cada tamaño estaba escrito
   a mano adentro del HTML de 200 KB. Por eso no se podía cambiar nada sin
   tocar ese archivo.

   Acá se define el juego de tamaños, con su valor por defecto. El panel puede
   pisar cualquiera; si no lo pisa, queda el de acá.

   ⚠️ LOS VALORES SON LOS QUE YA TENÍA LA INVITACIÓN, salvo los tres que se
   subieron porque eran ilegibles en un celular: la dirección de cada evento
   (12→13) y las etiquetas de la CLABE (10 y 11 → 12).

   clave => array(etiqueta para el panel, valor por defecto en px, mínimo, máximo)
   ============================================================================ */
$TAMANOS = array(
  'nombres'   => array('Nombres de la portada',      54, 28, 96),
  'kicker'    => array('Textito de arriba',          15, 10, 26),
  'contador'  => array('Cuenta regresiva',           34, 18, 60),
  'titulo'    => array('Títulos de cada sección',    30, 18, 52),
  'cursiva'   => array('Títulos chiquitos en cursiva',30, 14, 46),
  'frase'     => array('Frase larga',                22, 14, 40),
  'texto'     => array('Texto común',                16, 12, 24),
  'lugar'     => array('Nombre del lugar',           13, 11, 24),
  'direccion' => array('Fecha y dirección',          13, 11, 22),
  'boton'     => array('Texto de los botones',       12, 10, 20),
  'datos'     => array('CLABE, Titular, Banco',      12, 10, 20),
);
