
const { dbGet, dbAll, dbRun } = require('../config/db');


const getAccounts = async (req, res) => {
  try {
    const accounts = await dbAll('SELECT * FROM accounts ORDER BY account_code');
    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await dbGet('SELECT * FROM accounts WHERE id = ?', [id]);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ account });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createAccount = async (req, res) => {
  try {
    const { account_code, account_name, account_type, parent_account_id, balance } = req.body;

    if (!account_code || !account_name || !account_type) {
      return res.status(400).json({ error: 'Account code, name, and type are required' });
    }

    const result = await dbRun(
      'INSERT INTO accounts (account_code, account_name, account_type, parent_account_id, balance) VALUES (?, ?, ?, ?, ?)',
      [account_code, account_name, account_type, parent_account_id || null, balance || 0.00]
    );

    const account = await dbGet('SELECT * FROM accounts WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_name, account_type, is_active } = req.body;

    await dbRun(
      'UPDATE accounts SET account_name = ?, account_type = ?, is_active = ? WHERE id = ?',
      [account_name, account_type, is_active, id]
    );

    const account = await dbGet('SELECT * FROM accounts WHERE id = ?', [id]);
    res.json({ message: 'Account updated successfully', account });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getJournalEntries = async (req, res) => {
  try {
    const entries = await dbAll(`
      SELECT je.*, 
        u1.username as created_by_name,
        u2.username as approved_by_name
      FROM journal_entries je
      LEFT JOIN users u1 ON je.created_by = u1.id
      LEFT JOIN users u2 ON je.approved_by = u2.id
      ORDER BY je.entry_date DESC, je.id DESC
    `);
    res.json({ entries });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await dbGet(`
      SELECT je.*, 
        u1.username as created_by_name,
        u2.username as approved_by_name
      FROM journal_entries je
      LEFT JOIN users u1 ON je.created_by = u1.id
      LEFT JOIN users u2 ON je.approved_by = u2.id
      WHERE je.id = ?
    `, [id]);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const transactions = await dbAll(`
      SELECT t.*, a.account_code, a.account_name
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.journal_entry_id = ?
    `, [id]);

    res.json({ entry, transactions });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createJournalEntry = async (req, res) => {
  try {
    const { entry_date, description, transactions } = req.body;

    if (!entry_date || !transactions || transactions.length < 2) {
      return res.status(400).json({ error: 'Entry date and at least 2 transactions are required' });
    }

    let totalDebits = 0;
    let totalCredits = 0;

    transactions.forEach(t => {
      totalDebits += parseFloat(t.debit_amount || 0);
      totalCredits += parseFloat(t.credit_amount || 0);
    });

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return res.status(400).json({ error: 'Debits and credits must balance' });
    }

    const entryCount = await dbGet('SELECT COUNT(*) as count FROM journal_entries WHERE DATE(entry_date) = DATE(?)', [entry_date]);
    const entryNumber = `JE-${entry_date.replace(/-/g, '')}-${String(entryCount.count + 1).padStart(3, '0')}`;

    const entryResult = await dbRun(
      'INSERT INTO journal_entries (entry_number, entry_date, description, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [entryNumber, entry_date, description, 'Draft', req.user.id]
    );

    for (const transaction of transactions) {
      await dbRun(
        'INSERT INTO transactions (journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES (?, ?, ?, ?, ?)',
        [entryResult.lastID, transaction.account_id, transaction.debit_amount || 0, transaction.credit_amount || 0, transaction.description || '']
      );

      if (transaction.debit_amount > 0) {
        await dbRun('UPDATE accounts SET balance = balance + ? WHERE id = ?', [transaction.debit_amount, transaction.account_id]);
      }
      if (transaction.credit_amount > 0) {
        await dbRun('UPDATE accounts SET balance = balance - ? WHERE id = ?', [transaction.credit_amount, transaction.account_id]);
      }
    }

    const entry = await dbGet('SELECT * FROM journal_entries WHERE id = ?', [entryResult.lastID]);
    res.status(201).json({ message: 'Journal entry created successfully', entry });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await dbRun(
      'UPDATE journal_entries SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.user.id, id]
    );

    const entry = await dbGet('SELECT * FROM journal_entries WHERE id = ?', [id]);
    res.json({ message: `Journal entry ${status.toLowerCase()}`, entry });
  } catch (error) {
    console.error('Approve journal entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getInvoices = async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = `
      SELECT i.*, 
        c.name as customer_name,
        v.name as vendor_name,
        p.name as project_name,
        u.username as created_by_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN vendors v ON i.vendor_id = v.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND i.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    query += ' ORDER BY i.invoice_date DESC, i.id DESC';

    const invoices = await dbAll(query, params);
    res.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await dbGet(`
      SELECT i.*, 
        c.name as customer_name,
        v.name as vendor_name,
        p.name as project_name,
        u.username as created_by_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN vendors v ON i.vendor_id = v.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `, [id]);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const payments = await dbAll('SELECT * FROM payments WHERE invoice_id = ?', [id]);

    res.json({ invoice, payments });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { invoice_date, due_date, customer_id, vendor_id, project_id, type, subtotal, tax_amount, total_amount, currency, description } = req.body;

    if (!invoice_date || !type || !total_amount) {
      return res.status(400).json({ error: 'Invoice date, type, and total amount are required' });
    }

    if (type === 'receivable' && !customer_id) {
      return res.status(400).json({ error: 'Customer is required for receivable invoices' });
    }
    if (type === 'payable' && !vendor_id) {
      return res.status(400).json({ error: 'Vendor is required for payable invoices' });
    }

    const invoiceCount = await dbGet('SELECT COUNT(*) as count FROM invoices WHERE DATE(invoice_date) = DATE(?)', [invoice_date]);
    const prefix = type === 'receivable' ? 'INV' : 'VINV';
    const invoiceNumber = `${prefix}-${invoice_date.replace(/-/g, '')}-${String(invoiceCount.count + 1).padStart(3, '0')}`;

    let exchangeRate = 1.0;
    if (currency && currency !== 'USD') {
      const rate = await dbGet(
        'SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ? ORDER BY effective_date DESC LIMIT 1',
        [currency, 'USD']
      );
      if (rate) {
        exchangeRate = rate.rate;
      }
    }

    const result = await dbRun(
      'INSERT INTO invoices (invoice_number, invoice_date, due_date, customer_id, vendor_id, project_id, type, subtotal, tax_amount, total_amount, currency, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [invoiceNumber, invoice_date, due_date || null, customer_id || null, vendor_id || null, project_id || null, type, subtotal || total_amount, tax_amount || 0, total_amount, currency || 'USD', description || '', req.user.id]
    );

    if (type === 'receivable') {
      await dbRun('UPDATE accounts SET balance = balance + ? WHERE account_code = ?', [total_amount * exchangeRate, '1100']);
    } else {
      await dbRun('UPDATE accounts SET balance = balance + ? WHERE account_code = ?', [total_amount * exchangeRate, '2000']);
    }

    if (project_id) {
      await dbRun('UPDATE projects SET spent = spent + ? WHERE id = ?', [total_amount * exchangeRate, project_id]);
    }

    const invoice = await dbGet('SELECT * FROM invoices WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getPayments = async (req, res) => {
  try {
    const payments = await dbAll(`
      SELECT p.*, 
        i.invoice_number,
        i.type as invoice_type,
        u.username as created_by_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.payment_date DESC, p.id DESC
    `);
    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPayment = async (req, res) => {
  try {
    const { payment_date, invoice_id, amount, currency, exchange_rate, payment_method, reference_number, notes } = req.body;

    if (!payment_date || !invoice_id || !amount) {
      return res.status(400).json({ error: 'Payment date, invoice ID, and amount are required' });
    }

    const invoice = await dbGet('SELECT * FROM invoices WHERE id = ?', [invoice_id]);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const paymentCount = await dbGet('SELECT COUNT(*) as count FROM payments WHERE DATE(payment_date) = DATE(?)', [payment_date]);
    const paymentNumber = `PAY-${payment_date.replace(/-/g, '')}-${String(paymentCount.count + 1).padStart(3, '0')}`;

    let finalExchangeRate = exchange_rate || 1.0;
    if (currency && currency !== invoice.currency) {
      const rate = await dbGet(
        'SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ? ORDER BY effective_date DESC LIMIT 1',
        [currency, invoice.currency]
      );
      if (rate) {
        finalExchangeRate = rate.rate;
      }
    }

    const result = await dbRun(
      'INSERT INTO payments (payment_number, payment_date, invoice_id, amount, currency, exchange_rate, payment_method, reference_number, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [paymentNumber, payment_date, invoice_id, amount, currency || invoice.currency, finalExchangeRate, payment_method || null, reference_number || null, notes || null, req.user.id]
    );

    const totalPaid = await dbGet('SELECT COALESCE(SUM(amount * exchange_rate), 0) as total FROM payments WHERE invoice_id = ?', [invoice_id]);
    if (totalPaid.total >= invoice.total_amount * 0.99) {
      await dbRun('UPDATE invoices SET status = ? WHERE id = ?', ['Paid', invoice_id]);
    }

    const convertedAmount = amount * finalExchangeRate;
    if (invoice.type === 'receivable') {
      await dbRun('UPDATE accounts SET balance = balance - ? WHERE account_code = ?', [convertedAmount, '1100']);
      await dbRun('UPDATE accounts SET balance = balance + ? WHERE account_code = ?', [convertedAmount, '1000']);
    } else {
      await dbRun('UPDATE accounts SET balance = balance - ? WHERE account_code = ?', [convertedAmount, '2000']);
      await dbRun('UPDATE accounts SET balance = balance - ? WHERE account_code = ?', [convertedAmount, '1000']);
    }

    const payment = await dbGet('SELECT * FROM payments WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getBalanceSheet = async (req, res) => {
  try {
    const { as_of_date } = req.query;
    const dateFilter = as_of_date ? `AND DATE(created_at) <= DATE('${as_of_date}')` : '';

    const assets = await dbAll("SELECT * FROM accounts WHERE account_type = 'Asset' ORDER BY account_code");
    const liabilities = await dbAll("SELECT * FROM accounts WHERE account_type = 'Liability' ORDER BY account_code");
    const equity = await dbAll("SELECT * FROM accounts WHERE account_type = 'Equity' ORDER BY account_code");

    const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.balance || 0), 0);
    const totalEquity = equity.reduce((sum, e) => sum + parseFloat(e.balance || 0), 0);

    res.json({
      as_of_date: as_of_date || new Date().toISOString().split('T')[0],
      assets,
      liabilities,
      equity,
      totals: {
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity,
        total_liabilities_and_equity: totalLiabilities + totalEquity
      }
    });
  } catch (error) {
    console.error('Balance sheet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfitAndLoss = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const revenues = await dbAll("SELECT * FROM accounts WHERE account_type = 'Revenue' ORDER BY account_code");
    const expenses = await dbAll("SELECT * FROM accounts WHERE account_type = 'Expense' ORDER BY account_code");

    let revenueQuery = `
      SELECT a.account_code, a.account_name, COALESCE(SUM(t.credit_amount - t.debit_amount), 0) as amount
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      LEFT JOIN journal_entries je ON t.journal_entry_id = je.id
      WHERE a.account_type = 'Revenue'
    `;
    let expenseQuery = `
      SELECT a.account_code, a.account_name, COALESCE(SUM(t.debit_amount - t.credit_amount), 0) as amount
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      LEFT JOIN journal_entries je ON t.journal_entry_id = je.id
      WHERE a.account_type = 'Expense'
    `;

    if (start_date) {
      revenueQuery += ` AND DATE(je.entry_date) >= DATE('${start_date}')`;
      expenseQuery += ` AND DATE(je.entry_date) >= DATE('${start_date}')`;
    }
    if (end_date) {
      revenueQuery += ` AND DATE(je.entry_date) <= DATE('${end_date}')`;
      expenseQuery += ` AND DATE(je.entry_date) <= DATE('${end_date}')`;
    }

    revenueQuery += ' GROUP BY a.id, a.account_code, a.account_name';
    expenseQuery += ' GROUP BY a.id, a.account_code, a.account_name';

    const revenueDetails = await dbAll(revenueQuery);
    const expenseDetails = await dbAll(expenseQuery);

    const totalRevenue = revenueDetails.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const totalExpenses = expenseDetails.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netIncome = totalRevenue - totalExpenses;

    res.json({
      period: {
        start_date: start_date || null,
        end_date: end_date || null
      },
      revenues: revenueDetails,
      expenses: expenseDetails,
      totals: {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_income: netIncome
      }
    });
  } catch (error) {
    console.error('Profit & Loss error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCashFlow = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let operatingQuery = `
      SELECT 
        DATE(p.payment_date) as date,
        CASE 
          WHEN i.type = 'receivable' THEN p.amount * p.exchange_rate
          ELSE -p.amount * p.exchange_rate
        END as amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE 1=1
    `;

    if (start_date) operatingQuery += ` AND DATE(p.payment_date) >= DATE('${start_date}')`;
    if (end_date) operatingQuery += ` AND DATE(p.payment_date) <= DATE('${end_date}')`;

    const operatingActivities = await dbAll(operatingQuery);
    const operatingTotal = operatingActivities.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

    let investingQuery = `
      SELECT 
        DATE(je.entry_date) as date,
        -t.debit_amount as amount
      FROM transactions t
      JOIN journal_entries je ON t.journal_entry_id = je.id
      JOIN accounts a ON t.account_id = a.id
      WHERE a.account_code = '1300'
    `;

    if (start_date) investingQuery += ` AND DATE(je.entry_date) >= DATE('${start_date}')`;
    if (end_date) investingQuery += ` AND DATE(je.entry_date) <= DATE('${end_date}')`;

    const investingActivities = await dbAll(investingQuery);
    const investingTotal = investingActivities.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

    let financingQuery = `
      SELECT 
        DATE(je.entry_date) as date,
        CASE 
          WHEN a.account_code LIKE '2%' THEN t.credit_amount
          WHEN a.account_code LIKE '3%' THEN t.credit_amount
          ELSE 0
        END as amount
      FROM transactions t
      JOIN journal_entries je ON t.journal_entry_id = je.id
      JOIN accounts a ON t.account_id = a.id
      WHERE (a.account_code LIKE '2%' OR a.account_code LIKE '3%')
    `;

    if (start_date) financingQuery += ` AND DATE(je.entry_date) >= DATE('${start_date}')`;
    if (end_date) financingQuery += ` AND DATE(je.entry_date) <= DATE('${end_date}')`;

    const financingActivities = await dbAll(financingQuery);
    const financingTotal = financingActivities.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

    const netCashFlow = operatingTotal + investingTotal + financingTotal;

    res.json({
      period: {
        start_date: start_date || null,
        end_date: end_date || null
      },
      operating_activities: {
        items: operatingActivities,
        total: operatingTotal
      },
      investing_activities: {
        items: investingActivities,
        total: investingTotal
      },
      financing_activities: {
        items: financingActivities,
        total: financingTotal
      },
      net_cash_flow: netCashFlow
    });
  } catch (error) {
    console.error('Cash flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getCustomers = async (req, res) => {
  try {
    const customers = await dbAll('SELECT * FROM customers ORDER BY name');
    res.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, tax_id, currency } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const result = await dbRun(
      'INSERT INTO customers (name, contact_person, email, phone, address, tax_id, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, contact_person || null, email || null, phone || null, address || null, tax_id || null, currency || 'USD']
    );

    const customer = await dbGet('SELECT * FROM customers WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getVendors = async (req, res) => {
  try {
    const vendors = await dbAll('SELECT * FROM vendors ORDER BY name');
    res.json({ vendors });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createVendor = async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, tax_id, currency } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }

    const result = await dbRun(
      'INSERT INTO vendors (name, contact_person, email, phone, address, tax_id, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, contact_person || null, email || null, phone || null, address || null, tax_id || null, currency || 'USD']
    );

    const vendor = await dbGet('SELECT * FROM vendors WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Vendor created successfully', vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {

  getAccounts,
  getAccount,
  createAccount,
  updateAccount,

  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  approveJournalEntry,

  getInvoices,
  getInvoice,
  createInvoice,

  getPayments,
  createPayment,

  getBalanceSheet,
  getProfitAndLoss,
  getCashFlow,

  getCustomers,
  createCustomer,
  getVendors,
  createVendor
};

