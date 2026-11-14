/**
 * NameTracingScreen.js - Módulo de Trazado de Nombre y Palabras Clave
 * Digitalización interactiva y fiel al cuaderno escolar de preescolar (SEP / Gonvill).
 * 
 * Recreado con el Motor Universal StrokeGenerator:
 * - Soporte dinámico de trazos continuos para todo el abecedario A-Z.
 * - Validación pedagógica por recorrido continuo (desarrollo de memoria muscular).
 * - Cero "boom se llena" al primer toque: el niño traza el recorrido real.
 * - Guía visual animada (estrellita viajera) y números secuenciales 1, 2, 3...
 * - Paleta de colores de crayón en tiempo real.
 * - 50 Niveles en Círculos (Nivel 1: "JUAN CARLOS", seguido de palabras de kínder).
 * - Cinta 3D del Nombre Completo con fichas táctiles que avanzan letra por letra.
 * - Cero alertas emergentes (alert/confirm), transición automática fluida y celebración festiva.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';
import { ArabotAssistant } from '../components/ArabotAssistant.js';
import { StrokeGenerator } from '../core/StrokeGenerator.js';

// Catálogo de 50 niveles de trazado de nombre y palabras de preescolar
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
    this.currentLevel = null; // null = selector de 50 niveles
    this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    this.currentLetterIndex = 0;

    // Asistente ARABOT
    this.arabot = null;

    // Lienzos HTML5 superpuestos
    this.bgCanvas = null;
    this.bgCtx = null;
    this.paintCanvas = null;
    this.paintCtx = null;
    this.fxCanvas = null;
    this.fxCtx = null;

    // Estado del trazo
    this.isDrawing = false;
    this.lastPoint = null;
    this.activeCrayonColor = '#e91e63'; // Rosa mexicano brillante tipo crayón
    this.activeStrokes = [];
    this.currentStrokeIndex = 0;
    this.isLetterCompleted = false;

    // Partículas de estrellitas mágicas
    this.sparkles = [];
    this.animFrameId = null;

    // Eventos de puntero
    this.activePointerId = null;
    this.boundPointerMove = null;
    this.boundPointerUp = null;
  }

  resetState() {
    this.currentLevel = null;
    this.currentLetterIndex = 0;
    this.cleanup();
  }

  // ==========================================================================
  // ORQUESTADOR DE VISTAS
  // ==========================================================================
  render(container) {
    this.student = StorageManager.getActiveStudent();
    this.cleanup();

    // 1. Selector de 50 niveles en círculos
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'name-tracing',
        moduleTitle: 'Traza tu Nombre',
        moduleIcon: '⭐',
        title: 'Traza tu Nombre',
        icon: '⭐',
        totalLevels: 50,
        onBackHome: () => {
          audio.playClick();
          this.navigator.navigate('home');
        },
        onBack: () => {
          audio.playClick();
          this.navigator.navigate('home');
        },
        onSelectLevel: (lvl) => {
          audio.playClick();
          this.currentLevel = lvl;
          this.renderGame(container);
        }
      });
      return;
    }

    // 2. Nivel activo de trazado
    this.renderGame(container);
  }

  // ==========================================================================
  // VISTA DEL JUEGO: CUADERNO CALIGRÁFICO
  // ==========================================================================
  renderGame(container) {
    this.cleanup();

    // Nivel 1 es siempre el nombre del niño
    if (this.currentLevel === 1) {
      this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    } else {
      const idx = (this.currentLevel - 1) % NAME_TRACING_LEVELS.length;
      this.targetName = NAME_TRACING_LEVELS[idx];
    }

    this.currentLetterIndex = 0;

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="nameTracingModule">
        <!-- Encabezado con ARABOT centrado y controles infantiles -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          
          <div class="arabot-top-anchor" id="arabotAnchor">
            <!-- ARABOT se monta aquí -->
          </div>

          <div class="header-actions">
            <!-- Paleta de crayones en miniatura -->
            <div class="mini-crayons-bar">
              <button class="mini-crayon active" data-color="#e91e63" style="background:#e91e63;" title="Rosa"></button>
              <button class="mini-crayon" data-color="#ff5722" style="background:#ff5722;" title="Naranja"></button>
              <button class="mini-crayon" data-color="#4caf50" style="background:#4caf50;" title="Verde"></button>
              <button class="mini-crayon" data-color="#00bcd4" style="background:#00bcd4;" title="Celeste"></button>
              <button class="mini-crayon" data-color="#9c27b0" style="background:#9c27b0;" title="Morado"></button>
            </div>
            <button class="sound-btn" id="btnPlayPhonics">🔊 Escuchar</button>
            <button class="clear-btn" id="btnClearCanvas">🧹 Borrar</button>
          </div>
        </header>

        <!-- Espacio de trabajo del cuaderno escolar -->
        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>TRAZA TU NOMBRE: <span class="letter-highlight" id="currentLetterDisplay">J</span></h2>
            <p class="notebook-instruction" id="nameInstructionText">
              Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">2</span> • Sigue la guía punteada con tu dedito.
            </p>
          </div>

          <!-- Contenedor del lienzo de cuaderno alineado a 760x420 -->
          <div class="notebook-grid-container" id="nameNotebookContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>

          <!-- Cinta interactiva del Nombre Completo en fichas 3D -->
          <div class="name-progress-bar" id="nameProgressContainer"></div>
        </main>

        <!-- Banner de transición automática -->
        <div class="auto-transition-banner" id="autoTransitionBanner" style="display:none;">
          <div class="transition-card bounce-in">
            <div class="transition-stars">⭐⭐⭐</div>
            <div class="transition-title">¡INCREÍBLE!</div>
            <div class="transition-msg" id="transitionMsg">¡Completaste tu nombre con éxito!</div>
            <div class="transition-progress-bar">
              <div class="progress-fill" id="transitionProgressFill"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupArabot(container);
    this.setupCanvases(container);
    this.initNameRibbon(container);
    this.startFxLoop();
    this.bindEvents(container);
    this.loadCurrentLetter(container);
  }

  setupArabot(container) {
    const anchor = container.querySelector('#arabotAnchor');
    if (!anchor) return;

    this.arabot = new ArabotAssistant({
      onHelpClick: () => {
        this.playArabotHint();
      }
    });

    this.arabot.mount(anchor);
  }

  playArabotHint() {
    if (!this.arabot) return;
    const currentChar = this.targetName[this.currentLetterIndex] || 'A';
    this.arabot.speak(`¡Pasa tu dedito siguiendo los números para trazar la letra <strong>${currentChar}</strong>!`);
    this.arabot.bounceHead();
  }

  setupCanvases(container) {
    this.bgCanvas = container.querySelector('#bgCanvas');
    this.paintCanvas = container.querySelector('#paintCanvas');
    this.fxCanvas = container.querySelector('#fxCanvas');

    if (!this.bgCanvas || !this.paintCanvas || !this.fxCanvas) return;

    this.bgCtx = this.bgCanvas.getContext('2d');
    this.paintCtx = this.paintCanvas.getContext('2d');
    this.fxCtx = this.fxCanvas.getContext('2d');
  }

  // ==========================================================================
  // CINTA INTERACTIVA DEL NOMBRE COMPLETO
  // ==========================================================================
  initNameRibbon(container) {
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

  // ==========================================================================
  // CARGA DE LA LETRA ACTUAL
  // ==========================================================================
  loadCurrentLetter(container) {
    // Si es un espacio en blanco, saltarlo automáticamente
    while (this.currentLetterIndex < this.targetName.length && this.targetName[this.currentLetterIndex] === ' ') {
      this.currentLetterIndex++;
    }

    // Si terminó todas las letras del nombre -> Ganar nivel
    if (this.currentLetterIndex >= this.targetName.length) {
      this.onWordCompleted(container);
      return;
    }

    const currentChar = this.targetName[this.currentLetterIndex];
    
    // Generar trazos dinámicos con StrokeGenerator centrados en el cuaderno
    const bounds = { x: (760 - 280) / 2, y: 70, width: 280, height: 260 };
    this.activeStrokes = StrokeGenerator.getStrokes(currentChar, bounds, true);
    this.currentStrokeIndex = 0;
    this.isLetterCompleted = false;

    // Actualizar indicador de letra
    const displayElem = container.querySelector('#currentLetterDisplay');
    if (displayElem) displayElem.innerText = currentChar;

    // Actualizar cinta de letras
    container.querySelectorAll('.letter-slot').forEach(slot => slot.classList.remove('active'));
    const activeSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (activeSlot) activeSlot.classList.add('active');

    this.updateStatusPill(container);
    this.clearPaintCanvas();
    this.drawNotebookBackground(currentChar);

    // Bienvenida vocal de Arabot
    audio.speak(`Traza la letra ${currentChar}`);
  }

  updateStatusPill(container) {
    const curElem = container.querySelector('#currentStepNum');
    const totalElem = container.querySelector('#totalStepsNum');
    if (curElem) curElem.innerText = Math.min(this.currentStrokeIndex + 1, Math.max(1, this.activeStrokes.length));
    if (totalElem) totalElem.innerText = Math.max(1, this.activeStrokes.length);
  }

  // ==========================================================================
  // DIBUJO DEL FONDO: CUADRÍCULA AZUL + RENGLONES + GUÍAS GENERADAS
  // ==========================================================================
  drawNotebookBackground(currentChar) {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Cuadrícula azul escolar (38px x 38px)
    const gridSize = 38;
    ctx.save();
    ctx.strokeStyle = 'rgba(41, 182, 246, 0.22)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Renglón caligráfico de cuaderno (línea superior, línea media discontinua, línea base)
    const topY = 65;
    const midY = 205;
    const baseY = 345;

    ctx.save();
    // Fondo tenue del renglón
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillRect(0, topY, W, baseY - topY);

    // Línea superior del renglón
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(W, topY);
    ctx.stroke();

    // Línea media discontinua
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();

    // Línea base del renglón
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(W, baseY);
    ctx.stroke();
    ctx.restore();

    // 3. Guías direccionales generadas por StrokeGenerator
    StrokeGenerator.renderStrokeGuides(ctx, this.activeStrokes, this.currentStrokeIndex, '#1565c0');
  }

  // ==========================================================================
  // EVENTOS TÁCTILES Y DE RATÓN
  // ==========================================================================
  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
      this.currentStrokeIndex = 0;
      this.isLetterCompleted = false;
      this.updateStatusPill(container);
      const char = this.targetName[this.currentLetterIndex] || 'A';
      this.drawNotebookBackground(char);
    });

    container.querySelector('#btnPlayPhonics')?.addEventListener('click', () => {
      const char = this.targetName[this.currentLetterIndex];
      audio.speak(`Letra ${char}`);
      if (this.arabot) this.arabot.bounceHead();
    });

    // Selección de colores de crayón
    container.querySelectorAll('.mini-crayon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        container.querySelectorAll('.mini-crayon').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCrayonColor = btn.dataset.color || '#e91e63';
      });
    });

    const canvas = this.paintCanvas;
    if (!canvas) return;

    // Pointer Events universales
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.activePointerId = e.pointerId;
      const pt = this.getCanvasPoint(e);
      this.handlePointerDown(pt.x, pt.y);
    }, { passive: false });

    this.boundPointerMove = (e) => {
      e.preventDefault();
      if (!this.isDrawing || (this.activePointerId !== null && e.pointerId !== this.activePointerId)) return;
      const pt = this.getCanvasPoint(e);
      this.handlePointerMove(pt.x, pt.y, container);
    };

    this.boundPointerUp = (e) => {
      if (this.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== this.activePointerId) return;
      this.activePointerId = null;
      this.handlePointerUp();
    };

    canvas.addEventListener('pointermove', this.boundPointerMove, { passive: false });
    canvas.addEventListener('pointerup', this.boundPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', this.boundPointerUp, { passive: false });
  }

  getCanvasPoint(e) {
    const canvas = this.paintCanvas;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handlePointerDown(x, y) {
    if (this.isLetterCompleted) return;
    this.isDrawing = true;
    this.lastPoint = { x, y };

    this.drawCrayonPoint(x, y);
    audio.playBrush();
    // No se completa en pointerdown para obligar al trazo por recorrido continuo (memoria muscular)
  }

  handlePointerMove(x, y, container) {
    if (!this.isDrawing || !this.lastPoint || this.isLetterCompleted) return;

    const dx = x - this.lastPoint.x;
    const dy = y - this.lastPoint.y;
    const stepDist = Math.hypot(dx, dy);
    if (stepDist < 2.5) return;

    this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, x, y);
    this.lastPoint = { x, y };

    // Evaluar progreso con StrokeGenerator
    const currentStroke = this.activeStrokes[this.currentStrokeIndex];
    if (!currentStroke || currentStroke.completed) return;

    const res = StrokeGenerator.checkStrokeProgress(currentStroke, { x, y }, stepDist, 36);
    if (res.isComplete) {
      this.onStrokeCompleted(currentStroke, x, y, container);
    }
  }

  handlePointerUp() {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  drawCrayonPoint(x, y) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    ctx.save();
    ctx.fillStyle = this.activeCrayonColor;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCrayonSegment(fromX, fromY, toX, toY) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    ctx.save();
    ctx.strokeStyle = this.activeCrayonColor;
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // COMPLETADO DE TRAZO Y AVANCE DE LETRA
  // ==========================================================================
  onStrokeCompleted(stroke, x, y, container) {
    // Desactivar dibujo inmediatamente para obligar al niño a levantar el dedito
    this.isDrawing = false;
    this.lastPoint = null;
    this.activePointerId = null;

    audio.playStar();
    this.emitStarBurst(x, y);

    // Fijar trazo completo nítido en el lienzo
    StrokeGenerator.renderCompletedStroke(this.paintCtx, stroke, this.activeCrayonColor);

    this.currentStrokeIndex++;
    this.updateStatusPill(container);

    const currentChar = this.targetName[this.currentLetterIndex];
    this.drawNotebookBackground(currentChar);

    if (this.currentStrokeIndex >= this.activeStrokes.length) {
      this.onLetterCompleted(container, currentChar);
    } else {
      if (this.arabot) {
        this.arabot.speak(`¡Bien! Sigue con el paso ${this.currentStrokeIndex + 1} ⭐`);
      }
    }
  }

  onLetterCompleted(container, currentChar) {
    this.isLetterCompleted = true;
    this.isDrawing = false;
    this.lastPoint = null;

    audio.playSuccess();
    this.emitStarBurst(this.paintCanvas.width / 2, this.paintCanvas.height / 2);

    // Iluminar la ficha de la letra en la cinta
    const currentSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (currentSlot) {
      currentSlot.classList.remove('active');
      currentSlot.classList.add('completed');
    }

    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡Completaste la letra <strong>${currentChar}</strong>! ⭐`, 1600);
    }

    StorageManager.addStars(1);

    // Avanzar a la siguiente letra después de 650ms
    setTimeout(() => {
      this.currentLetterIndex++;
      this.loadCurrentLetter(container);
    }, 650);
  }

  // ==========================================================================
  // COMPLETADO DE PALABRA / NOMBRE COMPLETO
  // ==========================================================================
  onWordCompleted(container) {
    audio.playCelebration();
    Confetti.shoot(3500);

    // Guardar progreso en StorageManager
    StorageManager.completeModuleLevel('name-tracing', this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    if (this.arabot) {
      this.arabot.celebrate(`¡Felicidades ${this.student.name}! ¡Escribiste "${this.targetName}" completo! 🎓🌟`, 3200);
    }

    // Mostrar banner de transición automática
    const banner = container.querySelector('#autoTransitionBanner');
    const fill = container.querySelector('#transitionProgressFill');
    const msg = container.querySelector('#transitionMsg');

    if (banner) {
      if (msg) msg.innerText = `¡Completaste "${this.targetName}" con éxito!`;
      banner.style.display = 'flex';
      if (fill) {
        fill.style.width = '0%';
        setTimeout(() => { fill.style.width = '100%'; }, 50);
      }
    }

    // Transición automática al siguiente nivel después de 2.2s
    setTimeout(() => {
      if (this.currentLevel < NAME_TRACING_LEVELS.length) {
        this.currentLevel++;
        this.renderGame(container);
      } else {
        this.currentLevel = null;
        this.render(container);
      }
    }, 2200);
  }

  // ==========================================================================
  // EFECTO MÁGICO DE ESTRELLITAS (SPARKLE BURST)
  // ==========================================================================
  emitStarBurst(x, y) {
    const colors = ['#ffd700', '#ffeb3b', '#ff9800', '#00e5ff', '#76ff03', '#ff4081'];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 6,
        life: 1,
        decay: 0.035 + Math.random() * 0.025
      });
    }
  }

  startFxLoop() {
    const loop = () => {
      this.renderFxFrame();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  renderFxFrame() {
    if (!this.fxCtx || !this.fxCanvas) return;
    const ctx = this.fxCtx;
    ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

    // 1. Partículas mágicas
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s * 0.35, p.y - s * 0.35);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x, p.y + s);
      ctx.lineTo(p.x - s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x - s, p.y);
      ctx.lineTo(p.x - s * 0.35, p.y - s * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Guía animada suave con estrellita viajera
    const activeStroke = this.activeStrokes[this.currentStrokeIndex];
    if (activeStroke && !this.isDrawing && !this.isLetterCompleted) {
      const t = (performance.now() % 2200) / 2200;
      StrokeGenerator.renderAnimatedPointer(ctx, activeStroke, t);
    }
  }

  clearPaintCanvas() {
    if (!this.paintCtx || !this.paintCanvas) return;
    this.paintCtx.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
  }

  cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.arabot) {
      this.arabot.unmount();
      this.arabot = null;
    }
    this.sparkles = [];
    this.isDrawing = false;
    this.activePointerId = null;
  }
}
