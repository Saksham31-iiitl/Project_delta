import { format } from "date-fns";
import { motion } from "motion/react";
import { Calendar, MapPin, Share2, Star } from "lucide-react";
import { Button } from "@components/common/Button.jsx";

export function HubBanner({ event, shareUrl, onShare }) {
  if (!event) return null;
  const start = event.eventDates?.start ? new Date(event.eventDates.start) : null;
  const end = event.eventDates?.end ? new Date(event.eventDates.end) : null;
  const dateStr =
    start && end ? `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}` : "";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 to-brand-700 px-4 py-7 text-white">
      <motion.div
        className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/[0.07]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.12, 0.07] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-16 right-4 h-48 w-48 rounded-full bg-accent-500/10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="relative z-10 max-w-3xl">
        <motion.p
          className="mb-2 inline-flex items-center gap-1 rounded-full bg-accent-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-accent-300"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Star className="h-3 w-3" aria-hidden />
          Occasion hub
        </motion.p>
        <motion.h1
          className="font-display text-[24px] leading-tight text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {event.eventName}
        </motion.h1>
        {event.venueAddress ? (
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-white/85">
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            {event.venueAddress}
          </p>
        ) : null}
        {dateStr ? (
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/85">
            <Calendar className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            {dateStr}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="border-white/80 bg-transparent text-white hover:bg-white/10"
            onClick={onShare}
          >
            <Share2 className="mr-2 h-4 w-4" aria-hidden />
            Copy link
          </Button>
          {shareUrl ? (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Stays near ${event.eventName}: ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex min-h-11 items-center justify-center rounded-lg border border-white/80 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Share on WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
