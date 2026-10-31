/**
 * Juan Carlos's Adventures - Standalone Universal Bundle
 * Compatible con file:/// (sin error de CORS en Chrome/Edge),
 * GitHub Pages (HTTPS) y Android WebView (Capacitor).
 */
(function() {
  'use strict';

  /* ==========================================================================
     1. STORAGE MANAGER (100% Offline LocalStorage)
     ========================================================================== */
  class StorageManager {
    static KEYS = {
      ACTIVE_STUDENT: 'jc_active_student_profile',
      STUDENTS_LIST: 'jc_students_list',
      UNLOCKED_REWARDS: 'jc_unlocked_rewards',
      OPEN_WORLD_SCENE: 'jc_open_world_scene_state',
      AUDIO_MUTED: 'jc_audio_muted',
      MODULES_PROGRESS: 'jc_modules_progress'
    };

    static getActiveStudent() {
      try {
        const saved = localStorage.getItem(this.KEYS.ACTIVE_STUDENT);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      const defaultProfile = {
        id: 'student_juancarlos',
        name: 'Juan Carlos',
        avatarUrl: 'public/assets/images/character_avatar.svg',
        fallbackAvatarUrl: 'public/assets/images/character_avatar.png',
        level: 1,
        stars: 15,
        createdAt: new Date().toISOString()
      };

      this.saveActiveStudent(defaultProfile);
      return defaultProfile;
    }

    static saveActiveStudent(profile) {
      try {
        localStorage.setItem(this.KEYS.ACTIVE_STUDENT, JSON.stringify(profile));
        this.updateStudentInList(profile);
      } catch (e) {
        console.error('Error al guardar perfil:', e);
      }
    }

    static getStudentsList() {
      try {
        const saved = localStorage.getItem(this.KEYS.STUDENTS_LIST);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [this.getActiveStudent()];
    }

    static updateStudentInList(profile) {
      try {
        let list = this.getStudentsList();
        const idx = list.findIndex(s => s.id === profile.id);
        if (idx >= 0) list[idx] = profile;
        else list.push(profile);
        localStorage.setItem(this.KEYS.STUDENTS_LIST, JSON.stringify(list));
      } catch (e) {}
    }

    static addStars(amount = 1) {
      const student = this.getActiveStudent();
      student.stars = (student.stars || 0) + amount;
      student.level = Math.floor(student.stars / 10) + 1;
      this.saveActiveStudent(student);
      return student;
    }

    static getOpenWorldScene() {
      try {
        const saved = localStorage.getItem(this.KEYS.OPEN_WORLD_SCENE);
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }

    static saveOpenWorldScene(propsState) {
      try {
        localStorage.setItem(this.KEYS.OPEN_WORLD_SCENE, JSON.stringify(propsState));
      } catch (e) {}
    }

    static isAudioMuted() {
      return localStorage.getItem(this.KEYS.AUDIO_MUTED) === 'true';
    }

    static setAudioMuted(isMuted) {
      localStorage.setItem(this.KEYS.AUDIO_MUTED, isMuted ? 'true' : 'false');
    }
  }

  /* ==========================================================================
     2. AUDIO MANAGER (Web Audio API + Fonética en Español)
     ========================================================================== */
  class AudioManager {
    constructor() {
      this.ctx = null;
      this.isMuted = StorageManager.isAudioMuted();
      this.initContext();
    }

    initContext() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.ctx = new AudioContext();
      }
    }

    ensureContext() {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      StorageManager.setAudioMuted(this.isMuted);
      return this.isMuted;
    }

    playTone(freq, type = 'sine', duration = 0.15, gain = 0.2) {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playClick() { this.playTone(580, 'sine', 0.08, 0.15); }

    playPop() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
      } catch (e) {}
    }

    playStar() {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.2), idx * 70);
      });
    }

    playSuccess() {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.22, 0.22), idx * 90);
      });
    }

    playFanfare() {
      const sequence = [
        { f: 523.25, d: 0.15, delay: 0 },
        { f: 523.25, d: 0.15, delay: 150 },
        { f: 523.25, d: 0.15, delay: 300 },
        { f: 659.25, d: 0.35, delay: 450 },
        { f: 587.33, d: 0.2, delay: 800 },
        { f: 659.25, d: 0.2, delay: 1000 },
        { f: 783.99, d: 0.5, delay: 1200 },
        { f: 1046.50, d: 0.7, delay: 1700 }
      ];
      sequence.forEach(item => {
        setTimeout(() => this.playTone(item.f, 'triangle', item.d, 0.25), item.delay);
      });
    }

    playBrush() { this.playTone(400, 'sine', 0.04, 0.05); }
    playError() { this.playTone(220, 'sawtooth', 0.2, 0.15); }

    speak(text) {
      if (this.isMuted) return;
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.95;
        utterance.pitch = 1.15;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }

  const audio = new AudioManager();

  /* ==========================================================================
     3. REWARD MANAGER (Catálogo y Trofeos para Mundo Libre)
     ========================================================================== */
  class RewardManager {
    constructor() {
      this.STORAGE_KEY = StorageManager.KEYS.UNLOCKED_REWARDS;
      this.catalog = [
        { id: 'cap_01', name: 'Gorra de Astronauta', iconPath: 'public/assets/images/items/cap.svg', description: '¡Lista para misiones espaciales!', isUnlocked: true },
        { id: 'pet_dino', name: 'Mascota Dinosaurio', iconPath: 'public/assets/images/items/dino.svg', description: 'Un amiguito prehistórico que te acompaña.', isUnlocked: true },
        { id: 'toy_car', name: 'Carrito de Carreras', iconPath: 'public/assets/images/items/car.svg', description: '¡Rápido y veloz como un campeón!', isUnlocked: false },
        { id: 'star_badge', name: 'Insignia de Oro', iconPath: 'public/assets/images/items/star.svg', description: 'Premio por completar el Trazado de Nombre.', isUnlocked: false },
        { id: 'crown_royal', name: 'Corona Real', iconPath: 'public/assets/images/items/crown.svg', description: '¡Para el rey o reina de las letras!', isUnlocked: false },
        { id: 'rocket_ship', name: 'Cohete Espacial', iconPath: 'public/assets/images/items/rocket.svg', description: '¡Viaja hasta la luna y más allá!', isUnlocked: false },
        { id: 'honor_medal', name: 'Medalla al Esfuerzo', iconPath: 'public/assets/images/items/medal.svg', description: 'Reconocimiento por dominar los números.', isUnlocked: false },
        { id: 'art_palette', name: 'Paleta de Pintor', iconPath: 'public/assets/images/items/palette.svg', description: 'Desbloqueada en figuras y colores.', isUnlocked: false }
      ];
      this.syncWithLocalStorage();
    }

    syncWithLocalStorage() {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const unlockedIds = JSON.parse(saved);
          this.catalog.forEach(item => {
            if (unlockedIds.includes(item.id)) item.isUnlocked = true;
          });
        } else {
          this.persistUnlocked();
        }
      } catch (e) {}
    }

    persistUnlocked() {
      try {
        const unlockedIds = this.catalog.filter(i => i.isUnlocked).map(i => i.id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unlockedIds));
      } catch (e) {}
    }

    unlockReward(rewardId) {
      const item = this.catalog.find(i => i.id === rewardId);
      if (item && !item.isUnlocked) {
        item.isUnlocked = true;
        this.persistUnlocked();
        audio.playStar();
        return item;
      }
      return null;
    }

    getUnlockedItems() { return this.catalog.filter(item => item.isUnlocked); }
    getAllItems() { return this.catalog; }
  }

  const rewards = new RewardManager();

  /* ==========================================================================
     4. CONFETTI (Celebraciones)
     ========================================================================== */
  class Confetti {
    static shoot(duration = 2500) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '99999';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);
      const colors = ['#ff0055', '#00e5ff', '#ffeb3b', '#76ff03', '#ff9100', '#d500f9'];
      const particles = [];

      for (let i = 0; i < 110; i++) {
        particles.push({
          x: width / 2 + (Math.random() - 0.5) * 200,
          y: height / 2,
          vx: (Math.random() - 0.5) * 16,
          vy: -Math.random() * 15 - 5,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          gravity: 0.45,
          opacity: 1
        });
      }

      const startTime = Date.now();
      function render() {
        const elapsed = Date.now() - startTime;
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rotation += p.vRot;
          if (elapsed > duration - 800) {
            p.opacity = Math.max(0, (duration - elapsed) / 800);
          }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        });

        if (elapsed < duration) requestAnimationFrame(render);
        else canvas.remove();
      }
      requestAnimationFrame(render);
    }
  }

  /* ==========================================================================
     5. MODAL (Recompensas y Ajustes del Alumno)
     ========================================================================== */
  class Modal {
    static showReward(rewardItem, onContinue) {
      audio.playFanfare();
      Confetti.shoot(3000);

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="reward-modal-card bounce-in">
          <div class="modal-star-burst">✨ 🌟 ✨</div>
          <h2 class="modal-title">¡NUEVA RECOMPENSA DESBLOQUEADA!</h2>
          <div class="reward-badge-glow">
            <img src="${rewardItem.iconPath}" alt="${rewardItem.name}" class="reward-modal-img">
          </div>
          <h3 class="reward-item-name">${rewardItem.name}</h3>
          <p class="reward-item-desc">${rewardItem.description}</p>
          <p class="reward-hint">🎉 Ya puedes usar este premio en tu <strong>Mundo Abierto</strong>.</p>
          <button class="modal-btn-confirm" id="btnContinueReward">¡A JUGAR!</button>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#btnContinueReward').addEventListener('click', () => {
        audio.playClick();
        overlay.remove();
        if (onContinue) onContinue();
      });
    }

    static showStudentSettings(student, onSave) {
      audio.playPop();
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="settings-modal-card bounce-in">
          <div class="modal-header">
            <h2>🎒 Perfil del Alumno</h2>
            <button class="close-modal-btn" id="btnCloseSettings">✖</button>
          </div>
          <div class="settings-body">
            <div class="avatar-preview-area">
              <img src="${student.avatarUrl || 'public/assets/images/character_avatar.svg'}" 
                   id="previewAvatarImg" class="settings-avatar-img" alt="Avatar">
              <div class="avatar-actions">
                <label class="custom-file-upload">
                  📸 Cambiar Foto / Sticker (PNG)
                  <input type="file" id="inputAvatarFile" accept="image/*" style="display:none;">
                </label>
                <button class="btn-restore-avatar" id="btnRestoreAvatar">Restaurar Juan Carlos Original</button>
              </div>
            </div>

            <div class="form-group">
              <label for="inputStudentName">Nombre del Alumno:</label>
              <input type="text" id="inputStudentName" value="${student.name}" maxlength="20" placeholder="Ej: Juan Carlos">
              <small>Este nombre se usará en el módulo de trazado, saludos y felicitaciones.</small>
            </div>

            <div class="stats-overview">
              <div class="stat-pill">⭐ Estrellas: <strong>${student.stars || 0}</strong></div>
              <div class="stat-pill">🏆 Nivel: <strong>${student.level || 1}</strong></div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" id="btnCancelSettings">Cancelar</button>
            <button class="btn-save" id="btnSaveSettings">Guardar Cambios</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const inputName = overlay.querySelector('#inputStudentName');
      const previewImg = overlay.querySelector('#previewAvatarImg');
      const inputFile = overlay.querySelector('#inputAvatarFile');
      const btnRestore = overlay.querySelector('#btnRestoreAvatar');
      let currentAvatarData = student.avatarUrl || 'public/assets/images/character_avatar.svg';

      inputFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            currentAvatarData = event.target.result;
            previewImg.src = currentAvatarData;
            audio.playPop();
          };
          reader.readAsDataURL(file);
        }
      });

      btnRestore.addEventListener('click', () => {
        currentAvatarData = 'public/assets/images/character_avatar.svg';
        previewImg.src = currentAvatarData;
        audio.playPop();
      });

      const close = () => {
        audio.playClick();
        overlay.remove();
      };

      overlay.querySelector('#btnCloseSettings').addEventListener('click', close);
      overlay.querySelector('#btnCancelSettings').addEventListener('click', close);

      overlay.querySelector('#btnSaveSettings').addEventListener('click', () => {
        audio.playSuccess();
        const updatedStudent = {
          ...student,
          name: inputName.value.trim() || 'Juan Carlos',
          avatarUrl: currentAvatarData
        };
        overlay.remove();
        if (onSave) onSave(updatedStudent);
      });
    }
  }

  /* ==========================================================================
     6. HOME SCREEN (Dashboard Principal)
     ========================================================================== */
  class HomeScreen {
    constructor(nav) {
      this.navigator = nav;
      this.student = StorageManager.getActiveStudent();
    }

    render(container) {
      this.student = StorageManager.getActiveStudent();
      const unlockedItems = rewards.getUnlockedItems();

      container.innerHTML = `
        <div class="main-dashboard fade-in">
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

          <main class="dashboard-content">
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
      let html = '';
      for (let i = 0; i < 6; i++) {
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
      container.querySelector('#btnAudioToggle')?.addEventListener('click', (e) => {
        const isMuted = audio.toggleMute();
        e.currentTarget.innerText = isMuted ? '🔇' : '🔊';
        if (!isMuted) audio.playClick();
      });

      container.querySelector('#btnSettings')?.addEventListener('click', () => {
        Modal.showStudentSettings(this.student, (updated) => {
          StorageManager.saveActiveStudent(updated);
          this.student = updated;
          this.render(container);
        });
      });

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
          void bubble.offsetWidth;
          bubble.classList.add('pop-bubble');
        }
        audio.speak(randomPhrase);
      });

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

  /* ==========================================================================
     7. NAME TRACING SCREEN (Módulo Trazado de Nombre)
     ========================================================================== */
  class NameTracingScreen {
    constructor(nav) {
      this.navigator = nav;
      this.student = StorageManager.getActiveStudent();
      this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
      this.currentLetterIndex = 0;
      this.canvas = null;
      this.ctx = null;
      this.isDrawing = false;
      this.drawnPointsCount = 0;
    }

    render(container) {
      this.student = StorageManager.getActiveStudent();
      this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
      this.currentLetterIndex = 0;

      container.innerHTML = `
        <div class="tracing-module fade-in">
          <header class="tracing-header">
            <button class="back-btn" id="btnBackToHome">⬅️ Menú</button>
            <h2 class="module-title">TRAZA TU NOMBRE: <span id="currentLetterDisplay" class="letter-highlight">J</span></h2>
            <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
          </header>

          <main class="canvas-container">
            <div class="canvas-wrapper">
              <div class="letter-guide-bg" id="letterGuideText">J</div>
              <canvas id="tracingCanvas" width="600" height="380"></canvas>
            </div>
            <div class="name-progress-bar" id="nameProgressContainer"></div>
          </main>

          <footer class="tracing-footer">
            <button class="sound-btn" id="btnPlayPhonics">🔊 Escuchar Letra</button>
            <button class="check-btn" id="btnCheckLetter">⭐ ¡Terminé esta letra!</button>
          </footer>
        </div>
      `;

      this.initUI(container);
      this.setupCanvas(container);
      this.bindEvents(container);
      this.loadCurrentLetter(container);
    }

    initUI(container) {
      const progressContainer = container.querySelector('#nameProgressContainer');
      if (!progressContainer) return;
      progressContainer.innerHTML = '';

      for (let i = 0; i < this.targetName.length; i++) {
        const char = this.targetName[i];
        const slot = document.createElement('div');
        if (char === ' ') slot.className = 'letter-slot-space';
        else {
          slot.className = `letter-slot slot-${i}`;
          slot.innerText = char;
        }
        progressContainer.appendChild(slot);
      }
    }

    setupCanvas(container) {
      this.canvas = container.querySelector('#tracingCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineWidth = 26;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = '#ff4081';
    }

    loadCurrentLetter(container) {
      if (this.targetName[this.currentLetterIndex] === ' ') {
        this.currentLetterIndex++;
      }
      if (this.currentLetterIndex >= this.targetName.length) {
        this.onNameCompleted(container);
        return;
      }

      const currentChar = this.targetName[this.currentLetterIndex];
      const guideElem = container.querySelector('#letterGuideText');
      const displayElem = container.querySelector('#currentLetterDisplay');

      if (guideElem) guideElem.innerText = currentChar;
      if (displayElem) displayElem.innerText = currentChar;

      container.querySelectorAll('.letter-slot').forEach(slot => slot.classList.remove('active'));
      const activeSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
      if (activeSlot) activeSlot.classList.add('active');

      this.clearCanvas();
      this.drawnPointsCount = 0;
      audio.speak(`Traza la letra ${currentChar}`);
    }

    clearCanvas() {
      if (!this.canvas || !this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    bindEvents(container) {
      container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
        audio.playClick();
        this.navigator.navigate('home');
      });

      container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
        audio.playClick();
        this.clearCanvas();
        this.drawnPointsCount = 0;
      });

      container.querySelector('#btnPlayPhonics')?.addEventListener('click', () => {
        const char = this.targetName[this.currentLetterIndex];
        audio.speak(`Letra ${char}`);
      });

      container.querySelector('#btnCheckLetter')?.addEventListener('click', () => {
        this.advanceLetter(container);
      });

      this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY));
      this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY, container));
      this.canvas.addEventListener('mouseup', () => this.stopDrawing());
      this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.startDrawing((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.draw((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY, container);
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.stopDrawing();
      }, { passive: false });
    }

    startDrawing(x, y) {
      this.isDrawing = true;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      audio.playBrush();
    }

    draw(x, y, container) {
      if (!this.isDrawing) return;
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.drawnPointsCount++;
      if (this.drawnPointsCount > 55) {
        this.stopDrawing();
        this.advanceLetter(container);
      }
    }

    stopDrawing() {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.ctx.closePath();
    }

    advanceLetter(container) {
      const currentSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
      if (currentSlot) {
        currentSlot.classList.remove('active');
        currentSlot.classList.add('completed');
      }
      audio.playSuccess();
      StorageManager.addStars(1);
      this.currentLetterIndex++;
      setTimeout(() => this.loadCurrentLetter(container), 600);
    }

    onNameCompleted(container) {
      audio.playFanfare();
      Confetti.shoot(3500);
      StorageManager.addStars(5);

      const unlocked = rewards.unlockReward('star_badge');
      if (unlocked) {
        setTimeout(() => {
          Modal.showReward(unlocked, () => this.navigator.navigate('open-world'));
        }, 700);
      } else {
        setTimeout(() => {
          alert(`¡Felicidades ${this.student.name}! Has completado el trazo de tu nombre 🎉`);
          this.navigator.navigate('home');
        }, 800);
      }
      audio.speak(`¡Felicidades ${this.student.name}! ¡Completaste todo tu nombre!`);
    }
  }

  /* ==========================================================================
     8. LETTER TRACING SCREEN (Abecedario A-Z)
     ========================================================================== */
  class LetterTracingScreen {
    constructor(nav) {
      this.navigator = nav;
      this.alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
      this.currentIndex = 0;
      this.canvas = null;
      this.ctx = null;
      this.isDrawing = false;
      this.strokeCount = 0;
    }

    render(container) {
      const letter = this.alphabet[this.currentIndex];
      container.innerHTML = `
        <div class="tracing-module letter-bg fade-in">
          <header class="tracing-header">
            <button class="back-btn" id="btnBackToHome">⬅️ Menú</button>
            <h2 class="module-title">ABECEDARIO: <span id="currentLetterDisplay" class="letter-highlight">${letter}</span></h2>
            <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
          </header>

          <main class="canvas-container">
            <div class="canvas-wrapper">
              <div class="letter-guide-bg" id="letterGuideText">${letter}</div>
              <canvas id="letterCanvas" width="600" height="380"></canvas>
            </div>
            <div class="alphabet-scroll-bar" id="alphabetBar">
              ${this.alphabet.map((l, i) => `
                <button class="alpha-pill ${i === this.currentIndex ? 'active' : ''}" data-index="${i}">
                  ${l}
                </button>
              `).join('')}
            </div>
          </main>

          <footer class="tracing-footer">
            <button class="nav-arrow-btn" id="btnPrevLetter">◀ Anterior</button>
            <button class="sound-btn" id="btnPlayLetterAudio">🔊 Sonido de la ${letter}</button>
            <button class="check-btn" id="btnNextLetter">Siguiente Letra ▶</button>
          </footer>
        </div>
      `;

      this.setupCanvas(container);
      this.bindEvents(container);
      audio.speak(`Letra ${letter}`);
    }

    setupCanvas(container) {
      this.canvas = container.querySelector('#letterCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineWidth = 26;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = '#ff9800';
    }

    clearCanvas() {
      if (!this.canvas || !this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    bindEvents(container) {
      container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
        audio.playClick();
        this.navigator.navigate('home');
      });

      container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
        audio.playClick();
        this.clearCanvas();
      });

      container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
        const letter = this.alphabet[this.currentIndex];
        audio.speak(`Esta es la letra ${letter}`);
      });

      container.querySelector('#btnPrevLetter')?.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          audio.playClick();
          this.render(container);
        }
      });

      container.querySelector('#btnNextLetter')?.addEventListener('click', () => {
        audio.playSuccess();
        StorageManager.addStars(1);
        Confetti.shoot(1500);

        if (this.currentIndex < this.alphabet.length - 1) {
          this.currentIndex++;
          this.render(container);
        } else {
          const unlocked = rewards.unlockReward('crown_royal');
          if (unlocked) Modal.showReward(unlocked, () => this.navigator.navigate('home'));
          else this.navigator.navigate('home');
        }
      });

      container.querySelectorAll('.alpha-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          audio.playPop();
          this.currentIndex = parseInt(e.currentTarget.dataset.index, 10);
          this.render(container);
        });
      });

      const start = (x, y) => {
        this.isDrawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        audio.playBrush();
      };
      const move = (x, y) => {
        if (!this.isDrawing) return;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      };
      const stop = () => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.ctx.closePath();
      };

      this.canvas.addEventListener('mousedown', (e) => start(e.offsetX, e.offsetY));
      this.canvas.addEventListener('mousemove', (e) => move(e.offsetX, e.offsetY));
      this.canvas.addEventListener('mouseup', stop);
      this.canvas.addEventListener('mouseleave', stop);

      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        start((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        move((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        stop();
      }, { passive: false });
    }
  }

  /* ==========================================================================
     9. SYLLABLES SCREEN (Formación de Palabras)
     ========================================================================== */
  class SyllablesScreen {
    constructor(nav) {
      this.navigator = nav;
      this.words = [
        { word: 'ELEFANTE', image: 'public/assets/images/educational/elephant.svg', syllables: ['E', 'LE', 'FAN', 'TE'], missingIndex: 1, options: ['LE', 'MA', 'TO'] },
        { word: 'PELOTA', image: 'public/assets/icons/shapes.svg', syllables: ['PE', 'LO', 'TA'], missingIndex: 1, options: ['SA', 'LO', 'RA'] },
        { word: 'MONITO', image: 'public/assets/images/educational/monkey.svg', syllables: ['MO', 'NI', 'TO'], missingIndex: 0, options: ['PA', 'SO', 'MO'] },
        { word: 'ESTRELLA', image: 'public/assets/images/items/star.svg', syllables: ['ES', 'TRE', 'LLA'], missingIndex: 1, options: ['TRE', 'PLO', 'BRI'] }
      ];
      this.currentIndex = 0;
    }

    render(container) {
      const item = this.words[this.currentIndex];
      const student = StorageManager.getActiveStudent();

      container.innerHTML = `
        <div class="module-container syllables-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBack">⬅️ Menú</button>
            <h2>SÍLABAS - FORMAR PALABRAS</h2>
            <div class="score-box">⭐ <span id="score">${student.stars || 0} Estrellas</span></div>
          </header>

          <main class="game-board">
            <div class="word-card-box">
              <div class="visual-hint">
                <img src="${item.image}" alt="${item.word}" class="syllable-image bounce-gentle">
              </div>
              <div class="word-puzzle">
                ${item.syllables.map((syl, idx) => {
                  if (idx === item.missingIndex) return `<span class="drop-zone" id="dropZone">?</span>`;
                  return `<span class="static-syllable">${syl}</span>`;
                }).join('')}
              </div>
              <p class="instruction-text">¿Qué sílaba falta para completar <strong>${item.word}</strong>?</p>
              <div class="syllables-options" id="optionsContainer">
                ${item.options.map(opt => `<button class="syllable-btn" data-syl="${opt}">${opt}</button>`).join('')}
              </div>
            </div>
          </main>

          <footer class="module-footer">
            <button class="sound-btn" id="btnHearWord">🔊 Escuchar Palabra</button>
          </footer>
        </div>
      `;

      this.bindEvents(container, item);
      audio.speak(`¿Qué sílaba falta para escribir ${item.word}?`);
    }

    bindEvents(container, item) {
      container.querySelector('#btnBack')?.addEventListener('click', () => {
        audio.playClick();
        this.navigator.navigate('home');
      });

      container.querySelector('#btnHearWord')?.addEventListener('click', () => {
        audio.speak(item.word);
      });

      container.querySelectorAll('.syllable-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const selected = e.currentTarget.dataset.syl;
          const correctSyl = item.syllables[item.missingIndex];

          if (selected === correctSyl) {
            audio.playSuccess();
            e.currentTarget.classList.add('correct');
            const dropZone = container.querySelector('#dropZone');
            if (dropZone) {
              dropZone.innerText = correctSyl;
              dropZone.classList.add('solved');
            }
            StorageManager.addStars(2);
            Confetti.shoot(2000);
            audio.speak(`¡Excelente! ${item.word}`);

            setTimeout(() => {
              if (this.currentIndex < this.words.length - 1) {
                this.currentIndex++;
                this.render(container);
              } else {
                const unlocked = rewards.unlockReward('toy_car');
                if (unlocked) Modal.showReward(unlocked, () => this.navigator.navigate('home'));
                else this.navigator.navigate('home');
              }
            }, 1400);
          } else {
            audio.playError();
            e.currentTarget.classList.add('wrong');
            setTimeout(() => e.currentTarget.classList.remove('wrong'), 600);
            audio.speak('¡Inténtalo otra vez!');
          }
        });
      });
    }
  }

  /* ==========================================================================
     10. NUMBERS SCREEN (El Tren Matemático)
     ========================================================================== */
  class NumbersScreen {
    constructor(nav) {
      this.navigator = nav;
      this.trainPuzzles = [
        { sequence: [3, 4, 5, '?', 7], correct: 6, options: [6, 8, 4], helperText: '¿Qué número viene después del 5?' },
        { sequence: [1, 2, '?', 4, 5], correct: 3, options: [6, 3, 7], helperText: '¿Qué número falta en el trencito?' },
        { sequence: [6, 7, 8, '?', 10], correct: 9, options: [5, 9, 11], helperText: '¿Qué número va antes del 10?' }
      ];
      this.currentIndex = 0;
    }

    render(container) {
      const puzzle = this.trainPuzzles[this.currentIndex];

      container.innerHTML = `
        <div class="module-container numbers-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBack">⬅️ Menú</button>
            <h2>NÚMEROS - EL TREN MATEMÁTICO</h2>
            <div class="score-box">🚂 Vagón ${this.currentIndex + 1} de ${this.trainPuzzles.length}</div>
          </header>

          <main class="game-board numbers-board">
            <div class="character-helper bounce-gentle">
              <img src="public/assets/images/educational/monkey.svg" alt="Monito" class="helper-avatar">
              <div class="speech-bubble">${puzzle.helperText}</div>
            </div>

            <div class="train-wrapper">
              <div class="locomotive">🚂</div>
              <div class="train-container">
                ${puzzle.sequence.map((num) => {
                  if (num === '?') return `<div class="train-car missing" id="missingCar">?</div>`;
                  return `<div class="train-car">${num}</div>`;
                }).join('')}
              </div>
            </div>

            <div class="number-options-container">
              <p class="select-hint">Toca el número correcto:</p>
              <div class="number-options">
                ${puzzle.options.map(opt => `<button class="num-btn" data-num="${opt}">${opt}</button>`).join('')}
              </div>
            </div>
          </main>

          <footer class="module-footer">
            <button class="sound-btn" id="btnRepeatQuestion">🔊 Repetir Pregunta</button>
          </footer>
        </div>
      `;

      this.bindEvents(container, puzzle);
      audio.speak(puzzle.helperText);
    }

    bindEvents(container, puzzle) {
      container.querySelector('#btnBack')?.addEventListener('click', () => {
        audio.playClick();
        this.navigator.navigate('home');
      });

      container.querySelector('#btnRepeatQuestion')?.addEventListener('click', () => {
        audio.speak(puzzle.helperText);
      });

      container.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const val = parseInt(e.currentTarget.dataset.num, 10);
          if (val === puzzle.correct) {
            audio.playSuccess();
            e.currentTarget.classList.add('correct');
            const missingCar = container.querySelector('#missingCar');
            if (missingCar) {
              missingCar.innerText = val.toString();
              missingCar.classList.add('filled-train');
            }
            StorageManager.addStars(2);
            Confetti.shoot(2000);
            audio.speak(`¡Muy bien! El número es ${val}`);

            setTimeout(() => {
              if (this.currentIndex < this.trainPuzzles.length - 1) {
                this.currentIndex++;
                this.render(container);
              } else {
                const unlocked = rewards.unlockReward('honor_medal');
                if (unlocked) Modal.showReward(unlocked, () => this.navigator.navigate('home'));
                else this.navigator.navigate('home');
              }
            }, 1500);
          } else {
            audio.playError();
            e.currentTarget.classList.add('wrong');
            setTimeout(() => e.currentTarget.classList.remove('wrong'), 600);
            audio.speak('Ese no es, ¡prueba con otro!');
          }
        });
      });
    }
  }

  /* ==========================================================================
     11. VOWELS SCREEN (Las 5 Vocales)
     ========================================================================== */
  class VowelsScreen {
    constructor(nav) {
      this.navigator = nav;
      this.vowels = [
        { letter: 'A', word: 'Avión', emoji: '✈️', color: '#ff5722' },
        { letter: 'E', word: 'Elefante', emoji: '🐘', color: '#4caf50' },
        { letter: 'I', word: 'Isla', emoji: '🏝️', color: '#00bcd4' },
        { letter: 'O', word: 'Oso', emoji: '🐻', color: '#ff9800' },
        { letter: 'U', word: 'Uva', emoji: '🍇', color: '#9c27b0' }
      ];
    }

    render(container) {
      container.innerHTML = `
        <div class="module-container vowels-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBack">⬅️ Menú</button>
            <h2>LAS VOCALES: A - E - I - O - U</h2>
            <div class="score-box">⭐ ¡Toca cada tarjeta!</div>
          </header>

          <main class="vowels-grid-container">
            <div class="vowels-card-grid">
              ${this.vowels.map(v => `
                <div class="vowel-card" data-vowel="${v.letter}" data-word="${v.word}" style="--v-color: ${v.color}">
                  <div class="vowel-letter">${v.letter}</div>
                  <div class="vowel-emoji">${v.emoji}</div>
                  <div class="vowel-word">${v.word}</div>
                  <button class="vowel-listen-btn">🔊 Escuchar</button>
                </div>
              `).join('')}
            </div>
          </main>

          <footer class="module-footer">
            <button class="check-btn" id="btnAllVowelsSound">🎵 Cantar Vocales</button>
          </footer>
        </div>
      `;

      this.bindEvents(container);
    }

    bindEvents(container) {
      container.querySelector('#btnBack')?.addEventListener('click', () => {
        audio.playClick();
        this.navigator.navigate('home');
      });

      container.querySelector('#btnAllVowelsSound')?.addEventListener('click', () => {
        audio.playStar();
        Confetti.shoot(2500);
        StorageManager.addStars(2);
        audio.speak('A, E, I, O, U... ¡Las cinco vocales son geniales!');
      });

      container.querySelectorAll('.vowel-card').forEach(card => {
        card.addEventListener('click', () => {
          const letter = card.dataset.vowel;
          const word = card.dataset.word;
          audio.playPop();
          card.classList.remove('pulse-vowel');
          void card.offsetWidth;
          card.classList.add('pulse-vowel');
          audio.speak(`${letter}... de ${word}`);
        });
      });
    }
  }

  /* ==========================================================================
     12. SHAPES SCREEN (Figuras Geométricas y Colores)
     ========================================================================== */
  class ShapesScreen {
    constructor(nav) {
      this.navigator = nav;
      this.shapes = [
        { name: 'CÍRCULO', shapeType: 'circle', objectText: '🍩 Como una dona deliciosa', color: '#ff5722' },
        { name: 'TRIÁNGULO', shapeType: 'triangle', objectText: '🍕 Como una rebanada de pizza', color: '#ffb300' },
        { name: 'CUADRADO', shapeType: 'square', objectText: '🎁 Como una caja de regalo', color: '#4caf50' },
        { name: 'ESTRELLA', shapeType: 'star', objectText: '⭐ Como las estrellas del cielo', color: '#9c27b0' }
      ];
      this.currentColor = '#ff5722';
    }

    render(container) {
      container.innerHTML = `
        <div class="module-container shapes-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBack">⬅️ Menú</button>
            <h2>FIGURAS GEOMÉTRICAS Y COLORES</h2>
            <div class="score-box">🎨 Toca para pintar</div>
          </header>

          <main class="shapes-game-board">
            <div class="color-palette-bar">
              <span>Pincel Mágico:</span>
              <button class="palette-swatch active" style="background:#ff5722" data-color="#ff5722"></button>
              <button class="palette-swatch" style="background:#ffeb3b" data-color="#ffeb3b"></button>
              <button class="palette-swatch" style="background:#4caf50" data-color="#4caf50"></button>
              <button class="palette-swatch" style="background:#00bcd4" data-color="#00bcd4"></button>
              <button class="palette-swatch" style="background:#e91e63" data-color="#e91e63"></button>
              <button class="palette-swatch" style="background:#9c27b0" data-color="#9c27b0"></button>
            </div>

            <div class="shapes-grid">
              ${this.shapes.map(item => `
                <div class="shape-card" data-shape="${item.name}">
                  <div class="shape-figure-box">
                    <div class="shape-element ${item.shapeType}" style="--current-fill: ${item.color}"></div>
                  </div>
                  <h3 class="shape-name">${item.name}</h3>
                  <p class="shape-desc">${item.objectText}</p>
                  <button class="shape-action-btn">🖌️ Pintar</button>
                </div>
              `).join('')}
            </div>
          </main>

          <footer class="module-footer">
            <button class="check-btn" id="btnFinishShapes">⭐ ¡Completar Figuras!</button>
          </footer>
        </div>
      `;

      this.bindEvents(container);
    }

    bindEvents(container) {
      container.querySelector('#btnBack')?.addEventListener('click', () => {
        audio.playClick();
        this.navigator.navigate('home');
      });

      container.querySelectorAll('.palette-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          audio.playPop();
          container.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.currentColor = e.currentTarget.dataset.color;
        });
      });

      container.querySelectorAll('.shape-card').forEach(card => {
        card.addEventListener('click', () => {
          audio.playBrush();
          const element = card.querySelector('.shape-element');
          if (element) {
            element.style.setProperty('--current-fill', this.currentColor);
            element.classList.remove('shape-bounce');
            void element.offsetWidth;
            element.classList.add('shape-bounce');
          }
          audio.speak(`${card.dataset.shape}`);
        });
      });

      container.querySelector('#btnFinishShapes')?.addEventListener('click', () => {
        audio.playSuccess();
        Confetti.shoot(2500);
        StorageManager.addStars(3);

        const unlocked = rewards.unlockReward('art_palette');
        if (unlocked) Modal.showReward(unlocked, () => this.navigator.navigate('home'));
        else this.navigator.navigate('home');
      });
    }
  }

  /* ==========================================================================
     13. OPEN WORLD SCREEN (Sala Libre estilo Toca Boca World)
     ========================================================================== */
  class OpenWorldScreen {
    constructor(nav) {
      this.navigator = nav;
      this.student = StorageManager.getActiveStudent();
      this.activeElement = null;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    }

    render(container) {
      this.student = StorageManager.getActiveStudent();
      const unlockedItems = rewards.getUnlockedItems();

      container.innerHTML = `
        <div class="open-world-container fade-in">
          <header class="world-header">
            <button class="back-btn" id="btnBackToHome">⬅️ Menú</button>
            <h2>EL MUNDO DE ${this.student.name.toUpperCase()}</h2>
            <div class="world-actions">
              <button class="bag-icon-btn" id="btnToggleInventory">
                🎒 Objetos (<span id="unlockedCount">${unlockedItems.length}</span>)
              </button>
              <button class="clean-world-btn" id="btnResetWorld" title="Reacomodar">🔄 Limpiar</button>
            </div>
          </header>

          <main class="playmat-scene" id="playmatScene">
            <div class="scenery-window">🪟</div>
            <div class="scenery-sun">☀️</div>
            <div class="scenery-shelf"><div class="shelf-board"></div></div>
            <div class="scenery-rug"></div>

            <div class="draggable-prop draggable-avatar" id="playerAvatar" style="left: 120px; top: 180px;">
              <img src="${this.student.avatarUrl || 'public/assets/images/character_avatar.svg'}" 
                   alt="Avatar ${this.student.name}"
                   onerror="this.src='public/assets/images/character_avatar.png'">
              <div class="avatar-tag">${this.student.name}</div>
            </div>

            <div id="placedPropsContainer"></div>
          </main>

          <aside class="inventory-drawer" id="inventoryDrawer">
            <div class="drawer-header">
              <h3>🎒 Tus Premios Ganados</h3>
              <button class="close-drawer-btn" id="btnCloseDrawer">✖</button>
            </div>
            <p class="drawer-instruction">¡Toca un objeto para llevarlo a tu mundo!</p>
            <div class="inventory-grid" id="inventoryGrid">
              ${unlockedItems.map(item => `
                <div class="inventory-item" data-id="${item.id}" title="${item.name}">
                  <img src="${item.iconPath}" alt="${item.name}">
                  <span>${item.name}</span>
                </div>
              `).join('')}
            </div>
          </aside>
        </div>
      `;

      this.bindEvents(container);
      this.restoreSceneState(container);
    }

    bindEvents(container) {
      const scene = container.querySelector('#playmatScene');
      const drawer = container.querySelector('#inventoryDrawer');

      container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
        audio.playClick();
        this.saveSceneState(container);
        this.navigator.navigate('home');
      });

      container.querySelector('#btnToggleInventory')?.addEventListener('click', () => {
        audio.playPop();
        drawer.classList.toggle('open');
      });

      container.querySelector('#btnCloseDrawer')?.addEventListener('click', () => {
        audio.playClick();
        drawer.classList.remove('open');
      });

      container.querySelector('#btnResetWorld')?.addEventListener('click', () => {
        audio.playPop();
        const placedProps = container.querySelector('#placedPropsContainer');
        if (placedProps) placedProps.innerHTML = '';
        StorageManager.saveOpenWorldScene(null);
        audio.speak('¡Mundo ordenado!');
      });

      container.querySelectorAll('.inventory-item').forEach(itemElem => {
        itemElem.addEventListener('click', () => {
          const id = itemElem.dataset.id;
          const item = rewards.getAllItems().find(i => i.id === id);
          if (item) {
            this.spawnPropInWorld(container, item);
            audio.playPop();
            drawer.classList.remove('open');
          }
        });
      });

      this.setupDragAndDrop(scene, container);
    }

    spawnPropInWorld(container, item, x = 280, y = 220) {
      const placedContainer = container.querySelector('#placedPropsContainer');
      if (!placedContainer) return;

      const prop = document.createElement('div');
      prop.className = 'draggable-prop world-item';
      prop.dataset.itemId = item.id;
      prop.style.left = `${x}px`;
      prop.style.top = `${y}px`;
      prop.innerHTML = `
        <img src="${item.iconPath}" alt="${item.name}" draggable="false">
        <button class="remove-prop-btn" title="Guardar">✖</button>
      `;

      prop.querySelector('.remove-prop-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        audio.playClick();
        prop.remove();
        this.saveSceneState(container);
      });

      placedContainer.appendChild(prop);
      this.saveSceneState(container);
    }

    setupDragAndDrop(scene, container) {
      const onStart = (clientX, clientY, target) => {
        const prop = target.closest('.draggable-prop');
        if (prop) {
          this.activeElement = prop;
          const rect = prop.getBoundingClientRect();
          this.dragOffsetX = clientX - rect.left;
          this.dragOffsetY = clientY - rect.top;
          prop.classList.add('is-dragging');
          audio.playBrush();
        }
      };

      const onMove = (clientX, clientY) => {
        if (!this.activeElement) return;
        const sceneRect = scene.getBoundingClientRect();
        const x = clientX - sceneRect.left - this.dragOffsetX;
        const y = clientY - sceneRect.top - this.dragOffsetY;
        const clampedX = Math.max(10, Math.min(sceneRect.width - 90, x));
        const clampedY = Math.max(10, Math.min(sceneRect.height - 110, y));
        this.activeElement.style.left = `${clampedX}px`;
        this.activeElement.style.top = `${clampedY}px`;
      };

      const onEnd = () => {
        if (this.activeElement) {
          this.activeElement.classList.remove('is-dragging');
          this.activeElement = null;
          audio.playPop();
          this.saveSceneState(container);
        }
      };

      scene.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY, e.target));
      window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onEnd);

      scene.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY, e.target);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!this.activeElement) return;
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
      }, { passive: true });

      window.addEventListener('touchend', onEnd);
    }

    saveSceneState(container) {
      const avatar = container.querySelector('#playerAvatar');
      const props = container.querySelectorAll('#placedPropsContainer .world-item');
      const state = {
        avatarPos: avatar ? { left: avatar.style.left, top: avatar.style.top } : null,
        props: Array.from(props).map(p => ({
          itemId: p.dataset.itemId,
          left: p.style.left,
          top: p.style.top
        }))
      };
      StorageManager.saveOpenWorldScene(state);
    }

    restoreSceneState(container) {
      const state = StorageManager.getOpenWorldScene();
      if (!state) {
        const dino = rewards.getAllItems().find(i => i.id === 'pet_dino');
        if (dino) this.spawnPropInWorld(container, dino, 340, 240);
        return;
      }
      if (state.avatarPos) {
        const avatar = container.querySelector('#playerAvatar');
        if (avatar) {
          avatar.style.left = state.avatarPos.left;
          avatar.style.top = state.avatarPos.top;
        }
      }
      if (state.props && state.props.length > 0) {
        const allItems = rewards.getAllItems();
        state.props.forEach(p => {
          const item = allItems.find(i => i.id === p.itemId);
          if (item) {
            const x = parseInt(p.left, 10) || 200;
            const y = parseInt(p.top, 10) || 200;
            this.spawnPropInWorld(container, item, x, y);
          }
        });
      }
    }
  }

  /* ==========================================================================
     14. APP ORCHESTRATOR & ROUTER
     ========================================================================== */
  class App {
    constructor() {
      this.container = document.getElementById('app');
      this.currentScreen = null;
      this.screens = {
        'home': new HomeScreen(this),
        'name-tracing': new NameTracingScreen(this),
        'letter-tracing': new LetterTracingScreen(this),
        'syllables': new SyllablesScreen(this),
        'numbers': new NumbersScreen(this),
        'vowels': new VowelsScreen(this),
        'shapes': new ShapesScreen(this),
        'open-world': new OpenWorldScreen(this)
      };
      this.init();
    }

    init() {
      const unlockAudio = () => {
        audio.ensureContext();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);

      window.addEventListener('popstate', (e) => {
        if (e.state && e.state.module) this.navigate(e.state.module, false);
        else this.navigate('home', false);
      });

      this.navigate('home', false);
    }

    navigate(screenKey, pushHistory = true) {
      const screen = this.screens[screenKey];
      if (!screen) {
        console.error(`Módulo desconocido: ${screenKey}`);
        return;
      }
      if (pushHistory) {
        window.history.pushState({ module: screenKey }, '', `#${screenKey}`);
      }
      this.currentScreen = screen;
      this.container.innerHTML = '';
      screen.render(this.container);
    }
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.__APP = new App(); });
  } else {
    window.__APP = new App();
  }
})();
