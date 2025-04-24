export const notificationPreferences = {
  email: {
    interviewReminders: true,
    assessmentResults: true,
    billingAlerts: true,
    securityAlerts: true,
    newsletterUpdates: false,
    teamUpdates: true,
    systemMaintenance: true,
    productUpdates: true,
    marketingCommunications: false
  },
  push: {
    interviewReminders: true,
    assessmentResults: true,
    billingAlerts: true,
    securityAlerts: true,
    newsletterUpdates: false,
    teamUpdates: true,
    systemMaintenance: false,
    productUpdates: true,
    marketingCommunications: false
  },
  sms: {
    interviewReminders: true,
    assessmentResults: false,
    billingAlerts: true,
    securityAlerts: true,
    newsletterUpdates: false,
    teamUpdates: false,
    systemMaintenance: true,
    productUpdates: false,
    marketingCommunications: false
  }
}

export const notificationSchedule = {
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/Los_Angeles'
  },
  weekendDelivery: false,
  urgentOverride: true
}

export const recentNotifications = [
  {
    id: 1,
    type: 'interview',
    title: 'Upcoming Interview',
    message: 'Interview scheduled with John Doe tomorrow at 2:00 PM',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    priority: 'high',
    actions: ['View Details', 'Reschedule']
  },
  {
    id: 2,
    type: 'assessment',
    title: 'Assessment Completed',
    message: 'Technical assessment for Frontend Developer position completed',
    timestamp: '2024-01-14T15:45:00Z',
    read: true,
    priority: 'medium',
    actions: ['View Results']
  },
  {
    id: 3,
    type: 'billing',
    title: 'Payment Success',
    message: 'Monthly subscription payment processed successfully',
    timestamp: '2024-01-01T00:00:00Z',
    read: true,
    priority: 'low',
    actions: ['View Invoice']
  },
  {
    id: 4,
    type: 'security',
    title: 'New Login',
    message: 'New login detected from San Francisco, CA',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    priority: 'high',
    actions: ['Review Activity', 'Secure Account']
  }
]

export const notificationCategories = [
  {
    id: 'interviews',
    name: 'Interviews',
    description: 'Updates about scheduled interviews and related activities',
    enabled: true
  },
  {
    id: 'assessments',
    name: 'Assessments',
    description: 'Information about technical assessments and results',
    enabled: true
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    description: 'Payment confirmations, invoice reminders, and billing updates',
    enabled: true
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Account security and authentication notifications',
    enabled: true
  },
  {
    id: 'system',
    name: 'System Updates',
    description: 'Maintenance schedules and system status updates',
    enabled: true
  }
]