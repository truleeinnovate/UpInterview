export const roles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access with all permissions',
    users: 5,
    permissions: {
      interviews: ['create', 'edit', 'delete', 'view', 'schedule'],
      assessments: ['create', 'edit', 'delete', 'view', 'grade'],
      team: ['invite', 'remove', 'edit', 'view'],
      settings: ['edit', 'view'],
      billing: ['manage', 'view'],
      reports: ['create', 'export', 'view']
    },
    isDefault: false,
    isSystem: true
  },
  {
    id: 2,
    name: 'Interviewer',
    description: 'Can conduct interviews and provide feedback',
    users: 25,
    permissions: {
      interviews: ['view', 'schedule'],
      assessments: ['view', 'grade'],
      team: ['view'],
      settings: ['view'],
      billing: [],
      reports: ['view']
    },
    isDefault: true,
    isSystem: true
  },
  {
    id: 3,
    name: 'Recruiter',
    description: 'Can manage candidates and schedule interviews',
    users: 10,
    permissions: {
      interviews: ['create', 'edit', 'view', 'schedule'],
      assessments: ['create', 'view'],
      team: ['view'],
      settings: ['view'],
      billing: [],
      reports: ['create', 'view']
    },
    isDefault: false,
    isSystem: true
  },
  {
    id: 4,
    name: 'Custom Role',
    description: 'Custom permissions for specific needs',
    users: 3,
    permissions: {
      interviews: ['view'],
      assessments: ['view'],
      team: ['view'],
      settings: [],
      billing: [],
      reports: ['view']
    },
    isDefault: false,
    isSystem: false
  }
]

export const permissionCategories = [
  {
    id: 'interviews',
    name: 'Interviews',
    permissions: [
      { id: 'create', name: 'Create Interviews' },
      { id: 'edit', name: 'Edit Interviews' },
      { id: 'delete', name: 'Delete Interviews' },
      { id: 'view', name: 'View Interviews' },
      { id: 'schedule', name: 'Schedule Interviews' }
    ]
  },
  {
    id: 'assessments',
    name: 'Assessments',
    permissions: [
      { id: 'create', name: 'Create Assessments' },
      { id: 'edit', name: 'Edit Assessments' },
      { id: 'delete', name: 'Delete Assessments' },
      { id: 'view', name: 'View Assessments' },
      { id: 'grade', name: 'Grade Assessments' }
    ]
  },
  {
    id: 'team',
    name: 'Team Management',
    permissions: [
      { id: 'invite', name: 'Invite Members' },
      { id: 'remove', name: 'Remove Members' },
      { id: 'edit', name: 'Edit Member Details' },
      { id: 'view', name: 'View Team' }
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    permissions: [
      { id: 'edit', name: 'Edit Settings' },
      { id: 'view', name: 'View Settings' }
    ]
  },
  {
    id: 'billing',
    name: 'Billing',
    permissions: [
      { id: 'manage', name: 'Manage Billing' },
      { id: 'view', name: 'View Billing' }
    ]
  },
  {
    id: 'reports',
    name: 'Reports',
    permissions: [
      { id: 'create', name: 'Create Reports' },
      { id: 'export', name: 'Export Reports' },
      { id: 'view', name: 'View Reports' }
    ]
  }
]