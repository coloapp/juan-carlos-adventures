/**
 * NameTracingScreen.js - Módulo de Trazado de Nombre y Palabras Clave
 * Digitalización interactiva y fiel al cuaderno escolar de preescolar (SEP / Gonvill).
 * 
 * Arquitectura Multi-Juegos en Círculos:
 * 1. "Mi Nombre Completo" (50 niveles: JUAN CARLOS y variaciones del alumno)
 * 2. "Palabras de Kínder" (50 niveles: vocabulario escolar y primeras palabras)
 * 3. "Mi Familia" (50 niveles: Mamá, Papá, Abuelo y seres queridos)
 * 4. "Mis Cosas Favoritas" (50 niveles: pelota, juguete, dulce, parque...)
 * 
 * Recreado con el Motor Universal StrokeGenerator:
 * - Soporte dinámico de trazos continuos para todo el abecedario A-Z.
 * - Validación pedagógica por recorrido continuo (desarrollo de memoria muscular).
 * - Cero "boom se llena" al primer toque: el niño traza el recorrido real.
 * - Guía visual animada (estrellita viajera) y números secuenciales 1, 2, 3...
 * - Paleta de colores de crayón en tiempo real.
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

export const NAME_TRACING_SUBGAMES = [
  {
    id: 'mi_nombre',
    moduleKey: 'name_tracing_propio',
    title: 'MI NOMBRE COMPLETO',
    subtitle: '50 Niveles: Traza tu nombre letra por letra',
    icon: '⭐',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#e91e63'
  },
  {
    id: 'palabras_kinder',
    moduleKey: 'name_tracing_kinder',
    title: 'PALABRAS DE KÍNDER',
    subtitle: '50 Niveles: Casa, sol, luna, agua, escuela...',
    icon: '📖',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#1976d2'
  },
  {
    id: 'mi_familia',
    moduleKey: 'name_tracing_familia',
    title: 'MI FAMILIA',
    subtitle: '50 Niveles: Mamá, Papá, Abuelo y seres queridos',
    icon: '👨‍👩‍👧',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#43a047'
  },
  {
    id: 'cosas_favoritas',
    moduleKey: 'name_tracing_favoritos',
    title: 'COSAS FAVORITAS',
    subtitle: '50 Niveles: Pelota, dulce, juguete y diversión',
    icon: '⚽',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#8e24aa'
  }
];

// Listas de 50 palabras para cada subjuego
export const WORDS_MI_NOMBRE_50 = [
  'JUAN CARLOS', 'JUAN', 'CARLOS', 'JC', 'JUANITO', 'CARLITOS', 'CAMPEON', 'ESTRELLA', 'HEROE', 'GENIO',
  'JUAN', 'CARLOS', 'JUAN C', 'J CARLOS', 'JUANITO', 'SUPER JC', 'AMIGO JC', 'JC FELIZ', 'JC PRO', 'JC REY',
  'JUAN CARLOS', 'JUAN', 'CARLOS', 'JC', 'CAMPEON', 'ESTRELLA', 'HEROE', 'GENIO', 'JUANITO', 'CARLITOS',
  'JUAN CARLOS', 'JUAN', 'CARLOS', 'JC', 'CAMPEON', 'ESTRELLA', 'HEROE', 'GENIO', 'JUANITO', 'CARLITOS',
  'JUAN CARLOS', 'JUAN', 'CARLOS', 'JC', 'CAMPEON', 'ESTRELLA', 'HEROE', 'GENIO', 'JUANITO', 'GRAN JUAN'
];

export const WORDS_KINDER_50 = [
  'CASA', 'SOL', 'LUNA', 'AGUA', 'KINDER', 'AMIGO', 'ESCUELA', 'MAESTRA', 'JUGAR', 'DIBUJO',
  'FELIZ', 'CIELO', 'NUBE', 'FLOR', 'PAZ', 'VIDA', 'MANO', 'PIE', 'OJO', 'BOCA',
  'OSO', 'PERRO', 'GATO', 'LEON', 'PATITO', 'RANA', 'PEZ', 'VACA', 'TORO', 'PAVO',
  'ARBOL', 'HOJA', 'RAMA', 'FRUTA', 'ROCA', 'MAR', 'RIO', 'LAGO', 'NIEVE', 'VIENTO',
  'ROJO', 'AZUL', 'VERDE', 'ROSA', 'ORO', 'PLATA', 'LIBRO', 'LAPIZ', 'HOJA', 'CUADERNO'
];

export const WORDS_FAMILIA_50 = [
  'MAMA', 'PAPA', 'ABUELO', 'ABUELA', 'HERMANO', 'HERMANA', 'BEBE', 'FAMILIA', 'AMOR', 'TIO',
  'TIA', 'PRIMO', 'PRIMA', 'HOGAR', 'CUIDO', 'ABRAZO', 'BESO', 'CARIÑO', 'UNION', 'PAZ',
  'MAMI', 'PAPI', 'ABUE', 'TITO', 'TITA', 'BEBITO', 'NENE', 'HERMANITO', 'PADRES', 'HIJO',
  'CASA', 'CENA', 'MESA', 'SOPA', 'PAN', 'LECHE', 'DULCE', 'JUNTOS', 'LEALTAD', 'AYUDA',
  'SONRISA', 'ALEGRIA', 'BENDICION', 'PROTECCION', 'VIDA', 'CORAZON', 'CALOR', 'MIMO', 'TIERNO', 'GRACIAS'
];

export const WORDS_FAVORITAS_50 = [
  'JUGUETE', 'PELOTA', 'DULCE', 'PARQUE', 'RISA', 'FIESTA', 'TREN', 'BARCO', 'AVION', 'MUSICA',
  'CANCION', 'CUENTO', 'MAGIA', 'SUEÑO', 'ESTRELLA', 'CAMPEON', 'DIBUJO', 'COLOR', 'PINCEL', 'ALEGRIA',
  'PIZZA', 'HELADO', 'GALLETA', 'PASTEL', 'CHOCOLATE', 'CARAMELO', 'GLOBO', 'CIRCO', 'JUEGO', 'PISTA',
  'AUTO', 'MOTO', 'BICI', 'PATIN', 'COHETE', 'NAVE', 'ROBOT', 'DINOSAURIO', 'DRAGON', 'CASTILLO',
  'TESORO', 'CORONA', 'REY', 'REINA', 'PRINCESA', 'CABALLERO', 'ESPADA', 'AVENTURA', 'META', 'VICTORIA'
];

export class NameTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();
    this.activeSubgame = null; // null = menú de subjuegos en círculos
    this.currentLevel = null;  // 1..50
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
    this.activeSubgame = null;
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

    // Vista 1: Menú de subjuegos en círculos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // Vista 2: Selector de 50 niveles
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // Vista 3: Nivel activo de trazado
    this.renderGame(container);
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUBJUEGOS EN CÍRCULOS
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container notebook-grid-bg fade-in" id="nameTracingSubgamesMenu">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#d81b60; margin:0; font-size:clamp(1.2rem, 3.2vw, 1.8rem);">TRAZA TU NOMBRE Y PALABRAS</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#ad1457;">
              Elige una actividad en círculo para comenzar • Caligrafía Preescolar
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid">
            ${NAME_TRACING_SUBGAMES.map(game => {
              const prog = StorageManager.getModuleLevels(game.moduleKey);
              const count = Object.keys(prog.completed || {}).length;
              return `
                <button class="subgame-circle-card" data-game="${game.id}">
                  <div class="subgame-bubble ${game.bubbleClass} pulse-glow">
                    <span class="subgame-bubble-icon">${game.icon}</span>
                    <span class="subgame-levels-badge">${game.totalLevels} Niveles</span>
                  </div>
                  <span class="subgame-title-label" style="color:${game.themeColor};">${game.title}</span>
                  <span style="font-size:0.75rem; color:#455a64; font-weight:bold; margin-top:3px;">
                    ⭐ ${count}/${game.totalLevels} completados
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">💡 Toca cualquiera de los círculos para trazar con tu dedito sobre el cuaderno escolar.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
      audio.playClick();
      this.resetState();
      this.navigator.navigate('home');
    });

    container.querySelectorAll('.subgame-circle-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        this.activeSubgame = e.currentTarget.dataset.game;
        this.currentLevel = null;
        this.render(container);
      });
    });

    audio.speak('Elige una actividad de trazado');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS
  // ==========================================================================
  renderLevelSelector(container) {
    const sub = NAME_TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || NAME_TRACING_SUBGAMES[0];

    LevelSelector.render({
      container,
      moduleKey: sub.moduleKey,
      moduleTitle: sub.title,
      moduleIcon: sub.icon,
      bgClass: 'notebook-grid-bg',
      totalLevels: 50,
      onSelectLevel: (lvl) => {
        audio.playClick();
        this.currentLevel = lvl;
        this.renderGame(container);
      },
      onBackHome: () => {
        audio.playClick();
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      }
    });
  }

  // ==========================================================================
  // VISTA 3: PANTALLA DE TRAZADO CALIGRÁFICO
  // ==========================================================================
  renderGame(container) {
    this.cleanup();

    // Obtener la palabra objetivo según el subjuego activo
    if (this.activeSubgame === 'mi_nombre') {
      if (this.currentLevel === 1) {
        this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
      } else {
        const idx = (this.currentLevel - 1) % WORDS_MI_NOMBRE_50.length;
        this.targetName = WORDS_MI_NOMBRE_50[idx];
      }
    } else if (this.activeSubgame === 'palabras_kinder') {
      const idx = (this.currentLevel - 1) % WORDS_KINDER_50.length;
      this.targetName = WORDS_KINDER_50[idx];
    } else if (this.activeSubgame === 'mi_familia') {
      const idx = (this.currentLevel - 1) % WORDS_FAMILIA_50.length;
      this.targetName = WORDS_FAMILIA_50[idx];
    } else {
      const idx = (this.currentLevel - 1) % WORDS_FAVORITAS_50.length;
      this.targetName = WORDS_FAVORITAS_50[idx];
    }

    this.currentLetterIndex = 0;

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="nameTracingModule">
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
            <h2>TRAZA: <span class="letter-highlight" id="currentLetterDisplay">J</span></h2>
            <p class="notebook-instruction" id="nameInstructionText">
              Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">2</span> • Sigue la guía punteada circular con tu dedito.
            </p>
          </div>

          <!-- Contenedor del lienzo de cuaderno alineado a 760x420 -->
          <div class="notebook-grid-container" id="nameNotebookContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>

          <!-- Cinta interactiva de la Palabra en fichas 3D -->
          <div class="name-progress-bar" id="nameProgressContainer"></div>
        </main>

        <!-- Banner de transición automática -->
        <div class="auto-transition-banner" id="autoTransitionBanner" style="display:none;">
          <div class="transition-card bounce-in">
            <div class="transition-stars">⭐⭐⭐</div>
            <div class="transition-title">¡INCREÍBLE!</div>
            <div class="transition-msg" id="transitionMsg">¡Completaste con éxito!</div>
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

  loadCurrentLetter(container) {
    while (this.currentLetterIndex < this.targetName.length && this.targetName[this.currentLetterIndex] === ' ') {
      this.currentLetterIndex++;
    }

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

    audio.speak(`Traza la letra ${currentChar}`);
  }

  updateStatusPill(container) {
    const curElem = container.querySelector('#currentStepNum');
    const totalElem = container.querySelector('#totalStepsNum');
    if (curElem) curElem.innerText = Math.min(this.currentStrokeIndex + 1, Math.max(1, this.activeStrokes.length));
    if (totalElem) totalElem.innerText = Math.max(1, this.activeStrokes.length);
  }

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

    // 2. Renglón caligráfico escolar
    const topY = 65;
    const midY = 205;
    const baseY = 345;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillRect(0, topY, W, baseY - topY);

    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(W, topY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();

    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(W, baseY);
    ctx.stroke();
    ctx.restore();

    // 3. Guías circulares auténticas generadas por StrokeGenerator
    StrokeGenerator.renderDottedPaths(ctx, this.activeStrokes, this.currentStrokeIndex, '#1565c0');
  }

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
  }

  handlePointerMove(x, y, container) {
    if (!this.isDrawing || !this.lastPoint || this.isLetterCompleted) return;

    const dx = x - this.lastPoint.x;
    const dy = y - this.lastPoint.y;
    const stepDist = Math.hypot(dx, dy);
    if (stepDist < 2.5) return;

    this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, x, y);
    this.lastPoint = { x, y };

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

  onStrokeCompleted(stroke, x, y, container) {
    // Desactivar dibujo inmediatamente para obligar al niño a levantar el dedito
    this.isDrawing = false;
    this.lastPoint = null;
    this.activePointerId = null;

    audio.playStar();
    this.emitStarBurst(x, y);

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

    const currentSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (currentSlot) {
      currentSlot.classList.remove('active');
      currentSlot.classList.add('completed');
    }

    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡Completaste la letra <strong>${currentChar}</strong>! ⭐`, 1600);
    }

    StorageManager.addStars(1);

    setTimeout(() => {
      this.currentLetterIndex++;
      this.loadCurrentLetter(container);
    }, 650);
  }

  onWordCompleted(container) {
    audio.playCelebration();
    Confetti.shoot(3500);

    const sub = NAME_TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || NAME_TRACING_SUBGAMES[0];
    StorageManager.completeModuleLevel(sub.moduleKey, this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    if (this.arabot) {
      this.arabot.celebrate(`¡Felicidades ${this.student.name}! ¡Escribiste "${this.targetName}" completo! 🎓🌟`, 3200);
    }

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

    setTimeout(() => {
      if (this.currentLevel < 50) {
        this.currentLevel++;
        this.renderGame(container);
      } else {
        this.currentLevel = null;
        this.render(container);
      }
    }, 2200);
  }

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

    const activeStroke = this.activeStrokes[this.currentStrokeIndex];
    if (activeStroke && !this.isDrawing && !this.isLetterCompleted) {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const t = (now % 2200) / 2200;
      StrokeGenerator.renderAnimatedPointer(ctx, activeStroke, t);
    }

    // 3. RENDERIZAR LAS INSIGNIAS DE PASO DELANTE DE TODO (fxCanvas z-index: 4)
    // Garantiza que el número del paso (1, 2, 3...) NUNCA quede tapado por el color del trazo
    if (this.activeStrokes && this.activeStrokes.length > 0 && !this.isLetterCompleted) {
      StrokeGenerator.renderStepBadges(
        ctx,
        this.activeStrokes,
        this.currentStrokeIndex,
        '#1565c0'
      );
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
