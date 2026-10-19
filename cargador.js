window.__can=v=>Array.isArray(v)?'['+v.map(__can).join(',')+']':(v&&typeof v==='object')?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+__can(v[k])).join(',')+'}':JSON.stringify(v);
/* Cargador de muestras EN EL PANEL (skill §99): abre /admin.html?e=<slug> en un
   iframe del mismo panel, vuelca los campos en el `D` de ESE panel (los mismos que
   escriben sus controles), crea Invítame Live con el mismo pedido que el botón
   «Crear la galería de esta fiesta», y toca «Guardar y publicar». Después relee. */
window.__cargar = async function (doc, opts) {
  opts = opts || {};
  const log = [];
  const espera = ms => new Promise(r => setTimeout(r, ms));
  let fr = document.getElementById('__carga');
  if (fr) fr.remove();
  fr = document.createElement('iframe');
  fr.id = '__carga';
  fr.style.cssText = 'position:fixed;right:0;bottom:0;width:430px;height:800px;z-index:99999;border:2px solid #b0306e;background:#fff';
  const existe = !!(await INV.getEvento(doc.slug));
  fr.src = '/admin.html' + (existe ? '?e=' + encodeURIComponent(doc.slug) : '');
  document.body.appendChild(fr);
  const w = () => fr.contentWindow;
  for (let i = 0; i < 60; i++) {
    await espera(500);
    try { if (w().INV && w().INV.ok && w().INV.user && w().eval('typeof D') === 'object' && (!existe || w().eval('D.slug') === doc.slug)) break; } catch (e) {}
  }
  const W = w();
  W.confirm = () => true; W.alert = (m) => log.push('alert: ' + String(m).slice(0, 160)); W.prompt = () => null;
  const D = W.eval('D'); doc = W.JSON.parse(JSON.stringify(doc)); window.__gids = window.__gids || {};
  if (!existe) {               /* invitación nueva: se parte del ejemplo del panel y se le saca todo lo del ejemplo */
    ['galeria','personas','trivia','cover','coverVideo','musicaUrl','videoUrl','spotifyUrl'].forEach(k => { if (k in D) D[k] = Array.isArray(D[k]) ? [] : ''; });
    Object.keys(D).forEach(k => { if (/^img_/.test(k)) D[k] = ''; });
    D.fTit = ''; D.color = ''; D.cer = '';
  }
  const fxViejo = JSON.parse(JSON.stringify(D.fx || {}));
  for (const k of Object.keys(doc)) { if (k !== 'fx') D[k] = doc[k]; }
  D.fx = D.fx || {};
  for (const k of Object.keys(doc.fx || {})) D.fx[k] = doc.fx[k];
  /* Live: se conserva el gid si ya tenía; si no, se crea como el botón del panel */
  const gidViejo = ((fxViejo.galeria || {}).gid) || window.__gids[doc.slug] || '';
  if (gidViejo) D.fx.galeria.gid = gidViejo;
  else if (opts.live !== false) {
    try {
      const tok = await W.INV.user.getIdToken(true);
      const r = await fetch('/galeria-alta.php', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: tok, nombre: D.pnom || D.n1 || D.slug, fecha: String(D.fecha || '').slice(0, 10), modo: 'auto', audios: true, muestra: true }) });
      const j = await r.json().catch(() => ({}));
      if (j && j.ok && j.gid) { D.fx.galeria.gid = j.gid; D.fx.galeria.encendido = true; window.__gids[doc.slug] = j.gid; log.push('live ok'); }
      else log.push('live FALLÓ: ' + JSON.stringify(j).slice(0, 120));
    } catch (e) { log.push('live error ' + e.message); }
  }
  try { W.renderPanel && W.renderPanel(); W.postPreview && W.postPreview(); } catch (e) {}
  await espera(1200);
  try { await W.eval('publicar()'); } catch (e) { log.push('publicar error ' + e.message); }
  await espera(2500);
  const ev = await INV.getEvento(doc.slug);
  const faltan = [];
  if (!ev) faltan.push('NO SE GUARDÓ');
  else {
    for (const k of Object.keys(doc)) {
      if (k === 'fx') continue;
      if (__can(ev[k]) !== __can(doc[k])) faltan.push(k);
    }
    for (const k of Object.keys(doc.fx || {})) {
      const a = __can((ev.fx || {})[k]), b = __can(doc.fx[k]);
      if (k !== 'galeria' && k !== 'fondo' && a !== b) faltan.push('fx.' + k);
    }
  }
  return { slug: doc.slug, guardado: !!ev, gid: ((ev && ev.fx && ev.fx.galeria) || {}).gid ? 'si' : 'no', marcaPanel: ev && ev.guardadoPanel, distintos: faltan, log };
};
'cargador listo';
