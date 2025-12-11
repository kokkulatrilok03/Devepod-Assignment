
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import DataTable from '../../components/Tables/DataTable';
import { formatDate } from '../../utils/helpers';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'Username',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'full_name',
      label: 'Full Name',
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {value?.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => formatDate(value),
    },
  ];

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default Users;

