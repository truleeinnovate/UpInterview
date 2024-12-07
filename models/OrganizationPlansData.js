const mongoose = require('mongoose');

const OrganizationPlansDataSchema = new mongoose.Schema({
    planName: { type: String, required: true, unique: true },
    priceMonthly: { type: Number, required: true },
    priceYearly: { type: Number, required: true },
    users: { type: Number, required: true },
    schedules: { type: Number, required: true },
    hoursPerSession: { type: Number, required: true },
    outsourceInterviewers: { type: String, required: true },
    bandwidth: { type: String, required: true }
});

module.exports = mongoose.model('OrganizationPlansData', OrganizationPlansDataSchema);