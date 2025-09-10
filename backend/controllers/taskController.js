//<------v1.0.0---Venkatesh-----add validations
//<-----v1.0.1---Venkatesh---apply permissions to post and update

const Task = require('../models/task');
const { validateCreateTask, validateUpdateTask } = require('../validations/taskvalidation');//<------v1.0.0---
const { hasPermission } = require('../middleware/permissionMiddleware');


// Get all tasks
const getTasks = async (req, res) => {
  try {
    res.locals.loggedByController = true;
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    // const canCreate =
    //   await hasPermission(res.locals?.effectivePermissions?.Tasks, 'View')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing Tasks.View permission' });
    // }
    //-----v1.0.1--->

    const tasks = await Task.find().sort({ _id: -1 }).lean();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create a new task
const createTask = async (req, res) => {

  res.locals.loggedByController = true;
  res.locals.processName = "Create Task";
  //<-----v1.0.1---
  // Permission: Tasks.Create (or super admin override)
  // const canCreate =
  //   await hasPermission(res.locals?.effectivePermissions?.Tasks, 'Create')
  // if (!canCreate) {
  //   return res.status(403).json({ message: 'Forbidden: missing Tasks.Create permission' });
  // }
  //-----v1.0.1--->

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
  const { title, assignedTo, assignedToId, priority, status, relatedTo, dueDate, comments, ownerId, tenantId } = req.body;
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

    // Set feed data for activity feed
    res.locals.feedData = {
      tenantId,
      feedType: "info",
      action: {
        name: "task_created",
        description: `New task "${title}" was created`,
      },
      ownerId,
      parentId: newTask._id,
      parentObject: "Task",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      fieldMessage: [{
        fieldName: "task",
        message: `Task "${title}" created with priority ${priority}`
      }],
      history: [{
        fieldName: "creation",
        oldValue: null,
        newValue: `Task ${taskCode} created`
      }]
    };

    // Set log data for auditing
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create Task",
      requestBody: req.body,
      status: "success",
      message: "Task created successfully",
      responseBody: newTask,
    };




    res.status(201).json({
      status: 'Created successfully',
      newTask
    });

  } catch (err) {


    // Error logging
    res.locals.logData = {
      tenantId: req.body?.tenantId,
      ownerId: req.body?.ownerId,
      processName: "Create Task",
      requestBody: req.body,
      message: err.message,
      status: "error",
    };

    res.status(400).json({ message: err.message });
  }
};


// Get a unique task by ID
const getTaskById = async (req, res) => {
  const { id } = req.params;
  res.locals.loggedByController = true;
  //<-----v1.0.1---
  // Permission: Tasks.Create (or super admin override)
  const canCreate =
    await hasPermission(res.locals?.effectivePermissions?.Tasks, 'View')
  if (!canCreate) {
    return res.status(403).json({ message: 'Forbidden: missing Tasks.View permission' });
  }
  //-----v1.0.1--->

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
// const updateTask = async (req, res) => {


//   res.locals.loggedByController = true;
//   //<-----v1.0.1---
//   //console.log("effective permissions", hasPermission(res.locals?.effectivePermissions?.Tasks, 'Edit'))
//   // Permission: Tasks.Edit (or super admin override)
//   const canEdit =
//     await hasPermission(res.locals?.effectivePermissions?.Tasks, 'Edit');
//   if (!canEdit) {
//     return res.status(403).json({ message: 'Forbidden: missing Tasks.Edit permission' });
//   }
//   //-----v1.0.1--->



//     const { id } = req.params;
//     const { title, assignedTo, assignedToId, priority, status, relatedTo, dueDate, comments } = req.body;

//     //<------v1.0.0---
//     // Simple backend validation (mirrors frontend)
//     const { errors, isValid } = validateUpdateTask({ title, assignedTo, priority, status, relatedTo, dueDate });
//     if (!isValid) {
//       return res.status(400).json({ message: 'Validation failed', errors });
//     }
//     //------v1.0.0--->

//     try {
//       const updatedTask = await Task.findByIdAndUpdate(id, {
//         title,
//         assignedTo,
//         assignedToId,
//         priority,
//         status,
//         relatedTo,
//         dueDate,
//         comments,
//       //<------v1.0.0---
//       }, { new: true, runValidators: true });

//       if (!updatedTask) {
//         return res.status(404).json({ message: 'Cannot find task' });
//       }
//       //------v1.0.0--->

//       // res.json(updatedTask);
//       res.status(200).json({
//         status: 'Updated successfully',
//         updatedTask});
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   };

// Update a task
const updateTask = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Task";

  const { id } = req.params;
  const { tenantId, ownerId, ...updates } = req.body;

  // Permission: Tasks.Edit
  // const canEdit = await hasPermission(res.locals?.effectivePermissions?.Tasks, 'Edit');
  // if (!canEdit) {
  //   return res.status(403).json({ message: 'Forbidden: missing Tasks.Edit permission' });
  // }

  // Validation - check if updates contain valid fields
  const { errors, isValid } = validateUpdateTask(updates);
  if (!isValid) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  try {
    // Find the current task
    const currentTask = await Task.findById(id);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Track changes
    const changes = [];
    
    // Fields to exclude from change detection (MongoDB internal fields)
    const excludedFields = ['_id', '__v', 'createdAt', 'updatedAt', 'taskCode'];
    
    // Check each field for actual changes
    Object.keys(updates).forEach(key => {
      // Skip excluded fields and tenantId/ownerId
      if (excludedFields.includes(key) || ['tenantId', 'ownerId'].includes(key)) return;

      const oldValue = currentTask[key];
      const newValue = updates[key];
      
      // Handle null/undefined values
      if (oldValue === null || oldValue === undefined || newValue === null || newValue === undefined) {
        if (oldValue !== newValue) {
          changes.push({
            fieldName: key,
            oldValue: oldValue,
            newValue: newValue
          });
        }
        return;
      }

      // Special handling for ObjectId vs string comparison
      if (['assignedToId', 'createdBy', 'updatedBy'].includes(key)) {
        const oldIdString = oldValue?.toString();
        const newIdString = newValue?.toString();
        if (oldIdString !== newIdString) {
          changes.push({
            fieldName: key,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      } 
      // Special handling for date comparison
      else if (key === 'dueDate') {
        const oldDate = new Date(oldValue).getTime();
        const newDate = new Date(newValue).getTime();
        if (oldDate !== newDate) {
          changes.push({
            fieldName: key,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }
      // For relatedTo object comparison
      else if (key === 'relatedTo') {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            fieldName: key,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }
      // For arrays, compare stringified versions
      else if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            fieldName: key,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }
      // For objects, compare stringified versions
      else if (typeof oldValue === 'object' && typeof newValue === 'object') {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            fieldName: key,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }
      // For primitive values (strings, numbers, booleans)
      else if (oldValue !== newValue) {
        changes.push({
          fieldName: key,
          oldValue: oldValue,
          newValue: newValue
        });
      }
    });

    // If no changes detected, return early without creating feed/log data
    if (changes.length === 0) {
      return res.status(200).json({
        status: 'no_changes',
        message: 'No changes detected, task details remain the same',
        data: currentTask
      });
    }

    // Apply updates only if there are changes (skip excluded fields)
    Object.keys(updates).forEach(key => {
      if (!excludedFields.includes(key) && !['tenantId', 'ownerId'].includes(key)) {
        currentTask[key] = updates[key];
      }
    });

    // Set updatedBy field only if there are actual changes
    if (changes.length > 0) {
      currentTask.updatedBy = ownerId || req.user?.id;
    }

    // Save the updated task
    const updatedTask = await currentTask.save();

    // Create feedData and logData ONLY when there are actual changes
    res.locals.feedData = {
      tenantId: currentTask.tenantId,
      feedType: 'update',
      action: {
        name: 'task_updated',
        description: `Task "${currentTask.title}" was updated`,
      },
      ownerId: currentTask.ownerId,
      parentId: id,
      parentObject: 'Task',
      metadata: req.body,
      severity: 'low',
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${formatValue(oldValue)}' to '${formatValue(newValue)}'`,
      })),
      history: changes,
    };

    res.locals.logData = {
      tenantId: currentTask.tenantId,
      ownerId: currentTask.ownerId,
      processName: 'Update Task',
      requestBody: req.body,
      status: 'success',
      message: 'Task updated successfully',
      responseBody: updatedTask,
      changes: changes,
    };

    res.status(200).json({
      status: 'Task updated successfully',
      message: 'Task updated successfully',
      data: updatedTask,
      changes: changes
    });

  } catch (err) {
    // Error logging only for actual errors
    res.locals.logData = {
      tenantId: req.body?.tenantId,
      ownerId: req.body?.ownerId,
      processName: 'Update Task',
      requestBody: req.body,
      message: err.message,
      status: 'error'
    };

    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

// Helper function to format values for display
function formatValue(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'object') return '[Object]';
  if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
  return value.toString();
}

const deleteTask = async(req,res)=>{
  res.locals.loggedByController = true;
  res.locals.processName = "Delete Tasks";
  const { id } = req.params;

  try {

    // const { tenantId, ownerId } = req.body;

    const canDelete = await hasPermission(res.locals?.effectivePermissions?.Tasks, 'Delete');
    if (!canDelete) {
      return res.status(403).json({ message: 'Forbidden: missing Task.Delete permission' });
    }

    // Find the task to ensure it exists and user has permission
    const task = await Task.findOne({
      _id: id,
      // tenantId,
      // ownerId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it'
      });
    }

    // Delete the task
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: 'success',
      message: 'Task deleted successfully',
    
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  getTaskById,
  deleteTask
};
