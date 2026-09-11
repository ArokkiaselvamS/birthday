import { useSceneIndex } from "../../hooks/useScrollProgress";

export function ProgressIndicator() {
  const sceneIndex = useSceneIndex();
  return (
    <div className="pointer-events-none fixed left-7 top-7 z-10 font-display text-[11px] tracking-[0.28em] text-ink/30">
      0{sceneIndex + 1} / 03
    </div>
  );
}
