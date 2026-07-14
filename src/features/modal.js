const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function createModalManager(refreshIcons) {
  const backdrop = document.querySelector('#app-modal');
  const dialog = backdrop.querySelector('.modal-dialog');
  const label = backdrop.querySelector('#modal-label');
  const title = backdrop.querySelector('#modal-title');
  const content = backdrop.querySelector('#modal-content');
  const closeButton = backdrop.querySelector('#modal-close');
  const openLink = backdrop.querySelector('#modal-open-link');
  const toast = document.querySelector('#toast');
  let returnFocus = null;
  let toastTimer = 0;

  function stopMedia() {
    content.querySelectorAll('audio, video').forEach((media) => {
      media.pause();
      media.removeAttribute('src');
      media.load();
    });
    content.querySelectorAll('iframe, object').forEach((frame) => frame.remove());
  }

  function closeModal() {
    if (!backdrop.classList.contains('is-open')) return;
    stopMedia();
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    content.innerHTML = '';
    openLink.hidden = true;
    openLink.removeAttribute('href');
    returnFocus?.focus?.();
    returnFocus = null;
  }

  function openModal({ modalLabel = 'BANK TULANG', modalTitle, html, openUrl = null, onReady }) {
    returnFocus = document.activeElement;
    label.textContent = modalLabel;
    title.textContent = modalTitle;
    content.innerHTML = html;
    if (openUrl) {
      openLink.href = openUrl;
      openLink.hidden = false;
    } else {
      openLink.hidden = true;
      openLink.removeAttribute('href');
    }
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    refreshIcons();
    onReady?.(content);
    closeButton.focus();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function handleKeydown(event) {
    if (!backdrop.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  closeButton.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', handleKeydown);

  return { openModal, closeModal, showToast };
}
