const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAdminSystemStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user management routes require authentication and System Administrator role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats/summary', getAdminSystemStats);

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.patch('/:id/status', toggleUserStatus);

module.exports = router;

