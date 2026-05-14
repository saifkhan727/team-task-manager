const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);

module.exports = router;