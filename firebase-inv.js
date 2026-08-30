/* ============================================================
   INVITAME · Motor de datos (Firebase Firestore)
   Proyecto Firebase PROPIO y aislado de Invítame (invitame-9b51f).
   Separado del CRM y la web de Little Moments (little-moments-cms).
   TODO lo de invitaciones vive en colecciones con prefijo inv_
   para NO mezclarse con los datos de la web.

   Colecciones:
     inv_eventos/{slug}                -> config del evento (objeto del admin)
     inv_invitados/{slug__token}       -> cada invitado (nombre, pases, mesa, usos, rsvp)

   Uso: <script type="module" src="firebase-inv.js"></script>
        window.INV.ready.then(()=> ... usar INV.* ... )
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, runTransaction, serverTimestamp, deleteField
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Config pública del proyecto de Little Moments (la apiKey web NO es secreta).
// Si Maki pega el objeto completo desde la consola de Firebase, reemplazar acá.
const firebaseConfig = {
  apiKey: "AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc",
  authDomain: "invitame-9b51f.firebaseapp.com",
  projectId: "invitame-9b51f",
  storageBucket: "invitame-9b51f.firebasestorage.app",
  messagingSenderId: "1060290054006",
  appId: "1:1060290054006:web:938ea367197d2a6462dc57"
};

let db = null, auth = null, initError = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(()=>{}); // recordar sesión
}
catch (e) { initError = e; console.error("INV init error", e); }

const EV = "inv_eventos";
const GU = "inv_invitados";
const PV = "inv_privado";   // datos que NO puede ver un invitado
const gid = (slug, token) => slug + "__" + token;
// El token de un invitado es su QR de entrada Y la llave que abre su ficha.
// Math.random() NO es criptografico: viendo unos pocos tokens de una boda se pueden
// predecir los demas (entrar con un QR falso, o leer los datos de otro invitado).
// crypto.getRandomValues si lo es. 10 caracteres del alfabeto de abajo = ~50 bits.
const ABC_TOKEN = 'abcdefghijkmnpqrstuvwxyz23456789';   // sin l/o/0/1: se confunden al dictarlas
const rndToken = () => {
  const b = new Uint8Array(10);
  (self.crypto || window.crypto).getRandomValues(b);
  return Array.from(b, x => ABC_TOKEN[x % ABC_TOKEN.length]).join('');
};

const INV = {
  db,
  auth,
  ready: Promise.resolve(!initError),
  ok: !initError,

  // ---- Login del equipo (admin + escáner) ----
  login(email, pass) { return signInWithEmailAndPassword(auth, email, pass); },
  logout() { return signOut(auth); },
  onAuth(cb) { return onAuthStateChanged(auth, cb); },
  get user() { return auth ? auth.currentUser : null; },

  // ---- Evento (config del admin) ----
  async saveEvento(slug, data) {
    await setDoc(doc(db, EV, slug), { ...data, slug, updatedAt: serverTimestamp() }, { merge: true });
    return slug;
  },
  async getEvento(slug) {
    try {
      const s = await getDoc(doc(db, EV, slug));
      return s.exists() ? s.data() : null;
    } catch (e) {
      // Si el evento es PRIVADO, la regla de Firestore no deja leerlo sin la clave.
      // No es un error: hay que pedirlo por evento-privado.php. Se avisa con una
      // marca para que la invitacion sepa mostrar el candado en vez de una pagina vacia.
      const err = new Error('privado');
      err.privado = (String(e && e.code || '').indexOf('permission-denied') >= 0);
      err.original = e;
      throw err;
    }
  },
  // Pide el evento al servidor mandando la clave. El servidor compara contra
  // inv_privado (que tampoco se puede leer sin sesion) y recien ahi devuelve los datos.
  // Devuelve {ok:true, evento} o {ok:false, error:'clave'|'sin-clave'|...}.
  async getEventoConClave(slug, clave) {
    try {
      const r = await fetch('/evento-privado.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, clave })
      });
      const j = await r.json().catch(() => null);
      if (j && typeof j === 'object') return j;
      return { ok: false, error: 'respuesta' };
    } catch (e) { return { ok: false, error: 'red' }; }
  },

  // ---- Datos PRIVADOS del evento (no se leen sin login) ----
  // La clave del panel de los novios y el mail de confirmaciones NO pueden vivir en
  // inv_eventos: ese documento lo lee cualquiera que tenga el link de una invitacion
  // (basta con saber la direccion). Con la clave a la vista, un desconocido entraba al
  // panel de esos novios y hasta podia generar pases con QR. Van en inv_privado, que la
  // regla de Firestore solo deja leer con sesion iniciada.
  // 'c_contrasena-para-el-evento' se sumo el 2026-08-11: antes la clave de la
  // "invitacion privada" viajaba en el documento publico y la comparaba el navegador,
  // asi que el candado era decorativo. Ahora la clave vive aca y la verifica el servidor.
  CAMPOS_PRIVADOS: ['c_clave-del-panel-de-los-novios', 'c_email-para-confirmaciones', 'c_contrasena-para-el-evento'],
  async savePrivado(slug, data) {
    await setDoc(doc(db, PV, slug), { ...data, slug, updatedAt: serverTimestamp() }, { merge: true });
    return slug;
  },
  async getPrivado(slug) {
    try {
      const s = await getDoc(doc(db, PV, slug));
      return s.exists() ? s.data() : null;
    } catch (e) { return null; }   // sin login no se puede: no es un error, es la regla
  },
  // Borra del documento PUBLICO los campos privados que quedaron de antes de este cambio.
  async limpiarPrivadosDelPublico(slug) {
    const borrar = {};
    this.CAMPOS_PRIVADOS.forEach(k => { borrar[k] = deleteField(); });
    try { await updateDoc(doc(db, EV, slug), borrar); } catch (e) { /* si no existe, nada */ }
  },

  // ---- Invitados ----
  // arr = [{n, p, m, restriccion?, token?}]  -> escribe cada invitado, genera token si falta
  async saveInvitados(slug, arr) {
    const out = [];
    for (const g of arr) {
      const token = g.token || rndToken();
      const usosMax = parseInt(g.p, 10) || 1;
      const ref = doc(db, GU, gid(slug, token));

      // IMPORTANTE: si el invitado YA existe, no se pisan los datos que genera
      // la fiesta (ingresos por la puerta y confirmación de asistencia).
      // Antes, apretar "Guardar y publicar" durante el evento reseteaba `usos`
      // (todos podían volver a entrar) y borraba todos los RSVP.
      let previo = null;
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) previo = snap.data();
      } catch (e) { previo = null; }

      const payload = {
        slug, token,
        nombre: g.n || "",
        pases: usosMax,
        mesa: (g.m ?? "-") + "",
        restriccion: g.restriccion || "",
        usosMax,
        updatedAt: serverTimestamp()
      };

      // usos: lo que venga explícito > lo que ya había > los pases
      if (typeof g.usos === "number") payload.usos = g.usos;
      else if (previo && typeof previo.usos === "number") {
        // si le cambiaron la cantidad de pases, ajusto los usos restantes
        // por la diferencia, sin regalar ingresos ya consumidos.
        const usados = Math.max(0, (previo.usosMax || previo.pases || usosMax) - previo.usos);
        payload.usos = Math.max(0, usosMax - usados);
      } else payload.usos = usosMax;

      // rsvp: nunca se pisa una respuesta ya dada
      if (g.rsvp) payload.rsvp = g.rsvp;
      else if (!previo || !previo.rsvp) payload.rsvp = "pendiente";

      if (g.rsvpPersonas !== undefined && g.rsvpPersonas !== null) payload.rsvpPersonas = g.rsvpPersonas;
      else if (!previo) payload.rsvpPersonas = null;

      await setDoc(ref, payload, { merge: true });
      out.push({ ...(previo || {}), ...payload, link: token });
    }
    return out;
  },
  async getInvitado(slug, token) {
    const s = await getDoc(doc(db, GU, gid(slug, token)));
    return s.exists() ? s.data() : null;
  },
  async listInvitados(slug) {
    const q = query(collection(db, GU), where("slug", "==", slug));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },
  async delInvitado(slug, token) {
    // borrado lógico: se marca inactivo (nunca hard-delete)
    await updateDoc(doc(db, GU, gid(slug, token)), { activo: false, updatedAt: serverTimestamp() });
  },

  // ---- Confirmación (RSVP) desde la invitación ----
  async saveRSVP(slug, token, estado, personas, mensaje) {
    // El mensaje que deja el invitado se GUARDA en su ficha. Antes sólo viajaba al
    // aviso por mail (que está apagado), así que se perdía.
    const payload = {
      rsvp: estado, rsvpPersonas: personas ?? null, rsvpAt: serverTimestamp()
    };
    const m = (mensaje == null) ? '' : String(mensaje).slice(0, 500).trim();
    if (m) payload.rsvpMensaje = m;
    await updateDoc(doc(db, GU, gid(slug, token)), payload);
    return true;
  },

  // ---- Puerta: descuenta 1 uso de forma segura (anti-passback) ----
  async marcarUso(slug, token) {
    const ref = doc(db, GU, gid(slug, token));
    return await runTransaction(db, async (tx) => {
      const s = await tx.get(ref);
      if (!s.exists()) return { ok: false, motivo: "no-existe" };
      const d = s.data();
      if ((d.usos || 0) <= 0) return { ok: false, motivo: "sin-usos", data: d };
      tx.update(ref, { usos: d.usos - 1, ultimoIngreso: serverTimestamp() });
      return { ok: true, restantes: d.usos - 1, data: d };
    });
  },

  gid, rndToken,

  // ---- Subir imagen a Cloudinary (cuenta PROPIA de Invítame) ----
  CLOUD: { name: "oc8cgqt4", preset: "invitame_unsigned", folder: "invitame" },
  async uploadVideo(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", this.CLOUD.preset);
    fd.append("folder", this.CLOUD.folder);
    const r = await fetch("https://api.cloudinary.com/v1_1/" + this.CLOUD.name + "/video/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (j.secure_url) return j.secure_url;
    throw new Error((j.error && j.error.message) || "Falló la subida del video");
  },
  async uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", this.CLOUD.preset);
    fd.append("folder", this.CLOUD.folder);
    const r = await fetch("https://api.cloudinary.com/v1_1/" + this.CLOUD.name + "/image/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (j.secure_url) return j.secure_url;
    throw new Error((j.error && j.error.message) || "Falló la subida");
  }
};

// El backup (bajar TODA la base) solo tiene sentido en el admin. NO se expone en la
// invitacion publica (/i/): ahi no hace falta y no debe estar al alcance de un invitado.
if (!location.pathname.startsWith('/i/')) {
  INV.exportAll = async function(){
    const ev=(await getDocs(collection(db, EV))).docs.map(d=>({id:d.id, ...d.data()}));
    const gu=(await getDocs(collection(db, GU))).docs.map(d=>({id:d.id, ...d.data()}));
    return { exportedAt:new Date().toISOString(), eventos:ev, invitados:gu };
  };
}

// ---- RESTAURAR un backup ----
// Es la operacion mas peligrosa del sistema: escribe encima de los datos de clientes
// reales. Por eso: (1) valida la estructura antes de tocar nada, (2) sabe simular sin
// escribir, (3) escribe con merge (nunca borra lo que no esta en el backup), y
// (4) NO pisa un RSVP ni los usos ya consumidos en la puerta si el backup es mas viejo.
if (!location.pathname.startsWith('/i/')) {
  INV.revisarBackup = function (data) {
    if (!data || typeof data !== 'object') return { ok: false, error: 'El archivo no es un backup valido.' };
    const ev = Array.isArray(data.eventos) ? data.eventos : null;
    const gu = Array.isArray(data.invitados) ? data.invitados : null;
    if (!ev || !gu) return { ok: false, error: 'Al archivo le faltan las listas de eventos o invitados.' };
    const sinId = ev.filter(e => !e || !e.id).length + gu.filter(g => !g || !g.id).length;
    if (sinId) return { ok: false, error: 'Hay ' + sinId + ' registros sin identificador. El archivo esta danado.' };
    return { ok: true, eventos: ev.length, invitados: gu.length, fecha: data.exportedAt || '(sin fecha)' };
  };

  // simular:true -> no escribe nada, solo cuenta que pasaria.
  INV.importAll = async function (data, opciones) {
    const op = opciones || {};
    const chequeo = INV.revisarBackup(data);
    if (!chequeo.ok) throw new Error(chequeo.error);

    const r = { eventosNuevos: 0, eventosPisados: 0, invitadosNuevos: 0, invitadosPisados: 0, rsvpProtegidos: 0, errores: [] };

    for (const e of data.eventos) {
      const { id, ...campos } = e;
      const actual = await getDoc(doc(db, EV, id));
      if (actual.exists()) r.eventosPisados++; else r.eventosNuevos++;
      if (op.simular) continue;
      try { await setDoc(doc(db, EV, id), { ...campos, slug: id, restauradoAt: serverTimestamp() }, { merge: true }); }
      catch (err) { r.errores.push('evento ' + id + ': ' + (err.message || err)); }
    }

    for (const g of data.invitados) {
      const { id, ...campos } = g;
      const ref = doc(db, GU, id);
      const actual = await getDoc(ref);
      if (actual.exists()) r.invitadosPisados++; else r.invitadosNuevos++;
      if (op.simular) continue;
      const previo = actual.exists() ? actual.data() : null;
      // Lo que paso DESPUES del backup no se pisa: si el invitado ya confirmo o si ya
      // entro por la puerta, esos datos ganan. Restaurar no puede dejar entrar dos veces
      // a alguien ni borrar una confirmacion.
      if (previo) {
        if (previo.rsvp && previo.rsvp !== 'pendiente' && campos.rsvp !== previo.rsvp) {
          delete campos.rsvp; delete campos.rsvpPersonas; delete campos.rsvpMensaje; delete campos.rsvpAt;
          r.rsvpProtegidos++;
        }
        if (typeof previo.usos === 'number' && typeof campos.usos === 'number' && previo.usos < campos.usos) {
          delete campos.usos;
        }
      }
      try { await setDoc(ref, { ...campos, restauradoAt: serverTimestamp() }, { merge: true }); }
      catch (err) { r.errores.push('invitado ' + id + ': ' + (err.message || err)); }
    }
    return r;
  };
}

window.INV = INV;
window.dispatchEvent(new CustomEvent("inv-ready", { detail: { ok: INV.ok, error: initError } }));

/* ---- LOS MÓDULOS DE /efectos/, TAMBIÉN EN EL ADMIN --------------------------
   Por qué está acá y no en el HTML del admin:

   La invitación (/i/) y el admin de la ZONA DE PRUEBA (/prueba/admin.html)
   cargan `sobres/catalogo.js`, que a su vez carga `efectos/index.js`. El admin
   de PRODUCCIÓN (/admin.html) no lo carga — y por eso los bloques del panel
   (paletas, botones, el fondo) existían en el repo, andaban en la zona de
   prueba, y en el panel de verdad no aparecían. Se descubrió mirando qué
   scripts tiene cada página: producción tenía dos, la de prueba tres.

   Agregar una línea al HTML sería lo natural, pero admin.html pesa 144 KB y
   sólo se sube a mano. Este archivo, en cambio, lo cargan las dos versiones del
   admin. Enganchándolo acá, los dos paneles quedan iguales y las mejoras
   nuevas siguen sin obligar a tocar los HTML grandes.

   ⚠️ SÓLO donde hay formulario de edición. Este archivo también lo cargan el
      panel de control (/panel.html) y el escáner de la puerta, y ahí los
      módulos no pintan nada: se pide `.mejoras`, que es el bloque de edición y
      existe únicamente en los dos admin. Y nunca en /i/, que ya los carga por
      su cuenta: cargarlos dos veces duplicaría los bloques.
   -------------------------------------------------------------------------- */
if (!location.pathname.startsWith('/i/')
    && document.querySelector('.mejoras')
    && !document.querySelector('script[src*="efectos/index.js"], script[src*="catalogo.js"]')) {
  const s = document.createElement('script');
  s.src = '/efectos/index.js';
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
}
