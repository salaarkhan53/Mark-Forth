import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// The four paths of the official Markforth emblem (assets/markforth-emblem.svg).
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="35 45 445 430">
<path d="M 96.574219 60.777344 L 467.171875 60.777344 L 423.132812 136.777344 L 140.125 136.777344 Z" fill="#df2f18"/>
<path d="M 48.757812 136.777344 L 140.125 136.777344 L 180.257812 209.359375 L 87.183594 209.359375 Z" fill="#df2f18"/>
<path d="M 381.09375 209.359375 L 180.257812 209.359375 L 224.660156 284.074219 L 337.808594 284.074219 Z" fill="#df2f18"/>
<path d="M 130.730469 284.074219 L 224.660156 284.074219 L 281.390625 381.457031 L 234.910156 461.691406 L 130.730469 285.785156 Z" fill="#ffffff"/>
</svg>`;

const DEPTH = 46;
// How far each piece travels when the emblem "opens" under the cursor: [x, y, z] in SVG units.
const EXPLODE: [number, number, number][] = [[34, 22, 60], [-26, 8, 24], [22, -6, -10], [-10, -26, -60]];

export function initEmblem3D(canvas: HTMLCanvasElement) {
  const host = canvas.parentElement as HTMLElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the CSS emblem stays
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, 1, 10, 5000);
  camera.position.set(0, 0, 1180);

  // Lights: a soft key, a cool rim behind, and a red glow that follows the pointer.
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-400, 500, 700);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6a4f, 2.4);
  rim.position.set(500, -200, -600);
  scene.add(rim);
  const glow = new THREE.PointLight(0xff4b2b, 1.6, 1600, 1.2);
  glow.position.set(0, 0, 420);
  scene.add(glow);

  // Build the pieces.
  const data = new SVGLoader().parse(SVG);
  const red = new THREE.MeshPhysicalMaterial({ color: 0xc8230e, metalness: 0.2, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.18 });
  const redSide = new THREE.MeshPhysicalMaterial({ color: 0x8f1a0a, metalness: 0.5, roughness: 0.35, clearcoat: 0.6 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf6f6f6, metalness: 0.15, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
  const whiteSide = new THREE.MeshPhysicalMaterial({ color: 0x9a9a9e, metalness: 0.4, roughness: 0.3 });

  const emblem = new THREE.Group();
  const pieces: THREE.Mesh[] = [];
  data.paths.forEach((path) => {
    const isWhite = (path.color.r + path.color.g + path.color.b) > 2.5;
    path.toShapes(true).forEach((shape) => {
      const geo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelThickness: 6, bevelSize: 3.5, bevelSegments: 5, curveSegments: 4 });
      const mesh = new THREE.Mesh(geo, isWhite ? [white, whiteSide] : [red, redSide]);
      pieces.push(mesh);
      emblem.add(mesh);
    });
  });
  // Centre the artwork, then flip it upright (SVG y points down). Rotating keeps the faces' winding intact.
  const box = new THREE.Box3().setFromObject(emblem);
  const centre = box.getCenter(new THREE.Vector3());
  pieces.forEach((m) => {
    m.geometry.translate(-centre.x, -centre.y, -DEPTH / 2);
    m.geometry.rotateX(Math.PI);
    m.geometry.computeBoundingSphere();
    m.userData.base = m.position.clone();
  });
  const rig = new THREE.Group(); // pointer and drag rotation
  rig.add(emblem);
  scene.add(rig);
  emblem.rotation.set(-0.12, -0.32, 0);

  // Sizing.
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the emblem about 62% of the smaller side
    const fit = 445 / 0.62 / Math.min(1, camera.aspect);
    camera.position.z = fit / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  // Interaction state.
  const target = { x: 0, y: 0 }, current = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
  // the tilt toward the cursor (or the tilt of the phone) never passes 8 degrees
  const MAX_TILT = THREE.MathUtils.degToRad(8);
  let open = 0, openTarget = 0;
  let spin = 0, spinVel = 0, dragging = false, lastX = 0, lastT = 0;
  const pointerArea = host.closest('.hero') ?? host;

  pointerArea.addEventListener('pointermove', (e: Event) => {
    const ev = e as PointerEvent;
    // touch only steers the emblem while dragging it; hover tilt is for a mouse
    if (ev.pointerType !== 'mouse' && !dragging) return;
    const r = host.getBoundingClientRect();
    target.x = THREE.MathUtils.clamp(((ev.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    target.y = THREE.MathUtils.clamp(((ev.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    if (dragging) {
      const dt = Math.max(1, ev.timeStamp - lastT);
      const dx = ev.clientX - lastX;
      spin += dx * 0.012;
      spinVel = (dx * 0.012) / dt * 16;
      lastX = ev.clientX; lastT = ev.timeStamp;
    }
  });
  pointerArea.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });
  host.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; openTarget = 1; host.classList.add('is-hot'); });
  host.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') return; if (!dragging) { openTarget = 0; host.classList.remove('is-hot'); } });
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastT = e.timeStamp; spinVel = 0;
    canvas.setPointerCapture(e.pointerId); host.classList.add('is-dragging');
  });
  const release = (e: PointerEvent) => {
    dragging = false; host.classList.remove('is-dragging');
    if (e.pointerType !== 'mouse') { target.x = 0; target.y = 0; }
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  // Touch: a tap opens and closes the emblem; tilting the phone tilts it (where the browser allows).
  if (!fine) {
    canvas.addEventListener('click', () => { openTarget = openTarget ? 0 : 1; });
    addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null || dragging) return;
      target.x = THREE.MathUtils.clamp(e.gamma / 25, -1, 1);
      target.y = THREE.MathUtils.clamp((e.beta - 50) / 25, -1, 1);
    }, { passive: true });
  }

  // Scroll turns it a little as the hero leaves.
  let scrollTurn = 0;
  const onScroll = () => {
    const r = host.getBoundingClientRect();
    // only turn once the hero starts to leave, never before (e.g. while the page settles)
    scrollTurn = THREE.MathUtils.clamp(-r.top / innerHeight, 0, 1.5);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Run only while visible.
  let visible = true, raf = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  const t0 = performance.now();
  const v = new THREE.Vector3();
  function frame() {
    const t = (performance.now() - t0) / 1000;
    // a soft spring toward the pointer
    vel.x = (vel.x + (target.x - current.x) * 0.045) * 0.82;
    vel.y = (vel.y + (target.y - current.y) * 0.045) * 0.82;
    current.x += vel.x;
    current.y += vel.y;
    open += (openTarget - open) * 0.06;

    if (!dragging) {
      spin += spinVel;
      spinVel *= 0.94;
      if (Math.abs(spinVel) < 0.002) {
        // settle back to the nearest full turn
        const home = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
        spin += (home - spin) * 0.05;
      }
    }

    rig.rotation.y = current.x * MAX_TILT + spin + scrollTurn * 0.6;
    rig.rotation.x = current.y * MAX_TILT + scrollTurn * 0.25;
    // idle float
    emblem.position.y = Math.sin(t * 1.1) * 10;
    emblem.rotation.z = Math.sin(t * 0.6) * 0.03;
    emblem.rotation.y = -0.32 + Math.sin(t * 0.45) * 0.06;

    // the pieces part along the emblem's forward direction
    pieces.forEach((m, i) => {
      const [ex, ey, ez] = EXPLODE[i] ?? [0, 0, 0];
      const wobble = Math.sin(t * 1.6 + i) * 3 * open;
      v.set(ex * open, -ey * open + wobble, ez * open);
      m.position.lerp(v, 0.25);
    });

    glow.position.set(current.x * 360, -current.y * 260, 420);
    glow.intensity = 1.4 + open * 1.6;
    renderer.render(scene, camera);
  }
  function loop() {
    cancelAnimationFrame(raf);
    if (reduced) { frame(); return; }
    const step = () => {
      if (!visible || document.hidden) return;
      frame();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  frame();
  host.classList.add('is-3d');
  loop();
}
