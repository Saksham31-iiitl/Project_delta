const Event = require("../models/Event");
const { generateInviteCode } = require("../utils/inviteCode");
const { searchListings } = require("../services/search.service");

async function createEvent(req, res) {
  const inviteCode = generateInviteCode();
  const event = await Event.create({
    organizerId: req.user.sub,
    eventName: req.body.eventName,
    eventType: req.body.eventType,
    venueAddress: req.body.venueAddress,
    venueLocation: { type: "Point", coordinates: [req.body.lng, req.body.lat] },
    eventDates: { start: new Date(req.body.start), end: new Date(req.body.end) },
    maxRadiusKm: req.body.maxRadiusKm ?? 2,
    inviteCode,
  });
  res.status(201).json(event);
}

async function getEventByCode(req, res) {
  const event = await Event.findOne({ inviteCode: req.params.code, isActive: true });
  res.json(event);
}

async function getEventListings(req, res) {
  const event = await Event.findOne({ inviteCode: req.params.code, isActive: true });
  if (!event) return res.status(404).json({ message: "Hub not found" });
  const [lng, lat] = event.venueLocation.coordinates;
  const listings = await searchListings({ lat, lng, radiusKm: event.maxRadiusKm, ...req.query });
  return res.json({ event, listings });
}

async function myEvents(req, res) {
  const events = await Event.find({ organizerId: req.user.sub }).sort({ createdAt: -1 });
  res.json(events);
}

module.exports = { createEvent, getEventByCode, getEventListings, myEvents };
