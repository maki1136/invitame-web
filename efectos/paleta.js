/* ===== LA PALETA DE LA INVITACIÓN ============================================

   Hasta ahora los colores de la invitación eran campos sueltos que se cargaban
   de a uno. Por eso no había dos invitaciones que se vieran parejas. Este
   módulo agrega UNA elección que pinta toda la invitación de una sola vez.

   Cómo se enciende:  INVEV.fx.paleta.id = 'terracota-arena'
   Cómo se apaga:     INVEV.fx.paleta.id = ''

   ⚠️ EL COLOR CARGADO A MANO LE GANA A LA PALETA.
      De las doce variables, sólo DOS se pueden elegir a mano en el panel:

        · `color`               → --verde y --sec-col-v
        · `fx.sobre.selloColor` → --seal-c

      En esas, si el campo tiene algo cargado se usa ESE color. Las otras diez
      no tienen campo (salen del tema o de la hoja de estilos), así que ahí la
      paleta manda siempre sin pisarle una decisión a nadie.

   ⚠️ "GANA EL DE A MANO" SE ESCRIBE, NO SE OMITE.  ← esto costó un bug
      La primera versión resolvía la precedencia NO poniendo la variable. Pero
      repintar empieza por limpiar(), y limpiar() le borraba a esas variables el
      valor que había escrito EL MOTOR: quedaban vacías y el color principal
      salía cualquier cosa. Ahora las tres se escriben siempre —con el color a
      mano si hay, con el de la paleta si no—, así que el resultado no depende
      de en qué orden carguen el motor, los datos y este archivo.

   ⚠️ LA LISTA DE PALETAS VIVE ACÁ Y EN NINGÚN OTRO LADO. El panel la lee de
      window.INVPALETAS. Si se copia a otro archivo, tarde o temprano una copia
      queda vieja y la muestra deja de coincidir con la invitación.
   ============================================================================ */
(function () {
  'use strict';

  /* --- las 20 paletas -------------------------------------------------------
     verde   = principal oscuro (nombres y títulos)     oro   = metálico
     verde2  = variante más oscura                      lino  = papel base
     sage    = acento medio                             lino2 = papel claro
     sageCl  = acento claro                             cream = crema de fondos
     muted   = texto secundario                         seal  = color del lacre
     metal   = 'oro' | 'plata' (define el lacre y los filetes)

     Los acentos están medidos: ninguno baja de 4,6:1 contra su papel, y ningún
     principal baja de 7:1. Si se toca un color, volver a medirlo. --------- */
  var PALETAS = [
    { id:'terracota-arena', nombre:'Terracota y arena', metal:'oro',
      verde:'#6b3f2e', verde2:'#52301f', sage:'#975c39', sageCl:'#e2b394', oro:'#c19a6b',
      lino:'#f4efe6', lino2:'#faf7f1', cream:'#eee6d6', muted:'#6e6058', seal:'#8a4b32' },
    { id:'vino-rosa-seca', nombre:'Vino y rosa seca', metal:'oro',
      verde:'#5a2333', verde2:'#411824', sage:'#8e4257', sageCl:'#d9a3ad', oro:'#b9a56a',
      lino:'#f5efe9', lino2:'#fbf7f4', cream:'#eee3dc', muted:'#6b5b5b', seal:'#6d2b3c' },
    { id:'azul-noche-plata', nombre:'Azul noche y plata', metal:'plata',
      verde:'#1f2a44', verde2:'#141d31', sage:'#3f5878', sageCl:'#a8b8c9', oro:'#9aa3ad',
      lino:'#f2f3f5', lino2:'#fafbfc', cream:'#e7e9ec', muted:'#5c6470', seal:'#26364f' },
    { id:'oliva-crema', nombre:'Oliva y crema', metal:'oro',
      verde:'#3d4426', verde2:'#2b3019', sage:'#667044', sageCl:'#bcc39e', oro:'#bfa76a',
      lino:'#f5f2e7', lino2:'#fbf9f2', cream:'#ece7d6', muted:'#65644f', seal:'#4a5330' },
    { id:'blush-oro', nombre:'Blush y oro', metal:'oro',
      verde:'#6a4a45', verde2:'#4e3532', sage:'#9d5a52', sageCl:'#f0cfc7', oro:'#c9ab72',
      lino:'#f8f1ec', lino2:'#fdf9f6', cream:'#f1e5dd', muted:'#6f615c', seal:'#a8756c' },
    { id:'salvia-marfil', nombre:'Salvia y marfil', metal:'oro',
      verde:'#44513f', verde2:'#313b2d', sage:'#61705c', sageCl:'#c3cfbc', oro:'#bda87a',
      lino:'#f4f3ec', lino2:'#fbfaf6', cream:'#e9e8dd', muted:'#616655', seal:'#3a5643' },
    { id:'lavanda-perla', nombre:'Lavanda y gris perla', metal:'plata',
      verde:'#463b52', verde2:'#332a3d', sage:'#756786', sageCl:'#c5bad2', oro:'#a5a0a8',
      lino:'#f4f2f6', lino2:'#fbfafc', cream:'#e9e6ee', muted:'#615c69', seal:'#54466a' },
    { id:'mostaza-lino', nombre:'Mostaza y lino', metal:'oro',
      verde:'#5b4626', verde2:'#42321a', sage:'#84672e', sageCl:'#dfc78c', oro:'#c8a75c',
      lino:'#f6f1e4', lino2:'#fcf9f1', cream:'#eee6d2', muted:'#6b6047', seal:'#8a6a2c' },
    { id:'coral-arena', nombre:'Coral y arena', metal:'oro',
      verde:'#6d3b33', verde2:'#512922', sage:'#a7523f', sageCl:'#f0bcae', oro:'#c8a179',
      lino:'#f8f0e9', lino2:'#fdf8f4', cream:'#f0e3d8', muted:'#70605a', seal:'#a85442' },
    { id:'bosque-cobre', nombre:'Bosque y cobre', metal:'oro',
      verde:'#25382c', verde2:'#182619', sage:'#4d6b52', sageCl:'#a5bda8', oro:'#b57f4d',
      lino:'#f2f2ea', lino2:'#faf9f4', cream:'#e6e6da', muted:'#57604f', seal:'#2f4a35' },
    { id:'malva-humo', nombre:'Malva y humo', metal:'plata',
      verde:'#4f3f47', verde2:'#3a2d34', sage:'#7f6772', sageCl:'#cdbcc4', oro:'#a49ba0',
      lino:'#f5f2f3', lino2:'#fcfafb', cream:'#eae5e7', muted:'#645b60', seal:'#5d4551' },
    { id:'durazno-crema', nombre:'Durazno y crema', metal:'oro',
      verde:'#6b4a35', verde2:'#4f3524', sage:'#966139', sageCl:'#f2ceac', oro:'#cba876',
      lino:'#f9f2e9', lino2:'#fdf9f4', cream:'#f1e6d7', muted:'#6f6154', seal:'#a56f45' },
    { id:'petroleo-oro-viejo', nombre:'Petróleo y oro viejo', metal:'oro',
      verde:'#1e3a3d', verde2:'#132628', sage:'#3f6165', sageCl:'#a3bcbe', oro:'#b09256',
      lino:'#f1f3f2', lino2:'#f9fbfa', cream:'#e4e8e7', muted:'#546160', seal:'#27484b' },
    { id:'ciruela-champan', nombre:'Ciruela y champán', metal:'oro',
      verde:'#42283a', verde2:'#2f1b29', sage:'#754a68', sageCl:'#c2a4b8', oro:'#cbb489',
      lino:'#f6f2ee', lino2:'#fcf9f7', cream:'#ebe3dc', muted:'#645763', seal:'#54314a' },
    { id:'cafe-caramelo', nombre:'Café y caramelo', metal:'oro',
      verde:'#402a1e', verde2:'#2c1c13', sage:'#7d5334', sageCl:'#cda87e', oro:'#c09a63',
      lino:'#f5efe6', lino2:'#fbf8f2', cream:'#ece2d3', muted:'#6a5b4c', seal:'#5c3a22' },
    { id:'celeste-polvo', nombre:'Celeste polvo y blanco', metal:'plata',
      verde:'#2f4453', verde2:'#20313c', sage:'#537287', sageCl:'#b6cbd8', oro:'#9fabb2',
      lino:'#f2f5f7', lino2:'#fafcfd', cream:'#e6ecf0', muted:'#5a666e', seal:'#3b5567' },
    { id:'oxido-verde-seco', nombre:'Óxido y verde seco', metal:'oro',
      verde:'#5c3524', verde2:'#432618', sage:'#79693e', sageCl:'#cdc094', oro:'#bb8f57',
      lino:'#f4f0e6', lino2:'#fbf8f2', cream:'#eae3d3', muted:'#69604e', seal:'#7a452a' },
    { id:'negro-oro', nombre:'Negro y oro', metal:'oro',
      verde:'#1c1a17', verde2:'#100f0d', sage:'#4a453d', sageCl:'#a8a196', oro:'#c2a35f',
      lino:'#f4f2ee', lino2:'#fbfaf8', cream:'#e8e5df', muted:'#5b564e', seal:'#26231f' },
    { id:'menta-nacar', nombre:'Menta y nácar', metal:'plata',
      verde:'#2f4a42', verde2:'#1f342e', sage:'#4e7468', sageCl:'#b3cfc5', oro:'#a6b0aa',
      lino:'#f1f5f3', lino2:'#f9fcfa', cream:'#e5ebe8', muted:'#576560', seal:'#3a5d52' },
    { id:'cobre-chocolate', nombre:'Cobre y chocolate', metal:'oro',
      verde:'#33231c', verde2:'#221612', sage:'#8c5637', sageCl:'#d3a785', oro:'#b8834e',
      lino:'#f4eee7', lino2:'#fbf8f4', cream:'#eae0d4', muted:'#655449', seal:'#5e3620' }
  ];

  /* el panel arma las tarjetas leyendo de acá */
  window.INVPALETAS = PALETAS;

  /* ---- LOS DOS GRUPOS ---------------------------------------------------- */

  /* 1) SIN CAMPO A MANO: la paleta manda siempre.
        Estos colores no se pueden elegir en el panel (salen del tema o de la
        hoja de estilos), así que ponerlos no le pisa una decisión a nadie.

        --sec-col es el fondo de las secciones claras. NO es un lujo: la regla
        del motor es .sec { background: var(--sec-col) }, y sale del TEMA. Sin
        esto, la paleta se aplicaba a medias. */
  var SIEMPRE = {
    verde2: ['--verde2'],
    sage  : ['--sage'],
    sageCl: ['--sage-cl'],
    oro   : ['--oro'],
    lino  : ['--lino'],
    lino2 : ['--lino2'],
    cream : ['--cream', '--sec-col'],
    muted : ['--muted']
  };

  /* 2) CON CAMPO A MANO: gana el color cargado; si no hay, va el de la paleta.
        Se escriben SIEMPRE (ver la nota de arriba: omitirlas las borraba). */
  var CON_CAMPO = {
    verde: {
      vars: ['--verde', '--sec-col-v'],
      aMano: function () { return (window.INVEV || {}).color || ''; }
    },
    seal: {
      vars: ['--seal-c'],
      aMano: function () {
        var fx = (window.INVEV || {}).fx || {};
        return (fx.sobre || {}).selloColor || '';
      }
    }
  };

  function buscar(id) {
    if (!id) return null;
    for (var i = 0; i < PALETAS.length; i++) if (PALETAS[i].id === id) return PALETAS[i];
    return null;
  }

  function leerId() {
    try {
      var fx = (window.INVEV && window.INVEV.fx) || {};
      var p  = fx.paleta || {};
      if (p.id) return String(p.id);
    } catch (e) {}
    /* la zona de prueba y los muestrarios pueden forzarla por la URL */
    try {
      var u = new URLSearchParams(location.search).get('paleta');
      if (u) return u;
    } catch (e) {}
    return '';
  }

  var raiz = document.documentElement;
  var puestas = [];

  function limpiar() {
    for (var i = 0; i < puestas.length; i++) raiz.style.removeProperty(puestas[i]);
    puestas = [];
    raiz.removeAttribute('data-paleta');
  }

  /* qué variables van y con qué color, mirando qué hay cargado a mano */
  function loQueVa(pal) {
    var plan = [], k, i;
    if (!pal) return plan;

    for (k in SIEMPRE) {
      if (!Object.prototype.hasOwnProperty.call(SIEMPRE, k) || !pal[k]) continue;
      for (i = 0; i < SIEMPRE[k].length; i++) plan.push([SIEMPRE[k][i], pal[k]]);
    }

    for (k in CON_CAMPO) {
      if (!Object.prototype.hasOwnProperty.call(CON_CAMPO, k) || !pal[k]) continue;
      var r = CON_CAMPO[k];
      var valor = r.aMano() || pal[k];      /* ← acá gana el de a mano */
      for (i = 0; i < r.vars.length; i++) plan.push([r.vars[i], valor]);
    }

    return plan;
  }

  function pintar(pal) {
    limpiar();
    if (!pal) return;
    var plan = loQueVa(pal);
    for (var i = 0; i < plan.length; i++) {
      raiz.style.setProperty(plan[i][0], plan[i][1], 'important');
      puestas.push(plan[i][0]);
    }
    raiz.setAttribute('data-paleta', pal.id);
  }

  var firmaAnterior = null;
  var pintando = false;

  function sigueAplicada(pal) {
    if (!pal) return puestas.length === 0;
    var plan = loQueVa(pal);
    if (plan.length !== puestas.length) return false;
    for (var i = 0; i < plan.length; i++) {
      var hay = raiz.style.getPropertyValue(plan[i][0]).trim().toLowerCase();
      if (hay !== String(plan[i][1]).toLowerCase()) return false;
    }
    return true;
  }

  function sincronizar() {
    if (pintando) return;
    var id  = leerId();
    var pal = buscar(id);
    if (id === firmaAnterior && sigueAplicada(pal)) return;
    firmaAnterior = id;
    pintando = true;
    try { pintar(pal); } finally { pintando = false; }
  }

  sincronizar();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sincronizar, { once: true });
  }

  /* El panel manda los datos en vivo por postMessage, no por la base. */
  window.addEventListener('message', function () { setTimeout(sincronizar, 0); }, false);

  /* Red de seguridad: el motor termina de escribir sus cosas un rato después de
     que carga esto, y los datos pueden llegar tarde. */
  var esPrevia = /[?&]preview=1/.test(location.search);
  setInterval(sincronizar, esPrevia ? 400 : 1500);
})();
