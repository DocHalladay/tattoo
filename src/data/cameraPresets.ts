/**
 * SWAP: Adjust camera preset positions for a different arm model or scale.
 * Positions are spherical offsets from arm center (0, 1.25, 0).
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

/** Center of full limb (hand through forearm) */
const LIMB_CENTER: [number, number, number] = [0, 0.95, 0];

export const cameraPresets: CameraPreset[] = [
  {
    id: 'inner',
    label: 'Inner Forearm',
    position: [0, 1.1, 2.8],
    target: [0, 1.2, 0],
  },
  {
    id: 'outer',
    label: 'Outer Forearm',
    position: [0, 1.2, -2.8],
    target: [0, 1.2, 0],
  },
  {
    id: 'top',
    label: 'Top',
    position: [0.3, 3.2, 0.5],
    target: [0, 1.5, 0],
  },
  {
    id: 'wrist',
    label: 'Wrist',
    position: [0.15, -0.05, 2.4],
    target: [0, -0.02, 0.2],
  },
  {
    id: 'hand',
    label: 'Hand',
    position: [0.9, -0.35, 1.4],
    target: [0, -0.35, 0.2],
  },
  {
    id: 'rotation',
    label: 'Full Rotation',
    position: [2.8, 0.9, 0],
    target: LIMB_CENTER,
    autoRotate: true,
  },
];
