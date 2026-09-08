/* ===== ADMIN DE INVÍTAME · parte 4 de 4 · solicitudes, respaldo y arranque =========================

   ⚠️⚠️ ESTO ERA UN SOLO `<script>` DE 128 KB ADENTRO DE `admin.html`.
   Se partió el 7/9/2026 por una razón concreta: mientras estuvo en una sola
   pieza, NADA de admin.html se podía arreglar en el origen. Cada corrección
   había que escribirla como módulo aparte que corre después —un parche— porque
   el archivo entero no entra por la API de GitHub (techo medido: ~40 KB).
   Maki: «hay que arreglar todo para siempre, no quiero parches».

   REGLAS PARA NO ROMPERLO
   · Los cuatro archivos se cargan EN ORDEN desde admin.html, sin `defer`.
     El orden es el mismo que tenían adentro del script original.
   · Todo lo que se declara acá (`const`, `let`, `function`) queda visible para
     los otros tres: son scripts clásicos, comparten el ámbito global.
     ⚠️ Pero `const` y `let` NO quedan en `window` — se leen con el nombre
        pelado. `window.D` da undefined; `D` anda.
   · El ARRANQUE (`buildTabs(); renderPanel(); render(); …`) vive al final de
     la parte 4, y ahí tiene que quedarse: corre cuando ya está todo declarado.
   · Si hay que mover una función de un archivo a otro, mirar antes si alguna
     línea que EJECUTA al cargar la necesita. Al partirlo se verificó que
     ninguna dependía de algo declarado más adelante.

   Cómo se verificó el corte: pegando los cuatro archivos de nuevo, uno atrás
   del otro, el resultado es IDÉNTICO byte a byte al script original.
   ============================================================================ */
  function bloquePanelNovios(){
    const u = window._panelNoviosLink || '';
    if(!u) return '';
    return '<div style="border:1px solid #e6cdd7;background:#fbf3f6;border-radius:10px;padding:12px;margin-bottom:14px">'
      + '<b style="font-size:13px;color:#6D1233">Panel de los novios</b>'
      + '<div style="font-size:12px;color:#666;margin:3px 0 6px">Pasales este link junto con la clave que les pusiste. Ven solo su lista y quien confirmo.</div>'
      + '<input readonly value="' + u + '" style="width:100%;font-size:11px;padding:6px;border:1px solid #ddd;border-radius:6px" onclick="this.select()">'
      + '<button style="margin-top:6px;font-size:12px;padding:5px 10px;border:0;background:#6D1233;color:#fff;border-radius:6px;cursor:pointer"'
      + ' onclick="copiarPanelNovios(this)">Copiar link</button>'
      + ' <a href="' + u + '" target="_blank" style="font-size:12px;margin-left:6px">Abrir</a></div>';
  }

  function showLinks(slug, res){
    const links=res.map(r=>({nombre:r.nombre, url:BASEURL+'?e='+encodeURIComponent(slug)+'&g='+r.token}));
    let box=el('linksbox');
    if(!box){box=document.createElement('div');box.id='linksbox';box.style.cssText='position:fixed;inset:0;background:rgba(20,16,26,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';document.body.appendChild(box);}
    box.innerHTML='<div style="background:#fff;max-width:520px;width:100%;max-height:80vh;overflow:auto;border-radius:14px;padding:22px;font-family:system-ui">'+
      '<h3 style="margin:0 0 4px">'+ICO.tilde+' Publicado: '+slug+'</h3>'+
      '<p style="color:#666;font-size:13px;margin:0 0 14px">'+(links.length?'Estos son los links únicos de cada invitado. Copiá y mandá por WhatsApp.':'Guardaste el diseño. Cargá invitados en la pestaña INVITADOS para generar sus links.')+'</p>'+
      bloquePanelNovios()+
      links.map(l=>'<div style="border:1px solid #eee;border-radius:8px;padding:10px;margin-bottom:8px"><b style="font-size:13px">'+l.nombre+'</b><br><input readonly value="'+l.url+'" style="width:100%;font-size:11px;padding:6px;margin-top:4px;border:1px solid #ddd;border-radius:6px" onclick="this.select()"><button style="margin-top:6px;font-size:12px;padding:5px 10px;border:0;background:#6D1233;color:#fff;border-radius:6px;cursor:pointer" onclick="navigator.clipboard.writeText(\''+l.url+'\');this.textContent=\'¡Copiado!\'">Copiar link</button> <a href="'+l.url+'" target="_blank" style="font-size:12px;margin-left:6px">Abrir '+ICO.diagonal+'</a></div>').join('')+
      '<button style="margin-top:8px;padding:8px 16px;border:0;background:#333;color:#fff;border-radius:8px;cursor:pointer" onclick="document.getElementById(\'linksbox\').remove()">Cerrar</button></div>';
  }

  // Token seguro (mismo criterio que firebase-inv.js y pase-nuevo.php).
  // Antes se usaba Math.random(), que es predecible: con unos pocos tokens de una boda
  // se podian adivinar los demas y entrar con un QR falso.
  function nuevoTokenSeguro(){
    if(window.INV && typeof INV.rndToken==='function') return INV.rndToken();
    const abc='abcdefghijkmnpqrstuvwxyz23456789';
    const b=new Uint8Array(10); crypto.getRandomValues(b);
    return Array.from(b,x=>abc[x%abc.length]).join('');
  }

  // cargar evento existente si viene ?e=slug
  async function cargarEvento(){
    const p=new URLSearchParams(location.search),slug=p.get('e');if(!slug||!window.INV||!INV.ok)return;
    const ev=await INV.getEvento(slug);if(ev){Object.assign(D,ev);}
    // la clave del panel y el mail viven aparte: se traen con la sesion de la disenadora
    const pv=await INV.getPrivado(slug); if(pv){ (INV.CAMPOS_PRIVADOS||[]).forEach(k=>{ if(pv[k]!==undefined) D[k]=pv[k]; }); }
    ensureFX();
    const gs=await INV.listInvitados(slug);if(gs.length)D.invitados=gs.filter(g=>g.activo!==false).map(g=>({n:g.nombre,p:g.pases,m:g.mesa,restriccion:g.restriccion,t:g.token,rsvp:g.rsvp,rsvpPersonas:g.rsvpPersonas,usos:g.usos}));
    renderPanel();render();if(cur==='INVITADOS')renderGuests();
  }

  let _invData=null;
  async function verInvitaciones(){
    if(!window.INV||!INV.exportAll){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    let box=el('invbox');
    if(!box){box=document.createElement('div');box.id='invbox';box.style.cssText='position:fixed;inset:0;background:rgba(73,17,26,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:26px 18px;overflow:auto';document.body.appendChild(box);}
    box.innerHTML='<div class="invmodal" style="background:#fff;max-width:780px;width:100%;border-radius:14px;padding:20px;font-family:Nunito,sans-serif"><div style="color:#9a8f88">Cargando…</div></div>';
    try{
      const data=await INV.exportAll();
      /* Quién armó cada una: vive en `inv_privado` (no en el evento, que es público).
         Una sola lectura de toda la colección: es chica, un documento por invitación. */
      _autores={};
      try{
        const _m=await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const _pv=await _m.getDocs(_m.collection(window.INV.db,'inv_privado'));
        _pv.forEach(function(d){ const x=d.data()||{}; _autores[d.id]={creo:x.creadoPor||'', guardo:x.guardadoPor||'', el:x.guardadoEl||''}; });
      }catch(_e){ /* sin permiso o sin conexión: la columna queda vacía, no se rompe nada */ }
      const counts={},pers={};
      data.invitados.forEach(g=>{if(g.activo!==false){counts[g.slug]=(counts[g.slug]||0)+1;pers[g.slug]=(pers[g.slug]||0)+(parseInt(g.usosMax,10)||1);}});
      _invData=data.eventos.map(ev=>({ev,inv:counts[ev.slug]||0,pp:pers[ev.slug]||0}))
        .sort((a,b)=>((parseInt(b.ev.orden,10)||0)-(parseInt(a.ev.orden,10)||0)));
      box.querySelector('.invmodal').innerHTML=
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'+
        '<h3 style="margin:0;color:#6D1233;font-weight:900">'+ICO.carpeta+' Invitaciones <span style="color:#b0a89f;font-weight:700;font-size:13px">('+_invData.length+')</span></h3>'+
        '<button style="background:#F56770;color:#fff;border:0;border-radius:20px;padding:8px 15px;font-weight:800;font-family:Nunito;cursor:pointer" onclick="location.href=\'admin.html\'">＋ Nueva invitación</button></div>'+
        '<input id="invfiltro" placeholder="Filtrar por pareja, página, orden…" oninput="filtrarInv()" style="width:100%;padding:11px 12px;border:1px solid #e7ddd3;border-radius:10px;font-family:Nunito;font-size:14px;margin-bottom:12px" autofocus>'+
        '<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="text-align:left;color:#9a8f88;border-bottom:2px solid #efe7de">'+
        '<th style="padding:8px 6px">Evento</th><th style="padding:8px 6px">N° Orden</th><th style="padding:8px 6px">Página</th><th style="padding:8px 6px">Fecha</th><th style="padding:8px 6px">Armó</th><th style="padding:8px 6px;text-align:right">Acciones</th>'+
        '</tr></thead><tbody id="invrows"></tbody></table></div>'+
        '<div style="margin-top:14px;text-align:right"><button style="background:#efe7de;color:#49111A;border:0;border-radius:20px;padding:8px 16px;font-family:Nunito;font-weight:700;cursor:pointer" onclick="document.getElementById(\'invbox\').remove()">Cerrar</button></div>';
      pintarFilasInv(_invData);
    }catch(e){console.error(e);box.querySelector('.invmodal').innerHTML='<p style="color:#F56770">Error: '+(e.message||e)+'</p>';}
  }
  function filtrarInv(){const q=(el('invfiltro').value||'').toLowerCase();
    pintarFilasInv(_invData.filter(r=>((r.ev.n1||'')+' '+(r.ev.n2||'')+' '+(r.ev.slug||'')+' '+(r.ev.orden||'')+' '+(r.ev.tpl||'')+' '+quien(r.ev.slug)).toLowerCase().includes(q)));}
  let _autores={};
  /* Del mail sale el nombre: littlemomentsok@ es Maki, info@invitameok es Jazmín.
     Si mañana entra alguien más, se agrega acá y listo. */
  function quien(slug){
    const a=_autores[slug]; if(!a) return '—';
    const nombre=function(mail){
      const m=String(mail||'').toLowerCase();
      if(!m) return '';
      if(m.indexOf('littlemoments')===0) return 'Maki';
      if(m.indexOf('info@invitameok')===0) return 'Jazmín';
      return m.split('@')[0];
    };
    const c=nombre(a.creo), g=nombre(a.guardo);
    if(!c && !g) return '—';
    if(!c || c===g) return g||c;
    return c+'<div style="font-size:10px;color:#b0a89f">últ.: '+g+'</div>';
  }
  function pintarFilasInv(rows){
    const fmt=f=>{const d=new Date(f);return isNaN(d)?'—':(String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear());};
    const A='style="background:none;border:0;cursor:pointer;font-size:16px;padding:3px 5px" ';
    el('invrows').innerHTML=rows.map(r=>{const ev=r.ev,s=ev.slug,nom=(ev.n1||'')+(ev.n2?' & '+ev.n2:'');
      return '<tr style="border-bottom:1px solid #f1eae2">'+
        '<td style="padding:9px 6px;color:#6D1233;font-weight:700">'+(ev.nEvento||'—')+'</td>'+
        '<td style="padding:9px 6px">'+(ev.orden||'—')+'</td>'+
        '<td style="padding:9px 6px"><b>'+(nom||'—')+'</b><div style="font-size:11px;color:#b0a89f">'+s+' · '+r.inv+' inv · '+r.pp+' pases</div></td>'+
        '<td style="padding:9px 6px;color:#7d756c">'+fmt(ev.fecha)+'</td>'+
        '<td style="padding:9px 6px;color:#7d756c;font-size:12px">'+quien(s)+'</td>'+
        '<td style="padding:9px 6px;text-align:right;white-space:nowrap">'+
          '<button '+A+'title="Ver invitación (nueva ventana)" onclick="window.open(\'/i/?e='+encodeURIComponent(s)+'\',\'_blank\')">'+ICO.ojo+'</button>'+
          '<button '+A+'title="Editar invitación" onclick="location.href=\'admin.html?e='+encodeURIComponent(s)+'\'">'+ICO.lapiz+'</button>'+
          '<button '+A+'title="Invitados y mesas" onclick="location.href=\'admin.html?e='+encodeURIComponent(s)+'&tab=INVITADOS\'">'+ICO.carpeta+'</button>'+
          '<button '+A+'title="Clonar" onclick="clonarInv(\''+s+'\')">'+ICO.copiar+'</button>'+
        '</td></tr>';
    }).join('')||'<tr><td colspan="5" style="padding:16px;color:#9a8f88">Sin resultados.</td></tr>';
  }
  // ===== Config de permisos de borrado =====
  // Maki (dueño): puede borrar directo. Jazmin: solo PIDE, Maki aprueba en su panel.
  const OWNER=['littlemomentsok@gmail.com'];
  const PUEDE_PEDIR=['info@invitameok.com']; // mail de Jazmin (la única que puede PEDIR borrado)
  function miMail(){ try{return ((window.INV&&INV.user&&INV.user.email)||'').toLowerCase();}catch(_e){return '';} }

  async function limpiarVencidas(){
    if(!window.INV||!window.INV.ok){alert('Todavía no se conectó la base. Esperá 2 segundos.');return;}
    const yo=miMail();
    const soyOwner=OWNER.map(x=>x.toLowerCase()).includes(yo);
    const puedePedir=PUEDE_PEDIR.map(x=>x.toLowerCase()).includes(yo);
    if(!soyOwner && !puedePedir){
      alert('No tenés permiso para borrar invitaciones.\n\nEste botón es solo para Jazmin (que lo pide) y para Maki (que lo aprueba).');
      return;
    }
    try{
      const {collection,getDocs,deleteDoc,doc,query,where,addDoc,serverTimestamp}=await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap=await getDocs(collection(window.INV.db,'inv_eventos'));
      const ahora=Date.now(), venc=[];
      snap.forEach(d=>{ const ev=d.data(); if(ev.sinVencimiento||!ev.fecha)return; const f=new Date(ev.fecha); if(isNaN(f))return; const dias=(typeof ev.diasVigencia==='number'&&ev.diasVigencia>0)?ev.diasVigencia:90; if(ahora>(f.getTime()+dias*86400000)) venc.push({id:d.id, nombre:((ev.n1||'')+(ev.n2?' & '+ev.n2:''))||d.id, fecha:(ev.fecha||'').slice(0,10)}); });
      if(!venc.length){ alert('No hay invitaciones vencidas. Todo al día.'); return; }
      const lista=venc.slice(0,25).map(v=>'• '+v.nombre+'  ('+v.fecha+')').join('\n');

      // --- Jazmin: NO borra, crea un PEDIDO para que Maki apruebe ---
      if(!soyOwner){
        if(!confirm('Hay '+venc.length+' invitación(es) vencida(s):\n\n'+lista+(venc.length>25?'\n…y más':'')+'\n\n¿Le pido a Maki que las borre?\n(No se borra nada hasta que él dé el OK desde su panel.)'))return;
        await addDoc(collection(window.INV.db,'inv_pedidos'),{
          tipo:'vencidas', estado:'pendiente',
          solicitante:yo, creado:serverTimestamp(), creadoMs:Date.now(),
          detalle:venc.length+' vencida(s)'
        });
        alert('¡Listo! Le avisé a Maki.\n\nCuando él dé el OK desde su panel, se borran las '+venc.length+' invitación(es) vencidas. Vos no tenés que hacer nada más.');
        return;
      }

      // --- Maki (dueño): borra directo ---
      if(!confirm('Hay '+venc.length+' invitación(es) vencida(s) (+90 días de la fecha):\n\n'+lista+(venc.length>25?'\n…y más':'')+'\n\n¿Borrarlas de la base? Se elimina el evento y sus invitados.\n(Las fotos en Cloudinary quedan; eso se limpia aparte.)'))return;
      let bEv=0,bG=0;
      for(const v of venc){
        try{ const gs=await getDocs(query(collection(window.INV.db,'inv_invitados'), where('slug','==',v.id))); for(const g of gs.docs){ await deleteDoc(doc(window.INV.db,'inv_invitados',g.id)); bG++; } }catch(_e){}
        await deleteDoc(doc(window.INV.db,'inv_eventos',v.id)); bEv++;
      }
      alert('Listo. Borré '+bEv+' invitación(es) y '+bG+' invitado(s) vencidos.\n\nLa base quedó más liviana.');
    }catch(e){ alert('No se pudo limpiar: '+(e.message||e)); }
  }
  function abrirEscaner(){
    const s=(D.slug||'').trim();
    // Abre el control de acceso. Si hay evento cargado, ya lo pasa por el link.
    window.open('scan.html'+(s?('?e='+encodeURIComponent(s)):''), '_blank');
  }
  async function duplicarActual(){
    if(!window.INV||!window.INV.ok){alert('Todavía no se conectó la base. Esperá 2 segundos.');return;}
    const base=(D.slug||'').trim();
    if(!base){alert("Primero poné la 'Dirección del evento' de esta invitación.");return;}
    const nuevo=prompt('Duplicar esta invitación.\n\nEscribí la dirección (link) de la NUEVA pareja\n(minúsculas, sin espacios, ej: sofia-y-mateo):', base+'-copia');
    if(!nuevo)return;
    const ns=nuevo.toLowerCase().replace(/[^a-z0-9-]+/g,'-');
    try{
      const existe=await INV.getEvento(ns);
      if(existe && !confirm('Ya existe una invitación en "'+ns+'". ¿La querés sobrescribir?')) return;
      const {invitados, ...cfg}=D;
      let nEvento; try{ const _all=await INV.exportAll(); const _mx=_all.eventos.reduce((m,e)=>Math.max(m,parseInt(e.nEvento,10)||0),0); nEvento=_mx+1; }catch(_e){ nEvento=(parseInt(D.nEvento,10)||1)+1; }
      /* ⚠️ LOS NÚMEROS DE SEGUIMIENTO NO SE COPIAN. El nº de evento y el nº de
         orden identifican UNA venta: si la copia se los lleva, quedan dos
         invitaciones con el mismo número y el seguimiento deja de servir.
         Ya pasó: hay pares con el mismo nº (Juliana/…-copia, Caro/…-copia).
         Y `ver` tampoco: la copia es nueva, se publica con el motor de hoy. */
      delete cfg.orden; delete cfg.ver;
      const _pv={}; (INV.CAMPOS_PRIVADOS||[]).forEach(k=>{ if(cfg[k]!==undefined){ _pv[k]=cfg[k]; delete cfg[k]; } });
      await INV.saveEvento(ns,{...cfg, slug:ns, nEvento, tpl:(D.tpl||'')+' (copia)'});
      if(Object.keys(_pv).length) await INV.savePrivado(ns, _pv);
      alert('¡Listo! Se creó la copia en "'+ns+'".\n\nAhora la vas a abrir para cambiarle los nombres, la fecha y las fotos. Los invitados NO se copian (cada pareja tiene los suyos).');
      location.href='admin.html?e='+encodeURIComponent(ns);
    }catch(e){alert('No se pudo duplicar: '+(e.message||e));}
  }
  async function clonarInv(slug){
    const nuevo=prompt('Dirección de la copia (minúsculas, sin espacios):', slug+'-copia'); if(!nuevo)return;
    const ns=nuevo.toLowerCase().replace(/[^a-z0-9-]+/g,'-');
    try{const ev=await INV.getEvento(slug); if(!ev){alert('No encontré el evento');return;}
      const _c={...ev}; const _pv2={};
      (INV.CAMPOS_PRIVADOS||[]).forEach(k=>{ if(_c[k]!==undefined){ _pv2[k]=_c[k]; delete _c[k]; } });
      /* ⚠️ Mismo cuidado que en "Duplicar": el nº de evento, el nº de orden y la
         versión del motor son de la venta original, no de la copia. Este botón
         se los llevaba: por eso hay invitaciones distintas con el mismo número. */
      let _nEv; try{ const _a=await INV.exportAll(); _nEv=_a.eventos.reduce((m,e)=>Math.max(m,parseInt(e.nEvento,10)||0),0)+1; }catch(_e){ _nEv=(parseInt(ev.nEvento,10)||1)+1; }
      delete _c.orden; delete _c.ver;
      await INV.saveEvento(ns,{..._c,slug:ns,nEvento:_nEv,tpl:(ev.tpl||'')+' (copia)'});
      if(Object.keys(_pv2).length) await INV.savePrivado(ns, _pv2);
      alert('Clonada como '+ns); verInvitaciones();
    }catch(e){alert('No se pudo clonar: '+(e.message||e));}
  }
  async function backup(){
    if(!window.INV||!INV.exportAll){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    try{
      const data=await INV.exportAll();
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);
      a.download='backup-invitame-'+new Date().toISOString().slice(0,10)+'.json';a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),3000);
    }catch(e){console.error(e);alert('No se pudo exportar: '+(e.message||e));}
  }

  // ==== RESTAURAR un backup ====
  // Es el boton mas peligroso del sistema: escribe encima de datos de clientes reales.
  // Por eso pide el archivo, MUESTRA que va a pasar antes de tocar nada, obliga a
  // escribir la palabra RESTAURAR, y se baja sola una copia de seguridad previa.
  async function restaurar(){
    if(!window.INV || !INV.importAll){ alert('Todavia no cargo la base. Espera 2 segundos.'); return; }
    const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json,.json';
    inp.onchange=async ()=>{
      const f=inp.files && inp.files[0]; if(!f) return;
      let data;
      try{ data=JSON.parse(await f.text()); }
      catch(e){ alert('Ese archivo no se puede leer. Tiene que ser el .json que baja el boton Backup.'); return; }
      const chk=INV.revisarBackup(data);
      if(!chk.ok){ alert('No puedo usar ese archivo:\n\n'+chk.error); return; }

      let sim;
      try{ sim=await INV.importAll(data,{simular:true}); }
      catch(e){ alert('No pude revisar el backup: '+(e.message||e)); return; }

      const msg='COPIA DEL '+String(chk.fecha).slice(0,10)+'\n\n'+
        'Tiene '+chk.eventos+' invitaciones y '+chk.invitados+' invitados.\n\n'+
        'Si restauras:\n'+
        '  • '+sim.eventosNuevos+' invitaciones se van a CREAR\n'+
        '  • '+sim.eventosPisados+' invitaciones se van a PISAR con la version del backup\n'+
        '  • '+sim.invitadosNuevos+' invitados se van a CREAR\n'+
        '  • '+sim.invitadosPisados+' invitados se van a PISAR\n\n'+
        'Lo que NO se toca: las confirmaciones de asistencia y los ingresos por la puerta\n'+
        'que pasaron despues de esta copia. Eso siempre gana.\n\n'+
        'Antes de empezar se baja sola una copia de como esta TODO ahora, por las dudas.\n\n'+
        'Escribi RESTAURAR para confirmar:';
      const conf=prompt(msg,'');
      if(String(conf||'').trim().toUpperCase()!=='RESTAURAR'){ alert('Cancelado. No se toco nada.'); return; }

      try{ await backup(); }catch(e){ if(!confirm('No pude bajar la copia previa. Restauro igual?')) return; }

      const btn=document.querySelector('[onclick="restaurar()"]'); const txt=btn?btn.textContent:'';
      if(btn){ btn.textContent='Restaurando...'; btn.disabled=true; }
      try{
        const r=await INV.importAll(data,{});
        let res='Listo.\n\n'+
          'Invitaciones: '+r.eventosNuevos+' creadas, '+r.eventosPisados+' actualizadas\n'+
          'Invitados: '+r.invitadosNuevos+' creados, '+r.invitadosPisados+' actualizados';
        if(r.rsvpProtegidos) res+='\n\nSe protegieron '+r.rsvpProtegidos+' confirmaciones mas nuevas que el backup (no se pisaron).';
        if(r.errores.length) res+='\n\nHubo '+r.errores.length+' errores:\n'+r.errores.slice(0,5).join('\n');
        alert(res);
        location.reload();
      }catch(e){ console.error(e); alert('Fallo la restauracion: '+(e.message||e)+'\n\nLa copia previa quedo bajada en tu compu.'); }
      finally{ if(btn){ btn.textContent=txt; btn.disabled=false; } }
    };
    inp.click();
  }
  window.restaurar=restaurar;
  // ==== SOLICITUDES (autoservicio: lo que cargan los clientes) ====
  function _esc(s){return String(s==null?'':s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));}
  async function actualizarBadgeSolic(){ try{ if(!window.solicListar)return; const l=await window.solicListar(); const b=el('solic-badge'); if(b){ if(l.length){b.textContent=l.length;b.style.display='';}else{b.style.display='none';} } }catch(e){} }
  window.actualizarBadgeSolic=actualizarBadgeSolic;
  async function verSolicitudes(){
    if(!window.solicListar){alert('Todavía no cargó la base. Esperá 2 segundos.');return;}
    let box=el('solicbox'); if(!box){box=document.createElement('div');box.id='solicbox';box.style.cssText='position:fixed;inset:0;background:rgba(73,17,26,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:26px 18px;overflow:auto';document.body.appendChild(box);}
    box.innerHTML='<div class="invmodal" style="background:#fff;max-width:760px;width:100%;border-radius:14px;padding:20px;font-family:Nunito,sans-serif"><div style="color:#9a8f88">Cargando…</div></div>';
    try{
      const list=await window.solicListar(); window._solicCache=list;
      const rows=list.map((s,i)=>{
        const fecha=s.fecha?new Date(s.fecha):null; const fstr=(fecha&&!isNaN(fecha))?fecha.toLocaleDateString('es'):'—';
        const obs=s.observaciones?('<div style="background:#fff6e9;border-left:3px solid #c98a2e;border-radius:8px;padding:7px 10px;margin-top:7px;font-size:12.5px">'+ICO.papel+' <b>Pedido especial:</b> '+_esc(s.observaciones)+'</div>'):'';
        const extra=[s.dress?(ICO.percha+' '+s.dress):'',s.regalos?(ICO.regalo+' '+s.regalos):''].filter(Boolean).join(' · ');
        return '<div style="border:1px solid #eee2d8;border-radius:12px;padding:12px;margin-bottom:10px">'+
          '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">'+
            '<div style="min-width:0"><b style="color:#6D1233;font-size:16px">'+_esc((s.n1||'')+(s.n2?' & '+s.n2:''))+'</b>'+
              '<div style="font-size:12px;color:#9a8f88">'+(s.tipoEvento?'<b style="color:#6D1233">'+_esc(s.tipoEvento)+'</b> · ':'')+_esc(s.tplNombre||s.tpl||'')+' · '+fstr+' · '+((s.invitados||[]).length)+' invitados</div>'+
              '<div style="font-size:12px;color:#7d756c;margin-top:2px">'+ICO.telefono+' '+_esc(s.contactoNombre||'—')+' · '+_esc(s.contactoWsp||'')+(s.contactoEmail?' · '+ICO.sobre+' '+_esc(s.contactoEmail):'')+'</div>'+
              (extra?'<div style="font-size:12px;color:#7d756c;margin-top:2px">'+_esc(extra)+'</div>':'')+ obs +'</div>'+
            '<div style="white-space:nowrap;display:flex;flex-direction:column;gap:6px">'+
              '<button class="addbtn" onclick="cargarSolicitudIdx('+i+')">Cargar en el editor</button>'+
              '<button class="lnk" onclick="marcarResuelta(\''+s.id+'\')">Marcar resuelta</button>'+
            '</div>'+
          '</div></div>';
      }).join('')||'<div style="color:#9a8f88;padding:14px;text-align:center">No hay solicitudes pendientes.</div>';
      box.querySelector('.invmodal').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;color:#6D1233;font-weight:900">'+ICO.entrada+' Solicitudes de clientes <span style="color:#b0a89f;font-weight:700;font-size:13px">('+list.length+')</span></h3><button style="background:#efe7de;border:0;border-radius:20px;padding:8px 16px;font-family:Nunito;font-weight:700;cursor:pointer" onclick="document.getElementById(\'solicbox\').remove()">Cerrar</button></div>'+rows;
    }catch(e){console.error(e);box.querySelector('.invmodal').innerHTML='<p style="color:#F56770">Error: '+(e.message||e)+'</p>';}
  }
  /* ⚠️⚠️ EL MAPEO NO ESTÁ ACÁ. Vive en /solicitud-a-evento.js.  (8/9/2026)

     Es EL MISMO código que corre del lado del cliente cuando manda el
     formulario y la invitación se crea sola. Si estuviera duplicado, el día
     que alguien agregue un campo en un solo lado, el dato del cliente se
     perdería EN SILENCIO — el bug que más veces se pagó en esta plataforma.

     Acá quedó sólo lo que es del admin: repintar la pantalla y avisarle a
     Jazmín qué se cargó. */
  function cargarSolicitudIdx(i){ const s=(window._solicCache||[])[i]; if(!s)return;
    if(!window.SOLICITUD_A_EVENTO){
      alert('No cargó /solicitud-a-evento.js, así que no puedo traer los datos.\n\nRecargá la página y probá de nuevo.');
      return;
    }
    /* el tema sale afuera porque ponerlo repinta media pantalla, y eso es
       asunto del admin, no del mapeo */
    window.SOLICITUD_A_EVENTO.mapear(s, D, { tema:function(k){ if(TEMAS[k]) setTema(k); } });
    D._solicId=s.id;
    const bx=el('solicbox'); if(bx)bx.remove();
    go('PRINCIPAL'); render(); if(typeof renderPanel==='function')renderPanel();
    let extra=''; if(s.observaciones)extra+='\n\nPEDIDO ESPECIAL:\n'+s.observaciones; if(s.dress)extra+='\n\nDress code: '+s.dress; if(s.regalos)extra+='\n\nRegalos: '+s.regalos;
    alert('Cargué los datos de '+(s.n1||'')+(s.n2?' & '+s.n2:'')+'.\n\nRevisá, ajustá lo que haga falta y tocá "Guardar y publicar".'+extra+'\n\nCuando termines, volvé a Solicitudes y tocá "Marcar resuelta".');
  }
  async function marcarResuelta(id){ if(!confirm('¿Marcar esta solicitud como resuelta? Sale de la lista de pendientes.'))return; try{ await window.solicResolver(id); actualizarBadgeSolic(); verSolicitudes(); }catch(e){alert('No se pudo: '+(e.message||e));} }
  buildTabs();renderPanel();render();setInterval(updCount,1000);
  if(window.INV) cargarEvento(); else window.addEventListener('inv-ready',cargarEvento);
  {var _tb=new URLSearchParams(location.search).get('tab'); if(_tb&&ORDER.indexOf(_tb)>-1){go(_tb);}}
