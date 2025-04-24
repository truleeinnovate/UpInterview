export const sharingSettings = {
  general: {
    allowExternalSharing: true,
    requireAuthentication: true,
    defaultLinkExpiry: 7, // days
    allowLinkSharing: true,
    trackSharedContent: true
  },
  permissions: {
    allowGuestAccess: true,
    guestDefaultRole: 'viewer',
    allowRoleOverride: false,
    requireApproval: true
  },
  security: {
    enforcePasswordProtection: true,
    minimumPasswordStrength: 'medium',
    allowDownloads: true,
    watermarkEnabled: true
  },
  domains: {
    allowedDomains: ['techcorp.com', 'partner.com'],
    blockList: ['competitor.com'],
    enforceAllowedDomains: true
  }
}

export const sharedContent = [
  {
    id: 1,
    type: 'interview',
    name: 'Frontend Developer Interview Template',
    sharedBy: 'Sarah Chen',
    sharedWith: [
      {
        type: 'user',
        name: 'David Kim',
        email: 'david.kim@techcorp.com',
        role: 'editor'
      },
      {
        type: 'domain',
        domain: 'partner.com',
        role: 'viewer'
      }
    ],
    created: '2024-01-10T14:30:00Z',
    expires: '2024-02-10T14:30:00Z',
    status: 'active'
  },
  {
    id: 2,
    type: 'assessment',
    name: 'System Design Assessment',
    sharedBy: 'Michael Rodriguez',
    sharedWith: [
      {
        type: 'user',
        name: 'Emily Watson',
        email: 'emily.w@techcorp.com',
        role: 'viewer'
      }
    ],
    created: '2024-01-05T09:15:00Z',
    expires: '2024-02-05T09:15:00Z',
    status: 'active'
  }
]

export const sharingHistory = [
  {
    id: 1,
    contentId: 1,
    action: 'shared',
    timestamp: '2024-01-10T14:30:00Z',
    performer: 'Sarah Chen',
    details: 'Shared with David Kim and partner.com domain'
  },
  {
    id: 2,
    contentId: 1,
    action: 'accessed',
    timestamp: '2024-01-11T10:20:00Z',
    performer: 'David Kim',
    details: 'Viewed template'
  },
  {
    id: 3,
    contentId: 2,
    action: 'shared',
    timestamp: '2024-01-05T09:15:00Z',
    performer: 'Michael Rodriguez',
    details: 'Shared with Emily Watson'
  }
]

export const sharingAnalytics = {
  totalShares: 25,
  activeShares: 18,
  expiredShares: 7,
  topSharedContent: [
    { name: 'Frontend Developer Interview Template', shares: 8 },
    { name: 'System Design Assessment', shares: 6 },
    { name: 'Coding Challenge Template', shares: 4 }
  ],
  sharingByType: {
    interview: 12,
    assessment: 8,
    template: 5
  },
  accessByDomain: [
    { domain: 'techcorp.com', count: 45 },
    { domain: 'partner.com', count: 15 }
  ]
}