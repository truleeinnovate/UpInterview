const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: false,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    webhookUrl: {
      type: String,
      required: true,
      trim: true,
    },
    secret: {
      type: String,
      default: '',
    },
    events: [{
      type: String,
      trim: true,
    }],
    platformTemplate: {
      type: String,
      trim: true,
      default: '',
    },
    baseUrl: {
      type: String,
      trim: true,
      default: ''
    },
    authentication: {
      type: {
        type: String,
        enum: ['hmac_signature', 'bearer_token', 'api_key', 'basic_auth', 'oauth2', 'jwt_token', 'custom_header'],
        default: 'hmac_signature',
      },
      bearerToken: {
        type: String,
        default: '',
      },
      apiKey: {
        headerName: {
          type: String,
          default: 'X-API-Key',
        },
        keyValue: {
          type: String,
          default: '',
        },
      },
      basicAuth: {
        username: {
          type: String,
          default: '',
        },
        password: {
          type: String,
          default: '',
        },
      },
      hmacSecret: {
        type: String,
        default: '',
      },
      oauth2: {
        clientId: {
          type: String,
          default: '',
        },
        clientSecret: {
          type: String,
          default: '',
        },
        tokenUrl: {
          type: String,
          default: '',
        },
        scope: {
          type: String,
          default: '',
        },
      },
      customHeader: {
        name: {
          type: String,
          default: '',
        },
        value: {
          type: String,
          default: '',
        },
      },
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// integrationSchema.index({ name: 1, organization: 1 }, { unique: true });

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;
