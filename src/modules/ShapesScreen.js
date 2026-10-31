/**
 * ShapesScreen - Módulo de Figuras Geométricas y Colores
 * Asociación de figuras con objetos reales y coloreado interactivo.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';

export class ShapesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.shapes = [
      { name: 'CÍRCULO', shapeType: 'circle', objectText: '🍩 Como una dona deliciosa', color: '#ff5722' },
      { name: 'TRIÁNGULO', shapeType: 'triangle', objectText: '🍕 Como una rebanada de pizza', color: '#ffb300' },
      { name: 'CUADRADO', shapeType: 'square', objectText: '🎁 Como una caja de regalo', color: '#4caf50' },
      { name: 'ESTRELLA', shapeType: 'star', objectText: '⭐ Como las estrellas del cielo', color: '#9c27b0' }
    ];
    this.currentColor = '#ff5722';
  }

  render(container) {
    container.innerHTML = `
      <div class="module-container shapes-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBack">⬅️ Menú</button>
          <h2>FIGURAS GEOMÉTRICAS Y COLORES</h2>
          <div class="score-box">🎨 Toca para pintar</div>
        </header>

        <main class="shapes-game-board">
          <!-- Paleta de colores para pintar -->
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
          <button class="check-btn" id="btnFinishShapes">⭐ ¡Completar Figuras!</button>
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

    container.querySelectorAll('.palette-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        audio.playPop();
        container.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentColor = e.currentTarget.dataset.color;
      });
    });

    container.querySelectorAll('.shape-card').forEach(card => {
      card.addEventListener('click', () => {
        audio.playBrush();
        const element = card.querySelector('.shape-element');
        if (element) {
          element.style.setProperty('--current-fill', this.currentColor);
          element.classList.remove('shape-bounce');
          void element.offsetWidth;
          element.classList.add('shape-bounce');
        }
        audio.speak(`${card.dataset.shape}`);
      });
    });

    container.querySelector('#btnFinishShapes')?.addEventListener('click', () => {
      audio.playSuccess();
      Confetti.shoot(2500);
      StorageManager.addStars(3);

      const unlocked = rewards.unlockReward('art_palette');
      if (unlocked) {
        Modal.showReward(unlocked, () => this.navigator.navigate('home'));
      } else {
        this.navigator.navigate('home');
      }
    });
  }
}
