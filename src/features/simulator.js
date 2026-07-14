import { getState, resetState, subscribe } from '../store.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export function setupSimulator({ openModal, closeModal, showToast, refreshIcons }) {
  const controls = {
    knowledge: document.querySelector('#knowledge-control'),
    calcium: document.querySelector('#calcium-control'),
    activity: document.querySelector('#activity-control'),
  };
  const outputs = {
    knowledge: document.querySelector('#knowledge-output'),
    calcium: document.querySelector('#calcium-output'),
    activity: document.querySelector('#activity-output'),
  };
  let simulation = { knowledge: 0, calcium: 0, activity: 0 };

  function actualFromState(state) {
    return {
      knowledge: state.quizRaw ?? 0,
      calcium: clamp(state.calciumMg, 0, 1400),
      activity: clamp(state.activitySessions, 0, 7),
    };
  }

  function updateSceneSignals(state) {
    document.querySelector('#scene-knowledge-value').textContent = `${state.quizRaw ?? 0} / 12`;
    document.querySelector('#scene-calcium-value').textContent = `${state.calciumMg} mg`;
    document.querySelector('#scene-activity-value').textContent = `${state.activitySessions} sesi`;
  }

  function renderSimulation() {
    const knowledgePercent = Math.round((simulation.knowledge / 12) * 100);
    const calciumPercent = clamp(Math.round((simulation.calcium / 1000) * 100), 0, 100);
    const activityPercent = clamp(Math.round((simulation.activity / 5) * 100), 0, 100);
    const score = Math.round(knowledgePercent * 0.44 + calciumPercent * 0.34 + activityPercent * 0.22);
    const status = score >= 75 ? 'Progres simulasi optimal' : score >= 40 ? 'Progres simulasi berkembang' : 'Progres simulasi awal';

    outputs.knowledge.textContent = `${simulation.knowledge} / 12`;
    outputs.calcium.textContent = `${simulation.calcium} mg`;
    outputs.activity.textContent = `${simulation.activity} / 7`;
    document.querySelector('#simulation-score').textContent = score;
    document.querySelector('#simulation-status').textContent = status;

    const percentages = [knowledgePercent, calciumPercent, activityPercent];
    ['knowledge', 'calcium', 'activity'].forEach((key, index) => {
      document.querySelector(`#${key}-percent`).textContent = `${percentages[index]}%`;
      document.querySelector(`#${key}-bar`).style.width = `${percentages[index]}%`;
    });

    const ring = document.querySelector('#score-orbit-value');
    ring.style.strokeDashoffset = `${653.45 * (1 - score / 100)}`;
    ring.style.stroke = score >= 75 ? '#55d98a' : score >= 40 ? '#ffd84d' : '#ff5a55';

    const weakest = Math.min(knowledgePercent, calciumPercent, activityPercent);
    let advice = 'Mulai dengan mengisi kuis atau mencatat satu kebiasaan harian.';
    if (score >= 75) {
      advice = 'Ketiga sinyal sudah konsisten. Pertahankan kebiasaan yang telah dibangun.';
    } else if (weakest === knowledgePercent) {
      advice = 'Pengetahuan menjadi bagian yang paling perlu diperkuat. Isi atau ulangi kuis OKAT.';
    } else if (weakest === calciumPercent) {
      advice = 'Catatan kalsium menjadi peluang peningkatan utama untuk hari ini.';
    } else {
      advice = 'Tambahkan satu sesi aktivitas menumpu beban untuk meningkatkan progres mingguan.';
    }
    document.querySelector('#simulation-advice').textContent = advice;
  }

  function syncToActual(state = getState()) {
    simulation = actualFromState(state);
    Object.entries(controls).forEach(([key, input]) => {
      input.value = simulation[key];
    });
    renderSimulation();
  }

  Object.entries(controls).forEach(([key, input]) => {
    input.addEventListener('input', () => {
      simulation[key] = Number(input.value);
      renderSimulation();
    });
  });

  document.querySelector('#restore-simulation').addEventListener('click', () => {
    syncToActual();
    showToast('Simulasi kembali menggunakan data aktual.');
  });

  document.querySelector('#clear-data').addEventListener('click', () => {
    openModal({
      modalLabel: 'Data Perangkat',
      modalTitle: 'Hapus seluruh progres?',
      html: `
        <div class="confirm-panel">
          <p>Skor kuis, catatan kalsium, dan catatan aktivitas akan dihapus dari browser ini. Tindakan ini tidak dapat dibatalkan.</p>
          <div class="confirm-actions">
            <button class="button button-danger" id="confirm-clear-data" type="button"><i data-lucide="trash-2" aria-hidden="true"></i>Hapus data</button>
            <button class="button button-ghost" id="cancel-clear-data" type="button">Batal</button>
          </div>
        </div>
      `,
      onReady(root) {
        refreshIcons();
        root.querySelector('#confirm-clear-data').addEventListener('click', () => {
          resetState();
          syncToActual();
          closeModal();
          showToast('Data lokal Bank Tulang telah dihapus.');
        });
        root.querySelector('#cancel-clear-data').addEventListener('click', closeModal);
      },
    });
  });

  const unsubscribe = subscribe((state) => {
    updateSceneSignals(state);
    syncToActual(state);
  });

  return { syncToActual, destroy: unsubscribe };
}
