import { REFERENCE_PATHS } from './referenceCrops';

let loadPromise: Promise<{ wrap: HTMLImageElement; story: HTMLImageElement }> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/** SWAP: Change paths in referenceCrops.ts REFERENCE_PATHS */
export function loadReferenceImages(): Promise<{
  wrap: HTMLImageElement;
  story: HTMLImageElement;
}> {
  if (!loadPromise) {
    loadPromise = Promise.all([
      loadImage(REFERENCE_PATHS.wrap),
      loadImage(REFERENCE_PATHS.story),
    ]).then(([wrap, story]) => ({ wrap, story }));
  }
  return loadPromise;
}
