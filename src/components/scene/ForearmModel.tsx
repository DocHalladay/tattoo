/**
 * SWAP: Full arm replacement
 * --------------------------
 * 1. Hand: public/models/left-hand.glb (see HandModel.tsx)
 * 2. Forearm mesh: replace createForearmGeometry() in forearmGeometry.ts
 * 3. Full scan: use a single left-arm.glb with UVs and remove HandModel + procedural forearm
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import {
  createForearmGeometry,
  createForearmTattooGeometry,
  createWristCollarGeometry,
} from './forearmGeometry';
import { HandModel } from './HandModel';

/**
 * Multi-octave normal map: large-scale skin creases + fine pore noise.
 */
function createSkinNormalMap(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const lo = (Math.random() - 0.5) * 14;  // low-freq crease
      const hi = (Math.random() - 0.5) * 30;  // high-freq pore
      const n = Math.max(0, Math.min(255, 128 + lo + hi * 0.4));
      img.data[i] = img.data[i + 1] = Math.round(n);
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function useSkinMaterial(): THREE.MeshStandardMaterial {
  return useMemo(() => {
    const normalMap = createSkinNormalMap();
    normalMap.repeat.set(6, 12);
    return new THREE.MeshStandardMaterial({
      color: '#c4956e',     // warmer medium skin, reads well under warm key light
      roughness: 0.72,
      metalness: 0.0,
      normalMap,
      normalScale: new THREE.Vector2(0.22, 0.22),
      envMapIntensity: 0.6,
      side: THREE.FrontSide,
    });
  }, []);
}

interface ForearmModelProps {
  tattooTexture: THREE.Texture;
}

export function ForearmModel({ tattooTexture }: ForearmModelProps) {
  const forearmGeometry = useMemo(() => createForearmGeometry(), []);
  const tattooGeometry = useMemo(() => createForearmTattooGeometry(), []);
  const wristGeometry = useMemo(() => createWristCollarGeometry(), []);
  const skinMaterial = useSkinMaterial();

  const tattooMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tattooTexture,
        transparent: true,
        alphaTest: 0.05,
        depthWrite: false,   // avoid z-fighting with skin
        depthTest: true,
        side: THREE.FrontSide,
        roughness: 0.85,     // ink sits slightly matte in skin
        metalness: 0.0,
        envMapIntensity: 0.3,
        toneMapped: true,
      }),
    [tattooTexture],
  );

  return (
    <group>
      <HandModel />
      <mesh geometry={wristGeometry} material={skinMaterial} castShadow receiveShadow />
      <mesh geometry={forearmGeometry} material={skinMaterial} castShadow receiveShadow />
      <mesh geometry={tattooGeometry} material={tattooMaterial} />
    </group>
  );
}
