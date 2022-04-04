const router = require('express').Router();
// 
const controller = require('../../controllers/consumer/orderController');

// Define routes
router.get('/deliveryTimeSlots', controller.deliveryTimeSlots);
router.get('/list', controller.list);
router.post('/placeOrder', controller.placeOrder);
router.delete('/cancelOrder', controller.cancelOrder);
router.get('/detail/:id', controller.detail);

module.exports = router;