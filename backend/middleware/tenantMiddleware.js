// const { Tenant, User } = require('../models/AnalyticSchemas/schemas');
const Tenant = require('../models/Tenant');
const User = require("../models/Users");

/**
 * Middleware to extract and validate tenant information from request
 * Supports multiple tenant identification methods:
 * 1. Subdomain (tenant.domain.com)
 * 2. Header (X-Tenant-ID)
 * 3. Query parameter (?tenantId=xxx)
 * 4. JWT token payload
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    let tenantId = null;
    
    // Method 1: Extract from subdomain
    const host = req.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        const tenant = await Tenant.findOne({ domain: subdomain, isActive: true });
        if (tenant) {
          tenantId = tenant.tenantId;
        }
      }
    }
    
    // Method 2: Extract from header
    if (!tenantId) {
      tenantId = req.get('X-Tenant-ID');
    }
    
    // Method 3: Extract from query parameter
    if (!tenantId) {
      tenantId = req.query.tenantId;
    }
    
    // Method 4: Extract from JWT token (if available)
    if (!tenantId && req.user && req.user.tenantId) {
      tenantId = req.user.tenantId;
    }
    
    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant identification required',
        message: 'Please provide tenant information via subdomain, header, or query parameter'
      });
    }
    
    // Validate tenant exists and is active
    const tenant = await Tenant.findOne({ tenantId, isActive: true });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'The specified tenant does not exist or is inactive'
      });
    }
    
    // Check subscription status
    if (tenant.subscription.status !== 'active') {
      return res.status(403).json({
        error: 'Tenant subscription inactive',
        message: 'Please contact support to reactivate your subscription'
      });
    }
    
    // Attach tenant info to request
    req.tenant = tenant;
    req.tenantId = tenantId;
    
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process tenant information'
    });
  }
};

/**
 * Middleware to validate user permissions within tenant
 */
const userPermissionMiddleware = (requiredModule, requiredAction) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please provide valid authentication credentials'
        });
      }
      
      // Get user with permissions
      const user = await User.findOne({
        tenantId: req.tenantId,
        userId: req.user.userId,
        isActive: true
      });
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User does not exist in this tenant'
        });
      }
      
      // Check if user has required permission
      const hasPermission = user.permissions.some(permission => 
        permission.module === requiredModule && 
        permission.actions.includes(requiredAction)
      );
      
      // Admin role has all permissions
      if (user.role === 'admin' || hasPermission) {
        req.currentUser = user;
        next();
      } else {
        res.status(403).json({
          error: 'Insufficient permissions',
          message: `You don't have permission to ${requiredAction} ${requiredModule}`
        });
      }
    } catch (error) {
      console.error('User permission middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to validate user permissions'
      });
    }
  };
};

/**
 * Helper function to add tenant filter to MongoDB queries
 */
const addTenantFilter = (req, filter = {}) => {
  return {
    ...filter,
    tenantId: req.tenantId
  };
};

/**
 * Helper function to generate tenant-scoped ID
 */
const generateTenantScopedId = (tenantId, prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${tenantId}_${timestamp}_${random}`.toUpperCase();
};

module.exports = {
  tenantMiddleware,
  userPermissionMiddleware,
  addTenantFilter,
  generateTenantScopedId
};