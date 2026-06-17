/**
 * SWAP: Tune crop rectangles if you replace reference images.
 * Coordinates are in pixels for 682×1024 source boards.
 *
 * Crops were measured by pixel-scanning the actual images for warm-skin
 * pixels. Old crops were wrong (pointing at dark infographic panels).
 */

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * sleeve-wrap-board.png — “WHAT IT LOOKS LIKE WRAPPED AROUND” middle section.
 * Five rotation-angle views of the arm, y=438-686.
 * Order: inner (palm) → inner-mid → outer-mid → outer → outer-side.
 * These span ~360° of the cylindrical wrap when stitched in this order.
 */
export const WRAP_ROTATION_VIEWS: CropRect[] = [
  { x: 156, y: 438, w: 80, h: 248 }, // inner forearm / palm side
  { x: 269, y: 438, w: 60, h: 248 }, // inner-mid
  { x: 372, y: 438, w: 66, h: 248 }, // outer-mid (waves + compass)
  { x: 479, y: 438, w: 72, h: 248 }, // outer forearm (mountains)
  { x: 575, y: 438, w: 79, h: 248 }, // outer-side (birds + upper)
];

/**
 * sleeve-wrap-board.png — top section “A SLEEVE THAT TELLS YOUR STORY”.
 * Five orientation views (y=56–370, h=314), higher-res than rotation strip.
 * Same angular order as WRAP_ROTATION_VIEWS.
 */
export const WRAP_TOP_VIEWS: CropRect[] = [
  { x: 151, y: 56, w: 69, h: 314 },  // inner forearm
  { x: 239, y: 56, w: 76, h: 314 },  // inner-mid
  { x: 331, y: 56, w: 91, h: 314 },  // outer-mid
  { x: 430, y: 56, w: 95, h: 314 },  // outer forearm
  { x: 596, y: 56, w: 55, h: 314 },  // outer-side / upper
];

/**
 * sleeve-story-board.png — large center forearm photo (complete sleeve).
 * Pixel-verified bounds: x=155-639, y=100-809. Shows the full outer sleeve
 * design: birds → mountains → waves/compass → flowers → “BE HERE” wrist text.
 */
export const STORY_CENTER_FOREARM: CropRect = {
  x: 155,
  y: 100,
  w: 484,
  h: 709,
};

export const REFERENCE_PATHS = {
  wrap: '/reference/sleeve-wrap-board.png',
  story: '/reference/sleeve-story-board.png',
} as const;
