# Parche aplicado el 30/8/2026 — nombre del modelo de Sightengine

En `galeria-worker.js`, dentro de `moderar()`:

```js
// ANTES (mal — Sightengine contestaba: Unknown model 'gore-2.1')
fd.append('models', 'nudity-2.1,gore-2.1');

// AHORA (verificado en la doc oficial de Sightengine)
fd.append('models', 'nudity-2.1,gore');   // 'gore' va sin version
```

**Cómo se encontró.** Las primeras fotos de prueba quedaban con `mod: null` y el
Worker tardaba siempre ~4 s (justo el timeout viejo). El error se estaba tragando
en un `.catch(() => null)`, así que no se veía nada. Se cambió `moderar()` para que
devuelva `{falla:'motivo'}` en vez de `null`, y el motivo quedó guardado en el doc
de la foto: `"rechazó: Unknown model 'gore-2.1'"`. Con eso el diagnóstico fue directo.

**Lección para el futuro:** un `catch` que devuelve `null` esconde la causa. Si algo
puede fallar en silencio, que registre POR QUÉ falló en un lugar que se pueda mirar.

**Estado tras el arreglo:** foto de prueba con `mod: {motor:'sightengine', score:0}`
— el filtro juzga y devuelve puntaje. `nudity-2.1` da los campos `sexual_activity`,
`sexual_display` y `erotica`; `gore` da `gore.prob`. Se toma el peor de los cuatro y
el umbral de rechazo es 0.5.

Fuente: https://sightengine.com/docs/graphic-violence-gore-detection-model
