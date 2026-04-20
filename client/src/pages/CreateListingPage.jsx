import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import {
  Bath,
  Bed,
  Building2,
  Car,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Home,
  Hotel,
  MapPin,
  Shield,
  Shirt,
  Tv,
  Trees,
  Users,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";
import * as listingsApi from "@api/listings.api.js";
import { Button } from "@components/common/Button.jsx";
import { Input } from "@components/common/Input.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

const GMAPS_LIBS = ["places"];

/* ─── Schema ─────────────────────────────────────────────── */
const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please describe your space (min 20 chars)"),
  type: z.enum(["room", "floor", "home", "suite", "farmhouse"]),
  maxGuests: z.coerce.number().int().min(1).max(30),
  beds: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().min(1),
  pricePerNight: z.coerce.number().positive("Please enter a price"),
  street: z.string().optional(),
  locality: z.string().min(1, "Locality is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  pincode: z.string().optional(),
  nearbyVenueArea: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  checkinTime: z.string().default("12:00"),
  checkoutTime: z.string().default("11:00"),
  bookingType: z.enum(["instant", "request"]).default("request"),
  noSmoking: z.boolean().default(true),
  noAlcohol: z.boolean().default(false),
  noParties: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  rules: z.string().max(500).optional(),
});

/* ─── Amenity options ─────────────────────────────────────── */
const AMENITIES = [
  { key: "wifi",        label: "WiFi",            icon: Wifi },
  { key: "ac",          label: "AC",              icon: Wind },
  { key: "geyser",      label: "Geyser / Hot water", icon: Bath },
  { key: "parking",     label: "Parking",         icon: Car },
  { key: "tv",          label: "TV",              icon: Tv },
  { key: "kitchen",     label: "Kitchen access",  icon: ChefHat },
  { key: "washing",     label: "Washing machine", icon: Shirt },
  { key: "generator",   label: "Generator",       icon: Zap },
  { key: "security",    label: "24hr security",   icon: Shield },
  { key: "meals",       label: "Meals included",  icon: ChefHat },
];

/* ─── Property types ─────────────────────────────────────── */
const TYPES = [
  { value: "room",      label: "Room",       desc: "Private room in a family home", icon: Home },
  { value: "floor",     label: "Floor",      desc: "Entire floor, own entrance",    icon: Building2 },
  { value: "home",      label: "Full Home",  desc: "Whole house for the family",    icon: Hotel },
  { value: "suite",     label: "Suite",      desc: "Premium suite with comforts",   icon: Bed },
  { value: "farmhouse", label: "Farmhouse",  desc: "Open grounds & scenic space",   icon: Trees },
];

/* ─── Optional map location picker ───────────────────────── */
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
};

function LocationPickerMap({ lat, lng, onPick, onAddressFill }) {
  const acRef  = useRef(null);
  const mapRef = useRef(null);
  const center = { lat: lat || 28.6139, lng: lng || 77.2090 };

  const onPlaceChanged = () => {
    const place = acRef.current?.getPlace?.();
    const loc   = place?.geometry?.location;
    if (!loc) return;
    onPick(loc.lat(), loc.lng());
    mapRef.current?.panTo({ lat: loc.lat(), lng: loc.lng() });

    // Try to fill address fields from place components
    const comps = place.address_components || [];
    const get = (type) => comps.find((c) => c.types.includes(type))?.long_name || "";
    onAddressFill({
      street:   [get("street_number"), get("route")].filter(Boolean).join(" "),
      locality: get("sublocality_level_1") || get("locality") || get("administrative_area_level_3"),
      city:     get("locality") || get("administrative_area_level_2"),
      state:    get("administrative_area_level_1"),
      pincode:  get("postal_code"),
    });
  };

  return (
    <div className="relative mt-3 h-64 rounded-xl border border-stone-200 sm:h-72">
      {/* Search bar over map */}
      <div className="absolute left-2 right-2 top-2 z-10">
        <Autocomplete onLoad={(ac) => (acRef.current = ac)} onPlaceChanged={onPlaceChanged}>
          <input
            placeholder="Search your address to drop pin…"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-md placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </Autocomplete>
      </div>

      {/* Map */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <GoogleMap
          mapContainerClassName="h-full w-full"
          center={center}
          zoom={15}
          options={MAP_OPTIONS}
          onLoad={(m) => (mapRef.current = m)}
          onClick={(e) => onPick(e.latLng.lat(), e.latLng.lng())}
        >
          <Marker
            position={center}
            draggable
            onDragEnd={(e) => onPick(e.latLng.lat(), e.latLng.lng())}
          />
        </GoogleMap>
      </div>

      {/* Hint */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
          Click on map or drag pin to your exact location
        </span>
      </div>
    </div>
  );
}

/* ─── Section wrapper ─────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <motion.div
      className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-700">{title}</h2>
      {children}
    </motion.div>
  );
}

/* ─── Component ──────────────────────────────────────────── */
export default function CreateListingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "nearbystay-map",
    googleMapsApiKey: mapsKey || "",
    libraries: GMAPS_LIBS,
  });

  const [showMap, setShowMap] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      type: "room",
      maxGuests: 2,
      beds: 1,
      bathrooms: 1,
      pricePerNight: "",
      street: "",
      locality: "",
      city: "New Delhi",
      state: "Delhi",
      pincode: "",
      nearbyVenueArea: "",
      lat: 28.6139,
      lng: 77.2090,
      checkinTime: "12:00",
      checkoutTime: "11:00",
      bookingType: "request",
      noSmoking: true,
      noAlcohol: false,
      noParties: false,
      petFriendly: false,
      rules: "",
    },
  });

  // Amenity checkboxes (managed separately as they're an array)
  const [selectedAmenities, setSelectedAmenities] = useState(["wifi", "geyser"]);
  const toggleAmenity = (key) =>
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const selectedType = watch("type");

  const mut = useMutation({
    mutationFn: (body) => listingsApi.createListing(body).then((r) => r.data),
    onSuccess: (listing) => {
      toast.success("Listing submitted for review — we'll notify you once it's approved!");
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      navigate(`/listings/${listing._id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not submit listing"),
  });

  const onSubmit = (v) => {
    const rules = [
      v.noSmoking  ? "No smoking"  : null,
      v.noAlcohol  ? "No alcohol"  : null,
      v.noParties  ? "No parties"  : null,
      v.petFriendly ? "Pets allowed" : null,
      v.rules?.trim() || null,
    ].filter(Boolean).join(". ");

    mut.mutate({
      title: v.title,
      description: v.description,
      type: v.type,
      maxGuests: v.maxGuests,
      beds: v.beds,
      bathrooms: v.bathrooms,
      pricePerNight: v.pricePerNight,
      amenities: selectedAmenities,
      rules: rules || undefined,
      checkInTime: v.checkinTime,
      checkOutTime: v.checkoutTime,
      bookingType: v.bookingType,
      nearbyVenueArea: v.nearbyVenueArea || undefined,
      lat: v.lat,
      lng: v.lng,
      address: {
        street: v.street || undefined,
        locality: v.locality,
        city: v.city,
        state: v.state || undefined,
        pincode: v.pincode || undefined,
      },
    });
  };

  return (
    <PageWrapper className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">List your space</h1>
        <p className="mt-1 text-sm text-stone-500">
          Fill in the details below. Your listing goes live after admin review — usually within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ── 1. Space details ── */}
        <Section title="About your space">
          <div className="space-y-4">
            <Input
              id="title"
              label="Listing title"
              placeholder='e.g. "Cozy room near Dwarka wedding venue"'
              {...register("title")}
              error={errors.title?.message}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe your space — size, feel, what makes it special for event guests…"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Section>

        {/* ── 2. Property type ── */}
        <Section title="Property type">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const active = selectedType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue("type", t.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all ${
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-800"
                      : "border-stone-200 bg-white text-stone-600 hover:border-brand-200"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${active ? "text-brand-600" : "text-stone-400"}`} />
                  <span className="text-xs font-semibold">{t.label}</span>
                  <span className="text-[10px] leading-tight text-stone-400">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── 3. Capacity ── */}
        <Section title="Capacity & rooms">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                <Users className="h-3.5 w-3.5 text-stone-400" /> Max guests
              </label>
              <input
                type="number"
                min={1} max={30}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("maxGuests")}
              />
              {errors.maxGuests && <p className="mt-1 text-xs text-red-500">{errors.maxGuests.message}</p>}
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                <Bed className="h-3.5 w-3.5 text-stone-400" /> Beds
              </label>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("beds")}
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                <Bath className="h-3.5 w-3.5 text-stone-400" /> Bathrooms
              </label>
              <input
                type="number"
                min={1} step={0.5}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("bathrooms")}
              />
            </div>
          </div>
        </Section>

        {/* ── 4. Location ── */}
        <Section title="Location">
          <div className="space-y-3">
            <Input id="locality" label="Locality / Area" placeholder="e.g. Dwarka Sector 10" {...register("locality")} error={errors.locality?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Input id="city" label="City" {...register("city")} error={errors.city?.message} />
              <Input id="pincode" label="Pincode" {...register("pincode")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input id="street" label="Street / Colony (optional)" {...register("street")} />
              <Input id="state" label="State" {...register("state")} />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                <MapPin className="h-3.5 w-3.5 text-stone-400" /> Near which event venues?
              </label>
              <input
                type="text"
                placeholder='e.g. "Near Banquet Halls on NH8" or "500m from Radisson Blu Dwarka"'
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("nearbyVenueArea")}
              />
              <p className="mt-1 text-[11px] text-stone-400">Helps event guests find you easily</p>
            </div>

            {/* ── Optional map pin ── */}
            {mapsKey && mapsLoaded && (
              <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-3">
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className="flex w-full items-center justify-between text-sm font-medium text-brand-700"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-500" />
                    Pin your exact location on map
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                      Optional
                    </span>
                  </span>
                  {showMap
                    ? <ChevronUp className="h-4 w-4 text-stone-400" />
                    : <ChevronDown className="h-4 w-4 text-stone-400" />
                  }
                </button>
                <p className="mt-1 text-[11px] text-stone-400">
                  Helps guests see your stay on the map — more bookings!
                </p>

                {showMap && (
                  <LocationPickerMap
                    lat={watch("lat")}
                    lng={watch("lng")}
                    onPick={(lat, lng) => {
                      setValue("lat", lat);
                      setValue("lng", lng);
                    }}
                    onAddressFill={(fields) => {
                      if (fields.street)   setValue("street",   fields.street);
                      if (fields.locality) setValue("locality", fields.locality);
                      if (fields.city)     setValue("city",     fields.city);
                      if (fields.state)    setValue("state",    fields.state);
                      if (fields.pincode)  setValue("pincode",  fields.pincode);
                    }}
                  />
                )}

                {watch("lat") && watch("lng") && (
                  <p className="mt-2 text-[11px] text-brand-600">
                    ✓ Pin set — {Number(watch("lat")).toFixed(5)}, {Number(watch("lng")).toFixed(5)}
                  </p>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* ── 5. Pricing ── */}
        <Section title="Your price">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Price per night (₹) — you decide
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">₹</span>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1500"
                  className="w-full rounded-lg border border-stone-200 py-2 pl-7 pr-3 text-sm placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  {...register("pricePerNight")}
                />
              </div>
              {errors.pricePerNight && <p className="mt-1 text-xs text-red-500">{errors.pricePerNight.message}</p>}
              <p className="mt-1 text-[11px] text-stone-400">You can change this anytime from your host dashboard</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Booking type</label>
              <div className="flex gap-3">
                {[
                  { v: "instant", label: "Instant booking", desc: "Guest books directly" },
                  { v: "request", label: "Request to book", desc: "You approve each guest" },
                ].map((opt) => (
                  <label
                    key={opt.v}
                    className={`flex flex-1 cursor-pointer flex-col rounded-xl border-2 p-3 transition-all ${
                      watch("bookingType") === opt.v
                        ? "border-brand-500 bg-brand-50"
                        : "border-stone-200"
                    }`}
                  >
                    <input type="radio" value={opt.v} className="sr-only" {...register("bookingType")} />
                    <span className="text-sm font-semibold text-stone-800">{opt.label}</span>
                    <span className="text-[11px] text-stone-500">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── 6. Amenities ── */}
        <Section title="Amenities">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((a) => {
              const Icon = a.icon;
              const on = selectedAmenities.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAmenity(a.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                    on
                      ? "border-brand-400 bg-brand-50 text-brand-800 font-medium"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${on ? "text-brand-600" : "text-stone-400"}`} />
                  {a.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── 7. Check-in / out ── */}
        <Section title="Check-in & check-out">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Check-in time</label>
              <input
                type="time"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("checkinTime")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Check-out time</label>
              <input
                type="time"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("checkoutTime")}
              />
            </div>
          </div>
        </Section>

        {/* ── 8. House rules ── */}
        <Section title="House rules">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { field: "noSmoking",  label: "No smoking" },
                { field: "noAlcohol",  label: "No alcohol" },
                { field: "noParties",  label: "No parties" },
                { field: "petFriendly", label: "Pets allowed" },
              ].map((r) => (
                <label
                  key={r.field}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                    watch(r.field)
                      ? "border-brand-400 bg-brand-50 text-brand-800 font-medium"
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  <input type="checkbox" className="accent-brand-600" {...register(r.field)} />
                  {r.label}
                </label>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Additional rules (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Any other rules guests should know…"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                {...register("rules")}
              />
            </div>
          </div>
        </Section>

        {/* ── Submit ── */}
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <p className="mb-3 text-[13px] text-brand-700">
            Your listing will be reviewed by our team before going live. We verify all addresses and details for guest safety.
          </p>
          <Button type="submit" className="w-full" disabled={mut.isPending}>
            {mut.isPending ? "Submitting…" : "Submit for review →"}
          </Button>
        </div>

      </form>
    </PageWrapper>
  );
}
