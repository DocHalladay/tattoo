/**
 * SWAP: Orchestrates tattoo layer compositing.
 * Call generateTattooTexture() — swap individual elements in tattooElements.ts.
 */

import * as THREE from 'three';
import type { ShadingMode } from '../store/AppContext';
import {
  TEXTURE_WIDTH,
  TEXTURE_HEIGHT,
  drawAnchor,
  drawFlowers,
  drawWaves,
  drawCompass,
  drawMountains,
  drawBirds,
  drawGhostHorizon,
} from './tattooElements';

let cachedKey = '';
let cachedTexture: THREE.CanvasTexture | null = null;

export function generateTattooTexture(
  phase: number,
  shading: ShadingMode,
  showGhost: boolean,
): THREE.CanvasTexture {
  const key = `${phase.toFixed(2)}-${shading}-${showGhost}`;
  if (cachedTexture && cachedKey === key) return cachedTexture;

  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = Math.round(TEXTURE_HEIGHT * 1.15); // extra for ghost upper-arm region
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const baseOpacity = 1;
  const dctx = { ctx, phase, shading, opacity: baseOpacity };

  drawAnchor(dctx);
  drawFlowers(dctx);
  drawWaves(dctx);
  drawCompass(dctx);
  drawMountains(dctx);
  drawBirds(dctx);

  if (showGhost && phase >= 4.5) {
    const ghostOpacity = Math.min(1, (phase - 4.5) * 2);
    drawGhostHorizon(ctx, shading, ghostOpacity);
  }

  if (cachedTexture) {
    cachedTexture.dispose();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  cachedKey = key;
  cachedTexture = texture;
  return texture;
}
