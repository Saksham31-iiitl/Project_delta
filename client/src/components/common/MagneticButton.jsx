import { motion } from "motion/react";
import { useMagnetic } from "@hooks/useMagnetic.js";

/* Drop-in wrapper that adds magnetic pull to any button / link.
   Usage: <MagneticButton className="rounded-full bg-brand-800 ...">…</MagneticButton>
*/
export function MagneticButton({ children, className = "", as: Tag = "button", strength = 0.38, ...props }) {
  const { ref, sx, sy, onMove, onLeave } = useMagnetic(strength);

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <Tag className={className} {...props}>
        {children}
      </Tag>
    </motion.div>
  );
}
