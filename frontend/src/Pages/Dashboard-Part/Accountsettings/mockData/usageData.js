export const usageMetrics = {
  currentPeriod: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z',
    daysRemaining: 16,
    utilizationRate: 75 // percentage
  },
  interviews: {
    total: 25,
    limit: 30,
    utilizationRate: 83.33,
    trending: 'up',
    breakdown: [
      { date: '2024-01-01', count: 3, success: 3, cancelled: 0 },
      { date: '2024-01-02', count: 2, success: 2, cancelled: 0 },
      { date: '2024-01-03', count: 4, success: 3, cancelled: 1 },
      { date: '2024-01-04', count: 3, success: 3, cancelled: 0 },
      { date: '2024-01-05', count: 5, success: 4, cancelled: 1 },
      { date: '2024-01-06', count: 4, success: 4, cancelled: 0 },
      { date: '2024-01-07', count: 4, success: 4, cancelled: 0 }
    ],
    byType: {
      technical: 15,
      behavioral: 7,
      cultural: 3
    }
  },
  assessments: {
    total: 15,
    limit: 30,
    utilizationRate: 50,
    trending: 'stable',
    breakdown: [
      { date: '2024-01-01', count: 2, completed: 2, pending: 0 },
      { date: '2024-01-02', count: 1, completed: 1, pending: 0 },
      { date: '2024-01-03', count: 3, completed: 2, pending: 1 },
      { date: '2024-01-04', count: 2, completed: 2, pending: 0 },
      { date: '2024-01-05', count: 3, completed: 3, pending: 0 },
      { date: '2024-01-06', count: 2, completed: 1, pending: 1 },
      { date: '2024-01-07', count: 2, completed: 2, pending: 0 }
    ],
    byType: {
      coding: 8,
      design: 4,
      theory: 3
    }
  },
  bandwidth: {
    used: 3.5, // GB
    total: 5, // GB
    utilizationRate: 70,
    trending: 'up',
    breakdown: [
      { date: '2024-01-01', usage: 0.5, type: 'interview' },
      { date: '2024-01-02', usage: 0.4, type: 'assessment' },
      { date: '2024-01-03', usage: 0.6, type: 'interview' },
      { date: '2024-01-04', usage: 0.5, type: 'mixed' },
      { date: '2024-01-05', usage: 0.7, type: 'interview' },
      { date: '2024-01-06', usage: 0.4, type: 'assessment' },
      { date: '2024-01-07', usage: 0.4, type: 'mixed' }
    ]
  },
  activeUsers: {
    current: 25,
    limit: 50,
    utilizationRate: 50,
    trending: 'up',
    breakdown: [
      { role: 'Admin', count: 3, active: 3 },
      { role: 'Interviewer', count: 12, active: 10 },
      { role: 'Recruiter', count: 10, active: 8 }
    ],
    byLocation: {
      'San Francisco': 15,
      'New York': 10
    },
    byDepartment: {
      'Engineering': 10,
      'HR': 8,
      'Product': 7
    }
  },
  peakUsage: {
    time: '14:00-16:00',
    day: 'Wednesday',
    bandwidth: '0.7 GB',
    concurrent: 12
  }
}