/**
 * NumbersScreen - Módulo de Números y Secuencias Numéricas
 * Trencito matemático y ejercicios de conteo para preescolar.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';

export class NumbersScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.trainPuzzles = [
      {
        sequence: [3, 4, 5, '?', 7],
        correct: 6,
        options: [6, 8, 4],
        helperText: '¿Qué número viene después del 5?'
      },
      {
        sequence: [1, 2, '?', 4, 5],
        correct: 3,
        options: [6, 3, 7],
        helperText: '¿Qué número falta en el trencito?'
      },
      {
        sequence: [6, 7, 8, '?', 10],
        correct: 9,
        options: [5, 9, 11],
        helperText: '¿Qué número va antes del 10?'
      }
    ];
    this.currentIndex = 0;
  }

  render(container) {
    const puzzle = this.trainPuzzles[this.currentIndex];

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBack">⬅️ Menú</button>
          <h2>NÚMEROS - EL TREN MATEMÁTICO</h2>
          <div class="score-box">🚂 Vagón ${this.currentIndex + 1} de ${this.trainPuzzles.length}</div>
        </header>

        <main class="game-board numbers-board">
          <!-- Monito ayudante -->
          <div class="character-helper bounce-gentle">
            <img src="public/assets/images/educational/monkey.svg" alt="Monito" class="helper-avatar">
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
          <div class="number-options-container">
            <p class="select-hint">Toca el número correcto:</p>
            <div class="number-options">
              ${puzzle.options.map(opt => `
                <button class="num-btn" data-num="${opt}">${opt}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnRepeatQuestion">🔊 Repetir Pregunta</button>
        </footer>
      </div>
    `;

    this.bindEvents(container, puzzle);
    audio.speak(puzzle.helperText);
  }

  bindEvents(container, puzzle) {
    container.querySelector('#btnBack')?.addEventListener('click', () => {
      audio.playClick();
      this.navigator.navigate('home');
    });

    container.querySelector('#btnRepeatQuestion')?.addEventListener('click', () => {
      audio.speak(puzzle.helperText);
    });

    container.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.currentTarget.dataset.num, 10);
        if (val === puzzle.correct) {
          audio.playSuccess();
          e.currentTarget.classList.add('correct');
          const missingCar = container.querySelector('#missingCar');
          if (missingCar) {
            missingCar.innerText = val.toString();
            missingCar.classList.add('filled-train');
          }

          StorageManager.addStars(2);
          Confetti.shoot(2000);
          audio.speak(`¡Muy bien! El número es ${val}`);

          setTimeout(() => {
            if (this.currentIndex < this.trainPuzzles.length - 1) {
              this.currentIndex++;
              this.render(container);
            } else {
              const unlocked = rewards.unlockReward('honor_medal');
              if (unlocked) {
                Modal.showReward(unlocked, () => this.navigator.navigate('home'));
              } else {
                this.navigator.navigate('home');
              }
            }
          }, 1500);
        } else {
          audio.playError();
          e.currentTarget.classList.add('wrong');
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 600);
          audio.speak('Ese no es, ¡prueba con otro!');
        }
      });
    });
  }
}
