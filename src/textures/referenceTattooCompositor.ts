/**
 * Builds the tattoo texture from the two reference board images.
 *
 * Strategy
 * ────────
 * The UV map wraps U=0→1 around the cylinder (U=0 = front face toward camera).
 * We compose two layers:
 *
 * Layer A — Rotation strip (base, full 360°)
 *   Five arm photos from the wrap board "WHAT IT LOOKS LIKE WRAPPED AROUND"
 *   section, each representing ~72° of the circumference. They are stitched in
 *   angular order: inner(palm) → inner-mid → outer-mid → outer → outer-side.
 *   To put the outer/most-tattooed face at U≈0 (default camera view) the strip
 *   is offset: we start painting from view[2] (outer-mid) at U=0.
 *
 * Layer B — Story-board center arm (detail overlay, outer ~70%)
 *   The large single-arm photo from the story board is the highest-quality
 *   source. It covers U=0.15→0.85 (the main visible face) at high opacity,
 *   adding fine linework and gray wash that the rotation strip alone can't give.
 *
 * Phase mask reveals ink from wrist upward as the phase slider increases.
 *
 * SWAP: adjust crops in referenceCrops.ts.
 */

import * as THREE from 'three';
import type { ShadingMode } from '../store/AppContext';
import { TEXTURE_WIDTH, TEXTURE_HEIGHT } from './tattooElements';
import {
  WRAP_TOP_VIEWS,
  STORY_CENTER_FOREARM,
} from './referenceCrops';
import { extractTattooInk, applyShadingToInk } from './inkExtraction';
import { loadReferenceImages } from './referenceTattooLoader';

// UV V goes to 1.15 to leave room for the ghost upper-arm preview
const UV_V_MAX = 1.15;
const CANVAS_W = TEXTURE_WIDTH;
const CANVAS_H = Math.round(TEXTURE_HEIGHT * UV_V_MAX);

// ── Cache ──────────────────────────────────────────────────────────────────
let cacheKey = '';
let cacheTexture: THREE.CanvasTexture | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────

// ── Layer A: Rotation strip ────────────────────────────────────────────────

/**
 * Paint the five rotation-angle arm views across the full texture width.
 *
 * Paint order starts at view[2] (outer-mid, most-tattooed face) so it maps to
 * U=0 — the face that greets the user with the default camera position.
 * Order: 2 → 3 → 4 → 0 → 1 (wraps seamlessly).
 *
 * Uses WRAP_TOP_VIEWS (314px tall, "A SLEEVE THAT TELLS YOUR STORY" section)
 * which are higher quality than the smaller rotation strip views (248px tall).
 *
 * Each arm photo is oriented wrist=bottom / elbow=top in the reference image.
 * We need wrist at canvas TOP (V=0), so we flip each slice vertically.
 */
function paintRotationStrip(
  ctx: CanvasRenderingContext2D,
  wrapImg: HTMLImageElement,
  totalW: number,
  totalH: number,
) {
  const paintOrder = [2, 3, 4, 0, 1];
  const n   = paintOrder.length;
  const sliceW = totalW / n;

  paintOrder.forEach((viewIdx, paintSlot) => {
    const crop = WRAP_TOP_VIEWS[viewIdx];
    const dx = Math.round(paintSlot * sliceW);
    const dw = Math.round((paintSlot + 1) * sliceW) - dx;

    const tmp = document.createElement('canvas');
    tmp.width  = dw;
    tmp.height = totalH;
    const tctx = tmp.getContext('2d')!;

    // Flip vertically so wrist(bottom of photo) → top of canvas
    tctx.save();
    tctx.translate(0, totalH);
    tctx.scale(1, -1);
    tctx.drawImage(wrapImg, crop.x, crop.y, crop.w, crop.h, 0, 0, dw, totalH);
    tctx.restore();

    extractTattooInk(tctx, 0, 0, dw, totalH, 0.90);
    ctx.drawImage(tmp, dx, 0);
  });
}

// ── Layer B: Story center arm overlay ─────────────────────────────────────

/**
 * The story board center arm is the highest-quality single source image.
 * It is painted at U=0.15→0.85 (outer face) with high opacity.
 *
 * The photo has birds/mountains at TOP, "BE HERE" at BOTTOM.
 * We flip it vertically so "BE HERE" maps to canvas TOP (wrist / V=0).
 */
function paintStoryCenterArm(
  ctx: CanvasRenderingContext2D,
  storyImg: HTMLImageElement,
  totalW: number,
  totalH: number,
  opacity: number,
) {
  const crop   = STORY_CENTER_FOREARM;
  const uStart = 0.15;
  const uEnd   = 0.85;
  const dx = Math.round(uStart * totalW);
  const dw = Math.round((uEnd - uStart) * totalW);

  const tmp = document.createElement('canvas');
  tmp.width  = dw;
  tmp.height = totalH;
  const tctx = tmp.getContext('2d')!;

  // Flip vertically
  tctx.save();
  tctx.translate(0, totalH);
  tctx.scale(1, -1);
  tctx.drawImage(storyImg, crop.x, crop.y, crop.w, crop.h, 0, 0, dw, totalH);
  tctx.restore();

  extractTattooInk(tctx, 0, 0, dw, totalH, 1.0);

  ctx.globalAlpha = opacity;
  ctx.drawImage(tmp, dx, 0);
  ctx.globalAlpha = 1;
}

// ── Main export ────────────────────────────────────────────────────────────

export async function buildReferenceTattooTexture(
  shading: ShadingMode,
): Promise<THREE.CanvasTexture> {
  const key = `ref-v6-full-${shading}`;
  if (cacheTexture && cacheKey === key) return cacheTexture;

  const { wrap, story } = await loadReferenceImages();

  const canvas = document.createElement('canvas');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Layer A — rotation strip (base, full 360° coverage)
  paintRotationStrip(ctx, wrap, CANVAS_W, CANVAS_H);

  // Layer B — story-board center arm (high-detail overlay, outer face)
  paintStoryCenterArm(ctx, story, CANVAS_W, CANVAS_H, 0.88);

  // Shading mode
  applyShadingToInk(ctx, CANVAS_W, CANVAS_H, shading);

  // ── Build Three.js texture ─────────────────────────────────────────────
  if (cacheTexture) cacheTexture.dispose();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace  = THREE.SRGBColorSpace;
  texture.flipY       = false;
  texture.wrapS       = THREE.ClampToEdgeWrapping;
  texture.wrapT       = THREE.ClampToEdgeWrapping;
  texture.anisotropy  = 16;
  texture.needsUpdate = true;

  cacheKey     = key;
  cacheTexture = texture;
  return texture;
}
