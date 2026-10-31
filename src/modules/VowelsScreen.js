/**
 * VowelsScreen - Módulo de Aprendizaje de las Vocales
 * Reconocimiento fonético e ilustrado de A - E - I - O - U
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { Confetti } from '../components/Confetti.js';

export class VowelsScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.vowels = [
      { letter: 'A', word: 'Avión', emoji: '✈️', color: '#ff5722' },
      { letter: 'E', word: 'Elefante', emoji: '🐘', color: '#4caf50' },
      { letter: 'I', word: 'Isla', emoji: '🏝️', color: '#00bcd4' },
      { letter: 'O', word: 'Oso', emoji: '🐻', color: '#ff9800' },
      { letter: 'U', word: 'Uva', emoji: '🍇', color: '#9c27b0' }
    ];
  }

  render(container) {
    container.innerHTML = `
      <div class="module-container vowels-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBack">⬅️ Menú</button>
          <h2>LAS VOCALES: A - E - I - O - U</h2>
          <div class="score-box">⭐ ¡Toca cada tarjeta!</div>
        </header>

        <main class="vowels-grid-container">
          <div class="vowels-card-grid">
            ${this.vowels.map(v => `
              <div class="vowel-card" data-vowel="${v.letter}" data-word="${v.word}" style="--v-color: ${v.color}">
                <div class="vowel-letter">${v.letter}</div>
                <div class="vowel-emoji">${v.emoji}</div>
                <div class="vowel-word">${v.word}</div>
                <button class="vowel-listen-btn">🔊 Escuchar</button>
              </div>
            `).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <button class="check-btn" id="btnAllVowelsSound">🎵 Cantar Vocales</button>
        </footer>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    container.querySelector('#btnBack')?.addEventListener('click', () => {
      audio.playClick();
      this.navigator.navigate('home');
    });

    container.querySelector('#btnAllVowelsSound')?.addEventListener('click', () => {
      audio.playStar();
      Confetti.shoot(2500);
      StorageManager.addStars(2);
      audio.speak('A, E, I, O, U... ¡Las cinco vocales son geniales!');
    });

    container.querySelectorAll('.vowel-card').forEach(card => {
      card.addEventListener('click', () => {
        const letter = card.dataset.vowel;
        const word = card.dataset.word;
        audio.playPop();
        card.classList.remove('pulse-vowel');
        void card.offsetWidth;
        card.classList.add('pulse-vowel');
        audio.speak(`${letter}... de ${word}`);
      });
    });
  }
}

