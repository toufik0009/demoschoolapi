const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/studentPaymentController');
const extractSchoolId = require("../middleware/extractSchoolId");

router.post('/create', extractSchoolId, paymentController.createPayment);
router.get('/', extractSchoolId, paymentController.getAllPayments);
router.get('/:id', extractSchoolId, paymentController.getPaymentById);


module.exports = router;