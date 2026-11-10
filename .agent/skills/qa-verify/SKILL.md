---
name: qa-verify
description: Suite de pruebas automatizadas y aseguramiento de calidad (QA) para verificar clics, navegación, selectores de 50 niveles y lienzos táctiles en Juan Carlos's Adventures.
---

# QA Verification Skill - Juan Carlos's Adventures

Esta habilidad garantiza que **ningún cambio se publique con errores de clic, botones congelados o pantallas que no abran**.

## 1. ¿Qué verifica automáticamente?
- **Home Dashboard:** Navegación hacia todos los módulos educativos.
- **Módulo de Trazos:** Apertura de los 10 juegos circulares (`vocales_cuadernillo`, `consonantes_cuadernillo`, `letra_m`, `letra_s`, `letra_t`, `letra_l`, `letra_p`, `letra_n`, `letra_r`, `pizarra_magica`).
- **Selector de 50 Niveles:** Renderizado de los 50 círculos, clic en el Nivel 1 y retorno limpio con los botones atrás.
- **Lienzos de Dibujo Infantil:** Existencia de `bgCanvas`, `paintCanvas`, `fxCanvas` y ejecución de eventos de puntero (`pointerdown`, `pointermove`, `pointerup`) sin excepciones.
- **Trazado de Nombre:** Clic en el nombre (`JUAN CARLOS`), cinta 3D de letras y waypoints.
- **Sílabas:** Clic en los juegos circulares (`completa_palabra`, `arma_silaba`) y selectores.

## 2. Ejecución Rápida
Para ejecutar la suite de pruebas completa en consola:
```powershell
node tests/verify_navigation.js
```
O directamente al generar el bundle de producción:
```powershell
powershell -ExecutionPolicy Bypass -File .\build_bundle.ps1
```
`build_bundle.ps1` detendrá y abortará automáticamente cualquier compilación si alguna prueba de navegación falla.

