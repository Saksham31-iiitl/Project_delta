import { Info, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMockApi } from "@api/mockOr.js";

const SESSION_KEY = "nearbystay_hide_demo_chip";

export function MockBanner() {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [expanded, setExpanded] = useState(false);

  if (!useMockApi || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[60] max-w-sm rounded-full bg-stone-900/90 px-3 py-1.5 text-[11px] text-stone-400 shadow-lg backdrop-blur-sm"
      style={{ opacity: 0.92 }}
    >
      <div className="flex items-center gap-2">
        <Info className="h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden />
        <button
          type="button"
          className="font-medium text-stone-300 hover:text-white"
          onClick={() => setExpanded((e) => !e)}
        >
          Demo mode
        </button>
        <button
          type="button"
          className="ml-auto rounded-full p-0.5 text-stone-500 hover:bg-stone-800 hover:text-stone-300"
          aria-label="Dismiss demo notice"
          onClick={() => {
            sessionStorage.setItem(SESSION_KEY, "1");
            setDismissed(true);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {expanded ? (
        <p className="mt-2 border-t border-stone-700 pt-2 pl-5 text-[10px] leading-relaxed text-stone-500">
          Sample data only — no live server. Open the{" "}
          <Link to="/e/MOCK24" className="text-brand-400 underline">
            demo hub
          </Link>
          . Turn off mock data in your env when the API is running.
        </p>
      ) : null}
    </div>
  );
}
