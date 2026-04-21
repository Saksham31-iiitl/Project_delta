import { useEffect } from "react";

const THROTTLE_MS = 90;
const PETAL_STYLE = `
  position:fixed;
  border-radius:50% 50% 50% 0;
  background:radial-gradient(circle at 30% 30%,#f7c948,#f5a623 60%,#d4891a);
  pointer-events:none;
  z-index:9998;
  will-change:transform,opacity;
  transition:transform .65s cubic-bezier(.2,1,.3,1),opacity .65s ease;
`;

export function CursorTrail() {
  useEffect(() => {
    /* Only on devices with fine pointers (i.e. actual mice) */
    if (!window.matchMedia("(pointer:fine)").matches) return;

    let last = 0;

    const spawn = (cx, cy) => {
      const now = Date.now();
      if (now - last < THROTTLE_MS) return;
      last = now;

      const sz = 7 + Math.random() * 6;
      const el = document.createElement("div");
      el.style.cssText = PETAL_STYLE;
      el.style.width  = `${sz}px`;
      el.style.height = `${sz}px`;
      el.style.left   = `${cx - sz / 2}px`;
      el.style.top    = `${cy - sz / 2}px`;
      el.style.transform = `rotate(-45deg) scale(1)`;
      el.style.opacity   = "0.72";
      document.body.appendChild(el);

      const angle = 200 + Math.random() * 160;  // mostly upward
      const dist  = 18 + Math.random() * 18;
      const tx = Math.cos((angle * Math.PI) / 180) * dist;
      const ty = Math.sin((angle * Math.PI) / 180) * dist;

      requestAnimationFrame(() => {
        el.style.transform = `rotate(${-45 + angle * 0.15}deg) scale(0.1) translate(${tx}px,${ty}px)`;
        el.style.opacity   = "0";
      });

      setTimeout(() => el.remove(), 750);
    };

    /* Only fire on hero + dark panels tagged with data-trail */
    const onMove = (e) => spawn(e.clientX, e.clientY);

    const attach = () => {
      document.querySelectorAll("[data-trail]").forEach((z) =>
        z.addEventListener("mousemove", onMove)
      );
    };

    attach();
    /* Re-attach on DOM changes (lazy-loaded sections) */
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: false });

    return () => {
      obs.disconnect();
      document.querySelectorAll("[data-trail]").forEach((z) =>
        z.removeEventListener("mousemove", onMove)
      );
    };
  }, []);

  return null;
}
