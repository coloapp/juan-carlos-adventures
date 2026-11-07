/**
 * NameTracingScreen - Módulo de Trazado de Nombre con 50 Juegos en Círculos ("Circulitos")
 * Validación pedagógica por waypoints secuenciales para asegurar trazos completos.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { Modal } from '../components/Modal.js';
import { LevelSelector } from '../components/LevelSelector.js';
import { getWaypointsForLetter } from '../core/LetterWaypoints.js';

export const NAME_TRACING_LEVELS = [
  'JUAN CARLOS', 'JUAN', 'CARLOS', 'JC', 'MAMA',
  'PAPA', 'AMOR', 'CASA', 'SOL', 'LUNA',
  'OSO', 'PERRO', 'GATO', 'AGUA', 'KINDER',
  'AMIGO', 'ESCUELA', 'MAESTRA', 'JUGAR', 'DIBUJO',
  'FELIZ', 'BEBE', 'HERMANO', 'ABUELO', 'FAMILIA',
  'JUGUETE', 'PELOTA', 'DULCE', 'PARQUE', 'RISA',
  'FIESTA', 'CIELO', 'NUBE', 'FLOR', 'PAZ',
  'VIDA', 'MANO', 'PIE', 'OJO', 'BOCA',
  'TREN', 'BARCO', 'AVION', 'MUSICA', 'CANCION',
  'CUENTO', 'MAGIA', 'SUEÑO', 'ESTRELLA', 'CAMPEON'
];

export class NameTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();
    this.currentLevel = null; // null = mapa de 50 circulitos, número = nivel activo
    this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    this.currentLetterIndex = 0;
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
        moduleKey: 'name-tracing',
        moduleTitle: 'Traza tu Nombre',
        moduleIcon: '⭐',
        bgClass: 'syllables-bg',
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
    // Nivel 1 es siempre el nombre del alumno ('JUAN CARLOS')
    if (this.currentLevel === 1) {
      this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    } else {
      const idx = (this.currentLevel - 1) % NAME_TRACING_LEVELS.length;
      this.targetName = NAME_TRACING_LEVELS[idx];
    }

    this.currentLetterIndex = 0;

    container.innerHTML = `
      <div class="tracing-module fade-in">
        <!-- Encabezado del Módulo -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2 class="module-title">TRAZA: <span id="currentLetterDisplay" class="letter-highlight">J</span></h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#00796b;">
              Nivel ${this.currentLevel}: <strong>${this.targetName}</strong>
            </div>
          </div>
          <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
        </header>

        <!-- Contenedor Principal del Lienzo con Doble Capa -->
        <main class="canvas-container">
          <div class="canvas-wrapper">
            <!-- Guía de Fondo (Letra punteada grande) -->
            <div class="letter-guide-bg" id="letterGuideText">J</div>

            <!-- Capa de Waypoints (guías y checkpoints) -->
            <canvas id="waypointsCanvas" width="600" height="380"></canvas>

            <!-- Capa interactiva de trazo del niño -->
            <canvas id="tracingCanvas" width="600" height="380"></canvas>
          </div>

          <!-- Indicador del Nombre Completo y Progreso -->
          <div class="name-progress-bar" id="nameProgressContainer"></div>
        </main>

        <!-- Barra Inferior de Audio y Validar -->
        <footer class="tracing-footer">
          <button class="sound-btn" id="btnPlayPhonics">🔊 Escuchar</button>
          <div class="waypoint-status-pill" id="waypointStatus">
            Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">5</span>
          </div>
          <button class="check-btn" id="btnCheckLetter">⭐ ¡Siguiente!</button>
        </footer>
      </div>
    `;

    this.initUI(container);
    this.setupCanvases(container);
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

  setupCanvases(container) {
    this.canvas = container.querySelector('#tracingCanvas');
    this.wpCanvas = container.querySelector('#waypointsCanvas');
    if (!this.canvas || !this.wpCanvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.wpCtx = this.wpCanvas.getContext('2d');

    // Configuración del pincel mágico
    this.ctx.lineWidth = 26;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ff4081'; // Neón rosa brillante
  }

  loadCurrentLetter(container) {
    // Si es un espacio, saltarlo
    if (this.targetName[this.currentLetterIndex] === ' ') {
      this.currentLetterIndex++;
    }

    if (this.currentLetterIndex >= this.targetName.length) {
      this.onWordCompleted(container);
      return;
    }

    const currentChar = this.targetName[this.currentLetterIndex];
    this.waypoints = getWaypointsForLetter(currentChar);
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;

    const guideElem = container.querySelector('#letterGuideText');
    const displayElem = container.querySelector('#currentLetterDisplay');
    if (guideElem) guideElem.innerText = currentChar;
    if (displayElem) displayElem.innerText = currentChar;

    container.querySelectorAll('.letter-slot').forEach(slot => slot.classList.remove('active'));
    const activeSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (activeSlot) activeSlot.classList.add('active');

    this.updateStatusPill(container);
    this.clearForeground();
    this.drawWaypointsOverlay();

    audio.speak(`Traza la letra ${currentChar}`);
  }

  updateStatusPill(container) {
    const curElem = container.querySelector('#currentStepNum');
    const totalElem = container.querySelector('#totalStepsNum');
    if (curElem) curElem.innerText = Math.min(this.currentWaypointIndex + 1, this.waypoints.length);
    if (totalElem) totalElem.innerText = this.waypoints.length;
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

    // 1. Dibujar línea guía punteada entre los waypoints
    if (this.waypoints.length > 1) {
      this.wpCtx.save();
      this.wpCtx.beginPath();
      this.wpCtx.strokeStyle = 'rgba(0, 188, 212, 0.35)';
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

    // 2. Dibujar cada waypoint circular con estados pedagógicos
    this.waypoints.forEach((wp, idx) => {
      const cx = wp.x * W;
      const cy = wp.y * H;

      this.wpCtx.save();
      if (idx < this.currentWaypointIndex) {
        // Waypoint superado: estrella verde con palomita
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
        // Waypoint activo: círculo brillante pulsante
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
        // Waypoint futuro: guía translúcida suave
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

    // Radio de captura generoso para niños de preescolar (46 píxeles)
    const distance = Math.hypot(x - targetX, y - targetY);

    if (distance <= 46) {
      // Punto superado
      this.currentWaypointIndex++;
      audio.playPop();
      this.updateStatusPill(container);
      this.drawWaypointsOverlay();

      // REGLA FUNDAMENTAL: Solo avanza cuando TODOS los waypoints se han tocado en orden
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.isLetterCompleted = true;
        this.stopDrawing();
        audio.playSuccess();
        Confetti.shoot(1800);
        setTimeout(() => {
          this.advanceLetter(container);
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
      this.updateStatusPill(container);
      this.drawWaypointsOverlay();
    });

    container.querySelector('#btnPlayPhonics')?.addEventListener('click', () => {
      const char = this.targetName[this.currentLetterIndex];
      audio.speak(`Letra ${char}`);
    });

    container.querySelector('#btnCheckLetter')?.addEventListener('click', () => {
      this.advanceLetter(container);
    });

    // Ratón
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Eventos táctiles para Android / Tablet
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
    }, 550);
  }

  onWordCompleted(container) {
    audio.playFanfare();
    Confetti.shoot(3500);

    // Guardar progreso del nivel de 50 circulitos
    StorageManager.completeModuleLevel('name-tracing', this.currentLevel, 3);

    const unlocked = rewards.unlockReward('star_badge');
    setTimeout(() => {
      if (unlocked) {
        Modal.showReward(unlocked, () => {
          this.currentLevel = null;
          this.render(container);
        });
      } else {
        this.currentLevel = null;
        this.render(container);
      }
    }, 1200);

    audio.speak(`¡Excelente trabajo ${this.student.name}! ¡Nivel ${this.currentLevel} completado!`);
  }
}
