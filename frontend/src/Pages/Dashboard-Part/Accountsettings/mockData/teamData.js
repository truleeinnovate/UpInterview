export const teamMembers = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Engineering Lead',
    department: 'Engineering',
    email: 'sarah.chen@techcorp.com',
    location: 'San Francisco',
    joinDate: '2020-03-15',
    status: 'active',
    permissions: ['admin', 'interviewer'],
    expertise: ['Frontend', 'System Design', 'Architecture'],
    interviewCount: 145,
    rating: 4.8,
    availability: {
      timezone: 'America/Los_Angeles',
      weeklyHours: 10,
      preferredTimes: ['morning', 'afternoon']
    },
    ipAccess: {
      allowedIPs: ['192.168.1.1', '10.0.0.1'],
      enforceIPRestriction: true
    }
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Senior Technical Recruiter',
    department: 'HR',
    email: 'michael.r@techcorp.com',
    location: 'New York',
    joinDate: '2021-06-01',
    status: 'active',
    permissions: ['recruiter', 'interviewer'],
    expertise: ['Technical Screening', 'Culture Fit'],
    interviewCount: 230,
    rating: 4.9,
    availability: {
      timezone: 'America/New_York',
      weeklyHours: 20,
      preferredTimes: ['morning', 'evening']
    },
    ipAccess: {
      allowedIPs: ['192.168.1.2'],
      enforceIPRestriction: false
    }
  },
  {
    id: 3,
    name: 'Emily Watson',
    role: 'Product Manager',
    department: 'Product',
    email: 'emily.w@techcorp.com',
    location: 'San Francisco',
    joinDate: '2020-08-15',
    status: 'active',
    permissions: ['interviewer'],
    expertise: ['Product Strategy', 'User Experience'],
    interviewCount: 89,
    rating: 4.7,
    availability: {
      timezone: 'America/Los_Angeles',
      weeklyHours: 5,
      preferredTimes: ['afternoon']
    },
    ipAccess: {
      allowedIPs: [],
      enforceIPRestriction: false
    }
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Backend Engineer',
    department: 'Engineering',
    email: 'david.kim@techcorp.com',
    location: 'San Francisco',
    joinDate: '2021-02-15',
    status: 'active',
    permissions: ['interviewer'],
    expertise: ['Backend', 'System Design', 'Algorithms'],
    interviewCount: 112,
    rating: 4.6,
    availability: {
      timezone: 'America/Los_Angeles',
      weeklyHours: 8,
      preferredTimes: ['morning']
    },
    ipAccess: {
      allowedIPs: ['192.168.1.3'],
      enforceIPRestriction: true
    }
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'HR Director',
    department: 'HR',
    email: 'lisa.t@techcorp.com',
    location: 'New York',
    joinDate: '2020-04-01',
    status: 'active',
    permissions: ['admin', 'recruiter'],
    expertise: ['Leadership', 'Culture Fit'],
    interviewCount: 178,
    rating: 4.9,
    availability: {
      timezone: 'America/New_York',
      weeklyHours: 15,
      preferredTimes: ['morning', 'afternoon', 'evening']
    },
    ipAccess: {
      allowedIPs: ['10.0.0.2', '192.168.1.4'],
      enforceIPRestriction: true
    }
  }
]

export const teamStats = {
  totalMembers: 135,
  activeInterviewers: 45,
  averageRating: 4.7,
  totalInterviews: 3240,
  departmentBreakdown: [
    { department: 'Engineering', count: 45 },
    { department: 'Product', count: 20 },
    { department: 'Sales', count: 30 },
    { department: 'Marketing', count: 15 },
    { department: 'HR', count: 25 }
  ],
  locationBreakdown: [
    { location: 'San Francisco', count: 85 },
    { location: 'New York', count: 50 }
  ],
  roleBreakdown: [
    { role: 'Interviewer', count: 45 },
    { role: 'Recruiter', count: 30 },
    { role: 'Admin', count: 10 },
    { role: 'Regular', count: 50 }
  ]
}

export const teamPermissions = {
  roles: [
    {
      name: 'Admin',
      permissions: [
        'manage_team',
        'manage_settings',
        'view_analytics',
        'conduct_interviews',
        'manage_questions',
        'manage_billing'
      ]
    },
    {
      name: 'Recruiter',
      permissions: [
        'schedule_interviews',
        'view_candidates',
        'manage_candidates',
        'view_analytics'
      ]
    },
    {
      name: 'Interviewer',
      permissions: [
        'conduct_interviews',
        'view_schedule',
        'provide_feedback'
      ]
    },
    {
      name: 'Regular',
      permissions: [
        'view_schedule',
        'view_basic_info'
      ]
    }
  ],
  customRoles: [
    {
      name: 'Senior Interviewer',
      permissions: [
        'conduct_interviews',
        'view_schedule',
        'provide_feedback',
        'manage_questions',
        'mentor_interviewers'
      ]
    }
  ]
}