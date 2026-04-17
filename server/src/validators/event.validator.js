const { z } = require("zod");

const eventSchema = z.object({
  eventName: z.string().min(2),
  eventType: z.enum(["wedding", "pooja", "birthday", "navratri", "funeral", "hospital", "other"]),
  venueAddress: z.string().min(5),
  lat: z.number(),
  lng: z.number(),
  start: z.string(),
  end: z.string(),
  maxRadiusKm: z.number().min(1).max(10).optional(),
});

module.exports = { eventSchema };
