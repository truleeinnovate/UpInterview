// Middleware for automatic bandwidth usage tracking
const { updateBandwidthUsage, checkBandwidthUsageLimit } = require('../services/bandwidthUsageService');


/**
 * Middleware to track bandwidth usage for file uploads
 * Should be used after multer or other file upload middleware
 */
const trackUploadBandwidth = async (req, res, next) => {
  try {
    // Get tenant and user info from request (can come from body, query, or headers)
    const tenantId = req.body?.tenantId || req.query?.tenantId || req.headers['x-tenant-id'];
    const ownerId = req.body?.ownerId || req.query?.ownerId || req.headers['x-user-id'];

    if (!tenantId) {
      console.warn('[BANDWIDTH] No tenantId found, skipping bandwidth tracking');
      return next();
    }

    // Calculate total size of uploaded files
    let totalSizeInBytes = 0;

    if (req.file) {
      // Single file upload
      totalSizeInBytes = req.file.size || req.file.buffer?.length || 0;
    } else if (req.files) {
      // Multiple files upload
      if (Array.isArray(req.files)) {
        // Array of files
        totalSizeInBytes = req.files.reduce((total, file) => {
          return total + (file.size || file.buffer?.length || 0);
        }, 0);
      } else {
        // Object with multiple fields
        for (const fieldName in req.files) {
          const fieldFiles = req.files[fieldName];
          if (Array.isArray(fieldFiles)) {
            totalSizeInBytes += fieldFiles.reduce((total, file) => {
              return total + (file.size || file.buffer?.length || 0);
            }, 0);
          }
        }
      }
    }

    if (totalSizeInBytes === 0) {
      // No files to track
      return next();
    }

    // Check if there's enough bandwidth
    const checkResult = await checkBandwidthUsageLimit(tenantId, ownerId, totalSizeInBytes);
    
    if (!checkResult.canUse) {
      // Insufficient bandwidth
      return res.status(403).json({
        success: false,
        message: checkResult.message,
        usage: checkResult.usage,
        error: 'BANDWIDTH_LIMIT_EXCEEDED'
      });
    }

    // Track the bandwidth usage
    const result = await updateBandwidthUsage(tenantId, ownerId, totalSizeInBytes, 'upload');
    
    if (result.success) {
      console.log(`[BANDWIDTH] Tracked upload: ${(totalSizeInBytes / (1024 * 1024)).toFixed(2)} MB`);
      // Store usage info in request for later use
      req.bandwidthUsage = result.usage;
    }

    next();
  } catch (error) {
    console.error('[BANDWIDTH] Error in upload tracking middleware:', error);
    // Don't block the request on tracking errors
    next();
  }
};

/**
 * Middleware to track bandwidth usage for file downloads
 * Should be used before sending file response
 */
const trackDownloadBandwidth = async (req, res, next) => {
  try {
    // Get tenant and user info from request
    const tenantId = req.query?.tenantId || req.headers['x-tenant-id'] || req.body?.tenantId;
    const ownerId = req.query?.ownerId || req.headers['x-user-id'] || req.body?.ownerId;

    if (!tenantId) {
      console.warn('[BANDWIDTH] No tenantId found, skipping bandwidth tracking');
      return next();
    }

    // Store original send methods
    const originalSend = res.send;
    const originalSendFile = res.sendFile;
    const originalDownload = res.download;
    const originalJson = res.json;

    // Helper to track bandwidth for response
    const trackResponseBandwidth = async (data) => {
      try {
        let sizeInBytes = 0;

        if (Buffer.isBuffer(data)) {
          sizeInBytes = data.length;
        } else if (typeof data === 'string') {
          sizeInBytes = Buffer.byteLength(data);
        } else if (data && typeof data === 'object') {
          sizeInBytes = Buffer.byteLength(JSON.stringify(data));
        }

        // Only track if it's a significant download (> 1KB)
        if (sizeInBytes > 1024) {
          // Check if there's enough bandwidth
          const checkResult = await checkBandwidthUsageLimit(tenantId, ownerId, sizeInBytes);
          
          if (!checkResult.canUse) {
            console.warn('[BANDWIDTH] Download would exceed bandwidth limit');
            // You might want to handle this differently
            // For now, we'll log but still allow the download
          }

          // Track the bandwidth usage
          const result = await updateBandwidthUsage(tenantId, ownerId, sizeInBytes, 'download');
          
          if (result.success) {
            console.log(`[BANDWIDTH] Tracked download: ${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`);
          }
        }
      } catch (error) {
        console.error('[BANDWIDTH] Error tracking download bandwidth:', error);
      }
    };

    // Override send method
    res.send = async function(data) {
      await trackResponseBandwidth(data);
      return originalSend.call(this, data);
    };

    // Override json method (for API responses - typically small, might skip)
    res.json = async function(data) {
      // Typically don't track JSON API responses as they're small
      return originalJson.call(this, data);
    };

    // Override sendFile method
    res.sendFile = async function(path, options, callback) {
      // Get file size
      const fs = require('fs');
      try {
        const stats = fs.statSync(path);
        const sizeInBytes = stats.size;
        
        // Check and track bandwidth
        const checkResult = await checkBandwidthUsageLimit(tenantId, ownerId, sizeInBytes);
        
        if (!checkResult.canUse) {
          const err = new Error(checkResult.message);
          err.status = 403;
          err.code = 'BANDWIDTH_LIMIT_EXCEEDED';
          if (callback) return callback(err);
          throw err;
        }

        await updateBandwidthUsage(tenantId, ownerId, sizeInBytes, 'download');
        console.log(`[BANDWIDTH] Tracked file download: ${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`);
      } catch (error) {
        console.error('[BANDWIDTH] Error tracking sendFile bandwidth:', error);
        if (error.code === 'BANDWIDTH_LIMIT_EXCEEDED') {
          if (callback) return callback(error);
          return res.status(403).json({ 
            success: false, 
            message: error.message,
            error: 'BANDWIDTH_LIMIT_EXCEEDED'
          });
        }
      }
      
      return originalSendFile.call(this, path, options, callback);
    };

    // Override download method
    res.download = async function(path, filename, options, callback) {
      // Get file size
      const fs = require('fs');
      try {
        const stats = fs.statSync(path);
        const sizeInBytes = stats.size;
        
        // Check and track bandwidth
        const checkResult = await checkBandwidthUsageLimit(tenantId, ownerId, sizeInBytes);
        
        if (!checkResult.canUse) {
          const err = new Error(checkResult.message);
          err.status = 403;
          err.code = 'BANDWIDTH_LIMIT_EXCEEDED';
          const cb = callback || options || filename;
          if (typeof cb === 'function') return cb(err);
          throw err;
        }

        await updateBandwidthUsage(tenantId, ownerId, sizeInBytes, 'download');
        console.log(`[BANDWIDTH] Tracked file download: ${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`);
      } catch (error) {
        console.error('[BANDWIDTH] Error tracking download bandwidth:', error);
        if (error.code === 'BANDWIDTH_LIMIT_EXCEEDED') {
          const cb = callback || options || filename;
          if (typeof cb === 'function') return cb(error);
          return res.status(403).json({ 
            success: false, 
            message: error.message,
            error: 'BANDWIDTH_LIMIT_EXCEEDED'
          });
        }
      }
      
      return originalDownload.call(this, path, filename, options, callback);
    };

    next();
  } catch (error) {
    console.error('[BANDWIDTH] Error in download tracking middleware:', error);
    // Don't block the request on tracking errors
    next();
  }
};

module.exports = {
  trackUploadBandwidth,
  trackDownloadBandwidth
};
