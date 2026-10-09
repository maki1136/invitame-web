<?php
/* ===== LAS TEXTURAS DE PAPEL, POR EL CACHE (9/10/2026) =======================
   Maki: «si no tocan velocidad ni calidad, hacelo».

   La invitación pide las texturas por nombre (/i/tex-lino.jpg, /i/cielo.jpg…).
   Hasta hoy i/.htaccess las mandaba SIEMPRE a Cloudinary directo: eran lo único
   de la invitación que no pasaba por el cache (medido el 8/10 en camila-y-tomas:
   5 pedidos, 0,11 MB por visita; con 1000 invitaciones activas ≈ 15 créditos
   por mes que no hacía falta gastar).

   Ahora i/.htaccess las manda acá (por dentro, sin un salto más) y esto decide:
     · cache atendiendo  → el MISMO archivo, con la MISMA receta, por el Worker.
     · cache caído       → Cloudinary directo, como antes.
   La decisión es la misma que usa la invitación (i/cache-atiende.php), así que
   nunca queda la mitad de la página por un camino y la mitad por el otro.

   ⚠️ La receta (f_auto,q_auto:good,w_1200,c_limit) NO se toca: es la misma que
      tenían. El Worker guarda una copia por formato (AVIF/WebP/JPG), así que
      cada teléfono recibe exactamente lo que recibía antes.
   ⚠️ 302 y no 301, igual que antes: un 301 se queda pegado al navegador para
      siempre y, si el cache se cae, ese teléfono no volvería a preguntar.
   ⚠️ Apagado de emergencia: la variable MEDIA_CACHE = 'no' del Worker lo manda
      todo a Cloudinary (ver worker/galeria-worker.js).
   ============================================================================ */
require_once __DIR__ . '/cache-atiende.php';

$R = 'f_auto,q_auto:good,w_1200,c_limit/';
$MAPA = [
  'tex-papel.jpg'    => $R . 'v1788574616/invitame/jfyn8cn9kpb7znufq3k9.jpg',
  'tex-lino.jpg'     => $R . 'v1788574616/invitame/npxvsup6bsq4u2kg8ajp.jpg',
  'tex-kraft.jpg'    => $R . 'v1788574617/invitame/zqnxomgyktcreaytwckr.jpg',
  'tex-marmol.jpg'   => $R . 'v1788574618/invitame/y4tyqoqjiqcjcia3nbep.jpg',
  'tex-acuarela.jpg' => $R . 'v1788574618/invitame/j7qd6s85tgsg7md467nv.jpg',
  'textura.jpg'      => $R . 'v1788574616/invitame/jfyn8cn9kpb7znufq3k9.jpg',  /* respaldo de var(--tex): el papel liso */
  'nube.png'         => $R . 'v1788575006/invitame/atx4qqjpj7updy8ajef4.png',
  'cielo.jpg'        => $R . 'v1788575007/invitame/rip8ks6ikk4krp7o6ke0.jpg',
  'sello-marfil.png' => $R . 'v1788575008/invitame/r3v04rzv5gq9gfqaznom.png',
];

$n = isset($_GET['n']) ? (string)$_GET['n'] : '';
if (!isset($MAPA[$n])) { http_response_code(404); header('Cache-Control: no-store'); exit; }

$base = iv_cache_atiende()
  ? 'https://galeria.littlemomentsok.workers.dev/res.cloudinary.com/oc8cgqt4/image/upload/'
  : 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
header('Cache-Control: no-store');
header('Location: ' . $base . $MAPA[$n], true, 302);
