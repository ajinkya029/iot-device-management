function notFound(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, _req, res, _next) {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed", errors: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.code === 11000) return res.status(409).json({ message: "A record with that unique value already exists" });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid resource ID" });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? "Internal server error" : err.message });
}
module.exports = { notFound, errorHandler };
