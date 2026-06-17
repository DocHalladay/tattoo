/**
 * SWAP: Update label anchor positions if arm model or tattoo layout changes.
 * Position format: [x, y, z] in scene space (wrist y≈0, elbow y≈2.5).
 */

import { Html, Line } from '@react-three/drei';
import { symbolism } from '../../data/symbolism';

interface LabelMarkersProps {
  visible: boolean;
}

const anchors: Record<string, [number, number, number]> = {
  anchor: [0, 0.02, 0.34],
  family: [0.32, 0.9, 0.28],
  struggle: [-0.35, 1.1, -0.15],
  direction: [-0.42, 1.05, -0.35],
  perspective: [-0.3, 1.85, -0.32],
  legacy: [-0.2, 2.2, -0.2],
};

const labelOffsets: Record<string, [number, number, number]> = {
  anchor: [0.5, -0.15, 0.55],
  family: [0.75, 0.5, 0.45],
  struggle: [-0.75, 0.3, -0.55],
  direction: [-0.85, 0.2, -0.7],
  perspective: [-0.7, 0.5, -0.75],
  legacy: [-0.55, 0.6, -0.55],
};

export function LabelMarkers({ visible }: LabelMarkersProps) {
  if (!visible) return null;

  return (
    <>
      {symbolism.map((entry) => {
        const pos = anchors[entry.id];
        const offset = labelOffsets[entry.id];
        if (!pos || !offset) return null;

        const labelPos: [number, number, number] = [
          pos[0] + offset[0],
          pos[1] + offset[1],
          pos[2] + offset[2],
        ];

        return (
          <group key={entry.id}>
            <mesh position={pos}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#c5a059" />
            </mesh>
            <Line
              points={[pos, labelPos]}
              color="#c5a059"
              lineWidth={1}
              transparent
              opacity={0.6}
            />
            <Html position={labelPos} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
              <div
                style={{
                  background: 'rgba(26, 23, 20, 0.92)',
                  border: '1px solid #c5a059',
                  padding: '4px 8px',
                  borderRadius: 2,
                  fontSize: 10,
                  color: '#e8ddd0',
                  fontFamily: 'Cormorant Garamond, serif',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.title}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
