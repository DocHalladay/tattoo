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
        opacity: 0.35,
        alphaTest: 0.06,
        depthWrite: true,
        side: THREE.FrontSide,
        toneMapped: false,
      }),
    [tattooTexture],
  );

  const ghostSkin = useMemo(() => {
    const m = skinMaterial.clone();
    m.transparent = false;
    m.opacity = 1;
    m.color = new THREE.Color('#b8997e');
    return m;
  }, [skinMaterial]);

  if (!visible) return null;

  return (
    <group>
      <mesh geometry={geometry} material={ghostSkin} castShadow receiveShadow />
      <mesh geometry={geometry} material={tattooMaterial} />
    </group>
  );
}
