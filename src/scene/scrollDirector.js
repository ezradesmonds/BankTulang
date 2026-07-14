import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SCENE_LABELS = {
  hero: 'MEMORI 01',
  knowledge: 'SINYAL 01 // PENGETAHUAN',
  calcium: 'SINYAL 02 // KALSIUM',
  activity: 'SINYAL 03 // AKTIVITAS',
};

export function setupScrollDirector(boneScene) {
  const cinematic = document.querySelector('.cinematic');
  const readout = document.querySelector('#scene-readout');
  const scenes = Array.from(document.querySelectorAll('.scroll-scene'));
  const progressBar = document.querySelector('#scroll-progress');
  const nav = document.querySelector('.site-nav');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contexts = [];

  const onWindowScroll = () => {
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = maximum > 0 ? window.scrollY / maximum : 0;
    progressBar.style.transform = `scaleX(${pageProgress})`;
    nav.classList.toggle('is-scrolled', window.scrollY > 18);
  };
  window.addEventListener('scroll', onWindowScroll, { passive: true });
  onWindowScroll();

  if (!reduceMotion && cinematic) {
    contexts.push(ScrollTrigger.create({
      trigger: cinematic,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: ({ progress }) => boneScene.setProgress(progress),
    }));

    scenes.forEach((scene, index) => {
      const content = scene.querySelector('.scene-content');
      if (!content) return;
      const isHero = index === 0;
      if (isHero) {
        if (document.documentElement.classList.contains('page-revealed')) {
          gsap.set(content, { autoAlpha: 1, y: 0 });
        } else {
          gsap.fromTo(content,
            { autoAlpha: 0, y: 34 },
            { autoAlpha: 1, y: 0, duration: 1.1, delay: 0.25, ease: 'power3.out' },
          );
        }
      } else {
        contexts.push(gsap.fromTo(content,
          { autoAlpha: 0.08, y: 54 },
          {
            autoAlpha: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: scene,
              start: 'top 78%',
              end: 'center 56%',
              scrub: 0.45,
            },
          },
        ));
      }

      contexts.push(ScrollTrigger.create({
        trigger: scene,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => {
          readout.textContent = SCENE_LABELS[scene.dataset.scene] ?? 'BANK TULANG';
        },
        onEnterBack: () => {
          readout.textContent = SCENE_LABELS[scene.dataset.scene] ?? 'BANK TULANG';
        },
      }));

      if (index < scenes.length - 1) {
        contexts.push(gsap.fromTo(
          content,
          { autoAlpha: 1, y: 0 },
          {
            autoAlpha: isHero ? 0.12 : 0.2,
            y: -34,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: scene,
              start: 'center 34%',
              end: 'bottom 18%',
              scrub: 0.45,
            },
          },
        ));
      }
    });
  } else {
    scenes.forEach((scene) => {
      const content = scene.querySelector('.scene-content');
      if (content) content.style.opacity = '1';
    });
  }

  const revealItems = document.querySelectorAll('.reveal-item');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));

  return () => {
    contexts.forEach((context) => context?.kill?.());
    revealObserver.disconnect();
    window.removeEventListener('scroll', onWindowScroll);
  };
}
