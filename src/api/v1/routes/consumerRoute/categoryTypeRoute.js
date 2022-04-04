const router = require('express').Router();
// Controller
const controller = require('../../controllers/consumer/categoryTypeController');
// Form Validation 
const { validateBody, schemas } = require('../../helper/formValidations');

// Define routes
router.get('/list', controller.list);

module.exports = router;