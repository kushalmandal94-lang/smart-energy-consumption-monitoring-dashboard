const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidationRules,
  loginValidationRules,
} = require('../middleware/validator');

router.post('/register', registerValidationRules, register);
router.post('/login', loginValidationRules, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

