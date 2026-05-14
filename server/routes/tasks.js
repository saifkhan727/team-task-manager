const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/projects/:id/tasks', getTasks);
router.post('/projects/:id/tasks', createTask);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;