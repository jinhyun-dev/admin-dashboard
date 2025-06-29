// 역할별 권한 정의
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin', 
  MANAGER: 'Manager',
  USER: 'User',
  VIEWER: 'Viewer'
};

// 역할 레벨 정의 (숫자가 낮을수록 높은 권한)
export const ROLE_LEVELS = {
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.MANAGER]: 3,
  [ROLES.USER]: 4,
  [ROLES.VIEWER]: 5
};

// 특정 계정별 Original Role 정의
export const ACCOUNT_ORIGINAL_ROLES = {
  'jinhyunkim319@gmail.com': ROLES.SUPER_ADMIN, // 개발자 계정
  'john.doe@example.com': ROLES.ADMIN,
  'jane.smith@example.com': ROLES.ADMIN, // 수정: User -> Admin
  'mike.johnson@example.com': ROLES.ADMIN, // 수정: Manager -> Admin
  'sarah.wilson@example.com': ROLES.ADMIN, // 수정: User -> Admin
  'david.brown@example.com': ROLES.ADMIN, // 수정: User -> Admin
  'test@example.com': ROLES.MANAGER // 테스트 계정 - Manager
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
    PERMISSIONS.DELETE_USERS, // Manager는 자신보다 낮은 레벨만 삭제 가능
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS // View Only
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD // Users 페이지 접근 불가
  ]
};

// 페이지별 필요 권한
export const PAGE_PERMISSIONS = {
  dashboard: [PERMISSIONS.VIEW_DASHBOARD],
  users: [PERMISSIONS.VIEW_USERS],
  settings: [PERMISSIONS.MANAGE_SETTINGS],
  analytics: [PERMISSIONS.VIEW_ANALYTICS]
};

// Original Role 가져오기 (이메일 기반)
export const getOriginalRole = (email) => {
  return ACCOUNT_ORIGINAL_ROLES[email] || ROLES.USER; // 기본값은 User
};

// 역할 변경 가능 여부 체크 (자신의 Original Role과 같거나 낮은 레벨로만 변경 가능)
export const canSwitchToRole = (originalRole, targetRole) => {
  const originalLevel = ROLE_LEVELS[originalRole];
  const targetLevel = ROLE_LEVELS[targetRole];
  
  // Original Role과 같거나 더 낮은 레벨(높은 숫자)로만 변경 가능
  return targetLevel >= originalLevel;
};

// 사용자 관리 권한 체크 (Manager의 경우 자신보다 높거나 같은 레벨 관리 불가)
export const canManageUser = (managerRole, targetUserRole) => {
  const managerLevel = ROLE_LEVELS[managerRole];
  const targetLevel = ROLE_LEVELS[targetUserRole];
  
  // Manager는 자신보다 낮은 레벨(높은 숫자)만 관리 가능
  if (managerRole === ROLES.MANAGER) {
    return targetLevel > managerLevel;
  }
  
  // Super Admin과 Admin은 모든 사용자 관리 가능
  return managerRole === ROLES.SUPER_ADMIN || managerRole === ROLES.ADMIN;
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

// 변경 가능한 역할 목록 가져오기
export const getAvailableRoles = (originalRole) => {
  const originalLevel = ROLE_LEVELS[originalRole];
  
  return Object.keys(ROLES)
    .map(key => ROLES[key])
    .filter(role => {
      const roleLevel = ROLE_LEVELS[role];
      return roleLevel >= originalLevel; // 같거나 낮은 레벨만
    });
};