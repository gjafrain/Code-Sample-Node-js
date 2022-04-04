const router = require('express').Router();
// 
const { create } = require('../../controllers/consumer/supportController');

// Define routes
router.post('/', create);

module.exports = router;