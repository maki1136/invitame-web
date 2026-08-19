/* ===== LOS AJUSTES DE LA TARJETA ESCRITA, EN EL PANEL =========================

   Suma cinco controles al bloque ✨ EFECTOS, justo debajo de los del sobre, y
   sólo cuando el sobre elegido es una PIEZA ESCRITA (una tarjeta generada en
   blanco sobre la que el motor escribe los datos de la pareja — ver
   /efectos/pieza-carta.js). Con cualquier otro sobre no aparece nada.

   POR QUÉ ESTÁ ACÁ Y NO DENTRO DE admin.html
   admin.html pesa 150 KB y sólo se puede subir a mano, arrastrándolo. Todo lo
   que se pueda resolver desde /efectos/ se resuelve desde acá.

   POR QUÉ ESCRIBE EN `fx` Y NO EN UN CAMPO NUEVO
   En el resto del panel, cada campo se conecta con la invitación por una clave
   CALCULADA A PARTIR DEL TEXTO DE LA ETIQUETA. Si alguien renombra la etiqueta
   para que se entienda mejor, el dato se desconecta en silencio: sigue
   guardándose, nadie lo lee, y no hay ningún error. Los campos de ✨ Efectos no
   tienen ese problema porque van por `fx`, con la clave escrita a mano.

   CÓMO GUARDA
   Escribe directo en `D.fx.pieza` y llama a postPreview(). `D` es el borrador
   que el panel publica.

   ⚠️ `D` NO cuelga de window. Es un `const` del script principal, así que
   `window.D` da undefined — cosa que despista bastante — pero el identificador
   suelto SÍ se ve desde cualquier script clásico, incluido este. Los propios
   campos del panel lo usan así: su oninput es `D.fx.sobre.ini=this.value;…`.
   ============================================================================ */
(function () {

  var ID = 'pieza-ajustes';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function esPiezaEscrita(d) {
    var modelo = (d.fx && d.fx.sobre && d.fx.sobre.modelo) || '';
    var cat = window.SOBRES_INVITAME || {};
    return !!(cat[modelo] && cat[modelo].texto);
  }

  function geometria(d) {
    var modelo = (d.fx && d.fx.sobre && d.fx.sobre.modelo) || '';
    return (window.SOBRES_INVITAME || {})[modelo].texto;
  }

  function pieza(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.pieza) d.fx.pieza = {};
    return d.fx.pieza;
  }

  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }

  /* ---- ¿va a entrar el renglón? ----------------------------------------

     El motor achica el texto hasta que entre en el ancho de la tarjeta. Eso
     está bien como red, pero la diseñadora tiene que enterarse MIENTRAS
     escribe, no descubrirlo después viendo la letra chiquita.

     ⚠️ Ojo con el umbral. La primera versión avisaba en cuanto el texto no
     entraba en el cuerpo base (15 px), y saltaba con la frase POR DEFECTO —
     que entra perfecto en 13. Un aviso sobre el texto que viene de fábrica
     hace parecer que el default está mal. Ahora avisa sólo cuando el renglón
     quedaría por debajo de 11 px, que es donde empieza a leerse mal.
     --------------------------------------------------------------------- */
  var lienzo;
  function anchoAprox(txt, G, cuerpo) {
    if (!txt) return 0;
    lienzo = lienzo || document.createElement('canvas');
    var c = lienzo.getContext('2d');
    var fam = (G.serif || 'Georgia,serif').replace(/'/g, '');
    c.font = cuerpo + 'px ' + fam;
    /* el espaciado entre letras no existe en canvas: se suma a mano */
    return c.measureText(txt.toUpperCase()).width + 4 * Math.max(0, txt.length - 1);
  }

  function cuerpoFinal(txt, G) {
    var base = (G.tam && G.tam.k) || 15;
    var max  = (G.ancho && G.ancho.k) || 330;
    var w = anchoAprox(txt, G, base);
    if (!w || w <= max) return base;
    return Math.max(9, Math.round(base * max / w));
  }

  /* ---- armar los controles --------------------------------------------- */

  function grupo(etiqueta, campo) {
    var g = document.createElement('div');
    g.className = 'grp';
    var l = document.createElement('label');
    l.textContent = etiqueta;
    g.appendChild(l);
    g.appendChild(campo);
    return g;
  }

  function fila() {
    var f = document.createElement('div');
    f.className = 'two';
    for (var i = 0; i < arguments.length; i++) f.appendChild(arguments[i]);
    return f;
  }

  function texto(d, clave, valorPorDefecto, aviso, G) {
    var i = document.createElement('input');
    i.type = 'text';
    var p = pieza(d);
    i.value = (p[clave] != null) ? p[clave] : valorPorDefecto;
    i.placeholder = valorPorDefecto;
    i.oninput = function () {
      pieza(d)[clave] = this.value;
      if (aviso) {
        aviso.textContent = (cuerpoFinal(this.value, G) < 11)
          ? '⚠ muy larga: va a quedar chiquita' : '';
      }
      refrescar();
    };
    if (aviso) i.oninput.call(i);
    return i;
  }

  function lista(d, clave, opciones, porDefecto) {
    var s = document.createElement('select');
    opciones.forEach(function (o) {
      var op = document.createElement('option');
      op.value = String(o[0]); op.textContent = o[1];
      s.appendChild(op);
    });
    var p = pieza(d);
    s.value = String((p[clave] != null) ? p[clave] : porDefecto);
    s.onchange = function () {
      var v = this.value;
      pieza(d)[clave] = (v === 'false') ? false : v;
      refrescar();
    };
    return s;
  }

  function construir(d) {
    var G = geometria(d);
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,0,0,.10)';

    var titulo = document.createElement('div');
    titulo.textContent = 'Lo que dice la tarjeta';
    titulo.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(titulo);

    var ayuda = document.createElement('div');
    ayuda.textContent = 'Los nombres, la fecha, la hora y el lugar se escriben solos con lo que ya cargaste. Acá sólo elegís la frase.';
    ayuda.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(ayuda);

    var av1 = document.createElement('div');
    var av2 = document.createElement('div');
    av1.style.cssText = av2.style.cssText = 'font-size:11px;color:#a8642a;min-height:14px';

    var g1 = grupo('Primera línea', texto(d, 'linea1', 'Junto a sus familias', av1, G));
    var g2 = grupo('Segunda línea', texto(d, 'linea2', 'Tienen el agrado de invitarte', av2, G));
    g1.appendChild(av1); g2.appendChild(av2);
    caja.appendChild(fila(g1, g2));

    caja.appendChild(fila(
      grupo('Entre los nombres', lista(d, 'nexo',
        [['y', 'y'], ['&', '&'], ['e', 'e'], ['', 'sin nada']], 'y')),
      grupo('Qué lugar mostrar', lista(d, 'lugar',
        [['fiesta', 'El de la fiesta'], ['ceremonia', 'El de la ceremonia'], ['false', 'No mostrarlo']], 'fiesta'))
    ));

    caja.appendChild(fila(
      grupo('Fecha y hora', lista(d, 'fecha',
        [['', 'Mostrarlas'], ['false', 'No mostrarlas']], '')),
      grupo('', document.createElement('span'))
    ));

    return caja;
  }

  /* ---- engancharse al panel -------------------------------------------- */

  function anclaje() {
    /* El bloque del sobre termina en el campo de las iniciales. Colgamos de
       ahí, que es donde la diseñadora ya está mirando. */
    var ini = [].slice.call(document.querySelectorAll('.mejoras input'))
                .filter(function (e) { return /M&D/.test(e.placeholder || ''); })[0];
    if (ini) { var t = ini.closest('.two'); if (t) return t; }
    return document.querySelector('.mejoras');
  }

  function revisar() {
    var d = borrador();
    var ya = document.getElementById(ID);
    if (!d || !window.SOBRES_INVITAME || !esPiezaEscrita(d)) { if (ya) ya.remove(); return; }
    if (ya) return;                        /* ya está puesto */

    var a = anclaje();
    if (!a || !a.parentNode) return;        /* la pestaña de Efectos no está abierta */
    a.parentNode.insertBefore(construir(d), a.nextSibling);
  }

  /* El panel se redibuja entero cada vez que se toca algo, y se lleva puesto
     lo que hayamos insertado. Por eso revisamos seguido en vez de una sola vez.
     Es barato: si el bloque ya está, la función sale en la tercera línea. */
  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    if (++n > 60) clearInterval(t);         /* no es un panel: no hacemos nada */
  }, 500);
})();
