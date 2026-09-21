/* ===== ADMIN DE INVÍTAME · parte 6 · EL EQUIPO Y SUS PERMISOS =====================

   ⭐ POR QUÉ EXISTE ESTE ARCHIVO
   Maki, 21/9/2026: «necesito que crees un usuario para Aylén y otro para
   Valeria», y después: «el control total lo tengo yo, que puedo autorizar al
   borrado y ver estadísticas».

   Hasta hoy el panel no tenía roles: entrar era ser admin. Cualquier persona
   con cuenta podía bajarse la base entera, RESTAURARLA encima (que pisa todo)
   y borrar invitaciones vencidas. Para sumar gente al equipo hacía falta esto
   primero.

   ⚠️⚠️⚠️ LO MÁS IMPORTANTE, Y HAY QUE DECIRLO SIEMPRE:
   ESCONDER UN BOTÓN NO ES SEGURIDAD. Este archivo apaga lo que no le toca a
   cada una, pero cualquiera que abra la consola del navegador puede llamar a
   la función igual. **El candado de verdad son las reglas de Firestore**, que
   viven en la consola de Firebase (proyecto invitame-9b51f) y se pegan a mano.
   Mientras esas reglas no estén puestas, esto es orden y prolijidad — no
   seguridad — y así hay que contarlo.

   ⭐ LOS TRES ROLES
     · duena    → todo, y además da y saca permisos, aprueba borrados,
                  backup / restaurar, configuración y estadísticas.
     · calidad  → lo de carga + REVISAR Y ENTREGAR + el interruptor de marcas.
                  Es el permiso que ya tenía Jazmín desde el 8/9.
     · carga    → crear y editar invitaciones, invitados, fotos y textos.
                  No borra, no entrega, no toca la configuración.
   Invítame Live (crear la galería) lo pueden TODAS: decisión de Maki, 21/9.

   ⚠️ LA RED PARA NO QUEDARSE AFUERA
   Si `inv_equipo` todavía está vacía, todas entran como dueña y se avisa en
   pantalla. Y el correo de Maki es dueña SIEMPRE, aunque su documento no
   exista o alguien lo rompa: es la llave de repuesto para no quedar
   encerrada afuera de su propio panel.

   ⚠️ ES UN ARCHIVO APARTE Y SE CARGA ÚLTIMO, como 5-entrega.js. Los otros
      módulos ya funcionan; algo nuevo no tiene por qué poder romperlos.
   ============================================================================ */
(function () {

  var DUENA_FIJA = 'littlemomentsok@gmail.com';   // la llave de repuesto

  var ROTULO = { duena: 'Dueña', calidad: 'Control de calidad', carga: 'Carga' };

  /* Qué puede cada rol. Todo lo que no está acá lo pueden todas. */
  var PUEDE = {
    duena:   { entregar: 1, marcas: 1, borrar: 1, backup: 1, config: 1, stats: 1, equipo: 1 },
    calidad: { entregar: 1, marcas: 1, borrar: 0, backup: 0, config: 0, stats: 0, equipo: 0 },
    carga:   { entregar: 0, marcas: 0, borrar: 0, backup: 0, config: 0, stats: 0, equipo: 0 }
  };

  var ROL = null;        // el rol de quien está adentro
  var MAIL = '';
  var pintado = false;
  var AVISO = '';        // el renglón amarillo de la chapita, si hay algo que decir
  var arrancando = false;
  var latiendo = false;

  function puede(q) { return !!(PUEDE[ROL] && PUEDE[ROL][q]); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function slugAbierto() {
    try { return (new URLSearchParams(location.search).get('e') || '').trim(); }
    catch (e) { return ''; }
  }

  /* ------------------------------------------------ apagar lo que no le toca
     Se buscan los botones por lo que LLAMAN, no por su texto: el texto cambia
     con el idioma y con el ícono, el `onclick` no. */
  function botonQueLlama(fn) {
    var todos = document.querySelectorAll('button[onclick]');
    for (var i = 0; i < todos.length; i++) {
      if ((todos[i].getAttribute('onclick') || '').indexOf(fn) >= 0) return todos[i];
    }
    return null;
  }

  function apagar(b, porque) {
    if (!b || b.dataset.permApagado) return;
    b.dataset.permApagado = '1';
    b.disabled = true;
    b.style.opacity = '.38';
    b.style.cursor = 'not-allowed';
    b.title = porque;
    /* ⚠️ No alcanza con `disabled`: el `onclick` inline igual se dispara si
       algo llama al botón por código. Se lo sacamos. */
    b.removeAttribute('onclick');
    b.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      alert(porque);
    }, true);
  }

  function aplicar() {
    if (!ROL) return;

    if (!puede('backup')) {
      apagar(botonQueLlama('backup('),    'La copia de seguridad la maneja Maki.');
      apagar(botonQueLlama('restaurar('), 'Restaurar pisa la base entera. Sólo Maki.');
    }
    if (!puede('borrar')) {
      apagar(botonQueLlama('limpiarVencidas('),
             'El borrado lo autoriza Maki. Usá «Pedir borrado».');
    }
    if (!puede('marcas')) {
      apagar(botonQueLlama('verMarcas('), 'Las marcas las maneja Maki.');
    }
    /* La caja de entrega (5-entrega.js) se dibuja sola y puede llegar después,
       así que esto se repasa cada tanto, no una sola vez. */
    if (!puede('entregar')) {
      var caja = document.getElementById('cajaentrega');
      if (caja && !caja.dataset.permApagado) {
        caja.dataset.permApagado = '1';
        var bs = caja.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) {
          var oc = bs[i].getAttribute('onclick') || '';
          var t  = (bs[i].textContent || '').toLowerCase();
          if (/entregar|aprobar|publicar/.test(oc + ' ' + t)) {
            apagar(bs[i], 'La entrega la hace Maki o Jazmín.');
          }
        }
      }
    }
  }

  /* ------------------------------------------------------------ la chapita
     Un renglón discreto arriba de todo que dice con qué permiso entraste. Sin
     esto nadie sabe por qué un botón está apagado. */
  function chapita(aviso) {
    var id = 'permchapa', v = document.getElementById(id);
    if (!v) {
      v = document.createElement('div');
      v.id = id;
      v.style.cssText = 'font-size:11.5px;padding:5px 10px;border-radius:7px;' +
        'background:rgba(0,0,0,.05);display:inline-block;margin:0 0 8px 0;line-height:1.4';
      var m = document.querySelector('.mejoras');
      if (m) m.insertBefore(v, m.firstChild); else return;
    }
    v.innerHTML = '<b>' + esc(ROTULO[ROL] || ROL) + '</b> · ' + esc(MAIL) +
                  (aviso ? '<br><span style="color:#8a6d1f">' + esc(aviso) + '</span>' : '');
  }

  /* ----------------------------------------------------------- pedir borrado
     Para las que no pueden borrar. Queda anotado con motivo y autor; Maki lo
     aprueba o lo rechaza desde su caja. */
  function cajaPedir() {
    if (puede('borrar')) return;
    var slug = slugAbierto();
    if (!slug) return;
    var m = document.querySelector('.mejoras');
    if (!m || document.getElementById('permpedir')) return;

    var c = document.createElement('div');
    c.id = 'permpedir';
    c.style.cssText = 'margin:10px 0 14px;padding:10px 11px;border-radius:8px;' +
      'background:rgba(0,0,0,.045);border:1px solid rgba(0,0,0,.08)';
    c.innerHTML =
      '<div style="font-size:12px;font-weight:600;margin-bottom:2px">Borrar esta invitación</div>' +
      '<div style="font-size:11px;opacity:.65;margin-bottom:7px;line-height:1.35">' +
      'No la borrás vos: queda anotada y la autoriza Maki.</div>' +
      '<input id="permmotivo" type="text" placeholder="¿Por qué hay que borrarla?" style="width:100%">' +
      '<button id="permbtnpedir" class="btn-c" style="margin-top:7px">Pedir borrado</button>' +
      '<div id="permpedidoec" style="font-size:11px;margin-top:5px"></div>';
    m.appendChild(c);

    document.getElementById('permbtnpedir').onclick = function () {
      var mot = (document.getElementById('permmotivo').value || '').trim();
      if (!mot) { alert('Escribí por qué hay que borrarla.'); return; }
      var b = this; b.disabled = true; b.textContent = 'Pidiendo…';
      window.INV.pedirBorrado(slug, mot, MAIL).then(function () {
        b.textContent = 'Pedido enviado';
        document.getElementById('permpedidoec').textContent =
          'Listo. Maki lo ve en su panel.';
      })['catch'](function (e) {
        b.disabled = false; b.textContent = 'Pedir borrado';
        alert('No se pudo pedir: ' + e);
      });
    };
  }

  /* ------------------------------------------------- los pedidos, para Maki */
  function cajaPedidos() {
    if (!puede('borrar')) return;
    var m = document.querySelector('.mejoras');
    if (!m || document.getElementById('permpedidos')) return;

    var c = document.createElement('div');
    c.id = 'permpedidos';
    c.style.cssText = 'margin:10px 0 14px;padding:10px 11px;border-radius:8px;' +
      'background:rgba(190,150,60,.10);border:1px solid rgba(190,150,60,.28);display:none';
    m.appendChild(c);

    function pintar() {
      window.INV.listBorrados().then(function (lista) {
        var p = (lista || []).filter(function (x) { return (x.estado || '') === 'pendiente'; });
        if (!p.length) { c.style.display = 'none'; return; }
        c.style.display = 'block';
        var h = '<div style="font-size:12px;font-weight:600;margin-bottom:6px">' +
                'Pedidos de borrado (' + p.length + ')</div>';
        p.forEach(function (x) {
          h += '<div data-slug="' + esc(x.slug) + '" style="font-size:11.5px;padding:6px 0;' +
               'border-top:1px solid rgba(0,0,0,.08);line-height:1.45">' +
               '<b>' + esc(x.slug) + '</b><br>' +
               esc(x.motivo || '') + '<br>' +
               '<span style="opacity:.6">pidió ' + esc(x.por || '') + '</span><br>' +
               '<button class="btn-c permok" style="margin-top:5px">Aprobar y borrar</button> ' +
               '<button class="btn-c permno" style="margin-top:5px">Rechazar</button>' +
               '</div>';
        });
        c.innerHTML = h;

        c.querySelectorAll('.permok').forEach(function (b) {
          b.onclick = function () {
            var slug = this.closest('[data-slug]').getAttribute('data-slug');
            if (!confirm('Se borra la invitación «' + slug + '». No se puede deshacer.\n\n¿Seguro?')) return;
            /* ⚠️ Primero se deja constancia, después se borra. Si el borrado
               falla, el pedido igual quedó resuelto y se ve en el historial. */
            window.INV.resolverBorrado(slug, 'aprobado', MAIL).then(function () {
              return window.INV.saveEvento(slug, { estado: 'borrada', borradaPor: MAIL });
            }).then(function () { pintar(); alert('Listo.'); })
            ['catch'](function (e) { alert('No se pudo: ' + e); });
          };
        });
        c.querySelectorAll('.permno').forEach(function (b) {
          b.onclick = function () {
            var slug = this.closest('[data-slug]').getAttribute('data-slug');
            window.INV.resolverBorrado(slug, 'rechazado', MAIL)
              .then(pintar)['catch'](function (e) { alert('No se pudo: ' + e); });
          };
        });
      })['catch'](function () { /* sin permiso de lectura: no se dibuja nada */ });
    }
    pintar();
    setInterval(pintar, 30000);
  }

  /* ------------------------------------------------------ la caja de EQUIPO
     Sólo para la dueña. Es lo que hace que mañana no haya que tocar código
     para sumar a Aylén y a Valeria. */
  function cajaEquipo() {
    if (!puede('equipo')) return;
    var m = document.querySelector('.mejoras');
    if (!m || document.getElementById('permequipo')) return;

    var c = document.createElement('div');
    c.id = 'permequipo';
    c.style.cssText = 'margin:10px 0 16px;padding:11px 12px;border-radius:8px;' +
      'background:rgba(0,0,0,.045);border:1px solid rgba(0,0,0,.08)';
    m.appendChild(c);

    function pintar() {
      window.INV.listEquipo().then(function (lista) {
        var h = '<div style="font-size:12.5px;font-weight:600;margin-bottom:2px">Equipo</div>' +
                '<div style="font-size:11px;opacity:.65;margin-bottom:9px;line-height:1.35">' +
                'Quién entra al panel y con qué permiso. El correo tiene que ser el mismo ' +
                'con el que esa persona inicia sesión.</div>';

        (lista || []).forEach(function (p) {
          var baja = (p.activo === false);
          h += '<div data-mail="' + esc(p.mail) + '" style="font-size:11.5px;padding:7px 0;' +
               'border-top:1px solid rgba(0,0,0,.08);' + (baja ? 'opacity:.45;' : '') + '">' +
               '<b>' + esc(p.nombre || p.mail) + '</b>' +
               (baja ? ' <span style="color:#9b2c2c">(dada de baja)</span>' : '') +
               '<br><span style="opacity:.7">' + esc(p.mail) + '</span><br>' +
               '<select class="permrol" style="margin-top:5px">' +
                 '<option value="duena">Dueña</option>' +
                 '<option value="calidad">Control de calidad</option>' +
                 '<option value="carga">Carga</option>' +
               '</select> ' +
               (baja ? '<button class="btn-c permalta" style="margin-top:5px">Reactivar</button>'
                     : '<button class="btn-c permbaja" style="margin-top:5px">Dar de baja</button>') +
               '</div>';
        });

        h += '<div style="border-top:1px solid rgba(0,0,0,.08);margin-top:9px;padding-top:9px">' +
             '<input id="permnvmail" type="email" placeholder="Correo de la persona" style="width:100%">' +
             '<input id="permnvnom" type="text" placeholder="Nombre" style="width:100%;margin-top:5px">' +
             '<select id="permnvrol" style="width:100%;margin-top:5px">' +
               '<option value="carga">Carga</option>' +
               '<option value="calidad">Control de calidad</option>' +
               '<option value="duena">Dueña</option>' +
             '</select>' +
             '<button id="permnvbtn" class="btn-c" style="margin-top:6px">Agregar al equipo</button>' +
             '<div style="font-size:10.5px;opacity:.6;margin-top:5px;line-height:1.35">' +
             'Agregarla acá le da el permiso. La CUENTA se crea aparte, en Firebase → ' +
             'Authentication → Add user, con el mismo correo.</div>' +
             '</div>';

        c.innerHTML = h;

        (lista || []).forEach(function (p) {
          var fila = c.querySelector('[data-mail="' + p.mail + '"]');
          if (!fila) return;
          var sel = fila.querySelector('.permrol');
          sel.value = (p.rol === 'duena' || p.rol === 'calidad') ? p.rol : 'carga';
          sel.onchange = function () {
            window.INV.saveMiembro(p.mail, { rol: sel.value, porQuien: MAIL })
              .then(pintar)['catch'](function (e) { alert('No se pudo: ' + e); });
          };
          var bb = fila.querySelector('.permbaja');
          if (bb) bb.onclick = function () {
            if (p.mail === DUENA_FIJA) { alert('A Maki no se le puede sacar el permiso.'); return; }
            if (!confirm('Sacarle el permiso a ' + p.mail + '?')) return;
            window.INV.bajaMiembro(p.mail).then(pintar)['catch'](function (e) { alert('No se pudo: ' + e); });
          };
          var ba = fila.querySelector('.permalta');
          if (ba) ba.onclick = function () {
            window.INV.saveMiembro(p.mail, { activo: true, porQuien: MAIL })
              .then(pintar)['catch'](function (e) { alert('No se pudo: ' + e); });
          };
        });

        var btn = c.querySelector('#permnvbtn');
        if (btn) btn.onclick = function () {
          var mail = (c.querySelector('#permnvmail').value || '').trim().toLowerCase();
          var nom  = (c.querySelector('#permnvnom').value || '').trim();
          var rol  = c.querySelector('#permnvrol').value;
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { alert('Ese correo no parece un correo.'); return; }
          this.disabled = true;
          window.INV.saveMiembro(mail, { nombre: nom, rol: rol, activo: true, porQuien: MAIL })
            .then(function () { pintar(); })
            ['catch'](function (e) { alert('No se pudo: ' + e); })
            .then(function(){ if (btn) btn.disabled = false; });
        };
      })['catch'](function (e) {
        c.innerHTML = '<div style="font-size:11.5px">No se pudo leer el equipo.<br>' +
                      '<span style="opacity:.6">' + esc(String(e)) + '</span></div>';
      });
    }
    pintar();
  }

  /* --------------------------------------------------------------- arranque

     ⚠️⚠️ TRAMPA YA PAGADA — 21/9/2026, la misma tarde que se subió el archivo.
     La chapita y las tres cajas cuelgan de `.mejoras`, que el panel dibuja
     DESPUÉS de que este módulo resuelve el rol. La primera versión pintaba una
     sola vez: llegaba, no encontraba `.mejoras`, se iba en silencio y ya había
     marcado `pintado = true`. Resultado: el rol se calculaba bien y en pantalla
     no aparecía NADA — ni la chapita, ni la caja de Equipo, ni los pedidos.
     Por eso ahora se repasa en el mismo latido que los botones, y `pintado` se
     marca recién cuando el ancla existe de verdad.

     ⚠️ Y `esperar()` se llamaba dos veces (suelta y dentro del intervalo), así
     que quedaban DOS escuchas de sesión y `arrancar` corría dos veces. */

  function anclaje() { return document.querySelector('.mejoras'); }

  function repasar() {
    if (!ROL) return;
    aplicar();                       // los botones llegan tarde: se repasa siempre
    if (pintado || !anclaje()) return;
    pintado = true;
    chapita(AVISO);
    cajaEquipo();
    cajaPedidos();
    cajaPedir();
  }

  function latir() {
    if (latiendo) return;
    latiendo = true;
    repasar();
    setInterval(repasar, 1200);
  }

  function arrancar(user) {
    if (arrancando) return;
    MAIL = String((user && user.email) || '').trim().toLowerCase();
    if (!MAIL) return;
    arrancando = true;

    window.INV.listEquipo().then(function (lista) {
      lista = lista || [];
      var yo = null;
      for (var i = 0; i < lista.length; i++) {
        if (String(lista[i].mail || '').toLowerCase() === MAIL) { yo = lista[i]; break; }
      }
      AVISO = '';

      if (MAIL === DUENA_FIJA) {
        ROL = 'duena';                                  // llave de repuesto
      } else if (!lista.length) {
        ROL = 'duena';
        AVISO = 'Todavía no hay equipo cargado: entrás con todos los permisos. ' +
                'Cargá el equipo abajo para que esto se ordene.';
      } else if (!yo) {
        ROL = 'carga';
        AVISO = 'Tu correo no está en el equipo, así que entrás con permisos de carga. ' +
                'Pedile a Maki que te agregue.';
      } else if (yo.activo === false) {
        ROL = 'carga';
        AVISO = 'Tu permiso está dado de baja. Hablá con Maki.';
      } else {
        ROL = (yo.rol === 'duena' || yo.rol === 'calidad') ? yo.rol : 'carga';
      }

      window.INVROL = ROL;   // para que otros módulos lo puedan mirar
      latir();
    })['catch'](function () {
      /* Si no se puede leer el equipo, NO se abre la puerta: queda el rol más
         chico, salvo que sea Maki.

         ⚠️ El motivo casi siempre es UNO: las reglas de Firestore todavía no
         dejan tocar `inv_equipo` (permission-denied). Hay que decirlo con esas
         palabras, no con un «no se pudo» que no lleva a ningún lado. */
      ROL = (MAIL === DUENA_FIJA) ? 'duena' : 'carga';
      window.INVROL = ROL;
      AVISO = (MAIL === DUENA_FIJA)
        ? 'La base todavía no deja leer el equipo: faltan pegar en Firebase las reglas ' +
          'de inv_equipo e inv_borrados. Hasta que estén, la caja de Equipo no aparece ' +
          'y los permisos son sólo prolijidad, no un candado.'
        : 'No se pudo leer el equipo, así que entrás con permisos de carga.';
      latir();
    });
  }

  function esperar() {
    if (!window.INV || !window.INV.onAuth || !window.INV.listEquipo) return false;
    window.INV.onAuth(function (u) { if (u) arrancar(u); });
    return true;
  }

  if (!esperar()) {
    var n = 0;
    var t = setInterval(function () {
      if (esperar() || ++n > 80) clearInterval(t);
    }, 250);
  }
})();
