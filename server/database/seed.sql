
INSERT OR IGNORE INTO roles (id, name, description) VALUES
(1, 'admin', 'System Administrator with full access'),
(2, 'finance_manager', 'Manages financial operations and reports'),
(3, 'project_manager', 'Manages construction projects');

INSERT OR IGNORE INTO users (id, username, email, password_hash, role, full_name) VALUES
(1, 'admin', 'admin@construction.com', '$2a$10$hXxBmNK1ZzpEPJbDv7RNh.SEJZPTeGBmmAjRxuGsLtixYKE35gHfS', 'admin', 'System Administrator'),
(2, 'finance', 'finance@construction.com', '$2a$10$hXxBmNK1ZzpEPJbDv7RNh.SEJZPTeGBmmAjRxuGsLtixYKE35gHfS', 'finance_manager', 'Finance Manager'),
(3, 'pm1', 'pm1@construction.com', '$2a$10$hXxBmNK1ZzpEPJbDv7RNh.SEJZPTeGBmmAjRxuGsLtixYKE35gHfS', 'project_manager', 'Project Manager 1');

INSERT OR IGNORE INTO accounts (id, account_code, account_name, account_type, balance) VALUES
(1, '1000', 'Cash', 'Asset', 500000.00),
(2, '1100', 'Accounts Receivable', 'Asset', 150000.00),
(3, '1200', 'Inventory', 'Asset', 75000.00),
(4, '1300', 'Equipment', 'Asset', 500000.00),
(5, '2000', 'Accounts Payable', 'Liability', 80000.00),
(6, '2100', 'Short-term Loans', 'Liability', 100000.00),
(7, '3000', 'Owner Equity', 'Equity', 1000000.00),
(8, '3100', 'Retained Earnings', 'Equity', 45000.00),
(9, '4000', 'Construction Revenue', 'Revenue', 0.00),
(10, '4100', 'Service Revenue', 'Revenue', 0.00),
(11, '5000', 'Material Costs', 'Expense', 0.00),
(12, '5100', 'Labor Costs', 'Expense', 0.00),
(13, '5200', 'Equipment Rental', 'Expense', 0.00),
(14, '5300', 'Administrative Expenses', 'Expense', 0.00);

INSERT OR IGNORE INTO projects (id, name, description, budget, spent, status, progress, start_date, end_date, project_manager_id) VALUES
(1, 'Downtown Office Complex', 'Construction of 10-story office building', 5000000.00, 3200000.00, 'Active', 65, '2024-01-15', '2024-12-31', 3),
(2, 'Residential Apartment Block', '50-unit residential complex', 3000000.00, 2800000.00, 'Active', 45, '2024-03-01', '2025-02-28', 3),
(3, 'Shopping Mall Renovation', 'Complete renovation of existing mall', 2000000.00, 1200000.00, 'Active', 60, '2024-02-10', '2024-11-30', 3),
(4, 'Highway Bridge Construction', 'New bridge over river', 8000000.00, 4500000.00, 'Active', 55, '2023-11-01', '2025-06-30', 3);

INSERT OR IGNORE INTO customers (id, name, contact_person, email, phone, address, currency) VALUES
(1, 'ABC Development Corp', 'John Smith', 'john@abcdev.com', '+1-555-0101', '123 Business St, City', 'USD'),
(2, 'XYZ Real Estate', 'Jane Doe', 'jane@xyzreal.com', '+1-555-0102', '456 Property Ave, City', 'USD'),
(3, 'Global Builders Inc', 'Mike Johnson', 'mike@globalbuild.com', '+1-555-0103', '789 Construction Blvd, City', 'USD');

INSERT OR IGNORE INTO vendors (id, name, contact_person, email, phone, address, currency) VALUES
(1, 'Steel Suppliers Ltd', 'Robert Brown', 'robert@steelsupply.com', '+1-555-0201', '100 Steel Road, City', 'USD'),
(2, 'Concrete Mix Co', 'Sarah Wilson', 'sarah@concrete.com', '+1-555-0202', '200 Cement Street, City', 'USD'),
(3, 'Electrical Works Inc', 'David Lee', 'david@electrical.com', '+1-555-0203', '300 Power Lane, City', 'USD'),
(4, 'Plumbing Solutions', 'Emily Davis', 'emily@plumbing.com', '+1-555-0204', '400 Pipe Avenue, City', 'USD');

INSERT OR IGNORE INTO invoices (id, invoice_number, invoice_date, due_date, customer_id, project_id, type, subtotal, tax_amount, total_amount, currency, status, description, created_by) VALUES
(1, 'INV-2024-001', '2024-01-20', '2024-02-20', 1, 1, 'receivable', 500000.00, 50000.00, 550000.00, 'USD', 'Paid', 'Progress payment for Downtown Office Complex', 2),
(2, 'INV-2024-002', '2024-02-15', '2024-03-15', 1, 1, 'receivable', 750000.00, 75000.00, 825000.00, 'USD', 'Paid', 'Second progress payment', 2),
(3, 'INV-2024-003', '2024-03-20', '2024-04-20', 1, 1, 'receivable', 600000.00, 60000.00, 660000.00, 'USD', 'Pending', 'Third progress payment', 2),
(4, 'INV-2024-004', '2024-02-01', '2024-03-01', 2, 2, 'receivable', 400000.00, 40000.00, 440000.00, 'USD', 'Paid', 'Initial payment for Residential Block', 2),
(5, 'INV-2024-005', '2024-03-15', '2024-04-15', 2, 2, 'receivable', 500000.00, 50000.00, 550000.00, 'USD', 'Overdue', 'Second payment - overdue', 2);

INSERT OR IGNORE INTO invoices (id, invoice_number, invoice_date, due_date, vendor_id, project_id, type, subtotal, tax_amount, total_amount, currency, status, description, created_by) VALUES
(6, 'VINV-2024-001', '2024-01-25', '2024-02-25', 1, 1, 'payable', 200000.00, 20000.00, 220000.00, 'USD', 'Paid', 'Steel materials for Office Complex', 2),
(7, 'VINV-2024-002', '2024-02-10', '2024-03-10', 2, 1, 'payable', 150000.00, 15000.00, 165000.00, 'USD', 'Paid', 'Concrete delivery', 2),
(8, 'VINV-2024-003', '2024-03-05', '2024-04-05', 3, 1, 'payable', 80000.00, 8000.00, 88000.00, 'USD', 'Pending', 'Electrical work', 2),
(9, 'VINV-2024-004', '2024-02-20', '2024-03-20', 4, 2, 'payable', 120000.00, 12000.00, 132000.00, 'USD', 'Paid', 'Plumbing installation', 2);

INSERT OR IGNORE INTO payments (id, payment_number, payment_date, invoice_id, amount, currency, exchange_rate, payment_method, reference_number, created_by) VALUES
(1, 'PAY-2024-001', '2024-02-18', 1, 550000.00, 'USD', 1.0000, 'Bank Transfer', 'TXN-001', 2),
(2, 'PAY-2024-002', '2024-03-12', 2, 825000.00, 'USD', 1.0000, 'Bank Transfer', 'TXN-002', 2),
(3, 'PAY-2024-003', '2024-03-01', 4, 440000.00, 'USD', 1.0000, 'Check', 'CHK-001', 2),
(4, 'PAY-2024-004', '2024-02-22', 6, 220000.00, 'USD', 1.0000, 'Bank Transfer', 'TXN-003', 2),
(5, 'PAY-2024-005', '2024-03-08', 7, 165000.00, 'USD', 1.0000, 'Bank Transfer', 'TXN-004', 2),
(6, 'PAY-2024-006', '2024-03-18', 9, 132000.00, 'USD', 1.0000, 'Bank Transfer', 'TXN-005', 2);

INSERT OR IGNORE INTO exchange_rates (id, from_currency, to_currency, rate, effective_date) VALUES
(1, 'USD', 'EUR', 0.9200, '2024-01-01'),
(2, 'USD', 'GBP', 0.7900, '2024-01-01'),
(3, 'USD', 'INR', 83.0000, '2024-01-01'),
(4, 'EUR', 'USD', 1.0870, '2024-01-01'),
(5, 'GBP', 'USD', 1.2658, '2024-01-01'),
(6, 'INR', 'USD', 0.0120, '2024-01-01');

INSERT OR IGNORE INTO journal_entries (id, entry_number, entry_date, description, status, created_by, approved_by, approved_at) VALUES
(1, 'JE-2024-001', '2024-01-20', 'Initial capital injection', 'Approved', 2, 1, '2024-01-20 10:00:00'),
(2, 'JE-2024-002', '2024-02-01', 'Equipment purchase', 'Approved', 2, 1, '2024-02-01 14:30:00'),
(3, 'JE-2024-003', '2024-03-15', 'Monthly expenses allocation', 'Draft', 2, NULL, NULL);

INSERT OR IGNORE INTO transactions (id, journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES
(1, 1, 1, 1000000.00, 0.00, 'Cash received'),
(2, 1, 7, 0.00, 1000000.00, 'Owner equity'),
(3, 2, 4, 500000.00, 0.00, 'Equipment purchased'),
(4, 2, 1, 0.00, 500000.00, 'Cash paid'),
(5, 3, 11, 50000.00, 0.00, 'Material costs'),
(6, 3, 5, 0.00, 50000.00, 'Accounts payable');

INSERT OR IGNORE INTO risk_logs (id, project_id, risk_score, risk_level, risk_factors, calculated_at) VALUES
(1, 1, 25, 'Medium', '{"budget_variance": "moderate", "progress_mismatch": "low"}', '2024-03-20 09:00:00'),
(2, 2, 65, 'High', '{"budget_variance": "high", "progress_mismatch": "high", "invoice_delays": true}', '2024-03-20 09:00:00'),
(3, 3, 15, 'Low', '{"budget_variance": "low", "progress_mismatch": "low"}', '2024-03-20 09:00:00'),
(4, 4, 45, 'Medium', '{"budget_variance": "moderate", "progress_mismatch": "moderate"}', '2024-03-20 09:00:00');

