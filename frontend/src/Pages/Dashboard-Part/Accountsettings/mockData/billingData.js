export const billingHistory = [
  {
    id: 1,
    date: 'Jan 01, 2024',
    amount: 99.00,
    status: 'Paid',
    invoice: '#INV-2024-001',
    paymentMethod: 'Visa ending in 4242'
  },
  {
    id: 2,
    date: 'Dec 01, 2023',
    amount: 99.00,
    status: 'Paid',
    invoice: '#INV-2023-012',
    paymentMethod: 'Visa ending in 4242'
  },
  {
    id: 3,
    date: 'Nov 01, 2023',
    amount: 99.00,
    status: 'Paid',
    invoice: '#INV-2023-011',
    paymentMethod: 'Visa ending in 4242'
  }
]

export const paymentMethods = [
  {
    id: 1,
    last4: '4242',
    type: 'Visa',
    expiryDate: '12/25',
    isDefault: true,
    cardholderName: 'John Smith',
    billingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA'
    }
  },
  {
    id: 2,
    last4: '5555',
    type: 'Mastercard',
    expiryDate: '09/24',
    isDefault: false,
    cardholderName: 'John Smith',
    billingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA'
    }
  }
]

export const billingSettings = {
  currency: 'USD',
  billingCycle: 'monthly',
  autoRenew: true,
  taxId: 'US123456789',
  billingEmails: ['billing@techcorp.com', 'finance@techcorp.com'],
  billingAddress: {
    company: 'TechCorp Solutions',
    street: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA'
  }
}