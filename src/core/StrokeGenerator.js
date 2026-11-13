/**
 * StrokeGenerator.js - Motor Universal Pedagógico y Generador de Trazos
 * Basado en los estándares SEP de preescolar y método fonético / caligráfico escolar.
 * 
 * Capacidades:
 * - Define la geometría exacta, dirección, puntos numerados y flechas para:
 *   • Las 26 letras mayúsculas (A - Z)
 *   • Las 26 letras minúsculas (a - z)
 *   • Los 10 dígitos numéricos (0 - 9)
 *   • 8 patrones de grafomotricidad preescolar (líneas, curvas, olas, zig-zag, espirales)
 * - Muestreo denso de puntos de trayectoria (checkpoints) para detección suave y tolerante.
 * - Generador de trazos para palabras y nombres completos (ej. JUAN CARLOS, MAMÁ, etc.).
 * - Renderizado en canvas con guías punteadas, insignias numeradas y animación guía.
 */

// Puntos clave normalizados (0.0 a 1.0) para cada letra mayúscula
const UPPERCASE_STROKES = {
  'A': [
    { id: 'A1', label: '1', arrow: '↙', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.88 }] },
    { id: 'A2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.82, y: 0.88 }] },
    { id: 'A3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.30, y: 0.58 }, { x: 0.70, y: 0.58 }] }
  ],
  'B': [
    { id: 'B1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'B2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.76, y: 0.12 }, { x: 0.76, y: 0.48 }, { x: 0.28, y: 0.48 }] },
    { id: 'B3', label: '3', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.48 }, { x: 0.82, y: 0.48 }, { x: 0.82, y: 0.88 }, { x: 0.28, y: 0.88 }] }
  ],
  'C': [
    { id: 'C1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.80, y: 0.24 }, { x: 0.48, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.48, y: 0.88 }, { x: 0.80, y: 0.76 }] }
  ],
  'D': [
    { id: 'D1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'D2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.84, y: 0.20 }, { x: 0.84, y: 0.80 }, { x: 0.28, y: 0.88 }] }
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
    { id: 'G1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.80, y: 0.24 }, { x: 0.48, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.48, y: 0.88 }, { x: 0.78, y: 0.80 }] },
    { id: 'G2', label: '2', arrow: '↑', type: 'line', pts: [{ x: 0.78, y: 0.80 }, { x: 0.78, y: 0.52 }] },
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
    { id: 'J2', label: '2', arrow: '↓', type: 'curve', pts: [{ x: 0.62, y: 0.12 }, { x: 0.62, y: 0.72 }, { x: 0.44, y: 0.88 }, { x: 0.26, y: 0.76 }] }
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
  'O': [
    { id: 'O1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.35 }, { x: 0.18, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.82, y: 0.65 }, { x: 0.82, y: 0.35 }, { x: 0.50, y: 0.12 }] }
  ],
  'P': [
    { id: 'P1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'P2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.82, y: 0.12 }, { x: 0.82, y: 0.52 }, { x: 0.28, y: 0.52 }] }
  ],
  'Q': [
    { id: 'Q1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.35 }, { x: 0.18, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.82, y: 0.65 }, { x: 0.82, y: 0.35 }, { x: 0.50, y: 0.12 }] },
    { id: 'Q2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.56, y: 0.68 }, { x: 0.85, y: 0.92 }] }
  ],
  'R': [
    { id: 'R1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'R2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.80, y: 0.12 }, { x: 0.80, y: 0.50 }, { x: 0.28, y: 0.50 }] },
    { id: 'R3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.48, y: 0.50 }, { x: 0.80, y: 0.88 }] }
  ],
  'S': [
    { id: 'S1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.78, y: 0.24 }, { x: 0.50, y: 0.12 }, { x: 0.22, y: 0.30 }, { x: 0.50, y: 0.50 }, { x: 0.78, y: 0.70 }, { x: 0.50, y: 0.88 }, { x: 0.22, y: 0.76 }] }
  ],
  'T': [
    { id: 'T1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.18, y: 0.12 }, { x: 0.82, y: 0.12 }] },
    { id: 'T2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] }
  ],
  'U': [
    { id: 'U1', label: '1', arrow: '∪', type: 'curve', pts: [{ x: 0.24, y: 0.12 }, { x: 0.24, y: 0.68 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.68 }, { x: 0.76, y: 0.12 }] }
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

// Puntos clave normalizados para cada letra minúscula
const LOWERCASE_STROKES = {
  'a': [
    { id: 'a1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.70, y: 0.50 }, { x: 0.44, y: 0.40 }, { x: 0.24, y: 0.65 }, { x: 0.44, y: 0.88 }, { x: 0.70, y: 0.75 }] },
    { id: 'a2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.70, y: 0.42 }, { x: 0.70, y: 0.88 }] }
  ],
  'b': [
    { id: 'b1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'b2', label: '2', arrow: '↻', type: 'curve', pts: [{ x: 0.28, y: 0.52 }, { x: 0.74, y: 0.44 }, { x: 0.74, y: 0.86 }, { x: 0.28, y: 0.88 }] }
  ],
  'c': [
    { id: 'c1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.74, y: 0.50 }, { x: 0.48, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.48, y: 0.88 }, { x: 0.74, y: 0.78 }] }
  ],
  'd': [
    { id: 'd1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.50 }, { x: 0.46, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.46, y: 0.88 }, { x: 0.72, y: 0.75 }] },
    { id: 'd2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.72, y: 0.12 }, { x: 0.72, y: 0.88 }] }
  ],
  'e': [
    { id: 'e1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.64 }, { x: 0.72, y: 0.64 }] },
    { id: 'e2', label: '2', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.64 }, { x: 0.50, y: 0.40 }, { x: 0.24, y: 0.64 }, { x: 0.48, y: 0.88 }, { x: 0.74, y: 0.80 }] }
  ],
  'f': [
    { id: 'f1', label: '1', arrow: '↓', type: 'curve', pts: [{ x: 0.68, y: 0.18 }, { x: 0.46, y: 0.12 }, { x: 0.42, y: 0.40 }, { x: 0.42, y: 0.88 }] },
    { id: 'f2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.24, y: 0.46 }, { x: 0.64, y: 0.46 }] }
  ],
  'g': [
    { id: 'g1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.70, y: 0.50 }, { x: 0.44, y: 0.40 }, { x: 0.24, y: 0.65 }, { x: 0.44, y: 0.86 }, { x: 0.70, y: 0.75 }] },
    { id: 'g2', label: '2', arrow: '↓', type: 'curve', pts: [{ x: 0.70, y: 0.42 }, { x: 0.70, y: 0.94 }, { x: 0.48, y: 1.05 }, { x: 0.26, y: 0.96 }] }
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
    { id: 'm1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.20, y: 0.42 }, { x: 0.20, y: 0.88 }] },
    { id: 'm2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.20, y: 0.58 }, { x: 0.36, y: 0.40 }, { x: 0.50, y: 0.56 }, { x: 0.50, y: 0.88 }] },
    { id: 'm3', label: '3', arrow: '↷', type: 'curve', pts: [{ x: 0.50, y: 0.58 }, { x: 0.66, y: 0.40 }, { x: 0.80, y: 0.56 }, { x: 0.80, y: 0.88 }] }
  ],
  'n': [
    { id: 'n1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.42 }, { x: 0.28, y: 0.88 }] },
    { id: 'n2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.58 }, { x: 0.50, y: 0.40 }, { x: 0.74, y: 0.56 }, { x: 0.74, y: 0.88 }] }
  ],
  'o': [
    { id: 'o1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.40 }, { x: 0.24, y: 0.52 }, { x: 0.24, y: 0.76 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.76 }, { x: 0.76, y: 0.52 }, { x: 0.50, y: 0.40 }] }
  ],
  'p': [
    { id: 'p1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.42 }, { x: 0.28, y: 1.05 }] },
    { id: 'p2', label: '2', arrow: '↻', type: 'curve', pts: [{ x: 0.28, y: 0.52 }, { x: 0.74, y: 0.44 }, { x: 0.74, y: 0.84 }, { x: 0.28, y: 0.88 }] }
  ],
  'q': [
    { id: 'q1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.50 }, { x: 0.46, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.46, y: 0.86 }, { x: 0.72, y: 0.75 }] },
    { id: 'q2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.72, y: 0.42 }, { x: 0.72, y: 1.05 }] }
  ],
  'r': [
    { id: 'r1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.30, y: 0.42 }, { x: 0.30, y: 0.88 }] },
    { id: 'r2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.30, y: 0.58 }, { x: 0.48, y: 0.40 }, { x: 0.72, y: 0.46 }] }
  ],
  's': [
    { id: 's1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.74, y: 0.50 }, { x: 0.50, y: 0.40 }, { x: 0.26, y: 0.54 }, { x: 0.50, y: 0.66 }, { x: 0.74, y: 0.78 }, { x: 0.50, y: 0.88 }, { x: 0.26, y: 0.80 }] }
  ],
  't': [
    { id: 't1', label: '1', arrow: '↓', type: 'curve', pts: [{ x: 0.48, y: 0.20 }, { x: 0.48, y: 0.78 }, { x: 0.68, y: 0.88 }] },
    { id: 't2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.45 }, { x: 0.68, y: 0.45 }] }
  ],
  'u': [
    { id: 'u1', label: '1', arrow: '∪', type: 'curve', pts: [{ x: 0.26, y: 0.42 }, { x: 0.26, y: 0.72 }, { x: 0.50, y: 0.88 }, { x: 0.74, y: 0.72 }, { x: 0.74, y: 0.42 }] },
    { id: 'u2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.74, y: 0.42 }, { x: 0.74, y: 0.88 }] }
  ],
  'v': [
    { id: 'v1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.42 }, { x: 0.50, y: 0.88 }] },
    { id: 'v2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.50, y: 0.88 }, { x: 0.74, y: 0.42 }] }
  ],
  'w': [
    { id: 'w1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.16, y: 0.42 }, { x: 0.34, y: 0.88 }] },
    { id: 'w2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.34, y: 0.88 }, { x: 0.50, y: 0.60 }] },
    { id: 'w3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.60 }, { x: 0.66, y: 0.88 }] },
    { id: 'w4', label: '4', arrow: '↗', type: 'line', pts: [{ x: 0.66, y: 0.88 }, { x: 0.84, y: 0.42 }] }
  ],
  'x': [
    { id: 'x1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.44 }, { x: 0.74, y: 0.86 }] },
    { id: 'x2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.44 }, { x: 0.26, y: 0.86 }] }
  ],
  'y': [
    { id: 'y1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.42 }, { x: 0.50, y: 0.72 }] },
    { id: 'y2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.42 }, { x: 0.28, y: 1.05 }] }
  ],
  'z': [
    { id: 'z1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.44 }, { x: 0.74, y: 0.44 }] },
    { id: 'z2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.44 }, { x: 0.26, y: 0.86 }] },
    { id: 'z3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.86 }, { x: 0.74, y: 0.86 }] }
  ]
};

// Puntos clave normalizados para los dígitos numéricos (0 - 9)
const NUMBER_STROKES = {
  '0': [
    { id: 'N0_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.22, y: 0.35 }, { x: 0.22, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.78, y: 0.65 }, { x: 0.78, y: 0.35 }, { x: 0.50, y: 0.12 }] }
  ],
  '1': [
    { id: 'N1_1', label: '1', arrow: '↗', type: 'line', pts: [{ x: 0.32, y: 0.35 }, { x: 0.50, y: 0.14 }] },
    { id: 'N1_2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.14 }, { x: 0.50, y: 0.88 }] }
  ],
  '2': [
    { id: 'N2_1', label: '1', arrow: '↷', type: 'curve', pts: [{ x: 0.26, y: 0.32 }, { x: 0.50, y: 0.12 }, { x: 0.76, y: 0.30 }, { x: 0.26, y: 0.88 }] },
    { id: 'N2_2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.88 }, { x: 0.78, y: 0.88 }] }
  ],
  '3': [
    { id: 'N3_1', label: '1', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.22 }, { x: 0.50, y: 0.12 }, { x: 0.74, y: 0.28 }, { x: 0.50, y: 0.48 }] },
    { id: 'N3_2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.50, y: 0.48 }, { x: 0.78, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.26, y: 0.78 }] }
  ],
  '4': [
    { id: 'N4_1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.65, y: 0.12 }, { x: 0.24, y: 0.60 }] },
    { id: 'N4_2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.24, y: 0.60 }, { x: 0.82, y: 0.60 }] },
    { id: 'N4_3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.65, y: 0.12 }, { x: 0.65, y: 0.88 }] }
  ],
  '5': [
    { id: 'N5_1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.36, y: 0.14 }, { x: 0.34, y: 0.48 }] },
    { id: 'N5_2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.34, y: 0.48 }, { x: 0.78, y: 0.54 }, { x: 0.76, y: 0.82 }, { x: 0.30, y: 0.86 }] },
    { id: 'N5_3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.36, y: 0.14 }, { x: 0.74, y: 0.14 }] }
  ],
  '6': [
    { id: 'N6_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.22 }, { x: 0.36, y: 0.40 }, { x: 0.24, y: 0.68 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.68 }, { x: 0.48, y: 0.52 }, { x: 0.26, y: 0.68 }] }
  ],
  '7': [
    { id: 'N7_1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.22, y: 0.14 }, { x: 0.78, y: 0.14 }] },
    { id: 'N7_2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.78, y: 0.14 }, { x: 0.38, y: 0.88 }] }
  ],
  '8': [
    { id: 'N8_1', label: '1', arrow: '♾', type: 'curve', pts: [{ x: 0.50, y: 0.50 }, { x: 0.28, y: 0.32 }, { x: 0.50, y: 0.12 }, { x: 0.72, y: 0.32 }, { x: 0.50, y: 0.50 }, { x: 0.26, y: 0.70 }, { x: 0.50, y: 0.88 }, { x: 0.74, y: 0.70 }, { x: 0.50, y: 0.50 }] }
  ],
  '9': [
    { id: 'N9_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.74, y: 0.48 }, { x: 0.48, y: 0.12 }, { x: 0.24, y: 0.32 }, { x: 0.50, y: 0.52 }, { x: 0.74, y: 0.48 }] },
    { id: 'N9_2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.74, y: 0.48 }, { x: 0.74, y: 0.88 }] }
  ]
};

// Patrones de grafomotricidad preescolar (trazos preparatorios SEP)
const PATTERN_STROKES = {
  'lineas_verticales': [
    { id: 'PV1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.25, y: 0.15 }, { x: 0.25, y: 0.85 }] },
    { id: 'PV2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.85 }] },
    { id: 'PV3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.75, y: 0.15 }, { x: 0.75, y: 0.85 }] }
  ],
  'lineas_horizontales': [
    { id: 'PH1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.25 }, { x: 0.85, y: 0.25 }] },
    { id: 'PH2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.50 }, { x: 0.85, y: 0.50 }] },
    { id: 'PH3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.75 }, { x: 0.85, y: 0.75 }] }
  ],
  'cruces': [
    { id: 'PC1_V', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.30, y: 0.20 }, { x: 0.30, y: 0.80 }] },
    { id: 'PC1_H', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.50 }, { x: 0.45, y: 0.50 }] },
    { id: 'PC2_V', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.70, y: 0.20 }, { x: 0.70, y: 0.80 }] },
    { id: 'PC2_H', label: '4', arrow: '➔', type: 'line', pts: [{ x: 0.55, y: 0.50 }, { x: 0.85, y: 0.50 }] }
  ],
  'olas_mar': [
    { id: 'PO1', label: '1', arrow: '〰️', type: 'curve', pts: [{ x: 0.10, y: 0.65 }, { x: 0.25, y: 0.30 }, { x: 0.40, y: 0.65 }, { x: 0.55, y: 0.30 }, { x: 0.70, y: 0.65 }, { x: 0.85, y: 0.30 }] }
  ],
  'montañas_zigzag': [
    { id: 'PZ1', label: '1', arrow: '↗', type: 'line', pts: [{ x: 0.10, y: 0.75 }, { x: 0.25, y: 0.25 }] },
    { id: 'PZ2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.25, y: 0.25 }, { x: 0.40, y: 0.75 }] },
    { id: 'PZ3', label: '3', arrow: '↗', type: 'line', pts: [{ x: 0.40, y: 0.75 }, { x: 0.55, y: 0.25 }] },
    { id: 'PZ4', label: '4', arrow: '↘', type: 'line', pts: [{ x: 0.55, y: 0.25 }, { x: 0.70, y: 0.75 }] },
    { id: 'PZ5', label: '5', arrow: '↗', type: 'line', pts: [{ x: 0.70, y: 0.75 }, { x: 0.85, y: 0.25 }] }
  ],
  'espiral': [
    { id: 'PE1', label: '1', arrow: '🌀', type: 'curve', pts: [{ x: 0.50, y: 0.50 }, { x: 0.58, y: 0.50 }, { x: 0.58, y: 0.38 }, { x: 0.40, y: 0.38 }, { x: 0.40, y: 0.62 }, { x: 0.68, y: 0.62 }, { x: 0.68, y: 0.28 }, { x: 0.30, y: 0.28 }, { x: 0.30, y: 0.74 }, { x: 0.80, y: 0.74 }] }
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
        // Fallback genérico para caracteres especiales o acentos (á -> a)
        const unaccented = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (UPPERCASE_STROKES[unaccented.toUpperCase()]) {
          raw = forceUpper ? UPPERCASE_STROKES[unaccented.toUpperCase()] : LOWERCASE_STROKES[unaccented.toLowerCase()];
        }
      }
    }

    if (!raw) {
      // Fallback seguro: Trazo de caja escolar
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

      // Generar checkpoints densos cada ~14 píxeles para detección precisa
      const checkpoints = this.interpolatePolyline(scaledPts, stroke.type === 'curve' ? 12 : 15);

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
        startPoint: scaledPts[0],
        endPoint: scaledPts[scaledPts.length - 1],
        minDistance: Math.max(35, checkpoints.length * 8)
      };
    });
  }

  /**
   * Genera un diseño de renglón con múltiples letras (ej. 'JUAN CARLOS' o 'A A A A')
   */
  static generateRowLayout(chars, bounds = { x: 0, y: 0, width: 760, height: 420 }, options = {}) {
    const list = Array.isArray(chars) ? chars : String(chars).split('');
    const count = list.length;
    if (count === 0) return [];

    const stepW = bounds.width / count;
    const padding = stepW * 0.08;
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
   * Interpola puntos a lo largo de una polilínea o curva de Bezier
   */
  static interpolatePolyline(points, stepDistance = 14) {
    if (!points || points.length === 0) return [];
    if (points.length === 1) return [{ x: points[0].x, y: points[0].y, hit: false }];

    const checkpoints = [];

    // Interpolación por tramos de segmentos lineales o spline suave
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
   * Evalúa el progreso del trazo con alta tolerancia motriz preescolar.
   * Devuelve { isComplete, progress, newHits }
   */
  static checkStrokeProgress(strokeData, cursorPt, stepDist, hitRadius = 32) {
    if (strokeData.completed) return { isComplete: true, progress: 1.0, newHits: 0 };

    // Caso especial: Punto de la letra 'i' o 'j'
    if (strokeData.isDot) {
      const sp = strokeData.startPoint;
      if (Math.hypot(cursorPt.x - sp.x, cursorPt.y - sp.y) <= (hitRadius + 6)) {
        strokeData.completed = true;
        strokeData.hitCount = strokeData.totalPoints;
        return { isComplete: true, progress: 1.0, newHits: 1 };
      }
      return { isComplete: false, progress: 0.0, newHits: 0 };
    }

    let newlyHit = 0;
    const cps = strokeData.checkpoints;

    for (let i = 0; i < cps.length; i++) {
      const cp = cps[i];
      if (!cp.hit && Math.hypot(cursorPt.x - cp.x, cursorPt.y - cp.y) <= hitRadius) {
        cp.hit = true;
        newlyHit++;
      }
    }

    strokeData.hitCount = (strokeData.hitCount || 0) + newlyHit;
    strokeData.distanceDrawn = (strokeData.distanceDrawn || 0) + stepDist;

    const coverage = strokeData.hitCount / Math.max(1, strokeData.totalPoints);
    const distMet = strokeData.distanceDrawn >= Math.max(28, strokeData.minDistance * 0.7);

    // El niño debe haber cubierto al menos el 60% de los puntos y una distancia mínima de arrastre
    // Además haber pasado cerca del inicio (primeros puntos) y del final
    const startTouched = cps[0]?.hit || cps[1]?.hit || cps[2]?.hit;
    const endTouched = cps[cps.length - 1]?.hit || cps[cps.length - 2]?.hit || cps[cps.length - 3]?.hit;

    if (coverage >= 0.60 && distMet && startTouched && endTouched) {
      strokeData.completed = true;
      return { isComplete: true, progress: 1.0, newHits: newlyHit };
    }

    return { isComplete: false, progress: coverage, newHits: newlyHit };
  }

  /**
   * Dibuja las guías punteadas escolares y las insignias de inicio numeradas
   */
  static renderStrokeGuides(ctx, strokes, activeIndex = 0, themeColor = '#1565c0') {
    if (!ctx || !strokes) return;

    strokes.forEach((stroke, idx) => {
      const isActive = (idx === activeIndex);
      const isDone = !!stroke.completed;
      const pts = stroke.rawPoints;

      ctx.save();

      // 1. Línea punteada guía
      ctx.beginPath();
      ctx.lineWidth = isActive ? 5 : 3.5;
      ctx.setLineDash(isActive ? [8, 6] : [6, 6]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = isDone ? '#4caf50' : (isActive ? '#ff7043' : 'rgba(84, 110, 122, 0.55)');

      pts.forEach((p, pIdx) => {
        if (pIdx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Punto especial de la 'i'
      if (stroke.isDot) {
        ctx.setLineDash([]);
        ctx.fillStyle = isDone ? '#4caf50' : (isActive ? '#ff7043' : '#546e7a');
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Insignia circular numerada con flecha de inicio
      if (!isDone && pts.length > 0) {
        const start = pts[0];
        const r = isActive ? 15 : 12;

        // Círculo base con relieve
        ctx.setLineDash([]);
        ctx.fillStyle = isActive ? '#ff5722' : '#ffffff';
        ctx.shadowColor = isActive ? 'rgba(255, 87, 34, 0.6)' : 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = isActive ? 10 : 4;
        ctx.beginPath();
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isActive ? '#ffffff' : '#37474f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Número
        ctx.fillStyle = isActive ? '#ffffff' : '#263238';
        ctx.font = `900 ${isActive ? 13 : 11}px "Fredoka", "Comic Sans MS", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stroke.label, start.x, start.y);

        // Flecha direccional junto a la insignia
        if (pts.length >= 2 && !stroke.isDot) {
          const next = pts[1];
          const ang = Math.atan2(next.y - start.y, next.x - start.x);
          const arrowDist = r + 9;
          const ax = start.x + Math.cos(ang) * arrowDist;
          const ay = start.y + Math.sin(ang) * arrowDist;

          ctx.save();
          ctx.fillStyle = isActive ? '#ff5722' : '#546e7a';
          ctx.translate(ax, ay);
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(-4, -5);
          ctx.lineTo(-4, 5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
    });
  }

  /**
   * Renderiza el trazo completado con acabado de crayón sólido luminoso
   */
  static renderCompletedStroke(ctx, stroke, color = '#2e7d32') {
    if (!ctx || !stroke) return;
    const pts = stroke.rawPoints;
    if (!pts || pts.length === 0) return;

    ctx.save();
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    if (stroke.isDot) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      pts.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renderiza una guía de animación suave (estrellita viajera) para mostrar al niño el camino
   */
  static renderAnimatedPointer(ctx, stroke, t) {
    if (!ctx || !stroke || stroke.completed || stroke.isDot) return;
    const cps = stroke.checkpoints;
    if (!cps || cps.length === 0) return;

    const idx = Math.min(Math.floor(t * cps.length), cps.length - 1);
    const pt = cps[idx];
    if (!pt) return;

    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffab00';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pequeño aro pulsante
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
