const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../config/auth');
const loginController = require('../controllers/loginController');
const userController = require('../controllers/userController');

router.post("/login", loginController.loginUser);
router.get('/current', authenticateToken, userController.getCurrentUser);
router.post('/logout', authenticateToken, userController.logoutUser);

// module.exports = router;