import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { cameraPresets, type CameraPresetId } from '../../data/cameraPresets';

interface CameraRigProps {
  preset: CameraPresetId | null;
  autoRotate: boolean;
  onPresetApplied?: () => void;
}

export function CameraRig({ preset, autoRotate, onPresetApplied }: CameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3(0, 1.25, 0));
  const animating = useRef(false);
  const rotationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!preset) return;
    const p = cameraPresets.find((c) => c.id === preset);
    if (!p) return;

    targetPos.current.set(...p.position);
    targetLook.current.set(...p.target);
    animating.current = true;

    if (p.autoRotate) {
      if (rotationTimer.current) clearTimeout(rotationTimer.current);
      rotationTimer.current = setTimeout(() => {
        onPresetApplied?.();
      }, 8000);
    } else {
      onPresetApplied?.();
    }

    return () => {
      if (rotationTimer.current) clearTimeout(rotationTimer.current);
    };
  }, [preset, onPresetApplied]);

  useFrame((_, delta) => {
    if (animating.current) {
      camera.position.lerp(targetPos.current, Math.min(1, delta * 3));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLook.current, Math.min(1, delta * 3));
        controlsRef.current.update();
      }
      if (camera.position.distanceTo(targetPos.current) < 0.02) {
        animating.current = false;
      }
    }
  });

  const presetDef = preset ? cameraPresets.find((c) => c.id === preset) : null;
  const shouldAutoRotate = autoRotate || (presetDef?.autoRotate ?? false);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      minDistance={1.2}
      maxDistance={6}
      autoRotate={shouldAutoRotate}
      autoRotateSpeed={0.8}
      target={[0, 1.25, 0]}
    />
  );
}
