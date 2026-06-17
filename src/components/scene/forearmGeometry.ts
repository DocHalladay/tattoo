/**
 * SWAP: Replace with imported glTF hand + forearm model.
 * Left arm: palm faces +Z (inner). Wrist at y=0, hand extends downward.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const RADIAL_SEGMENTS = 64;

/** Wrist joint — forearm starts here */
export const WRIST_Y = 0;
/** Elbow end */
export const ELBOW_Y = 2.5;
/** Fingertips */
export const HAND_TIP_Y = -0.78;

const FOREARM_LENGTH = ELBOW_Y - WRIST_Y;
const HAND_LENGTH = WRIST_Y - HAND_TIP_Y;
export const LIMB_CENTER_Y = (ELBOW_Y + HAND_TIP_Y) / 2;

function radiusAtForearmT(t: number): number {
  const base = THREE.MathUtils.lerp(0.35, 0.42, t);
  const bulge = Math.exp(-Math.pow((t - 0.45) / 0.22, 2)) * 0.08;
  return base + bulge;
}

/** Hand uses elliptical cross-sections; forearm is circular */
function handRadiiAt(y: number): { rx: number; rz: number } {
  const t = (y - HAND_TIP_Y) / HAND_LENGTH; // 0 fingertips → 1 wrist
  const palm = Math.sin(t * Math.PI * 0.92); // bell curve, 0 at tips

  const rx = THREE.MathUtils.lerp(0.1, 0.34, Math.pow(t, 0.55)) + palm * 0.06;
  const rz = THREE.MathUtils.lerp(0.07, 0.31, Math.pow(t, 0.65)) + palm * 0.04;
  return { rx, rz };
}

function addEllipticalColumn(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
  yStart: number,
  yEnd: number,
  segmentsY: number,
  uvVStart: number,
  uvVEnd: number,
  radiusFn: (y: number, t: number) => { rx: number; rz: number },
) {
  const baseVertex = positions.length / 3;

  for (let yi = 0; yi <= segmentsY; yi++) {
    const t = yi / segmentsY;
    const y = THREE.MathUtils.lerp(yStart, yEnd, t);
    const { rx, rz } = radiusFn(y, t);
    const v = THREE.MathUtils.lerp(uvVStart, uvVEnd, t);

    for (let xi = 0; xi <= RADIAL_SEGMENTS; xi++) {
      const u = xi / RADIAL_SEGMENTS;
      const theta = u * Math.PI * 2;
      const x = Math.sin(theta) * rx;
      const z = Math.cos(theta) * rz;

      positions.push(x, y, z);
      const nx = Math.sin(theta) / rx;
      const nz = Math.cos(theta) / rz;
      const len = Math.sqrt(nx * nx + nz * nz) || 1;
      normals.push(nx / len, 0, nz / len);
      uvs.push(u, v);
    }
  }

  const row = RADIAL_SEGMENTS + 1;
  for (let yi = 0; yi < segmentsY; yi++) {
    for (let xi = 0; xi < RADIAL_SEGMENTS; xi++) {
      const a = baseVertex + yi * row + xi;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }
}

function addDiskCap(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
  y: number,
  rx: number,
  rz: number,
  normalY: number,
) {
  const centerIndex = positions.length / 3;
  positions.push(0, y, 0);
  normals.push(0, normalY, 0);
  uvs.push(0.5, normalY > 0 ? 1 : 0);

  for (let i = 0; i <= RADIAL_SEGMENTS; i++) {
    const theta = (i / RADIAL_SEGMENTS) * Math.PI * 2;
    positions.push(Math.sin(theta) * rx, y, Math.cos(theta) * rz);
    normals.push(0, normalY, 0);
    uvs.push(i / RADIAL_SEGMENTS, normalY > 0 ? 1 : 0);
  }

  for (let i = 0; i < RADIAL_SEGMENTS; i++) {
    const a = centerIndex + 1 + i;
    const b = centerIndex + 1 + i + 1;
    if (normalY > 0) indices.push(centerIndex, b, a);
    else indices.push(centerIndex, a, b);
  }
}

/** Four fingers + thumb — simplified boxes */
function createFingersGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const fingerW = 0.055;
  const fingerD = 0.045;

  const fingerOffsets = [-0.1, -0.033, 0.033, 0.1];
  fingerOffsets.forEach((ox) => {
    const geo = new THREE.BoxGeometry(fingerW, 0.42, fingerD);
    geo.translate(ox, HAND_TIP_Y + 0.24, 0.1);
    parts.push(geo);
  });

  const thumb = new THREE.BoxGeometry(0.05, 0.28, 0.05);
  thumb.rotateZ(0.55);
  thumb.translate(-0.2, HAND_TIP_Y + 0.38, 0.06);
  parts.push(thumb);

  const knuckles = new THREE.BoxGeometry(0.26, 0.06, 0.08);
  knuckles.translate(0, HAND_TIP_Y + 0.48, 0.12);
  parts.push(knuckles);

  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  if (!merged) return new THREE.BufferGeometry();
  merged.computeVertexNormals();
  return merged;
}

function buildForearmColumn(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
  inflate = 1,
) {
  const segmentsY = 48;
  addEllipticalColumn(
    positions,
    normals,
    uvs,
    indices,
    WRIST_Y,
    ELBOW_Y,
    segmentsY,
    0,
    1,
    (y) => {
      const t = (y - WRIST_Y) / FOREARM_LENGTH;
      const r = radiusAtForearmT(t) * inflate;
      return { rx: r, rz: r };
    },
  );
}

function buildHandColumn(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
) {
  const segmentsY = 20;
  addEllipticalColumn(
    positions,
    normals,
    uvs,
    indices,
    HAND_TIP_Y,
    WRIST_Y,
    segmentsY,
    -0.08,
    0,
    (y) => handRadiiAt(y),
  );

  const tip = handRadiiAt(HAND_TIP_Y);
  addDiskCap(positions, normals, uvs, indices, HAND_TIP_Y, tip.rx, tip.rz, -1);
}

function finalizeGeometry(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Full left arm: hand + wrist + forearm (skin) */
export function createForearmGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  buildHandColumn(positions, normals, uvs, indices);
  buildForearmColumn(positions, normals, uvs, indices);

  const elbowR = radiusAtForearmT(1);
  addDiskCap(positions, normals, uvs, indices, ELBOW_Y, elbowR, elbowR, 1);

  const body = finalizeGeometry(positions, normals, uvs, indices);
  const fingers = createFingersGeometry();
  const merged = mergeGeometries([body, fingers], false);
  fingers.dispose();
  body.dispose();
  if (!merged) return body;
  merged.computeVertexNormals();
  return merged;
}

/** Tattoo shell — forearm + wrist only (y >= 0), slightly inflated */
export function createForearmTattooGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  buildForearmColumn(positions, normals, uvs, indices, 1.004);

  const geometry = finalizeGeometry(positions, normals, uvs, indices);
  return geometry;
}

export function createUpperArmGeometry(): THREE.BufferGeometry {
  const length = 0.9;
  const segments = 32;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const wristR = 0.42;
  const shoulderR = 0.55;

  addEllipticalColumn(
    positions,
    normals,
    uvs,
    indices,
    ELBOW_Y,
    ELBOW_Y + length,
    segments,
    1,
    1.15,
    (_y, t) => {
      const r = THREE.MathUtils.lerp(wristR, shoulderR, t);
      return { rx: r, rz: r };
    },
  );

  addDiskCap(positions, normals, uvs, indices, ELBOW_Y + length, shoulderR, shoulderR, 1);

  return finalizeGeometry(positions, normals, uvs, indices);
}
