/**
 * ShapesScreen.js - Módulo "Figuras Geométricas y Colores" con Arquitectura Multi-Juegos
 * Reconocimiento espacial, cromático y patrones para niños de preescolar.
 * 
 * Subjuegos disponibles:
 * 1. "Taller de Pintura Mágica" (Actividad interactiva con paleta de 6 colores)
 * 2. "Desafío de Figuras" (50 niveles: identifica la figura correcta)
 * 3. "Figuras en la Vida Real" (50 niveles: relaciona la forma con objetos cotidianos)
 * 4. "Series y Patrones" (50 niveles: completa la secuencia geométrica)
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';

export const SHAPES_SUBGAMES = [
  {
    id: 'taller_pintura',
    moduleKey: 'shapes_taller',
    title: 'TALLER DE PINTURA',
    subtitle: 'Paleta con 6 colores y pincel mágico',
    icon: '🎨',
    totalLevels: 1,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#e91e63'
  },
  {
    id: 'desafio_figuras',
    moduleKey: 'shapes_desafio',
    title: 'DESAFÍO DE FIGURAS',
    subtitle: '50 Niveles: Identifica la figura correcta',
    icon: '🔺',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#ff5722'
  },
  {
    id: 'mundo_real',
    moduleKey: 'shapes_mundo_real',
    title: 'FIGURAS EN LA VIDA REAL',
    subtitle: '50 Niveles: Pizza, reloj, regalo y más',
    icon: '🍕',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#f57c00'
  },
  {
    id: 'series_patrones',
    moduleKey: 'shapes_patrones',
    title: 'SERIES Y PATRONES',
    subtitle: '50 Niveles: Completa la secuencia',
    icon: '🔁',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#00897b'
  }
];

export const SHAPES_DATA = [
  { name: 'CÍRCULO', shapeType: 'circle', objectText: '🍩 Como una dona deliciosa', realEmoji: '🍩', color: '#ff5722' },
  { name: 'TRIÁNGULO', shapeType: 'triangle', objectText: '🍕 Como una rebanada de pizza', realEmoji: '🍕', color: '#ffb300' },
  { name: 'CUADRADO', shapeType: 'square', objectText: '🎁 Como una caja de regalo', realEmoji: '🎁', color: '#4caf50' },
  { name: 'ESTRELLA', shapeType: 'star', objectText: '⭐ Como las estrellas del cielo', realEmoji: '⭐', color: '#9c27b0' },
  { name: 'RECTÁNGULO', shapeType: 'rectangle', objectText: '🚪 Como una puerta alta', realEmoji: '🚪', color: '#00bcd4' },
  { name: 'CORAZÓN', shapeType: 'heart', objectText: '💖 Como un globo con amor', realEmoji: '💖', color: '#e91e63' }
];

export class ShapesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.activeSubgame = null; // null = menú de subjuegos en círculos
    this.currentLevel = null;  // 1..50
    this.currentColor = '#ff5722';
  }

  resetState() {
    this.activeSubgame = null;
    this.currentLevel = null;
  }

  // ==========================================================================
  // ORQUESTADOR DE VISTAS
  // ==========================================================================
  render(container) {
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    if (this.activeSubgame === 'taller_pintura') {
      this.renderTallerPintura(container);
      return;
    }

    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    if (this.activeSubgame === 'desafio_figuras') {
      this.renderDesafioFiguras(container);
    } else if (this.activeSubgame === 'mundo_real') {
      this.renderMundoReal(container);
    } else if (this.activeSubgame === 'series_patrones') {
      this.renderSeriesPatrones(container);
    }
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUBJUEGOS EN CÍRCULOS
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container shapes-bg fade-in" id="shapesSubgamesMenu">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#c2185b; margin:0; font-size:clamp(1.2rem, 3.2vw, 1.8rem);">FIGURAS GEOMÉTRICAS Y COLORES</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#ad1457;">
              Elige un juego en círculo para comenzar • Geometría de Kínder
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid">
            ${SHAPES_SUBGAMES.map(game => {
              const prog = StorageManager.getModuleLevels(game.moduleKey);
              const count = Object.keys(prog.completed || {}).length;
              return `
                <button class="subgame-circle-card" data-game="${game.id}">
                  <div class="subgame-bubble ${game.bubbleClass} pulse-glow">
                    <span class="subgame-bubble-icon">${game.icon}</span>
                    <span class="subgame-levels-badge">${game.totalLevels > 1 ? `${game.totalLevels} Niveles` : 'Actividad'}</span>
                  </div>
                  <span class="subgame-title-label" style="color:${game.themeColor};">${game.title}</span>
                  <span style="font-size:0.75rem; color:#455a64; font-weight:bold; margin-top:3px;">
                    ${game.totalLevels > 1 ? `⭐ ${count}/${game.totalLevels} completados` : '¡Toca para entrar!'}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">💡 Toca cualquiera de los 4 círculos para pintar y explorar las figuras.</span>
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

    audio.speak('Elige un juego de figuras y colores');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS
  // ==========================================================================
  renderLevelSelector(container) {
    const sub = SHAPES_SUBGAMES.find(g => g.id === this.activeSubgame) || SHAPES_SUBGAMES[1];

    LevelSelector.render({
      container,
      moduleKey: sub.moduleKey,
      moduleTitle: sub.title,
      moduleIcon: sub.icon,
      bgClass: 'shapes-bg',
      totalLevels: 50,
      onSelectLevel: (lvl) => {
        audio.playClick();
        this.currentLevel = lvl;
        this.render(container);
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
  // SUBJUEGO 1: TALLER DE PINTURA MÁGICA
  // ==========================================================================
  renderTallerPintura(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container shapes-bg fade-in" id="tallerPinturaModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToShapesMenu">⬅️ Menú Figuras</button>
          <div style="text-align:center;">
            <h2>TALLER DE PINTURA DE FIGURAS 🎨</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#c2185b;">
              Elige un color y toca cada figura para pintarla
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="shapes-game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div class="color-palette-bar" style="display:flex; align-items:center; gap:8px; margin-bottom:16px; background:white; padding:8px 16px; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <span style="font-weight:900; color:#37474f;">Pincel:</span>
            <button class="palette-swatch active" style="background:#ff5722; width:34px; height:34px; border-radius:50%; border:2px solid white; cursor:pointer;" data-color="#ff5722"></button>
            <button class="palette-swatch" style="background:#ffeb3b; width:34px; height:34px; border-radius:50%; border:2px solid white; cursor:pointer;" data-color="#ffeb3b"></button>
            <button class="palette-swatch" style="background:#4caf50; width:34px; height:34px; border-radius:50%; border:2px solid white; cursor:pointer;" data-color="#4caf50"></button>
            <button class="palette-swatch" style="background:#00bcd4; width:34px; height:34px; border-radius:50%; border:2px solid white; cursor:pointer;" data-color="#00bcd4"></button>
            <button class="palette-swatch" style="background:#e91e63; width:34px; height:34px; border-radius:50%; border:2px solid white; cursor:pointer;" data-color="#e91e63"></button>
            <button class="palette-swatch" style="background:#9c27b0; width:34px; height:34px; border-radius:50%; border:2px solid white; cursor:pointer;" data-color="#9c27b0"></button>
          </div>

          <div class="shapes-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:16px; max-width:680px;">
            ${SHAPES_DATA.slice(0, 4).map(item => `
              <div class="shape-card" data-shape="${item.name}" style="background:white; border-radius:20px; padding:12px 18px; border:3px solid #f48fb1; text-align:center; box-shadow:0 6px 14px rgba(0,0,0,0.1); cursor:pointer;">
                <div class="shape-figure-box" style="height:90px; display:flex; align-items:center; justify-content:center;">
                  <div class="shape-element ${item.shapeType}" style="--current-fill: ${item.color}"></div>
                </div>
                <h3 class="shape-name" style="margin:6px 0 2px 0; color:#37474f; font-size:1.1rem;">${item.name}</h3>
                <p class="shape-desc" style="font-size:0.75rem; color:#78909c; margin:0 0 6px 0;">${item.objectText}</p>
                <button class="shape-action-btn" style="background:${item.color}; color:white; border:none; border-radius:12px; padding:4px 12px; font-weight:bold; cursor:pointer;">🖌️ Pintar</button>
              </div>
            `).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <button class="check-btn" id="btnFinishShapes">⭐ ¡Completar Taller de Pintura!</button>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToShapesMenu')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = null;
      this.render(container);
    });

    container.querySelectorAll('.palette-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        audio.playClick();
        container.querySelectorAll('.palette-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentColor = btn.dataset.color;
      });
    });

    container.querySelectorAll('.shape-card').forEach(card => {
      card.addEventListener('click', () => {
        const el = card.querySelector('.shape-element');
        if (el) el.style.setProperty('--current-fill', this.currentColor);
        audio.playBrush();
        audio.speak(card.dataset.shape);
      });
    });

    container.querySelector('#btnFinishShapes')?.addEventListener('click', () => {
      audio.playFanfare();
      Confetti.shoot(3000);
      StorageManager.completeModuleLevel('shapes_taller', 1, 3);
      StorageManager.addStars(3);
      setTimeout(() => {
        this.activeSubgame = null;
        this.render(container);
      }, 1800);
    });

    audio.speak('Elige un color y pinta las figuras geométricas');
  }

  // ==========================================================================
  // SUBJUEGO 2: DESAFÍO DE FIGURAS (50 NIVELES)
  // ==========================================================================
  renderDesafioFiguras(container) {
    const student = StorageManager.getActiveStudent();
    const target = SHAPES_DATA[(this.currentLevel - 1) % SHAPES_DATA.length];
    const shuffled = [...SHAPES_DATA.slice(0, 4)].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container shapes-bg fade-in" id="desafioFigurasModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>DESAFÍO DE FIGURAS 🔺</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#ad1457;">
              Nivel ${this.currentLevel} de 50: Encuentra el <strong>${target.name}</strong>
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div style="background:white; padding:18px 28px; border-radius:24px; border:3px solid #f06292; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:92vw;">
            <h3 style="color:#ad1457; font-size:clamp(1.2rem, 3vh, 1.7rem); margin:0 0 16px 0;">
              ¿Cuál de estas figuras es el <strong>${target.name}</strong>?
            </h3>

            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:14px; justify-items:center;">
              ${shuffled.map(s => `
                <button class="shape-card-btn" data-chosen="${s.name}" style="background:#fafafa; border:3px solid #e0e0e0; border-radius:18px; padding:14px 20px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.08); transition:transform 0.15s ease;">
                  <div class="shape-figure-box" style="height:75px; display:flex; align-items:center; justify-content:center;">
                    <div class="shape-element ${s.shapeType}" style="--current-fill: ${s.color}"></div>
                  </div>
                  <h4 style="margin:6px 0 0 0; color:#37474f;">${s.name}</h4>
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

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnRepeatChallenge')?.addEventListener('click', () => {
      audio.speak(target.name);
    });

    container.querySelectorAll('.shape-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.dataset.chosen;
        if (chosen === target.name) {
          audio.playSuccess();
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('shapes_desafio', this.currentLevel, 3);
          StorageManager.addStars(1);
          btn.style.transform = 'scale(1.15)';
          btn.style.borderColor = '#4caf50';

          setTimeout(() => {
            if (this.currentLevel < 50) {
              this.currentLevel++;
              this.render(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1100);
        } else {
          audio.playWrong();
          btn.style.transform = 'rotate(-8deg)';
          setTimeout(() => { btn.style.transform = 'none'; }, 200);
        }
      });
    });

    audio.speak(`¿Cuál figura es el ${target.name}?`);
  }

  // ==========================================================================
  // SUBJUEGO 3: FIGURAS EN LA VIDA REAL (50 NIVELES)
  // ==========================================================================
  renderMundoReal(container) {
    const student = StorageManager.getActiveStudent();
    const item = SHAPES_DATA[(this.currentLevel - 1) % SHAPES_DATA.length];
    const shuffled = [...SHAPES_DATA.slice(0, 4)].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container shapes-bg fade-in" id="mundoRealModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>FIGURAS EN LA VIDA REAL 🍕</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#f57c00;">
              Nivel ${this.currentLevel} de 50: ¿A qué figura se parece?
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div style="background:white; padding:18px 28px; border-radius:24px; border:3px solid #ff9800; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:92vw;">
            <div style="font-size:4rem; margin-bottom:6px;">${item.realEmoji}</div>
            <h3 style="color:#e65100; font-size:1.3rem; margin:0 0 16px 0;">
              ${item.objectText} • ¿Qué forma tiene?
            </h3>

            <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
              ${shuffled.map(s => `
                <button class="real-choice-btn" data-chosen="${s.name}" style="padding:10px 18px; border-radius:16px; background:${s.color}; color:white; font-size:1.2rem; font-weight:900; border:2px solid white; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.18);">
                  ${s.name}
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">Observa el objeto real y selecciona su forma geométrica.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelectorAll('.real-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.chosen === item.name) {
          audio.playSuccess();
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('shapes_mundo_real', this.currentLevel, 3);
          StorageManager.addStars(1);
          btn.style.transform = 'scale(1.2)';

          setTimeout(() => {
            if (this.currentLevel < 50) {
              this.currentLevel++;
              this.render(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1100);
        } else {
          audio.playWrong();
          btn.style.transform = 'rotate(-8deg)';
          setTimeout(() => { btn.style.transform = 'none'; }, 200);
        }
      });
    });

    audio.speak(`¿Qué forma tiene este objeto?`);
  }

  // ==========================================================================
  // SUBJUEGO 4: SERIES Y PATRONES (50 NIVELES)
  // ==========================================================================
  renderSeriesPatrones(container) {
    const student = StorageManager.getActiveStudent();
    const s1 = SHAPES_DATA[(this.currentLevel - 1) % 4];
    const s2 = SHAPES_DATA[(this.currentLevel) % 4];
    const pattern = [s1, s2, s1, s2, s1];
    const correctNext = s2;
    const options = [s1, s2, SHAPES_DATA[4] || SHAPES_DATA[0]].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container shapes-bg fade-in" id="seriesPatronesModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>SERIES Y PATRONES 🔁</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#00897b;">
              Nivel ${this.currentLevel} de 50: ¿Qué figura sigue en el patrón?
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div style="background:white; padding:18px 24px; border-radius:24px; border:3px solid #00897b; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:92vw;">
            <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
              ${pattern.map(p => `
                <div style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border-radius:12px; border:2px solid #e0e0e0;">
                  <div class="shape-element ${p.shapeType}" style="--current-fill:${p.color}; transform:scale(0.65);"></div>
                </div>
              `).join('')}
              <div style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; background:#fff9c4; border-radius:12px; border:3px dashed #fbc02d; font-size:1.8rem; font-weight:900; color:#f57f17;">
                ?
              </div>
            </div>

            <p style="font-weight:900; color:#00695c; margin:0 0 12px 0;">Toca la figura que completa la serie:</p>
            <div style="display:flex; gap:14px; justify-content:center;">
              ${options.map(opt => `
                <button class="pattern-opt-btn" data-chosen="${opt.name}" style="padding:10px 18px; border-radius:16px; background:white; border:3px solid ${opt.color}; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                  <div class="shape-element ${opt.shapeType}" style="--current-fill:${opt.color}; transform:scale(0.6);"></div>
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">Descubre la regla de la serie y selecciona la figura faltante.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelectorAll('.pattern-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.chosen === correctNext.name) {
          audio.playSuccess();
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('shapes_patrones', this.currentLevel, 3);
          StorageManager.addStars(1);
          btn.style.transform = 'scale(1.2)';

          setTimeout(() => {
            if (this.currentLevel < 50) {
              this.currentLevel++;
              this.render(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1100);
        } else {
          audio.playWrong();
          btn.style.transform = 'rotate(-8deg)';
          setTimeout(() => { btn.style.transform = 'none'; }, 200);
        }
      });
    });

    audio.speak(`¿Qué figura sigue en el patrón?`);
  }
}
