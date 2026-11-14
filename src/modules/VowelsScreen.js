/**
 * VowelsScreen.js - Módulo "Vocales" con Arquitectura Multi-Juegos y 50 Niveles
 * Reconocimiento fonético, visual y auditivo de las 5 vocales (A, E, I, O, U).
 * 
 * Subjuegos disponibles:
 * 1. "Tablero Mágico" (Actividad interactiva con sonido fonético e ilustraciones)
 * 2. "¿Cuál es la Vocal?" (50 niveles de discriminación de la vocal inicial)
 * 3. "Burbujas de Vocales" (50 niveles interactivos: revienta la vocal indicada)
 * 4. "Memorama Vocálico" (50 niveles de memoria: empareja vocal con dibujo)
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';

export const VOWELS_CATALOG = [
  { letter: 'A', word: 'Avión', emoji: '✈️', color: '#ff5722', soundWord: 'A de Avión' },
  { letter: 'E', word: 'Elefante', emoji: '🐘', color: '#4caf50', soundWord: 'E de Elefante' },
  { letter: 'I', word: 'Isla', emoji: '🏝️', color: '#00bcd4', soundWord: 'I de Isla' },
  { letter: 'O', word: 'Oso', emoji: '🐻', color: '#ff9800', soundWord: 'O de Oso' },
  { letter: 'U', word: 'Uva', emoji: '🍇', color: '#9c27b0', soundWord: 'U de Uva' }
];

export const VOWELS_WORDS_50 = [
  { letter: 'A', word: 'Avión', emoji: '✈️' },
  { letter: 'E', word: 'Elefante', emoji: '🐘' },
  { letter: 'I', word: 'Isla', emoji: '🏝️' },
  { letter: 'O', word: 'Oso', emoji: '🐻' },
  { letter: 'U', word: 'Uva', emoji: '🍇' },
  { letter: 'A', word: 'Árbol', emoji: '🌳' },
  { letter: 'E', word: 'Estrella', emoji: '⭐' },
  { letter: 'I', word: 'Iglesia', emoji: '⛪' },
  { letter: 'O', word: 'Ojo', emoji: '👁️' },
  { letter: 'U', word: 'Unicornio', emoji: '🦄' },
  { letter: 'A', word: 'Abeja', emoji: '🐝' },
  { letter: 'E', word: 'Escuela', emoji: '🏫' },
  { letter: 'I', word: 'Imán', emoji: '🧲' },
  { letter: 'O', word: 'Oveja', emoji: '🐑' },
  { letter: 'U', word: 'Uña', emoji: '💅' },
  { letter: 'A', word: 'Agua', emoji: '💧' },
  { letter: 'E', word: 'Elote', emoji: '🌽' },
  { letter: 'I', word: 'Iglú', emoji: '🧊' },
  { letter: 'O', word: 'Ola', emoji: '🌊' },
  { letter: 'U', word: 'Uno', emoji: '1️⃣' },
  { letter: 'A', word: 'Anillo', emoji: '💍' },
  { letter: 'E', word: 'Escalera', emoji: '🪜' },
  { letter: 'I', word: 'Incendio', emoji: '🔥' },
  { letter: 'O', word: 'Oruga', emoji: '🐛' },
  { letter: 'U', word: 'Universo', emoji: '🌌' },
  { letter: 'A', word: 'Araña', emoji: '🕷️' },
  { letter: 'E', word: 'Espada', emoji: '🗡️' },
  { letter: 'I', word: 'Insecto', emoji: '🐞' },
  { letter: 'O', word: 'Oro', emoji: '🪙' },
  { letter: 'U', word: 'Urna', emoji: '🗳️' },
  { letter: 'A', word: 'Auto', emoji: '🚗' },
  { letter: 'E', word: 'Espejo', emoji: '🪞' },
  { letter: 'I', word: 'Invierno', emoji: '❄️' },
  { letter: 'O', word: 'Olla', emoji: '🍲' },
  { letter: 'U', word: 'Útil', emoji: '✏️' },
  { letter: 'A', word: 'Arcoíris', emoji: '🌈' },
  { letter: 'E', word: 'Enano', emoji: '🧙' },
  { letter: 'I', word: 'Impresora', emoji: '🖨️' },
  { letter: 'O', word: 'Oreja', emoji: '👂' },
  { letter: 'U', word: 'Ukelele', emoji: '🪕' },
  { letter: 'A', word: 'Abuelo', emoji: '👴' },
  { letter: 'E', word: 'Erizo', emoji: '🦔' },
  { letter: 'I', word: 'Iguana', emoji: '🦎' },
  { letter: 'O', word: 'Océano', emoji: '🌊' },
  { letter: 'U', word: 'Urgencia', emoji: '🚨' },
  { letter: 'A', word: 'Amigo', emoji: '🤝' },
  { letter: 'E', word: 'Emperador', emoji: '👑' },
  { letter: 'I', word: 'Ilusión', emoji: '✨' },
  { letter: 'O', word: 'Orquídea', emoji: '🌸' },
  { letter: 'U', word: 'Unión', emoji: '🤲' }
];

export const VOWELS_SUBGAMES = [
  {
    id: 'tablero_vocales',
    moduleKey: 'vowels_tablero',
    title: 'TABLERO MÁGICO',
    subtitle: 'A, E, I, O, U con sonido e ilustraciones',
    icon: '🔤',
    totalLevels: 1,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#ff5722'
  },
  {
    id: 'cual_es_vocal',
    moduleKey: 'vowels_desafio',
    title: '¿CUÁL ES LA VOCAL?',
    subtitle: '50 Niveles de discriminación auditiva y visual',
    icon: '🎯',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#e91e63'
  },
  {
    id: 'burbujas_vocales',
    moduleKey: 'vowels_burbujas',
    title: 'BURBUJAS DE VOCALES',
    subtitle: '50 Niveles: ¡Revienta la vocal indicada!',
    icon: '🫧',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#00bcd4'
  },
  {
    id: 'memorama_vocales',
    moduleKey: 'vowels_memorama',
    title: 'MEMORAMA VOCÁLICO',
    subtitle: '50 Niveles de memoria y parejas',
    icon: '🃏',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#4caf50'
  }
];

export class VowelsScreen {
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
    // Vista 1: Menú de subjuegos en círculos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // Vista 2: Tablero mágico interactivo (actividad única)
    if (this.activeSubgame === 'tablero_vocales') {
      this.renderTableroMagico(container);
      return;
    }

    // Vista 3: Selector de 50 niveles
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // Vista 4: Nivel activo del subjuego
    if (this.activeSubgame === 'cual_es_vocal') {
      this.renderCualEsVocal(container);
    } else if (this.activeSubgame === 'burbujas_vocales') {
      this.renderBurbujasVocales(container);
    } else if (this.activeSubgame === 'memorama_vocales') {
      this.renderMemoramaVocales(container);
    }
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUBJUEGOS EN CÍRCULOS
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container vowels-bg fade-in" id="vowelsSubgamesMenu">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#d81b60; margin:0; font-size:clamp(1.2rem, 3.2vw, 1.8rem);">MÓDULO DE VOCALES</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#ad1457;">
              Elige una actividad en círculo para comenzar • A - E - I - O - U
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid">
            ${VOWELS_SUBGAMES.map(game => {
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
          <span class="tip-text">💡 Toca cualquiera de los 4 juegos en círculo para aprender las vocales.</span>
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
        const gid = e.currentTarget.dataset.game;
        this.activeSubgame = gid;
        this.currentLevel = null;
        this.render(container);
      });
    });

    audio.speak('Elige un juego de vocales');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS
  // ==========================================================================
  renderLevelSelector(container) {
    const sub = VOWELS_SUBGAMES.find(g => g.id === this.activeSubgame) || VOWELS_SUBGAMES[1];

    LevelSelector.render({
      container,
      moduleKey: sub.moduleKey,
      moduleTitle: sub.title,
      moduleIcon: sub.icon,
      bgClass: 'vowels-bg',
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
  // SUBJUEGO 1: TABLERO MÁGICO DE VOCALES
  // ==========================================================================
  renderTableroMagico(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container vowels-bg fade-in" id="vowelsTableroModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToVowelsMenu">⬅️ Menú Vocales</button>
          <div style="text-align:center;">
            <h2>TABLERO MÁGICO DE VOCALES</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#6a1b9a;">
              Toca cada vocal para escuchar su sonido fonético
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="vowels-grid-container" style="display:flex; justify-content:center; align-items:center; flex:1;">
          <div class="vowels-card-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:16px;">
            ${VOWELS_CATALOG.map(v => `
              <div class="vowel-card" data-vowel="${v.letter}" data-word="${v.word}" style="--v-color: ${v.color}; cursor:pointer; min-width:110px; padding:12px; background:white; border-radius:20px; box-shadow:0 8px 18px rgba(0,0,0,0.12); text-align:center; border:3px solid ${v.color};">
                <div class="vowel-letter" style="font-size:2.8rem; font-weight:900; color:${v.color};">${v.letter}</div>
                <div class="vowel-emoji" style="font-size:2.2rem; margin:4px 0;">${v.emoji}</div>
                <div class="vowel-word" style="font-weight:800; color:#37474f;">${v.word}</div>
                <button class="vowel-listen-btn" style="margin-top:6px; background:${v.color}; color:white; border:none; border-radius:12px; padding:4px 10px; font-weight:bold; cursor:pointer;">🔊 Escuchar</button>
              </div>
            `).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <button class="check-btn" id="btnCompleteTablero">⭐ ¡Completar Tablero Mágico!</button>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToVowelsMenu')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = null;
      this.render(container);
    });

    container.querySelectorAll('.vowel-card').forEach(card => {
      card.addEventListener('click', () => {
        const letter = card.dataset.vowel;
        const word = card.dataset.word;
        audio.playPop();
        audio.speak(`${letter}... de ${word}`);
      });
    });

    container.querySelector('#btnCompleteTablero')?.addEventListener('click', () => {
      audio.playFanfare();
      Confetti.shoot(3000);
      StorageManager.completeModuleLevel('vowels_tablero', 1, 3);
      StorageManager.addStars(3);
      setTimeout(() => {
        this.activeSubgame = null;
        this.render(container);
      }, 1800);
    });

    audio.speak('Toca cada vocal para escuchar su sonido');
  }

  // ==========================================================================
  // SUBJUEGO 2: ¿CUÁL ES LA VOCAL? (50 NIVELES)
  // ==========================================================================
  renderCualEsVocal(container) {
    const student = StorageManager.getActiveStudent();
    const item = VOWELS_WORDS_50[(this.currentLevel - 1) % VOWELS_WORDS_50.length];
    const targetVowel = item.letter;
    const shuffled = [...VOWELS_CATALOG].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container vowels-bg fade-in" id="cualEsVocalModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>¿CUÁL ES LA VOCAL?</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#ad1457;">
              Nivel ${this.currentLevel} de 50: ${item.word}
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div style="background:white; padding:20px 32px; border-radius:28px; border:4px solid #e91e63; box-shadow:0 12px 28px rgba(0,0,0,0.15); text-align:center; max-width:92vw;">
            <div style="font-size: clamp(3.2rem, 7vh, 4.8rem);">${item.emoji}</div>
            <h3 style="color:#d81b60; font-size:clamp(1.3rem, 3vh, 1.8rem); margin:8px 0;">
              ¿Con qué vocal empieza <strong>"${item.word}"</strong>?
            </h3>
            
            <div style="display:flex; gap:12px; justify-content:center; margin-top:16px; flex-wrap:wrap;">
              ${shuffled.map(v => `
                <button class="syllable-btn vowel-choice-btn" data-v="${v.letter}" style="background:${v.color}; font-size:clamp(1.5rem, 3.5vh, 2.2rem); min-width:clamp(52px, 10vw, 70px); min-height:clamp(52px, 10vw, 70px); border-radius:18px; border:3px solid white; color:white; font-weight:900; cursor:pointer; box-shadow:0 6px 12px rgba(0,0,0,0.18);">
                  ${v.letter}
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnListenWord">🔊 Escuchar: ${item.word}</button>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnListenWord')?.addEventListener('click', () => {
      audio.speak(item.word);
    });

    container.querySelectorAll('.vowel-choice-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chosen = e.currentTarget.dataset.v;
        if (chosen === targetVowel) {
          audio.playSuccess();
          Confetti.shoot(2200);
          StorageManager.completeModuleLevel('vowels_desafio', this.currentLevel, 3);
          StorageManager.addStars(1);
          btn.style.transform = 'scale(1.25)';
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
          setTimeout(() => { btn.style.transform = 'none'; }, 250);
          audio.speak(`Intenta otra vez, busca la vocal de ${item.word}`);
        }
      });
    });

    audio.speak(`¿Con qué vocal empieza ${item.word}?`);
  }

  // ==========================================================================
  // SUBJUEGO 3: BURBUJAS DE VOCALES (50 NIVELES)
  // ==========================================================================
  renderBurbujasVocales(container) {
    const student = StorageManager.getActiveStudent();
    const targetIdx = (this.currentLevel - 1) % VOWELS_CATALOG.length;
    const targetVowel = VOWELS_CATALOG[targetIdx].letter;
    
    // Generar 8 burbujas (al menos 3 de la vocal correcta)
    const bubbles = [];
    for (let i = 0; i < 3; i++) bubbles.push(targetVowel);
    while (bubbles.length < 8) {
      const rnd = VOWELS_CATALOG[Math.floor(Math.random() * VOWELS_CATALOG.length)].letter;
      bubbles.push(rnd);
    }
    bubbles.sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container vowels-bg fade-in" id="burbujasModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>BURBUJAS DE VOCALES 🫧</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#00838f;">
              Nivel ${this.currentLevel} de 50: ¡Revienta las burbujas con la <strong>${targetVowel}</strong>!
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
          <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:16px; max-width:680px;">
            ${bubbles.map((b, idx) => `
              <button class="bubble-btn" data-v="${b}" style="width:75px; height:75px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #e0f7fa 0%, #00bcd4 60%, #00838f 100%); border:3px solid #ffffff; box-shadow:0 6px 14px rgba(0,188,212,0.4); font-size:2rem; font-weight:900; color:white; cursor:pointer; transition:transform 0.15s ease;">
                ${b}
              </button>
            `).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">Toca todas las burbujas que tengan la letra <strong>${targetVowel}</strong>.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    let remaining = 3;
    container.querySelectorAll('.bubble-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.v;
        if (v === targetVowel && !btn.classList.contains('popped')) {
          btn.classList.add('popped');
          btn.style.transform = 'scale(0)';
          btn.style.opacity = '0';
          audio.playPop();
          remaining--;

          if (remaining <= 0) {
            audio.playSuccess();
            Confetti.shoot(2000);
            StorageManager.completeModuleLevel('vowels_burbujas', this.currentLevel, 3);
            StorageManager.addStars(1);
            setTimeout(() => {
              if (this.currentLevel < 50) {
                this.currentLevel++;
                this.render(container);
              } else {
                this.currentLevel = null;
                this.render(container);
              }
            }, 1000);
          }
        } else if (v !== targetVowel) {
          audio.playWrong();
          btn.style.transform = 'scale(0.85)';
          setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
        }
      });
    });

    audio.speak(`¡Revienta las burbujas con la letra ${targetVowel}!`);
  }

  // ==========================================================================
  // SUBJUEGO 4: MEMORAMA VOCÁLICO (50 NIVELES)
  // ==========================================================================
  renderMemoramaVocales(container) {
    const student = StorageManager.getActiveStudent();
    const item1 = VOWELS_CATALOG[(this.currentLevel - 1) % VOWELS_CATALOG.length];
    const item2 = VOWELS_CATALOG[(this.currentLevel) % VOWELS_CATALOG.length];
    
    // 4 cartas: 2 letras y 2 imágenes correspondientes
    const cards = [
      { id: 1, matchKey: item1.letter, display: item1.letter, isLetter: true, color: item1.color },
      { id: 2, matchKey: item1.letter, display: item1.emoji, isLetter: false, color: item1.color },
      { id: 3, matchKey: item2.letter, display: item2.letter, isLetter: true, color: item2.color },
      { id: 4, matchKey: item2.letter, display: item2.emoji, isLetter: false, color: item2.color }
    ].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container vowels-bg fade-in" id="memoramaModule">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>MEMORAMA VOCÁLICO 🃏</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#2e7d32;">
              Nivel ${this.currentLevel} de 50: Encuentra las parejas
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; justify-content:center; align-items:center; flex:1;">
          <div style="display:grid; grid-template-columns:repeat(2, 110px); gap:16px;">
            ${cards.map((c, idx) => `
              <button class="memo-card-btn" data-key="${c.matchKey}" data-display="${c.display}" style="width:110px; height:120px; border-radius:18px; background:linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); border:3px solid white; box-shadow:0 8px 18px rgba(0,0,0,0.18); font-size:2.8rem; font-weight:900; color:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                ❓
              </button>
            `).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">Toca dos cartas para descubrir su pareja.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    let flipped = [];
    let matchedPairs = 0;

    container.querySelectorAll('.memo-card-btn').forEach(card => {
      card.addEventListener('click', () => {
        if (flipped.length >= 2 || card.classList.contains('matched') || flipped.includes(card)) return;

        audio.playPop();
        card.innerText = card.dataset.display;
        card.style.background = '#ffffff';
        card.style.color = '#37474f';
        flipped.push(card);

        if (flipped.length === 2) {
          const [c1, c2] = flipped;
          if (c1.dataset.key === c2.dataset.key) {
            audio.playSuccess();
            c1.classList.add('matched');
            c2.classList.add('matched');
            c1.style.borderColor = '#4caf50';
            c2.style.borderColor = '#4caf50';
            flipped = [];
            matchedPairs++;

            if (matchedPairs >= 2) {
              Confetti.shoot(2000);
              StorageManager.completeModuleLevel('vowels_memorama', this.currentLevel, 3);
              StorageManager.addStars(2);
              setTimeout(() => {
                if (this.currentLevel < 50) {
                  this.currentLevel++;
                  this.render(container);
                } else {
                  this.currentLevel = null;
                  this.render(container);
                }
              }, 1200);
            }
          } else {
            audio.playWrong();
            setTimeout(() => {
              c1.innerText = '❓';
              c2.innerText = '❓';
              c1.style.background = 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
              c2.style.background = 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
              c1.style.color = 'transparent';
              c2.style.color = 'transparent';
              flipped = [];
            }, 800);
          }
        }
      });
    });

    audio.speak('Encuentra las parejas del memorama');
  }
}
