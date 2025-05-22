const mongoose = require("mongoose")

const StatusHistorySchema = new mongoose.Schema({
    status: { type: String, required: true},
    date: { type: Date, default: Date.now },
    user: { type: String,  },
    comment: { type: String },
  });
  
  const TicketSchema = new mongoose.Schema(
    {
      contact: { type: String, required: true },
      issueType: { type: String, required: true },
      status: { type: String, default: 'New' },
      priority: { type: String, default: 'Medium' },
      createdDate: { type: Date, default: Date.now },
      owner: { type: String },
      assignedTo: { type: String, default: 'Ashraf' },
      assignedToId: { type: String, default: "67f7792abd343483ba4c642e" },
      organization: { type: String },
      description: { type: String },
    //   createdBy: { type: String, required: true },
    //   modifiedBy: { type: String },
    //   modifiedDate: { type: Date, default: Date.now },
      statusHistory: [StatusHistorySchema],
    },
    { timestamps: true }
  );
  
  

module.exports = mongoose.model("SupportUser",TicketSchema)