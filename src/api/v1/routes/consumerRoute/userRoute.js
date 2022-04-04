const router = require('express').Router();
// 
const controller = require('../../controllers/consumer/userController');

router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/', controller.delete);

module.exports = router;