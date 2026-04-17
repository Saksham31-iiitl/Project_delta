function calculatePlatformFee(totalAmount, listingType = "room") {
  const tiers = {
    room: 0.08,
    floor: 0.1,
    home: 0.12,
    suite: 0.13,
    farmhouse: 0.14,
  };
  const rate = tiers[listingType] ?? 0.1;
  return Math.round(totalAmount * rate);
}

module.exports = { calculatePlatformFee };
