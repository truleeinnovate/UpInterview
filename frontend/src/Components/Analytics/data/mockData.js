// Mock data for Interview SaaS Analytics Dashboard - Frontend

export const interviews = [
  {
    id: 'INT001',
    candidateName: 'John Smith',
    candidateId: 'CAND001',
    interviewerName: 'Sarah Johnson',
    interviewerId: 'INTV001',
    interviewerType: 'internal',
    position: 'Frontend Developer',
    type: 'technical',
    status: 'completed',
    date: '2024-01-15',
    time: '10:00',
    duration: 60,
    score: 8.5,
    feedback: 'Strong technical skills, good communication',
    rating: 4.5,
    billable: false,
    noShow: false,
    cycleTime: 5
  },
  {
    id: 'INT002',
    candidateName: 'Emily Davis',
    candidateId: 'CAND002',
    interviewerName: 'Michael Chen',
    interviewerId: 'INTV002',
    interviewerType: 'external',
    position: 'Backend Developer',
    type: 'technical',
    status: 'completed',
    date: '2024-01-15',
    time: '14:00',
    duration: 90,
    score: 9.2,
    feedback: 'Excellent problem-solving abilities',
    rating: 5.0,
    billable: true,
    noShow: false,
    cycleTime: 3
  },
  {
    id: 'INT003',
    candidateName: 'Robert Wilson',
    candidateId: 'CAND003',
    interviewerName: 'Lisa Anderson',
    interviewerId: 'INTV003',
    interviewerType: 'internal',
    position: 'Product Manager',
    type: 'behavioral',
    status: 'no-show',
    date: '2024-01-16',
    time: '09:00',
    duration: 0,
    score: 0,
    feedback: 'Candidate did not attend',
    rating: 0,
    billable: false,
    noShow: true,
    cycleTime: 0
  },
  {
    id: 'INT004',
    candidateName: 'Maria Garcia',
    candidateId: 'CAND004',
    interviewerName: 'David Brown',
    interviewerId: 'INTV004',
    interviewerType: 'external',
    position: 'UX Designer',
    type: 'portfolio',
    status: 'scheduled',
    date: '2024-01-20',
    time: '11:00',
    duration: 60,
    score: 0,
    feedback: '',
    rating: 0,
    billable: true,
    noShow: false,
    cycleTime: 0
  },
  {
    id: 'INT005',
    candidateName: 'James Taylor',
    candidateId: 'CAND005',
    interviewerName: 'Jennifer White',
    interviewerId: 'INTV005',
    interviewerType: 'internal',
    position: 'Data Scientist',
    type: 'technical',
    status: 'completed',
    date: '2024-01-17',
    time: '15:30',
    duration: 75,
    score: 7.8,
    feedback: 'Good analytical skills, needs improvement in communication',
    rating: 3.8,
    billable: false,
    noShow: false,
    cycleTime: 7
  },
  {
    id: 'INT006',
    candidateName: 'Anna Martinez',
    candidateId: 'CAND006',
    interviewerName: 'Alex Thompson',
    interviewerId: 'INTV006',
    interviewerType: 'external',
    position: 'DevOps Engineer',
    type: 'technical',
    status: 'completed',
    date: '2024-01-18',
    time: '13:00',
    duration: 90,
    score: 8.9,
    feedback: 'Exceptional infrastructure knowledge',
    rating: 4.8,
    billable: true,
    noShow: false,
    cycleTime: 4
  },
  {
    id: 'INT007',
    candidateName: 'Kevin Lee',
    candidateId: 'CAND007',
    interviewerName: 'Rachel Green',
    interviewerId: 'INTV007',
    interviewerType: 'internal',
    position: 'Marketing Manager',
    type: 'behavioral',
    status: 'cancelled',
    date: '2024-01-19',
    time: '16:00',
    duration: 0,
    score: 0,
    feedback: 'Interview cancelled by candidate',
    rating: 0,
    billable: false,
    noShow: false,
    cycleTime: 0
  },
  {
    id: 'INT008',
    candidateName: 'Sophie Turner',
    candidateId: 'CAND008',
    interviewerName: 'Mark Robinson',
    interviewerId: 'INTV008',
    interviewerType: 'external',
    position: 'Full Stack Developer',
    type: 'technical',
    status: 'scheduled',
    date: '2024-01-22',
    time: '10:30',
    duration: 120,
    score: 0,
    feedback: '',
    rating: 0,
    billable: true,
    noShow: false,
    cycleTime: 0
  }
];

export const interviewers = [
  {
    id: 'INTV001',
    name: 'Sarah Johnson',
    type: 'internal',
    skills: ['JavaScript', 'React', 'Node.js'],
    rating: 4.7,
    totalInterviews: 45,
    specialization: 'Frontend Development',
    availability: 'high'
  },
  {
    id: 'INTV002',
    name: 'Michael Chen',
    type: 'external',
    skills: ['Python', 'Django', 'PostgreSQL'],
    rating: 4.9,
    totalInterviews: 32,
    specialization: 'Backend Development',
    availability: 'medium'
  },
  {
    id: 'INTV003',
    name: 'Lisa Anderson',
    type: 'internal',
    skills: ['Leadership', 'Product Strategy', 'Agile'],
    rating: 4.6,
    totalInterviews: 28,
    specialization: 'Product Management',
    availability: 'high'
  },
  {
    id: 'INTV004',
    name: 'David Brown',
    type: 'external',
    skills: ['UI/UX', 'Figma', 'Design Systems'],
    rating: 4.8,
    totalInterviews: 23,
    specialization: 'UX Design',
    availability: 'low'
  },
  {
    id: 'INTV005',
    name: 'Jennifer White',
    type: 'internal',
    skills: ['Machine Learning', 'Python', 'Statistics'],
    rating: 4.5,
    totalInterviews: 18,
    specialization: 'Data Science',
    availability: 'medium'
  },
  {
    id: 'INTV006',
    name: 'Alex Thompson',
    type: 'external',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    rating: 4.9,
    totalInterviews: 35,
    specialization: 'DevOps',
    availability: 'high'
  },
  {
    id: 'INTV007',
    name: 'Rachel Green',
    type: 'internal',
    skills: ['Digital Marketing', 'Analytics', 'Strategy'],
    rating: 4.4,
    totalInterviews: 22,
    specialization: 'Marketing',
    availability: 'medium'
  },
  {
    id: 'INTV008',
    name: 'Mark Robinson',
    type: 'external',
    skills: ['React', 'Node.js', 'MongoDB'],
    rating: 4.7,
    totalInterviews: 29,
    specialization: 'Full Stack Development',
    availability: 'high'
  }
];

export const assessments = [
  {
    id: 'ASSESS001',
    candidateId: 'CAND001',
    candidateName: 'John Smith',
    type: 'technical',
    status: 'passed',
    score: 85,
    maxScore: 100,
    completedDate: '2024-01-15',
    skills: ['JavaScript', 'React'],
    timeSpent: 45
  },
  {
    id: 'ASSESS002',
    candidateId: 'CAND002',
    candidateName: 'Emily Davis',
    type: 'technical',
    status: 'passed',
    score: 92,
    maxScore: 100,
    completedDate: '2024-01-15',
    skills: ['Python', 'Django'],
    timeSpent: 38
  },
  {
    id: 'ASSESS003',
    candidateId: 'CAND004',
    candidateName: 'Maria Garcia',
    type: 'design',
    status: 'pending',
    score: 0,
    maxScore: 100,
    completedDate: null,
    skills: ['UI/UX', 'Figma'],
    timeSpent: 0
  },
  {
    id: 'ASSESS004',
    candidateId: 'CAND005',
    candidateName: 'James Taylor',
    type: 'technical',
    status: 'failed',
    score: 65,
    maxScore: 100,
    completedDate: '2024-01-17',
    skills: ['Python', 'Machine Learning'],
    timeSpent: 52
  },
  {
    id: 'ASSESS005',
    candidateId: 'CAND006',
    candidateName: 'Anna Martinez',
    type: 'technical',
    status: 'passed',
    score: 89,
    maxScore: 100,
    completedDate: '2024-01-18',
    skills: ['AWS', 'Docker'],
    timeSpent: 42
  }
];

export const candidates = [
  {
    id: 'CAND001',
    name: 'John Smith',
    position: 'Frontend Developer',
    stage: 'technical_interview',
    status: 'active',
    appliedDate: '2024-01-10',
    experience: '3 years',
    location: 'New York, NY',
    skills: ['JavaScript', 'React', 'CSS']
  },
  {
    id: 'CAND002',
    name: 'Emily Davis',
    position: 'Backend Developer',
    stage: 'final_interview',
    status: 'active',
    appliedDate: '2024-01-12',
    experience: '5 years',
    location: 'San Francisco, CA',
    skills: ['Python', 'Django', 'PostgreSQL']
  },
  {
    id: 'CAND003',
    name: 'Robert Wilson',
    position: 'Product Manager',
    stage: 'screening',
    status: 'inactive',
    appliedDate: '2024-01-14',
    experience: '7 years',
    location: 'Chicago, IL',
    skills: ['Product Strategy', 'Agile', 'Analytics']
  },
  {
    id: 'CAND004',
    name: 'Maria Garcia',
    position: 'UX Designer',
    stage: 'portfolio_review',
    status: 'active',
    appliedDate: '2024-01-16',
    experience: '4 years',
    location: 'Austin, TX',
    skills: ['UI/UX', 'Figma', 'User Research']
  },
  {
    id: 'CAND005',
    name: 'James Taylor',
    position: 'Data Scientist',
    stage: 'technical_interview',
    status: 'active',
    appliedDate: '2024-01-11',
    experience: '6 years',
    location: 'Seattle, WA',
    skills: ['Python', 'Machine Learning', 'Statistics']
  },
  {
    id: 'CAND006',
    name: 'Anna Martinez',
    position: 'DevOps Engineer',
    stage: 'offer_extended',
    status: 'active',
    appliedDate: '2024-01-13',
    experience: '5 years',
    location: 'Denver, CO',
    skills: ['AWS', 'Docker', 'Kubernetes']
  },
  {
    id: 'CAND007',
    name: 'Kevin Lee',
    position: 'Marketing Manager',
    stage: 'screening',
    status: 'cancelled',
    appliedDate: '2024-01-15',
    experience: '4 years',
    location: 'Los Angeles, CA',
    skills: ['Digital Marketing', 'Analytics', 'SEO']
  },
  {
    id: 'CAND008',
    name: 'Sophie Turner',
    position: 'Full Stack Developer',
    stage: 'screening',
    status: 'active',
    appliedDate: '2024-01-18',
    experience: '4 years',
    location: 'Boston, MA',
    skills: ['React', 'Node.js', 'MongoDB']
  }
];

export const organizations = [
  {
    id: 'ORG001',
    name: 'TechCorp Inc.',
    type: 'client',
    industry: 'Technology',
    size: '500-1000',
    contractStart: '2023-06-01',
    interviewsCompleted: 125,
    activePositions: 8
  },
  {
    id: 'ORG002',
    name: 'FinanceFlow Ltd.',
    type: 'client',
    industry: 'Finance',
    size: '100-500',
    contractStart: '2023-09-01',
    interviewsCompleted: 67,
    activePositions: 5
  }
];

export const reportTemplates = [
  {
    id: 'RPT001',
    name: 'Weekly Interview Summary',
    type: 'interview',
    description: 'Summary of all interviews conducted in the past week',
    status: 'active',
    lastGenerated: '2024-01-15',
    frequency: 'weekly'
  },
  {
    id: 'RPT002',
    name: 'Monthly Interview Analytics',
    type: 'interview',
    description: 'Comprehensive monthly interview performance and trends analysis',
    status: 'active',
    lastGenerated: '2024-01-10',
    frequency: 'monthly'
  },
  {
    id: 'RPT003',
    name: 'Interview Success Rate Report',
    type: 'interview',
    description: 'Analysis of interview success rates by position and interviewer',
    status: 'draft',
    lastGenerated: null,
    frequency: 'quarterly'
  },
  {
    id: 'RPT004',
    name: 'Interviewer Performance Report',
    type: 'interviewer',
    description: 'Performance metrics for all interviewers',
    status: 'active',
    lastGenerated: '2024-01-14',
    frequency: 'monthly'
  },
  {
    id: 'RPT005',
    name: 'External Interviewer Utilization',
    type: 'interviewer',
    description: 'Utilization and cost analysis for external interviewers',
    status: 'active',
    lastGenerated: '2024-01-12',
    frequency: 'weekly'
  },
  {
    id: 'RPT006',
    name: 'Interviewer Feedback Quality',
    type: 'interviewer',
    description: 'Analysis of interviewer feedback quality and timeliness',
    status: 'draft',
    lastGenerated: null,
    frequency: 'monthly'
  },
  {
    id: 'RPT007',
    name: 'Assessment Analytics',
    type: 'assessment',
    description: 'Analysis of assessment results and trends',
    status: 'active',
    lastGenerated: '2024-01-13',
    frequency: 'monthly'
  },
  {
    id: 'RPT008',
    name: 'Technical Assessment Performance',
    type: 'assessment',
    description: 'Deep dive into technical assessment scores and patterns',
    status: 'active',
    lastGenerated: '2024-01-11',
    frequency: 'weekly'
  },
  {
    id: 'RPT009',
    name: 'Assessment Completion Rates',
    type: 'assessment',
    description: 'Analysis of assessment completion rates and time-to-complete',
    status: 'archived',
    lastGenerated: '2024-01-05',
    frequency: 'quarterly'
  },
  {
    id: 'RPT010',
    name: 'Candidate Pipeline Report',
    type: 'candidate',
    description: 'Overview of candidate progress through interview stages',
    status: 'active',
    lastGenerated: '2024-01-13',
    frequency: 'weekly'
  },
  {
    id: 'RPT011',
    name: 'Candidate Source Analysis',
    type: 'candidate',
    description: 'Analysis of candidate sources and conversion rates',
    status: 'active',
    lastGenerated: '2024-01-09',
    frequency: 'monthly'
  },
  {
    id: 'RPT012',
    name: 'Candidate Experience Survey',
    type: 'candidate',
    description: 'Candidate feedback and experience metrics',
    status: 'draft',
    lastGenerated: null,
    frequency: 'quarterly'
  },
  {
    id: 'RPT013',
    name: 'Client Performance Dashboard',
    type: 'organization',
    description: 'Performance metrics by client organization',
    status: 'active',
    lastGenerated: '2024-01-10',
    frequency: 'quarterly'
  },
  {
    id: 'RPT014',
    name: 'Organization Hiring Trends',
    type: 'organization',
    description: 'Hiring trends and patterns by client organization',
    status: 'active',
    lastGenerated: '2024-01-08',
    frequency: 'monthly'
  },
  {
    id: 'RPT015',
    name: 'Client Satisfaction Report',
    type: 'organization',
    description: 'Client satisfaction metrics and feedback analysis',
    status: 'draft',
    lastGenerated: null,
    frequency: 'quarterly'
  }
];

// Helper functions for data analysis
export const getKPIData = () => {
  const totalInterviews = interviews.length;
  const outsourcedInterviews = interviews.filter(i => i.interviewerType === 'external').length;
  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled' && new Date(i.date) >= new Date()).length;
  const noShows = interviews.filter(i => i.noShow || i.status === 'no-show').length;
  const assessmentsCompleted = assessments.filter(a => a.status !== 'pending').length;
  const averageScore = interviews.filter(i => i.score > 0).reduce((sum, i) => sum + i.score, 0) / interviews.filter(i => i.score > 0).length;
  const billableInterviews = interviews.filter(i => i.billable).length;

  return {
    totalInterviews,
    outsourcedInterviews,
    upcomingInterviews,
    noShows,
    assessmentsCompleted,
    averageScore: averageScore.toFixed(1),
    billableInterviews
  };
};

export const getChartData = () => {
  // Interviews over time
  const interviewsOverTime = [
    { date: '2024-01-15', interviews: 2, outsourced: 1 },
    { date: '2024-01-16', interviews: 1, outsourced: 0 },
    { date: '2024-01-17', interviews: 1, outsourced: 0 },
    { date: '2024-01-18', interviews: 1, outsourced: 1 },
    { date: '2024-01-19', interviews: 1, outsourced: 0 },
    { date: '2024-01-20', interviews: 1, outsourced: 1 },
    { date: '2024-01-22', interviews: 1, outsourced: 1 }
  ];

  // Interviewer utilization
  const interviewerUtilization = interviewers.map(interviewer => ({
    name: interviewer.name.split(' ')[0],
    interviews: interviews.filter(i => i.interviewerId === interviewer.id).length,
    type: interviewer.type
  }));

  // Assessment pass/fail
  const assessmentStats = [
    { name: 'Passed', value: assessments.filter(a => a.status === 'passed').length, color: '#22c55e' },
    { name: 'Failed', value: assessments.filter(a => a.status === 'failed').length, color: '#ef4444' },
    { name: 'Pending', value: assessments.filter(a => a.status === 'pending').length, color: '#f59e0b' }
  ];

  // Feedback rating distribution
  const ratingDistribution = [
    { rating: '1-2', count: interviews.filter(i => i.rating >= 1 && i.rating < 3).length },
    { rating: '3-4', count: interviews.filter(i => i.rating >= 3 && i.rating < 4).length },
    { rating: '4-5', count: interviews.filter(i => i.rating >= 4 && i.rating <= 5).length }
  ];

  // No-show trends
  const noShowTrends = [
    { date: '2024-01-15', noShows: 0 },
    { date: '2024-01-16', noShows: 1 },
    { date: '2024-01-17', noShows: 0 },
    { date: '2024-01-18', noShows: 0 },
    { date: '2024-01-19', noShows: 1 },
    { date: '2024-01-20', noShows: 0 },
    { date: '2024-01-21', noShows: 0 }
  ];

  // Cycle time trends
  const cycleTimeTrends = [
    { date: '2024-01-15', avgCycleTime: 4 },
    { date: '2024-01-16', avgCycleTime: 0 },
    { date: '2024-01-17', avgCycleTime: 7 },
    { date: '2024-01-18', avgCycleTime: 4 },
    { date: '2024-01-19', avgCycleTime: 0 },
    { date: '2024-01-20', avgCycleTime: 0 },
    { date: '2024-01-21', avgCycleTime: 0 }
  ];

  return {
    interviewsOverTime,
    interviewerUtilization,
    assessmentStats,
    ratingDistribution,
    noShowTrends,
    cycleTimeTrends
  };
};

export const getTopSkills = () => {
  const skillCount = {};
  candidates.forEach(candidate => {
    candidate.skills.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });

  return Object.entries(skillCount)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getTopExternalInterviewers = () => {
  return interviewers
    .filter(i => i.type === 'external')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(i => ({
      name: i.name,
      rating: i.rating,
      interviews: i.totalInterviews,
      specialization: i.specialization
    }));
};