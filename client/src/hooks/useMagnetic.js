import { useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

const SPRING = { stiffness: 220, damping: 22 };
const RADIUS = 60;

export function useMagnetic(strength = 0.38) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.hypot(dx, dy) < RADIUS) {
      x.set(dx * strength);
      y.set(dy * strength);
    }
  };

  const onLeave = () => { x.set(0); y.set(0); };

  return { ref, sx, sy, onMove, onLeave };
}
