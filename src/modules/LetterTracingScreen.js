/**
 * LetterTracingScreen.js - Módulo de Trazado de Letras y Caligrafía Escolar
 * Reconstruido con el Motor Universal StrokeGenerator para máxima fluidez,
 * precisión pedagógica y cero frustración en niños de preescolar.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';
import { ArabotAssistant } from '../components/ArabotAssistant.js';
import { getPedagogicalLetter } from '../core/LetterWaypoints.js';
import { StrokeGenerator } from '../core/StrokeGenerator.js';

// ============================================================================
// 1. CATÁLOGO DE SUB-JUEGOS EN CÍRCULOS
// ============================================================================
export const TRACING_SUBGAMES = [
  {
    id: 'vocales_cuadernillo',
    moduleKey: 'tracing_vocales_workbook',
    title: 'CUADERNILLO: LAS 5 VOCALES',
    subtitle: 'A, E, I, O, U • Réplica fiel del libro MundoABC',
    icon: '📖',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#e91e63',
    description: 'Digitalización fiel: letra grande con sorpresa ilustrada y renglones caligráficos escolares sobre cuadrícula.'
  },
  {
    id: 'consonantes_cuadernillo',
    moduleKey: 'tracing_consonantes_workbook',
    title: 'CUADERNILLO: CONSONANTES',
    subtitle: 'M, S, T, L, P, N, R, D, C, B... sobre cuadrícula',
    icon: '🔤',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#1976d2',
    description: 'Aprende a trazar todas las consonantes del cuadernillo escolar y sus renglones caligráficos.'
  },
  {
    id: 'generador_trazos',
    moduleKey: 'tracing_generador_trazos',
    title: 'GENERADOR DE TRAZOS',
    subtitle: '✨ ¡Crea y traza cualquier letra, número o palabra!',
    icon: '✨',
    totalLevels: 1,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#8e24aa',
    description: 'Herramienta interactiva para generar instantáneamente actividades de trazado para cualquier letra, dígito o palabra personalizada.'
  },
  {
    id: 'grafomotricidad',
    moduleKey: 'tracing_grafomotricidad',
    title: 'GRAFOMOTRICIDAD PREESCOLAR',
    subtitle: 'Líneas, olas, cruces, zig-zag y espirales',
    icon: '〰️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#00acc1',
    description: 'Ejercicios de soltura de muñeca y motricidad fina recomendados para preescolar.'
  },
  {
    id: 'letra_m',
    moduleKey: 'tracing_letra_m',
    title: 'LETRA M',
    subtitle: 'Mamá • Ma, Me, Mi, Mo, Mu',
    icon: '🍎',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#e53935',
    description: 'Trazos de la letra M y sus sílabas con la Manzana.'
  },
  {
    id: 'letra_s',
    moduleKey: 'tracing_letra_s',
    title: 'LETRA S',
    subtitle: 'Sol, Sapo • Sa, Se, Si, So, Su',
    icon: '☀️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#ff9800',
    description: 'Trazos ondulados y divertidos de la letra S con el Sol.'
  },
  {
    id: 'letra_t',
    moduleKey: 'tracing_letra_t',
    title: 'LETRA T',
    subtitle: 'Tortuga • Ta, Te, Ti, To, Tu',
    icon: '🐢',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#43a047',
    description: 'Trazos rectos y firmes de la letra T con la Tortuga.'
  },
  {
    id: 'letra_l',
    moduleKey: 'tracing_letra_l',
    title: 'LETRA L',
    subtitle: 'León, Luna • La, Le, Li, Lo, Lu',
    icon: '🦁',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#fbc02d',
    description: 'Trazos altos y elegantes de la letra L con el León.'
  },
  {
    id: 'letra_p',
    moduleKey: 'tracing_letra_p',
    title: 'LETRA P',
    subtitle: 'Pelota, Papá • Pa, Pe, Pi, Po, Pu',
    icon: '⚽',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#8e24aa',
    description: 'Trazos de poste y pancita redonda de la letra P con la Pelota.'
  },
  {
    id: 'letra_n',
    moduleKey: 'tracing_letra_n',
    title: 'LETRA N',
    subtitle: 'Nube, Nido • Na, Ne, Ni, No, Nu',
    icon: '☁️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#00acc1',
    description: 'Trazos de arquito de la letra N con la Nube.'
  },
  {
    id: 'letra_r',
    moduleKey: 'tracing_letra_r',
    title: 'LETRA R',
    subtitle: 'Ratón, Rana • Ra, Re, Ri, Ro, Ru',
    icon: '🐭',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#d81b60',
    description: 'Trazos con gancho y fuerza de la letra R con el Ratón.'
  },
  {
    id: 'pizarra_magica',
    moduleKey: 'tracing_pizarra_magica',
    title: 'PIZARRA MÁGICA ESCOLAR',
    subtitle: 'Dibujo libre y práctica con 6 crayones',
    icon: '🎨',
    totalLevels: 1,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#3949ab',
    description: 'Cuaderno abierto con cuadrícula escolar y crayones de colores para trazar y dibujar libremente.'
  }
];

// ============================================================================
// 2. NIVELES PEDAGÓGICOS DEL CUADERNILLO DE VOCALES (50 NIVELES EXACTOS AL LIBRO)
// ============================================================================
export const VOCALES_WORKBOOK_LEVELS = [
  // Letra A (Página 3 de MundoABC)
  { id: 1, type: 'intro_hollow', letter: 'A', lowercase: 'a', word: 'ÁRBOL', phonetic: 'A de Árbol', icon: '🌳', title: 'A de Árbol • Letra Grande', instruction: '✏️ Sigue las flechas 1, 2 y 3 para trazar la A y colorear el Árbol.' },
  { id: 2, type: 'grid_row', char: 'A', count: 8, title: 'Renglón 1: Letra A Mayúscula', instruction: '✏️ Traza las 8 letras A mayúsculas sobre la cuadrícula.' },
  { id: 3, type: 'grid_row', char: 'a', count: 12, title: 'Renglón 2: Letra a Minúscula', instruction: '✏️ Traza las 12 letras a redonditas con su palito vertical.' },
  { id: 4, type: 'grid_row', char: 'A', count: 8, title: 'Renglón 3: Refuerzo de A Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando las 8 letras A mayúsculas.' },
  { id: 5, type: 'grid_row_alternating', pattern: ['A', 'a', 'A', 'a', 'A', 'a', 'A', 'a', 'A', 'a'], title: 'Renglón 4: Alternado A - a', instruction: '✏️ Traza alternando A mayúscula y a minúscula.' },

  // Letra E (Página 6)
  { id: 6, type: 'intro_hollow', letter: 'E', lowercase: 'e', word: 'ELEFANTE', phonetic: 'E de Elefante', icon: '🐘', title: 'E de Elefante • Letra Grande', instruction: '✏️ Sigue las flechas para trazar la E y colorear el Elefante.' },
  { id: 7, type: 'grid_row', char: 'E', count: 8, title: 'Renglón 1: Letra E Mayúscula', instruction: '✏️ Traza las 8 letras E mayúsculas sobre la cuadrícula.' },
  { id: 8, type: 'grid_row', char: 'e', count: 12, title: 'Renglón 2: Letra e Minúscula', instruction: '✏️ Traza las 12 letras e sobre la cuadrícula.' },
  { id: 9, type: 'grid_row', char: 'E', count: 8, title: 'Renglón 3: Refuerzo de E Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando las 8 letras E.' },
  { id: 10, type: 'grid_row_alternating', pattern: ['E', 'e', 'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e'], title: 'Renglón 4: Alternado E - e', instruction: '✏️ Traza alternando E mayúscula y e minúscula.' },

  // Letra I (Página 9)
  { id: 11, type: 'intro_hollow', letter: 'I', lowercase: 'i', word: 'ISLA', phonetic: 'I de Isla', icon: '🏝️', title: 'I de Isla • Letra Grande', instruction: '✏️ Sigue las flechas para trazar la I y colorear la Isla.' },
  { id: 12, type: 'grid_row', char: 'I', count: 8, title: 'Renglón 1: Letra I Mayúscula', instruction: '✏️ Traza las 8 letras I mayúsculas sobre el renglón.' },
  { id: 13, type: 'grid_row', char: 'i', count: 12, title: 'Renglón 2: Letra i Minúscula', instruction: '✏️ Traza las 12 letras i con su puntito.' },
  { id: 14, type: 'grid_row', char: 'I', count: 8, title: 'Renglón 3: Refuerzo de I Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando la I.' },
  { id: 15, type: 'grid_row_alternating', pattern: ['I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i'], title: 'Renglón 4: Alternado I - i', instruction: '✏️ Traza alternando I mayúscula e i minúscula.' },

  // Letra O (Página 12)
  { id: 16, type: 'intro_hollow', letter: 'O', lowercase: 'o', word: 'OSO', phonetic: 'O de Oso', icon: '🐻', title: 'O de Oso • Letra Grande', instruction: '✏️ Traza la O y la o redonditas para colorear el Oso.' },
  { id: 17, type: 'grid_row', char: 'O', count: 8, title: 'Renglón 1: Letra O Mayúscula', instruction: '✏️ Traza los 8 círculos grandes de la O mayúscula.' },
  { id: 18, type: 'grid_row', char: 'o', count: 12, title: 'Renglón 2: Letra o Minúscula', instruction: '✏️ Traza los 12 círculos pequeños de la o minúscula.' },
  { id: 19, type: 'grid_row', char: 'O', count: 8, title: 'Renglón 3: Refuerzo de O Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando la O.' },
  { id: 20, type: 'grid_row_alternating', pattern: ['O', 'o', 'O', 'o', 'O', 'o', 'O', 'o', 'O', 'o'], title: 'Renglón 4: Alternado O - o', instruction: '✏️ Traza alternando O mayúscula y o minúscula.' },

  // Letra U (Página 15)
  { id: 21, type: 'intro_hollow', letter: 'U', lowercase: 'u', word: 'UVA', phonetic: 'U de Uva', icon: '🍇', title: 'U de Uva • Letra Grande', instruction: '✏️ Sigue las flechas para trazar la U y colorear las Uvas.' },
  { id: 22, type: 'grid_row', char: 'U', count: 8, title: 'Renglón 1: Letra U Mayúscula', instruction: '✏️ Traza las 8 curvas de la U mayúscula.' },
  { id: 23, type: 'grid_row', char: 'u', count: 12, title: 'Renglón 2: Letra u Minúscula', instruction: '✏️ Traza las 12 letras u con su patita derecha.' },
  { id: 24, type: 'grid_row', char: 'U', count: 8, title: 'Renglón 3: Refuerzo de U Mayúscula', instruction: '✏️ Refuerza tu caligrafía con la letra U.' },
  { id: 25, type: 'grid_row_alternating', pattern: ['U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u'], title: 'Renglón 4: Alternado U - u', instruction: '✏️ Traza alternando U mayúscula y u minúscula.' }
];

// Completar los 50 niveles de vocales con series combinadas y desafíos
(() => {
  const vUpper = ['A', 'E', 'I', 'O', 'U'];
  const vLower = ['a', 'e', 'i', 'o', 'u'];

  for (let i = 26; i <= 50; i++) {
    const isPair = (i % 2 === 0);
    const pattern = isPair
      ? ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u']
      : ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'];

    VOCALES_WORKBOOK_LEVELS.push({
      id: i,
      type: 'grid_row_alternating',
      pattern: pattern,
      title: `Desafío Vocálico ${i}: Serie Completa`,
      instruction: '✏️ Traza con precisión la serie completa de las 5 vocales.'
    });
  }
})();

// Generador de 50 niveles para consonantes y letras individuales
function buildConsonante50Levels(letterChar, word, phonetic, icon) {
  const levels = [];
  const c = letterChar.toUpperCase();
  const lower = c.toLowerCase();

  // Nivel 1: Letra Grande con Sorpresa ilustrada
  levels.push({
    id: 1,
    type: 'intro_hollow',
    letter: c,
    lowercase: lower,
    word: word,
    phonetic: phonetic,
    icon: icon,
    title: `${phonetic} • Letra Grande`,
    instruction: `✏️ Sigue las flechas numeradas para trazar la ${c} y colorear el dibujo.`
  });

  // Nivel 2: Renglón mayúsculas (8)
  levels.push({
    id: 2,
    type: 'grid_row',
    char: c,
    count: 8,
    title: `Renglón 1: Letra ${c} Mayúscula`,
    instruction: `✏️ Traza las 8 letras ${c} sobre la cuadrícula del cuaderno.`
  });

  // Nivel 3: Renglón minúsculas (12)
  levels.push({
    id: 3,
    type: 'grid_row',
    char: lower,
    count: 12,
    title: `Renglón 2: Letra ${lower} Minúscula`,
    instruction: `✏️ Traza las 12 letras ${lower} sobre el renglón escolar.`
  });

  // Nivel 4: Refuerzo mayúsculas (8)
  levels.push({
    id: 4,
    type: 'grid_row',
    char: c,
    count: 8,
    title: `Renglón 3: Refuerzo de ${c}`,
    instruction: `✏️ Refuerza tu caligrafía trazando la ${c}.`
  });

  // Nivel 5: Alternado mayúscula / minúscula
  levels.push({
    id: 5,
    type: 'grid_row_alternating',
    pattern: [c, lower, c, lower, c, lower, c, lower],
    title: `Renglón 4: Alternado ${c} - ${lower}`,
    instruction: `✏️ Traza alternando ${c} mayúscula y ${lower} minúscula.`
  });

  // Niveles 6 a 50: Sílabas y combinaciones
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const lowerVowels = ['a', 'e', 'i', 'o', 'u'];

  for (let i = 6; i <= 50; i++) {
    const vIdx = (i - 6) % 5;
    const v = vowels[vIdx];
    const lv = lowerVowels[vIdx];

    if (i <= 10) {
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [c, v, c, v, c, v, c, v],
        title: `Renglón Sílaba: ${c}${v}`,
        instruction: `✏️ Traza la sílaba ${c}${v} sobre la cuadrícula.`
      });
    } else if (i <= 15) {
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [lower, lv, lower, lv, lower, lv, lower, lv],
        title: `Renglón Sílaba Minúscula: ${lower}${lv}`,
        instruction: `✏️ Traza las sílabas minúsculas ${lower}${lv}.`
      });
    } else {
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [c, lower, c, lower, c, lower, c, lower],
        title: `Desafío de Caligrafía ${i}: Letra ${c}`,
        instruction: `✏️ Completa el renglón ${i} del cuaderno escolar.`
      });
    }
  }

  return levels;
}

// 50 Niveles de Grafomotricidad
export const GRAFOMOTRICIDAD_LEVELS = (() => {
  const patterns = ['lineas_verticales', 'lineas_horizontales', 'cruces', 'olas_mar', 'montañas_zigzag', 'espiral'];
  const titles = [
    'Palitos Verticales (Lluvia)',
    'Líneas Horizontales (Caminos)',
    'Cruces y Signos Más',
    'Olas del Mar (Curvas Suaves)',
    'Montañas en Zig-Zag',
    'Caracoles y Espirales'
  ];

  const list = [];
  for (let i = 1; i <= 50; i++) {
    const pIdx = (i - 1) % patterns.length;
    list.push({
      id: i,
      type: 'pattern_trace',
      patternKey: patterns[pIdx],
      title: `Grafomotricidad ${i}: ${titles[pIdx]}`,
      instruction: '✏️ Sigue la dirección de las flechas y realiza los trazos preparatorios.'
    });
  }
  return list;
})();

export const CONSONANTES_WORKBOOK_LEVELS = buildConsonante50Levels('M', 'MANZANA', 'M de Manzana', '🍎');

// Diccionario de niveles de los subjuegos
export const SUBGAMES_LEVEL_MAP = {
  vocales_cuadernillo: VOCALES_WORKBOOK_LEVELS,
  consonantes_cuadernillo: CONSONANTES_WORKBOOK_LEVELS,
  grafomotricidad: GRAFOMOTRICIDAD_LEVELS,
  letra_m: buildConsonante50Levels('M', 'MANZANA', 'M de Manzana', '🍎'),
  letra_s: buildConsonante50Levels('S', 'SOL', 'S de Sol', '☀️'),
  letra_t: buildConsonante50Levels('T', 'TORTUGA', 'T de Tortuga', '🐢'),
  letra_l: buildConsonante50Levels('L', 'LEÓN', 'L de León', '🦁'),
  letra_p: buildConsonante50Levels('P', 'PELOTA', 'P de Pelota', '⚽'),
  letra_n: buildConsonante50Levels('N', 'NUBE', 'N de Nube', '☁️'),
  letra_r: buildConsonante50Levels('R', 'RATÓN', 'R de Ratón', '🐭')
};

// ============================================================================
// 3. CLASE PRINCIPAL: LETTER TRACING SCREEN
// ============================================================================
export class LetterTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();

    // Estado de navegación
    this.activeSubgame = null; // null = menú de subjuegos en círculos
    this.currentLevel = null;  // 1..50

    // Configuración activa
    this.levelConfig = null;
    this.pedagogicalData = null;

    // Asistente ARABOT
    this.arabot = null;

    // Lienzos HTML5
    this.bgCanvas = null;
    this.bgCtx = null;
    this.paintCanvas = null;
    this.paintCtx = null;
    this.fxCanvas = null;
    this.fxCtx = null;

    // Estado del motor de trazo
    this.isDrawing = false;
    this.lastPoint = null;
    this.activeCrayonColor = '#e91e63'; // Rosa mexicano brillante tipo crayón

    // Trazos activos gestionados por StrokeGenerator
    this.activeStrokes = [];
    this.currentStrokeIndex = 0;
    this.gridLetters = [];
    this.currentLetterIndex = 0;

    // Para compatibilidad y verificadores
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };
    this.rowLettersCompleted = [];
    this.totalRowLetters = 0;
    this.isIllustrationColored = false;

    // Partículas y animación
    this.sparkles = [];
    this.animFrameId = null;

    // Eventos de puntero
    this.activePointerId = null;
    this.boundPointerMove = null;
    this.boundPointerUp = null;

    // Estado del Generador de Trazos Mágico
    this.generatorTab = 'abecedario';
    this.generatorTarget = 'A';
    this.generatorIsUpper = true;
  }

  // ==========================================================================
  // ORQUESTADOR DE VISTAS
  // ==========================================================================
  render(container) {
    this.student = StorageManager.getActiveStudent();
    this.cleanup();

    // Vista 1: Menú inicial con los subjuegos en círculos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // Vista 2: Generador Mágico de Trazos
    if (this.activeSubgame === 'generador_trazos') {
      this.renderGeneradorTrazos(container);
      return;
    }

    // Vista 3: Pizarra Mágica Escolar (Dibujo libre)
    if (this.activeSubgame === 'pizarra_magica') {
      this.renderPizarraMagica(container);
      return;
    }

    // Vista 4: Selector de 50 niveles
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // Vista 5: Nivel activo del cuadernillo
    this.renderLevelGame(container);
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUBJUEGOS EN CÍRCULOS
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container notebook-grid-bg fade-in" id="tracingSubgamesMenu">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#0d47a1; margin:0; font-size:clamp(1.2rem, 3.2vw, 1.8rem);">CUADERNILLO DE TRAZOS</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#e65100;">
              Elige una actividad en círculo para comenzar • 50 Niveles
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid-10">
            ${TRACING_SUBGAMES.map(game => {
              const prog = StorageManager.getModuleLevels(game.moduleKey);
              const completedCount = Object.keys(prog.completed || {}).length;
              return `
                <button class="subgame-circle-card" data-game="${game.id}">
                  <div class="subgame-bubble ${game.bubbleClass} pulse-glow">
                    <span class="subgame-bubble-icon">${game.icon}</span>
                    <span class="subgame-levels-badge">${game.totalLevels > 1 ? `${game.totalLevels} Niveles` : 'Actividad'}</span>
                  </div>
                  <span class="subgame-title-label" style="color:${game.themeColor};">${game.title}</span>
                  <span style="font-size:0.75rem; color:#455a64; font-weight:bold; margin-top:3px;">
                    ${game.totalLevels > 1 ? `⭐ ${completedCount}/${game.totalLevels} completados` : '¡Toca para entrar!'}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">💡 Toca <strong>Cuadernillo: Las 5 Vocales</strong> o prueba el nuevo <strong>Generador de Trazos ✨</strong>.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
      audio.playClick();
      this.resetState();
      this.navigator.navigate('home');
    });

    container.querySelectorAll('.subgame-circle-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        const gameId = e.currentTarget.dataset.game;
        this.activeSubgame = gameId;
        this.currentLevel = (gameId === 'pizarra_magica' || gameId === 'generador_trazos') ? 1 : null;
        this.render(container);
      });
    });

    audio.speak('Elige una actividad del cuadernillo de trazos');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS
  // ==========================================================================
  renderLevelSelector(container) {
    const subgame = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];

    LevelSelector.render({
      container,
      moduleKey: subgame.moduleKey,
      moduleTitle: subgame.title,
      moduleIcon: subgame.icon,
      title: subgame.title,
      icon: subgame.icon,
      totalLevels: subgame.totalLevels,
      onBackHome: () => {
        audio.playClick();
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      },
      onBack: () => {
        audio.playClick();
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      },
      onSelectLevel: (lvl) => {
        audio.playClick();
        this.currentLevel = lvl;
        this.renderLevelGame(container);
      }
    });
  }

  // ==========================================================================
  // VISTA 3: NIVEL ACTIVO DEL CUADERNILLO ESCOLAR
  // ==========================================================================
  renderLevelGame(container) {
    this.cleanup();

    const levels = SUBGAMES_LEVEL_MAP[this.activeSubgame] || VOCALES_WORKBOOK_LEVELS;
    const idx = Math.max(0, Math.min(this.currentLevel - 1, levels.length - 1));
    this.levelConfig = levels[idx];

    const isIntro = (this.levelConfig.type === 'intro_hollow');
    const letterChar = this.levelConfig.letter || this.levelConfig.char || 'A';
    this.pedagogicalData = getPedagogicalLetter(letterChar);

    // Reinicio de estados del nivel
    this.isDrawing = false;
    this.lastPoint = null;
    this.isIllustrationColored = false;
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="tracingModule">
        <!-- Encabezado con ARABOT centrado y paleta de crayones -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          
          <div class="arabot-top-anchor" id="arabotAnchor">
            <!-- ARABOT montado aquí -->
          </div>

          <div class="header-actions">
            <!-- Mini paleta de crayones escolares -->
            <div class="mini-crayons-bar">
              <button class="mini-crayon active" data-color="#e91e63" style="background:#e91e63;" title="Rosa Cemento"></button>
              <button class="mini-crayon" data-color="#ff5722" style="background:#ff5722;" title="Naranja"></button>
              <button class="mini-crayon" data-color="#4caf50" style="background:#4caf50;" title="Verde"></button>
              <button class="mini-crayon" data-color="#00bcd4" style="background:#00bcd4;" title="Azul"></button>
              <button class="mini-crayon" data-color="#9c27b0" style="background:#9c27b0;" title="Morado"></button>
            </div>
            <button class="sound-btn" id="btnPlayLetterAudio">🔊 Escuchar</button>
            <button class="clear-btn" id="btnClearCanvas">🧹 Borrar</button>
          </div>
        </header>

        <!-- Cuadernillo estilo hoja escolar -->
        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>${(this.levelConfig.title || 'TRAZOS ESCOLARES').toUpperCase()}</h2>
            <p class="notebook-instruction" id="levelInstructionText">
              ${this.levelConfig.instruction || '✏️ Pasa tu dedito sobre las líneas punteadas guiadas.'}
            </p>
          </div>

          <div class="notebook-grid-container" id="notebookGridContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>

            <!-- Zona de sorpresa ilustrada (en niveles intro) -->
            ${isIntro ? `
              <div class="notebook-tree-zone" id="notebookTreeZone">
                ${this.pedagogicalData.getSurpriseSvg ? this.pedagogicalData.getSurpriseSvg() : ''}
                <div class="tree-caption" id="treeCaption">${this.pedagogicalData.phonetic || ''} ${this.pedagogicalData.icon || '⭐'}</div>
              </div>
            ` : `
              <div class="row-progress-counter" id="rowProgressCounter">
                ⭐ Letras completadas: <span id="completedCountLabel">0</span> / <span id="totalLettersCountLabel">1</span>
              </div>
            `}
          </div>
        </main>

        <!-- Banner de transición automática -->
        <div class="auto-transition-banner" id="autoTransitionBanner" style="display:none;">
          <div class="transition-card bounce-in">
            <div class="transition-stars">⭐⭐⭐</div>
            <div class="transition-title">¡EXCELENTE TRABAJO!</div>
            <div class="transition-msg" id="transitionMsg">¡Completaste este ejercicio del cuadernillo!</div>
            <div class="transition-progress-bar">
              <div class="progress-fill" id="transitionProgressFill"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupArabot(container);
    this.setupCanvases(container);
    this.initLevelStrokes();
    this.drawBackground();
    this.startFxLoop();
    this.bindEvents(container);

    setTimeout(() => {
      audio.speak(this.levelConfig.instruction || `Vamos a trazar la letra ${letterChar}`);
    }, 400);
  }

  // ==========================================================================
  // INICIALIZACIÓN DE TRAZOS CON STROKEGENERATOR
  // ==========================================================================
  initLevelStrokes() {
    if (!this.paintCanvas) return;
    const W = this.paintCanvas.width;
    const H = this.paintCanvas.height;

    this.activeStrokes = [];
    this.currentStrokeIndex = 0;
    this.gridLetters = [];
    this.currentLetterIndex = 0;

    // Caso 1: Nivel de inicio de letra (Letra grande hueca con flechas + Árbol)
    if (this.levelConfig.type === 'intro_hollow') {
      const upperBounds = { x: 50, y: 70, width: 200, height: 260 };
      const lowerBounds = { x: 270, y: 110, width: 170, height: 220 };

      const char = this.levelConfig.letter || 'A';
      const uStrokes = StrokeGenerator.getStrokes(char, upperBounds, true).map(s => ({ ...s, isUpper: true }));
      const lStrokes = StrokeGenerator.getStrokes(char.toLowerCase(), lowerBounds, false).map(s => ({ ...s, isUpper: false }));

      this.activeStrokes = [...uStrokes, ...lStrokes];
      this.totalRowLetters = this.activeStrokes.length;
    }
    // Caso 2: Renglón caligráfico de cuaderno (8 o 12 letras)
    else if (this.levelConfig.type === 'grid_row' || this.levelConfig.type === 'grid_row_alternating') {
      const isAlternating = (this.levelConfig.type === 'grid_row_alternating');
      const chars = isAlternating
        ? this.levelConfig.pattern
        : new Array(this.levelConfig.count || 8).fill(this.levelConfig.char || 'A');

      this.totalRowLetters = chars.length;
      this.rowLettersCompleted = new Array(this.totalRowLetters).fill(false);

      const rowBounds = { x: 30, y: 110, width: 700, height: 210 };
      this.gridLetters = StrokeGenerator.generateRowLayout(chars, rowBounds);

      // Los trazos activos son los de la primera letra no completada
      this.currentLetterIndex = 0;
      this.activeStrokes = this.gridLetters[0]?.strokes || [];
      this.currentStrokeIndex = 0;

      const totalLbl = document.getElementById('totalLettersCountLabel');
      if (totalLbl) totalLbl.innerText = `${this.totalRowLetters}`;
      const compLbl = document.getElementById('completedCountLabel');
      if (compLbl) compLbl.innerText = '0';
    }
    // Caso 3: Grafomotricidad
    else if (this.levelConfig.type === 'pattern_trace') {
      const patternBounds = { x: 60, y: 80, width: 640, height: 260 };
      this.activeStrokes = StrokeGenerator.getStrokes(this.levelConfig.patternKey || 'lineas_verticales', patternBounds);
      this.totalRowLetters = this.activeStrokes.length;
    }
  }

  // ==========================================================================
  // DIBUJO DEL FONDO: CUADRÍCULA AZUL + LÍNEAS DE RENGLÓN + GUÍAS DE TRAZO
  // ==========================================================================
  drawBackground() {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Cuadrícula azul escolar (38px x 38px)
    const gridSize = 38;
    ctx.save();
    ctx.strokeStyle = 'rgba(41, 182, 246, 0.22)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Renglón caligráfico de cuaderno si es nivel de renglón
    if (this.levelConfig.type === 'grid_row' || this.levelConfig.type === 'grid_row_alternating') {
      const topY = 110;
      const midY = 215;
      const baseY = 320;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(0, topY, W, baseY - topY);

      // Línea superior azul
      ctx.strokeStyle = '#1565c0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(W, topY);
      ctx.stroke();

      // Línea media punteada
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.stroke();

      // Línea base azul marino
      ctx.strokeStyle = '#0d47a1';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(W, baseY);
      ctx.stroke();
      ctx.restore();

      // Dibujar todas las letras del renglón
      this.gridLetters.forEach((letterItem, idx) => {
        const isCurrentLetter = (idx === this.currentLetterIndex);
        StrokeGenerator.renderStrokeGuides(
          ctx,
          letterItem.strokes,
          isCurrentLetter ? this.currentStrokeIndex : -1,
          '#1565c0'
        );
      });
    } else {
      // Dibujar guías de trazos del nivel intro o grafomotricidad
      StrokeGenerator.renderStrokeGuides(ctx, this.activeStrokes, this.currentStrokeIndex, '#1565c0');
    }
  }

  // ==========================================================================
  // BUCLE DE EFECTOS Y GUÍA ANIMADA (ESTRELLITA VIAJERA)
  // ==========================================================================
  startFxLoop() {
    const loop = () => {
      this.renderFxFrame();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  renderFxFrame() {
    if (!this.fxCtx || !this.fxCanvas) return;
    const ctx = this.fxCtx;
    ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

    // 1. Renderizar partículas mágicas
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s * 0.35, p.y - s * 0.35);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x, p.y + s);
      ctx.lineTo(p.x - s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x - s, p.y);
      ctx.lineTo(p.x - s * 0.35, p.y - s * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Renderizar la guía animada suave (estrellita viajera que muestra al niño hacia dónde trazar)
    const activeStroke = this.activeStrokes[this.currentStrokeIndex];
    if (activeStroke && !this.isDrawing) {
      const t = (performance.now() % 2200) / 2200;
      StrokeGenerator.renderAnimatedPointer(ctx, activeStroke, t);
    }
  }

  // ==========================================================================
  // GESTIÓN DE ENTRADA TÁCTIL Y DE RATÓN (CRAYÓN EN TIEMPO REAL)
  // ==========================================================================
  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
      const char = this.levelConfig.letter || this.levelConfig.char || 'A';
      audio.speak(`Letra ${char}, ${this.pedagogicalData.phonetic || ''}`);
      if (this.arabot) this.arabot.bounceHead();
    });

    // Selección de crayones de colores
    container.querySelectorAll('.mini-crayon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        container.querySelectorAll('.mini-crayon').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCrayonColor = btn.dataset.color || '#e91e63';
      });
    });

    const canvas = this.paintCanvas;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.activePointerId = e.pointerId;
      const pt = this.getCanvasPoint(e);
      this.handlePointerDown(pt.x, pt.y);
    }, { passive: false });

    this.boundPointerMove = (e) => {
      e.preventDefault();
      if (!this.isDrawing || (this.activePointerId !== null && e.pointerId !== this.activePointerId)) return;
      const pt = this.getCanvasPoint(e);
      this.handlePointerMove(pt.x, pt.y);
    };

    this.boundPointerUp = (e) => {
      if (this.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== this.activePointerId) return;
      this.activePointerId = null;
      this.handlePointerUp();
    };

    canvas.addEventListener('pointermove', this.boundPointerMove, { passive: false });
    canvas.addEventListener('pointerup', this.boundPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', this.boundPointerUp, { passive: false });
  }

  getCanvasPoint(e) {
    const canvas = this.paintCanvas;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handlePointerDown(x, y) {
    this.isDrawing = true;
    this.lastPoint = { x, y };

    this.drawCrayonPoint(x, y);
    audio.playBrush();
    // NOTA: No se completa trazo en pointerdown para evitar el efecto "boom se llena"
  }

  handlePointerMove(x, y) {
    if (!this.isDrawing || !this.lastPoint) return;

    const dx = x - this.lastPoint.x;
    const dy = y - this.lastPoint.y;
    const stepDist = Math.hypot(dx, dy);
    if (stepDist < 2.5) return;

    // Dibujar crayón en tiempo real
    this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, x, y);
    this.lastPoint = { x, y };

    // Evaluar con el motor StrokeGenerator
    this.checkActiveStrokeProgress(x, y, stepDist);
  }

  handlePointerUp() {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  drawCrayonPoint(x, y) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    ctx.save();
    ctx.fillStyle = this.activeCrayonColor;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCrayonSegment(fromX, fromY, toX, toY) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    ctx.save();
    ctx.strokeStyle = this.activeCrayonColor;
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // EVALUACIÓN DE TRAZO Y AVANCE GUIADO
  // ==========================================================================
  checkActiveStrokeProgress(x, y, stepDist) {
    const currentStroke = this.activeStrokes[this.currentStrokeIndex];
    if (!currentStroke || currentStroke.completed) return;

    // Validación tolerante de kínder
    const res = StrokeGenerator.checkStrokeProgress(currentStroke, { x, y }, stepDist, 36);

    if (res.isComplete) {
      this.onStrokeCompleted(currentStroke, x, y);
    }
  }

  onStrokeCompleted(stroke, x, y) {
    // 1. Efectos de logro inmediato
    audio.playStar();
    this.emitStarBurst(x, y);

    // 2. Fijar el trazo sólido y brillante
    StrokeGenerator.renderCompletedStroke(this.paintCtx, stroke, this.activeCrayonColor);

    // Registrar en los sets de compatibilidad
    if (stroke.isUpper !== false) {
      this.hollowStrokesCompleted.upper.add(stroke.id);
    } else {
      this.hollowStrokesCompleted.lower.add(stroke.id);
    }

    // 3. Avanzar al siguiente trazo
    this.currentStrokeIndex++;
    this.drawBackground();

    // 4. Verificar si se completó el grupo actual
    if (this.currentStrokeIndex >= this.activeStrokes.length) {
      if (this.levelConfig.type === 'grid_row' || this.levelConfig.type === 'grid_row_alternating') {
        this.onGridLetterCompleted();
      } else if (this.levelConfig.type === 'intro_hollow') {
        this.onIntroLevelComplete();
      } else {
        this.onLevelCompleted();
      }
    } else {
      // Arabot anima al niño a seguir con el siguiente trazo
      if (this.arabot) {
        this.arabot.speak(`¡Bien! Sigue con el paso ${this.currentStrokeIndex + 1} ⭐`);
      }
    }
  }

  onGridLetterCompleted() {
    this.rowLettersCompleted[this.currentLetterIndex] = true;

    // Actualizar contador visual
    const completedCount = this.rowLettersCompleted.filter(Boolean).length;
    const compLbl = document.getElementById('completedCountLabel');
    if (compLbl) compLbl.innerText = `${completedCount}`;

    audio.playPop();
    if (this.arabot) this.arabot.bounceHead();

    this.currentLetterIndex++;

    if (this.currentLetterIndex < this.gridLetters.length) {
      this.activeStrokes = this.gridLetters[this.currentLetterIndex].strokes;
      this.currentStrokeIndex = 0;
      this.drawBackground();
    } else {
      this.onLevelCompleted();
    }
  }

  onIntroLevelComplete() {
    this.isIllustrationColored = true;
    audio.playCelebration();
    Confetti.shoot(3000);

    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) treeZone.classList.add('colored');

    const caption = document.getElementById('treeCaption');
    if (caption) {
      caption.innerHTML = `🎉 ¡${this.pedagogicalData.word || 'COMPLETADO'} COLOREADO! ${this.pedagogicalData.icon || '⭐'}`;
      caption.classList.add('celebration-glow');
    }

    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡Completaste la letra ${this.pedagogicalData.letter}! ⭐⭐⭐`, 2800);
    }

    this.saveProgressAndAdvance();
  }

  onLevelCompleted() {
    audio.playCelebration();
    Confetti.shoot(3000);

    if (this.arabot) {
      this.arabot.celebrate('¡Completaste todo el ejercicio caligráfico! ⭐⭐⭐', 2600);
    }

    this.saveProgressAndAdvance();
  }

  saveProgressAndAdvance() {
    const subgame = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];
    StorageManager.completeModuleLevel(subgame.moduleKey, this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    setTimeout(() => {
      this.showAutoTransitionBanner();
    }, 2000);
  }

  showAutoTransitionBanner() {
    const banner = document.getElementById('autoTransitionBanner');
    const fill = document.getElementById('transitionProgressFill');

    if (!banner) {
      this.advanceToNextLevel();
      return;
    }

    banner.style.display = 'flex';
    if (fill) {
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = '100%'; }, 50);
    }

    setTimeout(() => {
      this.advanceToNextLevel();
    }, 1300);
  }

  advanceToNextLevel() {
    this.cleanup();
    const container = document.getElementById('app');
    if (!container) return;

    const levels = SUBGAMES_LEVEL_MAP[this.activeSubgame] || VOCALES_WORKBOOK_LEVELS;

    if (this.currentLevel < levels.length) {
      this.currentLevel++;
      this.renderLevelGame(container);
    } else {
      this.currentLevel = null;
      this.render(container);
    }
  }

  // ==========================================================================
  // VISTA 4: GENERADOR DE TRAZOS MÁGICO (HERRAMIENTA PARA CREAR CUALQUIER TRAZO)
  // ==========================================================================
  renderGeneradorTrazos(container) {
    this.cleanup();

    const alphabetUpper = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    const alphabetLower = 'abcdefghijklmnñopqrstuvwxyz'.split('');
    const numbersList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="generatorModule">
        <header class="tracing-header">
          <button class="back-btn" id="btnBackFromGenerator">⬅️ Menú</button>
          
          <div style="text-align:center;">
            <h2 style="color:#6a1b9a; margin:0; font-size:clamp(1.1rem, 2.5vw, 1.5rem);">GENERADOR MÁGICO DE TRAZOS ✨</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#e65100;">Elige o escribe cualquier letra o palabra para generar su guía escolar</div>
          </div>

          <div class="header-actions">
            <div class="mini-crayons-bar">
              <button class="mini-crayon active" data-color="#e91e63" style="background:#e91e63;"></button>
              <button class="mini-crayon" data-color="#ff5722" style="background:#ff5722;"></button>
              <button class="mini-crayon" data-color="#4caf50" style="background:#4caf50;"></button>
              <button class="mini-crayon" data-color="#00bcd4" style="background:#00bcd4;"></button>
              <button class="mini-crayon" data-color="#9c27b0" style="background:#9c27b0;"></button>
            </div>
            <button class="clear-btn" id="btnClearGeneratorCanvas">🧹 Limpiar</button>
          </div>
        </header>

        <!-- Barra selectora de pestañas del generador -->
        <div class="generator-tabs-bar">
          <button class="gen-tab-btn ${this.generatorTab === 'abecedario' ? 'active' : ''}" data-tab="abecedario">🔤 Abecedario</button>
          <button class="gen-tab-btn ${this.generatorTab === 'numeros' ? 'active' : ''}" data-tab="numeros">🔢 Números</button>
          <button class="gen-tab-btn ${this.generatorTab === 'palabra' ? 'active' : ''}" data-tab="palabra">✏️ Escribe Palabra</button>
        </div>

        <!-- Panel selector de caracteres -->
        <div class="generator-palette-box" id="generatorPaletteBox">
          ${this.generatorTab === 'abecedario' ? `
            <div class="gen-char-grid">
              ${alphabetUpper.map(ch => `
                <button class="gen-char-pill ${this.generatorTarget === ch && this.generatorIsUpper ? 'active' : ''}" data-char="${ch}" data-upper="true">${ch}</button>
              `).join('')}
            </div>
            <div class="gen-char-grid" style="margin-top:6px;">
              ${alphabetLower.map(ch => `
                <button class="gen-char-pill ${this.generatorTarget === ch && !this.generatorIsUpper ? 'active' : ''}" data-char="${ch}" data-upper="false">${ch}</button>
              `).join('')}
            </div>
          ` : this.generatorTab === 'numeros' ? `
            <div class="gen-char-grid numbers-grid">
              ${numbersList.map(num => `
                <button class="gen-char-pill ${this.generatorTarget === num ? 'active' : ''}" data-char="${num}" data-upper="true">${num}</button>
              `).join('')}
            </div>
          ` : `
            <div class="gen-custom-word-bar">
              <input type="text" id="genWordInput" class="gen-word-input" maxlength="10" placeholder="Escribe aquí (ej. MAMA)" value="${this.generatorTarget}" />
              <button class="gen-action-btn" id="btnGenerateCustomWord">Generar Trazos ✨</button>
            </div>
          `}
        </div>

        <!-- Cuaderno de dibujo del generador -->
        <main class="notebook-workspace" style="flex:1;">
          <div class="notebook-grid-container" id="generatorGridContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>
        </main>
      </div>
    `;

    this.setupCanvases(container);
    this.loadGeneratorTarget();
    this.drawBackground();
    this.startFxLoop();
    this.bindGeneratorEvents(container);

    audio.speak(`Generador de trazos listo para la letra ${this.generatorTarget}`);
  }

  loadGeneratorTarget() {
    if (!this.paintCanvas) return;
    const W = this.paintCanvas.width;
    const H = this.paintCanvas.height;

    this.activeStrokes = [];
    this.currentStrokeIndex = 0;
    this.gridLetters = [];
    this.currentLetterIndex = 0;

    // Si es una palabra de varias letras
    if (this.generatorTarget.length > 1) {
      const chars = this.generatorTarget.split('');
      this.totalRowLetters = chars.length;
      this.rowLettersCompleted = new Array(this.totalRowLetters).fill(false);

      const rowBounds = { x: 30, y: 110, width: 700, height: 210 };
      this.gridLetters = StrokeGenerator.generateRowLayout(chars, rowBounds);

      this.currentLetterIndex = 0;
      this.activeStrokes = this.gridLetters[0]?.strokes || [];
      this.levelConfig = { type: 'grid_row', char: chars[0] };
    } else {
      // Letra o número único grande centrado
      const bounds = { x: (W - 320) / 2, y: 50, width: 320, height: 320 };
      this.activeStrokes = StrokeGenerator.getStrokes(this.generatorTarget, bounds, this.generatorIsUpper);
      this.levelConfig = { type: 'generator_single', char: this.generatorTarget };
      this.totalRowLetters = this.activeStrokes.length;
    }

    if (this.paintCtx) {
      this.paintCtx.clearRect(0, 0, W, H);
    }
  }

  bindGeneratorEvents(container) {
    container.querySelector('#btnBackFromGenerator')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = null;
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearGeneratorCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    container.querySelectorAll('.gen-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        this.generatorTab = e.currentTarget.dataset.tab;
        this.renderGeneradorTrazos(container);
      });
    });

    container.querySelectorAll('.gen-char-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        this.generatorTarget = e.currentTarget.dataset.char;
        this.generatorIsUpper = (e.currentTarget.dataset.upper === 'true');
        container.querySelectorAll('.gen-char-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.loadGeneratorTarget();
        this.drawBackground();
        audio.speak(`Traza la letra ${this.generatorTarget}`);
      });
    });

    container.querySelector('#btnGenerateCustomWord')?.addEventListener('click', () => {
      const input = container.querySelector('#genWordInput');
      const val = (input?.value || 'SOL').trim().toUpperCase();
      if (!val) return;

      audio.playCelebration();
      this.generatorTarget = val;
      this.loadGeneratorTarget();
      this.drawBackground();
      audio.speak(`Generando trazos para la palabra ${val}`);
    });

    // Crayones
    container.querySelectorAll('.mini-crayon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        container.querySelectorAll('.mini-crayon').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCrayonColor = btn.dataset.color || '#e91e63';
      });
    });

    const canvas = this.paintCanvas;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.activePointerId = e.pointerId;
      const pt = this.getCanvasPoint(e);
      this.handlePointerDown(pt.x, pt.y);
    }, { passive: false });

    this.boundPointerMove = (e) => {
      e.preventDefault();
      if (!this.isDrawing || (this.activePointerId !== null && e.pointerId !== this.activePointerId)) return;
      const pt = this.getCanvasPoint(e);
      this.handlePointerMove(pt.x, pt.y);
    };

    this.boundPointerUp = (e) => {
      if (this.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== this.activePointerId) return;
      this.activePointerId = null;
      this.handlePointerUp();
    };

    canvas.addEventListener('pointermove', this.boundPointerMove, { passive: false });
    canvas.addEventListener('pointerup', this.boundPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', this.boundPointerUp, { passive: false });
  }

  // ==========================================================================
  // VISTA 5: PIZARRA MÁGICA ESCOLAR (DIBUJO LIBRE)
  // ==========================================================================
  renderPizarraMagica(container) {
    this.cleanup();

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="pizarraModule">
        <header class="tracing-header pizarra-header">
          <button class="back-btn" id="btnBackFromPizarra">⬅️ Menú</button>
          
          <div class="crayons-palette">
            <button class="crayon-pill active" data-color="#ff5722" style="background:#ff5722;">🖍️</button>
            <button class="crayon-pill" data-color="#e91e63" style="background:#e91e63;">🖍️</button>
            <button class="crayon-pill" data-color="#ff9800" style="background:#ff9800;">🖍️</button>
            <button class="crayon-pill" data-color="#4caf50" style="background:#4caf50;">🖍️</button>
            <button class="crayon-pill" data-color="#00bcd4" style="background:#00bcd4;">🖍️</button>
            <button class="crayon-pill" data-color="#9c27b0" style="background:#9c27b0;">🖍️</button>
          </div>

          <button class="clear-btn" id="btnClearPizarra">🧹 Limpiar</button>
        </header>

        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>PIZARRA MÁGICA ESCOLAR</h2>
            <p class="notebook-instruction">🎨 Dibuja, escribe y raya libremente sobre la cuadrícula del cuaderno con tus crayones.</p>
          </div>

          <div class="notebook-grid-container" id="pizarraGridContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>
        </main>
      </div>
    `;

    this.setupCanvases(container);
    this.drawNotebookGridOnly();
    this.startFxLoop();

    container.querySelectorAll('.crayon-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        container.querySelectorAll('.crayon-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCrayonColor = btn.dataset.color || '#ff5722';
      });
    });

    container.querySelector('#btnBackFromPizarra')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = null;
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearPizarra')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    const canvas = this.paintCanvas;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.isDrawing = true;
      const pt = this.getCanvasPoint(e);
      this.lastPoint = pt;
      this.drawCrayonPoint(pt.x, pt.y);
      audio.playBrush();
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (!this.isDrawing || !this.lastPoint) return;
      const pt = this.getCanvasPoint(e);
      this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, pt.x, pt.y);
      this.lastPoint = pt;
    }, { passive: false });

    const stopDraw = () => {
      this.isDrawing = false;
      this.lastPoint = null;
    };
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);
  }

  drawNotebookGridOnly() {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    ctx.clearRect(0, 0, W, H);
    const gridSize = 38;
    ctx.strokeStyle = 'rgba(41, 182, 246, 0.25)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  // ==========================================================================
  // HELPERS Y LIMPIEZA
  // ==========================================================================
  setupArabot(container) {
    const anchor = container.querySelector('#arabotAnchor');
    if (!anchor) return;

    this.arabot = new ArabotAssistant({
      onHelpClick: () => {
        if (this.arabot) {
          this.arabot.speak(`¡Sigue las flechas y la estrellita dorada para hacer tu trazo! ⭐`);
          this.arabot.bounceHead();
        }
      }
    });

    this.arabot.mount(anchor);
  }

  setupCanvases(container) {
    this.bgCanvas = container.querySelector('#bgCanvas');
    this.paintCanvas = container.querySelector('#paintCanvas');
    this.fxCanvas = container.querySelector('#fxCanvas');

    if (!this.bgCanvas || !this.paintCanvas || !this.fxCanvas) return;

    this.bgCtx = this.bgCanvas.getContext('2d');
    this.paintCtx = this.paintCanvas.getContext('2d');
    this.fxCtx = this.fxCanvas.getContext('2d');
  }

  clearPaintCanvas() {
    if (this.paintCtx && this.paintCanvas) {
      this.paintCtx.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
    }
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };
    if (this.rowLettersCompleted) {
      this.rowLettersCompleted.fill(false);
    }
    if (this.activeSubgame === 'generador_trazos') {
      this.loadGeneratorTarget();
    } else {
      this.initLevelStrokes();
    }
    this.drawBackground();

    const label = document.getElementById('completedCountLabel');
    if (label) label.innerText = '0';

    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) treeZone.classList.remove('colored');
  }

  emitStarBurst(x, y) {
    const colors = ['#ffd700', '#ffeb3b', '#ff9800', '#00e5ff', '#76ff03', '#ff4081'];
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        y: y,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.035 + Math.random() * 0.02
      });
    }
  }

  resetState() {
    this.activeSubgame = null;
    this.currentLevel = null;
    this.cleanup();
  }

  cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.paintCanvas && this.boundPointerUp) {
      this.paintCanvas.removeEventListener('pointermove', this.boundPointerMove);
      this.paintCanvas.removeEventListener('pointerup', this.boundPointerUp);
      this.paintCanvas.removeEventListener('pointercancel', this.boundPointerUp);
      this.boundPointerUp = null;
      this.boundPointerMove = null;
    }
    if (this.arabot) {
      this.arabot.destroy();
      this.arabot = null;
    }
    this.sparkles = [];
  }
}
