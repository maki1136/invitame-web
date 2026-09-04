/* ===== NO BORRARLE A LOS NOVIOS LO QUE ARMARON ================================

   EL BUG REAL
   `admin.html` guarda el documento del panel de los novios con
       setDoc(doc(db,'inv_paneles', slug+'__'+clave), { slug, nombres, tokens, ... })
   SIN `{merge:true}`. `setDoc` sin merge REEMPLAZA el documento entero. O sea:
   cada vez que la disenadora toca "Guardar y publicar", a los novios se les
   borran las mesas que armaron (`mesas`), a quien sentaron en cada una
   (`asig`), la capacidad, el mensaje para compartir y --desde ahora-- el
   itinerario que hayan cargado.

   Se pierde EN SILENCIO: ese documento no se ve en ninguna pantalla del admin.
   Se nota recien cuando el novio entra a su panel y no esta mas lo que armo.

   POR QUE SE ARREGLA ACA Y NO EN admin.html
   `admin.html` pesa 159 KB. La herramienta con la que subo archivos al repo
   escribe texto completo y tiene un techo medido de ~45 KB por llamada: no
   puedo reescribir ese archivo sin arriesgarme a subirlo cortado. Un modulo
   que envuelve `publicar()` arregla exactamente lo mismo, se lee solo y no
   pone en riesgo el panel entero.
   (Cuando haya que tocar admin.html por otra cosa, conviene ademas ponerle el
   `{merge:true}` en el origen y borrar este modulo.)

   COMO LO ARREGLA
   Antes de publicar, se lee el documento del panel y se guarda una copia de los
   campos que los novios manejan. Despues de publicar, se vuelven a escribir con
   `updateDoc` -- pero SOLO los que ahora faltan. Si la disenadora cambio algo a
   proposito, no se le pisa.

   /!\ NO REPONER LO QUE EL ADMIN ACABA DE ESCRIBIR
   `slug`, `nombres`, `tokens`, `fechaTexto` y `actualizado` los escribe el
   admin en cada publicacion y tienen que ser los nuevos. Solo se reponen los
   campos de la lista de abajo.

   /!\ SI NO HAY CLAVE, NO HAY PANEL
   Y esta bien: se sale sin hacer nada, igual que hace el admin.
   ============================================================================ */
(function () {
  'use strict';

  /* lo que manejan los novios y el admin no escribe nunca */
  var SUYOS = ['mesas', 'asig', 'capacidad', 'msjCompartir', 'itinerario', 'notas'];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function refId() {
    var d = borrador(); if (!d) return null;
    var slug  = String(d.slug || '').trim();
    var clave = String(d['c_clave-del-panel-de-los-novios'] || '').trim();
    if (!slug || !clave) return null;
    return slug + '__' + clave;
  }

  function fs() {
    return import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  }

  function envolver() {
    if (typeof window.publicar !== 'function' || window.publicar.__cuidaNovios) return false;

    var original = window.publicar;

    var envuelta = function () {
      var self = this, args = arguments;
      var id = refId();
      if (!id || !window.INV || !window.INV.db) return original.apply(self, args);

      var guardado = null;

      return fs()
        .then(function (m) {
          return m.getDoc(m.doc(window.INV.db, 'inv_paneles', id)).then(function (snap) {
            if (snap && snap.exists()) {
              var p = snap.data() || {}, copia = {};
              SUYOS.forEach(function (k) {
                if (p[k] !== undefined && p[k] !== null) copia[k] = p[k];
              });
              if (Object.keys(copia).length) guardado = copia;
            }
            return m;
          });
        })
        /* si la lectura falla, se publica igual: publicar es lo importante */
        ['catch'](function () { return null; })
        .then(function (m) {
          return Promise.resolve(original.apply(self, args)).then(function (r) {
            if (!guardado || !m) return r;
            /* reponer SOLO lo que se perdio */
            return m.getDoc(m.doc(window.INV.db, 'inv_paneles', id))
              .then(function (snap) {
                var ahora = (snap && snap.exists()) ? (snap.data() || {}) : {};
                var falta = {};
                Object.keys(guardado).forEach(function (k) {
                  if (ahora[k] === undefined) falta[k] = guardado[k];
                });
                if (!Object.keys(falta).length) return r;
                return m.updateDoc(m.doc(window.INV.db, 'inv_paneles', id), falta)
                  .then(function () { return r; });
              })
              ['catch'](function () { return r; });
          });
        });
    };

    envuelta.__cuidaNovios = true;
    window.publicar = envuelta;
    return true;
  }

  /* `publicar` se define con el script principal; puede no estar todavia */
  var n = 0;
  var t = setInterval(function () {
    if (envolver() || ++n > 80) clearInterval(t);
  }, 250);
})();
