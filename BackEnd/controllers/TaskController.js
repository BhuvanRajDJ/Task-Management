const TaskModel = require("../models/TaskModels");

/**
 * Fetch all tasks from database
 */
const fetchTask = async (req, res, next) => {
  try {
    const data = await TaskModel.find({});
    res.status(200).json({ 
      success: true, 
      message: "All Tasks fetched successfully", 
      data 
    });
  } catch (err) {
    err.message = "Failed to fetch tasks";
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Create a new task
 */
const createTask = async (req, res, next) => {
  try {
    const model = new TaskModel(req.body);
    const savedTask = await model.save();
    res.status(201).json({ 
      success: true, 
      message: "Task created successfully", 
      data: savedTask 
    });
  } catch (err) {
    err.message = "Failed to create task";
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Update an existing task by ID
 */
const updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const body = req.body;
    
    // Check if task exists first
    const task = await TaskModel.findById(id);
    if (!task) {
      const err = new Error("Task not found");
      err.statusCode = 404;
      return next(err);
    }

    const obj = { $set: { ...body } };
    const updatedTask = await TaskModel.findByIdAndUpdate(id, obj, { new: true });
    
    res.status(200).json({ 
      success: true, 
      message: "Task updated successfully", 
      data: updatedTask 
    });
  } catch (err) {
    err.message = "Failed to update the task";
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Delete a task by ID
 */
const deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await TaskModel.deleteOne({ _id: id });
    
    if (data.deletedCount === 0) {
      const err = new Error("No task found to delete");
      err.statusCode = 404;
      return next(err);
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Task deleted successfully" 
    });
  } catch (err) {
    err.message = "Failed to delete the task";
    err.statusCode = 500;
    next(err);
  }
};

module.exports = { createTask, fetchTask, updateTask, deleteTask };
