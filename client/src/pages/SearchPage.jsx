import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as listingsApi from "@api/listings.api.js";
import { ListingCard } from "@components/listings/ListingCard.jsx";
import { ListingCardSkeleton } from "@components/common/ListingCardSkeleton.jsx";
import { FilterBar } from "@components/search/FilterBar.jsx";
import { MapView } from "@components/search/MapView.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { searchAreaWithinRadius, formatPricePerNight, listingDisplayTitle, listingLocationLine } from "@utils/format.js";
import { Bath, Bed, List, Map, MapPin, Search, X } from "lucide-react";

const JAIPUR = { lat: 26.9124, lng: 75.7873 };

const SORTS = [
  { id: "distance",   label: "Distance" },
  { id: "price_asc",  label: "Price ↑" },
  { id: "price_desc", label: "Price ↓" },
  { id: "rating",     label: "Rating" },
];

function sortListings(listings, sortId) {
  const arr = [...listings];
  switch (sortId) {
    case "price_asc":  return arr.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
    case "price_desc": return arr.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
    case "rating":     return arr.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    default:           return arr.sort((a, b) => (a.distanceKm ?? 9e9) - (b.distanceKm ?? 9e9));
  }
}

/* ── Mini popup card shown when a map pin is clicked ──── */
function MapPopup({ listing, onClose }) {
  if (!listing) return null;
  const title   = listingDisplayTitle(listing);
  const locLine = listingLocationLine(listing);
  return (
    <AnimatePresence>
      <motion.div
        key={listing._id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22 }}
        className="absolute bottom-4 left-1/2 z-20 w-[min(92%,340px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow hover:bg-stone-100"
        >
          <X className="h-4 w-4" />
        </button>
        {listing.photos?.[0] && (
          <img
            src={listing.photos[0]}
            alt={title}
            className="h-32 w-full object-cover"
          />
        )}
        <div className="p-3">
          <p className="text-xs font-semibold capitalize text-brand-700">{listing.type}</p>
          <p className="mt-0.5 truncate text-sm font-bold text-stone-900">{title}</p>
          {locLine && <p className="mt-0.5 truncate text-xs text-stone-500">{locLine}</p>}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              {listing.beds      && <span className="flex items-center gap-1"><Bed  className="h-3 w-3" />{listing.beds}</span>}
              {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
            </div>
            <p className="text-sm font-bold text-brand-700">
              {formatPricePerNight(listing.pricePerNight)}
            </p>
          </div>
          <Link
            to={`/listings/${listing._id}`}
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            View listing →
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main search content ────────────────────────────────── */
function SearchContent({ isLoaded, mapsEnabled }) {
  const [params, setParams] = useSearchParams();
  const lat      = Number(params.get("lat"))      || JAIPUR.lat;
  const lng      = Number(params.get("lng"))      || JAIPUR.lng;
  const radiusKm = Number(params.get("radiusKm")) || 2;
  const type     = params.get("type") || "";
  const areaLabel = params.get("area") || "";
  const sortId   = params.get("sort") || "distance";

  const [manualInput, setManualInput] = useState(areaLabel);
  const [mobileView, setMobileView]   = useState("list");
  const [selected, setSelected]       = useState(null);
  // mapCenter is LOCAL state — driven by user searches, NOT URL params
  // This prevents @react-google-maps re-calling setCenter on every re-render
  const [mapCenter, setMapCenter] = useState({ lat, lng });
  const cardRefs  = useRef({});
  const acRef     = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
  setMapCenter({ lat, lng });
}, [lat, lng]);

  useEffect(() => { setManualInput(areaLabel); }, [areaLabel]);

  // Move map + update URL params for search query
  const goToLocation = useCallback((newLat, newLng, label) => {
    const newCenter = { lat: Number(newLat), lng: Number(newLng) };
    setMapCenter(newCenter);        // drives MapView center prop immediately
    setSelected(null);
    const p = new URLSearchParams(params);
    p.set("lat", String(newLat));
    p.set("lng", String(newLng));
    if (label) p.set("area", label); else p.delete("area");
    setParams(p, { replace: true });
  }, [params, setParams]);

  const qParams = useMemo(
    () => ({ lat, lng, radiusKm, ...(type ? { type } : {}) }),
    [lat, lng, radiusKm, type]
  );

  const { data: listings = [], isPending, isError } = useQuery({
    queryKey: ["listings-search", qParams],
    queryFn: () => listingsApi.searchListings(qParams).then((r) => r.data),
  });

  const sortedListings = useMemo(() => sortListings(listings, sortId), [listings, sortId]);

  // Called when user picks from autocomplete dropdown
  const onPlaceChanged = () => {
    const place = acRef.current?.getPlace?.();
    const loc   = place?.geometry?.location;
    if (!loc) return;
    const label = place.formatted_address
      || [place.name, place.vicinity].filter(Boolean).join(", ")
      || "";
    goToLocation(loc.lat(), loc.lng(), label);
  };

  // Geocode whatever text is in the input (for Enter / Search button)
  const geocodeInput = () => {
    const text = manualInput.trim();
    if (!text || typeof window.google === "undefined") return;
    new window.google.maps.Geocoder().geocode(
      { address: text + ", India" },
      (results, status) => {
        if (status === "OK" && results[0]) {
          const loc   = results[0].geometry.location;
          const label = results[0].formatted_address || text;
          goToLocation(loc.lat(), loc.lng(), label);
        }
      }
    );
  };

  const onManualSubmit = (e) => {
    e.preventDefault();
    if (mapsEnabled && isLoaded) { geocodeInput(); return; }
    const p = new URLSearchParams(params);
    const label = manualInput.trim();
    if (label) p.set("area", label); else p.delete("area");
    setParams(p, { replace: true });
  };

  const onTypeChange = (t) => {
    const p = new URLSearchParams(params);
    if (t) p.set("type", t); else p.delete("type");
    setParams(p, { replace: true });
  };

  const onSortChange = (e) => {
    const p = new URLSearchParams(params);
    const v = e.target.value;
    if (v === "distance") p.delete("sort"); else p.set("sort", v);
    setParams(p, { replace: true });
  };

  const handlePinClick = (listing) => {
    setSelected(listing);
    // On desktop, scroll the card into view
    const el = cardRefs.current[listing._id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const metaLine = searchAreaWithinRadius(areaLabel, radiusKm);
  const showMap  = mapsEnabled && isLoaded;

  /* ── Search bar ─────────────────────────────────────── */
  const SearchBar = (
    <motion.div
      className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <Search className="mt-2.5 h-4 w-4 shrink-0 text-stone-400" />
        <div className="min-w-0 flex-1">
          {mapsEnabled && isLoaded ? (
            <div className="flex items-center gap-2">
              <Autocomplete
                onLoad={(ac) => (acRef.current = ac)}
                onPlaceChanged={onPlaceChanged}
                className="min-w-0 flex-1"
              >
                <input
                  ref={inputRef}
                  className="w-full border-0 bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
                  placeholder="Search city, area or venue…"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); geocodeInput(); } }}
                />
              </Autocomplete>
              <button
                type="button"
                onClick={geocodeInput}
                className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Go
              </button>
            </div>
          ) : (
            <form onSubmit={onManualSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
                placeholder="Enter area or landmark name"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                Search
              </button>
            </form>
          )}
          <p className="mt-1 text-xs text-stone-400">{metaLine}</p>
        </div>
      </div>
    </motion.div>
  );

  /* ── Controls row ───────────────────────────────────── */
  const Controls = (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-stone-600">
        {isPending ? "Searching…" : (
          <><span className="font-semibold text-stone-900">{listings.length}</span> stays within {radiusKm} km</>
        )}
      </p>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-[13px] text-stone-500">
          Sort:
          <select
            value={sortId}
            onChange={onSortChange}
            className="cursor-pointer border-0 bg-transparent font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 focus:outline-none"
          >
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
    </div>
  );

  /* ── Listing cards ──────────────────────────────────── */
  const Cards = (
    <motion.div
      className="mt-3 flex flex-col gap-2"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {isPending
        ? [1, 2, 3].map((i) => <ListingCardSkeleton key={i} horizontal />)
        : sortedListings.map((l) => (
            <div
              key={l._id}
              ref={(el) => (cardRefs.current[l._id] = el)}
              className={`rounded-2xl transition-all duration-200 ${
                selected?._id === l._id ? "ring-2 ring-brand-500 ring-offset-1" : ""
              }`}
              onClick={() => setSelected(l)}
            >
              <ListingCard listing={l} variant="horizontal" />
            </div>
          ))}
    </motion.div>
  );

  /* ── Map panel ──────────────────────────────────────── */
  const MapPanel = (
    <div className="relative h-full w-full">
      {showMap ? (
        <MapView
          center={mapCenter}
          listings={sortedListings}
          radiusKm={radiusKm}
          isLoaded={isLoaded}
          selectedId={selected?._id}
          onListingClick={handlePinClick}
          searchPin={!!areaLabel}
        />
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl bg-stone-100 text-sm text-stone-400">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-stone-300" />
            <p>Map unavailable</p>
            <p className="mt-1 text-xs">Set VITE_GOOGLE_MAPS_API_KEY to enable</p>
          </div>
        </div>
      )}
      <MapPopup listing={selected} onClose={() => setSelected(null)} />
    </div>
  );

  /* ── DESKTOP layout (lg+): side by side ─────────────── */
  /* ── MOBILE layout: toggle list / map ───────────────── */
  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden lg:flex lg:h-[calc(100vh-64px)] lg:gap-4 lg:px-6 lg:py-4">
        {/* Left — scrollable listing panel */}
        <div className="flex w-[420px] shrink-0 flex-col overflow-y-auto">
          {SearchBar}
          <FilterBar className="mt-3" type={type} onTypeChange={onTypeChange} />
          {Controls}
          {isError && <p className="mt-2 text-sm text-red-600">Could not load listings.</p>}
          {Cards}
          <div className="h-6 shrink-0" />
        </div>

        {/* Right — sticky map */}
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          {MapPanel}
        </div>
      </div>

      {/* ── Mobile / tablet ── */}
      <div className="lg:hidden">
        <PageWrapper className="pb-28">
          {SearchBar}
          <FilterBar className="mt-3" type={type} onTypeChange={onTypeChange} />
          {Controls}
          {isError && <p className="mt-2 text-sm text-red-600">Could not load listings.</p>}

          {mobileView === "list" ? (
            Cards
          ) : (
            /* Full-height map on mobile */
            <div className="relative mt-3 h-[calc(100vh-280px)] overflow-hidden rounded-2xl border border-stone-200">
              {MapPanel}
            </div>
          )}
        </PageWrapper>

        {/* Floating toggle button */}
        <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2">
          <button
            type="button"
            onClick={() => { setMobileView((v) => v === "list" ? "map" : "list"); setSelected(null); }}
            className="flex items-center gap-2 rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-brand-700 active:scale-95 transition-transform"
          >
            {mobileView === "list"
              ? <><Map  className="h-4 w-4" /> Show map</>
              : <><List className="h-4 w-4" /> Show list</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Maps loader wrapper ───────────────────────────────── */
function SearchWithMaps() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "nearbystay-map",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  if (loadError) return <SearchContent isLoaded={false} mapsEnabled={false} />;
  return <SearchContent isLoaded={isLoaded} mapsEnabled />;
}

export default function SearchPage() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return <SearchContent isLoaded={false} mapsEnabled={false} />;
  return <SearchWithMaps />;
}
