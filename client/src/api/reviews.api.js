import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const getListingReviews = (listingId) =>
  mockOr(() => api.get(`/reviews/listing/${listingId}`), () => fixtures.mockReviews(listingId));

export const submitReview = (body) =>
  mockOr(() => api.post("/reviews", body), () => ({
    _id: "507f1f77bcf86cd7994390bb",
    ...body,
    rating: body.rating,
    comment: body.comment,
  }));
