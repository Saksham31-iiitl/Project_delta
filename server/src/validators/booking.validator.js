const { z } = require("zod");

const bookingSchema = z.object({
  listingId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guestsCount: z.number().int().positive(),
  eventId: z.string().nullable().optional(),
});

module.exports = { bookingSchema };
