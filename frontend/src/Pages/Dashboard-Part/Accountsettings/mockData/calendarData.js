export const calendarEvents = {
  upcoming: [
    {
      id: 1,
      title: 'Technical Interview - Senior Frontend Developer',
      candidateName: 'Alice Johnson',
      interviewers: ['Sarah Chen', 'David Kim'],
      date: '2024-02-01T14:00:00Z',
      duration: 60,
      type: 'technical',
      status: 'scheduled',
      platform: 'Zoom',
      meetingLink: 'https://zoom.us/j/123456789',
      position: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      notes: 'Focus on React, System Design, and Architecture',
      documents: [
        { name: 'Resume', url: '#' },
        { name: 'Portfolio', url: '#' }
      ]
    },
    {
      id: 2,
      title: 'Cultural Fit Interview - Product Manager',
      candidateName: 'Bob Smith',
      interviewers: ['Emily Watson', 'Lisa Thompson'],
      date: '2024-02-02T15:30:00Z',
      duration: 45,
      type: 'cultural',
      status: 'scheduled',
      platform: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      position: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      notes: 'Assess team fit and leadership potential',
      documents: [
        { name: 'Resume', url: '#' },
        { name: 'Cover Letter', url: '#' }
      ]
    }
  ],
  past: [
    {
      id: 3,
      title: 'Technical Assessment Review - Backend Developer',
      candidateName: 'Charlie Brown',
      interviewers: ['David Kim'],
      date: '2024-01-28T11:00:00Z',
      duration: 45,
      type: 'technical',
      status: 'completed',
      platform: 'Zoom',
      position: 'Backend Developer',
      department: 'Engineering',
      feedback: {
        rating: 4.5,
        strengths: ['Strong problem-solving', 'Excellent system design knowledge'],
        improvements: ['Could improve on communication'],
        recommendation: 'Move forward',
        notes: 'Candidate showed strong technical skills and good understanding of scalability'
      }
    },
    {
      id: 4,
      title: 'Initial Screening - UX Designer',
      candidateName: 'Diana Martinez',
      interviewers: ['Emily Watson'],
      date: '2024-01-27T13:00:00Z',
      duration: 30,
      type: 'screening',
      status: 'completed',
      platform: 'Google Meet',
      position: 'UX Designer',
      department: 'Design',
      feedback: {
        rating: 4.0,
        strengths: ['Great portfolio', 'Clear communication'],
        improvements: ['Limited enterprise experience'],
        recommendation: 'Move forward',
        notes: 'Good potential, would benefit from technical design round'
      }
    }
  ],
  cancelled: [
    {
      id: 5,
      title: 'Technical Interview - Mobile Developer',
      candidateName: 'Edward Wilson',
      interviewers: ['Sarah Chen'],
      date: '2024-01-29T16:00:00Z',
      duration: 60,
      type: 'technical',
      status: 'cancelled',
      reason: 'Candidate withdrew application',
      position: 'Mobile Developer',
      department: 'Engineering'
    }
  ],
  settings: {
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/Los_Angeles',
      daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
    },
    interviewDurations: [
      { label: 'Quick Screen', duration: 30 },
      { label: 'Standard', duration: 45 },
      { label: 'Extended', duration: 60 },
      { label: 'Technical Assessment', duration: 90 }
    ],
    bufferTime: 15, // minutes between interviews
    platforms: ['Zoom', 'Google Meet', 'Microsoft Teams'],
    notifications: {
      reminderTimes: [24, 1], // hours before interview
      notifyInterviewers: true,
      notifyRecruiters: true,
      notifyHiringManagers: true
    },
    autoScheduling: {
      enabled: true,
      considerInterviewerTimezone: true,
      maxInterviewsPerDay: 4,
      preferredTimes: ['morning', 'afternoon']
    }
  }
}

export const interviewTypes = [
  {
    id: 'technical',
    name: 'Technical Interview',
    description: 'In-depth technical skills assessment',
    defaultDuration: 60,
    requiredInterviewers: 2,
    templates: ['Frontend', 'Backend', 'Full Stack', 'DevOps']
  },
  {
    id: 'cultural',
    name: 'Cultural Fit',
    description: 'Assess cultural alignment and soft skills',
    defaultDuration: 45,
    requiredInterviewers: 1,
    templates: ['General', 'Leadership', 'Team Fit']
  },
  {
    id: 'screening',
    name: 'Initial Screening',
    description: 'First round basic qualification check',
    defaultDuration: 30,
    requiredInterviewers: 1,
    templates: ['General', 'Technical', 'Design']
  },
  {
    id: 'assessment',
    name: 'Technical Assessment',
    description: 'Hands-on coding or design challenge',
    defaultDuration: 90,
    requiredInterviewers: 1,
    templates: ['Coding Challenge', 'System Design', 'UI/UX Challenge']
  }
]

export const interviewLocations = [
  {
    id: 'remote',
    name: 'Remote',
    type: 'virtual',
    platforms: ['Zoom', 'Google Meet', 'Microsoft Teams']
  },
  {
    id: 'sf-office',
    name: 'San Francisco Office',
    type: 'in-person',
    address: '123 Tech Street, San Francisco, CA 94105',
    rooms: ['Interview Room 1', 'Interview Room 2', 'Conference Room A']
  },
  {
    id: 'ny-office',
    name: 'New York Office',
    type: 'in-person',
    address: '456 Innovation Ave, New York, NY 10013',
    rooms: ['Meeting Room 1', 'Interview Room A', 'Conference Room B']
  }
]

export const availabilitySchedule = {
  interviewers: [
    {
      id: 1,
      name: 'Sarah Chen',
      availability: {
        monday: ['09:00-12:00', '13:00-17:00'],
        tuesday: ['09:00-12:00', '13:00-17:00'],
        wednesday: ['13:00-17:00'],
        thursday: ['09:00-12:00', '13:00-17:00'],
        friday: ['09:00-12:00']
      },
      timezone: 'America/Los_Angeles',
      maxInterviewsPerDay: 3,
      preferredTypes: ['technical', 'assessment']
    },
    {
      id: 2,
      name: 'David Kim',
      availability: {
        monday: ['10:00-12:00', '14:00-16:00'],
        tuesday: ['10:00-12:00', '14:00-16:00'],
        wednesday: ['10:00-12:00', '14:00-16:00'],
        thursday: ['10:00-12:00', '14:00-16:00'],
        friday: ['10:00-12:00']
      },
      timezone: 'America/Los_Angeles',
      maxInterviewsPerDay: 2,
      preferredTypes: ['technical']
    }
  ],
  candidates: [
    {
      id: 1,
      name: 'Alice Johnson',
      availability: {
        dates: ['2024-02-01', '2024-02-02', '2024-02-03'],
        timeSlots: ['morning', 'afternoon']
      },
      timezone: 'America/New_York',
      preferredPlatform: 'Zoom'
    }
  ]
}