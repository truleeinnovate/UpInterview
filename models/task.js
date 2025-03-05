const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String},
  assignedTo: { type: String },
  priority: { type: String },
  status: { type: String},
  relatedTo: {
    objectName: { type: String },
    recordId: { type: mongoose.Schema.Types.ObjectId }
    // recordId: { type: String } 
  },
  dueDate: { type: Date },
  comments: { type: String },
  // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', },
  // createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;