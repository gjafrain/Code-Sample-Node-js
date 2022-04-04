const router = require('express').Router();
// 
const controller = require('../../controllers/consumer/natureContoller');

// Define routes
router.get('/list', controller.list);

module.exports = router;