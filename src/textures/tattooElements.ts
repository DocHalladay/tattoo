/**
 * SWAP POINTS — Tattoo element drawing
 * -----------------------------------
 * - ANCHOR_PHRASE: wrist text
 * - FAMILY_INITIALS: compass initials (M, E, W, D)
 * - BIRTH_FLOWERS: month/name pairs — replace draw functions with ctx.drawImage(svg, ...)
 * - Each draw* function can be swapped for imported SVG/PNG art
 */

import type { ShadingMode } from '../store/AppContext';

export const ANCHOR_PHRASE = 'BE HERE.';
export const FAMILY_INITIALS = ['M', 'E', 'W', 'D'];

export const BIRTH_FLOWERS = [
  { month: 'September', name: 'Aster', draw: drawAster },
  { month: 'April', name: 'Daisy', draw: drawDaisy },
  { month: 'May', name: 'Lily of the Valley', draw: drawLily },
] as const;

export const TEXTURE_WIDTH = 2048;
export const TEXTURE_HEIGHT = 4096;

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  phase: number;
  shading: ShadingMode;
  opacity: number;
}

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/** Fade in when phase reaches `atPhase` (e.g. compass at phase 3) */
export function fadeInAt(phase: number, atPhase: number): number {
  return smoothstep(phase - atPhase + 1);
}

/** Wave intensity: light at phase 1, stronger from phase 2 */
export function waveIntensity(phase: number): number {
  if (phase < 1) return 0;
  if (phase < 2) return 0.35 + 0.25 * (phase - 1);
  return 0.6 + 0.4 * Math.min(1, (phase - 2) * 0.5 + 0.5);
}

function inkAlpha(shading: ShadingMode, base: number): number {
  return shading === 'heavy' ? Math.min(1, base * 1.4) : base * 0.95;
}

function setInkStyle(ctx: CanvasRenderingContext2D, shading: ShadingMode, alpha: number) {
  ctx.strokeStyle = `rgba(8, 6, 5, ${inkAlpha(shading, alpha)})`;
  ctx.fillStyle = `rgba(8, 6, 5, ${inkAlpha(shading, alpha * 0.9)})`;
  ctx.lineWidth = shading === 'heavy' ? 3.5 : 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

const UV_V_MAX = 1.15;

/** Map arm UV to canvas pixels (v=0 wrist, v=1 elbow; matches Three.js after flipY=false) */
export function uv(
  u: number,
  v: number,
  canvasHeight = TEXTURE_HEIGHT * UV_V_MAX,
): [number, number] {
  return [u * TEXTURE_WIDTH, (1 - v / UV_V_MAX) * canvasHeight];
}

export function drawAnchor({ ctx, phase, shading, opacity }: DrawContext) {
  if (phase < 1 || opacity <= 0) return;
  // u≈0 is inner (palm) side of left forearm
  const [x, y] = uv(0.02, 0.06);
  setInkStyle(ctx, shading, opacity);
  ctx.font = `${shading === 'heavy' ? 88 : 72}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(ANCHOR_PHRASE, x, y);

  // Small star below text
  ctx.beginPath();
  const [sx, sy] = uv(0.02, 0.085);
  const r = 8;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const px = sx + Math.cos(a) * r;
    const py = sy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

export function drawFlowers({ ctx, phase, shading, opacity }: DrawContext) {
  if (phase < 1 || opacity <= 0) return;
  const stems = [
    { u: 0.03, vBase: 0.1, vTop: 0.32 },
    { u: 0.06, vBase: 0.12, vTop: 0.38 },
    { u: 0.09, vBase: 0.11, vTop: 0.35 },
  ];

  stems.forEach((stem, i) => {
    const [bx, by] = uv(stem.u, stem.vBase);
    const [tx, ty] = uv(stem.u, stem.vTop);
    setInkStyle(ctx, shading, opacity * 0.9);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    const cpx = bx + (i - 1) * 30;
    ctx.quadraticCurveTo(cpx, (by + ty) / 2, tx, ty);
    ctx.stroke();

    BIRTH_FLOWERS[i].draw(ctx, tx, ty, shading, opacity);
  });
}

function drawAster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shading: ShadingMode,
  opacity: number,
) {
  setInkStyle(ctx, shading, opacity);
  const petals = 12;
  const pr = 22;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * pr, y + Math.sin(a) * pr);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawDaisy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shading: ShadingMode,
  opacity: number,
) {
  setInkStyle(ctx, shading, opacity);
  const petals = 10;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(a) * 12,
      y + Math.sin(a) * 12,
      8,
      16,
      a,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawLily(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shading: ShadingMode,
  opacity: number,
) {
  setInkStyle(ctx, shading, opacity);
  const bells = [
    { dx: -10, dy: 0 },
    { dx: 0, dy: -4 },
    { dx: 10, dy: 0 },
  ];
  bells.forEach((b) => {
    ctx.beginPath();
    ctx.moveTo(x + b.dx, y + b.dy - 8);
    ctx.quadraticCurveTo(x + b.dx - 8, y + b.dy + 10, x + b.dx, y + b.dy + 18);
    ctx.quadraticCurveTo(x + b.dx + 8, y + b.dy + 10, x + b.dx, y + b.dy - 8);
    ctx.stroke();
  });
}

export function drawWaves({ ctx, phase, shading, opacity }: DrawContext) {
  const intensity = waveIntensity(phase) * opacity;
  if (intensity <= 0) return;

  setInkStyle(ctx, shading, intensity);

  const waveBands = phase < 2 ? 3 : 6;
  for (let band = 0; band < waveBands; band++) {
    const vStart = 0.22 + band * 0.04;
    const uStart = 0.12 + band * 0.04;
    const uEnd = 0.62 - band * 0.02;
    const amplitude = (phase < 2 ? 18 : 35) + band * 5;

    ctx.beginPath();
    const [x0, y0] = uv(uStart, vStart);
    ctx.moveTo(x0, y0);
    const steps = 24;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const u = uStart + (uEnd - uStart) * t;
      const v = vStart + Math.sin(t * Math.PI * 3 + band) * 0.02;
      const [px, py] = uv(u, v);
      const waveY = py + Math.sin(t * Math.PI * 4 + band * 0.8) * amplitude;
      ctx.lineTo(px, waveY);
    }
    ctx.stroke();

    if (phase >= 2) {
      // Foam crests
      for (let f = 0; f < 5; f++) {
        const t = 0.15 + f * 0.17;
        const u = uStart + (uEnd - uStart) * t;
        const [fx, fy] = uv(u, vStart);
        const wy = fy + Math.sin(t * Math.PI * 4) * amplitude;
        ctx.beginPath();
        ctx.arc(fx, wy - 5, 4 + band, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  if (shading === 'heavy') {
    // Stipple shading in wave troughs
    ctx.fillStyle = `rgba(18, 14, 12, ${inkAlpha(shading, intensity * 0.25)})`;
    for (let i = 0; i < 80; i++) {
      const u = 0.5 + Math.random() * 0.25;
      const v = 0.25 + Math.random() * 0.2;
      const [px, py] = uv(u, v);
      ctx.fillRect(px, py, 1.5, 1.5);
    }
  }
}

export function drawCompass({ ctx, phase, shading, opacity }: DrawContext) {
  const o = fadeInAt(phase, 3) * opacity;
  if (o <= 0) return;

  const [cx, cy] = uv(0.5, 0.4);
  const r = 90;
  setInkStyle(ctx, shading, o);

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Cardinal points
  const cardinals = ['N', 'E', 'S', 'W'];
  ctx.font = `500 ${shading === 'heavy' ? 22 : 18}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  cardinals.forEach((label, i) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const lx = cx + Math.cos(a) * (r + 18);
    const ly = cy + Math.sin(a) * (r + 18);
    ctx.fillText(label, lx, ly);
  });

  // Star points
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const inner = i % 2 === 0 ? r * 0.35 : r * 0.65;
    const px = cx + Math.cos(a) * inner;
    const py = cy + Math.sin(a) * inner;
    if (i === 0) ctx.beginPath();
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
    if (i === 7) {
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Family initials around compass
  // SWAP: FAMILY_INITIALS array
  FAMILY_INITIALS.forEach((initial, i) => {
    const a = (i / FAMILY_INITIALS.length) * Math.PI * 2 + Math.PI / 4;
    const lx = cx + Math.cos(a) * (r * 0.85);
    const ly = cy + Math.sin(a) * (r * 0.85);
    ctx.font = `italic ${shading === 'heavy' ? 16 : 13}px Georgia, serif`;
    ctx.fillText(initial, lx, ly);
  });
}

export function drawMountains({ ctx, phase, shading, opacity }: DrawContext) {
  const o = fadeInAt(phase, 4) * opacity;
  if (o <= 0) return;

  setInkStyle(ctx, shading, o);
  const peaks = [
    { u: 0.55, v: 0.72, h: 0.12 },
    { u: 0.62, v: 0.68, h: 0.16 },
    { u: 0.7, v: 0.7, h: 0.13 },
    { u: 0.76, v: 0.74, h: 0.09 },
  ];

  peaks.forEach((peak) => {
    const [bx, by] = uv(peak.u - 0.06, peak.v + 0.04);
    const [tx, ty] = uv(peak.u, peak.v - peak.h);
    const [bx2, by2] = uv(peak.u + 0.06, peak.v + 0.04);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tx, ty);
    ctx.lineTo(bx2, by2);
    ctx.stroke();

    // Ridge lines
    if (shading === 'heavy') {
      ctx.globalAlpha = o * 0.4;
      const [mx, my] = uv(peak.u, peak.v - peak.h * 0.5);
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });

  // Pine trees at base
  const trees = [0.56, 0.6, 0.65, 0.69, 0.73];
  trees.forEach((u) => {
    const [tx, ty] = uv(u, 0.76);
    drawPine(ctx, tx, ty, shading, o);
  });

  // Mist
  ctx.strokeStyle = `rgba(120, 110, 100, ${inkAlpha(shading, o * 0.3)})`;
  ctx.lineWidth = 1;
  for (let m = 0; m < 4; m++) {
    const [mx, my] = uv(0.52 + m * 0.06, 0.62 + m * 0.02);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.bezierCurveTo(mx + 40, my - 10, mx + 80, my + 10, mx + 120, my);
    ctx.stroke();
  }
}

function drawPine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shading: ShadingMode,
  opacity: number,
) {
  setInkStyle(ctx, shading, opacity * 0.85);
  const h = 35;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - h);
  ctx.stroke();
  for (let l = 0; l < 3; l++) {
    const ly = y - h * 0.35 - l * (h * 0.22);
    const w = 14 - l * 3;
    ctx.beginPath();
    ctx.moveTo(x - w, ly);
    ctx.lineTo(x, ly - 12);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }
}

export function drawBirds({ ctx, phase, shading, opacity }: DrawContext) {
  const o = fadeInAt(phase, 5) * opacity;
  if (o <= 0) return;

  setInkStyle(ctx, shading, o);
  const birds = [
    { u: 0.58, v: 0.86, s: 1 },
    { u: 0.62, v: 0.84, s: 0.8 },
    { u: 0.66, v: 0.87, s: 0.9 },
    { u: 0.7, v: 0.83, s: 0.7 },
    { u: 0.74, v: 0.85, s: 0.85 },
    { u: 0.68, v: 0.8, s: 0.6 },
    { u: 0.72, v: 0.81, s: 0.55 },
  ];

  birds.forEach((bird) => {
    const [bx, by] = uv(bird.u, bird.v);
    const w = 18 * bird.s;
    ctx.beginPath();
    ctx.moveTo(bx - w, by);
    ctx.quadraticCurveTo(bx - w * 0.3, by - w * 0.6, bx, by - w * 0.2);
    ctx.quadraticCurveTo(bx + w * 0.3, by - w * 0.6, bx + w, by);
    ctx.stroke();
  });
}

/** Ghost horizon for upper arm preview — drawn in v > 1 region on extended texture */
export function drawGhostHorizon(
  ctx: CanvasRenderingContext2D,
  shading: ShadingMode,
  opacity: number,
  canvasHeight = TEXTURE_HEIGHT * 1.15,
) {
  if (opacity <= 0) return;
  const ghostAlpha = opacity * 0.2;
  setInkStyle(ctx, shading, ghostAlpha);

  // Horizon line across upper arm
  const [x0, y0] = uv(0.1, 1.05, canvasHeight);
  const [x1] = uv(0.9, 1.05, canvasHeight);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y0);
  ctx.stroke();

  // Sunrise arc
  const [sx, sy] = uv(0.5, 1.08, canvasHeight);
  ctx.beginPath();
  ctx.arc(sx, sy, 60, Math.PI, 0);
  ctx.stroke();

  // Stars
  ctx.fillStyle = `rgba(18, 14, 12, ${ghostAlpha})`;
  for (let i = 0; i < 12; i++) {
    const u = 0.15 + (i % 4) * 0.2;
    const v = 1.02 + Math.floor(i / 4) * 0.04;
    const [px, py] = uv(u, v, canvasHeight);
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cloud wisps
  ctx.strokeStyle = `rgba(120, 110, 100, ${ghostAlpha * 0.8})`;
  for (let c = 0; c < 3; c++) {
    const [mx, my] = uv(0.2 + c * 0.25, 1.03, canvasHeight);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.bezierCurveTo(mx + 30, my - 8, mx + 60, my + 5, mx + 90, my);
    ctx.stroke();
  }
}
