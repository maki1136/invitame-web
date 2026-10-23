/* ===== MESA DE REGALOS: IMAGEN Y RÓTULO ABAJO DEL TEXTO (23/10/2026) =========
   citlalli-y-hedwin-jesus: argollas arriba, «Con cariño», el texto, y abajo el
   sobrecito con «LLUVIA DE SOBRES».
   fx.regalo.pieImg (imagen), fx.regalo.pieTexto (rótulo), fx.regalo.sinTitulo
   (esconde «Mesa de regalos»). Panel: REGALOS → «Abajo del texto».
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRegaloPie) return; window.__invRegaloPie = 1;
  var ID = 'reg-pie';
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var r = (ev.fx && ev.fx.regalo) || {};
    var sec = document.querySelector('[data-sec=regalos]'); if (!sec) return;
    var h2 = document.getElementById('reg-h2');
    if (h2) { if (r.sinTitulo) { h2.style.setProperty('display', 'none', 'important'); h2.setAttribute('data-sin-tit', '1'); }
              else if (h2.getAttribute('data-sin-tit')) { h2.style.removeProperty('display'); h2.removeAttribute('data-sin-tit'); } }
    var img = String(r.pieImg || '').trim(), tx = String(r.pieTexto || '').trim();
    var pie = document.getElementById(ID);
    if (!/^https?:\/\//i.test(img) && !tx) { if (pie) pie.remove(); return; }
    if (!pie) {
      pie = document.createElement('div'); pie.id = ID;
      pie.style.cssText = 'margin:18px auto 4px;text-align:center';
      var ref = document.getElementById('reg-btns');
      if (ref) ref.parentNode.insertBefore(pie, ref); else sec.appendChild(pie);
    }
    var firma = img + '§' + tx;
    if (pie.getAttribute('data-f') === firma) return;
    pie.setAttribute('data-f', firma);
    pie.innerHTML = '';
    if (/^https?:\/\//i.test(img)) {
      var i = document.createElement('img'); i.src = img; i.alt = '';
      i.style.cssText = 'display:block;width:min(240px,62vw);height:auto;margin:0 auto';
      pie.appendChild(i);
    }
    if (tx) {
      var t = document.createElement('div'); t.textContent = tx;
      t.style.cssText = 'margin-top:10px;font-size:15px;letter-spacing:.24em;text-transform:uppercase;opacity:.9';
      var f = document.createElement('div'); f.textContent = '♡';
      f.style.cssText = 'margin-top:4px;font-size:13px;opacity:.6';
      pie.appendChild(t); pie.appendChild(f);
    }
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 150); });
    setInterval(aplicar, 1200);
  }
  arrancar();
})();
