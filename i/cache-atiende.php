<?php
/* ===== ¿EL CACHE DE FOTOS ESTÁ ATENDIENDO? (movido acá el 9/10/2026) =========
   Antes vivía adentro de i/index.php. Ahora la usan dos:
     · i/index.php   → decide si la invitación pide fotos y videos por el cache.
     · i/textura.php → decide lo mismo para las texturas de papel.
   Así, si el cache se cae, la invitación entera (texturas incluidas) vuelve
   sola a Cloudinary directo, sin perder calidad ni una sola imagen.
   Le pregunta al Worker con una foto de 8 px y guarda la respuesta 60 s:
   es una pregunta por minuto, no una por visita.
   ============================================================================ */
if (!function_exists('iv_cache_atiende')) {
function iv_cache_atiende() {
  $f = rtrim(sys_get_temp_dir(), '/') . '/invitame-cache-medios.txt';
  $h = @file_get_contents($f);
  if ($h !== false && preg_match('/^(\d+) (ok|no)$/', trim($h), $m) && (time() - (int)$m[1]) < 60) return $m[2] === 'ok';
  $ok = false;
  $u = 'https://galeria.littlemomentsok.workers.dev/res.cloudinary.com/oc8cgqt4/image/upload/w_8,q_1,f_jpg/invitame/x4q8skckyryvodav1iwe.webp';
  if (function_exists('curl_init')) {
    $c = curl_init($u);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 2, CURLOPT_CONNECTTIMEOUT => 2, CURLOPT_NOBODY => false]);
    curl_exec($c);
    $ok = ((int)curl_getinfo($c, CURLINFO_HTTP_CODE) === 200);
    curl_close($c);
  } else {
    $ctx = stream_context_create(['http' => ['timeout' => 2, 'ignore_errors' => true]]);
    @file_get_contents($u, false, $ctx);
    $ok = isset($http_response_header[0]) && strpos($http_response_header[0], ' 200') !== false;
  }
  @file_put_contents($f, time() . ' ' . ($ok ? 'ok' : 'no'));
  return $ok;
}
}
