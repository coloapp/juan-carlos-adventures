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
    this.dispatchEvent({ type: 'click', target: this, currentTarget: this, preventDefault: () => {} });
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
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      ellipse: () => {},
      quadraticCurveTo: () => {},
      save: () => {},
      restore: () => {},
      strokeText: () => {},
      fillText: () => {},
      setLineDash: () => {},
      translate: () => {},
      rotate: () => {},
      closePath: () => {}
    };
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 760, height: 420, right: 760, bottom: 420 };
  }

  setPointerCapture() {}

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
  addEventListener: () => {},
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
  addEventListener: () => {},
  removeEventListener: () => {},
  history: {
    pushState: () => {},
    replaceState: () => {}
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
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, type: 'sine', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
  },
  speechSynthesis: {
    speak: () => {},
    cancel: () => {},
    getVoices: () => []
  },
  SpeechSynthesisUtterance: class {},
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
          preventDefault: () => {}
        });
        paintCanvas.dispatchEvent({
          type: 'pointermove',
          pointerId: 1,
          clientX: 210,
          clientY: 210,
          preventDefault: () => {}
        });
        paintCanvas.dispatchEvent({
          type: 'pointerup',
          pointerId: 1,
          preventDefault: () => {}
        });
      }
    }
  },
  {
    name: 'Módulo de Números: Selector y Nivel 1',
    run: () => {
      app.navigate('numbers');
      const selector = appRoot.querySelector('.level-selector-module');
      if (!selector) throw new Error('Números no abrió el LevelSelector');
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (node1) node1.click();
    }
  },
  {
    name: 'Módulo de Figuras: Selector y Nivel 1',
    run: () => {
      app.navigate('shapes');
      const selector = appRoot.querySelector('.level-selector-module');
      if (!selector) throw new Error('Figuras no abrió el LevelSelector');
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (node1) node1.click();
    }
  },
  {
    name: 'Módulo de Vocales: Selector y Nivel 1',
    run: () => {
      app.navigate('vowels');
      const selector = appRoot.querySelector('.level-selector-module');
      if (!selector) throw new Error('Vocales no abrió el LevelSelector');
      const node1 = appRoot.querySelector('[data-level="1"]');
      if (node1) node1.click();
    }
  },
  {
    name: 'Módulo de Traza tu Nombre: Entrada y Selector',
    run: () => {
      app.navigate('name-tracing');
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
