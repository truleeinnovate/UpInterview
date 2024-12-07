const mongoose = require('mongoose');

const formatDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

const NotificationSchema = new mongoose.Schema({
    Title:String,
    Body:String,
    Status: String,
    CreatedDate: { type: String, default: formatDateTime },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
});

NotificationSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = formatDateTime();
    } else {
        this.ModifiedDate = new Date();
    }
    next();
});


const Notifications= mongoose.model("Notifications", NotificationSchema);
module.exports = Notifications;