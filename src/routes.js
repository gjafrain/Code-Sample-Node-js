const express = require('express');
const router = express.Router();
// Import ROUTES
const apiRoutes = require('./api/routes');
const { sendNotifiction } = require('./api/v1/controllers/admin/orderController');

// Defind Routes
router.get('/notification', sendNotifiction);
router.use('/api/', apiRoutes);


module.exports = router;