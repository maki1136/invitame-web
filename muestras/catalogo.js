/* ===== LAS MUESTRAS CON NOMBRE ================================================

   QUE ES ESTO
   La lista de invitaciones de MUESTRA que el cliente puede elegir por su nombre
   ("Perlas") desde /catalogo.html. Al elegir una, el formulario guarda ese id, y
   cuando la disenadora trae la solicitud al editor, el diseno de esa muestra se
   COPIA entero: colores, tipografias, sobre, coleccion, efectos. El cliente pone
   sus datos y la invitacion llega ya vestida.

   /!\ REGLA QUE NO SE NEGOCIA
   `muestra` tiene que apuntar SIEMPRE a una invitacion NUESTRA de muestra.
   NUNCA a la de un cliente real. Si un modelo todavia no tiene muestra propia,
   se deja `muestra: ''`: aparece igual en el catalogo, sin boton "Ver ejemplo",
   y al elegirlo no se clona nada (queda como venia funcionando).

   COMO SE AGREGA UNA MUESTRA NUEVA
   1. Armar la invitacion completa en el admin, con un slug propio.
   2. Sumar acá una entrada con su id, su nombre y ese slug.
   3. Listo: aparece sola en /catalogo.html y el clonado funciona.
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

    /* ---- las que YA tienen invitacion de muestra armada ---- */
    perlas: {
      nombre:  'Perlas',
      bajada:  'Serif fina, mucho aire y perlas de verdad. Sobria y clasica.',
      muestra: 'camila-y-tomas',      /* muestra NUESTRA, no de un cliente */
      color:   '#8d7f74',
      color2:  '#6f6259',
      paleta:  ['#efe9e0', '#8d7f74', '#d8cfc4', '#4a423c'],
      tipos:   ['boda', 'xv']
    },

    /* ---- los modelos historicos, por ahora sin muestra propia ----
       Se dejan para no perder nada de lo que ya se ofrecia. Cuando cada uno
       tenga su invitacion armada, se le pone el slug en `muestra` y el clonado
       empieza a funcionar solo. */
    boho: {
      nombre:  'Boho',
      bajada:  'Tierras, tostados y textura de lino.',
      muestra: 'julieta-y-bruno',
      color:   '#a5674f', color2: '#8a5240',
      paleta:  ['#a5674f', '#efe3d0', '#b98c6a', '#5a3a2a'],
      tipos:   ['boda', 'xv', 'cumple']
    },
    rustica: {
      nombre:  'Rustica Campestre',
      bajada:  'Verde profundo, campo y madera.',
      muestra: 'maria-y-diego',
      color:   '#2e433c', color2: '#26372f',
      paleta:  ['#2e433c', '#f4efe6', '#7f9079', '#26372f'],
      tipos:   ['boda']
    },
    blanco: {
      nombre:  'Blanco Clasico',
      bajada:  'Todo claro, tipografia grande y nada de ruido.',
      muestra: 'pavel-y-lada',
      color:   '#8a8177', color2: '#5f574d',
      paleta:  ['#efece7', '#5f574d', '#b7ad9e', '#463f37'],
      tipos:   ['boda', 'xv']
    },
    uva: {
      nombre:  'Uva Elegante',
      bajada:  'Vino, dorado y noche.',
      muestra: '',
      color:   '#5b2a4e', color2: '#43203a',
      paleta:  ['#5b2a4e', '#f6efe8', '#a06d92', '#43203a'],
      tipos:   ['boda', 'xv']
    },
    xv: {
      nombre:  'XV Rosa',
      bajada:  'Rosa empolvado, brillo y corona.',
      muestra: '',
      color:   '#b06a7e', color2: '#8a4f60',
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
