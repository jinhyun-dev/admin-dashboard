import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import UserTable from '../components/dashboard/UserTable';
import UserForm from '../components/dashboard/UserForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_USERS } from '../utils/constants';

const Users = () => {
  const [users, setUsers] = useLocalStorage('users', INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const userTableRef = useRef();

  // 글로벌 검색 이벤트 리스너
  useEffect(() => {
    const handleGlobalSearch = (event) => {
      const { searchTerm } = event.detail;
      setGlobalSearchTerm(searchTerm);
      
      // UserTable 컴포넌트에 검색어 전달
      if (userTableRef.current && userTableRef.current.setExternalSearch) {
        userTableRef.current.setExternalSearch(searchTerm);
      }
    };

    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch);
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    setDeleteConfirm(userId);
  };

  const confirmDelete = () => {
    setUsers(users.filter(user => user.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const handleSubmitUser = (userData) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...userData, id: editingUser.id }
          : user
      ));
    } else {
      // Create new user
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
        <Button onClick={handleCreateUser}>
          <Plus size={20} />
          Add User
        </Button>
      </div>

      <Card>
        <Card.Content style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem' }}>
            <UserTable
              ref={userTableRef}
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              initialSearchTerm={globalSearchTerm}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Create/Edit User Modal */}
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

      {/* Delete Confirmation Modal */}
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