// 역할별 권한 정의
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin', 
  MANAGER: 'Manager',
  USER: 'User',
  VIEWER: 'Viewer'
};

export const PERMISSIONS = {
  // 대시보드 권한
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  
  // 사용자 관리 권한
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  BULK_ACTIONS: 'bulk_actions',
  
  // 권한 관리
  MANAGE_PERMISSIONS: 'manage_permissions',
  ASSIGN_ROLES: 'assign_roles',
  
  // 시스템 설정
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_LOGS: 'view_logs',
  EXPORT_DATA: 'export_data'
};

// 역할별 권한 매핑
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
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD
  ]
};

// 페이지별 필요 권한
export const PAGE_PERMISSIONS = {
  dashboard: [PERMISSIONS.VIEW_DASHBOARD],
  users: [PERMISSIONS.VIEW_USERS],
  settings: [PERMISSIONS.MANAGE_SETTINGS],
  analytics: [PERMISSIONS.VIEW_ANALYTICS]
};

// 권한 체크 함수
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// 페이지 접근 권한 체크
export const canAccessPage = (userRole, pageName) => {
  const requiredPermissions = PAGE_PERMISSIONS[pageName] || [];
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

// 복수 권한 체크
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// 모든 권한 체크
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// 사용자 권한 목록 가져오기
export const getUserPermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};