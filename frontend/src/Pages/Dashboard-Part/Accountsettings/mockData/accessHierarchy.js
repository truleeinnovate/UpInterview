// Role-based access hierarchy and permissions
export const accessHierarchy = {
  // Super Admin has all permissions
  super_admin: {
    level: 0, // Highest level
    inherits: [], // Doesn't inherit - has all permissions
    permissions: '*', // All permissions
    canAssign: ['admin', 'hiring_manager', 'recruiter', 'interviewer', 'employee'], // Can assign all roles
    description: 'Complete system access with all permissions'
  },
  
  // Admin has most permissions but some restrictions
  admin: {
    level: 1,
    inherits: [],
    permissions: {
      system: ['manage_settings', 'view_analytics', 'manage_integrations'],
      users: ['create', 'edit', 'delete', 'view'],
      roles: ['create', 'edit', 'delete', 'view'],
      billing: ['manage', 'view'],
      reports: ['create', 'edit', 'delete', 'view', 'export']
    },
    canAssign: ['hiring_manager', 'recruiter', 'interviewer', 'employee'],
    description: 'Administrative access with user management capabilities'
  },

  // Hiring Manager
  hiring_manager: {
    level: 2,
    inherits: ['recruiter'],
    permissions: {
      positions: ['create', 'edit', 'delete', 'view', 'approve'],
      candidates: ['view', 'rate', 'decide'],
      interviews: ['schedule', 'conduct', 'review'],
      team: ['view', 'assign_interviews'],
      reports: ['view', 'export']
    },
    canAssign: ['interviewer'],
    description: 'Manages hiring process and makes final decisions'
  },

  // Recruiter
  recruiter: {
    level: 3,
    inherits: ['interviewer'],
    permissions: {
      positions: ['view', 'edit'],
      candidates: ['create', 'edit', 'view', 'rate'],
      interviews: ['schedule', 'conduct'],
      assessments: ['create', 'edit', 'view', 'grade'],
      communications: ['send', 'view'],
      reports: ['view']
    },
    canAssign: [],
    description: 'Manages recruitment process and candidate pipeline'
  },

  // Interviewer
  interviewer: {
    level: 4,
    inherits: ['employee'],
    permissions: {
      interviews: ['conduct', 'rate'],
      candidates: ['view'],
      assessments: ['view', 'grade'],
      feedback: ['create', 'edit', 'view']
    },
    canAssign: [],
    description: 'Conducts interviews and provides feedback'
  },

  // Basic Employee
  employee: {
    level: 5,
    inherits: [],
    permissions: {
      positions: ['view'],
      referrals: ['create', 'view'],
      feedback: ['view_own']
    },
    canAssign: [],
    description: 'Basic access for employee referrals'
  }
}

// Permission inheritance resolver
export function resolvePermissions(role) {
  let allPermissions = new Set()
  
  function addPermissions(roleId) {
    const roleConfig = accessHierarchy[roleId]
    
    // Add direct permissions
    if (roleConfig.permissions === '*') {
      allPermissions.add('*')
      return
    }
    
    if (typeof roleConfig.permissions === 'object') {
      Object.entries(roleConfig.permissions).forEach(([category, perms]) => {
        perms.forEach(perm => allPermissions.add(`${category}:${perm}`))
      })
    }
    
    // Add inherited permissions
    roleConfig.inherits?.forEach(inheritedRole => {
      addPermissions(inheritedRole)
    })
  }
  
  addPermissions(role)
  return Array.from(allPermissions)
}

// Permission checker
export function hasPermission(userRole, requiredPermission) {
  const permissions = resolvePermissions(userRole)
  
  // Super admin has all permissions
  if (permissions.includes('*')) return true
  
  // Check specific permission
  return permissions.includes(requiredPermission)
}

// Role assignment validator
export function canAssignRole(assignerRole, roleToAssign) {
  const assignerConfig = accessHierarchy[assignerRole]
  if (!assignerConfig) return false
  
  // Check if the assigner can assign the role
  return assignerConfig.canAssign.includes(roleToAssign)
}

// Level comparison
export function isHigherRole(role1, role2) {
  const role1Level = accessHierarchy[role1]?.level
  const role2Level = accessHierarchy[role2]?.level
  
  if (role1Level === undefined || role2Level === undefined) return false
  return role1Level < role2Level // Lower level number means higher role
}