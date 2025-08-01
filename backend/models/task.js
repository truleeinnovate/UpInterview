const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
  taskCode:{type:String,unique:true},
  title: { type: String},
  assignedTo: { type: String },
  assignedToId: { type: String },
  priority: { type: String },
  status: { type: String},
  relatedTo: {
    objectName: { type: String },
    recordId: { type: mongoose.Schema.Types.ObjectId },
    recordName: { type: String },
    // recordId: { type: String } 
  },
  dueDate: { type: Date },
  comments: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  ownerId: {type:String, required:true},
  tenantId: {type:String},
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
module.exports = Task;
