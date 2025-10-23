// routes/schoolRoutes.js
const express = require('express');
const router = express.Router();
const { createSchool, getAllSchools, getSchoolById, deleteSchool, updateSchool, toggleSchoolStatus } = require('../controllers/schoolController');
const { verifyToken, verifySuperAdmin } = require('../middleware/schoolMiddleware');
const upload = require('../middleware/upload');

// Create School (SuperAdmin Only)
router.post("/create", verifyToken, verifySuperAdmin, upload.single("schoolLogo"), createSchool);

// Get All Schools (SuperAdmin Only)
router.get('/getAllSchool', verifyToken, verifySuperAdmin, getAllSchools);

// Get Specific School by ID (anyone)
router.get('/getSchool/:id', verifyToken, getSchoolById);

// Update School by ID (SuperAdmin Only)
router.put('/updateSchool/:id', verifyToken, verifySuperAdmin, updateSchool);

// Delete School by ID (SuperAdmin Only)
router.delete('/deleteSchool/:id', verifyToken, verifySuperAdmin, deleteSchool);

router.patch("/toggle-status/:id", toggleSchoolStatus);

module.exports = router;
