/* ===== LA LETRA SOBRE EL LACRE DE LOS SOBRES DE FOTO (3/11/2026) =============
   Jazmín: «cambiar ese corazón por la R… ¿se podrá que haya una letra en vez
   del corazón?». Los sobres del catálogo traen el lacre FOTOGRAFIADO, con su
   dibujo adentro (corazón, flor…), y la capa de iniciales del motor (.seal)
   no se ve sobre ellos.

   QUÉ HACE: un sobre del catálogo que trae `lacreLetra` tiene el lacre LISO
   (sin dibujo) y acá se le graba la letra encima, en el lugar exacto de la cera:

     lacreLetra: { x, y, d }   ← centro y diámetro del lacre, en % de la foto
                                 (x e y sobre el ancho/alto, d sobre el ancho)

   Qué letra va, desde el panel («El lacre del sobre», mismos campos de siempre):
     · fx.sobre.sello === false      → nada
     · fx.sobre.ini con texto         → eso («R», «R&E»)
     · si no: la inicial del nombre (y «A&B» si hay dos nombres)
     · fx.sobre.selloColor            → no se usa: la letra va grabada en la
                                        cera (sombra y luz), no pintada encima

   La letra va ADENTRO de la solapa (#col-sobre-solapa .h-arriba), así se
   levanta con ella al abrir.
   ============================================================================ */
(function () {
  'use strict';
  if (window.INVLACRE_LETRA) return;
  var ID = 'lacre-letra';

  function modelo() {
    var ev = window.INVEV || {}, so = (ev.fx || {}).sobre || {};
    var cat = window.SOBRES_INVITAME || {};
    var m = so.modelo && cat[so.modelo];
    return (m && m.lacreLetra) ? { m: m, so: so, ev: ev } : null;
  }

  function texto(ev, so) {
    if (so.sello === false) return '';
    var p = String(so.ini || '').trim();
    if (p) return p.toUpperCase().slice(0, 5);
    var a = String(ev.n1 || '').trim(), b = String(ev.n2 || '').trim();
    if (!a) return '';
    return b ? (a[0] + '&' + b[0]).toUpperCase() : a[0].toUpperCase();
  }

  function hoja() {
    if (document.getElementById(ID + '-css')) return;
    var s = document.createElement('style');
    s.id = ID + '-css';
    s.textContent =
      '#' + ID + '{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;' +
      'pointer-events:none;z-index:3;font-family:"Cormorant Garamond","Times New Roman",serif;font-style:italic;font-weight:600;line-height:1;' +
      'color:rgba(92,62,20,.78);' +
      'text-shadow:0 1px 0 rgba(255,236,178,.55),0 -1px 1px rgba(45,28,6,.55),1px 1px 2px rgba(255,226,150,.25);' +
      'mix-blend-mode:multiply;white-space:nowrap}' +
      '#' + ID + '.dos{letter-spacing:-.04em}';
    document.head.appendChild(s);
    if (!document.querySelector('link[href*="lacre-letra"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&display=swap&lacre-letra';
      document.head.appendChild(l);
    }
  }

  function sacar() { var e = document.getElementById(ID); if (e) e.remove(); }

  function poner() {
    var q = modelo();
    var caja = document.getElementById('col-sobre-solapa');
    var arriba = caja && caja.querySelector('.h-arriba');
    if (!q || !arriba) { sacar(); return; }
    var t = texto(q.ev, q.so);
    if (!t) { sacar(); return; }
    var L = q.m.lacreLetra, W = caja.clientWidth, H = caja.clientHeight;
    if (!W || !H) return;
    hoja();
    var e = document.getElementById(ID);
    if (!e || e.parentNode !== arriba) { sacar(); e = document.createElement('div'); e.id = ID; arriba.appendChild(e); }
    var d = (L.d / 100) * W;
    /* la solapa cuelga por arriba de la caja (bisagra): se compensa su corrimiento */
    var top = -arriba.offsetTop + (L.y / 100) * H;
    e.style.left = ((L.x / 100) * W) + 'px';
    e.style.top = top + 'px';
    e.style.width = e.style.height = d + 'px';
    var largo = t.replace(/\s/g, '').length;
    e.style.fontSize = (d * (largo <= 1 ? 0.62 : largo <= 3 ? 0.36 : 0.27)) + 'px';
    e.classList.toggle('dos', largo > 1);
    if (e.textContent !== t) e.textContent = t;
  }

  window.INVLACRE_LETRA = { poner: poner };

  function arrancar() {
    poner();
    addEventListener('resize', poner);
    addEventListener('message', function () { setTimeout(poner, 150); });
    var n = 0, t = setInterval(function () { poner(); if (++n > 40) clearInterval(t); }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
