/* Ambient marigold petals that drift upward on dark panels.
   Rendered as an absolutely-positioned overlay — parent must be relative + overflow-hidden. */

const PETALS = [
  { sz: 9,  l: "8%",  b: "5%",  dur: "9s",  del: "0s"   },
  { sz: 12, l: "28%", b: "12%", dur: "12s", del: "-3.2s" },
  { sz: 7,  l: "55%", b: "4%",  dur: "8s",  del: "-6.5s" },
  { sz: 11, l: "76%", b: "8%",  dur: "11s", del: "-1.8s" },
];

export function FloatingMarigolds({ count = 4 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PETALS.slice(0, count).map((p, i) => (
        <div
          key={i}
          className="petal-float absolute"
          style={{
            width:  p.sz,
            height: p.sz,
            left:   p.l,
            bottom: p.b,
            "--petal-dur": p.dur,
            "--petal-del": p.del,
          }}
        />
      ))}
    </div>
  );
}
