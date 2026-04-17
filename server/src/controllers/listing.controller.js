const Listing = require("../models/Listing");
const { searchListings } = require("../services/search.service");

async function createListing(req, res) {
  const { lat, lng, ...rest } = req.body;
  const listing = await Listing.create({
    ...rest,
    hostId: req.user.sub,
    location: { type: "Point", coordinates: [lng, lat] },
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
