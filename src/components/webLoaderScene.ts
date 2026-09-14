import * as THREE from "three";

export interface WebLoaderScene {
  resize: () => void;
  destroy: () => void;
}

interface MountOptions {
  reducedMotion: boolean;
}

const UP = new THREE.Vector3(0, 1, 0);
const HEX_COUNT = 6;
const POINTY_TOP = Math.PI / 2;

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
  return Array.from({ length: HEX_COUNT }, (_, i) => {
    const angle = POINTY_TOP + (i * Math.PI) / 3;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
  });
}

function placeStrut(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();
  mesh.position.copy(from).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  mesh.scale.set(1, length, 1);
}

/**
 * 3D Spydr mark — hexagonal web, luminous core, traveling crimson signal.
 * Reads as ontology graph / spiderweb. Never a literal spider.
 */
export function mountWebLoaderScene(
  canvas: HTMLCanvasElement,
  options: MountOptions,
): WebLoaderScene | null {
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
    return buildWebLoaderScene(canvas, options, geometries, materials, trackGeo, trackMat);
  } catch (error) {
    geometries.forEach((geo) => geo.dispose());
    materials.forEach((mat) => mat.dispose());
    console.warn("WebLoader: falling back to SVG", error);
    return null;
  }
}

function buildWebLoaderScene(
  canvas: HTMLCanvasElement,
  options: MountOptions,
  geometries: THREE.BufferGeometry[],
  materials: THREE.Material[],
  trackGeo: <T extends THREE.BufferGeometry>(geo: T) => T,
  trackMat: <T extends THREE.Material>(mat: T) => T,
): WebLoaderScene {

  const signalBlue = cssColor("--highlight", "#3b8aff");
  const crimson = cssColor("--highlight-secondary", "#e23d4c");
  const steel = cssColor("--foreground", "#e2e5eb");
  const nodeIdle = new THREE.Color("#ffffff");

  let renderer: THREE.WebGLRenderer;
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(0, 0.06, 7.8);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x9aa8be, 0.32));

  const key = new THREE.DirectionalLight(0xf4f7ff, 0.62);
  key.position.set(2.4, 3.2, 4.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(signalBlue, 0.28);
  fill.position.set(-3.2, -0.6, 2.4);
  scene.add(fill);

  const hubLight = new THREE.PointLight(signalBlue, 1.15, 8, 1.8);
  hubLight.position.set(0, 0, 0.35);
  scene.add(hubLight);

  const rig = new THREE.Group();
  rig.rotation.x = 0.34;
  scene.add(rig);

  const strutGeo = trackGeo(new THREE.CylinderGeometry(0.026, 0.026, 1, 6));
  const strutMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: steel,
      metalness: 0.58,
      roughness: 0.28,
    }),
  );

  const frameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: steel,
      metalness: 0.62,
      roughness: 0.22,
    }),
  );

  const outerFrame = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.78, 0.048, 12, 6)),
    frameMat,
  );
  outerFrame.rotation.z = POINTY_TOP;
  outerFrame.position.z = -0.16;
  rig.add(outerFrame);

  const innerFrame = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.5, 0.038, 12, 6)),
    frameMat,
  );
  innerFrame.rotation.z = POINTY_TOP;
  innerFrame.position.z = 0.14;
  rig.add(innerFrame);

  const hubMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: signalBlue,
      emissive: signalBlue,
      emissiveIntensity: 0.95,
      metalness: 0.12,
      roughness: 0.22,
    }),
  );
  const hubCore = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.22, 28, 18)),
    hubMat,
  );
  hubCore.position.z = 0.18;
  rig.add(hubCore);

  const hubHot = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.1, 24, 16)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#f4f9ff"),
      }),
    ),
  );
  hubHot.position.z = 0.2;
  rig.add(hubHot);

  const makeGlow = (radius: number, opacity: number, color: THREE.Color) => {
    const glow = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(radius, 24, 16)),
      trackMat(
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    glow.position.z = 0.18;
    return glow;
  };

  const hubGlowInner = makeGlow(0.4, 0.22, signalBlue);
  const hubGlowOuter = makeGlow(0.72, 0.08, signalBlue);
  rig.add(hubGlowInner, hubGlowOuter);

  const midNodes = hexRing(1.16, 0);
  const innerVerts = hexRing(0.5, 0.14);
  const outerVerts = hexRing(1.78, -0.16);

  for (let i = 0; i < HEX_COUNT; i += 1) {
    const spoke = new THREE.Mesh(strutGeo, strutMat);
    placeStrut(spoke, innerVerts[i], midNodes[i]);
    rig.add(spoke);

    const rimStrut = new THREE.Mesh(strutGeo, strutMat);
    placeStrut(rimStrut, midNodes[i], midNodes[(i + 1) % HEX_COUNT]);
    rig.add(rimStrut);

    const frameLink = new THREE.Mesh(strutGeo, strutMat);
    placeStrut(frameLink, midNodes[i], outerVerts[i]);
    frameLink.scale.x = 0.72;
    frameLink.scale.z = 0.72;
    rig.add(frameLink);
  }

  const nodeGeo = trackGeo(new THREE.SphereGeometry(0.11, 20, 16));
  const nodeRingGeo = trackGeo(new THREE.TorusGeometry(0.125, 0.018, 8, 20));
  const nodeRingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a1f28"),
      metalness: 0.45,
      roughness: 0.4,
    }),
  );

  const nodes = midNodes.map((position) => {
    const group = new THREE.Group();
    group.position.copy(position);

    const bodyMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: nodeIdle.clone(),
      }),
    );
    const body = new THREE.Mesh(nodeGeo, bodyMat);
    const ring = new THREE.Mesh(nodeRingGeo, nodeRingMat);
    group.add(body, ring);
    rig.add(group);
    return { group, bodyMat };
  });

  const signal = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.09, 20, 16)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: crimson,
        emissive: crimson,
        emissiveIntensity: 1.4,
        metalness: 0.15,
        roughness: 0.22,
      }),
    ),
  );
  rig.add(signal);

  const signalGlow = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.2, 16, 12)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: crimson,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  rig.add(signalGlow);

  const trail: THREE.Mesh[] = [];
  const trailGeo = trackGeo(new THREE.SphereGeometry(0.055, 12, 10));
  for (let i = 0; i < 5; i += 1) {
    const ghost = new THREE.Mesh(
      trailGeo,
      trackMat(
        new THREE.MeshBasicMaterial({
          color: crimson,
          transparent: true,
          opacity: 0.28 - i * 0.045,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    trail.push(ghost);
    rig.add(ghost);
  }

  const liveEdgeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: crimson,
      emissive: crimson,
      emissiveIntensity: 2.2,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    }),
  );
  const liveEdge = new THREE.Mesh(strutGeo, liveEdgeMat);
  rig.add(liveEdge);
  const signalPath = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 0; i < HEX_COUNT; i += 1) {
    signalPath.add(new THREE.LineCurve3(midNodes[i], midNodes[(i + 1) % HEX_COUNT]));
  }

  const scanMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: signalBlue,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const scan = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(1, 0.018, 8, 6)), scanMat);
  scan.rotation.z = POINTY_TOP;
  rig.add(scan);

  const fieldMat = trackMat(
    new THREE.LineBasicMaterial({
      color: signalBlue,
      transparent: true,
      opacity: 0.16,
    }),
  );
  const field = new THREE.LineLoop(
    trackGeo(new THREE.BufferGeometry().setFromPoints(hexRing(1.96, -0.28))),
    fieldMat,
  );
  rig.add(field);

  const clock = new THREE.Clock();
  let rafHeld = false;

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth || canvas.parentElement?.clientWidth || 128);
    const height = Math.max(1, canvas.clientHeight || canvas.parentElement?.clientHeight || 128);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const tick = () => {
    const t = options.reducedMotion ? 0.35 : clock.getElapsedTime();

    rig.rotation.z = t * 0.28;
    rig.rotation.y = Math.sin(t * 0.62) * 0.32;
    rig.rotation.x = 0.28 + Math.cos(t * 0.48) * 0.07;
    field.rotation.z = -t * 0.1;

    const pulse = 0.5 + 0.5 * Math.sin(t * 3.1);
    hubMat.emissiveIntensity = 0.85 + pulse * 0.4;
    hubLight.intensity = 0.95 + pulse * 0.35;
    hubGlowInner.scale.setScalar(0.96 + pulse * 0.1);
    hubGlowOuter.scale.setScalar(0.94 + pulse * 0.12);
    (hubGlowInner.material as THREE.MeshBasicMaterial).opacity = 0.16 + pulse * 0.12;
    (hubGlowOuter.material as THREE.MeshBasicMaterial).opacity = 0.05 + pulse * 0.05;

    const u = (t * 0.095) % 1;
    signalPath.getPoint(u, signal.position);
    signalGlow.position.copy(signal.position);

    const scaled = u * HEX_COUNT;
    const index = Math.floor(scaled) % HEX_COUNT;
    const next = (index + 1) % HEX_COUNT;
    const travel = scaled - Math.floor(scaled);
    placeStrut(liveEdge, midNodes[index], midNodes[next]);
    liveEdgeMat.opacity = 0.3 + (1 - Math.abs(travel - 0.5) * 2) * 0.65;

    nodes.forEach((node) => {
      const proximity = Math.max(0, 1 - node.group.position.distanceTo(signal.position) / 0.3);
      node.bodyMat.color.copy(nodeIdle).lerp(crimson, proximity * proximity);
      node.group.scale.setScalar(1 + proximity * 0.24);
    });

    trail.forEach((ghost, i) => {
      signalPath.getPoint((u - (i + 1) * 0.018 + 1) % 1, ghost.position);
    });

    const scanT = (t * 0.32) % 1;
    const scanScale = 0.42 + scanT * 1.48;
    scan.scale.set(scanScale, scanScale, 1);
    scan.position.z = 0.02 - scanT * 0.2;
    scanMat.opacity = (1 - scanT) * 0.38;

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
