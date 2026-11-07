/**
 * ArabotAssistant.ts - Asistente pedagógico interactivo "ARABOT"
 * Diseñado para ubicarse en la zona central superior (sin estorbar botones)
 * con tutorial animado demostrativo y botón de ayuda para niños de preescolar.
 */
import { audio } from '../core/AudioManager.js';

export interface ArabotOptions {
  container?: HTMLElement;
  onHelpClick?: () => void;
}

export class ArabotAssistant {
  private container: HTMLElement | null = null;
  private rootElement: HTMLElement | null = null;
  private speechBubble: HTMLElement | null = null;
  private pointerElement: HTMLElement | null = null;
  private isTutorialRunning: boolean = false;
  private speechTimeout: any = null;
  private onHelpClickCallback: (() => void) | null = null;

  constructor(options: ArabotOptions = {}) {
    if (options.onHelpClick) {
      this.onHelpClickCallback = options.onHelpClick;
    }
  }

  mount(parentContainer: HTMLElement): HTMLElement {
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

  private bindEvents() {
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

  speak(text: string, durationMs: number = 3200, callback?: () => void) {
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
    void (head as HTMLElement).offsetWidth;
    head.classList.add('arabot-jump');
  }

  celebrate(text: string = '¡Excelente! ¡A de Árbol! 🌳⭐', durationMs: number = 3000) {
    const normalEyes = this.rootElement?.querySelector('#arabotEyesNormal') as HTMLElement;
    const celebrateEyes = this.rootElement?.querySelector('#arabotEyesCelebrate') as HTMLElement;

    if (normalEyes) normalEyes.style.display = 'none';
    if (celebrateEyes) celebrateEyes.style.display = 'block';

    this.bounceHead();

    this.speak(text, durationMs, () => {
      if (normalEyes) normalEyes.style.display = 'block';
      if (celebrateEyes) celebrateEyes.style.display = 'none';
    });
  }

  playTutorial(
    canvasElement: HTMLCanvasElement,
    strokes: Array<{ name: string; from: { x: number; y: number }; to: { x: number; y: number } }>,
    onComplete?: () => void
  ) {
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
