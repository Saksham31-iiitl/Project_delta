const buckets = new Map();

function rateLimiter(req, res, next) {
  const key = req.ip || "global";
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, start: now };
  if (now - bucket.start > 60000) {
    bucket.count = 0;
    bucket.start = now;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > 120) return res.status(429).json({ message: "Too many requests" });
  return next();
}

module.exports = { rateLimiter };
