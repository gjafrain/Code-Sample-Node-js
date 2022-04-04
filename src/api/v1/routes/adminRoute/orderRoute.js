const router = require('express').Router();
// 
const controller = require('../../controllers/admin/orderController');

// Define routes
router.get('/byId/:id', controller.orderById);
router.get('/', controller.list);
router.put('/updateStatus', controller.updateStatus);
router.put('/cancle', controller.cancle);
router.put('/', controller.update);
router.delete('/', controller.delete);
// router.post('/sendNotifiction', controller.sendNotifiction);
router.put('/updateOrderInfo', controller.updateOrderInfo);


module.exports = router;