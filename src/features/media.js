const mediaAssets = {
  booklet: new URL('../../assets/media/ebooklet-modul.pdf', import.meta.url).href,
  infographic: new URL('../../assets/media/infografis-bone-facts.jpg', import.meta.url).href,
  poster: new URL('../../assets/media/poster-acara.png', import.meta.url).href,
  audio: new URL('../../assets/media/lagu-bank-tulang.mp3', import.meta.url).href,
};

const videoView = 'https://drive.google.com/file/d/1mAA1__ZVA-WlDWuRxVx8QfKM8oQ33wQZ/view?usp=drive_link';
const videoPreview = 'https://drive.google.com/file/d/1mAA1__ZVA-WlDWuRxVx8QfKM8oQ33wQZ/preview';

const media = {
  booklet: {
    label: 'Dokumen PDF',
    title: 'E-booklet / Modul',
    openUrl: mediaAssets.booklet,
    html: `<div class="media-preview"><object data="${mediaAssets.booklet}" type="application/pdf"><div class="video-fallback"><p>PDF tidak dapat ditampilkan pada browser ini. Gunakan tombol Buka penuh.</p></div></object></div>`,
  },
  infographic: {
    label: 'Infografis',
    title: 'Infografis Bone Facts',
    openUrl: mediaAssets.infographic,
    html: `<div class="media-preview"><img src="${mediaAssets.infographic}" alt="Infografis Bone Facts Bank Tulang" /></div>`,
  },
  poster: {
    label: 'Poster Acara',
    title: 'Promosi Kesehatan Osteoporosis',
    openUrl: mediaAssets.poster,
    html: `<div class="media-preview"><img src="${mediaAssets.poster}" alt="Poster acara promosi kesehatan osteoporosis Bank Tulang" /></div>`,
  },
  audio: {
    label: 'Audio Kampanye',
    title: 'Lagu Bank Tulang Ubaya',
    openUrl: mediaAssets.audio,
    html: `<div class="media-preview"><audio controls preload="metadata" src="${mediaAssets.audio}">Browser ini tidak mendukung audio.</audio></div>`,
  },
  video: {
    label: 'Video Edukasi',
    title: 'Video Pendek Edukasi',
    openUrl: videoView,
    html: `<div class="media-preview"><iframe src="${videoPreview}" title="Video Pendek Edukasi Bank Tulang" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`,
  },
};

export function setupMedia({ openModal }) {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-media]');
    if (!trigger) return;
    const item = media[trigger.dataset.media];
    if (!item) return;
    openModal({
      modalLabel: item.label,
      modalTitle: item.title,
      html: item.html,
      openUrl: item.openUrl,
    });
  });
}
