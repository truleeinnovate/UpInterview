// v1.0.0 - Ashraf - Added subject field
//<----v1.0.1----Venkatesh----add validation
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
    // v1.0.0 <----------------------------------------------------
    subject: { type: String, required: true, maxlength: 150 },
    // v1.0.0 --------------------------------------------->

    issueType: { type: String, required: true },
    status: { type: String, default: "New" },
    priority: { type: String, default: "Medium" },
    assignedTo: { type: String, default: "Ashraf" },
    assignedToId: { type: String, default: "67f7792abd343483ba4c642e" },
    description: { type: String, required: true, maxlength: 1000 },//<----v1.0.1----
    statusHistory: [StatusHistorySchema],
    attachment: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },
    // createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },//<----v1.0.1----
    // updatedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: { type: String, required: true },//<----v1.0.1----
    tenantId: { type: String, required: true },//<----v1.0.1----
  },
  { timestamps: true }
);

// Add indexes for createdAt and updatedAt
TicketSchema.index({ createdAt: 1 }); // Index for ascending order
TicketSchema.index({ updatedAt: 1 }); // Index for ascending order

module.exports = mongoose.model("SupportUser", TicketSchema);
