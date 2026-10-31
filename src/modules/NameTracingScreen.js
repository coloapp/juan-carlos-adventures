/**
 * NameTracingScreen - Módulo de Trazado de Nombre
 * Lienzo táctil interactivo para trazar el nombre letra por letra.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';

export class NameTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();
    this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    this.currentLetterIndex = 0;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.drawnPointsCount = 0;
  }

  render(container) {
    this.student = StorageManager.getActiveStudent();
    this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    this.currentLetterIndex = 0;

    container.innerHTML = `
      <div class="tracing-module fade-in">
        <!-- Encabezado del Módulo -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú</button>
          <h2 class="module-title">TRAZA TU NOMBRE: <span id="currentLetterDisplay" class="letter-highlight">J</span></h2>
          <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
        </header>

        <!-- Contenedor Principal del Lienzo -->
        <main class="canvas-container">
          <div class="canvas-wrapper">
            <!-- Guía de Fondo (Letra punteada grande) -->
            <div class="letter-guide-bg" id="letterGuideText">J</div>

            <!-- Canvas interactivo para dibujar -->
            <canvas id="tracingCanvas" width="600" height="380"></canvas>
          </div>

          <!-- Indicador del Nombre Completo y Progreso -->
          <div class="name-progress-bar" id="nameProgressContainer"></div>
        </main>

        <!-- Barra Inferior de Audio y Validar -->
        <footer class="tracing-footer">
          <button class="sound-btn" id="btnPlayPhonics">🔊 Escuchar Letra</button>
          <button class="check-btn" id="btnCheckLetter">⭐ ¡Terminé esta letra!</button>
        </footer>
      </div>
    `;

    this.initUI(container);
    this.setupCanvas(container);
    this.bindEvents(container);
    this.loadCurrentLetter(container);
  }

  initUI(container) {
    const progressContainer = container.querySelector('#nameProgressContainer');
    if (!progressContainer) return;
    progressContainer.innerHTML = '';

    for (let i = 0; i < this.targetName.length; i++) {
      const char = this.targetName[i];
      const slot = document.createElement('div');

      if (char === ' ') {
        slot.className = 'letter-slot-space';
      } else {
        slot.className = `letter-slot slot-${i}`;
        slot.innerText = char;
      }
      progressContainer.appendChild(slot);
    }
  }

  setupCanvas(container) {
    this.canvas = container.querySelector('#tracingCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Configuración del pincel mágico
    this.ctx.lineWidth = 26;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ff4081'; // Rosa neón brillante
  }

  loadCurrentLetter(container) {
    // Si es un espacio en blanco, saltarlo
    if (this.targetName[this.currentLetterIndex] === ' ') {
      this.currentLetterIndex++;
    }

    if (this.currentLetterIndex >= this.targetName.length) {
      this.onNameCompleted(container);
      return;
    }

    const currentChar = this.targetName[this.currentLetterIndex];
    const guideElem = container.querySelector('#letterGuideText');
    const displayElem = container.querySelector('#currentLetterDisplay');

    if (guideElem) guideElem.innerText = currentChar;
    if (displayElem) displayElem.innerText = currentChar;

    container.querySelectorAll('.letter-slot').forEach(slot => {
      slot.classList.remove('active');
    });

    const activeSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (activeSlot) activeSlot.classList.add('active');

    this.clearCanvas();
    this.drawnPointsCount = 0;

    // Pronunciar la letra
    audio.speak(`Traza la letra ${currentChar}`);
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
      this.drawnPointsCount = 0;
    });

    container.querySelector('#btnPlayPhonics')?.addEventListener('click', () => {
      const char = this.targetName[this.currentLetterIndex];
      audio.speak(`Letra ${char}`);
    });

    container.querySelector('#btnCheckLetter')?.addEventListener('click', () => {
      this.advanceLetter(container);
    });

    // Ratón
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing(container));
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing(container));

    // Eventos táctiles para Android / Tablet
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.startDrawing((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.draw((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY, container);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopDrawing(container);
    }, { passive: false });
  }

  startDrawing(x, y) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    audio.playBrush();
  }

  draw(x, y, container) {
    if (!this.isDrawing) return;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.drawnPointsCount++;

    // Detección automática al trazar suficiente cantidad de trazos
    if (this.drawnPointsCount > 55) {
      this.stopDrawing(container);
      this.advanceLetter(container);
    }
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
  }

  advanceLetter(container) {
    const currentSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (currentSlot) {
      currentSlot.classList.remove('active');
      currentSlot.classList.add('completed');
    }

    audio.playSuccess();
    StorageManager.addStars(1);

    this.currentLetterIndex++;
    setTimeout(() => {
      this.loadCurrentLetter(container);
    }, 600);
  }

  onNameCompleted(container) {
    audio.playFanfare();
    Confetti.shoot(3500);
    StorageManager.addStars(5);

    // Desbloquear Insignia de Oro
    const unlocked = rewards.unlockReward('star_badge');
    if (unlocked) {
      setTimeout(() => {
        Modal.showReward(unlocked, () => {
          this.navigator.navigate('open-world');
        });
      }, 700);
    } else {
      setTimeout(() => {
        alert(`¡Felicidades ${this.student.name}! Has completado el trazo de tu nombre 🎉`);
        this.navigator.navigate('home');
      }, 800);
    }
    audio.speak(`¡Felicidades ${this.student.name}! ¡Completaste todo tu nombre!`);
  }
}
