/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error encountered:", {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred";
  const errors = err.errors || null;

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = errorHandler;
