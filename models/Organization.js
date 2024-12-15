const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    firstname: String
});

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = { Organization };