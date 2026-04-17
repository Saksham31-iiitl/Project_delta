import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as listingsApi from "@api/listings.api.js";
import { ListingCard } from "@components/listings/ListingCard.jsx";
import { ListingCardSkeleton } from "@components/common/ListingCardSkeleton.jsx";
import { FilterBar } from "@components/search/FilterBar.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { searchAreaWithinRadius } from "@utils/format.js";
import { HelpCircle, MapPin, Search } from "lucide-react";

const JAIPUR = { lat: 26.9124, lng: 75.7873 };

const SORTS = [
  { id: "distance", label: "Distance" },
  { id: "price_asc", label: "Price (low to high)" },
  { id: "price_desc", label: "Price (high to low)" },
  { id: "rating", label: "Rating" },
];

function sortListings(listings, sortId) {
  const arr = [...listings];
  switch (sortId) {
    case "price_asc":
      return arr.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
    case "price_desc":
      return arr.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
    case "rating":
      return arr.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    case "distance":
    default:
      return arr.sort((a, b) => (a.distanceKm ?? 9e9) - (b.distanceKm ?? 9e9));
  }
}

function SearchContent({ isLoaded, mapsEnabled }) {
  const [params, setParams] = useSearchParams();
  const lat = Number(params.get("lat")) || JAIPUR.lat;
  const lng = Number(params.get("lng")) || JAIPUR.lng;
  const radiusKm = Number(params.get("radiusKm")) || 2;
  const type = params.get("type") || "";
  const areaLabel = params.get("area") || "";
  const sortId = params.get("sort") || "distance";

  const [manualInput, setManualInput] = useState(areaLabel);

  useEffect(() => {
    setManualInput(areaLabel);
  }, [areaLabel]);

  const setCenter = useCallback(
    (nextLat, nextLng, nextArea) => {
      const p = new URLSearchParams(params);
      p.set("lat", String(nextLat));
      p.set("lng", String(nextLng));
      if (nextArea) p.set("area", nextArea);
      setParams(p, { replace: true });
    },
    [params, setParams]
  );

  const acRef = useRef(null);

  const qParams = useMemo(() => ({ lat, lng, radiusKm, ...(type ? { type } : {}) }), [lat, lng, radiusKm, type]);

  const { data: listings = [], isPending, isError } = useQuery({
    queryKey: ["listings-search", qParams],
    queryFn: () => listingsApi.searchListings(qParams).then((r) => r.data),
  });

  const sortedListings = useMemo(() => sortListings(listings, sortId), [listings, sortId]);

  const onPlaceChanged = () => {
    const place = acRef.current?.getPlace?.();
    const loc = place?.geometry?.location;
    if (!loc) return;
    const label =
      place.formatted_address ||
      [place.name, place.vicinity].filter(Boolean).join(", ") ||
      "";
    setCenter(loc.lat(), loc.lng(), label);
  };

  const onManualSubmit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(params);
    const label = manualInput.trim();
    if (label) p.set("area", label);
    else p.delete("area");
    setParams(p, { replace: true });
  };

  const onTypeChange = (t) => {
    const p = new URLSearchParams(params);
    if (t) p.set("type", t);
    else p.delete("type");
    setParams(p, { replace: true });
  };

  const onSortChange = (e) => {
    const p = new URLSearchParams(params);
    const v = e.target.value;
    if (v === "distance") p.delete("sort");
    else p.set("sort", v);
    setParams(p, { replace: true });
  };

  const metaLine = searchAreaWithinRadius(areaLabel, radiusKm);

  return (
    <PageWrapper className="pb-28">
      <motion.div
        className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-2">
          <Search className="mt-2.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden />
          <div className="min-w-0 flex-1">
            {mapsEnabled && isLoaded ? (
              <Autocomplete onLoad={(ac) => (acRef.current = ac)} onPlaceChanged={onPlaceChanged}>
                <input
                  className="w-full border-0 bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0"
                  placeholder="Search venue or area"
                  aria-label="Search location"
                  defaultValue={areaLabel}
                  key={areaLabel || "empty"}
                />
              </Autocomplete>
            ) : (
              <form onSubmit={onManualSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0"
                  placeholder="Enter area or landmark name"
                  aria-label="Area or landmark"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-press shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Search
                </button>
              </form>
            )}
            <p className="mt-1 text-xs text-stone-400">{metaLine}</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-2 flex items-center gap-1 text-xs text-stone-400" title="Interactive map with pins is coming soon.">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>List view · Map view coming soon</span>
        <HelpCircle className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
      </div>

      <FilterBar className="mt-3" type={type} onTypeChange={onTypeChange} />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p className="text-sm text-stone-600">
          {isPending ? (
            "Searching…"
          ) : (
            <>
              <span className="font-semibold text-stone-900">{listings.length}</span> stays within {radiusKm} km
            </>
          )}
        </p>
        <label className="flex flex-wrap items-center gap-1 text-[13px] text-stone-500">
          <span className="whitespace-nowrap">Sort by:</span>
          <select
            value={sortId}
            onChange={onSortChange}
            className="max-w-[200px] cursor-pointer border-0 bg-transparent font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 focus:outline-none focus:ring-0"
            aria-label="Sort results"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isError ? <p className="mt-2 text-sm text-red-600">Could not load listings.</p> : null}
      <motion.div
        className="mt-3 flex flex-col gap-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {isPending
          ? [1, 2, 3].map((i) => <ListingCardSkeleton key={i} horizontal />)
          : sortedListings.map((l) => <ListingCard key={l._id} listing={l} variant="horizontal" />)}
      </motion.div>
    </PageWrapper>
  );
}

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
