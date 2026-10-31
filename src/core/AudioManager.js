/**
 * AudioManager - Motor de audio interactivo offline
 * Utiliza Web Audio API para sintetizar sonidos mágicos y festivos en tiempo real
 * sin requerir conexión a internet ni archivos externos obligatorios,
 * además de la API de síntesis de voz (SpeechSynthesis) para fonética en español.
 */
import { StorageManager } from './StorageManager.js';

export class AudioManager {
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

export const audio = new AudioManager();

