
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Finance/Invoices';
import Payments from './pages/Finance/Payments';
import ChartOfAccounts from './pages/Finance/ChartOfAccounts';
import JournalEntry from './pages/Finance/JournalEntry';
import FinancialStatements from './pages/Finance/FinancialStatements';
import Users from './pages/Admin/Users';
import AuditLogs from './pages/Admin/AuditLogs';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="finance">
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="journal-entry" element={<JournalEntry />} />
          <Route path="financial-statements" element={<FinancialStatements />} />
        </Route>
        <Route path="admin/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

