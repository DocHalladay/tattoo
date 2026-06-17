import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useApp } from '../../store/AppContext';
import { useTattooTexture } from '../../hooks/useTattooTexture';
import { ForearmModel } from './ForearmModel';
import { Lighting } from './Lighting';
import { CameraRig } from './CameraRig';
import { LabelMarkers } from './LabelMarkers';

function SceneInvalidator({ texture }: { texture: unknown }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [texture, invalidate]);
  return null;
}

function TattooContent({
  texture,
  showLabels,
}: {
  texture: import('three').Texture;
  showLabels: boolean;
}) {
  return (
    <>
      <SceneInvalidator texture={texture} />
      <ForearmModel tattooTexture={texture} />
      <LabelMarkers visible={showLabels} />
    </>
  );
}

export function ArmScene() {
  const {
    shadingMode,
    showLabels,
    autoRotate,
    cameraPreset,
    setCameraPreset,
    canvasRef,
  } = useApp();

  const { texture, ready } = useTattooTexture(shadingMode);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            fontFamily: 'Cormorant Garamond, serif',
            color: '#c5a059',
            letterSpacing: '0.12em',
            fontSize: 14,
            background: 'rgba(15, 13, 11, 0.6)',
          }}
        >
          Loading your design…
        </div>
      )}
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 4.0], fov: 42, near: 0.1, far: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
          gl.setClearColor('#0f0d0b');
          gl.toneMappingExposure = 1.1;
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Lighting />
        {texture && (
          <group>
            <TattooContent texture={texture} showLabels={showLabels} />
          </group>
        )}
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
    </div>
  );
}
