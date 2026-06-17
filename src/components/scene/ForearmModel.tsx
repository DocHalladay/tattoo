/**
 * SWAP: Replace procedural mesh with a real arm model.
 *
 * Example glTF swap:
 *   import { useGLTF } from '@react-three/drei';
 *   const { scene } = useGLTF('/models/forearm.glb');
 *   return <primitive object={scene.clone()} position={[0,0,0]} />
 *
 * Ensure the imported model is a LEFT forearm, wrist at y=0, elbow at y=2.5.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { createForearmGeometry } from './forearmGeometry';

function createSkinNormalMap(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 128 + (Math.random() - 0.5) * 18;
    img.data[i] = n;
    img.data[i + 1] = n;
    img.data[i + 2] = 255;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function useSkinMaterial(): THREE.MeshStandardMaterial {
  return useMemo(() => {
    const normalMap = createSkinNormalMap();
    normalMap.repeat.set(4, 8);
    return new THREE.MeshStandardMaterial({
      color: '#c9a88a',
      roughness: 0.65,
      metalness: 0.02,
      normalMap,
      normalScale: new THREE.Vector2(0.15, 0.15),
    });
  }, []);
}

interface ForearmModelProps {
  tattooTexture: THREE.Texture;
}

export function ForearmModel({ tattooTexture }: ForearmModelProps) {
  const geometry = useMemo(() => createForearmGeometry(), []);
  const skinMaterial = useSkinMaterial();

  const tattooMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: tattooTexture,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    return mat;
  }, [tattooTexture]);

  return (
    <group>
      <mesh geometry={geometry} material={skinMaterial} castShadow receiveShadow renderOrder={0} />
      <mesh
        geometry={geometry}
        material={tattooMaterial}
        renderOrder={1}
      />
    </group>
  );
}
