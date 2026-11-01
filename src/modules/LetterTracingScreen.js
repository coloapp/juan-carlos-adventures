/**
 * LetterTracingScreen - Módulo "Trazando Letras" con 50 Juegos en Círculos ("Circulitos")
 * Validación pedagógica por waypoints secuenciales para asegurar trazos completos.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';
import { LevelSelector } from '../components/LevelSelector.js';
import { getWaypointsForLetter } from '../core/LetterWaypoints.js';

export const LETTER_LEVELS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S',
  'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // Retos 28 a 50 (Combinaciones y letras didácticas)
  'A', 'E', 'I', 'O', 'U', 'M', 'P', 'S', 'L', 'T',
  'D', 'N', 'C', 'R', 'B', 'V', 'G', 'F', 'J', 'Z',
  'CH', 'LL', 'RR'
];

export class LetterTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();
    this.currentLevel = null; // null = mapa de 50 circulitos, número = nivel activo
    this.currentLetter = 'A';
    this.canvas = null;
    this.ctx = null;
    this.wpCanvas = null;
    this.wpCtx = null;
    this.isDrawing = false;
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;
  }

  render(container) {
    this.student = StorageManager.getActiveStudent();

    // Si no hay nivel seleccionado, mostrar el selector de 50 circulitos
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'letter-tracing',
        moduleTitle: 'Trazando Letras',
        moduleIcon: '✏️',
        bgClass: 'letter-bg',
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
    const idx = (this.currentLevel - 1) % LETTER_LEVELS.length;
    this.currentLetter = LETTER_LEVELS[idx];
    this.waypoints = getWaypointsForLetter(this.currentLetter);
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;

    container.innerHTML = `
      <div class="tracing-module letter-bg fade-in">
        <!-- Encabezado del Módulo -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2 class="module-title">TRAZANDO: <span id="currentLetterDisplay" class="letter-highlight">${this.currentLetter}</span></h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#e65100;">
              Juego ${this.currentLevel} de 50
            </div>
          </div>
          <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
        </header>

        <!-- Contenedor Principal del Lienzo con Doble Capa -->
        <main class="canvas-container">
          <div class="canvas-wrapper">
            <!-- Guía de Fondo (Letra punteada grande) -->
            <div class="letter-guide-bg" id="letterGuideText">${this.currentLetter}</div>

            <!-- Capa de Waypoints (checkpoints pedagógicos) -->
            <canvas id="waypointsCanvas" width="600" height="380"></canvas>

            <!-- Capa interactiva de trazo del niño -->
            <canvas id="letterCanvas" width="600" height="380"></canvas>
          </div>
        </main>

        <!-- Barra Inferior de Audio y Validar -->
        <footer class="tracing-footer">
          <button class="sound-btn" id="btnPlayLetterAudio">🔊 Sonido de la ${this.currentLetter}</button>
          <div class="waypoint-status-pill" id="waypointStatus">
            Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">${this.waypoints.length}</span>
          </div>
          <button class="check-btn" id="btnCheckLetter">⭐ ¡Siguiente!</button>
        </footer>
      </div>
    `;

    this.setupCanvases(container);
    this.bindEvents(container);
    this.clearForeground();
    this.drawWaypointsOverlay();
    audio.speak(`Traza la letra ${this.currentLetter}`);
  }

  setupCanvases(container) {
    this.canvas = container.querySelector('#letterCanvas');
    this.wpCanvas = container.querySelector('#waypointsCanvas');
    if (!this.canvas || !this.wpCanvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.wpCtx = this.wpCanvas.getContext('2d');

    // Configuración del pincel mágico
    this.ctx.lineWidth = 26;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ff9800'; // Naranja vibrante
  }

  clearForeground() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawWaypointsOverlay() {
    if (!this.wpCtx || !this.wpCanvas) return;
    const W = this.wpCanvas.width;
    const H = this.wpCanvas.height;

    this.wpCtx.clearRect(0, 0, W, H);

    // 1. Línea guía punteada
    if (this.waypoints.length > 1) {
      this.wpCtx.save();
      this.wpCtx.beginPath();
      this.wpCtx.strokeStyle = 'rgba(255, 152, 0, 0.35)';
      this.wpCtx.lineWidth = 4;
      this.wpCtx.setLineDash([8, 8]);
      this.waypoints.forEach((wp, i) => {
        const x = wp.x * W;
        const y = wp.y * H;
        if (i === 0) this.wpCtx.moveTo(x, y);
        else this.wpCtx.lineTo(x, y);
      });
      this.wpCtx.stroke();
      this.wpCtx.restore();
    }

    // 2. Waypoints circulares
    this.waypoints.forEach((wp, idx) => {
      const cx = wp.x * W;
      const cy = wp.y * H;

      this.wpCtx.save();
      if (idx < this.currentWaypointIndex) {
        // Superado: verde con palomita
        this.wpCtx.fillStyle = '#4caf50';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 15, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 2.5;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 15px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText('✓', cx, cy);
      } else if (idx === this.currentWaypointIndex) {
        // Activo: círculo brillante pulsante
        this.wpCtx.fillStyle = 'rgba(255, 152, 0, 0.35)';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 26, 0, Math.PI * 2);
        this.wpCtx.fill();

        this.wpCtx.fillStyle = '#ff9800';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 17, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 3;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 15px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText(wp.label || (idx + 1).toString(), cx, cy);
      } else {
        // Futuro: guía translúcida suave
        this.wpCtx.fillStyle = 'rgba(0, 188, 212, 0.4)';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 12, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 2;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 11px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText((idx + 1).toString(), cx, cy);
      }
      this.wpCtx.restore();
    });
  }

  checkWaypointHit(x, y, container) {
    if (this.isLetterCompleted) return;
    if (this.currentWaypointIndex >= this.waypoints.length) return;

    const targetWp = this.waypoints[this.currentWaypointIndex];
    const targetX = targetWp.x * this.canvas.width;
    const targetY = targetWp.y * this.canvas.height;

    const distance = Math.hypot(x - targetX, y - targetY);

    if (distance <= 46) {
      this.currentWaypointIndex++;
      audio.playPop();

      const curElem = container.querySelector('#currentStepNum');
      if (curElem) curElem.innerText = Math.min(this.currentWaypointIndex + 1, this.waypoints.length);

      this.drawWaypointsOverlay();

      // Validación completa del trazo
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.isLetterCompleted = true;
        this.stopDrawing();
        audio.playSuccess();
        Confetti.shoot(1800);
        setTimeout(() => {
          this.onLetterCompleted(container);
        }, 550);
      }
    }
  }

  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearForeground();
      this.currentWaypointIndex = 0;
      this.isLetterCompleted = false;
      const curElem = container.querySelector('#currentStepNum');
      if (curElem) curElem.innerText = '1';
      this.drawWaypointsOverlay();
    });

    container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
      audio.speak(`Esta es la letra ${this.currentLetter}`);
    });

    container.querySelector('#btnCheckLetter')?.addEventListener('click', () => {
      this.onLetterCompleted(container);
    });

    // Ratón
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Táctil
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.startDrawing((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY, container);
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
      this.stopDrawing();
    }, { passive: false });
  }

  startDrawing(x, y, container) {
    if (this.isLetterCompleted) return;
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    audio.playBrush();
    this.checkWaypointHit(x, y, container);
  }

  draw(x, y, container) {
    if (!this.isDrawing || this.isLetterCompleted) return;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.checkWaypointHit(x, y, container);
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
  }

  onLetterCompleted(container) {
    audio.playFanfare();
    Confetti.shoot(2500);

    // Guardar progreso del nivel
    StorageManager.completeModuleLevel('letter-tracing', this.currentLevel, 3);

    setTimeout(() => {
      if (this.currentLevel < 50) {
        const next = this.currentLevel + 1;
        if (confirm(`¡Excelente! Has completado la letra ${this.currentLetter} ⭐\n\n¿Quieres pasar al Nivel ${next}?`)) {
          this.currentLevel = next;
          this.renderGame(container);
          return;
        }
      }
      this.currentLevel = null;
      this.render(container);
    }, 600);
  }
}
