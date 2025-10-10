# User Bandwidth Usage Tracking Documentation

## Overview
The User Bandwidth usage tracking system monitors and limits file uploads and downloads based on subscription plans. It tracks bandwidth consumption in gigabytes (GB) and prevents operations that would exceed the allocated bandwidth limit.

## Architecture

### Components
1. **Service Layer** (`services/bandwidthUsageService.js`)
2. **Controller** (`controllers/bandwidthController.js`)  
3. **Middleware** (`middleware/bandwidthTracking.js`)
4. **Routes** (`routes/bandwidthRoutes.js`)
5. **Frontend Display** (`frontend/src/Pages/Dashboard-Part/Accountsettings/account/Usage.jsx`)

## How It Works

### 1. Subscription Setup
When a subscription is created or renewed, the bandwidth limit is set in the Usage document:
```javascript
// In RazorpayController.js
usageAttributes: [{
  type: 'User Bandwidth',
  entitled: 10,    // 10 GB limit
  utilized: 0,     // Starting usage
  remaining: 10    // Available bandwidth
}]
```

### 2. Tracking File Uploads
Add the bandwidth tracking middleware to any upload route:
```javascript
const { trackUploadBandwidth } = require('../middleware/bandwidthTracking');

router.post('/upload', 
  upload.single('file'),      // Multer middleware
  trackUploadBandwidth,        // Bandwidth tracking
  uploadHandler               // Your upload handler
);
```

### 3. Tracking File Downloads
Add the download tracking middleware to routes that serve files:
```javascript
const { trackDownloadBandwidth } = require('../middleware/bandwidthTracking');

router.get('/download/:id',
  trackDownloadBandwidth,      // Tracks download bandwidth
  downloadHandler             // Your download handler
);
```

## API Endpoints

### Check Bandwidth Usage
```http
GET /bandwidth/check?tenantId=xxx&ownerId=yyy

Response:
{
  "success": true,
  "canUse": true,
  "message": "You have 7.50 GB bandwidth remaining",
  "usage": {
    "utilized": 2.5,
    "entitled": 10,
    "remaining": 7.5,
    "percentage": 25,
    "unlimited": false
  }
}
```

### Track Bandwidth Usage
```http
POST /bandwidth/track
Content-Type: application/json

{
  "tenantId": "xxx",
  "ownerId": "yyy",
  "sizeInBytes": 104857600,  // 100 MB
  "operation": "upload"       // or "download"
}

Response:
{
  "success": true,
  "message": "Bandwidth usage tracked successfully",
  "usage": {
    "utilized": 2.6,
    "entitled": 10,
    "remaining": 7.4,
    "percentage": 26
  }
}
```

### Get Bandwidth Statistics
```http
GET /bandwidth/stats?tenantId=xxx&ownerId=yyy

Response:
{
  "success": true,
  "usage": {
    "utilized": 2.6,
    "entitled": 10,
    "remaining": 7.4,
    "percentage": 26,
    "unlimited": false
  },
  "period": {
    "message": "2.60 GB of 10 GB used"
  }
}
```

## Error Handling

### Bandwidth Limit Exceeded
When a file upload would exceed the bandwidth limit:
```javascript
{
  "success": false,
  "message": "Insufficient bandwidth. Required: 1.00 GB, Available: 0.50 GB",
  "usage": {
    "utilized": 9.5,
    "entitled": 10,
    "remaining": 0.5,
    "percentage": 95
  },
  "error": "BANDWIDTH_LIMIT_EXCEEDED"
}
```
HTTP Status: 403 Forbidden

## Frontend Integration

### Display in Usage Dashboard
The bandwidth usage is automatically displayed in the Usage dashboard with:
- Orange progress bar showing usage percentage
- Current usage in GB (e.g., "Used: 2.50 GB")
- Total limit (e.g., "Limit: 10 GB" or "Unlimited")

### Example React Component
```jsx
// In Usage.jsx
const bandwidthAttr = usage?.attributes?.find(
  (a) => a.type === "User Bandwidth"
);
const bandwidthEntitled = Number(bandwidthAttr?.entitled || 0);
const bandwidthUtilized = Number(bandwidthAttr?.utilized || 0);

<div className="bg-white p-6 rounded-lg shadow">
  <h3 className="text-lg font-medium">User Bandwidth</h3>
  <div className="mt-2">
    <div className="flex justify-between items-center">
      <span>Used: {bandwidthUtilized.toFixed(2)} GB</span>
      <span>
        Limit: {bandwidthEntitled === 0 ? "Unlimited" : `${bandwidthEntitled} GB`}
      </span>
    </div>
    <div className="mt-2 h-2 bg-gray-200 rounded-full">
      <div
        className="h-full bg-orange-600 rounded-full"
        style={{
          width: `${bandwidthEntitled > 0
            ? Math.min((bandwidthUtilized / bandwidthEntitled) * 100, 100)
            : 0
          }%`
        }}
      />
    </div>
  </div>
</div>
```

## Configuration

### Unlimited Bandwidth
Set `entitled: 0` in the subscription plan to provide unlimited bandwidth:
```javascript
{
  type: 'User Bandwidth',
  entitled: 0,      // 0 means unlimited
  utilized: 0,
  remaining: 0
}
```

### Bandwidth Limits by Plan
Configure bandwidth limits in subscription plans:
- **Starter**: 10 GB
- **Professional**: 50 GB
- **Enterprise**: 200 GB
- **Custom**: Configurable

## Testing

### Unit Test
Run the test script to verify bandwidth tracking:
```bash
node test/testBandwidthUsage.js
```

### API Testing
Use the HTTP test file with REST Client extension:
```
test/testBandwidthAPI.http
```

### Manual Testing
1. Upload a file through the application
2. Check the Usage dashboard to see bandwidth consumption
3. Try uploading when near the limit to test limit enforcement

## Best Practices

### 1. Always Track Both Upload and Download
```javascript
// Upload route
router.post('/upload', upload.single('file'), trackUploadBandwidth, handler);

// Download route  
router.get('/download/:id', trackDownloadBandwidth, handler);
```

### 2. Handle Errors Gracefully
```javascript
if (error.code === 'BANDWIDTH_LIMIT_EXCEEDED') {
  // Show user-friendly message
  notify.error('Bandwidth limit exceeded. Please upgrade your plan.');
}
```

### 3. Include TenantId and OwnerId
Always ensure `tenantId` and optionally `ownerId` are available in the request:
```javascript
// In request body
req.body.tenantId = tenantId;
req.body.ownerId = ownerId;

// Or in query params
?tenantId=xxx&ownerId=yyy

// Or in headers
headers['x-tenant-id'] = tenantId;
headers['x-user-id'] = ownerId;
```

## Troubleshooting

### Issue: Bandwidth not tracking
**Solution**: Ensure middleware is placed after multer but before your handler:
```javascript
// Correct order
router.post('/upload',
  upload.single('file'),     // 1. Multer first
  trackUploadBandwidth,       // 2. Then bandwidth tracking
  uploadHandler              // 3. Finally your handler
);
```

### Issue: "No tenantId found" warning
**Solution**: Ensure tenantId is provided in request:
```javascript
// Add to request body
formData.append('tenantId', tenantId);

// Or add to query
`/upload?tenantId=${tenantId}`
```

### Issue: Bandwidth shows as unlimited
**Solution**: Check if subscription plan has bandwidth feature:
```javascript
// In subscription plan features
{
  name: 'Bandwidth',
  limit: 10  // GB
}
```

## Migration Guide

### For Existing Routes
1. Import the tracking middleware
2. Add middleware to route definition
3. Ensure tenantId is available in request
4. Test the route

### For New Routes
Always include bandwidth tracking for routes that:
- Upload files (images, documents, CSV, etc.)
- Download files
- Stream media content
- Transfer large data

## Support
For issues or questions about bandwidth tracking, contact the development team or check the implementation in the referenced files.
