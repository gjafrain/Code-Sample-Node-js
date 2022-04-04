const router = require('express').Router();
// 
const controller = require('../../controllers/admin/storeController');

// Define routes
router.get('/', controller.list);
router.post('/', controller.createStore);
router.put('/', controller.updateStore);
router.put('/updateOrder', controller.updateOrder);
router.get('/getById', controller.getById);
router.post('/createOrder', controller.createOrder);
router.put('/updateOrderStatus', controller.updateOrderStatus);
router.get('/orderByOrderId', controller.storeOrderByOrderId);
router.get('/ordersByStoreId', controller.storeOrdersByStoreId);


module.exports = router;