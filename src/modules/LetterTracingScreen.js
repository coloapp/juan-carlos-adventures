/**
 * LetterTracingScreen.js - Módulo de Trazado de Letras y Caligrafía
 * Arquitectura modular con Menú de 10 Juegos en Círculos (50 niveles cada uno),
 * selector de 50 circulitos por juego y motor de cuadernillo interactivo con cuadrícula escolar,
 * doble trazo hueco idéntico al cuaderno físico escolar (Mayúscula y Minúscula),
 * flechas numeradas, dibujo sorpresa para colorear, asistente ARABOT centrado,
 * cero trazos duplicados o desfasados, y transición automática de niveles sin alertas.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';
import { ArabotAssistant } from '../components/ArabotAssistant.js';
import { getPedagogicalLetter } from '../core/LetterWaypoints.js';

// ============================================================================
// CATÁLOGO DE LOS 10 JUEGOS EN CÍRCULOS DEL MÓDULO DE TRAZOS (50 NIVELES C/U)
// ============================================================================
export const TRACING_SUBGAMES = [
  {
    id: 'vocales',
    moduleKey: 'tracing_game_vocales',
    title: 'LAS 5 VOCALES',
    subtitle: 'A, E, I, O, U • Renglones del Cuadernillo',
    icon: '🔤',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#e91e63',
    description: 'Aprende a trazar A, E, I, O, U en mayúscula y minúscula con cuadrícula escolar.'
  },
  {
    id: 'm',
    moduleKey: 'tracing_game_m',
    title: 'LETRA M',
    subtitle: 'Mamá • Ma, Me, Mi, Mo, Mu',
    icon: '🍎',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#e53935',
    description: 'Trazos de la letra M y sus sílabas con la Manzana.'
  },
  {
    id: 's',
    moduleKey: 'tracing_game_s',
    title: 'LETRA S',
    subtitle: 'Sol, Sapo • Sa, Se, Si, So, Su',
    icon: '☀️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#ff9800',
    description: 'Trazos ondulados y divertidos de la letra S con el Sol.'
  },
  {
    id: 't',
    moduleKey: 'tracing_game_t',
    title: 'LETRA T',
    subtitle: 'Tortuga • Ta, Te, Ti, To, Tu',
    icon: '🐢',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-t',
    themeColor: '#00bcd4',
    description: 'Poste vertical y barra horizontal de la letra T.'
  },
  {
    id: 'l',
    moduleKey: 'tracing_game_l',
    title: 'LETRA L',
    subtitle: 'León, Luna • La, Le, Li, Lo, Lu',
    icon: '🦁',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-l',
    themeColor: '#9c27b0',
    description: 'Trazo recto elegante de la letra L con el León.'
  },
  {
    id: 'p',
    moduleKey: 'tracing_game_p',
    title: 'LETRA P',
    subtitle: 'Papá, Pelota • Pa, Pe, Pi, Po, Pu',
    icon: '⚽',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-p',
    themeColor: '#1976d2',
    description: 'Poste y pancita superior de la letra P con la Pelota.'
  },
  {
    id: 'n',
    moduleKey: 'tracing_game_n',
    title: 'LETRA N',
    subtitle: 'Nube, Nido • Na, Ne, Ni, No, Nu',
    icon: '☁️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-n',
    themeColor: '#009688',
    description: 'Arcos y líneas verticales de la letra N con la Nube.'
  },
  {
    id: 'r',
    moduleKey: 'tracing_game_r',
    title: 'LETRA R',
    subtitle: 'Ratón, Rana • Ra, Re, Ri, Ro, Ru',
    icon: '🐭',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-r',
    themeColor: '#d84315',
    description: 'Línea recta, pancita y patita diagonal de la R.'
  },
  {
    id: 'cd',
    moduleKey: 'tracing_game_cd',
    title: 'LETRAS C Y D',
    subtitle: 'Casa y Dado • Caligrafía Curva',
    icon: '🏠',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-cd',
    themeColor: '#5e35b1',
    description: 'Curvas circulares de la C y panza grande de la D.'
  },
  {
    id: 'reto',
    moduleKey: 'tracing_game_reto',
    title: 'GRAN RETO A-Z',
    subtitle: 'Palabras y Enunciados del Abecedario',
    icon: '🏆',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-reto',
    themeColor: '#fbc02d',
    description: 'Retos completos de caligrafía sobre cuadrícula.'
  }
];

export class LetterTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();

    // Estado de navegación
    this.activeSubgame = null; // null = menú de los 10 juegos en círculos
    this.currentLevel = null;  // null = selector de 50 niveles del juego activo

    // Estado del juego activo
    this.currentLetter = 'A';
    this.letterData = null;

    // Asistente ARABOT
    this.arabot = null;

    // Canvases y contextos
    this.bgCanvas = null;
    this.bgCtx = null;
    this.colorCanvas = null;
    this.colorCtx = null;
    this.guideCanvas = null;
    this.guideCtx = null;

    // Estado del trazo interactivo (Cero duplicados)
    this.isDrawing = false;
    this.allStrokes = [];
    this.currentStrokeIndex = 0;
    this.currentWaypointIndex = 0;
    this.completedStrokeIds = new Set();
    this.completedStrokes = [];
    this.currentProgressPoints = [];
    this.isLetterCompleted = false;

    // Animación de destello / luz viajera
    this.animFrameId = null;
    this.sparkleParticles = [];

    // Limpieza de eventos
    this.activePointerId = null;
    this.boundPointerUp = null;
  }

  // ==========================================================================
  // ORQUESTADOR PRINCIPAL DE RENDERIZADO
  // ==========================================================================
  render(container) {
    this.student = StorageManager.getActiveStudent();
    this.cleanup();

    // 1. VISTA 1: Si no se ha elegido juego, mostrar los 10 Círculos de Juegos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // 2. VISTA 2: Si se eligió juego pero no nivel, mostrar el selector de 50 circulitos
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // 3. VISTA 3: Nivel activo del juego seleccionado
    this.renderGame(container);
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE 10 JUEGOS EN CÍRCULOS (COMO EN SÍLABAS)
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container notebook-grid-bg fade-in" id="tracingSubgamesMenu">
        <!-- Encabezado del Menú -->
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#0d47a1; margin:0;">MÓDULO DE TRAZOS Y CALIGRAFÍA</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#e65100;">
              10 Juegos Didácticos en Círculos • Elige tu favorito
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <!-- Cuadrícula con los 10 Juegos en Círculos -->
        <main class="subgames-menu-container">
          <div class="subgames-grid-10" id="subgamesGrid10">
            ${TRACING_SUBGAMES.map(game => {
              const prog = StorageManager.getModuleLevels(game.moduleKey);
              const completedCount = Object.keys(prog.completed || {}).length;
              return `
                <button class="subgame-circle-card" data-game="${game.id}">
                  <div class="subgame-bubble ${game.bubbleClass} pulse-glow">
                    <span class="subgame-bubble-icon">${game.icon}</span>
                    <span class="subgame-levels-badge">${game.totalLevels} Niveles</span>
                  </div>
                  <span class="subgame-title-label" style="color:${game.themeColor};">${game.title}</span>
                  <span style="font-size:0.75rem; color:#455a64; font-weight:bold; margin-top:2px;">
                    ⭐ ${completedCount}/50 completados
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </main>

        <!-- Pie Informativo -->
        <footer class="module-footer">
          <span class="tip-text">💡 Toca cualquiera de los <strong>10 círculos</strong> para jugar sus 50 niveles caligráficos.</span>
        </footer>
      </div>
    `;

    // Botón volver al Home
    container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
      audio.playClick();
      this.cleanup();
      this.navigator.navigate('home');
    });

    // Clic en cualquiera de los 10 círculos
    container.querySelectorAll('.subgame-circle-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        const gameId = e.currentTarget.dataset.game;
        this.activeSubgame = gameId;
        this.currentLevel = null;
        this.render(container);
      });
    });

    audio.speak('Elige un juego de trazos en círculos');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS PARA EL JUEGO SELECCIONADO
  // ==========================================================================
  renderLevelSelector(container) {
    const game = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];

    LevelSelector.render({
      container,
      moduleKey: game.moduleKey,
      moduleTitle: game.title,
      moduleIcon: game.icon,
      bgClass: 'notebook-grid-bg',
      totalLevels: game.totalLevels,
      onSelectLevel: (lvl) => {
        this.currentLevel = lvl;
        this.render(container);
      },
      onBackHome: () => {
        // Regresa al menú de los 10 círculos
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      }
    });
  }

  // ==========================================================================
  // VISTA 3: JUEGO ACTIVO CON CUADERNILLO, CUADRÍCULA ESCOLAR, ARABOT Y DIBUJO
  // ==========================================================================
  renderGame(container) {
    this.cleanup();

    const game = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];

    // Obtener la letra según el juego y el nivel:
    // En Juego 1 (Las 5 Vocales):
    // Niveles 1-10: A (Árbol)
    // Niveles 11-20: E (Elefante)
    // Niveles 21-30: I (Isla)
    // Niveles 31-40: O (Oso)
    // Niveles 41-50: U (Uva)
    if (game.id === 'vocales') {
      const vowelList = ['A', 'E', 'I', 'O', 'U'];
      const vIndex = Math.min(Math.floor((this.currentLevel - 1) / 10), 4);
      this.currentLetter = vowelList[vIndex];
    } else if (game.id === 'm') {
      this.currentLetter = 'M';
    } else if (game.id === 's') {
      this.currentLetter = 'S';
    } else if (game.id === 't') {
      this.currentLetter = 'T';
    } else if (game.id === 'l') {
      this.currentLetter = 'L';
    } else if (game.id === 'p') {
      this.currentLetter = 'P';
    } else if (game.id === 'n') {
      this.currentLetter = 'N';
    } else if (game.id === 'r') {
      this.currentLetter = 'R';
    } else if (game.id === 'cd') {
      this.currentLetter = (this.currentLevel % 2 === 1) ? 'C' : 'D';
    } else {
      const alpha = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','Ñ','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
      this.currentLetter = alpha[(this.currentLevel - 1) % alpha.length];
    }

    this.letterData = getPedagogicalLetter(this.currentLetter);

    // Preparar lista secuencial de trazos (Mayúscula primero, luego Minúscula)
    const upperStrokes = (this.letterData.uppercaseStrokes || []).map(s => ({ ...s, isUpper: true }));
    const lowerStrokes = (this.letterData.lowercaseStrokes || []).map(s => ({ ...s, isUpper: false }));
    this.allStrokes = [...upperStrokes, ...lowerStrokes];

    this.currentStrokeIndex = 0;
    this.currentWaypointIndex = 0;
    this.completedStrokeIds.clear();
    this.completedStrokes = [];
    this.currentProgressPoints = [];
    this.isLetterCompleted = false;

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="tracingModule">
        <!-- Encabezado con ARABOT centrado para no estorbar ningún botón -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          
          <div class="arabot-top-anchor" id="arabotAnchor">
            <!-- ARABOT se monta aquí limpiamente -->
          </div>

          <div class="header-actions">
            <button class="sound-btn" id="btnPlayLetterAudio">🔊 Escuchar</button>
            <button class="clear-btn" id="btnClearCanvas">🧹 Borrar</button>
          </div>
        </header>

        <!-- Cuadernillo Caligráfico interactivo estilo renglones del libro -->
        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>RENGLÓN DE TRAZO: <span class="letter-highlight">${this.letterData.letter} - ${this.letterData.lowercase}</span></h2>
            <p class="notebook-instruction">✏️ Sigue la dirección de las flechas y realiza los trazos.</p>
          </div>

          <div class="notebook-grid-container" id="notebookGridContainer">
            <!-- Lienzos superpuestos alineados con resolución fija 760x420 -->
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="colorCanvas" width="760" height="420"></canvas>
            <canvas id="guideCanvas" width="760" height="420"></canvas>

            <!-- Zona de la Sorpresa ilustrada (Árbol, Elefante, Isla, Oso, Uva) -->
            <div class="notebook-tree-zone" id="notebookTreeZone">
              ${this.letterData.getSurpriseSvg()}
              <div class="tree-caption" id="treeCaption">${this.letterData.phonetic} ${this.letterData.icon}</div>
            </div>
          </div>
        </main>

        <!-- Banner de transición automática de nivel (cero alertas) -->
        <div class="auto-transition-banner" id="autoTransitionBanner" style="display:none;">
          <div class="transition-card bounce-in">
            <div class="transition-stars">⭐⭐⭐</div>
            <div class="transition-title">¡EXCELENTE!</div>
            <div class="transition-msg" id="transitionMsg">¡${this.letterData.phonetic} completado! Pasando al siguiente renglón...</div>
            <div class="transition-progress-bar">
              <div class="progress-fill" id="transitionProgressFill"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupArabot(container);
    this.setupCanvases(container);
    this.drawNotebookGridGuides();
    this.startShimmerAnimationLoop();
    this.bindEvents(container);

    // Demostración didáctica de Arabot al iniciar
    setTimeout(() => {
      this.playArabotTutorial();
    }, 450);
  }

  setupArabot(container) {
    const anchor = container.querySelector('#arabotAnchor');
    if (!anchor) return;

    this.arabot = new ArabotAssistant({
      onHelpClick: () => {
        this.playArabotTutorial();
      }
    });

    this.arabot.mount(anchor);
  }

  playArabotTutorial() {
    if (!this.arabot || !this.guideCanvas) return;

    const strokes = this.letterData.tutorialStrokes || [
      { name: 'Paso 1', from: { x: 0.1974, y: 0.1786 }, to: { x: 0.1026, y: 0.7738 } }
    ];

    this.arabot.playTutorial(this.guideCanvas, strokes);
  }

  setupCanvases(container) {
    this.bgCanvas = container.querySelector('#bgCanvas');
    this.colorCanvas = container.querySelector('#colorCanvas');
    this.guideCanvas = container.querySelector('#guideCanvas');

    if (!this.bgCanvas || !this.colorCanvas || !this.guideCanvas) return;

    this.bgCtx = this.bgCanvas.getContext('2d');
    this.colorCtx = this.colorCanvas.getContext('2d');
    this.guideCtx = this.guideCanvas.getContext('2d');
  }

  /**
   * Dibuja la cuadrícula escolar auténtica (Image 2), las letras huecas
   * con flechas numeradas idénticas a Aa (Image 1) y el renglón caligráfico.
   */
  drawNotebookGridGuides() {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Cuadrícula escolar con líneas azules suaves (38px x 38px)
    const gridSize = 38;
    ctx.save();
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.22)';
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

    // 2. Letras huecas estilo libro de texto con flechas numeradas
    this.drawHollowLetters(ctx, W, H);

    // 3. Renglón caligráfico escolar en la parte inferior
    this.drawPracticeRenglon(ctx, W, H);
  }

  /**
   * Renderiza el doble contorno hueco unificado (como en la Aa del cuadernillo)
   * exactamente sobre las mismas coordenadas que los waypoints para evitar desfases.
   */
  drawHollowLetters(ctx, W, H) {
    // Paso A: Contorno exterior negro (46px grosor, extremos y uniones redondeadas)
    ctx.save();
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 46;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.renderStrokesPath(ctx, this.allStrokes, W, H);
    ctx.restore();

    // Paso B: Canal interior blanco hueco (38px grosor, centrado con 4px de borde)
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.renderStrokesPath(ctx, this.allStrokes, W, H);
    ctx.restore();

    // Dibujo del punto especial si la letra lo tiene (ej. minúscula 'i')
    this.allStrokes.forEach(stroke => {
      if (stroke.isDot) {
        const p = stroke.points[0];
        const cx = p.x * W;
        const cy = p.y * H;
        ctx.save();
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(cx, cy, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Paso C: Líneas punteadas pedagógicas a lo largo del centro del canal
    this.allStrokes.forEach((stroke) => {
      if (stroke.isDot) return;
      const points = stroke.points;
      if (!points || points.length < 2) return;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#546e7a';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([7, 6]);
      points.forEach((p, i) => {
        const x = p.x * W;
        const y = p.y * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    });

    // Paso D: Insignias circulares numeradas (1, 2, 3...) y flechas direccionales
    this.allStrokes.forEach((stroke) => {
      const points = stroke.points;
      if (!points || points.length === 0) return;

      const startP = points[0];
      const sx = startP.x * W;
      const sy = startP.y * H;

      // Círculo blanco con borde oscuro
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Número de orden
      ctx.fillStyle = '#111111';
      ctx.font = '900 13px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${stroke.label}`, sx, sy);

      // Flecha de dirección a lo largo del trazo
      if (!stroke.isDot && points.length >= 2) {
        const nextP = points[1];
        const nx = nextP.x * W;
        const ny = nextP.y * H;
        const midX = sx + (nx - sx) * 0.42;
        const midY = sy + (ny - sy) * 0.42;
        this.drawArrowHead(ctx, sx, sy, midX, midY);
      }
      ctx.restore();
    });
  }

  renderStrokesPath(ctx, strokes, W, H) {
    strokes.forEach(stroke => {
      if (stroke.isDot) return;
      const pts = stroke.points;
      if (!pts || pts.length < 2) return;

      ctx.beginPath();
      pts.forEach((p, idx) => {
        const x = p.x * W;
        const y = p.y * H;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  drawArrowHead(ctx, fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.fillStyle = '#212121';
    ctx.translate(toX, toY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-11, -6);
    ctx.lineTo(-11, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPracticeRenglon(ctx, W, H) {
    const topY = 352;
    const bottomY = 412;

    ctx.save();
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(W, topY);
    ctx.moveTo(0, bottomY);
    ctx.lineTo(W, bottomY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(0, topY, W, bottomY - topY);

    const char = this.letterData.letter;
    const lower = this.letterData.lowercase;
    const lettersPattern = [char, lower, char, lower, char, lower, char, lower, char, lower, char, lower];
    const stepX = W / lettersPattern.length;

    ctx.fillStyle = '#78909c';
    ctx.font = 'bold 28px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    lettersPattern.forEach((c, i) => {
      const cx = stepX * (i + 0.5);
      const cy = (topY + bottomY) / 2;
      ctx.fillText(c, cx, cy);
    });

    ctx.restore();
  }

  // ==========================================================================
  // ANIMACIÓN DE LUZ GUÍA VIAJERA (SHIMMER)
  // ==========================================================================
  startShimmerAnimationLoop() {
    const loop = (timestamp) => {
      this.drawShimmerFrame(timestamp);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  drawShimmerFrame(timestamp) {
    if (!this.guideCtx || !this.guideCanvas) return;
    const ctx = this.guideCtx;
    const W = this.guideCanvas.width;
    const H = this.guideCanvas.height;

    ctx.clearRect(0, 0, W, H);

    if (this.isLetterCompleted) return;
    if (this.currentStrokeIndex >= this.allStrokes.length) return;

    const currentStroke = this.allStrokes[this.currentStrokeIndex];
    const points = currentStroke.points;
    if (!points || points.length < 2) return;

    const cycleDuration = 1400;
    const t = ((timestamp || performance.now()) % cycleDuration) / cycleDuration;

    const totalSegments = points.length - 1;
    const segmentIndex = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
    const segmentT = (t * totalSegments) - segmentIndex;

    const pA = points[segmentIndex];
    const pB = points[segmentIndex + 1];

    const curX = (pA.x + (pB.x - pA.x) * segmentT) * W;
    const curY = (pA.y + (pB.y - pA.y) * segmentT) * H;

    ctx.save();
    const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.25, 'rgba(255, 235, 59, 0.85)');
    grad.addColorStop(0.6, 'rgba(255, 152, 0, 0.45)');
    grad.addColorStop(1, 'rgba(255, 152, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(curX, curY, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.renderSparkleParticles(ctx);
  }

  addSparkle(x, y) {
    for (let i = 0; i < 3; i++) {
      this.sparkleParticles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1.0,
        color: ['#ffeb3b', '#ff9800', '#00e5ff', '#4caf50'][Math.floor(Math.random() * 4)]
      });
    }
  }

  renderSparkleParticles(ctx) {
    for (let i = this.sparkleParticles.length - 1; i >= 0; i--) {
      const p = this.sparkleParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;

      if (p.life <= 0) {
        this.sparkleParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ==========================================================================
  // MANEJO DE EVENTOS TÁCTILES Y DE RATÓN UNIFICADOS (CERO DESFASES)
  // ==========================================================================
  getCanvasPoint(e) {
    const canvas = this.guideCanvas;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.resetCanvas();
    });

    container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
      audio.speak(`Esta es la letra ${this.letterData.letter}, ${this.letterData.phonetic}`);
      if (this.arabot) {
        this.arabot.speak(`¡La ${this.letterData.letter} de ${this.letterData.word}! ${this.letterData.icon}`);
      }
    });

    const canvas = this.guideCanvas;
    if (!canvas) return;

    // Manejo unificado Pointer Events (Soporta ratón, dedos táctiles y lápiz)
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.activePointerId = e.pointerId;
      const pt = this.getCanvasPoint(e);
      this.handlePointerDown(pt.x, pt.y);
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (!this.isDrawing || (this.activePointerId !== null && e.pointerId !== this.activePointerId)) return;
      const pt = this.getCanvasPoint(e);
      this.handlePointerMove(pt.x, pt.y);
    }, { passive: false });

    this.boundPointerUp = (e) => {
      if (this.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== this.activePointerId) return;
      this.activePointerId = null;
      this.handlePointerUp();
    };

    canvas.addEventListener('pointerup', this.boundPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', this.boundPointerUp, { passive: false });
  }

  handlePointerDown(x, y) {
    if (this.isLetterCompleted) return;
    this.isDrawing = true;
    this.currentProgressPoints = [{ x, y }];

    this.checkWaypointHit(x, y);
    this.addSparkle(x, y);
    audio.playBrush();
  }

  handlePointerMove(x, y) {
    if (!this.isDrawing || this.isLetterCompleted) return;

    this.currentProgressPoints.push({ x, y });
    this.checkWaypointHit(x, y);
    this.addSparkle(x, y);
    this.redrawColorCanvas();
  }

  handlePointerUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.currentProgressPoints = [];
    this.redrawColorCanvas();
  }

  checkWaypointHit(x, y) {
    if (this.isLetterCompleted) return;
    if (this.currentStrokeIndex >= this.allStrokes.length) return;

    const currentStroke = this.allStrokes[this.currentStrokeIndex];
    const points = currentStroke.points;
    if (!points || this.currentWaypointIndex >= points.length) return;

    const targetWp = points[this.currentWaypointIndex];
    const targetX = targetWp.x * this.guideCanvas.width;
    const targetY = targetWp.y * this.guideCanvas.height;

    const distance = Math.hypot(x - targetX, y - targetY);

    if (distance <= 54) {
      this.currentWaypointIndex++;
      audio.playPop();

      if (this.currentWaypointIndex >= points.length) {
        this.onStrokeCompleted(currentStroke);
      }
    }
  }

  onStrokeCompleted(stroke) {
    this.completedStrokeIds.add(stroke.id);
    this.completedStrokes.push(stroke);
    this.currentProgressPoints = [];

    this.currentStrokeIndex++;
    this.currentWaypointIndex = 0;
    audio.playStar();

    // Redibujar inmediatamente el lienzo de color con el trazo perfecto consolidado
    this.redrawColorCanvas();

    const upperStrokes = this.allStrokes.filter(s => s.isUpper);
    const upperCompleted = upperStrokes.every(s => this.completedStrokeIds.has(s.id));

    if (upperCompleted && stroke.isUpper && this.currentStrokeIndex === upperStrokes.length) {
      if (this.arabot) {
        this.arabot.speak(`¡Genial! Ahora traza la pequeña <strong>${this.letterData.lowercase}</strong> ⭐`);
      }
    }

    if (this.currentStrokeIndex >= this.allStrokes.length) {
      this.onAllStrokesCompleted();
    }
  }

  /**
   * Redibuja la capa de color:
   * Solo dibuja los trazos consolidados perfectamente alineados
   * y el trazo activo actual, eliminando por completo cualquier trazo duplicado o desfasado.
   */
  redrawColorCanvas() {
    if (!this.colorCtx || !this.colorCanvas) return;
    const ctx = this.colorCtx;
    const W = this.colorCanvas.width;
    const H = this.colorCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Dibujar trazos consolidados (completados con éxito)
    this.completedStrokes.forEach(stroke => {
      ctx.save();
      ctx.lineWidth = 30;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.isUpper) {
        ctx.strokeStyle = '#ff9800';
        ctx.shadowColor = 'rgba(255, 152, 0, 0.6)';
      } else {
        ctx.strokeStyle = '#00bcd4';
        ctx.shadowColor = 'rgba(0, 188, 212, 0.6)';
      }
      ctx.shadowBlur = 10;

      if (stroke.isDot) {
        const p = stroke.points[0];
        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 15, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        stroke.points.forEach((p, idx) => {
          const x = p.x * W;
          const y = p.y * H;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
      ctx.restore();
    });

    // 2. Dibujar trazo activo en curso guiado por el dedo
    if (this.isDrawing && this.currentProgressPoints.length > 1) {
      ctx.save();
      const current = this.allStrokes[this.currentStrokeIndex];
      const isUpper = current ? current.isUpper : true;
      ctx.strokeStyle = isUpper ? 'rgba(255, 152, 0, 0.85)' : 'rgba(0, 188, 212, 0.85)';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      this.currentProgressPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Logro pedagógico: al completar el trazo de la mayúscula y minúscula
   */
  onAllStrokesCompleted() {
    this.isLetterCompleted = true;
    this.isDrawing = false;
    this.currentProgressPoints = [];
    this.redrawColorCanvas();

    // 1. Sonido festivo Web Audio API + Confeti
    audio.playCelebration();
    Confetti.shoot(2800);

    // 2. Coloreado automático del dibujo sorpresa (Árbol, Elefante, Isla, Oso, Uva)
    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) {
      treeZone.classList.add('colored');
    }
    const treeCaption = document.getElementById('treeCaption');
    if (treeCaption) {
      treeCaption.innerHTML = `🎉 ¡${this.letterData.word} COLOREADO! ${this.letterData.icon}`;
      treeCaption.classList.add('celebration-glow');
    }

    // 3. ARABOT celebra y pronuncia el fonema
    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡${this.letterData.letter} de ${this.letterData.word}! ${this.letterData.icon}⭐`, 2800);
    }

    // 4. Guardar progreso en el juego activo
    const game = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];
    StorageManager.completeModuleLevel(game.moduleKey, this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    // 5. Transición automática suave al siguiente renglón / nivel (cero pop-ups molestos)
    setTimeout(() => {
      this.showAutoTransitionBanner();
    }, 2000);
  }

  showAutoTransitionBanner() {
    const banner = document.getElementById('autoTransitionBanner');
    const msg = document.getElementById('transitionMsg');
    const fill = document.getElementById('transitionProgressFill');

    if (!banner) {
      this.advanceToNextLevel();
      return;
    }

    banner.style.display = 'flex';
    if (msg) {
      msg.innerText = `¡Renglón de la ${this.letterData.letter} completado! Pasando al siguiente reto...`;
    }

    if (fill) {
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = '100%'; }, 50);
    }

    setTimeout(() => {
      this.advanceToNextLevel();
    }, 1300);
  }

  advanceToNextLevel() {
    this.cleanup();
    const container = document.getElementById('app');
    if (!container) return;

    const game = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];

    if (this.currentLevel < game.totalLevels) {
      this.currentLevel = this.currentLevel + 1;
      this.renderGame(container);
    } else {
      // Al terminar los 50 niveles, regresar al selector de niveles
      this.currentLevel = null;
      this.render(container);
    }
  }

  resetCanvas() {
    this.completedStrokeIds.clear();
    this.completedStrokes = [];
    this.currentProgressPoints = [];
    this.currentStrokeIndex = 0;
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;

    if (this.colorCtx && this.colorCanvas) {
      this.colorCtx.clearRect(0, 0, this.colorCanvas.width, this.colorCanvas.height);
    }

    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) {
      treeZone.classList.remove('colored');
    }
    const treeCaption = document.getElementById('treeCaption');
    if (treeCaption) {
      treeCaption.innerHTML = `${this.letterData.phonetic} ${this.letterData.icon}`;
      treeCaption.classList.remove('celebration-glow');
    }
  }

  cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.guideCanvas && this.boundPointerUp) {
      this.guideCanvas.removeEventListener('pointerup', this.boundPointerUp);
      this.guideCanvas.removeEventListener('pointercancel', this.boundPointerUp);
      this.boundPointerUp = null;
    }
    if (this.arabot) {
      this.arabot.destroy();
      this.arabot = null;
    }
  }
}
