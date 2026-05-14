// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const pool = require('./db');

// pool.query('SELECT NOW()', (err, res) => {
//   if (err) console.error('DB Error:', err);
//   else console.log('DB Connected ✅', res.rows[0]);
// });

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Health check
// app.get('/', (req, res) => {
//   res.json({ message: 'Team Task Manager API running ✅' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB Error:', err);
  else console.log('DB Connected ✅', res.rows[0]);
});

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API running ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});