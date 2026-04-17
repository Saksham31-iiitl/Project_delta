export function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatPricePerNight(amount) {
  const main = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
  return main;
}

export function formatDistanceKm(km) {
  if (km == null || Number.isNaN(Number(km))) return "";
  const n = Number(km);
  if (n < 1) return `${Math.round(n * 1000)}m`;
  return n < 10 ? `${n.toFixed(1)} km` : `${Math.round(n)} km`;
}

export function formatCompactInr(amount) {
  const n = Number(amount);
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function listingTitle(listing) {
  if (!listing) return "";
  const loc = listing.address?.locality || listing.address?.city || "";
  const typeMap = { room: "Room", floor: "Floor", home: "Home", suite: "Suite", farmhouse: "Farmhouse" };
  const t = typeMap[listing.type] || listing.type;
  return loc ? `${t} · ${loc}` : t;
}

/** Primary heading for cards and detail — prefers host-written title */
export function listingDisplayTitle(listing) {
  if (!listing) return "";
  const t = listing.title?.trim();
  if (t) return t;
  const loc = listing.address?.locality || listing.address?.city || "";
  const typeMap = { room: "Room", floor: "Floor", home: "Home", suite: "Suite", farmhouse: "Farmhouse" };
  const ty = typeMap[listing.type] || "Stay";
  return loc ? `${ty} in ${loc}` : ty;
}

export function listingLocationLine(listing) {
  if (!listing?.address) return "";
  const { locality, city } = listing.address;
  return [locality, city].filter(Boolean).join(", ");
}

/** e.g. Jaipur, Rajasthan */
export function listingCityStateLine(listing) {
  if (!listing?.address) return "";
  const { city, state } = listing.address;
  return [city, state].filter(Boolean).join(", ");
}

/** Subtitle for search results: area · within N km */
export function searchAreaWithinRadius(areaLabel, radiusKm) {
  const left = areaLabel?.trim() || "Jaipur, Rajasthan";
  return `${left} · within ${radiusKm} km`;
}
