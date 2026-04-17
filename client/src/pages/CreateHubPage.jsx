import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import * as eventsApi from "@api/events.api.js";
import { Button } from "@components/common/Button.jsx";
import { Input } from "@components/common/Input.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

const schema = z.object({
  eventName: z.string().min(2),
  eventType: z.enum(["wedding", "pooja", "birthday", "navratri", "funeral", "hospital", "other"]),
  venueAddress: z.string().min(5),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  start: z.string(),
  end: z.string(),
  maxRadiusKm: z.coerce.number().min(1).max(10).optional(),
});

export default function CreateHubPage() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      eventName: "",
      eventType: "wedding",
      venueAddress: "",
      lat: 26.9124,
      lng: 75.7873,
      start: "",
      end: "",
      maxRadiusKm: 2,
    },
  });

  const mut = useMutation({
    mutationFn: (body) => eventsApi.createEvent(body).then((r) => r.data),
    onSuccess: (event) => {
      toast.success("Hub created");
      navigate(`/e/${event.inviteCode}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <PageWrapper className="max-w-lg">
      <h1 className="text-xl font-semibold">Create Occasion Hub</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={form.handleSubmit((v) => mut.mutate(v))}
      >
        <Input id="en" label="Event name" {...form.register("eventName")} error={form.formState.errors.eventName?.message} />
        <div>
          <label htmlFor="et" className="mb-1 block text-sm font-medium text-stone-700">
            Event type
          </label>
          <select id="et" className="w-full rounded-lg border border-stone-200 px-3 py-2" {...form.register("eventType")}>
            {["wedding", "pooja", "birthday", "navratri", "funeral", "hospital", "other"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <Input id="va" label="Venue address" {...form.register("venueAddress")} error={form.formState.errors.venueAddress?.message} />
        <Input id="lat" label="Latitude" type="number" step="any" {...form.register("lat")} error={form.formState.errors.lat?.message} />
        <Input id="lng" label="Longitude" type="number" step="any" {...form.register("lng")} error={form.formState.errors.lng?.message} />
        <Input id="start" label="Start (ISO date)" type="datetime-local" {...form.register("start")} error={form.formState.errors.start?.message} />
        <Input id="end" label="End (ISO date)" type="datetime-local" {...form.register("end")} error={form.formState.errors.end?.message} />
        <Input id="mr" label="Radius km" type="number" {...form.register("maxRadiusKm")} error={form.formState.errors.maxRadiusKm?.message} />
        <Button type="submit" className="w-full" disabled={mut.isPending}>
          Create
        </Button>
      </form>
    </PageWrapper>
  );
}
