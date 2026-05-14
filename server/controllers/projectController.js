const pool = require('../db');

// Create project
const createProject = async (req, res) => {
  const { name, description } = req.body;
  const owner_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, owner_id]
    );

    // Auto-add owner as member
    await pool.query(
      `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)`,
      [result.rows[0].id, owner_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all projects for logged in user
const getProjects = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT p.* FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single project
const getProject = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Check if user is member
    const member = await pool.query(
      `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (member.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const project = await pool.query(
      `SELECT * FROM projects WHERE id = $1`, [id]
    );

    // Get members list
    const members = await pool.query(
      `SELECT u.id, u.name, u.email, u.role FROM users u
       INNER JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [id]
    );

    res.json({ ...project.rows[0], members: members.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete project (admin only)
const deleteProject = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Only owner can delete
    const project = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND owner_id = $2`,
      [id, user_id]
    );
    if (project.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add member to project
const addMember = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const user_id = req.user.id;

  try {
    // Only owner can add members
    const project = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND owner_id = $2`,
      [id, user_id]
    );
    if (project.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find user by email
    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1`, [email]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add member
    await pool.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, user.rows[0].id]
    );

    res.json({ message: 'Member added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  addMember
};