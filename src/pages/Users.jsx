import React, { useState, useEffect, useRef, useMemo, useReducer } from 'react';
import { Plus } from 'lucide-react';
import UserTable from '../components/dashboard/UserTable';
import UserForm from '../components/dashboard/UserForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useUsers } from '../hooks/useFirestore';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { useToast, ToastContainer } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';

const Users = () => {
  const { toasts, addToast, removeToast } = useToast();
  const { currentUser } = useAuth();
  
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
  const [currentRole, setCurrentRole] = useState(currentUser?.role); // 현재 역할 추적
  const userTableRef = useRef();

  // currentUser.role이 변경될 때 감지하고 강제 리렌더링
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== currentRole) {
      console.log('Users component - Role changed from', currentRole, 'to', currentUser.role);
      setCurrentRole(currentUser.role);
      forceUpdate(); // 강제 리렌더링
    }
  }, [currentUser?.role, currentRole]);

  // useMemo를 사용하여 권한 계산을 최적화하고 의존성을 명확히 함
  const permissions = useMemo(() => {
    const role = currentUser?.role;
    console.log('Users component - calculating permissions for role:', role);
    
    return {
      canCreateUsers: hasPermission(role, PERMISSIONS.CREATE_USERS),
      canEditUsers: hasPermission(role, PERMISSIONS.EDIT_USERS),
      canDeleteUsers: hasPermission(role, PERMISSIONS.DELETE_USERS),
      canBulkActions: hasPermission(role, PERMISSIONS.BULK_ACTIONS),
      canExportData: hasPermission(role, PERMISSIONS.EXPORT_DATA)
    };
  }, [currentUser?.role, currentRole]); // currentRole도 의존성에 추가

  const { canCreateUsers, canEditUsers, canDeleteUsers, canBulkActions, canExportData } = permissions;

  // 디버깅용 로그
  console.log('Users component render - currentUser:', currentUser);
  console.log('Users component render - currentRole state:', currentRole);
  console.log('Users component render - permissions:', permissions);

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
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (!canDeleteUsers) {
      addToast('You do not have permission to delete users.', 'error');
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
    <div key={currentRole} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          {/* 디버깅 정보 표시 */}
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            marginTop: '0.5rem'
          }}>
            Current Role: {currentRole} | Original Role: {currentUser?.role} | Can Create: {canCreateUsers ? 'Yes' : 'No'} | Can Edit: {canEditUsers ? 'Yes' : 'No'}
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

      <Card>
        <Card.Content style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem' }}>
            <UserTable
              key={`table-${currentRole}`} // 역할 변경 시 테이블도 리렌더링
              ref={userTableRef}
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              initialSearchTerm={globalSearchTerm}
              currentUserRole={currentRole} // currentRole 사용
              canEdit={canEditUsers}
              canDelete={canDeleteUsers}
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

export default Users;