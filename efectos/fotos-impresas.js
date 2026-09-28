/* ===== LAS FOTOS IMPRESAS (una variante de galería) ===========================

   Maki, 28/9/2026, pidiendo la renovación de las muestras de XV:
     «no las quiero todas iguales… andá variando un poco con las fotos, más como
      dobladas, como hiciste en Perlas».

   QUÉ HACE: la galería (#car) deja de ser un carrusel plano y pasa a ser una pila
   de fotos IMPRESAS: borde de papel (más ancho abajo, como una instantánea), la
   de arriba apenas torcida y con la ESQUINA DOBLADA, y las otras asomando atrás
   en otros ángulos. El carrusel sigue funcionando igual (flechas, puntos, pase
   automático): sólo cambia cómo se ve.

   SE PRENDE con  fx.fotos = { estilo: 'impresas' }  — y se elige desde el panel
   (pestaña EFECTOS, bloque «Efectos — cómo se ven las fotos»). Regla del panel:
   si Jazmín no lo puede elegir, no existe.

   ⚠️ No toca nada global al cargarse: firma html[data-fotos] y pone su hoja SÓLO
      cuando el evento la pide, y las saca si deja de pedirla.
   ⚠️ Repaso cada 1,2 s (INVEV puede llegar tarde). Nada de MutationObserver.
   ============================================================================ */
(function () {
  'use strict';

  var HOJA = 'inv-fotos-impresas';
  var P = 'html[data-fotos="impresas"] ';
  var PAPEL = '#F4F1EA';

  function css() {
    return [
      /* la pila entera se tuerce un poco: así la esquina doblada acompaña */
      P + '#car{ overflow:visible!important; border-radius:0!important; transform:rotate(-1.6deg); margin:22px auto 30px!important; }',
      P + '#car > img{ box-sizing:border-box!important; border:9px solid ' + PAPEL + '!important; border-bottom-width:32px!important; background:' + PAPEL + '!important; border-radius:2px!important; box-shadow:0 14px 28px rgba(0,0,0,.34), 0 2px 5px rgba(0,0,0,.22)!important; transition:opacity 1s ease!important; }',
      /* las de atrás asoman en otros ángulos */
      P + '#car > img:not(.on){ opacity:1!important; z-index:1!important; transform:rotate(4.2deg) translate(10px,6px) scale(.965)!important; }',
      P + '#car > img:nth-of-type(2n):not(.on){ transform:rotate(-5deg) translate(-10px,9px) scale(.965)!important; }',
      P + '#car > img:nth-of-type(3n):not(.on){ transform:rotate(1.8deg) translate(4px,12px) scale(.955)!important; }',
      /* la de arriba: derecha y con la esquina de arriba a la derecha doblada */
      P + '#car > img.on{ z-index:2!important; transform:none!important; clip-path:polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%); }',
      P + '#car::after{ content:""; position:absolute; top:0; right:0; width:40px; height:40px; z-index:3; pointer-events:none; background-image:linear-gradient(225deg, transparent 50%, #E6E1D6 50%, #CBC4B6 100%); box-shadow:-3px 4px 7px rgba(0,0,0,.28); border-bottom-left-radius:3px; }',
      /* las flechas y los puntos quedan arriba de la pila */
      P + '#car .ar{ z-index:4!important; }',
      '@media (prefers-reduced-motion: reduce){ ' + P + '#car > img{ transition:none!important; } }'
    ].join('\n');
  }

  function ev() { try { return window.INVEV || null; } catch (e) { return null; } }

  function pedido() {
    var e = ev(); if (!e) return false;
    var f = (e.fx || {}).fotos || {};
    return String(f.estilo || '') === 'impresas';
  }

  function poner() {
    var h = document.documentElement;
    if (h.getAttribute('data-fotos') !== 'impresas') h.setAttribute('data-fotos', 'impresas');
    if (!document.getElementById(HOJA)) {
      var s = document.createElement('style'); s.id = HOJA; s.textContent = css();
      (document.head || h).appendChild(s);
    }
  }

  function sacar() {
    var h = document.documentElement;
    if (h.getAttribute('data-fotos') === 'impresas') h.removeAttribute('data-fotos');
    var s = document.getElementById(HOJA); if (s) s.remove();
  }

  function sincronizar() { if (pedido()) poner(); else sacar(); }

  /* ---------- EN LA INVITACIÓN ---------- */
  /* sin INVEV (el panel, otras páginas) no hace nada: pedido() da false */
  setInterval(sincronizar, 1200);
  sincronizar();

  /* ---------- EN EL PANEL (admin.html) ---------- */
  var ID = 'fotos-estilo-ajustes';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function cfg(d) { if (!d.fx) d.fx = {}; if (!d.fx.fotos) d.fx.fotos = {}; return d.fx.fotos; }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }

  function construir(d) {
    var caja = document.createElement('div');
    caja.className = 'mejoras';
    caja.id = ID;
    var h = document.createElement('div');
    h.className = 'h';
    h.textContent = 'Efectos — cómo se ven las fotos de la galería';
    caja.appendChild(h);

    var g = document.createElement('div'); g.className = 'grp';
    var l = document.createElement('label'); l.textContent = 'Estilo de la galería'; g.appendChild(l);
    var s = document.createElement('select');
    [['', 'Normal (carrusel a pantalla)'], ['impresas', 'Fotos impresas, apiladas y con la esquina doblada']].forEach(function (o) {
      var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op);
    });
    s.value = String(cfg(d).estilo || '');
    s.onchange = function () { cfg(d).estilo = this.value; refrescar(); };
    g.appendChild(s);
    var a = document.createElement('div'); a.className = 'hint';
    a.textContent = 'Impresas: cada foto con borde de papel, la de arriba con la esquina doblada y las demás asomando atrás. Sirve en invitaciones claras y oscuras.';
    g.appendChild(a);
    caja.appendChild(g);
    return caja;
  }

  function enEfectos() { return !!document.querySelector('.mejoras .h.efx'); }
  function anclaje() { var t = document.querySelectorAll('.mejoras'); return t.length ? t[t.length - 1] : null; }

  function revisar() {
    var d = borrador();
    var ya = document.getElementById(ID);
    if (!d || !enEfectos()) { if (ya) ya.remove(); return; }
    if (ya) return;
    var an = anclaje();
    if (!an || !an.parentNode) return;
    an.parentNode.insertBefore(construir(d), an.nextSibling);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
