export const subscriptionPlans = [
  {
    id: 1,
    name: 'Basic',
    price: 49,
    billingPeriod: 'month',
    features: {
      assessments: '5 per month',
      scheduledInterviews: '5 per month',
      internalInterviewers: 'Yes (Limit: 5)',
      externalInterviewers: 'Yes (Limit: 10)',
      reportsBandwidth: '10MB per report',
      totalBandwidth: '500MB per month',
      userCreation: '10',
      autoUpgrades: 'No',
      prioritySupport: 'No',
      questionBankAccess: 'Limited (100 Qs)',
      customQuestionBank: 'No',
      aiBasedSuggestions: 'No'
    }
  },
  {
    id: 2,
    name: 'Advanced',
    price: 199,
    billingPeriod: 'month',
    features: {
      assessments: '30 per month',
      scheduledInterviews: '30 per month',
      internalInterviewers: 'Yes (Limit: 30)',
      externalInterviewers: 'Yes (Limit: 50)',
      reportsBandwidth: '50MB per report',
      totalBandwidth: '5GB per month',
      userCreation: '50',
      autoUpgrades: 'Yes (on demand)',
      prioritySupport: 'Yes',
      questionBankAccess: 'Standard (1000 Qs)',
      customQuestionBank: 'Yes (Limit: 500)',
      aiBasedSuggestions: 'Yes'
    }
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 'Custom Pricing',
    billingPeriod: 'month',
    features: {
      assessments: 'Unlimited',
      scheduledInterviews: 'Unlimited',
      internalInterviewers: 'Yes (Unlimited)',
      externalInterviewers: 'Yes (Unlimited)',
      reportsBandwidth: 'Unlimited',
      totalBandwidth: 'Unlimited',
      userCreation: 'Unlimited',
      autoUpgrades: 'Yes (automated)',
      prioritySupport: 'Yes',
      questionBankAccess: 'Full Access',
      customQuestionBank: 'Yes (Unlimited)',
      aiBasedSuggestions: 'Yes'
    }
  }
]

export const currentSubscription = {
  planId: 2, // Advanced
  startDate: '2024-01-01',
  nextBillingDate: '2024-02-01',
  status: 'active'
}