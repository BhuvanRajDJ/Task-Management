const TaskModel = require("../models/TaskModels");

const fetchTask = async (req, res) => {
  try {
    const data = await TaskModel.find({});
    res.status(200).json({ message: "All Tasks", success: true, data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch the tasks", success: false });
  }
};

const createTask = async (req, res) => {
  const data = req.body;
  try {
    const model = TaskModel(data);
    await model.save();
    res.status(201).json({ message: "Task is Created", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create a task", success: false, error: error });
  }
};

const updateTask = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const obj = { $set: { ...body } };
    const data = await TaskModel.findByIdAndUpdate(id, obj);
    res.status(200).json({ message: "Updated tasks", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update the task", success: false });
  }
};

// const

const deleteTask = async (req, res) => {
  try {
    const id = req.params.id;
    // const body = req.body;
    const data = await TaskModel.deleteOne({ _id: id });
    // const data = await TaskModel.findByIdAndDelete({_id:id});
    if (data.deletedCount === 0) {
      return res
        .status(400)
        .json({ message: "No task found to delete", success: false });
    }
    res
      .status(200)
      .json({ message: "Task deleted successfully", success: true});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete the task", success: false });
  }
};

module.exports = { createTask, fetchTask, updateTask, deleteTask };
