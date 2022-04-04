const router = require('express').Router();
// 
const controller = require('../../controllers/consumer/cartController');

// Define routes
router.get('/', controller.getCart);
router.post('/', controller.create);
router.put('/', controller.update);


module.exports = router;