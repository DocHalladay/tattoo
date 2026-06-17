/**
 * Converts reference photo pixels into tattoo ink on transparent background.
 *
 * Simple two-factor approach:
 *   1. Darkness:   darker pixels = more likely to be ink
 *   2. Neutrality: warm pixels (r >> b) are skin, not ink
 *
 * Thresholds validated against actual pixel values in the reference images:
 *   - Dark ink lines:  lum ≈ 15–50,  warmth ≈ 8
 *   - Gray wash:       lum ≈ 60–100, warmth ≈ 15
 *   - Skin midtones:   lum ≈ 90–130, warmth ≈ 45–65  → excluded by warmth > 32
 *   - Studio bg black: lum < 15                       → excluded by lum floor
 */
export function extractTattooInk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  strength = 1,
) {
  const imageData = ctx.getImageData(x, y, w, h);
  const d = imageData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    const lum    = 0.299 * r + 0.587 * g + 0.114 * b;
    const warmth = r - b;  // > 0 = warm (skin), ≈ 0 = neutral (ink)

    // Pure studio background black — transparent
    if (lum < 15) { d[i + 3] = 0; continue; }

    // Bright pixels — skin highlights or paper — transparent
    if (lum > 130) { d[i + 3] = 0; continue; }

    // Warm pixels — skin — transparent
    if (warmth > 32) { d[i + 3] = 0; continue; }

    // Remaining pixels: scale alpha by darkness.
    // lum=15 → alpha≈255 (solid ink), lum=130 → alpha=0 (boundary)
    const alpha = Math.round(((130 - lum) / 115) * 255 * strength);

    if (alpha < 8) { d[i + 3] = 0; continue; }

    // Near-black ink color with subtle warm hint for realism
    d[i]     = 12;
    d[i + 1] = 10;
    d[i + 2] = 9;
    d[i + 3] = Math.min(255, alpha);
  }

  ctx.putImageData(imageData, x, y);
}

export function applyShadingToInk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mode: 'light' | 'heavy',
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const mult = mode === 'heavy' ? 1.45 : 0.82;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 0) {
      d[i + 3] = Math.min(255, Math.round(d[i + 3] * mult));
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
