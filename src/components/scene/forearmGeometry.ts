/**
 * SWAP: Replace createForearmGeometry() with imported glTF forearm mesh.
 * Hand is loaded separately from public/models/left-hand.glb (see HandModel.tsx).
 * For a full arm scan, replace both with a single left-arm.glb and merge UVs.
 */

import * as THREE from 'three';

const RADIAL_SEGMENTS = 64;
const HEIGHT_SEGMENTS = 48;

/** Wrist joint — forearm starts here (hand attaches below) */
export const WRIST_Y = 0;
/** Elbow end */
export const ELBOW_Y = 2.5;
/**
 * Fingertips (hand model scaled to fill WRIST_Y → HAND_TIP_Y).
 * Anatomically a hand is ~60% of forearm length, so 2.5 × 0.6 = 1.5 units.
 * Increased from -0.58 which made the hand look tiny.
 */
export const HAND_TIP_Y = -1.5;

export const LIMB_CENTER_Y = (ELBOW_Y + HAND_TIP_Y) / 2;

const FOREARM_LENGTH = ELBOW_Y - WRIST_Y;

function radiusAtForearmT(t: number): number {
  const base = THREE.MathUtils.lerp(0.35, 0.42, t);
  const bulge = Math.exp(-Math.pow((t - 0.45) / 0.22, 2)) * 0.08;
  return base + bulge;
}

function addDiskCap(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
  y: number,
  radius: number,
  normalY: number,
) {
  const centerIndex = positions.length / 3;
  positions.push(0, y, 0);
  normals.push(0, normalY, 0);
  uvs.push(0.5, normalY > 0 ? 1 : 0);

  for (let i = 0; i <= RADIAL_SEGMENTS; i++) {
    const theta = (i / RADIAL_SEGMENTS) * Math.PI * 2;
    positions.push(Math.sin(theta) * radius, y, Math.cos(theta) * radius);
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

function buildForearmColumn(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
  inflate = 1,
) {
  for (let y = 0; y <= HEIGHT_SEGMENTS; y++) {
    const t = y / HEIGHT_SEGMENTS;
    const yPos = WRIST_Y + t * FOREARM_LENGTH;
    const r = radiusAtForearmT(t) * inflate;

    for (let x = 0; x <= RADIAL_SEGMENTS; x++) {
      const u = x / RADIAL_SEGMENTS;
      const theta = u * Math.PI * 2;
      positions.push(Math.sin(theta) * r, yPos, Math.cos(theta) * r);
      normals.push(Math.sin(theta), 0, Math.cos(theta));
      uvs.push(u, t);
    }
  }

  const row = RADIAL_SEGMENTS + 1;
  for (let y = 0; y < HEIGHT_SEGMENTS; y++) {
    for (let x = 0; x < RADIAL_SEGMENTS; x++) {
      const a = y * row + x;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }
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

/** Forearm + wrist taper (skin) */
export function createForearmGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  buildForearmColumn(positions, normals, uvs, indices);

  const elbowR = radiusAtForearmT(1);
  addDiskCap(positions, normals, uvs, indices, ELBOW_Y, elbowR, 1);

  return finalizeGeometry(positions, normals, uvs, indices);
}

/** Tattoo shell — slightly inflated */
export function createForearmTattooGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  buildForearmColumn(positions, normals, uvs, indices, 1.004);

  return finalizeGeometry(positions, normals, uvs, indices);
}

/** Short wrist collar blending hand into forearm */
export function createWristCollarGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const segments = 12;
  const yStart = -0.06;
  const yEnd = 0.04;

  for (let y = 0; y <= segments; y++) {
    const t = y / segments;
    const yPos = THREE.MathUtils.lerp(yStart, yEnd, t);
    const r = THREE.MathUtils.lerp(0.3, radiusAtForearmT(0), t);

    for (let x = 0; x <= RADIAL_SEGMENTS; x++) {
      const u = x / RADIAL_SEGMENTS;
      const theta = u * Math.PI * 2;
      positions.push(Math.sin(theta) * r, yPos, Math.cos(theta) * r);
      normals.push(Math.sin(theta), 0, Math.cos(theta));
      uvs.push(u, t * 0.05);
    }
  }

  const row = RADIAL_SEGMENTS + 1;
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < RADIAL_SEGMENTS; x++) {
      const a = y * row + x;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  return finalizeGeometry(positions, normals, uvs, indices);
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

  for (let y = 0; y <= segments; y++) {
    const t = y / segments;
    const yPos = ELBOW_Y + t * length;
    const r = THREE.MathUtils.lerp(wristR, shoulderR, t);

    for (let x = 0; x <= RADIAL_SEGMENTS; x++) {
      const u = x / RADIAL_SEGMENTS;
      const theta = u * Math.PI * 2;
      positions.push(Math.sin(theta) * r, yPos, Math.cos(theta) * r);
      normals.push(Math.sin(theta), 0, Math.cos(theta));
      uvs.push(u, 1 + t * 0.15);
    }
  }

  const row = RADIAL_SEGMENTS + 1;
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < RADIAL_SEGMENTS; x++) {
      const a = y * row + x;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  addDiskCap(positions, normals, uvs, indices, ELBOW_Y + length, shoulderR, 1);

  return finalizeGeometry(positions, normals, uvs, indices);
}
