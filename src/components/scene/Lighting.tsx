import { Environment } from '@react-three/drei';

/**
 * Lighting tuned for tattoo visibility:
 * - Key light from upper-front-right: warm, soft, high-intensity → picks out ink detail
 * - Fill light from upper-left-back: cool, low → adds depth without washing out ink
 * - Rim light from below-back: warm → separates the arm from the dark background
 * - Environment: studio IBL → neutral sheen on skin
 */
export function Lighting() {
  return (
    <>
      {/* Soft dark ambient so shadows stay deep */}
      <ambientLight intensity={0.18} color="#1a1410" />

      {/* Key: upper-front-right, warm photography light */}
      <spotLight
        position={[1.8, 5, 3.2]}
        angle={0.40}
        penumbra={0.7}
        intensity={110}
        color="#ffe0b8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
      />

      {/* Fill: upper-left-back, cool — gives the arm dimension */}
      <pointLight position={[-2.5, 3.5, -2]} intensity={18} color="#aac0ff" />

      {/* Rim: low-back-right — separates arm silhouette */}
      <directionalLight
        position={[1.2, -0.5, -2.8]}
        intensity={0.55}
        color="#ffc890"
      />

      {/* Subtle top fill so the elbow area isn't lost in shadow */}
      <directionalLight position={[0, 4, 0]} intensity={0.20} color="#fff5e8" />

      {/* Studio IBL for realistic skin sheen */}
      <Environment preset="studio" environmentIntensity={0.40} />
    </>
  );
}
