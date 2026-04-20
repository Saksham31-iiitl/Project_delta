import { cn } from "@utils/cn.js";
import { SlidersHorizontal } from "lucide-react";

const TYPES = [
  { id: "",          label: "All" },
  { id: "room",      label: "Room" },
  { id: "floor",     label: "Floor" },
  { id: "home",      label: "Home" },
  { id: "suite",     label: "Suite" },
  { id: "farmhouse", label: "Farmhouse" },
];

const FILTER_CHIPS = [
  { id: "under4k",    label: "Under ₹4,000" },
  { id: "lawn",       label: "🌿 Lawn / Open space" },
  { id: "power",      label: "⚡ Power backup" },
  { id: "large",      label: "👥 50+ guests" },
  { id: "vegkitchen", label: "🥗 Veg kitchen" },
  { id: "womensafe",  label: "Women safe" },
  { id: "elder",      label: "Elder friendly" },
];

export function FilterBar({ type, onTypeChange, eventFilters, onEventFilterToggle, className }) {
  const activeFilters = eventFilters instanceof Set ? eventFilters : new Set();

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Type segmented control */}
      <div className="flex items-center gap-2 overflow-x-auto chip-scroll pb-0.5">
        <div className="inline-flex shrink-0 rounded-full border border-stone-200 bg-white p-1 text-[13px] shadow-sm">
          {TYPES.map((t) => {
            const active = type === t.id;
            return (
              <button
                key={t.id || "all"}
                type="button"
                onClick={() => onTypeChange(t.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 transition-colors",
                  active
                    ? "bg-brand-800 font-semibold text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-800"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature filter chips */}
      <div className="flex gap-2 overflow-x-auto chip-scroll pb-0.5">
        {FILTER_CHIPS.map((chip) => {
          const active = activeFilters.has(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onEventFilterToggle?.(chip.id)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-all",
                active
                  ? "border-brand-700 bg-brand-50 font-semibold text-brand-800"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              )}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
