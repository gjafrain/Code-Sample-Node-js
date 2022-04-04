const router = require('express').Router();
// 
const controller = require('../../controllers/driver/orderController');

// Define routes
router.get('/', controller.list);
router.put('/sendDeliveryAlert', controller.sendDeliveryAlert);
router.put('/deliverOrder', controller.deliverOrder);



module.exports = router;