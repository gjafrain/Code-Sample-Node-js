const express = require('express');
const router = express.Router();
// IMPORT ROUTES
const v1Routes = require('./v1/routes');

// Defind routes
router.use('/v1/', v1Routes);

module.exports = router;