/**
 * Converts reference photo pixels into tattoo ink on transparent background.
 * Rejects infographic black backgrounds and skin; keeps linework + light wash only.
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

    // Infographic / studio black background (wrap board is on black)
    const isBlackBg = lum < 48 || (r < 55 && g < 55 && b < 55 && chroma < 30);

    // Warm skin in reference photos
    const isSkin =
      lum > 92 &&
      warmth > 4 &&
      r >= g * 0.85 &&
      g >= b * 0.8 &&
      chroma < 85;

    // Beige parchment areas on story board
    const isPaper = lum > 185 && chroma < 45 && warmth > -5;

    // Highlights / empty space
    const isHighlight = lum > 210;

    if (isBlackBg || isSkin || isPaper || isHighlight) {
      d[i + 3] = 0;
      continue;
    }

    // Tattoo ink: dark lines + subtle grey wash only (not mid-tones)
    let ink = 0;
    if (lum < 75) {
      ink = Math.min(255, (80 - lum) * 4.5);
    } else if (lum < 115) {
      ink = Math.min(90, (115 - lum) * 2.2);
    }

    ink *= strength;
    if (ink < 12) {
      d[i + 3] = 0;
      continue;
    }

    d[i] = 14;
    d[i + 1] = 11;
    d[i + 2] = 10;
    d[i + 3] = Math.min(255, Math.round(ink));
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
  const mult = mode === 'heavy' ? 1.4 : 0.85;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 0) {
      d[i + 3] = Math.min(255, Math.round(d[i + 3] * mult));
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
