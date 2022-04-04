const router = require('express').Router();
// 
const controller = require('../../controllers/admin/productController');

// Define routes
router.get('/list', controller.list);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/', controller.delete);
router.get('/byNature', controller.byNatureId);
router.post('/updateProductImage', controller.updateProductImage);
router.put('/updateProductVarient', controller.updateProductVarient);
router.get('/byId', controller.byProductId);

module.exports = router;