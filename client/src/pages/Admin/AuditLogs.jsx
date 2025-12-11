
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import DataTable from '../../components/Tables/DataTable';
import { formatDate } from '../../utils/helpers';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await adminAPI.getAuditLogs();
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'User',
    },
    {
      key: 'action',
      label: 'Action',
    },
    {
      key: 'entity_type',
      label: 'Entity Type',
    },
    {
      key: 'entity_id',
      label: 'Entity ID',
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (value) => formatDate(value),
    },
  ];

  if (loading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
      <DataTable columns={columns} data={logs} />
    </div>
  );
};

export default AuditLogs;

