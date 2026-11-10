/**
 * NameTracingScreen.js - Módulo de Trazado de Nombre y Palabras Clave
 * Digitalización interactiva y fiel al cuaderno escolar de preescolar (SEP / Gonvill).
 * 
 * Características:
 * - 50 Niveles en Círculos (Nivel 1: "JUAN CARLOS", seguido de palabras clave y vocabulario).
 * - Lienzo de Cuaderno Escolar con Cuadrícula Azul y Renglones Caligráficos Guiados.
 * - Asistente ARABOT interactivo ubicado en la parte central superior.
 * - Motor de Trazo Táctil en Tiempo Real (sensibilidad alta, cero frustración para niños).
 * - Auto-relleno suave con destello de estrellitas mágicas al completar los trazos.
 * - Cinta 3D del Nombre Completo con fichas táctiles que avanzan letra por letra.
 * - Cero alertas emergentes (alert/confirm), transición automática fluida y celebración festiva.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';
import { ArabotAssistant } from '../components/ArabotAssistant.js';
import { getWaypointsForLetter } from '../core/LetterWaypoints.js';

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
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;

    // Partículas de estrellitas mágicas
    this.sparkles = [];
    this.animFrameId = null;

    // Eventos de puntero
    this.activePointerId = null;
    this.boundPointerMove = null;
    this.boundPointerUp = null;
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
        <!-- Encabezado con ARABOT centrado para no estorbar botones -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          
          <div class="arabot-top-anchor" id="arabotAnchor">
            <!-- ARABOT se monta aquí -->
          </div>

          <div class="header-actions">
            <button class="sound-btn" id="btnPlayPhonics">🔊 Escuchar</button>
            <button class="clear-btn" id="btnClearCanvas">🧹 Borrar</button>
          </div>
        </header>

        <!-- Espacio de trabajo del cuaderno escolar -->
        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>TRAZA TU NOMBRE: <span class="letter-highlight" id="currentLetterDisplay">J</span></h2>
            <p class="notebook-instruction" id="nameInstructionText">
              Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">5</span> • Sigue las flechas y los círculos numerados.
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
    if (this.targetName[this.currentLetterIndex] === ' ') {
      this.currentLetterIndex++;
    }

    // Si terminó todas las letras del nombre -> Ganar nivel
    if (this.currentLetterIndex >= this.targetName.length) {
      this.onWordCompleted(container);
      return;
    }

    const currentChar = this.targetName[this.currentLetterIndex];
    this.rawWaypoints = getWaypointsForLetter(currentChar);
    this.scaleWaypointsToNotebook();
    this.currentWaypointIndex = 0;
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

  scaleWaypointsToNotebook() {
    if (!this.bgCanvas) return;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    // Área de la letra centrada en el cuaderno escolar
    const areaW = 390;
    const areaH = 290;
    const startX = (W - areaW) / 2;
    const startY = 60;

    this.waypoints = this.rawWaypoints.map((wp, idx) => ({
      x: startX + wp.x * areaW,
      y: startY + wp.y * areaH,
      label: wp.label || (idx + 1).toString()
    }));
  }

  updateStatusPill(container) {
    const curElem = container.querySelector('#currentStepNum');
    const totalElem = container.querySelector('#totalStepsNum');
    if (curElem) curElem.innerText = Math.min(this.currentWaypointIndex + 1, this.waypoints.length);
    if (totalElem) totalElem.innerText = this.waypoints.length;
  }

  // ==========================================================================
  // DIBUJO DEL FONDO: CUADRÍCULA AZUL + RENGLONES + LETRA PUNTEADA + WAYPOINTS
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

    // 3. Letra punteada grande en el centro del renglón
    ctx.save();
    ctx.font = 'bold 270px "Fredoka", "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.strokeText(currentChar, W / 2, baseY - 10);
    ctx.restore();

    // 4. Guías entre los waypoints con flechas direccionales
    if (this.waypoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 188, 212, 0.4)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      this.waypoints.forEach((wp, i) => {
        if (i === 0) ctx.moveTo(wp.x, wp.y);
        else ctx.lineTo(wp.x, wp.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 5. Dibujar cada waypoint circular numerado (Paso 1, 2, 3...)
    this.waypoints.forEach((wp, idx) => {
      ctx.save();
      if (idx < this.currentWaypointIndex) {
        // Waypoint superado: círculo verde esmeralda con palomita
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', wp.x, wp.y);
      } else if (idx === this.currentWaypointIndex) {
        // Waypoint activo: halo brillante naranja y número grande
        ctx.fillStyle = 'rgba(255, 152, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(wp.label || (idx + 1).toString(), wp.x, wp.y);
      } else {
        // Waypoint futuro: círculo translúcido
        ctx.fillStyle = 'rgba(0, 188, 212, 0.45)';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx + 1).toString(), wp.x, wp.y);
      }
      ctx.restore();
    });
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
      this.currentWaypointIndex = 0;
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

    const canvas = this.paintCanvas;
    if (!canvas) return;

    // Pointer Events universales
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.activePointerId = e.pointerId;
      const pt = this.getCanvasPoint(e);
      this.handlePointerDown(pt.x, pt.y, container);
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

  handlePointerDown(x, y, container) {
    if (this.isLetterCompleted) return;
    this.isDrawing = true;
    this.lastPoint = { x, y };

    this.drawCrayonPoint(x, y);
    audio.playBrush();
    this.checkWaypointHit(x, y, container);
  }

  handlePointerMove(x, y, container) {
    if (!this.isDrawing || !this.lastPoint || this.isLetterCompleted) return;

    this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, x, y);
    this.lastPoint = { x, y };
    this.checkWaypointHit(x, y, container);
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
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // DETECCIÓN DE WAYPOINTS Y AUTO-RELLENO LIMPIO
  // ==========================================================================
  checkWaypointHit(x, y, container) {
    if (this.isLetterCompleted) return;
    if (this.currentWaypointIndex >= this.waypoints.length) return;

    const targetWp = this.waypoints[this.currentWaypointIndex];

    // Radio de captura generoso para niños pequeños (52px)
    const distance = Math.hypot(x - targetWp.x, y - targetWp.y);

    if (distance <= 52) {
      this.currentWaypointIndex++;
      audio.playPop();
      this.emitStarBurst(targetWp.x, targetWp.y);
      this.updateStatusPill(container);

      const currentChar = this.targetName[this.currentLetterIndex];
      this.drawNotebookBackground(currentChar);

      // Si completó todos los pasos de la letra actual
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.onLetterCompleted(container, currentChar);
      }
    }
  }

  /**
   * Auto-rellena la letra con un trazo sólido luminoso (desaparece lo chuequito)
   */
  onLetterCompleted(container, currentChar) {
    this.isLetterCompleted = true;
    this.isDrawing = false;
    this.lastPoint = null;

    // 1. Auto-relleno suave sobre paintCanvas
    this.snapFullLetter(currentChar);
    this.emitStarBurst(this.paintCanvas.width / 2, this.paintCanvas.height / 2);
    audio.playSuccess();

    // 2. Iluminar la ficha de la letra en la cinta
    const currentSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (currentSlot) {
      currentSlot.classList.remove('active');
      currentSlot.classList.add('completed');
    }

    // 3. Celebración de Arabot
    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡Completaste la letra <strong>${currentChar}</strong>! ⭐`, 1800);
    }

    StorageManager.addStars(1);

    // 4. Avanzar a la siguiente letra después de 650ms
    setTimeout(() => {
      this.currentLetterIndex++;
      this.loadCurrentLetter(container);
    }, 650);
  }

  snapFullLetter(char) {
    if (!this.paintCtx || !this.paintCanvas) return;
    const ctx = this.paintCtx;
    const W = this.paintCanvas.width;
    const baseY = 345;

    ctx.save();
    ctx.font = 'bold 270px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(233, 30, 99, 0.7)';
    ctx.shadowBlur = 16;
    ctx.strokeText(char, W / 2, baseY - 10);
    ctx.restore();
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
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.035 + Math.random() * 0.02
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
  }

  clearPaintCanvas() {
    if (this.paintCtx && this.paintCanvas) {
      this.paintCtx.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
    }
  }

  cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.paintCanvas && this.boundPointerUp) {
      this.paintCanvas.removeEventListener('pointermove', this.boundPointerMove);
      this.paintCanvas.removeEventListener('pointerup', this.boundPointerUp);
      this.paintCanvas.removeEventListener('pointercancel', this.boundPointerUp);
      this.boundPointerUp = null;
      this.boundPointerMove = null;
    }
    if (this.arabot) {
      this.arabot.destroy();
      this.arabot = null;
    }
    this.sparkles = [];
  }
}
