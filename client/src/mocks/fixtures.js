/** Stable IDs for cross-linking in the UI */
export const IDS = {
  host: "507f1f77bcf86cd799439011",
  guest: "507f1f77bcf86cd799439012",
  listing1: "507f1f77bcf86cd799439021",
  listing2: "507f1f77bcf86cd799439022",
  bookingGuest1: "507f1f77bcf86cd799439031",
  bookingGuest2: "507f1f77bcf86cd799439032",
  bookingHostPending: "507f1f77bcf86cd799439033",
  event1: "507f1f77bcf86cd799439041",
  review1: "507f1f77bcf86cd799439051",
  review2: "507f1f77bcf86cd799439052",
  review3: "507f1f77bcf86cd799439053",
};

const hostUser = {
  _id: IDS.host,
  fullName: "Priya Sharma",
  trustScore: 87,
  kycStatus: "verified",
  responseRate: 0.95,
};

const roomPhoto =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&w=800&q=80";
const floorPhoto =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&w=800&q=80";

export function listing1(overrides = {}) {
  return {
    _id: IDS.listing1,
    title: "Cozy AC room in family home",
    hostId: { ...hostUser },
    type: "room",
    location: { type: "Point", coordinates: [75.7873, 26.9124] },
    address: { locality: "Vaishali Nagar", city: "Jaipur", state: "Rajasthan", pincode: "302021" },
    pricePerNight: 1800,
    maxGuests: 2,
    amenities: ["wifi", "ac", "attached bath"],
    photos: [roomPhoto, floorPhoto],
    status: "active",
    avgRating: 4.7,
    reviewCount: 23,
    rules: "No smoking. Quiet hours after 10pm.",
    distanceKm: 0.5,
    womenSafe: true,
    ...overrides,
  };
}

export function listing2(overrides = {}) {
  return {
    _id: IDS.listing2,
    title: "Entire first floor — 3 rooms for families",
    hostId: { ...hostUser, fullName: "Ravi Mehta" },
    type: "floor",
    location: { type: "Point", coordinates: [75.778, 26.89] },
    address: { locality: "Mansarovar", city: "Jaipur", state: "Rajasthan" },
    pricePerNight: 4200,
    maxGuests: 8,
    amenities: ["wifi", "ac", "ground floor", "parking"],
    photos: [floorPhoto, roomPhoto],
    status: "active",
    avgRating: 4.9,
    reviewCount: 41,
    distanceKm: 1.2,
    elderFriendly: true,
    ...overrides,
  };
}

export function mockSearchListings() {
  return [listing1(), listing2()];
}

export function mockListingById(id) {
  if (id === IDS.listing2) return listing2();
  return listing1();
}

export const mockEvent = {
  _id: IDS.event1,
  eventName: "Sharma family wedding",
  eventType: "wedding",
  venueAddress: "Crystal Banquet Hall, Vaishali Nagar, Jaipur",
  venueLocation: { type: "Point", coordinates: [75.7873, 26.9124] },
  eventDates: { start: "2025-12-14T10:00:00.000Z", end: "2025-12-16T18:00:00.000Z" },
  inviteCode: "MOCK24",
  maxRadiusKm: 2,
  isActive: true,
};

export function mockHubListings() {
  return {
    event: mockEvent,
    listings: [listing1({ distanceKm: 0.5 }), listing2({ distanceKm: 1.2 })],
  };
}

export function mockHubByCode(code) {
  if (String(code).toUpperCase() === "NOTFOUND") return null;
  return mockEvent;
}

export const mockAuthUser = {
  _id: IDS.guest,
  phone: "+919876543210",
  roles: ["guest", "host", "organizer", "admin"],
  fullName: "Demo Guest",
  trustScore: 72,
  kycStatus: "verified",
};

export function mockMyBookings() {
  return [
    {
      _id: IDS.bookingGuest1,
      listingId: IDS.listing1,
      status: "confirmed",
      checkIn: "2025-12-14T14:00:00.000Z",
      checkOut: "2025-12-16T11:00:00.000Z",
      totalAmount: 5400,
      guestsCount: 2,
    },
    {
      _id: IDS.bookingGuest2,
      listingId: IDS.listing2,
      status: "pending",
      checkIn: "2026-01-05T14:00:00.000Z",
      checkOut: "2026-01-07T11:00:00.000Z",
      totalAmount: 8400,
      guestsCount: 4,
    },
  ];
}

export function mockHostBookings() {
  return [
    {
      _id: IDS.bookingHostPending,
      listingId: IDS.listing1,
      guestId: IDS.guest,
      status: "pending",
      checkIn: "2025-12-20T14:00:00.000Z",
      checkOut: "2025-12-22T11:00:00.000Z",
      totalAmount: 3600,
      guestsCount: 2,
    },
    {
      _id: "507f1f77bcf86cd799439034",
      listingId: IDS.listing2,
      status: "confirmed",
      checkIn: "2025-11-01T14:00:00.000Z",
      checkOut: "2025-11-03T11:00:00.000Z",
      totalAmount: 8400,
      guestsCount: 3,
    },
  ];
}

export function mockMyListings() {
  return [
    { ...listing1(), status: "active" },
    { ...listing2(), status: "under_review" },
  ];
}

export function mockReviews(listingId) {
  if (listingId === IDS.listing2) {
    return [
      {
        _id: IDS.review2,
        listingId: IDS.listing2,
        rating: 5,
        reviewerName: "Anita K.",
        createdAt: "2025-11-02T12:00:00.000Z",
        comment: "Spacious floor, perfect for our family. Host was very responsive.",
      },
    ];
  }
  return [
    {
      _id: IDS.review1,
      listingId: IDS.listing1,
      rating: 5,
      reviewerName: "Rahul Kumar",
      createdAt: "2025-10-18T09:00:00.000Z",
      comment: "Walkable to the venue, very clean. Felt safe for elders.",
    },
    {
      _id: IDS.review3,
      listingId: IDS.listing1,
      rating: 4,
      reviewerName: "Sneha P.",
      createdAt: "2025-09-05T16:30:00.000Z",
      comment: "Great value. WiFi was fast.",
    },
  ];
}

export function mockAdminPending() {
  return [
    {
      _id: "507f1f77bcf86cd799439061",
      type: "suite",
      status: "under_review",
      address: { locality: "C-Scheme", city: "Jaipur" },
      pricePerNight: 3200,
    },
    {
      _id: "507f1f77bcf86cd799439062",
      type: "farmhouse",
      status: "under_review",
      address: { locality: "Ajmer Road", city: "Jaipur" },
      pricePerNight: 12000,
    },
  ];
}

export function mockMyEvents() {
  return [mockEvent, { ...mockEvent, _id: "507f1f77bcf86cd799439042", eventName: "Navratri gathering", inviteCode: "NAVRA25" }];
}

let createdListingCounter = 0;
export function mockCreateListing(body) {
  createdListingCounter += 1;
  return {
    _id: `507f1f77bcf86cd7994390${70 + createdListingCounter}`,
    ...body,
    hostId: IDS.host,
    status: "under_review",
    photos: [],
    avgRating: 0,
    reviewCount: 0,
    location: { type: "Point", coordinates: [body.lng, body.lat] },
  };
}

export function mockCreateEvent(body) {
  return {
    _id: "507f1f77bcf86cd799439099",
    ...body,
    inviteCode: "NEWEVT99",
    isActive: true,
    venueLocation: { type: "Point", coordinates: [body.lng, body.lat] },
    eventDates: { start: new Date(body.start).toISOString(), end: new Date(body.end).toISOString() },
  };
}

export function mockCreateBooking(body) {
  return {
    booking: {
      _id: "507f1f77bcf86cd7994390aa",
      listingId: body.listingId,
      status: "pending",
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guestsCount: body.guestsCount,
      totalAmount: 7500,
    },
    order: { id: `order_mock_${Date.now()}`, amount: 750000, currency: "INR" },
  };
}
