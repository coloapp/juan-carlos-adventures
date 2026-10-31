/**
 * SyllablesScreen - Módulo de Formación de Sílabas y Palabras
 * Basado en las metodologías de lectoescritura de los libros de texto SEP y Gonvill.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';

export class SyllablesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.words = [
      {
        word: 'ELEFANTE',
        image: 'public/assets/images/educational/elephant.svg',
        syllables: ['E', 'LE', 'FAN', 'TE'],
        missingIndex: 1, // 'LE'
        options: ['LE', 'MA', 'TO']
      },
      {
        word: 'PELOTA',
        image: 'public/assets/icons/shapes.svg',
        syllables: ['PE', 'LO', 'TA'],
        missingIndex: 1, // 'LO'
        options: ['SA', 'LO', 'RA']
      },
      {
        word: 'MONITO',
        image: 'public/assets/images/educational/monkey.svg',
        syllables: ['MO', 'NI', 'TO'],
        missingIndex: 0, // 'MO'
        options: ['PA', 'SO', 'MO']
      },
      {
        word: 'ESTRELLA',
        image: 'public/assets/images/items/star.svg',
        syllables: ['ES', 'TRE', 'LLA'],
        missingIndex: 1, // 'TRE'
        options: ['TRE', 'PLO', 'BRI']
      }
    ];
    this.currentIndex = 0;
  }

  render(container) {
    const item = this.words[this.currentIndex];
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBack">⬅️ Menú</button>
          <h2>SÍLABAS - FORMAR PALABRAS</h2>
          <div class="score-box">⭐ <span id="score">${student.stars || 0} Estrellas</span></div>
        </header>

        <main class="game-board">
          <div class="word-card-box">
            <div class="visual-hint">
              <img src="${item.image}" alt="${item.word}" class="syllable-image bounce-gentle">
            </div>

            <div class="word-puzzle">
              ${item.syllables.map((syl, idx) => {
                if (idx === item.missingIndex) {
                  return `<span class="drop-zone" id="dropZone">?</span>`;
                }
                return `<span class="static-syllable">${syl}</span>`;
              }).join('')}
            </div>

            <p class="instruction-text">¿Qué sílaba falta para completar <strong>${item.word}</strong>?</p>

            <div class="syllables-options" id="optionsContainer">
              ${item.options.map(opt => `
                <button class="syllable-btn" data-syl="${opt}">${opt}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnHearWord">🔊 Escuchar Palabra</button>
        </footer>
      </div>
    `;

    this.bindEvents(container, item);
    audio.speak(`¿Qué sílaba falta para escribir ${item.word}?`);
  }

  bindEvents(container, item) {
    container.querySelector('#btnBack')?.addEventListener('click', () => {
      audio.playClick();
      this.navigator.navigate('home');
    });

    container.querySelector('#btnHearWord')?.addEventListener('click', () => {
      audio.speak(item.word);
    });

    container.querySelectorAll('.syllable-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.currentTarget.dataset.syl;
        const correctSyl = item.syllables[item.missingIndex];

        if (selected === correctSyl) {
          // Acierto
          audio.playSuccess();
          e.currentTarget.classList.add('correct');
          const dropZone = container.querySelector('#dropZone');
          if (dropZone) {
            dropZone.innerText = correctSyl;
            dropZone.classList.add('solved');
          }

          StorageManager.addStars(2);
          Confetti.shoot(2000);
          audio.speak(`¡Excelente! ${item.word}`);

          setTimeout(() => {
            if (this.currentIndex < this.words.length - 1) {
              this.currentIndex++;
              this.render(container);
            } else {
              // Completó el módulo
              const unlocked = rewards.unlockReward('toy_car');
              if (unlocked) {
                Modal.showReward(unlocked, () => this.navigator.navigate('home'));
              } else {
                this.navigator.navigate('home');
              }
            }
          }, 1400);
        } else {
          // Intenta de nuevo
          audio.playError();
          e.currentTarget.classList.add('wrong');
          setTimeout(() => {
            e.currentTarget.classList.remove('wrong');
          }, 600);
          audio.speak('¡Inténtalo otra vez!');
        }
      });
    });
  }
}

