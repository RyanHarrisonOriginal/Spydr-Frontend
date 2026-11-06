import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

export interface WebLoaderScene {
  resize: () => void;
  destroy: () => void;
}

interface MountOptions {
  reducedMotion: boolean;
}

const HEX_COUNT = 6;
const POINTY_TOP = Math.PI / 2;
const LINE_WIDTH_PX = 1.25;
const RIG_TILT_X = THREE.MathUtils.degToRad(16);
const YAW_PERIOD_S = 28;
const SIGNAL_PERIOD_S = 3.2;
const SIGNAL_EDGE_FRAC = 0.18;
const TRACE_FADE_MS = 600;
const NODE_RETURN_MS = 400;
const HUB_BREATH_S = 2.4;
const OUTER_R = 1.78;
const MID_R = 1.16;
const INNER_R = 0.5;
const NODE_R = 0.045;
const HUB_R = 0.08;

const FALLBACK_FG = "#e8eaed";
const FALLBACK_MUTED = "#8a9099";
const FALLBACK_ACTIVE = "#3FB5A3";

interface EdgeHandle {
  line: Line2;
  material: LineMaterial;
  baseOpacity: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  highlightAt: number;
}

interface PathSeg {
  from: THREE.Vector3;
  to: THREE.Vector3;
  length: number;
  edge: EdgeHandle | null;
  endNode: number | null;
}

interface SharedGeometries {
  nodeCircle: THREE.CircleGeometry;
  hubCircle: THREE.CircleGeometry;
  innerLoop: LineGeometry;
  spokeGeos: LineGeometry[];
  midGeos: LineGeometry[];
  frameGeos: LineGeometry[];
  outerGeos: LineGeometry[];
  signalGeo: LineGeometry;
  midNodes: THREE.Vector3[];
  outerVerts: THREE.Vector3[];
  hub: THREE.Vector3;
}

let sharedGeometries: SharedGeometries | null = null;

function hexRing(radius: number, z = 0): THREE.Vector3[] {
  return Array.from({ length: HEX_COUNT }, (_, i) => {
    const angle = POINTY_TOP + (i * Math.PI) / 3;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
  });
}

function makeLineGeometry(pairs: Array<[THREE.Vector3, THREE.Vector3]>): LineGeometry {
  const arr: number[] = [];
  for (const [a, b] of pairs) {
    arr.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const geo = new LineGeometry();
  geo.setPositions(arr);
  return geo;
}

function loopPairs(points: THREE.Vector3[]): Array<[THREE.Vector3, THREE.Vector3]> {
  return points.map((p, i) => [p, points[(i + 1) % points.length]]);
}

function getSharedGeometries(): SharedGeometries {
  if (sharedGeometries) return sharedGeometries;

  const hub = new THREE.Vector3(0, 0, 0);
  const midNodes = hexRing(MID_R, 0);
  const outerVerts = hexRing(OUTER_R, -0.04);
  const innerVerts = hexRing(INNER_R, 0.04);

  const spokeGeos = midNodes.map((m) => makeLineGeometry([[hub, m]]));
  const midGeos = midNodes.map((m, i) =>
    makeLineGeometry([[m, midNodes[(i + 1) % HEX_COUNT]]]),
  );
  const frameGeos = midNodes.map((m, i) => makeLineGeometry([[m, outerVerts[i]]]));
  const outerGeos = outerVerts.map((o, i) =>
    makeLineGeometry([[o, outerVerts[(i + 1) % HEX_COUNT]]]),
  );

  sharedGeometries = {
    nodeCircle: new THREE.CircleGeometry(NODE_R, 24),
    hubCircle: new THREE.CircleGeometry(HUB_R, 28),
    innerLoop: makeLineGeometry(loopPairs(innerVerts)),
    spokeGeos,
    midGeos,
    frameGeos,
    outerGeos,
    signalGeo: makeLineGeometry([[hub, midNodes[0]]]),
    midNodes,
    outerVerts,
    hub,
  };

  return sharedGeometries;
}

function cloneLineGeometry(source: LineGeometry): LineGeometry {
  const start = source.getAttribute("instanceStart") as THREE.InterleavedBufferAttribute | undefined;
  const end = source.getAttribute("instanceEnd") as THREE.InterleavedBufferAttribute | undefined;
  const arr: number[] = [];
  if (start && end) {
    for (let i = 0; i < start.count; i += 1) {
      arr.push(start.getX(i), start.getY(i), start.getZ(i), end.getX(i), end.getY(i), end.getZ(i));
    }
  }
  const geo = new LineGeometry();
  if (arr.length) geo.setPositions(arr);
  return geo;
}

function readCssColor(el: Element, varName: string, fallback: string): THREE.Color {
  const color = new THREE.Color();
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  let css = fallback;
  if (raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl(")) {
    css = raw;
  }
  // HSL-component tokens (e.g. root --muted) are not usable as colors — keep fallback.

  const probe = document.createElement("span");
  probe.style.color = css;
  el.appendChild(probe);
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

function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

function makeLineMaterial(
  color: THREE.Color,
  opacity: number,
  resolution: THREE.Vector2,
): LineMaterial {
  return new LineMaterial({
    color: color.clone(),
    linewidth: LINE_WIDTH_PX,
    transparent: true,
    opacity,
    depthTest: true,
    depthWrite: false,
    worldUnits: false,
    resolution: resolution.clone(),
  });
}

function makeEdgeLine(
  from: THREE.Vector3,
  to: THREE.Vector3,
  template: LineGeometry,
  color: THREE.Color,
  opacity: number,
  resolution: THREE.Vector2,
  materials: THREE.Material[],
  geometries: THREE.BufferGeometry[],
): EdgeHandle {
  const geo = cloneLineGeometry(template);
  geometries.push(geo);
  const material = makeLineMaterial(color, opacity, resolution);
  materials.push(material);
  const line = new Line2(geo, material);
  line.computeLineDistances();
  return {
    line,
    material,
    baseOpacity: opacity,
    from: from.clone(),
    to: to.clone(),
    highlightAt: -1,
  };
}

/**
 * Quiet line-drawn Spydr mark — hexagonal web with a single teal signal.
 */
export function mountWebLoaderScene(
  canvas: HTMLCanvasElement,
  options: MountOptions,
): WebLoaderScene | null {
  if (!isWebGLAvailable()) return null;

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  try {
    return buildWebLoaderScene(canvas, options, geometries, materials);
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
): WebLoaderScene {
  const shared = getSharedGeometries();
  const themeRoot = canvas.parentElement ?? document.documentElement;
  const resolution = new THREE.Vector2(1, 1);

  let fg = readCssColor(themeRoot, "--fg", FALLBACK_FG);
  let muted = readCssColor(themeRoot, "--muted", FALLBACK_MUTED);
  let active = readCssColor(themeRoot, "--active", FALLBACK_ACTIVE);

  const renderer = new THREE.WebGLRenderer({
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
  camera.position.set(0, 0.04, 7.2);
  camera.lookAt(0, 0, 0);

  const rig = new THREE.Group();
  rig.rotation.x = RIG_TILT_X;
  scene.add(rig);

  const trackMat = <T extends THREE.Material>(mat: T) => {
    materials.push(mat);
    return mat;
  };
  const trackGeo = <T extends THREE.BufferGeometry>(geo: T) => {
    geometries.push(geo);
    return geo;
  };

  const midNodes = shared.midNodes.map((v) => v.clone());
  const outerVerts = shared.outerVerts.map((v) => v.clone());
  const hub = shared.hub.clone();

  // Inner hex — structure only (not on the signal path).
  const innerMat = trackMat(makeLineMaterial(fg, 0.45, resolution));
  const innerLine = new Line2(trackGeo(cloneLineGeometry(shared.innerLoop)), innerMat);
  innerLine.computeLineDistances();
  rig.add(innerLine);

  const edges: EdgeHandle[] = [];
  const addEdge = (
    from: THREE.Vector3,
    to: THREE.Vector3,
    template: LineGeometry,
    opacity: number,
  ) => {
    const edge = makeEdgeLine(
      from,
      to,
      template,
      fg,
      opacity,
      resolution,
      materials,
      geometries,
    );
    edges.push(edge);
    rig.add(edge.line);
    return edge;
  };

  // Spokes (hub → mid), mid rim, frame links (mid → outer), outer frame.
  const spokeEdges = midNodes.map((m, i) => addEdge(hub, m, shared.spokeGeos[i], 0.3));
  const midEdges = midNodes.map((m, i) =>
    addEdge(m, midNodes[(i + 1) % HEX_COUNT], shared.midGeos[i], 0.45),
  );
  const frameEdges = midNodes.map((m, i) =>
    addEdge(m, outerVerts[i], shared.frameGeos[i], 0.3),
  );
  const outerEdges = outerVerts.map((o, i) =>
    addEdge(o, outerVerts[(i + 1) % HEX_COUNT], shared.outerGeos[i], 0.22),
  );

  const nodes = midNodes.map((position) => {
    const mat = trackMat(
      new THREE.MeshBasicMaterial({
        color: muted.clone(),
        transparent: true,
        opacity: 1,
        depthWrite: false,
      }),
    );
    const mesh = new THREE.Mesh(trackGeo(shared.nodeCircle.clone()), mat);
    mesh.position.copy(position);
    rig.add(mesh);
    return {
      mesh,
      mat,
      baseColor: muted.clone(),
      hitAt: -1,
    };
  });

  const hubMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: fg.clone(),
      transparent: true,
      opacity: options.reducedMotion ? 1 : 0.75,
      depthWrite: false,
    }),
  );
  const hubMesh = new THREE.Mesh(trackGeo(shared.hubCircle.clone()), hubMat);
  hubMesh.position.copy(hub);
  rig.add(hubMesh);

  const signalGeo = trackGeo(cloneLineGeometry(shared.signalGeo));
  const signalMat = trackMat(makeLineMaterial(active, 1, resolution));
  const signalLine = new Line2(signalGeo, signalMat);
  signalLine.computeLineDistances();
  signalLine.visible = !options.reducedMotion;
  rig.add(signalLine);

  // hub → spoke → around mid ring → out to frame → around outer → back to hub
  const pathSegs: PathSeg[] = [];
  const pushSeg = (
    from: THREE.Vector3,
    to: THREE.Vector3,
    edge: EdgeHandle | null,
    endNode: number | null,
  ) => {
    pathSegs.push({
      from,
      to,
      length: from.distanceTo(to),
      edge,
      endNode,
    });
  };

  pushSeg(hub, midNodes[0], spokeEdges[0], 0);
  for (let i = 0; i < HEX_COUNT; i += 1) {
    const next = (i + 1) % HEX_COUNT;
    pushSeg(midNodes[i], midNodes[next], midEdges[i], next);
  }
  pushSeg(midNodes[0], outerVerts[0], frameEdges[0], 0);
  for (let i = 0; i < HEX_COUNT; i += 1) {
    pushSeg(outerVerts[i], outerVerts[(i + 1) % HEX_COUNT], outerEdges[i], null);
  }
  pushSeg(outerVerts[0], midNodes[0], frameEdges[0], 0);
  pushSeg(midNodes[0], hub, spokeEdges[0], null);

  const pathLength = pathSegs.reduce((sum, s) => sum + s.length, 0);
  const avgEdgeLen = pathLength / pathSegs.length;
  const signalLen = avgEdgeLen * SIGNAL_EDGE_FRAC;

  const tmpFrom = new THREE.Vector3();
  const tmpTo = new THREE.Vector3();

  const pointAt = (distance: number, out: THREE.Vector3): PathSeg => {
    let d = ((distance % pathLength) + pathLength) % pathLength;
    for (const seg of pathSegs) {
      if (d <= seg.length) {
        const t = seg.length === 0 ? 0 : d / seg.length;
        out.lerpVectors(seg.from, seg.to, t);
        return seg;
      }
      d -= seg.length;
    }
    const last = pathSegs[pathSegs.length - 1];
    out.copy(last.to);
    return last;
  };

  let lastSegIndex = -1;
  const clock = new THREE.Clock();
  let rafHeld = false;
  let disposed = false;

  const syncLineResolutions = () => {
    materials.forEach((mat) => {
      if (mat instanceof LineMaterial) {
        mat.resolution.copy(resolution);
      }
    });
  };

  const applyTheme = () => {
    fg = readCssColor(themeRoot, "--fg", FALLBACK_FG);
    muted = readCssColor(themeRoot, "--muted", FALLBACK_MUTED);
    active = readCssColor(themeRoot, "--active", FALLBACK_ACTIVE);

    innerMat.color.copy(fg);
    edges.forEach((edge) => {
      if (edge.highlightAt < 0) edge.material.color.copy(fg);
    });
    nodes.forEach((node) => {
      node.baseColor.copy(muted);
      if (node.hitAt < 0) node.mat.color.copy(muted);
    });
    hubMat.color.copy(fg);
    signalMat.color.copy(active);
  };

  const themeObserver = new MutationObserver(() => applyTheme());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
  });

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth || canvas.parentElement?.clientWidth || 64);
    const height = Math.max(1, canvas.clientHeight || canvas.parentElement?.clientHeight || 64);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    resolution.set(width, height);
    syncLineResolutions();
  };

  const tick = () => {
    if (disposed) return;

    hubMesh.quaternion.copy(camera.quaternion);
    nodes.forEach((node) => node.mesh.quaternion.copy(camera.quaternion));

    if (options.reducedMotion) {
      rig.rotation.x = RIG_TILT_X;
      rig.rotation.y = 0;
      hubMat.opacity = 1;
      signalLine.visible = false;
      edges.forEach((edge) => {
        edge.material.color.copy(fg);
        edge.material.opacity = edge.baseOpacity;
      });
      nodes.forEach((node) => {
        node.mat.color.copy(node.baseColor);
        node.mesh.scale.setScalar(1);
      });
      renderer.render(scene, camera);
      return;
    }

    const t = clock.getElapsedTime();
    const nowMs = t * 1000;

    rig.rotation.x = RIG_TILT_X;
    rig.rotation.y = (t / YAW_PERIOD_S) * Math.PI * 2;

    hubMat.opacity = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin((t / HUB_BREATH_S) * Math.PI * 2));

    const dist = (t / SIGNAL_PERIOD_S) * pathLength;
    const headSeg = pointAt(dist, tmpTo);
    pointAt(dist - signalLen, tmpFrom);
    signalGeo.setPositions([tmpFrom.x, tmpFrom.y, tmpFrom.z, tmpTo.x, tmpTo.y, tmpTo.z]);
    signalLine.visible = true;

    const segIndex = pathSegs.indexOf(headSeg);
    if (segIndex !== lastSegIndex && segIndex >= 0) {
      lastSegIndex = segIndex;
      const seg = pathSegs[segIndex];
      if (seg.edge) seg.edge.highlightAt = nowMs;
      if (seg.endNode !== null) nodes[seg.endNode].hitAt = nowMs;
    }

    edges.forEach((edge) => {
      if (edge.highlightAt < 0) {
        edge.material.color.copy(fg);
        edge.material.opacity = edge.baseOpacity;
        return;
      }
      const elapsed = nowMs - edge.highlightAt;
      if (elapsed >= TRACE_FADE_MS) {
        edge.highlightAt = -1;
        edge.material.color.copy(fg);
        edge.material.opacity = edge.baseOpacity;
        return;
      }
      const fade = 1 - easeOutCubic(elapsed / TRACE_FADE_MS);
      edge.material.color.copy(fg).lerp(active, fade);
      edge.material.opacity = edge.baseOpacity + (1 - edge.baseOpacity) * fade;
    });

    nodes.forEach((node) => {
      if (node.hitAt < 0) {
        node.mat.color.copy(node.baseColor);
        node.mesh.scale.setScalar(1);
        return;
      }
      const elapsed = nowMs - node.hitAt;
      if (elapsed >= NODE_RETURN_MS) {
        node.hitAt = -1;
        node.mat.color.copy(node.baseColor);
        node.mesh.scale.setScalar(1);
        return;
      }
      const fade = 1 - easeOutCubic(elapsed / NODE_RETURN_MS);
      node.mat.color.copy(node.baseColor).lerp(active, fade);
      node.mesh.scale.setScalar(1 + 0.4 * fade);
    });

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
  applyTheme();
  tick();
  if (!options.reducedMotion) setLoop(true);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    resize,
    destroy: () => {
      disposed = true;
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setLoop(false);
      geometries.forEach((geo) => geo.dispose());
      materials.forEach((mat) => mat.dispose());
      renderer.dispose();
    },
  };
}
