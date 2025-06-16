import React from 'react';

const Table = ({ children, className = '' }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table 
        className={`table ${className}`}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <thead style={{
      backgroundColor: 'var(--bg-secondary)'
    }}>
      {children}
    </thead>
  );
};

const TableBody = ({ children }) => {
  return (
    <tbody style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '' }) => {
  return (
    <tr 
      className={className}
      style={{
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--bg-secondary)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </tr>
  );
};

const TableHead = ({ children, className = '' }) => {
  return (
    <th 
      className={className}
      style={{
        padding: '0.75rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '' }) => {
  return (
    <td 
      className={className}
      style={{
        padding: '0.75rem',
        whiteSpace: 'nowrap',
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;