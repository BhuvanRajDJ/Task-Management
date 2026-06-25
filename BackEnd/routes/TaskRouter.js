const router = require("express").Router();
const mongoose = require("mongoose");
const {
  createTask,
  fetchTask,
  updateTask,
  deleteTask,
} = require("../controllers/TaskController");
const { validateTask } = require("../middlewares/validation");

// Health check endpoint (checks server and database status)
router.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  res.status(200).json({
    success: true,
    status: "UP",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Task Management CRUD Endpoints
router.get("/tasks", fetchTask);
router.post("/tasks", validateTask, createTask);
router.put("/tasks/:id", validateTask, updateTask);
router.patch("/tasks/:id", validateTask, updateTask);
router.delete("/tasks/:id", deleteTask);

module.exports = router;
