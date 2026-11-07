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
  }
};

/**
 * Obtiene los datos pedagógicos completos para una letra
 */
function getPedagogicalLetter(letter) {
  const char = (letter || 'A').toUpperCase();
  if (PEDAGOGICAL_LETTERS[char]) {
    return PEDAGOGICAL_LETTERS[char];
  }

  // Generador dinámico para cualquier otra letra del abecedario
  const wp = getWaypointsForLetter(char);
  return {
    letter: char,
    lowercase: char.toLowerCase(),
    word: `${char}`,
    phonetic: `Letra ${char}`,
    icon: '⭐',
    tutorialStrokes: [
      { name: `Paso 1: Trazo de la ${char}`, from: { x: wp[0].x * 0.6, y: wp[0].y }, to: { x: wp[wp.length - 1].x * 0.6, y: wp[wp.length - 1].y } }
    ],
    uppercaseStrokes: [
      {
        id: `${char}1`,
        step: 1,
        arrow: '➔',
        label: '1',
        description: `Trazo de la letra ${char}`,
        points: wp.map(p => ({ x: p.x * 0.55 + 0.05, y: p.y }))
      }
    ],
    lowercaseStrokes: [
      {
        id: `${char.toLowerCase()}1`,
        step: 1,
        arrow: '↓',
        label: '1',
        description: `Minúscula ${char.toLowerCase()}`,
        points: [
          { x: 0.75, y: 0.40 },
          { x: 0.65, y: 0.60 },
          { x: 0.75, y: 0.80 },
          { x: 0.85, y: 0.60 }
        ]
      }
    ],
    getSurpriseSvg: () => `
      <svg class="surprise-svg generic-illustration" viewBox="0 0 200 220" width="100%" height="100%">
        <circle cx="100" cy="110" r="50" fill="#ffb74d" stroke="#f57c00" stroke-width="4"/>
        <text x="100" y="130" font-size="64" font-weight="900" fill="#ffffff" text-anchor="middle">${char}</text>
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
        this.currentLevel = null;
        this.render(container);
      }
    }, 1200);

    audio.speak(`¡Excelente trabajo ${this.student.name}! ¡Nivel ${this.currentLevel} completado!`);
  }
}


  /* ==========================================================================
     FILE: src/modules/LetterTracingScreen.js
     ========================================================================== */

/**
 * LetterTracingScreen.js - Módulo de Trazado de Letras y Caligrafía
 * Arquitectura modular con Menú de 10 Juegos en Círculos (50 niveles cada uno),
 * selector de 50 circulitos por juego y motor de cuadernillo interactivo con cuadrícula escolar,
 * doble trazo hueco idéntico al cuaderno físico escolar (Mayúscula y Minúscula),
 * flechas numeradas, dibujo sorpresa para colorear, asistente ARABOT centrado,
 * cero trazos duplicados o desfasados, y transición automática de niveles sin alertas.
 */
// ============================================================================
// CATÁLOGO DE LOS 10 JUEGOS EN CÍRCULOS DEL MÓDULO DE TRAZOS (50 NIVELES C/U)
// ============================================================================
const TRACING_SUBGAMES = [
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
class LetterTracingScreen {
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
