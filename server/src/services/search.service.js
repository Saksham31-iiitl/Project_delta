const Listing = require("../models/Listing");
const { haversine } = require("../utils/haversine");

function computeRankingScore(listing, lat, lng) {
  const [llng, llat] = listing.location.coordinates;
  const distKm = haversine(lat, lng, llat, llng);
  const proximity = (1 / Math.max(distKm, 0.1)) * 0.4;
  const rating = ((listing.avgRating || 3) / 5) * 0.3;
  const freshness = Date.now() - new Date(listing.updatedAt).getTime() < 604800000 ? 0.2 : 0.1;
  return proximity + rating + freshness;
}

async function searchListings({ lat, lng, radiusKm = 2, maxPrice, type, maxGuests }) {
  const query = {
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radiusKm) * 1000,
      },
    },
    status: "active",
  };
  if (maxPrice) query.pricePerNight = { $lte: Number(maxPrice) * 100 };
  if (type) query.type = type;
  if (maxGuests) query.maxGuests = { $gte: Number(maxGuests) };

  const listings = await Listing.find(query).limit(50).lean();
  return listings
    .map((l) => ({
      ...l,
      distanceKm: haversine(lat, lng, l.location.coordinates[1], l.location.coordinates[0]),
      score: computeRankingScore(l, Number(lat), Number(lng)),
    }))
    .sort((a, b) => b.score - a.score);
}

module.exports = { searchListings };
