const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate');

router.post('/register', validateBody(['email', 'password', 'fullName']), authController.register);
router.post('/login', validateBody(['email', 'password']), authController.login);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
