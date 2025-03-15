const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  taskName: {
    type: String,
    required: true,
  },
  taskDescription: {
    type: String,
    required: true,
  },
  taskDueDate: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    required: true,
  },
});

const TaskModel = mongoose.model("todolist", TaskSchema);
module.exports = TaskModel;
