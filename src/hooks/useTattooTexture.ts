import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { ShadingMode } from '../store/AppContext';
import { buildReferenceTattooTexture } from '../textures/referenceTattooCompositor';
import { generateTattooTexture } from '../textures/tattooTextureGenerator';

export function useTattooTexture(
  phase: number,
  shading: ShadingMode,
  showGhost: boolean,
) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    buildReferenceTattooTexture(phase, shading, showGhost)
      .then((tex) => {
        if (!cancelled) {
          setTexture(tex);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = generateTattooTexture(phase, shading, showGhost);
          setTexture(fallback);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [phase, shading, showGhost]);

  return { texture, ready };
}
