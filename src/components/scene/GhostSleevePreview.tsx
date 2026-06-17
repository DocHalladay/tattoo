import { useMemo } from 'react';
import * as THREE from 'three';
import { createUpperArmGeometry } from './forearmGeometry';
import { useSkinMaterial } from './ForearmModel';

interface GhostSleevePreviewProps {
  tattooTexture: THREE.Texture;
  visible: boolean;
}

export function GhostSleevePreview({ tattooTexture, visible }: GhostSleevePreviewProps) {
  const geometry = useMemo(() => createUpperArmGeometry(), []);
  const skinMaterial = useSkinMaterial();

  const tattooMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tattooTexture,
        transparent: true,
        opacity: 0.45,
        alphaTest: 0.02,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [tattooTexture],
  );

  const ghostSkin = useMemo(() => {
    const m = skinMaterial.clone();
    m.transparent = true;
    m.opacity = 0.4;
    return m;
  }, [skinMaterial]);

  if (!visible) return null;

  return (
    <group>
      <mesh geometry={geometry} material={ghostSkin} renderOrder={0} />
      <mesh geometry={geometry} material={tattooMaterial} renderOrder={1} />
    </group>
  );
}
