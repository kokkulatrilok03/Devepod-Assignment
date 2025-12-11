
const { dbGet, dbAll } = require('../config/db');

const getDashboardData = async (req, res) => {
  try {

    const revenueResult = await dbGet(`
      SELECT COALESCE(SUM(p.amount * p.exchange_rate), 0) as total
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.type = 'receivable'
    `);
    const totalRevenue = parseFloat(revenueResult?.total || 0);

    const expenseResult = await dbGet(`
      SELECT COALESCE(SUM(p.amount * p.exchange_rate), 0) as total
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.type = 'payable'
    `);
    const totalExpenses = parseFloat(expenseResult?.total || 0);

    const outstandingReceivables = await dbGet(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(i.total_amount - COALESCE(paid.total, 0)), 0) as total
      FROM invoices i
      LEFT JOIN (
        SELECT invoice_id, SUM(amount * exchange_rate) as total
        FROM payments
        GROUP BY invoice_id
      ) paid ON i.id = paid.invoice_id
      WHERE i.type = 'receivable' AND i.status != 'Paid'
    `);
    const outstandingInvoices = {
      count: outstandingReceivables?.count || 0,
      amount: parseFloat(outstandingReceivables?.total || 0)
    };

    const outstandingPayables = await dbGet(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(i.total_amount - COALESCE(paid.total, 0)), 0) as total
      FROM invoices i
      LEFT JOIN (
        SELECT invoice_id, SUM(amount * exchange_rate) as total
        FROM payments
        GROUP BY invoice_id
      ) paid ON i.id = paid.invoice_id
      WHERE i.type = 'payable' AND i.status != 'Paid'
    `);
    const outstandingPayablesData = {
      count: outstandingPayables?.count || 0,
      amount: parseFloat(outstandingPayables?.total || 0)
    };

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const cashFlowTrend = await dbAll(`
      SELECT 
        DATE(p.payment_date, 'start of month') as month,
        SUM(CASE WHEN i.type = 'receivable' THEN p.amount * p.exchange_rate ELSE -p.amount * p.exchange_rate END) as net_cash_flow
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE DATE(p.payment_date) >= DATE(?)
      GROUP BY DATE(p.payment_date, 'start of month')
      ORDER BY month
    `, [sixMonthsAgo.toISOString().split('T')[0]]);

    const riskAlerts = await dbAll(`
      SELECT 
        rl.project_id,
        p.name as project_name,
        rl.risk_score,
        rl.risk_level,
        rl.calculated_at
      FROM risk_logs rl
      JOIN projects p ON rl.project_id = p.id
      WHERE rl.risk_level IN ('High', 'Critical')
        AND rl.calculated_at = (
          SELECT MAX(calculated_at) 
          FROM risk_logs 
          WHERE project_id = rl.project_id
        )
      ORDER BY rl.risk_score DESC
      LIMIT 5
    `);

    const activeProjects = await dbGet('SELECT COUNT(*) as count FROM projects WHERE status = ?', ['Active']);
    const activeProjectsCount = activeProjects?.count || 0;

    const netProfit = totalRevenue - totalExpenses;

    res.json({
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      outstanding_invoices: outstandingInvoices,
      outstanding_payables: outstandingPayablesData,
      cash_flow_trend: cashFlowTrend,
      current_risk_alerts: riskAlerts,
      active_projects: activeProjectsCount,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboardData
};

