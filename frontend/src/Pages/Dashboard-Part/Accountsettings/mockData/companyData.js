export const industries = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Healthcare' },
  { id: 3, name: 'Education' },
  { id: 4, name: 'Finance' },
  { id: 5, name: 'Manufacturing' },
  { id: 6, name: 'Retail' }
]

export const companySizes = [
  { id: 1, name: '1-10 employees' },
  { id: 2, name: '11-50 employees' },
  { id: 3, name: '51-200 employees' },
  { id: 4, name: '201-500 employees' },
  { id: 5, name: '500+ employees' }
]

export const companyProfile = {
  name: 'TechCorp Solutions',
  industry: 'Technology',
  size: '51-200 employees',
  website: 'www.techcorp.com',
  location: 'San Francisco, CA',
  founded: '2020',
  description: 'Leading provider of AI-powered interview and assessment solutions',
  branding: {
    logo: null,
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    brandGuidelines: null,
    emailTemplate: null
  },
  socialMedia: {
    linkedin: 'linkedin.com/company/techcorp-solutions',
    twitter: 'twitter.com/techcorp',
    facebook: 'facebook.com/techcorp'
  },
  offices: [
    {
      id: 1,
      type: 'Headquarters',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zip: '94105',
      phone: '+1 (415) 555-0123'
    },
    {
      id: 2,
      type: 'Regional Office',
      address: '456 Innovation Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zip: '10013',
      phone: '+1 (212) 555-0123'
    }
  ],
  departments: [
    {
      id: 1,
      name: 'Engineering',
      headCount: 45,
      locations: ['San Francisco', 'New York']
    },
    {
      id: 2,
      name: 'Product',
      headCount: 20,
      locations: ['San Francisco']
    },
    {
      id: 3,
      name: 'Sales',
      headCount: 30,
      locations: ['San Francisco', 'New York']
    },
    {
      id: 4,
      name: 'Marketing',
      headCount: 15,
      locations: ['San Francisco']
    },
    {
      id: 5,
      name: 'Customer Success',
      headCount: 25,
      locations: ['San Francisco', 'New York']
    }
  ],
  certifications: [
    {
      id: 1,
      name: 'ISO 27001',
      issueDate: '2023-01-15',
      expiryDate: '2026-01-14',
      status: 'active'
    },
    {
      id: 2,
      name: 'SOC 2 Type II',
      issueDate: '2023-03-20',
      expiryDate: '2024-03-19',
      status: 'active'
    }
  ]
}