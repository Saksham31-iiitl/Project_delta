/** Normalize User document from API for client store / UI */
export function sanitizeAuthUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    email: doc.email,
    phone: doc.phone,
    roles: doc.roles,
    fullName: doc.fullName,
    trustScore: doc.trustScore,
    kycStatus: doc.kycStatus,
  };
}
