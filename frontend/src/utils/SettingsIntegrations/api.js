// API utility functions for consistent error handling and request management
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }
  return response.json();
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0, { error: error.message });
  }
};

export const api = {
  // Integrations
  getIntegrations: () => apiRequest('/api/integrations'),
  createIntegration: (data) => apiRequest('/api/integrations', { method: 'POST', body: data }),
  updateIntegration: (id, data) => apiRequest(`/api/integrations/${id}`, { method: 'PUT', body: data }),
  deleteIntegration: (id) => apiRequest(`/api/integrations/${id}`, { method: 'DELETE' }),

  // API Keys
  getApiKeys: () => apiRequest('/api/api-keys'),
  createApiKey: (data) => apiRequest('/api/api-keys', { method: 'POST', body: data }),
  deleteApiKey: (id) => apiRequest(`/api/api-keys/${id}`, { method: 'DELETE' }),

  // Webhook Logs
  getWebhookLogs: () => apiRequest('/api/webhook-logs'),
  testWebhook: (data) => apiRequest('/api/test-webhook', { method: 'POST', body: data }),

  // External APIs (for testing)
  createCandidate: (data, apiKey) => apiRequest('/api/external/candidates', {
    method: 'POST',
    body: data,
    headers: { 'X-API-Key': apiKey }
  }),
  updateCandidateStatus: (id, data, apiKey) => apiRequest(`/api/external/candidates/${id}/status`, {
    method: 'PUT',
    body: data,
    headers: { 'X-API-Key': apiKey }
  }),
  createPosition: (data, apiKey) => apiRequest('/api/external/positions', {
    method: 'POST',
    body: data,
    headers: { 'X-API-Key': apiKey }
  }),
  scheduleInterview: (data, apiKey) => apiRequest('/api/external/interviews', {
    method: 'POST',
    body: data,
    headers: { 'X-API-Key': apiKey }
  })
};

export { ApiError };