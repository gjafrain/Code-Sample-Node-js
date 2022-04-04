const router = require('express').Router();
// 
const controller = require('../../controllers/admin/paymentController');

// Define routes
router.get('/paymentByStoreOrderId', controller.getPaymentByStoreOrderId);
router.put('/updateStoreOrderPayment', controller.updateStoreOrderPayment);

module.exports = router;