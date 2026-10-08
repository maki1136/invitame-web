/* =====================================================================
   CRM Invítame — puente PRIVADO de las planillas de Finanzas (8/10/2026)
   ---------------------------------------------------------------------
   Vive en script.google.com, en la cuenta de Maki (littlemomentsok@gmail.com).
   Cada hora lee las 4 planillas COMO MAKI (no hace falta que estén
   publicadas ni abiertas con link) y guarda el CSV de cada una en
   Firestore: crm_finanzas/{A,S,R,C}. El CRM lo lee de ahí, y la regla
   de Firestore deja leerlo sólo a littlemomentsok@gmail.com.
   No hay claves en ningún lado: usa el permiso de Maki.

   Instalar: correr instalar() una vez (pide permisos) y listo.
   ===================================================================== */
var PROYECTO = 'invitame-9b51f';
var FUENTES = {
  A: { id: '1OJLT46k4pJrCzG8fG6Qekk5drsfxwkAnIciIzNwiuos', gid: null },        // INVITAME DASHBOARD OFICIAL
  S: { id: '1ri_gl6zHuFw8v0I9SxSWGkNW5edxlKeiXilsRyOoZv4', gid: null },        // SEGUIMIENTO 2026 (1ra pestaña)
  R: { id: '1Npxu0sQKZFOb8GMDgKJ7WF9ni-GMT8jz31HLEPw5qeI', gid: 536069291 },   // RENDIMIENTO WEB
  C: { id: '1rb4pxTA9f3DyvjxQHaH9H-9WWlFT2chA45Zxk-xSH6U', gid: 0 }            // DEUDORES INVITAME
};

function bajarCsv_(f) {
  var u = 'https://docs.google.com/spreadsheets/d/' + f.id + '/export?format=csv' + (f.gid === null ? '' : '&gid=' + f.gid);
  var r = UrlFetchApp.fetch(u, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('planilla ' + f.id + ' -> ' + r.getResponseCode());
  return r.getContentText('UTF-8');
}

function guardar_(clave, csv) {
  var u = 'https://firestore.googleapis.com/v1/projects/' + PROYECTO + '/databases/(default)/documents/crm_finanzas/' + clave;
  var cuerpo = { fields: { csv: { stringValue: csv }, actualizado: { timestampValue: new Date().toISOString() } } };
  var r = UrlFetchApp.fetch(u, {
    method: 'patch', contentType: 'application/json', payload: JSON.stringify(cuerpo), muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Goog-User-Project': PROYECTO }
  });
  if (r.getResponseCode() !== 200) throw new Error('firestore ' + clave + ' -> ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 300));
}

/* Lo que corre cada hora. */
function actualizarFinanzas() {
  var hecho = [];
  Object.keys(FUENTES).forEach(function (k) {
    var t = bajarCsv_(FUENTES[k]);
    guardar_(k, t);
    hecho.push(k + ':' + t.length);
  });
  Logger.log('Finanzas actualizadas ' + hecho.join(' '));
  return hecho.join(' ');
}

/* Una sola vez: corre la primera copia y deja la tarea de cada hora. */
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'actualizarFinanzas') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('actualizarFinanzas').timeBased().everyHours(1).create();
  return actualizarFinanzas();
}
