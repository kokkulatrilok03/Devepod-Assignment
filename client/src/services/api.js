
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export const financeAPI = {

  getAccounts: () => api.get('/finance/accounts'),
  getAccount: (id) => api.get(`/finance/accounts/${id}`),
  createAccount: (data) => api.post('/finance/accounts', data),
  updateAccount: (id, data) => api.put(`/finance/accounts/${id}`, data),

  getJournalEntries: () => api.get('/finance/journal-entries'),
  getJournalEntry: (id) => api.get(`/finance/journal-entries/${id}`),
  createJournalEntry: (data) => api.post('/finance/journal-entries', data),
  approveJournalEntry: (id, status) => api.put(`/finance/journal-entries/${id}/approve`, { status }),

  getInvoices: (params) => api.get('/finance/invoices', { params }),
  getInvoice: (id) => api.get(`/finance/invoices/${id}`),
  createInvoice: (data) => api.post('/finance/invoices', data),

  getPayments: () => api.get('/finance/payments'),
  createPayment: (data) => api.post('/finance/payments', data),

  getBalanceSheet: (params) => api.get('/finance/reports/balance-sheet', { params }),
  getProfitAndLoss: (params) => api.get('/finance/reports/profit-loss', { params }),
  getCashFlow: (params) => api.get('/finance/reports/cash-flow', { params }),

  getCustomers: () => api.get('/finance/customers'),
  createCustomer: (data) => api.post('/finance/customers', data),
  getVendors: () => api.get('/finance/vendors'),
  createVendor: (data) => api.post('/finance/vendors', data),
};

export const insightsAPI = {
  getRiskScore: (projectId) => api.get(`/insights/risk/${projectId}`),
  getAllRiskScores: () => api.get('/insights/risk'),
  getCashFlowForecast: (params) => api.get('/insights/cash-flow-forecast', { params }),
  getProjectHealth: (projectId) => api.get(`/insights/project-health/${projectId}`),
  getAllProjectsHealth: () => api.get('/insights/project-health'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getProjects: () => api.get('/admin/projects'),
  createProject: (data) => api.post('/admin/projects', data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}`, data),
};

export default api;

