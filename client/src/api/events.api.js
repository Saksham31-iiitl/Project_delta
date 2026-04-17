import * as fixtures from "../mocks/fixtures.js";
import { api } from "./client.js";
import { mockOr } from "./mockOr.js";

export const getHubByCode = (code) =>
  mockOr(() => api.get(`/events/hub/${code}`), () => fixtures.mockHubByCode(code));

export const getHubListings = (code, params) =>
  mockOr(() => api.get(`/events/hub/${code}/listings`, { params }), () => fixtures.mockHubListings());

export const createEvent = (body) =>
  mockOr(() => api.post("/events", body), () => fixtures.mockCreateEvent(body));

export const myEvents = () => mockOr(() => api.get("/events/my-events"), () => fixtures.mockMyEvents());
