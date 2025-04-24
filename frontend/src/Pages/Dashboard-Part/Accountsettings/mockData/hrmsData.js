export const integrations = [
  {
    id: 1,
    name: 'Workday',
    type: 'HRMS',
    status: 'active',
    connected: true,
    lastSync: '2024-01-20T15:30:00Z',
    apiKey: 'wday_xyz789',
    endpoint: 'https://api.workday.com/ccx/v1/',
    syncConfig: {
      employees: true,
      departments: true,
      positions: true,
      jobPostings: true
    },
    syncFrequency: 'hourly',
    metrics: {
      totalSyncs: 720,
      successRate: 99.8,
      lastSyncDuration: '45s',
      recordsSynced: 1500
    }
  },
  {
    id: 2,
    name: 'Greenhouse',
    type: 'ATS',
    status: 'active',
    connected: true,
    lastSync: '2024-01-20T15:00:00Z',
    apiKey: 'gh_abc123',
    endpoint: 'https://harvest.greenhouse.io/v1/',
    syncConfig: {
      candidates: true,
      jobs: true,
      applications: true,
      interviews: true
    },
    syncFrequency: '15min',
    metrics: {
      totalSyncs: 2880,
      successRate: 99.9,
      lastSyncDuration: '30s',
      recordsSynced: 5000
    }
  }
]

export const availableIntegrations = [
  {
    id: 'workday',
    name: 'Workday',
    type: 'HRMS',
    logo: 'https://example.com/workday-logo.png',
    description: 'Connect with Workday for seamless HR data synchronization',
    features: [
      'Employee data sync',
      'Department structure',
      'Position management',
      'Job posting integration'
    ],
    setupSteps: [
      'Generate API credentials in Workday',
      'Configure endpoint URLs',
      'Set up data mapping',
      'Test connection'
    ]
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    type: 'ATS',
    logo: 'https://example.com/greenhouse-logo.png',
    description: 'Integrate with Greenhouse for automated recruitment workflow',
    features: [
      'Candidate sync',
      'Job posting sync',
      'Application tracking',
      'Interview scheduling'
    ],
    setupSteps: [
      'Create API key in Greenhouse',
      'Configure webhook endpoints',
      'Set up data mapping',
      'Test connection'
    ]
  }
]

export const syncHistory = [
  {
    id: 1,
    integration: 'Workday',
    timestamp: '2024-01-20T15:30:00Z',
    status: 'success',
    duration: '45s',
    recordsProcessed: 150,
    type: 'full_sync'
  },
  {
    id: 2,
    integration: 'Greenhouse',
    timestamp: '2024-01-20T15:00:00Z',
    status: 'success',
    duration: '30s',
    recordsProcessed: 75,
    type: 'incremental_sync'
  }
]

export const integrationMetrics = {
  totalIntegrations: 2,
  activeIntegrations: 2,
  totalSyncs: 3600,
  averageSyncDuration: '37.5s',
  successRate: 99.85,
  recordsSynced: 6500,
  syncsByType: {
    employees: 1500,
    departments: 50,
    positions: 200,
    candidates: 3000,
    applications: 1750
  }
}