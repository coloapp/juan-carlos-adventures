/**
 * HomeScreen.js - Pantalla Principal con diseño exacto del tablet didáctico
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
    const isCustomName = this.student.name && this.student.name.trim().toLowerCase() !== 'juan carlos';

    container.innerHTML = `
      <div class="main-dashboard fade-in">
        <div class="exact-screen-wrapper">
          <div class="tablet-display" id="tabletDisplay">
            
            <!-- 1. Barra Superior -->
            <div class="hud-level-pill" id="btnLevelInfo" title="Nivel ${this.student.level || 1} - ${this.student.stars || 0} Estrellas"></div>
            <button class="hud-btn-settings" id="btnSettings" title="⚙️ Ajustes del Alumno"></button>

            <!-- 2. Alumno / Bienvenida personalizada si cambia el nombre -->
            ${isCustomName ? `<div class="custom-name-banner">¡HOLA, ${this.student.name.toUpperCase()}! 👋</div>` : ''}

            <!-- 3. Avatar de Juan Carlos (Zona interactiva con voz y animaciones) -->
            <div class="hud-character-zone" id="characterAvatarZone" title="¡Tócame para hablar conmigo!">
              <div class="character-speech-bubble" id="charSpeechBubble" style="display:none;"></div>
            </div>

            <!-- 4. Los 6 Módulos Educativos Circulares -->
            <button class="hud-module-btn btn-letter-tracing" id="btnLetterTracing" title="🔤 Trazado de Letras (A-Z)"></button>
            <button class="hud-module-btn btn-syllables" id="btnSyllables" title="🧩 Sílabas (MA - MA)"></button>
            <button class="hud-module-btn btn-numbers" id="btnNumbers" title="🔢 Números (1 2 3)"></button>
            <button class="hud-module-btn btn-vowels" id="btnVowels" title="🍎 Vocales (A E I O U)"></button>
            <button class="hud-module-btn btn-shapes" id="btnShapes" title="🔷 Figuras y Colores"></button>
            <button class="hud-module-btn btn-name-tracing" id="btnNameTracing" title="✍️ Trazado de Mi Nombre"></button>

            <!-- 5. Barra Inferior -->
            <div class="hud-stars-shelf" id="btnStarsShelf" title="⭐ Tus Estrellas Ganadas"></div>
            <button class="hud-btn-home" id="btnHomeWorld" title="🏠 Mi Mundo Abierto (Sala Libre)"></button>
            <div class="hud-inventory-pills" id="btnInventoryPills" title="🎒 Tus Recompensas"></div>

          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // 1. Ajustes del Alumno (Gear ⚙️)
    container.querySelector('#btnSettings')?.addEventListener('click', () => {
      audio.playClick();
      Modal.showStudentSettings(this.student, (updated) => {
        StorageManager.saveActiveStudent(updated);
        this.student = updated;
        this.render(container);
      });
    });

    // 2. Tocar a Juan Carlos (Locución y animación)
    container.querySelector('#characterAvatarZone')?.addEventListener('click', () => {
      audio.playPop();
      const phrases = [
        `¡Hola ${this.student.name}! ¿Listo para una aventura?`,
        '¡Vamos a jugar y ganar muchas estrellas!',
        '¡Eres el mejor estudiante de kínder! 🌟',
        '¡Toca cualquiera de los círculos de colores para empezar!'
      ];
      const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      const bubble = container.querySelector('#charSpeechBubble');
      if (bubble) {
        bubble.innerText = selectedPhrase;
        bubble.style.display = 'block';
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = setTimeout(() => {
          bubble.style.display = 'none';
        }, 3200);
      }
      audio.speak(selectedPhrase);
    });

    // 3. Navegación de los 6 Módulos
    const modules = [
      { id: '#btnLetterTracing', key: 'letter-tracing', sound: 'playClick' },
      { id: '#btnSyllables', key: 'syllables', sound: 'playPop' },
      { id: '#btnNumbers', key: 'numbers', sound: 'playClick' },
      { id: '#btnVowels', key: 'vowels', sound: 'playPop' },
      { id: '#btnShapes', key: 'shapes', sound: 'playClick' },
      { id: '#btnNameTracing', key: 'name-tracing', sound: 'playStar' },
      { id: '#btnHomeWorld', key: 'open-world', sound: 'playFanfare' },
      { id: '#btnStarsShelf', key: 'name-tracing', sound: 'playStar' },
      { id: '#btnInventoryPills', key: 'open-world', sound: 'playPop' },
      { id: '#btnLevelInfo', key: 'open-world', sound: 'playStar' }
    ];

    modules.forEach(m => {
      container.querySelector(m.id)?.addEventListener('click', () => {
        if (m.sound && audio[m.sound]) audio[m.sound]();
        this.navigator.navigate(m.key);
      });
    });
  }
}
