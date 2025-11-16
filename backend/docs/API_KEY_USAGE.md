# API Key Usage Guide

## Overview
This document explains how to use and implement API keys in the UpInterview application.

## Frontend Implementation
The API Keys management interface is located at:
`frontend/src/Pages/Dashboard-Part/Accountsettings/account/WebHooks/ApiKeysTab.jsx`

### Features
- ✅ Display all API keys with masking
- ✅ Generate new API keys
- ✅ Copy API keys to clipboard
- ✅ Toggle key visibility
- ✅ Delete API keys
- ✅ Permission management (read, write, delete)

## Backend Implementation

### API Endpoints

#### Get All API Keys
```
GET /api/api-keys
Headers: Authorization: Bearer <user_token>
Response: Array of API keys
```

#### Create New API Key
```
POST /api/api-keys
Headers: Authorization: Bearer <user_token>
Body: {
  "organization": "Acme Corp",
  "permissions": ["read", "write"]
}
Response: Created API key object
```

#### Delete API Key
```
DELETE /api/api-keys/:id
Headers: Authorization: Bearer <user_token>
Response: Success message
```

#### Update API Key (Enable/Disable)
```
PATCH /api/api-keys/:id
Headers: Authorization: Bearer <user_token>
Body: {
  "enabled": false
}
Response: Updated API key
```

#### Get API Key Statistics
```
GET /api/api-keys/:id/stats
Headers: Authorization: Bearer <user_token>
Response: API key usage statistics
```

### Using API Keys for Authentication

To protect API endpoints with API key authentication:

```javascript
const { validateApiKey, requirePermission } = require('../middleware/apiKeyMiddleware');

// Apply API key validation
router.use(validateApiKey);

// Require specific permissions
router.get('/protected-endpoint', requirePermission('read'), handler);
router.post('/protected-endpoint', requirePermission('write'), handler);
router.delete('/protected-endpoint', requirePermission('delete'), handler);
```

### API Key Format
- Format: `up_` + 64-character hexadecimal string
- Example: `up_a4f68a772f642262f6410e658457a694100aebcaa45fdec0fcf75ab3b533e578`

### Headers for API Key Authentication
Clients should include the API key in one of these headers:
- `X-API-Key: up_your_api_key_here`
- `Authorization: Bearer up_your_api_key_here`

## Security Features

### Key Masking
- Frontend displays only first 8 and last 4 characters
- Format: `12345678•••••••••••••••••••abcd`

### Usage Tracking
- Tracks when API keys are last used
- Counts total usage per key
- Automatic cleanup of expired keys

### Rate Limiting
- Basic rate limiting middleware included
- Configurable limits per key
- Default: 1000 requests per hour

### Permission System
- **read**: Access to GET endpoints
- **write**: Access to POST/PUT/PATCH endpoints  
- **delete**: Access to DELETE endpoints

## Example API Usage

### Using curl
```bash
# Get data with API key
curl -H "X-API-Key: up_your_api_key_here" \
     https://your-api.com/api/endpoint

# Create data with API key
curl -X POST \
     -H "X-API-Key: up_your_api_key_here" \
     -H "Content-Type: application/json" \
     -d '{"name": "test"}' \
     https://your-api.com/api/endpoint
```

### Using JavaScript
```javascript
const apiKey = 'up_your_api_key_here';

fetch('/api/protected-endpoint', {
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Error Codes

- `API_KEY_MISSING`: No API key provided
- `API_KEY_INVALID`: Invalid or disabled API key
- `API_KEY_EXPIRED`: API key has expired
- `INSUFFICIENT_PERMISSIONS`: API key lacks required permission
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Best Practices

1. **Store API keys securely** - Never expose them in client-side code
2. **Use minimal permissions** - Grant only necessary permissions
3. **Rotate keys regularly** - Replace keys periodically
4. **Monitor usage** - Track API key usage for unusual activity
5. **Use HTTPS** - Always transmit API keys over secure connections
6. **Implement rate limiting** - Prevent abuse of your API
