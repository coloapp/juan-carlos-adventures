/**
 * main.js - Punto de entrada principal de Juan Carlos's Adventures
 * Orquestador de vistas, navegación y ciclo de vida de la aplicación.
 */
import { StorageManager } from './core/StorageManager.js';
import { audio } from './core/AudioManager.js';
import { HomeScreen } from './modules/HomeScreen.js';
import { NameTracingScreen } from './modules/NameTracingScreen.js';
import { LetterTracingScreen } from './modules/LetterTracingScreen.js';
import { SyllablesScreen } from './modules/SyllablesScreen.js';
import { NumbersScreen } from './modules/NumbersScreen.js';
import { VowelsScreen } from './modules/VowelsScreen.js';
import { ShapesScreen } from './modules/ShapesScreen.js';
import { OpenWorldScreen } from './modules/OpenWorldScreen.js';

export class App {
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
window.addEventListener('DOMContentLoaded', () => {
  window.__APP_INSTANCE = new App();
});

