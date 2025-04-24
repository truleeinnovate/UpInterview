export const analyticsData = {
  overview: {
    totalInterviews: 1250,
    totalAssessments: 850,
    averageScore: 7.8,
    passRate: 68,
    timeRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    }
  },
  interviewMetrics: {
    byStatus: {
      completed: 980,
      scheduled: 180,
      cancelled: 90,
      noShow: 45
    },
    byType: {
      technical: 650,
      behavioral: 350,
      cultural: 250,
      assessment: 180
    },
    byDepartment: [
      { name: 'Engineering', count: 580 },
      { name: 'Product', count: 320 },
      { name: 'Design', count: 180 },
      { name: 'Marketing', count: 170 }
    ],
    byPosition: [
      { name: 'Software Engineer', count: 450 },
      { name: 'Product Manager', count: 280 },
      { name: 'UX Designer', count: 150 },
      { name: 'Marketing Manager', count: 120 }
    ],
    averageDuration: 55, // minutes
    timeDistribution: {
      morning: 35,
      afternoon: 45,
      evening: 20
    },
    satisfactionScore: 4.5,
    feedbackSubmissionRate: 92
  },
  assessmentMetrics: {
    byType: {
      coding: 450,
      design: 200,
      theory: 200,
      systemDesign: 150
    },
    byDifficulty: {
      easy: 250,
      medium: 400,
      hard: 200
    },
    completionRate: 85,
    averageCompletionTime: 48, // minutes
    scoreDistribution: {
      '0-20': 50,
      '21-40': 100,
      '41-60': 250,
      '61-80': 300,
      '81-100': 150
    },
    topPerformingSkills: [
      { skill: 'Problem Solving', score: 85 },
      { skill: 'Code Quality', score: 82 },
      { skill: 'System Design', score: 78 },
      { skill: 'Communication', score: 88 }
    ]
  },
  trends: {
    daily: [
      { date: '2024-01-01', interviews: 45, assessments: 30, passRate: 70 },
      { date: '2024-01-02', interviews: 42, assessments: 28, passRate: 75 },
      { date: '2024-01-03', interviews: 38, assessments: 32, passRate: 65 },
      { date: '2024-01-04', interviews: 41, assessments: 35, passRate: 68 },
      { date: '2024-01-05', interviews: 40, assessments: 30, passRate: 72 },
      { date: '2024-01-06', interviews: 35, assessments: 25, passRate: 70 },
      { date: '2024-01-07', interviews: 30, assessments: 20, passRate: 75 }
    ],
    weekly: [
      { week: '2024-W1', interviews: 280, assessments: 200, passRate: 71 },
      { week: '2024-W2', interviews: 290, assessments: 210, passRate: 69 },
      { week: '2024-W3', interviews: 285, assessments: 205, passRate: 72 },
      { week: '2024-W4', interviews: 295, assessments: 215, passRate: 70 }
    ],
    monthly: [
      { month: '2023-11', interviews: 1150, assessments: 800, passRate: 67 },
      { month: '2023-12', interviews: 1200, assessments: 820, passRate: 69 },
      { month: '2024-01', interviews: 1250, assessments: 850, passRate: 68 }
    ],
    yearOverYear: {
      interviews: {
        '2023': 12500,
        '2024': 1250
      },
      assessments: {
        '2023': 8500,
        '2024': 850
      },
      passRate: {
        '2023': 65,
        '2024': 68
      }
    }
  },
  feedback: {
    averageRating: 4.5,
    ratingDistribution: {
      1: 20,
      2: 50,
      3: 150,
      4: 400,
      5: 630
    },
    commonFeedback: [
      {
        category: 'Technical Skills',
        positive: [
          'Strong problem-solving abilities',
          'Excellent coding practices',
          'Good system design knowledge',
          'Effective debugging skills',
          'Clear technical communication'
        ],
        negative: [
          'Needs improvement in debugging',
          'Limited experience with scalability',
          'Basic knowledge of algorithms',
          'Could improve code organization',
          'Testing practices need work'
        ]
      },
      {
        category: 'Soft Skills',
        positive: [
          'Great communication',
          'Strong team collaboration',
          'Good time management',
          'Excellent problem-solving approach',
          'Clear and concise explanations'
        ],
        negative: [
          'Could improve leadership skills',
          'Sometimes struggles with feedback',
          'Needs work on conflict resolution',
          'Time management during interviews',
          'Could be more concise'
        ]
      }
    ],
    sentimentAnalysis: {
      positive: 75,
      neutral: 15,
      negative: 10
    }
  },
  interviewerPerformance: {
    topInterviewers: [
      {
        name: 'Sarah Chen',
        interviews: 145,
        rating: 4.8,
        passRate: 72,
        averageDuration: 52,
        specialties: ['Frontend', 'System Design'],
        feedbackQuality: 4.9
      },
      {
        name: 'Michael Rodriguez',
        interviews: 130,
        rating: 4.7,
        passRate: 70,
        averageDuration: 55,
        specialties: ['Backend', 'Algorithms'],
        feedbackQuality: 4.7
      },
      {
        name: 'Emily Watson',
        interviews: 125,
        rating: 4.6,
        passRate: 68,
        averageDuration: 50,
        specialties: ['Product', 'System Design'],
        feedbackQuality: 4.8
      }
    ],
    averageMetrics: {
      interviewsPerMonth: 35,
      rating: 4.5,
      passRate: 68,
      duration: 54,
      feedbackSubmissionTime: 4.2 // hours
    },
    workloadDistribution: {
      optimal: 65,
      overloaded: 20,
      underutilized: 15
    }
  },
  skillsAnalysis: {
    mostTestedSkills: [
      { name: 'JavaScript', count: 450, passRate: 72 },
      { name: 'System Design', count: 380, passRate: 65 },
      { name: 'React', count: 350, passRate: 70 },
      { name: 'Data Structures', count: 320, passRate: 68 },
      { name: 'SQL', count: 300, passRate: 75 }
    ],
    skillGaps: [
      {
        department: 'Engineering',
        gaps: [
          { skill: 'Cloud Architecture', priority: 'high' },
          { skill: 'Security', priority: 'medium' },
          { skill: 'Mobile Development', priority: 'medium' }
        ]
      },
      {
        department: 'Product',
        gaps: [
          { skill: 'Data Analytics', priority: 'high' },
          { skill: 'UX Research', priority: 'medium' },
          { skill: 'Agile Methodologies', priority: 'low' }
        ]
      }
    ],
    emergingSkills: [
      { name: 'AI/ML', demand: 'high', availability: 'low' },
      { name: 'Blockchain', demand: 'medium', availability: 'low' },
      { name: 'AR/VR', demand: 'medium', availability: 'medium' }
    ]
  },
  candidateInsights: {
    sourceEffectiveness: [
      { source: 'Internal Referral', count: 300, successRate: 75 },
      { source: 'LinkedIn', count: 450, successRate: 65 },
      { source: 'Job Boards', count: 350, successRate: 60 },
      { source: 'Company Website', count: 150, successRate: 70 }
    ],
    experienceLevels: {
      junior: { count: 400, passRate: 62 },
      midLevel: { count: 500, passRate: 70 },
      senior: { count: 350, passRate: 75 }
    },
    educationBackground: {
      bachelors: { count: 600, passRate: 65 },
      masters: { count: 400, passRate: 72 },
      phd: { count: 100, passRate: 78 },
      other: { count: 150, passRate: 60 }
    },
    geographicDistribution: [
      { region: 'North America', count: 800 },
      { region: 'Europe', count: 300 },
      { region: 'Asia', count: 250 },
      { region: 'Other', count: 150 }
    ],
    diversityMetrics: {
      gender: {
        male: 55,
        female: 40,
        nonBinary: 3,
        preferNotToSay: 2
      },
      veteranStatus: {
        veteran: 8,
        nonVeteran: 92
      },
      disabilityStatus: {
        withDisability: 5,
        withoutDisability: 95
      }
    }
  },
  processEfficiency: {
    averageTimeToHire: 25, // days
    bottlenecks: [
      { stage: 'Initial Screening', avgDuration: 3 },
      { stage: 'Technical Assessment', avgDuration: 5 },
      { stage: 'Team Interview', avgDuration: 7 },
      { stage: 'Offer Process', avgDuration: 4 }
    ],
    dropOffRates: {
      application: 20,
      screening: 15,
      assessment: 25,
      interview: 10,
      offer: 5
    },
    costPerHire: {
      average: 4500,
      byDepartment: {
        Engineering: 5000,
        Product: 4800,
        Design: 4200,
        Marketing: 3800
      }
    }
  }
}