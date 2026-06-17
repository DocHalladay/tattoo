/**
 * Builds tattoo textures from your design board images.
 * SWAP: Adjust crops in referenceCrops.ts or replace images in public/reference/.
 */

import * as THREE from 'three';
import type { ShadingMode } from '../store/AppContext';
import { TEXTURE_WIDTH, TEXTURE_HEIGHT } from './tattooElements';
import {
  WRAP_ROTATION_VIEWS,
  STORY_PHASE_ARMS,
  WRAP_HORIZONTAL_FOREARM,
} from './referenceCrops';
import { extractTattooInk, applyShadingToInk } from './inkExtraction';
import { loadReferenceImages } from './referenceTattooLoader';

const UV_V_MAX = 1.15;
const CANVAS_H = Math.round(TEXTURE_HEIGHT * UV_V_MAX);

let cacheKey = '';
let cacheTexture: THREE.CanvasTexture | null = null;

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function phaseRevealV(phase: number): number {
  const stops = [0.32, 0.52, 0.68, 0.86, 1.02];
  const p = Math.min(5, Math.max(1, phase));
  const lo = Math.floor(p) - 1;
  const hi = Math.min(4, lo + 1);
  const t = p === Math.floor(p) ? 1 : smoothstep(p - Math.floor(p));
  return stops[lo] + (stops[hi] - stops[lo]) * t;
}

function applyPhaseMask(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  revealV: number,
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const minY = h * (1 - revealV / UV_V_MAX);
  const fadeH = h * 0.035;

  for (let y = 0; y < h; y++) {
    if (y >= minY) continue;
    const fade = y > minY - fadeH ? (y - (minY - fadeH)) / fadeH : 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      d[i + 3] = Math.round(d[i + 3] * fade);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: { x: number; y: number; w: number; h: number },
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, dx, dy, dw, dh);
}

/** 5 rotation views stitched horizontally — wrap board middle row */
function buildWrapStrip(
  ctx: CanvasRenderingContext2D,
  wrapImg: HTMLImageElement,
  w: number,
  h: number,
) {
  const sliceW = w / WRAP_ROTATION_VIEWS.length;
  WRAP_ROTATION_VIEWS.forEach((crop, i) => {
    drawCover(ctx, wrapImg, crop, i * sliceW, 0, sliceW + 1, h);
  });
}

/** Horizontal forearm from wrap board — outer panels */
function paintHorizontalPanels(
  ctx: CanvasRenderingContext2D,
  wrapImg: HTMLImageElement,
  w: number,
  h: number,
) {
  const panelW = Math.round(w * 0.28);
  const positions = [0.36, 0.64];

  positions.forEach((u) => {
    const tmp = document.createElement('canvas');
    tmp.width = panelW;
    tmp.height = h;
    const tctx = tmp.getContext('2d')!;
    drawCover(tctx, wrapImg, WRAP_HORIZONTAL_FOREARM, 0, 0, panelW, h);
    extractTattooInk(tctx, 0, 0, panelW, h, 0.9);
    ctx.globalAlpha = 0.8;
    ctx.drawImage(tmp, Math.round(u * w - panelW / 2), 0);
  });
  ctx.globalAlpha = 1;
}

/** Phase progression from story board — inner forearm */
function paintPhaseProgression(
  ctx: CanvasRenderingContext2D,
  storyImg: HTMLImageElement,
  w: number,
  h: number,
  phase: number,
) {
  const p = Math.min(5, Math.max(1, phase));
  const lo = Math.floor(p) - 1;
  const hi = Math.min(4, lo + 1);
  const t = p === Math.floor(p) ? 1 : smoothstep(p - Math.floor(p));

  const destW = Math.round(w * 0.22);
  const destX = Math.round(w * 0.02);

  const paint = (index: number, alpha: number) => {
    if (alpha <= 0) return;
    const tmp = document.createElement('canvas');
    tmp.width = destW;
    tmp.height = h;
    const tctx = tmp.getContext('2d')!;
    drawCover(tctx, storyImg, STORY_PHASE_ARMS[index], 0, 0, destW, h);
    extractTattooInk(tctx, 0, 0, destW, h, 1);
    ctx.globalAlpha = alpha;
    ctx.drawImage(tmp, destX, 0);
  };

  if (lo === hi || t >= 1) {
    paint(lo, 0.95);
  } else {
    paint(lo, 0.95 * (1 - t));
    paint(hi, 0.95 * t);
  }
  ctx.globalAlpha = 1;
}

export async function buildReferenceTattooTexture(
  phase: number,
  shading: ShadingMode,
  showGhost: boolean,
): Promise<THREE.CanvasTexture> {
  const key = `ref-v3-${phase.toFixed(2)}-${shading}-${showGhost}`;
  if (cacheTexture && cacheKey === key) return cacheTexture;

  const { wrap, story } = await loadReferenceImages();

  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  buildWrapStrip(ctx, wrap, canvas.width, canvas.height);
  extractTattooInk(ctx, 0, 0, canvas.width, canvas.height, 1);

  paintHorizontalPanels(ctx, wrap, canvas.width, canvas.height);
  paintPhaseProgression(ctx, story, canvas.width, canvas.height, phase);

  applyPhaseMask(ctx, canvas.width, canvas.height, phaseRevealV(phase));
  applyShadingToInk(ctx, canvas.width, canvas.height, shading);

  if (cacheTexture) cacheTexture.dispose();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  cacheKey = key;
  cacheTexture = texture;
  return texture;
}
