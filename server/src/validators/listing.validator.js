const { z } = require("zod");

const listingSchema = z.object({
  type: z.enum(["room", "floor", "home", "suite", "farmhouse"]),
  lat: z.number(),
  lng: z.number(),
  pricePerNight: z.number().positive(),
  maxGuests: z.number().int().positive(),
  amenities: z.array(z.string()).optional(),
  rules: z.string().max(500).optional(),
  address: z.object({
    street: z.string().optional(),
    locality: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    landmark: z.string().optional(),
  }),
});

module.exports = { listingSchema };
