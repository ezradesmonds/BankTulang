import { ACTIVITY_TYPES, FOODS, QUIZ_ITEMS, QUIZ_OPTIONS, getScoreBand } from '../data.js';
import { getState, patchState } from '../store.js';

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function quizMarkup() {
  const questions = QUIZ_ITEMS.map((item, index) => `
    <fieldset class="quiz-question">
      <legend class="quiz-question-index">${String(index + 1).padStart(2, '0')}</legend>
      <div>
        <span class="quiz-domain">${item.domain}</span>
        <p>${item.text}</p>
        <div class="quiz-options">
          ${QUIZ_OPTIONS.map((option) => `
            <label class="quiz-option">
              <input type="radio" name="question-${index}" value="${option}" />
              <span>${option}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </fieldset>
  `).join('');

  return `
    <div class="tool-content">
      <p class="tool-intro">Kuis berisi 12 item adaptasi OKAT. Jawaban benar bernilai 1; jawaban salah atau Tidak Tahu bernilai 0. Hasil ini merupakan alat edukasi, bukan diagnosis medis.</p>
      <form class="quiz-form" id="quiz-form">
        ${questions}
        <button class="button button-primary tool-submit" type="submit">
          <i data-lucide="chart-no-axes-column-increasing" aria-hidden="true"></i>
          Lihat skor
        </button>
      </form>
      <div id="quiz-result" aria-live="polite"></div>
    </div>
  `;
}

function calciumMarkup() {
  const state = getState();
  return `
    <div class="tool-content">
      <p class="tool-intro">Pilih makanan dan jumlah porsi untuk mencatat estimasi kalsium. Nilai mengikuti basis data makanan yang digunakan dalam modul Bank Tulang.</p>
      <form class="tracker-form" id="calcium-form">
        <div class="form-field">
          <label for="food-name">Makanan</label>
          <input id="food-name" list="food-options" autocomplete="off" placeholder="Contoh: Tahu putih 100 g" required />
          <datalist id="food-options">${FOODS.map((food) => `<option value="${food.name}">${food.category}</option>`).join('')}</datalist>
        </div>
        <div class="form-field">
          <label for="food-servings">Jumlah porsi</label>
          <input id="food-servings" type="number" min="0.5" max="10" step="0.5" value="1" required />
        </div>
        <button class="button button-primary" type="submit"><i data-lucide="plus" aria-hidden="true"></i>Catat</button>
      </form>
      <div class="tracker-summary"><span>Total hari ini</span><strong id="calcium-total">${state.calciumMg} mg / ${state.dailyCalciumTarget} mg</strong></div>
      <div class="tracker-list" id="calcium-list"></div>
    </div>
  `;
}

function activityMarkup() {
  const state = getState();
  return `
    <div class="tool-content">
      <p class="tool-intro">Satu catatan dihitung sebagai satu sesi aktivitas mingguan. Data tersimpan hanya pada perangkat ini.</p>
      <form class="tracker-form" id="activity-form">
        <div class="form-field">
          <label for="activity-type">Jenis aktivitas</label>
          <select id="activity-type">${ACTIVITY_TYPES.map((activity) => `<option>${activity}</option>`).join('')}</select>
        </div>
        <div class="form-field">
          <label for="activity-duration">Durasi (menit)</label>
          <input id="activity-duration" type="number" min="1" max="300" value="30" required />
        </div>
        <button class="button button-primary" type="submit"><i data-lucide="plus" aria-hidden="true"></i>Catat</button>
      </form>
      <div class="tracker-summary"><span>Progres minggu ini</span><strong id="activity-total">${state.activitySessions} / ${state.weeklyActivityTarget} sesi</strong></div>
      <div class="tracker-list" id="activity-list"></div>
    </div>
  `;
}

export function setupTools({ openModal, showToast, refreshIcons }) {
  function renderCalciumList(root) {
    const state = getState();
    const list = root.querySelector('#calcium-list');
    const total = root.querySelector('#calcium-total');
    if (!list || !total) return;
    total.textContent = `${state.calciumMg} mg / ${state.dailyCalciumTarget} mg`;
    list.innerHTML = state.calciumItems.length
      ? state.calciumItems.map((item) => `
          <div class="tracker-item">
            <div><strong>${item.name}</strong><small>${item.servings} porsi</small></div>
            <span>${item.totalMg} mg</span>
            <button class="remove-item" type="button" data-remove-calcium="${item.id}" aria-label="Hapus ${item.name}"><i data-lucide="trash-2" aria-hidden="true"></i></button>
          </div>
        `).join('')
      : '<p class="tracker-list-empty">Belum ada asupan yang dicatat hari ini.</p>';
    refreshIcons();
  }

  function renderActivityList(root) {
    const state = getState();
    const list = root.querySelector('#activity-list');
    const total = root.querySelector('#activity-total');
    if (!list || !total) return;
    total.textContent = `${state.activitySessions} / ${state.weeklyActivityTarget} sesi`;
    list.innerHTML = state.activityItems.length
      ? state.activityItems.map((item) => `
          <div class="tracker-item">
            <div><strong>${item.type}</strong><small>Dicatat pada ${item.loggedAt}</small></div>
            <span>${item.duration} menit</span>
            <button class="remove-item" type="button" data-remove-activity="${item.id}" aria-label="Hapus ${item.type}"><i data-lucide="trash-2" aria-hidden="true"></i></button>
          </div>
        `).join('')
      : '<p class="tracker-list-empty">Belum ada aktivitas yang dicatat minggu ini.</p>';
    refreshIcons();
  }

  function openQuiz() {
    openModal({
      modalLabel: 'Asesmen OKAT',
      modalTitle: 'Kuis Kesehatan Tulang',
      html: quizMarkup(),
      onReady(root) {
        refreshIcons();
        root.querySelector('#quiz-form').addEventListener('submit', (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          let answered = 0;
          let raw = 0;
          let firstMissingIndex = -1;
          QUIZ_ITEMS.forEach((item, index) => {
            const answer = formData.get(`question-${index}`);
            if (answer) answered += 1;
            if (!answer && firstMissingIndex === -1) firstMissingIndex = index;
            if (answer === item.correct) raw += 1;
          });
          if (answered !== QUIZ_ITEMS.length) {
            showToast(`Lengkapi seluruh ${QUIZ_ITEMS.length} pertanyaan terlebih dahulu.`);
            root.querySelector(`input[name="question-${firstMissingIndex}"]`)?.focus();
            return;
          }
          const percent = Math.round((raw / QUIZ_ITEMS.length) * 100);
          const band = getScoreBand(raw);
          patchState({
            quizRaw: raw,
            quizPercent: percent,
            quizCategory: band.category,
            quizInterpretation: band.interpretation,
          });
          const result = root.querySelector('#quiz-result');
          result.innerHTML = `<div class="result-panel"><strong>${raw}/12 · Kategori ${band.category}</strong><p>${band.interpretation}</p></div>`;
          result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          showToast(`Skor OKAT diperbarui menjadi ${raw} dari 12.`);
        });
      },
    });
  }

  function openCalcium() {
    openModal({
      modalLabel: 'Pelacak Harian',
      modalTitle: 'Pelacak Kalsium',
      html: calciumMarkup(),
      onReady(root) {
        renderCalciumList(root);
        root.querySelector('#calcium-form').addEventListener('submit', (event) => {
          event.preventDefault();
          const name = root.querySelector('#food-name').value.trim();
          const food = FOODS.find((item) => item.name.toLocaleLowerCase('id') === name.toLocaleLowerCase('id'));
          if (!food) {
            showToast('Pilih makanan yang tersedia pada daftar saran.');
            return;
          }
          const servings = Math.min(10, Math.max(0.5, Number(root.querySelector('#food-servings').value) || 1));
          const totalMg = Math.round(food.mg * servings);
          const state = getState();
          const items = [...state.calciumItems, { id: uid(), name: food.name, servings, totalMg }];
          patchState({ calciumItems: items, calciumMg: items.reduce((sum, item) => sum + item.totalMg, 0) });
          event.currentTarget.reset();
          root.querySelector('#food-servings').value = 1;
          renderCalciumList(root);
          showToast(`${food.name} ditambahkan: ${totalMg} mg.`);
        });
        root.addEventListener('click', (event) => {
          const button = event.target.closest('[data-remove-calcium]');
          if (!button) return;
          const state = getState();
          const items = state.calciumItems.filter((item) => item.id !== button.dataset.removeCalcium);
          patchState({ calciumItems: items, calciumMg: items.reduce((sum, item) => sum + item.totalMg, 0) });
          renderCalciumList(root);
        });
      },
    });
  }

  function openActivity() {
    openModal({
      modalLabel: 'Pelacak Mingguan',
      modalTitle: 'Catatan Aktivitas',
      html: activityMarkup(),
      onReady(root) {
        renderActivityList(root);
        root.querySelector('#activity-form').addEventListener('submit', (event) => {
          event.preventDefault();
          const type = root.querySelector('#activity-type').value;
          const duration = Math.min(300, Math.max(1, Number(root.querySelector('#activity-duration').value) || 1));
          const state = getState();
          const items = [...state.activityItems, {
            id: uid(), type, duration, loggedAt: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date()),
          }];
          patchState({ activityItems: items, activitySessions: items.length });
          renderActivityList(root);
          showToast(`${type} dicatat sebagai satu sesi.`);
        });
        root.addEventListener('click', (event) => {
          const button = event.target.closest('[data-remove-activity]');
          if (!button) return;
          const state = getState();
          const items = state.activityItems.filter((item) => item.id !== button.dataset.removeActivity);
          patchState({ activityItems: items, activitySessions: items.length });
          renderActivityList(root);
        });
      },
    });
  }

  const actions = { quiz: openQuiz, calcium: openCalcium, activity: openActivity };
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-tool]');
    if (!trigger) return;
    actions[trigger.dataset.tool]?.();
  });

  return actions;
}
