/**
 * LevelSelector.js - Selector universal de niveles en formato de círculos ("circulitos")
 * Muestra 50 juegos/niveles circulares con progreso guardado, estrellas y animaciones infantiles.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';

export class LevelSelector {
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

