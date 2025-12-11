
import React, { useState, useEffect } from 'react';
import { financeAPI } from '../../services/api';

const InvoiceForm = ({ invoice, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    invoice_date: '',
    due_date: '',
    customer_id: '',
    vendor_id: '',
    project_id: '',
    type: 'receivable',
    subtotal: '',
    tax_amount: '',
    total_amount: '',
    currency: 'USD',
    description: '',
  });

  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_date: invoice.invoice_date || '',
        due_date: invoice.due_date || '',
        customer_id: invoice.customer_id || '',
        vendor_id: invoice.vendor_id || '',
        project_id: invoice.project_id || '',
        type: invoice.type || 'receivable',
        subtotal: invoice.subtotal || '',
        tax_amount: invoice.tax_amount || '',
        total_amount: invoice.total_amount || '',
        currency: invoice.currency || 'USD',
        description: invoice.description || '',
      });
    }

    Promise.all([
      financeAPI.getCustomers(),
      financeAPI.getVendors(),

    ]).then(([customersRes, vendorsRes]) => {
      setCustomers(customersRes.data.customers || []);
      setVendors(vendorsRes.data.vendors || []);
    });
  }, [invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'subtotal' || name === 'tax_amount') {
      const subtotal = parseFloat(name === 'subtotal' ? value : formData.subtotal) || 0;
      const tax = parseFloat(name === 'tax_amount' ? value : formData.tax_amount) || 0;
      setFormData((prev) => ({
        ...prev,
        total_amount: (subtotal + tax).toFixed(2),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (invoice) {

      } else {
        await financeAPI.createInvoice(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{invoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="receivable">Receivable</option>
                <option value="payable">Payable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
              <input
                type="date"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          {formData.type === 'receivable' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtotal</label>
              <input
                type="number"
                step="0.01"
                name="subtotal"
                value={formData.subtotal}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
              <input
                type="number"
                step="0.01"
                name="tax_amount"
                value={formData.tax_amount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input
                type="number"
                step="0.01"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;

