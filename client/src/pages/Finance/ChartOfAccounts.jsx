
import React, { useState, useEffect } from 'react';
import { financeAPI } from '../../services/api';
import DataTable from '../../components/Tables/DataTable';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isFinanceManager } = useAuth();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await financeAPI.getAccounts();
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'account_code',
      label: 'Code',
    },
    {
      key: 'account_name',
      label: 'Account Name',
    },
    {
      key: 'account_type',
      label: 'Type',
      render: (value) => (
        <span className="px-2 py-1 rounded text-xs bg-gray-100">
          {value}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div>Loading accounts...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
      <DataTable columns={columns} data={accounts} />
    </div>
  );
};

export default ChartOfAccounts;

