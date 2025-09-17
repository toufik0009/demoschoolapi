const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/studentPaymentController');

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.get('/student/:studentId', paymentController.getPaymentsByStudent);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);


module.exports = router;