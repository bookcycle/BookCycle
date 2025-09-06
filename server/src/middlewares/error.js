export function notFound(req, res, next) {
  res.status(404).json({
    error: `Not Found - ${req.originalUrl}`,
  });
}

//for middleware and service error
//auto call
export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err.message);

  const status = err.status || 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
