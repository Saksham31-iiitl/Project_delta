import { Circle, GoogleMap, Marker } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { formatCompactInr } from "@utils/format.js";

const defaultCenter = { lat: 26.9124, lng: 75.7873 };

export function MapView({ center, listings = [], venue, radiusKm = 2, isLoaded, selectedId, onListingClick }) {
  const mapCenter = center?.lat && center?.lng ? center : defaultCenter;
  const mapRef = useRef(null);

  const onLoad = useCallback((map) => { mapRef.current = map; }, []);

  // Pan the map whenever center prop changes
  useEffect(() => {
    if (mapRef.current && mapCenter.lat && mapCenter.lng) {
      mapRef.current.panTo(mapCenter);
    }
  }, [mapCenter.lat, mapCenter.lng]);

  const options = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      styles: [
        { featureType: "poi",     stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    }),
    []
  );

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
      center={mapCenter}
      zoom={13}
      options={options}
      onLoad={onLoad}
    >
      {/* Venue marker + radius circle */}
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

      {/* Listing pins */}
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
