// Role-based permission definitions
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin', 
  MANAGER: 'Manager',
  USER: 'User',
  VIEWER: 'Viewer'
};

// Role level definitions (lower numbers indicate higher authority)
export const ROLE_LEVELS = {
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.MANAGER]: 3,
  [ROLES.USER]: 4,
  [ROLES.VIEWER]: 5
};

// Original Role definitions for specific accounts
export const ACCOUNT_ORIGINAL_ROLES = {
  'jinhyunkim319@gmail.com': ROLES.SUPER_ADMIN, // Developer account
  'john.doe@example.com': ROLES.ADMIN,
  'jane.smith@example.com': ROLES.ADMIN, // Modified: User -> Admin
  'mike.johnson@example.com': ROLES.ADMIN, // Modified: Manager -> Admin
  'sarah.wilson@example.com': ROLES.ADMIN, // Modified: User -> Admin
  'david.brown@example.com': ROLES.ADMIN, // Modified: User -> Admin
  'test@example.com': ROLES.MANAGER // Test account - Manager
};

export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  BULK_ACTIONS: 'bulk_actions',
  
  // Permission management
  MANAGE_PERMISSIONS: 'manage_permissions',
  ASSIGN_ROLES: 'assign_roles',
  
  // System settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_LOGS: 'view_logs',
  EXPORT_DATA: 'export_data'
};

// Role to permission mappings
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.BULK_ACTIONS,
    PERMISSIONS.MANAGE_PERMISSIONS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.BULK_ACTIONS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS, // Manager can only delete users at lower levels
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS // View Only
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD // Cannot access Users page
  ]
};

// Required permissions by page
export const PAGE_PERMISSIONS = {
  dashboard: [PERMISSIONS.VIEW_DASHBOARD],
  users: [PERMISSIONS.VIEW_USERS],
  settings: [PERMISSIONS.MANAGE_SETTINGS],
  analytics: [PERMISSIONS.VIEW_ANALYTICS]
};

// Get Original Role (based on email)
export const getOriginalRole = (email) => {
  return ACCOUNT_ORIGINAL_ROLES[email] || ROLES.USER; // Default is User
};

// Check if role change is allowed (can only change to same or lower level than Original Role)
export const canSwitchToRole = (originalRole, targetRole) => {
  const originalLevel = ROLE_LEVELS[originalRole];
  const targetLevel = ROLE_LEVELS[targetRole];
  
  // Can only change to same or lower level (higher number) than Original Role
  return targetLevel >= originalLevel;
};

// Check user management permissions (Manager cannot manage users at same or higher level)
export const canManageUser = (managerRole, targetUserRole) => {
  const managerLevel = ROLE_LEVELS[managerRole];
  const targetLevel = ROLE_LEVELS[targetUserRole];
  
  // Manager can only manage users at lower levels (higher numbers)
  if (managerRole === ROLES.MANAGER) {
    return targetLevel > managerLevel;
  }
  
  // Super Admin and Admin can manage all users
  return managerRole === ROLES.SUPER_ADMIN || managerRole === ROLES.ADMIN;
};

// Permission check function
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Page access permission check
export const canAccessPage = (userRole, pageName) => {
  const requiredPermissions = PAGE_PERMISSIONS[pageName] || [];
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

// Multiple permission check
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// All permissions check
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Get user permission list
export const getUserPermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

// Get available roles for switching
export const getAvailableRoles = (originalRole) => {
  const originalLevel = ROLE_LEVELS[originalRole];
  
  return Object.keys(ROLES)
    .map(key => ROLES[key])
    .filter(role => {
      const roleLevel = ROLE_LEVELS[role];
      return roleLevel >= originalLevel; // Only same or lower levels
    });
};