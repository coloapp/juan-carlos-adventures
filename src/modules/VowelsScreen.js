/**
 * VowelsScreen - Módulo "Vocales" con 50 Juegos en Círculos ("Circulitos")
 * Reconocimiento fonético e ilustrado de A - E - I - O - U para preescolar.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';

export class VowelsScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.currentLevel = null;
    this.vowels = [
      { letter: 'A', word: 'Avión', emoji: '✈️', color: '#ff5722' },
      { letter: 'E', word: 'Elefante', emoji: '🐘', color: '#4caf50' },
      { letter: 'I', word: 'Isla', emoji: '🏝️', color: '#00bcd4' },
      { letter: 'O', word: 'Oso', emoji: '🐻', color: '#ff9800' },
      { letter: 'U', word: 'Uva', emoji: '🍇', color: '#9c27b0' }
    ];
  }

  render(container) {
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'vowels',
        moduleTitle: 'Vocales',
        moduleIcon: '🔤',
        bgClass: 'vowels-bg',
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

    // Nivel 1: Tablero completo interactivo de las 5 vocales
    if (this.currentLevel === 1) {
      container.innerHTML = `
        <div class="module-container vowels-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
            <div style="text-align:center;">
              <h2>LAS VOCALES: A - E - I - O - U</h2>
              <div style="font-size:0.8rem; font-weight:bold; color:#6a1b9a;">
                Juego 1 de 50 (Tablero Mágico)
              </div>
            </div>
            <div class="score-box">⭐ ${student.stars || 0}</div>
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
            <button class="check-btn" id="btnCompleteLevel">⭐ ¡Completar Nivel 1!</button>
          </footer>
        </div>
      `;

      this.bindLevel1Events(container);
      audio.speak('¡Toca cada vocal para escuchar su sonido!');
      return;
    }

    // Niveles 2 al 50: Desafíos de discriminación fonética ("Encuentra la vocal correcta")
    const targetVowel = this.vowels[(this.currentLevel - 2) % this.vowels.length];
    const shuffled = [...this.vowels].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container vowels-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>RETOS VOCÁLICOS</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#6a1b9a;">
              Juego ${this.currentLevel} de 50: Encuentra la ${targetVowel.letter}
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:white; padding:14px 24px; border-radius:24px; border:3px solid ${targetVowel.color}; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:90vw;">
            <div style="font-size: clamp(3rem, 7vh, 4.5rem);">${targetVowel.emoji}</div>
            <h3 style="color:${targetVowel.color}; font-size:clamp(1.2rem, 3vh, 1.8rem); margin:6px 0;">
              ¿Cuál es la vocal de "${targetVowel.word}"?
            </h3>
            <div style="display:flex; gap:clamp(8px, 2vw, 16px); justify-content:center; margin-top:14px;">
              ${shuffled.map(v => `
                <button class="syllable-btn" data-v="${v.letter}" style="background:${v.color}; font-size:clamp(1.4rem, 3.5vh, 2rem); min-width:clamp(48px, 9vw, 65px);">
                  ${v.letter}
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnListenChallenge">🔊 Repetir: ${targetVowel.word}</button>
        </footer>
      </div>
    `;

    this.bindChallengeEvents(container, targetVowel);
    audio.speak(`¿Cuál es la vocal de ${targetVowel.word}?`);
  }

  bindLevel1Events(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelectorAll('.vowel-card').forEach(card => {
      card.addEventListener('click', () => {
        const letter = card.dataset.vowel;
        const word = card.dataset.word;
        audio.playPop();
        audio.speak(`${letter}... de ${word}`);
      });
    });

    container.querySelector('#btnCompleteLevel')?.addEventListener('click', () => {
      audio.playFanfare();
      Confetti.shoot(2500);
      StorageManager.completeModuleLevel('vowels', 1, 3);
      setTimeout(() => {
        this.currentLevel = 2;
        this.renderGame(container);
      }, 1200);
    });
  }

  bindChallengeEvents(container, targetVowel) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnListenChallenge')?.addEventListener('click', () => {
      audio.speak(`Encuentra la vocal de ${targetVowel.word}`);
    });

    container.querySelectorAll('.syllable-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chosen = e.target.dataset.v;
        if (chosen === targetVowel.letter) {
          audio.playSuccess();
          e.target.classList.add('correct');
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('vowels', this.currentLevel, 3);
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
          audio.speak(`Esa es la letra ${chosen}, intenta de nuevo`);
        }
      });
    });
  }
}
