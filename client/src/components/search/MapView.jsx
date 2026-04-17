import { Circle, GoogleMap, Marker } from "@react-google-maps/api";
import { useMemo } from "react";
import { formatCompactInr } from "@utils/format.js";

const defaultCenter = { lat: 26.9124, lng: 75.7873 };

export function MapView({ center, listings = [], venue, radiusKm = 2, isLoaded, onListingClick }) {
  const mapCenter = center?.lat && center?.lng ? center : defaultCenter;

  const options = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    }),
    []
  );

  if (!isLoaded) {
    return <div className="flex h-full min-h-[170px] items-center justify-center bg-stone-100 text-sm text-stone-500">Loading map…</div>;
  }

  return (
    <GoogleMap
      mapContainerClassName="h-full min-h-[170px] w-full rounded-xl"
      center={mapCenter}
      zoom={13}
      options={options}
    >
      {venue?.lat != null && venue?.lng != null ? (
        <>
          <Marker
            position={{ lat: venue.lat, lng: venue.lng }}
            label={{ text: "Venue", color: "#b91c1c", fontSize: "10px", fontWeight: "bold" }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#fff",
            }}
          />
          <Circle
            center={{ lat: venue.lat, lng: venue.lng }}
            radius={Number(radiusKm) * 1000}
            options={{
              strokeColor: "#25855a",
              strokeOpacity: 0.9,
              strokeWeight: 1,
              fillColor: "#25855a",
              fillOpacity: 0.1,
            }}
          />
        </>
      ) : null}
      {listings.map((l) => {
        const coords = l.location?.coordinates;
        if (!coords || coords.length < 2) return null;
        const [lng, lat] = coords;
        const label = formatCompactInr(l.pricePerNight);
        return (
          <Marker
            key={l._id}
            position={{ lat, lng }}
            onClick={() => onListingClick?.(l)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: "#1b6b47",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#fff",
            }}
            label={{ text: `₹${label}`, color: "white", fontSize: "10px", fontWeight: "bold" }}
          />
        );
      })}
    </GoogleMap>
  );
}
