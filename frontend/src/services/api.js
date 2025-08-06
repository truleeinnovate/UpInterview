const API_BASE_URL = process.env.NODE_ENV ? 'http://localhost:3001/api' : '/api';

class ApiService {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      // Check if response is HTML (likely 404 or server error)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`API endpoint ${endpoint} returned non-JSON response, using mock data`);
        return this.getEmptyResponse(endpoint);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`API Error for ${endpoint}:`, error.message, '- Using mock data');
      // Return empty data structure to prevent crashes
      return this.getEmptyResponse(endpoint);
    }
  }

  getEmptyResponse(endpoint) {
    const emptyResponses = {
      '/kpis': {
        totalInterviews: 0,
        outsourcedInterviews: 0,
        upcomingInterviews: 0,
        noShows: 0,
        assessmentsCompleted: 0,
        averageScore: '0.0',
        billableInterviews: 0
      },
      '/charts': {
        interviewsOverTime: [],
        interviewerUtilization: [],
        assessmentStats: [],
        ratingDistribution: [],
        noShowTrends: [],
        cycleTimeTrends: []
      }
    };
    return emptyResponses[endpoint] || [];
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getKPIs() {
    return this.get('/kpis');
  }

  async getChartData() {
    return this.get('/charts');
  }

  // Data endpoints
  async getInterviews(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/interviews?${params}`);
  }

  async getInterviewers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/interviewers?${params}`);
  }

  async getAssessments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/assessments?${params}`);
  }

  async getCandidates(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/candidates?${params}`);
  }

  async getOrganizations() {
    return this.get('/organizations');
  }

  async getReportTemplates(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/report-templates?${params}`);
  }

  // Trends endpoints
  async getTopSkills() {
    return this.get('/trends/skills');
  }

  async getTopExternalInterviewers() {
    return this.get('/trends/external-interviewers');
  }

  // Export endpoints
  async exportCSV(data, filename) {
    return this.post('/export/csv', { data, filename });
  }

  async exportPDF(data, filename) {
    return this.post('/export/pdf', { data, filename });
  }

  // Filter endpoints
  async getFilterPresets(page, reportType) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (reportType) params.append('reportType', reportType);
    return this.get(`/filters/presets?${params}`);
  }

  async saveFilterPreset(preset) {
    return this.post('/filters/presets', preset);
  }

  async deleteFilterPreset(presetId) {
    const response = await fetch(`${API_BASE_URL}/filters/presets/${presetId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async updateFilterPresetUsage(presetId, executionTime, resultCount) {
    return this.post(`/filters/presets/${presetId}/usage`, { executionTime, resultCount });
  }

  async getFilterFields(reportType) {
    return this.get(`/filters/fields/${reportType}`);
  }

  async logFilterApplication(filters, context, performance) {
    return this.post('/filters/applied', { filters, context, performance });
  }

  async getFilterAnalytics(days, page, reportType) {
    const params = new URLSearchParams();
    if (days) params.append('days', days);
    if (page) params.append('page', page);
    if (reportType) params.append('reportType', reportType);
    return this.get(`/filters/analytics?${params}`);
  }

  // Column management endpoints
  async getColumnConfiguration(reportType) {
    return this.get(`/columns/${reportType}`);
  }

  async saveColumnConfiguration(reportType, columns, layout) {
    return this.post('/columns/save', { reportType, columns, layout });
  }

  async resetColumnConfiguration(reportType) {
    const response = await fetch(`${API_BASE_URL}/columns/${reportType}/reset`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getAvailableColumns(reportType) {
    return this.get(`/columns/available/${reportType}`);
  }

  async getDashboardLayout() {
    return this.get('/columns/dashboard/layout');
  }

  async saveDashboardLayout(layout) {
    return this.post('/columns/dashboard/layout', layout);
  }

  // Grouping endpoints
  async saveGroupingConfiguration(reportType, grouping) {
    return this.post('/columns/grouping/save', { reportType, grouping });
  }

  async getGroupingConfiguration(reportType) {
    return this.get(`/columns/grouping/${reportType}`);
  }

  // Report configuration endpoints
  async getDashboardConfig() {
    return this.get('/reports/dashboard/config');
  }

  async saveDashboardConfig(config) {
    return this.post('/reports/dashboard/config', config);
  }

  async getTrendsConfig() {
    return this.get('/reports/trends/config');
  }

  async saveTrendsConfig(config) {
    return this.post('/reports/trends/config', config);
  }
}

export default new ApiService();