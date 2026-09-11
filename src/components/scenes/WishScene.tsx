import { useFrame } from "@react-three/fiber";
import { Particles } from "../three/Particles";

export function WishScene() {
  // Cake and candles removed — replaced by VideoOverlay in App.tsx
  useFrame(() => {
    // No cake/candle logic needed; video overlay handles the visual.
  });

  return (
    <group>
      <Particles count={300} spread={[10, 6, 10]} opacity={0.35} driftSpeed={0.0004} />
    </group>
  );
}
