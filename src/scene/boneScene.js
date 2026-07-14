import * as THREE from 'three';

const spineAsset = new URL('../../assets/porous-spine.png', import.meta.url).href;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vertexShader = `
  uniform float uTime;
  uniform float uFormation;
  uniform float uPointScale;
  attribute vec3 aScatter;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float formed = smoothstep(0.0, 1.0, uFormation);
    vec3 positionMixed = mix(aScatter, position, formed);
    float drift = (1.0 - formed) * 0.12 + 0.008;
    positionMixed.x += sin(uTime * 0.55 + aPhase * 9.0) * drift;
    positionMixed.y += cos(uTime * 0.43 + aPhase * 7.0) * drift;
    positionMixed.z += sin(uTime * 0.32 + aPhase * 12.0) * drift * 1.8;

    vec4 modelPosition = modelMatrix * vec4(positionMixed, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(uPointScale * (8.0 / -viewPosition.z), 1.6, 7.2);
    vColor = color;
    vAlpha = 0.68 + formed * 0.32;
  }
`;

const fragmentShader = `
  uniform vec3 uTint;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(point);
    if (distanceToCenter > 0.5) discard;
    float softEdge = smoothstep(0.5, 0.12, distanceToCenter);
    vec3 finalColor = mix(vColor, uTint, 0.22);
    gl_FragColor = vec4(finalColor, softEdge * vAlpha);
  }
`;

function interpolateKeyframes(progress, values) {
  const scaled = Math.min(0.9999, Math.max(0, progress)) * (values.length - 1);
  const index = Math.floor(scaled);
  const amount = scaled - index;
  return THREE.MathUtils.lerp(values[index], values[index + 1], amount);
}

function sampleImage(image, limit) {
  const canvas = document.createElement('canvas');
  const width = 420;
  const height = Math.round((image.height / image.width) * width);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const samples = [];
  let seen = 0;
  const step = window.innerWidth < 640 ? 3 : 2;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const offset = (y * width + x) * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightness = (red + green + blue) / 3;
      if (brightness < 24) continue;

      const sample = { x, y, red, green, blue };
      seen += 1;
      if (samples.length < limit) {
        samples.push(sample);
      } else {
        const replacement = Math.floor(Math.random() * seen);
        if (replacement < limit) samples[replacement] = sample;
      }
    }
  }

  return { samples, width, height };
}

function makePointCloud(image, uniforms) {
  const isMobile = window.innerWidth < 640;
  const isTablet = window.innerWidth < 980;
  const limit = isMobile ? 6800 : isTablet ? 12000 : 20000;
  const { samples, width, height } = sampleImage(image, limit);
  const count = samples.length;
  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const color = new THREE.Color();

  samples.forEach((sample, index) => {
    const i = index * 3;
    positions[i] = (sample.x / width - 0.5) * 4.7;
    positions[i + 1] = (0.5 - sample.y / height) * 6.6;
    positions[i + 2] = (Math.random() - 0.5) * 0.2 + Math.sin(sample.y * 0.06) * 0.035;

    const radius = 7 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    scatter[i] = Math.sin(phi) * Math.cos(theta) * radius;
    scatter[i + 1] = Math.cos(phi) * radius;
    scatter[i + 2] = Math.sin(phi) * Math.sin(theta) * radius - 1;

    color.setRGB(sample.red / 255, sample.green / 255, sample.blue / 255, THREE.SRGBColorSpace);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
    phases[index] = Math.random();
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function makeStars() {
  const count = window.innerWidth < 640 ? 280 : 620;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 24;
    positions[i + 1] = (Math.random() - 0.5) * 15;
    positions[i + 2] = -4 - Math.random() * 7;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xfff1d4,
    size: 0.025,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

export async function createBoneScene(canvas) {
  if (!canvas || REDUCED_MOTION) {
    return { ready: false, setProgress() {}, setFormation() {}, destroy() {} };
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: window.innerWidth >= 760 });
  } catch {
    return { ready: false, setProgress() {}, setFormation() {}, destroy() {} };
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1.2 : 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 8.2);
  scene.add(makeStars());

  const uniforms = {
    uTime: { value: 0 },
    uFormation: { value: 0.86 },
    uPointScale: { value: window.innerWidth < 640 ? 11 : 16 },
    uTint: { value: new THREE.Color(0x5eb7ff) },
  };

  const image = new Image();
  image.decoding = 'async';
  image.src = spineAsset;
  await image.decode();

  const points = makePointCloud(image, uniforms);
  scene.add(points);

  let progress = 0;
  let targetFormation = 1;
  let visible = true;
  let destroyed = false;
  let animationFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const clock = new THREE.Clock();
  const colorStops = [
    new THREE.Color(0x5eb7ff),
    new THREE.Color(0xffd84d),
    new THREE.Color(0x5eb7ff),
    new THREE.Color(0x55d98a),
  ];

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    uniforms.uPointScale.value = width < 640 ? 11 : width < 980 ? 14 : 16;
  }

  function applyProgress() {
    const isMobile = window.innerWidth < 860;
    const xFrames = isMobile ? [0.65, -0.1, 0.45, -0.05] : [2.05, -1.75, 1.85, -1.55];
    const yFrames = isMobile ? [-0.8, -0.75, -0.9, -0.7] : [0, 0.15, -0.05, 0.2];
    const scaleFrames = isMobile ? [0.64, 0.6, 0.64, 0.58] : [0.76, 0.72, 0.76, 0.7];
    points.position.x = interpolateKeyframes(progress, xFrames);
    points.position.y = interpolateKeyframes(progress, yFrames);
    points.scale.setScalar(interpolateKeyframes(progress, scaleFrames));
    points.rotation.y = interpolateKeyframes(progress, [0.02, -0.16, 0.12, -0.2]) + pointerX * 0.035;
    points.rotation.x = interpolateKeyframes(progress, [-0.02, 0.04, -0.04, 0.06]) + pointerY * 0.02;
    camera.position.z = interpolateKeyframes(progress, [8.2, 7.6, 8.05, 7.35]);

    const scaled = Math.min(0.9999, progress) * 3;
    const index = Math.floor(scaled);
    const amount = scaled - index;
    uniforms.uTint.value.lerpColors(colorStops[index], colorStops[index + 1], amount);
    targetFormation = interpolateKeyframes(progress, [1, 0.99, 0.95, 0.86]);
  }

  function render() {
    if (destroyed) return;
    animationFrame = requestAnimationFrame(render);
    if (!visible || document.hidden) return;
    uniforms.uTime.value += Math.min(clock.getDelta(), 0.05);
    uniforms.uFormation.value += (targetFormation - uniforms.uFormation.value) * 0.055;
    points.rotation.z = Math.sin(uniforms.uTime.value * 0.24) * 0.015;
    applyProgress();
    renderer.render(scene, camera);
  }

  function onPointerMove(event) {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }, { rootMargin: '120px' });
  visibilityObserver.observe(canvas);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    document.documentElement.classList.remove('webgl-ready');
    visible = false;
  });

  resize();
  render();
  document.documentElement.classList.add('webgl-ready');
  canvas.parentElement?.style.setProperty('--bone-underlay-opacity', '0.2');

  return {
    ready: true,
    setProgress(value) {
      progress = Math.min(1, Math.max(0, value));
      const heroPresence = Math.max(0, 1 - progress * 5.5);
      canvas.parentElement?.style.setProperty('--bone-underlay-opacity', (heroPresence * 0.2).toFixed(3));
    },
    setFormation(value) {
      targetFormation = Math.min(1, Math.max(0, value));
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      canvas.parentElement?.style.removeProperty('--bone-underlay-opacity');
      points.geometry.dispose();
      points.material.dispose();
      renderer.dispose();
    },
  };
}
