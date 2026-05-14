const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

// DB connection check
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB Error:', err);
  else console.log('DB Connected ✅', res.rows[0]);
});

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API running ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});