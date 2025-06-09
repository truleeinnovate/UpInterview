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
  const lastTask = await Task.findOne({})
  .sort({ createdAt: -1 })
  .select('taskCode')
  .lean();
let nextNumber = 1;
if (lastTask && lastTask.taskCode) {
const match = lastTask.taskCode.match(/TSK-(\d+)/);
if (match) {
nextNumber = parseInt(match[1], 10) + 1;
}
}
const taskCode = `TSK-${String(nextNumber).padStart(5, '0')}`;
    const { title, assignedTo, priority, status, relatedTo, dueDate, comments } = req.body;
    const task = new Task({
      title,
      assignedTo,
      priority,
      status,
      relatedTo,
      dueDate,
      comments,
      taskCode,
    });
  
    try {
      const newTask = await task.save();
      res.status(201).json(newTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  
// Get a unique task by ID
const getTaskById = async (req, res) => {
    const { id } = req.params;
    try {
      const task = await Task.findById(id);
      if (task == null) {
        return res.status(404).json({ message: 'Cannot find task' });
      }
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  

  

// Update a task
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, assignedTo, priority, status, relatedTo, dueDate, comments } = req.body;

    try {
      const updatedTask = await Task.findByIdAndUpdate(id, {
        title,
        assignedTo,
        priority,
        status,
        relatedTo,
        dueDate,
        comments,
      }, { new: true });

      res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };


module.exports = {
    getTasks,
    createTask,
    updateTask,
    getTaskById
};
