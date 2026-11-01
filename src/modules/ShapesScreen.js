/**
 * ShapesScreen - Módulo "Figuras" con 50 Juegos en Círculos ("Circulitos")
 * Reconocimiento de figuras geométricas, colores y secuencias didácticas.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';
import { LevelSelector } from '../components/LevelSelector.js';

export class ShapesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.currentLevel = null;
    this.shapes = [
      { name: 'CÍRCULO', shapeType: 'circle', objectText: '🍩 Como una dona deliciosa', color: '#ff5722' },
      { name: 'TRIÁNGULO', shapeType: 'triangle', objectText: '🍕 Como una rebanada de pizza', color: '#ffb300' },
      { name: 'CUADRADO', shapeType: 'square', objectText: '🎁 Como una caja de regalo', color: '#4caf50' },
      { name: 'ESTRELLA', shapeType: 'star', objectText: '⭐ Como las estrellas del cielo', color: '#9c27b0' }
    ];
    this.currentColor = '#ff5722';
  }

  render(container) {
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'shapes',
        moduleTitle: 'Figuras',
        moduleIcon: '🎨',
        bgClass: 'shapes-bg',
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

    // Nivel 1: Taller de Pintura de Figuras Geométricas (Juego Default)
    if (this.currentLevel === 1) {
      container.innerHTML = `
        <div class="module-container shapes-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
            <div style="text-align:center;">
              <h2>FIGURAS GEOMÉTRICAS Y COLORES</h2>
              <div style="font-size:0.8rem; font-weight:bold; color:#c2185b;">
                Juego 1 de 50: Taller de Colores
              </div>
            </div>
            <div class="score-box">⭐ ${student.stars || 0}</div>
          </header>

          <main class="shapes-game-board">
            <div class="color-palette-bar">
              <span>Pincel Mágico:</span>
              <button class="palette-swatch active" style="background:#ff5722" data-color="#ff5722"></button>
              <button class="palette-swatch" style="background:#ffeb3b" data-color="#ffeb3b"></button>
              <button class="palette-swatch" style="background:#4caf50" data-color="#4caf50"></button>
              <button class="palette-swatch" style="background:#00bcd4" data-color="#00bcd4"></button>
              <button class="palette-swatch" style="background:#e91e63" data-color="#e91e63"></button>
              <button class="palette-swatch" style="background:#9c27b0" data-color="#9c27b0"></button>
            </div>

            <div class="shapes-grid">
              ${this.shapes.map(item => `
                <div class="shape-card" data-shape="${item.name}">
                  <div class="shape-figure-box">
                    <div class="shape-element ${item.shapeType}" style="--current-fill: ${item.color}"></div>
                  </div>
                  <h3 class="shape-name">${item.name}</h3>
                  <p class="shape-desc">${item.objectText}</p>
                  <button class="shape-action-btn">🖌️ Pintar</button>
                </div>
              `).join('')}
            </div>
          </main>

          <footer class="module-footer">
            <button class="check-btn" id="btnFinishShapes">⭐ ¡Completar Nivel 1!</button>
          </footer>
        </div>
      `;

      this.bindLevel1Events(container);
      audio.speak('Elige un color y pinta las figuras');
      return;
    }

    // Niveles 2 al 50: Desafíos pedagógicos ("Toca la figura correcta")
    const target = this.shapes[(this.currentLevel - 2) % this.shapes.length];
    const shuffled = [...this.shapes].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container shapes-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>DESAFÍO DE FIGURAS</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#c2185b;">
              Juego ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:white; padding:18px 28px; border-radius:24px; border:3px solid #f06292; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:92vw;">
            <h3 style="color:#ad1457; font-size:clamp(1.2rem, 3vh, 1.7rem); margin:0 0 16px 0;">
              ¿Cuál de estas figuras es el <strong>${target.name}</strong>?
            </h3>

            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:14px; justify-items:center;">
              ${shuffled.map(s => `
                <button class="shape-card" data-chosen="${s.name}" style="padding:14px 20px; cursor:pointer;">
                  <div class="shape-figure-box">
                    <div class="shape-element ${s.shapeType}" style="--current-fill: ${s.color}"></div>
                  </div>
                  <h4 style="margin:4px 0 0 0; color:#37474f;">${s.name}</h4>
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnRepeatChallenge">🔊 Repetir: ${target.name}</button>
        </footer>
      </div>
    `;

    this.bindChallengeEvents(container, target);
    audio.speak(`¿Cuál figura es el ${target.name}?`);
  }

  bindLevel1Events(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelectorAll('.palette-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        container.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        this.currentColor = e.target.dataset.color;
        audio.playClick();
      });
    });

    container.querySelectorAll('.shape-card').forEach(card => {
      card.addEventListener('click', () => {
        const shapeElem = card.querySelector('.shape-element');
        if (shapeElem) {
          shapeElem.style.setProperty('--current-fill', this.currentColor);
          audio.playBrush();
          Confetti.shoot(800);
        }
      });
    });

    container.querySelector('#btnFinishShapes')?.addEventListener('click', () => {
      audio.playFanfare();
      Confetti.shoot(2500);
      StorageManager.completeModuleLevel('shapes', 1, 3);
      setTimeout(() => {
        if (confirm('¡Felicidades! Has pintado todas las figuras ⭐\n\n¿Quieres jugar el Nivel 2?')) {
          this.currentLevel = 2;
          this.renderGame(container);
        } else {
          this.currentLevel = null;
          this.render(container);
        }
      }, 700);
    });
  }

  bindChallengeEvents(container, target) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnRepeatChallenge')?.addEventListener('click', () => {
      audio.speak(`Toca el ${target.name}`);
    });

    container.querySelectorAll('.shape-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const chosen = card.dataset.chosen;
        if (chosen === target.name) {
          audio.playSuccess();
          card.style.borderColor = '#4caf50';
          card.style.background = '#e8f5e9';
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('shapes', this.currentLevel, 3);
          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Correcto! Es el ${target.name} ⭐\n\n¿Quieres pasar al Nivel ${next}?`)) {
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
          audio.speak(`Ese es un ${chosen}, ¡intenta de nuevo!`);
        }
      });
    });
  }
}
