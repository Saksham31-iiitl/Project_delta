import { cn } from "@utils/cn.js";

const TYPES = [
  { id: "", label: "All types" },
  { id: "room", label: "Room" },
  { id: "floor", label: "Floor" },
  { id: "home", label: "Home" },
];

export function FilterBar({ type, onTypeChange, className }) {
  return (
    <div
      className={cn(
        "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {TYPES.map((t) => {
        const active = type === t.id;
        return (
          <button
            key={t.id || "all"}
            type="button"
            onClick={() => onTypeChange(t.id)}
            className={cn(
              "shrink-0 snap-start rounded-full border px-[14px] py-1.5 text-[13px] transition-colors",
              active
                ? "border-brand-500 bg-brand-50 font-medium text-brand-800"
                : "border-stone-200 bg-white font-normal text-stone-600"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
