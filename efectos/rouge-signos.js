/* ===== «¡» Y «¿» BIEN EN LA LETRA ROUGE SCRIPT (26/10/2026) ====================
   Jazmín, bautizo de Olivia: «signo de pregunta en vez de admiración», «abajo
   ?Quieres la tuya?». No era un error de tipeo: el texto está bien escrito. La
   letra Rouge Script (la cursiva del motor, en «¡Gracias!» y «¿Quieres la
   tuya?») trae mal dibujados esos dos signos: su «¡» parece «¿» y su «¿» parece
   «?». Se probaron otras 19 cursivas (Great Vibes, Allura, Pinyon…): todas bien.
   ARREGLO: se le suma a la familia «Rouge Script» una cara con SÓLO esos dos
   signos (unicode-range U+A1, U+BF), tomados de Great Vibes, que es del mismo
   estilo. El navegador usa esa cara para «¡» y «¿» y Rouge Script para el resto.
   Vale para todas las invitaciones y para la miniatura del panel.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invRougeSignos) return; window.__invRougeSignos = 1;
  var st = document.createElement('style');
  st.id = 'inv-rouge-signos';
  st.textContent = "@font-face{font-family:'Rouge Script';font-style:normal;font-weight:400;font-display:swap;" +
    "src:url(https://fonts.gstatic.com/s/greatvibes/v21/RWmMoKWR9v4ksMfaWd_JN9XFiaQoDmlr.woff2) format('woff2');" +
    "unicode-range:U+00A1,U+00BF}";
  (document.head || document.documentElement).appendChild(st);
})();
