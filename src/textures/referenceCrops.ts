/**
 * SWAP: Tune crop rectangles if you replace reference images.
 * Coordinates are in pixels for 682×1024 source boards.
 */

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** sleeve-wrap-board.png — middle row, 5 rotation views around the arm */
export const WRAP_ROTATION_VIEWS: CropRect[] = [
  { x: 18, y: 318, w: 118, h: 268 },
  { x: 142, y: 318, w: 118, h: 268 },
  { x: 266, y: 318, w: 118, h: 268 },
  { x: 390, y: 318, w: 118, h: 268 },
  { x: 514, y: 318, w: 118, h: 268 },
];

/** sleeve-wrap-board.png — bottom horizontal “how it starts” forearm */
export const WRAP_HORIZONTAL_FOREARM: CropRect = {
  x: 36,
  y: 718,
  w: 610,
  h: 195,
};

/** sleeve-story-board.png — large center forearm (complete sleeve) */
export const STORY_CENTER_FOREARM: CropRect = {
  x: 168,
  y: 168,
  w: 346,
  h: 640,
};

/** sleeve-story-board.png — “how it can grow” phase strip (5 arms) */
export const STORY_PHASE_ARMS: CropRect[] = [
  { x: 278, y: 848, w: 68, h: 148 },
  { x: 352, y: 848, w: 68, h: 148 },
  { x: 426, y: 848, w: 68, h: 148 },
  { x: 500, y: 848, w: 68, h: 148 },
  { x: 574, y: 848, w: 68, h: 148 },
];

export const REFERENCE_PATHS = {
  wrap: '/reference/sleeve-wrap-board.png',
  story: '/reference/sleeve-story-board.png',
} as const;
