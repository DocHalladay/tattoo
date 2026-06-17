/**
 * SWAP: Edit phase titles, descriptions, and meanings here.
 * Each phase maps to tattoo elements revealed in tattooElements.ts.
 */

export interface Phase {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  meaning: string;
}

export const phases: Phase[] = [
  {
    id: 1,
    title: 'Foundation',
    subtitle: 'The Anchor',
    description:
      'A complete wrapped forearm piece from day one — not a tiny symbol. "BE HERE." on the inner wrist, three birth flowers growing upward, and light wave lines beginning to wrap the side.',
    meaning: 'Be here. Right now. Family is the why.',
  },
  {
    id: 2,
    title: 'Outer Wrap',
    subtitle: 'The Struggle',
    description:
      'Stronger ocean waves wrap the outer forearm, flowing around the arm and connecting visually to the inner flowers. Life and anxiety move around the family anchor.',
    meaning: "You can't control the waves. You can control how you ride them.",
  },
  {
    id: 3,
    title: 'Direction',
    subtitle: 'The Compass',
    description:
      'A compass rose embedded naturally inside the waves on the outer-mid forearm — partially hidden, integrated, not pasted on. Initials mark what matters.',
    meaning: 'Stay aligned with your values. Keep choosing what matters.',
  },
  {
    id: 4,
    title: 'Perspective',
    subtitle: 'The Mountains',
    description:
      'Mountains and pine trees emerge from the wave flow near the upper forearm. Light mist and clouds suggest the bigger picture.',
    meaning: "The bigger picture. Clarity comes when you keep climbing.",
  },
  {
    id: 5,
    title: 'Legacy & Beyond',
    subtitle: 'The Horizon',
    description:
      'Birds fly upward near the elbow. An optional ghosted preview extends onto the upper arm — sky, horizon, clouds — showing how this becomes a full sleeve.',
    meaning: 'Trust the process. Let them fly.',
  },
];

export function getPhaseForValue(value: number): Phase {
  const index = Math.min(phases.length - 1, Math.max(0, Math.round(value) - 1));
  return phases[index];
}
