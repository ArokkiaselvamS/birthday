import { useEffect, useRef } from "react";

export interface NormalizedPointer {
  x: number;
  y: number;
}

/**
 * Tracks normalized (-1 to 1) mouse position in a ref for cheap,
 * re-render-free parallax reads inside useFrame. Disabled on touch
 * devices and when reduced motion is requested.
 */
export function useMousePosition(enabled: boolean): React.RefObject<NormalizedPointer> {
  const target = useRef<NormalizedPointer>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled]);

  return target;
}
