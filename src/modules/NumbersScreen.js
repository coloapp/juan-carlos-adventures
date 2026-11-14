/**
 * NumbersScreen.js - Módulo "Números" con Arquitectura Multi-Juegos y 50 Niveles
 * Pensamiento matemático temprano, conteo didáctico y secuencias para preescolar.
 * 
 * Subjuegos disponibles:
 * 1. "El Tren Matemático" (50 niveles: completa el vagón que falta con el Monito)
 * 2. "Cuenta los Objetos" (50 niveles: cuenta animalitos/frutas y toca el número)
 * 3. "¿Quién tiene más?" (50 niveles: comparación visual de cantidades y conjuntos)
 * 4. "La Torre Numérica" (50 niveles: ordena de menor a mayor los bloques)
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';

export const NUMBERS_SUBGAMES = [
  {
    id: 'tren_matematico',
    moduleKey: 'numbers_tren',
    title: 'EL TREN MATEMÁTICO',
    subtitle: '50 Niveles: Completa el vagón que falta',
    icon: '🚂',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#00838f'
  },
  {
    id: 'cuenta_objetos',
    moduleKey: 'numbers_conteo',
    title: 'CUENTA LOS OBJETOS',
    subtitle: '50 Niveles: Cuenta animalitos y frutas',
    icon: '🍎',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#ff9800'
  },
  {
    id: 'quien_tiene_mas',
    moduleKey: 'numbers_comparacion',
    title: '¿QUIÉN TIENE MÁS?',
    subtitle: '50 Niveles: Comparación de conjuntos',
    icon: '⚖️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#43a047'
  },
  {
    id: 'torre_bloques',
    moduleKey: 'numbers_orden',
    title: 'LA TORRE NUMÉRICA',
    subtitle: '50 Niveles: Ordena de menor a mayor',
    icon: '🧱',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#7b1fa2'
  }
];

export function getNumberPuzzleForLevel(levelNum) {
  if (levelNum === 1) {
    return {
      sequence: [1, 2, '?', 4, 5],
      correct: 3,
      options: [3, 6, 2],
      helperText: '¿Qué número falta en el trencito?'
    };
  }

  const start = ((levelNum - 1) % 15) + 1;
  const missingOffset = ((levelNum * 2) % 4) + 1;
  const seq = [];
  let correctVal = 0;

  for (let i = 0; i < 5; i++) {
    const val = start + i;
    if (i === missingOffset) {
      seq.push('?');
      correctVal = val;
    } else {
      seq.push(val);
    }
  }

  const wrong1 = correctVal + 1;
  const wrong2 = Math.max(1, correctVal - 2);
  const options = [correctVal, wrong1, wrong2].sort(() => 0.5 - Math.random());

  return {
    sequence: seq,
    correct: correctVal,
    options: options,
    helperText: `Nivel ${levelNum}: ¿Qué número completa el trencito?`
  };
}

export class NumbersScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.activeSubgame = null; // null = menú de subjuegos en círculos
    this.currentLevel = null;  // 1..50
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

    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    if (this.activeSubgame === 'tren_matematico') {
      this.renderTrenMatematico(container);
    } else if (this.activeSubgame === 'cuenta_objetos') {
      this.renderCuentaObjetos(container);
    } else if (this.activeSubgame === 'quien_tiene_mas') {
      this.renderQuienTieneMas(container);
    } else if (this.activeSubgame === 'torre_bloques') {
      this.renderTorreBloques(container);
    }
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUBJUEGOS EN CÍRCULOS
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in" id="numbersSubgamesMenu">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#00838f; margin:0; font-size:clamp(1.2rem, 3.2vw, 1.8rem);">MÓDULO DE NÚMEROS</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#006064;">
              Elige un juego en círculo para comenzar • Matemáticas de Kínder
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid">
            ${NUMBERS_SUBGAMES.map(game => {
              const prog = StorageManager.getModuleLevels(game.moduleKey);
              const count = Object.keys(prog.completed || {}).length;
              return `
                <button class="subgame-circle-card" data-game="${game.id}">
                  <div class="subgame-bubble ${game.bubbleClass} pulse-glow">
                    <span class="subgame-bubble-icon">${game.icon}</span>
                    <span class="subgame-levels-badge badge-orange">${game.totalLevels} Niveles</span>
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
          <span class="tip-text">💡 Toca cualquiera de los círculos para jugar sus 50 niveles didácticos.</span>
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

    audio.speak('Elige un juego de números');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS
  // ==========================================================================
  renderLevelSelector(container) {
    const sub = NUMBERS_SUBGAMES.find(g => g.id === this.activeSubgame) || NUMBERS_SUBGAMES[0];

    LevelSelector.render({
      container,
      moduleKey: sub.moduleKey,
      moduleTitle: sub.title,
      moduleIcon: sub.icon,
      bgClass: 'numbers-bg',
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
  // SUBJUEGO 1: EL TREN MATEMÁTICO (50 NIVELES)
  // ==========================================================================
  renderTrenMatematico(container) {
    const student = StorageManager.getActiveStudent();
    const puzzle = getNumberPuzzleForLevel(this.currentLevel);

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in" id="trenMatematicoModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>EL TREN MATEMÁTICO 🚂</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#00838f;">
              Nivel ${this.currentLevel} de 50: Completa el vagón
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board numbers-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div class="character-helper bounce-gentle" style="margin-bottom:12px; display:flex; align-items:center; gap:10px;">
            <div style="font-size:2.8rem;">🐒</div>
            <div class="speech-bubble" style="background:white; padding:8px 16px; border-radius:18px; border:2px solid #00bcd4; font-weight:bold; color:#006064;">
              ${puzzle.helperText}
            </div>
          </div>

          <div class="train-wrapper" style="display:flex; align-items:center; justify-content:center; gap:8px; margin:16px 0; max-width:94vw; overflow-x:auto;">
            <div class="locomotive" style="font-size:3.5rem;">🚂</div>
            <div class="train-container" style="display:flex; gap:8px;">
              ${puzzle.sequence.map((num) => {
                if (num === '?') {
                  return `<div class="train-car missing" id="missingCar" style="width:65px; height:65px; border-radius:14px; background:#fff9c4; border:3px dashed #fbc02d; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:900; color:#f57f17;">?</div>`;
                }
                return `<div class="train-car" style="width:65px; height:65px; border-radius:14px; background:#e0f7fa; border:3px solid #00bcd4; display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:900; color:#006064;">${num}</div>`;
              }).join('')}
            </div>
          </div>

          <div class="number-options-container" style="display:flex; flex-direction:column; align-items:center; margin-top:16px;">
            <p style="font-weight:bold; color:#006064; margin:0 0 10px 0;">Toca el número correcto:</p>
            <div class="number-options" style="display:flex; gap:14px;">
              ${puzzle.options.map((opt) => `
                <button class="num-btn" data-val="${opt}" style="width:65px; height:65px; border-radius:18px; background:linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border:3px solid white; color:white; font-size:1.8rem; font-weight:900; cursor:pointer; box-shadow:0 6px 14px rgba(255,152,0,0.35);">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnPlayHelperAudio">🔊 Repetir Pregunta</button>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnPlayHelperAudio')?.addEventListener('click', () => {
      audio.speak(puzzle.helperText);
    });

    const missingCar = container.querySelector('#missingCar');
    container.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        if (val === puzzle.correct) {
          audio.playSuccess();
          Confetti.shoot(2200);
          StorageManager.completeModuleLevel('numbers_tren', this.currentLevel, 3);
          StorageManager.addStars(1);
          if (missingCar) {
            missingCar.innerText = val;
            missingCar.style.background = '#c8e6c9';
            missingCar.style.borderColor = '#4caf50';
            missingCar.style.color = '#2e7d32';
          }

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
          btn.style.transform = 'scale(0.85)';
          setTimeout(() => { btn.style.transform = 'none'; }, 200);
        }
      });
    });

    audio.speak(puzzle.helperText);
  }

  // ==========================================================================
  // SUBJUEGO 2: CUENTA LOS OBJETOS (50 NIVELES)
  // ==========================================================================
  renderCuentaObjetos(container) {
    const student = StorageManager.getActiveStudent();
    const items = ['🍎', '⭐', '🐶', '🚗', '🎈', '🐸', '🦁', '🍰', '⚽', '🍦'];
    const emoji = items[(this.currentLevel - 1) % items.length];
    
    // Cantidad a contar: entre 1 y 10 según el nivel
    const targetCount = ((this.currentLevel - 1) % 9) + 2; // 2..10
    
    // Opciones
    const options = [targetCount, Math.max(1, targetCount - 1), targetCount + 1].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in" id="cuentaObjetosModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>CUENTA LOS OBJETOS 🍎</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#e65100;">
              Nivel ${this.currentLevel} de 50: ¿Cuántos hay?
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div style="background:white; padding:18px 24px; border-radius:24px; border:3px solid #ff9800; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:92vw;">
            <p style="font-size:1.1rem; font-weight:900; color:#e65100; margin:0 0 12px 0;">
              ¡Cuenta con tu dedito cuántos hay!
            </p>

            <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:10px; max-width:380px; margin:0 auto 18px auto;">
              ${Array.from({ length: targetCount }).map(() => `
                <span style="font-size:2.8rem; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.15));">${emoji}</span>
              `).join('')}
            </div>

            <div style="display:flex; gap:14px; justify-content:center;">
              ${options.map(opt => `
                <button class="count-opt-btn" data-val="${opt}" style="width:65px; height:65px; border-radius:18px; background:linear-gradient(135deg, #ff9800 0%, #e65100 100%); color:white; font-size:2rem; font-weight:900; border:3px solid white; cursor:pointer; box-shadow:0 6px 14px rgba(230,81,0,0.35);">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">Toca el número que coincida con la cantidad de objetos.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelectorAll('.count-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        if (val === targetCount) {
          audio.playSuccess();
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('numbers_conteo', this.currentLevel, 3);
          StorageManager.addStars(1);
          btn.style.transform = 'scale(1.2)';
          btn.style.background = '#4caf50';

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

    audio.speak(`¿Cuántos objetos hay? Cuéntalos y toca el número.`);
  }

  // ==========================================================================
  // SUBJUEGO 3: ¿QUIÉN TIENE MÁS? (50 NIVELES)
  // ==========================================================================
  renderQuienTieneMas(container) {
    const student = StorageManager.getActiveStudent();
    const countA = ((this.currentLevel * 3) % 6) + 2;
    let countB = ((this.currentLevel * 5) % 6) + 2;
    if (countA === countB) countB++;
    const isALarger = (countA > countB);

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in" id="quienTieneMasModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>¿QUIÉN TIENE MÁS? ⚖️</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#2e7d32;">
              Nivel ${this.currentLevel} de 50: Toca el grupo con MÁS elementos
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; justify-content:center; align-items:center; gap:20px; flex:1; flex-wrap:wrap;">
          <button class="group-choice-btn" id="btnGroupA" style="background:white; border:4px solid #4caf50; border-radius:24px; padding:18px 24px; min-width:180px; min-height:160px; cursor:pointer; box-shadow:0 8px 18px rgba(0,0,0,0.12); display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:140px;">
              ${Array.from({ length: countA }).map(() => '<span style="font-size:2rem;">⭐</span>').join('')}
            </div>
            <span style="margin-top:10px; font-weight:900; color:#2e7d32; font-size:1.1rem;">GRUPO A</span>
          </button>

          <button class="group-choice-btn" id="btnGroupB" style="background:white; border:4px solid #00bcd4; border-radius:24px; padding:18px 24px; min-width:180px; min-height:160px; cursor:pointer; box-shadow:0 8px 18px rgba(0,0,0,0.12); display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:140px;">
              ${Array.from({ length: countB }).map(() => '<span style="font-size:2rem;">🍬</span>').join('')}
            </div>
            <span style="margin-top:10px; font-weight:900; color:#00838f; font-size:1.1rem;">GRUPO B</span>
          </button>
        </main>

        <footer class="module-footer">
          <span class="tip-text">Toca la caja que contenga la mayor cantidad de objetos.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    const checkChoice = (chosenA) => {
      const correct = (chosenA === isALarger);
      if (correct) {
        audio.playSuccess();
        Confetti.shoot(2000);
        StorageManager.completeModuleLevel('numbers_comparacion', this.currentLevel, 3);
        StorageManager.addStars(1);
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
      }
    };

    container.querySelector('#btnGroupA')?.addEventListener('click', () => checkChoice(true));
    container.querySelector('#btnGroupB')?.addEventListener('click', () => checkChoice(false));

    audio.speak('¿Cuál grupo tiene más objetos?');
  }

  // ==========================================================================
  // SUBJUEGO 4: LA TORRE NUMÉRICA (50 NIVELES)
  // ==========================================================================
  renderTorreBloques(container) {
    const student = StorageManager.getActiveStudent();
    const startNum = ((this.currentLevel - 1) % 15) + 1;
    const correctSeq = [startNum, startNum + 1, startNum + 2, startNum + 3];
    const shuffled = [...correctSeq].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in" id="torreBloquesModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>LA TORRE NUMÉRICA 🧱</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#7b1fa2;">
              Nivel ${this.currentLevel} de 50: Toca los números en orden (del menor al mayor)
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div id="towerSlots" style="display:flex; gap:10px; margin-bottom:20px;">
            ${correctSeq.map((_, idx) => `
              <div class="tower-slot" id="slot_${idx}" style="width:65px; height:65px; border-radius:16px; background:white; border:3px dashed #ba68c8; display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:900; color:#7b1fa2;">
                _
              </div>
            `).join('')}
          </div>

          <div style="display:flex; gap:12px;">
            ${shuffled.map(n => `
              <button class="block-num-btn" data-val="${n}" style="width:65px; height:65px; border-radius:16px; background:linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%); color:white; font-size:1.8rem; font-weight:900; border:3px solid white; cursor:pointer; box-shadow:0 6px 14px rgba(123,31,162,0.35);">
                ${n}
              </button>
            `).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">Toca los números en orden creciente para armar la torre.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    let currentStep = 0;
    container.querySelectorAll('.block-num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        if (val === correctSeq[currentStep]) {
          audio.playPop();
          const slot = container.querySelector(`#slot_${currentStep}`);
          if (slot) {
            slot.innerText = val;
            slot.style.background = '#e1bee7';
            slot.style.borderStyle = 'solid';
          }
          btn.style.visibility = 'hidden';
          currentStep++;

          if (currentStep >= correctSeq.length) {
            audio.playSuccess();
            Confetti.shoot(2200);
            StorageManager.completeModuleLevel('numbers_orden', this.currentLevel, 3);
            StorageManager.addStars(1);
            setTimeout(() => {
              if (this.currentLevel < 50) {
                this.currentLevel++;
                this.render(container);
              } else {
                this.currentLevel = null;
                this.render(container);
              }
            }, 1100);
          }
        } else {
          audio.playWrong();
          btn.style.transform = 'rotate(-8deg)';
          setTimeout(() => { btn.style.transform = 'none'; }, 200);
        }
      });
    });

    audio.speak(`Toca los números del menor al mayor`);
  }
}
