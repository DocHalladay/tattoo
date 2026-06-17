/**
 * SWAP: Adjust camera preset positions for a different arm model or scale.
 * Positions are spherical offsets from arm center (0, 1.25, 0).
 */

export type CameraPresetId =
  | 'inner'
  | 'outer'
  | 'top'
  | 'wrist'
  | 'rotation';

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  autoRotate?: boolean;
}

const ARM_CENTER: [number, number, number] = [0, 1.25, 0];

export const cameraPresets: CameraPreset[] = [
  {
    id: 'inner',
    label: 'Inner Forearm',
    position: [0, 1.1, 2.8],
    target: ARM_CENTER,
  },
  {
    id: 'outer',
    label: 'Outer Forearm',
    position: [0, 1.2, -2.8],
    target: ARM_CENTER,
  },
  {
    id: 'top',
    label: 'Top',
    position: [0.3, 3.2, 0.5],
    target: ARM_CENTER,
  },
  {
    id: 'wrist',
    label: 'Wrist',
    position: [1.5, 0.3, 1.8],
    target: [0, 0.4, 0],
  },
  {
    id: 'rotation',
    label: 'Full Rotation',
    position: [2.5, 1.5, 0],
    target: ARM_CENTER,
    autoRotate: true,
  },
];
