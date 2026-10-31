/**
 * StorageManager - Gestor 100% offline para almacenamiento local
 * Maneja datos de perfil de alumnos, progreso, estrellas e inventario.
 */
export class StorageManager {
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
}

