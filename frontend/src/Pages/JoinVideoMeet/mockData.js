export const mockData = {
  candidates: [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Frontend Developer",
      experience: "5+ years",
      location: "San Francisco, CA",
      skills: [
        { name: "React.js", level: "Expert", years: 5 },
        { name: "TypeScript", level: "Expert", years: 4 },
        { name: "Node.js", level: "Intermediate", years: 3 },
        { name: "GraphQL", level: "Intermediate", years: 2 },
        { name: "AWS", level: "Medium", years: 3 },
        { name: "Docker", level: "Medium", years: 2 },
        { name: "Jest", level: "Expert", years: 4 },
        { name: "Webpack", level: "Intermediate", years: 3 }
      ],
      certificates: [
        {
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2023-08-15",
          credentialId: "AWS-SAA-2023-001"
        },
        {
          name: "React Developer Certification",
          issuer: "Meta",
          date: "2023-03-20",
          credentialId: "META-REACT-2023-456"
        }
      ],
      projects: [
        {
          name: "E-commerce Platform",
          description: "Built a full-stack e-commerce platform using React, Node.js, and PostgreSQL. Implemented features like user authentication, payment processing, and inventory management.",
          technologies: ["React.js", "Node.js", "PostgreSQL", "Stripe API"],
          duration: "6 months",
          role: "Lead Frontend Developer"
        },
        {
          name: "Real-time Chat Application",
          description: "Developed a real-time chat application with WebSocket integration, user presence indicators, and file sharing capabilities.",
          technologies: ["React.js", "Socket.io", "Express.js", "MongoDB"],
          duration: "3 months",
          role: "Full Stack Developer"
        }
      ],
      resumeSummary: "Experienced frontend developer with a strong background in React.js and modern web technologies. Proven track record of building scalable web applications and leading development teams. Passionate about user experience and performance optimization.",
      status: "scheduled"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      position: "Full Stack Developer",
      experience: "3+ years",
      location: "New York, NY",
      skills: [
        { name: "Python", level: "Expert", years: 4 },
        { name: "Django", level: "Expert", years: 3 },
        { name: "React.js", level: "Intermediate", years: 2 },
        { name: "PostgreSQL", level: "Expert", years: 4 },
        { name: "Redis", level: "Medium", years: 2 },
        { name: "Kubernetes", level: "Medium", years: 1 },
        { name: "CI/CD", level: "Intermediate", years: 2 }
      ],
      certificates: [
        {
          name: "Python Institute Certification",
          issuer: "Python Institute",
          date: "2023-05-10",
          credentialId: "PCAP-31-03-2023"
        }
      ],
      projects: [
        {
          name: "Data Analytics Dashboard",
          description: "Created a comprehensive analytics dashboard for business intelligence with real-time data visualization and reporting features.",
          technologies: ["Python", "Django", "React.js", "D3.js", "PostgreSQL"],
          duration: "4 months",
          role: "Full Stack Developer"
        }
      ],
      resumeSummary: "Full-stack developer with expertise in Python backend development and React frontend. Strong problem-solving skills and experience with cloud deployment and DevOps practices.",
      status: "completed"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 345-6789",
      position: "DevOps Engineer",
      experience: "4+ years",
      location: "Austin, TX",
      skills: [
        { name: "AWS", level: "Expert", years: 4 },
        { name: "Terraform", level: "Expert", years: 3 },
        { name: "Kubernetes", level: "Expert", years: 3 },
        { name: "Docker", level: "Expert", years: 4 },
        { name: "Jenkins", level: "Intermediate", years: 2 },
        { name: "Python", level: "Medium", years: 3 },
        { name: "Monitoring", level: "Expert", years: 4 }
      ],
      certificates: [
        {
          name: "AWS Certified DevOps Engineer",
          issuer: "Amazon Web Services",
          date: "2023-07-22",
          credentialId: "AWS-DOP-2023-789"
        },
        {
          name: "Certified Kubernetes Administrator",
          issuer: "Cloud Native Computing Foundation",
          date: "2023-04-15",
          credentialId: "CKA-2023-012"
        }
      ],
      projects: [
        {
          name: "Cloud Infrastructure Migration",
          description: "Led the migration of legacy infrastructure to AWS cloud, implementing Infrastructure as Code and automated deployment pipelines.",
          technologies: ["AWS", "Terraform", "Jenkins", "Docker", "Kubernetes"],
          duration: "8 months",
          role: "Lead DevOps Engineer"
        },
        {
          name: "Monitoring and Alerting System",
          description: "Designed and implemented comprehensive monitoring solution for microservices architecture with custom dashboards and alerting.",
          technologies: ["Prometheus", "Grafana", "ELK Stack", "Kubernetes"],
          duration: "3 months",
          role: "DevOps Engineer"
        }
      ],
      resumeSummary: "DevOps engineer specializing in cloud infrastructure and automation. Experience with large-scale deployments and implementing CI/CD pipelines for development teams.",
      status: "pending"
    }
  ],

  interviewers: [
    {
      id: 1,
      name: "David Kim",
      email: "david.kim@company.com",
      role: "Engineering Manager",
      department: "Engineering",
      specialties: ["Technical Leadership", "System Design", "Team Management"]
    },
    {
      id: 2,
      name: "Lisa Wang",
      email: "lisa.wang@company.com",
      role: "Senior Software Engineer",
      department: "Engineering",
      specialties: ["Frontend Development", "React.js", "User Experience"]
    },
    {
      id: 3,
      name: "Robert Thompson",
      email: "robert.thompson@company.com",
      role: "HR Director",
      department: "Human Resources",
      specialties: ["Cultural Fit", "Communication Skills", "Career Development"]
    }
  ],

  interviews: [
    {
      id: 1,
      candidateId: 1,
      interviewerId: 1,
      position: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      scheduledTime: "Today, 2:00 PM PST",
      duration: "60 minutes",
      type: "Technical Interview",
      status: "scheduled",
      meetingUrl: "https://zoom.us/j/123456789?pwd=example", // Mock Zoom URL
      provider: "zoom"
    },
    {
      id: 2,
      candidateId: 2,
      interviewerId: 2,
      position: "Full Stack Developer",
      company: "StartupXYZ",
      scheduledTime: "Tomorrow, 10:00 AM PST",
      duration: "45 minutes",
      type: "Behavioral Interview",
      status: "scheduled",
      meetingUrl: "https://meet.google.com/abc-defg-hij", // Mock Google Meet URL
      provider: "google-meet"
    }
  ],

  questions: [
    {
      id: 1,
      category: "Technical",
      difficulty: "Medium",
      question: "Explain the concept of virtual DOM in React and how it improves performance.",
      expectedAnswer: "The virtual DOM is a JavaScript representation of the real DOM. React uses it to optimize updates by comparing the new virtual DOM with the previous version (diffing) and only updating the parts that have changed (reconciliation). This reduces expensive DOM manipulations and improves performance.",
      tags: ["React", "Performance", "Frontend"]
    },
    {
      id: 2,
      category: "Technical",
      difficulty: "Hard",
      question: "Design a system that can handle 1 million concurrent users. What are the key considerations?",
      expectedAnswer: "Key considerations include: Load balancing, horizontal scaling, database sharding, caching strategies (Redis/Memcached), CDN usage, microservices architecture, async processing, monitoring and alerting, and auto-scaling capabilities.",
      tags: ["System Design", "Scalability", "Architecture"]
    },
    {
      id: 3,
      category: "Behavioral",
      difficulty: "Easy",
      question: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
      expectedAnswer: "Look for: specific situation, actions taken, communication approach, conflict resolution skills, and positive outcome. Shows emotional intelligence and teamwork abilities.",
      tags: ["Communication", "Teamwork", "Conflict Resolution"]
    },
    {
      id: 4,
      category: "Technical",
      difficulty: "Medium",
      question: "What is the difference between SQL and NoSQL databases? When would you use each?",
      expectedAnswer: "SQL databases are relational with ACID properties, structured schemas, and strong consistency. NoSQL databases are flexible, horizontally scalable, and better for unstructured data. Use SQL for complex relationships and transactions, NoSQL for scalability and flexible data models.",
      tags: ["Database", "SQL", "NoSQL"]
    },
    {
      id: 5,
      category: "Problem Solving",
      difficulty: "Hard",
      question: "Write a function to find the longest palindromic substring in a given string.",
      expectedAnswer: "Multiple approaches possible: brute force O(n³), expand around centers O(n²), or Manacher's algorithm O(n). Should discuss time complexity, space complexity, and edge cases.",
      tags: ["Algorithms", "String Manipulation", "Problem Solving"]
    },
    {
      id: 6,
      category: "Behavioral",
      difficulty: "Medium",
      question: "Describe a project you're particularly proud of. What challenges did you face and how did you overcome them?",
      expectedAnswer: "Look for: clear project description, specific challenges identified, problem-solving approach, technical decisions made, lessons learned, and measurable impact.",
      tags: ["Project Management", "Problem Solving", "Achievement"]
    }
  ],

  feedback: [
    {
      id: 1,
      interviewId: 1,
      candidateId: 2,
      interviewerId: 1,
      overallRating: 4,
      technicalSkills: "Good",
      communication: "Excellent",
      problemSolving: "Good",
      culturalFit: "Excellent",
      comments: "Michael demonstrated strong technical knowledge and excellent communication skills. He approached problems methodically and asked thoughtful questions. His experience with full-stack development would be valuable to our team.",
      recommendation: "Hire",
      createdAt: "2024-01-15T14:30:00Z"
    },
    {
      id: 2,
      interviewId: 2,
      candidateId: 3,
      interviewerId: 2,
      overallRating: 3,
      technicalSkills: "Average",
      communication: "Good",
      problemSolving: "Average",
      culturalFit: "Good",
      comments: "Emily has solid DevOps experience but seemed less confident with some advanced concepts. Her communication was clear and she showed enthusiasm for learning. Would benefit from additional technical rounds.",
      recommendation: "Maybe",
      createdAt: "2024-01-14T10:45:00Z"
    }
  ],

  settings: {
    company: {
      name: "TechCorp Inc.",
      logo: "/company-logo.png",
      theme: {
        primary: "rgb(33, 121, 137)",
        secondary: "rgb(26, 97, 110)",
        accent: "rgb(45, 150, 170)"
      }
    },
    meeting: {
      defaultProvider: "zoom",
      providers: {
        zoom: {
          name: "Zoom",
          baseUrl: "https://zoom.us/j/",
          enabled: true
        },
        googleMeet: {
          name: "Google Meet",
          baseUrl: "https://meet.google.com/",
          enabled: true
        },
        teams: {
          name: "Microsoft Teams",
          baseUrl: "https://teams.microsoft.com/l/meetup-join/",
          enabled: false
        }
      }
    },
    notifications: {
      emailReminders: true,
      smsReminders: false,
      slackIntegration: true
    }
  }
};