export const candidates = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    experience: {
      years: 8,
      level: 'senior',
      currentRole: 'Senior Frontend Developer',
      currentCompany: 'Tech Corp'
    },
    education: {
      degree: 'B.S. Computer Science',
      university: 'Stanford University',
      graduationYear: 2015
    },
    skills: [
      { name: 'React', years: 5, level: 'expert' },
      { name: 'TypeScript', years: 4, level: 'advanced' },
      { name: 'Node.js', years: 3, level: 'intermediate' }
    ],
    preferredRoles: ['Frontend Lead', 'Full Stack Developer'],
    status: 'active',
    stage: 'technical_interview',
    appliedDate: '2024-01-15T08:00:00Z',
    source: 'linkedin',
    tags: ['frontend', 'react', 'typescript'],
    documents: {
      resume: 'path/to/resume.pdf',
      coverLetter: 'path/to/cover-letter.pdf',
      portfolio: 'https://portfolio.com'
    },
    interviews: [
      {
        id: 1,
        type: 'technical',
        date: '2024-01-20T15:00:00Z',
        interviewer: 'Sarah Chen',
        status: 'scheduled',
        position: 'Senior Frontend Developer'
      }
    ],
    assessments: [
      {
        id: 1,
        type: 'coding',
        score: 85,
        completedDate: '2024-01-18T14:30:00Z',
        duration: 120,
        status: 'completed'
      }
    ],
    notes: [
      {
        id: 1,
        author: 'Michael Rodriguez',
        content: 'Strong technical background with excellent communication skills',
        date: '2024-01-16T10:00:00Z',
        visibility: 'team'
      }
    ]
  },
  {
    id: 2,
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.j@email.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    experience: {
      years: 5,
      level: 'mid',
      currentRole: 'Product Manager',
      currentCompany: 'StartupCo'
    },
    education: {
      degree: 'MBA',
      university: 'Columbia University',
      graduationYear: 2018
    },
    skills: [
      { name: 'Product Strategy', years: 5, level: 'advanced' },
      { name: 'Agile', years: 4, level: 'expert' },
      { name: 'User Research', years: 3, level: 'advanced' }
    ],
    preferredRoles: ['Senior Product Manager', 'Product Lead'],
    status: 'active',
    stage: 'cultural_fit',
    appliedDate: '2024-01-14T09:00:00Z',
    source: 'referral',
    tags: ['product', 'management', 'agile'],
    documents: {
      resume: 'path/to/resume.pdf',
      coverLetter: 'path/to/cover-letter.pdf'
    },
    interviews: [
      {
        id: 2,
        type: 'cultural',
        date: '2024-01-19T16:00:00Z',
        interviewer: 'Lisa Thompson',
        status: 'completed',
        position: 'Senior Product Manager',
        feedback: {
          rating: 4.5,
          strengths: ['Leadership', 'Communication'],
          improvements: ['Technical depth'],
          recommendation: 'Move forward'
        }
      }
    ],
    assessments: [
      {
        id: 2,
        type: 'case_study',
        score: 90,
        completedDate: '2024-01-17T11:00:00Z',
        duration: 90,
        status: 'completed'
      }
    ],
    notes: [
      {
        id: 2,
        author: 'Lisa Thompson',
        content: 'Strong product sense and leadership potential',
        date: '2024-01-17T14:00:00Z',
        visibility: 'team'
      }
    ]
  }
]

export const candidateStatuses = [
  { id: 'active', name: 'Active', color: 'green' },
  { id: 'on_hold', name: 'On Hold', color: 'yellow' },
  { id: 'rejected', name: 'Rejected', color: 'red' },
  { id: 'withdrawn', name: 'Withdrawn', color: 'gray' },
  { id: 'hired', name: 'Hired', color: 'blue' }
]

export const candidateStages = [
  { id: 'applied', name: 'Applied', order: 1 },
  { id: 'screening', name: 'Screening', order: 2 },
  { id: 'assessment', name: 'Assessment', order: 3 },
  { id: 'technical_interview', name: 'Technical Interview', order: 4 },
  { id: 'cultural_fit', name: 'Cultural Fit', order: 5 },
  { id: 'reference_check', name: 'Reference Check', order: 6 },
  { id: 'offer', name: 'Offer', order: 7 },
  { id: 'hired', name: 'Hired', order: 8 }
]

export const candidateSources = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
  { id: 'referral', name: 'Employee Referral', icon: 'users' },
  { id: 'website', name: 'Company Website', icon: 'globe' },
  { id: 'agency', name: 'Recruitment Agency', icon: 'building' },
  { id: 'job_board', name: 'Job Board', icon: 'briefcase' }
]