export const webhooks = [
  {
    id: 1,
    name: 'Interview Scheduled',
    event: 'interview.scheduled',
    endpoint: 'https://api.example.com/webhooks/interview-scheduled',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    lastTriggered: '2024-01-20T15:30:00Z',
    secret: 'whsec_abcdef123456',
    description: 'Triggered when a new interview is scheduled',
    retryConfig: {
      maxAttempts: 3,
      backoffRate: 2
    },
    headers: {
      'X-Custom-Header': 'custom-value'
    },
    successRate: 98.5,
    recentDeliveries: [
      {
        id: 'del_1',
        timestamp: '2024-01-20T15:30:00Z',
        status: 'success',
        responseCode: 200,
        responseTime: 245
      },
      {
        id: 'del_2',
        timestamp: '2024-01-19T14:20:00Z',
        status: 'success',
        responseCode: 200,
        responseTime: 189
      }
    ]
  },
  {
    id: 2,
    name: 'Assessment Completed',
    event: 'assessment.completed',
    endpoint: 'https://api.example.com/webhooks/assessment-completed',
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    lastTriggered: '2024-01-18T11:45:00Z',
    secret: 'whsec_xyz789abc',
    description: 'Triggered when a candidate completes an assessment',
    retryConfig: {
      maxAttempts: 5,
      backoffRate: 1.5
    },
    headers: {
      'Authorization': 'Bearer {{API_KEY}}'
    },
    successRate: 100,
    recentDeliveries: [
      {
        id: 'del_3',
        timestamp: '2024-01-18T11:45:00Z',
        status: 'success',
        responseCode: 200,
        responseTime: 156
      }
    ]
  }
]

export const webhookEvents = [
  {
    id: 'interview.scheduled',
    name: 'Interview Scheduled',
    description: 'Triggered when a new interview is scheduled',
    payload: {
      interviewId: 'string',
      candidateId: 'string',
      interviewerId: 'string',
      scheduledTime: 'datetime',
      duration: 'number',
      type: 'string'
    }
  },
  {
    id: 'interview.completed',
    name: 'Interview Completed',
    description: 'Triggered when an interview is marked as completed',
    payload: {
      interviewId: 'string',
      outcome: 'string',
      feedback: 'object',
      duration: 'number'
    }
  },
  {
    id: 'assessment.started',
    name: 'Assessment Started',
    description: 'Triggered when a candidate starts an assessment',
    payload: {
      assessmentId: 'string',
      candidateId: 'string',
      startTime: 'datetime',
      type: 'string'
    }
  },
  {
    id: 'assessment.completed',
    name: 'Assessment Completed',
    description: 'Triggered when a candidate completes an assessment',
    payload: {
      assessmentId: 'string',
      candidateId: 'string',
      completionTime: 'datetime',
      score: 'number',
      duration: 'number'
    }
  },
  {
    id: 'candidate.created',
    name: 'Candidate Created',
    description: 'Triggered when a new candidate is created',
    payload: {
      candidateId: 'string',
      profile: 'object',
      source: 'string'
    }
  }
]

export const webhookStats = {
  totalWebhooks: 5,
  activeWebhooks: 4,
  totalDeliveries: 1250,
  successRate: 98.5,
  averageResponseTime: 180,
  deliveriesByStatus: {
    success: 1230,
    failed: 20,
    pending: 0
  },
  deliveriesByEvent: {
    'interview.scheduled': 450,
    'interview.completed': 400,
    'assessment.completed': 300,
    'candidate.created': 100
  }
}