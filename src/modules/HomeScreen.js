/**
 * HomeScreen.js - Pantalla Principal Fullscreen
 * Réplica de la UX/UI con paisaje y galaxia de 6 módulos circulares.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Modal } from '../components/Modal.js';

export class HomeScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();
  }

  render(container) {
    this.student = StorageManager.getActiveStudent();
    const unlockedItems = rewards.getUnlockedItems();

    // Separar el nombre en dos palabras para el estilo gráfico (Ej: "JUAN" y "CARLOS!")
    const nameParts = (this.student.name || 'Juan Carlos').trim().split(' ');
    const part1 = (nameParts[0] || 'JUAN').toUpperCase();
    const part2 = (nameParts.slice(1).join(' ') || 'CARLOS!').toUpperCase();

    container.innerHTML = `
      <div class="main-dashboard fade-in">
        
        <!-- 1. BARRA SUPERIOR (HEADER) -->
        <header class="top-bar">
          <!-- Indicador de Nivel (Izquierda) -->
          <div class="level-badge" id="btnLevelInfo" title="Nivel y Estrellas">
            <span>LEVEL: <strong id="hudLevelNumber">${this.student.level || 1}</strong></span>
            <div class="level-stars-mini">
              <span class="mini-star active">★</span>
              <span class="mini-star ${this.student.stars >= 10 ? 'active' : ''}">★</span>
              <span class="mini-star ${this.student.stars >= 20 ? 'active' : ''}">★</span>
            </div>
          </div>

          <!-- Título Central 3D -->
          <div class="app-title-3d" id="appTitle">
            <span class="title-line-1">${this.student.name.toUpperCase()}'S</span>
            <span class="title-line-2">ADVENTURES</span>
          </div>

          <!-- Iconos de Sistema y Ajustes (Derecha) -->
          <div class="system-status-group">
            <span class="status-icon" title="Wi-Fi">📶</span>
            <span class="status-icon" title="Batería 100%">🔋</span>
            <button class="btn-audio-toggle" id="btnAudioToggle" title="Audio">
              ${audio.isMuted ? '🔇' : '🔊'}
            </button>
            <button class="btn-settings-red" id="btnSettings" title="Ajustes de Alumno">⚙️</button>
          </div>
        </header>

        <!-- 2. CONTENIDO PRINCIPAL (2 COLUMNAS) -->
        <main class="dashboard-content">
          
          <!-- LADO IZQUIERDO: PAISAJE DIDÁCTICO -->
          <section class="landscape-section">
            <!-- Cielo, Sol y Nubes -->
            <div class="scenery-sky-decor">
              <div class="sun-smiling">☀️</div>
              <div class="cloud-puffy cloud-1">☁️</div>
              <div class="cloud-puffy cloud-2">☁️</div>
            </div>

            <!-- Montañas al Fondo -->
            <div class="mountains-bg"></div>

            <!-- Colinas Verdes y Pinos -->
            <div class="hills-fg"></div>
            <div class="pine-tree tree-1">🌲</div>
            <div class="pine-tree tree-2">🌲</div>
            <div class="pine-tree tree-3">🌲</div>
            <div class="pine-tree tree-4">🌲</div>

            <!-- Título Bienvenido -->
            <div class="welcome-badge-group">
              <h2 class="welcome-title-cyan">BIENVENIDO,</h2>
              <div class="student-name-split" id="studentNameDisplay">
                <span class="name-part-1">${part1}</span>
                <span class="name-part-2">${part2}</span>
              </div>
            </div>

            <!-- Personaje Central (Juan Carlos) -->
            <div class="character-center-stage">
              <div class="character-clickable-wrapper" id="characterAvatarZone" title="¡Tócame para hablar conmigo!">
                <div class="character-speech-bubble" id="charSpeechBubble" style="display:none;"></div>
                <img src="${this.student.avatarUrl || 'public/assets/images/character_avatar.svg'}" 
                     class="character-img-sprite" alt="${this.student.name}"
                     onerror="this.src='public/assets/images/character_avatar.png'">
              </div>
            </div>
          </section>

          <!-- LADO DERECHO: GALAXIA DE 6 MÓDULOS CIRCULARES -->
          <section class="modules-section">
            <!-- Estrellitas de fondo -->
            <div class="sparkle-star sp-1">✨</div>
            <div class="sparkle-star sp-2">⭐</div>
            <div class="sparkle-star sp-3">✨</div>
            <div class="sparkle-star sp-4">⭐</div>
            <div class="sparkle-star sp-5">✨</div>

            <div class="circle-modules-grid">
              
              <!-- 1. TRAZANDO LETRAS -->
              <button class="circle-module-card" id="btnLetterTracing">
                <div class="circle-bubble bubble-letter">
                  <div class="bubble-inner-content">
                    <span class="letter-big-a">A</span>
                    <span class="pencil-mini">✏️</span>
                  </div>
                </div>
                <span class="circle-module-label">TRAZANDO <span class="label-highlight">LETRAS</span></span>
              </button>

              <!-- 2. SÍLABAS -->
              <button class="circle-module-card" id="btnSyllables">
                <div class="circle-bubble bubble-syllables">
                  <div class="bubble-inner-content">
                    <div class="syl-pill-1">MA</div>
                    <div class="syl-pill-2">MA-MA</div>
                  </div>
                </div>
                <span class="circle-module-label">SÍLABAS</span>
              </button>

              <!-- 3. NÚMEROS -->
              <button class="circle-module-card" id="btnNumbers">
                <div class="circle-bubble bubble-numbers">
                  <div class="bubble-inner-content">
                    <div class="numbers-3d-text">
                      <span class="num-orange">1</span><span class="num-cyan">2</span><span class="num-blue">3</span>
                    </div>
                    <div class="blocks-row-mini">
                      <span class="b-mini">2</span><span class="b-mini">3</span>
                    </div>
                  </div>
                </div>
                <span class="circle-module-label">NÚMEROS</span>
              </button>

              <!-- 4. VOCALES -->
              <button class="circle-module-card" id="btnVowels">
                <div class="circle-bubble bubble-vowels">
                  <div class="bubble-inner-content">
                    <div class="vowels-row-1"><span class="v-a">A</span> <span class="v-e">E</span></div>
                    <div class="vowels-row-2"><span class="v-i">I</span> <span class="v-o">O</span> <span class="v-u">U</span></div>
                    <span class="audio-mini-speaker">🔊</span>
                  </div>
                </div>
                <span class="circle-module-label">VOCALES</span>
              </button>

              <!-- 5. FIGURAS -->
              <button class="circle-module-card" id="btnShapes">
                <div class="circle-bubble bubble-shapes">
                  <div class="bubble-inner-content">
                    <div class="shapes-cluster-mini">
                      <span>🟣</span><span>🟨</span>
                      <span>🔺</span><span>⭐</span>
                    </div>
                  </div>
                </div>
                <span class="circle-module-label">FIGURAS</span>
              </button>

              <!-- 6. TRAZA TU NOMBRE -->
              <button class="circle-module-card" id="btnNameTracing">
                <div class="circle-bubble bubble-name-tracing">
                  <div class="bubble-inner-content">
                    <div class="name-tracing-inner-text">JUAN<br>CARLOS</div>
                    <span class="pencil-mini">✏️</span>
                  </div>
                </div>
                <span class="circle-module-label">TRAZA TU <span class="label-highlight">NOMBRE</span></span>
              </button>

            </div>
          </section>
        </main>

        <!-- 3. BARRA INFERIOR (FOOTER) -->
        <footer class="bottom-bar">
          <!-- Repisa con 7 estrellas (Izquierda) -->
          <div class="stars-shelf-container" id="btnStarsShelf" title="Estrellas ganadas">
            <div class="shelf-stars-row">
              ${this.renderShelfStars()}
            </div>
          </div>

          <!-- Botón Home central en arco (Naranja) -->
          <button class="home-arch-button" id="btnHomeWorld" title="Ir a Mi Mundo Libre (Toca Boca)">
            🏠
          </button>

          <!-- 4 Cápsulas de inventario de colores (Derecha) -->
          <div class="inventory-pills-row" id="btnInventoryPills" title="🎒 Tus Recompensas">
            <div class="reward-pill pill-red" title="${unlockedItems[0]?.name || 'Premio 1'}">
              ${unlockedItems[0] ? `<img src="${unlockedItems[0].iconPath}" alt="Premio">` : '⭐'}
            </div>
            <div class="reward-pill pill-green" title="${unlockedItems[1]?.name || 'Premio 2'}">
              ${unlockedItems[1] ? `<img src="${unlockedItems[1].iconPath}" alt="Premio">` : '🦖'}
            </div>
            <div class="reward-pill pill-purple" title="${unlockedItems[2]?.name || 'Premio 3'}">
              ${unlockedItems[2] ? `<img src="${unlockedItems[2].iconPath}" alt="Premio">` : '🏎️'}
            </div>
            <div class="reward-pill pill-cyan" title="${unlockedItems[3]?.name || 'Premio 4'}">
              ${unlockedItems[3] ? `<img src="${unlockedItems[3].iconPath}" alt="Premio">` : '🚀'}
            </div>
          </div>
        </footer>

      </div>
    `;

    this.bindEvents(container);
  }

  renderShelfStars() {
    const totalSlots = 7;
    const earned = Math.min(totalSlots, Math.floor((this.student.stars || 0) / 3) + 1);
    let html = '';
    for (let i = 0; i < totalSlots; i++) {
      html += `<span class="shelf-star ${i < earned ? 'filled' : ''}">★</span>`;
    }
    return html;
  }

  bindEvents(container) {
    // 1. Alternar Audio
    container.querySelector('#btnAudioToggle')?.addEventListener('click', (e) => {
      const isMuted = audio.toggleMute();
      e.currentTarget.innerText = isMuted ? '🔇' : '🔊';
      if (!isMuted) audio.playClick();
    });

    // 2. Ajustes de Alumno (Engrane ⚙️)
    container.querySelector('#btnSettings')?.addEventListener('click', () => {
      audio.playClick();
      Modal.showStudentSettings(this.student, (updated) => {
        StorageManager.saveActiveStudent(updated);
        this.student = updated;
        this.render(container);
      });
    });

    // 3. Click en Juan Carlos (Voz y animación)
    container.querySelector('#characterAvatarZone')?.addEventListener('click', () => {
      audio.playPop();
      const phrases = [
        `¡Hola ${this.student.name}! ¿Listo para jugar?`,
        '¡Eres súper inteligente! 🌟',
        '¡Toca cualquiera de los 6 círculos para aprender!',
        '¡Vamos a ganar más estrellas para tu mundo! 🚀'
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      const bubble = container.querySelector('#charSpeechBubble');
      if (bubble) {
        bubble.innerText = randomPhrase;
        bubble.style.display = 'block';
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = setTimeout(() => {
          bubble.style.display = 'none';
        }, 3200);
      }
      audio.speak(randomPhrase);
    });

    // 4. Mapeo de Navegación de los 6 Módulos y Botones de la barra inferior
    const navMap = [
      { id: '#btnLetterTracing', module: 'letter-tracing', sound: 'playClick' },
      { id: '#btnSyllables', module: 'syllables', sound: 'playPop' },
      { id: '#btnNumbers', module: 'numbers', sound: 'playClick' },
      { id: '#btnVowels', module: 'vowels', sound: 'playPop' },
      { id: '#btnShapes', module: 'shapes', sound: 'playClick' },
      { id: '#btnNameTracing', module: 'name-tracing', sound: 'playStar' },
      { id: '#btnHomeWorld', module: 'open-world', sound: 'playFanfare' },
      { id: '#btnStarsShelf', module: 'open-world', sound: 'playStar' },
      { id: '#btnInventoryPills', module: 'open-world', sound: 'playPop' },
      { id: '#btnLevelInfo', module: 'open-world', sound: 'playClick' }
    ];

    navMap.forEach(item => {
      container.querySelector(item.id)?.addEventListener('click', () => {
        if (item.sound && audio[item.sound]) audio[item.sound]();
        this.navigator.navigate(item.module);
      });
    });
  }
}
