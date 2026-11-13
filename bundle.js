/**
 * Juan Carlos's Adventures - Standalone Universal Bundle
 * Compatible con file:/// (sin CORS), GitHub Pages y Android WebView.
 * Organizado en Español con 50 Juegos en Círculos por módulo y validación por waypoints.
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

  playArabotBlip() {
    if (this.isMuted) return;
    this.ensureContext();
    this.playTone(660, 'sine', 0.08, 0.18);
    setTimeout(() => {
      this.playTone(990, 'triangle', 0.12, 0.2);
    }, 80);
  }

  playMagicSparkle() {
    if (this.isMuted) return;
    this.ensureContext();
    const notes = [587.33, 659.25, 783.99, 880, 1046.50, 1174.66, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.18, 0.15);
      }, i * 45);
    });
  }

  playCelebration() {
    this.playFanfare();
    setTimeout(() => {
      this.playMagicSparkle();
    }, 450);
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
    const container = config.container;
    const moduleKey = config.moduleKey || 'general';
    const moduleTitle = config.moduleTitle || config.title || 'NIVELES';
    const moduleIcon = config.moduleIcon || config.icon || '⭐';
    const bgClass = config.bgClass || '';
    const totalLevels = config.totalLevels || 50;
    const onSelectLevel = config.onSelectLevel;
    const onBackHome = config.onBackHome || config.onBack;

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
            <h2 class="selector-module-title">${moduleIcon} ${(moduleTitle || 'NIVELES').toUpperCase()}</h2>
            <div class="levels-subtitle-pill">
              ${totalLevels} Juegos Didácticos • Completados: <strong>${completedCount}/${totalLevels}</strong>
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
     FILE: src/components/ArabotAssistant.js
     ========================================================================== */

/**
 * ArabotAssistant.js - Asistente pedagógico interactivo "ARABOT"
 * Diseñado para ubicarse en la zona central superior (sin estorbar botones)
 * con tutorial animado demostrativo y botón de ayuda para niños de preescolar.
 */
class ArabotAssistant {
  constructor(options = {}) {
    this.container = null;
    this.rootElement = null;
    this.speechBubble = null;
    this.pointerElement = null;
    this.isMinimized = false;
    this.isTutorialRunning = false;
    this.speechTimeout = null;
    this.onHelpClickCallback = options.onHelpClick || null;
  }

  /**
   * Monta a ARABOT en el contenedor ancla (ej. #arabotAnchor en el centro del header)
   */
  mount(parentContainer) {
    this.container = parentContainer;
    this.destroy();

    const wrapper = document.createElement('div');
    wrapper.className = 'arabot-header-component';
    wrapper.id = 'arabotAssistant';
    wrapper.innerHTML = `
      <div class="arabot-top-pill" id="arabotHead" role="button" aria-label="ARABOT Asistente de Ayuda" title="¡Toca a ARABOT para recibir ayuda!">
        <div class="arabot-avatar-box">
          <div class="arabot-pulse-ring"></div>
          <svg class="arabot-svg" viewBox="0 0 100 100" width="100%" height="100%">
            <!-- Antena con luz pulsante -->
            <line x1="50" y1="20" x2="50" y2="7" stroke="#78909c" stroke-width="4" stroke-linecap="round"/>
            <circle cx="50" cy="7" r="6" class="arabot-antenna-light" fill="#ffeb3b" stroke="#fbc02d" stroke-width="2"/>

            <!-- Orejas / Conectores -->
            <rect x="12" y="44" width="8" height="20" rx="4" fill="#ff9800"/>
            <rect x="80" y="44" width="8" height="20" rx="4" fill="#ff9800"/>
            <circle cx="16" cy="54" r="2.5" fill="#ffffff"/>
            <circle cx="84" cy="54" r="2.5" fill="#ffffff"/>

            <!-- Cabeza Robótica -->
            <rect x="18" y="20" width="64" height="62" rx="20" fill="url(#arabotHeadGrad)" stroke="#546e7a" stroke-width="3"/>

            <!-- Visor Digital Azul Intenso -->
            <rect x="25" y="30" width="50" height="34" rx="12" fill="#0d1b2a" stroke="#00e5ff" stroke-width="2.5"/>

            <!-- Ojos Expresivos Normales -->
            <g class="arabot-eyes-normal" id="arabotEyesNormal">
              <ellipse cx="38" cy="46" rx="5.5" ry="7.5" fill="#00e5ff" class="arabot-eye"/>
              <ellipse cx="62" cy="46" rx="5.5" ry="7.5" fill="#00e5ff" class="arabot-eye"/>
              <circle cx="39.5" cy="44" r="2.2" fill="#ffffff"/>
              <circle cx="63.5" cy="44" r="2.2" fill="#ffffff"/>
            </g>

            <!-- Ojos de Estrella para Celebración -->
            <g class="arabot-eyes-celebrate" id="arabotEyesCelebrate" style="display:none;">
              <polygon points="38,40 40.5,45 45,46 41.5,49 42.5,54 38,51 33.5,54 34.5,49 31,46 35.5,45" fill="#ffeb3b"/>
              <polygon points="62,40 64.5,45 69,46 65.5,49 66.5,54 62,51 57.5,54 58.5,49 55,46 59.5,45" fill="#ffeb3b"/>
            </g>

            <!-- Mejillas Sonrojadas -->
            <ellipse cx="28" cy="61" rx="4.5" ry="2.2" fill="#ff4081" opacity="0.65"/>
            <ellipse cx="72" cy="61" rx="4.5" ry="2.2" fill="#ff4081" opacity="0.65"/>

            <!-- Sonrisa simpática -->
            <path id="arabotMouth" d="M 43 67 Q 50 74 57 67" stroke="#00bcd4" stroke-width="3" stroke-linecap="round" fill="none"/>

            <defs>
              <linearGradient id="arabotHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="50%" stop-color="#f0f4f8"/>
                <stop offset="100%" stop-color="#b0bec5"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div class="arabot-pill-label">
          <span class="arabot-name-tag">ARABOT</span>
          <span class="arabot-help-tag">💡 Ayuda</span>
        </div>
      </div>

      <!-- Burbuja de diálogo centrada que se abre hacia abajo -->
      <div class="arabot-speech-bubble-anchor" id="arabotSpeechBubble" style="display:none;">
        <div class="arabot-bubble-arrow-top"></div>
        <div class="arabot-speech-text" id="arabotSpeechText">¡Hola! Soy ARABOT 🤖</div>
      </div>
    `;

    this.container.appendChild(wrapper);
    this.rootElement = wrapper;
    this.speechBubble = wrapper.querySelector('#arabotSpeechBubble');

    // El puntero mágico se monta en body para no ser recortado por overflow
    let pointer = document.getElementById('arabotMagicPointer');
    if (!pointer) {
      pointer = document.createElement('div');
      pointer.className = 'arabot-magic-pointer';
      pointer.id = 'arabotMagicPointer';
      pointer.style.display = 'none';
      pointer.innerHTML = `
        <span class="pointer-icon">✏️</span>
        <span class="pointer-sparkle">✨</span>
      `;
      document.body.appendChild(pointer);
    }
    this.pointerElement = pointer;

    this.bindEvents();
    return wrapper;
  }

  bindEvents() {
    const head = this.rootElement?.querySelector('#arabotHead');
    if (!head) return;

    head.addEventListener('click', () => {
      if (this.isTutorialRunning) return;
      if (audio.playArabotBlip) audio.playArabotBlip();
      else audio.playPop();

      this.bounceHead();

      if (this.onHelpClickCallback) {
        this.onHelpClickCallback();
      } else {
        this.speak('¡Aquí estoy! ¡Sigue las flechas en la cuadrícula!');
      }
    });
  }

  speak(text, durationMs = 3200, callback = null) {
    if (!this.speechBubble || !this.rootElement) return;

    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
    }

    const textEl = this.rootElement.querySelector('#arabotSpeechText');
    if (textEl) {
      textEl.innerHTML = text;
    }

    this.speechBubble.style.display = 'block';
    this.speechBubble.classList.remove('bubble-exit');
    this.speechBubble.classList.add('bubble-enter');

    // Reproducir audio fonético
    audio.speak(text.replace(/<[^>]*>/g, ''));
    if (audio.playArabotBlip) audio.playArabotBlip();

    this.speechTimeout = setTimeout(() => {
      this.closeSpeech();
      if (callback) callback();
    }, durationMs);
  }

  closeSpeech() {
    if (!this.speechBubble) return;
    this.speechBubble.classList.remove('bubble-enter');
    this.speechBubble.classList.add('bubble-exit');
    setTimeout(() => {
      if (this.speechBubble) {
        this.speechBubble.style.display = 'none';
        this.speechBubble.classList.remove('bubble-exit');
      }
    }, 250);
  }

  bounceHead() {
    const head = this.rootElement?.querySelector('#arabotHead');
    if (!head) return;
    head.classList.remove('arabot-jump');
    void head.offsetWidth;
    head.classList.add('arabot-jump');
  }

  celebrate(text = '¡Excelente! ¡A de Árbol! 🌳⭐', durationMs = 3000) {
    const normalEyes = this.rootElement?.querySelector('#arabotEyesNormal');
    const celebrateEyes = this.rootElement?.querySelector('#arabotEyesCelebrate');

    if (normalEyes) normalEyes.style.display = 'none';
    if (celebrateEyes) celebrateEyes.style.display = 'block';

    this.bounceHead();

    this.speak(text, durationMs, () => {
      if (normalEyes) normalEyes.style.display = 'block';
      if (celebrateEyes) celebrateEyes.style.display = 'none';
    });
  }

  playTutorial(canvasElement, strokes, onComplete = null) {
    if (this.isTutorialRunning) return;
    this.isTutorialRunning = true;

    const pointer = this.pointerElement;
    if (!pointer || !canvasElement) {
      this.isTutorialRunning = false;
      return;
    }

    this.speak('¡Mira cómo lo hago! Sigue la dirección de las flechas...', 2400);

    const rect = canvasElement.getBoundingClientRect();
    pointer.style.display = 'flex';
    pointer.style.opacity = '1';

    let strokeIndex = 0;

    const runStroke = () => {
      if (strokeIndex >= strokes.length) {
        pointer.style.opacity = '0';
        setTimeout(() => {
          pointer.style.display = 'none';
          this.isTutorialRunning = false;

          this.speak('¡Ahora te toca a ti, mira la sorpresa! ⭐', 2800, () => {
            if (onComplete) onComplete();
          });
        }, 300);
        return;
      }

      const current = strokes[strokeIndex];
      const startX = rect.left + current.from.x * rect.width;
      const startY = rect.top + current.from.y * rect.height;
      const endX = rect.left + current.to.x * rect.width;
      const endY = rect.top + current.to.y * rect.height;

      pointer.style.transition = 'none';
      pointer.style.transform = `translate(${startX}px, ${startY}px) scale(1.15)`;

      if (audio.playBrush) audio.playBrush();

      setTimeout(() => {
        pointer.style.transition = 'transform 0.95s cubic-bezier(0.25, 1, 0.5, 1)';
        pointer.style.transform = `translate(${endX}px, ${endY}px) scale(1)`;

        setTimeout(() => {
          if (audio.playPop) audio.playPop();
          strokeIndex++;
          setTimeout(runStroke, 220);
        }, 1000);
      }, 100);
    };

    setTimeout(runStroke, 1200);
  }

  destroy() {
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    if (this.rootElement && this.rootElement.parentElement) {
      this.rootElement.parentElement.removeChild(this.rootElement);
    }
    const pointer = document.getElementById('arabotMagicPointer');
    if (pointer && pointer.parentElement) {
      pointer.parentElement.removeChild(pointer);
    }
    this.rootElement = null;
    this.speechBubble = null;
    this.pointerElement = null;
    this.isTutorialRunning = false;
  }
}


  /* ==========================================================================
     FILE: src/core/StrokeGenerator.js
     ========================================================================== */

/**
 * StrokeGenerator.js - Motor Universal Pedagógico y Generador de Trazos
 * Basado en los estándares SEP de preescolar y método fonético / caligráfico escolar.
 * 
 * Capacidades:
 * - Define la geometría exacta, dirección, puntos numerados y flechas para:
 *   • Las 26 letras mayúsculas (A - Z)
 *   • Las 26 letras minúsculas (a - z)
 *   • Los 10 dígitos numéricos (0 - 9)
 *   • 8 patrones de grafomotricidad preescolar (líneas, curvas, olas, zig-zag, espirales)
 * - Muestreo denso de puntos de trayectoria (checkpoints) para detección suave y tolerante.
 * - Generador de trazos para palabras y nombres completos (ej. JUAN CARLOS, MAMÁ, etc.).
 * - Renderizado en canvas con guías punteadas, insignias numeradas y animación guía.
 */

// Puntos clave normalizados (0.0 a 1.0) para cada letra mayúscula
const UPPERCASE_STROKES = {
  'A': [
    { id: 'A1', label: '1', arrow: '↙', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.88 }] },
    { id: 'A2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.82, y: 0.88 }] },
    { id: 'A3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.30, y: 0.58 }, { x: 0.70, y: 0.58 }] }
  ],
  'B': [
    { id: 'B1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'B2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.76, y: 0.12 }, { x: 0.76, y: 0.48 }, { x: 0.28, y: 0.48 }] },
    { id: 'B3', label: '3', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.48 }, { x: 0.82, y: 0.48 }, { x: 0.82, y: 0.88 }, { x: 0.28, y: 0.88 }] }
  ],
  'C': [
    { id: 'C1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.80, y: 0.24 }, { x: 0.48, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.48, y: 0.88 }, { x: 0.80, y: 0.76 }] }
  ],
  'D': [
    { id: 'D1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'D2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.84, y: 0.20 }, { x: 0.84, y: 0.80 }, { x: 0.28, y: 0.88 }] }
  ],
  'E': [
    { id: 'E1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'E2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.76, y: 0.12 }] },
    { id: 'E3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.50 }, { x: 0.66, y: 0.50 }] },
    { id: 'E4', label: '4', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.88 }, { x: 0.76, y: 0.88 }] }
  ],
  'F': [
    { id: 'F1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'F2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.76, y: 0.12 }] },
    { id: 'F3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.50 }, { x: 0.66, y: 0.50 }] }
  ],
  'G': [
    { id: 'G1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.80, y: 0.24 }, { x: 0.48, y: 0.12 }, { x: 0.18, y: 0.50 }, { x: 0.48, y: 0.88 }, { x: 0.78, y: 0.80 }] },
    { id: 'G2', label: '2', arrow: '↑', type: 'line', pts: [{ x: 0.78, y: 0.80 }, { x: 0.78, y: 0.52 }] },
    { id: 'G3', label: '3', arrow: '⬅', type: 'line', pts: [{ x: 0.78, y: 0.52 }, { x: 0.54, y: 0.52 }] }
  ],
  'H': [
    { id: 'H1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'H2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.74, y: 0.12 }, { x: 0.74, y: 0.88 }] },
    { id: 'H3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.50 }, { x: 0.74, y: 0.50 }] }
  ],
  'I': [
    { id: 'I1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] },
    { id: 'I2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.30, y: 0.12 }, { x: 0.70, y: 0.12 }] },
    { id: 'I3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.30, y: 0.88 }, { x: 0.70, y: 0.88 }] }
  ],
  'J': [
    { id: 'J1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.32, y: 0.12 }, { x: 0.76, y: 0.12 }] },
    { id: 'J2', label: '2', arrow: '↓', type: 'curve', pts: [{ x: 0.62, y: 0.12 }, { x: 0.62, y: 0.72 }, { x: 0.44, y: 0.88 }, { x: 0.26, y: 0.76 }] }
  ],
  'K': [
    { id: 'K1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.26, y: 0.12 }, { x: 0.26, y: 0.88 }] },
    { id: 'K2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.76, y: 0.16 }, { x: 0.28, y: 0.52 }] },
    { id: 'K3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.28, y: 0.52 }, { x: 0.76, y: 0.88 }] }
  ],
  'L': [
    { id: 'L1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'L2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.88 }, { x: 0.76, y: 0.88 }] }
  ],
  'M': [
    { id: 'M1', label: '1', arrow: '↑', type: 'line', pts: [{ x: 0.20, y: 0.88 }, { x: 0.20, y: 0.12 }] },
    { id: 'M2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.20, y: 0.12 }, { x: 0.50, y: 0.65 }] },
    { id: 'M3', label: '3', arrow: '↗', type: 'line', pts: [{ x: 0.50, y: 0.65 }, { x: 0.80, y: 0.12 }] },
    { id: 'M4', label: '4', arrow: '↓', type: 'line', pts: [{ x: 0.80, y: 0.12 }, { x: 0.80, y: 0.88 }] }
  ],
  'N': [
    { id: 'N1', label: '1', arrow: '↑', type: 'line', pts: [{ x: 0.24, y: 0.88 }, { x: 0.24, y: 0.12 }] },
    { id: 'N2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.24, y: 0.12 }, { x: 0.76, y: 0.88 }] },
    { id: 'N3', label: '3', arrow: '↑', type: 'line', pts: [{ x: 0.76, y: 0.88 }, { x: 0.76, y: 0.12 }] }
  ],
  'O': [
    { id: 'O1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.35 }, { x: 0.18, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.82, y: 0.65 }, { x: 0.82, y: 0.35 }, { x: 0.50, y: 0.12 }] }
  ],
  'P': [
    { id: 'P1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'P2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.82, y: 0.12 }, { x: 0.82, y: 0.52 }, { x: 0.28, y: 0.52 }] }
  ],
  'Q': [
    { id: 'Q1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.18, y: 0.35 }, { x: 0.18, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.82, y: 0.65 }, { x: 0.82, y: 0.35 }, { x: 0.50, y: 0.12 }] },
    { id: 'Q2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.56, y: 0.68 }, { x: 0.85, y: 0.92 }] }
  ],
  'R': [
    { id: 'R1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'R2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.12 }, { x: 0.80, y: 0.12 }, { x: 0.80, y: 0.50 }, { x: 0.28, y: 0.50 }] },
    { id: 'R3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.48, y: 0.50 }, { x: 0.80, y: 0.88 }] }
  ],
  'S': [
    { id: 'S1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.78, y: 0.24 }, { x: 0.50, y: 0.12 }, { x: 0.22, y: 0.30 }, { x: 0.50, y: 0.50 }, { x: 0.78, y: 0.70 }, { x: 0.50, y: 0.88 }, { x: 0.22, y: 0.76 }] }
  ],
  'T': [
    { id: 'T1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.18, y: 0.12 }, { x: 0.82, y: 0.12 }] },
    { id: 'T2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] }
  ],
  'U': [
    { id: 'U1', label: '1', arrow: '∪', type: 'curve', pts: [{ x: 0.24, y: 0.12 }, { x: 0.24, y: 0.68 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.68 }, { x: 0.76, y: 0.12 }] }
  ],
  'V': [
    { id: 'V1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.20, y: 0.12 }, { x: 0.50, y: 0.88 }] },
    { id: 'V2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.50, y: 0.88 }, { x: 0.80, y: 0.12 }] }
  ],
  'W': [
    { id: 'W1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.14, y: 0.12 }, { x: 0.32, y: 0.88 }] },
    { id: 'W2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.32, y: 0.88 }, { x: 0.50, y: 0.40 }] },
    { id: 'W3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.40 }, { x: 0.68, y: 0.88 }] },
    { id: 'W4', label: '4', arrow: '↗', type: 'line', pts: [{ x: 0.68, y: 0.88 }, { x: 0.86, y: 0.12 }] }
  ],
  'X': [
    { id: 'X1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.22, y: 0.14 }, { x: 0.78, y: 0.86 }] },
    { id: 'X2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.78, y: 0.14 }, { x: 0.22, y: 0.86 }] }
  ],
  'Y': [
    { id: 'Y1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.20, y: 0.12 }, { x: 0.50, y: 0.50 }] },
    { id: 'Y2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.80, y: 0.12 }, { x: 0.50, y: 0.50 }] },
    { id: 'Y3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.50 }, { x: 0.50, y: 0.88 }] }
  ],
  'Z': [
    { id: 'Z1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.22, y: 0.14 }, { x: 0.78, y: 0.14 }] },
    { id: 'Z2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.78, y: 0.14 }, { x: 0.22, y: 0.86 }] },
    { id: 'Z3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.22, y: 0.86 }, { x: 0.78, y: 0.86 }] }
  ]
};

// Puntos clave normalizados para cada letra minúscula
const LOWERCASE_STROKES = {
  'a': [
    { id: 'a1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.70, y: 0.50 }, { x: 0.44, y: 0.40 }, { x: 0.24, y: 0.65 }, { x: 0.44, y: 0.88 }, { x: 0.70, y: 0.75 }] },
    { id: 'a2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.70, y: 0.42 }, { x: 0.70, y: 0.88 }] }
  ],
  'b': [
    { id: 'b1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'b2', label: '2', arrow: '↻', type: 'curve', pts: [{ x: 0.28, y: 0.52 }, { x: 0.74, y: 0.44 }, { x: 0.74, y: 0.86 }, { x: 0.28, y: 0.88 }] }
  ],
  'c': [
    { id: 'c1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.74, y: 0.50 }, { x: 0.48, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.48, y: 0.88 }, { x: 0.74, y: 0.78 }] }
  ],
  'd': [
    { id: 'd1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.50 }, { x: 0.46, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.46, y: 0.88 }, { x: 0.72, y: 0.75 }] },
    { id: 'd2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.72, y: 0.12 }, { x: 0.72, y: 0.88 }] }
  ],
  'e': [
    { id: 'e1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.64 }, { x: 0.72, y: 0.64 }] },
    { id: 'e2', label: '2', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.64 }, { x: 0.50, y: 0.40 }, { x: 0.24, y: 0.64 }, { x: 0.48, y: 0.88 }, { x: 0.74, y: 0.80 }] }
  ],
  'f': [
    { id: 'f1', label: '1', arrow: '↓', type: 'curve', pts: [{ x: 0.68, y: 0.18 }, { x: 0.46, y: 0.12 }, { x: 0.42, y: 0.40 }, { x: 0.42, y: 0.88 }] },
    { id: 'f2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.24, y: 0.46 }, { x: 0.64, y: 0.46 }] }
  ],
  'g': [
    { id: 'g1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.70, y: 0.50 }, { x: 0.44, y: 0.40 }, { x: 0.24, y: 0.65 }, { x: 0.44, y: 0.86 }, { x: 0.70, y: 0.75 }] },
    { id: 'g2', label: '2', arrow: '↓', type: 'curve', pts: [{ x: 0.70, y: 0.42 }, { x: 0.70, y: 0.94 }, { x: 0.48, y: 1.05 }, { x: 0.26, y: 0.96 }] }
  ],
  'h': [
    { id: 'h1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.12 }, { x: 0.28, y: 0.88 }] },
    { id: 'h2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.58 }, { x: 0.50, y: 0.40 }, { x: 0.72, y: 0.56 }, { x: 0.72, y: 0.88 }] }
  ],
  'i': [
    { id: 'i1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.42 }, { x: 0.50, y: 0.88 }] },
    { id: 'i2', label: '•', arrow: '•', type: 'dot', isDot: true, pts: [{ x: 0.50, y: 0.24 }] }
  ],
  'j': [
    { id: 'j1', label: '1', arrow: '↓', type: 'curve', pts: [{ x: 0.58, y: 0.42 }, { x: 0.58, y: 0.94 }, { x: 0.42, y: 1.05 }, { x: 0.26, y: 0.96 }] },
    { id: 'j2', label: '•', arrow: '•', type: 'dot', isDot: true, pts: [{ x: 0.58, y: 0.24 }] }
  ],
  'k': [
    { id: 'k1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.30, y: 0.12 }, { x: 0.30, y: 0.88 }] },
    { id: 'k2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.72, y: 0.44 }, { x: 0.34, y: 0.65 }] },
    { id: 'k3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.34, y: 0.65 }, { x: 0.72, y: 0.88 }] }
  ],
  'l': [
    { id: 'l1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.12 }, { x: 0.50, y: 0.88 }] }
  ],
  'm': [
    { id: 'm1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.20, y: 0.42 }, { x: 0.20, y: 0.88 }] },
    { id: 'm2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.20, y: 0.58 }, { x: 0.36, y: 0.40 }, { x: 0.50, y: 0.56 }, { x: 0.50, y: 0.88 }] },
    { id: 'm3', label: '3', arrow: '↷', type: 'curve', pts: [{ x: 0.50, y: 0.58 }, { x: 0.66, y: 0.40 }, { x: 0.80, y: 0.56 }, { x: 0.80, y: 0.88 }] }
  ],
  'n': [
    { id: 'n1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.42 }, { x: 0.28, y: 0.88 }] },
    { id: 'n2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.58 }, { x: 0.50, y: 0.40 }, { x: 0.74, y: 0.56 }, { x: 0.74, y: 0.88 }] }
  ],
  'o': [
    { id: 'o1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.40 }, { x: 0.24, y: 0.52 }, { x: 0.24, y: 0.76 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.76 }, { x: 0.76, y: 0.52 }, { x: 0.50, y: 0.40 }] }
  ],
  'p': [
    { id: 'p1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.28, y: 0.42 }, { x: 0.28, y: 1.05 }] },
    { id: 'p2', label: '2', arrow: '↻', type: 'curve', pts: [{ x: 0.28, y: 0.52 }, { x: 0.74, y: 0.44 }, { x: 0.74, y: 0.84 }, { x: 0.28, y: 0.88 }] }
  ],
  'q': [
    { id: 'q1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.50 }, { x: 0.46, y: 0.40 }, { x: 0.26, y: 0.65 }, { x: 0.46, y: 0.86 }, { x: 0.72, y: 0.75 }] },
    { id: 'q2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.72, y: 0.42 }, { x: 0.72, y: 1.05 }] }
  ],
  'r': [
    { id: 'r1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.30, y: 0.42 }, { x: 0.30, y: 0.88 }] },
    { id: 'r2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.30, y: 0.58 }, { x: 0.48, y: 0.40 }, { x: 0.72, y: 0.46 }] }
  ],
  's': [
    { id: 's1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.74, y: 0.50 }, { x: 0.50, y: 0.40 }, { x: 0.26, y: 0.54 }, { x: 0.50, y: 0.66 }, { x: 0.74, y: 0.78 }, { x: 0.50, y: 0.88 }, { x: 0.26, y: 0.80 }] }
  ],
  't': [
    { id: 't1', label: '1', arrow: '↓', type: 'curve', pts: [{ x: 0.48, y: 0.20 }, { x: 0.48, y: 0.78 }, { x: 0.68, y: 0.88 }] },
    { id: 't2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.28, y: 0.45 }, { x: 0.68, y: 0.45 }] }
  ],
  'u': [
    { id: 'u1', label: '1', arrow: '∪', type: 'curve', pts: [{ x: 0.26, y: 0.42 }, { x: 0.26, y: 0.72 }, { x: 0.50, y: 0.88 }, { x: 0.74, y: 0.72 }, { x: 0.74, y: 0.42 }] },
    { id: 'u2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.74, y: 0.42 }, { x: 0.74, y: 0.88 }] }
  ],
  'v': [
    { id: 'v1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.42 }, { x: 0.50, y: 0.88 }] },
    { id: 'v2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.50, y: 0.88 }, { x: 0.74, y: 0.42 }] }
  ],
  'w': [
    { id: 'w1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.16, y: 0.42 }, { x: 0.34, y: 0.88 }] },
    { id: 'w2', label: '2', arrow: '↗', type: 'line', pts: [{ x: 0.34, y: 0.88 }, { x: 0.50, y: 0.60 }] },
    { id: 'w3', label: '3', arrow: '↘', type: 'line', pts: [{ x: 0.50, y: 0.60 }, { x: 0.66, y: 0.88 }] },
    { id: 'w4', label: '4', arrow: '↗', type: 'line', pts: [{ x: 0.66, y: 0.88 }, { x: 0.84, y: 0.42 }] }
  ],
  'x': [
    { id: 'x1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.44 }, { x: 0.74, y: 0.86 }] },
    { id: 'x2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.44 }, { x: 0.26, y: 0.86 }] }
  ],
  'y': [
    { id: 'y1', label: '1', arrow: '↘', type: 'line', pts: [{ x: 0.26, y: 0.42 }, { x: 0.50, y: 0.72 }] },
    { id: 'y2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.42 }, { x: 0.28, y: 1.05 }] }
  ],
  'z': [
    { id: 'z1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.44 }, { x: 0.74, y: 0.44 }] },
    { id: 'z2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.74, y: 0.44 }, { x: 0.26, y: 0.86 }] },
    { id: 'z3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.86 }, { x: 0.74, y: 0.86 }] }
  ]
};

// Puntos clave normalizados para los dígitos numéricos (0 - 9)
const NUMBER_STROKES = {
  '0': [
    { id: 'N0_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.50, y: 0.12 }, { x: 0.22, y: 0.35 }, { x: 0.22, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.78, y: 0.65 }, { x: 0.78, y: 0.35 }, { x: 0.50, y: 0.12 }] }
  ],
  '1': [
    { id: 'N1_1', label: '1', arrow: '↗', type: 'line', pts: [{ x: 0.32, y: 0.35 }, { x: 0.50, y: 0.14 }] },
    { id: 'N1_2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.14 }, { x: 0.50, y: 0.88 }] }
  ],
  '2': [
    { id: 'N2_1', label: '1', arrow: '↷', type: 'curve', pts: [{ x: 0.26, y: 0.32 }, { x: 0.50, y: 0.12 }, { x: 0.76, y: 0.30 }, { x: 0.26, y: 0.88 }] },
    { id: 'N2_2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.26, y: 0.88 }, { x: 0.78, y: 0.88 }] }
  ],
  '3': [
    { id: 'N3_1', label: '1', arrow: '↷', type: 'curve', pts: [{ x: 0.28, y: 0.22 }, { x: 0.50, y: 0.12 }, { x: 0.74, y: 0.28 }, { x: 0.50, y: 0.48 }] },
    { id: 'N3_2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.50, y: 0.48 }, { x: 0.78, y: 0.65 }, { x: 0.50, y: 0.88 }, { x: 0.26, y: 0.78 }] }
  ],
  '4': [
    { id: 'N4_1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.65, y: 0.12 }, { x: 0.24, y: 0.60 }] },
    { id: 'N4_2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.24, y: 0.60 }, { x: 0.82, y: 0.60 }] },
    { id: 'N4_3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.65, y: 0.12 }, { x: 0.65, y: 0.88 }] }
  ],
  '5': [
    { id: 'N5_1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.36, y: 0.14 }, { x: 0.34, y: 0.48 }] },
    { id: 'N5_2', label: '2', arrow: '↷', type: 'curve', pts: [{ x: 0.34, y: 0.48 }, { x: 0.78, y: 0.54 }, { x: 0.76, y: 0.82 }, { x: 0.30, y: 0.86 }] },
    { id: 'N5_3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.36, y: 0.14 }, { x: 0.74, y: 0.14 }] }
  ],
  '6': [
    { id: 'N6_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.72, y: 0.22 }, { x: 0.36, y: 0.40 }, { x: 0.24, y: 0.68 }, { x: 0.50, y: 0.88 }, { x: 0.76, y: 0.68 }, { x: 0.48, y: 0.52 }, { x: 0.26, y: 0.68 }] }
  ],
  '7': [
    { id: 'N7_1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.22, y: 0.14 }, { x: 0.78, y: 0.14 }] },
    { id: 'N7_2', label: '2', arrow: '↙', type: 'line', pts: [{ x: 0.78, y: 0.14 }, { x: 0.38, y: 0.88 }] }
  ],
  '8': [
    { id: 'N8_1', label: '1', arrow: '♾', type: 'curve', pts: [{ x: 0.50, y: 0.50 }, { x: 0.28, y: 0.32 }, { x: 0.50, y: 0.12 }, { x: 0.72, y: 0.32 }, { x: 0.50, y: 0.50 }, { x: 0.26, y: 0.70 }, { x: 0.50, y: 0.88 }, { x: 0.74, y: 0.70 }, { x: 0.50, y: 0.50 }] }
  ],
  '9': [
    { id: 'N9_1', label: '1', arrow: '↺', type: 'curve', pts: [{ x: 0.74, y: 0.48 }, { x: 0.48, y: 0.12 }, { x: 0.24, y: 0.32 }, { x: 0.50, y: 0.52 }, { x: 0.74, y: 0.48 }] },
    { id: 'N9_2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.74, y: 0.48 }, { x: 0.74, y: 0.88 }] }
  ]
};

// Patrones de grafomotricidad preescolar (trazos preparatorios SEP)
const PATTERN_STROKES = {
  'lineas_verticales': [
    { id: 'PV1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.25, y: 0.15 }, { x: 0.25, y: 0.85 }] },
    { id: 'PV2', label: '2', arrow: '↓', type: 'line', pts: [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.85 }] },
    { id: 'PV3', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.75, y: 0.15 }, { x: 0.75, y: 0.85 }] }
  ],
  'lineas_horizontales': [
    { id: 'PH1', label: '1', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.25 }, { x: 0.85, y: 0.25 }] },
    { id: 'PH2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.50 }, { x: 0.85, y: 0.50 }] },
    { id: 'PH3', label: '3', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.75 }, { x: 0.85, y: 0.75 }] }
  ],
  'cruces': [
    { id: 'PC1_V', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.30, y: 0.20 }, { x: 0.30, y: 0.80 }] },
    { id: 'PC1_H', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.15, y: 0.50 }, { x: 0.45, y: 0.50 }] },
    { id: 'PC2_V', label: '3', arrow: '↓', type: 'line', pts: [{ x: 0.70, y: 0.20 }, { x: 0.70, y: 0.80 }] },
    { id: 'PC2_H', label: '4', arrow: '➔', type: 'line', pts: [{ x: 0.55, y: 0.50 }, { x: 0.85, y: 0.50 }] }
  ],
  'olas_mar': [
    { id: 'PO1', label: '1', arrow: '〰️', type: 'curve', pts: [{ x: 0.10, y: 0.65 }, { x: 0.25, y: 0.30 }, { x: 0.40, y: 0.65 }, { x: 0.55, y: 0.30 }, { x: 0.70, y: 0.65 }, { x: 0.85, y: 0.30 }] }
  ],
  'montañas_zigzag': [
    { id: 'PZ1', label: '1', arrow: '↗', type: 'line', pts: [{ x: 0.10, y: 0.75 }, { x: 0.25, y: 0.25 }] },
    { id: 'PZ2', label: '2', arrow: '↘', type: 'line', pts: [{ x: 0.25, y: 0.25 }, { x: 0.40, y: 0.75 }] },
    { id: 'PZ3', label: '3', arrow: '↗', type: 'line', pts: [{ x: 0.40, y: 0.75 }, { x: 0.55, y: 0.25 }] },
    { id: 'PZ4', label: '4', arrow: '↘', type: 'line', pts: [{ x: 0.55, y: 0.25 }, { x: 0.70, y: 0.75 }] },
    { id: 'PZ5', label: '5', arrow: '↗', type: 'line', pts: [{ x: 0.70, y: 0.75 }, { x: 0.85, y: 0.25 }] }
  ],
  'espiral': [
    { id: 'PE1', label: '1', arrow: '🌀', type: 'curve', pts: [{ x: 0.50, y: 0.50 }, { x: 0.58, y: 0.50 }, { x: 0.58, y: 0.38 }, { x: 0.40, y: 0.38 }, { x: 0.40, y: 0.62 }, { x: 0.68, y: 0.62 }, { x: 0.68, y: 0.28 }, { x: 0.30, y: 0.28 }, { x: 0.30, y: 0.74 }, { x: 0.80, y: 0.74 }] }
  ]
};

// ============================================================================
// CLASE PRINCIPAL: STROKE GENERATOR
// ============================================================================
class StrokeGenerator {
  /**
   * Obtiene los trazos exactos de cualquier caracter (mayúscula, minúscula, dígito o patrón).
   * Los devuelve escalados al rectángulo especificado { x, y, width, height }.
   */
  static getStrokes(charOrKey, bounds = { x: 0, y: 0, width: 760, height: 420 }, isUpper = null) {
    let raw = null;
    const str = String(charOrKey || 'A');

    // 1. Patrón de grafomotricidad
    if (PATTERN_STROKES[str]) {
      raw = PATTERN_STROKES[str];
    }
    // 2. Dígito numérico
    else if (NUMBER_STROKES[str]) {
      raw = NUMBER_STROKES[str];
    }
    // 3. Letra (decidir mayúscula o minúscula)
    else {
      const forceUpper = (isUpper === true) || (isUpper === null && str === str.toUpperCase() && str !== str.toLowerCase());
      const charUpper = str.toUpperCase();
      const charLower = str.toLowerCase();

      if (forceUpper && UPPERCASE_STROKES[charUpper]) {
        raw = UPPERCASE_STROKES[charUpper];
      } else if (!forceUpper && LOWERCASE_STROKES[charLower]) {
        raw = LOWERCASE_STROKES[charLower];
      } else if (UPPERCASE_STROKES[charUpper]) {
        raw = UPPERCASE_STROKES[charUpper];
      } else {
        // Fallback genérico para caracteres especiales o acentos (á -> a)
        const unaccented = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (UPPERCASE_STROKES[unaccented.toUpperCase()]) {
          raw = forceUpper ? UPPERCASE_STROKES[unaccented.toUpperCase()] : LOWERCASE_STROKES[unaccented.toLowerCase()];
        }
      }
    }

    if (!raw) {
      // Fallback seguro: Trazo de caja escolar
      raw = [
        { id: 'FB1', label: '1', arrow: '↓', type: 'line', pts: [{ x: 0.25, y: 0.15 }, { x: 0.25, y: 0.85 }] },
        { id: 'FB2', label: '2', arrow: '➔', type: 'line', pts: [{ x: 0.25, y: 0.85 }, { x: 0.75, y: 0.85 }] }
      ];
    }

    // Escalar los puntos normalizados al bounding box
    const { x: bx, y: by, width: bw, height: bh } = bounds;

    return raw.map((stroke, sIdx) => {
      const scaledPts = stroke.pts.map(p => ({
        x: bx + p.x * bw,
        y: by + p.y * bh
      }));

      // Generar checkpoints densos cada ~14 píxeles para detección precisa
      const checkpoints = this.interpolatePolyline(scaledPts, stroke.type === 'curve' ? 12 : 15);

      return {
        id: stroke.id || `S_${sIdx}`,
        label: stroke.label || `${sIdx + 1}`,
        arrow: stroke.arrow || '↓',
        isDot: !!stroke.isDot,
        type: stroke.type || 'line',
        rawPoints: scaledPts,
        points: scaledPts,
        checkpoints: checkpoints,
        totalPoints: checkpoints.length,
        startPoint: scaledPts[0],
        endPoint: scaledPts[scaledPts.length - 1],
        minDistance: Math.max(35, checkpoints.length * 8)
      };
    });
  }

  /**
   * Genera un diseño de renglón con múltiples letras (ej. 'JUAN CARLOS' o 'A A A A')
   */
  static generateRowLayout(chars, bounds = { x: 0, y: 0, width: 760, height: 420 }, options = {}) {
    const list = Array.isArray(chars) ? chars : String(chars).split('');
    const count = list.length;
    if (count === 0) return [];

    const stepW = bounds.width / count;
    const padding = stepW * 0.08;
    const letterW = stepW - (padding * 2);
    const letterH = bounds.height;

    const rowLetters = [];

    list.forEach((ch, idx) => {
      const isSpace = (ch === ' ');
      const lx = bounds.x + (idx * stepW) + padding;
      const ly = bounds.y;
      const subBounds = { x: lx, y: ly, width: letterW, height: letterH };

      const strokes = isSpace ? [] : this.getStrokes(ch, subBounds, options.isUpper);

      rowLetters.push({
        index: idx,
        char: ch,
        isSpace: isSpace,
        bounds: subBounds,
        cx: lx + letterW / 2,
        cy: ly + letterH / 2,
        strokes: strokes,
        completed: isSpace
      });
    });

    return rowLetters;
  }

  /**
   * Interpola puntos a lo largo de una polilínea o curva de Bezier
   */
  static interpolatePolyline(points, stepDistance = 14) {
    if (!points || points.length === 0) return [];
    if (points.length === 1) return [{ x: points[0].x, y: points[0].y, hit: false }];

    const checkpoints = [];

    // Interpolación por tramos de segmentos lineales o spline suave
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const steps = Math.max(1, Math.round(dist / stepDistance));

      for (let s = (i === 0 ? 0 : 1); s <= steps; s++) {
        const t = s / steps;
        checkpoints.push({
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t,
          hit: false
        });
      }
    }

    return checkpoints;
  }

  /**
   * Evalúa el progreso del trazo con alta tolerancia motriz preescolar.
   * Devuelve { isComplete, progress, newHits }
   */
  static checkStrokeProgress(strokeData, cursorPt, stepDist, hitRadius = 32) {
    if (strokeData.completed) return { isComplete: true, progress: 1.0, newHits: 0 };

    // Caso especial: Punto de la letra 'i' o 'j'
    if (strokeData.isDot) {
      const sp = strokeData.startPoint;
      if (Math.hypot(cursorPt.x - sp.x, cursorPt.y - sp.y) <= (hitRadius + 6)) {
        strokeData.completed = true;
        strokeData.hitCount = strokeData.totalPoints;
        return { isComplete: true, progress: 1.0, newHits: 1 };
      }
      return { isComplete: false, progress: 0.0, newHits: 0 };
    }

    let newlyHit = 0;
    const cps = strokeData.checkpoints;

    for (let i = 0; i < cps.length; i++) {
      const cp = cps[i];
      if (!cp.hit && Math.hypot(cursorPt.x - cp.x, cursorPt.y - cp.y) <= hitRadius) {
        cp.hit = true;
        newlyHit++;
      }
    }

    strokeData.hitCount = (strokeData.hitCount || 0) + newlyHit;
    strokeData.distanceDrawn = (strokeData.distanceDrawn || 0) + stepDist;

    const coverage = strokeData.hitCount / Math.max(1, strokeData.totalPoints);
    const distMet = strokeData.distanceDrawn >= Math.max(28, strokeData.minDistance * 0.7);

    // El niño debe haber cubierto al menos el 60% de los puntos y una distancia mínima de arrastre
    // Además haber pasado cerca del inicio (primeros puntos) y del final
    const startTouched = cps[0]?.hit || cps[1]?.hit || cps[2]?.hit;
    const endTouched = cps[cps.length - 1]?.hit || cps[cps.length - 2]?.hit || cps[cps.length - 3]?.hit;

    if (coverage >= 0.60 && distMet && startTouched && endTouched) {
      strokeData.completed = true;
      return { isComplete: true, progress: 1.0, newHits: newlyHit };
    }

    return { isComplete: false, progress: coverage, newHits: newlyHit };
  }

  /**
   * Dibuja las guías punteadas escolares y las insignias de inicio numeradas
   */
  static renderStrokeGuides(ctx, strokes, activeIndex = 0, themeColor = '#1565c0') {
    if (!ctx || !strokes) return;

    strokes.forEach((stroke, idx) => {
      const isActive = (idx === activeIndex);
      const isDone = !!stroke.completed;
      const pts = stroke.rawPoints;

      ctx.save();

      // 1. Línea punteada guía
      ctx.beginPath();
      ctx.lineWidth = isActive ? 5 : 3.5;
      ctx.setLineDash(isActive ? [8, 6] : [6, 6]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = isDone ? '#4caf50' : (isActive ? '#ff7043' : 'rgba(84, 110, 122, 0.55)');

      pts.forEach((p, pIdx) => {
        if (pIdx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Punto especial de la 'i'
      if (stroke.isDot) {
        ctx.setLineDash([]);
        ctx.fillStyle = isDone ? '#4caf50' : (isActive ? '#ff7043' : '#546e7a');
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Insignia circular numerada con flecha de inicio
      if (!isDone && pts.length > 0) {
        const start = pts[0];
        const r = isActive ? 15 : 12;

        // Círculo base con relieve
        ctx.setLineDash([]);
        ctx.fillStyle = isActive ? '#ff5722' : '#ffffff';
        ctx.shadowColor = isActive ? 'rgba(255, 87, 34, 0.6)' : 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = isActive ? 10 : 4;
        ctx.beginPath();
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isActive ? '#ffffff' : '#37474f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Número
        ctx.fillStyle = isActive ? '#ffffff' : '#263238';
        ctx.font = `900 ${isActive ? 13 : 11}px "Fredoka", "Comic Sans MS", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stroke.label, start.x, start.y);

        // Flecha direccional junto a la insignia
        if (pts.length >= 2 && !stroke.isDot) {
          const next = pts[1];
          const ang = Math.atan2(next.y - start.y, next.x - start.x);
          const arrowDist = r + 9;
          const ax = start.x + Math.cos(ang) * arrowDist;
          const ay = start.y + Math.sin(ang) * arrowDist;

          ctx.save();
          ctx.fillStyle = isActive ? '#ff5722' : '#546e7a';
          ctx.translate(ax, ay);
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(-4, -5);
          ctx.lineTo(-4, 5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
    });
  }

  /**
   * Renderiza el trazo completado con acabado de crayón sólido luminoso
   */
  static renderCompletedStroke(ctx, stroke, color = '#2e7d32') {
    if (!ctx || !stroke) return;
    const pts = stroke.rawPoints;
    if (!pts || pts.length === 0) return;

    ctx.save();
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    if (stroke.isDot) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      pts.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renderiza una guía de animación suave (estrellita viajera) para mostrar al niño el camino
   */
  static renderAnimatedPointer(ctx, stroke, t) {
    if (!ctx || !stroke || stroke.completed || stroke.isDot) return;
    const cps = stroke.checkpoints;
    if (!cps || cps.length === 0) return;

    const idx = Math.min(Math.floor(t * cps.length), cps.length - 1);
    const pt = cps[idx];
    if (!pt) return;

    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffab00';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pequeño aro pulsante
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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

/**
 * Catálogo pedagógico completo de letras con mayúscula, minúscula,
 * trazos direccionales, flechas numeradas y objeto sorpresa ilustrado.
 * Todas las coordenadas están exactamente normalizadas para el lienzo 760x420
 * garantizando cero desfases entre contorno hueco, líneas punteadas y waypoints.
 */
const PEDAGOGICAL_LETTERS = {
  'A': {
    letter: 'A',
    lowercase: 'a',
    word: 'ÁRBOL',
    phonetic: 'A de Árbol',
    icon: '🌳',
    tutorialStrokes: [
      { name: 'Paso 1: Diagonal Izquierda', from: { x: 0.1974, y: 0.1786 }, to: { x: 0.1026, y: 0.7738 } },
      { name: 'Paso 2: Diagonal Derecha', from: { x: 0.1974, y: 0.1786 }, to: { x: 0.2921, y: 0.7738 } },
      { name: 'Paso 3: Barra Central', from: { x: 0.1382, y: 0.5476 }, to: { x: 0.2566, y: 0.5476 } }
    ],
    uppercaseStrokes: [
      {
        id: 'A1',
        step: 1,
        arrow: '↙',
        label: '1',
        description: 'Diagonal izquierda de arriba a abajo',
        points: [
          { x: 0.1974, y: 0.1786 },
          { x: 0.1500, y: 0.4762 },
          { x: 0.1026, y: 0.7738 }
        ]
      },
      {
        id: 'A2',
        step: 2,
        arrow: '↘',
        label: '2',
        description: 'Diagonal derecha de arriba a abajo',
        points: [
          { x: 0.1974, y: 0.1786 },
          { x: 0.2447, y: 0.4762 },
          { x: 0.2921, y: 0.7738 }
        ]
      },
      {
        id: 'A3',
        step: 3,
        arrow: '➔',
        label: '3',
        description: 'Barra central de izquierda a derecha',
        points: [
          { x: 0.1382, y: 0.5476 },
          { x: 0.1974, y: 0.5476 },
          { x: 0.2566, y: 0.5476 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'a1',
        step: 1,
        arrow: '↺',
        label: '1',
        description: 'Círculo redondito antihorario',
        points: [
          { x: 0.5447, y: 0.5238 },
          { x: 0.4868, y: 0.4905 },
          { x: 0.4289, y: 0.5952 },
          { x: 0.4868, y: 0.7000 },
          { x: 0.5447, y: 0.6310 }
        ]
      },
      {
        id: 'a2',
        step: 2,
        arrow: '↓',
        label: '2',
        description: 'Poste vertical hacia abajo',
        points: [
          { x: 0.5447, y: 0.4167 },
          { x: 0.5447, y: 0.5952 },
          { x: 0.5447, y: 0.7738 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="notebook-tree-svg" viewBox="0 0 240 280" width="100%" height="100%">
        <!-- Copa frondosa estilo nube con espirales interiores (idéntica a la imagen del cuadernillo) -->
        <g class="tree-canopy-art">
          <path class="tree-canopy-outline"
                d="M 50 145 
                   C 32 140 22 120 28 100 
                   C 22 85 30 65 48 58 
                   C 45 42 60 25 78 24 
                   C 90 12 115 10 130 20 
                   C 145 10 170 14 182 28 
                   C 198 25 215 38 218 55 
                   C 230 70 228 92 218 108 
                   C 226 125 218 145 200 152 
                   C 205 168 192 185 175 188 
                   C 160 190 148 182 142 172 
                   C 135 178 122 180 115 174 
                   C 108 182 92 182 82 174 
                   C 75 185 58 185 48 172 
                   C 38 165 42 152 50 145 Z" />

          <!-- Espirales decorativos dentro de los lóbulos de la copa -->
          <path class="tree-spiral" d="M 72 45 C 65 45 62 52 66 58 C 72 62 78 55 75 48 C 72 44 65 46 63 50" />
          <path class="tree-spiral" d="M 125 32 C 118 32 114 38 118 45 C 124 50 132 42 128 35 C 124 30 116 32 113 38" />
          <path class="tree-spiral" d="M 185 48 C 178 48 174 55 178 62 C 185 68 194 58 190 50 C 185 45 176 48 174 54" />
          <path class="tree-spiral" d="M 45 105 C 38 105 35 112 39 118 C 45 122 52 115 48 108" />
          <path class="tree-spiral" d="M 198 115 C 205 115 208 122 204 128 C 198 132 191 125 195 118" />
        </g>

        <!-- Tronco con ramas bifurcadas y vetas de madera -->
        <g class="tree-trunk-art">
          <path class="tree-trunk-outline"
                d="M 100 270 
                   C 105 240 102 210 95 180 
                   C 90 160 75 145 60 135 
                   C 68 140 76 150 82 165
                   C 86 150 94 130 96 110
                   C 102 125 106 142 108 160
                   C 112 165 116 168 122 170
                   C 128 150 136 125 152 105
                   C 150 125 148 145 142 165
                   C 152 148 165 138 180 132
                   C 168 145 155 162 148 180
                   C 138 210 135 240 140 270 
                   Z" />

          <!-- Nudo de madera con espiral en la base izquierda -->
          <ellipse class="tree-wood-knot" cx="112" cy="225" rx="8" ry="14" />
          <path class="tree-wood-spiral" d="M 112 218 C 117 218 118 228 113 232 C 109 235 107 226 111 224" />

          <!-- Vetas onduladas de la corteza -->
          <path class="tree-grain" d="M 103 265 C 106 245 105 210 101 190" />
          <path class="tree-grain" d="M 125 265 C 126 235 125 200 128 185" />
          <path class="tree-grain" d="M 134 265 C 132 245 130 220 135 195" />
          <path class="tree-grain" d="M 98 155 C 96 140 92 125 88 118" />
          <path class="tree-grain" d="M 140 155 C 144 140 148 125 154 115" />
        </g>

        <!-- Gradientes para cuando se colorea -->
        <defs>
          <linearGradient id="notebookWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#5d4037"/>
            <stop offset="50%" stop-color="#795548"/>
            <stop offset="100%" stop-color="#4e342e"/>
          </linearGradient>
          <linearGradient id="notebookCanopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#66bb6a"/>
            <stop offset="50%" stop-color="#43a047"/>
            <stop offset="100%" stop-color="#2e7d32"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },
  'E': {
    letter: 'E',
    lowercase: 'e',
    word: 'ELEFANTE',
    phonetic: 'E de Elefante',
    icon: '🐘',
    tutorialStrokes: [
      { name: 'Paso 1: Poste Vertical', from: { x: 0.1184, y: 0.1786 }, to: { x: 0.1184, y: 0.7738 } },
      { name: 'Paso 2: Barra Superior', from: { x: 0.1184, y: 0.1786 }, to: { x: 0.2829, y: 0.1786 } },
      { name: 'Paso 3: Barra Central', from: { x: 0.1184, y: 0.4762 }, to: { x: 0.2566, y: 0.4762 } },
      { name: 'Paso 4: Barra Inferior', from: { x: 0.1184, y: 0.7738 }, to: { x: 0.2829, y: 0.7738 } }
    ],
    uppercaseStrokes: [
      {
        id: 'E1',
        step: 1,
        arrow: '↓',
        label: '1',
        description: 'Poste vertical hacia abajo',
        points: [
          { x: 0.1184, y: 0.1786 },
          { x: 0.1184, y: 0.4762 },
          { x: 0.1184, y: 0.7738 }
        ]
      },
      {
        id: 'E2',
        step: 2,
        arrow: '➔',
        label: '2',
        description: 'Barra superior de izquierda a derecha',
        points: [
          { x: 0.1184, y: 0.1786 },
          { x: 0.2000, y: 0.1786 },
          { x: 0.2829, y: 0.1786 }
        ]
      },
      {
        id: 'E3',
        step: 3,
        arrow: '➔',
        label: '3',
        description: 'Barra central de izquierda a derecha',
        points: [
          { x: 0.1184, y: 0.4762 },
          { x: 0.1868, y: 0.4762 },
          { x: 0.2566, y: 0.4762 }
        ]
      },
      {
        id: 'E4',
        step: 4,
        arrow: '➔',
        label: '4',
        description: 'Barra inferior de izquierda a derecha',
        points: [
          { x: 0.1184, y: 0.7738 },
          { x: 0.2000, y: 0.7738 },
          { x: 0.2829, y: 0.7738 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'e1',
        step: 1,
        arrow: '➔',
        label: '1',
        description: 'Barra horizontal central',
        points: [
          { x: 0.4342, y: 0.5952 },
          { x: 0.4895, y: 0.5952 },
          { x: 0.5447, y: 0.5952 }
        ]
      },
      {
        id: 'e2',
        step: 2,
        arrow: '↺',
        label: '2',
        description: 'Arco y curva redonda de la e',
        points: [
          { x: 0.5447, y: 0.5952 },
          { x: 0.4868, y: 0.4905 },
          { x: 0.4289, y: 0.5952 },
          { x: 0.4868, y: 0.7000 },
          { x: 0.5395, y: 0.6548 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg elephant-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <ellipse cx="100" cy="205" rx="55" ry="10" fill="#cfd8dc"/>
        <ellipse cx="95" cy="140" rx="50" ry="42" fill="#78909c" stroke="#455a64" stroke-width="3"/>
        <circle cx="135" cy="110" r="32" fill="#78909c" stroke="#455a64" stroke-width="3"/>
        <ellipse cx="118" cy="115" rx="20" ry="26" fill="#90a4ae" stroke="#455a64" stroke-width="2.5"/>
        <path d="M 155 125 C 175 145 170 175 155 180 C 145 185 142 170 152 165 C 160 160 162 145 150 135 Z" fill="#78909c" stroke="#455a64" stroke-width="2.5"/>
        <circle cx="145" cy="102" r="4" fill="#263238"/>
        <circle cx="146.5" cy="100.5" r="1.5" fill="#ffffff"/>
        <rect x="65" y="165" width="16" height="38" rx="6" fill="#607d8b"/>
        <rect x="95" y="165" width="16" height="38" rx="6" fill="#607d8b"/>
        <rect x="120" y="165" width="16" height="38" rx="6" fill="#607d8b"/>
      </svg>
    `
  },
  'I': {
    letter: 'I',
    lowercase: 'i',
    word: 'ISLA',
    phonetic: 'I de Isla',
    icon: '🏝️',
    tutorialStrokes: [
      { name: 'Paso 1: Barra Superior', from: { x: 0.1250, y: 0.1786 }, to: { x: 0.2697, y: 0.1786 } },
      { name: 'Paso 2: Poste Central', from: { x: 0.1974, y: 0.1786 }, to: { x: 0.1974, y: 0.7738 } },
      { name: 'Paso 3: Barra Inferior', from: { x: 0.1250, y: 0.7738 }, to: { x: 0.2697, y: 0.7738 } }
    ],
    uppercaseStrokes: [
      {
        id: 'I1',
        step: 1,
        arrow: '➔',
        label: '1',
        description: 'Barra superior de izquierda a derecha',
        points: [
          { x: 0.1250, y: 0.1786 },
          { x: 0.1974, y: 0.1786 },
          { x: 0.2697, y: 0.1786 }
        ]
      },
      {
        id: 'I2',
        step: 2,
        arrow: '↓',
        label: '2',
        description: 'Poste central vertical hacia abajo',
        points: [
          { x: 0.1974, y: 0.1786 },
          { x: 0.1974, y: 0.4762 },
          { x: 0.1974, y: 0.7738 }
        ]
      },
      {
        id: 'I3',
        step: 3,
        arrow: '➔',
        label: '3',
        description: 'Barra inferior de izquierda a derecha',
        points: [
          { x: 0.1250, y: 0.7738 },
          { x: 0.1974, y: 0.7738 },
          { x: 0.2697, y: 0.7738 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'i1',
        step: 1,
        arrow: '↓',
        label: '1',
        description: 'Poste vertical minúscula hacia abajo',
        points: [
          { x: 0.4868, y: 0.4524 },
          { x: 0.4868, y: 0.6143 },
          { x: 0.4868, y: 0.7738 }
        ]
      },
      {
        id: 'i2',
        step: 2,
        arrow: '●',
        label: '2',
        isDot: true,
        description: 'Puntito de la i',
        points: [
          { x: 0.4868, y: 0.3214 },
          { x: 0.4868, y: 0.3250 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg island-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <ellipse cx="100" cy="180" rx="75" ry="25" fill="#ffe082" stroke="#ffb300" stroke-width="3"/>
        <path d="M 100 170 Q 110 110 90 70" stroke="#795548" stroke-width="8" stroke-linecap="round" fill="none"/>
        <ellipse cx="75" cy="55" rx="26" ry="10" fill="#4caf50" transform="rotate(-30 75 55)"/>
        <ellipse cx="105" cy="50" rx="26" ry="10" fill="#4caf50" transform="rotate(15 105 50)"/>
        <ellipse cx="80" cy="75" rx="22" ry="9" fill="#388e3c" transform="rotate(-65 80 75)"/>
        <ellipse cx="115" cy="70" rx="22" ry="9" fill="#388e3c" transform="rotate(45 115 70)"/>
      </svg>
    `
  },
  'O': {
    letter: 'O',
    lowercase: 'o',
    word: 'OSO',
    phonetic: 'O de Oso',
    icon: '🐻',
    tutorialStrokes: [
      { name: 'Paso 1: Círculo Completo', from: { x: 0.1974, y: 0.2143 }, to: { x: 0.1974, y: 0.7381 } }
    ],
    uppercaseStrokes: [
      {
        id: 'O1',
        step: 1,
        arrow: '↺',
        label: '1',
        description: 'Círculo grande completo antihorario',
        points: [
          { x: 0.1974, y: 0.2143 },
          { x: 0.1118, y: 0.4762 },
          { x: 0.1974, y: 0.7381 },
          { x: 0.2829, y: 0.4762 },
          { x: 0.1974, y: 0.2143 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'o1',
        step: 1,
        arrow: '↺',
        label: '1',
        description: 'Círculo pequeño completo antihorario',
        points: [
          { x: 0.4868, y: 0.4905 },
          { x: 0.4289, y: 0.5952 },
          { x: 0.4868, y: 0.7000 },
          { x: 0.5447, y: 0.5952 },
          { x: 0.4868, y: 0.4905 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg bear-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <circle cx="65" cy="75" r="16" fill="#6d4c41"/>
        <circle cx="65" cy="75" r="9" fill="#d7ccc8"/>
        <circle cx="135" cy="75" r="16" fill="#6d4c41"/>
        <circle cx="135" cy="75" r="9" fill="#d7ccc8"/>
        <circle cx="100" cy="115" r="48" fill="#795548" stroke="#4e342e" stroke-width="3"/>
        <ellipse cx="100" cy="128" rx="22" ry="16" fill="#d7ccc8"/>
        <ellipse cx="100" cy="120" rx="9" ry="6" fill="#3e2723"/>
        <circle cx="82" cy="105" r="4" fill="#212121"/>
        <circle cx="118" cy="105" r="4" fill="#212121"/>
      </svg>
    `
  },
  'U': {
    letter: 'U',
    lowercase: 'u',
    word: 'UVA',
    phonetic: 'U de Uva',
    icon: '🍇',
    tutorialStrokes: [
      { name: 'Paso 1: Curva de U', from: { x: 0.1184, y: 0.1786 }, to: { x: 0.2763, y: 0.1786 } }
    ],
    uppercaseStrokes: [
      {
        id: 'U1',
        step: 1,
        arrow: '↷',
        label: '1',
        description: 'Curva amplia de la U mayúscula',
        points: [
          { x: 0.1184, y: 0.1786 },
          { x: 0.1184, y: 0.5476 },
          { x: 0.1974, y: 0.7619 },
          { x: 0.2763, y: 0.5476 },
          { x: 0.2763, y: 0.1786 }
        ]
      }
    ],
    lowercaseStrokes: [
      {
        id: 'u1',
        step: 1,
        arrow: '↷',
        label: '1',
        description: 'Curva pequeña de la u minúscula',
        points: [
          { x: 0.4342, y: 0.4405 },
          { x: 0.4342, y: 0.6429 },
          { x: 0.4868, y: 0.7524 },
          { x: 0.5395, y: 0.6429 },
          { x: 0.5395, y: 0.4405 }
        ]
      },
      {
        id: 'u2',
        step: 2,
        arrow: '↓',
        label: '2',
        description: 'Poste vertical derecho de la u',
        points: [
          { x: 0.5395, y: 0.4405 },
          { x: 0.5395, y: 0.6000 },
          { x: 0.5395, y: 0.7619 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg grapes-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <path d="M 100 45 Q 105 25 125 20" stroke="#5d4037" stroke-width="4" stroke-linecap="round" fill="none"/>
        <ellipse cx="85" cy="40" rx="18" ry="10" fill="#4caf50" transform="rotate(-20 85 40)"/>
        <g fill="#7b1fa2" stroke="#4a148c" stroke-width="2">
          <circle cx="80" cy="70" r="14"/>
          <circle cx="102" cy="68" r="14"/>
          <circle cx="124" cy="70" r="14"/>
          <circle cx="91" cy="94" r="14"/>
          <circle cx="113" cy="94" r="14"/>
          <circle cx="102" cy="118" r="14"/>
        </g>
      </svg>
    `
  },
  'M': {
    letter: 'M',
    lowercase: 'm',
    word: 'MANZANA',
    phonetic: 'M de Manzana',
    icon: '🍎',
    getSurpriseSvg: () => `
      <svg class="surprise-svg apple-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <path d="M 100 45 Q 105 25 120 18" stroke="#5d4037" stroke-width="5" stroke-linecap="round" fill="none"/>
        <ellipse cx="118" cy="32" rx="16" ry="9" fill="#4caf50" transform="rotate(-30 118 32)"/>
        <path d="M 100 65 C 80 50 40 60 40 110 C 40 165 75 195 100 195 C 125 195 160 165 160 110 C 160 60 120 50 100 65 Z" fill="#e53935" stroke="#b71c1c" stroke-width="3"/>
        <ellipse cx="75" cy="95" rx="10" ry="18" fill="#ff8a80" opacity="0.6"/>
      </svg>
    `
  },
  'S': {
    letter: 'S',
    lowercase: 's',
    word: 'SOL',
    phonetic: 'S de Sol',
    icon: '☀️',
    getSurpriseSvg: () => `
      <svg class="surprise-svg sun-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <g stroke="#f57c00" stroke-width="4" stroke-linecap="round">
          <line x1="100" y1="25" x2="100" y2="45"/>
          <line x1="100" y1="175" x2="100" y2="195"/>
          <line x1="25" y1="110" x2="45" y2="110"/>
          <line x1="155" y1="110" x2="175" y2="110"/>
          <line x1="45" y1="55" x2="60" y2="70"/>
          <line x1="140" y1="150" x2="155" y2="165"/>
          <line x1="155" y1="55" x2="140" y2="70"/>
          <line x1="45" y1="165" x2="60" y2="150"/>
        </g>
        <circle cx="100" cy="110" r="50" fill="#fbc02d" stroke="#f57c00" stroke-width="3"/>
        <circle cx="85" cy="100" r="6" fill="#e65100"/>
        <circle cx="115" cy="100" r="6" fill="#e65100"/>
        <path d="M 85 122 Q 100 138 115 122" stroke="#e65100" stroke-width="4" fill="none" stroke-linecap="round"/>
      </svg>
    `
  },
  'T': {
    letter: 'T',
    lowercase: 't',
    word: 'TORTUGA',
    phonetic: 'T de Tortuga',
    icon: '🐢',
    getSurpriseSvg: () => `
      <svg class="surprise-svg turtle-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Patitas -->
        <ellipse cx="65" cy="85" rx="14" ry="10" fill="#81c784"/>
        <ellipse cx="135" cy="85" rx="14" ry="10" fill="#81c784"/>
        <ellipse cx="65" cy="145" rx="14" ry="10" fill="#81c784"/>
        <ellipse cx="135" cy="145" rx="14" ry="10" fill="#81c784"/>
        <!-- Cabeza -->
        <ellipse cx="100" cy="60" rx="16" ry="18" fill="#81c784" stroke="#388e3c" stroke-width="2"/>
        <circle cx="94" cy="55" r="3" fill="#1b5e20"/>
        <circle cx="106" cy="55" r="3" fill="#1b5e20"/>
        <!-- Caparazón -->
        <ellipse cx="100" cy="115" rx="45" ry="38" fill="#4caf50" stroke="#2e7d32" stroke-width="3"/>
        <polygon points="100,90 120,105 112,130 88,130 80,105" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/>
      </svg>
    `
  },
  'L': {
    letter: 'L',
    lowercase: 'l',
    word: 'LEÓN',
    phonetic: 'L de León',
    icon: '🦁',
    getSurpriseSvg: () => `
      <svg class="surprise-svg lion-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Melena -->
        <circle cx="100" cy="110" r="58" fill="#ff9800" stroke="#e65100" stroke-width="3"/>
        <!-- Cara -->
        <circle cx="100" cy="110" r="42" fill="#ffd54f" stroke="#f57f17" stroke-width="2.5"/>
        <circle cx="86" cy="100" r="5" fill="#3e2723"/>
        <circle cx="114" cy="100" r="5" fill="#3e2723"/>
        <polygon points="100,110 93,122 107,122" fill="#d84315"/>
        <path d="M 93 125 Q 100 132 107 125" stroke="#3e2723" stroke-width="3" fill="none"/>
      </svg>
    `
  },
  'P': {
    letter: 'P',
    lowercase: 'p',
    word: 'PELOTA',
    phonetic: 'P de Pelota',
    icon: '⚽',
    getSurpriseSvg: () => `
      <svg class="surprise-svg ball-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <circle cx="100" cy="110" r="52" fill="#ffffff" stroke="#212121" stroke-width="3"/>
        <polygon points="100,85 118,98 111,118 89,118 82,98" fill="#212121"/>
        <line x1="100" y1="85" x2="100" y2="58" stroke="#212121" stroke-width="2.5"/>
        <line x1="118" y1="98" x2="145" y2="90" stroke="#212121" stroke-width="2.5"/>
        <line x1="111" y1="118" x2="135" y2="142" stroke="#212121" stroke-width="2.5"/>
        <line x1="89" y1="118" x2="65" y2="142" stroke="#212121" stroke-width="2.5"/>
        <line x1="82" y1="98" x2="55" y2="90" stroke="#212121" stroke-width="2.5"/>
      </svg>
    `
  },
  'N': {
    letter: 'N',
    lowercase: 'n',
    word: 'NUBE',
    phonetic: 'N de Nube',
    icon: '☁️',
    getSurpriseSvg: () => `
      <svg class="surprise-svg cloud-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <path d="M 60 130 C 45 130 35 118 35 105 C 35 92 48 82 62 82 C 68 65 85 52 105 52 C 128 52 145 68 150 88 C 162 90 172 100 172 112 C 172 125 160 130 148 130 Z" fill="#e1f5fe" stroke="#0288d1" stroke-width="3"/>
        <circle cx="85" cy="98" r="4" fill="#0277bd"/>
        <circle cx="120" cy="98" r="4" fill="#0277bd"/>
        <path d="M 95 110 Q 102 118 110 110" stroke="#0277bd" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `
  },
  'R': {
    letter: 'R',
    lowercase: 'r',
    word: 'RATÓN',
    phonetic: 'R de Ratón',
    icon: '🐭',
    getSurpriseSvg: () => `
      <svg class="surprise-svg mouse-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <circle cx="68" cy="75" r="22" fill="#b0bec5" stroke="#546e7a" stroke-width="2"/>
        <circle cx="68" cy="75" r="13" fill="#ffab91"/>
        <circle cx="132" cy="75" r="22" fill="#b0bec5" stroke="#546e7a" stroke-width="2"/>
        <circle cx="132" cy="75" r="13" fill="#ffab91"/>
        <ellipse cx="100" cy="115" rx="38" ry="32" fill="#cfd8dc" stroke="#546e7a" stroke-width="2.5"/>
        <circle cx="88" cy="108" r="4" fill="#263238"/>
        <circle cx="112" cy="108" r="4" fill="#263238"/>
        <polygon points="100,118 94,126 106,126" fill="#e91e63"/>
      </svg>
    `
  }
};

/**
 * Obtiene los datos pedagógicos completos para una letra
 */
function getPedagogicalLetter(letter) {
  const char = (letter || 'A').toUpperCase();
  const lower = char.toLowerCase();

  // Bounding boxes escolares estándar (W=760, H=420)
  // Letra mayúscula a la izquierda, minúscula a la derecha
  const upperBounds = { x: 70, y: 70, width: 200, height: 260 };
  const lowerBounds = { x: 290, y: 110, width: 170, height: 220 };

  const upperStrokes = StrokeGenerator.getStrokes(char, upperBounds, true);
  const lowerStrokes = StrokeGenerator.getStrokes(lower, lowerBounds, false);

  if (PEDAGOGICAL_LETTERS[char]) {
    const p = PEDAGOGICAL_LETTERS[char];
    return {
      letter: char,
      lowercase: lower,
      word: p.word,
      phonetic: p.phonetic,
      icon: p.icon,
      uppercaseStrokes: upperStrokes,
      lowercaseStrokes: lowerStrokes,
      getSurpriseSvg: p.getSurpriseSvg
    };
  }

  // Generador dinámico para cualquier otra letra del abecedario
  return {
    letter: char,
    lowercase: lower,
    word: `LETRA ${char}`,
    phonetic: `${char} de Estrella`,
    icon: '⭐',
    uppercaseStrokes: upperStrokes,
    lowercaseStrokes: lowerStrokes,
    getSurpriseSvg: () => `
      <svg class="surprise-svg generic-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <polygon points="100,25 123,75 178,83 138,122 148,176 100,150 52,176 62,122 22,83 77,75" fill="#ffd54f" stroke="#ff8f00" stroke-width="4"/>
        <text x="100" y="125" font-size="44" font-weight="900" fill="#e65100" text-anchor="middle">${char}</text>
      </svg>
    `
  };
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
 * NameTracingScreen.js - Módulo de Trazado de Nombre y Palabras Clave
 * Digitalización interactiva y fiel al cuaderno escolar de preescolar (SEP / Gonvill).
 * 
 * Recreado con el Motor Universal StrokeGenerator:
 * - Soporte dinámico de trazos continuos para todo el abecedario A-Z.
 * - Validación pedagógica por recorrido continuo (desarrollo de memoria muscular).
 * - Cero "boom se llena" al primer toque: el niño traza el recorrido real.
 * - Guía visual animada (estrellita viajera) y números secuenciales 1, 2, 3...
 * - Paleta de colores de crayón en tiempo real.
 * - 50 Niveles en Círculos (Nivel 1: "JUAN CARLOS", seguido de palabras de kínder).
 * - Cinta 3D del Nombre Completo con fichas táctiles que avanzan letra por letra.
 * - Cero alertas emergentes (alert/confirm), transición automática fluida y celebración festiva.
 */
// Catálogo de 50 niveles de trazado de nombre y palabras de preescolar
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
    this.currentLevel = null; // null = selector de 50 niveles
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

    // 1. Selector de 50 niveles en círculos
    if (this.currentLevel === null) {
      LevelSelector.render({
        container,
        moduleKey: 'name-tracing',
        moduleTitle: 'Traza tu Nombre',
        moduleIcon: '⭐',
        title: 'Traza tu Nombre',
        icon: '⭐',
        totalLevels: 50,
        onBackHome: () => {
          audio.playClick();
          this.navigator.navigate('home');
        },
        onBack: () => {
          audio.playClick();
          this.navigator.navigate('home');
        },
        onSelectLevel: (lvl) => {
          audio.playClick();
          this.currentLevel = lvl;
          this.renderGame(container);
        }
      });
      return;
    }

    // 2. Nivel activo de trazado
    this.renderGame(container);
  }

  // ==========================================================================
  // VISTA DEL JUEGO: CUADERNO CALIGRÁFICO
  // ==========================================================================
  renderGame(container) {
    this.cleanup();

    // Nivel 1 es siempre el nombre del niño
    if (this.currentLevel === 1) {
      this.targetName = (this.student.name || 'JUAN CARLOS').toUpperCase();
    } else {
      const idx = (this.currentLevel - 1) % NAME_TRACING_LEVELS.length;
      this.targetName = NAME_TRACING_LEVELS[idx];
    }

    this.currentLetterIndex = 0;

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="nameTracingModule">
        <!-- Encabezado con ARABOT centrado y controles infantiles -->
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
            <h2>TRAZA TU NOMBRE: <span class="letter-highlight" id="currentLetterDisplay">J</span></h2>
            <p class="notebook-instruction" id="nameInstructionText">
              Paso <strong id="currentStepNum">1</strong> de <span id="totalStepsNum">2</span> • Sigue la guía punteada con tu dedito.
            </p>
          </div>

          <!-- Contenedor del lienzo de cuaderno alineado a 760x420 -->
          <div class="notebook-grid-container" id="nameNotebookContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>

          <!-- Cinta interactiva del Nombre Completo en fichas 3D -->
          <div class="name-progress-bar" id="nameProgressContainer"></div>
        </main>

        <!-- Banner de transición automática -->
        <div class="auto-transition-banner" id="autoTransitionBanner" style="display:none;">
          <div class="transition-card bounce-in">
            <div class="transition-stars">⭐⭐⭐</div>
            <div class="transition-title">¡INCREÍBLE!</div>
            <div class="transition-msg" id="transitionMsg">¡Completaste tu nombre con éxito!</div>
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

  // ==========================================================================
  // CINTA INTERACTIVA DEL NOMBRE COMPLETO
  // ==========================================================================
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

  // ==========================================================================
  // CARGA DE LA LETRA ACTUAL
  // ==========================================================================
  loadCurrentLetter(container) {
    // Si es un espacio en blanco, saltarlo automáticamente
    while (this.currentLetterIndex < this.targetName.length && this.targetName[this.currentLetterIndex] === ' ') {
      this.currentLetterIndex++;
    }

    // Si terminó todas las letras del nombre -> Ganar nivel
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

    // Bienvenida vocal de Arabot
    audio.speak(`Traza la letra ${currentChar}`);
  }

  updateStatusPill(container) {
    const curElem = container.querySelector('#currentStepNum');
    const totalElem = container.querySelector('#totalStepsNum');
    if (curElem) curElem.innerText = Math.min(this.currentStrokeIndex + 1, Math.max(1, this.activeStrokes.length));
    if (totalElem) totalElem.innerText = Math.max(1, this.activeStrokes.length);
  }

  // ==========================================================================
  // DIBUJO DEL FONDO: CUADRÍCULA AZUL + RENGLONES + GUÍAS GENERADAS
  // ==========================================================================
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

    // 2. Renglón caligráfico de cuaderno (línea superior, línea media discontinua, línea base)
    const topY = 65;
    const midY = 205;
    const baseY = 345;

    ctx.save();
    // Fondo tenue del renglón
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillRect(0, topY, W, baseY - topY);

    // Línea superior del renglón
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(W, topY);
    ctx.stroke();

    // Línea media discontinua
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();

    // Línea base del renglón
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(W, baseY);
    ctx.stroke();
    ctx.restore();

    // 3. Guías direccionales generadas por StrokeGenerator
    StrokeGenerator.renderStrokeGuides(ctx, this.activeStrokes, this.currentStrokeIndex, '#1565c0');
  }

  // ==========================================================================
  // EVENTOS TÁCTILES Y DE RATÓN
  // ==========================================================================
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

    // Selección de colores de crayón
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

    // Pointer Events universales
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
    // No se completa en pointerdown para obligar al trazo por recorrido continuo (memoria muscular)
  }

  handlePointerMove(x, y, container) {
    if (!this.isDrawing || !this.lastPoint || this.isLetterCompleted) return;

    const dx = x - this.lastPoint.x;
    const dy = y - this.lastPoint.y;
    const stepDist = Math.hypot(dx, dy);
    if (stepDist < 2.5) return;

    this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, x, y);
    this.lastPoint = { x, y };

    // Evaluar progreso con StrokeGenerator
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

  // ==========================================================================
  // COMPLETADO DE TRAZO Y AVANCE DE LETRA
  // ==========================================================================
  onStrokeCompleted(stroke, x, y, container) {
    audio.playStar();
    this.emitStarBurst(x, y);

    // Fijar trazo completo nítido en el lienzo
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

    // Iluminar la ficha de la letra en la cinta
    const currentSlot = container.querySelector(`.slot-${this.currentLetterIndex}`);
    if (currentSlot) {
      currentSlot.classList.remove('active');
      currentSlot.classList.add('completed');
    }

    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡Completaste la letra <strong>${currentChar}</strong>! ⭐`, 1600);
    }

    StorageManager.addStars(1);

    // Avanzar a la siguiente letra después de 650ms
    setTimeout(() => {
      this.currentLetterIndex++;
      this.loadCurrentLetter(container);
    }, 650);
  }

  // ==========================================================================
  // COMPLETADO DE PALABRA / NOMBRE COMPLETO
  // ==========================================================================
  onWordCompleted(container) {
    audio.playCelebration();
    Confetti.shoot(3500);

    // Guardar progreso en StorageManager
    StorageManager.completeModuleLevel('name-tracing', this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    if (this.arabot) {
      this.arabot.celebrate(`¡Felicidades ${this.student.name}! ¡Escribiste "${this.targetName}" completo! 🎓🌟`, 3200);
    }

    // Mostrar banner de transición automática
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

    // Transición automática al siguiente nivel después de 2.2s
    setTimeout(() => {
      if (this.currentLevel < NAME_TRACING_LEVELS.length) {
        this.currentLevel++;
        this.renderGame(container);
      } else {
        this.currentLevel = null;
        this.render(container);
      }
    }, 2200);
  }

  // ==========================================================================
  // EFECTO MÁGICO DE ESTRELLITAS (SPARKLE BURST)
  // ==========================================================================
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

    // 1. Partículas mágicas
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

    // 2. Guía animada suave con estrellita viajera
    const activeStroke = this.activeStrokes[this.currentStrokeIndex];
    if (activeStroke && !this.isDrawing && !this.isLetterCompleted) {
      const t = (performance.now() % 2200) / 2200;
      StrokeGenerator.renderAnimatedPointer(ctx, activeStroke, t);
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


  /* ==========================================================================
     FILE: src/modules/LetterTracingScreen.js
     ========================================================================== */

/**
 * LetterTracingScreen.js - Módulo de Trazado de Letras y Caligrafía Escolar
 * Reconstruido con el Motor Universal StrokeGenerator para máxima fluidez,
 * precisión pedagógica y cero frustración en niños de preescolar.
 */
// ============================================================================
// 1. CATÁLOGO DE SUB-JUEGOS EN CÍRCULOS
// ============================================================================
const TRACING_SUBGAMES = [
  {
    id: 'vocales_cuadernillo',
    moduleKey: 'tracing_vocales_workbook',
    title: 'CUADERNILLO: LAS 5 VOCALES',
    subtitle: 'A, E, I, O, U • Réplica fiel del libro MundoABC',
    icon: '📖',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#e91e63',
    description: 'Digitalización fiel: letra grande con sorpresa ilustrada y renglones caligráficos escolares sobre cuadrícula.'
  },
  {
    id: 'consonantes_cuadernillo',
    moduleKey: 'tracing_consonantes_workbook',
    title: 'CUADERNILLO: CONSONANTES',
    subtitle: 'M, S, T, L, P, N, R, D, C, B... sobre cuadrícula',
    icon: '🔤',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#1976d2',
    description: 'Aprende a trazar todas las consonantes del cuadernillo escolar y sus renglones caligráficos.'
  },
  {
    id: 'generador_trazos',
    moduleKey: 'tracing_generador_trazos',
    title: 'GENERADOR DE TRAZOS',
    subtitle: '✨ ¡Crea y traza cualquier letra, número o palabra!',
    icon: '✨',
    totalLevels: 1,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#8e24aa',
    description: 'Herramienta interactiva para generar instantáneamente actividades de trazado para cualquier letra, dígito o palabra personalizada.'
  },
  {
    id: 'grafomotricidad',
    moduleKey: 'tracing_grafomotricidad',
    title: 'GRAFOMOTRICIDAD PREESCOLAR',
    subtitle: 'Líneas, olas, cruces, zig-zag y espirales',
    icon: '〰️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#00acc1',
    description: 'Ejercicios de soltura de muñeca y motricidad fina recomendados para preescolar.'
  },
  {
    id: 'letra_m',
    moduleKey: 'tracing_letra_m',
    title: 'LETRA M',
    subtitle: 'Mamá • Ma, Me, Mi, Mo, Mu',
    icon: '🍎',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#e53935',
    description: 'Trazos de la letra M y sus sílabas con la Manzana.'
  },
  {
    id: 'letra_s',
    moduleKey: 'tracing_letra_s',
    title: 'LETRA S',
    subtitle: 'Sol, Sapo • Sa, Se, Si, So, Su',
    icon: '☀️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#ff9800',
    description: 'Trazos ondulados y divertidos de la letra S con el Sol.'
  },
  {
    id: 'letra_t',
    moduleKey: 'tracing_letra_t',
    title: 'LETRA T',
    subtitle: 'Tortuga • Ta, Te, Ti, To, Tu',
    icon: '🐢',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#43a047',
    description: 'Trazos rectos y firmes de la letra T con la Tortuga.'
  },
  {
    id: 'letra_l',
    moduleKey: 'tracing_letra_l',
    title: 'LETRA L',
    subtitle: 'León, Luna • La, Le, Li, Lo, Lu',
    icon: '🦁',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#fbc02d',
    description: 'Trazos altos y elegantes de la letra L con el León.'
  },
  {
    id: 'letra_p',
    moduleKey: 'tracing_letra_p',
    title: 'LETRA P',
    subtitle: 'Pelota, Papá • Pa, Pe, Pi, Po, Pu',
    icon: '⚽',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#8e24aa',
    description: 'Trazos de poste y pancita redonda de la letra P con la Pelota.'
  },
  {
    id: 'letra_n',
    moduleKey: 'tracing_letra_n',
    title: 'LETRA N',
    subtitle: 'Nube, Nido • Na, Ne, Ni, No, Nu',
    icon: '☁️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#00acc1',
    description: 'Trazos de arquito de la letra N con la Nube.'
  },
  {
    id: 'letra_r',
    moduleKey: 'tracing_letra_r',
    title: 'LETRA R',
    subtitle: 'Ratón, Rana • Ra, Re, Ri, Ro, Ru',
    icon: '🐭',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#d81b60',
    description: 'Trazos con gancho y fuerza de la letra R con el Ratón.'
  },
  {
    id: 'pizarra_magica',
    moduleKey: 'tracing_pizarra_magica',
    title: 'PIZARRA MÁGICA ESCOLAR',
    subtitle: 'Dibujo libre y práctica con 6 crayones',
    icon: '🎨',
    totalLevels: 1,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#3949ab',
    description: 'Cuaderno abierto con cuadrícula escolar y crayones de colores para trazar y dibujar libremente.'
  }
];

// ============================================================================
// 2. NIVELES PEDAGÓGICOS DEL CUADERNILLO DE VOCALES (50 NIVELES EXACTOS AL LIBRO)
// ============================================================================
const VOCALES_WORKBOOK_LEVELS = [
  // Letra A (Página 3 de MundoABC)
  { id: 1, type: 'intro_hollow', letter: 'A', lowercase: 'a', word: 'ÁRBOL', phonetic: 'A de Árbol', icon: '🌳', title: 'A de Árbol • Letra Grande', instruction: '✏️ Sigue las flechas 1, 2 y 3 para trazar la A y colorear el Árbol.' },
  { id: 2, type: 'grid_row', char: 'A', count: 8, title: 'Renglón 1: Letra A Mayúscula', instruction: '✏️ Traza las 8 letras A mayúsculas sobre la cuadrícula.' },
  { id: 3, type: 'grid_row', char: 'a', count: 12, title: 'Renglón 2: Letra a Minúscula', instruction: '✏️ Traza las 12 letras a redonditas con su palito vertical.' },
  { id: 4, type: 'grid_row', char: 'A', count: 8, title: 'Renglón 3: Refuerzo de A Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando las 8 letras A mayúsculas.' },
  { id: 5, type: 'grid_row_alternating', pattern: ['A', 'a', 'A', 'a', 'A', 'a', 'A', 'a', 'A', 'a'], title: 'Renglón 4: Alternado A - a', instruction: '✏️ Traza alternando A mayúscula y a minúscula.' },

  // Letra E (Página 6)
  { id: 6, type: 'intro_hollow', letter: 'E', lowercase: 'e', word: 'ELEFANTE', phonetic: 'E de Elefante', icon: '🐘', title: 'E de Elefante • Letra Grande', instruction: '✏️ Sigue las flechas para trazar la E y colorear el Elefante.' },
  { id: 7, type: 'grid_row', char: 'E', count: 8, title: 'Renglón 1: Letra E Mayúscula', instruction: '✏️ Traza las 8 letras E mayúsculas sobre la cuadrícula.' },
  { id: 8, type: 'grid_row', char: 'e', count: 12, title: 'Renglón 2: Letra e Minúscula', instruction: '✏️ Traza las 12 letras e sobre la cuadrícula.' },
  { id: 9, type: 'grid_row', char: 'E', count: 8, title: 'Renglón 3: Refuerzo de E Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando las 8 letras E.' },
  { id: 10, type: 'grid_row_alternating', pattern: ['E', 'e', 'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e'], title: 'Renglón 4: Alternado E - e', instruction: '✏️ Traza alternando E mayúscula y e minúscula.' },

  // Letra I (Página 9)
  { id: 11, type: 'intro_hollow', letter: 'I', lowercase: 'i', word: 'ISLA', phonetic: 'I de Isla', icon: '🏝️', title: 'I de Isla • Letra Grande', instruction: '✏️ Sigue las flechas para trazar la I y colorear la Isla.' },
  { id: 12, type: 'grid_row', char: 'I', count: 8, title: 'Renglón 1: Letra I Mayúscula', instruction: '✏️ Traza las 8 letras I mayúsculas sobre el renglón.' },
  { id: 13, type: 'grid_row', char: 'i', count: 12, title: 'Renglón 2: Letra i Minúscula', instruction: '✏️ Traza las 12 letras i con su puntito.' },
  { id: 14, type: 'grid_row', char: 'I', count: 8, title: 'Renglón 3: Refuerzo de I Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando la I.' },
  { id: 15, type: 'grid_row_alternating', pattern: ['I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i'], title: 'Renglón 4: Alternado I - i', instruction: '✏️ Traza alternando I mayúscula e i minúscula.' },

  // Letra O (Página 12)
  { id: 16, type: 'intro_hollow', letter: 'O', lowercase: 'o', word: 'OSO', phonetic: 'O de Oso', icon: '🐻', title: 'O de Oso • Letra Grande', instruction: '✏️ Traza la O y la o redonditas para colorear el Oso.' },
  { id: 17, type: 'grid_row', char: 'O', count: 8, title: 'Renglón 1: Letra O Mayúscula', instruction: '✏️ Traza los 8 círculos grandes de la O mayúscula.' },
  { id: 18, type: 'grid_row', char: 'o', count: 12, title: 'Renglón 2: Letra o Minúscula', instruction: '✏️ Traza los 12 círculos pequeños de la o minúscula.' },
  { id: 19, type: 'grid_row', char: 'O', count: 8, title: 'Renglón 3: Refuerzo de O Mayúscula', instruction: '✏️ Refuerza tu caligrafía trazando la O.' },
  { id: 20, type: 'grid_row_alternating', pattern: ['O', 'o', 'O', 'o', 'O', 'o', 'O', 'o', 'O', 'o'], title: 'Renglón 4: Alternado O - o', instruction: '✏️ Traza alternando O mayúscula y o minúscula.' },

  // Letra U (Página 15)
  { id: 21, type: 'intro_hollow', letter: 'U', lowercase: 'u', word: 'UVA', phonetic: 'U de Uva', icon: '🍇', title: 'U de Uva • Letra Grande', instruction: '✏️ Sigue las flechas para trazar la U y colorear las Uvas.' },
  { id: 22, type: 'grid_row', char: 'U', count: 8, title: 'Renglón 1: Letra U Mayúscula', instruction: '✏️ Traza las 8 curvas de la U mayúscula.' },
  { id: 23, type: 'grid_row', char: 'u', count: 12, title: 'Renglón 2: Letra u Minúscula', instruction: '✏️ Traza las 12 letras u con su patita derecha.' },
  { id: 24, type: 'grid_row', char: 'U', count: 8, title: 'Renglón 3: Refuerzo de U Mayúscula', instruction: '✏️ Refuerza tu caligrafía con la letra U.' },
  { id: 25, type: 'grid_row_alternating', pattern: ['U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u'], title: 'Renglón 4: Alternado U - u', instruction: '✏️ Traza alternando U mayúscula y u minúscula.' }
];

// Completar los 50 niveles de vocales con series combinadas y desafíos
(() => {
  const vUpper = ['A', 'E', 'I', 'O', 'U'];
  const vLower = ['a', 'e', 'i', 'o', 'u'];

  for (let i = 26; i <= 50; i++) {
    const isPair = (i % 2 === 0);
    const pattern = isPair
      ? ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u']
      : ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'];

    VOCALES_WORKBOOK_LEVELS.push({
      id: i,
      type: 'grid_row_alternating',
      pattern: pattern,
      title: `Desafío Vocálico ${i}: Serie Completa`,
      instruction: '✏️ Traza con precisión la serie completa de las 5 vocales.'
    });
  }
})();

// Generador de 50 niveles para consonantes y letras individuales
function buildConsonante50Levels(letterChar, word, phonetic, icon) {
  const levels = [];
  const c = letterChar.toUpperCase();
  const lower = c.toLowerCase();

  // Nivel 1: Letra Grande con Sorpresa ilustrada
  levels.push({
    id: 1,
    type: 'intro_hollow',
    letter: c,
    lowercase: lower,
    word: word,
    phonetic: phonetic,
    icon: icon,
    title: `${phonetic} • Letra Grande`,
    instruction: `✏️ Sigue las flechas numeradas para trazar la ${c} y colorear el dibujo.`
  });

  // Nivel 2: Renglón mayúsculas (8)
  levels.push({
    id: 2,
    type: 'grid_row',
    char: c,
    count: 8,
    title: `Renglón 1: Letra ${c} Mayúscula`,
    instruction: `✏️ Traza las 8 letras ${c} sobre la cuadrícula del cuaderno.`
  });

  // Nivel 3: Renglón minúsculas (12)
  levels.push({
    id: 3,
    type: 'grid_row',
    char: lower,
    count: 12,
    title: `Renglón 2: Letra ${lower} Minúscula`,
    instruction: `✏️ Traza las 12 letras ${lower} sobre el renglón escolar.`
  });

  // Nivel 4: Refuerzo mayúsculas (8)
  levels.push({
    id: 4,
    type: 'grid_row',
    char: c,
    count: 8,
    title: `Renglón 3: Refuerzo de ${c}`,
    instruction: `✏️ Refuerza tu caligrafía trazando la ${c}.`
  });

  // Nivel 5: Alternado mayúscula / minúscula
  levels.push({
    id: 5,
    type: 'grid_row_alternating',
    pattern: [c, lower, c, lower, c, lower, c, lower],
    title: `Renglón 4: Alternado ${c} - ${lower}`,
    instruction: `✏️ Traza alternando ${c} mayúscula y ${lower} minúscula.`
  });

  // Niveles 6 a 50: Sílabas y combinaciones
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const lowerVowels = ['a', 'e', 'i', 'o', 'u'];

  for (let i = 6; i <= 50; i++) {
    const vIdx = (i - 6) % 5;
    const v = vowels[vIdx];
    const lv = lowerVowels[vIdx];

    if (i <= 10) {
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [c, v, c, v, c, v, c, v],
        title: `Renglón Sílaba: ${c}${v}`,
        instruction: `✏️ Traza la sílaba ${c}${v} sobre la cuadrícula.`
      });
    } else if (i <= 15) {
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [lower, lv, lower, lv, lower, lv, lower, lv],
        title: `Renglón Sílaba Minúscula: ${lower}${lv}`,
        instruction: `✏️ Traza las sílabas minúsculas ${lower}${lv}.`
      });
    } else {
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [c, lower, c, lower, c, lower, c, lower],
        title: `Desafío de Caligrafía ${i}: Letra ${c}`,
        instruction: `✏️ Completa el renglón ${i} del cuaderno escolar.`
      });
    }
  }

  return levels;
}

// 50 Niveles de Grafomotricidad
const GRAFOMOTRICIDAD_LEVELS = (() => {
  const patterns = ['lineas_verticales', 'lineas_horizontales', 'cruces', 'olas_mar', 'montañas_zigzag', 'espiral'];
  const titles = [
    'Palitos Verticales (Lluvia)',
    'Líneas Horizontales (Caminos)',
    'Cruces y Signos Más',
    'Olas del Mar (Curvas Suaves)',
    'Montañas en Zig-Zag',
    'Caracoles y Espirales'
  ];

  const list = [];
  for (let i = 1; i <= 50; i++) {
    const pIdx = (i - 1) % patterns.length;
    list.push({
      id: i,
      type: 'pattern_trace',
      patternKey: patterns[pIdx],
      title: `Grafomotricidad ${i}: ${titles[pIdx]}`,
      instruction: '✏️ Sigue la dirección de las flechas y realiza los trazos preparatorios.'
    });
  }
  return list;
})();
const CONSONANTES_WORKBOOK_LEVELS = buildConsonante50Levels('M', 'MANZANA', 'M de Manzana', '🍎');

// Diccionario de niveles de los subjuegos
const SUBGAMES_LEVEL_MAP = {
  vocales_cuadernillo: VOCALES_WORKBOOK_LEVELS,
  consonantes_cuadernillo: CONSONANTES_WORKBOOK_LEVELS,
  grafomotricidad: GRAFOMOTRICIDAD_LEVELS,
  letra_m: buildConsonante50Levels('M', 'MANZANA', 'M de Manzana', '🍎'),
  letra_s: buildConsonante50Levels('S', 'SOL', 'S de Sol', '☀️'),
  letra_t: buildConsonante50Levels('T', 'TORTUGA', 'T de Tortuga', '🐢'),
  letra_l: buildConsonante50Levels('L', 'LEÓN', 'L de León', '🦁'),
  letra_p: buildConsonante50Levels('P', 'PELOTA', 'P de Pelota', '⚽'),
  letra_n: buildConsonante50Levels('N', 'NUBE', 'N de Nube', '☁️'),
  letra_r: buildConsonante50Levels('R', 'RATÓN', 'R de Ratón', '🐭')
};

// ============================================================================
// 3. CLASE PRINCIPAL: LETTER TRACING SCREEN
// ============================================================================
class LetterTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();

    // Estado de navegación
    this.activeSubgame = null; // null = menú de subjuegos en círculos
    this.currentLevel = null;  // 1..50

    // Configuración activa
    this.levelConfig = null;
    this.pedagogicalData = null;

    // Asistente ARABOT
    this.arabot = null;

    // Lienzos HTML5
    this.bgCanvas = null;
    this.bgCtx = null;
    this.paintCanvas = null;
    this.paintCtx = null;
    this.fxCanvas = null;
    this.fxCtx = null;

    // Estado del motor de trazo
    this.isDrawing = false;
    this.lastPoint = null;
    this.activeCrayonColor = '#e91e63'; // Rosa mexicano brillante tipo crayón

    // Trazos activos gestionados por StrokeGenerator
    this.activeStrokes = [];
    this.currentStrokeIndex = 0;
    this.gridLetters = [];
    this.currentLetterIndex = 0;

    // Para compatibilidad y verificadores
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };
    this.rowLettersCompleted = [];
    this.totalRowLetters = 0;
    this.isIllustrationColored = false;

    // Partículas y animación
    this.sparkles = [];
    this.animFrameId = null;

    // Eventos de puntero
    this.activePointerId = null;
    this.boundPointerMove = null;
    this.boundPointerUp = null;

    // Estado del Generador de Trazos Mágico
    this.generatorTab = 'abecedario';
    this.generatorTarget = 'A';
    this.generatorIsUpper = true;
  }

  // ==========================================================================
  // ORQUESTADOR DE VISTAS
  // ==========================================================================
  render(container) {
    this.student = StorageManager.getActiveStudent();
    this.cleanup();

    // Vista 1: Menú inicial con los subjuegos en círculos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // Vista 2: Generador Mágico de Trazos
    if (this.activeSubgame === 'generador_trazos') {
      this.renderGeneradorTrazos(container);
      return;
    }

    // Vista 3: Pizarra Mágica Escolar (Dibujo libre)
    if (this.activeSubgame === 'pizarra_magica') {
      this.renderPizarraMagica(container);
      return;
    }

    // Vista 4: Selector de 50 niveles
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // Vista 5: Nivel activo del cuadernillo
    this.renderLevelGame(container);
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE SUBJUEGOS EN CÍRCULOS
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container notebook-grid-bg fade-in" id="tracingSubgamesMenu">
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#0d47a1; margin:0; font-size:clamp(1.2rem, 3.2vw, 1.8rem);">CUADERNILLO DE TRAZOS</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#e65100;">
              Elige una actividad en círculo para comenzar • 50 Niveles
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <main class="subgames-menu-container">
          <div class="subgames-grid-10">
            ${TRACING_SUBGAMES.map(game => {
              const prog = StorageManager.getModuleLevels(game.moduleKey);
              const completedCount = Object.keys(prog.completed || {}).length;
              return `
                <button class="subgame-circle-card" data-game="${game.id}">
                  <div class="subgame-bubble ${game.bubbleClass} pulse-glow">
                    <span class="subgame-bubble-icon">${game.icon}</span>
                    <span class="subgame-levels-badge">${game.totalLevels > 1 ? `${game.totalLevels} Niveles` : 'Actividad'}</span>
                  </div>
                  <span class="subgame-title-label" style="color:${game.themeColor};">${game.title}</span>
                  <span style="font-size:0.75rem; color:#455a64; font-weight:bold; margin-top:3px;">
                    ${game.totalLevels > 1 ? `⭐ ${completedCount}/${game.totalLevels} completados` : '¡Toca para entrar!'}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </main>

        <footer class="module-footer">
          <span class="tip-text">💡 Toca <strong>Cuadernillo: Las 5 Vocales</strong> o prueba el nuevo <strong>Generador de Trazos ✨</strong>.</span>
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
        const gameId = e.currentTarget.dataset.game;
        this.activeSubgame = gameId;
        this.currentLevel = (gameId === 'pizarra_magica' || gameId === 'generador_trazos') ? 1 : null;
        this.render(container);
      });
    });

    audio.speak('Elige una actividad del cuadernillo de trazos');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS
  // ==========================================================================
  renderLevelSelector(container) {
    const subgame = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];

    LevelSelector.render({
      container,
      moduleKey: subgame.moduleKey,
      moduleTitle: subgame.title,
      moduleIcon: subgame.icon,
      title: subgame.title,
      icon: subgame.icon,
      totalLevels: subgame.totalLevels,
      onBackHome: () => {
        audio.playClick();
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      },
      onBack: () => {
        audio.playClick();
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      },
      onSelectLevel: (lvl) => {
        audio.playClick();
        this.currentLevel = lvl;
        this.renderLevelGame(container);
      }
    });
  }

  // ==========================================================================
  // VISTA 3: NIVEL ACTIVO DEL CUADERNILLO ESCOLAR
  // ==========================================================================
  renderLevelGame(container) {
    this.cleanup();

    const levels = SUBGAMES_LEVEL_MAP[this.activeSubgame] || VOCALES_WORKBOOK_LEVELS;
    const idx = Math.max(0, Math.min(this.currentLevel - 1, levels.length - 1));
    this.levelConfig = levels[idx];

    const isIntro = (this.levelConfig.type === 'intro_hollow');
    const letterChar = this.levelConfig.letter || this.levelConfig.char || 'A';
    this.pedagogicalData = getPedagogicalLetter(letterChar);

    // Reinicio de estados del nivel
    this.isDrawing = false;
    this.lastPoint = null;
    this.isIllustrationColored = false;
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="tracingModule">
        <!-- Encabezado con ARABOT centrado y paleta de crayones -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          
          <div class="arabot-top-anchor" id="arabotAnchor">
            <!-- ARABOT montado aquí -->
          </div>

          <div class="header-actions">
            <!-- Mini paleta de crayones escolares -->
            <div class="mini-crayons-bar">
              <button class="mini-crayon active" data-color="#e91e63" style="background:#e91e63;" title="Rosa Cemento"></button>
              <button class="mini-crayon" data-color="#ff5722" style="background:#ff5722;" title="Naranja"></button>
              <button class="mini-crayon" data-color="#4caf50" style="background:#4caf50;" title="Verde"></button>
              <button class="mini-crayon" data-color="#00bcd4" style="background:#00bcd4;" title="Azul"></button>
              <button class="mini-crayon" data-color="#9c27b0" style="background:#9c27b0;" title="Morado"></button>
            </div>
            <button class="sound-btn" id="btnPlayLetterAudio">🔊 Escuchar</button>
            <button class="clear-btn" id="btnClearCanvas">🧹 Borrar</button>
          </div>
        </header>

        <!-- Cuadernillo estilo hoja escolar -->
        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>${(this.levelConfig.title || 'TRAZOS ESCOLARES').toUpperCase()}</h2>
            <p class="notebook-instruction" id="levelInstructionText">
              ${this.levelConfig.instruction || '✏️ Pasa tu dedito sobre las líneas punteadas guiadas.'}
            </p>
          </div>

          <div class="notebook-grid-container" id="notebookGridContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>

            <!-- Zona de sorpresa ilustrada (en niveles intro) -->
            ${isIntro ? `
              <div class="notebook-tree-zone" id="notebookTreeZone">
                ${this.pedagogicalData.getSurpriseSvg ? this.pedagogicalData.getSurpriseSvg() : ''}
                <div class="tree-caption" id="treeCaption">${this.pedagogicalData.phonetic || ''} ${this.pedagogicalData.icon || '⭐'}</div>
              </div>
            ` : `
              <div class="row-progress-counter" id="rowProgressCounter">
                ⭐ Letras completadas: <span id="completedCountLabel">0</span> / <span id="totalLettersCountLabel">1</span>
              </div>
            `}
          </div>
        </main>

        <!-- Banner de transición automática -->
        <div class="auto-transition-banner" id="autoTransitionBanner" style="display:none;">
          <div class="transition-card bounce-in">
            <div class="transition-stars">⭐⭐⭐</div>
            <div class="transition-title">¡EXCELENTE TRABAJO!</div>
            <div class="transition-msg" id="transitionMsg">¡Completaste este ejercicio del cuadernillo!</div>
            <div class="transition-progress-bar">
              <div class="progress-fill" id="transitionProgressFill"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupArabot(container);
    this.setupCanvases(container);
    this.initLevelStrokes();
    this.drawBackground();
    this.startFxLoop();
    this.bindEvents(container);

    setTimeout(() => {
      audio.speak(this.levelConfig.instruction || `Vamos a trazar la letra ${letterChar}`);
    }, 400);
  }

  // ==========================================================================
  // INICIALIZACIÓN DE TRAZOS CON STROKEGENERATOR
  // ==========================================================================
  initLevelStrokes() {
    if (!this.paintCanvas) return;
    const W = this.paintCanvas.width;
    const H = this.paintCanvas.height;

    this.activeStrokes = [];
    this.currentStrokeIndex = 0;
    this.gridLetters = [];
    this.currentLetterIndex = 0;

    // Caso 1: Nivel de inicio de letra (Letra grande hueca con flechas + Árbol)
    if (this.levelConfig.type === 'intro_hollow') {
      const upperBounds = { x: 50, y: 70, width: 200, height: 260 };
      const lowerBounds = { x: 270, y: 110, width: 170, height: 220 };

      const char = this.levelConfig.letter || 'A';
      const uStrokes = StrokeGenerator.getStrokes(char, upperBounds, true).map(s => ({ ...s, isUpper: true }));
      const lStrokes = StrokeGenerator.getStrokes(char.toLowerCase(), lowerBounds, false).map(s => ({ ...s, isUpper: false }));

      this.activeStrokes = [...uStrokes, ...lStrokes];
      this.totalRowLetters = this.activeStrokes.length;
    }
    // Caso 2: Renglón caligráfico de cuaderno (8 o 12 letras)
    else if (this.levelConfig.type === 'grid_row' || this.levelConfig.type === 'grid_row_alternating') {
      const isAlternating = (this.levelConfig.type === 'grid_row_alternating');
      const chars = isAlternating
        ? this.levelConfig.pattern
        : new Array(this.levelConfig.count || 8).fill(this.levelConfig.char || 'A');

      this.totalRowLetters = chars.length;
      this.rowLettersCompleted = new Array(this.totalRowLetters).fill(false);

      const rowBounds = { x: 30, y: 110, width: 700, height: 210 };
      this.gridLetters = StrokeGenerator.generateRowLayout(chars, rowBounds);

      // Los trazos activos son los de la primera letra no completada
      this.currentLetterIndex = 0;
      this.activeStrokes = this.gridLetters[0]?.strokes || [];
      this.currentStrokeIndex = 0;

      const totalLbl = document.getElementById('totalLettersCountLabel');
      if (totalLbl) totalLbl.innerText = `${this.totalRowLetters}`;
      const compLbl = document.getElementById('completedCountLabel');
      if (compLbl) compLbl.innerText = '0';
    }
    // Caso 3: Grafomotricidad
    else if (this.levelConfig.type === 'pattern_trace') {
      const patternBounds = { x: 60, y: 80, width: 640, height: 260 };
      this.activeStrokes = StrokeGenerator.getStrokes(this.levelConfig.patternKey || 'lineas_verticales', patternBounds);
      this.totalRowLetters = this.activeStrokes.length;
    }
  }

  // ==========================================================================
  // DIBUJO DEL FONDO: CUADRÍCULA AZUL + LÍNEAS DE RENGLÓN + GUÍAS DE TRAZO
  // ==========================================================================
  drawBackground() {
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

    // 2. Renglón caligráfico de cuaderno si es nivel de renglón
    if (this.levelConfig.type === 'grid_row' || this.levelConfig.type === 'grid_row_alternating') {
      const topY = 110;
      const midY = 215;
      const baseY = 320;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(0, topY, W, baseY - topY);

      // Línea superior azul
      ctx.strokeStyle = '#1565c0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(W, topY);
      ctx.stroke();

      // Línea media punteada
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.stroke();

      // Línea base azul marino
      ctx.strokeStyle = '#0d47a1';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(W, baseY);
      ctx.stroke();
      ctx.restore();

      // Dibujar todas las letras del renglón
      this.gridLetters.forEach((letterItem, idx) => {
        const isCurrentLetter = (idx === this.currentLetterIndex);
        StrokeGenerator.renderStrokeGuides(
          ctx,
          letterItem.strokes,
          isCurrentLetter ? this.currentStrokeIndex : -1,
          '#1565c0'
        );
      });
    } else {
      // Dibujar guías de trazos del nivel intro o grafomotricidad
      StrokeGenerator.renderStrokeGuides(ctx, this.activeStrokes, this.currentStrokeIndex, '#1565c0');
    }
  }

  // ==========================================================================
  // BUCLE DE EFECTOS Y GUÍA ANIMADA (ESTRELLITA VIAJERA)
  // ==========================================================================
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

    // 1. Renderizar partículas mágicas
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

    // 2. Renderizar la guía animada suave (estrellita viajera que muestra al niño hacia dónde trazar)
    const activeStroke = this.activeStrokes[this.currentStrokeIndex];
    if (activeStroke && !this.isDrawing) {
      const t = (performance.now() % 2200) / 2200;
      StrokeGenerator.renderAnimatedPointer(ctx, activeStroke, t);
    }
  }

  // ==========================================================================
  // GESTIÓN DE ENTRADA TÁCTIL Y DE RATÓN (CRAYÓN EN TIEMPO REAL)
  // ==========================================================================
  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
      const char = this.levelConfig.letter || this.levelConfig.char || 'A';
      audio.speak(`Letra ${char}, ${this.pedagogicalData.phonetic || ''}`);
      if (this.arabot) this.arabot.bounceHead();
    });

    // Selección de crayones de colores
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
      this.handlePointerMove(pt.x, pt.y);
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
    this.isDrawing = true;
    this.lastPoint = { x, y };

    this.drawCrayonPoint(x, y);
    audio.playBrush();
    // NOTA: No se completa trazo en pointerdown para evitar el efecto "boom se llena"
  }

  handlePointerMove(x, y) {
    if (!this.isDrawing || !this.lastPoint) return;

    const dx = x - this.lastPoint.x;
    const dy = y - this.lastPoint.y;
    const stepDist = Math.hypot(dx, dy);
    if (stepDist < 2.5) return;

    // Dibujar crayón en tiempo real
    this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, x, y);
    this.lastPoint = { x, y };

    // Evaluar con el motor StrokeGenerator
    this.checkActiveStrokeProgress(x, y, stepDist);
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
    ctx.arc(x, y, 12, 0, Math.PI * 2);
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

  // ==========================================================================
  // EVALUACIÓN DE TRAZO Y AVANCE GUIADO
  // ==========================================================================
  checkActiveStrokeProgress(x, y, stepDist) {
    const currentStroke = this.activeStrokes[this.currentStrokeIndex];
    if (!currentStroke || currentStroke.completed) return;

    // Validación tolerante de kínder
    const res = StrokeGenerator.checkStrokeProgress(currentStroke, { x, y }, stepDist, 36);

    if (res.isComplete) {
      this.onStrokeCompleted(currentStroke, x, y);
    }
  }

  onStrokeCompleted(stroke, x, y) {
    // 1. Efectos de logro inmediato
    audio.playStar();
    this.emitStarBurst(x, y);

    // 2. Fijar el trazo sólido y brillante
    StrokeGenerator.renderCompletedStroke(this.paintCtx, stroke, this.activeCrayonColor);

    // Registrar en los sets de compatibilidad
    if (stroke.isUpper !== false) {
      this.hollowStrokesCompleted.upper.add(stroke.id);
    } else {
      this.hollowStrokesCompleted.lower.add(stroke.id);
    }

    // 3. Avanzar al siguiente trazo
    this.currentStrokeIndex++;
    this.drawBackground();

    // 4. Verificar si se completó el grupo actual
    if (this.currentStrokeIndex >= this.activeStrokes.length) {
      if (this.levelConfig.type === 'grid_row' || this.levelConfig.type === 'grid_row_alternating') {
        this.onGridLetterCompleted();
      } else if (this.levelConfig.type === 'intro_hollow') {
        this.onIntroLevelComplete();
      } else {
        this.onLevelCompleted();
      }
    } else {
      // Arabot anima al niño a seguir con el siguiente trazo
      if (this.arabot) {
        this.arabot.speak(`¡Bien! Sigue con el paso ${this.currentStrokeIndex + 1} ⭐`);
      }
    }
  }

  onGridLetterCompleted() {
    this.rowLettersCompleted[this.currentLetterIndex] = true;

    // Actualizar contador visual
    const completedCount = this.rowLettersCompleted.filter(Boolean).length;
    const compLbl = document.getElementById('completedCountLabel');
    if (compLbl) compLbl.innerText = `${completedCount}`;

    audio.playPop();
    if (this.arabot) this.arabot.bounceHead();

    this.currentLetterIndex++;

    if (this.currentLetterIndex < this.gridLetters.length) {
      this.activeStrokes = this.gridLetters[this.currentLetterIndex].strokes;
      this.currentStrokeIndex = 0;
      this.drawBackground();
    } else {
      this.onLevelCompleted();
    }
  }

  onIntroLevelComplete() {
    this.isIllustrationColored = true;
    audio.playCelebration();
    Confetti.shoot(3000);

    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) treeZone.classList.add('colored');

    const caption = document.getElementById('treeCaption');
    if (caption) {
      caption.innerHTML = `🎉 ¡${this.pedagogicalData.word || 'COMPLETADO'} COLOREADO! ${this.pedagogicalData.icon || '⭐'}`;
      caption.classList.add('celebration-glow');
    }

    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡Completaste la letra ${this.pedagogicalData.letter}! ⭐⭐⭐`, 2800);
    }

    this.saveProgressAndAdvance();
  }

  onLevelCompleted() {
    audio.playCelebration();
    Confetti.shoot(3000);

    if (this.arabot) {
      this.arabot.celebrate('¡Completaste todo el ejercicio caligráfico! ⭐⭐⭐', 2600);
    }

    this.saveProgressAndAdvance();
  }

  saveProgressAndAdvance() {
    const subgame = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];
    StorageManager.completeModuleLevel(subgame.moduleKey, this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    setTimeout(() => {
      this.showAutoTransitionBanner();
    }, 2000);
  }

  showAutoTransitionBanner() {
    const banner = document.getElementById('autoTransitionBanner');
    const fill = document.getElementById('transitionProgressFill');

    if (!banner) {
      this.advanceToNextLevel();
      return;
    }

    banner.style.display = 'flex';
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

    const levels = SUBGAMES_LEVEL_MAP[this.activeSubgame] || VOCALES_WORKBOOK_LEVELS;

    if (this.currentLevel < levels.length) {
      this.currentLevel++;
      this.renderLevelGame(container);
    } else {
      this.currentLevel = null;
      this.render(container);
    }
  }

  // ==========================================================================
  // VISTA 4: GENERADOR DE TRAZOS MÁGICO (HERRAMIENTA PARA CREAR CUALQUIER TRAZO)
  // ==========================================================================
  renderGeneradorTrazos(container) {
    this.cleanup();

    const alphabetUpper = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    const alphabetLower = 'abcdefghijklmnñopqrstuvwxyz'.split('');
    const numbersList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="generatorModule">
        <header class="tracing-header">
          <button class="back-btn" id="btnBackFromGenerator">⬅️ Menú</button>
          
          <div style="text-align:center;">
            <h2 style="color:#6a1b9a; margin:0; font-size:clamp(1.1rem, 2.5vw, 1.5rem);">GENERADOR MÁGICO DE TRAZOS ✨</h2>
            <div style="font-size:0.8rem; font-weight:bold; color:#e65100;">Elige o escribe cualquier letra o palabra para generar su guía escolar</div>
          </div>

          <div class="header-actions">
            <div class="mini-crayons-bar">
              <button class="mini-crayon active" data-color="#e91e63" style="background:#e91e63;"></button>
              <button class="mini-crayon" data-color="#ff5722" style="background:#ff5722;"></button>
              <button class="mini-crayon" data-color="#4caf50" style="background:#4caf50;"></button>
              <button class="mini-crayon" data-color="#00bcd4" style="background:#00bcd4;"></button>
              <button class="mini-crayon" data-color="#9c27b0" style="background:#9c27b0;"></button>
            </div>
            <button class="clear-btn" id="btnClearGeneratorCanvas">🧹 Limpiar</button>
          </div>
        </header>

        <!-- Barra selectora de pestañas del generador -->
        <div class="generator-tabs-bar">
          <button class="gen-tab-btn ${this.generatorTab === 'abecedario' ? 'active' : ''}" data-tab="abecedario">🔤 Abecedario</button>
          <button class="gen-tab-btn ${this.generatorTab === 'numeros' ? 'active' : ''}" data-tab="numeros">🔢 Números</button>
          <button class="gen-tab-btn ${this.generatorTab === 'palabra' ? 'active' : ''}" data-tab="palabra">✏️ Escribe Palabra</button>
        </div>

        <!-- Panel selector de caracteres -->
        <div class="generator-palette-box" id="generatorPaletteBox">
          ${this.generatorTab === 'abecedario' ? `
            <div class="gen-char-grid">
              ${alphabetUpper.map(ch => `
                <button class="gen-char-pill ${this.generatorTarget === ch && this.generatorIsUpper ? 'active' : ''}" data-char="${ch}" data-upper="true">${ch}</button>
              `).join('')}
            </div>
            <div class="gen-char-grid" style="margin-top:6px;">
              ${alphabetLower.map(ch => `
                <button class="gen-char-pill ${this.generatorTarget === ch && !this.generatorIsUpper ? 'active' : ''}" data-char="${ch}" data-upper="false">${ch}</button>
              `).join('')}
            </div>
          ` : this.generatorTab === 'numeros' ? `
            <div class="gen-char-grid numbers-grid">
              ${numbersList.map(num => `
                <button class="gen-char-pill ${this.generatorTarget === num ? 'active' : ''}" data-char="${num}" data-upper="true">${num}</button>
              `).join('')}
            </div>
          ` : `
            <div class="gen-custom-word-bar">
              <input type="text" id="genWordInput" class="gen-word-input" maxlength="10" placeholder="Escribe aquí (ej. MAMA)" value="${this.generatorTarget}" />
              <button class="gen-action-btn" id="btnGenerateCustomWord">Generar Trazos ✨</button>
            </div>
          `}
        </div>

        <!-- Cuaderno de dibujo del generador -->
        <main class="notebook-workspace" style="flex:1;">
          <div class="notebook-grid-container" id="generatorGridContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>
        </main>
      </div>
    `;

    this.setupCanvases(container);
    this.loadGeneratorTarget();
    this.drawBackground();
    this.startFxLoop();
    this.bindGeneratorEvents(container);

    audio.speak(`Generador de trazos listo para la letra ${this.generatorTarget}`);
  }

  loadGeneratorTarget() {
    if (!this.paintCanvas) return;
    const W = this.paintCanvas.width;
    const H = this.paintCanvas.height;

    this.activeStrokes = [];
    this.currentStrokeIndex = 0;
    this.gridLetters = [];
    this.currentLetterIndex = 0;

    // Si es una palabra de varias letras
    if (this.generatorTarget.length > 1) {
      const chars = this.generatorTarget.split('');
      this.totalRowLetters = chars.length;
      this.rowLettersCompleted = new Array(this.totalRowLetters).fill(false);

      const rowBounds = { x: 30, y: 110, width: 700, height: 210 };
      this.gridLetters = StrokeGenerator.generateRowLayout(chars, rowBounds);

      this.currentLetterIndex = 0;
      this.activeStrokes = this.gridLetters[0]?.strokes || [];
      this.levelConfig = { type: 'grid_row', char: chars[0] };
    } else {
      // Letra o número único grande centrado
      const bounds = { x: (W - 320) / 2, y: 50, width: 320, height: 320 };
      this.activeStrokes = StrokeGenerator.getStrokes(this.generatorTarget, bounds, this.generatorIsUpper);
      this.levelConfig = { type: 'generator_single', char: this.generatorTarget };
      this.totalRowLetters = this.activeStrokes.length;
    }

    if (this.paintCtx) {
      this.paintCtx.clearRect(0, 0, W, H);
    }
  }

  bindGeneratorEvents(container) {
    container.querySelector('#btnBackFromGenerator')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = null;
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearGeneratorCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    container.querySelectorAll('.gen-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        this.generatorTab = e.currentTarget.dataset.tab;
        this.renderGeneradorTrazos(container);
      });
    });

    container.querySelectorAll('.gen-char-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        this.generatorTarget = e.currentTarget.dataset.char;
        this.generatorIsUpper = (e.currentTarget.dataset.upper === 'true');
        container.querySelectorAll('.gen-char-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.loadGeneratorTarget();
        this.drawBackground();
        audio.speak(`Traza la letra ${this.generatorTarget}`);
      });
    });

    container.querySelector('#btnGenerateCustomWord')?.addEventListener('click', () => {
      const input = container.querySelector('#genWordInput');
      const val = (input?.value || 'SOL').trim().toUpperCase();
      if (!val) return;

      audio.playCelebration();
      this.generatorTarget = val;
      this.loadGeneratorTarget();
      this.drawBackground();
      audio.speak(`Generando trazos para la palabra ${val}`);
    });

    // Crayones
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
      this.handlePointerMove(pt.x, pt.y);
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

  // ==========================================================================
  // VISTA 5: PIZARRA MÁGICA ESCOLAR (DIBUJO LIBRE)
  // ==========================================================================
  renderPizarraMagica(container) {
    this.cleanup();

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="pizarraModule">
        <header class="tracing-header pizarra-header">
          <button class="back-btn" id="btnBackFromPizarra">⬅️ Menú</button>
          
          <div class="crayons-palette">
            <button class="crayon-pill active" data-color="#ff5722" style="background:#ff5722;">🖍️</button>
            <button class="crayon-pill" data-color="#e91e63" style="background:#e91e63;">🖍️</button>
            <button class="crayon-pill" data-color="#ff9800" style="background:#ff9800;">🖍️</button>
            <button class="crayon-pill" data-color="#4caf50" style="background:#4caf50;">🖍️</button>
            <button class="crayon-pill" data-color="#00bcd4" style="background:#00bcd4;">🖍️</button>
            <button class="crayon-pill" data-color="#9c27b0" style="background:#9c27b0;">🖍️</button>
          </div>

          <button class="clear-btn" id="btnClearPizarra">🧹 Limpiar</button>
        </header>

        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>PIZARRA MÁGICA ESCOLAR</h2>
            <p class="notebook-instruction">🎨 Dibuja, escribe y raya libremente sobre la cuadrícula del cuaderno con tus crayones.</p>
          </div>

          <div class="notebook-grid-container" id="pizarraGridContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>
        </main>
      </div>
    `;

    this.setupCanvases(container);
    this.drawNotebookGridOnly();
    this.startFxLoop();

    container.querySelectorAll('.crayon-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        container.querySelectorAll('.crayon-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCrayonColor = btn.dataset.color || '#ff5722';
      });
    });

    container.querySelector('#btnBackFromPizarra')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = null;
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearPizarra')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    const canvas = this.paintCanvas;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.isDrawing = true;
      const pt = this.getCanvasPoint(e);
      this.lastPoint = pt;
      this.drawCrayonPoint(pt.x, pt.y);
      audio.playBrush();
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (!this.isDrawing || !this.lastPoint) return;
      const pt = this.getCanvasPoint(e);
      this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, pt.x, pt.y);
      this.lastPoint = pt;
    }, { passive: false });

    const stopDraw = () => {
      this.isDrawing = false;
      this.lastPoint = null;
    };
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);
  }

  drawNotebookGridOnly() {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    ctx.clearRect(0, 0, W, H);
    const gridSize = 38;
    ctx.strokeStyle = 'rgba(41, 182, 246, 0.25)';
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
  }

  // ==========================================================================
  // HELPERS Y LIMPIEZA
  // ==========================================================================
  setupArabot(container) {
    const anchor = container.querySelector('#arabotAnchor');
    if (!anchor) return;

    this.arabot = new ArabotAssistant({
      onHelpClick: () => {
        if (this.arabot) {
          this.arabot.speak(`¡Sigue las flechas y la estrellita dorada para hacer tu trazo! ⭐`);
          this.arabot.bounceHead();
        }
      }
    });

    this.arabot.mount(anchor);
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

  clearPaintCanvas() {
    if (this.paintCtx && this.paintCanvas) {
      this.paintCtx.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
    }
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };
    if (this.rowLettersCompleted) {
      this.rowLettersCompleted.fill(false);
    }
    if (this.activeSubgame === 'generador_trazos') {
      this.loadGeneratorTarget();
    } else {
      this.initLevelStrokes();
    }
    this.drawBackground();

    const label = document.getElementById('completedCountLabel');
    if (label) label.innerText = '0';

    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) treeZone.classList.remove('colored');
  }

  emitStarBurst(x, y) {
    const colors = ['#ffd700', '#ffeb3b', '#ff9800', '#00e5ff', '#76ff03', '#ff4081'];
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        y: y,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.035 + Math.random() * 0.02
      });
    }
  }

  resetState() {
    this.activeSubgame = null;
    this.currentLevel = null;
    this.cleanup();
  }

  cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.paintCanvas && this.boundPointerUp) {
      this.paintCanvas.removeEventListener('pointermove', this.boundPointerMove);
      this.paintCanvas.removeEventListener('pointerup', this.boundPointerUp);
      this.paintCanvas.removeEventListener('pointercancel', this.boundPointerUp);
      this.boundPointerUp = null;
      this.boundPointerMove = null;
    }
    if (this.arabot) {
      this.arabot.destroy();
      this.arabot = null;
    }
    this.sparkles = [];
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
  { consonant: 'P', vowel: 'I', syllable: 'PI', word: 'PIÑA', relationText: 'PIÑA y PISTA (¡con P y S!)', emoji: '🍍' },
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
              this.currentLevel = this.currentLevel + 1;
              this.render(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1400);

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
              this.currentLevel = this.currentLevel + 1;
              this.render(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1400);

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
              this.currentLevel = this.currentLevel + 1;
              this.renderGame(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1400);

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
        this.currentLevel = 2;
        this.renderGame(container);
      }, 1200);
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
              this.currentLevel = this.currentLevel + 1;
              this.renderGame(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1400);
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
        this.currentLevel = 2;
        this.renderGame(container);
      }, 1200);
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
              this.currentLevel = this.currentLevel + 1;
              this.renderGame(container);
            } else {
              this.currentLevel = null;
              this.render(container);
            }
          }, 1400);
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


  // Inicialización inmediata y segura en cualquier entorno
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
