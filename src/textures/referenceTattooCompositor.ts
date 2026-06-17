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
  WRAP_ROTATION_VIEWS,
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

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/** V threshold (in UV space) revealed at each phase level */
function phaseRevealV(phase: number): number {
  // Stops: wrist text → flowers → waves → mountains/compass → birds/full
  const stops = [0.28, 0.50, 0.67, 0.84, 1.02];
  const p = Math.min(5, Math.max(1, phase));
  const lo = Math.floor(p) - 1;
  const hi = Math.min(4, lo + 1);
  const t = p === Math.floor(p) ? 1 : smoothstep(p - Math.floor(p));
  return stops[lo] + (stops[hi] - stops[lo]) * t;
}

/**
 * With flipY=false:  UV V=0 → canvas y=0 (TOP), V=1 → canvas y=height (BOTTOM).
 * Forearm geometry:  V=0 at wrist, V=1 at elbow.
 * → Canvas TOP = wrist, canvas BOTTOM = elbow.
 *
 * The phase mask should hide elbow content (near top, low y) at early phases
 * and reveal it progressively. So at phase=1 we hide everything above (h - revealPx).
 */
function applyPhaseMask(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  revealV: number,
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  const revealFrac = revealV / UV_V_MAX;
  const revealPx   = Math.round(revealFrac * h);
  const fadeH      = Math.round(h * 0.04); // soft 4% fade edge
  // Rows with y < cutY are hidden (elbow/upper arm — not yet revealed)
  const cutY = h - revealPx;

  for (let y = 0; y < h; y++) {
    if (y >= cutY) continue; // below cutY = revealed
    const fade = y > cutY - fadeH ? (y - (cutY - fadeH)) / fadeH : 0;
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const i = (row + x) * 4;
      d[i + 3] = Math.round(d[i + 3] * fade);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Layer A: Rotation strip ────────────────────────────────────────────────

/**
 * Paint the five rotation-angle arm views across the full texture width.
 *
 * Paint order starts at view[2] (outer-mid, most-tattooed face) so it maps to
 * U=0 — the face that greets the user with the default camera position.
 * Order: 2 → 3 → 4 → 0 → 1 (wraps seamlessly).
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
    const crop = WRAP_ROTATION_VIEWS[viewIdx];
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
  phase: number,
  shading: ShadingMode,
  _showGhost: boolean,
): Promise<THREE.CanvasTexture> {
  const key = `ref-v5-${phase.toFixed(2)}-${shading}`;
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

  // Phase mask — reveal from wrist upward
  applyPhaseMask(ctx, CANVAS_W, CANVAS_H, phaseRevealV(phase));

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
