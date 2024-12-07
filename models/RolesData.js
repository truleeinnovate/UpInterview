const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    label: {
        type: String,
    },
    roleName: {
        type: String,
    },
    reportsToRoleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
      },
    description: {
        type: String,
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
    },
    organizationId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      }
});

module.exports = mongoose.model('Role', RoleSchema);