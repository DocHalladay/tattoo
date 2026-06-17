import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { ShadingMode } from '../store/AppContext';
import { buildReferenceTattooTexture } from '../textures/referenceTattooCompositor';
import { generateTattooTexture } from '../textures/tattooTextureGenerator';

export function useTattooTexture(shading: ShadingMode) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    buildReferenceTattooTexture(shading)
      .then((tex) => {
        if (!cancelled) {
          setTexture(tex);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = generateTattooTexture(shading);
          setTexture(fallback);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shading]);

  return { texture, ready };
}
