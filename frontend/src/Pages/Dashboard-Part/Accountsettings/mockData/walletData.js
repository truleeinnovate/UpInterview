export const walletBalance = {
  balance: 2500.00,
  currency: 'USD',
  lastUpdated: '2024-01-15T10:30:00Z',
  pendingBalance: 500.00,
  creditLimit: 5000.00,
  autoReloadSettings: {
    enabled: true,
    threshold: 1000.00,
    reloadAmount: 1000.00
  }
}

export const walletTransactions = [
  {
    id: 1,
    type: 'credit',
    amount: 1000.00,
    description: 'Monthly credits allocation',
    date: '2024-01-01T00:00:00Z',
    status: 'completed',
    reference: 'CRED-2024-001',
    category: 'allocation',
    metadata: {
      source: 'automatic',
      plan: 'Advanced'
    }
  },
  {
    id: 2,
    type: 'debit',
    amount: 250.00,
    description: 'Interview session credits',
    date: '2024-01-05T15:30:00Z',
    status: 'completed',
    reference: 'INT-2024-005',
    category: 'interview',
    metadata: {
      sessionId: 'INT-123',
      duration: '60 minutes'
    }
  },
  {
    id: 3,
    type: 'debit',
    amount: 150.00,
    description: 'Assessment credits',
    date: '2024-01-10T09:15:00Z',
    status: 'completed',
    reference: 'ASS-2024-010',
    category: 'assessment',
    metadata: {
      assessmentId: 'ASS-456',
      type: 'Technical'
    }
  },
  {
    id: 4,
    type: 'credit',
    amount: 500.00,
    description: 'Bonus credits',
    date: '2024-01-12T14:20:00Z',
    status: 'completed',
    reference: 'BON-2024-012',
    category: 'bonus',
    metadata: {
      reason: 'Early renewal reward',
      expiryDate: '2024-12-31'
    }
  }
]

export const walletSettings = {
  defaultCurrency: 'USD',
  autoReload: true,
  notificationThreshold: 1000.00,
  expiryRules: {
    bonusCredits: 90, // days
    standardCredits: 365 // days
  },
  paymentMethods: [
    {
      id: 1,
      type: 'card',
      last4: '4242',
      isDefault: true
    },
    {
      id: 2,
      type: 'bank',
      accountLast4: '5678',
      isDefault: false
    }
  ]
}