const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    label:{type: String,
        //required: true
        },
    roleName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    objects: {
        type: Schema.Types.Mixed,
        default: {},
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    level: {
        type: Number,
    },
inherits: {
    type: [Schema.Types.ObjectId],
    ref: 'Role',
    default: [],
},
    // canAssign: {
    //     type: [Schema.Types.ObjectId],
    //     ref: 'Role',
    //     default: [],
    // }, //we are not using this field for now in future we can use it
    // reportsToRoleId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Role',
    // },
    createdBy: {
        type: String,
    },
    tenantId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
    }
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);


