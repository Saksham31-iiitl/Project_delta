import { useInView } from "motion/react";
import { motion } from "motion/react";
import { useRef } from "react";

/* Splits children (string) into words and staggers each word in on scroll.
   Works with className forwarding so it can replace any heading element.
   Example:  <ScrollReveal as="h1" className="font-display text-[72px]">Stay close to the celebration.</ScrollReveal>
*/
export function ScrollReveal({ children, as: Tag = "span", className = "", baseDelay = 0, stagger = 0.07, threshold = "-80px" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: threshold });

  const words = String(children).split(" ");

  return (
    <Tag ref={ref} className={className} aria-label={String(children)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: baseDelay + i * stagger, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
