import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as listingsApi from "@api/listings.api.js";
import { ListingCard } from "@components/listings/ListingCard.jsx";
import { ListingCardSkeleton } from "@components/common/ListingCardSkeleton.jsx";
import { MapView } from "@components/search/MapView.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { searchAreaWithinRadius, formatPricePerNight, listingDisplayTitle, listingLocationLine } from "@utils/format.js";
import { Bath, Bed, List, Map, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@utils/cn.js";

const JAIPUR = { lat: 26.9124, lng: 75.7873 };

const EVENT_MATCHERS = {
  under4k:    (l) => (l.pricePerNight ?? 9999) < 4000,
  lawn:       (l) => l.amenities?.some((a) => /lawn|garden|open|outdoor/i.test(a)),
  power:      (l) => l.amenities?.some((a) => /power|generator|backup/i.test(a)),
  large:      (l) => (l.maxGuests ?? 0) >= 50,
  vegkitchen: (l) => l.amenities?.some((a) => /veg|kitchen/i.test(a)),
  womensafe:  (l) => !!l.womenSafe,
  elder:      (l) => !!l.elderFriendly,
};

const FILTER_CHIPS = [
  { id: "under4k",    label: "Under ₹4,000" },
  { id: "womensafe",  label: "Women safe" },
  { id: "elder",      label: "Elder friendly" },
  { id: "lawn",       label: "Lawn / Open space" },
  { id: "power",      label: "Power backup" },
  { id: "large",      label: "50+ guests" },
  { id: "vegkitchen", label: "Veg kitchen" },
];

const TYPES = [
  { id: "",          label: "All" },
  { id: "room",      label: "Room" },
  { id: "floor",     label: "Floor" },
  { id: "home",      label: "Home" },
  { id: "suite",     label: "Suite" },
  { id: "farmhouse", label: "Farmhouse" },
];

const SORTS = [
  { id: "distance",   label: "Walking distance" },
  { id: "price_asc",  label: "Price — low to high" },
  { id: "price_desc", label: "Price — high to low" },
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

/* ── Map popup ────────────────────────────────────────────── */
function MapPopup({ listing, onClose }) {
  if (!listing) return null;
  const title   = listingDisplayTitle(listing);
  const locLine = listingLocationLine(listing);
  return (
    <AnimatePresence>
      <motion.div
        key={listing._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-14 left-1/2 z-20 w-[min(90%,320px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow hover:bg-stone-100"
        >
          <X className="h-4 w-4" />
        </button>
        {listing.photos?.[0] && <img src={listing.photos[0]} alt={title} className="h-28 w-full object-cover" />}
        <div className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">{listing.type}</p>
          <p className="mt-0.5 truncate text-sm font-bold text-stone-900">{title}</p>
          {locLine && <p className="mt-0.5 truncate text-xs text-stone-500">{locLine}</p>}
          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-sm font-semibold text-brand-800">{formatPricePerNight(listing.pricePerNight)}</p>
            <p className="text-[12px] text-stone-600"><span className="text-[#eab308]">★</span> {listing.avgRating?.toFixed(1) || "—"}</p>
          </div>
          <Link to={`/listings/${listing._id}`} className="mt-2.5 flex w-full items-center justify-center rounded-xl bg-brand-700 py-2 text-xs font-semibold text-white hover:bg-brand-800">
            View listing →
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main search content ──────────────────────────────────── */
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
  const [mapOpen, setMapOpen]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [eventFilters, setEventFilters] = useState(new Set());
  const [mapCenter, setMapCenter]     = useState({ lat, lng });

  const acRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setMapCenter({ lat, lng }); }, [lat, lng]);
  useEffect(() => { setManualInput(areaLabel); }, [areaLabel]);

  const goToLocation = useCallback((newLat, newLng, label) => {
    setMapCenter({ lat: Number(newLat), lng: Number(newLng) });
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

  const filteredListings = useMemo(() => {
    if (eventFilters.size === 0) return sortedListings;
    return sortedListings.filter((l) =>
      [...eventFilters].every((f) => EVENT_MATCHERS[f]?.(l) ?? true)
    );
  }, [sortedListings, eventFilters]);

  const onEventFilterToggle = useCallback((id) => {
    setEventFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const onPlaceChanged = () => {
    const place = acRef.current?.getPlace?.();
    const loc   = place?.geometry?.location;
    if (!loc) return;
    const label = place.formatted_address || place.name || "";
    goToLocation(loc.lat(), loc.lng(), label);
  };

  const geocodeInput = () => {
    const text = manualInput.trim();
    if (!text || typeof window.google === "undefined") return;
    new window.google.maps.Geocoder().geocode({ address: text + ", India" }, (results, status) => {
      if (status === "OK" && results[0]) {
        goToLocation(results[0].geometry.location.lat(), results[0].geometry.location.lng(), results[0].formatted_address || text);
      }
    });
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

  const showMap = mapsEnabled && isLoaded;
  const activeFilterCount = eventFilters.size + (type ? 1 : 0);

  /* ── DESKTOP ── */
  return (
    <>
      {/* ─── DESKTOP ────────────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-col lg:h-[calc(100vh-68px)]">

        {/* Sticky search + filter bar */}
        <div className="sticky top-0 z-20 border-b border-stone-200 bg-white">
          {/* Search pill row */}
          <div className="flex items-center gap-3 px-8 py-3">
            {/* Pill search */}
            <div className="flex flex-1 items-center divide-x divide-stone-200 overflow-hidden rounded-full border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-1 items-center gap-2 px-4 py-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-700" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-stone-400">Where</p>
                  {mapsEnabled && isLoaded ? (
                    <Autocomplete onLoad={(ac) => (acRef.current = ac)} onPlaceChanged={onPlaceChanged}>
                      <input
                        ref={inputRef}
                        className="w-full bg-transparent text-[13px] font-semibold text-brand-900 placeholder:text-stone-400 focus:outline-none"
                        placeholder="City, area or venue…"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); geocodeInput(); } }}
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      ref={inputRef}
                      className="w-full bg-transparent text-[13px] font-semibold text-brand-900 placeholder:text-stone-400 focus:outline-none"
                      placeholder="City, area or venue…"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") geocodeInput(); }}
                    />
                  )}
                </div>
              </div>
              <div className="hidden px-4 py-2 sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-stone-400">Radius</p>
                <p className="text-[13px] font-semibold text-brand-900">{radiusKm} km</p>
              </div>
              <button
                type="button"
                onClick={geocodeInput}
                className="m-1 rounded-full bg-brand-800 p-2.5 text-white hover:bg-brand-900 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Map toggle */}
            <button
              type="button"
              onClick={() => setMapOpen((o) => !o)}
              className="shrink-0 inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-[13px] font-medium text-stone-700 hover:border-brand-700 transition-colors"
            >
              <Map className="h-4 w-4" />
              {mapOpen ? "Hide map" : "Show map"}
            </button>
          </div>

          {/* Filter chips row */}
          <div className="flex items-center gap-2 overflow-x-auto chip-scroll px-8 pb-3">
            {/* All filters pill */}
            <button
              type="button"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-brand-900 px-4 py-1.5 text-[13px] font-medium text-white"
            >
              <SlidersHorizontal className="h-4 w-4" />
              All filters
              {activeFilterCount > 0 && (
                <span className="font-bold text-accent-400">{activeFilterCount}</span>
              )}
            </button>
            <div className="h-5 w-px shrink-0 bg-stone-200" />

            {/* Type segmented control */}
            <div className="shrink-0 inline-flex rounded-full border border-stone-200 p-1 text-[12px]">
              {TYPES.map((t) => (
                <button
                  key={t.id || "all"}
                  type="button"
                  onClick={() => onTypeChange(t.id)}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    type === t.id
                      ? "bg-cream font-semibold text-brand-800"
                      : "text-stone-600 hover:text-stone-800"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Feature chips */}
            {FILTER_CHIPS.map((chip) => {
              const active = eventFilters.has(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onEventFilterToggle(chip.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all",
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

        {/* Body: results + map rail */}
        <div className={cn(
          "flex flex-1 overflow-hidden",
          mapOpen ? "grid grid-cols-[minmax(0,1fr)_420px]" : ""
        )}>

          {/* Results column */}
          <div className="min-w-0 overflow-y-auto px-8 py-6">
            {/* Count + sort */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-[24px] leading-none text-brand-900">
                  {isPending ? "Searching…" : `${filteredListings.length} stays${areaLabel ? ` in ${areaLabel}` : ""}`}
                </p>
                <p className="mt-1 text-[12px] text-stone-500">Within {radiusKm} km{areaLabel ? ` of ${areaLabel}` : ""}</p>
              </div>
              <label className="inline-flex items-center gap-2 text-[13px] text-stone-500">
                Sort
                <select
                  value={sortId}
                  onChange={onSortChange}
                  className="bg-transparent font-medium text-brand-700 underline decoration-accent-500 underline-offset-4 focus:outline-none"
                >
                  {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
            </div>

            {isError && <p className="mb-4 text-sm text-red-600">Could not load listings.</p>}

            {/* Cards grid */}
            <motion.div
              className={cn(
                "grid gap-5",
                mapOpen ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              {isPending
                ? [1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)
                : filteredListings.map((l) => (
                    <motion.div
                      key={l._id}
                      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                      className={cn(selected?._id === l._id && "ring-2 ring-brand-500 ring-offset-2 rounded-[18px]")}
                      onClick={() => setSelected(l)}
                    >
                      <ListingCard listing={l} />
                    </motion.div>
                  ))
              }
            </motion.div>

            <div className="h-10" />
          </div>

          {/* Right-rail sticky map */}
          {mapOpen && (
            <aside className="relative border-l border-stone-200 bg-brand-50">
              <div className="sticky top-0 h-[calc(100vh-130px)]">
                {showMap ? (
                  <>
                    <MapView
                      center={mapCenter}
                      listings={filteredListings}
                      radiusKm={radiusKm}
                      isLoaded={isLoaded}
                      selectedId={selected?._id}
                      onListingClick={setSelected}
                      searchPin={!!areaLabel}
                    />
                    <MapPopup listing={selected} onClose={() => setSelected(null)} />
                    {/* Showing pill */}
                    {filteredListings.length > 0 && (
                      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
                        <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium shadow">
                          <span className="h-2 w-2 rounded-full bg-accent-500" />
                          Showing {filteredListings.length} stays on map
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
                    <MapPin className="h-8 w-8" />
                    <p className="text-[13px]">Map unavailable</p>
                    <p className="text-xs">Set VITE_GOOGLE_MAPS_API_KEY to enable</p>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ─── MOBILE ─────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col min-h-[calc(100vh-68px)]">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-cream border-b border-stone-200 px-4 pt-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 rounded-full bg-white border border-stone-200 px-3 py-2 flex items-center gap-2 shadow-sm">
              <MapPin className="h-4 w-4 text-brand-800 shrink-0" />
              <div className="min-w-0 flex-1">
                <input
                  className="w-full bg-transparent text-[13px] font-semibold text-brand-900 placeholder:text-stone-400 focus:outline-none leading-tight"
                  placeholder="City, area or venue…"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") geocodeInput(); }}
                />
                {areaLabel && <p className="text-[10px] text-stone-500 leading-tight truncate">{radiusKm} km radius</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={geocodeInput}
              className="w-10 h-10 rounded-full bg-brand-800 text-white grid place-items-center shrink-0 active:scale-95 transition-transform"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto chip-scroll pt-3 -mx-1 px-1">
            {TYPES.filter((t) => t.id !== "").map((t) => {
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTypeChange(active ? "" : t.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                    active
                      ? "border-brand-700 bg-brand-50 text-brand-800"
                      : "border-stone-200 bg-white text-stone-700"
                  )}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shrink-0" />}
                  {t.label}
                </button>
              );
            })}
            {FILTER_CHIPS.map((chip) => {
              const active = eventFilters.has(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onEventFilterToggle(chip.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-all",
                    active
                      ? "border-brand-700 bg-brand-50 font-semibold text-brand-800"
                      : "border-stone-200 bg-white text-stone-600"
                  )}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shrink-0" />}
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Count + sort */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <p className="font-display text-[18px] text-brand-900 leading-tight">
            {isPending ? "Searching…" : `${filteredListings.length} stays found`}
          </p>
          <select
            value={sortId}
            onChange={onSortChange}
            className="bg-transparent text-[11px] font-semibold text-brand-700 underline decoration-accent-500 underline-offset-4 focus:outline-none"
          >
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {isError && <p className="px-5 mb-3 text-sm text-red-600">Could not load listings.</p>}

        {mobileView === "list" ? (
          <div className="flex-1 px-4 pb-28 space-y-4">
            {isPending
              ? [1, 2, 3].map((i) => <ListingCardSkeleton key={i} />)
              : filteredListings.map((l) => <ListingCard key={l._id} listing={l} variant="mobile-search" />)
            }
          </div>
        ) : (
          <div className="flex-1 relative overflow-hidden">
            {showMap ? (
              <>
                <MapView center={mapCenter} listings={filteredListings} radiusKm={radiusKm} isLoaded={isLoaded} selectedId={selected?._id} onListingClick={setSelected} searchPin={!!areaLabel} />
                <MapPopup listing={selected} onClose={() => setSelected(null)} />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400 text-sm">Map unavailable</div>
            )}
          </div>
        )}

        {/* Floating Map FAB */}
        <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2">
          <button
            type="button"
            onClick={() => { setMobileView((v) => v === "list" ? "map" : "list"); setSelected(null); }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-900 text-white px-5 py-3 shadow-xl text-[13px] font-semibold active:scale-95 transition-transform"
          >
            {mobileView === "list"
              ? <><Map className="h-4 w-4" /> Map</>
              : <><List className="h-4 w-4" /> List</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Maps loader wrapper ───────────────────────────────────── */
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
