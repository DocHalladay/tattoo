/**
 * Fallback procedural tattoo texture (used if reference images fail to load).
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
} from './tattooElements';

let cachedKey = '';
let cachedTexture: THREE.CanvasTexture | null = null;

export function generateTattooTexture(shading: ShadingMode): THREE.CanvasTexture {
  const key = `fallback-${shading}`;
  if (cachedTexture && cachedKey === key) return cachedTexture;

  const canvas = document.createElement('canvas');
  canvas.width  = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Always draw all elements — full sleeve
  const dctx = { ctx, phase: 5, shading, opacity: 1 };
  drawAnchor(dctx);
  drawFlowers(dctx);
  drawWaves(dctx);
  drawCompass(dctx);
  drawMountains(dctx);
  drawBirds(dctx);

  if (cachedTexture) cachedTexture.dispose();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY      = false;
  texture.wrapS      = THREE.ClampToEdgeWrapping;
  texture.wrapT      = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  cachedKey    = key;
  cachedTexture = texture;
  return texture;
}
