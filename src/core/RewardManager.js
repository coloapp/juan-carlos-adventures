/**
 * RewardManager - Gestor del inventario y recompensas del mundo abierto
 * Conecta los logros de las lecciones con los objetos utilizables en la sala libre tipo Toca Boca.
 */
import { StorageManager } from './StorageManager.js';
import { audio } from './AudioManager.js';

export class RewardManager {
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

export const rewards = new RewardManager();
