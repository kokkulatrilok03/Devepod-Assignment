
const { dbGet, dbAll, dbRun } = require('../config/db');

const calculateRiskScore = async (req, res) => {
  try {
    const { project_id } = req.params;

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let riskScore = 0;
    const riskFactors = [];

    const budgetUsedPercent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
    const progressPercent = project.progress || 0;

    if (budgetUsedPercent > progressPercent + 20) {
      riskScore += 50;
      riskFactors.push({
        factor: 'budget_vs_progress',
        severity: 'high',
        message: `Budget used ${budgetUsedPercent.toFixed(1)}% but progress only ${progressPercent}%`
      });
    } else if (budgetUsedPercent > progressPercent + 10) {
      riskScore += 25;
      riskFactors.push({
        factor: 'budget_vs_progress',
        severity: 'medium',
        message: `Budget used ${budgetUsedPercent.toFixed(1)}% but progress only ${progressPercent}%`
      });
    }

    const overdueInvoices = await dbAll(`
      SELECT COUNT(*) as count, SUM(total_amount) as total
      FROM invoices
      WHERE project_id = ? AND type = 'receivable' AND status = 'Overdue'
    `, [project_id]);

    if (overdueInvoices[0] && overdueInvoices[0].count > 0) {
      riskScore += 30;
      riskFactors.push({
        factor: 'invoice_delays',
        severity: 'high',
        message: `${overdueInvoices[0].count} overdue invoice(s) totaling $${parseFloat(overdueInvoices[0].total || 0).toFixed(2)}`
      });
    }

    if (project.spent > project.budget) {
      const overrunPercent = ((project.spent - project.budget) / project.budget) * 100;
      riskScore += 40;
      riskFactors.push({
        factor: 'budget_overrun',
        severity: 'critical',
        message: `Budget overrun by ${overrunPercent.toFixed(1)}%`
      });
    } else if (project.spent > project.budget * 0.9) {
      riskScore += 20;
      riskFactors.push({
        factor: 'budget_overrun',
        severity: 'medium',
        message: `Budget usage at ${budgetUsedPercent.toFixed(1)}%`
      });
    }

    if (project.end_date) {
      const endDate = new Date(project.end_date);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      const daysTotal = Math.ceil((endDate - new Date(project.start_date || today)) / (1000 * 60 * 60 * 24));
      const timeElapsedPercent = daysTotal > 0 ? ((daysTotal - daysRemaining) / daysTotal) * 100 : 0;

      if (daysRemaining < 30 && progressPercent < 80) {
        riskScore += 35;
        riskFactors.push({
          factor: 'timeline_risk',
          severity: 'high',
          message: `Only ${daysRemaining} days remaining but ${progressPercent}% complete`
        });
      } else if (timeElapsedPercent > progressPercent + 15) {
        riskScore += 20;
        riskFactors.push({
          factor: 'timeline_risk',
          severity: 'medium',
          message: `Time elapsed ${timeElapsedPercent.toFixed(1)}% but progress only ${progressPercent}%`
        });
      }
    }

    let riskLevel = 'Low';
    if (riskScore >= 80) riskLevel = 'Critical';
    else if (riskScore >= 60) riskLevel = 'High';
    else if (riskScore >= 30) riskLevel = 'Medium';

    await dbRun(
      'INSERT INTO risk_logs (project_id, risk_score, risk_level, risk_factors) VALUES (?, ?, ?, ?)',
      [project_id, riskScore, riskLevel, JSON.stringify(riskFactors)]
    );

    res.json({
      project_id: parseInt(project_id),
      project_name: project.name,
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_factors: riskFactors,
      calculated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Calculate risk score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllRiskScores = async (req, res) => {
  try {
    const projects = await dbAll('SELECT * FROM projects WHERE status = ?', ['Active']);

    const riskScores = await Promise.all(
      projects.map(async (project) => {

        const latestRisk = await dbGet(
          'SELECT * FROM risk_logs WHERE project_id = ? ORDER BY calculated_at DESC LIMIT 1',
          [project.id]
        );

        if (latestRisk) {
          return {
            project_id: project.id,
            project_name: project.name,
            risk_score: latestRisk.risk_score,
            risk_level: latestRisk.risk_level,
            calculated_at: latestRisk.calculated_at
          };
        } else {


          const budgetUsedPercent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
          const progressPercent = project.progress || 0;
          let riskScore = 0;

          if (budgetUsedPercent > progressPercent + 20) riskScore += 50;
          if (project.spent > project.budget) riskScore += 40;

          let riskLevel = 'Low';
          if (riskScore >= 80) riskLevel = 'Critical';
          else if (riskScore >= 60) riskLevel = 'High';
          else if (riskScore >= 30) riskLevel = 'Medium';

          return {
            project_id: project.id,
            project_name: project.name,
            risk_score: riskScore,
            risk_level: riskLevel,
            calculated_at: new Date().toISOString()
          };
        }
      })
    );

    res.json({ risk_scores: riskScores });
  } catch (error) {
    console.error('Get all risk scores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCashFlowForecast = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const cashFlowData = await dbAll(`
      SELECT 
        DATE(p.payment_date, 'start of month') as month,
        SUM(CASE WHEN i.type = 'receivable' THEN p.amount * p.exchange_rate ELSE -p.amount * p.exchange_rate END) as net_cash_flow
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE DATE(p.payment_date) >= DATE(?)
      GROUP BY DATE(p.payment_date, 'start of month')
      ORDER BY month
    `, [startDate.toISOString().split('T')[0]]);

    const monthlyFlows = cashFlowData.map(d => parseFloat(d.net_cash_flow || 0));
    const averageFlow = monthlyFlows.length > 0 
      ? monthlyFlows.reduce((sum, val) => sum + val, 0) / monthlyFlows.length 
      : 0;

    const forecast = [];
    for (let i = 1; i <= 3; i++) {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i);
      forecast.push({
        month: forecastDate.toISOString().split('T')[0].substring(0, 7),
        forecasted_cash_flow: averageFlow,
        confidence: 'medium'
      });
    }

    res.json({
      historical_data: cashFlowData,
      moving_average: averageFlow,
      forecast: forecast,
      method: 'Simple Moving Average'
    });
  } catch (error) {
    console.error('Cash flow forecast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjectHealth = async (req, res) => {
  try {
    const { project_id } = req.params;

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const budgetUsedPercent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
    const progressPercent = project.progress || 0;

    const budgetVariance = budgetUsedPercent - progressPercent;
    const timeVariance = 0;

    let healthStatus = 'On Track';
    const issues = [];

    if (budgetUsedPercent > progressPercent + 20) {
      healthStatus = 'At Risk';
      issues.push('Budget consumption significantly ahead of progress');
    } else if (project.spent > project.budget) {
      healthStatus = 'Delayed';
      issues.push('Budget overrun detected');
    }

    if (project.end_date) {
      const endDate = new Date(project.end_date);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

      if (daysRemaining < 30 && progressPercent < 80) {
        healthStatus = 'Delayed';
        issues.push('Timeline risk: insufficient time to complete');
      }
    }

    const pendingInvoices = await dbGet(`
      SELECT COUNT(*) as count, SUM(total_amount) as total
      FROM invoices
      WHERE project_id = ? AND type = 'receivable' AND status IN ('Pending', 'Overdue')
    `, [project_id]);

    if (pendingInvoices.count > 0 && parseFloat(pendingInvoices.total || 0) > project.budget * 0.1) {
      healthStatus = 'At Risk';
      issues.push('Significant outstanding receivables');
    }

    res.json({
      project_id: parseInt(project_id),
      project_name: project.name,
      health_status: healthStatus,
      metrics: {
        budget_used_percent: budgetUsedPercent,
        progress_percent: progressPercent,
        budget_variance: budgetVariance,
        spent: project.spent,
        budget: project.budget
      },
      issues: issues,
      assessed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Project health error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllProjectsHealth = async (req, res) => {
  try {
    const projects = await dbAll('SELECT * FROM projects WHERE status = ?', ['Active']);

    const healthData = await Promise.all(
      projects.map(async (project) => {
        const budgetUsedPercent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
        const progressPercent = project.progress || 0;

        let healthStatus = 'On Track';
        if (budgetUsedPercent > progressPercent + 20 || project.spent > project.budget) {
          healthStatus = 'At Risk';
        }
        if (project.spent > project.budget) {
          healthStatus = 'Delayed';
        }

        return {
          project_id: project.id,
          project_name: project.name,
          health_status: healthStatus,
          budget_used_percent: budgetUsedPercent,
          progress_percent: progressPercent
        };
      })
    );

    res.json({ projects_health: healthData });
  } catch (error) {
    console.error('Get all projects health error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  calculateRiskScore,
  getAllRiskScores,
  getCashFlowForecast,
  getProjectHealth,
  getAllProjectsHealth
};

