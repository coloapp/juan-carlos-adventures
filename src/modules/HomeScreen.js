/**
 * HomeScreen - Pantalla Principal / Menú de Aventuras
 * Maquetada fielmente según los requerimientos del proyecto didáctico.
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

    container.innerHTML = `
      <div class="main-dashboard fade-in">
        <!-- Barra de Estado Superior -->
        <header class="top-bar">
          <div class="level-indicator">
            <span class="label">NIVEL: ${this.student.level || 1}</span>
            <div class="stars">
              <span class="star active">★</span>
              <span class="star-count">${this.student.stars || 0}</span>
            </div>
          </div>
          <h1 class="app-title" id="appTitle">${this.student.name.toUpperCase()}'S ADVENTURES</h1>
          <div class="system-icons">
            <button class="icon-btn audio-btn" id="btnAudioToggle" title="Audio">
              ${audio.isMuted ? '🔇' : '🔊'}
            </button>
            <button class="icon-btn settings-btn" id="btnSettings" title="Ajustes de Alumno">⚙️</button>
          </div>
        </header>

        <!-- Contenido Central Dividido en 2 Columnas -->
        <main class="dashboard-content">
          <!-- Columna Izquierda: Personaje Principal + Mundo Libre -->
          <section class="avatar-section">
            <div class="welcome-banner">
              <h2>¡HOLA, <br><span id="studentNameDisplay">${this.student.name.toUpperCase()}!</span></h2>
            </div>
            <div class="avatar-container" id="characterAvatarWrapper" title="¡Haz clic en Juan Carlos!">
              <img src="${this.student.avatarUrl || 'public/assets/images/character_avatar.svg'}" 
                   id="characterSprite" alt="Personaje Principal"
                   onerror="this.src='public/assets/images/character_avatar.png'">
              <div class="avatar-speech-bubble" id="avatarSpeechBubble">¡Vamos a jugar y aprender! 🎉</div>
            </div>
            <button class="open-world-banner-btn" id="btnGoToWorld">
              <span class="btn-icon">🌍</span>
              <div class="btn-text">
                <strong>MI MUNDO VIRTUAL</strong>
                <small>${unlockedItems.length} objetos desbloqueados</small>
              </div>
            </button>
          </section>

          <!-- Columna Derecha: Menú de Módulos (Grid) -->
          <section class="modules-grid">
            <button class="module-card letter-tracing" id="btnLetterTracing">
              <div class="icon-box"><img src="public/assets/icons/tracing.svg" alt="Trazado"></div>
              <span>TRAZADO DE LETRAS</span>
            </button>

            <button class="module-card syllables" id="btnSyllables">
              <div class="icon-box"><img src="public/assets/icons/syllables.svg" alt="Sílabas"></div>
              <span>SÍLABAS</span>
            </button>

            <button class="module-card numbers" id="btnNumbers">
              <div class="icon-box"><img src="public/assets/icons/numbers.svg" alt="Números"></div>
              <span>NÚMEROS</span>
            </button>

            <button class="module-card vowels" id="btnVowels">
              <div class="icon-box"><img src="public/assets/icons/vowels.svg" alt="Vocales"></div>
              <span>VOCALES</span>
            </button>

            <button class="module-card shapes" id="btnShapes">
              <div class="icon-box"><img src="public/assets/icons/shapes.svg" alt="Figuras"></div>
              <span>FIGURAS Y COLORES</span>
            </button>

            <button class="module-card name-tracing" id="btnNameTracing">
              <div class="icon-box"><img src="public/assets/icons/nametracing.svg" alt="Mi Nombre"></div>
              <span>TRAZADO DEL NOMBRE</span>
            </button>
          </section>
        </main>

        <!-- Barra Inferior de Recompensas -->
        <footer class="bottom-bar">
          <div class="bottom-bar-title">🎒 Mis Premios:</div>
          <div class="unlocked-inventory" id="previewInventory">
            ${this.renderInventorySlots(unlockedItems)}
          </div>
          <button class="home-btn" id="btnOpenWorldQuick" title="Ver mi mundo libre">
            🏰 Ver Sala
          </button>
        </footer>
      </div>
    `;

    this.bindEvents(container);
  }

  renderInventorySlots(items) {
    const maxSlots = 6;
    let html = '';
    for (let i = 0; i < maxSlots; i++) {
      if (items[i]) {
        html += `<div class="inventory-slot filled" title="${items[i].name}">
          <img src="${items[i].iconPath}" alt="${items[i].name}">
        </div>`;
      } else {
        html += `<div class="inventory-slot empty" title="¡Gana estrellas para desbloquear más!">🔒</div>`;
      }
    }
    return html;
  }

  bindEvents(container) {
    // Alternar audio
    container.querySelector('#btnAudioToggle')?.addEventListener('click', (e) => {
      const isMuted = audio.toggleMute();
      e.currentTarget.innerText = isMuted ? '🔇' : '🔊';
      if (!isMuted) audio.playClick();
    });

    // Ajustes de alumno
    container.querySelector('#btnSettings')?.addEventListener('click', () => {
      Modal.showStudentSettings(this.student, (updated) => {
        StorageManager.saveActiveStudent(updated);
        this.student = updated;
        this.render(container);
      });
    });

    // Reacción del avatar al hacerle clic
    container.querySelector('#characterAvatarWrapper')?.addEventListener('click', () => {
      audio.playPop();
      const phrases = [
        `¡Hola ${this.student.name}! ¿Qué jugamos hoy?`,
        '¡Eres súper inteligente! 🌟',
        '¡Vamos a ganar más estrellas para tu mundo!',
        '¡Me encanta aprender contigo! 🚀'
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      const bubble = container.querySelector('#avatarSpeechBubble');
      if (bubble) {
        bubble.innerText = randomPhrase;
        bubble.classList.remove('pop-bubble');
        void bubble.offsetWidth; // reset animation
        bubble.classList.add('pop-bubble');
      }
      audio.speak(randomPhrase);
    });

    // Navegación a módulos
    const navMap = [
      { id: '#btnLetterTracing', module: 'letter-tracing' },
      { id: '#btnSyllables', module: 'syllables' },
      { id: '#btnNumbers', module: 'numbers' },
      { id: '#btnVowels', module: 'vowels' },
      { id: '#btnShapes', module: 'shapes' },
      { id: '#btnNameTracing', module: 'name-tracing' },
      { id: '#btnGoToWorld', module: 'open-world' },
      { id: '#btnOpenWorldQuick', module: 'open-world' }
    ];

    navMap.forEach(item => {
      container.querySelector(item.id)?.addEventListener('click', () => {
        audio.playClick();
        this.navigator.navigate(item.module);
      });
    });
  }
}
