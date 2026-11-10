# build_bundle.ps1 - Generador universal de bundle.js para Juan Carlos's Adventures
$files = @(
    "src/core/StorageManager.js",
    "src/core/AudioManager.js",
    "src/core/RewardManager.js",
    "src/components/Confetti.js",
    "src/components/Modal.js",
    "src/components/LevelSelector.js",
    "src/components/ArabotAssistant.js",
    "src/core/LetterWaypoints.js",
    "src/modules/HomeScreen.js",
    "src/modules/NameTracingScreen.js",
    "src/modules/LetterTracingScreen.js",
    "src/modules/SyllablesScreen.js",
    "src/modules/NumbersScreen.js",
    "src/modules/VowelsScreen.js",
    "src/modules/ShapesScreen.js",
    "src/modules/OpenWorldScreen.js",
    "src/main.js"
)

$bundleHeader = @"
/**
 * Juan Carlos's Adventures - Standalone Universal Bundle
 * Compatible con file:/// (sin CORS), GitHub Pages y Android WebView.
 * Organizado en Español con 50 Juegos en Círculos por módulo y validación por waypoints.
 */
(function() {
  'use strict';

"@

$bundleFooter = @"

  // Inicialización inmediata y segura en cualquier entorno
  function bootstrap() {
    if (!window.__APP_INSTANCE) {
      window.__APP_INSTANCE = new App();
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
"@

$combined = $bundleHeader

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        
        # Eliminar líneas de import (multilínea o de una sola línea)
        $clean = $content -replace "(?m)^\s*import\s+[^;]+;\s*`r?`n?", ""
        
        # Convertir export class -> class
        $clean = $clean -replace "(?m)^\s*export\s+class\s+", "class "
        
        # Convertir export const -> const
        $clean = $clean -replace "(?m)^\s*export\s+const\s+", "const "
        
        # Convertir export function -> function
        $clean = $clean -replace "(?m)^\s*export\s+function\s+", "function "
        
        # Convertir export default class -> class
        $clean = $clean -replace "(?m)^\s*export\s+default\s+class\s+", "class "

        # Eliminar el bloque de inicio de main.js ya que bootstrap lo maneja al final
        if ($file -eq "src/main.js") {
            $clean = $clean -replace "(?s)window\.addEventListener\('DOMContentLoaded'.*$", ""
        }

        $combined += "`n  /* ==========================================================================`n"
        $combined += "     FILE: $file`n"
        $combined += "     ========================================================================== */`n`n"
        $combined += $clean
        $combined += "`n"
    } else {
        Write-Error "Archivo no encontrado: $file"
    }
}

$combined += $bundleFooter

Set-Content -Path "bundle.js" -Value $combined -Encoding UTF8
Write-Host "bundle.js generado exitosamente. Tamano: $((Get-Item 'bundle.js').Length) bytes."

# Verificación de sintaxis con Node
node -c bundle.js
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error de sintaxis en bundle.js. Abortando."
    exit 1
}

# Verificación automatizada de navegación y clics
Write-Host "Ejecutando suite automatizada de pruebas de navegacion..." -ForegroundColor Cyan
node tests/verify_navigation.js
if ($LASTEXITCODE -ne 0) {
    Write-Error "Pruebas de navegacion fallaron. El bundle no esta listo para produccion."
    exit 1
}

Write-Host "Todas las pruebas pasaron exitosamente. Bundle listo para produccion." -ForegroundColor Green
