export const positions = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'full_time',
    experience: {
      minimum: 5,
      preferred: 7,
      level: 'senior'
    },
    salary: {
      min: 140000,
      max: 180000,
      currency: 'USD'
    },
    status: 'active',
    priority: 'high',
    openings: 2,
    filled: 0,
    postedDate: '2024-01-01T00:00:00Z',
    requirements: {
      essential: [
        "Bachelor\u2019s degree in Computer Science or related field",
        '5+ years of experience with React',
        'Strong TypeScript skills',
        'Experience with modern frontend architecture'
      ],
      preferred: [
        'Experience with GraphQL',
        'Contribution to open source projects',
        'Experience with micro-frontends'
      ]
    },
    skills: [
      { name: 'React', required: true, level: 'expert' },
      { name: 'TypeScript', required: true, level: 'advanced' },
      { name: 'GraphQL', required: false, level: 'intermediate' }
    ],
    interviewProcess: [
      { stage: 'screening', type: 'hr_screen', duration: 30 },
      { stage: 'technical', type: 'coding_assessment', duration: 120 },
      { stage: 'technical', type: 'technical_interview', duration: 60 },
      { stage: 'cultural', type: 'team_interview', duration: 45 }
    ],
    team: {
      hiring_manager: 'Sarah Chen',
      recruiters: ['Michael Rodriguez'],
      interviewers: ['David Kim', 'Emily Watson']
    },
    candidates: [
      {
        id: 1,
        name: 'John Smith',
        stage: 'technical_interview',
        status: 'active'
      }
    ]
  },
  {
    id: 2,
    title: 'Senior Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'full_time',
    experience: {
      minimum: 5,
      preferred: 8,
      level: 'senior'
    },
    salary: {
      min: 150000,
      max: 190000,
      currency: 'USD'
    },
    status: 'active',
    priority: 'medium',
    openings: 1,
    filled: 0,
    postedDate: '2024-01-05T00:00:00Z',
    requirements: {
      essential: [
        "Bachelor\u2019s degree required, MBA preferred",
        '5+ years of product management experience',
        'Strong analytical and strategic thinking',
        'Experience with Agile methodologies'
      ],
      preferred: [
        'Experience in B2B SaaS products',
        'Technical background',
        'Experience with data analytics'
      ]
    },
    skills: [
      { name: 'Product Strategy', required: true, level: 'expert' },
      { name: 'Agile', required: true, level: 'advanced' },
      { name: 'Data Analytics', required: false, level: 'intermediate' }
    ],
    interviewProcess: [
      { stage: 'screening', type: 'hr_screen', duration: 30 },
      { stage: 'assessment', type: 'case_study', duration: 90 },
      { stage: 'technical', type: 'product_interview', duration: 60 },
      { stage: 'cultural', type: 'team_interview', duration: 45 }
    ],
    team: {
      hiring_manager: 'Lisa Thompson',
      recruiters: ['Michael Rodriguez'],
      interviewers: ['Emily Watson', 'Sarah Chen']
    },
    candidates: [
      {
        id: 2,
        name: 'Emily Johnson',
        stage: 'cultural_fit',
        status: 'active'
      }
    ]
  }
]

export const positionStatuses = [
  { id: 'draft', name: 'Draft', color: 'gray' },
  { id: 'active', name: 'Active', color: 'green' },
  { id: 'paused', name: 'Paused', color: 'yellow' },
  { id: 'closed', name: 'Closed', color: 'red' },
  { id: 'filled', name: 'Filled', color: 'blue' }
]

export const positionTypes = [
  { id: 'full_time', name: 'Full Time' },
  { id: 'part_time', name: 'Part Time' },
  { id: 'contract', name: 'Contract' },
  { id: 'internship', name: 'Internship' },
  { id: 'temporary', name: 'Temporary' }
]

export const positionPriorities = [
  { id: 'low', name: 'Low', color: 'gray' },
  { id: 'medium', name: 'Medium', color: 'yellow' },
  { id: 'high', name: 'High', color: 'red' }
]