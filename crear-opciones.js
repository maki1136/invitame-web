/* ===== «VER OPCIONES» EN LOS TÍTULOS Y LAS FRASES DEL FORMULARIO ============

   Pedido de Jazmín (15/10/2026): «podemos colocar un botón que diga "ver
   opciones", entonces ellos pueden tener alternativas. Me gustaría que hubiera
   opciones para todas las frases y títulos».

   CÓMO FUNCIONA
   Debajo de cada título y frase del formulario aparece «Ver opciones». Al
   tocarlo se despliegan 4 o 5 textos; el cliente toca uno y se copia al
   casillero, donde lo puede editar. Nada se guarda solo: el texto queda en el
   casillero como si lo hubiera escrito.

   LOS TEXTOS
   · En español de MÉXICO, de «tú» (es el mercado: Maki, «siempre mercado mx»).
   · Distintos para BODA y para XV. Para los demás tipos de evento (bautizo,
     cumpleaños…) se usan los NEUTROS, que sirven para cualquier fiesta.
   · ⚠️ Antes de publicar, los revisa Jazmín: son textos que lee el cliente.

   ⚠️ ES UN SCRIPT CLÁSICO y no toca nada más del formulario: sólo escribe el
      valor del casillero y dispara el evento `input`, así el borrador
      automático de /crear.js lo guarda como cualquier otro cambio.
   ============================================================================ */
(function () {
  'use strict';

  var O = {
    kick: {
      boda:  ['Nuestra Boda', '¡Nos casamos!', 'Te invitamos a nuestra boda', 'Juntos para siempre', 'El día más especial'],
      xv:    ['Mis XV años', 'Mis Quince', 'Te invito a mis XV', 'Una noche mágica', 'Mis XV'],
      otro:  ['¡Te invitamos!', 'Una celebración especial', 'Acompáñanos', '¡Celebremos juntos!']
    },
    frase: {
      boda:  ['Hay un instante en la vida en que se decide caminar juntos para siempre. Ese instante llegó y queremos compartirlo contigo.',
              'El amor no se mira, se siente, y hoy queremos celebrarlo con las personas que más queremos.',
              'Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarte a celebrar nuestra unión.',
              'Nos elegimos todos los días, y ahora queremos decirlo frente a ti.',
              'Dos caminos que se juntan en uno solo. Acompáñanos a celebrarlo.'],
      xv:    ['Hay momentos que se esperan toda la vida. Mis XV años son uno de ellos y quiero vivirlo contigo.',
              'Con la bendición de Dios y el amor de mis papás, te invito a celebrar mis XV años.',
              'Hoy dejo atrás una etapa y empiezo un sueño nuevo. Me encantaría que estuvieras conmigo.',
              'Quince años de recuerdos, sueños y alegrías. Celebremos juntos esta noche tan especial.',
              'Una noche para soñar, bailar y celebrar. ¡No puedes faltar!'],
      otro:  ['Nos encantaría que nos acompañaras en este día tan especial.',
              'Hay momentos que merecen celebrarse con las personas que más queremos.',
              'Tu presencia hará este día todavía más especial.',
              'Acompáñanos a celebrar un momento inolvidable.']
    },
    hotDesc: {
      neutro: ['Estos son los hoteles que recomendamos', 'Si vienes de fuera, aquí te dejamos algunas opciones para hospedarte',
               'Para que descanses cerca de la fiesta', 'Hoteles cercanos con tarifa especial para nuestros invitados']
    },
    persFrase: {
      boda:  ['Con la bendición de nuestros padres', 'Las personas que nos acompañan en este día',
              'Gracias a quienes hicieron posible este momento', 'Nuestros padres y padrinos'],
      xv:    ['Con la bendición de mis papás', 'Las personas más importantes de mi vida',
              'Mis papás y padrinos', 'Gracias por acompañarme siempre'],
      otro:  ['Las personas que nos acompañan', 'Con el cariño de nuestra familia', 'Quienes hacen posible este día']
    },
    dressTitulo: {
      neutro: ['Código de vestimenta', 'Dress code', 'Vestimenta', '¿Cómo vestir?']
    },
    dress: {
      boda:  ['Formal. Te pedimos reservar el blanco para la novia.', 'Etiqueta rigurosa.',
              'Formal de playa: telas ligeras y colores claros.', 'Formal. Caballeros de traje y damas de vestido largo.',
              'Cóctel. Ven cómodo y listo para bailar toda la noche.'],
      xv:    ['Formal. Te pedimos reservar el color rosa para la quinceañera.', 'Formal. Damas de vestido largo y caballeros de traje.',
              'Cóctel. Ven listo para bailar toda la noche.', 'Etiqueta. Ven con tu mejor look.'],
      otro:  ['Formal.', 'Casual elegante.', 'Cóctel.', 'Ven cómodo y con ganas de celebrar.']
    },
    regTitulo: {
      neutro: ['Mesa de regalos', 'Regalos', 'Si quieres hacernos un regalo', 'Un detalle']
    },
    regalos: {
      boda:  ['Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros, aquí te dejamos algunas opciones.',
              'Lo más importante es que nos acompañes. Si quieres hacernos un regalo, estas son nuestras mesas.',
              'Estamos empezando nuestro hogar juntos. Si quieres ayudarnos, aquí está nuestra mesa de regalos.',
              'Tu cariño es el mejor regalo. Si deseas darnos algo más, te dejamos estas opciones.'],
      xv:    ['Tu presencia es mi mejor regalo, pero si deseas tener un detalle conmigo, aquí te dejo algunas opciones.',
              'Lo más importante es que estés conmigo. Si quieres hacerme un regalo, estas son mis opciones.',
              'Tu cariño es el mejor regalo. Si quieres darme algo más, aquí te dejo mi mesa de regalos.'],
      otro:  ['Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle, aquí te dejamos algunas opciones.',
              'Lo más importante es que nos acompañes.']
    },
    cfTitulo: {
      neutro: ['Confirma tu asistencia', '¿Nos acompañas?', 'Confirma que vienes', '¡Te esperamos!', 'Reserva tu lugar']
    },
    cfFrase: {
      boda:  ['Nos encantará contar contigo. Confírmanos tu asistencia.', 'Ayúdanos a preparar todo: confírmanos si nos acompañas.',
              'Tu lugar ya está apartado. Solo falta que nos confirmes.', 'Por favor confirma tu asistencia para tener todo listo.'],
      xv:    ['Me encantará contar contigo. Confírmame tu asistencia.', 'Ayúdame a preparar todo: confírmame si me acompañas.',
              'Tu lugar ya está apartado. Solo falta que me confirmes.', 'Por favor confirma tu asistencia para tener todo listo.'],
      otro:  ['Nos encantará contar contigo. Confírmanos tu asistencia.', 'Por favor confirma tu asistencia para tener todo listo.']
    },
    galTitulo: {
      boda:  ['Nuestra galería', 'Nuestra historia', 'Momentos juntos', 'Así comenzó todo', 'Recuerdos'],
      xv:    ['Mi galería', 'Mis recuerdos', 'Momentos especiales', 'Así he crecido', 'Mis fotos favoritas'],
      otro:  ['Galería', 'Recuerdos', 'Momentos especiales']
    },
    galFrase: {
      boda:  ['Algunos momentos que nos trajeron hasta aquí', 'Cada foto cuenta un pedacito de nuestra historia',
              'Así empezó lo nuestro', 'Lo mejor está por venir'],
      xv:    ['Algunos momentos que me trajeron hasta aquí', 'Cada foto cuenta un pedacito de mi historia',
              'Quince años de recuerdos', 'Lo mejor está por venir'],
      otro:  ['Algunos momentos especiales', 'Cada foto cuenta una historia']
    },
    fraseFinal: {
      neutro: ['¡Te esperamos!', '¡Gracias!', '¡No faltes!', 'Nos vemos pronto', '¡Será inolvidable!']
    },
    textoFinal: {
      boda:  ['Gracias por acompañarnos en este día tan importante.', 'Gracias por ser parte de nuestra historia.',
              'Nada sería igual sin ti. ¡Nos vemos en la fiesta!', 'Gracias por compartir con nosotros el inicio de esta nueva etapa.'],
      xv:    ['Gracias por acompañarme en este día tan importante.', 'Gracias por ser parte de mi historia.',
              'Nada sería igual sin ti. ¡Nos vemos en la fiesta!', 'Gracias por compartir conmigo esta noche tan especial.'],
      otro:  ['Gracias por acompañarnos en este día tan importante.', '¡Nos vemos en la fiesta!']
    }
  };

  function tipo() {
    var t = (document.getElementById('tipo') || {}).value || 'boda';
    return (t === 'boda' || t === 'xv') ? t : 'otro';
  }
  function lista(campo) {
    var o = O[campo]; if (!o) return [];
    return o[tipo()] || o.neutro || o.otro || [];
  }

  function armar(campo) {
    var inp = document.getElementById(campo);
    if (!inp || inp.dataset.opciones) return;
    inp.dataset.opciones = '1';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opc-btn';
    btn.textContent = 'Ver opciones';
    var caja = document.createElement('div');
    caja.className = 'opc-lista';
    function pintar() {
      caja.textContent = '';
      lista(campo).forEach(function (txt) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = txt;
        b.onclick = function () {
          inp.value = txt;
          if (campo === 'kick') inp.dataset.touched = '1';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          caja.classList.remove('open');
          btn.textContent = 'Ver opciones';
        };
        caja.appendChild(b);
      });
    }
    btn.onclick = function () {
      var abierto = caja.classList.toggle('open');
      if (abierto) pintar();
      btn.textContent = abierto ? 'Cerrar opciones' : 'Ver opciones';
    };
    inp.insertAdjacentElement('afterend', caja);
    inp.insertAdjacentElement('afterend', btn);
  }

  function arrancar() {
    Object.keys(O).forEach(armar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.CREAR_OPCIONES = O;
})();
