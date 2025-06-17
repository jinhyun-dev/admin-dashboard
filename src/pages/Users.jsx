import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import UserTable from '../components/dashboard/UserTable';
import UserForm from '../components/dashboard/UserForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_USERS } from '../utils/constants';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

const Users = ({ currentUserRole }) => {
  const [users, setUsers] = useLocalStorage('users', INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const userTableRef = useRef();

  const canCreateUsers = hasPermission(currentUserRole, PERMISSIONS.CREATE_USERS);
  const canEditUsers = hasPermission(currentUserRole, PERMISSIONS.EDIT_USERS);
  const canDeleteUsers = hasPermission(currentUserRole, PERMISSIONS.DELETE_USERS);
  const canBulkActions = hasPermission(currentUserRole, PERMISSIONS.BULK_ACTIONS);
  const canExportData = hasPermission(currentUserRole, PERMISSIONS.EXPORT_DATA);

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
      alert('You do not have permission to create users.');
      return;
    }
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    if (!canEditUsers) {
      alert('You do not have permission to edit users.');
      return;
    }
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (!canDeleteUsers) {
      alert('You do not have permission to delete users.');
      return;
    }
    setDeleteConfirm(userId);
  };

  const confirmDelete = () => {
    setUsers(users.filter(user => user.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const handleSubmitUser = (userData) => {
    if (editingUser) {
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...userData, id: editingUser.id }
          : user
      ));
    } else {
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            {/* ✅ UserTable 호출 부분 수정 */}
            <UserTable
              ref={userTableRef}
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              initialSearchTerm={globalSearchTerm}
              currentUserRole={currentUserRole}
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
    </div>
  );
};

export default Users;
