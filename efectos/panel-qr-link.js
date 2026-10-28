/* ===== QR PARA ABRIR LA INVITACIÓN (28/10/2026) ==============================
   Jazmín: «se puede hacer un QR para ingresar a la invitación. No para usar como
   control de acceso, sino para escanear y visualizar la invitación» (una
   clienta quiere ponerlo en pulseritas para los chicos). En la plataforma vieja
   estaba en Invitados → «QR con links a las invitaciones».

   QUÉ HACE (panel → pestaña INVITADOS, arriba)
   · El QR del link general de la invitación, para imprimir: se elige el color,
     el tamaño y un texto debajo (opcional), y se descarga en PNG.
   · Si la invitación tiene invitados con link propio: «Descargar el QR de cada
     invitado» (una imagen por invitado, con su nombre debajo).
   ⚠️ No es el QR del pase ni sirve para la puerta: sólo abre la invitación.
   ⚠️ Usa la librería QRCode que ya carga admin.html.
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'qrlink-selector', BASE = 'https://invitameok.net/i/';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  var BTN = 'border:0;border-radius:20px;padding:8px 14px;font-weight:700;cursor:pointer;background:#efe7de;color:#49111A;font-size:12.5px';

  /* arma el QR en un canvas grande, con margen blanco y texto opcional */
  function armar(url, op) {
    return new Promise(function (ok) {
      var tam = op.tam || 1200, tmp = el('div', 'position:fixed;left:-9999px;top:0');
      document.body.appendChild(tmp);
      new window.QRCode(tmp, { text: url, width: tam, height: tam, colorDark: op.color || '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
      setTimeout(function () {
        var src = tmp.querySelector('canvas');
        var m = Math.round(tam * 0.08), alto = op.texto ? Math.round(tam * 0.16) : 0;
        var c = document.createElement('canvas'); c.width = tam + m * 2; c.height = tam + m * 2 + alto;
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        if (src) x.drawImage(src, m, m, tam, tam);
        if (op.texto) {
          x.fillStyle = op.color || '#000'; x.textAlign = 'center'; x.textBaseline = 'middle';
          var f = Math.round(tam * 0.075); x.font = '600 ' + f + 'px "Nunito", Arial, sans-serif';
          while (x.measureText(op.texto).width > c.width - m * 2 && f > 12) { f -= 2; x.font = '600 ' + f + 'px "Nunito", Arial, sans-serif'; }
          x.fillText(op.texto, c.width / 2, tam + m + alto / 2);
        }
        tmp.remove(); ok(c);
      }, 60);
    });
  }
  function bajar(c, nombre) {
    return new Promise(function (ok) {
      c.toBlob(function (b) {
        var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); ok(); }, 600);
      }, 'image/png');
    });
  }
  function limpio(s) { return String(s || 'invitacion').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'qr'; }

  function construir() {
    var d = borrador();
    var caja = el('div', 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)'); caja.id = ID;
    caja.appendChild(el('div', 'font-size:14px;font-weight:700;color:#6D1233;margin-bottom:2px', 'QR para abrir la invitación'));
    caja.appendChild(el('div', 'font-size:12px;opacity:.65;margin-bottom:10px;line-height:1.35', 'Para imprimir en pulseras, souvenirs o carteles: al escanearlo se abre la invitación. No es el QR del pase ni sirve para la puerta.'));
    var fila = el('div', 'display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap');
    var vista = el('img', 'width:150px;height:auto;border:1px solid rgba(0,0,0,.12);border-radius:10px;background:#fff');
    var der = el('div', 'flex:1;min-width:220px;font-size:12.5px');
    fila.appendChild(vista); fila.appendChild(der); caja.appendChild(fila);

    var linkTxt = el('div', 'word-break:break-all;margin:0 0 8px;opacity:.8');
    der.appendChild(linkTxt);
    var lab = function (t) { der.appendChild(el('div', 'font-weight:600;margin:6px 0 3px', t)); };
    lab('Texto debajo del QR (opcional)');
    var inTxt = document.createElement('input'); inTxt.type = 'text'; inTxt.placeholder = 'Ej.: Escaneame · Mis XV Sofía'; inTxt.style.cssText = 'width:100%';
    der.appendChild(inTxt);
    var filaOp = el('div', 'display:flex;gap:12px;align-items:center;margin-top:8px;flex-wrap:wrap');
    var colLab = el('label', 'display:flex;gap:6px;align-items:center'); var inCol = document.createElement('input'); inCol.type = 'color'; inCol.value = '#000000';
    colLab.appendChild(el('span', '', 'Color')); colLab.appendChild(inCol);
    var selTam = document.createElement('select');
    [['800', 'Chico (800 px)'], ['1200', 'Mediano (1200 px)'], ['2000', 'Grande para imprenta (2000 px)']].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; selTam.appendChild(op); });
    selTam.value = '1200';
    filaOp.appendChild(colLab); filaOp.appendChild(selTam); der.appendChild(filaOp);
    var bGen = el('button', BTN + ';background:#6D1233;color:#fff;margin-top:10px', 'Descargar el QR (PNG)'); bGen.type = 'button';
    der.appendChild(bGen);
    var bInv = el('button', BTN + ';margin:10px 0 0 6px', ''); bInv.type = 'button';
    der.appendChild(bInv);
    var nota = el('div', 'margin-top:6px;opacity:.75'); der.appendChild(nota);

    function url() { var s = (borrador() || {}).slug || ''; return BASE + '?e=' + encodeURIComponent(s); }
    function op() { return { color: inCol.value || '#000', texto: inTxt.value.trim(), tam: parseInt(selTam.value, 10) || 1200 }; }
    var t = null;
    function previa() {
      clearTimeout(t); t = setTimeout(function () {
        if (!window.QRCode) { nota.textContent = 'Cargando…'; return; }
        linkTxt.textContent = url();
        armar(url(), Object.assign(op(), { tam: 400 })).then(function (c) { vista.src = c.toDataURL('image/png'); });
        var inv = ((borrador() || {}).invitados || []).filter(function (g) { return g && g.t; });
        bInv.style.display = inv.length ? '' : 'none';
        bInv.textContent = 'Descargar el QR de cada invitado (' + inv.length + ')';
      }, 250);
    }
    inTxt.oninput = previa; inCol.oninput = previa; selTam.onchange = previa;
    bGen.onclick = function () {
      armar(url(), op()).then(function (c) { return bajar(c, 'qr-' + limpio((borrador() || {}).slug) + '.png'); })
        .then(function () { nota.textContent = 'Listo: se descargó el QR.'; });
    };
    bInv.onclick = function () {
      var d0 = borrador() || {}, inv = (d0.invitados || []).filter(function (g) { return g && g.t; }), i = 0;
      bInv.disabled = true;
      (function una() {
        if (i >= inv.length) { bInv.disabled = false; nota.textContent = 'Listo: ' + inv.length + ' QR descargados.'; return; }
        var g = inv[i++], u = BASE + '?e=' + encodeURIComponent(d0.slug || '') + '&g=' + encodeURIComponent(g.t);
        nota.textContent = 'Descargando ' + i + ' de ' + inv.length + '…';
        armar(u, Object.assign(op(), { texto: (inTxt.value.trim() ? inTxt.value.trim() + ' · ' : '') + (g.n || '') }))
          .then(function (c) { return bajar(c, 'qr-' + limpio(d0.slug) + '-' + limpio(g.n || ('invitado-' + i)) + '.png'); })
          .then(function () { setTimeout(una, 350); });
      })();
    };
    caja.__previa = previa;
    previa();
    return caja;
  }

  function revisar() {
    if (!borrador() || !window.invCasa) return;
    var ya = document.getElementById(ID);
    if (ya) { return; }
    var m = window.invCasa(ID); if (!m) return;
    m.appendChild(construir());
  }
  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 900); revisar(); }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
