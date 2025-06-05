const mongoose = require("mongoose")

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: String, },
  notifyUser:{type:Boolean},
  comment: { type: String },
});

const TicketSchema = new mongoose.Schema(
  {
    contact: { type: String, required: true },
    organization: { type: String, required: true },
    issueType: { type: String, required: true },
    status: { type: String, default: 'New' },
    priority: { type: String, default: 'Medium' },
    assignedTo: { type: String, default: 'Ashraf' },
    assignedToId: { type: String, default: "67f7792abd343483ba4c642e" },
    description: { type: String },
    statusHistory: [StatusHistorySchema],
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    ownerId: String,
    tenantId: String,
  },
  { timestamps: true }
);



module.exports = mongoose.model("SupportUser", TicketSchema)