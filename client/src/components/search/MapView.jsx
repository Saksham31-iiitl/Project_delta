import { Circle, GoogleMap, Marker } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { formatCompactInr } from "@utils/format.js";

const DEFAULT_CENTER = { lat: 26.9124, lng: 75.7873 }; // Jaipur fallback

const MAP_STYLES = [
  { featureType: "poi",     stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export function MapView({
  center,
  listings = [],
  venue,
  radiusKm = 2,
  isLoaded,
  selectedId,
  onListingClick,
  searchPin = false,
}) {
  const mapRef        = useRef(null);
  const pendingCenter = useRef(null); // stores panTo target if map not loaded yet

  const resolvedCenter =
  center?.lat != null && center?.lng != null
    ? center
    : DEFAULT_CENTER;

  const options = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    styles: MAP_STYLES,
  }), []);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    // Apply any panTo that was requested before the map was ready
    if (pendingCenter.current) {
      map.panTo(pendingCenter.current);
      pendingCenter.current = null;
    }
  }, []);

  // Pan whenever center prop changes
  useEffect(() => {
    if (!resolvedCenter.lat || !resolvedCenter.lng) return;
    if (mapRef.current) {
      mapRef.current.panTo(resolvedCenter);
    } else {
      // Map not loaded yet — store so onLoad can apply it
      pendingCenter.current = resolvedCenter;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedCenter.lat, resolvedCenter.lng]);

  if (!isLoaded) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-stone-100 text-sm text-stone-400">
        Loading map…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="h-full w-full rounded-xl"
      center={resolvedCenter}
      zoom={13}
      options={options}
      onLoad={onLoad}
    >
      {searchPin && (
        <Marker
          position={resolvedCenter}
          zIndex={15}
          icon={{
            url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 26 16 26S32 29 32 16C32 7.163 24.837 0 16 0z" fill="%233b82f6" stroke="%23ffffff" stroke-width="2.5"/><circle cx="16" cy="16" r="5.5" fill="%23ffffff"/></svg>`,
            scaledSize: new window.google.maps.Size(32, 42),
            anchor: new window.google.maps.Point(16, 42),
          }}
        />
      )}

      {venue?.lat != null && venue?.lng != null && (
        <>
          <Marker
            position={{ lat: venue.lat, lng: venue.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 11,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#fff",
            }}
            label={{ text: "Venue", color: "#fff", fontSize: "9px", fontWeight: "bold" }}
            zIndex={10}
          />
          <Circle
            center={{ lat: venue.lat, lng: venue.lng }}
            radius={Number(radiusKm) * 1000}
            options={{
              strokeColor: "#1b6b47",
              strokeOpacity: 0.7,
              strokeWeight: 1,
              fillColor: "#1b6b47",
              fillOpacity: 0.08,
            }}
          />
        </>
      )}

      {listings.map((l) => {
        const coords = l.location?.coordinates;
        if (!coords || coords.length < 2) return null;
        const [lng, lat] = coords;
        const label  = formatCompactInr(l.pricePerNight);
        const active = selectedId === l._id;
        return (
          <Marker
            key={l._id}
            position={{ lat, lng }}
            onClick={() => onListingClick?.(l)}
            zIndex={active ? 20 : 5}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: active ? 18 : 14,
              fillColor: active ? "#f59e0b" : "#1b6b47",
              fillOpacity: 1,
              strokeWeight: active ? 3 : 2,
              strokeColor: "#fff",
            }}
            label={{
              text: `₹${label}`,
              color: active ? "#1c1917" : "#fff",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          />
        );
      })}
    </GoogleMap>
  );
}
