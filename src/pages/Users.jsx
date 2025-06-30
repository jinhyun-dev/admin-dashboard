import React, { useState, useEffect, useRef, useMemo, useReducer } from 'react';
import { Plus } from 'lucide-react';
import UserTable from '../components/dashboard/UserTable';
import UserForm from '../components/dashboard/UserForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useUsers } from '../hooks/useFirestore';
import { hasPermission, PERMISSIONS, canManageUser } from '../utils/permissions';
import { useToast, ToastContainer } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';

const Users = () => {
  const { toasts, addToast, removeToast } = useToast();
  const { currentUser, originalRole, currentRole } = useAuth();
  
  // 강제 리렌더링을 위한 reducer
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [trackedRole, setTrackedRole] = useState(null);
  const [renderKey, setRenderKey] = useState(0); // 추가: 강제 리렌더링용
  const userTableRef = useRef();

  // currentRole이 변경될 때 감지하고 강제 리렌더링 (개선된 버전)
  useEffect(() => {
    console.log('Users component - Role changed from', trackedRole, 'to', currentRole);
    console.log('Users component - useEffect triggered with currentRole:', currentRole);
    console.log('Users component - currentUser?.role:', currentUser?.role);
    
    // 조건문 제거하여 항상 업데이트
    setTrackedRole(currentRole);
    setRenderKey(prev => prev + 1);
    forceUpdate();
  }, [currentRole, currentUser?.role]); // trackedRole 의존성 제거

  // 추가 강제 업데이트
  useEffect(() => {
    console.log('Users component - Force update for currentRole:', currentRole);
    forceUpdate();
  }, [currentRole]);

  // Header에서 역할 변경 시 즉시 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleRoleChange = (event) => {
      console.log('Users component - Role change event detected:', event.detail);
      setRenderKey(prev => prev + 1);
      forceUpdate();
    };

    window.addEventListener('roleChanged', handleRoleChange);
    return () => window.removeEventListener('roleChanged', handleRoleChange);
  }, []);

  // 추가 디버깅용 useEffect들
  useEffect(() => {
    console.log('Users component - currentUser changed:', currentUser);
    console.log('Users component - currentRole from currentUser:', currentUser?.role);
  }, [currentUser]);

  useEffect(() => {
    console.log('Users component - Direct currentRole changed:', currentRole);
  }, [currentRole]);

  // useMemo를 사용하여 권한 계산을 최적화 (CRUD 모든 권한 포함)
  const permissions = useMemo(() => {
    const role = currentRole;
    console.log('Users component - calculating permissions for role:', role);
    
    return {
      canCreateUsers: hasPermission(role, PERMISSIONS.CREATE_USERS),
      canReadUsers: hasPermission(role, PERMISSIONS.VIEW_USERS),
      canEditUsers: hasPermission(role, PERMISSIONS.EDIT_USERS),
      canDeleteUsers: hasPermission(role, PERMISSIONS.DELETE_USERS),
      canBulkActions: hasPermission(role, PERMISSIONS.BULK_ACTIONS),
      canExportData: hasPermission(role, PERMISSIONS.EXPORT_DATA)
    };
  }, [currentRole, trackedRole, renderKey]); // renderKey 추가

  const { canCreateUsers, canReadUsers, canEditUsers, canDeleteUsers, canBulkActions, canExportData } = permissions;

  // 디버깅용 로그
  console.log('Users component render - currentUser:', currentUser);
  console.log('Users component render - currentRole:', currentRole);
  console.log('Users component render - originalRole:', originalRole);
  console.log('Users component render - permissions:', permissions);
  console.log('Users component render - renderKey:', renderKey);

  useEffect(() => {
    const handleGlobalSearch = (event) => {
      const { searchTerm } = event.detail;
      setGlobalSearchTerm(searchTerm);

      if (userTableRef.current && userTableRef.current.setExternalSearch) {
        userTableRef.current.setExternalSearch(searchTerm);
      }
    };

    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch);
  }, []);

  const handleCreateUser = () => {
    if (!canCreateUsers) {
      addToast('You do not have permission to create users.', 'error');
      return;
    }
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    if (!canEditUsers) {
      addToast('You do not have permission to edit users.', 'error');
      return;
    }

    // Manager 권한 체크: 자신보다 높거나 같은 레벨 사용자 관리 불가
    if (!canManageUser(currentRole, user.role)) {
      addToast(`You cannot manage users with role: ${user.role}`, 'error');
      return;
    }

    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (!canDeleteUsers) {
      addToast('You do not have permission to delete users.', 'error');
      return;
    }

    // 삭제하려는 사용자의 역할 확인
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && !canManageUser(currentRole, userToDelete.role)) {
      addToast(`You cannot delete users with role: ${userToDelete.role}`, 'error');
      return;
    }

    setDeleteConfirm(userId);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(deleteConfirm);
      addToast('User deleted successfully!', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
      addToast('Delete failed. Please try again.', 'error');
    }
  };

  const handleSubmitUser = async (userData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        addToast('User updated successfully!', 'success');
      } else {
        await createUser(userData);
        addToast('User created successfully!', 'success');
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('User operation failed:', error);
      addToast('Operation failed. Please try again.', 'error');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'var(--text-secondary)'
      }}>
        Loading users...
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'var(--color-error)'
      }}>
        <p>Error loading users: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div 
      key={`users-${currentRole}-${currentUser?.id}-${renderKey}`} 
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Users
            {globalSearchTerm && (
              <span style={{
                fontSize: '1rem',
                fontWeight: 'normal',
                color: 'var(--text-secondary)',
                marginLeft: '1rem'
              }}>
                - Search results for "{globalSearchTerm}"
              </span>
            )}
          </h1>
          <p style={{
            color: 'var(--text-secondary)'
          }}>
            Manage your application users and their permissions.
          </p>
          {/* CRUD 권한 정보 표시 (요구사항에 따라 추가) */}
          <p 
            key={`permissions-${currentRole}-${renderKey}`}
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              marginTop: '0.5rem'
            }}
          >
            Current Role: <strong style={{ color: 'var(--color-primary)' }}>{currentRole || 'Loading...'}</strong> | 
            Original Role: <strong style={{ color: 'var(--text-primary)' }}>{originalRole || 'Loading...'}</strong> | 
            Can Create: <strong style={{ color: canCreateUsers ? 'var(--color-success)' : 'var(--color-error)' }}>
              {canCreateUsers ? 'Yes' : 'No'}
            </strong> | 
            Can Read: <strong style={{ color: canReadUsers ? 'var(--color-success)' : 'var(--color-error)' }}>
              {canReadUsers ? 'Yes' : 'No'}
            </strong> | 
            Can Edit: <strong style={{ color: canEditUsers ? 'var(--color-success)' : 'var(--color-error)' }}>
              {canEditUsers ? 'Yes' : 'No'}
            </strong> | 
            Can Delete: <strong style={{ color: canDeleteUsers ? 'var(--color-success)' : 'var(--color-error)' }}>
              {canDeleteUsers ? 'Yes' : 'No'}
            </strong>
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {canExportData && (
            <Button
              variant="secondary"
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8,"
                  + "Name,Email,Role,Status,Created\n"
                  + users.map(user =>
                    `${user.name},${user.email},${user.role},${user.status},${user.createdAt}`
                  ).join("\n");

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "users.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                addToast('CSV exported successfully!', 'success');
              }}
            >
              Export CSV
            </Button>
          )}

          {canCreateUsers && (
            <Button onClick={handleCreateUser}>
              <Plus size={20} />
              Add User
            </Button>
          )}
        </div>
      </div>

      <Card key={`card-${currentRole}-${renderKey}`}>
        <Card.Content style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem' }}>
            <UserTable
              key={`table-${currentRole}-${trackedRole}-${renderKey}`}
              ref={userTableRef}
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              initialSearchTerm={globalSearchTerm}
              currentUserRole={currentRole}
              canEdit={canEditUsers}
              canDelete={canDeleteUsers}
              canRead={canReadUsers}
            />
          </div>
        </Card.Content>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="md"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmitUser}
          onCancel={handleCloseModal}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

// Wrapper 컴포넌트로 역할 변경 시 완전한 리마운트 보장
const UsersWrapper = () => {
  const { currentRole, currentUser } = useAuth();
  
  // currentRole이 null이면 로딩 상태 표시
  if (!currentRole || !currentUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'var(--text-secondary)'
      }}>
        Loading user permissions...
      </div>
    );
  }
  
  // currentRole이 변경될 때마다 완전히 새로운 Users 컴포넌트를 마운트
  return <Users key={`users-wrapper-${currentRole}-${currentUser?.id}`} />;
};

export default UsersWrapper;