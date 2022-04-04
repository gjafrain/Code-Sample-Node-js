const router = require('express').Router();
// 
const controller = require('../../controllers/consumer/addressController');

// Define routes
router.get('/list', controller.list);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/', controller.delete);
router.post('/setDefault', controller.setDefault);

module.exports = router;