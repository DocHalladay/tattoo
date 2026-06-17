/**
 * SWAP: Replace createForearmGeometry() with imported glTF geometry.
 * If using a real arm scan, ensure UVs are cylindrical (u=angle, v=wrist→elbow).
 */

import * as THREE from 'three';

const LENGTH = 2.5;
const RADIAL_SEGMENTS = 64;
const HEIGHT_SEGMENTS = 48;

function radiusAtT(t: number): number {
  // t: 0=wrist, 1=elbow — slight mid-forearm bulge
  const base = THREE.MathUtils.lerp(0.35, 0.42, t);
  const bulge = Math.exp(-Math.pow((t - 0.45) / 0.22, 2)) * 0.08;
  return base + bulge;
}

export function createForearmGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= HEIGHT_SEGMENTS; y++) {
    const t = y / HEIGHT_SEGMENTS;
    const yPos = t * LENGTH;
    const r = radiusAtT(t);

    for (let x = 0; x <= RADIAL_SEGMENTS; x++) {
      const u = x / RADIAL_SEGMENTS;
      const theta = u * Math.PI * 2;
      // u=0 inner (palm) side for left arm facing camera
      const xPos = Math.sin(theta) * r;
      const zPos = Math.cos(theta) * r;

      positions.push(xPos, yPos, zPos);
      normals.push(Math.sin(theta), 0, Math.cos(theta));
      // u wraps around arm; v goes wrist (0) to elbow (1)
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

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
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

  for (let y = 0; y <= segments; y++) {
    const t = y / segments;
    const yPos = LENGTH + t * length;
    const r = THREE.MathUtils.lerp(wristR, shoulderR, t);

    for (let x = 0; x <= RADIAL_SEGMENTS; x++) {
      const u = x / RADIAL_SEGMENTS;
      const theta = u * Math.PI * 2;
      const xPos = Math.sin(theta) * r;
      const zPos = Math.cos(theta) * r;

      positions.push(xPos, yPos, zPos);
      normals.push(Math.sin(theta), 0, Math.cos(theta));
      // v continues from forearm: 1.0 at elbow, >1 for upper arm ghost art
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

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export const FOREARM_LENGTH = LENGTH;
