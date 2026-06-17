/**
 * Converts reference photo pixels into tattoo ink on transparent background.
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
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const warmth = r - b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);

    // Warm skin tones from reference photos
    const isSkin =
      lum > 105 &&
      warmth > 8 &&
      r > g * 0.92 &&
      g > b * 0.85 &&
      chroma < 75;

    // Paper / background from infographic
    const isPaper = lum > 200 && chroma < 35;

    if (isSkin || isPaper || lum > 215) {
      d[i + 3] = 0;
      continue;
    }

    // Keep ink — dark linework and grey shading
    const ink = Math.min(255, Math.max(0, (175 - lum) * 3.2) * strength);
    if (ink < 8) {
      d[i + 3] = 0;
      continue;
    }

    d[i] = 12;
    d[i + 1] = 10;
    d[i + 2] = 9;
    d[i + 3] = ink;
  }

  ctx.putImageData(imageData, x, y);
}

export function applyShadingToInk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mode: 'light' | 'heavy',
) {
  if (mode === 'light') return;
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 0) {
      d[i + 3] = Math.min(255, d[i + 3] * 1.35);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
