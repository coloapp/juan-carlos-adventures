/**
 * LetterWaypoints.js - Guías y secuencias pedagógicas de trazo para Kínder y Preescolar
 * Define puntos clave (checkpoints) en coordenadas normalizadas (0.0 a 1.0)
 * para validar que el niño realice el recorrido completo y en el orden correcto
 * según los métodos pedagógicos SEP y Gonvill.
 */

export const LETTER_WAYPOINTS = {
  // A (Sube diagonal izquierda, baja diagonal derecha y barra horizontal)
  'A': [
    { x: 0.28, y: 0.82, label: '1' },
    { x: 0.38, y: 0.50, label: '2' },
    { x: 0.50, y: 0.20, label: '3' },
    { x: 0.62, y: 0.50, label: '4' },
    { x: 0.72, y: 0.82, label: '5' },
    { x: 0.36, y: 0.58, label: '6' },
    { x: 0.64, y: 0.58, label: '7' }
  ],

  // B (Línea vertical hacia abajo, primera panza y segunda panza)
  'B': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.50, label: '2' },
    { x: 0.28, y: 0.82, label: '3' },
    { x: 0.55, y: 0.20, label: '4' },
    { x: 0.68, y: 0.34, label: '5' },
    { x: 0.40, y: 0.50, label: '6' },
    { x: 0.72, y: 0.66, label: '7' },
    { x: 0.38, y: 0.82, label: '8' }
  ],

  // C (Curva de arriba a la derecha, pasa por la izquierda y termina abajo a la derecha)
  'C': [
    { x: 0.72, y: 0.26, label: '1' },
    { x: 0.50, y: 0.18, label: '2' },
    { x: 0.30, y: 0.35, label: '3' },
    { x: 0.26, y: 0.52, label: '4' },
    { x: 0.30, y: 0.70, label: '5' },
    { x: 0.50, y: 0.82, label: '6' },
    { x: 0.72, y: 0.74, label: '7' }
  ],

  // D (Vertical abajo y gran curva derecha)
  'D': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.52, label: '2' },
    { x: 0.28, y: 0.82, label: '3' },
    { x: 0.52, y: 0.20, label: '4' },
    { x: 0.72, y: 0.52, label: '5' },
    { x: 0.52, y: 0.82, label: '6' },
    { x: 0.32, y: 0.82, label: '7' }
  ],

  // E (Vertical abajo y tres barras horizontales)
  'E': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.30, y: 0.82, label: '3' },
    { x: 0.70, y: 0.20, label: '4' },
    { x: 0.60, y: 0.52, label: '5' },
    { x: 0.70, y: 0.82, label: '6' }
  ],

  // F (Vertical abajo y dos barras horizontales)
  'F': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.30, y: 0.82, label: '3' },
    { x: 0.70, y: 0.20, label: '4' },
    { x: 0.60, y: 0.52, label: '5' }
  ],

  // G (Curva redonda de C y gancho hacia adentro)
  'G': [
    { x: 0.72, y: 0.26, label: '1' },
    { x: 0.50, y: 0.18, label: '2' },
    { x: 0.28, y: 0.45, label: '3' },
    { x: 0.32, y: 0.72, label: '4' },
    { x: 0.52, y: 0.82, label: '5' },
    { x: 0.72, y: 0.70, label: '6' },
    { x: 0.72, y: 0.52, label: '7' },
    { x: 0.54, y: 0.52, label: '8' }
  ],

  // H (Línea izquierda abajo, línea derecha abajo y puente central)
  'H': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.82, label: '2' },
    { x: 0.72, y: 0.20, label: '3' },
    { x: 0.72, y: 0.82, label: '4' },
    { x: 0.30, y: 0.51, label: '5' },
    { x: 0.70, y: 0.51, label: '6' }
  ],

  // I (Trazo vertical recto de arriba a abajo)
  'I': [
    { x: 0.50, y: 0.20, label: '1' },
    { x: 0.50, y: 0.50, label: '2' },
    { x: 0.50, y: 0.82, label: '3' }
  ],

  // J (Inicio arriba centro, baja recto y gancho curvo a la izquierda)
  'J': [
    { x: 0.62, y: 0.20, label: '1' },
    { x: 0.62, y: 0.45, label: '2' },
    { x: 0.62, y: 0.68, label: '3' },
    { x: 0.52, y: 0.82, label: '4' },
    { x: 0.35, y: 0.78, label: '5' },
    { x: 0.28, y: 0.64, label: '6' }
  ],

  // K (Vertical abajo, diagonal hacia centro, diagonal hacia abajo-derecha)
  'K': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.82, label: '2' },
    { x: 0.70, y: 0.22, label: '3' },
    { x: 0.35, y: 0.52, label: '4' },
    { x: 0.72, y: 0.82, label: '5' }
  ],

  // L (Baja verticalmente y gira a la derecha horizontalmente)
  'L': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.30, y: 0.82, label: '3' },
    { x: 0.52, y: 0.82, label: '4' },
    { x: 0.72, y: 0.82, label: '5' }
  ],

  // M (Sube vertical izquierda, baja centro, sube derecha, baja vertical derecha)
  'M': [
    { x: 0.24, y: 0.82, label: '1' },
    { x: 0.24, y: 0.20, label: '2' },
    { x: 0.50, y: 0.55, label: '3' },
    { x: 0.76, y: 0.20, label: '4' },
    { x: 0.76, y: 0.82, label: '5' }
  ],

  // N (Sube izquierda, baja diagonal a la derecha y sube a la derecha)
  'N': [
    { x: 0.28, y: 0.82, label: '1' },
    { x: 0.28, y: 0.20, label: '2' },
    { x: 0.50, y: 0.52, label: '3' },
    { x: 0.72, y: 0.82, label: '4' },
    { x: 0.72, y: 0.20, label: '5' }
  ],

  // Ñ (N + tilde superior)
  'Ñ': [
    { x: 0.28, y: 0.82, label: '1' },
    { x: 0.28, y: 0.24, label: '2' },
    { x: 0.50, y: 0.54, label: '3' },
    { x: 0.72, y: 0.82, label: '4' },
    { x: 0.72, y: 0.24, label: '5' },
    { x: 0.35, y: 0.12, label: '6' },
    { x: 0.50, y: 0.16, label: '7' },
    { x: 0.65, y: 0.12, label: '8' }
  ],

  // O (Círculo cerrado empezando arriba, gira antihorario y cierra)
  'O': [
    { x: 0.50, y: 0.18, label: '1' },
    { x: 0.30, y: 0.35, label: '2' },
    { x: 0.26, y: 0.52, label: '3' },
    { x: 0.30, y: 0.70, label: '4' },
    { x: 0.50, y: 0.84, label: '5' },
    { x: 0.70, y: 0.70, label: '6' },
    { x: 0.74, y: 0.52, label: '7' },
    { x: 0.70, y: 0.35, label: '8' },
    { x: 0.50, y: 0.20, label: '9' }
  ],

  // P (Vertical abajo y panza superior)
  'P': [
    { x: 0.30, y: 0.82, label: '1' },
    { x: 0.30, y: 0.20, label: '2' },
    { x: 0.56, y: 0.20, label: '3' },
    { x: 0.70, y: 0.36, label: '4' },
    { x: 0.45, y: 0.52, label: '5' },
    { x: 0.30, y: 0.52, label: '6' }
  ],

  // Q (Círculo de O + colita diagonal)
  'Q': [
    { x: 0.50, y: 0.18, label: '1' },
    { x: 0.28, y: 0.50, label: '2' },
    { x: 0.50, y: 0.82, label: '3' },
    { x: 0.72, y: 0.50, label: '4' },
    { x: 0.50, y: 0.20, label: '5' },
    { x: 0.56, y: 0.68, label: '6' },
    { x: 0.76, y: 0.86, label: '7' }
  ],

  // R (Vertical abajo, panza superior y patita diagonal)
  'R': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.52, label: '2' },
    { x: 0.28, y: 0.82, label: '3' },
    { x: 0.54, y: 0.20, label: '4' },
    { x: 0.70, y: 0.35, label: '5' },
    { x: 0.46, y: 0.52, label: '6' },
    { x: 0.72, y: 0.82, label: '7' }
  ],

  // S (Trazo serpenteante continuo)
  'S': [
    { x: 0.70, y: 0.26, label: '1' },
    { x: 0.50, y: 0.18, label: '2' },
    { x: 0.32, y: 0.32, label: '3' },
    { x: 0.50, y: 0.50, label: '4' },
    { x: 0.68, y: 0.65, label: '5' },
    { x: 0.50, y: 0.82, label: '6' },
    { x: 0.32, y: 0.74, label: '7' }
  ],

  // T (Barra superior horizontal y poste vertical central)
  'T': [
    { x: 0.26, y: 0.20, label: '1' },
    { x: 0.50, y: 0.20, label: '2' },
    { x: 0.74, y: 0.20, label: '3' },
    { x: 0.50, y: 0.52, label: '4' },
    { x: 0.50, y: 0.82, label: '5' }
  ],

  // U (Baja por la izquierda, curva abajo y sube por la derecha)
  // ¡Valida la U completa hasta llegar arriba a la derecha!
  'U': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.45, label: '2' },
    { x: 0.32, y: 0.68, label: '3' },
    { x: 0.50, y: 0.82, label: '4' },
    { x: 0.68, y: 0.68, label: '5' },
    { x: 0.72, y: 0.45, label: '6' },
    { x: 0.72, y: 0.20, label: '7' }
  ],

  // V (Baja diagonal hacia el vértice y sube diagonal)
  'V': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.39, y: 0.52, label: '2' },
    { x: 0.50, y: 0.82, label: '3' },
    { x: 0.61, y: 0.52, label: '4' },
    { x: 0.72, y: 0.22, label: '5' }
  ],

  // W (Doble V)
  'W': [
    { x: 0.22, y: 0.22, label: '1' },
    { x: 0.36, y: 0.82, label: '2' },
    { x: 0.50, y: 0.38, label: '3' },
    { x: 0.64, y: 0.82, label: '4' },
    { x: 0.78, y: 0.22, label: '5' }
  ],

  // X (Cruce de dos diagonales)
  'X': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.50, y: 0.52, label: '2' },
    { x: 0.72, y: 0.82, label: '3' },
    { x: 0.72, y: 0.22, label: '4' },
    { x: 0.28, y: 0.82, label: '5' }
  ],

  // Y (Cáliz superior y pie vertical)
  'Y': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.50, y: 0.52, label: '2' },
    { x: 0.72, y: 0.22, label: '3' },
    { x: 0.50, y: 0.52, label: '4' },
    { x: 0.50, y: 0.82, label: '5' }
  ],

  // Z (Barra horizontal superior, diagonal abajo a la izquierda, barra horizontal inferior)
  'Z': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.72, y: 0.22, label: '2' },
    { x: 0.50, y: 0.52, label: '3' },
    { x: 0.28, y: 0.82, label: '4' },
    { x: 0.72, y: 0.82, label: '5' }
  ]
};

/**
 * Obtiene los waypoints para cualquier letra (con fallback inteligente y seguro)
 */
export function getWaypointsForLetter(letter) {
  const char = (letter || 'A').toUpperCase();
  if (LETTER_WAYPOINTS[char]) {
    return LETTER_WAYPOINTS[char].map(p => ({ ...p }));
  }

  // Fallback para símbolos o caracteres adicionales:
  // 5 puntos guía distribuidos de inicio a fin
  return [
    { x: 0.30, y: 0.22, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.50, y: 0.82, label: '3' },
    { x: 0.70, y: 0.52, label: '4' },
    { x: 0.70, y: 0.22, label: '5' }
  ];
}
