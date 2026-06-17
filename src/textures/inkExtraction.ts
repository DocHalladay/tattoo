/**
 * Converts reference photo pixels into tattoo ink on transparent background.
 *
 * Key discriminator: tattoo ink is NEUTRAL (low chroma, low warmth).
 * Skin is WARM (r >> b) and has higher chroma.
 * We preserve solid lines (lum < 80) AND the gray-wash shading (lum 80–155)
 * that gives this style its depth — previously the wash was being cut off at 115.
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
    const warmth = r - b;                                   // +ve = warm skin, ≈0 = neutral ink
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);  // colorfulness

    // Pure black infographic / studio background panel
    const isInfographicBlack = lum < 22;

    // Warm skin tone: medium brightness, distinctly warm, has chroma
    const isSkin =
      lum > 85 &&
      warmth > 18 &&
      r >= g * 0.82 &&
      chroma > 12;

    // Parchment / paper / text panel background on story board
    const isPaper = lum > 180 && chroma < 30 && warmth > -8;

    // Pure highlight / near-white
    const isHighlight = lum > 215;

    if (isInfographicBlack || isSkin || isPaper || isHighlight) {
      d[i + 3] = 0;
      continue;
    }

    // Only keep NEUTRAL pixels (low warmth + low chroma).
    // This catches dark-warm skin that bleeds through the skin filter above.
    const isNeutral = warmth < 22 && chroma < 50;
    if (!isNeutral) {
      d[i + 3] = 0;
      continue;
    }

    // ── Tattoo ink classification ──────────────────────────────────────────
    let ink = 0;

    if (lum < 55) {
      // Solid black lines — full opacity
      ink = 255;
    } else if (lum < 90) {
      // Dark ink / heavy line edges
      ink = Math.round(255 - (lum - 55) * (255 / 35) * 0.35);  // 255 → ~147
    } else if (lum < 140) {
      // Gray wash — shading that gives this style depth
      // Previously cut off at lum 115; now extended to 140 for richer washes
      ink = Math.round(150 * (1 - (lum - 90) / 50));           // 150 → 0
    } else if (lum < 160) {
      // Very light wash / feathered edges
      ink = Math.round(40 * (1 - (lum - 140) / 20));
    } else {
      ink = 0;
    }

    ink = Math.round(ink * strength);
    if (ink < 10) {
      d[i + 3] = 0;
      continue;
    }

    // Near-black ink colour with faint warm hint for realism
    d[i]     = 12;
    d[i + 1] = 10;
    d[i + 2] = 9;
    d[i + 3] = Math.min(255, ink);
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
