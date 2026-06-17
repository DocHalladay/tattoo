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
  STORY_CENTER_FOREARM,
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

/** How far up the arm (v) tattoo is revealed per phase — wrist=0, elbow=1 */
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
  // v=0 wrist is bottom of canvas; hide tattoo above revealV toward elbow (top)
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

/** Story-board phase arms — matches “how it can grow” exactly */
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

  const destW = Math.round(w * 0.36);
  const destX = Math.round(w * 0.04);

  const paint = (index: number, alpha: number) => {
    if (alpha <= 0) return;
    const tmp = document.createElement('canvas');
    tmp.width = destW;
    tmp.height = h;
    const tctx = tmp.getContext('2d')!;
    drawCover(tctx, storyImg, STORY_PHASE_ARMS[index], 0, 0, destW, h);
    extractTattooInk(tctx, 0, 0, destW, h, 1.2);
    ctx.globalAlpha = alpha;
    ctx.drawImage(tmp, destX, 0);
  };

  if (lo === hi || t >= 1) {
    paint(lo, 0.92);
  } else {
    paint(lo, 0.92 * (1 - t));
    paint(hi, 0.92 * t);
  }
  ctx.globalAlpha = 1;
}

/** Hero detail from center forearm on outer wrap panels */
function paintOuterDetail(
  ctx: CanvasRenderingContext2D,
  storyImg: HTMLImageElement,
  w: number,
  h: number,
) {
  const panels = [
    { x: w * 0.38, w: w * 0.22 },
    { x: w * 0.58, w: w * 0.22 },
  ];

  panels.forEach((panel) => {
    const tmp = document.createElement('canvas');
    tmp.width = Math.round(panel.w);
    tmp.height = h;
    const tctx = tmp.getContext('2d')!;
    drawCover(tctx, storyImg, STORY_CENTER_FOREARM, 0, 0, tmp.width, h);
    extractTattooInk(tctx, 0, 0, tmp.width, h, 1.1);
    ctx.globalAlpha = 0.75;
    ctx.drawImage(tmp, panel.x, 0);
  });
  ctx.globalAlpha = 1;
}

export async function buildReferenceTattooTexture(
  phase: number,
  shading: ShadingMode,
  showGhost: boolean,
): Promise<THREE.CanvasTexture> {
  const key = `ref-${phase.toFixed(2)}-${shading}-${showGhost}`;
  if (cacheTexture && cacheKey === key) return cacheTexture;

  const { wrap, story } = await loadReferenceImages();

  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Wrap-around views from your placement board
  buildWrapStrip(ctx, wrap, canvas.width, canvas.height);
  extractTattooInk(ctx, 0, 0, canvas.width, canvas.height, 1.05);

  // Waves / compass / mountains detail on outer panels
  paintOuterDetail(ctx, story, canvas.width, canvas.height);

  // Phase-accurate inner forearm from “how it can grow”
  paintPhaseProgression(ctx, story, canvas.width, canvas.height, phase);

  // Reveal toward elbow as phases advance
  applyPhaseMask(ctx, canvas.width, canvas.height, phaseRevealV(phase));

  applyShadingToInk(ctx, canvas.width, canvas.height, shading);

  if (showGhost && phase >= 4.5) {
    const ghostAlpha = Math.min(0.22, (phase - 4.5) * 0.3);
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = Math.round(canvas.height * 0.1);
    const gctx = tmp.getContext('2d')!;
    drawCover(gctx, story, STORY_CENTER_FOREARM, 0, 0, tmp.width, tmp.height);
    extractTattooInk(gctx, 0, 0, tmp.width, tmp.height, 0.5);
    ctx.globalAlpha = ghostAlpha;
    ctx.drawImage(tmp, 0, 0);
    ctx.globalAlpha = 1;
  }

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
