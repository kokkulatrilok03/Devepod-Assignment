
import React, { useState, useEffect } from 'react';
import { financeAPI } from '../../services/api';
import DataTable from '../../components/Tables/DataTable';
import InvoiceForm from '../../components/Finance/InvoiceForm';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const { isFinanceManager } = useAuth();

  useEffect(() => {
    loadInvoices();
  }, [filterType]);

  const loadInvoices = async () => {
    try {
      const params = filterType ? { type: filterType } : {};
      const response = await financeAPI.getInvoices(params);
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
    },
    {
      key: 'invoice_date',
      label: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'type',
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
      key: 'customer_name',
      label: 'Customer/Vendor',
      render: (value, row) => row.customer_name || row.vendor_name || '-',
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'Paid' ? 'bg-green-100 text-green-800' :
          value === 'Overdue' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div>Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        {isFinanceManager && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Invoice
          </button>
        )}
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setFilterType('')}
          className={`px-4 py-2 rounded ${!filterType ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('receivable')}
          className={`px-4 py-2 rounded ${filterType === 'receivable' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Receivables
        </button>
        <button
          onClick={() => setFilterType('payable')}
          className={`px-4 py-2 rounded ${filterType === 'payable' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Payables
        </button>
      </div>

      <DataTable columns={columns} data={invoices} />

      {showForm && (
        <InvoiceForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadInvoices();
          }}
        />
      )}
    </div>
  );
};

export default Invoices;

