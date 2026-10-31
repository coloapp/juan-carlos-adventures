/**
 * Modal - Sistema de ventanas emergentes infantiles
 * Para recompensas, ajustes de alumno y celebraciones didácticas.
 */
import { audio } from '../core/AudioManager.js';
import { Confetti } from './Confetti.js';

export class Modal {
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
