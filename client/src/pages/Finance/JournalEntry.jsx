
import React, { useState, useEffect } from 'react';
import { financeAPI } from '../../services/api';
import DataTable from '../../components/Tables/DataTable';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const JournalEntry = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isFinanceManager } = useAuth();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await financeAPI.getJournalEntries();
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'entry_number',
      label: 'Entry #',
    },
    {
      key: 'entry_date',
      label: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'Approved' ? 'bg-green-100 text-green-800' :
          value === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'created_by_name',
      label: 'Created By',
    },
  ];

  if (loading) {
    return <div>Loading journal entries...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
      <DataTable columns={columns} data={entries} />
    </div>
  );
};

export default JournalEntry;

