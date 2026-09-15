/* ===== LAS MUESTRAS CON NOMBRE ================================================

   QUE ES ESTO
   La lista de invitaciones de MUESTRA que el cliente puede elegir por su nombre
   ("Perlas") desde /catalogo.html. Al elegir una, el formulario guarda ese id, y
   cuando la disenadora trae la solicitud al editor, el diseno de esa muestra se
   COPIA entero: colores, tipografias, sobre, coleccion, efectos. El cliente pone
   sus datos y la invitacion llega ya vestida.

   /!\ REGLA QUE NO SE NEGOCIA
   `muestra` tiene que apuntar SIEMPRE a una invitacion NUESTRA de muestra que
   EXISTA. Nunca a la de un cliente real, nunca a la boda de ejemplo, y nunca a
   un slug que no este creado.

   /!\/!\ POR QUE ESTA LISTA TIENE DOS ENTRADAS Y NO SEIS  (15/9/2026)
   Hasta hoy tenia seis modelos. Los probe uno por uno, pidiendole cada muestra
   a Firestore, y el resultado fue:

       Perlas             -> camila-y-tomas    EXISTE
       Boho               -> julieta-y-bruno   NO EXISTE
       Blanco Clasico     -> pavel-y-lada      NO EXISTE
       Rustica Campestre  -> maria-y-diego     es la BODA DE EJEMPLO
       Uva Elegante       -> (vacio)           nunca tuvo muestra
       XV Rosa            -> (vacio)           nunca tuvo muestra

   O sea que el cliente elegia cualquiera de los seis y, salvo Perlas, no se
   clonaba ningun diseno: la invitacion nacia con el vestido de fabrica. Esa es
   la causa de fondo del "todas se parecen entre si". No era un problema de
   diseno: era que en la practica habia UNA sola coleccion, y el cat  logo
   prometia seis.

   Y lo de Rustica era peor que un hueco: apuntaba a la boda de ejemplo, que es
   justo la que venimos limpiando porque se le filtraban datos a las
   invitaciones reales. Contra la regla de aca arriba.

   Decision de Maki: quedarse con las dos que existen de verdad y armar las
   nuevas de a una, como se armo Perlas. Prefiere dos reales que seis promesas.

   COMO SE AGREGA UNA MUESTRA NUEVA
   1. Armar la invitacion completa en el admin, con un slug propio.
   2. ABRIRLA y comprobar que carga. Si el slug no existe, el cliente que la
      elija se lleva el vestido de fabrica y nadie se entera.
   3. Sumar aca una entrada con su id, su nombre y ese slug.
   4. Que el `color` de la tarjeta sea el color de verdad de esa invitacion, o
      el catalogo miente antes de que el cliente entre.
   No hay que tocar crear.html ni admin.html.

   QUIEN LO USA
     · /catalogo.html                      -> dibuja las tarjetas
     · /efectos/crear-muestra.js           -> el cartel "Modelo elegido"
     · /efectos/panel-solicitud-muestra.js -> el clonado, en el admin

   /!\ EL ID VIAJA EN `tpl`
   El formulario ya guardaba `tpl` (el modelo elegido) desde siempre. Se reusa
   ese campo en vez de inventar uno nuevo: asi crear.html --que pesa 50 KB y no
   entra en una subida-- no hay que tocarlo.
   ============================================================================ */
(function () {
  window.MUESTRAS_INVITAME = {

    perlas: {
      nombre:  'Perlas',
      bajada:  'Serif fina, mucho aire y perlas de verdad. Sobria y clasica.',
      muestra: 'camila-y-tomas',      /* muestra NUESTRA, comprobada */
      color:   '#8d7f74',
      color2:  '#6f6259',
      paleta:  ['#efe9e0', '#8d7f74', '#d8cfc4', '#4a423c'],
      tipos:   ['boda', 'xv']
    },

    /* /!\ ESTA ESTA A MEDIO VESTIR, Y CONVIENE SABERLO ANTES DE VENDERLA.
       martina-mis15 existe y carga, pero mirando sus campos:
         · nfont y fTit son LOS DOS 'Parisienne' cursiva -- la misma familia
           para los nombres y para los titulos de seccion. Eso es justo lo que
           hace que una invitacion se vea hecha con plantilla: en Perlas son dos
           familias distintas (Cormorant para los nombres, Marcellus para los
           titulos) y por eso respira.
         · no tiene paleta elegida, ni coleccion, ni secOrden propio, asi que
           se recorre igual que todas las demas.
       El color de la tarjeta (#b06a7e) SI es el de la invitacion: eso coincide.
       Cuando se la retome, es el primer lugar donde mirar. */
    xv: {
      nombre:  'XV Rosa',
      bajada:  'Rosa empolvado, brillo y corona.',
      muestra: 'martina-mis15',
      color:   '#b06a7e',
      color2:  '#8a4f60',
      paleta:  ['#b06a7e', '#f7eef0', '#c9a0b0', '#8a4f60'],
      tipos:   ['xv']
    }
  };

  /* atajo comodo para los tres que la usan */
  window.muestraDe = function (id) {
    var m = window.MUESTRAS_INVITAME || {};
    return m[String(id || '').toLowerCase()] || null;
  };
})();
