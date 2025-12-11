
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isFinanceManager } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
    },
    {
      name: 'Invoices',
      path: '/finance/invoices',
      icon: '📄',
      requiresFinance: true,
    },
    {
      name: 'Payments',
      path: '/finance/payments',
      icon: '💳',
      requiresFinance: true,
    },
    {
      name: 'Chart of Accounts',
      path: '/finance/chart-of-accounts',
      icon: '📋',
      requiresFinance: true,
    },
    {
      name: 'Journal Entry',
      path: '/finance/journal-entry',
      icon: '📝',
      requiresFinance: true,
    },
    {
      name: 'Financial Statements',
      path: '/finance/financial-statements',
      icon: '📊',
      requiresFinance: true,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
      requiresAdmin: true,
    },
    {
      name: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: '📜',
      requiresAdmin: true,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.requiresAdmin && !isAdmin) return false;
    if (item.requiresFinance && !isFinanceManager) return false;
    return true;
  });

  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

