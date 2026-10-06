<?php
/**
 * Invítame — EL CONTROL ANTI-ROBOTS DEL FORMULARIO DE PEDIDO (6/10/2026)
 *
 * Maki: «un control anti-robots en el formulario de pedido, para que no se
 * llene la cola de Jazmín de pedidos falsos».
 *
 * TRES CAPAS, de la más barata a la más fuerte:
 *   1. Campo trampa: un casillero invisible para las personas. Un programa que
 *      completa todo lo llena y queda marcado.
 *   2. Tiempo: nadie completa el formulario en menos de 4 segundos.
 *   3. Cloudflare Turnstile (el «no soy un robot» que casi nunca pregunta nada).
 *      ⚠️ Se PRENDE SOLO cuando existe el archivo `invitame-turnstile.php`
 *      FUERA de la carpeta pública, con las dos claves. Sin ese archivo, las
 *      capas 1 y 2 siguen andando y el formulario funciona igual que antes.
 *
 *   El archivo de claves (lo pega Maki, nunca va al repo, que es público):
 *     <?php
 *     $TURNSTILE_SITE   = '0x4AAAA...';   // la pública
 *     $TURNSTILE_SECRET = '0x4AAAA...';   // la secreta
 */

function iv_turnstile_cfg() {
  static $cfg = false;
  if ($cfg !== false) return $cfg;
  $cfg = null;
  $TURNSTILE_SITE = ''; $TURNSTILE_SECRET = '';
  $dir = __DIR__;
  for ($i = 0; $i < 6; $i++) {
    $ruta = $dir . '/invitame-turnstile.php';
    if (is_readable($ruta)) { include $ruta; break; }
    $padre = dirname($dir);
    if ($padre === $dir) break;
    $dir = $padre;
  }
  if ($TURNSTILE_SITE !== '' && $TURNSTILE_SECRET !== '') {
    $cfg = array('site' => $TURNSTILE_SITE, 'secret' => $TURNSTILE_SECRET);
  }
  return $cfg;
}

/** Devuelve '' si pasa, o el motivo si no pasa. */
function iv_anti_robot($in) {
  $ar = isset($in['antiRobot']) && is_array($in['antiRobot']) ? $in['antiRobot'] : array();
  if (trim((string)($ar['trampa'] ?? '')) !== '') return 'trampa';
  $seg = (float)($ar['segundos'] ?? 0);
  if ($seg > 0 && $seg < 4) return 'muy-rapido';

  $cfg = iv_turnstile_cfg();
  if (!$cfg) return '';
  $token = (string)($ar['turnstile'] ?? '');
  if ($token === '') return 'sin-turnstile';
  $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 10,
    CURLOPT_POSTFIELDS => http_build_query(array(
      'secret' => $cfg['secret'], 'response' => $token,
      'remoteip' => $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ($_SERVER['REMOTE_ADDR'] ?? ''),
    )),
  ));
  $r = curl_exec($ch); curl_close($ch);
  $j = json_decode((string)$r, true);
  /* Si Cloudflare no contesta, NO se le corta el pedido a una persona de verdad:
     el pedido entra igual y queda la marca para que Jazmín lo mire. */
  if (!is_array($j)) return '';
  return !empty($j['success']) ? '' : 'turnstile';
}
