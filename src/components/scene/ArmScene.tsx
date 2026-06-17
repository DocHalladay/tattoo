import { useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useApp } from '../../store/AppContext';
import { generateTattooTexture } from '../../textures/tattooTextureGenerator';
import { ForearmModel } from './ForearmModel';
import { GhostSleevePreview } from './GhostSleevePreview';
import { Lighting } from './Lighting';
import { CameraRig } from './CameraRig';
import { LabelMarkers } from './LabelMarkers';

function SceneInvalidator({
  phase,
  shadingMode,
  showFuturePreview,
}: {
  phase: number;
  shadingMode: string;
  showFuturePreview: boolean;
}) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [phase, shadingMode, showFuturePreview, invalidate]);
  return null;
}

export function ArmScene() {
  const {
    phase,
    shadingMode,
    showFuturePreview,
    showLabels,
    autoRotate,
    cameraPreset,
    setCameraPreset,
    canvasRef,
  } = useApp();

  const tattooTexture = useMemo(
    () => generateTattooTexture(phase, shadingMode, showFuturePreview),
    [phase, shadingMode, showFuturePreview],
  );

  useEffect(() => {
    tattooTexture.needsUpdate = true;
  }, [tattooTexture]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.1, 2.8], fov: 42, near: 0.1, far: 50 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl }) => {
        canvasRef.current = gl.domElement;
        gl.setClearColor('#0f0d0b');
        gl.toneMappingExposure = 1.1;
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Lighting />
      <SceneInvalidator
        phase={phase}
        shadingMode={shadingMode}
        showFuturePreview={showFuturePreview}
      />
      <group position={[0, 0, 0]}>
        <ForearmModel tattooTexture={tattooTexture} />
        <GhostSleevePreview
          tattooTexture={tattooTexture}
          visible={showFuturePreview && phase >= 4}
        />
        <LabelMarkers visible={showLabels} />
      </group>
      <CameraRig
        preset={cameraPreset}
        autoRotate={autoRotate}
        onPresetApplied={() => {
          if (cameraPreset === 'rotation') {
            setTimeout(() => setCameraPreset(null), 8000);
          }
        }}
      />
    </Canvas>
  );
}
