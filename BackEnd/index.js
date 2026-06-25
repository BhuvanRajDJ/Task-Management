// Load environment variables at the very beginning
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// Establish Database Connection
require("./models/db");

const TaskRouter = require("./routes/TaskRouter");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Security Middlewares
app.use(helmet()); // Secure HTTP headers

// Configure CORS securely
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"]; // Default React Vite & Node ports

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Rate Limiting (Protects server from spam/DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/", limiter);

// 2. Logging & Utility Middlewares
app.use(morgan("dev")); // Modern HTTP Request Logger
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. Application Routes
app.use("/api/v1", TaskRouter);

// Fallback for non-existent API routes
app.use("/api/*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// 4. Centralized Error Handling (Must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is successfully running at: http://localhost:${PORT}/api/v1/tasks`);
  console.log(`🩺 Health check available at: http://localhost:${PORT}/api/v1/health`);
});
