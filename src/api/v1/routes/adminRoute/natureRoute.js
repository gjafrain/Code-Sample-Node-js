const router = require('express').Router();
// 
const controller = require('../../controllers/admin/natureContoller');

// Define routes
router.get('/list', controller.list);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/', controller.delete);

module.exports = router;