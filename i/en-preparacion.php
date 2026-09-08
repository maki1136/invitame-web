<?php
/**
 * Invitame — EL CARTEL DE «TODAVÍA NO».
 *
 * Lo muestra `i/index.php` cuando el evento tiene `estado = "por-revisar"` y
 * quien entra no trae el código de revisión. Ver la nota grande de allá.
 *
 * ⚠️ ACÁ NO VA NINGÚN DATO DE LA FIESTA. Ni los nombres, ni la fecha, ni la
 *    foto. La dirección de una invitación se adivina (son los nombres de la
 *    pareja); si alguien acierta, no tiene que enterarse de nada más.
 *
 * ⚠️ NO SE INDEXA. Lleva `noindex,nofollow`: una invitación a medio revisar no
 *    puede terminar en Google.
 *
 * Está aparte de `index.php` a propósito: así se le puede cambiar el texto o el
 * diseño sin tocar el archivo por el que pasan TODAS las invitaciones.
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
<title>Invitación en preparación</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Nunito:wght@400;600&display=swap">
<style>
  html,body{margin:0;height:100%}
  body{display:flex;align-items:center;justify-content:center;padding:26px;
       background:linear-gradient(160deg,#FFF8F4 0%,#FDF1EC 100%);
       color:#3A1B22;font-family:Nunito,system-ui,-apple-system,sans-serif;
       text-align:center;-webkit-font-smoothing:antialiased}
  .caja{max-width:430px}
  .sello{width:54px;height:54px;margin:0 auto 20px;border-radius:50%;
         border:1px solid #F8D3D6;display:flex;align-items:center;justify-content:center}
  .sello svg{width:24px;height:24px;stroke:#6D1233;fill:none;stroke-width:1.4;
             stroke-linecap:round;stroke-linejoin:round}
  h1{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;
     font-size:31px;line-height:1.22;margin:0 0 14px;color:#6D1233}
  p{font-size:15px;line-height:1.62;margin:0;opacity:.78}
  .linea{width:46px;height:1px;background:#F8D3D6;margin:26px auto 14px}
  .marca{font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;opacity:.45}
</style>
</head>
<body>
  <div class="caja">
    <div class="sello">
      <!-- un sobre, dibujado: mismo criterio que los íconos del panel -->
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
        <path d="M3 7l9 6 9-6"/>
      </svg>
    </div>
    <h1>Esta invitación se está preparando</h1>
    <p>Todavía no está lista para compartir. En cuanto esté, quien la está
       armando te va a pasar el link definitivo.</p>
    <div class="linea"></div>
    <div class="marca">Invítame</div>
  </div>
</body>
</html>
