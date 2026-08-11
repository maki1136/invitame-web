<?php
/**
 * Freno anti-abuso (rate limiting) compartido por los endpoints de Invitame.
 *
 * Por que existe: sin esto, cualquiera puede llamar 10.000 veces a pase-nuevo.php
 * (llenando la lista de invitados de basura y quemando la cuota de Firebase) o a
 * aviso-rsvp.php (bombardeando la casilla de los novios y agotando la cuota de
 * mails de TODA la plataforma, lo que puede hacer que suspendan la cuenta).
 *
 * Como funciona: guarda las marcas de tiempo de los ultimos intentos en un archivo
 * temporal del servidor, uno por clave. No necesita base de datos.
 */

function iv_limite($clave, $max, $ventana_seg) {
  $f = sys_get_temp_dir() . '/ivlim_' . hash('sha256', $clave);
  $ahora = time();
  $hits = array();
  if (is_readable($f)) {
    foreach (explode(',', (string)@file_get_contents($f)) as $t) {
      $t = (int)$t;
      if ($t > 0 && ($ahora - $t) < $ventana_seg) $hits[] = $t;
    }
  }
  if (count($hits) >= $max) return false;
  $hits[] = $ahora;
  @file_put_contents($f, implode(',', $hits), LOCK_EX);
  return true;
}

function iv_ip() {
  $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
  return preg_replace('/[^0-9a-fA-F:.]/', '', $ip);
}

/** Corta la ejecucion con 429 si se paso de la raya. */
function iv_frenar($reglas) {
  foreach ($reglas as $r) {
    if (!iv_limite($r[0], $r[1], $r[2])) {
      http_response_code(429);
      echo json_encode(array('ok' => false, 'error' => 'demasiados'));
      exit;
    }
  }
}
