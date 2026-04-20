import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import {
  ArrowRight,
  Bath,
  Bed,
  Building2,
  Cake,
  Check,
  Clock,
  Heart,
  Home,
  MapPin,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { MapView } from "@components/search/MapView.jsx";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { ListingCard } from "@components/listings/ListingCard.jsx";
import * as listingsApi from "@api/listings.api.js";
import { formatPricePerNight, listingDisplayTitle, listingLocationLine } from "@utils/format.js";
import { getRecentlyViewed } from "@utils/recentlyViewed.js";

const GMAPS_LIBS = ["places"];
const DEFAULT_CENTER = { lat: 26.8467, lng: 80.9462 }; // Lucknow

const occasionChips = [
  { label: "Wedding week",    icon: Heart },
  { label: "Pooja & Havan",  icon: Sparkles },
  { label: "Birthday",       icon: Cake },
  { label: "Navratri",       icon: Sparkles },
  { label: "Family reunion", icon: Users },
  { label: "Hospital stay",  icon: Building2 },
  { label: "Party",          icon: PartyPopper },
];

/* ─── Stagger variants ──────────────────────────────────── */
const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ─── Animated counter ──────────────────────────────────── */
function AnimatedCounter({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState("0");

  useEffect(() => { if (inView && typeof target === "number") motionVal.set(target); }, [inView, motionVal, target]);
  useEffect(() => spring.on("change", (v) => { if (typeof target === "number") setDisplay(Math.round(v).toLocaleString("en-IN")); }), [spring, target]);

  if (typeof target !== "number") return <span ref={ref}>{target}{suffix}</span>;
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Map mini-popup ────────────────────────────────────── */
function HomeMapPopup({ listing, onClose }) {
  if (!listing) return null;
  const title   = listingDisplayTitle(listing);
  const locLine = listingLocationLine(listing);
  return (
    <motion.div
      key={listing._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-20 left-1/2 z-20 w-[min(92%,340px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
    >
      <button type="button" onClick={onClose} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow hover:bg-stone-100">
        <X className="h-4 w-4" />
      </button>
      {listing.photos?.[0] && <img src={listing.photos[0]} alt={title} className="h-28 w-full object-cover" />}
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">{listing.type}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-stone-900">{title}</p>
        {locLine && <p className="mt-0.5 truncate text-xs text-stone-500">{locLine}</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-stone-400">
            {listing.beds      && <span className="flex items-center gap-1"><Bed  className="h-3 w-3" />{listing.beds}</span>}
            {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
          </div>
          <p className="font-mono text-sm font-bold text-brand-700">{formatPricePerNight(listing.pricePerNight)}</p>
        </div>
        <Link to={`/listings/${listing._id}`} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-700 py-2 text-xs font-semibold text-white hover:bg-brand-800">
          View listing <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Map explorer inner ────────────────────────────────── */
function MapExplorerInner({ isLoaded }) {
  const acRef    = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [center, setCenter]       = useState(DEFAULT_CENTER);
  const [areaLabel, setAreaLabel] = useState("Lucknow");
  const [selected, setSelected]   = useState(null);

  const qParams = useMemo(() => ({ lat: center.lat, lng: center.lng, radiusKm: 5 }), [center]);
  const { data: listings = [] } = useQuery({
    queryKey: ["home-map-listings", qParams],
    queryFn: () => listingsApi.searchListings(qParams).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const applyLocation = (lat, lng, label) => { setCenter({ lat, lng }); setAreaLabel(label); setSelected(null); };

  const onPlaceChanged = () => {
    const place = acRef.current?.getPlace?.();
    const loc   = place?.geometry?.location;
    if (!loc) return;
    applyLocation(loc.lat(), loc.lng(), place.formatted_address || place.name || "");
  };

  const geocodeInput = () => {
    const text = inputRef.current?.value?.trim();
    if (!text) return;
    new window.google.maps.Geocoder().geocode({ address: text }, (results, status) => {
      if (status === "OK" && results[0]) {
        applyLocation(results[0].geometry.location.lat(), results[0].geometry.location.lng(), results[0].formatted_address || text);
      }
    });
  };

  const goToSearch = () => {
    const p = new URLSearchParams();
    p.set("lat", String(center.lat)); p.set("lng", String(center.lng)); p.set("area", areaLabel);
    navigate(`/search?${p.toString()}`);
  };

  return (
    <div className="relative h-[420px] w-full rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xl sm:h-[540px]">
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <MapView center={center} listings={listings} radiusKm={5} isLoaded={isLoaded} selectedId={selected?._id} onListingClick={setSelected} />
      </div>

      <div className="absolute left-1/2 top-4 z-20 w-[min(92%,500px)] -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/97 px-3 py-2.5 shadow-lg backdrop-blur-sm">
          <Search className="h-4 w-4 shrink-0 text-stone-400" />
          {isLoaded ? (
            <Autocomplete onLoad={(ac) => (acRef.current = ac)} onPlaceChanged={onPlaceChanged}>
              <input ref={inputRef} className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none" placeholder="Search any venue, city or area…" defaultValue={areaLabel} key={areaLabel} style={{ width: "100%" }} onKeyDown={(e) => { if (e.key === "Enter") geocodeInput(); }} />
            </Autocomplete>
          ) : (
            <input ref={inputRef} className="min-w-0 flex-1 border-0 bg-transparent text-sm text-stone-500 focus:outline-none" placeholder="Enter city or area…" defaultValue={areaLabel} onKeyDown={(e) => { if (e.key === "Enter") geocodeInput(); }} />
          )}
          <button type="button" onClick={geocodeInput} className="shrink-0 rounded-xl bg-brand-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 active:scale-95 transition-transform">
            Search
          </button>
        </div>
      </div>

      {listings.length > 0 && (
        <div className="absolute bottom-16 left-4 z-20">
          <div className="rounded-full border border-brand-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow backdrop-blur-sm">
            {listings.length} stay{listings.length !== 1 ? "s" : ""} nearby
          </div>
        </div>
      )}

      <HomeMapPopup listing={selected} onClose={() => setSelected(null)} />

      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
        <button type="button" onClick={goToSearch} className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-xl hover:bg-brand-50 transition-colors">
          <MapPin className="h-4 w-4 text-brand-600" /> Explore all stays on map <ArrowRight className="h-4 w-4 text-brand-600" />
        </button>
      </div>
    </div>
  );
}

function HomeMapSection() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({ id: "nearbystay-map", googleMapsApiKey: key || "", libraries: GMAPS_LIBS });

  if (!key || loadError) {
    return (
      <section className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-[40px] text-brand-900">Explore stays near any event</h2>
          <Link to="/search" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800">
            Browse all stays <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream px-4 py-12 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <motion.div className="mb-7 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-stone-400 mb-2">Live map</p>
          <h2 className="font-display text-[30px] sm:text-[40px] leading-tight text-brand-900">Explore stays <em className="text-accent-600">near any event</em></h2>
          <p className="mt-2 text-sm text-stone-500">Search any city or venue — see verified stays as pins on the map</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <MapExplorerInner isLoaded={isLoaded} />
        </motion.div>
        <div className="mt-4 chip-scroll flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center text-xs text-stone-400">
          {["🔍  Search any area or venue", "📍  Tap a pin to preview", "🏠  Tap 'Explore all' for full search"].map((h) => (
            <span key={h} className="shrink-0 rounded-full border border-stone-100 bg-white px-3 py-1.5">{h}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState("");
  const [recentlyViewed] = useState(() => getRecentlyViewed());

  /* Featured listings for "Nearby Stays" section */
  const { data: featuredListings = [] } = useQuery({
    queryKey: ["home-featured"],
    queryFn: () => listingsApi.searchListings({ lat: 26.8467, lng: 80.9462, radiusKm: 50 }).then((r) => r.data.slice(0, 4)),
    staleTime: 5 * 60 * 1000,
  });

  const onHeroSearch = (e) => {
    e.preventDefault();
    const q = heroQuery.trim();
    const p = new URLSearchParams();
    if (q) p.set("area", q);
    navigate(`/search${p.toString() ? `?${p}` : ""}`);
  };

  return (
    <div className="bg-cream">

      {/* ══ HERO ═══════════════════════════════════════════ */}
      <section className="relative grid overflow-hidden lg:grid-cols-[1.1fr_.9fr] lg:min-h-[90vh]">

        {/* Left — text */}
        <div className="relative motif-kolam px-5 pb-12 pt-10 sm:px-10 lg:pl-16 lg:pr-14 lg:py-24 flex flex-col justify-center">
          {/* Eyebrow */}
          <motion.div
            className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-800/15 bg-white px-3 py-1.5 text-[11px] sm:text-[12px] font-medium text-brand-800"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="relative inline-flex h-2 w-2">
              <span className="animate-pulse-ring absolute inset-0 rounded-full bg-accent-400/70" />
              <span className="relative h-2 w-2 rounded-full bg-accent-500" />
            </span>
            Stays &amp; ceremonies, without the scramble
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display mt-5 text-[42px] leading-[.95] text-brand-900 sm:text-[56px] lg:text-[72px]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          >
            Stay close <br /> to the{" "}
            <em className="text-accent-600">celebration.</em>
          </motion.h1>

          <motion.p
            className="mt-4 max-w-md text-[14px] sm:text-base leading-relaxed text-stone-600"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
          >
            Verified rooms &amp; homes within walking distance of any wedding, pooja, or family gathering —
            hosted by real neighbours.
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={onHeroSearch}
            className="mt-7 flex overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_16px_48px_-20px_rgba(15,45,30,.22)]"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
          >
            <label className="search-field flex-1 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-stone-400">Occasion / Venue</p>
              <input
                className="mt-1 w-full bg-transparent text-[13px] sm:text-[14px] font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
                placeholder="Sharma wedding, Jaipur"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
              />
            </label>
            <button type="submit" className="flex items-center justify-center gap-1.5 bg-brand-800 px-5 sm:px-7 text-[13px] sm:text-[14px] font-semibold text-white hover:bg-brand-900 transition-colors">
              <Search className="h-4 w-4" /> <span className="hidden sm:inline">Find my stay</span><span className="sm:hidden">Search</span>
            </button>
          </motion.form>

          {/* Occasion chips */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-stone-400 mb-3">Popular right now</p>
            <div className="chip-scroll flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
              {occasionChips.map(({ label, icon: Icon }) => (
                <Link key={label} to="/search" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-[13px] text-stone-700 transition-all hover:border-accent-400 hover:bg-amber-50">
                  <Icon className="h-3.5 w-3.5 text-accent-500" /> {label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            className="mt-10 chip-scroll flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          >
            {[
              { icon: ShieldCheck, text: "KYC-verified hosts" },
              { icon: MapPin,      text: "Walking distance" },
              { icon: Star,        text: "Real guest ratings" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-800/15 bg-white px-4 py-2 text-[13px] font-medium text-brand-800">
                <Icon className="h-4 w-4 text-accent-500" /> {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — hero image */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-6 overflow-hidden rounded-[24px] border border-brand-800/20">
            <img
              src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=900&q=85"
              alt="Warm and welcoming Indian home"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/10 to-transparent" />

            {/* Distance chip */}
            <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[12px] font-medium text-brand-800 shadow">
              <span className="h-2 w-2 rounded-full bg-accent-500" />
              Walking distance from venue
            </div>

            {/* Quote */}
            <div className="absolute top-6 left-6 max-w-[200px]">
              <p className="font-display italic text-accent-400 text-[17px] leading-tight">"Walked back home barefoot, mehendi still wet."</p>
              <p className="mt-2 text-[11px] text-white/80">— Priya, Udaipur wedding</p>
            </div>

            {/* Floating stay card */}
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/97 backdrop-blur p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=200&q=80" className="h-16 w-16 rounded-xl object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-500">Nearest stay</p>
                  <p className="mt-0.5 text-[14px] font-semibold text-stone-900 truncate">Sunita's Haveli</p>
                  <p className="text-[12px] text-stone-500">3 min walk to mandap</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-stone-600">
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-green-700"><ShieldCheck className="h-3 w-3" /> KYC verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ OCCASION HUB PROMO ════════════════════════════════ */}
      <section className="relative bg-brand-900 text-white px-5 py-12 overflow-hidden sm:px-10 lg:px-16 lg:py-16">
        <div className="absolute inset-0 motif-kolam-white opacity-40" />
        <div className="relative mx-auto max-w-5xl grid lg:grid-cols-[1.2fr_.8fr] gap-8 lg:gap-10 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-accent-500">Occasion Hub</p>
            <h2 className="mt-3 font-display text-[34px] leading-tight text-white sm:text-[40px] lg:text-[44px]">
              One link. <em className="text-accent-500">All your guests</em><br />
              find their stay.
            </h2>
            <p className="mt-4 max-w-md text-white/70 text-[14px] sm:text-[15px] leading-relaxed">
              Create an event hub in two minutes. Share one link on WhatsApp. Every guest sees
              verified stays ranked by walking distance from your venue — automatically.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/organizer/create" className="rounded-full bg-accent-500 text-brand-900 font-semibold px-6 py-3 text-[14px] hover:bg-accent-400 transition-colors active:scale-95">
                Create your Hub →
              </Link>
              <Link to="/about" className="text-[14px] text-white/80 underline-offset-4 hover:underline">
                See how it works
              </Link>
            </div>
          </div>

          {/* Sample hub card */}
          <div className="rounded-2xl bg-white text-stone-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[.22em] text-stone-400">Hub · Wedding</p>
                <p className="font-display text-[22px] text-brand-800">Sharma × Iyer</p>
              </div>
              <span className="gold-seal text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Live</span>
            </div>
            <div className="mt-4 rounded-xl bg-cream p-3 text-[12px] text-stone-500 font-mono break-all">
              hosttheguest.in/hub/sharma-iyer-2026
            </div>
            <div className="mt-4 space-y-3 text-[13px] text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-500" />
                All guests see verified stays ranked by distance
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-500" />
                Multiple venues linked · Guests auto-sorted
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                One link shared on WhatsApp — done
              </div>
            </div>
            <div className="mt-4 border-t border-stone-100 pt-3 text-[11px] text-stone-400">
              Hotel Clarks Amer · Jaipur · Example Hub
            </div>
          </div>
        </div>
      </section>

      {/* ══ NEARBY STAYS ════════════════════════════════════ */}
      {featuredListings.length > 0 && (
        <section className="bg-cream py-14 sm:px-10 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-6 mb-6 px-5 sm:px-0">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-stone-400">Hand-picked</p>
                <h2 className="mt-2 font-display text-[32px] leading-tight text-brand-900 sm:text-[40px]">
                  Stays <em className="text-accent-600">near your event</em>
                </h2>
              </div>
              <Link to="/search" className="shrink-0 flex items-center gap-2 rounded-full border border-brand-700 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Mobile: horizontal scroll. Desktop: grid */}
            <div className="flex gap-5 overflow-x-auto pb-4 px-5 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 [-webkit-overflow-scrolling:touch]">
              {featuredListings.map((listing) => (
                <div key={listing._id} className="w-[78vw] shrink-0 sm:w-auto">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="bg-white px-5 py-14 sm:px-10 lg:px-16 lg:py-20 border-t border-stone-100">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-xl mb-10 lg:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-stone-400">The flow</p>
            <h2 className="mt-2 font-display text-[32px] sm:text-[40px] text-brand-900">Built for the way India celebrates.</h2>
          </div>
          <div className="grid gap-8 sm:gap-10 md:grid-cols-3">
            {[
              { n: "01", title: "Organizer opens the Hub.", body: "Add the venue, pick your dates, share one WhatsApp link. Your guests have somewhere to land before the first baraat drum." },
              { n: "02", title: "Neighbours list their rooms.", body: "Every host Aadhaar-verified. A spare floor or a whole haveli — they set the price, keep the earnings, meet the guests." },
              { n: "03", title: "Guests walk to the venue.", body: "Book in ninety seconds. Pay once through Razorpay. Sleep five hundred metres from the mandap, not fifty." },
            ].map(({ n, title, body }) => (
              <motion.article
                key={n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.5 }}
                className="group flex gap-5 md:block"
              >
                <p className="font-display text-[64px] sm:text-[90px] leading-[.85] text-brand-800/90 group-hover:text-accent-500 transition-colors shrink-0 md:shrink">{n}</p>
                <div className="flex-1 md:block">
                  <div className="goldrule mt-1 mb-4 w-12 md:mt-4 md:mb-5 md:w-16" />
                  <h3 className="font-display text-[20px] sm:text-[22px] text-brand-900">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-stone-600">{body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RECENTLY VIEWED ════════════════════════════════ */}
      {recentlyViewed.length > 0 && (
        <section className="bg-cream py-12 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <motion.div className="mb-6 flex items-center gap-2 px-5 sm:px-0" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <Clock className="h-5 w-5 text-brand-600" />
              <h2 className="text-xl font-bold text-brand-900">Recently viewed</h2>
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-4 px-5 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 [-webkit-overflow-scrolling:touch]">
              {recentlyViewed.map((listing) => (
                <div key={listing._id} className="w-[78vw] shrink-0 sm:w-auto">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ MAP EXPLORER ════════════════════════════════════ */}
      <HomeMapSection />

      {/* ══ FOR HOSTS ═══════════════════════════════════════ */}
      <section className="relative bg-brand-800 text-white px-5 py-14 overflow-hidden sm:px-10 lg:px-16 lg:py-20">
        <div className="absolute inset-0 motif-kolam-white opacity-30" />
        <div className="relative mx-auto max-w-5xl grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-accent-500">For Homeowners</p>
            <h2 className="mt-3 font-display text-[38px] leading-[1] sm:text-[48px] lg:text-[52px]">
              A spare room is<br /> a <em className="text-accent-500">small dowry</em>.
            </h2>
            <p className="mt-5 max-w-md text-white/75 text-[14px] sm:text-[15px] leading-relaxed">
              During local weddings and poojas, hotel rates climb while families scramble.
              Open your home. Set your price. Meet the cousin-of-a-cousin.
            </p>
            <ul className="mt-6 space-y-3 text-[14px] text-white/80">
              {[
                "Aadhaar-verified guests only — no strangers-off-the-street",
                "Instant Razorpay payouts — T+1 to your bank",
                "Block dates for your own family any time",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-5 w-5 mt-0.5 shrink-0 text-accent-500" /> {item}
                </li>
              ))}
            </ul>
            <Link to="/host/listings/new" className="mt-8 inline-block rounded-full bg-accent-500 text-brand-900 font-semibold px-7 py-3.5 text-[14px] hover:bg-accent-400 transition-colors active:scale-95">
              List your space →
            </Link>

            {/* Mobile testimonial */}
            <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4 lg:hidden">
              <p className="font-display italic text-[17px] leading-snug text-white">"In one wedding week, I earned what my son sent home in six months."</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center text-[11px] font-semibold text-white">KD</div>
                <div>
                  <p className="text-[12px] font-semibold text-white">Kamla Devi</p>
                  <p className="text-[11px] text-white/60">Host in Jaipur · 47 stays</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img
              src="https://images.pexels.com/photos/33452539/pexels-photo-33452539.jpeg?auto=compress&cs=tinysrgb&w=800&q=85"
              className="rounded-3xl aspect-[4/5] w-full object-cover"
              alt="Host"
            />
            {/* Testimonial */}
            <div className="absolute -bottom-8 -left-8 max-w-[260px] rounded-2xl bg-white text-stone-900 p-5 shadow-2xl">
              <p className="font-display italic text-[18px] leading-snug text-brand-900">"In one wedding week, I earned what my son sent home in six months."</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-stone-200 grid place-items-center text-[11px] font-semibold text-stone-600">KD</div>
                <div>
                  <p className="text-[12px] font-semibold">Kamla Devi</p>
                  <p className="text-[11px] text-stone-500">Host in Jaipur · 47 stays</p>
                </div>
              </div>
            </div>
            {/* Stat badge */}
            <div className="absolute top-6 right-6 rounded-full bg-white/95 px-4 py-2.5 shadow">
              <p className="text-[10px] uppercase tracking-[.2em] text-stone-500">Payout</p>
              <p className="text-[13px] font-semibold text-brand-800">Instant · T+1 to bank</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
