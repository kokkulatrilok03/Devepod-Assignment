
import React, { useState, useEffect } from 'react';
import { dashboardAPI, insightsAPI } from '../services/api';
import KPICard from '../components/Cards/KPICard';
import RiskCard from '../components/Cards/RiskCard';
import CashFlowChart from '../components/Charts/CashFlowChart';
import RevenueChart from '../components/Charts/RevenueChart';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [riskScores, setRiskScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardRes, riskRes] = await Promise.all([
        dashboardAPI.getData(),
        insightsAPI.getAllRiskScores(),
      ]);

      setDashboardData(dashboardRes.data);
      setRiskScores(riskRes.data.risk_scores || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={dashboardData.total_revenue}
          icon="💰"
        />
        <KPICard
          title="Total Expenses"
          value={dashboardData.total_expenses}
          icon="💸"
        />
        <KPICard
          title="Net Profit"
          value={dashboardData.net_profit}
          icon="📈"
        />
        <KPICard
          title="Active Projects"
          value={dashboardData.active_projects}
          icon="🏗️"
        />
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Outstanding Invoices"
          value={dashboardData.outstanding_invoices.amount}
          subtitle={`${dashboardData.outstanding_invoices.count} invoices`}
          icon="📄"
        />
        <KPICard
          title="Outstanding Payables"
          value={dashboardData.outstanding_payables.amount}
          subtitle={`${dashboardData.outstanding_payables.count} invoices`}
          icon="📋"
        />
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={dashboardData.cash_flow_trend} />
        <RevenueChart
          revenue={dashboardData.total_revenue}
          expenses={dashboardData.total_expenses}
        />
      </div>

      {}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Alerts</h2>
        {dashboardData.current_risk_alerts && dashboardData.current_risk_alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.current_risk_alerts.map((alert) => (
              <RiskCard
                key={alert.project_id}
                projectName={alert.project_name}
                riskScore={alert.risk_score}
                riskLevel={alert.risk_level}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No high-risk projects at this time
          </div>
        )}
      </div>

      {}
      {riskScores.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Projects Risk Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riskScores.map((risk) => (
              <RiskCard
                key={risk.project_id}
                projectName={risk.project_name}
                riskScore={risk.risk_score}
                riskLevel={risk.risk_level}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

