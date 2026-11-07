/**
 * NumbersScreen - Módulo "Números" con 50 Juegos en Círculos ("Circulitos")
 * Trencito numérico didáctico y secuencias progresivas para kínder.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';
import { LevelSelector } from '../components/LevelSelector.js';

export function getNumberPuzzleForLevel(levelNum) {
  // Nivel 1: El clásico default [1, 2, '?', 4, 5]
  if (levelNum === 1) {
    return {
      sequence: [1, 2, '?', 4, 5],
      correct: 3,
      options: [3, 6, 2],
      helperText: '¿Qué número falta en el trencito?'
    };
  }

  // Generador didáctico para los niveles 2 al 50
  const start = ((levelNum - 1) % 15) + 1;
  const missingOffset = ((levelNum * 2) % 4) + 1; // 1, 2 o 3
  const seq = [];
  let correctVal = 0;

  for (let i = 0; i < 5; i++) {
    const val = start + i;
    if (i === missingOffset) {
      seq.push('?');
      correctVal = val;
    } else {
      seq.push(val);
    }
  }

  const wrong1 = correctVal + 1;
  const wrong2 = Math.max(1, correctVal - 2);
  const options = [correctVal, wrong1, wrong2].sort(() => 0.5 - Math.random());

  return {
    sequence: seq,
    correct: correctVal,
    options: options,
    helperText: `Nivel ${levelNum}: ¿Qué número completa el trencito?`
  };
}

export class NumbersScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.currentLevel = null;
  }

  render(container) {
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'numbers',
        moduleTitle: 'Números',
        moduleIcon: '🚂',
        bgClass: 'numbers-bg',
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
    const puzzle = getNumberPuzzleForLevel(this.currentLevel);

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>NÚMEROS - EL TREN MATEMÁTICO</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#00838f;">
              Juego ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board numbers-board">
          <!-- Monito ayudante -->
          <div class="character-helper bounce-gentle">
            <img src="public/assets/images/educational/monkey.svg" alt="Monito" class="helper-avatar" onerror="this.innerText='🐒'">
            <div class="speech-bubble">${puzzle.helperText}</div>
          </div>

          <!-- Trencito de números -->
          <div class="train-wrapper">
            <div class="locomotive">🚂</div>
            <div class="train-container">
              ${puzzle.sequence.map((num) => {
                if (num === '?') {
                  return `<div class="train-car missing" id="missingCar">?</div>`;
                }
                return `<div class="train-car">${num}</div>`;
              }).join('')}
            </div>
          </div>

          <!-- Opciones numéricas -->
          <div class="number-options-container" style="display:flex; flex-direction:column; align-items:center;">
            <p class="select-hint" style="font-weight:bold; color:#006064; margin-bottom:8px;">Toca el número correcto:</p>
            <div class="number-options">
              ${puzzle.options.map((opt) => `
                <button class="num-btn" data-val="${opt}">${opt}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnPlayHelperAudio">🔊 Repetir Pregunta</button>
        </footer>
      </div>
    `;

    this.bindEvents(container, puzzle);
    audio.speak(puzzle.helperText);
  }

  bindEvents(container, puzzle) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnPlayHelperAudio')?.addEventListener('click', () => {
      audio.speak(puzzle.helperText);
    });

    const missingCar = container.querySelector('#missingCar');
    const buttons = container.querySelectorAll('.num-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.target.dataset.val, 10);

        if (val === puzzle.correct) {
          audio.playSuccess();
          e.target.classList.add('correct');
          missingCar.innerText = val.toString();
          missingCar.classList.remove('missing');
          missingCar.classList.add('filled-train');

          StorageManager.completeModuleLevel('numbers', this.currentLevel, 3);
          Confetti.shoot(2500);

          setTimeout(() => {
            if (this.currentLevel < 50) {
              this.currentLevel = this.currentLevel + 1;
              this.renderGame(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1400);

        } else {
          audio.playError();
          e.target.classList.add('wrong');
          setTimeout(() => e.target.classList.remove('wrong'), 500);
          audio.speak('Ese número no va ahí, ¡intenta de nuevo!');
        }
      });
    });
  }
}
