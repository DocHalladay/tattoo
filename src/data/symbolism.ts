/**
 * SWAP: Edit symbolism legend copy here.
 * Each id should match label anchor points in LabelMarkers.tsx.
 */

export interface SymbolismEntry {
  id: string;
  title: string;
  meaning: string;
}

export const symbolism: SymbolismEntry[] = [
  {
    id: 'anchor',
    title: 'Anchor',
    meaning: 'Be here. Right now. A daily reminder to stay present — not lost in what might happen.',
  },
  {
    id: 'family',
    title: 'Family',
    meaning: 'September aster, April daisy, May lily of the valley. The reason you stay grounded.',
  },
  {
    id: 'struggle',
    title: 'Struggle',
    meaning: "Life's waves — anxiety, pressure, uncertainty. They move around you; they don't define you.",
  },
  {
    id: 'direction',
    title: 'Direction',
    meaning: 'Stay aligned with your values. M, E, W, D — the people and principles that matter.',
  },
  {
    id: 'perspective',
    title: 'Perspective',
    meaning: 'Zoom out. Storms pass. Keep climbing until the view clears.',
  },
  {
    id: 'legacy',
    title: 'Legacy',
    meaning: 'Trust the process. Prepare, don\'t worry. Let them fly.',
  },
];
