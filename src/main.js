import './styles.css';
import {
  ArrowDown,
  ArrowUpRight,
  Brain,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  createIcons,
  Dumbbell,
  GlassWater,
  Instagram,
  Play,
  Plus,
  RotateCcw,
  ScanLine,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide';
import { createModalManager } from './features/modal.js';
import { setupTools } from './features/tools.js';
import { setupSimulator } from './features/simulator.js';
import { setupMedia } from './features/media.js';

const iconSet = {
  ArrowDown,
  ArrowUpRight,
  Brain,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  Dumbbell,
  GlassWater,
  Instagram,
  Play,
  Plus,
  RotateCcw,
  ScanLine,
  SlidersHorizontal,
  Trash2,
  X,
};

function refreshIcons() {
  createIcons({ icons: iconSet, attrs: { 'stroke-width': 2 } });
}

async function bootstrap() {
  const loader = document.querySelector('#page-loader');
  const revealPage = () => {
    document.documentElement.classList.add('page-revealed');
    loader?.classList.add('is-hidden');
  };
  const loadingTimeout = window.setTimeout(revealPage, 1800);

  refreshIcons();
  const modal = createModalManager(refreshIcons);
  setupTools({ ...modal, refreshIcons });
  setupMedia(modal);
  setupSimulator({ ...modal, refreshIcons });

  let boneScene = { ready: false, setProgress() {}, destroy() {} };
  let setupScrollDirector = () => {
    document.querySelectorAll('.reveal-item').forEach((item) => item.classList.add('is-visible'));
  };
  try {
    const [{ createBoneScene }, scrollModule] = await Promise.all([
      import('./scene/boneScene.js'),
      import('./scene/scrollDirector.js'),
    ]);
    setupScrollDirector = scrollModule.setupScrollDirector;
    try {
      boneScene = await createBoneScene(document.querySelector('#bone-canvas'));
    } catch (error) {
      console.warn('WebGL scene could not be initialized. Static fallback remains active.', error);
    }
  } catch (error) {
    console.warn('Cinematic modules could not be loaded. Static presentation remains active.', error);
  }
  setupScrollDirector(boneScene);
  refreshIcons();

  requestAnimationFrame(() => {
    window.clearTimeout(loadingTimeout);
    revealPage();
  });
}

bootstrap();
