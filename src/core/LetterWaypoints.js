/**
 * LetterWaypoints.js - Guías y secuencias pedagógicas de trazo para Kínder y Preescolar
 * Define puntos clave (checkpoints) en coordenadas normalizadas (0.0 a 1.0)
 * para validar que el niño realice el recorrido completo y en el orden correcto
 * según los métodos pedagógicos SEP y Gonvill.
 */
import { StrokeGenerator } from './StrokeGenerator.js';

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

/**
 * Catálogo pedagógico completo de letras con mayúscula, minúscula,
 * trazos direccionales, flechas numeradas y objeto sorpresa ilustrado.
 * Todas las coordenadas están exactamente normalizadas para el lienzo 760x420
 * garantizando cero desfases entre contorno hueco, líneas punteadas y waypoints.
 */
export const PEDAGOGICAL_LETTERS = {
  'A': {
    letter: 'A',
    lowercase: 'a',
    word: 'ÁRBOL',
    phonetic: 'A de Árbol',
    icon: '🌳',
    tutorialStrokes: [
      { name: 'Paso 1: Diagonal Izquierda', from: { x: 0.1974, y: 0.1786 }, to: { x: 0.1026, y: 0.7738 } },
      { name: 'Paso 2: Diagonal Derecha', from: { x: 0.1974, y: 0.1786 }, to: { x: 0.2921, y: 0.7738 } },
      { name: 'Paso 3: Barra Central', from: { x: 0.1382, y: 0.5476 }, to: { x: 0.2566, y: 0.5476 } }
    ],
    uppercaseStrokes: [
      {
        id: 'A1',
        step: 1,
        arrow: '↙',
        label: '1',
        description: 'Diagonal izquierda de arriba a abajo',
        points: [
          { x: 0.1974, y: 0.1786 },
          { x: 0.1500, y: 0.4762 },
          { x: 0.1026, y: 0.7738 }
        ]
      },
      {
        id: 'A2',
        step: 2,
        arrow: '↘',
        label: '2',
        description: 'Diagonal derecha de arriba a abajo',
        points: [
          { x: 0.1974, y: 0.1786 },
          { x: 0.2447, y: 0.4762 },
          { x: 0.2921, y: 0.7738 }
        ]
      },
      {
        id: 'A3',
        step: 3,
        arrow: '➔',
        label: '3',
        description: 'Barra central de izquierda a derecha',
        points: [
          { x: 0.1382, y: 0.5476 },
          { x: 0.1974, y: 0.5476 },
          { x: 0.2566, y: 0.5476 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'a1',
        step: 1,
        arrow: '↺',
        label: '1',
        description: 'Círculo redondito antihorario',
        points: [
          { x: 0.5447, y: 0.5238 },
          { x: 0.4868, y: 0.4905 },
          { x: 0.4289, y: 0.5952 },
          { x: 0.4868, y: 0.7000 },
          { x: 0.5447, y: 0.6310 }
        ]
      },
      {
        id: 'a2',
        step: 2,
        arrow: '↓',
        label: '2',
        description: 'Poste vertical hacia abajo',
        points: [
          { x: 0.5447, y: 0.4167 },
          { x: 0.5447, y: 0.5952 },
          { x: 0.5447, y: 0.7738 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="notebook-tree-svg" viewBox="0 0 240 280" width="100%" height="100%">
        <!-- Copa frondosa estilo nube con espirales interiores (idéntica a la imagen del cuadernillo) -->
        <g class="tree-canopy-art">
          <path class="tree-canopy-outline"
                d="M 50 145 
                   C 32 140 22 120 28 100 
                   C 22 85 30 65 48 58 
                   C 45 42 60 25 78 24 
                   C 90 12 115 10 130 20 
                   C 145 10 170 14 182 28 
                   C 198 25 215 38 218 55 
                   C 230 70 228 92 218 108 
                   C 226 125 218 145 200 152 
                   C 205 168 192 185 175 188 
                   C 160 190 148 182 142 172 
                   C 135 178 122 180 115 174 
                   C 108 182 92 182 82 174 
                   C 75 185 58 185 48 172 
                   C 38 165 42 152 50 145 Z" />

          <!-- Espirales decorativos dentro de los lóbulos de la copa -->
          <path class="tree-spiral" d="M 72 45 C 65 45 62 52 66 58 C 72 62 78 55 75 48 C 72 44 65 46 63 50" />
          <path class="tree-spiral" d="M 125 32 C 118 32 114 38 118 45 C 124 50 132 42 128 35 C 124 30 116 32 113 38" />
          <path class="tree-spiral" d="M 185 48 C 178 48 174 55 178 62 C 185 68 194 58 190 50 C 185 45 176 48 174 54" />
          <path class="tree-spiral" d="M 45 105 C 38 105 35 112 39 118 C 45 122 52 115 48 108" />
          <path class="tree-spiral" d="M 198 115 C 205 115 208 122 204 128 C 198 132 191 125 195 118" />
        </g>

        <!-- Tronco con ramas bifurcadas y vetas de madera -->
        <g class="tree-trunk-art">
          <path class="tree-trunk-outline"
                d="M 100 270 
                   C 105 240 102 210 95 180 
                   C 90 160 75 145 60 135 
                   C 68 140 76 150 82 165
                   C 86 150 94 130 96 110
                   C 102 125 106 142 108 160
                   C 112 165 116 168 122 170
                   C 128 150 136 125 152 105
                   C 150 125 148 145 142 165
                   C 152 148 165 138 180 132
                   C 168 145 155 162 148 180
                   C 138 210 135 240 140 270 
                   Z" />

          <!-- Nudo de madera con espiral en la base izquierda -->
          <ellipse class="tree-wood-knot" cx="112" cy="225" rx="8" ry="14" />
          <path class="tree-wood-spiral" d="M 112 218 C 117 218 118 228 113 232 C 109 235 107 226 111 224" />

          <!-- Vetas onduladas de la corteza -->
          <path class="tree-grain" d="M 103 265 C 106 245 105 210 101 190" />
          <path class="tree-grain" d="M 125 265 C 126 235 125 200 128 185" />
          <path class="tree-grain" d="M 134 265 C 132 245 130 220 135 195" />
          <path class="tree-grain" d="M 98 155 C 96 140 92 125 88 118" />
          <path class="tree-grain" d="M 140 155 C 144 140 148 125 154 115" />
        </g>

        <!-- Gradientes para cuando se colorea -->
        <defs>
          <linearGradient id="notebookWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#5d4037"/>
            <stop offset="50%" stop-color="#795548"/>
            <stop offset="100%" stop-color="#4e342e"/>
          </linearGradient>
          <linearGradient id="notebookCanopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#66bb6a"/>
            <stop offset="50%" stop-color="#43a047"/>
            <stop offset="100%" stop-color="#2e7d32"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },
  'E': {
    letter: 'E',
    lowercase: 'e',
    word: 'ELEFANTE',
    phonetic: 'E de Elefante',
    icon: '🐘',
    tutorialStrokes: [
      { name: 'Paso 1: Poste Vertical', from: { x: 0.1184, y: 0.1786 }, to: { x: 0.1184, y: 0.7738 } },
      { name: 'Paso 2: Barra Superior', from: { x: 0.1184, y: 0.1786 }, to: { x: 0.2829, y: 0.1786 } },
      { name: 'Paso 3: Barra Central', from: { x: 0.1184, y: 0.4762 }, to: { x: 0.2566, y: 0.4762 } },
      { name: 'Paso 4: Barra Inferior', from: { x: 0.1184, y: 0.7738 }, to: { x: 0.2829, y: 0.7738 } }
    ],
    uppercaseStrokes: [
      {
        id: 'E1',
        step: 1,
        arrow: '↓',
        label: '1',
        description: 'Poste vertical hacia abajo',
        points: [
          { x: 0.1184, y: 0.1786 },
          { x: 0.1184, y: 0.4762 },
          { x: 0.1184, y: 0.7738 }
        ]
      },
      {
        id: 'E2',
        step: 2,
        arrow: '➔',
        label: '2',
        description: 'Barra superior de izquierda a derecha',
        points: [
          { x: 0.1184, y: 0.1786 },
          { x: 0.2000, y: 0.1786 },
          { x: 0.2829, y: 0.1786 }
        ]
      },
      {
        id: 'E3',
        step: 3,
        arrow: '➔',
        label: '3',
        description: 'Barra central de izquierda a derecha',
        points: [
          { x: 0.1184, y: 0.4762 },
          { x: 0.1868, y: 0.4762 },
          { x: 0.2566, y: 0.4762 }
        ]
      },
      {
        id: 'E4',
        step: 4,
        arrow: '➔',
        label: '4',
        description: 'Barra inferior de izquierda a derecha',
        points: [
          { x: 0.1184, y: 0.7738 },
          { x: 0.2000, y: 0.7738 },
          { x: 0.2829, y: 0.7738 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'e1',
        step: 1,
        arrow: '➔',
        label: '1',
        description: 'Barra horizontal central',
        points: [
          { x: 0.4342, y: 0.5952 },
          { x: 0.4895, y: 0.5952 },
          { x: 0.5447, y: 0.5952 }
        ]
      },
      {
        id: 'e2',
        step: 2,
        arrow: '↺',
        label: '2',
        description: 'Arco y curva redonda de la e',
        points: [
          { x: 0.5447, y: 0.5952 },
          { x: 0.4868, y: 0.4905 },
          { x: 0.4289, y: 0.5952 },
          { x: 0.4868, y: 0.7000 },
          { x: 0.5395, y: 0.6548 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg elephant-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <ellipse cx="100" cy="205" rx="55" ry="10" fill="#cfd8dc"/>
        <ellipse cx="95" cy="140" rx="50" ry="42" fill="#78909c" stroke="#455a64" stroke-width="3"/>
        <circle cx="135" cy="110" r="32" fill="#78909c" stroke="#455a64" stroke-width="3"/>
        <ellipse cx="118" cy="115" rx="20" ry="26" fill="#90a4ae" stroke="#455a64" stroke-width="2.5"/>
        <path d="M 155 125 C 175 145 170 175 155 180 C 145 185 142 170 152 165 C 160 160 162 145 150 135 Z" fill="#78909c" stroke="#455a64" stroke-width="2.5"/>
        <circle cx="145" cy="102" r="4" fill="#263238"/>
        <circle cx="146.5" cy="100.5" r="1.5" fill="#ffffff"/>
        <rect x="65" y="165" width="16" height="38" rx="6" fill="#607d8b"/>
        <rect x="95" y="165" width="16" height="38" rx="6" fill="#607d8b"/>
        <rect x="120" y="165" width="16" height="38" rx="6" fill="#607d8b"/>
      </svg>
    `
  },
  'I': {
    letter: 'I',
    lowercase: 'i',
    word: 'ISLA',
    phonetic: 'I de Isla',
    icon: '🏝️',
    tutorialStrokes: [
      { name: 'Paso 1: Barra Superior', from: { x: 0.1250, y: 0.1786 }, to: { x: 0.2697, y: 0.1786 } },
      { name: 'Paso 2: Poste Central', from: { x: 0.1974, y: 0.1786 }, to: { x: 0.1974, y: 0.7738 } },
      { name: 'Paso 3: Barra Inferior', from: { x: 0.1250, y: 0.7738 }, to: { x: 0.2697, y: 0.7738 } }
    ],
    uppercaseStrokes: [
      {
        id: 'I1',
        step: 1,
        arrow: '➔',
        label: '1',
        description: 'Barra superior de izquierda a derecha',
        points: [
          { x: 0.1250, y: 0.1786 },
          { x: 0.1974, y: 0.1786 },
          { x: 0.2697, y: 0.1786 }
        ]
      },
      {
        id: 'I2',
        step: 2,
        arrow: '↓',
        label: '2',
        description: 'Poste central vertical hacia abajo',
        points: [
          { x: 0.1974, y: 0.1786 },
          { x: 0.1974, y: 0.4762 },
          { x: 0.1974, y: 0.7738 }
        ]
      },
      {
        id: 'I3',
        step: 3,
        arrow: '➔',
        label: '3',
        description: 'Barra inferior de izquierda a derecha',
        points: [
          { x: 0.1250, y: 0.7738 },
          { x: 0.1974, y: 0.7738 },
          { x: 0.2697, y: 0.7738 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'i1',
        step: 1,
        arrow: '↓',
        label: '1',
        description: 'Poste vertical minúscula hacia abajo',
        points: [
          { x: 0.4868, y: 0.4524 },
          { x: 0.4868, y: 0.6143 },
          { x: 0.4868, y: 0.7738 }
        ]
      },
      {
        id: 'i2',
        step: 2,
        arrow: '●',
        label: '2',
        isDot: true,
        description: 'Puntito de la i',
        points: [
          { x: 0.4868, y: 0.3214 },
          { x: 0.4868, y: 0.3250 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg island-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <ellipse cx="100" cy="180" rx="75" ry="25" fill="#ffe082" stroke="#ffb300" stroke-width="3"/>
        <path d="M 100 170 Q 110 110 90 70" stroke="#795548" stroke-width="8" stroke-linecap="round" fill="none"/>
        <ellipse cx="75" cy="55" rx="26" ry="10" fill="#4caf50" transform="rotate(-30 75 55)"/>
        <ellipse cx="105" cy="50" rx="26" ry="10" fill="#4caf50" transform="rotate(15 105 50)"/>
        <ellipse cx="80" cy="75" rx="22" ry="9" fill="#388e3c" transform="rotate(-65 80 75)"/>
        <ellipse cx="115" cy="70" rx="22" ry="9" fill="#388e3c" transform="rotate(45 115 70)"/>
      </svg>
    `
  },
  'O': {
    letter: 'O',
    lowercase: 'o',
    word: 'OSO',
    phonetic: 'O de Oso',
    icon: '🐻',
    tutorialStrokes: [
      { name: 'Paso 1: Círculo Completo', from: { x: 0.1974, y: 0.2143 }, to: { x: 0.1974, y: 0.7381 } }
    ],
    uppercaseStrokes: [
      {
        id: 'O1',
        step: 1,
        arrow: '↺',
        label: '1',
        description: 'Círculo grande completo antihorario',
        points: [
          { x: 0.1974, y: 0.2143 },
          { x: 0.1118, y: 0.4762 },
          { x: 0.1974, y: 0.7381 },
          { x: 0.2829, y: 0.4762 },
          { x: 0.1974, y: 0.2143 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'o1',
        step: 1,
        arrow: '↺',
        label: '1',
        description: 'Círculo pequeño completo antihorario',
        points: [
          { x: 0.4868, y: 0.4905 },
          { x: 0.4289, y: 0.5952 },
          { x: 0.4868, y: 0.7000 },
          { x: 0.5447, y: 0.5952 },
          { x: 0.4868, y: 0.4905 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg bear-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <circle cx="65" cy="75" r="16" fill="#6d4c41"/>
        <circle cx="65" cy="75" r="9" fill="#d7ccc8"/>
        <circle cx="135" cy="75" r="16" fill="#6d4c41"/>
        <circle cx="135" cy="75" r="9" fill="#d7ccc8"/>
        <circle cx="100" cy="115" r="48" fill="#795548" stroke="#4e342e" stroke-width="3"/>
        <ellipse cx="100" cy="128" rx="22" ry="16" fill="#d7ccc8"/>
        <ellipse cx="100" cy="120" rx="9" ry="6" fill="#3e2723"/>
        <circle cx="82" cy="105" r="4" fill="#212121"/>
        <circle cx="118" cy="105" r="4" fill="#212121"/>
      </svg>
    `
  },
  'U': {
    letter: 'U',
    lowercase: 'u',
    word: 'UVA',
    phonetic: 'U de Uva',
    icon: '🍇',
    tutorialStrokes: [
      { name: 'Paso 1: Curva de U', from: { x: 0.1184, y: 0.1786 }, to: { x: 0.2763, y: 0.1786 } }
    ],
    uppercaseStrokes: [
      {
        id: 'U1',
        step: 1,
        arrow: '↷',
        label: '1',
        description: 'Curva amplia de la U mayúscula',
        points: [
          { x: 0.1184, y: 0.1786 },
          { x: 0.1184, y: 0.5476 },
          { x: 0.1974, y: 0.7619 },
          { x: 0.2763, y: 0.5476 },
          { x: 0.2763, y: 0.1786 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'u1',
        step: 1,
        arrow: '↷',
        label: '1',
        description: 'Curva pequeña de la u minúscula',
        points: [
          { x: 0.4342, y: 0.4405 },
          { x: 0.4342, y: 0.6429 },
          { x: 0.4868, y: 0.7524 },
          { x: 0.5395, y: 0.6429 },
          { x: 0.5395, y: 0.4405 }
        ]
      },
      {
        id: 'u2',
        step: 2,
        arrow: '↓',
        label: '2',
        description: 'Poste vertical derecho de la u',
        points: [
          { x: 0.5395, y: 0.4405 },
          { x: 0.5395, y: 0.6000 },
          { x: 0.5395, y: 0.7619 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg grapes-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <path d="M 100 45 Q 105 25 125 20" stroke="#5d4037" stroke-width="4" stroke-linecap="round" fill="none"/>
        <ellipse cx="85" cy="40" rx="18" ry="10" fill="#4caf50" transform="rotate(-20 85 40)"/>
        <g fill="#7b1fa2" stroke="#4a148c" stroke-width="2">
          <circle cx="80" cy="70" r="14"/>
          <circle cx="102" cy="68" r="14"/>
          <circle cx="124" cy="70" r="14"/>
          <circle cx="91" cy="94" r="14"/>
          <circle cx="113" cy="94" r="14"/>
          <circle cx="102" cy="118" r="14"/>
        </g>
      </svg>
    `
  },
  'M': {
    letter: 'M',
    lowercase: 'm',
    word: 'MANZANA',
    phonetic: 'M de Manzana',
    icon: '🍎',
    getSurpriseSvg: () => `
      <svg class="surprise-svg apple-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <path d="M 100 45 Q 105 25 120 18" stroke="#5d4037" stroke-width="5" stroke-linecap="round" fill="none"/>
        <ellipse cx="118" cy="32" rx="16" ry="9" fill="#4caf50" transform="rotate(-30 118 32)"/>
        <path d="M 100 65 C 80 50 40 60 40 110 C 40 165 75 195 100 195 C 125 195 160 165 160 110 C 160 60 120 50 100 65 Z" fill="#e53935" stroke="#b71c1c" stroke-width="3"/>
        <ellipse cx="75" cy="95" rx="10" ry="18" fill="#ff8a80" opacity="0.6"/>
      </svg>
    `
  },
  'S': {
    letter: 'S',
    lowercase: 's',
    word: 'SOL',
    phonetic: 'S de Sol',
    icon: '☀️',
    getSurpriseSvg: () => `
      <svg class="surprise-svg sun-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <g stroke="#f57c00" stroke-width="4" stroke-linecap="round">
          <line x1="100" y1="25" x2="100" y2="45"/>
          <line x1="100" y1="175" x2="100" y2="195"/>
          <line x1="25" y1="110" x2="45" y2="110"/>
          <line x1="155" y1="110" x2="175" y2="110"/>
          <line x1="45" y1="55" x2="60" y2="70"/>
          <line x1="140" y1="150" x2="155" y2="165"/>
          <line x1="155" y1="55" x2="140" y2="70"/>
          <line x1="45" y1="165" x2="60" y2="150"/>
        </g>
        <circle cx="100" cy="110" r="50" fill="#fbc02d" stroke="#f57c00" stroke-width="3"/>
        <circle cx="85" cy="100" r="6" fill="#e65100"/>
        <circle cx="115" cy="100" r="6" fill="#e65100"/>
        <path d="M 85 122 Q 100 138 115 122" stroke="#e65100" stroke-width="4" fill="none" stroke-linecap="round"/>
      </svg>
    `
  },
  'T': {
    letter: 'T',
    lowercase: 't',
    word: 'TORTUGA',
    phonetic: 'T de Tortuga',
    icon: '🐢',
    getSurpriseSvg: () => `
      <svg class="surprise-svg turtle-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Patitas -->
        <ellipse cx="65" cy="85" rx="14" ry="10" fill="#81c784"/>
        <ellipse cx="135" cy="85" rx="14" ry="10" fill="#81c784"/>
        <ellipse cx="65" cy="145" rx="14" ry="10" fill="#81c784"/>
        <ellipse cx="135" cy="145" rx="14" ry="10" fill="#81c784"/>
        <!-- Cabeza -->
        <ellipse cx="100" cy="60" rx="16" ry="18" fill="#81c784" stroke="#388e3c" stroke-width="2"/>
        <circle cx="94" cy="55" r="3" fill="#1b5e20"/>
        <circle cx="106" cy="55" r="3" fill="#1b5e20"/>
        <!-- Caparazón -->
        <ellipse cx="100" cy="115" rx="45" ry="38" fill="#4caf50" stroke="#2e7d32" stroke-width="3"/>
        <polygon points="100,90 120,105 112,130 88,130 80,105" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/>
      </svg>
    `
  },
  'L': {
    letter: 'L',
    lowercase: 'l',
    word: 'LEÓN',
    phonetic: 'L de León',
    icon: '🦁',
    getSurpriseSvg: () => `
      <svg class="surprise-svg lion-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Melena -->
        <circle cx="100" cy="110" r="58" fill="#ff9800" stroke="#e65100" stroke-width="3"/>
        <!-- Cara -->
        <circle cx="100" cy="110" r="42" fill="#ffd54f" stroke="#f57f17" stroke-width="2.5"/>
        <circle cx="86" cy="100" r="5" fill="#3e2723"/>
        <circle cx="114" cy="100" r="5" fill="#3e2723"/>
        <polygon points="100,110 93,122 107,122" fill="#d84315"/>
        <path d="M 93 125 Q 100 132 107 125" stroke="#3e2723" stroke-width="3" fill="none"/>
      </svg>
    `
  },
  'P': {
    letter: 'P',
    lowercase: 'p',
    word: 'PELOTA',
    phonetic: 'P de Pelota',
    icon: '⚽',
    getSurpriseSvg: () => `
      <svg class="surprise-svg ball-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <circle cx="100" cy="110" r="52" fill="#ffffff" stroke="#212121" stroke-width="3"/>
        <polygon points="100,85 118,98 111,118 89,118 82,98" fill="#212121"/>
        <line x1="100" y1="85" x2="100" y2="58" stroke="#212121" stroke-width="2.5"/>
        <line x1="118" y1="98" x2="145" y2="90" stroke="#212121" stroke-width="2.5"/>
        <line x1="111" y1="118" x2="135" y2="142" stroke="#212121" stroke-width="2.5"/>
        <line x1="89" y1="118" x2="65" y2="142" stroke="#212121" stroke-width="2.5"/>
        <line x1="82" y1="98" x2="55" y2="90" stroke="#212121" stroke-width="2.5"/>
      </svg>
    `
  },
  'N': {
    letter: 'N',
    lowercase: 'n',
    word: 'NUBE',
    phonetic: 'N de Nube',
    icon: '☁️',
    getSurpriseSvg: () => `
      <svg class="surprise-svg cloud-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <path d="M 60 130 C 45 130 35 118 35 105 C 35 92 48 82 62 82 C 68 65 85 52 105 52 C 128 52 145 68 150 88 C 162 90 172 100 172 112 C 172 125 160 130 148 130 Z" fill="#e1f5fe" stroke="#0288d1" stroke-width="3"/>
        <circle cx="85" cy="98" r="4" fill="#0277bd"/>
        <circle cx="120" cy="98" r="4" fill="#0277bd"/>
        <path d="M 95 110 Q 102 118 110 110" stroke="#0277bd" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `
  },
  'R': {
    letter: 'R',
    lowercase: 'r',
    word: 'RATÓN',
    phonetic: 'R de Ratón',
    icon: '🐭',
    getSurpriseSvg: () => `
      <svg class="surprise-svg mouse-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <circle cx="68" cy="75" r="22" fill="#b0bec5" stroke="#546e7a" stroke-width="2"/>
        <circle cx="68" cy="75" r="13" fill="#ffab91"/>
        <circle cx="132" cy="75" r="22" fill="#b0bec5" stroke="#546e7a" stroke-width="2"/>
        <circle cx="132" cy="75" r="13" fill="#ffab91"/>
        <ellipse cx="100" cy="115" rx="38" ry="32" fill="#cfd8dc" stroke="#546e7a" stroke-width="2.5"/>
        <circle cx="88" cy="108" r="4" fill="#263238"/>
        <circle cx="112" cy="108" r="4" fill="#263238"/>
        <polygon points="100,118 94,126 106,126" fill="#e91e63"/>
      </svg>
    `
  }
};

/**
 * Obtiene los datos pedagógicos completos para una letra
 */
export function getPedagogicalLetter(letter) {
  const char = (letter || 'A').toUpperCase();
  const lower = char.toLowerCase();

  // Bounding boxes escolares estándar (W=760, H=420)
  // Letra mayúscula a la izquierda, minúscula a la derecha
  const upperBounds = { x: 70, y: 70, width: 200, height: 260 };
  const lowerBounds = { x: 290, y: 110, width: 170, height: 220 };

  const upperStrokes = StrokeGenerator.getStrokes(char, upperBounds, true);
  const lowerStrokes = StrokeGenerator.getStrokes(lower, lowerBounds, false);

  if (PEDAGOGICAL_LETTERS[char]) {
    const p = PEDAGOGICAL_LETTERS[char];
    return {
      letter: char,
      lowercase: lower,
      word: p.word,
      phonetic: p.phonetic,
      icon: p.icon,
      uppercaseStrokes: upperStrokes,
      lowercaseStrokes: lowerStrokes,
      getSurpriseSvg: p.getSurpriseSvg
    };
  }

  // Generador dinámico para cualquier otra letra del abecedario
  return {
    letter: char,
    lowercase: lower,
    word: `LETRA ${char}`,
    phonetic: `${char} de Estrella`,
    icon: '⭐',
    uppercaseStrokes: upperStrokes,
    lowercaseStrokes: lowerStrokes,
    getSurpriseSvg: () => `
      <svg class="surprise-svg generic-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <polygon points="100,25 123,75 178,83 138,122 148,176 100,150 52,176 62,122 22,83 77,75" fill="#ffd54f" stroke="#ff8f00" stroke-width="4"/>
        <text x="100" y="125" font-size="44" font-weight="900" fill="#e65100" text-anchor="middle">${char}</text>
      </svg>
    `
  };
}
