const Task = require('../models/Task');

// Get all tasks
const getTasks = async (req, res) => {
    try {
      const tasks = await Task.find();
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

// Create a new task
const createTask = async (req, res) => {
    const { title, assignedTo, priority, status, relatedTo, dueDate, comments } = req.body;
    const task = new Task({
      title,
      assignedTo,
      priority,
      status,
      relatedTo,
      dueDate,
      comments,
    });
  
    try {
      const newTask = await task.save();
      res.status(201).json(newTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

module.exports = {
    getTasks,
    createTask
};
