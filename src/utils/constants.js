export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'BarChart3'
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'Users'
  }
];

// Initial user data modified according to requirements
export const INITIAL_USERS = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin', // Changed to Admin
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Admin', // Changed to Admin
    status: 'active',
    createdAt: '2024-01-16'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Admin', // Changed to Admin
    status: 'inactive',
    createdAt: '2024-01-17'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'Admin', // Changed to Admin
    status: 'active',
    createdAt: '2024-01-18'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'Admin', // Changed to Admin
    status: 'active',
    createdAt: '2024-01-19'
  }
];

export const USER_ROLES = ['Super Admin', 'Admin', 'Manager', 'User', 'Viewer']; // Unified with permission system
export const USER_STATUSES = ['active', 'inactive'];