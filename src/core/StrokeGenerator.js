/**
 * StrokeGenerator.js - Motor Universal de Generación y Validación de Trazos
 * 
 * Diseñado pedagógicamente para niños de preescolar:
 * - Geometrías vectoriales normalizadas para todo el abecedario (A-Z, a-z), dígitos (0-9)
 *   y patrones de grafomotricidad.
 * - Interpolación Catmull-Rom de alta resolución para curvas circulares, redondas y suaves
 *   (sin ángulos poligonales rectos en letras como 'a', 'e', 'c', 'o', 's', 'O', 'C').
 * - Renderizado en Canvas con puntos circulares auténticos (Round Dots) tipo caligrafía SEP.
 * - Validación por avance direccional estricto con memoria muscular: exige inicio en el punto
 *   guía, seguimiento secuencial de checkpoints y levantamiento de dedo entre trazos.
 * - Cero avance accidental del trazo 3 al terminar el trazo 2.
 */

// ============================================================================
// 1. PUNTOS CLAVE NORMALIZADOS (0.0 a 1.0) PARA MAYÚSCULAS
// ============================================================================
const UPPERCASE_STROKES = {
  'A': [
    { id: 'A1', label: '1', arrow: '↙', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.88 }] },
    { id: 'A2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.82, y: 0.88 }] },
    { id: 'A3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.60 }, { x: 0.72, y: 0.60 }] }
  ],
  'B': [
    { id: 'B1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'B2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.26, y: 0.12 }, { x: 0.58, y: 0.12 }, { x: 0.78, y: 0.30 }, { x: 0.58, y: 0.48 }, { x: 0.26, y: 0.48 }] },
    { id: 'B3', label: '3', arrow: '↷', type: 'curve', pts: [{ x: 0.26, y: 0.48 }, { x: 0.62, y: 0.48 }, { x: 0.84, y: 0.68 }, { x: 0.62, y: 0.88 }, { x: 0.26, y: 0.88 }] }
  ],
  'C': [
    { id: 'C1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.80, y: 0.24 }, { x: 0.50, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.50, y: 0.88 }, { x: 0.80, y: 0.76 }] }
  ],
  'D': [
    { id: 'D1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'D2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.26, y: 0.12 }, { x: 0.62, y: 0.14 }, { x: 0.84, y: 0.50 }, { x: 0.62, y: 0.86 }, { x: 0.26, y: 0.88 }] }
  ],
  'E': [
    { id: 'E1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'E2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.76, y: 0.12 }] },
    { id: 'E3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.50 }, { x: 0.66, y: 0.50 }] },
    { id: 'E4', label: '4', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.88 }, { x: 0.76, y: 0.88 }] }
  ],
  'F': [
    { id: 'F1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'F2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.76, y: 0.12 }] },
    { id: 'F3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.50 }, { x: 0.66, y: 0.50 }] }
  ],
  'G': [
    { id: 'G1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.80, y: 0.24 }, { x: 0.50, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.50, y: 0.88 }, { x: 0.78, y: 0.78 }] },
    { id: 'G2', label: '2', arrow: '↑', type: 'line', pts: [{ x: 0.78, y: 0.78 }, { x: 0.78, y: 0.52 }] },
    { id: 'G3', label: '3', arrow: '⬅', type: 'line', pts: [{ x: 0.78, y: 0.52 }, { x: 0.54, y: 0.52 }] }
  ],
  'H': [
    { id: 'H1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'H2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.74, y: 0.12 }, { x: 0.74, y: 0.88 }] },
    { id: 'H3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.50 }, { x: 0.74, y: 0.50 }] }
  ],
  'I': [
    { id: 'I1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] },
    { id: 'I2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.30, y: 0.12 }, { x: 0.70, y: 0.12 }] },
    { id: 'I3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.30, y: 0.88 }, { x: 0.70, y: 0.88 }] }
  ],
  'J': [
    { id: 'J1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.32, y: 0.12 }, { x: 0.76, y: 0.12 }] },
    { id: 'J2', label: '2', arrow: '↓', type: 'curve', pts: [{ x: 0.62, y: 0.12 }, { x: 0.62, y: 0.68 }, { x: 0.44, y: 0.88 }, { x: 0.26, y: 0.76 }] }
  ],
  'K': [
    { id: 'K1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'K2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.76, y: 0.16 }, { x: 0.28, y: 0.52 }] },
    { id: 'K3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.28, y: 0.52 }, { x: 0.76, y: 0.88 }] }
  ],
  'L': [
    { id: 'L1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'L2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.88 }, { x: 0.76, y: 0.88 }] }
  ],
  'M': [
    { id: 'M1', label: '1', arrow: '↑', type: 'line', pts: [{ x: 0.20, y: 0.88 }, { x: 0.20, y: 0.12 }] },
    { id: 'M2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.20, y: 0.12 }, { x: 0.50, y: 0.65 }] },
    { id: 'M3', label: '3', arrow: '↗', type: 'line', pts: [{ x: 0.50, y: 0.65 }, { x: 0.80, y: 0.12 }] },
    { id: 'M4', label: '4', arrow: '↓', type: 'line', pts: [{ x: 0.80, y: 0.12 }, { x: 0.80, y: 0.88 }] }
  ],
  'N': [
    { id: 'N1', label: '1', arrow: '↑', type: 'line', pts: [{ x: 0.24, y: 0.88 }, { x: 0.24, y: 0.12 }] },
    { id: 'N2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.24, y: 0.12 }, { x: 0.76, y: 0.88 }] },
    { id: 'N3', label: '3', arrow: '↑', type: 'line', pts: [{ x: 0.76, y: 0.88 }, { x: 0.76, y: 0.12 }] }
  ],
  'Ñ': [
    { id: 'Ñ1', label: '1', arrow: '↑', type: 'line', pts: [{ x: 0.24, y: 0.88 }, { x: 0.24, y: 0.20 }] },
    { id: 'Ñ2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.24, y: 0.20 }, { x: 0.76, y: 0.88 }] },
    { id: 'Ñ3', label: '3', arrow: '↑', type: 'line', pts: [{ x: 0.76, y: 0.88 }, { x: 0.76, y: 0.20 }] },
    { id: 'Ñ4', label: '4', arrow: '〰', type: 'curve', pts: [{ x: 0.32, y: 0.10 }, { x: 0.44, y: 0.06 }, { x: 0.56, y: 0.14 }, { x: 0.68, y: 0.10 }] }
  ],
  'O': [
    { id: 'O1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.50, y: 0.88 }, { x: 0.82, y: 0.50 }, { x: 0.50, y: 0.12 }] }
  ],
  'P': [
    { id: 'P1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'P2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.26, y: 0.12 }, { x: 0.60, y: 0.12 }, { x: 0.82, y: 0.32 }, { x: 0.60, y: 0.52 }, { x: 0.26, y: 0.52 }] }
  ],
  'Q': [
    { id: 'Q1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.50, y: 0.88 }, { x: 0.82, y: 0.50 }, { x: 0.50, y: 0.12 }] },
    { id: 'Q2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.56, y: 0.68 }, { x: 0.85, y: 0.92 }] }
  ],
  'R': [
    { id: 'R1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'R2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.26, y: 0.12 }, { x: 0.60, y: 0.12 }, { x: 0.80, y: 0.30 }, { x: 0.60, y: 0.50 }, { x: 0.26, y: 0.50 }] },
    { id: 'R3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.48, y: 0.50 }, { x: 0.80, y: 0.88 }] }
  ],
  'S': [
    { id: 'S1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.76, y: 0.24 }, { x: 0.50, y: 0.12 }, { x: 0.24, y: 0.30 }, { x: 0.50, y: 0.50 }, { x: 0.76, y: 0.70 }, { x: 0.50, y: 0.88 }, { x: 0.24, y: 0.76 }] }
  ],
  'T': [
    { id: 'T1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.18, y: 0.12 }, { x: 0.82, y: 0.12 }] },
    { id: 'T2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] }
  ],
  'U': [
    { id: 'U1', label: '1', arrow: '∪', type: 'curve', pts: [{ x: 0.24, y: 0.12 }, { x: 0.24, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.65 }, { x: 0.76, y: 0.12 }] }
  ],
  'V': [
    { id: 'V1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.20, y: 0.12 }, { x: 0.50, y: 0.88 }] },
    { id: 'V2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.50, y: 0.88 }, { x: 0.80, y: 0.12 }] }
  ],
  'W': [
    { id: 'W1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.14, y: 0.12 }, { x: 0.32, y: 0.88 }] },
    { id: 'W2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.32, y: 0.88 }, { x: 0.50, y: 0.40 }] },
    { id: 'W3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.40 }, { x: 0.68, y: 0.88 }] },
    { id: 'W4', label: '4', arrow: '↗', type: 'line', pts: [{ x: 0.68, y: 0.88 }, { x: 0.86, y: 0.12 }] }
  ],
  'X': [
    { id: 'X1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.22, y: 0.14 }, { x: 0.78, y: 0.86 }] },
    { id: 'X2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.78, y: 0.14 }, { x: 0.22, y: 0.86 }] }
  ],
  'Y': [
    { id: 'Y1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.20, y: 0.12 }, { x: 0.50, y: 0.50 }] },
    { id: 'Y2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.80, y: 0.12 }, { x: 0.50, y: 0.50 }] },
    { id: 'Y3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.50 }, { x: 0.50, y: 0.88 }] }
  ],
  'Z': [
    { id: 'Z1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.22, y: 0.14 }, { x: 0.78, y: 0.14 }] },
    { id: 'Z2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.78, y: 0.14 }, { x: 0.22, y: 0.86 }] },
    { id: 'Z3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.22, y: 0.86 }, { x: 0.78, y: 0.86 }] }
  ]
};

// ============================================================================
// 2. PUNTOS CLAVE NORMALIZADOS PARA MINÚSCULAS
// ============================================================================
const LOWERCASE_STROKES = {
  'a': [
    { id: 'a1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.68, y: 0.48 }, { x: 0.48, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.48, y: 0.88 }, { x: 0.68, y: 0.78 }] },
    { id: 'a2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.68, y: 0.40 }, { x: 0.68, y: 0.88 }] }
  ],
  'b': [
    { id: 'b1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'b2', label: '2', arrow: '↻', type: 'curve', pts: [{ x: 0.28, y: 0.52 }, { x: 0.52, y: 0.42 }, { x: 0.74, y: 0.65 }, { x: 0.52, y: 0.88 }, { x: 0.28, y: 0.82 }] }
  ],
  'c': [
    { id: 'c1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.74, y: 0.48 }, { x: 0.50, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.74, y: 0.80 }] }
  ],
  'd': [
    { id: 'd1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.68, y: 0.52 }, { x: 0.48, y: 0.42 }, { x: 0.26, y: 0.65 }, { x: 0.48, y: 0.88 }, { x: 0.68, y: 0.78 }] },
    { id: 'd2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.68, y: 0.12 }, { x: 0.68, y: 0.88 }] }
  ],
  'e': [
    { id: 'e1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.64 }, { x: 0.70, y: 0.64 }] },
    { id: 'e2', label: '2', arrow: '↺', type: 'curve', pts: [{ x: 0.70, y: 0.64 }, { x: 0.50, y: 0.40 }, { x: 0.26, y: 0.64 }, { x: 0.50, y: 0.88 }, { x: 0.74, y: 0.82 }] }
  ],
  'f': [
    { id: 'f1', label: '1', arrow: '↓', type: 'curve', pts: [{ x: 0.68, y: 0.18 }, { x: 0.46, y: 0.12 }, { x: 0.42, y: 0.40 }, { x: 0.42, y: 0.88 }] },
    { id: 'f2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.24, y: 0.46 }, { x: 0.64, y: 0.46 }] }
  ],
  'g': [
    { id: 'g1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.68, y: 0.48 }, { x: 0.48, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.48, y: 0.86 }, { x: 0.68, y: 0.76 }] },
    { id: 'g2', label: '2', arrow: '↓', type: 'curve', pts: [{ x: 0.68, y: 0.42 }, { x: 0.68, y: 0.90 }, { x: 0.48, y: 1.05 }, { x: 0.28, y: 0.96 }] }
  ],
  'h': [
    { id: 'h1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'h2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.58 }, { x: 0.50, y: 0.40 }, { x: 0.72, y: 0.56 }, { x: 0.72, y: 0.88 }] }
  ],
  'i': [
    { id: 'i1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.42 }, { x: 0.50, y: 0.88 }] },
    { id: 'i2', label: '•', arrow: '•', type: 'dot', isDot: true, pts: [{ x: 0.50, y: 0.24 }] }
  ],
  'j': [
    { id: 'j1', label: '1', arrow: '↓', type: 'curve', pts: [{ x: 0.58, y: 0.42 }, { x: 0.58, y: 0.94 }, { x: 0.42, y: 1.05 }, { x: 0.26, y: 0.96 }] },
    { id: 'j2', label: '•', arrow: '•', type: 'dot', isDot: true, pts: [{ x: 0.58, y: 0.24 }] }
  ],
  'k': [
    { id: 'k1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.30, y: 0.12 }, { x: 0.30, y: 0.88 }] },
    { id: 'k2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.72, y: 0.44 }, { x: 0.34, y: 0.65 }] },
    { id: 'k3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.34, y: 0.65 }, { x: 0.72, y: 0.88 }] }
  ],
  'l': [
    { id: 'l1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] }
  ],
  'm': [
    { id: 'm1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.22, y: 0.42 }, { x: 0.22, y: 0.88 }] },
    { id: 'm2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.22, y: 0.55 }, { x: 0.38, y: 0.40 }, { x: 0.52, y: 0.54 }, { x: 0.52, y: 0.88 }] },
    { id: 'm3', label: '3', arrow: '↷', type: 'curve', pts: [{ x: 0.52, y: 0.55 }, { x: 0.68, y: 0.40 }, { x: 0.82, y: 0.54 }, { x: 0.82, y: 0.88 }] }
  ],
  'n': [
    { id: 'n1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.42 }, { x: 0.28, y: 0.88 }] },
    { id: 'n2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.58 }, { x: 0.50, y: 0.40 }, { x: 0.74, y: 0.56 }, { x: 0.74, y: 0.88 }] }
  ],
  'ñ': [
    { id: 'ñ1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.42 }, { x: 0.28, y: 0.88 }] },
    { id: 'ñ2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.58 }, { x: 0.50, y: 0.40 }, { x: 0.74, y: 0.56 }, { x: 0.74, y: 0.88 }] },
    { id: 'ñ3', label: '3', arrow: '〰', type: 'curve', pts: [{ x: 0.32, y: 0.25 }, { x: 0.44, y: 0.20 }, { x: 0.56, y: 0.28 }, { x: 0.68, y: 0.24 }] }
  ],
  'o': [
    { id: 'o1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.40 }, { x: 0.24, y: 0.64 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.64 }, { x: 0.50, y: 0.40 }] }
  ],
  'p': [
    { id: 'p1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.42 }, { x: 0.28, y: 1.05 }] },
    { id: 'p2', label: '2', arrow: '↻', type: 'curve', pts: [{ x: 0.28, y: 0.52 }, { x: 0.52, y: 0.42 }, { x: 0.74, y: 0.65 }, { x: 0.52, y: 0.88 }, { x: 0.28, y: 0.82 }] }
  ],
  'q': [
    { id: 'q1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.68, y: 0.52 }, { x: 0.48, y: 0.42 }, { x: 0.26, y: 0.65 }, { x: 0.48, y: 0.88 }, { x: 0.68, y: 0.78 }] },
    { id: 'q2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.68, y: 0.42 }, { x: 0.68, y: 1.05 }] }
  ],
  'r': [
    { id: 'r1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.32, y: 0.42 }, { x: 0.32, y: 0.88 }] },
    { id: 'r2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.32, y: 0.55 }, { x: 0.50, y: 0.40 }, { x: 0.74, y: 0.46 }] }
  ],
  's': [
    { id: 's1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.50 }, { x: 0.50, y: 0.40 }, { x: 0.30, y: 0.52 }, { x: 0.50, y: 0.66 }, { x: 0.72, y: 0.78 }, { x: 0.50, y: 0.88 }, { x: 0.28, y: 0.80 }] }
  ],
  't': [
    { id: 't1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.46, y: 0.20 }, { x: 0.46, y: 0.78 }, { x: 0.62, y: 0.88 }] },
    { id: 't2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.44 }, { x: 0.66, y: 0.44 }] }
  ],
  'u': [
    { id: 'u1', label: '1', arrow: '∪', type: 'curve', pts: [{ x: 0.26, y: 0.42 }, { x: 0.26, y: 0.72 }, { x: 0.50, y: 0.88 }, { x: 0.70, y: 0.72 }, { x: 0.70, y: 0.42 }] },
    { id: 'u2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.70, y: 0.42 }, { x: 0.70, y: 0.88 }] }
  ],
  'v': [
    { id: 'v1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.24, y: 0.42 }, { x: 0.50, y: 0.88 }] },
    { id: 'v2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.50, y: 0.88 }, { x: 0.76, y: 0.42 }] }
  ],
  'w': [
    { id: 'w1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.18, y: 0.42 }, { x: 0.34, y: 0.88 }] },
    { id: 'w2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.34, y: 0.88 }, { x: 0.50, y: 0.55 }] },
    { id: 'w3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.55 }, { x: 0.66, y: 0.88 }] },
    { id: 'w4', label: '4', arrow: '↗', type: 'line', pts: [{ x: 0.66, y: 0.88 }, { x: 0.82, y: 0.42 }] }
  ],
  'x': [
    { id: 'x1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.44 }, { x: 0.74, y: 0.86 }] },
    { id: 'x2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.44 }, { x: 0.26, y: 0.86 }] }
  ],
  'y': [
    { id: 'y1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.42 }, { x: 0.50, y: 0.72 }] },
    { id: 'y2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.42 }, { x: 0.32, y: 1.05 }] }
  ],
  'z': [
    { id: 'z1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.44 }, { x: 0.74, y: 0.44 }] },
    { id: 'z2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.44 }, { x: 0.26, y: 0.86 }] },
    { id: 'z3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.86 }, { x: 0.74, y: 0.86 }] }
  ]
};

// ============================================================================
// 3. DÍGITOS NUMÉRICOS (0-9)
// ============================================================================
const NUMBER_STROKES = {
  '0': [
    { id: '0_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.22, y: 0.50 }, { x: 0.50, y: 0.88 }, { x: 0.78, y: 0.50 }, { x: 0.50, y: 0.12 }] }
  ],
  '1': [
    { id: '1_1', label: '1', arrow: '↗', type: 'line', pts: [{ x: 0.30, y: 0.34 }, { x: 0.50, y: 0.12 }] },
    { id: '1_2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] }
  ],
  '2': [
    { id: '2_1', label: '1', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.28 }, { x: 0.50, y: 0.12 }, { x: 0.74, y: 0.28 }, { x: 0.52, y: 0.58 }, { x: 0.26, y: 0.88 }] },
    { id: '2_2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.88 }, { x: 0.76, y: 0.88 }] }
  ],
  '3': [
    { id: '3_1', label: '1', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.14 }, { x: 0.68, y: 0.14 }, { x: 0.74, y: 0.32 }, { x: 0.50, y: 0.48 }] },
    { id: '3_2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.50, y: 0.48 }, { x: 0.78, y: 0.64 }, { x: 0.68, y: 0.88 }, { x: 0.28, y: 0.88 }] }
  ],
  '4': [
    { id: '4_1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.65, y: 0.12 }, { x: 0.25, y: 0.60 }] },
    { id: '4_2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.25, y: 0.60 }, { x: 0.80, y: 0.60 }] },
    { id: '4_3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.65, y: 0.36 }, { x: 0.65, y: 0.88 }] }
  ],
  '5': [
    { id: '5_1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.68, y: 0.12 }, { x: 0.32, y: 0.12 }, { x: 0.30, y: 0.46 }] },
    { id: '5_2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.30, y: 0.46 }, { x: 0.74, y: 0.46 }, { x: 0.74, y: 0.84 }, { x: 0.30, y: 0.88 }] }
  ],
  '6': [
    { id: '6_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.68, y: 0.18 }, { x: 0.34, y: 0.40 }, { x: 0.26, y: 0.66 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.66 }, { x: 0.50, y: 0.48 }, { x: 0.28, y: 0.66 }] }
  ],
  '7': [
    { id: '7_1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.24, y: 0.14 }, { x: 0.76, y: 0.14 }] },
    { id: '7_2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.76, y: 0.14 }, { x: 0.36, y: 0.88 }] }
  ],
  '8': [
    { id: '8_1', label: '1', arrow: '♾️', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.30, y: 0.28 }, { x: 0.70, y: 0.70 }, { x: 0.50, y: 0.88 }, { x: 0.30, y: 0.70 }, { x: 0.70, y: 0.28 }, { x: 0.50, y: 0.12 }] }
  ],
  '9': [
    { id: '9_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.48 }, { x: 0.50, y: 0.12 }, { x: 0.26, y: 0.32 }, { x: 0.50, y: 0.54 }, { x: 0.72, y: 0.48 }] },
    { id: '9_2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.72, y: 0.32 }, { x: 0.72, y: 0.88 }] }
  ]
};

// ============================================================================
// 4. PATRONES DE GRAFOMOTRICIDAD
// ============================================================================
const PATTERN_STROKES = {
  'lineas_verticales': [
    { id: 'P_V1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.20, y: 0.15 }, { x: 0.20, y: 0.85 }] },
    { id: 'P_V2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.40, y: 0.15 }, { x: 0.40, y: 0.85 }] },
    { id: 'P_V3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.60, y: 0.15 }, { x: 0.60, y: 0.85 }] },
    { id: 'P_V4', label: '4', arrow: '↓', type: 'line', pts: [{ x: 0.80, y: 0.15 }, { x: 0.80, y: 0.85 }] }
  ],
  'lineas_horizontales': [
    { id: 'P_H1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.25 }, { x: 0.85, y: 0.25 }] },
    { id: 'P_H2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.50 }, { x: 0.85, y: 0.50 }] },
    { id: 'P_H3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.75 }, { x: 0.85, y: 0.75 }] }
  ],
  'cruces': [
    { id: 'P_C1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.30, y: 0.20 }, { x: 0.30, y: 0.80 }] },
    { id: 'P_C2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.50 }, { x: 0.45, y: 0.50 }] },
    { id: 'P_C3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.70, y: 0.20 }, { x: 0.70, y: 0.80 }] },
    { id: 'P_C4', label: '4', arrow: '➔', type: 'line', pts: [{ x: 0.55, y: 0.50 }, { x: 0.85, y: 0.50 }] }
  ],
  'olas_mar': [
    { id: 'P_O1', label: '1', arrow: '〰', type: 'curve', pts: [{ x: 0.10, y: 0.60 }, { x: 0.25, y: 0.35 }, { x: 0.40, y: 0.60 }, { x: 0.55, y: 0.35 }, { x: 0.70, y: 0.60 }, { x: 0.85, y: 0.35 }] }
  ],
  'montañas_zigzag': [
    { id: 'P_Z1', label: '1', arrow: '↗', type: 'line', pts: [{ x: 0.10, y: 0.75 }, { x: 0.25, y: 0.25 }] },
    { id: 'P_Z2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.25, y: 0.25 }, { x: 0.40, y: 0.75 }] },
    { id: 'P_Z3', label: '3', arrow: '↗', type: 'line', pts: [{ x: 0.40, y: 0.75 }, { x: 0.55, y: 0.25 }] },
    { id: 'P_Z4', label: '4', arrow: '↘', type: 'line', pts: [{ x: 0.55, y: 0.25 }, { x: 0.70, y: 0.75 }] }
  ],
  'espiral': [
    { id: 'P_E1', label: '1', arrow: '🌀', type: 'curve', pts: [{ x: 0.50, y: 0.50 }, { x: 0.42, y: 0.42 }, { x: 0.50, y: 0.34 }, { x: 0.62, y: 0.46 }, { x: 0.52, y: 0.66 }, { x: 0.30, y: 0.56 }, { x: 0.45, y: 0.22 }, { x: 0.78, y: 0.40 }, { x: 0.60, y: 0.82 }] }
  ]
};

// ============================================================================
// CLASE PRINCIPAL: STROKE GENERATOR
// ============================================================================
export class StrokeGenerator {
  /**
   * Obtiene los trazos exactos de cualquier caracter (mayúscula, minúscula, dígito o patrón).
   * Los devuelve escalados al rectángulo especificado { x, y, width, height }.
   */
  static getStrokes(charOrKey, bounds = { x: 0, y: 0, width: 760, height: 420 }, isUpper = null) {
    let raw = null;
    const str = String(charOrKey || 'A');

    // 1. Patrón de grafomotricidad
    if (PATTERN_STROKES[str]) {
      raw = PATTERN_STROKES[str];
    }
    // 2. Dígito numérico
    else if (NUMBER_STROKES[str]) {
      raw = NUMBER_STROKES[str];
    }
    // 3. Letra (decidir mayúscula o minúscula)
    else {
      const forceUpper = (isUpper === true) || (isUpper === null && str === str.toUpperCase() && str !== str.toLowerCase());
      const charUpper = str.toUpperCase();
      const charLower = str.toLowerCase();

      if (forceUpper && UPPERCASE_STROKES[charUpper]) {
        raw = UPPERCASE_STROKES[charUpper];
      } else if (!forceUpper && LOWERCASE_STROKES[charLower]) {
        raw = LOWERCASE_STROKES[charLower];
      } else if (UPPERCASE_STROKES[charUpper]) {
        raw = UPPERCASE_STROKES[charUpper];
      } else {
        // Fallback genérico para caracteres con acento (Á -> A, é -> e)
        const unaccented = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (UPPERCASE_STROKES[unaccented.toUpperCase()]) {
          raw = forceUpper ? UPPERCASE_STROKES[unaccented.toUpperCase()] : LOWERCASE_STROKES[unaccented.toLowerCase()];
        }
      }
    }

    if (!raw) {
      // Fallback seguro: Caja escolar rectangular
      raw = [
        { id: 'FB1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.25, y: 0.15 }, { x: 0.25, y: 0.85 }] },
        { id: 'FB2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.25, y: 0.85 }, { x: 0.75, y: 0.85 }] }
      ];
    }

    // Escalar los puntos normalizados al bounding box
    const { x: bx, y: by, width: bw, height: bh } = bounds;

    return raw.map((stroke, sIdx) => {
      const scaledPts = stroke.pts.map(p => ({
        x: bx + p.x * bw,
        y: by + p.y * bh
      }));

      // Si es curva, usar Catmull-Rom para curvas perfectamente circulares y suaves
      const isCurved = (stroke.type === 'curve');
      const checkpoints = isCurved
        ? this.interpolateCatmullRom(scaledPts, 16)
        : this.interpolatePolyline(scaledPts, 12);

      return {
        id: stroke.id || `S_${sIdx}`,
        label: stroke.label || `${sIdx + 1}`,
        arrow: stroke.arrow || '↓',
        isDot: !!stroke.isDot,
        type: stroke.type || 'line',
        rawPoints: scaledPts,
        points: scaledPts,
        checkpoints: checkpoints,
        totalPoints: checkpoints.length,
        startPoint: checkpoints[0] || scaledPts[0],
        endPoint: checkpoints[checkpoints.length - 1] || scaledPts[scaledPts.length - 1],
        minDistance: Math.max(30, checkpoints.length * 7),
        started: false,
        completed: false,
        currentCpIndex: 0
      };
    });
  }

  /**
   * Genera un diseño de renglón con letras amplias y espaciadas
   */
  static generateRowLayout(chars, bounds = { x: 0, y: 0, width: 760, height: 420 }, options = {}) {
    const list = Array.isArray(chars) ? chars : String(chars).split('');
    const count = list.length;
    if (count === 0) return [];

    const stepW = bounds.width / count;
    // Espaciado generoso para permitir letras grandes y trazado cómodo
    const padding = stepW * 0.10;
    const letterW = stepW - (padding * 2);
    const letterH = bounds.height;

    const rowLetters = [];

    list.forEach((ch, idx) => {
      const isSpace = (ch === ' ');
      const lx = bounds.x + (idx * stepW) + padding;
      const ly = bounds.y;
      const subBounds = { x: lx, y: ly, width: letterW, height: letterH };

      const strokes = isSpace ? [] : this.getStrokes(ch, subBounds, options.isUpper);

      rowLetters.push({
        index: idx,
        char: ch,
        isSpace: isSpace,
        bounds: subBounds,
        cx: lx + letterW / 2,
        cy: ly + letterH / 2,
        strokes: strokes,
        completed: isSpace
      });
    });

    return rowLetters;
  }

  /**
   * Interpolación Catmull-Rom para curvas redondeadas, circulares y orgánicas (C1 continuo)
   */
  static interpolateCatmullRom(points, samplesPerSegment = 16) {
    if (!points || points.length === 0) return [];
    if (points.length === 1) return [{ x: points[0].x, y: points[0].y, hit: false }];
    if (points.length === 2) return this.interpolatePolyline(points, 12);

    const checkpoints = [];
    const n = points.length;
    const pts = [points[0], ...points, points[n - 1]];

    for (let i = 0; i < pts.length - 3; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const p2 = pts[i + 2];
      const p3 = pts[i + 3];

      for (let s = (i === 0 ? 0 : 1); s <= samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );

        checkpoints.push({ x, y, hit: false });
      }
    }

    return checkpoints;
  }

  /**
   * Interpola puntos a lo largo de segmentos lineales
   */
  static interpolatePolyline(points, stepDistance = 12) {
    if (!points || points.length === 0) return [];
    if (points.length === 1) return [{ x: points[0].x, y: points[0].y, hit: false }];

    const checkpoints = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const steps = Math.max(1, Math.round(dist / stepDistance));

      for (let s = (i === 0 ? 0 : 1); s <= steps; s++) {
        const t = s / steps;
        checkpoints.push({
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t,
          hit: false
        });
      }
    }

    return checkpoints;
  }

  /**
   * Evalúa el progreso del trazo con memoria muscular estricta pero tolerante a la motricidad infantil:
   * 1. Obliga a iniciar en el círculo guía del trazo activo.
   * 2. Avanza secuencialmente a lo largo de la trayectoria.
   * 3. No permite completar el trazo 3 si no se ha trazado deliberadamente de izquierda a derecha.
   */
  static checkStrokeProgress(strokeData, cursorPt, stepDist, hitRadius = 32) {
    if (strokeData.completed) return { isComplete: true, progress: 1.0, newHits: 0 };

    // Caso especial: Punto de la letra 'i' o 'j'
    if (strokeData.isDot) {
      const sp = strokeData.startPoint;
      if (Math.hypot(cursorPt.x - sp.x, cursorPt.y - sp.y) <= (hitRadius + 8)) {
        strokeData.completed = true;
        strokeData.hitCount = strokeData.totalPoints;
        return { isComplete: true, progress: 1.0, newHits: 1 };
      }
      return { isComplete: false, progress: 0.0, newHits: 0 };
    }

    const cps = strokeData.checkpoints;
    if (!cps || cps.length === 0) {
      strokeData.completed = true;
      return { isComplete: true, progress: 1.0, newHits: 0 };
    }

    // 1. REGLA ESTRICTA DE INICIO:
    // El trazo NO puede comenzar a registrar avance si el dedito no tocó primero cerca del inicio
    if (!strokeData.started) {
      const distToStart = Math.hypot(cursorPt.x - strokeData.startPoint.x, cursorPt.y - strokeData.startPoint.y);
      if (distToStart <= Math.max(28, hitRadius * 1.15)) {
        strokeData.started = true;
        strokeData.currentCpIndex = 0;
        strokeData.hitCount = 1;
        cps[0].hit = true;
      } else {
        return { isComplete: false, progress: 0.0, newHits: 0 };
      }
    }

    // 2. AVANCE SECUENCIAL DIRIGIDO:
    let currentIndex = strokeData.currentCpIndex || 0;
    let newlyHit = 0;

    // Permitir avanzar secuencialmente a través de los checkpoints con ventana de búsqueda
    const lookAhead = Math.min(cps.length, currentIndex + 6);
    for (let i = currentIndex; i < lookAhead; i++) {
      const cp = cps[i];
      const dist = Math.hypot(cursorPt.x - cp.x, cursorPt.y - cp.y);
      if (dist <= hitRadius) {
        if (!cp.hit) {
          cp.hit = true;
          newlyHit++;
        }
        currentIndex = i + 1;
      }
    }

    strokeData.currentCpIndex = currentIndex;
    strokeData.hitCount = (strokeData.hitCount || 0) + newlyHit;
    strokeData.distanceDrawn = (strokeData.distanceDrawn || 0) + stepDist;

    const coverage = strokeData.currentCpIndex / cps.length;

    // 3. CONDICIÓN DE COMPLETADO:
    // Debe haber avanzado secuencialmente al menos el 70% de los puntos y alcanzar la zona final
    const endDist = Math.hypot(cursorPt.x - strokeData.endPoint.x, cursorPt.y - strokeData.endPoint.y);
    const reachedEnd = (endDist <= hitRadius * 1.25) || (currentIndex >= cps.length - 2);

    if (coverage >= 0.70 && reachedEnd) {
      strokeData.completed = true;
      cps.forEach(p => p.hit = true);
      return { isComplete: true, progress: 1.0, newHits: newlyHit };
    }

    return { isComplete: false, progress: coverage, newHits: newlyHit };
  }

  /**
   * Dibuja las guías con PUNTOS CIRCULARES AUTÉNTICOS (Round Dots) sobre la curva suave
   */
  static renderStrokeGuides(ctx, strokes, activeIndex = 0, themeColor = '#1565c0') {
    if (!ctx || !strokes) return;

    strokes.forEach((stroke, idx) => {
      const isActive = (idx === activeIndex);
      const isDone = !!stroke.completed;
      const checkpoints = stroke.checkpoints;
      if (!checkpoints || checkpoints.length === 0) return;

      ctx.save();

      // 1. Línea punteada circular auténtica (Round Dots)
      ctx.beginPath();
      ctx.lineWidth = isActive ? 7 : 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([0, isActive ? 16 : 14]);
      ctx.strokeStyle = isDone ? '#4caf50' : (isActive ? '#ff7043' : 'rgba(84, 110, 122, 0.6)');

      checkpoints.forEach((p, pIdx) => {
        if (pIdx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Punto especial de la 'i' o 'j'
      if (stroke.isDot) {
        ctx.setLineDash([]);
        ctx.fillStyle = isDone ? '#4caf50' : (isActive ? '#ff7043' : '#546e7a');
        ctx.beginPath();
        ctx.arc(stroke.startPoint.x, stroke.startPoint.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Insignia circular numerada con flecha de inicio (Paso 1, 2, 3...)
      if (!isDone && checkpoints.length > 0) {
        const start = stroke.startPoint;
        const r = isActive ? 16 : 13;

        // Círculo base con relieve
        ctx.setLineDash([]);
        ctx.fillStyle = isActive ? '#ff5722' : '#ffffff';
        ctx.shadowColor = isActive ? 'rgba(255, 87, 34, 0.65)' : 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = isActive ? 12 : 5;
        ctx.beginPath();
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isActive ? '#ffffff' : '#37474f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Número de paso
        ctx.fillStyle = isActive ? '#ffffff' : '#263238';
        ctx.font = `900 ${isActive ? 14 : 12}px "Fredoka", "Comic Sans MS", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stroke.label, start.x, start.y);

        // Flecha direccional orientada en la dirección inicial del trazo
        if (checkpoints.length >= 3 && !stroke.isDot) {
          const next = checkpoints[Math.min(checkpoints.length - 1, 3)];
          const ang = Math.atan2(next.y - start.y, next.x - start.x);
          const arrowDist = r + 9;
          const ax = start.x + Math.cos(ang) * arrowDist;
          const ay = start.y + Math.sin(ang) * arrowDist;

          ctx.fillStyle = isActive ? '#ff5722' : '#546e7a';
          ctx.beginPath();
          ctx.arc(ax, ay, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  }

  /**
   * Renderiza el trazo una vez completado con una línea sólida y brillante
   */
  static renderCompletedStroke(ctx, stroke, color = '#e91e63') {
    if (!ctx || !stroke || !stroke.checkpoints) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    if (stroke.isDot) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(stroke.startPoint.x, stroke.startPoint.y, 11, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      stroke.checkpoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renderiza la guía animada (estrellita viajera) a lo largo del trazo activo
   */
  static renderAnimatedPointer(ctx, activeStroke, t = 0) {
    if (!ctx || !activeStroke || !activeStroke.checkpoints || activeStroke.checkpoints.length === 0) return;
    const cps = activeStroke.checkpoints;
    const idx = Math.min(cps.length - 1, Math.floor(t * cps.length));
    const pt = cps[idx];

    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 14;

    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#f57f17';
    ctx.lineWidth = 2;
    const s = 11;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - s);
    ctx.lineTo(pt.x + s * 0.35, pt.y - s * 0.35);
    ctx.lineTo(pt.x + s, pt.y);
    ctx.lineTo(pt.x + s * 0.35, pt.y + s * 0.35);
    ctx.lineTo(pt.x, pt.y + s);
    ctx.lineTo(pt.x - s * 0.35, pt.y + s * 0.35);
    ctx.lineTo(pt.x - s, pt.y);
    ctx.lineTo(pt.x - s * 0.35, pt.y - s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
