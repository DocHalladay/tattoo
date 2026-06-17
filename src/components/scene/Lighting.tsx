import { Environment } from '@react-three/drei';

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.25} color="#1a1510" />
      <spotLight
        position={[2, 4, 3]}
        angle={0.45}
        penumbra={0.6}
        intensity={80}
        color="#ffd4a8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2, 2, -2]} intensity={12} color="#a8c4ff" />
      <directionalLight position={[0, 3, -1]} intensity={0.3} color="#ffe8d0" />
      <Environment preset="studio" environmentIntensity={0.35} />
    </>
  );
}
