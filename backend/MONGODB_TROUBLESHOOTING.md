# MongoDB Connection Troubleshooting Guide

## Current Issue
You're experiencing MongoDB connection timeouts with the error:
```
MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
```

## Root Causes & Solutions

### 1. Azure App Service Configuration Issues

**Problem**: Azure App Service may have network restrictions or connection limits.

**Solutions**:
- ✅ **Updated connection timeouts** in `index.js` (60-90 seconds)
- ✅ **Increased connection pool size** (20 max, 5 min)
- ✅ **Added retry mechanism** with 5 attempts
- ✅ **Disabled mongoose buffering** to prevent timeout issues

### 2. Environment Variables

**Check if MONGODB_URI is properly set**:
```bash
# Run the debug script
node debug-mongodb.js
```

**Common Azure App Service issues**:
- Environment variables not set in Azure App Service Configuration
- Wrong connection string format
- Network security rules blocking connections

### 3. MongoDB Atlas/Azure Cosmos DB Issues

**If using MongoDB Atlas**:
- Check IP whitelist (add Azure App Service IP ranges)
- Verify connection string format
- Check cluster status and performance

**If using Azure Cosmos DB**:
- Verify connection string includes all required parameters
- Check if the service is in the same region as your App Service

### 4. Network Connectivity

**Azure App Service to MongoDB**:
- Ensure MongoDB is accessible from Azure App Service
- Check if using private endpoints (may need VNet integration)
- Verify firewall rules allow connections

## Immediate Actions

### 1. Check Environment Variables
```bash
# In Azure App Service Console or locally
echo $MONGODB_URI
```

### 2. Test Connection
```bash
# Run the debug script
node debug-mongodb.js
```

### 3. Check Health Endpoints
```bash
# Main health check
curl https://your-app.azurewebsites.net/health

# Simple health check for load balancers
curl https://your-app.azurewebsites.net/health/simple

# Detailed health check with database test
curl https://your-app.azurewebsites.net/health/detailed

# Readiness probe for Kubernetes/Azure
curl https://your-app.azurewebsites.net/ready

# Liveness probe for Kubernetes/Azure
curl https://your-app.azurewebsites.net/live
```

### 4. Monitor Logs
The updated code now includes:
- ✅ Enhanced connection logging
- ✅ Connection state monitoring (every 30 seconds)
- ✅ Detailed error reporting
- ✅ Graceful error handling with 503 responses

## Configuration Changes Made

### 1. Enhanced MongoDB Options
```javascript
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000, // 60 seconds
  socketTimeoutMS: 90000, // 90 seconds
  connectTimeoutMS: 60000, // 60 seconds
  maxPoolSize: 20, // Increased for Azure
  minPoolSize: 5,
  bufferMaxEntries: 0, // Disable buffering
  bufferCommands: false,
  retryReads: true,
  heartbeatFrequencyMS: 10000
};
```

### 2. Connection Retry Logic
- 5 retry attempts with 5-second delays
- Detailed logging for each attempt
- Graceful failure handling

### 3. Database Connection Middleware
- Checks connection state before processing requests
- Returns 503 status for database issues
- Prevents cascading failures

## Next Steps

1. **Deploy the updated code** to Azure App Service
2. **Run the debug script** to verify connection
3. **Monitor the logs** for connection status
4. **Check Azure App Service logs** for any platform issues
5. **Verify environment variables** are set correctly

## Common Azure App Service Environment Variables

Make sure these are set in Azure App Service Configuration:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NODE_ENV=production
```

## Monitoring

The updated application now provides:
- Real-time connection state monitoring
- Detailed error logging
- Multiple health check endpoints:
  - `/health` - Main health check with detailed information
  - `/health/simple` - Simple health check for load balancers
  - `/health/detailed` - Detailed health check with database ping test
  - `/ready` - Readiness probe for Kubernetes/Azure
  - `/live` - Liveness probe for Kubernetes/Azure
- Graceful degradation when database is unavailable

## Support

If issues persist:
1. Check Azure App Service logs
2. Verify MongoDB service status
3. Test connection from Azure App Service console
4. Review network security configurations 