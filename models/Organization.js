const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    firstName: String
});

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = { Organization };