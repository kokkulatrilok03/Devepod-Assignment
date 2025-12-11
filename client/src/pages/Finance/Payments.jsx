
import React, { useState, useEffect } from 'react';
import { financeAPI } from '../../services/api';
import DataTable from '../../components/Tables/DataTable';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await financeAPI.getPayments();
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'payment_number',
      label: 'Payment #',
    },
    {
      key: 'payment_date',
      label: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'invoice_number',
      label: 'Invoice #',
    },
    {
      key: 'invoice_type',
      label: 'Type',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'receivable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, row) => formatCurrency(value * (row.exchange_rate || 1)),
    },
    {
      key: 'payment_method',
      label: 'Method',
    },
  ];

  if (loading) {
    return <div>Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
      <DataTable columns={columns} data={payments} />
    </div>
  );
};

export default Payments;

