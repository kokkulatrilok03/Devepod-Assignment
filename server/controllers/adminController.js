
const bcrypt = require('bcryptjs');
const { dbGet, dbAll, dbRun } = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const users = await dbAll(`
      SELECT id, username, email, role, full_name, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbGet(
      'SELECT id, username, email, role, full_name, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, full_name, password } = req.body;

    const existingUser = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username || email) {
      const duplicate = await dbGet(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', id]
      );
      if (duplicate) {
        return res.status(400).json({ error: 'Username or email already taken' });
      }
    }

    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (full_name !== undefined) {
      updates.push('full_name = ?');
      params.push(full_name);
    }
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      params.push(password_hash);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await dbRun(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const user = await dbGet('SELECT id, username, email, role, full_name, created_at, updated_at FROM users WHERE id = ?', [id]);
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await dbRun('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0, entity_type, user_id } = req.query;

    let query = `
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (entity_type) {
      query += ' AND al.entity_type = ?';
      params.push(entity_type);
    }
    if (user_id) {
      query += ' AND al.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = await dbAll(query, params);
    const total = await dbGet('SELECT COUNT(*) as count FROM audit_logs');

    res.json({
      logs,
      total: total?.count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await dbAll(`
      SELECT p.*, u.username as project_manager_name
      FROM projects p
      LEFT JOIN users u ON p.project_manager_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, budget, start_date, end_date, project_manager_id, status } = req.body;

    if (!name || !budget) {
      return res.status(400).json({ error: 'Project name and budget are required' });
    }

    const result = await dbRun(
      'INSERT INTO projects (name, description, budget, start_date, end_date, project_manager_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, budget, start_date || null, end_date || null, project_manager_id || null, status || 'Active']
    );

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, budget, spent, progress, start_date, end_date, project_manager_id, status } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (budget) {
      updates.push('budget = ?');
      params.push(budget);
    }
    if (spent !== undefined) {
      updates.push('spent = ?');
      params.push(spent);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      params.push(progress);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      params.push(end_date);
    }
    if (project_manager_id !== undefined) {
      updates.push('project_manager_id = ?');
      params.push(project_manager_id);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await dbRun(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  getProjects,
  createProject,
  updateProject
};

