//<------v1.0.0---Venkatesh-----add validations

const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
  taskCode:{type:String,unique:true, required: true},
  title: { type: String, required: true},
  assignedTo: { type: String, required: true },
  assignedToId: { type: String },
  priority: { type: String, required: true },
  status: { type: String, required: true},
  relatedTo: {
    objectName: { type: String, required: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recordName: { type: String },
    // recordId: { type: String } 
  },
  dueDate: { type: Date, required: true },
  comments: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  ownerId: {type:String, required:true},
  tenantId: {type:String},
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
module.exports = Task;
