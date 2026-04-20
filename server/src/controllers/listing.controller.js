const Listing = require("../models/Listing");
const { searchListings } = require("../services/search.service");
const { geocodeAddress } = require("../utils/geocode");
const cloudinary = require("../config/cloudinary");

const DELHI_LAT   = 28.6139;
const DELHI_LNG   = 77.2090;
const INDIA_LAT   = 20.5937;  // default map center — not a real pin
const INDIA_LNG   = 78.9629;

const DEFAULT_PINS = [
  [DELHI_LAT, DELHI_LNG],
  [INDIA_LAT, INDIA_LNG],
];

function isDefaultPin(lat, lng) {
  return DEFAULT_PINS.some(
    ([dlat, dlng]) => Math.abs(lat - dlat) < 0.05 && Math.abs(lng - dlng) < 0.05
  );
}

async function resolveCoords(lat, lng, address) {
  const hasPin =
    lat != null && lng != null && !isDefaultPin(Number(lat), Number(lng));

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

async function uploadListingPhotos(req, res) {
  if (!req.files?.length) return res.status(400).json({ message: "No files uploaded" });
  const urls = await Promise.all(
    req.files.map((file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "listings", resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        stream.end(file.buffer);
      })
    )
  );
  res.json({ urls });
}

module.exports = {
  createListing,
  getListing,
  updateListing,
  myListings,
  listingSearch,
  updateListingStatus,
  uploadListingPhotos,
};
