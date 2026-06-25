const mongoose = require("mongoose");

const DB_URL = process.env.Mongodb_Url;

if (!DB_URL) {
  console.error("❌ CRITICAL: Mongodb_Url environment variable is not defined!");
  process.exit(1);
}

// Set up connection event listeners for robustness
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected successfully to Atlas Cluster.");
});

mongoose.connection.on("error", (err) => {
  console.error(`🔴 MongoDB Connection Error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection disconnected.");
});

// Connect to MongoDB with robust error handling
const connectDB = async () => {
  try {
    // We set a 5-second connection timeout so it doesn't hang forever
    await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    console.error("❌ Initial MongoDB Connection Failed:", err.message);
    console.warn("⚠️ Continuing server boot. Database state will be tracked in health checks.");
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (msg, callback) => {
  try {
    await mongoose.connection.close();
    console.log(`🔌 MongoDB disconnected through ${msg}`);
    callback();
  } catch (err) {
    console.error("Error during MongoDB disconnection:", err.message);
    callback();
  }
};

// Listen for termination signals to close DB cleanly
process.once("SIGUSR2", () => {
  gracefulShutdown("nodemon restart", () => {
    process.kill(process.pid, "SIGUSR2");
  });
});

process.on("SIGINT", () => {
  gracefulShutdown("app termination (SIGINT)", () => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  gracefulShutdown("app termination (SIGTERM)", () => {
    process.exit(0);
  });
});

// Trigger connection
connectDB();

module.exports = mongoose;
