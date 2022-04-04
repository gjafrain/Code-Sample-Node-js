const router = require('express').Router();
// IMPORT ROUTES
const orderRoute = require('./orderRoute');

// Integrate routes
router.use('/order', orderRoute)

module.exports = router;