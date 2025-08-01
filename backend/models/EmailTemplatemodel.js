const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
    }, // Each customer/tenant has their own templates

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    systemTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailTemplate',
        default: null
    }, // Points to the system template if it's a tenant-specific copy

    name: {
        type: String,
        required: true
    },
    //Unique template name per tenant

    subject: {
        type: String,
        required: true
    }, // Email subject

    body: {
        type: String,
        required: true
    }, // Email content (HTML supported)

    placeholders: [{
        type: String
    }], // Dynamic placeholders (e.g., "{{candidateName}}")

    category: {
        type: String,
        // enum: ['interview', 'assessment', 'notification', 'general'], 
        required: true
    }, // Template category

    isActive: {
        type: Boolean,
        default: true
    }, // Whether the template is active

    isSystemTemplate: {
        type: Boolean,
        default: false
    }, // True for system-generated default templates
    visibility: {
        type: String,
        enum: ['customer', 'super_admin'],
        default: 'public'
    }
    // version: { 
    //     type: Number, 
    //     default: 1 
    // }, // Tracks changes and versions

    // attachments: [{
    //     fileName: { type: String },
    //     fileType: { type: String },
    //     fileUrl: { type: String }
    // }], // Optional attachments (stored in cloud storage)

});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);



