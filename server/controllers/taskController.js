const pool = require('../db');

// Create task
const createTask = async (req, res) => {
  const { id: project_id } = req.params;
  const { title, description, due_date, assigned_to } = req.body;
  const created_by = req.user.id;

  try {
    // Check if user is project member
    const member = await pool.query(
      `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [project_id, created_by]
    );
    if (member.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, project_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, due_date, project_id, assigned_to, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks for a project
const getTasks = async (req, res) => {
  const { id: project_id } = req.params;
  const user_id = req.user.id;

  try {
    // Check membership
    const member = await pool.query(
      `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [project_id, user_id]
    );
    if (member.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT t.*,
        u1.name AS assigned_to_name,
        u2.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [project_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update task (status, title, etc)
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, due_date, assigned_to } = req.body;
  const user_id = req.user.id;

  try {
    // Check task exists and user is member of that project
    const task = await pool.query(
      `SELECT t.* FROM tasks t
       INNER JOIN project_members pm ON t.project_id = pm.project_id
       WHERE t.id = $1 AND pm.user_id = $2`,
      [id, user_id]
    );
    if (task.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        due_date = COALESCE($4, due_date),
        assigned_to = COALESCE($5, assigned_to)
       WHERE id = $6 RETURNING *`,
      [title, description, status, due_date, assigned_to, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete task (admin/owner only)
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    const task = await pool.query(
      `SELECT t.* FROM tasks t
       INNER JOIN project_members pm ON t.project_id = pm.project_id
       WHERE t.id = $1 AND pm.user_id = $2`,
      [id, user_id]
    );
    if (task.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only admin or task creator can delete
    if (user_role !== 'admin' && task.rows[0].created_by !== user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };