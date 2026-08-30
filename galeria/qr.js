/* ============================================================
   EL QR, DIBUJADO ACÁ ADENTRO
   ============================================================
   Antes la galería pedía el QR a api.qrserver.com. Eso tenía dos
   problemas: si ese servicio se caía el cartel salía sin código,
   y —peor— la URL de CADA galería viajaba a un tercero.

   Las invitaciones nunca hicieron eso: usan qrcodejs y dibujan el
   código en el propio navegador. Este módulo hace lo mismo para la
   galería, con la misma librería, así hay un solo sistema.

   Si por lo que sea la librería no carga, cae en el /qr del Worker.
   Un cartel con un QR de repuesto es mejor que un cartel sin QR.

   Uso:
     import { dibujarQR } from './qr.js';
     await dibujarQR(caja, 'https://…', 900);
   ============================================================ */

const LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
const WORKER = 'https://galeria.littlemomentsok.workers.dev';

let cargando = null;

function cargarLib() {
  if (window.QRCode) return Promise.resolve(true);
  if (cargando) return cargando;
  cargando = new Promise((listo) => {
    const s = document.createElement('script');
    s.src = LIB;
    s.onload = () => listo(!!window.QRCode);
    s.onerror = () => listo(false);
    document.head.appendChild(s);
    /* Si la red está muy lenta no dejamos la página esperando para siempre. */
    setTimeout(() => listo(!!window.QRCode), 6000);
  });
  return cargando;
}

/**
 * Dibuja el QR adentro de `caja`. Devuelve 'propio' si lo dibujó acá,
 * o 'repuesto' si tuvo que caer en el Worker.
 *
 * @param {HTMLElement} caja   dónde va
 * @param {string} texto       lo que codifica (la URL de la galería)
 * @param {number} px          lado en píxeles. Para imprimir, grande: 900.
 * @param {string} gid         opcional, para el repuesto del Worker
 */
export async function dibujarQR(caja, texto, px, gid) {
  const lado = px || 600;
  caja.textContent = '';

  const hay = await cargarLib();

  if (hay) {
    try {
      /* correctLevel H aguanta que el papel se manche o se doble:
         se puede leer con hasta un 30% del código tapado. En una mesa
         de fiesta eso pasa. */
      new window.QRCode(caja, {
        text: texto,
        width: lado,
        height: lado,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
      });
      /* qrcodejs deja un canvas y a veces también un img: que ocupen
         todo el lugar que les da el CSS de la página. */
      caja.querySelectorAll('canvas,img').forEach((e) => {
        e.style.width = '100%';
        e.style.height = '100%';
        e.style.display = 'block';
      });
      if (caja.querySelector('canvas,img')) return 'propio';
    } catch (e) { /* cae al repuesto */ }
  }

  const img = document.createElement('img');
  img.src = WORKER + '/qr?g=' + encodeURIComponent(gid || '');
  img.alt = 'Código QR para subir las fotos';
  img.style.cssText = 'width:100%;height:100%;display:block';
  caja.textContent = '';
  caja.appendChild(img);
  return 'repuesto';
}
