/**
 * Camera presets — adjusted for hand at HAND_TIP_Y=-1.5, forearm to ELBOW_Y=2.5.
 * Full limb center ≈ (2.5 + -1.5) / 2 = 0.5
 */

export type CameraPresetId =
  | 'inner'
  | 'outer'
  | 'top'
  | 'wrist'
  | 'hand'
  | 'rotation';

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  autoRotate?: boolean;
}

/** Center of full limb: (ELBOW_Y=2.5 + HAND_TIP_Y=-1.5) / 2 = 0.5 */
const LIMB_CENTER: [number, number, number] = [0, 0.5, 0];

export const cameraPresets: CameraPreset[] = [
  {
    id: 'inner',
    label: 'Inner Forearm',
    position: [0, 1.0, 3.2],
    target: [0, 1.0, 0],
  },
  {
    id: 'outer',
    label: 'Outer Forearm',
    position: [0, 1.0, -3.2],
    target: [0, 1.0, 0],
  },
  {
    id: 'top',
    label: 'Top Down',
    position: [0.3, 3.8, 0.6],
    target: [0, 1.2, 0],
  },
  {
    id: 'wrist',
    label: 'Wrist',
    position: [0.2, -0.1, 2.8],
    target: [0, 0.0, 0],
  },
  {
    id: 'hand',
    label: 'Hand',
    position: [0.8, -1.0, 2.0],
    target: [0, -0.8, 0],
  },
  {
    id: 'rotation',
    label: 'Full Rotation',
    position: [3.2, 0.5, 0],
    target: LIMB_CENTER,
    autoRotate: true,
  },
];
