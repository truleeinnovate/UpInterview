const mongoose = require("mongoose");

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: String },
  notifyUser: { type: Boolean },
  userComment: { type: String },
  comment: { type: String },
});

const TicketSchema = new mongoose.Schema(
  {
    ticketCode: { type: String, unique: true },
    contact: { type: String, required: true },
    organization: { type: String },
    issueType: { type: String, required: true },
    status: { type: String, default: "New" },
    priority: { type: String, default: "Medium" },
    assignedTo: { type: String, default: "Ashraf" },
    assignedToId: { type: String, default: "67f7792abd343483ba4c642e" },
    description: { type: String },
    statusHistory: [StatusHistorySchema],
    attachment: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: String,
    tenantId: String,
  },
  { timestamps: true }
);

// Add indexes for createdAt and updatedAt
TicketSchema.index({ createdAt: 1 }); // Index for ascending order
TicketSchema.index({ updatedAt: 1 }); // Index for ascending order

module.exports = mongoose.model("SupportUser", TicketSchema);
