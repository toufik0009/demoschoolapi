// routes/superAdminRoutes.js
const express = require('express');
const router = express.Router();
const { registerSuperAdmin, loginSuperAdmin, verifyOTP } = require('../controllers/superAdminController');
const { protectSuperAdmin } = require('../middleware/superAdminMiddleware');

// Public routes
router.post('/register', registerSuperAdmin);
router.post('/login', loginSuperAdmin);
router.post("/verify", verifyOTP);

// Protected route example
router.get('/profile', protectSuperAdmin, (req, res) => {
    res.status(200).json({ superAdmin: req.superAdmin });
});

module.exports = router;
