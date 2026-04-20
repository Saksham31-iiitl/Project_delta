const KEY = "htg_recently_viewed";
const MAX = 6;

export function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function addRecentlyViewed(listing) {
  if (!listing?._id) return;
  const snap = {
    _id: listing._id,
    photos: listing.photos,
    type: listing.type,
    title: listing.title,
    address: listing.address,
    pricePerNight: listing.pricePerNight,
    avgRating: listing.avgRating,
    reviewCount: listing.reviewCount,
    amenities: listing.amenities,
    hostId: listing.hostId,
    womenSafe: listing.womenSafe,
    elderFriendly: listing.elderFriendly,
    maxGuests: listing.maxGuests,
  };
  const list = getRecentlyViewed().filter((l) => l._id !== listing._id);
  list.unshift(snap);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}
