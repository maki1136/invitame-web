<?php
/**
 * Invitame — EL CARTEL DE «ESTA INVITACIÓN ES PERSONAL» (30/10/2026).
 * Lo muestra `i/index.php` cuando la invitación tiene prendido «Bloquear acceso
 * a la invitación a personas sin pase» y quien entra no trae un pase válido.
 * Sin ningún dato de la fiesta. Español de México. No se indexa.
 */
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Robots-Tag: noindex, nofollow');
?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Invitación personal</title>
<style>
  html,body{margin:0;height:100%;background:#f7f1ea;color:#3b2a2a;font-family:Georgia,'Times New Roman',serif}
  .c{min-height:100%;display:flex;align-items:center;justify-content:center;padding:28px;box-sizing:border-box;text-align:center}
  .b{max-width:380px}
  .i{font-size:44px;margin-bottom:12px}
  h1{font-weight:400;font-size:26px;margin:0 0 12px;letter-spacing:.02em}
  p{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#6b5656;margin:0}
</style>
</head>
<body><div class="c"><div class="b">
  <div class="i">💌</div>
  <h1>Esta invitación es personal</h1>
  <p>Para verla necesitas el link que te enviaron los anfitriones. Si crees que es un error, pídeles que te lo vuelvan a mandar.</p>
</div></div></body></html>
