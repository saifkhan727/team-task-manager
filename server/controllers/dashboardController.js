const pool = require('../db');

const getDashboard = async (req, res) => {
  const user_id = req.user.id;

  try {
    // Total tasks assigned to user
    const total = await pool.query(
      `SELECT COUNT(*) FROM tasks t
       INNER JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1`,
      [user_id]
    );

    // Tasks by status
    const byStatus = await pool.query(
      `SELECT status, COUNT(*) FROM tasks t
       INNER JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1
       GROUP BY status`,
      [user_id]
    );

    // Overdue tasks
    const overdue = await pool.query(
      `SELECT COUNT(*) FROM tasks t
       INNER JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1
       AND t.due_date < CURRENT_DATE
       AND t.status != 'done'`,
      [user_id]
    );

    // My projects count
    const projects = await pool.query(
      `SELECT COUNT(*) FROM project_members WHERE user_id = $1`,
      [user_id]
    );

    res.json({
      total_tasks: parseInt(total.rows[0].count),
      overdue_tasks: parseInt(overdue.rows[0].count),
      total_projects: parseInt(projects.rows[0].count),
      tasks_by_status: byStatus.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard };