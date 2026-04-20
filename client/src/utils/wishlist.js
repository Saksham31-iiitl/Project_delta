const KEY = "htg_wishlist";

export function getWishlist() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function isWishlisted(id) {
  return getWishlist().some((l) => l._id === id);
}

export function toggleWishlist(listing) {
  const list = getWishlist();
  const idx  = list.findIndex((l) => l._id === listing._id);
  const added = idx === -1;
  if (added) list.unshift(listing);
  else list.splice(idx, 1);
  localStorage.setItem(KEY, JSON.stringify(list));
  return added;
}
