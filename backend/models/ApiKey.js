const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    organization: {
      type: String,
      required: true,
      trim: true
    },
    permissions: [{
      type: String,
      enum: [
        // Candidate Management
        'candidates:read', 'candidates:write', 'candidates:bulk',
        // Position Management
        'positions:read', 'positions:write', 'positions:bulk',
        // ATS Integration
        'ats:read', 'ats:write'
      ],
      required: true
    }],
    enabled: {
      type: Boolean,
      default: true
    },
    lastUsed: {
      type: Date,
      default: null
    },
    usageCount: {
      type: Number,
      default: 0
    },
    // Store owner and tenant context for automatic extraction
    ownerId: {
      type: String,
      required: false,
      ref: 'User'
    },
    tenantId: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Generate a unique API key
apiKeySchema.statics.generateKey = function() {
  return 'up_' + crypto.randomBytes(32).toString('hex');
};

// Method to mask the API key for display
apiKeySchema.methods.maskKey = function() {
  if (!this.key) return '';
  return this.key.substring(0, 8) + '•'.repeat(20) + this.key.substring(this.key.length - 4);
};

// Method to update usage with detailed analytics
apiKeySchema.methods.updateUsage = function(endpoint, isError = false) {
  const now = new Date();
  this.lastUsed = now;
  this.usageCount += 1;
  
  // Update usage analytics
  this.usageAnalytics.totalRequests += 1;
  
  // Reset counters if needed
  const lastReset = new Date(this.usageAnalytics.lastResetTime);
  if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usageAnalytics.requestsToday = 0;
  }
  if (now.getHours() !== lastReset.getHours()) {
    this.usageAnalytics.requestsThisHour = 0;
  }
  if (now.getMinutes() !== lastReset.getMinutes()) {
    this.usageAnalytics.requestsThisMinute = 0;
  }
  
  this.usageAnalytics.requestsToday += 1;
  this.usageAnalytics.requestsThisHour += 1;
  this.usageAnalytics.requestsThisMinute += 1;
  this.usageAnalytics.lastResetTime = now;
  
  if (isError) {
    this.usageAnalytics.errorCount += 1;
    this.usageAnalytics.lastError = now;
  }
  
  // Update endpoint usage
  const endpointIndex = this.usageAnalytics.endpointsUsed.findIndex(e => e.endpoint === endpoint);
  if (endpointIndex >= 0) {
    this.usageAnalytics.endpointsUsed[endpointIndex].count += 1;
    this.usageAnalytics.endpointsUsed[endpointIndex].lastUsed = now;
  } else {
    this.usageAnalytics.endpointsUsed.push({
      endpoint: endpoint,
      count: 1,
      lastUsed: now
    });
  }
  
  return this.save();
};

// Method to check rate limits
apiKeySchema.methods.checkRateLimit = function() {
  const now = new Date();
  
  // Check per minute limit
  if (this.usageAnalytics.requestsThisMinute >= this.rateLimit.requestsPerMinute) {
    return { allowed: false, limit: 'minute', resetTime: new Date(now.getTime() + 60000) };
  }
  
  // Check per hour limit
  if (this.usageAnalytics.requestsThisHour >= this.rateLimit.requestsPerHour) {
    return { allowed: false, limit: 'hour', resetTime: new Date(now.getTime() + 3600000) };
  }
  
  // Check per day limit
  if (this.usageAnalytics.requestsToday >= this.rateLimit.requestsPerDay) {
    return { allowed: false, limit: 'day', resetTime: new Date(now.getTime() + 86400000) };
  }
  
  return { allowed: true };
};

// Method to check if key is expired
apiKeySchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Method to check IP whitelist
apiKeySchema.methods.isIPAllowed = function(ip) {
  if (!this.ipAddress || this.ipAddress.length === 0) {
    return true; // No IP restrictions
  }
  return this.ipAddress.includes(ip);
};

// Method to check permissions
apiKeySchema.methods.hasPermission = function(requiredPermission) {
  if (!this.permissions || this.permissions.length === 0) {
    return false;
  }
  
  // Check for exact permission match
  if (this.permissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check for wildcard permissions (e.g., 'users:read' matches 'users:read')
  const [resource, action] = requiredPermission.split(':');
  const wildcardPermission = `${resource}:*`;
  if (this.permissions.includes(wildcardPermission)) {
    return true;
  }
  
  // Check for admin permissions
  if (this.permissions.includes('system:write')) {
    return true;
  }
  
  return false;
};

// Virtual for checking if key is valid
apiKeySchema.virtual('isValid').get(function() {
  return this.enabled && !this.isExpired();
});

// Pre-save middleware to validate expiration
apiKeySchema.pre('save', function(next) {
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.enabled = false;
  }
  next();
});

// Index for efficient queries
apiKeySchema.index({ organization: 1 });
// apiKeySchema.index({ createdBy: 1); // Removed - not tracking users
apiKeySchema.index({ enabled: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;