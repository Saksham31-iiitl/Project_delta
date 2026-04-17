import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import * as listingsApi from "@api/listings.api.js";
import { Button } from "@components/common/Button.jsx";
import { Input } from "@components/common/Input.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

const schema = z.object({
  type: z.enum(["room", "floor", "home", "suite", "farmhouse"]),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  pricePerNight: z.coerce.number().positive(),
  maxGuests: z.coerce.number().int().positive(),
  locality: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().optional(),
  pincode: z.string().optional(),
  street: z.string().optional(),
  amenities: z.string().optional(),
  rules: z.string().max(500).optional(),
});

export default function CreateListingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "room",
      lat: 26.9124,
      lng: 75.7873,
      pricePerNight: 1500,
      maxGuests: 2,
      locality: "",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "",
      street: "",
      amenities: "wifi, ac",
      rules: "",
    },
  });

  const mut = useMutation({
    mutationFn: (body) => listingsApi.createListing(body).then((r) => r.data),
    onSuccess: (listing) => {
      toast.success("Listing submitted for review");
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      navigate(`/listings/${listing._id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not create listing"),
  });

  return (
    <PageWrapper className="max-w-lg">
      <h1 className="text-xl font-semibold">List your space</h1>
      <p className="mt-1 text-sm text-stone-500">Goes to under_review until admin approves.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={form.handleSubmit((v) => {
          const amenities = v.amenities
            ? v.amenities.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
            : [];
          mut.mutate({
            type: v.type,
            lat: v.lat,
            lng: v.lng,
            pricePerNight: v.pricePerNight,
            maxGuests: v.maxGuests,
            amenities,
            rules: v.rules || undefined,
            address: {
              street: v.street || undefined,
              locality: v.locality,
              city: v.city,
              state: v.state || undefined,
              pincode: v.pincode || undefined,
            },
          });
        })}
      >
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-stone-700">
            Type
          </label>
          <select id="type" className="w-full rounded-lg border border-stone-200 px-3 py-2" {...form.register("type")}>
            {["room", "floor", "home", "suite", "farmhouse"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <Input id="lat" type="number" step="any" label="Latitude" {...form.register("lat")} error={form.formState.errors.lat?.message} />
        <Input id="lng" type="number" step="any" label="Longitude" {...form.register("lng")} error={form.formState.errors.lng?.message} />
        <Input
          id="price"
          type="number"
          label="Price per night (₹)"
          {...form.register("pricePerNight")}
          error={form.formState.errors.pricePerNight?.message}
        />
        <Input id="mg" type="number" label="Max guests" {...form.register("maxGuests")} error={form.formState.errors.maxGuests?.message} />
        <Input id="loc" label="Locality" {...form.register("locality")} error={form.formState.errors.locality?.message} />
        <Input id="city" label="City" {...form.register("city")} error={form.formState.errors.city?.message} />
        <Input id="st" label="State" {...form.register("state")} />
        <Input id="pc" label="Pincode" {...form.register("pincode")} />
        <Input id="str" label="Street (optional)" {...form.register("street")} />
        <Input id="am" label="Amenities (comma-separated)" {...form.register("amenities")} />
        <div>
          <label htmlFor="rules" className="mb-1 block text-sm font-medium text-stone-700">
            House rules (optional)
          </label>
          <textarea
            id="rules"
            rows={3}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            {...form.register("rules")}
          />
        </div>
        <Button type="submit" className="w-full" disabled={mut.isPending}>
          {mut.isPending ? "Submitting…" : "Submit listing"}
        </Button>
      </form>
    </PageWrapper>
  );
}
