import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Edit2, Trash2, Search } from 'lucide-react';
import Table from '../ui/Table';
import Button from '../ui/Button';

const UserTable = forwardRef(({ users, onEdit, onDelete, initialSearchTerm = '' }, ref) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 외부에서 검색어를 설정할 수 있도록 하는 함수
  useImperativeHandle(ref, () => ({
    setExternalSearch: (term) => {
      setSearchTerm(term);
      setCurrentPage(1); // 검색 시 첫 페이지로 이동
    }
  }));

  // 글로벌 검색 이벤트 리스너
  useEffect(() => {
    const handleGlobalSearch = (event) => {
      const { searchTerm: globalSearchTerm } = event.detail;
      setSearchTerm(globalSearchTerm);
      setCurrentPage(1); // 검색 시 첫 페이지로 이동
    };

    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    }
    return a[sortField] < b[sortField] ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleLocalSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    
    // 글로벌 검색도 클리어
    const searchEvent = new CustomEvent('globalSearch', {
      detail: { searchTerm: '' }
    });
    window.dispatchEvent(searchEvent);
  };

  const StatusBadge = ({ status }) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.625rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: status === 'active' 
        ? 'rgba(16, 185, 129, 0.1)' 
        : 'rgba(107, 114, 128, 0.1)',
      color: status === 'active' 
        ? 'var(--color-success)' 
        : 'var(--text-secondary)'
    }}>
      {status}
    </span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleLocalSearchChange}
            className="form-input"
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '2.5rem',
              paddingRight: searchTerm ? '2.5rem' : '0.75rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                lineHeight: 1,
                padding: '0.25rem',
                zIndex: 1
              }}
            >
              ×
            </button>
          )}
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          {searchTerm ? (
            <>
              <span style={{ fontWeight: '500' }}>{filteredUsers.length}</span> users found
              {searchTerm && (
                <span> for "<span style={{ fontWeight: '500', color: 'var(--color-primary)' }}>{searchTerm}</span>"</span>
              )}
            </>
          ) : (
            <><span style={{ fontWeight: '500' }}>{filteredUsers.length}</span> total users</>
          )}
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-color)'
      }}>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>
                <button 
                  onClick={() => handleSort('name')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <span>Name</span>
                  {sortField === 'name' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </Table.Head>
              <Table.Head>
                <button 
                  onClick={() => handleSort('email')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <span>Email</span>
                  {sortField === 'email' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </Table.Head>
              <Table.Head>
                <button 
                  onClick={() => handleSort('role')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <span>Role</span>
                  {sortField === 'role' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Created</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        height: '32px',
                        width: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.75rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: 'white'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                        {user.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--color-primary)'
                    }}>
                      {user.role}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={user.status} />
                  </Table.Cell>
                  <Table.Cell>{user.createdAt}</Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user.id)}
                      >
                        <Trash2 size={16} style={{ color: 'var(--color-error)' }} />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm ? (
                      <>
                        No users found for "<span style={{ fontWeight: '500' }}>{searchTerm}</span>"
                        <br />
                        <button
                          onClick={clearSearch}
                          style={{
                            marginTop: '0.5rem',
                            color: 'var(--color-primary)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      'No users available'
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedUsers.length)} of {sortedUsers.length} results
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

UserTable.displayName = 'UserTable';

export default UserTable;