/**
 * Juan Carlos's Adventures - Standalone Universal Bundle
 * Compatible con file:/// (sin CORS), GitHub Pages y Android WebView.
 * Organizado en EspaÃ±ol con 50 Juegos en CÃ­rculos por mÃ³dulo y validaciÃ³n por waypoints.
 */
(function() {
  'use strict';

  /* ==========================================================================
     FILE: src/core/StorageManager.js
     ========================================================================== */

/**
 * StorageManager - Gestor 100% offline para almacenamiento local
 * Maneja datos de perfil de alumnos, progreso, estrellas e inventario.
 */
class StorageManager {
  static KEYS = {
    ACTIVE_STUDENT: 'jc_active_student_profile',
    STUDENTS_LIST: 'jc_students_list',
    UNLOCKED_REWARDS: 'jc_unlocked_rewards',
    OPEN_WORLD_SCENE: 'jc_open_world_scene_state',
    AUDIO_MUTED: 'jc_audio_muted',
    MODULES_PROGRESS: 'jc_modules_progress'
  };

  /**
   * Obtiene el perfil del alumno activo o crea el perfil por defecto para Juan Carlos
   */
  static getActiveStudent() {
    try {
      const saved = localStorage.getItem(this.KEYS.ACTIVE_STUDENT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error al cargar perfil de localStorage:', e);
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
    const defaultStudent = this.getActiveStudent();
    return [defaultStudent];
  }

  static updateStudentInList(profile) {
    try {
      let list = this.getStudentsList();
      const idx = list.findIndex(s => s.id === profile.id);
      if (idx >= 0) {
        list[idx] = profile;
      } else {
        list.push(profile);
      }
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

  static getProgress(moduleKey) {
    try {
      const saved = localStorage.getItem(this.KEYS.MODULES_PROGRESS);
      const data = saved ? JSON.parse(saved) : {};
      return data[moduleKey] || { completed: 0, total: 10, starsEarned: 0 };
    } catch (e) {
      return { completed: 0, total: 10, starsEarned: 0 };
    }
  }

  static saveProgress(moduleKey, progress) {
    try {
      const saved = localStorage.getItem(this.KEYS.MODULES_PROGRESS);
      const data = saved ? JSON.parse(saved) : {};
      data[moduleKey] = { ...data[moduleKey], ...progress };
      localStorage.setItem(this.KEYS.MODULES_PROGRESS, JSON.stringify(data));
    } catch (e) {}
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

  static getModuleLevels(moduleKey) {
    try {
      const saved = localStorage.getItem('jc_mod_lvl_' + moduleKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // El nivel 1 siempre está desbloqueado por defecto
    return { maxUnlocked: 1, completed: {} };
  }

  static completeModuleLevel(moduleKey, levelNum, starsEarned = 3) {
    const data = this.getModuleLevels(moduleKey);
    data.completed = data.completed || {};
    data.completed[levelNum] = Math.max(data.completed[levelNum] || 0, starsEarned);
    if (levelNum >= data.maxUnlocked && data.maxUnlocked < 50) {
      data.maxUnlocked = levelNum + 1;
    }
    try {
      localStorage.setItem('jc_mod_lvl_' + moduleKey, JSON.stringify(data));
    } catch (e) {}
    this.addStars(starsEarned);
    return data;
  }
}



  /* ==========================================================================
     FILE: src/core/AudioManager.js
     ========================================================================== */

/**
 * AudioManager - Motor de audio interactivo offline
 * Utiliza Web Audio API para sintetizar sonidos mágicos y festivos en tiempo real
 * sin requerir conexión a internet ni archivos externos obligatorios,
 * además de la API de síntesis de voz (SpeechSynthesis) para fonética en español.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = StorageManager.isAudioMuted();
    this.initContext();
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
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
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  playClick() {
    this.playTone(580, 'sine', 0.08, 0.15);
  }

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
    // Acorde ascendente mágico de estrella
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.2);
      }, idx * 70);
    });
  }

  playSuccess() {
    // Sonido alegre de acierto
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.22, 0.22);
      }, idx * 90);
    });
  }

  playFanfare() {
    // Fanfarria festiva de felicitación al completar módulo o nombre
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
      setTimeout(() => {
        this.playTone(item.f, 'triangle', item.d, 0.25);
      }, item.delay);
    });
  }

  playBrush() {
    this.playTone(400, 'sine', 0.04, 0.05);
  }

  playError() {
    this.playTone(220, 'sawtooth', 0.2, 0.15);
  }

  /**
   * Pronuncia texto o letras en español usando la síntesis de voz del dispositivo
   */
  speak(text) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Detener locución previa
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = 0.95; // ritmo amable para niños
      utterance.pitch = 1.15; // tono alegre e infantil
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }
}
const audio = new AudioManager();



  /* ==========================================================================
     FILE: src/core/RewardManager.js
     ========================================================================== */

/**
 * RewardManager - Gestor del inventario y recompensas del mundo abierto
 * Conecta los logros de las lecciones con los objetos utilizables en la sala libre tipo Toca Boca.
 */
class RewardManager {
  constructor() {
    this.STORAGE_KEY = StorageManager.KEYS.UNLOCKED_REWARDS;
    this.catalog = [
      {
        id: 'cap_01',
        name: 'Gorra de Astronauta',
        category: 'clothing',
        iconPath: 'public/assets/images/items/cap.svg',
        description: '¡Lista para misiones espaciales!',
        isUnlocked: true // Desbloqueada de inicio para jugar
      },
      {
        id: 'pet_dino',
        name: 'Mascota Dinosaurio',
        category: 'pets',
        iconPath: 'public/assets/images/items/dino.svg',
        description: 'Un tierno amiguito prehistórico que te acompaña.',
        isUnlocked: true
      },
      {
        id: 'toy_car',
        name: 'Carrito de Carreras',
        category: 'toys',
        iconPath: 'public/assets/images/items/car.svg',
        description: '¡Rápido y veloz como un campeón!',
        isUnlocked: false
      },
      {
        id: 'star_badge',
        name: 'Insignia de Oro',
        category: 'medals',
        iconPath: 'public/assets/images/items/star.svg',
        description: 'Premio por completar el Trazado de Nombre.',
        isUnlocked: false
      },
      {
        id: 'crown_royal',
        name: 'Corona Real',
        category: 'clothing',
        iconPath: 'public/assets/images/items/crown.svg',
        description: '¡Para el rey o reina de las letras!',
        isUnlocked: false
      },
      {
        id: 'rocket_ship',
        name: 'Cohete Espacial',
        category: 'toys',
        iconPath: 'public/assets/images/items/rocket.svg',
        description: '¡Viaja hasta la luna y más allá!',
        isUnlocked: false
      },
      {
        id: 'honor_medal',
        name: 'Medalla al Esfuerzo',
        category: 'medals',
        iconPath: 'public/assets/images/items/medal.svg',
        description: 'Reconocimiento por dominar los números.',
        isUnlocked: false
      },
      {
        id: 'art_palette',
        name: 'Paleta de Pintor',
        category: 'toys',
        iconPath: 'public/assets/images/items/palette.svg',
        description: 'Desbloqueada en el módulo de figuras y colores.',
        isUnlocked: false
      }
    ];

    this.syncWithLocalStorage();
  }

  syncWithLocalStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const unlockedIds = JSON.parse(saved);
        this.catalog.forEach(item => {
          if (unlockedIds.includes(item.id)) {
            item.isUnlocked = true;
          }
        });
      } else {
        // Guardar estado inicial (los que están desbloqueados por defecto)
        this.persistUnlocked();
      }
    } catch (e) {
      console.warn('Error sincronizando recompensas:', e);
    }
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

  getUnlockedItems() {
    return this.catalog.filter(item => item.isUnlocked);
  }

  getAllItems() {
    return this.catalog;
  }
}
const rewards = new RewardManager();



  /* ==========================================================================
     FILE: src/components/Confetti.js
     ========================================================================== */

/**
 * Confetti - Explosión de confeti y estrellas en Canvas
 * Efecto festivo de felicitación para kínder.
 */
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
    const count = 120;

    for (let i = 0; i < count; i++) {
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

      if (elapsed < duration) {
        requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(render);
  }
}



  /* ==========================================================================
     FILE: src/components/Modal.js
     ========================================================================== */

/**
 * Modal - Sistema de ventanas emergentes infantiles
 * Para recompensas, ajustes de alumno y celebraciones didácticas.
 */
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
     FILE: src/components/LevelSelector.js
     ========================================================================== */

/**
 * LevelSelector.js - Selector universal de niveles en formato de círculos ("circulitos")
 * Muestra 50 juegos/niveles circulares con progreso guardado, estrellas y animaciones infantiles.
 */
class LevelSelector {
  /**
   * Renderiza la pantalla de selección de niveles con 50 circulitos.
   * @param {Object} config
   *   - container: Elemento HTML donde se renderiza
   *   - moduleKey: Identificador del módulo ('letter-tracing', 'syllables', etc.)
   *   - moduleTitle: Nombre en español ('Trazando Letras', 'Sílabas', etc.)
   *   - moduleIcon: Emoji o ícono del módulo ('✏️', '📚', etc.)
   *   - bgClass: Clase de fondo ('syllables-bg', 'numbers-bg', etc.)
   *   - totalLevels: Total de niveles (default 50)
   *   - onSelectLevel: Función callback al elegir un nivel: (levelNum) => {}
   *   - onBackHome: Función callback para volver al menú principal
   */
  static render(config) {
    const {
      container,
      moduleKey,
      moduleTitle,
      moduleIcon = '⭐',
      bgClass = '',
      totalLevels = 50,
      onSelectLevel,
      onBackHome
    } = config;

    const student = StorageManager.getActiveStudent();
    const progress = StorageManager.getModuleLevels(moduleKey);
    const maxUnlocked = Math.max(1, progress.maxUnlocked || 1);
    const completedCount = Object.keys(progress.completed || {}).length;

    container.innerHTML = `
      <div class="level-selector-module ${bgClass} fade-in">
        
        <!-- Encabezado del Selector -->
        <header class="level-selector-header">
          <button class="back-btn" id="btnBackHomeFromLevels">⬅️ Menú</button>
          
          <div class="selector-title-group">
            <h2 class="selector-module-title">${moduleIcon} ${moduleTitle.toUpperCase()}</h2>
            <div class="levels-subtitle-pill">
              50 Juegos Didácticos • Completados: <strong>${completedCount}/50</strong>
            </div>
          </div>

          <div class="student-stars-pill" title="Estrellas de Juan Carlos">
            ⭐ <strong>${student.stars || 0}</strong>
          </div>
        </header>

        <!-- Cuadrícula / Mapa de 50 Circulitos -->
        <main class="levels-scroll-container">
          <div class="levels-grid" id="levelsGridContainer">
            ${this.buildCirclesHTML(totalLevels, maxUnlocked, progress.completed)}
          </div>
        </main>

        <!-- Barra Inferior Informativa -->
        <footer class="level-selector-footer">
          <span class="tip-text">💡 Toca el <strong>Círculo 1</strong> para jugar el juego principal, ¡o avanza y supera los 50 retos!</span>
        </footer>

      </div>
    `;

    // Vincular Eventos
    container.querySelector('#btnBackHomeFromLevels')?.addEventListener('click', () => {
      audio.playClick();
      if (onBackHome) onBackHome();
    });

    container.querySelectorAll('.level-circle-node').forEach(node => {
      node.addEventListener('click', (e) => {
        const levelNum = parseInt(e.currentTarget.dataset.level, 10);
        const isUnlocked = e.currentTarget.dataset.unlocked === 'true';

        if (isUnlocked) {
          audio.playClick();
          if (onSelectLevel) onSelectLevel(levelNum);
        } else {
          audio.playPop();
          node.classList.add('shake-anim');
          setTimeout(() => node.classList.remove('shake-anim'), 400);
          audio.speak(`¡Nivel ${levelNum} bloqueado! Completa los niveles anteriores para desbloquearlo.`);
        }
      });
    });
  }

  static buildCirclesHTML(totalLevels, maxUnlocked, completedMap = {}) {
    let html = '';
    for (let i = 1; i <= totalLevels; i++) {
      const isUnlocked = i <= maxUnlocked;
      const starsEarned = completedMap[i] || 0;
      const isFirst = (i === 1);

      let starsHtml = '';
      if (isUnlocked) {
        if (starsEarned > 0) {
          starsHtml = `<div class="node-stars">${'★'.repeat(starsEarned)}${'☆'.repeat(3 - starsEarned)}</div>`;
        } else {
          starsHtml = `<div class="node-stars empty">☆☆☆</div>`;
        }
      } else {
        starsHtml = `<div class="node-lock">🔒</div>`;
      }

      html += `
        <button class="level-circle-node ${isUnlocked ? 'unlocked' : 'locked'} ${isFirst ? 'is-first-default pulse-glow' : ''}" 
                data-level="${i}" 
                data-unlocked="${isUnlocked}">
          ${isFirst ? '<span class="badge-default-tag">¡INICIO!</span>' : ''}
          <span class="level-number">${i}</span>
          ${starsHtml}
        </button>
      `;
    }
    return html;
  }
}



  /* ==========================================================================
     FILE: src/core/LetterWaypoints.js
     ========================================================================== */

/**
 * LetterWaypoints.js - Guías y secuencias pedagógicas de trazo para Kínder y Preescolar
 * Define puntos clave (checkpoints) en coordenadas normalizadas (0.0 a 1.0)
 * para validar que el niño realice el recorrido completo y en el orden correcto
 * según los métodos pedagógicos SEP y Gonvill.
 */
const LETTER_WAYPOINTS = {
  // A (Sube diagonal izquierda, baja diagonal derecha y barra horizontal)
  'A': [
    { x: 0.28, y: 0.82, label: '1' },
    { x: 0.38, y: 0.50, label: '2' },
    { x: 0.50, y: 0.20, label: '3' },
    { x: 0.62, y: 0.50, label: '4' },
    { x: 0.72, y: 0.82, label: '5' },
    { x: 0.36, y: 0.58, label: '6' },
    { x: 0.64, y: 0.58, label: '7' }
  ],

  // B (Línea vertical hacia abajo, primera panza y segunda panza)
  'B': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.50, label: '2' },
    { x: 0.28, y: 0.82, label: '3' },
    { x: 0.55, y: 0.20, label: '4' },
    { x: 0.68, y: 0.34, label: '5' },
    { x: 0.40, y: 0.50, label: '6' },
    { x: 0.72, y: 0.66, label: '7' },
    { x: 0.38, y: 0.82, label: '8' }
  ],

  // C (Curva de arriba a la derecha, pasa por la izquierda y termina abajo a la derecha)
  'C': [
    { x: 0.72, y: 0.26, label: '1' },
    { x: 0.50, y: 0.18, label: '2' },
    { x: 0.30, y: 0.35, label: '3' },
    { x: 0.26, y: 0.52, label: '4' },
    { x: 0.30, y: 0.70, label: '5' },
    { x: 0.50, y: 0.82, label: '6' },
    { x: 0.72, y: 0.74, label: '7' }
  ],

  // D (Vertical abajo y gran curva derecha)
  'D': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.52, label: '2' },
    { x: 0.28, y: 0.82, label: '3' },
    { x: 0.52, y: 0.20, label: '4' },
    { x: 0.72, y: 0.52, label: '5' },
    { x: 0.52, y: 0.82, label: '6' },
    { x: 0.32, y: 0.82, label: '7' }
  ],

  // E (Vertical abajo y tres barras horizontales)
  'E': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.30, y: 0.82, label: '3' },
    { x: 0.70, y: 0.20, label: '4' },
    { x: 0.60, y: 0.52, label: '5' },
    { x: 0.70, y: 0.82, label: '6' }
  ],

  // F (Vertical abajo y dos barras horizontales)
  'F': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.30, y: 0.82, label: '3' },
    { x: 0.70, y: 0.20, label: '4' },
    { x: 0.60, y: 0.52, label: '5' }
  ],

  // G (Curva redonda de C y gancho hacia adentro)
  'G': [
    { x: 0.72, y: 0.26, label: '1' },
    { x: 0.50, y: 0.18, label: '2' },
    { x: 0.28, y: 0.45, label: '3' },
    { x: 0.32, y: 0.72, label: '4' },
    { x: 0.52, y: 0.82, label: '5' },
    { x: 0.72, y: 0.70, label: '6' },
    { x: 0.72, y: 0.52, label: '7' },
    { x: 0.54, y: 0.52, label: '8' }
  ],

  // H (Línea izquierda abajo, línea derecha abajo y puente central)
  'H': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.82, label: '2' },
    { x: 0.72, y: 0.20, label: '3' },
    { x: 0.72, y: 0.82, label: '4' },
    { x: 0.30, y: 0.51, label: '5' },
    { x: 0.70, y: 0.51, label: '6' }
  ],

  // I (Trazo vertical recto de arriba a abajo)
  'I': [
    { x: 0.50, y: 0.20, label: '1' },
    { x: 0.50, y: 0.50, label: '2' },
    { x: 0.50, y: 0.82, label: '3' }
  ],

  // J (Inicio arriba centro, baja recto y gancho curvo a la izquierda)
  'J': [
    { x: 0.62, y: 0.20, label: '1' },
    { x: 0.62, y: 0.45, label: '2' },
    { x: 0.62, y: 0.68, label: '3' },
    { x: 0.52, y: 0.82, label: '4' },
    { x: 0.35, y: 0.78, label: '5' },
    { x: 0.28, y: 0.64, label: '6' }
  ],

  // K (Vertical abajo, diagonal hacia centro, diagonal hacia abajo-derecha)
  'K': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.82, label: '2' },
    { x: 0.70, y: 0.22, label: '3' },
    { x: 0.35, y: 0.52, label: '4' },
    { x: 0.72, y: 0.82, label: '5' }
  ],

  // L (Baja verticalmente y gira a la derecha horizontalmente)
  'L': [
    { x: 0.30, y: 0.20, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.30, y: 0.82, label: '3' },
    { x: 0.52, y: 0.82, label: '4' },
    { x: 0.72, y: 0.82, label: '5' }
  ],

  // M (Sube vertical izquierda, baja centro, sube derecha, baja vertical derecha)
  'M': [
    { x: 0.24, y: 0.82, label: '1' },
    { x: 0.24, y: 0.20, label: '2' },
    { x: 0.50, y: 0.55, label: '3' },
    { x: 0.76, y: 0.20, label: '4' },
    { x: 0.76, y: 0.82, label: '5' }
  ],

  // N (Sube izquierda, baja diagonal a la derecha y sube a la derecha)
  'N': [
    { x: 0.28, y: 0.82, label: '1' },
    { x: 0.28, y: 0.20, label: '2' },
    { x: 0.50, y: 0.52, label: '3' },
    { x: 0.72, y: 0.82, label: '4' },
    { x: 0.72, y: 0.20, label: '5' }
  ],

  // Ñ (N + tilde superior)
  'Ñ': [
    { x: 0.28, y: 0.82, label: '1' },
    { x: 0.28, y: 0.24, label: '2' },
    { x: 0.50, y: 0.54, label: '3' },
    { x: 0.72, y: 0.82, label: '4' },
    { x: 0.72, y: 0.24, label: '5' },
    { x: 0.35, y: 0.12, label: '6' },
    { x: 0.50, y: 0.16, label: '7' },
    { x: 0.65, y: 0.12, label: '8' }
  ],

  // O (Círculo cerrado empezando arriba, gira antihorario y cierra)
  'O': [
    { x: 0.50, y: 0.18, label: '1' },
    { x: 0.30, y: 0.35, label: '2' },
    { x: 0.26, y: 0.52, label: '3' },
    { x: 0.30, y: 0.70, label: '4' },
    { x: 0.50, y: 0.84, label: '5' },
    { x: 0.70, y: 0.70, label: '6' },
    { x: 0.74, y: 0.52, label: '7' },
    { x: 0.70, y: 0.35, label: '8' },
    { x: 0.50, y: 0.20, label: '9' }
  ],

  // P (Vertical abajo y panza superior)
  'P': [
    { x: 0.30, y: 0.82, label: '1' },
    { x: 0.30, y: 0.20, label: '2' },
    { x: 0.56, y: 0.20, label: '3' },
    { x: 0.70, y: 0.36, label: '4' },
    { x: 0.45, y: 0.52, label: '5' },
    { x: 0.30, y: 0.52, label: '6' }
  ],

  // Q (Círculo de O + colita diagonal)
  'Q': [
    { x: 0.50, y: 0.18, label: '1' },
    { x: 0.28, y: 0.50, label: '2' },
    { x: 0.50, y: 0.82, label: '3' },
    { x: 0.72, y: 0.50, label: '4' },
    { x: 0.50, y: 0.20, label: '5' },
    { x: 0.56, y: 0.68, label: '6' },
    { x: 0.76, y: 0.86, label: '7' }
  ],

  // R (Vertical abajo, panza superior y patita diagonal)
  'R': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.52, label: '2' },
    { x: 0.28, y: 0.82, label: '3' },
    { x: 0.54, y: 0.20, label: '4' },
    { x: 0.70, y: 0.35, label: '5' },
    { x: 0.46, y: 0.52, label: '6' },
    { x: 0.72, y: 0.82, label: '7' }
  ],

  // S (Trazo serpenteante continuo)
  'S': [
    { x: 0.70, y: 0.26, label: '1' },
    { x: 0.50, y: 0.18, label: '2' },
    { x: 0.32, y: 0.32, label: '3' },
    { x: 0.50, y: 0.50, label: '4' },
    { x: 0.68, y: 0.65, label: '5' },
    { x: 0.50, y: 0.82, label: '6' },
    { x: 0.32, y: 0.74, label: '7' }
  ],

  // T (Barra superior horizontal y poste vertical central)
  'T': [
    { x: 0.26, y: 0.20, label: '1' },
    { x: 0.50, y: 0.20, label: '2' },
    { x: 0.74, y: 0.20, label: '3' },
    { x: 0.50, y: 0.52, label: '4' },
    { x: 0.50, y: 0.82, label: '5' }
  ],

  // U (Baja por la izquierda, curva abajo y sube por la derecha)
  // ¡Valida la U completa hasta llegar arriba a la derecha!
  'U': [
    { x: 0.28, y: 0.20, label: '1' },
    { x: 0.28, y: 0.45, label: '2' },
    { x: 0.32, y: 0.68, label: '3' },
    { x: 0.50, y: 0.82, label: '4' },
    { x: 0.68, y: 0.68, label: '5' },
    { x: 0.72, y: 0.45, label: '6' },
    { x: 0.72, y: 0.20, label: '7' }
  ],

  // V (Baja diagonal hacia el vértice y sube diagonal)
  'V': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.39, y: 0.52, label: '2' },
    { x: 0.50, y: 0.82, label: '3' },
    { x: 0.61, y: 0.52, label: '4' },
    { x: 0.72, y: 0.22, label: '5' }
  ],

  // W (Doble V)
  'W': [
    { x: 0.22, y: 0.22, label: '1' },
    { x: 0.36, y: 0.82, label: '2' },
    { x: 0.50, y: 0.38, label: '3' },
    { x: 0.64, y: 0.82, label: '4' },
    { x: 0.78, y: 0.22, label: '5' }
  ],

  // X (Cruce de dos diagonales)
  'X': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.50, y: 0.52, label: '2' },
    { x: 0.72, y: 0.82, label: '3' },
    { x: 0.72, y: 0.22, label: '4' },
    { x: 0.28, y: 0.82, label: '5' }
  ],

  // Y (Cáliz superior y pie vertical)
  'Y': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.50, y: 0.52, label: '2' },
    { x: 0.72, y: 0.22, label: '3' },
    { x: 0.50, y: 0.52, label: '4' },
    { x: 0.50, y: 0.82, label: '5' }
  ],

  // Z (Barra horizontal superior, diagonal abajo a la izquierda, barra horizontal inferior)
  'Z': [
    { x: 0.28, y: 0.22, label: '1' },
    { x: 0.72, y: 0.22, label: '2' },
    { x: 0.50, y: 0.52, label: '3' },
    { x: 0.28, y: 0.82, label: '4' },
    { x: 0.72, y: 0.82, label: '5' }
  ]
};

/**
 * Obtiene los waypoints para cualquier letra (con fallback inteligente y seguro)
 */
function getWaypointsForLetter(letter) {
  const char = (letter || 'A').toUpperCase();
  if (LETTER_WAYPOINTS[char]) {
    return LETTER_WAYPOINTS[char].map(p => ({ ...p }));
  }

  // Fallback para símbolos o caracteres adicionales:
  // 5 puntos guía distribuidos de inicio a fin
  return [
    { x: 0.30, y: 0.22, label: '1' },
    { x: 0.30, y: 0.52, label: '2' },
    { x: 0.50, y: 0.82, label: '3' },
    { x: 0.70, y: 0.52, label: '4' },
    { x: 0.70, y: 0.22, label: '5' }
  ];
}


  /* ==========================================================================
     FILE: src/modules/HomeScreen.js
     ========================================================================== */

/**
 * HomeScreen.js - Pantalla Principal Fullscreen
 * Réplica de la UX/UI con paisaje y galaxia de 6 módulos circulares.
 */
class HomeScreen {
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


  /* ==========================================================================
     FILE: src/modules/NameTracingScreen.js
     ========================================================================== */

/**
 * NameTracingScreen - Módulo de Trazado de Nombre con 50 Juegos en Círculos ("Circulitos")
 * Validación pedagógica por waypoints secuenciales para asegurar trazos completos.
 */
const NAME_TRACING_LEVELS = [
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
class NameTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();
    this.currentLevel = null; // null = mapa de 50 circulitos, número = nivel activo
    this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    this.currentLetterIndex = 0;
    this.canvas = null;
    this.ctx = null;
    this.wpCanvas = null;
    this.wpCtx = null;
    this.isDrawing = false;
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;
  }

  render(container) {
    this.student = StorageManager.getActiveStudent();

    // Si no hay nivel seleccionado, mostrar el selector de 50 circulitos
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'name-tracing',
        moduleTitle: 'Traza tu Nombre',
        moduleIcon: '⭐',
        bgClass: 'syllables-bg',
        totalLevels: 50,
        onSelectLevel: (lvl) => {
          this.currentLevel = lvl;
          this.renderGame(container);
        },
        onBackHome: () => {
          this.navigator.navigate('home');
        }
      });
      return;
    }

    this.renderGame(container);
  }

  renderGame(container) {
    // Nivel 1 es siempre el nombre del alumno ('JUAN CARLOS')
    if (this.currentLevel === 1) {
      this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    } else {
      const idx = (this.currentLevel - 1) % NAME_TRACING_LEVELS.length;
      this.targetName = NAME_TRACING_LEVELS[idx];
    }

    this.currentLetterIndex = 0;

    container.innerHTML = `
      <div class="tracing-module fade-in">
        <!-- Encabezado del Módulo -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2 class="module-title">TRAZA: <span id="currentLetterDisplay" class="letter-highlight">J</span></h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#00796b;">
              Nivel ${this.currentLevel}: <strong>${this.targetName}</strong>
            </div>
          </div>
          <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
        </header>

        <!-- Contenedor Principal del Lienzo con Doble Capa -->
        <main class="canvas-container">
          <div class="canvas-wrapper">
            <!-- Guía de Fondo (Letra punteada grande) -->
            <div class="letter-guide-bg" id="letterGuideText">J</div>

            <!-- Capa de Waypoints (guías y checkpoints) -->
            <canvas id="waypointsCanvas" width="600" height="380"></canvas>

            <!-- Capa interactiva de trazo del niño -->
            <canvas id="tracingCanvas" width="600" height="380"></canvas>
          </div>

          <!-- Indicador del Nombre Completo y Progreso -->
          <div class="name-progress-bar" id="nameProgressContainer"></div>
        </main>

        <!-- Barra Inferior de Audio y Validar -->
        <footer class="tracing-footer">
          <button class="sound-btn" id="btnPlayPhonics">🔊 Escuchar</button>
          <div class="waypoint-status-pill" id="waypointStatus">
            Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">5</span>
          </div>
          <button class="check-btn" id="btnCheckLetter">⭐ ¡Siguiente!</button>
        </footer>
      </div>
    `;

    this.initUI(container);
    this.setupCanvases(container);
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

      if (char === ' ') {
        slot.className = 'letter-slot-space';
      } else {
        slot.className = `letter-slot slot-${i}`;
        slot.innerText = char;
      }
      progressContainer.appendChild(slot);
    }
  }

  setupCanvases(container) {
    this.canvas = container.querySelector('#tracingCanvas');
    this.wpCanvas = container.querySelector('#waypointsCanvas');
    if (!this.canvas || !this.wpCanvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.wpCtx = this.wpCanvas.getContext('2d');

    // Configuración del pincel mágico
    this.ctx.lineWidth = 26;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ff4081'; // Neón rosa brillante
  }

  loadCurrentLetter(container) {
    // Si es un espacio, saltarlo
    if (this.targetName[this.currentLetterIndex] === ' ') {
      this.currentLetterIndex++;
    }

    if (this.currentLetterIndex >= this.targetName.length) {
      this.onWordCompleted(container);
      return;
    }

    const currentChar = this.targetName[this.currentLetterIndex];
    this.waypoints = getWaypointsForLetter(currentChar);
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;

    const guideElem = container.querySelector('#letterGuideText');
    const displayElem = container.querySelector('#currentLetterDisplay');
    if (guideElem) guideElem.innerText = currentChar;
    if (displayElem) displayElem.innerText = currentChar;

    container.querySelectorAll('.letter-slot').forEach(slot => slot.classList.remove('active'));
    const activeSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (activeSlot) activeSlot.classList.add('active');

    this.updateStatusPill(container);
    this.clearForeground();
    this.drawWaypointsOverlay();

    audio.speak(`Traza la letra ${currentChar}`);
  }

  updateStatusPill(container) {
    const curElem = container.querySelector('#currentStepNum');
    const totalElem = container.querySelector('#totalStepsNum');
    if (curElem) curElem.innerText = Math.min(this.currentWaypointIndex + 1, this.waypoints.length);
    if (totalElem) totalElem.innerText = this.waypoints.length;
  }

  clearForeground() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawWaypointsOverlay() {
    if (!this.wpCtx || !this.wpCanvas) return;
    const W = this.wpCanvas.width;
    const H = this.wpCanvas.height;

    this.wpCtx.clearRect(0, 0, W, H);

    // 1. Dibujar línea guía punteada entre los waypoints
    if (this.waypoints.length > 1) {
      this.wpCtx.save();
      this.wpCtx.beginPath();
      this.wpCtx.strokeStyle = 'rgba(0, 188, 212, 0.35)';
      this.wpCtx.lineWidth = 4;
      this.wpCtx.setLineDash([8, 8]);
      this.waypoints.forEach((wp, i) => {
        const x = wp.x * W;
        const y = wp.y * H;
        if (i === 0) this.wpCtx.moveTo(x, y);
        else this.wpCtx.lineTo(x, y);
      });
      this.wpCtx.stroke();
      this.wpCtx.restore();
    }

    // 2. Dibujar cada waypoint circular con estados pedagógicos
    this.waypoints.forEach((wp, idx) => {
      const cx = wp.x * W;
      const cy = wp.y * H;

      this.wpCtx.save();
      if (idx < this.currentWaypointIndex) {
        // Waypoint superado: estrella verde con palomita
        this.wpCtx.fillStyle = '#4caf50';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 15, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 2.5;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 15px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText('✓', cx, cy);
      } else if (idx === this.currentWaypointIndex) {
        // Waypoint activo: círculo brillante pulsante
        this.wpCtx.fillStyle = 'rgba(255, 152, 0, 0.35)';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 26, 0, Math.PI * 2);
        this.wpCtx.fill();

        this.wpCtx.fillStyle = '#ff9800';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 17, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 3;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 15px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText(wp.label || (idx + 1).toString(), cx, cy);
      } else {
        // Waypoint futuro: guía translúcida suave
        this.wpCtx.fillStyle = 'rgba(0, 188, 212, 0.4)';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 12, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 2;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 11px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText((idx + 1).toString(), cx, cy);
      }
      this.wpCtx.restore();
    });
  }

  checkWaypointHit(x, y, container) {
    if (this.isLetterCompleted) return;
    if (this.currentWaypointIndex >= this.waypoints.length) return;

    const targetWp = this.waypoints[this.currentWaypointIndex];
    const targetX = targetWp.x * this.canvas.width;
    const targetY = targetWp.y * this.canvas.height;

    // Radio de captura generoso para niños de preescolar (46 píxeles)
    const distance = Math.hypot(x - targetX, y - targetY);

    if (distance <= 46) {
      // Punto superado
      this.currentWaypointIndex++;
      audio.playPop();
      this.updateStatusPill(container);
      this.drawWaypointsOverlay();

      // REGLA FUNDAMENTAL: Solo avanza cuando TODOS los waypoints se han tocado en orden
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.isLetterCompleted = true;
        this.stopDrawing();
        audio.playSuccess();
        Confetti.shoot(1800);
        setTimeout(() => {
          this.advanceLetter(container);
        }, 550);
      }
    }
  }

  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearForeground();
      this.currentWaypointIndex = 0;
      this.isLetterCompleted = false;
      this.updateStatusPill(container);
      this.drawWaypointsOverlay();
    });

    container.querySelector('#btnPlayPhonics')?.addEventListener('click', () => {
      const char = this.targetName[this.currentLetterIndex];
      audio.speak(`Letra ${char}`);
    });

    container.querySelector('#btnCheckLetter')?.addEventListener('click', () => {
      this.advanceLetter(container);
    });

    // Ratón
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Eventos táctiles para Android / Tablet
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.startDrawing((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY, container);
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

  startDrawing(x, y, container) {
    if (this.isLetterCompleted) return;
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    audio.playBrush();
    this.checkWaypointHit(x, y, container);
  }

  draw(x, y, container) {
    if (!this.isDrawing || this.isLetterCompleted) return;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.checkWaypointHit(x, y, container);
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
    setTimeout(() => {
      this.loadCurrentLetter(container);
    }, 550);
  }

  onWordCompleted(container) {
    audio.playFanfare();
    Confetti.shoot(3500);

    // Guardar progreso del nivel de 50 circulitos
    StorageManager.completeModuleLevel('name-tracing', this.currentLevel, 3);

    const unlocked = rewards.unlockReward('star_badge');
    setTimeout(() => {
      if (unlocked) {
        Modal.showReward(unlocked, () => {
          this.currentLevel = null;
          this.render(container);
        });
      } else {
        alert(`¡Felicidades ${this.student.name}! Has completado el nivel ${this.currentLevel}: ${this.targetName} 🎉`);
        this.currentLevel = null;
        this.render(container);
      }
    }, 700);

    audio.speak(`¡Excelente trabajo ${this.student.name}! ¡Nivel ${this.currentLevel} completado!`);
  }
}


  /* ==========================================================================
     FILE: src/modules/LetterTracingScreen.js
     ========================================================================== */

/**
 * LetterTracingScreen - Módulo "Trazando Letras" con 50 Juegos en Círculos ("Circulitos")
 * Validación pedagógica por waypoints secuenciales para asegurar trazos completos.
 */
const LETTER_LEVELS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S',
  'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // Retos 28 a 50 (Combinaciones y letras didácticas)
  'A', 'E', 'I', 'O', 'U', 'M', 'P', 'S', 'L', 'T',
  'D', 'N', 'C', 'R', 'B', 'V', 'G', 'F', 'J', 'Z',
  'CH', 'LL', 'RR'
];
class LetterTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();
    this.currentLevel = null; // null = mapa de 50 circulitos, número = nivel activo
    this.currentLetter = 'A';
    this.canvas = null;
    this.ctx = null;
    this.wpCanvas = null;
    this.wpCtx = null;
    this.isDrawing = false;
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;
  }

  render(container) {
    this.student = StorageManager.getActiveStudent();

    // Si no hay nivel seleccionado, mostrar el selector de 50 circulitos
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'letter-tracing',
        moduleTitle: 'Trazando Letras',
        moduleIcon: '✏️',
        bgClass: 'letter-bg',
        totalLevels: 50,
        onSelectLevel: (lvl) => {
          this.currentLevel = lvl;
          this.renderGame(container);
        },
        onBackHome: () => {
          this.navigator.navigate('home');
        }
      });
      return;
    }

    this.renderGame(container);
  }

  renderGame(container) {
    const idx = (this.currentLevel - 1) % LETTER_LEVELS.length;
    this.currentLetter = LETTER_LEVELS[idx];
    this.waypoints = getWaypointsForLetter(this.currentLetter);
    this.currentWaypointIndex = 0;
    this.isLetterCompleted = false;

    container.innerHTML = `
      <div class="tracing-module letter-bg fade-in">
        <!-- Encabezado del Módulo -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2 class="module-title">TRAZANDO: <span id="currentLetterDisplay" class="letter-highlight">${this.currentLetter}</span></h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#e65100;">
              Juego ${this.currentLevel} de 50
            </div>
          </div>
          <button class="clear-btn" id="btnClearCanvas">🧹 Limpiar</button>
        </header>

        <!-- Contenedor Principal del Lienzo con Doble Capa -->
        <main class="canvas-container">
          <div class="canvas-wrapper">
            <!-- Guía de Fondo (Letra punteada grande) -->
            <div class="letter-guide-bg" id="letterGuideText">${this.currentLetter}</div>

            <!-- Capa de Waypoints (checkpoints pedagógicos) -->
            <canvas id="waypointsCanvas" width="600" height="380"></canvas>

            <!-- Capa interactiva de trazo del niño -->
            <canvas id="letterCanvas" width="600" height="380"></canvas>
          </div>
        </main>

        <!-- Barra Inferior de Audio y Validar -->
        <footer class="tracing-footer">
          <button class="sound-btn" id="btnPlayLetterAudio">🔊 Sonido de la ${this.currentLetter}</button>
          <div class="waypoint-status-pill" id="waypointStatus">
            Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">${this.waypoints.length}</span>
          </div>
          <button class="check-btn" id="btnCheckLetter">⭐ ¡Siguiente!</button>
        </footer>
      </div>
    `;

    this.setupCanvases(container);
    this.bindEvents(container);
    this.clearForeground();
    this.drawWaypointsOverlay();
    audio.speak(`Traza la letra ${this.currentLetter}`);
  }

  setupCanvases(container) {
    this.canvas = container.querySelector('#letterCanvas');
    this.wpCanvas = container.querySelector('#waypointsCanvas');
    if (!this.canvas || !this.wpCanvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.wpCtx = this.wpCanvas.getContext('2d');

    // Configuración del pincel mágico
    this.ctx.lineWidth = 26;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ff9800'; // Naranja vibrante
  }

  clearForeground() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawWaypointsOverlay() {
    if (!this.wpCtx || !this.wpCanvas) return;
    const W = this.wpCanvas.width;
    const H = this.wpCanvas.height;

    this.wpCtx.clearRect(0, 0, W, H);

    // 1. Línea guía punteada
    if (this.waypoints.length > 1) {
      this.wpCtx.save();
      this.wpCtx.beginPath();
      this.wpCtx.strokeStyle = 'rgba(255, 152, 0, 0.35)';
      this.wpCtx.lineWidth = 4;
      this.wpCtx.setLineDash([8, 8]);
      this.waypoints.forEach((wp, i) => {
        const x = wp.x * W;
        const y = wp.y * H;
        if (i === 0) this.wpCtx.moveTo(x, y);
        else this.wpCtx.lineTo(x, y);
      });
      this.wpCtx.stroke();
      this.wpCtx.restore();
    }

    // 2. Waypoints circulares
    this.waypoints.forEach((wp, idx) => {
      const cx = wp.x * W;
      const cy = wp.y * H;

      this.wpCtx.save();
      if (idx < this.currentWaypointIndex) {
        // Superado: verde con palomita
        this.wpCtx.fillStyle = '#4caf50';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 15, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 2.5;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 15px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText('✓', cx, cy);
      } else if (idx === this.currentWaypointIndex) {
        // Activo: círculo brillante pulsante
        this.wpCtx.fillStyle = 'rgba(255, 152, 0, 0.35)';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 26, 0, Math.PI * 2);
        this.wpCtx.fill();

        this.wpCtx.fillStyle = '#ff9800';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 17, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 3;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 15px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText(wp.label || (idx + 1).toString(), cx, cy);
      } else {
        // Futuro: guía translúcida suave
        this.wpCtx.fillStyle = 'rgba(0, 188, 212, 0.4)';
        this.wpCtx.beginPath();
        this.wpCtx.arc(cx, cy, 12, 0, Math.PI * 2);
        this.wpCtx.fill();
        this.wpCtx.strokeStyle = '#ffffff';
        this.wpCtx.lineWidth = 2;
        this.wpCtx.stroke();

        this.wpCtx.fillStyle = '#ffffff';
        this.wpCtx.font = 'bold 11px sans-serif';
        this.wpCtx.textAlign = 'center';
        this.wpCtx.textBaseline = 'middle';
        this.wpCtx.fillText((idx + 1).toString(), cx, cy);
      }
      this.wpCtx.restore();
    });
  }

  checkWaypointHit(x, y, container) {
    if (this.isLetterCompleted) return;
    if (this.currentWaypointIndex >= this.waypoints.length) return;

    const targetWp = this.waypoints[this.currentWaypointIndex];
    const targetX = targetWp.x * this.canvas.width;
    const targetY = targetWp.y * this.canvas.height;

    const distance = Math.hypot(x - targetX, y - targetY);

    if (distance <= 46) {
      this.currentWaypointIndex++;
      audio.playPop();

      const curElem = container.querySelector('#currentStepNum');
      if (curElem) curElem.innerText = Math.min(this.currentWaypointIndex + 1, this.waypoints.length);

      this.drawWaypointsOverlay();

      // Validación completa del trazo
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.isLetterCompleted = true;
        this.stopDrawing();
        audio.playSuccess();
        Confetti.shoot(1800);
        setTimeout(() => {
          this.onLetterCompleted(container);
        }, 550);
      }
    }
  }

  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearForeground();
      this.currentWaypointIndex = 0;
      this.isLetterCompleted = false;
      const curElem = container.querySelector('#currentStepNum');
      if (curElem) curElem.innerText = '1';
      this.drawWaypointsOverlay();
    });

    container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
      audio.speak(`Esta es la letra ${this.currentLetter}`);
    });

    container.querySelector('#btnCheckLetter')?.addEventListener('click', () => {
      this.onLetterCompleted(container);
    });

    // Ratón
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY, container));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Táctil
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.startDrawing((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY, container);
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

  startDrawing(x, y, container) {
    if (this.isLetterCompleted) return;
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    audio.playBrush();
    this.checkWaypointHit(x, y, container);
  }

  draw(x, y, container) {
    if (!this.isDrawing || this.isLetterCompleted) return;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.checkWaypointHit(x, y, container);
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
  }

  onLetterCompleted(container) {
    audio.playFanfare();
    Confetti.shoot(2500);

    // Guardar progreso del nivel
    StorageManager.completeModuleLevel('letter-tracing', this.currentLevel, 3);

    setTimeout(() => {
      if (this.currentLevel < 50) {
        const next = this.currentLevel + 1;
        if (confirm(`¡Excelente! Has completado la letra ${this.currentLetter} ⭐\n\n¿Quieres pasar al Nivel ${next}?`)) {
          this.currentLevel = next;
          this.renderGame(container);
          return;
        }
      }
      this.currentLevel = null;
      this.render(container);
    }, 600);
  }
}


  /* ==========================================================================
     FILE: src/modules/SyllablesScreen.js
     ========================================================================== */

/**
 * SyllablesScreen - Módulo "Sílabas" con Arquitectura Pedagógica Progresiva
 * 
 * Juegos disponibles:
 * 1. "Completa la Palabra" (50 niveles con palabras y sílabas faltantes)
 * 2. "Arma la Sílaba" (50 niveles en la secuencia fonética pedagógica SEP/Minjares):
 *    M -> S -> T -> L -> P -> N -> R -> C -> D -> V
 *    con relacionamiento inmediato de palabras cortas formadas por sílabas ya conocidas.
 * 
 * Preparado para extenderse con las fases siguientes:
 * - Fase 2: F, B, J, Ñ, G, H, CH, LL, Q, Y, K, Z, X, W
 * - Fase 3 (Trabadas): BL, BR, CL, CR, FL, FR, GL, GR, PL, PR, TR, DR
 */
// ============================================================================
// 1. JUEGO 1: COMPLETA LA PALABRA (50 NIVELES)
// ============================================================================
const SYLLABLES_COMPLETA_50 = [
  { word: 'ELEFANTE', image: 'public/assets/images/educational/elephant.svg', syllables: ['E', 'LE', 'FAN', 'TE'], missingIndex: 1, options: ['LE', 'MA', 'TO'] },
  { word: 'PELOTA', image: 'public/assets/icons/shapes.svg', syllables: ['PE', 'LO', 'TA'], missingIndex: 1, options: ['SA', 'LO', 'RA'] },
  { word: 'MONITO', image: 'public/assets/images/educational/monkey.svg', syllables: ['MO', 'NI', 'TO'], missingIndex: 0, options: ['PA', 'SO', 'MO'] },
  { word: 'ESTRELLA', image: 'public/assets/images/items/star.svg', syllables: ['ES', 'TRE', 'LLA'], missingIndex: 1, options: ['TRE', 'PLO', 'BRI'] },
  { word: 'GATITO', image: 'public/assets/images/educational/cat.svg', syllables: ['GA', 'TI', 'TO'], missingIndex: 0, options: ['GA', 'ME', 'LU'] },
  { word: 'PERRITO', image: 'public/assets/images/educational/dog.svg', syllables: ['PE', 'RRI', 'TO'], missingIndex: 0, options: ['FA', 'PE', 'SO'] },
  { word: 'PATITO', image: 'public/assets/images/educational/duck.svg', syllables: ['PA', 'TI', 'TO'], missingIndex: 1, options: ['RO', 'TI', 'LU'] },
  { word: 'MARIPOSA', image: 'public/assets/images/educational/butterfly.svg', syllables: ['MA', 'RI', 'PO', 'SA'], missingIndex: 2, options: ['PO', 'TE', 'LA'] },
  { word: 'LEON', image: 'public/assets/images/educational/lion.svg', syllables: ['LE', 'ON'], missingIndex: 0, options: ['LE', 'PA', 'MI'] },
  { word: 'CONEJITO', image: 'public/assets/images/educational/rabbit.svg', syllables: ['CO', 'NE', 'JI', 'TO'], missingIndex: 1, options: ['RA', 'NE', 'MO'] },
  { word: 'MANZANA', image: 'public/assets/images/items/apple.svg', syllables: ['MAN', 'ZA', 'NA'], missingIndex: 1, options: ['ZA', 'TO', 'RE'] },
  { word: 'TORTUGA', image: 'public/assets/images/educational/turtle.svg', syllables: ['TOR', 'TU', 'GA'], missingIndex: 2, options: ['GA', 'BO', 'SA'] },
  { word: 'PLATANO', image: 'public/assets/images/items/banana.svg', syllables: ['PLA', 'TA', 'NO'], missingIndex: 0, options: ['PLA', 'TRE', 'CLO'] },
  { word: 'JIRAFA', image: 'public/assets/images/educational/giraffe.svg', syllables: ['JI', 'RA', 'FA'], missingIndex: 1, options: ['LO', 'RA', 'SE'] },
  { word: 'COCODRILO', image: 'public/assets/images/educational/crocodile.svg', syllables: ['CO', 'CO', 'DRI', 'LO'], missingIndex: 2, options: ['DRI', 'PRA', 'BLI'] },
  { word: 'BALLENA', image: 'public/assets/images/educational/whale.svg', syllables: ['BA', 'LLE', 'NA'], missingIndex: 0, options: ['BA', 'PE', 'LU'] },
  { word: 'DELFIN', image: 'public/assets/images/educational/dolphin.svg', syllables: ['DEL', 'FIN'], missingIndex: 1, options: ['FIN', 'PAN', 'SOL'] },
  { word: 'CANGURO', image: 'public/assets/images/educational/kangaroo.svg', syllables: ['CAN', 'GU', 'RO'], missingIndex: 1, options: ['GU', 'MI', 'TO'] },
  { word: 'ZORRITO', image: 'public/assets/images/educational/fox.svg', syllables: ['ZO', 'RRI', 'TO'], missingIndex: 0, options: ['ZO', 'BA', 'CA'] },
  { word: 'OSITO', image: 'public/assets/images/educational/bear.svg', syllables: ['O', 'SI', 'TO'], missingIndex: 1, options: ['SI', 'PA', 'LE'] },
  { word: 'CEBRITA', image: 'public/assets/images/educational/zebra.svg', syllables: ['CE', 'BRI', 'TA'], missingIndex: 1, options: ['BRI', 'PLO', 'TRA'] },
  { word: 'TIGRITO', image: 'public/assets/images/educational/tiger.svg', syllables: ['TI', 'GRI', 'TO'], missingIndex: 0, options: ['TI', 'RO', 'MA'] },
  { word: 'RANITA', image: 'public/assets/images/educational/frog.svg', syllables: ['RA', 'NI', 'TA'], missingIndex: 0, options: ['RA', 'PE', 'SO'] },
  { word: 'ABEJITA', image: 'public/assets/images/educational/bee.svg', syllables: ['A', 'BE', 'JI', 'TA'], missingIndex: 1, options: ['BE', 'LU', 'RA'] },
  { word: 'CARACOL', image: 'public/assets/images/educational/snail.svg', syllables: ['CA', 'RA', 'COL'], missingIndex: 2, options: ['COL', 'PAN', 'MAR'] },
  { word: 'RATON', image: 'public/assets/images/educational/mouse.svg', syllables: ['RA', 'TON'], missingIndex: 1, options: ['TON', 'SOL', 'PAN'] },
  { word: 'VAQUITA', image: 'public/assets/images/educational/cow.svg', syllables: ['VA', 'QUI', 'TA'], missingIndex: 0, options: ['VA', 'LO', 'ME'] },
  { word: 'CABALLO', image: 'public/assets/images/educational/horse.svg', syllables: ['CA', 'BA', 'LLO'], missingIndex: 1, options: ['BA', 'SO', 'TI'] },
  { word: 'CERDITO', image: 'public/assets/images/educational/pig.svg', syllables: ['CER', 'DI', 'TO'], missingIndex: 1, options: ['DI', 'RA', 'LE'] },
  { word: 'GALLINA', image: 'public/assets/images/educational/chicken.svg', syllables: ['GA', 'LLI', 'NA'], missingIndex: 2, options: ['NA', 'TO', 'RE'] },
  { word: 'OVEJITA', image: 'public/assets/images/educational/sheep.svg', syllables: ['O', 'VE', 'JI', 'TA'], missingIndex: 2, options: ['JI', 'LO', 'PA'] },
  { word: 'CABRITA', image: 'public/assets/images/educational/goat.svg', syllables: ['CA', 'BRI', 'TA'], missingIndex: 1, options: ['BRI', 'FLO', 'GLO'] },
  { word: 'POLLITO', image: 'public/assets/images/educational/chick.svg', syllables: ['PO', 'LLI', 'TO'], missingIndex: 0, options: ['PO', 'LU', 'RE'] },
  { word: 'LOBITO', image: 'public/assets/images/educational/wolf.svg', syllables: ['LO', 'BI', 'TO'], missingIndex: 0, options: ['LO', 'MA', 'SO'] },
  { word: 'CAMARON', image: 'public/assets/images/educational/shrimp.svg', syllables: ['CA', 'MA', 'RON'], missingIndex: 1, options: ['MA', 'PI', 'LE'] },
  { word: 'PAPAGAYO', image: 'public/assets/images/educational/parrot.svg', syllables: ['PA', 'PA', 'GA', 'YO'], missingIndex: 2, options: ['GA', 'TO', 'ME'] },
  { word: 'PINGÜINO', image: 'public/assets/images/educational/penguin.svg', syllables: ['PIN', 'GÜI', 'NO'], missingIndex: 1, options: ['GÜI', 'RA', 'SO'] },
  { word: 'BARQUITO', image: 'public/assets/images/educational/boat.svg', syllables: ['BAR', 'QUI', 'TO'], missingIndex: 1, options: ['QUI', 'ME', 'LO'] },
  { word: 'AVIONCITO', image: 'public/assets/images/educational/airplane.svg', syllables: ['A', 'VION', 'CI', 'TO'], missingIndex: 0, options: ['A', 'E', 'O'] },
  { word: 'COCHECITO', image: 'public/assets/images/educational/car.svg', syllables: ['CO', 'CHE', 'CI', 'TO'], missingIndex: 1, options: ['CHE', 'BLO', 'PRI'] },
  { word: 'TRENESITO', image: 'public/assets/images/educational/train.svg', syllables: ['TRE', 'NE', 'SI', 'TO'], missingIndex: 0, options: ['TRE', 'PLA', 'CRO'] },
  { word: 'BICICLETA', image: 'public/assets/images/educational/bike.svg', syllables: ['BI', 'CI', 'CLE', 'TA'], missingIndex: 2, options: ['CLE', 'TRO', 'BRI'] },
  { word: 'SOLECITO', image: 'public/assets/images/items/sun.svg', syllables: ['SO', 'LE', 'CI', 'TO'], missingIndex: 0, options: ['SO', 'PA', 'LU'] },
  { word: 'LUNITA', image: 'public/assets/images/items/moon.svg', syllables: ['LU', 'NI', 'TA'], missingIndex: 0, options: ['LU', 'SO', 'ME'] },
  { word: 'NUBESITA', image: 'public/assets/images/items/cloud.svg', syllables: ['NU', 'BE', 'SI', 'TA'], missingIndex: 1, options: ['BE', 'RA', 'TO'] },
  { word: 'ARBOLITO', image: 'public/assets/images/items/tree.svg', syllables: ['AR', 'BO', 'LI', 'TO'], missingIndex: 2, options: ['LI', 'MA', 'SO'] },
  { word: 'FLORECITA', image: 'public/assets/images/items/flower.svg', syllables: ['FLO', 'RE', 'CI', 'TA'], missingIndex: 0, options: ['FLO', 'BLI', 'CRO'] },
  { word: 'CORAZON', image: 'public/assets/images/items/heart.svg', syllables: ['CO', 'RA', 'ZON'], missingIndex: 1, options: ['RA', 'ME', 'TO'] },
  { word: 'ARCOIRIS', image: 'public/assets/images/items/rainbow.svg', syllables: ['AR', 'CO', 'I', 'RIS'], missingIndex: 1, options: ['CO', 'BA', 'LE'] },
  { word: 'CAMPEON', image: 'public/assets/images/items/trophy.svg', syllables: ['CAM', 'PE', 'ON'], missingIndex: 1, options: ['PE', 'SO', 'LU'] }
];

// ============================================================================
// 2. JUEGO 2: ARMA LA SÍLABA - SECUENCIA PEDAGÓGICA INICIAL (50 NIVELES)
// ORDEN ESTRICTO SEP: M -> S -> T -> L -> P -> N -> R -> C -> D -> V
// Con relacionamiento directo a palabras que el niño ya puede leer con lo aprendido.
// ============================================================================
const ARMA_SILABAS_50_LEVELS = [
  // --------------------------------------------------------------------------
  // GRUPO 1: CONSONANTE "M" (Niveles 1 a 5) - Primera consonante
  // --------------------------------------------------------------------------
  { consonant: 'M', vowel: 'A', syllable: 'MA', word: 'MAMÁ', relationText: 'MAMÁ y MAMI', emoji: '👩' },
  { consonant: 'M', vowel: 'E', syllable: 'ME', word: 'MESA', relationText: 'MESA y MEMO', emoji: '🪑' },
  { consonant: 'M', vowel: 'I', syllable: 'MI', word: 'MIEL', relationText: 'MIEL y MIMÍ', emoji: '🍯' },
  { consonant: 'M', vowel: 'O', syllable: 'MO', word: 'MONO', relationText: 'MONO y MOMIA', emoji: '🐒' },
  { consonant: 'M', vowel: 'U', syllable: 'MU', word: 'MÚSICA', relationText: 'MÚSICA y ¡el sonido MUUU!', emoji: '🎵' },

  // --------------------------------------------------------------------------
  // GRUPO 2: CONSONANTE "S" (Niveles 6 a 10) - ¡Relaciona con M y Vocales!
  // --------------------------------------------------------------------------
  { consonant: 'S', vowel: 'A', syllable: 'SA', word: 'MASA', relationText: 'MASA y SALA (¡con M y S!)', emoji: '🥣' },
  { consonant: 'S', vowel: 'E', syllable: 'SE', word: 'MESA', relationText: 'MESA y SELLO (¡con M y S!)', emoji: '🪑' },
  { consonant: 'S', vowel: 'I', syllable: 'SI', word: 'MISA', relationText: 'MISA y SILLA (¡con M y S!)', emoji: '⛪' },
  { consonant: 'S', vowel: 'O', syllable: 'SO', word: 'OSO', relationText: 'OSO y SOL', emoji: '🐻' },
  { consonant: 'S', vowel: 'U', syllable: 'SU', word: 'SUMA', relationText: 'SUMA (¡con S y M!)', emoji: '➕' },

  // --------------------------------------------------------------------------
  // GRUPO 3: CONSONANTE "T" (Niveles 11 a 15) - ¡Relaciona con M, S y T!
  // --------------------------------------------------------------------------
  { consonant: 'T', vowel: 'A', syllable: 'TA', word: 'TAZA', relationText: 'TAZA, TOMA y MATE', emoji: '☕' },
  { consonant: 'T', vowel: 'E', syllable: 'TE', word: 'TÉ', relationText: 'TÉ y TELA', emoji: '🫖' },
  { consonant: 'T', vowel: 'I', syllable: 'TI', word: 'TINA', relationText: 'TINA y TÍO', emoji: '🛁' },
  { consonant: 'T', vowel: 'O', syllable: 'TO', word: 'TOMATE', relationText: 'TOMATE y MOTO (¡con M y T!)', emoji: '🍅' },
  { consonant: 'T', vowel: 'U', syllable: 'TU', word: 'TULIPÁN', relationText: 'TULIPÁN', emoji: '🌷' },

  // --------------------------------------------------------------------------
  // GRUPO 4: CONSONANTE "L" (Niveles 16 a 20) - ¡Relaciona con M, S, T y L!
  // --------------------------------------------------------------------------
  { consonant: 'L', vowel: 'A', syllable: 'LA', word: 'LOMA', relationText: 'LOMA y SALA (¡con M y S!)', emoji: '⛰️' },
  { consonant: 'L', vowel: 'E', syllable: 'LE', word: 'LECHE', relationText: 'LECHE y LEÓN', emoji: '🥛' },
  { consonant: 'L', vowel: 'I', syllable: 'LI', word: 'LIMA', relationText: 'LIMA (¡con L y M!)', emoji: '🍋' },
  { consonant: 'L', vowel: 'O', syllable: 'LO', word: 'LOBO', relationText: 'LOBO y SOLO (¡con S y L!)', emoji: '🐺' },
  { consonant: 'L', vowel: 'U', syllable: 'LU', word: 'LUNA', relationText: 'LUNA y LUPA', emoji: '🌙' },

  // --------------------------------------------------------------------------
  // GRUPO 5: CONSONANTE "P" (Niveles 21 a 25) - ¡Ahora entra la P!
  // --------------------------------------------------------------------------
  { consonant: 'P', vowel: 'A', syllable: 'PA', word: 'PATO', relationText: 'PATO, PAPÁ y MAPA (¡con M y T!)', emoji: '🦆' },
  { consonant: 'P', vowel: 'E', syllable: 'PE', word: 'PELOTA', relationText: 'PELOTA y PESA (¡con P y S!)', emoji: '⚽' },
  { consonant: 'P', vowel: 'I', syllable: 'PI', word: 'PIÑA', relationText: 'PIÑA y PITO (¡con P y T!)', emoji: '🍍' },
  { consonant: 'P', vowel: 'O', syllable: 'PO', word: 'POLLITO', relationText: 'POLLITO y POMO (¡con P y M!)', emoji: '🐥' },
  { consonant: 'P', vowel: 'U', syllable: 'PU', word: 'PUMA', relationText: 'PUMA (¡con P y M!)', emoji: '🐆' },

  // --------------------------------------------------------------------------
  // GRUPO 6: CONSONANTE "N" (Niveles 26 a 30) - ¡Relaciona con M, S, T, L, P, N!
  // --------------------------------------------------------------------------
  { consonant: 'N', vowel: 'A', syllable: 'NA', word: 'LANA', relationText: 'LANA (¡con L y N!) y NATA', emoji: '🧶' },
  { consonant: 'N', vowel: 'E', syllable: 'NE', word: 'NENE', relationText: 'NENE (¡dos sílabas NE!)', emoji: '👶' },
  { consonant: 'N', vowel: 'I', syllable: 'NI', word: 'NIDO', relationText: 'NIDO y PINO (¡con P y N!)', emoji: '🪺' },
  { consonant: 'N', vowel: 'O', syllable: 'NO', word: 'MANO', relationText: 'MANO (¡con M y N!) y NOCHE', emoji: '✋' },
  { consonant: 'N', vowel: 'U', syllable: 'NU', word: 'NUBE', relationText: 'NUBE', emoji: '☁️' },

  // --------------------------------------------------------------------------
  // GRUPO 7: CONSONANTE "R" (Niveles 31 a 35)
  // --------------------------------------------------------------------------
  { consonant: 'R', vowel: 'A', syllable: 'RA', word: 'RAMA', relationText: 'RAMA (¡con R y M!) y RANA', emoji: '🌿' },
  { consonant: 'R', vowel: 'E', syllable: 'RE', word: 'REMO', relationText: 'REMO (¡con R y M!) y RELOJ', emoji: '🚣' },
  { consonant: 'R', vowel: 'I', syllable: 'RI', word: 'RISA', relationText: 'RISA (¡con R y S!) y RIMA', emoji: '😄' },
  { consonant: 'R', vowel: 'O', syllable: 'RO', word: 'ROPA', relationText: 'ROPA (¡con R y P!) y ROSA', emoji: '👕' },
  { consonant: 'R', vowel: 'U', syllable: 'RU', word: 'RUEDA', relationText: 'RUEDA', emoji: '🛞' },

  // --------------------------------------------------------------------------
  // GRUPO 8: CONSONANTE "C" (Niveles 36 a 40)
  // --------------------------------------------------------------------------
  { consonant: 'C', vowel: 'A', syllable: 'CA', word: 'CASA', relationText: 'CASA (¡con C y S!) y CAMA', emoji: '🏠' },
  { consonant: 'C', vowel: 'E', syllable: 'CE', word: 'CERO', relationText: 'CERO (¡con C y R!) y CEBRA', emoji: '0️⃣' },
  { consonant: 'C', vowel: 'I', syllable: 'CI', word: 'CIELO', relationText: 'CIELO y CINE', emoji: '🌤️' },
  { consonant: 'C', vowel: 'O', syllable: 'CO', word: 'COPA', relationText: 'COPA (¡con C y P!) y COLA', emoji: '🏆' },
  { consonant: 'C', vowel: 'U', syllable: 'CU', word: 'CUNA', relationText: 'CUNA (¡con C y N!)', emoji: '🛏️' },

  // --------------------------------------------------------------------------
  // GRUPO 9: CONSONANTE "D" (Niveles 41 a 45)
  // --------------------------------------------------------------------------
  { consonant: 'D', vowel: 'A', syllable: 'DA', word: 'DAMA', relationText: 'DAMA (¡con D y M!) y DADO', emoji: '👸' },
  { consonant: 'D', vowel: 'E', syllable: 'DE', word: 'DEDO', relationText: 'DEDO (¡dos sílabas DE!)', emoji: '👆' },
  { consonant: 'D', vowel: 'I', syllable: 'DI', word: 'DIENTE', relationText: 'DIENTE', emoji: '🦷' },
  { consonant: 'D', vowel: 'O', syllable: 'DO', word: 'DOMA', relationText: 'DOMA y DONA', emoji: '🍩' },
  { consonant: 'D', vowel: 'U', syllable: 'DU', word: 'DUDA', relationText: 'DUDA y DULCE', emoji: '🍬' },

  // --------------------------------------------------------------------------
  // GRUPO 10: CONSONANTE "V" (Niveles 46 a 50)
  // --------------------------------------------------------------------------
  { consonant: 'V', vowel: 'A', syllable: 'VA', word: 'VASO', relationText: 'VASO (¡con V y S!) y VACA', emoji: '🥛' },
  { consonant: 'V', vowel: 'E', syllable: 'VE', word: 'VELA', relationText: 'VELA (¡con V y L!) y VENA', emoji: '🕯️' },
  { consonant: 'V', vowel: 'I', syllable: 'VI', word: 'VINO', relationText: 'VINO (¡con V y N!) y VIDA', emoji: '🍇' },
  { consonant: 'V', vowel: 'O', syllable: 'VO', word: 'VOTO', relationText: 'VOTO (¡con V y T!)', emoji: '🗳️' },
  { consonant: 'V', vowel: 'U', syllable: 'VU', word: 'VUELO', relationText: 'VUELO', emoji: '✈️' }
];
class SyllablesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.activeSubgame = null; // null = menú de juegos en círculos, 'completa' o 'arma'
    this.currentLevel = null;  // null = selector de 50 circulitos, número = nivel activo
  }

  render(container) {
    // 1. Si no ha elegido juego, mostrar el Menú de Juegos en Círculos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // 2. Si eligió un juego pero no ha seleccionado nivel, mostrar los 50 circulitos de ese juego
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // 3. Renderizar el juego activo
    if (this.activeSubgame === 'completa') {
      this.renderCompletaPalabra(container);
    } else if (this.activeSubgame === 'arma') {
      this.renderArmaSilaba(container);
    }
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUB-JUEGOS EN CÍRCULOS (COMPLETA LA PALABRA / ARMA LA SÍLABA)
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();
    const progCompleta = StorageManager.getModuleLevels('syllables_completa');
    const progArma = StorageManager.getModuleLevels('syllables_arma');

    const countCompleta = Object.keys(progCompleta.completed || {}).length;
    const countArma = Object.keys(progArma.completed || {}).length;

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú</button>
          <div style="text-align:center;">
            <h2>MÓDULO DE SÍLABAS</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#2e7d32;">
              Elige tu juego favorito en círculos
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid">
            
            <!-- Círculo 1: Completa la Palabra -->
            <button class="subgame-circle-card" id="btnSelectCompleta">
              <div class="subgame-bubble subgame-bubble-completa pulse-glow">
                <span class="subgame-bubble-icon">🧩</span>
                <span class="subgame-levels-badge">50 Niveles</span>
              </div>
              <span class="subgame-title-label">COMPLETA LA PALABRA</span>
              <span style="font-size:0.75rem; color:#2e7d32; font-weight:bold; margin-top:2px;">
                ⭐ ${countCompleta}/50 completados
              </span>
            </button>

            <!-- Círculo 2: Arma la Sílaba -->
            <button class="subgame-circle-card" id="btnSelectArma">
              <div class="subgame-bubble subgame-bubble-arma pulse-glow">
                <span class="subgame-bubble-icon">🔤</span>
                <span class="subgame-levels-badge badge-orange">50 Niveles</span>
              </div>
              <span class="subgame-title-label">ARMA LA SÍLABA</span>
              <span style="font-size:0.75rem; color:#e65100; font-weight:bold; margin-top:2px;">
                ⭐ ${countArma}/50 completados
              </span>
            </button>

          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">💡 Toca cualquiera de los círculos para jugar sus 50 niveles interactivos.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
      audio.playClick();
      this.navigator.navigate('home');
    });

    container.querySelector('#btnSelectCompleta')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = 'completa';
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnSelectArma')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = 'arma';
      this.currentLevel = null;
      this.render(container);
    });

    audio.speak('Elige un juego de sílabas');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS PARA EL JUEGO SELECCIONADO
  // ==========================================================================
  renderLevelSelector(container) {
    const isCompleta = (this.activeSubgame === 'completa');
    const moduleKey = isCompleta ? 'syllables_completa' : 'syllables_arma';
    const title = isCompleta ? 'Completa la Palabra' : 'Arma la Sílaba (M - S - T - L - P - N - R - C - D - V)';
    const icon = isCompleta ? '🧩' : '🔤';

    LevelSelector.render({
      container,
      moduleKey: moduleKey,
      moduleTitle: title,
      moduleIcon: icon,
      bgClass: 'syllables-bg',
      totalLevels: 50,
      onSelectLevel: (lvl) => {
        this.currentLevel = lvl;
        this.render(container);
      },
      onBackHome: () => {
        // Regresa al menú de los 2 círculos de juegos
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      }
    });
  }

  // ==========================================================================
  // VISTA 3A: JUEGO "COMPLETA LA PALABRA" (50 NIVELES)
  // ==========================================================================
  renderCompletaPalabra(container) {
    const student = StorageManager.getActiveStudent();
    const idx = (this.currentLevel - 1) % SYLLABLES_COMPLETA_50.length;
    const item = SYLLABLES_COMPLETA_50[idx];

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>COMPLETA: ${item.word}</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#2e7d32;">
              Juego 1: Nivel ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board">
          <div class="word-card-box">
            <div style="font-size: clamp(3rem, 7vh, 4.5rem); margin-bottom: 6px;">
              ${this.getWordEmoji(item.word)}
            </div>

            <div class="word-puzzle">
              ${item.syllables.map((syl, i) => {
                if (i === item.missingIndex) {
                  return `<div class="drop-zone" id="dropZone">?</div>`;
                }
                return `<div class="static-syllable">${syl}</div>`;
              }).join('')}
            </div>

            <p class="instruction-text">¿Qué sílaba falta para completar <strong>${item.word}</strong>?</p>

            <div class="syllables-options" id="optionsContainer">
              ${item.options.map(opt => `
                <button class="syllable-btn" data-value="${opt}">${opt}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnListenWord">🔊 Escuchar Palabra</button>
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

    const dropZone = container.querySelector('#dropZone');
    const options = container.querySelectorAll('.syllable-btn');
    const correctSyllable = item.syllables[item.missingIndex];

    options.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.target.dataset.value;

        if (selected === correctSyllable) {
          audio.playSuccess();
          e.target.classList.add('correct');
          dropZone.innerText = selected;
          dropZone.classList.add('solved');

          StorageManager.completeModuleLevel('syllables_completa', this.currentLevel, 3);
          Confetti.shoot(2500);

          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Excelente! Completaste ${item.word} ⭐\n\n¿Quieres jugar el Nivel ${next}?`)) {
                this.currentLevel = next;
                this.render(container);
                return;
              }
            }
            this.currentLevel = null;
            this.render(container);
          }, 800);

        } else {
          audio.playError();
          e.target.classList.add('wrong');
          setTimeout(() => e.target.classList.remove('wrong'), 500);
          audio.speak('Intenta con otra sílaba');
        }
      });
    });

    audio.speak(`Completa la palabra ${item.word}`);
  }

  // ==========================================================================
  // VISTA 3B: JUEGO "ARMA LA SÍLABA" (50 NIVELES: ORDEN PEDAGÓGICO M, S, T, L, P, N, R, C, D, V)
  // Con relacionamiento didáctico de palabras cortas ya conocidas
  // ==========================================================================
  renderArmaSilaba(container) {
    const student = StorageManager.getActiveStudent();
    const idx = (this.currentLevel - 1) % ARMA_SILABAS_50_LEVELS.length;
    const item = ARMA_SILABAS_50_LEVELS[idx];

    // Opciones de vocales con la correcta y 2 distractores
    const allVowels = ['A', 'E', 'I', 'O', 'U'];
    const distractors = allVowels.filter(v => v !== item.vowel).sort(() => 0.5 - Math.random()).slice(0, 2);
    const vowelOptions = [item.vowel, ...distractors].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container syllables-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>ARMA LA SÍLABA: ${item.syllable}</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#e65100;">
              Consonante "${item.consonant}" • Nivel ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board">
          <div class="arma-silaba-card">
            <div style="font-size: clamp(2.8rem, 6.5vh, 4.2rem); margin-bottom: 2px;">
              ${item.emoji}
            </div>

            <!-- Cintillo de Relacionamiento Didáctico -->
            <div class="relation-pill">
              📖 ¡Aprende a leer: <strong>${item.relationText}</strong>!
            </div>

            <p style="font-size:clamp(0.95rem, 2.2vh, 1.25rem); font-weight:bold; color:#37474f; margin:0 0 10px 0; text-align:center;">
              Junta la letra <strong>${item.consonant}</strong> con su vocal para formar <strong>${item.syllable}</strong>
            </p>

            <!-- Ecuación de la sílaba: [Consonante] + [Vocal ?] = [Sílaba] -->
            <div class="equation-row">
              <div class="equation-block eq-consonant">${item.consonant}</div>
              <span class="eq-operator">+</span>
              <div class="equation-block eq-vowel-slot" id="vowelTargetSlot">?</div>
              <span class="eq-operator">=</span>
              <div class="equation-block eq-result" id="syllableResult">...</div>
            </div>

            <p class="instruction-text">¿Qué vocal necesitas para formar <strong>${item.syllable}</strong>?</p>

            <div class="vowel-choices-row" id="vowelChoicesRow">
              ${vowelOptions.map(v => `
                <button class="vowel-choice-btn" data-vowel="${v}">${v}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnListenInstruction">🔊 Escuchar Instrucción</button>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    const instructionText = `Junta la letra ${item.consonant} con su vocal para formar ${item.syllable}, como en ${item.relationText}`;
    container.querySelector('#btnListenInstruction')?.addEventListener('click', () => {
      audio.speak(instructionText);
    });

    const vowelSlot = container.querySelector('#vowelTargetSlot');
    const resultBlock = container.querySelector('#syllableResult');
    const buttons = container.querySelectorAll('.vowel-choice-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chosen = e.target.dataset.vowel;

        if (chosen === item.vowel) {
          audio.playSuccess();
          e.target.style.background = '#4caf50';
          vowelSlot.innerText = chosen;
          vowelSlot.classList.add('filled');
          resultBlock.innerText = item.syllable;
          resultBlock.style.background = '#00c853';

          StorageManager.completeModuleLevel('syllables_arma', this.currentLevel, 3);
          Confetti.shoot(2500);

          audio.speak(`¡La ${item.consonant} con la ${chosen} suena... ${item.syllable}! ¡Muy bien! Ahora ya sabes leer ${item.relationText}.`);

          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Muy bien! Formaste ${item.syllable} ⭐\n\n¿Quieres jugar el Nivel ${next}?`)) {
                this.currentLevel = next;
                this.render(container);
                return;
              }
            }
            this.currentLevel = null;
            this.render(container);
          }, 1200);

        } else {
          audio.playError();
          e.target.style.background = '#f44336';
          setTimeout(() => e.target.style.background = '', 500);
          audio.speak(`Esa es la letra ${chosen}. Necesitamos la vocal para formar ${item.syllable}.`);
        }
      });
    });

    audio.speak(instructionText);
  }

  getWordEmoji(word) {
    const emojis = {
      'ELEFANTE': '🐘', 'PELOTA': '⚽', 'MONITO': '🐒', 'ESTRELLA': '⭐', 'GATITO': '🐱',
      'PERRITO': '🐶', 'PATITO': '🦆', 'MARIPOSA': '🦋', 'LEON': '🦁', 'CONEJITO': '🐰',
      'MANZANA': '🍎', 'TORTUGA': '🐢', 'PLATANO': '🍌', 'JIRAFA': '🦒', 'COCODRILO': '🐊',
      'BALLENA': '🐋', 'DELFIN': '🐬', 'CANGURO': '🦘', 'ZORRITO': '🦊', 'OSITO': '🐻',
      'CEBRITA': '🦓', 'TIGRITO': '🐯', 'RANITA': '🐸', 'ABEJITA': '🐝', 'CARACOL': '🐌',
      'RATON': '🐭', 'VAQUITA': '🐮', 'CABALLO': '🐴', 'CERDITO': '🐷', 'GALLINA': '🐔',
      'OVEJITA': '🐑', 'CABRITA': '🐐', 'POLLITO': '🐥', 'LOBITO': '🐺', 'CAMARON': '🦐',
      'PAPAGAYO': '🦜', 'PINGÜINO': '🐧', 'BARQUITO': '⛵', 'AVIONCITO': '✈️', 'COCHECITO': '🚗',
      'TRENESITO': '🚂', 'BICICLETA': '🚲', 'SOLECITO': '☀️', 'LUNITA': '🌙', 'NUBESITA': '☁️',
      'ARBOLITO': '🌳', 'FLORECITA': '🌸', 'CORAZON': '❤️', 'ARCOIRIS': '🌈', 'CAMPEON': '🏆'
    };
    return emojis[word] || '🌟';
  }
}


  /* ==========================================================================
     FILE: src/modules/NumbersScreen.js
     ========================================================================== */

/**
 * NumbersScreen - Módulo "Números" con 50 Juegos en Círculos ("Circulitos")
 * Trencito numérico didáctico y secuencias progresivas para kínder.
 */
function getNumberPuzzleForLevel(levelNum) {
  // Nivel 1: El clásico default [1, 2, '?', 4, 5]
  if (levelNum === 1) {
    return {
      sequence: [1, 2, '?', 4, 5],
      correct: 3,
      options: [3, 6, 2],
      helperText: '¿Qué número falta en el trencito?'
    };
  }

  // Generador didáctico para los niveles 2 al 50
  const start = ((levelNum - 1) % 15) + 1;
  const missingOffset = ((levelNum * 2) % 4) + 1; // 1, 2 o 3
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
class NumbersScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.currentLevel = null;
  }

  render(container) {
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'numbers',
        moduleTitle: 'Números',
        moduleIcon: '🚂',
        bgClass: 'numbers-bg',
        totalLevels: 50,
        onSelectLevel: (lvl) => {
          this.currentLevel = lvl;
          this.renderGame(container);
        },
        onBackHome: () => {
          this.navigator.navigate('home');
        }
      });
      return;
    }

    this.renderGame(container);
  }

  renderGame(container) {
    const student = StorageManager.getActiveStudent();
    const puzzle = getNumberPuzzleForLevel(this.currentLevel);

    container.innerHTML = `
      <div class="module-container numbers-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>NÚMEROS - EL TREN MATEMÁTICO</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#00838f;">
              Juego ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board numbers-board">
          <!-- Monito ayudante -->
          <div class="character-helper bounce-gentle">
            <img src="public/assets/images/educational/monkey.svg" alt="Monito" class="helper-avatar" onerror="this.innerText='🐒'">
            <div class="speech-bubble">${puzzle.helperText}</div>
          </div>

          <!-- Trencito de números -->
          <div class="train-wrapper">
            <div class="locomotive">🚂</div>
            <div class="train-container">
              ${puzzle.sequence.map((num) => {
                if (num === '?') {
                  return `<div class="train-car missing" id="missingCar">?</div>`;
                }
                return `<div class="train-car">${num}</div>`;
              }).join('')}
            </div>
          </div>

          <!-- Opciones numéricas -->
          <div class="number-options-container" style="display:flex; flex-direction:column; align-items:center;">
            <p class="select-hint" style="font-weight:bold; color:#006064; margin-bottom:8px;">Toca el número correcto:</p>
            <div class="number-options">
              ${puzzle.options.map((opt) => `
                <button class="num-btn" data-val="${opt}">${opt}</button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnPlayHelperAudio">🔊 Repetir Pregunta</button>
        </footer>
      </div>
    `;

    this.bindEvents(container, puzzle);
    audio.speak(puzzle.helperText);
  }

  bindEvents(container, puzzle) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnPlayHelperAudio')?.addEventListener('click', () => {
      audio.speak(puzzle.helperText);
    });

    const missingCar = container.querySelector('#missingCar');
    const buttons = container.querySelectorAll('.num-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.target.dataset.val, 10);

        if (val === puzzle.correct) {
          audio.playSuccess();
          e.target.classList.add('correct');
          missingCar.innerText = val.toString();
          missingCar.classList.remove('missing');
          missingCar.classList.add('filled-train');

          StorageManager.completeModuleLevel('numbers', this.currentLevel, 3);
          Confetti.shoot(2500);

          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Excelente! El trencito está completo ⭐\n\n¿Quieres jugar el Nivel ${next}?`)) {
                this.currentLevel = next;
                this.renderGame(container);
                return;
              }
            }
            this.currentLevel = null;
            this.render(container);
          }, 800);

        } else {
          audio.playError();
          e.target.classList.add('wrong');
          setTimeout(() => e.target.classList.remove('wrong'), 500);
          audio.speak('Ese número no va ahí, ¡intenta de nuevo!');
        }
      });
    });
  }
}


  /* ==========================================================================
     FILE: src/modules/VowelsScreen.js
     ========================================================================== */

/**
 * VowelsScreen - Módulo "Vocales" con 50 Juegos en Círculos ("Circulitos")
 * Reconocimiento fonético e ilustrado de A - E - I - O - U para preescolar.
 */
class VowelsScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.currentLevel = null;
    this.vowels = [
      { letter: 'A', word: 'Avión', emoji: '✈️', color: '#ff5722' },
      { letter: 'E', word: 'Elefante', emoji: '🐘', color: '#4caf50' },
      { letter: 'I', word: 'Isla', emoji: '🏝️', color: '#00bcd4' },
      { letter: 'O', word: 'Oso', emoji: '🐻', color: '#ff9800' },
      { letter: 'U', word: 'Uva', emoji: '🍇', color: '#9c27b0' }
    ];
  }

  render(container) {
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'vowels',
        moduleTitle: 'Vocales',
        moduleIcon: '🔤',
        bgClass: 'vowels-bg',
        totalLevels: 50,
        onSelectLevel: (lvl) => {
          this.currentLevel = lvl;
          this.renderGame(container);
        },
        onBackHome: () => {
          this.navigator.navigate('home');
        }
      });
      return;
    }

    this.renderGame(container);
  }

  renderGame(container) {
    const student = StorageManager.getActiveStudent();

    // Nivel 1: Tablero completo interactivo de las 5 vocales
    if (this.currentLevel === 1) {
      container.innerHTML = `
        <div class="module-container vowels-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
            <div style="text-align:center;">
              <h2>LAS VOCALES: A - E - I - O - U</h2>
              <div style="font-size:0.8rem; font-weight:bold; color:#6a1b9a;">
                Juego 1 de 50 (Tablero Mágico)
              </div>
            </div>
            <div class="score-box">⭐ ${student.stars || 0}</div>
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
            <button class="check-btn" id="btnCompleteLevel">⭐ ¡Completar Nivel 1!</button>
          </footer>
        </div>
      `;

      this.bindLevel1Events(container);
      audio.speak('¡Toca cada vocal para escuchar su sonido!');
      return;
    }

    // Niveles 2 al 50: Desafíos de discriminación fonética ("Encuentra la vocal correcta")
    const targetVowel = this.vowels[(this.currentLevel - 2) % this.vowels.length];
    const shuffled = [...this.vowels].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container vowels-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>RETOS VOCÁLICOS</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#6a1b9a;">
              Juego ${this.currentLevel} de 50: Encuentra la ${targetVowel.letter}
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:white; padding:14px 24px; border-radius:24px; border:3px solid ${targetVowel.color}; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:90vw;">
            <div style="font-size: clamp(3rem, 7vh, 4.5rem);">${targetVowel.emoji}</div>
            <h3 style="color:${targetVowel.color}; font-size:clamp(1.2rem, 3vh, 1.8rem); margin:6px 0;">
              ¿Cuál es la vocal de "${targetVowel.word}"?
            </h3>
            <div style="display:flex; gap:clamp(8px, 2vw, 16px); justify-content:center; margin-top:14px;">
              ${shuffled.map(v => `
                <button class="syllable-btn" data-v="${v.letter}" style="background:${v.color}; font-size:clamp(1.4rem, 3.5vh, 2rem); min-width:clamp(48px, 9vw, 65px);">
                  ${v.letter}
                </button>
              `).join('')}
            </div>
          </div>
        </main>

        <footer class="module-footer">
          <button class="sound-btn" id="btnListenChallenge">🔊 Repetir: ${targetVowel.word}</button>
        </footer>
      </div>
    `;

    this.bindChallengeEvents(container, targetVowel);
    audio.speak(`¿Cuál es la vocal de ${targetVowel.word}?`);
  }

  bindLevel1Events(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
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

    container.querySelector('#btnCompleteLevel')?.addEventListener('click', () => {
      audio.playFanfare();
      Confetti.shoot(2500);
      StorageManager.completeModuleLevel('vowels', 1, 3);
      setTimeout(() => {
        if (confirm('¡Felicidades! Has completado el repaso de vocales ⭐\n\n¿Quieres jugar el Nivel 2?')) {
          this.currentLevel = 2;
          this.renderGame(container);
        } else {
          this.currentLevel = null;
          this.render(container);
        }
      }, 700);
    });
  }

  bindChallengeEvents(container, targetVowel) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnListenChallenge')?.addEventListener('click', () => {
      audio.speak(`Encuentra la vocal de ${targetVowel.word}`);
    });

    container.querySelectorAll('.syllable-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chosen = e.target.dataset.v;
        if (chosen === targetVowel.letter) {
          audio.playSuccess();
          e.target.classList.add('correct');
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('vowels', this.currentLevel, 3);
          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Correcto! ${targetVowel.letter} de ${targetVowel.word} ⭐\n\n¿Quieres pasar al Nivel ${next}?`)) {
                this.currentLevel = next;
                this.renderGame(container);
                return;
              }
            }
            this.currentLevel = null;
            this.render(container);
          }, 800);
        } else {
          audio.playError();
          e.target.classList.add('wrong');
          setTimeout(() => e.target.classList.remove('wrong'), 500);
          audio.speak(`Esa es la letra ${chosen}, intenta de nuevo`);
        }
      });
    });
  }
}


  /* ==========================================================================
     FILE: src/modules/ShapesScreen.js
     ========================================================================== */

/**
 * ShapesScreen - Módulo "Figuras" con 50 Juegos en Círculos ("Circulitos")
 * Reconocimiento de figuras geométricas, colores y secuencias didácticas.
 */
class ShapesScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.currentLevel = null;
    this.shapes = [
      { name: 'CÍRCULO', shapeType: 'circle', objectText: '🍩 Como una dona deliciosa', color: '#ff5722' },
      { name: 'TRIÁNGULO', shapeType: 'triangle', objectText: '🍕 Como una rebanada de pizza', color: '#ffb300' },
      { name: 'CUADRADO', shapeType: 'square', objectText: '🎁 Como una caja de regalo', color: '#4caf50' },
      { name: 'ESTRELLA', shapeType: 'star', objectText: '⭐ Como las estrellas del cielo', color: '#9c27b0' }
    ];
    this.currentColor = '#ff5722';
  }

  render(container) {
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'shapes',
        moduleTitle: 'Figuras',
        moduleIcon: '🎨',
        bgClass: 'shapes-bg',
        totalLevels: 50,
        onSelectLevel: (lvl) => {
          this.currentLevel = lvl;
          this.renderGame(container);
        },
        onBackHome: () => {
          this.navigator.navigate('home');
        }
      });
      return;
    }

    this.renderGame(container);
  }

  renderGame(container) {
    const student = StorageManager.getActiveStudent();

    // Nivel 1: Taller de Pintura de Figuras Geométricas (Juego Default)
    if (this.currentLevel === 1) {
      container.innerHTML = `
        <div class="module-container shapes-bg fade-in">
          <header class="module-header">
            <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
            <div style="text-align:center;">
              <h2>FIGURAS GEOMÉTRICAS Y COLORES</h2>
              <div style="font-size:0.8rem; font-weight:bold; color:#c2185b;">
                Juego 1 de 50: Taller de Colores
              </div>
            </div>
            <div class="score-box">⭐ ${student.stars || 0}</div>
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
            <button class="check-btn" id="btnFinishShapes">⭐ ¡Completar Nivel 1!</button>
          </footer>
        </div>
      `;

      this.bindLevel1Events(container);
      audio.speak('Elige un color y pinta las figuras');
      return;
    }

    // Niveles 2 al 50: Desafíos pedagógicos ("Toca la figura correcta")
    const target = this.shapes[(this.currentLevel - 2) % this.shapes.length];
    const shuffled = [...this.shapes].sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="module-container shapes-bg fade-in">
        <header class="module-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          <div style="text-align:center;">
            <h2>DESAFÍO DE FIGURAS</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#c2185b;">
              Juego ${this.currentLevel} de 50
            </div>
          </div>
          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="game-board" style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:white; padding:18px 28px; border-radius:24px; border:3px solid #f06292; box-shadow:0 8px 20px rgba(0,0,0,0.12); text-align:center; max-width:92vw;">
            <h3 style="color:#ad1457; font-size:clamp(1.2rem, 3vh, 1.7rem); margin:0 0 16px 0;">
              ¿Cuál de estas figuras es el <strong>${target.name}</strong>?
            </h3>

            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:14px; justify-items:center;">
              ${shuffled.map(s => `
                <button class="shape-card" data-chosen="${s.name}" style="padding:14px 20px; cursor:pointer;">
                  <div class="shape-figure-box">
                    <div class="shape-element ${s.shapeType}" style="--current-fill: ${s.color}"></div>
                  </div>
                  <h4 style="margin:4px 0 0 0; color:#37474f;">${s.name}</h4>
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

    this.bindChallengeEvents(container, target);
    audio.speak(`¿Cuál figura es el ${target.name}?`);
  }

  bindLevel1Events(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelectorAll('.palette-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        container.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        this.currentColor = e.target.dataset.color;
        audio.playClick();
      });
    });

    container.querySelectorAll('.shape-card').forEach(card => {
      card.addEventListener('click', () => {
        const shapeElem = card.querySelector('.shape-element');
        if (shapeElem) {
          shapeElem.style.setProperty('--current-fill', this.currentColor);
          audio.playBrush();
          Confetti.shoot(800);
        }
      });
    });

    container.querySelector('#btnFinishShapes')?.addEventListener('click', () => {
      audio.playFanfare();
      Confetti.shoot(2500);
      StorageManager.completeModuleLevel('shapes', 1, 3);
      setTimeout(() => {
        if (confirm('¡Felicidades! Has pintado todas las figuras ⭐\n\n¿Quieres jugar el Nivel 2?')) {
          this.currentLevel = 2;
          this.renderGame(container);
        } else {
          this.currentLevel = null;
          this.render(container);
        }
      }, 700);
    });
  }

  bindChallengeEvents(container, target) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnRepeatChallenge')?.addEventListener('click', () => {
      audio.speak(`Toca el ${target.name}`);
    });

    container.querySelectorAll('.shape-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const chosen = card.dataset.chosen;
        if (chosen === target.name) {
          audio.playSuccess();
          card.style.borderColor = '#4caf50';
          card.style.background = '#e8f5e9';
          Confetti.shoot(2000);
          StorageManager.completeModuleLevel('shapes', this.currentLevel, 3);
          setTimeout(() => {
            if (this.currentLevel < 50) {
              const next = this.currentLevel + 1;
              if (confirm(`¡Correcto! Es el ${target.name} ⭐\n\n¿Quieres pasar al Nivel ${next}?`)) {
                this.currentLevel = next;
                this.renderGame(container);
                return;
              }
            }
            this.currentLevel = null;
            this.render(container);
          }, 800);
        } else {
          audio.playError();
          audio.speak(`Ese es un ${chosen}, ¡intenta de nuevo!`);
        }
      });
    });
  }
}


  /* ==========================================================================
     FILE: src/modules/OpenWorldScreen.js
     ========================================================================== */

/**
 * OpenWorldScreen - Sala de Juegos Libre / Mundo Abierto (Estilo Toca Boca World)
 * Escenario táctil interactivo donde Juan Carlos juega libremente con sus juguetes
 * y mascotas desbloqueadas mediante el aprendizaje. 100% offline.
 */
class OpenWorldScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
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
        <!-- Barra Superior del Mundo -->
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

        <!-- Escenario Principal (Zona de Juego Libre / Playmat) -->
        <main class="playmat-scene" id="playmatScene">
          <!-- Decoración ambiental infantil -->
          <div class="scenery-window">🪟</div>
          <div class="scenery-sun">☀️</div>
          <div class="scenery-shelf">
            <div class="shelf-board"></div>
          </div>
          <div class="scenery-rug"></div>

          <!-- Avatar Principal Arrastrable de Juan Carlos -->
          <div class="draggable-prop draggable-avatar" id="playerAvatar" style="left: 120px; top: 180px;">
            <img src="${this.student.avatarUrl || 'public/assets/images/character_avatar.svg'}" 
                 alt="Avatar ${this.student.name}"
                 onerror="this.src='public/assets/images/character_avatar.png'">
            <div class="avatar-tag">${this.student.name}</div>
          </div>

          <!-- Contenedor dinámico de objetos en el mundo -->
          <div id="placedPropsContainer"></div>
        </main>

        <!-- Panel Lateral Deslizable de Inventario -->
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

    // Agregar objeto desde inventario al mundo
    container.querySelectorAll('.inventory-item').forEach(itemElem => {
      itemElem.addEventListener('click', () => {
        const id = itemElem.dataset.id;
        const allItems = rewards.getAllItems();
        const item = allItems.find(i => i.id === id);
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

      // Limitar dentro del escenario
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

    // Ratón
    scene.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY, e.target));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    // Táctil (Android tablet / móvil)
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
      // Estado inicial por defecto: colocar mascota dinosaurio al lado de Juan Carlos
      const allItems = rewards.getAllItems();
      const dino = allItems.find(i => i.id === 'pet_dino');
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
     FILE: src/main.js
     ========================================================================== */

/**
 * main.js - Punto de entrada principal de Juan Carlos's Adventures
 * Orquestador de vistas, navegación y ciclo de vida de la aplicación.
 */
class App {
  constructor() {
    this.container = document.getElementById('app');
    this.currentScreen = null;
    this.screenHistory = [];

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
    // Escuchar el primer gesto del usuario para desbloquear AudioContext (política de navegadores y Android WebView)
    const unlockAudio = () => {
      audio.ensureContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Soporte para botón atrás de Android / historial
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.module) {
        this.navigate(e.state.module, false);
      } else {
        this.navigate('home', false);
      }
    });

    // Cargar pantalla inicial (soporta deep-link por hash ej: #syllables)
    const hash = window.location.hash.replace('#', '');
    if (hash && this.screens[hash]) {
      this.navigate(hash, false);
    } else {
      this.navigate('home', false);
    }
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

// Inicializar la aplicación cuando el DOM esté listo


  // InicializaciÃ³n inmediata y segura en cualquier entorno
  function bootstrap() {
    if (!window.__APP_INSTANCE) {
      window.__APP_INSTANCE = new App();
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
