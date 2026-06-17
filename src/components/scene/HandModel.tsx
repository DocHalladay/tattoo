/**
 * SWAP: Replace with your own hand/arm GLB.
 * Drop a new file at public/models/left-hand.glb (or change HAND_MODEL_PATH).
 * Default: WebXR generic left hand — rigged, anatomically proportioned.
 */

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useSkinMaterial } from './ForearmModel';
import { HAND_TIP_Y, WRIST_Y } from './forearmGeometry';

const HAND_MODEL_PATH = '/models/left-hand.glb';

useGLTF.preload(HAND_MODEL_PATH);

export function HandModel() {
  const { scene } = useGLTF(HAND_MODEL_PATH);
  const skinMaterial = useSkinMaterial();

  const { hand, position } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh || (obj as THREE.Mesh).isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = skinMaterial.clone();
      }
    });

    const probe = new THREE.Group();
    probe.add(clone);
    const box = new THREE.Box3().setFromObject(probe);
    const size = new THREE.Vector3();
    box.getSize(size);

    const scale = (WRIST_Y - HAND_TIP_Y) / size.y;
    clone.scale.setScalar(scale);
    clone.rotation.x = Math.PI / 2;
    clone.rotation.z = -Math.PI / 2;

    const aligned = new THREE.Box3().setFromObject(clone);
    const pos = new THREE.Vector3(0, WRIST_Y - aligned.max.y, 0);

    return { hand: clone, position: pos };
  }, [scene, skinMaterial]);

  return <primitive object={hand} position={position} />;
}
