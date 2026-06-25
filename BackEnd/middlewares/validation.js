/**
 * Custom Input Validation Middleware
 */

const validateTask = (req, res, next) => {
  const { taskName, taskDescription, taskDueDate, priority } = req.body;
  const errors = [];

  // Validation rules for POST (creation)
  if (req.method === "POST") {
    if (!taskName || typeof taskName !== "string" || taskName.trim() === "") {
      errors.push("taskName is required and must be a non-empty string");
    }
    if (!taskDescription || typeof taskDescription !== "string" || taskDescription.trim() === "") {
      errors.push("taskDescription is required and must be a non-empty string");
    }
    if (!taskDueDate || isNaN(Date.parse(taskDueDate))) {
      errors.push("taskDueDate is required and must be a valid Date");
    }
    const validPriorities = ["High", "Medium", "Low"];
    if (!priority || !validPriorities.includes(priority)) {
      errors.push(`priority is required and must be one of: ${validPriorities.join(", ")}`);
    }
  }

  // Validation rules for PUT/PATCH (updates)
  if (req.method === "PUT" || req.method === "PATCH") {
    if (taskName !== undefined && (typeof taskName !== "string" || taskName.trim() === "")) {
      errors.push("taskName must be a non-empty string");
    }
    if (taskDescription !== undefined && (typeof taskDescription !== "string" || taskDescription.trim() === "")) {
      errors.push("taskDescription must be a non-empty string");
    }
    if (taskDueDate !== undefined && isNaN(Date.parse(taskDueDate))) {
      errors.push("taskDueDate must be a valid Date");
    }
    const validPriorities = ["High", "Medium", "Low"];
    if (priority !== undefined && !validPriorities.includes(priority)) {
      errors.push(`priority must be one of: ${validPriorities.join(", ")}`);
    }
    if (req.body.isDone !== undefined && typeof req.body.isDone !== "boolean") {
      errors.push("isDone must be a boolean value");
    }
  }

  if (errors.length > 0) {
    const err = new Error("Validation Failed");
    err.statusCode = 400;
    err.errors = errors;
    return next(err);
  }

  next();
};

module.exports = { validateTask };
