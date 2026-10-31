/**
 * LetterTracingScreen - Módulo de Trazado de Letras (Abecedario A-Z)
 * Permite al niño practicar el abecedario completo con guías de trazo táctil.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';

export class LetterTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    this.currentIndex = 0;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.strokeCount = 0;
  }

  render(container) {
    const letter = this.alphabet[this.currentIndex];

    container.innerHTML = `
      <div class="tracing-module letter-bg fade-in">
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú</button>
          <h2 class="module-title">ABECEDARIO: <span id="currentLetterDisplay" class="letter-highlight">${letter}</span></h2>
          <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
        </header>

        <main class="canvas-container">
          <div class="canvas-wrapper">
            <div class="letter-guide-bg" id="letterGuideText">${letter}</div>
            <canvas id="letterCanvas" width="600" height="380"></canvas>
          </div>

          <!-- Selector rápido de letras -->
          <div class="alphabet-scroll-bar" id="alphabetBar">
            ${this.alphabet.map((l, i) => `
              <button class="alpha-pill ${i === this.currentIndex ? 'active' : ''}" data-index="${i}">
                ${l}
              </button>
            `).join('')}
          </div>
        </main>

        <footer class="tracing-footer">
          <button class="nav-arrow-btn" id="btnPrevLetter">◀ Anterior</button>
          <button class="sound-btn" id="btnPlayLetterAudio">🔊 Sonido de la ${letter}</button>
          <button class="check-btn" id="btnNextLetter">Siguiente Letra ▶</button>
        </footer>
      </div>
    `;

    this.setupCanvas(container);
    this.bindEvents(container);
    audio.speak(`Letra ${letter}`);
  }

  setupCanvas(container) {
    this.canvas = container.querySelector('#letterCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 26;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ff9800';
  }

  clearCanvas() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  bindEvents(container) {
    container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
      audio.playClick();
      this.navigator.navigate('home');
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearCanvas();
      this.strokeCount = 0;
    });

    container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
      const letter = this.alphabet[this.currentIndex];
      audio.speak(`Esta es la letra ${letter}`);
    });

    container.querySelector('#btnPrevLetter')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        audio.playClick();
        this.render(container);
      }
    });

    container.querySelector('#btnNextLetter')?.addEventListener('click', () => {
      audio.playSuccess();
      StorageManager.addStars(1);
      Confetti.shoot(1500);

      if (this.currentIndex < this.alphabet.length - 1) {
        this.currentIndex++;
        this.render(container);
      } else {
        const unlocked = rewards.unlockReward('crown_royal');
        if (unlocked) {
          Modal.showReward(unlocked, () => this.navigator.navigate('home'));
        } else {
          this.navigator.navigate('home');
        }
      }
    });

    container.querySelectorAll('.alpha-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playPop();
        this.currentIndex = parseInt(e.currentTarget.dataset.index, 10);
        this.render(container);
      });
    });

    // Eventos de dibujo táctil y ratón
    const start = (x, y) => {
      this.isDrawing = true;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      audio.playBrush();
    };

    const move = (x, y) => {
      if (!this.isDrawing) return;
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.strokeCount++;
    };

    const stop = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.ctx.closePath();
    };

    this.canvas.addEventListener('mousedown', (e) => start(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mousemove', (e) => move(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mouseup', stop);
    this.canvas.addEventListener('mouseleave', stop);

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      start((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      move((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      stop();
    }, { passive: false });
  }
}

