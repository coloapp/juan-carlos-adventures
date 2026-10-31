/**
 * OpenWorldScreen - Sala de Juegos Libre / Mundo Abierto (Estilo Toca Boca World)
 * Escenario táctil interactivo donde Juan Carlos juega libremente con sus juguetes
 * y mascotas desbloqueadas mediante el aprendizaje. 100% offline.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';

export class OpenWorldScreen {
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

