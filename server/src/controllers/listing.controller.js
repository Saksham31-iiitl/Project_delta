const Listing = require("../models/Listing");
const { searchListings } = require("../services/search.service");
const { geocodeAddress } = require("../utils/geocode");

const DELHI_LAT = 28.6139;
const DELHI_LNG = 77.2090;

async function resolveCoords(lat, lng, address) {
  const hasPin =
    lat != null && lng != null &&
    !(Math.abs(lat - DELHI_LAT) < 0.001 && Math.abs(lng - DELHI_LNG) < 0.001);

  if (hasPin) return { lat: Number(lat), lng: Number(lng) };

  // Geocode from address
  const parts = [address?.street, address?.locality, address?.city, address?.state, address?.pincode, "India"];
  const coords = await geocodeAddress(parts);
  return coords || { lat: DELHI_LAT, lng: DELHI_LNG };
}

async function createListing(req, res) {
  const { lat, lng, ...rest } = req.body;
  const coords = await resolveCoords(lat, lng, rest.address);
  const listing = await Listing.create({
    ...rest,
    hostId: req.user.sub,
    location: { type: "Point", coordinates: [coords.lng, coords.lat] },
    status: "under_review",
  });
  res.status(201).json(listing);
}

async function getListing(req, res) {
  const listing = await Listing.findById(req.params.id).populate("hostId", "fullName trustScore kycStatus");
  res.json(listing);
}

async function updateListing(req, res) {
  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user.sub },
    req.body,
    { new: true }
  );
  res.json(listing);
}

async function myListings(req, res) {
  const list = await Listing.find({ hostId: req.user.sub }).sort({ createdAt: -1 });
  res.json(list);
}

async function listingSearch(req, res) {
  const listings = await searchListings(req.query);
  res.json(listings);
}

async function updateListingStatus(req, res) {
  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user.sub },
    { status: req.body.status },
    { new: true }
  );
  res.json(listing);
}

module.exports = {
  createListing,
  getListing,
  updateListing,
  myListings,
  listingSearch,
  updateListingStatus,
};
