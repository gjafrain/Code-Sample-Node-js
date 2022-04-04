const router = require('express').Router();
// 
const { list, searchProduct, getProductsByCategoryId } = require('../../controllers/consumer/productController');

// Define routes
router.get('/list', list);
router.post('/search', searchProduct);
router.get('/getProductsByCategoryId', getProductsByCategoryId);

module.exports = router;