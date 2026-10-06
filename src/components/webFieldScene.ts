import * as THREE from "three";

export interface WebFieldScene {
  resize: () => void;
  destroy: () => void;
}

interface MountOptions {
  reducedMotion: boolean;
  intensity: "ambient" | "focus";
}

const HEX = 6;
const POINTY = Math.PI / 2;

function cssColor(varName: string, fallback: string): THREE.Color {
  const color = new THREE.Color();
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const css = raw ? `hsl(${raw})` : fallback;
  const probe = document.createElement("span");
  probe.style.color = css;
  document.documentElement.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  if (resolved && resolved !== "rgba(0, 0, 0, 0)") {
    color.setStyle(resolved);
    return color;
  }
  color.setStyle(fallback);
  return color;
}

function isWebGLAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

function hexRing(radius: number, z = 0): THREE.Vector3[] {
  return Array.from({ length: HEX }, (_, i) => {
    const angle = POINTY + (i * Math.PI) / 3;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
  });
}

/**
 * Full-bleed digital web — concentric hex rings being spun into place,
 * luminous hub, traveling crimson signal. Ontology graph / spiderweb.
 */
export function mountWebFieldScene(
  canvas: HTMLCanvasElement,
  options: MountOptions,
): WebFieldScene | null {
  if (!isWebGLAvailable()) return null;

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(geo: T) => {
    geometries.push(geo);
    return geo;
  };
  const trackMat = <T extends THREE.Material>(mat: T) => {
    materials.push(mat);
    return mat;
  };

  try {
    return buildWebFieldScene(canvas, options, geometries, materials, trackGeo, trackMat);
  } catch (error) {
    geometries.forEach((geo) => geo.dispose());
    materials.forEach((mat) => mat.dispose());
    console.warn("WebField: falling back to SVG", error);
    return null;
  }
}

function buildWebFieldScene(
  canvas: HTMLCanvasElement,
  options: MountOptions,
  geometries: THREE.BufferGeometry[],
  materials: THREE.Material[],
  trackGeo: <T extends THREE.BufferGeometry>(geo: T) => T,
  trackMat: <T extends THREE.Material>(mat: T) => T,
): WebFieldScene {
  const focus = options.intensity === "focus";
  const signalBlue = cssColor("--highlight", "#3b8aff");
  const crimson = cssColor("--highlight-secondary", "#e23d4c");
  const steel = cssColor("--foreground", "#e2e5eb");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, focus ? 1.75 : 1.25));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0.15, 0.08, focus ? 9.4 : 11.2);
  camera.lookAt(0.4, 0, 0);

  const rig = new THREE.Group();
  rig.rotation.x = 0.42;
  rig.rotation.y = -0.18;
  scene.add(rig);

  const farRig = new THREE.Group();
  farRig.position.z = -2.4;
  farRig.scale.setScalar(1.55);
  rig.add(farRig);

  const ringRadii = focus
    ? [0.55, 1.15, 1.85, 2.7, 3.7]
    : [0.7, 1.5, 2.5, 3.6];

  type Strand = {
    positions: Float32Array;
    material: THREE.LineBasicMaterial;
    line: THREE.Line;
    phase: number;
    speed: number;
    baseOpacity: number;
  };

  const strands: Strand[] = [];

  const addLoop = (
    parent: THREE.Group,
    points: THREE.Vector3[],
    color: THREE.Color,
    baseOpacity: number,
    phase: number,
    speed: number,
  ) => {
    const closed = [...points, points[0].clone()];
    const positions = new Float32Array(closed.length * 3);
    closed.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    const geo = trackGeo(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = trackMat(
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: baseOpacity,
        depthWrite: false,
      }),
    );
    const line = new THREE.Line(geo, material);
    parent.add(line);
    strands.push({ positions, material, line, phase, speed, baseOpacity });
  };

  const addSegment = (
    parent: THREE.Group,
    from: THREE.Vector3,
    to: THREE.Vector3,
    color: THREE.Color,
    baseOpacity: number,
    phase: number,
    speed: number,
  ) => {
    const positions = new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z]);
    const geo = trackGeo(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = trackMat(
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: baseOpacity,
        depthWrite: false,
      }),
    );
    const line = new THREE.Line(geo, material);
    parent.add(line);
    strands.push({ positions, material, line, phase, speed, baseOpacity });
  };

  // Foreground web — rings + radial silk + crosslinks
  ringRadii.forEach((radius, ringIndex) => {
    const z = (ringIndex / (ringRadii.length - 1)) * 0.55 - 0.12;
    const verts = hexRing(radius, z);
    const isBlue = ringIndex % 2 === 1;
    const opacity = focus
      ? 0.12 + ringIndex * 0.07
      : 0.08 + ringIndex * 0.05;
    addLoop(
      rig,
      verts,
      isBlue ? signalBlue : steel,
      opacity,
      ringIndex * 0.17,
      0.55 + ringIndex * 0.08,
    );

    for (let i = 0; i < HEX; i += 1) {
      if (ringIndex === 0) {
        addSegment(
          rig,
          new THREE.Vector3(0, 0, 0.2),
          verts[i],
          i % 2 === 0 ? signalBlue : steel,
          focus ? 0.28 : 0.16,
          i * 0.11 + ringIndex * 0.07,
          0.7,
        );
      } else {
        const inner = hexRing(ringRadii[ringIndex - 1], z - 0.12);
        addSegment(
          rig,
          inner[i],
          verts[i],
          i % 2 === 0 ? signalBlue : steel,
          focus ? 0.18 : 0.1,
          i * 0.09 + ringIndex * 0.05,
          0.62 + ringIndex * 0.04,
        );
      }

      // Occasional diagonal silk — uneven so it feels spun, not stamped
      if ((i + ringIndex) % 3 === 0 && ringIndex < ringRadii.length - 1) {
        const next = hexRing(ringRadii[ringIndex + 1], z + 0.12);
        addSegment(
          rig,
          verts[i],
          next[(i + 1) % HEX],
          steel,
          focus ? 0.1 : 0.06,
          i * 0.13,
          0.5,
        );
      }
    }
  });

  // Far counter-rotating constellation
  const farRadii = [1.4, 2.4, 3.5];
  farRadii.forEach((radius, ringIndex) => {
    const verts = hexRing(radius, -0.4 - ringIndex * 0.15);
    addLoop(farRig, verts, steel, focus ? 0.07 : 0.04, ringIndex * 0.2, 0.35);
    for (let i = 0; i < HEX; i += 1) {
      addSegment(
        farRig,
        new THREE.Vector3(0, 0, -0.2),
        verts[i],
        signalBlue,
        focus ? 0.05 : 0.03,
        i * 0.08,
        0.4,
      );
    }
  });

  // Connector nodes
  const nodeMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: signalBlue,
      transparent: true,
      opacity: focus ? 0.75 : 0.45,
      depthWrite: false,
    }),
  );
  const nodeGeo = trackGeo(new THREE.SphereGeometry(0.045, 10, 8));
  const nodes: THREE.Mesh[] = [];
  const outerVerts = hexRing(ringRadii[ringRadii.length - 1], 0.4);
  const midVerts = hexRing(ringRadii[Math.floor(ringRadii.length / 2)], 0.15);
  [...outerVerts, ...midVerts].forEach((pos, i) => {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.copy(pos);
    node.scale.setScalar(0.7 + (i % 3) * 0.25);
    rig.add(node);
    nodes.push(node);
  });

  // Hub
  const hubGroup = new THREE.Group();
  hubGroup.position.z = 0.22;
  rig.add(hubGroup);

  const hubCore = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.16, 24, 16)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: signalBlue,
        transparent: true,
        opacity: 0.95,
      }),
    ),
  );
  hubGroup.add(hubCore);

  const hubHot = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.07, 16, 12)),
    trackMat(new THREE.MeshBasicMaterial({ color: new THREE.Color("#f4f9ff") })),
  );
  hubGroup.add(hubHot);

  const hubGlow = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.55, 20, 14)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: signalBlue,
        transparent: true,
        opacity: focus ? 0.14 : 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  hubGroup.add(hubGlow);

  const ember = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.28, 16, 12)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: crimson,
        transparent: true,
        opacity: focus ? 0.22 : 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  hubGroup.add(ember);

  // Crimson signal racing the mid ring
  const signalRing = hexRing(ringRadii[Math.min(2, ringRadii.length - 1)], 0.18);
  const signalPath = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 0; i < HEX; i += 1) {
    signalPath.add(new THREE.LineCurve3(signalRing[i], signalRing[(i + 1) % HEX]));
  }

  const signal = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.07, 14, 10)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: crimson,
        transparent: true,
        opacity: 0.95,
      }),
    ),
  );
  rig.add(signal);

  const signalGlow = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.18, 12, 8)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: crimson,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  rig.add(signalGlow);

  const trail: THREE.Mesh[] = [];
  const trailGeo = trackGeo(new THREE.SphereGeometry(0.04, 8, 6));
  for (let i = 0; i < 6; i += 1) {
    const ghost = new THREE.Mesh(
      trailGeo,
      trackMat(
        new THREE.MeshBasicMaterial({
          color: crimson,
          transparent: true,
          opacity: 0.22 - i * 0.03,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    trail.push(ghost);
    rig.add(ghost);
  }

  // Expanding hex scan — silk being cast outward
  const scanMat = trackMat(
    new THREE.LineBasicMaterial({
      color: signalBlue,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  const scan = new THREE.LineLoop(
    trackGeo(new THREE.BufferGeometry().setFromPoints(hexRing(1, 0.05))),
    scanMat,
  );
  rig.add(scan);

  // Soft dust motes along the field
  const dustCount = focus ? 48 : 24;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.8 + Math.random() * 3.8;
    dustPositions[i * 3] = Math.cos(a) * r;
    dustPositions[i * 3 + 1] = Math.sin(a) * r;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
  }
  const dustGeo = trackGeo(new THREE.BufferGeometry());
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeo,
    trackMat(
      new THREE.PointsMaterial({
        color: signalBlue,
        size: focus ? 0.035 : 0.028,
        transparent: true,
        opacity: focus ? 0.45 : 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    ),
  );
  rig.add(dust);

  const clock = new THREE.Clock();
  let rafHeld = false;
  const spinReveal = { value: options.reducedMotion ? 1 : 0 };

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth || canvas.parentElement?.clientWidth || 320);
    const height = Math.max(1, canvas.clientHeight || canvas.parentElement?.clientHeight || 240);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const tick = () => {
    const t = options.reducedMotion ? 0.4 : clock.getElapsedTime();

    if (!options.reducedMotion && spinReveal.value < 1) {
      spinReveal.value = Math.min(1, spinReveal.value + 0.0045);
    }

    // Slow tumble — the web being spun in space
    rig.rotation.z = t * (focus ? 0.085 : 0.05);
    rig.rotation.y = -0.18 + Math.sin(t * 0.28) * 0.12;
    rig.rotation.x = 0.42 + Math.cos(t * 0.22) * 0.05;
    farRig.rotation.z = -t * 0.04;

    // Silk opacity breathes as strands are "spun"
    strands.forEach((strand) => {
      const wave = 0.55 + 0.45 * Math.sin(t * strand.speed + strand.phase * Math.PI * 2);
      const reveal = THREE.MathUtils.smoothstep(spinReveal.value, strand.phase * 0.35, 1);
      strand.material.opacity = strand.baseOpacity * (0.45 + wave * 0.55) * reveal;
    });

    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
    hubGlow.scale.setScalar(0.92 + pulse * 0.14);
    (hubGlow.material as THREE.MeshBasicMaterial).opacity =
      (focus ? 0.1 : 0.06) + pulse * 0.08;
    ember.scale.setScalar(0.9 + pulse * 0.18);
    (ember.material as THREE.MeshBasicMaterial).opacity =
      (focus ? 0.16 : 0.08) + pulse * 0.1;

    const u = (t * (focus ? 0.07 : 0.045)) % 1;
    signalPath.getPoint(u, signal.position);
    signalGlow.position.copy(signal.position);
    trail.forEach((ghost, i) => {
      signalPath.getPoint((u - (i + 1) * 0.016 + 1) % 1, ghost.position);
    });

    nodes.forEach((node, i) => {
      const proximity = Math.max(0, 1 - node.position.distanceTo(signal.position) / 0.55);
      node.scale.setScalar((0.7 + (i % 3) * 0.25) * (1 + proximity * 0.7));
    });

    // Expanding hexagonal scan — silk being cast outward
    const scanT = (t * 0.18) % 1;
    const scanScale = 0.35 + scanT * (ringRadii[ringRadii.length - 1] * 1.05);
    scan.scale.setScalar(scanScale);
    scan.position.z = 0.05 - scanT * 0.25;
    scanMat.opacity = (1 - scanT) * (focus ? 0.22 : 0.12) * spinReveal.value;

    dust.rotation.z = t * 0.03;
    (dust.material as THREE.PointsMaterial).opacity =
      (focus ? 0.35 : 0.2) + pulse * 0.12;


    renderer.render(scene, camera);
  };

  const setLoop = (on: boolean) => {
    if (on && !rafHeld) {
      rafHeld = true;
      renderer.setAnimationLoop(tick);
      return;
    }
    if (!on && rafHeld) {
      rafHeld = false;
      renderer.setAnimationLoop(null);
    }
  };

  const onVisibility = () => {
    if (options.reducedMotion) return;
    setLoop(!document.hidden);
  };

  resize();
  tick();
  if (!options.reducedMotion) setLoop(true);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    resize,
    destroy: () => {
      document.removeEventListener("visibilitychange", onVisibility);
      setLoop(false);
      geometries.forEach((geo) => geo.dispose());
      materials.forEach((mat) => mat.dispose());
      renderer.dispose();
    },
  };
}
