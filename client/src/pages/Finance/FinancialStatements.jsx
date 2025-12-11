
import React, { useState } from 'react';
import { financeAPI } from '../../services/api';
import { formatCurrency, formatDateForInput } from '../../utils/helpers';
import DataTable from '../../components/Tables/DataTable';

const FinancialStatements = () => {
  const [activeTab, setActiveTab] = useState('balance-sheet');
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    as_of_date: new Date().toISOString().split('T')[0],
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const loadBalanceSheet = async () => {
    setLoading(true);
    try {
      const response = await financeAPI.getBalanceSheet({ as_of_date: dateFilter.as_of_date });
      setBalanceSheet(response.data);
    } catch (error) {
      console.error('Error loading balance sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfitLoss = async () => {
    setLoading(true);
    try {
      const response = await financeAPI.getProfitAndLoss({
        start_date: dateFilter.start_date,
        end_date: dateFilter.end_date,
      });
      setProfitLoss(response.data);
    } catch (error) {
      console.error('Error loading profit & loss:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCashFlow = async () => {
    setLoading(true);
    try {
      const response = await financeAPI.getCashFlow({
        start_date: dateFilter.start_date,
        end_date: dateFilter.end_date,
      });
      setCashFlow(response.data);
    } catch (error) {
      console.error('Error loading cash flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'balance-sheet' && !balanceSheet) {
      loadBalanceSheet();
    } else if (tab === 'profit-loss' && !profitLoss) {
      loadProfitLoss();
    } else if (tab === 'cash-flow' && !cashFlow) {
      loadCashFlow();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Financial Statements</h1>

      {}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['balance-sheet', 'profit-loss', 'cash-flow'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </nav>
      </div>

      {}
      <div className="flex space-x-4">
        {activeTab === 'balance-sheet' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">As of Date</label>
            <input
              type="date"
              value={dateFilter.as_of_date}
              onChange={(e) => setDateFilter({ ...dateFilter, as_of_date: e.target.value })}
              className="mt-1 block rounded-md border-gray-300 shadow-sm"
            />
            <button
              onClick={loadBalanceSheet}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Load
            </button>
          </div>
        )}
        {(activeTab === 'profit-loss' || activeTab === 'cash-flow') && (
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateFilter.start_date}
                onChange={(e) => setDateFilter({ ...dateFilter, start_date: e.target.value })}
                className="mt-1 block rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateFilter.end_date}
                onChange={(e) => setDateFilter({ ...dateFilter, end_date: e.target.value })}
                className="mt-1 block rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={activeTab === 'profit-loss' ? loadProfitLoss : loadCashFlow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Load
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      {loading && <div>Loading...</div>}

      {activeTab === 'balance-sheet' && balanceSheet && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Balance Sheet as of {formatDateForInput(balanceSheet.as_of_date)}</h2>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Assets</h3>
            <DataTable
              columns={[
                { key: 'account_code', label: 'Code' },
                { key: 'account_name', label: 'Account' },
                { key: 'balance', label: 'Balance', render: (v) => formatCurrency(v) },
              ]}
              data={balanceSheet.assets}
            />
            <p className="text-right font-semibold mt-2">
              Total Assets: {formatCurrency(balanceSheet.totals.total_assets)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Liabilities</h3>
            <DataTable
              columns={[
                { key: 'account_code', label: 'Code' },
                { key: 'account_name', label: 'Account' },
                { key: 'balance', label: 'Balance', render: (v) => formatCurrency(v) },
              ]}
              data={balanceSheet.liabilities}
            />
            <p className="text-right font-semibold mt-2">
              Total Liabilities: {formatCurrency(balanceSheet.totals.total_liabilities)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Equity</h3>
            <DataTable
              columns={[
                { key: 'account_code', label: 'Code' },
                { key: 'account_name', label: 'Account' },
                { key: 'balance', label: 'Balance', render: (v) => formatCurrency(v) },
              ]}
              data={balanceSheet.equity}
            />
            <p className="text-right font-semibold mt-2">
              Total Equity: {formatCurrency(balanceSheet.totals.total_equity)}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'profit-loss' && profitLoss && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Profit & Loss Statement ({formatDateForInput(profitLoss.period.start_date)} to {formatDateForInput(profitLoss.period.end_date)})
          </h2>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <DataTable
              columns={[
                { key: 'account_code', label: 'Code' },
                { key: 'account_name', label: 'Account' },
                { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
              ]}
              data={profitLoss.revenues}
            />
            <p className="text-right font-semibold mt-2">
              Total Revenue: {formatCurrency(profitLoss.totals.total_revenue)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Expenses</h3>
            <DataTable
              columns={[
                { key: 'account_code', label: 'Code' },
                { key: 'account_name', label: 'Account' },
                { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
              ]}
              data={profitLoss.expenses}
            />
            <p className="text-right font-semibold mt-2">
              Total Expenses: {formatCurrency(profitLoss.totals.total_expenses)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-right text-xl font-bold">
              Net Income: {formatCurrency(profitLoss.totals.net_income)}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'cash-flow' && cashFlow && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Cash Flow Statement ({formatDateForInput(cashFlow.period.start_date)} to {formatDateForInput(cashFlow.period.end_date)})
          </h2>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Operating Activities</h3>
            <p className="text-right font-semibold">
              Total: {formatCurrency(cashFlow.operating_activities.total)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Investing Activities</h3>
            <p className="text-right font-semibold">
              Total: {formatCurrency(cashFlow.investing_activities.total)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Financing Activities</h3>
            <p className="text-right font-semibold">
              Total: {formatCurrency(cashFlow.financing_activities.total)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-right text-xl font-bold">
              Net Cash Flow: {formatCurrency(cashFlow.net_cash_flow)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialStatements;

