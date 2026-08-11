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
const rndToken = () => Math.random().toString(36).slice(2, 8);

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
    const s = await getDoc(doc(db, EV, slug));
    return s.exists() ? s.data() : null;
  },

  // ---- Datos PRIVADOS del evento (no se leen sin login) ----
  // La clave del panel de los novios y el mail de confirmaciones NO pueden vivir en
  // inv_eventos: ese documento lo lee cualquiera que tenga el link de una invitacion
  // (basta con saber la direccion). Con la clave a la vista, un desconocido entraba al
  // panel de esos novios y hasta podia generar pases con QR. Van en inv_privado, que la
  // regla de Firestore solo deja leer con sesion iniciada.
  CAMPOS_PRIVADOS: ['c_clave-del-panel-de-los-novios', 'c_email-para-confirmaciones'],
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

window.INV = INV;
window.dispatchEvent(new CustomEvent("inv-ready", { detail: { ok: INV.ok, error: initError } }));
