<?php
/* ===== DIAGNÓSTICO EN UN APARATO REAL (3/10/2026) ==============================
   Maki: «en el iPad tarda 100 años y se traba después». En la nube no hay un
   iPad de verdad, y el simulador no se traba. Con `&diag=1` en el link, la
   invitación anota qué pasa (cuándo carga cada cosa, cuánto se traba la
   pantalla, errores, si Safari recargó la pestaña) y lo manda acá.
   POST  /diag.php            → guarda un renglón (JSON, máx 60 KB)
   GET   /diag.php?ver=<clave> → devuelve los últimos renglones
   No guarda datos personales: sólo medidas de la página.
   ============================================================================ */
$ARCH = rtrim(sys_get_temp_dir(), '/') . '/invitame-diag.log';
$CLAVE = 'ipad-3-10-k7q';
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $b = file_get_contents('php://input', false, null, 0, 60000);
  if ($b && json_decode($b) !== null) {
    if (@filesize($ARCH) > 3000000) @unlink($ARCH);
    file_put_contents($ARCH, date('c') . ' ' . str_replace("\n", ' ', $b) . "\n", FILE_APPEND | LOCK_EX);
  }
  http_response_code(204); exit;
}
if (($_GET['ver'] ?? '') !== $CLAVE) { http_response_code(404); exit; }
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
$l = @file($ARCH) ?: [];
echo implode('', array_slice($l, -(int)($_GET['n'] ?? 40)));
