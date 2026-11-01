/**
 * SyllablesScreen - Módulo "Sílabas" con Arquitectura de Sub-Juegos en Círculos
 * Incluye:
 * 1. "Completa la Palabra" (50 niveles con palabras y sílabas faltantes)
 * 2. "Arma la Sílaba" (50 niveles formando consonante + vocal = sílaba)
 * Fácilmente extensible para añadir futuros juegos silábicos en círculos.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';

// ============================================================================
// 1. CATÁLOGO DE 50 NIVELES: COMPLETA LA PALABRA
// ============================================================================
export const SYLLABLES_COMPLETA_50 = [
  { word: 'ELEFANTE', image: 'public/assets/images/educational/elephant.svg', syllables: ['E', 'LE', 'FAN', 'TE'], missingIndex: 1, options: ['LE', 'MA', 'TO'] },
  { word: 'PELOTA', image: 'public/assets/icons/shapes.svg', syllables: ['PE', 'LO', 'TA'], missingIndex: 1, options: ['SA', 'LO', 'RA'] },
  { word: 'MONITO', image: 'public/assets/images/educational/monkey.svg', syllables: ['MO', 'NI', 'TO'], missingIndex: 0, options: ['PA', 'SO', 'MO'] },
  { word: 'ESTRELLA', image: 'public/assets/images/items/star.svg', syllables: ['ES', 'TRE', 'LLA'], missingIndex: 1, options: ['TRE', 'PLO', 'BRI'] },
  { word: 'GATITO', image: 'public/assets/images/educational/cat.svg', syllables: ['GA', 'TI', 'TO'], missingIndex: 0, options: ['GA', 'ME', 'LU'] },
  { word: 'PERRITO', image: 'public/assets/images/educational/dog.svg', syllables: ['PE', 'RRI', 'TO'], missingIndex: 0, options: ['FA', 'PE', 'SO'] },
  { word: 'PATITO', image: 'public/assets/images/educational/duck.svg', syllables: ['PA', 'TI', 'TO'], missingIndex: 1, options: ['RO', 'TI', 'LU'] },
  { word: 'MARIPOSA', image: 'public/assets/images/educational/butterfly.svg', syllables: ['MA', 'RI', 'PO', 'SA'], missingIndex: 2, options: ['PO', 'TE', 'LA'] },
  { word: 'LEON', image: 'public/assets/images/educational/lion.svg', syllables: ['LE', 'ON'], missingIndex: 0, options: ['LE', 'PA', 'MI'] },
  { word: 'CONEJITO', image: 'public/assets/images/educational/rabbit.svg', syllables: ['CO', 'NE', 'JI', 'TO'], missingIndex: 1, options: ['RA', 'NE', 'MO'] },
  { word: 'MANZANA', image: 'public/assets/images/items/apple.svg', syllables: ['MAN', 'ZA', 'NA'], missingIndex: 1, options: ['ZA', 'TO', 'RE'] },
  { word: 'TORTUGA', image: 'public/assets/images/educational/turtle.svg', syllables: ['TOR', 'TU', 'GA'], missingIndex: 2, options: ['GA', 'BO', 'SA'] },
  { word: 'PLATANO', image: 'public/assets/images/items/banana.svg', syllables: ['PLA', 'TA', 'NO'], missingIndex: 0, options: ['PLA', 'TRE', 'CLO'] },
  { word: 'JIRAFA', image: 'public/assets/images/educational/giraffe.svg', syllables: ['JI', 'RA', 'FA'], missingIndex: 1, options: ['LO', 'RA', 'SE'] },
  { word: 'COCODRILO', image: 'public/assets/images/educational/crocodile.svg', syllables: ['CO', 'CO', 'DRI', 'LO'], missingIndex: 2, options: ['DRI', 'PRA', 'BLI'] },
  { word: 'BALLENA', image: 'public/assets/images/educational/whale.svg', syllables: ['BA', 'LLE', 'NA'], missingIndex: 0, options: ['BA', 'PE', 'LU'] },
  { word: 'DELFIN', image: 'public/assets/images/educational/dolphin.svg', syllables: ['DEL', 'FIN'], missingIndex: 1, options: ['FIN', 'PAN', 'SOL'] },
  { word: 'CANGURO', image: 'public/assets/images/educational/kangaroo.svg', syllables: ['CAN', 'GU', 'RO'], missingIndex: 1, options: ['GU', 'MI', 'TO'] },
  { word: 'ZORRITO', image: 'public/assets/images/educational/fox.svg', syllables: ['ZO', 'RRI', 'TO'], missingIndex: 0, options: ['ZO', 'BA', 'CA'] },
  { word: 'OSITO', image: 'public/assets/images/educational/bear.svg', syllables: ['O', 'SI', 'TO'], missingIndex: 1, options: ['SI', 'PA', 'LE'] },
  { word: 'CEBRITA', image: 'public/assets/images/educational/zebra.svg', syllables: ['CE', 'BRI', 'TA'], missingIndex: 1, options: ['BRI', 'PLO', 'TRA'] },
  { word: 'TIGRITO', image: 'public/assets/images/educational/tiger.svg', syllables: ['TI', 'GRI', 'TO'], missingIndex: 0, options: ['TI', 'RO', 'MA'] },
  { word: 'RANITA', image: 'public/assets/images/educational/frog.svg', syllables: ['RA', 'NI', 'TA'], missingIndex: 0, options: ['RA', 'PE', 'SO'] },
  { word: 'ABEJITA', image: 'public/assets/images/educational/bee.svg', syllables: ['A', 'BE', 'JI', 'TA'], missingIndex: 1, options: ['BE', 'LU', 'RA'] },
  { word: 'CARACOL', image: 'public/assets/images/educational/snail.svg', syllables: ['CA', 'RA', 'COL'], missingIndex: 2, options: ['COL', 'PAN', 'MAR'] },
  { word: 'RATON', image: 'public/assets/images/educational/mouse.svg', syllables: ['RA', 'TON'], missingIndex: 1, options: ['TON', 'SOL', 'PAN'] },
  { word: 'VAQUITA', image: 'public/assets/images/educational/cow.svg', syllables: ['VA', 'QUI', 'TA'], missingIndex: 0, options: ['VA', 'LO', 'ME'] },
  { word: 'CABALLO', image: 'public/assets/images/educational/horse.svg', syllables: ['CA', 'BA', 'LLO'], missingIndex: 1, options: ['BA', 'SO', 'TI'] },
  { word: 'CERDITO', image: 'public/assets/images/educational/pig.svg', syllables: ['CER', 'DI', 'TO'], missingIndex: 1, options: ['DI', 'RA', 'LE'] },
  { word: 'GALLINA', image: 'public/assets/images/educational/chicken.svg', syllables: ['GA', 'LLI', 'NA'], missingIndex: 2, options: ['NA', 'TO', 'RE'] },
  { word: 'OVEJITA', image: 'public/assets/images/educational/sheep.svg', syllables: ['O', 'VE', 'JI', 'TA'], missingIndex: 2, options: ['JI', 'LO', 'PA'] },
  { word: 'CABRITA', image: 'public/assets/images/educational/goat.svg', syllables: ['CA', 'BRI', 'TA'], missingIndex: 1, options: ['BRI', 'FLO', 'GLO'] },
  { word: 'POLLITO', image: 'public/assets/images/educational/chick.svg', syllables: ['PO', 'LLI', 'TO'], missingIndex: 0, options: ['PO', 'LU', 'RE'] },
  { word: 'LOBITO', image: 'public/assets/images/educational/wolf.svg', syllables: ['LO', 'BI', 'TO'], missingIndex: 0, options: ['LO', 'MA', 'SO'] },
  { word: 'CAMARON', image: 'public/assets/images/educational/shrimp.svg', syllables: ['CA', 'MA', 'RON'], missingIndex: 1, options: ['MA', 'PI', 'LE'] },
  { word: 'PAPAGAYO', image: 'public/assets/images/educational/parrot.svg', syllables: ['PA', 'PA', 'GA', 'YO'], missingIndex: 2, options: ['GA', 'TO', 'ME'] },
  { word: 'PINGÜINO', image: 'public/assets/images/educational/penguin.svg', syllables: ['PIN', 'GÜI', 'NO'], missingIndex: 1, options: ['GÜI', 'RA', 'SO'] },
  { word: 'BARQUITO', image: 'public/assets/images/educational/boat.svg', syllables: ['BAR', 'QUI', 'TO'], missingIndex: 1, options: ['QUI', 'ME', 'LO'] },
  { word: 'AVIONCITO', image: 'public/assets/images/educational/airplane.svg', syllables: ['A', 'VION', 'CI', 'TO'], missingIndex: 0, options: ['A', 'E', 'O'] },
  { word: 'COCHECITO', image: 'public/assets/images/educational/car.svg', syllables: ['CO', 'CHE', 'CI', 'TO'], missingIndex: 1, options: ['CHE', 'BLO', 'PRI'] },
  { word: 'TRENESITO', image: 'public/assets/images/educational/train.svg', syllables: ['TRE', 'NE', 'SI', 'TO'], missingIndex: 0, options: ['TRE', 'PLA', 'CRO'] },
  { word: 'BICICLETA', image: 'public/assets/images/educational/bike.svg', syllables: ['BI', 'CI', 'CLE', 'TA'], missingIndex: 2, options: ['CLE', 'TRO', 'BRI'] },
  { word: 'SOLECITO', image: 'public/assets/images/items/sun.svg', syllables: ['SO', 'LE', 'CI', 'TO'], missingIndex: 0, options: ['SO', 'PA', 'LU'] },
  { word: 'LUNITA', image: 'public/assets/images/items/moon.svg', syllables: ['LU', 'NI', 'TA'], missingIndex: 0, options: ['LU', 'SO', 'ME'] },
  { word: 'NUBESITA', image: 'public/assets/images/items/cloud.svg', syllables: ['NU', 'BE', 'SI', 'TA'], missingIndex: 1, options: ['BE', 'RA', 'TO'] },
  { word: 'ARBOLITO', image: 'public/assets/images/items/tree.svg', syllables: ['AR', 'BO', 'LI', 'TO'], missingIndex: 2, options: ['LI', 'MA', 'SO'] },
  { word: 'FLORECITA', image: 'public/assets/images/items/flower.svg', syllables: ['FLO', 'RE', 'CI', 'TA'], missingIndex: 0, options: ['FLO', 'BLI', 'CRO'] },
  { word: 'CORAZON', image: 'public/assets/images/items/heart.svg', syllables: ['CO', 'RA', 'ZON'], missingIndex: 1, options: ['RA', 'ME', 'TO'] },
  { word: 'ARCOIRIS', image: 'public/assets/images/items/rainbow.svg', syllables: ['AR', 'CO', 'I', 'RIS'], missingIndex: 1, options: ['CO', 'BA', 'LE'] },
  { word: 'CAMPEON', image: 'public/assets/images/items/trophy.svg', syllables: ['CAM', 'PE', 'ON'], missingIndex: 1, options: ['PE', 'SO', 'LU'] }
];

// ============================================================================
// 2. CATÁLOGO DE 50 NIVELES: ARMA LA SÍLABA (M, P, S, L, T, D, N, C, B, R)
// ============================================================================
export const ARMA_SILABAS_50_LEVELS = [
  // 1-5: M (MA, ME, MI, MO, MU)
  { consonant: 'M', vowel: 'A', syllable: 'MA', example: 'MAMÁ', emoji: '👩' },
  { consonant: 'M', vowel: 'E', syllable: 'ME', example: 'MESA', emoji: '🪑' },
  { consonant: 'M', vowel: 'I', syllable: 'MI', example: 'MIEL', emoji: '🍯' },
  { consonant: 'M', vowel: 'O', syllable: 'MO', example: 'MONO', emoji: '🐒' },
  { consonant: 'M', vowel: 'U', syllable: 'MU', example: 'MÚSICA', emoji: '🎵' },

  // 6-10: P (PA, PE, PI, PO, PU)
  { consonant: 'P', vowel: 'A', syllable: 'PA', example: 'PAPÁ', emoji: '👨' },
  { consonant: 'P', vowel: 'E', syllable: 'PE', example: 'PELOTA', emoji: '⚽' },
  { consonant: 'P', vowel: 'I', syllable: 'PI', example: 'PIÑA', emoji: '🍍' },
  { consonant: 'P', vowel: 'O', syllable: 'PO', example: 'POLLITO', emoji: '🐥' },
  { consonant: 'P', vowel: 'U', syllable: 'PU', example: 'PUERTA', emoji: '🚪' },

  // 11-15: S (SA, SE, SI, SO, SU)
  { consonant: 'S', vowel: 'A', syllable: 'SA', example: 'SAPO', emoji: '🐸' },
  { consonant: 'S', vowel: 'E', syllable: 'SE', example: 'SELLO', emoji: '💌' },
  { consonant: 'S', vowel: 'I', syllable: 'SI', example: 'SILLA', emoji: '🪑' },
  { consonant: 'S', vowel: 'O', syllable: 'SO', example: 'SOL', emoji: '☀️' },
  { consonant: 'S', vowel: 'U', syllable: 'SU', example: 'SUEÑO', emoji: '💤' },

  // 16-20: L (LA, LE, LI, LO, LU)
  { consonant: 'L', vowel: 'A', syllable: 'LA', example: 'LÁPIZ', emoji: '✏️' },
  { consonant: 'L', vowel: 'E', syllable: 'LE', example: 'LEÓN', emoji: '🦁' },
  { consonant: 'L', vowel: 'I', syllable: 'LI', example: 'LIMÓN', emoji: '🍋' },
  { consonant: 'L', vowel: 'O', syllable: 'LO', example: 'LOBO', emoji: '🐺' },
  { consonant: 'L', vowel: 'U', syllable: 'LU', example: 'LUNA', emoji: '🌙' },

  // 21-25: T (TA, TE, TI, TO, TU)
  { consonant: 'T', vowel: 'A', syllable: 'TA', example: 'TAZA', emoji: '☕' },
  { consonant: 'T', vowel: 'E', syllable: 'TE', example: 'TELÉFONO', emoji: '☎️' },
  { consonant: 'T', vowel: 'I', syllable: 'TI', example: 'TIGRE', emoji: '🐯' },
  { consonant: 'T', vowel: 'O', syllable: 'TO', example: 'TOMATE', emoji: '🍅' },
  { consonant: 'T', vowel: 'U', syllable: 'TU', example: 'TORTUGA', emoji: '🐢' },

  // 26-30: D (DA, DE, DI, DO, DU)
  { consonant: 'D', vowel: 'A', syllable: 'DA', example: 'DADO', emoji: '🎲' },
  { consonant: 'D', vowel: 'E', syllable: 'DE', example: 'DEDO', emoji: '👆' },
  { consonant: 'D', vowel: 'I', syllable: 'DI', example: 'DIENTE', emoji: '🦷' },
  { consonant: 'D', vowel: 'O', syllable: 'DO', example: 'DONA', emoji: '🍩' },
  { consonant: 'D', vowel: 'U', syllable: 'DU', example: 'DULCE', emoji: '🍬' },

  // 31-35: N (NA, NE, NI, NO, NU)
  { consonant: 'N', vowel: 'A', syllable: 'NA', example: 'NARANJA', emoji: '🍊' },
  { consonant: 'N', vowel: 'E', syllable: 'NE', example: 'NENE', emoji: '👶' },
  { consonant: 'N', vowel: 'I', syllable: 'NI', example: 'NIDO', emoji: '🪺' },
  { consonant: 'N', vowel: 'O', syllable: 'NO', example: 'NOCHE', emoji: '🌃' },
  { consonant: 'N', vowel: 'U', syllable: 'NU', example: 'NUBE', emoji: '☁️' },

  // 36-40: C (CA, CE, CI, CO, CU)
  { consonant: 'C', vowel: 'A', syllable: 'CA', example: 'CASA', emoji: '🏠' },
  { consonant: 'C', vowel: 'E', syllable: 'CE', example: 'CEBRA', emoji: '🦓' },
  { consonant: 'C', vowel: 'I', syllable: 'CI', example: 'CIELO', emoji: '🌤️' },
  { consonant: 'C', vowel: 'O', syllable: 'CO', example: 'COCHE', emoji: '🚗' },
  { consonant: 'C', vowel: 'U', syllable: 'CU', example: 'CUNA', emoji: '🛏️' },

  // 41-45: B (BA, BE, BI, BO, BU)
  { consonant: 'B', vowel: 'A', syllable: 'BA', example: 'BARCO', emoji: '⛵' },
  { consonant: 'B', vowel: 'E', syllable: 'BE', example: 'BEBÉ', emoji: '🍼' },
  { consonant: 'B', vowel: 'I', syllable: 'BI', example: 'BICI', emoji: '🚲' },
  { consonant: 'B', vowel: 'O', syllable: 'BO', example: 'BOTA', emoji: '👢' },
  { consonant: 'B', vowel: 'U', syllable: 'BU', example: 'BÚHO', emoji: '🦉' },

  // 46-50: R (RA, RE, RI, RO, RU)
  { consonant: 'R', vowel: 'A', syllable: 'RA', example: 'RANA', emoji: '🐸' },
  { consonant: 'R', vowel: 'E', syllable: 'RE', example: 'RELOJ', emoji: '⏰' },
  { consonant: 'R', vowel: 'I', syllable: 'RI', example: 'RISA', emoji: '😄' },
  { consonant: 'R', vowel: 'O', syllable: 'RO', example: 'ROSA', emoji: '🌹' },
  { consonant: 'R', vowel: 'U', syllable: 'RU', example: 'RUEDA', emoji: '🛞' }
];

export class SyllablesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.activeSubgame = null; // null = menú de juegos en círculos, 'completa' o 'arma'
    this.currentLevel = null;  // null = selector de 50 circulitos, número = nivel activo
  }

  render(container) {
    // 1. Si no ha elegido juego, mostrar el Menú de Juegos en Círculos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // 2. Si eligió un juego pero no ha seleccionado nivel, mostrar los 50 circulitos de ese juego
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // 3. Renderizar el juego activo
    if (this.activeSubgame === 'completa') {
      this.renderCompletaPalabra(container);
    } else if (this.activeSubgame === 'arma') {
      this.renderArmaSilaba(container);
    }
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUB-JUEGOS EN CÍRCULOS (COMPLETA LA PALABRA / ARMA LA SÍLABA)
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();
    const progCompleta = StorageManager.getModuleLevels('syllables_completa');
    const progArma = StorageManager.getModuleLevels('syllables_arma');

    const countCompleta = Object.keys(progCompleta.completed || {}).length;
    const countArma = Object.keys(progArma.completed || {}).length;

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú</button>
          <div style="text-align:center;">
            <h2>MÓDULO DE SÍLABAS</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#2e7d32;">
              Elige tu juego favorito en círculos
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid">
            
            <!-- Círculo 1: Completa la Palabra -->
            <button class="subgame-circle-card" id="btnSelectCompleta">
              <div class="subgame-bubble subgame-bubble-completa pulse-glow">
                <span class="subgame-bubble-icon">🧩</span>
                <span class="subgame-levels-badge">50 Niveles</span>
              </div>
              <span class="subgame-title-label">COMPLETA LA PALABRA</span>
              <span style="font-size:0.75rem; color:#2e7d32; font-weight:bold; margin-top:2px;">
                ⭐ ${countCompleta}/50 completados
              </span>
            </button>

            <!-- Círculo 2: Arma la Sílaba -->
            <button class="subgame-circle-card" id="btnSelectArma">
              <div class="subgame-bubble subgame-bubble-arma pulse-glow">
                <span class="subgame-bubble-icon">🔤</span>
                <span class="subgame-levels-badge badge-orange">50 Niveles</span>
              </div>
              <span class="subgame-title-label">ARMA LA SÍLABA</span>
              <span style="font-size:0.75rem; color:#e65100; font-weight:bold; margin-top:2px;">
                ⭐ ${countArma}/50 completados
              </span>
            </button>

          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">💡 Toca cualquiera de los círculos para jugar sus 50 niveles interactivos.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
      audio.playClick();
      this.navigator.navigate('home');
    });

    container.querySelector('#btnSelectCompleta')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = 'completa';
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnSelectArma')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = 'arma';
      this.currentLevel = null;
      this.render(container);
    });

    audio.speak('Elige un juego de sílabas');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS PARA EL JUEGO SELECCIONADO
  // ==========================================================================
  renderLevelSelector(container) {
    const isCompleta = (this.activeSubgame === 'completa');
    const moduleKey = isCompleta ? 'syllables_completa' : 'syllables_arma';
    const title = isCompleta ? 'Completa la Palabra' : 'Arma la Sílaba';
    const icon = isCompleta ? '🧩' : '🔤';

    LevelSelector.render({
      container,
      moduleKey: moduleKey,
      moduleTitle: title,
      moduleIcon: icon,
      bgClass: 'syllables-bg',
      totalLevels: 50,
      onSelectLevel: (lvl) => {
        this.currentLevel = lvl;
        this.render(container);
      },
      onBackHome: () => {
        // Regresa al menú de los 2 círculos de juegos
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      }
    });
  }

  // ==========================================================================
  // VISTA 3A: JUEGO "COMPLETA LA PALABRA" (50 NIVELES)
  // ==========================================================================
  renderCompletaPalabra(container) {
    const student = StorageManager.getActiveStudent();
    const idx = (this.currentLevel - 1) % SYLLABLES_COMPLETA_50.length;
    const item = SYLLABLES_COMPLETA_50[idx];

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>COMPLETA: ${item.word}</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#2e7d32;">
              Juego 1: Nivel ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board">
          <div class="word-card-box">
            <div style="font-size: clamp(3rem, 7vh, 4.5rem); margin-bottom: 6px;">
              ${this.getWordEmoji(item.word)}
            </div>

            <div class="word-puzzle">
              ${item.syllables.map((syl, i) => {
                if (i === item.missingIndex) {
                  return `<div class="drop-zone" id="dropZone">?</div>`;
                }
                return `<div class="static-syllable">${syl}</div>`;
              }).join('')}
            </div>

            <p class="instruction-text">¿Qué sílaba falta para completar <strong>${item.word}</strong>?</p>

            <div class="syllables-options" id="optionsContainer">
              ${item.options.map(opt => `
                <button class="syllable-btn" data-value="${opt}">${opt}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnListenWord">🔊 Escuchar Palabra</button>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnListenWord')?.addEventListener('click', () => {
      audio.speak(item.word);
    });

    const dropZone = container.querySelector('#dropZone');
    const options = container.querySelectorAll('.syllable-btn');
    const correctSyllable = item.syllables[item.missingIndex];

    options.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.target.dataset.value;

        if (selected === correctSyllable) {
          audio.playSuccess();
          e.target.classList.add('correct');
          dropZone.innerText = selected;
          dropZone.classList.add('solved');

          StorageManager.completeModuleLevel('syllables_completa', this.currentLevel, 3);
          Confetti.shoot(2500);

          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Excelente! Completaste ${item.word} ⭐\n\n¿Quieres jugar el Nivel ${next}?`)) {
                this.currentLevel = next;
                this.render(container);
                return;
              }
            }
            this.currentLevel = null;
            this.render(container);
          }, 800);

        } else {
          audio.playError();
          e.target.classList.add('wrong');
          setTimeout(() => e.target.classList.remove('wrong'), 500);
          audio.speak('Intenta con otra sílaba');
        }
      });
    });

    audio.speak(`Completa la palabra ${item.word}`);
  }

  // ==========================================================================
  // VISTA 3B: JUEGO "ARMA LA SÍLABA" (50 NIVELES: CONSONANTE + VOCAL = SÍLABA)
  // ==========================================================================
  renderArmaSilaba(container) {
    const student = StorageManager.getActiveStudent();
    const idx = (this.currentLevel - 1) % ARMA_SILABAS_50_LEVELS.length;
    const item = ARMA_SILABAS_50_LEVELS[idx];

    // Opciones de vocales con la correcta y 2 distractores
    const allVowels = ['A', 'E', 'I', 'O', 'U'];
    const distractors = allVowels.filter(v => v !== item.vowel).sort(() => 0.5 - Math.random()).slice(0, 2);
    const vowelOptions = [item.vowel, ...distractors].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>ARMA LA SÍLABA: ${item.syllable}</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#e65100;">
              Juego 2: Nivel ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board">
          <div class="arma-silaba-card">
            <div style="font-size: clamp(2.8rem, 6.5vh, 4.2rem); margin-bottom: 4px;">
              ${item.emoji}
            </div>

            <p style="font-size:clamp(0.95rem, 2.2vh, 1.25rem); font-weight:bold; color:#37474f; margin:0 0 10px 0;">
              Junta la <strong>${item.consonant}</strong> con su vocal para formar <strong>${item.syllable}</strong> (${item.example})
            </p>

            <!-- Ecuación de la sílaba: [Consonante] + [Vocal ?] = [Sílaba] -->
            <div class="equation-row">
              <div class="equation-block eq-consonant">${item.consonant}</div>
              <span class="eq-operator">+</span>
              <div class="equation-block eq-vowel-slot" id="vowelTargetSlot">?</div>
              <span class="eq-operator">=</span>
              <div class="equation-block eq-result" id="syllableResult">...</div>
            </div>

            <p class="instruction-text">¿Qué vocal necesitas?</p>

            <div class="vowel-choices-row" id="vowelChoicesRow">
              ${vowelOptions.map(v => `
                <button class="vowel-choice-btn" data-vowel="${v}">${v}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnListenInstruction">🔊 Escuchar Instrucción</button>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    const instructionText = `Junta la letra ${item.consonant} con su vocal para formar ${item.syllable}, como en ${item.example}`;
    container.querySelector('#btnListenInstruction')?.addEventListener('click', () => {
      audio.speak(instructionText);
    });

    const vowelSlot = container.querySelector('#vowelTargetSlot');
    const resultBlock = container.querySelector('#syllableResult');
    const buttons = container.querySelectorAll('.vowel-choice-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chosen = e.target.dataset.vowel;

        if (chosen === item.vowel) {
          audio.playSuccess();
          e.target.style.background = '#4caf50';
          vowelSlot.innerText = chosen;
          vowelSlot.classList.add('filled');
          resultBlock.innerText = item.syllable;
          resultBlock.style.background = '#00c853';

          StorageManager.completeModuleLevel('syllables_arma', this.currentLevel, 3);
          Confetti.shoot(2500);

          audio.speak(`¡La ${item.consonant} con la ${chosen} suena... ${item.syllable}! Como en ${item.example}. ¡Excelente!`);

          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Muy bien! Formaste ${item.syllable} ⭐\n\n¿Quieres jugar el Nivel ${next}?`)) {
                this.currentLevel = next;
                this.render(container);
                return;
              }
            }
            this.currentLevel = null;
            this.render(container);
          }, 1100);

        } else {
          audio.playError();
          e.target.style.background = '#f44336';
          setTimeout(() => e.target.style.background = '', 500);
          audio.speak(`Esa es la letra ${chosen}. Necesitamos la vocal para formar ${item.syllable}.`);
        }
      });
    });

    audio.speak(instructionText);
  }

  getWordEmoji(word) {
    const emojis = {
      'ELEFANTE': '🐘', 'PELOTA': '⚽', 'MONITO': '🐒', 'ESTRELLA': '⭐', 'GATITO': '🐱',
      'PERRITO': '🐶', 'PATITO': '🦆', 'MARIPOSA': '🦋', 'LEON': '🦁', 'CONEJITO': '🐰',
      'MANZANA': '🍎', 'TORTUGA': '🐢', 'PLATANO': '🍌', 'JIRAFA': '🦒', 'COCODRILO': '🐊',
      'BALLENA': '🐋', 'DELFIN': '🐬', 'CANGURO': '🦘', 'ZORRITO': '🦊', 'OSITO': '🐻',
      'CEBRITA': '🦓', 'TIGRITO': '🐯', 'RANITA': '🐸', 'ABEJITA': '🐝', 'CARACOL': '🐌',
      'RATON': '🐭', 'VAQUITA': '🐮', 'CABALLO': '🐴', 'CERDITO': '🐷', 'GALLINA': '🐔',
      'OVEJITA': '🐑', 'CABRITA': '🐐', 'POLLITO': '🐥', 'LOBITO': '🐺', 'CAMARON': '🦐',
      'PAPAGAYO': '🦜', 'PINGÜINO': '🐧', 'BARQUITO': '⛵', 'AVIONCITO': '✈️', 'COCHECITO': '🚗',
      'TRENESITO': '🚂', 'BICICLETA': '🚲', 'SOLECITO': '☀️', 'LUNITA': '🌙', 'NUBESITA': '☁️',
      'ARBOLITO': '🌳', 'FLORECITA': '🌸', 'CORAZON': '❤️', 'ARCOIRIS': '🌈', 'CAMPEON': '🏆'
    };
    return emojis[word] || '🌟';
  }
}
