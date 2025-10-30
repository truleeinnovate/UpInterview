const mongoose = require('mongoose');

const organizationRequestSchema = new mongoose.Schema({
  organizationRequestCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  // status: {
  //     type: String,
  //     enum: ['requested', 'contacted', 'contacted1', 'contacted2', 'approved'],
  //     default: 'requested'
  // },

  status: {
    type: String,
    enum: [
      'pending_review',    // Submitted, waiting for review
      'in_contact',        // Currently in contact or multiple follow-ups happening
      'under_verification', // Verification documents / details being checked
      'approved',          // Successfully verified
      'rejected'           // (optional) If the org is not approved
    ],
    default: 'pending_review'
  },
  comments: String,
  statusHistory: [{
    status: String,
    comments: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }
});

organizationRequestSchema.index({ tenantId: 1, ownerId: 1 }, { unique: true });

// Pre-save hook to generate unique organization request code
organizationRequestSchema.pre('save', async function (next) {
  try {
    // Only generate code for new documents
    if (!this.isNew || this.organizationRequestCode) {
      return next();
    }

    const maxAttempts = 5;
    let attempts = 0;
    let codeGenerated = false;

    while (attempts < maxAttempts && !codeGenerated) {
      try {
        // Find the last organization request code
        const lastOrgRequest = await mongoose.model('OrganizationRequest')
          .findOne({ organizationRequestCode: { $exists: true, $ne: null } })
          .sort({ organizationRequestCode: -1 })
          .select('organizationRequestCode')
          .lean();

        let nextNumber = 1;

        if (lastOrgRequest && lastOrgRequest.organizationRequestCode) {
          // Extract the number from the last code (ORID-0001 -> 1)
          const match = lastOrgRequest.organizationRequestCode.match(/ORID-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }

        // Add attempt offset to reduce collision probability
        nextNumber += attempts;

        // Generate the new code with 4-digit padding
        this.organizationRequestCode = `ORID-${String(nextNumber).padStart(4, '0')}`;
        
        codeGenerated = true;
        console.log(`Generated organization request code: ${this.organizationRequestCode}`);
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error('Failed to generate unique organization request code after max attempts');
          // Allow save to continue without code - controller can handle this
          return next();
        }
        // Add small delay before retry
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in organizationRequestSchema pre-save hook:', error);
    next(); // Continue without code rather than blocking the save
  }
});

// Post-save hook to handle duplicate key errors
organizationRequestSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern && error.keyPattern.organizationRequestCode) {
      // Duplicate organization request code error
      console.error('Duplicate organization request code detected:', error.keyValue?.organizationRequestCode);
      next(new Error('Failed to generate unique organization request code. Please try again.'));
    } else {
      next(error);
    }
  } else {
    next(error);
  }
});

module.exports = mongoose.model('OrganizationRequest', organizationRequestSchema);
