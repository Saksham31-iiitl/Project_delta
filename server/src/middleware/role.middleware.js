function roleGuard(...allowed) {
  return (req, res, next) => {
    const roles = req.user?.roles ?? [];
    const ok = roles.some((r) => allowed.includes(r));
    if (!ok) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

module.exports = { roleGuard };
