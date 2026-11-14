/**
 * verify_navigation.js - Test Suite Automatizado de Navegación e Interacción
 * Simula el entorno DOM completo y ejecuta pruebas de clic reales sobre todos
 * los módulos, subjuegos en círculos, selectores de 50 niveles y lienzos.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';

console.log('🧪 INICIANDO TEST SUITE AUTOMATIZADO DE NAVEGACIÓN...');

// 1. Mock minimalista de DOM para Node.js
class MockClassList {
  constructor(el) { this.el = el; this.classes = new Set(); }
  add(...names) { names.forEach(n => this.classes.add(n)); }
  remove(...names) { names.forEach(n => this.classes.delete(n)); }
  contains(n) { return this.classes.has(n); }
  toggle(n) { if (this.contains(n)) this.remove(n); else this.add(n); }
  get length() { return this.classes.size; }
  toString() { return Array.from(this.classes).join(' '); }
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.style = {};
    this.classList = new MockClassList(this);
    this.listeners = {};
    this._innerHTML = '';
    this._innerText = '';
    this.width = 760;
    this.height = 420;
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = val;
    this.children = [];
    this.parseSimpleHTML(val);
  }

  get innerText() { return this._innerText; }
  set innerText(val) { this._innerText = val; }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }

  addEventListener(type, cb) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  removeEventListener(type, cb) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(f => f !== cb);
  }

  dispatchEvent(evt) {
    const list = this.listeners[evt.type] || [];
    list.forEach(cb => cb(evt));
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, currentTarget: this, preventDefault: () => { } });
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (node) => {
      let matches = false;
      if (selector.startsWith('#')) {
        matches = (node.id === selector.slice(1));
      } else if (selector.startsWith('.')) {
        matches = node.classList.contains(selector.slice(1));
      } else if (selector.startsWith('[')) {
        const m = selector.match(/\[([a-zA-Z0-9_-]+)="?([^"\]]+)"?\]/);
        if (m) {
          const attr = m[1];
          const val = m[2];
          if (attr.startsWith('data-')) {
            const dataKey = attr.replace('data-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            matches = (node.dataset[dataKey] === val);
          }
        }
      } else {
        matches = (node.tagName.toLowerCase() === selector.toLowerCase());
      }
      if (matches) results.push(node);
      for (const ch of node.children) check(ch);
    };

    for (const ch of this.children) check(ch);
    return results;
  }

  getContext(type) {
    return {
      clearRect: () => { },
      fillRect: () => { },
      beginPath: () => { },
      moveTo: () => { },
      lineTo: () => { },
      stroke: () => { },
      fill: () => { },
      arc: () => { },
      ellipse: () => { },
      quadraticCurveTo: () => { },
      save: () => { },
      restore: () => { },
      strokeText: () => { },
      fillText: () => { },
      setLineDash: () => { },
      translate: () => { },
      rotate: () => { },
      closePath: () => { }
    };
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 760, height: 420, right: 760, bottom: 420 };
  }

  setPointerCapture() { }

  // Parser simple de tags para generar árbol DOM básico
  parseSimpleHTML(html) {
    // Buscar tags con id, class y data-*
    const tagRegex = /<([a-zA-Z0-9]+)([^>]*)>/g;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const tag = match[1];
      const attrs = match[2];
      if (tag.startsWith('/')) continue;

      const el = new MockElement(tag);
      const idMatch = attrs.match(/id="([^"]+)"/);
      if (idMatch) el.id = idMatch[1];

      const classMatch = attrs.match(/class="([^"]+)"/);
      if (classMatch) {
        classMatch[1].split(/\s+/).forEach(c => el.classList.add(c));
      }

      const dataRegex = /data-([a-zA-Z0-9_-]+)="([^"]*)"/g;
      let dataMatch;
      while ((dataMatch = dataRegex.exec(attrs)) !== null) {
        const key = dataMatch[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        el.dataset[key] = dataMatch[2];
      }

      this.appendChild(el);
    }
  }
}

// 2. Mock Global Environment
const documentMock = {
  readyState: 'complete',
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => {
    if (windowMock.__appRoot && windowMock.__appRoot.id === id) return windowMock.__appRoot;
    return windowMock.__appRoot.querySelector('#' + id);
  },
  querySelector: (sel) => {
    if (sel === '#app' && windowMock.__appRoot) return windowMock.__appRoot;
    return windowMock.__appRoot.querySelector(sel);
  },
  querySelectorAll: (sel) => windowMock.__appRoot.querySelectorAll(sel),
  addEventListener: () => { },
  body: new MockElement('body')
};

const localStorageMock = {
  data: {},
  getItem: (k) => localStorageMock.data[k] || null,
  setItem: (k, v) => { localStorageMock.data[k] = v; },
  removeItem: (k) => { delete localStorageMock.data[k]; },
  clear: () => { localStorageMock.data = {}; }
};

const windowMock = {
  document: documentMock,
  localStorage: localStorageMock,
  addEventListener: () => { },
  removeEventListener: () => { },
  history: {
    pushState: () => { },
    replaceState: () => { }
  },
  location: { hash: '' },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  AudioContext: class {
    constructor() { this.state = 'running'; }
    createOscillator() { return { connect: () => { }, start: () => { }, stop: () => { }, type: 'sine', frequency: { setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { } } }; }
    createGain() { return { connect: () => { }, gain: { setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { }, linearRampToValueAtTime: () => { } } }; }
  },
  speechSynthesis: {
    speak: () => { },
    cancel: () => { },
    getVoices: () => []
  },
  SpeechSynthesisUtterance: class { },
  HTMLElement: MockElement,
  Event: class { constructor(type) { this.type = type; } },
  CustomEvent: class { constructor(type, opt) { this.type = type; this.detail = opt?.detail; } }
};

windowMock.window = windowMock;
const appRoot = new MockElement('div');
appRoot.id = 'app';
windowMock.__appRoot = appRoot;
documentMock.body.appendChild(appRoot);

// 3. Cargar y Evaluar bundle.js
const bundlePath = path.resolve('bundle.js');
const bundleCode = fs.readFileSync(bundlePath, 'utf-8');

const context = vm.createContext(windowMock);
vm.runInContext(bundleCode, context);

const app = windowMock.__APP_INSTANCE;
if (!app) {
  console.error('❌ ERROR: No se instanció __APP_INSTANCE en window.');
  process.exit(1);
}

console.log('✅ Bundle cargado exitosamente.');

// 4. Batería de Pruebas Automatizadas
const tests = [
  {
    name: 'Navegación al Home',
    run: () => {
      app.navigate('home');
      const home = appRoot.querySelector('.main-dashboard');
      if (!home) throw new Error('No se encontró el dashboard principal');
    }
  },
  {
    name: 'Módulo de Trazos: Entrada y Menú de Subjuegos',
    run: () => {
      app.navigate('letter-tracing');
      const subgamesMenu = appRoot.querySelector('#tracingSubgamesMenu');
      if (!subgamesMenu) throw new Error('No se renderizó el menú de subjuegos en círculos');
      const cards = appRoot.querySelectorAll('.subgame-circle-card');
      if (cards.length < 3) throw new Error(`Se esperaban al menos 3 tarjetas de subjuegos, se encontraron: ${cards.length}`);
    }
  },
  {
    name: 'Módulo de Trazos: Clic en "CUADERNILLO: LAS 5 VOCALES" y Selector de Niveles',
    run: () => {
      const card = appRoot.querySelector('[data-game="vocales_cuadernillo"]');
      if (!card) throw new Error('No se encontró la tarjeta vocales_cuadernillo');
      card.click();

      // Debe renderizar el LevelSelector con 50 niveles
      const levelSelector = appRoot.querySelector('.level-selector-module');
      if (!levelSelector) throw new Error('No se abrió el LevelSelector tras hacer clic en Vocales');
      const levelCircles = appRoot.querySelectorAll('.level-circle-node');
      if (levelCircles.length === 0) throw new Error('No se renderizaron los circulitos de niveles');
    }
  },
  {
    name: 'Módulo de Trazos: Clic en Nivel 1 (Letra A y Árbol)',
    run: () => {
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (!node1) throw new Error('No se encontró el nodo del nivel 1');
      node1.click();

      const tracingModule = appRoot.querySelector('#tracingModule');
      if (!tracingModule) throw new Error('No se abrió la pantalla del Nivel 1');

      const bgCanvas = appRoot.querySelector('#bgCanvas');
      const paintCanvas = appRoot.querySelector('#paintCanvas');
      const fxCanvas = appRoot.querySelector('#fxCanvas');
      if (!bgCanvas || !paintCanvas || !fxCanvas) {
        throw new Error('No se crearon los lienzos superpuestos (bgCanvas, paintCanvas, fxCanvas)');
      }
    }
  },
  {
    name: 'Módulo de Trazos: Clic en botón "⬅️ Niveles" y retorno limpio',
    run: () => {
      const backBtn = appRoot.querySelector('#btnBackToLevels');
      if (!backBtn) throw new Error('No se encontró el botón btnBackToLevels');
      backBtn.click();

      const levelSelector = appRoot.querySelector('.level-selector-module');
      if (!levelSelector) throw new Error('No regresó al LevelSelector');
    }
  },
  {
    name: 'Módulo de Trazos: Clic en botón "⬅️ Menú" y retorno a los 10 juegos',
    run: () => {
      const backHomeBtn = appRoot.querySelector('#btnBackHomeFromLevels');
      if (!backHomeBtn) throw new Error('No se encontró el botón btnBackHomeFromLevels');
      backHomeBtn.click();

      const subgamesMenu = appRoot.querySelector('#tracingSubgamesMenu');
      if (!subgamesMenu) throw new Error('No regresó al menú de 10 juegos en círculos');
    }
  },
  {
    name: 'Módulo de Trazos: Clic en los 10 juegos circulares uno por uno',
    run: () => {
      app.navigate('letter-tracing');
      const subgames = [
        'vocales_cuadernillo',
        'consonantes_cuadernillo',
        'letra_m',
        'letra_s',
        'letra_t',
        'letra_l',
        'letra_p',
        'letra_n',
        'letra_r'
      ];

      for (const gameId of subgames) {
        app.screens['letter-tracing'].resetState();
        app.navigate('letter-tracing');
        const card = appRoot.querySelector(`[data-game="${gameId}"]`);
        if (!card) throw new Error(`No se encontró la tarjeta del juego ${gameId}`);
        card.click();

        const levelSelector = appRoot.querySelector('.level-selector-module');
        if (!levelSelector) throw new Error(`El juego ${gameId} no abrió el LevelSelector al hacer clic`);

        const node1 = appRoot.querySelector('[data-level="1"]');
        if (!node1) throw new Error(`El juego ${gameId} no tiene nivel 1`);
        node1.click();

        const tracingModule = appRoot.querySelector('#tracingModule');
        if (!tracingModule) throw new Error(`El juego ${gameId} no abrió la pantalla del nivel 1`);

        // Simular trazo del niño sobre el lienzo
        const paintCanvas = appRoot.querySelector('#paintCanvas');
        if (!paintCanvas) throw new Error(`El juego ${gameId} no tiene paintCanvas`);

        paintCanvas.dispatchEvent({
          type: 'pointerdown',
          pointerId: 1,
          clientX: 200,
          clientY: 200,
          preventDefault: () => { }
        });
        paintCanvas.dispatchEvent({
          type: 'pointermove',
          pointerId: 1,
          clientX: 210,
          clientY: 210,
          preventDefault: () => { }
        });
        paintCanvas.dispatchEvent({
          type: 'pointerup',
          pointerId: 1,
          preventDefault: () => { }
        });
      }
    }
  },
  {
    name: 'Motor de Memoria Muscular: Validación de no-autocompletado al toque y avance por recorrido continuo',
    run: () => {
      app.screens['letter-tracing'].resetState();
      app.navigate('letter-tracing');
      const card = appRoot.querySelector('[data-game="vocales_cuadernillo"]');
      if (!card) throw new Error('No se encontró vocales_cuadernillo');
      card.click();
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (!node1) throw new Error('No se encontró nivel 1');
      node1.click();

      const screen = app.screens['letter-tracing'];
      const paintCanvas = appRoot.querySelector('#paintCanvas');
      if (!paintCanvas) throw new Error('No se encontró paintCanvas');

      // 1. Simular toque estático (tap simple) sobre el inicio del trazo A1 (x: 150, y: 75)
      paintCanvas.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: 150,
        clientY: 75,
        preventDefault: () => {}
      });
      paintCanvas.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      // Debe estar INCOMPLETO (NO "boom se llena" con un solo toque)
      if (screen.hollowStrokesCompleted.upper.size > 0) {
        throw new Error('Fallo de memoria muscular: Un simple toque autocompletó el trazo.');
      }

      // 2. Simular recorrido real a lo largo de la diagonal izquierda (de arriba hacia abajo)
      // A1 va desde (0.1974*760=150, 0.1786*420=75) hacia (0.1026*760=78, 0.7738*420=325)
      paintCanvas.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: 150,
        clientY: 75,
        preventDefault: () => {}
      });

      for (let s = 1; s <= 20; s++) {
        const t = s / 20;
        const curX = 150 + (78 - 150) * t;
        const curY = 75 + (325 - 75) * t;
        paintCanvas.dispatchEvent({
          type: 'pointermove',
          pointerId: 1,
          clientX: curX,
          clientY: curY,
          preventDefault: () => {}
        });
      }

      paintCanvas.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      // Ahora que hizo el recorrido completo con su dedo, el trazo A1 debe completarse exitosamente
      if (!screen.hollowStrokesCompleted.upper.has('A1')) {
        throw new Error('Fallo de memoria muscular: El recorrido continuo no validó el trazo A1.');
      }

      // 3. Probar Nivel 2 (Renglón de cuadrícula de 4 letras A amplias)
      screen.currentLevel = 2;
      screen.renderLevelGame(appRoot);

      const paintCanvas2 = appRoot.querySelector('#paintCanvas');
      if (!paintCanvas2) throw new Error('No se encontró paintCanvas en nivel 2');

      const letter0 = screen.gridLetters[0];
      if (!letter0 || letter0.strokes.length !== 3) {
        throw new Error('La letra A del renglón debe tener exactamente 3 trazos');
      }

      const [s1, s2, s3] = letter0.strokes;

      // 3.1 Simular tap simple en el inicio del trazo 1: NO debe completarse
      paintCanvas2.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: s1.startPoint.x,
        clientY: s1.startPoint.y,
        preventDefault: () => {}
      });
      paintCanvas2.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      if (s1.completed || screen.rowLettersCompleted[0]) {
        throw new Error('Fallo de memoria muscular: Un simple toque autocompletó el trazo en el renglón.');
      }

      // 3.2 Trazar Paso 1 continuo (diagonal izquierda)
      paintCanvas2.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: s1.startPoint.x,
        clientY: s1.startPoint.y,
        preventDefault: () => {}
      });
      for (const pt of s1.checkpoints) {
        paintCanvas2.dispatchEvent({
          type: 'pointermove',
          pointerId: 1,
          clientX: pt.x,
          clientY: pt.y,
          preventDefault: () => {}
        });
      }
      paintCanvas2.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      if (!s1.completed) {
        throw new Error('El trazo 1 (diagonal izquierda) de la A no se completó tras el recorrido.');
      }

      // 3.3 Trazar Paso 2 continuo (diagonal derecha)
      paintCanvas2.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: s2.startPoint.x,
        clientY: s2.startPoint.y,
        preventDefault: () => {}
      });
      for (const pt of s2.checkpoints) {
        paintCanvas2.dispatchEvent({
          type: 'pointermove',
          pointerId: 1,
          clientX: pt.x,
          clientY: pt.y,
          preventDefault: () => {}
        });
      }
      paintCanvas2.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      if (!s2.completed) {
        throw new Error('El trazo 2 (diagonal derecha) de la A no se completó tras el recorrido.');
      }

      // 3.4 VERIFICACIÓN CRÍTICA: Tras completar paso 1 y 2, la letra NO debe avanzar sin el paso 3
      if (screen.rowLettersCompleted[0] || screen.currentStrokeIndex !== 2) {
        throw new Error('ERROR CRÍTICO: La letra A avanzó antes de trazar el paso 3 (barra central).');
      }

      // 3.5 Trazar Paso 3 continuo (barra central horizontal de izquierda a derecha)
      paintCanvas2.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: s3.startPoint.x,
        clientY: s3.startPoint.y,
        preventDefault: () => {}
      });
      for (const pt of s3.checkpoints) {
        paintCanvas2.dispatchEvent({
          type: 'pointermove',
          pointerId: 1,
          clientX: pt.x,
          clientY: pt.y,
          preventDefault: () => {}
        });
      }
      paintCanvas2.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      if (!s3.completed) {
        throw new Error('El trazo 3 (barra central) de la A no se completó tras el recorrido.');
      }

      // Ahora que se completaron los 3 pasos, la letra 0 sí debe estar completada y avanzar
      if (!screen.rowLettersCompleted[0]) {
        throw new Error('La letra A debió completarse al finalizar los 3 pasos.');
      }
    }
  },
  {
    name: 'Módulo de Números: Menú de Subjuegos, Selector y Nivel 1',
    run: () => {
      app.navigate('numbers');
      const menu = appRoot.querySelector('#numbersSubgamesMenu');
      if (!menu) throw new Error('Números no abrió el menú de subjuegos en círculos');
      const card = appRoot.querySelector('[data-game="tren_matematico"]');
      if (!card) throw new Error('No se encontró la tarjeta tren_matematico');
      card.click();

      const selector = appRoot.querySelector('.level-selector-module');
      if (!selector) throw new Error('Números no abrió el LevelSelector');
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (!node1) throw new Error('No se encontró el nivel 1 de Números');
      node1.click();

      const game = appRoot.querySelector('#trenMatematicoModule');
      if (!game) throw new Error('No se abrió el juego El Tren Matemático');
    }
  },
  {
    name: 'Módulo de Figuras: Menú de Subjuegos, Selector y Nivel 1',
    run: () => {
      app.navigate('shapes');
      const menu = appRoot.querySelector('#shapesSubgamesMenu');
      if (!menu) throw new Error('Figuras no abrió el menú de subjuegos en círculos');
      const card = appRoot.querySelector('[data-game="desafio_figuras"]');
      if (!card) throw new Error('No se encontró la tarjeta desafio_figuras');
      card.click();

      const selector = appRoot.querySelector('.level-selector-module');
      if (!selector) throw new Error('Figuras no abrió el LevelSelector');
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (!node1) throw new Error('No se encontró el nivel 1 de Figuras');
      node1.click();

      const game = appRoot.querySelector('#desafioFigurasModule');
      if (!game) throw new Error('No se abrió el juego Desafío de Figuras');
    }
  },
  {
    name: 'Módulo de Vocales: Menú de Subjuegos, Selector y Nivel 1',
    run: () => {
      app.navigate('vowels');
      const menu = appRoot.querySelector('#vowelsSubgamesMenu');
      if (!menu) throw new Error('Vocales no abrió el menú de subjuegos en círculos');
      const card = appRoot.querySelector('[data-game="cual_es_vocal"]');
      if (!card) throw new Error('No se encontró la tarjeta cual_es_vocal');
      card.click();

      const selector = appRoot.querySelector('.level-selector-module');
      if (!selector) throw new Error('Vocales no abrió el LevelSelector');
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (!node1) throw new Error('No se encontró el nivel 1 de Vocales');
      node1.click();

      const game = appRoot.querySelector('#cualEsVocalModule');
      if (!game) throw new Error('No se abrió el juego ¿Cuál es la Vocal?');
    }
  },
  {
    name: 'Módulo de Traza tu Nombre: Entrada y Selector',
    run: () => {
      app.navigate('name-tracing');
      const menu = appRoot.querySelector('#nameTracingSubgamesMenu');
      if (!menu) throw new Error('No se abrió el menú de subjuegos de Name Tracing');

      const card = appRoot.querySelector('[data-game="mi_nombre"]');
      if (!card) throw new Error('No se encontró la tarjeta mi_nombre');
      card.click();

      const levelSelector = appRoot.querySelector('.level-selector-module');
      if (!levelSelector) throw new Error('No se abrió el LevelSelector de Name Tracing');

      const node1 = appRoot.querySelector('[data-level="1"]');
      if (!node1) throw new Error('No se encontró el nivel 1 de Name Tracing');
      node1.click();

      const nameModule = appRoot.querySelector('#nameTracingModule');
      if (!nameModule) throw new Error('No se abrió la pantalla del nombre JUAN CARLOS');

      const ribbon = appRoot.querySelector('#nameProgressContainer');
      if (!ribbon) throw new Error('No se renderizó la cinta de letras del nombre');
    }
  },
  {
    name: 'Módulo de Traza tu Nombre: Trazado Continuo de la Letra J y Memoria Muscular',
    run: () => {
      const screen = app.screens['name-tracing'];
      const paintCanvas = appRoot.querySelector('#paintCanvas');
      if (!paintCanvas) throw new Error('No se encontró paintCanvas en NameTracingScreen');

      const initialStroke = screen.activeStrokes[0];
      if (!initialStroke) throw new Error('No hay trazos activos generados para la letra J');

      // 1. Toque simple (tap): NO debe autocompletar
      paintCanvas.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: initialStroke.startPoint.x,
        clientY: initialStroke.startPoint.y,
        preventDefault: () => {}
      });
      paintCanvas.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      if (screen.currentStrokeIndex > 0 || initialStroke.completed) {
        throw new Error('Fallo de memoria muscular: Un simple toque autocompletó el trazo en Traza tu Nombre');
      }

      // 2. Trazo continuo siguiendo todos los checkpoints generados
      paintCanvas.dispatchEvent({
        type: 'pointerdown',
        pointerId: 1,
        clientX: initialStroke.startPoint.x,
        clientY: initialStroke.startPoint.y,
        preventDefault: () => {}
      });

      for (const pt of initialStroke.checkpoints) {
        paintCanvas.dispatchEvent({
          type: 'pointermove',
          pointerId: 1,
          clientX: pt.x,
          clientY: pt.y,
          preventDefault: () => {}
        });
      }

      paintCanvas.dispatchEvent({
        type: 'pointerup',
        pointerId: 1,
        preventDefault: () => {}
      });

      // El trazo 1 de la J debe completarse con éxito
      if (!initialStroke.completed) {
        throw new Error('Fallo en StrokeGenerator: El recorrido completo no validó el trazo de la letra J');
      }
    }
  },
  {
    name: 'Generador Mágico de Trazos: Generación de Trazos para Letras, Números y Palabras',
    run: () => {
      app.screens['letter-tracing'].resetState();
      app.navigate('letter-tracing');
      const genCard = appRoot.querySelector('[data-game="generador_trazos"]');
      if (!genCard) throw new Error('No se encontró la tarjeta generador_trazos');
      genCard.click();

      const genModule = appRoot.querySelector('#generatorModule');
      if (!genModule) throw new Error('No se abrió la pantalla del Generador de Trazos');

      const screen = app.screens['letter-tracing'];
      if (screen.activeSubgame !== 'generador_trazos') {
        throw new Error('El estado activeSubgame no es generador_trazos');
      }

      // Probar selección de letra en abecedario
      const btnB = appRoot.querySelector('[data-char="B"]');
      if (btnB) {
        btnB.click();
        if (screen.generatorTarget !== 'B') throw new Error('No seleccionó la letra B en el generador');
        if (screen.activeStrokes.length === 0) throw new Error('No generó trazos para la letra B');
      }

      // Probar pestaña de Números
      const tabNum = appRoot.querySelector('[data-tab="numeros"]');
      if (tabNum) {
        tabNum.click();
        const btn5 = appRoot.querySelector('[data-char="5"]');
        if (btn5) {
          btn5.click();
          if (screen.generatorTarget !== '5') throw new Error('No seleccionó el número 5');
          if (screen.activeStrokes.length === 0) throw new Error('No generó trazos para el número 5');
        }
      }

      // Probar pestaña de Palabra Personalizada
      const tabWord = appRoot.querySelector('[data-tab="palabra"]');
      if (tabWord) {
        tabWord.click();
        const input = appRoot.querySelector('#genWordInput');
        const btnGen = appRoot.querySelector('#btnGenerateCustomWord');
        if (input && btnGen) {
          input.value = 'HOLA';
          btnGen.click();
          if (screen.generatorTarget !== 'HOLA') throw new Error('No asignó la palabra HOLA');
          if (screen.gridLetters.length !== 4) throw new Error('No generó el layout de 4 letras para HOLA');
        }
      }
    }
  },
  {
    name: 'Módulo de Sílabas: Entrada y Subjuegos en Círculos',
    run: () => {
      app.navigate('syllables');
      const subgames = appRoot.querySelector('.subgames-menu-container');
      if (!subgames) throw new Error('No se abrió el menú de subjuegos de Sílabas');

      const card1 = appRoot.querySelector('#btnSelectCompleta');
      if (!card1) throw new Error('No se encontró el botón btnSelectCompleta');
      card1.click();

      const levelSelector = appRoot.querySelector('.level-selector-module');
      if (!levelSelector) throw new Error('No abrió el selector de Completa la Palabra');
    }
  }
];

let passed = 0;
for (const t of tests) {
  try {
    t.run();
    console.log(`  ✅ PASÓ: ${t.name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FALLÓ: ${t.name}`);
    console.error(`     Mensaje: ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n🎉 TODAS LAS PRUEBAS (${passed}/${tests.length}) PASARON CON ÉXITO.`);
process.exit(0);
