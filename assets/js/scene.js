// Farohiddin Isomidinov — Hero 3D neural network (Three.js, no build step)
// Loaded as an ES module via importmap. Everything is wrapped in try/catch so
// the page degrades to a static gradient if WebGL is unavailable.
import * as THREE from 'three';

(function initScene() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const fail = () => document.body.classList.add('webgl-failed');

  // Honour reduced-motion: render a single static frame, no loop / parallax.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // Colours from the design system.
  const BLUE = new THREE.Color(0x3b82f6);
  const VIOLET = new THREE.Color(0x8b5cf6);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch (err) {
    console.warn('[scene] WebGL init failed:', err);
    fail();
    return;
  }

  try {
    // ----- sizing helpers -----
    const host = canvas.parentElement || document.body;
    const sizeOf = () => ({
      w: host.clientWidth || window.innerWidth,
      h: host.clientHeight || window.innerHeight,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // cap at 2

    const scene = new THREE.Scene();
    const { w, h } = sizeOf();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 14);
    renderer.setSize(w, h, false);

    const group = new THREE.Group();
    scene.add(group);

    // ----- build a feed-forward "neural network" -----
    // Layers along x; nodes spread in y/z for depth.
    const layers = isMobile ? [4, 6, 6, 4] : [5, 8, 9, 7, 4];
    const spacingX = 3.2;
    const spanY = isMobile ? 5 : 6.5;

    const nodes = [];      // { pos: Vector3, color: Color, layer }
    const layerNodes = []; // node indices per layer

    for (let li = 0; li < layers.length; li++) {
      const count = layers[li];
      const x = (li - (layers.length - 1) / 2) * spacingX;
      const idx = [];
      for (let n = 0; n < count; n++) {
        const y = count === 1 ? 0 : (n / (count - 1) - 0.5) * spanY;
        const z = (Math.sin(n * 12.9898 + li * 4.1414) * 43758.5453 % 1) * 3 - 1.5;
        const t = li / (layers.length - 1);
        const color = BLUE.clone().lerp(VIOLET, t * 0.85 + (n % 2) * 0.1);
        idx.push(nodes.length);
        nodes.push({ pos: new THREE.Vector3(x, y, z), color });
      }
      layerNodes.push(idx);
    }

    // ----- node points (custom glow shader, per-node pulse) -----
    const nodeGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(nodes.length * 3);
    const colors = new Float32Array(nodes.length * 3);
    const phases = new Float32Array(nodes.length);
    nodes.forEach((nd, i) => {
      positions[i * 3] = nd.pos.x;
      positions[i * 3 + 1] = nd.pos.y;
      positions[i * 3 + 2] = nd.pos.z;
      colors[i * 3] = nd.color.r;
      colors[i * 3 + 1] = nd.color.g;
      colors[i * 3 + 2] = nd.color.b;
      phases[i] = i * 1.7;
    });
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    nodeGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const nodeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: isMobile ? 26 : 34 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aColor;
        attribute float aPhase;
        uniform float uTime;
        uniform float uSize;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vPulse;
        void main() {
          vColor = aColor;
          float pulse = 0.55 + 0.45 * sin(uTime * 1.6 + aPhase);
          vPulse = pulse;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * (0.6 + 0.6 * pulse) * uPixelRatio * (1.0 / -mv.z) * 10.0;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vPulse;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float core = smoothstep(0.5, 0.0, d);
          float glow = pow(core, 2.2);
          gl_FragColor = vec4(vColor * (1.0 + vPulse * 0.8), glow);
        }
      `,
    });
    group.add(new THREE.Points(nodeGeo, nodeMat));

    // ----- connections (feed-forward, thinned) -----
    const linePos = [];
    const lineCol = [];
    for (let li = 0; li < layerNodes.length - 1; li++) {
      const a = layerNodes[li];
      const b = layerNodes[li + 1];
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          // deterministic thinning so it isn't a solid mesh
          const keep = (Math.sin(i * 7.13 + j * 3.71 + li * 5.2) * 43758.5453 % 1);
          if (Math.abs(keep) > 0.55) continue;
          const na = nodes[a[i]];
          const nb = nodes[b[j]];
          linePos.push(na.pos.x, na.pos.y, na.pos.z, nb.pos.x, nb.pos.y, nb.pos.z);
          lineCol.push(na.color.r, na.color.g, na.color.b, nb.color.r, nb.color.g, nb.color.b);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    // ----- particle field behind the network -----
    const pCount = isMobile ? 220 : 600;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pPos[i * 3 + 2] = -4 - Math.random() * 18;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x6b8fd6,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ----- mouse parallax -----
    const target = { x: 0, y: 0 };
    if (!reduceMotion) {
      window.addEventListener('pointermove', (e) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    // ----- resize -----
    const onResize = () => {
      const { w, h } = sizeOf();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      nodeMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // ----- pause when tab hidden -----
    let running = true;
    let rafId = null;
    let t = 0;

    const render = () => {
      nodeMat.uniforms.uTime.value = t;
      group.rotation.x += (target.y * 0.25 - group.rotation.x) * 0.05;
      group.rotation.y += (target.x * 0.4 - group.rotation.y) * 0.05;
      particles.rotation.y = t * 0.01;
      renderer.render(scene, camera);
    };

    const loop = () => {
      if (!running) return;
      t += 0.016;
      group.rotation.y += 0.0009; // slow autonomous spin
      render();
      rafId = requestAnimationFrame(loop);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else if (!reduceMotion && !running) {
        running = true;
        loop();
      }
    });

    if (reduceMotion) {
      render(); // one static frame
    } else {
      loop();
    }
  } catch (err) {
    console.warn('[scene] render setup failed:', err);
    if (renderer) renderer.dispose();
    fail();
  }
})();
