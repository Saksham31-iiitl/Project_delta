import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays, Link2, MapPin, PartyPopper } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import * as eventsApi from "@api/events.api.js";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

const schema = z.object({
  eventName: z.string().min(2, "Enter the event name"),
  eventType: z.enum(["wedding", "pooja", "birthday", "navratri", "funeral", "hospital", "other"]),
  venueAddress: z.string().min(5, "Enter the full venue address"),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  start: z.string().min(1, "Pick a start date"),
  end: z.string().min(1, "Pick an end date"),
  maxRadiusKm: z.coerce.number().min(1).max(10).optional(),
});

const EVENT_TYPES = [
  { value: "wedding",   label: "Wedding",          emoji: "💍" },
  { value: "pooja",     label: "Pooja / Havan",    emoji: "🪔" },
  { value: "birthday",  label: "Birthday",          emoji: "🎂" },
  { value: "navratri",  label: "Navratri / Festival", emoji: "🎊" },
  { value: "funeral",   label: "Last Rites",        emoji: "🙏" },
  { value: "hospital",  label: "Hospital Stay",     emoji: "🏥" },
  { value: "other",     label: "Other",             emoji: "📅" },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-stone-700">
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-400 focus:outline-none";

export default function CreateHubPage() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      eventName: "",
      eventType: "wedding",
      venueAddress: "",
      lat: 28.6139,
      lng: 77.2090,
      start: "",
      end: "",
      maxRadiusKm: 2,
    },
  });

  const mut = useMutation({
    mutationFn: (body) => eventsApi.createEvent(body).then((r) => r.data),
    onSuccess: (event) => {
      toast.success("Hub created! Share the invite link with your guests.");
      navigate(`/e/${event.inviteCode}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create hub"),
  });

  const selectedType = form.watch("eventType");

  return (
    <PageWrapper className="max-w-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
          <PartyPopper className="h-6 w-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Create an Occasion Hub</h1>
        <p className="mt-1.5 text-sm text-stone-500">
          Generate a shareable link so your guests can find verified stays nearby.
        </p>
      </div>

      <form className="space-y-6" onSubmit={form.handleSubmit((v) => mut.mutate(v))}>

        {/* Event name */}
        <div>
          <Label htmlFor="eventName">Event name</Label>
          <input
            id="eventName"
            placeholder="e.g. Sharma Wedding, Gupta Navratri 2025"
            className={inputCls}
            {...form.register("eventName")}
          />
          <FieldError message={form.formState.errors.eventName?.message} />
        </div>

        {/* Event type */}
        <div>
          <Label>Type of occasion</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => form.setValue("eventType", t.value, { shouldValidate: true })}
                className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-all ${
                  selectedType === t.value
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <span className="text-lg">{t.emoji}</span>
                <span className="font-medium leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Venue */}
        <div>
          <Label htmlFor="venueAddress">
            <MapPin className="mr-1 inline h-3.5 w-3.5 text-stone-400" />
            Venue address
          </Label>
          <input
            id="venueAddress"
            placeholder="e.g. The Grand Ballroom, Sector 18, Noida"
            className={inputCls}
            {...form.register("venueAddress")}
          />
          <FieldError message={form.formState.errors.venueAddress?.message} />
        </div>

        {/* Lat / Lng */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Venue coordinates (for matching nearby stays)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <input
                id="lat"
                type="number"
                step="any"
                className={inputCls}
                {...form.register("lat")}
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <input
                id="lng"
                type="number"
                step="any"
                className={inputCls}
                {...form.register("lng")}
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            Tip: Right-click any location on Google Maps → "What's here?" to get coordinates.
          </p>
        </div>

        {/* Dates */}
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">
            <CalendarDays className="mr-1 inline h-3.5 w-3.5 text-stone-400" />
            Event dates
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start">Starts</Label>
              <input id="start" type="datetime-local" className={inputCls} {...form.register("start")} />
              <FieldError message={form.formState.errors.start?.message} />
            </div>
            <div>
              <Label htmlFor="end">Ends</Label>
              <input id="end" type="datetime-local" className={inputCls} {...form.register("end")} />
              <FieldError message={form.formState.errors.end?.message} />
            </div>
          </div>
        </div>

        {/* Radius */}
        <div>
          <Label htmlFor="maxRadiusKm">Search radius for nearby stays</Label>
          <div className="flex items-center gap-3">
            <input
              id="maxRadiusKm"
              type="range"
              min="1"
              max="10"
              step="0.5"
              className="flex-1 accent-brand-500"
              {...form.register("maxRadiusKm")}
            />
            <span className="w-16 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-center text-sm font-semibold text-stone-900">
              {form.watch("maxRadiusKm")} km
            </span>
          </div>
          <p className="mt-1 text-[11px] text-stone-400">
            Guests will see stays within this distance from the venue.
          </p>
        </div>

        <Button type="submit" className="h-12 w-full text-base" disabled={mut.isPending}>
          {mut.isPending ? "Creating hub…" : "Create hub & get invite link →"}
        </Button>

        {/* What happens next */}
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-800">
            <Link2 className="h-4 w-4" /> What happens next?
          </p>
          <ul className="space-y-1 text-[13px] text-brand-700">
            <li>• You'll get a unique link like <span className="font-medium">hosttheguest.in/e/abc123</span></li>
            <li>• Share it in your wedding WhatsApp group</li>
            <li>• Guests see all verified stays near the venue</li>
          </ul>
        </div>
      </form>
    </PageWrapper>
  );
}
