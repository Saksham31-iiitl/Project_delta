import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
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
import { ImagePlus, Sparkles, X as XIcon } from "lucide-react";
import * as listingsApi from "@api/listings.api.js";
import { aiGenerate, buildListingDescriptionPrompt } from "@utils/ai.js";
import { Button } from "@components/common/Button.jsx";
import { Input } from "@components/common/Input.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

const GMAPS_LIBS = ["places"];

/* ─── India states & cities ───────────────────────────────── */
const INDIA_STATES_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Tirupati","Kakinada","Rajahmundry","Kadapa","Anantapur"],
  "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tezpur"],
  "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Darbhanga","Purnia","Arrah","Begusarai"],
  "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Gandhinagar","Junagadh","Anand"],
  "Haryana": ["Faridabad","Gurugram","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat"],
  "Himachal Pradesh": ["Shimla","Mandi","Solan","Dharamshala","Palampur","Kullu","Manali","Baddi"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih"],
  "Karnataka": ["Bengaluru","Mysuru","Hubballi","Mangaluru","Belagavi","Kalaburagi","Davanagere","Bellary","Vijayapura","Shivamogga","Tumakuru","Dharwad"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Alappuzha","Palakkad","Malappuram","Kannur","Kottayam"],
  "Madhya Pradesh": ["Bhopal","Indore","Gwalior","Jabalpur","Ujjain","Sagar","Dewas","Satna","Ratlam","Rewa","Burhanpur"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Kolhapur","Amravati","Nanded","Thane","Pimpri-Chinchwad","Vasai-Virar"],
  "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur"],
  "Meghalaya": ["Shillong","Tura","Jowai"],
  "Mizoram": ["Aizawl","Lunglei","Champhai"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Brahmapur","Sambalpur","Puri","Balasore","Baripada"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Hoshiarpur","Pathankot"],
  "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Sikar","Bharatpur"],
  "Sikkim": ["Gangtok","Namchi","Gyalshing"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Tiruppur","Erode","Vellore","Thoothukudi","Dindigul"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Nalgonda","Ramagundam"],
  "Tripura": ["Agartala","Udaipur","Dharmanagar"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Prayagraj","Ghaziabad","Noida","Bareilly","Aligarh","Moradabad","Saharanpur","Gorakhpur","Ayodhya","Mathura","Jhansi","Firozabad"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Rishikesh","Haldwani","Nainital","Mussoorie"],
  "West Bengal": ["Kolkata","Asansol","Howrah","Durgapur","Siliguri","Bardhaman","Malda","Baharampur"],
  "Delhi": ["New Delhi","Dwarka","Rohini","Shahdara","Laxmi Nagar","Janakpuri","Pitampura","Saket","Vasant Kunj","Connaught Place"],
  "Chandigarh": ["Chandigarh"],
  "Puducherry": ["Puducherry","Karaikal"],
  "Jammu & Kashmir": ["Srinagar","Jammu","Sopore","Baramulla","Anantnag","Udhampur"],
  "Ladakh": ["Leh","Kargil"],
  "Andaman & Nicobar Islands": ["Port Blair"],
  "Dadra & Nagar Haveli": ["Silvassa"],
  "Daman & Diu": ["Daman","Diu"],
};

const STATE_LIST = Object.keys(INDIA_STATES_CITIES).sort();

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

/* ─── Map location picker ─────────────────────────────────── */
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
};

function LocationPickerMap({ lat, lng, onPick, onAddressFill, autoZoom }) {
  const acRef  = useRef(null);
  const mapRef = useRef(null);
  const center = { lat: lat || 20.5937, lng: lng || 78.9629 }; // India center default

  // Pan + zoom when city auto-geocode updates lat/lng
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    mapRef.current.panTo({ lat, lng });
    if (autoZoom) mapRef.current.setZoom(14);
  }, [lat, lng, autoZoom]);

  const onPlaceChanged = () => {
    const place = acRef.current?.getPlace?.();
    const loc   = place?.geometry?.location;
    if (!loc) return;
    onPick(loc.lat(), loc.lng(), true);
    mapRef.current?.panTo({ lat: loc.lat(), lng: loc.lng() });
    mapRef.current?.setZoom(17);

    const comps = place.address_components || [];
    const get   = (type) => comps.find((c) => c.types.includes(type))?.long_name || "";
    onAddressFill({
      street:   [get("street_number"), get("route")].filter(Boolean).join(" "),
      locality: get("sublocality_level_1") || get("locality") || get("administrative_area_level_3"),
      city:     get("locality") || get("administrative_area_level_2"),
      state:    get("administrative_area_level_1"),
      pincode:  get("postal_code"),
    });
  };

  return (
    <div className="relative h-72 rounded-xl border-2 border-brand-200 sm:h-80">
      {/* Floating search bar */}
      <div className="absolute left-2 right-2 top-2 z-10">
        <Autocomplete onLoad={(ac) => (acRef.current = ac)} onPlaceChanged={onPlaceChanged}>
          <input
            placeholder="Or search your exact street address here…"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-lg placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </Autocomplete>
      </div>

      {/* Map */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <GoogleMap
          mapContainerClassName="h-full w-full"
          center={center}
          zoom={lat && lng ? 14 : 5}
          options={MAP_OPTIONS}
          onLoad={(m) => (mapRef.current = m)}
          onClick={(e) => onPick(e.latLng.lat(), e.latLng.lng(), true)}
        >
          {lat && lng && (
            <Marker
              position={{ lat, lng }}
              draggable
              onDragEnd={(e) => onPick(e.latLng.lat(), e.latLng.lng(), true)}
            />
          )}
        </GoogleMap>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
        <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
          Drag the pin or click anywhere to set exact location
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

  const [pinManuallySet, setPinManuallySet] = useState(false);
  const [autoZoom, setAutoZoom] = useState(false);

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
      city: "",
      state: "",
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

  // Photo upload state
  const [photoFiles, setPhotoFiles]   = useState([]); // { file, preview, url? }
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map((file) => ({ file, preview: URL.createObjectURL(file), url: null }));
    setPhotoFiles((prev) => [...prev, ...previews]);
    setPhotoUploading(true);
    try {
      const res = await listingsApi.uploadListingPhotos(files);
      const urls = res.data.urls;
      setPhotoFiles((prev) => {
        const updated = [...prev];
        let urlIdx = 0;
        for (let i = 0; i < updated.length; i++) {
          if (!updated[i].url && urlIdx < urls.length) {
            updated[i] = { ...updated[i], url: urls[urlIdx++] };
          }
        }
        return updated;
      });
    } catch {
      toast.error("Photo upload failed — check Cloudinary config");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (idx) =>
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));

  const [aiGenerating, setAiGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    setAiGenerating(true);
    try {
      const v = {
        type:             watch("type"),
        city:             watch("city"),
        state:            watch("state"),
        maxGuests:        watch("maxGuests"),
        beds:             watch("beds"),
        bathrooms:        watch("bathrooms"),
        amenities:        selectedAmenities,
        nearbyVenueArea:  watch("nearbyVenueArea"),
      };
      const prompt = buildListingDescriptionPrompt(v);
      const text   = await aiGenerate(prompt);
      setValue("description", text.trim());
      toast.success("Description generated!");
    } catch {
      toast.error("AI generation failed — check your Groq API key");
    } finally {
      setAiGenerating(false);
    }
  };

  // Amenity checkboxes (managed separately as they're an array)
  const [selectedAmenities, setSelectedAmenities] = useState(["wifi", "geyser"]);
  const toggleAmenity = (key) =>
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const selectedType  = watch("type");
  const watchedCity   = watch("city");
  const watchedState  = watch("state");

  // Auto-center the map when city is selected (unless host already dragged pin)
  useEffect(() => {
    if (!mapsLoaded || !watchedCity || typeof window.google === "undefined") return;
    if (pinManuallySet) return;
    const address = [watchedCity, watchedState, "India"].filter(Boolean).join(", ");
    new window.google.maps.Geocoder().geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        setValue("lat", results[0].geometry.location.lat());
        setValue("lng", results[0].geometry.location.lng());
        setAutoZoom(true);
        setTimeout(() => setAutoZoom(false), 500);
      }
    });
  }, [watchedCity, watchedState, mapsLoaded]); // eslint-disable-line

  const mut = useMutation({
    mutationFn: (body) => listingsApi.createListing(body).then((r) => r.data),
    onSuccess: (listing) => {
      toast.success("Listing submitted for review — we'll notify you once it's approved!");
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      navigate(`/listings/${listing._id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not submit listing"),
  });

  const geocodeAddress = async (v) => {
    if (!mapsLoaded || typeof window.google === "undefined") return { lat: v.lat, lng: v.lng };
    const address = [v.street, v.locality, v.city, v.state, v.pincode, "India"].filter(Boolean).join(", ");
    return new Promise((resolve) => {
      new window.google.maps.Geocoder().geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
        } else {
          resolve({ lat: v.lat, lng: v.lng });
        }
      });
    });
  };

  const onSubmit = async (v) => {
    const rules = [
      v.noSmoking   ? "No smoking"   : null,
      v.noAlcohol   ? "No alcohol"   : null,
      v.noParties   ? "No parties"   : null,
      v.petFriendly ? "Pets allowed" : null,
      v.rules?.trim() || null,
    ].filter(Boolean).join(". ");

    // Auto-geocode address if host didn't manually place a pin
    const coords = pinManuallySet ? { lat: v.lat, lng: v.lng } : await geocodeAddress(v);

    mut.mutate({
      title: v.title,
      description: v.description,
      type: v.type,
      maxGuests: v.maxGuests,
      beds: v.beds,
      bathrooms: v.bathrooms,
      pricePerNight: v.pricePerNight,
      amenities: selectedAmenities,
      photos: photoFiles.map((p) => p.url).filter(Boolean),
      rules: rules || undefined,
      checkInTime: v.checkinTime,
      checkOutTime: v.checkoutTime,
      bookingType: v.bookingType,
      nearbyVenueArea: v.nearbyVenueArea || undefined,
      lat: coords.lat,
      lng: coords.lng,
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
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">Description</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={aiGenerating}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {aiGenerating ? "Generating…" : "Generate with AI ✨"}
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Describe your space — or click 'Generate with AI' to write it for you!"
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
            <div className="grid grid-cols-2 gap-3">
              {/* State dropdown */}
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">State</label>
                <select
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  {...register("state")}
                  onChange={(e) => {
                    setValue("state", e.target.value);
                    setValue("city", ""); // reset city when state changes
                  }}
                >
                  <option value="">Select state…</option>
                  {STATE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* City dropdown filtered by state */}
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">City</label>
                <select
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  {...register("city")}
                >
                  <option value="">Select city…</option>
                  {(INDIA_STATES_CITIES[watch("state")] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
              </div>
            </div>
            <Input id="locality" label="Locality / Area" placeholder="e.g. Gomti Nagar, Hazratganj" {...register("locality")} error={errors.locality?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Input id="street" label="Street / Colony (optional)" {...register("street")} />
              <Input id="pincode" label="Pincode" {...register("pincode")} />
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

            {/* ── Map pin (always visible when Maps loaded) ── */}
            {mapsKey && mapsLoaded ? (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                  <MapPin className="h-3.5 w-3.5 text-brand-500" />
                  Pin your exact location
                  <span className="text-[10px] font-normal text-stone-400">(auto-set from city — drag to fine-tune)</span>
                </p>
                <LocationPickerMap
                  lat={watch("lat")}
                  lng={watch("lng")}
                  autoZoom={autoZoom}
                  onPick={(lat, lng, manual) => {
                    setValue("lat", lat);
                    setValue("lng", lng);
                    if (manual) setPinManuallySet(true);
                  }}
                  onAddressFill={(fields) => {
                    if (fields.street)   setValue("street",   fields.street);
                    if (fields.locality) setValue("locality", fields.locality);
                    if (fields.city)     setValue("city",     fields.city);
                    if (fields.state)    setValue("state",    fields.state);
                    if (fields.pincode)  setValue("pincode",  fields.pincode);
                  }}
                />
                {pinManuallySet && (
                  <p className="mt-1 text-[11px] text-brand-600">
                    ✓ Pin placed at {Number(watch("lat")).toFixed(5)}, {Number(watch("lng")).toFixed(5)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-stone-400">
                <MapPin className="mr-1 inline h-3 w-3" />
                Map pin will be set automatically from your city address.
              </p>
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

        {/* ── 9. Photos ── */}
        <Section title="Photos of your space">
          <p className="mb-3 text-xs text-stone-500">Upload up to 10 photos. First photo will be the cover image.</p>
          {/* Preview grid */}
          {photoFiles.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photoFiles.map((p, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <img src={p.preview} alt="" className="h-full w-full object-cover" />
                  {!p.url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900/70 text-white hover:bg-red-600"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Upload button */}
          {photoFiles.length < 10 && (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 py-8 text-stone-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600">
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">
                {photoUploading ? "Uploading…" : "Click to add photos"}
              </span>
              <span className="text-xs text-stone-400">JPG, PNG, WEBP · Max 5 MB each</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handlePhotoAdd}
                disabled={photoUploading}
              />
            </label>
          )}
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
