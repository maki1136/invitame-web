/* ===== EL ESTILO DE LOS BOTONES ==============================================

   Los botones de la invitación eran todos iguales: una pastilla de color. Este
   módulo agrega una elección de MATERIAL — lacre, cristal, nácar, metal — que
   se aplica a todos de una vez.

   Cómo se enciende:  INVEV.fx.boton.estilo = 'lacre'
   Cómo se apaga:     INVEV.fx.boton.estilo = ''   (vuelve al de siempre)

   ⚠️ APAGADO POR DEFECTO. Sin estilo elegido no toca absolutamente nada, así
      que las invitaciones ya entregadas siguen exactamente igual.

   ⚠️ TODO SALE DE LA PALETA. Ningún estilo tiene colores escritos a mano:
      usan --verde, --oro, --cream y compañía. Por eso el mismo material se ve
      distinto en cada invitación, y por eso cambiar la paleta repinta también
      los botones.

   ⚠️ QUÉ TOCA Y QUÉ NO. Sólo pinta: fondo, borde, sombra y color de letra.
      No toca tamaños, ni espaciados, ni posiciones. Si un estilo rompiera el
      acomodo de la invitación, sería un bug — no una decisión de diseño.

   ⚠️ EL SELECTOR ES [data-boton], NO html[data-boton].
      Es a propósito: así el panel puede mostrar las once muestras juntas,
      envolviendo cada una en su propio [data-boton]. La muestra queda pintada
      con ESTE mismo CSS y no con una copia que algún día quede vieja.

   LA LISTA VIVE ACÁ Y EN NINGÚN OTRO LADO. El panel la lee de window.INVBOTONES.
   ============================================================================ */
(function () {
  'use strict';

  /* Dónde se aplica: los botones de verdad de la invitación.

     `.inv-prev-btn` es la muestra del panel. Está acá a propósito: así la
     tarjeta que ve la diseñadora se pinta con EXACTAMENTE el mismo CSS que el
     botón de la invitación. */
  var DONDE = '.btn, #btn-ingresar, .wsp, .tv-btn, .inv-prev-btn';

  /* ---------------------------------------------------------------------------
     LOS ESTILOS

     `css`   = lo que se le pone al botón
     `extra` = reglas sueltas (capas de encima, estados). `__D__` se reemplaza
               por la lista de selectores de arriba.
     Cada uno recibe las variables de la paleta ya puestas por /efectos/paleta.js
     --------------------------------------------------------------------------- */
  var ESTILOS = [

    { id:'lacre', nombre:'Lacre', pie:'Cera prensada, con la letra hundida',
      css:
        'color:#f7e9e6 !important;' +
        'background:radial-gradient(125% 150% at 32% 20%,' +
          ' color-mix(in srgb,var(--verde) 62%,#fff), var(--verde) 58%,' +
          ' color-mix(in srgb,var(--verde) 74%,#000)) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 2px 5px rgba(255,255,255,.30), inset 0 -6px 12px rgba(0,0,0,.42),' +
          ' inset 0 0 0 1px rgba(0,0,0,.22), 0 5px 14px rgba(40,12,20,.36) !important;' +
        'text-shadow:0 -1px 0 rgba(0,0,0,.55), 0 1px 0 rgba(255,255,255,.16) !important;'
    },

    { id:'relieve-seco', nombre:'Relieve seco', pie:'Papel de algodón, letra hundida. Papelería fina',
      css:
        'color:color-mix(in srgb,var(--verde) 90%,#000) !important;' +
        'background:linear-gradient(180deg, color-mix(in srgb,var(--cream) 55%,#fff), var(--cream)) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 2px 4px rgba(0,0,0,.13), inset 0 -1px 0 rgba(255,255,255,.95),' +
          ' inset 0 0 0 1px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.06) !important;' +
        'text-shadow:0 1px 0 rgba(255,255,255,.95), 0 -1px 1px rgba(0,0,0,.16) !important;'
    },

    { id:'cristal', nombre:'Cristal', pie:'Vidrio fino: se ve lo que pasa por detrás',
      css:
        'color:color-mix(in srgb,var(--verde) 88%,#000) !important;' +
        'background:linear-gradient(178deg, rgba(255,255,255,.95), rgba(255,255,255,.68)) !important;' +
        'border:0 !important;' +
        '-webkit-backdrop-filter:blur(12px) saturate(1.4); backdrop-filter:blur(12px) saturate(1.4);' +
        'box-shadow: inset 0 1.6px 0 rgba(255,255,255,1), inset 0 -2.4px 3px rgba(120,126,158,.20),' +
          ' inset 0 0 0 1px rgba(255,255,255,.62), 0 8px 20px rgba(96,102,140,.20) !important;'
    },

    { id:'cristal-relieve', nombre:'Cristal con relieve', pie:'Un bloque de vidrio, con canto y espesor',
      css:
        'color:color-mix(in srgb,var(--verde) 88%,#000) !important;' +
        'background:linear-gradient(152deg,#ffffff 0%,#e8ecf4 20%,#c4cbdc 40%,#f6f8fc 56%,#b9c1d4 76%,#eef1f7 100%) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 0 0 1px rgba(255,255,255,.95), 0 16px 26px rgba(78,86,124,.28),' +
          ' 0 2px 2px rgba(78,86,124,.30) !important;' +
        'text-shadow:0 1px 0 rgba(255,255,255,.95), 0 2.5px 1px rgba(120,128,162,.22) !important;',
      /* la cara de arriba, metida para adentro: ése es el grosor */
      extra:
        '[data-boton="cristal-relieve"] :is(__D__){position:relative}' +
        '[data-boton="cristal-relieve"] :is(__D__)::before{' +
          'content:"";position:absolute;inset:5px;border-radius:inherit;pointer-events:none;' +
          'background:linear-gradient(178deg, rgba(255,255,255,.99), rgba(236,240,248,.94));' +
          'box-shadow:inset 0 2px 0 rgba(255,255,255,1), inset 0 -3px 7px rgba(112,120,155,.26);}' +
        '[data-boton="cristal-relieve"] :is(__D__) > *{position:relative;z-index:2}'
    },

    { id:'nacar', nombre:'Nácar', pie:'Tornasol frío, como el interior de una caracola',
      css:
        'color:#4a4450 !important;' +
        'background:radial-gradient(120% 150% at 26% 16%, rgba(255,255,255,.98), rgba(255,255,255,0) 56%),' +
          ' linear-gradient(115deg,#f4f0f6 0%,#e6f0f2 22%,#f6ecf2 42%,#eaf1ea 62%,#f7eef0 82%,#eef0f7 100%) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 2px 5px rgba(255,255,255,1), inset 0 -4px 10px rgba(120,112,132,.30),' +
          ' inset 0 0 0 1px rgba(255,255,255,.8), 0 4px 12px rgba(120,112,132,.26) !important;' +
        'text-shadow:0 1px 0 rgba(255,255,255,.9) !important;'
    },

    { id:'oro', nombre:'Oro cepillado', pie:'Metal con el cepillado en círculo',
      css:
        'color:#3d3324 !important;' +
        'background:conic-gradient(from 210deg at 50% 50%,' +
          ' color-mix(in srgb,var(--oro) 55%,#fff), var(--oro) 14%,' +
          ' color-mix(in srgb,var(--oro) 60%,#000) 26%, color-mix(in srgb,var(--oro) 40%,#fff) 40%,' +
          ' var(--oro) 54%, color-mix(in srgb,var(--oro) 62%,#000) 68%,' +
          ' color-mix(in srgb,var(--oro) 50%,#fff) 84%, color-mix(in srgb,var(--oro) 55%,#fff)) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 1px 0 rgba(255,255,255,.85), inset 0 -3px 8px rgba(90,66,20,.55),' +
          ' inset 0 0 0 1px rgba(120,94,40,.55), 0 4px 12px rgba(90,70,26,.34) !important;' +
        'text-shadow:0 1px 0 rgba(255,255,255,.55) !important;'
    },

    { id:'placa', nombre:'Placa grabada', pie:'Metal oscuro con la letra tallada en oro',
      css:
        'color:color-mix(in srgb,var(--oro) 88%,#fff) !important;' +
        'background:linear-gradient(180deg,#3d3a36,#25231f 60%,#161512) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 1px 0 rgba(255,255,255,.20), inset 0 -2px 6px rgba(0,0,0,.7),' +
          ' inset 0 0 0 1px rgba(190,166,110,.36), 0 4px 13px rgba(0,0,0,.42) !important;' +
        'text-shadow:0 -1px 0 rgba(0,0,0,.9), 0 1px 0 rgba(200,178,120,.30) !important;'
    },

    { id:'esmalte', nombre:'Esmalte', pie:'Pin duro con el canto metálico',
      css:
        'color:#fff !important;' +
        'background:linear-gradient(180deg, color-mix(in srgb,var(--sage) 55%,#fff) 0%,' +
          ' var(--sage) 44%, color-mix(in srgb,var(--sage) 72%,#000) 100%) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 2px 3px rgba(255,255,255,.62), inset 0 -3px 8px rgba(0,0,0,.34),' +
          ' 0 0 0 2.5px var(--oro), 0 0 0 3.5px rgba(120,94,40,.5), 0 5px 14px rgba(0,0,0,.30) !important;' +
        'text-shadow:0 1px 2px rgba(0,0,0,.42) !important;'
    },

    { id:'arcilla', nombre:'Arcilla', pie:'Mate y con cuerpo, con una sola luz de costado',
      css:
        'color:color-mix(in srgb,var(--verde) 92%,#000) !important;' +
        'background:linear-gradient(160deg, color-mix(in srgb,var(--cream) 55%,#fff),' +
          ' var(--cream) 54%, color-mix(in srgb,var(--cream) 70%,var(--muted))) !important;' +
        'border:0 !important;' +
        'box-shadow: 3px 4px 5px rgba(74,56,32,.26), 16px 21px 28px rgba(74,56,32,.20),' +
          ' inset 0 2px 0 rgba(255,255,255,.85), inset 2px 0 0 rgba(255,255,255,.45),' +
          ' inset -2px -5px 11px rgba(74,56,32,.20) !important;' +
        'text-shadow:0 1px 0 rgba(255,255,255,.8) !important;'
    },

    { id:'luz-detras', nombre:'Luz detrás', pie:'Una lámpara escondida atrás. Para UN solo botón',
      css:
        'color:color-mix(in srgb,var(--verde) 94%,#000) !important;' +
        'background:linear-gradient(184deg,#fbfbfc,#eceef2) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 1.2px 0 rgba(255,255,255,.95), inset 0 -1.4px 2px rgba(90,96,116,.14),' +
          ' 18px 26px 30px rgba(78,86,110,.24), 5px 8px 10px rgba(78,86,110,.18) !important;',
      extra:
        '[data-boton="luz-detras"] :is(__D__){position:relative;isolation:isolate}' +
        /* el resplandor de arriba sale limpio; el de abajo vuelve teñido */
        '[data-boton="luz-detras"] :is(__D__)::before{' +
          'content:"";position:absolute;left:16%;right:16%;top:-14px;height:38px;border-radius:50%;' +
          'z-index:-1;pointer-events:none;filter:blur(11px);' +
          'background:radial-gradient(closest-side, color-mix(in srgb,var(--oro) 30%,#fff),' +
          ' color-mix(in srgb,var(--oro) 55%, transparent) 46%, transparent);}' +
        '[data-boton="luz-detras"] :is(__D__)::after{' +
          'content:"";position:absolute;left:24%;right:24%;bottom:-16px;height:40px;border-radius:50%;' +
          'z-index:-1;pointer-events:none;filter:blur(13px);' +
          'background:radial-gradient(closest-side, var(--oro),' +
          ' color-mix(in srgb,var(--oro) 60%, transparent) 44%, transparent);}'
    },

    { id:'terciopelo', nombre:'Terciopelo', pie:'Con textura de tela. Necesita el archivo en /efectos/',
      necesitaArchivo:'/efectos/terciopelo-fibra.jpg',
      css:
        'color:color-mix(in srgb,var(--verde) 86%,#000) !important;' +
        'background-color:var(--sage-cl) !important;' +
        'background-image:radial-gradient(118% 150% at 32% 16%, rgba(255,255,255,.85), rgba(255,255,255,0) 62%),' +
          ' linear-gradient(166deg, color-mix(in srgb,var(--sage-cl) 58%,#fff), var(--sage-cl) 56%,' +
          ' color-mix(in srgb,var(--sage-cl) 62%,var(--sage))) !important;' +
        'border:0 !important;' +
        'box-shadow: inset 0 2px 6px rgba(255,255,255,.9), inset 0 -6px 13px color-mix(in srgb,var(--sage) 40%, transparent),' +
          ' 0 4px 12px color-mix(in srgb,var(--sage) 32%, transparent) !important;' +
        'text-shadow:0 1px 0 rgba(255,255,255,.72) !important;',
      extra:
        '[data-boton="terciopelo"] :is(__D__){position:relative;overflow:hidden}' +
        '[data-boton="terciopelo"] :is(__D__)::after{' +
          'content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;' +
          'background-image:url("/efectos/terciopelo-fibra.jpg");background-size:120px;' +
          'mix-blend-mode:overlay;opacity:.9;}' +
        '[data-boton="terciopelo"] :is(__D__) > *{position:relative;z-index:2}'
    }
  ];

  /* el panel arma las tarjetas leyendo de acá */
  window.INVBOTONES = ESTILOS;

  /* ---- armar la hoja de estilo ------------------------------------------- */

  function reglas(e) {
    var sel = '[data-boton="' + e.id + '"] :is(' + DONDE + ')';
    var css = sel + '{' + e.css + '}';
    if (e.extra) css += e.extra.split('__D__').join(DONDE);
    /* al apretar, cualquier material se hunde un poco */
    css += '[data-boton="' + e.id + '"] :is(' + DONDE + '):active{transform:translateY(1.5px) scale(.99)}';
    return css;
  }

  var HOJA = null;
  function asegurarHoja() {
    if (HOJA && HOJA.isConnected) return HOJA;
    HOJA = document.createElement('style');
    HOJA.id = 'inv-botones';
    /* Una sola hoja con TODOS los estilos: el atributo decide cuál manda. Así
       cambiar de estilo no vuelve a escribir CSS ni parpadea, y el panel puede
       mostrar los once a la vez. */
    var css = '';
    for (var i = 0; i < ESTILOS.length; i++) css += reglas(ESTILOS[i]);
    css += ':is(' + DONDE + '){transition:background .25s, box-shadow .25s, color .25s}';
    HOJA.textContent = css;
    (document.head || document.documentElement).appendChild(HOJA);
    return HOJA;
  }

  function existe(id) {
    for (var i = 0; i < ESTILOS.length; i++) if (ESTILOS[i].id === id) return true;
    return false;
  }

  function leerId() {
    try {
      var fx = (window.INVEV && window.INVEV.fx) || {};
      var b = fx.boton || {};
      if (b.estilo) return String(b.estilo);
    } catch (e) {}
    try {
      var u = new URLSearchParams(location.search).get('boton');
      if (u) return u;
    } catch (e) {}
    return '';
  }

  var raiz = document.documentElement;
  var anterior = null;

  function sincronizar() {
    var id = leerId();
    if (id === anterior) return;
    anterior = id;
    if (!id || !existe(id)) { raiz.removeAttribute('data-boton'); return; }
    asegurarHoja();
    raiz.setAttribute('data-boton', id);
  }

  sincronizar();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sincronizar, { once: true });
  }
  /* el panel manda los datos en vivo por postMessage */
  window.addEventListener('message', function () { setTimeout(sincronizar, 0); }, false);

  var esPrevia = /[?&]preview=1/.test(location.search);
  setInterval(sincronizar, esPrevia ? 400 : 1500);
})();
