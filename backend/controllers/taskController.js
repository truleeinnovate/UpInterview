//<------v1.0.0---Venkatesh-----add validations

const Task = require('../models/task');
const { validateCreateTask, validateUpdateTask } = require('../validations/taskvalidation');//<------v1.0.0---

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
  //<------v1.0.0---
  // Simple backend validation (mirrors frontend)
  const { errors, isValid } = validateCreateTask(req.body);
  if (!isValid) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  //------v1.0.0--->
  const lastTask = await Task.findOne({})
  .sort({ _id: -1 })
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
    const { title, assignedTo, assignedToId, priority, status, relatedTo, dueDate, comments,ownerId,tenantId } = req.body;
    const task = new Task({
      title,
      assignedTo,
      assignedToId,
      priority,
      status,
      relatedTo,
      dueDate,
      comments,
      taskCode,
      ownerId,
      tenantId
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
    const { title, assignedTo, assignedToId, priority, status, relatedTo, dueDate, comments } = req.body;

    //<------v1.0.0---
    // Simple backend validation (mirrors frontend)
    const { errors, isValid } = validateUpdateTask({ title, assignedTo, priority, status, relatedTo, dueDate });
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    //------v1.0.0--->

    try {
      const updatedTask = await Task.findByIdAndUpdate(id, {
        title,
        assignedTo,
        assignedToId,
        priority,
        status,
        relatedTo,
        dueDate,
        comments,
      //<------v1.0.0---
      }, { new: true, runValidators: true });

      if (!updatedTask) {
        return res.status(404).json({ message: 'Cannot find task' });
      }
      //------v1.0.0--->

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
