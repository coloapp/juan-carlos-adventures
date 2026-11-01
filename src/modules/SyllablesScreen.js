/**
 * SyllablesScreen - Módulo "Sílabas" con 50 Juegos en Círculos ("Circulitos")
 * Formación fonética de palabras según método silábico SEP/Gonvill.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';
import { LevelSelector } from '../components/LevelSelector.js';

export const SYLLABLES_50_WORDS = [
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

export class SyllablesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.currentLevel = null;
  }

  render(container) {
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'syllables',
        moduleTitle: 'Sílabas',
        moduleIcon: '📚',
        bgClass: 'syllables-bg',
        totalLevels: 50,
        onSelectLevel: (lvl) => {
          this.currentLevel = lvl;
          this.renderGame(container);
        },
        onBackHome: () => {
          this.navigator.navigate('home');
        }
      });
      return;
    }

    this.renderGame(container);
  }

  renderGame(container) {
    const student = StorageManager.getActiveStudent();
    const idx = (this.currentLevel - 1) % SYLLABLES_50_WORDS.length;
    const item = SYLLABLES_50_WORDS[idx];

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>SÍLABAS: ${item.word}</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#2e7d32;">
              Juego ${this.currentLevel} de 50
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

    this.bindEvents(container, item);
    audio.speak(`Completa la palabra ${item.word}`);
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

  bindEvents(container, item) {
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

          StorageManager.completeModuleLevel('syllables', this.currentLevel, 3);
          Confetti.shoot(2500);

          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Excelente! Completaste ${item.word} ⭐\n\n¿Quieres jugar el Nivel ${next}?`)) {
                this.currentLevel = next;
                this.renderGame(container);
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
  }
}
