// Keeping the full content but fixing the syntax error in the last feedback object
// where 'isConsolidated' was incorrectly written as 'isConsoli dated'

export const candidates = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    experience: 5,
    resume: 'https://example.com/resume/john-doe',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '234-567-8901',
    experience: 3,
    resume: 'https://example.com/resume/jane-smith',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    phone: '345-678-9012',
    experience: 7,
    resume: 'https://example.com/resume/michael-johnson',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  }
];

export const positions = [
  {
    id: '1',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    templateId: '1'
  },
  {
    id: '2',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'New York',
    templateId: '2'
  },
  {
    id: '3',
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco',
    templateId: '3'
  }
];

export const interviewers = [
  {
    id: '1',
    name: 'Alice Brown',
    email: 'alice.brown@company.com',
    department: 'Engineering',
    isExternal: false,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '2',
    name: 'Bob Wilson',
    email: 'bob.wilson@company.com',
    department: 'Engineering',
    isExternal: false,
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '3',
    name: 'Carol Martinez',
    email: 'carol.martinez@company.com',
    department: 'HR',
    isExternal: false,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david.lee@consultancy.com',
    department: 'Technical Consultant',
    isExternal: true
  }
];

export const questions = [
  {
    id: '1',
    text: 'Explain the difference between let, const, and var in JavaScript.',
    category: 'Technical'
  },
  {
    id: '2',
    text: 'What is your experience with React hooks?',
    category: 'Technical'
  },
  {
    id: '3',
    text: 'Describe a challenging project you worked on and how you overcame obstacles.',
    category: 'Behavioral'
  },
  {
    id: '4',
    text: 'How do you handle tight deadlines?',
    category: 'Managerial'
  },
  {
    id: '5',
    text: 'What are your salary expectations?',
    category: 'HR'
  },
  {
    id: '6',
    text: 'Where do you see yourself in 5 years?',
    category: 'HR'
  },
  {
    id: '7',
    text: 'Explain database normalization.',
    category: 'Technical'
  },
  {
    id: '8',
    text: 'How would you design a scalable API?',
    category: 'Technical'
  }
];

export const interviewTemplates = [
  {
    id: '1',
    name: 'Frontend Developer Interview Process',
    description: 'Standard interview process for frontend developer positions',
    rounds: [
      {
        id: '1-1',
        name: 'Initial Screening',
        type: 'HR',
        mode: 'Phone',
        interviewers: ['3'],
        questions: ['5', '6'],
        sequence: 1
      },
      {
        id: '1-2',
        name: 'Technical Assessment',
        type: 'Technical',
        mode: 'Video',
        interviewers: ['1', '2'],
        questions: ['1', '2'],
        sequence: 2
      },
      {
        id: '1-3',
        name: 'Final Interview',
        type: 'Managerial',
        mode: 'In-person',
        interviewers: ['1', '3'],
        questions: ['3', '4'],
        sequence: 3
      }
    ]
  },
  {
    id: '2',
    name: 'Backend Developer Interview Process',
    description: 'Standard interview process for backend developer positions',
    rounds: [
      {
        id: '2-1',
        name: 'Initial Screening',
        type: 'HR',
        mode: 'Phone',
        interviewers: ['3'],
        questions: ['5', '6'],
        sequence: 1
      },
      {
        id: '2-2',
        name: 'Technical Assessment',
        type: 'Technical',
        mode: 'Video',
        interviewers: ['2', '4'],
        questions: ['7', '8'],
        sequence: 2
      },
      {
        id: '2-3',
        name: 'Final Interview',
        type: 'Managerial',
        mode: 'In-person',
        interviewers: ['2', '3'],
        questions: ['3', '4'],
        sequence: 3
      }
    ]
  },
  {
    id: '3',
    name: 'Product Manager Interview Process',
    description: 'Standard interview process for product manager positions',
    rounds: [
      {
        id: '3-1',
        name: 'Initial Screening',
        type: 'HR',
        mode: 'Phone',
        interviewers: ['3'],
        questions: ['5', '6'],
        sequence: 1
      },
      {
        id: '3-2',
        name: 'Product Case Study',
        type: 'Technical',
        mode: 'Video',
        interviewers: ['1', '3'],
        questions: ['3', '4'],
        sequence: 2
      },
      {
        id: '3-3',
        name: 'Final Interview',
        type: 'Managerial',
        mode: 'In-person',
        interviewers: ['3'],
        questions: ['3', '4'],
        sequence: 3
      }
    ]
  }
];

export const interviews = [
  {
    id: '1',
    candidateId: '1',
    positionId: '1',
    templateId: '1',
    status: 'In Progress',
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-20T14:30:00Z',
    rounds: [
      {
        id: '1-1',
        name: 'Initial Screening',
        type: 'HR',
        mode: 'Phone',
        interviewers: ['3'],
        questions: ['5', '6'],
        status: 'Completed',
        feedback: 'Candidate has good communication skills and relevant experience.',
        detailedFeedback: {
          overallRating: 4,
          skillRatings: [
            { skill: 'Communication', rating: 4, comments: 'Articulate and clear' },
            { skill: 'Cultural Fit', rating: 5, comments: 'Aligns well with company values' }
          ],
          communicationRating: 4,
          questionsAsked: ['Tell me about yourself', 'Why do you want to work here?'],
          comments: 'Strong candidate with good potential',
          recommendation: 'Yes',
          isConsolidated: true
        },
        feedbacks: [
          {
            overallRating: 4,
            skillRatings: [
              { skill: 'Communication', rating: 4, comments: 'Articulate and clear' },
              { skill: 'Cultural Fit', rating: 5, comments: 'Aligns well with company values' }
            ],
            communicationRating: 4,
            questionsAsked: ['Tell me about yourself', 'Why do you want to work here?'],
            comments: 'Strong candidate with good potential',
            recommendation: 'Yes',
            interviewerId: '3',
            isConsolidated: false
          }
        ],
        scheduledDate: '2023-05-16T11:00:00Z',
        completedDate: '2023-05-16T11:45:00Z',
        sequence: 1
      },
      {
        id: '1-2',
        name: 'Technical Assessment',
        type: 'Technical',
        mode: 'Video',
        interviewers: ['1', '2'],
        questions: ['1', '2'],
        status: 'Scheduled',
        scheduledDate: '2023-05-23T14:00:00Z',
        sequence: 2
      },
      {
        id: '1-3',
        name: 'Final Interview',
        type: 'Managerial',
        mode: 'In-person',
        interviewers: ['1', '3'],
        questions: ['3', '4'],
        status: 'Pending',
        sequence: 3
      }
    ]
  },
  {
    id: '2',
    candidateId: '2',
    positionId: '2',
    templateId: '2',
    status: 'In Progress',
    createdAt: '2023-05-10T09:00:00Z',
    updatedAt: '2023-05-18T16:45:00Z',
    rounds: [
      {
        id: '2-1',
        name: 'Initial Screening',
        type: 'HR',
        mode: 'Phone',
        interviewers: ['3'],
        questions: ['5', '6'],
        status: 'Completed',
        feedback: 'Candidate has strong technical background and good cultural fit.',
        detailedFeedback: {
          overallRating: 4,
          skillRatings: [
            { skill: 'Communication', rating: 3, comments: 'Good but sometimes hesitant' },
            { skill: 'Cultural Fit', rating: 4, comments: 'Seems to align with our values' }
          ],
          communicationRating: 3,
          questionsAsked: ['Tell me about your background', 'What are your career goals?'],
          comments: 'Promising candidate with relevant experience',
          recommendation: 'Yes',
          interviewerId: '3',
          isConsolidated: false
        },
        feedbacks: [
          {
            overallRating: 4,
            skillRatings: [
              { skill: 'Communication', rating: 3, comments: 'Good but sometimes hesitant' },
              { skill: 'Cultural Fit', rating: 4, comments: 'Seems to align with our values' }
            ],
            communicationRating: 3,
            questionsAsked: ['Tell me about your background', 'What are your career goals?'],
            comments: 'Promising candidate with relevant experience',
            recommendation: 'Yes',
            interviewerId: '3',
            isConsolidated: false
          }
        ],
        scheduledDate: '2023-05-12T13:00:00Z',
        completedDate: '2023-05-12T13:30:00Z',
        sequence: 1
      },
      {
        id: '2-2',
        name: 'Technical Assessment',
        type: 'Technical',
        mode: 'Video',
        interviewers: ['2', '4'],
        questions: ['7', '8'],
        status: 'Completed',
        feedback: 'Candidate demonstrated excellent technical knowledge and problem-solving skills.',
        detailedFeedback: {
          overallRating: 5,
          skillRatings: [
            { skill: 'Technical Knowledge', rating: 5, comments: 'Excellent understanding of backend concepts' },
            { skill: 'Problem Solving', rating: 5, comments: 'Creative and efficient solutions' },
            { skill: 'System Design', rating: 4, comments: 'Good grasp of architecture principles' }
          ],
          communicationRating: 4,
          questionsAsked: ['Explain database normalization', 'How would you design a scalable API?'],
          comments: 'Exceptional technical skills and good communication',
          recommendation: 'Strong Yes',
          isConsolidated: true
        },
        feedbacks: [
          {
            overallRating: 5,
            skillRatings: [
              { skill: 'Technical Knowledge', rating: 5, comments: 'Excellent understanding of backend concepts' },
              { skill: 'Problem Solving', rating: 5, comments: 'Creative and efficient solutions' },
              { skill: 'System Design', rating: 4, comments: 'Good grasp of architecture principles' }
            ],
            communicationRating: 4,
            questionsAsked: ['Explain database normalization', 'How would you design a scalable API?'],
            comments: 'Exceptional technical skills and good communication',
            recommendation: 'Strong Yes',
            isConsolidated: true
          },
          {
            overallRating: 5,
            skillRatings: [
              { skill: 'Technical Knowledge', rating: 5, comments: 'Deep understanding of database concepts' },
              { skill: 'Problem Solving', rating: 4, comments: 'Methodical approach to problems' }
            ],
            communicationRating: 4,
            questionsAsked: ['Explain database normalization', 'Describe your experience with APIs'],
            comments: 'Strong technical candidate with good communication skills',
            recommendation: 'Yes',
            interviewerId: '2',
            isConsolidated: false
          },
          {
            overallRating: 4,
            skillRatings: [
              { skill: 'Technical Knowledge', rating: 4, comments: 'Good understanding of backend concepts' },
              { skill: 'System Design', rating: 5, comments: 'Excellent architecture knowledge' }
            ],
            communicationRating: 3,
            questionsAsked: ['How would you design a scalable API?', 'Explain your approach to testing'],
            comments: 'Strong technical skills, communication could be improved',
            recommendation: 'Yes',
            interviewerId: '4',
            isConsolidated: false
          }
        ],
        scheduledDate: '2023-05-17T10:00:00Z',
        completedDate: '2023-05-17T11:15:00Z',
        sequence: 2
      },
      {
        id: '2-3',
        name: 'Final Interview',
        type: 'Managerial',
        mode: 'In-person',
        interviewers: ['2', '3'],
        questions: ['3', '4'],
        status: 'Scheduled',
        scheduledDate: '2023-05-25T15:00:00Z',
        sequence: 3
      }
    ]
  },
  {
    id: '3',
    candidateId: '3',
    positionId: '3',
    templateId: '3',
    status: 'In Progress',
    createdAt: '2023-05-05T14:00:00Z',
    updatedAt: '2023-05-19T11:30:00Z',
    rounds: [
      {
        id: '3-1',
        name: 'Initial Screening',
        type: 'HR',
        mode: 'Phone',
        interviewers: ['3'],
        questions: ['5', '6'],
        status: 'Completed',
        feedback: 'Candidate has excellent product management experience.',
        detailedFeedback: {
          overallRating: 4,
          skillRatings: [
            { skill: 'Communication', rating: 5, comments: 'Excellent communicator' },
            { skill: 'Experience', rating: 4, comments: 'Relevant product management background' }
          ],
          communicationRating: 5,
          questionsAsked: ['Describe your product management approach', 'How do you prioritize features?'],
          comments: 'Strong candidate with good product sense',
          recommendation: 'Yes',
          interviewerId: '3',
          isConsolidated: false
        },
        feedbacks: [
          {
            overallRating: 4,
            skillRatings: [
              { skill: 'Communication', rating: 5, comments: 'Excellent communicator' },
              { skill: 'Experience', rating: 4, comments: 'Relevant product management background' }
            ],
            communicationRating: 5,
            questionsAsked: ['Describe your product management approach', 'How do you prioritize features?'],
            comments: 'Strong candidate with good product sense',
            recommendation: 'Yes',
            interviewerId: '3',
            isConsolidated: false
          }
        ],
        scheduledDate: '2023-05-08T10:00:00Z',
        completedDate: '2023-05-08T10:45:00Z',
        sequence: 1
      },
      {
        id: '3-2',
        name: 'Product Case Study',
        type: 'Technical',
        mode: 'Video',
        interviewers: ['1', '3'],
        questions: ['3', '4'],
        status: 'Rejected',
        feedback: 'Candidate struggled with the product case study.',
        rejectionReason: 'Insufficient product strategy skills and lack of market analysis depth.',
        detailedFeedback: {
          overallRating: 2,
          skillRatings: [
            { skill: 'Product Strategy', rating: 2, comments: 'Lacks strategic thinking' },
            { skill: 'Market Analysis', rating: 1, comments: 'Unable to identify key market trends' },
            { skill: 'User-Centered Design', rating: 3, comments: 'Basic understanding of user needs' }
          ],
          communicationRating: 3,
          questionsAsked: ['How would you improve our product?', 'How do you gather user feedback?'],
          comments: 'Candidate lacks the depth needed for this role',
          recommendation: 'No',
          isConsolidated: true
        },
        feedbacks: [
          {
            overallRating: 2,
            skillRatings: [
              { skill: 'Product Strategy', rating: 2, comments: 'Lacks strategic thinking' },
              { skill: 'Market Analysis', rating: 1, comments: 'Unable to identify key market trends' },
              { skill: 'User-Centered Design', rating: 3, comments: 'Basic understanding of user needs' }
            ],
            communicationRating: 3,
            questionsAsked: ['How would you improve our product?', 'How do you gather user feedback?'],
            comments: 'Candidate lacks the depth needed for this role',
            recommendation: 'No',
            isConsolidated: true
          },
          {
            overallRating: 2,
            skillRatings: [
              { skill: 'Product Strategy', rating: 1, comments: 'Very weak strategic thinking' },
              { skill: 'Market Analysis', rating: 2, comments: 'Limited market understanding' }
            ],
            communicationRating: 3,
            questionsAsked: ['How would you improve our product?'],
            comments: 'Not suitable for this role',
            recommendation: 'Strong No',
            interviewerId: '1',
            isConsolidated: false
          },
          {
            overallRating: 3,
            skillRatings: [
              { skill: 'User-Centered Design', rating: 3, comments: 'Basic understanding of user needs' },
              { skill: 'Communication', rating: 4, comments: 'Good communication skills' }
            ],
            communicationRating: 4,
            questionsAsked: ['How do you gather user feedback?', 'Describe your product development process'],
            comments: 'Good communication but lacks technical depth',
            recommendation: 'Maybe',
            interviewerId: '3',
            isConsolidated: false
          }
        ],
        scheduledDate: '2023-05-15T14:00:00Z',
        completedDate: '2023-05-15T15:30:00Z',
        sequence: 2
      }
    ]
  }
];